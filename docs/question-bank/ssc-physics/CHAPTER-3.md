# SSC / নবম–দশম পদার্থবিজ্ঞান — তৃতীয় অধ্যায়: বল

**নিজস্ব অনুশীলনী খসড়া। প্রকৃত database import, approval, publication বা deployment হয়নি।**

ব্যবহারকারীর নির্দেশ: পরের অধ্যায় **২০০ MCQ, ১২০ সৃজনশীল, ৭০ সংক্ষিপ্ত**। অন্য অধ্যায় বা publication এই নির্দেশের অংশ নয়। প্রথম দুই অধ্যায়ের content, adapter, validation, review ও backup receipt অপরিবর্তিত।

## প্রস্তুত সামগ্রী

Folder: `content/question-bank/ssc/physics/chapter-3/`।

| ফাইল | বিষয়বস্তু |
| --- | --- |
| `mcq.json` | ২০০ MCQ, চারটি স্বতন্ত্র option ও সঠিক উত্তর/ব্যাখ্যা |
| `cq.json` | ১২০ CQ, উদ্দীপক ও ক–খ–গ–ঘ ১–২–৩–৪ নম্বর, প্রতিটির সমাধান |
| `sq.json` | ৭০ দুই নম্বরের সংক্ষিপ্ত প্রশ্ন ও উত্তর |
| `validation.json` | family, হিসাবের উপাত্ত, সীমাবদ্ধতা ও SHA256; importer-এ দেবেন না |

সব ৩৯০ প্রশ্ন ও উত্তর পড়ার ফাইল: **`chapter-3-review.html`**। বাহ্যিক font, JS বা image dependency নেই। Browser Print করা যায়। প্রতিটি importer slice ২০০-record/৭৫০KB সীমার মধ্যে। ২০০ MCQ ঠিক বিদ্যমান সীমার সমান, তাই সীমা না বাড়িয়েই একটি card/file-এ আছে।

## মানবণ্টন

আগের ছবির প্রতিলিপি `mark-distribution.json` অপরিবর্তিত:

- ২৫ MCQ সব উত্তর: ২৫×১ = ২৫।
- ৭ CQ থেকে ৪টি: ৪×১০ = ৪০।
- ৭ সংক্ষিপ্ত থেকে ৫টি: ৫×২ = ১০।
- তত্ত্বীয় ৭৫ + ব্যবহারিক ২৫ = ১০০; সময় একত্রে ৩ ঘণ্টা।

ছবিতে সাল বা অংশভিত্তিক সময় নেই—উদ্ভাবন করা হয়নি। CQ উপবিভাগ ১–২–৩–৪ বিদ্যমান non-math importer convention; ছবিতে CQ মোট ১০ নম্বর আছে। ব্যবহারিক প্রশ্ন তৈরি করা হয়নি। শুধু এই অধ্যায়ের ভান্ডার পূর্ণ সিলেবাসের বোর্ড মডেল নয়; Physics Auto Model unsupported block অপরিবর্তিত।

## বিষয় ও বৈচিত্র্য

- MCQ: **৪০ ধারণাগত + ১৬ গণনা-পরিবারে ১০টি করে = ২০০**। A/B/C/D প্রতিটিতে ৫০টি সঠিক উত্তর।
- CQ: **২৪ সমস্যা-পরিবারে ৫টি করে = ১২০**।
- SQ: **৪০ ধারণাগত + ৬ গণনা-পরিবারে ৫টি করে = ৭০**।

**সংখ্যাভিত্তিক ভ্যারিয়েন্ট আছে; ৩৯০টি সম্পূর্ণ স্বাধীন ধারণা বা সংগৃহীত বোর্ড-প্রশ্ন নয়।**

ধারণাসমূহ: বলের একক/মাত্রা, জড়তা, নিউটনের তিন সূত্র, লব্ধ বল, সাম্যকারী বনাম ক্রিয়া–প্রতিক্রিয়া বল, ভরবেগ ও বলের ঘাত, ভরবেগ সংরক্ষণে বাহ্যিক ঘাতের শর্ত, সংঘর্ষ, পশ্চাদ্বেগ, ঘর্ষণ ও তার ব্যবহার, ভর–ওজন এবং চার মৌলিক আন্তঃক্রিয়া।

