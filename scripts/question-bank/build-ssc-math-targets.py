"""Build exact owner quotas, retaining immutable reviewed board seeds first.
Remaining items are ORIGINAL parameterised practice, NOT attributed to any board,
NCTB exercise or internet author. No network, credentials or database operations.
Requires sympy (dev-only): PYTHONPATH=.cache/math-validation python3 ... [--check]
"""
import hashlib
import json
import math
import sys
from collections import Counter
from itertools import combinations, product
from pathlib import Path
import sympy as S

ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'content/question-bank/ssc/math'
REF='https://pi-mathematics.blogspot.com/2022/10/ssc9-10-general-math-solution.html'
OWN='https://github.com/saifulsirictdev/Proshnobook_com'
x=S.Symbol('x', real=True)

def L(v): return '$'+S.latex(S.sympify(v))+'$'
def E(v): return str(S.sympify(v))
def st(values):
    vals=sorted(values)
    return r'\varnothing' if not vals else r'\{'+','.join(map(str,vals))+r'\}'
def P(values):
    vals=sorted(values)
    return [set(c) for n in range(len(vals)+1) for c in combinations(vals,n)]
def ps(values):return r'\{'+', '.join(st(v) for v in P(values))+r'\}'
def pairs(values):return r'\{'+','.join(f'({a},{b})' for a,b in sorted(values))+r'\}'
def eq(a,b):assert S.simplify(a-b)==0,(a,b)

def emit(path,obj):
    text=json.dumps(obj,ensure_ascii=False,indent=2)+'\n'
    if '--check' in sys.argv:assert path.read_text()==text,f'Stale {path}'
    else:path.parent.mkdir(parents=True,exist_ok=True);path.write_text(text)
    return dict(file=str(path.relative_to(BASE)),bytes=len(text.encode()),sha256=hashlib.sha256(text.encode()).hexdigest())

class Bank:
    def __init__(self,ch):
        self.ch=ch;self.rows=[];self.audit=[]
        seed=json.loads((BASE/f'chapter-{ch}/board-seed-v1.json').read_text())
        self.scope={k:v for k,v in seed.items() if k!='items'}
        self.seeds=seed['items'];self.rows.extend(self.seeds)
        for i,q in enumerate(self.seeds):self.audit.append(dict(item=i+1,origin='TRANSCRIBED_BOARD_COMPILATION',source=q['provenance'],family='board-seed',variant=i+1))
    def put(self,kind,fam,n,text,explanation,**extra):
        assert text and explanation
        page=f'নিজস্ব অনুশীলনী; Ch{self.ch}/{kind}/{fam}/{n}; বোর্ড/বইয়ের অবিকল প্রশ্ন নয়'
        assert len(page)<=100,page
        q=dict(type=kind,text=text,explanation=explanation,page=page,difficulty='MEDIUM',**extra)
        self.rows.append(q)
        self.audit.append(dict(item=len(self.rows),origin='ORIGINAL_PARAMETERISED_PRACTICE_NOT_BOARD_OR_TEXTBOOK',family=fam,variant=n))
    def mcq(self,fam,n,text,value,why,distractors=None):
        value=S.simplify(value)
        candidates=[value]+(list(distractors) if distractors is not None else [value+1,value-1,value+2,value+3,value*2+3])
        choices=[]
        for v in candidates:
            v=S.simplify(v)
            if not any(S.simplify(v-u)==0 for u in choices):choices.append(v)
            if len(choices)==4:break
        assert len(choices)==4,(fam,n,choices)
        # Rotate choices deterministically; no repeated all-A generated key.
        shift=(n+len(fam)+self.ch)%4
        choices=choices[shift:]+choices[:shift]
        key='ABCD'[next(i for i,v in enumerate(choices) if S.simplify(v-value)==0)]
        self.put('MCQ',fam,n,text,why+' সঠিক উত্তর '+L(value)+'।',options={k:L(v) for k,v in zip('ABCD',choices)},correct=key)
        self.audit[-1].update(answerExpression=E(value),choiceExpressions=[E(v) for v in choices],correct=key)
    def cq(self,fam,n,text,parts):
        assert len(parts)==3
        self.put('CQ',fam,n,text,'উদ্দীপকের তথ্য ব্যবহার করে নিচে তিনটি অংশের ধাপে ধাপে সমাধান দেওয়া হলো।',parts=[dict(label=label,marks=marks,question=q,solution=a) for label,marks,(q,a) in zip(['ক','খ','গ'],[2,4,4],parts)])
    def sq(self,fam,n,text,answer):self.put('SQ',fam,n,text,answer)

b=Bank(1)
primes=[2,3,5,7,11,13,17,19]
# 24 distinct skills, seven/eight parameter variants (191 new MCQ).
for fam in range(24):
 for n in range(1,9):
    if fam==23 and n==8:continue
    a=n+1;p=primes[n-1];k=n+3
    if fam==0:
        z=13*n+7;v=S.Rational(z,100)
        b.mcq('finite',n,f'দশমিকের পরে ঠিক দুই অঙ্কবিশিষ্ট ${z/100:.2f}$ সংখ্যাটির সরলতম সাধারণ ভগ্নাংশ কোনটি?',v,f'সংখ্যাটি ${z}/100$; লব ও হরকে গ.সা.গু {math.gcd(z,100)} দিয়ে ভাগ করতে হয়।')
    elif fam==1:
        b.mcq('repeat1',n,rf'$0.\overline{{{n}}}$ সংখ্যাটির সাধারণ ভগ্নাংশ কোনটি?',S.Rational(n,9),rf'$t=0.\overline{{{n}}}$ হলে $10t-t={n}$, অর্থাৎ $9t={n}$।')
    elif fam==2:
        z=10*n+3
        b.mcq('repeat2',n,rf'$0.\overline{{{z}}}$-কে সাধারণ ভগ্নাংশে প্রকাশ করলে কী পাওয়া যায়?',S.Rational(z,99),f'আবৃত্ত অংশে দুই অঙ্ক। $100t-t={z}$, তাই $t={z}/99$।')
    elif fam==3:
        z=n+1;v=S.Rational(9*n+z,90)
        b.mcq('mixed',n,rf'$0.{n}\overline{{{z}}}$-এর সাধারণ ভগ্নাংশ কত?',v,rf'$100t-10t={10*n+z}-{n}={9*n+z}$। তাই $90t={9*n+z}$; শুধু {z} অঙ্কটি আবৃত্ত।')
    elif fam==4:
        b.mcq('repeat-sum',n,rf'$0.\overline{{{n}}}+0.\overline{{1}}$ এর মান কত?',S.Rational(n+1,9),f'আবৃত্ত দশমিক দুটি ${n}/9$ এবং $1/9$। যোগফল $({n}+1)/9$।')
    elif fam==5:
        b.mcq('repeat-mul',n,rf'$0.\overline{{{n}}}\times0.\overline{{2}}$ এর মান কত?',S.Rational(2*n,81),f'গুণফল $({n}/9)(2/9)={2*n}/81$।')
    elif fam==6:
        b.mcq('repeat-div',n,rf'$0.\overline{{{n}}}\div0.\overline{{3}}$ এর মান কত?',S.Rational(n,3),rf'ভাগফল $({n}/9)\div(3/9)={n}/3$।')
    elif fam==7:
        aa=n%4+1;bb=n//3+1;den=2**aa*5**bb
        b.mcq('decimal-places',n,rf'$\frac{{1}}{{{den}}}$-এর সসীম দশমিকে দশমিকের পরে ন্যূনতম কতটি অঙ্ক থাকবে?',max(aa,bb),rf'হর $2^{{{aa}}}5^{{{bb}}}$। ১০-এর ঘাত করতে উভয় সূচক সমান করতে হবে; প্রয়োজনীয় ঘাত $\max({aa},{bb})={max(aa,bb)}$।')
    elif fam==8:
        m=2*n+3;den=3*2**n
        v=S.Rational(1,den)
        b.mcq('nonrepeat-prefix',n,rf'$\frac{{1}}{{{den}}}$-কে দশমিকে প্রকাশ করলে আবৃত্ত অংশ শুরু হওয়ার আগে দশমিকের পরে ন্যূনতম কতটি অনাবৃত্ত অঙ্ক থাকবে?',n,rf'সরলতম হর ${den}=2^{{{n}}}\times3$। অনাবৃত্ত অংশের দৈর্ঘ্য $\max({n},0)={n}$; ৩ থাকার জন্য পরের অংশ আবৃত্ত।')
    elif fam==9:
        b.mcq('sqrt-int',n,rf'$\sqrt{{{k*k}}}$-এর অঋণাত্মক মান কোনটি?',k,f'${k}^2={k*k}$ এবং প্রধান বর্গমূল অঋণাত্মক, তাই মান ${k}$।')
    elif fam==10:
        v=S.Rational(a,a+1)
        b.mcq('sqrt-ratio',n,rf'$\sqrt{{\frac{{{a*a}}}{{{(a+1)**2}}}}}$ এর মান কত?',v,f'লব ও হর উভয়ই পূর্ণবর্গ। ধনাত্মক বর্গমূল নিলে লবে ${a}$, হরে ${a+1}$।')
    elif fam==11:
        m=k*k+k
        b.mcq('sqrt-floor',n,rf'$\sqrt{{{m}}}$ অপেক্ষা ছোট বৃহত্তম পূর্ণসংখ্যা কত?',k,rf'${k}^2={k*k}<{m}<{(k+1)**2}=({k}+1)^2$। ফলে ${k}<\sqrt{{{m}}}<{k+1}$।')
    elif fam==12:
        b.mcq('rational-mid',n,rf'$\frac{{{n}}}{{{n+1}}}$ ও $\frac{{{n+1}}}{{{n+2}}}$-এর ঠিক মধ্যবর্তী সংখ্যা কত?',(S.Rational(n,n+1)+S.Rational(n+1,n+2))/2,'দুটি বাস্তব সংখ্যা $u,v$-এর ঠিক মধ্যবর্তী সংখ্যা $(u+v)/2$। প্রদত্ত ভগ্নাংশ দুটি বসিয়ে হর সমান করে সরল করি।')
    elif fam==13:
        b.mcq('sqrt-product',n,rf'$\sqrt{{{p}}}\times\sqrt{{{4*p}}}$ এর মান কত?',2*p,rf'উভয় মূলের ভেতর অঋণাত্মক। $\sqrt{{{4*p}}}=2\sqrt{{{p}}}$; তাই গুণফল $2\times{p}={2*p}$ মূলদ।')
    elif fam==14:
        b.mcq('surd-square',n,rf'$({a}\sqrt{{{p}}})^2$ এর মান কত?',a*a*p,rf'গুণের বর্গ $={a}^2(\sqrt{{{p}}})^2={a*a}\times{p}$। অমূলদ সংখ্যার বর্গ মূলদ হতে পারে।')
    elif fam==15:
        b.mcq('rationalise',n,rf'$\frac{{1}}{{\sqrt{{{p}}}}}$-এর হর মূলদ করলে মান কোনটি?',S.sqrt(p)/p,rf'লব ও হরকে $\sqrt{{{p}}}$ দিয়ে গুণ করলে $\frac{{\sqrt{{{p}}}}}{{{p}}}$ হয়; মূলের ভেতরের {p} ধনাত্মক।')
    elif fam==16:
        b.mcq('integer-interval',n,rf'$-{n}<x<{n+2}$ হলে কতটি পূর্ণসংখ্যা $x$ পাওয়া যায়?',2*n+1,rf'পূর্ণসংখ্যাগুলো ${-n+1},{-n+2},\ldots,{n+1}$। সংখ্যা $({n+1})-({-n+1})+1={2*n+1}$। প্রান্তদ্বয় নেওয়া যাবে না।')
    elif fam==17:
        u=12*a;v=18*a
        b.mcq('hcf',n,f'{u} ও {v}-এর গরিষ্ঠ সাধারণ গুণনীয়ক কত?',math.gcd(u,v),rf'${u}=12\times{a}$ ও ${v}=18\times{a}$। ১২ ও ১৮-এর গ.সা.গু ৬; তাই চাওয়া মান $6\times{a}={6*a}$।')
    elif fam==18:
        u=4*a;v=6*a
        b.mcq('lcm',n,f'{u} ও {v}-এর লঘিষ্ঠ সাধারণ গুণিতক কত?',math.lcm(u,v),rf'${u}\times{v}=\operatorname{{gcd}}({u},{v})\operatorname{{lcm}}({u},{v})$। গ.সা.গু ${2*a}$; গুণফলকে তা দিয়ে ভাগ করলে ${12*a}$।')
    elif fam==19:
        b.mcq('abs-negative',n,rf'সংখ্যারেখায় $-{2*n+1}$ বিন্দুর শূন্য থেকে দূরত্ব কত?',2*n+1,rf'শূন্য থেকে দূরত্ব পরমমান $|-{2*n+1}|={2*n+1}$; দূরত্ব ঋণাত্মক নয়।')
    elif fam==20:
        b.mcq('sqrt-diff',n,rf'$\sqrt{{{(n+4)**2}}}-\sqrt{{{n*n}}}$ এর মান কত?',4,f'প্রধান বর্গমূল দুটি ${n+4}$ এবং ${n}$। বিয়োগফল ${n+4}-{n}=4$।')
    elif fam==21:
        b.mcq('reciprocal',n,rf'$0.\overline{{{n}}}$-এর গুণাত্মক বিপরীত কত?',S.Rational(9,n),rf'সংখ্যাটি ${n}/9\ne0$। গুণাত্মক বিপরীত $9/{n}$, কারণ গুণফল ১।')
    elif fam==22:
        b.mcq('rational-add',n,rf'$\frac{{{n}}}{{{n+2}}}+\frac{{2}}{{{n+2}}}$ কোন সংখ্যার সমান?',1,f'হর একই, তাই লব যোগ করলে $({n}+2)/({n}+2)=1$।')
    else:
        # Finite vs recurring decimals: genuinely different values, not glyph variants.
        z=10*n+1
        b.mcq('repeat-finite-gap',n,rf'$0.\overline{{{z}}}-0.{z}$ এর মান কত?',S.Rational(z,9900),f'প্রথমটি ${z}/99$, দ্বিতীয়টি ${z}/100$। বিয়োগফল ${z}(100-99)/9900={z}/9900$।')

