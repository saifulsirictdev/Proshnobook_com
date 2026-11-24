"""Mixed origin chapter6 drafts, owner-authorized after web research.
Fixed, individually transcribed sources first; explicit authored variants fill quota.
No network, DB, approval or deployment. --check verifies deterministic artifacts.
"""
from pathlib import Path
from collections import Counter
from fractions import Fraction as F
from math import gcd
from functools import reduce
import json,html,re,hashlib,sys
R=Path(__file__).resolve().parents[2];OUT=R/'content/question-bank/ssc/chemistry/chapter-6';DOC=R/'docs/question-bank/ssc-chemistry';ASSET=R/'public/question-bank/ssc-chemistry-ch6-v1';ASSET.mkdir(parents=True,exist_ok=True)
TOPIC='৬ষ্ঠ অধ্যায়: মোলের ধারণা ও রাসায়নিক গণনা';items=[];meta=[]
def enc(x):return json.dumps(x,ensure_ascii=False,indent=2)+'\n'
def save(p,s):
 if '--check' in sys.argv:assert p.exists() and p.read_text()==s,f'Stale {p}'
 else:p.parent.mkdir(parents=True,exist_ok=True);p.write_text(s)
def num(x):
 x=float(x)
 return str(int(round(x))) if abs(x-round(x))<1e-9 else f'{x:.5f}'.rstrip('0').rstrip('.')
def pic(name):return f'![প্রশ্নের চিত্র](https://proshnobook.com/question-bank/ssc-chemistry-ch6-v1/{name})'
def originalpic(url):return f'![মূল উদ্দীপক](https://proshnobook.com{url})'
def add(kind,text,solution,family,origin='AUTHORED_BOARD_STYLE',**kw):
 info=kw.pop('metadata',{});ref=kw.pop('reference',None)
 page=ref or 'নিজস্ব বোর্ড-ধাঁচের অনুশীলনী; আসল বোর্ড প্রশ্ন নয়'
 items.append(dict(type=kind,text=text,explanation=solution,page=page,difficulty=kw.pop('difficulty','MEDIUM'),**kw))
 meta.append(dict(origin=origin,family=family,sourceQuestionVerbatim=origin!='AUTHORED_BOARD_STYLE',originalPractice=origin=='AUTHORED_BOARD_STYLE',answerOrigin='ASSISTANT_AUTHORED_SOLUTION_NOT_SOURCE_ANSWER',board=None,examYear=None,teacherApproved=False,**info))
def mcq(q,a,why,family,w=None,**kw):
 a=str(a)
 if w is None:
  val=F(a);pool=[val*2,val/2,val*3,val+1,val+2,val+3];w=[]
  for v in pool:
   s=num(v)
   if s!=a and s not in w:w.append(s)
   if len(w)==3:break
 assert len(w)==3 and len(set([a,*w]))==4,(q,a,w)
 pos=sum(x['type']=='MCQ' for x in items)%4;opts=[*w];opts.insert(pos,a)
 add('MCQ',q,why,family,options=dict(zip('ABCD',opts)),correct='ABCD'[pos],**kw)
def cq(stem,parts,family,**kw):
 add('CQ',stem,'উপপ্রশ্নভিত্তিক নিজস্ব নমুনা সমাধান; স্বাধীন শিক্ষক যাচাই বাকি।',family,difficulty='HARD',parts=[dict(label=l,question=q,solution=a,marks=i) for i,(l,(q,a)) in enumerate(zip('কখগঘ',parts),1)],**kw)
def sq(q,a,family,**kw):add('SQ',q,a,family,**kw)
# Fixed textbook questions remain separate and unchanged in source-only intake.
tb=json.loads((R/'content/question-bank/ssc/chemistry/chapter-6-source-v1/questions.json').read_text())
tb_mcq_answers=[('C','STP-তে আদর্শ গ্যাসের জন্য V=n×22.4; H2-এর n=2/2=1 mol, V=22.4 L।'),('D','Ca2+ ও PO4^3−-এর আধান সাম্য:3×2=2×3; Ca3(PO4)2।'),('A','Cl2-এর n=75/71 mol; Cl পরমাণুর সংখ্যা=(75/71)×2×6.02×10^23≈1.27×10^24।'),('A','H2+Cl2→2HCl; H2=5/2=2.5 mol, Cl2=75/71 mol; অবশিষ্ট H2=2.5−75/71≈1.44 mol।'),('C','m=(N/NA)M=(2×10^23)/(6.02×10^23)×44≈14.6 g।'),('B','পাঠ্যবইয়ের অণু শব্দটি অপরিবর্তিত। CaCO3 আয়নিক পদার্থ, বৈজ্ঞানিকভাবে সংকেত একক বলা যথার্থ। N=(10/100)×6.02×10^23=6.02×10^22টি সংকেত একক।')]
for x in tb['items']:
 info=dict(sourceRecordId=x['id'],source=x['source'],questionImage=x['questionImage'],sourceMarksPresent=False,marksOrigin='APPLICATION_PRACTICE_CONVENTION_NOT_SOURCE',notes=x.get('sourceNotes',[]))
 ref=f'পাঠ্যবই পৃ. {x["source"]["printedPage"]}, প্রশ্ন {x["sourceQuestionNumber"]}; প্রশ্ন হুবহু, সমাধান নিজস্ব'
 n=x['sourceQuestionNumber'];text=x['text']
 if x['type']=='MCQ':
  if x.get('stimulusText'):text=x['stimulusText']+'\n\n'+originalpic(x['stimulusImages'][0])+'\n\n'+text
  ans,why=tb_mcq_answers[n-1]
  add('MCQ',text,why,'textbook-mcq',origin='TEXTBOOK_VERBATIM',reference=ref,metadata=info,options=dict(zip('ABCD',x['options'].values())),correct=ans)
 elif x['type']=='CQ':
  if n==1:
   text=originalpic(x['stimulusImages'][0]);sols=['SI-তে পদার্থের পরিমাণের একক মোল; এক মোলে ঠিক6.02214076×10^23 নির্দিষ্ট কণা থাকে। অধ্যায়ের গণনায় NA≈6.02×10^23 mol−1।','স্থূল সংকেত পরমাণুর সরলতম পূর্ণসংখ্যার অনুপাত, আণবিক সংকেত প্রকৃত সংখ্যা; গ্লুকোজের CH2O ও C6H12O6।','HCl+NaOH→NaCl+H2O। NaCl-এ Na%=23/58.5×100≈39.32%; Cl%=35.5/58.5×100≈60.68%।','চিত্রে উভয় পাত্রে4g দ্রব ও100mL দ্রবণ। HCl:M=(4/36.5)/0.1≈1.09589M; NaOH:M=(4/40)/0.1=1M। সমান নয়।']
  else:sols=['প্রতীক, সংকেত ও সহগ দিয়ে রাসায়নিক বিক্রিয়া প্রকাশকে রাসায়নিক সমীকরণ বলে; সমতাকৃত রূপে প্রতি মৌলের পরমাণুসংখ্যা সংরক্ষিত।','CO2-এর এক মোলের ভর44g। STP(0°C,1atm)-তে আদর্শ গ্যাস ধরে এক মোলের আয়তন22.4L।','CO2-এর মোল=4.4/44=0.1mol।','CaO+CO2→CaCO3। CaO=5/56mol<0.1mol; CaO লিমিটিং। তাত্ত্বিক CaCO3=(5/56)×100≈8.92857g,10g নয়। অবশিষ্ট CO2=4.4−(5/56)×44≈0.47143g।10g পেতে5.6g CaO লাগত।']
  cq(text,[(p['question'],a) for p,a in zip(x['parts'],sols)],'textbook-cq',origin='TEXTBOOK_VERBATIM',reference=ref,metadata=info)
 else:
  sols=['0.5M অর্থ প্রতি লিটার চূড়ান্ত দ্রবণে0.5mol Na2CO3। Mr=106;1L-এ53g দ্রব থাকে।','মোলারিটি M=n/V(L)। V স্থির হলে n বাড়লে M সমানুপাতে বাড়ে; শুধু n দিয়ে আয়তন ছাড়া M নির্ণয় হয় না।','n=MV=0.1×0.1=0.01mol; বিশুদ্ধ H2SO4-এর ভর0.01×98=0.98g। প্রস্তুতি কেবল প্রশিক্ষিত শিক্ষকের তত্ত্বাবধানে: উপযুক্ত PPE ও শীতলীকরণে মাপা অ্যাসিড ধীরে পানিতে যোগ, ঠান্ডা হলে চূড়ান্ত আয়তন100mL। পানিকে ঘন অ্যাসিডে ঢালা নয়। স্টক দ্রবণের ঘনমাত্রা দেওয়া নেই, তাই তার আয়তন অনুমান নয়।']
  sq(text,sols[n-1],'textbook-sq',origin='TEXTBOOK_VERBATIM',reference=ref,metadata=info)
