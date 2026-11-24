"""SSC math chapter 5 numeric DRAFT: 100 MCQ, 20 CQ, 30 SQ.
Dev-only sympy==1.14.0. No network, DB writes, teacher approval or deployment.
Run with PYTHONPATH=.cache/math-validation python3 ... [--check].
"""
import hashlib
import json
import sys
from collections import Counter
from pathlib import Path
import sympy as S
ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'content/question-bank/ssc/math/chapter-5'
x=S.Symbol('x',real=True);R=S.Rational
SOURCE='3.-Math-Link-Board-142-311_Compressed-1.pdf'
URL='https://drive.google.com/file/d/1dbnQgd9Su9CBeId1RV-hShNh8IG_YOJ5/view'
rows=[];audit=[]
def tex(v):return S.latex(S.sympify(v))
def L(v):return '$'+tex(v)+'$'
def equation(lhs,rhs=0,excluded=()):
 lhs=S.sympify(lhs);rhs=S.sympify(rhs)
 return dict(lhs=str(lhs),rhs=str(rhs),excluded=[str(v) for v in excluded])
def roots(e):
 expr=S.sympify(e['lhs'],locals={'x':x})-S.sympify(e['rhs'],locals={'x':x})
 result=S.solveset(expr,x,domain=S.S.Reals)-S.FiniteSet(*map(S.sympify,e['excluded']))
 assert isinstance(result,S.FiniteSet) or result==S.EmptySet,result
 return sorted(result,key=lambda v:float(v))
def check(e,values):
 actual=roots(e);assert actual==list(map(S.sympify,values)),(e,actual,values)
 return {**e,'expectedRoots':[str(v) for v in values]}
def put(kind,f,n,text,why,**extra):
 q=dict(type=kind,text=text,explanation=why,page=f'নিজস্ব অনুশীলনী; Ch5/{kind}/{f}/{n}; বোর্ড/বইয়ের অবিকল প্রশ্ন নয়',difficulty='HARD' if kind=='CQ' else 'MEDIUM',**extra)
 assert len(q['page'])<=100
 rows.append(q);audit.append(dict(origin='ORIGINAL_PARAMETERISED_PRACTICE_NOT_BOARD_OR_TEXTBOOK',family=f,variant=n))
def board(pdf,num,name,text,options,key,why,e,valid,**extra):
 rows.append(dict(type='MCQ',text=text,options=dict(zip('ABCD',options)),correct=key,explanation=why,difficulty='MEDIUM',page=f'সংকলন: মুদ্রিত {pdf+141}; PDF {pdf}; প্রশ্ন {num}',provenance=[dict(kind='board',board=name,examYear=2024,sourceFile=SOURCE,pdfPage=pdf,printedPage=str(pdf+141),questionNumber=str(num))]))
 audit.append(dict(origin='TRANSCRIBED_BOARD_COMPILATION',family='board-seed',variant=len(rows),visualRead=True,equations=[check(e,valid)],correct=key,adaptation='বিকল্পের ক্রম ও শর্ত বজায় রেখে Unicode/LaTeX প্রতিলিপি; সমাধান নতুনভাবে লেখা।',**extra))
board(1,7,'dhaka',r'$\sqrt{3x-6}+5=2$ সমীকরণটির সমাধান সেট কোনটি?',
 [r'$\varnothing$',r'$\{-5\}$',r'$\{-3\}$',r'$\{5\}$'],'A',
 r'$3x-6\ge0$ অর্থাৎ $x\ge2$। কিন্তু সমীকরণে $\sqrt{3x-6}=-3$, যা বাস্তব বর্গমূলের জন্য অসম্ভব। বর্গ করে পাওয়া $x=5$ মূল সমীকরণ মানে না। তাই সমাধান সেট শূন্য।',equation(S.sqrt(3*x-6)+5,2),[],choiceSolutionSets={'A':[],'B':['-5'],'C':['-3'],'D':['5']})
board(1,21,'dhaka',
 'একটি আয়তাকার ঘরের মেঝের দৈর্ঘ্য প্রস্থ অপেক্ষা ২ মিটার বেশি এবং মেঝের পরিসীমা ২০ মিটার। ঘরের মেঝের দৈর্ঘ্য কত?',
 ['৪ মিটার','৬ মিটার','৮ মিটার','১০ মিটার'],'B',
 r'প্রস্থ $w$ হলে $2(w+w+2)=20$, অর্থাৎ $4w=16$। প্রস্থ ৪ ও দৈর্ঘ্য ৬ মিটার; $2(4+6)=20$।',equation(2*(x+x-2),20),[6],choiceExpressions=['4','6','8','10'],answerExpression='6',interpretation='x is length in metres')
board(20,19,'cumilla',r'$f(x)=x^2-5x+6$ এবং $f(x)=0$ হলে, x কত?',
 ['$2,3$','$-5,1$','$-2,3$','$1,-5$'],'A',
 r'$x^2-5x+6=(x-2)(x-3)$। তাই $x=2$ অথবা $x=3$; দুটিই মূল সমীকরণ মানে।',equation(x*x-5*x+6),[2,3],choiceSolutionSets={'A':['2','3'],'B':['-5','1'],'C':['-2','3'],'D':['1','-5']},choiceSemanticNotes='Source B and D list the same incorrect root set in opposite order. Preserved without silently repairing the source; correct A remains unique.')
