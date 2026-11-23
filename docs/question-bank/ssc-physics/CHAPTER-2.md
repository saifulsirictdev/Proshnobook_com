# SSC / নবম–দশম পদার্থবিজ্ঞান — দ্বিতীয় অধ্যায়: গতি

**অবস্থা: নিজস্ব অনুশীলনী খসড়া; database-এ import, approval, publication বা deployment করা হয়নি।**

ব্যবহারকারীর নতুন নির্দেশ: পরের অধ্যায়, **৩০০ MCQ + ১৫০ CQ + ১০০ সংক্ষিপ্ত**। অন্য অধ্যায় তৈরি বা প্রকাশের অনুমতি এই নির্দেশ থেকে নেওয়া হয়নি।

## প্রস্তুত সামগ্রী

Canonical folder: `content/question-bank/ssc/physics/chapter-2/`।

| ফাইল | প্রশ্ন |
| --- | ---: |
| `mcq-1.json` | ১৫০ MCQ |
| `mcq-2.json` | ১৫০ MCQ |
| `cq.json` | ১৫০ সৃজনশীল; প্রত্যেকটিতে ক–খ–গ–ঘ ও সমাধান |
| `sq.json` | ১০০ দুই নম্বরের সংক্ষিপ্ত প্রশ্ন ও উত্তর |
| `validation.json` | family/গণনা-উপাত্ত/file hash/সীমাবদ্ধতা; importer-এ দেবেন না |

**পড়ার ফাইল:** `chapter-2-review.html`—সমস্ত ৫৫০ প্রশ্ন ও উত্তর, বাহ্যিক font/JS/image dependency নেই। Browser Print করা যায়।

JSON ফাইলগুলো বিদ্যমান strict uploader-এর ২০০-record ও ৭৫০KB সীমার মধ্যে পৃথক slice। সব প্রশ্নের চারটি স্বতন্ত্র MCQ option, উত্তর/ব্যাখ্যা; CQ-তে ১–২–৩–৪ নম্বর; সব উদ্দীপক self-contained। বাইরের কোনো চিত্র/উদ্দীপক খুঁজতে হয় না।

## মানবণ্টন ও সময়

আগের ব্যবহারকারী-সংযুক্ত ছবি ও `mark-distribution.json` অপরিবর্তিত:

- ২৫ MCQ-এর ২৫টি উত্তর, ১ করে = ২৫।
- ৭ CQ থেকে ৪টি উত্তর, ১০ করে = ৪০।
- ৭ সংক্ষিপ্ত থেকে ৫টি উত্তর, ২ করে = ১০।
- তত্ত্বীয় ৭৫, ব্যবহারিক ২৫, মোট ১০০; সময় একত্রে ৩ ঘণ্টা।

ছবিতে নির্দিষ্ট সাল বা MCQ/CQ-এর আলাদা সময় নেই; উদ্ভাবন করা হয়নি। CQ উপবিভাগ ১–২–৩–৪ বিদ্যমান non-math importer convention; ছবিতে মোট ১০। এটি অধ্যায়ভিত্তিক প্রশ্নভান্ডার, পূর্ণ সিলেবাসের বোর্ড মডেল নয়; ব্যবহারিক প্রশ্ন অন্তর্ভুক্ত নয়। Physics Auto Model আগের মতোই blocked, এই কাজে নতুন blueprint চালু করা হয়নি।

## বিষয় ও বৈচিত্র্য

- MCQ: **৬০ ধারণাগত + ২৪ গণনা-পরিবারে ১০টি করে = ৩০০**। সঠিক option A/B/C/D প্রতিটিতে ৭৫টি।
- CQ: **৩০ সমস্যা-পরিবারে ৫টি করে = ১৫০**।
- SQ: **৫০ ধারণাগত + ১০ গণনা-পরিবারে ৫টি করে = ১০০**।

**একই সমস্যার গঠনে সংখ্যাভিত্তিক ভ্যারিয়েন্ট আছে। ৫৫০টি সম্পূর্ণ স্বাধীন ধারণা বা সংগৃহীত বোর্ড প্রশ্ন নয়।**

বিষয়গুলো: প্রসঙ্গ কাঠামো, স্থিতি–গতি, স্কেলার/ভেক্টর, দূরত্ব–সরণ, দ্রুতি–বেগ, গড়/তাৎক্ষণিক মান, সমত্বরণ/মন্দন, একক রূপান্তর, অবস্থান–সময় ও বেগ–সময় ডেটা, লেখচিত্রের ঢাল/ক্ষেত্রফল, দিক পরিবর্তনে পথ বনাম সরণ, মুক্তপতন, উল্লম্ব নিক্ষেপ, আপেক্ষিক গতি/ধরা/মিলন, পর্যায়কাল–কম্পাঙ্ক এবং সহজ বৃত্তপথে পথ–সরণ।

CQ পরিবার: ধ্রুব ত্বরণ; থামা; প্রান্তবেগ থেকে ত্বরণ; সরণ থেকে শেষবেগ; সমবেগের পর ব্রেক; ত্বরণের পর সমবেগ; ত্রিভুজাকার v-t; ট্রাপিজিয়াম v-t; অবস্থান–সময়; যাওয়া–ফেরা; ধ্রুব ত্বরণে দিকবদল; লম্ব দুই পথ; অর্ধবৃত্ত; পূর্ণবৃত্ত; মুখোমুখি মিলন; একই দিকে ধরা; ত্বরিত বস্তুর সমবেগের বস্তুকে ধরা; বিলম্বিত শুরু; জানা পতনকাল; জানা পতন-উচ্চতা; নিচে নিক্ষেপ; ওপরের নিক্ষেপে পূর্ণ যাত্রা; নামার মুহূর্তের অবস্থা; n-তম সেকেন্ড; পতনের শেষ সেকেন্ড; দ্বিগুণ দ্রুতিতে ব্রেক; প্রতিক্রিয়াকালসহ ব্রেক; ট্রেন–সেতু; সমান দূরত্বে গড়; দুই দিকে খণ্ডিত বেগ।

