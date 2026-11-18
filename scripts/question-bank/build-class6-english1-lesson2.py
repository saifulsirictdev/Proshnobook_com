"""Reproducible source-read lesson pool and separated review papers."""
import json,sys
from pathlib import Path
D=Path(__file__).resolve().parents[2]/'content/question-bank/class-6/english-1st'
base=json.loads((D/'lesson-01-source-draft.json').read_text())
source={**base['source'],'printedPages':[4,5,6],'pdfPages':[9,10,11]}
rows=[
('Where does Lily go to school?',['Dhaka','Rajbari','Sylhet','Khulna'],'A',4,'The introductory situation places her school in Dhaka.'),
('What result does Lily tell her father about?',['A prize for singing','An A in her English test','A failed math test','A football victory'],'B',4,'Lily reports her English test grade.'),
('What kind of songs does Rahul enjoy singing?',['Only birthday songs','Only school songs','Folk songs','Only foreign songs'],'C',4,'The introduction describes his love of folk songs.'),
('Why is Rahul happy?',['He has found a pen','He is travelling abroad','He has won an essay prize','His new album has been a hit'],'D',5,'His news concerns the success of an album of Lalon’s songs.'),
('Which competition did Manzoor win?',['An inter-school essay competition','A swimming competition','A drawing competition','A spelling competition'],'A',5,'The occasion was Independence Day and the event was an essay competition.'),
('Why was Sujan absent from school?',['He had lost his pen','He had the flu','He was recording an album','He was visiting a competition'],'B',6,'Sujan says he had flu and spent most of the time in bed.'),
('What does Manik think happened to his pen?',['He lent it to Shakil','His father took it back','He dropped it somewhere','He sold it'],'C',6,'He is uncertain and says he thinks he dropped it somewhere.')]
short=[
('Where do Lily’s parents live?','They live in a small town in Tangail district.',4),
('How does Lily’s father react to her result?','He praises her and says that he is proud of her.',4),
('Whose songs are on Rahul’s successful new album?','The album contains Lalon’s songs.',5),
('What class is Manzoor in, and what prize does he report winning?','He is in class six and reports winning the first prize in the essay competition.',5),
('Why was the lost pen special to Manik?','His father had given him the pen, and it was very dear to him.',6),
('What happened in Munira’s math test?','She failed the test.',6),
('How does Shanu try to encourage Munira?','Shanu says that her parents will understand and that she will do better next time.',6)]
response=[
('A friend wins an essay prize.','Congratulations! Well done!','congratulation'),
('A friend loses a football match.','I’m sorry about the result. I hope your next match goes better.','sympathy'),
('Someone congratulates you on your result.','Thank you! That is very kind of you.','thanks'),
('A classmate tells you that they have been ill.','I’m sorry to hear that. How are you feeling now?','sympathy'),
('A friend is selected for a television music programme.','Congratulations! I’m very happy for you.','congratulation')]
vocab=[('generation','contextual meaning',['people of approximately the same age'],4),('album','contextual meaning',['a collection of recorded songs or music'],5),('hit','contextual meaning',['a popular success','a very successful album in this context'],5),('dear','contextual meaning',['precious','valued','beloved'],6),('marvellous','synonym',['wonderful','excellent'],5)]
dialogue=[('Rina','Hello, Sami. You look happy. Do you have some good news?'),('Sami','Yes! I have been selected for our school music programme.'),('Rina','Congratulations! You have worked hard for this.'),('Sami','Thank you. Your encouragement means a lot to me.'),('Rina','When will the programme take place?'),('Sami','It will be next Thursday after our lessons.'),('Rina','Are you feeling ready to perform?'),('Sami','I am a little nervous, so I am practising every afternoon.'),('Rina','I hope it goes well. I look forward to hearing you sing.'),('Sami','Thanks, Rina. I am glad you will be there.')]
p=dict(id='class6-english1-lesson02-source-draft-v1',category='Class 6',subject='English 1st Paper',topic='Lesson-02: Congratulations! Well Done!',status='SOURCE_READ_LESSON_DRAFT_NOT_REGISTERED',teacherApproved=False,fullModelTest=False,source=source,passagePolicy='Read the cited textbook dialogues. They are separate situations, not one continuous passage; original questions below do not reproduce the full textbook.',activities=[
 dict(id='mcq',kind='seen-mcq',instruction='Read the cited dialogue and choose the best answer.',marks=None,items=[dict(question=q,options=dict(zip('ABCD',o)),answer=a,page=f'Printed {n} / PDF {n+5}',explanation=e) for q,o,a,n,e in rows]),
 dict(id='short-answers',kind='seen-short-answer',instruction='Answer from the cited dialogue. Equivalent accurate wording is acceptable.',marks=None,items=[dict(question=q,modelAnswer=a,page=f'Printed {n} / PDF {n+5}') for q,a,n in short]),
 dict(id='vocabulary',kind='seen-vocabulary',instruction='Give a suitable meaning in the dialogue, or a synonym where requested.',marks=None,items=[dict(word=w,request=r,acceptedAnswers=a,page=f'Printed {n} / PDF {n+5}') for w,r,a,n in vocab],note='Hit means a popular success here, not a physical blow; dear expresses personal value, not necessarily high price. Album may have other meanings in other contexts.'),
 dict(id='responses',kind='functional-language',instruction='Write a kind and appropriate response to each situation. Model responses are examples, not the only correct wording.',marks=None,page='Language Focus and B2, printed 5–6 / PDF 10–11',items=[dict(question=q,modelAnswer=a,function=f) for q,a,f in response],assessment=['Responds appropriately to good news, bad news or thanks','Uses polite, supportive language','Does not blame the person or promise an unverified outcome']),
 dict(id='dialogue',kind='dialogue-writing',instruction='Write a dialogue congratulating a friend selected for a school music programme. Include a response to the congratulations and a natural ending.',marks=None,modelAnswer=[dict(speaker=s,text=t) for s,t in dialogue],assessment=['Relevant news and congratulation','Acknowledgement and logical turn-taking','Supportive language without invented textbook claims','Clear speaker labels and comprehensible sentences'],note='Original writing model: Rina and Sami are fictional practice characters, not characters from the source dialogue. No official word limit or turn count is asserted.')],counts=dict(MCQ=7,shortAnswers=7,vocabularyPrompts=5,functionalResponses=5,writingTasks=1),limitations=['Teacher review pending; this is a lesson pool rather than a full marked model test.','No poem appears in this lesson; no poem questions are padded into this pool.','Separate dialogue contexts must remain labelled when assembling exams.','The textbook describes a usual response to bad news, not a prohibition on speaking. Suitable supportive replies are accepted.','Practice is not exhaustive chapter-quota completion or website registration.'])