web=json.loads((R/'content/question-bank/ssc/chemistry/chapter-6-web-intake.json').read_text())
webwhy=['H2O-এর মোলার ভর=2×1+16=18g mol−1।','দ্রাবক পানি বলে জলীয় দ্রবণ।','CH-এর সংকেত ভর13;78/13=6; (CH)6=C6H6।','বিক্রিয়কের সঙ্গে উৎপাদের পরিমাণগত সম্পর্ক স্টয়কিওমিতির বিষয়।','CH2O-এর সংকেত ভর30;180/30=6; C6H12O6।','C6H12O6-এর Mr=6×12+12×1+6×16=180।','অন্য বিক্রিয়কের পর্যাপ্ততা ধরে লিমিটিং বিক্রিয়ক তাত্ত্বিক সর্বাধিক উৎপাদ নির্ধারণ করে; বাস্তব ফলনের জন্য শতকরা ফলনও প্রয়োজন।','মোলার আয়তন=আয়তন/মোলসংখ্যা; এক মোল পদার্থের আয়তন।']
wi=0
for x in web['items']:
 src=web['sources'][x['source']];info=dict(webSourceKey=x['source'],url=src['url'],sourceQuestionNumber=x['number'],sourceMarksPresent=x['type']=='CQ',notes=x.get('notes',[]));ref=f'ওয়েব: {x["source"]}, প্রশ্ন {x["number"]}; প্রশ্ন অপরিবর্তিত, সমাধান নিজস্ব'
 if x['type']=='MCQ':
  add('MCQ',x['text'],webwhy[wi],'web-mcq',origin='WEB_VERBATIM',reference=ref,metadata={**info,'sourceCorrect':x['sourceCorrect']},options=dict(zip('ABCD',x['options'])),correct=x['sourceCorrect']);wi+=1
 elif x['type']=='CQ':
  sols=['ধাতব গঠনে ধনাত্মক ধাতব কোর এবং বিস্তৃত সঞ্চরণশীল ইলেকট্রনের মধ্যকার স্থিরবৈদ্যুতিক আকর্ষণ ধাতব বন্ধন।','N2+O2→2NO; উপাদান মৌল থেকে সরাসরি যৌগ তৈরি, তাই সংশ্লেষণ।','NO-এর মোলার ভর30g/mol;10g-এ N=(10/30)×6.02×10^23≈2.00667×10^23টি অণু।','পাঠ্যবইয়ের আদর্শ পরিমাণগত মডেলে বিক্রিয়া সম্পূর্ণ ধরা হয়েছে। n(N2)=30/28mol,n(O2)=20/32=0.625mol।1:1 অনুপাতে O2 লিমিটিং। N2 ব্যবহৃত=0.625×28=17.5g; অবশিষ্ট=12.5g। বাস্তবে NO উৎপাদন সাম্যাবস্থা/তাপমাত্রা নির্ভর; এটি শিক্ষার্থীর জন্য পরীক্ষণ নির্দেশ নয়। ওয়েব সমাধানের12.32g আগাম rounding/গাণিতিক ভুল; সেই উত্তর নকল করা হয়নি।']
  cq(x['text'],list(zip(x['parts'],sols)),'web-cq',origin='WEB_VERBATIM',reference=ref,metadata=info)
 else:
  sols={'জ্ঞানমূলক২':'নির্দিষ্ট তাপমাত্রায় প্রতি লিটার চূড়ান্ত দ্রবণে দ্রবের মোলসংখ্যা; M=n/V(L), এককmol L−1।','জ্ঞানমূলক৩':'কোনো পদার্থের আয়তন ও মোলসংখ্যার অনুপাত, Vm=V/n; এক মোলের আয়তন। পদার্থ, অবস্থা, তাপমাত্রা ও চাপ উল্লেখ করতে হয়।','জ্ঞানমূলক৪':'0.1M দ্রবণ; প্রতি লিটার চূড়ান্ত দ্রবণে0.1mol দ্রব থাকে।','অনুধাবনমূলক৪':'প্রতি লিটার চূড়ান্ত দ্রবণে0.01mol HCl থাকে। HCl-এর মোলার ভর36.5g/mol ধরে1L-এ0.365g HCl।','অনুধাবনমূলক৬':'তাপমাত্রায় দ্রবণের আয়তন বদলাতে পারে; রাসায়নিক পরিবর্তন/বাষ্পীভবন না হলে n স্থির থাকলেও M=n/V বদলায়।','অনুধাবনমূলক১২':'NaCl-এর সংকেত ভর=23+35.5=58.5। ক্লোরিনের শতকরা সংযুতি=35.5/58.5×100≈60.68376%।'}
  sq(x['text'],sols[x['number']],'web-sq',origin='WEB_VERBATIM',reference=ref,metadata=info)
