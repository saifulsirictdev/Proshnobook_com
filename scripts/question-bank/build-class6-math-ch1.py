"""Build original practice drafts; not copied/official/page-verified questions.
Run from repository root. Standard library only. Does NOT connect to a DB.
"""
import json, math, sys
from fractions import Fraction as F
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'content/question-bank/class-6'
def emit(name, content):
    path=OUT/name
    if '--check' in sys.argv:
        assert path.read_text()==content, f'Stale or edited batch: {name}; rebuild and review'
    else:
        path.write_text(content)
BN=str.maketrans('0123456789','০১২৩৪৫৬৭৮৯')
def bn(x): return str(x).translate(BN)
def fmt(x):
    x=F(x)
    return bn(x.numerator) if x.denominator==1 else f'{bn(x.numerator)}/{bn(x.denominator)}'
rows=[]; checks=[]
def add(kind,args,question,answer,explanation,alternatives=None):
    answer=F(answer)
    candidates=[F(x) for x in (alternatives or [])]+[answer+1,answer-1,answer+2,answer/2,answer+3]
    distract=[]
    for x in candidates:
        if x!=answer and x not in distract: distract.append(x)
        if len(distract)==3:break
    assert len(distract)==3
    pos=len(rows)%4
    choices=distract[:];choices.insert(pos,answer)
    rows.append(dict(text=question,options=dict(zip('ABCD',map(fmt,choices))),correct='ABCD'[pos],explanation=explanation,page='প্রযোজ্য নয়—নিজস্ব অনুশীলনী; মূল বইয়ের পৃষ্ঠা যাচাই বাকি',difficulty='EASY' if kind in ['place','next','remainder','part','decimal'] else 'MEDIUM'))
    checks.append(dict(kind=kind,args=args,expected=str(answer),values=list(map(str,choices))))
