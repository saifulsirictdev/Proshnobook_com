"""Read-only, separately implemented arithmetic/structure checks; not teacher approval."""
from pathlib import Path
from fractions import Fraction
from decimal import Decimal, ROUND_HALF_UP
from collections import Counter
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT/'content/question-bank/ssc/physics/chapter-1'
DOC = ROOT/'docs/question-bank/ssc-physics'
F = Fraction

def display(x):
    x = F(x)
    y = (Decimal(x.numerator)/Decimal(x.denominator)).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP)
    return format(y,'f').rstrip('0').rstrip('.') or '0'

def numbers(text):
    return [F(v) for v in re.findall(r'(?<![\w.])[+−-]?\d+(?:\.\d+)?', text.replace('−','-'))]

def contains(solution, values):
    actual = set(numbers(solution))
    for value in values:
        assert F(display(value)) in actual, (value, solution)

manifest = json.loads((OUT/'validation.json').read_text())
rows = []
for name in ['mcq-1','mcq-2','sq','cq']:
    p=OUT/f'{name}.json'; b=json.loads(p.read_text())
    assert hashlib.sha256(p.read_bytes()).hexdigest() == manifest['files'][p.name]['sha256']
    assert p.stat().st_size <= 750000 and 0 < len(b['items']) <= 200
    assert b['category']=='Class 9' and b['subject']=='পদার্থবিজ্ঞান'
    rows.extend(b['items'])
assert Counter(q['type'] for q in rows) == {'MCQ':250,'CQ':100,'SQ':100}
# Match metadata by unique exact text rather than assuming file-order equals author-order.
# Author-order: 250 MCQ, 100 SQ, 100 CQ.
meta=manifest['items']
assert len(meta)==450
assert len({re.sub(r'\s+',' ',q['text']).strip() for q in rows})==450
q_by_index={i+1:q for i,q in enumerate(rows)}
checked=0
for m in meta:
    q=q_by_index[m['index']]
    assert m['kind']==q['type']
    if q['type']=='MCQ':
        assert set(q['options'])==set('ABCD')
        assert len(set(q['options'].values()))==4
        assert q['correct'] in q['options']
    if 'calculation' not in m:
        continue
    c=m['calculation']; op=c['op']
    if op=='scale': v=F(c['value'])*F(c['factor'])
    elif op=='divide': v=F(c['a'])/F(c['b'])
    elif op=='difference': v=F(c['end'])-F(c['start'])
    elif op=='mean': v=sum(map(F,c['values']))/len(c['values'])
    elif op=='instrument': v=F(c['main'])+F(c['match'])*F(c['lc'])-F(c['zero'])
    elif op=='percent-reference': v=abs(F(c['observed'])/F(c['reference'])-1)*100
    else: raise AssertionError(op)
    assert v==F(c['expected'])
    if q['type']=='MCQ':
        assert q['options'][q['correct']]==display(v)+c['unit']
    else:
        contains(q['explanation'],[v])
    checked+=1
assert checked==250  # 200 numerical MCQ + 50 numerical SQ

