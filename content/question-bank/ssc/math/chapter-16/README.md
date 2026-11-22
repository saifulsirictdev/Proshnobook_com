# ১৬শ অধ্যায়: পরিমিতি

**সংখ্যাগত লক্ষ্য পূরণ; শিক্ষক-পর্যালোচনার DRAFT—অনুমোদিত/লাইভ স্টক নয়।**

| ধরন | প্রশ্ন | চিত্রযুক্ত |
|---|---:|---:|
| MCQ | 150 | 150 |
| CQ | 50 | 50 |
| SQ | 70 | 70 |
| মোট | 270 | 270 |

২টি source-adapted MCQ: **কুমিল্লা PDF20 Q8; রাজশাহী PDF11 Q5**। সংকলন: `3.-Math-Link-Board-142-311_Compressed-1.pdf`, ২০২৪-লেবেলযুক্ত; মুদ্রিত পৃষ্ঠা=PDF+141। স্বাধীন official-paper authentication নয়; adaptation audit ও provenance রক্ষিত। বাকি ২৬৮টি original parameter variant; বোর্ড/NCTB-এর অবিকল নয়। Family count MCQ/CQ/SQ=১৫/১০/১৪; ২৭০টি ভিন্ন ধারণা নয়।

## পরিবার ও বিষয়সীমা

- MCQ: annulus, composite-solid, cone, cube, cuboid, cylinder, equilateral, hemisphere, heron, rectangle-path, rhombus-diagonals, sector, sphere, square-diagonal, trapezium.
- CQ: annulus, composite-solid, cone, cube, cuboid, cylinder, equilateral, hemisphere, heron, sphere.
- SQ: annulus, composite-solid, cone, cube, cuboid, cylinder, equilateral, hemisphere, heron, rectangle-path, rhombus-diagonals, sphere, square-diagonal, trapezium.

CQ-তে ক/খ/গ ২/৪/৪, অংশভিত্তিক সমাধান; SQ-তে উত্তর-সমাধান; MCQ-তে চার বিকল্প/key/ব্যাখ্যা। সব Bengali narrative/proof ও CQ marks-depth স্বাধীন শিক্ষককে দেখতে হবে। বর্তমান NCTB পূর্ণ অধ্যায় পড়া হয়নি, বোর্ড/কভারেজ exhaustive নয়।

জ্যামিতিক SVG schematic; মাপানুযায়ী নয়। Plane model-এ অভিন্ন scale-এ গাণিতিক সম্পর্ক আঁকা; solid diagram oblique/schematic projection, প্রক্ষেপিত রেখাকে প্রকৃত দৈর্ঘ্য বলা হয়নি। ১৫তম অধ্যায়ে সম্পাদ্যের ধাপ ও ক্ষেত্রফল-সমতার যুক্তি এবং ১৬তম অধ্যায়ে বক্রতল/সমগ্র পৃষ্ঠ/ভিতরের যুক্ত তলের পার্থক্য teacher review-এ বিশেষভাবে দেখুন।

## পরীক্ষা/ফাইল

- `target-v1/{mcq,cq,sq}.json`: ১৫০/৫০/৭০ প্রশ্নের তিন importer slice। Audit/manifest/board snapshot সরাসরি importer input নয়।
- `targets-v1-manifest.json`, `target-v1/validation.json`, `board-seed-v1.json`: item/source/model/asset audit। Written model-এর `responseExpressions` স্বাধীন verifier-এ তিনটি numeric response হিসেবে পুনর্গণিত; `exactChecks` ফাঁকা থাকলে সেটি proof check নয়।
- সম্মিলিত focused suite ৪৩/৪৩ PASS; প্রতি অধ্যায়ে ৮০৪ independent response witnesses (মোট ৪৮২৪), ১৪–১৬-তে ৮১০ geometry/hash checks। এগুলো শিক্ষক অনুমোদন নয়।
- `docs/question-bank/ssc-math-ch16-independent-check.json` ও `-browser-check.json`: model/browser reports।
- `docs/question-bank/ssc-math-ch16-illustrated-review.html`: offline gallery, প্রশ্ন-সমাধান/font/license embedded।
- `docs/question-bank/ssc-math-ch16-questions-v1-backup.json`: **backup container**, `importFiles[].payload`-এ মূল slices; সরাসরি import নয়।
- `docs/question-bank/ssc-math-ch16-illustrated-v1-backup.zip`: মূল JSON, gallery, SVG (যেখানে আছে), audits, checks ও licenses।
- `docs/question-bank/ssc-math-ch11-ch16-targets.md`: পূর্ণ সম্মিলিত scope, পরীক্ষা ও সীমা।
- `docs/question-bank/ssc-math-ch11-ch16-targets-v1-drive-backup.json`: Drive upload receipt/checksums।

**কোনো real DB write/import, teacher approval বা deployment হয়নি।** ১৪–১৬-এর production-target HTTPS SVG URL এখনও live-verified নয়। Offline gallery production editor/print/PDF পরীক্ষা নয়; সাধারণ Chapter image integration gate বাকি। বোর্ড/source display default-off policy অপরিবর্তিত। ১৭তম অধ্যায় পরিসংখ্যান এই কাজের বাইরে।

```sh
PYTHONPATH=.cache/math-validation python scripts/question-bank/build-ssc-math-ch11-ch16-targets.py 16 --check
PYTHONPATH=.cache/math-validation python scripts/question-bank/verify-ssc-math-ch11-ch16-targets.py
```
