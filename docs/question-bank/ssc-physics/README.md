# SSC / নবম–দশম পদার্থবিজ্ঞান — অধ্যায় ১

**অবস্থা: পর্যালোচনাধীন নিজস্ব খসড়া। অনুমোদন, database import বা publication হয়নি।**

## ব্যবহারকারীর নির্দেশ

প্রথম অধ্যায় **ভৌত রাশি এবং পরিমাপ**: ২৫০ MCQ, ১০০ সৃজনশীল, ১০০ সংক্ষিপ্ত। এই নির্দেশ অন্য অধ্যায় বা পুরো বই তৈরি করার অনুমতি নয়। পূর্বের গণিত/ইংরেজির প্রকাশিত প্রশ্ন, template, payment/access বা header workflow বদলানো হয়নি।

## ছবির মানবণ্টন

সংযুক্ত ছবির হুবহু সংরক্ষণ `owner-mark-distribution.jpg`; যন্ত্রপাঠযোগ্য প্রতিলিপি `mark-distribution.json`। ছবিতে পদার্থবিজ্ঞান, রসায়ন এবং জীববিজ্ঞান একই টেবিলে আছে; এই কাজে শুধু পদার্থবিজ্ঞান প্রযোজ্য।

| ধরন | প্রশ্ন থাকবে | উত্তর দিতে হবে | প্রতিটির মান | মোট |
| --- | ---: | ---: | ---: | ---: |
| MCQ | ২৫ | ২৫ | ১ | ২৫ |
| সৃজনশীল | ৭ | ৪ | ১০ | ৪০ |
| সংক্ষিপ্ত | ৭ | ৫ | ২ | ১০ |

তত্ত্বীয় অংশ ৭৫, ব্যবহারিক ২৫, মোট ১০০; টেবিলে সময় একত্রে **৩ ঘণ্টা**। MCQ ও অন্য অংশের জন্য আলাদা সময় বা কোনো নির্দিষ্ট সাল ছবিতে নেই—অনুমান করা হয়নি। এটি ব্যবহারকারীর দেওয়া নমুনা, নির্দিষ্ট সালের সরকারি বিজ্ঞপ্তি যাচাইয়ের দাবি নয়। CQ-এর ক–খ–গ–ঘ = ১–২–৩–৪ সাইটের বিদ্যমান non-math importer কাঠামো অনুযায়ী; ছবিতে শুধু মোট ১০ নম্বর দেওয়া আছে। ব্যবহারিক প্রশ্ন এই ব্যাচের অন্তর্ভুক্ত নয়।

শুধু প্রথম অধ্যায়ের ভান্ডার দিয়ে পূর্ণ সিলেবাসের বোর্ড মডেল প্রস্তুত হয়েছে বলা যাবে না। Physics Auto Model এই পরিবর্তনে চালু করা হয়নি; unsupported-blueprint block অক্ষত।

## প্রস্তুত ফাইল

সব importer JSON: `content/question-bank/ssc/physics/chapter-1/`।

- `mcq-1.json`: ১২৫ MCQ
- `mcq-2.json`: ১২৫ MCQ
- `cq.json`: ১০০ CQ; প্রতিটিতে উদ্দীপক, চার উপপ্রশ্ন ও সমাধান
- `sq.json`: ১০০ দুই নম্বরের সংক্ষিপ্ত প্রশ্ন ও উত্তর
- `validation.json`: প্রতিটি প্রশ্নের family, গণনা-উপাদান, file hash, সীমাবদ্ধতা; **এটি importer-এ দেবেন না**।

মানুষের পড়ার জন্য সব ৪৫০ প্রশ্ন ও উত্তর: **`chapter-1-review.html`**। বাহ্যিক JS, font বা image dependency নেই; browser Print ব্যবহার করা যায়।

বিদ্যমান ২০০-record/৭৫০KB সীমা অক্ষত রাখার জন্য MCQ দুই ভাগ। Registry: `lib/ssc-physics-batches.ts`। সংশোধিত কোড deploy হওয়ার পর Admin → প্রশ্ন → prepared import → **Class 9 → পদার্থবিজ্ঞান → ১ম অধ্যায়: ভৌত রাশি এবং পরিমাপ**-এ চারটি খসড়া card পাওয়া যাবে। এখনই production-এ পাওয়া যাবে এমন দাবি নয়। বিকল্পভাবে বিদ্যমান uploader-এ চারটি JSON পৃথকভাবে দেওয়া যায়।

Class 9 বিদ্যমান নবম–দশম bank-এর canonical catalog scope; Class 10-এ একই প্রশ্নের আলাদা নকল বানানো হয়নি। Preview read-only। ADMIN-এর স্পষ্ট consent ও অপরিবর্তিত digest ছাড়া save নয়; save হলেও **Pending**, আলাদা approval প্রয়োজন। এই turn-এ প্রকৃত save/import চালানো হয়নি।

## বৈচিত্র্য ও পাঠ্যসীমার সীমাবদ্ধতা

