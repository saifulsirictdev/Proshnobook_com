#!/usr/bin/env python3
"""Rebuild only evidenced Biology drafts. Offline; no app registry or DB writes.

Surviving concept cards supply one recognition MCQ and one application/boundary
SQ each, ONLY for chapters 2–5. CQs and reasoning MCQs are individually authored.
These are review drafts, not independent-objective or teacher-certification claims.
"""
import argparse
import base64
import xml.etree.ElementTree as ET
import hashlib
import html
import json
import random
import re
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
INPUT = ROOT / 'scripts/question-bank/biology'
OUT = ROOT / 'content/question-bank/ssc/biology'
DOC = ROOT / 'docs/question-bank/ssc-biology'
TARGET = {'MCQ': 200, 'CQ': 50, 'SQ': 70}
DATE = '2026-11-20'
DIGESTION = 'https://openstax.org/books/biology-2e/pages/34-3-digestive-system-processes'


def enc(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()


def digest(value):
    return hashlib.sha256(value).hexdigest()


def norm(text):
    return re.sub(r'\s+', ' ', unicodedata.normalize('NFKC', text).lower()).strip()


def rows(pattern, width):
    for p in sorted(INPUT.glob(pattern)):
        for i, line in enumerate(p.read_text().splitlines(), 1):
            if not line.strip() or line.startswith('#'):
                continue
            fields = line.split('|')
            if len(fields) != width or any(not f.strip() for f in fields):
                raise ValueError(f'{p.name}:{i}: expected {width} nonempty fields')
            yield int(fields[0]), fields[1:], f'{p.relative_to(ROOT)}:{i}'


def topics():
    text = (ROOT / 'lib/nctb-data.ts').read_text()
    match = re.search(r'\{ name: "জীববিজ্ঞান", chapters: (\[[^\n]+?\]) \}', text)
    result = json.loads(match[1])
    assert len(result) == 14
    return result


def common(kind, stem, solution):
    return dict(type=kind, text=stem, explanation=solution,
                page='নিজস্ব খসড়া; মূল বইয়ের পৃষ্ঠা অযাচাইকৃত', difficulty='MEDIUM')


def render(topic, groups):
    lines = [f'# {topic}', '', '> উত্তরসহ পর্যালোচনাধীন খসড়া; সংখ্যাগত লক্ষ্য অপূর্ণ।',
             '> মূল বই ও বিষয়বিশেষজ্ঞের পূর্ণ যাচাই বাকি। বোর্ড/স্কুল/সাল দাবি নেই।', '']
    for filename, batch in groups:
        lines += [f'## {filename}', '']
        for i, q in enumerate(batch['items'], 1):
            lines += [f"### {q['type']} {i}", '', q['text'], '']
            if q['type'] == 'MCQ':
                lines += [f'{k}. {v}' for k, v in q['options'].items()]
                lines += ['', f"উত্তর: {q['correct']} — {q['options'][q['correct']]}", q['explanation'], '']
            elif q['type'] == 'SQ':
                lines += ['নমুনা উত্তর: ' + q['explanation'], '']
            else:
                for part in q['parts']:
                    lines += [f"{part['label']}. {part['question']} [{part['marks']}]", part['solution'], '']
    return ('\n'.join(lines).rstrip() + '\n').encode()


def build():
    names = topics()
    questions = defaultdict(lambda: defaultdict(list))
    refs = defaultdict(lambda: defaultdict(list))
    for chapter, fields, ref in rows('concepts-*.txt', 6):
        if not 2 <= chapter <= 5:
            continue  # chapter-1 starter already probes these same objectives
        term, definition, role, case, boundary = fields
        refs[chapter]['concepts'].append((term, definition, role, case, boundary, ref))
    for chapter in range(2, 6):
        cards = refs[chapter]['concepts']
        if len({norm(c[0]) for c in cards}) != len(cards):
            raise ValueError('duplicate concept term')
        for i, (term, definition, role, case, boundary, ref) in enumerate(cards):
            wrong = [c[0] for j, c in enumerate(cards) if j != i]
            random.Random(chapter * 100 + i).shuffle(wrong)
            q = common('MCQ', f'“{definition}”—বর্ণনাটি কোন ধারণা বা গঠন নির্দেশ করে?',
                       f'{term}: {role}। সীমা: {boundary}।')
            q.update(options=dict(zip('ABCD', [term, *wrong[:3]])), correct='A')
            questions[chapter]['MCQ'].append((q, ref, True, 'concept:' + term))
            q = common('SQ', f'{case}। সংশ্লিষ্ট ধারণা বা গঠনটি শনাক্ত করে তার ভূমিকা এবং একটি গুরুত্বপূর্ণ সীমা লেখো।',
                       f'প্রাসঙ্গিক ধারণা: {term}। ভূমিকা: {role}। সতর্কতা: {boundary}।')
            questions[chapter]['SQ'].append((q, ref, True, 'concept:' + term))
    for chapter, fields, ref in [*rows('rebuild-mcq.txt', 8), *rows('chapter-1-mcq.txt', 8), *rows('chapter-1-completion-mcq.txt', 8), *rows('chapter-2-mcq*.txt', 8), *rows('chapter-3-mcq*.txt', 8), *rows('chapter-4-mcq*.txt', 8), *rows('chapter-5-mcq*.txt', 8), *rows('chapter-6-mcq*.txt', 8), *rows('chapter-7-mcq*.txt', 8), *rows('chapter-8-mcq*.txt', 8), *rows('chapter-9-mcq*.txt', 8), *rows('chapter-10-mcq*.txt', 8), *rows('chapter-11-mcq*.txt', 8), *rows('chapter-12-mcq*.txt', 8)]:
        stem, answer, b, c, d, explanation, section = fields
        q = common('MCQ', stem, explanation)
        q.update(options=dict(zip('ABCD', [answer, b, c, d])), correct='A')
        questions[chapter]['MCQ'].append((q, ref, False, section))
    for chapter, fields, ref in [*rows('rebuild-cq.txt', 11), *rows('chapter-1-cq.txt', 11), *rows('chapter-1-completion-cq.txt', 11), *rows('chapter-2-cq*.txt', 11), *rows('chapter-3-cq*.txt', 11), *rows('chapter-4-cq*.txt', 11), *rows('chapter-5-cq*.txt', 11), *rows('chapter-6-cq*.txt', 11), *rows('chapter-7-cq*.txt', 11), *rows('chapter-8-cq*.txt', 11), *rows('chapter-9-cq*.txt', 11), *rows('chapter-10-cq*.txt', 11), *rows('chapter-11-cq*.txt', 11), *rows('chapter-12-cq*.txt', 11)]:
        stimulus, *parts, section = fields
        q = common('CQ', stimulus, 'নিজস্ব স্বয়ংসম্পূর্ণ উদ্দীপকের নমুনা সমাধান; শিক্ষক-পর্যালোচনা বাকি।')
        q['parts'] = [dict(label=label, question=parts[2*i], solution=parts[2*i+1], marks=i+1)
                      for i, label in enumerate('কখগঘ')]
        questions[chapter]['CQ'].append((q, ref, False, section))
    for chapter, fields, ref in [*rows('chapter-1-sq.txt', 4), *rows('chapter-1-completion-sq.txt', 4), *rows('chapter-2-sq.txt', 4), *rows('chapter-3-sq.txt', 4), *rows('chapter-4-sq.txt', 4), *rows('chapter-5-sq.txt', 4), *rows('chapter-6-sq.txt', 4), *rows('chapter-7-sq.txt', 4), *rows('chapter-8-sq.txt', 4), *rows('chapter-9-sq.txt', 4), *rows('chapter-10-sq.txt', 4), *rows('chapter-11-sq.txt', 4), *rows('chapter-12-sq.txt', 4)]:
        assert chapter in (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)
        stem, answer, section = fields
        questions[chapter]['SQ'].append((common('SQ', stem, answer), ref, False, section))
    generated, reports, reader = {}, [], []
    global_ids = set()
    for chapter, topic in enumerate(names, 1):
        groups, ledger = [], []
        folder = OUT / f'chapter-{chapter}'
        if chapter == 1:
            for kind in ['mcq', 'cq', 'sq']:
                path = folder / f'{kind}.json'
                data = json.loads(path.read_text())
                groups.append((path.name, data))
                for i, q in enumerate(data['items'], 1):
                    ledger.append(dict(file=path.name, index=i, id=f"bio-1-{kind}-{digest(q['text'].encode())[:16]}",
                                       stemSha256=digest(q['text'].encode()), origin='original_practice',
                                       authoringRefs=['scripts/question-bank/build-ssc-biology-ch1.py'],
                                       generatedFromConceptCards=False, objective='starter',
                                       backgroundSources=['https://www.biologybd.com/9t1.html'],
                                       sourceExercise=None, teacherCertified=False, independentContentReview=False))
        for kind, authored in questions[chapter].items():
            if kind == 'MCQ':
                # Completed/active chapters retain their original 30 MCQ option order.
                # Shuffle additions separately so expanding a bank never rewrites them.
                segments = [authored[:30], authored[30:]] if chapter in (2, 3, 4, 5) else [authored]
                for segment_index, segment in enumerate(segments):
                    rng = random.Random(20261120 + chapter + 10000 * segment_index)
                    if chapter in (2, 3, 4, 5) and segment_index == 1:
                        used = Counter(q['correct'] for q, _, _, _ in authored[:30])
                        keys = [key for key in 'ABCD' for _ in range(50 - used[key])]
                    else:
                        keys = list(('ABCD' * ((len(segment)+3)//4))[:len(segment)])
                    rng.shuffle(keys)
                    for (q, _, _, _), key in zip(segment, keys):
                        answer = q['options']['A']
                        wrong = [q['options'][k] for k in 'BCD']
                        rng.shuffle(wrong)
                        q['options'] = {k: answer if k == key else wrong.pop() for k in 'ABCD'}
                        q['correct'] = key
            filename = f'chapter-work-{kind.lower()}.json' if chapter == 1 else f'rebuild-{kind.lower()}.json'
            data = dict(category='Class 9', subject='জীববিজ্ঞান', topic=topic,
                        book='SSC জীববিজ্ঞান — পুনর্গঠিত নিজস্ব অনুশীলনী',
                        edition='খসড়া; মূল বই ও শিক্ষক-পর্যালোচনা বাকি',
                        sourceUrl=f'https://www.biologybd.com/9t{chapter}.html', lang='Bangla',
                        items=[a[0] for a in authored])
            groups.append((filename, data))
            generated[folder / filename] = enc(data)
            for i, (q, ref, template, section) in enumerate(authored, 1):
                sources = [data['sourceUrl']]
                if 'chapter-1-completion-' in ref and any(s in section for s in ['1.4', '1.5']):
                    sources.append('https://openstax.org/books/biology-2e/pages/20-1-organizing-life-on-earth')
                if 'প্রজাতির জৈবিক ধারণায়' in q['text']:
                    sources.append('https://openstax.org/books/biology-2e/pages/18-2-formation-of-new-species')
                if chapter == 3 and 'chapter-3-' in ref:
                    sources.append('https://openstax.org/books/biology-2e/pages/' + ('11-1-the-process-of-meiosis' if section.startswith('3.3') else '10-2-the-cell-cycle'))
                if chapter == 4 and 'chapter-4-' in ref:
                    if section.startswith('4.1'):
                        background = '6-4-atp-adenosine-triphosphate'
                    elif section.startswith('4.2'):
                        background = '8-3-using-light-energy-to-make-organic-molecules' if section.startswith('4.2.1') else '8-2-the-light-dependent-reactions-of-photosynthesis'
                    else:
                        # Both the whole pathway and the alternative NAD+ regeneration
                        # mechanism were checked; these are background, not copied exercises.
                        background = '7-3-oxidation-of-pyruvate-and-the-citric-acid-cycle'
                        sources.extend('https://openstax.org/books/biology-2e/pages/' + name for name in ['7-2-glycolysis', '7-4-oxidative-phosphorylation', '7-5-metabolism-without-oxygen'])
                    sources.append('https://openstax.org/books/biology-2e/pages/' + background)
                if 'OS-digestion' in section:
                    sources.append(DIGESTION)
                elif chapter == 5 and template:
                    # Plant/mineral and digestion background checked separately.
                    if section.split(':', 1)[-1] in ['লালার অ্যামাইলেজ', 'পেপসিন', 'পিত্ত', 'ট্রিপসিন', 'লাইপেজ', 'ভিলাস']:
                        sources.append(DIGESTION)
                if chapter == 5 and 'chapter-5-' in ref:
                    if section.startswith('5.1'):
                        sources.append('https://openstax.org/books/biology-2e/pages/31-1-nutritional-requirements-of-plants')
                    elif ':BMI' in section:
                        sources.append('https://www.cdc.gov/bmi/about/index.html')
                    elif ':safety' in section:
                        sources.append('https://www.who.int/news-room/fact-sheets/detail/food-safety')
                    else:
                        sources.append('https://openstax.org/books/biology-2e/pages/34-2-nutrition-and-energy-production')
                    if 'OS-digestion' in section:
                        sources.append('https://openstax.org/books/biology-2e/pages/34-1-digestive-systems')
                if chapter == 6:
                    if section.startswith(('6.1', '6.2')):
                        sources.append('https://openstax.org/books/biology-2e/pages/30-5-transport-of-water-and-solutes-in-plants')
                    elif ':ABO' in section:
                        sources.append('https://www.redcrossblood.org/donate-blood/blood-types.html')
                    elif ':BP' in section or section.startswith('6.5'):
                        sources.append('https://www.who.int/news-room/fact-sheets/detail/hypertension')
                    elif section.startswith('6.3'):
                        sources.append('https://openstax.org/books/biology-2e/pages/40-2-components-of-the-blood')
                    else:
                        sources.append('https://openstax.org/books/biology-2e/pages/40-3-mammalian-heart-and-blood-vessels')
                    if ':BP' in section:
                        sources.append('https://www.cdc.gov/high-blood-pressure/measure/index.html')
                    if section.startswith('6.5'):
                        sources.extend(['https://www.cdc.gov/cholesterol/about/index.html', 'https://www.cdc.gov/group-a-strep/about/rheumatic-fever.html', 'https://www.cancer.gov/types/leukemia', 'https://www.cdc.gov/heart-disease/about/heart-attack.html', 'https://www.cdc.gov/stroke/about/index.html'])
                    if section.startswith('6.4') or 'লসিক' in q['text']:
                        sources.append('https://openstax.org/books/biology-2e/pages/40-4-blood-flow-and-blood-pressure-regulation')
                if chapter == 7:
                    if section.startswith('7.1'):
                        sources.append('https://openstax.org/books/biology-2e/pages/30-5-transport-of-water-and-solutes-in-plants')
                    elif section.startswith('7.2'):
                        sources.extend(['https://openstax.org/books/biology-2e/pages/39-1-systems-of-gas-exchange', 'https://openstax.org/books/biology-2e/pages/39-2-gas-exchange-across-respiratory-surfaces', 'https://openstax.org/books/biology-2e/pages/39-3-breathing', 'https://openstax.org/books/biology-2e/pages/39-4-transport-of-gases-in-human-bodily-fluids'])
                    else:
                        health_sources = {':asthma': 'https://www.who.int/news-room/fact-sheets/detail/asthma', ':TB': 'https://www.who.int/news-room/fact-sheets/detail/tuberculosis', ':bronchitis': 'https://www.cdc.gov/acute-bronchitis/about/index.html', ':pneumonia': 'https://www.who.int/news-room/fact-sheets/detail/pneumonia', ':cancer': 'https://www.who.int/news-room/fact-sheets/detail/lung-cancer', ':pollution': 'https://www.who.int/news-room/fact-sheets/detail/household-air-pollution-and-health'}
                        sources.extend(url for key, url in health_sources.items() if key in section)
                        if ':pollution' in section:
                            sources.extend(['https://www.cdc.gov/carbon-monoxide/about/index.html', 'https://openstax.org/books/biology-2e/pages/39-4-transport-of-gases-in-human-bodily-fluids'])
                if chapter == 8:
                    sources.append('https://www.niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work')
                    if section.startswith(('8.1', '8.2')):
                        sources.append('https://openstax.org/books/biology-2e/pages/41-2-the-kidneys-and-osmoregulatory-organs')
                    elif section.startswith('8.3'):
                        sources.append('https://openstax.org/books/biology-2e/pages/41-5-hormonal-control-of-osmoregulatory-functions')
                    elif section.startswith('8.4'):
                        sources.extend(['https://www.niddk.nih.gov/health-information/urologic-diseases/kidney-stones', 'https://www.niddk.nih.gov/health-information/kidney-disease/chronic-kidney-disease-ckd/tests-diagnosis'])
                    elif section.startswith('8.5'):
                        sources.append('https://www.niddk.nih.gov/health-information/kidney-disease/kidney-failure/hemodialysis')
                    else:
                        sources.append('https://www.niddk.nih.gov/health-information/kidney-disease/kidney-failure/kidney-transplant')
                if chapter == 9:
                    if section.startswith('9.1'):
                        sources.extend('https://openstax.org/books/biology-2e/pages/' + x for x in ['38-1-types-of-skeletal-systems', '38-2-bone', '38-3-joints-and-skeletal-movement'])
                    elif section.startswith('9.2'):
                        sources.extend('https://openstax.org/books/biology-2e/pages/' + x for x in ['38-3-joints-and-skeletal-movement', '38-4-muscle-contraction-and-locomotion'])
                    else:
                        sources.append('https://www.niams.nih.gov/health-topics/' + ('sports-injuries' if ':injury' in section else 'osteoporosis'))
                        if ':RA' in section:
                            sources.extend(['https://www.niams.nih.gov/health-topics/rheumatoid-arthritis', 'https://www.niams.nih.gov/health-topics/rheumatoid-arthritis/diagnosis-treatment-and-steps-to-take'])
                        if ':OA' in section:
                            sources.append('https://www.niams.nih.gov/health-topics/osteoarthritis')
                        if ':OP' in section:
                            sources.append('https://www.niams.nih.gov/health-topics/osteoporosis/diagnosis-treatment-and-steps-to-take')
                if chapter == 10:
                    pages = {'10.1': ['30-6-plant-sensory-systems-and-responses'],
                             '10.2': ['35-4-the-peripheral-nervous-system', '37-2-how-hormones-work'],
                             '10.3': ['35-1-neurons-and-glial-cells', '35-2-how-neurons-communicate', '35-3-the-central-nervous-system', '35-4-the-peripheral-nervous-system'],
                             '10.4': ['37-2-how-hormones-work', '37-5-endocrine-glands']}
                    sources.extend('https://openstax.org/books/biology-2e/pages/' + p for p in pages.get(section.split(':')[0], []))
                    special = {':thyroid': 'https://www.niddk.nih.gov/health-information/endocrine-diseases/hypothyroidism',
                               ':diabetes': 'https://www.niddk.nih.gov/health-information/diabetes/overview/what-is-diabetes',
                               ':stroke': 'https://www.cdc.gov/stroke/signs-symptoms/index.html',
                               ':seizure': 'https://www.cdc.gov/epilepsy/first-aid-for-seizures/index.html',
                               ':Parkinson': 'https://www.nia.nih.gov/health/parkinsons-disease/parkinsons-disease-causes-symptoms-and-treatments'}
                    for tag, url in special.items():
                        if tag in section:
                            sources.append(url)
                    if ':diabetes' in section:
                        sources.append('https://www.niddk.nih.gov/health-information/diabetes/overview/preventing-problems/low-blood-glucose-hypoglycemia')
                    if ':stroke' in section:
                        sources.append('https://www.nhlbi.nih.gov/health/stroke')
                    if section.startswith('10.5') or section.startswith('10.6'):
                        sources.append('https://openstax.org/books/biology-2e/pages/37-5-endocrine-glands' if section.startswith('10.5') else 'https://openstax.org/books/biology-2e/pages/35-3-the-central-nervous-system')
                    if section.startswith('10.7'):
                        sources.extend(['https://nida.nih.gov/publications/drugs-brains-behavior-science-addiction/drugs-brain', 'https://www.cdc.gov/tobacco/about/index.html', 'https://www.cdc.gov/tobacco/about/how-to-quit.html'])
                if chapter == 11:
                    route = {'11.1': ['43-1-reproduction-methods'],
                             '11.2.1': ['32-1-reproductive-development-and-structure'],
                             '11.2.2': ['32-1-reproductive-development-and-structure', '32-2-pollination-and-fertilization'],
                             '11.2.3': ['32-2-pollination-and-fertilization'],
                             '11.3': ['43-1-reproduction-methods'],
                             '11.3.1': ['43-2-fertilization', '43-3-human-reproductive-anatomy-and-gametogenesis'],
                             '11.3.2': ['43-3-human-reproductive-anatomy-and-gametogenesis', '43-4-hormonal-control-of-human-reproduction'],
                             '11.3.3': ['43-5-human-pregnancy-and-birth']}
                    sources.extend('https://openstax.org/books/biology-2e/pages/' + p for p in route.get(section.split(':')[0], []))
                    if 'পার্থেনোজেনেসিস' in q['text']:
                        sources.append('https://openstax.org/books/biology-2e/pages/43-1-reproduction-methods')
                    if section.startswith('11.4'):
                        sources.append('https://www.who.int/news-room/fact-sheets/detail/hiv-aids')
                if chapter == 12:
                    base = 'https://openstax.org/books/biology-2e/pages/'
                    if ':mendel' in section:
                        sources.append(base + '12-2-characteristics-and-traits')
                    elif section.startswith('12.1.1'):
                        sources.append(base + ('14-3-basics-of-dna-replication' if ':replication' in section else '14-2-dna-structure-and-sequencing'))
                    if ':expression' in section:
                        sources.append('https://www.biologybd.com/9t12.html')
                    if section.startswith('12.1.2'):
                        sources.extend(['https://medlineplus.gov/genetics/understanding/testing/genetictesting/',
                                        'https://www.genome.gov/about-genomics/policy-issues/Privacy'])
                    if section.startswith('12.3'):
                        if ':color' in section:
                            sources.append('https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/color-blindness')
                        elif ':thal' in section:
                            sources.extend(['https://www.nhlbi.nih.gov/health/thalassemia/causes', 'https://www.nhlbi.nih.gov/health/thalassemia/treatment'])
                        elif ':hemo' in section:
                            sources.append('https://www.cdc.gov/hemophilia/about/index.html')
                    if section.startswith('12.4'):
                        sources.extend([base + '18-1-understanding-evolution', base + '18-2-formation-of-new-species'])
                        if section.startswith('12.4:') or 'frequency' in q['text'].lower():
                            sources.append(base + '19-1-population-evolution')
                    sources = list(dict.fromkeys(sources))
                ledger.append(dict(file=filename, index=i, id=f"bio-{chapter}-{kind.lower()}-{digest(q['text'].encode())[:16]}",
                                   stemSha256=digest(q['text'].encode()),
                                   origin='web_exercise_adaptation' if section.startswith('exercise:') else 'original_practice',
                                   authoringRefs=[ref], generatedFromConceptCards=template, objective=section,
                                   backgroundSources=sources,
                                   sourceExercise=section.split(';')[0][len('exercise:'):] if section.startswith('exercise:') else None,
                                   teacherCertified=False, independentContentReview=False))
        counts = Counter()
        stems = set()
        for filename, data in groups:
            assert len(data['items']) <= 200
            assert len(enc(data)) <= 750000
            for q in data['items']:
                stem = norm(q['text'])
                assert stem not in stems, f'duplicate stem: chapter {chapter}'
                stems.add(stem)
                counts[q['type']] += 1
                assert q['explanation'].strip()
                if q['type'] == 'MCQ':
                    assert len({norm(v) for v in q['options'].values()}) == 4
                if q['type'] == 'CQ':
                    assert [p['marks'] for p in q['parts']] == [1, 2, 3, 4]
                    assert all(len(p['solution']) > 20 for p in q['parts'])
        counts = {k: counts[k] for k in TARGET}
        assert all(counts[k] <= TARGET[k] for k in TARGET)
        for entry in ledger:
            assert entry['id'] not in global_ids
            global_ids.add(entry['id'])
            q = dict(groups)[entry['file']]['items'][entry['index']-1]
            figure = None
            if '![' in q['text']:
                match = re.search(r'!\[([^]\n]+)\]\((assets/[a-z-]+\.svg)\)', q['text'])
                registered = {1: {'assets/classification-tree.svg'}, 2: {'assets/plant-cell.svg', 'assets/mitochondrion.svg', 'assets/neuron.svg'}, 3: {'assets/mitotic-metaphase.svg', 'assets/mitotic-anaphase.svg', 'assets/meiotic-anaphase.svg'}, 4: {'assets/chloroplast-stages.svg', 'assets/light-starch-test.svg', 'assets/respiratory-coupling.svg'}, 5: {'assets/digestive-routes.svg', 'assets/villus-transport.svg', 'assets/fat-digestion.svg'}, 6: {'assets/xylem-tension.svg', 'assets/double-circulation.svg', 'assets/vessel-functions.svg'}, 7: {'assets/respiratory-route.svg', 'assets/alveolar-exchange.svg', 'assets/inspiration-mechanism.svg'}, 8: {'assets/kidney-section.svg', 'assets/nephron-pathways.svg', 'assets/dialyzer-exchange.svg'}, 9: {'assets/skeleton-regions.svg', 'assets/synovial-joint.svg', 'assets/elbow-antagonists.svg'}, 10: {'assets/shoot-phototropism.svg', 'assets/neuron-signaling.svg', 'assets/brain-regions.svg', 'assets/withdrawal-reflex.svg', 'assets/thyroid-feedback.svg'}, 11: {'assets/flower-section.svg', 'assets/embryo-sac.svg', 'assets/human-development-route.svg', 'assets/placental-exchange.svg'}, 12: {'assets/dna-pairing.svg', 'assets/mendel-grid.svg', 'assets/replication-strands.svg', 'assets/ancestry-tree.svg'}}
                assert match and match[2] in registered.get(chapter, set()), 'unregistered figure reference'
                asset = folder / match[2]
                image = asset.read_bytes()
                document = ET.fromstring(image)
                allowed = {'svg', 'title', 'desc', 'rect', 'g', 'text', 'path'}
                for element in document.iter():
                    assert element.tag.split('}')[-1] in allowed
                    assert all(not k.lower().startswith('on') and k.split('}')[-1] not in {'href', 'src'}
                               and 'url(' not in v.lower() for k, v in element.attrib.items())
                entry['figure'] = dict(path=str(asset.relative_to(ROOT)), sha256=digest(image),
                                       alt=match[1], origin='original_editorial_diagram', teacherCertified=False)
                figure = dict(alt=match[1], dataUri='data:image/svg+xml;base64,' + base64.b64encode(image).decode())
            record = dict(chapter=chapter, topic=topic, id=entry['id'], item=q, evidence=entry)
            if figure:
                record['figure'] = figure
            reader.append(record)
        report = dict(chapter=chapter, topic=topic, counts=counts, targets=TARGET,
                      remaining={k: TARGET[k]-counts[k] for k in TARGET},
                      targetMet=counts == TARGET,
                      status='COUNT_TARGET_MET_REVIEW_REQUIRED' if counts == TARGET else 'INCOMPLETE_REVIEW_DRAFT',
                      independentContentReview=False, nearDuplicateReviewComplete=False,
                      teacherCertified=False, textbookChapterRead=False,
                      websiteImported=False, approved=False, published=False)
        if groups:
            generated[folder / 'source-ledger.json'] = enc(dict(entries=ledger))
            generated[folder / 'questions.md'] = render(topic, groups)
            if chapter in (2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12) and counts == TARGET:
                generated[folder / 'questions.md'] = generated[folder / 'questions.md'].replace('সংখ্যাগত লক্ষ্য অপূর্ণ।'.encode(), 'নির্ধারিত সংখ্যার উত্তরসহ খসড়া সম্পূর্ণ; বিষয়বস্তু পর্যালোচনা বাকি।'.encode())
            report['files'] = {filename: dict(bytes=len(enc(data)), sha256=digest(enc(data))) for filename, data in groups}
            generated[folder / 'draft-validation.json'] = enc(report)
        reports.append(report)
    totals = {k: sum(c['counts'][k] for c in reports) for k in TARGET}
    progress = dict(date=DATE, countsBasis='files-rebuilt-and-validated-not-historical-chat-counts',
                    chapters=reports, totals=totals, targets={k: v*14 for k, v in TARGET.items()},
                    remaining={k: TARGET[k]*14-totals[k] for k in TARGET},
                    draftItems=sum(totals.values()), targetItems=4480,
                    allChapterTargetsMet=all(c['targetMet'] for c in reports),
                    independentContentReview=False, nearDuplicateReviewComplete=False,
                    teacherCertified=False, approved=False, published=False, websiteImported=False)
    generated[DOC / 'progress.json'] = enc(progress)
    batches = []
    for number, chapters in enumerate([list(range(1, 6)), list(range(6, 11)), list(range(11, 15))], 1):
        selected = [c for c in reports if c['chapter'] in chapters]
        existing = {k: sum(c['counts'][k] for c in selected) for k in TARGET}
        remaining = {k: sum(c['remaining'][k] for c in selected) for k in TARGET}
        batches.append(dict(batch=number, chapters=chapters, status='COUNT_TARGET_MET_REVIEW_REQUIRED' if not any(remaining.values()) else ('IN_PROGRESS' if sum(existing.values()) else 'QUEUED'),
                            existingDrafts=existing, remainingQuestions=remaining,
                            remainingTotal=sum(remaining.values()), countTargetMet=not any(remaining.values()),
                            contentReviewComplete=False, complete=False))
    generated[DOC / 'batch-plan.json'] = enc(dict(executionOrder=[1, 2, 3], batches=batches, activeChapter=12, workflow='ONE_CHAPTER_AT_A_TIME', publicationAuthorized=False))
    lines = ['# SSC জীববিজ্ঞান — যাচাইকৃত ফাইলভিত্তিক অগ্রগতি', '',
             f"উত্তরসহ খসড়া: {progress['draftItems']}/4480। পূর্ণ বই, শিক্ষক ও পুনরাবৃত্তি যাচাই বাকি।", '',
             '| অধ্যায় | MCQ | CQ | SQ | বাকি |', '|---|---:|---:|---:|---:|']
    for c in reports:
        lines.append(f"| {c['chapter']} | {c['counts']['MCQ']} | {c['counts']['CQ']} | {c['counts']['SQ']} | {sum(c['remaining'].values())} |")
    workflow_note = 'অধ্যায় ১–১২-এর নির্ধারিত উত্তরসহ খসড়া সম্পূর্ণ: প্রতিটিতে ২০০ MCQ / ৫০ CQ / ৭০ SQ। এই ধাপে অধ্যায় ১–১১-এর প্রশ্ন ও পাঠক অপরিবর্তিত। শিক্ষক ও স্বাধীন বিষয়বস্তু পর্যালোচনা বাকি; প্রকাশিত নয়।'
    lines += ['', workflow_note, '', '## ব্যাচ পরিকল্পনা', '']
    for b in batches:
        lines.append(f"- ব্যাচ {b['batch']}: অধ্যায় {b['chapters'][0]}–{b['chapters'][-1]}, বাকি {b['remainingTotal']} প্রশ্ন; {b['status']}।")
    lines += ['', 'আগের কথোপকথনের বড় সংখ্যাকে উদ্ধারকৃত ফাইল হিসেবে গণনা করা হয়নি। কোনো প্রকাশনা হয়নি।', '']
    generated[DOC / 'PROGRESS.md'] = '\n'.join(lines).encode()
    generated[DOC / 'BATCH-PLAN.md'] = ('# ধারাবাহিক ব্যাচ পরিকল্পনা\n\n' + '\n'.join(lines[lines.index('## ব্যাচ পরিকল্পনা')+1:])).encode()
    bank = json.dumps(reader, ensure_ascii=False).replace('<', '\\u003c').replace('&', '\\u0026')
    template = (INPUT / 'reader-template.html').read_text()
    current_template = (INPUT / 'reader-template-ch3.html').read_text()
    active_template = (INPUT / 'reader-template-ch4.html').read_text()
    chapter_five_template = (INPUT / 'reader-template-ch5.html').read_text()
    chapter_six_template = (INPUT / 'reader-template-ch6.html').read_text()
    chapter_seven_template = (INPUT / 'reader-template-ch7.html').read_text()
    chapter_eight_template = (INPUT / 'reader-template-ch8.html').read_text()
    chapter_nine_template = (INPUT / 'reader-template-ch9.html').read_text()
    chapter_ten_template = (INPUT / 'reader-template-ch10.html').read_text()
    chapter_eleven_template = (INPUT / 'reader-template-ch11.html').read_text()
    chapter_twelve_template = (INPUT / 'reader-template-ch12.html').read_text()
    generated[DOC / 'questions.html'] = chapter_twelve_template.replace('__BANK_JSON__', bank).encode()
    chapter_one = json.dumps([r for r in reader if r['chapter'] == 1], ensure_ascii=False).replace('<', '\\u003c').replace('&', '\\u0026')
    # Keep the completed chapter-1 reader byte-identical to its verified snapshot.
    original_template = template.replace('বর্তমান কাজ: অধ্যায় ২—জীব কোষ ও টিস্যু', 'বর্তমান কাজ: অধ্যায় ১—জীবন পাঠ').replace('অধ্যায় ১ ও ২-এর উত্তরসহ খসড়া সম্পূর্ণ: প্রতিটিতে ২০০ MCQ + ৫০ CQ + ৭০ SQ।', 'অধ্যায় ১-এর উত্তরসহ খসড়া সম্পূর্ণ: ২০০ MCQ + ৫০ CQ + ৭০ SQ।')
    original_template = original_template.replace(r'assets\/[a-z-]+\.svg', r'assets\/classification-tree\.svg')
    generated[DOC / 'chapter-1.html'] = original_template.replace('__BANK_JSON__', chapter_one).encode()
    chapter_two = json.dumps([r for r in reader if r['chapter'] == 2], ensure_ascii=False).replace('<', '\\u003c').replace('&', '\\u0026')
    generated[DOC / 'chapter-2.html'] = template.replace('__BANK_JSON__', chapter_two).encode()
    chapter_three = json.dumps([r for r in reader if r['chapter'] == 3], ensure_ascii=False).replace('<', '\\u003c').replace('&', '\\u0026')
    generated[DOC / 'chapter-3.html'] = current_template.replace('__BANK_JSON__', chapter_three).encode()
    chapter_four = json.dumps([r for r in reader if r['chapter'] == 4], ensure_ascii=False).replace('<', '\\u003c').replace('&', '\\u0026')
    generated[DOC / 'chapter-4.html'] = active_template.replace('__BANK_JSON__', chapter_four).encode()
    chapter_five = json.dumps([r for r in reader if r['chapter'] == 5], ensure_ascii=False).replace('<', '\\u003c').replace('&', '\\u0026')
    generated[DOC / 'chapter-5.html'] = chapter_five_template.replace('__BANK_JSON__', chapter_five).encode()
    chapter_six = json.dumps([r for r in reader if r['chapter'] == 6], ensure_ascii=False).replace('<', '\\u003c').replace('&', '\\u0026')
    generated[DOC / 'chapter-6.html'] = chapter_six_template.replace('__BANK_JSON__', chapter_six).encode()
    chapter_seven = json.dumps([r for r in reader if r['chapter'] == 7], ensure_ascii=False).replace('<', '\\u003c').replace('&', '\\u0026')
    generated[DOC / 'chapter-7.html'] = chapter_seven_template.replace('__BANK_JSON__', chapter_seven).encode()
    chapter_eight = json.dumps([r for r in reader if r['chapter'] == 8], ensure_ascii=False).replace('<', '\\u003c').replace('&', '\\u0026')
    generated[DOC / 'chapter-8.html'] = chapter_eight_template.replace('__BANK_JSON__', chapter_eight).encode()
    chapter_nine = json.dumps([r for r in reader if r['chapter'] == 9], ensure_ascii=False).replace('<', '\\u003c').replace('&', '\\u0026')
    generated[DOC / 'chapter-9.html'] = chapter_nine_template.replace('__BANK_JSON__', chapter_nine).encode()
    chapter_ten = json.dumps([r for r in reader if r['chapter'] == 10], ensure_ascii=False).replace('<', '\\u003c').replace('&', '\\u0026')
    generated[DOC / 'chapter-10.html'] = chapter_ten_template.replace('__BANK_JSON__', chapter_ten).encode()
    chapter_eleven = json.dumps([r for r in reader if r['chapter'] == 11], ensure_ascii=False).replace('<', '\\u003c').replace('&', '\\u0026')
    generated[DOC / 'chapter-11.html'] = chapter_eleven_template.replace('__BANK_JSON__', chapter_eleven).encode()
    chapter_twelve = json.dumps([r for r in reader if r['chapter'] == 12], ensure_ascii=False).replace('<', '\\u003c').replace('&', '\\u0026')
    generated[DOC / 'chapter-12.html'] = chapter_twelve_template.replace('__BANK_JSON__', chapter_twelve).encode()
    inputs = [Path(__file__).resolve(), ROOT / 'scripts/question-bank/build-ssc-biology-ch1.py',
              *sorted(INPUT.glob('*.txt')), *sorted(INPUT.glob('reader-template*.html')),
              INPUT / 'draw-chapter-4-figures.py', INPUT / 'draw-chapter-5-figures.py', INPUT / 'draw-chapter-6-figures.py', INPUT / 'draw-chapter-7-figures.py', INPUT / 'draw-chapter-8-figures.py', INPUT / 'draw-chapter-9-figures.py', INPUT / 'draw-chapter-10-figures.py', INPUT / 'draw-chapter-11-figures.py', INPUT / 'draw-chapter-12-figures.py',
              *sorted(OUT.glob('chapter-*/assets/*.svg'))]
    index = {str(p.relative_to(ROOT)): dict(bytes=len(b), sha256=digest(b)) for p, b in generated.items()}
    for p in [*inputs, *sorted((OUT / 'chapter-1').glob('*.json'))]:
        # Generated chapter-1 ledgers are already represented by their new bytes.
        if str(p.relative_to(ROOT)) not in index:
            b = p.read_bytes()
            index[str(p.relative_to(ROOT))] = dict(bytes=len(b), sha256=digest(b))
    generated[DOC / 'artifact-index.json'] = enc(dict(date=DATE, draftItems=progress['draftItems'], files=index))
    return generated, progress


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    generated, progress = build()
    for path, value in generated.items():
        if args.check:
            if not path.exists() or path.read_bytes() != value:
                raise SystemExit(f'MISSING OR STALE: {path.relative_to(ROOT)}')
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(value)
    print(('CHECK PASS' if args.check else 'WROTE') + f": {progress['draftItems']}/4480 drafts; no publication")


if __name__ == '__main__':
    main()
