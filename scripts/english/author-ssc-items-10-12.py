#!/usr/bin/env python3
"""Build 153 teacher-reviewable writing exercises from preserved prompts/topics.
Models in data/ssc-writing-models.txt are original possible answers, not official keys.
No network, production DB write, import or approval.
"""
import hashlib,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
SOURCE_DATA=ROOT/'scripts/english/data/ssc-writing-models.txt'
def sha(text):return hashlib.sha256(text.encode()).hexdigest()
def digest(x):return sha(json.dumps(x,ensure_ascii=False,separators=(',',':')))
WEB={
 'paragraph':('https://www.babarenglish.com/post/important-paragraphs-for-ssc-2026-most-important-paragraphs-for-ssc-2026-paragraph-suggestion-fo','Important Paragraphs for SSC 2027'),
 'letter-email':('https://www.babarenglish.com/post/letter-writing-explanation-comprehensive-list',"Letter Writing / Letters / Informal Letters / Informal Emails - Lessons' Contents & Comprehensive List"),
 'composition':('https://www.babarenglish.com/post/important-compositions-for-ssc-2025-most-important-compositions-for-ssc-2025-composition-suggest','Important Compositions for SSC 2027'),
}
def records():
 out=[]
 for n,line in enumerate(SOURCE_DATA.read_text().splitlines(),1):
  if not line or line.startswith('#'):continue
  fields=line.split('|');kind,ref=fields[:2]
  assert kind in WEB,(n,kind)
  if kind=='letter-email':
   assert len(fields)==5,(n,fields[:4]);choice,topic,answer=fields[2:]
   assert choice in ['email','letter','application']
  else:
   assert len(fields)==4,(n,fields[:3]);topic,answer=fields[2:];choice=None
  answer=answer.replace(' ~ ','\n'if kind=='letter-email'else '\n\n')
  out.append({'kind':kind,'ref':ref,'choice':choice,'topic':topic,'answer':answer})
 return out

