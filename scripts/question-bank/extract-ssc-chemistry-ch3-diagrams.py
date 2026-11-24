"""Local native chapter-3 crops. Requires pymupdf and the exact source PDF argv[1].
No downloads, database access, approval, deployment or whole-book reading.
"""
from pathlib import Path
import hashlib,sys
import pymupdf as f
ROOT=Path(__file__).resolve().parents[2];source=Path(sys.argv[1])
assert hashlib.sha256(source.read_bytes()).hexdigest()=='77a46c425639912215a7f1ef987e1e75e6b94d8618110557df18af6721d67082'
p=f.open(source);out=ROOT/'public/question-bank/ssc-chemistry-ch3-v1';out.mkdir(parents=True,exist_ok=True)
BOXES=[('nuclide-notation',45,(.23,.37,.75,.585)),('rutherford',46,(.54,.53,.86,.71)),('classical-collapse',47,(.55,.34,.86,.50)),('bohr-transitions',48,(.18,.385,.83,.59)),('aufbau-order',53,(.54,.52,.84,.73)),('model-comparison',62,(.15,.16,.83,.34)),('nuclear-plant',60,(.19,.125,.82,.406))]
for name,index,(x0,y0,x1,y1) in BOXES:
 page=p[index];w,h=page.rect.width,page.rect.height
 page.get_pixmap(matrix=f.Matrix(2.5,2.5),clip=f.Rect(x0*w,y0*h,x1*w,y1*h)).save(str(out/f'{name}.png'))
d=f.open();page=d.new_page(width=900,height=720)
for i,(name,*_) in enumerate(BOXES):
 x=(i%3)*300;y=(i//3)*240;page.insert_text((x+10,y+18),name,fontsize=11);page.insert_image(f.Rect(x+12,y+30,x+288,y+228),filename=str(out/f'{name}.png'),keep_proportion=True)
page.get_pixmap().save(str(ROOT/'docs/question-bank/ssc-chemistry/chapter-3-diagram-review.png'))
print('7 native chapter-3 figure crops; inspect before authoring')