for n in range(1,6):
    a=n+1;p=[2,3,5,7,11][n-1];z=10*n+2
    b.cq('decimal-pair',n,rf'$u=0.\overline{{{z}}}$ এবং $v=0.{n}\overline{{{n+1}}}$।',[
      ('u-কে সাধারণ ভগ্নাংশে প্রকাশ কর।',rf'$100u-u={z}$, তাই $u=\frac{{{z}}}{{99}}={L(S.Rational(z,99))[1:-1]}$।'),
      ('v-কে সাধারণ ভগ্নাংশে প্রকাশ করে u+v নির্ণয় কর।',rf'$100v-10v={10*n+n+1}-{n}={10*n+1}$। তাই $v=\frac{{{10*n+1}}}{{90}}$। ফলে $u+v={L(S.Rational(z,99)+S.Rational(10*n+1,90))[1:-1]}$।'),
      ('u ও v মূলদ কি না যুক্তি দিয়ে দেখাও এবং u/v নির্ণয় কর।',rf'দুটি সংখ্যাই পূর্ণসংখ্যার অনুপাত এবং হর অশূন্য, তাই মূলদ। $v>0$। সুতরাং $u/v=\frac{{{z}}}{{99}}\times\frac{{90}}{{{10*n+1}}}={L(S.Rational(z,99)/S.Rational(10*n+1,90))[1:-1]}$।')])
    aa=n+1;bb=n%3+1;den=2**aa*5**bb
    b.cq('termination',n,rf'$r=\frac{{1}}{{{den}}}$ এবং $s=\frac{{1}}{{{3*den}}}$।',[
      ('r-এর হরকে মৌলিক উৎপাদকে বিশ্লেষণ কর।',rf'${den}=2^{{{aa}}}\times5^{{{bb}}}$। লব ১ হওয়ায় ভগ্নাংশটি সরলতম।'),
      ('r-এর দশমিক সসীম কি না এবং হলে ন্যূনতম কত ঘর প্রয়োজন, দেখাও।',rf'হরের মৌলিক উৎপাদক কেবল ২ ও ৫। তাই দশমিক সসীম। হরকে ১০-এর ঘাত করতে প্রয়োজন $\max({aa},{bb})={max(aa,bb)}$ ঘর; এর চেয়ে কম ঘরে উভয় উৎপাদক পাওয়া যায় না।'),
      ('s-এর দশমিকের প্রকৃতি নির্ণয় করে r+s মূলদ কি না ব্যাখ্যা কর।',rf'$s$-এর সরলতম হরে ৩ আছে, তাই দশমিক অসীম আবৃত্ত। কিন্তু $r+s=\frac{{4}}{{{3*den}}}={L(S.Rational(4,3*den))[1:-1]}$ পূর্ণসংখ্যার অনুপাত, তাই মূলদ। অসীম আবৃত্ত দশমিকও মূলদ।')])
    b.cq('prime-irrational',n,rf'$p={p}$ একটি মৌলিক সংখ্যা এবং $t=\sqrt{{p}}$।',[
      ('p-এর ধনাত্মক গুণনীয়ক লেখ।',f'মৌলিক সংখ্যা ${p}$-এর ধনাত্মক গুণনীয়ক কেবল $1$ ও ${p}$।'),
      ('বিপরীত অনুমান পদ্ধতিতে t অমূলদ প্রমাণ কর।',rf'ধরি $\sqrt{{{p}}}=m/n$, যেখানে $m,n$ সহমৌলিক পূর্ণসংখ্যা ও $n\ne0$। তবে $m^2={p}n^2$। মৌলিক {p} যদি $m^2$-কে ভাগ করে তবে $m$-কেও ভাগ করে (মৌলিক উৎপাদকে {p}-এর সূচক দ্বিগুণ হয়)। $m={p}k$ বসালে $n^2={p}k^2$; তাই {p} দ্বারা $n$-ও বিভাজ্য। সহমৌলিকতার বিরোধ। অতএব $t$ অমূলদ।'),
      (rf'${a}+t$ ও ${a}t$ উভয়ই অমূলদ দেখাও।',rf'${a}+t$ মূলদ হলে তা থেকে মূলদ ${a}$ বিয়োগ করে $t$ মূলদ পাওয়া যেত। আবার ${a}t$ মূলদ হলে অশূন্য মূলদ ${a}$ দিয়ে ভাগ করে $t$ মূলদ পাওয়া যেত। দুটিই খ অংশের বিরোধ; তাই উভয়ই অমূলদ।')])
    b.cq('density',n,rf'সংখ্যারেখায় $a={n}$ এবং $b={n+1}$ দুটি বিন্দু।',[
      ('a ও b-এর ঠিক মধ্যবর্তী মূলদ সংখ্যা নির্ণয় কর।',rf'$r=(a+b)/2=\frac{{{2*n+1}}}{{2}}$; লব ও হর পূর্ণসংখ্যা, তাই মূলদ।'),
      (rf'$s={n}+\frac{{\sqrt{{2}}}}{{2}}$ বিন্দুটি a ও b-এর মাঝখানে কি না দেখাও।',rf'$1<\sqrt2<2$ থেকে $0<\sqrt2/2<1$। উভয় পাশে {n} যোগে ${n}<s<{n+1}$। তাই বিন্দুটি দুই প্রান্তের মাঝখানে।'),
      ('s অমূলদ প্রমাণ করে r ও s ভিন্ন সংখ্যা দেখাও।',rf'$s$ মূলদ হলে $2(s-{n})=\sqrt2$ মূলদ হতো, যা অসম্ভব। তাই $s$ অমূলদ। $r$ মূলদ হওয়ায় $r\ne s$; একই দুই পূর্ণসংখ্যার মধ্যে মূলদ ও অমূলদ উভয়ই পাওয়া গেল।')])
    u=S.Rational(n,9);v=S.Rational(n+1,9)
    b.cq('recurring-arithmetic',n,rf'$u=0.\overline{{{n}}}$ ও $v=0.\overline{{{n+1}}}$। একজন শিক্ষার্থী বলে, এদের গুণফল অবশ্যই অমূলদ।',[
      ('u ও v সাধারণ ভগ্নাংশে প্রকাশ কর।',rf'$9u={n}$ ও $9v={n+1}$, তাই $u={n}/9$, $v={n+1}/9$।'),
      ('u+v এবং uv নির্ণয় কর।',rf'$u+v=({n}+{n+1})/9={L(u+v)[1:-1]}$। $uv=({n}/9)({n+1}/9)={L(u*v)[1:-1]}$।'),
      ('শিক্ষার্থীর বক্তব্য বিচার করে u/v-এর প্রকৃতিও নির্ণয় কর।',rf'গুণফল ${L(u*v)[1:-1]}$ দুই পূর্ণসংখ্যার অনুপাত, তাই মূলদ; বক্তব্য ভুল। $v\ne0$ এবং $u/v=({n}/9)\div({n+1}/9)={L(u/v)[1:-1]}$, এটিও মূলদ। অসীম আবৃত্ত দশমিককে অমূলদ ভাবা ঠিক নয়।')])
    m=a*a*p
    b.cq('scaled-radicals',n,rf'$u=\sqrt{{{a*a}}}$, $v=\sqrt{{{m}}}$ এবং $w=\sqrt{{\frac{{{a*a}}}{{{(a+1)**2}}}}}$।',[
      ('u ও w-এর মান নির্ণয় কর।',rf'প্রধান বর্গমূল নিলে $u={a}$ এবং $w={a}/({a+1})$। উভয়ই মূলদ।'),
      ('v সরল করে অমূলদ কি না ব্যাখ্যা কর।',rf'$v=\sqrt{{{a*a}\times{p}}}={a}\sqrt{{{p}}}$। মৌলিক {p}-এর বর্গমূল অমূলদ। যদি $v$ মূলদ হয় তবে $v/{a}=\sqrt{{{p}}}$ মূলদ হয়—বিরোধ। তাই $v$ অমূলদ।'),
      ('v² এবং v/u নির্ণয় করে দেখাও, অমূলদ সংখ্যার বর্গ মূলদ হতে পারে।',rf'$v^2={m}$, যা পূর্ণসংখ্যা তথা মূলদ। কিন্তু $v/u={a}\sqrt{{{p}}}/{a}=\sqrt{{{p}}}$ অমূলদ। অতএব বর্গ মূলদ হলেও মূল সংখ্যাটি অমূলদ হতে পারে।')])
    u=12*a;v=18*a;g=math.gcd(u,v);l=math.lcm(u,v)
    b.cq('integer-factors',n,f'দুটি ধনাত্মক পূর্ণসংখ্যা $u={u}$ ও $v={v}$।',[
      ('u ও v-এর সাধারণ ধনাত্মক গুণনীয়ক লেখ।',rf'সাধারণ গুণনীয়কগুলো $g={g}$-এর গুণনীয়ক; সেগুলো ${st({d for d in range(1,g+1) if g%d==0})}$।'),
      ('মৌলিক উৎপাদক ব্যবহার করে গ.সা.গু ও ল.সা.গু নির্ণয় কর।',rf'মৌলিক উৎপাদকে সর্বনিম্ন সূচক নিলে গ.সা.গু ${g}$ এবং সর্বোচ্চ সূচক নিলে ল.সা.গু ${l}$। সরাসরি যাচাই: ${u}/{g}={u//g}$ ও ${v}/{g}={v//g}$ সহমৌলিক; তাই ল.সা.গু $={g}\times{u//g}\times{v//g}={l}$।'),
      ('গ.সা.গু × ল.সা.গু = সংখ্যা দুটির গুণফল যাচাই করে u/v সরল কর।',rf'${g}\times{l}={g*l}={u}\times{v}$। আবার $u/v=({u}/{g})/({v}/{g})=2/3$। ২ ও ৩ সহমৌলিক, তাই এটি সরলতম মূলদ রূপ।')])
    vals=[S.Rational(n,2),S.Rational(n+1,2),S.Rational(2*n+1,4)]
    b.cq('rational-order',n,rf'$u=\frac{{{n}}}{{2}}$, $v=\frac{{{n+1}}}{{2}}$, $w=\frac{{{2*n+1}}}{{4}}$।',[
      ('তিনটি সংখ্যাকে একই হরবিশিষ্ট ভগ্নাংশে প্রকাশ কর।',rf'$u={2*n}/4$, $v={2*n+2}/4$, $w={2*n+1}/4$।'),
      ('সংখ্যারেখায় তাদের বাম থেকে ডানে ক্রম নির্ণয় ও ব্যাখ্যা কর।',rf'সবার হর ৪ ধনাত্মক এবং ${2*n}<{2*n+1}<{2*n+2}$, তাই $u<w<v$। বাম থেকে ডানে $u,w,v$।'),
      ('u ও w-এর মধ্যবর্তী এবং w ও v-এর মধ্যবর্তী একটি করে মূলদ সংখ্যা নির্ণয় কর।',rf'প্রথম মধ্যবিন্দু $(u+w)/2={L((vals[0]+vals[2])/2)[1:-1]}$। দ্বিতীয়টি $(w+v)/2={L((vals[2]+vals[1])/2)[1:-1]}$। উভয়টি পূর্ণসংখ্যার অনুপাত এবং প্রতিটি নিজ নিজ দুই প্রান্তের গড়, তাই প্রান্তের কঠোর মাঝখানে।')])
    k=math.isqrt(m)
    b.cq('irrational-bounds',n,rf'$t=\sqrt{{{m}}}$, যেখানে ${m}={a*a}\times{p}$।',[
      ('t-এর ঠিক নিচের ও ঠিক উপরের পূর্ণসংখ্যা নির্ণয় কর।',rf'${k}^2={k*k}<{m}<{(k+1)**2}=({k+1})^2$। তাই ${k}<t<{k+1}$; নিচে ${k}$, উপরে ${k+1}$।'),
      ('t অমূলদ কি না যুক্তি দাও।',rf'$t={a}\sqrt{{{p}}}$। মৌলিক {p}-এর বর্গমূল অমূলদ; অশূন্য মূলদ {a} দিয়ে গুণ করলে অমূলদ থাকে। নতুবা {a} দিয়ে ভাগ করে $\sqrt{{{p}}}$-কে মূলদ পাওয়া যেত।'),
      ('t-এর গুণাত্মক বিপরীতের হর মূলদ কর এবং তার অবস্থানের সীমা নির্ণয় কর।',rf'$1/t=1/({a}\sqrt{{{p}}})=\sqrt{{{p}}}/({a*p})$। ${k}<t<{k+1}$ এবং সব সংখ্যা ধনাত্মক হওয়ায় বিপরীত নিলে $1/{k+1}<1/t<1/{k}$।')])
    b.cq('nine-equality',n,rf'$u={n}+0.\overline{{9}}$ এবং $v={n+1}$। রাফি মনে করে, $u<v$।',[
      (r'$0.\overline{9}$-কে সাধারণ ভগ্নাংশে প্রকাশ কর।',r'$t=0.\overline9$ হলে $10t-t=9$; তাই $9t=9$ ও $t=1$।'),
      ('রাফির বক্তব্য বিচার কর এবং u−v নির্ণয় কর।',rf'$u={n}+1={n+1}=v$। তাই রাফির কঠোর অসমতার দাবি ভুল। $u-v=0$। অসীম আবৃত্ত $0.\overline9$ এবং ১ একই বাস্তব সংখ্যার দুই প্রকাশ।'),
      (rf'$u$ এবং সসীম দশমিক ${n}.99$-এর পার্থক্য বের করে সসীম ও আবৃত্ত প্রকাশের তফাত ব্যাখ্যা কর।',rf'সসীম ${n}.99={n}+99/100$। তাই $u-({n}+99/100)=1/100$। কিন্তু আবৃত্ত প্রকাশে অনন্তসংখ্যক ৯ থাকে এবং তা ঠিক ১; সসীম .99-এ কেবল দুইটি ৯, তাই ১ থেকে $1/100$ কম।')])

