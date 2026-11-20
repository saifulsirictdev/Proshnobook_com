#!/usr/bin/env python3
"""Stage original Item 4/5 source exercises for authoring, NEVER register/import them.
Usage: python extract-ssc-sentence-candidates.py /path/to/three/pdfs
Requires pymupdf. PDF binaries are deliberately external to Git.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path
import pymupdf

ROOT = Path(__file__).resolve().parents[2]
SOURCES = json.loads((ROOT / 'lib/english/data/ssc-paper2-gap-clues-review.json').read_text())['sources']
DEST = ROOT / 'docs/english/work-in-progress'


def sha(value):
    return hashlib.sha256(value.encode()).hexdigest()


def normalize(text):
    # Layout only: page markers/furniture, whitespace, embedded font glyphs.
    text = re.sub(r'<<PAGE \d+>>', '', text)
    text = re.sub(r'(?m)^\s*(?:English Second Paper\s*:\s*Questions\s*\d+|\d+\s+SSC English Test Papers|\d+)\s*$', '', text)
    text = text.replace('\uf0be', '____').replace('\uf02d', '—')
    text = re.sub(r'(?:—\s*){2,}', '____', text)
    text = re.sub(r'_+', '____', text)
    return ' '.join(text.split())


def shortlist(entries):
    """Provisional work queue only; overlap screening does not approve content."""
    def shingles(entry):
        words = re.findall(r'[a-z]+', ' '.join(s['text'] for s in entry['sourceSubitems']).lower())
        return set(zip(words, words[1:], words[2:]))

    selected, held = [], []
    for entry in entries:
        if entry['issues']:
            continue
        grams = shingles(entry)
        closest = max([(len(grams & shingles(q)) / max(1, len(grams | shingles(q))), q['candidateId']) for q in selected], default=(0, ''))
        if closest[0] >= 0.40:
            held.append({'candidateId': entry['candidateId'], 'reason': 'POSSIBLE_NEAR_REPRINT', 'similarTo': closest[1], 'trigramJaccard': round(closest[0], 4)})
            continue
        # Include both school PDFs rather than stopping after the first 21 schools.
        bucket = lambda e: (e['sourceKind'], e['examYear'] if e['sourceKind'] == 'school' else 0)
        quota = 30 if entry['sourceKind'] == 'board' else 15 if entry['examYear'] == 2025 else 6
        if sum(bucket(q) == bucket(entry) for q in selected) < quota:
            selected.append(entry)
    assert len(selected) == 51, ('Insufficient source exercises; do not pad the queue', len(selected))
    return {
        'status': 'PROVISIONAL_NOT_CONTENT_APPROVED',
        'selectedCandidateIds': [e['candidateId'] for e in selected],
        'nearReprintHolds': held,
        'notes': [
            '51 source exercises provisionally selected for authoring; these are NOT prepared sets and have no approved answers.',
            '30 board + 15 school Test 2025 + 6 school Test/Pre-Test 2024 source exercises.',
            'Exact and high-overlap reprints held; manual semantic, instruction and grammar review is still required.',
            'Short 2022 transformation sets and seven-statement 2023 tag sets remain intact in the audit, not padded/truncated into current-format sets.',
        ],
    }


def extract(pdf_dir):
    output = {'transformation': [], 'tags': []}
    for source in SOURCES:
        pdf = pdf_dir / source['filename']
        assert hashlib.sha256(pdf.read_bytes()).hexdigest() == source['sha256'], f'Changed source PDF: {pdf.name}'
        with pymupdf.open(pdf) as doc:
            pages = [p.get_text() for p in doc]
        text = ''.join(f'\n<<PAGE {i+1}>>\n{p}' for i, p in enumerate(pages))
        page_markers = [(m.start(), int(m[1])) for m in re.finditer(r'<<PAGE (\d+)>>', text)]
        if '2018_2024' in pdf.name:
            headers = list(re.finditer(r'(?m)^([A-Z]+) BOARD[^\n]*?(20\d\d)[^\n]*$', text))
        else:
            headers = list(re.finditer(r'(?m)^([^\n]+)\n\s*((?:Pre-)?Test)-? Examination[^\n]*?(20\d\d)[^\n]*$', text))
        expected = 45 if '2018_2024' in pdf.name else 41 if '2025_' in pdf.name else 16
        assert len(headers) == expected, (pdf.name, len(headers), expected)
        for hindex, header in enumerate(headers):
            base = {'sourceFile': source['fileId'], 'sourceSha256': source['sha256']}
            if '2018_2024' in pdf.name:
                base.update(sourceKind='board', board=header[1].title(), examYear=int(header[2]))
            else:
                name = ' '.join(header[1].split())
                # All-caps 2024 school names are faithfully retained, not guessed.
                base.update(sourceKind='school', school=name, examType=header[2], examYear=int(header[3]))
            section_start = header.end()
            section_end = headers[hindex+1].start() if hindex+1 < len(headers) else len(text)
            section = text[section_start:section_end]
            questions = list(re.finditer(r'(?m)^\s*(\d+)\.\s*', section))
            for qi, question in enumerate(questions):
                raw = section[question.end():questions[qi+1].start() if qi+1 < len(questions) else len(section)]
                # Identify from the actual printed instruction, NOT an assumed question number.
                heading = normalize(raw[:raw.find('(a)')]) if '(a)' in raw else normalize(raw[:250])
                kind = 'tags' if re.search(r'(?i)(?:tag questions?|question tags?)', heading) else 'transformation' if re.search(r'(?i)(?:(?:change|transform|rewrite).*(?:sentences|sentence)|complete the sentences? according to directions)', heading) else None
                if not kind:
                    continue
                labels = list(re.finditer(r'\(([a-j])\)', raw))
                entries = [{'label': label[1], 'text': normalize(raw[label.end():labels[i+1].start() if i+1 < len(labels) else len(raw)])} for i, label in enumerate(labels)]
                normalized = [e['text'] for e in entries]
                position = section_start + question.start()
                page = next(num for start, num in reversed(page_markers) if start <= position)
                # Printed marks are copied literally; numeric totals are parsed where unambiguous.
                instruction = normalize(raw[:labels[0].start()]) if labels else normalize(raw)
                mark_match = re.search(r'(\d+)\s*[×\uf0b4]\s*(\d+)\s*=\s*(\d+)', instruction)
                marks = int(mark_match[3]) if mark_match else None
                original_count = len(entries)
                required = 10 if kind == 'transformation' else 5
                issues = []
                if [e['label'] for e in entries] != list('abcdefghij'[:original_count]) or original_count not in ([5, 7] if kind == 'tags' else [5, 10]):
                    issues.append('MALFORMED_SUBITEM_LABELS')
                if original_count != required:
                    issues.append('SOURCE_COUNT_DIFFERS_FROM_CURRENT_BLUEPRINT')
                if marks is None:
                    issues.append('PRINTED_MARKS_REQUIRE_MANUAL_REVIEW')
                if any(not t for t in normalized):
                    issues.append('EMPTY_SOURCE_SUBITEM')
                if kind == 'transformation' and any(not re.search(r'(?:\([^)]*(?:simple|complex|compound|affirmative|negative|interrogative|assertive|exclamatory|imperative|question|optative|passive|active|positive|comparative|superlative)[^)]*\)|(?:Make|Change|Turn|Use|Rewrite|Transform).*)', t, re.I) for t in normalized):
                    issues.append('TRANSFORMATION_DIRECTION_REQUIRES_MANUAL_REVIEW')
                output[kind].append({
                    'candidateId': f'ssc-p2-{kind}-source-{len(output[kind])+1:03}', **base,
                    'pdfPage': page, 'questionNumber': int(question[1]), 'originalMarks': marks,
                    'originalSubitemCount': original_count, 'sourceInstruction': instruction,
                    'sourceSubitems': entries, 'sourceContentSha256': sha(json.dumps({'instruction': instruction, 'subitems': entries}, ensure_ascii=False, separators=(',', ':'))),
                    'sourceRawText': raw.strip(), 'rawTextSha256': sha(raw.strip()),
                    'normalizedQuestionSha256': sha('|'.join(re.sub(r'[^a-z0-9]', '', t.lower()) for t in normalized)),
                    'issues': issues, 'answerStatus': 'NOT_AUTHORED', 'reviewStatus': 'EXTRACTED_UNREVIEWED_NOT_IMPORTABLE',
                })
    # Exact reprints are retained as alternate provenance, not counted as unique exercises.
    for kind, entries in output.items():
        seen = {}
        for entry in entries:
            key = entry['normalizedQuestionSha256']
            if key in seen:
                entry['duplicateOf'] = seen[key]
                entry['issues'].append('EXACT_REPRINT')
            else:
                seen[key] = entry['candidateId']
        data = {'version': 1, 'item': kind, 'status': 'EXTRACTED_UNREVIEWED_NOT_IMPORTABLE',
                'targetDistinctSets': 51, 'currentBlueprintSubitemCount': 10 if kind == 'transformation' else 5,
                'currentBlueprintMarks': 10 if kind == 'transformation' else 5,
                'answerStatus': 'NOT_AUTHORED', 'sources': SOURCES, 'candidates': entries, 'authoringQueue': shortlist(entries)}
        DEST.mkdir(parents=True, exist_ok=True)
        (DEST / f'ssc-paper2-{kind}-candidates.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
        print(kind, len(entries), 'extracted;', len(seen), 'exact-distinct;', sum(not e['issues'] for e in entries), 'structurally complete candidates')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('pdf_dir', type=Path)
    extract(parser.parse_args().pdf_dir)
