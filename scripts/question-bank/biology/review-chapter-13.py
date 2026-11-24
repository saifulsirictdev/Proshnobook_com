#!/usr/bin/env python3
"""Author/technical evidence only. No import, approval or independent certification."""
import argparse
import hashlib
import json
import re
import subprocess
import unicodedata
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
BASE='531e80909624e599a9bb9edf2ca212920790857c'
DOC=ROOT/'docs/question-bank/ssc-biology'
BANK=ROOT/'content/question-bank/ssc/biology/chapter-13'
sha=lambda b:hashlib.sha256(b).hexdigest()
read=lambda p:json.loads(p.read_text())
preserved={}
for name in subprocess.check_output(['git','ls-tree','-r','--name-only',BASE],cwd=ROOT,text=True).splitlines():
    if re.match(r'content/question-bank/ssc/biology/chapter-(?:[1-9]|1[012])/',name) or re.fullmatch(r'docs/question-bank/ssc-biology/chapter-(?:[1-9]|1[012])\.html',name):
        original=subprocess.check_output(['git','show',f'{BASE}:{name}'],cwd=ROOT)
        assert original==(ROOT/name).read_bytes(),name
        preserved[name]=sha(original)
items={kind.upper():read(BANK/f'rebuild-{kind}.json')['items'] for kind in ['mcq','cq','sq']}
counts={kind:len(qs) for kind,qs in items.items()}
assert counts=={'MCQ':200,'CQ':50,'SQ':70}
assert Counter(q['correct'] for q in items['MCQ'])==dict.fromkeys('ABCD',50)
authoring={p.name:len([l for l in p.read_text().splitlines() if l and not l.startswith('#')]) for p in sorted((ROOT/'scripts/question-bank/biology').glob('chapter-13-*.txt'))}
assert sorted(authoring.values())==[25,25,50,50,50,50,70]
candidates=[]
for kind,qs in items.items():
    grams=[]
    for q in qs:
        words=re.sub(r'[^\w\s\u0980-\u09ff]',' ',unicodedata.normalize('NFKC',q['text']).lower()).split()
        grams.append(set(zip(words,words[1:])))
    for i,a in enumerate(grams):
        for j,b in enumerate(grams[:i]):
            score=len(a&b)/len(a|b) if a|b else 0
            if score>=.4:candidates.append(dict(type=kind,first=j+1,second=i+1,jaccard=score))
assert not candidates,'Author must inspect new lexical candidates before recording evidence'
figures={str(p.relative_to(ROOT)):sha(p.read_bytes()) for p in sorted((BANK/'assets').glob('*.svg'))}
assert len(figures)==4
assert sum('![' in q['text'] for q in items['CQ'])==4
parser=argparse.ArgumentParser();parser.add_argument('--test-log',type=Path);args=parser.parse_args()
validation=dict(result='PENDING_FINAL_RUN',fullAppBuildClaimed=False)
if args.test_log:
    log=args.test_log.read_bytes();n=int(re.search(rb'^# tests (\d+)$',log,re.M)[1]);passed=int(re.search(rb'^# pass (\d+)$',log,re.M)[1])
    assert n==passed and n>=100 and b'# fail 0\n' in log
    validation.update(result='PASS',executedTests=n,passed=passed,failed=0,testLogSha256=sha(log),command='node --test tests/ssc-biology*.test.cjs')
