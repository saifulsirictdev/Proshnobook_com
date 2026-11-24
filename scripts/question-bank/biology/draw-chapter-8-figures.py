#!/usr/bin/env python3
"""Original explanatory schematics, not anatomical scale or clinical instructions."""
from pathlib import Path
from html import escape
import math
OUT = Path(__file__).resolve().parents[3] / 'content/question-bank/ssc/biology/chapter-8/assets'
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
body=path('M520 115 C390 55 210 125 200 320 C190 520 355 595 520 530 C595 500 595 420 510 390 C445 365 445 275 510 250 C595 220 595 150 520 115', '#9c666a',4,'#edd1cd')
body+=path('M495 155 C370 105 245 170 240 320 C235 470 360 545 495 493 C530 475 530 440 480 420 C385 375 385 260 480 220 C530 200 530 170 495 155','#b6887f',2,'#f7e6d4')
for d in ['M285 235 L370 190 L405 280 Z','M263 290 L263 370 L380 330 Z','M285 420 L365 478 L410 395 Z']:
    body+=path(d,'#a06c64',2,'#d59c89')
# Stylized branched calyces connect each papilla to the pelvis, not straight to ureter.
body+=path('M405 280 L455 305 L490 330 M380 330 L490 330 M410 395 L455 355 L490 330','#ad9146',14)
body+=path('M485 300 Q530 285 562 320 L575 345 L542 385 Q515 365 485 360 Z','#ad9146',2,'#ead69b')
body+=path('M551 365 Q595 410 585 540','#ad9146',18)+arrow(585,470,585,520,'#856a2d')
body+=text(55,125,'Renal capsule',22)+arrow(195,135,237,200)
body+=text(650,145,'A  Cortex',24)+arrow(640,150,545,170)
body+=text(650,220,'B  Medulla: pyramids',23)+arrow(640,225,320,254)
body+=text(650,305,'Calyces (branched cups)',22)+arrow(640,312,454,306)
body+=text(650,390,'C  Renal pelvis',24)+arrow(640,380,530,345)
body+=text(650,490,'Ureter → bladder',23)+arrow(640,480,588,452)
body+=text(55,592,'Papilla → minor / major calyces → pelvis → ureter',23)
save('kidney-section.svg','Kidney section: regions and drainage','A is cortex beneath the renal capsule. B is medulla with stylized pyramids. Pyramid tips (papillae) drain via branching minor and major calyces to C, the renal pelvis, then ureter. Blood vessels are omitted to emphasize urine drainage. Calyces and tissue boundaries are simplified, not to scale.',body)
body=rect(45,100,280,160,'#e5e9ef')+text(62,128,'Q  Bowman capsule',21)
body+=path('M85 172 C90 125 170 145 130 190 C90 235 195 230 182 175 C172 125 245 162 202 210 C180 237 252 235 258 195','#b95361',7)
body+=text(80,247,'P  Glomerulus',21)
body+=arrow(45,175,83,175,'#b95361')+text(40,87,'Afferent blood',19)
body+=path('M256 190 L300 190 L300 90 L440 90','#b95361',5)+arrow(375,90,438,90,'#b95361')+text(475,96,'Efferent → peritubular capillaries',21)
body+=arrow(277,218,330,285,'#b58a29')
body+=rect(335,280,155,70,'#f5e5b9')+text(365,323,'PCT',25)
body+=path('M490 315 L550 315 L550 490 Q600 555 650 490 L650 315 L705 315','#b58a29',9)
body+=arrow(550,365,550,440,'#9b7826')+arrow(650,445,650,370,'#9b7826')
body+=rect(705,280,135,70,'#f5e5b9')+text(735,323,'DCT',25)+arrow(840,315,910,315,'#b58a29')
body+=rect(915,265,60,290,'#ead69b')+arrow(945,390,945,510,'#9b7826')
body+=text(350,560,'Loop of Henle',23)+text(855,590,'Collecting duct',22)
body+=path('M35 385 L505 385 M685 385 L885 385','#a6b5a9',2)
body+=text(40,365,'Cortex',22)+text(40,420,'Medulla (below guide)',22)
body+=text(45,610,'Gold arrows: tubular fluid. Red: blood. No whole-blood mixing into the tubule.',21)
save('nephron-pathways.svg','Nephron: separate blood and tubular routes','P is the glomerular capillary tuft within Q, Bowman capsule. Blood enters by afferent and exits by efferent arteriole toward peritubular capillaries (not fully drawn). Filtrate enters proximal convoluted tubule, descending and ascending Henle loop, distal convoluted tubule, then collecting duct. A guide marks cortical and medullary regions; geometry is simplified. Gold arrows mark tubular fluid, not whole blood.',body)
body=rect(70,155,930,120,'#eed7d9')+text(95,195,'BLOOD inside hollow fibers (one expanded channel)',23)
body+=text(95,220,'Cells / most large proteins retained in blood',20)+arrow(135,240,930,240,'#b95361')
body+=rect(70,395,930,135,'#d9e9ef')+text(95,500,'DIALYSATE outside fibers — separate circuit',23)
body+=arrow(930,435,135,435,'#3b7da6')
body+=rect(70,305,930,45,'#ede2c4')+text(90,335,'Selective membrane (enlarged)',22)
body+=arrow(710,260,710,415,'#67794d')+text(750,382,'Urea',23)
body+=text(85,110,'Higher blood urea → lower dialysate urea: diffusion down a gradient',23)
body+=text(85,580,'Excess fluid removal is controlled separately by pressure (ultrafiltration).',23)
save('dialyzer-exchange.svg','Hemodialyzer: exchange without bulk mixing','An expanded hollow-fiber wall separates blood from dialysate; this is not an access or assembly diagram. Blood and dialysate flow in opposite directions. Urea crosses the intact selective membrane down its concentration gradient while cells and most large proteins stay in blood. Controlled excess water removal uses pressure; safe composition and monitoring are clinical tasks. Channel shapes and layer thickness are not to scale.',body)
