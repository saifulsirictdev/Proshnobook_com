"""Explicit syllabus-oriented numerical practice families, not verbatim board items.
Each family supplies formula, units, a changed condition and conceptual reasoning.
Numbers are parameter variants; no claim of 3290 independent concepts.
"""
from fractions import Fraction as F
from physics_illustrated import fmt
TOPICS={8:'৮ম অধ্যায়: আলোর প্রতিফলন',9:'৯ম অধ্যায়: আলোর প্রতিসরণ',10:'১০ম অধ্যায়: স্থির বিদ্যুৎ',11:'১১শ অধ্যায়: চল বিদ্যুৎ',12:'১২শ অধ্যায়: বিদ্যুতের চৌম্বক ক্রিয়া',13:'১৩শ অধ্যায়: আধুনিক পদার্থবিজ্ঞান ও ইলেকট্রনিক্স',14:'১৪শ অধ্যায়: জীবন বাঁচাতে পদার্থবিজ্ঞান'}
# Each key is also an independently recomputed formula identifier in the verifier.
def models(ch):
 specs=[]
 def add(key,question,unit,formula,calc,params,change,definition,reason,fig=None):
  specs.append(dict(key=key,question=question,unit=unit,formula=formula,calc=calc,params=params,change=change,definition=definition,reason=reason,fig=fig))
 reflection=(('প্রতিফলনের কোণ কিসের সাপেক্ষে মাপা হয়?','আপতনবিন্দুতে প্রতিফলকের অভিলম্বের সাপেক্ষে প্রতিফলিত রশ্মির কোণ মাপা হয়।'),('আপতন ও প্রতিফলন কোণ সমান হলেও পৃষ্ঠের সঙ্গে কোণ কেন আলাদা?','সূত্রে উভয় কোণ অভিলম্ব থেকে মাপা হয়। সমতল পৃষ্ঠ অভিলম্বের লম্ব, তাই পৃষ্ঠের সঙ্গে কোণ 90°−i।'))
 mirror=(('দর্পণের ফোকাস কী?','প্রধান অক্ষের সমান্তরাল অক্ষসংলগ্ন রশ্মি প্রতিফলনের পরে যে বিন্দুতে মেলে বা যে বিন্দু থেকে আসছে মনে হয়, তা প্রধান ফোকাস।'),('দর্পণের সূত্র ব্যবহারে চিহ্নের ঘোষণা প্রয়োজন কেন?','বাস্তব ও অবাস্তব প্রতিবিম্ব আলাদা পাশে হয়। এখানে বাস্তব-ধনাত্মক convention: বাস্তব বস্তু u>0; অবতলে f>0, উত্তলে f<0; বাস্তব v>0, অবাস্তব v<0; 1/f=1/u+1/v।'))
 lens=(('লেন্সের ক্ষমতা কী?','মিটারে ফোকাস দূরত্বের বিপরীত P=1/f; একক dioptre। অভিসারী লেন্সের ক্ষমতা ধনাত্মক ও অপসারীর ঋণাত্মক।'),('লেন্সের সূত্রে কোন সরলীকরণ নেওয়া হয়েছে?','পাতলা লেন্স ও অক্ষসংলগ্ন রশ্মি ধরা হয়েছে। বাস্তব বস্তু u>0, অভিসারী f>0, অপসারী f<0 এবং বাস্তব v>0 convention-এ 1/f=1/u+1/v।'))
 refr=(('প্রতিসরণাঙ্ক কী?','শূন্যস্থানে আলোর বেগ c ও মাধ্যমে বেগ v-এর অনুপাত n=c/v; এটি এককহীন।'),('মাধ্যম বদলালে কম্পাঙ্ক একই কিন্তু তরঙ্গদৈর্ঘ্য বদলায় কেন?','একই স্থির উৎস ও স্থির সীমানায় প্রতি সেকেন্ডে চক্রসংখ্যা মেলে। v=fλ হওয়ায় বেগ বদলালে λ বদলায়।'))
 electro=(('তড়িৎ ক্ষেত্রের তীব্রতা কী?','কোনো বিন্দুতে অতি ক্ষুদ্র ধনাত্মক পরীক্ষাধানের ওপর প্রতি একক আধানে বল E=F/q; একক N/C।'),('এখানে পরীক্ষাধান ক্ষুদ্র ধরা হয় কেন?','পরীক্ষাধান বসিয়ে মূল আধানবণ্টন উল্লেখযোগ্যভাবে পাল্টানো যাবে না। বিন্দু আধানের সূত্রে অন্য আধান ও মাধ্যমের প্রভাব অনুল্লিখিত হলে উপেক্ষা করা হয়।'))
 current=(('তড়িৎ প্রবাহ কী?','কোনো প্রস্থচ্ছেদ দিয়ে একক সময়ে প্রবাহিত নিট আধান I=Q/t; একক A।'),('ওহমের সূত্রের শর্ত কী?','তাপমাত্রা ও অন্যান্য ভৌত অবস্থা অপরিবর্তিত থাকা ওহমিক পরিবাহীতে বিভবপার্থক্য প্রবাহের সমানুপাতিক। সব যন্ত্রে/সব তাপমাত্রায় একই R ধরে সূত্র প্রয়োগ করা যায় না।'))
 trans=(('ট্রান্সফর্মার কোন নীতিতে কাজ করে?','পরিবর্তনশীল চৌম্বক ফ্লাক্সের মাধ্যমে পারস্পরিক তড়িৎচৌম্বক আবেশে গৌণ কুণ্ডলীতে emf সৃষ্টি হয়।'),('স্থির DC দিয়ে সাধারণ ট্রান্সফর্মার নিয়মিত কাজ করে না কেন?','স্থির প্রবাহে স্থির ফ্লাক্স হয়, ফলে নিয়মিত আবিষ্ট emf থাকে না। এখানে AC, একই কম্পাঙ্ক ও আদর্শ common-core model ধরা হয়েছে; switching transient আলাদা।'))
 nuclear=(('অর্ধায়ু কী?','তেজস্ক্রিয় নমুনায় প্রাথমিক অবক্ষয়যোগ্য নিউক্লিয়াসের সংখ্যা গড়ে অর্ধেক হতে যে সময় লাগে, তা অর্ধায়ু।'),('অর্ধায়ু মানে প্রতিটি নিউক্লিয়াস ঠিক ঐ সময়ে ভাঙবে কি?','না। পৃথক ক্ষয় দৈব; বিপুল নিউক্লিয়াসের পরিসংখ্যানগত গড় দিয়ে অর্ধায়ু বোঝানো হয়। ক্ষয় না হলে বাড়তি নিউক্লিয়াস যোগ হচ্ছে না ধরা হয়।'))
 semi=(('অর্ধপরিবাহী কী?','এমন পদার্থ যার পরিবাহিতা সাধারণ পরিবাহী ও অন্তরকের মাঝামাঝি এবং ডোপিং, তাপমাত্রা ও আলোয় নিয়ন্ত্রণ করা যায়।'),('ডায়োডের ideal model বাস্তবের সঙ্গে পুরোপুরি মেলে না কেন?','বাস্তব ডায়োডে forward voltage drop, reverse leakage ও breakdown সীমা আছে। Ideal model-এ forward-এ বাধা শূন্য ও reverse-এ প্রবাহ শূন্য ধরা হয়; দেওয়া model-এর সীমা মানতে হবে।'))
 medical=(('আলট্রাসনোগ্রাফির মূল সংকেত কী?','টিস্যু-সীমানা থেকে ফেরা উচ্চ কম্পাঙ্কের যান্ত্রিক শব্দ-পালসের echo ব্যবহার করা হয়।'),('এখানে pulse-return time-কে 2 দিয়ে ভাগ করতে হয় কেন?','প্রোব থেকে সীমানা পর্যন্ত গিয়ে পালস আবার প্রোবে ফেরে। একই বেগ ও সরল পথে মোট দৈর্ঘ্য 2d; একমুখী দূরত্ব d=vt/2।'))
 xray=(('এক্স-রে কী ধরনের তরঙ্গ?','এক্স-রে উচ্চ কম্পাঙ্কের আয়নকারী তড়িৎচৌম্বক তরঙ্গ। এটি আলট্রাসাউন্ডের মতো যান্ত্রিক শব্দ নয়।'),('এই হিসাব চিকিৎসার সিদ্ধান্ত বা বিকিরণ-নির্দেশ নয় কেন?','এটি দেওয়া আদর্শ উপাত্তের শিক্ষামূলক পদার্থবিজ্ঞান। রোগনির্ণয়, পরীক্ষা নির্বাচন, ডোজ ও চিকিৎসা প্রশিক্ষিত চিকিৎসা-পেশাজীবীর সিদ্ধান্ত; এই সংখ্যা রোগীর জন্য সুপারিশ নয়।'))
 if ch==8:
  add('reflect-r','সমতল দর্পণে অভিলম্বের সঙ্গে আপতন কোণ {angle}°। প্রতিফলন কোণ কত?','°','r=i',lambda p:p['angle'],lambda n:dict(angle=10+n),('angle',2),*reflection,'reflection')
  add('surface-angle','আপতিত রশ্মি অভিলম্বের সঙ্গে {angle}° কোণ করে। পৃষ্ঠের সঙ্গে আপতিত রশ্মির কোণ কত?','°','a=90−i',lambda p:90-p['angle'],lambda n:dict(angle=15+n),('angle',F(3,2)),*reflection,'reflection')
  add('ray-angle','আপতন কোণ {angle}° হলে বিপরীতমুখী রেখা নয়, আপতনবিন্দু থেকে উৎসের দিকে ও প্রতিফলিত রশ্মির দিকে আঁকা দুই বাহুর ক্ষুদ্র কোণ কত?','°','a=2i',lambda p:2*p['angle'],lambda n:dict(angle=12+n),('angle',2),*reflection,'reflection')
  add('deviation','একবার সমতল দর্পণে প্রতিফলনে রশ্মির গতিদিকের বিচ্যুতি নির্ণয় করো; আপতন কোণ {angle}°।','°','δ=180−2i',lambda p:180-2*p['angle'],lambda n:dict(angle=15+n),('angle',F(3,2)),*reflection,'reflection')
  add('rotate-mirror','স্থির আপতিত রশ্মির সামনে সমতল দর্পণ {angle}° ঘোরে; একই তলে প্রতিফলিত দিক কত ডিগ্রি ঘোরে? রশ্মি দর্পণে পড়তে থাকে।','°','Δr=2θ',lambda p:2*p['angle'],lambda n:dict(angle=2+n),('angle',2),*reflection)
  for key,question,formula,calc in [('plane-separation','দর্পণ থেকে স্থির বস্তুর দূরত্ব {d} cm। বস্তু ও প্রতিবিম্বের দূরত্ব কত?','s=2d',lambda p:2*p['d']),('plane-depth','বস্তু ও সমতল দর্পণে তার প্রতিবিম্বের দূরত্ব {d} cm। দর্পণ থেকে বস্তুর দূরত্ব কত?','u=s/2',lambda p:p['d']/2),('object-shift','স্থির সমতল দর্পণের দিকে বস্তু {d} cm এগোয়। বস্তু–প্রতিবিম্ব ব্যবধান কত cm কমে?','Δs=2Δu',lambda p:2*p['d']),('mirror-shift','স্থির বস্তুর দিকে সমতল দর্পণ {d} cm সরানো হয়; বস্তু দর্পণ পেরোয় না। মূল জায়গার তুলনায় প্রতিবিম্ব কত দূর সরে?','Δx=2d',lambda p:2*p['d'])]:
   add(key,question,' cm',formula,calc,lambda n:dict(d=20+2*n),('d',2),*mirror)
  add('focal-radius','একটি অক্ষসংলগ্ন গোলীয় দর্পণের বক্রতার ব্যাসার্ধের মান {R} cm। ফোকাস দূরত্বের মান কত?',' cm','|f|=R/2',lambda p:p['R']/2,lambda n:dict(R=20+2*n),('R',2),*mirror)
  add('radius-focal','গোলীয় দর্পণের ফোকাস দূরত্বের মান {fmag} cm। বক্রতার ব্যাসার্ধের মান কত?',' cm','R=2|f|',lambda p:2*p['fmag'],lambda n:dict(fmag=5+n),('fmag',2),*mirror)
  for typ in ['concave','convex']:
   for mode in ['v','magnification','height','separation']:
    # Object always outside focus; both original and changed u are nonsingular.
    calc={'v':lambda p:p['f']*p['u']/(p['u']-p['f']),'magnification':lambda p:abs(p['f']/(p['u']-p['f'])),'height':lambda p:abs(p['f']*p['h']/(p['u']-p['f'])),'separation':lambda p:abs(p['u']-p['f']*p['u']/(p['u']-p['f']))}[mode]
    target={'v':'চিহ্নসহ প্রতিবিম্ব দূরত্ব v','magnification':'রৈখিক বিবর্ধনের মান |m|','height':'প্রতিবিম্বের উচ্চতার মান','separation':'বস্তু ও প্রতিবিম্বের মধ্যবর্তী সরল দূরত্ব'}[mode]
    add(typ+'-'+mode,('অবতল' if typ=='concave' else 'উত্তল')+' দর্পণের চিত্র ও ঘোষিত বাস্তব-ধনাত্মক convention ব্যবহার করো: u={u} cm, f={f} cm, বস্তুর উচ্চতা h={h} cm। '+target+' কত?','' if mode=='magnification' else ' cm',{'v':'v=fu/(u−f)','magnification':'|m|=|v/u|=|f/(u−f)|','height':'|hi|=|f h/(u−f)|','separation':'s=|u−v|'}[mode],calc,lambda n,sgn=1 if typ=='concave' else -1:dict(u=40+2*n,f=sgn*(8+n//3),h=2+F(n,10)),('u',2),*mirror,typ)
  for k in range(5):
   # Five different focus/object configurations, not only labels changed.
   ratio=[3,4,5,6,8][k]
   add(f'concave-design-{ratio}',f'এক অবতল দর্পণে বাস্তব বস্তুর দূরত্ব u = {ratio}f। f={{fmag}} cm; paraxial model-এ বাস্তব প্রতিবিম্বের দূরত্ব কত?',' cm',f'v={ratio}f/({ratio}−1)',lambda p,r=ratio:r*p['fmag']/(r-1),lambda n:dict(fmag=6+n),('fmag',2),*mirror)
 elif ch==9:
  add('index-speed','এক স্বচ্ছ মাধ্যমে আলোর বেগ v={speed}×10⁸ m/s; c=3×10⁸ m/s। প্রতিসরণাঙ্ক কত?','','n=3/v8',lambda p:3/p['speed'],lambda n:dict(speed=F(15+n,10)),('speed',F(4,5)),*refr)
  add('speed-index','প্রতিসরণাঙ্ক n={n} মাধ্যমে c=3×10⁸ m/s ধরলে বেগের মান কত ×10⁸ m/s?',' ×10⁸ m/s','v8=3/n',lambda p:3/p['n'],lambda n:dict(n=F(13+n,10)),('n',F(3,2)),*refr)
  add('relative-index','দুই স্থির মাধ্যমের প্রতিসরণাঙ্ক n1={n1}, n2={n2}। প্রথমের সাপেক্ষে দ্বিতীয়ের প্রতিসরণাঙ্ক কত?','','n21=n2/n1',lambda p:p['n2']/p['n1'],lambda n:dict(n1=F(6,5),n2=F(15+n,10)),('n2',F(6,5)),*refr)
  add('speed-ratio','একই আলোর জন্য n1={n1} ও n2={n2}। v1/v2 কত?','','v1/v2=n2/n1',lambda p:p['n2']/p['n1'],lambda n:dict(n1=F(5,4),n2=F(16+n,10)),('n2',F(6,5)),*refr)
  add('snell-sin','চিত্রে মাধ্যম 1 থেকে 2-এ আলো যায়। n1={n1}, n2={n2}, sin(i)={sini} দেওয়া। sin(r) কত? কোণ অভিলম্ব থেকে মাপা।','','sin(r)=n1 sin(i)/n2',lambda p:p['n1']*p['sini']/p['n2'],lambda n:dict(n1=1,n2=F(15+n,10),sini=F(1,2)),('n2',F(6,5)),*refr,'refraction')
  add('snell-index','শূন্যস্থানের প্রায় সমতুল্য বায়ু থেকে স্বচ্ছ মাধ্যমে গেলে sin(i)={sini}, sin(r)={sinr}। বায়ুর n=1 ধরে দ্বিতীয় মাধ্যমের n কত?','','n=sin(i)/sin(r)',lambda p:p['sini']/p['sinr'],lambda n:dict(sini=F(3,5),sinr=F(20+n,100)),('sinr',F(4,5)),*refr)
  add('critical-sin','ঘন মাধ্যম n={n} থেকে বায়ু n=1-এ আলো যায়। সংকট কোণের sine কত?','','sin(c)=1/n',lambda p:1/p['n'],lambda n:dict(n=F(15+n,10)),('n',F(6,5)),*refr,'critical')
  add('critical-two','কোরের ncore={ncore}, ক্ল্যাডের nclad={nclad}। কোর থেকে ক্ল্যাডে সংকট কোণের sine কত?','','sin(c)=nclad/ncore',lambda p:p['nclad']/p['ncore'],lambda n:dict(ncore=F(17+n,10),nclad=F(7,5)),('ncore',F(6,5)),*refr,'critical')
  add('wavelength-medium','একই স্থির উৎসের বায়ুতে তরঙ্গদৈর্ঘ্য L={L} nm। স্বচ্ছ মাধ্যমে n={n}; বায়ুর n≈1। মাধ্যমে λ কত?',' nm','λ=L/n',lambda p:p['L']/p['n'],lambda n:dict(L=500+10*n,n=F(3,2)),('n',F(6,5)),*refr)
  add('wavelength-ratio','প্রথম মাধ্যমে λ1={L} nm ও n1={n1}; দ্বিতীয় মাধ্যমে n2={n2}। একই কম্পাঙ্কে λ2 কত?',' nm','λ2=λ1 n1/n2',lambda p:p['L']*p['n1']/p['n2'],lambda n:dict(L=450+10*n,n1=F(6,5),n2=F(3,2)),('n2',F(6,5)),*refr)
  add('apparent-depth','বায়ু থেকে প্রায় লম্বভাবে দেখা পানির বাস্তব গভীরতা d={d} cm। আপেক্ষিক n={n} ধরে আপাত গভীরতা কত?',' cm','dapp=d/n',lambda p:p['d']/p['n'],lambda n:dict(d=30+2*n,n=F(4,3)),('d',2),*refr)
  add('real-depth','বায়ু থেকে প্রায় লম্বভাবে দেখা জলের আপাত গভীরতা a={a} cm। আপেক্ষিক n={n} হলে বাস্তব গভীরতা কত?',' cm','d=n a',lambda p:p['n']*p['a'],lambda n:dict(a=20+n,n=F(4,3)),('a',2),*refr)
  for sign in [1,-1]:
   add('power-'+str(sign),'পাতলা লেন্সের চিহ্নসহ ফোকাস দূরত্ব f={fcm} cm। ক্ষমতা কত?',' D','P=100/fcm',lambda p:100/p['fcm'],lambda n,s=sign:dict(fcm=s*(20+n)),('fcm',2),*lens)
   add('focal-power-'+str(sign),'লেন্সের ক্ষমতা P={P} D। চিহ্নসহ ফোকাস দূরত্ব কত cm?',' cm','fcm=100/P',lambda p:100/p['P'],lambda n,s=sign:dict(P=s*(2+F(n,10))),('P',2),*lens)
  for sign in [1,-1]:
   for mode in ['v','mag','height']:
    add(('converge-' if sign>0 else 'diverge-')+mode,'চিত্রের পাতলা '+('অভিসারী' if sign>0 else 'অপসারী')+' লেন্সে বাস্তব-ধনাত্মক convention নাও: u={u} cm, f={f} cm, h={h} cm। '+{'v':'চিহ্নসহ প্রতিবিম্ব দূরত্ব','mag':'বিবর্ধনের মান |m|','height':'প্রতিবিম্বের উচ্চতার মান'}[mode]+' কত?','' if mode=='mag' else ' cm',{'v':'v=fu/(u−f)','mag':'|m|=|f/(u−f)|','height':'|hi|=|f h/(u−f)|'}[mode],{'v':lambda p:p['f']*p['u']/(p['u']-p['f']),'mag':lambda p:abs(p['f']/(p['u']-p['f'])),'height':lambda p:abs(p['f']*p['h']/(p['u']-p['f']))}[mode],lambda n,s=sign:dict(u=45+2*n,f=s*(10+n//4),h=3+F(n,10)),('u',2),*lens,'lens-positive' if sign>0 else 'lens-negative')
  add('contact-power','বাতাসে পরস্পর সংলগ্ন দুটি আদর্শ পাতলা লেন্সের ক্ষমতা P1={P1} D, P2={P2} D। মোট ক্ষমতা কত?',' D','P=P1+P2',lambda p:p['P1']+p['P2'],lambda n:dict(P1=4+F(n,10),P2=-1),('P1',2),*lens)
  add('contact-focal','বাতাসে সংলগ্ন পাতলা লেন্সদ্বয়ের ক্ষমতা P1={P1} D, P2={P2} D। সমতুল্য ফোকাস দূরত্ব কত cm?',' cm','fcm=100/(P1+P2)',lambda p:100/(p['P1']+p['P2']),lambda n:dict(P1=5+F(n,10),P2=-2),('P1',2),*lens)
 elif ch==10:
  # q in microcoulomb, r in metre; k=9e9 SI gives F=0.009 q1q2/r² N.
  for key,ask,formula,calc in [('coulomb-force','বলটির মান','F=0.009 |q1 q2|/r²',lambda p:F(9,1000)*abs(p['q1']*p['q2'])/p['r']**2),('force-double-distance','দূরত্ব 2r করলে বলের মান','Fnew=0.009 |q1 q2|/(2r)²',lambda p:F(9,1000)*abs(p['q1']*p['q2'])/(2*p['r'])**2),('force-half-distance','দূরত্ব r/2 করলে বলের মান','Fnew=0.009 |q1 q2|/(r/2)²',lambda p:F(9,1000)*abs(p['q1']*p['q2'])/(p['r']/2)**2),('dielectric-force','আপেক্ষিক তড়িৎভেদ্যতা K=2 হলে বলের মান','F=0.009 |q1 q2|/(2r²)',lambda p:F(9,2000)*abs(p['q1']*p['q2'])/p['r']**2)]:
   add(key,'চিত্রের বিন্দু আধান q1={q1} μC, q2={q2} μC, ব্যবধান r={r} m। প্রাথমিকভাবে শূন্যস্থান, k=9×10⁹ SI; '+ask+' কত?',' N',formula,calc,lambda n:dict(q1=2+n,q2=3,r=F(2+n,10)),('r',2),*electro,'charges')
  add('field-point','শূন্যস্থানে Q={Q} μC বিন্দু আধান থেকে r={r} m দূরে E-এর মান কত? k=9×10⁹ SI।',' N/C','E=9000 |Q|/r²',lambda p:9000*abs(p['Q'])/p['r']**2,lambda n:dict(Q=2+n,r=F(5+n,10)),('r',2),*electro,'point-field')
  add('potential-point','শূন্যস্থানে Q={Q} μC একক বিন্দু আধান থেকে r={r} m দূরে বিভব কত? অসীমে শূন্য; k=9×10⁹ SI।',' V','V=9000 Q/r',lambda p:9000*p['Q']/p['r'],lambda n:dict(Q=3+n,r=F(5+n,10)),('r',2),*electro,'point-field')
  for sign in [1,-1]:
   add('field-force-'+str(sign),'একটি নির্দিষ্ট বাহ্যিক ক্ষেত্র E={E} N/C-এ স্থির q={q} μC পরীক্ষাধানের বলের মান কত? E-এর দিক ও q-এর চিহ্ন অনুযায়ী বলের দিক আলাদা করে বিচার্য।',' N','|F|=|q| E×10⁻⁶',lambda p:abs(p['q'])*p['E']/1000000,lambda n,s=sign:dict(E=20000+1000*n,q=s*(2+n)),('E',2),*electro)
  add('field-measure','ক্ষুদ্র ধনাত্মক q={q} μC পরীক্ষাধানে F={force} mN বল লাগে। ক্ষেত্রের তীব্রতা কত?',' N/C','E=1000 FmN/qμC',lambda p:1000*p['force']/p['q'],lambda n:dict(q=2+n,force=10+n),('force',2),*electro)
  add('work-potential','একটি q={q} μC ধনাত্মক আধানকে বিভব বৃদ্ধির ΔV={V} V বরাবর ধীরে নিতে বাহ্যিক কাজ কত μJ? গতিশক্তি অপরিবর্তিত।',' μJ','WμJ=qμC ΔV',lambda p:p['q']*p['V'],lambda n:dict(q=2+n,V=100+10*n),('V',2),*electro)
  add('potential-work','q={q} μC ধনাত্মক আধান সরাতে বাহ্যিক W={W} μJ কাজ হয়; গতিশক্তি অপরিবর্তিত। বিভব বৃদ্ধি কত?',' V','ΔV=WμJ/qμC',lambda p:p['W']/p['q'],lambda n:dict(q=2+n,W=200+20*n),('W',2),*electro)
  add('charge-work','ΔV={V} V বিভব বৃদ্ধিতে ধনাত্মক আধান নিতে W={W} μJ বাহ্যিক কাজ লাগে। আধানের পরিমাণ কত μC?',' μC','qμC=WμJ/ΔV',lambda p:p['W']/p['V'],lambda n:dict(V=20+n,W=200+10*n),('W',2),*electro)
  for key,ask,formula,calc,unit in [('cap-charge','সঞ্চিত আধান','QμC=CμF V',lambda p:p['C']*p['V'],' μC'),('cap-energy','সঞ্চিত শক্তি','UμJ=CμF V²/2',lambda p:p['C']*p['V']**2/2,' μJ')]:
   add(key,'ধারকের ধারকত্ব C={C} μF, বিভবপার্থক্য V={V} V। '+ask+' কত? দেওয়া আদর্শ ধারক-মডেল ধরো।',unit,formula,calc,lambda n:dict(C=2+n,V=5+n),('V',2),*electro)
  add('capacitance','ধারকে Q={Q} μC সঞ্চিত ও V={V} V বিভবপার্থক্য। ধারকত্ব কত?',' μF','CμF=QμC/V',lambda p:p['Q']/p['V'],lambda n:dict(Q=40+10*n,V=5+n),('Q',2),*electro)
  add('cap-voltage','C={C} μF ধারকে Q={Q} μC আধান আছে। বিভবপার্থক্য কত?',' V','V=QμC/CμF',lambda p:p['Q']/p['C'],lambda n:dict(C=2+n,Q=40+10*n),('Q',2),*electro)
  add('uniform-voltage','সুষম ক্ষেত্রের তীব্রতা E={E} V/m, ক্ষেত্র বরাবর দূরত্ব d={d} m। বিভবপার্থক্যের মান কত?',' V','|ΔV|=Ed',lambda p:p['E']*p['d'],lambda n:dict(E=200+20*n,d=F(2+n,100)),('d',2),*electro)
  add('uniform-field','সমান্তরাল পাতের আদর্শ সুষম ক্ষেত্রে V={V} V ও ব্যবধান d={d} cm। ক্ষেত্রের মান কত?',' V/m','E=100V/dcm',lambda p:100*p['V']/p['d'],lambda n:dict(V=100+10*n,d=2+n),('V',2),*electro)
  add('electron-count','আধানের পরমমান q={q} nC। e=1.6×10⁻¹⁹ C ধরে মৌলিক আধানসংখ্যা কত ×10¹⁰?',' ×10¹⁰','N10=q_nC/1.6',lambda p:p['q']/F(8,5),lambda n:dict(q=F(8,5)*(1+n)),('q',2),*electro)
  add('equal-sharing','দূরবর্তী সমান ব্যাসার্ধের দুটি অভিন্ন পরিবাহী গোলকে q1={q1} μC, q2={q2} μC আধান। স্পর্শ করিয়ে আবার দূরে সরালে প্রতিটিতে কত আধান? অন্যত্র ক্ষয় নেই।',' μC','qfinal=(q1+q2)/2',lambda p:(p['q1']+p['q2'])/2,lambda n:dict(q1=8+2*n,q2=-2),('q1',2),*electro,'charges')
  add('net-charge','বিচ্ছিন্ন ব্যবস্থায় q1={q1} μC ও q2={q2} μC আছে। মোট আধান কত?',' μC','Q=q1+q2',lambda p:p['q1']+p['q2'],lambda n:dict(q1=8+n,q2=-3),('q1',2),*electro,'charges')
  add('midpoint-potential','চিত্রের দুই সমান ধনাত্মক q={q} μC আধানের ব্যবধান L={L} m। শূন্যস্থানে মধ্যবিন্দুর বিভব কত? k=9×10⁹ SI, অসীমে V=0।',' V','Vmid=36000 q/L',lambda p:36000*p['q']/p['L'],lambda n:dict(q=2+n,L=2+F(n,10)),('L',2),*electro,'charges')
  add('outside-potential','চিত্রের সমান দুটি ধনাত্মক q={q} μC আধানের ব্যবধান L={L} m। সংযোগরেখায় এক আধানের বাইরে L দূরে বিন্দু P; অন্য আধান থেকে 2L। P-তে বিভব কত? k=9×10⁹ SI, অসীমে V=0।',' V','VP=9000q(1/L+1/(2L))',lambda p:13500*p['q']/p['L'],lambda n:dict(q=2+n,L=1+F(n,10)),('L',2),*electro,'charges')
  add('identical-cap-parallel','একই V={V} V উৎসে দুই অভিন্ন C={C} μF ধারক সমান্তরালে আছে। মোট সঞ্চিত আধান কত μC? আদর্শ ও প্রান্ত-প্রভাব উপেক্ষা।',' μC','Qtotal=2CV',lambda p:2*p['C']*p['V'],lambda n:dict(C=2+n,V=5+n),('V',2),*electro)
 elif ch==11:
  add('current','t={t} s-এ Q={Q} C নিট আধান যায়। গড় তড়িৎ প্রবাহ কত?',' A','I=Q/t',lambda p:p['Q']/p['t'],lambda n:dict(Q=40+10*n,t=5+n),('Q',2),*current)
  add('charge','ধ্রুব I={I} A প্রবাহ t={t} s ধরে চলে। কত আধান যায়?',' C','Q=It',lambda p:p['I']*p['t'],lambda n:dict(I=2+F(n,10),t=10+n),('t',2),*current)
  add('time','ধ্রুব I={I} A-এ Q={Q} C যেতে সময় কত?',' s','t=Q/I',lambda p:p['Q']/p['I'],lambda n:dict(I=2+n,Q=40+10*n),('Q',2),*current)
  for key,ask,formula,calc,params,change,unit in [('ohm-I','প্রবাহ কত?','I=V/R',lambda p:p['V']/p['R'],lambda n:dict(V=12+2*n,R=3+n),('V',2),' A'),('ohm-V','বিভবপার্থক্য কত?','V=IR',lambda p:p['I']*p['R'],lambda n:dict(I=2+F(n,10),R=4+n),('R',2),' V'),('ohm-R','রোধ কত?','R=V/I',lambda p:p['V']/p['I'],lambda n:dict(V=12+2*n,I=2+n),('V',2),' Ω')]:
   inp={'ohm-I':'V={V} V, R={R} Ω','ohm-V':'I={I} A, R={R} Ω','ohm-R':'V={V} V, I={I} A'}[key];add(key,'চিত্রের ওহমিক রোধে '+inp+'; তাপমাত্রা অপরিবর্তিত। '+ask,unit,formula,calc,params,change,*current,'single')
  for key,ask,formula,calc,unit in [('series-R','সমতুল্য রোধ','Req=R1+R2',lambda p:p['R1']+p['R2'],' Ω'),('series-I','উৎসের প্রবাহ','I=V/(R1+R2)',lambda p:p['V']/(p['R1']+p['R2']),' A'),('divider','R2-এর বিভবপার্থক্য','V2=V R2/(R1+R2)',lambda p:p['V']*p['R2']/(p['R1']+p['R2']),' V')]:
   add(key,'চিত্রে দুটি রোধ শ্রেণিতে, আদর্শ V={V} V উৎস; R1={R1} Ω, R2={R2} Ω। '+ask+' কত?',unit,formula,calc,lambda n:dict(V=12+2*n,R1=2+n,R2=4+n),('R2',2),*current,'series')
  for key,ask,formula,calc,unit in [('parallel-R','R2 ও R3 শাখাদ্বয়ের সমতুল্য রোধ','Rp=R2 R3/(R2+R3)',lambda p:p['R2']*p['R3']/(p['R2']+p['R3']),' Ω'),('parallel-I','উৎসের প্রবাহ','I=V/(R1+R2R3/(R2+R3))',lambda p:p['V']/(p['R1']+p['R2']*p['R3']/(p['R2']+p['R3'])),' A'),('parallel-V','সমান্তরাল অংশের বিভবপার্থক্য','Vp=V Rp/(R1+Rp)',lambda p:p['V']*(p['R2']*p['R3']/(p['R2']+p['R3']))/(p['R1']+p['R2']*p['R3']/(p['R2']+p['R3'])),' V')]:
   add(key,'চিত্রে R1 শ্রেণিতে, তারপর R2 ও R3 সমান্তরালে। V={V} V, R1={R1} Ω, R2={R2} Ω, R3={R3} Ω। '+ask+' কত?',unit,formula,calc,lambda n:dict(V=24+2*n,R1=2,R2=4+n,R3=6+n),('R2',2),*current,'parallel')
  for key,ask,formula,calc,unit in [('mixed-R','সমগ্র বহিঃবর্তনীর রোধ','R=R1+R2+R3R4/(R3+R4)',lambda p:p['R1']+p['R2']+p['R3']*p['R4']/(p['R3']+p['R4']),' Ω'),('mixed-I','উৎসের প্রবাহ','I=V/[R1+R2+R3R4/(R3+R4)]',lambda p:p['V']/(p['R1']+p['R2']+p['R3']*p['R4']/(p['R3']+p['R4'])),' A')]:
   add(key,'পুনরঙ্কিত চিত্রে R1,R2 শ্রেণিতে এবং শেষে R3∥R4। V={V} V, R1={R1} Ω, R2={R2} Ω, R3={R3} Ω, R4={R4} Ω; উৎসের অভ্যন্তরীণ রোধ শূন্য। '+ask+' কত?',unit,formula,calc,lambda n:dict(V=24+2*n,R1=2,R2=2,R3=6+n,R4=6+n),('R3',2),*current,'mixed')
  for key,question,unit,formula,calc,params,change in [('power-VI','যন্ত্রে V={V} V ও I={I} A। বৈদ্যুতিক ক্ষমতা কত?',' W','P=VI',lambda p:p['V']*p['I'],lambda n:dict(V=20+2*n,I=2+F(n,10)),('I',2)),('power-I2R','ওহমিক রোধ R={R} Ω-তে I={I} A। ক্ষমতা কত?',' W','P=I²R',lambda p:p['I']**2*p['R'],lambda n:dict(I=2+F(n,10),R=4+n),('I',2)),('power-V2R','ওহমিক রোধ R={R} Ω-তে V={V} V। ক্ষমতা কত?',' W','P=V²/R',lambda p:p['V']**2/p['R'],lambda n:dict(V=12+2*n,R=4+n),('V',2)),('energy','P={P} W ক্ষমতার যন্ত্র t={t} s চলে। ব্যবহৃত শক্তি কত?',' J','E=Pt',lambda p:p['P']*p['t'],lambda n:dict(P=100+10*n,t=20+n),('t',2)),('kwh','P={P} W যন্ত্র প্রতিদিন h={h} ঘণ্টা করে days={days} দিন চলে। মোট শক্তি কত kWh?',' kWh','E=P h days/1000',lambda p:p['P']*p['h']*p['days']/1000,lambda n:dict(P=100+10*n,h=3,days=20+n),('h',2)),('bill','ব্যবহৃত শক্তি E={E} kWh; কেবল ইউনিট মূল্য rate={rate} টাকা/kWh, অন্য কর/চার্জ নেই। খরচ কত?',' টাকা','cost=E rate',lambda p:p['E']*p['rate'],lambda n:dict(E=20+2*n,rate=6+F(n,10)),('E',2)),('joule-heat','R={R} Ω রোধে I={I} A ধ্রুব প্রবাহ t={t} s চলে। সব তড়িৎ শক্তি তাপে গেলে তাপ কত?',' J','H=I²Rt',lambda p:p['I']**2*p['R']*p['t'],lambda n:dict(I=2+F(n,10),R=3,t=10+n),('I',2)),('internal-current','কোষের emf E={E} V, অভ্যন্তরীণ রোধ r={r} Ω, বহিঃরোধ R={R} Ω। প্রবাহ কত?',' A','I=E/(R+r)',lambda p:p['E']/(p['R']+p['r']),lambda n:dict(E=12+2*n,r=F(1,2),R=4+n),('R',2)),('terminal-voltage','বিদ্যুৎ সরবরাহরত কোষের E={E} V, r={r} Ω এবং বহিঃরোধ R={R} Ω। টার্মিনাল বিভবপার্থক্য কত?',' V','Vterminal=E R/(R+r)',lambda p:p['E']*p['R']/(p['R']+p['r']),lambda n:dict(E=12+2*n,r=F(1,2),R=4+n),('R',2)),('rated-current','একটি যন্ত্র নির্ধারিত V={V} V-এ P={P} W নেয়। rating-এ প্রবাহ কত? এটি fuse নির্বাচন নির্দেশ নয়।',' A','I=P/V',lambda p:p['P']/p['V'],lambda n:dict(P=100+20*n,V=100+10*n),('P',2))]:add(key,question,unit,formula,calc,params,change,*current)
 elif ch==12:
  # Twelve transformer inversions/comparisons, plus power, loss and motor models.
  for key,question,unit,formula,calc,params,change in [
   ('secondary-V','চিত্রের আদর্শ ট্রান্সফর্মারে Vp={Vp} V, Np={Np}, Ns={Ns} পাক। Vs কত?',' V','Vs=Vp Ns/Np',lambda p:p['Vp']*p['Ns']/p['Np'],lambda n:dict(Vp=100+10*n,Np=200,Ns=400+20*n),('Ns',2)),
   ('primary-V','আদর্শ ট্রান্সফর্মারে Vs={Vs} V, Np={Np}, Ns={Ns}। Vp কত?',' V','Vp=Vs Np/Ns',lambda p:p['Vs']*p['Np']/p['Ns'],lambda n:dict(Vs=20+2*n,Np=600,Ns=100+10*n),('Ns',2)),
   ('secondary-turns','Vp={Vp} V, Vs={Vs} V, Np={Np}। আদর্শ ট্রান্সফর্মারের প্রয়োজনীয় Ns কত পাক?',' পাক','Ns=Np Vs/Vp',lambda p:p['Np']*p['Vs']/p['Vp'],lambda n:dict(Vp=100,Vs=20+2*n,Np=500),('Vs',2)),
   ('primary-turns','Vp={Vp} V, Vs={Vs} V, Ns={Ns}। আদর্শ ট্রান্সফর্মারের Np কত পাক?',' পাক','Np=Ns Vp/Vs',lambda p:p['Ns']*p['Vp']/p['Vs'],lambda n:dict(Vp=100+10*n,Vs=20,Ns=100),('Vp',2)),
   ('ratio','আদর্শ ট্রান্সফর্মারে Vp={Vp} V ও Vs={Vs} V। Ns/Np কত?','','Ns/Np=Vs/Vp',lambda p:p['Vs']/p['Vp'],lambda n:dict(Vp=100,Vs=200+10*n),('Vs',2)),
   ('turn-difference','আদর্শ ট্রান্সফর্মারের Np={Np}, Ns={Ns} পাক। গৌণ ও মুখ্য পাকের পার্থক্যের মান কত?',' পাক','ΔN=|Ns−Np|',lambda p:abs(p['Ns']-p['Np']),lambda n:dict(Np=100,Ns=300+20*n),('Ns',2)),
   ('secondary-I','আদর্শ ট্রান্সফর্মারে Ip={Ip} A, Np={Np}, Ns={Ns}। Is কত?',' A','Is=Ip Np/Ns',lambda p:p['Ip']*p['Np']/p['Ns'],lambda n:dict(Ip=2+F(n,10),Np=400,Ns=100+10*n),('Ns',2)),
   ('primary-I','আদর্শ ট্রান্সফর্মারে Is={Is} A, Np={Np}, Ns={Ns}। Ip কত?',' A','Ip=Is Ns/Np',lambda p:p['Is']*p['Ns']/p['Np'],lambda n:dict(Is=2+F(n,10),Np=400,Ns=100+10*n),('Ns',2)),
   ('power-input','ট্রান্সফর্মারের AC-তে unity power factor দেওয়া: Vp={Vp} V (rms), Ip={Ip} A (rms)। গড় input power কত?',' W','Pin=Vp Ip (pf=1)',lambda p:p['Vp']*p['Ip'],lambda n:dict(Vp=100+10*n,Ip=2+F(n,10)),('Ip',2)),
   ('ideal-output-power','আদর্শ ট্রান্সফর্মারের Pin={Pin} W। সব ক্ষয় শূন্য হলে output power কত?',' W','Pout=Pin',lambda p:p['Pin'],lambda n:dict(Pin=200+20*n),('Pin',2)),
   ('efficiency','ট্রান্সফর্মারে Pin={Pin} W, Pout={Pout} W। দক্ষতা কত শতাংশ?','%','η=100Pout/Pin',lambda p:100*p['Pout']/p['Pin'],lambda n:dict(Pin=1000+20*n,Pout=800+10*n),('Pout',F(9,10))),
   ('loss','ট্রান্সফর্মারে Pin={Pin} W, Pout={Pout} W। ক্ষয় ক্ষমতা কত?',' W','Ploss=Pin−Pout',lambda p:p['Pin']-p['Pout'],lambda n:dict(Pin=1000+20*n,Pout=800+10*n),('Pin',F(6,5))),
   ('efficient-output','ট্রান্সফর্মারের input power Pin={Pin} W ও দক্ষতা eta={eta}%। output power কত?',' W','Pout=Pin η/100',lambda p:p['Pin']*p['eta']/100,lambda n:dict(Pin=500+20*n,eta=80+F(n,2)),('Pin',2)),
   ('efficient-input','ট্রান্সফর্মারের output Pout={Pout} W, দক্ষতা eta={eta}%। input power কত?',' W','Pin=100Pout/η',lambda p:100*p['Pout']/p['eta'],lambda n:dict(Pout=400+20*n,eta=80+F(n,2)),('Pout',2)),
   ('secondary-total-turns','কুণ্ডলীর Ns/Np=ratio={ratio}, মোট পাক total={total}। Ns কত? আদর্শ ও পূর্ণসংখ্যা পাক ধরো।',' পাক','Ns=Ntotal ratio/(1+ratio)',lambda p:p['total']*p['ratio']/(1+p['ratio']),lambda n:dict(ratio=3,total=400+40*n),('total',2)),
   ('primary-total-turns','কুণ্ডলীর Ns/Np=ratio={ratio}, মোট পাক total={total}। Np কত?',' পাক','Np=Ntotal/(1+ratio)',lambda p:p['total']/(1+p['ratio']),lambda n:dict(ratio=4,total=500+50*n),('total',2))]:add(key,question,unit,formula,calc,params,change,*trans,'transformer')
  for key,question,unit,formula,calc,params,change in [
   ('line-I','সঞ্চালিত ক্ষমতা P={P} W, লাইন ভোল্টেজ V={V} V; unity power factor। লাইন প্রবাহ কত?',' A','I=P/V',lambda p:p['P']/p['V'],lambda n:dict(P=10000+1000*n,V=1000+100*n),('V',2)),
   ('line-loss','এক লাইনের মোট রোধ R={R} Ω ও rms প্রবাহ I={I} A। তাপক্ষয় ক্ষমতা কত?',' W','Ploss=I²R',lambda p:p['I']**2*p['R'],lambda n:dict(I=5+F(n,10),R=2+F(n,10)),('I',F(1,2))),
   ('stepup-loss','নির্দিষ্ট P={P} W ক্ষমতা V={V} V-এ মোট R={R} Ω লাইনে পাঠানো হয়; unity pf, ক্ষয় ক্ষুদ্র। আনুমানিক তাপক্ষয় কত?',' W','Ploss=(P/V)²R',lambda p:(p['P']/p['V'])**2*p['R'],lambda n:dict(P=10000+1000*n,V=2000,R=2),('V',2)),
   ('motor-force','চিত্রে B={B} T সুষম ক্ষেত্রে I={I} A প্রবাহের L={L} m তার লম্বভাবে আছে। দেওয়া model F=BIL-এ বলের মান কত?',' N','F=BIL',lambda p:p['B']*p['I']*p['L'],lambda n:dict(B=F(2+n,10),I=3+F(n,10),L=F(2+n,10)),('I',2)),
   ('motor-current','লম্ব তারে F={force} N, B={B} T, L={L} m। দেওয়া F=BIL থেকে I কত?',' A','I=F/(BL)',lambda p:p['force']/(p['B']*p['L']),lambda n:dict(force=F(2+n,10),B=F(1,2),L=F(2+n,10)),('force',2)),
   ('motor-length','লম্ব তারে F={force} N, B={B} T, I={I} A। F=BIL মডেলে কার্যকর L কত?',' m','L=F/(BI)',lambda p:p['force']/(p['B']*p['I']),lambda n:dict(force=F(2+n,10),B=F(1,2),I=2+n),('force',2)),
   ('motor-power','মোটরের input Pin={Pin} W, যান্ত্রিক output Pout={Pout} W। দক্ষতা কত?','%','η=100Pout/Pin',lambda p:100*p['Pout']/p['Pin'],lambda n:dict(Pin=1000+20*n,Pout=700+10*n),('Pout',F(9,10))),
   ('induced-emf','আবেশের দেওয়া model |emf|=N|ΔΦ|/Δt নাও। N={N} পাক, প্রতি পাকে flux পরিবর্তনের মান dphi={dphi} Wb, সময় t={t} s। গড় emf-এর মান কত?',' V','|emf|=N ΔΦ/Δt',lambda p:p['N']*p['dphi']/p['t'],lambda n:dict(N=100+10*n,dphi=F(1+n,1000),t=F(2+n,10)),('N',2))]:add(key,question,unit,formula,calc,params,change,*trans,'motor' if key.startswith('motor-') and key!='motor-power' else None)
 elif ch==13:
  for key,question,unit,formula,calc,params,change in [
   ('neutrons','পরমাণুর ভরসংখ্যা A={A}, পারমাণবিক সংখ্যা Z={Z}। নিউট্রন সংখ্যা কত?','','N=A−Z',lambda p:p['A']-p['Z'],lambda n:dict(A=40+2*n,Z=20+n),('A',2)),
   ('mass-number','নিউক্লিয়াসে Z={Z} প্রোটন, N={N} নিউট্রন। ভরসংখ্যা কত?','','A=Z+N',lambda p:p['Z']+p['N'],lambda n:dict(Z=10+n,N=12+n),('N',2)),
   ('neutral-electrons','নিরপেক্ষ পরমাণুর পারমাণবিক সংখ্যা Z={Z}। ইলেকট্রন সংখ্যা কত?','','Ne=Z',lambda p:p['Z'],lambda n:dict(Z=10+n),('Z',2)),
   ('cation-electrons','Z={Z} পরমাণু থেকে lost={lost}টি ইলেকট্রন সরিয়ে ধনাত্মক আয়ন করা হলো। অবশিষ্ট ইলেকট্রন কত?','','Ne=Z−lost',lambda p:p['Z']-p['lost'],lambda n:dict(Z=20+n,lost=2),('lost',2)),
   ('anion-electrons','Z={Z} নিরপেক্ষ পরমাণু gained={gained}টি ইলেকট্রন গ্রহণ করল। মোট ইলেকট্রন কত?','','Ne=Z+gained',lambda p:p['Z']+p['gained'],lambda n:dict(Z=10+n,gained=1),('gained',2)),
   ('alpha-mass','A={A}, Z={Z} নিউক্লিয়াসে একটি alpha ক্ষয়ের পরে কন্যার ভরসংখ্যা কত? আর ক্ষয় নয়।','','Ad=A−4',lambda p:p['A']-4,lambda n:dict(A=220+2*n,Z=88+n),('A',F(1,1))),
   ('alpha-charge','A={A}, Z={Z} নিউক্লিয়াসে একটি alpha ক্ষয়ের পরে কন্যার পারমাণবিক সংখ্যা কত?','','Zd=Z−2',lambda p:p['Z']-2,lambda n:dict(A=220+2*n,Z=88+n),('Z',F(1,1))),
   ('beta-charge','ভরসংখ্যা A={A}, পারমাণবিক সংখ্যা Z={Z}। একটি beta-minus ক্ষয়ের পরে কন্যার Z কত?','','Zd=Z+1',lambda p:p['Z']+1,lambda n:dict(A=40+2*n,Z=18+n),('Z',F(1,1))),
   ('half-life-remain','প্রাথমিক সংখ্যা N0={N0}; h={h}টি অর্ধায়ু পরে গড় অবশিষ্ট নিউক্লিয়াস কত? নতুন আধান/নিউক্লিয়াস যোগ নেই।','','N=N0/2^h',lambda p:p['N0']/2**int(p['h']),lambda n:dict(N0=1024*(1+n),h=2+n%3),('N0',2)),
   ('half-life-decayed','প্রাথমিক N0={N0}, h={h}টি অর্ধায়ু পেরোয়। গড়ে কতটি ক্ষয় হয়েছে?','','Nd=N0(1−2^(−h))',lambda p:p['N0']*(1-F(1,2**int(p['h']))),lambda n:dict(N0=1024*(1+n),h=2+n%3),('N0',2)),
   ('half-life-time','অর্ধায়ু T={T} h। hcount={hcount}টি অর্ধায়ু পেরোতে মোট সময় কত ঘণ্টা?',' h','t=T hcount',lambda p:p['T']*p['hcount'],lambda n:dict(T=2+n,hcount=3),('T',2)),
   ('activity','t={t} s-এ গড়ে events={events}টি ক্ষয় ঘটে। ঐ সময়ের গড় activity কত Bq? detector efficiency এখানে 100% দেওয়া।',' Bq','A=events/t',lambda p:p['events']/p['t'],lambda n:dict(events=1000+100*n,t=10+n),('events',2)),
   ('transistor-Ic','চিত্রের NPN active-region model-এ beta={beta}, base current Ib={Ib} μA। Ic=βIb ধরে collector current কত μA?',' μA','Ic=βIb',lambda p:p['beta']*p['Ib'],lambda n:dict(beta=50+2*n,Ib=10+n),('Ib',2)),
   ('transistor-Ib','সক্রিয় অঞ্চলে β={beta}, Ic={Ic} μA। model Ic=βIb-তে Ib কত μA?',' μA','Ib=Ic/β',lambda p:p['Ic']/p['beta'],lambda n:dict(beta=50+2*n,Ic=1000+100*n),('Ic',2)),
   ('transistor-beta','সক্রিয় অঞ্চলে Ic={Ic} μA, Ib={Ib} μA। DC current gain β কত?','','β=Ic/Ib',lambda p:p['Ic']/p['Ib'],lambda n:dict(Ic=1000+100*n,Ib=10+n),('Ic',2)),
   ('transistor-Ie','চিত্রের NPN-এ Ic={Ic} mA, Ib={Ib} mA। emitter current-এর মান কত?',' mA','Ie=Ic+Ib',lambda p:p['Ic']+p['Ib'],lambda n:dict(Ic=2+F(n,10),Ib=F(2+n,100)),('Ic',2)),
   ('diode-current','Ideal diode forward biased, উৎস V={V} V ও series R={R} Ω। diode drop শূন্য ধরলে current কত?',' A','I=V/R',lambda p:p['V']/p['R'],lambda n:dict(V=5+n,R=100+10*n),('V',2)),
   ('diode-load-voltage','Forward circuit-এ V={V} V, diode-এর দেওয়া ধ্রুব drop drop={drop} V। series load-এর voltage কত?',' V','VR=V−Vd',lambda p:p['V']-p['drop'],lambda n:dict(V=5+n,drop=F(7,10)),('V',2)),
   ('diode-resistor-current','Forward circuit-এ V={V} V, drop={drop} V, series R={R} Ω। current কত?',' A','I=(V−Vd)/R',lambda p:(p['V']-p['drop'])/p['R'],lambda n:dict(V=5+n,drop=F(7,10),R=100+10*n),('R',2)),
   ('half-wave-period','আদর্শ half-wave rectifier-এ AC input frequency f={f} Hz। output pulse পুনরাবৃত্তির সময় কত?',' s','T=1/f',lambda p:1/p['f'],lambda n:dict(f=50+2*n),('f',2)),
   ('radio-wavelength','বেতার তরঙ্গের frequency f={f} MHz, বেগ 300×10⁶ m/s। তরঙ্গদৈর্ঘ্য কত?',' m','λ=300/fMHz',lambda p:300/p['f'],lambda n:dict(f=80+2*n),('f',2)),
   ('radio-frequency','বেতার তরঙ্গের λ={L} m, বেগ 300×10⁶ m/s। frequency কত MHz?',' MHz','fMHz=300/λ',lambda p:300/p['L'],lambda n:dict(L=2+F(n,10)),('L',2)),
   ('amplifier-gain','দেওয়া linear signal model-এ input amplitude Vin={Vin} mV ও output Vout={Vout} mV। amplitude gain-এর মান কত?','','G=Vout/Vin',lambda p:p['Vout']/p['Vin'],lambda n:dict(Vin=10+n,Vout=200+20*n),('Vout',2)),
   ('amplifier-output','এক linear amplifier-এ amplitude gain G={G}, input Vin={Vin} mV। distortion/saturation নেই ধরলে output কত mV?',' mV','Vout=G Vin',lambda p:p['G']*p['Vin'],lambda n:dict(G=10+n,Vin=5+n),('Vin',2))]:
   group=nuclear if key in ['neutrons','mass-number','neutral-electrons','cation-electrons','anion-electrons','alpha-mass','alpha-charge','beta-charge','half-life-remain','half-life-decayed','half-life-time','activity'] else semi
   fig='transistor' if key.startswith('transistor') else ('rectifier' if key=='half-wave-period' else 'diode' if key.startswith('diode') else ('radio' if key.startswith('radio') or key.startswith('amplifier') else None))
   # Changed nuclei in alpha/beta families should be a real different hypothetical parent.
   if change[1]==1:change=(change[0],None)
   add(key,question,unit,formula,calc,params,change,*group,fig)
 elif ch==14:
  for key,question,unit,formula,calc,params,change in [
   ('us-depth','চিত্রের স্থির প্রোবে tissue echo ফেরে t={t} μs পরে; বেগ v={v} m/s। সরল পথ ও delay শূন্য ধরে সীমানার গভীরতা কত mm?',' mm','dmm=v tμs/2000',lambda p:p['v']*p['t']/2000,lambda n:dict(v=1500,t=20+2*n),('t',2)),
   ('us-time','প্রোব থেকে সীমানা d={d} mm; v={v} m/s। echo-র মোট return time কত μs?',' μs','tμs=2000 dmm/v',lambda p:2000*p['d']/p['v'],lambda n:dict(d=20+2*n,v=1500),('d',2)),
   ('us-speed','সীমানা d={d} mm, echo time t={t} μs। সোজা যাওয়া–ফেরায় বেগ কত?',' m/s','v=2000 dmm/tμs',lambda p:2000*p['d']/p['t'],lambda n:dict(d=15+F(3*n,2),t=20+2*n),('d',F(6,5))),
   ('us-wavelength','শিক্ষামূলক আলট্রাসাউন্ডে v={v} m/s ও f={f} MHz। তরঙ্গদৈর্ঘ্য কত mm?',' mm','λmm=v/(1000 fMHz)',lambda p:p['v']/(1000*p['f']),lambda n:dict(v=1500,f=2+F(n,10)),('f',2)),
   ('us-frequency','আলট্রাসাউন্ডে v={v} m/s ও λ={L} mm। frequency কত MHz?',' MHz','fMHz=v/(1000 λmm)',lambda p:p['v']/(1000*p['L']),lambda n:dict(v=1500,L=F(3+n,10)),('L',2)),
   ('us-separation','দুই tissue boundary-র echo return-time ব্যবধান dt={dt} μs; দুই পথের বেগ একই v={v} m/s। একই সরল পথে boundary-দ্বয়ের ব্যবধান কত mm?',' mm','Δdmm=v Δtμs/2000',lambda p:p['v']*p['dt']/2000,lambda n:dict(v=1500,dt=10+n),('dt',2)),
   ('us-pulse-length','আলট্রাসাউন্ড pulse-এ N={N}টি পূর্ণ চক্র ও λ={L} mm। spatial pulse length কত mm?',' mm','SPL=Nλ',lambda p:p['N']*p['L'],lambda n:dict(N=2+n%3,L=F(3+n,10)),('N',2)),
   ('us-resolution-model','শুধু দেওয়া সরল model: axial separation limit=SPL/2; N={N} চক্রের pulse, λ={L} mm। ideal limit কত mm? যন্ত্রের clinical performance-এর নিশ্চয়তা নয়।',' mm','dlimit=Nλ/2',lambda p:p['N']*p['L']/2,lambda n:dict(N=2+n%3,L=F(3+n,10)),('N',2)),
   ('xray-frequency','এক্স-রে λ={L} nm; c=3×10⁸ m/s। frequency-এর সংখ্যামান কত ×10¹⁸ Hz?',' ×10¹⁸ Hz','f18=0.3/λnm',lambda p:F(3,10)/p['L'],lambda n:dict(L=F(5+n,100)),('L',2)),
   ('xray-wavelength','এক্স-রে frequency f={f}×10¹⁸ Hz; c=3×10⁸ m/s। λ কত nm?',' nm','λnm=0.3/f18',lambda p:F(3,10)/p['f'],lambda n:dict(f=2+F(n,10)),('f',2)),
   ('xray-energy','এক্স-রের λ={L} nm। দেওয়া hc=1240 eV·nm ব্যবহার করে photon energy কত eV?',' eV','E=1240/λnm',lambda p:1240/p['L'],lambda n:dict(L=F(5+n,100)),('L',2)),
   ('xray-energy-wavelength','এক্স-রে photon energy E={E} eV; hc=1240 eV·nm দেওয়া। λ কত nm?',' nm','λnm=1240/EeV',lambda p:1240/p['E'],lambda n:dict(E=10000+1000*n),('E',2)),
   ('tube-energy','আদর্শ এক্স-রে tube-তে একটি electron V={V} kV potential দিয়ে ত্বরিত হয়। প্রাথমিক KE উপেক্ষায় লাভ করা শক্তি কত keV?',' keV','KEkeV=VkV',lambda p:p['V'],lambda n:dict(V=40+2*n),('V',2)),
   ('tube-cutoff','আদর্শ tube-এর V={V} kV। electron-এর সর্বোচ্চ শক্তি এক photon-এ গেলে λmin কত nm? hc=1240 eV·nm।',' nm','λmin=1.24/VkV',lambda p:F(31,25)/p['V'],lambda n:dict(V=40+2*n),('V',2)),
   ('tube-power','শিক্ষামূলক আদর্শ tube-তে V={V} kV, I={I} mA। input বৈদ্যুতিক ক্ষমতা কত W? clinical setting recommendation নয়।',' W','Pin=VkV ImA',lambda p:p['V']*p['I'],lambda n:dict(V=40+2*n,I=2+F(n,10)),('I',2)),
   ('xray-efficiency','শিক্ষামূলক শক্তি-হিসাবে input Pin={Pin} W, এক্স-রে output Px={Px} W। শক্তি দক্ষতা কত শতাংশ?','%','η=100Px/Pin',lambda p:100*p['Px']/p['Pin'],lambda n:dict(Pin=1000+100*n,Px=10+n),('Px',2)),
   ('ecg-rate','চিত্রটি কেবল ECG schematic। ধারাবাহিক স্বাভাবিক পুনরাবৃত্তি মডেলে R–R সময় T={T} s। প্রতি মিনিটে beat count কত? এটি রোগনির্ণয় নয়।',' beat/min','rate=60/T',lambda p:60/p['T'],lambda n:dict(T=F(60+n,100)),('T',F(6,5))),
   ('ecg-period','নিয়মিত ECG মডেলে rate={rate} beat/min। এক R–R interval কত s? clinical interpretation নয়।',' s','T=60/rate',lambda p:60/p['rate'],lambda n:dict(rate=60+2*n),('rate',F(6,5))),
   ('ecg-calibration','ECG-র দেওয়া paper speed speed={speed} mm/s, দুই R peak-এর কাগজে ব্যবধান d={d} mm। সময় ব্যবধান কত s? চিত্র মাপবে না।',' s','T=d/speed',lambda p:p['d']/p['speed'],lambda n:dict(speed=25,d=15+F(n,2)),('d',F(6,5))),
   ('ecg-paper-rate','ECG paper speed speed={speed} mm/s ও R–R কাগজ-ব্যবধান d={d} mm। নিয়মিত beat model-এ rate কত beat/min? চিত্র থেকে data মাপবে না।',' beat/min','rate=60speed/d',lambda p:60*p['speed']/p['d'],lambda n:dict(speed=25,d=15+F(n,2)),('d',F(6,5))),
   ('tracer-remain','চিকিৎসাবিজ্ঞানে tracer ধারণার শিক্ষামূলক নমুনায় N0={N0} অস্থিতিশীল নিউক্লিয়াস; h={h}টি অর্ধায়ু পরে গড় অবশিষ্ট কত? শরীরের biological clearance এখানে নেই; কোনো রোগীর dose নয়।','','N=N0/2^h',lambda p:p['N0']/2**int(p['h']),lambda n:dict(N0=1024*(1+n),h=2+n%3),('N0',2)),
   ('tracer-activity','এক শিক্ষামূলক detector model-এ t={t} s-এ মোট detected count C={C}, ঐ সময়ের background B={B}। efficiency 100% ও rate ধ্রুব দিলে net count rate কত s⁻¹? clinical measurement নয়।',' s⁻¹','Rnet=(C−B)/t',lambda p:(p['C']-p['B'])/p['t'],lambda n:dict(C=1000+100*n,B=100,t=10+n),('C',2)),
   ('absorbed-dose','শুধু একক-অনুশীলনী: নমুনার m={m} kg ভরে E={E} mJ শক্তি শোষিত। দেওয়া D=E/m-তে absorbed dose কত mGy? এটি কোনো চিকিৎসা dose recommendation নয়।',' mGy','DmGy=EmJ/mkg',lambda p:p['E']/p['m'],lambda n:dict(E=2+F(n,10),m=1+F(n,10)),('E',2)),
   ('absorbed-energy','একক অনুশীলনী: m={m} kg নমুনায় D={D} mGy শোষিত dose; 1 Gy=1 J/kg দেওয়া। শক্তি কত mJ? রোগীর চিকিৎসা-নির্দেশ নয়।',' mJ','EmJ=DmGy mkg',lambda p:p['D']*p['m'],lambda n:dict(D=2+F(n,10),m=1+F(n,10)),('m',2))]:
   group=medical if key.startswith('us-') else (nuclear if key.startswith('tracer-') else xray)
   fig='ultrasound' if key.startswith('us-') else ('ecg' if key.startswith('ecg-') else ('xray' if key.startswith('xray') or key.startswith('tube-') else None))
   add(key,question,unit,formula,calc,params,change,*group,fig)
 else:raise ValueError(ch)
 assert len(specs)==24,(ch,len(specs))
 return specs

def make(spec,n):
 p=spec['params'](n);p={k:F(v) for k,v in p.items()};r=F(spec['calc'](p));cp=p.copy();key,factor=spec['change'];cp[key]=cp[key]*factor if factor is not None else cp[key]+2
 s=F(spec['calc'](cp));unit=spec['unit'];render=lambda d:{k:(fmt(v) if F(fmt(v))==v else str(v)) for k,v in d.items()}
 text=spec['question'].format(**render(p))
 why=spec['formula']+'। প্রদত্ত উপাত্ত একই একক-রীতিতে বসিয়ে ফল = '+fmt(r)+unit+'।'
 # Explicit substitutions avoid a bare answer masquerading as a worked solution.
 why+=' ব্যবহৃত উপাত্ত: '+', '.join(k+'='+render(p)[k] for k,v in p.items())+'।'
 newquestion=f'অন্য সব প্রদত্ত শর্ত ও model অপরিবর্তিত রেখে {key} রাশিটির মান {fmt(p[key])} থেকে {fmt(cp[key])} হলে একই চাওয়া রাশির নতুন মান কত? পুরোনো ফলের সঙ্গে তুলনা ও model-এর সীমা ব্যাখ্যা করো।'
 newwhy=spec['formula']+'; নতুন উপাত্ত: '+', '.join(k+'='+render(cp)[k] for k,v in cp.items())+'। তাই নতুন ফল '+fmt(s)+unit+'। '+('এটি আগের চেয়ে বেশি।' if s>r else 'এটি আগের চেয়ে কম।' if s<r else 'এটি আগের সমান; পরিবর্তিত উপাত্তটি এই চাওয়া রাশিকে প্রভাবিত করেনি।')+' '+spec['reason'][1]
 figp=p.copy()
 if spec['fig']=='charges':figp=p.copy()
 return dict(text=text,value=r,unit=unit,why=why,params=p,secondaryParams=cp,formula=spec['key'],definition=spec['definition'],reason=spec['reason'],change=(newquestion,newwhy,s),fig=(spec['fig'],[figp]) if spec['fig'] else None)