board(29,8,'jashore',r'$\frac{x-2}{x-1}=2-\frac1{x-1}$ সমীকরণের সমাধান সেট নিচের কোনটি?',
 [r'$\{1\}$',r'$\{\varnothing\}$',r'$\{\}$',r'$\{2\}$'],'C',
 r'প্রথমে $x\ne1$। উভয় পাশে $x-1$ গুণ করে $x-2=2x-3$, তাই সম্ভাব্য মান $x=1$; এটি হর শূন্য করে। ফলে কোনো সমাধান নেই, সেট $\{\}=\varnothing$। B-তে $\{\varnothing\}$ একটি উপাদানবিশিষ্ট সেট, শূন্য সেট নয়।',equation((x-2)/(x-1),2-1/(x-1),[1]),[],choiceSolutionSets={'A':['1'],'B':['EMPTY_SET_ELEMENT'],'C':[],'D':['2']},choiceSemanticNotes='Preserved source B {∅} versus C {}; do not conflate singleton containing the empty set with the empty set.')
board(67,6,'dinajpur',r'$\sqrt{2x-2}+4=5$ এর সমাধান সেট নিচের কোনটি?',
 [r'$\{0\}$',r'$\{1\}$',r'$\{\frac32\}$',r'$\{\}$'],'C',
 r'$x\ge1$ এবং $\sqrt{2x-2}=1$। বর্গ করে $2x-2=1$, তাই $x=3/2$। বসিয়ে $\sqrt1+4=5$ মেলে।',equation(S.sqrt(2*x-2)+4,5),[R(3,2)],choiceSolutionSets={'A':['0'],'B':['1'],'C':['3/2'],'D':[]})
seed_count=len(rows)
def mcq(f,n,text,e,query,value,why):
 values=roots(e)
 expected={'only':lambda:values[0] if len(values)==1 else None,'count':lambda:len(values),'max':lambda:max(values),'min':lambda:min(values),'sum':lambda:sum(values),'product':lambda:S.prod(values),'discriminant':lambda:S.discriminant(S.sympify(e['lhs'],locals={'x':x})-S.sympify(e['rhs'],locals={'x':x}),x)}[query]()
 assert S.simplify(expected-value)==0,(f,n,expected,value)
 choices=list(map(S.sympify,[value,value+1,value-1,value+2]));shift=(len(f)+n)%4;choices=choices[shift:]+choices[:shift]
 key='ABCD'[choices.index(S.sympify(value))]
 put('MCQ',f,n,text,why+' সঠিক উত্তর '+L(value)+'।',options={k:L(v) for k,v in zip('ABCD',choices)},correct=key)
 audit[-1].update(equations=[check(e,values)],query=query,answerExpression=str(value),choiceExpressions=[str(v) for v in choices],correct=key)
def cq(f,n,text,parts,equations,domains):
 assert len(parts)==3
 put('CQ',f,n,text,'সমীকরণ গঠন, ধাপে ধাপে সমাধান এবং প্রাসঙ্গিক শর্ত অনুযায়ী মূল যাচাই নিচের অংশগুলোতে দেওয়া আছে।',parts=[dict(label=l,marks=m,question=q,solution=s) for l,m,(q,s) in zip(['ক','খ','গ'],[2,4,4],parts)])
 audit[-1].update(equations=[check(e,v) for e,v in equations],domainNotes=domains)
def sq(f,n,text,solution,e,values,domain):
 put('SQ',f,n,text,solution);audit[-1].update(equations=[check(e,values)],domainNotes=[domain])

