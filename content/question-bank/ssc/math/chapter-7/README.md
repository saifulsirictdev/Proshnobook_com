# SSC গণিত — অধ্যায় 7: ব্যবহারিক জ্যামিতি

**Status: সংখ্যাগত লক্ষ্য পূরণ; শিক্ষক/প্রমাণ/চিত্র-পর্যালোচনার DRAFT।**

| ধরন | প্রশ্ন | চিত্রযুক্ত |
|---|---:|---:|
| MCQ | 150 | 150 |
| CQ | 70 | 70 |
| SQ | 30 | 30 |
| মোট | 250 | 250 |

সব MCQ-তে চার বিকল্প, key ও ব্যাখ্যা; CQ-তে ক/খ/গ ২/৪/৪ এবং প্রতিটি অংশের সমাধান; SQ-তে উত্তর। চিত্র একই প্রশ্নের Markdown HTTPS reference-এ বাঁধা।

## উৎস ও মৌলিকতার সীমা

- ২০২৪-লেবেলযুক্ত বোর্ড-সংকলনের স্ক্যান দেখে 3টি অভিযোজিত MCQ; source file/page/question metadata রক্ষিত। স্বাধীনভাবে authenticated official board paper নয়। এগুলোর 0টিতে মূল উৎসেও চিত্র ছিল; সব SVG নতুন করে অঙ্কিত/সহায়কভাবে যুক্ত।
- বাকি 247টি **নিজস্ব parameter variant**, বোর্ড/পাঠ্যবইয়ের অবিকল প্রশ্ন নয়। 250টি স্বতন্ত্র ধারণা নয়। MCQ 21, CQ 14, SQ ১০টি পুনর্ব্যবহৃত question family; সুনির্দিষ্ট গণনা validation.json-এ।
- পূর্ণ বর্তমান NCTB অধ্যায় পড়া হয়নি; সম্পূর্ণ সিলেবাস বা exhaustive board coverage দাবি করা হচ্ছে না।
- মূল seed আলাদা snapshot; registry-তে seed দ্বিতীয়বার যুক্ত নয়।

## ফাইল

- `targets-v1-manifest.json`: counts, hashes, data/validation paths।
- `target-v1/*.json`: ১৫০ বা কম item-এর strict importer-compatible slices; validation আলাদা audit, importer input নয়।
- `board-seed-v1.json`: সংকলন থেকে অভিযোজিত প্রশ্নগুলোর snapshot।
- `public/question-bank/ssc-math-ch7-v1/`: 250টি versioned SVG।
- `docs/question-bank/ssc-math-ch7-illustrated-review.html`: offline gallery, inline SVG/MathML/বাংলা font; সমাধান খোলা যায়।
- `docs/question-bank/ssc-math-ch7-questions-v1-backup.json`: whole-chapter JSON backup container; সরাসরি importer input নয়, `importFiles[].payload` বের করে মূল filename অনুযায়ী importer-এ দিতে হবে।
- `docs/question-bank/ssc-math-ch7-illustrated-v1-backup.zip`: মূল JSON slices, সব SVG, gallery এবং review records।

## যাচাই ও প্রকাশের বাধা

Strict catalog/importer, unique stems (image URL বাদেও), source/original separation, CQ parts, strict KaTeX, item/asset hash bindings এবং AutoModel row classification tested। Independent verifier arithmetic ও coordinate witnesses পরীক্ষা করে, প্রতিটি বাংলা proof/নির্মাণের শিক্ষাগত যথার্থতা নয়। Offline browser gallery desktop 1200/mobile 390 width-এ পরীক্ষা হয়েছে; production editor/PDF নয়।

**কোনো real DB import, teacher approval বা deployment হয়নি।** JSON-এর production-target SVG URL এখনো live নয়। সাধারণ Chapter preview-তে inline image parsing-এর বাকি integration gate রয়েছে; AutoModel-সঙ্গত row classification দিয়ে real editor/print usability প্রমাণ হয় না।

পরবর্তী gate: স্বাধীন শিক্ষক দিয়ে ভাষা, options, constructions/proofs, diagram semantics ও chapter coverage review → assets deployment/live URL check → real Chapter/AutoModel editor/print/save/reopen পরীক্ষা → explicit admin import/approval।

## পুনরুৎপাদন

Development-only SymPy 1.14.0 (runtime dependency নয়):

```sh
PYTHONPATH=.cache/math-validation python scripts/question-bank/build-ssc-math-ch7-targets.py --check
PYTHONPATH=.cache/math-validation python scripts/question-bank/verify-ssc-math-ch7-ch8-targets.py
node --test tests/ssc-math-ch7-ch8-targets.test.cjs
node scripts/question-bank/build-ssc-math-geometry-review.cjs 7
LD_LIBRARY_PATH=.cache/chromium-libs/lib node scripts/question-bank/check-ssc-math-geometry-review.cjs 7
```

ক্যাশ ফোল্ডার snapshot-এর অংশ নয়; প্রয়োজনে dev packages পুনরায় setup করতে হবে।
