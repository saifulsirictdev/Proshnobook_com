# ১১শ অধ্যায়: বীজগাণিতিক অনুপাত ও সমানুপাত

**সংখ্যাগত লক্ষ্য পূরণ; শিক্ষক-পর্যালোচনার DRAFT—অনুমোদিত/লাইভ স্টক নয়।**

| ধরন | প্রশ্ন | চিত্রযুক্ত |
|---|---:|---:|
| MCQ | 150 | 0 |
| CQ | 50 | 0 |
| SQ | 70 | 0 |
| মোট | 270 | 0 |

২টি source-adapted MCQ: **রাজশাহী PDF11 Q4; ঢাকা PDF1 Q18**। সংকলন: `3.-Math-Link-Board-142-311_Compressed-1.pdf`, ২০২৪-লেবেলযুক্ত; মুদ্রিত পৃষ্ঠা=PDF+141। স্বাধীন official-paper authentication নয়; adaptation audit ও provenance রক্ষিত। বাকি ২৬৮টি original parameter variant; বোর্ড/NCTB-এর অবিকল নয়। Family count MCQ/CQ/SQ=১৫/১০/১৪; ২৭০টি ভিন্ন ধারণা নয়।

## পরিবার ও বিষয়সীমা

- MCQ: chain-ratio, componendo, compound-ratio, continued-proportion, divide-difference, divide-total, dividendo, fourth-proportional, inverse-ratio, mean-proportional, mixture, ratio-change, ratio-squares, third-proportional, three-way-share.
- CQ: chain-ratio, componendo, compound-ratio, continued-proportion, divide-difference, divide-total, dividendo, fourth-proportional, mean-proportional, third-proportional.
- SQ: chain-ratio, componendo, compound-ratio, continued-proportion, divide-difference, divide-total, dividendo, fourth-proportional, inverse-ratio, mean-proportional, mixture, ratio-change, third-proportional, three-way-share.

CQ-তে ক/খ/গ ২/৪/৪, অংশভিত্তিক সমাধান; SQ-তে উত্তর-সমাধান; MCQ-তে চার বিকল্প/key/ব্যাখ্যা। সব Bengali narrative/proof ও CQ marks-depth স্বাধীন শিক্ষককে দেখতে হবে। বর্তমান NCTB পূর্ণ অধ্যায় পড়া হয়নি, বোর্ড/কভারেজ exhaustive নয়।

এই অধ্যায়ের বীজগাণিতিক প্রশ্নে অপ্রয়োজনীয় SVG যোগ করা হয়নি; চিত্রসংখ্যা শূন্য।

## পরীক্ষা/ফাইল

- `target-v1/{mcq,cq,sq}.json`: ১৫০/৫০/৭০ প্রশ্নের তিন importer slice। Audit/manifest/board snapshot সরাসরি importer input নয়।
- `targets-v1-manifest.json`, `target-v1/validation.json`, `board-seed-v1.json`: item/source/model/asset audit। Written model-এর `responseExpressions` স্বাধীন verifier-এ তিনটি numeric response হিসেবে পুনর্গণিত; `exactChecks` ফাঁকা থাকলে সেটি proof check নয়।
- সম্মিলিত focused suite ৪৩/৪৩ PASS; প্রতি অধ্যায়ে ৮০৪ independent response witnesses (মোট ৪৮২৪), ১৪–১৬-তে ৮১০ geometry/hash checks। এগুলো শিক্ষক অনুমোদন নয়।
- `docs/question-bank/ssc-math-ch11-independent-check.json` ও `-browser-check.json`: model/browser reports।
- `docs/question-bank/ssc-math-ch11-illustrated-review.html`: offline gallery, প্রশ্ন-সমাধান/font/license embedded।
- `docs/question-bank/ssc-math-ch11-questions-v1-backup.json`: **backup container**, `importFiles[].payload`-এ মূল slices; সরাসরি import নয়।
- `docs/question-bank/ssc-math-ch11-illustrated-v1-backup.zip`: মূল JSON, gallery, SVG (যেখানে আছে), audits, checks ও licenses।
- `docs/question-bank/ssc-math-ch11-ch16-targets.md`: পূর্ণ সম্মিলিত scope, পরীক্ষা ও সীমা।
- `docs/question-bank/ssc-math-ch11-ch16-targets-v1-drive-backup.json`: Drive upload receipt/checksums।

**কোনো real DB write/import, teacher approval বা deployment হয়নি।** ১৪–১৬-এর production-target HTTPS SVG URL এখনও live-verified নয়। Offline gallery production editor/print/PDF পরীক্ষা নয়; সাধারণ Chapter image integration gate বাকি। বোর্ড/source display default-off policy অপরিবর্তিত। ১৭তম অধ্যায় পরিসংখ্যান এই কাজের বাইরে।

```sh
PYTHONPATH=.cache/math-validation python scripts/question-bank/build-ssc-math-ch11-ch16-targets.py 11 --check
PYTHONPATH=.cache/math-validation python scripts/question-bank/verify-ssc-math-ch11-ch16-targets.py
```
