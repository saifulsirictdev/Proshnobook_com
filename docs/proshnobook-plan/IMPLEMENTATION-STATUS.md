# বাস্তবায়নের অবস্থা

এই ফাইলটি মূল পরিকল্পনা থেকে আলাদা অগ্রগতি রেকর্ড। পরিকল্পনায় কোনো সুবিধা লেখা থাকলেই সেটি লাইভ হয়েছে ধরে নেওয়া যাবে না।

## প্রথম বাস্তবায়ন ধাপ

- প্রোফাইলে ডাটাবেজ ও PDF/Ready Paper নির্মাণব্যবস্থার দুটি সরাসরি প্রবেশপথ।
- স্থায়ী `QB-…` TID: সার্ভার user ID থেকে নির্ধারিত, ওয়ালেটের transaction lock-এর অধীনে unique Setting key-তে মালিকানা নিবন্ধিত। এটি গোপন credential নয়।
- প্রোফাইল ও ওয়ালেটে TID প্রদর্শন; অ্যাডমিন রিচার্জ তালিকায় নাম, TID, আবেদন এবং পেমেন্ট তথ্য প্রদর্শন।
- অ্যাডমিনের অনুমোদিত পরিমাণ লেখার সুযোগ, পরিমাণ বদলালে কারণ আবশ্যক।
- পেমেন্ট যাচাই নিশ্চিতকরণ, pending অবস্থায় বাটন নিষ্ক্রিয়, ফর্মে সাফল্য/ব্যর্থতার বার্তা।
- অনুমোদনের সময় fresh ADMIN role যাচাই, আবেদন-মালিকানা মিল, পরিমাণ সীমা এবং একবারের credit।
- আবেদিত পরিমাণ, অনুমোদিত পরিমাণ, কারণ, reviewer, সময় ও TID আবেদনের durable record-এ সংরক্ষণ।
- ওয়ালেট ইতিহাসে অনুমোদিত জমার পরিমাণ প্রদর্শন।
- বর্তমান একবারের ৳২০ বোনাসের ব্যবস্থা রাখা হয়েছে; পুরোনো ওয়ালেট নতুন করে reset হয় না।
- এই ধাপে schema migration বা বিদ্যমান ব্যালেন্স পরিবর্তনের script নেই।

## যাচাই

- Typecheck সফল।
- ৩৫৫টি automated test সফল।
- নতুন পরীক্ষায় stable TID, পুরোনো ব্যালেন্স সংরক্ষণ, অনুমতিহীন অনুমোদন প্রত্যাখ্যান, পরিবর্তিত পরিমাণের কারণ, integer paisa, concurrent approval-এ একবার credit এবং mismatch request প্রত্যাখ্যান অন্তর্ভুক্ত।
- পরীক্ষার wallet database mock transaction ও rollback ব্যবহার করে; এটি বাস্তব অর্থের লেনদেন বা authenticated production browser test-এর বিকল্প নয়।
- GitHub CI ও Vercel deployment অবস্থা PR-তে আলাদাভাবে দেখা যাবে।

## এখনও বাকি

- দুই builder-এর saved paper provenance ও স্থির বিক্রিযোগ্য snapshot একীভূত করা।
- মার্কেটপ্লেসের listing, আবেদন, moderation, class/subject/chapter navigation।
- protected preview/full-copy delivery এবং ক্রেতার শুধু প্রতিষ্ঠান-নাম পরিবর্তনযোগ্য print screen।
- purchase ownership ও atomic ৬০/৪০ revenue split।
- bonus/recharge/sales/transferred balance পৃথক রাখার পূর্ণ ledger এবং সব বর্তমান debit path-এর সামঞ্জস্য।
- Send Money।
- ৳১০০ ন্যূনতম বিক্রির আয় থেকে বিকাশ withdrawal এবং manual payout reconciliation।
- refund, complaints, policy এবং প্রয়োজনীয় limits।
- প্রশ্নবুক branding এবং মালিকানাধীন নতুন domain configuration।
- পূর্ণ end-to-end, mobile print এবং অনুমোদিত বাস্তব লেনদেন যাচাই।

অসম্পূর্ণ আর্থিক সুবিধার জন্য কোনো live button বা placeholder transaction চালু করা হয়নি। মূল পরিকল্পনা `README.md`-এ রয়েছে।

## দ্বিতীয় বাস্তবায়ন ধাপ: ডাটাবেজ প্রশ্নপত্রের বিক্রির আবেদন

- `/dashboard/sell`: লগইন করা মালিকের নিজের সংরক্ষিত ডাটাবেজ প্রশ্নপত্র থেকে আবেদন; dashboard-এ প্রবেশপথ।
- শ্রেণি ৬–১১, বিষয়, অধ্যায়, বিবরণ, মূল্য ও বিক্রির অধিকারসংক্রান্ত সম্মতি সংগ্রহ। এই পর্যায়ের মূল্য validation সীমা ৳১–৫০,০০০; এটি চূড়ান্ত marketplace pricing policy নয়।
- সার্ভার saved-paper key ও owner যাচাই করে, বর্তমান checkout entitlement যাচাই করে এবং প্রশ্নব্যাংক থেকে প্রকৃত প্রশ্ন নেয়। Client থেকে প্রশ্নের কপি গ্রহণ করা হয় না।
- প্রশ্নের ক্রম ও settings সহ private স্থির snapshot, SHA-256 checksum, উৎস, মালিক ও revision সংরক্ষণ। Snapshot সর্বোচ্চ ১ MB।
- একই source-এর duplicate আবেদন আটকানো; সংশোধন চাওয়া হলে একই আবেদনে নতুন revision জমা দেওয়া যায়।
- `/admin/marketplace`: fresh database ADMIN role যাচাই করে private review। বর্তমানে নিরাপদ text/JSON-এ পূর্ণ snapshot দেখা যায়; rendered A4 review এখনও বাকি।
- অনুমোদন/সংশোধন/বাতিল, কারণ, reviewer ও সময় সংরক্ষণ। নিজের আবেদন নিজে অনুমোদন নিষিদ্ধ। Stale revision, repeated review এবং checksum mismatch প্রত্যাখ্যান।
- অনুমোদিত আবেদন পরিবর্তন করে কপি বদলে দেওয়া যায় না। প্রশ্নব্যাংক বা মূল saved paper বদলালেও snapshot বদলায় না।
- Owner ও admin ছাড়া snapshot দেখার কোনো public route নেই। এই ধাপে marketplace purchase, credit/debit বা আয় বণ্টন নেই।
- **PDF/Ready Paper থেকে তৈরি কপির আবেদন এই ধাপে চালু করা হয়নি।** Paid source-page receipt এবং শিক্ষকের assembled final copy-কে আলাদা করতে হবে; অনুমতিহীন সরাসরি PDF পুনর্বিক্রি এড়াতে পরবর্তী ধাপে কাজ প্রয়োজন।
- প্রশ্নপত্রের বিষয়/অধ্যায় এই পর্যায়ে admin যাচাই করেন; catalog-validated subject/chapter dropdown পরবর্তী ধাপে প্রয়োজন।

### দ্বিতীয় ধাপের যাচাই

- Typecheck এবং ৩৬২টি automated test সফল।
- নতুন tests: metadata/মূল্য/সম্মতি, ownership, purchased-source প্রত্যাখ্যান, unpaid/unauthenticated access, immutable server snapshot, concurrent duplicate, admin role, stale review, revision/resubmission এবং approved copy অপরিবর্তনীয় রাখা।
- এটি mocked transaction-ভিত্তিক automated test; authenticated live browser বা বাস্তব টাকা দিয়ে পরীক্ষা করা হয়নি।
- প্রথম ধাপের পরে উপরের “এখনও বাকি” তালিকার application/moderation অংশ আংশিক সম্পন্ন হয়েছে; PDF snapshot, rendered A4 review, catalog, sales ledger, buyer print, Send Money, withdrawal ও end-to-end পরীক্ষা এখনও বাকি।

## পরীক্ষার ধরন সংযোজন

- শিক্ষক প্রোফাইলের নতুন বিক্রির আবেদন ফর্মে পরীক্ষার ধরন আবশ্যক: **অর্ধ বার্ষিক পরীক্ষা, বার্ষিক পরীক্ষা, নির্বাচনী পরীক্ষা**।
- একই তথ্য শিক্ষক নিজের আবেদন তালিকা এবং অ্যাডমিনের যাচাই পাতায় দেখতে পাবেন।
- Client-safe shared তালিকা `lib/marketplace-exam-types.ts`-এ রাখা হয়েছে; ভবিষ্যৎ marketplace card/filter-এও একই তালিকা ব্যবহার করতে হবে। প্রকাশ্য marketplace এখনও চালু হয়নি।
- নতুন আবেদনে পরীক্ষার ধরন সার্ভারেও যাচাই ও metadata-তে সংরক্ষণ করা হয়। পুরোনো আবেদনে কোনো ধরন অনুমান করে বসানো হয় না; “পরীক্ষার ধরন উল্লেখ করা হয়নি” দেখাবে।
- অনুমোদিত প্রশ্নপত্রের মূল snapshot বা পুরোনো ব্যক্তিগত প্রশ্নপত্রের পরীক্ষার শিরোনাম এই পরিবর্তনে বদলানো হয় না।

## তৃতীয় ধাপ: পাবলিক ক্যাটালগ ও শিক্ষকের প্রকাশ্য প্রোফাইল

- `/marketplace`: অনুমোদিত, বৈধ পরীক্ষার ধরনসহ প্রশ্নপত্রের পরিচিতি। শ্রেণি ৬–১১, বিষয় কার্ড, অধ্যায় ও তিন পরীক্ষার ধরন দিয়ে GET filter।
- হোমপেজে live paper animation-এর পরে শ্রেণিভিত্তিক ক্যাটালগের প্রবেশপথ; পুরোনো দুটি creation card ও animation-এর ক্রম অক্ষুণ্ণ।
- `/marketplace/[id]`: শুধু অনুমোদিত প্রশ্নপত্রের পরিচিতি ও মূল্য। Pending/rejected/invalid রেকর্ডে 404।
- `/teachers/[tid]`: নিবন্ধিত TID যাচাই করে শুধু প্রকাশ্য নাম, TID ও ক্যাটালগের অনুমোদিত পরিচিতি। ইমেইল, ফোন, প্রতিষ্ঠান/ঠিকানা, ব্যক্তিগত ব্যালেন্স প্রকাশ করা হয়নি। এটি verified-teacher badge নয়।
- public projection-এ শুধু id, sellerTid, validated metadata ও updatedAt আছে; snapshot, question text, answers, saved settings, source key, internal owner ID বা review notes ফেরত দেওয়া হয় না।
- ক্যাটালগে key cursor-ভিত্তিক পরবর্তী পাতা; প্রতি পাতায় সর্বোচ্চ ২০০ অনুমোদিত রেকর্ড। বিষয়/অধ্যায় filter এবং seller filter বর্তমান পাতায় প্রযোজ্য—UI-তে তা স্পষ্ট আছে। Database-normalized listing/index ছাড়া global filtered pagination দাবি করা হয়নি।
- শিক্ষক ও অ্যাডমিনকে এখন জানানো হয়: অনুমোদনে পরিচিতি প্রকাশিত হবে, পূর্ণ প্রশ্নপত্র নয়।
- কোনো fake sample, buy button, টাকা কাটা বা আয় বণ্টন চালু করা হয়নি। Public UI-তে স্পষ্টভাবে কেনাকাটা ও পূর্ণ প্রিভিউ এখনও বন্ধ বলা আছে।
- Typecheck এবং ৩৬৭টি automated test সফল। নতুন পরীক্ষায় public data allowlist, unapproved/invalid record exclusion, combined filters ও bounded pagination অন্তর্ভুক্ত। Authenticated live browser বা real-money end-to-end test হয়নি।

### এখনও গুরুত্বপূর্ণ বাকি

PDF assembled-copy provenance; rendered A4 admin review; protected sample and buyer print; catalog-validated subject/chapter selection; normalized global listing/filter indices; source-separated financial ledger and all existing debit paths; atomic purchase/৬০–৪০ distribution; Send Money; withdrawals/refunds; rebranding/domain authentication; full browser/mobile/real-payment verification।

## চতুর্থ ধাপ: ব্যক্তিগত পৃষ্ঠা প্রিভিউ / অ্যাডমিনের A4 যাচাই

- `/dashboard/sell/[id]`: fresh database user/role যাচাই করে কেবল মালিক শিক্ষক বা ADMIN জমা দেওয়া স্থির কপি দেখতে পারবেন। অন্যদের 404; লগইন ছাড়া login-এ পাঠানো হয়।
- অনুমোদনের তালিকা ও শিক্ষকের নিজের আবেদন তালিকা থেকে প্রিভিউ লিংক। পূর্ণ snapshot পাবলিক ক্যাটালগে যোগ করা হয়নি।
- বর্তমান mature `PaperPreview` renderer ব্যবহার করে saved paper size/orientation/font, header, mixed MCQ/CQ/SHORT sections, saved edits, exclusions, division groups এবং deterministic set shuffle দেখানো হয়। A4 নির্বাচিত থাকলে A4; পুরোনো ভিন্ন মাপ জোর করে A4-এ রূপান্তর করা হয়নি।
- Snapshot প্রশ্ন থেকেই display model হয়; প্রশ্নব্যাংক পুনরায় query করে কপি বদলানো হয় না। CQ-তে Bengali এবং nested sub-question keys সমর্থিত।
- Renderer-এ opt-in readOnly mode; ব্যক্তিগত reviewer-তে question actions ও image resize controls নেই। মূল builder-এর editable mode আগের মতোই আছে।
- Preview route checksum/settings/question shape যাচাই করে ব্যর্থ হলে সতর্কতা দেখায়। APPROVED সিদ্ধান্তে server-side renderability check; invalid/empty বা সব প্রশ্ন বাদ দেওয়া কপি অনুমোদন হবে না, তবে সংশোধনের অনুরোধ করা যাবে।
- এটি reviewer preview; buyer institution-name-only print, public sample, PDF assembly snapshot ও payment এখনও বাস্তবায়িত নয়।

### চতুর্থ ধাপের যাচাই

- Typecheck এবং ৩৭৩টি automated test সফল।
- mixed sections, Bengali CQ, saved edits/exclusions/fonts, immutable inputs, seeded sets, invalid/empty approval rejection এবং private-route guards-এর regression tests।
- বাস্তব preview component-এর Chromium fixture-এ 320/390/768/1280px প্রস্থে ৪টি rendered sheet, page overflow নেই, sheet-এ editing buttons নেই এবং JavaScript error নেই। Fixture synthetic snapshot ব্যবহার করে; authenticated production browser, বাস্তব ফোন বা physical print test নয়।
- Browser fixture ও dependencies `/home/user/market-preview-browser`-এ scratch হিসেবে রাখা; repository-তে generated bundle বা Chromium যোগ করা হয়নি।