- MCQ: ৫০ ধারণাগত প্রশ্ন + ২০ গণনা-পরিবারে ১০টি করে = ২৫০।
- CQ: ২০ সমস্যা-পরিবারে ৫টি করে = ১০০।
- SQ: ৫০ ধারণাগত + ১০ গণনা-পরিবারে ৫টি করে = ১০০।
- **এগুলো ৪৫০টি সম্পূর্ণ স্বাধীন ধারণা/বোর্ড থেকে সংগৃহীত প্রশ্ন নয়।** একই সূত্র ও সমস্যার গঠনে সংখ্যাভিত্তিক ভ্যারিয়েন্ট আছে।
- বিষয়সমূহ: রাশি/একক/মাত্রা, SI ও উপসর্গ, একক রূপান্তর, ভার্নিয়ার, স্ক্রু গজ, শূন্য ত্রুটি, স্কেল, গড়, কাগজের বেধ/তারের ব্যাস/চক্রকাল পরিমাপ, আয়তন-ঘনত্ব, অনিশ্চয়তা, সার্থক অঙ্ক ও মৌলিক বৈজ্ঞানিক অনুসন্ধান। সূত্রে একক ও অনুমান স্পষ্ট করা হয়েছে।
- পরিমাপের প্রয়োগ হিসেবে বেলন/ব্লকের আয়তন, ঘনত্ব ও দূরত্ব-সময় অনুপাত ব্যবহৃত হয়েছে; আলাদা অধ্যায়ের পূর্ণ গতিবিদ্যা বা বলের সমস্যা নয়। মূল বইয়ের সঙ্গে এই প্রয়োগগুলোর স্তর/পরিসর শিক্ষককে মিলিয়ে দেখতে হবে।
- কোনো চিত্রের ওপর প্রশ্ন নির্ভর করে না। চিত্র দেখে ভার্নিয়ার/স্ক্রু গজ পাঠ নেওয়ার দক্ষতা এই ব্যাচে আচ্ছাদিত হয়নি।
- সব প্রশ্ন নিজস্ব অনুশীলনী; বোর্ড, সাল, NCTB-এর হুবহু প্রশ্ন বা যাচাইকৃত textbook page হিসেবে আরোপ করা হয়নি। JSON-এর sourceUrl শুধু project provenance, বাহ্যিক পাঠ্যবইয়ের প্রমাণ নয়।
- মূল বইয়ের পূর্ণ অধ্যায় পাঠ, প্রশ্নভিত্তিক পৃষ্ঠা-মিল, সম্পূর্ণ syllabus coverage এবং স্বাধীন শিক্ষকের approval **বাকি**। সংখ্যা পূর্ণ হওয়া এগুলোর বিকল্প নয়।

## Drive উৎস অনুসন্ধানের প্রকৃত ফল

Drive-এর `০৯ — পদার্থবিজ্ঞান` folder `1mpjsPsvD2mC17orYnbe46YxEclObGvRf`-এ reference ফাইল পাওয়া গেছে, কিন্তু এই ব্যাচ তৈরির জন্য সেগুলোর পূর্ণ পাঠ করা যায়নি:

- `২০২৬ — পদার্থবিজ্ঞান.pdf`, ID `1U3mxjBZ-VkPqUa-HpQUnS99EJDKMBIcD`: connector জানিয়েছে 106445726 bytes; text extraction cap 25MB এবং raw download cap 100MiB-এরও বেশি। আর download/retry করা হয়নি।
- `02. 9 Phy Chap 01.doc`, ID `1jm9jCsie_EUlvQl4brLnFDiLcpftSg6S`: 869376 bytes, legacy Word; connector text extraction unsupported। Download বা conversion করা হয়নি।

সুতরাং এই reference-গুলোর প্রশ্ন পড়েছি, কপি করেছি বা বই দেখে যাচাই করেছি—এমন দাবি নেই। ছোট chapter PDF/DOCX বা সমর্থিত readable source নিয়ে পরবর্তী source alignment করা যাবে। পুরোনো reference ফাইল পরিবর্তন করা হয়নি।

## পরীক্ষা

```sh
python scripts/question-bank/build-ssc-physics-ch1.py --check
python scripts/question-bank/verify-ssc-physics-ch1.py
node --test tests/ssc-physics-ch1.test.cjs
node --test --test-name-pattern='selection is not authority|science preview' tests/prepared-library.test.cjs
npm run typecheck
```

ফল: reproducibility PASS; চার slice-এর strict importer/catalog validation PASS; ২০০ numeric MCQ + ৫০ numeric SQ-এর উত্তর এবং ১০০ CQ-এর প্রয়োগ/বিশ্লেষণ গণনা আলাদা verifier-এ PASS; নতুন ৫টি test PASS; বিদ্যমান library-এর নির্বাচিত ২টি guard/Pending test PASS; TypeScript PASS। নতুন test-এ ৪৫০টি mock-DB save Pending-only, preview read-only, role/consent এবং replay যাচাই হয়েছে—প্রকৃত production DB নয়।

পূর্ণ prepared-library suite ১৮০ সেকেন্ডে শেষ হয়নি; অবশিষ্ট child process বন্ধ করা হয়েছে। পুরো repository test suite/build/browser test এই turn-এ সম্পন্ন হওয়ার দাবি নেই। পরীক্ষাগুলো **স্বাধীন শিক্ষক certification নয়**।

স্যান্ডবক্সে Prisma binary host অনুপলব্ধ হওয়ায় শুধু type generation-এর জন্য:

```sh
PRISMA_QUERY_ENGINE_LIBRARY=/bin/true PRISMA_SCHEMA_ENGINE_BINARY=/bin/true npx prisma generate --no-engine
```

এটি runtime DB connectivity বা deploy verification নয়। কোনো production পরিবেশ-পরিবর্তন করা হয়নি।
