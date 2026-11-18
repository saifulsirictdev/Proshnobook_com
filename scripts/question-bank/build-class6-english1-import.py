"""Convert initial English lesson practice into the existing MCQ/SQ upload schema.
No database writes, approvals, CQ conversion, listening keys or new categories.
"""
from pathlib import Path
import json,re,sys
R=Path(__file__).resolve().parents[2]
D=R/'content/question-bank/class-6/english-1st'
# Catalog, rather than author-entered display titles, is the category authority.
line=next(s for s in (R/'lib/nctb-data.ts').read_text().splitlines() if '"English 1st Paper", chapters:' in s)
topics=json.loads('['+line.split('chapters: [',1)[1].split('] }',1)[0]+']')
assert len(topics)==33
out=D/'import';out.mkdir(exist_ok=True)
counts={'MCQ':0,'SQ':0};entries=[]
for n in range(1,34):
 sourceFile=f'lesson-{n:02}-source-draft.json'
 p=json.loads((D/sourceFile).read_text());items=[];references=[]
 def add(kind,text,answer,page,options=None,correct=None,extra=''):
  # Source-required exercises remain explicitly textbook-dependent. No answers
  # are embedded in the student stem or introduced as invented source facts.
  pre=f"English lesson practice — {topics[n-1]}\nUse the cited NCTB 2026 textbook section where required; textbook/audio not included.\n"
  row=dict(type=kind,text=pre+text,explanation=answer+('\n\n'+extra if extra else ''),page=page,difficulty='MEDIUM')
  if kind=='MCQ':row.update(options=options,correct=correct)
  assert 0<len(row['text'])<=6000 and 0<len(row['explanation'])<=6000
  assert 0<len(page)<=100
  items.append(row);references.append(dict(activity=a['id'],kind=a['kind'],page=page));counts[kind]+=1
 for a in p['activities']:
  fallback='Printed '+', '.join(map(str,p['source']['printedPages']))
  for q in a.get('items',[]):
   page=str(q.get('page',a.get('page',fallback)))
   if len(page)>100:page=fallback
   instruction=a['instruction']
   if a.get('poemTitle'):instruction+=' Poem: '+a['poemTitle']+'.'
   if 'options' in q:
    add('MCQ',instruction+'\n'+q['question'],q['explanation'],page,q['options'],q['answer'])
   elif 'modelAnswer' in q:
    add('SQ',instruction+'\n'+q['question'],q['modelAnswer'],page,extra=q.get('assessmentGuide',''))
   elif 'acceptedAnswers' in q:
    add('SQ',instruction+'\n'+q['word']+' — '+q['request'],'Accept: '+'; '.join(q['acceptedAnswers']),page)
   else:raise ValueError('Unsupported item: '+str(q))
  if 'items' not in a:
   text=a['instruction'];page=str(a.get('page',fallback))
   if len(page)>100:page=fallback
   if a.get('wordBox'):text+='\nWord box: '+', '.join(a['wordBox'])
   if a.get('text'):text+='\n'+a['text']
   if a.get('answers'):answer='; '.join(f'{k}: {v}' for k,v in a['answers'].items())
   elif isinstance(a.get('modelAnswer'),str):answer=a['modelAnswer']
   elif isinstance(a.get('modelAnswer'),list):answer='\n'.join(x['speaker']+': '+x.get('text',x.get('line','')) for x in a['modelAnswer'])
   else:raise ValueError('Unsupported activity: '+str(a))
   guidance='\n'.join(a.get('assessment',[]))
   if a.get('note'):guidance+='\n'+a['note']
   add('SQ',text,answer,page,extra=guidance.strip())
 assert 1<=len(items)<=200
 stems=[re.sub(r'\s+',' ',i['text'].strip()).lower() for i in items];assert len(set(stems))==len(stems)
 batch=dict(category='Class 6',subject='English 1st Paper',topic=topics[n-1],book='NCTB English for Today',edition='2026; revised October 2025',sourceUrl=p['source'].get('url',p['source'].get('driveUrl','https://drive.google.com/file/d/1i_BLt2iONFk6w1y7mmDBDHHQDuVa5t5J/view')),lang='English',items=items)
 name=f'lesson-{n:02}.json';text=json.dumps(batch,ensure_ascii=False,indent=2)+'\n'
 if '--check' in sys.argv:assert (out/name).read_text()==text,name
 else:(out/name).write_text(text)
 entries.append(dict(lesson=n,file='import/'+name,sourceFile=sourceFile,counts={k:sum(i['type']==k for i in items) for k in counts},references=references,limitations=p['limitations'],source=p['source']))
manifest=dict(status='REGISTERED_FOR_ADMIN_PENDING_IMPORT_NOT_DATABASE_RECEIPT',websiteImported=False,teacherApproved=False,category='Class 6',subject='English 1st Paper',lessonBatches=33,counts=counts,storagePolicy='MCQ for options; SQ is the existing unstructured written-question storage for English answers, vocabulary and writing. Not an assertion of official short-answer marks. No CQ conversion or per-item marks invented.',limitations=['Source textbook is required for source-dependent reading/poem/picture tasks; these are not standalone seen passages.','Actual audio is not supplied and no listening assessment is asserted.','Full model and original unseen packs are excluded: Class 6 catalog has only lesson topics, not an authorised model/unseen category.','Teacher review and explicit ADMIN save remain required. Registration/deployment is not a database import or approval.'],entries=entries)
text=json.dumps(manifest,ensure_ascii=False,indent=2)+'\n'
if '--check' in sys.argv:assert (out/'manifest.json').read_text()==text
else:(out/'manifest.json').write_text(text)
print(f'33 English lesson upload batches: {counts}; Pending-only registration, no database write.')
