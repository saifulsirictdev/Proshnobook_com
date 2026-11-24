"""Offline chapter-5 native crops from the exact local textbook. No downloads."""
from pathlib import Path
import hashlib,sys
import pymupdf as f
ROOT=Path(__file__).resolve().parents[2];source=Path(sys.argv[1]);assert hashlib.sha256(source.read_bytes()).hexdigest()=='77a46c425639912215a7f1ef987e1e75e6b94d8618110557df18af6721d67082'
p=f.open(source);out=ROOT/'public/question-bank/ssc-chemistry-ch5-v1';out.mkdir(parents=True,exist_ok=True)
# PDF pages are one-based; printed page = PDF page -5.
BOXES=[('valence-shells',89,(.22,.245,.76,.455)),('methane-octet',95,(.53,.437,.86,.687)),('lithium-ion',98,(.40,.17,.88,.325)),('sodium-ion',98,(.11,.645,.58,.825)),('chloride-ion',99,(.21,.437,.81,.625)),('sodium-chloride',100,(.10,.52,.90,.731)),('magnesium-oxide',101,(.10,.215,.88,.377)),('hydrogen-sharing',103,(.14,.42,.83,.58)),('oxygen-sharing',103,(.14,.708,.82,.858)),('water-sharing',104,(.18,.342,.81,.56)),('water-polarity',106,(.60,.45,.895,.687)),('electrolyte',107,(.59,.595,.87,.845)),('crystals',108,(.10,.61,.40,.84)),('metal-bond',109,(.24,.37,.75,.636)),('metal-current',110,(.15,.467,.895,.68)),('exercise-abd',112,(.085,.165,.63,.36)),('exercise-xy',113,(.11,.195,.565,.38))]
for name,page,(x0,y0,x1,y1) in BOXES:
 page=p[page-1];w,h=page.rect.width,page.rect.height;page.get_pixmap(matrix=f.Matrix(2.5,2.5),clip=f.Rect(x0*w,y0*h,x1*w,y1*h)).save(str(out/f'{name}.png'))
d=f.open();page=d.new_page(width=1200,height=1500)
for i,(name,*_) in enumerate(BOXES):
 x=i%4*300;y=i//4*300;page.insert_text((x+8,y+18),name,fontsize=11);page.insert_image(f.Rect(x+10,y+30,x+288,y+282),filename=str(out/f'{name}.png'),keep_proportion=True)
page.get_pixmap().save(str(ROOT/'docs/question-bank/ssc-chemistry/chapter-5-diagram-review.png'));print('17 native crops; inspect before use')
