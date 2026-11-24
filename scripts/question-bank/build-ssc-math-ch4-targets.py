"""SSC general math ch4: 150 MCQ / 50 CQ / 70 SQ, draft only.
Five visually read board-compilation MCQ first, then explicitly original practice.
No database/network/approval/deployment. Sympy==1.14.0 is dev-only.
Run with PYTHONPATH=.cache/math-validation ... [--check].
"""
import hashlib
import json
import sys
from collections import Counter
from itertools import combinations
from pathlib import Path
import sympy as S

ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'content/question-bank/ssc/math/chapter-4'
SOURCE='3.-Math-Link-Board-142-311_Compressed-1.pdf'
SOURCE_URL='https://drive.google.com/file/d/1dbnQgd9Su9CBeId1RV-hShNh8IG_YOJ5/view'
R=S.Rational

def lg(a,b=10):return S.expand_log(S.log(S.sympify(a))/S.log(S.sympify(b)),force=True)
def clean(v):return S.simplify(S.expand_log(S.sympify(v),force=True))
def eq(a,b):assert clean(a-b)==0,(a,b)
def L(v):return '$'+S.latex(S.sympify(v))+'$'
def tex(v):return S.latex(S.sympify(v))
def characteristic(v):
 v=R(v);k=0
 assert v>0
 while v>=10:v/=10;k+=1
 while v<1:v*=10;k-=1
 return k
rows=[];audit=[]

def board(pdf,number,board,text,options,key,why,answer,expressions):
 q=dict(type='MCQ',text=text,options=dict(zip('ABCD',options)),correct=key,explanation=why,
  page=f'সংকলন: মুদ্রিত {pdf+141}; PDF {pdf}; প্রশ্ন {number}',difficulty='MEDIUM',
  provenance=[dict(kind='board',board=board,examYear=2024,sourceFile=SOURCE,pdfPage=pdf,printedPage=str(pdf+141),questionNumber=str(number))])
 rows.append(q);audit.append(dict(origin='TRANSCRIBED_BOARD_COMPILATION',family='board-seed',variant=len(rows),visualRead=True,
  source=q['provenance'],answerExpression=str(answer),choiceExpressions=[str(v) for v in expressions],correct=key,
  adaptation='শর্ত ও বিকল্পের ক্রম অক্ষত রেখে Unicode/LaTeX-এ প্রতিলিপি; সমাধান নতুনভাবে লেখা।'))

board(1,4,'dhaka',r'$144$ এর $2\sqrt3$ ভিত্তিক log কত?',
 [r'$\sqrt3$','$2$',r'$2\sqrt3$','$4$'],'D',
 r'$(2\sqrt3)^2=12$ এবং $(2\sqrt3)^4=144$। ভিত্তি ধনাত্মক ও ১ নয়; তাই $\log_{2\sqrt3}144=4$।',4,[S.sqrt(3),2,2*S.sqrt(3),4])
board(20,22,'cumilla',r'$0.0305$ এর সাধারণ লগের পূর্ণক কত?',
 ['$3$','$1$',r'$\overline2$',r'$\overline3$'],'C',
 r'$0.0305=3.05\times10^{-2}$। যেহেতু $1<3.05<10$, সাধারণ লগ $=-2+\log_{10}3.05$ এবং অংশক ০ ও ১-এর মধ্যে। তাই পূর্ণক $-2$, প্রচলিত চিহ্নে $\overline2$।',-2,[3,1,-2,-3])
board(20,23,'cumilla',r'$\log625-2\log5=$ কত? (log সাধারণ লগ।)',
 [r'$\log600$',r'$\log125$',r'$\log25$',r'$\log5$'],'C',
 r'সব argument ধনাত্মক। $\log625-2\log5=\log(625/5^2)=\log25$। বিয়োগকে $\log(625-25)$ করা যাবে না।',lg(25),[lg(600),lg(125),lg(25),lg(5)])
board(29,6,'jashore',r'যদি $\log_x16=2$ তবে x এর মান কত?',
 ['$2$',r'$\pm4$','$4$','$16$'],'C',
 r'লগের শর্ত $x>0$, $x\ne1$। সংজ্ঞায় $x^2=16$, তাই সম্ভাব্য বীজগাণিতিক মান $\pm4$ হলেও ঋণাত্মক ভিত্তি বাদ যাবে। বৈধ মান $x=4$।',4,[2,-4,4,16])
# Source choice B is ±4, a solution-set claim, not the scalar -4.
# Preserve its semantics rather than treating it as a numeric distractor.
audit[-1].pop('answerExpression');audit[-1].pop('choiceExpressions')
audit[-1].update(choiceSolutionSets={'A':[2],'B':[-4,4],'C':[4],'D':[16]},expectedAllowedBases=[4])
board(67,5,'dinajpur',r'$0.00000538$ এর সাধারণ লগের পূর্ণক কত?',
 [r'$\overline6$',r'$\overline5$','$5$','$6$'],'A',
 r'$0.00000538=5.38\times10^{-6}$ এবং $1<5.38<10$। তাই $\log_{10}(0.00000538)=-6+\log_{10}5.38$; পূর্ণক $-6$ বা $\overline6$।',-6,[-6,-5,5,6])

seed_count=len(rows)

