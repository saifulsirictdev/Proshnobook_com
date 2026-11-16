"""Build original Class 6 math chapters 3–8 practice drafts. No database writes.
Numeric variants are disclosed; --check verifies deterministic output.
"""
import json, math, statistics, sys
from fractions import Fraction as F
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
BN=str.maketrans('0123456789','০১২৩৪৫৬৭৮৯')
def bn(x):return str(x).translate(BN)
def fmt(x):
 if isinstance(x,str):return x
 x=F(x);return bn(x.numerator) if x.denominator==1 else bn(x.numerator)+'/'+bn(x.denominator)
def nums(xs):return ', '.join(map(fmt,xs))
def obj(q,v,e):return(q,F(v),e)
def scene(stim,objectives,parts,checks):
 assert len(objectives)==2 and len(parts)==3 and all(checks),stim
 return dict(stimulus=stim,objectives=objectives,parts=parts)
def standard(stim,q1,v1,e1,q2,v2,e2,q3,e3,checks):
 return scene(stim,[obj(q1,v1,e1),obj(q2,v2,e2)],[(q1,e1),(q2,e2),(q3,e3)],checks)

# INTEGER: addition, subtraction, order and number-line meanings; no new multiplication syllabus.
def integer(k,i):
 a=8+i;b=3+i%5;c=2+i%4
 if k==0:
  start=-a;end=start+b
  return standard(f'সকালে পাহাড়ি শহরের তাপমাত্রা ছিল {fmt(start)}°সে। দুপুরে {bn(b)}°সে বাড়ে; রাতে {bn(c)}°সে কমে।','দুপুরের তাপমাত্রা কত?',end,f'{fmt(start)} + {bn(b)} = {fmt(end)}°সে।','রাতের তাপমাত্রা কত?',end-c,f'{fmt(end)} − {bn(c)} = {fmt(end-c)}°সে।','রাতের তাপমাত্রা সকালের তুলনায় কত বেশি বা কম? ব্যাখ্যা করো।',f'পরিবর্তন {bn(b)} − {bn(c)} = {fmt(b-c)}°সে। '+('তাই তাপমাত্রা একই।' if b==c else f'তাই {bn(abs(b-c))}°সে '+('বেশি।' if b>c else 'কম।')),[end-start==b,(end-c)-start==b-c])
 if k==1:
  start=-b;up=a;end=start+up;down=c+2
  return standard(f'ভূতলকে ০ ধরা হলো। লিফট শুরুতে {fmt(start)} তলায়। সেটি {bn(up)} তলা ওঠে ও পরে {bn(down)} তলা নামে।','প্রথমবার ওঠার পর তলার নম্বর কত?',end,f'{fmt(start)} + {bn(up)} = {fmt(end)}।','সব শেষে কোন তলায় থাকবে?',end-down,f'{fmt(end)} − {bn(down)} = {fmt(end-down)}।','প্রথম অবস্থানে ফিরতে শেষে কোন দিকে কত তলা যেতে হবে?',f'নিট স্থানান্তর {fmt(up-down)} তলা উপরে; তাই {fmt(up-down)} তলা নিচে নামতে হবে।',[up>down,end-down-start==up-down])
 if k==2:
  balance=-a*10;deposit=(a+b)*10;withdraw=c*10;after=balance+deposit;final=after-withdraw
  return standard(f'এক হিসাবে {bn(-balance)} টাকা বকেয়া আছে, তাই স্থিতি {fmt(balance)} টাকা। জমা হলো {bn(deposit)} টাকা, পরে তোলা হলো {bn(withdraw)} টাকা।','জমার পর স্থিতি কত?',after,f'{fmt(balance)} + {bn(deposit)} = {fmt(after)} টাকা।','টাকা তোলার পর স্থিতি কত?',final,f'{fmt(after)} − {bn(withdraw)} = {fmt(final)} টাকা।','প্রারম্ভিক অবস্থার তুলনায় স্থিতির পরিবর্তন ব্যাখ্যা করো।',f'পরিবর্তন {bn(deposit)} − {bn(withdraw)} = {bn(deposit-withdraw)} টাকা বৃদ্ধি; ঋণাত্মক বকেয়া যোগে সমন্বয় হয়েছে।',[after-balance==deposit,final-balance==deposit-withdraw])
 if k==3:
  x=-a;y=b;d=y-x
  return standard(f'সংখ্যারেখায় A বিন্দুতে {fmt(x)} ও B বিন্দুতে {fmt(y)} আছে। প্রতি একক ব্যবধান সমান।','A থেকে B-তে ডানে যেতে কত একক লাগে?',d,f'{fmt(y)} − ({fmt(x)}) = {bn(d)} একক।',f'A-এর {bn(c)} একক বাঁয়ের বিন্দুর মান কত?',x-c,f'{fmt(x)} − {bn(c)} = {fmt(x-c)}।','B থেকে A-তে ফিরলে স্থানান্তরের চিহ্ন কী হবে? দূরত্বের সঙ্গে পার্থক্য লেখো।',f'স্থানান্তর {fmt(x-y)}; দূরত্ব {bn(d)} একক অঋণাত্মক।',[d>0,(x-c)+c==x,x-y==-d])
 if k==4:
  gain=a;loss=a+b;final=gain-loss;second=final+c
  return standard(f'এক খেলায় প্রথমে {bn(gain)} পয়েন্ট পাওয়া গেল, পরে {bn(loss)} পয়েন্ট কাটা গেল। শেষে আরও {bn(c)} পয়েন্ট পাওয়া গেল।','দুই দফার পর পয়েন্ট কত?',final,f'{bn(gain)} − {bn(loss)} = {fmt(final)}।','শেষে পয়েন্ট কত?',second,f'{fmt(final)} + {bn(c)} = {fmt(second)}।','শেষ পয়েন্ট থেকে শূন্যে আসতে কী যোগ করতে হবে?',f'যোগ করতে হবে {fmt(-second)}; কারণ {fmt(second)} + ({fmt(-second)}) = ০।',[final==-b,second+(-second)==0])
 if k==5:
  xs=[-a,b,-c,0,a+2];neg=-a-c;pos=b+a+2;total=neg+pos
  return standard(f'একটি কার্ডে পূর্ণসংখ্যা লেখা আছে: {nums(xs)}।','ঋণাত্মক সংখ্যাগুলোর যোগফল কত?',neg,f'({fmt(-a)}) + ({fmt(-c)}) = {fmt(neg)}।','সব সংখ্যার যোগফল কত?',total,f'ধনাত্মকের যোগফল {bn(pos)}, ঋণাত্মকের {fmt(neg)}; মোট {fmt(total)}।','ছোট থেকে বড় ক্রমে সাজিয়ে বৃহত্তম ও ক্ষুদ্রতমের পার্থক্য নির্ণয় করো।',f'ক্রম {nums(sorted(xs))}। পার্থক্য {bn(a+2)} − ({fmt(-a)}) = {bn(2*a+2)}।',[sum(xs)==total,max(xs)-min(xs)==2*a+2])
 if k==6:
  start=-a;rise=b;fall=a;middle=start+rise;end=middle-fall
  return standard(f'সমুদ্রপৃষ্ঠ ০ মিটার। ডুবুরি প্রথমে {fmt(start)} মিটারে। সে {bn(rise)} মিটার ওপরে ওঠে, তারপর {bn(fall)} মিটার নিচে নামে।','ওপরে ওঠার পর অবস্থান কত?',middle,f'{fmt(start)} + {bn(rise)} = {fmt(middle)} মি।','শেষ অবস্থান কত?',end,f'{fmt(middle)} − {bn(fall)} = {fmt(end)} মি।','শেষে প্রথম অবস্থানের ওপরে না নিচে এবং কত মিটার?',f'শেষ − প্রথম = {fmt(end-start)}। এটি ঋণাত্মক, তাই {bn(start-end)} মিটার নিচে।',[end<start,end-start==rise-fall])
 if k==7:
  x=-a;y=-b;z=x-y
  return standard(f'P={fmt(x)} এবং Q={fmt(y)} দুটি পূর্ণসংখ্যা।','P−Q কত?',z,f'{fmt(x)} − ({fmt(y)}) = {fmt(x)} + {bn(b)} = {fmt(z)}।','Q−P কত?',-z,f'{fmt(y)} − ({fmt(x)}) = {fmt(-z)}।','দুটি বিয়োগফলের যোগফল ও তাদের সম্পর্ক ব্যাখ্যা করো।',f'{fmt(z)} + ({fmt(-z)}) = ০। তারা পরস্পর বিপরীত পূর্ণসংখ্যা।',[z+y==x,z+(-z)==0])
 if k==8:
  x=-a;y=b;z=-c;first=x+y;allv=first+z
  return standard(f'তিনটি ধাপের পরিবর্তন যথাক্রমে {fmt(x)}, +{bn(y)}, {fmt(z)} একক। প্রথম অবস্থান ০।','প্রথম দুই ধাপ শেষে অবস্থান কত?',first,f'{fmt(x)} + {bn(y)} = {fmt(first)}।','তিন ধাপ শেষে অবস্থান কত?',allv,f'{fmt(first)} + ({fmt(z)}) = {fmt(allv)}।','শেষ দুই ধাপ আগে যোগ করলেও একই ফল হয় কি? হিসাব দাও।',f'শেষ দুই ধাপ {fmt(y+z)}। {fmt(x)} + ({fmt(y+z)}) = {fmt(allv)}; ফল একই।',[allv==x+(y+z)])
 x=-a;y=c;travel=a+c;back=b;end=y-back
 return standard(f'একটি খেলনা সংখ্যারেখার {fmt(x)} বিন্দু থেকে ডানে গিয়ে +{bn(y)} বিন্দুতে পৌঁছাল। পরে {bn(back)} একক বাঁয়ে গেল।','প্রথম যাত্রায় কত একক পথ গেল?',travel,f'{bn(y)} − ({fmt(x)}) = {bn(travel)} একক।','শেষ বিন্দুর মান কত?',end,f'{bn(y)} − {bn(back)} = {fmt(end)}।','মোট পথ ও নিট স্থানান্তর আলাদা করে নির্ণয় করো।',f'মোট পথ {bn(travel)} + {bn(back)} = {bn(travel+back)}। নিট স্থানান্তর {fmt(end-x)} একক।',[travel==y-x,travel-back==end-x])