দিকযুক্ত সূত্রে অক্ষের চিহ্ন, মন্দন কবে পর্যন্ত প্রযোজ্য, একই উচ্চতায় ফেরার শর্ত, মুক্তপতনে বায়ুর বাধা না থাকা এবং g-এর মান প্রশ্নেই স্পষ্ট। দশমিক প্রয়োজন হলে ছয় ঘর পর্যন্ত আসন্ন মান। মধ্যবর্তী গণনা exact rational-এ হয়।

## সীমা ও উৎস

- সব প্রশ্ন নতুন নিজস্ব অনুশীলনী; বোর্ড/সাল/বইয়ের হুবহু প্রশ্ন হিসেবে আরোপ নয়। sourceUrl শুধু project provenance।
- মূল পাঠ্যবইয়ের পূর্ণ অধ্যায় পাঠ, প্রশ্নভিত্তিক পৃষ্ঠা-মিল, সর্বশেষ syllabus-এর সম্পূর্ণ coverage এবং স্বাধীন শিক্ষক certification এখনও **বাকি**।
- লেখচিত্রের তথ্য সংখ্যা/বাক্য/সারণির মাধ্যমে দেওয়া। সরাসরি আঁকা graph পড়া বা আঁকার সম্পূর্ণ দক্ষতা এই ব্যাচে আচ্ছাদিত নয়।
- আপেক্ষিক গতি, প্রতিক্রিয়াকাল ও বহুপর্বের প্রয়োগগুলোর SSC-উপযোগী স্তর/পাঠ্যসীমা শিক্ষককে মিলিয়ে দেখতে হবে।
- আগের turn-এ পাওয়া অতিবৃহৎ Drive PDF আবার read/download করা হয়নি; এই turn-এ কোনো বই পড়েছি বা source-alignment শেষ করেছি এমন দাবি নেই।

## সাইটের প্রস্তুত লাইব্রেরি

`lib/ssc-physics-ch2-batches.ts` চারটি নতুন card যোগ করে। canonical scope: **Class 9 → পদার্থবিজ্ঞান → ২য় অধ্যায়: গতি**; নবম–দশমের জন্য Class 10-এ নকল stock বানানো হয়নি। নতুন কোড deploy হলে card দেখা যাবে; এই turn-এ production deployment হয়নি। বিদ্যমান uploader দিয়েও চারটি JSON পৃথকভাবে preview করা যায়।

ADMIN preview read-only। unchanged digest ও explicit consent ছাড়া save নয়। save হলেও approved=false/Pending; পরবর্তী approval আলাদা সিদ্ধান্ত। বাস্তব database-এ save চালানো হয়নি। Payment/access, ইংরেজির workflow, header/template এবং আগের গণিতের প্রকাশনা অক্ষত।

অধ্যায় ১-এর JSON, registry adapter, validation manifest, review এবং Drive backup receipt বদলানো হয়নি। দুই অধ্যায়ের ভান্ডার এখন স্থানীয়ভাবে মোট **৫৫০ MCQ + ২৫০ CQ + ২০০ SQ = ১০০০ খসড়া প্রশ্ন**; এটি live-site inventory নয়।

## পরীক্ষা ও পুনরুৎপাদন

```sh
python scripts/question-bank/build-ssc-physics-ch2.py --check
python scripts/question-bank/verify-ssc-physics-ch2.py
python scripts/question-bank/build-ssc-physics-ch1.py --check
python scripts/question-bank/verify-ssc-physics-ch1.py
node --test tests/ssc-physics-ch1.test.cjs tests/ssc-physics-ch2.test.cjs
node --test --test-name-pattern='selection is not authority|SSC Physics chapters' tests/prepared-library.test.cjs
npm run typecheck
```

ফল:

- অধ্যায় ২-এর ৫৫০টি structure/count/hash ও reproducibility PASS।
- আলাদা verifier-এ ২৪০ numeric MCQ + ৫০ numeric SQ = **২৯০ উত্তর** পুনর্গণনা PASS।
- **১৫০ CQ**-এর প্রয়োগ/বিশ্লেষণের গণনা পুনর্গণনা PASS; প্রকাশিত উদ্দীপকে input magnitudes আছে কি না-ও পরীক্ষা হয়।
- অধ্যায় ১-এর আগের manifest/গণনা/reproducibility পরীক্ষা PASS।
- দুই chapter-এর strict importer, rejection, owner profile, Draft status, mock Pending-only preview/save/replay পরীক্ষা **১০/১০ PASS**।
- বাস্তব prepared registry-তে দুই অধ্যায়ের আলাদা scope/count এবং ADMIN guard/Pending-only mock save: নির্বাচিত **২/২ PASS**। মোট registry card এখন ১৪৭; মক পরীক্ষায় নতুন ৫৫০ Pending। এটি production import receipt নয়।
- TypeScript PASS। Prisma type generation sandbox-এ `PRISMA_QUERY_ENGINE_LIBRARY=/bin/true PRISMA_SCHEMA_ENGINE_BINARY=/bin/true npx prisma generate --no-engine` দিয়ে হয়েছে; runtime DB connectivity বা deploy verification নয়।

পূর্ণ repository suite/build/browser run এই turn-এ চালানো হয়নি। উপরোক্ত checks স্বাধীন শিক্ষকের যাচাইয়ের বিকল্প নয়।
