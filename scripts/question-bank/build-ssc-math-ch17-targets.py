"""SSC statistics 300 MCQ/200 CQ/100 SQ. Tables are real text, not screenshots.
4 compilation-adapted MCQ,3 user-image-inspired CQ,593 original parameter records.
"""
from illustrated_geometry_bank import *
from ssc_statistics import *
NONE=(None,{})
bank=Bank(17,'১৭শ অধ্যায়: পরিসংখ্যান',dict(MCQ=300,CQ=200,SQ=100));bank.book='Proshnobook — সারণি ও লেখচিত্রসহ পরিসংখ্যান অনুশীলনী'

def graph(d,kind,name):
 svg,g=plot(d,kind);p=bank.assetdir/(name+'.svg');save(p,svg);url=bank.url+p.name
 bank.assets.append(dict(file=str(p.relative_to(ROOT)),url=url,bytes=len(svg.encode()),sha256=sha(svg.encode()),kind='statistics-'+kind,parameters=dict(kind=kind),geometry=g))
 return f'\n\n![{kind} লেখচিত্র]({url})\n'
def P(q,v,sol):return dict(question=q,value=S.simplify(v),solution=sol)
FAMILIES=['grouped-mean','shortcut-mean','grouped-median','grouped-mode','frequency-polygon','less-ogive','more-ogive','raw-mean','raw-median','raw-mode','raw-grouping','missing-frequency','cumulative-median','discrete-mean','discrete-mode','combined-mean','transformed-mean','class-boundaries','relative-frequency','weighted-mean']

