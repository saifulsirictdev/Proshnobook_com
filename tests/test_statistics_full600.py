"""Independent arithmetic, lineage and chart geometry checks. No teacher certification."""
import collections, hashlib, json, re, statistics, unittest, xml.etree.ElementTree as ET
from fractions import Fraction as F
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];BASE=ROOT/'content/question-bank/ssc/math/chapter-17';OUT=BASE/'restart-r1/full600'
read=lambda p:json.loads(p.read_text())
manifest=read(OUT/'manifest.json');evidence=read(OUT/'checks.json');emap={e['id']:e for e in evidence}
bank={k:[] for k in ('MCQ','CQ','SQ')}
for f in manifest['files']:bank[f['kind']]+=read(ROOT/f['file'])['items']
def digest(q):return hashlib.sha256(json.dumps(q,ensure_ascii=False,sort_keys=True).encode()).hexdigest()
def number(v):
 v=F(v);return str(v.numerator) if v.denominator==1 else str(float(v)) if v.denominator in (2,4,5,10) else str(v)
class Full600(unittest.TestCase):
 def test_counts_mapping_and_no_unchanged_old_payload(self):
  self.assertEqual({k:len(v) for k,v in bank.items()},{'MCQ':300,'CQ':200,'SQ':100});self.assertEqual(len(emap),600)
  slots=set()
  for kind,items in bank.items():
   for i,q in enumerate(items,1):
    e=emap[f'{kind}-{i:03}'];old=e['oldSlot'];key=(old['file'],old['item']);self.assertNotIn(key,slots);slots.add(key)
    original=read(BASE/old['file'])['items'][old['item']-1]
    self.assertEqual(digest(original),old['digest']);self.assertEqual(digest(q),e['newDigest']);self.assertNotEqual(digest(q),old['digest']);self.assertFalse(e['approved'])
  for f in read(BASE/'targets-v1-manifest.json')['files']:self.assertEqual(hashlib.sha256((BASE/f['file']).read_bytes()).hexdigest(),f['sha256'])
  for f in manifest['files']:self.assertEqual(hashlib.sha256((ROOT/f['file']).read_bytes()).hexdigest(),f['sha256'])
 def test_grouped_exact_arithmetic_for_all_modelled_rows(self):
  count=0
  for e in evidence:
   d=e.get('grouped') or e.get('model',{}).get('grouped')
   if not d and e['id'].startswith('CQ-') and 'lo' in e.get('model',{}):d=e['model']
   if not d:continue
   count+=1;lo,h,fs=d['lo'],d['h'],d['f'];N=sum(fs);starts=list(range(lo,lo+len(fs)*h,h));mids=[F(2*x+h-1,2) for x in starts];bounds=[F(2*lo-1,2)+i*h for i in range(len(fs)+1)]
   self.assertEqual(N,d['N']);self.assertEqual(starts,d['starts']);self.assertEqual(mids,list(map(F,d['mids'])));self.assertEqual(bounds,list(map(F,d['bounds'])));self.assertEqual(F(d['mean']),sum(x*f for x,f in zip(mids,fs))/N)
   cf=[];total=0
   for f in fs:total+=f;cf.append(total)
   self.assertEqual(d['cf'],cf);j=next(i for i,c in enumerate(cf) if 2*c>=N);prev=cf[j-1] if j else 0
   self.assertEqual(F(d['median']),bounds[j]+(F(N,2)-prev)*h/fs[j])
   mx=max(fs)
   if fs.count(mx)==1:
    j=fs.index(mx);left=fs[j-1] if j else 0;right=fs[j+1] if j+1<len(fs) else 0;self.assertEqual(F(d['mode']),bounds[j]+F(mx-left,2*mx-left-right)*h)
   else:self.assertIsNone(d['mode'])
   raw=e.get('raw') or e.get('model',{}).get('raw')
   if raw:self.assertEqual([sum(a<=x<=a+h-1 for x in raw) for a in starts],fs)
  self.assertGreater(count,450)
 def test_290_new_mcq_independent_answer_calculation(self):
  for i,q in enumerate(bank['MCQ'][10:],11):
   e=emap[f'MCQ-{i:03}'];f=e['planIndex'];t=e['variant'];d=e['grouped'];lo,h,fs,N=d['lo'],d['h'],d['f'],d['N'];mid=list(map(F,d['mids']));a=lo+2+t;raw=[a,a+2,a+4,a+6,a+8]
   if f==0:ans=mid[0]
   elif f==1:ans=F(2*lo-1,2)
   elif f==2:ans=F(2*(lo+h)-1,2)
   elif f==3:ans=h
   elif f==4:ans=sum(fs[:3])
   elif f==5:ans=sum(fs[:2])
   elif f==6:ans=fs[-1]
   elif f in (7,8):
    j=d['medianIndex'] if f==7 else fs.index(max(fs));ans=f'{lo+j*h}–{lo+(j+1)*h-1}'
   elif f==9:ans=f'({number(mid[1])}, {fs[1]})'
   elif f==10:ans=sum(fs[:2])
   elif f==11:ans=N-fs[0]
   elif f==12:ans=F(fs[1],N)
   elif f==13:ans=mid[1]*fs[1]
   elif f==14:ans=F(mid[3]-mid[2],h)
   elif f==15:ans=-(t+2)*(t+4)
   elif f==16:ans=F(20+t)+F(5*2*(t+1),10)
   elif f==17:ans=F(2*lo-1,2)+F(h,2)
   elif f==18:ans=20+2*t-(7+t)
   elif f==19:ans=20+2*t-(9+t)
   elif f==20:ans=F(sum(raw),len(raw))
   elif f==21:ans=F(statistics.median([a+9,a,a+2,a+4,a+6,a+11]))
   elif f==22:ans=statistics.mode([a,a+2,a+2,a+4,a+2,a+6])
   elif f==23:ans=max([a+2,a+5,a,a+9])-min([a+2,a+5,a,a+9])
   elif f==24:ans=F(10*(20+t)+20*(32+t),30)
   elif f==25:ans=2*(15+t)+(2+t)
   elif f==26:ans=(30+t)-(4+t)-(7+t)
   elif f==27:ans=F((4+t)+2*(6+t)+(8+t),4)
   else:ans=F((5+t)*(20+t)-(45+t)+(35+t),5+t)
   selected=q['options'][q['correct']];self.assertEqual(selected,ans if isinstance(ans,str) else number(ans),(i,f))
   self.assertEqual(len(set(q['options'].values())),4);self.assertEqual(selected,e['expectedAnswer']);self.assertEqual(e['optionReasons'][q['correct']],'সঠিক।');self.assertTrue(all(e['optionReasons'].values()));self.assertLessEqual(e['estimatedSeconds'],75);self.assertFalse(e['timingMeasured'])
 def test_cq_raw_combined_and_frequency_answers_independently(self):
  for i,q in enumerate(bank['CQ'][10:],11):
   e=emap[f'CQ-{i:03}'];m=e['model'];text=' '.join(p['solution'] for p in q['parts'])
   if 'grouped' in m:
    d=m['grouped'];fs=d['f'];mid=list(map(F,d['mids']));N=sum(fs);mean=sum(x*f for x,f in zip(mid,fs))/N
    if m['mainMethod'] in ('direct','shortcut'):self.assertIn(f'{float(mean):.2f}',text)
    v=m['variant']
    if v==5:self.assertIn(number(sum(x*f for x,f in zip(mid,reversed(fs)))/N-mean),text)
    if v==6:self.assertIn(number(F(sum(x*f for x,f in zip(d['starts'],fs)),N)),text)
    if v==9:self.assertIn(number(F(d['h'],N)),text)
    if v==10:self.assertIn(number(F(sum(x*f for x,f in zip(d['starts'],fs)),N)),text)
   elif 'raw' in m:
    a=m['raw'];mean=F(sum(a),len(a));median=F(statistics.median(a));self.assertEqual(mean,F(m['rawMean']));self.assertEqual(median,F(m['rawMedian']))
    if m['variant']==1:
     na=a.copy();na[na.index(max(a))]+=10;self.assertEqual(statistics.median(a),statistics.median(na));self.assertIn(number(F(sum(na),len(na))),text)
    if m['variant']==2:
     na=a.copy();na.remove(min(a));self.assertIn(number(F(sum(na),len(na))),text)
   elif 'combined' in m:
    a=m['combined'];N=a['n1']+a['n2'];total=a['n1']*a['m1']+a['n2']*a['m2'];self.assertEqual(F(m['mean']),F(total,N));new=F(m['newSecondMean']);self.assertEqual((a['n1']*a['m1']+a['n2']*new)/N,F(m['targetMean']));self.assertIn(number(new),text)
   elif 'weighted' in m:
    a=m['weighted'];N=sum(a['weights']);total=sum(x*f for x,f in zip(a['values'],a['weights']));self.assertEqual(F(total,N),F(m['mean']));self.assertEqual(F(total-a['values'][0]+a['values'][-1],N),F(m['correctedMean']))
 def test_57_svg_geometry_against_exact_coordinates(self):
  self.assertEqual(len(manifest['graphs']),57)
  for g in manifest['graphs']:
   data=(ROOT/g['file']).read_bytes();self.assertEqual(hashlib.sha256(data).hexdigest(),g['sha256']);self.assertNotRegex(data.decode(),r'<script|foreignObject|href=|\bon\w+=')
   owner=next(e for e in evidence if any(z['file']==g['file'] for z in e.get('graphs',[])))
   d=owner['model'].get('grouped') or owner['model'];fs=d['f'];lo,h=d['lo'],d['h'];bounds=[F(2*lo-1,2)+i*h for i in range(len(fs)+1)];mids=[bounds[i]+F(h,2) for i in range(len(fs))];cf=[sum(fs[:i+1]) for i in range(len(fs))]
   expected={'less':list(zip(bounds,[0,*cf])),'more':list(zip(bounds,[sum(fs),*[sum(fs)-x for x in cf]])),'polygon':[(mids[0]-h,0),*zip(mids,fs),(mids[-1]+h,0)],'histogram':list(zip(bounds,bounds[1:],fs))}[g['kind']]
   actual=[tuple(F(x) if j<2 or g['kind']!='histogram' else x for j,x in enumerate(p)) for p in g['points']]
   self.assertEqual(actual,expected)
   el=ET.fromstring(data);points=g['points'];xy=lambda x,y:(85+(float(F(x))-g['xmin'])*560/(g['xmax']-g['xmin']),290-float(y)*230/g['ymax'])
   if g['kind']=='histogram':
    bars=el.findall('.//{*}rect')[1:];self.assertEqual(len(bars),len(points))
    for bar,(a,z,y) in zip(bars,points):
     px,py=xy(a,y);qx,_=xy(z,0)
     for key,val in [('x',px),('y',py),('width',qx-px),('height',290-py)]:self.assertAlmostEqual(float(bar.attrib[key]),val,places=3)
   else:
    p=el.find('.//{*}polyline');actual=[[float(z) for z in point.split(',')] for point in p.attrib['points'].split()];self.assertEqual(len(points),len(actual))
    for dataxy,pixel in zip(points,actual):
     for got,want in zip(pixel,xy(*dataxy)):self.assertAlmostEqual(got,want,places=3)
    ys=[p[1] for p in points]
    if g['kind']=='less':self.assertEqual(ys,sorted(ys));self.assertEqual(ys[0],0)
    if g['kind']=='more':self.assertEqual(ys,sorted(ys,reverse=True));self.assertEqual(ys[-1],0)
    if g['kind']=='polygon':self.assertEqual((ys[0],ys[-1]),(0,0))
 def test_adequate_work_not_only_total_for_four_marks(self):
  for q in bank['CQ']:
   self.assertEqual([p['marks'] for p in q['parts']],[2,4,4])
   for p in q['parts'][1:]:
    self.assertGreater(len(p['solution']),150)
    self.assertNotRegex(p['question'],r'^মোট পর্যবেক্ষণ কত|^শ্রেণিসংখ্যা কত|^প্রচুরক শ্রেণি কোন')
  for q in bank['SQ']:
   self.assertLess(len(q['text']),250);self.assertNotIn('| ---',q['text']);self.assertNotIn('অঙ্কন কর',q['text']);self.assertNotRegex(q['text'],'আনুমানিক গড় নির্ণয়|আনুমানিক মধ্যক নির্ণয়');self.assertLess(len(q['explanation']),350)
 def test_90_short_answers_contain_independent_expected_results(self):
  for i,q in enumerate(bank['SQ'][10:],11):
   e=emap[f'SQ-{i:03}'];f=e['planIndex'];t=e['variant'];d=e['grouped'];lo,h,N,fs=d['lo'],d['h'],d['N'],d['f'];a=lo+t;A=15+4*t;delta=3+t
   answers=[F(2*lo+h-1,2),F(2*lo-1,2),h,fs[1],fs[1],a+1,a+4,a+3,a+2,9,F(fs[0],N),2,-2*a,A,A+delta,A*delta,12,F(2*lo+h-1,2),F(2*lo+h-1,2)-h,N,N,N-fs[0]-fs[1],fs[1],F(fs[1])*(F(2*(lo+h)+h-1,2)),A,a*A,A+delta,A-delta,16,A-2]
   self.assertIn(number(answers[f]),q['explanation'],(i,f))
 def test_status_no_silent_approval_or_claim_of_unique_concepts(self):
  self.assertEqual(manifest['remaining'],0);self.assertEqual(manifest['approved'],0);self.assertEqual(manifest['published'],0);self.assertFalse(manifest['teacherCertified']);self.assertFalse(manifest['assetsDeployed']);self.assertTrue(any('share skill templates' in x for x in manifest['limitations']))
  self.assertEqual(sum(manifest['families'].values()),600)
if __name__=='__main__':unittest.main()
