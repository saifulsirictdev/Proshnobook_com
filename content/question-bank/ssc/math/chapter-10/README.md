# SSC গণিত — ১০ম অধ্যায়: দূরত্ব ও উচ্চতা

**সংখ্যাগত লক্ষ্য পূরণ; শিক্ষক/সমাধান/চিত্র/কভারেজ পর্যালোচনার DRAFT।**

| ধরন | প্রশ্ন | চিত্রযুক্ত |
|---|---:|---:|
| MCQ | 150 | 150 |
| CQ | 120 | 120 |
| SQ | 50 | 50 |
| মোট | 320 | 320 |

প্রতি MCQ-তে চার বিকল্প/key/ব্যাখ্যা, CQ-তে ক/খ/গ ২/৪/৪ ও অংশভিত্তিক সমাধান, SQ-তে উত্তর। প্রতিটি SVG একই প্রশ্নের Markdown HTTPS reference-এ যুক্ত; অন্য প্রশ্নের চিত্রের ওপর নির্ভরশীল নয়। চিত্র schematic, মাপানুযায়ী নয়।

## বিষয়বস্তু ও মডেল

মিনার/দণ্ডের উচ্চতা, উন্নতি ও অবনতি কোণ, ছায়া, মই, ঘুড়ি, চোখের উচ্চতা, নৌকার অগ্রগতি, একই পাশে দুই পর্যবেক্ষণবিন্দু, বিপরীত পাশে দুই বিন্দু, ভিন্ন উচ্চতার দুই স্তম্ভ, ভাঙা গাছ। চিত্রে সমতল ভূমি/জলপৃষ্ঠ, উল্লম্ব রেখা, দৃষ্টিরেখা, সমান্তরাল অনুভূমিক, সমকোণ এবং প্রাসঙ্গিক কোণচিহ্ন আছে।

- উল্লেখ না থাকলে দৃষ্টিবিন্দু ভূমিসংলগ্ন; চোখের উচ্চতা থাকলে মোট উচ্চতায় তা যোগ করা হয়েছে।
- একই-পাশের station সমস্যায় দূরত্বের **বিয়োগ**, বিপরীত-পাশের সমস্যায় **যোগ**; বিন্দুর ক্রম লেখা আছে।
- অবনতি কোণ অনুভূমিকের সঙ্গে মাপা হয়েছে, উল্লম্বের সঙ্গে নয়।
- ঘুড়ির সুতা টানটান সরল, ভূমিসংলগ্ন হাত; বাঁক/বাতাসের প্রভাব উপেক্ষিত।
- ভাঙা গাছে মূল উচ্চতা = অবশিষ্ট উল্লম্ব অংশ + ভাঙা অংশ, মাটিতে বিস্তার যোগ নয়।
- এগুলো আদর্শ গণিত-মডেল; বাস্তব জরিপের calibration/measurement uncertainty অন্তর্ভুক্ত নয়।

## উৎস ও মৌলিকতার সীমা

- ২০২৪-লেবেলযুক্ত `3.-Math-Link-Board-142-311_Compressed-1.pdf` থেকে স্ক্যান দেখে **৬ adapted MCQ**: কুমিল্লা PDF20 Q2, সিলেট PDF49 Q10, দিনাজপুর PDF67 Q24, যশোর PDF29 Q24, বরিশাল PDF58 Q8, চট্টগ্রাম PDF39 Q28। Printed page = PDF+141। Source metadata রক্ষিত; independent authenticated official papers নয়।
- প্রচলিত সমতল ভূমি/লম্ব বস্তু/দৃষ্টিবিন্দুর মডেল গদ্যে স্পষ্ট করা হয়েছে, audit-এ অভিযোজনের নোট আছে। উৎসের অবিকল প্রশ্ন বলা হচ্ছে না। মূল বিকল্পের ক্রম বজায়।
- চট্টগ্রাম Q28-এ উৎসের native figure আছে: BC=10, AC=CD, ∠DCB=60° **উল্লম্ব CB-এর সঙ্গে**; CD=20, AB=30, key C। এটিকে ভূমির সঙ্গে ৬০° ধরে সমাধান করা হয়নি। সব SVG নতুন করে আঁকা/সহায়কভাবে যুক্ত; scan facsimile নয়।
- বাকি **৩১৪ original parameter variant**: ১৪৪ MCQ/১২০ CQ/৫০ SQ। Original MCQ/CQ/SQ family count **১২/১২/১০**। ৩২০টি স্বতন্ত্র ধারণা নয়; কিছু পরিবারে একই ত্রিকোণমিতিক সম্পর্ক ভিন্ন প্রয়োগে ব্যবহৃত। Original rows-এ board attribution নেই।
- পূর্ণ বর্তমান NCTB অধ্যায় পড়া হয়নি, board সংগ্রহ exhaustive নয়। সিলেট PDF49 Q9-এ ছায়ার সঙ্গে 'অবনতি' শব্দের অসামঞ্জস্য থাকায় সেটি exact-board seed হিসেবে ব্যবহার করা হয়নি।
- স্বাধীন শিক্ষক দিয়ে ভাষা, options, পরিস্থিতি, সমাধান ও diagram/chapter coverage review বাকি।

