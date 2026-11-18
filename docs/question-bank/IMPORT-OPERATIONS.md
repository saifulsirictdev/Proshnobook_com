# Class 6 MCQ ingestion

## Access and deployment

`/admin/questions/import` uses the deployed site's existing Prisma connection. No database password export, environment-variable replacement, new production database, admin-session impersonation or public import API is needed. Every action and the page require ADMIN; Teacher/Contributor and Student cannot import. Next server-action origin protections remain enabled.

The current workspace has no direct DB binding. Vercel project metadata confirmed a sensitive production DATABASE_URL exists, not that a direct database query succeeded. This feature's initial data checks occur after deployment under the owner's real Admin session. Never claim the live bank has been counted or populated until that occurs.

## Owner workflow

1. Open Admin → question bank → Class 6 batch import. Review current selector counts. The selector inventory is not an official-verified contents list. Match the 2026 textbook edition before writing batches; some existing entries are writing tasks or model tests.
2. Supply source-grounded original questions as the strict JSON format shown on the page. Use exact subject/topic keys, book, edition, HTTPS source URL, page per item, explanation, four distinct A–D options, correct key, language, difficulty. Limit 100 items/750 KB per batch. A one-question pilot is allowed; 50/100 are chapter goals, not a reason to pad a batch.
3. Preview all options, answer and explanation. Automated structure checks do not certify truth, curriculum alignment, source ownership or absence of semantic duplicates. Match each answer to the cited page; independently solve arithmetic. HTTPS source is stored as text, never fetched server-side.
4. Confirm review and save. ALL new questions are Pending, regardless of payload. No auto-publication. Existing approved data is untouched.
5. Inspect Pending questions in existing question management, perform subject-matter review, and individually approve validated items. Avoid blanket approval of unreviewed rows. Verify actual creator/practice visibility using the correct role. Source drafts must never be described as official NCTB questions solely because they cite a textbook.

## Safety and provenance

- Deterministic normalized-stem IDs within chapter + serializable transaction/retry prevent this importer's concurrent duplicates. Existing questions in the same exact category/subject/topic are compared by normalized stem. Semantic, cross-chapter, legacy category aliases and reordered wording are NOT automatically deduplicated.
- Hash-based batch receipt makes resubmission idempotent. One transaction writes all draft questions and the receipt; failed transactions roll back. No content uniqueness/schema migration needed. Do not use `skipDuplicates` as an accuracy/dedup guarantee.
- `mcqimport:v1:<digest>` Setting retains actor/time/book/edition/source, inserted IDs, page references and skipped count. Question source points to that digest. Admin page shows at most 50 receipts (bounded key-order selection, internally date sorted), not complete chronological history.
- No destructive rollback button. To undo a batch, inspect receipt IDs and current approval/use first; use a separately reviewed batch-specific operation rather than broad deletion. Existing financial/user/rights records must remain untouched.
- Chapter counts are records with nonempty correct key, separated Approved/Pending; not a substantive correctness/completeness certification. Remaining goal uses approved count only.

## Validation / launch status

Unit tests: strict input, invalid scope/key/options, absent source fields, size cap, duplicate stems, unauthorized roles, read-only preview, pending-only insert, repeat receipt, legacy normalized duplicate and serializable retry. Required isolated built-app browser CI exercises real Admin preview/save/repeat against disposable PostgreSQL and checks saved drafts/audit. No production data is used by these tests.

Book PDFs are still needed. No real textbook questions have been generated/imported by this work; it delivers ingestion infrastructure, not the requested 50–100 validated questions per chapter. Source: owner supplied https://nctb.gov.bd/pages/static-pages/695b987ac4774958d7b7040b (indexed as 2026 Class 6; full PDF not yet retrieved).

## Prepared chapter 1 batch

The Admin import page now offers “প্রস্তুত ১০০টি প্রশ্ন লোড করুন”. Loading only fills the editable JSON, does not query/write questions and does not mark textbook review complete. A replacement confirmation protects pasted edits. Preview invalidates whenever content changes. The existing explicit preview → confirmation → Pending-save path is still mandatory, and final publication remains separate.

The pending-save checkbox acknowledges source metadata and outstanding review rather than falsely certifying that unavailable textbook pages have already been checked. Full official chapter alignment/subject review is still required before publishing. Isolated browser CI loads the real prepared 100-item batch, checks read-only loading/preview, saves all 100 as Pending and confirms none are approved. This is not a production import.

## Prepared written-question import

