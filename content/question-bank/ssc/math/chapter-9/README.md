# SSC গণিত — ৯ম অধ্যায়: ত্রিকোণমিতিক অনুপাত

**সংখ্যাগত লক্ষ্য পূরণ; শিক্ষক/সমাধান/চিত্র/কভারেজ পর্যালোচনার DRAFT।**

| ধরন | প্রশ্ন | চিত্রযুক্ত |
|---|---:|---:|
| MCQ | 250 | 250 |
| CQ | 150 | 150 |
| SQ | 70 | 70 |
| মোট | 470 | 470 |

প্রতিটি MCQ-তে চার বিকল্প/key/ব্যাখ্যা; CQ-তে ক/খ/গ ২/৪/৪ ও অংশভিত্তিক সমাধান; SQ-তে উত্তর আছে। চিত্র একই প্রশ্নের Markdown HTTPS reference-এ বাঁধা, অন্য প্রশ্নের চিত্রের ওপর নির্ভরশীল নয়। সব SVG মাপানুযায়ী নয়।

## পরিসর

সমকোণী ত্রিভুজে reference angle-এর বিপরীত/সন্নিহিত/অতিভুজ শনাক্তকরণ; ছয় অনুপাত; পিথাগোরাস; এক অনুপাত থেকে অন্য অনুপাত; বিপরীত ও পূরক অনুপাত; ০°,৩০°,৪৫°,৬০°,৯০°-এর ব্যবহৃত বিশেষ মান; ত্রিকোণমিতিক পরিচিতি; sec+tan/cosec+cot থেকে মান; sin+cos ও tan+cot-ভিত্তিক সমমিত রাশি। পূর্ণ বর্তমান NCTB অধ্যায় পাওয়া/পড়া হয়নি, তাই পূর্ণ পাঠ্যবই/সিলেবাস coverage দাবি নয়। প্রান্তিক ০°/৯০° মানের প্রশ্নে ত্রিভুজটি শুধু সূক্ষ্মকোণের reference; সেটিকে degenerate triangle-এর মাপ হিসেবে ব্যবহার করা হয়নি।

## উৎস ও মৌলিকতার সীমা

- ২০২৪-লেবেলযুক্ত সংকলনের ঢাকা PDF1 Q9/11/20; সিলেট PDF49 Q1; দিনাজপুর PDF67 Q21/22; যশোর PDF29 Q5/25; ময়মনসিংহ PDF77 Q14/16 — মোট **১০ adapted MCQ**। Printed page = PDF page +141। স্ক্যান ও ছোট বিকল্প পুনরায় দেখে নেওয়া হয়েছে; compilation independently authenticated official board paper নয়।
- ঢাকা Q11, যশোর Q5/Q25 ও ময়মনসিংহ Q16-এ **সূক্ষ্মকোণের শর্ত স্পষ্ট করে যোগ করা হয়েছে**; audit-এ `explicitAcuteDomainAdded=true`। এগুলো শর্তযুক্ত অভিযোজন, উৎসের অবিকল প্রশ্ন নয়। ঋণাত্মক quadrant-এ একই sin মান দিয়ে cot-এর চিহ্ন বদলাতে পারে; sqrt(sin²θ) সাধারণভাবে |sinθ|। সিলেট Q1-এ মূল রাশির সংজ্ঞার sinθ≠0 শর্ত স্পষ্ট করা হয়েছে।
- দিনাজপুরের ২টি প্রশ্নে মূল উৎসে চিত্র ছিল। সব SVG পুনরঙ্কিত/সহায়কভাবে যোগ করা; scan-এর অনুলিপি নয়।
- বাকি **৪৬০টি নিজস্ব parameter variant**: ২৪০ MCQ/১৫০ CQ/৭০ SQ। Original MCQ/CQ/SQ family **২০/১৫/১০**; ৪৭০টি স্বতন্ত্র ধারণা নয়। Original rows-এ board attribution নেই। `board-seed-v1.json` snapshot, registry-তে দ্বিতীয়বার যুক্ত নয়।
- source search exhaustive নয়; স্বাধীন শিক্ষক দিয়ে ভাষা, বিকল্প, অনুপাত, proof, diagram semantics ও coverage review বাকি।

## ফাইল ও ব্যাকআপ

- `target-v1/mcq-1.json`, `mcq-2.json`, `cq.json`, `sq.json`: চারটি strict importer-compatible slice, প্রতিটিতে ≤150 item।
- `target-v1/validation.json`: audit/চিত্র/পারিবারিক গণনা/সীমা; importer input নয়।
- `targets-v1-manifest.json`: paths, counts, byte sizes ও SHA256।
- `board-seed-v1.json`: ১০ source-adapted MCQ snapshot।
- `public/question-bank/ssc-math-ch9-v1/`: ৪৭০ SVG।
- `docs/question-bank/ssc-math-ch9-illustrated-review.html`: offline gallery, inline SVG, Bengali ও KaTeX fonts; উত্তর খোলা যায়। Greek-rich formulas-এ স্থানীয় MathML font-এর ওপর নির্ভর না করে embedded KaTeX HTML+MathML ব্যবহার করা হয়েছে।
- `docs/question-bank/ssc-math-ch9-questions-v1-backup.json`: whole-chapter backup container; সরাসরি importer input নয়। `importFiles[].payload` বের করে মূল filename অনুযায়ী strict importer-এ ব্যবহার করতে হয়।
- `docs/question-bank/ssc-math-ch9-illustrated-v1-backup.zip`: মূল JSON slices, backup JSON, সব SVG, offline HTML, README, independent/browser checks ও বাংলা/KaTeX font license।

## পরীক্ষার সীমা ও প্রকাশের বাধা

Strict importer/catalog, target counts, unique stems (image URL বাদেও), source separation, CQ অংশ/সমাধান, strict KaTeX, hash bindings ও AutoModel classification tested। Independent verifier original MCQ, source answers, written numeric witnesses, six symbolic identities ও right-triangle coordinate সম্পর্ক পরীক্ষা করে; প্রতিটি বাংলা proof/ভাষা বা শিক্ষাগত মান certified করে না। Offline browser review production editor/PDF usability পরীক্ষা নয়।

**কোনো real DB import, শিক্ষক অনুমোদন বা deployment হয়নি।** JSON-এর versioned production-target SVG URL live নয়/verify হয়নি। সাধারণ Chapter preview-তে inline-image parsing-এর বাকি integration gate আছে; বর্তমানে তা AutoModel-সংশ্লিষ্ট। তাই Chapter editor/print-এ ছবির পূর্ণ সমর্থন দাবি করা হচ্ছে না।

পরবর্তী gate: independent teacher/solution/diagram/coverage review → assets deployment/live URL check → real Chapter/AutoModel editor/print/save/reopen check → explicit authorized admin import/approval।

## পুনরুৎপাদন

Development-only SymPy 1.14.0; Node dependencies repository অনুযায়ী। Cache persisted snapshot-এর অংশ নয়।

```sh
PYTHONPATH=.cache/math-validation python scripts/question-bank/build-ssc-math-ch9-targets.py --check
PYTHONPATH=.cache/math-validation python scripts/question-bank/verify-ssc-math-ch9-targets.py
node --test tests/ssc-math-ch9-targets.test.cjs
node scripts/question-bank/build-ssc-math-geometry-review.cjs 9
LD_LIBRARY_PATH=.cache/chromium-libs/lib node scripts/question-bank/check-ssc-math-geometry-review.cjs 9
python scripts/question-bank/package-ssc-math-geometry-backups.py 9
```
