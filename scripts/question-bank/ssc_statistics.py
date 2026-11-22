"""Exact statistics and accessible pipe-table payloads; graph axes are numeric.
No population inference or official-paper authentication is implied.
"""
import math,html,re
import sympy as S
from illustrated_geometry_bank import R,tex

def table(headers,rows):
 def cell(v):
  text=str(v)
  return f'{float(R(text)):g}' if re.fullmatch(r'-?\d+/2',text) else text
 headers=list(map(cell,headers));rows=[list(map(cell,row)) for row in rows]
 return '\n\n| '+' | '.join(map(str,headers))+' |\n| '+' | '.join(['---']*len(headers))+' |\n'+'\n'.join('| '+' | '.join(map(str,r))+' |' for r in rows)+'\n\n'
def grouped(lo,h,f):
 f=list(map(int,f));N=sum(f);starts=[int(lo+i*h) for i in range(len(f))];m=[R(2*x+h-1,2) for x in starts];bounds=[R(2*lo-1,2)+i*h for i in range(len(f)+1)];cf=[];total=0
 for x in f:total+=x;cf.append(total)
 j=next(i for i,v in enumerate(cf) if v>=R(N,2));modal=max(range(len(f)),key=f.__getitem__)
 prev=f[modal-1] if modal else 0;nxt=f[modal+1] if modal+1<len(f) else 0
 return dict(lo=int(lo),h=int(h),f=f,N=N,starts=starts,m=m,bounds=bounds,cf=cf,medianIndex=j,modalIndex=modal,mean=S.simplify(sum(x*y for x,y in zip(m,f))/N),median=bounds[j]+(R(N,2)-(cf[j-1] if j else 0))/f[j]*h,mode=(bounds[modal]+R(f[modal]-prev,2*f[modal]-prev-nxt)*h) if f.count(f[modal])==1 else None)