def build():
 all_records=records()
 for kind,(url,title)in WEB.items():
  chosen=[r for r in all_records if r['kind']==kind];assert len(chosen)==51
  assert len({r['topic'].lower()for r in chosen})==51
  assert len({r['answer']for r in chosen})==51
  audit=json.loads((ROOT/f'docs/english/work-in-progress/ssc-paper2-{kind}-candidates.json').read_text())
  pool={e['candidateId'].split('-')[-1]:e for e in audit['candidates']}
  web_topics=[r['ref'][4:]for r in chosen if r['ref'].startswith('web:')]
  websource={'fileId':f'web:babar-{kind}-topics','title':title,'url':url,'retrievedAt':'2026-11-20','sha256':digest(web_topics),'snapshotKind':'Selected topic-label snapshot, whitespace-normalised; NOT a hash of the entire changing webpage. Only topic labels were used; no published model answers were copied.','selectedTopicLabels':web_topics}
  items=[]
  for r in chosen:
   topic,answer,choice=r['topic'],r['answer'],r['choice'];isweb=r['ref'].startswith('web:')
   count=len(answer.split());words=150 if kind=='paragraph'else 250 if kind=='composition'else None
   assert (140<=count<=170 if kind=='paragraph'else 225<=count<=280 if kind=='composition'else 110<=count<=190),(topic,count)
   notes=['Assistant-authored possible model, NOT an official board/school answer. Valid alternative writing should be accepted after teacher review.','First-person stories, names, dates, contact details and unspecified scenario details are fictional model-writing choices, not verified events or the assistant\u2019s personal experiences.']
   if isweb:
    original=r['ref'][4:]
    meta={'sourceKind':'web','sourceFile':websource['fileId'],'sourceSha256':websource['sha256'],'sourceUrl':url,'sourceTitle':title,'retrievedAt':'2026-11-20','sourceTopicLabel':original,'sourcePrompt':original,'sourcePromptKind':'topic-label-not-exam-question','sourceContentSha256':sha(original)}
    if kind=='letter-email':prompt=f'Web-topic-backed authored practice. Write an {choice} on "{topic}". Use an appropriate recipient, salutation, body and closing. Use imaginary details where necessary.'if choice!='letter'else f'Web-topic-backed authored practice. Write a letter on "{topic}". Use an appropriate recipient, salutation, body and closing. Use imaginary details where necessary.'
    else:prompt=f'Web-topic-backed authored practice. Write a {"paragraph"if kind=="paragraph"else "short composition"} of about {words} words on "{topic}".'
    notes.append('The webpage supplies a topic index only. The complete practice prompt and model answer were authored here; no board, school, examination year, original marks or physical PDF page is claimed.')
   else:
    e=pool[r['ref']];assert not e['issues'],(kind,r['ref'],e['issues'])
    original=e['sourcePrompt'];meta={k:v for k,v in e.items()if k not in ['candidateId','issues']};meta.update(sourceCandidateId=e['candidateId'],sourcePromptKind='pdf-examination-prompt')
    if kind=='letter-email':prompt=f'Source-backed practice. Writing focus: {topic}. {original} Use imaginary contact details where none are specified.'
    else:prompt=f'Source-backed adapted practice. Write a {"paragraph"if kind=="paragraph"else "short composition"} of about {words} words on "{topic}".'
    notes.append('Source institution/year/question/marks describe the original examination, not a claim that the adapted practice wording or this sample answer was issued by that institution.')
   if words:notes.append('The 150-word paragraph / 250-word composition limits are editorial practice targets, not asserted official syllabus limits. Any different original word requirement is preserved in the source prompt.')
   changes=[{'before':original,'after':prompt,'reason':'Topic-index-backed authored question; original label retained separately.'if isweb else 'Explicit current-syllabus practice adaptation: canonical topic and target length; retain full original prompt, scenarios and original marks separately. No answer was supplied by the source.'}]
   entry={'id':f'ssc-p2-{kind}-{len(items)+1:03}',**meta,'topic':topic,**({'choice':choice}if choice else {}),**({'words':words}if words else {}),'instruction':prompt,'answers':[answer],'modelWordCount':count,'editorialChanges':changes,'editorialNotes':notes,'reviewChecklist':['Addresses the topic and any supplied scenario without changing the requested genre.','Coherent organisation and appropriate language; sample models are not mandatory memorised answers.','Check facts, tone, accessibility and valid alternative responses; no official point-by-point marking scheme is asserted.']+(['Check recipient, identity, subject, salutation and closing; example.com contact details are illustrative only.']if choice else []),'contentSha256':digest({'instruction':prompt,'answers':[answer]})}
   items.append(entry)
  batch={'version':1,'item':kind,'marks':20 if kind=='composition'else 10,'reviewStatus':'PREPARED_NOT_IMPORTED','answerStatus':'POSSIBLE_MODEL_TEACHER_REVIEW_REQUIRED — NOT official answers','sources':audit['sources']+[websource],'items':items}
  (ROOT/f'lib/english/data/ssc-paper2-{kind}-review.json').write_text(json.dumps(batch,ensure_ascii=False,indent=2)+'\n')
  lines=[f'# SSC English 2nd Paper — {kind}: 51 prepared writing sets','', '**PREPARED_NOT_IMPORTED. Original possible models, NOT official answers. Teacher content review required.**','', 'Web indexes provide topics only, not examination attribution or copied sample answers. First-person situations and added model details are fictional.','']
  for e in items:
   lines += [f"## {e['id']} — {e['topic']}",'']
   if e['sourceKind']=='web':lines += [f"Web topic source: {e['sourceTitle']} · {e['sourceUrl']} · retrieved {e['retrievedAt']}. No board/school/year/original-marks attribution.",'']
   else:
    src=next(s for s in batch['sources']if s['fileId']==e['sourceFile'])
    lines += [f"Original: {e.get('board',e.get('school'))} · {e.get('examType','Board')} {e['examYear']} · physical PDF page {e['pdfPage']} · Q{e['questionNumber']} · {e['originalMarks']} original marks · {src['filename']}",'']
   lines += [e['instruction'],'',f"Current practice: {batch['marks']} marks"+(f" · target about {e['words']} words"if 'words'in e else f" · subtype {e['choice']}")+f" · model {e['modelWordCount']} words",'','### Possible model answer','']
   lines += ['```text',e['answers'][0],'```']if kind=='letter-email'else[e['answers'][0]]
   lines += ['','### Preserved original prompt / web topic label','',e['sourcePrompt'],'','### Adaptation / review ledger','']
   lines += [f"- {c['reason']}\n  - Original: {c['before']}\n  - Practice: {c['after']}"for c in e['editorialChanges']]
   lines += ['']+[f'- {n}'for n in e['editorialNotes']]+['',f"Source-content SHA256: `{e['sourceContentSha256']}`",f"Source/snapshot SHA256: `{e['sourceSha256']}`",f"Practice/model SHA256: `{e['contentSha256']}`",'']
  (ROOT/f'docs/english/ssc-paper2-{kind}-review.md').write_text('\n'.join(lines).rstrip()+'\n')
  print(kind,len(items),'prepared;',sum(e['sourceKind']=='web'for e in items),'web-topic supplements;',min(e['modelWordCount']for e in items),'-',max(e['modelWordCount']for e in items),'model words')
if __name__=='__main__':build()
