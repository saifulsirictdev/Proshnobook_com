"""Independent read-only arithmetic/contract verifier for motion drafts.
Recomputes from inputs, checks actual keyed options and CQ solution numbers;
not an independent teacher review, source alignment or publication receipt.
"""
from pathlib import Path
from fractions import Fraction as F
from decimal import Decimal, ROUND_HALF_UP
from collections import Counter
import hashlib
import json
import math
import re
import unicodedata

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'content/question-bank/ssc/physics/chapter-2'

def fmt(x):
    x=F(x)
    d=(Decimal(x.numerator)/Decimal(x.denominator)).quantize(Decimal('.000001'),rounding=ROUND_HALF_UP)
    return format(d,'f').rstrip('0').rstrip('.') or '0'

def nums(s):return set(F(x) for x in re.findall(r'(?<![\w.])[+-]?\d+(?:\.\d+)?',s.replace('−','-')))
def contains(s,vals):
    actual=nums(s)
    for x in vals:assert F(fmt(x)) in actual,(x,s)
def norm(s):return re.sub(r'\s+',' ',re.sub('[\u200B-\u200D\uFEFF]','',unicodedata.normalize('NFKC',s))).strip().lower()
def sqrt(x):
    x=F(x);a=math.isqrt(x.numerator);b=math.isqrt(x.denominator)
    assert a*a==x.numerator and b*b==x.denominator
    return F(a,b)

v=json.loads((OUT/'validation.json').read_text())
# Explicit same canonical order as author indices: MCQ, SQ, CQ; no DB involved.
rows=[]
for filename in ['mcq-1.json','mcq-2.json','sq.json','cq.json']:
    p=OUT/filename;b=json.loads(p.read_text());rows.extend(b['items'])
    assert b['topic']=='২য় অধ্যায়: গতি' and b['category']=='Class 9' and b['subject']=='পদার্থবিজ্ঞান'
    assert len(b['items'])<=200 and p.stat().st_size<750000
    assert hashlib.sha256(p.read_bytes()).hexdigest()==v['files'][filename]['sha256']
