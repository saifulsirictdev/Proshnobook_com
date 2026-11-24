#!/usr/bin/env python3
"""Original explanatory diagrams; no borrowed source images or clinical directions."""
from pathlib import Path
from html import escape
import math
OUT=Path(__file__).resolve().parents[3]/'content/question-bank/ssc/biology/chapter-11/assets'
INK='#173d36'
def text(x,y,s,size=22):
    return f'<text x="{x}" y="{y}" font-family="sans-serif" font-size="{size}" fill="{INK}">{escape(s)}</text>'
def path(d,fill='none',color=INK,w=3):
    return f'<path d="{d}" fill="{fill}" stroke="{color}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>'
def rect(x,y,w,h,fill='#e5f0eb'):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="14" fill="{fill}" stroke="{INK}" stroke-width="2"/>'
def oval(x,y,rx,ry,fill):
    return path(f'M{x-rx} {y} a{rx} {ry} 0 1 0 {rx*2} 0 a{rx} {ry} 0 1 0 {-rx*2} 0',fill)
def arrow(x,y,xx,yy):
    a=math.atan2(yy-y,xx-x); pts=[(xx-12*math.cos(a+t),yy-12*math.sin(a+t)) for t in [.45,-.45]]
    return path(f'M{x} {y} L{xx} {yy} M{pts[0][0]} {pts[0][1]} L{xx} {yy} L{pts[1][0]} {pts[1][1]}')
def save(name,title,desc,body):
    OUT.mkdir(parents=True,exist_ok=True)
    s=f'<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="720" viewBox="0 0 1100 720" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc>'
    s+=rect(1,1,1098,718,'#f7faf8')+text(30,48,title,27)+body
    s+=text(30,693,'Original editorial schematic | not to scale | review draft',18)+'</svg>\n'
    (OUT/name).write_text(s)
# Flower section. Ovules are inside the ovary; anthers remain outside it.
b=path('M450 490 Q225 470 185 235 Q320 220 438 420','#f3dbe4')
b+=path('M500 490 Q725 470 765 235 Q630 220 512 420','#f3dbe4')
b+=path('M450 510 Q335 560 265 495 Q355 475 445 485','#c9dfc8')+path('M500 510 Q620 560 690 495 Q600 475 505 485','#c9dfc8')
b+=rect(453,510,44,115,'#d5dfc8')
b+=path('M438 340 L438 173 Q413 163 428 145 Q475 130 522 145 Q537 163 512 173 L512 340 Q570 375 550 458 Q535 515 475 515 Q415 515 400 458 Q380 375 438 340 Z','#d4e4db')
for x,y in [(438,407),(510,420),(463,460)]:b+=oval(x,y,15,23,'#f8f2d3')
for x,y in [(320,250),(625,250)]:b+=path(f'M{x} 470 L{x} {y+15}')+oval(x,y,35,18,'#e7ca86')
b+=text(680,130,'A  Stigma')+arrow(665,137,520,155)
b+=text(50,160,'B  Anther')+arrow(170,170,301,246)
b+=text(800,365,'C  Ovary')+arrow(790,375,553,390)
b+=text(800,465,'D  Ovule')+arrow(790,470,510,427)
b+=text(60,590,'Sepal')+arrow(240,575,310,510)+text(650,590,'Style: path to the ovary',20)+text(50,345,'Petal')+arrow(145,350,245,365)
save('flower-section.svg','Flower: reproductive structures in section','A stigma above the style; B anthers on filaments outside C ovary; D ovules within the ovary. Petals and sepals surround the reproductive structures, all supported by the receptacle. This is a generalized section, not a species-identification drawing. Ovules become seeds, whereas the ovary wall contributes the pericarp.',b)
# Seven-cell, eight-nucleate embryo sac: two synergids + egg + central + three antipodals.
b=oval(400,350,185,242,'#e6eee8')+oval(400,350,142,207,'#fbf8ec')
for x,y in [(345,198),(400,180),(455,198)]:b+=oval(x,y,24,28,'#dfcddc')+oval(x,y,5,6,INK)
for x,y in [(347,504),(453,504)]:b+=oval(x,y,25,38,'#cbdde8')+oval(x,y,5,6,INK)
b+=oval(400,502,26,31,'#efd19c')+oval(400,502,6,7,INK)
for x in [381,419]:b+=oval(x,350,12,12,'#c1d0b0')
b+=text(45,650,'Micropyle end below; chalazal end above. Central cell contains two polar nuclei.',20)
b+=text(650,160,'D  Three antipodal cells')+arrow(635,172,477,198)
b+=text(650,295,'C  Two polar nuclei')+arrow(635,306,436,350)
b+=text(650,435,'B  Two synergids')+arrow(635,445,477,500)
b+=text(650,550,'A  Egg cell')+arrow(635,560,414,515)
b+=text(50,95,'Typical model before polar-nuclear fusion',20)
save('embryo-sac.svg','Embryo sac: cell identities and positions','Typical angiosperm embryo-sac model before fusion of the polar nuclei: A egg and B two synergids at the lower micropylar end, C two polar nuclei in one central cell, D three antipodal cells at the upper chalazal end. Seven cells contain eight nuclei. One sperm fuses with the egg to form a 2n zygote; the second fuses with the central cell containing the two polar nuclei to form the usual 3n primary endosperm nucleus. Species variants exist.',b)
# Functional block diagram, deliberately not anatomical silhouette or metric timeline.
b=text(45,100,'Functional sequence only: positions and distances are not anatomical.',20)
for x,y,w,h,label in [(50,145,240,105,'Ovary: oocyte'),(400,145,590,105,'Oviduct: sperm + oocyte → zygote'),(400,345,590,100,'Cleavage → morula → blastocyst'),(400,535,590,100,'Uterine lining: implantation')]:
    b+=rect(x,y,w,h)+text(x+20,y+60,label,22)
