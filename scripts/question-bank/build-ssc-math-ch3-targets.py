"""SSC chapter 3: exact numeric target with immutable board seeds first.
Remaining questions are explicitly original parameterised practice, never board
or verbatim NCTB questions. No network, database, approval or deployment.
Dev dependency: sympy==1.14.0; PYTHONPATH=.cache/math-validation python3 ... [--check]
"""
import hashlib
import json
import sys
from collections import Counter
from itertools import combinations
from pathlib import Path
import sympy as S

ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'content/question-bank/ssc/math/chapter-3'
x=S.Symbol('x')
R=S.Rational

def L(v):return '$'+S.latex(S.sympify(v))+'$'
def latex(v):return S.latex(S.sympify(v))
def eq(a,b):assert S.simplify(a-b)==0,(a,b)
def H(q):return hashlib.sha256((q['type']+'\n'+q['text']).encode()).hexdigest()
seed=json.loads((BASE/'board-seed-v1.json').read_text())
rows=list(seed['items']);audit=[dict(origin='TRANSCRIBED_BOARD_COMPILATION',family='board-seed',variant=i+1,source=q['provenance']) for i,q in enumerate(rows)]

def put(kind,family,n,text,explanation,**extra):
    q=dict(type=kind,text=text,explanation=explanation,
        page=f'নিজস্ব অনুশীলনী; Ch3/{kind}/{family}/{n}; বোর্ড/বইয়ের অবিকল প্রশ্ন নয়',
        difficulty='HARD' if kind=='CQ' else 'MEDIUM',**extra)
    assert len(q['page'])<=100
    rows.append(q);audit.append(dict(origin='ORIGINAL_PARAMETERISED_PRACTICE_NOT_BOARD_OR_TEXTBOOK',family=family,variant=n))

def mcq(family,n,text,answer,why,wrong=None):
    answer=S.sympify(answer)
    candidates=[answer]+(list(wrong) if wrong is not None else [answer+1,answer-1,answer+2,answer+3])
    choices=[]
    for v in candidates:
        v=S.sympify(v)
        if not any(S.simplify(v-u)==0 for u in choices):choices.append(v)
        if len(choices)==4:break
    assert len(choices)==4,(family,n)
    shift=(len(family)+n)%4;choices=choices[shift:]+choices[:shift]
    key='ABCD'[next(i for i,v in enumerate(choices) if S.simplify(v-answer)==0)]
    put('MCQ',family,n,text,why+' সঠিক উত্তর '+L(answer)+'।',options={k:L(v) for k,v in zip('ABCD',choices)},correct=key)
    audit[-1].update(answerExpression=str(answer),choiceExpressions=[str(v) for v in choices],correct=key)

def cq(family,n,text,parts,checks):
    assert len(parts)==3 and checks
    for a,b in checks:eq(a,b)
    put('CQ',family,n,text,'উদ্দীপকের সব শর্ত ব্যবহার করে নিচে ক–খ–গ অংশের ধাপে ধাপে সমাধান দেওয়া হলো।',parts=[dict(label=l,marks=m,question=q,solution=sol) for l,m,(q,sol) in zip(['ক','খ','গ'],[2,4,4],parts)])
    audit[-1]['exactChecks']=[dict(lhs=str(a),rhs=str(b)) for a,b in checks]

def sq(family,n,text,solution,left,right):
    eq(left,right);put('SQ',family,n,text,solution)
    audit[-1]['exactChecks']=[dict(lhs=str(left),rhs=str(right))]

