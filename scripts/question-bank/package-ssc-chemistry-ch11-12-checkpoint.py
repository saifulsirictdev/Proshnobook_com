"""Package only first PARTIAL checkpoints; no target completion or network claim."""
from pathlib import Path
from zipfile import ZipFile,ZipInfo,ZIP_DEFLATED
import hashlib,json
R=Path(__file__).resolve().parents[2];entries={}
def add(p):entries[str(p.relative_to(R))]=p.read_bytes()
for ch in [11,12]:
 add(R/f'content/question-bank/ssc/chemistry/chapter-{ch}-source-intake.json')
 for p in (R/f'content/question-bank/ssc/chemistry/chapter-{ch}-checkpoint').glob('*.json'):add(p)
 for p in (R/f'public/question-bank/ssc-chemistry-ch{ch}-source-v1').glob('*.png'):add(p)
for verb in ['prepare','build','extract','review','package']:add(R/f'scripts/question-bank/{verb}-ssc-chemistry-ch11-12-checkpoint.py')
for name in ['CHAPTER-11-12-CHECKPOINT.md','chapter-11-12-checkpoint-review.html','chapter-11-12-checkpoint-checks.json','chapter-11-12-checkpoint-source-crops.json','SOURCE-INVENTORY.md']:add(R/'docs/question-bank/ssc-chemistry'/name)
add(R/'tests/ssc-chemistry-ch11-12-checkpoint.test.cjs')
entries['evidence/checkpoint-tests.tap']=(R/'.cache/chemistry-sources/ch11-12-checkpoint.tap').read_bytes()
manifest=dict(status='PARTIAL_NOT_TARGET_COMPLETE_NOT_REGISTERED_NOT_IMPORTED',target=dict(chapter11=dict(MCQ=700,CQ=200,SQ=100),chapter12=dict(MCQ=350,CQ=50,SQ=70)),current=dict(chapter11=dict(MCQ=34,CQ=7,SQ=13),chapter12=dict(MCQ=35,CQ=6,SQ=13)),totalCurrent=108,totalTarget=1470,remaining=1362,source=18,authored=90,restoreNote='Checkpoint files for the current repository, not a full bootstrappable app. No completed canonical full-count chapter11/12slices or prepared-library registration.',entries={n:dict(bytes=len(b),sha256=hashlib.sha256(b).hexdigest())for n,b in sorted(entries.items())})
entries['BACKUP-MANIFEST.json']=(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n').encode();dest=R/'.cache/chemistry-sources/ssc-chemistry-ch11-12-PARTIAL-108-drafts-checkpoint-v1.zip'
with ZipFile(dest,'w',compression=ZIP_DEFLATED,compresslevel=9)as z:
 for name,b in sorted(entries.items()):
  info=ZipInfo(name,date_time=(2026,1,1,0,0,0));info.compress_type=ZIP_DEFLATED;info.external_attr=0o100644<<16;z.writestr(info,b,compress_type=ZIP_DEFLATED,compresslevel=9)
with ZipFile(dest)as z:
 assert z.testzip()is None and set(z.namelist())==set(entries)
 for n,b in entries.items():assert z.read(n)==b
 for n,m in manifest['entries'].items():assert hashlib.sha256(z.read(n)).hexdigest()==m['sha256']
b=dest.read_bytes();result=dict(path=str(dest.relative_to(R)),bytes=len(b),entries=len(entries),md5=hashlib.md5(b).hexdigest(),sha256=hashlib.sha256(b).hexdigest(),localZipIntegrity='PASS',perEntrySHA256='PASS',partial=True,totalCurrent=108,totalTarget=1470)
(R/'.cache/chemistry-sources/ch11-12-checkpoint-backup-local.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
