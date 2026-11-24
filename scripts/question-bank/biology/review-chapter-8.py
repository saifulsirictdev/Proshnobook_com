#!/usr/bin/env python3
"""Reproducible technical evidence only; no teacher/semantic certification."""
import argparse
import hashlib
import json
import re
import subprocess
import unicodedata
from collections import Counter
from pathlib import Path
ROOT = Path(__file__).resolve().parents[3]
BASE = '5b697bc'
DOC = ROOT / 'docs/question-bank/ssc-biology'
BANK = ROOT / 'content/question-bank/ssc/biology/chapter-8'
sha = lambda b: hashlib.sha256(b).hexdigest()
def read(p): return json.loads(p.read_text())
files = subprocess.check_output(['git','ls-tree','-r','--name-only',BASE],cwd=ROOT,text=True).splitlines()
preserved={}
for name in files:
    if re.match(r'content/question-bank/ssc/biology/chapter-[1-7]/',name) or re.fullmatch(r'docs/question-bank/ssc-biology/chapter-[1-7]\.html',name):
        b=subprocess.check_output(['git','show',f'{BASE}:{name}'],cwd=ROOT)
        assert b==(ROOT/name).read_bytes(),name
        preserved[name]=sha(b)
items={k.upper():read(BANK/f'rebuild-{k}.json')['items'] for k in ['mcq','cq','sq']}
counts={k:len(v) for k,v in items.items()}
assert counts=={'MCQ':200,'CQ':50,'SQ':70}
assert Counter(q['correct'] for q in items['MCQ'])==dict.fromkeys('ABCD',50)
source_rows={}
for p in sorted((ROOT/'scripts/question-bank/biology').glob('chapter-8-*.txt')):
    source_rows[p.name]=len([l for l in p.read_text().splitlines() if l and not l.startswith('#')])
assert sorted(source_rows.values())==[25,25,70,100,100]
candidates=[]
for kind,qs in items.items():
    grams=[]
    for q in qs:
        words=re.sub(r'[^\w\s\u0980-\u09ff]',' ',unicodedata.normalize('NFKC',q['text']).lower()).split()
        grams.append(set(zip(words,words[1:])))
    for i,a in enumerate(grams):
        for j,b in enumerate(grams[:i]):
            score=len(a&b)/len(a|b) if a|b else 0
            if score>=.4:
                candidates.append(dict(type=kind,first=j+1,second=i+1,jaccard=round(score,6),firstStem=qs[j]['text'],secondStem=qs[i]['text']))
assert [(x['type'],x['first'],x['second']) for x in candidates]==[('MCQ',5,104)]
candidates[0]['authorDisposition']='Retained: ADH synthesis in hypothalamus versus urea synthesis in liver. Similar short location-question syntax, different molecules, organs and objectives. Independent semantic review remains open.'
parser=argparse.ArgumentParser();parser.add_argument('--test-log',type=Path);args=parser.parse_args()
validation=dict(expectedTests=72,result='PENDING_FINAL_RUN',fullAppBuildClaimed=False)
if args.test_log:
    log=args.test_log.read_bytes()
    for marker in [b'# tests 72\n',b'# pass 72\n',b'# fail 0\n']: assert marker in log,marker
    validation.update(executedTests=72,passed=72,failed=0,result='PASS',testLogSha256=sha(log),command='NODE_PATH="$PWD/.cache/biology-test-tools/node_modules" node --test tests/ssc-biology*.test.cjs')