ADMIN can preview the prepared 30-CQ/30-SQ batch on `/admin/questions/import`, then explicitly acknowledge limitations and save Pending. This is separate from MCQ JSON upload. CQ uses three parts only (2/4/4), `options.stimulus` and `options.subQuestions.k/kh/g`; SQ uses empty options; both have empty correct keys and solutions in explanation. Audit receipts use `writtenimport:v1:<digest>` and retain the original draft provenance plus the later chapter alignment report. No automatic publication.

The entire printed chapter 1–37 has now been visually reviewed for concept alignment; original draft metadata remains historical. See `deliverables/class6-math-ch1/CHAPTER-REVIEW.md`. Coverage completeness and independent teacher approval are not claimed.

## Chapter-wise prepared library (all existing classes)

At `/admin/questions/import`, select class → subject → chapter from the existing NCTB selector catalog. A ready chapter lists versioned MCQ/CQ/SQ batches and their limitations; an unprepared chapter explicitly has no batch. No category is invented. The server-side `lib/prepared-question-batches.ts` registry is the extension point for each subsequently authored chapter: add its validated adapter, provenance, language and records. Current availability is only Class 6 mathematics chapter 1 (100 MCQ + 30 CQ + 30 SQ); this feature does not generate questions in the background.

Preview fetches answers only after ADMIN authorization. A batch card is remounted when selection changes, clearing previous acknowledgement/preview. Save resolves the immutable server batch id, checks its digest and consent, and always writes approved=false. Receipts use `preparedimport:v1:<digest>` and retain category, subject, topic, source/review limitations, actor and saved ids. Existing questions from legacy importers are skipped by normalized stem. Receipt status means this exact batch version has an import receipt, not that every question was independently approved. Older import forms remain under a collapsed compatibility panel.

Verification: 15 targeted content/import tests passed; TypeScript typecheck passed with dummy local Prisma engine paths, not production DB access. New library transaction tests use mocks; authenticated browser CI retains the legacy real-DB path. No production import/publication performed.

## Select chapter and upload a JSON file

The first section of `/admin/questions/import` accepts a local `.json` file after class → subject → subgroup (where applicable) → chapter selection. Selectors use the same `NCTB_CLASSES` data as the question catalog. A selection-specific downloadable template is provided (format example only, not authored subject content).

File contract: maximum 750,000 UTF-8 bytes, 1–200 items. Required batch fields: `category`, `subject`, `topic` (exact selector strings), `book`, `edition`, HTTPS `sourceUrl`, `lang` (Bangla/English), `items`. Each item requires `type` (MCQ/SQ/CQ), `text`, `explanation`, `page`, `difficulty` (EASY/MEDIUM/HARD). MCQ also has strict A/B/C/D `options` and `correct`; SQ has neither. CQ uses text as stimulus and `parts` with `label`, `question`, `solution`, `marks`: mathematics ক/খ/গ = 2/4/4; other supported CQ ক/খ/গ/ঘ = 1/2/3/4. Unknown fields (including approved) are rejected. Earlier custom draft formats must be converted to this schema or saved via their prepared-batch card.

JSON scope must match the selected chapter; the server independently validates the entire catalog path, including subgroup. File/selection changes clear preview and consent. Reading a file and preview are read-only; explicit consent plus unchanged content/selection digest is required to save. Only ADMIN may preview/save, every insert has approved=false, duplicates are normalized by stem, and Serializable conflicts retry. Audit: `jsonupload:v1:<digest>` with actor, scope, source, page references and inserted ids. No publication action is added.

Verification: 13 targeted import tests and typecheck passed; transaction tests use mocks. No production writes.

## Class 6 math chapter 2 available

`content/question-bank/class-6/chapter-2/questions.json` is directly compatible with the local JSON uploader: Class 6 / গণিত / ২. অনুপাত ও শতকরা (no subgroup). A mixed prepared card also contains the same 100 MCQ + 30 CQ + 30 SQ. Source review and variant limitations are retained with the batch; approval remains separate. See the chapter README and review.md. No database import was performed by authoring this batch.

## Class 6 mathematics chapters 3–8 Draft batches

Each chapter now has `content/question-bank/class-6/chapter-N/questions.json`, `review.md` and `validation.json`. The prepared library adds six mixed cards, and each JSON also works with class/subject/chapter file upload. Select the exact existing chapter; no new category or subject was introduced. Review the limitations before saving Pending; preparation did not import or publish anything.

Bundle: `deliverables/class6-math-ch3-8/class6-math-chapters-3-8-drafts.zip`. Unzip first and upload one chapter's questions.json at a time. Do not upload ZIP or validation.json. These are numeric-family drafts, not independent teacher-approved complete coverage; geometry/chart solutions still need figure review.

## Class 6 science incomplete starters (not final delivery)

