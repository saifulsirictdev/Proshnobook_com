# SSC পদার্থবিজ্ঞান — পঞ্চম ও ষষ্ঠ অধ্যায়, চিত্রসহ খসড়া

**কোনো প্রকৃত database import, approval, publication বা deployment হয়নি।**

ব্যবহারকারীর নির্দেশ: উৎসে চিত্রসহ প্রশ্ন থাকলে সংশ্লিষ্ট অভিযোজিত প্রশ্নেও চিত্র থাকবে; শুধু কথায় বদলানো নয়। এরপর যথাক্রমে **২০০/৮০/৫০** এবং **২৫০/১০০/৭০**। canonical catalog অনুযায়ী:

| অধ্যায় | MCQ | CQ | SQ | মোট | চিত্রসহ MCQ/CQ/SQ |
| --- | ---: | ---: | ---: | ---: | --- |
| ৫ — পদার্থের অবস্থা ও চাপ | ২০০ | ৮০ | ৫০ | ৩৩০ | ১২০/৬০/১৫ = ১৯৫ |
| ৬ — বস্তুর ওপর তাপের প্রভাব | ২৫০ | ১০০ | ৭০ | ৪২০ | ৫০/২৫/২০ = ৯৫ |
| মোট | ৪৫০ | ১৮০ | ১২০ | **৭৫০** | **২৯০** |

এগুলো নিজস্ব অনুশীলনী; বোর্ডের হুবহু প্রশ্ন বা যাচাইকৃত সরকারি সাল হিসেবে আরোপ নয়। আগের চার অধ্যায়ের content, generator, verifier, adapter, validation, review ও backup receipt বদলানো হয়নি।

## পড়ার ফাইল ও importer

- **`chapters-5-6-review.html`**: এক ফাইলে ৭৫০ প্রশ্ন, উত্তর–সমাধান ও ২৯০ SVG inline; বাংলা ফন্টও embedded। ইন্টারনেট ছাড়াই পড়া যায়। উপরের link থেকে অধ্যায় বেছে নিন; উত্তর খুলে দেখুন। Print-এর আগে প্রয়োজনীয় উত্তর খুলুন।
- আলাদা `chapter-5-review.html` ও `chapter-6-review.html` একই অধ্যায়গুলো পৃথকভাবে দেয়।
- `content/question-bank/ssc/physics/chapter-5/`: `mcq.json` (২০০), `cq.json` (৮০), `sq.json` (৫০), `validation.json`।
- `content/question-bank/ssc/physics/chapter-6/`: `mcq-1.json` (১২৫), `mcq-2.json` (১২৫), `cq.json` (১০০), `sq.json` (৭০), `validation.json`।
- **validation JSON importer-এ দেবেন না।** চার্টের SHA256, family ও calculation audit সেখানে আছে।
- প্রতিটি import slice অপরিবর্তিত ২০০-record/৭৫০KB সীমার মধ্যে।

প্রস্তুত লাইব্রেরির নতুন adapter দুটি মোট **৭টি Draft card** যোগ করে। Scope `Class 9 → পদার্থবিজ্ঞান → canonical অধ্যায়`। নবম–দশমের জন্য Class 10-এ আলাদা duplicate stock নয়।

**গুরুত্বপূর্ণ:** JSON-এর চিত্রগুলো `https://proshnobook.com/question-bank/ssc-physics-ch5-v1/…svg` এবং `…ch6-v1/…svg`। Assets `public/question-bank/`-এ আছে, কিন্তু **এখনও deploy করা হয়নি**। ফলে live URL সচল হওয়ার দাবি নেই। অফলাইন HTML-এ চিত্র inline থাকায় deploy ছাড়াই দেখা যায়। প্রোডাকশনে import/use করার আগে সংশ্লিষ্ট renderer ও assets deploy করে পরীক্ষা করতে হবে।

## উৎস ও চিত্রের নীতি

