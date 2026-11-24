"""Read illustrated artifacts without importing generator. Development SymPy 1.14.0.
Checks numerical answers, diagram packaging/safety, file bindings, stored witnesses.
Not independent teacher review of every proof or semantic diagram placement.
"""
import hashlib,json,re
from pathlib import Path
import xml.etree.ElementTree as ET
import sympy as S
ROOT=Path(__file__).resolve().parents[2];BASE=ROOT/'content/question-bank/ssc/math/chapter-6'
R=S.Rational
manifest=json.loads((BASE/'targets-v1-manifest.json').read_text())
review=json.loads((BASE/manifest['validation']['file']).read_text())
for f in manifest['files']+[manifest['validation'],manifest['boardSeed']]:
 b=(BASE/f['file']).read_bytes();assert len(b)==f['bytes'] and hashlib.sha256(b).hexdigest()==f['sha256']

def expected(f,n):
 a=25+3*n;b=40+n
 return {'linear-pair':180-a,'vertical':a,'complement':90-a,'around-point':260-a-b,
 'triangle-third':180-a-b,'exterior':a+b,'isos-apex':180-2*a,'isos-base':R(180-a,2),
 'right-other':90-a,'bisector':R(a,2),'incenter':90+R(a,2),'corresponding':a,
 'cointerior':180-a,'equilateral-median':S.sqrt((2*n+4)**2-(n+2)**2),
 'integer-third-side':len([c for c in range(1,2*n+11) if abs(n+4-n-6)<c<(n+4+n+6)]),
 'congruent-side':n+4,'isos-perimeter':R(4*n+20-(2*n+4),2),
 'half-exterior':R(a+b,2),'angle-ratio':R(180,n+5),'equilateral-angle':30+n}[f]
source_answers=[30+60,R(180-70,2),90+R(70,2),R(180-R(180-40,2),2),90+R(40,2),90+R(50,2),R(5,2),S.sqrt(100-25),3,R(3*180,5)]
source_choices=[([30,60,90,100],'C'),([70,65,60,55],'D'),([55,110,125,130],'C'),([55,90,110,140],'A'),([70,110,130,140],'B'),([40,65,115,130],'C'),([R(5,2),R(5,3),R(3,5),R(2,5)],'A'),([5*S.sqrt(3),3*S.sqrt(5),75,125],'A'),([1,2,3,4],'C'),([108,110,120,144],'A')]
inputs={f['file']:json.loads((BASE/f['file']).read_text()) for f in manifest['files']}
used=[];original=source=written=witnesses=0
for m in review['itemReviews']:
 q=inputs[m['file']]['items'][m['itemInFile']-1]
 assert hashlib.sha256((q['type']+'\n'+q['text']).encode()).hexdigest()==m['questionSha256']
 urls=re.findall(r'!\[[^\]]*\]\(([^)]+)\)',q['text']);used+=urls
 assert bool(urls)==m['hasDiagram']
 if q['type']=='MCQ':
  if m['origin'].startswith('ADAPTED'):
   source+=1;v=source_answers[m['variant']-1];choices,key=source_choices[m['variant']-1]
   assert q['correct']==key and choices['ABCD'.index(key)]==v
  else:
   original+=1;v=expected(m['family'],m['variant'])
   assert not q.get('provenance') and 'নিজস্ব অনুশীলনী' in q['page']
   choices=list(map(S.sympify,m['choiceExpressions']))
   assert [k for k,c in zip('ABCD',choices) if S.simplify(c-v)==0]==[q['correct']]
   assert S.simplify(v-S.sympify(m['recomputeExpression']))==0
  assert S.simplify(v-S.sympify(m['answerExpression']))==0
 else:
  written+=1;assert not q.get('provenance') and m['exactChecks']
  for pair in m['exactChecks']:
   assert S.simplify(S.sympify(pair['lhs'])-S.sympify(pair['rhs']))==0
   witnesses+=1
assert source==10 and original==140 and written==80
assert len(used)==len(set(used))==len(review['assets'])==229
ns='{http://www.w3.org/2000/svg}'
for asset in review['assets']:
 assert asset['url'] in used
 p=ROOT/asset['file'];b=p.read_bytes()
 assert len(b)==asset['bytes'] and hashlib.sha256(b).hexdigest()==asset['sha256']
 assert p.parent==ROOT/'public/question-bank/ssc-math-ch6-v1'
 tree=ET.fromstring(b);assert tree.tag==ns+'svg' and tree.attrib['viewBox']=='0 0 345 290'
 assert len(tree.findall('.//'+ns+'path'))>0
 for node in tree.iter():
  assert node.tag in {ns+t for t in ['svg','g','path','rect','text']}
  assert all(not a.lower().startswith('on') and a not in ['href','src'] for a in node.attrib)
 labels=[node.text or '' for node in tree.findall('.//'+ns+'text')]
 for label in asset['labels']:
  if label:assert label in labels,(p,label)
 assert 'Schematic — not to scale' in labels
 assert b'<script' not in b and b'foreignObject' not in b
# General relationships independent of specific stored numeric witnesses.
a,b=S.symbols('a b')
assert S.simplify(180-(180-a)/2-(180-b)/2-(a+b)/2)==0
for n in range(1,8):
 a=25+3*n;b=40+n;c=180-a-b
 assert 0<a<90 and 0<b<90 and 0<c<180
 assert 2*(n+8)>2*n+4
for n in range(1,6):
 # Congruence data must form a genuine triangle, without an incompatible extra numeric angle.
 sides=[n+3,n+4,n+5]
 assert 2*max(sides)<sum(sides)
 q=next(inputs[m['file']]['items'][m['itemInFile']-1] for m in review['itemReviews'] if m['family']=='sas' and m['variant']==n)
 assert r'\angle A=\angle D$' in q['text']
assert review['illustratedCounts']==dict(MCQ=149,CQ=50,SQ=30)
assert review['sourceNativeFigureCount']==5 and not review['assetsDeployed'] and not review['teacherApproved']
print(f'PASS: 140 original + 10 adapted source MCQ independently recomputed; 80 written / {witnesses} stored witnesses, 229 SVG hashes/safety/labels, 230 question bindings. Asset deployment and independent diagram/proof/teacher review pending.')
