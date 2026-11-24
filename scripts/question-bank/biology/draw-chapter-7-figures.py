#!/usr/bin/env python3
"""Original schematic assets; no external images, fonts, scripts or SVG links."""
from pathlib import Path
from html import escape
OUT = Path(__file__).resolve().parents[3] / 'content/question-bank/ssc/biology/chapter-7/assets'
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

body=text(80,95,'Front view: patient right is viewer left',20)
body+=rect(475,105,50,165,'#dbe7e9','#53787d',14)+text(555,150,'Trachea',23)
for y in range(125,260,23):body+=f'<path d="M480 {y} L520 {y}" stroke="#53787d" stroke-width="3"/>'
body+='<path d="M465 205 C380 130 240 210 225 450 Q340 510 460 455 Z" fill="#eed2d0" stroke="#926c69" stroke-width="3"/>'
body+='<path d="M535 205 C620 135 760 210 775 450 Q670 505 540 455 L560 340 L535 310 Z" fill="#eed2d0" stroke="#926c69" stroke-width="3"/>'
body+='<path d="M240 325 L460 325 M250 375 L460 405 M550 360 L762 300" fill="none" stroke="#926c69" stroke-width="3"/>'
body+='<path d="M500 260 L405 300 M500 260 L610 300 M405 300 L340 255 M405 300 L335 390 M610 300 L665 250 M610 300 L680 405" stroke="#53787d" stroke-width="15" fill="none" stroke-linecap="round"/>'
body+=text(45,185,'Right lung',22)+text(45,215,'3 lobes',20)+arrow(165,210,250,250)
body+=text(800,185,'Left lung',22)+text(800,215,'2 lobes',20)+arrow(800,225,735,250)
body+=text(60,400,'Bronchi',21)+arrow(165,390,393,305)
body+=text(790,400,'Smaller',20)+text(790,425,'branches',20)+arrow(785,380,682,398)
body+='<path d="M210 530 Q500 425 790 530" stroke="#6a9172" stroke-width="12" fill="none"/>'
body+=text(395,550,'Diaphragm',23)
save('respiratory-route.svg','Lungs and conducting airways: orientation guide','Front-view schematic, not to scale. Patient right lung is on viewer left with three lobes; patient left lung is on viewer right with two lobes and space for the heart. Trachea divides into two bronchi, then smaller branches lead toward alveoli. Diaphragm lies below. Pleura is described in the written stimulus but not separately drawn as a layer here.',body)
body=rect(90,110,820,150,'#e4eddd','#7c9570',35)+text(125,155,'ALVEOLAR AIR',25)+text(125,200,'O2 pressure higher than incoming blood',21)
body+=rect(90,285,820,20,'#f4e4bf','#a28d5c',2)+text(100,88,'Thin moist air–blood barrier (exaggerated thickness)',20)
body+=rect(90,365,820,120,'#e5e9f4','#7987a5',25)+text(110,465,'CAPILLARY BLOOD',23)
body+=arrow(325,215,325,425,'#a84f54')+text(350,390,'O2 → blood',21)
body+=arrow(690,425,690,220,'#3b7da6')+text(705,250,'CO2 → air',21)
body+=text(110,530,'CO2 pressure is higher in incoming blood than in alveolar air.',20)
save('alveolar-exchange.svg','Alveolar exchange: separate gradients','Alveolar air and capillary blood stay separated by a thin moist barrier. Oxygen diffuses down its own partial-pressure gradient from alveolus into blood; carbon dioxide diffuses down its own gradient from blood into alveolus. Arrows cross the barrier; they do not represent blood flowing into an air sac. Layer thickness is exaggerated.',body)
body=''
for x,y,w,h,label in [(55,100,420,80,'Diaphragm contracts and descends'),(540,100,390,80,'Thoracic / lung volume increases'),(540,260,390,80,'Alveolar pressure falls briefly'),(55,260,420,80,'Air moves inward via airways')]:
 body+=rect(x,y,w,h,'#e1ece7','#718f83')+text(x+18,y+47,label,21)
body+=arrow(480,140,535,140)+arrow(735,185,735,255)+arrow(535,300,480,300)
body+=text(65,415,'Pressure compared with atmosphere, not absolute zero.',23)
body+=text(65,465,'Pleural coupling links chest movement to lung expansion.',22)
body+=text(65,515,'Quiet expiration: relaxation + elastic recoil → outward airflow.',21)
save('inspiration-mechanism.svg','Inspiration: one causal chain','Diaphragm contraction moves it downward, increasing thoracic volume and expanding the lungs through pleural coupling. Alveolar pressure becomes slightly lower than atmospheric pressure, so air flows inward. Quiet expiration mainly follows relaxation and elastic recoil; forced expiration can recruit extra muscles. This flow map is not a pressure tracing.',body)