`deliverables/class6-science-starters/README.md` describes the 14 chapter packages. Actual total is 140 MCQ / 20 CQ / 42 SQ; requested full-book counts are NOT met. Full reading and teacher review are outstanding. Each CQ uses ক/খ/গ/ঘ = 1/2/3/4. Choose Class 6 → বিজ্ঞান → the exact chapter and upload its questions.json, never the entire ZIP. Prepared cards explicitly say অসম্পূর্ণ Draft. No production import/publication has been performed; keep any later import Pending until review.

### Science chapter 1 expansion
Chapter 1 now has 100 MCQ / 30 CQ / 30 SQ. Its count-target flag is not subject-expert approval; teacherApproved and fullChapterRead remain false. Overall science totals are 230/47/69; remaining minimum is 1170/373/351. Other 13 chapters remain incomplete. Updated ZIP replaces the earlier starter ZIP at the same workspace path. Import remains an explicit Admin-only Pending operation; no production changes made here.

### Selecting science for Pending approval
Admin → questions → prepared batch import → Class 6 → বিজ্ঞান. All 14 currently available chapter cards now appear without first choosing a chapter. Optionally narrow to one chapter; preview its questions/answers, acknowledge the limitations, and choose “Pending হিসেবে সেভ করুন”. Use the subject-scoped Pending link to review saved records and make a separate approval decision. Selection alone performs no write. Counts remain 230 MCQ / 47 CQ / 69 SQ, not the complete-book target.

### Current science working draft after জীবজগৎ expansion
Chapter 2 now also meets counts (100/30/30), with printed 11–20 visually read and source ambiguities documented in `chapter-2/source-review.md`. Overall totals are 320 MCQ / 74 CQ / 96 SQ; remaining minimum is 1080/346/324. Chapters 3–14 are still incomplete. This branch has not been deployed or imported; teacher approval remains false throughout. Changes are retained locally while the whole-subject request remains open.

### Science chapter 3 working expansion
Chapter 3 now also has 100/30/30; printed 21–27 were visually read. Overall science drafts are 410 MCQ / 101 CQ / 123 SQ (634), with 990/319/297 still missing from the minimum full-book target. Source caveats are in `chapter-3/source-review.md`. Chapters 4–14 are incomplete. This working branch is not deployed/imported; all records remain teacher-review pending. Do not treat count completion as content approval.

## Science chapters 4–14 supplemental round
Added 110 MCQ, 33 complete CQ and 33 SQ; science total 810 (520/134/156). Chapters 4–14 now each 20/4/6, still below requested quotas. Remaining minimum 880/286/264. Chapter 4 printed 28–37 fully read; 5–14 remain sample-read. All Draft, no import/publication/deployment. 23 targeted tests passed; full regression not rerun this round.

## Owner workflow clarification and Drive backup
Work on one subject at a time, finishing one chapter Draft before expanding the next. After all chapters are ready, the owner reviews the whole subject and decides Pending/approval; no automatic import, approval or publication. Current focus remains Class 6 Science, chapter 4 next.

Uploaded all 14 current chapter JSON snapshots under QuestionBank Backup → Class 6 → বিজ্ঞান (folder 1oehRuYhLuP40a0dxJIOp2AwSkRj715xh). Chapter-number filenames explicitly identify Draft/incomplete status. These are backup snapshots, not a completed subject. File IDs and local SHA256/byte sizes: deliverables/class6-science-starters/drive-backup.json. Future uploads must check existing files and retain clear revision history.

### Current local content versus Drive snapshot
Local science now 886 questions (560 MCQ / 146 CQ / 180 SQ); chapter 4 60/16/30, incomplete. Drive backup manifest still references earlier 810-question snapshot and must not be described as current. Refresh with versioned files after chapter completion. No import/publication performed.

## Chapter 4 count-complete Draft and backup
Chapter 4 now 100 MCQ / 30 complete CQ / 30 SQ. Chapters 1–4 meet minimum counts, not content approval. Whole science 940=600/160/180, remaining 800/260/240 across chapters 5–14. Chapter 4 source-review includes coverage map, provenance limits and outstanding teacher checks. Drive v002 questions (1bbg4u0cDFP5MFaxZ98M2RfIET-NGwGY0), validation (15Glsisouu02OkRfiZEGkKg8FA4gm7R9l), review (1q9FCbtLsO3Pn3UvrrMzuSKYMC8K-geJX) uploaded; old files retained, backup manifest updated locally. 24 targeted tests + typecheck + 711 full tests pass after generating missing Prisma client using dummy engine paths (not DB operations). No import/approval/deployment. Next: chapter 5 full-source reading; original PDF cache currently absent, restore before source-aligned expansion.

