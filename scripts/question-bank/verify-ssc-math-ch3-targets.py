"""Read published artifacts and recompute authored answers independently.
Does not import or execute the generator. sympy==1.14.0, development only.
"""
import hashlib
import json
from pathlib import Path
import sympy as S
ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'content/question-bank/ssc/math/chapter-3'
x=S.Symbol('x');R=S.Rational

def expected(f,n):
 a=n+1;b=n+2;t=n+3
 if f=='sum-square':return (a+b)**2-2*a*b
 if f=='diff-square':return (a+b)**2-4*a*b
 if f=='four-product':return (2*n+5)**2-3**2
 if f=='cube-sum':return a**3+b**3
 if f=='cube-diff':return (n+1)**3+3*(n+1)*(n+2)
 if f=='fourth-sum':return a**4+b**4
 if f=='recip-square':return t*t-2
 if f=='recip-cube':return t**3-3*t
 if f=='recip-diff-square':return t*t+2
 if f=='recip-diff-cube':return t**3+3*t
 if f=='factor-quadratic':return x*x+(a+b)*x+a*b
 if f=='factor-diff-square':return x*x-a*a
 if f=='factor-cube-sum':return x**3+a**3
 if f=='factor-cube-diff':return x**3-a**3
 if f=='factor-group':return x**3+a*x*x-b*b*x-a*b*b
 if f=='factor-fourth':return x**4+4*a**4
 if f=='remainder-linear':return S.rem(x**3+n*x+1,x-2,x)
 if f=='remainder-scaled':return S.rem(x**3+n*x*x+2*x+n,2*x-1,x)
 if f=='root-parameter':return -((-n-1)**2+n*(-n-1))
 if f=='cube-coefficient':return S.diff((2*x+n)**3,x,2).subs(x,0)/2
 if f=='conjugate-product':return S.sqrt(n+2)**2-S.sqrt(n+1)**2
 if f=='conjugate-inverse':return 1/(S.sqrt(n+2)+S.sqrt(n+1))
 if f=='cancel-domain':return S.div(x*x-a*a,x+a,x)[0]
 if f=='distinct-factors':return len(S.factor_list(x*x+(2*n+1)*x+n*(n+1),x)[1])
 if f=='product-middle':return S.diff((x+a)*(x+b),x).subs(x,0)
 if f=='three-zero-sum':return n**3+(n+1)**3+(-2*n-1)**3
 if f=='three-square-gap':return (n+n+1+n+2)**2-n*n-(n+1)**2-(n+2)**2
 if f=='sum-square-to-cube':return (n+1)**3+2**3
 if f=='fourth-coefficient':return S.diff((x+n)**4,x,3).subs(x,0)/6
 if f=='excluded-positive':return max(S.solve(x*x-a*a,x))
 raise ValueError(f)

manifest=json.loads((BASE/'targets-v1-manifest.json').read_text())
review=json.loads((BASE/manifest['validation']['file']).read_text())
for f in manifest['files']+[manifest['validation']]:
 b=(BASE/f['file']).read_bytes()
 assert len(b)==f['bytes'] and hashlib.sha256(b).hexdigest()==f['sha256']
mcqs=written=checks=0
for meta in review['itemReviews']:
 q=json.loads((BASE/meta['file']).read_text())['items'][meta['itemInFile']-1]
 assert hashlib.sha256((q['type']+'\n'+q['text']).encode()).hexdigest()==meta['questionSha256']
 if meta['origin']=='TRANSCRIBED_BOARD_COMPILATION':continue
 assert not q.get('provenance') and 'নিজস্ব অনুশীলনী' in q['page']
 if q['type']=='MCQ':
  actual=expected(meta['family'],meta['variant'])
  assert S.simplify(actual-S.sympify(meta['answerExpression']))==0,(meta,actual)
  choices=list(map(S.sympify,meta['choiceExpressions']))
  assert [k for k,v in zip('ABCD',choices) if S.simplify(v-actual)==0]==[q['correct']]
  mcqs+=1
 else:
  assert meta['exactChecks'];written+=1
  for pair in meta['exactChecks']:
   assert S.simplify(S.sympify(pair['lhs'])-S.sympify(pair['rhs']))==0,(meta,pair)
   checks+=1
# Additional general identities independent of specific published witnesses.
a,b,c=S.symbols('a b c')
assert S.expand((a+b)**3-3*a*b*(a+b)-a**3-b**3)==0
assert S.expand((a-b)**3+3*a*b*(a-b)-a**3+b**3)==0
assert S.expand((a+b+c)*(a*a+b*b+c*c-a*b-b*c-c*a)-(a**3+b**3+c**3-3*a*b*c))==0
assert S.cancel((x+1/x)**3-3*(x+1/x)-(x**3+x**-3))==0
assert S.cancel((x-1/x)**3+3*(x-1/x)-(x**3-x**-3))==0
assert mcqs==294 and written==249
assert len(review['itemReviews'])==550
print(f'PASS: 294 authored MCQ independently recomputed; {written} written items / {checks} exact witnesses verified; 550 file/item/hash bindings and all file hashes checked. Not independent teacher approval.')
