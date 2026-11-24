#!/usr/bin/env python3
"""Reproducible chapter-6 technical evidence, NOT independent content certification."""
import hashlib
import json
import re
import subprocess
import unicodedata
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASE = 'd0f94e1'
DOC = ROOT / 'docs/question-bank/ssc-biology'
BANK = ROOT / 'content/question-bank/ssc/biology/chapter-6'
sha = lambda b: hashlib.sha256(b).hexdigest()

def read(p):
    return json.loads(p.read_text())

files = subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', BASE], cwd=ROOT, text=True).splitlines()
preserved = {}
for name in files:
    if re.match(r'content/question-bank/ssc/biology/chapter-[1-5]/', name) or re.fullmatch(r'docs/question-bank/ssc-biology/chapter-[1-5]\.html', name):
        baseline = subprocess.check_output(['git', 'show', f'{BASE}:{name}'], cwd=ROOT)
        assert baseline == (ROOT / name).read_bytes(), name
        preserved[name] = sha(baseline)

items = {k.upper(): read(BANK / f'rebuild-{k}.json')['items'] for k in ['mcq', 'cq', 'sq']}
counts = {k: len(v) for k, v in items.items()}
assert counts == {'MCQ': 200, 'CQ': 50, 'SQ': 70}
assert Counter(q['correct'] for q in items['MCQ']) == dict.fromkeys('ABCD', 50)
candidates = []
for kind, qs in items.items():
    grams = []
    for q in qs:
        words = re.sub(r'[^\w\s\u0980-\u09ff]', ' ', unicodedata.normalize('NFKC', q['text']).lower()).split()
        grams.append(set(zip(words, words[1:])))
    for i, a in enumerate(grams):
        for j, b in enumerate(grams[:i]):
            score = len(a & b) / len(a | b) if a | b else 0
            if score >= .4:
                candidates.append(dict(type=kind, first=j+1, second=i+1, jaccard=round(score, 6), firstStem=qs[j]['text'], secondStem=qs[i]['text']))
assert [(c['type'], c['first'], c['second']) for c in candidates] == [('MCQ', 56, 57)]
candidates[0]['authorDisposition'] = 'Retained: complementary definitions of artery (away from heart) and vein (toward heart), not the same requested answer. Shared syntax; not an independent semantic review.'

test_log = (ROOT / '.cache/biology-ch6-tests.tap').read_text()
assert re.search(r'^# tests 56$', test_log, re.M) and re.search(r'^# pass 56$', test_log, re.M) and re.search(r'^# fail 0$', test_log, re.M)

