import json, math
from fractions import Fraction as F
from pathlib import Path
out=Path('deliverables/class6-math-ch1')
bn=lambda x:str(x).translate(str.maketrans('0123456789','০১২৩৪৫৬৭৮৯'))
def fmt(x):
 x=F(x);return bn(x.numerator) if x.denominator==1 else bn(x.numerator)+'/'+bn(x.denominator)
def gcd(a,b):return max(d for d in range(1,min(a,b)+1) if a%d==0 and b%d==0)
def lcm(a,b):return next(d for d in range(max(a,b),a*b+1) if d%a==0 and d%b==0)
cq=[];sq=[];checks=0
source={'file':'২০২৬ — গণিত.pdf','driveUrl':'https://drive.google.com/file/d/1dQ5TSKvQZVwRca_evhBY_hC5gjxcnd5q/view','basis':'নিজস্ব প্রশ্ন; নিচের পৃষ্ঠাগুলো বিষয়/ধারণার সূত্র, হুবহু প্রশ্নের উৎস নয়','visuallyReadPrintedPages':[1,10,17,25,33,37],'fullChapterRead':False}
def add(stimulus,questions,answers,page,skill):
 assert len(questions)==len(answers)==3
 cq.append({'id':f'C6M1-CQ-{len(cq)+1:03}','skill':skill,'stimulus':stimulus,'parts':[{'label':label,'marks':marks,'question':q,'solution':a,'suggestedRubric':rub} for label,marks,q,a,rub in zip(['ক','খ','গ'],[2,4,4],questions,answers,[['সঠিক পদ্ধতি/ধারণা: ১','সঠিক ফল: ১'],['পদ্ধতি ও প্রয়োজনীয় হিসাব: ২','সঠিক ফল ও ব্যাখ্যা: ২'],['বিশ্লেষণ/পদ্ধতি: ২','সঠিক ফল ও সিদ্ধান্ত: ২']])],'referencePrintedPage':page,'status':'DRAFT_SUBJECT_REVIEW_PENDING'})