def scenario(i,n):
 f=FAMILIES[i];k=S.Integer(n+3);p=n+i%4;d=grouped(10+n+i,5 if i%2 else 10,[p+2,p+4,2*p+9,p+3,p+1]);lo=d['lo'];h=d['h'];N=d['N'];j=d['medianIndex'];mi=d['modalIndex']
 stem='নিচের পূর্ণসংখ্যায় রেকর্ড করা উপাত্তের গণসংখ্যা সারণি দেওয়া হলো।'+grid(d)+'শ্রেণিগুলো অন্তর্ভুক্তিমূলক; প্রকৃত সীমা পেতে নিম্নসীমা থেকে 0.5 বিয়োগ ও উচ্চসীমায় 0.5 যোগ করবে।'
 a=P('মোট গণসংখ্যা নির্ণয় কর।',N,rf'$N=\sum f={"+".join(map(str,d["f"]))}={N}$।')
 b=P('সারণি থেকে সরাসরি পদ্ধতিতে আনুমানিক গড় নির্ণয় কর।',d['mean'],mean_solution(d))
 c=P('সারণির গণসংখ্যা বহুভুজ অঙ্কন কর; অক্ষ, বিন্দু ও দুই প্রান্তের শূন্য গণসংখ্যা ব্যাখ্যা কর।',N,'অনুভূমিক অক্ষে শ্রেণিমধ্যমান এবং উল্লম্ব অক্ষে গণসংখ্যা নাও। মধ্যমান-গণসংখ্যা বিন্দুগুলো সরলরেখায় যোগ কর। প্রথম ও শেষ শ্রেণির বাইরের এক শ্রেণি দূরের মধ্যমানে শূন্য গণসংখ্যা নিয়ে বহুভুজ বন্ধ কর। প্রতিটি অক্ষের সংখ্যামান নিচে দেওয়া আছে।')
 model=dict(kind='grouped',grouped=model_serial(d));gkind='polygon'
 if i==1:
  b=P('সংক্ষিপ্ত পদ্ধতিতে আনুমানিক গড় নির্ণয় কর।',d['mean'],mean_solution(d,True));c=P('গড় নির্ণয়ে সরাসরি ও সংক্ষিপ্ত পদ্ধতির ফলের পার্থক্য কত? যুক্তি দাও।',0,r'$u=(x-A)/h$ থেকে $x=A+hu$। তাই $\sum fx=A\sum f+h\sum fu$; N দিয়ে ভাগ করলে দুই সূত্র অভিন্ন, পার্থক্য 0।');gkind=None
 elif i==2:
  a=P('মধ্যক শ্রেণির পূর্ববর্তী ক্রমযোজিত গণসংখ্যা কত?',d['cf'][j-1] if j else 0,rf'$N/2={tex(R(N,2))}$; মধ্যক শ্রেণি {labels(d)[j]}। তার আগের সঞ্চিত গণসংখ্যা {d["cf"][j-1] if j else 0}।')
  b=P('প্রকৃত শ্রেণিসীমা ব্যবহার করে আনুমানিক মধ্যক নির্ণয় কর।',d['median'],median_solution(d));c=P('কম-থেকে অজিভ আঁক এবং N/2 রেখা থেকে মধ্যক পাওয়ার পদ্ধতি লেখ।',d['median'],cumulative(d)+rf'প্রথম প্রকৃত নিম্নসীমায় (L₀,0) থেকে শুরু করে প্রতিটি প্রকৃত উচ্চসীমার সঙ্গে তার ক্রমযোজিত গণসংখ্যার বিন্দু বসাও; যোগে কম-থেকে অজিভ। y=N/2 থেকে অনুভূমিক রেখা এবং ছেদবিন্দু থেকে x-অক্ষে লম্ব নামালে আনুমানিক মধ্যক ${tex(d["median"])}$ পাওয়া যায়।');gkind='less'
 elif i==3:
  a=P('প্রচুরক শ্রেণির গণসংখ্যা কত?',d['f'][mi],f'সর্বাধিক গণসংখ্যা {d["f"][mi]}, শ্রেণি {labels(d)[mi]}।');b=P('প্রকৃত শ্রেণিসীমা ব্যবহার করে আনুমানিক প্রচুরক নির্ণয় কর।',d['mode'],mode_solution(d));c=P('আয়তলেখ অঙ্কন কর এবং আয়তক্ষেত্রগুলোর প্রস্থ ও উচ্চতা ব্যাখ্যা কর।',h,'প্রকৃত শ্রেণিসীমা অনুভূমিক অক্ষে এবং গণসংখ্যা উল্লম্ব অক্ষে। শ্রেণিগুলোর প্রস্থ সমান, তাই উচ্চতা f নেওয়া যায়; পাশাপাশি আয়তক্ষেত্রে ফাঁক থাকবে না। অসম প্রস্থের ক্ষেত্রে সরাসরি f-কে উচ্চতা ধরা যাবে না, গণসংখ্যা-ঘনত্ব লাগবে।');gkind='histogram'
 elif i==4:
  a=P('শ্রেণিব্যাপ্তি কত?',h,rf'প্রকৃত পরপর সীমার পার্থক্য h={h}; অন্তর্ভুক্তিমূলক শ্রেণির জন্য আপাত উচ্চসীমা−নিম্নসীমা নয়।');b=P('সর্বোচ্চ গণসংখ্যার শ্রেণির মধ্যমান কত?',d['m'][mi],rf'প্রচুরক শ্রেণি {labels(d)[mi]}; দুই আপাত সীমার গড় ${tex(d["m"][mi])}$।')
 elif i==5:
  b=P('কম-থেকে ক্রমযোজিত সারণি ব্যবহার করে আনুমানিক মধ্যক নির্ণয় কর।',d['median'],median_solution(d));c=P('কম-থেকে অজিভ অঙ্কন কর এবং দুই প্রান্তবিন্দু ব্যাখ্যা কর।',N,cumulative(d)+rf'প্রথম বিন্দু $({tex(d["bounds"][0])},0)$, শেষ বিন্দু $({tex(d["bounds"][-1])},{N})$। মাঝের বিন্দু প্রকৃত উচ্চসীমা ও তত পর্যন্ত সঞ্চিত গণসংখ্যা; y কমবে না।');gkind='less'
 elif i==6:
  a=P('শুরুতে বেশি-থেকে ক্রমযোজিত গণসংখ্যা কত?',N,rf'সর্বপ্রথম প্রকৃত নিম্নসীমার উপরে সব পর্যবেক্ষণ আছে; গণসংখ্যা {N}।');b=P('শেষ শ্রেণির প্রকৃত উচ্চসীমায় বেশি-থেকে ক্রমযোজিত গণসংখ্যা কত?',0,'সব পর্যবেক্ষণ এই সীমার নিচে; তাই অবশিষ্ট গণসংখ্যা 0।');c=P('বেশি-থেকে অজিভ অঙ্কন কর ও সঞ্চিত গণসংখ্যার নিয়ম লেখ।',N,table(['প্রকৃত নিম্নসীমা',*[str(x) for x in d['bounds']]],[['বেশি-থেকে সঞ্চিত f',N,*[N-x for x in d['cf']]]])+f'প্রতিটি ধাপে আগের শ্রেণির গণসংখ্যা বাদ যায়; y ক্রমহ্রাসমান। প্রথম {N}, শেষ 0।');gkind='more'
 elif i in [7,8,9,13,14,16]:
  values=[int(k),int(k+2),int(k+4),int(k+6),int(k+8)];freq=[2,3,6+n%3,4,1];raw=[x for x,num in zip(values,freq) for _ in range(num)];raw=raw[::2]+raw[1::2];r=raw_stats(raw);model=dict(kind='raw',raw=raw,frequencyValues=values,frequencyCounts=freq);gkind=None
  stem=('নিচে একটি বিচ্ছিন্ন চলকের মান ও গণসংখ্যা দেওয়া হলো।'+raw_grid(r)) if i in [13,14] else ('নিচের উপাত্তগুলো বিবেচনা কর: '+', '.join(map(str,raw))+'।')
  a=P('উপাত্তের সংখ্যা কত এবং চলকটি গণনাযোগ্য হলে কী ধরনের চলক?',r['N'],f'মোট {r["N"]}টি পর্যবেক্ষণ। গণনা থেকে পৃথক পৃথক পূর্ণসংখ্যা মান পেলে চলকটি বিচ্ছিন্ন; পরিমাপের উচ্চতা/সময় মৌলিকভাবে অবিচ্ছিন্ন, রাউন্ড করা মান দেখে তাকে বিচ্ছিন্ন বলা যাবে না।')
  b=P('উপাত্তের গড় নির্ণয় কর।',r['mean'],raw_grid(r)+rf'$\sum x={sum(raw)},N={len(raw)}$; $\bar x={tex(r["mean"])}$। এটি কাঁচা উপাত্তের সঠিক গড়।')
  c=P('উপাত্তের মধ্যক নির্ণয় করে সাজানোর প্রয়োজন ব্যাখ্যা কর।',r['median'],'ছোট থেকে বড় ক্রম: '+', '.join(map(str,r['sorted']))+rf'। N={len(raw)}; মধ্যবর্তী অবস্থানের মান নিয়ে মধ্যক ${tex(r["median"])}$। জোড় N-এ মাঝের দুটি পদের গড় নিতে হবে।')
  if i==8:b=P('উপাত্তের মধ্যক নির্ণয় কর।',r['median'],c['solution']);c=P('সব মানের সঙ্গে 5 যোগ করলে নতুন মধ্যক কত? কারণ লেখ।',r['median']+5,rf'একই ধ্রুবক যোগে সাজানো ক্রম অপরিবর্তিত এবং মাঝের মান/মানদ্বয় 5 বাড়ে। নতুন মধ্যক ${tex(r["median"]+5)}$।')
  if i in [9,14]:b=P('উপাত্তের প্রচুরক নির্ণয় কর।',r['modes'][0],raw_grid(r)+f'সর্বাধিক বার এসেছে {r["modes"][0]}, গণসংখ্যা {max(freq)}; তাই একমাত্র প্রচুরক {r["modes"][0]}।');c=P('গড় ও প্রচুরকের পার্থক্য (গড়−প্রচুরক) কত?',r['mean']-r['modes'][0],rf'গড় ${tex(r["mean"])}$; গড়−প্রচুরক $={tex(r["mean"]-r["modes"][0])}$। ঋণাত্মক মান হলে গড় প্রচুরকের চেয়ে কম।')
  if i==16:
   b=P('সব মানকে 2 দিয়ে গুণ করে 3 যোগ করলে নতুন গড় কত?',2*r['mean']+3,rf'প্রতিটি $y=2x+3$; $\bar y=2\bar x+3={tex(2*r["mean"]+3)}$।');c=P('একই রূপান্তরে নতুন মধ্যক কত?',2*r['median']+3,rf'গুণক 2 ধনাত্মক বলে ক্রম থাকে। নতুন মধ্যক $2M+3={tex(2*r["median"]+3)}$।')
 elif i==10:
  raw=[lo+(a%5)*h+(a*3+n)%h for a in range(30)];r=raw_stats(raw);ff=[sum(x<=v<=x+h-1 for v in raw) for x in d['starts']];d=grouped(lo,h,ff) if len(set(ff))>1 else grouped(lo,h,[5,6,8,7,4])
  # Construct a nonuniform 30-observation sample whose stated frequencies are real.
  raw=[int(start+(z*3+n)%h) for start,num in zip(d['starts'],d['f']) for z in range(num)];r=raw_stats(raw);model=dict(kind='raw-grouped',raw=raw,grouped=model_serial(d));stem='পূর্ণসংখ্যায় রেকর্ড করা নিচের উপাত্ত দেওয়া হলো: '+', '.join(map(str,raw))+f'। প্রথম শ্রেণি {labels(d)[0]} এবং শ্রেণিব্যাপ্তি {h} নিয়ে সব উপাত্তের গণসংখ্যা সারণি বানাবে।'
  a=P('উপাত্তের মোট সংখ্যা কত?',len(raw),f'তালিকা গুনে N={len(raw)}।');b=P('সারণি তৈরি করে সংক্ষিপ্ত পদ্ধতিতে আনুমানিক গড় নির্ণয় কর।',d['mean'],grid(d)+mean_solution(d,True));c=P('তৈরি সারণির কম-থেকে অজিভ অঙ্কন কর।',d['N'],cumulative(d)+'নিচে প্রথম প্রকৃত নিম্নসীমায় শূন্য থেকে শুরু করে প্রকৃত উচ্চসীমা-সঞ্চিত গণসংখ্যার বিন্দুগুলো যুক্ত করা হয়েছে।');gkind='less'
 elif i==11:
  missing=d['f'][2];ff=list(d['f']);ff[2]='x';knownN=N-missing;knownSum=sum(x*f for z,(x,f) in enumerate(zip(d['m'],d['f'])) if z!=2)
  stem='একটি গণসংখ্যা সারণিতে একটি গণসংখ্যা x অজানা।'+table(['শ্রেণি',*labels(d)],[['গণসংখ্যা f',*ff]])+rf'শ্রেণিমধ্যমানের ভিত্তিতে গড় ${tex(d["mean"])}$। x অঋণাত্মক পূর্ণসংখ্যা।'
  a=P('জানা গণসংখ্যাগুলোর যোগ কত?',knownN,rf'অজানা x বাদে জানা গণসংখ্যার যোগ {knownN}।');b=P('অজানা গণসংখ্যা x নির্ণয় কর।',missing,rf'$\bar x=({tex(knownSum)}+{tex(d["m"][2])}x)/({knownN}+x)$। আড়গুণ করে $x={missing}$ পাওয়া যায়, যা ধনাত্মক পূর্ণসংখ্যা।');c=P('x বসিয়ে মোট গণসংখ্যা নির্ণয় ও গড় যাচাই কর।',N,rf'$N={knownN}+{missing}={N}$। $\sum fx={tex(knownSum+d["m"][2]*missing)}$; ভাগে গড় ${tex(d["mean"])}$, প্রদত্ত মানের সমান।');model['missingIndex']=2;gkind=None
 elif i==12:
  stem=f'প্রথম অন্তর্ভুক্তিমূলক শ্রেণির নিম্নসীমা {lo}, সমান শ্রেণিব্যাপ্তি {h}। কম-থেকে ক্রমযোজিত গণসংখ্যা দেওয়া হলো।'+cumulative(d)+'প্রকৃত উচ্চসীমা ব্যবহৃত হয়েছে।'
  a=P('শেষ শ্রেণির গণসংখ্যা কত?',d['f'][-1],rf'পরপর সঞ্চিত গণসংখ্যার বিয়োগ ${d["cf"][-1]}-{d["cf"][-2]}={d["f"][-1]}$।');b=P('গণসংখ্যা পুনরুদ্ধার করে আনুমানিক মধ্যক নির্ণয় কর।',d['median'],median_solution(d));c=P('কম-থেকে অজিভ অঙ্কন কর।',N,cumulative(d)+'প্রথম প্রকৃত নিম্নসীমায় শূন্য যোগ করে সঞ্চিত বিন্দুগুলো যুক্ত কর।');gkind='less'
 elif i==15:
  n1=n+10;n2=n+15;m1=n+30;m2=n+40;mu=R(n1*m1+n2*m2,n1+n2);model=dict(kind='combined',n1=n1,n2=n2,m1=m1,m2=m2)
  stem='দুটি আলাদা দলের সদস্যসংখ্যা ও গড় মান দেওয়া হলো।'+table(['দল','সদস্যসংখ্যা','গড়'],[['A',n1,m1],['B',n2,m2]])
  a=P('দুই দলের মোট সদস্যসংখ্যা কত?',n1+n2,f'{n1}+{n2}={n1+n2}।');b=P('দুই দল একত্র করলে সম্মিলিত গড় কত?',mu,rf'মোট মান ${n1}\times{m1}+{n2}\times{m2}={n1*m1+n2*m2}$; সম্মিলিত গড় ${tex(mu)}$। দল দুটির সদস্যসংখ্যা অসমান বলে গড়দ্বয়ের সাধারণ গড় নয়।');c=P('প্রত্যেক সদস্যের মান 2 বাড়ালে সম্মিলিত গড় কত হবে?',mu+2,rf'মোট মান {2*(n1+n2)} বাড়ে, সদস্যসংখ্যা অপরিবর্তিত। নতুন গড় ${tex(mu+2)}$।');gkind=None
 elif i==17:
  a=P('প্রথম শ্রেণির প্রকৃত নিম্নসীমা কত?',d['bounds'][0],rf'নিম্নসীমা {lo}; প্রকৃত নিম্নসীমা ${lo}-0.5={tex(d["bounds"][0])}$।');b=P('প্রথম শ্রেণির মধ্যমান কত?',d['m'][0],rf'আপাত দুই সীমার গড় $({lo}+{lo+h-1})/2={tex(d["m"][0])}$; প্রকৃত সীমার গড়ও একই।');c=P('প্রথম শ্রেণির প্রকৃত উচ্চসীমা ও শ্রেণিব্যাপ্তি নির্ণয় কর।',h,rf'প্রকৃত উচ্চসীমা ${lo+h-1}+0.5={tex(d["bounds"][1])}$; ব্যাপ্তি ${tex(d["bounds"][1])}-{tex(d["bounds"][0])}={h}$।');gkind=None
 elif i==18:
  a=P('সর্বোচ্চ গণসংখ্যা কত?',d['f'][mi],f'সর্বোচ্চ গণসংখ্যা {d["f"][mi]}।');b=P('প্রথম শ্রেণির আপেক্ষিক গণসংখ্যা শতকরায় কত?',R(100*d['f'][0],N),rf'শতকরা $=100f_1/N=100\times{d["f"][0]}/{N}={tex(R(100*d["f"][0],N))}\%$।');c=P('প্রথম শ্রেণির বাইরের পর্যবেক্ষণ কয়টি?',N-d['f'][0],rf'$N-f_1={N}-{d["f"][0]}={N-d["f"][0]}$। সব শ্রেণির আপেক্ষিক গণসংখ্যার যোগ 1, শতকরার যোগ 100।');gkind=None
 elif i==19:
  vals=[int(k),int(k+2),int(k+4)];weights=[2,3,5];ws=sum(x*f for x,f in zip(vals,weights));model=dict(kind='weighted',values=vals,weights=weights)
  stem='একটি বিচ্ছিন্ন চলকের মান ও সংশ্লিষ্ট গণসংখ্যা দেওয়া হলো।'+table(['মান x',*vals],[['গণসংখ্যা f',*weights]])
  a=P('মোট গণসংখ্যা কত?',sum(weights),'2+3+5=10।');b=P('ভারযুক্ত গড় (গণসংখ্যাভিত্তিক গড়) কত?',R(ws,10),rf'$\bar x=\sum fx/\sum f=({2*vals[0]}+{3*vals[1]}+{5*vals[2]})/10={tex(R(ws,10))}$।');c=P('সব পর্যবেক্ষণের যোগ কত?',ws,rf'$\sum fx={ws}$; শুধু তিনটি ভিন্ন মান যোগ করলে পুনরাবৃত্তি বাদ পড়ে।');gkind=None
 contexts=['চারাগাছের পূর্ণ সেমিতে উচ্চতা','শ্রমিকদের পূর্ণবছরে বয়স','দোকানের দৈনিক বিক্রিত পণ্যের সংখ্যা','শিক্ষার্থীদের পরীক্ষার পূর্ণসংখ্যা নম্বর','পাঠাগারের দৈনিক পাঠকসংখ্যা','নির্বাচিত দিনের যাত্রীসংখ্যা','বিদ্যালয়ের নির্বাচিত শ্রেণির শিক্ষার্থীসংখ্যা','অনুশীলনী পরীক্ষার নম্বর','নির্বাচিত দিনে বিক্রিত বইয়ের সংখ্যা','একটি কেন্দ্রে দৈনিক উপস্থিতির সংখ্যা','ত্রিশটি বস্তুর পূর্ণ এককে পরিমাপ','উৎপাদিত পণ্যের পরিমাপ','ক্রীড়াবিদদের পূর্ণ এককে রেকর্ড','একটি দোকানের দৈনিক চাহিদার মান','আরেক দোকানের দৈনিক বিক্রির মান','দুটি দলের পরিমাপ','কারখানায় দৈনিক উৎপাদিত এককের সংখ্যা','পূর্ণসংখ্যা পরিমাপের শ্রেণিসীমা','নমুনার শ্রেণিভিত্তিক অংশ','পুনরাবৃত্ত মানের ভারযুক্ত হিসাব']
 stem=contexts[i]+'—'+stem
 return dict(family=f,stem=stem,parts=[a,b,c],model=model,plotData=d,graphKind=gkind)

