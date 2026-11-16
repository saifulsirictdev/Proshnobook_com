"""Original chapter-2 practice drafts, exact rational checks, no database access.
Run from repository root, or add --check to check reproducibility.
"""
import json, math, sys
from fractions import Fraction as F
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'content/question-bank/class-6/chapter-2'
BN=str.maketrans('0123456789','০১২৩৪৫৬৭৮৯')
def bn(v):return str(v).translate(BN)
def fmt(v):
 v=F(v);return bn(v.numerator) if v.denominator==1 else bn(v.numerator)+'/'+bn(v.denominator)
def ratio(v):
 v=F(v);return bn(v.numerator)+':'+bn(v.denominator)
items=[];ledger=[]
def track(kind,skill,page,values):ledger.append(dict(number=len(items),type=kind,skill=skill,conceptPages=page if isinstance(page,list) else [page],checks={k:str(v) for k,v in values.items()}))
def mc(skill,q,answer,explanation,page,check,style='number',alternatives=()):
 answer=F(answer);assert check(answer),(skill,q,answer)
 distract=[]
 for v in list(alternatives)+[answer+1,answer+2,answer+3,answer/2,answer*2]:
  v=F(v)
  if v>=0 and v!=answer and v not in distract:distract.append(v)
  if len(distract)==3:break
 assert len(distract)==3 and not any(check(v) for v in distract)
 pos=sum(x['type']=='MCQ' for x in items)%4;choices=distract[:];choices.insert(pos,answer)
 display=ratio if style=='ratio' else lambda v:fmt(v)+('%' if style=='percent' else '')
 opts=dict(zip('ABCD',map(display,choices)))
 assert len(set(opts.values()))==4
 items.append(dict(type='MCQ',text=q,options=opts,correct='ABCD'[pos],explanation=explanation,page='ধারণা: মুদ্রিত '+', '.join(map(bn,page if isinstance(page,list) else [page])),difficulty='EASY'))
 track('MCQ',skill,page,{'answer':answer,'choices':choices})
def sq(skill,q,a,page,check):
 assert check
 items.append(dict(type='SQ',text=q,explanation=a,page='ধারণা: মুদ্রিত '+bn(page),difficulty='MEDIUM'))
 track('SQ',skill,page,{'arithmeticAssertion':True})
def cq(skill,stimulus,questions,answers,page,check):
 assert check
 items.append(dict(type='CQ',text=stimulus,explanation='অনুপাত/শতকরা বা ঐকিক নিয়ম অনুযায়ী ধাপে ধাপে সমাধান নিচে দেওয়া হলো।',page='ধারণা: মুদ্রিত '+', '.join(map(bn,page if isinstance(page,list) else [page])),difficulty='MEDIUM',parts=[dict(label=l,marks=m,question=q,solution=a) for l,m,q,a in zip(['ক','খ','গ'],[2,4,4],questions,answers)]))
 track('CQ',skill,page,{'arithmeticAssertion':True})
