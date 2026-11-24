#!/usr/bin/env python3
"""Reproducible author/technical review, never independent certification."""
import argparse, hashlib, json, re, subprocess, unicodedata
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
BASE='cfff02c0b051c379b97a9c4408f26e40d67f2aa0'
DOC=ROOT/'docs/question-bank/ssc-biology'
BANK=ROOT/'content/question-bank/ssc/biology/chapter-14'
sha=lambda b:hashlib.sha256(b).hexdigest()
read=lambda p:json.loads(p.read_text())
preserved={}
for name in subprocess.check_output(['git','ls-tree','-r','--name-only',BASE],cwd=ROOT,text=True).splitlines():
    if re.match(r'content/question-bank/ssc/biology/chapter-(?:[1-9]|1[0-3])/',name) or re.fullmatch(r'docs/question-bank/ssc-biology/chapter-(?:[1-9]|1[0-3])\.html',name):
        original=subprocess.check_output(['git','show',f'{BASE}:{name}'],cwd=ROOT)
        assert original==(ROOT/name).read_bytes(),name
        preserved[name]=sha(original)
items={k.upper():read(BANK/f'rebuild-{k}.json')['items'] for k in ['mcq','cq','sq']}
assert {k:len(v) for k,v in items.items()}=={'MCQ':200,'CQ':50,'SQ':70}
assert Counter(q['correct'] for q in items['MCQ'])==dict.fromkeys('ABCD',50)
candidates=[]
for kind,qs in items.items():
    grams=[]
    for q in qs:
        w=re.sub(r'[^\w\s\u0980-\u09ff]',' ',unicodedata.normalize('NFKC',q['text']).lower()).split()
        grams.append(set(zip(w,w[1:])))
    for i,a in enumerate(grams):
        for j,b in enumerate(grams[:i]):
            score=len(a&b)/len(a|b) if a|b else 0
            if score>=.4:candidates.append(dict(type=kind,first=j+1,second=i+1,jaccard=score,authorDisposition='Retained: short definition syntax shared; distinct callus, cDNA and biofortification targets. Not independent semantic/distractor certification.'))
assert [(c['type'],c['first'],c['second']) for c in candidates]==[('MCQ',19,70),('MCQ',19,124),('MCQ',70,124)]
figures={str(p.relative_to(ROOT)):sha(p.read_bytes()) for p in sorted((BANK/'assets').glob('*.svg'))}
assert len(figures)==3 and sum('![' in q['text'] for q in items['CQ'])==3
p=argparse.ArgumentParser();p.add_argument('--test-log',type=Path);args=p.parse_args()
validation=dict(result='PENDING_FINAL_RUN',fullAppBuildClaimed=False)
if args.test_log:
    log=args.test_log.read_bytes();n=int(re.search(rb'^# tests (\d+)$',log,re.M)[1]);passed=int(re.search(rb'^# pass (\d+)$',log,re.M)[1])
    assert n==passed and n>=124 and b'# fail 0\n' in log
    validation.update(result='PASS',executedTests=n,passed=passed,failed=0,testLogSha256=sha(log),command='node --test tests/ssc-biology*.test.cjs')