for n in range(1,5):
    p=[2,3,5,7][n-1];z=17*n+3;a=n+2
    b.sq('finite',n,rf'সসীম দশমিক ${z/100:.2f}$-কে সরলতম সাধারণ ভগ্নাংশে প্রকাশ কর।',rf'দশমিকের পরে দুই অঙ্ক। তাই ${z}/100={L(S.Rational(z,100))[1:-1]}$। লব-হরের গ.সা.গু দিয়ে ভাগ করে এই সরলতম রূপ পাওয়া যায়।')
    b.sq('recurring',n,rf'$0.\overline{{{10*n+7}}}$ মূলদ কেন? সাধারণ ভগ্নাংশ দিয়ে দেখাও।',rf'$t=0.\overline{{{10*n+7}}}$ হলে $100t-t={10*n+7}$। তাই $t={L(S.Rational(10*n+7,99))[1:-1]}$; পূর্ণসংখ্যার অনুপাত হওয়ায় মূলদ।')
    b.sq('mixed',n,rf'$0.{n}\overline{{{n+2}}}$-কে সাধারণ ভগ্নাংশে প্রকাশ কর।',rf'$100t-10t={10*n+n+2}-{n}={10*n+2}$। তাই $t=({10*n+2})/90={L(S.Rational(10*n+2,90))[1:-1]}$।')
    b.sq('negative',n,rf'$-{a}$ পূর্ণসংখ্যা হয়েও কীভাবে মূলদ? এটি স্বাভাবিক সংখ্যা কি?',rf'$-{a}=(-{a})/1$ এবং হর ১ অশূন্য, তাই মূলদ। এখানে স্বাভাবিক সংখ্যা ১,২,৩,... ধরা হয়েছে; ঋণাত্মক হওয়ায় এটি স্বাভাবিক নয়।')
    b.sq('irrational',n,rf'$\sqrt{{{p}}}$-কে মূলদ ধরা হলে কী বিরোধ হয়?',rf'সহমৌলিক $m,n$ ও $n\ne0$-এর জন্য $\sqrt{{{p}}}=m/n$ ধরলে $m^2={p}n^2$। মৌলিক {p} প্রথমে $m$ এবং পরে $n$-কেও ভাগ করে। ফলে তারা সহমৌলিক নয়—বিরোধ।')
    b.sq('root-ratio',n,rf'$\sqrt{{\frac{{{a*a}}}{{{(a+1)**2}}}}}$ মূলদ কি? যুক্তি দাও।',rf'অঋণাত্মক বর্গমূল নিলে মান ${a}/({a+1})$। লব-হর পূর্ণসংখ্যা এবং হর অশূন্য; তাই সংখ্যাটি মূলদ।')
    b.sq('between',n,rf'$\frac{{{n}}}{{3}}$ ও $\frac{{{n+1}}}{{3}}$-এর মাঝে একটি মূলদ সংখ্যা নির্ণয় কর।',rf'মধ্যবিন্দু $=\frac12({n}/3+{n+1}/3)=\frac{{{2*n+1}}}{{6}}$। এটি পূর্ণসংখ্যার অনুপাত; দুই অসমান প্রান্তের গড় হওয়ায় কঠোর মাঝখানে অবস্থিত।')
    b.sq('finite-v-repeat',n,rf'$0.\overline{{{n}}}$ ও $0.{n}$ কি সমান? ভগ্নাংশে তুলনা কর।',rf'প্রথমটি ${n}/9$, দ্বিতীয়টি ${n}/10$। প্রথম থেকে দ্বিতীয় বিয়োগে ${n}/90>0$। তাই তারা সমান নয়; আবৃত্ত দশমিকটি বড়।')
    den=2**n*3
    b.sq('termination',n,rf'$\frac1{{{den}}}$-এর দশমিক সসীম না অসীম আবৃত্ত? কারণ লেখ।',rf'সরলতম হর ${den}=2^{{{n}}}\times3$। ২ ও ৫ ছাড়াও মৌলিক উৎপাদক ৩ থাকায় এটি সসীম নয়। মূলদ সংখ্যা হওয়ায় দশমিকটি অসীম আবৃত্ত।')
    u=8*a;v=12*a
    b.sq('gcd-lcm',n,f'{u} ও {v}-এর গ.সা.গু {4*a} হলে ল.সা.গু কত?',rf'ধনাত্মক পূর্ণসংখ্যার জন্য গ.সা.গু × ল.সা.গু = গুণফল। তাই ল.সা.গু $=({u}\times{v})/{4*a}={24*a}$।')

