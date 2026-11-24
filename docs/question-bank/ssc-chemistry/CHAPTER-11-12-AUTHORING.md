# রসায়ন অধ্যায়১১–১২ — পূর্ণসংখ্যার স্থানীয় খসড়া

**অবস্থা: DRAFT, শিক্ষক-অনুমোদিত নয়; database import, approval, publication বা deploy হয়নি।** আগের `PARTIAL-108` checkpoint একটি ঐতিহাসিক snapshot। সেটিকে মুছে বা সম্পূর্ণ বলে পুনর্লেবেল করা হয়নি। এখনকার canonical ফাইল নিচের দুটি directory-তে; আংশিক ওপূর্ণ খসড়া যোগ করে প্রশ্ন গণনা করা যাবে না।

| অধ্যায় | MCQ | CQ | SQ | মোট | নির্বাচিত উৎস | নিজস্ব অনুশীলনী |
|---|---:|---:|---:|---:|---:|---:|
|১১ — খনিজ সম্পদ: জীবাশ্ম|700|200|100|1000|9|991|
|১২ — আমাদের জীবনে রসায়ন|350|50|70|470|9|461|
|মোট|1050|250|170|1470|18|1452|

## ফাইল ওপড়ার ক্রম

- `content/question-bank/ssc/chemistry/chapter-11/`: সাতটি MCQ, দুটি CQ ওএকটি SQ JSON slice; প্রতিটি100প্রশ্ন।
- `content/question-bank/ssc/chemistry/chapter-12/`: চারটি MCQ slice(100/100/100/50), CQ50ওSQ70।
- প্রতিটির `validation.json`: লক্ষ্য/বাস্তব সংখ্যা, origin/family, source evidence, dataset inputs, file/item location, প্রশ্ন/file/assetSHA256।
- `chapter-{11,12}-source-intake.json`: পূর্বে নির্বাচিত নয়টি করে উৎস, বর্জনের কারণ ওসীমা।
- `docs/question-bank/ssc-chemistry/chapter-11-12-review.html`:১৪৭০প্রশ্নের স্বয়ংসম্পূর্ণ offline review, উত্তর/সমাধান খুলে পড়া যায়। পৃথক `chapter-11-review.html` এবং `chapter-12-review.html`ও আছে।
- `lib/ssc-chemistry-ch{11,12}-batches.ts`: স্থানীয় prepared-library draft registration, DBwrite নয়।

## উৎসের সীমানা

১৮টি নির্বাচিত উৎসের মধ্যে১৫টি পাঠ্যবই,৩টি সীমিত Satt অনুসন্ধান। সব key/solution স্বাধীনভাবে নিজস্ব রচিত; উৎসের official answer-key হিসেবে দাবি নয়। Website-onlyMymensingh2023পরিচয় মূল বোর্ডপত্রে যাচাই করা হয়নি। পাঠ্যবইয়ের বানান/টাইপোগ্রাফি-normalizationসীমা ওমূল pixelপ্রমাণ পূর্বের intake/manifest-এ আছে। সম্পূর্ণ webbank/সব বোর্ডের প্রশ্ন সংগ্রহের দাবি নয়। এবার সংখ্যাপূরণের অতিরিক্ত১৩৬২টি প্রশ্ন নিজস্ব সাধারণ বোর্ড-ধাঁচের অনুশীলনী; নতুন ঐতিহাসিক প্রশ্ন আবিষ্কারের দাবি নয়।

সাতটি nativePNGঅপরিবর্তিত: চারটি পূর্ণ exercise page ওতিনটি প্রকৃত stimulus crop। পূর্ণপাতা প্রমাণের জন্য; পাতার সব প্রশ্নকে গণনায় নেওয়া হয়নি। বাদ দেওয়া ভুল/অনিরাপদ প্রশ্ন ছবিতে দেখা যেতে পারে—সেগুলোর নিজস্ব answerkey বানানো হয়নি। তিনটি source-stimulusURLকেবল নির্দিষ্ট host/path/filenameএ renderer allowlist করা হয়েছে; traversal/query/hash/অন্যhostনয়। অধ্যায়১২এর নির্বাচিত প্রশ্নের কোনো হারানো অপরিহার্য figure কল্পনা করে আঁকা হয়নি।