## Chapter 5: full-source drafting and versioned Drive backup
Restored owner science PDF through Drive connector; SHA256 matches original. Visually read all printed 38–41. Authored 80 MCQ + 26 full CQ + 24 SQ; chapter now 100/30/30. Science total 1070=680/186/204; deficits 720/234/216. Chapters 1–5 count-complete only, all teacherApproved=false. Prepared registry 2350. Cross-chapter exact duplicate caught by Pending-save test and replaced with a distinct safety question. 25 targeted tests, typecheck and 712 full tests pass. Source-review records coverage and science/safety limits. Drive chapter folder 1eYI4c9AwLmqsBadKLQtAl6GMOFvT21Le; questions 1qXbDybT6nCtitHPu52tHKawD304mOH_J, validation 1UBA0DsJr0sXazcEZVOvhSLjHCFK6jY2n, review 1w2UamLli1m3xFIEq3OM5Zctz3U_ORmAA. Old backups retained. No DB import, Pending submission, publication or deployment. Next chapter 6 printed 42–49 must be read fully before expansion.

## Chapter 6: full-source Draft and backup
Visually read printed 42–49 (PDF 47–54) in full. Authored 80 MCQ + 26 complete CQ + 24 SQ; chapter now 100/30/30. Science total 1200=760/212/228, remaining minimum 640/208/192 across chapters 7–14. Chapters 1–6 meet count minimum only, all teacherApproved=false. Prepared registry 2480. 26 targeted tests, typecheck and full 713 regression tests pass. Chapter-6 source-review records tongue-map correction, vision/ear structures, health-claim boundaries and safe observation. Drive folder 1RayWm1zPazj4q35GzJa-FnlXxIyoNmLi; questions 1SDe3gUON9ike3lN84RTQp6SMxaglVfio, validation 1UJ3efIZLNV-0I6uf2dlab4m0pxws-dzU, review 1gO85e1Ei4FNK4hPRpMZFcn-zlNqdbVya; uploaded sizes match local. Old backups retained. No DB import, Pending submission, approval, publication or deployment. Next chapter 7 printed 50–59: full reading required before expansion.

## Chapter 7: full-source count-complete Draft
Printed 50–59 (PDF 55–64) visually read in full; +80 MCQ/+26 complete CQ/+24 SQ yields chapter 100/30/30. Science 1330=840/238/252; chapters 1–7 count-complete, 8–14 still 20/4/6; remaining minimum 560/182/168=910. Registry 2610=1280 math+1330 science. All Draft/teacherApproved=false. Material exceptions, wax melting range, pressure/purity and safe experiment caveats are in chapter-7/source-review.md. 27 targeted tests, typecheck and full 714 tests pass. Drive folder 1-Vvus54nrjN7LULod5p94b2dztm_zT0B; questions 1-Dl2IAobdkBhOo4u_HnAj5cNDSbfXarJ; validation 1AdzLoaUw8PL0n_SAu0C-iL6jYYgCYC6X; review 11Od8IShF6HC2DfsvmXd0FWRw4rzxsJ7H. Returned sizes and MD5 checksums match local files; history retained. No database import/Pending submission/approval/publication/deployment. Next chapter 8 printed 60–72 must be fully read before expansion.

## Chapter 8: full-source count-complete Draft
Printed 60–72 (PDF 65–77) visually read in full; +80 MCQ/+26 complete CQ/+24 SQ gives 100/30/30. Science 1460=920/264/276, registry 2740=1280 math+1460 science. Chapters 1–8 count-complete; 9–14 remain 20/4/6, minimum shortfall 480/156/144=780. All Draft/teacherApproved=false. 28 targeted tests, typecheck and full 715 regression tests pass; final aerosol-medium wording correction rechecked by targeted tests. Source-review records solubility bases, rate vs capacity, salt cooling limits, filtration/distillation purity boundaries and suspension as heterogeneous mixture. Drive folder 1hLEFQUwsRBBH9LU9AO_EehR3pryVDv4g; current questions v003 1rcoWBQGs_pNOCIpPOr0T3_Da6J_mhI7v, validation v002 1BsssJ7aMou7ElvbXPPiKSbFm5IrQcnmq, review v002 1FX5jlqBhj0F29RalfnbuwNHgwBp5X8Z8. Current sizes and MD5 match local. Earlier v002 questions 1P6qWASqKbYQXcqTWAOBKPG7PCX2UPU-E superseded due to aerosol medium correction; retained for history, not current import. No import, Pending submission, approval, publication or deployment. Next chapter 9 printed 73–81 requires full reading.

