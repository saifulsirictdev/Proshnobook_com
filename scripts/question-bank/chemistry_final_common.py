"""Pure draft-authoring helpers. No network, DB, approval or deployment."""
from pathlib import Path
from collections import Counter
from fractions import Fraction
import json,hashlib,re,html,base64,sys
R=Path(__file__).resolve().parents[2];BANK=R/'content/question-bank/ssc/chemistry';DOC=R/'docs/question-bank/ssc-chemistry'
AW=dict(H=1,C=12,N=14,O=16,Na=23,Mg=24,Al=27,P=31,S=32,Cl=35.5,K=39,Ca=40,Fe=56,Br=80)
def atoms(s):
 s=s.translate(str.maketrans('₀₁₂₃₄₅₆₇₈₉','0123456789'));out={}
 for part in s.split('·'):
  m=re.fullmatch(r'(\d+)?(.*)',part);multi=int(m[1]or 1);tokens=re.findall(r'[A-Z][a-z]?|\d+|[()]',m[2]);stack=[{}];i=0
  while i<len(tokens):
   t=tokens[i];i+=1
   if t=='(':stack.append({});continue
   group=stack.pop()if t==')'else{t:1};n=1
   if i<len(tokens)and tokens[i].isdigit():n=int(tokens[i]);i+=1
   for e,k in group.items():stack[-1][e]=stack[-1].get(e,0)+k*n
  assert len(stack)==1
  for e,k in stack[0].items():out[e]=out.get(e,0)+k*multi
 return out
def mass(s):return sum(AW[e]*n for e,n in atoms(s).items())
def fmt(v):
 v=float(v);return str(int(v))if v.is_integer()else f'{v:.4f}'.rstrip('0').rstrip('.')
def formula(c,h,o=0):
 sub=lambda n:''if n==1 else str(n).translate(str.maketrans('0123456789','₀₁₂₃₄₅₆₇₈₉'))
 return'C'+sub(c)+'H'+sub(h)+('O'+sub(o)if o else'')
def dump(x):return json.dumps(x,ensure_ascii=False,indent=2)+'\n'
def save(p,s):
 if not isinstance(s,str):s=dump(s)
 if '--check'in sys.argv:assert p.exists()and p.read_text()==s,f'Stale {p}'
 else:p.parent.mkdir(parents=True,exist_ok=True);p.write_text(s)
