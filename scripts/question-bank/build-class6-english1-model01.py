"""A complete Draft paper aligned to the supplied textbook sample, not a verified circular."""
import copy,json,sys,re,random
from pathlib import Path
D=Path(__file__).resolve().parents[2]/'content/question-bank/class-6/english-1st'
def load(n):return json.loads((D/n).read_text())
def activity(p,id):return copy.deepcopy(next(a for a in p['activities'] if a['id']==id))
original=load('original-skills-002.json');l5=load('lesson-05-source-draft.json');l1=load('lesson-01-source-draft.json')
seen1="""Bulbul collects rubbish from the Sankar area in Dhaka. Every morning, he wakes up at 5 o'clock and walks along the streets of Sankar to collect rubbish. People of Sankar put their rubbish in plastic bins and leave them in front of their houses. Bulbul walks from door to door to collect them. Sometimes the bins are very dirty and they smell bad. But Bulbul does not mind. He takes out everything from the bins and puts them in his van. He believes that all jobs are important. He works hard every day to keep his area clean.

Last month Bulbul was sick for two days. So, he could not come to collect the rubbish. The people of Sankar were in great trouble. They got piles of rubbish waiting in front of their houses. The whole area became dirty and unhygienic. When Bulbul got well, he came back to Sankar. He collected everything from all the bins. Bulbul does not want to fall sick again. He realises, if he stops working even for a few days only, the whole area will turn into a big dustbin."""
seen2="""A proverb says 'Health is Wealth'. To keep healthy is to keep free from disease and anxiety. Good health is proper functioning of all body organs. It is also feeling well both in body and in mind. People in good health are active, cheerful and happy. If you are healthy, you can be happy and can help others in society as well.

To keep in good health we should be careful about hygiene. The rules and practices of keeping good health are called hygiene. We must practise the rules of hygiene. Proper food and nutrition, physical exercise, rest and sleep, cleanliness, and proper medicare are essential for good health."""
passages=[dict(id='S1',origin='TEXTBOOK_SEEN_TRANSCRIBED',lesson=5,printedPages=[14,15],pdfPages=[18,20],text=seen1),dict(id='S2',origin='TEXTBOOK_SEEN_TRANSCRIBED',lesson=9,printedPages=[30],pdfPages=[35],text=seen2),dict(id='U1',origin='ORIGINAL_PRACTICE_PASSAGE_REUSED',text=original['passages'][0]['text'],note='Originally authored for practice pack 002. Teacher must replace if previously taught to these pupils; unseen is relative to learner exposure.')]
Q=[]
def add(num,marks,task,passage=None):
 task['number']=num;task['marks']=marks
 if passage:task['passageId']=passage
 else:task.pop('passageId',None)
 Q.append(task)
add(1,7,activity(l5,'mcq'),'S1');Q[-1]['instruction']='Read S1 and choose the best answer. (1 × 7 = 7)'
add(2,10,activity(l5,'short-answers'),'S1');Q[-1]['instruction']='Answer the five questions from S1. (2 × 5 = 10)'
add(3,5,dict(id='contextual-gaps',kind='contextual-gap',instruction='Complete the following passage with suitable words from S2. Use one word in each gap. (1 × 5 = 5)',text='The passage connects good health with both body and (a) ____. It says people in good health are active, (b) ____ and happy. Health-maintaining rules and practices are called (c) ____. Proper food and (d) ____, exercise, rest and (e) ____ are among the essentials mentioned.',answers={'a':'mind','b':'cheerful','c':'hygiene','d':'nutrition','e':'sleep'}),'S2')
add(4,5,dict(id='vocabulary',kind='vocabulary-in-context',instruction='Give a suitable synonym or antonym for each word from S2 as directed. (1 × 5 = 5)',items=[dict(word=w,request=r,acceptedAnswers=a) for w,r,a in [('anxiety','synonym',['worry','uneasiness']),('cheerful','synonym',['happy','joyful','bright in mood']),('careful','antonym',['careless']),('essential','synonym',['necessary','vital']),('proper','antonym',['improper','unsuitable','inappropriate'])]]),'S2')
add(5,5,activity(original,'information-transfer'),'U1');Q[-1]['instruction']='Complete the table with information from U1. (1 × 5 = 5)'
add(6,5,activity(original,'true-false'),'U1');Q[-1]['instruction']='Write True or False according to U1. Correct each false statement. (1 × 5 = 5)'
add(7,10,activity(original,'summary'),'U1');Q[-1]['instruction']='Write a summary of U1 in your own words. (10)'
add(8,5,activity(original,'matching'));Q[-1]['instruction']='Match the parts in columns A and B to make five complete sentences. Use each ending once. (1 × 5 = 5)'
add(9,8,activity(original,'rearranging'));Q[-1]['instruction']='Put the eight sentences in the correct order. Write only the corresponding letters. (1 × 8 = 8)'
poems=[]
for n in [7,16,17,27]:
 p=load(f'lesson-{n:02}-source-draft.json');a=activity(p,'poem')
 # Two content/interpretation questions per poem, not a forced biographical recall pool.
 inds={7:[1,3],16:[3,6],17:[2,4],27:[5,7]}[n]
 for i in inds:
  q=copy.deepcopy(a['items'][i]);q['poem']=p['topic'].split(': ',1)[1] if n!=17 else 'The Chaos';q['lesson']=n;poems.append(q)
