"""Self-contained first-checkpoint review. Explicitly shows unfinished targets."""
from pathlib import Path
import json,html,re,base64,sys,hashlib
R=Path(__file__).resolve().parents[2];DOC=R/'docs/question-bank/ssc-chemistry';BANK=R/'content/question-bank/ssc/chemistry'
def image(p,alt):return '<img alt="'+html.escape(alt)+'" src="data:image/png;base64,'+base64.b64encode(p.read_bytes()).decode()+'">'
def text(s):
 def img(m):return image(R/'public/question-bank'/m[2],m[1])
 return re.sub(r'!\[([^\]]*)\]\(https://proshnobook.com/question-bank/([^)]*)\)',img,html.escape(s)).replace('\n','<br>')
parts=['''<!doctype html><html lang="bn"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>রসায়ন ১১–১২: প্রথম আংশিক খসড়া</title><style>body{font-family:system-ui,sans-serif;max-width:960px;margin:30px auto;padding:18px;background:#f3f6f8;color:#18333e;line-height:1.85}header,section,article{background:white;border:1px solid #d4e0e5;border-radius:12px;padding:24px;margin:18px 0}header{border-top:6px solid #a66c1d}h1{font-size:27px}h2{font-size:21px}h3{font-size:18px}img{max-width:100%;height:auto}small{color:#48616c}summary{cursor:pointer}table{border-collapse:collapse;width:100%}td,th{padding:10px;border:1px solid #ccd9df;text-align:left}.pending{color:#8b4e0b;font-weight:700}@media print{article{break-inside:avoid}}</style><header><h1>অধ্যায় ১১–১২: প্রথম আংশিক খসড়া</h1><p class="pending">চাহিদার পুরো পরিমাণ এখনো সম্পূর্ণ হয়নি। এই ফাইলে মোট১০৮টি খসড়া; আগের৬৬৪০টির নিবন্ধিত স্থানীয় সংগ্রহের সঙ্গে এখনো যোগ করা হয়নি।</p><table><tr><th>অধ্যায়</th><th>লক্ষ্য MCQ/CQ/SQ</th><th>এই খসড়ায়</th><th>আরও প্রয়োজন</th></tr><tr><td>১১—খনিজ সম্পদ: জীবাশ্ম</td><td>৭০০/২০০/১০০</td><td>৩৪/৭/১৩ =৫৪</td><td>৬৬৬/১৯৩/৮৭</td></tr><tr><td>১২—আমাদের জীবনে রসায়ন</td><td>৩৫০/৫০/৭০</td><td>৩৫/৬/১৩ =৫৪</td><td>৩১৫/৪৪/৫৭</td></tr></table><p>প্রতি অধ্যায়ে৯টি নির্বাচিত উৎস-প্রতিলিপি ও৪৫টি নিজস্ব মৌলিক বোর্ড-ধাঁচের অনুশীলনী। সব সমাধান নিজস্ব; শিক্ষক যাচাই বাকি। উৎস অনুসন্ধান সীমিত, সম্পূর্ণ প্রশ্নব্যাংক সংগ্রহের দাবি নয়। CQ১/২/৩/৪অনুশীলনের নম্বর, অফিসিয়াল রসায়ন বণ্টনের দাবি নয়।</p><p>মূল উদ্দীপকের৩টি চিত্র রাখা হয়েছে। কিছু উৎসে ভুল সমীকরণ/তথ্য, অনুপস্থিত চিত্র বা চিকিৎসাগতভাবে অনুচিত কাহিনি থাকায় সেই পুরো প্রশ্ন গণনায় নেই। উৎসের ভুল নীরবে বদলে সঠিক বোর্ড প্রশ্ন বলা হয়নি। তাত্ত্বিক গ্যাস/অ্যালকোহল/ব্লিচ/অম্লের রসায়ন ঘরোয়া পরীক্ষা বা খাদ্য/চিকিৎসার নির্দেশ নয়।</p><p>কোনো আমদানি, অনুমোদন, প্রকাশ বা ডিপ্লয় হয়নি। পরবর্তী কাজ: প্রয়োজনীয় আরও পরিচিত প্রশ্ন রচনা/সংগ্রহ, বিষয়ভিত্তিক যাচাই, তারপর পূর্ণসংখ্যার সংগ্রহের একীভবন।</p></header>''']
for ch in [11,12]:
 body=json.loads((BANK/f'chapter-{ch}-checkpoint/questions.json').read_text());v=json.loads((BANK/f'chapter-{ch}-checkpoint/validation.json').read_text());intake=json.loads((BANK/f'chapter-{ch}-source-intake.json').read_text())
 parts.append(f'<section><h2>{html.escape(body["topic"])} — আংশিক৫৪টি</h2><p>সম্পূর্ণ লক্ষ্য নয়। অবশিষ্ট MCQ/CQ/SQ: {v["remaining"]["MCQ"]}/{v["remaining"]["CQ"]}/{v["remaining"]["SQ"]}। উৎসের মূল পাতা নিচে আলাদা আছে।</p></section>')
 for q,m in zip(body['items'],v['ledger']):
  source=(m.get('observedBoard')or{}).get('shortTag','')
  if source:source+=' সাটে প্রদর্শিত; মূল বোর্ডপত্র যাচাই বাকি। '
  parts.append(f'<article><h3>{m["itemIndex"]}. {q["type"]}</h3><small>{html.escape(m["origin"]+" · "+source+q["page"])}</small><p>{text(q["text"])}</p>')
  if q['type']=='MCQ':parts.append('<ol type="A">'+''.join('<li>'+html.escape(a)+'</li>'for a in q['options'].values())+'</ol>')
  if q['type']=='CQ':parts.extend(f'<p><b>{p["label"]}.</b> {html.escape(p["question"])} ({p["marks"]})</p>'for p in q['parts'])
  parts.append('<details><summary>নিজস্ব নমুনা সমাধান—শিক্ষক যাচাই বাকি</summary>')
  if q['type']=='CQ':parts.extend(f'<p><b>{p["label"]}.</b> {html.escape(p["solution"])}</p>'for p in q['parts'])
  else:parts.append(('<b>উত্তর '+q['correct']+'</b><br>'if q['type']=='MCQ'else'')+html.escape(q['explanation']))
  parts.append('</details></article>')
 parts.append('<section><h2>উৎসের সমস্যা/বাদ দেওয়া প্রশ্ন</h2><ul>')
 for x in intake['excluded']:parts.append('<li>'+html.escape(str(x))+'</li>')
 parts.append('</ul><p>পূর্ণ পাতায় অন্যান্য বাদ দেওয়া প্রশ্নও দেখা যায়—সেগুলো উপরের গণনায় নয়। মূল পিক্সেল প্রমাণ হিসেবে রাখা, স্বীকৃত সমাধান বা ব্যবহারপরামর্শ নয়।</p>')
 for page in sorted({x['pdfPage']for x in intake['items']if x['source']=='textbook'}):parts.append(f'<details><summary>মূল পাঠ্যবই PDF{page}/মুদ্রিত{page-5}—পূর্ণ পাতা</summary>'+image(R/f'public/question-bank/ssc-chemistry-ch{ch}-source-v1/tb-page-{page}.png',f'Original exercise PDF{page}')+'</details>')
 parts.append('</section>')
parts.append('</html>\n');review=''.join(parts);p=DOC/'chapter-11-12-checkpoint-review.html'
if '--check'in sys.argv:assert p.read_text()==review
else:p.write_text(review)
print(json.dumps(dict(status='PARTIAL_NOT_TARGET_COMPLETION',articles=review.count('<article>'),images=review.count('<img '),sha256=hashlib.sha256(review.encode()).hexdigest()),indent=2))
