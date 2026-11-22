# SSC গণিত অধ্যায় ৭–৮: চিত্রসহ সংখ্যাগত খসড়া

তারিখ: ২০২৬-১১-২০। **Numeric targets met; teacher/construction/proof review pending. Not live-approved question stock.**

| অধ্যায় | MCQ | CQ | SQ | মোট | চিত্রযুক্ত |
|---|---:|---:|---:|---:|---:|
| ৭: ব্যবহারিক জ্যামিতি | 150 | 70 | 30 | 250 | 250 |
| ৮: বৃত্ত | 300 | 200 | 30 | 530 | 530 |
| মোট | 450 | 270 | 60 | 780 | 780 |

## প্রশ্ন ও চিত্র

- অধ্যায় ৭: SSS/SAS/ASA/RHS, সমদ্বিবাহু/সমবাহু ত্রিভুজ, রেখাংশের লম্বদ্বিখণ্ডক, কোণদ্বিখণ্ডক, রেখায়/রেখার বাইরে বিন্দু দিয়ে লম্ব, সমান্তরাল, সামান্তরিক/রম্বস/আয়ত নির্মাণ। কম্পাসের ছেদচাপ ও সহায়ক রেখা সংযুক্ত। অসম্ভব ত্রিভুজের ক্ষেত্রে ভুয়া proper triangle নয়, সমরেখ schematic দেখানো হয়েছে।
- অধ্যায় ৮: কেন্দ্রস্থ/বৃত্তস্থ কোণ, একই বৃত্তাংশ, বৃত্তস্থ চতুর্ভুজ, জ্যা ও কেন্দ্র থেকে লম্ব, সমান জ্যা, স্পর্শক/সমান স্পর্শক, স্পর্শক-জ্যা কোণ, ব্যাসের উপর কোণ, সমবাহু ত্রিভুজের পরিবৃত্ত, এককেন্দ্রিক বৃত্ত, অন্তঃ/বহিঃস্পর্শী বৃত্ত। কেন্দ্র, স্পর্শবিন্দু, লম্ব ও প্রাসঙ্গিক কোণের চিহ্ন রাখা হয়েছে।
- SVGগুলো মাপানুযায়ী নয়; পূর্ণ ভাষাগত ও শিক্ষাগত diagram review এখনো বাকি। প্রতিটি figure একই প্রশ্নের মধ্যে referenced, অন্য প্রশ্নের চিত্রের ওপর নির্ভরশীল নয়।
- প্রতিটি MCQ-তে বিকল্প/key/ব্যাখ্যা, CQ-তে ক/খ/গ ২/৪/৪ ও পৃথক সমাধান, SQ-তে উত্তর আছে।

## উৎস ও সীমা

- অধ্যায় ৭: ৩টি source-adapted MCQ + ২৪৭টি original parameter variant (১৪৭ MCQ/৭০ CQ/৩০ SQ)। মূল তিন source-এ চিত্র ছিল না, সহায়ক চিত্র যোগ করা হয়েছে।
- অধ্যায় ৮: ১২টি source-adapted MCQ + ৫১৮টি original parameter variant (২৮৮ MCQ/২০০ CQ/৩০ SQ)। উৎসের ৫টি প্রশ্নে native figure ছিল।
- Original MCQ/CQ/SQ family count: ch7 **২১/১৪/১০**, ch8 **২৪/২০/১০**। ৭৮০টি প্রশ্ন মানে ৭৮০টি স্বতন্ত্র ধারণা নয়।
- উৎস: `3.-Math-Link-Board-142-311_Compressed-1.pdf`, ২০২৪-লেবেলযুক্ত রাজশাহী/কুমিল্লা/বরিশাল/ময়মনসিংহ প্রশ্নের প্রাসঙ্গিক পৃষ্ঠা। মূল স্ক্যান আবার দেখে তথ্য/বিকল্পের ক্রম/key ঠিক করা হয়েছে। বিশেষত বরিশাল Q30-এ BE=4, OE=3 থেকে **ব্যাস 10, key D**; OF দূরত্বের প্রশ্ন হিসেবে ভুল transcription ব্যবহার করা হয়নি।
- সংকলন স্বাধীনভাবে authenticated official paper নয়। উৎসের গদ্য/যৌথ উদ্দীপক inline ও চিত্র পুনরঙ্কিত/যোগ করা হয়েছে; অবিকল scan নয়। Provenance file/PDF page/printed page/question metadata রক্ষিত।
- পূর্ণ বর্তমান NCTB অধ্যায় পড়া হয়নি; chapter coverage বা board সংগ্রহ exhaustive নয়। শিক্ষক দিয়ে ভাষা, proof, construction ও coverage review অপরিহার্য।