report = dict(
    date='2026-11-20', chapter=6, topic='জীবে পরিবহণ', baseline=BASE,
    counts=counts, total=320, globalDraftItems=1920, remainingTargetItems=2560,
    status='ANSWERED_DRAFT_COUNT_COMPLETE_REVIEW_REQUIRED',
    sourceRows={'chapter-6-mcq.txt': 100, 'chapter-6-mcq-b.txt': 100, 'chapter-6-cq.txt': 25, 'chapter-6-cq-b.txt': 25, 'chapter-6-sq.txt': 70},
    optionKeyCounts=dict(Counter(q['correct'] for q in items['MCQ'])),
    preservedEarlierFileHashes=preserved, preservedEarlierFileCount=len(preserved),
    diagrams=dict(files=sorted(p.name for p in (BANK / 'assets').glob('*.svg')), count=3,
                  attachedTo='CQ stimuli with Bengali written equivalents',
                  inspection='Rasterized with Resvg and visually inspected; route map explicitly not anatomical positioning; English labels plus Bengali equivalents; not independent illustration certification.'),
    lexicalScreen=dict(method='Same-type stem word-bigram Jaccard >= 0.40; NFKC, lowercase, punctuation removed except Bengali range; all 320 chapter-6 stems; no inherited chapter-6 questions.', candidates=candidates, candidatePairs=len(candidates), exactUniqueStems=len({q['text'] for qs in items.values() for q in qs}), semanticCertification=False),
    technicalValidation=dict(executedTests=56, passed=56, failed=0, testLogSha256=sha((ROOT / '.cache/biology-ch6-tests.tap').read_bytes()), command='NODE_PATH="$PWD/.cache/biology-test-tools/node_modules" node --test tests/ssc-biology*.test.cjs',
                             result='PASS: 56/56 focused tests; raw TAP archived with final backup', builders=['build-ssc-biology-ch1.py --check', 'build-ssc-biology-drafts.py --check'], fullAppBuildClaimed=False),
    incrementalBackup=dict(fileId='1GtbTkFp4wFfDcCuqJoSoUlxco7rXPjPx', name='ssc-biology-chapter-6-authoring-checkpoint-v2.zip', bytes=194965, md5='ab818961cab1bc2e750f26f48b19251c', independentRemoteGetVerified=True, folder='1VzEQ1ZfNNLE2ZYzEXdpS0azgiA4E8_Y5', scope='All 320 authored drafts, build sources and figures at checkpoint; not the final validated snapshot.'),
    contentSafeguards=[
        'Osmosis concerns water across a selectively permeable barrier; ion uptake is not osmosis. Water potential and pressure qualify concentration-only rules.',
        'Xylem cohesion-tension differs from root pressure. Phloem source-to-sink flow may run opposite ways in separate tubes, not two net bulk-flow directions at one location in one tube.',
        'Potometer measures water uptake, not direct transpiration; guttation is liquid, transpiration vapor; tests use supplied data, no human blood handling.',
        'ABO compatibility is an educational packed-RBC model, not whole-blood clinical clearance. Rh-negative does not imply anti-D from birth; typing, crossmatching and infection screening remain necessary.',
        'Artery/vein names use flow direction, not oxygen level. Coronary perfusion supplies myocardium. Lymph returns interstitial fluid.',
        '120/80 is illustrative, not a diagnosis; WHO adult repeated-day >=140 and/or >=90 threshold not automatically a pediatric criterion; cuff, posture, rest and clinical assessment matter.',
        'LDL/HDL are lipoprotein particles, triglyceride is not cholesterol, cholesterol belongs to membranes not cell walls; rheumatic fever is post-infectious immune disease.',
        'MI, cardiac arrest and stroke differ; suspected acute symptoms require urgent professional care, not classroom diagnosis or self-medication.'
    ],
    limitations=[
        'Secondary BiologyBD OCR is not a certified NCTB edition; official textbook full chapter/page references have not been independently verified.',
        'Fetched reference sections provide conceptual background, not question-by-question official exercise attribution; ledger source lists do not mean every linked page supports every clause.',
        'Secondary OCR errors were not copied: mineral uptake as osmosis, all WBC lifespans equal, oxyhemoglobin as the sole CO2 carrier, diastolic 40, cholesterol as cell-wall material, triglyceride as cholesterol, stroke only hemorrhage.',
        'Fetched OpenStax sections also contain errors: camel RBC nucleation, oxygen binding as iron oxidation, oversimplified venous fluid-reabsorption percentages, fibrinogen placed in serum, platelet plug conflated with fibrin clot and unsafe universal whole-blood wording. These were avoided.',
        'Potometry, water potential, phloem pressure-flow, sensitization, cardiac output and selected clinical boundaries include enrichment; current official SSC syllabus depth remains to be independently checked.',
        'Lexical screening cannot certify semantic uniqueness or independent objectives; related concepts recur across question types. Distractor plausibility and four-part CQ cognitive depth need independent teacher review.',
        'Figures are selected original explanatory schematics, not an exhaustive official textbook figure inventory, not anatomical drawings and not production image integration.',
        'No independent teacher/content review, official textbook certification, full app build, database import, approval, publication or deployment is claimed.'
    ],
    textbookChapterRead=False, independentContentReview=False, nearDuplicateReviewComplete=False,
    teacherCertified=False, websiteImported=False, approved=False, published=False)
(DOC / 'chapter-6-completion-review.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
print(f'Chapter 6: {counts}; {len(preserved)} earlier files byte-identical; {len(candidates)} lexical candidate; review gates remain false')
