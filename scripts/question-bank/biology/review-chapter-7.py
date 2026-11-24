#!/usr/bin/env python3
"""Reproducible chapter-7 technical evidence, NOT independent content certification."""
import hashlib
import json
import re
import subprocess
import unicodedata
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASE = '800e740'
DOC = ROOT / 'docs/question-bank/ssc-biology'
BANK = ROOT / 'content/question-bank/ssc/biology/chapter-7'
sha = lambda b: hashlib.sha256(b).hexdigest()

def read(p):
    return json.loads(p.read_text())

files = subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', BASE], cwd=ROOT, text=True).splitlines()
preserved = {}
for name in files:
    if re.match(r'content/question-bank/ssc/biology/chapter-[1-6]/', name) or re.fullmatch(r'docs/question-bank/ssc-biology/chapter-[1-6]\.html', name):
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
assert [(c['type'], c['first'], c['second']) for c in candidates] == [('SQ', 44, 45)]
candidates[0]['authorDisposition'] = 'Retained: total minute ventilation versus dead-space-corrected alveolar ventilation. Same baseline illustrates different quantities (7.2 vs 4.8 L/min), not a renamed identical task. Independent semantic review remains open.'
import argparse
parser = argparse.ArgumentParser()
parser.add_argument('--test-log', type=Path)
args = parser.parse_args()
validation = dict(expectedTests=64, result='PENDING_FINAL_RUN', fullAppBuildClaimed=False)
if args.test_log:
    log = args.test_log.read_bytes()
    for marker in [b'# tests 64\n', b'# pass 64\n', b'# fail 0\n']:
        assert marker in log, marker
    validation.update(executedTests=64, passed=64, failed=0, result='PASS', testLogSha256=sha(log), command='NODE_PATH="$PWD/.cache/biology-test-tools/node_modules" node --test tests/ssc-biology*.test.cjs')