# Source compilation was visually checked; avoid ambiguous grouped-mode answers
# using apparent limits in the scan rather than silently switching conventions.
d=grouped(31,10,[4,8,20,12,6]);bank.source(1,2,'dhaka','নিচের সারণিতে মধ্যক শ্রেণির পূর্ববর্তী ক্রমযোজিত গণসংখ্যা কত?'+grid(d),['$12$','$20$','$25$','$32$'],'A',12,'মোট N=50; N/2=25। সঞ্চিত গণসংখ্যা 4,12,32,44,50; মধ্যক শ্রেণি 51–60, তার পূর্ববর্তী ক্রমযোজিত গণসংখ্যা 12।',NONE)
bank.source(11,15,'rajshahi','কোনো শ্রেণির নিম্নসীমা 30 এবং শ্রেণিমধ্যমান 32 হলে ঐ শ্রেণির উচ্চসীমা কত?', ['$37$','$35$','$34$','$33$'],'C',34,r'মধ্যমান=(নিম্নসীমা+উচ্চসীমা)/2; $32=(30+U)/2$ থেকে U=34। এখানে আপাত সীমা বোঝানো হয়েছে, প্রকৃত উচ্চসীমানা নয়।',NONE)
bank.source(20,11,'cumilla','নিচের কোনটি বিচ্ছিন্ন চলক?', ['জনসংখ্যা','শিক্ষার্থীদের উচ্চতা','বয়স','তাপমাত্রা'],'A',1,'জনসংখ্যা গণনাযোগ্য পূর্ণসংখ্যা। উচ্চতা ও তাপমাত্রা পরিমাপযোগ্য অবিচ্ছিন্ন চলক; বয়সও সময়ের পরিমাপ হিসেবে অবিচ্ছিন্ন (পূর্ণবছরে রেকর্ড করা আলাদা বিষয়)।',NONE)
bank.audit[-1]['adaptation']+=' বয়সকে সময়ের পরিমাপ হিসেবে ব্যাখ্যা করা হয়েছে; বোর্ডের একক উত্তর-প্রসঙ্গ অক্ষুণ্ণ।'
d=grouped(21,10,[8,15,12,8,7]);bank.source(20,12,'cumilla','নিচের গণসংখ্যা সারণির প্রচুরক শ্রেণির উচ্চসীমা কত?'+grid(d),['$50$','$41$','$40$','$31$'],'C',40,'সর্বাধিক গণসংখ্যা 15; শ্রেণি 31–40, তাই আপাত উচ্চসীমা 40। প্রকৃত উচ্চসীমানা 40.5 আলাদা।',NONE)