add(10,10,dict(id='poem',kind='textbook-poem-answers',instruction='Answer any five of the eight questions from the textbook poems. The full poems are not reproduced. (2 × 5 = 10)',items=poems,offered=8,required=5,marksEach=2))
story='Rafi stopped beside the bag. He did not know who owned it. He called the teacher who was standing near the gate. Together, they took the bag to the school office. The teacher checked for a name while Rafi waited. A label inside named a pupil from another class. The office contacted that pupil’s class teacher. Soon a worried child arrived and described the bag. The teachers checked that it was really hers before returning it. She thanked Rafi for reporting what he had found. Rafi felt pleased that he had asked for help instead of guessing.'
assert len(re.findall(r'[^.!?]+[.!?]',story))>=10
add(11,10,dict(id='story',kind='story-completion',instruction='Read the opening and complete the story in at least ten new sentences. Give a suitable title. (10)',opening='One afternoon, Rafi was leaving school when he noticed a small bag near the gate. He looked around, but nobody seemed to be looking for it. He decided to ask an adult for help.',modelTitle='The Bag at the School Gate',modelAnswer=story,minimumNewSentences=10,assessment=['Relevant continuation of the opening','At least ten new sentences and a suitable title','Coherent sequence and resolution','Appropriate vocabulary, grammar and punctuation']))
para=activity(l1,'paragraph')
add(12,10,dict(id='paragraph',kind='paragraph-writing',instruction='Write a paragraph on “Your First Day at School” in 120 words. (10)',modelAnswer=para['modelAnswer'],modelWordCount=120,assessment=para['assessment'],note='Original first-person example, not Tarun’s biography.'))
add(13,10,activity(original,'dialogue'));Q[-1]['instruction']='Write a dialogue between a pupil and a museum guide about an object whose label has incomplete information. (10)'
rng=random.Random(62026)
for task in Q:
 for item in task.get('items',[]):
  if 'options' in item:
   correct=item['options'][item['answer']];values=list(item['options'].values());rng.shuffle(values)
   item['options']=dict(zip('ABCD',values));item['answer']=next(k for k,v in item['options'].items() if v==correct)
 task.pop('page',None)
 for item in task.get('items',[]):
  if task['number']!=10:item.pop('page',None)
 # Qualitative guidance from practice packs is supplemented below by explicit author-proposed rubrics.