## Chapter 9: full-source count-complete Draft
Printed 73–81 (PDF 78–86) visually read in full; +80 MCQ/+26 complete CQ/+24 SQ yields 100/30/30. Science 1590=1000/290/300; registry 2870=1280 math+1590 science. Chapters 1–9 count-complete; chapters 10–14 still 20/4/6; remaining minimum 400/130/120=650. All Draft/teacherApproved=false. Source-review records source/absorption simplifications, local reflection laws, angle conventions, mirror distances, lateral inversion and safe periscope experiments. 29 targeted tests, typecheck and full 716 regression tests pass. Drive folder 1QrcBNBpaoOCEjGFgwjGD8rmjElzkUR2W; questions 1tY65t9ieXUqtzSIK9-BXBn5fEnsaO8nN, validation 1MpqoFJ-lnRaDQ6g3vnZ0nIvtfLQUxc6W, review 1-NIy3A4x-KXXNAH9UkHasYWjuM4JxnpE; returned sizes and MD5 match local. Earlier backup retained. No database import, Pending submission, approval, publication or deployment. Next chapter 10 printed 82–92 requires full reading before expansion.


## অধ্যায় ১০: গতি — সংখ্যাগত Draft পূর্ণ
মুদ্রিত ৮২–৯২ সব ১১ পৃষ্ঠা সম্পূর্ণ ছবিতে পড়ে ৮০ MCQ + ২৬ পূর্ণ CQ + ২৪ SQ যোগ; বর্তমান ১০০/৩০/৩০। প্রসঙ্গ-কাঠামো, চলন/ঘূর্ণন, পর্যাবৃত্ত/দোলন, দূরত্ব–সরণ, গড় দ্রুতি–বেগ, একক ও ত্বরণ নিয়ে নিজস্ব অনুশীলনী। source-review.md-তে পৃষ্ঠামানচিত্র, বাস্তব বাউন্সের সীমা, গড় বনাম তাৎক্ষণিক, সমান পথের গড়, ঋণাত্মক ত্বরণের চিহ্ন এবং নিরাপদ মাপের সতর্কতা আছে। স্বাধীন শিক্ষক-যাচাই, প্রশ্নভিত্তিক পৃষ্ঠা-মিল ও অর্থগত বৈচিত্র্য পর্যালোচনা বাকি।

৩০ targeted test, Typecheck ও পূর্ণ ৭১৭ automated regression test পাস। Drive: Class 6 → বিজ্ঞান → chapter-10-গতি; questions-DRAFT-v002.json, validation-v002.json, review-v002.md। তিন ফাইলের size ও MD5 স্থানীয় ফাইলের সঙ্গে মিলে গেছে। পুরোনো ব্যাকআপ অক্ষত। বর্তমানে বিজ্ঞানে ১৭২০ প্রশ্ন; বাকি ন্যূনতম ৫২০। কোনো import/Pending/approval/publication/deployment হয়নি।


## অধ্যায় ১১: বল ও সরল যন্ত্র — সংখ্যাগত Draft পূর্ণ
মুদ্রিত ৯৩–১০২ সব ১০ পৃষ্ঠা ছবিতে সম্পূর্ণ পড়ে ৮০ MCQ + ২৬ পূর্ণ CQ + ২৪ SQ যোগ; বর্তমান ১০০/৩০/৩০। বলের প্রভাব, লিভারের শ্রেণি/বাহু/ভারসাম্য, ঢাল, স্ক্রু, কপিকল, চাকা–অক্ষ ও মানবদেহের সীমিত মডেল নিয়ে নিজস্ব প্রশ্ন। source-review.md-তে সব যন্ত্র বল বাড়ায় না, শক্তি সৃষ্টি নয়, লম্ব বাহু ও আদর্শ শর্ত, বল-ভরের একক, কপিকলের দুই সমর্থন-খণ্ডের সম্প্রসারিত ব্যাখ্যা, বয়সোপযোগিতা ও নিরাপত্তার সীমা আছে। স্বাধীন শিক্ষক-যাচাই, অর্থগত বৈচিত্র্য, নম্বরভিত্তিক গভীরতা ও প্রশ্নভিত্তিক পৃষ্ঠা-মিল বাকি।

৩১ targeted test, Typecheck ও পূর্ণ ৭১৮ automated regression test পাস। নতুন পরিবেশে অনুপস্থিত dependencies বসিয়ে Prisma client dummy engine path দিয়ে generate করা হয়েছে; database query নয়। প্রাথমিক targeted run-এ আগের count-complete অধ্যায়ের সংখ্যা ১০ থাকার assertion সংশোধনের পর সব পাস।

