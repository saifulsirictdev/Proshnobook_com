# পরিসংখ্যান — backup-first নতুন শুরু, r1

## বর্তমান পূর্ণ পুনর্গঠন

**বর্তমান পূর্ণ সেট `full600/`: ৩০০ MCQ + ২০০ CQ + ১০০ SQ = ৬০০; পুনর্গঠনে বাকি ০।**
পূর্ণ সমাধান, ৪৫৩ rendered table block ও ৫৭ অঙ্কিত SVG; ১৭ Python + ৭ Node পরীক্ষা পাস। স্বাধীন শিক্ষক প্রত্যয়ন বা live approval নয়। বর্তমান প্রমাণ `full600/manifest.json`, `full600/checks.json` এবং আলাদা backup receipt-এ।
নিচের Batch01 বিবরণ/`progress.json` প্রথম ৩০টির ঐতিহাসিক snapshot; নতুন পূর্ণ সেটের সঙ্গে সংখ্যাগুলো যোগ করবেন না।

## সিদ্ধান্ত

লক্ষ্য **৩০০ MCQ + ২০০ CQ + ১০০ SQ = মোট ৬০০**। পুরোনো দুর্বল সেট এখন অনুমোদিত নয়। এই restart হারানো v2/v3 উদ্ধার বা byte-identical পুনর্গঠনের দাবি নয়। নতুন সংস্করণ আলাদাভাবে তৈরি হবে।

## বাধ্যতামূলক checkpoint নিয়ম

1. পরিবর্তনের আগে ইনপুট/পূর্ববর্তী সংস্করণের immutable ZIP ও per-file SHA256 তৈরি।
2. Drive-এ নতুন versioned file; পুরোনো backup overwrite নয়। Upload response-এর পর পৃথক `get_file` দিয়ে size ও MD5 মিলিয়ে receipt সংরক্ষণ। Metadata verification-কে পুনরায় download verification বলা যাবে না।
3. প্রতিটি সম্পন্ন content batch-এর payload, solutions, lineage, tests, generator ও review file একই checkpoint-এ থাকবে।
4. নির্দিষ্ট session branch-এ commit এবং **push**; GitHub API/remote ref দিয়ে একই commit ও গুরুত্বপূর্ণ file hash যাচাই। শুধু স্থানীয় commit বা viewer-এ খোলা ফাইল স্থায়ী backup নয়।
5. পরবর্তী batch-এর আগে শেষ verified checkpoint সংরক্ষিত থাকবে। কোনো DB import/approval/publication স্বয়ংক্রিয় নয়। Arithmetic/schema PASS কখনো শিক্ষক/বোর্ডমানের সনদ নয়।
6. মূল checkout-এর অন্য সেশনের dirty files স্পর্শ নয়। একই session branch-এর আলাদা clean clone-এ কাজ, শুধু নিজস্ব নতুন files মূল checkout-এ কপি করা যাবে।

## প্রথম input backup — যাচাইকৃত

- Drive: https://drive.google.com/file/d/1jMQRYec_15VaQdk_2HBdwi_ypCwjuIlk/view
- ZIP: `ssc-statistics-restart-r1-inputs-2f627b166e28.zip`
- ZIP-এর ৯৪ entry: নতুন upload `math.txt`, মূল chapter payload/validation/manifest এবং বিদ্যমান SVG assets।
- Size 343027 bytes; MD5 `b4115edc00244e8b51dc45e8dead3fcc`।
- SHA256 `2f627b166e288bd6b6ceb685de9364e764ab70c0f7abe56b3a50fcb34d0ff64c`।
- Local ZIP খুলে সব entry মিলেছে; Drive upload ও পৃথক metadata read-এ size/MD5 মিলেছে। বিস্তারিত `input-backup-receipt.json`।

## Source intake

`math.txt`-এর স্পষ্ট পরিসংখ্যান বিভাগে ৬৮টি CQ; এর মধ্যে ৫টিতে দীর্ঘ raw list পাওয়া গেছে। অনুপস্থিত সারণি অনুমান করে উদ্ধার করা হয়নি। Source labels authenticated official board attribution নয়। MCQ-এর বিষয়বস্তু বাছাই এখনো সম্পূর্ণ নয়।

## Batch01 — নতুন ৩০ প্রশ্নের খসড়া

- ১০ MCQ, ১০ CQ, ১০ SQ; মোট ৩০ পুনর্গঠিত, বাকি ৫৭০। Approved/Published ০। হারানো পুরোনো প্রার্থী অক্ষত রাখা বা উদ্ধার করা হয়েছে—এমন দাবি নয়।
- CQ-তে সাধারণ সারণি, কাঁচা উপাত্ত, cumulative table, অজানা frequency ও দুই নিবেশনের তুলনা আছে। ৪ নম্বরের অংশে পূর্ণ কাজের সারণি/গড়/মধ্যক/প্রচুরক/লেখচিত্রের কাজ।
- ৮টি graph task-এর পূর্ণ স্থানাঙ্ক আছে; আলাদা অঙ্কিত SVG এখনো নেই। Offline review-তে coordinate table আছে, উৎপাদন-চিত্র deploy বা mobile/print pagination পরীক্ষা হয়নি।
- MCQ-তে ভুল বিকল্পের কারণ এবং প্রতিটি পুরোনো slot ও নতুন প্রশ্নের hash `batch01-checks.json`-এ আছে। উৎসের task structure অভিযোজিত; সব অংশ মূল উৎসের হুবহু নয়।
- `batch01-mcq.json`, `batch01-cq.json`, `batch01-sq.json` strict importer schema মেনে তৈরি; এগুলোকে সরাসরি live import/approval-এর নির্দেশ ধরা যাবে না।
- হিসাব/backup gate/lineage-এর ৯টি Python পরীক্ষা এবং আসল importer/MathText-এর ৩টি Node পরীক্ষা পাস। ৩০টি record ও ২৯টি table block পরীক্ষা করা হয়েছে। এগুলো স্বাধীন শিক্ষক/marks-depth/বোর্ডমান approval নয়।

```bash
python scripts/question-bank/rebuild-statistics-r1.py
python -m unittest discover -s tests -p 'test_statistics_restart_r1.py' -v
node --test tests/statistics-restart-r1.test.cjs
```

sandbox-এ Node dependencies আলাদা `.cache/statistics-tools`-এ; সেক্ষেত্রে উপযুক্ত `NODE_PATH` দিন। মূল package/lockfile বদলানো হয়নি। বর্তমান checkpoint-এর সংখ্যা ও অবস্থা `progress.json`-এ আছে। Batch-এর Drive backup-এর প্রমাণ পৃথক `batch01-backup-receipt.json`-এ থাকবে; receipt না থাকা মানে checkpoint backup অসম্পূর্ণ, শুধু তৈরি হওয়া মানে backup নয়।

সব সংখ্যায় generated/reviewed/backed-up/approved/published আলাদা রাখতে হবে। পরবর্তী batch-এর আগে বর্তমান batch-এর Drive receipt ও GitHub remote commit যাচাই বাধ্যতামূলক। এই কাজ পটভূমিতে নিজে চলবে না।
