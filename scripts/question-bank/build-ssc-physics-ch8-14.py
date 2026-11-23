"""All remaining SSC Physics chapters, explicitly 8–14, 250/120/100 each.
Deterministic local drafts, not import/approval/publication/deployment.
"""
from physics_illustrated import *
from physics_remaining_diagrams import RemainingBank
from physics_remaining_models import TOPICS,models,make
from physics_remaining_concepts import concepts
source=json.loads((ROOT/'docs/question-bank/ssc-physics/source-inspection-ch8-14.json').read_text())
for ch in range(8,15):
 b=RemainingBank(ch,TOPICS[ch],TOPICS[ch],dict(MCQ=250,CQ=120,SQ=100));specs=models(ch);bykey={s['key']:s for s in specs}
 mcq,sq=concepts(ch);b.concepts(mcq,sq)
 b.numeric(list(bykey),lambda key,n:make(bykey[key],n),[s['key'] for s in specs[:16]])
 # Retain the independently checkable changed inputs in every CQ calculation.
 for item in b.audit:
  if item['family']=='concept':continue
  c=item['calculation'];spec=bykey[item['family']];p={k:F(v) for k,v in c['params'].items()};cp=p.copy();key,factor=spec['change'];cp[key]=cp[key]*factor if factor is not None else cp[key]+2
  c['formulaId']=spec['key']
  if item['kind']=='CQ':c['secondaryParams']={k:str(v) for k,v in cp.items()}
  if item['hasDiagram']:
   item['sourceStructureReference']=f'source-inspection-ch8-14.json: chapter {ch}; analogous observed structures, own wording/data, not verbatim or board attribution'
   # Source question vs source solution presence is deliberately not conflated.
   item['sourceFigureObserved']=spec['fig'] in {8:['concave','convex'],9:['lens-positive','lens-negative','refraction','critical'],10:['charges'],11:['series','parallel','mixed'],12:['transformer'],13:['diode','rectifier','transistor','radio'],14:['xray','ecg']}[ch]
   item['diagramOrigin']='redrawn source-analogous structure' if item['sourceFigureObserved'] else 'new assistive schematic; source figure not asserted'
 b.finish(source['chapters'][str(ch)])
 # Remove only obsolete files from these newly authored version folders.
 expected={Path(a['file']).name for a in b.assets}
 for path in b.assetdir.glob('*.svg'):
  if path.name not in expected:
   if '--check' in sys.argv:raise AssertionError(f'Obsolete generated SVG: {path}')
   path.unlink()