# 30 MCQ families. 29*10 + 4 = 294 new questions, plus six source MCQ.
for family in range(30):
 for n in range(1,11 if family<29 else 5):
    a=n+1;b=n+2;s=a+b;p=a*b;t=n+3
    if family==0:mcq('sum-square',n,rf'$a+b={s}$ এবং $ab={p}$ হলে $a^2+b^2$ কত?',a*a+b*b,rf'$a^2+b^2=(a+b)^2-2ab={s}^2-2\times{p}={a*a+b*b}$।')
    elif family==1:mcq('diff-square',n,rf'$u+v={s}$, $uv={p}$ হলে $(u-v)^2$ কত?',(a-b)**2,rf'$(u-v)^2=(u+v)^2-4uv={s}^2-4\times{p}=1$।')
    elif family==2:mcq('four-product',n,rf'$a+b={2*n+5}$ এবং $a-b=3$ হলে $4ab$ কত?',(2*n+5)**2-9,rf'$4ab=(a+b)^2-(a-b)^2=({2*n+5})^2-3^2$।')
    elif family==3:mcq('cube-sum',n,rf'$a+b={s}$ এবং $ab={p}$ হলে $a^3+b^3$ কত?',a**3+b**3,rf'$a^3+b^3=(a+b)^3-3ab(a+b)={s}^3-3\times{p}\times{s}$।')
    elif family==4:mcq('cube-diff',n,rf'$a-b={n+1}$ এবং $ab={n+2}$ হলে $a^3-b^3$ কত?',(n+1)**3+3*(n+2)*(n+1),rf'$a^3-b^3=(a-b)^3+3ab(a-b)=({n+1})^3+3({n+2})({n+1})$।')
    elif family==5:mcq('fourth-sum',n,rf'$a+b={s}$ এবং $ab={p}$ হলে $a^4+b^4$ কত?',a**4+b**4,rf'প্রথমে $a^2+b^2={s}^2-2\times{p}={a*a+b*b}$। এরপর $a^4+b^4=(a^2+b^2)^2-2a^2b^2=({a*a+b*b})^2-2({p})^2$।')
    elif family==6:mcq('recip-square',n,rf'$x+\frac1x={t}$, $x\ne0$ হলে $x^2+\frac1{{x^2}}$ কত?',t*t-2,rf'বর্গ করে মাঝের $2x(1/x)=2$ বাদ দিলে মান ${t}^2-2$।')
    elif family==7:mcq('recip-cube',n,rf'$x+\frac1x={t}$, $x\ne0$ হলে $x^3+\frac1{{x^3}}$ কত?',t**3-3*t,rf'ঘনের সূত্রে $x^3+x^{{-3}}=(x+x^{{-1}})^3-3(x+x^{{-1}})={t}^3-3\times{t}$।')
    elif family==8:mcq('recip-diff-square',n,rf'$x-\frac1x={t}$, $x\ne0$ হলে $x^2+\frac1{{x^2}}$ কত?',t*t+2,rf'$(x-x^{{-1}})^2=x^2+x^{{-2}}-2$। তাই চাওয়া মান ${t}^2+2$।')
    elif family==9:mcq('recip-diff-cube',n,rf'$x-\frac1x={t}$, $x\ne0$ হলে $x^3-\frac1{{x^3}}$ কত?',t**3+3*t,rf'$x^3-x^{{-3}}=(x-x^{{-1}})^3+3(x-x^{{-1}})={t}^3+3\times{t}$।')
    elif family==10:
        value=S.Mul(x+a,x+b,evaluate=False)
        mcq('factor-quadratic',n,rf'${latex(S.expand(value))}$-এর উৎপাদকরূপ কোনটি?',value,rf'মধ্যপদের সহগ ${a+b}$ এবং ধ্রুবক ${a*b}$। দুটি সংখ্যা ${a},{b}$-এর যোগ ও গুণফল এই শর্ত পূরণ করে।',[S.Mul(x-a,x-b,evaluate=False),S.Mul(x+a,x-b,evaluate=False),S.Mul(x-a,x+b,evaluate=False)])
    elif family==11:
        value=S.Mul(x-a,x+a,evaluate=False)
        mcq('factor-diff-square',n,rf'$x^2-{a*a}$-এর উৎপাদকরূপ কোনটি?',value,rf'এটি $x^2-{a}^2$; সূত্র $u^2-v^2=(u-v)(u+v)$।',[(x-a)**2,(x+a)**2,x*x+a*a])
    elif family==12:
        value=S.Mul(x+a,x*x-a*x+a*a,evaluate=False)
        mcq('factor-cube-sum',n,rf'$x^3+{a**3}$-এর উৎপাদকরূপ কোনটি?',value,rf'$u^3+v^3=(u+v)(u^2-uv+v^2)$-এ $v={a}$ বসাই।',[(x-a)*(x*x+a*x+a*a),(x+a)*(x*x+a*x+a*a),(x+a)*(x*x-a*x-a*a)])
    elif family==13:
        value=S.Mul(x-a,x*x+a*x+a*a,evaluate=False)
        mcq('factor-cube-diff',n,rf'$x^3-{a**3}$-এর উৎপাদকরূপ কোনটি?',value,rf'$u^3-v^3=(u-v)(u^2+uv+v^2)$-এ $v={a}$ বসাই।',[(x+a)*(x*x-a*x+a*a),(x-a)*(x*x-a*x+a*a),(x-a)*(x*x+a*x-a*a)])
    elif family==14:
        value=S.Mul(x+a,x*x-b*b,evaluate=False)
        mcq('factor-group',n,rf'${latex(S.expand(value))}$-এর উৎপাদকরূপ কোনটি?',value,rf'প্রথম দুই পদে $x^2$ এবং শেষ দুই পদে $-{b*b}$ সাধারণ নিলে $(x+{a})$ সাধারণ উৎপাদক হয়।',[(x-a)*(x*x-b*b),(x+a)*(x*x+b*b),(x-a)*(x*x+b*b)])
    elif family==15:
        value=S.Mul(x*x-2*a*x+2*a*a,x*x+2*a*x+2*a*a,evaluate=False)
        mcq('factor-fourth',n,rf'$x^4+{4*a**4}$-এর উৎপাদকরূপ কোনটি?',value,rf'$x^4+4({a})^4=(x^2+{2*a*a})^2-({2*a}x)^2$; বর্গের অন্তরের সূত্র প্রয়োগ করি।',[(x*x-2*a*x+a*a)*(x*x+2*a*x+a*a),(x*x+2*a*a)**2,(x*x-2*a*a)**2])
    elif family==16:
        F=x**3+n*x+1
        mcq('remainder-linear',n,rf'$P(x)=x^3+{n}x+1$-কে $(x-2)$ দ্বারা ভাগ করলে ভাগশেষ কত?',F.subs(x,2),rf'ভাগশেষ উপপাদ্যে ভাগশেষ $P(2)=8+2\times{n}+1$।')
    elif family==17:
        F=x**3+n*x*x+2*x+n
        mcq('remainder-scaled',n,rf'$P(x)=x^3+{n}x^2+2x+{n}$-কে $(2x-1)$ দ্বারা ভাগ করলে ধ্রুবক ভাগশেষ কত?',F.subs(x,R(1,2)),rf'$2x-1=0$-এর জন্য $x=1/2$। তাই ভাগশেষ $P(1/2)=1/8+{n}/4+1+{n}$।')
    elif family==18:mcq('root-parameter',n,rf'$x+{n+1}$ যদি $x^2+{n}x+k$-এর উৎপাদক হয়, তবে k কত?',-n-1,rf'$x=-{n+1}$ বসালে শূন্য হবে। তাই $({n+1})^2-{n}({n+1})+k=0$ থেকে $k=-{n+1}$।')
    elif family==19:
        F=(2*x+n)**3;ans=S.Poly(S.expand(F),x).coeff_monomial(x*x)
        mcq('cube-coefficient',n,rf'$(2x+{n})^3$ বিস্তৃত করলে $x^2$-এর সহগ কত?',ans,rf'$(u+v)^3=u^3+3u^2v+3uv^2+v^3$। $x^2$-যুক্ত পদ $3(2x)^2({n})={12*n}x^2$।')
    elif family==20:
        u=S.sqrt(n+2)+S.sqrt(n+1);v=S.sqrt(n+2)-S.sqrt(n+1)
        mcq('conjugate-product',n,rf'$(\sqrt{{{n+2}}}+\sqrt{{{n+1}}})(\sqrt{{{n+2}}}-\sqrt{{{n+1}}})$ এর মান কত?',1,rf'বর্গের অন্তরে মান $({n+2})-({n+1})=1$।')
    elif family==21:
        value=S.sqrt(n+2)-S.sqrt(n+1)
        mcq('conjugate-inverse',n,rf'$\frac1{{\sqrt{{{n+2}}}+\sqrt{{{n+1}}}}}$-এর হর মূলদ করলে কোন রূপ পাওয়া যায়?',value,rf'লব ও হরকে অনুবন্ধী দিয়ে গুণ করলে হর $({n+2})-({n+1})=1$ হয়।',[S.sqrt(n+2)+S.sqrt(n+1),-S.sqrt(n+2)+S.sqrt(n+1),2*value])
    elif family==22:
        mcq('cancel-domain',n,rf'$x\ne-{a}$ হলে $\frac{{x^2-{a*a}}}{{x+{a}}}$-এর সরল রূপ কোনটি?',x-a,rf'লব $(x-{a})(x+{a})$। অশূন্য সাধারণ উৎপাদক $x+{a}$ বাদ দিলে $x-{a}$; নিষিদ্ধ মান আগের মতোই থাকবে।',[x+a,-x-a,-x+a])
    elif family==23:mcq('distinct-factors',n,rf'$x^2+{2*n+1}x+{n*(n+1)}$-এর ভিন্ন একঘাত উৎপাদক কয়টি?',2,rf'উৎপাদক $(x+{n})(x+{n+1})$। {n} ও {n+1} ভিন্ন হওয়ায় দুটি ভিন্ন একঘাত উৎপাদক আছে।')
    elif family==24:mcq('product-middle',n,rf'$(x+{a})(x+{b})$ বিস্তারে x-এর সহগ কত?',a+b,rf'গুণ করে পাই $x^2+({a}+{b})x+{a*b}$। তাই সহগ ${a+b}$।')
    elif family==25:
        aa=n;bb=n+1;cc=-2*n-1;prod=aa*bb*cc
        mcq('three-zero-sum',n,rf'$a+b+c=0$ এবং $abc={prod}$ হলে $a^3+b^3+c^3$ কত?',3*prod,rf'$a^3+b^3+c^3-3abc=(a+b+c)(a^2+b^2+c^2-ab-bc-ca)=0$। তাই মান $3abc=3({prod})$।')
    elif family==26:
        aa=n;bb=n+1;cc=n+2;sumprod=aa*bb+bb*cc+cc*aa
        mcq('three-square-gap',n,rf'$ab+bc+ca={sumprod}$ হলে $(a+b+c)^2-a^2-b^2-c^2$ কত?',2*sumprod,rf'তিন রাশির বর্গের সূত্রে বাকি থাকে $2(ab+bc+ca)=2\times{sumprod}$।')
    elif family==27:
        aa=n+1;bb=2;s=aa+bb;ss=aa*aa+bb*bb
        mcq('sum-square-to-cube',n,rf'$a+b={s}$ ও $a^2+b^2={ss}$ হলে $a^3+b^3$ কত?',aa**3+bb**3,rf'প্রথমে $ab=(({s})^2-{ss})/2={aa*bb}$। এরপর ঘনের সূত্রে $a^3+b^3=({s})^3-3({aa*bb})({s})$।')
    elif family==28:mcq('fourth-coefficient',n,rf'$(x+{n})^4$ বিস্তৃত করলে $x^3$-এর সহগ কত?',4*n,rf'$(x+{n})^4=((x+{n})^2)^2$। চারটি গুণকের মধ্যে একটিতে ধ্রুবক {n} ও অন্য তিনটিতে x নিলে $4\times{n}={4*n}$ সহগ হয়।')
    else:mcq('excluded-positive',n,rf'$\frac{{x+1}}{{x^2-{a*a}}}$ রাশিটির জন্য x-এর কোন ধনাত্মক মান নিষিদ্ধ?',a,rf'হর $(x-{a})(x+{a})$ শূন্য হয় $x=\pm{a}$-এ। এদের ধনাত্মকটি ${a}$।')