# User supplied screenshot is a format/data reference, NOT authenticated board provenance.
def usercq(number,stem,parts,model):
 bank.rows.append(dict(type='CQ',text=stem,explanation='প্রদত্ত ছবির প্রশ্ন থেকে অভিযোজিত; নিচে ধাপভিত্তিক সমাধান। DB/MB 2025 badge স্বাধীনভাবে যাচাই হয়নি, তাই বোর্ড attribution নেই।',page=f'ব্যবহারকারীর প্রদত্ত screenshot; প্রশ্ন {number}; অভিযোজিত, বোর্ড পরিচয় অযাচাইকৃত',difficulty='HARD',parts=[dict(label=l,marks=m,question=p['question'],solution=p['solution']) for l,m,p in zip(['ক','খ','গ'],[2,4,4],parts)]))
 bank.audit.append(dict(origin='ADAPTED_USER_SCREENSHOT_NOT_AUTHENTICATED_BOARD',family='user-reference',variant=number,hasDiagram=False,hasTable='| ---' in stem,model=model,responseExpressions=[str(p['value']) for p in parts],sourceReference='Screenshot_2026-11-22-11-18-34-26_40deb401b9ffe8e1df2f1cc5ba480b12.jpg',adaptation='উপাত্ত/প্রশ্নের কাঠামো রেখে inclusive class-এর প্রকৃত সীমা ও লেখচিত্র নির্দেশনা স্পষ্ট; কোনো DB/MB badge-কে official board provenance ধরা হয়নি।'))