for i in range(4):
 a=2+i;b=5+i;k=3+i
 mc('অনুপাত সরলীকরণ',f'{bn(a*k)} : {bn(b*k)} অনুপাতের সরলতম রূপ কোনটি?',F(a,b),f'উভয় রাশিকে গসাগু {bn(math.gcd(a*k,b*k))} দিয়ে ভাগ করলে {ratio(F(a,b))}।',40,lambda x:x*b==a,'ratio',[F(b,a),F(a+1,b),F(a,b+1)])
 cm=120+30*i;m=3+i;v=F(cm,m*100)
 mc('একক মিলিয়ে অনুপাত',f'{bn(cm)} সেমি ও {bn(m)} মিটারের অনুপাত কত?',v,f'{bn(m)} মিটার = {bn(m*100)} সেমি। অনুপাত {bn(cm)}:{bn(m*100)} = {ratio(v)}।',40,lambda x:x*m*100==cm,'ratio')
 a=3+i;b=7+i;k=4+i
 mc('সমতুল অনুপাতের শূন্যস্থান',f'{bn(a)} : {bn(b)} = {bn(a*k)} : □ হলে □ কত?',b*k,f'পূর্ব রাশি {bn(k)} গুণ হয়েছে; উত্তর রাশিও {bn(k)} গুণ: {bn(b)} × {bn(k)} = {bn(b*k)}।',41,lambda x:x*a==b*a*k)
 a=4+i;b=9+i
 mc('ব্যস্ত অনুপাত',f'{bn(a)} : {bn(b)}-এর ব্যস্ত অনুপাত কোনটি?',F(b,a),f'পূর্ব ও উত্তর রাশির স্থান বদলালে {bn(b)}:{bn(a)}।',44,lambda x:x*a==b,'ratio')
 a=2+i;b=3+i;c=4+i;d=7+i;v=F(a*c,b*d)
 mc('মিশ্র অনুপাত',f'{bn(a)}:{bn(b)} ও {bn(c)}:{bn(d)}-এর মিশ্র অনুপাত কোনটি?',v,f'পূর্ব রাশির গুণফল : উত্তর রাশির গুণফল = {bn(a*c)}:{bn(b*d)} = {ratio(v)}।',44,lambda x:x*b*d==a*c,'ratio')
 a=2+i;b=5+i;unit=40+10*i;total=(a+b)*unit
 mc('অনুপাতে প্রথম অংশ',f'{bn(total)} টাকা {bn(a)}:{bn(b)} অনুপাতে ভাগ করলে প্রথম অংশ কত টাকা?',a*unit,f'মোট অনুপাত {bn(a+b)}; প্রথম অংশ {bn(total)} × {bn(a)}/{bn(a+b)} = {bn(a*unit)} টাকা।',43,lambda x:x*(a+b)==total*a)
 mc('অনুপাতে দ্বিতীয় অংশ',f'{bn(total+ (a+b)*10)} টাকা {bn(a)}:{bn(b)} অনুপাতে ভাগ করলে দ্বিতীয় অংশ কত টাকা?',b*(unit+10),f'দ্বিতীয় অংশ = {bn(total+(a+b)*10)} × {bn(b)}/{bn(a+b)} = {bn(b*(unit+10))} টাকা।',45,lambda x:x*(a+b)==(total+(a+b)*10)*b)
 girls=(6+i)*20;a=3+i;b=6+i;boys=F(girls*a,b)
 mc('এক অংশ থেকে অন্য অংশ',f'ছাত্র ও ছাত্রীর অনুপাত {bn(a)}:{bn(b)}। ছাত্রী {bn(girls)} জন হলে ছাত্র কতজন?',boys,f'ছাত্র = {bn(girls)} × {bn(a)}/{bn(b)} = {fmt(boys)} জন।',45,lambda x:x*b==girls*a)
 a=2+i;b=5+i;v=F(a*100,b)
 mc('অনুপাত থেকে শতকরা',f'{bn(a)}:{bn(b)} অনুপাতকে শতকরায় প্রকাশ করলে কত?',v,f'{bn(a)}/{bn(b)} × ১০০% = {fmt(v)}%।',49,lambda x:x*b==a*100,'percent')
 p=[15,24,35,64][i];v=F(p,100)
 mc('শতকরা থেকে ভগ্নাংশ',f'{bn(p)}%-এর সমান সাধারণ ভগ্নাংশ কোনটি?',v,f'{bn(p)}% = {bn(p)}/১০০ = {fmt(v)}।',48,lambda x:x*100==p)
 p=[20,30,45,75][i];v=F(p,100)
 mc('শতকরা থেকে অনুপাত',f'{bn(p)}%-কে সরল অনুপাতে প্রকাশ করলে কোনটি হবে?',v,f'{bn(p)}:১০০ সরল করলে {ratio(v)}।',48,lambda x:x*100==p,'ratio')
 n=[1,3,7,9][i];d=[4,5,20,25][i];v=F(n*100,d)
 mc('ভগ্নাংশ থেকে শতকরা',f'{bn(n)}/{bn(d)}-কে শতকরায় প্রকাশ করো।',v,f'{bn(n)}/{bn(d)} × ১০০% = {fmt(v)}%।',49,lambda x:x*d==n*100,'percent')
 p=[25,40,60,85][i]
 mc('দশমিক থেকে শতকরা',f'দশমিক ০.{bn(p)}-কে শতকরায় প্রকাশ করলে কত হবে?',p,f'০.{bn(p)} × ১০০% = {bn(p)}%।',51,lambda x:F(x,100)==F(p,100),'percent')
 total=400+100*i;p=15+5*i;ans=F(total*p,100)
 mc('শতকরা অংশের মান',f'{bn(total)} টাকার {bn(p)}% কত টাকা?',ans,f'{bn(total)} × {bn(p)}/১০০ = {fmt(ans)} টাকা।',51,lambda x:x*100==total*p)
 total=300+100*i;part=60+20*i;ans=F(part*100,total)
 mc('এক রাশি অন্যের কত শতাংশ',f'{bn(part)} টাকা {bn(total)} টাকার কত শতাংশ?',ans,f'শতকরা = {bn(part)} ÷ {bn(total)} × ১০০% = {fmt(ans)}%।',51,lambda x:x*total==part*100,'percent')
 p=10+5*i;original=600+200*i;part=F(original*p,100)
 mc('শতকরা থেকে মূল রাশি',f'কোনো টাকার {bn(p)}% হলো {fmt(part)} টাকা। মূল টাকা কত?',original,f'১% = {fmt(part)}/{bn(p)} টাকা; ১০০% = {bn(original)} টাকা।',51,lambda x:x*p==part*100)
 total=500+100*i;bad=20+10*i;good=total-bad;ans=F(good*100,total)
 mc('ভালো পণ্যের শতকরা',f'{bn(total)}টি আমের {bn(bad)}টি নষ্ট। ভালো আম কত শতাংশ?',ans,f'ভালো আম {bn(good)}টি। শতকরা {bn(good)}/{bn(total)} × ১০০% = {fmt(ans)}%।',50,lambda x:x*total==good*100,'percent')
 price=800+200*i;p=10+5*i;pay=F(price*(100-p),100)
 mc('মূল্যছাড়ে প্রদেয় টাকা',f'{bn(price)} টাকার বইয়ে {bn(p)}% ছাড় দিলে দিতে হবে কত টাকা?',pay,f'ছাড় {fmt(F(price*p,100))} টাকা। প্রদেয় {bn(price)} − {fmt(F(price*p,100))} = {fmt(pay)} টাকা।',51,lambda x:x*100==price*(100-p))
 students=400+100*i;p=5+5*i;new=F(students*(100+p),100)
 mc('শতকরা বৃদ্ধি',f'বিদ্যালয়ে {bn(students)} শিক্ষার্থী ছিল। {bn(p)}% নতুন ভর্তি হলে মোট শিক্ষার্থী কতজন?',new,f'নতুন শিক্ষার্থী {fmt(F(students*p,100))}। মোট {fmt(new)} জন।',58,lambda x:(x-students)*100==students*p)
 n=5+i;cost=n*(12+3*i);wanted=8+i;ans=F(cost*wanted,n)
 mc('দ্রব্যসংখ্যা ও দাম',f'{bn(n)}টি কলমের দাম {bn(cost)} টাকা। একই দরে {bn(wanted)}টি কলমের দাম কত?',ans,f'১টির দাম {bn(cost)}/{bn(n)} = {bn(cost//n)} টাকা। {bn(wanted)}টির দাম {fmt(ans)} টাকা।',52,lambda x:x*n==cost*wanted)
 w=8+2*i;days=15;w2=12+3*i;ans=F(w*days,w2)
 mc('লোক ও কাজের সময়',f'সমান দক্ষতার {bn(w)} জন শ্রমিক একটি কাজ {bn(days)} দিনে করেন। একই দৈনিক কর্মঘণ্টায় {bn(w2)} জনের কত দিন লাগবে?',ans,f'মোট শ্রমিক-দিন {bn(w*days)}। সময় {bn(w*days)}/{bn(w2)} = {fmt(ans)} দিন।',52,lambda x:x*w2==w*days)
 n=30+10*i;days=12;newn=20+10*i;ans=F(n*days,newn)
 mc('লোকসংখ্যা ও খাদ্য',f'{bn(n)} জনের {bn(days)} দিনের খাবার সমান হারে খেলে {bn(newn)} জনের কত দিন চলবে?',ans,f'মোট খাদ্য {bn(n*days)} জন-দিন। {bn(newn)} জনের সময় {fmt(ans)} দিন।',53,lambda x:x*newn==n*days)
 dist=120+40*i;time=3+i;dist2=240+80*i;ans=F(time*dist2,dist)
 mc('দূরত্ব ও সময়',f'একই বেগে {bn(dist)} কিমি যেতে {bn(time)} ঘণ্টা লাগে। {bn(dist2)} কিমি যেতে কত ঘণ্টা লাগবে?',ans,f'১ কিমিতে {bn(time)}/{bn(dist)} ঘণ্টা। {bn(dist2)} কিমিতে {fmt(ans)} ঘণ্টা।',53,lambda x:x*dist==time*dist2)
 w=10+2*i;h=6;days=8;w2=8+i;h2=5;ans=F(w*h*days,w2*h2)
 mc('লোক কর্মঘণ্টা ও দিন',f'{bn(w)} জন শ্রমিক দৈনিক {bn(h)} ঘণ্টা করে {bn(days)} দিনে কাজ শেষ করেন। একই দক্ষতার {bn(w2)} জন দৈনিক {bn(h2)} ঘণ্টা করে কত দিনে কাজটি শেষ করবেন?',ans,f'মোট শ্রমঘণ্টা {bn(w*h*days)}। দিনে {bn(w2*h2)} শ্রমঘণ্টা; সময় {fmt(ans)} দিন।',56,lambda x:x*w2*h2==w*h*days)
 a=3+i;b=5+i;c=2+i;d=7+i;ans=F(a*d,b*c)
 mc('মজুরির অনুপাত ও কাজ',f'দুই শ্রমিকের দৈনিক মজুরি {bn(a)}:{bn(b)}। প্রথমজন {bn(c)} দিন, দ্বিতীয়জন {bn(d)} দিন কাজ করলে প্রথমজনের মোট মজুরি দ্বিতীয়জনের মোট মজুরির কত গুণ?',F(a*c,b*d),f'মোট মজুরির অনুপাত {bn(a*c)}:{bn(b*d)}; তাই প্রথমজন দ্বিতীয়জনের {fmt(F(a*c,b*d))} গুণ।',58,lambda x:x*b*d==a*c)