def put(kind,family,n,text,explanation,**extra):
 q=dict(type=kind,text=text,explanation=explanation,
  page=f'নিজস্ব অনুশীলনী; Ch4/{kind}/{family}/{n}; বোর্ড/বইয়ের অবিকল প্রশ্ন নয়',
  difficulty='HARD' if kind=='CQ' else 'MEDIUM',**extra)
 assert len(q['page'])<=100
 rows.append(q);audit.append(dict(origin='ORIGINAL_PARAMETERISED_PRACTICE_NOT_BOARD_OR_TEXTBOOK',family=family,variant=n))

def mcq(f,n,text,value,why,wrong=None):
 value=clean(value);candidates=[value]+(list(wrong) if wrong is not None else [value+1,value-1,value+2,value+3]);choices=[]
 for v in candidates:
  v=clean(v)
  if not any(clean(v-u)==0 for u in choices):choices.append(v)
  if len(choices)==4:break
 assert len(choices)==4,(f,n,choices)
 shift=(len(f)+n)%4;choices=choices[shift:]+choices[:shift]
 key='ABCD'[next(i for i,v in enumerate(choices) if clean(v-value)==0)]
 put('MCQ',f,n,text,why+' সঠিক উত্তর '+L(value)+'।',options={k:L(v) for k,v in zip('ABCD',choices)},correct=key)
 audit[-1].update(answerExpression=str(value),choiceExpressions=[str(v) for v in choices],correct=key)

def cq(f,n,text,parts,checks,domains):
 assert len(parts)==3 and checks and domains
 for a,b in checks:eq(a,b)
 put('CQ',f,n,text,'ধাপে ধাপে সমাধানে সূচক/লগের সূত্র এবং মূল রাশির সংজ্ঞার শর্ত বজায় রাখা হয়েছে।',
  parts=[dict(label=l,marks=m,question=q,solution=sol) for l,m,(q,sol) in zip(['ক','খ','গ'],[2,4,4],parts)])
 audit[-1].update(exactChecks=[dict(lhs=str(a),rhs=str(b)) for a,b in checks],domainNotes=domains)

def sq(f,n,text,solution,left,right,domain):
 eq(left,right);put('SQ',f,n,text,solution)
 audit[-1].update(exactChecks=[dict(lhs=str(left),rhs=str(right))],domainNotes=[domain])