d=grouped(21,10,[6,12,20,10,2]);usercq(1,'৫০ জন শ্রমিকের পূর্ণবছরে রেকর্ড করা বয়সের গণসংখ্যা সারণি:'+grid(d)+'প্রকৃত সীমা নিতে প্রতিটি আপাত সীমা 0.5 করে সমন্বয় করবে।',[P('কোনো শ্রেণির উচ্চসীমা 65 ও মধ্যমান 62.5 হলে নিম্নসীমা নির্ণয় কর।',60,r'$62.5=(L+65)/2$ থেকে L=60। এটি ওই শ্রেণির আপাত নিম্নসীমা।'),P('প্রদত্ত সারণি থেকে আনুমানিক মধ্যক নির্ণয় কর।',d['median'],median_solution(d)),P('গণসংখ্যা বহুভুজ অঙ্কন কর।',50,'শ্রেণিমধ্যমান 25.5,35.5,45.5,55.5,65.5-এ f=6,12,20,10,2 বসিয়ে যুক্ত কর; বন্ধ করার দুই প্রান্ত (15.5,0),(75.5,0)।'+graph(d,'polygon','user-1-polygon'))],dict(kind='user-grouped-1',grouped=model_serial(d)))
raw=[75,65,80,55,60,80,50,75,64,70,80,75,55,80,70,75,67,80,90,72,93,85,69,74,80,78,64,80,85,99];d=grouped(50,10,[sum(lo<=x<=lo+9 for x in raw) for lo in [50,60,70,80,90]])
usercq(2,'দশম শ্রেণির ৩০ শিক্ষার্থীর গণিতের প্রাপ্ত পূর্ণসংখ্যা নম্বর: '+', '.join(map(str,raw))+'। 50–59 থেকে 10 ব্যাপ্তির শ্রেণি নাও।',[P('হাতির সংখ্যা কোন ধরনের চলক এবং কেন?',1,'হাতির সংখ্যা বিচ্ছিন্ন চলক: গণনায় 0,1,2,… পূর্ণসংখ্যা মান নেয়; দুই গণনার মাঝখানে ভগ্নাংশ হাতি হয় না।'),P('গণসংখ্যা সারণি তৈরি করে সংক্ষিপ্ত পদ্ধতিতে আনুমানিক গড় নির্ণয় কর।',d['mean'],grid(d)+mean_solution(d,True)),P('প্রদত্ত উপাত্তের কম-থেকে অজিভ অঙ্কন কর।',30,cumulative(d)+'প্রকৃত উচ্চসীমার সঞ্চিত বিন্দুগুলো এবং প্রথম নিম্নসীমায় শূন্য বসিয়ে যোগ কর।'+graph(d,'less','user-2-ogive'))],dict(kind='user-raw-2',raw=raw,grouped=model_serial(d)))
d=grouped(51,5,[8,12,20,10,6,4]);sample=[14,9,7,10,12,11,6,13]
usercq(3,'নিচে একটি গণসংখ্যা নিবেশন সারণি দেওয়া হলো:'+grid(d),[P('14,9,7,10,12,11,6,13 উপাত্তের মধ্যক নির্ণয় কর।',R(21,2),'সাজানো মান 6,7,9,10,11,12,13,14। 8টি পদের মধ্যক =(10+11)/2=10.5।'),P('সারণি থেকে সংক্ষিপ্ত পদ্ধতিতে আনুমানিক গড় নির্ণয় কর।',d['mean'],mean_solution(d,True)),P('বর্ণনাসহ গণসংখ্যা বহুভুজ অঙ্কন কর।',60,'মধ্যমান 53,58,63,68,73,78; f=8,12,20,10,6,4। (48,0),(83,0) দিয়ে বন্ধ কর। অক্ষে সমান স্কেল ও সংখ্যামান রক্ষিত।'+graph(d,'polygon','user-3-polygon'))],dict(kind='user-grouped-3',sample=sample,grouped=model_serial(d)))

