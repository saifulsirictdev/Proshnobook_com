# ষষ্ঠ শ্রেণি গণিত — ২. অনুপাত ও শতকরা

## প্রস্তুত ব্যাচ
- `questions.json`: ১০০ MCQ + ৩০ সম্পূর্ণ CQ (৯০ উপঅংশ) + ৩০ SQ; উত্তর/সমাধানসহ। বর্তমান chapter-select JSON uploader-এ সরাসরি ব্যবহারযোগ্য।
- `review.md`: মানুষের পড়ার উপযোগী সব প্রশ্ন ও সমাধান।
- `validation.json`: সংখ্যা, ধারণাসূত্র, source PDF SHA-256, প্রশ্নভিত্তিক skill ledger ও সীমাবদ্ধতা।

## ব্যবহার
ADMIN → `/admin/questions/import` → Class 6 → গণিত → `২. অনুপাত ও শতকরা` → JSON file upload → preview → explicit Pending save। অথবা একই অধ্যায়ের প্রস্তুত ব্যাচ কার্ড ব্যবহার করুন। আপলোড/প্রিভিউ নিজে প্রশ্ন সেভ করে না। কোনো প্রশ্ন স্বয়ংক্রিয়ভাবে অনুমোদিত/প্রকাশিত হবে না।

## উৎস যাচাই
ব্যবহারকারীর Drive PDF `২০২৬ — গণিত.pdf`, id `1dQ5TSKvQZVwRca_evhBY_hC5gjxcnd5q`। পুরো দ্বিতীয় অধ্যায়ের মুদ্রিত ৩৮–৫৮ পৃষ্ঠা ছবিতে পড়ে ধারণাভিত্তি মিলেছে। নিজস্ব প্রশ্ন; বই থেকে হুবহু প্রশ্ন কপি নয়। পৃষ্ঠাসংখ্যা সংশ্লিষ্ট ধারণার সূত্র, exact question citation নয়।

- ৩৮–৪৬: অনুপাত, একক মিলানো, সমতুল/সরল/লঘু/গুরু/একক/ব্যস্ত/মিশ্র অনুপাত ও বণ্টন।
- ৪৭–৫১: অনুপাত–শতকরা–ভগ্নাংশ রূপান্তর, শতকরা অংশ, নম্বর, মূল্যছাড়।
- ৫২–৫৭: ঐকিক নিয়ম, দাম, শ্রমিক–দিন, খাদ্য, দূরত্ব–সময়, যৌথ কাজ ও কর্মঘণ্টা।
- ৫৮: নমুনা CQ ও সংক্ষিপ্ত প্রশ্ন।

## সীমাবদ্ধতা
- সব প্রশ্ন Draft; স্বাধীন বিষয়-শিক্ষক অনুমোদন বাকি। গাণিতিক পরীক্ষা প্রশ্নের ভাষা, difficulty বা marking rubric-এর চূড়ান্ত অনুমোদন নয়।
- MCQ ২৫ পরিবার × ৪; CQ ১০ পরিবার × ৩; SQ ১৫ পরিবার × ২ সংখ্যাভিত্তিক variant। এগুলো যথাক্রমে ১০০/৩০/৩০টি স্বাধীন দক্ষতা নয়।
- সম্পূর্ণ অধ্যায়ের প্রতিটি উপবিষয়ের সমান coverage দাবি নেই; বয়সের অনুপাত ও অনুপাতের শ্রেণিভাগ আরও বিস্তৃত করা যায়।
- CQ নম্বর ব্যবহারকারীর নির্দেশে ২–৪–৪; কোনো official marking scheme উদ্ধৃত নয়।
- Live database import/approval/publication করা হয়নি।

## পুনরুৎপাদন
```sh
python3 scripts/question-bank/build-class6-math-ch2.py --check
node --test tests/class6-math-ch2-content.test.cjs tests/prepared-library.test.cjs
```

প্রতিটি MCQ-এর সঠিক মান ও distractor exact Fraction constraints দিয়ে পরীক্ষা হয়। SQ/CQ-এর গণনায় exact arithmetic assertions আছে; generated JSON বাস্তব upload parser দিয়ে পরীক্ষা হয়। TypeScript এবং targeted ২০টি পরীক্ষা পাস। Import transaction tests mock-ভিত্তিক; production database পরীক্ষা নয়।