c=Bank(2)
# 30 skills x ten variants, last two variants omitted = 298 original MCQ.
for fam in range(30):
 for n in range(1,11):
    if fam==29 and n>8:continue
    a=n+2;A=set(range(1,a+1));B=set(range(a-1,2*a));U=set(range(1,3*a+1))
    if fam==0:c.mcq('union',n,rf'$A={st(A)}$, $B={st(B)}$ হলে $n(A\cup B)$ কত?',len(A|B),rf'সাধারণ উপাদান একবার নিয়ে $A\cup B={st(A|B)}$; মোট {len(A|B)}টি।')
    elif fam==1:c.mcq('intersection',n,rf'$A={st(A)}$, $B={st(B)}$ হলে $n(A\cap B)$ কত?',len(A&B),rf'উভয় সেটে থাকা উপাদানগুলো $A\cap B={st(A&B)}$।')
    elif fam==2:c.mcq('difference',n,rf'$A={st(A)}$, $B={st(B)}$ হলে $n(A\setminus B)$ কত?',len(A-B),rf'$B$-তে থাকা উপাদান $A$ থেকে বাদ দিলে $A\setminus B={st(A-B)}$।')
    elif fam==3:c.mcq('complement',n,rf'$U=\{{1,2,\ldots,{3*a}\}}$, $A=\{{1,2,\ldots,{a}\}}$ হলে $n(A^c)$ কত?',len(U-A),rf'$A\subseteq U$; তাই $n(A^c)=n(U)-n(A)={3*a}-{a}={2*a}$।')
    elif fam==4:c.mcq('disjoint',n,rf'দুটি নিঃছেদ সেট $A,B$-এর উপাদান সংখ্যা যথাক্রমে {a} ও {a+3}। $n(A\cup B)$ কত?',2*a+3,f'নিঃছেদ হলে ছেদ শূন্য সেট। তাই উপাদান সংখ্যা যোগ হবে: ${a}+{a+3}={2*a+3}$।')
    elif fam==5:c.mcq('subsets',n,rf'$A=\{{1,2,\ldots,{n}\}}$ হলে $P(A)$-এর উপাদান সংখ্যা কত?',2**n,rf'{n}টি উপাদানের প্রতিটি নেওয়া বা না-নেওয়ার দুই উপায়। তাই উপসেট তথা $P(A)$-এর উপাদান সংখ্যা $2^{{{n}}}={2**n}$।')
    elif fam==6:c.mcq('proper-subsets',n,rf'{n+1}টি উপাদানবিশিষ্ট একটি সেটের প্রকৃত উপসেট কয়টি?',2**(n+1)-1,rf'মোট উপসেট $2^{{{n+1}}}$। সেটটি নিজে ছাড়া বাকি সব প্রকৃত উপসেট; তাই $2^{{{n+1}}}-1={2**(n+1)-1}$।')
    elif fam==7:
        size=n+2;value=len([v for v in combinations(range(size),2)])
        c.mcq('two-subsets',n,rf'$A=\{{1,2,\ldots,{size}\}}$-এর ঠিক দুই উপাদানবিশিষ্ট উপসেট কয়টি?',value,rf'প্রথম উপাদান {size}ভাবে, দ্বিতীয়টি {size-1}ভাবে নেওয়া যায়। ক্রম উপেক্ষা করলে প্রতিটি জোড়া দুইবার গোনা হয়, তাই ${size}\times{size-1}/2={value}$।')
    elif fam==8:c.mcq('cart-size',n,rf'$n(A)={a}$ ও $n(B)=3$ হলে $n(A\times B)$ কত?',3*a,rf'প্রতিটি প্রথম উপাদানের সঙ্গে ৩টি দ্বিতীয় উপাদান জোড়া হয়। তাই মোট ${a}\times3={3*a}$টি ক্রমজোড়।')
    elif fam==9:
        D={n,n+1};F={n+2,n+3,n+4}
        c.mcq('cart-filter',n,rf'$A={st(D)}$, $B={st(F)}$। $A\times B$-তে প্রথম স্থানাঙ্ক ${n+1}$ এমন ক্রমজোড় কয়টি?',3,rf'ক্রমজোড়গুলো ${pairs({(n+1,t) for t in F})}$। দ্বিতীয় স্থানে $B$-এর প্রতিটি উপাদান একবার পাওয়া যায়।')
    elif fam==10:
        R={(i,i+1) for i in range(n,n+4)}
        c.mcq('domain-size',n,rf'$R={pairs(R)}$ অন্বয়টির ডোমেনের উপাদানগুলোর যোগফল কত?',sum(t[0] for t in R),rf'ডোমেন হলো প্রথম স্থানাঙ্কের সেট ${st({t[0] for t in R})}$। এগুলো যোগ করি।')
    elif fam==11:
        R={(n,2*n),(n+1,2*n),(n+2,2*n+2)}
        c.mcq('range-sum',n,rf'$R={pairs(R)}$-এর রেঞ্জের উপাদানগুলোর যোগফল কত?',4*n+2,rf'পুনরাবৃত্ত উপাদান একবার নিয়ে রেঞ্জ ${st({2*n,2*n+2})}$। তাই যোগফল ${2*n}+{2*n+2}={4*n+2}$।')
    elif fam==12:c.mcq('inverse-pair',n,rf'$R=\{{({n},{n+3})\}}$ হলে $R^{{-1}}$-এর একমাত্র ক্রমজোড়ের প্রথম স্থানাঙ্ক কত?',n+3,rf'বিপরীত অন্বয়ে স্থানাঙ্ক অদলবদল হয়; $R^{{-1}}=\{{({n+3},{n})\}}$।')
    elif fam==13:c.mcq('linear-value',n,rf'$f(x)={a}x+{n}$ হলে $f(3)$ কত?',3*a+n,rf'$x=3$ বসালে $f(3)={a}\times3+{n}={3*a+n}$।')
    elif fam==14:c.mcq('square-value',n,rf'$f(x)=x^2+{n}$ হলে $f(-{a})$ কত?',a*a+n,rf'$f(-{a})=(-{a})^2+{n}={a*a}+{n}$। ঋণাত্মক সংখ্যার বর্গ ধনাত্মক।')
    elif fam==15:c.mcq('rational-value',n,rf'$f(x)=\frac{{x+{n}}}{{x+1}}$ হলে $f(2)$ কত?',S.Rational(n+2,3),rf'$x=2$-এ হর ৩ অশূন্য। তাই $f(2)=(2+{n})/(2+1)={n+2}/3$।')
    elif fam==16:c.mcq('function-zero',n,rf'$f(x)={a}x-{2*a*n}$ হলে $f(x)=0$-এর জন্য x কত?',2*n,rf'${a}x-{2*a*n}=0$ থেকে ${a}x={2*a*n}$, তাই $x={2*n}$।')
    elif fam==17:c.mcq('function-equality',n,rf'$f(x)=2x+{n}$ এবং $g(x)=x+{3*n}$। $f(x)=g(x)$ হলে x কত?',2*n,rf'$2x+{n}=x+{3*n}$, অর্থাৎ $x={3*n}-{n}={2*n}$।')
    elif fam==18:c.mcq('excluded-domain',n,rf'$f(x)=\frac1{{x-{n}}}$-এর বাস্তব ডোমেন থেকে কোন সংখ্যাটি বাদ যাবে?',n,rf'হর শূন্য হতে পারবে না। $x-{n}=0$ হয় $x={n}$-এ; শুধু এই সংখ্যাটি বাদ যাবে।')
    elif fam==19:
        D=set(range(n-2,n+4));domain={v for v in D if v>=n}
        c.mcq('root-domain',n,rf'$A={st(D)}$ এবং $f(x)=\sqrt{{x-{n}}}$। $A$-এর কতটি উপাদানে f বাস্তব মান দেবে?',len(domain),rf'বর্গমূল বাস্তব হতে $x-{n}\geq0$। তাই অনুমোদিত উপাদান ${st(domain)}$।')
    elif fam==20:
        D={-n,-n-1,0,n,n+1};image={v*v for v in D}
        c.mcq('square-image',n,rf'$f:A\to\mathbb{{R}}$, $f(x)=x^2$, $A={st(D)}$। রেঞ্জে কয়টি উপাদান?',len(image),rf'ধনাত্মক ও ঋণাত্মক সমমানের উপাদানের বর্গ সমান। রেঞ্জ ${st(image)}$।')
    elif fam==21:
        R={(n,n+1),(n,n+2),(n+1,n+3)}
        c.mcq('not-function',n,rf'$R={pairs(R)}$ অন্বয়ে কোন প্রথম স্থানাঙ্কের জন্য একাধিক ভিন্ন দ্বিতীয় স্থানাঙ্ক আছে?',n,rf'প্রথম স্থানাঙ্ক ${n}$-এর সঙ্গে ${n+1}$ ও ${n+2}$ দুইটি ভিন্ন মান আছে। তাই $R$ তার ডোমেন থেকে ফাংশন নয়।')
    elif fam==22:
        aa=20+n;bb=17+n;both=5+n
        c.mcq('union-word',n,f'একটি ক্লাসে ক্রিকেট পছন্দ করে {aa} জন, ফুটবল {bb} জন এবং উভয়টি {both} জন। অন্তত একটি খেলা পছন্দ করে কতজন?',aa+bb-both,f'উভয়টি পছন্দকারীরা দুইবার গোনা হয়েছে। তাই অন্তত একটি $={aa}+{bb}-{both}={aa+bb-both}$।')
    elif fam==23:
        total=60+2*n;aa=25+n;bb=20+n;both=10+n
        c.mcq('neither-word',n,f'{total} জনের ক্লাসে বাংলা ক্লাবে {aa} জন, ইংরেজি ক্লাবে {bb} জন এবং উভয় ক্লাবে {both} জন। কোনো ক্লাবেই নেই কতজন?',total-aa-bb+both,f'অন্তত একটিতে $={aa}+{bb}-{both}={aa+bb-both}$ জন। তাই কোনোটিতেই নয় $={total}-{aa+bb-both}={total-aa-bb+both}$।')
    elif fam==24:
        aa=20+n;bb=21+n;cc=22+n;ab=7;bc=8;ac=6;abc=3
        value=aa+bb+cc-ab-bc-ac+abc
        c.mcq('triple-union',n,rf'$n(A)={aa}$, $n(B)={bb}$, $n(C)={cc}$; জোড়ায় ছেদ $n(A\cap B)=7$, $n(B\cap C)=8$, $n(A\cap C)=6$ এবং তিনটির ছেদে ৩টি উপাদান। $n(A\cup B\cup C)$ কত?',value,f'তিন সেটের যোগ থেকে তিন জোড়া ছেদের সংখ্যা বিয়োগ করে তিনটির ছেদ একবার যোগ: ${aa}+{bb}+{cc}-7-8-6+3={value}$।')
    elif fam==25:c.mcq('demorgan',n,rf'$U=\{{1,\ldots,{3*a}\}}$, $A={st(A)}$, $B={st(B)}$। $n(A^c\cap B^c)$ কত?',len(U-(A|B)),rf'ডি মরগ্যান সূত্রে $A^c\cap B^c=(A\cup B)^c$। $n(U)={len(U)}$ ও $n(A\cup B)={len(A|B)}$, তাই পার্থক্য {len(U-(A|B))}।')
    elif fam==26:c.mcq('diff-identity',n,rf'$U=\{{1,\ldots,{3*a}\}}$, $A={st(A)}$, $B={st(B)}$। $n(A\cap B^c)$ কত?',len(A-B),rf'$A\cap B^c=A\setminus B={st(A-B)}$। এখানেই চাওয়া উপাদানগুলো আছে।')
    elif fam==27:
        D={n,n+1,n+2}
        c.mcq('power-members',n,rf'$A={st(D)}$। $P(A)$-এর কতটি উপাদান সেটে ${n}$ উপাদানটি আছে?',4,rf'${n}$ নিতে হবে। বাকি দুই উপাদানের প্রতিটি নেওয়া বা না-নেওয়ার দুই উপায়; মোট $2^2=4$।')
    elif fam==28:
        D={n,n+1,n+2,n+3}
        c.mcq('empty-subset',n,rf'$A={st(D)}$। $A$-এর শূন্য উপাদানবিশিষ্ট উপসেট কয়টি?',1,r'যে কোনো সেটের শূন্য উপাদানবিশিষ্ট উপসেট একটিই: $\varnothing$। শূন্য সেট ও $\{\varnothing\}$ এক নয়।')
    else:
        D=set(range(n,n+4));F=set(range(n,n+7))
        c.mcq('nested-gap',n,rf'$A={st(D)}\subset B={st(F)}$ হলে $n(B\setminus A)$ কত?',len(F-D),rf'$B$-এর যেসব উপাদান $A$-তে নেই, সেগুলো ${st(F-D)}$।')

