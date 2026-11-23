"""Combine deterministic self-contained chapter review files; no remote resources."""
from chemistry_final_common import *
a=(DOC/'chapter-11-review.html').read_text();b=(DOC/'chapter-12-review.html').read_text()
a=a.replace('<title>রসায়ন অধ্যায়11 — খসড়া</title>','<title>রসায়ন অধ্যায়১১–১২ —১৪৭০খসড়া</title>');s=a.removesuffix('</html>\n')+b[b.index('<header>'):]
assert s.count('<article>')==1470
save(DOC/'chapter-11-12-review.html',s)
print('1470 articles: complete offline draft review')
