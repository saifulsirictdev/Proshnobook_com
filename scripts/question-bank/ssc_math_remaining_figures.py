"""Safe standalone schematic models. Plane geometry uses uniform world->SVG scale.
Solids use explicit oblique projection, never assert projected edges are true lengths.
"""
import math,html
import illustrated_geometry_bank as H
original=H.figure

def plane(points,edges,circles=None,right=None,**facts):
 return ('plane-model',dict(points={k:list(map(float,v)) for k,v in points.items()},edges=edges,circles=circles or [],right=right or [],facts={k:float(v) for k,v in facts.items()}))
def tri(b,h):return plane(dict(A=(0,0),B=(b,0),C=(0,h)),['AB','BC','CA'],right=['BAC'])
def rect(w,h):return plane(dict(A=(0,0),B=(w,0),C=(w,h),D=(0,h)),['AB','BC','CD','DA','AC'],right=['BAD'])
def pair(scale=2):
 return plane(dict(A=(0,0),B=(3,0),C=(3,4),P=(5,0),Q=(5+3*scale,0),R=(5+3*scale,4*scale)),['AB','BC','CA','PQ','QR','RP'],scaleFactor=scale)
def midpoint(b,h):
 return plane(dict(A=(b/3,h),B=(0,0),C=(b,0),D=(b/6,h/2),E=(2*b/3,h/2)),['AB','AC','BC','DE','BE','CD'])
def para(b,h):return plane(dict(A=(0,0),B=(b,0),C=(b+h/3,h),D=(h/3,h),O=(b/2+h/6,h/2)),['AB','BC','CD','DA','AC','BD'])
def median(b,h):return plane(dict(A=(b/3,h),B=(0,0),C=(b,0),M=(b/2,0)),['AB','BC','CA','AM'])
def circles(r,inner=0):return plane(dict(O=(0,0),A=(r,0)),['OA'],circles=[[0,0,float(r)]]+([[0,0,float(inner)]] if inner else []))
def solid(kind,r,h=0,l=0):return ('solid-model',dict(shape=kind,r=float(r),h=float(h),l=float(l)))
def figure(kind,**p):
 if kind not in ['plane-model','solid-model']:return original(kind,**p)
 if kind=='solid-model':
  shape=p['shape'];lines=[]
  if shape in ['cube','cuboid']:
   points=dict(A=(0,0),B=(4,0),C=(5,1),D=(1,1),E=(0,3),F=(4,3),G=(5,4),H=(1,4));edges=['AB','BC','CD','DA','EF','FG','GH','HE','AE','BF','CG','DH']
   if shape=='cube':points={k:(x,y*1.2) for k,(x,y) in points.items()}
   svg,g=figure('plane-model',points=points,edges=edges,circles=[],right=[],facts={});g.update(model='OBLIQUE_PROJECTION_NOT_TRUE_LENGTHS',physical=p);return svg,g
  # Elliptic bases and meridians are deliberately schematic projections.
  body='<ellipse cx="165" cy="215" rx="85" ry="24"/>'
  words=[(165,249,'base'),(165,208,'O'),(264,135,'h'),(211,214,'r')]
  body+='<path d="M165 215L250 215" stroke-dasharray="4 4"/>'
  if shape in ['sphere','hemisphere']:
   if shape=='sphere':body='<circle cx="165" cy="135" r="85"/><ellipse cx="165" cy="135" rx="85" ry="24"/><path d="M165 135L250 135"/>';words=[(165,129,'O'),(211,128,'r')]
   else:body+='<path d="M80 215 A85 85 0 0 1 250 215"/>';words=[(165,208,'O'),(211,208,'r')]
  elif shape=='cone':body+='<path d="M80 215L165 50L250 215M165 50L165 215"/>';words += [(165,42,'V'),(210,112,'s')]
  else:
   body+='<ellipse cx="165" cy="65" rx="85" ry="24"/><path d="M80 65L80 215M250 65L250 215"/>'
   if shape=='cylinder-hemisphere':body+='<path d="M80 65 A85 65 0 0 1 250 65"/>'
  text=''.join(f'<text x="{x}" y="{y}">{t}</text>' for x,y,t in words)
  svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 290" role="img" aria-label="Schematic solid, not to scale"><g fill="none" stroke="#172b4d" stroke-width="1.6">{body}</g><g font-family="Arial,sans-serif" font-size="13" text-anchor="middle" fill="#172b4d">{text}<text x="170" y="278" font-size="10">Schematic projection; not to scale</text></g></svg>'
  return svg,dict(model='SCHEMATIC_SOLID_PROJECTION_NOT_TRUE_LENGTHS',physical=p)
 P=p['points'];cs=p['circles'];xs=[v[0] for v in P.values()];ys=[v[1] for v in P.values()]
 for x,y,r in cs:xs += [x-r,x+r];ys += [y-r,y+r]
 lowx,highx=min(xs),max(xs);lowy,highy=min(ys),max(ys);sc=min(245/max(highx-lowx,1),195/max(highy-lowy,1));ox=(340-sc*(highx-lowx))/2;oy=245
 pix={k:(ox+(v[0]-lowx)*sc,oy-(v[1]-lowy)*sc) for k,v in P.items()}
 lines=[]
 for edge in p['edges']:
  a,b=pix[edge[0]],pix[edge[1]];lines.append(f'<path d="M{a[0]:.4f} {a[1]:.4f}L{b[0]:.4f} {b[1]:.4f}"/>')
 for x,y,r in cs:lines.append(f'<circle cx="{ox+(x-lowx)*sc:.4f}" cy="{oy-(y-lowy)*sc:.4f}" r="{r*sc:.4f}"/>')
 for a,o,b in p.get('right',[]):
  O=pix[o];A=pix[a];B=pix[b];u=[(A[i]-O[i])/math.dist(A,O)*9 for i in (0,1)];v=[(B[i]-O[i])/math.dist(B,O)*9 for i in (0,1)];q=[[O[i]+u[i] for i in(0,1)],[O[i]+u[i]+v[i] for i in(0,1)],[O[i]+v[i] for i in(0,1)]];lines.append('<polyline points="'+' '.join(f'{x:.4f},{y:.4f}' for x,y in q)+'"/>')
 labels=''.join(f'<text x="{x:.4f}" y="{y-9:.4f}">{html.escape(k)}</text>' for k,(x,y) in pix.items())
 svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 290" role="img" aria-label="Schematic plane model, not to scale"><g stroke="#172b4d" stroke-width="1.6" fill="none">'+''.join(lines)+'</g><g font-family="Arial,sans-serif" font-size="13" text-anchor="middle" fill="#172b4d">'+labels+'<text x="170" y="278" font-size="10">Schematic; not to scale</text></g></svg>'
 return svg,dict(model='UNIFORM_PLANE_SCALE',points=P,pixelPoints=pix,scale=sc,circles=cs,right=p.get('right',[]),facts=p.get('facts',{}))
H.figure=figure
