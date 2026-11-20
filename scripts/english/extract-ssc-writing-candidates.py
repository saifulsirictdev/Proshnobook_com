#!/usr/bin/env python3
"""Preserve SSC writing prompts from hash-checked external PDFs; no DB writes."""
import argparse,hashlib,json,re,runpy
from pathlib import Path
import pymupdf
ROOT=Path(__file__).resolve().parents[2]
base=runpy.run_path(str(ROOT/'scripts/english/extract-ssc-connectors-punctuation.py'))
SOURCES=base['SOURCES'];normalize=base['normalize'];sha=base['sha']
def extract(directory):
 output={k:[] for k in ['paragraph','letter-email','composition']}
 for source in SOURCES:
  pdf=directory/source['filename'];assert hashlib.sha256(pdf.read_bytes()).hexdigest()==source['sha256']
  with pymupdf.open(pdf) as doc:text=''.join(f'\n<<PAGE {i+1}>>\n{p.get_text()}' for i,p in enumerate(doc))
  pages=[(m.start(),int(m[1]))for m in re.finditer(r'<<PAGE (\d+)>>',text)]
  board='2018_2024'in pdf.name
  pattern=r'(?m)^([A-Z]+) BOARD[^\n]*?(20\d\d)[^\n]*$'if board else r'(?m)^([^\n]+)\n\s*((?:Pre-)?Test)-? Examination[^\n]*?(20\d\d)[^\n]*$'
  headers=list(re.finditer(pattern,text));assert len(headers)==(45 if board else 41 if '2025_'in pdf.name else 16)
  for hi,h in enumerate(headers):
   meta={'sourceFile':source['fileId'],'sourceSha256':source['sha256'],'sourceKind':'board'if board else 'school'}
   meta.update({'board':h[1].title(),'examYear':int(h[2])}if board else {'school':' '.join(h[1].split()),'examType':h[2],'examYear':int(h[3])})
   section=text[h.end():headers[hi+1].start()if hi+1<len(headers)else len(text)]
   qs=list(re.finditer(r'(?m)^[ \t]*(1[0-5]|[1-9])\.(?!\d)[ \t]*(?:\n[ \t]*)?',section))
   for qi,q in enumerate(qs):
    raw=section[q.end():qs[qi+1].start()if qi+1<len(qs)else len(section)].strip();prompt=normalize(raw)
    if re.search(r'(?i)write.{0,20}paragraph',prompt):kind='paragraph'
    elif re.search(r'(?i)write.{0,30}composition',prompt):kind='composition'
    elif re.search(r'(?i)write.{0,35}(?:e-?mail|application|letter)',prompt)and not re.search(r'(?i)\bCV\b|curriculum vitae|cover(?:ing)? letter',prompt):kind='letter-email'
    else:continue
    # Standalone page/paper serial numbers must not become printed marks or prompt words.
    marktext=raw.split('<<PAGE')[0].translate(str.maketrans({chr(0xf030+i):str(i) for i in range(10)})).rstrip()
    marks=list(re.finditer(r'(?m)^[ \t]*(8|10|12|15|20)[ \t]*$',marktext))
    inline=re.search(r'\s(8|10|12|15|20)\s*$',marktext)
    mark=marks[-1]if marks else inline
    if mark:
     original=int(mark[1]);prompt=normalize(raw[:mark.start()])
    else:original=None
    issues=[] if original else ['MARKS_REQUIRE_REVIEW']
    if not prompt or len(prompt)<15:issues.append('TRUNCATED_PROMPT')
    e={'candidateId':f'ssc-p2-{kind}-source-{len(output[kind])+1:03}',**meta,'pdfPage':next(n for pos,n in reversed(pages)if pos<=h.end()+q.start()),'questionNumber':int(q[1]),'originalMarks':original,'sourcePrompt':prompt,'sourceRawText':raw,'rawTextSha256':sha(raw),'sourceContentSha256':sha(prompt),'issues':issues}
    output[kind].append(e)
 for kind,entries in output.items():
  (ROOT/f'docs/english/work-in-progress/ssc-paper2-{kind}-candidates.json').write_text(json.dumps({'version':1,'item':kind,'status':'SOURCE_AUDIT_NOT_IMPORTABLE','sources':SOURCES,'candidates':entries},ensure_ascii=False,indent=2)+'\n');print(kind,len(entries))
if __name__=='__main__':
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('pdf_directory',type=Path);extract(p.parse_args().pdf_directory)
