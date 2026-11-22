"""Independent chapter-9 arithmetic, identity and coordinate checks.
No imports from the builder. Not independent teacher/textbook/semantic approval.
Dev: PYTHONPATH=.cache/math-validation python scripts/question-bank/verify-ssc-math-ch9-targets.py
"""
import json,hashlib,math,re
from pathlib import Path
import sympy as s
ROOT=Path(__file__).resolve().parents[2];base=ROOT/'content/question-bank/ssc/math/chapter-9'
R=s.Rational
def read(p):return json.loads(p.read_text())
def eq(a,b):assert s.simplify(s.sympify(a)-s.sympify(b))==0,(a,b)
def near(a,b):assert math.isclose(float(a),float(b),abs_tol=1e-7,rel_tol=1e-7),(a,b)
def expected(f,n):
 o=s.Integer(n+2);a=s.Integer(2*n+3);h=s.sqrt(o*o+a*a);m=s.Integer(n+2);p=2*m;q=m*m-1;r=m*m+1
 values={'sin-sides':o/h,'cos-sides':a/h,'tan-sides':o/a,'cosec-sides':h/o,'sec-sides':h/a,'cot-sides':a/o,
 'cos-from-sin':s.sqrt(1-(p/r)**2),'sin-from-cos':s.sqrt(1-(q/r)**2),'tan-from-cot':1/(a/o),
 'sec-from-tan':s.sqrt(1+(p/q)**2),'cosec-from-cos':1/s.sqrt(1-(q/r)**2),
 'sin-plus-cos':p/r+q/r,'sin-cos-product':p/r*s.sqrt(1-(p/r)**2),'pythagorean':n+1,
 'sec-identity':n+2,'cosec-identity':n+3,'cofunction':s.sqrt(1-(p/r)**2),
 'complement-equation':s.solve(s.Eq((n+1)*s.Symbol('x')+(n+2)*s.Symbol('x'),90),s.Symbol('x'))[0],
 'standard-values':n*s.sin(s.pi/6)+(n+2)*s.cos(s.pi/3) if n%3==1 else n*s.sin(0)+(n+2)*s.cos(s.pi/2) if n%3==2 else n*s.cos(0)+(n+2)*s.sin(s.pi/2),
 'sum-difference':((p+q)/r)**2-((p-q)/r)**2}
 return s.simplify(values[f])
source={('dhaka','9'):(s.sqrt(R(9,16)),'A'),('dhaka','11'):(s.cot(s.pi/3),'A'),('dhaka','20'):(R(2,3),'C'),('sylhet','1'):('COSEC','C'),('dinajpur','21'):(s.sqrt(2**2-1**2),'A'),('dinajpur','22'):(R(1,2)**2+R(1,2)**2,'A'),('jashore','5'):('TAN','A'),('jashore','25'):(30,'D'),('mymensingh','14'):(1/R(4,5),'A'),('mymensingh','16'):(s.cot(s.pi/6),'D')}
manifest=read(base/'targets-v1-manifest.json');v=read(base/manifest['validation']['file']);original=adapted=written=exact=0
for m in v['itemReviews']:
 q=read(base/m['file'])['items'][m['itemInFile']-1];assert hashlib.sha256((q['type']+'\n'+q['text']).encode()).hexdigest()==m['questionSha256']
 if q.get('provenance'):
  p=q['provenance'][0];ans,key=source[(p['board'],p['questionNumber'])];assert q['correct']==key
  if isinstance(ans,str):assert m['answerExpression']==ans
  else:eq(ans,m['answerExpression'])
  adapted+=1
 elif q['type']=='MCQ':
  val=expected(m['family'],m['variant']);eq(val,m['answerExpression']);choices=list(map(s.sympify,m['choiceExpressions']));assert sum(s.simplify(x-val)==0 for x in choices)==1;eq(choices['ABCD'.index(q['correct'])],val);original+=1
 else:
  written+=1
  for check in m['exactChecks']:eq(check['lhs'],check['rhs']);exact+=1
  # Independent family witness calculations, beyond trusting the builder's equality list.
  n=m['variant'];t=s.Integer(n+2);o=2*t;a=t*t-1;h=t*t+1;k=s.Integer(n+1)
  assert o>0 and a>0 and h>max(o,a);eq(o*o+a*a,h*h)
  sn=o/h;cs=a/h;tn=o/a
  if m['family'] in ['sec-plus-tan','cosec-plus-cot']:
   u=(t+1/t)/2;w=(t-1/t)/2;eq(u+w,t);eq(u*u-w*w,1)
  elif m['family']=='sum-to-product':eq(((sn+cs)**2-1)/2,sn*cs);eq(sn**4+cs**4,1-2*(sn*cs)**2)
  elif m['family']=='tan-plus-cot':eq(1/(tn+1/tn),sn*cs);assert tn+1/tn>=2
  elif m['family']=='complementary-angles':
   x=R(90,2*n+3);eq((n+1)*x+(n+2)*x,90);assert 0<(n+1)*x<90
  elif m['family'] in ['thirty-degrees','sixty-degrees']:eq(k*k+(k*s.sqrt(3))**2,(2*k)**2)
  elif m['family']=='fortyfive-degrees':eq(k*k+k*k,(k*s.sqrt(2))**2)
  else:eq(sn*sn+cs*cs,1);eq(tn,sn/cs);eq((h/a)**2-tn**2,1)
