# বাকি অধ্যায় ৮–১৪ — ২৫০ MCQ / ১২০ CQ / ১০০ SQ করে খসড়া

## ফলাফল

| অধ্যায় | বিষয় | MCQ | CQ | SQ | চিত্রসহ প্রশ্ন |
|---|---|---:|---:|---:|---:|
| ৮ | আলোর প্রতিফলন | ২৫০ | ১২০ | ১০০ | ২২৫ |
| ৯ | আলোর প্রতিসরণ | ২৫০ | ১২০ | ১০০ | ১৫০ |
| ১০ | স্থির বিদ্যুৎ | ২৫০ | ১২০ | ১০০ | ১৮০ |
| ১১ | চল বিদ্যুৎ | ২৫০ | ১২০ | ১০০ | ২২০ |
| ১২ | বিদ্যুতের চৌম্বক ক্রিয়া | ২৫০ | ১২০ | ১০০ | ৩৬৫ |
| ১৩ | আধুনিক পদার্থবিজ্ঞান ও ইলেকট্রনিক্স | ২৫০ | ১২০ | ১০০ | ২০০ |
| ১৪ | জীবন বাঁচাতে পদার্থবিজ্ঞান | ২৫০ | ১২০ | ১০০ | ৩৮০ |
| **নতুন মোট** | **৭ অধ্যায়** | **১৭৫০** | **৮৪০** | **৭০০** | **১৭২০** |

**নতুন ৩২৯০ প্রশ্নের প্রতিটিতে উত্তর/ব্যাখ্যা আছে। CQ-তে ক/খ/গ/ঘ = ১/২/৩/৪ এবং মূল ও পরিবর্তিত অবস্থার হিসাব আছে। সবই নিজস্ব DRAFT; বোর্ডের হুবহু প্রশ্ন নয়।** শিক্ষক অনুমোদন, database import, publication বা production asset/site deploy হয়নি।

আগের ৭ অধ্যায়সহ মোট **৬৪০০ খসড়া = ৩৫০০ MCQ + ১৬৪০ CQ + ১২৬০ SQ**। এটি local prepared-library সংখ্যা, live stock নয়। পুরোনো ৫২৪টি question/validation/SVG/individual-review artifact-এর SHA-256 অপরিবর্তিত (`ch8-14-prior-artifacts.json`)। পুরোনো backup ও receipt-ও বদলানো হয়নি। অধ্যায় ৭-এর adapter-এ শুধু ভুল `source-inspection-ch7-6.json` pointer সংশোধন করে বিদ্যমান `source-inspection-ch7.json` করা হয়েছে; পুরোনো প্রশ্ন/সমাধান/manifest/চিত্রে পরিবর্তন নয়।

## রিভিউ ও ফাইল

- **প্রধান deliverable: `chapters-8-14-review.html`** — এক ফাইলে ৩২৯০ প্রশ্ন, jump link, inline বাংলা font ও সব ১৭২০টি SVG; internet লাগে না।
- `chapter-{8..14}-review.html` — আলাদা অধ্যায়ভিত্তিক offline review।
- “উত্তর ও সমাধান” খুললে উত্তর ও CQ-এর চার অংশ দেখা যায়। Print-এর আগে প্রয়োজনীয় details খুলুন।
- `content/question-bank/ssc/physics/chapter-{8..14}/`: প্রতি অধ্যায়ে `mcq-1.json` (১২৫), `mcq-2.json` (১২৫), `cq.json` (১২০), `sq.json` (১০০)। এগুলো strict-import JSON; **`validation.json` import input নয়**।
- `public/question-bank/ssc-physics-ch{8..14}-v1/`: নতুন versioned self-contained SVG। JSON-এর production URL এখনো deploy হয়নি; আপাতত offline review-তেই সব চিত্র দেখুন। অনুমোদিত ভবিষ্যৎ import/deploy-এর আগে asset URL যাচাই জরুরি।
- Canonical selection: `Class 9` → `পদার্থবিজ্ঞান` → সংশ্লিষ্ট অধ্যায়। SSC catalog এভাবেই সংরক্ষিত। উৎসে ১৪তম অধ্যায় পাওয়া গেলেও catalog-এ ছিল না; এখন শুধু সেই অনুপস্থিত অধ্যায়টি যোগ হয়েছে। অন্য class/subject বা template flow বদলায়নি।
- নতুন **২৮টি Draft card**, সব মিলিয়ে registry **১৯২ card / ১৯০১৬ record**, এর মধ্যে Physics **৫৩ card / ৬৪০০ draft**। কোনো live inventory দাবি নয়। বিদ্যমান ADMIN consent, digest check, read-only preview ও Pending-only save guard বজায় আছে।