for n in range(1,6):
 a=n+2;b=n+4
 mcq('linear',n,rf'${a}x+{n}={a*b+n}$ হলে x কত?',equation(a*x+n,a*b+n),'only',b,rf'উভয় পাশ থেকে {n} বিয়োগে ${a}x={a*b}$; ${a}$ দিয়ে ভাগে $x={b}$।')
 mcq('both-sides',n,rf'${a+1}x-{a}={a}x+{b}$ সমাধান করলে x কত?',equation((a+1)*x-a,a*x+b),'only',a+b,rf'চলক এক পাশে আনলে $x={a}+{b}={a+b}$।')
 mcq('fraction-linear',n,rf'$\frac{{x+{a}}}{{{b}}}=\frac32$ হলে x কত?',equation((x+a)/b,R(3,2)),'only',R(3*b,2)-a,rf'হর ${b}\ne0$। আড়গুণে $2(x+{a})={3*b}$। তাই $x={tex(R(3*b,2)-a)}$।')
 mcq('brackets',n,rf'${a}(x-2)+3={a*b-2*a+3}$ হলে x কত?',equation(a*(x-2)+3,a*b-2*a+3),'only',b,rf'বন্ধনী খুলে ${a}x-{2*a}+3={a*b-2*a+3}$। ধ্রুবক সরিয়ে $x={b}$।')
 mcq('rational',n,rf'$\frac{{x+{a}}}{{x-{a}}}=3$ হলে বৈধ x কত?',equation((x+a)/(x-a),3,[a]),'only',2*a,rf'$x\ne{a}$। আড়গুণে $x+{a}=3x-{3*a}$, তাই $x={2*a}$; এই মানে হর অশূন্য।')
 mcq('excluded-root',n,rf'$\frac{{x^2-{a*a}}}{{x-{a}}}={2*a}$ সমীকরণের বাস্তব সমাধান সংখ্যা কত?',equation((x*x-a*a)/(x-a),2*a,[a]),'count',0,rf'$x\ne{a}$ শর্তে বামপক্ষ $x+{a}$। তাই সম্ভাব্য $x={a}$ অবৈধ; সমাধান নেই।')
 mcq('identity-constant',n,rf'সব বাস্তব t-এর জন্য ${a}(t+2)={a}t+k$ সত্য হলে k কত?',equation(2*a,x),'only',2*a,rf'বামপক্ষ ${a}t+{2*a}$। সমান রাশির ধ্রুবক তুলনায় $k={2*a}$।')
 mcq('quadratic-positive',n,rf'$x^2={a*a}$ হলে ধনাত্মক মূল কত?',equation(x*x,a*a),'max',a,rf'$x=\pm{a}$। এদের ধনাত্মকটি ${a}$; ঋণাত্মকটিও মূল হলেও চাওয়া হয়নি।')
 mcq('quadratic-negative',n,rf'$(x+{a})(x+{b})=0$-এর বৃহত্তর মূল কত?',equation((x+a)*(x+b)),'max',-a,rf'মূল $-{a}$ ও $-{b}$। ${a}<{b}$ বলে $-{a}>-{b}$।')
 mcq('repeated-root',n,rf'$x^2-{2*a}x+{a*a}=0$-এর ভিন্ন বাস্তব মূল কয়টি?',equation(x*x-2*a*x+a*a),'count',1,rf'এটি $(x-{a})^2=0$। একই মূল দুইবার এলেও ভিন্ন বাস্তব মূল মাত্র ১টি।')
 mcq('no-real-root',n,rf'$(x-{a})^2+{n}=0$-এর বাস্তব মূল কয়টি?',equation((x-a)**2+n),'count',0,rf'বাস্তব x-এর বর্গ অঋণাত্মক। তার সঙ্গে ধনাত্মক {n} যোগ করে শূন্য হয় না।')
 poly=x*x-(a+b)*x+a*b
 mcq('discriminant',n,rf'${tex(poly)}=0$ সমীকরণের নির্ণায়ক কত?',equation(poly),'discriminant',(a-b)**2,rf'$D=b^2-4ac=({a+b})^2-4({a*b})={(a-b)**2}$। এখানে b বলতে সাধারণ দ্বিঘাত রূপের সহগ বোঝায়।')
 mcq('root-sum',n,rf'${tex(poly)}=0$-এর মূলদ্বয়ের যোগফল কত?',equation(poly),'sum',a+b,rf'উৎপাদক $(x-{a})(x-{b})=0$। মূল {a} ও {b}; যোগফল {a+b}।')
 mcq('root-product',n,rf'${tex(poly)}=0$-এর মূলদ্বয়ের গুণফল কত?',equation(poly),'product',a*b,rf'মূল {a} ও {b}, তাই গুণফল ${a}\times{b}={a*b}$; এটি ধ্রুবক পদ/মুখ্য সহগও।')
 mcq('parameter-root',n,rf'$t^2+kt-{a*b}=0$-এর একটি মূল $t={a}$ হলে k কত?',equation(a*a+a*x-a*b),'only',b-a,rf'$t={a}$ বসিয়ে ${a*a}+{a}k-{a*b}=0$। তাই ${a}k={a*(b-a)}$ ও $k={b-a}$।')
 mcq('reciprocal-equation',n,rf'$x+\frac1x={tex(R(a*a+1,a))}$ হলে ক্ষুদ্রতর বাস্তব মূল কত?',equation(x+1/x,R(a*a+1,a),[0]),'min',R(1,a),rf'$x\ne0$। গুণ করে উৎপাদক $(x-{a})(x-1/{a})=0$। মূল ${a}$ ও $1/{a}$; ক্ষুদ্রতরটি $1/{a}$।')
 mcq('radical',n,rf'$\sqrt{{x+{a}}}={b}$ হলে x কত?',equation(S.sqrt(x+a),b),'only',b*b-a,rf'ডানপক্ষ ${b}>0$। বর্গে $x+{a}={b*b}$; $x={b*b-a}$ বসালে বর্গমূল ${b}$ হয়।')
 mcq('rectangle-width',n,f'এক আয়তক্ষেত্রের দৈর্ঘ্য প্রস্থের চেয়ে {a} মিটার বেশি এবং পরিসীমা {2*(2*b+a)} মিটার। প্রস্থ কত মিটার?',equation(2*(x+x+a),2*(2*b+a)),'only',b,rf'প্রস্থ x হলে $2(x+x+{a})={2*(2*b+a)}$। তাই $4x={4*b}$ ও প্রস্থ {b} মিটার।')
 mcq('age',n,f'বাবার বয়স ছেলের বয়সের ৩ গুণ। {a} বছর পরে বাবার বয়স ছেলের বয়সের ২ গুণ হবে। ছেলের বর্তমান বয়স কত বছর?',equation(3*x+a,2*(x+a)),'only',a,rf'ছেলের বয়স x হলে $3x+{a}=2(x+{a})$। তাই $x={a}$; বাবার বয়স {3*a}।')

