# Class 6 — first draft batch

## Contents

- `math-ch1-draft.json`: 100 original practice MCQs, compatible with `/admin/questions/import` (Pending only).
- `math-ch1-review.md`: human-readable questions, all choices, answer key and explanations.
- `math-ch1-validation.json`: exact-arithmetic/choice verification results and explicit review limitations.
- Rebuild/validate with `python3 scripts/question-bank/build-class6-math-ch1.py` (standard library, no network or DB access).

## Scope and provenance — READ BEFORE IMPORT

Owner requested starting Class 6 and permits internet-assisted original question creation, 100/chapter target, 50 fallback. This batch covers 25 number/fraction skills, four numerical examples per skill, not 100 different pedagogical skills. Concepts include place value, sequence, greatest four-digit number, divisors/primality, GCD/LCM, division/remainder, fraction equivalence/comparison/operations, mixed numbers, decimals and applied problems. No wholesale copying from guidebooks.

Discovery sources (search index only; full pages/PDF contents were NOT retrieved):

- Owner's NCTB 2026 Class6 index: https://nctb.gov.bd/pages/static-pages/695b987ac4774958d7b7040b — official book listing, not evidence for individual drafted answers.
- https://www.bdmyschool.com/item/650/%E0%A6%B7%E0%A6%B7%E0%A7%8D%E0%A6%A0-%E0%A6%B6%E0%A7%8D%E0%A6%B0%E0%A7%87%E0%A6%A3%E0%A6%BF-%E0%A6%97%E0%A6%A3%E0%A6%BF%E0%A6%A4-%E0%A6%B8%E0%A6%AE%E0%A6%BE%E0%A6%A7%E0%A6%BE%E0%A6%A8-%E0%A6%85%E0%A6%A7%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A7%9F%E0%A6%B8%E0%A6%AE%E0%A7%82%E0%A6%B9 — indexed chapter title and exercise ranges 1.1–1.6. Full fetch returned no content.
- https://www.talukdaracademy.com.bd/2026/03/download-class-6-math-guide-book-pdf.html — indexed 2026 chapter list includes Natural Numbers and Fractions; secondary source, not independently authenticated official edition.

The questions and explanations were authored as original exercises using exact arithmetic, not extracted from those sources. JSON's source URL records the chapter-discovery reference, NOT an answer citation. Book metadata explicitly says original practice; `page` explicitly says no textbook page verification. Never invent page numbers or pass these as official NCTB/exam questions.

## Evidence vs limitations

- Python's exact Fraction arithmetic checks answers and numerical equivalence of all four choices. Brute-force divisors/multiples independently check GCD/LCM; permutations check maximal digit order; trial division checks exactly one prime.
- 100 distinct normalized stems, exactly four distinct numerical options each, balanced A/B/C/D (25 each).
- Automated mathematical checks do NOT certify Bengali wording, complete 2026 syllabus fit, depth, or absence of semantic repetition. Reused skill patterns are intentional practice, not an assertion of semantic novelty.
- Teacher/subject-expert review and official textbook page/edition matching remain outstanding. Keep this as draft. If the owner imports, store Pending, inspect wording/scope, and approve individually only after review.
- No production import, approval, database count or source PDF download has happened. No admin session or database credentials were used.

Next: review this first batch, obtain readable official contents/chapter for final alignment, then proceed to the next chapter. Do not silently count draft files as live approved chapter coverage.
