"""Deterministic local-only illustrated Physics draft utilities (chapters 5–7)."""
from pathlib import Path
from fractions import Fraction as F
from decimal import Decimal,ROUND_HALF_UP
from collections import Counter
import json,hashlib,html,re,sys
ROOT=Path(__file__).resolve().parents[2]
def fmt(v):
 d=(Decimal(F(v).numerator)/Decimal(F(v).denominator)).quantize(Decimal('.000001'),rounding=ROUND_HALF_UP)
 return format(d,'f').rstrip('0').rstrip('.') or '0'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,s):
 if '--check' in sys.argv:assert p.exists() and p.read_text()==s,f'Stale: {p}'
 else:p.parent.mkdir(parents=True,exist_ok=True);p.write_text(s)
def enc(x):return json.dumps(x,ensure_ascii=False,indent=2)+'\n'
class Bank:
 def __init__(self,ch,title,topic,counts):
  self.ch,self.title,self.topic,self.counts=ch,title,topic,counts
  self.items=[];self.audit=[];self.assets=[]
  self.out=ROOT/f'content/question-bank/ssc/physics/chapter-{ch}'
  self.assetdir=ROOT/f'public/question-bank/ssc-physics-ch{ch}-v1'
  self.url=f'https://proshnobook.com/question-bank/ssc-physics-ch{ch}-v1/'
 def figure(self,name,kind,labels):
  # Semantic labels are data, never raw user markup. All assets self-contained.
  def t(x,y,s):return f'<text x="{x}" y="{y}">{html.escape(str(s))}</text>'
  lab=''.join(t(24,285+i*23,s) for i,s in enumerate(labels))
  if kind=='hydraulic':
   shapes='<path d="M50 70V220H380V70M110 70V160H260V70"/><path d="M50 90H110M260 90H380" stroke-width="6"/><path d="M80 25V80m-7-10 7 10 7-10M320 80V25m-7 10 7-10 7 10"/><path d="M52 110H108M52 130H108M52 150H108M52 170H378M52 190H378M262 130H378M262 150H378" stroke="#52918b"/>'
   words=t(52,53,'A1, F1')+t(267,55,'A2, F2')+t(130,245,'Ideal liquid; equal piston levels')
  elif kind=='layers':
   shapes='<path d="M100 35V240H330V35"/><path d="M100 65H330M100 145H330"/><path d="M110 85H320M110 115H320M110 175H320M110 205H320" stroke="#52918b"/>'
   words=t(130,52,'Open surface')+t(145,105,'Liquid 1')+t(145,195,'Liquid 2')+t(340,240,'P')
  elif kind in ['depth','buoyancy','float']:
   shapes='<path d="M75 35V235H340V35M75 70H340"/><path d="M85 110H330M85 145H330M85 180H330M85 215H330" stroke="#52918b"/>'
   y=48 if kind=='float' else 130
   shapes+=f'<rect x="165" y="{y}" width="85" height="65" fill="white"/>' if kind!='depth' else '<circle cx="200" cy="200" r="4" fill="black"/>'
   words=t(100,57,'Open liquid surface')+t(355,160,'h')+t(115,258,'Schematic; immersion as stated')
  elif kind=='wire':
   shapes='<path d="M90 35H330M150 35V155M270 35V205M142 155H158M262 205H278M270 215V250m-7-10 7 10 7-10"/>'
   words=t(105,180,'L')+t(285,175,'L + dL')+t(295,242,'F')+t(120,258,'Within elastic limit')
  elif kind=='scale':
   shapes='<path d="M145 45V215M275 45V215M130 55H160M130 200H160M260 55H290M260 200H290M145 120H275"/>'
   words=t(75,45,'Upper fixed point')+t(70,235,'Lower fixed point')+t(110,145,'C')+t(285,145,'X')
  elif kind=='rod':
   shapes='<rect x="65" y="70" width="265" height="30"/><rect x="65" y="155" width="300" height="30"/><path d="M330 200H365"/>'
   words=t(65,55,'Initial length L')+t(65,140,'Heated length L + dL')+t(315,227,'dL')
  elif kind=='heating':
   shapes='<path d="M65 35V225H400M65 160H230L365 65"/><path d="M230 160V225M365 65V225" stroke-dasharray="4 4"/>'
   words=t(15,28,'T (C)')+t(35,166,'0')+t(220,248,'Qm')+t(340,248,'Qm + mcT')+t(368,214,'Q (J)')+t(80,145,'Melting: T = 0')
  else:raise ValueError(kind)
  footer=t(24,315+23*len(labels),'Schematic - not to scale; values in question apply')
  s=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 {325+23*len(labels)}" role="img" aria-label="{kind} diagram"><rect width="100%" height="100%" fill="white"/><g fill="none" stroke="#132b3f" stroke-width="2">{shapes}</g><g fill="#132b3f" font-family="Arial,sans-serif" font-size="14">{words}{lab}{footer}</g></svg>\n'
  path=self.assetdir/(name+'.svg');save(path,s)
  meta=dict(file=str(path.relative_to(ROOT)),url=self.url+path.name,kind=kind,labels=labels,sha256=sha(path))
  self.assets.append(meta)
  return '\n!['+{'hydraulic':'হাইড্রোলিক যন্ত্র','layers':'দুই স্তরের তরল','depth':'তরলের গভীরতা','buoyancy':'নিমজ্জিত বস্তু','float':'ভাসমান বস্তু','wire':'তারের প্রসারণ','scale':'তাপমাত্রার স্কেল','rod':'রৈখিক প্রসারণ','heating':'গলন ও পরবর্তী উত্তাপ'}[kind]+']('+meta['url']+')'
 def add(self,kind,text,why,family,calc=None,**extra):
  q=dict(type=kind,text=text,explanation=why,page='নিজস্ব অনুশীলনী; চিত্র পুনরঙ্কিত/সহায়ক; পূর্ণ পৃষ্ঠা-মিল/শিক্ষক যাচাই বাকি',difficulty='MEDIUM',**extra)
  self.items.append(q);self.audit.append(dict(index=len(self.items),kind=kind,family=family,hasDiagram='![' in text,stemSha256=hashlib.sha256(text.encode()).hexdigest(),sourceHadFigure=None,originalPractice=True,teacherApproved=False,**({'calculation':calc} if calc else {})))
 def mcq(self,text,answer,wrong,why,fam,calc=None):
  choices=[answer,*wrong];assert len(choices)==len(set(choices))==4,(text,choices)
  pos=sum(q['type']=='MCQ' for q in self.items)%4;choices.insert(pos,choices.pop(0))
  self.add('MCQ',text,why,fam,calc,options=dict(zip('ABCD',choices)),correct='ABCD'[pos])
 def concepts(self,mcqs,sqs):
  for line in mcqs.strip().splitlines():
   q,a,b,c,d,e=line.split('|');self.mcq(q,a,[b,c,d],e,'concept')
  for line in sqs.strip().splitlines():
   q,e=line.split('|');self.add('SQ',q,e,'concept')
 def numeric(self,families,make,sqfamilies,cqfamilies=None):
  for fam in families:
   for n in range(10):
    d=make(fam,n);r=F(d['value']);unit=d['unit'];wrong=[]
    for v in [r*2,r/2,r+10,r-10,r+1]:
     s=fmt(v)+unit
     if s!=fmt(r)+unit and s not in wrong:wrong.append(s)
     if len(wrong)==3:break
    name=f'mcq-{fam}-{n}';text=d['text']
    if d.get('fig'):text+=self.figure(name,*d['fig'])
    c=dict(params={k:str(v) for k,v in d['params'].items()},expected=str(r),unit=unit)
    self.mcq(text,fmt(r)+unit,wrong,d['why'],fam,c)
  for fam in sqfamilies:
   for n in range(20,25):
    d=make(fam,n);text=d['text']+' প্রযোজ্য সূত্র ও এককসহ হিসাব দেখাও।'
    if d.get('fig'):text+=self.figure(f'sq-{fam}-{n}',*d['fig'])
    self.add('SQ',text,d['why'],fam,dict(params={k:str(v) for k,v in d['params'].items()},expected=str(F(d['value'])),unit=d['unit']))
  for fam in (cqfamilies if cqfamilies is not None else families):
   for n in range(10,15):
    d=make(fam,n);text='একটি পরীক্ষার তথ্য: '+d['text'].replace('কত?','নির্ণয় করতে হবে।')
    if d.get('fig'):text+=self.figure(f'cq-{fam}-{n}',*d['fig'])
    parts=[dict(label='ক',marks=1,question=d['definition'][0],solution=d['definition'][1]),dict(label='খ',marks=2,question=d['reason'][0],solution=d['reason'][1]),dict(label='গ',marks=3,question='উদ্দীপকের চাওয়া রাশিটি সূত্র ও এককসহ নির্ণয় করো।',solution=d['why']),dict(label='ঘ',marks=4,question=d['change'][0],solution=d['change'][1])]
    self.add('CQ',text,'প্রদত্ত মডেল ও শর্তে ধাপে ধাপে সমাধান; ছয় দশমিক পর্যন্ত ফল।',fam,dict(params={k:str(v) for k,v in d['params'].items()},expected=str(F(d['value'])),secondary=str(F(d['change'][2])),unit=d['unit']),parts=parts)
 def finish(self,source):
  assert Counter(q['type'] for q in self.items)==self.counts
  assert len(set(q['text'] for q in self.items))==sum(self.counts.values())
  mcqs=[q for q in self.items if q['type']=='MCQ'];names=['mcq'] if len(mcqs)<=200 else ['mcq-1','mcq-2']
  slices={names[0]:mcqs if len(names)==1 else mcqs[:len(mcqs)//2]}
  if len(names)==2:slices[names[1]]=mcqs[len(mcqs)//2:]
  slices.update({k.lower():[q for q in self.items if q['type']==k] for k in ['CQ','SQ']})
  for name,rows in slices.items():
   b=dict(category='Class 9',subject='পদার্থবিজ্ঞান',topic=self.topic,book='নিজস্ব চিত্রসহ অনুশীলনী; বোর্ড-প্রশ্ন হিসেবে আরোপ নয়',edition=f'Chapter {self.ch} illustrated draft v1; teacher review pending',sourceUrl='https://github.com/saifulsirictdev/Proshnobook_com',lang='Bangla',items=rows)
   s=enc(b);assert len(rows)<=200 and len(s.encode())<750000;save(self.out/f'{name}.json',s)
  manifest=dict(status='DRAFT',requested=self.counts,actual=dict(Counter(q['type'] for q in self.items)),fullChapterRead=False,sourcePageVerified=False,teacherApproved=False,websiteImported=False,published=False,officialYearVerified=False,assetsDeployed=False,numericVariants=True,diagramPolicy='উৎসের চিত্রনির্ভর প্রশ্ন অভিযোজিত করলে চিত্রও পুনরঙ্কন/সংযুক্ত করতে হবে; চিত্র বাদ দিয়ে শুধু লেখা নয়। না দেখা উৎস-চিত্রকে যাচাইকৃত বলা যাবে না।',sourceInspection=source,illustratedCounts={k:sum(q['type']==k and '![' in q['text'] for q in self.items) for k in self.counts},assets=self.assets,files={f'{k}.json':dict(count=len(v),sha256=sha(self.out/f'{k}.json')) for k,v in slices.items()},items=self.audit,limitations=['পরিবারভিত্তিক সংখ্যার ভ্যারিয়েন্ট; প্রতিটি আলাদা ধারণা নয়।','মূল বইয়ের পূর্ণ পাঠ/পৃষ্ঠা, পাঠ্যসীমা ও স্বাধীন শিক্ষক যাচাই বাকি।','নতুন SVG পুনরঙ্কিত/সহায়ক; মাপানুযায়ী নয়। HTML-এ inline; live asset deploy হয়নি।','পুরোনো Word-এর সব চিত্র/সমীকরণ নির্ভরযোগ্যভাবে উদ্ধার হয়নি; source-native figure coverage অসম্পূর্ণ।'])
  save(self.out/'validation.json',enc(manifest))
  def render(text):
   for a in self.assets:
    token=re.search(r'!\[[^\]]*\]\('+re.escape(a['url'])+r'\)',text)
    if token:return html.escape(text[:token.start()])+ '<figure>'+ (ROOT/a['file']).read_text()+'</figure>'+html.escape(text[token.end():])
   return html.escape(text)
  blocks=[]
  for kind in ['MCQ','CQ','SQ']:
   blocks.append(f'<h2>{kind} — {self.counts[kind]}</h2>')
   for i,q in enumerate([q for q in self.items if q['type']==kind],1):
    s=f'<article data-kind="{kind}"><h3>{i}. {render(q["text"])}</h3>'
    if kind=='MCQ':s+='<div class="options">'+''.join(f'<p>{k}. {render(v)}</p>' for k,v in q['options'].items())+'</div>'
    s+='<details><summary>উত্তর ও সমাধান</summary><p>'+html.escape(('সঠিক উত্তর: '+q['correct']+' — ' if kind=='MCQ' else '')+q['explanation'])+'</p>'
    if kind=='CQ':s+=''.join(f'<p><b>{x["label"]}) ({x["marks"]}) {html.escape(x["question"])}</b></p><p>{html.escape(x["solution"])}</p>' for x in q['parts'])
    blocks.append(s+'</details></article>')
  font=ROOT/'public/fonts/Kalpurush.woff2';css=''
  # Use existing font if present, otherwise system Bangla fallback.
  if font.exists():
   import base64
   css='@font-face{font-family:Bn;src:url(data:font/woff2;base64,'+base64.b64encode(font.read_bytes()).decode()+')}'
  doc='<!doctype html><html lang="bn"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+self.title+' — চিত্রসহ খসড়া</title><style>'+css+'body{max-width:1000px;margin:24px auto;padding:0 20px;font:18px/1.8 Bn,system-ui,sans-serif;color:#162d40}h1,h2{color:#135b56}article{border:1px solid #cbd5df;border-radius:8px;padding:18px;margin:18px 0;break-inside:avoid}h3{font-size:1.05em;white-space:pre-wrap}figure{max-width:480px;margin:16px auto}svg{display:block;width:100%;height:auto}.options{display:grid;grid-template-columns:1fr 1fr}details{background:#eef6f3;padding:12px}summary{cursor:pointer}.notice{padding:20px;background:#fff4d5}@media print{body{font-size:11pt}h2{break-before:page}details{display:block}figure{max-width:350px}}</style><h1>'+self.title+'</h1><div class="notice"><b>চিত্রসহ নিজস্ব খসড়া — প্রকাশিত নয়</b><p>'+str(self.counts['MCQ'])+' MCQ / '+str(self.counts['CQ'])+' CQ / '+str(self.counts['SQ'])+' SQ। একই পরিবারের সংখ্যাভিত্তিক ভ্যারিয়েন্ট আছে; সবগুলো স্বাধীন ধারণা নয়। মূল বইয়ের পূর্ণ পাঠ/পৃষ্ঠা ও শিক্ষক যাচাই বাকি। উৎসের সব চিত্র উদ্ধার হয়নি; নতুন প্রয়োজনীয় চিত্র পুনরঙ্কিত/সহায়ক, মাপানুযায়ী নয়। JSON-এর image URL deploy হয়নি; এই review-তে সব SVG inline আছে।</p><p>মানবণ্টন: ২৫ MCQ সব, ৭ CQ থেকে ৪, ৭ SQ থেকে ৫; তত্ত্বীয় ৭৫ + ব্যবহারিক ২৫; ৩ ঘণ্টা। পূর্ণ সিলেবাসের মডেল নয়। Print-এর আগে প্রয়োজনীয় উত্তরগুলো খুলুন।</p></div>'+''.join(blocks)+'<pre hidden>'+html.escape((ROOT/'public/fonts/kalpurush-OFL.txt').read_text())+'</pre></html>\n'
  save(ROOT/f'docs/question-bank/ssc-physics/chapter-{self.ch}-review.html',doc)
  print(f'Chapter {self.ch}: {self.counts}; diagrams: {manifest["illustratedCounts"]}; DRAFT only.')