for n in range(1,8):
    a=n+2;U=set(range(1,3*a+1));A=set(range(1,a+1));B=set(range(a-1,2*a));C={v for v in U if v%2==0}
    c.cq('two-set-identity',n,rf'$U=\{{1,2,\ldots,{3*a}\}}$, $A={st(A)}$, $B={st(B)}$।',[
        (r'$A\cap B$ নির্ণয় কর।',rf'উভয় সেটে থাকা উপাদানগুলো নিয়ে $A\cap B={st(A&B)}$।'),
        (r'$A\setminus B$, $B\setminus A$ ও $A\cup B$ নির্ণয় কর।',rf'$A\setminus B={st(A-B)}$, $B\setminus A={st(B-A)}$, $A\cup B={st(A|B)}$। ছেদের উপাদান union-এ একবার নেওয়া হয়েছে।'),
        (r'যাচাই কর, $A\cup B=(A\setminus B)\cup(B\setminus A)\cup(A\cap B)$।',rf'খ অংশের প্রথম দুই সেট ও ক অংশের সেট পরস্পর নিঃছেদ। তাদের মিলনে ${st((A-B)|(B-A)|(A&B))}$, যা $A\cup B$। যেকোনো উপাদান হয় শুধু $A$-তে, নয় শুধু $B$-তে, নয় উভয়ে—তাই কেউ বাদ পড়ে না বা দ্বিগুণ গণনা হয় না।')])
    c.cq('three-demorgan',n,rf'$U=\{{1,2,\ldots,{3*a}\}}$, $A={st(A)}$, $B={st(B)}$, $C={st(C)}$।',[
        (r'$A\cap C$ নির্ণয় কর।',rf'জোড় এবং $A$-তে আছে এমন উপাদান নিয়ে $A\cap C={st(A&C)}$।'),
        (r'$(A\cup B)^c$ এবং $A^c\cap B^c$ নির্ণয় করে তুলনা কর।',rf'$A\cup B={st(A|B)}$। $U$ থেকে এগুলো বাদ দিলে $(A\cup B)^c={st(U-(A|B))}$। আবার $A^c={st(U-A)}$, $B^c={st(U-B)}$; তাদের ছেদও ${st((U-A)&(U-B))}$। ফলে সমান।'),
        (r'$A\cap(B\cup C)=(A\cap B)\cup(A\cap C)$ উদ্দীপকের সেট দিয়ে যাচাই কর।',rf'বামপক্ষে $B\cup C={st(B|C)}$, তাই ছেদ ${st(A&(B|C))}$। ডানপক্ষে $A\cap B={st(A&B)}$ ও $A\cap C={st(A&C)}$; তাদের মিলন ${st((A&B)|(A&C))}$। উভয়পক্ষ সমান—বণ্টন সূত্র যাচাইকৃত।')])
    D={n,n+1,n+2}
    c.cq('power-set',n,rf'$A={st(D)}$ এবং $B={st({n,n+1})}$।',[
        ('A-এর একটি প্রকৃত উপসেট ও একটি অপ্রকৃত উপসেট লেখ।',rf'$B={st({n,n+1})}$ একটি প্রকৃত উপসেট; কারণ $B\subset A$ ও $B\ne A$। $A$ নিজেই অপ্রকৃত উপসেট।'),
        (r'$P(A)$ তালিকা পদ্ধতিতে লিখে উপাদান সংখ্যা যাচাই কর।',rf'$P(A)={ps(D)}$। মোট {len(P(D))}টি উপসেট; $n(A)=3$, তাই $n(P(A))=8=2^3$।'),
        (rf'$P(A)$-এর যেসব উপাদান সেটে ${n}$ আছে তাদের তালিকা ও সংখ্যা নির্ণয় কর।',rf'সেটগুলো ${"; ".join(st(v) for v in P(D) if n in v)}$। মোট ৪টি; নির্দিষ্ট উপাদান {n} নিলে বাকি দুইটি নেওয়া বা না-নেওয়ার $2^2=4$ উপায়।')])
    D=set(range(n,n+3));F=set(range(n+1,n+4));R={(u,v) for u,v in product(D,F) if v==u+1}
    c.cq('cart-relation',n,rf'$A={st(D)}$, $B={st(F)}$ এবং $R=\{{(x,y)\in A\times B:y=x+1\}}$।',[
        (r'$n(A\times B)$ নির্ণয় কর।',r'প্রথম স্থানাঙ্কের ৩টি ও দ্বিতীয় স্থানাঙ্কের ৩টি পছন্দ; তাই $3\times3=9$টি ক্রমজোড়।'),
        ('R তালিকা পদ্ধতিতে প্রকাশ করে ডোমেন ও রেঞ্জ নির্ণয় কর।',rf'$R={pairs(R)}$। প্রথম স্থানাঙ্কের সেট ${st(D)}$ ডোমেন এবং দ্বিতীয় স্থানাঙ্কের সেট ${st(F)}$ রেঞ্জ।'),
        (r'$R$ কি $A$ থেকে $B$-তে ফাংশন? $R^{-1}$-ও ফাংশন কি না বিচার কর।',rf'$A$-এর প্রতিটি উপাদানের ঠিক একটি প্রতিচ্ছবি আছে, তাই $R$ ফাংশন। $R^{{-1}}={pairs({(v,u) for u,v in R})}$-এও $B$-এর প্রতিটি উপাদানের ঠিক একটি মান; তাই বিপরীত অন্বয়ও $B$ থেকে $A$-তে ফাংশন।')])
    D=set(range(n,n+4));R={(u,v) for u,v in product(D,D) if u<v}
    c.cq('order-relation',n,rf'$A={st(D)}$ এবং $R=\{{(x,y)\in A\times A:x<y\}}$।',[
        (r'$n(A\times A)$ নির্ণয় কর।',r'$A$-তে ৪টি উপাদান; তাই $n(A\times A)=4\times4=16$।'),
        ('R এবং তার ডোমেন ও রেঞ্জ তালিকাবদ্ধ কর।',rf'$R={pairs(R)}$। ডোমেন ${st({u for u,v in R})}$ এবং রেঞ্জ ${st({v for u,v in R})}$।'),
        ('R কি A থেকে A-তে ফাংশন? নির্দিষ্ট উপাদান উল্লেখ করে যুক্তি দাও।',rf'না। প্রথম উপাদান ${n}$-এর প্রতিচ্ছবি ${n+1},{n+2},{n+3}$—একাধিক। আবার বৃহত্তম উপাদান ${n+3}$-এর কোনো প্রতিচ্ছবি নেই। প্রতিটি উপাদানের ঠিক একটি মানের শর্ত দুইভাবেই ব্যর্থ।')])
    D=set(range(n,n+4));t=2*n+3;R={(u,v) for u,v in product(D,D) if u+v==t}
    c.cq('sum-relation',n,rf'$A={st(D)}$ এবং $R=\{{(x,y)\in A\times A:x+y={t}\}}$।',[
        ('R-এর জন্য y-কে x-এর মাধ্যমে প্রকাশ কর।',rf'$y={t}-x$। তাই প্রতিটি প্রথম স্থানাঙ্কের সম্ভাব্য দ্বিতীয় স্থানাঙ্ক একটিমাত্র।'),
        ('R তালিকা পদ্ধতিতে প্রকাশ করে ডোমেন ও রেঞ্জ নির্ণয় কর।',rf'$R={pairs(R)}$। ডোমেন ও রেঞ্জ উভয়ই ${st(D)}$।'),
        (r'$R^{-1}=R$ কি না যাচাই করে R ফাংশন কি না বল।',rf'জোড়গুলোর স্থানাঙ্ক উল্টালে ${pairs({(v,u) for u,v in R})}$, মূল $R$-ই পাওয়া যায়, কারণ $x+y={t}$ প্রতিসম। প্রতিটি $x\in A$-এর জন্য একটিই $y\in A$ আছে; তাই $R$ ফাংশনও।')])
    D=set(range(n,n+4));a=n+1;k=n+2;image={a*u+k for u in D}
    c.cq('affine-map',n,rf'$A={st(D)}$, $B={st(image)}$ এবং $f:A\to B$, $f(x)={a}x+{k}$।',[
        (rf'$f({n})$ নির্ণয় কর।',rf'$f({n})={a}\times{n}+{k}={a*n+k}$।'),
        ('প্রতিটি ক্রমজোড় লিখে ফাংশনটির ডোমেন ও রেঞ্জ নির্ণয় কর।',rf'ক্রমজোড়গুলো ${pairs({(u,a*u+k) for u in D})}$। ডোমেন $A={st(D)}$, রেঞ্জ ${st(image)}=B$।'),
        ('ভিন্ন উপাদানের প্রতিচ্ছবি ভিন্ন কি না এবং B-এর প্রতিটি উপাদান পাওয়া যায় কি না ব্যাখ্যা কর।',rf'$f(u)=f(v)$ হলে ${a}u+{k}={a}v+{k}$; ${a}\ne0$ হওয়ায় $u=v$। তাই ভিন্ন উপাদানের মান ভিন্ন। খ অংশে সব মানের তালিকা $B$-এর সমান, তাই $B$-এর প্রতিটি উপাদান পাওয়া যায়।')])
    D={-n-1,-n,0,n,n+1};image={u*u for u in D}
    c.cq('square-map',n,rf'$A={st(D)}$ এবং $f:A\to\mathbb{{R}}$, $f(x)=x^2$।',[
        (rf'$f(-{n})$ ও $f({n})$ নির্ণয় কর।',rf'দুই ক্ষেত্রেই মান ${n*n}$, কারণ $(-{n})^2={n}^2$।'),
        ('সব ক্রমজোড় লিখে রেঞ্জ নির্ণয় কর।',rf'ক্রমজোড় ${pairs({(u,u*u) for u in D})}$। পুনরাবৃত্ত মান একবার নিয়ে রেঞ্জ ${st(image)}$; উপাদান সংখ্যা ৩।'),
        ('f ফাংশন হলেও এর বিপরীত অন্বয় রেঞ্জ থেকে A-তে ফাংশন নয় কেন?',rf'প্রতিটি $x\in A$-এর বর্গ একটিই, তাই $f$ ফাংশন। কিন্তু বিপরীত অন্বয়ে ${n*n}$-এর সঙ্গে ${-n}$ ও ${n}$—দুইটি ভিন্ন মান যুক্ত হয়। তাই ঠিক একটি প্রতিচ্ছবির শর্ত ব্যর্থ; বিপরীত অন্বয় ফাংশন নয়।')])
    a=n+1
    c.cq('rational-domain',n,rf'$f(x)=\frac{{x+{a}}}{{x-{a}}}$, বাস্তব চলক x।',[
        ('f-এর বাস্তব ডোমেন নির্ণয় কর।',rf'হর শূন্য হতে পারবে না: $x-{a}\ne0$। তাই ডোমেন $\mathbb{{R}}\setminus\{{{a}\}}$।'),
        (rf'$f(0)$ ও $f({2*a})$ নির্ণয় করে $f(x)-1$ সরল কর।',rf'$f(0)=-1$, $f({2*a})=3$। $f(x)-1=\frac{{x+{a}-(x-{a})}}{{x-{a}}}=\frac{{{2*a}}}{{x-{a}}}$, যেখানে $x\ne{a}$।'),
        (r'$f(x)=1$ হওয়া সম্ভব কি? $f(x)=3$-এর জন্য x নির্ণয় কর।',rf'$f(x)=1$ ধরলে $x+{a}=x-{a}$, অর্থাৎ ${2*a}=0$—অসম্ভব। আবার $f(x)=3$ থেকে $x+{a}=3x-{3*a}$; তাই $x={2*a}$, যা নিষিদ্ধ ${a}$ নয়। বসিয়ে মান ৩ মেলে।')])
    a=n+1
    c.cq('involution',n,rf'$f(x)=\frac{{x+{a}}}{{x-1}}$।',[
        ('f-এর বাস্তব ডোমেন নির্ণয় কর।',r'$x-1\ne0$, তাই ডোমেন $\mathbb{R}\setminus\{1\}$।'),
        (r'$f(x)-1$ সরল করে দেখাও যে f(x) কখনো ১ নয়।',rf'$f(x)-1=\frac{{x+{a}-x+1}}{{x-1}}=\frac{{{a+1}}}{{x-1}}$। লব ${a+1}\ne0$, তাই সংজ্ঞায়িত কোনো x-এ রাশিটি শূন্য নয়; $f(x)\ne1$।'),
        (r'$f(f(x))=x$ প্রমাণ কর এবং সংজ্ঞার শর্ত লেখ।',rf'$y=f(x)$ বসালে $f(y)=\frac{{y+{a}}}{{y-1}}=\frac{{(x+{a})+{a}(x-1)}}{{(x+{a})-(x-1)}}=\frac{{{a+1}x}}{{{a+1}}}=x$। মূল শর্ত $x\ne1$; খ অংশে $y\ne1$ প্রমাণিত বলে দ্বিতীয় প্রয়োগেও নতুন নিষিদ্ধ মান আসে না।')])
    total=70+2*n;aa=30+n;bb=28+n;both=10+n
    c.cq('two-clubs',n,f'একটি প্রতিষ্ঠানের {total} জন শিক্ষার্থীর মধ্যে বিজ্ঞান ক্লাবে {aa} জন, বিতর্ক ক্লাবে {bb} জন এবং উভয় ক্লাবে {both} জন আছে।',[
        ('শুধু বিজ্ঞান ক্লাবে কতজন আছে?',f'বিজ্ঞান ক্লাবের সদস্য থেকে উভয়ের সদস্য বাদ দিলে ${aa}-{both}={aa-both}$ জন।'),
        ('অন্তত একটি ক্লাবে এবং কোনো ক্লাবেই নেই এমন শিক্ষার্থীর সংখ্যা নির্ণয় কর।',f'অন্তত একটি $={aa}+{bb}-{both}={aa+bb-both}$ জন। কোনো ক্লাবেই নেই $={total}-{aa+bb-both}={total-aa-bb+both}$ জন।'),
        ('শুধু একটি ক্লাবে কতজন এবং চারটি নিঃছেদ ভাগের যোগ মোটের সমান কি না যাচাই কর।',f'শুধু বিতর্কে ${bb}-{both}={bb-both}$ জন। শুধু একটিতে ${aa-both}+{bb-both}={aa+bb-2*both}$ জন। চার ভাগের যোগ: শুধু বিজ্ঞান {aa-both} + শুধু বিতর্ক {bb-both} + উভয় {both} + কোনোটিই নয় {total-aa-bb+both} = {total}; তাই সব শিক্ষার্থী ঠিক একবার গোনা হয়েছে।')])
    # Feasible Venn atomic regions, not arbitrary/inconsistent triple counts.
    onlyA=8+n;onlyB=9+n;onlyC=10+n;ab=3;bc=4;ac=2;t=2+n;outside=5
    aa=onlyA+ab+ac+t;bb=onlyB+ab+bc+t;cc=onlyC+bc+ac+t;total=onlyA+onlyB+onlyC+ab+bc+ac+t+outside
    c.cq('three-clubs',n,rf'{total} জনের মধ্যে $n(A)={aa}$, $n(B)={bb}$, $n(C)={cc}$; $n(A\cap B)={ab+t}$, $n(B\cap C)={bc+t}$, $n(A\cap C)={ac+t}$, $n(A\cap B\cap C)={t}$।',[
        ('ঠিক A ও B-তে আছে কিন্তু C-তে নেই কতজন?',f'জোড়ার ছেদে তিনটির সদস্যও আছে। তাই ${ab+t}-{t}={ab}$ জন।'),
        ('অন্তত একটি সেটে এবং কোনো সেটেই নেই এমন সদস্যসংখ্যা নির্ণয় কর।',f'অন্তত একটিতে ${aa}+{bb}+{cc}-{ab+t}-{bc+t}-{ac+t}+{t}={total-outside}$ জন। কোনোটিতে নেই ${total}-{total-outside}={outside}$ জন।'),
        ('ঠিক একটি ও ঠিক দুটি সেটের সদস্যসংখ্যা আলাদা নির্ণয় করে মোট যাচাই কর।',f'শুধু A: ${aa}-{ab+t}-{ac+t}+{t}={onlyA}$; শুধু B: ${bb}-{ab+t}-{bc+t}+{t}={onlyB}$; শুধু C: ${cc}-{ac+t}-{bc+t}+{t}={onlyC}$। ঠিক একটি ${onlyA+onlyB+onlyC}$ জন। ঠিক দুটি $=({ab+t}-{t})+({bc+t}-{t})+({ac+t}-{t})={ab+bc+ac}$ জন। এদের সঙ্গে তিনটিতে {t} ও বাইরে {outside} যোগ করলে মোট {total} মেলে।')])
    U=set(range(1,2*n+7));A={u for u in U if u%2==0};B=U-A
    c.cq('parity-partition',n,rf'$U=\{{1,2,\ldots,{2*n+6}\}}$। $A$ হলো U-এর জোড় এবং $B$ হলো U-এর বিজোড় উপাদানের সেট।',[
        ('A ও B তালিকা পদ্ধতিতে লেখ।',rf'$A={st(A)}$ ও $B={st(B)}$।'),
        (r'$A\cup B$, $A\cap B$ এবং $A^c$ নির্ণয় কর।',rf'প্রতিটি স্বাভাবিক সংখ্যা হয় জোড় নয় বিজোড়। তাই $A\cup B=U={st(U)}$, $A\cap B=\varnothing$। U-এর সাপেক্ষে $A^c=B={st(B)}$।'),
        (r'$n(P(A))$ এবং $n(A\times B)$ নির্ণয় করে গণনার নিয়ম ব্যাখ্যা কর।',rf'$n(A)={len(A)}$, তাই উপসেট $2^{{{len(A)}}}={2**len(A)}$টি। $n(B)={len(B)}$; প্রতিটি প্রথম স্থানাঙ্কের জন্য B-এর সব দ্বিতীয় স্থানাঙ্ক পাওয়া যায়, তাই ক্রমজোড় ${len(A)}\times{len(B)}={len(A)*len(B)}$টি।')])
    D=set(range(-n-1,n+2));image={abs(u) for u in D}
    c.cq('absolute-map',n,rf'$A=\{{-{n+1},-{n},\ldots,0,\ldots,{n},{n+1}\}}$ এবং $f:A\to\mathbb{{R}}$, $f(x)=|x|$।',[
        (rf'$f(-{n+1})$ ও $f(0)$ নির্ণয় কর।',rf'পরমমান শূন্য থেকে দূরত্ব। তাই $f(-{n+1})={n+1}$ এবং $f(0)=0$।'),
        ('রেঞ্জ তালিকা পদ্ধতিতে লিখে ডোমেন ও রেঞ্জের উপাদান সংখ্যা নির্ণয় কর।',rf'রেঞ্জ ${st(image)}$। ডোমেনে ${2*n+3}$টি এবং রেঞ্জে ${n+2}$টি উপাদান। ঋণাত্মক-ধনাত্মক সমমানের উপাদানের প্রতিচ্ছবি একই হয়।'),
        ('ফাংশনটির বিপরীত অন্বয় রেঞ্জ থেকে A-তে ফাংশন কি না, নির্দিষ্ট জোড়া দিয়ে বিচার কর।',rf'মূল ফাংশনে $f(-1)=f(1)=1$। তাই বিপরীত অন্বয়ে $(1,-1)$ ও $(1,1)$ উভয়ই আছে। একই প্রথম স্থানাঙ্কের দুই ভিন্ন মান হওয়ায় বিপরীত অন্বয় ফাংশন নয়; তবে মূল f প্রতিটি input-এ একটিমাত্র পরমমান দেয়।')])