Drive: Class 6 → বিজ্ঞান → chapter-11-বল ও সরল যন্ত্র; questions-DRAFT-v002.json, validation-v002.json, review-v002.md আপলোড। তিন ফাইলের size/MD5 স্থানীয় ফাইলের সঙ্গে মিলে গেছে; পুরোনো snapshot অক্ষত। বিজ্ঞান এখন ১৮৫০=১১৬০ MCQ+৩৪২ CQ+৩৪৮ SQ; বাকি ন্যূনতম ৩৯০=২৪০+৭৮+৭২। অধ্যায় ১–১১ সংখ্যা পূর্ণ; ১২–১৪ অসম্পূর্ণ। Prepared registry স্থানীয়ভাবে ৩১৩০; এটি live website/DB count নয়। কোনো import/Pending/approval/publication/deployment/commit/PR হয়নি।


## অধ্যায় ১২: পৃথিবীর উৎপত্তি ও গঠন — সংখ্যাগত Draft পূর্ণ
মুদ্রিত ১০৩–১১২ সব ১০ পৃষ্ঠা ছবিতে সম্পূর্ণ পড়ে ৮০ MCQ + ২৬ পূর্ণ CQ + ২৪ SQ যোগ; বর্তমান ১০০/৩০/৩০। মহাবিশ্বের প্রসারণ ও মডেল, সূর্য–পৃথিবী–চাঁদ, শীতলতা/বায়ুমণ্ডল/জলভাগ, অভ্যন্তর, পাত, মাটি, শিলা/খনিজ ও জীবাশ্ম জ্বালানি নিয়ে নিজস্ব প্রশ্ন। source-review.md-তে উৎসের সরলীকরণ, শিলামণ্ডল/ভূত্বকের পার্থক্য, গুরুমণ্ডলের অবস্থা, আংশিক গলন, উচ্চতায় কম চাপ, মাটির স্তরের বৈচিত্র্য এবং জ্বালানি বনাম খনিজের সীমা নথিবদ্ধ। স্বাধীন শিক্ষক-যাচাই, বয়সোপযোগিতা, অর্থগত বৈচিত্র্য, নম্বরভিত্তিক গভীরতা ও প্রশ্নভিত্তিক পৃষ্ঠা-মিল বাকি।

৩২ targeted test, Typecheck ও পূর্ণ ৭১৯ automated regression test পাস। নতুন পরিবেশে dependencies বসিয়ে Prisma client dummy engine path দিয়ে generate করা হয়েছে; database query নয়। Generator --check, git diff --check ও ZIP integrity পাস। প্রযুক্তিগত পরীক্ষা বিষয়শিক্ষকের অনুমোদন নয়।

Drive: Class 6 → বিজ্ঞান → chapter-12-পৃথিবীর উৎপত্তি ও গঠন; questions-DRAFT-v002.json, validation-v002.json, review-v002.md আপলোড। তিন ফাইলের size/MD5 স্থানীয় ফাইলের সঙ্গে মিলে গেছে; পুরোনো snapshot অক্ষত। বিজ্ঞান এখন ১৯৮০=১২৪০ MCQ+৩৬৮ CQ+৩৭২ SQ; বাকি ন্যূনতম ২৬০=১৬০+৫২+৪৮। অধ্যায় ১–১২ সংখ্যা পূর্ণ; ১৩–১৪ অসম্পূর্ণ। Prepared registry স্থানীয়ভাবে ৩২৬০; এটি live website/DB count নয়। কোনো import/Pending/approval/publication/deployment/commit/PR হয়নি।


## অধ্যায় ১৩–১৪ একসঙ্গে: বিজ্ঞান ন্যূনতম সংখ্যা-পূর্ণ Draft
মুদ্রিত ১১৩–১২৩ ও ১২৪–১৩২ সব ২০ পৃষ্ঠা ছবিতে সম্পূর্ণ পড়ে প্রতিটি অধ্যায়ে ৮০ MCQ+২৬ পূর্ণ CQ+২৪ SQ সংযোজন; উভয় এখন ১০০/৩০/৩০। খাদ্য-পুষ্টির পরীক্ষার সীমা/ক্যালরি/স্বাস্থ্যনিরাপত্তা এবং পরিবেশে শ্বসন/উপাদান–শক্তি/বিলুপ্তির প্রমাণ/নিরাপদ পর্যবেক্ষণ পৃথক source-review.md-তে আছে।

