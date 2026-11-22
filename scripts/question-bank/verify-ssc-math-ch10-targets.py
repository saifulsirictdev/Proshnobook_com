"""Independent exact arithmetic/model and coordinate witnesses; no builder imports.
Not an independent teacher/narrative/coverage approval. Dev-only SymPy 1.14.0.
"""
from pathlib import Path
import json,math,hashlib
import sympy as s
ROOT=Path(__file__).resolve().parents[2];base=ROOT/'content/question-bank/ssc/math/chapter-10';R=s.Rational;rt=s.sqrt(3)
def read(p):return json.loads(p.read_text())
def eq(a,b):assert s.simplify(s.sympify(a)-s.sympify(b))==0,(a,b)
def near(a,b):assert math.isclose(float(a),float(b),rel_tol=1e-7,abs_tol=1e-7),(a,b)
def angle(a,o,b):
 u=[a[i]-o[i] for i in range(2)];v=[b[i]-o[i] for i in range(2)];c=sum(x*y for x,y in zip(u,v))/math.sqrt(sum(x*x for x in u)*sum(x*x for x in v));return math.degrees(math.acos(max(-1,min(1,c))))
def expected(f,n):
 k=s.Integer(n+4)
 # Re-derive station heights from distinct sum/difference equations, not key expressions.
 H=s.Symbol('H',positive=True)
 same=s.solve(s.Eq(H/s.tan(s.pi/6)-H/s.tan(s.pi/3),2*k),H)[0]
 opposite=s.solve(s.Eq(H/s.tan(s.pi/6)+H/s.tan(s.pi/3),4*k),H)[0]
 return {'tower-sixty':k*s.tan(s.pi/3),'distance-thirty':k/s.tan(s.pi/6),'ladder-thirty':2*k*s.sin(s.pi/6),'ladder-sixty-base':2*k*s.cos(s.pi/3),'equal-shadow':45,'shadow-thirty':k/s.tan(s.pi/6),'eye-height':R(3,2)+k*s.tan(s.pi/4),'depression-thirty':k/s.tan(s.pi/6),'same-side':same,'opposite-sides':opposite,'two-towers':k+2+2*k*s.tan(s.pi/4),'broken-tree':k+k/s.sin(s.pi/6)}[f]
source={('cumilla','2'):(6*rt/s.tan(s.pi/3),'B'),('sylhet','10'):(30,'B'),('dinajpur','24'):(1/s.tan(s.pi/6),'D'),('jashore','24'):(20*s.sin(s.pi/6),'A'),('barishal','8'):(30,'A'),('chattogram','28'):(10+10/s.cos(s.pi/3),'C')}
m=read(base/'targets-v1-manifest.json');v=read(base/m['validation']['file']);original=adapted=written=exact=0
for meta in v['itemReviews']:
 q=read(base/meta['file'])['items'][meta['itemInFile']-1];assert hashlib.sha256((q['type']+'\n'+q['text']).encode()).hexdigest()==meta['questionSha256']
 if q.get('provenance'):
  p=q['provenance'][0];value,key=source[(p['board'],p['questionNumber'])];assert q['correct']==key;eq(value,meta['answerExpression']);adapted+=1
 elif q['type']=='MCQ':
  value=expected(meta['family'],meta['variant']);eq(value,meta['answerExpression']);choices=list(map(s.sympify,meta['choiceExpressions']));assert sum(s.simplify(c-value)==0 for c in choices)==1;eq(choices['ABCD'.index(q['correct'])],value);original+=1
 else:
  written+=1
  for witness in meta['exactChecks']:eq(witness['lhs'],witness['rhs']);exact+=1
  k=s.Integer(meta['variant']+4);f=meta['family']
  # Independent model witnesses, in addition to checking emitted equalities.
  if f=='eye-level':eq((k+R(3,2))-R(3,2),k*s.tan(s.pi/4))
  elif f=='boat-depression':eq((k/s.tan(s.pi/6)-k/s.tan(s.pi/3))/(k/5),10/rt)
  elif f=='same-side':eq((k*rt)/s.tan(s.pi/6)-(k*rt)/s.tan(s.pi/3),2*k)
  elif f=='opposite-sides':eq((k*rt)/s.tan(s.pi/6)+(k*rt)/s.tan(s.pi/3),4*k)
  elif f=='two-towers':eq((3*k+2)-(k+2),2*k*s.tan(s.pi/4))
  elif f=='broken-tree':eq(k+k/s.sin(s.pi/6),3*k)
  elif f=='shadow-thirty':eq(k*rt/s.tan(s.pi/6),3*k);eq(k*rt/s.tan(s.pi/3),k)
  elif f=='shadow-fortyfive':eq(k*s.tan(s.pi/4),k);assert k>k/s.tan(s.pi/3)>0
  elif f=='kite':eq(3*k*s.sin(s.pi/3)-2*k*s.sin(s.pi/3),k*rt/2)
  elif f=='ladder':eq(2*k*s.cos(s.pi/6)-2*k*s.cos(s.pi/4),k*(rt-s.sqrt(2)));assert rt>s.sqrt(2)
  elif f=='tower-thirty':eq(k/(k*rt/3),s.tan(s.pi/3))
  elif f=='tower-sixty':eq((k*rt)**2+k*k,(2*k)**2)
  else:raise AssertionError(f)
