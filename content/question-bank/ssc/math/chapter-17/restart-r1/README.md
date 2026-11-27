# পরিসংখ্যান — backup-first নতুন শুরু, r1

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

বর্তমান content checkpoint-এর সংখ্যা ও অবস্থা `progress.json`-এ থাকবে। সব সংখ্যায় generated/reviewed/backed-up/approved/published আলাদা রাখতে হবে। এই কাজ পটভূমিতে নিজে চলবে না।