rubrics={
 '1':{'rule':'One mark per correct option; no negative marking in this draft.'},
 '2':{'rule':'Two marks each: 2 for a complete accurate answer, 1 for a relevant partial answer, 0 for an incorrect/absent answer. Accept equivalent wording and supported inference/opinion where the prompt allows it.'},
 '3':{'rule':'One mark per suitable word. Accept a defensible equivalent if grammar and passage meaning remain accurate.'},
 '4':{'rule':'One mark per appropriate contextual synonym/antonym, including accurate alternatives not listed.'},
 '5':{'rule':'One mark per correct information cell; accept numerals or words.'},
 '6':{'rule':'For a true statement, 1 for True; for a false statement, 0.5 for False and 0.5 for an accurate correction. This split is author-proposed, not asserted as an official instruction.'},
 '7':{'components':{'mainIdeas':4,'selectionAndConcision':2,'coherenceAndOwnWording':2,'language':2}},
 '8':{'rule':'One mark for each correctly matched complete sentence.'},
 '9':{'rule':'One mark for each letter in its correct position. This partial-credit method is author-proposed.'},
 '10':{'rule':'Mark the first five responses submitted: each receives 1 for an accurate relevant idea and 1 for supporting explanation/detail. Teacher must announce any different excess-answer policy before use.'},
 '11':{'components':{'relevantPlotAndResolution':4,'coherence':2,'languageAndPunctuation':2,'tenNewSentences':1,'title':1}},
 '12':{'components':{'relevantContent':4,'organisation':2,'languageAndMechanics':3,'requestedLength':1}},
 '13':{'components':{'relevantPurpose':4,'logicalTurnTaking':2,'naturalPoliteLanguage':2,'grammarAndPunctuation':2}}
}
p=dict(id='class6-english1-model01-textbook-sample-draft',status='COMPLETE_PAPER_DRAFT_NOT_REGISTERED',teacherApproved=False,registered=False,officialCircularVerified=False,fullModelTest=True,totalMarks=100,durationMinutes=180,readingMarks=70,writingMarks=30,alignment='Supplied NCTB 2026 textbook sample, printed 101–105 / PDF 106–110; separate current circular applicability unverified.',sourceSha256=l5['source']['sha256'],sourceReview='See CLASS6-ENGLISH1-SOURCE-REVIEW.md. Seen passages manually transcribed from cited pages; minor punctuation/line-break normalisation only.',passages=passages,questions=Q,markingRubrics=rubrics,limitations=['Complete draft paper, not a teacher-approved or official examination.','U1 reuses original practice pack 002 and must be replaced if already exposed to the pupils.','Detailed partial-credit rubrics and excess-answer policy are author-proposed, not copied official instructions.','Seen health passage is assessed for English comprehension, not a clinical definition of health or a treatment recommendation.','Reading 70/Writing 30 and time follow the textbook sample; this does not verify a separate current circular.'])
assert sum(q['marks'] for q in Q)==100 and sum(q['marks'] for q in Q[:10])==70
qs=['# Class 6 — English First Paper\n## Model Test 01 · Draft\nTime: 3 hours · Full marks: 100\n\nAligned to the supplied NCTB 2026 textbook sample. Teacher review pending; not an official examination. Answer all questions except Q10: answer any five.\n','## Part A — Reading (70 marks)']
ans=['# Model Test 01 — Teacher answer paper\n\nDraft · Teacher review pending. Accept accurate alternative wording. Detailed partial-credit rubrics below are author-proposed, not verified official rules.\n']
for q in Q:
 n=q['number']
 if n in [1,3,5]:
  s=next(s for s in passages if s['id']==q['passageId']);qs.extend([f"### Read {s['id']} and answer questions {n}–{n+1 if n<5 else 7}",s['text']])
 if n==11:qs.append('## Part B — Writing (30 marks)')
 qs.extend([f"### {n}. {q['instruction']}"]);ans.append(f"## {n}. Answers ({q['marks']} marks)")
 if q.get('opening'):qs.append(q['opening']);ans.append('Title: '+q['modelTitle'])
 for i,x in enumerate(q.get('items',[]),1):
  text=x.get('question',x.get('statement',x.get('word','')))+(' — '+x['request'] if 'request' in x else '')
  if n==10:text='['+x['poem']+'] '+text
  qs.append(f'{i}. {text}')
  if 'options' in x:
   qs.extend(f"   {k}. {v}" for k,v in x['options'].items());ans.append(f"{i}. {x['answer']}. {x['options'][x['answer']]}. {x['explanation']}")
  elif 'answer' in x:ans.append(f"{i}. {'True' if x['answer'] else 'False'}"+(' — '+x['correction'] if x.get('correction') else ''))
  else:ans.append(f"{i}. "+x.get('modelAnswer','; '.join(x.get('acceptedAnswers',[]))))
 if q.get('text'):qs.append(q['text'])
 if q.get('rows'):
  qs.append('\n'.join(['| Detail | Information |','| --- | --- |']+['| '+' | '.join(row)+' |' for row in q['rows']]))
 if q.get('beginnings'):
  qs.append('\n'.join(['| Column A | Column B |','| --- | --- |']+[f"| {k}. {v} | {e}. {ending} |" for (k,v),(e,ending) in zip(q['beginnings'].items(),q['endings'].items())]))
 if q.get('sentences'):qs.extend(f'{k}. {v}' for k,v in q['sentences'].items());ans.append('Correct order: '+' → '.join(q['answer']))
 if q.get('answers'):ans.append('; '.join(f'{k}: {v}' for k,v in q['answers'].items()))
 if q.get('modelAnswer'):
  m=q['modelAnswer'];ans.extend([m] if isinstance(m,str) else [f"{x['speaker']}: {x.get('line',x.get('text',''))}" for x in m])
 ans.append('Marking guide: '+json.dumps(rubrics[str(n)],ensure_ascii=False))
ans.extend(['## Teacher use and provenance',*p['limitations'],'Seen S1: Lesson 5 printed 14–15. Seen S2: Lesson 9 printed 30. U1: original-skills-002. Poem sources: lessons 7, 16, 17, 27.'])
files={'model-01-draft.json':json.dumps(p,ensure_ascii=False,indent=2)+'\n','model-01-questions.md':'\n\n'.join(qs)+'\n','model-01-answers.md':'\n\n'.join(ans)+'\n'}
for name,text in files.items():
 if '--check' in sys.argv:assert (D/name).read_text()==text,name
 else:(D/name).write_text(text)
print('Model 01: complete 13-question Draft, 70+30=100, 180 minutes, eight poem choices/any five; no registration or approval.')
