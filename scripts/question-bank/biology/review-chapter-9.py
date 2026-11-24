#!/usr/bin/env python3
"""Reproducible chapter-9 technical evidence, NOT independent content certification."""
import argparse
import hashlib
import json
import re
import subprocess
import unicodedata
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
BASE='df5acc2'
DOC=ROOT/'docs/question-bank/ssc-biology'
BANK=ROOT/'content/question-bank/ssc/biology/chapter-9'
sha=lambda b:hashlib.sha256(b).hexdigest()
def read(p):return json.loads(p.read_text())
preserved={}
files=subprocess.check_output(['git','ls-tree','-r','--name-only',BASE],cwd=ROOT,text=True).splitlines()
for name in files:
    if re.match(r'content/question-bank/ssc/biology/chapter-[1-8]/',name) or re.fullmatch(r'docs/question-bank/ssc-biology/chapter-[1-8]\.html',name):
        b=subprocess.check_output(['git','show',f'{BASE}:{name}'],cwd=ROOT)
        assert b==(ROOT/name).read_bytes(),name
        preserved[name]=sha(b)
items={k.upper():read(BANK/f'rebuild-{k}.json')['items'] for k in ['mcq','cq','sq']}
counts={k:len(qs) for k,qs in items.items()}
assert counts=={'MCQ':200,'CQ':50,'SQ':70}
assert Counter(q['correct'] for q in items['MCQ'])==dict.fromkeys('ABCD',50)
source_rows={p.name:len([l for l in p.read_text().splitlines() if l and not l.startswith('#')]) for p in sorted((ROOT/'scripts/question-bank/biology').glob('chapter-9-*.txt'))}
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
assert [(c['type'],c['first'],c['second']) for c in candidates]==[('MCQ',12,13),('MCQ',136,137),('MCQ',136,138),('MCQ',137,138)]
for c in candidates:
    c['authorDisposition']='Retained: thin/actin versus thick/myosin filament identity.' if c['first']==12 else 'Retained: long (femur), flat (sternum) and irregular (vertebra) are different shape-classification targets, not renamed identical answers.'
    c['authorDisposition']+=' Similar short recognition syntax; independent semantic/distractor review remains open.'
parser=argparse.ArgumentParser();parser.add_argument('--test-log',type=Path);args=parser.parse_args()
validation=dict(expectedTests=80,result='PENDING_FINAL_RUN',fullAppBuildClaimed=False)
if args.test_log:
    log=args.test_log.read_bytes()
    for marker in [b'# tests 80\n',b'# pass 80\n',b'# fail 0\n']:assert marker in log,marker
    validation.update(executedTests=80,passed=80,failed=0,result='PASS',testLogSha256=sha(log),command='NODE_PATH="$PWD/.cache/biology-test-tools/node_modules" node --test tests/ssc-biology*.test.cjs')
