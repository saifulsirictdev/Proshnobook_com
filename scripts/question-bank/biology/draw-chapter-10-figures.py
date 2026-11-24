#!/usr/bin/env python3
"""Original explanatory schematics, not anatomical scale or clinical instructions."""
from pathlib import Path
from html import escape
import math
OUT = Path(__file__).resolve().parents[3] / 'content/question-bank/ssc/biology/chapter-10/assets'
OUT.mkdir(parents=True, exist_ok=True)
INK = '#173d36'
def text(x,y,s,size=21,color=INK):
    return f'<text x="{x}" y="{y}" font-family="sans-serif" font-size="{size}" fill="{color}">{escape(s)}</text>'
def path(d,color=INK,w=3,fill='none'):
    return f'<path d="{d}" stroke="{color}" stroke-width="{w}" fill="{fill}" stroke-linecap="round" stroke-linejoin="round"/>'
def rect(x,y,w,h,fill):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="{fill}" stroke="{INK}" stroke-width="2"/>'
def arrow(x,y,xx,yy,color=INK):
    a=math.atan2(yy-y,xx-x)
    p=[(xx-11*math.cos(a+t),yy-11*math.sin(a+t)) for t in [.45,-.45]]
    return path(f'M{x} {y} L{xx} {yy} M{p[0][0]} {p[0][1]} L{xx} {yy} L{p[1][0]} {p[1][1]}',color)
def save(name,title,desc,body):
    s=f'<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="680" viewBox="0 0 1100 680" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc>'
    s+=rect(1,1,1098,678,'#f4faf7')+text(30,45,title,27)+body
    s+=text(30,650,'Original editorial schematic | not to scale | review draft',18)+'</svg>\n'
    (OUT/name).write_text(s)
# One educational concept per figure; all attachment geometries simplified.
body=text(55,115,'Light from left',24)+arrow(110,170,240,170,'#bb8b25')+arrow(110,250,300,250,'#bb8b25')
body+=rect(365,480,260,110,'#d7e9db')+path('M400 480 C395 355 335 245 255 195 L280 165 C365 225 445 350 450 480 Z','#477f61',4,'#cae5ce')
body+=text(510,155,'Tip detects light direction',22)+arrow(500,165,278,180)
body+=text(530,260,'Shaded side:',23)+text(530,295,'more auxin in this shoot model',21)+arrow(520,300,395,320)
body+=text(530,380,'More elongation on shaded side',21)+text(530,415,'→ shoot bends toward light',22)
body+=text(70,620,'Written model only: root response and dose sensitivity differ; no chemical recipe.',20)
save('shoot-phototropism.svg','Shoot phototropism: unequal growth produces bending','Light arrives from viewer left. The shoot bends toward the light, while the shaded right-hand side is on the outside of the bend and elongates more in this simplified auxin model. The tip detects light; the response occurs in the elongation zone below it. The base is fixed. This is a selected shoot mechanism, not a claim about every organ, auxin dose or plant species.',body)
body=path('M210 200 L170 140 M180 155 L125 155 M175 150 L170 105 M210 240 L135 265 M165 255 L130 300 M210 280 L175 325',INK,4)
body+=path('M210 185 Q290 155 315 230 Q335 295 255 310 Q200 300 210 185 Z',INK,3,'#dbe8de')+path('M245 225 Q270 205 285 230 Q295 255 270 265 Q245 265 245 225 Z',INK,2,'#c1d4e7')
body+=path('M315 245 L840 245 M840 245 L895 200 M840 245 L895 290',INK,5)
for x in [360,475,590,705]:body+=rect(x,221,85,48,'#e1cda9')
body+=text(55,95,'A  Dendrites',23)+arrow(190,110,175,140)+text(305,145,'B  Cell body / nucleus',22)+arrow(360,155,278,225)
body+=text(480,355,'C  Axon + myelin',22)+arrow(560,335,550,248)
body+=text(600,105,'D  Node of Ranvier',22)+arrow(630,120,579,242)
body+=text(820,355,'E  Terminals',22)+arrow(885,330,890,285)
body+=arrow(350,395,795,395,'#4c8290')+text(420,430,'Typical signal output direction',22)
body+=rect(90,470,920,140,'#edf2f0')+text(115,505,'Chemical synapse:',22)+text(115,545,'terminal releases transmitter → cleft → receptor on next cell',22)+text(115,580,'Not direct fusion; signal termination also matters.',21)
save('neuron-signaling.svg','Neuron structure and chemical communication','Simplified multipolar neuron. A dendrites, B soma containing nucleus, C axon wrapped in separate myelin segments, D unmyelinated gap or node between segments, E axon terminals. General output arrow runs left to right. Separate written inset describes a chemical synapse: transmitter release, diffusion across cleft, receptor response and termination. Not all neurons have this shape or myelin, and not every input produces an output spike.',body)
body=path('M250 355 Q165 275 230 180 Q265 105 390 130 Q485 90 565 155 Q675 190 635 305 Q610 380 510 365 L350 375 Z',INK,4,'#cddfda')
body+=path('M510 365 Q550 355 590 400 L570 445 Q505 438 495 400 Z',INK,3,'#b9cedf')
body+=path('M520 330 L480 420 L500 450 L480 500 L450 550 L422 535 L451 477 L455 440 L438 410 L478 323 Z',INK,3,'#dfcbb8')
for d in ['M260 225 Q300 180 340 225 Q370 175 410 215','M300 285 Q355 245 400 285 Q445 245 485 275','M450 165 Q505 185 505 225','M555 220 Q605 250 570 300']:
 body+=path(d,'#5f8d7c',3)