# Ten contextual/algebraic CQ families, two variants each.
for n in range(1,3):
 w=n+3;d=n+2;length=w+d;area=w*length
 cq('rectangle',n,f'একটি আয়তাকার বাগানের দৈর্ঘ্য প্রস্থ অপেক্ষা {d} মিটার বেশি এবং ক্ষেত্রফল {area} বর্গমিটার।',[
 ('প্রস্থ x মিটার ধরে দৈর্ঘ্য ও ক্ষেত্রফলের সমীকরণ লেখ।',rf'দৈর্ঘ্য $x+{d}$। তাই $x(x+{d})={area}$, অর্থাৎ $x^2+{d}x-{area}=0$; $x>0$।'),
 ('সমীকরণ সমাধান করে দৈর্ঘ্য ও প্রস্থ নির্ণয় কর।',rf'উৎপাদক $(x-{w})(x+{length})=0$। মূল ${w},-{length}$। ঋণাত্মক প্রস্থ বর্জনে প্রস্থ {w} ও দৈর্ঘ্য {length} মিটার; গুণফল {area}।'),
 ('চারদিকে বেড়া দিতে প্রতি মিটারে ৫০ টাকা লাগলে মোট খরচ নির্ণয় কর।',rf'পরিসীমা $2({w}+{length})={2*(w+length)}$ মিটার। খরচ $50\times{2*(w+length)}={100*(w+length)}$ টাকা।')],[(equation(x*(x+d),area),[-length,w])],['physical width x>0; reject negative algebraic root'])
 s=n+7
 cq('ages',n,f'বাবার বর্তমান বয়স ছেলের বর্তমান বয়সের তিন গুণ। {s} বছর পরে বাবার বয়স ছেলের তখনকার বয়সের দ্বিগুণ হবে।',[
 ('ছেলের বর্তমান বয়স x ধরে ভবিষ্যতের বয়সের সমীকরণ লেখ।',rf'তখন ছেলে $x+{s}$ ও বাবা $3x+{s}$ বছরের। তাই $3x+{s}=2(x+{s})$।'),
 ('বাবা ও ছেলের বর্তমান বয়স বের করে উভয় শর্ত যাচাই কর।',rf'সমীকরণে $x={s}$। বাবা {3*s} বছর। এখন অনুপাত ৩; {s} বছর পরে বয়স ${4*s}$ ও ${2*s}$, অনুপাত ২।'),
 ('দুই বছর আগে তাঁদের বয়সের অনুপাত নির্ণয় কর এবং তা বর্তমান অনুপাতের সমান কি না দেখাও।',rf'দুই বছর আগে বাবা ${3*s-2}$ ও ছেলে ${s-2}$ বছরের। অনুপাত ${tex(R(3*s-2,s-2))}$, যা ৩ নয়; কারণ $({3*s-2})-3({s-2})=4>0$।')],[(equation(3*x+s,2*(x+s)),[s])],['ages positive; son age two years ago s-2>0'])
 a=n+4;product=a*(a+1)
 cq('consecutive',n,f'দুটি ক্রমিক ধনাত্মক পূর্ণসংখ্যার গুণফল {product}।',[
 ('ছোট সংখ্যাটি x ধরে সমীকরণ গঠন কর।',rf'বড়টি $x+1$। সমীকরণ $x(x+1)={product}$ এবং $x\in\mathbb{{Z}}$, $x>0$।'),
 ('সংখ্যা দুটি নির্ণয় করে অবৈধ মূলটি কেন বর্জন করবে ব্যাখ্যা কর।',rf'$(x-{a})(x+{a+1})=0$। মূল ${a},-{a+1}$; ধনাত্মক শর্তে ছোটটি {a}, বড়টি {a+1}।'),
 ('সংখ্যা দুটির বর্গের যোগফল দুইভাবে নির্ণয় কর।',rf'সরাসরি ${a*a}+{(a+1)**2}={a*a+(a+1)**2}$। আবার যোগফল ${2*a+1}$, তাই $({2*a+1})^2-2({product})={a*a+(a+1)**2}$।')],[(equation(x*(x+1),product),[-a-1,a])],['x is positive integer'])
 t=n+3;d=n+2;w=R(t*(t+d),2*t+d);other=-w*d/t;poly=S.expand(x*x+(d-2*w)*x-w*d)
 cq('work-rate',n,rf'দুইটি নল একসঙ্গে একটি খালি ট্যাংক ${tex(w)}$ ঘণ্টায় পূর্ণ করে। ধীর নলটি দ্রুত নলের চেয়ে {d} ঘণ্টা বেশি সময় নেয়। প্রতিটি নলের হার ধ্রুব এবং কোনো পানি বের হয় না।',[
 ('দ্রুত নল একা x ঘণ্টায় পূর্ণ করলে ধীর নলের সময় ও যৌথ হারের সমীকরণ লেখ।',rf'ধীর নলের সময় $x+{d}$। তাই $1/x+1/(x+{d})={tex(1/w)}$ এবং $x>0$।'),
 ('সমীকরণ সমাধান করে প্রতিটি নলের আলাদা সময় নির্ণয় কর।',rf'হর গুণে ${tex(poly)}=0$, অর্থাৎ $(x-{t})(x-({tex(other)}))=0$। ধনাত্মক মূল $x={t}$, অন্যটি ঋণাত্মক। সময় যথাক্রমে {t} ও {t+d} ঘণ্টা।'),
 ('দ্রুত নল প্রথমে এক ঘণ্টা চলার পর ধীর নলও খুললে অবশিষ্ট অংশ পূরণে কত সময় লাগবে?',rf'প্রথম ঘণ্টায় পূর্ণ $1/{t}$ অংশ। বাকি $({t-1})/{t}$। যৌথ হার ${tex(1/w)}$; অতিরিক্ত সময় $({tex(R(t-1,t))})/({tex(1/w)})={tex(R(t-1,t)*w)}$ ঘণ্টা।')],[(equation(1/x+1/(x+d),1/w,[0,-d]),[other,t])],['physical time x>0; algebraic negative root rejected; no leakage'])
 v=n+2;t=2*v;D=6*v
 cq('travel-speed',n,f'একটি গাড়ি {D} কিমি পথ চলে। গতি ঘণ্টায় {v} কিমি বাড়ালে একই পথ যেতে এক ঘণ্টা কম লাগে। গতি ধ্রুব ধরে হিসাব কর।',[
 ('প্রথম গতি x কিমি/ঘণ্টা ধরে সময়ের সমীকরণ লেখ।',rf'সময় $ {D}/x$ ও ${D}/(x+{v})$ ঘণ্টা। তাই ${D}/x-{D}/(x+{v})=1$, $x>0$।'),
 ('মূল গতি ও বাড়ানো গতি নির্ণয় কর।',rf'হর সরিয়ে $x^2+{v}x-{D*v}=0$। উৎপাদক $(x-{2*v})(x+{3*v})=0$। ধনাত্মক গতি {2*v}, বাড়ানো গতি {3*v} কিমি/ঘণ্টা।'),
 ('দুই ক্ষেত্রে সময় বের করে শর্ত যাচাই কর; মূল গতিতে আরও এক ঘণ্টা চললে মোট দূরত্ব কত?',rf'সময় ${D}/{2*v}=3$ ও ${D}/{3*v}=2$ ঘণ্টা। পার্থক্য ১। মূল গতিতে মোট ৪ ঘণ্টায় দূরত্ব $4\times{2*v}={8*v}$ কিমি।')],[(equation(D/x-D/(x+v),1,[0,-v]),[-3*v,2*v])],['speed x>0; reject negative speed'])
 a=n+2;digitSum=2*a+2;number=11*a+2
 cq('two-digit',n,f'দুই অঙ্কের একটি সংখ্যার অঙ্কদ্বয়ের যোগফল {digitSum}। অঙ্কদ্বয় স্থান বিনিময় করলে সংখ্যাটি ১৮ বেড়ে যায়।',[
 ('দশকের অঙ্ক x ধরে মূল ও উল্টানো সংখ্যাটি লেখ।',rf'এককের অঙ্ক ${digitSum}-x$। মূল সংখ্যা $10x+({digitSum}-x)=9x+{digitSum}$। উল্টানো সংখ্যা $10({digitSum}-x)+x={10*digitSum}-9x$।'),
 ('এক চলকের সমীকরণ সমাধান করে সংখ্যাটি বের কর।',rf'সমীকরণ $({10*digitSum}-9x)-(9x+{digitSum})=18$। তাই $18x={9*digitSum-18}$, $x={a}$। একক {a+2}; সংখ্যা {number}।'),
 ('অঙ্কের সীমা ও স্থানবিনিময়ের শর্ত যাচাই করে সংখ্যাদ্বয়ের যোগফল বের কর।',rf'অঙ্ক {a} ও {a+2} উভয়ই ১–৯-এর মধ্যে। উল্টানো সংখ্যা {number+18}; পার্থক্য ১৮। যোগফল ${number}+{number+18}={2*number+18}=11\times{digitSum}$।')],[(equation(10*(digitSum-x)+x-(10*x+digitSum-x),18),[a])],['integer tens digit 1..9, units digit 0..9; reversed number also two-digit'])
 T=10+2*n;a=n+3;cost=30*T+20*a
 cq('tickets',n,f'এক অনুষ্ঠানে মোট {T}টি টিকিট বিক্রি হয়েছে। বড়দের টিকিট ৫০ টাকা, শিশুদের ৩০ টাকা। মোট আয় {cost} টাকা।',[
 ('বড়দের টিকিট x ধরে শিশুদের টিকিট ও মোট আয়ের সমীকরণ লেখ।',rf'শিশুদের টিকিট ${T}-x$। সমীকরণ $50x+30({T}-x)={cost}$, যেখানে $x$ পূর্ণসংখ্যা ও $0\le x\le{T}$।'),
 ('দুই ধরনের টিকিটের সংখ্যা নির্ণয় ও আয় যাচাই কর।',rf'$20x={cost-30*T}$ থেকে $x={a}$। শিশুদের ${T-a}$টি। আয় $50({a})+30({T-a})={cost}$ টাকা।'),
 ('একই সংখ্যক সব টিকিট বড়দের দামে বিক্রি হলে আয় কত বাড়ত? কারণসহ দেখাও।',rf'সব বড়দের হলে আয় $50\times{T}={50*T}$ টাকা। বৃদ্ধি ${50*T}-{cost}={20*(T-a)}$ টাকা। কারণ প্রতিটি শিশুর টিকিটে অতিরিক্ত ২০ টাকা আসত।')],[(equation(50*x+30*(T-x),cost),[a])],['ticket counts integer in [0,T]'])
 b=n+1;a=2-b;rad=x+a
 cq('radical-extraneous',n,rf'$\sqrt{{{tex(rad)}}}=x-{b}$ সমীকরণটি বিবেচনা কর।',[
 ('বর্গমূলের ভেতরের রাশি ও ডানপক্ষ থেকে x-এর শর্ত লেখ।',rf'প্রথমে ${tex(rad)}\ge0$। বর্গমূল অঋণাত্মক বলে $x-{b}\ge0$। দুটি মিলিয়ে $x\ge{b}$।'),
 ('উভয় পাশ বর্গ করে সম্ভাব্য মূলগুলো নির্ণয় কর।',rf'${tex(rad)}=(x-{b})^2$। সরিয়ে $(x-{b+2})(x-{b-1})=0$। সম্ভাব্য মূল ${b+2}$ ও ${b-1}$।'),
 ('মূল সমীকরণে পরীক্ষা করে প্রকৃত সমাধান সেট লেখ এবং বর্জিত মূলের কারণ দাও।',rf'$x={b+2}$-এ বামপক্ষ $\sqrt4=2$, ডানপক্ষ ২। কিন্তু $x={b-1}$-এ বামপক্ষ $\sqrt1=1$, ডানপক্ষ $-1$। তাই প্রকৃত সেট $\{{{b+2}\}}$; বর্গ করার ফলে অতিরিক্ত মূল এসেছে।')],[(equation(S.sqrt(rad),x-b),[b+2]),(equation(rad,(x-b)**2),[b-1,b+2])],['radicand >=0 and right side >=0; squaring is not reversible without sign check'])
 a=n+2;b=a+2
 cq('rational-domain',n,rf'$\frac{{x^2-{a*a}}}{{x-{a}}}={a+b}$ সমীকরণটি দেওয়া আছে।',[
 ('x-এর নিষিদ্ধ মান নির্ণয় কর।',rf'হর $x-{a}\ne0$ হওয়ায় $x\ne{a}$। এই শর্ত বাতিল করা যাবে না।'),
 ('সমীকরণটি সমাধান করে মূল ভগ্নাংশে যাচাই কর।',rf'নিষিদ্ধ মান ছাড়া বামপক্ষ $x+{a}$। তাই $x={b}$। মূল ভগ্নাংশে $({b*b}-{a*a})/({b}-{a})={a+b}$; হর ${b-a}\ne0$।'),
 (rf'ডানপক্ষ {a+b}-এর বদলে {2*a} হলে সমাধান থাকবে কি? যুক্তি দাও।',rf'তখন $x+{a}={2*a}$ থেকে সম্ভাব্য $x={a}$, যা নিষিদ্ধ। তাই নতুন সমীকরণের সমাধান সেট $\varnothing$। সরলীকরণে হরের শর্ত ভুললে ভুল উত্তর হবে।')],[(equation((x*x-a*a)/(x-a),a+b,[a]),[b]),(equation((x*x-a*a)/(x-a),2*a,[a]),[])],['denominator x-a !=0 retained after cancellation'])
 a=n+2;poly=x*x-2*a*x+a*a-2
 cq('complete-square',n,rf'${tex(poly)}=0$ সমীকরণটি দেওয়া আছে।',[
 ('বামপক্ষকে পূর্ণবর্গ ব্যবহার করে লেখ।',rf'${tex(poly)}=(x-{a})^2-2$। তাই $(x-{a})^2=2$।'),
 ('সব বাস্তব মূল নির্ণয় করে কোনগুলো ধনাত্মক দেখাও।',rf'$x-{a}=\pm\sqrt2$, তাই $x={a}\pm\sqrt2$। যেহেতু ${a}>\sqrt2$, দুটি মূলই ধনাত্মক; শুধু একটি মূল নেওয়া ভুল।'),
 ('মূলদ্বয়ের বর্গের যোগফল নির্ণয় কর এবং মূলের যোগফল ও গুণফল দিয়ে মিলাও।',rf'যোগফল ${2*a}$, গুণফল ${a*a-2}$। বর্গের যোগফল $({2*a})^2-2({a*a-2})={2*a*a+4}$; সরাসরি $({a}+\sqrt2)^2+({a}-\sqrt2)^2$-ও একই।')],[(equation(poly),[a-S.sqrt(2),a+S.sqrt(2)])],['both real roots retained; a>sqrt(2) ensures positivity'])

