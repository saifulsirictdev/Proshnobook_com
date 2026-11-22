"""SSC remaining chapters, EXCLUDING statistics: 150/50/70 each.
Development-only exact numeric drafts; no DB writes, deployment or approval.
"""
import sys
from illustrated_geometry_bank import Bank,S,R,tex
from ssc_math_remaining_models import scenarios11,scenarios12,scenarios13,NONE
from ssc_math_remaining_geometry import scenarios14,scenarios15,scenarios16
from ssc_math_remaining_figures import plane,midpoint,rect,solid
TITLES={11:'১১শ অধ্যায়: বীজগাণিতিক অনুপাত ও সমানুপাত',12:'১২শ অধ্যায়: দুই চলকবিশিষ্ট সরল সহসমীকরণ',13:'১৩শ অধ্যায়: সসীম ধারা',14:'১৪শ অধ্যায়: অনুপাত, সদৃশতা ও প্রতিসমতা',15:'১৫শ অধ্যায়: ক্ষেত্রফল সম্পর্কিত উপপাদ্য ও সম্পাদ্য',16:'১৬শ অধ্যায়: পরিমিতি'}
MODELS={11:scenarios11,12:scenarios12,13:scenarios13,14:scenarios14,15:scenarios15,16:scenarios16}
def seeds(b):
 ch=b.chapter
 if ch==11:
  b.source(11,4,'rajshahi',r'$a/2=b/3=c/4\ne0$ হলে a:b:c কোনটি?', ['2:3:4','4:3:2','8:9:6','6:8:9'],'A',R(2,3),r'সাধারণ মান t≠0 নিলে a=2t,b=3t,c=4t; তাই a:b:c=2:3:4।',NONE)
  b.audit[-1]['adaptation']+=' শূন্য নয় শর্ত স্পষ্ট করা হয়েছে; মূল ratio options অক্ষুণ্ণ।'
  b.source(1,18,'dhaka','চা ও চিনির অনুপাত 7:3; মিশ্রণে চিনির পরিমাণ শতকরা কত?', ['$30$','$40$','$50$','$70$'],'A',30,'মোট অংশ 7+3=10; চিনি 3 অংশ। শতকরা (3/10)×100=30।',NONE)
 if ch==12:
  b.source(11,8,'rajshahi',r'$2x+3y=-4$ ও x=1 হলে y কত?', ['$4$','$-1$','$-2$','$-4$'],'C',-2,r'2+3y=−4 থেকে 3y=−6, তাই y=−2। এটি x=1 রেখার সঙ্গে সহসমীকরণ হিসেবেও দেখা যায়।',NONE)
  b.source(20,4,'cumilla',r'$2a-b=8$ এবং $a-2b=4$ হলে a+b কত?', ['$0$','$4$','$8$','$12$'],'B',4,'দ্বিতীয় সমীকরণের দ্বিগুণ প্রথমটি থেকে বাদ দিলে 3b=0; b=0, a=4; a+b=4।',NONE)
 if ch==13:
  b.source(11,11,'rajshahi',r'$6+12+24+\cdots$ ধারার অষ্টম পদ কত?', ['$84$','$252$','$768$','$1536$'],'C',768,r'এটি গুণোত্তর ধারা, a=6,r=2। $a_8=6\cdot2^7=768$।',NONE)
  b.source(20,5,'cumilla',r'$6+12+24+48+\cdots+384$ ধারাটির পদসংখ্যা কত?', ['$64$','$32$','$7$','$6$'],'C',7,r'$6\cdot2^{n-1}=384$ থেকে $2^{n-1}=64=2^6$; n=7।',NONE)
 if ch==14:
  b.source(20,7,'cumilla','একটি বিষমবাহু ত্রিভুজের মোট কয়টি প্রতিসাম্য রেখা আছে?', ['$0$','$1$','$3$','অসংখ্য'],'A',0,'প্রতিফলন-অক্ষ থাকলে ত্রিভুজের অন্তত দুই বাহু সমান হতে হয়। বিষমবাহুতে তিন বাহুই ভিন্ন; তাই কোনো প্রতিসাম্য অক্ষ নেই।',plane(dict(A=(1,3),B=(0,0),C=(5,0)),['AB','BC','CA']))
  b.source(11,13,'rajshahi','একটি সাধারণ আয়তক্ষেত্রের (বর্গ নয়) ক্ষুদ্রতম ধনাত্মক আবর্তন কোণের পরিমাণ কত ডিগ্রি?', ['$360$','$180$','$90$','$45$'],'B',180,'কেন্দ্রের চারদিকে 180° ঘোরালে বিপরীত শীর্ষগুলো বিনিময় হয় এবং আয়তক্ষেত্র মিলে যায়। বর্গ না হওয়ায় 90°-এ দৈর্ঘ্য ও প্রস্থের অবস্থান বিনিময়ে মেলে না।',rect(6,4))
  b.audit[-1]['adaptation']+=' মূল আয়তক্ষেত্র প্রশ্নে বর্গ নয় ও ক্ষুদ্রতম ধনাত্মক আবর্তন শর্ত স্পষ্ট করা হয়েছে; অবিকল নয়।'
 if ch==15:
  b.source(11,9,'rajshahi','ABCD একটি আয়তক্ষেত্র। AB-কে B-এর দিকে E পর্যন্ত বাড়ানো হয়েছে, BE=AB; D,E যোগ করলে তা BC-কে F-এ ছেদ করে। △ADE-এর ক্ষেত্রফল কোনটির সমান?', ['আয়তক্ষেত্র ABCD','চতুর্ভুজ ABFD','ত্রিভুজ CDF','ত্রিভুজ BEF'],'A',1,r'$AE=2AB$ এবং AD উভয়ের লম্ব উচ্চতা। $[ADE]=\frac12(2AB)AD=AB\cdot AD=[ABCD]$।',plane(dict(A=(0,0),B=(4,0),C=(4,4),D=(0,4),E=(8,0),F=(4,2)),['AB','BC','CD','DA','BE','DE']),True)
  b.source(67,26,'dinajpur','△ABC-তে AB ও BC-এর মধ্যবিন্দু যথাক্রমে D ও E হলে △BDE:△ABC ক্ষেত্রফলের অনুপাত কোনটি?', ['2:3','1:2','1:3','1:4'],'D',R(1,4),r'$BD/BA=BE/BC=1/2$ এবং অন্তর্ভুক্ত B-কোণ সাধারণ; SAS-এ BDE∼BAC। তাই ক্ষেত্রফলের অনুপাত $(1/2)^2=1/4$।',plane(dict(A=(1,4),B=(0,0),C=(6,0),D=(.5,2),E=(3,0)),['AB','BC','CA','DE']))
 if ch==16:
  b.source(20,8,'cumilla',r'একটি বর্গের কর্ণের দৈর্ঘ্য $6\sqrt2$ মিটার হলে ক্ষেত্রফল কত বর্গমিটার?', ['$36$','$24$','$18$','$6$'],'A',36,r'বাহু $=6\sqrt2/\sqrt2=6$ মিটার; ক্ষেত্রফল $6^2=36$ বর্গমিটার।',rect(6,6))
  b.source(11,5,'rajshahi',r'3 সেমি ধারবিশিষ্ট ঘনকের জন্য— i. আয়তন 27 ঘনসেমি; ii. দেহকর্ণের দৈর্ঘ্য $3\sqrt3$ সেমি; iii. সমগ্র পৃষ্ঠের ক্ষেত্রফল 54 বর্গসেমি। কোন বিবৃতিগুলো সঠিক?', ['i ও ii','i ও iii','ii ও iii','i, ii ও iii'],'D',3,r'$V=a^3=27$; দেহকর্ণ $a\sqrt3=3\sqrt3$; পৃষ্ঠতল $6a^2=54$। তিনটিই সঠিক।',solid('cube',3,3,3))
  b.audit[-1]['adaptation']+=' কর্ণ বলতে দেহকর্ণ বোঝানো স্পষ্ট করা হয়েছে; বিকল্পগুলোর ক্রম বজায়।'