assert len(items)==100
# 15 short-question families with two variants, separate stems from MCQ.
for i in range(2):
 a=4+i;b=7+i;k=6+i
 sq('উদাহরণে অনুপাত',f'{bn(a*k)}টি লাল ও {bn(b*k)}টি নীল বল আছে। লাল ও নীল বলের সরল অনুপাত নির্ণয় করো।',f'গসাগু {bn(math.gcd(a*k,b*k))} দিয়ে ভাগ করলে অনুপাত {ratio(F(a,b))}।',40,F(a*k,b*k)==F(a,b))
 cm=150+30*i;m=3+i
 sq('দৈর্ঘ্যের একক',f'{bn(cm)} সেমি ও {bn(m)} মিটারের দৈর্ঘ্য তুলনা করে অনুপাত লেখো।',f'{bn(m)} মি = {bn(m*100)} সেমি; অনুপাত {ratio(F(cm,m*100))}।',40,F(cm,m*100)*m*100==cm)
 a=3+i;b=8+i
 sq('অনুপাতের অংশ',f'{bn(a)}:{bn(b)} অনুপাতে পূর্ব ও উত্তর রাশি চিহ্নিত করে ব্যস্ত অনুপাত লেখো।',f'পূর্ব রাশি {bn(a)}, উত্তর রাশি {bn(b)}; ব্যস্ত অনুপাত {bn(b)}:{bn(a)}।',44,F(a,b)*F(b,a)==1)
 a=2+i;b=7+i;k=5+i
 sq('সমতুল অনুপাত',f'{bn(a)}:{bn(b)}-এর উভয় রাশি {bn(k)} দিয়ে গুণ করো। নতুন অনুপাতটি সমতুল কি?',f'নতুন অনুপাত {bn(a*k)}:{bn(b*k)}। উভয় অনুপাতের ভগ্নাংশ {fmt(F(a,b))}; তাই সমতুল।',41,F(a*k,b*k)==F(a,b))
 a=3+i;b=4+i;c=5+i;d=8+i
 sq('মিশ্র অনুপাত প্রয়োগ',f'{bn(a)}:{bn(b)} ও {bn(c)}:{bn(d)} মিশিয়ে প্রাপ্ত অনুপাত সরল করো।',f'গুণফলের অনুপাত {bn(a*c)}:{bn(b*d)} = {ratio(F(a*c,b*d))}।',44,F(a,b)*F(c,d)==F(a*c,b*d))
 total=840+240*i;a=2+i;b=5+i;first=F(total*a,a+b);second=total-first
 sq('টাকা ভাগ',f'{bn(total)} টাকা {bn(a)}:{bn(b)} অনুপাতে ভাগ করে দুই অংশ নির্ণয় করো।',f'প্রথম {fmt(first)} টাকা; দ্বিতীয় {fmt(second)} টাকা। যোগফল {bn(total)} টাকা।',45,first+second==total and first*b==second*a)
 p=35+5*i
 sq('শতকরা ব্যাখ্যা',f'{bn(p)}% মানে প্রতি ১০০টিতে কয়টি? সরল অনুপাতেও প্রকাশ করো।',f'প্রতি ১০০টিতে {bn(p)}টি; অনুপাত {ratio(F(p,100))}।',48,F(p,100)*100==p)
 n=3+i;d=8+2*i;p=F(n*100,d)
 sq('ভগ্নাংশের শতাংশ',f'{bn(n)}/{bn(d)} অংশ শিক্ষার্থী উপস্থিত। শতকরা কতজন উপস্থিত?',f'{bn(n)}/{bn(d)} × ১০০% = {fmt(p)}%।',49,p*d==n*100)
 total=720+80*i;p=25+5*i;part=F(total*p,100)
 sq('অংশ হিসাব',f'{bn(total)} টাকার {bn(p)} শতাংশ সঞ্চয় করলে সঞ্চয় কত?',f'সঞ্চয় = {bn(total)} × {bn(p)}/১০০ = {fmt(part)} টাকা।',51,part*100==total*p)
 total=600+200*i;part=150+50*i;p=F(part*100,total)
 sq('প্রাপ্ত নম্বর',f'{bn(total)} নম্বরের পরীক্ষায় {bn(part)} পেলে শতকরা কত নম্বর পাওয়া হয়?',f'{bn(part)}/{bn(total)} × ১০০% = {fmt(p)}%।',50,p*total==part*100)
 cost=900+100*i;p=20+5*i;discount=F(cost*p,100)
 sq('ছাড়ের টাকা',f'{bn(cost)} টাকা মূল্যের পোশাকে {bn(p)}% ছাড়ের পর বিক্রয়মূল্য কত?',f'ছাড় {fmt(discount)} টাকা; মূল্য {fmt(cost-discount)} টাকা।',51,discount*100==cost*p)
 n=7+i;price=n*15;count=12+i
 sq('ঐকিক সরাসরি',f'{bn(n)}টি খাতার দাম {bn(price)} টাকা। একই মানের {bn(count)}টির দাম নির্ণয় করো।',f'প্রতিটি ১৫ টাকা; {bn(count)}টির দাম {bn(count*15)} টাকা।',52,F(price,n)*count==count*15)
 n=12+3*i;days=10;new=15+5*i;t=F(n*days,new)
 sq('শ্রমিক সময়',f'{bn(n)} জনে {bn(days)} দিনের কাজ সমান দক্ষতার {bn(new)} জনে কত দিনে হবে?',f'মোট {bn(n*days)} শ্রমিক-দিন; সময় {fmt(t)} দিন।',52,t*new==n*days)
 n=24+6*i;days=15;new=18+2*i;t=F(n*days,new)
 sq('খাদ্য সময়',f'{bn(n)} জনের {bn(days)} দিনের মজুত খাবার সমান হারে {bn(new)} জনের কত দিন চলবে?',f'খাদ্য {bn(n*days)} জন-দিন; সময় {fmt(t)} দিন।',53,t*new==n*days)
 a=12+3*i;b=18+6*i;rate=F(1,a)+F(1,b);t=1/rate
 sq('একত্র কাজ',f'ক একটি কাজ {bn(a)} দিনে ও খ {bn(b)} দিনে করতে পারে। একই হারে একসঙ্গে করলে সময় কত?',f'এক দিনে কাজ ১/{bn(a)} + ১/{bn(b)} = {fmt(rate)} অংশ। সময় {fmt(t)} দিন।',54,rate*t==1)
