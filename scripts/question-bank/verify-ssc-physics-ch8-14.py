"""Read-only independent recomputation of all remaining chapter JSON artifacts.
Does NOT import authoring models or eval supplied formulas. Not teacher certification.
"""
from pathlib import Path
from fractions import Fraction as F
from decimal import Decimal,ROUND_HALF_UP
from collections import Counter
import json,hashlib,re,math,unicodedata,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[2]
def fmt(v):
 v=F(v);return format((Decimal(v.numerator)/Decimal(v.denominator)).quantize(Decimal('.000001'),rounding=ROUND_HALF_UP),'f').rstrip('0').rstrip('.') or '0'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def norm(s):return re.sub(r'\s+',' ',unicodedata.normalize('NFKC',s)).strip().lower()
def compute(ch,k,p):
 if ch==8:
  if k=='reflect-r':return p['angle']
  if k=='surface-angle':return 90-p['angle']
  if k in ['ray-angle','rotate-mirror']:return 2*p['angle']
  if k=='deviation':return 180-2*p['angle']
  if k in ['plane-separation','object-shift','mirror-shift']:return 2*p['d']
  if k=='plane-depth':return p['d']/2
  if k=='focal-radius':return p['R']/2
  if k=='radius-focal':return 2*p['fmag']
  if k.startswith('concave-design-'):
   ratio=int(k.rsplit('-',1)[1]);return p['fmag']/(1-F(1,ratio))
  if k.startswith(('concave-','convex-')):
   v=1/(1/p['f']-1/p['u'])
   if k.endswith('-v'):return v
   if k.endswith('-magnification'):return abs(v/p['u'])
   if k.endswith('-height'):return abs(v*p['h']/p['u'])
   if k.endswith('-separation'):return abs(p['u']-v)
 elif ch==9:
  if k=='index-speed':return 3/p['speed']
  if k=='speed-index':return 3/p['n']
  if k in ['relative-index','speed-ratio']:return p['n2']/p['n1']
  if k=='snell-sin':return p['n1']/p['n2']*p['sini']
  if k=='snell-index':return p['sini']/p['sinr']
  if k=='critical-sin':return 1/p['n']
  if k=='critical-two':return p['nclad']/p['ncore']
  if k=='wavelength-medium':return p['L']/p['n']
  if k=='wavelength-ratio':return p['L']*p['n1']/p['n2']
  if k=='apparent-depth':return p['d']/p['n']
  if k=='real-depth':return p['a']*p['n']
  if k.startswith('power-'):return 100/p['fcm']
  if k.startswith('focal-power-'):return 100/p['P']
  if k.startswith(('converge-','diverge-')):
   v=1/(1/p['f']-1/p['u'])
   if k.endswith('-v'):return v
   if k.endswith('-mag'):return abs(v/p['u'])
   if k.endswith('-height'):return abs(v/p['u']*p['h'])
  if k=='contact-power':return p['P1']+p['P2']
  if k=='contact-focal':return 100/(p['P1']+p['P2'])
 elif ch==10:
  if k in ['coulomb-force','force-double-distance','force-half-distance','dielectric-force']:
   r=p['r']*({'force-double-distance':2,'force-half-distance':F(1,2)}.get(k,1));K=2 if k=='dielectric-force' else 1
   return F(9,1000)*abs(p['q1']*p['q2'])/(r*r*K)
  if k=='field-point':return 9000*abs(p['Q'])/p['r']**2
  if k=='potential-point':return 9000*p['Q']/p['r']
  if k.startswith('field-force-'):return abs(p['q'])*p['E']/1000000
  if k=='field-measure':return p['force']/p['q']*1000
  if k=='work-potential':return p['q']*p['V']
  if k=='potential-work':return p['W']/p['q']
  if k=='charge-work':return p['W']/p['V']
  if k=='cap-charge':return p['C']*p['V']
  if k=='cap-energy':return p['C']*p['V']**2/2
  if k=='capacitance':return p['Q']/p['V']
  if k=='cap-voltage':return p['Q']/p['C']
  if k=='uniform-voltage':return p['E']*p['d']
  if k=='uniform-field':return p['V']/(p['d']/100)
  if k=='electron-count':return p['q']/F(8,5)
  if k=='equal-sharing':return (p['q1']+p['q2'])/2
  if k=='net-charge':return p['q1']+p['q2']
  if k=='midpoint-potential':return 2*9000*p['q']/(p['L']/2)
  if k=='outside-potential':return 9000*p['q']*(1/p['L']+1/(2*p['L']))
  if k=='identical-cap-parallel':return 2*p['C']*p['V']
 elif ch==11:
  if k=='current':return p['Q']/p['t']
  if k=='charge':return p['I']*p['t']
  if k=='time':return p['Q']/p['I']
  if k=='ohm-I':return p['V']/p['R']
  if k=='ohm-V':return p['I']*p['R']
  if k=='ohm-R':return p['V']/p['I']
  if k=='series-R':return p['R1']+p['R2']
  if k=='series-I':return p['V']/(p['R1']+p['R2'])
  if k=='divider':return p['V']*p['R2']/(p['R1']+p['R2'])
  if k.startswith('parallel-'):
   rp=1/(1/p['R2']+1/p['R3'])
   if k=='parallel-R':return rp
   if k=='parallel-I':return p['V']/(p['R1']+rp)
   return p['V']/(p['R1']+rp)*rp
  if k.startswith('mixed-'):
   r=p['R1']+p['R2']+1/(1/p['R3']+1/p['R4']);return r if k=='mixed-R' else p['V']/r
  if k=='power-VI':return p['V']*p['I']
  if k=='power-I2R':return p['I']**2*p['R']
  if k=='power-V2R':return p['V']**2/p['R']
  if k=='energy':return p['P']*p['t']
  if k=='kwh':return p['P']/1000*p['h']*p['days']
  if k=='bill':return p['E']*p['rate']
  if k=='joule-heat':return p['I']**2*p['R']*p['t']
  if k=='internal-current':return p['E']/(p['r']+p['R'])
  if k=='terminal-voltage':return p['E']/(p['r']+p['R'])*p['R']
  if k=='rated-current':return p['P']/p['V']
 elif ch==12:
  if k=='secondary-V':return p['Vp']/p['Np']*p['Ns']
  if k=='primary-V':return p['Vs']/p['Ns']*p['Np']
  if k=='secondary-turns':return p['Vs']/p['Vp']*p['Np']
  if k=='primary-turns':return p['Vp']/p['Vs']*p['Ns']
  if k=='ratio':return p['Vs']/p['Vp']
  if k=='turn-difference':return abs(p['Ns']-p['Np'])
  if k=='secondary-I':return p['Ip']*p['Np']/p['Ns']
  if k=='primary-I':return p['Is']*p['Ns']/p['Np']
  if k=='power-input':return p['Vp']*p['Ip']
  if k=='ideal-output-power':return p['Pin']
  if k in ['efficiency','motor-power']:return p['Pout']/p['Pin']*100
  if k=='loss':return p['Pin']-p['Pout']
  if k=='efficient-output':return p['Pin']*p['eta']/100
  if k=='efficient-input':return p['Pout']/p['eta']*100
  if k=='secondary-total-turns':return p['total']/(1+p['ratio'])*p['ratio']
  if k=='primary-total-turns':return p['total']/(1+p['ratio'])
  if k=='line-I':return p['P']/p['V']
  if k=='line-loss':return p['I']**2*p['R']
  if k=='stepup-loss':return p['P']**2/p['V']**2*p['R']
  if k=='motor-force':return p['B']*p['I']*p['L']
  if k=='motor-current':return p['force']/p['B']/p['L']
  if k=='motor-length':return p['force']/p['B']/p['I']
  if k=='induced-emf':return p['dphi']/p['t']*p['N']
 elif ch==13:
  if k=='neutrons':return p['A']-p['Z']
  if k=='mass-number':return p['Z']+p['N']
  if k=='neutral-electrons':return p['Z']
  if k=='cation-electrons':return p['Z']-p['lost']
  if k=='anion-electrons':return p['Z']+p['gained']
  if k=='alpha-mass':return p['A']-4
  if k=='alpha-charge':return p['Z']-2
  if k=='beta-charge':return p['Z']+1
  if k=='half-life-remain':return p['N0']/2**int(p['h'])
  if k=='half-life-decayed':return p['N0']-p['N0']/2**int(p['h'])
  if k=='half-life-time':return p['T']*p['hcount']
  if k=='activity':return p['events']/p['t']
  if k=='transistor-Ic':return p['beta']*p['Ib']
  if k=='transistor-Ib':return p['Ic']/p['beta']
  if k=='transistor-beta':return p['Ic']/p['Ib']
  if k=='transistor-Ie':return p['Ic']+p['Ib']
  if k=='diode-current':return p['V']/p['R']
  if k=='diode-load-voltage':return p['V']-p['drop']
  if k=='diode-resistor-current':return (p['V']-p['drop'])/p['R']
  if k=='half-wave-period':return 1/p['f']
  if k=='radio-wavelength':return 300/p['f']
  if k=='radio-frequency':return 300/p['L']
  if k=='amplifier-gain':return p['Vout']/p['Vin']
  if k=='amplifier-output':return p['Vin']*p['G']
 elif ch==14:
  if k=='us-depth':return p['t']*p['v']/2000
  if k=='us-time':return p['d']*2000/p['v']
  if k=='us-speed':return p['d']*2000/p['t']
  if k=='us-wavelength':return p['v']/p['f']/1000
  if k=='us-frequency':return p['v']/p['L']/1000
  if k=='us-separation':return p['dt']*p['v']/2000
  if k=='us-pulse-length':return p['N']*p['L']
  if k=='us-resolution-model':return p['N']*p['L']/2
  if k=='xray-frequency':return F(3,10)/p['L']
  if k=='xray-wavelength':return F(3,10)/p['f']
  if k=='xray-energy':return 1240/p['L']
  if k=='xray-energy-wavelength':return 1240/p['E']
  if k=='tube-energy':return p['V']
  if k=='tube-cutoff':return 1240/(1000*p['V'])
  if k=='tube-power':return p['V']*p['I']
  if k=='xray-efficiency':return p['Px']/p['Pin']*100
  if k=='ecg-rate':return 60/p['T']
  if k=='ecg-period':return 60/p['rate']
  if k=='ecg-calibration':return p['d']/p['speed']
  if k=='ecg-paper-rate':return 60*p['speed']/p['d']
  if k=='tracer-remain':return p['N0']/2**int(p['h'])
  if k=='tracer-activity':return (p['C']-p['B'])/p['t']
  if k=='absorbed-dose':return p['E']/p['m']
  if k=='absorbed-energy':return p['D']*p['m']
 raise AssertionError((ch,k,p))