# 15 CQ families, ten variants each except last nine = 149 + one source CQ.
for n in range(1,11):
 a=n+1;b=n+2;s=a+b;p=a*b;t=n+3
 cq('sum-product',n,rf'$a+b={s}$ এবং $ab={p}$।',[
  ('a²+b² নির্ণয় কর।',rf'$a^2+b^2=(a+b)^2-2ab={s}^2-2({p})={a*a+b*b}$।'),
  ('a³+b³-এর মান সূত্র ব্যবহার করে নির্ণয় কর।',rf'$(a+b)^3=a^3+b^3+3ab(a+b)$। তাই $a^3+b^3={s}^3-3({p})({s})={a**3+b**3}$।'),
  ('a⁴+b⁴ নির্ণয় করে (a−b)²-এর সঙ্গে প্রথম শর্তের সামঞ্জস্য যাচাই কর।',rf'$a^4+b^4=(a^2+b^2)^2-2(ab)^2=({a*a+b*b})^2-2({p})^2={a**4+b**4}$। আবার $(a-b)^2=({s})^2-4({p})=1\ge0$; বাস্তব a,b-এর সঙ্গে শর্ত সামঞ্জস্যপূর্ণ।')],[(s*s-2*p,a*a+b*b),(s**3-3*p*s,a**3+b**3),((a*a+b*b)**2-2*p*p,a**4+b**4)])
 d=n+1;p=n+2;ss=d*d+2*p
 cq('difference-product',n,rf'$a-b={d}$ এবং $ab={p}$।',[
  ('a²+b² নির্ণয় কর।',rf'$(a-b)^2=a^2+b^2-2ab$। তাই $a^2+b^2={d}^2+2({p})={ss}$।'),
  ('a³−b³-এর মান নির্ণয় কর।',rf'$a^3-b^3=(a-b)(a^2+ab+b^2)={d}({ss}+{p})={d*(ss+p)}$।'),
  ('a⁴+b⁴ ও (a+b)² নির্ণয় করে সব ফল মূল শর্তের সঙ্গে মেলাও।',rf'$a^4+b^4=({ss})^2-2({p})^2={ss*ss-2*p*p}$। $(a+b)^2=(a-b)^2+4ab={d*d+4*p}$। এটি অঋণাত্মক; এখান থেকে $a^2+b^2=((a+b)^2+(a-b)^2)/2={ss}$, যা ক অংশের সমান।')],[(d*(ss+p),d**3+3*p*d),(R(d*d+4*p+d*d,2),ss)])
 t=n+3;s2=t*t-2;s3=t**3-3*t;s4=t**4-4*t*t+2;s5=t**5-5*t**3+5*t
 cq('reciprocal-sum',n,rf'$x+\frac1x={t}$, $x\ne0$।',[
  (r'$x^2+x^{-2}$ নির্ণয় কর।',rf'বর্গ করে $x^2+x^{{-2}}+2={t}^2$। তাই মান ${s2}$।'),
  (r'$x^3+x^{-3}$ ও $x^4+x^{-4}$ নির্ণয় কর।',rf'ঘনের সূত্রে $x^3+x^{{-3}}={t}^3-3({t})={s3}$। আবার $(x^2+x^{{-2}})^2-2={s2}^2-2={s4}$।'),
  (r'$x^5+x^{-5}$ নির্ণয় করে ব্যবহৃত পুনরাবৃত্ত সূত্র দেখাও।',rf'$s_k=x^k+x^{{-k}}$ ধরলে $(x+x^{{-1}})s_{{k-1}}=s_k+s_{{k-2}}$। তাই $s_5={t}s_4-s_3={t}({s4})-{s3}={s5}$। সব ধাপে $x\ne0$ প্রয়োজন।')],[(s2*s2-2,s4),(t*s4-s3,s5)])
 t=n+2
 cq('reciprocal-diff',n,rf'$x-\frac1x={t}$, $x\ne0$।',[
  (r'$x^2+x^{-2}$ নির্ণয় কর।',rf'বর্গ করলে $x^2+x^{{-2}}-2={t}^2$। তাই মান ${t*t+2}$।'),
  (r'$x^3-x^{-3}$ নির্ণয় কর।',rf'$x^3-x^{{-3}}=(x-x^{{-1}})^3+3(x-x^{{-1}})={t}^3+3({t})={t**3+3*t}$।'),
  (r'$x^4+x^{-4}$ ও $(x+x^{-1})^2$ নির্ণয় কর।',rf'$x^4+x^{{-4}}=({t*t+2})^2-2={(t*t+2)**2-2}$। আবার $(x+x^{{-1}})^2=x^2+x^{{-2}}+2={t*t+4}$। x-এর চিহ্ন না জেনে এই বর্গ থেকে নির্বিচারে শুধু ধনাত্মক মূল নেওয়া যাবে না।')],[((t*t+2)**2-2,t**4+4*t*t+2)])
 r=n+2;u=S.sqrt(r)+S.sqrt(r-1);v=S.sqrt(r)-S.sqrt(r-1);T=2*S.sqrt(r)
 cq('conjugate-powers',n,rf'$u=\sqrt{{{r}}}+\sqrt{{{r-1}}}$ এবং $v=\sqrt{{{r}}}-\sqrt{{{r-1}}}$।',[
  ('uv এবং u+v নির্ণয় কর।',rf'$uv={r}-({r-1})=1$ এবং $u+v=2\sqrt{{{r}}}$।'),
  ('u²+v² ও u³+v³ নির্ণয় কর।',rf'$u^2+v^2=(u+v)^2-2uv={4*r-2}$। $u^3+v^3=(u+v)^3-3uv(u+v)={latex(S.simplify(T**3-3*T))}$।'),
  ('u⁵+v⁵ নির্ণয় করে অনুবন্ধীর সুবিধা ব্যাখ্যা কর।',rf'$uv=1$ হওয়ায় $u^5+v^5=(u+v)^5-5(u+v)^3+5(u+v)$। তাই মান ${latex(S.simplify(T**5-5*T**3+5*T))}$। গুণফল ১ হওয়ায় সব মিশ্র পদ শুধু $u+v$ দিয়ে প্রকাশ করা যায়।')],[(u*v,1),(u**3+v**3,T**3-3*T),(u**5+v**5,T**5-5*T**3+5*T)])
 a=n;b=n+2;F=(x+a)*(x+b)
 cq('quadratic-factor',n,rf'$P(x)={latex(S.expand(F))}$।',[
  ('P(1) নির্ণয় কর।',rf'$x=1$ বসালে $P(1)=1+{a+b}+{a*b}={(1+a)*(1+b)}$।'),
  ('পূর্ণবর্গে পরিণত করে P(x)-কে উৎপাদকে বিশ্লেষণ কর।',rf'$P(x)=(x+{n+1})^2-1$। তাই বর্গের অন্তরে $P(x)=(x+{n})(x+{n+2})$।'),
  (r'$P(x+1)-P(x)$ সরল করে $P(x)/(x+'+str(n)+r')$-এর সংজ্ঞার শর্তসহ সরল রূপ লেখ।',rf'বিস্তার করে বিয়োগে $P(x+1)-P(x)=2x+{2*n+3}$। আবার $P(x)/(x+{n})=x+{n+2}$, তবে মূল ভাগফলে $x\ne-{n}$; বাতিলের পরেও এই শর্ত থাকবে।')],[(S.expand(F), (x+n+1)**2-1),(F.subs(x,x+1)-F,2*x+2*n+3),(S.cancel(F/(x+n)),x+n+2)])
 a=n+1;F=x**3-a**3
 cq('cube-difference',n,rf'$P(x)=x^3-{a**3}$।',[
  (rf'$P({a})$ নির্ণয় করে একটি উৎপাদক চিহ্নিত কর।',rf'$P({a})={a}^3-{a**3}=0$। উৎপাদক উপপাদ্যে $(x-{a})$ একটি উৎপাদক।'),
  ('P(x)-কে পূর্ণ উৎপাদকরূপে লিখে বিস্তার করে যাচাই কর।',rf'$P(x)=(x-{a})(x^2+{a}x+{a*a})$। গুণ করলে মাঝের $x^2$ ও x-যুক্ত পদ কাটাকাটি হয়ে $x^3-{a**3}$ পাওয়া যায়।'),
  (rf'$P(x)/(x-{a})$-এর সরল রূপ, নিষিদ্ধ মান এবং $x=-{a}$-এ মান নির্ণয় কর।',rf'সরল রূপ $x^2+{a}x+{a*a}$, শর্ত $x\ne{a}$। $x=-{a}$ বৈধ এবং মান ${a*a}-{a*a}+{a*a}={a*a}$। নিষিদ্ধ মান বসিয়ে সরল রূপের মানকে মূল ভাগফলের মান বলা যাবে না।')],[(F,(x-a)*(x*x+a*x+a*a)),(S.cancel(F/(x-a)),x*x+a*x+a*a)])
 a=n+2;F=x**3+a**3
 cq('cube-addition',n,rf'$Q(x)=x^3+{a**3}$।',[
  (rf'$Q(-{a})$ নির্ণয় করে একটি উৎপাদক লেখ।',rf'$Q(-{a})=(-{a})^3+{a**3}=0$। তাই $(x+{a})$ একটি উৎপাদক।'),
  ('যোগের ঘনের সূত্র দিয়ে Q(x)-কে উৎপাদকে বিশ্লেষণ কর।',rf'$Q(x)=(x+{a})(x^2-{a}x+{a*a})$। বিস্তারে $x^2$ ও x-এর মিশ্র পদ বিলুপ্ত হয়ে মূল রাশি মেলে।'),
  (rf'$Q(x)/(x+{a})$-কে সরল করে $x={2*a}$-এ মান নির্ণয় কর; সংজ্ঞার শর্তও লেখ।',rf'$x\ne-{a}$ হলে রাশিটি $x^2-{a}x+{a*a}$। বৈধ $x={2*a}$ বসালে ${4*a*a}-{2*a*a}+{a*a}={3*a*a}$। মূল ভাগফলের নিষিদ্ধ মান $-{a}$ অপরিবর্তিত থাকবে।')],[(F,(x+a)*(x*x-a*x+a*a)),(S.cancel(F/(x+a)),x*x-a*x+a*a)])
 a=n+3;b=n+1;F=(x+a)*(x*x-b*b)
 cq('grouping-cubic',n,rf'$P(x)={latex(S.expand(F))}$।',[
  ('প্রথম দুই পদ ও শেষ দুই পদ গুচ্ছ করে একটি সাধারণ উৎপাদক বের কর।',rf'$P(x)=x^2(x+{a})-{b*b}(x+{a})$; সাধারণ উৎপাদক $(x+{a})$।'),
  ('P(x)-কে একঘাত উৎপাদকের গুণফল হিসেবে প্রকাশ কর।',rf'$P(x)=(x+{a})(x^2-{b*b})=(x+{a})(x-{b})(x+{b})$। তিনটি একঘাত উৎপাদক পাওয়া গেল।'),
  (rf'$P(x)/(x+{a})$ সরল করে $x>{a}$ হলে $P(x)>0$ কেন দেখাও।',rf'$x\ne-{a}$ হলে ভাগফল $x^2-{b*b}$। আবার $x>{a}>{b}>0$ হলে $x+{a}$, $x-{b}$ ও $x+{b}$—সব ধনাত্মক। তাই তাদের গুণফল $P(x)>0$।')],[(S.expand(F),x*x*(x+a)-b*b*(x+a)),(F,(x+a)*(x-b)*(x+b)),(S.cancel(F/(x+a)),x*x-b*b)])
 a=n+1;k=2-a;F=x**3+k*x*x+(3-2*a)*x-3*a
 cq('root-coefficient',n,rf'$P(x)=x^3+kx^2+({3-2*a})x-{3*a}$ এবং $(x-{a})$ একটি উৎপাদক।',[
  ('উৎপাদক উপপাদ্যে k নির্ণয় কর।',rf'$P({a})=0$ থেকে ${a**3}+{a*a}k+({3-2*a})({a})-{3*a}=0$। সরল করলে ${a*a}k={a*a*(a-2)*-1}$; তাই $k={k}$।'),
  ('k-এর মান বসিয়ে P(x)-কে (x−'+str(a)+') দ্বারা ভাগ করে ভাগফল নির্ণয় কর।',rf'সহগ ধরে বা দীর্ঘ ভাগে $P(x)=(x-{a})(x^2+2x+3)$। অতএব ভাগফল $x^2+2x+3$ এবং ভাগশেষ ০।'),
  (rf'$P(x)$-কে $(x+{a})$ দ্বারা ভাগ করলে ভাগশেষ কত? দুটি পদ্ধতিতে যাচাই কর।',rf'ভাগশেষ $P(-{a})=(-{a}-{a})(({a})^2-2({a})+3)={-2*a*(a*a-2*a+3)}$। মূল বিস্তৃত রাশিতেও $x=-{a}$ বসালে একই মান পাওয়া যায়। তাই এটি অন্য উৎপাদকের ভাগশেষের সঙ্গে গুলিয়ে শূন্য করা যাবে না।')],[(F,(x-a)*(x*x+2*x+3)),(F.subs(x,-a),-2*a*(a*a-2*a+3))])
 a=n+1;pp=-(a*a+1);qq=a;F=x**3+pp*x+qq
 cq('two-remainders',n,rf'$P(x)=x^3+px+q$ এবং $P({a})=0$, $P(-{a})={2*a}$।',[
  ('দুই শর্ত থেকে q নির্ণয় কর।',rf'সমীকরণ দুটি যোগ করলে $2q={2*a}$; তাই $q={a}$।'),
  ('p নির্ণয় করে P(x)-এর একটি উৎপাদক ও ভাগফল নির্ণয় কর।',rf'$P({a})=0$-এ q বসালে ${a**3}+{a}p+{a}=0$; তাই $p=-({a*a}+1)={pp}$। উৎপাদক $(x-{a})$ এবং $P(x)=(x-{a})(x^2+{a}x-1)$; ভাগফল $x^2+{a}x-1$।'),
  ('P(x)-কে (x−1) দ্বারা ভাগ করলে ভাগশেষ নির্ণয় করে মূল দুই শর্ত যাচাই কর।',rf'ভাগশেষ $P(1)=1+({pp})+{a}={a-a*a}$। আবার $P({a})=0$ এবং $P(-{a})={2*a}$ সরাসরি বসিয়ে মেলে; তাই নির্ণীত p,q উভয় শর্ত পূরণ করে।')],[(F,(x-a)*(x*x+a*x-1)),(F.subs(x,a),0),(F.subs(x,-a),2*a),(F.subs(x,1),a-a*a)])
 a=n;b=n+1;c=n+2;t=a+b+c;p=a*b+b*c+c*a;r=a*b*c;ss=a*a+b*b+c*c
 cq('three-symmetric',n,rf'$a+b+c={t}$, $ab+bc+ca={p}$ এবং $abc={r}$।',[
  ('a²+b²+c² নির্ণয় কর।',rf'$(a+b+c)^2=a^2+b^2+c^2+2(ab+bc+ca)$। তাই চাওয়া মান ${t}^2-2({p})={ss}$।'),
  ('a³+b³+c³ নির্ণয় কর।',rf'$a^3+b^3+c^3=(a+b+c)^3-3(a+b+c)(ab+bc+ca)+3abc$। তাই মান ${t}^3-3({t})({p})+3({r})={a**3+b**3+c**3}$।'),
  ('a³+b³+c³−3abc-কে দুটি রাশির গুণফলে প্রকাশ করে মান যাচাই কর।',rf'সূত্রে রাশিটি $(a+b+c)(a^2+b^2+c^2-ab-bc-ca)$। মান ${t}({ss}-{p})={3*t}$। খ অংশ থেকে ${a**3+b**3+c**3}-3({r})={3*t}$; দুই ফল সমান।')],[(t*t-2*p,ss),(t**3-3*t*p+3*r,a**3+b**3+c**3),(t*(ss-p),a**3+b**3+c**3-3*r)])
 a=n+1;F=x**4+(2*a-1)*x*x+a*a;den=x*x+x+a
 cq('quartic-square',n,rf'$P(x)=x^4+{2*a-1}x^2+{a*a}$।',[
  ('P(0) ও P(1) নির্ণয় কর।',rf'$P(0)={a*a}$ এবং $P(1)=1+{2*a-1}+{a*a}={a*a+2*a}$।'),
  ('একটি বর্গ যোগ-বিয়োগ করে P(x)-কে উৎপাদকে বিশ্লেষণ কর।',rf'$P(x)=(x^2+{a})^2-x^2=(x^2+x+{a})(x^2-x+{a})$। বর্গের অন্তরের সূত্রে এই গুণফল পাওয়া যায়।'),
  (rf'$P(x)/(x^2+x+{a})$ সরল কর এবং সব বাস্তব x-এ সংজ্ঞায়িত কি না দেখাও।',rf'সরল রূপ $x^2-x+{a}$। মূল হর $x^2+x+{a}=(x+1/2)^2+{latex(R(4*a-1,4))}>0$ সব বাস্তব x-এ। তাই কোনো বাস্তব নিষিদ্ধ মান নেই এবং সাধারণ উৎপাদক বাতিল করা বৈধ।')],[(F,(x*x+x+a)*(x*x-x+a)),(S.cancel(F/den),x*x-x+a),(den,(x+R(1,2))**2+R(4*a-1,4))])
 a=n+2;F=x*x-a*a;G=(x+a)*(x+a+1);sol=3*a+1
 cq('fraction-domain',n,rf'$R(x)=\frac{{x^2-{a*a}}}{{{latex(S.expand(G))}}}$।',[
  ('লবকে উৎপাদকে বিশ্লেষণ কর।',rf'$x^2-{a*a}=(x-{a})(x+{a})$।'),
  ('হরকে উৎপাদকে বিশ্লেষণ করে R(x) সরল কর এবং সব নিষিদ্ধ মান লেখ।',rf'হর $(x+{a})(x+{a+1})$। তাই $R(x)=(x-{a})/(x+{a+1})$; মূল শর্ত $x\ne-{a}$ ও $x\ne-{a+1}$। প্রথম নিষিদ্ধ মানটি সাধারণ উৎপাদক বাদ গেলেও বহাল থাকে।'),
  ('R(x)=1/2 হলে x নির্ণয় করে মূল রাশিতে যাচাই কর।',rf'$2(x-{a})=x+{a+1}$ থেকে $x={sol}$। এটি কোনো নিষিদ্ধ মান নয়। মূল লব-হরে বসিয়ে মান ${latex(S.cancel((F/G).subs(x,sol)))}$ মেলে, তাই সমাধান বৈধ।')],[(F,(x-a)*(x+a)),(S.cancel(F/G),(x-a)/(x+a+1)),((F/G).subs(x,sol),R(1,2))])
 if n<10:
    a=n+2
    cq('error-analysis',n,rf'মিতা দাবি করে, $(x+{a})^2=x^2+{a*a}$। রবি বলে, মাঝের একটি পদ বাদ পড়েছে।',[
      ('বর্গের সূত্রে (x+'+str(a)+')² বিস্তার কর।',rf'$(x+{a})^2=x^2+{2*a}x+{a*a}$। বাদ পড়া পদ ${2*a}x$।'),
      ('x=1 বসিয়ে মিতার দাবি পরীক্ষা কর এবং দাবিটি কখন সত্য হয় নির্ণয় কর।',rf'$x=1$-এ বামপক্ষ ${(a+1)**2}$, ডানপক্ষ ${1+a*a}$, যা অসমান। সমতার জন্য ${2*a}x=0$ হতে হবে; ${a}\ne0$ বলে শুধু $x=0$-এ দাবি মেলে।'),
      (rf'$\frac{{(x+{a})^2-(x-{a})^2}}{{4x}}$ সরল করে শর্তসহ ফল দেখাও।',rf'লব বিস্তারে ${4*a}x$। তাই $x\ne0$ হলে ভাগফল ${4*a}x/(4x)={a}$। বাতিলের পরে ধ্রুবক পাওয়া গেলেও মূল রাশিতে $x=0$ সংজ্ঞায়িত নয়।')],[((x+a)**2,x*x+2*a*x+a*a),(S.cancel(((x+a)**2-(x-a)**2)/(4*x)),a)])

