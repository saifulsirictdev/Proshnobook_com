import json,re,argparse
# Run from repository root. Converts existing reviewed-source Draft artifacts, not AI output.
from pathlib import Path
m=json.load(open('content/question-bank/class-6/english-1st/model-01-draft.json'));pool=json.load(open('lib/english/data/class6-seen-pool.json'))
sources={}
for key,p in zip(['seen-1','seen-2'],m['passages'][:2]):sources[key]={'text':p['text'],'reference':f"NCTB English for Today, Class 6, revised 2026, Lesson {p['lesson']}, printed {p['printedPages']}, PDF {p['pdfPages']}."}
poems=[p for p in pool['poems'] if p['id'] in ['holding-hands','boats','chaos','andre']]
sources['textbook-poems']={'text':'\n\n'.join(p['title']+'\n'+p['author']+'\n'+p['text'] for p in poems),'reference':'NCTB Class 6 English for Today 2026: Holding Hands, Lesson 7/PDF24; Boats Sail on the Rivers, Lesson16/PDF57; The Chaos, Lesson17/PDF58; André, Lesson27/PDF88.'}
ids=['mcq','comprehension','gap','vocabulary','information','true-false','summary','matching','rearranging','poems','story','paragraph','dialogue'];tasks=[]
for id,q in zip(ids,m['questions']):
 t={'id':id,'instruction':q['instruction'].replace('The full poems are not reproduced. ', '').replace('S1','the first seen passage').replace('S2','the second seen passage').replace('U1','the unseen passage'),'subitems':[]}
 if id in ['mcq','comprehension']:t['passageKey']='seen-1'
 if id in ['gap','vocabulary']:t['passageKey']='seen-2'
 if id in ['information','true-false','summary']:t['passageKey']='unseen'
 if id=='poems':t['passageKey']='textbook-poems'
 if id in ['mcq','comprehension','poems']:
  for x in q['items']:
   a=x.get('modelAnswer',x.get('answer'));r={'text':(('['+x['poem']+'] ') if 'poem' in x else '')+x['question'],'answer':a}
   if 'options' in x:r['options']=list(x['options'].values());r['answer']=x['options'][x['answer']]
   t['subitems'].append(r)
 elif id=='gap':
  t['instruction']+='\n'+q['text'];t['subitems']=[{'text':f'({k}) ____','answer':v} for k,v in q['answers'].items()]
 elif id=='vocabulary':t['subitems']=[{'text':x['word']+' ('+x['request']+')','answer':' / '.join(x['acceptedAnswers'])} for x in q['items']]
 elif id=='information':t['table']={'headers':q['columns'],'rows':q['rows']};t['subitems']=[{'text':f'({k}) ____','answer':v} for k,v in q['answers'].items()]
 elif id=='true-false':t['subitems']=[{'text':x['statement'],'answer':'True' if x['answer'] else 'False. '+x['correction']} for x in q['items']]
 elif id=='summary':t['answer']=q['modelAnswer']
 elif id=='matching':
  t['table']={'headers':['A','B'],'rows':[[f'{i}. {a}',f'{j}. {b}'] for (i,a),(j,b) in zip(q['beginnings'].items(),q['endings'].items())]};t['subitems']=[{'text':f'Match beginning {k}.','answer':v} for k,v in q['answers'].items()]
 elif id=='rearranging':t['subitems']=[{'text':k+'. '+v,'answer':str(q['answer'].index(k)+1)} for k,v in q['sentences'].items()];t['answer']=' → '.join(q['answer'])
 elif id=='story':t['instruction']+='\n'+q['opening'];t['answer']=q['modelTitle']+'\n'+q['modelAnswer']
 elif id=='paragraph':t['answer']=q['modelAnswer']
 elif id=='dialogue':t['answer']='\n'.join(x['speaker']+': '+x['line'] for x in q['modelAnswer'])
 tasks.append(t)
writing={'story':{'topic':'The Bag at the School Gate'},'paragraph':{'topic':'Your First Day at School','words':120},'dialogue':{'topic':'An object whose label has incomplete information'}}
tasks[10]['instruction']='Complete a story on The Bag at the School Gate. '+tasks[10]['instruction'];tasks[12]['instruction']='Write a dialogue on An object whose label has incomplete information. '+tasks[12]['instruction']
out={'selection':{'grade':6,'paper':1,'mode':'full','itemIds':[],'sources':sources,'writing':writing,'includeAnswers':True},'output':{'passages':[{'key':k,'text':v['text']} for k,v in sources.items()]+[{'key':'unseen','text':m['passages'][2]['text']}],'tasks':tasks},'provenance':{'sourceFile':'content/question-bank/class-6/english-1st/model-01-draft.json','sourceSha256':m['sourceSha256'],'teacherApproved':False,'officialCircularVerified':False,'limitations':'One prewritten complete practice model, not thirty passage-linked question sets. Original unseen reuses practice pack002; exposure review required. Source wording, semantic answers and rubrics need ADMIN/teacher review.'}}
target=Path('lib/english/data/class6-complete-model.json')
content=json.dumps(out,ensure_ascii=False,indent=2)+'\n'
parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args()
if args.check:
 assert target.read_text()==content, 'Prepared complete model is stale; regenerate and review.'
 print('Complete model artifact reproducible; this does not grant teacher approval.')
else: target.write_text(content)