for n in range(1,4):
 a=n+2;b=n+5
 sq('linear',n,rf'${a}x-{n}={a*b-n}$ সমাধান ও যাচাই কর।',rf'ধ্রুবক সরিয়ে ${a}x={a*b}$; তাই $x={b}$। বসালে ${a}\times{b}-{n}={a*b-n}$ মেলে।',equation(a*x-n,a*b-n),[b],'x real')
 sq('fraction',n,rf'$\frac{{x-1}}{{{a}}}+\frac{{x+1}}{{{a}}}={2*b}$ সমাধান কর।',rf'অশূন্য হর একই: $2x/{a}={2*b}$। তাই $x={a*b}$; বসিয়ে দুই ভগ্নাংশের যোগ ${2*b}$ হয়।',equation((x-1)/a+(x+1)/a,2*b),[a*b],'constant denominator a>0')
 poly=x*x-(a+b)*x+a*b
 sq('factor-quadratic',n,rf'${tex(poly)}=0$ উৎপাদকের সাহায্যে সমাধান কর।',rf'$(x-{a})(x-{b})=0$। তাই $x={a}$ অথবা ${b}$। যেকোনো একটি উৎপাদক শূন্য হলে মূল গুণফল শূন্য; উভয় মূল বৈধ।',equation(poly),[a,b],'all real roots retained')
 sq('double-root',n,rf'$x^2+{2*a}x+{a*a}=0$ সমাধান করে ভিন্ন মূলের সংখ্যা লেখ।',rf'$(x+{a})^2=0$। তাই একমাত্র ভিন্ন মূল $x=-{a}$; দ্বিত্ব ২ হলেও ভিন্ন মূল ১টি।',equation(x*x+2*a*x+a*a),[-a],'distinct root versus multiplicity')
 sq('irrational-roots',n,rf'$(x-{a})^2={n+1}$-এর সব বাস্তব মূল লেখ।',rf'দুই চিহ্ন নিতে হবে: $x-{a}=\pm\sqrt{{{n+1}}}$। তাই মূল ${tex(a-S.sqrt(n+1))}$ এবং ${tex(a+S.sqrt(n+1))}$।',equation((x-a)**2,n+1),[a-S.sqrt(n+1),a+S.sqrt(n+1)],'principal square root plus both algebraic signs')
 sq('no-real',n,rf'$x^2+{a}=0$-এর বাস্তব সমাধান আছে কি? যুক্তি দাও।',rf'বাস্তব x-এর জন্য $x^2\ge0$। তাই $x^2+{a}\ge{a}>0$; বাস্তব সমাধান নেই, সেট $\varnothing$।',equation(x*x+a),[],'real number domain only')
 sq('cancel-domain',n,rf'$\frac{{x^2-{a*a}}}{{x-{a}}}={2*a}$ সমাধান কর; হরের শর্ত দাও।',rf'$x\ne{a}$ শর্তে বামপক্ষ $x+{a}$। সম্ভাব্য $x={a}$ শর্তবিরোধী; তাই সমাধান সেট $\varnothing$।',equation((x*x-a*a)/(x-a),2*a,[a]),[],'exclude x=a before and after cancellation')
 sq('radical',n,rf'$\sqrt{{3x+{n}}}={a}$ সমাধান ও যাচাই কর।',rf'ডানপক্ষ ধনাত্মক। বর্গে $3x+{n}={a*a}$, তাই $x={tex(R(a*a-n,3))}$। এই মানে বর্গমূলের ভেতর ${a*a}$, মূল মান ${a}$; সমীকরণ মেলে।',equation(S.sqrt(3*x+n),a),[R(a*a-n,3)],'radicand>=0; check original equation after squaring')
 total=20*b+15*a
 sq('purchase',n,f'প্রতি খাতা ২০ টাকা ও প্রতি কলম ১৫ টাকা। {a}টি কলম ও কয়েকটি খাতা কিনে মোট {total} টাকা দেওয়া হলো। খাতার সংখ্যা সমীকরণ গঠন করে নির্ণয় কর।',rf'খাতার সংখ্যা x হলে $20x+15({a})={total}$। তাই $20x={20*b}$ ও $x={b}$। এটি অঋণাত্মক পূর্ণসংখ্যা; খরচ যাচাইয়ে একই মোট পাওয়া যায়।',equation(20*x+15*a,total),[b],'x nonnegative integer')
 sq('root-parameter',n,rf'$t^2+kt-{a*b}=0$-এর একটি মূল $t={b}$ হলে k নির্ণয় কর।',rf'$t={b}$ বসিয়ে ${b*b}+{b}k-{a*b}=0$। সুতরাং ${b}k={b*(a-b)}$, অর্থাৎ $k={a-b}$। এই মানে বহুপদী $(t-{b})(t+{a})$, তাই প্রদত্ত মূলটি যাচাই হয়।',equation(b*b+b*x-a*b),[a-b],'audit x represents requested coefficient k')

