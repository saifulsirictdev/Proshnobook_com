#!/usr/bin/env python3
"""Original schematic assets; no external images, fonts, scripts or SVG links."""
from pathlib import Path
from html import escape
OUT = Path(__file__).resolve().parents[3] / 'content/question-bank/ssc/biology/chapter-6/assets'
OUT.mkdir(parents=True, exist_ok=True)
INK = '#173d36'

def text(x, y, value, size=21, color=INK):
    return f'<text x="{x}" y="{y}" font-family="sans-serif" font-size="{size}" fill="{color}">{escape(value)}</text>'

def rect(x, y, w, h, fill, stroke=INK, radius=12):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}" stroke="{stroke}" stroke-width="2"/>'

def arrow(x, y, xx, yy, color=INK):
    # Hand-drawn arrowheads, avoiding external marker references.
    import math
    a = math.atan2(yy-y, xx-x)
    p = [(xx-12*math.cos(a-t), yy-12*math.sin(a-t)) for t in [.45, -.45]]
    return f'<path d="M{x} {y} L{xx} {yy} M{p[0][0]:.2f} {p[0][1]:.2f} L{xx} {yy} L{p[1][0]:.2f} {p[1][1]:.2f}" fill="none" stroke="{color}" stroke-width="3"/>'

def save(name, title, desc, body):
    result = f'<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="600" viewBox="0 0 1000 600" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc>'
    result += rect(1,1,998,598,'#f4faf7','#b2cbbf',18)
    result += text(30,45,title,27)
    result += body + text(30,575,'Original editorial schematic | not to scale | review draft',17,'#506b63') + '</svg>\n'
    (OUT / name).write_text(result)

body = rect(65,440,300,75,'#e4d8be','#9a8868')+text(90,485,'Soil water → root',23)
body += rect(175,195,95,220,'#d6e7ee','#577b8b')+text(325,300,'Xylem water column',24)
body += arrow(220,435,220,365,'#347cab')+arrow(220,340,220,240,'#347cab')
body += rect(70,95,420,80,'#dceccc','#69964c')+text(95,140,'Wet leaf surfaces',24)+arrow(220,195,220,180,'#347cab')
body += arrow(495,130,730,130,'#347cab')+text(535,105,'Water vapor',21)+text(750,138,'Air',24)
body += text(550,235,'Evaporation creates tension',23)+arrow(505,240,280,240)
body += text(420,360,'Cohesion: water ↔ water',23)+text(420,405,'Adhesion: water ↔ wall',23)
body += text(60,550,'Continuous water + strong conduit walls support upward flow.',22)
save('xylem-tension.svg','Water ascent: cohesion and tension','Soil water enters the root and rises through a continuous xylem water column. Water evaporates from wet leaf surfaces and leaves as vapor. Leaf evaporation creates tension transmitted through cohesive water; adhesion and strong conduit walls help maintain the pathway.',body)
body = ''
for x,y,w,h,label,color in [(50,460,300,65,'Body tissues','#e4e9e6'),(50,320,260,60,'Right atrium','#dce9f5'),(50,180,260,60,'Right ventricle','#dce9f5'),(370,85,260,65,'Lungs','#e1eddf'),(690,180,260,60,'Left atrium','#f5dede'),(690,320,260,60,'Left ventricle','#f5dede')]:
    body+=rect(x,y,w,h,color)+text(x+15,y+38,label,23)
body+=arrow(180,455,180,385,'#347cab')+text(205,425,'Venae cavae',18)
body+=arrow(180,315,180,245,'#347cab')+text(205,285,'Tricuspid',18)
body+=arrow(235,175,365,120,'#347cab')+text(40,105,'Pulmonary artery',18)
body+=arrow(635,120,760,175,'#ba5960')+text(730,105,'Pulmonary veins',18)
body+=arrow(815,245,815,315,'#ba5960')+text(840,285,'Mitral',18)
body+='<path d="M815 385 L815 495 L355 495" stroke="#ba5960" stroke-width="3" fill="none"/>'
body+=arrow(470,495,355,495,'#ba5960')+text(580,475,'Aorta',22)
body+=text(350,270,'Two separated sides',21)+text(355,305,'and two linked circuits',20)
body+=text(375,545,'Blue: lower O2 | red: higher O2 (schematic)',19)
save('double-circulation.svg','Human double circulation: functional route map','Body blood returns via venae cavae to right atrium, crosses tricuspid to right ventricle, and travels via pulmonary artery to lungs. Oxygen-rich blood returns via pulmonary veins to left atrium, crosses mitral to left ventricle and exits via aorta to body. This is a route map, not anatomical chamber positioning.',body)
body=text(50,105,'A: artery',25)+text(405,105,'B: vein',25)+text(755,105,'C: capillary',25)
body+=rect(50,160,280,285,'#e3b4af','#9e6662',70)+rect(115,210,150,185,'#fff9f7','#9e6662',50)
body+=rect(395,160,285,285,'#d8e4ef','#718aa5',70)+rect(417,182,241,241,'#f8fcff','#718aa5',58)
body+='<path d="M420 265 Q475 300 530 320 M655 265 Q600 300 545 320" fill="none" stroke="#718aa5" stroke-width="8"/>'
body+=rect(795,160,80,285,'#f2e3bd','#aa986e',5)+rect(803,160,64,285,'#fffdf7','#aa986e',1)
body+=text(55,495,'Thick elastic wall',21)+text(400,495,'Thinner wall + valve',21)+text(735,495,'Thin exchange wall',20)
body+=text(75,545,'Schematic longitudinal sections; relative wall patterns, not exact sizes.',21)
save('vessel-functions.svg','Three vessel types: form supports function','A has a thick elastic muscular wall for arterial pressure. B has a thinner wall, wider lumen and a valve supporting venous return. C has a very thin endothelial exchange barrier. Not all veins have valves and exact dimensions vary; diagrams are not to scale.',body)