for n in range(1,6):
    a=n+2;A=set(range(n,n+4));B=set(range(n+2,n+6));U=set(range(n,n+9));R={(u,u+2) for u in A}
    c.sq('roster',n,rf'$A=\{{x\in\mathbb{{N}}:{n}\le x<{n+4}\}}$ তালিকা পদ্ধতিতে প্রকাশ কর।',rf'নিচের প্রান্ত অন্তর্ভুক্ত, উপরেরটি নয়। তাই $A={st(A)}$।')
    c.sq('union',n,rf'$A={st(A)}$, $B={st(B)}$ হলে $A\cup B$ নির্ণয় কর।',rf'যেকোনো এক সেটে আছে এমন উপাদান একবার নিয়ে $A\cup B={st(A|B)}$।')
    c.sq('intersection',n,rf'$A={st(A)}$, $B={st(B)}$ হলে $A\cap B$ নির্ণয় কর।',rf'উভয় সেটে আছে এমন সাধারণ উপাদান নিয়ে $A\cap B={st(A&B)}$।')
    c.sq('difference',n,rf'$A={st(A)}$, $B={st(B)}$ হলে $B\setminus A$ নির্ণয় কর।',rf'$B$-তে আছে অথচ $A$-তে নেই এমন উপাদানগুলো ${st(B-A)}$। পার্থক্যের ক্রম গুরুত্বপূর্ণ।')
    c.sq('complement',n,rf'$U={st(U)}$, $A={st(A)}$ হলে U-এর সাপেক্ষে $A^c$ নির্ণয় কর।',rf'$U$ থেকে $A$-এর উপাদান বাদ দিলে $A^c=U\setminus A={st(U-A)}$।')
    c.sq('power-count',n,rf'$A=\{{1,2,\ldots,{n+1}\}}$। $P(A)$-এর উপাদান সংখ্যা কত ও কেন?',rf'প্রতিটি {n+1}টি উপাদান নেওয়া বা না-নেওয়ার দুই উপায়। তাই মোট উপসেট তথা power set-এর উপাদান $2^{{{n+1}}}={2**(n+1)}$টি।')
    c.sq('proper-count',n,rf'{n+2}টি উপাদানবিশিষ্ট সেটের প্রকৃত উপসেট সংখ্যা নির্ণয় কর।',rf'মোট উপসেট $2^{{{n+2}}}$; সেটটি নিজে বাদ দিলে $2^{{{n+2}}}-1={2**(n+2)-1}$টি প্রকৃত উপসেট।')
    D={n,n+1};F={n+2,n+3}
    c.sq('cartesian',n,rf'$A={st(D)}$, $B={st(F)}$ হলে $A\times B$ তালিকাভুক্ত কর।',rf'প্রথম স্থানাঙ্ক $A$ থেকে এবং দ্বিতীয়টি $B$ থেকে নিয়ে $A\times B={pairs(set(product(D,F)))}$। মোট $2\times2=4$টি।')
    c.sq('domain-range',n,rf'$R={pairs(R)}$ অন্বয়ের ডোমেন ও রেঞ্জ নির্ণয় কর।',rf'প্রথম স্থানাঙ্কের সেট ডোমেন ${st(A)}$; দ্বিতীয় স্থানাঙ্কের সেট রেঞ্জ ${st({v for u,v in R})}$।')
    c.sq('finite-image',n,rf'$f:A\to\mathbb{{R}}$, $f(x)=2x+1$, $A={st(A)}$ হলে রেঞ্জ নির্ণয় কর।',rf'প্রতিটি উপাদানকে ২ দিয়ে গুণ করে ১ যোগ করলে রেঞ্জ ${st({2*u+1 for u in A})}$ পাওয়া যায়।')
    R2={(n,n+1),(n+2,n+3)}
    c.sq('inverse',n,rf'$R={pairs(R2)}$ হলে $R^{{-1}}$ নির্ণয় কর।',rf'প্রতিটি ক্রমজোড়ের স্থানাঙ্ক অদলবদল করি। তাই $R^{{-1}}={pairs({(v,u) for u,v in R2})}$। এটি বিপরীত অন্বয়, সংখ্যার গুণাত্মক বিপরীত নয়।')
    c.sq('function-test',n,rf'$R=\{{({n},{n+1}),({n},{n+2})\}}$ কি তার ডোমেন থেকে ফাংশন? কারণ দাও।',rf'না। একই প্রথম স্থানাঙ্ক ${n}$-এর দুইটি ভিন্ন প্রতিচ্ছবি ${n+1}$ ও ${n+2}$ আছে। ফাংশনে প্রতিটি input-এর ঠিক একটি output থাকতে হয়।')
    c.sq('rational-domain',n,rf'$f(x)=\frac{{x+1}}{{x-{n+1}}}$-এর বাস্তব ডোমেন নির্ণয় কর।',rf'হর শূন্য হতে পারে না: $x-{n+1}\ne0$। তাই ডোমেন $\mathbb{{R}}\setminus\{{{n+1}\}}$।')
    c.sq('evaluation',n,rf'$f(x)=x^2-{n}x+1$ হলে $f({n+2})$ নির্ণয় কর।',rf'$x={n+2}$ বসালে $f({n+2})=({n+2})^2-{n}({n+2})+1={2*n+5}$।')