# All following questions explicitly authored; values are exercise data, not observations.
BASE='''মোল কোন রাশির SI একক?|পদার্থের পরিমাণ|ভর|আয়তন|তাপমাত্রা|মোল পদার্থের পরিমাণের একক; কণার ধরন নির্দিষ্ট করতে হয়।
অ্যাভোগেড্রো ধ্রুবকের একক কোনটি?|mol−1|g mol−1|mol L−1|L mol−1|N=nNA; তাই NA-এর এককmol−1।
এক মোল O ও এক মোল O2-এর কোনটি সমান?|নির্দিষ্ট কণার সংখ্যা|ভর|প্রতি কণায় পরমাণুসংখ্যা|রাসায়নিক সংকেত|এক মোলে সমান সংখ্যক নির্দিষ্ট কণা; O পরমাণু ও O2 অণু পৃথক কণা।
এক মোল NaCl কঠিনে যথার্থ গণনাযোগ্য একক কোনটি?|সংকেত একক|স্বাধীন NaCl অণু অবশ্যই|কেবল নিউট্রন|কেবল প্রোটন|আয়নিক জালকে Na:Cl-এর1:1 অনুপাতকে সংকেত একক বলা হয়।
আপেক্ষিক আণবিক ভরের একক কী?|একক নেই|g|mol|L|এটি নির্দিষ্ট মানদণ্ডের সাপেক্ষে অনুপাত; মোলার ভরের g/mol একক আছে।
কোন সম্পর্কটি মোলসংখ্যা দেয়?|n=m/Mm|n=m×Mm|n=Mm/m|n=m+Mm|m গ্রাম এবং Mm g/mol হলে ভাগফল mol।
মোলারিটি নির্ণয়ে কোন আয়তন ব্যবহার হয়?|চূড়ান্ত দ্রবণের আয়তন|শুধু দ্রাবকের প্রাথমিক আয়তন|দ্রবের কঠিন আয়তন|পাত্রের ধারণক্ষমতা যেকোনোটি|M=n/V; V হলো চূড়ান্ত দ্রবণের লিটার আয়তন।
দ্রবণের মোলারিটি দ্বিগুণ করতে n অপরিবর্তিত রেখে V কেমন হবে?|অর্ধেক|দ্বিগুণ|চারগুণ|অপরিবর্তিত|M ও V বিপরীতানুপাতিক যখন n স্থির।
লঘুকরণে দ্রব নষ্ট না হলে কোনটি অপরিবর্তিত?|দ্রবের মোলসংখ্যা|মোলারিটি|চূড়ান্ত আয়তন|পানির পরিমাণ|M1V1=M2V2 হলো দ্রবের মোল সংরক্ষণ।
সমীকরণ সমতা করতে কোনটি বদলানো যায়?|পদার্থের আগের সহগ|সংকেতের নিম্নসূচক|মৌলের প্রতীক|পারমাণবিক সংখ্যা|নিম্নসূচক বদলালে পদার্থই বদলে যায়।
সমতাকৃত সমীকরণে সহগ সাধারণত কী অনুপাত দেয়?|মোলের অনুপাত|সব পদার্থের ভরের একই অনুপাত|ঘনত্বের অনুপাত|তাপমাত্রার অনুপাত|সহগ কণা/মোল অনুপাত; ভরের জন্য মোলার ভর প্রয়োজন।
লিমিটিং বিক্রিয়ক নির্বাচন করতে কোনটি তুলনা করতে হয়?|মোলসংখ্যা/স্টয়কিওমিতিক সহগ|শুধু ভর|শুধু বর্ণ|শুধু ঘনত্ব|ক্ষুদ্রতম n/সহগ বিক্রিয়ার পরিমাণ সীমিত করে।
অতিরিক্ত বিক্রিয়কের সবটুকু সবসময় বিক্রিয়া করে কি?|না, লিমিটিং বিক্রিয়ক ফুরোলে কিছু থাকে|হ্যাঁ সবসময়|হ্যাঁ, সমীকরণে থাকলেই|না, কোনো অংশই করে না|আদর্শ সম্পূর্ণ বিক্রিয়ায় লিমিটিং অংশ ফুরোনোর পর অতিরিক্ত অংশ অবশিষ্ট থাকে।
বিশুদ্ধতার শতাংশ কোন অনুপাতের শতগুণ?|বিশুদ্ধ অংশের ভর/নমুনার ভর|নমুনার ভর/বিশুদ্ধ অংশের ভর|উৎপাদের মোল/দ্রবণের আয়তন|কেবল অমিশ্রতার ভর|নমুনায় নিষ্ক্রিয় অমিশ্রতা থাকলে কার্যকর বিক্রিয়কের ভর কমে।
শতকরা ফলনের সংজ্ঞা কোনটি?|প্রকৃত ফলন/তাত্ত্বিক ফলন×100|তাত্ত্বিক/প্রকৃত×100|বিক্রিয়কের ভর×100|শুধু উৎপাদের ভর|তাত্ত্বিক ফলন নির্ধারণে বিশুদ্ধ কার্যকর লিমিটিং বিক্রিয়ক বিবেচ্য।
আদর্শ হিসাবে শতকরা ফলন100-এর বেশি পেলে কী আগে যাচাই করা উচিত?|উৎপাদের ভেজাভাব/অমিশ্রতা ও মাপজোখ|পরমাণু সৃষ্টি হয়েছে নিশ্চিত|ভর সংরক্ষণ চিরতরে ভুল|NA বদলে গেছে|ভেজা বা অশুদ্ধ উৎপাদে আপাত ভর বাড়তে পারে; বিশুদ্ধ শুকনো উৎপাদ/সঠিক তত্ত্ব পরীক্ষা দরকার।
স্থূল সংকেত কী প্রকাশ করে?|পরমাণুর সরলতম পূর্ণসংখ্যার অনুপাত|অণুর আকৃতি|সবসময় প্রকৃত পরমাণুসংখ্যা|বিক্রিয়ার গতি|আণবিক সংকেত থেকে সূচকের গসাগু দিয়ে ভাগে স্থূল সংকেত পাওয়া যায়।
মোলার ভর ছাড়া শুধু স্থূল সংকেত দিয়ে কোনটি সাধারণত অনির্দিষ্ট?|আণবিক সংকেতের গুণক|মৌলের পরিচয়|পরমাণুর সরল অনুপাত|স্থূল সংকেতের ভর|n=আণবিক ভর/স্থূল সংকেত ভর; উপরের ভর না জানলে n এককভাবে স্থির নয়।
STP-তে22.4L/mol ব্যবহার কোন ক্ষেত্রে স্কুলের আদর্শ আসন্নমান?|আদর্শ গ্যাস,0°C ও1atm|সব তরল|সব কঠিন|সব তাপমাত্রায় সব গ্যাস|চাপ1bar হলে মোলার আয়তনের মান আলাদা; এখানে1atm রীতি স্পষ্ট।
এক মোল তরল পানির আয়তন22.4L বলা কেন ঠিক নয়?|গ্যাসের STP নিয়ম তরলে প্রয়োগ নয়|পানিতে অণু নেই|পানির ভর শূন্য|NA পানিতে ভিন্ন|মোলার আয়তন অবস্থাভেদে বদলায়;22.4L আদর্শ গ্যাসের নির্দিষ্ট শর্তের মান।
বন্ধ সিস্টেমে সাধারণ রাসায়নিক বিক্রিয়ায় কোনটি সংরক্ষিত?|মোট ভর|প্রতি প্রজাতির মোলসংখ্যা|গ্যাসের মোট আয়তন সবসময়|মোট অণুসংখ্যা সবসময়|পরমাণুর পুনর্বিন্যাস হয়; অণু/মোলের মোট সংখ্যা বদলাতে পারে।
নির্দিষ্ট যৌগে ভরের ভিত্তিতে মৌলগুলোর শতকরা সংযুতির যোগ কত?|100%|50%|200%|0%|পূর্ণ যৌগের সব মৌলের ভর মিলে মোট ভর।
ঘনমাত্রা0.5M ও0.1M-এর মধ্যে সমান দ্রবণ আয়তনে কোনটিতে দ্রব বেশি?|0.5M-এ পাঁচগুণ|0.1M-এ পাঁচগুণ|সমান|0.5M-এ অর্ধেক|n=MV; সমান V-তে অনুপাত0.5:0.1=5:1।
মিলিলিটারকে লিটারে নিতে কোন কাজটি সঠিক?|1000 দিয়ে ভাগ|1000 দিয়ে গুণ|100 দিয়ে গুণ|10 দিয়ে ভাগ|1000mL=1L।
একই তাপমাত্রা ও চাপে সমান আদর্শ গ্যাস আয়তনে কী সমান?|অণুসংখ্যা|প্রতিটি গ্যাসের ভর|মোলার ভর|প্রতি অণুর ভর|অ্যাভোগেড্রোর সূত্রে একই T,P-তে V∝n।
গ্যাসের ঘনত্ব d ও মোলার ভর Mm-এর STP সম্পর্ক কোনটি?|d=Mm/22.4|d=22.4/Mm|d=Mm×22.4|d=Mm+22.4|d=m/V; এক মোলের জন্য m=Mm g,V=22.4L।
NaOH দ্রবণ তৈরিতে চূড়ান্ত আয়তনের দাগে কখন সমন্বয় করা উচিত?|দ্রবণ নির্ধারিত তাপমাত্রায় ঠান্ডা হলে|উত্তপ্ত অবস্থায় যেকোনো সময়|দ্রব না গলিয়েই|পানি না দিয়েই|দ্রবীভবনে তাপ সৃষ্টি ও আয়তন পরিবর্তন হয়; প্রশিক্ষিত তত্ত্বাবধান প্রয়োজন।
রাসায়নিক সমীকরণে গ্যাস নির্গত হলে খোলা পাত্রের মাপা ভর কমার কারণ কী?|গ্যাস সিস্টেমের বাইরে চলে যায়|পরমাণু ধ্বংস হয়|মোলার ভর ঋণাত্মক হয়|NA শূন্য হয়|সীমানার বাইরে ভর যাওয়াকে ভর সংরক্ষণ ভঙ্গ বলা যায় না।
N=nNA সূত্রে N কী?|নির্দিষ্ট কণার সংখ্যা|মোলারিটি|দ্রবণের লিটার আয়তন|আপেক্ষিক আণবিক ভর|পরমাণু/অণু/আয়ন/সংকেত একক কোনটি গোনা হচ্ছে তা বলতে হয়।
কোন দ্রবণকে সেমিমোলার বলা হয়?|0.5mol/L|0.05mol/L|0.1mol/L|5mol/L|সেমিমোলার0.5M; ডেসিমোলার0.1M।'''
base=[l.split('|') for l in BASE.splitlines()];assert len(base)==30
for q,a,b,c,d,why in base:mcq(q,a,why,'concept-mcq',w=[b,c,d])
# Formula parser and exact integer/half-integer atomic weights; no eval.
AW={'H':F(1),'C':F(12),'N':F(14),'O':F(16),'Na':F(23),'Mg':F(24),'Al':F(27),'P':F(31),'S':F(32),'Cl':F('35.5'),'K':F(39),'Ca':F(40),'Fe':F(56),'Cu':F('63.5'),'Zn':F(65)}
def parse(s):
 tokens=re.findall(r'[A-Z][a-z]?|\d+|[()]',s);assert ''.join(tokens)==s;stack=[{}];i=0
 while i<len(tokens):
  t=tokens[i];i+=1
  if t=='(':stack.append({});continue
  if t==')':comp=stack.pop()
  else:assert t in AW,t;comp={t:1}
  k=1
  if i<len(tokens) and tokens[i].isdigit():k=int(tokens[i]);i+=1
  for el,v in comp.items():stack[-1][el]=stack[-1].get(el,0)+k*v
 assert len(stack)==1;return stack[0]
