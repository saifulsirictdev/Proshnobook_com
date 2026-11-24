"""Independent read-only verification: no authoring imports, no DB/network.
Recomputes rational primary/secondary answers and checks geometry itself,
not only author-provided semantic metadata. Not teacher certification.
"""
from pathlib import Path
from fractions import Fraction as F
from decimal import Decimal,ROUND_HALF_UP
from collections import Counter
import hashlib,json,re,unicodedata,xml.etree.ElementTree as ET,html,math
ROOT=Path(__file__).resolve().parents[2]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def fmt(v):
 v=F(v);s=format((Decimal(v.numerator)/Decimal(v.denominator)).quantize(Decimal('.000001'),rounding=ROUND_HALF_UP),'f')
 return s.rstrip('0').rstrip('.') or '0'
def norm(s):return re.sub(r'\s+',' ',re.sub('[\u200B-\u200D\uFEFF]','',unicodedata.normalize('NFKC',s))).strip().lower()
def nums(s):return {F(x) for x in re.findall(r'(?<![\w.])[+-]?\d+(?:\.\d+)?',s.replace('−','-'))}
def compute(ch,f,p):
 if f=='count-frequency':r=p['N']/p['t'];s=2*p['N']
 elif f=='count-period':r=p['t']/p['N'];s=1/r
 elif f=='wavelength':r=p['speed']/p['frequency'];s=r/2
 elif f=='wave-speed':r=p['frequency']*p['lam'];s=2*p['lam']
 elif f=='wave-frequency':r=p['speed']/p['lam'];s=1/r
 elif f=='cycles':r=p['frequency']*p['t'];s=2*r
 elif f=='travel-distance':r=p['speed']*p['t'];s=2*p['t']
 elif f=='travel-time':r=p['distance']/p['speed'];s=r*10/11
 elif f in ['echo-distance','sonar-depth']:
  r=p['speed']*p['t']/2;s=2*p['t'] if f=='echo-distance' else 340*p['t']/2
 elif f=='echo-time':r=2*p['distance']/p['speed'];s=2*r
 elif f=='sound-temperature':r=p['base']+p['coefficient']*p['temp'];s=r/20
 elif f=='medium-change':r=p['lam1']/p['v1']*p['v2'];s=r/2
 elif f=='graph-wavelength':r=p['span']/2;s=20/r
 elif f=='graph-period':r=p['span']/2;s=1/r
 elif f=='graph-amplitude':r=p['H']/2;s=4*r
 elif f=='well':
  r=p['va']*p['t1']/2;s=r+p['vw']*(p['t2']-p['t1'])/2
  assert 0<p['t1']<p['t2'] and p['t2']-p['t1']<F(1,10)
 elif f=='moving-toward':
  r=2*p['D']/(p['speed']+p['u']);s=2*p['D']/(p['speed']-p['u'])
  assert 0<p['u']<p['speed'] and p['D']-p['u']*r>0 and s>r
 elif f=='moving-away':
  r=(p['speed']-p['u'])*p['t']/2;s=2*r/(p['speed']+p['u'])
  assert 0<p['u']<p['speed'] and s<p['t']
 elif f=='two-paths':
  r=p['L']/p['va']-p['L']/p['vs'];s=F(1,10)/(1/p['va']-1/p['vs'])
  assert 0<p['va']<p['vs']
 else:raise AssertionError(f)
 assert r>0 and s>0
 return r,s

def verify_geometry(a,root):
 ns={'s':'http://www.w3.org/2000/svg'};kind=a['kind'];data=(ROOT/a['file']).read_text()
 if kind in ['space-wave','time-wave','amplitude']:
  points=[tuple(map(float,p.split(','))) for p in root.find('.//s:polyline',ns).attrib['points'].split()]
  assert len(points)==181 and points[0]==(65,140) and points[-1]==(425,140)
  # Each intermediate point follows a sine with period 180 drawing units.
  for x,y in points:assert abs(y-(140-60*math.sin(2*math.pi*(x-65)/180)))<0.001
  assert points[0][0]+360==points[-1][0] # two periods, not 2.5
  assert a['semantic']['fullCycles']==2
  assert a['semantic']['horizontalAxis']==('time' if kind=='time-wave' else 'position')
  if kind=='amplitude':assert 'M445 80V200' in data and 'H = peak-to-trough' in data
 elif kind=='longitudinal':
  xs=[float(x) for x in re.findall(r'<path d="M([\d.]+) 95V200"',data)]
  assert len(xs)==21 and xs==a['semantic']['barPositions']
  centers=[sum(xs[i:i+5])/5 for i in [0,8,16]]
  assert centers==[100,240,380] and centers[1]-centers[0]==centers[2]-centers[1]==140
  assert 'M100 232H240' in data and a['semantic']['wavelengthSpan']==[100,240]
 elif kind in ['echo','echo-toward','echo-away']:
  assert 'M385 35V245' in data and 'M70 120H365' in data and 'M365 160H70' in data
  assert a['semantic']['observerMotion']=={'echo':'stationary','echo-toward':'toward','echo-away':'away'}[kind]
  if kind=='echo-toward':assert 'M70 55H145' in data
  if kind=='echo-away':assert 'M70 55H15' in data
 elif kind=='well':assert a['semantic']['echoPaths']==['A-B-A','A-B-C-B-A'] and 'B (surface)' in data
 elif kind=='sonar':assert a['semantic']['soundPath']=='out-and-back' and a['semantic']['medium']=='water'
 elif kind=='two-paths':assert a['semantic']['pathLengths']=='equal' and a['semantic']['reflectionsUsed'] is False
 else:raise AssertionError(kind)

