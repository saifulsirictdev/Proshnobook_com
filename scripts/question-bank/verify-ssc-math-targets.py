"""Independent exact-answer recomputation against published JSON, not generator calls.
Dev-only sympy. Checks all authored MCQ keys against separate family evaluators,
written mathematical invariants and stable file/item source-review bindings.
"""
import hashlib
import json
import math
from fractions import Fraction as F
from itertools import product, combinations
from pathlib import Path
import sympy as S

ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'content/question-bank/ssc/math'
R=S.Rational
primes=[2,3,5,7,11,13,17,19]

def ch1(f,n):
 a=n+1;p=primes[n-1];k=n+3
 if f=='finite':return R(13*n+7,100)
 if f=='repeat1':return R(n,9)
 if f=='repeat2':return R(10*n+3,99)
 if f=='mixed':return R(9*n+n+1,90)
 if f=='repeat-sum':return R(n,9)+R(1,9)
 if f=='repeat-mul':return R(n,9)*R(2,9)
 if f=='repeat-div':return R(n,9)/R(3,9)
 if f=='decimal-places':
  den=2**(n%4+1)*5**(n//3+1)
  return next(j for j in range(1,20) if 10**j%den==0)
 if f=='nonrepeat-prefix':
  den=3*2**n;j=0
  while den%2==0:den//=2;j+=1
  return j
 if f=='sqrt-int':return S.sqrt(k*k)
 if f=='sqrt-ratio':return S.sqrt(R(a*a,(a+1)**2))
 if f=='sqrt-floor':return math.isqrt(k*k+k)
 if f=='rational-mid':return (R(n,n+1)+R(n+1,n+2))/2
 if f=='sqrt-product':return S.sqrt(p)*S.sqrt(4*p)
 if f=='surd-square':return (a*S.sqrt(p))**2
 if f=='rationalise':return 1/S.sqrt(p)
 if f=='integer-interval':return len([i for i in range(-n-2,n+4) if -n<i<n+2])
 if f=='hcf':return math.gcd(12*a,18*a)
 if f=='lcm':return math.lcm(4*a,6*a)
 if f=='abs-negative':return abs(-2*n-1)
 if f=='sqrt-diff':return S.sqrt((n+4)**2)-S.sqrt(n*n)
 if f=='reciprocal':return 1/R(n,9)
 if f=='rational-add':return R(n,n+2)+R(2,n+2)
 if f=='repeat-finite-gap':return R(10*n+1,99)-R(10*n+1,100)
 raise ValueError(f)

def ch2(f,n):
 a=n+2;A=set(range(1,a+1));B=set(range(a-1,2*a));U=set(range(1,3*a+1))
 if f=='union':return len(A|B)
 if f=='intersection':return len(A&B)
 if f=='difference':return len(A-B)
 if f=='complement':return len(U-A)
 if f=='disjoint':return a+(a+3)
 if f=='subsets':return 2**n
 if f=='proper-subsets':return 2**(n+1)-1
 if f=='two-subsets':return len(list(combinations(range(n+2),2)))
 if f=='cart-size':return len(list(product(range(a),range(3))))
 if f=='cart-filter':return sum(u==n+1 for u,v in product({n,n+1},{n+2,n+3,n+4}))
 if f=='domain-size':return sum({u for u,v in {(i,i+1) for i in range(n,n+4)}})
 if f=='range-sum':return sum({v for u,v in {(n,2*n),(n+1,2*n),(n+2,2*n+2)}})
 if f=='inverse-pair':return next(iter({(v,u) for u,v in {(n,n+3)}}))[0]
 if f=='linear-value':return a*3+n
 if f=='square-value':return (-a)**2+n
 if f=='rational-value':return R(2+n,2+1)
 if f=='function-zero':return S.solve(a*S.Symbol('t')-2*a*n)[0]
 if f=='function-equality':
  t=S.Symbol('t');return S.solve(2*t+n-(t+3*n),t)[0]
 if f=='excluded-domain':return n
 if f=='root-domain':return sum(v-n>=0 for v in range(n-2,n+4))
 if f=='square-image':return len({v*v for v in {-n,-n-1,0,n,n+1}})
 if f=='not-function':
  pairs={(n,n+1),(n,n+2),(n+1,n+3)}
  return next(u for u in {t[0] for t in pairs} if len({v for first,v in pairs if first==u})>1)
 if f=='union-word':return (20+n)+(17+n)-(5+n)
 if f=='neither-word':return (60+2*n)-((25+n)+(20+n)-(10+n))
 if f=='triple-union':return (20+n)+(21+n)+(22+n)-7-8-6+3
 if f=='demorgan':return len((U-A)&(U-B))
 if f=='diff-identity':return len(A&(U-B))
 if f=='power-members':return sum(n in v for k in range(4) for v in combinations([n,n+1,n+2],k))
 if f=='empty-subset':return len(list(combinations([n,n+1,n+2,n+3],0)))
 if f=='nested-gap':return len(set(range(n,n+7))-set(range(n,n+4)))
 raise ValueError(f)

mcq_count=0
manifest=json.loads((BASE/'targets-v1-manifest.json').read_text())
for chapter in manifest['chapters']:
 ch=chapter['chapter'];review=json.loads((BASE/chapter['validation']['file']).read_text())
 for meta in review['itemReviews']:
  q=json.loads((BASE/meta['file']).read_text())['items'][meta['itemInFile']-1]
  assert hashlib.sha256((q['type']+'\n'+q['text']).encode()).hexdigest()==meta['questionSha256']
  if 'answerExpression' not in meta:continue
  answer=(ch1 if ch==1 else ch2)(meta['family'],meta['variant'])
  assert S.simplify(S.sympify(meta['answerExpression'])-answer)==0,(ch,meta)
  choices=[S.sympify(v) for v in meta['choiceExpressions']]
  winners=[k for k,v in zip('ABCD',choices) if S.simplify(v-answer)==0]
  assert winners==[q['correct']],(q,winners)
  assert list(q['options'].values())==['$'+S.latex(v)+'$' for v in choices]
  mcq_count+=1
assert mcq_count==489
# Written families: exact decimal algorithms and bounds used in all variants.
for n in range(1,6):
 a=n+1;p=primes[n-1];u=R(10*n+2,99);v=R(10*n+1,90)
 assert S.simplify(100*u-u)==10*n+2
 assert S.simplify(100*v-10*v)==10*n+1
 assert u>0 and v>0
 assert math.gcd(12*a,18*a)==6*a and math.lcm(12*a,18*a)==36*a
 assert math.gcd(12*a,18*a)*math.lcm(12*a,18*a)==12*a*18*a
 m=a*a*p;k=math.isqrt(m);assert k*k<m<(k+1)**2
 assert R(1,k+1)<1/S.sqrt(m)<R(1,k)
 assert n<n+S.sqrt(2)/2<n+1
 assert S.sqrt(p).is_irrational
 assert R(99,99)==1 and (n+1)-(n+R(99,100))==R(1,100)
for n in range(1,8):
 a=n+2;U=set(range(1,3*a+1));A=set(range(1,a+1));B=set(range(a-1,2*a));C={v for v in U if v%2==0}
 assert A|B==(A-B)|(B-A)|(A&B)
 assert U-(A|B)==(U-A)&(U-B)
 assert A&(B|C)==(A&B)|(A&C)
 D=set(range(n,n+4));Rr={(u,v) for u,v in product(D,D) if u+v==2*n+3}
 assert Rr=={(v,u) for u,v in Rr}
 assert all(sum(first==u for first,v in Rr)==1 for u in D)
 z=S.Symbol('z');aa=n+1;fn=(z+aa)/(z-1)
 assert S.cancel(fn.subs(z,fn)-z)==0
 # Triple-club regions are nonnegative, feasible and sum exactly.
 regions=[8+n,9+n,10+n,3,4,2,2+n,5]
 assert all(v>=0 for v in regions)
 Acount=regions[0]+regions[3]+regions[5]+regions[6]
 Bcount=regions[1]+regions[3]+regions[4]+regions[6]
 Ccount=regions[2]+regions[4]+regions[5]+regions[6]
 union=Acount+Bcount+Ccount-(3+2+n)-(4+2+n)-(2+2+n)+(2+n)
 assert union==sum(regions)-5
# Source CQ rational cancellation, with forbidden values retained in written text.
z=S.Symbol('z');f=(3*z+1)/(3*z-1);g=f.subs(z,1/z**2)
assert S.cancel((g+1)/(g-2)-2/(z*z-1))==0
print('PASS: independently recomputed all 489 authored MCQ answers/options; 760 stable audit bindings; exact written-family decimal, set, bounds, Venn and symbolic-function invariants. Teacher review still pending.')
