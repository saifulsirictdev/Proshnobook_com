#!/usr/bin/env python3
"""Backup-first SSC statistics restart, first hand-selected batch only.
No network, DB, live import, approval, publication or old payload writes.
"""
from fractions import Fraction as F
import hashlib
import html
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'content/question-bank/ssc/math/chapter-17'
OUT=BASE/'restart-r1'
DOC=ROOT/'docs/question-bank/ssc-statistics-restart-r1-batch01.html'


def sha(data):return hashlib.sha256(data).hexdigest()
def canonical(q):return sha(json.dumps(q,ensure_ascii=False,sort_keys=True).encode())
def dump(path,data):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
def num(x):
    x=F(x)
    return str(x.numerator) if x.denominator==1 else str(float(x)) if x.denominator in (2,4,5,10) else str(x)
def table(head,rows):
    return '\n\n'+'\n'.join('| '+' | '.join(map(str,row))+' |' for row in [head,['---']*len(head),*rows])+'\n\n'
def serial(v):
    if isinstance(v,F):return str(v)
    if isinstance(v,dict):return {k:serial(x) for k,x in v.items()}
    if isinstance(v,(list,tuple)):return [serial(x) for x in v]
    return v


def require_backup(receipt,intake):
    if not (receipt.get('driveVerified') and receipt.get('independentDriveMetadataRead') and receipt.get('localArchiveVerified')):
        raise ValueError('Verified input backup required before reconstruction')
    remote=receipt.get('drive',{})
    if remote.get('bytes')!=receipt['bytes'] or remote.get('md5')!=receipt['md5']:
        raise ValueError('Backup metadata mismatch')
    if intake['sourceSha256']!=receipt['sourceSha256']:
        raise ValueError('Source digest differs from backed-up input')


def group(lo,h,fs):
    starts=[lo+i*h for i in range(len(fs))]; mids=[F(2*x+h-1,2) for x in starts]
    bounds=[F(2*lo-1,2)+i*h for i in range(len(fs)+1)]; cf=[sum(fs[:i+1]) for i in range(len(fs))];N=sum(fs)
    j=next(i for i,c in enumerate(cf) if 2*c>=N)
    median=bounds[j]+(F(N,2)-(cf[j-1] if j else 0))*h/fs[j]
    modal=fs.index(max(fs)); prev=fs[modal-1] if modal else 0; nxt=fs[modal+1] if modal+1<len(fs) else 0
    d1=fs[modal]-prev;d2=fs[modal]-nxt
    mode=bounds[modal]+F(d1,d1+d2)*h if fs.count(max(fs))==1 else None
    return dict(lo=lo,h=h,f=fs,N=N,starts=starts,mids=mids,bounds=bounds,cf=cf,medianIndex=j,modalIndex=modal,mean=sum(x*f for x,f in zip(mids,fs))/N,median=median,mode=mode)

