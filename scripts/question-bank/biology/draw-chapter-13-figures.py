#!/usr/bin/env python3
"""Original ecological teaching schematics; safe static SVG, no remote assets."""
from html import escape
from pathlib import Path
OUT=Path(__file__).resolve().parents[3]/'content/question-bank/ssc/biology/chapter-13/assets'
OUT.mkdir(parents=True,exist_ok=True)
def text(x,y,s,size=20):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="#183449">{escape(s)}</text>'
def box(x,y,w,h,label):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="#edf6f2" stroke="#35614f" stroke-width="2"/>'+text(x+15,y+h/2+7,label)
def arrow(x1,y1,x2,y2):
    from math import atan2,cos,sin
    a=atan2(y2-y1,x2-x1)
    x3,y3=x2-12*cos(a-.45),y2-12*sin(a-.45)
    x4,y4=x2-12*cos(a+.45),y2-12*sin(a+.45)
    return f'<path d="M{x1} {y1} L{x2} {y2} M{x3:.1f} {y3:.1f} L{x2} {y2} L{x4:.1f} {y4:.1f}" fill="none" stroke="#234e67" stroke-width="3"/>'
def save(name,title,desc,body):
    s=f'<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="700" viewBox="0 0 1000 700" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc><rect width="1000" height="700" fill="white"/><g font-family="sans-serif">{text(30,45,title,27)}{body}</g></svg>\n'
    (OUT/name).write_text(s)
b=text(30,90,'Arrows: food to consumer; only the stated links are shown',20)
for spec in [(40,300,160,65,'Grass'),(300,180,180,65,'Grasshopper'),(310,430,150,65,'Mouse'),(620,180,150,65,'Frog'),(820,300,150,65,'Snake'),(620,500,150,65,'Owl')]:b+=box(*spec)
for p in [(200,315,300,225),(200,350,310,450),(480,212,620,212),(770,220,840,300),(460,450,820,355),(460,475,620,530)]:b+=arrow(*p)
b+=text(30,645,'Linked chains share resources; the diagram is not every possible link.',19)
save('food-web.svg','A small grassland food web','Grass feeds grasshopper and mouse; grasshopper feeds frog; frog and mouse feed snake; mouse feeds owl. Arrows point toward consumers.',b)
b=text(30,90,'Illustrative 10% transfer model; not a universal measured rate',20)
for x,y,w,label in [(365,145,270,'Snake: 100 kJ'),(280,245,440,'Frog: 1,000 kJ'),(195,345,610,'Grasshopper: 10,000 kJ'),(110,445,780,'Grass: 100,000 kJ')]:b+=box(x,y,w,70,label)
for y in [245,345,445]:b+=arrow(500,y-5,500,y-25)
b+=text(35,565,'Three transfers from grass to snake: 100,000 x 0.1 x 0.1 x 0.1',20)
b+=text(35,605,'Other paths include uneaten matter, waste and respiratory heat.',20)
b+=text(35,650,'Box width is illustrative, not an exact area or biomass scale.',19)
save('energy-pyramid.svg','Energy through four trophic levels','Grass 100000 kilojoules, grasshopper 10000, frog 1000, snake 100 under an assumed ten percent transfer at every step. Widths are not to scale.',b)
b=text(30,90,'Simplified nitrogen transformations; enrichment, not all processes',20)
for spec in [(50,150,190,70,'Atmospheric N2'),(390,150,180,70,'Plant N'),(720,150,225,70,'Organic remains'),(720,405,225,70,'Ammonium'),(390,405,180,70,'Nitrite'),(50,405,190,70,'Nitrate')]:b+=box(*spec)
b+=arrow(240,185,390,185)+text(255,145,'Fixation*',18)
b+=arrow(570,185,720,185)+text(585,165,'Death/waste',17)
b+=arrow(832,220,832,405)+text(640,310,'Ammonification',18)
b+=arrow(720,440,570,440)+text(580,410,'Nitrification',17)
b+=arrow(390,440,240,440)+text(250,410,'Nitrification',17)
b+=arrow(150,400,430,225)+text(235,310,'Uptake',18)
b+=arrow(95,400,95,225)+text(30,515,'Left upward arrow: denitrification',18)
b+=text(30,560,'*Fixing microbes convert N2; fixed nitrogen can enter plant nutrition.',19)
b+=text(30,600,'The N2-to-plant arrow summarises a microbial pathway, not direct',19)
b+=text(30,630,'N2 absorption by most plants. Animal feeding steps are omitted.',19)
save('nitrogen-pathways.svg','Selected pathways in the nitrogen cycle','Atmospheric nitrogen enters plant nutrition through fixing microbes. Plant remains yield ammonium, nitrification produces nitrite then nitrate, plants take up nitrate. Denitrification returns gaseous nitrogen. Simplified.',b)
b=text(30,90,'A possible nutrient-enrichment pathway, not every cause of fish death',19)
labels=['Excess N / P input','Algal overgrowth','More organic remains','Decomposition + respiration','Dissolved oxygen can fall','Fish may become stressed']
for i,label in enumerate(labels):
    y=120+i*80
    b+=box(245,y,520,55,label)
    if i<5:b+=arrow(500,y+57,500,y+77)
b+=text(30,660,'Measure oxygen and other water-quality factors; reduce nutrient sources.',18)
save('nutrient-enrichment.svg','Nutrient enrichment and oxygen stress','Excess nitrogen and phosphorus can promote algal growth. Dead organic matter and respiration can increase oxygen demand; oxygen may fall and stress fish. A possible pathway requiring measurement.',b)
print('Wrote four chapter-13 static SVG schematics')
