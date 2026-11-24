"""Offline chapter-4 native crops from the exact local textbook; no downloads."""
from pathlib import Path
import hashlib,sys
import pymupdf as f
ROOT=Path(__file__).resolve().parents[2];source=Path(sys.argv[1])
assert hashlib.sha256(source.read_bytes()).hexdigest()=='77a46c425639912215a7f1ef987e1e75e6b94d8618110557df18af6721d67082'
p=f.open(source);out=ROOT/'public/question-bank/ssc-chemistry-ch4-v1';out.mkdir(parents=True,exist_ok=True)
# PDF page (1-based), normalized crop. PDF page = printed page + 5.
BOXES=[('table-left',67,(.10,.08,.91,.94)),('table-right',68,(.08,.08,.92,.95)),('radius-trend',76,(.515,.65,.885,.88)),('ionization',77,(.46,.18,.89,.367)),('carbonate-apparatus',83,(.23,.305,.78,.655)),('alkali-column',85,(.23,.502,.30,.628)),('exercise-grid',86,(.128,.434,.512,.601))]
for name,page,(x0,y0,x1,y1) in BOXES:
 page=p[page-1];w,h=page.rect.width,page.rect.height
 page.get_pixmap(matrix=f.Matrix(2.5,2.5),clip=f.Rect(x0*w,y0*h,x1*w,y1*h)).save(str(out/f'{name}.png'))
d=f.open();page=d.new_page(width=1000,height=1100)
for i,(name,*_) in enumerate(BOXES):
 x=i%3*333;y=i//3*365;page.insert_text((x+10,y+18),name,fontsize=11);page.insert_image(f.Rect(x+10,y+30,x+320,y+350),filename=str(out/f'{name}.png'),keep_proportion=True)
page.get_pixmap().save(str(ROOT/'docs/question-bank/ssc-chemistry/chapter-4-diagram-review.png'))
print('7 crops; inspect before use')
