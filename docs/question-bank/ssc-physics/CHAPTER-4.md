# SSC / নবম–দশম পদার্থবিজ্ঞান — চতুর্থ অধ্যায়: কাজ, ক্ষমতা ও শক্তি

**নিজস্ব অনুশীলনী খসড়া; প্রকৃত database import, approval, publication বা deployment হয়নি।**

পরের অধ্যায়ের জন্য ব্যবহারকারীর দেওয়া সংখ্যা: **৩৫০ MCQ + ১৫০ CQ + ১০০ SQ = ৬০০**। প্রথম তিন অধ্যায়ের প্রশ্ন, generator, adapter, validation, review ও backup receipt অপরিবর্তিত।

## প্রস্তুত ফাইল

`content/question-bank/ssc/physics/chapter-4/`:

| ফাইল | বিষয়বস্তু |
| --- | --- |
| `mcq-1.json` | ১–১৭৫ MCQ, উত্তর ও ব্যাখ্যা |
| `mcq-2.json` | ১৭৬–৩৫০ MCQ, উত্তর ও ব্যাখ্যা |
| `cq.json` | ১৫০ সৃজনশীল; উদ্দীপক, ক–খ–গ–ঘ ১–২–৩–৪ নম্বর ও সমাধান |
| `sq.json` | ১০০ দুই নম্বরের সংক্ষিপ্ত প্রশ্ন ও উত্তর |
| `validation.json` | family/গণনার উপাত্ত, খসড়ার সীমাবদ্ধতা ও SHA256; importer-এ দেবেন না |

**`chapter-4-review.html`**-এ ৬০০ প্রশ্ন ও উত্তর একসঙ্গে পড়া ও Browser Print করা যায়। বাহ্যিক font, JS বা image dependency নেই। চারটি import JSON-ই বিদ্যমান ২০০-record/৭৫০KB সীমার মধ্যে; সীমা বাড়ানো হয়নি।

## মানবণ্টন অপরিবর্তিত

আগের ছবির প্রতিলিপি `mark-distribution.json`:

- ২৫ MCQ সব উত্তর: ২৫×১ = ২৫।
- ৭ CQ থেকে ৪টি: ৪×১০ = ৪০।
- ৭ সংক্ষিপ্ত থেকে ৫টি: ৫×২ = ১০।
- তত্ত্বীয় ৭৫ + ব্যবহারিক ২৫ = ১০০; একত্রে ৩ ঘণ্টা।

ছবিতে সাল বা অংশভিত্তিক সময় নেই—উদ্ভাবন করা হয়নি। CQ-এর ১–২–৩–৪ existing non-math importer convention; ছবিতে CQ মোট ১০ নম্বর দেওয়া। ব্যবহারিক প্রশ্ন তৈরি হয়নি। এটি অধ্যায়ভিত্তিক ভান্ডার, পূর্ণ সিলেবাসের বোর্ড মডেল নয়; Physics Auto Model unsupported block অপরিবর্তিত।

## বৈচিত্র্য ও আলোচ্য বিষয়

- MCQ: **৫০ ধারণাগত + ৩০ গণনা-পরিবারে ১০টি করে = ৩৫০**। সঠিক উত্তরের অবস্থান A/B/C/D: **৮৮/৮৮/৮৭/৮৭**।
- CQ: **৩০ সমস্যা-পরিবারে ৫টি করে = ১৫০**।
- SQ: **৫০ ধারণাগত + ১০ গণনা-পরিবারে ৫টি করে = ১০০**।

**সংখ্যাভিত্তিক ভ্যারিয়েন্ট আছে; ৬০০টি সম্পূর্ণ স্বাধীন ধারণা বা সংগৃহীত বোর্ড-প্রশ্ন নয়।**

