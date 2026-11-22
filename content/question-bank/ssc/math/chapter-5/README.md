# ৫ম অধ্যায়: এক চলকবিশিষ্ট সমীকরণ — v1

**100 MCQ + 20 CQ + 30 SQ = 150. Numeric DRAFT; teacher review pending; NOT imported.**

Current registry inputs: `target-v1/mcq.json` (100) and `target-v1/written.json` (50). `target-v1/validation.json` carries source/original labels, equation/root/exclusion audits, per-item bindings and limitations. `targets-v1-manifest.json` binds file hashes.

`board-seed-v1.json` is an archival subset of five visually transcribed board-compilation MCQ, already included once in the target MCQ. Do not register or import this subset again. Board/year labels are from compilation headers, not independently authenticated official originals. Shared stimulus for Dhaka Q21 is included inline. Cumilla Q19 has equivalent incorrect B/D distractors; preserved. Jashore Q8's B {∅} is not the empty set C {}; this distinction is preserved.

The other 145 records are original parameterised practice: 19 MCQ families × five, 10 CQ families × two, 10 SQ families × three. They are not board or verbatim NCTB questions, 150 distinct concepts or exhaustive textbook/board coverage. Each CQ has three 2/4/4 parts with solutions. Independent teacher review remains required.

See `docs/question-bank/ssc-math-ch5-targets.md` for Drive question/solution links, sources, verification results and limitations. Versioned backup receipt: `docs/question-bank/ssc-math-ch5-targets-v1-drive-backup.json` (five successful uploads, all Drive MD5/size values matched locally).

Builder: `scripts/question-bank/build-ssc-math-ch5-targets.py` (`--check`). Published-artifact verifier: `scripts/question-bank/verify-ssc-math-ch5-targets.py`. Both use development-only SymPy 1.14.0; no production dependency added. Importer/rendering/registry tests: `tests/ssc-math-ch5-targets.test.cjs`.
