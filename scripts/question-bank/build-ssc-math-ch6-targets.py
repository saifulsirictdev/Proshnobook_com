"""SSC chapter 6: 150 MCQ / 50 CQ / 30 SQ, illustrated draft.
Only stdlib + development-only sympy==1.14.0. No DB/network/approval/deploy.
Public SVG URLs are deployment targets, NOT assertions of live availability.
"""
import hashlib,html,json,sys,math
from pathlib import Path
from collections import Counter
import sympy as S
ROOT=Path(__file__).resolve().parents[2];BASE=ROOT/'content/question-bank/ssc/math/chapter-6'
ASSETS=ROOT/'public/question-bank/ssc-math-ch6-v1'
URLROOT='https://proshnobook.com/question-bank/ssc-math-ch6-v1/'
SOURCE='3.-Math-Link-Board-142-311_Compressed-1.pdf'
SOURCEURL='https://drive.google.com/file/d/1dbnQgd9Su9CBeId1RV-hShNh8IG_YOJ5/view'
R=S.Rational;rows=[];audit=[];assets=[]
def tex(v):return S.latex(S.sympify(v))
def save(path,text):
 if '--check' in sys.argv:assert path.read_text()==text,f'Stale {path}'
 else:path.parent.mkdir(parents=True,exist_ok=True);path.write_text(text)
