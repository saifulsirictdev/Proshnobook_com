"""Development-only deterministic illustrated-bank helpers; no DB/network operations."""
import hashlib,html,json,math,sys
from pathlib import Path
from collections import Counter
import sympy as S
ROOT=Path(__file__).resolve().parents[2]
R=S.Rational
SOURCE='3.-Math-Link-Board-142-311_Compressed-1.pdf'
SOURCE_URL='https://drive.google.com/file/d/1dbnQgd9Su9CBeId1RV-hShNh8IG_YOJ5/view'
def tex(v):return S.latex(S.sympify(v))
def save(path,text):
 if '--check' in sys.argv:assert path.read_text()==text,f'Stale {path}'
 else:path.parent.mkdir(parents=True,exist_ok=True);path.write_text(text)
def sha(b):return hashlib.sha256(b).hexdigest()
class Bank:
 def __init__(self,chapter,title,targets):
  self.chapter=chapter;self.title=title;self.target=targets;self.base=ROOT/f'content/question-bank/ssc/math/chapter-{chapter}'
  self.assetdir=ROOT/f'public/question-bank/ssc-math-ch{chapter}-v1';self.url=f'https://proshnobook.com/question-bank/ssc-math-ch{chapter}-v1/'
  self.rows=[];self.audit=[];self.assets=[]
 def pic(self,name,kind,params):
  if kind is None:return ''
  svg,geometry=figure(kind,**params);p=self.assetdir/(name+'.svg');save(p,svg)
  self.assets.append(dict(file=str(p.relative_to(ROOT)),url=self.url+p.name,bytes=len(svg.encode()),sha256=sha(svg.encode()),kind=kind,parameters=params,geometry=geometry))
  return f'\n![চিত্র; মাপানুযায়ী নয়]({self.url}{p.name})'
 def put(self,kind,f,n,text,why,fig,**kwargs):
  stem=text+self.pic(f'{kind.lower()}-{f}-{n}',*fig)
  self.rows.append(dict(type=kind,text=stem,explanation=why,page=f'নিজস্ব অনুশীলনী; Ch{self.chapter}/{kind}/{f}/{n}; বোর্ড/বইয়ের অবিকল নয়',difficulty='HARD' if kind=='CQ' else 'MEDIUM',**kwargs))
  self.audit.append(dict(origin='ORIGINAL_PARAMETERISED_PRACTICE_NOT_BOARD_OR_TEXTBOOK',family=f,variant=n,hasDiagram=fig[0] is not None))
 def mcq(self,f,n,text,value,why,fig,wrong=None):
  value=S.sympify(value);choices=[value]+list(map(S.sympify,wrong if wrong is not None else [value+1,value-1,value+2]));assert len(choices)==4
  assert all(S.simplify(a-b)!=0 for i,a in enumerate(choices) for b in choices[i+1:])
  shift=(len(f)+n)%4;choices=choices[shift:]+choices[:shift];key='ABCD'[choices.index(value)]
  self.put('MCQ',f,n,text,why+' সঠিক উত্তর $'+tex(value)+'$।',fig,options={k:'$'+tex(v)+'$' for k,v in zip('ABCD',choices)},correct=key)
  self.audit[-1].update(answerExpression=str(value),choiceExpressions=list(map(str,choices)),correct=key)
 def source(self,pdf,num,board,text,options,key,answer,why,fig,native=False):
  self.rows.append(dict(type='MCQ',text=text+self.pic(f'source-{board}-{num}',*fig),options=dict(zip('ABCD',options)),correct=key,explanation=why,page=f'সংকলন: মুদ্রিত {pdf+141}; PDF {pdf}; প্রশ্ন {num}',difficulty='MEDIUM',provenance=[dict(kind='board',board=board,examYear=2024,sourceFile=SOURCE,pdfPage=pdf,printedPage=str(pdf+141),questionNumber=str(num))]))
  self.audit.append(dict(origin='ADAPTED_BOARD_COMPILATION_REDRAWN_OR_ADDED_FIGURE',family='board-seed',variant=len(self.rows),hasDiagram=fig[0] is not None,sourceHadFigure=native,visualRead=True,correct=key,answerExpression=str(answer),adaptation='মূল তথ্য ও বিকল্পের ক্রম রেখে গদ্য/যৌথ উদ্দীপক inline; চিত্র নতুন করে অঙ্কিত বা সহায়ক চিত্র যোগ করা। অবিকল scan নয়।'))
 def written(self,kind,f,n,text,parts,fig,checks):
  for a,b in checks:assert S.simplify(S.sympify(a)-S.sympify(b))==0,(f,n,a,b)
  if kind=='CQ':
   assert len(parts)==3
   self.put(kind,f,n,text,'চিত্র মাপানুযায়ী নয়; নির্মাণ/উপপাদ্য প্রয়োগ ও যুক্তিসহ সমাধান অংশগুলোতে দেওয়া আছে।',fig,parts=[dict(label=l,marks=m,question=q,solution=sol) for l,m,(q,sol) in zip(['ক','খ','গ'],[2,4,4],parts)])
  else:self.put(kind,f,n,text,parts,fig)
  self.audit[-1]['exactChecks']=[dict(lhs=str(a),rhs=str(b)) for a,b in checks]
 def emit(self):
  counts={k:sum(q['type']==k for q in self.rows) for k in ['MCQ','CQ','SQ']};assert counts==self.target,(counts,self.target)
  # Image filenames cannot be used to conceal duplicate wording.
  import re
  stems=[re.sub(r'!\[[^\]]*\]\([^)]*\)','',q['text']).strip() for q in self.rows];assert len(set(stems))==len(stems)
  scope=dict(category='Class 9',subject='গণিত',topic=self.title,book=getattr(self,'book','Proshnobook — সংকলন ও নিজস্ব চিত্রসহ জ্যামিতি অনুশীলনী'),edition=f'Chapter {self.chapter} v1; DRAFT; শিক্ষক/চিত্র/প্রমাণ review বাকি',sourceUrl='https://github.com/saifulsirictdev/Proshnobook_com',lang='Bangla')
  def emit(path,obj):
   text=json.dumps(obj,ensure_ascii=False,indent=2)+'\n';save(path,text);return dict(file=str(path.relative_to(self.base)),bytes=len(text.encode()),sha256=sha(text.encode()))
  files=[];meta={id(q):m for q,m in zip(self.rows,self.audit)}
  for kind,filename in [('MCQ','mcq'),('CQ','cq'),('SQ','sq')]:
   items=[q for q in self.rows if q['type']==kind]
   for j in range(0,len(items),150):
    chunk=items[j:j+150];name=filename+(f'-{j//150+1}' if len(items)>150 else '')
    for i,q in enumerate(chunk,1):meta[id(q)].update(file=f'target-v1/{name}.json',itemInFile=i,questionSha256=sha((q['type']+'\n'+q['text']).encode()))
    files.append(emit(self.base/f'target-v1/{name}.json',{**scope,'items':chunk}))
  source=[q for q,m in zip(self.rows,self.audit) if m['family']=='board-seed'];original={k:sum(q['type']==k and m['origin'].startswith('ORIGINAL') for q,m in zip(self.rows,self.audit)) for k in counts}
  limits=[f'Numeric target {sum(counts.values())} met; {len(source)} source-adapted MCQ and {sum(original.values())} original parameter variants, not {sum(counts.values())} distinct concepts.',
   'Compilation labels are not independently authenticated official papers. Figures redrawn/added, not facsimiles. Original practice is not board or verbatim NCTB content.',
   'Full current-edition NCTB chapter not obtained/read; board collection and syllabus coverage not exhaustive. Independent teacher, construction, diagram and proof review pending.',
   'HTTPS SVG references target bundled versioned public assets. Assets NOT deployed, live image availability unverified. Use offline gallery until deployment and real editor/print checks.',
   'Exact numeric/coordinate checks do not independently certify every proof step. No real DB import, approval or deployment.']
  illustrated={k:sum(q['type']==k and m['hasDiagram'] for q,m in zip(self.rows,self.audit)) for k in counts}
  review=dict(status='NUMERICAL_TARGET_MET_ILLUSTRATED_DRAFT_ASSET_DEPLOY_AND_TEACHER_REVIEW_PENDING' if self.assets else 'NUMERICAL_TARGET_MET_DRAFT_TEACHER_REVIEW_PENDING',targetMet=True,teacherApproved=False,diagramTeacherApproved=False,assetsDeployed=False,assetLiveAvailabilityVerified=False,targetCounts=counts,counts=counts,remaining={k:0 for k in counts},boardCounts=dict(MCQ=len(source),CQ=0,SQ=0),originalPracticeCounts=original,illustratedCounts=illustrated,sourceNativeFigureCount=sum(m.get('sourceHadFigure',False) for m in self.audit),importedCounts={k:0 for k in counts},databaseCountVerified=False,fullChapterTextbookRead=False,boardSearchExhaustive=False,source=dict(fileName=SOURCE,sourceUrl=SOURCE_URL,sha256='ef88ec3c42fa52f407c39f1b978fa0494a695bac7d2b51a7c3921afa49a46111'),familyCounts={k:dict(sorted(Counter(m['family'] for q,m in zip(self.rows,self.audit) if q['type']==k and m['origin'].startswith('ORIGINAL')).items())) for k in counts},files=files,assets=self.assets,itemReviews=self.audit,limitations=limits)
  review.update(getattr(self,'extraReview',{}))
  seed=emit(self.base/'board-seed-v1.json',{**scope,'sourceUrl':SOURCE_URL,'items':source});rv=emit(self.base/'target-v1/validation.json',review)
  emit(self.base/'targets-v1-manifest.json',dict(status=review['status'],chapter=self.chapter,topic=self.title,category='Class 9',subject='গণিত',counts=counts,illustratedCounts=illustrated,teacherApproved=False,assetsDeployed=False,files=files,validation=rv,boardSeed=seed,limitations=limits))
  print(f'PASS ch{self.chapter}: {counts}; {len(self.assets)} diagrams; DRAFT, assets not deployed.')