for n in range(1,16):
 for i in range(20):
  if n==15 and i>=16:continue
  r=scenario(i,n);part=r['parts'][1];value=part['value'];wrong=[]
  for w in [value+1,value-1,value+2,2*value,value/2,value+3]:
   w=S.simplify(w)
   if w!=value and all(S.simplify(w-x)!=0 for x in wrong):wrong.append(w)
   if len(wrong)==3:break
  bank.mcq(r['family'],n,r['stem']+' '+part['question'],value,part['solution'],NONE,wrong)
  bank.audit[-1].update(model=r['model'],responseExpressions=[str(p['value']) for p in r['parts']],hasTable='| ---' in r['stem'])
for n in range(1,11):
 for i in range(20):
  if n==10 and i>=17:continue
  r=scenario(i,n);parts=[dict(p) for p in r['parts']]
  if r['graphKind']:parts[2]['solution']+=graph(r['plotData'],r['graphKind'],f'cq-{r["family"]}-{n}')
  bank.written('CQ',r['family'],n,r['stem'],[(p['question'],p['solution']) for p in parts],NONE,[])
  bank.rows[-1]['explanation']='ক/খ/গ অংশে ধাপভিত্তিক সমাধান, প্রয়োজনীয় কাজের সারণি ও লেখচিত্র দেওয়া আছে। শ্রেণিবদ্ধ উপাত্তের মধ্যমান/সরল অন্তর্বেশনভিত্তিক ফল আনুমানিক।'
  bank.audit[-1].update(model=r['model'],responseExpressions=[str(p['value']) for p in parts],hasTable='| ---' in r['stem'],answerGraphKind=r['graphKind'])
for n in range(16,26):
 for i in range(10):
  r=scenario(i,n);p=r['parts'][1];bank.written('SQ',r['family'],n,'সংক্ষিপ্ত প্রশ্ন: '+r['stem']+' '+p['question'],p['solution'],NONE,[]);bank.audit[-1].update(model=r['model'],responseExpressions=[str(p['value']) for p in r['parts']],hasTable='| ---' in r['stem'])
bank.extraReview=dict(userReferenceCounts=dict(MCQ=0,CQ=3,SQ=0),answerGraphCount=len(bank.assets),tableQuestionCounts={kind:sum(q['type']==kind and '| ---' in q['text'] for q in bank.rows) for kind in ['MCQ','CQ','SQ']},tableFormat='BOUNDED_LITERAL_PIPE_TABLE_V1_REAL_HTML_RENDERER',statisticalConvention='Inclusive integer classes -> true boundaries ±0.5; grouped estimates use midpoints/linear interpolation. Raw statistics exact; no inferred official screenshot provenance.')
bank.emit()