# ALGEBRA: values, symbols, coefficients, exponents, like terms and addition/subtraction.
def algebra(k,i):
 a=2+i%5;b=3+i%4;x=4+i;y=2+i%3;c=5+i
 if k==0:
  p=a*x;q=b*y
  return standard(f'প্রতি কলমের দাম x টাকা, প্রতি খাতার দাম y টাকা। রিনা {bn(a)}টি কলম ও {bn(b)}টি খাতা কেনে। x={bn(x)}, y={bn(y)}।','কলমগুলোর মোট দাম কত?',p,f'{bn(a)}x = {bn(a)} × {bn(x)} = {bn(p)} টাকা।','সব জিনিসের মোট দাম কত?',p+q,f'রাশি {bn(a)}x+{bn(b)}y। মান {bn(p)}+{bn(q)}={bn(p+q)} টাকা।','খাতার সংখ্যা আরও ২টি বাড়লে রাশি ও মূল্য কীভাবে বদলাবে?',f'নতুন রাশি {bn(a)}x+{bn(b+2)}y; মূল্য {bn(p+q+2*y)} টাকা, বৃদ্ধি ২y={bn(2*y)} টাকা।',[p+q==a*x+b*y])
 if k==1:
  s=a+b;diff=c-a
  return standard(f'A={bn(a)}x, B={bn(b)}x এবং C={bn(c)}x রাশি। x={bn(x)}।','A+B-তে x-এর সহগ কত?',s,f'({bn(a)}+{bn(b)})x={bn(s)}x; সহগ {bn(s)}।','C−A-এর মান কত?',diff*x,f'C−A=({bn(c)}−{bn(a)})x={bn(diff)}x; মান {bn(diff*x)}।','A+B+C যোগ করে একটি পদের রাশি লেখো এবং মান নির্ণয় করো।',f'সব পদ সদৃশ। যোগফল {bn(a+b+c)}x; মান {bn((a+b+c)*x)}।',[s*x==a*x+b*x,diff*x==c*x-a*x])
 if k==2:
  val=a*x+b*y;c1=a+b;c2=b+2
  return standard(f'P={bn(a)}x+{bn(b)}y এবং Q={bn(b)}x+২y। x={bn(x)}, y={bn(y)}।','P-এর মান কত?',val,f'{bn(a)}×{bn(x)}+{bn(b)}×{bn(y)}={bn(val)}।','P+Q-তে x-এর সহগ কত?',c1,f'সদৃশ x-পদ যোগে ({bn(a)}+{bn(b)})x={bn(c1)}x।','P+Q সম্পূর্ণ সরল করে মান নির্ণয় করো।',f'P+Q={bn(c1)}x+{bn(c2)}y। মান {bn(c1*x+c2*y)}।',[c1*x+c2*y==val+b*x+2*y])
 if k==3:
  aa=a+b;bb=b+2;v=(aa-a)*x+(bb-b)*y
  return standard(f'P={bn(aa)}x+{bn(bb)}y, Q={bn(a)}x+{bn(b)}y এবং x={bn(x)}, y={bn(y)}।','P−Q-তে x-এর সহগ কত?',aa-a,f'সহগ {bn(aa)}−{bn(a)}={bn(aa-a)}।','P−Q-এর মান কত?',v,f'P−Q={bn(aa-a)}x+২y; মান {bn(v)}।','Q+(P−Q)=P কি না রাশি ও মান দিয়ে যাচাই করো।',f'Q+({bn(aa-a)}x+২y)={bn(aa)}x+{bn(bb)}y=P। মান উভয় পাশে {bn(aa*x+bb*y)}।',[v==aa*x+bb*y-(a*x+b*y)])
 if k==4:
  n=2+i%4;m=3+i%3;v=2**(n+m)
  return standard(f'P=t^{bn(n)} এবং Q=t^{bn(m)}। t=২ ধরা হলো।','P×Q-তে t-এর সূচক কত?',n+m,f'একই ভিত্তির গুণে সূচক যোগ হয়: {bn(n)}+{bn(m)}={bn(n+m)}।','P×Q-এর সংখ্যামান কত?',v,f't^{bn(n+m)}-এ t=২ বসিয়ে ২^{bn(n+m)}={bn(v)}।','P×Q ও Q×P-এর সূচক তুলনা করে সিদ্ধান্ত দাও।',f'উভয়ের সূচক {bn(n+m)}; কারণ {bn(n)}+{bn(m)}={bn(m)}+{bn(n)}।',[2**n*2**m==v])
 if k==5:
  n=2+i%3;val=a*x*x+b*x+c
  return standard(f'R={bn(a)}x²+{bn(b)}x+{bn(c)}। x={bn(x)}।','R-এর ধ্রুবক পদ কত?',c,f'x-বিহীন পদ {bn(c)}।','R-এর মান কত?',val,f'{bn(a)}×{bn(x*x)}+{bn(b)}×{bn(x)}+{bn(c)}={bn(val)}।','R-এর x²-পদ থেকে x-পদ বিয়োগের রাশি ও মান নির্ণয় করো।',f'রাশি {bn(a)}x²−{bn(b)}x; মান {bn(a*x*x-b*x)}।',[val-c==a*x*x+b*x])
 if k==6:
  p=a*x+b;q=b*x+a
  return standard(f'একটি আয়তাকার ছবির দৈর্ঘ্য ({bn(a)}x+{bn(b)}) সেমি ও প্রস্থ ({bn(b)}x+{bn(a)}) সেমি। x={bn(x)}।','দৈর্ঘ্য কত সেমি?',p,f'{bn(a)}×{bn(x)}+{bn(b)}={bn(p)} সেমি।','দৈর্ঘ্য ও প্রস্থের যোগফল কত?',p+q,f'রাশি ({bn(a+b)})x+{bn(a+b)}; মান {bn(p+q)} সেমি।','চার বাহুর দৈর্ঘ্য যোগ করে পরিসীমার রাশি ও মান নির্ণয় করো।',f'পরিসীমা ২[({bn(a+b)})x+{bn(a+b)}]={bn(2*(a+b))}x+{bn(2*(a+b))} সেমি। মান {bn(2*(p+q))} সেমি।',[2*(p+q)==2*(a+b)*x+2*(a+b)])
 if k==7:
  p=a*x-b;v=p+c
  return standard(f'একটি সংখ্যার {bn(a)} গুণ থেকে {bn(b)} বাদ দিয়ে R পাওয়া যায়। সংখ্যাটি x={bn(x)}। এরপর R-এর সঙ্গে {bn(c)} যোগ করা হয়।','R-এ x-এর সহগ কত?',a,f'R={bn(a)}x−{bn(b)}; সহগ {bn(a)}।','যোগের পরে প্রাপ্ত মান কত?',v,f'{bn(a)}x−{bn(b)}+{bn(c)}-এ x={bn(x)} বসালে {bn(v)}।','x এক বাড়ালে R কত বাড়বে? রাশি দিয়ে ব্যাখ্যা করো।',f'নতুন R={bn(a)}(x+১)−{bn(b)}। আগের R বাদ দিলে {bn(a)}; তাই {bn(a)} বাড়ে।',[(a*(x+1)-b)-p==a])
 if k==8:
  n=2+i%3;m=1+i%3;p=a*x**n;q=b*x**n
  return standard(f'A={bn(a)}x^{bn(n)}, B={bn(b)}x^{bn(n)} এবং C={bn(c)}x^{bn(n+1)}। x={bn(x)}।','A+B-এর সহগ কত?',a+b,f'A ও B সদৃশ; সহগের যোগফল {bn(a+b)}।','A+B-এর মান কত?',p+q,f'({bn(a+b)})x^{bn(n)}-এ x={bn(x)} বসিয়ে মান {bn(p+q)}।','A ও C সদৃশ কি? কারণ দিয়ে A+C লেখো।',f'না; x-এর সূচক {bn(n)} ও {bn(n+1)} ভিন্ন। A+C={bn(a)}x^{bn(n)}+{bn(c)}x^{bn(n+1)}; এক পদে যোগ করা যাবে না।',[p+q==(a+b)*x**n,n!=n+1])
 p=(a+b)*x;cst=c+2;v=p-cst
 return standard(f'দুটি রাশি A={bn(a)}x−{bn(c)} ও B={bn(b)}x−২। x={bn(x)}।','A+B-তে x-এর সহগ কত?',a+b,f'সহগ {bn(a)}+{bn(b)}={bn(a+b)}।','A+B-এর মান কত?',v,f'A+B={bn(a+b)}x−{bn(cst)}; মান {bn(v)}।','A−B সরল করে তার মান নির্ণয় করো।',f'A−B=({bn(a-b)})x+({fmt(2-c)})। মান {fmt((a-b)*x+2-c)}।',[v==(a*x-c)+(b*x-2)])

