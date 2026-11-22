"""Published-artifact verification, independent of the ch5 generator.
Dev-only sympy==1.14.0. Does not certify teacher review or all narrative reasoning.
"""
import hashlib
import json
from pathlib import Path
import sympy as S
BASE=Path(__file__).resolve().parents[2]/'content/question-bank/ssc/math/chapter-5'
x=S.Symbol('x',real=True);R=S.Rational

def number(v):return S.sympify(v,locals={'x':x})
def same(a,b):return S.simplify(number(a)-number(b))==0

def mcq_expected(f,n):
 a=n+2;b=n+4
 return {'linear':b,'both-sides':a+b,'fraction-linear':R(3*b,2)-a,
 'brackets':b,'rational':2*a,'excluded-root':0,'identity-constant':2*a,
 'quadratic-positive':a,'quadratic-negative':-a,'repeated-root':1,
 'no-real-root':0,'discriminant':4,'root-sum':a+b,'root-product':a*b,
 'parameter-root':b-a,'reciprocal-equation':R(1,a),'radical':b*b-a,
 'rectangle-width':b,'age':a}[f]

def cq_expected(f,n):
 if f=='rectangle':return [[-(2*n+5),n+3]]
 if f=='ages':return [[n+7]]
 if f=='consecutive':return [[-n-5,n+4]]
 if f=='work-rate':
  t=n+3;d=n+2
  return [[-R(d*(t+d),2*t+d),t]]
 if f=='travel-speed':return [[-3*(n+2),2*(n+2)]]
 if f=='two-digit':return [[n+2]]
 if f=='tickets':return [[n+3]]
 if f=='radical-extraneous':return [[n+3],[n,n+3]]
 if f=='rational-domain':return [[n+4],[]]
 if f=='complete-square':return [[n+2-S.sqrt(2),n+2+S.sqrt(2)]]
 raise ValueError(f)

def sq_expected(f,n):
 a=n+2;b=n+5
 return {'linear':[b],'fraction':[a*b],'factor-quadratic':[a,b],
 'double-root':[-a],'irrational-roots':[a-S.sqrt(n+1),a+S.sqrt(n+1)],
 'no-real':[],'cancel-domain':[],'radical':[R(a*a-n,3)],
 'purchase':[b],'root-parameter':[a-b]}[f]

manifest=json.loads((BASE/'targets-v1-manifest.json').read_text())
review=json.loads((BASE/manifest['validation']['file']).read_text())
for entry in manifest['files']+[manifest['validation'],manifest['boardSeed']]:
 raw=(BASE/entry['file']).read_bytes()
 assert len(raw)==entry['bytes'] and hashlib.sha256(raw).hexdigest()==entry['sha256']
inputs={f['file']:json.loads((BASE/f['file']).read_text()) for f in manifest['files']}
mcqs=written=equations=0
board_roots=[[],[6],[2,3],[],[R(3,2)]]
for meta in review['itemReviews']:
 q=inputs[meta['file']]['items'][meta['itemInFile']-1]
 assert hashlib.sha256((q['type']+'\n'+q['text']).encode()).hexdigest()==meta['questionSha256']
 f=meta['family'];n=meta['variant']
 for i,e in enumerate(meta['equations']):
  residual=number(e['lhs'])-number(e['rhs'])
  actual=S.solveset(residual,x,domain=S.S.Reals)-S.FiniteSet(*map(number,e['excluded']))
  expected=S.FiniteSet(*map(number,e['expectedRoots']))
  assert actual==expected,(meta,actual,expected)
  for root in actual:
   assert same(residual.subs(x,root),0)
   assert root not in list(map(number,e['excluded']))
  if f=='board-seed':assert actual==S.FiniteSet(*board_roots[n-1])
  elif q['type']=='CQ':assert actual==S.FiniteSet(*cq_expected(f,n)[i])
  elif q['type']=='SQ':assert actual==S.FiniteSet(*sq_expected(f,n))
  equations+=1
 if q['type']=='MCQ':
  if 'choiceSolutionSets' in meta:
   actualSet=set(meta['equations'][0]['expectedRoots'])
   matches=[key for key,vals in meta['choiceSolutionSets'].items() if set(vals)==actualSet]
   assert matches==[q['correct']]
  else:
   answer=6 if f=='board-seed' else mcq_expected(f,n)
   assert same(answer,meta['answerExpression'])
   assert [k for k,v in zip('ABCD',meta['choiceExpressions']) if same(v,answer)]==[q['correct']]
  mcqs+=1
 else:
  assert meta['domainNotes'];written+=1
 if f!='board-seed':assert not q.get('provenance') and 'নিজস্ব অনুশীলনী' in q['page']
# Verify physical constraints and contextual arithmetic independently of stored roots.
for n in range(1,3):
 t=n+3;d=n+2;w=R(t*(t+d),2*t+d)
 assert same(1/R(t)+1/R(t+d),1/w)
 assert 0<R(t-1,t)*w<w
 v=n+2;D=6*v
 assert R(D,2*v)-R(D,3*v)==1
 a=n+2;original=10*a+(a+2);reversed=10*(a+2)+a
 assert reversed-original==18 and 1<=a<=9 and 0<=a+2<=9
 assert [r for r in cq_expected('rectangle',n)[0] if r>0]==[n+3]
 assert [r for r in cq_expected('work-rate',n)[0] if r>0]==[t]
 assert [r for r in cq_expected('travel-speed',n)[0] if r>0]==[2*v]
# Source B is {∅}, not ∅. Source quadratic has duplicated incorrect root sets;
# preserve both distractors rather than silently correcting the compilation.
source=inputs['target-v1/mcq.json']['items'][:5]
assert source[3]['options']['B']==r'$\{\varnothing\}$' and source[3]['options']['C']==r'$\{\}$'
assert source[2]['options']['B']=='$-5,1$' and source[2]['options']['D']=='$1,-5$'
assert mcqs==100 and written==50 and len(review['itemReviews'])==150
print(f'PASS: 100 MCQ answers/solution-set choices, 50 written family root lists, {equations} original-equation real-root checks, exclusions, physical constraints, 150 item bindings and file hashes. Independent teacher review pending.')
