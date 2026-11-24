"""Independent, read-only recomputation of JSON artifacts, never imports authoring code.
Automated checks, not teacher certification or source completeness proof.
"""
from pathlib import Path
from fractions import Fraction as F
from decimal import Decimal,ROUND_HALF_UP
from collections import Counter
import hashlib,json,re,unicodedata,xml.etree.ElementTree as ET,html
ROOT=Path(__file__).resolve().parents[2]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def fmt(v):
 v=F(v);s=format((Decimal(v.numerator)/Decimal(v.denominator)).quantize(Decimal('.000001'),rounding=ROUND_HALF_UP),'f')
 return s.rstrip('0').rstrip('.') or '0'
def norm(s):return re.sub(r'\s+',' ',re.sub('[\u200B-\u200D\uFEFF]','',unicodedata.normalize('NFKC',s))).strip().lower()
def nums(s):return {F(x) for x in re.findall(r'(?<![\w.])[+-]?\d+(?:\.\d+)?',s.replace('−','-'))}
def compute(ch,f,p):
 if ch==5:
  if f=='pressure':r=p['force']/p['area'];s=2*r
  elif f=='force':r=p['pressure']*p['area'];s=3*r
  elif f=='area':r=p['force']/p['pressure'];s=2*r
  elif f=='density':r=p['mass']/p['volume'];s=r
  elif f=='layers':r=p['g']*(p['rho1']*p['h1']+p['rho2']*p['h2']);s=r+p['rho1']*p['g']*p['h1'];assert p['rho1']<p['rho2']
  elif f=='hydro':r=p['rho']*p['g']*p['h'];s=2*r
  elif f=='depth':r=p['pressure']/(p['rho']*p['g']);s=p['pressure']/(800*p['g'])
  elif f=='absolute':r=p['p0']+p['rho']*p['g']*p['h'];s=r-p['p0']+90000
  elif f=='hydraulic':r=p['force']*p['A2']/p['A1'];s=2*r;assert p['A2']>p['A1']
  elif f=='hydraulic-distance':r=p['A1']*p['s1']/p['A2'];s=3*r
  elif f=='buoyant':r=p['rho']*p['g']*p['volume'];s=r*800/p['rho']
  elif f=='apparent':r=p['mass']*p['g']-p['rho']*p['g']*p['volume'];s=r;assert r>0
  elif f=='float':r=p['rhob']/p['rho'];s=p['rhob']/1250;assert 0<r<1
  elif f=='stress':r=p['force']/p['area'];s=r/2
  elif f=='strain':r=p['dl']/p['L'];s=2*r
  elif f=='young':r=p['force']*p['L']/(p['area']*p['dl']);s=r
  else:raise AssertionError(f)
 else:
  if f=='c-f':r=p['C']*F(9,5)+32;s=r+18
  elif f=='f-c':r=(p['fahr']-32)*F(5,9);s=r+10
  elif f=='c-k':r=p['C']+F(27315,100);s=r+5
  elif f=='k-c':r=p['kel']-F(27315,100);s=r-10
  elif f=='delta-f':r=p['delta']*F(9,5);s=2*r
  elif f=='scale':r=(p['X']-p['low'])*100/(p['high']-p['low']);s=r+20*100/(p['high']-p['low'])
  elif f in ['linear','final-length']:
   change=p['alpha']*p['L']*p['delta'];r=change+(p['L'] if f=='final-length' else 0);s=r+change;assert p['alpha']*p['delta']<F(1,100)
  elif f=='area-exp':r=2*p['alpha']*p['area']*p['delta'];s=2*r
  elif f=='volume-exp':r=3*p['alpha']*p['volume']*p['delta'];s=2*r
  elif f=='liquid-exp':r=p['gamma']*p['volume']*p['delta'];s=r*F(3,4)
  elif f=='apparent-exp':r=(p['gamma']-3*p['alpha'])*p['volume']*p['delta'];s=p['gamma']*p['volume']*p['delta'];assert 0<r<s
  elif f=='heat':r=p['mass']*p['c']*p['delta'];s=2*r
  elif f=='specific':r=p['heat']/(p['mass']*p['delta']);s=r
  elif f=='capacity':r=p['mass']*p['c'];s=r*15
  elif f=='mix':r=(p['m1']*p['T1']+p['m2']*p['T2'])/(p['m1']+p['m2']);s=F(p['T1']+p['T2'],2);assert p['T2']<r<p['T1']
  elif f=='melt':r=p['mass']*p['L'];s=p['mass']/2
  elif f=='vapor':r=p['mass']*p['L'];s=r
  elif f=='ice-water':r=p['mass']*(p['L']+p['c']*p['target']);s=p['mass']*p['c']*p['target'];assert 0<p['target']<100
  elif f=='heating-time':r=p['mass']*p['c']*p['delta']/(p['power']*p['percent']/100);s=r*p['percent']/100;assert 0<p['percent']<=100
  else:raise AssertionError(f)
 return r,s