def geometry(a):
 s=a['semantic'];k=a['kind'];text=(ROOT/a['file']).read_text()
 if k in ['concave','convex','lens-positive','lens-negative']:
  u,f,v,m=s['objectDistance'],s['focalLength'],s['imageDistance'],s['magnification']
  assert abs(1/f-1/u-1/v)<1e-9 and abs(m+v/u)<1e-9
  xo,yo=s['objectTip'];xi,yi=s['imageTip'];o=s['origin'];scale=s['scale'];assert abs(xo-(o-u*scale))<1e-8
  assert abs(xi-(o+(-v if s['mirror'] else v)*scale))<1e-8
  assert abs((165-yi)/(165-yo)-m)<1e-8
  # The two drawn paraxial rays must hit the computed intersection, not a generic stock image.
  assert f'L{xi:.3f} {yi:.3f}' in text
  if v<0:assert 'stroke-dasharray="5 4"' in text
 elif k=='reflection':assert s['incidence']==s['reflection'] and 0<s['incidence']<90
 elif k=='refraction':assert abs(s['n1']*s['sinIncidence']-s['n2']*s['sinRefraction'])<1e-9
 elif k=='critical':assert s['higherIndex']>s['lowerIndex'] and s['incidence']>s['criticalAngle'] and abs(math.sin(s['criticalAngle'])-s['lowerIndex']/s['higherIndex'])<1e-9
 elif k=='mixed':assert s['topology']=='R1+R2+(R3||R4)'
 elif k=='parallel':assert s['topology']=='R1+(R2||R3)'
 elif k=='series':assert s['topology']=='R1+R2'
 elif k=='transformer':assert s['primarySupply']=='AC' and s['commonCore']
 elif k=='rectifier':
  assert s['inputCycles']==2 and s['rectification']=='positive half-wave' and s['source']=='AC'
  assert 'M60 145a25 25' in text and 'M310 115H360V145H310Z' in text # AC source and closed resistor body, no DC battery substitution.
 elif k=='xray':assert s['electronDirection']=='cathode-to-target' and s['waveCycles']==2 and s['wavelengthSpan']==[80,160]
 elif k=='ultrasound':assert s['soundPath']=='out-and-back'
 elif k=='ecg':assert s['qualitativeOnly'] is True and s['Rpeaks']==2

