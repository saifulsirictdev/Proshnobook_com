"""SSC chapter 9 numeric illustrated DRAFT. Dev-only SymPy 1.14.0; no network/DB."""
from illustrated_geometry_bank import *
bank=Bank(9,'৯ম অধ্যায়: ত্রিকোণমিতিক অনুপাত',dict(MCQ=250,CQ=150,SQ=70))
bank.book='Proshnobook — সংকলন ও নিজস্ব চিত্রসহ ত্রিকোণমিতি অনুশীলনী'
def mt(v):return '$'+tex(v)+'$'
def fig(o,a,**kw):return ('trig-right',dict(opp=float(o),adj=float(a),**kw))
def source(pdf,num,board,text,options,key,answer,why,o,a,native=False,domain=False,**kw):
 bank.source(pdf,num,board,text,options,key,answer,why,fig(o,a,**kw),native)
 if board=='sylhet':bank.audit[-1]['adaptation']+=' মূল রাশি সংজ্ঞায়িত হওয়ার sinθ≠0 শর্তটি স্পষ্ট করা হয়েছে।'
 if domain:
  bank.audit[-1]['adaptation']+=' উৎসে আলাদা করে লেখা না থাকা সূক্ষ্মকোণ-শর্ত এখানে স্পষ্ট করে যোগ করা হয়েছে; তাই শর্তযুক্ত অভিযোজন, অবিকল বোর্ড প্রশ্ন নয়।'
  bank.audit[-1]['explicitAcuteDomainAdded']=True
source(1,9,'dhaka',r'$\tan A=\frac43$ হলে $\sqrt{\frac{1-\sin^2 A}{\sin^2 A}}$ কত?', [r'$\frac34$',r'$\frac45$',r'$\frac54$',r'$\frac53$'],'A',R(3,4),r'$1-\sin^2 A=\cos^2 A$। তাই রাশি $=|\cot A|=\frac34$। বর্গমূলের ধনাত্মক মান নেওয়া হয়েছে।',4,3,theta='A')
source(1,11,'dhaka',r'$\theta$ সূক্ষ্মকোণ এবং $\sin\theta=\frac{\sqrt3}{2}$ হলে $\cot\theta$ কত?', [r'$\frac1{\sqrt3}$',r'$\frac1{\sqrt2}$',r'$\frac{\sqrt3}{2}$',r'$\sqrt3$'],'A',1/S.sqrt(3),r'সূক্ষ্মকোণ বলে $\theta=60^\circ$। তাই $\cot\theta=\frac1{\sqrt3}$।',S.sqrt(3),1,domain=True)
source(1,20,'dhaka',r'$\sec A+\tan A=\sqrt5$ হলে $\sin A$ কত?', [r'$\sqrt5$',r'$\frac32$',r'$\frac23$',r'$\frac1{\sqrt5}$'],'C',R(2,3),r'$\sec^2 A-\tan^2 A=1$ থেকে $\sec A-\tan A=1/\sqrt5$। যোগ-বিয়োগ করে $\sin A=\tan A/\sec A=(5-1)/(5+1)=2/3$।',2,S.sqrt(5),theta='A')
source(49,1,'sylhet',r'$\sin\theta\ne0$ হলে $\frac1{\sin\theta}\sqrt{\operatorname{cosec}^2\theta-\cot^2\theta}$ কত?', [r'$\sin\theta$',r'$\cot\theta$',r'$\operatorname{cosec}\theta$',r'$\tan\theta$'],'C','COSEC',r'$\operatorname{cosec}^2\theta-\cot^2\theta=1$। বর্গমূল ১, ফলে রাশি $1/\sin\theta=\operatorname{cosec}\theta$। সংজ্ঞার শর্ত স্পষ্ট করা হয়েছে।',3,4)
source(67,21,'dinajpur',r'PQR ত্রিভুজে $\angle P=90^\circ$, PR=1, RQ=2 এবং $y=\angle PRQ$। $\tan y$ কত?', [r'$\sqrt3$',r'$\frac2{\sqrt3}$',r'$\frac1{\sqrt3}$',r'$\frac12$'],'A',S.sqrt(3),r'PQ$=\sqrt{2^2-1^2}=\sqrt3$। y কোণের বিপরীত PQ এবং সন্নিহিত PR; তাই $\tan y=\sqrt3$।',1,S.sqrt(3),native=True,names=['Q','P','R'],theta='x',phi='y',complement=True,labels=dict(opp='1',hyp='2'))
source(67,22,'dinajpur',r'PQR ত্রিভুজে $\angle P=90^\circ$, PR=1, RQ=2; $x=\angle PQR$, $y=\angle PRQ$। $\sin^2x+\cos^2y$ কত?', [r'$\frac12$','$1$',r'$\frac94$','$8$'],'A',R(1,2),r'$\sin x=PR/RQ=1/2$ এবং $\cos y=PR/RQ=1/2$। তাই বর্গের যোগ $1/4+1/4=1/2$।',1,S.sqrt(3),native=True,names=['Q','P','R'],theta='x',phi='y',complement=True,labels=dict(opp='1',hyp='2'))
source(29,5,'jashore',r'$\theta$ সূক্ষ্মকোণ হলে $\sec\theta\sqrt{1-\cos^2\theta}$ কত?', [r'$\tan\theta$',r'$\cot\theta$',r'$\sin\theta$',r'$\cos\theta$'],'A','TAN',r'সূক্ষ্মকোণে $\sin\theta>0$। তাই বর্গমূল $\sin\theta$ এবং রাশি $\sin\theta/\cos\theta=\tan\theta$। সূক্ষ্মকোণ শর্ত ছাড়া বর্গমূলকে সরাসরি sin বলা ঠিক নয়।',3,4,domain=True)
source(29,25,'jashore',r'$\theta$ সূক্ষ্মকোণ এবং $\sin(90^\circ-\theta)=\frac{\sqrt3}{2}$ হলে $\theta$ কত ডিগ্রি?', ['$90$','$45$','$60$','$30$'],'D',30,r'$\sin(90^\circ-\theta)=\cos\theta$। সূক্ষ্মকোণে cos-এর এই মানে $\theta=30^\circ$।',1,S.sqrt(3),domain=True)
source(77,14,'mymensingh',r'$\cos(90^\circ-\theta)=\frac45$ হলে $\operatorname{cosec}\theta$ কত?', [r'$\frac54$',r'$\frac45$',r'$\frac35$',r'$\frac43$'],'A',R(5,4),r'$\cos(90^\circ-\theta)=\sin\theta=4/5$। তার বিপরীত অনুপাত $\operatorname{cosec}\theta=5/4$।',4,3)
source(77,16,'mymensingh',r'$\theta$ সূক্ষ্মকোণ এবং $2\sin\theta=1$ হলে $\cot\theta$ কত?', ['$0$',r'$\frac1{\sqrt3}$','$1$',r'$\sqrt3$'],'D',S.sqrt(3),r'$\sin\theta=1/2$ এবং সূক্ষ্মকোণ বলে $\theta=30^\circ$। তাই $\cot\theta=\sqrt3$।',1,S.sqrt(3),domain=True)