def figure(kind,**p):
 """Coordinates record mathematical relationships, SVG is a schematic, not ruler scale."""
 stroke=[];words=[];geometry={};points={}
 def line(a,b,dash=False):stroke.append(f'<path d="M{a[0]:.3f} {a[1]:.3f}L{b[0]:.3f} {b[1]:.3f}"'+(' stroke-dasharray="5 4"' if dash else '')+'/>')
 def circle(c,r,dash=False):stroke.append(f'<circle cx="{c[0]:.3f}" cy="{c[1]:.3f}" r="{r:.3f}"'+(' stroke="#94a3b8" stroke-dasharray="5 4"' if dash else '')+'/>')
 def txt(c,t):words.append(f'<text x="{c[0]:.3f}" y="{c[1]:.3f}">{html.escape(str(t))}</text>')
 def point(k,c,offset=(0,-9)):
  points[k]=c;txt((c[0]+offset[0],c[1]+offset[1]),k);return c
 def pol(c,r,deg):a=math.radians(deg);return (c[0]+r*math.cos(a),c[1]-r*math.sin(a))
 def rightmark(o,a,b):
  def step(p):
   d=math.dist(o,p);return ((p[0]-o[0])*9/d,(p[1]-o[1])*9/d)
  u,v=step(a),step(b);x=(o[0]+u[0],o[1]+u[1]);y=(x[0]+v[0],x[1]+v[1]);z=(o[0]+v[0],o[1]+v[1]);line(x,y);line(y,z)
 def anglemark(o,a,b):
  t1=math.atan2(a[1]-o[1],a[0]-o[0]);t2=math.atan2(b[1]-o[1],b[0]-o[0]);delta=(t2-t1+math.pi)%(2*math.pi)-math.pi
  x=(o[0]+19*math.cos(t1),o[1]+19*math.sin(t1));y=(o[0]+19*math.cos(t1+delta),o[1]+19*math.sin(t1+delta));stroke.append(f'<path d="M{x[0]:.3f} {x[1]:.3f}A19 19 0 0 {1 if delta>0 else 0} {y[0]:.3f} {y[1]:.3f}"/>')
 def triangle(a,b,c,arcs=False):
  # BC=a, CA=b, AB=c. Proper nondegenerate construction only.
  assert a>0 and b>0 and c>0 and abs(b-c)<a<b+c
  ax=(c*c+a*a-b*b)/(2*a);height=math.sqrt(c*c-ax*ax);sc=min(220/a,155/height)
  B=point('B',(55,220),(-10,17));C=point('C',(55+a*sc,220),(10,17));A=point('A',(55+ax*sc,220-height*sc))
  for u,v in [(A,B),(B,C),(C,A)]:line(u,v)
  if arcs:
   # Compass circle arcs at A, never complete huge circles clipped by viewport.
   for center,radius in [(B,c*sc),(C,b*sc)]:
    theta=math.atan2(A[1]-center[1],A[0]-center[0]);u=(center[0]+radius*math.cos(theta-.18),center[1]+radius*math.sin(theta-.18));v=(center[0]+radius*math.cos(theta+.18),center[1]+radius*math.sin(theta+.18));stroke.append(f'<path d="M{u[0]:.3f} {u[1]:.3f}A{radius:.3f} {radius:.3f} 0 0 1 {v[0]:.3f} {v[1]:.3f}" stroke="#64748b" stroke-dasharray="4 3"/>')
  geometry.update(sides=dict(BC=a,CA=b,AB=c),points=dict(A=A,B=B,C=C))
  return A,B,C
 if kind in ['height-single','height-eye','height-towers','height-same','height-opposite','height-broken']:
  # Physical coordinates use level ground y=0; the SVG transform preserves angles.
  H=p['height'];d=p['distance'];eye=p.get('eye',0);assert H>eye>=0 and d>0
  far=p.get('far',d);left=p.get('left',0);total=p.get('total',H)
  xmax=far if kind=='height-same' else left+d if kind=='height-opposite' else d
  sc=min(225/xmax,155/max(H,total));x0=55+left*sc if kind=='height-opposite' else 55
  def xy(x,y):return (x0+x*sc,225-y*sc)
  B=point('B',xy(0,0),(-10,18));T=point('C' if kind=='height-broken' else 'T',xy(0,H),(-12,-8))
  line(B,T);line(xy(-left if left else -0.12*xmax,0),xy(xmax-left+0.1*xmax,0));rightmark(B,T,xy(d,0))
  if kind=='height-broken':
   A=point('A',xy(0,total),(-12,-7));D=point('D',xy(d,0),(8,18));line(T,A,True);line(T,D);anglemark(D,B,T);txt((D[0]-30,D[1]-9),'θ');anglemark(T,B,D);txt((T[0]+14,T[1]+25),'β');geometry.update(totalHeight=total)
  elif kind in ['height-eye','height-towers']:
   P=point('D' if kind=='height-towers' else 'P',xy(d,0),(12,18));E=point('S' if kind=='height-towers' else 'E',xy(d,eye),(13,-7));M=point('M',xy(0,eye),(-13,4));line(P,E);line(M,E,True);line(E,T);rightmark(M,T,E);anglemark(E,M,T);txt((E[0]-31,E[1]-9),'α')
   if p.get('depression'):
    X=xy(d,H);line(T,X,True);anglemark(T,X,E);txt((T[0]+31,T[1]+14),'δ')
  elif kind=='height-same':
   P=point('P',xy(d,0),(0,19));Q=point('Q',xy(far,0),(8,19));line(P,T);line(Q,T);anglemark(P,B,T);anglemark(Q,B,T);txt((P[0]-30,P[1]-10),'α');txt((Q[0]-31,Q[1]-8),'β')
  elif kind=='height-opposite':
   P=point('P',xy(-left,0),(-8,19));Q=point('Q',xy(d,0),(8,19));line(P,T);line(Q,T);anglemark(P,B,T);anglemark(Q,B,T);txt((P[0]+30,P[1]-9),'α');txt((Q[0]-30,Q[1]-9),'β')
  else:
   P=point('P',xy(d,0),(12,18));line(P,T);anglemark(P,B,T);txt((P[0]-31,P[1]-9),'θ')
   if p.get('depression'):
    X=xy(d,H);line(T,X,True);anglemark(T,X,P);txt((T[0]+30,T[1]+14),'δ')
  geometry.update(points=points.copy(),physicalHeight=H,physicalDistance=d,physicalEye=eye,physicalFar=far,physicalLeft=left,scale=sc,basePixel=xy(0,0))
 elif kind=='trig-right':
  # A is the reference acute angle, B is right; BC opposite, AB adjacent.
  opp=p.get('opp',3);adj=p.get('adj',4);assert opp>0 and adj>0
  hyp=math.hypot(opp,adj);scale=min(210/adj,155/opp);names=p.get('names',['A','B','C'])
  B=point(names[1],(55,220),(-12,17));A=point(names[0],(55+adj*scale,220),(12,17));C=point(names[2],(55,220-opp*scale),(-12,-7))
  for u,v in [(A,B),(B,C),(C,A)]:line(u,v)
  rightmark(B,A,C);anglemark(A,B,C);txt((A[0]-33,A[1]-9),p.get('theta','θ'))
  if p.get('complement'):anglemark(C,A,B);txt((C[0]+14,C[1]+min(35,(B[1]-C[1])*0.55)),p.get('phi','φ'))
  labels=p.get('labels',{})
  if 'opp' in labels:txt((32,(B[1]+C[1])/2),labels['opp'])
  if 'adj' in labels:txt(((A[0]+B[0])/2,250),labels['adj'])
  if 'hyp' in labels:txt(((A[0]+C[0])/2+17,(A[1]+C[1])/2-10),labels['hyp'])
  geometry.update(points=dict(A=A,B=B,C=C),names=names,opposite=opp,adjacent=adj,hypotenuse=hyp,scale=scale,referenceAngle=math.degrees(math.atan2(opp,adj)))
 elif kind=='degenerate':
  a=p['a'];b=p['b'];A=point('A',(45,150),(0,-15));B=point('B',(45+250*a/(a+b),150),(0,-15));C=point('C',(295,150),(0,-15));line(A,C);txt((170,230),'Collinear: no proper triangle');geometry.update(lengths=[a,b,a+b],points=dict(A=A,B=B,C=C))
 elif kind in ['sss','sas','asa','right','isos','equilateral']:
  if kind=='sas':
   b=p.get('b',6);c=p.get('c',5);angle=p.get('angle',60);a=math.sqrt(b*b+c*c-2*b*c*math.cos(math.radians(angle)))
  elif kind=='asa':
   a=p.get('a',7);Bangle=p.get('B',45);Cangle=p.get('C',60);Aangle=180-Bangle-Cangle;assert min(Aangle,Bangle,Cangle)>0;b=a*math.sin(math.radians(Bangle))/math.sin(math.radians(Aangle));c=a*math.sin(math.radians(Cangle))/math.sin(math.radians(Aangle))
  elif kind=='right':c=p.get('leg',3);b=p.get('hyp',5);a=math.sqrt(b*b-c*c)
  elif kind=='isos':a=p.get('base',6);b=c=p.get('leg',7)
  elif kind=='equilateral':a=b=c=p.get('side',6)
  else:a,b,c=p.get('a',6),p.get('b',7),p.get('c',8)
  A,B,C=triangle(a,b,c,True)
  if kind=='right':rightmark(B,A,C)
  if kind=='sas':anglemark(A,B,C)
  if kind=='asa':anglemark(B,A,C);anglemark(C,A,B)
  if p.get('median'):
   M=point('M',((B[0]+C[0])/2,220),(0,22));line(A,M,True);rightmark(M,A,C)
  if p.get('label'):txt((170,253),p['label'])
 elif kind in ['bisector','perp-bisector','online-perp','off-perp','parallel']:
  if kind=='bisector':
   ang=p.get('angle',60);O=point('O',(70,215),(-10,18));A=point('A',(290,215),(12,8));B=point('B',pol(O,200,ang),(0,-10));line(O,A);line(O,B)
   X=point('X',pol(O,95,0),(0,19));Y=point('Y',pol(O,95,ang),(-12,-7));P=point('P',pol(O,155,ang/2),(12,-5));line(O,P,True);anglemark(O,X,P);anglemark(O,P,Y)
   # Radial compass arc O(XY) and equal-radius intersections at P.
   for center,radius,target,span in [(O,95,pol(O,95,ang/2),ang/2+5),(X,math.dist(X,P),P,12),(Y,math.dist(Y,P),P,12)]:
    rad=math.atan2(target[1]-center[1],target[0]-center[0]);s=math.radians(span);u=(center[0]+radius*math.cos(rad-s),center[1]+radius*math.sin(rad-s));v=(center[0]+radius*math.cos(rad+s),center[1]+radius*math.sin(rad+s));stroke.append(f'<path d="M{u[0]:.3f} {u[1]:.3f}A{radius:.3f} {radius:.3f} 0 0 1 {v[0]:.3f} {v[1]:.3f}" stroke="#64748b" stroke-dasharray="4 3"/>')
   geometry.update(angle=ang,points=dict(O=O,X=X,Y=Y,P=P))
  else:
   A=point('A',(75,155),(-10,20));B=point('B',(265,155),(10,20));M=point('M',(170,155),(0,20));line((25,155),(315,155));P=point('P',(170,60));Q=point('Q',(170,250),(12,2));line(P,Q,True);rightmark(M,P,B)
   for center in [A,B]:
    radius=math.dist(center,P)
    for target in ([P,Q] if kind!='parallel' else [P]):
     t=math.atan2(target[1]-center[1],target[0]-center[0]);u=(center[0]+radius*math.cos(t-.22),center[1]+radius*math.sin(t-.22));v=(center[0]+radius*math.cos(t+.22),center[1]+radius*math.sin(t+.22));stroke.append(f'<path d="M{u[0]:.3f} {u[1]:.3f}A{radius:.3f} {radius:.3f} 0 0 1 {v[0]:.3f} {v[1]:.3f}" stroke="#64748b" stroke-dasharray="4 3"/>')
   if kind=='parallel':line((25,60),(315,60));txt((300,48),'l ∥ m')
   if kind in ['off-perp','perp-bisector']:line(P,A,True);line(P,B,True)
   geometry.update(points=dict(A=A,B=B,M=M,P=P,Q=Q),perpendicularAt='M')
 elif kind in ['parallelogram','rhombus','rectangle']:
  if kind=='rhombus':
   d1=p.get('d1',10);d2=p.get('d2',14);sc=min(220/d1,170/d2);A=point('A',(170-d1*sc/2,145),(-13,5));B=point('B',(170,145-d2*sc/2));C=point('C',(170+d1*sc/2,145),(13,5));D=point('D',(170,145+d2*sc/2),(0,20));O=point('O',(170,145),(12,-7));line(A,C,True);line(B,D,True);rightmark(O,C,B);geometry.update(diagonals=[d1,d2])
  else:
   a=p.get('a',7);b=p.get('b',5);ang=90 if kind=='rectangle' else p.get('angle',60);sc=min(190/(a+b*abs(math.cos(math.radians(ang)))),150/(b*math.sin(math.radians(ang))));A=point('A',(55,225),(-10,15));B=point('B',(55+a*sc,225),(8,15));D=point('D',(55+b*sc*math.cos(math.radians(ang)),225-b*sc*math.sin(math.radians(ang))),(-10,-7));C=point('C',(B[0]+D[0]-A[0],D[1]),(10,-7));line(A,C,True);line(B,D,True);geometry.update(sides=[a,b],angle=ang)
   if kind=='rectangle':rightmark(A,B,D)
   else:anglemark(A,B,D)
  for u,v in [(A,B),(B,C),(C,D),(D,A)]:line(u,v)
  geometry.update(points=dict(A=A,B=B,C=C,D=D))
  if p.get('label'):txt((170,260),p['label'])
 elif kind in ['central','same-segment','equilateral-circle','semicircle','tangent-chord']:
  O=(170,145);r=94;circle(O,r);point('O',O,(0,18));alpha=p.get('alpha',50)
  if kind=='semicircle':angles=dict(A=180,B=0,C=2*p.get('baseAngle',45))
  elif kind=='tangent-chord':angles=dict(A=0,B=2*alpha,C=225)
  else:angles=dict(A=90,B=270-alpha,C=270+alpha)
  coords={k:point(k,pol(O,r,t),(12*math.cos(math.radians(t)),-12*math.sin(math.radians(t)))) for k,t in angles.items()}
  A,B,C=coords['A'],coords['B'],coords['C']
  for u,v in [(A,B),(B,C),(C,A),(O,B),(O,C)]:line(u,v)
  if kind=='equilateral-circle':line(O,A)
  if kind=='same-segment':D=point('D',pol(O,r,140),(-12,-6));line(D,B);line(D,C)
  if kind=='semicircle':line(A,B);rightmark(C,A,B)
  if kind=='tangent-chord':T=point('T',(264,28),(10,-3));line((264,25),(264,255));line(A,T);line(O,A);anglemark(A,T,B);rightmark(A,O,T)
  elif kind!='semicircle':anglemark(A,B,C);anglemark(O,B,C)
  if p.get('label'):txt((170,260),p['label'])
  geometry.update(center=O,radius=r,points=coords)
 elif kind in ['cyclic','cyclic-rectangle']:
  O=(170,145);r=94;circle(O,r);theta=p.get('theta',100)
  angles=[90,270-theta,(90-2*theta)%360,(90-theta)%360] if kind=='cyclic' else [45,135,225,315]
  pts=[point(k,pol(O,r,t),(12*math.cos(math.radians(t)),-12*math.sin(math.radians(t)))) for k,t in zip('ABCD',angles)]
  for u,v in zip(pts,pts[1:]+pts[:1]):line(u,v)
  if kind=='cyclic-rectangle':line(pts[0],pts[2],True);line(pts[1],pts[3],True);point('O',O,(0,-6));rightmark(pts[1],pts[0],pts[2])
  else:anglemark(pts[1],pts[0],pts[2])
  if p.get('extend'):
   C,D=pts[2],pts[3];dd=math.dist(C,D);E=point('E',(D[0]+32*(D[0]-C[0])/dd,D[1]+32*(D[1]-C[1])/dd),(7,12));line(D,E)
  geometry.update(center=O,radius=r,points=dict(zip('ABCD',pts)))
 elif kind in ['chord','equal-chords','concentric']:
  rad=p.get('r',5);dist=p.get('d',3);assert 0<dist<rad;O=(170,145);rr=94;sc=rr/rad;h=math.sqrt(rad*rad-dist*dist);circle(O,rr);point('O',O,(0,18))
  if kind=='concentric':circle(O,dist*sc)
  if kind=='equal-chords':
   pts={}
   for name,xx,sgn in [('A',170-dist*sc,1),('B',170-dist*sc,-1),('C',170+dist*sc,1),('D',170+dist*sc,-1)]:pts[name]=point(name,(xx,145-sgn*h*sc),(-12 if name in 'AB' else 12,0))
   E=point('E',(170-dist*sc,145),(-12,5));F=point('F',(170+dist*sc,145),(12,5));line(pts['A'],pts['B']);line(pts['C'],pts['D']);line(E,F,True);line(O,pts['A'],True);rightmark(E,O,pts['A']);rightmark(F,O,pts['C'])
   geometry.update(points=pts)
  else:
   A=point('A',(170-h*sc,145-dist*sc),(-10,-8));B=point(p.get('endB','B'),(170+h*sc,145-dist*sc),(10,-8));M=point(p.get('midpoint','M'),(170,145-dist*sc),(0,-10));line(A,B);line(O,M,True);line(O,B);line(O,A,True);rightmark(M,O,B);geometry.update(points=dict(A=A,B=B,M=M))
   if p.get('top'):
    D=point(p['top'],(170,239),(0,20));line(A,D);line(B,D)
  geometry.update(center=O,physicalRadius=rad,physicalDistance=dist)
  if p.get('label'):txt((170,260),p['label'])
 elif kind in ['tangents','point-tangent','inside-point']:
  O=(110,145);rr=80;circle(O,rr)
  if kind!='tangents':point('O',O,(-12,4))
  if kind=='point-tangent':A=point('A',(190,145),(12,6));line(O,A);line((190,30),(190,250));rightmark(A,O,(190,30));geometry.update(center=O,radius=rr,points=dict(A=A))
  elif kind=='inside-point':P=point('P',(140,120),(10,-5));line(O,P,True);geometry.update(center=O,radius=rr,points=dict(P=P))
  else:
   alpha=p.get('alpha',60);ratio=1/math.sin(math.radians(alpha/2));scale=min(80,180/ratio);O=(100,145);stroke.pop();circle(O,scale);dist=scale*ratio;P=point(p.get('external','P'),(O[0]+dist,145),(13,6));point('O',O,(-12,5));xx=scale*scale/dist;yy=math.sqrt(scale*scale-xx*xx)
   T=point(p.get('upper','T'),(O[0]+xx,145-yy),(0,-13));U=point(p.get('lower','U'),(O[0]+xx,145+yy),(0,20))
   for u,v in [(P,T),(P,U),(O,T),(O,U),(O,P)]:line(u,v)
   rightmark(T,O,P);rightmark(U,O,P);anglemark(P,T,U)
   if p.get('arcMidpoint'):
    D=point(p['arcMidpoint'],(O[0]-scale,145),(-12,5));line(D,T);line(D,U);line(T,U)
   geometry.update(center=O,radius=scale,points=dict(P=P,T=T,U=U),externalAngle=alpha)
 elif kind in ['external-circles','internal-circles','separate-circles']:
  r1=p.get('r1',5);r2=p.get('r2',3);assert r1>=r2>0
  D=r1+r2 if kind=='external-circles' else r1-r2 if kind=='internal-circles' else r1+r2+2
  sc=min(85/r1,260/(r1+D+r2));O=(35+r1*sc,145);P=(O[0]+D*sc,145);circle(O,r1*sc);circle(P,r2*sc);point('O1',O,(0,20));point('O2',P,(0,20));line(O,P,True)
  T=(O[0]+r1*sc,145);point('T',T,(0,-12));line((T[0],30),(T[0],250),True);rightmark(T,O,(T[0],30))
  geometry.update(physicalRadii=[r1,r2],physicalCenterDistance=D,centers=[O,P],scale=sc)
 else:raise ValueError(kind)
 svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 345 290" width="345" height="290" role="img" aria-label="Geometry diagram"><rect width="345" height="290" fill="white"/><g stroke="#17243b" stroke-width="1.8" fill="none" stroke-linejoin="round">'+''.join(stroke)+'</g><g fill="#17243b" font-family="Arial,sans-serif" font-size="16" text-anchor="middle">'+''.join(words)+'<text x="172" y="282" font-size="10">Schematic — not to scale; dashed lines: auxiliary</text></g></svg>\n'
 return svg,geometry
