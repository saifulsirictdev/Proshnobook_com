"""Independent statistics/graph verifier: no builder/statistics-helper imports."""
from pathlib import Path
import json,math,hashlib,re,xml.etree.ElementTree as ET
import sympy as s
ROOT=Path(__file__).resolve().parents[2];R=s.Rational
read=lambda p:json.loads(p.read_text())
def eq(a,b):assert s.simplify(s.sympify(a)-s.sympify(b))==0,(a,b)
def near(a,b):assert math.isclose(float(a),float(b),rel_tol=1e-6,abs_tol=1e-5),(a,b)
def grouped(raw):
 lo,h=raw['lo'],raw['h'];f=raw['f'];N=sum(f);edges=[R(2*lo-1,2)+i*h for i in range(len(f)+1)];mid=[(a+b)/2 for a,b in zip(edges,edges[1:])];cf=[sum(f[:i+1]) for i in range(len(f))];j=next(i for i,a in enumerate(cf) if a>=R(N,2));mode=f.index(max(f));med=edges[j]+(R(N,2)-sum(f[:j]))*h/f[j];mu=sum(a*b for a,b in zip(f,mid))/N
 for k,v in [('N',N),('mean',mu),('median',med)]:eq(raw[k],v)
 assert raw['cf']==cf
 for a,b in zip(raw['bounds'],edges):eq(a,b)
 for a,b in zip(raw['m'],mid):eq(a,b)
 mod=None
 if f.count(f[mode])==1:
  d1=f[mode]-(f[mode-1] if mode else 0);d2=f[mode]-(f[mode+1] if mode+1<len(f) else 0);mod=edges[mode]+R(d1,d1+d2)*h;eq(raw['mode'],mod)
 else:assert raw['mode'] is None
 return dict(N=N,mu=mu,med=med,mode=mod,mid=mid,edges=edges,cf=cf,j=j,modal=mode,f=f,h=h)