## পঞ্চম ধাপ: নতুন বিষয়ভিত্তিক হোমপেজ ও দ্বাদশ শ্রেণি

এই ধাপটি ব্যবহারকারীর নতুন হোমপেজ নির্দেশ অনুযায়ী পূর্বের হোমপেজ পরিকল্পনাকে প্রতিস্থাপন করে।

- হোমপেজের পুরোনো creation cards, live demo, statistics, packages, starter ও guide আর mount করা হয় না। Shared site header/footer অপরিবর্তিত; শিক্ষক প্রোফাইলের দুই creation path বজায় আছে।
- একদম ওপরে ষষ্ঠ–দ্বাদশ শ্রেণির scrollable মেনু। Default ষষ্ঠ শ্রেণি। শ্রেণি বদল URL-এ থাকে এবং reload/share করা যায়।
- নির্বাচিত শ্রেণির প্রতিটি বিদ্যমান curriculum subject আলাদা বিভাগ; প্রতি বিষয়ে সর্বোচ্চ ৬টি প্রকৃত অনুমোদিত পরিচিতি। প্রশ্ন না থাকলে সৎ empty state, database failure হলে আলাদা unavailable message।
- A4 অনুপাতের পরিচিতি কার্ড: subject, title, exam type, class, chapters, price ও seller-profile link। এটি মূল প্রশ্নপত্রের preview নয়—কার্ড ও পাতায় স্পষ্ট বলা আছে; কোনো fake প্রশ্ন/thumbnail নেই।
- প্রতি বিষয়ের “আরও প্রশ্ন দেখুন” grade/subject বহন করে marketplace-এ যায়। সেখানে subject/grade বদলালে chapter নির্বাচন reset হয় এবং নতুন তালিকা client-side বদলায়।
- একই curriculum helper ব্যবহার করে class 10-এ existing class 9 বই এবং class 11/12-এ existing combined 11–12 বই দেখানো হয়। নতুন/সংশোধিত official syllabus যোগ করা হয়েছে বলে দাবি করা হয়নি।
- Teacher sale form-এ দ্বাদশ শ্রেণি, canonical subject dropdown ও chapter checkboxes; server metadata schema-তেও class 12 গ্রহণ। পুরোনো free-text metadata পরিবর্তন করা হয়নি; এমন বিষয় class-এর “সব প্রশ্নপত্র” ক্যাটালগে খুঁজতে হবে।
- Catalog-এর নতুন query grade/subject/exam predicates দিয়ে source narrow করে, then exact approved public projection এবং chapter filter দিয়ে matching records paginate করে। প্রতি response সর্বোচ্চ ২৪ card; সর্বোচ্চ ১,০০০ candidate scan-এর পরে continuation link। Full normalized/indexed database listing এখনও বাকি; string predicates বর্তমান server-generated compact JSON storage অনুযায়ী।
- Homepage-এ প্রতি subject সর্বোচ্চ ৬ card query; একই সময়ে সর্বোচ্চ ৪ query চালিয়ে connection pressure সীমিত। Heavy traffic-এর জন্য normalized listing/index/cache এখনও প্রয়োজন।
- পুরোনো `/#start` dashboard/workspace link সরাসরি `/question-builder`-এ বদলানো হয়েছে। অন্য পুরোনো feature routes মুছে দেওয়া হয়নি।

### পঞ্চম ধাপের যাচাই

- Typecheck ও ৩৭৭টি automated test সফল। পুরোনো homepage placement-এর test নতুন নির্দেশ অনুযায়ী আপডেট; পুরোনো component unit tests বজায়।
- Chromium actual-home/component fixture: 320/390/768/1440px-এ page overflow নেই; ৭ class link, প্রতি বিষয় ৬ card, A4 ratio, class 12 navigation এবং more-link state যাচাই।
- Interactive filter fixture-এ subject অনুযায়ী chapter options এবং grade/subject পরিবর্তনে stale selection reset যাচাই; JavaScript error নেই।
- Fixture-এ synthetic approved metadata ব্যবহার করা হয়েছে। Authenticated production, real mobile/print বা payment E2E নয়।
- Main app-এর login backdrop-ও homepage reuse করে; optional searchParams দিয়ে compatibility রাখা হয়েছে।

### এখনও বাকি

PDF assembled-paper provenance; source-separated wallet ledger and migration of all debit paths; atomic marketplace purchase and 60/40 sharing; protected sample/buyer institution-only print; Send Money; withdrawal/refund/reporting; full site branding and domain login/payment verification; production/authenticated E2E। এই ধাপে কোনো টাকা কাটা, transfer বা withdrawal চালু করা হয়নি।

## ষষ্ঠ ধাপ: উৎসভিত্তিক ব্যালেন্স ও durable ledger

- Wallet version 2-এ bonus, recharge, earnings এবং received আলাদা integer-paisa balance। সমষ্টি total balance-এর সঙ্গে না মিললে fail closed।
- পুরোনো total অপরিবর্তিত থাকে। পুরোনো bonus field historical grant হওয়ায় অবশিষ্ট bonus নিখুঁতভাবে জানা যায় না; সর্বোচ্চ সেই grant পর্যন্ত bonus হিসেবে conservatively reserve, বাকিটা recharge হিসেবে ধরা হয়। পুরোনো balance থেকে কোনো earnings/withdrawable income বানানো হয় না। UI-তে সীমাটি বলা আছে।
- নতুন wallet-এ ৳২০ একবারের bonus source শুরু হয়। পুরোনো wallet শুধু পড়লে persisted bulk migration হয় না; প্রথম পরিবর্তনে version 2 লেখা হয়।
- প্রতিটি নতুন mutation-এ opening balance/source checkpoint, unique operation receipt, source breakdown, before/after balance এবং chronological history রাখা হয়। ভুল বা পুনর্ব্যবহৃত operation ID থেকে দ্বিগুণ debit/credit বন্ধ।
- ডাটাবেজ question checkout, PDF checkout, Ready monthly plan এবং admin recharge একই audited source-aware helper ব্যবহার করে। সরাসরি total-only overwrite সরানো হয়েছে।
- তৈরির/কেনার খরচে আগে bonus, তারপর recharge, received, শেষে earnings কাটে। Send Money-তে bonus ব্যবহার হয় না।
- ওয়ালেটে উৎসভিত্তিক হিসাব ও সর্বশেষ ৫০টি নতুন ledger transaction দেখায়; পুরোনো receipt/history অক্ষুণ্ণ।
- Production-এ bulk rewrite, database provider change বা schema migration করা হয়নি।

## সপ্তম ধাপ: TID Send Money

- `/wallet/send`: authenticated non-admin ব্যবহারকারীর জন্য প্রাপক TID ও পরিমাণ দিয়ে name confirmation; dashboard/wallet থেকে link। Google-এ নিবন্ধিত STUDENT-role অ্যাকাউন্টও আগের সিদ্ধান্ত অনুযায়ী সুবিধা পায়।
- আগে server-generated private quote; নাম, TID, amount ও fee স্পষ্ট দেখে checkbox দিয়ে নিশ্চিত করার পরই transfer। Quote ১০ মিনিট কার্যকর, sender-এর সঙ্গে bound। Client পাঠানো recipient/amount বিশ্বাস করে debit করা হয় না।
- global advisory transaction lock-এর মধ্যে sender debit, recipient received-credit, দুই ledger/history, daily counter এবং completion commit হয়। কোনো ধাপ ব্যর্থ হলে সব rollback। Concurrent retry-এ একবারই টাকা যায়।
- bonus-only/self/unknown/admin/expired/cross-user/unauthenticated request প্রত্যাখ্যান। Recipient identity ও fresh account role যাচাই।
- প্রাপ্ত টাকা re-transfer করলেও earnings হয় না; উত্তোলনযোগ্য হয় না।
- প্রাথমিক প্রকাশ্য limits: ৳১ minimum, দৈনিক ৳৫,০০০ maximum, fee ৳০, দিনে সর্বোচ্চ ৩০ recipient lookup। এগুলো conservative code constants; admin-configurable settings এখনও নয়।
- এটি বাস্তব balance transfer; marketplace purchase ও earnings generation এখনও চালু নয়। Withdraw endpoint/button তৈরি করা হয়নি।

### ষষ্ঠ/সপ্তম ধাপের যাচাই

- Typecheck ও ৩৮৭টি automated test সফল। Source allocation, invalid balances, bonus restrictions, operation replay, unauthorized/expired quotes, parallel retries, recipient failure rollback, daily cap/lookup quota এবং received re-transfer tests আছে।
- অতিরিক্ত বাস্তব disposable PostgreSQL 18 + Prisma adapter integration সফল: concurrent bonus once; source-aware admin recharge; recipient history write-এ forced failure হলে দুই wallet/ledger rollback; আট concurrent confirmation-এ একবার credit; পুনরায় পাঠিয়েও received থেকে earnings না হওয়া।
- Opt-in script: `scripts/wallet-transfer-postgres-check.cjs`। কেবল স্পষ্টভাবে দেওয়া localhost:5439 disposable URL গ্রহণ করে; production `DATABASE_URL` পড়ে না। Generated engineType-client Prisma path ও adapter path আলাদাভাবে দিতে হয়।
- Integration fixture-এর cluster/data/dependencies `/home/user/funds-db`-এ, repository-তে binary/data যোগ হয়নি। Production user balance বা real bKash transfer দিয়ে পরীক্ষা হয়নি। Authenticated production browser test-ও বাকি।
- পুরোনো app version-এ rollback করলে version-2 fields উপেক্ষা করে balance overwrite হতে পারে। Financial rollback প্রয়োজন হলে নতুন transfer entry বন্ধ করে source checkpoint/ledger reconcile করে compatible code deploy করতে হবে; অন্ধভাবে পুরোনো total-only writer ফিরিয়ে দেওয়া নিরাপদ নয়।

### অবশিষ্ট মূল কাজ

PDF assembled-paper provenance; protected samples ও buyer institution-name-only print; atomic marketplace purchase ও 60/40 earnings; minimum ৳১০০ earnings withdrawal ও manual bKash reconciliation; refunds/complaints/admin reports; configurable limits; site-wide rebrand/domain auth/payment verification; authenticated/mobile/payment end-to-end tests।

## অষ্টম ধাপ: বিক্রির আয় থেকে manual bKash withdrawal

- `/wallet/withdraw`: authenticated non-admin account-এর অবশিষ্ট `earnings` থেকেই ন্যূনতম ৳১০০, সর্বোচ্চ ৳৫০,০০০ অনুরোধ। নিজের bKash নম্বর ও explicit confirmation আবশ্যক। অন্য source ব্যবহার হয় না। মার্কেটপ্লেস earnings generation এখনও চালু নয়; কোনো production test earnings যোগ হয়নি।
- অনুরোধে earnings-only ledger debit এবং HELD record একই advisory-locked transaction-এ। হোল্ডে থাকা টাকা create/buy/send-এ আবার খরচ হয় না। এক account-এর এক pending request। Stable request ID duplicate debit বন্ধ করে।
- `/admin/withdrawals`: admin-only pending queue ও PAID/REJECTED audit views। বাইরের manual payout-এর explicit confirmation ও unique case-normalized TrxID ছাড়া PAID নয়। এটি টাকা পাঠানোর API নয়। বাতিলের কারণ আবশ্যক, earnings-only release হয় একবার। নিষ্পত্তির পরে conflicting decision প্রত্যাখ্যান।
- UI-তে minimum, eligible source, fee ৳০, external cash-out fee বাদ থাকা ও guaranteed settlement time না থাকার disclosure। Wallet থেকে withdrawal এবং admin dashboard থেকে queue link।
- Automated tests ৩৯২টি ও typecheck সফল। Permissions, non-earnings rejection, minimum/invalid input, consent, concurrent duplicates, one pending, unique payout TrxID, conflicting review, rollback এবং release-once tests।
- Disposable PostgreSQL integration-ও সফল: forced withdrawal record failure-এ hold rollback, ৮ concurrent requests-এ একবার hold, reject retry-এ একবার earnings release। আগের source-ledger/Send Money integration-ও আবার সফল। Script extended: `scripts/wallet-transfer-postgres-check.cjs`।
- বাস্তব payout/production wallet mutation দিয়ে পরীক্ষা নয়; authenticated production browser/mobile E2E হয়নি। একাধিক admin বাইরের bKash-এ একই request-এ একসঙ্গে টাকা পাঠানো সফটওয়্যার transaction দিয়ে ঠেকানো যায় না—manual coordination অপরিহার্য এবং UI-তে সতর্কতা আছে। ভবিষ্যৎ provider integration বা admin payout claim/assignment দরকার।
- অবশিষ্ট: marketplace atomic purchase/60–40 ও locked buyer library/print, PDF paper provenance/sale, protected sample, refunds/reporting, full rebrand/domain auth/payment callback verification। Original plan অপরিবর্তিত।

## নবম ধাপ: মার্কেটপ্লেস কেনাকাটা, ৬০/৪০ ও ক্রেতার স্থির লাইব্রেরি

- অনুমোদিত database-paper detail-এ explicit price confirmation। Confirmed terms hash paper ID, owner, revision, immutable snapshot hash, price এবং title-এর সঙ্গে bound। বদলানো মূল্য/কপি পুরোনো confirmation দিয়ে কেনা যায় না। Server নতুন করে approval, metadata ও renderability/hash যাচাই করে।
- Authenticated non-admin buyer নিজের paper কিনতে পারেন না। Non-admin seller account server-এ যাচাই। এক buyer/paper-এর durable unique purchase record; একই request concurrent/repeated হলেও একবার debit/earnings credit। ইতিমধ্যে কেনা হলে listing সরালেও repeat action নতুন চার্জ করে না।
- একই global wallet advisory transaction-এ buyer source-aware debit, seller earnings credit, independent frozen buyer snapshot এবং platform receipt তৈরি। Seller ৬০% integer paisa floor; বাকি platform ৪০% plus fractional-paisa remainder। উদাহরণ ৳১০.০১ → seller ৳৬.০০, platform ৳৪.০১। Creation charge আলাদাই থাকে; seller listing price-এর অংশ নয়।
- Seller আয় wallet earnings-এ আসায় create/buy/send এবং existing minimum ৳১০০ withdrawal-এ ব্যবহারযোগ্য। Bonus/recharge/received source rules আগের মতো; withdrawn/held earnings spend হয় না।
- `/dashboard/library` owner-scoped paginated purchased list; `/dashboard/library/[id]` session buyer-only immutable copy। Listing পরে বদলানো/সরানো হলেও নিজের stored copy খোলা যায়। আবার খোলা/প্রিন্টে চার্জ নেই।
- Buyer form শুধু ২–২০০ অক্ষরের single-line institution name গ্রহণ করে। Client থেকে snapshot/amount/settings পরিবর্তন পাঠালেও সেগুলো নেওয়া হয় না। Snapshot/hash অপরিবর্তিত; rendering-এ শুধু পুরোনো institute field override। Questions/editing handles অনুপস্থিত, source layout/font বজায় রেখে browser print। Saved institution ব্যবহার হয়; unsaved input নয়।
- Buy form-এ price, rounding, restricted editing, no bought-copy resale, no automatic refund এবং digital-copy redistribution পুরোপুরি আটকানোর প্রযুক্তিগত সীমা বলা আছে। পূর্ণ প্রশ্নপত্রের pre-purchase sample এখনও pending এবং তা পরিষ্কার বলা আছে। Public page-এ snapshot দেওয়া হয়নি।
- Catalog/admin/withdrawal-এর আগের checkout-not-enabled লেখা সংশোধন। Profile-এ purchased library link।

