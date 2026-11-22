# SSC গণিত — ৩য় অধ্যায়: বীজগাণিতিক রাশি

**প্রশ্নসংখ্যার লক্ষ্য পূর্ণ; উত্তর–সমাধানসহ শিক্ষক-পর্যালোচনার খসড়া। সাইটে ইমপোর্ট বা অনুমোদন হয়নি।**

| ধরন | লক্ষ্য | প্রস্তুত | সংখ্যাগত বাকি |
|---|---:|---:|---:|
| MCQ | ৩০০ | ৩০০ | ০ |
| CQ | ১৫০ | ১৫০ | ০ |
| SQ | ১০০ | ১০০ | ০ |
| **মোট** | **৫৫০** | **৫৫০** | **০** |

## বিষয়বস্তু ও উৎস

- আগের **৬ MCQ + ১ CQ** বোর্ড-সংকলনের প্রশ্ন অপরিবর্তিত অর্থে একবার করে রাখা হয়েছে। সংশ্লিষ্ট বোর্ড/সাল/প্রশ্ন/PDF পৃষ্ঠা/মুদ্রিত পৃষ্ঠার পরিচয় বহাল। বোর্ড পরিচয় সংকলনের শিরোনামভিত্তিক; সরকারি মূল প্রশ্নপত্রের স্বাধীন authentication নয়।
- নতুন **৫৪৩টি নিজস্ব অনুশীলনী**: ২৯৪ MCQ + ১৪৯ CQ + ১০০ SQ। এগুলোকে বোর্ড বা NCTB বইয়ের অবিকল প্রশ্ন বলা হয়নি। প্রতিটি নিজস্ব প্রশ্নের `page`-এ নিজস্ব অনুশীলনী লেখা এবং review-তে origin/family/variant আছে।
- নতুন MCQ-তে ৩০টি, CQ-তে ১৫টি, SQ-তে ২০টি সমস্যা-পরিবার ব্যবহৃত হয়েছে। একই দক্ষতার একাধিক সংখ্যাভিত্তিক variant আছে; **৫৫০টি ভিন্ন ধারণা বা ভিন্ন বোর্ড প্রশ্ন নয়**।
- বর্গ/ঘনের সূত্র, বিপরীত রাশির ঘাত, তিন রাশির সূত্র, অনুবন্ধী করণী, মধ্যপদ ভাঙা, গুচ্ছ পদ্ধতি, দ্বিঘাত/ঘন/চতুর্ঘাত রাশির উৎপাদক, ভাগশেষ/উৎপাদক উপপাদ্য, সহগ নির্ণয় এবং সংজ্ঞার শর্তসহ সরলীকরণ রয়েছে।
- প্রতিটি MCQ-তে চারটি আলাদা বিকল্প, key ও ব্যাখ্যা আছে। প্রতিটি CQ-তে তিন অংশ **ক–খ–গ, ২–৪–৪** এবং প্রতি অংশের সমাধান আছে। প্রতিটি SQ-তে উত্তর/সমাধান আছে।

## বড় ব্যাচ ও Drive ব্যাকআপ

প্রতি batch সর্বোচ্চ ২০০ item রাখার সীমা অক্ষত রেখে চারটি importer-compatible JSON তৈরি হয়েছে।