কাজের সংজ্ঞা/একক/মাত্রা ও চিহ্ন, লম্ব বলের কাজ, গতিশক্তি, মহাকর্ষীয় বিভবশক্তি ও শূন্যস্তর, কাজ–গতিশক্তি সম্পর্ক, যান্ত্রিক শক্তি সংরক্ষণ, ক্ষমতা, কর্মদক্ষতা, শক্তির রূপান্তর, kW/kWh/J, নবায়নযোগ্য/অনবায়নযোগ্য উৎস ও শক্তি সাশ্রয় রয়েছে।

CQ পরিবার: টান–ঘর্ষণ; উত্তোলন; সিঁড়িতে ক্ষমতার তুলনা; দ্রুতি–গতিশক্তির অনুপাত; সমান গতিশক্তিতে ভরবেগ; বিভবশক্তির রেফারেন্স; মুক্তপতন; ঊর্ধ্বনিক্ষেপ; আদিবেগসহ পতন; মোট যান্ত্রিক শক্তি; কাজ থেকে দ্রুতি; থামার কাজ/দূরত্ব; দুই পথাংশের কাজ; মোটর দক্ষতা; জল পাম্প; শক্তিভিত্তিক দক্ষতা; ক্ষমতাভিত্তিক দক্ষতা; জ্বালানি; kWh ও কাল্পনিক বিল; output থেকে সময়; দুই যন্ত্র; Fv; ভরবেগ–শক্তি; নামার পথে ক্ষয়; দ্রুতি কমায় শক্তিক্ষয়; km/h রূপান্তর; বিরতিসহ বারবার উত্তোলন; শতকরা ক্ষমতাক্ষয়; সৌর প্যানেল; জলপ্রবাহভিত্তিক বিদ্যুৎ।

## গুরুত্বপূর্ণ শর্ত ও নির্ভুলতা

- ধ্রুব বলের সরণ-বরাবর উপাংশ ব্যবহার; একই দিক/বিপরীত/লম্ব হলে যথাক্রমে Fs/−Fs/শূন্য। বল থাকলেই কাজ নয়।
- কাজ–গতিশক্তিতে **সব বলের লব্ধ কাজ**, একা টানের কাজ নয়। থামানোর কাজ ঋণাত্মক; পরমমান চাইলে ধনাত্মক।
- সমবেগে উত্তোলনে গতিশক্তি অপরিবর্তিত, উত্তোলন বলের কাজ +mgh এবং মহাকর্ষের কাজ −mgh।
- mgh-তে ধ্রুব g ও ধারাবাহিক শূন্যস্তর; শক্তি সংরক্ষণে ক্ষয়/অন্য কাজের শর্ত স্পষ্ট। মোট শক্তি থেকে উচ্চতার সীমাকে নিশ্চিতভাবে পৌঁছানো উচ্চতা বলা হয়নি।
- ভরবেগ ভেক্টর, গতিশক্তি স্কেলার; একই শক্তিতে একই ভরবেগ ধরে নেওয়া হয়নি।
- দক্ষতা উপযোগী output/input; ক্ষয় মানে শক্তি ধ্বংস নয়। সৌর/জলবিদ্যুতের input, ক্ষেত্রফল/প্রবাহ, সময় ও দক্ষতা প্রশ্নে দেওয়া।
- বিদ্যুৎ-দর **কাল্পনিক অনুশীলনী**, বর্তমান সরকারি tariff নয়। পুনঃপুন উত্তোলনে চলার সময়ের ক্ষমতা ও বিরতিসহ গড় ক্ষমতা আলাদা।
- গণনা exact rational-এ; ফল প্রয়োজনমতো ছয় দশমিক পর্যন্ত। প্রদর্শিত input ছয় দশমিকে exact এবং audit-এর একই উপাত্ত কিনা আলাদা verifier-এ দেখা হয়েছে; গোল করা input ধরে লুকানো exact উত্তরের অসামঞ্জস্য নেই।

## সীমা, উৎস ও নিরাপত্তা