def mass(s):return sum(AW[e]*n for e,n in parse(s).items())
def weights(s):return 'Ar: '+', '.join(f'{e}={num(AW[e])}' for e in parse(s))
MOLS=[F(1,10),F(1,4),F(2,5),F(3,5),F(3,4)]
COMPOUNDS=['H2O','CO2','NH3','CH4','O2','N2','H2','NaCl','NaOH','H2SO4','CaCO3','Na2CO3','MgO','Al2O3','Ca(OH)2','KNO3','CaCl2','CuSO4','C6H12O6','HNO3']
for f in COMPOUNDS:
 mm=mass(f)
 for k,n in enumerate(MOLS):
  m=n*mm
  inputs=dict(formula=f,massG=num(m),molarMass=num(mm),expected=num(n))
  mcq(f'{num(m)}g বিশুদ্ধ {f}-এ কত mol নির্দিষ্ট কণা আছে? ({weights(f)})',num(n),f'Mm={num(mm)}g/mol; n=m/Mm={num(m)}/{num(mm)}={num(n)}mol।','mass-to-mole',metadata=dict(inputs=inputs))
#80 solution calculations:20 chemically soluble solutes x4 concentrations/volumes.
SOLUTES=['NaCl','NaOH','KNO3','CaCl2','Na2CO3','H2SO4','HNO3','NH3','C6H12O6','CuSO4']
for j,f in enumerate(SOLUTES):
 mm=mass(f)
 for k in range(8):
  v=F([100,200,250,400,500,600,750,800][k],1000);molar=F(j+1+k,20);m=molar*v*mm
  #alternate find mass and concentration, no duplicated numerical stems
  if k%2==0:q=f'{num(v*1000)}mL {num(molar)}M {f} দ্রবণে কত গ্রাম বিশুদ্ধ দ্রব আছে? ({weights(f)})';a=m;why=f'm=MV×Mm={num(molar)}×{num(v)}×{num(mm)}={num(m)}g।';target='mass'
  else:q=f'{num(m)}g {f} দিয়ে চূড়ান্ত {num(v*1000)}mL দ্রবণ তৈরি করা হলো। মোলারিটি কত M? ({weights(f)})';a=molar;why=f'M=(m/Mm)/V=({num(m)}/{num(mm)})/{num(v)}={num(molar)}M।';target='molarity'
  mcq(q,num(a),why,'solution-mcq',metadata=dict(inputs=dict(formula=f,volumeL=num(v),massG=num(m),molarity=num(molar),target=target,expected=num(a))))
#60 formula questions:20 formulas x(relative mass, atom count, elemental fraction).
for f in COMPOUNDS:
 comp=parse(f);mm=mass(f);el=max(comp,key=lambda x:AW[x]*comp[x]);percent=AW[el]*comp[el]/mm*100
 mcq(f'{f}-এর আপেক্ষিক সংকেত/আণবিক ভর কত? ({weights(f)})',num(mm),f'পরমাণুর Ar ও সূচকের গুণফল যোগে {num(mm)}; আপেক্ষিক ভর এককহীন।','formula-mass',metadata=dict(inputs=dict(formula=f,expected=num(mm))))
 mcq(f'{f}-এর এক অণু বা সংকেত এককে মোট কতটি পরমাণু আছে?',str(sum(comp.values())),f'সূচক ও বন্ধনী গুণ করে যোগে{sum(comp.values())}টি; আয়নিক যৌগে এটি সংকেত এককের গণনা।','formula-atoms',metadata=dict(inputs=dict(formula=f,expected=str(sum(comp.values())))))
 mcq(f'{f}-এ {el}-এর ভরশতাংশ কত? পাঁচ দশমিক স্থান পর্যন্ত নাও। ({weights(f)})',num(percent),f'%{el}=({num(AW[el])}×{comp[el]}/{num(mm)})×100≈{num(percent)}%।','formula-percent',metadata=dict(inputs=dict(formula=f,element=el,expected=num(percent))))
# Balanced reactions used only as declared theoretical complete-conversion exercises.
REACTIONS=[('2H2+O2→2H2O',{'H2':2,'O2':1},{'H2O':2}),('N2+3H2→2NH3',{'N2':1,'H2':3},{'NH3':2}),('2Mg+O2→2MgO',{'Mg':2,'O2':1},{'MgO':2}),('CaCO3→CaO+CO2',{'CaCO3':1},{'CaO':1,'CO2':1}),('Na2CO3+2HCl→2NaCl+H2O+CO2',{'Na2CO3':1,'HCl':2},{'NaCl':2,'H2O':1,'CO2':1}),('2Al+6HCl→2AlCl3+3H2',{'Al':2,'HCl':6},{'AlCl3':2,'H2':3}),('Zn+2HCl→ZnCl2+H2',{'Zn':1,'HCl':2},{'ZnCl2':1,'H2':1}),('CH4+2O2→CO2+2H2O',{'CH4':1,'O2':2},{'CO2':1,'H2O':2}),('2KClO3→2KCl+3O2',{'KClO3':2},{'KCl':2,'O2':3}),('CaO+CO2→CaCO3',{'CaO':1,'CO2':1},{'CaCO3':1})]
for ri,(eq,react,prod) in enumerate(REACTIONS):
 a=next(iter(react));b=next(iter(prod));ca=react[a];cb=prod[b]
 for k in range(1,7):
  n=F(k,5);m=n*mass(a);ans=n*F(cb,ca)*mass(b)
  mcq(f'{eq} অনুযায়ী {num(m)}g বিশুদ্ধ {a} সম্পূর্ণ বিক্রিয়া করলে সর্বাধিক কত g {b} পাওয়া যাবে? অন্য বিক্রিয়ক পর্যাপ্ত। ({weights(a)}; {weights(b)})',num(ans),f'n({a})={num(n)}mol; n({b})=({cb}/{ca})×{num(n)}mol; m={num(ans)}g।','reaction-mass',metadata=dict(inputs=dict(reaction=ri,reactant=a,product=b,reactantMoles=num(n),expected=num(ans))))
GASES=['H2','O2','N2','CO2','NH3','CH4','HCl','SO2','H2S','NO']
for f in GASES:
 for k in range(1,6):
  n=F(k,8);m=n*mass(f);v=n*F('22.4')
  mcq(f'STP(0°C,1atm)-তে আদর্শ গ্যাস ধরে {num(m)}g {f}-এর আয়তন কত L? ({weights(f)})',num(v),f'n={num(m)}/{num(mass(f))}={num(n)}mol; V=n×22.4={num(v)}L।','gas-volume',metadata=dict(inputs=dict(formula=f,massG=num(m),expected=num(v))))
