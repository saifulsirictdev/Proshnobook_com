# ষষ্ঠ শ্রেণি গণিত — অধ্যায় ১: পর্যালোচনা প্যাকেজ

## প্রস্তুত ফাইল
- `cq-sq-review.md`: ৩০ সম্পূর্ণ CQ সেট ও ৩০ SQ, উত্তর/সমাধানসহ।
- `cq-sq-review.html`: একই প্রশ্নের পাঠযোগ্য HTML কপি।
- `cq-sq-draft.json`: CQ/SQ-এর structured Draft; বর্তমান MCQ importer-এর জন্য নয়।
- `build-cq-sq.py`: প্রশ্ন ও গাণিতিক assertions পুনরুৎপাদনের স্ক্রিপ্ট। repository root থেকে চালান।
- `progress.json`: পর্যালোচনা ও প্রকাশের প্রকৃত অবস্থা।
- MCQ: `content/question-bank/class-6/math-ch1-draft.json` ও `math-ch1-review.md`।

## পরীক্ষার ফল
নিচের targeted suite-এ ৯/৯ পরীক্ষা পাস:

```sh
node --test tests/class6-math-ch1-cq-sq.test.cjs tests/class6-math-ch1-content.test.cjs tests/prepared-mcq-batch.test.cjs tests/mcq-import.test.cjs
python3 scripts/question-bank/build-class6-math-ch1.py --check
```

MCQ: ১০০/১০০ exact rational answer ও distinct option checks পাস। CQ/SQ: generator-এর exact Fraction, GCD/LCM, permutation ও remainder assertions এবং isolated regeneration পাস। প্রতিটি CQ-তে ক–খ–গ, নম্বর ২–৪–৪; সব অংশে সমাধান আছে। Import authorization/idempotency পরীক্ষা mock-ভিত্তিক; live database integration test নয়।

## চূড়ান্ত হওয়ার আগে বাকি
1. বইয়ের সম্পূর্ণ অধ্যায় (মুদ্রিত ১–৩৭) পড়া ও প্রশ্নভিত্তিক syllabus/page mapping। বর্তমানে কেবল ১, ১০, ১৭, ২৫, ৩৩, ৩৭ পৃষ্ঠা visually read।
2. সংখ্যাবদলভিত্তিক পুনরাবৃত্তি কমানো: CQ-তে ছয় family × পাঁচ variant; MCQ-তে ২৫ skill × চার variant।
3. প্রশ্নের ভাষা, difficulty, CQ stimulus-এর মান ও প্রস্তাবিত rubric-এর বিষয়-শিক্ষক পর্যালোচনা।
4. অনুমোদিত CQ/SQ সংরক্ষণপথ; বর্তমান importer কেবল MCQ নেয়।
5. উপরোক্ত যাচাইয়ের পর Pending import; review ছাড়া publish নয়। এখন productionSaved=0।

এটি সম্পূর্ণ Class 6–12 প্রশ্নব্যাংক নয় এবং প্রথম অধ্যায়ের চূড়ান্ত অনুমোদিত সংস্করণও নয়।

Drive review document: https://docs.google.com/document/d/1p2Q4BdC5PumkiaJvswoAhhpTl-2LzZ9QKP5vhrILes8/edit
