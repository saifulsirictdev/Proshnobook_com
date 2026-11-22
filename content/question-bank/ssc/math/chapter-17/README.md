# SSC গণিত — ১৭শ অধ্যায়: পরিসংখ্যান

**সংখ্যাগত লক্ষ্য পূরণ; শিক্ষক-পর্যালোচনার DRAFT—অনুমোদিত বা লাইভ স্টক নয়।**

| ধরন | প্রশ্ন | মূল প্রশ্নে সারণি |
|---|---:|---:|
| MCQ | 300 | 224 |
| CQ | 200 | 149 |
| SQ | 100 | 70 |
| মোট | 600 | 443 |

প্রশ্ন ও সমাধান মিলিয়ে **৮৩৩টি native HTML সারণি**, সমাধানে **৮৩টি SVG লেখচিত্র**। সারণিকে screenshot/SVG করা হয়নি: Markdown pipe-table হিসেবে সম্পাদনাযোগ্য লেখা, বাস্তব MathText renderer-এ `<table>`/`thead`/`tbody`/সারি–কলামের heading ও প্রতিটি ঘরে 1px border। আরবি সংখ্যা ও decimal সীমা পরিষ্কারভাবে দেখানো হয়েছে; কাজের সারণিতে অকারণে অর্ধেক-ভগ্নাংশ না দেখিয়ে 25.5-এর মতো দশমিক দেখানো হয়।

## উৎস ও ছবির ব্যবহার

- **৪টি ২০২৪-লেবেলযুক্ত সংকলন-অভিযোজিত MCQ:** ঢাকা PDF1 Q2 (মধ্যক শ্রেণির পূর্ববর্তী সঞ্চিত f); রাজশাহী PDF11 Q15 (মধ্যমান থেকে আপাত উচ্চসীমা); কুমিল্লা PDF20 Q11 (বিচ্ছিন্ন চলক), Q12 (প্রচুরক শ্রেণির আপাত উচ্চসীমা)। মুদ্রিত পৃষ্ঠা=PDF+141। `3.-Math-Link-Board-142-311_Compressed-1.pdf` স্বাধীনভাবে authenticated official paper নয়। বিকল্পের ক্রম রক্ষিত, ব্যাখ্যায় অস্পষ্ট শর্ত স্পষ্ট।
- **ব্যবহারকারীর ছবির ৩টি অভিযোজিত CQ** প্রথম তিন CQ হিসেবে আছে। ছবি `Screenshot_2026-11-22-11-18-34-26_40deb401b9ffe8e1df2f1cc5ba480b12.jpg` প্রশ্নের কাঠামো/উপাত্তের reference; ছবির DB/MB 2025 badge-কে যাচাইকৃত board provenance করা হয়নি। মূল ছবি backup-এ পুনঃপ্রকাশ করা হয়নি।
- বাকি **৫৯৩টি original parameter record:** ২৯৬ MCQ, ১৯৭ CQ, ১০০ SQ। পরিবার সংখ্যা MCQ/CQ/SQ = **২০/২০/১০**; ৬০০টি ভিন্ন ধারণা নয়। কাছাকাছি পদ্ধতি/উপাত্তের parameter practice আছে।
- Source priority অনুযায়ী আগে পাওয়া board compilation-এর ঢাকা/রাজশাহী/কুমিল্লার পাতা দেখা হয়েছে। পূর্ণ বর্তমান NCTB অধ্যায় পড়া হয়নি, board search/syllabus coverage exhaustive নয়। নতুন ইন্টারনেট বা official 2025 board collection-এর দাবি নেই।
- apparent-limit convention-এ দেওয়া কিছু সংকলন-প্রচুরকের ফল প্রকৃত সীমায় ভিন্ন হতে পারে। সেগুলো নীরবে মেরামত করে exact-board seed করা হয়নি।

## গাণিতিক রীতি

1. শ্রেণিগুলো পূর্ণসংখ্যার অন্তর্ভুক্তিমূলক হলে প্রকৃত নিম্নসীমা = নিম্নসীমা−0.5 এবং প্রকৃত উচ্চসীমা = উচ্চসীমা+0.5। মধ্যমান দুই সীমার গড়, শ্রেণিব্যাপ্তি প্রকৃত সীমার পার্থক্য।
2. শ্রেণিবদ্ধ গড় মধ্যমান-প্রতিনিধিত্বভিত্তিক **আনুমানিক**। একই উপাত্তের raw mean অবিকল গড়; একে grouped estimate বলা হয় না।
3. শ্রেণিবদ্ধ মধ্যক/প্রচুরক standard linear interpolation-এর estimate; N/2, পূর্ববর্তী সঞ্চিত f, modal-neighbour differences ও প্রকৃত নিম্নসীমা সঠিকভাবে ব্যবহার করা হয়েছে। Raw median-এ সাজানো অবস্থান ও জোড় N-এ মাঝের দুই মানের গড়।
4. ব্যবহারকারীর দ্বিতীয় ছবির নম্বরগুলোতে 70–79 ও 80–89 শ্রেণির f সমান। সেখানে একক grouped-mode formula চাপানো হয়নি; প্রশ্নটি mean/ogive নিয়ে।
5. কম-থেকে অজিভ প্রথম প্রকৃত নিম্নসীমায় 0 থেকে, শেষ উচ্চসীমায় N-এ; বেশি-থেকে অজিভ N থেকে 0-এ। Polygon-এ দুই প্রান্তে অতিরিক্ত শ্রেণিমধ্যমানে 0। সমান-ব্যাপ্তির histogram-এ height=f, gap নেই; অসম ব্যাপ্তির ক্ষেত্রে density প্রয়োজন বলে ব্যাখ্যা আছে।
6. Graph-এর x-axis প্রথম data boundary/midpoint থেকে শুরু; তাকে 0 বলা হয়নি। Actual numeric scales/points/axis labels রক্ষিত; plot projection নয়।