for ch,counts,numeric_count,cqcount,assets_count in [(7,dict(MCQ=200,CQ=100,SQ=70),190,100,195)]:
 out=ROOT/f'content/question-bank/ssc/physics/chapter-{ch}';m=json.loads((out/'validation.json').read_text());rows=[]
 for name,info in m['files'].items():
  p=out/name;b=json.loads(p.read_text());assert sha(p)==info['sha256']
  assert 0<len(b['items'])==info['count']<=200 and p.stat().st_size<750000
  assert b['category']=='Class 9' and b['subject']=='পদার্থবিজ্ঞান' and b['topic']=='৭ম অধ্যায়: তরঙ্গ ও শব্দ'
  rows+=b['items']
 assert Counter(q['type'] for q in rows)==counts==m['requested']==m['actual']
 assert len({norm(q['text']) for q in rows})==len(rows)==len(m['items'])
 lookup={hashlib.sha256(q['text'].encode()).hexdigest():q for q in rows}
 assets={a['url']:a for a in m['assets']};used=set();nc=cc=0
 assert len(assets)==assets_count
 for a in assets.values():
  p=ROOT/a['file'];assert sha(p)==a['sha256']
  assert a['url']==f'https://proshnobook.com/question-bank/ssc-physics-ch{ch}-v1/'+p.name
  assert p.parent==ROOT/f'public/question-bank/ssc-physics-ch{ch}-v1'
  root=ET.fromstring(p.read_text());assert root.tag=='{http://www.w3.org/2000/svg}svg'
  assert not re.search(r'<(?:script|image|foreignObject)|\bon\w+\s*=|href\s*=|url\(',p.read_text(),re.I)
  for label in a['labels']:assert html.escape(label) in p.read_text()
  verify_geometry(a,root)
 for meta in m['items']:
  q=lookup[meta['stemSha256']];assert meta['kind']==q['type']
  urls=re.findall(r'!\[[^\]]*\]\((https:[^)]+)\)',q['text']);assert bool(urls)==meta['hasDiagram']
  # General conceptual definitions of graph types do not refer to a supplied figure.
  if meta['family']!='concept' and 'চিত্র' in q['text']:assert urls,q['text']
  for url in urls:assert url in assets;used.add(url)
  if meta['sourceHadFigure'] is True or meta.get('sourceFigureObserved'):assert urls and meta['sourceStructureReference']
  if q['type']=='MCQ':assert len({norm(o) for o in q['options'].values()})==4 and q['correct'] in q['options']
  if q['type']=='CQ':assert [x['marks'] for x in q['parts']]==[1,2,3,4] and [x['label'] for x in q['parts']]==list('কখগঘ')
  if 'calculation' not in meta:continue
  c=meta['calculation'];p={k:F(v) for k,v in c['params'].items()};given=nums(q['text'].split('\n![')[0]);r,s=compute(ch,meta['family'],p)
  assert all(F(fmt(v))==v for v in p.values()),('rounded input',meta)
  assert all(v in given for v in p.values()),('missing input',meta,q['text'])
  assert r==F(c['expected']),(meta,r)
  if q['type']=='MCQ':assert q['options'][q['correct']]==fmt(r)+c['unit'];nc+=1
  elif q['type']=='SQ':assert F(fmt(r)) in nums(q['explanation']);nc+=1
  else:
   assert s==F(c['secondary']),(meta,s)
   assert F(fmt(r)) in nums(q['parts'][2]['solution']) and F(fmt(s)) in nums(q['parts'][3]['solution']),(meta,q['parts'])
   if meta['family']=='echo-time':assert ('সময়-শর্ত পূরণ হয় না' in q['parts'][3]['solution'])==(s<F(1,10))
   cc+=1
 assert nc==numeric_count and cc==cqcount
 assert used==set(assets)
 for k in ['fullChapterRead','sourcePageVerified','teacherApproved','websiteImported','published','officialYearVerified','assetsDeployed']:assert m[k] is False
 review=(ROOT/f'docs/question-bank/ssc-physics/chapter-{ch}-review.html').read_text()
 assert review.count('<article ')==len(rows) and review.count('<figure>')==assets_count
 assert review.count('<svg ')==assets_count and '![' not in review
 print(f'PASS chapter {ch}: {len(rows)} distinct stems (numeric variants disclosed); {nc} MCQ/SQ and {cc} CQ primary+secondary calculations; {assets_count} safe SVGs with phase/path geometry checks. DRAFT; not teacher certification.')
