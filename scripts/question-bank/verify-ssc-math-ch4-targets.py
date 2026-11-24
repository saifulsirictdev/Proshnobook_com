"""Verify published ch4 artifacts without importing/executing their generator.
Development dependency: sympy==1.14.0. Not independent teacher approval.
"""
import hashlib
import json
from pathlib import Path
import sympy as S
BASE=Path(__file__).resolve().parents[2]/'content/question-bank/ssc/math/chapter-4'
R=S.Rational

def log(a,b=10):return S.log(S.sympify(a))/S.log(S.sympify(b))
def same(a,b):return S.simplify(S.expand_log(S.sympify(a)-S.sympify(b),force=True))==0

def expected(f,n):
 b=n+2
 expr={
 'power-product':lambda:b**(n+1)*b**2,
 'power-quotient':lambda:R(b**(n+3),b**(n+1)),
 'power-of-power':lambda:(b**(n+1))**2,
 'zero-index':lambda:(n+4-n-1)**0,
 'negative-index':lambda:S.Integer(b)**(-n-1),
 'fractional-index':lambda:S.Integer(b**3)**R(2,3),
 'negative-fraction':lambda:S.Integer(b**4)**R(-1,2),
 'fraction-base':lambda:R(n+1,n+2)**(-2),
 'unknown-index':lambda:log(R(b**(n+5),b**2),b),
 'linear-exponent':lambda:(log(b**(n+4),b)-1)/2,
 'subunit-log':lambda:log(b**n,R(1,b)),
 'log-definition':lambda:log(b**(n+1),b),
 'log-reciprocal':lambda:log(R(1,b**(n+1)),b),
 'log-root':lambda:log(S.sqrt(b),b),
 'log-product':lambda:log(b**(n+1)*b**2,b),
 'log-quotient':lambda:log(R(b**(n+3),b*b),b),
 'log-power':lambda:log((b**n)**3,b),
 'change-base':lambda:log(b**3,b*b),
 'reciprocal-logs':lambda:log(b+1,b)*log(b,b+1),
 'cyclic-logs':lambda:log(b,2)*log(b+1,b)*log(2,b+1),
 'unknown-base':lambda:S.sqrt(b*b),
 'unknown-argument':lambda:b**(n+1),
 'given-logs':lambda:log(R(2**(2*(n+1)),2**(n+2)),2),
 'characteristic-large':lambda:S.floor(log(3*10**(n+1))),
 'characteristic-small':lambda:S.floor(log(R(4,10**(n+2)))),
 'decimal-scale':lambda:log(b*10**n)-log(b),
 'sum-not-product':lambda:log(b+b,b),
 'finite-domain':lambda:sum(x-n>0 for x in range(n-1,n+4)),
 'nested-log':lambda:log(log(b**(n+1),b),n+1),
 }
 return expr[f]()

manifest=json.loads((BASE/'targets-v1-manifest.json').read_text())
review=json.loads((BASE/manifest['validation']['file']).read_text())
for f in manifest['files']+[manifest['validation'],manifest['boardSeed']]:
 raw=(BASE/f['file']).read_bytes()
 assert len(raw)==f['bytes'] and hashlib.sha256(raw).hexdigest()==f['sha256']
source_answers=[log(144,2*S.sqrt(3)),S.floor(log(R('0.0305'))),log(625)-2*log(5),None,S.floor(log(R('0.00000538')))]
mcqs=written=witnesses=0
for meta in review['itemReviews']:
 q=json.loads((BASE/meta['file']).read_text())['items'][meta['itemInFile']-1]
 assert hashlib.sha256((q['type']+'\n'+q['text']).encode()).hexdigest()==meta['questionSha256']
 if q['type']=='MCQ':
  if 'choiceSolutionSets' in meta:
   x=S.Symbol('x',real=True)
   roots=[int(v) for v in S.solve(x*x-16,x) if v>0 and v!=1]
   assert roots==meta['expectedAllowedBases']==[4]
   assert [k for k,v in meta['choiceSolutionSets'].items() if v==roots]==[q['correct']]
   assert q['options']['B']==r'$\pm4$'
   continue
  actual=source_answers[meta['variant']-1] if meta['family']=='board-seed' else expected(meta['family'],meta['variant'])
  assert same(actual,S.sympify(meta['answerExpression'])),(meta,actual)
  assert [k for k,v in zip('ABCD',meta['choiceExpressions']) if same(S.sympify(v),actual)]==[q['correct']]
  mcqs+=1
 else:
  assert meta['exactChecks'] and meta['domainNotes'];written+=1
  for pair in meta['exactChecks']:
   assert same(S.sympify(pair['lhs']),S.sympify(pair['rhs'])),(meta,pair)
   witnesses+=1
 assert not meta['origin'].startswith('ORIGINAL') or (not q.get('provenance') and 'নিজস্ব অনুশীলনী' in q['page'])
# Independent root/domain checks, not merely stored equality witnesses.
x=S.Symbol('x',real=True)
for n in range(1,6):
 b=n+2;a=n+1
 roots=S.solve(x*x-b*b-b*b,x)
 assert [v for v in roots if v>b]==[b*S.sqrt(2)]
 roots=S.solve(x*(x-a)-2*a*a,x)
 assert [v for v in roots if v>a]==[2*a]
 k=n+1;m=log(2);value=log(S.sqrt(R(2,10**k)))
 characteristic=int(S.floor(value));mantissa=value-characteristic
 assert 0<mantissa<1
 assert characteristic==-((k+1)//2)
 assert same(mantissa,(m+1)/2 if k%2 else m/2)
assert mcqs==149 and written==120 and len(review['itemReviews'])==270
print(f'PASS: 145 original + 5 source MCQ answers/solution sets independently recomputed; {written} written items / {witnesses} stored exact witnesses checked; domain/characteristic checks, 270 bindings and file hashes verified. Teacher review pending.')