assert len(rows)==550
assert Counter(q['type'] for q in rows)=={'MCQ':300,'CQ':150,'SQ':100}==v['actual']
assert len({norm(q['text']) for q in rows})==550
assert len(v['items'])==550
numeric=0
cq_count=0
for meta in v['items']:
    q=rows[meta['index']-1]
    assert meta['kind']==q['type'] and q['explanation'].strip()
    if q['type']=='MCQ':
        assert len({norm(x) for x in q['options'].values()})==4 and q['correct'] in q['options']
    if q['type']=='CQ':
        assert [p['label'] for p in q['parts']]==list('কখগঘ')
        assert [p['marks'] for p in q['parts']]==[1,2,3,4]
    if 'calculation' not in meta:continue
    c=meta['calculation'];p={k:F(x) for k,x in c['params'].items()};f=c.get('baseFamily',meta['family'])
    # Magnitudes must occur in the actual question, not merely side metadata.
    # Braking metadata b is a positive magnitude although the signed a in text is -b.
    input_magnitudes={abs(x) for x in nums(q['text'])}
    assert all(abs(F(fmt(x))) in input_magnitudes for x in p.values()),(meta['family'],p,q['text'])
    if q['type']!='CQ':
        if f=='speed':answer=p['d']/p['t']
        elif f=='kmh-ms':answer=p['v']*F(5,18)
        elif f=='ms-kmh':answer=p['v']*F(18,5)
        elif f=='uniform-distance':answer=p['v']*p['t']
        elif f=='acceleration':answer=(p['v']-p['u'])/p['t']
        elif f=='final-speed':answer=p['u']+p['a']*p['t']
        elif f=='rest-distance':answer=p['a']*p['t']**2/2
        elif f=='moving-distance':answer=p['u']*p['t']+p['a']*p['t']**2/2
        elif f=='average-velocity':answer=(p['u']+p['v'])/2
        elif f=='stop-time':answer=p['u']/p['b']
        elif f=='stop-distance':answer=p['u']**2/(2*p['b'])
        elif f=='velocity-distance':answer=sqrt(p['u']**2+2*p['a']*p['s'])
        elif f=='drop-distance':answer=p['g']*p['t']**2/2
        elif f=='drop-speed':answer=p['g']*p['t']
        elif f=='up-time':answer=p['u']/p['g']
        elif f=='up-height':answer=p['u']**2/(2*p['g'])
        elif f=='relative-same':answer=p['fast']-p['slow']
        elif f=='meeting-time':answer=p['gap']/(p['v']+p['w'])
        elif f=='vt-area':answer=p['v']*p['t']/2
        elif f=='xt-slope':answer=(p['y']-p['x'])/(p['t2']-p['t1'])
        elif f=='equal-distance-average':answer=2/(1/p['v']+1/p['w'])
        elif f=='equal-time-average':answer=(p['v']+p['w'])/2
        elif f=='nth-second':answer=p['u']+p['a']*(p['n']**2-(p['n']-1)**2)/2
        elif f=='frequency':answer=p['N']/p['t']
        else:raise AssertionError(f)
        assert answer==F(c['expected'])
        if q['type']=='MCQ':assert q['options'][q['correct']]==fmt(answer)+c['unit']
        else:contains(q['explanation'],[answer])
        numeric+=1
        continue
    g=q['parts'][2]['solution'];h=q['parts'][3]['solution']
    if f=='cq-accel':
        u,a,t=p['u'],p['a'],p['t'];contains(g,[u+a*t]);contains(h,[u*t+a*t*t/2])
    elif f=='cq-braking':
        u,b=p['u'],p['b'];contains(g,[u/b]);contains(h,[u*u/(2*b)])
    elif f=='cq-endpoint-accel':
        u,final,t=p['u'],p['v'],p['t'];contains(g,[(final-u)/t]);contains(h,[(u+final)/2,(u+final)*t/2])
    elif f=='cq-distance-final':
        u,a,s=p['u'],p['a'],p['s'];final=sqrt(u*u+2*a*s);contains(g,[final]);contains(h,[(final-u)/a,s])
    elif f=='cq-coast-brake':
        u,tc,b=p['u'],p['tc'],p['b'];sb=u*u/(2*b);contains(g,[sb]);contains(h,[u*tc+sb,(u*tc+sb)/(tc+u/b)])
    elif f=='cq-accelerate-cruise':
        a,t1,t2=p['a'],p['t1'],p['t2'];final=a*t1;s1=a*t1*t1/2;contains(g,[final,s1]);contains(h,[s1+final*t2,(s1+final*t2)/(t1+t2)])
    elif f=='cq-triangle-vt':
        peak,up,down=p['peak'],p['up'],p['down'];contains(g,[peak/up,-peak/down]);contains(h,[peak*(up+down)/2,peak/2])
    elif f=='cq-trapezoid-vt':
        peak,up,coast,down=p['peak'],p['up'],p['coast'],p['down'];s=peak*(up/2+coast+down/2);contains(g,[s]);contains(h,[s/(up+coast+down)])
    elif f=='cq-position-time':
        speed=(p['x2']-p['x1'])/(p['t2']-p['t1']);x0=p['x1']-speed*p['t1'];contains(g,[speed,x0]);contains(h,[x0+speed*p['t3'],speed*p['t3']])
    elif f=='cq-return-trip':
        d,total=p['d'],p['out']+p['back'];contains(g,[2*d/total]);contains(h,[0,2*d/total])
    elif f=='cq-direction-reversal':
        u,b,T=p['u'],p['b'],p['T'];assert T==2*u/b
        contains(g,[u/b,u*u/(2*b)]);contains(h,[u*T-b*T*T/2,u*u/b])
    elif f=='cq-right-angle-path':
        e,n,t=p['east'],p['north'],p['t'];d=sqrt(e*e+n*n);contains(g,[e+n,(e+n)/t]);contains(h,[d,d/t])
    elif f=='cq-semicircle':
        r,t=p['r'],p['t'];contains(g,[F(22,7)*r,F(22,7)*r/t]);contains(h,[2*r,2*r/t])
    elif f=='cq-full-circle':
        r,T=p['r'],p['T'];contains(g,[2*F(22,7)*r/T]);contains(h,[0,T])
    elif f=='cq-meeting':
        va,vb,gap=p['v'],p['w'],p['gap'];T=gap/(va+vb);contains(g,[T]);contains(h,[va*T,vb*T,gap])
    elif f=='cq-overtake':
        fast,slow,gap=p['fast'],p['slow'],p['gap'];T=gap/(fast-slow);contains(g,[T]);contains(h,[fast*T,gap+slow*T])
    elif f=='cq-catch-accelerating':
        a,speed=p['a'],p['v'];T=2*speed/a;contains(g,[T]);contains(h,[speed*T,a*T,speed])
    elif f=='cq-delayed-start':
        slow,fast,delay=p['slow'],p['fast'],p['delay'];T=slow*delay/(fast-slow);contains(g,[T]);contains(h,[fast*T,T+delay])
    elif f=='cq-drop-time':
        grav,t=p['g'],p['t'];contains(g,[grav*t*t/2]);contains(h,[grav*t])
    elif f=='cq-drop-height':
        grav,height=p['g'],p['h'];T=sqrt(2*height/grav);contains(g,[T]);contains(h,[grav*T,T])
    elif f=='cq-downward-throw':
        u,grav,t=p['u'],p['g'],p['t'];contains(g,[u*t+grav*t*t/2]);contains(h,[u+grav*t,u*t,grav*t*t/2])
    elif f=='cq-upward-roundtrip':
        u,grav=p['u'],p['g'];contains(g,[u/grav,u*u/(2*grav)]);contains(h,[2*u/grav,u*u/grav,0,u/2])
    elif f=='cq-upward-instant':
        u,grav,t=p['u'],p['g'],p['t'];contains(g,[u-grav*t,u*t-grav*t*t/2]);contains(h,[u/grav,2*u/grav])
    elif f=='cq-nth-second':
        u,a,k=p['u'],p['a'],p['k'];now=u*k+a*k*k/2;before=u*(k-1)+a*(k-1)**2/2;contains(g,[now]);contains(h,[before,now-before])
    elif f=='cq-last-second-fall':
        grav,t=p['g'],p['t'];height=grav*t*t/2;last=grav*(t*t-(t-1)**2)/2;contains(g,[height]);contains(h,[last,last/height])
    elif f=='cq-double-speed-brake':
        u,b=p['u'],p['b'];contains(g,[u*u/(2*b),u/b]);contains(h,[2*u*u/b,2*u/b])
    elif f=='cq-reaction-braking':
        u,r,b=p['u'],p['reaction'],p['b'];dr=u*r;db=u*u/(2*b);contains(g,[dr,db]);contains(h,[dr+db,dr+db-1])
    elif f=='cq-train-bridge':
        L,bridge,speed=p['L'],p['bridge'],p['v'];contains(g,[(L+bridge)/speed]);contains(h,[L/speed,bridge/speed])
    elif f=='cq-equal-distance-average':
        d,va,vb=p['d'],p['v'],p['w'];average=2/(1/va+1/vb);contains(g,[d/va,d/vb,average]);contains(h,[(va+vb)/2,average])
    elif f=='cq-signed-velocity-intervals':
        va,t1,vb,t2=p['v'],p['t1'],p['w'],p['t2'];net=va*t1-vb*t2;distance=va*t1+vb*t2;contains(g,[net,distance]);contains(h,[net/(t1+t2),distance/(t1+t2)])
    else:raise AssertionError(f)
    cq_count+=1
assert numeric==290  # 240 MCQ + 50 SQ
assert cq_count==150
assert len({x['family'] for x in v['items'] if x['kind']=='CQ'})==30
assert Counter(q['correct'] for q in rows if q['type']=='MCQ')==dict.fromkeys('ABCD',75)
for k in ['fullChapterRead','sourcePageVerified','teacherApproved','websiteImported','published','officialYearVerified']:assert v[k] is False
profile=json.loads((ROOT/'docs/question-bank/ssc-physics/mark-distribution.json').read_text())
assert sum(s['answer']*s['marksEach'] for s in profile['sections'])==75
assert profile['theoryMarks']+profile['practicalMarks']==100 and profile['totalTheoryMinutes']==180
print('PASS: 550 structures; 290 numeric MCQ/SQ answers; 150 CQ application/analysis calculations; 30 CQ families; 75/75/75/75 keys; DRAFT only, not teacher certification.')