counts={k:sum(q['type']==k for q in rows) for k in ['MCQ','CQ','SQ']}
assert counts==dict(MCQ=100,CQ=20,SQ=30)
assert len({q['text'] for q in rows})==150
for q,m in zip(rows,audit):m['questionSha256']=hashlib.sha256((q['type']+'\n'+q['text']).encode()).hexdigest()
scope=dict(category='Class 9',subject='গণিত',topic='৫ম অধ্যায়: এক চলকবিশিষ্ট সমীকরণ',book='Proshnobook — বোর্ড সংকলন ও নিজস্ব এক চলকের সমীকরণ অনুশীলনী',edition='Chapter 5 target v1; DRAFT; স্বাধীন শিক্ষক অনুমোদন বাকি',sourceUrl='https://github.com/saifulsirictdev/Proshnobook_com',lang='Bangla')
def emit(path,obj):
 text=json.dumps(obj,ensure_ascii=False,indent=2)+'\n'
 if '--check' in sys.argv:assert path.read_text()==text,f'Stale {path}'
 else:path.parent.mkdir(parents=True,exist_ok=True);path.write_text(text)
 return dict(file=str(path.relative_to(BASE)),bytes=len(text.encode()),sha256=hashlib.sha256(text.encode()).hexdigest())
files=[];metaByObject={id(q):m for q,m in zip(rows,audit)}
for name,items in [('mcq',[q for q in rows if q['type']=='MCQ']),('written',[q for q in rows if q['type']!='MCQ'])]:
 assert len(items)<=200
 for i,q in enumerate(items,1):metaByObject[id(q)].update(file=f'target-v1/{name}.json',itemInFile=i)
 files.append(emit(BASE/f'target-v1/{name}.json',{**scope,'items':items}))