def mcq(f,n,text,v,why,o,a,**kw):
 v=S.simplify(v);wrong=[]
 for candidate in [1/v if v!=0 else 1,1-v,v/2,2*v,v+R(1,2),v+1,v+2,v+3]:
  candidate=S.simplify(candidate)
  if candidate.is_positive and S.simplify(candidate-v)!=0 and all(S.simplify(candidate-w)!=0 for w in wrong):wrong.append(candidate)
  if len(wrong)==3:break
 assert len(wrong)==3
 bank.mcq(f,n,text,v,why,fig(o,a,**kw),wrong)
for n in range(1,13):
 o=S.Integer(n+2);a=S.Integer(2*n+3);h=S.sqrt(o*o+a*a);m=S.Integer(n+2);p=2*m;q=m*m-1;r=m*m+1
 setup=f'ABC ত্রিভুজে B সমকোণ, θ=∠BAC; BC={o} ও AB={a} সেমি। '
 vals=[('sin-sides',r'\sin',o/h,'বিপরীত বাহু/অতিভুজ'),('cos-sides',r'\cos',a/h,'সন্নিহিত বাহু/অতিভুজ'),('tan-sides',r'\tan',o/a,'বিপরীত বাহু/সন্নিহিত বাহু'),('cosec-sides',r'\operatorname{cosec}',h/o,'অতিভুজ/বিপরীত বাহু'),('sec-sides',r'\sec',h/a,'অতিভুজ/সন্নিহিত বাহু'),('cot-sides',r'\cot',a/o,'সন্নিহিত বাহু/বিপরীত বাহু')]
 for f,fn,v,desc in vals:mcq(f,n,setup+'$'+fn+r'\theta$ কত?',v,rf'পিথাগোরাসে $AC={tex(h)}$ সেমি। সংজ্ঞায় {desc} নিতে হবে।',o,a,labels=dict(opp=str(o),adj=str(a)))
 mcq('cos-from-sin',n,rf'$\theta$ সূক্ষ্মকোণ ও $\sin\theta=\frac{{{p}}}{{{r}}}$ হলে $\cos\theta$ কত?',q/r,rf'$\cos\theta=\sqrt{{1-({p}/{r})^2}}={tex(q/r)}$; সূক্ষ্মকোণে ধনাত্মক মূল।',p,q)
 mcq('sin-from-cos',n,rf'$\theta$ সূক্ষ্মকোণ ও $\cos\theta=\frac{{{q}}}{{{r}}}$ হলে $\sin\theta$ কত?',p/r,rf'$\sin\theta=\sqrt{{1-({q}/{r})^2}}={tex(p/r)}$।',p,q)
 mcq('tan-from-cot',n,rf'$\theta$ সূক্ষ্মকোণ ও $\cot\theta=\frac{{{a}}}{{{o}}}$ হলে $\tan\theta$ কত?',o/a,'tan ও cot পরস্পরের বিপরীত অনুপাত।',o,a)
 mcq('sec-from-tan',n,rf'$\theta$ সূক্ষ্মকোণ ও $\tan\theta=\frac{{{p}}}{{{q}}}$ হলে $\sec\theta$ কত?',r/q,rf'$\sec\theta=\sqrt{{1+({p}/{q})^2}}={tex(r/q)}$।',p,q)
 mcq('cosec-from-cos',n,rf'$\theta$ সূক্ষ্মকোণ ও $\cos\theta=\frac{{{q}}}{{{r}}}$ হলে $\operatorname{{cosec}}\theta$ কত?',r/p,rf'$\sin\theta={tex(p/r)}$; বিপরীত নিলে cosec।',p,q)
 mcq('sin-plus-cos',n,rf'$\theta$ সূক্ষ্মকোণ ও $\tan\theta=\frac{{{p}}}{{{q}}}$ হলে $\sin\theta+\cos\theta$ কত?',(p+q)/r,rf'অতিভুজ অনুপাতে {r}; তাই যোগ $({p}+{q})/{r}$।',p,q)
 mcq('sin-cos-product',n,rf'$\theta$ সূক্ষ্মকোণ ও $\sin\theta=\frac{{{p}}}{{{r}}}$ হলে $\sin\theta\cos\theta$ কত?',p*q/r**2,rf'ধনাত্মক $\cos\theta={tex(q/r)}$; sin ও cos গুণ করি।',p,q)
 mcq('pythagorean',n,rf'$\theta$ সূক্ষ্মকোণ হলে ${n+1}\sin^2\theta+{n+1}\cos^2\theta$ কত?',n+1,r'$\sin^2\theta+\cos^2\theta=1$; সাধারণ গুণক বাইরে নিই।',o,a)
 mcq('sec-identity',n,rf'$\theta$ সূক্ষ্মকোণ হলে ${n+2}\sec^2\theta-{n+2}\tan^2\theta$ কত?',n+2,r'$\sec^2\theta-\tan^2\theta=1$।',o,a)
 mcq('cosec-identity',n,rf'$\theta$ সূক্ষ্মকোণ হলে ${n+3}\operatorname{{cosec}}^2\theta-{n+3}\cot^2\theta$ কত?',n+3,r'$\operatorname{cosec}^2\theta-\cot^2\theta=1$।',o,a)
 mcq('cofunction',n,rf'$\theta$ সূক্ষ্মকোণ ও $\sin\theta=\frac{{{p}}}{{{r}}}$ হলে $\sin(90^\circ-\theta)$ কত?',q/r,r'পূরক কোণের sin = cos। প্রদত্ত sin থেকে ধনাত্মক cos নির্ণয় করি।',p,q,complement=True)
 x=R(90,2*n+3)
 mcq('complement-equation',n,rf'ABC-তে B সমকোণ; $\angle A={n+1}x^\circ$, $\angle C={n+2}x^\circ$। x কত?',x,'দুটি সূক্ষ্মকোণের যোগ ৯০°; x-এর সহগদ্বয় যোগ করে ৯০ ভাগ করি।',math.tan(math.radians(float((n+1)*x))),1,complement=True)
 if n%3==1:mcq('standard-values',n,rf'${n}\sin30^\circ+{n+2}\cos60^\circ$ কত?',n+1,r'$\sin30^\circ=\cos60^\circ=1/2$; সহগের যোগের অর্ধেক।',1,S.sqrt(3))
 elif n%3==2:mcq('standard-values',n,rf'${n}\sin0^\circ+{n+2}\cos90^\circ$ কত?',0,r'$\sin0^\circ=\cos90^\circ=0$। চিত্রটি সূক্ষ্মকোণের reference; প্রান্তিক মান সরাসরি বিশেষ মানের সারণি থেকে নেওয়া হয়।',1,S.sqrt(3))
 else:mcq('standard-values',n,rf'${n}\cos0^\circ+{n+2}\sin90^\circ$ কত?',2*n+2,r'$\cos0^\circ=\sin90^\circ=1$। চিত্রটি সূক্ষ্মকোণের reference; প্রান্তিক মান সরাসরি বিশেষ মানের সারণি থেকে নেওয়া হয়।',1,S.sqrt(3))
 mcq('sum-difference',n,rf'$\theta$ সূক্ষ্মকোণ ও $\tan\theta=\frac{{{p}}}{{{q}}}$ হলে $(\sin\theta+\cos\theta)^2-(\sin\theta-\cos\theta)^2$ কত?',4*p*q/r**2,r'বর্গের অন্তরের বীজগাণিতিক সূত্রে রাশি $4\sin\theta\cos\theta$। অনুপাত থেকে দুই মান বসাই।',p,q)

