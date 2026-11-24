#!/usr/bin/env python3
"""Chapter-10 author/technical evidence. No independent content certification."""
import argparse
import hashlib
import json
import re
import subprocess
import unicodedata
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
BASE='ab75bb1'
DOC=ROOT/'docs/question-bank/ssc-biology'
BANK=ROOT/'content/question-bank/ssc/biology/chapter-10'
sha=lambda b:hashlib.sha256(b).hexdigest()
def read(p):return json.loads(p.read_text())
preserved={}
files=subprocess.check_output(['git','ls-tree','-r','--name-only',BASE],cwd=ROOT,text=True).splitlines()
for name in files:
    if re.match(r'content/question-bank/ssc/biology/chapter-[1-9]/',name) or re.fullmatch(r'docs/question-bank/ssc-biology/chapter-[1-9]\.html',name):
        b=subprocess.check_output(['git','show',f'{BASE}:{name}'],cwd=ROOT)
        assert b==(ROOT/name).read_bytes(),name
        preserved[name]=sha(b)
items={k.upper():read(BANK/f'rebuild-{k}.json')['items'] for k in ['mcq','cq','sq']}
counts={k:len(qs) for k,qs in items.items()}
assert counts=={'MCQ':200,'CQ':50,'SQ':70}
assert Counter(q['correct'] for q in items['MCQ'])==dict.fromkeys('ABCD',50)
source_rows={p.name:len([l for l in p.read_text().splitlines() if l and not l.startswith('#')]) for p in sorted((ROOT/'scripts/question-bank/biology').glob('chapter-10-*.txt'))}
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
assert [(c['type'],c['first'],c['second']) for c in candidates]==[('MCQ',27,42)]
for c in candidates:
    c['authorDisposition']='Retained: pituitary below brain connected to hypothalamus versus adrenal above kidneys are distinct endocrine-organ location targets, despite short location-question syntax. Not independent semantic/distractor clearance.'
parser=argparse.ArgumentParser();parser.add_argument('--test-log',type=Path);args=parser.parse_args()
validation=dict(expectedTests=88,result='PENDING_FINAL_RUN',fullAppBuildClaimed=False)
if args.test_log:
    log=args.test_log.read_bytes()
    for marker in [b'# tests 88\n',b'# pass 88\n',b'# fail 0\n']:assert marker in log,marker
    validation.update(executedTests=88,passed=88,failed=0,result='PASS',testLogSha256=sha(log),command='NODE_PATH="$PWD/.cache/biology-test-tools/node_modules" node --test tests/ssc-biology*.test.cjs')
