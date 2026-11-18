"""Source-read initial pools, not full model papers. Reproduce with --check."""
import json,sys
from pathlib import Path
D=Path(__file__).resolve().parents[2]/'content/question-bank/class-6/english-1st'
SOURCE=json.loads((D/'lesson-01-source-draft.json').read_text())['source']
PAGE_MAP=json.loads((D/'printed-to-pdf-pages.json').read_text())
def ref(p):return f'Printed {p} / PDF {PAGE_MAP[str(p)]}'
def mcqs(rows):
 out=[]
 for i,(q,right,wrong,page,why) in enumerate(rows):
  opts=list(wrong);k=i%4;opts.insert(k,right)
  out.append(dict(question=q,options=dict(zip('ABCD',opts)),answer='ABCD'[k],page=ref(page),explanation=why))
 return dict(id='mcq',kind='seen-mcq',marks=None,instruction='Read the cited source section and choose the best answer. Different dialogues are separate source units.',items=out)
def sa(rows,id='short-answers',kind='seen-short-answer'):
 return dict(id=id,kind=kind,marks=None,instruction='Answer using the cited text. Equivalent accurate wording is acceptable; support interpretations with details.',items=[dict(question=q,modelAnswer=a,page=ref(p)) for q,a,p in rows])
def vocab(rows):return dict(id='vocabulary',kind='seen-vocabulary',marks=None,instruction='Explain the word in the cited context, or give the requested alternative meaning. Accept suitable equivalent wording.',items=[dict(word=w,request=r,acceptedAnswers=a,page=ref(p)) for w,r,a,p in rows])
def writing(id,instruction,model,note):return dict(id=id,kind=id+'-writing',marks=None,instruction=instruction,modelAnswer=model,note=note,assessment=['Addresses the task with relevant details','Uses a clear sequence and connected sentences','Uses suitable vocabulary and comprehensible grammar','Accept original accurate responses; do not require memorisation'])
def pack(n,title,pages,activities,notes):return dict(id=f'class6-english1-lesson{n:02}-source-draft-v1',category='Class 6',subject='English 1st Paper',topic=f'Lesson-{n:02}: {title}',status='SOURCE_READ_LESSON_DRAFT_NOT_REGISTERED',teacherApproved=False,fullModelTest=False,source={**SOURCE,'printedPages':pages,'pdfPages':[PAGE_MAP[str(p)] for p in pages]},passagePolicy='Use the specifically cited source section in the NCTB textbook. Full textbook passages and images are not reproduced. Original writing models are not source facts.',activities=activities,limitations=['Initial Draft pool, not exhaustive chapter quotas or a complete model paper.','Teacher review, Drive backup and website registration are separate steps.']+notes)
P=[]
P.append(pack(4,'Where Are You From?',list(range(9,13)),[
 mcqs([
 ('Why could Akash not hear the stranger’s name?','There was noise around them',['He had left the fair','The stranger refused to speak','Mamun had forgotten the name'],9,'The introductory situation explicitly mentions noise at the book fair.'),
 ('Where is James Collins from?','England',['Australia','Bangladesh','Canada'],9,'James gives England as his place of origin.'),
 ('Where is Robert Smith coming from on his current journey?','London',['Sydney','Dhaka','Sylhet'],10,'The officer distinguishes origin (Australia) from the place of immediate departure (London).'),
 ('Why is Sajed now in Khulna?','His father was transferred there',['He went to meet James','He is visiting a book fair','He is designing a school'],10,'Sajed explains that his father’s transfer is why he is there.'),
 ('What is Ruma’s profession?','An architect',['A librarian','A doctor','A pilot'],11,'Mamun names her profession before describing her current project.'),
 ('What is Ruma designing at the moment?','A school building',['A railway station','A new airport','A library catalogue'],11,'The present project is a school on the outskirts of Dhaka.'),
 ('What does the neighbour’s little boy’s mother do?','She works part-time at the Town Hall Library',['She designs airports','She studies with Sajed','She flies planes'],11,'Mary identifies the mother’s work; this does not prove the reason for the crying.')]),
 sa([
 ('How can Akash politely ask for a name he did not hear?','He can apologise and say, “I’m sorry, I couldn’t catch your name.”',9),
 ('Explain the difference between Robert’s answers Australia and London.','Australia identifies where he comes from; London is where he is coming from on this journey.',10),
 ('How does Joy welcome Sajed?','Joy says that he is sure Sajed will like Khulna and the school, and tells him that they are already friends.',10),
 ('How is Ruma’s current work different from her usual work?','She usually designs offices and shopping complexes. At the moment she is designing a school building.',11),
 ('Is the reason for the little boy’s crying certain? Explain.','No. Rabeya suggests he may be hungry, while Mary suggests he may be crying for his mother. Both are guesses.',11)]),
 vocab([('catch','meaning when hearing a name',['hear and understand'],9),('transferred','meaning in Sajed’s explanation',['moved to another work location'],10),('architect','meaning',['a person who designs buildings'],11),('outskirts','meaning',['outer parts of a town or city'],11),('profession','meaning',['occupation','type of work'],12)]),
 sa([('What is the difference between asking what someone does and what someone is doing?','“What do you do?” asks about a profession or usual work in this context. “What are you doing?” asks about the activity at the moment or around that time.',12),('How could Joy ask about Sajed’s place of origin in another way?','He could ask, “Where are you from, Sajed?”',10)],'language-use','functional-language'),
 writing('dialogue','Imagine a friend introduces you to a new person at a noisy bus station. Write a short conversation, including a polite request to repeat the name.',[
 dict(speaker=s,text=t) for s,t in [('Rafi','Mina, this is my friend Karim.'),('Mina','Hello. I’m sorry, I couldn’t hear your name because of the noise.'),('Karim','My name is Karim. Nice to meet you.'),('Mina','Nice to meet you too. Where are you from?'),('Karim','I’m from Rajshahi. How about you?'),('Mina','I’m from Sylhet. Are you travelling today?'),('Karim','Yes, I’m waiting here with my family.'),('Rafi','Let’s move away from the crowd so we can talk more easily.')]],'Original practice characters and travel details, not a continuation claimed from the textbook. No official turn limit is asserted.')],['Reading dialogue does not assess listening or pronunciation; those need teacher-led oral practice.','The boy’s reason for crying remains uncertain; do not convert a guess into fact.']))
