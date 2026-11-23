"""One offline main deliverable, with jump links and all inline diagrams/font."""
from pathlib import Path
import re,sys
ROOT=Path(__file__).resolve().parents[2];D=ROOT/'docs/question-bank/ssc-physics'
parts=[(D/f'chapter-{ch}-review.html').read_text() for ch in range(8,15)]
style=re.search(r'<style>(.*?)</style>',parts[0],re.S).group(1)
text='<!doctype html><html lang="bn"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>অধ্যায় ৮–১৪ — চিত্রসহ ৩২৯০ প্রশ্নের খসড়া</title><style>'+style+'nav{background:#eef6f3;padding:18px;border-radius:8px}nav a{display:inline-block;margin:5px 12px}button{padding:8px 14px;margin:5px;cursor:pointer}</style><h1>পদার্থবিজ্ঞান: বাকি ৭ অধ্যায়ের খসড়া</h1><nav><b>প্রতি অধ্যায়ে ২৫০ MCQ / ১২০ CQ / ১০০ SQ</b><p>মোট ৩২৯০ প্রশ্ন; ১৭২০টিতে SVG চিত্র। একই পরিবারের numeric variants আছে; শিক্ষক/পূর্ণ পাঠ্যসীমা যাচাই বাকি। কোনো import, approval, publication বা deploy হয়নি। উৎস আংশিক দেখা হয়েছে—সম্পূর্ণ চিত্র-coverage দাবি নয়।</p>'+''.join(f'<a href="#chapter-{ch}">অধ্যায় {ch}</a>' for ch in range(8,15))+'</nav><p>উত্তর ও CQ-এর চার অংশ দেখতে সংশ্লিষ্ট “উত্তর ও সমাধান” খুলুন। Print-এর আগে প্রয়োজনীয় উত্তর খুলুন। চিকিৎসা-পদার্থবিজ্ঞানের উদাহরণ রোগনির্ণয় বা dose recommendation নয়।</p>'
for ch,part in zip(range(8,15),parts):text+=f'<section id="chapter-{ch}">'+part.split('</style>',1)[1].rsplit('</html>',1)[0]+'</section>'
text+='</html>\n';p=D/'chapters-8-14-review.html'
if '--check' in sys.argv:assert p.read_text()==text,'Combined review stale'
else:p.write_text(text)
assert text.count('<article ')==3290 and text.count('<svg ')==1720
print('PASS combined offline review: 3290 articles / 1720 inline SVGs')
