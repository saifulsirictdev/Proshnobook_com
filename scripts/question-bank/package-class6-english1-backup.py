"""Deterministic versioned Draft backup with internal lesson folders and checksums."""
from pathlib import Path
import argparse,hashlib,json,zipfile
parser=argparse.ArgumentParser()
parser.add_argument('--version',required=True,help='Version label, for example v002')
args=parser.parse_args()
if not args.version.startswith('v') or not args.version[1:].isdigit():parser.error('version must be v followed by digits')
R=Path(__file__).resolve().parents[2];D=R/'content/question-bank/class-6/english-1st'
files={}
for p in sorted(D.iterdir()):
 if not p.is_file() or p.name.startswith('drive-backup-'):continue
 if p.name.startswith('lesson-'):part='Lesson-'+p.name.split('-')[1]
 elif p.name.startswith('practice-') or p.name.startswith('original-skills-'):part='Original-Unseen-Practice'
 elif p.name.startswith('model-'):part='Model-Tests'
 else:part='Source-and-Blueprint'
 files[f'Class 6/English 1st Paper/{part}/{p.name}']=p.read_bytes()
for p in sorted((D/'import').glob('*.json')):
 files[f'Class 6/English 1st Paper/Pending-Import/{p.name}']=p.read_bytes()
files['Reproduction/class6-english1-batches.ts']=(R/'lib/class6-english1-batches.ts').read_bytes()
files['Class 6/English 1st Paper/Source-and-Blueprint/SOURCE-REVIEW.md']=(R/'docs/question-bank/CLASS6-ENGLISH1-SOURCE-REVIEW.md').read_bytes()
for p in sorted((R/'scripts/question-bank').glob('build-class6-english1-*.py')):files['Reproduction/'+p.name]=p.read_bytes()
for p in sorted((R/'tests').glob('class6-english1-*.test.cjs')):files['Validation/'+p.name]=p.read_bytes()
files['Reproduction/'+Path(__file__).name]=Path(__file__).read_bytes()
lessons=sorted(int(p.name.split('-')[1]) for p in D.glob('lesson-*-source-draft.json'))
assert lessons==list(range(1,max(lessons)+1)), 'Backup requires a contiguous lesson sequence'
manifest=dict(version=f'{args.version}-lessons01-{max(lessons):02}-initial-draft',teacherApproved=False,websiteImported=False,sourcePDFIncluded=False,lessonPools=len(lessons),originalUnseenPacks=len(list(D.glob('original-skills-*.json'))),fullModelTests=len(list(D.glob('model-*-draft.json'))),structure='Archive internal Class→Subject→Lesson folders, not separate Drive folders',files=[dict(path=k,bytes=len(v),sha256=hashlib.sha256(v).hexdigest()) for k,v in files.items()])
files['MANIFEST.json']=(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n').encode()
out=R/f'.cache/english6/class6-english1-{args.version}-lessons01-{max(lessons):02}-DRAFT.zip';out.parent.mkdir(parents=True,exist_ok=True)
if out.exists():raise FileExistsError(f'{out}: choose a new version rather than overwrite an existing backup')
with zipfile.ZipFile(out,'w',compression=zipfile.ZIP_DEFLATED) as z:
 for name,data in sorted(files.items()):
  info=zipfile.ZipInfo(name,date_time=(2026,1,1,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;z.writestr(info,data)
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 for entry in manifest['files']:assert hashlib.sha256(z.read(entry['path'])).hexdigest()==entry['sha256']
print(json.dumps(dict(path=str(out),bytes=out.stat().st_size,sha256=hashlib.sha256(out.read_bytes()).hexdigest(),fileCount=len(files)),indent=2))