# Twenty-nine skills x five variants = 145 original MCQ; plus five source MCQ.
for family in range(29):
 for n in range(1,6):
  b=n+2
  if family==0:mcq('power-product',n,rf'${b}^{{{n+1}}}\times{b}^2$ এর মান কত?',b**(n+3),rf'একই ভিত্তির ঘাতের গুণে সূচক যোগ হয়: ${b}^{{{n+1}+2}}={b}^{{{n+3}}}$।')
  elif family==1:mcq('power-quotient',n,rf'$\frac{{{b}^{{{n+3}}}}}{{{b}^{{{n+1}}}}}$ এর মান কত?',b*b,rf'অশূন্য একই ভিত্তির ভাগে সূচক বিয়োগ: ${b}^{{({n+3})-({n+1})}}={b}^2$।')
  elif family==2:mcq('power-of-power',n,rf'$({b}^{{{n+1}}})^2$ এর মান কত?',b**(2*n+2),rf'ঘাতের ঘাতে সূচক গুণ হয়: ${b}^{{2({n+1})}}$।')
  elif family==3:mcq('zero-index',n,rf'$({n+4}-{n+1})^0$ এর মান কত?',1,rf'ভিত্তি ${n+4}-{n+1}=3\ne0$। যে কোনো অশূন্য সংখ্যার শূন্য ঘাত ১; এখানে $0^0$ নেই।')
  elif family==4:mcq('negative-index',n,rf'${b}^{{-{n+1}}}$ এর মান কত?',R(1,b**(n+1)),rf'ধনাত্মক ভিত্তির জন্য $a^{{-m}}=1/a^m$। তাই মান $1/{b}^{{{n+1}}}$।')
  elif family==5:mcq('fractional-index',n,rf'$({b}^3)^{{\frac23}}$ এর মান কত?',b*b,rf'${b}>0$। সূচক গুণে $({b}^3)^{{2/3}}={b}^2$।')
  elif family==6:mcq('negative-fraction',n,rf'$({b}^4)^{{-\frac12}}$ এর মান কত?',R(1,b*b),rf'${b}>0$। প্রথমে বর্গমূল ${b}^2$, তারপর বিপরীত নিলে $1/{b}^2$।')
  elif family==7:mcq('fraction-base',n,rf'$\left(\frac{{{n+1}}}{{{n+2}}}\right)^{{-2}}$ এর মান কত?',R((n+2)**2,(n+1)**2),rf'ভগ্নাংশ উল্টে ধনাত্মক বর্গ নিই: $(({n+2})/({n+1}))^2$।')
  elif family==8:mcq('unknown-index',n,rf'${b}^x\times{b}^2={b}^{{{n+5}}}$ হলে x কত?',n+3,rf'ভিত্তি ${b}>1$। একই ভিত্তিতে সূচক সমান: $x+2={n+5}$, তাই $x={n+3}$।')
  elif family==9:mcq('linear-exponent',n,rf'${b}^{{2x+1}}={b}^{{{n+4}}}$ হলে x কত?',R(n+3,2),rf'${b}>1$ বলে সূচক সমান: $2x+1={n+4}$। তাই $x=({n+3})/2$।')
  elif family==10:mcq('subunit-log',n,rf'$\log_{{1/{b}}}({b}^{{{n}}})$ এর মান কত?',-n,rf'$1/{b}$ ধনাত্মক ও ১ নয়। $(1/{b})^{{-{n}}}={b}^{{{n}}}$, তাই লগ ${-n}$।')
  elif family==11:mcq('log-definition',n,rf'$\log_{{{b}}}({b}^{{{n+1}}})$ এর মান কত?',n+1,rf'বৈধ ভিত্তি ${b}$-এর জন্য $\log_a(a^t)=t$।')
  elif family==12:mcq('log-reciprocal',n,rf'$\log_{{{b}}}\left(\frac1{{{b}^{{{n+1}}}}}\right)$ এর মান কত?',-n-1,rf'argument ${b}^{{-{n+1}}}>0$। তাই লগের মান সূচক $-{n+1}$।')
  elif family==13:mcq('log-root',n,rf'$\log_{{{b}}}\sqrt{{{b}}}$ এর মান কত?',R(1,2),rf'$\sqrt{{{b}}}={b}^{{1/2}}$। সংজ্ঞায় লগ $1/2$।')
  elif family==14:mcq('log-product',n,rf'$\log_{{{b}}}({b}^{{{n+1}}}\times{b}^2)$ এর মান কত?',n+3,rf'ধনাত্মক argument-এর গুণকে লগে যোগ করা যায়। মান $({n+1})+2={n+3}$।')
  elif family==15:mcq('log-quotient',n,rf'$\log_{{{b}}}\left(\frac{{{b}^{{{n+3}}}}}{{{b}^2}}\right)$ এর মান কত?',n+1,rf'ভাগফলের লগে বিয়োগ হয়: $({n+3})-2={n+1}$।')
  elif family==16:mcq('log-power',n,rf'$\log_{{{b}}}(({b}^{{{n}}})^3)$ এর মান কত?',3*n,rf'ধনাত্মক argument-এর ঘাত সামনে আসে: $3\log_{{{b}}}({b}^{{{n}}})=3({n})$।')
  elif family==17:mcq('change-base',n,rf'$\log_{{{b*b}}}({b**3})$ এর মান কত?',R(3,2),rf'ভিত্তি ${b}$-এ পরিবর্তনে $\frac{{\log_{{{b}}}{b**3}}}{{\log_{{{b}}}{b*b}}}=3/2$।')
  elif family==18:mcq('reciprocal-logs',n,rf'$\log_{{{b}}}{b+1}\times\log_{{{b+1}}}{b}$ এর মান কত?',1,rf'দুই ভিত্তিই ১-এর বড়। ভিত্তি পরিবর্তনে $\frac{{\ln({b+1})}}{{\ln({b})}}\frac{{\ln({b})}}{{\ln({b+1})}}=1$।')
  elif family==19:mcq('cyclic-logs',n,rf'$\log_2{b}\times\log_{{{b}}}{b+1}\times\log_{{{b+1}}}2$ এর মান কত?',1,'ভিত্তি পরিবর্তন করলে পরপর লব-হরের অশূন্য লগগুলো বাতিল হয়। সব ভিত্তি ধনাত্মক ও ১ নয়, ফলে গুণফল ১।')
  elif family==20:mcq('unknown-base',n,rf'$\log_x{b*b}=2$ হলে বৈধ বাস্তব ভিত্তি x কত?',b,rf'$x>0$, $x\ne1$। সংজ্ঞায় $x^2={b*b}$; ঋণাত্মক মূল বাদ দিলে $x={b}$।')
  elif family==21:mcq('unknown-argument',n,rf'$\log_{{{b}}}x={n+1}$ হলে x কত?',b**(n+1),rf'লগের সংজ্ঞায় $x={b}^{{{n+1}}}>0$।')
  elif family==22:mcq('given-logs',n,rf'$u,v>0$, $\log_2u={n+1}$ ও $\log_2v={n+2}$ হলে $\log_2(u^2/v)$ কত?',n,rf'মান $2\log_2u-\log_2v=2({n+1})-({n+2})={n}$।')
  elif family==23:
   val=3*10**(n+1)
   mcq('characteristic-large',n,rf'${val}$-এর সাধারণ লগের পূর্ণক কত?',n+1,rf'${val}=3\times10^{{{n+1}}}$ এবং $0<\log_{{10}}3<1$। তাই পূর্ণক ${n+1}$।')
  elif family==24:
   val=R(4,10**(n+2))
   mcq('characteristic-small',n,rf'${L(val)[1:-1]}$-এর সাধারণ লগের পূর্ণক কত?',-n-2,rf'সংখ্যাটি $4\times10^{{-{n+2}}}$। লগ $=-{n+2}+\log_{{10}}4$; অংশক ধনাত্মক হওয়ায় পূর্ণক $-{n+2}$, $-{n+1}$ নয়।')
  elif family==25:mcq('decimal-scale',n,rf'$\log_{{10}}({b}\times10^{{{n}}})-\log_{{10}}{b}$ এর মান কত?',n,rf'প্রথম লগ $=\log_{{10}}{b}+{n}$। বিয়োগে অপরিবর্তিত অংশক বাদ যায়; অবশিষ্ট ${n}$।')
  elif family==26:mcq('sum-not-product',n,rf'$\log_{{{b}}}({b}+{b})$ এর সঠিক মান কোনটি?',lg(2*b,b),rf'যোগের জন্য লগকে সরাসরি আলাদা করা যায় না। argument ${2*b}$, তাই মান $\log_{{{b}}}{2*b}=1+\log_{{{b}}}2$; এটি ২ নয়।',[2,0,1])
  elif family==27:mcq('finite-domain',n,rf'$A=\{{{n-1},{n},{n+1},{n+2},{n+3}\}}$। $\log_2(x-{n})$-এর জন্য A-এর কয়টি উপাদান বৈধ?',3,rf'argument $x-{n}>0$, অর্থাৎ $x>{n}$। বৈধ উপাদান ${n+1},{n+2},{n+3}$—মোট ৩টি।')
  else:mcq('nested-log',n,rf'$\log_{{{n+1}}}\left(\log_{{{b}}}({b}^{{{n+1}}})\right)$ এর মান কত?',1,rf'ভেতরের লগ ${n+1}>0$। বাইরের ভিত্তিও ${n+1}>1$; তাই $\log_{{{n+1}}}({n+1})=1$।')