মূল পাঠ্যবইয়ের পূর্ণ অধ্যায় পাঠ, প্রশ্নভিত্তিক পৃষ্ঠা-মিল, সর্বশেষ syllabus-এর পূর্ণ coverage এবং স্বাধীন শিক্ষক certification **বাকি**। বিশেষত কাজ–শক্তি উপপাদ্য, p²/(2m), সৌর তীব্রতা ও জলপ্রবাহভিত্তিক প্রয়োগগুলোর SSC-উপযোগী স্তর শিক্ষককে মিলিয়ে দেখতে হবে। চিত্র বা আঁকা graph নেই; সেই দক্ষতার পূর্ণ coverage নয়। নতুন করে Drive reference পড়ে source-alignment সম্পন্ন করার দাবি নেই; নিষিদ্ধ/সীমা ছাড়ানো reference পুনরায় চেষ্টা করা হয়নি।

এগুলো নিজস্ব অনুশীলনী; কোনো বোর্ড/সাল/বইয়ের হুবহু প্রশ্ন হিসেবে আরোপ নয়। sourceUrl কেবল project provenance। স্বয়ংক্রিয় যাচাই স্বাধীন শিক্ষক certification নয়।

`lib/ssc-physics-ch4-batches.ts` চারটি Draft card যোগ করে; canonical scope **Class 9 → পদার্থবিজ্ঞান → ৪র্থ অধ্যায়: কাজ, ক্ষমতা ও শক্তি**। নবম–দশমের জন্য Class 10-এ আলাদা duplicate stock নয়। কোড deploy হলে card পাওয়া যাবে; এই কাজে production deploy হয়নি। চারটি import JSON uploader-এ আলাদাভাবে preview করা যায়।

Preview read-only। unchanged digest ও explicit ADMIN consent ছাড়া save নয়; save হলেও Pending/approved=false। **এখানে আসল database save চালানো হয়নি।** আগের header/template, English workflow ও approval/access rules পরিবর্তিত নয়।

চার অধ্যায়ের স্থানীয় খসড়া মোট: **১১০০ MCQ + ৫২০ CQ + ৩৭০ SQ = ১৯৯০**। এটি live-site inventory বা approved stock নয়। মোট prepared registry: ১৫৪ card / ১৪৬০৬ record, যার মধ্যে Physics-এর ১৫ card।

## পরীক্ষা

```sh
python scripts/question-bank/build-ssc-physics-ch4.py --check
python scripts/question-bank/verify-ssc-physics-ch4.py
# একইভাবে অধ্যায় ১–৩-এর generator --check ও verifier
node --test tests/ssc-physics-ch1.test.cjs tests/ssc-physics-ch2.test.cjs tests/ssc-physics-ch3.test.cjs tests/ssc-physics-ch4.test.cjs
node --test --test-name-pattern='selection is not authority|SSC Physics chapters|SSC Physics chapter 3|SSC Physics chapter 4' tests/prepared-library.test.cjs
npm run typecheck
```

ফল: অধ্যায় ৪-এর reproducibility/count/hash/unique stem PASS। আলাদা read-only verifier-এ **৩০০ numeric MCQ + ৫০ numeric SQ = ৩৫০ উত্তর** এবং **১৫০ CQ-এর গণনা/শর্ত** PASS। চার অধ্যায়ের strict importer/rejection/profile/Draft/ADMIN-only Pending mock save/replay tests **২০/২০ PASS**। বাস্তব registry-র নির্বাচিত authority guard এবং অধ্যায় ১–৪ scope/Pending-only mock save tests **৪/৪ PASS**। TypeScript PASS। প্রথম তিন অধ্যায়ের reproducibility/verifier-ও PASS।

Registry tests শেষ হওয়ার পরে একই command-এর typecheck সময়সীমা পার হয়েছিল; অবশিষ্ট compiler থামিয়ে আলাদাভাবে typecheck চালিয়ে exit 0 পাওয়া গেছে। পূর্ণ repository suite/build/browser run করা হয়নি। Mock database পরীক্ষা বাস্তব import নয়।