def labels(d):return [f'{a}–{a+d["h"]-1}' for a in d['starts']]
def work(d,method):
    if method=='median':
        j=d['medianIndex'];prev=d['cf'][j-1] if j else 0
        return table(['শ্রেণি','f','ক্রমযোজিত f'],list(zip(labels(d),d['f'],d['cf'])))+f'N={d["N"]}, N/2={num(F(d["N"],2))}। মধ্যক শ্রেণি {labels(d)[j]}। প্রকৃত নিম্নসীমা L={num(d["bounds"][j])}, F={prev}, f={d["f"][j]}, h={d["h"]}।\nM=L+((N/2−F)/f)h ≈ {float(d["median"]):.2f}। এটি শ্রেণিবদ্ধ উপাত্তের আনুমানিক মধ্যক।'
    if method=='mode':
        j=d['modalIndex'];fs=d['f'];prev=fs[j-1] if j else 0;nxt=fs[j+1] if j+1<len(fs) else 0
        return f'সর্বাধিক গণসংখ্যা {fs[j]}; প্রচুরক শ্রেণি {labels(d)[j]}। প্রকৃত নিম্নসীমা L={num(d["bounds"][j])}। আগের শ্রেণির গণসংখ্যা {prev}, পরেরটির {nxt}; তাই d₁={fs[j]-prev}, d₂={fs[j]-nxt}।\nZ=L+(d₁/(d₁+d₂))h ≈ {float(d["mode"]):.2f}। প্রকৃত নিম্নসীমা ও সমান শ্রেণিব্যাপ্তি ব্যবহার করায় এটি শ্রেণিবদ্ধ উপাত্তের আনুমানিক প্রচুরক।'
    if method=='shortcut':
        A=d['mids'][len(d['mids'])//2];us=[(x-A)/d['h'] for x in d['mids']];fu=sum(f*u for f,u in zip(d['f'],us))
        return table(['শ্রেণি','x','f','u=(x−A)/h','fu'],[[l,num(x),f,num(u),num(f*u)] for l,x,f,u in zip(labels(d),d['mids'],d['f'],us)])+f'A={num(A)}, h={d["h"]}, Σf={d["N"]}, Σfu={num(fu)}।\nগড় ≈ A+hΣfu/Σf = {num(A)}+{d["h"]}×({num(fu)})/{d["N"]} ≈ {float(d["mean"]):.2f}। শ্রেণিমধ্যমান প্রতিনিধি হিসেবে ব্যবহার করায় গড় আনুমানিক।'
    total=sum(x*f for x,f in zip(d['mids'],d['f']))
    return table(['শ্রেণি','x','f','fx'],[[l,num(x),f,num(x*f)] for l,x,f in zip(labels(d),d['mids'],d['f'])])+f'Σf={d["N"]}, Σfx={num(total)}। আনুমানিক গড় = Σfx/Σf = {num(total)}/{d["N"]} ≈ {float(d["mean"]):.2f}। প্রতিটি শ্রেণির মধ্যমান সেই শ্রেণির সব মানের প্রতিনিধি ধরা হয়েছে।'


def graph(d,kind):
    if kind=='polygon':
        points=[(d['mids'][0]-d['h'],0),*zip(d['mids'],d['f']),(d['mids'][-1]+d['h'],0)]
        text='অনুভূমিক অক্ষে শ্রেণিমধ্যমান, উল্লম্ব অক্ষে গণসংখ্যা নাও। বিন্দুগুলো পরপর সরলরেখায় যোগ কর। দুই পাশে অতিরিক্ত শ্রেণির মধ্যমানে শূন্য গণসংখ্যা নিয়ে বহুভুজ বন্ধ কর।'
    else:
        ys=[0,*d['cf']] if kind=='less' else [d['N'],*[d['N']-c for c in d['cf']]]
        points=list(zip(d['bounds'],ys))
        text=('প্রথম প্রকৃত নিম্নসীমায় শূন্য থেকে শুরু করে প্রতিটি প্রকৃত উচ্চসীমায় সঞ্চিত গণসংখ্যার বিন্দু বসাও; কম-থেকে অজিভ নিচে নামবে না।' if kind=='less' else 'প্রথম প্রকৃত নিম্নসীমায় সব পর্যবেক্ষণ নিয়ে শুরু কর; পরের সীমায় আগের শ্রেণির গণসংখ্যা বাদ দাও। শেষ প্রকৃত উচ্চসীমায় শূন্য; বেশি-থেকে অজিভ উপরে উঠবে না।')
        text+=' অনুভূমিক অক্ষে প্রকৃত শ্রেণিসীমা, উল্লম্ব অক্ষে সংশ্লিষ্ট ক্রমযোজিত গণসংখ্যা নাও।'
    text+=table(['x','y'],[[num(x),y] for x,y in points])+f'অনুভূমিক অক্ষে প্রতি প্রধান ভাগে {d["h"]} একক এবং উল্লম্ব অক্ষে প্রতি প্রধান ভাগে 5 গণসংখ্যা নিয়ে অক্ষের নাম ও স্কেল লিখে বিন্দুগুলো পরপর যোগ কর।'
    return text,points


def short_questions():
    # Every option is authored; no uniform arbitrary numeric-offset generator.
    mcq=[
      ('8, 14, 11, 17, 6, 7 উপাত্তের মধ্যক কত?',['8','11','9.5','10.5'],'C','সাজানো মান 6, 7, 8, 11, 14, 17; মধ্যক=(8+11)/2=9.5।',['মাঝের একটি পদ নেওয়া হয়েছে।','মাঝের একটি পদ নেওয়া হয়েছে।','সঠিক।','মাঝের পদ ভুল চিহ্নিত হয়েছে।']),
      ('সারণির মধ্যক শ্রেণি কোনটি?'+table(['শ্রেণি','10–19','20–29','30–39','40–49'],[['f',4,7,13,6]]),['10–19','20–29','30–39','40–49'],'C','মোট N=30; N/2=15। সঞ্চিত গণসংখ্যা 4,11,24,30; পঞ্চদশ পর্যবেক্ষণ 30–39 শ্রেণিতে।',['মধ্যকের অবস্থান প্রথম শ্রেণিতে নয়।','11টি পর্যন্ত দ্বিতীয় শ্রেণি।','সঠিক।','মধ্যকের অবস্থান শেষ শ্রেণিতে নয়।']),
      ('পূর্ণসংখ্যার অন্তর্ভুক্তিমূলক 21–30 শ্রেণির শ্রেণিব্যাপ্তি কত?',['9','10','11','21'],'B','পরবর্তী শ্রেণি 31 থেকে শুরু হয়; ব্যাপ্তি 31−21=10।',['আপাত সীমার পার্থক্য নেওয়া হয়েছে।','সঠিক।','অতিরিক্ত এক একক যোগ হয়েছে।','নিম্নসীমাকে ব্যাপ্তি বলা হয়েছে।']),
      ('কম-থেকে ক্রমযোজিত গণসংখ্যা 4, 11, 24, 30। তৃতীয় শ্রেণির গণসংখ্যা কত?',['24','11','35','13'],'D','পরপর সঞ্চিত মানের পার্থক্য 24−11=13।',['সঞ্চিত মানকে শ্রেণির f ধরা হয়েছে।','আগের সঞ্চিত মান নেওয়া হয়েছে।','বিয়োগের বদলে যোগ হয়েছে।','সঠিক।']),
      ('A=34.5, h=10, x=44.5 হলে u=(x−A)/h কত?',['1','10','−1','79'],'A','u=(44.5−34.5)/10=1।',['সঠিক।','h দিয়ে ভাগ করা হয়নি।','বিয়োগের ক্রম উল্টেছে।','x ও A যোগ হয়েছে।']),
      ('10, 12, 14, 16 উপাত্তের গড় কত?',['52','12','14','13'],'D','যোগফল 52; গড়=52/4=13।',['ভাগ করা হয়নি।','একটি উপাত্তকে গড় বলা হয়েছে।','একটি উপাত্তকে গড় বলা হয়েছে।','সঠিক।']),
      ('বিচ্ছিন্ন নিবেশনের প্রচুরক কত?'+table(['x',5,7,9],[['f',2,6,3]]),['6','7','9','11'],'B','সর্বাধিক f=6-এর সংশ্লিষ্ট x=7; তাই প্রচুরক 7।',['সর্বাধিক f-কে প্রচুরক বলা হয়েছে।','সঠিক।','সর্বোচ্চ x নেওয়া হয়েছে।','মোট গণসংখ্যা নেওয়া হয়েছে।']),
      ('31–40 শ্রেণির গণসংখ্যা 12 হলে গণসংখ্যা বহুভুজে এই শ্রেণির বিন্দু কোনটি?',['(35.5, 12)','(31, 12)','(40.5, 12)','(12, 35.5)'],'A','মধ্যমান=(31+40)/2=35.5; বিন্দু=(মধ্যমান,f)=(35.5,12)।',['সঠিক।','নিম্নসীমা নেওয়া হয়েছে।','প্রকৃত উচ্চসীমা নেওয়া হয়েছে।','দুই অক্ষ উল্টেছে।']),
      ('পাঁচটি মানের গড় 20। প্রতিটি মানের সঙ্গে 3 যোগ করলে নতুন গড় কত?',['35','20','23','17'],'C','মোট বাড়ে 5×3=15; গড় বাড়ে 15/5=3। নতুন গড় 23।',['মোট বৃদ্ধি গড়ে যোগ হয়েছে।','পরিবর্তন বাদ গেছে।','সঠিক।','যোগের বদলে বিয়োগ হয়েছে।']),
      ('কম-থেকে অজিভের দুটি বিন্দু (19.5, 4) ও (29.5, 11)। এই দুই সীমার মধ্যবর্তী শ্রেণির গণসংখ্যা কত?',['4','7','11','15'],'B','দুই সঞ্চিত মানের পার্থক্য 11−4=7।',['প্রথম সঞ্চিত মান নেওয়া হয়েছে।','সঠিক।','দ্বিতীয় সঞ্চিত মান নেওয়া হয়েছে।','বিয়োগের বদলে যোগ হয়েছে।'])
    ]
    sq=[
      ('পূর্ণ কেজিতে রেকর্ড করা ওজন দেখে ওজনকে বিচ্ছিন্ন চলক বলা কি ঠিক? কারণ লেখ।','না। ওজন পরিমাপযোগ্য অবিচ্ছিন্ন চলক; রাউন্ড করে পূর্ণসংখ্যায় লেখা তার প্রকৃতি বদলায় না। গণনাযোগ্য ব্যক্তির সংখ্যা হলে সেটি বিচ্ছিন্ন চলক হতো।'),
      ('10, 16, 14, 18, 26, 30, 28, 22 উপাত্তের মধ্যক নির্ণয় কর।','সাজানো মান 10,14,16,18,22,26,28,30। আটটি পদের মধ্যক=(18+22)/2=20।'),
      ('পূর্ণসংখ্যার অন্তর্ভুক্তিমূলক 41–50 শ্রেণির প্রকৃত নিম্নসীমা ও প্রকৃত উচ্চসীমা লেখ।','পাশের পূর্ণসংখ্যা রেকর্ডের মাঝের সীমানা নিয়ে প্রকৃত নিম্নসীমা 40.5 এবং প্রকৃত উচ্চসীমা 50.5।'),
      ('চার শ্রেণির গণসংখ্যা 3, 5, 8, 4। মোট পর্যবেক্ষণ ও শ্রেণিসংখ্যা নির্ণয় কর।','মোট পর্যবেক্ষণ=3+5+8+4=20। শ্রেণির সংখ্যা 4; শ্রেণিসংখ্যা ও মোট পর্যবেক্ষণ এক নয়।'),
      ('সংক্ষিপ্ত পদ্ধতিতে A=35, h=5 এবং Σfu=0 হলে গড় কত? কারণ লেখ।','গড়=A+hΣfu/Σf। সংশোধনী অংশ শূন্য হওয়ায় গড়=A=35, যেখানে Σf>0।'),
      ('প্রচুরক ও প্রচুরক শ্রেণির পার্থক্য লেখ।','কাঁচা/বিচ্ছিন্ন উপাত্তে সর্বাধিক বার আসা মান প্রচুরক। শ্রেণিবদ্ধ উপাত্তে সর্বাধিক গণসংখ্যার শ্রেণি প্রচুরক শ্রেণি; ওই শ্রেণির মধ্যমানকেই কাঁচা উপাত্তের অবিকল প্রচুরক বলা যায় না।'),
      ('গণসংখ্যা বহুভুজের প্রথম শ্রেণির মধ্যমান 25.5 ও শ্রেণিব্যাপ্তি 10। বাঁয়ে বহুভুজ বন্ধ করার অতিরিক্ত বিন্দু নির্ণয় কর।','এক শ্রেণিব্যাপ্তি বাঁয়ে মধ্যমান 25.5−10=15.5; অতিরিক্ত শ্রেণিতে গণসংখ্যা শূন্য। বিন্দু (15.5,0)।'),
      ('চার শ্রেণির গণসংখ্যা 6, 9, x, 8 এবং মোট 40। x নির্ণয় কর।','6+9+x+8=40; তাই x=40−23=17।'),
      ('21টি মান ঊর্ধ্বক্রমে সাজানো হলে মধ্যক কততম পদ? এটি কি মধ্যকের সংখ্যামানও বলে দেয়?','অবস্থান=(21+1)/2=11তম পদ। এটি শুধু অবস্থান; একাদশ পদের মান না জানলে মধ্যকের সংখ্যামান বলা যায় না।'),
      ('শ্রেণিমধ্যমান দিয়ে হিসাব করা গড়কে সাধারণত আনুমানিক বলা হয় কেন?','এক শ্রেণির সব পৃথক মানকে মধ্যমান দিয়ে প্রতিস্থাপন করা হয়। পৃথক মানগুলোর প্রকৃত যোগফল এই প্রতিনিধিমানভিত্তিক যোগফলের সমান নাও হতে পারে; তাই গড়টি শ্রেণিবদ্ধ estimate।')
    ]
    return mcq,sq


def cq_items(original,review,sources):
    old=original['items'];items=[];evidence=[]
    # Distinct input forms: grouped, raw, cumulative, missing frequency, comparison.
    plans=[(1,1,'median','polygon'),(2,4,'shortcut','less'),(3,2,'shortcut','polygon'),(4,3,'cf-mean','less'),(5,7,'missing-median','polygon'),(None,9,'median','shortcut'),(None,14,'shortcut','less'),(7,12,'mode','less'),(6,5,'direct','compare'),(9,18,'median','more')]
    for pos,(origin,sn,method,gkind) in enumerate(plans,1):
        source=sources[sn-1];raw=None
        if origin==2:
            raw=review[('target-v1/cq-1.json',2)]['model']['raw'];lo,h=50,10
        elif origin is None:
            raw=source['rawValues'];lo,h=(30,6) if sn==9 else (36,7)
        if raw is not None:
            d=group(lo,h,[sum(a<=x<a+h for x in raw) for a in range(lo,max(raw)+1,h)])
            stem=f'দশম শ্রেণির {len(raw)} শিক্ষার্থীর গণিতে প্রাপ্ত পূর্ণসংখ্যা নম্বর: '+', '.join(map(str,raw))+f'। প্রথম শ্রেণি {lo}–{lo+h-1} ধরে সমান {h} শ্রেণিব্যাপ্তিতে শ্রেণিবিন্যাস কর।'
        else:
            m=review[('target-v1/cq-1.json',origin)]['model']['grouped'];d=group(m['lo'],m['h'],m['f'])
            contexts={1:'শ্রমিকদের পূর্ণ বছরে রেকর্ড করা বয়সের গণসংখ্যা সারণি:',3:'একটি পরীক্ষায় প্রাপ্ত পূর্ণসংখ্যা নম্বরের গণসংখ্যা সারণি:',4:'চারাগাছের পূর্ণ সেমিতে উচ্চতার ক্রমযোজিত গণসংখ্যা সারণি:',5:'একটি জরিপে পূর্ণ বছরে রেকর্ড করা বয়সের সারণিতে একটি গণসংখ্যা অজানা।',7:'একটি পরীক্ষায় প্রাপ্ত পূর্ণসংখ্যা নম্বরের সারণি:',6:'এক দোকানের নির্বাচিত দিনগুলোতে বিক্রিত পণ্যের সংখ্যার সারণি:',9:'নির্বাচিত দিনগুলোতে বিক্রিত পণ্যের সংখ্যার গণসংখ্যা সারণি:'}
            stem=contexts[origin]
            if method=='cf-mean':stem+=table(['শ্রেণি',*labels(d)],[['কম-থেকে ক্রমযোজিত f',*d['cf']]])
            elif method=='missing-median':
                ff=d['f'][:];ff[2]='x';stem+=f' মোট পর্যবেক্ষণ {d["N"]}টি।'+table(['শ্রেণি',*labels(d)],[['f',*ff]])
            else:stem+=table(['শ্রেণি',*labels(d)],[['f',*d['f']]])
        if pos==1:
            j=d['modalIndex'];kq='প্রচুরক শ্রেণি শনাক্ত করে তার মধ্যমান নির্ণয় কর।';ks=f'সর্বাধিক গণসংখ্যা {d["f"][j]}; শ্রেণি {labels(d)[j]}। মধ্যমান={num(d["mids"][j])}।'
        elif pos in (2,7):
            kq='নির্ধারিত প্রথম শ্রেণি ও শ্রেণিব্যাপ্তি অনুযায়ী প্রয়োজনীয় শ্রেণিসংখ্যা নির্ণয় কর।';ks=f'সর্বনিম্ন {min(raw)}, সর্বোচ্চ {max(raw)}। প্রথম নিম্নসীমা {d["lo"]}; শ্রেণিসংখ্যা=⌊({max(raw)}−{d["lo"]})/{d["h"]}⌋+1={len(d["f"])}।'
        elif pos==3:
            kq='8, 14, 11, 17, 6, 7 উপাত্তের মধ্যক নির্ণয় কর।';ks='সাজানো মান 6,7,8,11,14,17। মধ্যক=(8+11)/2=9.5।'
        elif pos==4:
            kq='গণসংখ্যা ও ক্রমযোজিত গণসংখ্যার পার্থক্য লেখ।';ks='গণসংখ্যা একটি নির্দিষ্ট শ্রেণির পর্যবেক্ষণসংখ্যা। কম-থেকে ক্রমযোজিত গণসংখ্যায় প্রথম শ্রেণি থেকে নির্দিষ্ট শ্রেণি পর্যন্ত সব গণসংখ্যার যোগফল থাকে।'
        elif pos==5:
            kq='প্রথম শ্রেণির মধ্যমান ও শ্রেণিব্যাপ্তি নির্ণয় কর।';ks=f'প্রথম মধ্যমান=({d["lo"]}+{d["lo"]+d["h"]-1})/2={num(d["mids"][0])}; শ্রেণিব্যাপ্তি {d["h"]}।'
        elif pos==6:
            kq='উপাত্তের পরিসর নির্ণয় কর।';ks=f'পরিসর=সর্বোচ্চ−সর্বনিম্ন={max(raw)}−{min(raw)}={max(raw)-min(raw)}।'
        elif pos==8:
            kq='প্রচুরক নির্ণয়ের সূত্রে d₁ ও d₂ কী বোঝায়?';ks='d₁ হলো প্রচুরক শ্রেণির গণসংখ্যা থেকে আগের শ্রেণির গণসংখ্যা বিয়োগফল; d₂ হলো প্রচুরক শ্রেণির গণসংখ্যা থেকে পরের শ্রেণির গণসংখ্যা বিয়োগফল।'
        elif pos==9:
            kq='বিক্রিত পণ্যের সংখ্যা কোন ধরনের চলক? কারণ লেখ।';ks='গণনায় পৃথক পূর্ণসংখ্যা পাওয়া যায় বলে এটি বিচ্ছিন্ন চলক। পণ্যের সংখ্যা গণনা করা হচ্ছে, অবিচ্ছিন্ন দৈর্ঘ্য বা ওজন পরিমাপ নয়।'
        else:
            kq='বেশি-থেকে অজিভে সঞ্চিত গণসংখ্যা ধাপে ধাপে কমে কেন?';ks='একটি শ্রেণির প্রকৃত নিম্নসীমা অতিক্রম করে পরেরটিতে গেলে আগের শ্রেণির পর্যবেক্ষণগুলো আর গণনায় থাকে না; অঋণাত্মক গণসংখ্যা বাদ যায়।'
        use='median' if method=='missing-median' else 'shortcut' if method=='cf-mean' else method
        bq={'median':'প্রয়োজনীয় গণসংখ্যা ও ক্রমযোজিত সারণি তৈরি করে আনুমানিক মধ্যক নির্ণয় কর।','shortcut':'কাজের সারণি তৈরি করে সংক্ষিপ্ত পদ্ধতিতে আনুমানিক গড় নির্ণয় কর।','direct':'কাজের সারণি তৈরি করে সরাসরি পদ্ধতিতে আনুমানিক গড় নির্ণয় কর।','mode':'প্রকৃত শ্রেণিসীমা ব্যবহার করে আনুমানিক প্রচুরক নির্ণয় কর।'}[use]
        bs=work(d,use)
        if method=='cf-mean':bq='সঞ্চিত মান থেকে পৃথক গণসংখ্যা উদ্ধার করে সংক্ষিপ্ত পদ্ধতিতে আনুমানিক গড় নির্ণয় কর।';bs='প্রথম f প্রথম সঞ্চিত মান; পরের f-গুলো পরপর দুটি সঞ্চিত মানের বিয়োগফল। উদ্ধার করা f: '+', '.join(map(str,d['f']))+'।'+bs
        if method=='missing-median':bq='অজানা গণসংখ্যা x নির্ণয় করে আনুমানিক মধ্যক নির্ণয় কর।';bs=f'x={d["N"]}−({d["f"][0]}+{d["f"][1]}+{d["f"][3]}+{d["f"][4]})={d["f"][2]}।'+bs
        points=[];extra={}
        if gkind=='shortcut':gq='একই শ্রেণিবিন্যাস ব্যবহার করে সংক্ষিপ্ত পদ্ধতিতে আনুমানিক গড় নির্ণয় কর।';gs=work(d,'shortcut')
        elif gkind=='compare':
            second=group(d['lo'],d['h'],list(reversed(d['f'])))
            gq='দ্বিতীয় দোকানে একই শ্রেণিগুলোর গণসংখ্যা '+', '.join(map(str,second['f']))+'। দুই দোকানের আনুমানিক গড় হিসাব করে তুলনা কর।'
            delta=second['mean']-d['mean'];gs='প্রথম দোকান:'+work(d,'direct')+'দ্বিতীয় দোকান:'+work(second,'direct')+f'দ্বিতীয়−প্রথম গড়ের পার্থক্য ≈ {float(delta):.2f}; '+('দ্বিতীয় দোকানের গড় বেশি।' if delta>0 else 'প্রথম দোকানের গড় বেশি।' if delta<0 else 'গড় দুটি সমান।');extra={'secondF':second['f'],'secondMean':str(second['mean']),'difference':str(delta)}
        else:gq='বর্ণনাসহ '+{'polygon':'গণসংখ্যা বহুভুজ','less':'কম-থেকে অজিভ রেখা','more':'বেশি-থেকে অজিভ রেখা'}[gkind]+' অঙ্কন কর।';gs,points=graph(d,gkind)
        q={'type':'CQ','text':stem,'explanation':'math.txt-এর নির্বাচিত কাজের ধরন ও বিদ্যমান/সম্পূর্ণ কাঁচা উপাত্তের নতুন অভিযোজন। মূল বোর্ড প্রশ্ন বা হারানো সারণি উদ্ধারের দাবি নয়। অংশভিত্তিক সমাধান নিচে আছে।','page':f'নতুন restart r1; CQ {pos}; math.txt লাইন {source["line"]}; পরিচয় অযাচাইকৃত','difficulty':'MEDIUM','parts':[{'label':l,'marks':m,'question':p,'solution':s} for l,m,p,s in [('ক',2,kq,ks),('খ',4,bq,bs),('গ',4,gq,gs)]]}
        items.append(q);evidence.append({'id':f'CQ-{pos:03}','sourceId':source['sourceId'],'sourceTasks':source['tasks'],'adaptation':'SELECTED_TASK_STRUCTURE_ADAPTED; graph/comparison work may extend source; not verbatim','dataOrigin':f'target-v1 CQ {origin}' if origin else f'math.txt {source["sourceId"]} raw list','oldSlot':{'file':'target-v1/cq-1.json','item':pos,'digest':canonical(old[pos-1])},'model':serial(d),'raw':raw,'method':method,'graphKind':gkind,'graphPoints':serial(points),**extra})
    return items,evidence


def render(text):
    body=[];rows=[]
    for line in (text+'\nEND').splitlines():
        if line.startswith('|'):
            cells=[x.strip() for x in line.strip('|').split('|')]
            if all(x=='---' for x in cells):continue
            tag='th' if not rows else 'td';rows.append('<tr>'+''.join(f'<{tag}>{html.escape(c)}</{tag}>' for c in cells)+'</tr>')
        else:
            if rows:body.append('<div class="scroll"><table>'+''.join(rows)+'</table></div>');rows=[]
            if line!='END':body.append('<p>'+html.escape(line)+'</p>')
    return ''.join(body)


def main():
    intake=json.loads((OUT/'source-intake.json').read_text());receipt=json.loads((OUT/'input-backup-receipt.json').read_text());require_backup(receipt,intake)
    manifest=json.loads((BASE/'targets-v1-manifest.json').read_text());old={}
    for f in manifest['files']:
        data=(BASE/f['file']).read_bytes()
        if sha(data)!=f['sha256']:raise ValueError('Original input changed: '+f['file'])
        old[f['file']]=json.loads(data)
    meta=json.loads((BASE/'target-v1/validation.json').read_text())['itemReviews'];reviews={(r['file'],r['itemInFile']):r for r in meta}
    cq,checks=cq_items(old['target-v1/cq-1.json'],reviews,intake['records'])
    mcq=[];sq=[];ms,ss=short_questions()
    for i,(text,options,key,explanation,reasons) in enumerate(ms,1):
        q=dict(type='MCQ',text=text,options=dict(zip('ABCD',options)),correct=key,explanation=explanation,page=f'নিজস্ব সংশোধিত অনুশীলনী; restart r1 MCQ {i}',difficulty='MEDIUM')
        mcq.append(q);checks.append(dict(id=f'MCQ-{i:03}',oldSlot=dict(file='target-v1/mcq-1.json',item=i,digest=canonical(old['target-v1/mcq-1.json']['items'][i-1])),expectedAnswer=q['options'][key],optionReasons=dict(zip('ABCD',reasons)),origin='NEW_ORIGINAL_NOT_BOARD'))
    for i,(text,explanation) in enumerate(ss,1):
        q=dict(type='SQ',text=text,explanation=explanation,page=f'নিজস্ব সংশোধিত অনুশীলনী; restart r1 SQ {i}',difficulty='EASY')
        sq.append(q);checks.append(dict(id=f'SQ-{i:03}',oldSlot=dict(file='target-v1/sq.json',item=i,digest=canonical(old['target-v1/sq.json']['items'][i-1])),intendedMarks=2,origin='NEW_ORIGINAL_NOT_BOARD'))
    allq=mcq+cq+sq
    assert len({q['text'].strip() for q in allq})==30
    for e in checks:
        kind,index=e['id'].split('-');e['newDigest']=canonical({'MCQ':mcq,'CQ':cq,'SQ':sq}[kind][int(index)-1]);e['approved']=False
    scope={k:old['target-v1/cq-1.json'][k] for k in ('category','subject','topic','lang','sourceUrl')};files=[]
    for kind,items in [('mcq',mcq),('cq',cq),('sq',sq)]:
        path=OUT/f'batch01-{kind}.json';dump(path,{**scope,'book':'Proshnobook — backup-first পরিসংখ্যান পুনর্গঠন','edition':'restart r1 batch01; DRAFT; NOT APPROVED','items':items});files.append({'file':path.name,'bytes':path.stat().st_size,'sha256':sha(path.read_bytes())})
    dump(OUT/'batch01-checks.json',checks)
    dump(OUT/'progress.json',{'status':'RESTART_BATCH01_DRAFT_NOT_APPROVED','target':{'MCQ':300,'CQ':200,'SQ':100},'reconstructed':{'MCQ':10,'CQ':10,'SQ':10},'totalReconstructed':30,'remaining':570,'teacherApproved':False,'approved':0,'published':0,'oldPayloadsModified':False,'lostVersionRecovered':False,'inputBackupVerified':True,'batchBackupReceipt':'batch01-backup-receipt.json','batchBackupRule':'A generated batch is not backed up until its separate Drive receipt and GitHub commit are verified.','files':files})
    cards=[]
    for kind,items in [('CQ',cq),('MCQ',mcq),('SQ',sq)]:
        for i,q in enumerate(items,1):
            card=f'<article><h2>{kind} {i}</h2>'+render(q['text'])
            if kind=='CQ':card+=''.join(f'<h3>{p["label"]} — {p["marks"]} নম্বর</h3>'+render(p['question'])+'<details open><summary>সমাধান</summary>'+render(p['solution'])+'</details>' for p in q['parts'])
            else:
                if kind=='MCQ':card+=render('\n'.join(k+'. '+v for k,v in q['options'].items()))
                card+='<details open><summary>উত্তর ও সমাধান</summary>'+render(('সঠিক বিকল্প '+q['correct']+'। ' if kind=='MCQ' else '')+q['explanation'])+'</details>'
            cards.append(card+'<footer>'+html.escape(q['page'])+'</footer></article>')
    DOC.parent.mkdir(parents=True,exist_ok=True)
    DOC.write_text('<!doctype html><html lang="bn"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>পরিসংখ্যান — নতুন শুরু, প্রথম ৩০</title><style>body{font-family:system-ui,sans-serif;max-width:1050px;margin:auto;padding:20px;line-height:1.8;background:#edf3ef;color:#1d3528}header,article{background:white;border:1px solid #bfd3c6;border-radius:12px;padding:24px;margin-bottom:24px}h1,h2,h3{color:#176757}table{width:100%;border-collapse:collapse;white-space:nowrap}th,td{border:1px solid #9bb5a5;padding:6px 10px;text-align:center}.scroll{overflow:auto}details{border-left:3px solid #90b79e;padding:12px}p{white-space:pre-wrap}footer{color:#5a7062;font-size:.85rem}@media print{article{break-before:page}}</style><header><h1>পরিসংখ্যান — নতুন শুরু, প্রথম ৩০ প্রশ্ন</h1><p>১০ MCQ + ১০ CQ + ১০ SQ। লক্ষ্য মোট ৬০০; বাকি ৫৭০।</p><p>নতুন খসড়া, হারানো সংস্করণ উদ্ধার নয়। অনুমোদিত/প্রকাশিত নয়; স্বাধীন শিক্ষক-পর্যালোচনা হয়নি। লেখচিত্রের সমাধানে পূর্ণ স্থানাঙ্ক দেওয়া আছে; আলাদা অঙ্কিত SVG এখনো যোগ করা হয়নি।</p></header>'+''.join(cards)+'</html>')
    print('Reconstructed 30 draft items; remaining 570; approved 0. Input backup verified; batch backup must be verified separately.')

if __name__=='__main__':main()
