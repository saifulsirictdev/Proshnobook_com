# SSC গণিত — ৬ষ্ঠ অধ্যায়: রেখা, কোণ ও ত্রিভুজ

**v1: সংখ্যাগত লক্ষ্য পূরণ; চিত্র, প্রমাণ ও শিক্ষক-পর্যালোচনাধীন খসড়া।** ২০২৬-১১-২০। বাস্তব ডেটাবেস ইমপোর্ট/অনুমোদন বা ডিপ্লয় করা হয়নি।

## প্রশ্ন, সমাধান ও চিত্র

| ধরন | লক্ষ্য ও প্রস্তুত | চিত্রসহ | সংকলন-ভিত্তিক অভিযোজিত | নিজস্ব ভ্যারিয়েন্ট |
|---|---:|---:|---:|---:|
| MCQ | ১৫০ | **১৪৯** | ১০ | ১৪০ |
| CQ | ৫০ | ৫০ | ০ | ৫০ |
| SQ | ৩০ | ৩০ | ০ | ৩০ |
| **মোট** | **২৩০** | **২২৯** | **১০** | **২২০** |

সব প্রশ্নে উত্তর/সমাধান আছে। প্রত্যেক CQ-তে ক/খ/গ অংশে ২/৪/৪ নম্বর ও পৃথক সমাধান আছে। নিজস্ব অংশে ২০টি MCQ পরিবারে সাতটি করে, ১০টি CQ পরিবারে পাঁচটি করে এবং ১০টি SQ পরিবারে তিনটি করে ভ্যারিয়েন্ট। **এটি ২৩০টি স্বতন্ত্র ধারণা বা অধ্যায়ের পূর্ণাঙ্গ বোর্ড/পাঠ্যবই-কভারেজ নয়।**

বিষয়: সন্নিহিত সরলকোণ, বিপ্রতীপ/পূরক/সম্পূরক কোণ, বিন্দুর চারপাশের কোণ, সমান্তরাল রেখা ও ছেদক, ত্রিভুজের কোণসমষ্টি/বহিঃকোণ, সমদ্বিবাহু ও সমবাহু ত্রিভুজ, কোণসমদ্বিখণ্ডক ও অন্তঃকেন্দ্র, সর্বসমতার SAS/SSS যুক্তি, মধ্যমা/লম্বদ্বিখণ্ডক এবং বাহুর অসমতা।

## চিত্রসহ এখনই দেখার ফাইল