CQ পরিবার: বল থেকে ত্বরণ; বিপরীত বল; সমদিকের বল ও সাম্য; ভর নির্ণয় ও অতিরিক্ত মাল; ভরবেগ–ঘাত; দূরত্বে থামা; শক্ত/নরম বাধায় সময়; বল ফিরে আসা; স্থির গাড়িতে লেগে যাওয়া; মুখোমুখি সংঘর্ষে লেগে যাওয়া; বন্দুকের পশ্চাদ্বেগ; বিচ্ছিন্ন টুকরা; চলমান গাড়ি যুক্ত হওয়া; ঘর্ষণসহ লব্ধ বল; সমবেগ থেকে সহগ; স্থিতি ঘর্ষণের সীমা; দুই পৃষ্ঠ; ঘর্ষণে থামা; সংলগ্ন ব্লক; সুতোয় যুক্ত গাড়ি; উল্লম্ব অভিলম্ব বল; সমান ঘাতে ভিন্ন ভর; খণ্ডিত বল–সময় তথ্য; অশূন্য বাহ্যিক ঘাতসহ সংঘর্ষ।

## পদার্থবিজ্ঞানের গুরুত্বপূর্ণ শর্ত

- দ্বিতীয় সূত্রে সবসময় **লব্ধ বল**, একা প্রয়োগ করা বল নয়।
- একই অক্ষে বিপরীত বেগ/বল/ঘাতে চিহ্ন বজায় রাখা হয়েছে; ফিরে আসা বলের ভরবেগ-পরিবর্তনে মানগুলো যোগের প্রভাব আছে।
- তৃতীয় সূত্রের যুগল ভিন্ন বস্তুর ওপর; বইয়ের ওজন ও বইয়ের ওপর অভিলম্ব বলকে তৃতীয় সূত্রের যুগল বলা হয়নি।
- ভরবেগ সংরক্ষণে সিস্টেমের লব্ধ বাহ্যিক ঘাত শূন্যের শর্ত আছে। একটি পরিবারে বাহ্যিক ঘাত যোগ করে ইচ্ছাকৃতভাবে শর্তের ব্যতিক্রম বিচার করা হয়।
- বন্দুক/গুলির বেগ যেখানে প্রয়োজন **ভূমি-সাপেক্ষ**, গুলি বের হওয়ার পরের বন্দুকভর স্পষ্ট; আপেক্ষিক বেগ মেশানো হয়নি।
- স্থিতি ঘর্ষণ প্রয়োজন অনুযায়ী সীমা পর্যন্ত হয়; সবসময় μₛN নয়। সীমা ছাড়ানোর প্রশ্নে μₖ অজানা থাকলে ত্বরণ উদ্ভাবন করা হয়নি।
- f = μN একটি দেওয়া সরল মডেল; N = mg নেওয়ার আগে অনুভূমিক টান, অন্য উল্লম্ব বল না থাকা ও উল্লম্ব ত্বরণ শূন্য বলা আছে। লিফটের প্রয়োগে N−mg = ma নেওয়া হয়েছে।
- অভ্যন্তরীণ বল বা মোট ভরবেগ শূন্য মানেই প্রতিটি বস্তু স্থির নয়; সংঘর্ষে গতিশক্তি সর্বদা সংরক্ষিত—এমন দাবি নেই।
- গণনায় exact rational ব্যবহার; চূড়ান্ত দশমিক প্রয়োজনমতো ছয় ঘর পর্যন্ত। গড় বল থেকে সর্বোচ্চ বল নিশ্চিত করা হয়নি।

## সীমা ও উৎস

