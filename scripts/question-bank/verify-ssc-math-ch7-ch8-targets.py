"""Independent arithmetic/coordinate witnesses; no generator imports, no DB/network.
These checks do NOT certify all Bengali wording, construction steps or proofs.
Run: PYTHONPATH=.cache/math-validation python scripts/question-bank/verify-ssc-math-ch7-ch8-targets.py
"""
import json,math,hashlib
from pathlib import Path
import sympy as s
ROOT=Path(__file__).resolve().parents[2]
R=s.Rational
def read(p):return json.loads(p.read_text())
def eq(a,b):assert s.simplify(s.sympify(a)-s.sympify(b))==0,(a,b)
def close(a,b):assert math.isclose(float(a),float(b),abs_tol=1e-7,rel_tol=1e-7),(a,b)
def vec(a,b):return [x-y for x,y in zip(a,b)]
def dot(a,b):return sum(x*y for x,y in zip(a,b))
def angle(a,o,b):
 u,v=vec(a,o),vec(b,o);return math.degrees(math.acos(max(-1,min(1,dot(u,v)/math.sqrt(dot(u,u)*dot(v,v))))))
def perpendicular(a,o,b):close(dot(vec(a,o),vec(b,o)),0)
def expected7(f,n):
 a,b,c=n+3,n+4,n+5;k=n+2;ang=40+4*n
 values={'sss-perimeter':a+b+c,'third-side-count':sum(abs(a-b)<x<a+b for x in range(1,a+b+1)),
 'sas-side':a*a+b*b-2*a*b*R(1,2),'asa-angle':180-ang-50,'rhs-leg':s.sqrt((5*k)**2-(3*k)**2),
 'isos-height':(2*k)**2-k*k,'equilateral-median':s.sqrt((2*k)**2-k*k),'segment-midpoint':R(2*k,2),
 'bisector-half':R(ang,2),'perp-distance':c,'parallel-copy':ang,'parallelogram-perimeter':2*a+2*b,
 'rhombus-side':s.sqrt(R(6*k,2)**2+R(8*k,2)**2),'rectangle-other-side':s.sqrt((5*k)**2-(3*k)**2),
 'rhombus-half-angle':R(ang,2),'equilateral-one-side':1,'sss-mirrors':2,'degenerate':0,
 'equilateral-angle':R(180,3),'parallelogram-adjacent':180-ang,'rectangle-diagonal':s.sqrt((3*k)**2+(4*k)**2)}
 return values[f]
def expected8(f,n):
 k=n+1;a=24+4*n;t=48+5*n
 return {'central-double':2*a,'inscribed-half':R(2*a,2),'reflex-center':360-2*a,'same-segment':a,
 'cyclic-opposite':180-t,'cyclic-ratio':R(180*(n+2),2*n+5),'cyclic-exterior':t,
 'chord-length':2*s.sqrt((5*k)**2-(3*k)**2),'chord-distance':s.sqrt((5*k)**2-(4*k)**2),
 'chord-radius':s.sqrt((4*k)**2+(3*k)**2),'equal-chords-length':2*4*k,'equal-chords-distance':3*k,
 'tangent-length':s.sqrt((5*k)**2-(3*k)**2),'tangent-center-distance':s.sqrt((4*k)**2+(3*k)**2),
 'equal-tangents':s.solve(s.Eq((n+2)*s.Symbol('x')+n,(n+1)*s.Symbol('x')+2*n+3),s.Symbol('x'))[0],
 'tangents-central-angle':360-90-90-a,'tangents-bisector':R(2*a,2),'tangent-radius-angle':90,
 'tangent-chord-angle':a,'external-contact':n+5+n+2,'internal-contact':2*n+5-(n+2),
 'semicircle-other-angle':180-90-a,'equilateral-center':2*R(180,3),'concentric-chord':2*s.sqrt((5*k)**2-(3*k)**2)}[f]
source={7:{('rajshahi','2'):(2,'A'),('cumilla','18'):(3,'B'),('mymensingh','10'):('RHOMBUS','B')},
 8:{('rajshahi','14'):(180-110,'C'),('rajshahi','27'):('I_II','A'),('rajshahi','30'):('HYPOTENUSE_MIDPOINT','C'),
 ('cumilla','26'):(1,'D'),('cumilla','27'):(5+3,'B'),('cumilla','28'):(90,'B'),
 ('barishal','3'):(180-60,'C'),('barishal','4'):('ALL','D'),('barishal','29'):(2*4,'D'),('barishal','30'):(2*5,'D'),
 ('mymensingh','12'):(2,'B'),('mymensingh','13'):(180-75,'C')}}