def rawstats(a):
 a=sorted(a);N=len(a);freq={x:a.count(x) for x in set(a)};modes=[x for x,c in freq.items() if c==max(freq.values())];assert len(modes)==1
 return N,R(sum(a),N),s.Integer(a[N//2]) if N%2 else R(a[N//2-1]+a[N//2],2),modes[0]
base=ROOT/'content/question-bank/ssc/math/chapter-17';m=read(base/'targets-v1-manifest.json');v=read(base/m['validation']['file']);items={f['file']:read(base/f['file'])['items'] for f in m['files']};sources={('dhaka','2'):(12,'A'),('rajshahi','15'):(34,'C'),('cumilla','11'):(1,'A'),('cumilla','12'):(40,'C')};original=board=user=responses=0;byurl={}
for meta in v['itemReviews']:
 q=items[meta['file']][meta['itemInFile']-1];assert hashlib.sha256((q['type']+'\n'+q['text']).encode()).hexdigest()==meta['questionSha256']
 if q.get('provenance'):
  p=q['provenance'][0];value,key=sources[p['board'],p['questionNumber']];assert q['correct']==key;eq(meta['answerExpression'],value);board+=1;continue
 data=meta['model'];f=meta['family'];kind=data['kind']
 if 'grouped' in data:
  g=grouped(data['grouped']);N,mu,med=g['N'],g['mu'],g['med'];counts=g['f'];d=data['grouped']
  if 'raw' in data:
   assert len(data['raw'])==N
   for i,a in enumerate(d['starts']):assert counts[i]==sum(a<=x<=a+d['h']-1 for x in data['raw'])
 if kind.startswith('user-'):
  user+=1;expected={1:[60,44,50],2:[1,R(151,2),30],3:[R(21,2),R(127,2),60]}[meta['variant']]
 elif kind=='raw':
  N,mu,med,mode=rawstats(data['raw']);assert sum(data['frequencyCounts'])==N
  expected=[N,mu,med]
  if f=='raw-median':expected=[N,med,med+5]
  if f in ['raw-mode','discrete-mode']:expected=[N,mode,mu-mode]
  if f=='transformed-mean':expected=[N,2*mu+3,2*med+3]
 elif kind=='combined':
  N=data['n1']+data['n2'];mu=R(data['n1']*data['m1']+data['n2']*data['m2'],N);expected=[N,mu,mu+2]
 elif kind=='weighted':
  total=sum(a*b for a,b in zip(data['values'],data['weights']));N=sum(data['weights']);expected=[N,R(total,N),total]
 else:
  expected={
   'grouped-mean':[N,mu,N],'shortcut-mean':[N,mu,0],
   'grouped-median':[sum(counts[:g['j']]),med,med],
   'grouped-mode':[max(counts),g['mode'],d['h']],
   'frequency-polygon':[d['h'],g['mid'][g['modal']],N],
   'less-ogive':[N,med,N],'more-ogive':[N,0,N],
   'raw-grouping':[len(data.get('raw',[])),mu,N],
   'missing-frequency':[N-counts[2],counts[2],N],
   'cumulative-median':[counts[-1],med,N],
   'class-boundaries':[g['edges'][0],g['mid'][0],d['h']],
   'relative-frequency':[max(counts),R(100*counts[0],N),N-counts[0]]}[f]
 if not kind.startswith('user-'):original+=1
 assert len(meta['responseExpressions'])==3
 for a,b in zip(meta['responseExpressions'],expected):eq(a,b);responses+=1
 if q['type']=='MCQ':
  eq(meta['answerExpression'],expected[1]);choices=list(map(s.sympify,meta['choiceExpressions']));assert sum(s.simplify(a-expected[1])==0 for a in choices)==1;eq(choices['ABCD'.index(q['correct'])],expected[1])
 alltext=q['text']+'\n'+q['explanation']+'\n'+'\n'.join(p['solution'] for p in q.get('parts',[]))
 for url in re.findall(r'!\[[^]]*\]\(([^)]+)\)',alltext):byurl[url]=meta
for asset in v['assets']:
 raw=(ROOT/asset['file']).read_bytes();assert hashlib.sha256(raw).hexdigest()==asset['sha256'];assert asset['url'] in byurl
 g=asset['geometry'];d=g['grouped'];computed=grouped(d);kind=g['kind'];points=g['dataPoints']
 if kind=='polygon':expected=[[computed['mid'][0]-d['h'],0],*zip(computed['mid'],d['f']),[computed['mid'][-1]+d['h'],0]]
 elif kind=='less':expected=list(zip(computed['edges'],[0,*computed['cf']]))
 elif kind=='more':expected=list(zip(computed['edges'],[computed['N'],*[computed['N']-x for x in computed['cf']]]))
 else:expected=list(zip(computed['edges'],computed['edges'][1:],d['f']))
 assert len(points)==len(expected)
 for a,b in zip(points,expected):
  for x,y in zip(a,b):near(x,y)
 xml=ET.fromstring(raw);ns={'s':'http://www.w3.org/2000/svg'}
 if kind!='histogram':
  line=xml.find('.//s:polyline',ns);pixel=[list(map(float,p.split(','))) for p in line.attrib['points'].split()]
  for (px,py),(x,y) in zip(pixel,expected):near(px,75+(float(x)-g['xmin'])*g['xScale']);near(py,295-float(y)*g['yScale'])
 else:
  bars=[e for e in xml.findall('.//s:rect',ns) if e.attrib.get('fill')=='#d9eeeb'];assert len(bars)==len(expected)
  for e,(left,right,height) in zip(bars,expected):near(e.attrib['x'],75+(float(left)-g['xmin'])*g['xScale']);near(e.attrib['width'],float(right-left)*g['xScale']);near(e.attrib['height'],height*g['yScale'])
assert (board,user,original)==(4,3,593)
result=dict(status='INDEPENDENT_EXACT_STATISTICS_AND_GRAPH_COORDINATES_PASS_NOT_TEACHER_APPROVAL',chapter=17,boardAdaptedMCQ=board,userScreenshotAdaptedCQ=user,originalParameterRecords=original,responseWitnesses=responses,answerGraphs=len(v['assets']),graphCoordinateAndHashChecks=len(v['assets']),limits='No independent teacher/narrative/marks-depth/syllabus approval. Screenshot badges not authenticated; grouped mean/median/mode are estimates; inclusive integer classes use true boundaries ±0.5.')
(ROOT/'docs/question-bank/ssc-math-ch17-independent-check.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print('PASS',result)