class Draft:
 def __init__(self,ch):
  self.ch=ch;seed=json.loads((BANK/f'chapter-{ch}-checkpoint/questions.json').read_text());v=json.loads((BANK/f'chapter-{ch}-checkpoint/validation.json').read_text());self.base={k:v for k,v in seed.items()if k!='items'};self.rows=seed['items'];self.ledger=[{k:v for k,v in m.items()if k not in ['id','itemIndex','questionDigest']}for m in v['ledger']]
 def add(self,t,text,why,family,inputs=None,**kw):
  self.rows.append(dict(type=t,text=text,explanation=why,page='নিজস্ব সাধারণ বোর্ড-ধাঁচের অনুশীলনী; আসল বোর্ড প্রশ্ন নয়',difficulty='MEDIUM',**kw));self.ledger.append(dict(origin='AUTHORED_COMMON_BOARD_STYLE',family=family,answerOrigin='ASSISTANT_AUTHORED_NOT_SOURCE_KEY',teacherApproved=False,sourceQuestionVerbatim=False,kind=t,**({'inputs':inputs}if inputs is not None else{})))
 def mc(self,q,key,wrong,why,family,inputs=None):
  assert len(wrong)==3 and len(set([key,*wrong]))==4,(q,key,wrong)
  opts=wrong.copy();i=sum(q['type']=='MCQ'for q in self.rows)%4;opts.insert(i,key);self.add('MCQ',q,why,family,inputs,options=dict(zip('ABCD',opts)),correct='ABCD'[i])
 def num(self,q,key,why,family,inputs=None):
  key=fmt(key);wrong=[]
  for v in [float(key)*2,float(key)/2,float(key)+1,float(key)+2,float(key)+3,float(key)*3]:
   s=fmt(v)
   if s!=key and s not in wrong:wrong.append(s)
   if len(wrong)==3:break
  self.mc(q,key,wrong,why,family,inputs)
 def sq(self,q,a,family,inputs=None):self.add('SQ',q,a,family,inputs)
 def cq(self,q,parts,family,inputs=None):
  assert len(parts)==4
  self.add('CQ',q,'নিজস্ব উপপ্রশ্নভিত্তিক নমুনা সমাধান; শিক্ষক যাচাই বাকি।',family,inputs,parts=[dict(label=l,question=p,solution=a,marks=i)for i,(l,(p,a))in enumerate(zip('কখগঘ',parts),1)])
 def emit(self,target,note):
  counts=Counter(q['type']for q in self.rows);assert counts==target,(self.ch,counts,target)
  normalized=lambda s:re.sub(r'\s+','',s)
  assert len(set(normalized(q['text'])for q in self.rows))==len(self.rows),'Duplicate stem'
  for q in self.rows:
   if q['type']=='MCQ':assert len(set(q['options'].values()))==4 and q['correct']in q['options']
   if q['type']=='CQ':assert[p['marks']for p in q['parts']]==[1,2,3,4]and all(p['solution']for p in q['parts'])
  artifacts=[];self.base.update(book=f'SSC রসায়ন অধ্যায়{self.ch} — উৎস ও সাধারণ বোর্ড-ধাঁচের খসড়া',edition='2026 draft v1')
  for typ in ['MCQ','CQ','SQ']:
   pairs=[(q,m)for q,m in zip(self.rows,self.ledger)if q['type']==typ]
   for i in range(0,len(pairs),100):
    name=f'{typ.lower()}-{i//100+1}.json';body={**self.base,'items':[q for q,m in pairs[i:i+100]]}
    for j,(q,m)in enumerate(pairs[i:i+100],1):m.update(file=name,itemIndex=j)
    data=dump(body);save(BANK/f'chapter-{self.ch}'/name,data);artifacts.append(dict(file=name,count=len(body['items']),sha256=hashlib.sha256(data.encode()).hexdigest()))
  for i,(q,m)in enumerate(zip(self.rows,self.ledger),1):m.update(id=f'ssc-chem-ch{self.ch}-{i:04}',questionDigest=hashlib.sha256(dump(q).encode()).hexdigest())
  assets={str(p.relative_to(R/'public')):dict(bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest())for p in sorted((R/f'public/question-bank/ssc-chemistry-ch{self.ch}-source-v1').glob('*.png'))}
  v=dict(status='DRAFT_NOT_APPROVED_NOT_IMPORTED',target=target,counts=counts,total=len(self.rows),sourceCount=9,authoredCount=len(self.rows)-9,origins=Counter(m['origin']for m in self.ledger),families=Counter(m['family']for m in self.ledger),teacherCertified=False,officialChemistryBlueprintVerified=False,solutionOrigin='All keys and solutions independently authored, not source-provided keys.',variantNote=note,marksNote='CQ1/2/3/4practice convention; official Chemistry distribution not verified.',assets=assets,artifacts=artifacts,ledger=self.ledger)
  save(BANK/f'chapter-{self.ch}/validation.json',v)
  def render(s):
   def image(m):
    p=R/'public/question-bank'/m[2];return f'<img alt="{m[1]}" src="data:image/png;base64,{base64.b64encode(p.read_bytes()).decode()}">'
   return re.sub(r'!\[([^\]]*)\]\(https://proshnobook.com/question-bank/([^)]*)\)',image,html.escape(s)).replace('\n','<br>')
  pages=[]
  for i,(q,m)in enumerate(zip(self.rows,self.ledger),1):
   tag=(m.get('observedBoard')or{}).get('shortTag','');ref=(tag+' সাটে প্রদর্শিত; মূল বোর্ডপত্র যাচাই বাকি। ')if tag else''
   out=f'<article><h2>{i}. {q["type"]}</h2><small>{html.escape(m["origin"]+" · "+ref+q["page"])}</small><p>{render(q["text"])}</p>'
   if q['type']=='MCQ':out+='<ol type="A">'+''.join(f'<li>{html.escape(a)}</li>'for a in q['options'].values())+'</ol>'
   if q['type']=='CQ':out+=''.join(f'<p><b>{p["label"]}.</b> {html.escape(p["question"])} ({p["marks"]})</p>'for p in q['parts'])
   out+='<details><summary>নিজস্ব নমুনা সমাধান — শিক্ষক যাচাই বাকি</summary>'
   if q['type']=='CQ':out+=''.join(f'<p><b>{p["label"]}.</b> {html.escape(p["solution"])}</p>'for p in q['parts'])
   else:out+=('<b>উত্তর '+q['correct']+'</b><br>'if q['type']=='MCQ'else'')+html.escape(q['explanation'])
   pages.append(out+'</details></article>')
  gallery='<section><h2>মূল উৎসের পূর্ণ পাতা—প্রমাণ, সব প্রশ্ন গণনায় নয়</h2><p>পাতায় বাদ দেওয়া ভুল/অনিরাপদ প্রশ্নও থাকতে পারে। নির্বাচিত প্রশ্ন এবং পৃথক সমাধানই উপরের গণনায়।</p>'
  for f in assets:
   if'tb-page-'in f:gallery+='<details><summary>'+html.escape(f)+'</summary>'+render(f'![মূল পাতা](https://proshnobook.com/{f})')+'</details>'
  gallery+='</section>'
  doc=f'''<!doctype html><html lang="bn"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>রসায়ন অধ্যায়{self.ch} — খসড়া</title><style>body{{font-family:system-ui,sans-serif;max-width:960px;margin:30px auto;padding:18px;background:#f3f7f8;color:#183541;line-height:1.85}}header,section,article{{background:white;border:1px solid #d5e1e6;border-radius:12px;padding:24px;margin:18px 0}}header{{border-top:6px solid #14717a}}h2{{font-size:20px}}img{{max-width:100%;height:auto}}small{{color:#49636d}}summary{{cursor:pointer}}@media print{{article{{break-inside:avoid}}}}</style><header><h1>{html.escape(self.base['topic'])}</h1><p>{counts['MCQ']} MCQ · {counts['CQ']} CQ · {counts['SQ']} SQ = {len(self.rows)}টি খসড়া অনুশীলনী</p><p>নির্বাচিত উৎস৯টি; নিজস্ব{len(self.rows)-9}টি। সব উত্তর/সমাধান নিজস্ব। উৎস অনুসন্ধান সীমিত; সম্পূর্ণ ইন্টারনেট/অধ্যায় পড়ার দাবি নয়। শিক্ষক যাচাই বাকি।</p><p>{html.escape(note)}</p><p>সবগুলো স্বতন্ত্র ঐতিহাসিক বোর্ড প্রশ্ন নয়। একই পরিচিত পদার্থ/বিক্রিয়া ভিন্ন কাজে ফিরেছে; ডেটাসেট ও কাজের ধরন লেজারে আছে। CQ১/২/৩/৪ অনুশীলনের প্রচলন, যাচাইকৃত অফিসিয়াল রসায়ন বণ্টন নয়। উৎসের ভুল ও বাদ দেওয়া প্রশ্ন পৃথক intake-এ নথিভুক্ত; মূল চিত্র অপরিবর্তিত। শিল্পের গ্যাস/অম্ল/ক্ষার/জ্বালানির সমীকরণ তাত্ত্বিক—ঘরোয়া পরীক্ষা, খাদ্য সংরক্ষণের রেসিপি বা চিকিৎসার নির্দেশ নয়। কোনো import, approval, publication বা deploy হয়নি।</p></header>'''+''.join(pages)+gallery+'</html>\n'
  save(DOC/f'chapter-{self.ch}-review.html',doc);print(dump(dict(chapter=self.ch,counts=counts,total=len(self.rows),origins=v['origins'])))
