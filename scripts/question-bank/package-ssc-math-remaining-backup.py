"""Union of the six verified chapter ZIPs, plus review index/scope; no network."""
from pathlib import Path
import json,zipfile,hashlib,html
ROOT=Path(__file__).resolve().parents[2];docs=ROOT/'docs/question-bank';entries={};cards=[]
for ch in range(11,17):
 m=json.loads((ROOT/f'content/question-bank/ssc/math/chapter-{ch}/targets-v1-manifest.json').read_text())
 with zipfile.ZipFile(docs/f'ssc-math-ch{ch}-illustrated-v1-backup.zip') as z:
  assert z.testzip() is None
  for name in z.namelist():
   raw=z.read(name)
   assert name not in entries or entries[name]==raw
   entries[name]=raw
 title=html.escape(m['topic']);cards.append(f'<article><h2>{title}</h2><p>150 MCQ · 50 CQ · 70 SQ | 270 questions</p><p><a href="docs/question-bank/ssc-math-ch{ch}-illustrated-review.html">Open offline questions and solutions</a></p><p><a href="docs/question-bank/ssc-math-ch{ch}-questions-v1-backup.json">Backup JSON container</a> · <a href="content/question-bank/ssc/math/chapter-{ch}/README.md">Scope / caveats</a></p></article>')
index='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SSC Math — Chapters 11–16</title><style>body{max-width:1000px;margin:40px auto;padding:20px;background:#f0f4f8;color:#17304b;font:17px/1.6 system-ui,sans-serif}h1{line-height:1.2}article{background:white;border:1px solid #cbd5e1;padding:20px;margin:16px 0;border-radius:12px}h2{font-size:21px}a{color:#075d68}.notice{padding:18px;background:#fff1c7;border-left:4px solid #ae7a00}</style><h1>SSC Mathematics · Chapters 11–16</h1><p>1,620 questions · 900 MCQ · 300 CQ · 420 SQ · 810 schematic diagrams</p><div class="notice"><b>Teacher-review DRAFT — not approved/live stock.</b><br>Statistics (chapter 17) is deliberately excluded. Twelve compilation-adapted MCQ and 1,608 original parameter variants; not 1,620 distinct concepts or exhaustive board/textbook coverage.<br>Extract the entire ZIP first, then open this INDEX.html. All review galleries work offline with expandable solutions and embedded fonts/diagrams. JSON backup containers are NOT direct importer input: extract importFiles[].payload or use the original target-v1 slices. No DB import or deployment.</div>'''+''.join(cards)
entries['INDEX.html']=index.encode();report=docs/'ssc-math-ch11-ch16-targets.md';entries[str(report.relative_to(ROOT))]=report.read_bytes()
dest=docs/'ssc-math-ch11-ch16-complete-v1-backup.zip'
with zipfile.ZipFile(dest,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for name,raw in sorted(entries.items()):
  info=zipfile.ZipInfo(name,date_time=(2026,11,20,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o644<<16;z.writestr(info,raw)
with zipfile.ZipFile(dest) as z:
 assert z.testzip() is None
 assert len(z.namelist())==len(entries)
 for name,raw in entries.items():assert z.read(name)==raw
raw=dest.read_bytes();print(json.dumps(dict(file=str(dest.relative_to(ROOT)),files=len(entries),bytes=len(raw),md5=hashlib.md5(raw).hexdigest(),sha256=hashlib.sha256(raw).hexdigest())))