### নবম ধাপের যাচাই ও সীমাবদ্ধতা

- Typecheck এবং ৩৯৭ tests pass: split conservation, ৮ concurrent purchase retries, invalid/auth/self/admin/price-change/approval/hash checks, insufficient funds, seller/history/copy/platform write-failure rollback, immutable owner-only institution changes।
- Extended disposable PostgreSQL script pass: forced final platform-receipt insert failure হলে buyer/seller/copy rollback; আট retries-এ একবার purchase; exact 600/401 paisa allocation; institution edit snapshot অপরিবর্তিত। আগের withdrawal/Send Money integration-ও পুনরায় pass। Production money ব্যবহার হয়নি।
- Synthetic Chromium 320/390/768/1440: no horizontal overflow, purchased institution rendered, no editable paper controls, print hides form/buttons, PDF generated। Fixture/action mock; authenticated production checkout/mobile/printer E2E নয়। Scratch files `/home/user/purchase-browser`-এ, Git-এ binary/PDF নেই।
- Platform receipt বর্তমানে audit record, bank/bKash settlement বা revenue-report dashboard নয়। Manual admin payout coordination caveat বহাল। No automatic refund route; refund/dispute reporting এখনও pending।
- অবশিষ্ট: নিজের PDF assembled-paper provenance ও sale, protected pre-purchase sample, refunds/disputes/admin reports, configurable financial limits, payout admin assignment, full rebrand/domain auth/payment callback verification, authenticated production end-to-end validation। Original plan unchanged।

## দশম ধাপ: কেনার আগের সীমিত জলছাপযুক্ত নমুনা

- Approved immutable database snapshot/hash/renderability যাচাইয়ের পর server-only `publicMarketSample` public allowlist তৈরি করে। Public component-এ snapshot, settings, question IDs, correct answer, explanation, option, attachment বা private URLs দেওয়া হয় না।
- স্থির deterministic excerpt selection: প্রতি পাঁচ প্রশ্নে একটি, minimum একটি/max দুটি eligible প্রশ্নের শুরু; প্রতিটি stem-এর সর্বোচ্চ অর্ধেক এবং ১৬০ Unicode character পর্যন্ত। Single-question paper-ও কখনো পুরো stem প্রকাশ করে না। Client pagination/offset/seed দিয়ে অন্য slice নেওয়ার endpoint নেই।
- HTML/resource URL/data এবং obvious inline উত্তর/সমাধান/ব্যাখ্যা লেখা stem বাদ। Detection সম্পূর্ণ নির্ভুল নয়—UI-তে সীমা বলা আছে। React escaped plain text; rich HTML/Markdown/external image rendering নয়।
- Watermarked excerpt sheet-এ এটি পূর্ণ প্রশ্ন/পৃষ্ঠা নয় বলা আছে। কোনো নিরাপদ excerpt না পেলে unavailable disclosure; fake sample নয়। Original full layout buyer copy-তে থাকে। Cards/catalog-এ নতুন sample link description।
- জলছাপ DRM নয়; screenshot/copy পুরোপুরি আটকানোর দাবি নেই। নতুন sample schema-তে source snapshot client-এ পাঠানো হয় না। Existing buyer-only full copy অপরিবর্তিত।

## একাদশ ধাপের প্রথম অংশ: admin sales receipt report

- `/admin/marketplace-revenue`: fresh DB role ADMIN যাচাইয়ের পর শুধু platform receipt prefix পড়া হয়। Purchased question snapshots/buyer institution/bKash numbers পড়া হয় না।
- ৫০টি record/page cursor pagination, stable receipt-key order। Validated allowlisted financial fields এবং TID; invalid receipts count/alert সহ totals থেকে বাদ।
- Gross sale, seller earnings ও platform share কেবল current page-এর totals বলে স্পষ্ট label। এটি lifetime totals, net profit, external settlement/cash balance report নয়। Existing withdrawal audit views-এর link।
- Immutable historical receipts listing সরালেও থাকে। Report read-only; কোনো payout/refund/balance mutation নেই। Admin dashboard link যুক্ত।

### দশম / একাদশ প্রথম অংশের যাচাই ও অবশিষ্ট

- Typecheck + ৪০৪ tests passed। New tests cover deterministic/minimum/small/300-question excerpt limits, secret-field absence, inline solution/resource suppression, unapproved/tampered/wrong identity fail-closed, report field allowlist/integer sums/invalid receipts/admin-before-query/pagination bound। পুরোনো metadata-only card safety assertions বজায় রেখে obsolete unavailable-text assertion নতুন sample wording-এ আপডেট।
- Browser/mobile/authenticated production E2E এই ধাপে করা হয়নি; production money ব্যবহার হয়নি। Report sample count/selection সম্পূর্ণ UI/financial DB E2E নয়।
- এখনও বাকি: নিজস্ব PDF assembled-paper provenance ও sale; refund/dispute flow এবং source-aware financial reversal; lifetime/date-range/settlement reconciliation reports; admin payout assignment/configurable financial limits; full rebrand/domain auth/payment callback verification; final authenticated/mobile/print/payment E2E। মূল পরিকল্পনা অপরিবর্তিত।

## দ্বাদশ ধাপ: ক্রেতার অভিযোগ ও source-preserving full refund

- কেনা কপি ও লাইব্রেরি থেকে `/dashboard/library/[id]/report`: authenticated actual buyer প্রতি purchase-এ একটি ১০–২০০০ অক্ষরের অভিযোগ জমা দিতে পারেন; existing record retry-তে overwrite হয় না। Fresh account/owned purchase validation এবং explicit terms confirmation। স্বয়ংক্রিয় রিফান্ড বা সময়সীমার নিশ্চয়তা নয়।
- `/admin/marketplace-disputes`: fresh ADMIN DB role guarded OPEN/REFUNDED/REJECTED queue; ৫০ record/page cursor pagination; কারণ, note ও audit status। সিদ্ধান্তে ১০–১০০০ অক্ষরের note আবশ্যক; refund-এর জন্য explicit checkbox। Rejected সিদ্ধান্তে টাকা/কপি বদলায় না। নিষ্পত্তি চূড়ান্ত; conflicting second decision আটকে যায়।
- Full refund মূল buyer debit ledger-এর `used` source amounts থেকে ফেরত: bonus→bonus, recharge→recharge, received→received, earnings→earnings। চারটি safe integer source sum মূল price-এর সঙ্গে মিলতে হয়। Original ledger না থাকলে বা ভুল হলে fail closed। কোনো nonwithdrawable source earnings/recharge-এ উন্নীত হয় না।
- একই wallet advisory transaction-এ seller earnings-only reversal, buyer-এর original-source credits, immutable refund receipt, purchase refundedAt এবং complaint decision commit। মূল platform sale receipt অপরিবর্তিত audit record হিসেবে থাকে; refund receipt তার platform অংশ বিপরীত সমন্বয় করে। Duplicate/concurrent approval-এ একবারই refund।
- বিক্রেতার অবশিষ্ট earnings seller share-এর চেয়ে কম হলে refund ব্যর্থ; অভিযোগ OPEN থাকে। Recharge/received/bonus বা held payout থেকে জোর করে টাকা কাটা, negative debt কিংবা invented funds নয়। এই ক্ষেত্রে বাহ্যিক সমন্বয়/তদন্ত প্রয়োজন; সেই প্রক্রিয়া এখনও স্বয়ংক্রিয় নয়।
- Refunded purchase private paper route ও institution update default validation-এ বন্ধ; library/report audit-এ status দেখা যায়, snapshot client-এ পাঠানো হয় না। একই refunded purchase checkout retry-এ charge/re-purchase হয় না। আগেই loaded/downloaded/printed copy প্রযুক্তিগতভাবে ফিরিয়ে নেওয়া যায় না; UI-তে রিফান্ডের পর ব্যবহার/বিতরণ না করার শর্ত ও সীমা বলা আছে।
- Admin sales report সংশ্লিষ্ট current-page original receipts-এর matching refunds দেখায়; gross/refund/adjusted seller-platform অংশ আলাদা। পরিচয়/পরিমাণ/date না মেলা refund alert সহ adjustments থেকে বাদ। এটি lifetime cash/settlement/net-profit report নয়।

### দ্বাদশ ধাপের যাচাই ও বাকি কাজ

- Typecheck + ৪১১ tests pass। Tests: exact mixed-source restoration, concurrent duplicate refund, buyer/admin/consent/notes checks, insufficient seller earnings, tampered source/platform receipt, final refund/copy/history/dispute failure rollback, rejection immutability, refunded private access/edit/repurchase denial, exact report matching।
- Actual disposable PostgreSQL integration pass: forced final refund-receipt insert failure rolls back both wallets, access marker and complaint; আট concurrent approvals refund once to exact original sources, seller share reversed once এবং online copy revoked। Previous purchase/withdrawal/Send Money integration পুনরায় pass। Script: `scripts/wallet-transfer-postgres-check.cjs`; only explicit disposable localhost:5439 URL; production `DATABASE_URL` পড়ে না।
- Production ব্যবহারকারীর অর্থ বা real bKash payout দিয়ে পরীক্ষা হয়নি; authenticated production/mobile browser E2E এই ধাপে হয়নি। Automatic external payout/refund API যোগ করা হয়নি।
- PDF review: existing `readyowned` records represent paid copies/selections, not sufficient proof of original assembled-paper authorship। সেগুলোকে নিজের তৈরি ধরে resale eligibility দেওয়া হয়নি। নিরাপদ PDF provenance ও protected buyer delivery এখনও আলাদা অসমাপ্ত কাজ।
- অন্যান্য অবশিষ্ট: PDF-created assembled-paper resale, insufficient-seller-funds recovery policy, payout admin assignment ও configurable limits, lifetime/date-range/settlement reports, full rebrand/domain Google login/payment callback validation, final authenticated/mobile/print/payment E2E। Original plan unchanged; এই appendix পুরোনো pending-refund status-কে supersede করে।

## ত্রয়োদশ ধাপ: উত্তোলনের একক অ্যাডমিন দায়িত্ব ও durable claim audit

- Manual bKash payout/reject-এর আগে pending HELD request নিজের দায়িত্বে নিতে হবে। Fresh DB role ADMIN, explicit confirmation, valid request এবং matching active hold ছাড়া claim হয় না। পুরোনো pending request-ও claim করতে হবে; existing paid/rejected history bulk rewrite হয়নি।
- একই financial advisory transaction lock-এ unique claim audit এবং request claimedBy/claimedAt একসঙ্গে লেখা হয়। Same-owner retry idempotent; অন্য admin claim/PAID/REJECTED করতে পারেন না। Review-তে claim owner ও independent audit-এর request identity/amount/number/timestamp মেলানো হয়। Active hold/unique payout TrxID/explicit actual-payment confirmation আগের মতো আবশ্যক।
- Claim non-expiring এবং auto-release/steal/reassignment API নেই। বাইরে টাকা পাঠানো শুরু হয়ে থাকতে পারে—তাই timeout দিয়ে অন্য admin-কে পাঠানোর অনুমতি দেওয়া বিপজ্জনক। Owner অনুপস্থিত/role হারালে manual investigation প্রয়োজন; নিরাপদ handover এখনও pending।
- Admin UI: unclaimed request-এ claim form; শুধু owner-এর settlement form; অন্য admin-কে স্পষ্ট ‘টাকা পাঠাবেন না’ সতর্কতা ও claimed identity/time। Corrupt request-এ controls না দেখিয়ে alert। Ledger hold/source amount claim-এ বদলায় না।
- Claim কোনো external payment API নয়। একই admin দুই tab থেকে বাইরে দুইবার পাঠানো বা সফটওয়্যার উপেক্ষা করে টাকা পাঠানো প্রযুক্তিগতভাবে আটকায় না; UI-তে সেই সীমা বলা আছে। Claim সফল হওয়ার আগে এবং external provider history যাচাই ছাড়া টাকা পাঠানো যাবে না।
- Typecheck ও ৪১৪ automated tests সফল: legacy claims, consent/auth/other admin/terminal restrictions, ৮ concurrent same-owner retries, no timeout theft, audit/request write-failure rollback, missing audit/hold/corrupt amount rejection এবং existing payout/refund/source rules regression।
- Actual disposable PostgreSQL integration: দুই admin-এর আট concurrent claims-এ একজনই owner; অন্য admin review blocked; owner repeat claim/rejection succeeds once। আগের purchase/refund/Send Money/withdrawal integration পুনরায় সফল। No production money/real bKash payout বা authenticated production browser E2E এই ধাপে নয়।
- অবশিষ্ট: original PDF assembled-paper provenance/resale ও protected delivery; configurable financial limits; safe payout handover; insufficient-seller refund recovery; lifetime/date-range/settlement reporting; full rebrand/domain Google login/payment callback validation; final authenticated/mobile/print/payment E2E। Original plan unchanged; পুরোনো manual coordination-only limitation আংশিক উন্নত, সম্পূর্ণ external duplicate-payment prevention দাবি নয়।

## চতুর্দশ ধাপ: admin-configurable financial limits ও revision audit