P.append(pack(5,'Thanks for Your Work',list(range(13,17)),[
 mcqs([
 ('Where does Bulbul collect rubbish?','The Sankar area in Dhaka',['A town in England','The airport in Sylhet','A fair in Khulna'],14,'Section B identifies the locality and city.'),
 ('When does Bulbul wake up each morning?','At five o’clock',['At six o’clock','At seven o’clock','At eight o’clock'],14,'The passage explicitly states 5 o’clock.'),
 ('Where do residents leave their rubbish for collection?','In plastic bins in front of their houses',['Inside the railway office','On the roofs of their homes','At the school gate'],14,'The collection arrangement is described in Section B.'),
 ('What does Bulbul use to carry the collected rubbish?','His van',['A train','A passenger bus','A boat'],14,'He empties the bins and puts their contents in his van.'),
 ('Why did Bulbul miss two days of work last month?','He was sick',['He went on holiday','He changed jobs','He lost his way'],15,'The reason for absence is illness, not unwillingness to work.'),
 ('What happened while Bulbul could not collect rubbish?','The area became dirty and unhygienic',['The bins remained empty','The rubbish disappeared','The roads became cleaner'],15,'Piles accumulated outside houses during his absence.'),
 ('What belief about work does Bulbul express?','All jobs are important',['Only office jobs matter','Cleaning never helps anyone','Every job has the same timetable'],14,'This belief is explicit; it does not mean all jobs have identical tasks.')]),
 sa([
 ('How does Bulbul collect rubbish from the houses?','He goes from door to door, takes the rubbish from the bins and puts it in his van.',14),
 ('What did Bulbul do after recovering from illness?','He returned to Sankar and collected everything from the bins.',15),
 ('How does his absence show the value of his work?','When he was absent, rubbish piled up and the area became unhygienic. This shows that his regular work helps keep the neighbourhood clean.',15),
 ('According to Bulbul, what might happen if his work stopped for a few days?','He believes the whole area would turn into a large dump because rubbish would remain uncollected.',15),
 ('What respectful thing could you say to Bulbul?','I could say, “Thank you for helping to keep our neighbourhood clean. Your work is important.”',15)]),
 vocab([('rubbish','meaning',['waste material','things thrown away'],14),('collect','meaning',['gather together'],14),('piles','meaning',['heaps'],15),('unhygienic','meaning',['unclean in a way that can harm health','not sanitary'],15),('realises','meaning',['understands','becomes aware'],15)]),
 sa([('Change “wakes up” to its simple past form.','woke up',16),('Change “collects” to its simple past form.','collected',16),('Change “takes” to its simple past form.','took',16),('Change “got” to its base form.','get',16),('Change “became” to its base form.','become',16)],'verb-forms','language-practice'),
 writing('paragraph','Imagine a person whose work helps your community. Describe the person’s work and explain its value. No fixed word count is imposed for this lesson task.','A cleaner helps to keep the lane near our home tidy. She starts work early and sweeps the common spaces carefully. She collects waste using suitable tools and places it in the collection area. Her work makes the lane more pleasant for everyone. If rubbish were left there, it could pile up and create unhealthy conditions. We should not make her work harder by throwing litter on the ground. I can help by using the correct bins and keeping sharp waste safely separated for responsible adults to manage. I respect her work and thank her for her service.','Original imagined community example; working hours, actions and identity are not additional facts about Bulbul. Illness is not the worker’s fault; pupils should not handle hazardous waste.')],['Respect workers’ dignity and the need for safe working conditions; do not blame illness or encourage unsafe waste handling.','The sample exam repeats the Bulbul source; these newly authored items are lesson practice, not a copied sample paper.']))
