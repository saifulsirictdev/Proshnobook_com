"""Combine the two self-contained reviews; no external dependencies or requests."""
from pathlib import Path
import re,sys
ROOT=Path(__file__).resolve().parents[2]
docs=ROOT/'docs/question-bank/ssc-physics'
parts=[(docs/f'chapter-{ch}-review.html').read_text() for ch in [5,6]]
style=re.search(r'<style>(.*?)</style>',parts[0],re.S).group(1)
text='<!doctype html><html lang="bn"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>পদার্থবিজ্ঞান — পঞ্চম ও ষষ্ঠ অধ্যায়: চিত্রসহ ৭৫০ খসড়া</title><style>'+style+'</style><nav><b>চিত্রসহ ৭৫০ প্রশ্নের রিভিউ</b> · <a href="#chapter-5">পঞ্চম অধ্যায় — ২০০/৮০/৫০</a> · <a href="#chapter-6">ষষ্ঠ অধ্যায় — ২৫০/১০০/৭০</a></nav>'
for ch,part in zip([5,6],parts):
 text+=f'<section id="chapter-{ch}">'+part.split('</style>',1)[1].rsplit('</html>',1)[0]+'</section>'
text+='</html>\n'
p=docs/'chapters-5-6-review.html'
if '--check' in sys.argv:assert p.read_text()==text,'Combined review stale'
else:p.write_text(text)
assert text.count('<article ')==750 and text.count('<svg ')==290
print('PASS combined offline review: 750 articles / 290 inline SVGs')
