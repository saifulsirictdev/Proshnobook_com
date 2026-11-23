"""Reproduce source pixels from the owner's original PDF, not OCR or re-drawing.
PYTHONPATH=<PyMuPDF location> python scripts/question-bank/extract-ssc-chemistry-ch9-source.py /path/to/owner-textbook.pdf [--check]
No download/network operation. The large original PDF is deliberately not committed.
"""
from pathlib import Path
import hashlib,json,sys
import fitz
R=Path(__file__).resolve().parents[2]
args=[x for x in sys.argv[1:] if x!='--check']
if len(args)!=1:raise SystemExit(__doc__)
p=Path(args[0]);intake=json.loads((R/'content/question-bank/ssc/chemistry/chapter-9-source-intake.json').read_text())
assert hashlib.sha256(p.read_bytes()).hexdigest()==intake['textbook']['sha256'],'Wrong original PDF; refusing guessed page locations'
manifest=json.loads((R/'docs/question-bank/ssc-chemistry/chapter-9-source-crops.json').read_text())
with fitz.open(p) as doc:
 for row in manifest:
  image=doc[row['pdfPage']-1].get_pixmap(matrix=fitz.Matrix(2,2),clip=fitz.Rect(row['clipPDFPoints'])).tobytes('png')
  target=R/row['file']
  if '--check' in sys.argv:assert target.read_bytes()==image,f'Source crop differs: {target}'
  else:target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(image)
print(f'{len(manifest)} source crops verified' if '--check' in sys.argv else f'{len(manifest)} source crops extracted')
