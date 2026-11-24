#!/usr/bin/env python3
"""Hash-check external source PDFs and preserve Item 8/9 transcripts. No DB writes.
Usage: /path/to/python-with-pymupdf extract-ssc-connectors-punctuation.py PDF_DIRECTORY
"""
import argparse, hashlib, json, re
from pathlib import Path
import pymupdf
ROOT=Path(__file__).resolve().parents[2]
SOURCES=json.loads((ROOT/'lib/english/data/ssc-paper2-gap-clues-review.json').read_text())['sources']
def sha(s):return hashlib.sha256(s.encode()).hexdigest()
def normalize(s):
 s=s.translate(str.maketrans({chr(0xf030+i):str(i) for i in range(10)}))
 s=re.sub(r'<<PAGE \d+>>','',s)
 s=re.sub(r'(?m)^\s*(?:English Second Paper\s*:\s*Questions\s*\d+|\d+\s+SSC English Test Papers|\d+)\s*$','',s)
 s=s.replace('\uf0be','____').replace('\uf02d','—')
 s=re.sub(r'(?:—\s*){2,}','____',s)
 return ' '.join(re.sub('_+','____',s).split())
def extract(directory):
 output={'connectors':[],'punctuation':[]}
 for source in SOURCES:
  pdf=directory/source['filename'];assert hashlib.sha256(pdf.read_bytes()).hexdigest()==source['sha256']
  with pymupdf.open(pdf) as doc:text=''.join(f'\n<<PAGE {i+1}>>\n{p.get_text()}'for i,p in enumerate(doc))
  pages=[(m.start(),int(m[1]))for m in re.finditer(r'<<PAGE (\d+)>>',text)]
  board='2018_2024' in pdf.name
  pattern=r'(?m)^([A-Z]+) BOARD[^\n]*?(20\d\d)[^\n]*$'if board else r'(?m)^([^\n]+)\n\s*((?:Pre-)?Test)-? Examination[^\n]*?(20\d\d)[^\n]*$'
  headers=list(re.finditer(pattern,text));assert len(headers)==(45 if board else 41 if '2025_'in pdf.name else 16)
  for hi,h in enumerate(headers):
   base={'sourceFile':source['fileId'],'sourceSha256':source['sha256'],'sourceKind':'board'if board else 'school'}
   base.update({'board':h[1].title(),'examYear':int(h[2])}if board else {'school':' '.join(h[1].split()),'examType':h[2],'examYear':int(h[3])})
   section=text[h.end():headers[hi+1].start()if hi+1<len(headers)else len(text)]
   questions=list(re.finditer(r'(?m)^[ \t]*(1[0-5]|[1-9])\.(?!\d)[ \t]*(?:\n[ \t]*)?',section))
   for qi,q in enumerate(questions):
    raw=section[q.end():questions[qi+1].start()if qi+1<len(questions)else len(section)].strip()
    heading=normalize(raw[:250]).lower()
    kind='connectors'if re.search(r'(?:connectors|linking words)',heading.split('(a)')[0])else 'punctuation'if re.search(r'(?:punctuation marks|punctuate)',heading[:180])else None
    if not kind:continue
    # Printed marks terminate directions, not arbitrary digits inside passage content.
    mark=re.search(r'(?m)(?<![\d.])(0?\.\d+|\d+)\s*[×\uf0b4]\s*(\d+)\s*=\s*(\d+)[ \t]*\n',raw)
    if not mark:mark=re.search(r'(?m)^[ \t]*(5|10)[ \t]*$',raw)
    assert mark,(kind,base)
    instruction=normalize(raw[:mark.start()]);passage=normalize(re.split(r'(?i)Part\s*[—–\-\uf02d]?\s*B\s*(?:[:—–;]|$)',raw[mark.end():])[0])
    labels=re.findall(r'\(([a-z])\)',passage)
    e={'candidateId':f'ssc-p2-{kind}-source-{len(output[kind])+1:03}',**base,'pdfPage':next(n for pos,n in reversed(pages)if pos<=h.end()+q.start()),'questionNumber':int(q[1]),'originalMarks':int(mark[3]if mark.lastindex==3 else mark[1]),'printedMarkExpression':' '.join(mark[0].split()),'sourceInstruction':instruction,'sourcePassage':passage,'sourceRawText':raw,'rawTextSha256':sha(raw),'sourceContentSha256':sha(json.dumps({'instruction':instruction,'passage':passage},ensure_ascii=False,separators=(',',':'))),'gapLabels':labels,'issues':[]}
    if kind=='connectors'and labels!=list('abcde'):e['issues'].append('NOT_FIVE_GAP_SOURCE')
    if re.search('[\uE000-\uF8FF]',passage):e['issues'].append('FONT_GLYPH_REQUIRES_REVIEW')
    output[kind].append(e)
 for kind,entries in output.items():
  seen={}
  for e in entries:
   digest=sha(re.sub('[^a-z0-9]','',e['sourcePassage'].lower()))
   if digest in seen:e['duplicateOf']=seen[digest]
   else:seen[digest]=e['candidateId']
  dest=ROOT/f'docs/english/work-in-progress/ssc-paper2-{kind}-candidates.json';dest.write_text(json.dumps({'version':1,'item':kind,'status':'SOURCE_AUDIT_NOT_IMPORTABLE','sources':SOURCES,'candidates':entries},ensure_ascii=False,indent=2)+'\n')
  print(kind,len(entries),len(seen),'distinct')
if __name__=='__main__':
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('pdf_directory',type=Path);extract(p.parse_args().pdf_directory)