assert len(items)==130
# Ten complete CQ families, three variants each. Every set counts as one CQ.
for i in range(3):
 a=2+i;b=5+i;u=60+20*i;total=(a+b)*u;gift=30*(i+1);one=a*u;two=b*u;new=F(one+gift,two)
 cq('অনুপাতে বৃত্তি বণ্টন',f'বিদ্যালয়ের বৃত্তির {bn(total)} টাকা রিমা ও নীলার মধ্যে {bn(a)}:{bn(b)} অনুপাতে ভাগ হলো। পরে রিমা আরও {bn(gift)} টাকা পুরস্কার পেল।', ['দুই অনুপাত রাশির যোগফল নির্ণয় করো।','প্রথমে প্রত্যেকে কত টাকা পেল নির্ণয় করো।','পুরস্কার পাওয়ার পরে রিমা ও নীলার টাকার অনুপাত নির্ণয় করো।'],[f'{bn(a)} + {bn(b)} = {bn(a+b)}।',f'এক ভাগ {bn(u)} টাকা; রিমা {bn(one)}, নীলা {bn(two)} টাকা।',f'রিমার টাকা {bn(one+gift)}, নীলার {bn(two)}। নতুন অনুপাত {ratio(new)}।'],[43,45],one+two==total and new*two==one+gift)
 boys=(3+i)*20;girls=(4+i)*20;extra=(4+i)*5;total=boys+girls;new=F(boys,girls+extra)
 cq('শ্রেণির শিক্ষার্থী',f'এক শ্রেণিতে {bn(boys)} ছাত্র ও {bn(girls)} ছাত্রী আছে। পরে {bn(extra)} জন ছাত্রী ভর্তি হলো; কেউ বিদ্যালয় ছাড়েনি।',['প্রথমে মোট শিক্ষার্থী কতজন?','প্রথমে ছাত্র ও ছাত্রীর অনুপাত এবং ছাত্রীদের শতকরা হার নির্ণয় করো।','নতুন ছাত্র-ছাত্রীর অনুপাত ও মোট শিক্ষার্থীর সংখ্যা নির্ণয় করো।'],[f'{bn(boys)} + {bn(girls)} = {bn(total)} জন।',f'ছাত্র:ছাত্রী = {ratio(F(boys,girls))}; ছাত্রী {fmt(F(girls*100,total))}%।',f'নতুন ছাত্রী {bn(girls+extra)}; মোট {bn(total+extra)}। ছাত্র:ছাত্রী = {ratio(new)}।'],[39,45,51],new*(girls+extra)==boys)
 price=1200+400*i;p=15+5*i;discount=F(price*p,100);paid=price-discount;cash=2000+500*i
 cq('দোকানের ছাড়',f'একটি ব্যাগের লিখিত মূল্য {bn(price)} টাকা। দোকানে {bn(p)}% ছাড় দেওয়া হচ্ছে। তনু দোকানিকে {bn(cash)} টাকা দিল।',['ছাড়ের হারকে সাধারণ ভগ্নাংশে লেখো।','ছাড়ের টাকা ও ব্যাগের প্রদেয় দাম নির্ণয় করো।','তনু কত টাকা ফেরত পাবে এবং প্রদেয় দাম লিখিত মূল্যের কত শতাংশ তা নির্ণয় করো।'],[f'{bn(p)}% = {fmt(F(p,100))}।',f'ছাড় {fmt(discount)} টাকা; দাম {fmt(paid)} টাকা।',f'ফেরত {fmt(cash-paid)} টাকা। প্রদেয় হার {bn(100-p)}%।'],[48,51],discount+paid==price and paid*100==price*(100-p) and cash>=paid)
 total=500+100*i;p=70+5*i;got=F(total*p,100);target=F(total*90,100)
 cq('পরীক্ষার ফল',f'রবি {bn(total)} নম্বরের পরীক্ষায় {bn(p)}% নম্বর পেয়েছে। তার লক্ষ্য ছিল ৯০% নম্বর পাওয়া।',['{p}% হারকে ভগ্নাংশে প্রকাশ করো।'.format(p=bn(p)),'রবির প্রাপ্ত নম্বর ও না-পাওয়া নম্বর নির্ণয় করো।','লক্ষ্য পূরণে আরও কত নম্বর দরকার ছিল এবং শতকরা হারের পার্থক্য কত নির্ণয় করো।'],[f'{bn(p)}% = {fmt(F(p,100))}।',f'প্রাপ্ত {fmt(got)}; না-পাওয়া {fmt(total-got)} নম্বর।',f'লক্ষ্য {fmt(target)} নম্বর। ঘাটতি {fmt(target-got)} নম্বর; হারের ব্যবধান {bn(90-p)} শতাংশ-বিন্দু।'],[49,50],got*100==total*p and (target-got)*100==total*(90-p))
 total=600+200*i;bad=30+10*i;good=total-bad;sold=good//2;left=good-sold
 cq('আমের মজুত',f'ব্যবসায়ী {bn(total)}টি আম আনলেন। এর মধ্যে {bn(bad)}টি নষ্ট। ভালো আমের অর্ধেক বিক্রি হলো।',['ভালো আমের সংখ্যা নির্ণয় করো।','নষ্ট ও ভালো আমের শতকরা হার নির্ণয় করো।','কত আম অবিক্রীত ভালো আছে এবং তা মূল মজুতের কত শতাংশ নির্ণয় করো।'],[f'{bn(total)} − {bn(bad)} = {bn(good)}টি।',f'নষ্ট {fmt(F(bad*100,total))}%; ভালো {fmt(F(good*100,total))}%।',f'বিক্রি {bn(sold)}টি; অবিক্রীত ভালো {bn(left)}টি = মূল মজুতের {fmt(F(left*100,total))}%।'],[50,51],good%2==0 and bad+sold+left==total)
 n=6+i;unit=25+5*i;price=n*unit;want=10+i;budget=want*unit+unit*2
 cq('খাতা কেনা',f'{bn(n)}টি খাতার দাম {bn(price)} টাকা। একই দরে {bn(want)}টি খাতা কিনতে মিতু {bn(budget)} টাকা নিয়ে গেল।',['একটি খাতার দাম নির্ণয় করো।','প্রয়োজনীয় খাতার দাম ও অবশিষ্ট টাকা নির্ণয় করো।','অবশিষ্ট টাকায় আরও কয়টি খাতা কিনতে পারবে এবং মোট খাতার সংখ্যা কত হবে?'],[f'{bn(price)} ÷ {bn(n)} = {bn(unit)} টাকা।',f'দাম {bn(want*unit)} টাকা; অবশিষ্ট {bn(unit*2)} টাকা।',f'আরও {bn(unit*2)} ÷ {bn(unit)} = ২টি। মোট {bn(want+2)}টি খাতা।'],52,price==n*unit and budget==(want+2)*unit)
 n=12+6*i;days=20;new=18+9*i;t=F(n*days,new);more=F(n*days,10)-n
 cq('শ্রমিকের কাজ',f'সমান দক্ষতার {bn(n)} জন শ্রমিক দৈনিক একই সময় কাজ করে একটি কাজ {bn(days)} দিনে শেষ করতে পারেন।',['একজনের এক দিনের কাজ সম্পূর্ণ কাজের কত অংশ?',f'শুরু থেকেই {bn(new)} জন কাজ করলে সময় কত লাগবে?','কাজটি ১০ দিনে শেষ করতে শুরু থেকেই অতিরিক্ত কতজন শ্রমিক লাগবে?'],[f'মোট {bn(n*days)} শ্রমিক-দিন; একজনের এক দিনে কাজ ১/{bn(n*days)} অংশ।',f'সময় {bn(n*days)} ÷ {bn(new)} = {fmt(t)} দিন।',f'প্রয়োজন {fmt(F(n*days,10))} জন; অতিরিক্ত {fmt(more)} জন।'],[52,53],t*new==n*days and (n+more)*10==n*days)
 n=40+10*i;days=18;elapsed=3;leave=10+5*i;stock=n*(days-elapsed);new=n-leave;t=F(stock,new)
 cq('ছাত্রাবাসের খাদ্য',f'ছাত্রাবাসে {bn(n)} জনের {bn(days)} দিনের খাবার ছিল। {bn(elapsed)} দিন পর {bn(leave)} জন বাড়ি চলে গেল। প্রত্যেকের দৈনিক খাবারের পরিমাণ অপরিবর্তিত।',['প্রথম মজুত কত জন-দিনের খাবারের সমান?','যাওয়ার সময় কত জন-দিনের খাবার অবশিষ্ট এবং কতজন ছাত্র থাকে?','অবশিষ্ট খাবার আর কতদিন চলবে এবং প্রথম দিন থেকে মোট কতদিন চলবে?'],[f'{bn(n)} × {bn(days)} = {bn(n*days)} জন-দিন।',f'অবশিষ্ট {bn(stock)} জন-দিন; ছাত্র {bn(new)} জন।',f'আর {bn(stock)} ÷ {bn(new)} = {fmt(t)} দিন; মোট {fmt(elapsed+t)} দিন।'],53,stock+n*elapsed==n*days and t*new==stock)
 a=12+3*i;b=18+6*i;rate=F(1,a)+F(1,b);t=1/rate;done=rate*3
 cq('দুইজনের যৌথ কাজ',f'সুমন একা একটি কাজ {bn(a)} দিনে ও রতন একা {bn(b)} দিনে করতে পারে। দুজনের কাজের হার স্থির।',['সুমন এক দিনে কাজটির কত অংশ করে?','দুজন একসঙ্গে কাজ করলে সম্পূর্ণ কাজ শেষ হতে কতদিন লাগবে?','একসঙ্গে ৩ দিন কাজ করার পর কত অংশ বাকি থাকবে এবং তা রতন একা কত দিনে করবে?'],[f'এক দিনে ১/{bn(a)} অংশ।',f'যৌথ হার {fmt(rate)} অংশ/দিন। সময় {fmt(t)} দিন।',f'৩ দিনে {fmt(done)} অংশ। বাকি {fmt(1-done)} অংশ; রতনের সময় {fmt((1-done)*b)} দিন।'],[53,54],0<done<1 and rate*t==1 and F((1-done)*b,b)==1-done)
 w=15+5*i;hours=6;days=12;w2=18+6*i;hours2=5;total=w*hours*days;t=F(total,w2*hours2)
 cq('শ্রমিক ও কর্মঘণ্টা',f'{bn(w)} জন শ্রমিক দৈনিক {bn(hours)} ঘণ্টা করে কাজ করে {bn(days)} দিনে একটি রাস্তা মেরামত করেন। প্রত্যেকের দক্ষতা সমান।',['মূল পরিকল্পনায় দৈনিক মোট শ্রমঘণ্টা কত?',f'সম্পূর্ণ কাজের মোট শ্রমঘণ্টা ও {bn(w2)} জনের দৈনিক {bn(hours2)} ঘণ্টা কাজের সময় নির্ণয় করো।',f'একই কাজ {bn(w2)} জনে ১০ দিনে শেষ করতে দৈনিক কত ঘণ্টা কাজ করতে হবে?'],[f'{bn(w)} × {bn(hours)} = {bn(w*hours)} শ্রমঘণ্টা।',f'মোট {bn(total)} শ্রমঘণ্টা; সময় {fmt(t)} দিন।',f'প্রয়োজনীয় দৈনিক সময় = {bn(total)} ÷ ({bn(w2)} × ১০) = {fmt(F(total,w2*10))} ঘণ্টা।'],[56,57],t*w2*hours2==total)
