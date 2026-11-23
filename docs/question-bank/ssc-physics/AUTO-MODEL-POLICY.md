# Physics Auto Model — owner-confirmed syllabus/chapter policy

## Authority and limits

Owner requested syllabus-aware Physics Auto Model and the same subject-specific arrangement for all future subjects. Owner then explicitly specified written chapters, and selected **“নির্দিষ্ট ৬ অধ্যায় + অন্য ১টি”** in the SQ clarification.

This is an **owner-defined practice policy**, not verified official-year syllabus certification. No official reduced syllabus/year has been supplied. Included syllabus: the existing SSC Physics catalog's full 14 chapters. Do not silently substitute a different year's reduced syllabus.

## Exact rules

| Section | Offered | Answer | Marks | Chapter selection |
| --- | ---: | ---: | ---: | --- |
| MCQ | 25 | 25 | 1 each | Balanced full-book practice: every chapter at least once, at most twice. This balancing strategy is NOT an official chapter quota. |
| CQ | 7 | 4 | 10 each, parts 1–2–3–4 | Exactly one from each of chapters **2, 4, 6, 7, 8, 11**, plus exactly one from **1, 3, 5, 9, 10, 12, 13, 14**. |
| SQ / SHORT | 7 | 5 | 2 each | Independently the same fixed six + one other chapter. Seventh SQ may share the seventh CQ chapter, but is not forced to. |

Theory: **75 marks, 180 minutes shared across MCQ + written**. Practical: **25 marks**, not generated here. UI retains separate MCQ and CQ/written selections; these produce 25-mark and 50-mark components respectively, not two complete 75-mark papers. Do not invent individual section time limits.

## Safety and shared architecture

- `lib/subject-model-policy.ts` is the explicit subject/category policy registry. `assembleSubjectAutoModel` uses its chapter lists, required quotas, maximums, offered/answered counts and CQ part marks.
- Only approved question rows are queried, with subject + category aliases; auth and existing access/checkout gates are unchanged. No AI, auto-import or approval occurs during model assembly.
- Exact catalog topics only; no unknown chapters, another subject's rule, duplicate IDs/stems, missing answers, split stimuli, malformed CQ or unrenderable diagrams. Inline diagrams remain part of the selected questions.
- Missing required stock blocks the entire model and reports chapter/type shortages; surplus in another chapter cannot replace a fixed chapter. The editor/saved-settings/print sections use the same registered policy; edits that violate it are marked custom/incomplete, with all extra questions retained visibly.
- Math's specialised division quotas, fixed 2 trigonometry + 1 mensuration + 2 statistics, max-five-figure policy and English workflow remain unchanged.
- Publication receipts in this folder describe the earlier release, when Physics Auto Model was disabled. They remain immutable historical evidence. **Never rerun the old Physics or Math publication task**; this feature needs only an ordinary app deployment and does not change question-bank rows.

## Required process for every future subject

1. Obtain the owner's exam year/syllabus scope and mark distribution; inspect the supplied source. Identify included/excluded chapters and mandatory section/division quotas. Record whether authority is owner practice or independently verified official document.
2. Add that subject's exact catalog scope and evidence-backed policy to the registry. Different grades/categories must not inherit SSC rules. Do not copy Physics chapter numbers or Math distribution.
3. Register stable versioned policy IDs in `paper-builder.ts`'s saved-settings schema; add acceptance tests to ensure roundtrip/print/editor compatibility. Provide subject-specific figure allowlists if new assets require them.
4. Author and review answers/diagrams, preserve source limitations and Drive JSON backups. Import/approve only with explicit authorization. Model availability is independent of the total raw question count.
5. Test actual approved-compatible stock against **every required section/chapter**, shortages, duplicates, edited-paper warnings, settings persistence and printed instructions. Only a complete model succeeds. Until this is done, Auto Model stays unavailable for that subject; Chapter selection remains available.

## Implementation checks

- 274 focused subject/Physics/Math/English/selection/settings tests passed; after the final print-preview guard, 92 focused rendering/header/assembly tests passed (including the 11 subject-policy tests). These are overlapping sets, not a combined distinct-test total.
- Actual canonical 6400-row fixtures classify as 3500 MCQ, 1640 CQ, 1260 SQ; repeated seeded models verify chapter quotas and variable seventh chapters. Negative tests cover missing mandatory chapters, malformed answers/figures, duplicate rows, unsupported subjects and access/scan gates.
- Real React preview browser checks at 1280px and 390px passed for both variants, with SVG loading, print mode, saved-settings reload, and removal/structural warning. A stale pagination-index crash discovered during removal/variant change was fixed without changing print content or unrelated workflow. Evidence: `auto-model-browser-check.json` and the two `auto-model-*.png` files.
- Production verification uses the explicit **read-only** `scripts/question-bank/check-ssc-physics-auto-model.cjs`; the ordinary build remains unchanged. Production result is recorded separately after deployment; do not infer success solely from local fixtures.
- Future changes to a registered syllabus/chapter quota require a new versioned model policy ID, preserving the meaning of saved models.
