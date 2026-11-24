"""Read-only independent recomputation/contract checks; not teacher certification."""
from pathlib import Path
from fractions import Fraction as F
from decimal import Decimal, ROUND_HALF_UP
from collections import Counter
import hashlib,json,re,unicodedata

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'content/question-bank/ssc/physics/chapter-3'
def fmt(x):
    x=F(x);d=(Decimal(x.numerator)/Decimal(x.denominator)).quantize(Decimal('.000001'),rounding=ROUND_HALF_UP)
    return format(d,'f').rstrip('0').rstrip('.') or '0'
def nums(s):return set(F(x) for x in re.findall(r'(?<![\w.])[+-]?\d+(?:\.\d+)?',s.replace('−','-')))
def contains(s,values):
    actual=nums(s)
    for v in values:assert F(fmt(v)) in actual,(v,s)
def norm(s):return re.sub(r'\s+',' ',re.sub('[\u200B-\u200D\uFEFF]','',unicodedata.normalize('NFKC',s))).strip().lower()

manifest=json.loads((OUT/'validation.json').read_text())
rows=[]
for name in ['mcq','sq','cq']:
    p=OUT/f'{name}.json';b=json.loads(p.read_text());rows.extend(b['items'])
    assert b['category']=='Class 9' and b['subject']=='পদার্থবিজ্ঞান' and b['topic']=='৩য় অধ্যায়: বল'
    assert 0<len(b['items'])<=200 and p.stat().st_size<750000
    assert hashlib.sha256(p.read_bytes()).hexdigest()==manifest['files'][p.name]['sha256']