P.append(pack(6,'It Smells Good!',[17,18],[
 mcqs([
 ('What day is it in Mila’s family scene?','Saturday',['Sunday','Monday','Wednesday'],17,'The opening sentence supplies the day within this story.'),
 ('Where is Mila’s father when she arrives home?','In the kitchen',['At the airport','In a library','At the station'],17,'Her mother answers Mila’s question about her father.'),
 ('What is Mila’s mother doing?','Setting the table',['Reading at school','Driving a van','Serving customers at a restaurant'],17,'The introductory paragraph gives her current activity.'),
 ('Who are playing in the living room?','Mila’s two younger sisters',['Mila’s teachers','Her elder brothers','The restaurant cooks'],17,'The text names the children and the relationship.'),
 ('What must Mila do before trying the food?','Wash her hands',['Buy a ticket','Finish a music album','Leave the house'],17,'Her father asks her to wash her hands first.'),
 ('Why is Shikha Banu helping in the kitchen today?','The chief cook has fallen ill',['The restaurant has closed','Priyam is the chief cook','She has stopped working permanently'],18,'The illness explains a temporary change in duties.'),
 ('Who is Priyam?','Shikha Banu’s son',['Mila’s father','A railway officer','The restaurant owner'],18,'The A4 passage identifies him as her son.')]),
 sa([
 ('What dish is Mila’s father preparing, and how does Mila feel about it?','He is preparing moragpolau, her favourite dish. She says it smells good and later says it tastes delicious.',17),
 ('What does the story say about Mila’s father’s weekly holidays?','In the story his weekly holidays are Friday and Saturday; he sometimes enjoys cooking special dishes on Saturdays.',17),
 ('What is Shikha Banu’s usual job, and where does she work?','She works as a waitress in a restaurant in Chattogram.',18),
 ('What is Shikha Banu making while helping the other cooks?','She is making pudding.',18),
 ('What does Shikha Banu want to do when she returns home?','She wants to make pudding for her son Priyam.',18)]),
 vocab([('delicious','meaning',['very pleasant to taste','very tasty'],17),('favourite','meaning',['liked best'],17),('customers','meaning',['people who buy goods or services; here people served in the restaurant'],18),('chief','meaning in chief cook',['main','head'],18),('suddenly','meaning',['unexpectedly','all at once'],18)]),
 sa([('Choose the form for usual work: Shikha Banu works / is working as a waitress.','works',18),('Choose the form for today’s temporary activity: She helps / is helping the other cooks.','is helping',18),('Choose the form for the activity in progress: She makes / is making pudding.','is making',18),('Choose the form for the mental activity happening now: She thinks / is thinking of her son.','is thinking',18),('Choose the form for a state: Priyam loves / is loving pudding.','loves',18)],'verb-choice','language-practice'),
 writing('dialogue','Write a short conversation about your favourite food, where you usually eat it, who prepares it and how it tastes.',[
 dict(speaker=s,text=t) for s,t in [('Nila','What is your favourite food?'),('Omar','I like vegetable khichuri best.'),('Nila','Where do you usually have it?'),('Omar','I usually have it at home with my family.'),('Nila','Who prepares it?'),('Omar','My father usually prepares it, and I help set the table.'),('Nila','How does it taste?'),('Omar','It tastes delicious. We wash our hands before eating.')]],'Original fictional food preferences, not facts about Mila. No official dialogue length asserted.')],['Saturday school opening and the father’s holidays are story facts, not a statement about every current school calendar.','For verb choice, refer to the current activity versus a state; do not claim every verb is always excluded from continuous forms.']))