#40 limiting-reagent MCQs; both limiting directions covered.
TWO=[r for r in REACTIONS if len(r[1])==2]
for ri,(eq,react,prod) in enumerate(TWO):
 if ri>=8:break
 a,b=react;out=next(iter(prod))
 for k in range(1,6):
  ea=F(k,5);eb=ea+F(1,10) if k%2 else ea-F(1,10);na=ea*react[a];nb=eb*react[b];extent=min(ea,eb);ans=extent*prod[out]*mass(out)
  mcq(f'{eq} বিক্রিয়ায় {num(na)}mol {a} ও {num(nb)}mol {b} নেওয়া হলো। আদর্শ সম্পূর্ণ বিক্রিয়ায় সর্বাধিক কত g {out} হবে? ({weights(out)})',num(ans),f'n/সহগ: {a}={num(ea)}, {b}={num(eb)}। ক্ষুদ্রতম{num(extent)}; উৎপাদ ভর={num(extent)}×{prod[out]}×{num(mass(out))}={num(ans)}g।','limiting-mcq',metadata=dict(inputs=dict(equation=eq,reactants=react,products=prod,moles={a:num(na),b:num(nb)},product=out,expected=num(ans))))
#36 purity/yield probes,12 varied reaction contexts x3 yield levels.
for ri in range(12):
 eq,react,prod=REACTIONS[ri%10];a=next(iter(react));b=next(iter(prod));sample=F(ri+10);purity=F(70+ri,100)
 for k in range(3):
  y=F(70+10*k,100);theory=sample*purity/mass(a)*F(prod[b],react[a])*mass(b);ans=theory*y
  mcq(f'{eq}: {num(sample)}g নমুনায় {a}-এর বিশুদ্ধতা{num(purity*100)}%; বাকিটা নিষ্ক্রিয়। অন্য বিক্রিয়ক পর্যাপ্ত। বিশুদ্ধ উৎপাদের শতকরা ফলন{num(y*100)} হলে কত g {b} পাওয়া যাবে? ({weights(a)}; {weights(b)})',num(ans),f'বিশুদ্ধ বিক্রিয়ক={num(sample*purity)}g; তাত্ত্বিক উৎপাদ≈{num(theory)}g; প্রকৃত={num(y)}×তাত্ত্বিক≈{num(ans)}g।','purity-yield-mcq',metadata=dict(inputs=dict(equation=eq,sampleG=num(sample),purity=num(purity),yieldFraction=num(y),reactant=a,reactantCoefficient=react[a],product=b,productCoefficient=prod[b],expected=num(ans))))
for k in range(30):
 f=SOLUTES[k%10];m1=F(k+5,10);v1=F(50+10*k,1000);factor=2+k%4;v2=v1*factor;m2=m1/factor
 mcq(f'{num(v1*1000)}mL {num(m1)}M {f} দ্রবণে পানি যোগ করে চূড়ান্ত আয়তন{num(v2*1000)}mL করা হলো। দ্রব হারায়নি। নতুন মোলারিটি কত M?',num(m2),f'M2=M1V1/V2={num(m1)}×{num(v1)}/{num(v2)}≈{num(m2)}M।','dilution-mcq',metadata=dict(inputs=dict(initialM=num(m1),initialVolumeL=num(v1),finalVolumeL=num(v2),expected=num(m2))))
#21 conceptual short questions: separate written tasks, not copies of web/textbook prompts.
SHORTS='''এক মোল O2 ও এক মোল O-তে অক্সিজেন পরমাণুর সংখ্যা তুলনা করো।|O2-তে2NA পরমাণু, O-তেNA; অনুপাত2:1।
মোলার ভর ও আপেক্ষিক আণবিক ভরের এককের পার্থক্য লেখো।|মোলার ভরের এককg/mol; আপেক্ষিক আণবিক ভর অনুপাত, এককহীন। সংখ্যামান স্কুলেরg/mol রীতিতে সমান হতে পারে।
NaCl-এর ক্ষেত্রে অণুর বদলে সংকেত একক বলা কেন যথার্থ?|আয়নিক জালকে স্বতন্ত্র NaCl অণু নয়; Na+:Cl−=1:1 অনুপাতের সংকেত একক।
সমীকরণ সমতা করতে নিম্নসূচক পরিবর্তন করা যায় না কেন?|নিম্নসূচক বদলালে ভিন্ন পদার্থ হয়; সহগ বদলে প্রতি মৌলের পরমাণু সমান করতে হয়।
লিমিটিং বিক্রিয়ক শুধু ভর দেখে নির্ধারণ করা যায় না কেন?|মোলার ভর ও সহগ ভিন্ন; প্রতিটির n/সহগ তুলনার ক্ষুদ্রতমটি নির্বাচন করতে হয়।
প্রকৃত ফলন তাত্ত্বিক ফলনের চেয়ে কম হওয়ার দুটি কারণ লেখো।|অসম্পূর্ণ বিক্রিয়া/পার্শ্ববিক্রিয়া এবং সংগ্রহ/পরিশোধনে উৎপাদ ক্ষয়; নির্দিষ্ট ক্ষেত্রে তথ্য দিয়ে বিচার করতে হয়।
খোলা পাত্রে গ্যাস উৎপন্ন হলে ভর কমলেও ভর সংরক্ষণ অক্ষুণ্ণ কীভাবে?|পাত্রের বাইরে যাওয়া গ্যাসসহ সিস্টেমের সব ভর গুনলে বিক্রিয়ক ও উৎপাদের মোট ভর সমান।
তরল পদার্থে22.4L মোলার আয়তন ঢালাওভাবে প্রযোজ্য নয় কেন?|22.4L/mol হলো0°C,1atm-এ আদর্শ গ্যাসের মান; তরলে ঘনত্ব ও গঠন ভিন্ন।
0.5M দ্রবণের1L এবং0.1M দ্রবণের5L-এ দ্রবের মোল তুলনা করো।|n=MV; উভয়ে0.5mol। মোলারিটি ভিন্ন হলেও মোট দ্রব সমান।
লঘুকরণে M1V1=M2V2 ব্যবহারের শর্ত কী?|একই দ্রবের মোলসংখ্যা সংরক্ষিত; কোনো বিক্রিয়া, ক্ষয় বা অতিরিক্ত দ্রব যোগ নয়; আয়তন একই এককে নিতে হবে।
একই মোলসংখ্যায় সব পদার্থের ভর সমান হয় না কেন?|m=nMm; মোলার ভর ভিন্ন হলে সমানn-তেও ভর ভিন্ন।
স্থূল সংকেত HO হলে আণবিক সংকেত নির্ণয়ে আর কী প্রয়োজন?|আণবিক/মোলার ভর; স্থূল সংকেতভর17 দিয়ে ভাগে পূর্ণসংখ্যা গুণক বের হয়।
ভেজা উৎপাদ ওজন করে100%-এর বেশি ফলন পেলে কী ব্যাখ্যা দেবে?|জল/অমিশ্রতা অতিরিক্ত ভর যোগ করতে পারে; বিশুদ্ধ শুকনো উৎপাদ, সঠিক বিক্রিয়া ও মাপ যাচাই দরকার।
সমতাকৃত সমীকরণ মোট অণুসংখ্যা সংরক্ষণ বাধ্যতামূলক করে কি?|না; যেমন2H2+O2→2H2O-তে3অণু থেকে2অণু, কিন্তু H ও O পরমাণু এবং মোট ভর সংরক্ষিত।
প্রতি লিটার দ্রাবক ও প্রতি লিটার দ্রবণ কি একই ঘনমাত্রার সংজ্ঞা?|না। দ্রব যোগে চূড়ান্ত আয়তন বদলাতে পারে। মোলারিটি চূড়ান্ত দ্রবণের লিটারপ্রতি মোল।
একই তাপমাত্রা ও চাপে সমআয়তন H2 ও CO2-এর ভর তুলনা করো।|আদর্শ মডেলে সমান মোল; ভর2:44=1:22।
একটি CO2 অণু এবং এক মোল CO2-তে মোট পরমাণু কত?|এক অণুতে3; এক মোলে3NA পরমাণু।
নমুনার বিশুদ্ধতা80% হলে নিষ্ক্রিয় অমিশ্রতা উৎপাদ গণনায় বাদ যায় কেন?|বিক্রিয়ায় কার্যকর বিশুদ্ধ অংশ0.8×নমুনার ভর; ঘোষিত নিষ্ক্রিয় অংশ উৎপাদ দেয় না।
রাসায়নিক সংকেতে সহগ2ও নিম্নসূচক2-এর পার্থক্য উদাহরণ দাও।|2H বোঝায় দুটিH পরমাণু; H2 একটি দ্বিপরমাণুক অণু।2H2-তে দুটি অণু তথা4H পরমাণু।
অ্যাভোগেড্রো ধ্রুবক কি তাপমাত্রার সঙ্গে বদলায়?|না। এটি SI-তে নির্দিষ্ট6.02214076×10^23mol−1। আয়তন বদলালেও ধ্রুবক বদলায় না।
ঘন অ্যাসিডের দ্রবণ প্রস্তুতি নিজে করা নিরাপদ নয় কেন?|তাপোৎপাদী মিশ্রণে ছিটা/দগ্ধ হওয়ার ঝুঁকি। প্রশিক্ষিত তত্ত্বাবধানে PPE, শীতলীকরণ ও অ্যাসিড ধীরে পানিতে যোগের রীতি মানতে হয়; বিপরীত নয়।'''
for line in SHORTS.splitlines():q,a=line.split('|');sq(q,a,'concept-sq')
assert len(SHORTS.splitlines())==21
#40 solution CQs,20 related short calculations.40 scenarios differ in solute and data.
for k in range(40):
 f=SOLUTES[k%10];mm=mass(f);v=F(100+25*k,1000);molar=F(2+k,20);m=molar*v*mm;vf=2*v;final=molar/2
 stem=f'একটি বিশুদ্ধ {f} নমুনার {num(m)}g দিয়ে চূড়ান্ত {num(v*1000)}mL দ্রবণ প্রস্তুত করা হলো। পরে সম্পূর্ণ দ্রবণে পানি যোগ করে চূড়ান্ত আয়তন দ্বিগুণ করা হয়। ({weights(f)}; আদর্শ অনুশীলন, দ্রব হারায়নি।)'
 parts=[('দ্রব ও দ্রাবকের পার্থক্য কী?','দ্রাবকে যে উপাদান দ্রবীভূত হয় তা দ্রব; যে মাধ্যমে দ্রবীভূত হয় তা দ্রাবক।'),('দ্রবণের আয়তন আর দ্রাবকের আয়তন এক ধরে নেওয়া ঠিক নয় কেন?','দ্রব মেশালে আয়তন সরল যোগফল নাও হতে পারে; M গণনায় চূড়ান্ত দ্রবণের আয়তন লাগে।'),('প্রথম দ্রবণের মোলারিটি নির্ণয় করো।',f'Mm={num(mm)}g/mol,n={num(m)}/{num(mm)}={num(molar*v)}mol; M=n/{num(v)}={num(molar)}M।'),('পানি যোগের পর মোলসংখ্যা ও মোলারিটির পরিবর্তন বিশ্লেষণ করো।',f'n অপরিবর্তিত{num(molar*v)}mol। নতুনV={num(vf)}L; M2={num(molar*v)}/{num(vf)}={num(final)}M; অর্ধেক।')]
 cq(stem,parts,'solution-cq',metadata=dict(inputs=dict(formula=f,massG=num(m),volumeL=num(v),initialM=num(molar),finalVolumeL=num(vf),finalM=num(final))))
 if k<20:sq(f'{num(m)}g বিশুদ্ধ {f} থেকে চূড়ান্ত{num(v*1000)}mL দ্রবণ তৈরির পর আয়তন দ্বিগুণ করা হলো। শেষ মোলারিটি নির্ণয় করো। ({weights(f)})',parts[3][1]+' '+parts[2][1],'solution-sq')
