# SSC গণিত — ৯ম অধ্যায়: ত্রিকোণমিতিক অনুপাত

তারিখ: ২০২৬-১১-২০। **সংখ্যাগত লক্ষ্য পূরণ; শিক্ষক/সমাধান/চিত্র/কভারেজ পর্যালোচনার DRAFT।**

| ধরন | প্রশ্ন | চিত্রযুক্ত |
|---|---:|---:|
| MCQ | 250 | 250 |
| CQ | 150 | 150 |
| SQ | 70 | 70 |
| মোট | 470 | 470 |

প্রতিটি MCQ-তে চার বিকল্প/key/ব্যাখ্যা, CQ-তে ক/খ/গ ২/৪/৪ ও পূর্ণ অংশভিত্তিক সমাধান, SQ-তে উত্তর আছে। একই প্রশ্নের মধ্যে নিজস্ব SVG reference, reference angle ও সমকোণের চিহ্ন রয়েছে। প্রাসঙ্গিক ক্ষেত্রে বাহুর label ও পূরক কোণ যোগ করা। সব চিত্র schematic, মাপানুযায়ী নয়।

## পরিসর ও উৎস

- ছয় অনুপাত, বিপরীত/সন্নিহিত/অতিভুজ, পিথাগোরাস, এক অনুপাত থেকে অন্য অনুপাত, reciprocal/cofunction, কিছু ০°/৩০°/৪৫°/৬০°/৯০° বিশেষ মান, তিন মৌলিক পরিচিতি, sec+tan/cosec+cot এবং সমমিত রাশি অন্তর্ভুক্ত। পূর্ণ NCTB অধ্যায় পাওয়া/পড়া হয়নি; exhaustive textbook/board coverage দাবি নয়। প্রান্তিক কোণের বিশেষ-মান প্রশ্নে acute-triangle figure শুধু reference, degenerate triangle-এর পরিমাপ নয়।
- **১০টি সংকলন-ভিত্তিক অভিযোজিত MCQ**: ঢাকা PDF1 Q9/11/20, সিলেট PDF49 Q1, দিনাজপুর PDF67 Q21/22, যশোর PDF29 Q5/25, ময়মনসিংহ PDF77 Q14/16। সব ২০২৪ label। Source `3.-Math-Link-Board-142-311_Compressed-1.pdf`, printed page=PDF+141। সংকলনকে independently authenticated official paper বলা হচ্ছে না।
- উৎসের দিনাজপুরের **২টিতে মূল চিত্র** ছিল; সব SVG পুনরঙ্কিত/সহায়কভাবে যুক্ত।
- **চারটি প্রশ্নে সূক্ষ্মকোণের শর্ত স্পষ্ট করে যোগ করা হয়েছে**: ঢাকা Q11, যশোর Q5/Q25, ময়মনসিংহ Q16। Audit-এ `explicitAcuteDomainAdded=true` এবং শর্তযুক্ত অভিযোজনের নোট আছে। উৎসের অবিকল প্রশ্ন হিসেবে দাবি নয়। সিলেট Q1-এ রাশি সংজ্ঞায়িত হওয়ার sinθ≠0 শর্ত স্পষ্ট করা।
- ছোট বিকল্প স্ক্যানে পুনরায় দেখা: ময়মনসিংহ Q14 B=4/5; দিনাজপুর Q22 C=9/4। মূল বিকল্পের ক্রম রক্ষিত।
- **বাকি ৪৬০টি original parameter variant**: ২৪০ MCQ/১৫০ CQ/৭০ SQ। Original family count **২০/১৫/১০**; ৪৭০টি স্বতন্ত্র ধারণা নয়। Original rows-এ board provenance নেই। Historic/source seed দ্বিতীয়বার register হয়নি।

## যাচাই