**অব্যাহত exclusions:** অধ্যায়১১এর ভুল natural-gaspercentageMCQ, মুদ্রিত অসমতাকৃত`2CH₄→HC≡CH+H₂`CQ ওঅস্পষ্ট plasticবক্তব্য; অধ্যায়১২এর bakingpowder/বদহজমCQওহারানো figure। নতুন স্বাধীন প্রশ্নে সঠিক methane→ethyneসমীকরণ স্পষ্টভাবে নিজস্ব মডেল; বাদ দেওয়া মূলপ্রশ্নের নীরব সংশোধন নয়।

## পুনরাবৃত্ত ধারণা ওভ্যারিয়েন্ট: স্বতন্ত্র বোর্ড প্রশ্নের দাবি নয়

অনুশীলনের পরিচয়/গঠন/সূত্র/মোলারভর/দহন/ব্যাখ্যা আলাদা কাজ। কিন্তু একই পরিচিত পদার্থ বা বিক্রিয়া একাধিক formatএ ফিরেছে; সবকটিকে স্বতন্ত্র গভীর ধারণা বা ঐতিহাসিক প্রশ্ন বলা যাবে না। Normalizedstemভিন্ন থাকা semanticস্বাধীনতার প্রমাণ নয়।

অধ্যায়১১এ৩০টি নির্দিষ্ট অশাখিত গঠন,৩০টি নিট বিক্রিয়া,১৫গঠনজোড়া,৮পেট্রোলিয়ামভগ্নাংশ,২০বিক্রিয়াভিত্তিক ভরডেটাসেট,১০কাল্পনিক গ্যাস-সংযুতি,৮পলিমার ও৪৬টি literalপ্রসঙ্গকার্ড। অধ্যায়১২এ২০পদার্থকার্ড,২০নিটবিক্রিয়া,১৫কাল্পনিকবিশুদ্ধতা/মজুতডেটা,৪৫literalপ্রসঙ্গকার্ড। আগের literalcoreপ্রশ্নও অক্ষুণ্ণ। Ledgerএ family/inputsএই sharedcontextওগণনার ভিত্তি দেখায়। একই গাণিতিকধাঁচে শুধু নাম/সংখ্যা বদলে ঐতিহাসিক provenance তৈরি করা হয়নি; মৌলিক drillওআছে, পেশাগত item-analysis/teacher certification নয়।

CQক–খ–গ–ঘতে1/2/3/4অনুশীলনের প্রচলন। এটি যাচাইকৃত officialChemistryexamblueprintএর ঘোষণা নয়। ChemistryAutoModelএর অনুমতি খোলা হয়নি।

## বৈজ্ঞানিক ওসুরক্ষা-সংশোধন

- সূত্র দিয়ে একক isomerধরা হয়নি: গঠনভিত্তিক প্রশ্নে সংযোগ স্পষ্ট; আণবিকসূত্র একাই সবসময় শ্রেণি/নাম নির্ধারণ করে না। মিথেনেC–Cনেই—অ্যালকেনের সাধারণ এককসমযোজী-বন্ধনভিত্তিক পরিচয় ব্যবহার করা হয়েছে।
- প্রকৃত গ্যাসক্ষেত্রের সংযুতি নয়: দশটি gasdatasetস্পষ্ট কাল্পনিক, একইT/Pতেvol%। সম্পূর্ণদহন ওপর্যাপ্তO₂প্রকাশিত শর্ত।
- ভগ্নাংশ স্ফুটনপরিসরের মিশ্রণ; সব উপাদানের এক নির্দিষ্ট সূত্র/স্ফুটনাঙ্ক নয়। কিছু বাস্তবপরিসর overlapকরতে পারে।
- সব plasticপুনরায় গলে না; thermoplastic/thermosetভেদ ওবর্জ্যনিরাপত্তার সীমা আগের coreএও আছে। প্রাকৃতিক উৎস মানেই সব পরিবেশে দ্রুতপচন/নিরাপত্তা নয়।
- bakingpowderএক মিশ্রণ, বিশুদ্ধNaHCO₃নয়। ভিনেগার/সার/সংরক্ষক/ব্লিচের গণনা কোনো প্রস্তুতিরেসিপি, প্রয়োগডোজ বা চিকিৎসা নয়।
- ব্লিচের সঙ্গে অম্ল/অ্যামোনিয়ামেশানো এড়ানোর স্পষ্টনীতি। সমীকরণ কেবল তাত্ত্বিক বিপদব্যাখ্যা। `[O]`ঐতিহাসিক schoolnotation; বাস্তবেHOCl/OCl⁻ওpHগুরুত্বপূর্ণ।
- Ca(OCl)Clবাণিজ্যিক bleachingpowderএর সরল মডেল; সব প্যাকেটে একক বিশুদ্ধযৌগের দাবি নয়। Ca(H₂PO₄)₂এর গণনা নির্দিষ্ট অনার্দ্রমডেল; বাস্তবTSPজল/গ্রেডভিন্ন।
- শুধুNH₄⁺উদ্ভিদের একমাত্রNউৎস নয়। মোটপুষ্টিমৌল, উদ্ভিদলভ্যতা ওNPKঅক্সাইডসমতুল্য আলাদা। স্কিনpHবা ফেনা/সুগন্ধ নিরাপত্তা/জীবাণুনাশের এককসনদ নয়।