#40 neutralization CQs with explicit bottle diagrams; each a single SVG, labels Latin.
for k in range(40):
 va=F(100+5*k,1000);vb=F(150+5*k,1000);ma=F(2+k,20);mb=F(3+k,25);na=ma*va;nb=mb*vb;extent=min(na,nb);excess=abs(na-nb);nature='অম্লীয়' if na>nb else ('ক্ষারীয়' if nb>na else 'নিরপেক্ষ')
 body=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 350"><rect width="760" height="350" fill="white"/><g font-family="sans-serif" font-size="24" fill="#183e3a"><text x="20" y="35">Neutralization exercise (hypothetical data)</text><path d="M70 80v210h250V80 M440 80v210h250V80" fill="#edf6f3" stroke="#287269" stroke-width="3"/><text x="90" y="130">A: HCl(aq)</text><text x="90" y="180">{num(va*1000)} mL</text><text x="90" y="230">{num(ma)} mol/L</text><text x="460" y="130">B: NaOH(aq)</text><text x="460" y="180">{num(vb*1000)} mL</text><text x="460" y="230">{num(mb)} mol/L</text><text x="20" y="330">Volumes additive; complete reaction assumed</text></g></svg>\n';name=f'neutral-{k+1:02}.svg';save(ASSET/name,body)
 stem=f'চিত্রে A পাত্রে{num(va*1000)}mL {num(ma)}M HCl এবং B পাত্রে{num(vb*1000)}mL {num(mb)}M NaOH দ্রবণ আছে। দুটি মেশানো হলো। সম্পূর্ণ প্রশমন, অপরিবর্তিত তাপমাত্রা ও আয়তন যোগযোগ্য ধরো। Na=23,Cl=35.5; অনুশীলনের কাল্পনিক তথ্য।\n\n'+pic(name)
 parts=[('প্রশমন বিক্রিয়া কাকে বলে?','এসিড ও ক্ষারের বিক্রিয়ায় লবণ ও পানি উৎপন্ন হওয়া।'),('সমান আয়তন মেশালেই সবসময় নিরপেক্ষ হয় না কেন?','ঘনমাত্রা ও সমীকরণের সহগও প্রয়োজন; এখানে n(HCl) ও n(NaOH) তুলনা করতে হবে।'),('সর্বাধিক উৎপন্ন NaCl-এর ভর নির্ণয় করো।',f'HCl+NaOH→NaCl+H2O; nA={num(na)},nB={num(nb)}mol। nNaCl=min={num(extent)}mol; m={num(extent*F("58.5"))}g।'),('মিশ্রণের প্রকৃতি ও অতিরিক্ত এসিড/ক্ষারের মোলার ঘনমাত্রা হিসাব করো।',f'প্রকৃতি{nature}। অতিরিক্ত অংশ={num(excess)}mol; মোটV={num(va+vb)}L; ঘনমাত্রা≈{num(excess/(va+vb))}M। এটি অবশিষ্ট এসিড/ক্ষারের আনুষ্ঠানিক ঘনমাত্রা; pH গণনা নয়।')]
 cq(stem,parts,'neutralization-cq',metadata=dict(hypotheticalData=True,inputs=dict(acidM=num(ma),acidVolumeL=num(va),baseM=num(mb),baseVolumeL=num(vb),saltMassG=num(extent*F('58.5')),excessMolarity=num(excess/(va+vb)),nature=nature)))
