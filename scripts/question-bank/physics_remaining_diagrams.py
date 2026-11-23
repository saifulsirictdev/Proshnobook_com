"""Self-contained educational schematics; ray coordinates follow paraxial models.
No source screenshots or externally loaded SVG content in question assets.
"""
from physics_illustrated import Bank,ROOT,save,sha,html,fmt,F
import math
class RemainingBank(Bank):
 def figure(self,name,kind,labels):
  name=name.lower() # Exact renderer allowlist accepts lowercase asset slugs only.
  # labels contains a single data dict; keep numeric metadata for independent checks.
  p=labels[0];texts=[];paths=[];dashed=[];semantic={}
  def t(x,y,s):texts.append(f'<text x="{x:.3f}" y="{y:.3f}">{html.escape(str(s))}</text>')
  def line(x1,y1,x2,y2,dash=False):
   (dashed if dash else paths).append(f'M{x1:.3f} {y1:.3f}L{x2:.3f} {y2:.3f}')
  if kind in ['concave','convex','lens-positive','lens-negative']:
   mirror=kind in ['concave','convex'];u=float(p['u']);f=float(p['f']);v=f*u/(u-f);m=-v/u
   coords=[0,-u,-f,-2*f,(-v if mirror else v)]
   if not mirror:coords += [f,2*f]
   lo,hi=min(coords),max(coords);s=350/(hi-lo);origin=60-lo*s;axis=165;h=min(42,70/max(1,abs(m)));obj=(origin-u*s,axis-h);img=(origin+(-v if mirror else v)*s,axis-m*h)
   line(30,axis,450,axis);line(*obj,obj[0],axis);line(img[0],axis,*img)
   # Mark pole/optical centre and focal points without claiming exact spherical rays.
   if mirror:
    curve='M{0} 65 Q{1} 165 {0} 265'.format(origin-10 if f>0 else origin+10,origin+10 if f>0 else origin-10);paths.append(curve)
    t(origin+5,axis+20,'P');fx=origin-f*s;t(fx-5,axis+20,'F')
   else:
    paths.append(f'M{origin:.3f} 65V265');t(origin+4,axis+20,'O')
    for fx in [origin-abs(f)*s,origin+abs(f)*s]:t(fx-4,axis+20,'F')
   t(obj[0]-12,obj[1]-9,'Object');t(img[0]-10,img[1]+(-10 if m>0 else 36),'Image')
   if not mirror:
    # Standard thin-lens symbol: outward arrows for converging, inward for diverging.
    paths.append(f'M{origin-6:.3f} {71 if f>0 else 59}L{origin:.3f} 65L{origin+6:.3f} {71 if f>0 else 59}M{origin-6:.3f} {259 if f>0 else 271}L{origin:.3f} 265L{origin+6:.3f} {259 if f>0 else 271}')
   def rayarrow(a,z):
    dx=z[0]-a[0];dy=z[1]-a[1];length=math.hypot(dx,dy)
    if length<12:return
    dx/=length;dy/=length;x=(a[0]+z[0])/2;y=(a[1]+z[1])/2
    paths.append(f'M{x-6*dx+3*dy:.3f} {y-6*dy-3*dx:.3f}L{x:.3f} {y:.3f}L{x-6*dx-3*dy:.3f} {y-6*dy+3*dx:.3f}')
   rayarrow(obj,(origin,axis-h));rayarrow(obj,(origin,axis))
   if v>0:rayarrow((origin,axis-h),img);rayarrow((origin,axis),img)
   # Parallel incident ray, then real reflected/refracted ray or virtual back-extension.
   hit=(origin,axis-h);line(*obj,*hit)
   if v>0:line(*hit,*img)
   else:
    line(*hit,*img,True)
    dx=hit[0]-img[0];dy=hit[1]-img[1];k=70/max(abs(dx),abs(dy),1);line(*hit,hit[0]+dx*k,hit[1]+dy*k)
   if mirror:
    line(*obj,origin,axis)
    if v>0:line(origin,axis,*img)
    else:line(origin,axis,*img,True)
   else:
    line(*obj,origin,axis)
    line(origin,axis,*img,v<0)
   semantic=dict(model='paraxial',objectDistance=u,focalLength=f,imageDistance=v,magnification=m,origin=origin,scale=s,objectTip=obj,imageTip=img,mirror=mirror)
   t(20,292,'Solid: actual rays; dashed: virtual extensions')
  elif kind in ['reflection','refraction']:
   line(50,175,430,175);line(240,35,240,265,True)
   if kind=='reflection':
    ang=float(p.get('angle',30));r=math.radians(ang);dx=100*math.sin(r);dy=100*math.cos(r)
    line(240-dx,175-dy,240,175);line(240,175,240+dx,175-dy);t(70,205,'Reflecting surface');semantic=dict(incidence=ang,reflection=ang)
   else:
    sini=float(p.get('sini',F(1,2)));n1=float(p.get('n1',1));n2=float(p.get('n2',F(3,2)));sinr=n1*sini/n2;assert 0<sinr<1
    line(240-110*sini,175-110*math.sqrt(1-sini*sini),240,175);line(240,175,240+100*sinr,175+100*math.sqrt(1-sinr*sinr));t(60,65,'Medium 1');t(60,245,'Medium 2');semantic=dict(sinIncidence=sini,sinRefraction=sinr,n1=n1,n2=n2)
   t(245,35,'Normal');t(150,110,'incident');t(290,120 if kind=='reflection' else 240,'outgoing')
  elif kind=='critical':
   n1=float(p.get('n',p.get('ncore',1.5)));n2=float(p.get('nclad',1));c=math.asin(n2/n1);i=min(c+0.12,1.5)
   line(50,145,450,145);line(240,40,240,285,True)
   line(240-100*math.sin(i),145+100*math.cos(i),240,145);line(240,145,240+100*math.sin(i),145+100*math.cos(i))
   t(60,70,'Lower refractive index');t(60,280,'Higher index: i > critical angle');t(250,32,'Normal')
   semantic=dict(higherIndex=n1,lowerIndex=n2,incidence=i,criticalAngle=c,totalInternalReflection=True)
  elif kind=='point-field':
   paths.append('M115 140a25 25 0 1 0 0 50a25 25 0 1 0 0-50');t(105,170,'Q');line(145,165,375,165);t(370,155,'P');t(240,195,'r');t(75,90,'Charge / external field model as stated')
   semantic=dict(source='Q or given external field',testPoint='P')
  elif kind=='charges':
   line(90,165,390,165);paths.extend(['M90 145a20 20 0 1 0 0 40a20 20 0 1 0 0-40','M390 145a20 20 0 1 0 0 40a20 20 0 1 0 0-40']);t(76,170,'q1');t(377,170,'q2');t(230,205,'r');t(100,100,'Point charges; signs and data in question');semantic=dict(separation='r',chargeModel='points')
  elif kind in ['series','parallel','mixed','single']:
   def resistor(x,y,label):
    paths.append(f'M{x} {y}h10l5 -8 10 16 10 -16 10 16 5 -8h10');t(x+8,y-17,label)
   line(60,80,100,80);resistor(100,80,'R1' if kind!='single' else 'R');line(160,80,210,80)
   if kind in ['series','mixed']:resistor(210,80,'R2');line(270,80,310,80)
   if kind in ['parallel','mixed']:
    x=210 if kind=='parallel' else 310
    line(x,80,x,170);resistor(x,80,'R2' if kind=='parallel' else 'R3');resistor(x,170,'R3' if kind=='parallel' else 'R4');line(x+60,80,x+60,170);line(x+60,170,x+60,230);line(x+60,230,60,230)
   else:line(310 if kind=='series' else 210,80,420,80);line(420,80,420,230);line(420,230,60,230)
   line(60,80,60,137);line(45,137,75,137);line(50,152,70,152);line(60,152,60,230);t(15,181,'V');t(80,270,'Ideal wires; resistor labels match the stated circuit')
   semantic=dict(topology={'single':'R','series':'R1+R2','parallel':'R1+(R2||R3)','mixed':'R1+R2+(R3||R4)'}[kind])
  elif kind=='transformer':
   paths.append('M140 65H340V235H140ZM175 95H305V205H175Z')
   for x in [140,340]:
    for y in range(100,200,12):line(x-24,y,x+24,y+10)
   t(45,70,'AC primary');t(340,70,'secondary');t(70,253,'Np, Vp, Ip');t(300,253,'Ns, Vs, Is');semantic=dict(commonCore=True,primarySupply='AC')
  elif kind=='motor':
   paths.append('M80 95H150V230H80ZM330 95H400V230H330Z');t(100,165,'N');t(350,165,'S');line(175,140,310,140);line(175,180,310,180);paths.append('M230 145V205m-8-12 8 12 8-12');t(195,120,'B: N to S');t(220,225,'F');t(190,265,'wire current out of page');paths.append('M240 165a5 5 0 1 0 .1 0');semantic=dict(B='right',I='out of page',F='up')
   # Force is upward for I out of page and B right; replace down arrow.
   paths[-2]='M230 205V145m-8 12 8-12 8 12'
  elif kind in ['diode','rectifier','transistor','radio']:
   if kind in ['diode','rectifier']:
    paths.append('M60 130H180M180 105V155L230 130ZM230 100V160M230 130H310M310 115H360V145H310ZM360 130H410V245H60');t(135,85,'anode');t(235,85,'cathode');t(325,180,'R')
    if kind=='rectifier':
     paths.append('M60 245V195M60 130V145M60 145a25 25 0 1 0 0 50a25 25 0 1 0 0-50M43 170q8-18 17 0t17 0');t(18,220,'AC')
    else:
     paths.append('M60 245V180M45 170H75M50 180H70M60 130V170')
    t(20,270,'Series source / diode / load; model and bias in text');semantic=dict(anode='left',cathode='right',topology='series diode and resistor',source='AC' if kind=='rectifier' else 'DC')
    if kind=='rectifier':
     # Two complete input cycles and matching positive half-wave output.
     def curve(x0,clip):
      return 'M'+'L'.join(f'{x0+i:.3f} {35-16*(max(0,math.sin(2*math.pi*i/65)) if clip else math.sin(2*math.pi*i/65)):.3f}' for i in range(131))
     paths.extend([curve(30,False),curve(300,True)]);t(60,63,'AC input');t(320,63,'half-wave out');semantic['inputCycles']=2;semantic['rectification']='positive half-wave'
   elif kind=='transistor':
    paths.append('M80 165H220M220 115V215M220 140L300 90V50M220 190L300 240V270M270 213l15 5-7-15');t(80,150,'B');t(310,65,'C');t(310,265,'E');t(40,290,'NPN: emitter arrow outward');semantic=dict(device='NPN',emitterArrow='out')
   else:
    for i,label in enumerate(['Mic','Modulate','Transmit','Receive','Speaker']):
     x=15+94*i;paths.append(f'M{x} 130h82v70h-82Z');t(x+5,169,label)
     if i<4:line(x+82,165,x+94,165)
    semantic=dict(signalFlow=['microphone','modulation','transmission','reception','speaker'])
  elif kind=='xray':
   paths.append('M50 100H430V220H50ZM90 145V180M340 130L310 190M110 160H310m-10-6 10 6-10 6M325 160L390 60m-12 5 12-5-2 13');t(65,250,'Cathode (-)');t(300,250,'Target (+)');t(140,140,'electrons');t(340,40,'X-rays')
   # A two-cycle radiation schematic; first-to-next peak is one wavelength.
   paths.append('M'+'L'.join(f'{60+i:.3f} {286-12*math.sin(2*math.pi*i/80):.3f}' for i in range(161)))
   line(80,266,160,266);t(235,290,'one peak interval = wavelength')
   semantic=dict(electronDirection='cathode-to-target',beam='from target',waveCycles=2,wavelengthSpan=[80,160])
  elif kind=='ultrasound':
   paths.append('M80 100H160V220H80ZM390 60V260M160 140H380m-10-6 10 6-10 6M380 185H160m10-6-10 6 10 6');t(60,85,'Probe');t(345,45,'Boundary');t(230,120,'out');t(230,213,'echo');t(220,257,'depth d');semantic=dict(soundPath='out-and-back')
  elif kind=='ecg':
   for x in range(40,441,20):line(x,75,x,245)
   for y in range(85,246,20):line(40,y,440,y)
   paths.append('M40 185H80l10-12 10 12h30l5 15 10-85 10 100 10-30h50l10-12 10 12h30l5 15 10-85 10 100 10-30h100')
   t(65,55,'Stylized ECG: repeated R peaks');t(60,280,'Use stated time calibration, not clinical diagnosis');semantic=dict(qualitativeOnly=True,Rpeaks=2)
  else:raise ValueError(kind)
  for i,(key,val) in enumerate(p.items()):
   # Two-column bounded data labels, numbers use exact fraction-friendly formatting.
   t(20+(i%2)*230,330+(i//2)*24,f'{key} = {fmt(val) if isinstance(val,(int,F)) else val}')
  footerY=354+24*((len(p)+1)//2);t(20,footerY,'Schematic; paraxial/data model as stated; not to scale')
  svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 {footerY+18}" role="img" aria-label="{kind} diagram"><rect width="100%" height="100%" fill="white"/><g fill="none" stroke="#17465b" stroke-width="2">'+''.join(f'<path d="{x}"/>' for x in paths)+''.join(f'<path d="{x}" stroke-dasharray="5 4"/>' for x in dashed)+'</g><g fill="#162d40" font-family="Arial,sans-serif" font-size="13">'+''.join(texts)+'</g></svg>\n'
  path=self.assetdir/(name+'.svg');save(path,svg);meta=dict(file=str(path.relative_to(ROOT)),url=self.url+path.name,kind=kind,labels=[{k:str(v) for k,v in p.items()}],semantic=semantic,sha256=sha(path));self.assets.append(meta)
  return f'\n![পুনরঙ্কিত {kind} চিত্র]({meta["url"]})'