- `/admin/wallet-limits`: fresh DB ADMIN role guarded settings ও সর্বশেষ ৫০ audit records। প্রতিটি পরিবর্তনে explicit confirmation, ১০–৫০০ অক্ষরের কারণ, updatedBy/time এবং immutable before/after audit। একই financial advisory transaction-এ config ও audit commit। Stale revision reject; একসঙ্গে দুই admin পুরোনো form দিয়ে overwrite করতে পারেন না।
- Configurable: দৈনিক Send Money maximum ৳১–৳৫০,০০০; দৈনিক recipient lookup ১–১০০; প্রতি withdrawal request maximum ৳১০০–৳৫০,০০০। Hard safety ceilings server-এ; bonus/received/earnings restrictions, ৳১ send minimum, ৳১০০ withdrawal minimum, fee ৳০, এক active withdrawal ও ১০ মিনিট quote expiry অপরিবর্তিত।
- Config না থাকলে আগের defaults: ৳৫,০০০/day send, ৩০ lookups/day, ৳৫০,০০০/withdrawal। Invalid/corrupt saved config হলে নতুন Send Money/withdrawal fail closed; নীরবে বেশি permissive default-এ ফেরে না। Completed Send Money retry নতুন debit নয়; নতুন limit read করার আগেই পুরোনো completion receipt ফেরত আসে।
- Send prepare এবং confirm উভয়ে latest limits financial lock-এর মধ্যে পড়ে। পুরোনো quote দিয়েও lower current limit এড়ানো যায় না। Daily transfer/lookup counters reset নয়; দিনে ইতিমধ্যে বেশি খরচ হলে limit কমানোর পরে আর নতুন send হবে না। Bangladesh date accounting বহাল।
- Withdrawal maximum নতুন request-এর জন্য; আগে হোল্ড হওয়া withdrawal ও same-ID replay নতুন lower maximum-এর কারণে বাতিল হয় না। Existing claim/review/source rules ও manual payout audit অপরিবর্তিত।
- User send/withdraw page-এ database limits দেখানো ও form maximum সংযুক্ত। Client attribute নয়, server validation চূড়ান্ত। Old open page stale হলে server নতুন limit enforce করে। Admin dashboard link যুক্ত।
- Typecheck ও ৪২১ tests pass: defaults, corrupt config, invalid amount/lookup/revision/note/consent, non-admin rejection, ৮ concurrent stale edits-এ এক revision, immutable before/after audit, config/audit write rollback, lower-limit pending quote block, no quota reset, lower withdrawal max enforcement এবং old hold settlement।
- Actual disposable PostgreSQL integration pass: আট concurrent admin edits-এ এক accepted revision/audit; lower cap পুরোনো pending quote আটকে দেয় এবং balance অপরিবর্তিত। Previous transfer/claim/withdrawal/purchase/refund integrations pass। No production money/external payout বা authenticated production browser E2E এই ধাপে হয়নি।
- অবশিষ্ট প্রধান অংশ: original assembled PDF paper provenance/resale ও protected paid delivery; lifetime/date-range/settlement রিপোর্ট; safe payout handover ও insufficient-seller refund recovery; full rebrand/domain Google login/payment callback verification; final authenticated/mobile/print/payment E2E। Original plan unchanged।

## পঞ্চদশ ধাপ: তারিখভিত্তিক / all-record আর্থিক event report

- `/admin/financial-report`: fresh DB ADMIN-only; বাংলাদেশ সময় (+06:00) inclusive start/end দিন। দুটি date না দিলে all-record mode; ভুল/অসম্পূর্ণ/reversed date-এ কোনো misleading report নয়। Admin dashboard এবং per-page sale report থেকে link।
- Gross marketplace sale ও seller/platform split purchase event date অনুযায়ী। Refund নিজস্ব refundedAt অনুযায়ী—আগের মাসের বিক্রি এই মাসে ফেরত এলে এই মাসে negative adjusted flow বৈধ। Refund মূল immutable sale-এর identity/amount/split/date-এর সঙ্গে মিলতে হয়। Original sale records মুছে ফেলা বা gross থেকে গোপনে বাদ দেওয়া হয় না।
- Payout ও rejected-withdrawal release reviewedAt অনুযায়ী; valid paid TrxID/reviewer/date আবশ্যক। HELD ও claimed count snapshot-এর বর্তমান অবস্থা, range-filtered historical hold নয়। Payout amount ও held amount seller-share/platform-share থেকে অন্ধভাবে বাদ দিয়ে ‘নিট লাভ’ দাবি নয়।
- Server-only data helper PostgreSQL RepeatableRead transaction-এ fresh role, database transaction timestamp এবং তিন receipt-prefix scan করে—আলাদা live-query snapshot-এর অসামঞ্জস্য নয়। Purchased snapshots, question bodies, wallet balances/credentials পড়া হয় না। Read-only: আর্থিক writer পরিবর্তন হয়নি।
- Per-prefix ১০,০০০ records safety bound (+১ sentinel); এর বেশি বা কোনো malformed/unmatched/backdated financial record থাকলে `complete:false`, prominent incomplete alert এবং excluded-record counters। Scan-bound ছাড়ালে lifetime/date-range final total দাবি করা হয় না; scalable persistent aggregation এখনও future work।
- UI-তে স্পষ্ট: রিচার্জ/তৈরির চার্জ/Send Money/all-wallet-liabilities/bank statement/cash/net-profit হিসাব নয়। PAID হলো admin-recorded external payout, provider-verified settlement নয়। External statement reconciliation এখনও প্রয়োজন।
- Typecheck ও ৪২৮ tests pass। Tests: Dhaka midnight/end boundaries, invalid dates, independent sale/refund dates ও negative flow, payout/rejection date filter, current held semantics, corrupt/orphan/backdated receipts, hard bound incomplete flag, auth-before-read ও repeatable-read options।
- Actual disposable PostgreSQL integration সফল: non-admin blocked; original sale ও refund reconcile; release rejection payout হিসেবে গণনা নয়; timestamp ও complete flag সঠিক। আগের wallet/claims/limits/purchase/refund regression integration পুনরায় pass। Production money বা authenticated production/mobile browser E2E এই ধাপে হয়নি।
- অবশিষ্ট: original assembled-PDF paper provenance/resale এবং protected paid delivery; bank/provider statement reconciliation ও scalable >১০,০০০ event aggregation; safe payout handover/insufficient-seller refund recovery; full rebrand/domain Google login/payment callback validation; final authenticated/mobile/print/payment E2E। মূল পরিকল্পনা অপরিবর্তিত।

## ষোড়শ ধাপ: shared shell / PWA / metadata-তে প্রশ্নবুক পরিচয়

- Shared `lib/brand.ts`: বাংলা প্রশ্নবুক.কম, English Proshnobook, domain proshnobook.com ও Bengali tagline। Header/footer, শিক্ষক workspace, wordmark, compact logo, optional intro, navigation drawer/legacy navbar, processing popup ও install prompt shared identity ব্যবহার করে। Bengali wordmark/intro-তে Kalpurush UI font/fallback, স্বাভাবিক letter spacing ও line height; existing navy/violet/teal design unchanged।
- `getSite`-এ known saved legacy name/tagline aliases শুধু display-তে normalize হয়; database settings rewrite নয়। Custom admin names, footer/social/contact data অক্ষুণ্ণ। No invented support@proshnobook email বা phone।
- PWA name/short_name/description ও app metadata defaults নতুন পরিচয়ে। Install app ID/start_url/scope, storage snooze key এবং generic icon asset paths অপরিবর্তিত—installed identity বা persisted preferences reset নয়। Existing account, cookies, TID, ledger, receipts, saved paper settings/header এ কোনো পরিবর্তন নেই।
- RSS নতুন brand title/description; sitemap/robots/layout/feed একটি sanitized operational origin helper ব্যবহার করে। Missing/invalid config-এ আগের QuestionMaker Vercel origin; no localhost/SaifulSir fallback। Valid explicit SITE_URL override retained।
- Canonical host switch, redirect, AUTH_URL, Google OAuth credentials/callbacks, payment endpoints বা Vercel environment পরিবর্তন করা হয়নি। Custom domain login/callback verification ছাড়া old address সরানো হয়নি। Display brand change নিজে OAuth verification নয়।
- Auto-generated share caption hashtag/footer ও admin post search-preview label নতুন নাম; generic icon filenames/internal qm/proshnoday CSS/module names ও repository/package/storage identity rename নয়।
- Typecheck ও ৪৩২ automated tests pass: actual rendered wordmark/logo/intro, manifest values, read-only saved alias normalization, contact preservation, operational URL sanitization/fallback, existing footer navigation ও truthful processing-progress checks বজায়।
- Synthetic Chromium 320/390/768/1440: actual header/wordmark/logo/intro নতুন বাংলা নাম, no old brand text, no horizontal overflow, reduced-motion rendering, no browser exceptions। Navigation/theme mocked; authenticated production OAuth/mobile phone E2E নয়। Scratch `/home/user/rebrand-browser`, binaries outside Git।
- এটি core-shell rebrand, সম্পূর্ণ historical/legal-content migration নয়। Imported/personal legacy policy/about/contact/educational page content ও কিছু পুরোনো outbound URL এখনও review দরকার; contact channels যাচাই না করে নতুন support endpoint বানানো হয়নি। নতুন legal/privacy/refund terms-এর পূর্ণ review আলাদা pending।
- অবশিষ্ট প্রধান কাজ: original assembled-PDF provenance/resale/protected paid delivery; historical/legal page identity/content review; domain Google login/payment callback checks ও canonical migration; safe payout handover/refund recovery ও provider reconciliation/scalable financial aggregation; final authenticated/mobile/print/payment E2E। Original plan unchanged।

## Phase 17 — Current marketplace information and policy pages (2026-11-10)

- Replaced obsolete SaifulSir/free-service/legal-assurance copy on about, privacy, terms, contact, disclaimer and copyright pages with Bengali Proshnobook information matching current marketplace/source-aware wallet behavior.
- Shared accessible policy navigation and fixed revision date; added cookie/local-storage guidance. Old privacy-policy/terms-conditions/dmca-policy URLs redirect to current local routes; /contact redirects to /contact-us.
- Contact reads existing getSite email/phone without altering settings. Validated mailto/tel targets; missing channels explicitly disclosed. No invented support inbox, payment-number-as-support, automatic message form, deletion SLA, legal-agent registration or universal compliance claim.
- Terms distinguish creation vs purchase, immutable buyer copies, own DB-paper resale vs unfinished assembled-PDF resale, source-aware refunds/insufficient seller earnings, earnings-only manual withdrawals and source restrictions. Copyright approval is not presented as proof of legal rights.
- Six rendered/redirect regression tests cover identity/navigation/date, financial limitations, privacy providers, configured/missing/unsafe contacts and aliases. No auth/callback/financial behavior changes.
- Outstanding: publish/verify real support channels in site settings (operator action); legal review by a qualified adviser; assembled-PDF provenance/protected delivery; external reconciliation and final authenticated/mobile/print/payment E2E. This phase does not complete the entire project.

## Phase 18 — Immutable PDF assembly origin foundation (2026-11-10)

- New ready-PDF checkout atomically creates a separate create-only `readyorigin:v1:<owner>:<receipt>` manifest and binds its SHA-256 digest to the receipt. Server derives source/classification from the canonical ready record, not browser claims; initial selected order, effective edits/header and source metadata/URL are retained independently of mutable draft edits.
- Uploaded-source assemblies remain explicitly classified `UPLOADED_SOURCE`; library assemblies are `LIBRARY_ASSEMBLY`. Both have `resaleAuthorized: false`. This is evidence of a server checkout, not legal authorship/copyright, PDF byte integrity or permission to resell. No marketplace PDF resale endpoint enabled.
- Owner-only origin lookup verifies receipt binding, source ID and manifest digest; corrupted/missing new origins fail closed. Legacy receipts are explicitly unverified, are not backfilled from today's source and remain reusable without new origin charges.
- New saved assemblies load their archived source record, so later library source URL/metadata replacement or archival does not silently change them. Browser checkout sends its displayed source URL; a mismatch with the current source blocks a new selection/charge and asks the user to reopen Library. Original storage objects must still exist; source bytes are NOT copied/hashed or protected by this phase.
- Saved library explains origin status without implying resale rights. Authentication, existing payment prices and source-aware financial behavior preserved.
- Validation: typecheck; 446/446 security/regression tests. Eight new action tests cover atomic rollback, ignored browser origin claims, draft/source mutation isolation, upload classification, owner scoping, corruption/missing/legacy behavior, eight concurrent retries (mock-serialized transaction) and stale-source no-charge. No production real-money or real PostgreSQL E2E claimed for this phase.
- Remaining PDF work: immutable final assembled output/version submission, provenance-aware moderation, private storage/authenticated bounded delivery with no public paid URL leak, institution-only purchased render/print, previews/refund integration and authenticated browser/real-DB verification. Public Blob source URLs are not DRM or secure paid storage. External statement reconciliation, payout handover/insufficient-earnings recovery and final mobile/print/payment E2E also remain. Do not mark entire plan complete.

## Phase 19 — Encrypted selected-source checkpoints and authenticated delivery (2026-11-10)

- Added opt-in server-generated source checkpoints for new ready-PDF receipts with valid immutable origins. Client supplies receipt ID only; no arbitrary final PDF upload, source URL or resale claim accepted. Selected original pages are copied server-side in initial checkout order; this deliberately excludes edited headers/crops/answers and is not a finished assembled export.
- AES-256-GCM with randomized nonce and owner/receipt/origin/digest/key-ID authenticated binding. Existing Blob holds ciphertext only; immutable private manifests hold URL, source/output digests and limits. Owner-only download decrypts and integrity-checks server-side with final authorization recheck; no public redirect, provider URL, plaintext fallback or ADMIN bypass. Legacy public sources/other download routes remain unchanged, not retroactively private.
- Keyring supports keeping old decrypt keys while changing active key. Feature off by default until server-only PDF_VAULT_KEYS/ACTIVE_KEY and Blob configuration are securely provisioned and runtime verified. No production secrets, payment/auth settings or financial behavior modified. Saved-library control hidden when config absent/invalid.
- Provider work outside DB financial lock, owner/day attempt cap 10, source 10MB/100 pages, selection 1–10, output 3MB, streaming byte caps/no redirects/20s deadlines. Idempotent create-only manifest; concurrent losers/failed writes clean encrypted uploads best-effort. Original paid receipt/draft stays intact on any failure.
- Added operator/security/rollout guide: PDF-VAULT-OPERATIONS.md. Explicitly not DRM, a complete PDF sanitizer, proof of copyright, marketplace resale integration or a migration of existing public paid URLs. Parsing arbitrary PDFs is not a CPU sandbox; orphan ciphertext cleanup remains an operator concern.
- Validation: typecheck and 461/461 security/regression tests passed (15 new tests using actual AES-GCM/pdf-lib, mocked storage/auth/network/serialized DB). Covers selection/order/annotation removal, ciphertext integrity/binding/key rotation, unsafe URLs/bounded reads, duplicate capture cleanup/rollback, owner/legacy/refund/origin checks, final revocation during fetch, generic route/action failures, limits and rendered UI scope. Production Blob/key/real-DB/mobile capture E2E not yet performed; feature not declared production-enabled.
- Verified prior PR116 production exact SHA bebfaa76aaf285405773824be845228fdeaf2666: deployment dpl_5cRAZxUGfHGnmpTHg4sQjybAzGNo READY/PROMOTED via Vercel. PR115 also READY/PROMOTED (dpl_HToxzmEzXqXKETyVNdoHhHnB5inS).
- Next: provision/test isolated preview keys+storage safely; final assembled immutable render/export, provenance-aware seller moderation and PDF purchase/refund integration. Other remaining work: external statement reconciliation/report scaling; payout handover/insufficient-seller recovery; real support channels/legal review; authenticated end-to-end/mobile/A4 testing. Entire project remains in progress.