report=dict(date='2026-11-20',chapter=10,topic='সমন্বয়',baseline=BASE,
    counts=counts,total=320,globalDraftItems=3200,remainingTargetItems=1280,
    status='ANSWERED_DRAFT_COUNT_COMPLETE_REVIEW_REQUIRED',sourceRows=source_rows,
    optionKeyCounts=dict(Counter(q['correct'] for q in items['MCQ'])),
    preservedEarlierFileHashes=preserved,preservedEarlierFileCount=len(preserved),
    diagrams=dict(files=sorted(p.name for p in (BANK/'assets').glob('*.svg')),count=5,attachedTo='Five CQ stimuli with Bengali written equivalents and English SVG labels',productionIntegration=False,inspection='All five rasterized with Resvg and visually inspected. Shoot curvature repaired to show tip bending monotonically toward left-hand light; shaded outer side elongates more. Neuron CQ labels aligned with SVG: D node, E terminals. Brain is an explicitly selected side-view regional outline, reflex a functional flow rather than anatomical cross-section. Thyroid negative-feedback line starts from hormone output, not target-tissue effect.'),
    lexicalScreen=dict(method='Same-type stem word-bigram Jaccard >=0.40; NFKC/lowercase; punctuation removed except Bengali range; all 320 chapter-10 stems',candidates=candidates,candidatePairs=len(candidates),exactUniqueStems=len({q['text'] for qs in items.values() for q in qs}),semanticCertification=False),
    technicalValidation=validation,
    incrementalBackup=dict(fileId='1ZvEIJZ33g-PmJNrDBLepbnW-bEFjitHQ',name='ssc-biology-chapter-10-authoring-checkpoint-v1.zip',bytes=23807,md5='2c2277c25d3ec67a35e118a7dd850995',independentRemoteGetVerified=True,folder='1VzEQ1ZfNNLE2ZYzEXdpS0azgiA4E8_Y5',scope='200 MCQ authoring rows only; no later CQ/SQ, diagrams, generated bank or final validation. Final full archive is separately versioned and verified.'),
    contentSafeguards=[
        'Phytohormones are signals, not fertilizer/energy replacements. Action may be local or distant; no animal-style endocrine glands/blood needed. Plant electrical signaling acknowledged without claiming animal neurons or conscious feelings.',
        'Shoot phototropism: tip sensing, auxin redistribution and differential elongation distinguished. Root/shoot auxin sensitivity differs. Gravity sensing is a signaling process, not simply contents weighing a shoot downward. Tropism direction positive/negative is not a health judgment.',
        'Darwin/Francis observations not claimed as isolation of the IAA molecule. Polar transport is a selected shoot example, not all auxin in all organs always downward. Apical dominance uses multiple signals, not auxin alone.',
        'GA internode/germination roles qualified by species, stage and other conditions; hormone deficiency versus response incapacity distinguished. Cytokinin regulates division rather than physically performing all cytokinesis. Callus division and organ differentiation distinguished.',
        'Ethylene gaseous and ripening-responsive fruit effects qualified; not every fruit responds alike and not always stem elongation. ABA stress/stomatal/dormancy roles adaptive; abscission name not sole main function. No unknown gas/carbidic ripening experiment or treated-fruit tasting.',
        'Phototropism direction differs from photoperiodic duration. Long unbroken night is often key to short-day flowering; no universal 12-hour/4–12/12–16 thresholds. Day-neutral flowering not absence of photosynthetic light need. Vernalization not arbitrary freezing or all-seed treatment.',
        'Tropism versus nastic direction distinguished. Mimosa pulvinus turgor response not immediate permanent cell elongation. School investigations use prepared data/safe observation, controls and repetition; no harsh repeated touching or unapproved growth regulators.',
        'Neuron versus nerve distinguished; glia active support, myelin not present on all axons, nodes are myelin gaps not cut axon. Generic multipolar diagram not every sensory-neuron shape. Synapse whole junction versus cleft; chemical and electrical synapses not conflated.',
        'Membrane electrical propagation versus transmitter-mediated chemical junction distinguished. Not a single parcel racing down axon, not literal airborne jumping. Reuptake/degradation/diffusion regulate duration; not every input yields spike. Numerical timings omit stated other delays and are not clinical norms.',
        'CNS brain/spinal versus peripheral pathways distinguished; 12 and 31 are nerve pairs, not individual counts. Cranial sensory/motor/mixed variety acknowledged; spinal nerves mixed. Grey/white include multiple components and deep grey nuclei also exist.',
        'Cerebrum cognition/voluntary networks, cerebellar coordination, hypothalamic homeostasis/endocrine and brainstem vital functions distinguished. Pons is hindbrain/brainstem, not simply midbrain. No crude left-logic/right-art personality claim or every function exclusive to one center.',
        'Reflex need not wait for conscious decision, but brain information/modulation remains. Some reflexes brainstem, not all spinal, not all require interneuron. Pupil is iris opening, iris constriction and eyelid blink are different. No needle/heat/laser/strong-torch test on classmates.',
        'Autonomic does not mean independent of CNS; sympathetic/parasympathetic tendencies qualified. Pheromone external same-species communication distinguished from own-body endocrine hormone; pest trap not universal guarantee.',
        'Ductless not bloodless. Target receptors and intracellular context matter; more dose not always better. Pituitary master label limited by hypothalamus/feedback and independent gland regulation. ADH/oxytocin synthesis hypothalamus versus posterior release differentiated.',
        'Thyroid location, iodine need, TSH/metabolic roles; parathyroid PTH calcium, thymus upper-chest/T-cell roles distinct. PTH/calcitonin not equal sole adult calcium controllers. Adrenal cortex/medulla differentiated; pancreas exocrine enzymes versus endocrine insulin/glucagon.',
        'Hormone levels dynamic with demand/rhythm. GH timing/plate status and height variability qualified; no appearance-based diagnosis. Congenital thyroid care timely and respectful, not stigmatizing labels. Goiter enlargement not automatically iodine deficiency; adequate iodized salt not increased salt/self-supplement.',
        'Diabetes type 1 autoimmune beta-cell loss versus type 2 resistance/relative insufficiency, any-age possibility; insulin not digestive enzyme. Urine glucose alone not adequate diagnosis. Insulin need not moral failure; low and high glucose both serious. Unconscious patient: no oral liquid/food, urgent care; prescribed rescue only by trained plan.',
        'Stroke brain emergency, ischemic versus hemorrhagic differ; sudden face-arm-speech or other focal/visual/balance signs urgent even if resolve/TIA. Record onset/last-well, do not delay or empirically give aspirin/food. No universal treatment-window cutoff or fixed recovery limit/prognosis.',
        'Paralysis may arise from CNS/peripheral pathway not just torn muscle. Seizures varied, single event not automatically epilepsy; safety/time/side if safe, no restraint/mouth object/food. First/prolonged/repeated/breathing-difficulty/injury/water episodes need urgent help.',
        'Parkinson dopamine circuits not direct muscle dopamine signaling; young-onset not always inherited and tremor alone not diagnosis. Drug reward/signal effects vary; nicotine dependence separate from CO oxygen transport. Health support/privacy, no family blame or all-users-criminal claim; some withdrawal dangerous so supervised individualized care.'
    ],
    limitations=[
        'BiologyBD chapter-10 all six returned chunks 0–5 read, secondary OCR not official NCTB edition/page verification. Missing exercise images not copied or given invented labels. All 320 items original practice, no board/school/year attribution.',
        'Selected OpenStax chunks only: plant responses 30.6 (1–4), neurons 35.1 (1–2), communication 35.2 (2–3), CNS 35.3 (2–3), PNS 35.4 (2), hormone mechanisms 37.2 (1), endocrine glands 37.5 (2–3). Not entire textbook or entire sections.',
        'Source errors/simplifications not copied: Darwin isolated auxin, IAA only natural auxin, animal hormones act alone, all roots/shoots always one direction, fixed critical daylength, all auxin moves down, ethylene always elongates, all reflexes spinal, no brain control of ANS, synapse only axon-dendrite, neurilemma/myelin gap conflation, fixed 100 m/s, cortex only cell bodies.',
        'Also not copied: OpenStax figure minus seventy volts (mV intended), every dendritic signal an action potential, all sodium channels at once and every synapse sodium-only, universal olfactory brainstem projection, simplistic neurotransmitter effects, incomplete endocrine anatomy/table generalizations. Exact voltage/ion drug-treatment details not authored.',
        'Public-health pages checked for background: NIDDK diabetes overview chunk0, hypoglycemia chunk1, hypothyroidism chunks0–1; NHLBI stroke complete returned chunk0; CDC stroke/seizure/tobacco/smoking-cessation chunk0 each; NIA Parkinson chunk0; NIDA brain/drugs chunk0. No US phone numbers, screening rules or prescription tables transplanted as local Bangladesh instructions.',
        'NINDS stroke route returned empty disorder listing, not used as clinical evidence. NIDA tobacco overview and CDC smokeless route failed fetch, not cited as successfully read. No unrelated website modernization/political banner content used.',
        'Corrected hazardous secondary advice to pour sugar water into unconscious people, stop treatment, conflate urine tests with definitive diabetes diagnosis, all diabetes only reduced insulin secretion, all thyroid disease fixed by foods, stroke bleeding untreatable and recovery stopping after two months. Current material teaches emergency referral, not individual treatment.',
        'Enrichment: photoreceptors/statoliths, historical experiment controls, hormone-ratio tissue culture, parthenocarpy mechanisms, advanced photoperiod logic, myelin/node physiology, action-potential threshold, receptor/signaling, autonomic branches, numerical timing/percentages, detailed feedback and selected clinical distinctions. Independent SSC depth/terminology alignment remains open.',
        'One lexical location-syntax pair author-retained for different organs/locations. Not independent semantic uniqueness; concepts intentionally recur across types. Distractor plausibility, independent objective coverage and CQ higher-order quality still require teacher/content review.',
        'Five original English-labeled diagrams with Bengali written equivalents illustrate relevant selected mechanisms, not reconstruction of every official figure or production integration. Regional brain outline not precise section; reflex chart not full anatomy; thyroid chart normal model not diagnostic/dose algorithm.',
        'No independent teacher/content certification, official textbook full reading, full app build, import, approval, publication or deployment.'
    ],
    textbookChapterRead=False,independentContentReview=False,nearDuplicateReviewComplete=False,teacherCertified=False,websiteImported=False,approved=False,published=False)
(DOC/'chapter-10-completion-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(f'Chapter 10: {counts}; {len(preserved)} earlier files identical; {len(candidates)} lexical candidates; technical {validation["result"]}')