report=dict(date='2026-11-20',chapter=8,topic='রেচন প্রক্রিয়া',baseline=BASE,
    counts=counts,total=320,globalDraftItems=2560,remainingTargetItems=1920,
    status='ANSWERED_DRAFT_COUNT_COMPLETE_REVIEW_REQUIRED',sourceRows=source_rows,
    optionKeyCounts=dict(Counter(q['correct'] for q in items['MCQ'])),
    preservedEarlierFileHashes=preserved,preservedEarlierFileCount=len(preserved),
    diagrams=dict(files=sorted(p.name for p in (BANK/'assets').glob('*.svg')),count=3,attachedTo='Three CQ stimuli with Bengali written equivalents; English SVG labels',productionIntegration=False,inspection='All three rasterized with Resvg and visually inspected. Cortex pointer corrected to outer tissue, and dialyzer retention text moved out of the urea arrow. Kidney drainage branches and nephron geometry are simplified; diagram dimensions not anatomical. No clinical assembly or access instructions.'),
    lexicalScreen=dict(method='Same-type stem word-bigram Jaccard >=0.40; NFKC/lowercase; punctuation removed except Bengali range; all 320 chapter-8 stems',candidates=candidates,candidatePairs=len(candidates),exactUniqueStems=len({q['text'] for qs in items.values() for q in qs}),semanticCertification=False),
    technicalValidation=validation,
    incrementalBackup=dict(fileId='1pW83JR_kLScTNUMjG--zf5nL9oYcP_Or',name='ssc-biology-chapter-8-authoring-checkpoint-v1.zip',bytes=19898,md5='b5776339ef18593c682924d536a2c7fd',independentRemoteGetVerified=True,folder='1VzEQ1ZfNNLE2ZYzEXdpS0azgiA4E8_Y5',scope='First 198 MCQ rows only; not 200 and not the later CQ/SQ, figures, generated bank or validation. Superseded by the final separately verified full archive.'),
    contentSafeguards=[
        'Excretion concerns metabolic waste, not undigested-food egestion alone. CO2 is also an excretory waste; not all waste contains nitrogen and not every N-bearing molecule is waste.',
        'Urea production mainly liver, removal mainly kidney. Sweat not a replacement for renal work; no detox or forced dehydration exercise.',
        'Kidneys retroperitoneal; renal capsule distinct from Bowman capsule; cortex versus medulla, ureter versus urethra, and blood versus urine routes explicit. Papilla drains via calyces before pelvis.',
        'Filtration pressure-driven across glomerular barrier, not whole-blood leakage or urea diffusion alone. Useful small solutes also filter; final urine differs after reabsorption and secretion.',
        'Reabsorption tubule to blood; secretion blood/interstitium to tubule. Water movement mainly osmosis, not direct ATP-pumping. Reabsorption and secretion not confined absolutely to one segment.',
        'Loop and collecting-duct behavior conditional; ADH made in hypothalamus, released by posterior pituitary. Aldosterone not responsible for all sodium reabsorption. Autoregulation has limits.',
        'Numerical filtration, output and urine-water figures illustrative/approximate, not patient prescriptions. Concentration times volume gives total solute; unequal collection times require rates.',
        'No universal eight-glass or drink-as-much-as-possible rule; fluid restrictions respected. Obstruction with fever or severe reduced urine and new breathlessness prompt qualified urgent evaluation.',
        'Stone symptoms not definitive diagnosis, treatments vary. No all-calcium ban or guaranteed lemon-water cure. UTI not identical to stones; no borrowed antibiotic or DIY urinary procedures.',
        'Kidney disease can be silent and has multiple causes, not patient blame. Single creatinine/color/foam report not diagnosis; clinical context, time and complementary tests matter.',
        'Drug risks are ingredient/dose/context-dependent; no blanket all-analgesics ban or self-stopping prescribed medicines. Unknown herbal cleanses not assumed safe.',
        'Dialyzer separates blood/dialysate; small-solute diffusion versus pressure-controlled ultrafiltration distinguished. Specific solution composition, safe access and sessions are clinical tasks; not home assembly instructions.',
        'Dialysis replaces part, not all renal function and is not synonymous with cure/transplant. Transplant requires assessment of both parties, compatibility, voluntary consent and follow-up/anti-rejection care.',
        'Brain death not coma, sleep or simple unconsciousness; specialist criteria, valid consent and applicable legal/ethical safeguards required. No current Bangladesh donor-law assertion, coercion, brokerage or organ-sale promotion.',
        'School work uses artificial/anonymous data, safe membrane models and privacy protection; no real blood, body access, intentional dehydration or handling urine as harmless drinking water.'
    ],
    limitations=[
        'BiologyBD chapter-8 secondary OCR chunks 0 and 1 read for scope; not official NCTB edition/page/figure certification. Its missing exercise diagram was not copied or left as a dependency.',
        'Selected OpenStax 41.2 chunks 1–3 and 41.5 chunks 1–2, NIDDK kidney function/stones/hemodialysis/transplant and CKD tests pages checked as conceptual background, not copied exercises or question-level evidence certificates.',
        'OpenStax errors/simplifications not copied: intraperitoneal kidney, filtration as diffusion/filter inside afferent arteriole, all water reabsorbed, all nephrons wholly cortical, collecting ducts always dilute, stress always stops renal flow and aldosterone absence eliminates all sodium reabsorption.',
        'NIDDK public pages use colloquial blood-filtered volume and broad threshold summaries. No direct equation of blood flow with GFR or one-number lifelong diagnosis adopted; GFR can change and albumin findings need context/confirmation.',
        'Hormone detail, countercurrent/vasa recta, microvilli/ATP coupling, quantitative mass balance, creatinine/eGFR, AKI/CKD time course and some transplant immunology are enrichment. Official SSC depth/terminology needs independent review.',
        'Lexical screening is not semantic or independent-objective certification. Concepts recur across question types; distractor plausibility, medical simplification, CQ cognitive depth and syllabus alignment require independent teacher/content review.',
        'Three original figures illustrate selected needs, not exhaustive official illustration reconstruction or production app integration. English labels have Bengali written equivalents.',
        'No independent teacher/content review, textbook certification, full app build, import, approval, publication or deployment claimed.'
    ],
    textbookChapterRead=False,independentContentReview=False,nearDuplicateReviewComplete=False,teacherCertified=False,websiteImported=False,approved=False,published=False)
(DOC/'chapter-8-completion-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(f'Chapter 8: {counts}; {len(preserved)} prior files identical; {len(candidates)} lexical candidate; technical {validation["result"]}')