## Phase 20 — Financial report batched full scan (2026-11-10)

- Replaced the production loader's first-10000-per-prefix aggregation with 500-row keyset batches in one repeatable-read transaction. All sale/refund/withdrawal events are scanned without accumulating complete source arrays; refund batches fetch at most 500 corresponding immutable platform receipts, including sales outside the date range/earlier scan batches. No buyer question snapshots or wallet rows read.
- Preserved independent sale/refund/payout event dates, Dhaka date boundaries, current holds independent of selected dates, validation of receipt matching and invalid-record/incomplete warnings. Existing pure bounded-report helper remains bounded for standalone callers; the new production streaming reducer uses it only on small batches.
- Integer-safe accumulation, strictly advancing cursors, bounded lookup validation and fail-closed query/timeout handling. A failed scan returns no partial successful total. Snapshot transaction timeout is 60 seconds; this removes the fixed 10000 cutoff, not infinite-runtime limits. Very large datasets may still need materialized/indexed event aggregation or offline jobs; this is not provider statement reconciliation or cash/net-profit/liability accounting.
- Updated admin report copy and execution budget. Added four tests: 10007 sales plus 10007 matching refunds without truncation, parity with established date/corruption/current-hold rules, mid-scan query failure and malformed cursor/batch/lookup rejection. Existing loader tests retain fresh admin enforcement, repeatable-read and common timestamp checks.
- Validation: typecheck, diff check, 465/465 security/regression tests passed. New scan tests use deterministic readers; no production financial data or payment flow modified, no real production-money E2E claimed.
- Remaining: securely provision/verify PDF vault configuration; final assembled PDF and resale integration; payout handover/insufficient-seller refund recovery; external reconciliation and full liabilities/cash/profit reports; support channels/legal review; authenticated mobile/print/real-DB end-to-end checks. Entire project remains in progress.

## Phase 21 — Consensual two-party withdrawal claim handover (2026-11-10)

- Current fresh ADMIN claimant can propose a named different ADMIN recipient with current claim revision, explicit consent and a 10–1000-character reason. Recipient must explicitly accept as a fresh ADMIN; original claimant may cancel while pending. No automatic expiry, stealing, forced takeover or absent-owner recovery.
- Pending proposals freeze both claim confirmation and payout/rejection recording server-side under the existing global financial transaction lock. Hold/claim audit and active-request pointer are checked before every transition. Acceptance atomically changes the current claim/request, closes the proposal and appends immutable offer/accept audit events retaining the previous claim. Cancellation appends its own immutable event without changing ownership/funds.
- New claim handover token invalidates pre-handover settlement forms even if ownership later returns to the same administrator; UI passes current token. Offers also bind current claim timestamp/token; stale proposals cannot accept or cancel a later proposal. No wallet debit, release, payout or provider call is performed by a handover.
- Admin withdrawals UI includes current eligible ADMIN recipients (bounded first 100), reason/consent controls and explicit pending freeze warnings. Malformed handover records fail closed rather than offer payout controls. Existing non-handover claims/settlement retries remain compatible.
- Validation: typecheck and 470/470 security/regression tests passed. Five new action tests cover two-party freeze/accept/settlement, stale forms/roles/consent/cancellation, audit/claim/request write rollback, stale proposals and corrupted hold/claim data, eight concurrent accepts committing one transition. Uses serialized mocked DB, not production external-money or real PostgreSQL/browser E2E.
- Limits: original claimant must cooperate and remain ADMIN to offer/cancel. An absent/demoted claimant still requires a separately designed, audited recovery process and external statement investigation. Same-admin external duplicate payments are still not prevented by software; pending UI cannot physically stop a stale tab/user sending money outside the app. Always stop and reconcile external payout activity before proposing, accepting or cancelling a handover.
- Remaining: PDF vault provisioning/runtime tests; final assembled PDF/resale; insufficient-seller refund recovery; absent-owner recovery, provider reconciliation/full financial liabilities and profit; real support/legal review and authenticated mobile/A4/payment/real-DB E2E. Entire project not yet complete.

## Phase 22 — Private general/privacy/copyright support requests (2026-11-10)

- Added authenticated /support with GENERAL, PRIVACY and COPYRIGHT categories, bounded validated text, explicit admin-review consent, owner-only request/response history and 25-record keyset pagination. Five new requests per UTC day/account; identical token retries are idempotent and cannot overwrite an existing or another user's request.
- Added fresh-ADMIN-only /admin/support with response and OPEN/RESOLVED state. Each update requires current revision and explicit confirmation; previous/next states are appended to immutable audit records atomically. Ticket/rate/index writes and admin/audit writes roll back together. Separate support advisory locks avoid holding the financial global lock for support work.
- Private data loader checks a fresh user/role in repeatable-read, uses per-owner indexes for ordinary users and verifies record owner on read, including forged-index/corrupt-record handling. Rendered text is escaped, not executable HTML; no files, email/phone collection or external notifications added.
- Linked support from contact/privacy/copyright and admin dashboard. Preserved configured contact email/phone, policy truthfulness and separate purchased-copy complaint/refund workflow. Replying/closing a support ticket does NOT issue refunds, delete accounts or execute takedowns. No response SLA, designated legal-agent or compliance claim.
- Contact clearly discloses login is required and email/SMS notifications are not sent; requests/replies must be checked in the app. Users unable to log in still need real published external contact channels; none fabricated. Follow-up clarification uses a new request referencing the previous number. No automatic data retention/deletion or external legal review implemented.
- Validation: typecheck, diff check, 478/478 regression tests passed. Eight new tests cover authenticated/idempotent create, owner isolation, rate/validation, atomic failures, fresh ADMIN/demotion, eight concurrent reply CAS updates/audit, private pagination/forged indexes and actual escaped hostile page rendering. DB transactions in tests are mock-serialized; authenticated production/browser and real PostgreSQL E2E remain pending.
- Outstanding: PDF vault provisioning/runtime verification and final assembled-PDF resale; absent-owner payout recovery and insufficient-seller refund recovery; external reconciliation/full liabilities/cash/profit; publish actual external support contacts, qualified legal review; final authenticated/mobile/A4/payment/real-DB E2E. Project remains incomplete; this phase closes the in-app general-request channel gap, not all support or legal obligations.

## Phase 23 — Admin PDF vault rollout diagnostic (2026-11-10)

- Added fresh-ADMIN /admin/pdf-storage with configuration-format readiness (not a connection-success claim) and explicit-consent storage test. Test generates its own non-sensitive one-page PDF; encrypts, uploads ciphertext, reads/decrypts/verifies actual PDF bytes and attempts deletion. Never accepts user source bytes/URL, changes receipts/wallets or configures secrets.
- Global advisory-lock 60-second reservation bounds cross-admin/tab diagnostic provider work. Private diagnostic audit records actor/time, verification and cleanup outcomes. An orphan ciphertext URL is retained privately only if deletion fails; no URL/key/provider-error text returned to client. Cleanup failure means overall check not successful. Missing/malformed config fails closed; configuration still must be securely provisioned, backed up and runtime-verified before claiming rollout.
- Added three tests with actual crypto/pdf-lib + mocked provider/DB: successful roundtrip/test-object-only cleanup, fresh ADMIN/consent enforcement and cleanup-failure private audit/no secret leak. Typecheck and 481/481 tests passed. Production provider roundtrip not executed in this phase; no claim that PDF vault is live or final PDF resale completed.
- User explicitly changed the requested chat website link to https://proshnobook.com; use that domain in future final responses, superseding the previous old Vercel chat link. No auth/callback/canonical settings changed for this chat-link correction.
- Phase22 support remains part of the same open PR120 on the active branch. Remaining larger scope unchanged: vault key provisioning/runtime checks; final assembled/resale integration; financial exceptions/reconciliation; real external contacts/legal review; real-DB/mobile/print/authenticated end-to-end validation.

## Phase 24 — Reachable admin financial queues (2026-11-10)

- Review of remaining operations found withdrawal/recharge queues silently stopped at first 100/200 matching rows. Added bounded keyset pagination with one sentinel (101/201 queried, 100/200 rendered), preserved status filter on withdrawal next links, first-page navigation and explicit empty states. Cursors advance on scanned keys even when records are corrupt; no record arrays/financial history loaded unboundedly.
- Withdrawal cards now reject exact parsed status mismatch rather than trusting substring selection alone. Recharge list now checks fresh DB ADMIN role before reading personal recharge rows (existing guard also retained), validates record/key ownership, pending status and allowed amount bounds before approval controls. Approval/debit/credit/claim/handover/refund writers unchanged.
- Added five tests for strict bounded queries, 251 withdrawal and 403 recharge navigation without duplicates/missing records, malformed cursors, status/URL encoding, corrupt cursor progress and no false next page.
- Validation: typecheck, diff check and 486/486 tests passed. Queue pagination uses deterministic fixtures; production authenticated UI/real-money/real-DB E2E not claimed.
- Remaining critical work reviewed, not marked complete: securely provision/backup vault keys and run real storage diagnostic; final edited immutable PDF export + source-aware resale/moderation/purchase/refund flow; insufficient-seller and absent-owner recovery; external statement reconciliation/full cash/liability/profit reports; actual external support contacts/legal review; authenticated mobile/A4/real-DB/payment end-to-end checks. PR120 previously merged; follow-up work is on active arena/e4d32b57-questionmaker-com only. Chat website link remains https://proshnobook.com.

## Phase 25 — Read-only refund readiness / earnings-shortfall inspection (2026-11-10)

- Added a separate ADMIN-only inspection action/control to each open marketplace complaint. One repeatable-read transaction validates fresh ADMIN role, open complaint, immutable purchase/platform receipt matching and original source debit ledger before reporting required seller share, current remaining earnings and exact shortfall. No user-supplied amount/earnings/source accepted.
- Inspection does not provision/migrate wallets, hold/debit/credit funds, change complaints, mark refunds, create seller debt or call providers. Non-earnings and held-out earnings are not treated as recoverable seller funds. Missing/corrupt/mismatched records return generic blocked state rather than a misleading ready amount.
- UI distinguishes advisory current-state inspection from actual refund approval. Existing atomic refund action remains authoritative and rechecks after any intervening seller spend. Shortfall guidance explicitly forbids converting externally reconciled money directly into earnings and makes no automatic recovery promise.
- Validation: typecheck, diff check and 490/490 tests passed. Four new action tests: fresh ADMIN/read-only ready inspection, exact shortfall/non-earnings exclusion with no mutation, missing/mismatched/corrupt/closed cases, and ready-then-spent rollback at actual refund. Mock-serialized DB only, no production money or real PostgreSQL/browser E2E claimed.
- Important: this is visibility/readiness, not completion of insufficient-earnings recovery. A lawful/source-correct settlement policy and implementation are still required for that case. Final PDF export/resale, secure vault provisioning/runtime checks, absent-owner recovery, external statement reconciliation/full cash/liabilities/profit, external support/legal review and final authenticated/mobile/A4/real-DB E2E also remain. User invited to supply additional separate tasks; no claim of whole-project completion.

## Phase 26 — Urgent legacy paid-resource authorization fix (2026-11-10)

- Priority review found legacy /api/download/[id] allowed any TEACHER to download a paid resource without its PAID purchase. Removed role bypass; ordinary users of any role must have an exact user/resource PAID purchase. ADMIN exemption uses fresh database role, not stale session role; deleted users denied. Free resources remain accessible.
- Download responses now private/no-store, Cookie-varying and no-referrer; denied requests do not disclose the destination or increment counters. Invalid/negative prices and unsafe redirect schemes/credential-bearing URLs fail closed before counting. Legacy admin-provided HTTP/HTTPS external links remain supported; no arbitrary server fetch introduced.
- Public /videos previously embedded/exposed paid resource fileUrl unconditionally. Paid cards now show guarded /api/download links and purchase control, never raw source/embed; existing PAID buyers not prompted to buy again. Free videos remain supported; malformed prices/URLs do not become free content.
- Validation: typecheck, diff check, 495/495 tests passed. Five new tests cover teacher/student and stale-admin denial, exact PAID/fresh ADMIN access, anonymous/deleted accounts, free compatibility/unsafe URLs/corrupt prices and actual paid video rendering without URL/embed leakage. Auth/provider/database mocked; no production authenticated E2E claimed.
- IMPORTANT: this closes application-route/public-card bypasses only. Legacy uploaded resource PDFs remain public Blob objects, and authorized redirects reveal destinations. Previously known/public URLs are not revoked and video hosting is not DRM. Paid delivery private-storage migration remains critical; do not claim all paid resources are now private.
- Must-do priorities: (1) finish private paid delivery migration and secure vault key backup/provisioning/runtime verification; (2) safe insufficient-earnings and absent-owner payout recovery, with statement reconciliation; (3) final immutable assembled-PDF sale flow with moderation/purchase/refund integration; (4) real-DB/authenticated buyer/seller/admin/mobile/A4/payment E2E before release claims. External contact publication and qualified policy/legal review remain operator tasks. Chat website link: https://proshnobook.com.

## Phase 27 — Encrypted paid-resource upload, migration and bounded delivery (2026-11-10)