# Twenty SQ skills, five variants each = 100 complete answers.
for n in range(1,6):
 a=n+1;b=n+2
 sq('expand-square',n,rf'$(x+{a})^2$ বিস্তার কর।',rf'$(u+v)^2=u^2+2uv+v^2$। তাই $(x+{a})^2=x^2+{2*a}x+{a*a}$।',(x+a)**2,x*x+2*a*x+a*a)
 sq('expand-diff-square',n,rf'$(2x-{a})^2$ বিস্তার কর।',rf'$(u-v)^2=u^2-2uv+v^2$। তাই $(2x-{a})^2=4x^2-{4*a}x+{a*a}$।',(2*x-a)**2,4*x*x-4*a*x+a*a)
 sq('expand-cube',n,rf'$(x+{a})^3$ বিস্তার কর।',rf'ঘনের সূত্রে $x^3+{3*a}x^2+{3*a*a}x+{a**3}$ পাওয়া যায়।',(x+a)**3,x**3+3*a*x*x+3*a*a*x+a**3)
 sq('expand-minus-cube',n,rf'$(x-{a})^3$ বিস্তার কর।',rf'$(u-v)^3=u^3-3u^2v+3uv^2-v^3$। তাই ফল $x^3-{3*a}x^2+{3*a*a}x-{a**3}$।',(x-a)**3,x**3-3*a*x*x+3*a*a*x-a**3)
 sq('factor-square',n,rf'$x^2-{a*a}$ উৎপাদকে বিশ্লেষণ কর।',rf'${a*a}={a}^2$। বর্গের অন্তর সূত্রে $(x-{a})(x+{a})$।',x*x-a*a,(x-a)*(x+a))
 sq('factor-quadratic',n,rf'$x^2+{a+b}x+{a*b}$ উৎপাদকে বিশ্লেষণ কর।',rf'${a}+{b}={a+b}$ এবং ${a}\times{b}={a*b}$। মধ্যপদ ভেঙে $(x+{a})(x+{b})$ পাওয়া যায়।',x*x+(a+b)*x+a*b,(x+a)*(x+b))
 sq('factor-cube-plus',n,rf'$x^3+{a**3}$ উৎপাদকে বিশ্লেষণ কর।',rf'ঘনের যোগের সূত্রে $(x+{a})(x^2-{a}x+{a*a})$।',x**3+a**3,(x+a)*(x*x-a*x+a*a))
 sq('factor-cube-minus',n,rf'$x^3-{a**3}$ উৎপাদকে বিশ্লেষণ কর।',rf'ঘনের অন্তরের সূত্রে $(x-{a})(x^2+{a}x+{a*a})$।',x**3-a**3,(x-a)*(x*x+a*x+a*a))
 F=(x+a)*(x*x-b)
 sq('factor-grouping',n,rf'${latex(S.expand(F))}$ উৎপাদকে বিশ্লেষণ কর।',rf'গুচ্ছ করে $x^2(x+{a})-{b}(x+{a})=(x+{a})(x^2-{b})$।',S.expand(F),(x+a)*(x*x-b))
 F=x**4+(2*a-1)*x*x+a*a
 sq('factor-quartic',n,rf'$x^4+{2*a-1}x^2+{a*a}$ উৎপাদকে বিশ্লেষণ কর।',rf'রাশিটি $(x^2+{a})^2-x^2$। তাই উৎপাদক $(x^2+x+{a})(x^2-x+{a})$।',F,(x*x+x+a)*(x*x-x+a))
 F=x**3+a*x+b
 sq('remainder',n,rf'$P(x)=x^3+{a}x+{b}$-কে $(x-1)$ দ্বারা ভাগ করলে ভাগশেষ কত?',rf'ভাগশেষ উপপাদ্যে $P(1)=1+{a}+{b}={1+a+b}$।',F.subs(x,1),1+a+b)
 F=x*x+a*x+b
 sq('scaled-remainder',n,rf'$P(x)=x^2+{a}x+{b}$-কে $(2x-1)$ দ্বারা ভাগ করলে ভাগশেষ কত?',rf'$2x-1=0$ হলে $x=1/2$। ভাগশেষ $P(1/2)=1/4+{a}/2+{b}={latex(R(1,4)+R(a,2)+b)}$।',F.subs(x,R(1,2)),R(1,4)+R(a,2)+b)
 k=-a*a-a
 sq('factor-constant',n,rf'$(x-{a})$ যদি $x^2+x+k$-এর উৎপাদক হয়, k নির্ণয় কর।',rf'উৎপাদক শর্তে ${a}^2+{a}+k=0$। তাই $k=-({a*a}+{a})={k}$।',a*a+a+k,0)
 sq('factor-coefficient',n,rf'$x+{a}$ যদি $x^2+kx+{a*(a+1)}$-এর উৎপাদক হয়, k নির্ণয় কর।',rf'$x=-{a}$ বসালে ${a*a}-{a}k+{a*(a+1)}=0$। তাই $k={2*a+1}$।',a*a-a*(2*a+1)+a*(a+1),0)
 sq('cancel-with-domain',n,rf'$\frac{{x^2-{a*a}}}{{x+{a}}}$ সরল করে নিষিদ্ধ মান লেখ।',rf'লব $(x-{a})(x+{a})$। তাই সরল রূপ $x-{a}$; শর্ত $x\ne-{a}$।',S.cancel((x*x-a*a)/(x+a)),x-a)
 u=S.sqrt(n+2)+S.sqrt(n+1);v=S.sqrt(n+2)-S.sqrt(n+1)
 sq('conjugate',n,rf'$(\sqrt{{{n+2}}}+\sqrt{{{n+1}}})(\sqrt{{{n+2}}}-\sqrt{{{n+1}}})$ সরল কর।',rf'বর্গের অন্তর $({n+2})-({n+1})=1$।',u*v,1)
 sq('rationalise',n,rf'$\frac1{{\sqrt{{{n+2}}}+\sqrt{{{n+1}}}}}$-এর হর মূলদ কর।',rf'অনুবন্ধী দিয়ে লব-হর গুণ করলে হর ১। তাই ফল $\sqrt{{{n+2}}}-\sqrt{{{n+1}}}$।',1/u,v)
 t=n+3
 sq('reciprocal-square',n,rf'$x+\frac1x={t}$, $x\ne0$ হলে $x^2+\frac1{{x^2}}$ নির্ণয় কর।',rf'বর্গে $x^2+x^{{-2}}+2={t}^2$। তাই চাওয়া মান ${t*t-2}$।',(x+1/x)**2-2,x*x+x**-2)
 sq('reciprocal-cube',n,rf'$x-\frac1x={t}$, $x\ne0$ হলে $x^3-\frac1{{x^3}}$ নির্ণয় কর।',rf'ঘনের সূত্রে $x^3-x^{{-3}}=(x-x^{{-1}})^3+3(x-x^{{-1}})={t**3+3*t}$।',(x-1/x)**3+3*(x-1/x),x**3-x**-3)
 aa=n;bb=n+1;cc=-2*n-1;p=aa*bb*cc
 sq('three-cubes',n,rf'$a+b+c=0$ ও $abc={p}$ হলে $a^3+b^3+c^3$ নির্ণয় কর।',rf'তিন ঘনের সূত্রে $a^3+b^3+c^3-3abc=0$। তাই চাওয়া মান $3abc={3*p}$।',aa**3+bb**3+cc**3,3*p)

