"""Deterministic chapter10 restore bundle for the current repository, no network.
Run only after generator/extractor/tests/checks. Output ZIP stays in ignored cache.
Receipt is deliberately outside this archive. Earlier chapter data are not copied.
"""
from pathlib import Path
from zipfile import ZipFile,ZipInfo,ZIP_DEFLATED
import hashlib,json
R=Path(__file__).resolve().parents[2]
files=set((R/'content/question-bank/ssc/chemistry/chapter-10').glob('*.json'))
files.add(R/'content/question-bank/ssc/chemistry/chapter-10-source-intake.json')
files.update((R/'public/question-bank/ssc-chemistry-ch10-source-v1').glob('*.png'))
for name in ['prepare-ssc-chemistry-ch10-intake.py','build-ssc-chemistry-ch10.py','extract-ssc-chemistry-ch10-source.py','package-ssc-chemistry-ch10.py']:files.add(R/'scripts/question-bank'/name)
for name in ['CHAPTER-10-AUTHORING.md','chapter-10-source-crops.json','chapter-10-review.html','chapter-10-checks.json','SOURCE-INVENTORY.md']:files.add(R/'docs/question-bank/ssc-chemistry'/name)
for name in ['ssc-chemistry-ch10-batches.ts','prepared-question-batches.ts','question-tables.ts']:files.add(R/'lib'/name)
for name in ['ssc-chemistry-ch10.test.cjs','prepared-library.test.cjs']:files.add(R/'tests'/name)
# Full focused-run evidence retained inside the backup without a generated log in Git.
extra={'evidence/chemistry-focused.tap':R/'.cache/chemistry-sources/ch10-final.tap','evidence/prepared-library-subset.tap':R/'.cache/chemistry-sources/ch10-library-subset.tap'}
entries={str(p.relative_to(R)):p.read_bytes()for p in sorted(files)}
entries.update({n:p.read_bytes()for n,p in extra.items()})
manifest=dict(status='DRAFT_NOT_APPROVED_NOT_IMPORTED',counts=dict(MCQ=700,CQ=200,SQ=100),sourceCount=17,authoredCount=983,restoreNote='Restore chapter10 in the current repository with its existing prior chapter/library/parser modules. Shared files are snapshots of this working branch, not a complete independently bootstrappable application.',entries={n:dict(bytes=len(b),sha256=hashlib.sha256(b).hexdigest())for n,b in sorted(entries.items())})
entries['BACKUP-MANIFEST.json']=(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n').encode()
output=R/'.cache/chemistry-sources/ssc-chemistry-ch10-700-200-100-draft-v1-backup.zip';output.parent.mkdir(parents=True,exist_ok=True)
with ZipFile(output,'w',compression=ZIP_DEFLATED,compresslevel=9)as z:
 for name,b in sorted(entries.items()):
  info=ZipInfo(name,date_time=(2026,1,1,0,0,0));info.compress_type=ZIP_DEFLATED;info.external_attr=0o100644<<16;z.writestr(info,b,compress_type=ZIP_DEFLATED,compresslevel=9)
with ZipFile(output)as z:
 assert z.testzip()is None
 assert set(z.namelist())==set(entries)
 for name,b in entries.items():assert z.read(name)==b
 for name,row in manifest['entries'].items():assert hashlib.sha256(z.read(name)).hexdigest()==row['sha256']
data=output.read_bytes();summary=dict(file=str(output.relative_to(R)),bytes=len(data),entries=len(entries),md5=hashlib.md5(data).hexdigest(),sha256=hashlib.sha256(data).hexdigest(),localZipIntegrity='PASS',allEntryChecksums='PASS')
(R/'.cache/chemistry-sources/ch10-backup-local.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary,indent=2))