assert len(rows)==len(manifest['items'])==390
assert Counter(q['type'] for q in rows)=={'MCQ':200,'CQ':120,'SQ':70}==manifest['actual']
assert len({norm(q['text']) for q in rows})==390
numeric=cqs=0
for meta in manifest['items']:
    q=rows[meta['index']-1];assert q['type']==meta['kind']
    if q['type']=='MCQ':assert len({norm(x) for x in q['options'].values()})==4 and q['correct'] in q['options']
    if q['type']=='CQ':
        assert [x['label'] for x in q['parts']]==list('কখগঘ')
        assert [x['marks'] for x in q['parts']]==[1,2,3,4]
        assert all(x['question'].strip() and x['solution'].strip() for x in q['parts'])
    if 'calculation' not in meta:continue
    c=meta['calculation'];p={k:F(v) for k,v in c['params'].items()};f=c.get('baseFamily',meta['family'])
    magnitudes={abs(x) for x in nums(q['text'])}
    assert all(abs(F(fmt(x))) in magnitudes for x in p.values()),(f,p,q['text'])
    if q['type']!='CQ':
        if f=='force':r=p['m']*p['a']
        elif f=='acceleration':r=p['force']/p['m']
        elif f=='mass':r=p['force']/p['a']
        elif f=='opposed':r=(p['right']-p['left'])/p['m']
        elif f=='momentum':r=p['m']*p['v']
        elif f=='impulse':r=p['force']*p['t']
        elif f=='momentum-change':r=p['m']*(p['v']-p['u'])
        elif f=='average-force':r=p['m']*(p['v']-p['u'])/p['t']
        elif f=='stopping-force':r=p['m']*p['u']/p['t']
        elif f=='friction':r=p['mu']*p['m']*p['g']
        elif f=='coefficient':r=p['fr']/p['N']
        elif f=='weight':r=p['m']*p['g']
        elif f=='sticking':r=p['m']*p['u']/(p['m']+p['M'])
        elif f=='recoil':r=p['bullet']*p['speed']/p['gun']
        elif f=='braking-time':r=p['m']*p['u']/p['brake']
        elif f=='final-velocity':r=p['u']+p['force']*p['t']/p['m']
        else:raise AssertionError(f)
        assert r==F(c['expected'])
        if q['type']=='MCQ':assert q['options'][q['correct']]==fmt(r)+c['unit']
        else:contains(q['explanation'],[r])
        numeric+=1;continue
    g=q['parts'][2]['solution'];h=q['parts'][3]['solution']
    if f=='cq-force-accel':
        m,force,t=p['m'],p['force'],p['t'];a=force/m;contains(g,[a,a*t]);contains(h,[a*t*t/2,a*t*t])
    elif f=='cq-opposed-forces':
        m,right,left,t=p['m'],p['right'],p['left'],p['t'];a=(right-left)/m
        contains(g,[right-left,a]);contains(h,[a*t,right*t/m,left*t/m])
    elif f=='cq-same-direction':
        m,F1,F2=p['m'],p['F1'],p['F2'];contains(g,[F1+F2,(F1+F2)/m]);contains(h,[F1+F2,0])
    elif f=='cq-mass-loading':
        force,a=p['force'],p['a'];m=force/a;contains(g,[m]);contains(h,[2*m,a/2])
    elif f=='cq-impulse-change':
        m,u,v,t=p['m'],p['u'],p['v'],p['t'];J=m*(v-u);contains(g,[J,J/t]);contains(h,[2*t,J/(2*t)])
    elif f=='cq-stop-distance':
        m,u,s=p['m'],p['u'],p['distance'];b=u*u/(2*s);contains(g,[b,m*b]);contains(h,[4*s,u/b,2*u/b])
    elif f=='cq-impact-time':
        m,u,short,long=p['m'],p['u'],p['short'],p['long'];J=m*u;contains(g,[J,J/short,J/long]);contains(h,[long/short])
    elif f=='cq-rebound':
        m,u,back,t=p['m'],p['u'],p['back'],p['t'];J=-m*(back+u);contains(g,[J,J/t]);contains(h,[m*u,-J,m*back])
    elif f=='cq-stick-stationary':
        m1,m2,u=p['m1'],p['m2'],p['u'];V=m1*u/(m1+m2);contains(g,[V]);contains(h,[m1*(V-u),m2*V,0])
        assert m1*(V-u)+m2*V==0
    elif f=='cq-headon-stick':
        m1,m2,u,back=p['m1'],p['m2'],p['u'],p['back'];P=m1*u-m2*back;V=P/(m1+m2)
        assert V>0;contains(g,[P,V]);contains(h,[m2*(V+back),m1*u+m2*back])
    elif f=='cq-gun-recoil':
        m,v,M=p['bullet'],p['speed'],p['gun'];V=-m*v/M;contains(g,[V]);contains(h,[V/2,m*v]);assert m*v+M*V==0
    elif f=='cq-explosion':
        m1,m2,v1=p['m1'],p['m2'],p['v1'];v2=-m1*v1/m2;contains(g,[v2]);contains(h,[m1*v1,m2*v2,0]);assert m1*v1+m2*v2==0
    elif f=='cq-coupling-moving':
        m1,m2,u,v=p['m1'],p['m2'],p['u'],p['v'];V=(m1*u+m2*v)/(m1+m2)
        assert v<V<u;contains(g,[V]);contains(h,[m1*(V-u),m2*(V-v)])
    elif f=='cq-friction-net':
        m,mu,grav,pull=p['m'],p['mu'],p['g'],p['pull'];fr=mu*m*grav;contains(g,[fr,(pull-fr)/m]);contains(h,[fr,pull-fr])
    elif f=='cq-friction-uniform':
        m,grav,pull,extra=p['m'],p['g'],p['pull'],p['extra'];contains(g,[pull/(m*grav)]);contains(h,[extra/m,pull+extra])
    elif f=='cq-static-limit':
        m,grav,mu,pull,above=p['m'],p['g'],p['mu'],p['pull'],p['above'];limit=mu*m*grav
        assert pull<limit<above;contains(g,[pull,limit]);contains(h,[above,limit]);assert 'নির্দিষ্ট ত্বরণ' in h and 'নেই' in h
    elif f=='cq-friction-surfaces':
        m,grav,mu1,mu2=p['m'],p['g'],p['mu1'],p['mu2'];f1=mu1*m*grav;f2=mu2*m*grav;contains(g,[f1,f2]);contains(h,[f2-f1,(f2-f1)/m])
    elif f=='cq-friction-braking':
        mu,grav,u=p['mu'],p['g'],p['u'];b=mu*grav;contains(g,[b,u/b]);contains(h,[u*u/(2*b)])
    elif f=='cq-blocks-contact':
        m1,m2,push=p['m1'],p['m2'],p['push'];a=push/(m1+m2);contains(g,[a]);contains(h,[m2*a,m1*a])
    elif f=='cq-carts-tension':
        m1,m2,pull=p['m1'],p['m2'],p['pull'];a=pull/(m1+m2);contains(g,[a]);contains(h,[m2*a,m1*a])
    elif f=='cq-vertical-support':
        m,grav,a=p['m'],p['g'],p['a'];contains(g,[m*(grav+a)]);contains(h,[m*grav,m*a])
    elif f=='cq-equal-force-masses':
        m1,m2,force,t=p['m1'],p['m2'],p['force'],p['t'];J=force*t;contains(g,[J/m1,J/m2]);contains(h,[J,m2/m1])
    elif f=='cq-piecewise-force':
        m,F1,t1,F2,t2=p['m'],p['F1'],p['t1'],p['F2'],p['t2'];J=F1*t1-F2*t2
        assert J>0;contains(g,[J,J/m]);contains(h,[J/(t1+t2),F1*t1+F2*t2])
    elif f=='cq-external-impulse':
        m1,m2,u,force,dt=p['m1'],p['m2'],p['u'],p['force'],p['dt'];J=force*dt;V=(m1*u+J)/(m1+m2)
        contains(g,[J,V]);contains(h,[m1*u/(m1+m2),J/(m1+m2)])
    else:raise AssertionError(f)
    cqs+=1
assert numeric==190 and cqs==120
assert len({m['family'] for m in manifest['items'] if m['kind']=='CQ'})==24
assert Counter(q['correct'] for q in rows if q['type']=='MCQ')==dict.fromkeys('ABCD',50)
for k in ['fullChapterRead','sourcePageVerified','teacherApproved','websiteImported','published','officialYearVerified']:assert manifest[k] is False
profile=json.loads((ROOT/'docs/question-bank/ssc-physics/mark-distribution.json').read_text())
assert sum(s['answer']*s['marksEach'] for s in profile['sections'])==75
assert profile['totalTheoryMinutes']==180 and profile['practicalMarks']==25
print('PASS: 390 structures; 190 numeric MCQ/SQ keys; 120 CQ calculations/constraints; 24 CQ families; 50/50/50/50 keys. Draft only, not teacher certification.')