for n in range(1,6):
 b=n+2;A=b**(n+2);B=b**(n+1)
 cq('same-base-powers',n,rf'$A={b}^{{{n+2}}}$ এবং $B={b}^{{{n+1}}}$।',[
  ('A/B নির্ণয় কর।',rf'একই ভিত্তির সূচক বিয়োগে $A/B={b}^{{({n+2})-({n+1})}}={b}$।'),
  (rf'$A^{{1/({n+2})}}$ ও $A/B^2$ নির্ণয় কর।',rf'$A>0$ বলে $A^{{1/({n+2})}}={b}$। আর $A/B^2={b}^{{{n+2}-2({n+1})}}={b}^{{-{n}}}=1/{b**n}$।'),
  (rf'$A^xB^{{1-x}}={b}^{{{2*n+3}}}$ হলে বাস্তব x নির্ণয় ও যাচাই কর।',rf'বামপক্ষের ভিত্তি ${b}$ এবং সূচক $({n+2})x+({n+1})(1-x)=x+{n+1}$। ${b}>1$ বলে $x+{n+1}={2*n+3}$, অর্থাৎ $x={n+2}$। বসালে সূচক ${2*n+3}$ মেলে।')],[(R(A,B),b),(R(A,B*B),R(1,b**n)),(A**(n+2)*R(B)**(1-(n+2)),b**(2*n+3))],['A>0, B>0; fixed base b>1; x real'])
 a=n+1;A=a**6;B=a**4
 cq('rational-exponents',n,rf'$A={a**6}$ ও $B={a**4}$; সব ঘাত বাস্তব প্রধান মূল অনুযায়ী।',[
  (r'$A^{1/3}$ ও $B^{1/2}$ নির্ণয় কর।',rf'$A={a}^6$, $B={a}^4$। তাই $A^{{1/3}}={a*a}$ এবং $B^{{1/2}}={a*a}$।'),
  (r'$A^{-1/2}B^{3/4}$ সূচকের সূত্রে সরল কর।',rf'$A^{{-1/2}}={a}^{{-3}}$ এবং $B^{{3/4}}={a}^3$। তাই গুণফল ${a}^0=1$।'),
  (r'$\frac{A^{1/2}+B^{1/2}}{A^{1/6}+B^{1/4}}$ নির্ণয় করে হর অশূন্য কি না দেখাও।',rf'লব ${a**3}+{a*a}$ এবং হর ${a}+{a}={2*a}>0$। তাই ভাগফল $({a**3}+{a*a})/({2*a})={tex(R(a*(a+1),2))}$। ধনাত্মক A,B থাকায় ব্যবহৃত সব ভগ্নাংশ সূচক বৈধ।')],[(S.Integer(A)**R(1,3),a*a),(S.Integer(A)**R(-1,2)*S.Integer(B)**R(3,4),1),((S.sqrt(A)+S.sqrt(B))/(S.Integer(A)**R(1,6)+S.Integer(B)**R(1,4)),R(a*(a+1),2))],['A>0 and B>0; principal positive roots; denominator 2a>0'])
 a=2**(n+1)
 cq('quadratic-in-power',n,rf'$2^{{2x}}-{a+1}\cdot2^x+{a}=0$, যেখানে x বাস্তব।',[
  (r'$y=2^x$ বসিয়ে y-এর সমীকরণ লেখ এবং y-এর শর্ত দাও।',rf'$2^{{2x}}=(2^x)^2=y^2$। সমীকরণ $y^2-{a+1}y+{a}=0$ এবং অবশ্যই $y>0$।'),
  ('সমীকরণটি সমাধান করে x-এর সব বাস্তব মান নির্ণয় কর।',rf'উৎপাদক $(y-1)(y-{a})=0$। তাই $y=1$ বা ${a}$—উভয়ই ধনাত্মক। $2^x=1$ থেকে $x=0$; $2^x=2^{{{n+1}}}$ থেকে $x={n+1}$।'),
  (r'সমাধানদ্বয়ে $2^x+2^{-x}$-এর মান তুলনা করে কোনটি বড় দেখাও।',rf'$x=0$-এ মান ২। $x={n+1}$-এ মান ${a}+1/{a}={tex(R(a)+R(1,a))}$। পার্থক্য ${tex(R((a-1)**2,a))}=( {a}-1)^2/{a}>0$। তাই দ্বিতীয় সমাধানে মান বড়।')],[(S.Integer(2)**(2*(n+1))-(a+1)*2**(n+1)+a,0),(1-(a+1)+a,0),(R(a)+R(1,a)-2,R((a-1)**2,a))],['x real; y=2^x>0; do not retain y<=0'])
 b=n+2
 cq('log-definition-domain',n,rf'$b={b}$, $A=b^3$, $B=b^2$।',[
  (r'$\log_bA$-এর মান সংজ্ঞা দিয়ে নির্ণয় কর।',rf'${b}^3=A$ এবং $b>1$। তাই $\log_bA=3$।'),
  (r'$\frac{\log_b(AB)}{\log_b(A/B)}$ নির্ণয় কর।',r'সকল argument ধনাত্মক। লবে $\log_bA+\log_bB=3+2=5$ এবং হরে $\log_bA-\log_bB=3-2=1\ne0$। তাই ভাগফল ৫।'),
  (r'$\log_b(x-b)+\log_b(x+b)=2$ সমাধান কর; অবৈধ মূল বাদ দাও।',rf'দুই argument ধনাত্মক হতে $x>b$। গুণের সূত্রে $\log_b(x^2-b^2)=2$, তাই $x^2-b^2=b^2$ এবং $x=\pm b\sqrt2$। $x>b$ শর্তে কেবল $x={b}\sqrt2$ বৈধ; ঋণাত্মক মূল বাদ যায়।')],[(lg(b**3,b),3),(lg(b**5,b)/lg(b,b),5),((b*S.sqrt(2))**2-b*b,b*b)],['b>1; arguments x-b>0,x+b>0 imply x>b; reject -b*sqrt(2)'])
 # Log sum/product error checking with fixed strictly positive arguments.
 u=b**(n+1);v=b*b
 cq('product-quotient-laws',n,rf'$b={b}$, $u=b^{{{n+1}}}$ এবং $v=b^2$।',[
  (r'$\log_b(uv)$ নির্ণয় কর।',rf'গুণের সূত্রে $\log_b(uv)=({n+1})+2={n+3}$।'),
  (r'$\log_b(u^2/v^3)$ নির্ণয় করে ঋণাত্মক মান হলে তার অর্থ ব্যাখ্যা কর।',rf'মান $2\log_bu-3\log_bv=2({n+1})-6={2*n-4}$। ভিত্তি $b>1$ হওয়ায় ঋণাত্মক লগ হলে argument ০ ও ১-এর মধ্যে; argument ঋণাত্মক হয় না।'),
  (r'$\log_b(u+v)=\log_bu+\log_bv$ দাবি সত্য কি না বিচার কর।',rf'ডানপক্ষ $\log_b(uv)$। এখানে $u={u}\ge9$, $v={v}\ge9$। $uv-u-v=(u-1)(v-1)-1>0$, তাই $uv>u+v$। $b>1$ বলে লগ বর্ধনশীল; ফলে $\log_b(uv)>\log_b(u+v)$। দাবি ভুল।')],[(lg(u*v,b),n+3),(lg(R(u*u,v**3),b),2*n-4)],['b>1,u>0,v>0; no logarithm sum-splitting rule'])
 a=n+2;b=a*a;c=a**3
 cq('base-change',n,rf'$a={a}$, $b={b}$, $c={c}$।',[
  (r'$\log_ab$ ও $\log_ac$ নির্ণয় কর।',r'$b=a^2$ ও $c=a^3$ বলে মান যথাক্রমে ২ ও ৩।'),
  (r'$\log_bc$ এবং $(\log_ab)(\log_bc)(\log_ca)$ নির্ণয় কর।',r'ভিত্তি পরিবর্তনে $\log_bc=3/2$ এবং $\log_ca=1/3$। তাই গুণফল $2\times(3/2)\times(1/3)=1$।'),
  (rf'$\log_x({a**4})=2$ হলে সব বৈধ বাস্তব ভিত্তি x নির্ণয় কর।',rf'ভিত্তির শর্ত $x>0$, $x\ne1$। সংজ্ঞায় $x^2={a**4}$। বীজগাণিতিক মূল $\pm{a*a}$; ধনাত্মকটি $x={a*a}$ গ্রহণযোগ্য এবং ঋণাত্মকটি লগের ভিত্তি নয়।')],[(lg(c,b),R(3,2)),(lg(b,a)*lg(c,b)*lg(a,c),1),(S.Integer(a*a)**2,a**4)],['a,b,c>1; unknown base x>0 and x!=1'])
 a=n+2;k=n+1;h=n+2;m=lg(a)
 A=a*10**k;B=R(a,10**h)
 cq('common-log-scaling',n,rf'$A={A}$, $B={tex(B)}$ এবং $m=\log_{{10}}{a}$।',[
  ('A ও B-কে বৈজ্ঞানিক রূপে লিখে সাধারণ লগের পূর্ণক নির্ণয় কর।',rf'$A={a}\times10^{{{k}}}$, $B={a}\times10^{{-{h}}}$। ${a}$ সংখ্যা ১ ও ১০-এর মধ্যে; পূর্ণক যথাক্রমে ${k}$ ও $-{h}$।'),
  ('দুটি সাধারণ লগকে পূর্ণক ও অংশক দিয়ে প্রকাশ কর।',rf'$\log_{{10}}A={k}+m$, $\log_{{10}}B=-{h}+m$; $0<m<1$। অংশক দুই ক্ষেত্রেই m, শুধু পূর্ণক বদলেছে। $-{h}+m$-কে $-({h}+m)$ লেখা ভুল।'),
  (r'$\log_{10}(A/B)$ নির্ণয় করে সরাসরি A/B-এর মানের সঙ্গে মিলাও।',rf'লগের বিয়োগে $({k}+m)-(-{h}+m)={k+h}$। সরাসরি $A/B=10^{{{k+h}}}={10**(k+h)}$; এর সাধারণ লগও ${k+h}$।')],[(lg(A),k+m),(lg(B),-h+m),(R(A)/B,10**(k+h))],['A>0,B>0; 1<a<10 implies 0<m<1; characteristic is floor(log)'])
 k=n+1;m=lg(2);N=R(2,10**k)
 # Parentheses matter for negative characteristic. For odd k: -(k+1)/2.
 ch=-(k+1)//2 if k%2 else -(k//2)
 mant=(m+1)/2 if k%2 else m/2
 cq('bar-characteristic',n,rf'$N=2\times10^{{-{k}}}$ এবং $m=\log_{{10}}2$। এখানে $0<m<1$।',[
  ('N-এর সাধারণ লগের পূর্ণক ও অংশক লেখ।',rf'$\log_{{10}}N=-{k}+m$। তাই পূর্ণক $-{k}$, অংশক m। বার শুধু পূর্ণকের উপরে থাকে; পুরো লগের ঋণাত্মক চিহ্ন নয়।'),
  (rf'কেউ $\log_{{10}}N=-({k}+m)$ লিখলে ভুলটি দেখাও এবং সঠিক মান থেকে তার মান কত কম বের কর।',rf'সঠিক মান $-{k}+m$, ভুল মান $-{k}-m$। পার্থক্য $(-{k}+m)-(-{k}-m)=2m>0$। সে ধনাত্মক অংশককেও ঋণাত্মক করেছে।'),
  (r'$\log_{10}\sqrt N$-এর পূর্ণক ও অংশক নির্ণয় কর।',rf'$\log_{{10}}\sqrt N=(-{k}+m)/2$। '+(rf'{k} বিজোড় বলে এটি $-{(k+1)//2}+(1+m)/2$; $0<(1+m)/2<1$।' if k%2 else rf'{k} জোড় বলে এটি $-{k//2}+m/2$; $0<m/2<1$।')+rf' অতএব পূর্ণক ${ch}$ ও অংশক ${tex(mant)}$।')],[(lg(N),-k+m),(lg(S.sqrt(N)),ch+mant)],['N>0; 0<m<1; mantissa must be in [0,1); bar applies only to characteristic'])
 a=n+1;b=n+2
 cq('log-equation-roots',n,rf'$\log_{{{b}}}x+\log_{{{b}}}(x-{a})=\log_{{{b}}}({2*a*a})$।',[
  ('লগ সংজ্ঞায়িত হওয়ার জন্য x-এর শর্ত নির্ণয় কর।',rf'$x>0$ ও $x-{a}>0$ একসঙ্গে লাগবে। তাই $x>{a}$। ভিত্তি ${b}>1$ বৈধ।'),
  ('লগের সূত্র ব্যবহার করে সমীকরণ সমাধান কর।',rf'$x(x-{a})={2*a*a}$, অর্থাৎ $x^2-{a}x-{2*a*a}=0$। উৎপাদক $(x-{2*a})(x+{a})=0$; বীজগাণিতিক মূল $x={2*a},-{a}$।'),
  (rf'সব বৈধ মূল বেছে মূল সমীকরণ যাচাই করে $\log_{{{2*a}}}x$ নির্ণয় কর।',rf'$x>{a}$ বলে শুধু $x={2*a}$ বৈধ; $x=-{a}$-এ argument ঋণাত্মক। বৈধ মূল বসিয়ে গুণ $({2*a})({a})={2*a*a}$ মেলে। তাই চাওয়া লগ $\log_{{{2*a}}}({2*a})=1$।')],[(2*a*(2*a-a),2*a*a),(lg(2*a,2*a),1)],['x>a>0; reject negative algebraic root -a before logging'])
 a=n+2;p=n+1
 cq('root-and-subunit-base',n,rf'$a={a}$ এবং $p={p}$।',[
  (r'$\log_{\sqrt a}(a^p)$ নির্ণয় কর।',rf'ভিত্তি $\sqrt a=a^{{1/2}}>1$। ভিত্তি a-তে পরিবর্তনে মান $p/(1/2)=2p={2*p}$।'),
  (r'$\log_{a^2}(a^{-3})$ নির্ণয় কর; ঋণাত্মক মান হলেও argument কেন বৈধ ব্যাখ্যা কর।',r'ভিত্তি পরিবর্তনে $(-3)/2=-3/2$। এখানে $a^{-3}>0$ ও $a^{-3}<1$; ঋণাত্মক লগ মান মানেই ঋণাত্মক argument নয়।'),
  (rf'$(1/a)^x=a^{{{p}}}$ হলে x নির্ণয় করে মূল সমীকরণে যাচাই কর।',rf'বামপক্ষ $a^{{-x}}$। $a>1$ বলে $-x={p}$, তাই $x=-{p}$। বসালে $(1/a)^{{-{p}}}=a^{{{p}}}$; মূল ভিত্তি $1/a$-ও ধনাত্মক ও ১ নয়।')],[(lg(a**p,S.sqrt(a)),2*p),(lg(R(1,a**3),a*a),R(-3,2)),(R(1,a)**(-p),a**p)],['a>1; sqrt(a)>1; 0<1/a<1; all logarithm arguments positive'])

