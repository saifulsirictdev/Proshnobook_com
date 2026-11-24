#!/usr/bin/env python3
"""Original conceptual diagrams, not operational laboratory protocols."""
from html import escape
from pathlib import Path
OUT=Path(__file__).resolve().parents[3]/'content/question-bank/ssc/biology/chapter-14/assets'
OUT.mkdir(parents=True,exist_ok=True)
def text(x,y,s,size=20):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="#183449">{escape(s)}</text>'
def box(x,y,w,h,label):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="#edf6f2" stroke="#35614f" stroke-width="2"/>'+text(x+15,y+h/2+7,label)
def arrow(x1,y1,x2,y2):
    return f'<path d="M{x1} {y1} L{x2} {y2} M{x2-7} {y2-12} L{x2} {y2} L{x2+7} {y2-12}" fill="none" stroke="#234e67" stroke-width="3"/>'
def save(name,title,desc,body):
    (OUT/name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="700" viewBox="0 0 1000 700" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc><rect width="1000" height="700" fill="white"/><g font-family="sans-serif">{text(30,45,title,27)}{body}</g></svg>\n')
b=text(30,90,'Conceptual route; not every species needs a callus stage',20)
for i,label in enumerate(['Selected healthy source / explant','Appropriate controlled culture','Shoot and root development','Gradual acclimatization','Suitable external growing conditions']):
    y=125+i*95;b+=box(220,y,580,65,label)
    if i<4:b+=arrow(500,y+67,500,y+92)
b+=text(30,655,'Clean surfaces do not prove virus freedom; test plant health separately.',19)
save('tissue-culture-route.svg','Plant tissue culture: a simplified route','Explant, controlled culture, shoot and root development, gradual acclimatization, external growing conditions. Callus is not mandatory in every route; plant health needs separate checks.',b)
b=text(30,90,'Conceptual information flow; no laboratory operating conditions',20)
b+=box(40,130,400,65,'Donor DNA: target region')+box(560,130,400,65,'Vector DNA')
b+='<path d="M240 195 L500 260 M760 195 L500 260" fill="none" stroke="#234e67" stroke-width="3"/>'
for i,label in enumerate(['Compatible DNA ends + ligase','Recombinant DNA construct','Host uptake and appropriate checks','Expression and product quality checks']):
    y=265+i*85;b+=box(210,y,650,58,label)
    if i<3:b+=arrow(500,y+60,500,y+82)
b+=text(30,655,'Marker selection alone does not prove the correct insert or active protein.',19)
save('recombinant-dna-route.svg','Recombinant DNA: components and checks','Target DNA and vector are joined in a compatible construct; host uptake, construct verification, expression and product quality are distinct checks. Not a protocol.',b)
b=text(30,90,'Different questions require different evidence',20)
for i,label in enumerate(['DNA: is the intended sequence present?','Protein: is the intended product expressed?','Activity: does the product function?','Field / use: does it work in context?','Safety / approval: separate applicable review']):
    y=125+i*95;b+=box(175,y,740,65,label)
    if i<4:b+=arrow(500,y+67,500,y+92)
b+=text(30,655,'A positive result at one stage does not establish every later claim.',19)
save('evidence-stages.svg','Evidence is not interchangeable','DNA presence, protein expression, function, contextual performance and applicable safety/approval are distinct forms of evidence. One positive result does not certify the others.',b)
print('Wrote three chapter14 static conceptual SVGs')