বিস্তারিত `source-inspection-ch5-6.json`। Drive-এর সংশ্লিষ্ট দুটি legacy `.doc` নামিয়ে আকার ও SHA256 নথিভুক্ত হয়েছে। `word-extractor 1.0.4` দিয়ে মূল text পাওয়া গেছে; `@kovapdf/bijoy-unicode 1.0.1` রূপান্তর পাঠে সাহায্য করে, কিন্তু Latin unit ও embedded equation ভুল করে। সেগুলো authoritative হিসেবে ব্যবহার করা হয়নি।

Aspose.Words 26.11-এর evaluation HTML export দিয়ে **প্রথম অংশের** চিত্র দেখা গেছে; trial সীমার কারণে পুরো source নয়। কোনো watermark সরানো বা software evaluation restriction পাশ কাটানো হয়নি।

- অধ্যায় ৫-এ হাইড্রোলিক পিস্টন এবং পাশাপাশি তরলস্তম্ভের চিত্র দেখা হয়েছে। ছোট source excerpts ও hash `source-figures/`-এ আছে। নতুন hydraulic প্রশ্নগুলোতে ওই diagram structure অনুসরণ করে **নতুন উপাত্ত ও ভাষায় পুনরঙ্কিত SVG** দেওয়া হয়েছে; বোর্ডের নাম/সাল কপি করা হয়নি। পাশাপাশি স্তম্ভের source diagram শুধু পরিদর্শিত; সেটিকে দুই-স্তরের তরলের হুবহু উৎস হিসেবে দাবি করা হয়নি। নতুন layer diagram নিজস্ব সহায়ক চিত্র।
- অধ্যায় ৬-এর পূর্ণ source-native চিত্রসমষ্টি দেখা যায়নি। তাই “সব source figure মিলে গেছে” বলা হয়নি। স্কেল, দণ্ডের প্রসারণ এবং বরফ গলন/পরে পানির উত্তাপের জন্য **নিজস্ব প্রয়োজনীয় SVG** যোগ করা হয়েছে। না দেখা source প্রশ্নকে চিত্র বাদ দিয়ে অভিযোজিত করার দাবি নেই।
- audit-এ `sourceHadFigure=true` হলে অবশ্যই `hasDiagram=true`; অন্য ক্ষেত্রে null মানে source-native figure status অজানা, “চিত্র ছিল না” নয়।
- **স্থায়ী নিয়ম:** ভবিষ্যতে কোনো source প্রশ্ন অভিযোজিত করলে আগে তার চিত্র/লেবেল/উপাত্ত দেখতে হবে। চিত্র থাকলে সেটি সংযুক্ত বা পরিষ্কারভাবে পুনরঙ্কন করতে হবে। চিত্র পড়া না গেলে প্রশ্নটিকে source-aligned বলে ছাড়বেন না; review pending রাখুন। মূল কাগজে source/board দেখানোর setup option অপরিবর্তিত।

সব নতুন SVG self-contained, script/image/বাহ্যিক font নেই। চিত্র schematic, মাপানুযায়ী নয়। Label-এর তথ্য প্রশ্নের সঙ্গে রাখা হয়েছে; scale drawing মেপে উত্তর বের করার দাবি নেই। লাইভ renderer কেবল নির্দিষ্ট origin/version/chapter path গ্রহণ করে; বাইরের URL, query, traversal, raw SVG/HTML injection গ্রহণ করে না।

## বৈচিত্র্য ও পাঠ্যসীমা

**সংখ্যাভিত্তিক ভ্যারিয়েন্ট আছে—৭৫০টি সম্পূর্ণ স্বাধীন ধারণা নয়।**

- অধ্যায় ৫: ৪০ ধারণাগত MCQ + ১৬ পরিবারে ১০টি করে = ২০০। SQ ৩০ ধারণাগত + ৪ পরিবারে ৫টি করে। CQ ১৬ পরিবারে ৫টি করে; ক–খ–গ–ঘ-তে সংজ্ঞা, শর্ত, হিসাব এবং পরিবর্তিত অবস্থায় বিশ্লেষণ। MCQ key ৫০টি করে A/B/C/D।
- অধ্যায় ৬: ৫০ ধারণাগত MCQ + ২০ পরিবারে ১০টি করে = ২৫০। SQ ৩০ ধারণাগত + ৮ পরিবারে ৫টি করে। CQ ২০ পরিবারে ৫টি করে। MCQ key A/B/C/D: ৬৩/৬৩/৬২/৬২।

