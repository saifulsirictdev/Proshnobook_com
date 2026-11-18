#!/usr/bin/env python3
"""Reproducible assembly of authored, source-labelled Draft models. No AI/DB calls.
Shared groups are reused explicitly; this is NOT thirty wholly new question sets.
"""
import argparse, copy, json, re
from pathlib import Path
R = Path('content/question-bank/class-6/english-1st')
def read(path): return json.loads(Path(path).read_text())
base = read('lib/english/data/class6-complete-model.json')
pool = read('lib/english/data/class6-seen-pool.json')
exercises = read(R / 'complete-bank-exercises.json')['items']
railway = read(R / 'lesson-03-source-draft.json')
rail_tasks = {a['id']: a for a in railway['activities']}
packs = [read(R / f'original-skills-00{i}.json') for i in [1,2,3]]
assert set(exercises) == {s['id'] for s in pool['seen']}
def sentences(q): return [{'text':x['question'],'answer':x['modelAnswer']} for x in q['items']]
def subanswers(q): return [{'text':f'({k}) ____','answer':v} for k,v in q['answers'].items()]
models = []
for index, source in enumerate(pool['seen']):
    m = copy.deepcopy(base)
    ex = exercises[source['id']]
    assert len(ex['gaps']) == len(ex['vocabulary']) == 5
    gaps = []
    for row in ex['gaps']:
        question, answer = row.split('|')
        assert question.count('____') == 1 and answer.strip()
        # Answer must occur in this source, never invented from a different lesson.
        assert re.search(r'(?<!\w)' + re.escape(answer) + r'(?!\w)', source['text'], re.I), (source['id'], answer)
        gaps.append({'text':question,'answer':answer})
    vocab = []
    for row in ex['vocabulary']:
        word, direction, answer = row.split('|')
        # Allow dictionary headwords for inflected source forms (essential/essentials).
        assert re.search(r'(?<!\w)' + re.escape(word) + r'(?:s|es|ed|ing)?(?!\w)', source['text'], re.I), (source['id'], word)
        assert direction in ['synonym','antonym'] and answer.strip()
        vocab.append({'text':f'{word} ({direction})','answer':answer})
    m['selection']['sources']['seen-2'] = {'text':source['text'],'reference':source['reference']}
    m['output']['tasks'][2] = {'id':'gap','instruction':'Complete each sentence with one suitable word from the second seen passage. (1 × 5 = 5)','passageKey':'seen-2','subitems':gaps}
    m['output']['tasks'][3] = {'id':'vocabulary','instruction':'Give a contextual synonym or antonym as directed, using the second seen passage. (1 × 5 = 5)','passageKey':'seen-2','subitems':vocab}
    primary = 'bulbul'
    if source['lesson'] == 5:
        primary = 'railway'
        rail = next(s for s in pool['seen'] if s['id'] == 'railway')
        m['selection']['sources']['seen-1'] = {'text':rail['text'],'reference':rail['reference']}
        mcq = []
        for x in rail_tasks['mcq']['items']:
            mcq.append({'text':x['question'],'options':list(x['options'].values()),'answer':x['options'][x['answer']]})
        m['output']['tasks'][0] = {'id':'mcq','instruction':'Choose the best answer from the first seen passage. (1 × 7 = 7)','passageKey':'seen-1','subitems':mcq}
        m['output']['tasks'][1] = {'id':'comprehension','instruction':'Answer the five questions from the first seen passage. (2 × 5 = 10)','passageKey':'seen-1','subitems':sentences(rail_tasks['short-answers'])}
    pack = packs[index % len(packs)]
    acts = {a['id']:a for a in pack['activities']}
    q = acts['information-transfer']
    m['output']['tasks'][4] = {'id':'information','instruction':'Complete the table from the unseen passage. (1 × 5 = 5)','passageKey':'unseen','table':{'headers':q['columns'],'rows':q['rows']},'subitems':subanswers(q)}
    q = acts['true-false']
    m['output']['tasks'][5] = {'id':'true-false','instruction':'Write True or False from the unseen passage. Correct each false statement. (1 × 5 = 5)','passageKey':'unseen','subitems':[{'text':x['statement'],'answer':'True' if x['answer'] else 'False. '+x['correction']} for x in q['items']]}
    m['output']['tasks'][6] = {'id':'summary','instruction':'Write a summary of the unseen passage in your own words. (10)','passageKey':'unseen','subitems':[],'answer':acts['summary']['modelAnswer']}
    q = acts['matching']
    m['output']['tasks'][7] = {'id':'matching','instruction':'Match the two columns to make five complete sentences. Use each ending once. (1 × 5 = 5)','table':{'headers':['A','B'],'rows':[[f'{i}. {a}',f'{j}. {b}'] for (i,a),(j,b) in zip(q['beginnings'].items(),q['endings'].items())]},'subitems':[{'text':f'Match beginning {k}.','answer':v} for k,v in q['answers'].items()]}
    q = acts['rearranging']
    m['output']['tasks'][8] = {'id':'rearranging','instruction':'Put the eight parts in the correct order. Write their letters. (1 × 8 = 8)','subitems':[{'text':k+'. '+v,'answer':str(q['answer'].index(k)+1)} for k,v in q['sentences'].items()],'answer':' → '.join(q['answer'])}
    selected_poems = [pool['poems'][(index+i)%6] for i in range(4)]
    poem_questions = []
    for p in selected_poems:
        lesson = read(R / f"lesson-{p['lesson']:02}-source-draft.json")
        activity = next(a for a in lesson['activities'] if a['id'] in ['poem','verse-answers'])
        items = activity['items']
        offset = (index//6) % (len(items)-1)
        for item in items[offset:offset+2]:
            poem_questions.append({'text':f"[{p['title']}] {item['question']}",'answer':item['modelAnswer']})
    m['selection']['sources']['textbook-poems'] = {'text':'\n\n'.join(p['title']+'\n'+p['author']+'\n'+p['text'] for p in selected_poems),'reference':'NCTB Class 6 English for Today, revised 2026: '+ '; '.join(f"{p['title']}, Lesson {p['lesson']}/PDF {p['pdfPages'][0]}" for p in selected_poems)+'.'}
    m['output']['tasks'][9] = {'id':'poems','instruction':'Answer any five of the eight questions from the supplied textbook poems. (2 × 5 = 10)','passageKey':'textbook-poems','subitems':poem_questions}
    m['output']['passages'] = [{'key':k,'text':v['text']} for k,v in m['selection']['sources'].items()] + [{'key':'unseen','text':pack['passages'][0]['text']}]
    m['provenance'] = {'id':f"class6-seen-{source['id']}-complete-draft-v1",'seen1Id':primary,'seen2Id':source['id'],'sourceSha256':pool['sourceSha256'],'exerciseFile':str(R/'complete-bank-exercises.json'),'sharedBaseFile':'lib/english/data/class6-complete-model.json','unseenFile':str(R/f'original-skills-00{index%3+1}.json'),'poemLessons':[p['lesson'] for p in selected_poems],'teacherApproved':False,'officialCircularVerified':False,'limitations':'Authored gap/vocabulary questions and keys for this exact seen-2 extract. Shared seen-1/writing groups are intentionally reused, not counted as newly authored questions. Unseen from existing original practice packs: replace if previously taught. All model/answer semantics and difficulty require teacher review; not official circular certification.'}
    models.append(m)
content = json.dumps(models,ensure_ascii=False,indent=2)+'\n'
target = Path('lib/english/data/class6-complete-library.json')
parser = argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args()
if args.check:
    assert target.read_text()==content, 'Complete model library is stale'
    print('30 models reproducible; 300 authored gap/vocabulary prompts, shared groups not recounted. Teacher review still required.')
else:
    target.write_text(content)
    print('Prepared 30 full Draft model combinations with answers; not imported or approved.')