১৪ অধ্যায় সব সংখ্যা-পূর্ণ: ২২৪০=১৪০০ MCQ+৪২০ CQ+৪২০ SQ; ঘাটতি শূন্য। Manifest COUNT_COMPLETE_DRAFT_TEACHER_REVIEW_PENDING, teacherApproved=false; targetMet শুধু সংখ্যার। অধ্যায় ১ এখনো পূর্ণ উৎসপাঠ নয়; অধ্যায় ২–১৪ পূর্ণ ছবিতে পড়া। স্বাধীন শিক্ষক-যাচাই, প্রশ্নভিত্তিক পৃষ্ঠা-মিল, অর্থগত বৈচিত্র্য, নম্বরোপযোগিতা/বয়সোপযোগিতা ও চিত্রভিত্তিক কভারেজ বাকি। SUBJECT-REVIEW.md-তে whole-subject checklist।

৩৫ targeted test, Typecheck, ৭২২ full automated test পাস। Generator --check, diff --check ও ZIP integrity পাস। Prepared registry স্থানীয়ভাবে ৩৫২০=১২৮০ গণিত+২২৪০ বিজ্ঞান; live DB count নয়। Drive chapter13/14-তে ছয়টি v002 ফাইলের size/MD5 মিলেছে, পুরোনো backup অক্ষত। বিষয়টি ব্যবহারকারী একসঙ্গে পর্যালোচনা করবেন এবং Pending/approval সিদ্ধান্ত দেবেন। কোনো DB import/Pending/approval/publication/deployment/commit/PR হয়নি।

## নির্বাচিত পুরো বিষয় একসঙ্গে Preview → Pending (স্থানীয় implementation)
PreparedLibrary-তে শ্রেণি/বিষয় বেছে অধ্যায় “সব প্রস্তুত অধ্যায়” রাখলে নতুন whole-selection panel থেকে সব নির্বাচিত ব্যাচ preview করা যায়। প্রতিটি অধ্যায়ের প্রশ্ন, উত্তর ও সীমাবদ্ধতা আলাদা expandable section-এ। সব preview সফল হলে এবং পৃথক সম্মতি দিলে authenticated savePrepared action অধ্যায় ধরে চলে। প্রতিটি request-এ server-resolved batch/digest ও reviewed=yes লাগে; বিদ্যমান ADMIN auth, Serializable transaction, retry, dedup, audit receipt এবং approved=false অপরিবর্তিত। পুরো বিষয় এক atomic transaction নয়; অধ্যায়ভিত্তিক সফল/ব্যর্থ বা অনিশ্চিত ফল দেখায়। Retry শুধু সফল ফল না পাওয়া ব্যাচে; uncertain response-এ server receipt ডুপ্লিকেট ঠেকায়। নির্বাচন পাল্টালে panel state reset হয়। এক-অধ্যায়ের পুরোনো card-ও আছে।

Typecheck, prepared-library 6 tests এবং full 723 automated tests পাস; নতুন UI contract test source-level, বাস্তব browser interaction/production save পরীক্ষা নয়। এই ধাপে deploy বা production DB write হয়নি। ব্যবহারকারী Pending জমার অনুমতি দিয়েছেন; বিষয়শিক্ষকের final approval নয়।

## HSC ICT external Draft integration
Six chapters are registered under existing `Class 11-12` / তথ্য ও যোগাযোগ প্রযুক্তি topics.
1,110 original items preserved; **1,076 savable Draft items** (595 MCQ, 240 CQ, 241 SQ).
34 quarantined with source index/reason; no invented replacements or relaxed parser.
See `content/question-bank/class-11-12/ict/README.md` for source audit and shortfalls.
All-chapter Preview → Pending uses existing ADMIN consent/digest/audit flow. No live import.

## Class 6 BGS chapter1 Draft
Only chapter1 is prepared (160 questions); full subject remains incomplete. Prepared id
`class6-bgs-ch1-draft-v1` uses existing Class 6 / বাংলাদেশ ও বিশ্বপরিচয় / ১. সমাজ বিবর্তনের ইতিহাস.
Source page map and limitations live in `content/question-bank/class-6/bgs/chapter-1/source-review.md`.
Drive backups verified in `drive-backup.json`; backup does not mean website import.
Regenerate/check with `python3 scripts/question-bank/build-class6-bgs.py [--check]`.
No production writes or approval. Chapters2–8 still NOT_STARTED in subject manifest.


### BGS chapter 2–3 Draft checkpoint
Class 6 BGS chapters 1–3 now each have 100 MCQ + 30 full CQ + 30 SQ: 480 prepared Draft records total; subject remains incomplete (chapters 4–8 not started, deficit 800). Chapters 2–3 source reviews and verified Drive backup receipts are in their chapter directories. Current manifest backup is recorded in `manifest-drive-checkpoint.json`; earlier Drive manifest uploads are historical snapshots. Registry now has 32 batches / 5076 records across subjects. No DB import, approval, publication, commit or deployment. Independent teacher review remains pending, particularly political-history provenance and conceptual overlap in the short culture chapter.


