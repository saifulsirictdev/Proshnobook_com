"""Read-only recomputation and content-contract checks; not teacher approval."""
from pathlib import Path
from fractions import Fraction as F
from decimal import Decimal,ROUND_HALF_UP
from collections import Counter
import hashlib,json,re,unicodedata,math
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'content/question-bank/ssc/physics/chapter-4'
def fmt(x):
    x=F(x);d=(Decimal(x.numerator)/Decimal(x.denominator)).quantize(Decimal('.000001'),rounding=ROUND_HALF_UP)
    return format(d,'f').rstrip('0').rstrip('.') or '0'
def nums(s):return set(F(x) for x in re.findall(r'(?<![\w.])[+-]?\d+(?:\.\d+)?',s.replace('−','-')))
def contains(s,values):
    actual=nums(s)
    for v in values:assert F(fmt(v)) in actual,(v,s)
def norm(s):return re.sub(r'\s+',' ',re.sub('[\u200B-\u200D\uFEFF]','',unicodedata.normalize('NFKC',s))).strip().lower()
def sqrt(x):
    x=F(x);a=math.isqrt(x.numerator);b=math.isqrt(x.denominator)
    assert a*a==x.numerator and b*b==x.denominator,x
    return F(a,b)
manifest=json.loads((OUT/'validation.json').read_text());rows=[]
for name in ['mcq-1','mcq-2','sq','cq']:
    p=OUT/f'{name}.json';b=json.loads(p.read_text());rows.extend(b['items'])
    assert b['category']=='Class 9' and b['subject']=='পদার্থবিজ্ঞান' and b['topic']=='৪র্থ অধ্যায়: কাজ, ক্ষমতা ও শক্তি'
    assert 0<len(b['items'])<=200 and p.stat().st_size<750000
    assert hashlib.sha256(p.read_bytes()).hexdigest()==manifest['files'][p.name]['sha256']
