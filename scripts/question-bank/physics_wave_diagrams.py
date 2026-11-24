"""Safe, deterministic wave/sound SVGs for illustrated original practice.
No source image copying. Curves/axes describe exactly the stated phase intervals;
not-to-scale is a size disclaimer, never an excuse to alter cycle counts.
"""
from physics_illustrated import Bank,ROOT,save,sha,html
import math
class WaveBank(Bank):
 def figure(self,name,kind,labels):
  def text(x,y,s):return f'<text x="{x}" y="{y}">{html.escape(str(s))}</text>'
  semantic={};shapes='';words=''
  if kind in ['space-wave','time-wave','amplitude']:
   points=' '.join(f'{65+i*2:.3f},{140-60*math.sin(2*math.pi*(i*2)/180):.3f}' for i in range(181))
   shapes='<path d="M65 40V225M65 140H435" stroke="#718096"/>'+f'<polyline points="{points}" stroke="#155e75"/>'
   words=text(35,35,'y')+text(47,158,'0')+text(365,165,'t (s)' if kind=='time-wave' else 'x (m)')
   semantic=dict(fullCycles=2,equilibriumY=140,peakY=80,troughY=200,horizontalAxis='time' if kind=='time-wave' else 'position')
   if kind=='amplitude':
    shapes+='<path d="M435 80H455M445 80V200M435 200H455"/>'
    words+=text(450,145,'H')+text(100,60,'H = peak-to-trough displacement')
    semantic['dimension']='peak-to-trough'
   else:
    shapes+='<path d="M65 235V250M65 242H425M425 235V250"/>'
    words+=text(198,265,'tau (s)' if kind=='time-wave' else 'L (m)')
    semantic['dimension']='two-periods' if kind=='time-wave' else 'two-wavelengths'
  elif kind=='longitudinal':
   xs=[90,95,100,105,110,145,175,205,230,235,240,245,250,285,315,345,370,375,380,385,390]
   shapes=''.join(f'<path d="M{x} 95V200"/>' for x in xs)
   shapes+='<path d="M100 225V240M100 232H240M240 225V240M310 45H420m-10-6 10 6-10 6"/>'
   words=text(87,80,'C1')+text(227,80,'C2')+text(367,80,'C3')+text(130,258,'one wavelength')+text(300,32,'Propagation')
   semantic=dict(compressionCenters=[100,240,380],wavelengthSpan=[100,240],displacementDirection='parallel to propagation',barPositions=xs)
  elif kind in ['echo','echo-toward','echo-away']:
   shapes='<path d="M385 35V245M390 35V245M70 200H385M70 120H365m-10-6 10 6-10 6M365 160H70m10-6-10 6 10 6"/><circle cx="70" cy="100" r="10"/><path d="M70 110V160m0-35-14 20m14-20 14 20m-14 15-12 28m12-28 12 28"/>'
   words=text(45,218,'A')+text(350,265,'Wall')+text(190,222,'D (initial)')+text(175,110,'outgoing sound')+text(160,184,'returning sound')
   if kind!='echo':
    end=145 if kind=='echo-toward' else 15
    shapes+=f'<path d="M70 55H{end}"/>'
    shapes+=('<path d="M135 49l10 6-10 6"/>' if kind=='echo-toward' else '<path d="M25 49l-10 6 10 6"/>')
    words+=text(90 if kind=='echo-toward' else 28,43,'u')
   semantic=dict(soundPath='out-and-back',reflector='stationary',observerMotion={'echo':'stationary','echo-toward':'toward','echo-away':'away'}[kind])
  elif kind in ['sonar','well']:
   shapes='<path d="M125 35V245H355V35M125 120H355M135 150H345M135 180H345M135 210H345" stroke="#317d8d"/><path d="M240 45V110m-6-10 6 10 6-10M260 230V130m-6 10 6-10 6 10"/>'
   if kind=='well':
    words=text(210,30,'A (mouth)')+text(360,123,'B (surface)')+text(220,265,'C (bottom)')+text(140,86,'air: d1')+text(140,170,'water: d2')
    semantic=dict(layers=['air','water'],echoPaths=['A-B-A','A-B-C-B-A'])
   else:
    words=text(180,30,'Emitter / receiver')+text(140,90,'water')+text(270,180,'h')+text(200,265,'seabed')
    semantic=dict(soundPath='out-and-back',medium='water')
  elif kind=='two-paths':
   shapes='<path d="M65 85H415V220H65ZM65 150H415M90 110H390m-10-6 10 6-10 6M90 185H390m-10-6 10 6-10 6"/>'
   words=text(80,75,'Same endpoints; length L')+text(190,133,'air path')+text(180,208,'solid path')
   semantic=dict(pathLengths='equal',reflectionsUsed=False)
  else:raise ValueError(kind)
  words+=''.join(text(20,292+i*23,s) for i,s in enumerate(labels))
  words+=text(20,322+23*len(labels),'Schematic - not to scale; phase/cycle counts as drawn')
  alt={'space-wave':'সরণ–অবস্থান লেখচিত্র; দুটি পূর্ণ তরঙ্গ','time-wave':'সরণ–সময় লেখচিত্র; দুটি পূর্ণ স্পন্দন','amplitude':'সাম্যাবস্থা, শীর্ষ ও পাদ','longitudinal':'সংকোচন ও প্রসারণ; C1–C2 এক তরঙ্গদৈর্ঘ্য','echo':'স্থির পর্যবেক্ষক ও প্রতিফলক','echo-toward':'প্রতিফলকের দিকে চলমান শ্রোতা','echo-away':'প্রতিফলক থেকে দূরে চলমান শ্রোতা','sonar':'সোনারের যাওয়া–ফেরার পথ','well':'আংশিক পানিপূর্ণ কুয়ায় দুই প্রতিফলন-পথ','two-paths':'সমদৈর্ঘ্যের বায়ু ও কঠিনের শব্দপথ'}[kind]
  svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 {340+23*len(labels)}" role="img" aria-label="{kind} diagram"><rect width="100%" height="100%" fill="white"/><g fill="none" stroke="#162d40" stroke-width="2">{shapes}</g><g fill="#162d40" font-family="Arial,sans-serif" font-size="14">{words}</g></svg>\n'
  path=self.assetdir/(name+'.svg');save(path,svg)
  a=dict(file=str(path.relative_to(ROOT)),url=self.url+path.name,kind=kind,labels=labels,semantic=semantic,sha256=sha(path));self.assets.append(a)
  return f'\n![{alt}]({a["url"]})'
