# সংশোধিত পূর্ণ সেট — restart-r1 full600

**পুনর্গঠন সম্পূর্ণ: ৩০০ MCQ + ২০০ CQ + ১০০ SQ = ৬০০।**
প্রথম ৩০টি এর অন্তর্ভুক্ত; পুরোনো ৬০০ + নতুন ৩০/৫৭০ যোগ করে মোট বাড়ানো হয়নি।
এই ফোল্ডারটি নতুন পূর্ণ প্রার্থী; পাশের `batch01-*` ও `progress.json` ঐতিহাসিক প্রথম চেকপয়েন্ট, বর্তমান মোট নয়।

## আমদানিযোগ্য পাঁচটি ফাইল

| ফাইল | প্রশ্ন | ধরন |
| --- | --- | --- |
| mcq-1.json | 150 | MCQ |
| mcq-2.json | 150 | MCQ |
| cq-1.json | 100 | CQ |
| cq-2.json | 100 | CQ |
| sq.json | 100 | SQ |

নির্বাচন: `Class 9` → `গণিত` → `১৭শ অধ্যায়: পরিসংখ্যান`।
পাঁচটিই আসল strict importer দিয়ে পরীক্ষা করা। সারণি plain Markdown; ৫৭টি অঙ্কিত SVG-এর পাশাপাশি স্থানাঙ্ক/কাজের সারণিও আছে।
`checks.json`, `manifest.json` বা ZIP প্রশ্নের importer-এ দেবেন না। পাঁচটি payload ছাড়া এগুলো audit/backup evidence।

## কী সংশোধিত

- সব পুরোনো slot-এর সঙ্গে নতুন প্রশ্নের ১:১ mapping এবং উভয়ের hash: `checks.json`; একটি পুরোনো সম্পূর্ণ payload-ও চূড়ান্ত প্রশ্ন হিসেবে অপরিবর্তিত রাখা হয়নি।
- ২৯টি নতুন MCQ দক্ষতা-পরিবারে সর্বোচ্চ ১০টি করে variant; প্রথম ১০টি হাতে বাছাই করা। Distractor কারণ সংরক্ষিত; নির্বিচার ±১/±২ option generator নয়। অনুমিত সময় ৪৫/৭৫ সেকেন্ড, পরীক্ষার্থীর timed trial নয়।
- SQ-তে ৩০টি ছোট দক্ষতার ৩টি করে নতুন variant এবং প্রথম ১০টি; পূর্ণ grouped mean/median table বা অঙ্কন চাপানো হয়নি। মূল উদ্দেশ্য ২ নম্বরের ছোট কাজ।
- CQ-তে ক–খ–গ ২–৪–৪; গড়/মধ্যক/প্রচুরক, frequency recovery, অজানা frequency, raw data, চার ধরনের লেখচিত্র, ভুল রেকর্ড সংশোধন, তুলনা, গড়ের সম্ভাব্য সীমা ও রূপান্তরের যুক্তি আছে। চার নম্বরের অংশকে শুধু মোট বা শ্রেণি শনাক্তকরণ করা হয়নি।
- একই দক্ষতার সংখ্যাভিত্তিক variant আছে। `families` গণনা skill-template inventory; ৬০০টি স্বতন্ত্র গাণিতিক ধারণা বা ৬০০টি প্রমাণিত বোর্ড প্রশ্ন নয়।
- ৬৮টি source intake task থেকে প্রাসঙ্গিক task-style reference, নিজস্ব numeric exercises এবং বিদ্যমান সম্পূর্ণ dataset ব্যবহার। অনুপস্থিত আসল সারণি অনুমান করে উদ্ধার বা board-authentication করা হয়নি।
- পুরোনো `target-v1` ও আগের চেকপয়েন্ট অক্ষত। অন্য অধ্যায়ের প্রশ্ন/ওয়েবসাইটের unrelated কাজ স্পর্শ করা হয়নি।

## যাচাই ও সীমা

```bash
python scripts/question-bank/complete-statistics-r1.py
python -m unittest discover -s tests -p 'test_statistics*.py' -v
node --test tests/statistics-restart-r1.test.cjs tests/statistics-full600.test.cjs
```

মোট ১৭টি Python + ৭টি Node পরীক্ষা; full600-এ ৬০০ distinct importer ID, ৪৫৩ rendered table block, ৫৭ linked SVG।
Exact rational arithmetic, MCQ key/ভুল বিকল্পের কারণ, short-answer ফল, lineage, CQ নম্বর, chart-coordinate-to-SVG pixel mapping ও আসল renderer পরীক্ষা করা হয়েছে।
Generator পুনরায় চালালে একই bytes পাওয়া যায়। পরীক্ষা স্বাধীন শিক্ষক প্রত্যয়ন, বাস্তব পরীক্ষার্থীর সময় মাপা বা মোবাইল/print visual QA নয়।

## ব্যাকআপ ও অনুমোদন আলাদা

এই সেটের versioned Drive checkpoint-এর নাম/hash/আলাদা metadata যাচাই `backup-receipt.json`-এ এবং GitHub verification আলাদা receipt-এ থাকবে। Receipt ছাড়া remote backup সম্পূর্ণ দাবি নয়।
মূল upload `math.txt`, original payload/validation/SVG, নতুন payload/checks/graphs, generator/tests এবং offline review পূর্ণ ZIP-এ থাকে। প্রতিটি entry-এর SHA256 manifest ও স্থানীয় byte-read পরীক্ষা থাকে।

**লাইভ DB import/Approved/Published: এই ফোল্ডার তৈরি বা পরীক্ষা চালিয়ে কোনোটিই হয় না।**
Parse শুধু যাচাই করে, Save Pending ও approval আলাদা থাকে। পুরোনো prepared catalog এখনো `target-v1` দেখায়—নতুন রিভিশন সেভ করতে উপরোক্ত পাঁচটি JSON-ই ব্যবহার করতে হবে। পুরোনো catalog থেকে অপরিবর্তিত সেট অনুমোদন করা এই কাজ নয়।

`scripts/question-bank/release-ssc-math.cjs` দিয়ে এই অধ্যায় release করবেন না: সেটি পুরো ৫৭৫০ গণিত প্রশ্নের পুরোনো release task।
পূর্ণ নতুন সেট অনুমোদনের owner intent পূর্বেই আছে; আবার permission লাগবে না। কিন্তু নিরাপদ chapter17-only DB snapshot/release এবং ৫৭টি নতুন asset-এর live availability যাচাই ছাড়া প্রকাশ সফল বলা যাবে না। এই রান সেই production পরিবর্তন করেনি।