অধ্যায় ৫-এ পদার্থের অবস্থা/কণার গতি, ব্যাপন, ঘনত্ব, চাপ/পীড়ন, তরলের গেজ/পরম চাপ, স্তরভিত্তিক চাপ, প্যাসকেল/হাইড্রোলিক, প্লবতা/আপাত ওজন/ভাসা, strain ও Young modulus আছে। গাণিতিক পরিবার: pressure, force, area, density, layers, hydro, depth, absolute, hydraulic, hydraulic-distance, buoyant, apparent, float, stress, strain, young।

অধ্যায় ৬-এ তাপ বনাম তাপমাত্রা, স্কেল/স্থিরাঙ্ক, রৈখিক/ক্ষেত্র/আয়তন প্রসারণ, তরলের প্রকৃত/আপাত প্রসারণ, পানির ব্যতিক্রম, আপেক্ষিক তাপ/তাপধারণ, তাপমিতি, গলন/বাষ্পীভবন, সুপ্ততাপ ও হিটারের সময় আছে। পরিবার: c-f, f-c, c-k, k-c, scale, delta-f, linear, final-length, area-exp, volume-exp, liquid-exp, apparent-exp, heat, specific, capacity, mix, melt, vapor, ice-water, heating-time।

**পূর্ণ textbook/page alignment, সর্বশেষ syllabus-এর পূর্ণ coverage এবং স্বাধীন শিক্ষক যাচাই বাকি।** বিশেষত সমদিকীয় প্রসারণের আনুমানিক সম্পর্ক, apparent liquid expansion, Young modulus ও বহু-ধাপ তাপের প্রয়োগের SSC স্তর শিক্ষককে মিলিয়ে দেখতে হবে। প্রত্যেক CQ পরিবারের বিশ্লেষণের কাঠামো পুনরাবৃত্ত; আরও ভাষাগত/ধারণাগত বৈচিত্র্য উন্নয়নের সুযোগ আছে।

## গণনার শর্ত

- চাপের ক্ষেত্রে লম্ব বল ও ক্ষেত্রফল; স্থির সমঘন তরলে ρgh। গেজ ও পরম চাপ আলাদা। স্থিতিশীল স্তরে হালকা তরল ওপরে।
- হাইড্রোলিক বলের ক্ষেত্রে একই স্তর, ক্ষয় ও পিস্টনের ওজন উপেক্ষা। সরণে অসংকোচনীয় তরলের আয়তন সংরক্ষণ।
- প্লবতায় অপসারিত আয়তন; ভাসায় অন্য উল্লম্ব বল নেই। ঝোলানো বস্তুর টান ধনাত্মক; ধ্রুব ঘনত্বে গভীরতা বাড়ালেই প্লবতা বাড়ে না।
- Young ও Hooke-এর ক্ষেত্রে স্থিতিস্থাপক রৈখিক সীমা। strain এককহীন।
- কেলভিন offset **273.15** স্পষ্ট; ব্যবধানে offset যোগ নয়। C/F ব্যবধানেও 32 যোগ নয়।
- প্রসারণে ছোট পরিবর্তন, ধ্রুব সহগ ও প্রয়োজনমতো সমদিকীয় শর্ত; 2α/3α আনুমানিক। বড় করে আঁকা diagram প্রকৃত scale নয়।
- তাপমিতিতে ক্ষয় ও পাত্রের তাপধারণ নগণ্য; একই c, কোনো দশা পরিবর্তন নেই বলে উল্লেখ। বরফ গলনের প্রশ্নে বরফ অবশিষ্ট থাকলে সাম্য তাপমাত্রা 0°C; পরবর্তী উষ্ণায়নে mL+mcΔT।
- হিসাব exact rational-এ; ফল সর্বোচ্চ ছয় দশমিক। ছোট volume-change-এ প্রদর্শিত ফল গোল করা। প্রদর্শিত input exact ছয় দশমিকে আছে কিনা verifier পরীক্ষা করে; লুকানো গোল-করা input থেকে exact answer নয়।