## ফাইল

- `target-v1/{mcq,cq,sq}.json`: ১৫০/১২০/৫০ item-এর তিন strict importer-compatible slice।
- `target-v1/validation.json`, `targets-v1-manifest.json`, `board-seed-v1.json`: audit, hashes ও source snapshot। Audit/manifest সরাসরি importer input নয়।
- `public/question-bank/ssc-math-ch10-v1/`: ৩২০টি SVG।
- `docs/question-bank/ssc-math-ch10-illustrated-review.html`: offline gallery, expandable answers, inline diagrams/Bengali/KaTeX fonts ও licenses।
- `docs/question-bank/ssc-math-ch10-questions-v1-backup.json`: whole-chapter **backup container**, সরাসরি importer input নয়; `importFiles[].payload`-এ মূল slices।
- `docs/question-bank/ssc-math-ch10-illustrated-v1-backup.zip`: মূল JSON, backup JSON, সব SVG, gallery, README, browser/independent checks ও font licenses।
- `docs/question-bank/ssc-math-ch10-targets-v1-drive-backup.json`: Drive upload receipt এবং checksum যাচাই।

## পরীক্ষা ও সীমা

Focused tests ১০/১০; SSC math/prepared-library/AutoModel/provenance regression ১১৬/১১৬; typecheck ও diff whitespace check PASS। Independent verifier ১৪৪ original MCQ, ৬ adapted key/value, ১৭০ written item/৩৪০ numeric witness এবং ৩২০ SVG coordinate/hash relationship পরীক্ষা করে। এগুলো প্রতিটি বাংলা narrative/সমাধান/শিক্ষাগত মানের independent teacher approval নয়।

Browser gallery 1200/390 width-এ ৩২০ cards/৩২০ diagram SVG, কোনো external request/page error/clipped diagram label/mobile overflow নেই; mobile-এ সমাধান খোলা রেখেও পরীক্ষা। এটি বাস্তব production editor/PDF পরীক্ষা নয়।

**কোনো real DB import, teacher approval বা deployment হয়নি।** JSON-এর versioned SVG HTTPS URL production-target; deploy/live availability verify হয়নি। সাধারণ Chapter preview-তে inline-image parsing-এর integration gate বাকি (বর্তমান gate AutoModel-সংশ্লিষ্ট)। তাই live Chapter editor/print image support সম্পন্ন দাবি নয়।

পরবর্তী ধাপ: independent teacher/solution/diagram/coverage review → assets deploy/live URL check → real Chapter/AutoModel editor/print/save/reopen test → explicit authorized admin import/approval।

## পুনরুৎপাদন

Development-only SymPy 1.14.0; cache snapshot-এর অংশ নয়।

```sh
PYTHONPATH=.cache/math-validation python scripts/question-bank/build-ssc-math-ch10-targets.py --check
PYTHONPATH=.cache/math-validation python scripts/question-bank/verify-ssc-math-ch10-targets.py
node --test tests/ssc-math-ch10-targets.test.cjs
node scripts/question-bank/build-ssc-math-geometry-review.cjs 10
LD_LIBRARY_PATH=.cache/chromium-libs/lib node scripts/question-bank/check-ssc-math-geometry-review.cjs 10
python scripts/question-bank/package-ssc-math-geometry-backups.py 10
```