outputs={'lesson-02-source-draft.json':json.dumps(p,ensure_ascii=False,indent=2)+'\n'}
# Render both lessons with questions kept apart from answers.
for pack in [base,p]:
 n='01' if pack is base else '02'
 intro=f"# {pack['topic']}\n\nClass 6 · English 1st Paper · Draft · Teacher review pending\n\nSource: NCTB English for Today, revised for 2026. Printed pages {pack['source']['printedPages']}; PDF pages {pack['source']['pdfPages']}. Use the cited book pages; complete source texts are not reproduced. Not a full model test; marks unset.\n"
 qs=[intro,'## Student questions'];ans=[intro,'## Teacher answers and guidance','Accept equivalent accurate answers. Writing models are illustrative, not memorisation requirements.']
 for a in pack['activities']:
  qs += [f"\n### {a['id']}",a['instruction']];ans += [f"\n### {a['id']}"]
  if a.get('page'):qs.append('Source: '+a['page'])
  for i,x in enumerate(a.get('items',[]),1):
   qs.append(f"{i}. "+x.get('question',x.get('word',''))+(' — '+x['request'] if 'request' in x else '')+(' ['+x['page']+']' if 'page' in x else ''))
   if 'options' in x:qs.extend(f"   {k}. {v}" for k,v in x['options'].items())
   answer=x.get('modelAnswer', '; '.join(x.get('acceptedAnswers',[])))
   if 'answer' in x:answer=x['answer']+'. '+x['options'][x['answer']]
   ans.append(f'{i}. {answer}')
   if x.get('explanation'):ans.append(x['explanation'])
   if x.get('assessmentGuide'):ans.append(x['assessmentGuide'])
  if a.get('text'):qs.extend(['Word box: '+', '.join(a['wordBox']),a['text']]);ans.append('; '.join(f'{k}: {v}' for k,v in a['answers'].items()))
  if 'modelAnswer' in a:
   m=a['modelAnswer'];ans.extend([m] if isinstance(m,str) else [f"{t['speaker']}: {t['text']}" for t in m])
  ans.extend('- '+v for v in a.get('assessment',[]))
  if a.get('note'):ans.append('Teacher note: '+a['note'])
 outputs[f'lesson-{n}-questions.md']='\n\n'.join(qs)+'\n';outputs[f'lesson-{n}-answers.md']='\n\n'.join(ans)+'\n'
for f,t in outputs.items():
 if '--check' in sys.argv:assert (D/f).read_text()==t,f
 else:(D/f).write_text(t)
print('Lesson 2: 7 MCQ, 7 short answers, 5 vocabulary, 5 functional responses and 1 dialogue; separate papers for lessons 1–2.')
