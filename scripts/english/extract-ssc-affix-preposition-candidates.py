#!/usr/bin/env python3
"""Stage SSC Items 6/7 without authoring answers, registering drafts or writing a DB.
Usage: python extract-ssc-affix-preposition-candidates.py /path/to/source-pdfs
Requires pymupdf; original PDFs stay outside Git.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path
import pymupdf

ROOT = Path(__file__).resolve().parents[2]
DEST = ROOT / 'docs/english/work-in-progress'
SOURCES = json.loads((ROOT / 'lib/english/data/ssc-paper2-gap-clues-review.json').read_text())['sources']
FONT_DIGITS = str.maketrans({chr(0xf030+i): str(i) for i in range(10)})
MARKS = re.compile(r'(?<![\d.])(0?\.\d+|\d+)\s*[×\uf0b4]\s*(\d+)\s*=\s*(\d+)')


def sha(text):
    return hashlib.sha256(text.encode()).hexdigest()


def normalize(text):
    text = text.translate(FONT_DIGITS)
    text = re.sub(r'<<PAGE \d+>>', '', text)
    text = re.sub(r'(?m)^\s*(?:English Second Paper\s*:\s*Questions\s*\d+|\d+\s+SSC English Test Papers|\d+)\s*$', '', text)
    text = text.replace('\uf0be', '____').replace('\uf02d', '—')
    text = re.sub(r'(?:—\s*){2,}', '____', text)
    return ' '.join(re.sub(r'_+', '____', text).split())


def classify(instruction):
    if re.search(r'(?i)(?:suffix|prefix)', instruction):
        return 'affixes'
    if re.search(r'(?i)prepositions?', instruction):
        return 'prepositions'
    return None


def shingle(entry):
    words = re.findall(r'[a-z]+', entry['sourcePassage'].lower())
    return set(zip(words, words[1:], words[2:]))


def build_queue(entries):
    """No forced quota: missing/held slots stay visible rather than fabricated."""
    complete, adaptation, held, accepted = [], [], [], []
    # Prefer unchanged five-gap, single-skill sources before any adaptation.
    for entry in sorted(entries, key=lambda e: (bool(e['issues']), e['candidateId'])):
        if 'duplicateOf' in entry:
            continue
        if any(flag in entry['issues'] for flag in ['MALFORMED_GAP_LABELS', 'PRINTED_MARKS_REQUIRE_MANUAL_REVIEW', 'PASSAGE_BOUNDARY_REQUIRES_MANUAL_REVIEW', 'PRINTED_COUNT_DIFFERS_FROM_LABEL_COUNT']):
            held.append({'candidateId': entry['candidateId'], 'reason': 'MANUAL_SOURCE_REVIEW_REQUIRED'})
            continue
        grams = shingle(entry)
        closest = max([(len(grams & shingle(q)) / max(1, len(grams | shingle(q))), q['candidateId']) for q in accepted], default=(0, ''))
        if closest[0] >= 0.40:
            held.append({'candidateId': entry['candidateId'], 'reason': 'POSSIBLE_NEAR_REPRINT', 'similarTo': closest[1], 'trigramJaccard': round(closest[0], 4)})
            continue
        accepted.append(entry)
        (adaptation if entry['issues'] else complete).append(entry['candidateId'])
    all_ids = (complete + adaptation)[:51]
    return {
        'status': 'PROVISIONAL_NOT_CONTENT_APPROVED', 'targetDistinctSets': 51,
        'selectedCandidateIds': all_ids,
        'sourceFormatMatchCandidateIds': [id for id in all_ids if id in complete],
        'adaptationRequiredCandidateIds': [id for id in all_ids if id in adaptation],
        'unfilledTargetSlots': max(0, 51-len(all_ids)),
        'additionalSourceFormatMatchSlotsNeeded': max(0, 51-len(complete)),
        'holds': held,
        'notes': [
            'Candidate slots only: NOT prepared sets; answers are NOT_AUTHORED.',
            'Original ten-/fourteen-gap sources are preserved intact. A ten-/fourteen-to-five adaptation needs explicit editorial review, original text, an adapted passage and a before/after ledger; no silent truncation or double counting.',
            'Mixed preposition/article sources are NOT standalone preposition exercises. No individual gap is classified from its position or assumed answer. Article and zero-article gaps must be resolved during authoring.',
            'A format match does not certify grammatical validity, semantic uniqueness or safe factual claims.',
            'Empty slots require more distinct sources or explicitly reviewed adaptations, never generated attribution.',
        ],
    }


def extract(pdf_dir):
    output = {'affixes': [], 'prepositions': []}
    coverage = []
    for source in SOURCES:
        pdf = pdf_dir / source['filename']
        if hashlib.sha256(pdf.read_bytes()).hexdigest() != source['sha256']:
            raise ValueError(f'Changed source PDF: {pdf.name}')
        with pymupdf.open(pdf) as doc:
            text = ''.join(f'\n<<PAGE {i+1}>>\n{p.get_text()}' for i, p in enumerate(doc))
        pages = [(m.start(), int(m[1])) for m in re.finditer(r'<<PAGE (\d+)>>', text)]
        board = '2018_2024' in pdf.name
        pattern = r'(?m)^([A-Z]+) BOARD[^\n]*?(20\d\d)[^\n]*$' if board else r'(?m)^([^\n]+)\n\s*((?:Pre-)?Test)-? Examination[^\n]*?(20\d\d)[^\n]*$'
        headers = list(re.finditer(pattern, text))
        expected = 45 if board else 41 if '2025_' in pdf.name else 16
        if len(headers) != expected:
            raise ValueError((pdf.name, 'Unexpected header count', len(headers), expected))
        for hi, header in enumerate(headers):
            base = {'sourceFile': source['fileId'], 'sourceSha256': source['sha256']}
            if board:
                base.update(sourceKind='board', board=header[1].title(), examYear=int(header[2]))
            else:
                base.update(sourceKind='school', school=' '.join(header[1].split()), examType=header[2], examYear=int(header[3]))
            start = header.end()
            section = text[start:headers[hi+1].start() if hi+1 < len(headers) else len(text)]
            questions = list(re.finditer(r'(?m)^[ \t]*([1-9]|1[0-2])\.(?!\d)[ \t]*(?:\n[ \t]*)?', section))
            found = []
            for qi, q in enumerate(questions):
                raw = section[q.end():questions[qi+1].start() if qi+1 < len(questions) else len(section)].strip()
                mark = MARKS.search(raw.translate(FONT_DIGITS))
                # Classify only the printed directions, not words inside the passage.
                heading = normalize(raw[:mark.start()]) if mark else normalize(raw.split('(a)')[0])
                kind = classify(heading)
                if not kind:
                    continue
                found.append(kind)
                passage = normalize(raw[mark.end():]) if mark else ''
                labels = re.findall(r'\(([a-z])\)', passage)
                issues = []
                if not mark:
                    issues += ['PRINTED_MARKS_REQUIRE_MANUAL_REVIEW', 'PASSAGE_BOUNDARY_REQUIRES_MANUAL_REVIEW', 'PRINTED_COUNT_DIFFERS_FROM_LABEL_COUNT']
                if not labels or labels != list('abcdefghijklmnopqrstuvwxyz'[:len(labels)]) or len(labels) not in ([5, 10, 14] if kind == 'affixes' else [5, 10]):
                    issues.append('MALFORMED_GAP_LABELS')
                if mark and int(mark[2]) != len(labels):
                    issues.append('PRINTED_COUNT_DIFFERS_FROM_LABEL_COUNT')
                if len(labels) != 5:
                    issues.append('SOURCE_COUNT_DIFFERS_FROM_CURRENT_BLUEPRINT')
                mixed = kind == 'prepositions' and bool(re.search(r'(?i)articles?', heading))
                if mixed:
                    issues.append('MIXED_PREPOSITIONS_AND_ARTICLES_NOT_STANDALONE')
                entry = {
                    'candidateId': f'ssc-p2-{kind}-source-{len(output[kind])+1:03}', **base,
                    'pdfPage': next(num for pos, num in reversed(pages) if pos <= start+q.start()),
                    'questionNumber': int(q[1]), 'originalMarks': int(mark[3]) if mark else None,
                    'printedMarkExpression': normalize(mark[0]) if mark else None,
                    'originalGapCount': len(labels), 'gapLabels': labels,
                    'declaredGapCount': int(mark[2]) if mark else None,
                    'gapCountBasis': 'Observed printed labels; unlabelled gaps are not inferred.',
                    'sourceSkill': 'mixed-prepositions-articles' if mixed else kind,
                    'sourceInstruction': heading, 'sourcePassage': passage,
                    'sourceRawText': raw, 'rawTextSha256': sha(raw),
                    'sourceContentSha256': sha(json.dumps({'instruction': heading, 'passage': passage}, ensure_ascii=False, separators=(',', ':'))),
                    'normalizedQuestionSha256': sha(re.sub(r'[^a-z0-9]', '', passage.lower())),
                    'issues': issues, 'answerStatus': 'NOT_AUTHORED', 'reviewStatus': 'EXTRACTED_UNREVIEWED_NOT_IMPORTABLE',
                }
                output[kind].append(entry)
            coverage.append({**base, 'foundSkills': found})
    for kind, entries in output.items():
        seen = {}
        for entry in entries:
            digest = entry['normalizedQuestionSha256']
            if digest in seen:
                entry['duplicateOf'] = seen[digest]
                entry['issues'].append('EXACT_REPRINT')
            else:
                seen[digest] = entry['candidateId']
        data = {
            'version': 1, 'item': kind, 'status': 'EXTRACTED_UNREVIEWED_NOT_IMPORTABLE',
            'targetDistinctSets': 51, 'currentBlueprintGapCount': 5, 'currentBlueprintMarks': 5,
            'answerStatus': 'NOT_AUTHORED', 'sources': SOURCES, 'paperCoverage': coverage,
            'candidates': entries, 'authoringQueue': build_queue(entries),
        }
        DEST.mkdir(parents=True, exist_ok=True)
        (DEST / f'ssc-paper2-{kind}-candidates.json').write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n')
        print(kind, len(entries), 'source exercises;', len(seen), 'exact-distinct;', len(data['authoringQueue']['selectedCandidateIds']), 'provisional slots;', data['authoringQueue']['unfilledTargetSlots'], 'unfilled slots')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('pdf_dir', type=Path)
    extract(parser.parse_args().pdf_dir)
