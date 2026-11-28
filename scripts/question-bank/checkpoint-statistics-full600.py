#!/usr/bin/env python3
"""Versioned, closed-list backup of all source, reconstructed payloads and evidence.
The archive is not a remote-backup receipt; independently compare Drive MD5/size.
"""
import argparse, hashlib, json, zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];BASE=ROOT/'content/question-bank/ssc/math/chapter-17';R1=BASE/'restart-r1';FULL=R1/'full600'
sha=lambda b:hashlib.sha256(b).hexdigest()
def main():
 p=argparse.ArgumentParser();p.add_argument('--source',type=Path,required=True);p.add_argument('--out-dir',type=Path,required=True);a=p.parse_args()
 intake=json.loads((R1/'source-intake.json').read_text());raw=a.source.read_bytes();assert sha(raw)==intake['sourceSha256'],'Raw source differs from verified input backup'
 manifest=json.loads((FULL/'manifest.json').read_text());assert manifest['totalReconstructed']==600
 previous=json.loads((R1/'batch01-backup-receipt.json').read_text());assert previous['driveVerified'] and previous['independentDriveMetadataRead']
 files=[f for f in R1.rglob('*') if f.is_file() and f.name not in ('backup-receipt.json','github-verification.json','validation-report.json')]
 files += [BASE/'targets-v1-manifest.json',*list((BASE/'target-v1').glob('*.json')),*list((ROOT/'public/question-bank/ssc-math-ch17-v1').glob('*.svg'))]
 files += [ROOT/'docs/question-bank/ssc-statistics-restart-r1-batch01.html',ROOT/'docs/question-bank/ssc-statistics-restart-r1-full600.html']
 files += [ROOT/'scripts/question-bank'/f for f in ('rebuild-statistics-r1.py','checkpoint-statistics-r1.py','complete-statistics-r1.py','checkpoint-statistics-full600.py')]
 files += [ROOT/'tests'/f for f in ('test_statistics_restart_r1.py','test_statistics_full600.py','statistics-restart-r1.test.cjs','statistics-full600.test.cjs')]
 files += [ROOT/f for f in ('lib/nctb-data.ts','lib/mcq-import.ts','lib/question-provenance.ts','lib/question-json-import.ts','lib/question-tables.ts','lib/ssc-biology-assets.ts','components/MathText.tsx')]
 entries={'project/'+str(f.relative_to(ROOT)):f.read_bytes() for f in sorted(set(files))};entries['source/math.txt']=raw
 index={name:{'bytes':len(data),'sha256':sha(data)} for name,data in sorted(entries.items())}
 doc={'phase':'FULL600_CONTENT_CHECKPOINT_NOT_A_PUBLICATION_RECEIPT','counts':manifest['reconstructed'],'remaining':0,'approved':0,'published':0,'files':index,'inputSourceSha256':intake['sourceSha256'],'previousCheckpointDriveId':previous['drive']['fileId'],'restore':'Read VERIFY_AND_RESTORE.md. Never unpack directly into a dirty checkout.'}
 entries['VERIFY_AND_RESTORE.md']=b'''# Restore safely\n1. Open SNAPSHOT.json and verify each listed entry size and SHA256.\n2. Restore project/ into a separate checkout, never over unrelated work.\n3. source/math.txt is the originally backed-up attachment; verify its recorded SHA256.\n4. Rebuild using python scripts/question-bank/complete-statistics-r1.py.\n5. Run Python statistics tests and Node statistics tests with project dependencies.\n6. Offline HTML embeds all drawn graphs; JSON image URLs need assets deployed separately.\nNo DB approval, publication, teacher certification or live asset check is implied.\n'''
 doc['files']['VERIFY_AND_RESTORE.md']={'bytes':len(entries['VERIFY_AND_RESTORE.md']),'sha256':sha(entries['VERIFY_AND_RESTORE.md'])}
 entries['SNAPSHOT.json']=(json.dumps(doc,ensure_ascii=False,indent=2)+'\n').encode();a.out_dir.mkdir(parents=True,exist_ok=True);path=a.out_dir/f'ssc-statistics-restart-r1-full600-{sha(entries["SNAPSHOT.json"])[:12]}.zip';tmp=path.with_suffix('.tmp')
 with zipfile.ZipFile(tmp,'w',compression=zipfile.ZIP_DEFLATED) as z:
  for name,data in sorted(entries.items()):
   info=zipfile.ZipInfo(name,(1980,1,1,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;z.writestr(info,data)
 if path.exists() and path.read_bytes()!=tmp.read_bytes():tmp.unlink();raise ValueError('Refusing to overwrite differing versioned archive')
 tmp.replace(path)
 with zipfile.ZipFile(path) as z:
  assert z.testzip() is None
  for name,data in entries.items():assert z.read(name)==data,name
 raw=path.read_bytes();r={'phase':'FULL600_RECONSTRUCTED','archive':path.name,'bytes':len(raw),'sha256':sha(raw),'md5':hashlib.md5(raw).hexdigest(),'entries':len(entries),'localArchiveVerified':True,'driveVerified':False}
 (a.out_dir/'full600-local-receipt.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r,indent=2))
if __name__=='__main__':main()