# Final invariants and provenance. Do not mutate prior source snapshots.
counts={k:sum(q['type']==k for q in rows) for k in ['MCQ','CQ','SQ']}
assert counts==dict(MCQ=300,CQ=150,SQ=100),counts
assert len({q['text'] for q in rows})==550
for q,meta in zip(rows,audit):
 meta['questionSha256']=H(q)
 if 'answerExpression' in meta:
    answer=S.sympify(meta['answerExpression']);choices=[S.sympify(v) for v in meta['choiceExpressions']]
    assert [k for k,v in zip('ABCD',choices) if S.simplify(v-answer)==0]==[q['correct']]
    assert all(S.simplify(a-b)!=0 for a,b in combinations(choices,2))

scope={k:v for k,v in seed.items() if k!='items'}
scope.update(book='Proshnobook — যাচাইকৃত বোর্ড সংকলন + নিজস্ব বীজগাণিতিক অনুশীলনী',edition='Chapter 3 target v1; DRAFT; স্বাধীন শিক্ষক অনুমোদন বাকি',sourceUrl='https://github.com/saifulsirictdev/Proshnobook_com')

def emit(path,obj):
 text=json.dumps(obj,ensure_ascii=False,indent=2)+'\n'
 if '--check' in sys.argv:assert path.read_text()==text,f'Stale {path}'
 else:path.parent.mkdir(parents=True,exist_ok=True);path.write_text(text)
 return dict(file=str(path.relative_to(BASE)),bytes=len(text.encode()),sha256=hashlib.sha256(text.encode()).hexdigest())