| ব্যাচ | প্রশ্নসংখ্যা | Drive ফাইল |
|---|---:|---|
| `target-v1/mcq-1.json` | ২০০ MCQ | [খুলুন](https://drive.google.com/file/d/1z6B7FlAHiVvME8zA7ATGp0ocBQ0Mx4CR/view) |
| `target-v1/mcq-2.json` | ১০০ MCQ | [খুলুন](https://drive.google.com/file/d/1gMHEstq5pQDAJBTUiehpWdEmHZ8kZpr4/view) |
| `target-v1/cq.json` | ১৫০ CQ | [খুলুন](https://drive.google.com/file/d/1gBxCPtjasL6HOI4668ETziZ1e5B9OdRO/view) |
| `target-v1/sq.json` | ১০০ SQ | [খুলুন](https://drive.google.com/file/d/1O-yDcGPm37oDrmbTXpAODUDrgTBIYowB/view) |
| `target-v1/validation.json` | সব ৫৫০ প্রশ্নের audit | [খুলুন](https://drive.google.com/file/d/160XTAZmGmg58Ys2TBJXWyWEJsVQ0CKzR/view) |
| `targets-v1-manifest.json` | মোট হিসাব, সীমাবদ্ধতা ও hash | [খুলুন](https://drive.google.com/file/d/13gGWlOt6HSId1iEk1MG62n8rsNWuGxBw/view) |

[সমস্ত ব্যাকআপের ফোল্ডার](https://drive.google.com/drive/folders/10LdpxI6rrHrMXZMdYkER_v_E02M4WoAw)

ছয়টি upload-এর Drive-returned MD5 স্থানীয় ফাইলের সঙ্গে মিলেছে। Receipt: `docs/question-bank/ssc-math-ch3-targets-v1-drive-backup.json`। আগের ছোট seed backup মুছে বা overwrite করা হয়নি।

স্থানীয় JSON root: `content/question-bank/ssc/math/chapter-3/`। **বর্তমান সম্পূর্ণ সংখ্যার হিসাব `targets-v1-manifest.json` ও `target-v1/validation.json`-এ**। পুরোনো root `validation.json` শুধুই প্রথম ৭টি source seed-এর ঐতিহাসিক পর্যালোচনা।

## পরীক্ষার ফল

- সংশ্লিষ্ট ৭টি test suite-এ **৪৮/৪৮ test pass**; TypeScript typecheck এবং `git diff --check` pass।
- চারটি ফাইল strict catalog/importer-এ উত্তীর্ণ; প্রতিটি ২০০ item ও ৭৫০ KB সীমার নিচে।
- অধ্যায়জুড়ে normalized stem-এ একই প্রশ্নের পুনরাবৃত্তি নেই; source seed একবারই আছে। এটি অর্থগতভাবে সব numeric variant সম্পূর্ণ ভিন্ন ধারণা হওয়ার দাবি নয়।
- নতুন **২৯৪টি MCQ-এর উত্তর পৃথক family evaluator দিয়ে পুনর্গণনা** করা হয়েছে; সঠিক key-এর সঙ্গে মিলেছে।
- নতুন **২৪৯টি লিখিত প্রশ্নের ৪৭৮টি exact algebraic witness** পরীক্ষা হয়েছে। সব ৫৫০টি item-এর file/position/kind/stem hash binding এবং প্রকাশিত ফাইল hash মিলেছে।
- সব formula KaTeX-এ error ছাড়া render হয়েছে; unmatched dollar ও string escape-এর control character পরীক্ষা হয়েছে। এটি পূর্ণ browser/PDF layout proof নয়।

Reproduce (dev-only dependency):

```sh
python3 -m pip install --target .cache/math-validation sympy==1.14.0
PYTHONPATH=.cache/math-validation python3 scripts/question-bank/build-ssc-math-ch3-targets.py --check
PYTHONPATH=.cache/math-validation python3 scripts/question-bank/verify-ssc-math-ch3-targets.py
node --test tests/ssc-math-ch3-targets.test.cjs tests/ssc-math-ch3-source.test.cjs tests/ssc-math-targets.test.cjs
npm run typecheck
```

## যা সম্পন্ন দাবি করা হচ্ছে না

- সম্পূর্ণ পুরোনো বোর্ড সংগ্রহ অনুসন্ধান/প্রতিটি পৃষ্ঠার chapter audit শেষ হয়নি; বর্তমান NCTB সংস্করণের পূর্ণ অধ্যায় পাওয়া/পড়া হয়নি। **বোর্ড→NCTB→ইন্টারনেট অনুসন্ধান exhaust হওয়ার দাবি নয়।** অবশিষ্ট সংখ্যা নিজস্ব অনুশীলনী দিয়ে পূর্ণ হয়েছে।
- সংখ্যা পূরণ এবং algebraic tests স্বাধীন শিক্ষকের প্রতিটি প্রশ্নের পাঠ্যক্রম, ভাষা, নম্বর ও সমাধান যাচাইয়ের বিকল্প নয়। শিক্ষক অনুমোদন বাকি।
- `lib/ssc-math-batches.ts`-এ ৩য় অধ্যায়ের চারটি batch যোগ হয়েছে। প্রথম তিন অধ্যায়ের prepared সংখ্যা ১৩১০; সমগ্র prepared registry ৯০ batch / ৮১২৬ record। **এগুলো live database/approved stock-এর সংখ্যা নয়।**
- নতুন কোনো database write, live import receipt, approval বা deployment হয়নি।