এগুলো নিজস্ব অনুশীলনী; বোর্ডের নাম/সাল/নির্দিষ্ট বইয়ের হুবহু প্রশ্ন হিসেবে আরোপ নয়। sourceUrl কেবল project provenance। মূল পাঠ্যবইয়ের পূর্ণ অধ্যায় পাঠ, প্রশ্নভিত্তিক পৃষ্ঠা-মিল, সর্বশেষ syllabus-এর সম্পূর্ণ coverage এবং স্বাধীন শিক্ষক certification **বাকি**।

বিশেষত ঘর্ষণ সহগ, সংলগ্ন/সুতোয় যুক্ত ব্লক ও লিফটের প্রয়োগের SSC-উপযোগী স্তর শিক্ষককে মিলিয়ে দেখতে হবে। বলের দিক কথায় স্পষ্ট, কিন্তু বলচিত্র বা আঁকা graph নেই; সেই দক্ষতার পূর্ণ coverage নয়। নতুন করে কোনো Drive বই পড়ে/source-alignment সম্পন্ন করেছি এমন দাবি নেই; আগে সীমা ছাড়ানো বা নিষিদ্ধ reference পুনরায় চেষ্টা করা হয়নি।

## প্রস্তুত লাইব্রেরি ও নিরাপত্তা

`lib/ssc-physics-ch3-batches.ts` তিনটি card যোগ করে: canonical scope **Class 9 → পদার্থবিজ্ঞান → ৩য় অধ্যায়: বল**। নবম–দশমের জন্য Class 10-এ আলাদা নকল stock নয়। কোড deploy হওয়ার পরে card পাওয়া যাবে; এই turn-এ production deployment হয়নি। বিদ্যমান uploader দিয়েও তিনটি JSON আলাদাভাবে preview করা যায়।

Preview read-only। unchanged digest ও explicit ADMIN consent ছাড়া save নয়; save হলেও Pending/approved=false। এই turn-এ আসল database-এ save চালানো হয়নি। আগের approval, header/template, ইংরেজির workflow ও payment/access পরিবর্তন করা হয়নি।

তিন অধ্যায়ের স্থানীয় খসড়া মোট: **৭৫০ MCQ + ৩৭০ CQ + ২৭০ SQ = ১৩৯০**। এটি live-site inventory বা approved stock নয়।

## পরীক্ষা

```sh
python scripts/question-bank/build-ssc-physics-ch3.py --check
python scripts/question-bank/verify-ssc-physics-ch3.py
python scripts/question-bank/build-ssc-physics-ch1.py --check
python scripts/question-bank/verify-ssc-physics-ch1.py
python scripts/question-bank/build-ssc-physics-ch2.py --check
python scripts/question-bank/verify-ssc-physics-ch2.py
node --test tests/ssc-physics-ch1.test.cjs tests/ssc-physics-ch2.test.cjs tests/ssc-physics-ch3.test.cjs
node --test --test-name-pattern='selection is not authority|SSC Physics chapters|SSC Physics chapter 3' tests/prepared-library.test.cjs
npm run typecheck
```

ফল: chapter 3 reproducibility/count/unique normalized stem/file-hash PASS। পৃথক verifier-এ **১৬০ numeric MCQ + ৩০ numeric SQ = ১৯০ উত্তর** এবং **১২০ CQ-এর প্রয়োগ/বিশ্লেষণের গণনা/শর্ত** PASS। তিন chapter-এর strict importer, rejection, profile, Draft, Pending-only mock preview/save/replay পরীক্ষা **১৫/১৫ PASS**। বাস্তব registry দিয়ে নির্বাচিত ADMIN guard, দুই পুরোনো chapter-এর scope এবং নতুন chapter-এর তিন card/Pending-only mock save **৩/৩ PASS**। TypeScript PASS। মোট registry card এখন ১৫০।

প্রথম দুই অধ্যায়ের generator `--check` ও স্বতন্ত্র verifier-ও PASS। পূর্ণ repository suite/build/browser run এই turn-এ করা হয়নি। Mock database পরীক্ষাগুলো বাস্তব import নয়; automated checks স্বাধীন শিক্ষক certification নয়।