report = dict(
    date='2026-11-20', chapter=7, topic='গ্যাসীয় বিনিময়', baseline=BASE,
    counts=counts, total=320, globalDraftItems=2240, remainingTargetItems=2240,
    status='ANSWERED_DRAFT_COUNT_COMPLETE_REVIEW_REQUIRED',
    sourceRows={'chapter-7-mcq.txt':100,'chapter-7-mcq-b.txt':100,'chapter-7-cq.txt':25,'chapter-7-cq-b.txt':25,'chapter-7-sq.txt':70},
    optionKeyCounts=dict(Counter(q['correct'] for q in items['MCQ'])),
    preservedEarlierFileHashes=preserved, preservedEarlierFileCount=len(preserved),
    diagrams=dict(files=sorted(p.name for p in (BANK/'assets').glob('*.svg')),count=3,attachedTo='Three CQ stimuli with Bengali written equivalents; English SVG labels',inspection='Rasterized with Resvg and visually inspected. Frontal lung diagram explicitly labels patient right/viewer left; not to scale. Alveolar barrier thickness exaggerated; arrows represent gas diffusion, not blood mixing into air. Inspiration map is causal, not a measured pressure tracing.'),
    lexicalScreen=dict(method='Same-type stem word-bigram Jaccard >=0.40; NFKC/lowercase; punctuation removed except Bengali range; all 320 chapter-7 stems',candidates=candidates,candidatePairs=len(candidates),exactUniqueStems=len({q['text'] for qs in items.values() for q in qs}),semanticCertification=False),
    technicalValidation=validation,
    incrementalBackup=dict(fileId='1dSX7JWFNb5QL5bqbRdMXUQKHYAi1v4Kb',name='ssc-biology-chapter-7-authoring-checkpoint-v1.zip',bytes=21020,md5='6555429581f50eb9458346ae12b3f355',independentRemoteGetVerified=True,folder='1VzEQ1ZfNNLE2ZYzEXdpS0azgiA4E8_Y5',scope='First 200 MCQ authoring rows only; does not contain CQ/SQ, later figures or final validation. Final full backup is separate.'),
    contentSafeguards=[
        'Plant respiration continues in light. Net gas flow is production minus use; compensation does not mean metabolism stops. Photosynthetic O2 comes from water.',
        'No universal all-plants daytime stomatal opening or open-air tree suffocation claim. Root oxygen, waterlogging and adaptations qualified by species/environment.',
        'Soft palate and epiglottis distinguished. Bronchioles not assigned tracheal cartilage rings; nasal filtering not sterilization. Right lung three lobes and left two, with explicit image orientation.',
        'Bulk airflow uses total-pressure difference; molecular gas diffusion uses each gas partial-pressure gradient. Quiet expiration mainly passive, forced expiration can recruit muscles; lungs do not empty fully.',
        'Minute versus alveolar ventilation distinguished and dimensions shown. Dry ambient partial pressure is not alveolar pressure. Gas fractions are approximate, not universal diagnostic constants.',
        'O2 carriage largely hemoglobin; CO2 largely bicarbonate with other forms. CO is a different gas and poisoning hazard; no self-exposure experiments or untrained rescue entry.',
        'Asthma is noncommunicable; triggers vary. Prescribed inhaled anti-inflammatory therapy not conflated with unsafe unmonitored high-dose systemic steroid use. No blanket food/activity bans.',
        'Acute bronchitis often viral; pneumonia is not simply cold exposure. TB infection and active disease differ; BCG not absolute lifelong protection; complete prescribed treatment with clinical support.',
        'Lung cancer risks are not individual certainties, diagnosis is not a CT shadow alone, treatment depends on type/stage/person. No universal radiotherapy prescription.',
        'Limewater tests use prepared data/teacher-controlled safe samples: no mouth aspiration, shared tubes, forced breath-holding, smoke exposure or pressured exercise. Ordinary air contains CO2; excess CO2 can clear initial precipitate.'
    ],
    limitations=[
        'BiologyBD is secondary OCR, not a verified official NCTB edition. All three returned chapter chunks read; official textbook page references/full official chapter and figure coverage not independently verified.',
        'Selected OpenStax and WHO/CDC pages provide conceptual background, not official question attribution or a question-by-question evidence certificate.',
        'OpenStax contains simplifications/errors: gas exchange said only alveoli despite respiratory-bronchiole contribution, all bronchioles stiff, expiration unqualifiedly passive, equal minute ventilation confused with equal alveolar ventilation, per-lung alveolar count inconsistencies, a figure alt reverses oxygenated/deoxygenated air; these were not copied.',
        'Secondary text errors avoided: all organisms require O2, equal plant O2/CO2 exchange universally, overnight tree suffocation, airway/epiglottis confusion, all bronchitis bacterial, pneumonia simply cold, unsafe mouth-to-limewater instructions, general anti-steroid fear and forced liquids in severe distress.',
        'Compensation point, aerenchyma/CAM, alveolar cell types, surfactant, pleural pressure, lung capacities, dead space, partial pressures and selected neural/clinical detail include enrichment. Current official SSC depth and terminology need independent checking.',
        'Lexical screening is not semantic uniqueness certification. Related concepts intentionally recur across types; distractor plausibility, independent objectives and CQ higher-order depth require independent teacher review.',
        'Figures are original selected explanatory schematics, not exhaustive textbook illustration reconstruction or production integration. Annotation language is English with Bengali written equivalents.',
        'No independent teacher/content review, official textbook certification, full app build, import, approval, publication or deployment claimed.'
    ],
    textbookChapterRead=False,independentContentReview=False,nearDuplicateReviewComplete=False,teacherCertified=False,websiteImported=False,approved=False,published=False)
(DOC/'chapter-7-completion-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(f'Chapter 7: {counts}; {len(preserved)} earlier files identical; {len(candidates)} lexical candidate; technical {validation["result"]}')