## বর্তমান registry: পুনর্গণনা ওআগের aggregateসংশোধন

মোট274batch/27126record; নতুন16batch/1470record, আগের258batch/25656recordঅক্ষুণ্ণ। Chemistry1–12মোট8110স্থানীয়অনুমোদনহীনখসড়া। **বর্তমান recordkindপুনর্গণনায়5500MCQ/1550CQ/1060SQ**। আগেরনোটে1–10এর4550/1300/790বণ্টনটি যোগফলেরভুল; প্রকৃত4450/1300/890=6640। প্রশ্নবদলে সংখ্যা মেলানো হয়নি; বর্তমান testsবাস্তবrecordsগণনা করে।

## পরীক্ষা ওসীমা

- আগেরঅধ্যায়/source/checkpoint/modelpolicy regression160PASS; নতুনচূড়ান্ত13PASS; পৃথকprepared-libraryUI/selection2PASS। বিস্তারিত সময়/logSHA256 `chapter-11-12-checks.json`।
- Strict realuploadparser, bounded16slice, normalizedunique1470stem, চারটি স্বতন্ত্রMCQoption, fullCQparts/solution, নয়টি করে sourcefidelity, প্রমাণ/ledger/file/assetSHA256, deterministicregeneration।
- স্বাধীন JSগণনায়৫০নিটবিক্রিয়ারপরমাণুসমতা; formula/mass/element%/দহন/gascomposition/inventory/stoichiometryMCQপুনর্গণনা। Literalদাবির সবগুলি expertপর্যালোচিত দাবি নয়।
- Sourceextractor`--check`:মূলPDFSHA256যাচাইসহসাতটিPNGবাইটসমান।
- বিস্তৃতprepared-library/catalog/digestsubset120secondএশুধুTAPheaderদিয়েtimeout; ownprocessবন্ধকরা হয়েছে। সেটিPASSনয়; fullmockDBsuite, productionNextbuild, fullapptypecheck, browser/printauditওteacherreviewএবারসম্পন্ননয়।

## পুনর্গঠন ওব্যাকআপ

```sh
python scripts/question-bank/prepare-ssc-chemistry-ch11-12-checkpoint.py --check
python scripts/question-bank/build-ssc-chemistry-ch11-12-checkpoint.py --check
python scripts/question-bank/build-ssc-chemistry-ch11.py --check
python scripts/question-bank/build-ssc-chemistry-ch12.py --check
python scripts/question-bank/review-ssc-chemistry-ch11-12.py --check
# Original PDF ওPyMuPDF প্রয়োজন:
python scripts/question-bank/extract-ssc-chemistry-ch11-12-checkpoint.py ORIGINAL.pdf --check
# TypeScript থাকা NODE_PATH (বা সাধারণ installed dependencies) দিয়ে:
node --test tests/ssc-chemistry-ch11-12.test.cjs
python scripts/question-bank/package-ssc-chemistry-ch11-12.py
```

ZIPওdependencycacheGitএনয়। Persistentবিল্ডস্ক্রিপ্ট/JSON/চিত্র/reviewআছে। Backupবর্তমানrepositoryরchapterrestorebundle, পূর্ণbootstrappableappনয়; sharedregistry/parsermoduleএআগেরঅধ্যায়েরdependenciesপ্রয়োজন। LocalZIPCRC/per-entrySHA256যাচাই হয়; Driveuploadএরপৃথকmetadatareadbackreceiptএsize/MD5মিলনথাকবে। Remote rawbyteডাউনলোডনা হলেSHA256downloadverificationদাবিনয়। পুরোনোPARTIALarchiveঅক্ষুণ্ণ, নতুনসম্পূর্ণসংখ্যারarchiveআলাদা।