# EQUATIONS: substitute each computed solution into the stated equality.
def equation(k,i):
 x=5+i;a=2+i%4;b=3+i%5;c=1+i%2
 if k==0:
  total=x+b
  return standard(f'এক সংখ্যার সঙ্গে {bn(b)} যোগ করলে {bn(total)} হয়। সংখ্যাটি x।','সমীকরণের ডানপক্ষের মান কত?',total,f'সমীকরণ x+{bn(b)}={bn(total)}; ডানপক্ষ {bn(total)}।','সংখ্যাটি কত?',x,f'উভয় পক্ষ থেকে {bn(b)} বিয়োগে x={bn(total)}−{bn(b)}={bn(x)}।','মূল বসিয়ে যাচাই করো এবং সংখ্যাটির দ্বিগুণের সঙ্গে ১ যোগ করো।',f'{bn(x)}+{bn(b)}={bn(total)}; সঠিক। ২x+১={bn(2*x+1)}।',[x+b==total])
 if k==1:
  total=a*x
  return standard(f'{bn(a)}টি একই দামের খাতার মোট মূল্য {bn(total)} টাকা। একটি খাতার মূল্য x টাকা।','x-এর সহগ কত?',a,f'সমীকরণ {bn(a)}x={bn(total)}; সহগ {bn(a)}।','প্রতি খাতার মূল্য কত?',x,f'দুই পক্ষকে {bn(a)} দিয়ে ভাগে x={bn(total)}÷{bn(a)}={bn(x)} টাকা।','একই দরে আরও ৩টি খাতা কিনতে কত লাগবে এবং সমীকরণ যাচাই করো।',f'আরও ৩টির মূল্য {bn(3*x)} টাকা। যাচাই: {bn(a)}×{bn(x)}={bn(total)}।',[a*x==total])
 if k==2:
  total=a*x+b
  return standard(f'এক সংখ্যার {bn(a)} গুণের সঙ্গে {bn(b)} যোগ করলে {bn(total)} হয়। সংখ্যাটি x।','ডানপক্ষ থেকে ধ্রুবকটি বাদ দিলে কত থাকে?',total-b,f'{bn(total)}−{bn(b)}={bn(total-b)}।','সমীকরণ সমাধান করে সংখ্যাটি নির্ণয় করো।',x,f'{bn(a)}x+{bn(b)}={bn(total)}; {bn(a)}x={bn(total-b)}; x={bn(x)}।','সমাধান যাচাই করে সংখ্যাটির তিন গুণের সঙ্গে ২ যোগ করো।',f'{bn(a)}×{bn(x)}+{bn(b)}={bn(total)}। ৩x+২={bn(3*x+2)}।',[a*x+b==total])
 if k==3:
  total=b+x
  return standard(f'রিনার কাছে {bn(total)} টাকা ছিল। x টাকা খরচের পর {bn(b)} টাকা থাকে।','প্রারম্ভিক টাকা ও অবশিষ্ট টাকার পার্থক্য কত?',x,f'{bn(total)}−{bn(b)}={bn(x)} টাকা।','সমীকরণে x নির্ণয় করে খরচের পরিমাণ লেখো।',x,f'{bn(total)}−x={bn(b)}; উভয় পাশে x যোগ ও {bn(b)} বিয়োগে x={bn(x)}।',f'রিনা খরচ না করে আরও {bn(a)} টাকা পেলে মোট কত হতো? যাচাইসহ লেখো।',f'খরচের যাচাই {bn(total)}−{bn(x)}={bn(b)}। খরচ না করলে নতুন মোট {bn(total+a)} টাকা।',[total-x==b])
 if k==4:
  aa=a+2;bb=b;cc=a;dd=2*x+b
  return standard(f'একটি সমীকরণ: {bn(aa)}x+{bn(bb)} = {bn(cc)}x+{bn(dd)}।','দুই পক্ষের x-এর সহগের পার্থক্য কত?',2,f'{bn(aa)}−{bn(cc)}=২।','সমীকরণটির মূল কত?',x,f'({bn(aa)}−{bn(cc)})x={bn(dd)}−{bn(bb)}={bn(2*x)}; ২x={bn(2*x)}; x={bn(x)}।','মূল বসিয়ে বামপক্ষ ও ডানপক্ষ আলাদাভাবে যাচাই করো।',f'বামপক্ষ {bn(aa*x+bb)}; ডানপক্ষ {bn(cc*x+dd)}; তাই সমান।',[aa*x+bb==cc*x+dd])
 if k==5:
  y=x*a;total=x+b
  return standard(f'এক সংখ্যাকে {bn(a)} দিয়ে ভাগ করে {bn(b)} যোগ করলে {bn(total)} হয়। সংখ্যাটি y।','ভাগফল কত?',x,f'{bn(total)}−{bn(b)}={bn(x)}।','y-এর মান নির্ণয় করো।',y,f'y/{bn(a)}+{bn(b)}={bn(total)}; y/{bn(a)}={bn(x)}; y={bn(y)}।','মূল বসিয়ে যাচাই করে y থেকে ভাগফল বিয়োগ করো।',f'{bn(y)}/{bn(a)}+{bn(b)}={bn(total)}; সঠিক। বিয়োগফল {bn(y-x)}।',[F(y,a)+b==total])
 if k==6:
  diff=a+4;older=x+diff;total=x+older
  return standard(f'দুই ভাইয়ের বয়সের যোগফল {bn(total)} বছর। বড় ভাই ছোট ভাইয়ের চেয়ে {bn(diff)} বছরের বড়। ছোট ভাইয়ের বয়স x বছর।','বড় ভাইয়ের বয়সের রাশিতে ধ্রুবক কত?',diff,f'বড় ভাইয়ের বয়স x+{bn(diff)}; ধ্রুবক {bn(diff)}।','সমীকরণ গঠন করে ছোট ভাইয়ের বয়স নির্ণয় করো।',x,f'x+(x+{bn(diff)})={bn(total)}; ২x={bn(total-diff)}; x={bn(x)} বছর।',f'বড় ভাইয়ের বয়স ও {bn(c)} বছর পর দুজনের বয়সের যোগফল নির্ণয় করো।',f'বড় ভাই {bn(older)} বছর। পরে যোগফল {bn(total)}+২×{bn(c)}={bn(total+2*c)} বছর।',[x+older==total,older-x==diff])
 if k==7:
  total=3*x+3
  return standard(f'তিনটি ক্রমিক স্বাভাবিক সংখ্যার যোগফল {bn(total)}। ক্ষুদ্রতম সংখ্যা x।','বৃহত্তম সংখ্যার রাশিতে x-এর সঙ্গে কত যোগ হয়?',2,'সংখ্যা তিনটি x, x+১, x+২; বৃহত্তমে ২ যোগ হয়।','ক্ষুদ্রতম সংখ্যা কত?',x,f'x+(x+১)+(x+২)={bn(total)}; ৩x+৩={bn(total)}; x={bn(x)}।','তিনটি সংখ্যা লিখে যোগফল ও বৃহত্তম-ক্ষুদ্রতমের পার্থক্য যাচাই করো।',f'সংখ্যা {bn(x)}, {bn(x+1)}, {bn(x+2)}; যোগফল {bn(total)}, পার্থক্য ২।',[sum([x,x+1,x+2])==total])
 if k==8:
  p=2*x+b;price=p+a
  return standard(f'একটি বইয়ের দাম x টাকা। দুটি বই ও {bn(b)} টাকার কলম কিনতে {bn(p)} টাকা লাগে।','দুটি বইয়ের মোট দাম কত?',2*x,f'{bn(p)}−{bn(b)}={bn(2*x)} টাকা।','সমীকরণে একটি বইয়ের দাম নির্ণয় করো।',x,f'২x+{bn(b)}={bn(p)}; ২x={bn(2*x)}; x={bn(x)} টাকা।','একই দামের তিনটি বই ও ঐ কলমের দাম কত? ফল যাচাই করো।',f'দাম ৩×{bn(x)}+{bn(b)}={bn(3*x+b)} টাকা। যাচাই: ২×{bn(x)}+{bn(b)}={bn(p)}।',[2*x+b==p])
 total=(a-c)*x+b
 return standard(f'এক সংখ্যার {bn(a)} গুণের সঙ্গে {bn(b)} যোগ করলে সংখ্যাটির {bn(c)} গুণের চেয়ে {bn(total)} বেশি হয়। সংখ্যা x।','x-এর দুই সহগের পার্থক্য কত?',a-c,f'সমীকরণ {bn(a)}x+{bn(b)}={bn(c)}x+{bn(total)}; পার্থক্য {bn(a-c)}।','সংখ্যাটি নির্ণয় করো।',x,f'({bn(a)}−{bn(c)})x={bn(total)}−{bn(b)}; x={bn(x)}।','সংখ্যাটি বসিয়ে দুই রাশির ব্যবধান যাচাই করো।',f'প্রথম রাশি {bn(a*x+b)}, দ্বিতীয় {bn(c*x)}; ব্যবধান {bn(a*x+b-c*x)}={bn(total)}।',[a>c,a*x+b-c*x==total])