- Added resource-bound encrypted PDF manifests and provider-read/decrypt verification before any resource pointer switch. Paid non-video PDF uploads now require files + valid vault config (3 MB/100 pages), are stored encrypted and commit resource/manifest atomically with a fresh ADMIN check. No public fallback; external non-video paid PDF URLs are rejected for new resources. Free uploads/video hosting remain legacy, explicitly outside private-PDF claims.
- Added paginated fresh-ADMIN legacy migration UI /admin/pdf-storage/resources, consent and 10 attempts/day/admin. Only bounded Vercel Blob PDF sources accepted. Capture/upload outside DB lock; resource lock, fresh role and unchanged source checked at commit. Create-only manifest/private source migration audit, atomic pointer switch and failure/loser cleanup. Source objects are NOT automatically deleted due shared-reference/backup risks.
- Download route serves migrated resources as no-store PDF attachments without provider URL redirect, verifies current purchase/DB role before reading and again after storage I/O, validates encrypted binding/hash and fails closed without old-URL fallback. Paid anonymous denied; resources deliberately changed to free preserve public free access. No range support. Free public PDF cannot become paid by price edit alone; new encrypted paid copy required.
- Tests exercise actual AES-GCM/pdf-lib with mocked Blob/DB: migration verified before pointer switch, idempotency, paid access/teacher+stale-admin denial, mid-I/O purchase revocation, failed commit cleanup, changed source/provider corruption, attachment without URL leak, new encrypted upload/no-public-link fallback, config denial, corrupt manifest, free compatibility and unsafe free->paid conversion rejection. Not real production DB/provider/browser E2E.
- User authorized work across priorities 1–6 and merge. This phase is a substantial implementation of priority1, not completion of all six. Remaining hard gates: secure production key provisioning/backup + diagnostic; actual approved inventory migration and legacy public object retirement; ready-paper private source migration; final assembled-PDF resale; financially sound insufficient-seller/absent-owner recovery; external statements/full liabilities/cash/profit; real external contact/legal review and authenticated mobile/print/payment/real-DB E2E. No production secrets, records or external payouts changed here.

## Phase 28 — Audited explicit legacy source retirement (2026-11-10)

- Added separate destructive-consent + backup-confirmation retirement control for migrated resource PDFs. Fresh ADMIN role, decryptable archived bytes, matching migration/source hash and canonical legacy /notes/ Blob namespace required. Shared direct Resource/Setting URL references block deletion; external/indirect aliases still require operator inventory. Ready-paper sources/arbitrary URLs not eligible.
- Two-phase provider operation: persist PENDING intent/immutable attempt audit and blocked-source marker before deletion; call provider outside DB transaction; finalize REMOVED or UNKNOWN with guarded operation ID. A post-delete DB failure leaves persistent PENDING intent instead of falsely rolling back a physical deletion. UNKNOWN never means successful retirement. A live PENDING blocks new attempts for five minutes; explicit investigated retries thereafter reverify archive. Completed attempts are idempotent.
- Public/external resource writers now acquire the same source advisory lock and reject retired/pending-source markers, preventing application-created resource references being added during/after removal. Resource list shows private retirement status but not provider URL. No ledger, wallet, purchase or payout mutations.
- Added nine actual-crypto/pdf-lib + mock-provider/serialized-DB tests: successful original-only deletion with continuing encrypted download/audit, shared-resource/setting denial, provider UNKNOWN and retry, post-delete DB-failure persistent intent/recovery, retired-link reintroduction denial, ADMIN/backup consent, reference creation during deletion, eight concurrent attempts issuing one original deletion, namespace/corrupt archive fail-closed.
- No production files/keys/provider operations changed or tested here. Provider caches, old downloads and external references are not revocable by this workflow. Real PostgreSQL/provider/browser backup-restore/propagation tests remain necessary.
- Remaining: actual secure key provisioning/backup/runtime diagnostic and approved production inventory migration/retirement; ready-paper source privacy; final assembled-PDF resale; financial shortfall/absent-owner recovery and reconciliation/full liabilities/cash/profit; external contacts/legal review; authenticated mobile/A4/payment/real-DB E2E. All 1–6 tasks are not yet complete. User's prior merge authorization applies to tested work; website link remains https://proshnobook.com.

### Phase 29 — legacy Resource checkout fail-closed

Legacy Resource purchases now require valid gateway credentials and an HTTPS callback origin before creating a pending purchase. Paid non-video resources additionally require the exact resource-bound private marker and a configured vault. Public paid PDFs cannot initiate new payments. Cards suppress unavailable purchase buttons; the server independently enforces the same gate. Gateway redirects are constrained to the exact configured SSLCommerz HTTPS host. Wallet recharge and marketplace checkout are unchanged. Typecheck and 518 security tests passed.

Production inspection found no PDF_VAULT_KEYS or PDF_VAULT_ACTIVE_KEY in the project environment list; Blob credentials were present (redacted). Deployment readiness is not runtime storage readiness. No key provisioning, backup, real storage diagnostic, inventory migration, original deletion, real payment or legal review was performed. Remaining phases and operator prerequisites above remain outstanding.

### Phase 30 — secret-free storage rollout checklist

Admin PDF storage readiness now distinguishes missing/invalid keyring, missing active key and missing Blob token without disclosing values or parser errors. Explicit backup/restore, redeploy, runtime diagnostic, pilot migration/download and reference-inventory ordering is shown. This is configuration diagnosis only, not backup attestation or production validation. Typecheck and 520 security tests pass. No production keys, files or balances changed. Financial recovery/reconciliation and authenticated operational checks remain outstanding.

### Phase 31 — offline encrypted vault-key backup and restore

Added a dependency-free operator CLI to generate new vault keys or import the complete existing keyring into an authenticated encrypted backup, verify it and restore into new owner-only files outside the repository. Passphrase is stdin-only; key values never print; outputs refuse overwrite/symlink destinations and preserve all rotation keys. Tests exercise actual scrypt/AES-GCM, wrong passphrase/tampering, CLI roundtrip, permissions, no-overwrite, existing-env protection and repository/symlink rejection. This supplies the backup tooling, not an operator-controlled offsite backup or production provisioning. No real keys were created, no deployment configuration changed and no production files/balances were mutated. Runtime rollout, financial exception recovery and statement reconciliation remain outstanding.

### Phase 32 — raster samples, purchased editor and admin catalog controls

- Pre-purchase bounded excerpts are rendered server-side into a flattened watermarked PNG. No full snapshot, answers, source URL or question text layer is embedded in that PNG. Approved status/receipt hash boundary and a post-render record comparison fail closed; responses are no-store. This is a limited sample, not an exact full-page PDF preview or DRM. Sharp and the bundled Hind Siliguri font are required in the Node runtime.
- Per the user's revised buyer-edit policy, a validated non-refunded purchase can open the existing question setup/editor using its private immutable snapshot without another question-bank payment. Questions/settings can be edited for preview/print, but changes are session-only and must be printed/saved as PDF before leaving. No sellable bank draft, resale right, cloud draft persistence or new question-bank entitlement is granted. Print actions recheck purchase access; already delivered client content cannot be recalled.
- `/admin/catalog` provides grade/group, subject, status and keyset paging for published/hidden listings. Fresh ADMIN, expected revision and explicit consent guard metadata edit, unpublish, republish and soft-delete under the financial transaction lock. Teacher pending submissions cannot bypass moderation. Immutable audit records preserve before/after versions. Public sale/sample paths reject UNPUBLISHED/DELETED. Purchased snapshots and financial receipts are untouched. Deleted listings cannot be republished by these controls. Editing is listing metadata, not original question content.
- New dashboard/navigation shortcuts lead to catalog controls. No production records, funds, keys or files were changed by implementing this phase. Real authenticated browser/native font deployment and production E2E remain unverified.

### Phase 33 — owner-approved complete public paper previews

The owner explicitly accepted that all questions/options may be read, copied, screenshotted or OCRed before buying. The detail page now derives complete question sections and saved layout/header from the same paper preview model used by private copies, instead of the limited excerpt widget. The shared browser paper renderer paginates the question paper, and html-to-image/canvas produces displayed PNG pages with repeating `প্রশ্নবুক.কম` branding baked into pixels. There is no PREVIEW/not-for-sale stamp in this new view. Saved question edits, option order and paper settings are preserved for question rendering, while answer-sheet/solution output is disabled. Correct-answer markers, explanations, answer maps, hidden question text and raw receipt/moderation/source records are not sent through the new public model. Buyer editor/clean purchase snapshots remain unchanged.

This intentionally sends full visible question/layout data to the browser: the off-screen render DOM and client payload are public, and branding is NOT DRM or an access-control boundary. It is browser rasterization, not a server-only protected full-PDF renderer. Native browser/font/image rendering determines final pagination; unsupported/cross-origin assets may fail rasterization, with an error/retry rather than a clean unbranded fallback. Authenticated production visual equivalence and mobile performance are not independently verified. Existing approved-only validation rejects pending/unpublished/deleted/tampered records for new page loads; content already delivered cannot be recalled. The legacy limited-sample API is retained but is no longer the detail-page preview. No production records or funds were modified.

Validation: TypeScript and 547 security tests passed, including full visible-question/option preservation, answer stripping, brand-only settings, immutable clean snapshots and rejection of non-public/tampered submissions. Browser rasterization itself remains a runtime visual check.

### Phase 34 — ADMIN-owned paper checkout and platform-only revenue

Owner explicitly chose 100% platform revenue for ADMIN-owned papers; teacher sales keep 60/40. Previously checkout deliberately rejected ADMIN sellers because their exempt wallets cannot receive earnings. Checkout now identifies the seller's fresh role inside the financial transaction, binds confirmation terms to PLATFORM mode, debits the buyer once, skips ADMIN wallet credit, and atomically records a zero-seller/full-platform split plus immutable `revenueMode: PLATFORM` in both purchase and sale receipt. Legacy receipts without a mode retain their original 60/40 validation. Role/mode changes invalidate stale confirmation terms.

Report parsing and source-preserving refunds understand the immutable platform-only split. Refunds compare mode and exact amounts in both receipts, restore original buyer wallet sources and never debit an ADMIN wallet. Refund reporting reverses full platform revenue. This is accounting revenue, not proof of external cash settlement/net profit. Existing purchase keys retain idempotency; no new charges on retries. UI now states the selected split, links successful buyers to Setup, replaces obsolete institution-only restriction text, and shows a slow-request advisory without declaring failed payment or allowing an unsafe retry while pending. No live purchase, refund or production money mutation was performed.

### Phase 35 — PDF / Ready Library marketplace sales

Owner confirmed both personally uploaded PDFs and Ready Library assemblies may be submitted, subject to the seller's explicit sale-rights declaration. A checkout receipt, an upload, editing, or a source checkpoint does not establish copyright or authorize resale; existing origin records remain unchanged and do not gain `resaleAuthorized` status.

Implemented flow: save the assembly → question Print Preview → “Marketplace-এ বিক্রির কপি প্রস্তুত করুন” → choose the prepared PDF/ready source in `/dashboard/sell` and submit metadata plus rights confirmation. The client rasterizes only final selected question sheets, including their rendered header/crop/text/placement, omitting editor handles. No original PDF, unselected page, answer-sheet worker, or source URL is delivered in the marketplace snapshot. Export is bound to an authenticated owner's saved receipt, normalized saved-snapshot hash and unique export batch. Normalized PNGs are uploaded individually (3 MB input, 12 MP decode, max 10 pages); metadata is stripped by Sharp, dimensions capped at 1600×2264. Owner/day quota permits 20 export starts and each page slot is reserved transactionally before provider writes. Failed/uncertain slots require a new export. Client raster content is not server proof of authorship or of exact visual equivalence to a saved snapshot; teacher moderation must inspect all final pages and rights. ADMIN-owned exports retain direct-publication policy.

Final image URLs use content-addressed `market-ready/*.png` paths in the existing application Blob store, with no new credential or database migration. Images are intentionally public under the existing full-question publicity policy; branded public canvases are presentation, not DRM, and backing image URLs are not secret. Pending exports are unlisted but provider-hosted public objects. This is not encrypted vault storage. Blob availability/credentials are required at runtime and were not verified through a live production upload. Images referenced by approved submissions and immutable purchases must be retained: no provider deletion is attempted. Superseded or failed exports may leave retained orphan objects; cleanup requires a separate reference-aware inventory/consent flow.

Marketplace snapshots carry a validated READY_RASTER page list, never the seller's original PDF or ReadyPurchase record. Existing snapshot hashing, moderation revision rules, buyer consent binding, atomic checkout, teacher 60/40 / ADMIN 100% platform split, reporting and source-preserving refunds are reused. The buyer gets an independent clean raster copy, even if the seller later changes the assembly/catalog entry. Buyer Setup offers scale and additional header text, with a fresh purchase/refund access check before print; raster interiors are not structured editable questions, and this limitation is disclosed before checkout. Buyer editor changes remain session-only; print/PDF is required to retain them. Existing structured database-paper editing is unchanged.

Validation: TypeScript passed; Next production build passed; full security suite passed with 571 tests. Export interaction is blocked while raster pages are captured/uploaded to avoid mixing simultaneous UI edits. Targeted tests cover export ownership/quota/batch isolation, image validation/normalization, incomplete/foreign sources, teacher review/ADMIN publication, immutable buyer image snapshots, idempotent checkout and refunds. No live financial transaction, production upload, mobile visual pass, or physical printer verification was performed.

### Phase 36 — creation shortcuts, question feed and public social profiles

Owner approved a feed-based homepage with the existing database/PDF creation workflows and private profile tools retained. Added two prominent creation links below the site header, a grade-filtered question feed before the existing subject catalogs, lazy browser-generated branded first-page previews, explicit prices, full-paper links and native share/copy-link actions. The existing class order, subject lists, marketplace purchasing and financial rules remain unchanged. Feed candidates use bounded keyset scans (six posts / seven candidates), not popularity ranking or a claim of newest-first ordering. Malformed, unpublished and invalid-checksum records are skipped. Structured visible question data remains intentionally public under the owner's previous full-preview policy; lazy rasterization is branding/presentation, not DRM or pre-generated thumbnails. Only the first page is rasterized for feed display, although the shared off-screen renderer still lays out the model. Mobile rendering/performance needs runtime verification.

Public `/teachers/[tid]` profiles now show existing account names, a safe existing Google/avatar image or fallback, real follower counts and follow/unfollow. Profile images can be set from the existing Dashboard, private profile and own public profile; owner-authenticated server processing caps input at 2 MB/12 MP, normalizes to 512px WebP and strips metadata. Uploads use the existing application public Blob storage with a five-attempt/day quota reserved before provider writes. A separate avatar override survives later Google login image updates. No private email, phone, address, financial information, saved drafts or purchased snapshots are projected into public profile data. Existing private Dashboard/profile tools are preserved, with shortcuts to the public profile. Prior avatar objects are retained; no unsafe provider cleanup is attempted.

A distinct `/teachers/proshnobook` official identity has the site logo, official badge and independent followers. Fresh ADMIN may explicitly choose official publication on a new submission; ordinary teacher requests cannot acquire that identity, and existing ADMIN publications are not automatically reclassified. Official publications keep their original seller/financial receipts; personal profile feeds exclude official posts. This is a public presentation identity, not a new wallet or revenue recipient. Verification badges for personal profiles require an explicit ADMIN decision, identity-review confirmation and reason, with immutable audit records. ADMIN/TEACHER role or Google sign-in alone does not grant the badge. Only the official site identity is intrinsically official/verified.