- [অফলাইন রিভিউ HTML](https://drive.google.com/file/d/1Byr6t7qZVpGa0oXXQ1kfKzeSWfCX9vw_/view) — **ডাউনলোড করে আধুনিক ব্রাউজারে খুলুন**। ২৩০টি প্রশ্ন, সমাধান খোলার ব্যবস্থা, ২২৯টি SVG ও বাংলা ফন্ট একই ফাইলে সংযুক্ত; ইন্টারনেট লাগে না। Drive নিজে HTML চালিয়ে preview নাও দেখাতে পারে।
- [সম্পূর্ণ চিত্রসহ ZIP ব্যাকআপ](https://drive.google.com/file/d/1ZJm3bgP0fUNZphvph_BTA9hy680TfI1J/view) — পাঁচটি JSON, ২২৯টি পৃথক SVG, অফলাইন HTML, README, browser-check ফল ও font license।

**গুরুত্বপূর্ণ প্রকাশ-শর্ত:** JSON-এ `https://proshnobook.com/question-bank/ssc-math-ch6-v1/*.svg` ফাইলের সংস্করণভিত্তিক ঠিকানা আছে। সংশ্লিষ্ট SVG ফাইলগুলো রিপোজিটরি ও ZIP-এ প্রস্তুত, কিন্তু **সাইটে এখনো deploy হয়নি এবং live URL পরীক্ষা হয়নি**। তাই JSON একা ইমপোর্ট করে লাইভ চিত্র চলবে ধরে নেওয়া যাবে না। প্রথমে assets deploy, সব URL-এর availability এবং প্রকৃত editor/print workflow যাচাই করতে হবে। এর আগে ছবি দেখতে bundled offline HTML ব্যবহার করুন।

## আলাদা JSON ব্যাকআপ

1. [১৫০ MCQ ও উত্তর](https://drive.google.com/file/d/1074juOAA_4GPyNfIxPPFB6eJMjoJxwyG/view)
2. [৫০ CQ + ৩০ SQ ও সমাধান](https://drive.google.com/file/d/1JeY6ysn5tiwh_AAND8Jn7R-IvsdOzDhq/view)
3. [উৎস, প্রশ্ন/চিত্রের হ্যাশ ও যাচাই](https://drive.google.com/file/d/1tG0JgZMtrcs0Hd2l3aoZ36hSaOJqzRPl/view)
4. [ফাইল ম্যানিফেস্ট](https://drive.google.com/file/d/13lLUJt72TBPW2VG0608SKbkAtoLSC3L5/view)
5. [১০টি উৎস-অভিযোজিত প্রশ্নের archival subset](https://drive.google.com/file/d/11YtiHREUZ4nRJyZF4b-UoWK_xRZsz8eK/view) — MCQ ফাইলেই অন্তর্ভুক্ত; দ্বিতীয়বার ইমপোর্ট নয়।

সাতটি আপলোড সফল; Drive-প্রদত্ত MD5 ও ফাইলের আকার স্থানীয় bytes-এর সঙ্গে মিলেছে। রসিদ: `docs/question-bank/ssc-math-ch6-targets-v1-drive-backup.json`। আগের অধ্যায়গুলোর ব্যাকআপ অপরিবর্তিত।

## উৎসের প্রশ্ন ও চিত্রের পরিচয়

উৎস: `3.-Math-Link-Board-142-311_Compressed-1.pdf`। SHA256: `ef88ec3c42fa52f407c39f1b978fa0494a695bac7d2b51a7c3921afa49a46111`। পাওয়া আটটি বোর্ড-পৃষ্ঠার ছবিতে অধ্যায়-সংশ্লিষ্ট প্রশ্ন খোঁজা হয়েছে। নিচের দশটির গাণিতিক তথ্য/বিকল্পের ক্রম রেখে যৌথ উদ্দীপক inline করা এবং চিত্র পুনরায় আঁকা/সহায়ক চিত্র যোগ করা হয়েছে। **এগুলো scan/facsimile বা দশটি অবিকল বোর্ড প্রতিলিপি নয়।** বোর্ড/বছর সংকলনের শিরোনাম থেকে; স্বাধীনভাবে authenticated official মূল প্রশ্নপত্র দাবি করা হচ্ছে না।

| সংকলনের পরিচয় | PDF পৃষ্ঠা | প্রশ্ন | উত্তর | উৎসে মূল চিত্র ছিল? |
|---|---:|---:|---|---|
| কুমিল্লা ২০২৪ | ২০ | ২৪ | C: ৯০° | হ্যাঁ |
| যশোর ২০২৪ | ২৯ | ১৮ | D: ৫৫° | হ্যাঁ |
| যশোর ২০২৪ | ২৯ | ১৯ | C: ১২৫° | হ্যাঁ, একই উদ্দীপক |
| বরিশাল ২০২৪ | ৫৮ | ২৭ | A: ৫৫° | হ্যাঁ |
| ময়মনসিংহ ২০২৪ | ৭৭ | ৯ | B: ১১০° | হ্যাঁ |
| দিনাজপুর ২০২৪ | ৬৭ | ১২ | C: ১১৫° | না; সহায়ক চিত্র যুক্ত |
| রাজশাহী ২০২৪ | ১১ | ৩ | A: ৫/২ | না; সহায়ক চিত্র যুক্ত |
| সিলেট ২০২৪ | ৪৯ | ৬ | A: ৫√৩ সেমি | না; সহায়ক চিত্র যুক্ত |
| সিলেট ২০২৪ | ৪৯ | ৭ | C: ৩টি উপাত্ত | না; এখানে চিত্র নেই |
| ঢাকা ২০২৪ | ১ | ৫ | A: ১০৮° | না; সহায়ক চিত্র যুক্ত |

অর্থাৎ **মূল উৎসের চিত্র ছিল ৫টি প্রশ্নে; উৎস-অভিযোজিত বর্তমান প্রশ্নে চিত্র ৯টি**। বাকি নিজস্ব ২২০টি প্রশ্নে সহায়ক চিত্র আছে। **১৪৯টি চিত্রসহ MCQ মানে ১৪৯টি বোর্ড প্রশ্ন নয়।**

চিত্রগুলো SVG-তে নতুন করে তৈরি, স্কেলের দাবি নেই। শীর্ষবিন্দু/বাহু/সমান্তরাল রেখার চিহ্ন ও প্রয়োজনীয় মান প্রশ্নের সঙ্গে একই রেকর্ডে রাখা হয়েছে; বাইরের উদ্দীপক বা আগের প্রশ্নের চিত্রের উপর নির্ভরতা নেই। কিছু প্রমাণে পরের অংশে পরিচয় করানো সহায়ক বিন্দু মানসিকভাবে/আলাদা করে বসাতে হবে; সব auxiliary construction চিত্রে আঁকা নেই। স্বাধীন শিক্ষককে প্রতিটি প্রমাণ ও চিত্রের শিক্ষাগত উপযোগিতা পরীক্ষা করতে হবে।

## যাচাই ও সীমাবদ্ধতা

- বিদ্যমান কঠোর ক্যাটালগে দুই ব্যাচ: ১৫০ MCQ, ৮০ লিখিত। প্রতি ব্যাচ সর্বোচ্চ ২০০ প্রশ্ন/৭৫০,০০০ বাইটের সীমা অপরিবর্তিত। ক্যাটালগ: `Class 9` → `গণিত` → `৬ষ্ঠ অধ্যায়: রেখা, কোণ ও ত্রিভুজ`।
- ২৩০টি normalized stem অনন্য; MCQ-তে চারটি স্বতন্ত্র বিকল্প ও বৈধ উত্তর। CQ অংশের ক্রম/মানবণ্টন ও সমাধান সম্পূর্ণ।
- জেনারেটর না চালিয়ে পৃথক verifier প্রকাশিত JSON থেকে ১৪০টি নিজস্ব ও ১০টি উৎস-অভিযোজিত MCQ-এর উত্তর পুনর্গণনা করেছে; লিখিত ৮০ প্রশ্নের ৯৫টি সংরক্ষিত numeric witness মিলেছে। **এগুলো প্রত্যেক বর্ণনামূলক proof step-এর স্বাধীন যাচাই নয়।**
- ২২৯টি SVG-এর উপস্থিতি, hash, XML structure, label এবং script/event/external-content অনুপস্থিতি পরীক্ষা পাস। ২৩০টি file/item/hash binding পরীক্ষা পাস।
- Offline HTML-এ ২৩০টি প্রশ্ন ও ২২৯টি inline SVG ব্রাউজারে লোড হয়েছে; ১২০০px ডেস্কটপ এবং ৩৯০px মোবাইল পরীক্ষা। external request/page error/SVG text clipping/mobile overflow পাওয়া যায়নি। দুটি নির্বাচিত source/original viewport হাতে দেখাও হয়েছে। **এটি deployed editor/PDF/print workflow-এর প্রমাণ নয়; text overlap-এর exhaustive semantic পরীক্ষা নয়।** ফল: `docs/question-bank/ssc-math-ch6-browser-check.json`।
- Strict KaTeX, balanced formula delimiter ও control-character পরীক্ষা পাস। AutoModel row classification-এ একই রেকর্ডে চিত্র রাখা MCQ/CQ/SQ গৃহীত হয়েছে; এটি live image fetch test নয়।
- সংশ্লিষ্ট ১১টি স্যুটে **৮২/৮২ PASS**; শেষ asset rebuild-এর পর focused **৯/৯ PASS**। TypeScript typecheck, generator `--check`, verifier ও `git diff --check` পাস।
- মূল NCTB অধ্যায়ের বর্তমান সংস্করণ সম্পূর্ণ সংগ্রহ/পাঠ হয়নি; বোর্ড সংগ্রহ exhaustive নয়। নিজস্ব প্রশ্ন বোর্ড/বইয়ের অবিকল নয়। শিক্ষক-অনুমোদন, diagram semantic review, coverage review, assets deploy এবং live integration যাচাই বাকি।

বর্তমান রেজিস্ট্রিতে ছয় অধ্যায়ের ১৫টি লক্ষ্য-ব্যাচে ১,৯৬০টি প্রশ্ন; সব প্রস্তুত ব্যাচসহ ৯৬ ব্যাচে ৮,৭৭৬ রেকর্ড। **এগুলো খসড়ার সংখ্যা, লাইভ/অনুমোদিত স্টক নয়।**

## স্থানীয় ফাইল ও পুনরুৎপাদন

- `content/question-bank/ssc/math/chapter-6/target-v1/{mcq,written,validation}.json`
- `content/question-bank/ssc/math/chapter-6/{targets-v1-manifest,board-seed-v1}.json`
- `public/question-bank/ssc-math-ch6-v1/*.svg`
- `docs/question-bank/ssc-math-ch6-illustrated-review.html`
- `docs/question-bank/ssc-math-ch6-illustrated-v1-backup.zip`

```sh
# Development-only SymPy 1.14.0 at this path.
PYTHONPATH=.cache/math-validation python3 scripts/question-bank/build-ssc-math-ch6-targets.py --check
PYTHONPATH=.cache/math-validation python3 scripts/question-bank/verify-ssc-math-ch6-targets.py
node scripts/question-bank/build-ssc-math-ch6-review.cjs
LD_LIBRARY_PATH=.cache/chromium-libs/lib node scripts/question-bank/check-ssc-math-ch6-review.cjs
node --test tests/ssc-math-ch6-targets.test.cjs
npm run typecheck
git diff --check
```

শিক্ষক পর্যালোচনা ও স্পষ্ট ADMIN অনুমতি ছাড়া ইমপোর্ট নয়; `docs/question-bank/IMPORT-OPERATIONS.md`-এর Pending-only প্রক্রিয়া প্রযোজ্য। বাস্তব DB write, approval, deployment, commit বা push করা হয়নি।