report=dict(date='2026-11-20',chapter=9,topic='দৃঢ়তা প্রদান ও চলন',baseline=BASE,
    counts=counts,total=320,globalDraftItems=2880,remainingTargetItems=1600,
    status='ANSWERED_DRAFT_COUNT_COMPLETE_REVIEW_REQUIRED',sourceRows=source_rows,
    optionKeyCounts=dict(Counter(q['correct'] for q in items['MCQ'])),
    preservedEarlierFileHashes=preserved,preservedEarlierFileCount=len(preserved),
    diagrams=dict(files=sorted(p.name for p in (BANK/'assets').glob('*.svg')),count=3,attachedTo='Three CQ stimuli with Bengali written equivalents; English SVG labels',productionIntegration=False,inspection='All three rasterized with Resvg and visually inspected. Regional skeleton is explicitly selected/not a count inventory, synovial section enlarges layers and elbow sketch is a functional side view. Skeleton note moved clear of feet; tendon label shortened clear of flexion arrow. Attachments, counts and layer shapes are simplified, not clinical instructions.'),
    lexicalScreen=dict(method='Same-type stem word-bigram Jaccard >=0.40; NFKC/lowercase; punctuation removed except Bengali range; all 320 chapter-9 stems',candidates=candidates,candidatePairs=len(candidates),exactUniqueStems=len({q['text'] for qs in items.values() for q in qs}),semanticCertification=False),
    technicalValidation=validation,
    incrementalBackup=dict(fileId='14QXy9naQ3UXwKn-ecsHaZ1OQtw_Xztvw',name='ssc-biology-chapter-9-authoring-checkpoint-v1.zip',bytes=20602,md5='9b81f7289b1b69e83b868e796b839354',independentRemoteGetVerified=True,folder='1VzEQ1ZfNNLE2ZYzEXdpS0azgiA4E8_Y5',scope='First 200 MCQ authoring rows only; no later CQ/SQ, diagrams, generated bank or final validation. Superseded by the separately verified final full archive.'),
    contentSafeguards=[
        'Movement of a body part distinguished from whole-body locomotion. Endoskeleton is internal bone/cartilage; hair/nails not added to the standard 206-bone count. Adult count is conventional, with age/fusion and individual variations.',
        'Axial versus appendicular/girdle regions and protected organs distinguished. Not every abdominal organ is enclosed in a rigid bone box; regional diagram deliberately omits individual bone counts/details.',
        'Bone is living connective tissue/organ with blood vessels, nerves and marrow. Mineral stiffness and collagen tensile properties complementary; no fixed universal water/organic percentages copied. Red marrow makes blood cells, not mineral matrix directly.',
        'Formation, resorption and maintenance cells distinguished. Remodeling normal, persistent net loss concerning. Growth-plate timing varies; no fixed everyone-stops-at-25 rule.',
        'Cartilage avascular with diffusion supply; not all cartilage has perichondrium. Compact central canals contain vessels/nerves; canaliculi not whole-blood channels. Spongy bone is mineralized trabecular tissue, not soft foam.',
        'Joint is a meeting of bones, not necessarily freely movable. Intervertebral-body joints slightly movable; other vertebral joints acknowledged. Synovial fluid/cartilage, capsule and ligament functions complementary; full movement does not mean unlimited safe range.',
        'Tendon transmits muscle-to-bone pull and is not a contractile muscle. Ligament bone-to-bone stability; many collagen-rich ligaments, not universal elastin majority. Sprain versus strain versus dislocation/fracture distinguished.',
        'Skeletal voluntary label qualified by reflex/posture control; cardiac striated but involuntary. Muscles generally pull; antagonists, synergists and possible co-contraction noted. Active force can occur isometrically or during eccentric lengthening.',
        'Sliding shortens sarcomeres, not actin/myosin filaments; A-band persists. Ca2+ binds troponin in skeletal muscle, not an actin active site directly. ATP needed for cycling/detachment and Ca2+ return; relaxation not energy-free.',
        'Lever calculations explicitly assume perpendicular moment arms and omit specified other torques. Angle state, change, total path and net change separated; length percentages use initial baseline. Prepared data, not patient load prescriptions.',
        'Osteoporosis multifactorial and often silent, not only calcium deficiency or women-only. BMD and fracture risk related but not identical; fall prevention, nutrition, safe activity and indicated treatment complementary.',
        'No universal supplement dose, prolonged sunburn exposure or stop-prescribed-steroid advice. Vitamin D skin/processing roles qualified; calcium-food examples include edible-bone fish with varied diet, not guaranteed cures.',
        'RA autoimmune synovial inflammation, not identical to rheumatic fever, gout or simple aging. Different ages can be affected; symptoms and one RF test neither definitively confirm nor exclude. Early disease control/follow-up distinguished from pain relief.',
        'OA is whole-joint degenerative change, not merely inert cartilage rubbing. Multiple disorders may coexist; no all-knee-pain diagnosis or one-treatment-for-all claim. Hot swollen joint with fever warrants prompt medical assessment.',
        'Deformity, numbness/cold limb after injury prompt urgent care; no untrained reduction, forced joint testing, chemical bone-burning experiment or pushing through injury. School models use paper/string/prepared data; consent, anonymity and no patient blame.'
    ],
    limitations=[
        'BiologyBD chapter-9 chunks 0–2 read for scope, including exercises; secondary OCR, not official NCTB edition/page/figure certification. Missing exercise image not copied; unrelated trailing biodiversity text excluded.',
        'OpenStax selected factual chunks read: 38.1 (1–3), 38.2 (1–2), 38.3 (1–2), 38.4 (1–3). Not entire books/sections. Concepts used as background, not copied exercises or official question attribution.',
        'OpenStax errors/simplifications not copied: vertebral-body hole for cord, canaliculi transporting blood, fixed growth-stop age, synovial mobility automatically weakness, figure wrist-saddle labeling, calcium binding actin active site and A-bands disappearing during contraction. Bone-cell/marrow and contraction shorthand qualified.',
        'NIAMS main osteoporosis, RA, OA and sports-injury content plus initial diagnosis/treatment chunks for osteoporosis and RA checked. Public US screening/dose guidance not turned into Bangladesh-specific medical prescriptions. Pages provide background, not question-by-question clinical evidence.',
        'Enrichment includes axial/appendicular detail, bone microanatomy/cell names/growth plates, movement terminology, sarcomere/Ca2+/ATP/NMJ/motor units, isometric/eccentric/co-contraction, lever mathematics and selected diagnostic/treatment distinctions. Official SSC depth and terminology require independent checking.',
        'Four lexical candidates are author-retained for different filament identities and bone shape targets; not semantic-uniqueness certification. Concepts recur across types. Distractor plausibility, independent objectives and CQ higher-order depth remain independent teacher/content review tasks.',
        'Three original figures illustrate selected concepts, not a reconstruction of all official textbook figures or production integration. English labels have Bengali written equivalents. Skeleton figure is not intended for bone counting; joint layers/attachments are not anatomical scale.',
        'No independent teacher/content review, official textbook certification, full app build, import, approval, publication or deployment claimed.'
    ],
    textbookChapterRead=False,independentContentReview=False,nearDuplicateReviewComplete=False,teacherCertified=False,websiteImported=False,approved=False,published=False)
(DOC/'chapter-9-completion-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(f'Chapter 9: {counts}; {len(preserved)} earlier files identical; {len(candidates)} lexical candidates; technical {validation["result"]}')
