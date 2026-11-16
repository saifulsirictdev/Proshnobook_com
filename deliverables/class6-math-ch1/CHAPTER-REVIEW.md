# পূর্ণ অধ্যায় ধারণাভিত্তিক পর্যালোচনা

Drive-এর `২০২৬ — গণিত.pdf` পুনরায় ডাউনলোড করে প্রথম অধ্যায়ের মুদ্রিত **১–৩৭ সব পৃষ্ঠা** ছবিতে দেখা হয়েছে। ফাইলের SHA-256 এবং ১০০ MCQ, ৩০ CQ, ৩০ SQ-এর ধারণাসংক্রান্ত পৃষ্ঠা `chapter-alignment-review.json`-এ আছে। এটি পরবর্তী পর্যালোচনা; পুরোনো Draft-এর source/progress metadata তখনকার অবস্থা হিসেবে রাখা হয়েছে।

## বইয়ের সঙ্গে মিল
| পৃষ্ঠা | বিষয় |
|---|---|
| ১–৬ | স্বাভাবিক সংখ্যা, অঙ্কপাতন, দেশীয়/আন্তর্জাতিক গণনা ও অনুশীলনী |
| ৭–১০ | মৌলিক/যৌগিক/সহমৌলিক সংখ্যা, বিভাজ্যতা |
| ১১–১৭ | গসাগু, লসাগু, সম্পর্ক ও প্রয়োগ |
| ১৮–২৩ | ভগ্নাংশের ধরন, সমতুলতা, তুলনা, যোগ-বিয়োগ |
| ২৪–২৬ | ভগ্নাংশের গুণ, ভাগ ও বাস্তব প্রয়োগ |
| ২৬–৩০ | ভগ্নাংশের গুণনীয়ক/গুণিতক, গসাগু/লসাগু, সরলীকরণ |
| ৩১–৩৫ | দশমিকের যোগ-বিয়োগ-গুণ-ভাগ, গসাগু/লসাগু, প্রয়োগ |
| ৩৬–৩৭ | নমুনা MCQ, ক–খ–গ CQ ও সংক্ষিপ্ত প্রশ্ন |

বর্তমান প্রশ্নগুলোর ব্যবহৃত ধারণা এই অধ্যায়ের মধ্যে পাওয়া গেছে। গাণিতিক সমাধানগুলো deterministic generator-এর exact rational arithmetic ও brute-force checks দিয়ে পুনরায় পরীক্ষিত। CQ-এর নম্বর ২–৪–৪ ব্যবহারকারীর নির্ধারিত; বইয়ের অনুমোদিত marking rubric বলে দাবি করা হচ্ছে না।

## অবশিষ্ট মানগত সীমাবদ্ধতা
- এটি AI concept alignment; স্বাধীন বিষয়-শিক্ষকের চূড়ান্ত অনুমোদন নয়।
- আন্তর্জাতিক সংখ্যা-লিখন, ভগ্নাংশের গসাগু/লসাগু ও বহু-বন্ধনীর সরলীকরণ যথেষ্ট উপস্থাপিত নয়। সম্পূর্ণ অধ্যায় coverage দাবি করা যাবে না।
- সংখ্যাবদলভিত্তিক পরিবারগুলো এখনো আছে। ১০০ MCQ-তে ২৫ দক্ষতা; ৩০ CQ-তে ছয় পরিবার।
- Original Draft-এর কিছু reference page ছিল মোটামুটি ধারণাসূত্র; সুনির্দিষ্ট পরবর্তী concept-page mapping-এর জন্য নতুন JSON দেখুন।
- Production import/publication হয়নি।

## নতুন CQ/SQ সংরক্ষণপথ
`/admin/questions/import`-এ ADMIN প্রথমে CQ/SQ প্রিভিউ করতে পারবেন; acknowledgement ও অপরিবর্তিত digest দিয়ে শুধু Pending save হবে। CQ-এর `options.stimulus`, `options.subQuestions.k/kh/g`, `options.marks` এবং ফাঁকা `correct` বর্তমান builder-এর ধরন চেনার রীতির সঙ্গে সামঞ্জস্যপূর্ণ। SQ-এর options ফাঁকা; উত্তর explanation-এ।

Audit receipt: `writtenimport:v1:<digest>`। Repeat import idempotent; একই normalized stem বাদ যায়; Serializable conflict retry আছে। স্বয়ংক্রিয় অনুমোদন/প্রকাশ নেই।

পরীক্ষা: targeted suite ১২/১২ পাস; TypeScript typecheck পাস। Typecheck-এর Prisma generation স্থানীয় dummy engine path দিয়ে করা হয়েছে, database query নয়। Live/disposable database browser integration নতুন CQ/SQ path-এর জন্য এখনো আলাদাভাবে চালানো হয়নি।