limitations=['Numeric target met: 5 visually read board-compilation MCQ + 145 original parameter variants, not 150 distinct concepts.',
 'Compilation board/year labels have not been independently authenticated against official original papers. No source CQ/SQ is claimed.',
 'Independent teacher review pending. Original practice is not board or verbatim NCTB/internet content.',
 'Board search is not exhaustive; full current-edition NCTB chapter was not obtained/read. Source priority and chapter coverage are not exhaustively fulfilled.',
 'Source Cumilla Q19 has equivalent incorrect B/D root-set distractors; preserved. Source Jashore Q8 B {empty set} is a singleton, not the empty set C {}.',
 'Exact real-root, exclusion and rendering checks do not replace independent semantic/teacher review. No database import, approval or deployment.']
review=dict(status='NUMERICAL_TARGET_MET_DRAFT_TEACHER_REVIEW_PENDING_NOT_IMPORTED',targetMet=True,teacherApproved=False,targetCounts=counts,counts=counts,remaining=dict(MCQ=0,CQ=0,SQ=0),boardCounts=dict(MCQ=5,CQ=0,SQ=0),originalPracticeCounts=dict(MCQ=95,CQ=20,SQ=30),importedCounts=dict(MCQ=0,CQ=0,SQ=0),databaseCountVerified=False,fullChapterTextbookRead=False,boardSearchExhaustive=False,originalSourcePreference=['board-paper','NCTB-textbook','other-online-source'],source=dict(fileName=SOURCE,sourceUrl=URL,sha256='ef88ec3c42fa52f407c39f1b978fa0494a695bac7d2b51a7c3921afa49a46111'),familyCounts={k:dict(sorted(Counter(m['family'] for q,m in zip(rows,audit) if q['type']==k and m['origin'].startswith('ORIGINAL')).items())) for k in counts},files=files,limitations=limitations,itemReviews=audit)
seedFile=emit(BASE/'board-seed-v1.json',{**scope,'book':'বোর্ড-আরোপিত সংকলন — এক চলকবিশিষ্ট সমীকরণ','sourceUrl':URL,'items':rows[:seed_count]})
reviewFile=emit(BASE/'target-v1/validation.json',review)
emit(BASE/'targets-v1-manifest.json',dict(status=review['status'],chapter=5,category=scope['category'],subject=scope['subject'],topic=scope['topic'],counts=counts,boardCounts=review['boardCounts'],originalPracticeCounts=review['originalPracticeCounts'],teacherApproved=False,importedCounts=review['importedCounts'],files=files,validation=reviewFile,boardSeed=seedFile,limitations=limitations))
print('PASS: chapter 5 100 MCQ + 20 CQ + 30 SQ = 150; five source MCQ + 145 original variants. DRAFT, not imported.')