## মানবণ্টন ও নিরাপত্তা

আগের owner screenshot অপরিবর্তিত: ২৫ MCQ সব (২৫), ৭ CQ থেকে ৪ (৪০), ৭ SQ থেকে ৫ (১০); তত্ত্বীয় ৭৫ + ব্যবহারিক ২৫; মোট তত্ত্বীয় সময় ১৮০ মিনিট। CQ ১–২–৩–৪ existing importer convention। ছবির বাইরে সরকারি সাল বা পৃথক timing বানানো হয়নি। ব্যবহারিক প্রশ্ন নয়; Physics Auto Model unsupported block অপরিবর্তিত।

Preview read-only। Explicit ADMIN acknowledgement ও unchanged digest ছাড়া save নয়; save হলেও Pending/approved=false। পরীক্ষায় **mock DB** ব্যবহৃত, আসল import নয়। আগের approved stock, English flow, header/autofill, Smart/Dynamic/saved template, payment/access workflow অপরিবর্তিত।

ছয় অধ্যায়ের স্থানীয় খসড়া মোট: **১৫৫০ MCQ + ৭০০ CQ + ৪৯০ SQ = ২৭৪০**। এটি live inventory নয়। মোট prepared registry **১৬১ card / ১৫৩৫৬ record**, Physics ২২ card।

## যাচাই

```sh
python scripts/question-bank/build-ssc-physics-ch5.py --check
python scripts/question-bank/build-ssc-physics-ch6.py --check
python scripts/question-bank/build-ssc-physics-ch5-6-review.py --check
python scripts/question-bank/verify-ssc-physics-ch5-6.py
node --test tests/ssc-physics-ch1.test.cjs tests/ssc-physics-ch2.test.cjs tests/ssc-physics-ch3.test.cjs tests/ssc-physics-ch4.test.cjs tests/ssc-physics-ch5-6.test.cjs
node --test --test-name-pattern='selection is not authority|SSC Physics chapters 5 and 6' tests/prepared-library.test.cjs
node --test tests/ssc-math-ch17-targets.test.cjs tests/ssc-math-release.test.cjs
npm run typecheck
```

ফল: নতুন দুই অধ্যায়ে unique structure/count/hash/২০০-limit PASS। পৃথক read-only verifier-এ **৪২০ numeric MCQ/SQ** ও **১৮০ CQ primary/secondary** হিসাব PASS; **২৯০টি** local/inline SVG reference/hash/safety PASS। ৬ অধ্যায়ের focused tests **৩০/৩০ PASS**; বাস্তব registry authority/new ৭-card Pending mock tests **২/২ PASS**; পুরোনো statistics/math release renderer+guard regression **১৭/১৭ PASS**; TypeScript PASS। পূর্বের ১–৪ generator `--check` ও verifier-ও PASS।

অফলাইন review Chromium-এ ১২৮০px ও ৩৯০px-এ খোলা হয়েছে: সব article/SVG আছে, বাংলা font loaded, horizontal overflow নেই, external network request নেই। `ch5-6-browser-check.json` ও চারটি screenshot evidence রাখা হয়েছে। প্রথম browser launch-এ runtime library অনুপস্থিত ছিল; cache-এ bundled Chromium library ব্যবহার করে পুনরায় সফল পরীক্ষা। Full repository suite/production build/live-site browser/DB run করা হয়নি। Automated tests শিক্ষক certification নয়।

## ব্যাকআপ

এই দুই অধ্যায়ের import JSON, validation, ২৯০ SVG, offline review, নির্দেশিকা, উৎসপরিদর্শনের evidence এবং প্রাসঙ্গিক generator/verifier/adapter/test এক ZIP-এ Drive backup। আকার ও remote/local MD5 মিলিয়ে receipt `chapters-5-6-drive-backup-receipt.json`-এ রাখা হবে। Receipt নিজের archive-এর মধ্যে থাকে না। Raw source Word ও temporary tools cache-এ, backup-এ পূর্ণ source বই পুনর্বিতরণ নয়।