- Deterministic generator `--check`: PASS। Shared helper-এ trig branch যোগের পর ch7/ch8 `--check`-ও PASS; পূর্বের chapter JSON/SVG bytes বদলায়নি।
- শেষ focused tests **১০/১০ PASS**: strict importer/catalog, counts, source separation, unique stems (image URL বাদেও), CQ অংশ/সমাধান, strict KaTeX, hash binding, AutoModel classification, source-domain নোট ও offline font embedding।
- SSC math/prepared-library/AutoModel/provenance regression **১০৫/১০৫ PASS**; এরপর gallery/font-specific বাড়তি test-সহ শেষ focused ১০/১০ PASS। Real DB workflow নয়, local/mock পরীক্ষা।
- `npm run typecheck`: PASS। `git diff --check`: PASS।
- Generator import না করা independent verifier: **২৪০ original MCQ**, **১০ adapted answers/keys**, **২২০ written item / ৪১৬ exact numeric witnesses**, **৬ symbolic identity**, **৪৭০ SVG hash/coordinate checks** PASS। Acute-domain counterexamples-ও পরীক্ষা করা। প্রতিটি বাংলা সমাধান/প্রমাণের স্বাধীন শিক্ষক সার্টিফিকেশন নয়।
- Offline browser: **৪৭০ cards/৪৭০ diagram SVG**, desktop 1200/mobile 390; external requests, page errors, clipped diagram labels ও mobile horizontal overflow শূন্য। Mobile-এ সমাধান খোলা রেখেও overflow পরীক্ষা হয়েছে। প্রতিনিধি source diagram, ratio CQ ও identity CQ screenshot দেখা হয়েছে। Greek θ/φ tofu এড়াতে embedded KaTeX CSS/WOFF2-সহ HTML+MathML ব্যবহার; Bengali/KaTeX license HTML ও ZIP-এ রাখা।
- Browser gallery production Chapter/AutoModel editor/PDF rendering-এর প্রমাণ নয়।
- SSC registry **২৭ slices / ৩২১০ records**; whole prepared library **১০৮ batches / ১০০২৬ records**। নতুন চার importer slice: MCQ150+100, CQ150, SQ70; বিদ্যমান strict limits শিথিল হয়নি।

## ফাইল

- `content/question-bank/ssc/math/chapter-9/target-v1/{mcq-1,mcq-2,cq,sq}.json` — মূল importer-compatible data।
- `target-v1/validation.json`, `targets-v1-manifest.json`, `board-seed-v1.json`, `README.md` — audit/manifest/source snapshot ও নির্দেশনা।
- `public/question-bank/ssc-math-ch9-v1/` — ৪৭০টি SVG।
- `docs/question-bank/ssc-math-ch9-illustrated-review.html` — offline answer-expandable gallery।
- `ssc-math-ch9-questions-v1-backup.json` — whole-chapter **backup container**, সরাসরি importer input নয়; `importFiles[].payload`-এ মূল slices অক্ষত।
- `ssc-math-ch9-illustrated-v1-backup.zip` — মূল JSON, backup JSON, সব SVG, offline HTML, README, browser/independent check records এবং font licenses। প্রতিটি entry workspace-এর সঙ্গে byte-for-byte যাচাই।
- `ssc-math-ch9-targets-v1-drive-backup.json` — upload receipt; তিন successful response-এর byte size/MD5 local bytes-এর সঙ্গে মেলে।

## Google Drive

- [সম্পূর্ণ JSON backup](https://drive.google.com/file/d/1mxalUQeaIHCXWZini9Yhyu_FoeCOec7a/view) — 1,320,976 bytes।
- [প্রশ্ন, মূল JSON slices ও সব চিত্রের ZIP](https://drive.google.com/file/d/1pv2Wg_RasSaJdH3Ov_Dh_dJV2CZTmW0z/view) — 1,069,755 bytes।
- [Offline চিত্রসহ review HTML](https://drive.google.com/file/d/1eoEcMrXuwxE8LKuizREoJo_fVji6WzDf/view) — 6,515,008 bytes; download করে locally খোলা যায়।

## বাকি gate

**কোনো real DB import, শিক্ষক অনুমোদন বা deployment হয়নি।** Production-target HTTPS SVG URLগুলো এখনো deploy/live-availability verify হয়নি। সাধারণ Chapter preview-তে image parsing-এর বাকি integration gate আছে; বর্তমানে তা AutoModel-সংশ্লিষ্ট। তাই live Chapter editor/print usability সম্পন্ন দাবি করা হচ্ছে না।

পরবর্তী ধাপ: independent teacher/language/solution/diagram/coverage review → assets deployment/live URL check → real Chapter/AutoModel editor/print/save/reopen পরীক্ষা → explicit authorized admin import/approval।