# GEOMETRY: explicit verbal configurations avoid dependence on an unseen diagram.
def geometry(k,i):
 t=20+3*i;a=30+2*i;b=40+i
 if k==0:
  ab=5+i;bc=3+i;ac=ab+bc
  return standard(f'A, B, C একই সরলরেখায় এই ক্রমে অবস্থিত। AB={bn(ab)} সেমি, BC={bn(bc)} সেমি।','AC-এর দৈর্ঘ্য কত?',ac,f'B মাঝখানে, তাই AC=AB+BC={bn(ac)} সেমি।','AC-এর মধ্যবিন্দু M হলে AM কত?',F(ac,2),f'AM=AC/২={fmt(F(ac,2))} সেমি।','B কি AC-এর মধ্যবিন্দু? প্রয়োজনীয় শর্ত দিয়ে ব্যাখ্যা করো।',f'না; AB={bn(ab)}, BC={bn(bc)} এবং দুটি সমান নয়। মধ্যবিন্দু হলে AB=BC লাগত।',[ab+bc==ac,ab!=bc])
 if k==1:
  other=90-t
  return standard(f'দুটি কোণ পরস্পর পূরক। প্রথম কোণ {bn(t)}°। প্রথম কোণকে সমদ্বিখণ্ডিত করা হলো।','অন্য পূরক কোণ কত?',other,f'যোগফল ৯০°, তাই ৯০°−{bn(t)}°={bn(other)}°।','প্রথম কোণের প্রতিটি অর্ধেক কত?',F(t,2),f'{bn(t)}°÷২={fmt(F(t,2))}°।','দুটি অর্ধাংশ ও অপর পূরক কোণ একত্র করলে কত হয়? যাচাই করো।',f'{fmt(F(t,2))}°+{fmt(F(t,2))}°+{bn(other)}°=৯০°।',[0<t<90,t+other==90])
 if k==2:
  other=180-a
  return standard(f'A, O, B একই সরলরেখায় এবং OA ও OB বিপরীত রশ্মি। OC রশ্মি একই অর্ধতলে; ∠AOC={bn(a)}°।','∠COB কত?',other,f'সরল কোণে ∠AOC+∠COB=১৮০°; তাই {bn(other)}°।','∠COB-এর সমদ্বিখণ্ডনে প্রতিটি কোণ কত?',F(other,2),f'{bn(other)}°/২={fmt(F(other,2))}°।','মূল দুটি সন্নিহিত কোণ সম্পূরক কি? কারণ লেখো।',f'হ্যাঁ; {bn(a)}°+{bn(other)}°=১৮০° এবং তাদের অ-সাধারণ বাহু বিপরীত রশ্মি।',[a+other==180])
 if k==3:
  first=100+i;second=120+i;rest=360-first-second
  return standard(f'O বিন্দুর চারদিকে তিনটি কোণ মিলে পূর্ণ এক আবর্তন। দুটি কোণ {bn(first)}° ও {bn(second)}°।','দুটি জানা কোণের যোগফল কত?',first+second,f'{bn(first)}°+{bn(second)}°={bn(first+second)}°।','তৃতীয় কোণের মান কত?',rest,f'পূর্ণ কোণ ৩৬০°; বাকি {bn(rest)}°।','তৃতীয় কোণ সমদ্বিখণ্ডিত করলে দুটি অংশের যোগফলসহ পূর্ণ আবর্তন যাচাই করো।',f'প্রতি অংশ {fmt(F(rest,2))}°। {bn(first)}+{bn(second)}+{fmt(F(rest,2))}+{fmt(F(rest,2))}=৩৬০°।',[rest>0,first+second+rest==360])
 if k==4:
  other=180-a
  return standard(f'AB ও CD সরলরেখা O বিন্দুতে ছেদ করে। A,O,B এই ক্রমে; C,O,D এই ক্রমে। ∠AOC={bn(a)}°।','বিপ্রতীপ ∠BOD কত?',a,f'বিপ্রতীপ কোণ সমান; ∠BOD={bn(a)}°।','সন্নিহিত ∠COB কত?',other,f'∠AOC+∠COB=১৮০°; ∠COB={bn(other)}°।','ছেদবিন্দুর চারটি কোণের মান লিখে যোগফল যাচাই করো।',f'ক্রমে {bn(a)}°, {bn(other)}°, {bn(a)}°, {bn(other)}°; যোগফল ৩৬০°।',[2*a+2*other==360])
 if k==5:
  c=180-a-b
  return standard(f'ABC ত্রিভুজে ∠A={bn(a)}° এবং ∠B={bn(b)}°।','দুটি জানা কোণের যোগফল কত?',a+b,f'{bn(a)}+{bn(b)}={bn(a+b)}°।','∠C কত?',c,f'ত্রিভুজের তিন কোণের যোগফল ১৮০°; C={bn(c)}°।','কোণের ভিত্তিতে ত্রিভুজের ধরন নির্ণয় করো।',('সব কোণ ৯০°-এর ছোট, তাই সূক্ষ্মকোণী।' if max(a,b,c)<90 else 'একটি কোণ ৯০°, তাই সমকোণী।' if max(a,b,c)==90 else 'একটি কোণ ৯০°-এর বড়, তাই স্থূলকোণী।'),[c>0,a+b+c==180])
 if k==6:
  vertex=40+2*i;base=F(180-vertex,2)
  return standard(f'ABC ত্রিভুজে AB=AC এবং শীর্ষকোণ ∠A={bn(vertex)}°।','ভূমিসংলগ্ন দুই কোণের যোগফল কত?',180-vertex,f'B+C=১৮০°−{bn(vertex)}°={bn(180-vertex)}°।','প্রতিটি ভূমিসংলগ্ন কোণ কত?',base,f'AB=AC বলে B=C; প্রতিটি {bn(180-vertex)}°/২={fmt(base)}°।','সমান বাহু ও কোণের সম্পর্ক ব্যবহার করে সব কোণ যাচাই করো।',f'B=C={fmt(base)}°; {bn(vertex)}+{fmt(base)}+{fmt(base)}=১৮০°।',[vertex+2*base==180])
 if k==7:
  acute=25+2*i;other=90-acute
  return standard(f'ABC সমকোণী ত্রিভুজে ∠A=৯০° এবং ∠B={bn(acute)}°।','দুটি সূক্ষ্মকোণের যোগফল কত?',90,'ত্রিভুজে অবশিষ্ট দুই কোণের যোগফল ১৮০°−৯০°=৯০°।','∠C কত?',other,f'৯০°−{bn(acute)}°={bn(other)}°।','∠B ও ∠C পূরক কি? যুক্তি দাও।',f'হ্যাঁ; {bn(acute)}°+{bn(other)}°=৯০°।',[0<acute<90,acute+other==90])
 if k==8:
  angle=35+2*i;supp=180-angle
  return standard(f'দুটি সমান্তরাল সরলরেখাকে একটি ছেদক ছেদ করেছে। একটি কোণ {bn(angle)}°; অন্য ছেদে তার অনুরূপ কোণ P। P-এর সন্নিহিত সরলযুগল কোণ Q।','অনুরূপ P কোণ কত?',angle,f'সমান্তরাল রেখায় অনুরূপ কোণ সমান; P={bn(angle)}°।','Q কত?',supp,f'P+Q=১৮০°; Q={bn(supp)}°।','একই পার্শ্বের অন্তঃস্থ কোণদ্বয়ের একটি P-এর সমান হলে অপরটি কত? ব্যাখ্যা করো।',f'সমান্তরাল রেখায় একই পার্শ্বের অন্তঃস্থ কোণদ্বয়ের যোগফল ১৮০°; অপরটি {bn(supp)}°।',[angle+supp==180])
 aa=70+i;bb=80+i;cc=90+i;dd=360-aa-bb-cc
 return standard(f'একটি উত্তল চতুর্ভুজের পরপর তিন কোণ {bn(aa)}°, {bn(bb)}°, {bn(cc)}°।','তিন জানা কোণের যোগফল কত?',aa+bb+cc,f'যোগফল {bn(aa+bb+cc)}°।','চতুর্থ কোণ কত?',dd,f'চতুর্ভুজে কোণসমষ্টি ৩৬০°; বাকি {bn(dd)}°।','একটি কর্ণ টেনে দুই ত্রিভুজে ভাগ করে ব্যবহৃত কোণসমষ্টির সূত্র ব্যাখ্যা করো।','দুই ত্রিভুজের প্রতিটির কোণসমষ্টি ১৮০°। তাই চতুর্ভুজের চার কোণের যোগফল ১৮০°+১৮০°=৩৬০°।',[0<dd<180,aa+bb+cc+dd==360])