report=dict(date='2026-11-20',chapter=14,topic='জীবপ্রযুক্তি',baseline=BASE,counts={k:len(v) for k,v in items.items()},total=320,
    globalDraftItems=4480,remainingTargetItems=0,preservedEarlierFileCount=len(preserved),preservedEarlierFileHashes=preserved,
    authoringRows={p.name:sum(bool(l) and not l.startswith('#') for l in p.read_text().splitlines()) for p in sorted((ROOT/'scripts/question-bank/biology').glob('chapter-14-*.txt'))},
    mcqKeys=dict(Counter(q['correct'] for q in items['MCQ'])),
    lexicalScreen=dict(method='Same-type stem word-bigram Jaccard >=0.40; NFKC/lowercase; punctuation removed except Bengali range',candidatePairs=len(candidates),candidates=candidates,exactUniqueStems=len({q['text'] for qs in items.values() for q in qs}),semanticCertification=False),
    diagrams=dict(count=3,hashes=figures,actualCqAttachments=3,origin='original_editorial_diagram',rasterizedWith='sharp',authorVisualInspection=True,productionIntegration='REGISTRY_MAPPING_AND_LOCAL_ASSETS_PREPARED_NOT_LIVE_VERIFIED',notes='Tissue culture, recombinant DNA components/checks, evidence stages. Conceptual not operational protocols; English labels with Bengali written equivalents.'),
    technicalValidation=validation,
    incrementalBackup=dict(fileId='1Hy3WEEJ8989kqZc8KkZIPu9E89EyMGFq',name='ssc-biology-ch14-raw-checkpoint-v1.zip',bytes=52150,md5='2f6605aa385cdbd85f781974a148bab7',independentRemoteGetVerified=True,parent='1VzEQ1ZfNNLE2ZYzEXdpS0azgiA4E8_Y5',scope='320 answered raw authoring rows before figure attachments, generation and validation; not final backup.'),
    sourcesRead=[dict(url='https://www.biologybd.com/9t14.html',textChunksRead=[0,1,2],sourceImagesInspected=False,officialEditionVerified=False)],
    authorSafeguards=[
        'Traditional fermentation and tissue culture are biotechnology but do not necessarily modify DNA. Gas production is not evidence of gene insertion.',
        'Explant/callus/organ development distinct. Callus not obligatory in every route; hormones, genotype, media and conditions affect regeneration. Agar not the main carbon/energy source.',
        'Surface asepsis not proof of internal virus freedom. Meristem approaches may help, never universal guaranteed healthy clones; separate testing and later infection considered. Acclimatization required, somaclonal variation possible.',
        'Donor, vector, host, restriction and ligase roles distinct. Complementary end pairing not sufficient covalent joining. Marker selection not proof of correct insert; DNA presence not guaranteed expression, folding or active product.',
        'cDNA, PCR, gel interpretation, editing, promoter and product-processing detail explicitly enrichment where applicable. DNA amplification not organism cloning; band length not exact sequence. Gene editing not necessarily permanent foreign DNA.',
        'Insulin/interferon/growth hormone/GM-CSF and antigens not universal cures or prescriptions. Product quantity not purity/activity; applicable testing and regulatory evidence needed. No drug dose or self-treatment instructions.',
        'Bt target-specific, resistance possible; drought tolerance not no-water farming; herbicide tolerance not insect resistance. Biofortification not all-nutrient cure or assumed commercial approval.',
        'Biofertilizer viability/storage/context important; enzymes substrate/condition dependent; bioreactor scale-up not linear vessel enlargement. Bioethanol impacts require life-cycle context.',
        'Biogas residue not automatically pathogen-free; clear treated water not potable, no tasting. Metals are not destroyed like degradable organic compounds; contaminated biomass needs safe disposal.',
        'Product-specific gene flow/non-target effects and safety endpoints; no all-GM good/bad assurance. Negative test covers only tested targets/conditions, not every future risk. Consent/privacy and reidentification limits retained.',
        'Percent denominators120->96->72 give80%,75%,60%;200 minus30=170 with15% contamination;12->15 and20->25 relative25%, not percentage-point claims. No repetitive number-only quota variants.',
        'Use conceptual diagrams and hypothetical data; no unknown organism culture, pathogen manipulation, covert genetic samples, environmental release or operational gene-editing recipes.'
    ],
    limitations=[
        'Original answered author drafts, not official board questions or verified NCTB edition/page coverage. Independent SSC depth, Bengali terminology, distractor plausibility and CQ cognitive-level review remain open.',
        'Three lexical candidates author-retained, not independent semantic uniqueness certification; cross-type concept recurrence intentional.320 questions are not320 independent learning objectives.',
        'All14 count targets met, not textbook/teacher certification. Registry/public assets/release code prepared separately; no import/approval/deployment success inferred from files or tests.',
        'Unknown Biology model marks require teacher-provided scheme; do not invent an official syllabus or marks distribution.'
    ],textbookChapterRead=False,independentContentReview=False,nearDuplicateReviewComplete=False,teacherCertified=False,
    websiteImported=False,approved=False,published=False)
(DOC/'chapter-14-completion-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(f'Chapter14:320; preserved {len(preserved)} earlier files;3 lexical candidates author-dispositioned; technical {validation["result"]}')