#40 limiting CQs and20SQ; explicit assumptions prevent equilibrium claim.
for k in range(40):
 eq,react,prod=TWO[k%len(TWO)];a,b=react;out=next(iter(prod));ea=F(k+2,20);eb=ea+F(1,20) if k%2 else ea-F(1,40);na=ea*react[a];nb=eb*react[b];extent=min(ea,eb);lim=a if ea<eb else b;extra=b if lim==a else a;left=((nb-extent*react[b]) if extra==b else (na-extent*react[a]));mp=extent*prod[out]*mass(out)
 stem=f'{eq} সমতাকৃত সমীকরণ অনুযায়ী {num(na*mass(a))}g {a} ও {num(nb*mass(b))}g {b} বিক্রিয়া করানো হলো। বিশুদ্ধ বিক্রিয়ক ও আদর্শ সম্পূর্ণ বিক্রিয়া ধরো; এটি বাস্তব সাম্যাবস্থায় শতভাগ ফলনের দাবি নয়। ({weights(a)}; {weights(b)}; {weights(out)})'
 parts=[('লিমিটিং বিক্রিয়ক কাকে বলে?','প্রদত্ত সহগ অনুপাতে যে বিক্রিয়ক প্রথম ফুরিয়ে উৎপাদের সর্বাধিক পরিমাণ সীমিত করে।'),('বেশি ভরের বিক্রিয়কও লিমিটিং হতে পারে কেন?','প্রতি মোলের ভর ও সমীকরণের সহগ আলাদা; ভরের বদলে n/সহগ তুলনা প্রয়োজন।'),('লিমিটিং বিক্রিয়ক ও উৎপন্ন '+out+'-এর ভর নির্ণয় করো।',f'n({a})={num(na)},n({b})={num(nb)}mol; n/সহগ যথাক্রমে{num(ea)},{num(eb)}। {lim} লিমিটিং; m({out})={num(extent)}×{prod[out]}×{num(mass(out))}={num(mp)}g।'),('কোন বিক্রিয়ক কত গ্রাম অবশিষ্ট থাকবে? পরিমাণগত বিশ্লেষণ করো।',f'{extra} অবশিষ্ট; মোল={num(left)}mol; ভর={num(left*mass(extra))}g। লিমিটিং বিক্রিয়ক আদর্শ সম্পূর্ণতায় অবশিষ্ট0। উৎপাদ ছাড়াও অবশিষ্ট বিক্রিয়ক মোট ভর হিসাবে রাখতে হয়।')]
 cq(stem,parts,'limiting-cq',metadata=dict(inputs=dict(reactants=react,products=prod,moles={a:num(na),b:num(nb)},product=out,productMassG=num(mp),excessSpecies=extra,excessMassG=num(left*mass(extra)),limitingSpecies=lim)))
 if k<20:sq(stem+'\n\nলিমিটিং বিক্রিয়ক ও অতিরিক্ত বিক্রিয়কের অবশিষ্ট ভর নির্ণয় করো।',parts[2][1]+' '+parts[3][1],'limiting-sq')