# Fourteen SQ skills, five parameter variants = seventy complete answers.
for n in range(1,6):
 b=n+2
 sq('power-product',n,rf'${b}^{{{n}}}\times{b}^3$ সূচকের সূত্রে সরল কর।',rf'ভিত্তি একই বলে সূচক যোগ: ${b}^{{{n}+3}}={b}^{{{n+3}}}={b**(n+3)}$।',b**n*b**3,b**(n+3),'b>0')
 sq('power-division',n,rf'$\frac{{{b}^{{{n+4}}}}}{{{b}^{{{n+1}}}}}$ সরল কর।',rf'অশূন্য একই ভিত্তির সূচক বিয়োগে ${b}^3={b**3}$।',R(b**(n+4),b**(n+1)),b**3,'nonzero denominator')
 sq('power-of-power',n,rf'$({b}^2)^{{{n+1}}}$ সরল কর।',rf'ঘাতের ঘাতে সূচক গুণ হয়। তাই ${b}^{{2({n+1})}}={b**(2*n+2)}$।',(b*b)**(n+1),b**(2*n+2),'positive base')
 sq('negative-index',n,rf'${b}^{{-{n}}}$-কে ধনাত্মক সূচকে প্রকাশ কর।',rf'নিয়ম $a^{{-m}}=1/a^m$, $a\ne0$। তাই মান $1/{b}^{{{n}}}={tex(R(1,b**n))}$।',R(b)**(-n),R(1,b**n),'base b!=0')
 sq('fraction-index',n,rf'$({b}^6)^{{1/3}}$ নির্ণয় কর।',rf'ভিত্তি ধনাত্মক। সূচক গুণে ${b}^{{6/3}}={b}^2={b*b}$।',S.Integer(b**6)**R(1,3),b*b,'principal real root of positive number')
 sq('solve-exponent',n,rf'${b}^{{x+2}}={b}^{{{n+5}}}$ হলে x নির্ণয় কর।',rf'ভিত্তি ${b}>1$ বলে $x+2={n+5}$। অতএব $x={n+3}$।',b**((n+3)+2),b**(n+5),'base b>1, real exponent')
 sq('log-definition',n,rf'$\log_{{{b}}}({b**3})$ সংজ্ঞা দিয়ে নির্ণয় কর।',rf'${b}^3={b**3}$। ভিত্তি ${b}>0$ ও ${b}\ne1$; তাই লগ ৩।',lg(b**3,b),3,'base b>0,b!=1; argument>0')
 sq('log-product',n,rf'$\log_{{{b}}}{b*b}+\log_{{{b}}}{b**(n+1)}$ সরল কর।',rf'দুটি মান ২ ও ${n+1}$। তাই যোগফল ${n+3}$; সমতুল্যভাবে গুণফলের লগ নেওয়া যায়।',lg(b*b,b)+lg(b**(n+1),b),n+3,'both log arguments positive')
 sq('log-quotient',n,rf'$\log_{{{b}}}{b**(n+2)}-\log_{{{b}}}{b*b}$ সরল কর।',rf'বিয়োগে ভাগফলের লগ: মান $({n+2})-2={n}$।',lg(b**(n+2),b)-lg(b*b,b),n,'positive arguments; valid base')
 sq('change-base',n,rf'$\log_{{{b*b}}}{b**3}$-কে {b} ভিত্তিতে নিয়ে মান নির্ণয় কর।',rf'ভিত্তি পরিবর্তনে $\log_{{{b}}}{b**3}/\log_{{{b}}}{b*b}=3/2$। হরের লগ ২ অশূন্য।',lg(b**3,b*b),R(3,2),'both bases>1; change-base denominator nonzero')
 sq('unknown-base',n,rf'$\log_x({b**3})=3$ হলে বৈধ বাস্তব ভিত্তি x নির্ণয় কর।',rf'সংজ্ঞায় $x^3={b**3}$, তাই $x={b}$। এটি ধনাত্মক ও ১ নয়; ভিত্তির শর্ত পূরণ করে।',lg(b**3,b),3,'unknown base x>0,x!=1')
 val=7*10**n
 sq('characteristic-large',n,rf'${val}$-এর সাধারণ লগের পূর্ণক ও অংশক লেখ।',rf'${val}=7\times10^{{{n}}}$। তাই সাধারণ লগ ${n}+\log_{{10}}7$। পূর্ণক ${n}$, অংশক $\log_{{10}}7\in(0,1)$।',lg(val),n+lg(7),'0<log10(7)<1')
 val=R(6,10**(n+1))
 sq('characteristic-small',n,rf'${tex(val)}$-এর সাধারণ লগের পূর্ণক ও অংশক নির্ণয় কর।',rf'সংখ্যাটি $6\times10^{{-{n+1}}}$। তাই লগ $=-{n+1}+\log_{{10}}6$; পূর্ণক $-{n+1}$ এবং ধনাত্মক অংশক $\log_{{10}}6$।',lg(val),-n-1+lg(6),'0<log10(6)<1; floor negative log, not truncation')
 sq('mantissa-scaling',n,rf'$\log_{{10}}({b}\times10^{{-{n}}})$ ও $\log_{{10}}{b}$-এর অংশক কি সমান? কারণ দাও।',rf'প্রথম লগ $=-{n}+\log_{{10}}{b}$। যেহেতু $1<{b}<10$, $\log_{{10}}{b}$ অংশক। দ্বিতীয়টির পূর্ণক ০ ও একই অংশক; ১০-এর পূর্ণঘাত দিয়ে গুণ করলে অংশক বদলায় না।',lg(R(b,10**n))+n,lg(b),'1<b<10; common log mantissa in [0,1)')

