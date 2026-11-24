#!/usr/bin/env python3
"""Original schematic assets; no external images, fonts, scripts or SVG links."""
from pathlib import Path
from html import escape
OUT = Path(__file__).resolve().parents[3] / 'content/question-bank/ssc/biology/chapter-5/assets'
OUT.mkdir(parents=True, exist_ok=True)
INK = '#173d36'

def text(x, y, value, size=21, color=INK):
    return f'<text x="{x}" y="{y}" font-family="sans-serif" font-size="{size}" fill="{color}">{escape(value)}</text>'

def rect(x, y, w, h, fill, stroke=INK, radius=12):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}" stroke="{stroke}" stroke-width="2"/>'

def arrow(x, y, xx, yy, color=INK):
    # Hand-drawn arrowheads, avoiding external marker references.
    import math
    a = math.atan2(yy-y, xx-x)
    p = [(xx-12*math.cos(a-t), yy-12*math.sin(a-t)) for t in [.45, -.45]]
    return f'<path d="M{x} {y} L{xx} {yy} M{p[0][0]:.2f} {p[0][1]:.2f} L{xx} {yy} L{p[1][0]:.2f} {p[1][1]:.2f}" fill="none" stroke="{color}" stroke-width="3"/>'

def save(name, title, desc, body):
    result = f'<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="600" viewBox="0 0 1000 600" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc>'
    result += rect(1,1,998,598,'#f4faf7','#b2cbbf',18)
    result += text(30,45,title,27)
    result += body + text(30,575,'Original editorial schematic | not to scale | review draft',17,'#506b63') + '</svg>\n'
    (OUT / name).write_text(result)

# Functional flow map rather than an anatomical silhouette.
body = text(40,90,'Food route (solid arrows) and secretion routes (blue)',20)
for x,y,w,h,label in [(45,130,180,60,'Mouth'),(290,130,190,60,'Esophagus'),(555,130,220,60,'Stomach'),(555,290,280,65,'Small intestine'),(555,435,280,60,'Large intestine'),(45,435,380,60,'Rectum → anus'),(45,240,180,55,'Liver'),(270,240,210,55,'Gallbladder'),(45,335,240,55,'Pancreas')]:
    body += rect(x,y,w,h,'#e1efe8') + text(x+15,y+37,label,21)
body += arrow(225,160,285,160)+arrow(480,160,550,160)+arrow(770,195,770,285)+arrow(695,360,695,430)+arrow(550,465,430,465)
body += arrow(225,268,265,268,'#347cab')+arrow(480,268,550,313,'#347cab')+arrow(285,363,550,340,'#347cab')
body += text(315,395,'Juices enter duodenum',18,'#347cab')+text(45,535,'Food does not pass through liver, gallbladder or pancreas.',21)
save('digestive-routes.svg','Digestive tract: two kinds of route','Food passes mouth, esophagus, stomach, small intestine, large intestine, rectum and anus. Liver produces bile, gallbladder stores it, and pancreas secretes digestive juice. These secretions enter duodenum; food does not pass through the accessory organs.',body)
body = text(35,90,'Intestinal lumen: absorbed nutrients move into epithelium',21)
# A single villus: broad tip and central transport channels.
body += '<path d="M180 495 L180 265 C180 100 580 100 580 265 L580 495 Z" fill="#f9e7cb" stroke="#8b704a" stroke-width="5"/>'
for x in range(240,540,35):
    body += f'<path d="M{x} 162 l-5 -22" stroke="#8b704a" stroke-width="4"/>'
body += '<path d="M265 490 L265 300 C265 235 490 235 490 300 L490 490" fill="none" stroke="#c25e69" stroke-width="12"/>'
body += rect(360,285,65,210,'#b7d9be','#427a56',28)
body += arrow(640,160,515,145)+text(650,175,'Microvilli',22)+text(650,205,'on cell surface',18)
body += arrow(650,275,575,285)+text(660,274,'Thin epithelium',21)
body += arrow(650,365,495,365,'#c25e69')+text(660,360,'Blood capillaries',21)
body += arrow(650,445,430,445,'#427a56')+text(660,438,'Central lacteal',21)
body += text(45,535,'Villus = tissue projection; microvilli = cell membrane projections',21)
save('villus-transport.svg','A villus: surface area and transport','A tissue-level villus has a thin epithelium, blood capillaries and a central lacteal. Microvilli are much smaller cell membrane projections on its surface. Glucose and amino acids chiefly enter blood; chylomicrons enter the lacteal. Simplified, not to scale.',body)
body = text(45,100,'P: physical dispersal (bile salts)',25)
body += rect(50,150,210,110,'#f9d692','#c29843',50)+text(80,213,'Large droplet',22)
body += arrow(270,205,400,205)
for x,y in [(440,150),(550,150),(440,220),(550,220)]:
    body += rect(x,y,70,45,'#f9d692','#c29843',20)
body += text(650,185,'Smaller droplets',23)+text(650,220,'More surface area',21)
body += text(45,330,'Q: chemical hydrolysis (lipase)',25)
body += rect(50,370,260,75,'#f9d692','#c29843',15)+text(78,415,'Triacylglycerol',23)
body += arrow(320,407,500,407)+text(355,385,'+ water',20)
body += rect(515,370,435,75,'#e0eee4','#82a58e',15)+text(535,415,'Fatty acids + monoglycerides',23)
body += text(45,515,'P changes droplet arrangement; Q changes molecular bonds.',22)
save('fat-digestion.svg','Two distinct steps in fat digestion','P shows bile salts dispersing a large fat droplet into smaller droplets without hydrolysing triacylglycerol bonds. Q shows lipase-catalysed hydrolysis producing chiefly fatty acids and monoglycerides. Bile is not a digestive enzyme.',body)
