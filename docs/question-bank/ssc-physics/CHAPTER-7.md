# অধ্যায় ৭ — তরঙ্গ ও শব্দ: চিত্রসহ reviewable খসড়া

## পরিমাণ ও অবস্থা

| ধরন | প্রশ্ন | চিত্রসহ |
|---|---:|---:|
| MCQ | ২০০ | ১০০ |
| CQ | ১০০ | ৭০ |
| SQ | ৭০ | ২৫ |
| মোট | **৩৭০** | **১৯৫** |

প্রতিটিতে উত্তর/ব্যাখ্যা আছে; CQ-তে ক/খ/গ/ঘ = ১/২/৩/৪। এটি নিজস্ব অনুশীলনী, বোর্ডের হুবহু প্রশ্ন বা শিক্ষক-সার্টিফায়েড সংগ্রহ নয়। **DRAFT: database-এ import, approval, publication বা production deploy হয়নি।** আগের ছয় অধ্যায়ের প্রশ্ন/উত্তর/চিত্র/রিভিউ ও backup অপরিবর্তিত।

- আগে ৬ অধ্যায়ে ২৭৪০টি; এখন ৭ অধ্যায়ে ৩১১০টি খসড়া (১৭৫০ MCQ / ৮০০ CQ / ৫৬০ SQ)। এটি local prepared-library হিসাব, live stock নয়।
- Prepared registry-তে নতুন ৩টি Draft card: `ssc-physics-ch7-{mcq,cq,sq}-v1`। পুরো registry: ১৬৪টি card / ১৫৭২৬টি record, এর মধ্যে পদার্থবিজ্ঞান ২৫টি card।
- মালিকের দেওয়া মানবণ্টন অপরিবর্তিত: MCQ ২৫টি সব; CQ ৭টি থেকে ৪; SQ ৭টি থেকে ৫; তত্ত্বীয় ৭৫ + ব্যবহারিক ২৫; ১৮০ মিনিট। Physics Auto Model এখনো blocked; এই অধ্যায় পূর্ণ সিলেবাসের মডেল নয়।

## কীভাবে দেখবেন

1. `chapter-7-review.html` ব্রাউজারে খুলুন। সব ১৯৫টি SVG ও বাংলা font inline আছে; internet লাগে না।
2. “উত্তর ও সমাধান” খুললে উত্তর এবং CQ-এর চার অংশ দেখা যাবে। Print-এর আগে প্রয়োজনীয় details খুলুন।
3. বিষয়বস্তু, মান, বৈচিত্র্য, ভাষা, সূত্রের অনুমান ও পূর্ণ বইয়ের পাঠ্যসীমা শিক্ষককে দিয়ে যাচাই করাতে হবে। স্বয়ংক্রিয় পরীক্ষা সেই মূল্যায়নের বিকল্প নয়।

### JSON ও চিত্র

- `content/question-bank/ssc/physics/chapter-7/mcq.json` — ২০০ MCQ
- `cq.json` — ১০০ CQ; `sq.json` — ৭০ SQ
- `validation.json` — পরিমাণ, exact rational হিসাব, শর্ত, provenance ও SVG hash; **import করবেন না**।
- `public/question-bank/ssc-physics-ch7-v1/` — ১৯৫টি self-contained SVG।
- Strict importer selection: `Class 9` → `পদার্থবিজ্ঞান` → `৭ম অধ্যায়: তরঙ্গ ও শব্দ`। SSC-র canonical catalog-এ Class 9 ব্যবহার হয়।
- JSON-এর diagram URL production origin-এর versioned path; live asset deploy হয়নি। এখন সরাসরি offline HTML-তে চিত্র দেখুন। ভবিষ্যৎ অনুমোদিত deploy/import-এর আগে assets যাচাই জরুরি। বর্তমানে কেবল চিত্রের নির্দিষ্ট chapter/version/path allowlisted; arbitrary SVG host, query, traversal বা HTML অনুমোদিত নয়।
- Source/board display-এর বিদ্যমান setup option অপরিবর্তিত; নতুন অনুশীলনীতে অযাচাইকৃত board/year badge নেই।

## বৈচিত্র্য ও numeric variants — স্পষ্ট সীমা

- ৪০টি ধারণাভিত্তিক MCQ + ১৬ পরিবার × ১০টি সংখ্যাভিত্তিক MCQ = ২০০।
- ৪০টি ধারণাভিত্তিক SQ + ৬ পরিবার × ৫টি সংখ্যাভিত্তিক SQ = ৭০।
- CQ-তে ২০ পরিবার × ৫টি উপাত্তভিত্তিক variant = ১০০। প্রতিটি গ/ঘ-এর মূল ও পরিবর্তিত অবস্থার ফল পৃথকভাবে হিসাব করা হয়েছে।
- সংখ্যা পাল্টানো একই পরিবারের প্রশ্নকে সম্পূর্ণ আলাদা ধারণা বলা হচ্ছে না। সব প্রশ্নের stem আলাদা হলেও ৩৭০টি স্বতন্ত্র ধারণা নয়; শিক্ষক দিয়ে গুণমান/পুনরাবৃত্তি যাচাই বাকি।
- বিষয়: যান্ত্রিক তরঙ্গ, স্থানীয় কণাদোলন ও শক্তি সঞ্চালন, অনুপ্রস্থ/অনুদৈর্ঘ্য, A/λ/f/T/v, সংকোচন–প্রসারণ, spatial/time graph, তীক্ষ্ণতা/জোর/তীব্রতা/স্বরগুণ, শ্রাব্য সীমা, প্রতিধ্বনি, অনুনাদ (resonance), অনুরণন (reverberation), শব্দদূষণ, একমুখী পথ, সোনার, দুই মাধ্যম, কুয়া ও চলমান শ্রোতা।
- দেওয়া `v = 331 + 0.6θ` একটি **সীমিত তাপমাত্রার supplied approximate model**, উৎস/বইয়ের হুবহু সূত্র হিসেবে দাবি নয়। দশমিক উত্তর সর্বোচ্চ ছয় ঘর, half-up rounding; হিসাবের ভিতরে exact Fraction।

