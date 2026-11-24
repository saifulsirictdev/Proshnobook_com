#!/usr/bin/env python3
"""Chapter 12 author/technical evidence, never independent scientific approval."""
import argparse
import hashlib
import json
import re
import subprocess
import unicodedata
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
BASE='69a78e9'
DOC=ROOT/'docs/question-bank/ssc-biology'
BANK=ROOT/'content/question-bank/ssc/biology/chapter-12'
sha=lambda b:hashlib.sha256(b).hexdigest()
def read(p):return json.loads(p.read_text())
preserved={}
for name in subprocess.check_output(['git','ls-tree','-r','--name-only',BASE],cwd=ROOT,text=True).splitlines():
    if re.match(r'content/question-bank/ssc/biology/chapter-(?:[1-9]|10|11)/',name) or re.fullmatch(r'docs/question-bank/ssc-biology/chapter-(?:[1-9]|10|11)\.html',name):
        b=subprocess.check_output(['git','show',f'{BASE}:{name}'],cwd=ROOT)
        assert b==(ROOT/name).read_bytes(),name
        preserved[name]=sha(b)
items={k.upper():read(BANK/f'rebuild-{k}.json')['items'] for k in ['mcq','cq','sq']}
counts={k:len(qs) for k,qs in items.items()}
assert counts=={'MCQ':200,'CQ':50,'SQ':70}
assert Counter(q['correct'] for q in items['MCQ'])==dict.fromkeys('ABCD',50)
source_rows={p.name:len([l for l in p.read_text().splitlines() if l and not l.startswith('#')]) for p in sorted((ROOT/'scripts/question-bank/biology').glob('chapter-12-*.txt'))}
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
assert [(c['type'],c['first'],c['second']) for c in candidates]==[('MCQ',88,110),('MCQ',119,137)]
for c,reason in zip(candidates,[
    'Retained: polyploidy (complete chromosome sets) versus allele (alternative gene version); generic Bengali definition question syntax, distinct biological scales.',
    'Retained: DNA deoxyribose versus RNA ribose, separate chemical targets needed for a direct comparison; shared short syntax.'
]):c['authorDisposition']=reason+' Not independent semantic/distractor clearance.'
parser=argparse.ArgumentParser();parser.add_argument('--test-log',type=Path);args=parser.parse_args()
validation=dict(expectedTests=105,result='PENDING_FINAL_RUN',fullAppBuildClaimed=False)
if args.test_log:
    log=args.test_log.read_bytes()
    for marker in [b'# tests 105\n',b'# pass 105\n',b'# fail 0\n']:assert marker in log,marker
    validation.update(executedTests=105,passed=105,failed=0,result='PASS',testLogSha256=sha(log),command='NODE_PATH="$PWD/.cache/biology-test-tools/node_modules" node --test tests/ssc-biology*.test.cjs')