# Verify symbolic answer uniqueness and mathematical witnesses, not just row counts.
for q,m in zip(rows,audit):
 m['questionSha256']=hashlib.sha256((q['type']+'\n'+q['text']).encode()).hexdigest()
 if 'answerExpression' in m:
  answer=S.sympify(m['answerExpression']);choices=list(map(S.sympify,m['choiceExpressions']))
  assert [k for k,v in zip('ABCD',choices) if clean(v-answer)==0]==[q['correct']]
  assert all(clean(a-b)!=0 for a,b in combinations(choices,2))
  if m['family']!='board-seed':assert not q.get('provenance')
counts={k:sum(q['type']==k for q in rows) for k in ['MCQ','CQ','SQ']}
assert counts==dict(MCQ=150,CQ=50,SQ=70),counts
assert len({q['text'] for q in rows})==270

scope=dict(category='Class 9',subject='গণিত',topic='৪র্থ অধ্যায়: সূচক ও লগারিদম',
 book='Proshnobook — বোর্ড সংকলন ও নিজস্ব সূচক-লগারিদম অনুশীলনী',edition='Chapter 4 target v1; DRAFT; স্বাধীন শিক্ষক অনুমোদন বাকি',
 sourceUrl='https://github.com/saifulsirictdev/Proshnobook_com',lang='Bangla')