for ch,counts,numeric_count,cqcount,assets_count in [(5,dict(MCQ=200,CQ=80,SQ=50),180,80,195),(6,dict(MCQ=250,CQ=100,SQ=70),240,100,95)]:
 out=ROOT/f'content/question-bank/ssc/physics/chapter-{ch}';m=json.loads((out/'validation.json').read_text());rows=[]
 for name,info in m['files'].items():
  p=out/name;b=json.loads(p.read_text());assert sha(p)==info['sha256']
  assert 0<len(b['items'])==info['count']<=200 and p.stat().st_size<750000
  assert b['category']=='Class 9' and b['subject']=='পদার্থবিজ্ঞান'
  assert b['topic']=={5:'৫ম অধ্যায়: পদার্থের অবস্থা ও চাপ',6:'৬ষ্ঠ অধ্যায়: বস্তুর ওপর তাপের প্রভাব'}[ch]
  rows+=b['items']
 assert Counter(q['type'] for q in rows)==counts==m['requested']==m['actual']
 assert len({norm(q['text']) for q in rows})==len(rows)==len(m['items'])
 lookup={hashlib.sha256(q['text'].encode()).hexdigest():q for q in rows}
 assert len(lookup)==len(rows)
 assets={a['url']:a for a in m['assets']};used=set();nc=cc=0
 assert len(assets)==assets_count
 for a in assets.values():
  p=ROOT/a['file'];assert sha(p)==a['sha256']
  assert a['url']==f'https://proshnobook.com/question-bank/ssc-physics-ch{ch}-v1/'+p.name
  assert p.parent==ROOT/f'public/question-bank/ssc-physics-ch{ch}-v1'
  root=ET.fromstring(p.read_text());assert root.tag=='{http://www.w3.org/2000/svg}svg'
  assert not re.search(r'<(?:script|image|foreignObject)|\bon\w+\s*=|href\s*=|url\(',p.read_text(),re.I)
  for label in a['labels']:assert html.escape(label) in p.read_text()
 for meta in m['items']:
  q=lookup[meta['stemSha256']];assert meta['kind']==q['type']
  urls=re.findall(r'!\[[^\]]*\]\((https:[^)]+)\)',q['text']);assert bool(urls)==meta['hasDiagram']
  if 'চিত্র' in q['text']:assert urls,q['text']
  for url in urls:assert url in assets;used.add(url)
  if meta['sourceHadFigure'] is True:assert urls and meta['sourceStructureReference']
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
   cc+=1
 assert nc==numeric_count and cc==cqcount
 assert used==set(assets)
 for k in ['fullChapterRead','sourcePageVerified','teacherApproved','websiteImported','published','officialYearVerified','assetsDeployed']:assert m[k] is False
 review=(ROOT/f'docs/question-bank/ssc-physics/chapter-{ch}-review.html').read_text()
 assert review.count('<article ')==len(rows) and review.count('<figure>')==assets_count
 assert review.count('<svg ')==assets_count and '![' not in review
 print(f'PASS chapter {ch}: {len(rows)} unique structures, {nc} MCQ/SQ calculations, {cc} CQ primary+secondary, {assets_count} inline/local diagrams; DRAFT, not teacher certification.')