def labels(d):return [f'{a}–{a+d["h"]-1}' for a in d['starts']]
def grid(d):return table(['শ্রেণি',*labels(d)],[['গণসংখ্যা f',*d['f']]])
def cumulative(d):return table(['প্রকৃত উচ্চসীমা',*[str(x) for x in d['bounds'][1:]]],[['ক্রমযোজিত গণসংখ্যা',*d['cf']]])
def work(d,shortcut=False):
 if shortcut:
  a=d['m'][len(d['m'])//2];u=[(x-a)/d['h'] for x in d['m']];return table(['শ্রেণি','মধ্যমান x','f','u=(x−A)/h','fu'],[[c,str(x),f,str(t),str(f*t)] for c,x,f,t in zip(labels(d),d['m'],d['f'],u)])
 return table(['শ্রেণি','মধ্যমান x','f','fx','সঞ্চিত f'],[[c,str(x),f,str(x*f),cf] for c,x,f,cf in zip(labels(d),d['m'],d['f'],d['cf'])])
def mean_solution(d,shortcut=False):
 if shortcut:
  a=d['m'][len(d['m'])//2];su=sum(f*(x-a)/d['h'] for x,f in zip(d['m'],d['f']));return work(d,True)+rf'$A={tex(a)}, h={d["h"]}, \sum f={d["N"]},\sum fu={tex(su)}$। আনুমানিক গড় $\bar x=A+h\frac{{\sum fu}}{{\sum f}}={tex(d["mean"])}$। শ্রেণির মধ্যমান দিয়ে হিসাব, মূল উপাত্তের অবিকল গড় দাবি নয়। দশমিকে প্রায় {float(d["mean"]):.2f}।'
 return work(d)+rf'$\sum f={d["N"]},\sum fx={tex(sum(x*f for x,f in zip(d["m"],d["f"])))}$। আনুমানিক গড় $\bar x=\frac{{\sum fx}}{{\sum f}}={tex(d["mean"])}$। প্রতিটি শ্রেণির মধ্যমান প্রতিনিধি ধরা হয়েছে। দশমিকে প্রায় {float(d["mean"]):.2f}।'
def median_solution(d):
 j=d['medianIndex'];before=d['cf'][j-1] if j else 0
 return work(d)+rf'$N/2={tex(R(d["N"],2))}$; প্রথম যে সঞ্চিত f এই মানে পৌঁছায়/অতিক্রম করে তার শ্রেণি {labels(d)[j]}। $L={tex(d["bounds"][j])},F={before},f_m={d["f"][j]},h={d["h"]}$। আনুমানিক মধ্যক $M=L+\frac{{N/2-F}}{{f_m}}h={tex(d["median"])}$। এখানে প্রকৃত নিম্নসীমা ব্যবহৃত। দশমিকে প্রায় {float(d["median"]):.2f}।'
def mode_solution(d):
 j=d['modalIndex'];f=d['f'];prev=f[j-1] if j else 0;nxt=f[j+1] if j+1<len(f) else 0
 return rf'সর্বাধিক গণসংখ্যা {f[j]}, প্রচুরক শ্রেণি {labels(d)[j]}। $L={tex(d["bounds"][j])},d_1={f[j]-prev},d_2={f[j]-nxt},h={d["h"]}$। আনুমানিক প্রচুরক $Z=L+\frac{{d_1}}{{d_1+d_2}}h={tex(d["mode"])}$। শ্রেণির আপাত নিম্নসীমা নয়, প্রকৃত সীমা ব্যবহার করা হয়েছে। দশমিকে প্রায় {float(d["mode"]):.2f}।'
def raw_stats(raw):
 a=sorted(raw);N=len(a);freq={x:a.count(x) for x in sorted(set(a))};top=max(freq.values());modes=[x for x,v in freq.items() if v==top]
 return dict(raw=list(raw),sorted=a,N=N,mean=R(sum(a),N),median=S.Integer(a[N//2]) if N%2 else R(a[N//2-1]+a[N//2],2),modes=modes,freq=freq)
def raw_grid(r):return table(['মান x',*r['freq']],[['গণসংখ্যা f',*r['freq'].values()]])
def model_serial(d):
 if isinstance(d,dict):return {str(k):model_serial(v) for k,v in d.items()}
 if isinstance(d,list):return [model_serial(x) for x in d]
 return str(d) if isinstance(d,S.Basic) else d

def plot(d,kind):
 if kind=='polygon':x=[d['m'][0]-d['h'],*d['m'],d['m'][-1]+d['h']];y=[0,*d['f'],0];xlabel='Class midpoint';ylabel='Frequency'
 elif kind=='less':x=d['bounds'];y=[0,*d['cf']];xlabel='Upper class boundary';ylabel='Cumulative frequency'
 elif kind=='more':x=d['bounds'];y=[d['N'],*[d['N']-a for a in d['cf']]];xlabel='Lower class boundary';ylabel='Cumulative frequency'
 else:assert kind=='histogram';x=d['bounds'];y=d['f'];xlabel='Class boundary';ylabel='Frequency'
 xmin,xmax=float(x[0]),float(x[-1]);ymax=max(y);top=math.ceil(ymax/5)*5;scx=560/(xmax-xmin);scy=245/top
 pixel=lambda a,b:(75+(float(a)-xmin)*scx,295-float(b)*scy)
 paths=[];words=[]
 for j in range(6):
  val=top*j/5;yy=295-val*scy;paths.append(f'<path d="M75 {yy}H635" stroke="#dce3eb"/>');words.append(f'<text x="62" y="{yy+5}" text-anchor="end">{val:g}</text>')
 for val in x:
  xx=pixel(val,0)[0];paths.append(f'<path d="M{xx} 295V301"/>');words.append(f'<text x="{xx}" y="320" text-anchor="middle">{float(val):g}</text>')
 coords=[]
 if kind=='histogram':
  for left,right,height in zip(x,x[1:],y):
   p=pixel(left,height);q=pixel(right,0);paths.append(f'<rect x="{p[0]}" y="{p[1]}" width="{q[0]-p[0]}" height="{q[1]-p[1]}" fill="#d9eeeb"/>');coords.append([float(left),float(right),height])
 else:
  pts=[pixel(a,b) for a,b in zip(x,y)];paths.append('<polyline points="'+' '.join(f'{a:.5f},{b:.5f}' for a,b in pts)+'" fill="none" stroke="#086b67" stroke-width="2.4"/>')
  for a,b in pts:paths.append(f'<circle cx="{a:.5f}" cy="{b:.5f}" r="3" fill="#086b67"/>')
  coords=[[float(a),b] for a,b in zip(x,y)]
 svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 380" role="img" aria-label="'+kind+' statistical graph"><rect width="720" height="380" fill="white"/><g fill="none" stroke="#20344c" stroke-width="1">'+''.join(paths)+'<path d="M75 40V295H650"/></g><g font-family="Arial,sans-serif" font-size="14" fill="#20344c">'+''.join(words)+f'<text x="360" y="350" text-anchor="middle">{xlabel}</text><text x="75" y="25">{ylabel}</text><text x="360" y="373" text-anchor="middle" font-size="12">Numeric axes; x-axis begins at {xmin:g}, not zero</text></g></svg>'
 return svg,dict(kind=kind,dataPoints=coords,xmin=xmin,xmax=xmax,ymax=top,xScale=scx,yScale=scy,xOriginPixel=75,yOriginPixel=295,grouped=model_serial(d))