# Explicit mathematical invariants independently enumerated for family formulas.
for n in range(1,11):
    a=n+2;A=set(range(1,a+1));B=set(range(a-1,2*a));U=set(range(1,3*a+1))
    assert len(A|B)==len(A)+len(B)-len(A&B)
    assert (U-(A|B))==(U-A)&(U-B)
    assert A-B==A&(U-B)
    assert sum(1 for _ in combinations(range(n+2),2))==(n+2)*(n+1)//2
for n in range(1,8):
    a=n+1
    f=(x+a)/(x-1)
    eq(S.cancel(f.subs(x,f)),x)
    f=(x+a)/(x-a)
    eq(S.cancel(f-1),2*a/(x-a))
for bank in [b,c]:
    for meta in bank.audit:
        if 'answerExpression' not in meta:continue
        answer=S.sympify(meta['answerExpression']);choices=list(map(S.sympify,meta['choiceExpressions']))
        assert len(choices)==4
        assert [k for k,v in zip('ABCD',choices) if S.simplify(answer-v)==0]==[meta['correct']]
        assert all(S.simplify(u-v)!=0 for u,v in combinations(choices,2))

manifest=dict(status='NUMERICAL_TARGETS_MET_DRAFT_TEACHER_REVIEW_PENDING_NOT_IMPORTED',teacherApproved=False,
    importedCounts=dict(MCQ=0,CQ=0,SQ=0),sourcePriority=['reviewed-board-seeds-first','original-chapter-practice-for-remainder'],
    originalSourcePreference=['board-paper','NCTB-textbook','other-online-source'],
    sourceLimitations=['Only previously visually reviewed board seeds are transcribed; exhaustive board collection was not completed.',
        'NCTB full chapter/edition was not obtained; no original practice is claimed as a verbatim textbook exercise.',
        'Third-party index was read only for chapter/topic corroboration; exercise pages returned no usable body. No questions were copied from them.',
        'User numeric targets are met using disclosed parameter variants, not 760 distinct mathematical concepts. Independent teacher review remains pending.',
        'Prepared import files/registry and Drive backups are not proof of live database import or approval.'],
    alignmentReferences=[dict(url=REF,read='chapter/topic index only',purpose='chapter 1 real/rational/irrational/decimal; chapter 2 sets and domain/range; NOT question attribution')],chapters=[])