for a in v['assets']:
 assert a['kind']=='trig-right';raw=(ROOT/a['file']).read_bytes();assert hashlib.sha256(raw).hexdigest()==a['sha256'];g=a['geometry'];P=g['points'];A,B,C=P['A'],P['B'],P['C'];sc=g['scale'];opp=g['opposite'];adj=g['adjacent'];hyp=g['hypotenuse']
 near(math.dist(A,B)/sc,adj);near(math.dist(B,C)/sc,opp);near(math.dist(A,C)/sc,hyp);near(hyp*hyp,opp*opp+adj*adj)
 near((A[0]-B[0])*(C[0]-B[0])+(A[1]-B[1])*(C[1]-B[1]),0)
 theta=math.atan2(opp,adj);near(math.sin(theta),opp/hyp);near(math.cos(theta),adj/hyp);near(math.tan(theta),opp/adj);near(g['referenceAngle'],math.degrees(theta));assert 0<g['referenceAngle']<90
# Independent generic identities on a right triangle, not numerical-only substitution.
o,a=s.symbols('o a',positive=True);h=s.sqrt(o*o+a*a);sn=o/h;cs=a/h;tn=o/a
identities=[sn*sn+cs*cs-1,1/cs**2-tn**2-1,1/sn**2-(a/o)**2-1,tn-sn/cs,(sn+cs)**2-(sn-cs)**2-4*sn*cs,sn**4+cs**4-(1-2*(sn*cs)**2)]
for expression in identities:eq(expression,0)
assert sum(bool(m.get('explicitAcuteDomainAdded')) for m in v['itemReviews'])==4
# A negative-quadrant witness documents why the added acute assumptions matter.
assert s.cot(2*s.pi/3)<0 and s.sin(2*s.pi/3)==s.sqrt(3)/2
assert s.cot(5*s.pi/6)<0 and s.sin(5*s.pi/6)==R(1,2)
result=dict(status='ARITHMETIC_IDENTITY_COORDINATE_WITNESSES_PASS_NOT_TEACHER_APPROVAL',chapter=9,originalMCQ=original,adaptedMCQ=adapted,written=written,exactWrittenWitnesses=exact,diagramHashAndCoordinateChecks=len(v['assets']),symbolicIdentities=len(identities),sourceAcuteDomainAdditions=4,limits='No exhaustive board/textbook reading or independent Bengali proof/diagram/coverage approval. SVG URLs not deployed; no real DB import.')
(ROOT/'docs/question-bank/ssc-math-ch9-independent-check.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('PASS:',json.dumps(result,ensure_ascii=False))