cq_checked=0
for m in meta:
    if m['kind']!='CQ': continue
    q=q_by_index[m['index']]; family=m['family']; p=q['parts']
    assert [s['label'] for s in p]==list('কখগঘ')
    assert [s['marks'] for s in p]==[1,2,3,4]
    assert all(s['question'].strip() and s['solution'].strip() for s in p)
    a=numbers(q['text']); g=p[2]['solution']; gh=p[3]['solution']
    if family=='cq-vernier-positive':
        main,k,lc,z,b=a; d=main+k*lc-z
        contains(g,[d]); contains(gh,[d*b,z*b])
    elif family=='cq-vernier-negative':
        main,k,lc,z,ref=a; raw=main+k*lc
        contains(g,[raw-z]); contains(gh,[abs(raw-ref),abs(raw-z-ref)])
    elif family=='cq-vernier-design':
        N,prev,B,bprev,one,msd=a
        assert N-prev==B-bprev==one==1 and B==2*N
        contains(g,[prev/N,msd/N]); contains(gh,[msd/B])
    elif family.startswith('cq-screw-'):
        pitch,N,main,k,z,pi1,pi2=a; d=main+k*pitch/N-z
        contains(g,[pitch/N,d]); contains(gh,[pi1/pi2*d*d/4,pi1/pi2*(main+k*pitch/N)**2/4])
    elif family=='cq-pitch-comparison':
        turns,travel,div,pitchB,divB,needed=a
        contains(g,[travel/turns,travel/turns/div]); contains(gh,[pitchB/divB])
    elif family=='cq-cuboid-volume':
        l,b,h,wrong=a; contains(g,[l*b*h,l*b*h/F(10**6)]); contains(gh,[10000])
    elif family=='cq-cylinder':
        d,L,pi1,pi2=a; V=pi1/pi2*(d/2)**2*L
        contains(g,[V]); contains(gh,[4*V])
    elif family=='cq-wound-wire':
        N,L,delta=a; contains(g,[L/N,L/N*10]); contains(gh,[delta/N])
    elif family=='cq-paper-stack':
        N,H,delta=a; contains(g,[H/N,H/N/1000]); contains(gh,[delta/N,delta/H])
    elif family=='cq-displacement-density':
        mass,first,last=a; contains(g,[last-first,mass/(last-first)])
    elif family=='cq-block-density-si':
        l,b,h,mass=a; contains(g,[l*b*h,mass/(l*b*h)]); contains(gh,[2700])
    elif family=='cq-mean-systematic':
        x,y,z,bias=a; avg=(x+y+z)/3; contains(g,[avg,avg-bias]); contains(gh,[avg-bias])
    elif family=='cq-reference-error':
        ref,x,y,z=a; avg=(x+y+z)/3; contains(g,[avg,abs(avg-ref)/ref*100]); contains(gh,[abs(avg-ref)])
    elif family=='cq-cycle-time':
        N,t,delta,deltaSingle=a; contains(g,[t/N,delta/N]); contains(gh,[deltaSingle/(t/N),delta/t])
    elif family=='cq-ruler-endpoints':
        first,last,delta=a; contains(g,[last-first]); contains(gh,[2*delta])
    elif family=='cq-relative-comparison':
        x,y,delta=a; contains(g,[delta/x*100,delta/y*100]); contains(gh,[y/x])
    elif family=='cq-cylinder-reading-bias':
        mass,V,bias,bias2=a; contains(g,[mass/V]); contains(gh,[V+bias2,mass/(V+bias2)])
    elif family=='cq-units-dimensions':
        length,t=a; contains(g,[length/100/t]); contains(gh,[length/t,100])
    elif family=='cq-resolution-reporting':
        lc,x,y,z,lc2=a; contains(g,[(x+y+z)/3]); contains(gh,[lc2/lc])
    else: raise AssertionError(family)
    cq_checked+=1
assert cq_checked==100
assert len({m['family'] for m in meta if m['kind']=='CQ'})==20
assert all(not manifest[x] for x in ['teacherApproved','websiteImported','published','fullChapterRead','officialYearVerified'])
profile=json.loads((DOC/'mark-distribution.json').read_text())
assert hashlib.sha256((DOC/profile['source']).read_bytes()).hexdigest()==profile['sourceSha256']
assert [(s['offered'],s['answer'],s['marksEach']) for s in profile['sections']]==[(25,25,1),(7,4,10),(7,5,2)]
assert sum(s['answer']*s['marksEach'] for s in profile['sections'])==75
assert profile['theoryMarks']+profile['practicalMarks']==100
assert profile['totalTheoryMinutes']==180 and profile['officialYear'] is None
print('PASS: 450 structures; 250 numeric MCQ/SQ keys; 100 CQ calculations; 20 CQ families; screenshot digest and 75+25 profile. NOT teacher certification.')