def short(q,a,page):sq.append({'id':f'C6M1-SQ-{len(sq)+1:03}','question':q,'answer':a,'suggestedMarks':2,'referencePrintedPage':page,'status':'DRAFT_SUBJECT_REVIEW_PENDING'})
for i in range(5):
 a=36+12*i;b=48+18*i;c=60+15*i;g=gcd(a,b);h=gcd(g,c)
 assert g==math.gcd(a,b) and h==math.gcd(a,b,c)
 assert a%g==b%g==0 and a%h==b%h==c%h==0
 divisors=[d for d in range(1,a+1) if a%d==0]
 add(f'বিদ্যালয়ে {bn(a)}টি খাতা ও {bn(b)}টি কলম আছে। কোনোটি অবশিষ্ট না রেখে শিক্ষার্থীদের মধ্যে ভাগ করতে হবে। প্রত্যেকে সমানসংখ্যক খাতা এবং সমানসংখ্যক কলম পাবে। পরে আরও {bn(c)}টি পেনসিল পাওয়া গেল।',[
 f'{bn(a)}-এর ধনাত্মক গুণনীয়কগুলো লেখো।','প্রথমে খাতা ও কলম সর্বাধিক কতজনকে দেওয়া যাবে? প্রত্যেকে কয়টি করে পাবে?','পেনসিলসহ তিন ধরনের সামগ্রী একই শর্তে সর্বাধিক কতজনকে দেওয়া যাবে? প্রত্যেকে প্রতিটি সামগ্রী কতটি পাবে?'],[
 'যেসব ধনাত্মক সংখ্যা দিয়ে সংখ্যাটি নিঃশেষে বিভাজ্য: '+', '.join(map(bn,divisors))+'।',
 f'সর্বাধিক শিক্ষার্থী = গসাগু({bn(a)}, {bn(b)}) = {bn(g)}। প্রত্যেকে খাতা {bn(a//g)}টি এবং কলম {bn(b//g)}টি।',
 f'তিন সংখ্যার গসাগু = {bn(h)}। তাই {bn(h)} জনের প্রত্যেকে খাতা {bn(a//h)}টি, কলম {bn(b//h)}টি ও পেনসিল {bn(c//h)}টি পাবে।'],17,'সাধারণ গুণনীয়ক ও সমবণ্টন')
 short(f'{bn(a)} ও {bn(b)}-এর গসাগু নির্ণয় করো।',f'বৃহত্তম সাধারণ গুণনীয়ক {bn(g)}; উভয় সংখ্যাকে এই সংখ্যা নিঃশেষে ভাগ করে।',17)
 a=6+2*i;b=9+3*i;l=lcm(a,b);duration=180
 assert l==math.lcm(a,b)
 times=[t for t in range(duration+1) if t%a==t%b==0];assert len(times)==duration//l+1
 add(f'দুটি ঘণ্টা সকাল ৯টায় একসঙ্গে বাজল। এরপর প্রথমটি {bn(a)} মিনিট এবং দ্বিতীয়টি {bn(b)} মিনিট অন্তর বাজে।',[
 f'{bn(a)} ও {bn(b)}-এর গসাগু নির্ণয় করো।','ঘণ্টা দুটি প্রথম আবার কখন একসঙ্গে বাজবে?','সকাল ৯টা থেকে দুপুর ১২টা পর্যন্ত, দুই প্রান্তের সময়সহ, ঘণ্টা দুটি মোট কতবার একসঙ্গে বাজবে?'],[
 f'গসাগু({bn(a)}, {bn(b)}) = {bn(gcd(a,b))}।',
 f'একসঙ্গে বাজার ব্যবধান লসাগু = {bn(l)} মিনিট। তাই সময় সকাল {bn(9+l//60)}টা {bn(l%60)} মিনিট।',
 f'সময়কাল ১৮০ মিনিট। ০, {bn(l)}, {bn(2*l)}, … মিনিটে একসঙ্গে বাজবে। মোট ⌊১৮০/{bn(l)}⌋ + ১ = {bn(len(times))} বার; শুরুর ঘটনাটিও গণনা করা হয়েছে।'],17,'লসাগু ও সময়ের ব্যবধান')
 short(f'{bn(a)} ও {bn(b)}-এর লসাগু নির্ণয় করো।',f'উভয় সংখ্যা দ্বারা বিভাজ্য ক্ষুদ্রতম ধনাত্মক সংখ্যা {bn(l)}।',17)
 a=8+2*i;b=12+3*i;r=i+1;l=lcm(a,b);small=l+r;four=r+((1000-r+l-1)//l)*l
 assert small==next(n for n in range(max(a,b)+1,small+1) if n%a==n%b==r)
 assert four==next(n for n in range(1000,10000) if n%a==n%b==r)
 add(f'একটি সংখ্যা {bn(a)} ও {bn(b)} দিয়ে ভাগ করলে প্রতিবার ভাগশেষ {bn(r)} থাকে। সংখ্যাটি উভয় ভাজকের চেয়ে বড়।',[
 f'{bn(a)} ও {bn(b)}-এর লসাগু নির্ণয় করো।','শর্ত পূরণ করে এমন ক্ষুদ্রতম সংখ্যাটি নির্ণয় করো।','শর্ত পূরণ করে এমন ক্ষুদ্রতম চার অঙ্কের সংখ্যাটি নির্ণয় করে ভাগশেষ যাচাই করো।'],[
 f'লসাগু = {bn(l)}।',f'সংখ্যা থেকে {bn(r)} বাদ দিলে তা {bn(l)}-এর গুণিতক। উভয় ভাজকের চেয়ে বড় ক্ষুদ্রতম মান {bn(l)} + {bn(r)} = {bn(small)}।',
 f'নির্ণেয় মান {bn(four)}। {bn(four)} = {bn(a)} × {bn(four//a)} + {bn(r)} এবং {bn(b)} × {bn(four//b)} + {bn(r)}। এর আগের উপযুক্ত মান {bn(four-l)} চার অঙ্কের নয়।'],17,'ভাগশেষ ও নির্দিষ্ট সীমার সংখ্যা')
 short(f'{bn(four)}-কে {bn(a)} দিয়ে ভাগ করলে ভাগফল ও ভাগশেষ কত?',f'ভাগফল {bn(four//a)}, ভাগশেষ {bn(four%a)}; ভাজ্য = ভাজক × ভাগফল + ভাগশেষ।',17)
 total=240+120*i;food=F(1,3);travel=F(1,4);remaining=1-food-travel;balance=total*remaining;gift=30*(i+1);after=balance/2+gift
 assert total*food+total*travel+balance==total
 assert balance.denominator==after.denominator==1
 add(f'রিমার কাছে {bn(total)} টাকা ছিল। সে মূল টাকার ১/৩ অংশ খাবারে এবং মূল টাকার ১/৪ অংশ যাতায়াতে ব্যয় করল। পরে অবশিষ্ট টাকার অর্ধেক বই কিনতে খরচ করে {bn(gift)} টাকা উপহার পেল।',[
 'খাবারের খরচ কত টাকা?','খাবার ও যাতায়াতের খরচ শেষে মূল টাকার কত অংশ ও কত টাকা অবশিষ্ট ছিল?','বই কেনা ও উপহার পাওয়ার পর তার কাছে কত টাকা থাকবে?'],[
 f'{bn(total)} × ১/৩ = {fmt(total*food)} টাকা।',
 f'খরচের অংশ = ১/৩ + ১/৪ = ৭/১২। অবশিষ্ট = ১ − ৭/১২ = ৫/১২; টাকা {bn(total)} × ৫/১২ = {fmt(balance)}।',
 f'বই কেনার পর অবশিষ্ট টাকার অর্ধেক থাকবে: {fmt(balance)} ÷ ২ = {fmt(balance/2)}। উপহারসহ {fmt(balance/2)} + {bn(gift)} = {fmt(after)} টাকা।'],25,'ভগ্নাংশের প্রয়োগ ও ধারাবাহিক খরচ')
 short(f'{bn(total)} টাকার ৫/১২ অংশ কত টাকা?',f'{bn(total)} × ৫/১২ = {fmt(balance)} টাকা।',25)
 a=F(24+6*i,10);b=F(36+9*i,10);cut=F(gcd(a.numerator*(10//a.denominator),b.numerator*(10//b.denominator)),10)
 # Canonical fractions may have denominators 1,2,5,10; scaling is exact.
 ai=int(a*100);bi=int(b*100);cm=gcd(ai,bi);cut=F(cm,100)
 assert cut==F(math.gcd(ai,bi),100) and (a/cut).denominator==(b/cut).denominator==1
 dec=lambda v:bn(f'{float(v):.2f}')
 add(f'দুটি ফিতার দৈর্ঘ্য {dec(a)} মিটার ও {dec(b)} মিটার। কোনো অংশ অবশিষ্ট না রেখে ফিতা দুটিকে একই মাপের সর্বাধিক লম্বা টুকরায় কাটতে হবে।',[
 'ফিতা দুটির মোট দৈর্ঘ্য কত?','প্রতিটি টুকরার সর্বাধিক দৈর্ঘ্য মিটার ও সেন্টিমিটারে নির্ণয় করো।','প্রথম ও দ্বিতীয় ফিতা থেকে কয়টি টুকরা হবে এবং মোট কয়টি টুকরা পাওয়া যাবে?'],[
 f'{dec(a)} + {dec(b)} = {dec(a+b)} মিটার।',
 f'দৈর্ঘ্য দুটি {bn(ai)} ও {bn(bi)} সেমি। গসাগু {bn(cm)} সেমি = {dec(cut)} মিটার; এটিই সর্বাধিক দৈর্ঘ্য।',
 f'প্রথমটি থেকে {dec(a)} ÷ {dec(cut)} = {fmt(a/cut)}টি, দ্বিতীয়টি থেকে {dec(b)} ÷ {dec(cut)} = {fmt(b/cut)}টি। মোট {fmt((a+b)/cut)}টি।'],[17,33],'দশমিক দৈর্ঘ্য ও সমান টুকরা')
 short(f'{dec(a)} + {dec(b)}-এর মান নির্ণয় করো।',f'একই দশমিক ঘর মিলিয়ে যোগ করলে {dec(a+b)}।',33)
 digits=[i+1,i+2,i+3,i+4];large=int(''.join(map(str,sorted(digits,reverse=True))));small=int(''.join(map(str,sorted(digits))));diff=large-small
 assert diff%9==0
 assert large==max(int(''.join(map(str,p))) for p in __import__('itertools').permutations(digits))
 add(f'চারটি অঙ্ক হলো {", ".join(map(bn,digits))}। প্রত্যেকটি ঠিক একবার ব্যবহার করে চার অঙ্কের সংখ্যা গঠন করা হবে।',[
 f'বৃহত্তম অঙ্কটি শতকের ঘরে বসলে তার স্থানীয় মান কত হবে?','গঠিত বৃহত্তম ও ক্ষুদ্রতম চার অঙ্কের সংখ্যা এবং তাদের বিয়োগফল নির্ণয় করো।','বিয়োগফলটি ৯ দ্বারা বিভাজ্য কি না অঙ্কগুলোর যোগফলের সাহায্যে যাচাই করো।'],[
 f'বৃহত্তম অঙ্ক {bn(max(digits))}। শতকের স্থানীয় মান {bn(max(digits))} × ১০০ = {bn(max(digits)*100)}।',
 f'অবরোহ ক্রমে বৃহত্তম {bn(large)}, আরোহ ক্রমে ক্ষুদ্রতম {bn(small)}। বিয়োগফল {bn(large)} − {bn(small)} = {bn(diff)}।',
 f'{bn(diff)}-এর অঙ্কগুলোর যোগফল {bn(sum(map(int,str(diff))))}, যা ৯ দ্বারা বিভাজ্য। তাই বিয়োগফল ৯ দ্বারা বিভাজ্য; ভাগফল {bn(diff//9)}।'],10,'অঙ্কপাতন ও বিভাজ্যতা')
 short(f'{bn(large)} সংখ্যাটির অঙ্কগুলোর যোগফল কত? এটি ৩ দ্বারা বিভাজ্য কি?',f'অঙ্কগুলোর যোগফল {bn(sum(digits))}। '+('যোগফল ৩ দ্বারা বিভাজ্য, তাই সংখ্যাটিও ৩ দ্বারা বিভাজ্য।' if sum(digits)%3==0 else 'যোগফল ৩ দ্বারা বিভাজ্য নয়, তাই সংখ্যাটিও নয়।'),10)
 checks+=6
assert len(cq)==len(sq)==30
assert len({r['stimulus'] for r in cq})==30 and len({r['question'] for r in sq})==30
for r in cq:assert [p['label'] for p in r['parts']]==['ক','খ','গ'] and [p['marks'] for p in r['parts']]==[2,4,4]
batch={'class':'Class 6','subject':'গণিত','topic':'১. স্বাভাবিক সংখ্যা ও ভগ্নাংশ','status':'DRAFT_SUBJECT_REVIEW_PENDING','source':source,'limitations':['সম্পূর্ণ অধ্যায়ের সব পৃষ্ঠা পড়া হয়নি','৩০টি CQ ছয়টি problem family-র পাঁচটি করে সংখ্যাভিত্তিক উদাহরণ; সবগুলো আলাদা দক্ষতা নয়','শিক্ষক-পর্যালোচনা ও প্রস্তাবিত রুব্রিক অনুমোদন বাকি','বিদ্যমান import কেবল MCQ নেয়; এই CQ/SQ JSON সরাসরি সেই form-এ দেবেন না'],'CQ':cq,'SQ':sq}
(out/'cq-sq-draft.json').write_text(json.dumps(batch,ensure_ascii=False,indent=2)+'\n')
md='# ষষ্ঠ শ্রেণি গণিত — প্রথম অধ্যায়\n## ৩০টি CQ ও ৩০টি SQ: প্রশ্ন ও সমাধানের Draft\n\nপ্রতিটি CQ: ক–খ–গ, নম্বর ২–৪–৪ = ১০। প্রশ্ন নিজস্ব; বই থেকে কপি নয়। সূচিপত্র ও মুদ্রিত পৃষ্ঠা ১, ১০, ১৭, ২৫, ৩৩, ৩৭ ছবিতে পড়ে বিষয়ভিত্তি মিলেছে; পুরো অধ্যায় এখনো পড়া হয়নি। শিক্ষক-পর্যালোচনা ও ভাষা/মানবণ্টন অনুমোদন বাকি। ছয় ধরনের সমস্যার পাঁচটি করে অনুশীলনী রয়েছে। প্রস্তাবিত রুব্রিক চূড়ান্ত বোর্ড marking scheme নয়।\n\n'
md+='## সৃজনশীল প্রশ্ন (CQ)\n\n'
for i,r in enumerate(cq,1):
 md+=f'### CQ {bn(i)} — {r["skill"]}\n\n{r["stimulus"]}\n\n'
 for p in r['parts']:md+=f'**{p["label"]})** {p["question"]} **[{bn(p["marks"])}]**\n\n'
 md+='**সমাধান**\n\n'
 for p in r['parts']:md+=f'**{p["label"]})** {p["solution"]}\n\n'
 md+=f'ধারণার সূত্র: বইয়ের মুদ্রিত পৃষ্ঠা {bn(r["referencePrintedPage"])}; প্রশ্ন হুবহু উদ্ধৃতি নয়।\n\n'
md+='## সংক্ষিপ্ত প্রশ্ন (SQ) — প্রস্তাবিত প্রতিটি ২ নম্বর\n\n'
for i,r in enumerate(sq,1):md+=f'### SQ {bn(i)}\n{r["question"]}\n\n**উত্তর:** {r["answer"]}\n\n'
(out/'cq-sq-review.md').write_text(md)
(out/'progress.json').write_text(json.dumps({'MCQ_existingDraft':100,'MCQ_recheckedAgainstFullChapter':False,'CQ_draftSets':30,'CQ_parts':['ক','খ','গ'],'CQ_marks':[2,4,4],'SQ_drafts':30,'CQ_problemFamilies':6,'arithmeticCheckedFamilies':checks,'teacherReviewed':False,'productionSaved':0,'source':source},ensure_ascii=False,indent=2)+'\n')
print('Prepared 30 CQ sets (90 subparts) + 30 SQ; arithmetic assertions passed; no database writes.')