assert len(rows)==len(manifest['items'])==600
assert Counter(q['type'] for q in rows)=={'MCQ':350,'CQ':150,'SQ':100}==manifest['actual']
assert len({norm(q['text']) for q in rows})==600
numeric=cqs=0
for meta in manifest['items']:
    q=rows[meta['index']-1];assert q['type']==meta['kind']
    if q['type']=='MCQ':assert len({norm(x) for x in q['options'].values()})==4 and q['correct'] in q['options']
    if q['type']=='CQ':
        assert [x['label'] for x in q['parts']]==list('কখগঘ') and [x['marks'] for x in q['parts']]==[1,2,3,4]
        assert all(x['question'].strip() and x['solution'].strip() for x in q['parts'])
    if 'calculation' not in meta:continue
    c=meta['calculation'];p={k:F(v) for k,v in c['params'].items()};f=c.get('baseFamily',meta['family'])
    all_question=q['text']+' '+(' '.join(x['question'] for x in q['parts']) if q['type']=='CQ' else '')
    given={abs(x) for x in nums(all_question)}
    assert all(F(fmt(x))==x for x in p.values()),('rounded input changes problem',f,p)
    assert all(abs(x) in given for x in p.values()),(f,p,all_question)
    if q['type']!='CQ':
        if f=='horizontal-work':r=p['force']*p['s']
        elif f=='lift-work':r=p['m']*p['g']*p['h']
        elif f=='distance':r=p['work']/p['force']
        elif f=='force':r=p['work']/p['s']
        elif f=='power':r=p['work']/p['t']
        elif f=='time':r=p['work']/p['power']
        elif f=='energy-pt':r=p['power']*p['t']
        elif f=='lift-power':r=p['m']*p['g']*p['h']/p['t']
        elif f=='lift-mass':r=p['power']*p['t']/(p['g']*p['h'])
        elif f=='kinetic':r=p['m']*p['v']**2/2
        elif f=='speed-ke':r=sqrt(2*p['energy']/p['m'])
        elif f=='mass-ke':r=2*p['energy']/p['v']**2
        elif f=='potential':r=p['m']*p['g']*p['h']
        elif f=='height-pe':r=p['energy']/(p['m']*p['g'])
        elif f=='mass-pe':r=p['energy']/(p['g']*p['h'])
        elif f=='efficiency':r=p['out']/p['inp']*100
        elif f in ['useful-energy','useful-power']:r=p['inp']*p['percent']/100
        elif f in ['input-energy','input-power']:r=p['out']*100/p['percent']
        elif f=='kwh-joule':r=p['energy']*3600000
        elif f=='kw-watt':r=p['power']*1000
        elif f=='mechanical-total':r=p['m']*p['v']**2/2+p['m']*p['g']*p['h']
        elif f=='fall-ke':r=p['m']*p['g']*p['h']
        elif f=='fall-speed':r=sqrt(2*p['g']*p['h'])
        elif f=='rise-height':r=p['v']**2/(2*p['g'])
        elif f=='brake-work':r=p['m']*p['v']**2/2
        elif f=='net-ke-change':r=p['m']*(p['v']**2-p['u']**2)/2
        elif f=='friction-loss':r=p['fr']*p['s']
        elif f=='power-fv':r=p['force']*p['v']
        else:raise AssertionError(f)
        assert r==F(c['expected'])
        if q['type']=='MCQ':assert q['options'][q['correct']]==fmt(r)+c['unit']
        else:contains(q['explanation'],[r])
        numeric+=1;continue
    g=q['parts'][2]['solution'];h=q['parts'][3]['solution']
    if f=='cq-pull-friction':
        force,fr,s=p['force'],p['fr'],p['s'];contains(g,[force*s,-fr*s,(force-fr)*s]);contains(h,[(force-fr)*s,fr*s])
    elif f=='cq-lift':
        m,grav,H,t=p['m'],p['g'],p['h'],p['t'];W=m*grav*H;contains(g,[W,-W]);contains(h,[W/t,0])
    elif f=='cq-stairs-compare':
        m,H,grav,t1,t2=p['m'],p['h'],p['g'],p['t1'],p['t2'];W=m*grav*H;contains(g,[W/t1,W/t2]);contains(h,[t2/t1,W])
    elif f=='cq-kinetic-scaling':
        m,v=p['m'],p['v'];K=m*v*v/2;contains(g,[K,4*K]);contains(h,[3*K,-4*K])
    elif f=='cq-equal-ke':
        m,v,M=p['m'],p['v'],p['M'];K=m*v*v/2;vb=sqrt(2*K/M);contains(g,[vb]);contains(h,[m*v,M*vb])
    elif f=='cq-potential-reference':
        m,grav,h1,h2=p['m'],p['g'],p['h1'],p['h2'];U1=m*grav*h1;U2=m*grav*h2;contains(g,[U1,U2,U2-U1]);contains(h,[U2-U1,U1-U2])
    elif f=='cq-freefall':
        m,H,grav=p['m'],p['H'],p['g'];E=m*grav*H;contains(g,[E,sqrt(2*grav*H)]);contains(h,[E/2,E])
    elif f=='cq-upward-energy':
        m,u,grav=p['m'],p['u'],p['g'];E=m*u*u/2;contains(g,[u*u/(2*grav)]);contains(h,[0,E,u])
    elif f=='cq-falling-initial-speed':
        m,u,H,grav=p['m'],p['u'],p['H'],p['g'];E=m*u*u/2+m*grav*H;contains(g,[E]);contains(h,[sqrt(2*E/m),m*u*u/2])
    elif f=='cq-known-mechanical':
        m,E,H,grav=p['m'],p['E'],p['h'],p['g'];K=E-m*grav*H;contains(g,[K,sqrt(2*K/m)]);contains(h,[E/(m*grav)])
    elif f=='cq-work-speed':
        m,u,force,s=p['m'],p['u'],p['force'],p['s'];W=force*s;contains(g,[W]);contains(h,[sqrt(u*u+2*W/m)])
    elif f=='cq-stop-work':
        m,u,force=p['m'],p['u'],p['force'];K=m*u*u/2;contains(g,[-K,K/force]);contains(h,[-4*K,4*K/force])
    elif f=='cq-two-stage-work':
        F1,s1,F2,s2=p['F1'],p['s1'],p['F2'],p['s2'];W=F1*s1+F2*s2;contains(g,[W]);contains(h,[W/(s1+s2)])
    elif f=='cq-motor-lift':
        m,H,grav,t,eta=p['m'],p['h'],p['g'],p['t'],p['percent']/100;W=m*grav*H;contains(g,[W/t]);contains(h,[W/t/eta,W/eta-W])
    elif f=='cq-water-pump':
        vol,rho,H,t,grav=p['volume'],p['rho'],p['h'],p['t'],p['g'];W=vol*rho*grav*H;contains(g,[vol*rho,W]);contains(h,[W/t,2*W/t])
    elif f=='cq-efficiency-energy':
        inp,out,eta=p['inp'],p['out'],p['newpercent']/100;contains(g,[out/inp*100,inp-out]);contains(h,[out/eta,inp-out/eta])
    elif f=='cq-efficiency-power':
        inp,out,t=p['inp'],p['out'],p['t'];contains(g,[out/inp*100,inp-out]);contains(h,[out*t,(inp-out)*t,inp*t])
    elif f=='cq-fuel-energy':
        fuel,density,eta,neweta=p['fuel'],p['q'],p['percent']/100,p['newpercent']/100;E=fuel*density*eta;contains(g,[fuel*density,E]);contains(h,[E/(neweta*density),fuel-E/(neweta*density)])
    elif f=='cq-kwh-cost':
        power,hours,rate,days=p['power'],p['hours'],p['rate'],p['days'];E=power*hours/1000;contains(g,[E,E*3600000]);contains(h,[E*rate*days,E*rate*days/2]);assert 'কাল্পনিক' in q['text']
    elif f=='cq-output-time':
        inp,eta,W=p['inp'],p['percent']/100,p['work'];contains(g,[inp*eta,W/(inp*eta)]);contains(h,[W/eta,W/eta-W])
    elif f=='cq-compare-machines':
        inp,eta1,eta2,W=p['inp'],p['percent1']/100,p['percent2']/100,p['work'];contains(g,[inp*eta1,inp*eta2]);contains(h,[W/(inp*eta1),W/(inp*eta2),W/eta1,W/eta2])
    elif f=='cq-force-speed-power':
        force,speed,t=p['force'],p['speed'],p['t'];W=force*speed*t;contains(g,[force*speed,W]);contains(h,[-W,0])
    elif f=='cq-momentum-energy':
        m,momentum=p['m'],p['p'];K=momentum*momentum/(2*m);contains(g,[momentum/m,K]);contains(h,[4*K,-4*K])
    elif f=='cq-descent-loss':
        m,grav,H,low,loss=p['m'],p['g'],p['H'],p['h'],p['loss'];drop=m*grav*(H-low);K=drop-loss;assert K>=0;contains(g,[drop,K]);contains(h,[m*grav*H,m*grav*H-loss,loss])
    elif f=='cq-speed-loss':
        m,u,v=p['m'],p['u'],p['v'];K1=m*u*u/2;K2=m*v*v/2;contains(g,[K1,K2]);contains(h,[K1-K2,(K1-K2)/K1*100])
    elif f=='cq-ke-units':
        m,kmh=p['m'],p['kmh'];speed=kmh*F(5,18);K=m*speed*speed/2;contains(g,[speed,K]);contains(h,[F(18,5)**2,m*kmh*kmh/2])
    elif f=='cq-repeated-lifts':
        m,H,N,moving,rest,grav=p['m'],p['h'],p['trips'],p['moving'],p['rest'],p['g'];W=m*grav*H*N;T=N*(moving+rest);contains(g,[W,T]);contains(h,[W/T,W/(N*moving)])
    elif f=='cq-power-loss-percent':
        inp,percent,t=p['inp'],p['losspercent'],p['t'];out=inp*(1-percent/100);contains(g,[out,100-percent]);contains(h,[out*t,inp*t,out/inp])
    elif f=='cq-solar-conversion':
        intensity,area,t,eta=p['intensity'],p['area'],p['t'],p['percent']/100;pin=intensity*area;out=pin*eta;contains(g,[pin,out]);contains(h,[out*t,(pin-out)*t])
    elif f=='cq-hydro-flow':
        flow,rho,H,grav,eta,t=p['flow'],p['rho'],p['H'],p['g'],p['percent']/100,p['t'];pin=flow*rho*grav*H;out=pin*eta;contains(g,[pin,out]);contains(h,[out*t,(pin-out)*t])
    else:raise AssertionError(f)
    cqs+=1
assert numeric==350 and cqs==150
assert len({m['family'] for m in manifest['items'] if m['kind']=='CQ'})==30
assert Counter(q['correct'] for q in rows if q['type']=='MCQ')=={'A':88,'B':88,'C':87,'D':87}
for k in ['fullChapterRead','sourcePageVerified','teacherApproved','websiteImported','published','officialYearVerified']:assert manifest[k] is False
profile=json.loads((ROOT/'docs/question-bank/ssc-physics/mark-distribution.json').read_text())
assert sum(s['answer']*s['marksEach'] for s in profile['sections'])==75 and profile['totalTheoryMinutes']==180 and profile['practicalMarks']==25
print('PASS: 600 structures; 350 numeric MCQ/SQ keys; 150 CQ calculations/constraints; 30 CQ families; 88/88/87/87 keys. Draft only, not teacher certification.')