b+=arrow(295,197,390,197)+arrow(700,260,700,330)+arrow(700,455,700,520)
b+=text(50,315,'Ovulation releases',20)+text(50,347,'the oocyte.',20)+text(50,470,'Fertilization and',20)+text(50,502,'implantation differ.',20)
save('human-development-route.svg','Human reproduction: from gametes to implantation','Functional flow diagram. An oocyte is released from the ovary and enters the oviduct, where fertilization normally creates the zygote. Cleavage produces a morula and then blastocyst while the developing conceptus travels to the uterus. Implantation occurs in the uterine endometrium. This is not an anatomical map, numerical timeline or clinical diagnostic diagram.',b)
# Clearly separate blood compartments. Arrows show substances, not shared blood flow.
b=rect(45,120,400,450,'#f4dce1')+rect(655,120,400,450,'#dce8f4')+rect(475,140,150,410,'#e6eadf')
b+=text(70,160,'Maternal blood',25)+text(680,160,'Fetal blood',25)+text(487,195,'Exchange',20)+text(487,225,'surface',20)
b+=text(85,250,'Oxygen + nutrients',22)+arrow(240,285,840,285)
b+=text(705,380,'CO2 + wastes',22)+arrow(840,420,240,420)
b+=text(75,510,'Maternal circulation',20)+text(680,510,'Cord vessels connect',20)+text(680,540,'fetus and placenta',20)
b+=text(65,620,'Separate circulations: substances cross; blood does not normally mix directly.',21)
save('placental-exchange.svg','Placenta: exchange between separate circulations','Functional model of placental exchange, not a histological section. Maternal and fetal blood occupy distinct compartments separated by an exchange surface. Oxygen and nutrients move toward the fetus; fetal carbon dioxide and some metabolic wastes move toward the mother. Cord vessels belong to the fetal circulation. Arrows represent selected substances, not direct mixing of the blood streams. Placenta also produces hormones and is not an absolute barrier to medicines or infections.',b)
print('Wrote 4 original chapter-11 diagrams')