## বৈচিত্র্য, variant ও পাঠ্যসীমা

প্রতি অধ্যায়ে:
- ১০টি ধারণাভিত্তিক MCQ + ২৪টি numerical family-এর ১০টি করে variant = ২৫০ MCQ।
- ২৪টি family-এর ৫টি করে CQ variant = ১২০ CQ।
- ২০টি ধারণা/ব্যাখ্যাভিত্তিক SQ + প্রথম ১৬টি numerical family-এর ৫টি করে variant = ১০০ SQ। ধারণাভিত্তিক ১০টি SQ একই MCQ ধারণার ব্যাখ্যা-রূপ; বিষয়গত পুনরাবৃত্তি গোপন নয়।

**৩২৯০টি আলাদা stem মানে ৩২৯০টি স্বাধীন ধারণা নয়।** সংখ্যা পাল্টানো ও inverse/comparison family আছে। কেবল quota পূরণে নতুন chapter বা fictitious board/year বানানো হয়নি; কিন্তু গুণমান, বৈচিত্র্যের পর্যাপ্ততা, সঠিক প্রশ্নস্তর, CQ rubric ও পরীক্ষার পাঠ্যসীমা স্বাধীন শিক্ষককে দিয়ে যাচাই বাকি। বিশেষত সংলগ্ন lens, ধারকের শক্তি, magnetic-force/flux, transistor gain, pulse-resolution, photon-energy ও absorbed-dose-এর কিছু model প্রশ্নেই সরবরাহ করা হয়েছে—সবগুলো prescribed SSC syllabus-এর ভিতরে আছে বলে দাবি নয়। এগুলো শিক্ষক যাচাইয়ে বাদ/সংশোধনযোগ্য অনুশীলনী।

পরিবারগুলো reflection angles/plane mirror/spherical-mirror image; Snell/index/apparent depth/lens power/image; Coulomb/field/potential/charge-sharing/capacitor; Ohm/series-parallel network/energy/bill/internal resistance; transformer/efficiency/transmission/motor/induction; atomic bookkeeping/decay/semiconductor/radio; ultrasound/X-ray/ECG/tracer/units অন্তর্ভুক্ত করে।

হিসাবে exact rational arithmetic; ফল সর্বোচ্চ ছয় দশমিক, half-up rounding। `4/3`-এর মতো input আংশিক decimal করে লুকানো হয়নি। ক্ষুদ্র X-ray মানে nm, kV, eV ও ×10¹⁸ Hz-এর মতো ঘোষিত unit scaling ব্যবহার হয়েছে; খুব ছোট SI মানকে ভুল করে ০ দেখানো হয়নি।

## উৎস ও চিত্রের সততা

`source-inspection-ch8-14.json`-এ Drive file ID, নাম, raw-text extraction size, SHA-256 এবং দেখা source figure-এর evidence আছে। Legacy `.doc`-গুলো থেকে text বের হলেও Bijoy conversion Latin variable/unit বিকৃত করে। Aspose trial export প্রায় প্রথম ২০২টি loaded paragraph পর্যন্ত সীমিত। **পুরো Word/পূর্ণ বই/সব source figure/পৃষ্ঠা দেখা হয়নি।** অতিরিক্ত ১১a supplement-ও পরিদর্শিত নয়; সেটি পৃথক chapter হিসেবে গণনা হয়নি।

- `source-figures/ch{8..14}-source.*.png` কেবল partial-source evidence; প্রকাশযোগ্য নতুন প্রশ্নের asset নয়। কোনও watermark সরিয়ে source image-কে নিজের প্রশ্নে ব্যবহার করা হয়নি।
- দেখা source structures-এর অনুরূপ figure-dependent প্রশ্নে ray diagram, charge layout, resistor network, common-core transformer, diode/transistor/rectifier, radio block, X-ray tube ও ECG structure পুনরঙ্কিত আছে। Source question ও source solution-এ figure থাকার পার্থক্য মুছে ফেলা হয়নি; তাই audit-এর `sourceHadFigure` অজানা থাকলে অজানাই আছে।
- নতুন সহায়ক ultrasound/field/motor-এর কিছু diagram-কে source-native বলে দাবি করা হয়নি; audit-এ আলাদা origin আছে। না-দেখা source-এ diagram ছিল না এমন দাবিও নেই।
- **উৎসের চিত্রনির্ভর প্রশ্ন অভিযোজনে চিত্র বাদ দেওয়া যাবে না।** ছবির তথ্য শুধু কথায় লিখে তার বদলি করা হয়নি। নতুন wording/data/শর্ত ঘোষিত; board/year attribution যাচাইকৃত নয়।
- Mirror/lens-এ ঘোষিত real-positive paraxial convention: real object u>0; concave/converging f>0; convex/diverging f<0; real image v>0, virtual v<0; m=−v/u। প্রধান ray-গুলোর intersection হিসাব অনুযায়ী; virtual extension dashed। চিত্র মাপানুযায়ী নয়।
- Rectifier-এ AC source ও half-wave output, resistor-network-এ প্রশ্নের topology, X-ray-এ cathode→target electron beam, ultrasound-এ যাওয়া–ফেরা path রাখা হয়েছে। ECG কেবল qualitative schematic—রুলার দিয়ে clinical measurement নয়।

