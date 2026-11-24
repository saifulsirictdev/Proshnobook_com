# জীববিজ্ঞান ও Auto Model — কাজের ফলাফল

## প্রকাশ সম্পন্ন

সাইট: https://proshnobook.com

- ১৪ অধ্যায়ের **৪,৪৮০টি উত্তর ও ব্যাখ্যাসহ প্রশ্ন** প্রকাশিত ও ডেটাবেস থেকে পুনরায় পড়ে যাচাইকৃত।
- প্রতি অধ্যায়ে **২০০ MCQ + ৫০ CQ + ৭০ SQ**; মোট **২,৮০০ MCQ / ৭০০ CQ / ৯৮০ SQ**।
- CQ-এর ক/খ/গ/ঘ অংশের নম্বর **১/২/৩/৪**।
- প্রয়োজনীয় **৪৫টি মৌলিক চিত্র** production URL থেকে content type ও SHA256 মিলিয়ে যাচাই করা হয়েছে।
- প্রশ্নগুলো প্রথমে Pending হিসেবে আমদানি, তারপর মালিকের পূর্বানুমতি অনুযায়ী নির্দিষ্ট প্রশ্নগুলো অনুমোদিত হয়েছে।
- Production deployment `dpl_9GzGcK2q34Bh2BYJdedW3SbHroP1`: **READY / PROMOTED**।

## AI নিয়ম চালু

পূর্ণ বই/বিষয়ের অনুমোদিত পর্যাপ্ত স্টক থাকলে Auto Model শুধু ডেটাবেস ব্যবহার করবে। নির্বাচিত টপিকে প্রশ্ন কম থাকলে ঘাটতি দেখাবে; AI বা অন্য টপিক দিয়ে পূরণ করবে না। সাধারণ বিষয় ও English-এর পৃথক পথের পরীক্ষাও অন্তর্ভুক্ত।

Live Biology stock ব্যবহার করে server action-এর read-only পরীক্ষায় নির্বাচিত প্রশ্নের ঘাটতি **৫১**, কিন্তু AI ঘাটতি **০**, provider call **০**, quota write **০**; টপিক বদল করা হয়নি। এই পরীক্ষা synthetic teacher identity ব্যবহার করেছে—এটি লগইন করা শিক্ষকের browser E2E পরীক্ষা নয়।

স্টক অসম্পূর্ণ হলে বিদ্যমান access/quota/syllabus/full-marks বিধি প্রযোজ্য থাকবে। জীববিজ্ঞানের সরকারি model blueprint নিবন্ধিত নয়; নম্বর/সময় শিক্ষককে দিতে হবে, অনুমান করা হবে না।

## সংরক্ষণ ও পরীক্ষা

- Physics-এর **৬,৪০০** এবং Chemistry-এর **৮,১১৩** অনুমোদিত live প্রশ্নের প্রকাশ-পূর্ব/পরবর্তী digest অপরিবর্তিত। কোনোটি পুনঃপ্রকাশ করা হয়নি।
- আগের দুই বিষয়ের **২,৮৭৮টি** source/adapter/asset ফাইলও অপরিবর্তিত।
- **৯৬২/৯৬২ runtime regression**, **১৫৭/১৫৭ AutoModel/English focused**, **১৩০/১৩০ Biology focused** পরীক্ষা পাস; TypeScript ও production build পাস। এই পরীক্ষাগুলোর মধ্যে overlap আছে, যোগ করে মোট দেখানো হয়নি।
- সম্পূর্ণ repository test suite পাসের দাবি নেই। ভারী prepared-library পরীক্ষার কিছু run সময়সীমায় ফল না দিয়ে থামানো হয়েছে।
- প্রশ্ন, চিত্র, app source, পরীক্ষা ও release evidence-সহ versioned পূর্ণ source backup এবং incremental backup রাখা হয়েছে। প্রকাশ-পরবর্তী [পূর্ণ source backup](https://drive.google.com/file/d/1QtBxF2LZScohmMglxRzqxbK9IjS1NgyG/view): **৬২,১৬৩,৭৫২ bytes**, **৮,১৮৯টি payload file**। ZIP CRC ও প্রতিটি payload SHA256 স্থানীয়ভাবে, এবং remote size/MD5 আলাদা GET দিয়ে মিলিয়ে যাচাই করা হয়েছে। যাচাইয়ের receipt `drive-backup-postrelease-receipt.json`-এ সংরক্ষিত। এটি database dump নয়।

## সীমা

মালিকের প্রকাশ-অনুমোদনকে স্বাধীন বিষয়শিক্ষক, semantic duplicate বা সরকারি পাঠ্যবই/সিলেবাস certification বলা হয়নি। সেসব certification এখনও হয়নি। কোনো board/school/year attribution বানানো হয়নি।

বিস্তারিত প্রমাণ: `production-release-receipt.json`, `chapter-14-completion-review.json`, `../../auto-model-all-subjects/book-stock-rule-validation.json`। উৎস-খসড়ার generated progress এবং পুরোনো completion review ঐতিহাসিক; বর্তমান প্রকাশের অবস্থা production receipt-এ আছে।