for bank,target in [(b,dict(MCQ=200,CQ=50,SQ=40)),(c,dict(MCQ=300,CQ=100,SQ=70))]:
    counts={k:sum(q['type']==k for q in bank.rows) for k in target};assert counts==target,(bank.ch,counts)
    assert len({q['text'] for q in bank.rows})==len(bank.rows)
    # Keep source snapshot files immutable, publish new versioned complete slices.
    bykind={kind:[q for q in bank.rows if q['type']==kind] for kind in target}
    chunks=[('mcq-1',bykind['MCQ'][:200])]
    if len(bykind['MCQ'])>200:chunks.append(('mcq-2',bykind['MCQ'][200:]))
    chunks.append(('written',bykind['CQ']+bykind['SQ']))
    files=[]
    metaByObject={id(q):meta for q,meta in zip(bank.rows,bank.audit)}
    for q,meta in zip(bank.rows,bank.audit):
        meta['questionSha256']=hashlib.sha256((q['type']+'\n'+q['text']).encode()).hexdigest()
    for label,rows in chunks:
        for position,q in enumerate(rows,1):
            metaByObject[id(q)].update(file=f'chapter-{bank.ch}/target-v1/{label}.json',itemInFile=position)
        assert 0<len(rows)<=200
        scope={**bank.scope,'book':'Proshnobook — যাচাইকৃত বোর্ড সংকলন + নিজস্ব অধ্যায়ভিত্তিক অনুশীলনী',
            'edition':'Target completion v1; DRAFT; স্বাধীন শিক্ষক অনুমোদন বাকি', 'sourceUrl':OWN,'items':rows}
        files.append(emit(BASE/f'chapter-{bank.ch}/target-v1/{label}.json',scope))
    orig=Counter(m['family'] for m in bank.audit if m['origin'].startswith('ORIGINAL'))
    review=dict(status=manifest['status'],teacherApproved=False,targetMet=True,targetCounts=target,counts=counts,
        remaining={k:0 for k in target},importedCounts=dict(MCQ=0,CQ=0,SQ=0),databaseCountVerified=False,
        boardCounts={k:sum(q['type']==k for q in bank.seeds) for k in target},
        originalPracticeCounts={k:counts[k]-sum(q['type']==k for q in bank.seeds) for k in target},
        fullChapterTextbookRead=False,boardSearchExhaustive=False,practiceFamilies=dict(sorted(orig.items())),
        limitations=manifest['sourceLimitations'],files=files,itemReviews=bank.audit)
    reviewfile=emit(BASE/f'chapter-{bank.ch}/target-v1/validation.json',review)
    manifest['chapters'].append(dict(chapter=bank.ch,category=bank.scope['category'],subject=bank.scope['subject'],topic=bank.scope['topic'],counts=counts,boardCounts=review['boardCounts'],originalPracticeCounts=review['originalPracticeCounts'],files=files,validation=reviewfile))
emit(BASE/'targets-v1-manifest.json',manifest)
print('PASS: chapter 1 200 MCQ / 50 CQ / 40 SQ; chapter 2 300 MCQ / 100 CQ / 70 SQ; total 760, including 13 immutable board-seed items. DRAFT, NOT IMPORTED.')