def emit(path,obj):
 text=json.dumps(obj,ensure_ascii=False,indent=2)+'\n'
 if '--check' in sys.argv:assert path.read_text()==text,f'Stale {path}'
 else:path.parent.mkdir(parents=True,exist_ok=True);path.write_text(text)
 return dict(file=str(path.relative_to(BASE)),bytes=len(text.encode()),sha256=hashlib.sha256(text.encode()).hexdigest())
metaByObject={id(q):m for q,m in zip(rows,audit)};files=[]
for name,items in [('mcq',[q for q in rows if q['type']=='MCQ']),('written',[q for q in rows if q['type']!='MCQ'])]:
 assert len(items)<=200
 for i,q in enumerate(items,1):metaByObject[id(q)].update(file=f'target-v1/{name}.json',itemInFile=i)
 files.append(emit(BASE/f'target-v1/{name}.json',{**scope,'items':items}))
limitations=['Numeric target met: 5 visually reviewed board-compilation MCQ and 265 original parameterised practice items, not 270 distinct concepts.',
 'Board/year metadata comes from compilation headers, not independent authentication of official original papers. No source CQ/SQ is claimed.',
 'Independent teacher review pending. Original questions are not board or verbatim NCTB/internet questions.',
 'Board-source collection is not exhaustive. The full current-edition NCTB chapter was not obtained/read; source preference was not exhaustively fulfilled.',
 'Exact answer, domain and rendering checks do not replace independent semantic/teacher review. No database import, approved stock, deployment or live receipt.']
