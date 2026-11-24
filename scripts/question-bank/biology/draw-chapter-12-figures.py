#!/usr/bin/env python3
"""Original teaching schematics; no source artwork, external resources or scripts."""
from pathlib import Path
from html import escape
OUT=Path(__file__).resolve().parents[3]/'content/question-bank/ssc/biology/chapter-12/assets'
OUT.mkdir(parents=True,exist_ok=True)
def text(x,y,s,size=19):return f'<text x="{x}" y="{y}" font-size="{size}" fill="#142d41">{escape(s)}</text>'
def path(d,color='#27485d',width=3):return f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{width}"/>'
def rect(x,y,w,h,color='#eaf4f8'):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="{color}" stroke="#456479"/>'
def save(name,title,desc,body):
 s=f'<svg xmlns="http://www.w3.org/2000/svg" width="900" height="570" viewBox="0 0 900 570" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc><rect width="900" height="570" fill="#ffffff"/><g font-family="sans-serif">{text(30,38,title,24)}{body}</g></svg>\n'
 (OUT/name).write_text(s)
b=text(40,78,'Antiparallel strands; flat teaching model, not a helix to scale',18)
b+=path('M270 135 V465 M570 135 V465',width=7)
b+=text(245,115,"5'")+text(555,115,"3'")+text(245,503,"3'")+text(555,503,"5'")
for y,(a,c,n) in zip([170,250,330,410],[('A','T',2),('T','A',2),('G','C',3),('C','G',3)]):
 b+=rect(295,y-30,90,50)+rect(455,y-30,90,50)+text(327,y+3,a,26)+text(487,y+3,c,26)
 for off in ([-5,5] if n==2 else [-9,0,9]):b+=path(f'M385 {y-4+off} H455','#9c5c28',2)
b+=text(35,540,'Outer rails: sugar-phosphate | Inner rungs: paired bases | Lines: H-bonds',18)
save('dna-pairing.svg','DNA: base pairing and strand direction','A pairs T with two hydrogen bonds. G pairs C with three. Left strand 5 prime to 3 prime downward; right strand opposite.',b)
b=text(35,80,'Parents Tt x Tt; complete dominance; equally likely gametes',18)
for x,s in [(365,'T'),(575,'t')]:b+=text(x,135,s,28)
for y,s in [(225,'T'),(375,'t')]:b+=text(215,y,s,28)
for x,y,s in [(300,165,'TT'),(510,165,'Tt'),(300,315,'Tt'),(510,315,'tt')]:b+=rect(x,y,200,140)+text(x+72,y+77,s,32)
b+=text(45,500,'Genotype 1 : 2 : 1 | Phenotype 3 : 1 (under stated assumptions)',20)
b+=text(45,538,'Four cells are possibilities, not four compulsory births.',19)
save('mendel-grid.svg','Monohybrid probability grid','T and t gametes from each Tt parent combine as TT,Tt,Tt,tt. Independent events; not a birth-order schedule.',b)
b=text(35,80,'Solid dark = original labeled strand; dashed = all nonoriginal strands',18)
def strand(x,y,label,old=False):
 st='' if old else ' stroke-dasharray="9 5"'
 return f'<path d="M{x} {y} h160" stroke="'+('#183c55' if old else '#9b5c2e')+f'" stroke-width="5"{st}/>'+text(x+174,y+6,label,16)
b+=text(35,128,'Start: 1 DNA')+text(335,128,'Cycle 1: 2 DNA')+text(635,128,'Cycle 2: 4 DNA')
b+=strand(40,285,'O1',True)+strand(40,305,'O2',True)
for y,l1,l2 in [(220,'O1','N1'),(380,'O2','N2')]:b+=strand(335,y,l1,True)+strand(335,y+20,l2)
for y,l1,l2 in [(180,'O1','new'),(260,'N1','new'),(360,'O2','new'),(440,'N2','new')]:b+=strand(635,y,l1,l1.startswith('O'))+strand(635,y+20,l2)
b+=path('M275 290 L315 220 M275 310 L315 380 M570 220 L615 180 M570 240 L615 260 M570 380 L615 360 M570 400 L615 440',width=2)
b+=text(30,520,'Each daughter retains one template from its immediate parent.',19)+text(30,550,'After two cycles, only two molecules contain the original O1/O2 labels.',18)
save('replication-strands.svg','Semiconservative replication: follow the strands','One double strand becomes two then four molecules. O1 and O2 stay intact in separate descendants. N1 and N2 become templates in cycle two. Dashed style marks all nonoriginal strands.',b)
b=text(40,80,'All tips are present-day lineages. Branch lengths are NOT time-scaled.',18)
b+=path('M90 295 H230 M230 155 V420 M230 155 H775 M230 420 H460 M460 340 V495 M460 340 H775 M460 495 H775',width=5)
b+=text(165,330,'R',26)+text(395,454,'S',26)+text(800,162,'A',28)+text(800,347,'B',28)+text(800,502,'C',28)
b+=text(45,115,'R: ancestor of A, B and C | S: more recent ancestor of B and C',18)
b+=text(40,555,'A branching relationship, not a ladder of superiority or direct modern ancestors.',18)
save('ancestry-tree.svg','Common ancestry: read the branch points','Root R splits into A and an ancestral lineage leading to S. S splits into B and C. B and C share a more recent common ancestor. Tip order carries no ranking.',b)
print('Wrote 4 original chapter-12 SVG teaching schematics')