P.append(pack(7,'Holding Hands',[19,20],[
 sa([
 ('Who is credited as the poet of “Holding Hands” in this lesson?','The textbook credits Leonore M Link.',19),
 ('How are the elephants described as holding hands?','They are described as holding hands by holding one another’s tails.',19),
 ('Where do the elephants walk in the poem?','They walk along trails and in circus rings.',19),
 ('What does the poem suggest about trunks and tails?','It calls them handy things, showing that they are useful for keeping the elephants linked while walking.',19),
 ('Why is the title playful rather than a literal description of human hands?','Elephants do not hold human hands in the scene. The poet compares their trunk-and-tail connection with people holding hands.',19),
 ('What effect does repeating the idea of holding tails have?','The repetition emphasises how the elephants stay linked and gives the short poem a memorable rhythm.',19),
 ('What is one reasonable main idea of the poem? Support your answer.','One main idea is the connection of elephants moving together. The repeated image of holding tails presents them as a linked group, like people holding hands.',19),
 ('What does “It never fails” suggest in the poem’s playful description?','It suggests that the elephants keep doing this when they walk. This is the poem’s description, not scientific proof about every elephant.',19)],'poem','textbook-poem-answers'),
 vocab([('trails','meaning in the poem',['paths','tracks'],19),('handy','meaning in the poem',['useful','convenient'],19),('trunk','meaning for an elephant',['the elephant’s long nose'],20),('trunk','another meaning illustrated in the lesson',['the main woody stem of a tree','a large storage chest'],20),('ring','meanings illustrated outside the circus context',['a piece of jewellery worn on a finger','the sound made by a telephone'],20)]),
 writing('sentences','Use trunk and ring in four original sentences to show two different meanings of each.','The elephant lifted its trunk. A thick trunk supports the tree. My aunt wears a silver ring. I heard the ring of the telephone.','Original sentences, not lines from the poem; other clear uses are acceptable.')],['This lesson has poetry and wordplay, not a prose passage padded into seven MCQ.','These eight questions form a lesson pool, not eight compulsory exam responses. The textbook sample asks any five of eight offered poem questions.','Interpretations need textual support; the poem does not explicitly state a moral about human friendship or animal-training welfare.','No full poem reproduced.']))

def render(pack):
 n=int(pack['id'].split('lesson')[1][:2]);intro=f"# {pack['topic']}\n\nClass 6 · English 1st Paper · Draft · Teacher review pending\n\nSource: NCTB English for Today, revised for 2026. Printed pages {pack['source']['printedPages']}; PDF pages {pack['source']['pdfPages']}. Use the cited textbook sections. Not a full model test; marks unset.\n"
 qs=[intro,'## Student questions'];ans=[intro,'## Teacher answers','Accept equivalent accurate wording and supported interpretations.']
 for a in pack['activities']:
  qs.extend(['### '+a['id'],a['instruction']]);ans.append('### '+a['id'])
  for i,x in enumerate(a.get('items',[]),1):
   qs.append(f"{i}. "+x.get('question',x.get('word',''))+(' — '+x['request'] if 'request' in x else '')+' ['+x['page']+']')
   if 'options' in x:
    qs.extend(f'   {k}. {v}' for k,v in x['options'].items());ans.extend([f"{i}. {x['answer']}. {x['options'][x['answer']]}",x['explanation']])
   else:ans.append(f"{i}. "+x.get('modelAnswer','; '.join(x.get('acceptedAnswers',[]))))
  if 'modelAnswer' in a:
   m=a['modelAnswer'];ans.extend([m] if isinstance(m,str) else [f"{x['speaker']}: {x['text']}" for x in m])
  ans.extend('- '+s for s in a.get('assessment',[]))
  if a.get('note'):ans.append('Teacher note: '+a['note'])
 return {f'lesson-{n:02}-questions.md':'\n\n'.join(qs)+'\n',f'lesson-{n:02}-answers.md':'\n\n'.join(ans)+'\n'}
def save(pools):
 for p in pools:
  n=int(p['id'].split('lesson')[1][:2]);p['counts']={a['id']:len(a['items']) if 'items' in a else 1 for a in p['activities']}
  files={f'lesson-{n:02}-source-draft.json':json.dumps(p,ensure_ascii=False,indent=2)+'\n',**render(p)}
  for name,text in files.items():
   if '--check' in sys.argv:assert (D/name).read_text()==text,name
   else:(D/name).write_text(text)
if __name__=='__main__':
 save(P)
 print('Lessons 4–7: source-labelled initial pools and separate student/teacher papers; no registration or approval.')