review=dict(status='NUMERICAL_TARGET_MET_DRAFT_TEACHER_REVIEW_PENDING_NOT_IMPORTED',targetMet=True,teacherApproved=False,
 targetCounts=counts,counts=counts,remaining=dict(MCQ=0,CQ=0,SQ=0),boardCounts=dict(MCQ=5,CQ=0,SQ=0),
 originalPracticeCounts=dict(MCQ=145,CQ=50,SQ=70),importedCounts=dict(MCQ=0,CQ=0,SQ=0),databaseCountVerified=False,
 fullChapterTextbookRead=False,boardSearchExhaustive=False,originalSourcePreference=['board-paper','NCTB-textbook','other-online-source'],
 source=dict(fileName=SOURCE,sourceUrl=SOURCE_URL,sha256='ef88ec3c42fa52f407c39f1b978fa0494a695bac7d2b51a7c3921afa49a46111'),
 familyCounts={kind:dict(sorted(Counter(m['family'] for q,m in zip(rows,audit) if q['type']==kind and m['origin'].startswith('ORIGINAL')).items())) for kind in counts},
 files=files,limitations=limitations,itemReviews=audit)
seedFile=emit(BASE/'board-seed-v1.json',{**scope,'book':'বোর্ড-আরোপিত গণিত প্রশ্নসংকলন — সূচক ও লগারিদম','sourceUrl':SOURCE_URL,'items':rows[:seed_count]})
reviewFile=emit(BASE/'target-v1/validation.json',review)
emit(BASE/'targets-v1-manifest.json',dict(status=review['status'],chapter=4,category=scope['category'],subject=scope['subject'],topic=scope['topic'],
 counts=counts,boardCounts=review['boardCounts'],originalPracticeCounts=review['originalPracticeCounts'],teacherApproved=False,
 importedCounts=review['importedCounts'],files=files,validation=reviewFile,boardSeed=seedFile,limitations=limitations))
print('PASS: chapter 4 150 MCQ + 50 CQ + 70 SQ = 270. Five source MCQ + 265 original variants; draft, not imported.')
