#!/usr/bin/env python3
"""Reproducible author/technical evidence; never independent science certification."""
import argparse
import hashlib
import json
import re
import subprocess
import unicodedata
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
BASE='5a84276'
DOC=ROOT/'docs/question-bank/ssc-biology'
BANK=ROOT/'content/question-bank/ssc/biology/chapter-11'
sha=lambda b:hashlib.sha256(b).hexdigest()
def read(p):return json.loads(p.read_text())
preserved={}
for name in subprocess.check_output(['git','ls-tree','-r','--name-only',BASE],cwd=ROOT,text=True).splitlines():
    if re.match(r'content/question-bank/ssc/biology/chapter-(?:[1-9]|10)/',name) or re.fullmatch(r'docs/question-bank/ssc-biology/chapter-(?:[1-9]|10)\.html',name):
        b=subprocess.check_output(['git','show',f'{BASE}:{name}'],cwd=ROOT)
        assert b==(ROOT/name).read_bytes(),name
        preserved[name]=sha(b)
items={k.upper():read(BANK/f'rebuild-{k}.json')['items'] for k in ['mcq','cq','sq']}
counts={k:len(qs) for k,qs in items.items()}
assert counts=={'MCQ':200,'CQ':50,'SQ':70}
assert Counter(q['correct'] for q in items['MCQ'])==dict.fromkeys('ABCD',50)
source_rows={p.name:len([l for l in p.read_text().splitlines() if l and not l.startswith('#')]) for p in sorted((ROOT/'scripts/question-bank/biology').glob('chapter-11-*.txt'))}
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
assert [(c['type'],c['first'],c['second']) for c in candidates]==[('MCQ',120,129),('MCQ',181,186)]
for c,reason in zip(candidates,[
    'Retained: androecium unit stamen versus gynoecium unit carpel; separate structural targets, similar short syntax.',
    'Retained: zygote becomes embryo versus plumule becomes shoot; distinct ontogenetic targets, similar short syntax.'
]):c['authorDisposition']=reason+' Not independent semantic/distractor clearance.'
parser=argparse.ArgumentParser();parser.add_argument('--test-log',type=Path);args=parser.parse_args()
validation=dict(expectedTests=97,result='PENDING_FINAL_RUN',fullAppBuildClaimed=False)
if args.test_log:
    log=args.test_log.read_bytes()
    for marker in [b'# tests 97\n',b'# pass 97\n',b'# fail 0\n']:assert marker in log,marker
    validation.update(executedTests=97,passed=97,failed=0,result='PASS',testLogSha256=sha(log),command='NODE_PATH="$PWD/.cache/biology-test-tools/node_modules" node --test tests/ssc-biology*.test.cjs')