Follow writes use owner-resolved profile identities and the authenticated follower, explicit follow/unfollow intent and a unique hashed follower key. Repeated/concurrent follow requests count once, self-follows and anonymous writes fail, and unfollow cannot decrement below zero. Counts are actual stored relations, not seeded popularity. Writes currently use the existing serialized transaction helper; a larger social workload will need dedicated locking/indexed relational tables/rate controls rather than sharing the financial lock. No schema migration is required for this first stage (existing Setting records). User deletions/large-scale social moderation and orphan-media cleanup require a separate lifecycle policy.

Like, comment, comment moderation, saved social posts, follow notifications and a personalized algorithm are deliberately not implemented in this stage; no fake action buttons or share counters are shown. ZiniPay automation remains deferred by owner instruction. TypeScript and production Next build passed; all 583 tests passed before the final accessible preview-heading adjustment. New tests cover public field allowlisting, avatar host safety/normalization/ownership, idempotent follows, independent official identity, ADMIN-only verification/revocation/audit and explicit ADMIN-only official publication. No production records, followers, badges, images or money were changed. Live Blob upload, authenticated mobile browser testing and performance/physical-print checks remain outstanding.

### Phase 37 — Social interactions and moderated comments (implemented on working branch)
- Extends Phase 36: real authenticated, idempotent likes and private bookmark links on feed/detail; `/dashboard/feed-saved` rechecks public availability and never grants purchase/edit entitlement.
- Comments start PENDING; only APPROVED comments are publicly returned with allowlisted author fields. Authenticated author deletion is terminal. ADMIN approval/hiding requires fresh role lookup, explicit reviewed checkbox, reason and immutable audit. `/admin/social` provides comment pagination and reported-content review.
- Comment submissions are limited to 2–800 characters and ten per fixed ten-minute window. UUID retry tokens bind author, paper and SHA256 body hash. Reports require 5–500 characters, deduplicate per reporter/comment and allow thirty per fixed hour. Public paper eligibility is rechecked inside write transactions.
- Moderation resolves up to 100 open reports per decision; queue displays up to 50 open reports and 30 comments per page. Initial Setting-backed counts/relations use serialized transactions; dedicated indexed tables, stronger distributed abuse controls and lifecycle cleanup remain scale follow-ups.
- Validation: all **587/587 security tests passed**, TypeScript passed, and production Next build passed. Regression coverage includes retry idempotence, stale/unpublished eligibility, authentication, fresh ADMIN permissions, approval filtering, terminal deletion, audit rollback and report deduplication.
- Not deployed/merged. Live authenticated mobile/browser, actual Blob photo upload, OAuth and production database checks were not performed; no payment/financial behavior or production records were changed. ZiniPay remains deferred.
- Follow-up check: reran TypeScript and all 587 security tests successfully; `git diff --check` clean. Local HTTP smoke checks returned login page 200 and redirected anonymous requests for `/admin/social` and `/dashboard/feed-saved` to login. This is not an authenticated end-to-end pass: local AUTH secret, DATABASE_URL and Blob token are absent; Auth.js logs MissingSecret. No browser automation package is installed. Live mobile, OAuth, database-backed interactions and actual uploads remain unverified. Temporary dev server stopped after checking.

### Phase 38 — ADMIN Google login landing
- Main Google login flow now returns through `/auth/landing`, which looks up the authenticated account's fresh database role. ADMIN goes to `/teachers/proshnobook`; all other roles retain their sanitized return destination. No email/client-supplied role grants new privileges, and Google email verification is unchanged.
- Official profile shows ADMIN-only shortcuts to ADMIN panel, Dashboard/Wallet and comment/report moderation. No private data is exposed to public viewers.
- Landing guards anonymous/deleted accounts, external redirects and self-redirect loops. Credentials flow remains unchanged.
- Validation: TypeScript passed; 589/589 security tests passed; production Next build passed. Real Google OAuth/browser login remains unverified in this environment. Not yet deployed.

### Phase 39 — Unified ADMIN publication identity and editable public profiles
- Supersedes Phase 36's separate personal/official ADMIN publication choice: fresh ADMIN submissions automatically publish with official attribution. Legacy ADMIN public-profile URLs redirect to `/teachers/proshnobook`; feed attribution also resolves the canonical official identity. Official feed includes approved legacy records owned by current ADMIN accounts without rewriting submissions, financial ownership, purchases or revenue rules.
- Official default avatar now uses the actual QuestionBook site icon instead of the unrelated legacy `/logo.png`. ADMIN can edit the shared official public name, designation, avatar and cover; normal users can edit only their own public profile. Public overrides do not alter login email, privileges or financial identity. Personal verification remains ADMIN controlled; official stays verified.
- New `/my-profile` entry point resolves fresh account role to its public profile. Homepage and bottom-navigation Profile link use it; public profiles retain explicit Dashboard access to all existing private tools. ADMIN self-follow is blocked for the official identity; legacy ADMIN follow requests are canonicalized.
- Profile editor supports a public name (2–100 characters), designation (up to 160), avatar and cover. Images are normalized to stripped WebP (512x512 avatar / 1600x600 cover), bounded to 2 MB input / 12 MP and share the existing five-attempt/day quota. Server derives target identity from authenticated account, ignoring spoofed IDs. Prior referenced blobs and stored legacy follow records are not deleted; legacy personal-follow history is not merged into official follower counts.
- Validation: TypeScript passed, 593/593 security tests passed. New coverage includes canonical ADMIN identity, fresh role/ownership isolation, official branding, public text editing, cover normalization, self-follow rejection, and approved legacy ADMIN feed inclusion. Real OAuth, Blob uploads and mobile visual verification remain outstanding in a configured environment. Not deployed.
- Production Next build completed (optimized compile, types, static generation and trace output). It logged the sandbox's missing native Prisma query-engine warning during page-data collection; this is not a successful database runtime check. A final feed-designation display-only adjustment was subsequently typechecked. Login regression tests also passed (5/5). Generated tracked `.next` artifacts restored.

### Phase 40 — Avatar clipping and cover overlap fix
- Isolated public profile/feed avatar images from the legacy global article-image rule (`height:auto` and 1.25rem vertical margins with `!important`), which pushed feed avatars downward inside their clipped circles. Dedicated avatar class enforces zero margin and full container height; existing raster-image exclusion is retained.
- Profile avatar now paints above the positioned cover, with a -69px margin against 24px content padding to overlap half its 90px height at the cover boundary. Dashboard controls are not moved.
- Validation: TypeScript passed; all 595 security/regression tests passed, including two new avatar-style regression tests. Real mobile/browser visual confirmation remains outstanding; not deployed.

### Phase 41 — Free marketplace publication and collection
- Teachers/ADMIN can choose free publication in the existing submission form. Free prices are stored as zero; nonzero prices retain the ৳1–৳50,000 range. Rights, source eligibility and teacher ADMIN-review requirements remain unchanged. Source creation costs are not changed by making a publication free.
- Feed/catalog/detail display free listings as “ফ্রি”. Authenticated eligible users confirm collection and receive an immutable library copy with existing Setup/Preview/Print access. Free collection skips wallet debit, seller earnings and platform sale receipts; repeated/concurrent requests return the same copy without a purchase-success payment dialog. Paid checkout and revenue rules remain unchanged.
- Confirmation hashes still bind price/content/seller terms, so stale free confirmations cannot charge a newly paid listing. Free copies validate through the same entitlement checks. Refund action explicitly refuses monetary refunds for free copies; support complaints remain available.
- Library wording now includes paid and freely collected copies and labels zero-price copies “ফ্রি”.
- Validation: TypeScript and all 598 security/regression tests passed; Next production build exited 0. Build emitted the sandbox's missing native Prisma query-engine warning during page-data collection, so this does not validate live database access. New coverage includes teacher review/rights for free publication, zero-fund collection/retries for teacher and platform listings, stale-price protection and rollback. Real account/database/mobile checks remain outstanding. No production data changed or deployment performed.

### Phase 42 — Compact, readable mobile Dashboard
- Dashboard-only `tw-dashboard` layout keeps database/PDF creation cards, tool cards and marketplace links in two-column mobile grids rather than stacking each card full-width. Desktop/general workspace layouts remain unchanged.
- Reduced mobile card padding, gaps and hero spacing; retained readable headings, wrapping descriptions, all existing shortcuts and 44px primary action targets. Hero stats sit three-across on standard mobiles; below 360px they use two columns with the final item spanning both. Content remains scrollable and browser zoom is not disabled; the layout does not attempt to shrink every tool onto one screen.
- Preserves private tools, balances, package/withdrawal placement, ADMIN-only review and Send Money permissions. Free-publication changes from Phase 41 remain in this same unmerged branch.
- Validation: TypeScript passed, targeted Dashboard tests 3/3 passed, full security/regression suite 599/599 passed. Real mobile/browser visual confirmation is still outstanding. Production build not rerun for this CSS/class-only follow-up. Not deployed.

### Phase 43 — Search Console sitemap canonical domain
- Live inspection before this change found `https://proshnobook.com/sitemap.xml` listing the historical Vercel origin, and robots.txt advertising that origin's sitemap.
- Added `PUBLIC_SITE_ORIGIN` derived from the established `BRAND.domain`. Sitemap URLs, robots Sitemap declaration, root metadata base/structured website data and RSS now consistently use `https://proshnobook.com`, regardless of missing/stale SITE_URL. Kept the old operational-origin helper unchanged; no OAuth callbacks, AUTH_URL, cookies, payment configuration or deployment environment variables changed.
- Regression tests cover static/dynamic sitemap URLs, published-post filtering, non-public route exclusions, stale/preview/http SITE_URL values, database-unavailable fallback, robots/RSS and metadata consistency.
- Validation: TypeScript passed; 601/601 security tests passed; production Next build exited 0. Actual production database/content completeness remains unverified in this sandbox. Changes are not yet deployed; only submit `sitemap.xml` in the verified proshnobook.com Search Console property after merge/deploy and a fresh live check confirms the canonical URLs. Sitemap submission does not guarantee indexing.
- Build emitted the sandbox's missing native Prisma query-engine warning during page-data collection; successful build is not a live database validation. Generated tracked `.next` artifacts restored after verification.

### Phase 44 — Search/AI discovery foundations (no ranking guarantee)
- User requested broad top/position-zero and AI recommendation visibility. These are third-party decisions: neither rankings for every query, featured snippets nor AI mentions can be guaranteed. No fake reviews, keyword stuffing, fabricated credentials or paid-link schemes added.
- Added canonical Bengali title/description and Open Graph/Twitter metadata for homepage, question builder, Ready PDF library and marketplace. Filtered landing-page variants consolidate to their base public URL; no global canonical is inherited across unrelated pages.
- Added `/question-paper-guide` with visible practical answers about creation, free versus paid collection, PDF limits, printing and teacher publication review. Linked from homepage and to relevant tools, terms and contact pages; added guide/core public landing/about/contact routes to sitemap.
- Enriched existing WebSite JSON-LD with stable identity/language/publisher information and added guide BreadcrumbList matching visible navigation. Central JSON-LD serializer escapes script-breaking HTML and Unicode separators. No unsupported rich-result/AI recommendation promises.
- Account/private Dashboard, Wallet, profile and login/registration areas now inherit explicit noindex/nofollow layouts. Authentication/authorization is unchanged; robots metadata is not access control. Existing public teacher-profile noindex policy is preserved.
- Validation: TypeScript and all 605 security/regression tests passed, including metadata/serialization/guide/privacy regressions. Live rendering, Search Console URL inspection and third-party rich-result validation remain outstanding after deployment. No production records, Search Console settings or external AI services modified.
- Follow-up after deploy: submit canonical sitemap, inspect key public URLs in Search Console, review coverage/canonical reports, and measure query/click impressions over time. Publish original subject-specific teaching resources with real authorship/review and maintained internal links; improve real-user performance from measured data. AI mentions/indexing are neither immediate nor guaranteed.
- Production Next build exited 0, with the sandbox's missing native Prisma query-engine warning during page-data collection; this does not validate live database-backed routes. Tracked generated `.next` outputs restored. Not deployed or merged.

### Phase 45 — Essential-only pass: public builder landing and private-route regression checks
- User requested completing only indispensable tasks in stages. First confirmed blocker: Google inspection of `/question-builder` followed the authenticated parent redirect to a noindex Login page.
- Made only the builder landing public, with server-rendered factual introduction, workflow/price caveats, guide/PDF/catalog links and login CTA. Anonymous landing requests do not query question inventory. Authenticated users retain existing QbStart selection and approved-only category/subject counts.
- Moved equivalent server authentication to all five private subtrees (`build`, `create`, `prepare`, `saved`, `english` including nested editors/saved pages); added private-subtree noindex/nofollow. Missing/empty session IDs are rejected. Login remains noindex. No financial/pricing/publication/OAuth changes.
- Validation: TypeScript passed; 608/608 security/regression tests passed; Next production build exited 0. Local production HTTP smoke check with an ephemeral sandbox-only AUTH secret: anonymous landing returned 200, correct canonical, visible login CTA and no noindex; seven private builder URLs redirected 307 to login with noindex/nofollow. Anonymous Dashboard and Wallet also redirected to login. Public guide/robots/sitemap returned 200; sitemap parsed as XML with canonical production URLs; unavailable legacy `/questions` and `/sitemap-0.xml` returned 404 (no blanket redirect).
- Environment limitation: local build/server emitted missing-native-Prisma-query-engine errors (including speculative private child rendering); no production database, real account, OAuth, upload, payment, mobile visual or Search Console access was validated. The HTTP result validates anonymous routing/static output only, not live data completeness. Temporary server stopped and generated tracked `.next` restored.

#### Essential-only remaining gates (not claimed complete)
1. Merge/deploy this fix, then rerun Google Live Test on `/question-builder`; request indexing only after it returns the public landing without noindex.
2. In a configured authorized environment, verify a teacher and ADMIN login, own profile/photo/cover editing, free/paid collection and repeat-charge protection, Setup/Preview/Print, and moderation. Automated regression coverage passed; real-account checks remain unverified. Do not perform unsolicited real-money test transactions.
3. Verify mobile usability on an actual phone: readable two-column Dashboard, profile/cover overlap, preview controls and bottom-nav clearance. No browser automation/mobile device available here.
4. Owner to review Search Console ownership methods/users, Security issues and Manual actions; this agent cannot inspect that private Google property. Keep only genuine equivalent legacy redirects; unrelated dead URLs can remain 404.
- Deferred as nonessential now: social database migration, new payment integrations (ZiniPay remains paused), additional feature/content expansion and speculative ranking work. Do not change production credentials or promise ranking/AI recommendations.

