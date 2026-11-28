#!/usr/bin/env python3
"""Immutable, self-contained batch01 checkpoint. Does not claim remote backup.
Upload the resulting ZIP, independently read Drive size/MD5, then store receipt
and push the session branch. No secrets, app environment files or DB are read.
"""
import argparse
import hashlib
import json
from pathlib import Path
import zipfile

ROOT=Path(__file__).resolve().parents[2]
SCOPE=Path('content/question-bank/ssc/math/chapter-17/restart-r1')


def main():
    p=argparse.ArgumentParser();p.add_argument('--input-archive',type=Path,required=True);p.add_argument('--out-dir',type=Path,required=True);args=p.parse_args()
    receipt=json.loads((ROOT/SCOPE/'input-backup-receipt.json').read_text())
    raw=args.input_archive.read_bytes()
    if hashlib.sha256(raw).hexdigest()!=receipt['sha256']:raise ValueError('Input backup ZIP digest mismatch')
    if not receipt['driveVerified']:raise ValueError('Input backup not independently verified')
    files=[SCOPE/f for f in ['README.md','input-backup-receipt.json','source-intake.json','batch01-mcq.json','batch01-cq.json','batch01-sq.json','batch01-checks.json','progress.json']]
    files += [Path('scripts/question-bank/rebuild-statistics-r1.py'),Path('scripts/question-bank/checkpoint-statistics-r1.py'),Path('tests/test_statistics_restart_r1.py'),Path('tests/statistics-restart-r1.test.cjs'),Path('docs/question-bank/ssc-statistics-restart-r1-batch01.html')]
    entries={'project/'+str(f):(ROOT/f).read_bytes() for f in files}
    entries['inputs/input-snapshot.zip']=raw
    index={name:{'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()} for name,data in sorted(entries.items())}
    manifest={'status':'LOCAL_CHECKPOINT_NOT_REMOTE_VERIFICATION','batch':'restart-r1-batch01','counts':{'MCQ':10,'CQ':10,'SQ':10},'remaining':570,'approved':0,'published':0,'inputArchiveDriveId':receipt['drive']['fileId'],'files':index,'restore':'Verify entries against SHA256. Input ZIP contains source/math.txt and original chapter data/assets. project/ contains the new draft, generator and tests. Restore into a separate directory; do not overwrite a dirty checkout. No publication is implied.'}
    content=(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n').encode();entries['SNAPSHOT.json']=content
    args.out_dir.mkdir(parents=True,exist_ok=True)
    path=args.out_dir/('ssc-statistics-restart-r1-batch01-'+hashlib.sha256(content).hexdigest()[:12]+'.zip')
    temporary=path.with_suffix('.tmp')
    with zipfile.ZipFile(temporary,'w',compression=zipfile.ZIP_DEFLATED) as archive:
        for name,data in sorted(entries.items()):
            i=zipfile.ZipInfo(name,(1980,1,1,0,0,0));i.compress_type=zipfile.ZIP_DEFLATED;archive.writestr(i,data)
    if path.exists() and path.read_bytes()!=temporary.read_bytes():
        temporary.unlink();raise ValueError('Refusing to overwrite immutable checkpoint')
    temporary.replace(path)
    with zipfile.ZipFile(path) as archive:
        assert archive.testzip() is None
        for name,data in entries.items():assert archive.read(name)==data
    data=path.read_bytes();result={'phase':'BATCH01_DRAFT','archive':path.name,'path':str(path),'bytes':len(data),'md5':hashlib.md5(data).hexdigest(),'sha256':hashlib.sha256(data).hexdigest(),'entries':len(entries),'localArchiveVerified':True,'driveVerified':False}
    (args.out_dir/'batch01-local-receipt.json').write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps(result,indent=2))

if __name__=='__main__':main()
