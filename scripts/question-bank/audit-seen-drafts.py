#!/usr/bin/env python3
"""Structural audit only; a valid key label does not prove an answer is correct."""
from pathlib import Path
import collections,json,re
D=Path('deliverables/class8-english1-q01-q04')
files=sorted(D.glob('seen-2026-INCOMPLETE-v00[3-7]*.md')); records=[]; issues=[]; stems=collections.defaultdict(list); passages=collections.defaultdict(list)
for p in files:
 for seg in re.split(r'(?m)^## Set ',p.read_text())[1:]:
  n=int(re.match(r'\d+',seg)[0]); qs=re.findall(r'^\(([a-g])\) (.*?) — (.*)$',seg.split('**2.')[0],re.M)
  key=re.search(r'(?m)^1\. (.*)',seg); keys=dict(re.findall(r'\(([a-g])\) (iv|iii|ii|i)(?=[;.]|$)',key.group(1))) if key else {}
  if len(qs)!=7 or len(keys)!=7: issues.append(f'{n}: MCQ/key count {len(qs)}/{len(keys)}')
  for label,stem,options in qs:
   opts=dict(re.findall(r'\((iv|iii|ii|i)\) (.*?)(?= \((?:iv|iii|ii|i)\) |$)',options))
   if len(opts)!=4 or keys.get(label) not in opts: issues.append(f'{n}{label}: invalid options or key')
   stems[re.sub(r'[^a-z0-9]+',' ',stem.lower()).strip()].append(n)
  titles=re.findall(r'^\*\*(?:First|Second) seen (?:text|passage):\*\* (.*)',seg,re.M)
  for t in titles: passages[t.strip()].append(n)
  records.append({'set':n,'file':p.name,'mcqs':len(qs),'valid_key_labels':len(keys),'passage_titles':titles})
ids=[r['set'] for r in records]
if sorted(ids)!=list(range(1,35)): issues.append('Set numbering not contiguous 1–34')
result={'sets':len(records),'mcqs_checked':sum(x['mcqs'] for x in records),'issues':issues,'reused_passage_titles':{k:v for k,v in passages.items() if len(v)>1},'exact_duplicate_mcq_stems':{k:v for k,v in stems.items() if len(v)>1},'scope':'MCQ option counts and key labels only. Does not establish keyed answer correctness, semantic duplicates, textbook accuracy or rights.','records':records}
(D/'mechanical-audit-sets-01-34.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n'); print(f"{len(records)} sets; {result['mcqs_checked']} MCQs; {len(issues)} structural issues; {len(result['reused_passage_titles'])} repeated passage labels; {len(result['exact_duplicate_mcq_stems'])} exact duplicate stems")