### Phase 46 — Clarify current service identity after historical-domain confusion
- User reports Google/AI descriptions still reference an earlier Q&A service on the domain. Updated only verifiable current-service information: no claim about a former owner's identity, ownership continuity, establishment date, ratings or third-party endorsements.
- Shared brand description now explicitly describes the current exam-paper creation/publication/free-or-paid collection platform for grades 6–12. Homepage adds a visible identity section linked to About; About explicitly distinguishes current services from a general Q&A discussion forum and explains that old third-party/search descriptions may not reflect current features.
- Replaced stale About claims (assembled-PDF selling not supported, institution-only edits and limited samples) with current supported workflows and honest raster/editing, rights and review limits. Public profile link uses `/my-profile` rather than calling the private Dashboard a public profile.
- About and Contact now have canonical/share metadata, aligned current-purpose introductions and useful internal links. Published contact values and validation remain unchanged; no invented contact addresses.
- Extracted shared current WebSite/Organization identity with stable IDs, current description, language, logo and disambiguation. AboutPage schema references those same IDs and matches visible content/metadata. Removed inherited generic SearchAction instead of implying that a general legacy Q&A search describes this service.
- Validation: TypeScript and all 610 security/regression tests passed, including current identity/schema consistency, visible About content, factual-field safeguards, existing contact validation and homepage regression coverage. No Google/Search Console/AI service configuration was changed and no production content/database writes performed.
- After merge/deploy: inspect homepage, `/about-us` and `/contact-us` live; request recrawl of homepage/About in Search Console if desired. Updating the website cannot directly replace Google snippets or AI Overviews, delete third-party articles, or guarantee reindexing timelines/rankings. Owner can submit factual feedback to the AI result/article publisher separately without claiming ownership of their content.
- Production Next build exited 0. Local production HTTP checks returned 200 for homepage/About/Contact, with parseable JSON-LD, consistent current-service description/publisher IDs and About/Contact canonicals. Sandbox build/server emitted missing native Prisma engine errors, so these checks validate rendered fallback/static identity, not live database completeness. Ephemeral test server stopped; tracked `.next` outputs restored. Not yet merged/deployed.

## Phase 47 — staged production-readiness baseline (one review PR)

- Added shared PostgreSQL Credentials/registration attempt reservations, input limits, safe error UI, uncached public liveness, baseline response headers and production build CI gate.
- Added disposable PostgreSQL concurrency CI test, focused regression tests and evidence/restore/monitoring/incident/rollback checklist at `docs/operations/PRODUCTION-READINESS.md`.
- Targeted Next/Auth/Sharp security updates; remaining PDF browser readers disable eval. Dependency audit still has unresolved findings requiring compatibility-reviewed migrations; this is **not** an enterprise-complete/security-clear claim.
- Local verification: **617/617** tests; TypeScript and production build passed. Local HTTP health/homepage 200, protected Dashboard redirects anonymous users. Sandbox Prisma engine overrides mean this does not validate production database/provider flows. Real PostgreSQL concurrency check is wired to isolated GitHub CI; it cannot run locally without a disposable database.
- Owner gates remain: dependency remediation, real teacher/ADMIN/provider/financial pilot with permission, mobile/Print smoke tests, external alert delivery, database/vault restore rehearsal, live SEO check. No production writes, credential changes or automatic merge.

## Phase 48 — staged dependency remediation: storage transport and PostCSS

- Owner authorized staged work, assistant-created PR and merge after checks. Scope remains no production data/money/credential changes or large database migrations.
- Pinned Blob 2.4.0 with patched Undici 6.29.1; removed old busboy path. Evaluated latest Blob 2.9.0 but it adds unnecessary OIDC/CLI-config audit findings, so selected the compatible token-based 2.x release. No storage secrets/provider policy changes.
- Overrode Next's PostCSS to patched 8.5.33 within PostCSS 8; verified fresh npm ci and dependency-tree resolution, not just root package version.
- Added actual SDK offline transport/response compatibility tests, PDF upload-token constraint tests and callback signature rejection/authenticity tests. Live provider upload remains an operator smoke gate; no actual upload/delete requests were made by tests.
- Clean dependency audit: **14 → 9 findings**, now 1 critical / 7 high / 0 moderate / 1 low. Remaining PDF/native-tooling, Zod, Prisma config and KaTeX risks are documented in `docs/operations/PRODUCTION-READINESS.md`; not a security-clear/enterprise-complete claim.
- Local TypeScript and **620/620** regression tests passed. Production build and remote CI/deployment checks recorded in the PR. Sandbox native Prisma restrictions still prevent claiming database-backed production readiness from local checks.
- Next stage: isolated PDF.js/worker migration with Bengali extraction/Preview/Print fixtures, then Zod/tooling compatibility work. Real account/provider/financial smoke tests, restored-backup proof and delivered external alerts remain unverified and must use authorized staging/owner access.

## Phase 49 — patched PDF engine/worker and bounded authenticated extraction

- Owner authorized the remaining staged work and necessary permissions, including assistant-created PR/merge after checks. No production credentials, balances, keys, backup destinations or paid-service settings were changed.
- Migrated browser readers from PDF.js 3 script globals/CDNs to a shared versioned same-origin PDF.js 4.10.38 ESM engine/worker, with local CMaps and retry after loader failure. Removed obsolete vendor JS; byte-parity tests prevent mismatched worker/CMap deployment.
- Migrated server helper to the real native ESM library and removed pdf-parse's bundled legacy parser. The PDF API now authenticates before reading the body, validates PDF signature/10 MB input, bounds extracted pages/text and hides raw exception messages. Pasted-text question parsing remains free/local and uses the existing parser.
- Real two-page embedded Bengali/English PDF fixtures cover page count/A4 dimensions/text positions; tests cover route auth, oversized/invalid inputs and safe errors. Browser and server text extraction release PDF documents. Existing rights, payment/OAuth, publication, watermark and clean-copy policies unchanged.
- Added isolated Chromium ESM-worker/render/Print smoke check for 390px and 1280px and wired it into required CI. Local Chromium could not start due to missing libnspr4.so; do not claim local browser verification. Isolated fixtures do not certify the full logged-in UI or every Bengali conjunct/legacy font.
- TypeScript and **623/623** tests passed locally. Production build/remote checks are recorded in the PR. Native Prisma engine is unavailable locally, so local build/HTTP cannot certify production DB/provider flows.
- Audit: **9 → 5 findings**, now **0 critical / 4 high / 0 moderate / 1 low**; remaining Zod/Prisma config/deepmerge-ts/KaTeX need their own compatibility work. No enterprise-complete claim. Next gates remain validation/math updates, real authorized provider/mobile/financial smoke tests, restored-backup proof, external alerts, WAF/capacity and access review.

## Phase 50 — complete current dependency advisory remediation (same PR)

- Continued on the same active branch/PR before merge: Zod 4.6.7, KaTeX 0.19.1 and a scoped Prisma-config deepmerge-ts 8.0.0 override. No Prisma major/database migration. Explicit string-key record schemas and prefault object defaults preserve stored editor/header/English layout behavior under Zod 4; sanitized issue paths account for symbol inputs safely.
- Fresh install, Prisma generation, TypeScript and **627/627** tests passed. New regressions cover bounded-collection early rejection, defaults/records, math rendering/untrusted links and merge prototype isolation. Local production build passed; final remote checks are the merge gate.
- Current `npm audit --omit=dev`: **0 findings**, versus 9 at the start of this branch. Added a CI high/critical production advisory gate. This is a registry snapshot, not a vulnerability-free or enterprise-certified claim.
- Vercel read-only inspection: expected project; production domain configuration has no reported conflict/misconfiguration; previous production release READY. Metadata shows shared production/preview DATABASE_URL and Blob credential target definitions. Values were not decrypted; preview must be treated as potentially production-connected and is not safe for mutating payment/restore/load rehearsals until isolation is established. No live writes/settings/secrets changed.
- Remaining operational work is not blocked on repeated owner permission, but on verified isolated resources, account/provider test access and tool capabilities: real Teacher/ADMIN/OAuth/payment smoke, full mobile UI, DB/vault restore, alert destination/delivery, WAF/capacity/access review and live Search Console. See readiness document. Do not replace those requirements with claims based only on tests/build.

## Phase 51 — production liveness monitoring and anonymous release verification

- Added fixed-origin, GET-only probes without application credentials or mutations. Liveness has timeout, bounded response, no redirect, schema/cache/security-header verification, one retry, and safe reason-only logs.
- Scheduled GitHub workflow every 15 minutes after merge; failed runs create a deduplicated bot-owned incident; recovery comments/closes only that marked bot issue. Issue notifications depend on owner preferences/delivery, not claimed verified by a healthy run. PR jobs have read-only permissions and never create incidents.
- Added anonymous public homepage/About/Contact canonical/JSON-LD/header checks, robots/sitemap origin checks and protected Dashboard login redirect smoke in GitHub runners (manual/relevant PR runs). Not a Google indexing/ranking guarantee or authenticated/provider-readiness check.
- Five regressions cover request restrictions, response validation/stream cancellation, error redaction, retries and anonymous release contracts. See `docs/operations/PUBLIC-MONITORING.md` for operations, limitations and remaining resource/access blockers.
- Read-only Vercel inspection confirmed PR154 production merge commit ad75034 deployment READY/PROMOTED. No settings, secrets, data or money changed. Preview remains unsafe for mutating tests until resource isolation is verified.
- Whole-DB/vault restore, true account/OAuth/provider/financial smoke, full mobile UI and recipient-confirmed alert delivery are not completed by this phase. Owner permission is already granted; isolated resources, signed-in sessions and provider/tool access are still needed. Remote live smoke evidence is recorded in this phase's PR/Actions checks.

## Phase 52 — staging metadata preflight and actual disposable restore rehearsal

- Rechecked Vercel metadata without decryption: database/Blob credential definitions still target production+preview; no default preview AUTH_SECRET definition was returned. No bindings, live credentials or resources were changed. Staging cannot be certified from variable names alone.
- Added metadata-only checker for shared/missing preview bindings, branch-target handling, redacted output and explicit `isolated:false` even when definition checks pass. This does not pretend to provision a DB/store or verify resource ACLs.
- Added isolated CI full-current-schema PostgreSQL 16 pg_dump/pg_restore rehearsal: two random test-owned DBs, synthetic rows, full row/hash/index/constraint comparison, wallet source validation and encrypted PDF recovery using a restored synthetic key backup. Strict localhost5439/user/db/container/image checks; never uses DATABASE_URL as its target; no production/Blob/provider requests. Synthetic timing report explicitly sets productionRestoreVerified:false.
- Added safety regression tests for target rejection/redaction, full snapshot contract, metadata/branch isolation findings and no false certification. TypeScript and 636/636 tests passed locally; real PostgreSQL restore runs in required remote CI because local Docker/engine unavailable.
- Instructions and concrete remaining resource/owner evidence gates: `docs/operations/STAGING-AND-RESTORE.md`. Permission already granted, but isolated DB/storage/provider resources and signed-in account access are not supplied by the current connector. Production restore, real login/payment/mobile end-to-end and recipient-confirmed alert delivery remain incomplete.

## Phase 53 — portable real-PostgreSQL financial concurrency verification

- Replaced legacy external Prisma-adapter/client paths and existing-table TRUNCATE setup in wallet integration scripts with a shared fresh-database harness, full current Prisma schema and installed native client. Only an explicit disposable localhost5439/auth_rate_test control URL is accepted; each script drops only its own successfully created random DB.
- Added both scripts as required CI checks: bonus/checkout/recharge concurrency, transfer idempotence/atomic rollback, withdrawals/claims/limits, marketplace split/refund rollback and repeatable-read financial report reconciliation. Real app transactions run against real isolated PostgreSQL; auth/cache are test doubles, not verified OAuth/provider sessions.
- Safety tests cover invalid targets, no production DATABASE_URL fallback, redacted errors and protection against legacy setup paths/destructive existing-table setup. Local TypeScript and **639/639** tests passed. The remote required PostgreSQL step results—not unit tests—are the evidence for concurrency execution.
- Re-dispatched read-only production liveness/release checks; no login/payment/upload/production mutations. See Actions for live result. Docs: `docs/operations/WALLET-INTEGRATION-CHECKS.md`.
- Still not certified: signed-in Teacher/ADMIN/Google browser flows, external provider statement/settlement and real refunds, full mobile workflows, isolated staging resource provisioning, production backup restore or recipient-confirmed failure-alert delivery. No additional generic permission is required; actual sessions/resources/tool access remain necessary.

## Phase 54 — full built-app signed-in role and mobile regression

- Added required post-build Playwright regression using isolated full-schema PostgreSQL, random synthetic bcrypt users and a real Next/NextAuth Credentials flow. No forged session tokens, mocked app APIs, production credentials or live mutations.
- Checks anonymous/wrong-password rejection, actual Teacher/ADMIN/Student session identity, private Dashboard/wallet/library at 390/1280px, noindex/overflow, ADMIN-only financial page boundary and one-time non-ADMIN bonus after repeated visits. Browser/server resources close before the owned DB is removed.
- Test server environment is whitelisted and uses a fresh AUTH_SECRET; external browser requests are aborted and logs show only safe phase identifiers. Existing actual wallet concurrency, database/vault restore, PDF Print and public live smoke checks remain in place.
- Local TypeScript and **641/641** regression tests passed. Actual native DB/full-app browser execution is the required remote CI gate, not assumed from local guard tests. Scope and remaining gates are in `docs/operations/AUTHENTICATED-BROWSER-CHECKS.md`.
- Owner authorization continues for stages 1–9, PR and merge after checks. Google OAuth/provider settlement, physical mobile/full-editor walkthrough, cloud resource isolation, true production restore/PITR, WAF/capacity/access review, recipient-confirmed alert delivery and private Search Console cannot be certified by synthetic sign-in checks.

## Phase 55 — owner-supplied P brand logo

- Replaced the site's old default brand mark with the supplied pink P artwork, retaining its original gradient/shape rather than generating a new logo. Original source is retained under public/brand; the Sharp preparation script reproducibly derives browser/app assets.
- Updated header, shared Logo, homepage intro, install prompt, official profile fallback, SEO/Organization logo, blog/news fallback, PWA any/maskable icons and explicit browser/Apple icons. New URLs avoid relying on stale cached legacy images; legacy logo/icon PNG/SVG URLs also serve the new mark.
- Dedicated maskable safe-area padding and icon dimensions tested. Teacher custom avatars, institution/question-paper logos, account data, OAuth, payment and stored keys are unchanged. Original JPG resolution limits remain; generated larger PNGs are resized derivatives, not a claim of vector artwork.
