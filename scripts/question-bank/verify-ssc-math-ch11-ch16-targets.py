"""Independent answer-model and diagram checks. NO generator/model-helper imports.
Recompute answers from family definitions; not independent Bengali teacher review.
"""
import json,hashlib,re,math
from pathlib import Path
import sympy as s
ROOT=Path(__file__).resolve().parents[2];R=s.Rational;pi=s.pi
read=lambda p:json.loads(p.read_text())
def eq(a,b):assert s.simplify(s.sympify(a)-s.sympify(b))==0,(a,b)
def near(a,b):assert math.isclose(a,b,rel_tol=1e-7,abs_tol=1e-7),(a,b)
def area(P,names):
 q=[P[c] for c in names];return abs(sum(a[0]*b[1]-a[1]*b[0] for a,b in zip(q,q[1:]+q[:1])))/2

def answers(ch,n):
 k=s.Integer(n+2);a=k+1;b=k+2;c=k+3;N=k+3
 if ch==11:return [
 [3,3*a,3],[4,4*(a+b),16*a*b],[a/b,(a+b)/b,(a+b)/(b-a)],[(k+3)/(k+1),2/(k+1),((k+3)/(k+1))**2],
 [a,2*b,a/b],[4*a*a,4*a,R(1,2)],[9*k**4,3*k*k,R(10,3)],[2,4*k,7],[c/a,(a+c)/b,(a+b+c)/a],
 [R(1,2),a/(2*b),a*a/(b*b)],[a/b,b/a,1],[k,a*k,k],[10,10*b,100*b/(a+b)],[a+b+c,6*c,6*(a+b)],
 [a*a/(b*b),(a*a+b*b)/(a*b),(b*b-a*a)/(a*b)]]
 if ch==12:
  out=[];u=k+1;v=k+3
  for A in [s.Matrix([[2,3],[3,2]]),s.Matrix([[1,2],[3,1]]),s.Matrix([[3,-1],[2,1]]),s.Matrix([[2,1],[1,-1]])]:
   rhs=A*s.Matrix([u,v]);solution=A.inv()*rhs;out.append([A.det(),*solution])
  F,Z=s.symbols('F Z');ages=s.solve([F+Z-(5*k+20),F-k-4*(Z-k)],(F,Z))
  return out+[[2*k+10,k+1,(k+1)*(k+5)],[-5*v,v,3*u+2*v],[-3*k,ages[Z],ages[F]],[3*k+2,k,k*(2*k+2)],[2*((n-1)%6+3),(n-1)//6+1,10*((n-1)%6+3)+(n-1)//6+1],[6*k,2*k,2*k],[4*k+4,2*k+2,6*k+4],[0,2*k,0],[0,k/2,k],[1,-1,k+3],[1/k,1/(2*k),2*k]]
 if ch==13:
  ap=[a+i*k for i in range(int(N))];dec=[5*k-2*i for i in range(int(k+1))];gp=[k*2**i for i in range(int(N))];half=[2**(k+2)*R(1,2)**i for i in range(int(k+3))]
  return [[ap[2],ap[-1],sum(ap)],[5*k-2,dec[-1],sum(dec)],[4*k,k,sum(k+1+i*k for i in range(10))],[k,k+4,sum(i*k for i in range(1,int(k+5)))],[6,k,sum(i*k for i in range(2,7))],[N+1,sum(range(1,int(N+1))),sum(i*i for i in range(1,int(N+1)))],[2*N-1,sum(2*i-1 for i in range(1,int(N+1))),2*N+1],[gp[2],gp[-1],sum(gp)],[R(1,2),half[-1],sum(half)],[9*k*k,3*k,13*k],[3,k+2,4],[N*(N+1)/2,sum(i**3 for i in range(1,int(N+1))),(N+1)**3],[k+2,(k*25+10)-(k*16+8),2*k],[11*k,10*k+(N-1)*k,sum(10*k+i*k for i in range(int(N)))],[-2,-32*k,sum(k*(-2)**i for i in range(6))]]
 if ch==14:return [[k,4*k,12*k],[1/(k-1),3,1/(k*k)],[(k+2)/2,3*(k+2)**2,3*(k+2)**2-12],[-k,3,6],[-1,k,k*k+1],[N,360/N,N-1],[R(2,3),R(8,5)*k,R(1,5)],[k,4*k,24*k*k],[k,2*k,k*k],[3*k,4*k,6*k*k],[k*k,5*k,k],[4*k,6*k,k*k],[k,k,k*k],[-k,3,4*(k*k+9)],[R(1,2),k,3*k*k]]
 if ch==15:return [[0,6*k*k,1],[12*k*k,6*k*k,6*k*k],[2*k,3*k*k,3*k*k],[5*k,4*k*k,6*k*k],[3*k,3*k,3*k],[4*k*k,9*k*k,9*k*k],[6*k,6*k*k,1],[2*k,6*k*k,1],[8*k*k,8*k*k,0],[12*k*k,4*k,14*k],[6*k*k,3*k*k,9*k*k],[8*k*k,2*k*k,6*k*k],[12*k*k,4*k*k,8*k*k],[16*k*k,4*k*k,8*k*k],[6*k,6*k*k,2]]
 if ch==16:return [[k*k,k**3,6*k*k],[6*k*k,6*k**3,22*k*k],[pi*k*k,3*pi*k**3,8*pi*k*k],[5*k,12*pi*k**3,24*pi*k*k],[2*k,R(4,3)*pi*k**3,4*pi*k*k],[2*pi*k*k,R(2,3)*pi*k**3,3*pi*k*k],[6*k,s.sqrt(3)*k*k,s.sqrt(3)*k],[21*k,s.sqrt(21*k*8*k*7*k*6*k),12*k],[2*k,8*pi*k*k,8*pi*k],[3*k,R(8,3)*pi*k**3,7*pi*k*k],[4*k,16*k*k,12*k],[k,k*k,4*k],[8*k,8*k*k,4*k],[12*k*k,24*k*k,20*k],[R(1,4),pi*k*k/4,pi*k/2+2*k]]
 raise AssertionError(ch)
source={11:[('rajshahi','4',R(2,3),'A'),('dhaka','18',30,'A')],12:[('rajshahi','8',-2,'C'),('cumilla','4',4,'B')],13:[('rajshahi','11',768,'C'),('cumilla','5',7,'C')],14:[('cumilla','7',0,'A'),('rajshahi','13',180,'B')],15:[('rajshahi','9',1,'A'),('dinajpur','26',R(1,4),'D')],16:[('cumilla','8',36,'A'),('rajshahi','5',3,'D')]}
reports=[]
for ch in range(11,17):
 base=ROOT/f'content/question-bank/ssc/math/chapter-{ch}';m=read(base/'targets-v1-manifest.json');v=read(base/m['validation']['file']);items={f['file']:read(base/f['file'])['items'] for f in m['files']}
 family=list(v['familyCounts']['MCQ']) # Alphabetical manifest is not generator family order; explicitly map below.
 names={11:'divide-total divide-difference componendo dividendo fourth-proportional third-proportional mean-proportional continued-proportion chain-ratio compound-ratio inverse-ratio ratio-change mixture three-way-share ratio-squares',12:'elimination substitution negative-coefficient fraction-cleared sum-difference purchase ages rectangle-perimeter digits coins boat-speed parallel-lines coincident-lines parameter-unique work-rates',13:'ap-term ap-decreasing ap-find-difference ap-count arithmetic-means sum-natural sum-odd gp-term gp-fraction geometric-mean gp-count sum-cubes sum-from-sn saving-ap alternating-gp',14:'similar-sides parallel-intercept similar-areas reflection rotation regular-symmetry angle-bisector rectangle-similarity shadow-similarity similar-construction inverse-area-scale median-scale circle-similarity origin-reflection midpoint-similarity',15:'same-base-parallels parallelogram-diagonal median-halves base-ratio equal-area-converse quadrilateral-to-triangle rectangle-to-triangle triangle-to-parallelogram equal-parallelograms equal-area-rectangle trapezium-diagonal midpoint-area median-point-ratio diagonal-four-triangles double-triangle',16:'cube cuboid cylinder cone sphere hemisphere equilateral heron annulus composite-solid rectangle-path square-diagonal trapezium rhombus-diagonals sector'}[ch].split()
 lookup={name:i for i,name in enumerate(names)};mcq=written=adapted=responses=0;byurl={}
 for meta in v['itemReviews']:
  q=items[meta['file']][meta['itemInFile']-1];assert hashlib.sha256((q['type']+'\n'+q['text']).encode()).hexdigest()==meta['questionSha256']
  if q.get('provenance'):
   p=q['provenance'][0];value,key=next((val,key) for b,num,val,key in source[ch] if (b,num)==(p['board'],p['questionNumber']));assert q['correct']==key;eq(value,meta['answerExpression']);adapted+=1
  else:
   expected=answers(ch,meta['variant'])[lookup[meta['family']]]
   for value,computed in zip(meta['responseExpressions'],expected):eq(value,computed);responses+=1
   if q['type']=='MCQ':
    eq(meta['answerExpression'],expected[1]);choices=list(map(s.sympify,meta['choiceExpressions']));assert sum(s.simplify(c-expected[1])==0 for c in choices)==1;eq(choices['ABCD'.index(q['correct'])],expected[1]);mcq+=1
   else:written+=1
  for url in re.findall(r'!\[[^]]*\]\(([^)]+)\)',q['text']):byurl[url]=meta
 diagrams=0
 for asset in v['assets']:
  raw=(ROOT/asset['file']).read_bytes();assert hashlib.sha256(raw).hexdigest()==asset['sha256'];g=asset['geometry'];meta=byurl[asset['url']];diagrams+=1
  if g['model']=='UNIFORM_PLANE_SCALE':
   P=g['points'];pixel=g['pixelPoints'];namesP=list(P)
   for i,a in enumerate(namesP):
    for b in namesP[i+1:]:near(math.dist(P[a],P[b])*g['scale'],math.dist(pixel[a],pixel[b]))
   for a,o,b in g['right']:
    dot=sum((P[a][i]-P[o][i])*(P[b][i]-P[o][i]) for i in (0,1));near(dot,0)
   if meta['family']=='board-seed':continue
   f=meta['family'];k=meta['variant']+2
   if ch==14:
    if f in ['similar-sides','similar-areas','similar-construction','inverse-area-scale','median-scale']:
     scale=(k+2)/2 if f=='similar-areas' else k
     for a,b,c,d in [('A','B','P','Q'),('B','C','Q','R'),('C','A','R','P')]:near(math.dist(P[c],P[d])/math.dist(P[a],P[b]),scale)
    elif f=='angle-bisector':near(math.dist(P['A'],P['B'])/math.dist(P['A'],P['C']),2/3);near(math.dist(P['B'],P['D'])/math.dist(P['D'],P['C']),2/3)
    elif f=='reflection':
     for a,b in [('A','P'),('B','Q'),('C','R')]:near(P[a][0],-P[b][0]);near(P[a][1],P[b][1])
    elif f=='rotation':near(sum(P['A'][i]*P['P'][i] for i in (0,1)),0);near(math.dist(P['O'],P['A']),math.dist(P['O'],P['P']))
    elif f=='regular-symmetry':
     for pt in P.values():near(math.dist(pt,[0,0]),1)
    elif f=='midpoint-similarity':near(area(P,'ADE')/area(P,'ABC'),R(1,4))
    elif f=='parallel-intercept':near(area(P,'ADE')/area(P,'ABC'),1/(k*k))
   if ch==15:
    if f in ['same-base-parallels','equal-area-converse']:near(area(P,'ABC'),area(P,'ABD'))
    elif f=='parallelogram-diagonal':near(area(P,'ABC'),area(P,'ADC'))
    elif f=='median-halves':near(area(P,'ABM'),area(P,'AMC'))
    elif f=='base-ratio':near(area(P,'ABD')/area(P,'ADC'),2/3)
    elif f=='quadrilateral-to-triangle':near(area(P,'ABCD'),area(P,'ABE'));near(area(P,'ACD'),area(P,'ACE'))
    elif f=='rectangle-to-triangle':near(area(P,'ABCD'),area(P,'ADE'))
    elif f=='triangle-to-parallelogram':near(area(P,'ABC'),area(P,'BMDA'))
    elif f=='equal-parallelograms':near(area(P,'ABCD'),area(P,'ABEF'))
    elif f=='midpoint-area':near(area(P,'ADE')/area(P,'ABC'),.25)
    elif f=='median-point-ratio':near(area(P,'GBC')/area(P,'ABC'),1/3)
    elif f=='diagonal-four-triangles':near(area(P,'AOB'),area(P,'COD'));near(4*area(P,'AOB'),area(P,'ABCD'))
    elif f=='double-triangle':near(area(P,'ABD')/area(P,'ABC'),2)
   if ch==16:
    if f=='heron':near(math.dist(P['A'],P['B']),13*k);near(math.dist(P['A'],P['C']),15*k);near(area(P,'ABC'),84*k*k)
    elif f=='equilateral':
     for a,b in [('A','B'),('B','C'),('C','A')]:near(math.dist(P[a],P[b]),2*k)
  else:
   physical=g['physical'];assert physical['r']>0 and physical['h']>=0
 assert (mcq,adapted,written)==(148,2,120)
 report=dict(status='INDEPENDENT_EXACT_RESPONSE_AND_MODEL_WITNESSES_PASS_NOT_TEACHER_APPROVAL',chapter=ch,originalMCQ=mcq,adaptedMCQ=adapted,written=written,recomputedResponseWitnesses=responses,diagramHashAndCoordinateChecks=diagrams,limits='Recomputed numeric/model answers and selected plane relationships only; not independent narrative/proof/construction/coverage or production approval. Solid drawings schematic projections.')
 (ROOT/f'docs/question-bank/ssc-math-ch{ch}-independent-check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');reports.append(report);print('PASS',report)
# Chapter 17 is separately authorized later; this verifier still only checks 11–16.