### BGS chapter 4 Draft checkpoint
Chapter 4 economics: printed24–33/PDF29–38 fully visually read; 100 MCQ + 30 full CQ + 30 SQ authored and registered as unapproved Draft. Chapters1–4 total640, chapters5–8 not started, deficit640. Registry33 batches/5236 prepared records. Chapter4 Drive questions, validation and source-review backups verified by bytes/MD5; current subject manifest receipt supersedes older checkpoints. Current economic statistics were not independently verified; stale textbook figures are not represented as current facts. No live DB import, approval, publication or deployment. Existing consent and Pending guards unchanged.


### BGS chapter5 complete-count Draft; chapters6–8 partial checkpoint
Printed34–64/PDF39–69 fully visually read. Chapter5 registered as 100MCQ+30fullCQ+30SQ Draft; chapters1–5 total800 prepared. Chapters6–8 each have30SQ authored in separate unregistered partial files, MCQ/CQ still missing. Subject NOT complete; prepared deficit480 (partial90SQ excluded from prepared actuals). Registry34 batches/5396 prepared records. Drive chapter backups and current manifest verified by size/MD5. Combined review checkpoints contain source-review plus validation (ch5) or partial content (ch6–8). Citizenship models are not current legal advice; regional membership/OAU and environmental source caveats recorded. No live DB import, approval, publication, commit or deployment.


### BGS chapters 6–8 count-complete Draft (supersedes partial checkpoint)
Chapters 6, 7 and 8 now each contain 100 MCQ + 30 complete CQ + 30 SQ (160 Draft each). All eight BGS chapters meet numerical minimums: 800 MCQ + 240 CQ + 240 SQ = 1280, deficit zero. All remain teacherApproved=false. Registry: 37 batches / 5876 prepared records. Partial authoring files were replaced by registered chapter questions/validation; no website DB import, Pending save, approval, publication or deployment occurred. Existing preview → explicit consent → Pending → separate approval is unchanged.

Chapter source reviews retain environment-causality, child-safety/non-stigmatization and time-sensitive international-membership caveats. Chapter 8's three exact MCQ/SQ stem collisions were replaced with different SQ concepts before validation. MCQ keys are balanced 25 each; CQ has ক/খ/গ/ঘ 1/2/3/4 marks, with solutions. Independent source-page verification, distractor quality, CQ depth and conceptual-overlap review remain required; numerical completion is not teacher approval.

Complete chapter questions plus validation/source-review backups were uploaded to the existing Class 6 → BGS → chapter 6/7/8 folders. Local size/MD5 match the returned Drive metadata. Earlier partial backups remain historical, explicitly superseded in chapter receipts. Current 1280-record manifest: `13neyIE1WeVkwelWghjOQBnUYmJGJxm5l`; receipt: `content/question-bank/class-6/bgs/manifest-drive-checkpoint.json`.

Validation after chapters 6–8 integration: prepared-library 14/14; full security/regression suite 735/735; TypeScript typecheck, reproducible generator --check and git diff --check pass. npm reports 11 dependency advisories (1 moderate, 10 high); no forced dependency changes made.

### Owner instruction: agent imports Pending; owner approves
The owner explicitly instructed: “Tumi sob somoy import kore dibe Ami sudhu dekhe approve korbo”. For requested question-bank work, the agent should perform authorized imports as Pending and the owner retains review/approval. Do not equate this standing import authorization with teacher review, approval or publication; preserve authenticated ADMIN, preview/digest/consent, deduplication and provenance safeguards. Do not change authentication to bypass access requirements.

Current BGS import request remains blocked in this workspace: no configured database environment or authenticated website ADMIN session is available. Local prepared-library registration and verified Drive backup are not a live import. Do not report the 1280 BGS records as Pending until a real authorized import succeeds and its result is verified.

### Scoped machine import access implementation
Owner requested arranging agent access without sharing a Google login. Added a disabled-by-default, bearer/hash-authenticated Pending-only API, explicit batch/digest allowlist, at-most-24-hour expiry, server-side deduplication/shared receipts and grant-identity audit. Added a secret-safe local helper with one-hour grants, preview/acknowledgement and per-batch receipts. No roles, Gmail auth, existing ADMIN guards or approval routes changed. See `PENDING-IMPORT-ACCESS.md` for setup, expiry and immutable-deployment revocation limitations. No grant remains from the local smoke test; no Vercel environment changes, deployment or live import performed. New access tests 3/3, full regression suite 738/738, typecheck and diff check pass. Activation still requires the reviewed code deployment and fresh scoped configuration; an environment without production API connectivity cannot execute the import.