mcqs=[q for q in rows if q['type']=='MCQ'];cqs=[q for q in rows if q['type']=='CQ'];sqs=[q for q in rows if q['type']=='SQ']
metaByObject={id(q):m for q,m in zip(rows,audit)}
files=[]
for name,items in [('mcq-1',mcqs[:200]),('mcq-2',mcqs[200:]),('cq',cqs),('sq',sqs)]:
 assert 0<len(items)<=200
 for i,q in enumerate(items,1):metaByObject[id(q)].update(file=f'target-v1/{name}.json',itemInFile=i)
 files.append(emit(BASE/f'target-v1/{name}.json',{**scope,'items':items}))
sourceCounts={k:sum(q['type']==k for q in seed['items']) for k in counts}
limitations=['Numeric target met using 7 reviewed board-compilation seeds and 543 original parameterised practice items; not 550 distinct concepts.',
 'Independent teacher review pending. All original rows are explicitly marked; none is attributed to a board or claimed as a verbatim NCTB exercise.',
 'Full board-source search and chapter audit are not complete. Full current-edition NCTB chapter was not obtained/read. Source preference was not exhaustively fulfilled.',
 'Exact symbolic/answer checks and strict importer compatibility do not prove full semantic or independent human approval.',
 'No database import, approved stock, deployment or live receipt. Previous source seed files/backups remain unchanged.']
