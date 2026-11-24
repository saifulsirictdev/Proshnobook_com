"""Extract reviewed native chapter-2 figures locally; no download/DB/publication.
Requires pymupdf. Pass the already-downloaded exact source PDF as argv[1].
"""
from pathlib import Path
import hashlib,sys
import pymupdf as f
ROOT=Path(__file__).resolve().parents[2];source=Path(sys.argv[1])
assert hashlib.sha256(source.read_bytes()).hexdigest()=='77a46c425639912215a7f1ef987e1e75e6b94d8618110557df18af6721d67082'
p=f.open(source);out=ROOT/'public/question-bank/ssc-chemistry-ch2-v1';out.mkdir(parents=True,exist_ok=True)
BOXES=[('particle-states',24,(.19,.45,.82,.62)),('permanganate',25,(.58,.71,.86,.88)),('dye',26,(.23,.45,.75,.63)),('gas-diffusion',27,(.17,.60,.85,.77)),('leak-test',28,(.30,.59,.75,.80)),('candle',29,(.135,.20,.43,.46)),('urea-apparatus',30,(.18,.46,.49,.73)),('wax-apparatus',31,(.16,.16,.41,.47)),('boiling-apparatus',32,(.27,.18,.75,.51)),('heating-native',33,(.18,.16,.82,.54)),('cooling-native',34,(.22,.23,.80,.57)),('sublimation-particles',35,(.27,.48,.74,.72)),('sublimation-apparatus',36,(.50,.11,.90,.415)),('mixtures',38,(.45,.20,.90,.421))]
for name,index,(x0,y0,x1,y1) in BOXES:
 page=p[index];w,h=page.rect.width,page.rect.height
 page.get_pixmap(matrix=f.Matrix(2.5,2.5),clip=f.Rect(x0*w,y0*h,x1*w,y1*h)).save(str(out/f'{name}.png'))
d=f.open();page=d.new_page(width=900,height=1120)
for i,(name,*_) in enumerate(BOXES):
 x=(i%3)*300;y=(i//3)*224;page.insert_text((x+10,y+18),name,fontsize=11);page.insert_image(f.Rect(x+12,y+28,x+288,y+212),filename=str(out/f'{name}.png'),keep_proportion=True)
page.get_pixmap().save(str(ROOT/'docs/question-bank/ssc-chemistry/chapter-2-diagram-review.png'))
print('14 native figure crops; visual inspection required before use')