#40 empirical-formula cases:20 genuine formulas x2 analysis sample scales.
EMP=['C2H6','C2H4','C3H6','C4H8','C2H2','C6H6','C6H12O6','C2H4O2','H2O2','N2O4','N2O5','CH4','C2H6O','C3H8','C4H10','C3H8O','CH2O','C2H4O','C3H6O','C4H8O2']
for k in range(40):
 f=EMP[k%20];comp=parse(f);mm=mass(f);scale=F(1 if k<20 else 3,10);sample=scale*mm;g=reduce(gcd,comp.values());emp=''.join(e+(str(v//g) if v//g!=1 else '') for e,v in comp.items());analysis=', '.join(f'{num(AW[e]*v*scale)}g {e}' for e,v in comp.items());ratio=':'.join(str(v//g) for v in comp.values())
 stem=f'একটি যৌগের{num(sample)}g নমুনা বিশ্লেষণে {analysis} পাওয়া গেল। যৌগটির আপেক্ষিক আণবিক ভর{num(mm)}। ({weights(f)}; তথ্যগুলো অনুশীলনের জন্য প্রদত্ত।)'
 parts=[('স্থূল সংকেত কাকে বলে?','যৌগে মৌলের পরমাণুর সংখ্যার সরলতম পূর্ণসংখ্যার অনুপাত প্রকাশকারী সংকেত।'),('একই স্থূল সংকেতের ভিন্ন আণবিক সংকেত সম্ভব কেন?','সরল অনুপাত অপরিবর্তিত রেখে সব সূচক একই পূর্ণসংখ্যায় গুণ হতে পারে; আণবিক ভর দিয়ে গুণক নির্ণয় হয়।'),('ভর থেকে মোল অনুপাত নিয়ে স্থূল সংকেত বের করো।',f'মৌলের মোল যথাক্রমে '+', '.join(f'{e}:{num(v*scale)}' for e,v in comp.items())+f'। সরল অনুপাত{ratio}; স্থূল সংকেত{emp}।'),('প্রদত্ত আণবিক ভরের সাহায্যে আণবিক সংকেত এবং মৌলগুলোর ভরশতাংশ নির্ণয় করো।',f'স্থূল সংকেতভর={num(mm/g)}; গুণক={num(mm)}/{num(mm/g)}={g}; আণবিক সংকেত{f}। '+', '.join(f'{e}={num(AW[e]*v/mm*100)}%' for e,v in comp.items())+'; rounding-এর সীমায় যোগ100%।')]
 cq(stem,parts,'empirical-cq',metadata=dict(inputs=dict(formula=f,composition=comp,sampleMoles=num(scale),sampleMassG=num(sample),empiricalFormula=emp,multiplier=g,molarMass=num(mm))))
 if k<15:sq(stem+'\n\nস্থূল ও আণবিক সংকেত নির্ণয় করো।',parts[2][1]+' '+parts[3][1],'empirical-sq')
#37 yield CQs +15SQ, independent purity and process yield, dry product assumption.
for k in range(37):
 eq,react,prod=REACTIONS[k%10];a=next(iter(react));b=next(iter(prod));m=F(20+k);p=F(75+k%20,100);y=F(60+k%30,100);pure=m*p;theory=pure/mass(a)*F(prod[b],react[a])*mass(b);actual=theory*y;loss=theory-actual
 stem=f'{eq} বিক্রিয়ায় {num(m)}g নমুনার{num(p*100)}% হলো{a}; অবশিষ্ট অংশ নিষ্ক্রিয়। অন্য বিক্রিয়ক প্রয়োজনের চেয়ে বেশি। প্রক্রিয়ায় শতকরা ফলন{num(y*100)}; সংগৃহীত{b} বিশুদ্ধ ও শুকনো। ({weights(a)}; {weights(b)}; কাল্পনিক অনুশীলনের তথ্য।)'
 parts=[('শতকরা বিশুদ্ধতা কাকে বলে?','নমুনার মোট ভরে বিশুদ্ধ কাঙ্ক্ষিত পদার্থের ভরের শতকরা ভাগ।'),('বিশুদ্ধতা ও শতকরা ফলন একই বিষয় নয় কেন?','বিশুদ্ধতা নমুনায় কার্যকর বিক্রিয়কের অংশ; ফলন তাত্ত্বিক উৎপাদের কত অংশ বাস্তবে সংগ্রহ হয়েছে।'),('বিশুদ্ধ বিক্রিয়কের ভর ও তাত্ত্বিক উৎপাদের ভর হিসাব করো।',f'বিশুদ্ধ{a}={num(m)}×{num(p)}={num(pure)}g। উৎপাদ=({num(pure)}/{num(mass(a))})×({prod[b]}/{react[a]})×{num(mass(b))}≈{num(theory)}g।'),('প্রকৃত উৎপাদ ও তাত্ত্বিক মানের তুলনায় ঘাটতি নির্ণয় করে বিশুদ্ধতা উপেক্ষার ত্রুটি ব্যাখ্যা করো।',f'প্রকৃত≈{num(theory)}×{num(y)}≈{num(actual)}g; ঘাটতি≈{num(loss)}g। বিশুদ্ধতা উপেক্ষা করলে নিষ্ক্রিয় অংশকেও বিক্রিয়ক ধরে অতিরিক্ত তাত্ত্বিক উৎপাদ গণনা হতো।')]
 cq(stem,parts,'purity-yield-cq',metadata=dict(inputs=dict(sampleG=num(m),purity=num(p),yieldFraction=num(y),reactant=a,reactantCoefficient=react[a],product=b,productCoefficient=prod[b],theoryG=num(theory),actualG=num(actual),lossG=num(loss))))
 if k<15:sq(stem+'\n\nপ্রকৃত উৎপাদ কত গ্রাম পাওয়া যাবে?',parts[2][1]+' '+parts[3][1],'purity-yield-sq')
counts=Counter(x['type'] for x in items);assert counts=={'MCQ':500,'CQ':200,'SQ':100},counts
assert len({q['text'] for q in items})==800
sourceCounts={origin:dict(Counter(q['type'] for q,m in zip(items,meta) if m['origin']==origin)) for origin in ['TEXTBOOK_VERBATIM','WEB_VERBATIM','AUTHORED_BOARD_STYLE']}
mcqs=[q for q in items if q['type']=='MCQ'];cqs=[q for q in items if q['type']=='CQ'];slices={f'mcq-{i+1}':mcqs[i*100:i*100+100] for i in range(5)};slices.update({'cq-1':cqs[:100],'cq-2':cqs[100:],'sq':[q for q in items if q['type']=='SQ']})
lookup={id(q):m for q,m in zip(items,meta)};ledger=[]
for name,rows in slices.items():
 for i,q in enumerate(rows,1):ledger.append(dict(lookup[id(q)],index=len(ledger)+1,file=name+'.json',itemIndex=i,kind=q['type']))
 save(OUT/(name+'.json'),enc(dict(category='Class 9',subject='রসায়ন',topic=TOPIC,book='অধ্যায় ৬ — পাঠ্যবই/ওয়েব প্রশ্ন ও অনুমতিপ্রাপ্ত বোর্ড-ধাঁচের নিজস্ব অনুশীলনী',edition='মিশ্র উৎস; শিক্ষক-অনুমোদনহীন খসড়া v1',sourceUrl='https://drive.google.com/file/d/17cFTHipiCnU5qB-prqtRRj6YADFdZ091/view',lang='Bangla',items=rows)))
validation=dict(status='DRAFT_NOT_IMPORTED',requested=dict(MCQ=500,CQ=200,SQ=100),actual=dict(counts),originCounts=sourceCounts,sourceQuestionCount=26,authoredQuestionCount=774,teacherApproved=False,websiteImported=False,published=False,officialYearVerified=False,fullChapterRead=False,sourceOnlyIntakePreserved=True,allAnswersAssistantAuthored=True,webResearchExhaustive=False,boardCandidatesStillUnverified=49,cqMarks=[1,2,3,4],sqMarksConvention=2,sourceCountsMeaning='Question/stimulus text only. All explanations/solutions authored separately, not falsely claimed source answers. Web MCQ key observed and independently checked; source CQ1 marks absent and application convention assigned.',limitations=['800 independent concepts নয়: fixed source26; authored774 items include explicitly disclosed numerical variants across families.','MCQ authored486:30concept+100mass-to-mole+80solution+60formula+60reaction-mass+50gas-volume+40limiting+36purity-yield+30dilution. CQ197:40solution+40neutralization+40limiting+40empirical+37purity-yield. SQ91:21concept+20solution+20limiting+15empirical+15purity-yield.','Target met with authorized authored supplementation, NOT 800 verbatim board questions. Internet/Drive not exhausted and no total source shortage established.','Source printed mistakes retained in questions; explanatory corrections not silently substituted. Textbook CaCO3 uses অণু; answer notes scientifically appropriate সংকেত একক.','Use Ar H1,C12,N14,O16,Na23,Mg24,Al27,P31,S32,Cl35.5,K39,Ca40,Fe56,Cu63.5,Zn65. NA≈6.02×10^23mol−1 for exercises; exact SI value separately explained. STP=0°C,1atm,ideal gas Vm22.4L/mol.','Numerical answers rounded up to5decimal places. Reaction exercises assume specified complete theoretical conversion; NH3/NO equilibrium and real yields are not asserted.','CQ1/2textbook marks and all SQ marks are application practice convention, not observed official/source blueprint. No subject policy copied from Physics/Math.','No actual board/year attribution observed in counted26 source questions; generated questions must never receive a board/year tag. Short actual-board formatter work remains separate.','Independent teacher review, curriculum-year verification and production import/approval/deployment are not done.'],files={n+'.json':dict(count=len(rows),sha256=hashlib.sha256((OUT/(n+'.json')).read_bytes()).hexdigest()) for n,rows in slices.items()},assets={p.name:dict(bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest(),nativeCrop=False) for p in sorted(ASSET.glob('*.svg'))},items=ledger)
save(OUT/'validation.json',enc(validation))
#Readable offline review of every item with explicit per-item origin and source link.
def markup(t):
 s=html.escape(t)
 s=re.sub(r'!\[([^\]]*)\]\(https://proshnobook.com(/question-bank/[^)]+)\)',r'<img alt="\1" src="../../../public\2">',s)
 return s.replace('\n','<br>')
blocks=[]
for n,rows in slices.items():
 blocks.append('<h2>'+n+'</h2>')
 for q in rows:
  m=lookup[id(q)];label={'TEXTBOOK_VERBATIM':'পাঠ্যবইয়ের প্রশ্ন','WEB_VERBATIM':'ওয়েব সোর্সের প্রশ্ন','AUTHORED_BOARD_STYLE':'নিজস্ব বোর্ড-ধাঁচের অনুশীলনী'}[m['origin']]
  body=f'<article><p class="tag">{label} · {html.escape(q["page"])}</p>'
  if m.get('url'):body+=f'<a href="{html.escape(m["url"])}">মূল ওয়েব সোর্স</a>'
  body+='<div>'+markup(q['text'])+'</div>'
  if q['type']=='MCQ':body+='<ol type="A">'+''.join('<li>'+html.escape(v)+'</li>' for v in q['options'].values())+'</ol><details open><summary>নিজস্ব সমাধান · উত্তর '+q['correct']+'</summary>'+markup(q['explanation'])+'</details>'
  elif q['type']=='CQ':body+=''.join('<section><b>'+p['label']+') '+markup(p['question'])+f' [{p["marks"]}]</b><details open><summary>নিজস্ব নমুনা সমাধান</summary>'+markup(p['solution'])+'</details></section>' for p in q['parts'])
  else:body+='<details open><summary>নিজস্ব নমুনা সমাধান</summary>'+markup(q['explanation'])+'</details>'
  blocks.append(body+'</article>')
save(DOC/'chapter-6-review.html','<!doctype html><html lang="bn"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>রসায়ন অধ্যায়৬ — ৫০০MCQ ২০০CQ ১০০SQ</title><style>body{max-width:1000px;margin:30px auto;padding:0 22px;color:#173e39;font:18px/1.8 system-ui}header{padding:25px;background:#edf6f2;border-left:5px solid #167461}h1,h2{color:#126b5d}article{padding:24px 0;border-bottom:1px solid #cbd9d1;break-inside:avoid}.tag{font-size:15px;background:#f0f4f2;padding:9px}details{background:#f8faf8;margin:12px 0;padding:10px}section{margin:20px 0}img{max-width:100%;height:auto}summary{cursor:pointer}a{color:#126b5d}</style><header><h1>৬ষ্ঠ অধ্যায়: মোলের ধারণা ও রাসায়নিক গণনা</h1><h2>৫০০ MCQ · ২০০ CQ · ১০০ SQ — খসড়া</h2><p>প্রশ্ন: পাঠ্যবই থেকে১১টি + ওয়েব থেকে১৫টি + অনুমতিপ্রাপ্ত নিজস্ব বোর্ড-ধাঁচের৭৭৪টি। এটি৮০০টি হুবহু বোর্ড প্রশ্ন নয়। প্রতিটি প্রশ্নে উৎসের ধরন আলাদা; সব ব্যাখ্যা/সমাধান নিজস্ব। একই দক্ষতার সংখ্যাভিত্তিক ভ্যারিয়েন্ট আছে।</p><p>কোনো বাস্তব বোর্ড–সাল দাবি নয়। CQ১–২–৩–৪/SQ২ নম্বর অনুশীলনের প্রচলিত কাঠামো; অফিসিয়াল পরীক্ষাবর্ষের মানবণ্টন দাবি নয়। শিক্ষক অনুমোদন, ইমপোর্ট বা প্রকাশ করা হয়নি।</p><p>STP=0°C,1atm; আদর্শ গ্যাস22.4L/mol। NA≈6.02×10²³mol⁻¹। গাণিতিক ফল সর্বোচ্চ৫দশমিকে; শর্তে দেওয়া বিশুদ্ধতা, ফলন ও সম্পূর্ণ বিক্রিয়া ধরতে হবে।</p></header>'+''.join(blocks)+'</html>')
print(enc(dict(actual=counts,originCounts=sourceCounts,assets=len(validation['assets']))))
