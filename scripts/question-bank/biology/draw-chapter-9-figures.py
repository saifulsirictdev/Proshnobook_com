#!/usr/bin/env python3
"""Original explanatory schematics, not anatomical scale or clinical instructions."""
from pathlib import Path
from html import escape
import math
OUT = Path(__file__).resolve().parents[3] / 'content/question-bank/ssc/biology/chapter-9/assets'
OUT.mkdir(parents=True, exist_ok=True)
INK = '#173d36'
def text(x,y,s,size=21,color=INK):
    return f'<text x="{x}" y="{y}" font-family="sans-serif" font-size="{size}" fill="{color}">{escape(s)}</text>'
def path(d,color=INK,w=3,fill='none'):
    return f'<path d="{d}" stroke="{color}" stroke-width="{w}" fill="{fill}" stroke-linecap="round" stroke-linejoin="round"/>'
def rect(x,y,w,h,fill):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="{fill}" stroke="{INK}" stroke-width="2"/>'
def arrow(x,y,xx,yy,color=INK):
    a=math.atan2(yy-y,xx-x)
    p=[(xx-11*math.cos(a+t),yy-11*math.sin(a+t)) for t in [.45,-.45]]
    return path(f'M{x} {y} L{xx} {yy} M{p[0][0]} {p[0][1]} L{xx} {yy} L{p[1][0]} {p[1][1]}',color)
def save(name,title,desc,body):
    s=f'<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="680" viewBox="0 0 1100 680" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc>'
    s+=rect(1,1,1098,678,'#f4faf7')+text(30,45,title,27)+body
    s+=text(30,650,'Original editorial schematic | not to scale | review draft',18)+'</svg>\n'
    (OUT/name).write_text(s)
AX='#4d7fa3';AP='#ac7853'
body=text(45,95,'Blue: selected axial parts',22,AX)+text(490,95,'Brown: selected appendicular parts',22,AP)
body+=path('M300 135 C255 135 250 210 300 215 C350 210 345 135 300 135 Z',AX,4,'#dbe8ef')
body+=path('M300 220 L300 430',AX,12)
for y in [265,285,305,325,345]:
 body+=path(f'M300 {y} Q255 {y-20} 245 {y+5} Q260 {y+20} 300 {y+10} M300 {y} Q345 {y-20} 355 {y+5} Q340 {y+20} 300 {y+10}',AX,4)
body+=path('M245 235 L300 245 L355 235 M245 235 L220 255 L245 285 M355 235 L380 255 L355 285',AP,7)
body+=path('M220 255 L175 350 L150 430 M380 255 L425 350 L450 430',AP,10)
body+=path('M155 355 L130 435 M430 355 L470 435',AP,5)
body+=path('M250 420 Q300 445 350 420 L335 470 L300 450 L265 470 Z',AP,6,'#eaddcd')
body+=path('M265 470 L250 535 L240 600 M335 470 L350 535 L360 600',AP,11)
body+=path('M263 539 L256 600 M337 539 L344 600 M240 603 L220 610 M360 603 L380 610',AP,5)
for x,y,label,xx,yy,col in [(575,160,'Skull (axial)',330,170,AX),(575,230,'Pectoral girdle',360,240,AP),(575,300,'Rib cage (axial)',350,300,AX),(575,370,'Vertebral column (axial)',303,385,AX),(575,440,'Pelvic girdle',340,442,AP),(575,510,'Limb bones',355,535,AP)]:
 body+=text(x,y,label,23,col)+arrow(x-15,y-8,xx,yy,col)
