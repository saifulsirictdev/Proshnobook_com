"""Deterministic local backups, no Drive calls. Run after build/verify/gallery checks."""
import json,hashlib,zipfile,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
def read(p):return json.loads(p.read_text())
chapters=list(map(int,sys.argv[1:])) or [7,8]
assert all(ch in range(7,18) for ch in chapters)
for chapter in chapters:
 base=ROOT/f'content/question-bank/ssc/math/chapter-{chapter}';manifest=read(base/'targets-v1-manifest.json');review=read(base/manifest['validation']['file'])
 files=[]
 for entry in manifest['files']:
  path=base/entry['file'];raw=path.read_bytes();assert len(raw)==entry['bytes'] and hashlib.sha256(raw).hexdigest()==entry['sha256']
  files.append(dict(path=str(path.relative_to(ROOT)),sha256=entry['sha256'],payload=read(path)))
 bundle=ROOT/f'docs/question-bank/ssc-math-ch{chapter}-questions-v1-backup.json'
 data=dict(format='PROSHNOBOOK_CHAPTER_BACKUP_V1_NOT_DIRECT_IMPORT',chapter=chapter,status=manifest['status'],counts=manifest['counts'],teacherApproved=False,assetsDeployed=False,instructions='Backup container, not a direct importer input. Extract each importFiles[].payload into its named .json file and use the existing strict importer only after review/authorization. SVG files are in the companion ZIP; HTTPS URLs are not live-verified.',importFiles=files,manifest=manifest,validation=review,boardSeed=read(base/'board-seed-v1.json'))
 bundle.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
 paths=list(base.rglob('*.json'))+[base/'README.md']+[ROOT/a['file'] for a in review['assets']]+[bundle,ROOT/f'docs/question-bank/ssc-math-ch{chapter}-illustrated-review.html',ROOT/f'docs/question-bank/ssc-math-ch{chapter}-browser-check.json',ROOT/(f'docs/question-bank/ssc-math-ch{chapter}-independent-check.json' if chapter>=9 else 'docs/question-bank/ssc-math-ch7-ch8-independent-check.json'),ROOT/'public/fonts/kalpurush-OFL.txt']
 if chapter>=9:paths.append(ROOT/f'docs/question-bank/ssc-math-ch{chapter}-katex-LICENSE.txt')
 if chapter==17:paths.append(ROOT/'docs/question-bank/ssc-math-ch17-table-print-proof.pdf')
 assert all(p.exists() for p in paths)
 dest=ROOT/f'docs/question-bank/ssc-math-ch{chapter}-illustrated-v1-backup.zip'
 with zipfile.ZipFile(dest,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
  for p in sorted(set(paths)):
   name=str(p.relative_to(ROOT));info=zipfile.ZipInfo(name,date_time=(2026,11,20,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o644<<16;z.writestr(info,p.read_bytes())
 with zipfile.ZipFile(dest) as z:
  assert z.testzip() is None
  for name in z.namelist():assert z.read(name)==(ROOT/name).read_bytes(),name
 # Verify JSON container payloads round-trip to the exact original JSON objects.
 for f in read(bundle)['importFiles']:assert f['payload']==read(ROOT/f['path'])
 for p in [bundle,dest]:
  raw=p.read_bytes();print(json.dumps(dict(file=str(p.relative_to(ROOT)),bytes=len(raw),md5=hashlib.md5(raw).hexdigest(),sha256=hashlib.sha256(raw).hexdigest())))