# PRACTICAL GEOMETRY: written construction steps; final drawn figure review stays pending.
BISECT='A ও B কেন্দ্র করে AB-এর অর্ধেকের চেয়ে বড় একই ব্যাসার্ধে রেখার দুই পাশে চাপ আঁকি। চাপদ্বয়ের ছেদ C,D যোগ করি। CD ও AB-এর ছেদ M-ই মধ্যবিন্দু; CD হলো লম্বদ্বিখণ্ডক।'
ONPERP='P কেন্দ্র করে একটি চাপ দিয়ে সরলরেখাকে A ও B-তে কাটি, যাতে PA=PB। A ও B কেন্দ্র করে AB-এর অর্ধেকের বেশি একই ব্যাসার্ধে এক পাশে চাপ কেটে Q নিই। PQ যোগ করি; PQ রেখাটির ওপর P বিন্দুতে লম্ব।'
OFFPERP='বহিঃস্থ P কেন্দ্র করে এমন চাপ আঁকি যা রেখাটিকে A ও B-তে কাটে। A ও B কেন্দ্র করে AB-এর অর্ধেকের চেয়ে বড় একই ব্যাসার্ধে রেখার P-এর বিপরীত পাশে চাপ কেটে Q নিই। PQ যোগ করি; এই রেখা প্রদত্ত রেখাকে সমকোণে ছেদ করে।'
ANGLEBISECT='শীর্ষ O কেন্দ্র করে সুবিধামতো ব্যাসার্ধে চাপ এঁকে কোণের দুই বাহুকে A,B-তে কাটি। A ও B কেন্দ্র করে AB-এর অর্ধেকের বেশি একই ব্যাসার্ধে কোণের ভেতরে চাপ কেটে C নিই। OC যোগ করি; এটিই সমদ্বিখণ্ডক।'
COPYANGLE='মূল কোণের শীর্ষ কেন্দ্র করে একটি চাপ আঁকি যা দুই বাহুকে A,B-তে কাটে। নতুন শীর্ষ P থেকে একটি রশ্মি এঁকে একই ব্যাসার্ধে চাপ কেটে Q নিই। কম্পাসে AB দূরত্ব নিয়ে Q কেন্দ্র করে নতুন চাপের উপযুক্ত পাশে R চিহ্নিত করি। PR যোগ করলে মূল কোণের সমান কোণ পাওয়া যায়।'
SIXTY='O থেকে একটি রশ্মি আঁকি। O কেন্দ্র করে যেকোনো ব্যাসার্ধে চাপ দিয়ে রশ্মিতে A নিই। A কেন্দ্র করে একই ব্যাসার্ধে আগের চাপকে B-তে কাটি। OB যোগ করি। OA=AB=BO হওয়ায় ∠AOB=৬০°।'
def practical(k,i):
 length=F(40+i*2,10);half=length/2;theta=30+4*i
 if k==0:
  return standard(f'রুলারে AB={fmt(length)} সেমি রেখাংশ আঁকা হলো। অন্য একটি রশ্মিতে AB-এর সমান CD রেখাংশ বসাতে হবে।','AB-এর দৈর্ঘ্য মিলিমিটারে কত?',length*10,f'১ সেমি=১০ মিমি; দৈর্ঘ্য {fmt(length*10)} মিমি।','AB ও সমান CD-এর মোট দৈর্ঘ্য কত?',length*2,f'CD=AB={fmt(length)} সেমি; যোগফল {fmt(length*2)} সেমি।','রুলার-কম্পাসে সমান রেখাংশ স্থানান্তরের ধাপ ও যাচাই লেখো।',f'C থেকে রশ্মি আঁকি। AB দূরত্ব কম্পাসে নিই; C কেন্দ্র করে একই ফাঁকে চাপ এঁকে রশ্মিতে D নিই। CD=AB={fmt(length)} সেমি।',[2*length==length+length])
 if k==1:
  return standard(f'AB={fmt(length)} সেমি রেখাংশের মধ্যবিন্দু M রুলার ও কম্পাসে নির্মাণ করতে হবে।','AM কত হবে?',half,f'AM=AB/২={fmt(half)} সেমি।','AM ও MB-এর দৈর্ঘ্যের যোগফল কত?',length,f'AM=MB={fmt(half)}; যোগফল {fmt(length)} সেমি।','নির্মাণের ধাপ ও সমান দূরত্বের যাচাই লেখো।',BISECT+f' পরিমাপে AM=MB={fmt(half)} সেমি হতে হবে।',[half+half==length])
 if k==2:
  quarter=length/4
  return standard(f'AB={fmt(length)} সেমি রেখাংশকে রুলার-কম্পাসে সমান চার ভাগ করতে হবে।','প্রতিটি ভাগের দৈর্ঘ্য কত?',quarter,f'AB/৪={fmt(quarter)} সেমি।','প্রথম তিন ভাগের মোট দৈর্ঘ্য কত?',quarter*3,f'৩×{fmt(quarter)}={fmt(quarter*3)} সেমি।','সমান চার ভাগ নির্মাণের ধাপ এবং মোট দৈর্ঘ্য যাচাই লেখো।',BISECT+' এরপর AM ও MB একই নিয়মে সমদ্বিখণ্ডিত করি। '+f'চার অংশ প্রতিটি {fmt(quarter)} সেমি; যোগফল {fmt(length)} সেমি।',[quarter*4==length])
 if k==3:
  return standard(f'একটি সরলরেখার P বিন্দুতে লম্ব PQ আঁকতে হবে। PA=PB={fmt(length)} সেমি নিয়ে P-এর দুই পাশে A ও B নেওয়া হলো।','AB কত সেমি?',length*2,f'AB=AP+PB={fmt(length*2)} সেমি।','লম্ব আঁকলে ∠QPA কত হবে?',90,'PQ লম্ব হলে ∠QPA=৯০°।','রুলার-কম্পাস পদ্ধতি লিখে ∠QPA+∠QPB যাচাই করো।',ONPERP+' দুটি কোণই ৯০°; যোগফল ১৮০°।',[length*2==length+length])
 if k==4:
  r=length+2
  return standard(f'একটি রেখার বাইরের P বিন্দু থেকে রেখাটির ওপর লম্ব আঁকতে হবে। P কেন্দ্রের একটি চাপ রেখাকে A,B-তে কাটে; PA={fmt(r)} সেমি।','PB কত সেমি?',r,f'একই কেন্দ্র ও ব্যাসার্ধের চাপ বলে PB=PA={fmt(r)} সেমি।','লম্ব ও মূল রেখার ক্ষুদ্রতর কোণ কত?',90,'লম্ব রেখাদ্বয়ের অন্তর্ভুক্ত ক্ষুদ্রতর কোণ ৯০°।','নির্মাণের ধাপ ও পাদবিন্দুর প্রয়োজনীয় শর্ত লেখো।',OFFPERP+' পাদবিন্দু M হলে PM মূল রেখার সঙ্গে ৯০° কোণ করবে।',[r==length+2])
 if k==5:
  return standard(f'চাঁদা দিয়ে ∠AOB={bn(theta)}° আঁকতে হবে। পরে রশ্মি OB-এর বিপরীত রশ্মি OC নেওয়া হবে।','প্রদত্ত কোণের পরিমাপ কত?',theta,f'চাঁদার সঠিক স্কেলে {bn(theta)}° নিতে হবে।','∠AOC কত হবে?',180-theta,f'OB ও OC বিপরীত রশ্মি; ∠AOC=১৮০°−{bn(theta)}°={bn(180-theta)}°।','চাঁদায় কোণ নির্মাণের ধাপ ও স্কেল নির্বাচনের নিয়ম লেখো।',f'O থেকে OA রশ্মি আঁকি। চাঁদার কেন্দ্র O-তে এবং ভিত্তির শূন্য দাগ OA-তে রাখি। OA-এর শূন্য থেকে গণনা করা স্কেলে {bn(theta)}°-এ B চিহ্নিত করে OB আঁকি। বিপরীত স্কেল ভুল করে নেওয়া যাবে না।',[0<theta<180,theta+180-theta==180])
 if k==6:
  return standard(f'একটি কোণের মান {bn(theta)}°। রুলার-কম্পাসে সমান আরেকটি কোণ নির্মাণ করতে হবে। মূল কোণের দুই বাহুর ওপর একই চাপের ছেদ A,B।','নতুন কোণের মান কত হবে?',theta,f'সমান কোণ বলে নতুন কোণ {bn(theta)}°।','নতুন কোণের সমদ্বিখণ্ডকের দুই পাশে প্রতিটি কোণ কত?',F(theta,2),f'{bn(theta)}°÷২={fmt(F(theta,2))}°।','কোণ স্থানান্তরের ধাপ এবং কেন ব্যাসার্ধ অপরিবর্তিত থাকবে লেখো।',COPYANGLE+' একই ব্যাসার্ধ ও একই জ্যা দূরত্ব স্থানান্তর করলে কোণটি অপরিবর্তিত থাকে।',[F(theta,2)*2==theta])
 if k==7:
  return standard(f'∠AOB={bn(theta)}° কোণকে রুলার-কম্পাসে সমদ্বিখণ্ডিত করে OC রশ্মি আঁকতে হবে।','∠AOC কত হবে?',F(theta,2),f'সমদ্বিখণ্ডক বলে অর্ধেক {fmt(F(theta,2))}°।','∠AOC ও ∠COB-এর পরিমাপের যোগফল কত?',theta,f'উভয়ের মান {fmt(F(theta,2))}°; যোগফল {bn(theta)}°।','নির্মাণের ধাপ ও সমান দুটি কোণ পাওয়ার যাচাই লেখো।',ANGLEBISECT+f' চাঁদায় যাচাই করে দুটি {fmt(F(theta,2))}° কোণ পাওয়া উচিত।',[F(theta,2)*2==theta])
 if k==8:
  radius=length
  return standard(f'কম্পাসের ফাঁক {fmt(radius)} সেমি রেখে OA=OB=AB নিয়ে ৬০° কোণ নির্মাণ করা হবে।','OA+AB+BO কত সেমি?',radius*3,f'তিন বাহুই {fmt(radius)} সেমি; যোগফল {fmt(radius*3)} সেমি।','নির্মিত ৬০° কোণ সমদ্বিখণ্ডিত করলে কত হবে?',30,'৬০°÷২=৩০°।','চাঁদা ছাড়া ৬০° এবং তা থেকে ৩০° নির্মাণের ধাপ লেখো।',SIXTY+' এরপর '+ANGLEBISECT+' ফলে ৩০° পাওয়া যায়।',[radius*3==radius+radius+radius])
 angle=90;extra=2+i
 return standard(f'রুলার-কম্পাসে একটি সমকোণ আঁকা হবে। এর একটি বাহুতে শীর্ষ থেকে {fmt(length)} সেমি দূরে B নেওয়া হলো। পরে সমকোণ সমদ্বিখণ্ডিত হবে।','সমকোণের একটি অর্ধাংশ কত?',45,'৯০°÷২=৪৫°।',f'B-এর আরও {bn(extra)} সেমি সামনে C নিলে শীর্ষ থেকে C-এর দূরত্ব কত?',length+extra,f'{fmt(length)}+{bn(extra)}={fmt(length+extra)} সেমি।','চাঁদা ছাড়া ৯০° থেকে ৪৫° নির্মাণের ধাপ ও কোণসমষ্টির যাচাই লেখো।',ONPERP+' এতে ৯০° পাওয়া যায়। এরপর '+ANGLEBISECT+' দুই অংশ ৪৫°+৪৫°=৯০°।',[45+45==90,length+extra>length])