kinds={}
for asset in v['assets']:
 raw=(ROOT/asset['file']).read_bytes();assert hashlib.sha256(raw).hexdigest()==asset['sha256'];g=asset['geometry'];kind=asset['kind'];P=g['points'];B=P['B'];sc=g['scale'];H=g['physicalHeight'];d=g['physicalDistance'];eye=g['physicalEye'];kinds[kind]=kinds.get(kind,0)+1
 T=P.get('T',P.get('C'));near(math.dist(B,T)/sc,H);near(B[0],T[0]);assert H>eye>=0 and d>0
 if kind=='height-broken':
  D=P['D'];A=P['A'];near(math.dist(B,D)/sc,d);near(B[1],D[1]);near(math.dist(B,A)/sc,g['totalHeight']);near(math.dist(A,T),math.dist(T,D));near(angle(B,T,D),60);near(angle(B,D,T),30)
 elif kind in ['height-eye','height-towers']:
  E=P['E' if kind=='height-eye' else 'S'];F=P['P' if kind=='height-eye' else 'D'];M=P['M'];near(math.dist(E,F)/sc,eye);near(math.dist(F,B)/sc,d);near(M[1],E[1]);near(M[0],B[0]);near(angle(M,E,T),45);near((H-eye)/d,1)
 elif kind=='height-same':
  Q=P['Q'];A=P['P'];near(math.dist(B,A)/sc,d);near(math.dist(B,Q)/sc,g['physicalFar']);assert B[0]<A[0]<Q[0];near(angle(B,A,T),60);near(angle(B,Q,T),30)
 elif kind=='height-opposite':
  A=P['P'];Q=P['Q'];near(math.dist(B,A)/sc,g['physicalLeft']);near(math.dist(B,Q)/sc,d);assert A[0]<B[0]<Q[0];near(angle(B,A,T),60);near(angle(B,Q,T),30)
 elif kind=='height-single':
  A=P['P'];near(math.dist(B,A)/sc,d);near(B[1],A[1]);near(math.tan(math.radians(angle(B,A,T))),H/d)
 else:raise AssertionError(kind)
 # Geometry is the six documented level-ground model types, not a facsimile scan.
assert len(v['assets'])==320 and len(kinds)==6
result=dict(status='EXACT_MODEL_AND_COORDINATE_WITNESSES_PASS_NOT_TEACHER_APPROVAL',chapter=10,originalMCQ=original,adaptedMCQ=adapted,written=written,exactWrittenWitnesses=exact,diagramHashAndCoordinateChecks=len(v['assets']),diagramKinds=kinds,limits='No exhaustive board/current textbook reading or independent Bengali narrative/diagram/coverage approval. Assets not deployed, no DB import.')
(ROOT/'docs/question-bank/ssc-math-ch10-independent-check.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print('PASS:',json.dumps(result,ensure_ascii=False))