figures={str(p.relative_to(ROOT)):sha(p.read_bytes()) for p in sorted((BANK/'assets').glob('*.svg'))}
assert len(figures)==4
report=dict(date='2026-11-20',chapter=12,topic='জীবের বংশগতি ও জৈব অভিব্যক্তি',baseline=BASE,
    counts=counts,total=320,globalDraftItems=3840,remainingTargetItems=640,
    preservedEarlierFileCount=len(preserved),preservedEarlierFileHashes=preserved,authoringRows=source_rows,
    mcqKeys=dict(Counter(q['correct'] for q in items['MCQ'])),
    diagrams=dict(count=4,hashes=figures,origin='original_editorial_diagram',actualCqAttachments=4,rasterizedWith='@resvg/resvg-js',authorVisualInspection=True,productionIntegration=False,notes='Four original diagrams rendered and author-inspected. DNA flat ladder explicitly not a scaled helix, antiparallel labels and 2/3 hydrogen-bond lines. Monohybrid grid probabilities not four compulsory births. Replication tracks original O1/O2 separately from N1/N2 used as subsequent templates; dashed style denotes all nonoriginal strands. Rooted tree displays shared ancestry, all tips modern and branch lengths not time-scaled. Bengali written equivalents in each stimulus.'),
    lexicalScreen=dict(method='Same-type stem word-bigram Jaccard >=0.40; NFKC/lowercase; punctuation removed except Bengali range; all 320 chapter-12 stems',candidates=candidates,candidatePairs=len(candidates),exactUniqueStems=len({q['text'] for qs in items.values() for q in qs}),semanticCertification=False),
    technicalValidation=validation,
    incrementalBackup=dict(fileId='1yVUMrvPYTPs6y3LmMuhCfIH1DIZKFdTt',name='ssc-biology-chapter-12-authoring-checkpoint-v1.zip',bytes=53234,md5='a5b927b7f1d1830c045259860d883f1d',independentRemoteGetVerified=True,folder='1VzEQ1ZfNNLE2ZYzEXdpS0azgiA4E8_Y5',scope='200 MCQ/50 CQ/70 SQ authoring rows before mixed-script spacing and normalized-option corrections; no figures, generated artifacts or final validation. Full final archive separately versioned and verified.'),
    contentSafeguards=[
        'Chromosome-DNA-gene relation; homologous loci do not require identical alleles. Individual diploid locus generally two copies versus population multiple alleles. Gene product may be functional RNA, not every gene one protein/one visible trait. Polygenic and environmental effects; no intelligence ranking or simplistic human tongue-rolling pedigree.',
        'DNA sugar-phosphate backbone vs complementary bases; A-T two and G-C three hydrogen bonds, antiparallel direction. Whole double-strand A=T/G=C not obligatory in one strand. B-DNA classroom values ~10bp per turn, 20 nucleotides not ten, .34nm spacing/3.4nm pitch/2nm width explicitly approximate.',
        'DNA vs RNA sugars and T/U, RNA commonly single-stranded but folded; RNA-genome viruses acknowledged without first-life claim. mRNA/tRNA/rRNA separate roles. DNA replication versus RNA transcription versus ribosomal translation; not every protein goes through ER/Golgi.',
        'Semiconservative replication refers to each immediate parent, not permanent original-isotope labels. One molecule two cycles four molecules, two carry original labeled strands. Meselson-Stahl first hybrid band excludes conservative but alone not dispersive; second-generation hybrid/light distinguished. Enrichment, no student isotope experiment.',
        'S-phase DNA quantity versus centromere-based chromosome count distinguished. Somatic vs germline mutation; new alleles vs recombined old alleles. Mutation effects variable and not needs-directed; repair reduces not eliminates errors.',
        'Mendel TT x tt required for all Tt F1; Tt x Tt genotype1:2:1 and phenotype3:1 under full dominance and other assumptions. Dominance not commonness, value or utility. Recessive allele hidden not lost. Tall F2 conditional2/3Tt. Testcross recessive partner and small-sample all-dominant ambiguity.',
        'Punnett cells probabilities not compulsory birth sequence; every pregnancy separately. Dihybrid independence conditional, linkage exception tagged enrichment. Incomplete/codominance distinguished. Genetic and environmental phenotype variation not automatically new species.',
        'Identity profiling selected variable markers, not necessarily full genome or radioactive probes. PCR amplification versus size separation; smaller DNA fragments farther in standard gel toward positive electrode. Same size not identical sequence, one marker insufficient for paternity or forensic conviction. Simple fictional paternity models explicitly ignore mutation/error.',
        'Nucleated cells usual nuclear DNA sources, mature human erythrocytes no nucleus; hair shaft vs root limits. Mixtures/contamination and chain of custody; instrument quality cannot repair uncertain specimen labels. Standard STR often cannot distinguish monozygotic twins. No clandestine classmate samples or real-family accusations.',
        'Genetic-test negative not all risks excluded; positive may indicate risk/carrier not inevitable disease. Scope, variant/penetrance and counselling. Voluntary informed consent, family privacy, reidentification risk despite deidentification, controlled access; US privacy law not assumed universal.',
        'Typical XX/XY,22 autosomes+X egg versus22+X/Y sperm; roughly equal probability model, independent births. Sex development also involves autosomal genes and biological variation; model not every person or identity. Neither parent consciously chooses gamete fusion, no blame or sex-based inequality.',
        'X-linked inheritance father gives Y to typical son, X to daughter; conditional risk among sons vs all offspring distinguished. Females can be affected and carriers symptomatic. Not all color vision deficiency X-linked or inherited; red-green impairment not total blindness. Sudden changes need eye evaluation, lenses not universal cure; accessible charts use symbols/text.',
        'Thalassemia globin not globulin and not synonymous with iron deficiency. Alpha vs beta and variable severity; trait not necessarily major illness. Simple beta autosomal-recessive25/50/25 per pregnancy; AA x Aa no aa only within stated locus model. Four alpha gene copies/both chromosome arrangement matter, enrichment not same one-pair model.',
        'No contagious-thalassemia stigma. No unsupervised iron or chelation dose, no stopping prescribed transfusions. Repeated transfusion iron burden and individualized monitoring. No fixed short lifespan, blanket food bans, obsolete only-cure declaration or personal prognosis. Voluntary counselling no reproductive coercion or marriage ban.',
        'Hemophilia A factorVIII versus B factorIX clotting, not thalassemia globin. X-linked model has exceptions/new mutations and female symptoms; enrichment, no dosing or provoked bleeding test.',
        'Evolution population inherited frequency changes, not individual growth/training/acclimatization. Allele count denominators explicit:40/100 vs80/200 same.10% to60% increase50 percentage points versus relative500%. Selection heritable variation/differential reproduction not conscious strongest-only struggle; fitness not moral worth.',
        'Resistance is microbial trait, not patient choosing resistance; variants selected not taught a directed mutation by drug. No antibiotic/pesticide selection experiments or prescription changes. Drift/gene flow additional processes, neither frequency change nor two samples alone proves selection.',
        'Adaptations environment-dependent, no promised progress/perfection or guaranteed survival/speciation. Fossil record incomplete with preservation bias, not no evidence. Homology structure/history vs analogous flight function; vestigial not necessarily functionless. Multiple DNA/fossil/morphology evidence and uncertainty of particular ancestral claims.',
        'Tree modern human and modern chimpanzee share an ancestor, not modern chimpanzee directly human parent. Root/branch points not moral ladder; branch lengths in original diagram unscaled. Geographic isolation reduces flow but not instant species; reproductive isolation and species-concept limits. Hybrid alone not stable species; polyploid example conditional enrichment.',
        'Origin-of-life chemistry distinct from subsequent biological evolution. Amino acids in model not whole life or all historical steps. Multiple origin hypotheses, no certain first modern virus, virus-to-bacterium-to-human ladder or Earth-detached-from-Sun claim. Darwin/Wallace contributions and1859 separate from later Mendelian/DNA mechanisms.'
    ],
    sourcesRead=[
        dict(url='https://www.biologybd.com/9t12.html',scope='all six fetched chunks0–5; secondary OCR chapter and exercises; no copied exercise or reconstructed missing figure'),
        dict(url='https://openstax.org/books/biology-2e/pages/12-2-characteristics-and-traits',scope='chunk2'),
        dict(url='https://openstax.org/books/biology-2e/pages/14-2-dna-structure-and-sequencing',scope='chunk2'),
        dict(url='https://openstax.org/books/biology-2e/pages/14-3-basics-of-dna-replication',scope='chunk1'),
        dict(url='https://openstax.org/books/biology-2e/pages/18-1-understanding-evolution',scope='chunks2–3'),
        dict(url='https://openstax.org/books/biology-2e/pages/18-2-formation-of-new-species',scope='chunk2'),
        dict(url='https://openstax.org/books/biology-2e/pages/19-1-population-evolution',scope='chunk2'),
        dict(url='https://www.nhlbi.nih.gov/health/thalassemia',scope='chunk0 full; causes and treatment subpages chunk0 full; treatment page2022 wording only cure intentionally not used'),
        dict(url='https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/color-blindness',scope='chunk0; redirected from older learn-about-eye-health URL'),
        dict(url='https://medlineplus.gov/genetics/understanding/testing/genetictesting/',scope='chunk0 full'),
        dict(url='https://www.genome.gov/about-genomics/policy-issues/Privacy',scope='chunk0; privacy risks not US-law advice for Bangladesh'),
        dict(url='https://www.cdc.gov/hemophilia/about/index.html',scope='chunk0; inherited A/B and female symptom qualifications')
    ],
    limitations=[
        'Original answered practice drafts, not official board/school/year questions, not official NCTB edition/page verification. BiologyBD OCR contains scientific/clinical/history errors deliberately corrected or omitted. No external source images copied.',
        'Selected OpenStax chunks only, not whole textbook/sections; clinical pages background not medical prescription. Failed NHGRI genetic-testing fact-sheet fetch not evidence; MedlinePlus successful alternative used. Irrelevant sitewide banners excluded.',
        'Detailed phosphodiester bonds, pleiotropy, tRNA/rRNA, enzymes/repair, isotope experiments, transcription sequence, codominance/incomplete dominance, linkage/dihybrid probability, gel polarity, alpha four-copy genetics, hemophilia, drift/gene flow and polyploidy are marked or described as enrichment. Independent SSC depth/terminology alignment remains open.',
        'Two lexical candidates retained by author for different targets; lexical screen not semantic uniqueness or distractor plausibility certification. Cross-type concept recurrence deliberate, no claim320 independent learning objectives.',
        'Four English-labeled relevant CQ schematics with Bengali written equivalents, author raster inspection not independent science review. Reader is offline draft only; no app import, registration, approval, publication, full application build or deployment.'
    ],
    textbookChapterRead=False,independentContentReview=False,nearDuplicateReviewComplete=False,teacherCertified=False,websiteImported=False,approved=False,published=False)
(DOC/'chapter-12-completion-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(f'Chapter 12: {counts}; {len(preserved)} earlier files identical; {len(candidates)} lexical candidates; technical {validation["result"]}')