## চিকিৎসা ও বিদ্যুৎ নিরাপত্তা

১৪তম অধ্যায় ও তেজস্ক্রিয়তার প্রশ্ন **শিক্ষামূলক**। রোগনির্ণয়, ব্যক্তিগত device setting, radiation dose, পরীক্ষা নির্বাচন বা চিকিৎসার সুপারিশ নয়। Actual dose planning, ECG interpretation, implant screening এবং medical procedure সংশ্লিষ্ট qualified professional-এর কাজ। একইভাবে mains wiring, fuse selection বা বাস্তব radiation source নিয়ে নিজের পরীক্ষা করার নির্দেশ দেওয়া হয়নি।

## পরীক্ষা ও পুনরুৎপাদন

```sh
python scripts/question-bank/build-ssc-physics-ch8-14.py --check
python scripts/question-bank/build-ssc-physics-ch8-14-review.py --check
python scripts/question-bank/verify-ssc-physics-ch8-14.py
node --test tests/ssc-physics-*.test.cjs tests/paper-math.test.cjs
node --test --test-name-pattern='SSC Physics remaining chapters|selection is not authority' tests/prepared-library.test.cjs
npm run typecheck
```

- নতুন ৩১টি chapter-focused test, পূর্বের ৩৬টি Physics test ও ৫টি paper-math regression = **৭২ PASS**।
- বাস্তব prepared registry/selection-authority-এর narrowed **২টি test PASS**। সব ২৮টি নতুন card-এ strict importer ও mocked ADMIN Pending-only/replay protection test PASS; কোনও live DB লেখা নয়।
- Independent verifier authoring code import/eval করে না: **১৬৮০ MCQ + ৫৬০ SQ + ৮৪০ CQ-এর primary এবং secondary** হিসাব পুনরায় করে; source-input visibility, hashes, image/reference matching, নিরাপদ SVG, ray/critical-angle/network semantics যাচাই করে। এটি শিক্ষক certification নয়।
- সব ১৪ অধ্যায়ের deterministic builder `--check`, combined review check, আগের payload hash ও TypeScript PASS।
- Offline Chromium-এ আলাদা ৭ review এবং combined review, প্রতিটি **১২৮০/৩৯০px**, সব answer খোলা অবস্থায়: expected article/SVG, বাংলা font, zero HTTP request, no page overflow ও no SVG label clipping PASS। Screenshot evidence ও `ch8-14-browser-check.json` সংযুক্ত; representative ray/circuit/rectifier/X-ray চিত্র চোখে দেখেও পরীক্ষা হয়েছে।
- Full repository test suite, production build, live site/DB, teacher review বা পূর্ণ textbook/page alignment করা হয়নি।

## মানবণ্টন ও প্রকাশ-অবস্থা

মালিকের দেওয়া profile অপরিবর্তিত: MCQ ২৫টি সব; CQ ৭টি থেকে ৪; SQ ৭টি থেকে ৫; তত্ত্বীয় ৭৫ + ব্যবহারিক ২৫; সময় ১৮০ মিনিট। **Physics Auto Model এখনো blocked**; সব অধ্যায় খসড়া আছে বলে approved/full-syllabus model দাবি করা হয়নি। Smart/Dynamic/saved-template এবং source/board display-এর setup option অপরিবর্তিত।

## Google Drive backup

JSON, validation, SVG, combined/individual review, guide, partial-source/browser/preservation evidence, সংশ্লিষ্ট code/tests ও font/license নিয়ে একটি ZIP। চূড়ান্ত upload ID/আকার/hash-এর authoritative record **`chapters-8-14-drive-backup-receipt.json`**। Receipt নিজের ZIP-এ থাকতে পারে না। মূল legacy Word/tools এবং আগের chapter backup পুনরায় upload করা হয়নি। অনুমতি ছাড়া approval/publication/deploy নয়।