## যাচাই

- Deterministic দুই builder-এর `--check`: PASS।
- Focused content/import/KaTeX/provenance/hash/AutoModel tests: **১৫/১৫ PASS**, শেষ SVG সংশোধনের পর আবার চালানো হয়েছে।
- SSC math + prepared-library + AutoModel + provenance regression: **৯৬/৯৬ PASS**। এটি mock/local পরীক্ষা, বাস্তব DB পরীক্ষা নয়।
- `npm run typecheck`: PASS। `git diff --check`: PASS।
- Generator থেকে আলাদা verifier: **৪৩৫ original MCQ** answer/unique option witness, **১৫ source-adapted** keys/answers, **৩৩০ written** numeric witnesses, **৭৮০ asset hash/geometry relationship checks** PASS। বাংলা construction/proof-এর প্রতিটি ধাপ স্বাধীনভাবে certified নয়।
- Offline browser galleries: ch7 **২৫০ cards/২৫০ SVG**, ch8 **৫৩০ cards/৫৩০ SVG**, desktop 1200/mobile 390 width; external request/page error/clipped SVG label/mobile overflow শূন্য। প্রতিনিধি construction, লম্বদ্বিখণ্ডক, tangent ও chord screenshots দেখা হয়েছে। এটি production editor/PDF rendering test নয়।
- আটটি নতুন importer slice যুক্ত; SSC registry এখন **২৩ slices / ২৭৪০ records**, পুরো prepared library **১০৪ batches / ৯৫৫৬ records**। Historic seeds আলাদাভাবে register করা হয়নি।

## ফাইল ও Drive ব্যাকআপ

প্রতি অধ্যায়ে:

- `content/question-bank/ssc/math/chapter-{7,8}/target-v1/*.json`: strict importer data slices এবং পৃথক validation audit।
- `targets-v1-manifest.json`, `board-seed-v1.json`, `README.md`।
- `public/question-bank/ssc-math-ch{7,8}-v1/`: মোট ৭৮০ SVG।
- `docs/question-bank/ssc-math-ch{7,8}-illustrated-review.html`: সম্পূর্ণ offline review, inline SVG/MathML/Bangla font, উত্তর খুলে দেখা যায়।
- `docs/question-bank/ssc-math-ch{7,8}-questions-v1-backup.json`: whole-chapter JSON backup **container**, সরাসরি importer input নয়; `importFiles[].payload`-এ মূল importer slices অক্ষত। ZIP-তেও আলাদা মূল JSON আছে।
- `docs/question-bank/ssc-math-ch{7,8}-illustrated-v1-backup.zip`: original JSON, backup JSON, সব SVG, gallery, README, local browser/independent checks ও font license। ZIP-এর সব entry workspace-এর সঙ্গে byte-for-byte মেলে।
- `ssc-math-ch{7,8}-targets-v1-drive-backup.json`: upload receipt, size/MD5/SHA256। ছয়টি successful upload response-এর MD5 ও byte size local bytes-এর সঙ্গে মিলেছে।

| অধ্যায় | JSON backup | সম্পূর্ণ ZIP | Offline HTML |
|---|---|---|---|
| ৭ | [JSON](https://drive.google.com/file/d/1vO1hI8rfhbdNpnHbdkedZYVq9OXksrrT/view) | [ZIP](https://drive.google.com/file/d/1TvhIM_-Omw507AItV4YrRlES3ul1DdaB/view) | [চিত্রসহ দেখুন](https://drive.google.com/file/d/1fa10qYFF1xWGMD-mKIk_J47UXfPIBD2r/view) |
| ৮ | [JSON](https://drive.google.com/file/d/1aRyyfV4hBiPQH6iRCUvdb4gHKAe9Jzfd/view) | [ZIP](https://drive.google.com/file/d/1VAKxq0xKcNWZLPLczyfALKXut5zZiLSS/view) | [চিত্রসহ দেখুন](https://drive.google.com/file/d/1ORcEymCugNrNnr1F61Cef2ahEUju7cVD/view) |

## প্রকাশের আগে বাকি

কোনো real DB import, approval বা deployment করা হয়নি। Versioned HTTPS SVG URLগুলো production-target, এখনো deploy/live-availability verify হয়নি। সাধারণ Chapter preview-তে image parsing gate এখনো AutoModel-only; তাই live Chapter editor/print image support সম্পন্ন দাবি করা হচ্ছে না। Offline gallery এখন review-এর উপায়।

পরবর্তী ধাপ: independent teacher/construction/proof/coverage review → assets deployment এবং live URL check → real Chapter/AutoModel editor/print/save/reopen পরীক্ষা → explicit authorized admin import ও approval।