## ছবির তিন CQ-এর মূল ফল

- CQ1: প্রদত্ত অন্য শ্রেণির আপাত নিম্নসীমা 60; সারণির আনুমানিক মধ্যক **44**; polygon-এর মাঝের বিন্দু (45.5,20)।
- CQ2: হাতির সংখ্যা বিচ্ছিন্ন চলক; 50–59,…,90–99-এ f=3,6,9,9,3; আনুমানিক গড় **75.5**; less-ogive শেষ বিন্দু (99.5,30)।
- CQ3: ছোট raw sample-এর মধ্যক **10.5**; সারণির আনুমানিক গড় **63.5**; polygon বন্ধের বিন্দু (48,0),(83,0)।

## Renderer/পরীক্ষা

- `lib/question-tables.ts`: bounded literal parser; 2–12 columns, 1–80 body rows, rectangular non-empty cells; arbitrary HTML/attributes/links evaluation নেই। Malformed tables raw text হিসেবেই থাকে।
- `components/MathText.tsx`: real bordered tables; print/mobile-fitting fixed layout; HTML escape অপরিবর্তিত। কেবল নির্দিষ্ট versioned `https://proshnobook.com/question-bank/ssc-math-ch17-v1/*.svg` reference-কে graph image করা যায়। অন্য URL/HTML execute নয়। ফলে Chapter/AutoModel answer rendering-এ statistics image recognition যোগ হয়েছে; অন্য অধ্যায়ের image integration gate সমাধান দাবি নয়।
- `lib/paper-answers.ts`: table-containing answer-কে line/equality splitting দিয়ে নষ্ট করা হয় না। English/non-table formatting অপরিবর্তিত রাখার regression আছে।
- Focused **৯/৯ PASS**: quota/importer/catalog/dedupe/provenance/CQ structure/KaTeX/bounded parser/security/table cells/answer preservation/assets।
- Independent verifier: ৪ board-key/value, ৩ user-reference, ৫৯৩ original record, **১,৭৮৮ exact response witnesses**, **৮৩ graph coordinates/hash checks**। Generator/helper import না করে পুনর্গণনা। বাংলা narrative/শিক্ষাগত মান/marks-depth-এর teacher approval নয়।
- Browser: 600 cards, 833 rectangular bordered tables, 83 inline graph; desktop1200/mobile390-এ সব table/cell width ও border পরীক্ষা, কোনো overflow/external request/page error/clipped graph label নেই।
- ৬টি representative CQ-এর A4 PDF proof আলাদা; পুরো ৬০০ প্রশ্নের production paper pagination/print certification নয়।

## ফাইল ও ব্যবহার

- `target-v1/{mcq-1,mcq-2,cq-1,cq-2,sq}.json`: 150/150/150/50/100 প্রশ্নের পাঁচটি strict importer slice; প্রতিটি ≤200 records এবং <750000 bytes।
- `target-v1/validation.json`, `targets-v1-manifest.json`, `board-seed-v1.json`: audit/source/hash; সরাসরি importer input নয়।
- `public/question-bank/ssc-math-ch17-v1/`: ৮৩ graph SVG (সমাধানে reference)।
- `docs/question-bank/ssc-math-ch17-illustrated-review.html`: বাস্তব MathText table-renderer-ভিত্তিক offline gallery, expandable answers, inline graph/Bengali/KaTeX font ও licenses।
- `docs/question-bank/ssc-math-ch17-table-print-proof.pdf`: ছয় CQ-এর A4 sample।
- `docs/question-bank/ssc-math-ch17-questions-v1-backup.json`: whole chapter **backup container**, direct importer input নয়; `importFiles[].payload` থেকে মূল slices নাও।
- `docs/question-bank/ssc-math-ch17-illustrated-v1-backup.zip`: প্রশ্ন, সমাধান, JSON, SVG, HTML, PDF, reports/README/licenses।
- `docs/question-bank/ssc-math-ch17-targets-v1-drive-backup.json`: Drive receipt/checksum match।

**কোনো real DB import, teacher approval বা deployment হয়নি।** Versioned production SVG URLs এখনো deployed/live-verified নয়। গ্যালারিতে graphs inline; live Chapter image availability/actual admin workflow/save/reopen/PDF এখনো পৃথক gate। বোর্ড/source display default-off policy অপরিবর্তিত; searchable source metadata আছে।

```sh
PYTHONPATH=.cache/math-validation python scripts/question-bank/build-ssc-math-ch17-targets.py --check
PYTHONPATH=.cache/math-validation python scripts/question-bank/verify-ssc-math-ch17-targets.py
node scripts/question-bank/build-ssc-math-ch17-review.cjs
node --test tests/ssc-math-ch17-targets.test.cjs
LD_LIBRARY_PATH=.cache/chromium-libs/lib node scripts/question-bank/check-ssc-math-ch17-review.cjs
python scripts/question-bank/package-ssc-math-geometry-backups.py 17
```

Development-only SymPy 1.14.0/Chromium/PyMuPDF caches snapshot-এর অংশ নয়। পুনঃব্যবহারের আগে স্বাধীন শিক্ষক দিয়ে প্রশ্ন, উত্তর, approximate/exact distinction, সারণি, graph ও CQ marks-depth review প্রয়োজন।
