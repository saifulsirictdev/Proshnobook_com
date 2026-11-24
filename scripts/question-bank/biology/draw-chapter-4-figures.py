#!/usr/bin/env python3
"""Original schematic assets; no external images, fonts, scripts or SVG links."""
from pathlib import Path
from html import escape
OUT = Path(__file__).resolve().parents[3] / 'content/question-bank/ssc/biology/chapter-4/assets'
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

body = rect(35,90,930,435,'#e9f4dc','#69964c',65)
body += text(62,127,'Chloroplast',23)
body += rect(85,205,265,215,'#d3e9c6','#649d5c',25)
for y in [230,260,290,320]:
    body += rect(115,y,200,20,'#5b9c56','#316d3d',10)
body += text(102,390,'P: thylakoid stack',20)
body += text(650,180,'Q: stroma',24)
body += rect(650,220,245,165,'#fff2cc','#b69b49',25)
body += text(675,270,'Calvin cycle',23) + text(675,310,'CO2 fixation',21) + text(675,348,'+ regeneration',20)
body += arrow(350,255,640,255) + text(385,236,'ATP + NADPH',22)
body += arrow(650,355,360,355) + text(365,390,'ADP + Pi + NADP+',19)
body += text(102,160,'Light') + arrow(160,170,185,220,'#bd8600')
body += text(650,440,'CO2 in') + arrow(695,425,695,390)
body += arrow(895,300,940,300) + text(785,485,'Organic products',19)
body += text(90,465,'H2O split: electrons, H+, O2',19)
save('chloroplast-stages.svg','Two linked systems in a chloroplast','P labels a stack of thylakoids. Q labels stroma. ATP and NADPH go from light reactions to the Calvin cycle; ADP, Pi and NADP+ return. CO2 enters the cycle.',body)

body = text(62,100,'Before iodine test',24) + text(564,100,'After iodine test',24)
leaf = 'M230 150 C65 190 65 410 230 460 C400 410 400 190 230 150 Z'
body += f'<path d="{leaf}" fill="#8cba62" stroke="{INK}" stroke-width="3"/>'
body += rect(85,265,290,95,'#273b39','#273b39',0)
body += text(115,305,'Opaque band',22,'white') + text(103,335,'on both surfaces',19,'white')
body += arrow(230,460,230,510) + text(140,540,'Initial starch reduced',18)
leaf2 = 'M730 150 C565 190 565 410 730 460 C900 410 900 190 730 150 Z'
body += f'<path d="{leaf2}" fill="#252756" stroke="{INK}" stroke-width="3"/>'
body += f'<path d="M607 265 L853 265 Q863 310 850 360 L610 360 Q597 310 607 265Z" fill="#d7a15c" stroke="{INK}" stroke-width="2"/>'
body += text(653,230,'Blue-black',21,'white') + text(658,320,'Brown band',21) + text(655,405,'Blue-black',21,'white')
body += arrow(398,300,550,300) + text(414,275,'Prepared',18) + text(412,337,'leaf test',18)
body += text(550,505,'Starch detected in exposed regions',21)
body += text(40,135,'Same leaf: middle shielded; ends exposed to light',19)
save('light-starch-test.svg','Light exclusion and starch evidence','An opaque band covers both surfaces of the middle of a leaf during light exposure. After a teacher-prepared iodine test the exposed ends turn blue-black but the previously shielded middle stays brown.',body)

body = text(50,100,'Intermembrane space: higher H+ concentration',23)
body += rect(35,210,930,70,'#d8e3f0','#7d96b0',4)
body += text(55,340,'Matrix (lower H+)',21)
body += rect(235,180,300,130,'#bcd8ef','#416b8a',17) + text(267,232,'Electron transport',22) + text(290,270,'and H+ pumping',20)
body += rect(725,170,170,150,'#ffe4ac','#b88c32',20) + text(759,226,'ATP',24) + text(744,266,'synthase',23)
body += arrow(385,180,385,125,'#416b8a') + text(405,145,'H+ pumped out',19)
body += arrow(810,120,810,170,'#b88c32') + arrow(810,320,810,375,'#b88c32') + text(855,155,'H+',24)
body += text(650,410,'ADP + Pi') + arrow(770,402,830,402) + text(845,410,'ATP',23)
body += text(55,380,'NADH / FADH2') + arrow(250,375,310,310)
body += text(390,370,'O2: final acceptor',20) + text(420,407,'H2O formed',20)
body += rect(65,460,865,65,'#e6f0e7','#91b29b',10) + text(88,500,'Electron energy → proton gradient → ATP synthesis',25)
save('respiratory-coupling.svg','Respiratory energy coupling across the inner membrane','Electron transport uses carrier electrons to pump H+ from the matrix to the intermembrane space. H+ returns through ATP synthase into the matrix, coupled to ATP formation. Oxygen is the final electron acceptor.',body)