review=dict(status='NUMERICAL_TARGET_MET_DRAFT_TEACHER_REVIEW_PENDING_NOT_IMPORTED',targetMet=True,teacherApproved=False,
 targetCounts=counts,counts=counts,remaining=dict(MCQ=0,CQ=0,SQ=0),boardCounts=sourceCounts,
 originalPracticeCounts={k:counts[k]-sourceCounts[k] for k in counts},
 importedCounts=dict(MCQ=0,CQ=0,SQ=0),databaseCountVerified=False,
 boardSearchExhaustive=False,fullChapterTextbookRead=False,
 originalSourcePreference=['board-paper','NCTB-textbook','other-online-source'],
 files=files,limitations=limitations,
 familyCounts={k:dict(sorted(Counter(m['family'] for q,m in zip(rows,audit) if q['type']==k and m['origin'].startswith('ORIGINAL')).items())) for k in counts},
 itemReviews=audit)
reviewFile=emit(BASE/'target-v1/validation.json',review)
emit(BASE/'targets-v1-manifest.json',dict(status=review['status'],chapter=3,category=scope['category'],subject=scope['subject'],topic=scope['topic'],
 counts=counts,boardCounts=sourceCounts,originalPracticeCounts=review['originalPracticeCounts'],teacherApproved=False,
 importedCounts=review['importedCounts'],files=files,validation=reviewFile,limitations=limitations))
print('PASS: chapter 3 exact target 300 MCQ + 150 CQ + 100 SQ = 550; 7 immutable source items + 543 original variants. DRAFT, NOT IMPORTED.')
