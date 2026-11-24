"""Extract4wholeexercise pages and3actual source stimuli; no network or guessed redraw.
Usage: PYTHONPATH=<PyMuPDF> python THIS_SCRIPT original.pdf [--check]
Whole pages are intentional fidelity evidence, not counted as extra questions.
"""
from pathlib import Path
import json,hashlib,sys
import fitz
R=Path(__file__).resolve().parents[2];args=[s for s in sys.argv[1:]if s!='--check']
if len(args)!=1:raise SystemExit(__doc__)
p=Path(args[0]);assert hashlib.sha256(p.read_bytes()).hexdigest()=='77a46c425639912215a7f1ef987e1e75e6b94d8618110557df18af6721d67082'
# Fractions of source page dimensions, not OCR coordinates.
rows=[dict(chapter=11,pdfPage=290,name='tb-page-290.png',fraction=[0,0,1,1]),dict(chapter=11,pdfPage=291,name='tb-page-291.png',fraction=[0,0,1,1]),dict(chapter=12,pdfPage=308,name='tb-page-308.png',fraction=[0,0,1,1]),dict(chapter=12,pdfPage=309,name='tb-page-309.png',fraction=[0,0,1,1]),dict(chapter=11,pdfPage=290,name='tb-bromine-shared.png',fraction=[.15,.45,.76,.51]),dict(chapter=11,pdfPage=291,name='tb-starch-stimulus.png',fraction=[.12,.215,.88,.285]),dict(chapter=11,pdfPage=291,name='tb-acid-reaction.png',fraction=[.12,.64,.89,.695])]
manifest=[]
with fitz.open(p)as doc:
 for row in rows:
  page=doc[row['pdfPage']-1];r=page.rect;f=row['fraction'];clip=fitz.Rect(f[0]*r.width,f[1]*r.height,f[2]*r.width,f[3]*r.height);data=page.get_pixmap(matrix=fitz.Matrix(2,2),clip=clip).tobytes('png');target=R/f'public/question-bank/ssc-chemistry-ch{row["chapter"]}-source-v1'/row['name']
  if '--check'in sys.argv:assert target.read_bytes()==data,f'Changed {target}'
  else:target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
  manifest.append({**row,'printedPage':row['pdfPage']-5,'clipPDFPoints':list(clip),'renderScale':2,'file':str(target.relative_to(R)),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
text=json.dumps(manifest,ensure_ascii=False,indent=2)+'\n';dest=R/'docs/question-bank/ssc-chemistry/chapter-11-12-checkpoint-source-crops.json'
if '--check'in sys.argv:assert dest.read_text()==text
else:dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(text)
print(f'{len(manifest)} native source assets '+('verified'if '--check'in sys.argv else'extracted'))