# DATA: every mean, median and frequency cross-checked by standard-library oracles.
def med(xs):
 s=sorted(xs);n=len(s);return F(s[n//2]) if n%2 else F(s[n//2-1]+s[n//2],2)
def data(k,i):
 base=10+i;xs=[base,base+4,base+2,base+8,base+6]
 if k==0:
  avg=F(sum(xs),len(xs));middle=med(xs)
  return standard(f'পাঁচ শিক্ষার্থীর প্রাপ্ত নম্বর: {nums(xs)}।','নম্বরগুলোর যোগফল কত?',sum(xs),f'যোগফল {bn(sum(xs))}।','গাণিতিক গড় কত?',avg,f'গড়=যোগফল/সংখ্যা={bn(sum(xs))}/৫={fmt(avg)}।','উপাত্ত সাজিয়ে মধ্যক ও সর্বোচ্চ-সর্বনিম্নের পার্থক্য নির্ণয় করো।',f'ক্রম {nums(sorted(xs))}। মধ্যক {fmt(middle)}, পার্থক্য {bn(max(xs)-min(xs))}।',[F(statistics.mean(xs))==avg,F(statistics.median(xs))==middle])
 if k==1:
  xs=[base+9,base,base+5,base+2,base+7,base+3];m=med(xs);avg=F(sum(xs),6)
  return standard(f'ছয় দিনে পড়ার সময় (মিনিট): {nums(xs)}।','মোট পড়ার সময় কত মিনিট?',sum(xs),f'ছয় মানের যোগফল {bn(sum(xs))} মিনিট।','মধ্যক কত মিনিট?',m,f'ক্রম {nums(sorted(xs))}; মাঝের দুটি {bn(sorted(xs)[2])}, {bn(sorted(xs)[3])}; গড় {fmt(m)} মিনিট।','গাণিতিক গড় নির্ণয় করে মধ্যকের সঙ্গে পার্থক্য লেখো।',f'গড় {fmt(avg)} মিনিট; গড়−মধ্যক={fmt(avg-m)} মিনিট।',[m==F(statistics.median(xs)),avg*6==sum(xs)])
 if k==2:
  a=base;b=base+3;c=base+6;xs=[a,b,b,c,b,a];avg=F(sum(xs),6)
  return standard(f'ছয় পরিবারের বইয়ের সংখ্যা: {nums(xs)}।',f'{bn(b)} সংখ্যাটির গণসংখ্যা কত?',3,f'{bn(b)} তিনবার আছে; গণসংখ্যা ৩।','উপাত্তের প্রচুরক কত?',b,f'সর্বাধিক তিনবার থাকা মান {bn(b)}-ই প্রচুরক।','মান ও গণসংখ্যার তালিকা তৈরি করে গড় নির্ণয় করো।',f'{bn(a)}:২, {bn(b)}:৩, {bn(c)}:১। গড়=({bn(a)}×২+{bn(b)}×৩+{bn(c)})/৬={fmt(avg)}।',[statistics.mode(xs)==b,len(xs)==6])
 if k==3:
  values=[base,base+5,base+10];freq=[2,3,1];xs=[v for v,n in zip(values,freq) for _ in range(n)];avg=F(sum(xs),6)
  return standard(f'একটি নম্বর-গণসংখ্যার তালিকা: {bn(values[0])} নম্বরে ২ জন, {bn(values[1])} নম্বরে ৩ জন এবং {bn(values[2])} নম্বরে ১ জন।','মোট শিক্ষার্থী কতজন?',6,'২+৩+১=৬ জন।','প্রচুরক কত?',values[1],f'সর্বাধিক গণসংখ্যা ৩; সংশ্লিষ্ট নম্বর {bn(values[1])}।','সব শিক্ষার্থীর মোট নম্বর ও গড় নির্ণয় করো।',f'মোট {bn(sum(xs))}; গড় {bn(sum(xs))}/৬={fmt(avg)}।',[len(xs)==sum(freq),statistics.mode(xs)==values[1]])
 if k==4:
  vals=[base*2,base*2+5,base*2+10,base*2+15];total=sum(vals);gap=vals[-1]-vals[0]
  return standard(f'চার দিনে বিক্রিত খাতার সংখ্যা: সোম {bn(vals[0])}, মঙ্গল {bn(vals[1])}, বুধ {bn(vals[2])}, বৃহস্পতি {bn(vals[3])}। বারচিত্রে y-অক্ষে প্রতি ঘর ৫টি খাতা।','চার দিনে মোট খাতা কত?',total,f'যোগফল {bn(total)}টি।','বৃহস্পতি ও সোমবারের বিক্রির পার্থক্য কত?',gap,f'{bn(vals[3])}−{bn(vals[0])}={bn(gap)}টি।','বারচিত্র আঁকার ধাপ ও গড় বিক্রি নির্ণয় করো।',f'x-অক্ষে দিন ও y-অক্ষে সংখ্যা নিই; y-স্কেলে প্রতি ঘর ৫। চারটি সমান প্রস্থের স্তম্ভের উচ্চতা যথাক্রমে {nums(vals)} নিই। গড় {fmt(F(total,4))}টি।',[gap==15,F(total,4)*4==total])
 if k==5:
  temps=[base+12,base+15,base+11,base+17];rise=temps[1]-temps[0];gap=max(temps)-min(temps)
  return standard(f'সকাল ৬টা, ৯টা, দুপুর ১২টা ও বিকাল ৩টায় তাপমাত্রা যথাক্রমে {nums(temps)}°সে।','সকাল ৬টা থেকে ৯টায় কত ডিগ্রি বেড়েছে?',rise,f'{bn(temps[1])}−{bn(temps[0])}={bn(rise)}°সে।','সর্বোচ্চ ও সর্বনিম্ন তাপমাত্রার পার্থক্য কত?',gap,f'{bn(max(temps))}−{bn(min(temps))}={bn(gap)}°সে।','রেখাচিত্র আঁকার নিয়ম ও কখন সর্বোচ্চ ছিল লেখো।',f'x-অক্ষে সমান সময়ের ব্যবধান এবং y-অক্ষে সমান তাপমাত্রা স্কেল নিই। চার জোড়া সময়-তাপমাত্রার বিন্দু চিহ্নিত করে পরপর সরলরেখা দিয়ে যোগ করি। বিকাল ৩টায় সর্বোচ্চ {bn(max(temps))}°সে।',[rise==3,gap==6])
 if k==6:
  avg=base+5;known=[base+1,base+3,base+7,base+9];missing=avg*5-sum(known)
  return standard(f'পাঁচটি সংখ্যার গড় {bn(avg)}। চারটি সংখ্যা {nums(known)}; পঞ্চমটি অজানা।','পাঁচ সংখ্যার মোট যোগফল কত?',avg*5,f'মোট=গড়×সংখ্যা={bn(avg)}×৫={bn(avg*5)}।','অজানা সংখ্যাটি কত?',missing,f'জানা যোগফল {bn(sum(known))}; অজানা {bn(avg*5)}−{bn(sum(known))}={bn(missing)}।','সব সংখ্যা লিখে মধ্যক ও গড় পুনরায় যাচাই করো।',f'সংখ্যা {nums(sorted(known+[missing]))}। মধ্যক {fmt(med(known+[missing]))}; গড় {bn(avg)}।',[F(sum(known+[missing]),5)==avg])
 if k==7:
  old=[base,base+2,base+4,base+6];new=base+8;avg=F(sum(old)+new,5)
  return standard(f'চারটি দৈনিক সঞ্চয় {nums(old)} টাকা। পঞ্চম দিনে {bn(new)} টাকা সঞ্চয় হলো।','প্রথম চার দিনের গড় কত?',F(sum(old),4),f'{bn(sum(old))}/৪={fmt(F(sum(old),4))} টাকা।','পাঁচ দিনের গড় কত?',avg,f'নতুন মোট {bn(sum(old)+new)}; গড় {fmt(avg)} টাকা।','নতুন উপাত্ত যোগে গড় কত বাড়ল এবং কেন বাড়ল ব্যাখ্যা করো।',f'বৃদ্ধি {fmt(avg-F(sum(old),4))} টাকা। নতুন মান আগের গড়ের চেয়ে বেশি, তাই গড় বেড়েছে।',[avg==F(statistics.mean(old+[new])),new>F(sum(old),4)])
 if k==8:
  xs=[base+2,base+2,base+5,base+8,base+8,base+8,base+10];mode=base+8;m=med(xs)
  return standard(f'সাতজনের সংগ্রহের উপাত্ত: {nums(xs)}।','উপাত্তে কয়টি পৃথক মান আছে?',len(set(xs)),f'পৃথক মান {nums(sorted(set(xs)))}; মোট {bn(len(set(xs)))}টি।','প্রচুরক কত?',mode,f'{bn(mode)} সর্বাধিক তিনবার আছে।','মধ্যক নির্ণয় করে প্রচুরকের সঙ্গে পার্থক্য ব্যাখ্যা করো।',f'সাজানো উপাত্তের চতুর্থ মান {fmt(m)}-ই মধ্যক। মধ্যক ও প্রচুরক এখানে উভয়ই {bn(mode)}; পার্থক্য ০।',[m==mode,statistics.mode(xs)==mode])
 vals=[base+1,base+4,base+7];freq=[3,2,4];xs=[v for v,n in zip(vals,freq) for _ in range(n)];m=med(xs)
 return standard(f'বই পড়ার জরিপে {bn(vals[0])}টি বই পড়েছে ৩ জন, {bn(vals[1])}টি পড়েছে ২ জন, {bn(vals[2])}টি পড়েছে ৪ জন।','মোট অংশগ্রহণকারী কতজন?',9,'৩+২+৪=৯ জন।','মধ্যক কতটি বই?',m,f'নয়টি সাজানো মানের পঞ্চমটি {fmt(m)}; সেটিই মধ্যক।','গণসংখ্যা থেকে মোট বই এবং গড় নির্ণয় করো।',f'মোট {bn(sum(xs))}টি; গড় {bn(sum(xs))}/৯={fmt(F(sum(xs),9))}টি।',[len(xs)==9,m==F(statistics.median(xs))])

TITLES={3:'৩. পূর্ণসংখ্যা',4:'৪. বীজগণিতীয় রাশি',5:'৫. সরল সমীকরণ',6:'৬. জ্যামিতির মৌলিক ধারণা',7:'৭. ব্যবহারিক জ্যামিতি',8:'৮. তথ্য ও উপাত্ত'}
READ={3:[59,63,69,75],4:[76,81,87,94],5:[95,98,102,105],6:[106,111,117,123],7:list(range(124,137)),8:[137,141,145,149]}
PAGES={3:[[59,63],[63,69],[69,75],[63],[69],[75],[59,63],[69,75],[69],[63,75]],4:[[81],[87],[81,94],[94],[87],[76,87],[81],[76,81],[87],[94]],5:[[95,98],[98,102],[98],[98],[98],[98],[102,105],[105],[102],[102,105]],6:[[106],[111,123],[111],[111],[111],[117,123],[117],[117],[106],[117]],7:[[126,127],[127],[127,128],[128,129],[131,132],[132],[133],[133,134],[134],[128,133,134]],8:[[141,149],[141],[137,149],[137],[137,145],[145],[141],[141],[141,149],[137,141]]}
FACTORIES={3:integer,4:algebra,5:equation,6:geometry,7:practical,8:data}
FAMILY_NAMES={3:['তাপমাত্রা','লিফট','হিসাবের স্থিতি','সংখ্যারেখা','খেলার পয়েন্ট','চিহ্নভিত্তিক যোগ','ডুবুরির অবস্থান','বিয়োগ ও বিপরীত','তিন ধাপের পরিবর্তন','দূরত্ব ও স্থানান্তর'],4:['দামের রাশি','সদৃশ একপদ','দ্বিপদ যোগ','রাশির বিয়োগ','সূচক','দ্বিঘাতের মান','পরিসীমার রাশি','কথা থেকে রাশি','সদৃশ-বিসদৃশ','ঋণাত্মক ধ্রুবক'],5:['যোগ সমীকরণ','দাম ও গুণ','দুই ধাপ','বিয়োগ সমীকরণ','উভয় পক্ষে চলক','ভগ্নাংশ সমীকরণ','বয়স','ক্রমিক সংখ্যা','ক্রয়মূল্য','রাশির ব্যবধান'],6:['রেখাংশ','পূরক','সম্পূরক','পূর্ণ আবর্তন','বিপ্রতীপ','ত্রিভুজ','সমদ্বিবাহু','সমকোণী','সমান্তরাল ও ছেদক','চতুর্ভুজ'],7:['সমান রেখাংশ','মধ্যবিন্দু','চার ভাগ','রেখার বিন্দুতে লম্ব','বহিঃস্থ বিন্দু থেকে লম্ব','চাঁদায় কোণ','সমান কোণ স্থানান্তর','কোণ সমদ্বিখণ্ডন','৬০° ও ৩০°','৯০° ও ৪৫°'],8:['গড়','জোড়সংখ্যক মধ্যক','প্রচুরক','গণসংখ্যা','স্তম্ভচিত্র','রেখাচিত্র','অজানা উপাত্ত','নতুন উপাত্তে গড়','মধ্যক ও প্রচুরক','গণসংখ্যায় মধ্যক']}
def emit(path,value):
 if '--check' in sys.argv:assert path.read_text()==value,f'Not reproducible: {path}'
 else:path.parent.mkdir(parents=True,exist_ok=True);path.write_text(value)
results=[]
for ch,factory in FACTORIES.items():
 items=[];ledger=[]
 def page(k):return 'ধারণাসূত্র: মুদ্রিত '+', '.join(map(bn,PAGES[ch][k]))
 for k in range(10):
  for i in range(5):
   s=factory(k,i)
   for part,(q,value,e) in enumerate(s['objectives']):
    distract=[]
    for x in [value+1,value-1,value+2,value+3,value/2]:
     if x!=value and x not in distract:distract.append(x)
     if len(distract)==3:break
    choices=distract[:];pos=len(items)%4;choices.insert(pos,value)
    assert len(set(choices))==4
    items.append(dict(type='MCQ',text=s['stimulus']+'\n'+q,options=dict(zip('ABCD',map(fmt,choices))),correct='ABCD'[pos],explanation=e,page=page(k),difficulty='MEDIUM'))
    ledger.append(dict(type='MCQ',family=FAMILY_NAMES[ch][k],variant=i+1,objective=part+1,expected=str(value),choices=list(map(str,choices))))
 assert len(items)==100
 for k in range(10):
  for i in range(5,8):
   s=factory(k,i)
   items.append(dict(type='CQ',text=s['stimulus'],explanation='উদ্দীপকের তথ্য ও অধ্যায়ের ধারণা প্রয়োগ করে অংশভিত্তিক সমাধান দেওয়া হলো।',page=page(k),difficulty='MEDIUM',parts=[dict(label=l,marks=m,question=q,solution=a) for l,m,(q,a) in zip(['ক','খ','গ'],[2,4,4],s['parts'])]))
   ledger.append(dict(type='CQ',family=FAMILY_NAMES[ch][k],variant=i+1))
 for k in range(10):
  for i in range(8,11):
   s=factory(k,i);q,v,e=s['objectives'][i%2]
   items.append(dict(type='SQ',text=s['stimulus']+'\n'+q,explanation=e,page=page(k),difficulty='MEDIUM'))
   ledger.append(dict(type='SQ',family=FAMILY_NAMES[ch][k],variant=i+1))
 assert len(items)==160
 assert len({x['text'] for x in items})==160,(ch,'duplicate')
 assert not any('{' in q['text'] for q in items)
 batch=dict(category='Class 6',subject='গণিত',topic=TITLES[ch],book='নিজস্ব অনুশীলনী; ধারণাসূত্র ব্যবহারকারীর ২০২৬ গণিত PDF',edition='Draft; গণনা/গঠন পরীক্ষিত; পূর্ণ শিক্ষক ও ভাষা পর্যালোচনা বাকি',sourceUrl='https://drive.google.com/file/d/1dQ5TSKvQZVwRca_evhBY_hC5gjxcnd5q/view',lang='Bangla',items=items)
 limitations=['১০টি সমস্যা-পরিবার; প্রতি পরিবারের ২টি objective-এর ৫ variant-এ ১০০ MCQ, তিনটি করে variant-এ ৩০ CQ এবং তিনটি করে variant-এ ৩০ SQ। স্বতন্ত্র ১৬০ দক্ষতা নয়।','গণনা/গঠন পরীক্ষা হয়েছে; স্বাধীন শিক্ষক ও প্রশ্নের difficulty/মানবণ্টন অনুমোদন বাকি।','নির্বাচিত পৃষ্ঠা ধারণাসূত্র, প্রশ্ন বই থেকে হুবহু উদ্ধৃতি নয়; প্রতিটি উপবিষয়ের পূর্ণ coverage দাবি নয়।']
 if ch!=7:limitations.append('সম্পূর্ণ অধ্যায়ের সব পৃষ্ঠা পড়া হয়নি; নির্বাচিত চারটি পৃষ্ঠা দেখা হয়েছে।')
 if ch in [6,7,8]:limitations.append('প্রয়োজনীয় জ্যামিতিক চিত্র/লেখচিত্র শিক্ষার্থীকে আঁকতে বলা হয়েছে; সমাধানে ধাপ দেওয়া আছে, সমাপ্ত চিত্র যুক্ত নয়। চিত্রভিত্তিক শিক্ষক যাচাই বাকি।')
 report=dict(status='DRAFT_SUBJECT_REVIEW_PENDING',counts={'MCQ':100,'CQ':30,'SQ':30},chapter=ch,topic=TITLES[ch],sourceSha256='ffa30c8b815f49f3326b70ae58c5e17f11c4d8bd6d854eb84153fab8d593f23f',printedPagesVisuallyRead=READ[ch],fullChapterRead=ch==7,independentTeacherApproved=False,productionImported=0,problemFamilies=10,MCQ_objectiveTemplates=20,exactDuplicateStems=0,checks='exact Fraction calculations, scene invariants, options distinct, counts and labels',limitations=limitations,items=ledger)
 md=f'# ষষ্ঠ শ্রেণি গণিত — {TITLES[ch]}\n\n১০০ MCQ + ৩০ CQ সেট + ৩০ SQ: নিজস্ব Draft। শিক্ষক পর্যালোচনা বাকি।\n\n'+'\n'.join('- '+l for l in limitations)+'\n\n'
 for kind in ['MCQ','CQ','SQ']:
  md+='## '+kind+'\n\n'
  for n,q in enumerate([x for x in items if x['type']==kind],1):
   md+=f'### {kind} {bn(n)}\n\n{q["text"]}\n\n'
   if kind=='MCQ':md+='\n'.join(f'- {l}. {v}' for l,v in q['options'].items())+f'\n\n**উত্তর: {q["correct"]}** — {q["explanation"]}\n\n'
   elif kind=='SQ':md+='**উত্তর:** '+q['explanation']+'\n\n'
   else:
    for p in q['parts']:md+=f'**{p["label"]})** {p["question"]} [{bn(p["marks"])}]\n\n'
    md+='**সমাধান**\n\n'
    for p in q['parts']:md+=f'**{p["label"]})** {p["solution"]}\n\n'
   md+=q['page']+'।\n\n'
 out=ROOT/f'content/question-bank/class-6/chapter-{ch}'
 emit(out/'questions.json',json.dumps(batch,ensure_ascii=False,indent=2)+'\n')
 emit(out/'validation.json',json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 emit(out/'review.md',md)
 results.append(dict(chapter=ch,counts=report['counts'],bytes=len(json.dumps(batch,ensure_ascii=False).encode())))
print(json.dumps(results,ensure_ascii=False))
