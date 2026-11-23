"""Deterministic current-repository restore bundle, not a full standalone app.
Archive stays ignored. No upload, DB, approval or deployment. Receipt outside ZIP.
"""
from pathlib import Path
from zipfile import ZipFile,ZipInfo,ZIP_DEFLATED
import json,hashlib
R=Path(__file__).resolve().parents[2];files=set()
for ch in [11,12]:
 files.update((R/f'content/question-bank/ssc/chemistry/chapter-{ch}').glob('*.json'))
 files.update((R/f'content/question-bank/ssc/chemistry/chapter-{ch}-checkpoint').glob('*.json'))
 files.add(R/f'content/question-bank/ssc/chemistry/chapter-{ch}-source-intake.json')
 files.update((R/f'public/question-bank/ssc-chemistry-ch{ch}-source-v1').glob('*.png'))
 files.add(R/f'lib/ssc-chemistry-ch{ch}-batches.ts')
for n in ['chemistry_final_common.py','build-ssc-chemistry-ch11.py','build-ssc-chemistry-ch12.py','review-ssc-chemistry-ch11-12.py','package-ssc-chemistry-ch11-12.py','prepare-ssc-chemistry-ch11-12-checkpoint.py','build-ssc-chemistry-ch11-12-checkpoint.py','extract-ssc-chemistry-ch11-12-checkpoint.py','review-ssc-chemistry-ch11-12-checkpoint.py']:
 files.add(R/'scripts/question-bank'/n)
for n in ['CHAPTER-11-12-AUTHORING.md','chapter-11-review.html','chapter-12-review.html','chapter-11-12-review.html','chapter-11-12-checks.json','chapter-11-12-checkpoint-source-crops.json','SOURCE-INVENTORY.md']:
 files.add(R/'docs/question-bank/ssc-chemistry'/n)
for n in ['prepared-question-batches.ts','question-tables.ts','question-json-import.ts','mcq-import.ts','question-provenance.ts','subject-model-policy.ts']:
 files.add(R/'lib'/n)
for n in ['ssc-chemistry-ch11-12.test.cjs','ssc-chemistry-ch11-12-checkpoint.test.cjs','prepared-library.test.cjs','subject-auto-model.test.cjs',*[f'ssc-chemistry-ch{ch}.test.cjs'for ch in range(1,11)],'ssc-chemistry-ch6-source.test.cjs']:
 files.add(R/'tests'/n)
entries={str(p.relative_to(R)):p.read_bytes()for p in sorted(files)}
for n in ['ch11-12-regression','ch11-12-final','ch11-12-library-ui','ch11-12-library-subset']:
 entries[f'evidence/{n}.tap']=(R/f'.cache/chemistry-sources/{n}.tap').read_bytes()
manifest=dict(status='LOCAL_DRAFTS_NOT_IMPORTED_NOT_APPROVED',chapter11=dict(MCQ=700,CQ=200,SQ=100),chapter12=dict(MCQ=350,CQ=50,SQ=70),total=1470,sources=18,authored=1452,partialCheckpointCountedAgain=False,teacherCertified=False,officialChemistryBlueprintVerified=False,restoreNote='Restore with current repository and its existing prior chapters/catalog/parser/action modules. Shared snapshots are included but this is not an independently bootstrappable app. Original PDF/dependencies not included. Receipt outside archive.',entries={n:dict(bytes=len(b),sha256=hashlib.sha256(b).hexdigest())for n,b in sorted(entries.items())})
entries['BACKUP-MANIFEST.json']=(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n').encode()
output=R/'.cache/chemistry-sources/ssc-chemistry-ch11-12-FULL-1470-drafts-v1-backup.zip';output.parent.mkdir(parents=True,exist_ok=True)
with ZipFile(output,'w',compression=ZIP_DEFLATED,compresslevel=9)as z:
 for n,b in sorted(entries.items()):
  info=ZipInfo(n,date_time=(2026,1,1,0,0,0));info.compress_type=ZIP_DEFLATED;info.external_attr=0o100644<<16;z.writestr(info,b,compress_type=ZIP_DEFLATED,compresslevel=9)
with ZipFile(output)as z:
 assert z.testzip()is None
 assert set(z.namelist())==set(entries)
 for n,b in entries.items():assert z.read(n)==b
 for n,row in manifest['entries'].items():assert hashlib.sha256(z.read(n)).hexdigest()==row['sha256']
data=output.read_bytes();summary=dict(path=str(output.relative_to(R)),bytes=len(data),entries=len(entries),md5=hashlib.md5(data).hexdigest(),sha256=hashlib.sha256(data).hexdigest(),localZipIntegrity='PASS',perEntrySHA256='PASS',total=1470)
(R/'.cache/chemistry-sources/ch11-12-full-backup-local.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary,indent=2))