body+=text(520,570,'Selected regions only;',21)+text(520,605,'not a 206-bone inventory.',21)
save('skeleton-regions.svg','Human skeleton: selected support and movement regions','A simplified frontal regional map. Blue marks selected axial structures: skull, rib cage and vertebral column. Brown marks appendicular structures: pectoral and pelvic girdles and limb bones. Ribs and vertebrae are deliberately not drawn in their true count, and small bones, sternum details and the sacrum are not individually resolved. The map identifies regions, not a full bone-count or clinical diagram.',body)
body=rect(350,95,410,490,'#f2e8d3')
body+=path('M440 105 L440 240 Q440 285 490 285 L620 285 Q670 285 670 240 L670 105',INK,4,'#e6d4bd')
body+=path('M440 575 L440 420 Q440 375 490 375 L620 375 Q670 375 670 420 L670 575',INK,4,'#e6d4bd')
body+=path('M440 240 Q440 285 490 285 L620 285 Q670 285 670 240 L670 265 Q670 310 620 310 L490 310 Q440 310 440 265 Z','#568f9d',3,'#bcdce0')
body+=path('M440 420 Q440 375 490 375 L620 375 Q670 375 670 420 L670 395 Q670 350 620 350 L490 350 Q440 350 440 395 Z','#568f9d',3,'#bcdce0')
body+=path('M400 160 L400 500 M710 160 L710 500','#9f7655',18)
body+=path('M365 130 L365 550 M745 130 L745 550','#ac8b4a',3)
body+=text(35,145,'C  Joint capsule',22)+arrow(235,155,350,190)
body+=text(35,270,'A  Articular cartilage',22)+arrow(260,280,467,298)
body+=text(35,390,'B  Fluid-filled cavity',22)+arrow(255,380,545,330)
body+=text(790,235,'D  Ligament',22)+arrow(780,245,713,280)
body+=text(790,425,'Synovial lining',21)+arrow(780,410,745,455)
body+=text(65,610,'Simplified section: fluid + cartilage reduce friction; capsule + ligaments help stability.',20)
save('synovial-joint.svg','Synovial joint: surfaces, fluid and stabilizers','Two stylized bone ends face one another. A is articular cartilage, B is the fluid-filled cavity between the cartilage surfaces, C is the outer capsule. D represents a ligament linking the bones; fine lines inside the capsule represent synovial lining on the non-articular internal surface. Anatomy and layer thickness are enlarged and simplified. The diagram shows complementary lubrication and stability roles, not unlimited movement.',body)
body=path('M340 125 L370 435','#9e886f',22)+path('M385 450 L715 450 M385 478 L710 478','#9e886f',13)
body+=path('M352 435 Q375 420 395 442 L395 480 Q370 499 352 473 Z',INK,3,'#e2d0b7')
body+=path('M348 165 C415 195 442 300 390 365 L355 210 Z','#aa4b58',3,'#d98b91')
body+=path('M390 365 L450 442','#aa4b58',7)
body+=path('M310 160 C270 225 285 335 335 385 L325 220 Z','#527da4',3,'#c1d5e6')
body+=path('M335 385 L355 475','#527da4',6)
body+=text(535,155,'Humerus',23)+arrow(520,165,350,210)
body+=text(535,255,'Biceps: flexor pull',23,'#aa4b58')+arrow(520,265,406,280,'#aa4b58')
body+=text(50,280,'Triceps',22,'#527da4')+text(50,310,'less active in',20,'#527da4')+text(50,338,'this simple flexion',20,'#527da4')+arrow(235,310,292,290,'#527da4')
body+=text(545,380,'Tendon',21)+arrow(530,385,432,421)
body+=text(520,520,'Forearm: radius / ulna',23)+arrow(555,495,570,475)
body+=path('M715 420 Q700 345 635 320', '#aa4b58',4)+arrow(675,340,635,320,'#aa4b58')
body+=text(65,570,'Extension: triceps becomes the main extensor; biceps opposition decreases.',21)
body+=text(65,610,'Functional side-view sketch. Other flexors and co-contraction are not drawn.',21)
save('elbow-antagonists.svg','Elbow flexion: an antagonistic muscle model','Simplified functional side view with flexed elbow. The biceps is shown as the flexor transmitting pull by a tendon toward the radius; the triceps is shown less active in this simple action and links posteriorly toward the ulna. The red curved arrow indicates flexion. For active extension the triceps is the principal extensor. Bone lengths, attachment geometry and muscle shapes are schematic; other flexors, co-contraction and full joint anatomy are omitted. Muscles pull, not actively push bones.',body)