figures={str(p.relative_to(ROOT)):sha(p.read_bytes()) for p in sorted((BANK/'assets').glob('*.svg'))}
assert len(figures)==4
report=dict(date='2026-11-20',chapter=11,topic='জীবের প্রজনন',baseline=BASE,
    counts=counts,total=320,globalDraftItems=3520,remainingTargetItems=960,
    preservedEarlierFileCount=len(preserved),preservedEarlierFileHashes=preserved,authoringRows=source_rows,
    mcqKeys=dict(Counter(q['correct'] for q in items['MCQ'])),
    diagrams=dict(count=4,hashes=figures,origin='original_editorial_diagram',actualCqAttachments=4,rasterizedWith='@resvg/resvg-js',authorVisualInspection=True,productionIntegration=False,notes='Four diagrams rendered and visually inspected. Flower labels separated from petal outline; sepal and petal distinguished. Embryo-sac egg arrow targets egg rather than adjacent synergid; eight nuclei in seven cells before polar-nuclear fusion. Human route and placental exchange are explicitly functional schematics, not anatomical sections or scaled timelines. Placental arrows indicate substances, not blood mixing.'),
    lexicalScreen=dict(method='Same-type stem word-bigram Jaccard >=0.40; NFKC/lowercase; punctuation removed except Bengali range; all 320 chapter-11 stems',candidates=candidates,candidatePairs=len(candidates),exactUniqueStems=len({q['text'] for qs in items.values() for q in qs}),semanticCertification=False),
    technicalValidation=validation,
    incrementalBackup=dict(fileId='1T07ExX9VnSneWLIi95v8SYzuoAIiSfO7',name='ssc-biology-chapter-11-authoring-checkpoint-v1.zip',bytes=19283,md5='c148618ded37cca58ae5b02be7ff2079',independentRemoteGetVerified=True,folder='1VzEQ1ZfNNLE2ZYzEXdpS0azgiA4E8_Y5',scope='200 MCQ authoring rows only; no CQ/SQ, diagrams, generated bank or final validation. Full final archive separately versioned and verified.'),
    contentSafeguards=[
        'Reproduction sustains lineages, not a survival duty of every individual. Asexual offspring usually similar, not mutation-free. Sexual recombination increases variation, not guaranteed superiority/speciation. Regrowth of a lizard tail is not creation of another organism; no animal cutting experiments.',
        'Flower axis distinguished from floral whorls: four whorls versus local five-main-parts convention explicitly reconciled in SQ/CQ. Complete versus bisexual, separate male/female flowers on one monoecious plant versus dioecious individuals distinguished. No universal claim that all angiosperms have bisexual flowers; no pea-as-monoecious example copied.',
        'Stigma receives pollen; style is route, ovary contains ovules. Filament grouping versus anther union distinguished. Inflorescence main-axis growth distinguishes racemose/cymose. Petals/sepals may share auxiliary roles; not every flower requires colorful petals.',
        'Pollination transfers pollen, not a sperm directly. Same-plant different-flower transfer included in broad self-pollination; may still need a vector. Outcrossing within a species, not automatically new species or superior progeny. Selfing not inevitable extinction and not zero meiotic variation.',
        'Aquatic habitat not equal water pollination; wind light pollen versus insect attraction/adhesion treated as syndromes, not diagnosis from color alone. Visitor not automatically effective pollinator. Self-incompatibility not pollen death. Bagging can alter microclimate; prepared data and repetitions, no student pesticide use.',
        'Meiosis produces spores in the plant model; generative-cell mitosis produces sperm. Timing may differ by species. Microsporogenesis, megasporogenesis and gametophyte development distinguished; one surviving megaspore is a selected common model, not every species.',
        'Typical seven-cell/eight-nucleus embryo sac before polar fusion; egg + two synergids micropylar, three antipodals chalazal, two polar nuclei in central cell. Double fertilization is sperm+egg versus sperm+central cell, not two sperm in one egg. Zygote 2n and usual endosperm 3n.',
        'Ovule→seed, integuments→seed coat, ovary wall→pericarp. Seed coat maternal versus biparental embryo, same ploidy not same origin. Endosperm reserves can move to cotyledons. Simple/aggregate/multiple source versus true/accessory tissue contribution are separate classification axes.',
        'Fruit need not be sweet, fertilization can be absent in parthenocarpy; seedlessness alone not exact mechanism diagnosis. Parthenogenesis refers to an unfertilized egg developing into an organism, not a fruit. Germination needs appropriate water/oxygen/temperature; excess water can limit oxygen.',
        'Fertilization site versus later development site distinguished: birds internal though eggs laid outside; some aquatic animals internal. No all-fish external or seahorse-example generalization. Polyspermy avoidance important. Human gametes 23 + 23→zygote46 then mitotic cleavage.',
        'Sperm head genetic/acrosome, midpiece ATP support, tail movement. Testes production versus epididymis maturation/storage and vas transport distinct. Semen includes accessory secretions. Cooler testis environment supports sperm production, not all sperm immotile at body temperature. No appearance-based fertility judgments.',
        'Ovary development/hormones, oviduct usual fertilization, uterine lining implantation, cervix/vagina versus urethra distinct. Oogenesis unequal cytoplasm/polar bodies enrichment qualified; no claim human egg meiosis completed before fertilization.',
        'Puberty variable and not a moral or social-readiness judgment. Menarche not two protected infertile years. Postpartum menstruation variable and ovulation can precede it; not fixed six-week return. Menopause not any missed period. Menstruation endometrial shedding, not egg becoming blood or impurity; privacy, hygiene and symptom-based referral.',
        'GnRH hypothalamus, FSH/LH anterior pituitary, gonadal feedback. FSH follicle/Sertoli and LH ovulatory/Leydig roles differentiated. Estrogen phase-dependent feedback, progesterone endometrial maintenance. Prolactin milk synthesis vs oxytocin ejection/contraction; hypothalamic synthesis vs posterior release. hCG early corpus-luteum support.',
        '28-day cycle and calendar figures teaching models, not guaranteed contraception or diagnosis. No hormone/contraceptive/ART dosing or unsupervised treatment. Adolescent pregnancy health risks discussed without exact legal-age claim, coercion or social blame.',
        'Cleavage cells increase without proportional early volume growth. Blastocyst implantation distinct from fertilization. No rigid universal exact implantation day; possible ectopic pregnancy symptoms need urgent clinical assessment. LMP~40weeks/280days versus postfertilization~38weeks/266days qualified by start point and variation.',
        'Placenta temporary maternal/fetal organ, exchange plus endocrine roles. Blood streams normally separate, cord is fetal circulation not direct maternal pipe. Usual two arteries/one vein named by direction; vein oxygen-rich. Placenta not perfect drug/pathogen barrier; do not self-start or stop needed medicines. Amniotic fluid protection not blood or aerial respiration.',
        'Labor stretch/oxytocin positive feedback not home induction guide. Placental expulsion after birth, endocrine preparation not only starts at birth. Prolactin vs oxytocin not conflated; feeding concerns supported without maternal blame.',
        'HIV virus versus AIDS advanced stage. CD4 T-cell loss affects immune coordination; CD4 cells not antibody-producing B cells. Symptoms nonspecific and may be absent, no face/identity diagnosis. No outdated fatalism or discovery-year/global-count questions.',
        'Sexual, blood/needle and mother-to-child paths versus no ordinary food/handshake/school contact or mosquito transmission. Sterile equipment, screened blood, condoms correctly/consistently, confidential testing and supportive care. Standard precautions for all blood contact, no stigma-based isolation.',
        'ART suppresses replication and supports immunity, not eradication; do not stop when well. U=U conditional on maintained undetectable viral load, sexual transmission only, not permission to share needles. Window period depends on test/time; confirm through approved testing algorithm, not a universal negative-day guarantee.',
        'Maternal ART and specialist mother/infant care reduce transmission, no inevitable infant infection or self-decided feeding plan. Possible recent exposure urgent clinical assessment, no waiting for symptoms; PrEP-before/PEP-after distinction without prescription. Survey knowledge gain not proof of infection elimination.'
    ],
    limitations=[
        'BiologyBD chapter11 chunks0–3 all read; secondary OCR, not verified official NCTB edition/pages. Missing exercise images not reconstructed or given invented labels. All questions original practice, no fabricated board/school/year attribution.',
        'Selected OpenStax only: 32.1 chunks2–3; 32.2 chunks1–3; 43.1 chunk2; 43.2 chunk1; 43.3 chunks1–2; 43.4 chunk2; 43.5 chunks1–2. Not entire book/sections. WHO HIV/AIDS chunks0–1 checked; no global statistics or treatment products/doses transplanted.',
        'Secondary inaccuracies deliberately not copied: all advanced plants monoecious, all low organisms asexual, all selfing no variation/inevitable extinction, outcrossing always creates species, stigma=style, unfertilized secondary nucleus alone makes endosperm, every fruit requires fertilization, all aquatic animals external.',
        'Also corrected/avoided OpenStax simplifications/errors: pea monoecious example, ovule wall becomes fruit, sperm immotile at body temperature, Leydig cells in seminiferous wall, egg meiosis completed before fertilization, conflicting exact implantation days, fixed menstrual ranges/phase descriptions. General standard mechanisms retained, no copied source assessment/image.',
        'Hazardous/outdated source HIV wording inverted sterile/unsterile equipment, fatalism/no effective treatment, AIDS1991 and symptom-at-six-month certainty not copied. Source fixed postmenarche/postpartum timing, prescriptive marriage age and stigmatizing sex-role phrasing not used.',
        'Enrichment includes compatibility, parthenocarpy/parthenogenesis, detailed gametogenesis/polar bodies, GnRH/Leydig/Sertoli/feedback, blastocyst cell lineages, ectopic pregnancy, LMP calculations, umbilical vessels and U=U/PrEP/PEP. Independent SSC depth/terminology alignment remains open.',
        'Two lexical MCQ pairs retained by author for distinct targets; not independent semantic uniqueness. Cross-type concept recurrence deliberate. Independent objective coverage, distractor plausibility, CQ depth and clinical-language review remain open.',
        'Four original English-labeled relevant CQ diagrams with Bengali written equivalents. Visual author inspection and raw technical tests not teacher/scientific certification or all official-figure coverage. No full app build, website import, approval, publication or deployment.'
    ],
    textbookChapterRead=False,independentContentReview=False,nearDuplicateReviewComplete=False,teacherCertified=False,websiteImported=False,approved=False,published=False)
(DOC/'chapter-11-completion-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(f'Chapter 11: {counts}; {len(preserved)} earlier files identical; {len(candidates)} lexical candidates; technical {validation["result"]}')