def cases(n):
 m=S.Integer(n+2);p=2*m;q=m*m-1;r=m*m+1;k=S.Integer(n+1)
 sn=p/r;cs=q/r;tn=p/q
 ratios=rf'$\sin\theta={tex(sn)}$, $\cos\theta={tex(cs)}$, $\tan\theta={tex(tn)}$, $\operatorname{{cosec}}\theta={tex(1/sn)}$, $\sec\theta={tex(1/cs)}$, $\cot\theta={tex(1/tn)}$।'
 base='ABC ত্রিভুজে B সমকোণ এবং θ=∠BAC সূক্ষ্মকোণ। '
 rows=[]
 def add(f,text,p1,p2,p3,o,a,checks,**kw):rows.append((f,base+text,p1,p2,p3,fig(o,a,**kw),checks))
 add('sides',f'BC={p*k}, AB={q*k} সেমি।',('θ-এর বিপরীত, সন্নিহিত ও অতিভুজ শনাক্ত কর।','বিপরীত BC, সন্নিহিত AB এবং অতিভুজ AC।'),('AC ও θ-এর ছয়টি অনুপাত নির্ণয় কর।',f'AC²={p*k}²+{q*k}²={r*r*k*k}; AC={r*k} সেমি। '+ratios),('ত্রিভুজের দুই সূক্ষ্মকোণের অনুপাতের পূরক সম্পর্ক দেখাও।',r'ধরি φ=∠BCA; θ+φ=৯০°। φ-এর বিপরীত AB, সন্নিহিত BC। তাই $\sin\varphi=AB/AC=\cos\theta$, $\cos\varphi=BC/AC=\sin\theta$, $\tan\varphi=AB/BC=\cot\theta$।'),p,q,[(p*p+q*q,r*r),(sn*sn+cs*cs,1)],labels=dict(opp=str(p*k),adj=str(q*k)),complement=True)
 perimeter=(p+q+r)*k
 add('sine-perimeter',rf'$\sin\theta={tex(sn)}$ এবং পরিসীমা {perimeter} সেমি।',('সন্নিহিত বাহুর অনুপাত নির্ণয় কর।',rf'অতিভুজের অনুপাত {r}, বিপরীত {p} নিলে সন্নিহিত $\sqrt{{{r*r}-{p*p}}}={q}$।'),('তিন বাহুর দৈর্ঘ্য নির্ণয় কর।',f'BC:AB:AC={p}:{q}:{r}। অনুপাতের যোগ {p+q+r}; গুণক {k}। তাই BC={p*k}, AB={q*k}, AC={r*k} সেমি।'),('cos ও tan নির্ণয় করে tan=sin/cos যাচাই কর।',rf'$\cos\theta={tex(cs)}$, $\tan\theta={tex(tn)}$; $({tex(sn)})/({tex(cs)})={tex(tn)}$।'),p,q,[(perimeter,(p+q+r)*k),(sn/cs,tn)])
 add('cosine-hypotenuse',rf'$\cos\theta={tex(cs)}$ ও AC={r*k} সেমি।',('AB/AC কত এবং কেন?',rf'$AB/AC=\cos\theta={tex(cs)}$।'),('AB, BC ও sin নির্ণয় কর।',rf'AB={q*k}। পিথাগোরাসে BC={p*k} সেমি; $\sin\theta={tex(sn)}$।'),('cosec ও cot নির্ণয় করে পরিচিতি যাচাই কর।',rf'$\operatorname{{cosec}}\theta={tex(r/p)}$, $\cot\theta={tex(q/p)}$। বর্গের বিয়োগ $({r*r}-{q*q})/{p*p}=1$।'),p,q,[(r*r-q*q,p*p),((r/p)**2-(q/p)**2,1)])
 add('tangent-adjacent',rf'$\tan\theta={tex(tn)}$ ও AB={q*k} সেমি।',('tan-এর সংজ্ঞা লেখ।',r'$\tan\theta=BC/AB$।'),('BC, AC ও sin নির্ণয় কর।',rf'BC={p*k}, AC=√({p*k}²+{q*k}²)={r*k} সেমি। $\sin\theta={tex(sn)}$।'),('sec²−tan²=1 প্রদত্ত মানে যাচাই কর।',rf'$\sec\theta={tex(r/q)}$; তাই $({r*r}-{p*p})/{q*q}=1$। সাধারণভাবেও $AC^2-BC^2=AB^2$-কে AB² দিয়ে ভাগ করলে পরিচিতিটি পাওয়া যায়।'),p,q,[(r*r-p*p,q*q),((r/q)**2-tn**2,1)])
 add('cotangent-opposite',rf'$\cot\theta={tex(q/p)}$ ও BC={p*k} সেমি।',('cot-এর সংজ্ঞা ও বিপরীত অনুপাত লেখ।',r'$\cot\theta=AB/BC$, তার বিপরীত $\tan\theta$।'),('AB, AC ও tan নির্ণয় কর।',rf'AB={q*k}, AC={r*k} সেমি। $\tan\theta={tex(tn)}$।'),('sin ও cos-এর ভাগ থেকে tan পুনরায় নির্ণয় কর।',ratios+rf' ভাগে $({tex(sn)})/({tex(cs)})={tex(tn)}$; সংজ্ঞার সঙ্গে মেলে।'),p,q,[(p*p+q*q,r*r),(sn/cs,tn)])
 add('secant-adjacent',rf'$\sec\theta={tex(r/q)}$ ও AB={q*k} সেমি।',('sec-এর বিপরীত অনুপাত নির্ণয় কর।',rf'$\cos\theta=1/\sec\theta={tex(cs)}$।'),('AC, BC ও tan নির্ণয় কর।',rf'AC=AB·secθ={r*k}। পিথাগোরাসে BC={p*k} সেমি; $\tan\theta={tex(tn)}$।'),('sec²−1 থেকে tan² নির্ণয় ও ধনাত্মক মূলের কারণ লেখ।',rf'$\sec^2\theta-1={tex((r/q)**2-1)}=\tan^2\theta$। θ সূক্ষ্মকোণ বলে tan ধনাত্মক; তাই $\tan\theta={tex(tn)}$।'),p,q,[((r/q)**2-1,tn**2),(q*k*r/q,r*k)])
 add('cosecant-opposite',rf'$\operatorname{{cosec}}\theta={tex(r/p)}$ ও BC={p*k} সেমি।',('cosec-এর বিপরীত অনুপাত নির্ণয় কর।',rf'$\sin\theta={tex(sn)}$।'),('AC, AB ও cos নির্ণয় কর।',rf'AC={r*k}; AB=√({r*k}²−{p*k}²)={q*k} সেমি। $\cos\theta={tex(cs)}$।'),('sin·cos নির্ণয় করে দুই কোণের বিনিময়ে গুণফল অপরিবর্তিত দেখাও।',rf'$\sin\theta\cos\theta={tex(sn*cs)}$। পূরক φ-এ sinφ=cosθ ও cosφ=sinθ; তাই গুণের ক্রম বদলালেও একই মান।'),p,q,[(r*r-p*p,q*q),(sn*cs,cs*sn)],complement=True)
 x=R(90,2*n+3);aa=(n+1)*x;cc=(n+2)*x
 add('complementary-angles',rf'$\angle A={n+1}x^\circ$, $\angle C={n+2}x^\circ$।',('A ও C-এর কোণের যোগ কত?','সমকোণী ত্রিভুজের বাকি দুই কোণের যোগ ৯০°।'),('x, A ও C নির্ণয় কর।',rf'${2*n+3}x=90$; $x={tex(x)}$, $A={tex(aa)}^\circ$, $C={tex(cc)}^\circ$।'),('কোণ না মেপে sinA=cosC ও tanA·tanC=1 প্রমাণ কর।',r'$\sin A=BC/AC=\cos C$। আবার $\tan A=BC/AB$, $\tan C=AB/BC$; বাহু ধনাত্মক বলে গুণফল ১।'),math.tan(math.radians(float(aa))),1,[(aa+cc,90)],complement=True)
 add('thirty-degrees',rf'$\theta=30^\circ$ ও AC={2*k} সেমি।',('sin30° ও cos30°-এর মান লেখ।',r'$\sin30^\circ=1/2$, $\cos30^\circ=\sqrt3/2$।'),('BC, AB ও tanθ নির্ণয় কর।',rf'BC=AC/২={k}; AB={tex(k*S.sqrt(3))} সেমি; $\tan\theta=1/\sqrt3$।'),('প্রদত্ত বাহুগুলো পিথাগোরাস মেনে চলে দেখাও।',rf'$BC^2+AB^2={k*k}+{3*k*k}={4*k*k}=AC^2$। সমবাহু ত্রিভুজের অর্ধেকেও এই ১:√৩:২ অনুপাত পাওয়া যায়।'),1,S.sqrt(3),[(k*k+3*k*k,(2*k)**2)],labels=dict(hyp=str(2*k)))
 add('fortyfive-degrees',rf'$\theta=45^\circ$ ও AB={k} সেমি।',('C কোণ নির্ণয় কর।','C=৯০°−৪৫°=৪৫°; তাই সমান কোণের বিপরীত বাহু AB=BC।'),('BC, AC ও sinθ নির্ণয় কর।',rf'BC={k}, AC={tex(k*S.sqrt(2))} সেমি। $\sin\theta=1/\sqrt2$।'),('tanθ ও sec²θ−tan²θ নির্ণয় কর।',r'$\tan45^\circ=1$, $\sec45^\circ=\sqrt2$। তাই বর্গের বিয়োগ $2-1=1$।'),1,1,[(k*k+k*k,(k*S.sqrt(2))**2),(2-1,1)],labels=dict(adj=str(k)))
 add('sixty-degrees',rf'$\theta=60^\circ$ ও AC={2*k} সেমি।',('cos60° ও sin60°-এর মান লেখ।',r'$\cos60^\circ=1/2$, $\sin60^\circ=\sqrt3/2$।'),('AB, BC ও cotθ নির্ণয় কর।',rf'AB={k}, BC={tex(k*S.sqrt(3))} সেমি। $\cot\theta=1/\sqrt3$।'),('θ-এর পূরক φ-এর sin, cos ও tan নির্ণয় কর।',r'φ=৩০°। তাই $\sin\varphi=1/2$, $\cos\varphi=\sqrt3/2$, $\tan\varphi=1/\sqrt3$; পূরক অনুপাতের সম্পর্ক মেনে চলে।'),S.sqrt(3),1,[(k*k+3*k*k,(2*k)**2)],complement=True)
 t=S.Integer(n+2);u=(t+1/t)/2;v=(t-1/t)/2
 add('sec-plus-tan',rf'$\sec\theta+\tan\theta={t}$।',('secθ−tanθ নির্ণয় কর।',rf'$\sec^2\theta-\tan^2\theta=1$ থেকে $\sec\theta-\tan\theta=1/{t}$।'),('secθ, tanθ ও sinθ নির্ণয় কর।',rf'যোগ-বিয়োগে $\sec\theta={tex(u)}$, $\tan\theta={tex(v)}$; ভাগে $\sin\theta={tex(v/u)}$।'),('পাওয়া মানদ্বয়ের যোগ ও বর্গের বিয়োগ যাচাই কর।',rf'যোগ ${tex(u)}+{tex(v)}={t}$। বর্গের বিয়োগ $(\sec+\tan)(\sec-\tan)={t}\times1/{t}=1$। θ সূক্ষ্মকোণে সব প্রযোজ্য অনুপাত ধনাত্মক।'),t*t-1,2*t,[(u+v,t),(u*u-v*v,1),(v/u,(t*t-1)/(t*t+1))])
 add('cosec-plus-cot',rf'$\operatorname{{cosec}}\theta+\cot\theta={t}$।',('cosecθ−cotθ নির্ণয় কর।',rf'$\operatorname{{cosec}}^2\theta-\cot^2\theta=1$ থেকে বিয়োগ $1/{t}$।'),('cosecθ, cotθ ও cosθ নির্ণয় কর।',rf'যোগ-বিয়োগে $\operatorname{{cosec}}\theta={tex(u)}$, $\cot\theta={tex(v)}$; ভাগে $\cos\theta={tex(v/u)}$।'),('পাওয়া মানে sin²θ+cos²θ যাচাই কর।',rf'$\sin\theta=1/u={tex(1/u)}$। $\cos\theta=v/u$। তাই বর্গের যোগ $(1+v^2)/u^2=1$, কারণ $u^2-v^2=1$।'),2*t,t*t-1,[(u+v,t),(u*u-v*v,1),((1/u)**2+(v/u)**2,1)])
 z=sn+cs;prod=sn*cs
 add('sum-to-product',rf'$\sin\theta+\cos\theta={tex(z)}$।',('যোগের বর্গ প্রসারিত কর।',r'$a^2=\sin^2\theta+\cos^2\theta+2\sin\theta\cos\theta=1+2\sin\theta\cos\theta$।'),('sinθ·cosθ নির্ণয় কর।',rf'গুণফল $(a^2-1)/2={tex(prod)}$।'),('sin⁴θ+cos⁴θ নির্ণয় কর।',rf'রাশি $(\sin^2\theta+\cos^2\theta)^2-2\sin^2\theta\cos^2\theta=1-2({tex(prod)})^2={tex(sn**4+cs**4)}$। শুধু যোগ থেকে θ ও তার পূরককে আলাদা করা যায় না, কিন্তু এই সমমিত রাশির মান নির্দিষ্ট।'),p,q,[((z*z-1)/2,prod),(1-2*prod**2,sn**4+cs**4)])
 z=tn+1/tn
 add('tan-plus-cot',rf'$\tan\theta+\cot\theta={tex(z)}$।',('যোগটিকে sin ও cos-এর এক ভগ্নাংশে প্রকাশ কর।',r'$\tan\theta+\cot\theta=(\sin^2\theta+\cos^2\theta)/(\sin\theta\cos\theta)=1/(\sin\theta\cos\theta)$।'),('sinθ·cosθ ও (sinθ+cosθ)² নির্ণয় কর।',rf'গুণফল ${tex(1/z)}$; বর্গের যোগ-প্রসারণে $(\sin\theta+\cos\theta)^2=1+2/{tex(z)}={tex(1+2/z)}$।'),('যেকোনো সূক্ষ্মকোণে tanθ+cotθ≥2 প্রমাণ কর।',r'ধনাত্মক $t=\tan\theta$ নিলে $(t-1)^2\ge0$। t দিয়ে ভাগে $t+1/t\ge2$। সমতা হয় t=1 অর্থাৎ θ=৪৫°-এ।'),p,q,[(1/z,prod),(1+2/z,(sn+cs)**2)])
 return rows
for n in range(1,11):
 for f,text,p1,p2,p3,figure,checks in cases(n):bank.written('CQ',f,n,text,[p1,p2,p3],figure,checks)
for n in range(1,8):
 for f,text,p1,p2,p3,figure,checks in cases(n)[:10]:bank.written('SQ',f,n,'সংক্ষিপ্ত প্রশ্ন: '+text+' '+p2[0],p2[1],figure,checks)
for question in bank.rows:
 if question['type']=='CQ':question['explanation']='চিত্র মাপানুযায়ী নয়। অনুপাতের সংজ্ঞা, সূক্ষ্মকোণের শর্ত, পিথাগোরাস ও প্রযোজ্য পরিচিতি ব্যবহার করে প্রতিটি অংশে সমাধান দেওয়া আছে।'
bank.emit()