## উৎস ও স্থায়ী চিত্র-নির্দেশ

উৎস: Drive `07. 9 Phy Chap 07.doc`, ID `19SQykjLifA2BIeWEPOzyxXVh8nZvRu-D`। বিশদ evidence: `source-inspection-ch7.json`; চারটি আংশিক native export `source-figures/ch7-source.*.png`। এগুলো evidence, নতুন প্রশ্নের প্রকাশযোগ্য asset নয়।

- Legacy Word থেকে raw text পাওয়া গেছে, কিন্তু Bijoy→Unicode-এ Latin unit/equation বিকৃত হয়। একে নির্ভুল বৈজ্ঞানিক transcription বলা হয়নি। Aspose evaluation export প্রথম ২০২টি loaded paragraph পর্যন্ত সীমিত; **পুরো উৎস/সব চিত্র/বই/পৃষ্ঠা দেখা হয়নি**।
- প্রশ্নের longitudinal-train চিত্র দেখা গেছে; নতুন উপাত্ত/ভাষায় train পুনরঙ্কিত। Well ও চলমান ব্যক্তির চিত্র উৎসের solution-এ দেখা গেছে—এগুলোকে native question figure বলে দাবি করা হয়নি। সংশ্লিষ্ট সব নতুন variant-এও চিত্র আছে।
- **উৎসের চিত্রনির্ভর প্রশ্ন অভিযোজিত করলে চিত্র বাদ দেওয়া যাবে না।** না-দেখা চিত্রের সম্পূর্ণতা যাচাই হয়েছে বলা যাবে না।
- নতুন SVG মূল চিত্রের screenshot নয়। Wave graph-এ ২টি পূর্ণ চক্র বাস্তবেই এঁকে ২λ/২T মাপ দেওয়া হয়েছে; longitudinal train-এর পরপর compression-এর দূরত্ব এক λ। Numeric data পরিবর্তিত; source-এর original cycle/time count হুবহু পুনর্মুদ্রণ নয়।
- চলমান শ্রোতার echo-তে আদি দূরত্ব ও ভ্রমণকালীন সরণ রাখা হয়েছে। পালস ছাড়ার পর উৎসের গতি শব্দবেগ পাল্টায় না।
- কুয়ার দুটি আগমন **ইলেকট্রনিক প্রেরক–গ্রাহকে পালস শনাক্তকরণ**; মানুষ সবসময় দুটি পৃথক শব্দ শুনবে বলা হয়নি। দুই একমুখী মাধ্যম-পথের প্রশ্নকে echo বলা হয়নি।
- চিত্র schematic, মাপানুযায়ী নয়; কিন্তু দিক, path ও পূর্ণ চক্রসংখ্যা শর্তের সঙ্গে সামঞ্জস্যপূর্ণ। অনুদৈর্ঘ্য চিত্র বায়ুতে শব্দের জন্য; দড়ির graph অনুপ্রস্থ তরঙ্গ হিসেবে বলা আছে।

## পুনরায় যাচাই

```sh
python scripts/question-bank/build-ssc-physics-ch7.py --check
python scripts/question-bank/verify-ssc-physics-ch7.py
node --test tests/ssc-physics-*.test.cjs
node --test --test-name-pattern='SSC Physics chapter 7:' tests/prepared-library.test.cjs
npm run typecheck
```

Browser test-এর জন্য `puppeteer-core`, `@sparticuz/chromium` ও তার Linux runtime লাগবে; dependency/tool cache স্থায়ী source নয়। `scripts/question-bank/check-ssc-physics-ch7-review.cjs` offline ১২৮০/৩৯০px-এ সব উত্তর খুলে font, ৩৭০ article, ১৯৫ SVG, overflow, SVG label clipping ও external request পরীক্ষা করে; screenshot ও `ch7-browser-check.json` evidence আছে।

এই কাজের checks: সব ৭ builder `--check`, সব chapter verifier, ৩৬ Physics tests, real-registry catalog ও chapter-7 mock-save tests, ৫ paper-math tests, TypeScript ও offline browser PASS। বড় একসঙ্গে registry test selection ১৮০s-এ timeout হয়েছিল; orphan থামিয়ে ছোট selection-এ সংশ্লিষ্ট পরীক্ষা PASS হয়েছে। **Full repository suite/build/live DB/production deployment পরীক্ষা করা হয়নি।**

## Backup

Drive-এ JSON, manifest, SVG, offline review, evidence ও সংশ্লিষ্ট code/tests-এর ZIP রাখা হবে/রাখা হয়েছে; চূড়ান্ত ID, আকার ও hash `chapter-7-drive-backup-receipt.json`-এ থাকবে। Receipt-ই upload/verification-এর authoritative record; নিজের receipt নিজের ZIP-এ থাকে না। মূল Word/source tools এবং আগের chapter-এর backup পুনরায় upload করা হয়নি। অনুমতি ছাড়া প্রকাশ নয়।
