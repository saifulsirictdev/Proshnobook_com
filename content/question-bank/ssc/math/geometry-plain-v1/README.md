# অতিরিক্ত ৫০টি চিত্রবিহীন জ্যামিতি MCQ

- অধ্যায় ৬, ৭, ৮, ১৪ ও ১৫: প্রতিটিতে ১০টি করে, মোট ৫০টি।
- প্রতিটি প্রশ্ন স্বয়ংসম্পূর্ণ; কোনো চিত্র, অদৃশ্য উদ্দীপক বা বাইরের attachment প্রয়োজন নেই।
- চারটি স্বতন্ত্র বিকল্প, সঠিক উত্তর ও বাংলা সমাধান আছে। উত্তরগুলোর অবস্থান পরিবর্তিত।
- সম্পূর্ণ নিজস্ব অনুশীলনী; বোর্ড প্রশ্ন বা NCTB-এর হুবহু প্রশ্ন দাবি করা হচ্ছে না। প্রকাশের আগে স্বাধীন শিক্ষক যাচাই বাকি।
- পুরোনো ৫,৭৫০ প্রশ্নের রেকর্ড, চিত্র, অধ্যায়-কোটা বা release ledger পরিবর্তন করা হয়নি। এটি আলাদা supplement।

## ব্যবহার

`lib/ssc-geometry-plain-batches.ts`-এর পাঁচটি batch বিদ্যমান prepared registry-তে নিবন্ধিত।
ADMIN-এর existing preview → acknowledgement → Pending import → review/approval workflow প্রযোজ্য।
নতুন batch IDs: `ssc-math-geometry-plain-ch{6,7,8,14,15}-v1`।
শুধু অনুমোদিত DB stock থেকে live Auto MCQ তৈরি হয়; এই JSON ফাইল বা registry থেকে সরাসরি unapproved প্রশ্ন নেয় না।

## যাচাই

- `scripts/question-bank/build-ssc-geometry-plain-50.py` দিয়ে পুনরুৎপাদনযোগ্য JSON।
- `tests/ssc-geometry-plain.test.cjs`: ৫০টি উত্তর আলাদা calculation/থিওরেম-তালিকায় মিলিয়ে পরীক্ষা; four distinct options, exact catalog chapter, no diagrams, no duplicate normalized stem (including image-stripped old stems)।
- ঐতিহাসিক স্থানীয় ৫,৭৫০টি প্রশ্নের সঙ্গে এই ৫০টি মিলিয়ে ২৫টি seeded model-এ বিভাগীয় quota এবং সর্বোচ্চ পাঁচটি চিত্রযুক্ত MCQ পরীক্ষা। এটি স্থানীয় compatibility test, production approval/import নয়।
- Registry মোট ১৩৯ batch / ১২,৬১৬ record; ঐতিহাসিক SSC target registry ৫৩ slice / ৫,৭৫০ অপরিবর্তিত।

এই সংযোজনে কোনো production DB import/approval বা deployment চালানো হয়নি।
