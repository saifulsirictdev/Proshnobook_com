"""Local-only native figure extraction. Requires PyMuPDF (pymupdf).
Usage: python scripts/question-bank/extract-ssc-chemistry-ch1-diagrams.py PATH_TO_PDF
No downloads, OCR, DB access, approval or publication. Source is not stored in Git.
The exact source hash and full icon row segmentation prevent silent crop drift.
"""
from pathlib import Path
import hashlib, sys
import pymupdf as f
ROOT=Path(__file__).resolve().parents[2]
source=Path(sys.argv[1])
assert hashlib.sha256(source.read_bytes()).hexdigest()=='77a46c425639912215a7f1ef987e1e75e6b94d8618110557df18af6721d67082','Unexpected textbook; re-review crop coordinates before use'
p=f.open(source);assert len(p)==310
root=ROOT/'public/question-bank/ssc-chemistry-ch1-v1';root.mkdir(parents=True,exist_ok=True)
for pageidx,names in [(17,['explosive','flammable','toxic','irritant','health']),(18,['radioactive','environment','corrosive'])]:
    page=p[pageidx];pix=page.get_pixmap(matrix=f.Matrix(2.5,2.5));s=pix.samples;n=pix.n;pts=[]
    for y in range(int(pix.height*.05),int(pix.height*(.94 if pageidx==17 else .58))):
        for x in range(int(pix.width*.12),int(pix.width*.29)):
            r,g,b=s[(y*pix.width+x)*n:(y*pix.width+x)*n+3]
            if r>160 and g>145 and b<140 and r-b>50:pts.append((x,y))
    groups=[]
    for y in sorted(set(y for x,y in pts)):
        if not groups or y-groups[-1][-1]>30:groups.append([y])
        else:groups[-1].append(y)
    assert len(groups)==len(names),'Icon segmentation changed; visual review required'
    for name,group in zip(names,groups):
        sub=[(x,y) for x,y in pts if group[0]<=y<=group[-1]]
        x0=min(x for x,y in sub)-8;x1=max(x for x,y in sub)+9;y0=group[0]-8;y1=group[-1]+9
        page.get_pixmap(matrix=f.Matrix(2.5,2.5),clip=f.Rect(x0/2.5,y0/2.5,x1/2.5,y1/2.5)).save(str(root/f'{name}.png'))
for name,i,box in [('ppe',16,(.10,.46,.91,.649)),('photosynthesis',20,(.13,.13,.40,.335)),('spraying',20,(.425,.13,.88,.335))]:
    page=p[i];w,h=page.rect.width,page.rect.height;x0,y0,x1,y1=box
    page.get_pixmap(matrix=f.Matrix(2.5,2.5),clip=f.Rect(x0*w,y0*h,x1*w,y1*h)).save(str(root/f'{name}.png'))
d=f.open();page=d.new_page(width=720,height=960)
for i,file in enumerate(sorted(root.glob('*.png'))):
    x=(i%3)*240;y=(i//3)*240;page.insert_text((x+12,y+20),file.stem,fontsize=12)
    page.insert_image(f.Rect(x+15,y+30,x+225,y+220),filename=str(file),keep_proportion=True)
page.get_pixmap().save(str(ROOT/'docs/question-bank/ssc-chemistry/chapter-1-diagram-review.png'))
print('11 native figure crops and diagram-only QA sheet written; visually recheck all crops')