reports=[]
for ch,assetcount in [(8,225),(9,150),(10,180),(11,220),(12,365),(13,200),(14,380)]:
 out=ROOT/f'content/question-bank/ssc/physics/chapter-{ch}';m=json.loads((out/'validation.json').read_text());rows=[]
 for fn,meta in m['files'].items():
  p=out/fn;d=json.loads(p.read_text());assert sha(p)==meta['sha256'] and len(d['items'])==meta['count']<=200 and p.stat().st_size<750000;rows+=d['items']
  assert d['category']=='Class 9' and d['subject']=='পদার্থবিজ্ঞান' and d['topic'].startswith(str(ch).translate(str.maketrans('0123456789','০১২৩৪৫৬৭৮৯')))
 assert Counter(q['type'] for q in rows)==dict(MCQ=250,CQ=120,SQ=100)==m['actual']==m['requested']
 assert len({norm(q['text']) for q in rows})==470
 lookup={hashlib.sha256(q['text'].encode()).hexdigest():q for q in rows};assets={a['url']:a for a in m['assets']};seen=set();counts=Counter()
 assert len(assets)==assetcount
 for a in assets.values():
  p=ROOT/a['file'];assert sha(p)==a['sha256'] and p.parent==ROOT/f'public/question-bank/ssc-physics-ch{ch}-v1'
  assert a['url']==f'https://proshnobook.com/question-bank/ssc-physics-ch{ch}-v1/{p.name}'
  text=p.read_text();assert ET.fromstring(text).tag=='{http://www.w3.org/2000/svg}svg'
  assert not re.search(r'<(?:script|image|foreignObject)|\bon\w+\s*=|href\s*=|url\(',text,re.I)
  geometry(a)
 for meta in m['items']:
  q=lookup[meta['stemSha256']];urls=re.findall(r'!\[[^\]]*\]\((https:[^)]+)\)',q['text']);assert bool(urls)==meta['hasDiagram'];seen.update(urls)
  assert all(url in assets for url in urls)
  if meta['family']!='concept' and 'চিত্র' in q['text']:assert urls
  if meta.get('sourceFigureObserved'):assert urls and meta.get('sourceStructureReference')
  if q['type']=='MCQ':assert len({norm(s) for s in q['options'].values()})==4 and q['correct'] in q['options']
  if q['type']=='CQ':assert [x['marks'] for x in q['parts']]==[1,2,3,4]
  if 'calculation' not in meta:continue
  c=meta['calculation'];p={k:F(v) for k,v in c['params'].items()};r=compute(ch,c['formulaId'],p);assert r==F(c['expected']),(ch,meta,r)
  # Inputs must be explicit in the question; preserve 4/3 exactly rather than silently rounding it.
  for key,val in p.items():
   rep=fmt(val) if F(fmt(val))==val else str(val)
   assert rep in q['text'],(ch,key,rep,q['text'])
  if q['type']=='MCQ':assert q['options'][q['correct']]==fmt(r)+c['unit']
  elif q['type']=='SQ':assert fmt(r)+c['unit'] in q['explanation']
  else:
   cp={k:F(v) for k,v in c['secondaryParams'].items()};assert sum(p[k]!=cp[k] for k in p)==1
   s=compute(ch,c['formulaId'],cp);assert s==F(c['secondary'])
   assert fmt(r)+c['unit'] in q['parts'][2]['solution'] and fmt(s)+c['unit'] in q['parts'][3]['solution']
   for key,val in cp.items():assert (fmt(val) if F(fmt(val))==val else str(val)) in q['parts'][3]['solution']
  counts[q['type']]+=1
 assert dict(counts)==dict(MCQ=240,CQ=120,SQ=80) and seen==set(assets)
 for flag in ['published','websiteImported','teacherApproved','assetsDeployed','sourcePageVerified','fullChapterRead','officialYearVerified']:assert m[flag] is False
 review=(ROOT/f'docs/question-bank/ssc-physics/chapter-{ch}-review.html').read_text();assert review.count('<article ')==470 and review.count('<svg ')==assetcount and '![' not in review
 reports.append(dict(chapter=ch,total=470,numericChecks=dict(counts),diagrams=assetcount))
 print(f'PASS chapter {ch}: 470 drafts, {dict(counts)} independent numeric checks, CQ changed condition recomputed; {assetcount} local/inline SVGs. Not teacher certification.')
assert sum(r['total'] for r in reports)==3290 and sum(r['diagrams'] for r in reports)==1720
