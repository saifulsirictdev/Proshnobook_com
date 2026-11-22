# পরিসংখ্যান — ৬০০ প্রশ্ন ও পরিষ্কার সারণি

**শিক্ষক-পর্যালোচনার খসড়া; লাইভ/অনুমোদিত স্টক নয়।**

| ধরন | সংখ্যা |
|---|---:|
| MCQ | ৩০০ |
| CQ | ২০০ |
| SQ | ১০০ |
| **মোট** | **৬০০** |

## আপনার ছবির মতো প্রশ্ন

আপনার দেওয়া তিনটি CQ-এর উপাত্ত ও কাঠামো ধরে অভিযোজিত সংস্করণ প্রথম তিন CQ হিসেবে রাখা হয়েছে। প্রশ্নে সারণি, কাঁচা নম্বর, গড়–মধ্যক–প্রচুরক, গণসংখ্যা নিবেশন, বহুভুজ, কম-থেকে/বেশি-থেকে অজিভ ও আয়তলেখ আছে। সব MCQ-তে বিকল্প/key/ব্যাখ্যা, CQ-তে ২/৪/৪ ও অংশভিত্তিক সমাধান, SQ-তে উত্তর–সমাধান আছে।

মূল প্রশ্নে ৪৪৩টি এবং প্রশ্ন–সমাধান মিলিয়ে **৮৩৩টি আসল HTML সারণি**। এগুলো screenshot নয়: সম্পাদনাযোগ্য লেখার সারণি, স্পষ্ট heading, সারি–কলাম, প্রতি ঘরে border, সমান column layout। কাজের সারণিতে 25.5-এর মতো দশমিক মধ্যমান দেখানো হয়। সমাধানে **৮৩টি সংখ্যামান-স্কেলযুক্ত SVG লেখচিত্র** আছে।

## গাণিতিক সতর্কতা

- পূর্ণসংখ্যায় অন্তর্ভুক্তিমূলক শ্রেণির আপাত সীমা ও প্রকৃত সীমা পৃথক: প্রকৃত সীমা ±০.৫ সমন্বয়ে। শ্রেণিবদ্ধ গড়/মধ্যক/প্রচুরক estimate; raw গড়/মধ্যক আলাদাভাবে exact।
- আপনার ছবির প্রথম CQ: আপাত নিম্নসীমা ৬০; প্রদত্ত সারণির আনুমানিক মধ্যক ৪৪। দ্বিতীয় CQ-এর শ্রেণিভিত্তিক গড় ৭৫.৫; তৃতীয়টির raw sample median ১০.৫ ও grouped mean ৬৩.৫।
- ছবির DB/MB 2025 badge স্বাধীনভাবে যাচাই হয়নি; তাই ওই তিন CQ-তে board provenance বসানো হয়নি।
- আলাদা ৪টি MCQ আগে পাওয়া ২০২৪-লেবেলযুক্ত বোর্ড-সংকলন থেকে adapted। বাকি ৫৯৩টি নিজস্ব parameter variant—৬০০টি স্বতন্ত্র ধারণা বা exhaustive board/current-NCTB coverage নয়।

## পরীক্ষা

- Focused suite: **৯/৯ PASS**।
- SSC/prepared-library/AutoModel/provenance/paper/studio regression: **২৫২/২৫২ PASS**।
- TypeScript typecheck ও deterministic generator check PASS।
- Independent verifier: ১,৭৮৮ exact response witnesses, ৮৩ graph coordinate/hash checks; স্বাধীন শিক্ষক-ভাষা/সমাধান/marks-depth approval নয়।
- বাস্তব MathText table renderer দিয়ে ৬০০ card/৮৩৩ table desktop1200/mobile390-এ পরীক্ষা; row/column rectangularity, border, cell width, overflow, graph label ও external/page-error পরীক্ষা PASS।
- ছবির তিন CQ-সহ ছয়টি CQ-এর **A4 sample PDF** তৈরি। এটি পুরো ৬০০ প্রশ্নের production pagination/editor/save/reopen test নয়।

## Google Drive

- [সব ৬০০ প্রশ্নের JSON ব্যাকআপ](https://drive.google.com/file/d/1NitmPHg2o33e1IB5XRjeqeRJU6AvHq0e/view)
- [সম্পূর্ণ ZIP—JSON, সারণি, graph, offline HTML ও PDF sample](https://drive.google.com/file/d/1OX26gwjmFkKNHDptWe6-YRi1eO5ljr6i/view)
- [সারণি–লেখচিত্র দেখার ছয় CQ-এর A4 PDF নমুনা](https://drive.google.com/file/d/1YEHls6y8FMveCodY7a1ByFNFnZxONmOb/view)

তিনটি upload-এর size/MD5 স্থানীয় ফাইলের সঙ্গে মিলেছে; receipt `ssc-math-ch17-targets-v1-drive-backup.json`। ZIP পুরো extract করে `docs/question-bank/ssc-math-ch17-illustrated-review.html` খুললে সব প্রশ্ন–সমাধান offline দেখা যাবে। JSON backup একটি container—সরাসরি importer input নয়; `importFiles[].payload` অথবা ZIP-এর পাঁচটি মূল slice ব্যবহার করতে হবে।

**লাইভ সাইটে import/deploy করা হয়নি।** নতুন bounded table support ও নির্দিষ্ট versioned statistics graph recognition কোডে আছে; production SVG availability, real admin/import/editor/save/reopen/print verification এবং শিক্ষক অনুমোদন বাকি। অন্য অধ্যায়ের image-integration gate সম্পূর্ণ সমাধান দাবি নয়। বর্তমান board/source default-off policy অপরিবর্তিত।

পূর্ণ technical scope, উৎসের page/question reference ও পুনরুৎপাদন: `content/question-bank/ssc/math/chapter-17/README.md`।