for i in range(4):
    n=3254+1111*i;digit=(n//100)%10
    add('place',[n,100],f'{bn(n)} সংখ্যাটিতে শতকের অঙ্কের স্থানীয় মান কত?',digit*100,f'শতকের অঙ্ক {bn(digit)}; স্থানীয় মান {bn(digit)} × ১০০ = {bn(digit*100)}।')
    start=16+7*i
    add('next',[start],f'{bn(start)}, {bn(start+1)}, {bn(start+2)}—পরবর্তী স্বাভাবিক সংখ্যা কত?',start+3,'ক্রমটিতে প্রতিবার ১ যোগ হয়েছে। তাই শেষ সংখ্যার সঙ্গে ১ যোগ করতে হবে।')
    digits=[i+1,i+2,i+3,i+4];ans=int(''.join(map(str,sorted(digits,reverse=True))))
    add('largest',digits,f'{", ".join(map(bn,digits))} অঙ্কগুলো প্রত্যেকটি একবার ব্যবহার করে গঠিত বৃহত্তম চার অঙ্কের সংখ্যা কত?',ans,'বৃহত্তম সংখ্যা পেতে অঙ্কগুলো বড় থেকে ছোট ক্রমে সাজাতে হয়।', [int(''.join(map(str,digits))),ans-90,ans-900])
    a=36+12*i;b=48+12*i;g=math.gcd(a,b)
    add('gcd',[a,b],f'{bn(a)} ও {bn(b)}-এর গসাগু কত?',g,f'উভয় সংখ্যার সাধারণ গুণনীয়কগুলোর মধ্যে বৃহত্তমটি {bn(g)}।',[g//2,math.lcm(a,b),g*2])
    a=8+2*i;b=12+3*i;l=math.lcm(a,b)
    add('lcm',[a,b],f'{bn(a)} ও {bn(b)}-এর লসাগু কত?',l,f'উভয় সংখ্যা দ্বারা নিঃশেষে বিভাজ্য ক্ষুদ্রতম ধনাত্মক সংখ্যা {bn(l)}।',[math.gcd(a,b),a*b,l*2])
    n=157+19*i;d=7+i;r=n%d
    add('remainder',[n,d],f'{bn(n)}-কে {bn(d)} দিয়ে ভাগ করলে ভাগশেষ কত?',r,f'{bn(n)} = {bn(d)} × {bn(n//d)} + {bn(r)}।',[x for x in range(d) if x!=r])
    d=7+2*i;ans=999//d*d
    add('maxmultiple',[d],f'{bn(d)} দ্বারা বিভাজ্য বৃহত্তম তিন অঙ্কের সংখ্যা কত?',ans,f'৯৯৯ থেকে {bn(d)} দিয়ে ভাগের ভাগশেষ {bn(999%d)} বাদ দিলে {bn(ans)} পাওয়া যায়।',[ans-d,ans-2*d,ans+1])
    n=[12,18,20,28][i];factors=[x for x in range(1,n+1) if n%x==0]
    add('factors',[n],f'{bn(n)}-এর ধনাত্মক গুণনীয়কের সংখ্যা কত?',len(factors),f'গুণনীয়কগুলো: {", ".join(map(bn,factors))}। মোট {bn(len(factors))}টি।')
    primes=[11,17,23,29];p=primes[i]
    # Exactly one prime; all alternatives are composite.
    add('prime',[p],f'{bn(p)}, {bn(12+6*i)}, {bn(15+6*i)} ও {bn(21+6*i)}-এর মধ্যে কোন সংখ্যাটি মৌলিক?',p,'মৌলিক সংখ্যার ধনাত্মক গুণনীয়ক ঠিক দুটি—১ এবং সংখ্যাটি নিজে।',[12+6*i,15+6*i,21+6*i])
    n=12+6*i;divisors=[2,3,6,9];d=divisors[i]
    add('quotient',[n*d,d],f'{bn(n*d)} ÷ {bn(d)} = কত?',n,f'{bn(d)} × {bn(n)} = {bn(n*d)}।')
    a=i+2;b=i+5;k=i+3
    add('missing',[a,b,k],f'{bn(a)}/{bn(b)} = □/{bn(b*k)} হলে □-এর মান কত?',a*k,f'হর {bn(k)} গুণ হয়েছে, তাই লবও {bn(k)} গুণ: {bn(a)} × {bn(k)} = {bn(a*k)}।')
    a=6+2*i;b=[15,20,35,42][i];v=F(a,b)
    add('simplify',[a,b],f'{bn(a)}/{bn(b)}-এর সরলতম রূপ কোনটি?',v,f'লব ও হরকে তাদের গসাগু {bn(math.gcd(a,b))} দিয়ে ভাগ করলে {fmt(v)}।',[F(a+1,b),F(a,b+1),F(b,a)])
    a=F(1,i+3);b=F(1,i+4);c=F(1,i+5);d=F(1,i+6)
    add('greatestunit',[i+3,i+4,i+5,i+6],f'{fmt(a)}, {fmt(b)}, {fmt(c)} ও {fmt(d)}-এর মধ্যে কোন ভগ্নাংশটি সবচেয়ে বড়?',a,'ধনাত্মক একক ভগ্নাংশগুলোর হর যত ছোট, ভগ্নাংশ তত বড়।',[b,c,d])
    a=F(i+1,i+3);b=F(1,i+4)
    add('add',[str(a),str(b)],f'{fmt(a)} + {fmt(b)} = কত?',a+b,'সমহর করে লব যোগ করতে হয়। সঠিক যোগফল '+fmt(a+b)+'।',[a-b,a*b,a/b])
    a=F(i+3,i+4);b=F(1,i+3)
    add('subtract',[str(a),str(b)],f'{fmt(a)} − {fmt(b)} = কত?',a-b,'সমহর করে প্রথম লব থেকে দ্বিতীয় লব বিয়োগ করলে '+fmt(a-b)+' পাওয়া যায়।',[a+b,a*b,a/b])
    a=F(i+2,i+5);b=F(i+3,i+6)
    add('multiply',[str(a),str(b)],f'{fmt(a)} × {fmt(b)} = কত?',a*b,'লবের সঙ্গে লব এবং হরের সঙ্গে হর গুণ করে সরল করলে '+fmt(a*b)+'।',[a+b,a/b,a-b])
    a=F(i+2,i+3);b=F(i+1,i+4)
    add('divide',[str(a),str(b)],f'{fmt(a)} ÷ {fmt(b)} = কত?',a/b,'প্রথম ভগ্নাংশকে দ্বিতীয় ভগ্নাংশের উল্টো ভগ্নাংশ দিয়ে গুণ করলে '+fmt(a/b)+'।',[a*b,a+b,a-b])
    whole=i+2;num=i+1;den=i+3;v=whole+F(num,den)
    add('mixed',[whole,num,den],f'{bn(whole)} পূর্ণ {bn(num)}/{bn(den)}-কে অপ্রকৃত ভগ্নাংশে প্রকাশ করলে কোন মান পাওয়া যায়?',v,f'নতুন লব = {bn(whole)} × {bn(den)} + {bn(num)}; হর অপরিবর্তিত। মান {fmt(v)}।',[F(whole+num,den),F(whole*den-num,den),F(whole*num,den)])
    quantity=60+30*i;fraction=F(i+1,i+3)
    add('part',[quantity,str(fraction)],f'{bn(quantity)}টি আমের {fmt(fraction)} অংশ পাকা। পাকা আম কয়টি?',quantity*fraction,f'পাকা আম = {bn(quantity)} × {fmt(fraction)} = {fmt(quantity*fraction)}টি।')
    used=F(i+1,i+5)
    add('remaining',[str(used)],f'একটি ফিতার {fmt(used)} অংশ ব্যবহার করা হলো। অবশিষ্ট অংশ কত?',1-used,'সম্পূর্ণ ফিতা ১ অংশ। অবশিষ্ট = ১ − '+fmt(used)+' = '+fmt(1-used)+'।',[used,1+used,used/2])
    a=6+i*2;b=9+i*3;l=math.lcm(a,b)
    add('bells',[a,b],f'দুটি ঘণ্টা যথাক্রমে {bn(a)} ও {bn(b)} মিনিট পরপর বাজে। একসঙ্গে বাজার কত মিনিট পর প্রথম আবার একসঙ্গে বাজবে?',l,'সময় দুটির লসাগু '+bn(l)+' মিনিট পরে প্রথম আবার একসঙ্গে বাজবে।',[math.gcd(a,b),a+b,a*b])
    a=24+12*i;b=36+18*i;g=math.gcd(a,b)
    add('packets',[a,b],f'{bn(a)}টি কলম ও {bn(b)}টি পেনসিল কোনোটি অবশিষ্ট না রেখে সর্বাধিক কতজনকে সমানভাবে দেওয়া যাবে? প্রত্যেকে সমানসংখ্যক কলম এবং সমানসংখ্যক পেনসিল পাবে।',g,'সর্বাধিক ব্যক্তির সংখ্যা = '+bn(a)+' ও '+bn(b)+'-এর গসাগু = '+bn(g)+'।',[g//2,g*2,math.lcm(a,b)])
    n=[25,45,65,85][i];v=F(n,100)
    add('decimal',[n],f'দশমিক {bn("0."+str(n))}-এর সমান সাধারণ ভগ্নাংশ কোনটি?',v,'দশমিকের পরে দুই অঙ্ক, তাই '+bn(n)+'/১০০; সরল করলে '+fmt(v)+'।',[F(n,10),F(n+1,100),F(100,n)])
    a=12+6*i;b=18+9*i;g=math.gcd(a,b);l=math.lcm(a,b)
    add('product',[a,b],f'{bn(a)} ও {bn(b)}-এর গসাগু ও লসাগুর গুণফল কত?',g*l,'দুটি ধনাত্মক পূর্ণসংখ্যার গসাগু × লসাগু = সংখ্যা দুটির গুণফল = '+bn(a*b)+'।',[g+l,a+b,l])
    total=(i+3)*(i+4);each=F(3+i,4);ans=F(total)/each
    assert ans.denominator == 1
    add('bottles',[total,str(each)],f'{bn(total)} লিটার পানি দিয়ে প্রতিটি {fmt(each)} লিটার ধারণক্ষমতার কতটি বোতল সম্পূর্ণ ভরা যাবে?',ans,'বোতলের সংখ্যা = মোট পানি ÷ এক বোতলের ধারণক্ষমতা = '+bn(total)+' ÷ '+fmt(each)+' = '+fmt(ans)+'।')
assert len(rows)==100,len(rows)
# Independent answer checks: brute-force divisor/multiple searches rather than
# production gcd/lcm expressions. Exact rational equivalence for every option.
def verify(c):
    k=c['kind'];a=c['args']
    gcd=lambda x,y:max(d for d in range(1,min(x,y)+1) if x%d==y%d==0)
    lcm=lambda x,y:next(d for d in range(max(x,y),x*y+1) if d%x==d%y==0)
    if k=='place':return a[0]//a[1]%10*a[1]
    if k=='next':return list(range(a[0],a[0]+4))[-1]
    if k=='largest':return max(int(''.join(map(str,p))) for p in __import__('itertools').permutations(a))
    if k in ['gcd','packets']:return gcd(*a)
    if k in ['lcm','bells']:return lcm(*a)
    if k=='remainder':return a[0]-a[0]//a[1]*a[1]
    if k=='maxmultiple':return max(x for x in range(100,1000) if x%a[0]==0)
    if k=='factors':return sum(a[0]%d==0 for d in range(1,a[0]+1))
    if k=='prime':
        vals=list(map(F,c['values']));p=[v for v in vals if v.denominator==1 and v>1 and all(v.numerator%d for d in range(2,math.isqrt(v.numerator)+1))];assert len(p)==1;return p[0]
    if k=='quotient':return F(*a)
    if k=='missing':return F(a[0],a[1])*(a[1]*a[2])
    if k=='simplify':return F(*a)
    if k=='greatestunit':return max(F(1,d) for d in a)
    if k in ['add','subtract','multiply','divide']:
        x,y=map(F,a)
        return {'add':lambda:x+y,'subtract':lambda:x-y,'multiply':lambda:x*y,'divide':lambda:x/y}[k]()
    if k=='mixed':return F(a[0]*a[2]+a[1],a[2])
    if k=='part':return a[0]*F(a[1])
    if k=='remaining':return 1-F(a[0])
    if k=='decimal':return F(str(a[0]/100))
    if k=='product':return a[0]*a[1]
    if k=='bottles':return F(a[0])/F(a[1])
    raise AssertionError(k)
for row,c in zip(rows,checks):
    expected=F(verify(c));values=list(map(F,c['values']))
    assert expected==F(c['expected'])
    assert len(set(values))==4 and values.count(expected)==1
    assert values['ABCD'.index(row['correct'])]==expected
    assert all(F(v.translate(str.maketrans('০১২৩৪৫৬৭৮৯','0123456789')))==x for v,x in zip(row['options'].values(),values))
assert len({r['text'] for r in rows})==100
batch=dict(subject='গণিত',topic='১. স্বাভাবিক সংখ্যা ও ভগ্নাংশ',book='নিজস্ব গণিত অনুশীলনী—স্বাভাবিক সংখ্যা ও ভগ্নাংশ',edition='খসড়া; ২০২৬ মূল বইয়ের পূর্ণ বিষয়সীমা যাচাই বাকি',sourceUrl='https://www.bdmyschool.com/item/650/ষষ্ঠ-শ্রেণি-গণিত-সমাধান-অধ্যায়সমূহ',lang='Bangla',items=rows)
OUT.mkdir(parents=True,exist_ok=True)
emit('math-ch1-draft.json', json.dumps(batch,ensure_ascii=False,indent=2)+'\n')
md='# ষষ্ঠ শ্রেণি গণিত — অধ্যায় ১: ১০০টি নিজস্ব MCQ (Draft)\n\nএটি মূল বই থেকে উদ্ধৃত/অফিসিয়াল প্রশ্ন নয়। অনলাইন সূচির সাহায্যে অধ্যায়ের নাম মিলিয়ে নিজস্ব অনুশীলনী রচিত। মূল বইয়ের পৃষ্ঠা ও পূর্ণ পাঠ্যক্রমের সামঞ্জস্য যাচাই বাকি। গাণিতিক হিসাব প্রোগ্রাম দিয়ে পরীক্ষা হয়েছে; শিক্ষক-পর্যালোচনা বাকি। সরাসরি প্রকাশ নয়।\n\n'
for i,r in enumerate(rows,1):
    md+=f'## {bn(i)}. {r["text"]}\n\n'
    md+='\n'.join(f'- {k}. {v}' for k,v in r['options'].items())+'\n\n'
    md+=f'**উত্তর: {r["correct"]}** — {r["explanation"]}\n\n'
emit('math-ch1-review.md', md)
report=dict(total=100,skills=len(set(c['kind'] for c in checks)),exactRationalChecks='100/100 passed',distinctOptionChecks='100/100 passed',correctPositions={k:sum(r['correct']==k for r in rows) for k in 'ABCD'},exactDuplicateStems=0,textbookPageVerified=False,subjectExpertReviewed=False,productionImported=0)
emit('math-ch1-validation.json', json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report,ensure_ascii=False))