result={}
for chapter in [7,8]:
 base=ROOT/f'content/question-bank/ssc/math/chapter-{chapter}';m=read(base/'targets-v1-manifest.json');v=read(base/m['validation']['file']);original=adapted=written=witnesses=0
 for entry in v['itemReviews']:
  q=read(base/entry['file'])['items'][entry['itemInFile']-1]
  assert hashlib.sha256((q['type']+'\n'+q['text']).encode()).hexdigest()==entry['questionSha256']
  if q.get('provenance'):
   p=q['provenance'][0];answer,key=source[chapter][(p['board'],p['questionNumber'])];assert q['correct']==key;assert entry['answerExpression']==str(answer);adapted+=1
  elif q['type']=='MCQ':
   value=(expected7 if chapter==7 else expected8)(entry['family'],entry['variant']);eq(value,entry['answerExpression']);choices=list(map(s.sympify,entry['choiceExpressions']));assert sum(s.simplify(x-value)==0 for x in choices)==1;eq(choices['ABCD'.index(q['correct'])],value);original+=1
  else:
   assert entry['exactChecks'];written+=1
   for c in entry['exactChecks']:eq(c['lhs'],c['rhs']);witnesses+=1
 # Independently check every emitted mathematical coordinate relationship.
 kinds={}
 for asset in v['assets']:
  raw=(ROOT/asset['file']).read_bytes();assert hashlib.sha256(raw).hexdigest()==asset['sha256'];g=asset['geometry'];p=asset['parameters'];kind=asset['kind'];kinds[kind]=kinds.get(kind,0)+1
  if 'sides' in g and isinstance(g['sides'],dict):
   P=g['points'];A,B,C=P['A'],P['B'],P['C'];ratios=[math.dist(B,C)/g['sides']['BC'],math.dist(C,A)/g['sides']['CA'],math.dist(A,B)/g['sides']['AB']];close(ratios[0],ratios[1]);close(ratios[1],ratios[2])
   if kind=='right':perpendicular(A,B,C)
   if kind=='sas':close(angle(B,A,C),p.get('angle',60))
   if kind=='asa':close(angle(A,B,C),p.get('B',45));close(angle(A,C,B),p.get('C',60))
  elif kind in ['bisector']:
   P=g['points'];close(angle(P['X'],P['O'],P['P']),angle(P['P'],P['O'],P['Y']));close(math.dist(P['X'],P['P']),math.dist(P['Y'],P['P']))
  elif kind in ['perp-bisector','online-perp','off-perp','parallel']:
   P=g['points'];close(math.dist(P['A'],P['M']),math.dist(P['B'],P['M']));perpendicular(P['A'],P['M'],P['P']);close(math.dist(P['A'],P['P']),math.dist(P['B'],P['P']));close(math.dist(P['A'],P['Q']),math.dist(P['B'],P['Q']))
  elif kind in ['central','same-segment','equilateral-circle','semicircle','tangent-chord','cyclic','cyclic-rectangle']:
   P=g['points'];O=g['center'];r=g['radius']
   for point in P.values():close(math.dist(point,O),r)
   if kind in ['central','same-segment','equilateral-circle']:close(angle(P['B'],P['A'],P['C']),p.get('alpha',50))
   if kind=='semicircle':close(angle(P['A'],P['C'],P['B']),90);close(angle(P['C'],P['A'],P['B']),p.get('baseAngle',45))
   if kind=='cyclic':close(angle(P['A'],P['B'],P['C']),p.get('theta',100));close(angle(P['A'],P['B'],P['C'])+angle(P['A'],P['D'],P['C']),180)
   if kind=='cyclic-rectangle':close(angle(P['A'],P['B'],P['C']),90)
   if kind=='tangent-chord':close(angle(P['A'],P['C'],P['B']),p.get('alpha',50))
  elif kind in ['chord','equal-chords','concentric']:
   P=g['points'];r=g['physicalRadius'];d=g['physicalDistance'];O=g['center'];sc=94/r
   for key in ['A','B']+(['C','D'] if kind=='equal-chords' else []):close(math.dist(P[key],O),94)
   close(math.dist(P['A'],P['B']),2*math.sqrt(r*r-d*d)*sc)
  elif kind=='tangents':
   P=g['points'];O=g['center'];close(math.dist(O,P['T']),g['radius']);close(math.dist(O,P['U']),g['radius']);perpendicular(O,P['T'],P['P']);perpendicular(O,P['U'],P['P']);close(math.dist(P['P'],P['T']),math.dist(P['P'],P['U']));close(angle(P['T'],P['P'],P['U']),p.get('alpha',60))
  elif kind in ['external-circles','internal-circles']:
   r1,r2=g['physicalRadii'];close(math.dist(*g['centers'])/g['scale'],r1+r2 if kind=='external-circles' else r1-r2)
  elif kind=='degenerate':assert g['lengths'][0]+g['lengths'][1]==g['lengths'][2]
  elif kind in ['rhombus','rectangle','parallelogram']:
   P=g['points'];A,B,C,D=[P[x] for x in 'ABCD'];close(math.dist(A,B),math.dist(C,D));close(math.dist(A,D),math.dist(B,C));close((A[0]+C[0])/2,(B[0]+D[0])/2);close((A[1]+C[1])/2,(B[1]+D[1])/2)
   if kind=='rectangle':close(angle(B,A,D),90)
   if kind=='parallelogram':close(angle(B,A,D),p.get('angle',60))
   if kind=='rhombus':close(math.dist(A,B),math.dist(B,C));close(math.dist(A,C)/math.dist(B,D),p['d1']/p['d2'])
  elif kind=='point-tangent':close(math.dist(g['center'],g['points']['A']),g['radius'])
  else:raise AssertionError(kind)
 result[str(chapter)]=dict(originalMCQ=original,adaptedMCQ=adapted,written=written,exactWrittenWitnesses=witnesses,assetHashAndGeometryChecks=len(v['assets']),diagramKinds=kinds)
 print(f'PASS chapter {chapter}: {original} original MCQ, {adapted} adapted, {written} written / {witnesses} exact witnesses, {len(v["assets"])} diagram checks.')
print('LIMIT: arithmetic and coordinates only; independent teacher construction/proof/coverage review pending.')
(ROOT/'docs/question-bank/ssc-math-ch7-ch8-independent-check.json').write_text(json.dumps(dict(status='ARITHMETIC_AND_COORDINATE_WITNESSES_PASS_NOT_TEACHER_APPROVAL',chapters=result),ensure_ascii=False,indent=2)+'\n')