body+=text(720,160,'Cerebrum',24)+arrow(705,170,580,210)
body+=text(720,275,'Cerebellum',24)+arrow(705,285,567,404)
body+=text(720,390,'Brainstem',24)+arrow(705,400,486,432)
body+=text(720,495,'Spinal cord',24)+arrow(705,500,465,521)
body+=text(70,585,'Brainstem = midbrain + pons + medulla; functions work in networks.',21)
body+=text(70,620,'Regional side-view outline only; not a surgical section or scale map.',21)
save('brain-regions.svg','Major CNS regions: selected side-view outline','An original simplified lateral regional map with front to viewer left. Cerebrum is the large upper mass; cerebellum is the small posterior lower mass; brainstem is the descending connection to spinal cord. Pons and medulla are not separately resolved. This outline distinguishes regions and continuity, not detailed anatomy, internal nuclei or exact localization of every function. Hypothalamus and pituitary are deliberately not plotted on this lateral outline.',body)
body=rect(365,115,380,420,'#dde8e4')+text(410,155,'Spinal integration',23)
for x,y,w,h,col,label in [(45,195,230,75,'#d4e8f1','Skin receptor'),(815,420,230,75,'#efd4ce','Muscle effector')]:body+=rect(x,y,w,h,col)+text(x+18,y+44,label,22)
body+=arrow(275,232,425,232,'#4084a0')+text(50,320,'Sensory / afferent',22,'#4084a0')
body+=rect(425,205,240,65,'#bcdce7')+text(451,245,'Sensory input',21)
body+=arrow(545,275,545,330)+rect(425,335,240,65,'#dbd8ea')+text(454,375,'Relay circuit',21)
body+=arrow(545,405,545,450)+rect(425,455,240,65,'#e6bfb5')+text(453,495,'Motor output',21)
body+=arrow(670,485,810,460,'#ad6b5e')+text(780,550,'Efferent pathway',22,'#ad6b5e')
body+=arrow(685,220,900,130,'#4084a0')+text(780,95,'Information to brain',21)
body+=text(65,595,'Withdrawal model: local response can begin before conscious decision.',21)+text(65,625,'Some reflexes use brainstem; not all require this relay pattern.',21)
save('withdrawal-reflex.svg','Withdrawal reflex: input, integration, output','Functional flow map, not a spinal-cord anatomical cross-section. Blue arrow carries sensory information from skin receptor into spinal integration. Relay circuit leads to motor output; red arrow carries the efferent signal to muscle effector. A branch carries information toward the brain. Only a selected withdrawal pathway is shown; brain modulation, multiple muscles and reciprocal inhibition are omitted. Not all reflexes are spinal or polysynaptic. No heat or needle testing is needed.',body)
body=rect(90,115,350,85,'#d5e3ed')+text(125,165,'Hypothalamic signal',24)
body+=arrow(265,205,265,270)+rect(90,275,350,85,'#d5e8de')+text(125,325,'Pituitary: TSH',24)
body+=arrow(265,365,265,430)+rect(90,435,350,85,'#ead9c3')+text(125,485,'Thyroid: T3 / T4',24)
body+=arrow(445,478,740,478)+text(760,465,'Target tissues',24)+text(760,505,'Metabolic effects',22)
body+=path('M570 475 L570 155 L455 155 M455 135 L455 175', '#a66368',4)
body+=path('M570 315 L455 315 M455 295 L455 335','#a66368',4)
body+=text(620,220,'Negative feedback',24,'#a66368')+text(620,260,'More thyroid hormone can',21)+text(620,295,'reduce upstream stimulation.',21)
body+=text(75,590,'Arrow = stimulation / signal route. Flat bar = inhibition.',21)+text(75,625,'Normal control model, not a diagnostic algorithm or hormone-dose guide.',21)
save('thyroid-feedback.svg','Thyroid-axis feedback: a normal control model','Functional endocrine-axis chart. Hypothalamic stimulation acts on pituitary TSH, which stimulates thyroid T3 and T4 output. Thyroid hormones act on target tissues and feed back to reduce hypothalamic and pituitary stimulation; flat bars indicate inhibition. The feedback line starts from thyroid hormone output, not from the target-tissue effect label. This selected normal-axis model is not a body location map or clinical diagnostic/dose algorithm.',body)
