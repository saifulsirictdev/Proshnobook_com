#!/usr/bin/env python3
"""Complete chapter-17 reconstruction; deterministic, offline and backup-gated.
Writes only restart-r1/full600, its review and new r1 graph assets. Never approves.
"""
import copy, hashlib, html, importlib.util, json, math, re
from collections import Counter
from fractions import Fraction as F
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('batch01',Path(__file__).with_name('rebuild-statistics-r1.py'));b=importlib.util.module_from_spec(spec);spec.loader.exec_module(b)
BASE=b.BASE;OUT=b.OUT/'full600';ASSETS=ROOT/'public/question-bank/ssc-math-ch17-v1';DOC=ROOT/'docs/question-bank/ssc-statistics-restart-r1-full600.html'
num=b.num;table=b.table;group=b.group;labels=b.labels;work=b.work
jread=lambda p:json.loads(p.read_text())

def avg(xs):return F(sum(xs),len(xs))
def med(xs):
 a=sorted(xs);n=len(a);return F(a[n//2]) if n%2 else F(a[n//2-1]+a[n//2],2)
def grid(d,fs=None):return table(['শ্রেণি',*labels(d)],[['গণসংখ্যা',*(fs if fs is not None else d['f'])]])
def rawwork(raw):
 c=Counter(raw);return table(['x','f','fx'],[[x,c[x],x*c[x]] for x in sorted(c)])+f'মোট N={len(raw)}, Σfx={sum(raw)}। গড়=Σfx/N={sum(raw)}/{len(raw)}={num(avg(raw))}।'
def rawmedian(raw):
 a=sorted(raw);n=len(a)
 return 'ঊর্ধ্বক্রম: '+', '.join(map(str,a))+f'। N={n}। '+(f'মধ্যক {(n+1)//2}তম পদ={a[n//2]}।' if n%2 else f'মধ্যক {n//2}তম ও {n//2+1}তম পদের গড়=({a[n//2-1]}+{a[n//2]})/2={num(med(raw))}।')
def rawmode(raw):
 c=Counter(raw);m=max(c.values());xs=[x for x in sorted(c) if c[x]==m]
 return 'সর্বাধিক গণসংখ্যা '+str(m)+'; সংশ্লিষ্ট মান '+', '.join(map(str,xs))+'। '+('তাই একক প্রচুরক '+str(xs[0])+'।' if len(xs)==1 else 'এখানে একাধিক প্রচুরক; একটিমাত্র মানকে একক প্রচুরক বলা যাবে না।')

def svg_graph(d,kind,stem):
 if kind=='histogram':points=[(d['bounds'][i],d['bounds'][i+1],f) for i,f in enumerate(d['f'])];text=table(['প্রকৃত নিম্নসীমা','প্রকৃত উচ্চসীমা','উচ্চতা f'],[[num(x),num(y),f] for x,y,f in points])+'সব শ্রেণির ব্যাপ্তি সমান। তাই সংলগ্ন আয়তক্ষেত্রের উচ্চতা f; অনুভূমিক অক্ষে প্রকৃত শ্রেণিসীমা, উল্লম্ব অক্ষে গণসংখ্যা। বারগুলোর মধ্যে ফাঁক নয়।'
 else:text,points=b.graph(d,kind)
 xs=d['bounds'] if kind=='histogram' else [p[0] for p in points];ys=d['f'] if kind=='histogram' else [p[1] for p in points]
 xmin,xmax=float(min(xs)),float(max(xs));top=math.ceil(max(ys)/5)*5
 xy=lambda x,y:(85+(float(x)-xmin)*560/(xmax-xmin),290-float(y)*230/top)
 shapes=[];words=[]
 for y in range(0,top+1,5):
  _,py=xy(xmin,y);shapes.append(f'<path d="M85 {py:.4f}H645" stroke="#dde6ed"/>');words.append(f'<text x="75" y="{py+4:.4f}" text-anchor="end">{y}</text>')
 for x in xs:
  px,_=xy(x,0);shapes.append(f'<path d="M{px:.4f} 290v6"/>');words.append(f'<text x="{px:.4f}" y="315" text-anchor="middle">{num(x)}</text>')
 if kind=='histogram':
  for x,z,y in points:
   px,py=xy(x,y);qx,_=xy(z,0);shapes.append(f'<rect x="{px:.4f}" y="{py:.4f}" width="{qx-px:.4f}" height="{290-py:.4f}" fill="#c1e4df" stroke="#16645b"/>')
 else:
  shapes.append('<polyline fill="none" stroke="#096857" stroke-width="2.4" points="'+' '.join(f'{x:.4f},{y:.4f}' for x,y in [xy(*p) for p in points])+'"/>')
  for x,y in points:
   px,py=xy(x,y);shapes.append(f'<circle cx="{px:.4f}" cy="{py:.4f}" r="3" fill="#096857"/>')
 xname='Class midpoint' if kind=='polygon' else 'Class boundary';yname='Frequency' if kind in ('polygon','histogram') else 'Cumulative frequency'
 svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 740 380" role="img" aria-label="'+kind+' graph"><title>'+kind+'; numeric axes</title><rect width="740" height="380" fill="white"/><g fill="none" stroke="#354856">'+''.join(shapes)+'<path d="M85 50V290H660"/></g><g font-family="Arial,sans-serif" font-size="13" fill="#203c48">'+''.join(words)+f'<text x="365" y="344" text-anchor="middle">{xname}</text><text x="85" y="30">{yname}</text><text x="365" y="370" text-anchor="middle">x-axis starts at {xmin:g}; y-axis starts at 0; y-tick = 5</text></g></svg>'
 path=ASSETS/f'r1-{stem}-{kind}.svg';path.parent.mkdir(parents=True,exist_ok=True);path.write_text(svg)
 url=f'https://proshnobook.com/question-bank/ssc-math-ch17-v1/{path.name}'
 return text+f'\n\n![{kind} লেখচিত্র]({url})\n',{'kind':kind,'points':b.serial(points),'file':str(path.relative_to(ROOT)),'sha256':b.sha(path.read_bytes()),'xmin':xmin,'xmax':xmax,'ymax':top,'xOriginPixel':85,'yOriginPixel':290,'plotWidth':560,'plotHeight':230}


def part(k,q,s):return {'label':'কখগ'[k],'marks':[2,4,4][k],'question':q,'solution':s}
def gparts(d,variant,i):
 """12 substantive grouped tasks; no 4-mark ask for only a class/total."""
 j=d['medianIndex'];m=d['modalIndex'];mid=d['mids'];fs=d['f'];N=d['N'];h=d['h'];graphs=[]
 ks=[('সর্বাধিক গণসংখ্যার শ্রেণি ও তার মধ্যমান লেখ।',f'সর্বাধিক f={fs[m]}; শ্রেণি {labels(d)[m]}, মধ্যমান {num(mid[m])}।'),('মধ্যক শ্রেণির আগের সঞ্চিত গণসংখ্যা নির্ণয় কর।',f'N={N}; N/2={num(F(N,2))}; cf='+','.join(map(str,d['cf']))+f'। মধ্যক শ্রেণি {labels(d)[j]}; পূর্ববর্তী cf={d["cf"][j-1] if j else 0}।'),('প্রথম শ্রেণির প্রকৃত সীমা ও ব্যাপ্তি নির্ণয় কর।',f'প্রকৃত সীমা {num(d["bounds"][0])}, {num(d["bounds"][1])}; ব্যবধান={h}।')]
 kq,ksol=ks[variant%3]
 method=['median','shortcut','direct','mode','median','shortcut','direct','median','mode','direct','shortcut','median'][variant]
 if method=='mode' and d['mode'] is None:method='median'
 bq={'median':'কাজের সারণি তৈরি করে আনুমানিক মধ্যক নির্ণয় কর।','mode':'প্রকৃত নিম্নসীমা ব্যবহার করে আনুমানিক প্রচুরক নির্ণয় কর।','direct':'কাজের সারণিসহ সরাসরি পদ্ধতিতে আনুমানিক গড় নির্ণয় কর।','shortcut':'কাজের সারণিসহ সংক্ষিপ্ত পদ্ধতিতে আনুমানিক গড় নির্ণয় কর।'}[method];bs=work(d,method)
 if variant in (0,1,2,3):
  kind=['polygon','less','more','histogram'][variant];gq={'polygon':'স্কেল ও অক্ষের নামসহ গণসংখ্যা বহুভুজ অঙ্কন কর।','less':'সঞ্চিত গণসংখ্যা বের করে কম-থেকে অজিভ অঙ্কন কর।','more':'বেশি-থেকে সঞ্চিত গণসংখ্যা বের করে অজিভ অঙ্কন কর।','histogram':'সমান শ্রেণিব্যাপ্তির জন্য আয়তলেখ অঙ্কন করে উচ্চতা বাছাইয়ের কারণ লেখ।'}[kind]
  gs,g=svg_graph(d,kind,f'cq-{i:03}');graphs.append(g)
 elif variant==4:
  delta=h//2+1;gq=f'প্রতিটি পর্যবেক্ষণের সঙ্গে {delta} যোগ করা হলো। নতুন শ্রেণিসীমা, আনুমানিক গড় ও মধ্যক নির্ণয় করে পুরোনোগুলোর সঙ্গে সম্পর্ক দেখাও।'
  nd=group(d['lo']+delta,h,fs);gs=grid(nd)+f'নতুন মধ্যমানগুলো পুরোনো মধ্যমান+{delta}। তাই Σf(x+{delta})=Σfx+{delta}N; নতুন গড়={num(d["mean"])}+{delta}={num(nd["mean"])}। মধ্যকের সূত্রে L-ই কেবল {delta} বাড়ে, F,f,h অপরিবর্তিত। নতুন মধ্যক={num(d["median"])}+{delta}={num(nd["median"])}। পরিসর অপরিবর্তিত; অবস্থানের মাপ সরে যায়।'
 elif variant==5:
  second=group(d['lo'],h,list(reversed(fs)));gq='আরেকটি দলের একই শ্রেণিগুলোর গণসংখ্যা বিপরীত ক্রমে '+', '.join(map(str,second['f']))+'। দুই দলের আনুমানিক গড় নির্ণয় করে তুলনা কর।';delta=second['mean']-d['mean'];gs='প্রথম দলের গড়:'+work(d,'direct')+'দ্বিতীয় দলের গড়:'+work(second,'direct')+f'দ্বিতীয়−প্রথম={num(delta)}। '+('দ্বিতীয় দলের গড় বেশি।' if delta>0 else 'প্রথম দলের গড় বেশি।' if delta<0 else 'দুই গড় সমান।')+' শুধু গড় থেকে কোন দলের বিচ্যুতি কম তা সিদ্ধান্ত নেওয়া যায় না।'
 elif variant==6:
  gq='শিক্ষার্থী শ্রেণির নিম্নসীমা দিয়ে গড় করেছে। তার হিসাব নির্ণয় করে কেন ভুল এবং সঠিক আনুমানিক গড়ের সঙ্গে পার্থক্য কত দেখাও।';bad=sum(F(x)*f for x,f in zip(d['starts'],fs))/N;gs=table(['নিম্নসীমা','f','গুণফল'],[[x,f,x*f] for x,f in zip(d['starts'],fs)])+f'ভুল প্রতিনিধি দিয়ে গড়={num(bad)}। প্রতিটি মধ্যমান নিম্নসীমা থেকে (h−1)/2={num(F(h-1,2))} বেশি। তাই সঠিক আনুমানিক গড়={num(bad)}+{num(F(h-1,2))}={num(d["mean"])}। মধ্যমান শ্রেণির কেন্দ্র; নিম্নসীমা ব্যবহার করলে সব প্রতিনিধিমান একদিকে সরে যায়।'
 elif variant==7:
  gq='সব শ্রেণির গণসংখ্যা দ্বিগুণ করলে গড়, মধ্যক ও প্রচুরক শ্রেণি বদলাবে কি? সূত্রে প্রতিস্থাপন করে যুক্তি দাও।';nd=group(d['lo'],h,[2*f for f in fs]);gs=f'নতুন N={2*N}; Σfx ও Σf দুটিই দ্বিগুণ; গড়=(2Σfx)/(2Σf)={num(d["mean"])}। মধ্যক শ্রেণি একই; L+((2N/2−2F)/(2f))h=L+((N/2−F)/f)h={num(nd["median"])}। প্রতিটি f একই ধনাত্মক গুণকে গুণিত, তাই সর্বাধিক f-এর শ্রেণি {labels(d)[m]} অপরিবর্তিত। পর্যবেক্ষণসংখ্যা বদলায়, এই অবস্থানগত মাপগুলো বদলায় না।'
 elif variant==8:
  gq='কেউ প্রচুরক শ্রেণির মধ্যমানকেই আনুমানিক প্রচুরক বলেছে। সূত্রে পাওয়া প্রচুরকের সঙ্গে তুলনা করে দাবিটি যাচাই কর।';gs=work(d,'mode')+f'শ্রেণির মধ্যমান {num(mid[m])}। সূত্রের মান−মধ্যমান={num(d["mode"]-mid[m])}। '+('এখানে মান দুটি মিলে গেলেও পদ্ধতি দুটি সাধারণভাবে সমতুল্য নয়; পাশের গণসংখ্যার সমতার বিশেষ অবস্থায় তা হয়।' if d['mode']==mid[m] else 'সুতরাং এখানে দাবিটি ভুল। মধ্যমান শুধু কেন্দ্র; প্রচুরকের সূত্রে পাশের শ্রেণির গণসংখ্যাও প্রভাব ফেলে।')
 elif variant==9:
  gq='একটি গণনা ভুলে দ্বিতীয় শ্রেণির একটি পর্যবেক্ষণ তৃতীয় শ্রেণিতে গেছে। সংশোধিত সারণি ও গড় নির্ণয় করে গড়ের পরিবর্তন ব্যাখ্যা কর।';nf=fs.copy();nf[1]-=1;nf[2]+=1;nd=group(d['lo'],h,nf);gs=work(nd,'direct')+f'মোট N={N} অপরিবর্তিত; একটি প্রতিনিধিমান {num(mid[1])} থেকে {num(mid[2])} হয়েছে। Σfx বাড়ে {h}; গড় বাড়ে {h}/{N}={num(F(h,N))}। পুরোনো গড় {num(d["mean"])}; নতুন {num(nd["mean"])}।'
 elif variant==10:
  low=sum(x*f for x,f in zip(d['starts'],fs));high=sum((x+h-1)*f for x,f in zip(d['starts'],fs));gq='সব রেকর্ড পূর্ণসংখ্যা। প্রকৃত কাঁচা গড়ের সর্বনিম্ন ও সর্বোচ্চ সম্ভাব্য মান নির্ণয় কর। মধ্যমানভিত্তিক গড় কেন একমাত্র সম্ভাব্য মান নয়?';gs=f'প্রতিটি মান তার শ্রেণির নিম্ন ও উচ্চসীমার মধ্যে। সব মান নিজ শ্রেণির নিম্নসীমায় হলে যোগফল {low}; গড় {num(F(low,N))}। সব মান উচ্চসীমায় হলে যোগফল {high}; গড় {num(F(high,N))}। অতএব {num(F(low,N))} ≤ কাঁচা গড় ≤ {num(F(high,N))}। মধ্যমানভিত্তিক গড় {num(d["mean"])} এই দুই সীমার মাঝামাঝি। শ্রেণির ভিতরের আসল অবস্থান না জানায় নির্দিষ্ট কাঁচা গড় উদ্ধার করা যায় না।'
 else:
  gq='অজিভের সাহায্যে মধ্যক নির্ণয়ের পদ্ধতি দেখাও এবং সূত্রের মধ্যকের সঙ্গে মিলিয়ে দেখাও।';gs,g=svg_graph(d,'less',f'cq-{i:03}');graphs.append(g);prev=d['cf'][j-1] if j else 0;gs+=f'N/2={num(F(N,2))} উচ্চতায় অনুভূমিক রেখা অজিভকে ছেদ করুক। পাশের বিন্দু ({num(d["bounds"][j])},{prev}) ও ({num(d["bounds"][j+1])},{d["cf"][j]})-এর মধ্যে সরলরৈখিক অন্তর্বেশন করলে x=L+((N/2−F)/f)h={num(d["median"])}। তাই রেখা থেকে পড়া আনুমানিক মান সূত্রের সঙ্গে মেলে; অঙ্কনের স্কেলে সামান্য পাঠভেদ হতে পারে।'
 return [part(0,kq,ksol),part(1,bq,bs),part(2,gq,gs)],graphs,method


def make_cq(i,r,old,sources,rawvariant=0):
 model=r['model'];raw=model.get('raw');graphs=[];extra={};family='';d=None
 if 'grouped' in model:
  m=model['grouped'];d=group(m['lo'],m['h'],m['f']);v=(i-11)%12;family=f'grouped-{v:02}'
  parts,graphs,method=gparts(d,v,i)
  if raw:
   stem='একটি জরিপে পাওয়া পূর্ণসংখ্যা রেকর্ড: '+', '.join(map(str,raw))+f'। প্রথম শ্রেণি {labels(d)[0]}; শ্রেণিব্যাপ্তি {d["h"]}।'
   # Grouping is part of the four-mark working, not given away in the stimulus.
   parts[1]['question']='প্রথমে নির্ধারিত শ্রেণিগুলোতে গণসংখ্যা সারণি তৈরি কর। তারপর '+parts[1]['question'];parts[1]['solution']=grid(d)+parts[1]['solution']
  elif v in (1,7):
   stem='পূর্ণসংখ্যায় রেকর্ড করা পরিমাপের কম-থেকে সঞ্চিত গণসংখ্যা দেওয়া আছে। শ্রেণিসমূহ '+', '.join(labels(d))+'।'+table(['প্রকৃত উচ্চসীমা',*[num(x) for x in d['bounds'][1:]]],[['সঞ্চিত f',*d['cf']]])
   recover='পৃথক f='+', '.join(map(str,d['f']))+' (পরপর সঞ্চিত মানের পার্থক্য)।';parts[1]['solution']=recover+parts[1]['solution']
  elif v in (2,8):
   fs=d['f'].copy();hidden=2;fs[hidden]='x';stem=f'পূর্ণসংখ্যায় রেকর্ড করা পরিমাপের সারণি; মোট পর্যবেক্ষণ {d["N"]}।'+grid(d,fs);recover=f'x={d["N"]}−{sum(d["f"])-d["f"][hidden]}={d["f"][hidden]}।';parts[0]=part(0,'অজানা গণসংখ্যা নির্ণয় করে সারণিটি পূর্ণ কর।',recover)
  else:stem=f'পূর্ণসংখ্যায় রেকর্ড করা পরিমাপের {d["N"]}টি পর্যবেক্ষণের শ্রেণিবদ্ধ সারণি:'+grid(d)
  extra={'grouped':b.serial(d),'raw':raw,'variant':v,'mainMethod':method}
 elif model['kind']=='raw':
  a=raw;n=len(a);c=Counter(a);v=rawvariant;family=f'raw-analysis-{v}';stem='একটি ছোট জরিপের রেকর্ড: '+', '.join(map(str,a))+'।'
  kq='পর্যবেক্ষণসংখ্যা ও পরিসর নির্ণয় কর।';ks=f'N={n}; পরিসর={max(a)}−{min(a)}={max(a)-min(a)}।'
  if v in (0,3):bq='গণসংখ্যা সারণিসহ গড় নির্ণয় কর।';bs=rawwork(a)
  elif v in (1,4):bq='গণসংখ্যা সারণি এবং সাজানো অবস্থান ব্যবহার করে মধ্যক নির্ণয় কর।';bs=table(['মান','f'],[[x,c[x]] for x in sorted(c)])+rawmedian(a)
  else:bq='সাজানো উপাত্ত থেকে মধ্যক ও প্রচুরক নির্ণয় করে পদ্ধতির পার্থক্য ব্যাখ্যা কর।';bs=rawmedian(a)+rawmode(a)+' মধ্যক অবস্থাননির্ভর; প্রচুরক সর্বাধিক বার উপস্থিতির উপর নির্ভরশীল।'
  delta=2+i%4
  if v==0:
   gq=f'প্রতিটি রেকর্ড {delta} একক বাড়লে নতুন গড়, মধ্যক ও পরিসর নির্ণয় করে সম্পর্ক দেখাও।';gs=f'পুরোনো গড়={num(avg(a))}, মধ্যক={num(med(a))}। যোগফল বাড়ে {n}×{delta}; নতুন গড়={num(avg(a)+delta)}। সাজানো ক্রম অপরিবর্তিত, মাঝের মান(গুলো) {delta} বাড়ে; নতুন মধ্যক={num(med(a)+delta)}। নতুন পরিসর=({max(a)}+{delta})−({min(a)}+{delta})={max(a)-min(a)}; অপরিবর্তিত।'
  elif v==1:
   oldx=max(a);newx=oldx+10;na=a.copy();na[na.index(oldx)]=newx;gq=f'সর্বোচ্চ মানের একটি রেকর্ড {oldx}-এর বদলে ভুলে {newx} লেখা হয়েছে। ভুল গড় ও মধ্যক বের করে কোন মাপটি এই ভুলে বেশি সংবেদনশীল ব্যাখ্যা কর।';gs=f'ভুল যোগফল={sum(a)}−{oldx}+{newx}={sum(na)}; ভুল গড়={num(avg(na))}।'+rawmedian(na)+f'গড় বেড়েছে {num(avg(na)-avg(a))}; মধ্যকের পরিবর্তন {num(med(na)-med(a))}। এই উপাত্তে চরম মানের ভুল গড়কে প্রভাবিত করেছে, মধ্যক অপরিবর্তিত। এটি প্রতিটি সম্ভাব্য উপাত্তের জন্য সংখ্যাগত একই পরিবর্তনের দাবি নয়।'
  elif v==2:
   rem=min(a);na=a.copy();na.remove(rem);gq=f'সর্বনিম্ন মান {rem}-এর একটি পর্যবেক্ষণ বাদ দিলে নতুন গড় ও মধ্যক নির্ণয় কর। পুরোনো গড়ের সঙ্গে তুলনা কর।';gs=f'নতুন N={n-1}, যোগফল={sum(a)}−{rem}={sum(na)}; গড়={num(avg(na))}।'+rawmedian(na)+f'গড়ের পরিবর্তন={num(avg(na)-avg(a))}; কম মানের পর্যবেক্ষণ সরানোয় গড় বেড়েছে।'
  elif v==3:
   val=sorted(c)[-2];new=a+[val]*3;gq=f'একই জরিপে আরও তিনটি পর্যবেক্ষণ পাওয়া গেল, প্রতিটির মান {val}। নতুন গড় এবং মধ্যক নির্ণয় করে পুরোনো গড়ের সঙ্গে তুলনা কর।';gs=f'নতুন যোগফল={sum(a)}+3×{val}={sum(new)}, N={n+3}; নতুন গড়={num(avg(new))}।'+rawmedian(new)+f'গড়ের পরিবর্তন={num(avg(new)-avg(a))}; নতুন মান পুরোনো গড়ের '+('উপরে।' if val>avg(a) else 'নিচে।' if val<avg(a) else 'সমান।')
  elif v==4:
   gq='শুধু পৃথক মানগুলোর গড় করলে আসল গড় পাওয়া যাবে কি? দুই হিসাব করে গণসংখ্যার ভূমিকা ব্যাখ্যা কর।';gs=rawwork(a)+f'গণসংখ্যা উপেক্ষা করে পৃথক মানগুলোর গড়={num(avg(sorted(c)))}। আসল গড়ের সঙ্গে পার্থক্য={num(avg(sorted(c))-avg(a))}। প্রতিটি মান যতবার ঘটেছে ততবারই যোগে অবদান রাখে; তাই পৃথক মানে সমান ওজন দেওয়া সাধারণভাবে ঠিক নয়।'
  else:
   gq='প্রতিটি রেকর্ড দ্বিগুণ করলে গড়, মধ্যক ও প্রচুরক কী হবে? মূল মাপগুলো নির্ণয় করে নতুন মাপ লেখ।';modes=[x for x,f in sorted(c.items()) if f==max(c.values())];gs=rawwork(a)+rawmedian(a)+rawmode(a)+f'দ্বিগুণে যোগফল দ্বিগুণ, N অপরিবর্তিত; নতুন গড়={num(2*avg(a))}। ধনাত্মক গুণকে ক্রম অপরিবর্তিত; নতুন মধ্যক={num(2*med(a))}। প্রতিটি মানের উপস্থিতি অপরিবর্তিত; নতুন প্রচুরক মান(গুলো) '+', '.join(str(2*x) for x in modes)+'।'
  parts=[part(0,kq,ks),part(1,bq,bs),part(2,gq,gs)];extra={'raw':a,'variant':v,'rawMean':str(avg(a)),'rawMedian':str(med(a))}
 elif model['kind']=='combined':
  n1,n2,m1,m2=[model[k] for k in ('n1','n2','m1','m2')];N=n1+n2;total=n1*m1+n2*m2;mean=F(total,N);delta=2+i%5;family='combined-reconstruction'
  stem=f'দুই দলের সদস্যসংখ্যা যথাক্রমে {n1} ও {n2}; একই পরীক্ষায় তাদের গড় নম্বর যথাক্রমে {m1} ও {m2}।'
  p1=part(0,'প্রতিটি দলের মোট নম্বর নির্ণয় কর।',f'প্রথম মোট={n1}×{m1}={n1*m1}; দ্বিতীয় মোট={n2}×{m2}={n2*m2}।')
  p2=part(1,'সম্মিলিত গড় নির্ণয় কর। দুই গড়ের সরল গড় নিলে সঠিক হবে কি? তুলনা করে কারণ লেখ।',f'প্রত্যেক দলের সদস্যসংখ্যা তার গড়ের ওজন। সূত্র: (n₁m₁+n₂m₂)/(n₁+n₂)। সম্মিলিত মোট={total}, সদস্য={N}; গড়={num(mean)}। সরল গড়=({m1}+{m2})/2={num(F(m1+m2,2))}। পার্থক্য={num(mean-F(m1+m2,2))}। দুই দলের সদস্যসংখ্যা সমান নয়; তাই মোট নম্বর ও মোট সদস্যের অনুপাত নিতে হয়।')
  target=mean+delta;newmean=F(target*N-n1*m1,n2);p3=part(2,f'প্রথম দলের ফল অপরিবর্তিত রেখে সম্মিলিত গড় {num(target)} করতে হলে দ্বিতীয় দলের গড় কত হতে হবে? দ্বিতীয় দলের মোট নম্বর কত বাড়াতে হবে?',f'প্রয়োজনীয় সম্মিলিত মোট={num(target)}×{N}={num(target*N)}। দ্বিতীয় দলের মোট={num(target*N)}−{n1*m1}={num(target*N-n1*m1)}। দ্বিতীয় দলের মোটকে সদস্যসংখ্যা {n2} দিয়ে ভাগ করে দ্বিতীয় গড়={num(newmean)}। মোট বৃদ্ধির প্রয়োজন={num(target*N-total)}; যাচাই: ({n1*m1}+{num(newmean*n2)})/{N}={num(target)}।')
  parts=[p1,p2,p3];extra={'combined':model,'mean':str(mean),'newSecondMean':str(newmean),'targetMean':str(target)}
 else:
  assert model['kind']=='weighted';xs=model['values'];fs=model['weights'];N=sum(fs);total=sum(x*f for x,f in zip(xs,fs));mean=F(total,N);family='discrete-frequency-reasoning';stem='একটি রেকর্ডে মান ও তার গণসংখ্যা দেওয়া আছে:'+table(['মান',*xs],[['গণসংখ্যা',*fs]])
  p1=part(0,'মোট পর্যবেক্ষণ এবং সর্বাধিক বার আসা মান নির্ণয় কর।',f'N={N}; সর্বাধিক গণসংখ্যা {max(fs)}, সংশ্লিষ্ট মান {xs[fs.index(max(fs))]}।')
  p2=part(1,'fx-এর কাজের সারণি তৈরি করে গড় নির্ণয় কর। শুধু মান তিনটির গড় নিলে কেন ভুল হবে?',table(['x','f','fx'],[[x,f,x*f] for x,f in zip(xs,fs)])+f'Σfx={total}, Σf={N}; গড়={num(mean)}। পৃথক মানের সরল গড়={num(avg(xs))}; গণসংখ্যা সমান না হওয়ায় তা সব পর্যবেক্ষণের সমান অবদান প্রকাশ করে না।')
  newfs=fs.copy();newfs[0]-=1;newfs[-1]+=1;newtotal=total-xs[0]+xs[-1];p3=part(2,'সর্বনিম্ন মানের একটি পর্যবেক্ষণ আসলে সর্বোচ্চ মানের ছিল। সংশোধিত সারণি, গড় এবং গড়ের পরিবর্তন নির্ণয় কর।',table(['x','সংশোধিত f','সংশোধিত fx'],[[x,f,x*f] for x,f in zip(xs,newfs)])+f'প্রথম গণসংখ্যা এক কমে, শেষ গণসংখ্যা এক বাড়ে। N={N} অপরিবর্তিত; Σfx={total}−{xs[0]}+{xs[-1]}={newtotal}; নতুন গড়={num(F(newtotal,N))}। গড় বাড়ে ({xs[-1]}−{xs[0]})/{N}={num(F(xs[-1]-xs[0],N))}।')
  parts=[p1,p2,p3];extra={'weighted':model,'mean':str(mean),'correctedMean':str(F(newtotal,N))}
 if d:
  aims=['মধ্যক ও বহুভুজ','সংক্ষিপ্ত গড় ও কম-থেকে অজিভ','গড় ও বেশি-থেকে অজিভ','প্রচুরক ও আয়তলেখ','স্থানান্তরিত উপাত্তের কেন্দ্র','দুই দলের গড়ের তুলনা','নিম্নসীমাকে প্রতিনিধি ধরার ভুল','গণসংখ্যা দ্বিগুণের প্রভাব','মধ্যমান ও প্রচুরক তুলনা','ভুল শ্রেণিবিন্যাস সংশোধন','কাঁচা গড়ের সম্ভাব্য সীমা','অজিভ ও সূত্রের মধ্যক']
  stem+=' বিশ্লেষণের বিষয়: '+aims[v]+'।'
 elif model['kind']=='raw':
  stem+=' বিশ্লেষণের বিষয়: '+['সব মানের সমান স্থানান্তর','চরম মানে রেকর্ডের ভুল','একটি পর্যবেক্ষণ বাদ দেওয়া','নতুন পর্যবেক্ষণ যোগ করা','গণসংখ্যা বাদ দেওয়ার ভুল','সব মানের সমানুপাতিক পরিবর্তন'][v]+'।'
 source=None
 if d:
  keyword={'median':'মধ্যক','mode':'প্রচুরক','direct':'গড়','shortcut':'গড়'}[method]
  compatible=[s for s in sources if any(keyword in task for task in s['tasks'])]
  if compatible:source=compatible[(i-1)%len(compatible)]
 q={'type':'CQ','text':stem,'parts':parts,'difficulty':'HARD','page':f'নিজস্ব অভিযোজিত অনুশীলনী; restart-r1 CQ {i}; বোর্ডের অবিকল নয়','explanation':'বিদ্যমান সম্পূর্ণ উপাত্ত দিয়ে নতুন প্রশ্ন ও ধাপভিত্তিক সমাধান। পূর্ণসংখ্যার পরিমাপে অন্তর্ভুক্তিমূলক শ্রেণি; প্রয়োজনে প্রকৃত সীমা ব্যবহার করা হয়েছে। বোর্ড পরিচয় প্রমাণিত নয়।'}
 evidence={'id':f'CQ-{i:03}','family':family,'model':extra,'graphs':graphs,'sourceTaskReference':({'sourceId':source['sourceId'],'tasks':source['tasks'],'relationship':'Broad chapter task-style inspiration only; our tasks/data are not a recovered original table or verbatim board item.'} if source else {'relationship':'New original analysis of existing dataset; no board attribution.'})}
 return q,evidence


def candidates(correct,*wrong):return [(correct,'সঠিক।'),*wrong]

def mcq_plan(f,t,d):
 lo=d['lo'];h=d['h'];fs=d['f'];N=d['N'];mid=d['mids'];j=d['medianIndex'];a=lo+2+t;v=2+t;raw=[a,a+2,a+4,a+6,a+8];s=sum(raw);Fprev=d['cf'][j-1] if j else 0
 if f==0:return f'{lo}–{lo+h-1} শ্রেণির মধ্যমান কত?',candidates(mid[0],(lo,'নিম্নসীমা নেওয়া হয়েছে।'),(lo+h-1,'উচ্চসীমা নেওয়া হয়েছে।'),(F(2*lo+h-1),'দুই সীমার যোগফলকে 2 দিয়ে ভাগ করা হয়নি।')),f'মধ্যমান=({lo}+{lo+h-1})/2={num(mid[0])}।'
 if f==1:return f'নিকটতম পূর্ণসংখ্যায় রেকর্ড করা পরিমাপের {lo}–{lo+h-1} শ্রেণির প্রকৃত নিম্নসীমা কত?',candidates(F(2*lo-1,2),(lo,'আপাত নিম্নসীমা নেওয়া হয়েছে।'),(F(2*lo+1,2),'অর্ধেক একক যোগ করা হয়েছে।'),(F(2*(lo+h)-1,2),'প্রকৃত উচ্চসীমা নেওয়া হয়েছে।')),f'পাশের পূর্ণসংখ্যার মাঝের সীমা {lo}−0.5={num(F(2*lo-1,2))}।'
 if f==2:return f'নিকটতম পূর্ণসংখ্যায় রেকর্ড করা পরিমাপের {lo}–{lo+h-1} শ্রেণির প্রকৃত উচ্চসীমা কত?',candidates(d['bounds'][1],(lo+h-1,'আপাত উচ্চসীমা নেওয়া হয়েছে।'),(F(2*(lo+h)-3,2),'0.5 বিয়োগ করা হয়েছে।'),(d['bounds'][0],'প্রকৃত নিম্নসীমা নেওয়া হয়েছে।')),f'প্রকৃত উচ্চসীমা={lo+h-1}+0.5={num(d["bounds"][1])}।'
 if f==3:return f'পরপর দুটি অন্তর্ভুক্তিমূলক শ্রেণি {lo}–{lo+h-1} ও {lo+h}–{lo+2*h-1}। শ্রেণিব্যাপ্তি কত?',candidates(h,(h-1,'আপাত সীমার পার্থক্য নেওয়া হয়েছে।'),(h+1,'ব্যাপ্তিতে অতিরিক্ত এক যোগ হয়েছে।'),(2*h,'দুই শ্রেণির ব্যাপ্তি যোগ হয়েছে।')),f'পরপর নিম্নসীমার পার্থক্য=({lo+h})−{lo}={h}।'
 if f==4:return 'সারণিতে মোট পর্যবেক্ষণ কত?'+table(['শ্রেণি',1,2,3],[['f',fs[0],fs[1],fs[2]]]),candidates(sum(fs[:3]),(3,'শ্রেণির সংখ্যা নেওয়া হয়েছে।'),(max(fs[:3]),'সর্বাধিক f নেওয়া হয়েছে।'),(fs[0]+fs[1],'শেষ শ্রেণি বাদ গেছে।')),f'মোট f={fs[0]}+{fs[1]}+{fs[2]}={sum(fs[:3])}।'
 if f==5:return f'চার শ্রেণির গণসংখ্যা {fs[0]}, {fs[1]}, {fs[2]}, {fs[3]}। তৃতীয় শ্রেণির আগের সঞ্চিত গণসংখ্যা কত?',candidates(fs[0]+fs[1],(fs[2],'তৃতীয় f নেওয়া হয়েছে।'),(sum(fs[:3]),'তৃতীয় পর্যন্ত cf নেওয়া হয়েছে।'),(sum(fs[:4]),'মোট f নেওয়া হয়েছে।')),f'আগের দুই শ্রেণির যোগ={fs[0]}+{fs[1]}={fs[0]+fs[1]}।'
 if f==6:return f'পরপর দুই শ্রেণির কম-থেকে সঞ্চিত গণসংখ্যা {N-fs[-1]} ও {N}। পরের শ্রেণির পৃথক গণসংখ্যা কত?',candidates(fs[-1],(N,'শেষ সঞ্চিত মানকে f ধরা হয়েছে।'),(2*N-fs[-1],'বিয়োগের বদলে যোগ হয়েছে।'),(N-fs[-1],'আগের সঞ্চিত মান নেওয়া হয়েছে।')),f'f={N}−{N-fs[-1]}={fs[-1]}।'
 if f in (7,8):
  target=d['medianIndex'] if f==7 else d['modalIndex'];which='মধ্যক' if f==7 else 'প্রচুরক';options=candidates(labels(d)[target],*[(labels(d)[z],'অবস্থান/সর্বাধিক গণসংখ্যা ভুল চিহ্নিত হয়েছে।') for z in range(len(fs)) if z!=target][:3]);return f'সারণির {which} শ্রেণি কোনটি?'+grid(d),options,(f'N/2={num(F(N,2))}; cf='+','.join(map(str,d['cf']))+f'; তাই {labels(d)[target]}।' if f==7 else f'সর্বাধিক f={fs[target]}; শ্রেণি {labels(d)[target]}।')
 if f==9:return f'{labels(d)[1]} শ্রেণির গণসংখ্যা {fs[1]}। গণসংখ্যা বহুভুজে সংশ্লিষ্ট বিন্দু কোনটি?',candidates(f'({num(mid[1])}, {fs[1]})',(f'({d["starts"][1]}, {fs[1]})','মধ্যমানের বদলে নিম্নসীমা।'),(f'({num(d["bounds"][2])}, {fs[1]})','উচ্চ প্রকৃত সীমা নেওয়া হয়েছে।'),(f'({fs[1]}, {num(mid[1])})','অক্ষ উল্টেছে।')),f'বিন্দু=(শ্রেণিমধ্যমান,f)=({num(mid[1])},{fs[1]})।'
 if f==10:return f'কম-থেকে অজিভে প্রকৃত উচ্চসীমা {num(d["bounds"][2])} পর্যন্ত গণসংখ্যা {fs[0]}+{fs[1]}। বিন্দুটির y-স্থানাঙ্ক কত?',candidates(sum(fs[:2]),(fs[1],'শুধু দ্বিতীয় f।'),(fs[0],'শুধু প্রথম f।'),(N,'মোট f নেওয়া হয়েছে।')),f'y={fs[0]}+{fs[1]}={sum(fs[:2])}।'
 if f==11:return f'মোট {N} পর্যবেক্ষণের প্রথম শ্রেণিতে {fs[0]}টি। দ্বিতীয় শ্রেণির প্রকৃত নিম্নসীমায় বেশি-থেকে অজিভের y-স্থানাঙ্ক কত?',candidates(N-fs[0],(N,'প্রথম শ্রেণি বাদ যায়নি।'),(fs[0],'বাদ পড়া সংখ্যাই নেওয়া হয়েছে।'),(N+fs[0],'বিয়োগের বদলে যোগ।')),f'বেশি-থেকে সঞ্চিত মান={N}−{fs[0]}={N-fs[0]}।'
 if f==12:return f'মোট {N} পর্যবেক্ষণের মধ্যে কোনো শ্রেণির গণসংখ্যা {fs[1]}। তার আপেক্ষিক গণসংখ্যা কত?',candidates(F(fs[1],N),(F(N,fs[1]),'অনুপাত উল্টেছে।'),(fs[1],'মোট দিয়ে ভাগ হয়নি।'),(F(N-fs[1],N),'পরিপূরক অনুপাত নেওয়া হয়েছে।')),f'আপেক্ষিক f=f/N={fs[1]}/{N}={num(F(fs[1],N))}।'
 if f==13:return f'একটি শ্রেণির মধ্যমান x={num(mid[1])}, গণসংখ্যা f={fs[1]}। fx কত?',candidates(mid[1]*fs[1],(mid[1]+fs[1],'গুণের বদলে যোগ।'),(mid[1]/fs[1],'গুণের বদলে ভাগ।'),(mid[1],'গণসংখ্যা উপেক্ষিত।')),f'fx={num(mid[1])}×{fs[1]}={num(mid[1]*fs[1])}।'
 if f==14:return f'A={num(mid[2])}, x={num(mid[3])}, h={h} হলে u=(x−A)/h কত?',candidates(1,(h,'h দিয়ে ভাগ হয়নি।'),(-1,'বিয়োগের ক্রম উল্টেছে।'),(0,'x ও A সমান ধরা হয়েছে।')),f'u=({num(mid[3])}−{num(mid[2])})/{h}=1।'
 if f==15:return f'কোনো শ্রেণির f={v+2}, u=−{v} হলে fu কত?',candidates(-v*(v+2),(v*(v+2),'ঋণাত্মক চিহ্ন বাদ গেছে।'),(2,'গুণের বদলে যোগ।'),(-v,'f উপেক্ষা করা হয়েছে।')),f'fu=({v+2})×(−{v})={-v*(v+2)}।'
 if f==16:
  A=20+t;H=5;U=2*(t+1);nn=10;res=F(A)+F(H*U,nn);return f'A={A}, h={H}, Σfu={U}, Σf={nn} হলে সংক্ষিপ্ত পদ্ধতিতে গড় কত?',candidates(res,(F(A)+F(U,nn),'h বাদ গেছে।'),(F(H*U,nn),'A যোগ হয়নি।'),(A+H*U,'Σf দিয়ে ভাগ হয়নি।')),f'গড়=A+hΣfu/Σf={A}+5×{U}/10={num(res)}।'
 if f==17:
  L=F(2*lo-1,2);before=4+t;fm=12+2*t;nn=2*(before+fm//2);res=L+F(h,2);return f'মধ্যকের সূত্রে L={num(L)}, N={nn}, F={before}, f={fm}, h={h}। আনুমানিক মধ্যক কত?',candidates(res,(L,'সংশোধনী অংশ বাদ গেছে।'),(L+h,'মধ্যককে শ্রেণির শেষে বসানো হয়েছে।'),(res+F(1,2),'প্রকৃত নিম্নসীমার বদলে আপাত নিম্নসীমা নেওয়া হয়েছে।')),f'M=L+((N/2−F)/f)h={num(L)}+(({nn}/2−{before})/{fm})×{h}={num(res)}।'
 if f in (18,19):
  fm=20+2*t;prev=7+t;nxt=9+t;result=fm-(prev if f==18 else nxt);wrong=fm-(nxt if f==18 else prev);index='₁' if f==18 else '₂';return f'প্রচুরক শ্রেণির গণসংখ্যা {fm}; আগের ও পরের শ্রেণির গণসংখ্যা {prev}, {nxt}। প্রচুরকের সূত্রে d{index} কত?',candidates(result,(wrong,'অন্য পাশের গণসংখ্যা বিয়োগ হয়েছে।'),(fm,'প্রচুরক শ্রেণির f-ই নেওয়া হয়েছে।'),(fm+(prev if f==18 else nxt),'বিয়োগের বদলে যোগ।')),f'd{index}={fm}−{prev if f==18 else nxt}={result}।'
 if f==20:return ', '.join(map(str,raw))+' উপাত্তের গড় কত?',candidates(avg(raw),(s,'যোগফলকে ভাগ করা হয়নি।'),(F(s,4),'পদসংখ্যা ভুল নেওয়া হয়েছে।'),(min(raw),'সর্বনিম্ন মান নেওয়া হয়েছে।')),f'যোগফল {s}; পাঁচ দিয়ে ভাগ করলে গড়={num(avg(raw))}।'
 if f==21:
  vals=[a+9,a,a+2,a+4,a+6,a+11];ans=med(vals);return ', '.join(map(str,vals))+' উপাত্তের মধ্যক কত?',candidates(ans,(a+4,'তৃতীয় পদটিই নেওয়া হয়েছে।'),(a+6,'চতুর্থ পদটিই নেওয়া হয়েছে।'),(2*a+10,'মাঝের দুই পদের যোগকে 2 দিয়ে ভাগ করা হয়নি।')),rawmedian(vals)
 if f==22:
  vals=[a,a+2,a+2,a+4,a+2,a+6];return ', '.join(map(str,vals))+' উপাত্তের প্রচুরক কত?',candidates(a+2,(3,'সর্বাধিক f-কে প্রচুরক বলা হয়েছে।'),(a+6,'সর্বোচ্চ মান নেওয়া হয়েছে।'),(6,'মোট পর্যবেক্ষণ নেওয়া হয়েছে।')),f'{a+2} তিনবার, অন্য মান একবার করে; প্রচুরক {a+2}।'
 if f==23:
  vals=[a+2,a+5,a,a+9];return ', '.join(map(str,vals))+' উপাত্তের পরিসর কত?',candidates(9,(a+9,'সর্বোচ্চ মান নেওয়া হয়েছে।'),(2*a+9,'পার্থক্যের বদলে যোগ।'),(4,'পদসংখ্যা নেওয়া হয়েছে।')),f'পরিসর=({a+9})−{a}=9।'
 if f==24:
  n1=10;n2=20;m1=20+t;m2=32+t;res=F(n1*m1+n2*m2,n1+n2);return f'{n1} জনের গড় {m1} এবং {n2} জনের গড় {m2}। সম্মিলিত গড় কত?',candidates(res,(F(m1+m2,2),'অসমান সদস্যের দুই গড়ের সরল গড়।'),(m1+m2,'গড় দুটি শুধু যোগ।'),(F(n1*m2+n2*m1,n1+n2),'ওজন উল্টেছে।')),f'গড়=({n1}×{m1}+{n2}×{m2})/{n1+n2}={num(res)}।'
 if f==25:
  m=15+t;delta=2+t;return f'একটি উপাত্তের গড় {m}। প্রতিটি মানকে দ্বিগুণ করে {delta} যোগ করলে নতুন গড় কত?',candidates(2*m+delta,(2*(m+delta),'যোগের পর গুণ করা হয়েছে।'),(m+delta,'দ্বিগুণ হয়নি।'),(2*m,'যোগ হয়নি।')),f'নতুন গড়=2×{m}+{delta}={2*m+delta}।'
 if f==26:
  n=30+t;f1=4+t;f2=7+t;ans=n-f1-f2;return f'তিন শ্রেণির গণসংখ্যা {f1}, x, {f2}; মোট {n}। x কত?',candidates(ans,(n,'মোট f নেওয়া হয়েছে।'),(f1+f2,'অন্য দুই f-এর যোগ।'),(n-f1,'তৃতীয় শ্রেণি বাদ যায়নি।')),f'x={n}−({f1}+{f2})={ans}।'
 if f==27:
  xs=[4+t,6+t,8+t];fs=[1,2,1];return 'নিবেশনের গড় কত?'+table(['x',*xs],[['f',*fs]]),candidates(F(xs[0]+2*xs[1]+xs[2],4),(sum(xs),'মানগুলো শুধু যোগ।'),(F(xs[0]+2*xs[1]+xs[2],3),'পৃথক মানের সংখ্যা দিয়ে ভাগ।'),(F(sum(xs),4),'মাঝের মানের গণসংখ্যা উপেক্ষা।')),f'Σfx={xs[0]+2*xs[1]+xs[2]}, Σf=4; গড়={xs[1]}।'
 n=5+t;mean=20+t;bad=45+t;good=35+t;ans=F(n*mean-bad+good,n);return f'{n}টি মানের গড় {mean}; একটি মান {good}-এর বদলে {bad} পড়া হয়েছে। সংশোধিত গড় কত?',candidates(ans,(F(mean)+F(bad-good,n),'সংশোধনের দিক উল্টেছে।'),(mean-bad+good,'মোটের পরিবর্তন গড়ে সরাসরি প্রয়োগ।'),(mean,'ভুল সংশোধন হয়নি।')),f'সংশোধিত মোট={n}×{mean}−{bad}+{good}; গড়={num(ans)}।'


def make_mcq(i,f,t,d):
 text,opts,sol=mcq_plan(f,t,d);values=[];reasons=[]
 for value,reason in opts:
  s=num(value) if isinstance(value,(int,F)) else str(value);values.append(s);reasons.append(reason)
 if len(set(values))!=4:raise ValueError(('Option collision',i,f,t,values))
 # Rotate correct position deterministically, not the same key throughout.
 k=(i-1)%4;values=values[-k:]+values[:-k] if k else values;reasons=reasons[-k:]+reasons[:-k] if k else reasons
 q={'type':'MCQ','text':text,'options':dict(zip('ABCD',values)),'correct':'ABCD'[k],'explanation':sol,'difficulty':'EASY' if f in (0,1,2,3,4,6,9,10,11,14,15,18,19,22,23,26) else 'MEDIUM','page':f'নিজস্ব সংশোধিত অনুশীলনী; restart-r1 MCQ {i}; বোর্ড নয়'}
 e={'id':f'MCQ-{i:03}','family':f'mcq-skill-{f:02}','variant':t,'grouped':b.serial(d),'optionReasons':dict(zip('ABCD',reasons)),'expectedAnswer':values[k],'estimatedSeconds':45 if q['difficulty']=='EASY' else 75,'timingMeasured':False,'planIndex':f}
 return q,e


def make_sq(i,f,t,d):
 lo=d['lo'];h=d['h'];N=d['N'];fs=d['f'];A=15+t*4;delta=3+t;a=lo+t;raw=[a+6,a,a+2,a+8,a+4]
 plans=[
 (f'{lo}–{lo+h-1} অন্তর্ভুক্তিমূলক শ্রেণির মধ্যমান নির্ণয় কর।',f'মধ্যমান=({lo}+{lo+h-1})/2={num(d["mids"][0])}।'),
 (f'পূর্ণসংখ্যায় রেকর্ড করা {lo}–{lo+h-1} শ্রেণির প্রকৃত দুই সীমা নির্ণয় কর।',f'নিম্নসীমা {num(d["bounds"][0])}; উচ্চসীমা {num(d["bounds"][1])}।'),
 (f'দুটি পরপর অন্তর্ভুক্তিমূলক শ্রেণির নিম্নসীমা {lo} ও {lo+h}। শ্রেণিব্যাপ্তি নির্ণয় কর।',f'ব্যাপ্তি={lo+h}−{lo}={h}।'),
 (f'ক্রমযোজিত গণসংখ্যা {fs[0]}, {fs[0]+fs[1]}, {sum(fs[:3])}। দ্বিতীয় শ্রেণির পৃথক গণসংখ্যা নির্ণয় কর।',f'f={fs[0]+fs[1]}−{fs[0]}={fs[1]}।'),
 (f'তিন শ্রেণির গণসংখ্যা {fs[0]}, x, {fs[2]} এবং মোট {sum(fs[:3])}। x নির্ণয় কর।',f'x={sum(fs[:3])}−({fs[0]}+{fs[2]})={fs[1]}।'),
 (f'{2*a+1}টি মান ঊর্ধ্বক্রমে সাজালে মধ্যক কততম পদ? সংখ্যামানও কি জানা যায়?',f'অবস্থান=({2*a+1}+1)/2={a+1}তম। ওই পদের মান না জানলে মধ্যকের সংখ্যামান জানা যায় না।'),
 (', '.join(map(str,raw))+' উপাত্তের মধ্যক নির্ণয় কর।',rawmedian(raw)),
 (f'{a}, {a+2}, {a+4}, {a+6} উপাত্তের গড় নির্ণয় কর।',f'মোট={4*a+12}; গড়=({4*a+12})/4={a+3}।'),
 (f'{a}, {a+2}, {a+2}, {a+4}, {a+2} উপাত্তের প্রচুরক নির্ণয় কর।',f'{a+2} তিনবার আসে; বাকি মান একবার। তাই প্রচুরক {a+2}।'),
 (f'{a}, {a+5}, {a+9}, {a+2} উপাত্তের পরিসর নির্ণয় কর।',f'সর্বোচ্চ {a+9}, সর্বনিম্ন {a}; পরিসর={a+9}−{a}=9।'),
 (f'{N}টি পর্যবেক্ষণের একটি শ্রেণিতে {fs[0]}টি আছে। আপেক্ষিক গণসংখ্যা লেখ।',f'আপেক্ষিক গণসংখ্যা=f/N={fs[0]}/{N}={num(F(fs[0],N))}।'),
 (f'A={A}, x={A+2*h}, h={h} হলে u নির্ণয় কর।',f'u=(x−A)/h=({A+2*h}−{A})/{h}=2।'),
 (f'f={a}, u=−2 হলে fu নির্ণয় কর।',f'fu={a}×(−2)={-2*a}।'),
 (f'A={A}, h={h}, Σfu=0, Σf={N} হলে গড় কত? কারণ লেখ।',f'গড়=A+hΣfu/Σf={A}+{h}×0/{N}={A}। সংশোধনী শূন্য।'),
 (f'গড় {A}। প্রতিটি মানে {delta} যোগ করলে নতুন গড় কত এবং কেন?',f'মোট বৃদ্ধি N×{delta}; গড় বৃদ্ধি {delta}। নতুন গড়={A+delta}।'),
 (f'গড় {A}। প্রতিটি মানকে {delta} দিয়ে গুণ করলে নতুন গড় কত?',f'যোগফল {delta} গুণ, পদসংখ্যা অপরিবর্তিত; নতুন গড়={delta}×{A}={A*delta}।'),
 (f'প্রচুরক শ্রেণির f={20+t}; আগের f={8+t}; পরের f={9+t}। d₁ ও d₂ নির্ণয় কর।',f'd₁={20+t}−{8+t}=12; d₂={20+t}−{9+t}=11।'),
 (f'{labels(d)[0]} শ্রেণির গণসংখ্যা {fs[0]}। গণসংখ্যা বহুভুজের সংশ্লিষ্ট বিন্দু লেখ।',f'মধ্যমান={num(d["mids"][0])}; বিন্দু ({num(d["mids"][0])},{fs[0]})।'),
 (f'বহুভুজের প্রথম মধ্যমান {num(d["mids"][0])}, শ্রেণিব্যাপ্তি {h}। বাঁয়ে বহুভুজ বন্ধের বিন্দু লেখ।',f'এক শ্রেণিব্যাপ্তি বাঁয়ে, শূন্য গণসংখ্যা; ({num(d["mids"][0]-h)},0)।'),
 (f'মোট {N}। প্রথম শ্রেণির প্রকৃত নিম্নসীমা {num(d["bounds"][0])}। বেশি-থেকে অজিভের প্রথম বিন্দু লেখ।',f'প্রথম সীমায় সব পর্যবেক্ষণ থাকে। বিন্দু ({num(d["bounds"][0])},{N})।'),
 (f'শেষ শ্রেণির প্রকৃত উচ্চসীমা {num(d["bounds"][-1])}, মোট {N}। কম-থেকে অজিভের শেষ বিন্দু লেখ।',f'শেষ সীমার মধ্যে সব {N}টি; বিন্দু ({num(d["bounds"][-1])},{N})।'),
 (f'মোট {N}। প্রথম দুই শ্রেণিতে {fs[0]}, {fs[1]}টি। তৃতীয় শ্রেণির নিম্নসীমায় বেশি-থেকে সঞ্চিত গণসংখ্যা কত?',f'{N}−({fs[0]}+{fs[1]})={N-fs[0]-fs[1]}।'),
 (f'প্রকৃত উচ্চসীমা {num(d["bounds"][1])} ও {num(d["bounds"][2])}-এ কম-থেকে সঞ্চিত মান {fs[0]} ও {fs[0]+fs[1]}। মধ্যবর্তী শ্রেণির f নির্ণয় কর।',f'f={fs[0]+fs[1]}−{fs[0]}={fs[1]}।'),
 (f'এক শ্রেণির f={fs[1]}, মধ্যমান={num(d["mids"][1])}। fx নির্ণয় কর।',f'fx={fs[1]}×{num(d["mids"][1])}={num(fs[1]*d["mids"][1])}।'),
 (f'Σfx={A*N}, Σf={N} হলে গড় নির্ণয় কর।',f'গড়=Σfx/Σf={A*N}/{N}={A}।'),
 (f'{a}টি মানের গড় {A}; যোগফল কত?',f'যোগফল=পদসংখ্যা×গড়={a}×{A}={a*A}।'),
 (f'দুই সমান আকারের দলের গড় {A} ও {A+delta*2}। সম্মিলিত গড় নির্ণয় কর।',f'সদস্যসংখ্যা সমান বলে দুই গড়ের সরল গড়=({A}+{A+delta*2})/2={A+delta}।'),
 (f'শ্রেণির মধ্যমান {A}, আপাত উচ্চসীমা {A+delta}। আপাত নিম্নসীমা নির্ণয় কর।',f'{A}=(L+{A+delta})/2; L={2*A}−{A+delta}={A-delta}।'),
 (f'{a}, {a+2}, {a+4}, {a+6} উপাত্তে সর্বোচ্চ মানের সঙ্গে 10 যোগ করলে পরিসর কত হবে?',f'নতুন সর্বোচ্চ={a+16}, সর্বনিম্ন={a}; পরিসর=16।'),
 (f'{a} জনের গড় {A}। একজনের মানে {a*2} একক ভুল বেশি ছিল। সংশোধিত গড় নির্ণয় কর।',f'মোট কমে {a*2}; গড় কমে {a*2}/{a}=2। সংশোধিত গড়={A-2}।')]
 text,sol=plans[f];q={'type':'SQ','text':text,'explanation':sol,'difficulty':'EASY','page':f'নিজস্ব সংক্ষিপ্ত অনুশীলনী; restart-r1 SQ {i}; বোর্ড নয়'}
 return q,{'id':f'SQ-{i:03}','family':f'sq-skill-{f:02}','variant':t,'intendedMarks':2,'maxArithmeticSteps':3,'grouped':b.serial(d),'planIndex':f}


def main():
 intake=jread(b.OUT/'source-intake.json');b.require_backup(jread(b.OUT/'input-backup-receipt.json'),intake)
 receipt=jread(b.OUT/'batch01-backup-receipt.json');assert receipt['driveVerified'] and receipt['independentDriveMetadataRead']
 originals={}
 for f in jread(BASE/'targets-v1-manifest.json')['files']:
  data=(BASE/f['file']).read_bytes();assert b.sha(data)==f['sha256'];originals[f['file']]=json.loads(data)
 reviews=jread(BASE/'target-v1/validation.json')['itemReviews'];by={(r['file'],r['itemInFile']):r for r in reviews}
 bank={k:copy.deepcopy(jread(b.OUT/f'batch01-{k.lower()}.json')['items']) for k in ('MCQ','CQ','SQ')};evidence=copy.deepcopy(jread(b.OUT/'batch01-checks.json'))
 # Preserve archived batch01; augment only the full600 copies with real drawn graphs.
 for e in evidence:
  if e['id'].startswith('CQ-') and e.get('graphPoints'):
   i=int(e['id'].split('-')[1]);m=e['model'];d=group(m['lo'],m['h'],m['f']);q=bank['CQ'][i-1];_,g=svg_graph(d,e['graphKind'],f'cq-{i:03}');url='https://proshnobook.com/'+g['file'].removeprefix('public/');q['parts'][2]['solution']+=f'\n\n![{e["graphKind"]} লেখচিত্র]({url})\n';e['graphs']=[g]
 datasets=[r for r in reviews if r['file'].startswith('target-v1/cq-') and 'grouped' in r.get('model',{})];ds=[group(r['model']['grouped']['lo'],r['model']['grouped']['h'],r['model']['grouped']['f']) for r in datasets]
 raw_seen=Counter()
 used_stems={re.sub(r'\s+',' ',q['text']).strip() for qs in bank.values() for q in qs}
 # One-to-one slot accounting: no old item payload reused as a final question.
 for kind,total in [('MCQ',300),('CQ',200),('SQ',100)]:
  for i in range(11,total+1):
   if kind=='CQ':file=f'target-v1/cq-{1 if i<=150 else 2}.json';slot=(i-1)%150+1;r=by[file,slot];rawkey=tuple(r.get('model',{}).get('raw',[]));rv=raw_seen[rawkey]%6;raw_seen[rawkey]+=1;q,e=make_cq(i,r,originals,intake['records'],rv)
   elif kind=='MCQ':
    file=f'target-v1/mcq-{1 if i<=150 else 2}.json';slot=(i-1)%150+1;f=(i-11)%29;t=(i-11)//29
    for attempt in range(200):
     d=ds[(i*7+t+attempt)%len(ds)]
     q,e=make_mcq(i,f,t,d)
     if re.sub(r'\s+',' ',q['text']).strip() not in used_stems:break
    else:raise ValueError(('No distinct MCQ candidate',i,f))
   else:
    file='target-v1/sq.json';slot=i;f=(i-11)%30;t=(i-11)//30
    for attempt in range(200):
     d=ds[(i*11+t+attempt)%len(ds)];q,e=make_sq(i,f,t,d)
     if re.sub(r'\s+',' ',q['text']).strip() not in used_stems:break
    else:raise ValueError(('No distinct SQ candidate',i,f))
   if kind in ('MCQ','SQ'):
    source_row=datasets[ds.index(d)];e['datasetOrigin']={'file':source_row['file'],'item':source_row['itemInFile'],'relationship':'Numeric inputs drawn from this complete dataset; short arithmetic exercises may add explicitly authored operands.'}
   used_stems.add(re.sub(r'\s+',' ',q['text']).strip())
   old=originals[file]['items'][slot-1];e['oldSlot']={'file':file,'item':slot,'digest':b.canonical(old)};e['dataPolicy']='Existing complete datasets or clearly new original numeric exercises, never recovered missing original board tables.';bank[kind].append(q);evidence.append(e)
 # Normalized stem uniqueness is checked in the real JS importer too.
 seen={}
 for kind,items in bank.items():
  for i,q in enumerate(items,1):
   key=re.sub(r'\s+',' ',q['text']).strip()
   if key in seen:raise ValueError(('Duplicate stem',kind,i,seen[key]))
   seen[key]=(kind,i)
 emap={e['id']:e for e in evidence};families=Counter();assets={}
 for kind,items in bank.items():
  for i,q in enumerate(items,1):
   e=emap[f'{kind}-{i:03}'];e['newDigest']=b.canonical(q);e['approved']=False;families[kind+'/'+e.get('family','batch01-authored')]+=1
   for g in e.get('graphs',[]):assets[g['file']]=g
 scope={k:originals['target-v1/cq-1.json'][k] for k in ('category','subject','topic','lang','sourceUrl')};files=[]
 for name,kind,items in [('mcq-1','MCQ',bank['MCQ'][:150]),('mcq-2','MCQ',bank['MCQ'][150:]),('cq-1','CQ',bank['CQ'][:100]),('cq-2','CQ',bank['CQ'][100:]),('sq','SQ',bank['SQ'])]:
  path=OUT/(name+'.json');b.dump(path,{**scope,'book':'Proshnobook — পুনর্গঠিত পরিসংখ্যান','edition':'restart-r1 full600; corrected candidate; not live approved','items':items});files.append({'file':str(path.relative_to(ROOT)),'count':len(items),'kind':kind,'sha256':b.sha(path.read_bytes())})
 b.dump(OUT/'checks.json',evidence)
 b.dump(OUT/'manifest.json',{'status':'RECONSTRUCTED_600_VALIDATION_AND_REMOTE_CHECKPOINT_REQUIRED','target':{'MCQ':300,'CQ':200,'SQ':100},'reconstructed':{k:len(v) for k,v in bank.items()},'totalReconstructed':600,'remaining':0,'approved':0,'published':0,'teacherCertified':False,'assetsDeployed':False,'files':files,'graphCount':len(assets),'graphs':list(assets.values()),'families':dict(sorted(families.items())),'limitations':['Practice variants share skill templates; 600 distinct stems are not 600 distinct mathematical concepts.','All board labels in math.txt remain unauthenticated. Missing original tables have not been recovered.','Timing values are author estimates, not timed pupil trials.','Automated verification is not independent teacher certification.','No live approval/publication is performed by this generator.']})
 cards=[]
 for kind,items in bank.items():
  for i,q in enumerate(items,1):
   body=b.render(q['text'])
   if kind=='CQ':
    for p in q['parts']:
     sol=p['solution'];sol=re.sub(r'!\[([^\]]*)\]\((https://proshnobook.com/[^)]+)\)',lambda m:'',sol)
     body+=f'<h3>{p["label"]} — {p["marks"]} নম্বর</h3>'+b.render(p['question'])+'<details open><summary>সমাধান</summary>'+b.render(sol)
     for url in re.findall(r'!\[[^\]]*\]\((https://proshnobook.com/[^)]+)\)',p['solution']):body+=(ROOT/'public'/url.split('.com/')[1]).read_text()
     body+='</details>'
   else:
    if kind=='MCQ':body+=b.render('\n'.join(k+'. '+v for k,v in q['options'].items()))
    body+='<details open><summary>সমাধান</summary>'+b.render(('উত্তর '+q['correct']+'। ' if kind=='MCQ' else '')+q['explanation'])+'</details>'
   cards.append(f'<article data-kind="{kind}" id="{kind}-{i:03}"><h2>{kind} {i}</h2>'+body+'<footer>'+html.escape(q['page'])+'</footer></article>')
 DOC.write_text('<!doctype html><html lang="bn"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>পরিসংখ্যান — পুনর্গঠিত ৬০০</title><style>body{font:16px/1.8 system-ui,sans-serif;max-width:1000px;margin:auto;padding:16px;background:#edf4f2;color:#193c36}header,article{background:white;padding:24px;border:1px solid #bad3cc;border-radius:12px;margin:20px 0}h1,h2,h3{color:#146b5c}.scroll{overflow:auto}table{border-collapse:collapse;width:100%;white-space:nowrap}th,td{border:1px solid #a2bbb5;padding:6px 10px}p{white-space:pre-wrap}svg{max-width:100%;height:auto}footer{font-size:.85em;color:#526b66}summary{cursor:pointer}button{padding:10px;margin:4px}@media print{body{background:white}article{break-before:page}nav{display:none}details{display:block}}</style><header><h1>পরিসংখ্যান — পুনর্গঠিত ৬০০ প্রশ্ন</h1><p>৩০০ MCQ + ২০০ CQ + ১০০ SQ। সবগুলোর সমাধানসহ নতুন সংশোধিত প্রার্থী। বোর্ডের অবিকল/প্রমাণিত প্রশ্ন নয়। একই দক্ষতার অনুশীলনী ভ্যারিয়েন্ট আছে। স্বাধীন শিক্ষক প্রত্যয়ন নয়। Approved/প্রকাশিত: ০; লাইভ রিলিজ আলাদা যাচাইসাপেক্ষ।</p><nav>'+''.join(f'<button onclick="filter(\'{k}\')">{label}</button>' for k,label in [('ALL','সব'),('MCQ','MCQ'),('CQ','CQ'),('SQ','SQ')])+'</nav></header>'+''.join(cards)+"<script>function filter(k){document.querySelectorAll('article').forEach(e=>e.hidden=k!=='ALL'&&e.dataset.kind!==k)}</script></html>")
 print(json.dumps({'counts':{k:len(v) for k,v in bank.items()},'remaining':0,'graphs':len(assets),'families':len(families),'status':'CANDIDATE_NOT_LIVE_APPROVED'}))
if __name__=='__main__':main()