report=dict(date='2026-11-20',chapter=13,topic='জীবের পরিবেশ',baseline=BASE,counts=counts,total=320,
    globalDraftItems=4160,remainingTargetItems=320,preservedEarlierFileCount=len(preserved),preservedEarlierFileHashes=preserved,
    authoringRows=authoring,mcqKeys=dict(Counter(q['correct'] for q in items['MCQ'])),
    lexicalScreen=dict(method='Same-type stem word-bigram Jaccard >=0.40; NFKC/lowercase; punctuation removed except Bengali range',candidatePairs=len(candidates),candidates=candidates,exactUniqueStems=len({q['text'] for qs in items.values() for q in qs}),semanticCertification=False),
    diagrams=dict(count=4,hashes=figures,origin='original_editorial_diagram',actualCqAttachments=4,rasterizedWith='sharp',authorVisualInspection=True,productionIntegration=False,notes='All four SVGs rasterized and author-inspected. Food-to-consumer arrow direction checked; energy widths explicitly not to scale, 10% assumption not universal. Nitrogen N2-to-plant arrow explicitly summarizes microbial fixation, not direct N2 uptake; selected pathways only. Nutrient enrichment diagram states possible oxygen stress, not all fish-death causes. Bengali written equivalent in every attached stimulus.'),
    technicalValidation=validation,
    incrementalBackup=dict(fileId='1P0gpVnG2t3dLLwVH-TgClpomlT-7gLDO',name='ssc-biology-chapter-13-authoring-checkpoint-v1.zip',bytes=55040,md5='c8d6ce6ed98ccde033fa08737295cbcb',independentRemoteGetVerified=True,parent='1VzEQ1ZfNNLE2ZYzEXdpS0azgiA4E8_Y5',scope='320 answered raw authoring rows before four figure attachments, minor wording correction, canonical generation and final tests. Not final chapter backup.'),
    sourcesRead=[dict(url='https://www.biologybd.com/9t13.html',textChunksRead=[0,1,2,3,4],sourceImagesInspected=False,officialEditionVerified=False)],
    authorSafeguards=[
        'Population vs community vs ecosystem; abiotic light not a producer; habitat not identical to ecological role. Phytoplankton vs zooplankton; plants respire at night as well as day. Correlation alone not a unique cause of fish death.',
        'Food-to-consumer arrows. Trophic level counts producer as first; consumer order starts later. Omnivore positions path-dependent. Top predator relative to displayed web, not necessarily biggest or immune to disease.',
        'Living producer grazing paths vs dead-organic detrital paths linked through waste and remains. Earthworms detritivores not microorganisms; decomposers receive matter from every trophic level.',
        'Energy flows and heat dissipates, not completely recycled as nutrients. Most systems solar-based, chemotrophic exception included.10% is approximate educational model; arithmetic checked, not personal diet/medical advice.',
        'Number/standing-biomass/energy-flow pyramids distinct. One tree supports many insects. Rapid phytoplankton turnover can support consumers with small standing stock; equal area/time required for rates.',
        'Carbon fixation vs respiration/combustion; deforestation reduces future uptake as well as releasing carbon. Seedlings do not instantly cancel every emission. Most plants cannot directly use N2; Rhizobium mutual benefit.',
        'Ammonification, nitrification and denitrification separate and marked enrichment where detailed. Phosphorus weathering and chemical-production exception enrichment; no unsupported compulsory SSC depth claim.',
        'Mutualism, commensalism, parasitism, predation and competition defined by observed effects, not co-occurrence or fixed species-pair names. Epiphyte shelter not necessarily host nutrient theft. Different cattle-egret effects distinguished.',
        'Genetic/species/ecosystem diversity; richness distinct from abundance distribution. Diverse webs may offer alternatives, never guaranteed resilience to all disturbance. Dynamic balance not equal fixed populations.',
        'Habitat loss/fragmentation, corridors and overharvest considered with species-specific effects. All non-native species not automatically invasive; no unauthorized biocontrol release, unsafe wildlife handling or nest disturbance.',
        'N/P enrichment -> possible algal growth -> decomposition/respiration oxygen demand; not all algal blooms necessarily toxic or all fish deaths same cause. Clear water not proof of potability or aquaculture safety; no tasting polluted water.',
        'Bioaccumulation within organisms vs biomagnification across trophic levels; not all chemicals magnify. Given concentrations same units;500-fold endpoint ratio checked. No consuming suspect fish to test safety.',
        'In-situ/ex-situ complementary, zoo/seed bank not replacement for whole ecosystem; not all seeds equally storable. Local absence not global extinction, endangered not extinct. Equal sampling effort, repeated seasons and uncertainty required.',
        'Old diverse forest not replaced simply by same tree count; restoration needs survival, native communities, water/soil, long-term indicators and fair local participation. No fabricated approval, official board provenance or independent certification.'
    ],
    limitations=[
        'Original answered practice, not official board/school/year questions or verified NCTB edition/page extracts. Secondary BiologyBD text read earlier; no source artwork copied. Source reading does not certify every extension.',
        'Detailed nutrient transformations, turnover, efficiency calculations, sampling, restoration/social evaluation are enrichment/application; independent SSC terminology and depth alignment still pending.',
        'No lexical pairs at stated threshold is NOT semantic uniqueness or distractor plausibility certification. Cross-type concept recurrence intentional; no claim320 independent learning objectives.',
        'Four original English-labeled diagrams with Bengali written equivalents author-inspected, not independent science review. Relative draft assets still require production mapping before publication.',
        'Chapter14 remains unauthored. No Biology registry/import/approval/publication/deployment performed by this chapter workflow.'
    ],textbookChapterRead=False,independentContentReview=False,nearDuplicateReviewComplete=False,teacherCertified=False,
    websiteImported=False,approved=False,published=False)
(DOC/'chapter-13-completion-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(f'Chapter13 {counts}; {len(preserved)} earlier files identical; {len(candidates)} lexical pairs; technical {validation["result"]}')