assert len(items)==160
assert len({q['text'] for q in items})==160
counts={k:sum(q['type']==k for q in items) for k in ['MCQ','CQ','SQ']}
assert counts=={'MCQ':100,'CQ':30,'SQ':30}
batch=dict(category='Class 6',subject='গণিত',topic='২. অনুপাত ও শতকরা',book='নিজস্ব অনুশীলনী; ধারণার সূত্র: ব্যবহারকারীর ২০২৬ গণিত PDF',edition='Draft; অধ্যায়ের ধারণা ও exact arithmetic পরীক্ষিত; শিক্ষক অনুমোদন বাকি',sourceUrl='https://drive.google.com/file/d/1dQ5TSKvQZVwRca_evhBY_hC5gjxcnd5q/view',lang='Bangla',items=items)
report=dict(sourceSha256='ffa30c8b815f49f3326b70ae58c5e17f11c4d8bd6d854eb84153fab8d593f23f',status='DRAFT_SUBJECT_REVIEW_PENDING',counts=counts,MCQ_skillFamilies=len({r['skill'] for r in ledger if r['type']=='MCQ'}),SQ_skillFamilies=15,CQ_skillFamilies=10,printedPagesVisuallyRead=list(range(38,59)),fullChapterConceptReview=True,independentTeacherApproved=False,productionImported=0,arithmeticAssertions='all passed',limitations=['MCQ: ২৫ দক্ষতার চারটি করে সংখ্যাভিত্তিক variant; CQ: ১০ পরিবারের তিনটি করে variant; SQ: ১৫ পরিবারের দুটি করে variant।','পূর্ণ অধ্যায় coverage বা স্বাধীন শিক্ষক অনুমোদন দাবি নয়।','নিজস্ব প্রশ্ন; উল্লেখিত পৃষ্ঠা কেবল ধারণাসূত্র, হুবহু প্রশ্নের উৎস নয়।'],items=ledger)
md='# ষষ্ঠ শ্রেণি গণিত — ২. অনুপাত ও শতকরা\n\n১০০ MCQ + ৩০ CQ সেট + ৩০ SQ, উত্তর ও সমাধানসহ। Draft; শিক্ষক অনুমোদন বাকি। বইয়ের মুদ্রিত ৩৮–৫৮ পৃষ্ঠা ছবিতে পড়ে ধারণাভিত্তি মিলেছে। নিজস্ব প্রশ্ন; হুবহু উদ্ধৃতি নয়। MCQ-তে ২৫ পরিবার × ৪, CQ-তে ১০ পরিবার × ৩, SQ-তে ১৫ পরিবার × ২ সংখ্যাভিত্তিক variant; সবগুলো স্বতন্ত্র দক্ষতা নয়।\n\n'
for kind in ['MCQ','CQ','SQ']:
 md+='## '+kind+'\n\n'
 for i,q in enumerate([q for q in items if q['type']==kind],1):
  md+=f'### {kind} {bn(i)}\n\n{q["text"]}\n\n'
  if kind=='MCQ':md+='\n'.join(f'- {k}. {v}' for k,v in q['options'].items())+f'\n\n**উত্তর: {q["correct"]}** — {q["explanation"]}\n\n'
  elif kind=='SQ':md+='**উত্তর:** '+q['explanation']+'\n\n'
  else:
   for p in q['parts']:md+=f'**{p["label"]})** {p["question"]} [{bn(p["marks"])}]\n\n'
   md+='**সমাধান**\n\n'
   for p in q['parts']:md+=f'**{p["label"]})** {p["solution"]}\n\n'
  md+=q['page']+'।\n\n'
OUT.mkdir(parents=True,exist_ok=True)
files={'questions.json':json.dumps(batch,ensure_ascii=False,indent=2)+'\n','validation.json':json.dumps(report,ensure_ascii=False,indent=2)+'\n','review.md':md}
for name,value in files.items():
 path=OUT/name
 if '--check' in sys.argv:assert path.read_text()==value,name
 else:path.write_text(value)
print(json.dumps({'counts':counts,'bytes':len(files['questions.json'].encode()),'arithmeticAssertions':'passed','productionImported':0}))