chapters=[int(x) for x in sys.argv[1:] if x!='--check'] or list(range(11,17))
assert all(c in TITLES for c in chapters),'Statistics is expressly excluded'
for ch in chapters:
 b=Bank(ch,TITLES[ch],dict(MCQ=150,CQ=50,SQ=70));b.book='Proshnobook — সংকলন-অভিযোজিত ও নিজস্ব অধ্যায়ভিত্তিক অনুশীলনী';seeds(b)
 def encode(v):
  if isinstance(v,S.Basic):return str(v)
  if isinstance(v,list):return [encode(a) for a in v]
  if isinstance(v,dict):return {k:encode(a) for k,a in v.items()}
  return v
 def meta(r,n):
  b.audit[-1].update(modelFacts=encode(r['facts']),responseExpressions=[str(p[1]) for p in r['parts']],modelChapter=ch)
 for n in range(1,11):
  rs=MODELS[ch](n);assert len(rs)==15
  for i,r in enumerate(rs):
   if n==10 and i>=13:continue
   query,value,sol=r['parts'][1];wrong=[]
   for candidate in [2*value,value/2,value+1,value-1,-value,value+2,value+3]:
    candidate=S.simplify(candidate)
    if S.simplify(candidate-value)!=0 and all(S.simplify(candidate-v)!=0 for v in wrong):wrong.append(candidate)
    if len(wrong)==3:break
   b.mcq(r['family'],n,r['stem']+' '+query,value,sol,r['figure'],wrong);meta(r,n)
 for n in range(1,6):
  for r in MODELS[ch](n)[:10]:
   parts=[(q,sol) for q,val,sol in r['parts']]
   b.written('CQ',r['family'],n,r['stem'],parts,r['figure'],[]);meta(r,n)
   b.rows[-1]['explanation']='ধাপভিত্তিক সমাধান নিচের ক/খ/গ অংশে দেওয়া আছে। স্বাধীন শিক্ষক-পর্যালোচনা বাকি।'
 for n in range(6,11):
  for r in MODELS[ch](n)[:14]:
   q,val,sol=r['parts'][2];b.written('SQ',r['family'],n,'সংক্ষিপ্ত প্রশ্ন: '+r['stem']+' '+q,sol,r['figure'],[]);meta(r,n)
 b.emit()