def filemeta(path):
 b=path.read_bytes();return dict(file=str(path.relative_to(ROOT)),bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
def diagram(name,kind,labels=(),names=('A','B','C'),sides=()):
 def line(x1,y1,x2,y2):return f'<path d="M{x1} {y1}L{x2} {y2}"/>'
 def text(px,py,t):return f'<text x="{px}" y="{py}">{html.escape(str(t))}</text>'
 def lbl(i):return labels[i] if i<len(labels) else ''
 a,b,c=names
 shapes='';words=''
 if kind in ['triangle','exterior','isos','median','incenter','bisector','sides','right']:
  def numeric(v):
   try:return float(str(v).rstrip('°'))
   except ValueError:return None
  angleA=numeric(lbl(0));angleB=numeric(lbl(1));angleC=numeric(lbl(2))
  if kind=='right':angleB=90
  if kind=='median' and sides:
   sa,sb,sc=map(float,sides);angleA=math.degrees(math.acos((sa*sa+sb*sb-sc*sc)/(2*sa*sb)))
  if angleA is None and angleB is not None and angleC is not None:angleA=180-angleB-angleC
  if angleA is None:angleA=60
  if angleB is None:angleB=(180-angleA)/2
  angleC=180-angleA-angleB
  assert min(angleA,angleB,angleC)>0
  ar,br,cr=map(math.radians,[angleA,angleB,angleC]);side=math.sin(cr)/math.sin(ar)
  ux,uy=side*math.cos(br),-side*math.sin(br)
  lo=min(0,ux);hi=max(1,ux);scale=min(235/(hi-lo),165/(-uy));shift=155-(lo+hi)*scale/2
  ax,ay=round(shift+ux*scale,3),round(220+uy*scale,3);bx,by=round(shift,3),220;cx,cy=round(shift+scale,3),220
  shapes=f'<path d="M{ax} {ay}L{bx} {by}L{cx} {cy}Z"/>'
  pts=[(ax,ay),(bx,by),(cx,cy)];center=(sum(p[0] for p in pts)/3,sum(p[1] for p in pts)/3)
  for i,((px,py),title) in enumerate(zip(pts,names)):
   dx,dy=px-center[0],py-center[1];ll=math.hypot(dx,dy)
   words+=text(round(px+15*dx/ll,2),round(py+15*dy/ll+4,2),title)
   vectors=[]
   for j,(qx,qy) in enumerate(pts):
    if i!=j:
     length=math.hypot(qx-px,qy-py);vectors.append(((qx-px)/length,(qy-py)/length))
   vx=sum(v[0] for v in vectors);vy=sum(v[1] for v in vectors);ll=math.hypot(vx,vy)
   words+=text(round(px+38*vx/ll,2),round(py+38*vy/ll+4,2),lbl(i))
  if kind in ['isos','median']:
   for px,py in [((ax+bx)/2,(ay+by)/2),((ax+cx)/2,(ay+cy)/2)]:shapes+=line(round(px-4,2),round(py-3,2),round(px+4,2),round(py+3,2))
  if kind=='right':shapes+=f'<path d="M{bx} {by-12}H{bx+12}V{by}"/>'
  if kind in ['median','bisector']:
   # Angle bisector foot divides BC in ratio AB:AC.
   ab=math.hypot(ax-bx,ay-by);ac=math.hypot(ax-cx,ay-cy)
   foot=(bx*ac+cx*ab)/(ab+ac)
   shapes+=line(ax,ay,round(foot,3),220);words+=text(round(foot,3),245,'D')
   if kind=='median':shapes+=f'<path d="M{foot} 208H{foot+12}V220"/>'
  if kind=='exterior':
   shapes+=line(cx,220,320,220);words+=text(320,243,'D')+text(round(cx+30,3),203,lbl(3))
  if kind=='incenter':
   wa=math.hypot(bx-cx,by-cy);wb=math.hypot(ax-cx,ay-cy);wc=math.hypot(ax-bx,ay-by)
   ix=(wa*ax+wb*bx+wc*cx)/(wa+wb+wc);iy=(wa*ay+wb*by+wc*cy)/(wa+wb+wc)
   for px,py in pts:shapes+=line(px,py,round(ix,3),round(iy,3))
   words+=text(round(ix,3),round(iy-9,3),'O' if name.startswith('source-') else 'I')+text(round(ix,3),round(iy+25,3),lbl(3))
  if sides:
   for px,py,t in [((ax+bx)/2-18,(ay+by)/2,sides[0]),((ax+cx)/2+18,(ay+cy)/2,sides[1]),((bx+cx)/2,260,sides[2])]:words+=text(round(px,2),round(py,2),t)
 elif kind in ['linear','complement','vertical','around','bisect']:
  shapes=line(45,155,290,155)+line(165,155,240,45)
  if kind=='linear':
   try:theta=math.radians(180-float(S.sympify(str(lbl(0)).rstrip('°'))))
   except ValueError:theta=math.radians(120)
   ex=165+115*math.cos(theta);ey=155-115*math.sin(theta)
   shapes=line(45,155,290,155)+line(165,155,round(ex,2),round(ey,2))
  words=text(28,162,'A')+text(305,162,'B')+text(162,177,'O')+text(246,36,'C')
  if kind=='complement':
   shapes=line(165,155,290,155)+line(165,155,165,35)+line(165,155,240,65)+'<path d="M165 138H182V155"/>'
   words=text(305,162,'A')+text(160,25,'B')+text(162,177,'O')+text(250,60,'C')
   words+=text(216,142,lbl(0))+text(180,94,lbl(1))
  elif kind=='vertical':
   shapes+=line(165,155,112.5,232);words+=text(107,247,'D')+text(210,132,lbl(0))+text(124,183,lbl(1))
  elif kind=='around':
   values=[float(str(v).rstrip('°')) for v in labels[:3]];values.append(360-sum(values))
   angle=0;shapes='';words=text(165,158,'O')
   for i,value in enumerate(values):
    rad=math.radians(angle);mid=math.radians(angle+value/2)
    shapes+=line(165,140,round(165+115*math.cos(rad),2),round(140-100*math.sin(rad),2))
    words+=text(round(165+62*math.cos(mid),2),round(140-60*math.sin(mid),2),lbl(i));angle+=value
  elif kind=='bisect':
   shapes+=line(165,155,202,46);words+=text(200,34,'D')+text(180,110,'x')
  else:
   if kind=='linear':words=words.replace(text(246,36,'C'),text(round(ex,2),round(ey-10,2),'C'))
   words+=text(115,132,lbl(0))+text(217,137,lbl(1))
 elif kind in ['parallel','cointerior']:
  degree=float(str(lbl(0)).rstrip('°'));upper=240;lower=upper-110/math.tan(math.radians(degree))
  shapes=line(15,75,300,75)+line(15,185,300,185)+line(round(lower-15,2),round(185+15*math.tan(math.radians(degree)),2),255,round(75-15*math.tan(math.radians(degree)),2))
  words=text(312,80,'l')+text(312,190,'m')+text(75,36,'l ∥ m')
  words+=text(upper-30 if kind=='cointerior' else upper+28,102 if kind=='cointerior' else 64,lbl(0))
  words+=text(round(lower-25 if kind=='cointerior' else lower+28,2),170 if kind=='cointerior' else 172,lbl(1))
 elif kind=='congruence':
  shapes='<path d="M75 45L35 170L140 170ZM250 45L210 170L315 170Z"/>'
  for px,py,t in [(75,30,'A'),(23,190,'B'),(145,190,'C'),(250,30,'D'),(198,190,'E'),(320,190,'F'),(17,110,lbl(0)),(192,110,lbl(1))]:words+=text(px,py,t)
 elif kind=='pentagon':
  shapes='<path d="M170 30L280 110L238 230H102L60 110Z"/>'
  words=text(170,75,'x')+text(170,260,'regular pentagon')
 else:raise ValueError(kind)
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 345 290" width="345" height="290" role="img" aria-label="Geometry diagram"><rect width="345" height="290" fill="white"/><g stroke="#111827" stroke-width="2" fill="none" stroke-linejoin="round">{shapes}</g><g font-family="Arial,sans-serif" font-size="16" text-anchor="middle" fill="#111827">{words}<text x="172" y="281" font-size="11">Schematic — not to scale</text></g></svg>\n'
 path=ASSETS/(name+'.svg');save(path,svg);assets.append({**filemeta(path),'url':URLROOT+path.name,'kind':kind,'labels':list(map(str,labels)),'names':list(names),'sides':list(map(str,sides))})
 return f'\n![জ্যামিতিক চিত্র; মাপানুযায়ী নয়]({URLROOT}{name}.svg)'
def put(kind,f,n,text,why,fig=None,**extra):
 stem=text+(diagram(f'{kind.lower()}-{f}-{n}',*fig) if fig else '')
 rows.append(dict(type=kind,text=stem,explanation=why,page=f'নিজস্ব অনুশীলনী; Ch6/{kind}/{f}/{n}; বোর্ড/বইয়ের অবিকল নয়',difficulty='HARD' if kind=='CQ' else 'MEDIUM',**extra))
 audit.append(dict(origin='ORIGINAL_PARAMETERISED_PRACTICE_NOT_BOARD_OR_TEXTBOOK',family=f,variant=n,hasDiagram=bool(fig)))
def mcq(f,n,text,value,why,fig,expression):
 value=S.sympify(value);assert S.simplify(S.sympify(expression)-value)==0
 choices=[value,value+1,value-1,value+2];shift=(len(f)+n)%4;choices=choices[shift:]+choices[:shift];key='ABCD'[choices.index(value)]
 put('MCQ',f,n,text,why+' সঠিক উত্তর $'+tex(value)+'$।',fig,options={k:'$'+tex(v)+'$' for k,v in zip('ABCD',choices)},correct=key)
 audit[-1].update(answerExpression=str(value),recomputeExpression=expression,choiceExpressions=list(map(str,choices)),correct=key)
def source(pdf,qnum,board,text,options,key,value,why,fig,sourceHadFigure):
 stem=text+(diagram(f'source-{board}-{qnum}',*fig) if fig else '')
 rows.append(dict(type='MCQ',text=stem,options=dict(zip('ABCD',options)),correct=key,explanation=why,page=f'সংকলন: মুদ্রিত {pdf+141}; PDF {pdf}; প্রশ্ন {qnum}',difficulty='MEDIUM',provenance=[dict(kind='board',board=board,examYear=2024,sourceFile=SOURCE,pdfPage=pdf,printedPage=str(pdf+141),questionNumber=str(qnum))]))
 audit.append(dict(origin='ADAPTED_BOARD_COMPILATION_REDRAWN_OR_ADDED_FIGURE',family='board-seed',variant=len(rows),visualRead=True,hasDiagram=bool(fig),sourceHadFigure=sourceHadFigure,answerExpression=str(value),correct=key,adaptation='মূল গাণিতিক তথ্য/বিকল্পের ক্রম বজায়; যৌথ উদ্দীপক inline, চিত্র নিজস্বভাবে পুনরায় আঁকা অথবা সহায়ক চিত্র সংযোজিত। স্ক্যানের অবিকল প্রতিরূপ নয়।'))
source(20,24,'cumilla',r'ত্রিভুজ ABC-তে $\angle ABC=30^\circ$, $\angle ACB=60^\circ$ এবং BA-কে A-এর দিকে D পর্যন্ত বাড়ানো হয়েছে। $\angle CAD$ কত?',
 ['$30^\circ$','$60^\circ$','$90^\circ$','$100^\circ$'],'C',90,
 r'বহিঃকোণ $\angle CAD=\angle ABC+\angle ACB=30^\circ+60^\circ=90^\circ$।',('exterior',['60°','30°','','x'],('C','B','A')),True)
source(29,18,'jashore',r'$\angle X=70^\circ$, $XY=XZ$ এবং OY ও OZ হলো $\angle Y$ ও $\angle Z$-এর সমদ্বিখণ্ডক। $\angle XYZ$ কত?',
 ['$70^\circ$','$65^\circ$','$60^\circ$','$55^\circ$'],'D',55,r'সমদ্বিবাহু ত্রিভুজের ভূমির কোণ সমান। তাই $\angle XYZ=(180^\circ-70^\circ)/2=55^\circ$।',('incenter',['70°','','',''],('X','Y','Z')),True)
source(29,19,'jashore',r'$\angle X=70^\circ$, $XY=XZ$ এবং OY ও OZ হলো $\angle Y$ ও $\angle Z$-এর সমদ্বিখণ্ডক। $\angle YOZ$ কত?',
 ['$55^\circ$','$110^\circ$','$125^\circ$','$130^\circ$'],'C',125,r'দুটি ভূমির কোণের অর্ধেকের যোগ $55^\circ$। তাই $\angle YOZ=180^\circ-55^\circ=125^\circ$।',('incenter',['70°','','','x'],('X','Y','Z')),True)
source(58,27,'barishal',r'ত্রিভুজ ABC-তে $AB=AC$, $\angle A=40^\circ$ এবং BC-কে D পর্যন্ত বাড়ানো হয়েছে। $\frac12\angle ACD$ কত ডিগ্রি?',
 ['$55^\circ$','$90^\circ$','$110^\circ$','$140^\circ$'],'A',55,r'ভূমির কোণ $70^\circ$। বহিঃকোণ $\angle ACD=110^\circ$; এর অর্ধেক $55^\circ$।',('exterior',['40°','','',''],('A','B','C')),True)
source(77,9,'mymensingh',r'ত্রিভুজ PQR-এর $\angle P$ ও $\angle Q$-এর সমদ্বিখণ্ডকদ্বয় O-তে মিলিত এবং $\angle R=40^\circ$। $\angle POQ$ কত?',
 ['$70^\circ$','$110^\circ$','$130^\circ$','$140^\circ$'],'B',110,r'$\angle POQ=90^\circ+\angle R/2=90^\circ+20^\circ=110^\circ$।',('incenter',['40°','','','x'],('R','P','Q')),True)
source(67,12,'dinajpur',r'ত্রিভুজ PQR-এর $\angle Q$ ও $\angle R$-এর সমদ্বিখণ্ডকদ্বয় O-তে মিলিত হয়েছে। $\angle P=50^\circ$ হলে $\angle QOR$ কত?',
 ['$40^\circ$','$65^\circ$','$115^\circ$','$130^\circ$'],'C',115,r'$\angle QOR=90^\circ+\angle P/2=115^\circ$।',('incenter',['50°','','','x'],('P','Q','R')),False)
source(11,3,'rajshahi',r'একটি ত্রিভুজের তিনটি কোণের অনুপাত $2:3:5$ হলে বৃহত্তম কোণটি ক্ষুদ্রতম কোণটির কত গুণ?',
 [r'$\frac52$',r'$\frac53$',r'$\frac35$',r'$\frac25$'],'A',R(5,2),r'কোণগুলো $2t,3t,5t$। তাই বৃহত্তম/ক্ষুদ্রতম $=5t/(2t)=5/2$।',('triangle',['2t','3t','5t']),False)
source(49,6,'sylhet',r'একটি সমবাহু ত্রিভুজের প্রত্যেক বাহুর দৈর্ঘ্য 10 সেমি হলে এর মধ্যমার দৈর্ঘ্য কত?',
 [r'$5\sqrt3$ সেমি',r'$3\sqrt5$ সেমি','75 সেমি','125 সেমি'],'A',5*S.sqrt(3),r'মধ্যমা লম্বও; ভূমিকে ৫ ও ৫ সেমিতে ভাগ করে। পিথাগোরাসে মধ্যমা $=\sqrt{10^2-5^2}=5\sqrt3$ সেমি।',('median',['','',''],('A','B','C'),['10','10','10']),False)
source(49,7,'sylhet','একটি ত্রিভুজ সর্বসম আঁকতে ন্যূনতম কতটি উপাত্ত প্রয়োজন?',
 ['1','2','3','4'],'C',3,'যথাযথ তিনটি স্বাধীন উপাত্ত লাগে—যেমন তিন বাহু, অথবা দুই বাহু ও অন্তর্ভুক্ত কোণ। যেকোনো তিনটি কোণ দিলেই সর্বসম হয় না।',None,False)
source(1,5,'dhaka','সুষম পঞ্চভুজের শীর্ষবিন্দুতে উৎপন্ন অন্তঃকোণের পরিমাণ কত?',
 ['$108^\circ$','$110^\circ$','$120^\circ$','$144^\circ$'],'A',108,r'পঞ্চভুজকে তিন ত্রিভুজে ভাগ করলে কোণসমষ্টি $3\times180^\circ=540^\circ$। সুষম হওয়ায় প্রতিটি অন্তঃকোণ $540^\circ/5=108^\circ$।',('pentagon',[]),False)
seed_count=len(rows)
for n in range(1,8):
 a=25+3*n;b=40+n;c=180-a-b
 tasks=[
 ('linear-pair',f'A,O,B একই সরলরেখায়। $\\angle AOC={a}^\\circ$ হলে $\\angle COB$ কত ডিগ্রি?',180-a,f'সন্নিহিত সরলকোণের যোগ ১৮০°; চাওয়া কোণ $180^\\circ-{a}^\\circ={180-a}^\\circ$।',('linear',[f'{a}°','x']),f'180-{a}'),
 ('vertical',f'AB ও CD রেখা O-তে ছেদ করেছে। $\\angle BOC={a}^\\circ$ হলে বিপ্রতীপ $\\angle AOD$ কত ডিগ্রি?',a,'বিপ্রতীপ কোণদ্বয় সমান।',('vertical',[f'{a}°','x']),str(a)),
 ('complement',f'$OA\\perp OB$, C হলো সমকোণ AOB-এর অভ্যন্তরে একটি বিন্দু। $\\angle AOC={a}^\\circ$ হলে $\\angle COB$ কত ডিগ্রি?',90-a,'দুটি অংশের যোগ ৯০°; তাই অপর অংশ ৯০° থেকে প্রদত্ত কোণ বিয়োগ।',('complement',[f'{a}°','x']),f'90-{a}'),
 ('around-point',f'O বিন্দুর চারপাশে চারটি ক্রমিক কোণ ${a}^\\circ$, ${b}^\\circ$, $100^\\circ$ ও x। x কত ডিগ্রি?',360-a-b-100,'এক বিন্দুর চারপাশে কোণসমষ্টি ৩৬০°। তিনটি প্রদত্ত কোণ বিয়োগ করতে হবে।',('around',[f'{a}°',f'{b}°','100°','x']),f'360-{a}-{b}-100'),
 ('triangle-third',f'ত্রিভুজ ABC-তে $\\angle A={a}^\\circ$ ও $\\angle B={b}^\\circ$। $\\angle C$ কত ডিগ্রি?',c,'ত্রিভুজের কোণসমষ্টি ১৮০° থেকে অন্য দুই কোণের যোগ বিয়োগ করি।',('triangle',[f'{a}°',f'{b}°','x']),f'180-{a}-{b}'),
 ('exterior',f'ত্রিভুজ ABC-তে $\\angle A={a}^\\circ$, $\\angle B={b}^\\circ$ এবং BC-কে D পর্যন্ত বাড়ানো হয়েছে। $\\angle ACD$ কত ডিগ্রি?',a+b,'বহিঃকোণ বিপরীত দুই অন্তঃকোণের যোগফলের সমান।',('exterior',[f'{a}°',f'{b}°','','x']),f'{a}+{b}'),
 ('isos-apex',f'ত্রিভুজ ABC-তে $AB=AC$ ও $\\angle B={a}^\\circ$। $\\angle A$ কত ডিগ্রি?',180-2*a,'ভূমির উভয় কোণ সমান; ১৮০° থেকে তাদের যোগ বিয়োগ।',('isos',['x',f'{a}°','']),f'180-2*{a}'),
 ('isos-base',f'ত্রিভুজ ABC-তে $AB=AC$ ও $\\angle A={a}^\\circ$। $\\angle B$ কত ডিগ্রি?',R(180-a,2),'শীর্ষকোণ বাদ দিয়ে বাকি কোণসমষ্টি দুই সমান ভাগ হয়।',('isos',[f'{a}°','x','']),f'(180-{a})/2'),
 ('right-other',f'ত্রিভুজ ABC-তে $\\angle B=90^\\circ$ ও $\\angle A={a}^\\circ$। $\\angle C$ কত ডিগ্রি?',90-a,'সমকোণী ত্রিভুজের দুই সূক্ষ্মকোণের যোগ ৯০°।',('right',[f'{a}°','','x']),f'90-{a}'),
 ('bisector',f'ত্রিভুজ ABC-তে AD হলো $\\angle A$-এর সমদ্বিখণ্ডক এবং $\\angle A={a}^\\circ$। $\\angle BAD$ কত ডিগ্রি?',R(a,2),'সমদ্বিখণ্ডক কোণকে দুই সমান অংশে ভাগ করে।',('bisector',[f'{a}°','','']),f'{a}/2'),
 ('incenter',f'ত্রিভুজ ABC-তে BI ও CI হলো অন্তঃকোণদ্বয়ের সমদ্বিখণ্ডক এবং $\\angle A={a}^\\circ$। $\\angle BIC$ কত ডিগ্রি?',90+R(a,2),'ত্রিভুজ BIC-তে কোণসমষ্টি থেকে $\\angle BIC=180^\\circ-(180^\\circ-\\angle A)/2$।',('incenter',[f'{a}°','','','x']),f'90+{a}/2'),
 ('corresponding',f'চিত্রের l ও m সমান্তরাল; ছেদকের সঙ্গে উপরের ছেদবিন্দুতে গঠিত কোণ ${a}^\\circ$। নিচের ছেদবিন্দুর অনুরূপ কোণ x কত ডিগ্রি?',a,'সমান্তরাল রেখায় অনুরূপ কোণ সমান।',('parallel',[f'{a}°','x']),str(a)),
 ('cointerior',f'l ও m সমান্তরাল রেখাকে একটি ছেদক ছেদ করেছে। একই পাশের অন্তঃস্থ একটি কোণ ${a}^\\circ$ হলে অপরটি x কত ডিগ্রি?',180-a,'একই পাশের অন্তঃস্থ কোণদ্বয় সম্পূরক; যোগ ১৮০°।',('cointerior',[f'{a}°','x']),f'180-{a}'),
 ('equilateral-median',f'সমবাহু ত্রিভুজ ABC-এর বাহু {2*n+4} সেমি। AD মধ্যমা হলে AD কত সেমি?',(n+2)*S.sqrt(3),'সমবাহু ত্রিভুজের মধ্যমা লম্বও। অর্ধভূমি দিয়ে পিথাগোরাস প্রয়োগে মধ্যমা $=\\sqrt3/2$ গুণ বাহু।',('median',['','',''],('A','B','C'),[str(2*n+4),str(2*n+4),str(2*n+4)]),f'{n+2}*sqrt(3)'),
 ('integer-third-side',f'এক ত্রিভুজের দুই বাহু {n+4} ও {n+6} সেমি। তৃতীয় বাহু x পূর্ণসংখ্যা হলে x-এর সম্ভাব্য মান কয়টি?',2*n+7,'বাহুর পার্থক্যের চেয়ে তৃতীয় বাহু বড় এবং যোগফলের চেয়ে ছোট। তাই $2<x<'+str(2*n+10)+'$; পূর্ণসংখ্যা ৩ থেকে '+str(2*n+9)+' পর্যন্ত।',('sides',[],('A','B','C'),[str(n+4),str(n+6),'x']),f'({n+4}+{n+6})-abs({n+4}-{n+6})-1'),
 ('congruent-side',f'$\\triangle ABC\\cong\\triangle DEF$ প্রদত্ত ক্রমে এবং $DE={n+4}$ সেমি। AB কত সেমি?',n+4,'প্রদত্ত সর্বসমতার ক্রমে AB ও DE অনুরূপ বাহু, তাই সমান।',('congruence',['x',str(n+4)]),str(n+4)),
 ('isos-perimeter',f'$AB=AC$ ত্রিভুজের পরিসীমা {4*n+20} সেমি এবং $BC={2*n+4}$ সেমি। AB কত সেমি?',n+8,'সমান দুই বাহুর যোগ পরিসীমা থেকে ভূমি বাদ দিয়ে পাওয়া যায়; তার অর্ধেক এক বাহু।',('isos',[],('A','B','C'),['x','x',str(2*n+4)]),f'({4*n+20}-{2*n+4})/2'),
 ('half-exterior',f'ত্রিভুজ ABC-তে $\\angle A={a}^\\circ$, $\\angle B={b}^\\circ$। BC-কে D পর্যন্ত বাড়ালে $\\frac12\\angle ACD$ কত ডিগ্রি?',R(a+b,2),'বহিঃকোণ দুই বিপরীত অন্তঃকোণের যোগ; তার অর্ধেক নিতে হবে।',('exterior',[f'{a}°',f'{b}°','','']),f'({a}+{b})/2'),
 ('angle-ratio',f'ত্রিভুজ ABC-এর কোণগুলোর অনুপাত $1:2:{n+2}$। ক্ষুদ্রতম কোণ কত ডিগ্রি?',R(180,n+5),'অনুপাতের মোট অংশ '+str(n+5)+'। এক অংশ $180^\\circ/'+str(n+5)+'$।',('triangle',['x','2x',str(n+2)+'x']),f'180/{n+5}'),
 ('equilateral-angle',f'সমবাহু ত্রিভুজ ABC-তে AD কোণসমদ্বিখণ্ডক। $\\angle BAD+{n}^\\circ$ কত ডিগ্রি?',30+n,'সমবাহু ত্রিভুজের কোণ ৬০°; তার অর্ধেক ৩০°। চাওয়া রাশিতে প্রদত্ত সংখ্যা যোগ করি।',('bisector',['60°','','']),f'60/2+{n}')]
 for f,t,v,w,fig,e in tasks:mcq(f,n,t,v,w,fig,e)

def written(kind,f,n,text,parts,checks,fig):
 for lhs,rhs in checks:assert S.simplify(S.sympify(lhs)-S.sympify(rhs))==0,(f,n,lhs,rhs)
 if kind=='CQ':
  put(kind,f,n,text,'চিত্র মাপানুযায়ী নয়। প্রতিটি অংশে প্রদত্ত শর্ত, প্রযোজ্য উপপাদ্য ও সমাধান দেওয়া আছে।',fig,parts=[dict(label=l,marks=m,question=q,solution=sol) for l,m,(q,sol) in zip(['ক','খ','গ'],[2,4,4],parts)])
 else:put(kind,f,n,text,parts,fig)
 audit[-1].update(exactChecks=[dict(lhs=str(l),rhs=str(r)) for l,r in checks],reviewNote='Stored exact witnesses are not independent teacher verification of every proof step.')
for n in range(1,6):
 a=35+3*n;b=50+n;c=180-a-b
 written('CQ','triangle-exterior',n,rf'ত্রিভুজ ABC-তে $\angle A={a}^\circ$, $\angle B={b}^\circ$ এবং BC-কে D পর্যন্ত বাড়ানো হয়েছে।',[
 ('অন্তঃকোণ C নির্ণয় কর।',rf'ত্রিভুজের কোণসমষ্টি ১৮০°; তাই $C=180^\circ-{a}^\circ-{b}^\circ={c}^\circ$।'),
 ('বহিঃকোণ ACD নির্ণয় করে দুই উপায়ে মিলাও।',rf'সরলকোণ থেকে $\angle ACD=180^\circ-{c}^\circ={a+b}^\circ$। আবার বিপরীত অন্তঃকোণদ্বয়ের যোগ ${a}^\circ+{b}^\circ={a+b}^\circ$।'),
 ('প্রত্যেক শীর্ষে একই দিকে একটি করে বহিঃকোণ নিলে যোগফল কত? উপপাদ্য ব্যবহার করে দেখাও।',rf'বহিঃকোণগুলো $180^\circ-A$, $180^\circ-B$, $180^\circ-C$। যোগ $540^\circ-(A+B+C)=360^\circ$। এখানে মানগুলো ${180-a}^\circ,{180-b}^\circ,{180-c}^\circ$; যোগও ৩৬০°।')],[(a+b+c,180),((180-a)+(180-b)+(180-c),360)],('exterior',[f'{a}°',f'{b}°','','']))
 apex=40+4*n;base=R(180-apex,2)
 written('CQ','isos-bisector',n,rf'ত্রিভুজ ABC-তে $AB=AC$, $\angle A={apex}^\circ$ এবং AD অন্তঃকোণ A-এর সমদ্বিখণ্ডক; D হলো BC-এর উপর।',[
 ('ভূমির কোণ B ও C নির্ণয় কর।',rf'সমান বাহুর বিপরীত কোণ সমান। তাই $B=C=(180^\circ-{apex}^\circ)/2={tex(base)}^\circ$।'),
 ('ত্রিভুজ BAD ও CAD সর্বসম প্রমাণ করে BD=DC দেখাও।','AB=AC প্রদত্ত, AD সাধারণ এবং ∠BAD=∠CAD সমদ্বিখণ্ডকের সংজ্ঞায়। বাহু–কোণ–বাহু (SAS) শর্তে ত্রিভুজ BAD ও CAD সর্বসম; তাই অনুরূপ বাহু BD=DC।'),
 ('AD যে BC-এর লম্ব তা প্রমাণ করে ∠BAD নির্ণয় কর।',rf'সর্বসমতায় ∠BDA=∠CDA। আবার B,D,C সরলরেখায় বলে এদের যোগ ১৮০°; তাই প্রতিটি ৯০°। অতএব $AD\perp BC$ এবং $\angle BAD={tex(R(apex,2))}^\circ$।')],[(2*base+apex,180)],('bisector',[f'{apex}°','','']))
 written('CQ','incenter',n,rf'ত্রিভুজ ABC-তে $\angle A={a}^\circ$, $\angle B={b}^\circ$। BI ও CI অন্তঃকোণদ্বয়ের সমদ্বিখণ্ডক।',[
 ('∠IBC ও ∠ICB নির্ণয় কর।',rf'$C=180^\circ-{a}^\circ-{b}^\circ={c}^\circ$। তাই $\angle IBC={tex(R(b,2))}^\circ$, $\angle ICB={tex(R(c,2))}^\circ$।'),
 ('কোণসমষ্টি ব্যবহার করে ∠BIC নির্ণয় কর।',rf'ত্রিভুজ BIC-তে $\angle BIC=180^\circ-({b}^\circ+{c}^\circ)/2={tex(90+R(a,2))}^\circ$। এটি $90^\circ+A/2$-এর সমান।'),
 ('A দশ ডিগ্রি বাড়িয়ে B অপরিবর্তিত রাখলে নতুন অন্তঃকেন্দ্রের অনুরূপ কোণ কত বাড়বে? ত্রিভুজটি সম্ভব কি না দেখাও।',rf'নতুন C হবে ${c-10}^\circ>0$। তাই ত্রিভুজ সম্ভব। নতুন কোণ $90^\circ+({a+10}^\circ)/2={tex(95+R(a,2))}^\circ$; বৃদ্ধি ৫°।')],[(180-R(b+c,2),90+R(a,2)),(95+R(a,2)-(90+R(a,2)),5)],('incenter',[f'{a}°',f'{b}°','','']))
 written('CQ','parallel',n,rf'l ও m দুটি সমান্তরাল রেখা। একটি ছেদকের সঙ্গে গঠিত কোণ $\alpha={a}^\circ$।',[
 ('নিচের ছেদবিন্দুর অনুরূপ কোণ নির্ণয় কর।',rf'সমান্তরাল রেখার অনুরূপ কোণ সমান; তাই ${a}^\circ$।'),
 ('একই পাশের অন্তঃস্থ দুটি কোণের একটি α-এর সমান হলে অপরটির মান ও কারণ লেখ।',rf'একই পাশের অন্তঃস্থ কোণদ্বয়ের যোগ ১৮০°। তাই অপরটি $180^\circ-{a}^\circ={180-a}^\circ$।'),
 ('এই সম্পূরক অন্তঃস্থ কোণদ্বয়ের সমদ্বিখণ্ডকদ্বয় পরস্পর লম্ব—ব্যাখ্যা কর।','দুটি সমান্তরাল রেখার মধ্যবর্তী একই পাশের অন্তঃস্থ কোণের সমদ্বিখণ্ডক পরস্পর ছেদ করলে তাদের সঙ্গে ছেদকের তৈরি ত্রিভুজের অন্য দুই কোণের যোগ (α+180°−α)/2=90°। তাই ছেদকোণ 180°−90°=90°; সমদ্বিখণ্ডকদ্বয় লম্ব।')],[(R(a,2)+R(180-a,2),90)],('parallel',[f'{a}°','x']))
 p=n+1;q=n+2;u=R(180*p,p+q);v=180-u
 written('CQ','linear-ratio',n,rf'A,O,B একই সরলরেখায় এবং OC উপরের অর্ধতলে। $\angle AOC:\angle COB={p}:{q}$।',[
 ('দুটি কোণের সমীকরণ গঠন কর।',rf'কোণদ্বয় ${p}t$ ও ${q}t$ হলে $({p}+{q})t=180^\circ$।'),
 ('কোণদ্বয় নির্ণয় করে তাদের পার্থক্য লেখ।',rf'$t={tex(R(180,p+q))}^\circ$। তাই AOC ${tex(u)}^\circ$ ও COB ${tex(v)}^\circ$; পার্থক্য ${tex(v-u)}^\circ$।'),
 ('দুটি সন্নিহিত কোণের অভ্যন্তরীণ সমদ্বিখণ্ডক পরস্পর লম্ব প্রমাণ কর।','দুটি সমদ্বিখণ্ডক OC-এর দুই পাশে থাকে। তাদের মধ্যবর্তী কোণ AOC/2+COB/2=(AOC+COB)/2=180°/2=90°। তাই তারা লম্ব; প্রদত্ত অনুপাত বদলালেও ফল অপরিবর্তিত।')],[(u+v,180),(u/v,R(p,q))],('linear',[f'{u}°',f'{v}°']))
 ab=n+3;ac=n+4;bc=n+5
 written('CQ','sas',n,rf'দুটি ত্রিভুজ ABC ও DEF-এ $AB=DE={ab}$ সেমি, $AC=DF={ac}$ সেমি এবং $\angle A=\angle D$। আরও দেওয়া আছে $EF={bc}$ সেমি।',[
 ('প্রদত্ত উপাত্তে কোন কোণটি প্রদত্ত বাহুদ্বয়ের অন্তর্ভুক্ত কোণ তা লেখ।','ABC-তে AB ও AC-এর অন্তর্ভুক্ত কোণ A; DEF-এ DE ও DF-এর অন্তর্ভুক্ত কোণ D। এই অনুরূপ কোণদ্বয় প্রদত্তভাবে সমান।'),
 ('ত্রিভুজদ্বয় সর্বসম প্রমাণ করে BC নির্ণয় কর।',rf'AB=DE, AC=DF এবং অন্তর্ভুক্ত ∠A=∠D। SAS শর্তে $\triangle ABC\cong\triangle DEF$ (A↔D, B↔E, C↔F)। তাই $BC=EF={bc}$ সেমি।'),
 ('উভয় ত্রিভুজের পরিসীমা নির্ণয় কর। শুধু দুই বাহু ও একটি অনন্তর্ভুক্ত কোণ জানলেই একই সিদ্ধান্ত সবসময় হয় কি?',rf'প্রতিটি পরিসীমা ${ab}+{ac}+{bc}={ab+ac+bc}$ সেমি। না; SSA সাধারণভাবে সর্বসমতার শর্ত নয়। এখানে কোণটি দুই প্রদত্ত বাহুর মাঝখানে বলেই SAS প্রয়োগ বৈধ।')],[(ab+ac+bc,3*n+12)],('congruence',[str(ab),str(ab)]))
 # A consistent SSS example does not assign an incompatible included angle.
 aSide=n+5;baseSide=n+4
 written('CQ','perp-bisector',n,rf'$AB=AC={aSide}$ সেমি, $BC={baseSide}$ সেমি এবং D হলো BC-এর মধ্যবিন্দু। A ও D যোগ করা হলো।',[
 ('BD ও DC নির্ণয় কর।',rf'মধ্যবিন্দুর সংজ্ঞায় $BD=DC=BC/2={tex(R(baseSide,2))}$ সেমি।'),
 ('ত্রিভুজ ADB ও ADC সর্বসম প্রমাণ করে AD⊥BC দেখাও।','AB=AC, BD=DC এবং AD সাধারণ। SSS শর্তে ত্রিভুজ ADB ও ADC সর্বসম। তাই ∠ADB=∠ADC। B,D,C সমরেখ বলে যোগ ১৮০°; প্রতিটি ৯০°, অতএব AD⊥BC।'),
 ('AD রেখার A-এর দিকের যেকোনো বিন্দু P-এর জন্য PB=PC প্রমাণ কর।','P=D হলে ফল BD=DC থেকে আসে। অন্যথায় ∠PDB=∠PDC=90°, PD সাধারণ ও BD=DC। SAS শর্তে ত্রিভুজ PDB ও PDC সর্বসম; অতএব PB=PC। এটি লম্বদ্বিখণ্ডকের উপর বিন্দুর সমদূরত্ব ধর্ম।')],[(2*R(baseSide,2),baseSide)],('median',[],('A','B','C'),[str(aSide),str(aSide),str(baseSide)]))
 written('CQ','exterior-bisectors',n,rf'ত্রিভুজ ABC-তে $\angle A={a}^\circ$, $\angle B={b}^\circ$। BC-কে D পর্যন্ত বাড়ানো হয়েছে।',[
 ('∠ACB ও ∠ACD নির্ণয় কর।',rf'$\angle ACB={c}^\circ$ এবং $\angle ACD={a+b}^\circ$; এদের যোগ ১৮০°।'),
 ('বহিঃকোণটি প্রত্যেক বিপরীত অন্তঃকোণ অপেক্ষা বড়—সংখ্যা ও যুক্তি দিয়ে দেখাও।',rf'$\angle ACD=A+B$। তাই ACD−A=$B={b}^\circ>0$ এবং ACD−B=$A={a}^\circ>0$।'),
 ('C-এর অন্তঃকোণ ও সংলগ্ন বহিঃকোণের অভ্যন্তরীণ সমদ্বিখণ্ডকদ্বয়ের মধ্যবর্তী কোণ নির্ণয় কর।',rf'দুটি কোণ সন্নিহিত ও সম্পূরক; তাদের অভ্যন্তরীণ সমদ্বিখণ্ডকের মধ্যবর্তী কোণ $({c}^\circ+{a+b}^\circ)/2=90^\circ$। তাই সমদ্বিখণ্ডকদ্বয় লম্ব।')],[(R(c+a+b,2),90)],('exterior',[f'{a}°',f'{b}°','','']))
 aa=n+4;bb=n+6;low=bb-aa;high=aa+bb
 written('CQ','triangle-inequality',n,f'এক ত্রিভুজের দুই বাহু {aa} ও {bb} সেমি। তৃতীয় বাহু x সেমি একটি পূর্ণসংখ্যা।',[
 ('ত্রিভুজের বাহুর শর্ত থেকে x-এর সীমা লেখ।',rf'$|{bb}-{aa}|<x<{bb}+{aa}$, অর্থাৎ ${low}<x<{high}$। সমতা হলে ত্রিভুজ ভেঙে সরলরেখা হয়, তাই সমতা নয়।'),
 ('সম্ভাব্য পূর্ণসংখ্যা মানগুলো ও তাদের সংখ্যা নির্ণয় কর।',rf'মানগুলো {low+1} থেকে {high-1} পর্যন্ত সব পূর্ণসংখ্যা। সংখ্যা $({high-1})-({low+1})+1={high-low-1}$।'),
 ('সর্ববৃহৎ সম্ভব x নিলে পরিসীমা নির্ণয় কর এবং বৃহত্তম কোণ কোন বাহুর বিপরীতে হবে যুক্তিসহ লেখ।',rf'সর্ববৃহৎ $x={high-1}$। পরিসীমা ${aa}+{bb}+{high-1}={2*high-1}$ সেমি। x অন্য দুই বাহুর প্রত্যেকটির চেয়ে বড়; ত্রিভুজে বৃহত্তম বাহুর বিপরীত কোণ বৃহত্তম, তাই x-এর বিপরীত কোণ।')],[(high-low-1,2*aa-1)],('sides',[],('A','B','C'),[str(aa),str(bb),'x']))
 written('CQ','right-incenter',n,rf'ত্রিভুজ ABC-তে $\angle B=90^\circ$, $\angle A={a}^\circ$। A ও C-এর অন্তঃকোণের সমদ্বিখণ্ডকদ্বয় I-তে মিলিত।',[
 ('∠C নির্ণয় কর।',rf'দুই সূক্ষ্মকোণের যোগ ৯০°। তাই $C=90^\circ-{a}^\circ={90-a}^\circ$।'),
 ('BC-কে C-এর দিকে D পর্যন্ত বাড়ালে ∠ACD কত? দুই নিয়মে দেখাও।',rf'বহিঃকোণ $A+B={a}^\circ+90^\circ={90+a}^\circ$। আবার $180^\circ-C=180^\circ-{90-a}^\circ={90+a}^\circ$।'),
 ('∠AIC নির্ণয় করে দেখাও কেন A-এর প্রদত্ত মানের উপর ফল নির্ভর করে না।','ত্রিভুজ AIC-তে অন্য দুই কোণ A/2 ও C/2। এদের যোগ (A+C)/2=90°/2=45°। তাই ∠AIC=180°−45°=135°; A বদলালেও A+C=90° থাকায় ফল একই।')],[(180-R(a+90-a,2),135)],('right',[f'{a}°','','']))

for n in range(1,4):
 a=30+5*n;b=45+n;c=180-a-b
 examples=[
 ('linear',f'A,O,B সমরেখ এবং $\\angle AOC={a}^\\circ$। $\\angle COB$ নির্ণয় কর।',f'সন্নিহিত কোণদ্বয়ের যোগ ১৮০°। তাই COB=$180^\\circ-{a}^\\circ={180-a}^\\circ$।',180-a,f'180-{a}',('linear',[f'{a}°','x'])),
 ('vertical',f'AB ও CD ছেদক রেখা O-তে মিলিত। $\\angle BOC={a}^\\circ$ হলে $\\angle AOD$ কত?',f'বিপ্রতীপ কোণ সমান; তাই $\\angle AOD={a}^\\circ$।',a,str(a),('vertical',[f'{a}°','x'])),
 ('triangle',f'ত্রিভুজ ABC-তে $A={a}^\\circ$, $B={b}^\\circ$ হলে C নির্ণয় কর।',f'কোণসমষ্টি ১৮০°। তাই $C=180^\\circ-{a}^\\circ-{b}^\\circ={c}^\\circ$।',c,f'180-{a}-{b}',('triangle',[f'{a}°',f'{b}°','x'])),
 ('isos',f'$AB=AC$ এবং $\\angle A={a}^\\circ$ হলে ভূমির প্রতিটি কোণ নির্ণয় কর।',f'ভূমির কোণ সমান। প্রতিটি $=(180^\\circ-{a}^\\circ)/2={tex(R(180-a,2))}^\\circ$।',R(180-a,2),f'(180-{a})/2',('isos',[f'{a}°','x',''])),
 ('exterior',f'$A={a}^\\circ$, $B={b}^\\circ$। BC-কে D পর্যন্ত বাড়ালে বহিঃকোণ ACD নির্ণয় কর।',f'বহিঃকোণ দুই বিপরীত অন্তঃকোণের যোগ $={a+b}^\\circ$।',a+b,f'{a}+{b}',('exterior',[f'{a}°',f'{b}°','','x'])),
 ('incenter',f'$\\angle A={a}^\\circ$ এবং BI,CI অন্তঃকোণের সমদ্বিখণ্ডক হলে $\\angle BIC$ নির্ণয় কর।',f'ত্রিভুজ BIC-এর কোণসমষ্টিতে $\\angle BIC=90^\\circ+A/2={tex(90+R(a,2))}^\\circ$।',90+R(a,2),f'90+{a}/2',('incenter',[f'{a}°','','','x'])),
 ('parallel',f'চিত্রের l ও m দুটি সমান্তরাল রেখা। ছেদকের সঙ্গে এক ছেদবিন্দুতে কোণ ${a}^\\circ$ হলে অপর ছেদবিন্দুর অনুরূপ কোণ কত?',f'সমান্তরাল রেখায় অনুরূপ কোণ সমান; তাই ${a}^\\circ$।',a,str(a),('parallel',[f'{a}°','x'])),
 ('median',f'সমবাহু ত্রিভুজ ABC-এর বাহু {2*n+6} সেমি। AD মধ্যমা হলে BD নির্ণয় কর।',f'মধ্যমা BC-কে সমদ্বিখণ্ডিত করে। তাই $BD=BC/2={n+3}$ সেমি।',n+3,f'{2*n+6}/2',('median',[],('A','B','C'),[str(2*n+6),str(2*n+6),str(2*n+6)])),
 ('congruent',f'$\\triangle ABC\\cong\\triangle DEF$ এবং $DE={n+7}$ সেমি। অনুরূপ বাহু উল্লেখ করে AB নির্ণয় কর।',f'সর্বসমতার ক্রমে A↔D ও B↔E, তাই AB↔DE। অনুরূপ বাহু সমান; AB={n+7} সেমি।',n+7,str(n+7),('congruence',['x',str(n+7)])),
 ('inequality',f'এক ত্রিভুজের দুই বাহু {n+3} ও {n+5} সেমি। তৃতীয় বাহু পূর্ণসংখ্যা হলে ক্ষুদ্রতম সম্ভব মান কত?',f'পার্থক্য ২ সেমি, তাই তৃতীয় বাহু ২-এর চেয়ে বড়; ক্ষুদ্রতম পূর্ণসংখ্যা ৩। এটিও দুই বাহুর যোগের চেয়ে ছোট, তাই বৈধ।',3,f'abs({n+5}-{n+3})+1',('sides',[],('A','B','C'),[str(n+3),str(n+5),'x']))]
 for f,t,sol,v,e,fig in examples:written('SQ',f,n,t,sol,[(S.sympify(e),v)],fig)
counts={k:sum(q['type']==k for q in rows) for k in ['MCQ','CQ','SQ']};assert counts==dict(MCQ=150,CQ=50,SQ=30)
assert len({q['text'] for q in rows})==230
scope=dict(category='Class 9',subject='গণিত',topic='৬ষ্ঠ অধ্যায়: রেখা, কোণ ও ত্রিভুজ',book='Proshnobook — বোর্ড সংকলন ও চিত্রসহ রেখা-কোণ-ত্রিভুজ অনুশীলনী',edition='Chapter 6 target v1; DRAFT; শিক্ষক ও diagram semantic review বাকি',sourceUrl='https://github.com/saifulsirictdev/Proshnobook_com',lang='Bangla')
def emit(path,obj):
 text=json.dumps(obj,ensure_ascii=False,indent=2)+'\n';save(path,text)
 b=text.encode();return dict(file=str(path.relative_to(BASE)),bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
files=[];metaByObject={id(q):m for q,m in zip(rows,audit)}
for name,items in [('mcq',[q for q in rows if q['type']=='MCQ']),('written',[q for q in rows if q['type']!='MCQ'])]:
 for i,q in enumerate(items,1):
  metaByObject[id(q)].update(file=f'target-v1/{name}.json',itemInFile=i,questionSha256=hashlib.sha256((q['type']+'\n'+q['text']).encode()).hexdigest())
 files.append(emit(BASE/f'target-v1/{name}.json',{**scope,'items':items}))
limitations=['Numeric target met: 10 adapted compilation MCQ + 220 original parameter variants, not 230 distinct concepts.',
 'Compilation board/year labels not independently authenticated. Source figures redrawn, or helpful figures added; not facsimiles. Five source questions had native figures.',
 '149 MCQ, 50 CQ and 30 SQ carry schematic SVGs. No claim that 149 illustrated MCQ are board questions. Drawings not to scale; independent diagram/proof/teacher review pending.',
 'HTTPS image references target versioned static assets included in public/question-bank/ssc-math-ch6-v1. Assets are NOT yet deployed; production URL availability unverified. Use bundled local review gallery/assets until deployment.',
 'Source search not exhaustive. Full current-edition NCTB chapter not obtained/read; no exhaustive textbook/board coverage claim.',
 'No real database import, approval or deployment. Exact numerical witnesses do not establish every narrative proof step.']
review=dict(status='NUMERICAL_TARGET_MET_ILLUSTRATED_DRAFT_ASSET_DEPLOY_AND_TEACHER_REVIEW_PENDING',targetMet=True,teacherApproved=False,diagramTeacherApproved=False,assetsDeployed=False,assetLiveAvailabilityVerified=False,targetCounts=counts,counts=counts,boardCounts=dict(MCQ=10,CQ=0,SQ=0),originalPracticeCounts=dict(MCQ=140,CQ=50,SQ=30),remaining=dict(MCQ=0,CQ=0,SQ=0),importedCounts=dict(MCQ=0,CQ=0,SQ=0),databaseCountVerified=False,fullChapterTextbookRead=False,boardSearchExhaustive=False,source=dict(fileName=SOURCE,sourceUrl=SOURCEURL,sha256='ef88ec3c42fa52f407c39f1b978fa0494a695bac7d2b51a7c3921afa49a46111'),illustratedCounts={k:sum(q['type']==k and m['hasDiagram'] for q,m in zip(rows,audit)) for k in counts},sourceNativeFigureCount=sum(m.get('sourceHadFigure',False) for m in audit),familyCounts={k:dict(sorted(Counter(m['family'] for q,m in zip(rows,audit) if q['type']==k and m['origin'].startswith('ORIGINAL')).items())) for k in counts},assets=assets,files=files,itemReviews=audit,limitations=limitations)
seed=emit(BASE/'board-seed-v1.json',{**scope,'sourceUrl':SOURCEURL,'items':rows[:seed_count]})
rv=emit(BASE/'target-v1/validation.json',review)
emit(BASE/'targets-v1-manifest.json',dict(status=review['status'],chapter=6,category=scope['category'],subject=scope['subject'],topic=scope['topic'],counts=counts,illustratedCounts=review['illustratedCounts'],teacherApproved=False,assetsDeployed=False,importedCounts=review['importedCounts'],files=files,validation=rv,boardSeed=seed,limitations=limitations))
print('PASS: 150 MCQ + 50 CQ + 30 SQ = 230; illustrated 149/50/30, 10 adapted source + 220 original variants. DRAFT; assets not deployed.')
