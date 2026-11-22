# ৪র্থ অধ্যায়: সূচক ও লগারিদম — v1

**150 MCQ + 50 CQ + 70 SQ = 270. DRAFT; teacher review pending; NOT imported.**

Current registry inputs are `target-v1/mcq.json` (150) and `target-v1/written.json` (120). `target-v1/validation.json` contains source/original labels, per-item bindings, algebra witnesses, domain notes and limitations. `targets-v1-manifest.json` binds file hashes.

`board-seed-v1.json` is an archival subset of five visually transcribed board-compilation MCQ already included once in `mcq.json`. Do not register/import it again. Compilation board/year labels are not independently authenticated official originals.

The other 265 records are original parameterised practice (29 MCQ, 10 CQ, 14 SQ families × five variants), not board or verbatim NCTB questions. This is numeric quota completion, not 270 distinct concepts, exhaustive board collection or full current-edition textbook coverage. All CQ have three 2/4/4 parts and solutions. Independent teacher review remains required.

See `docs/question-bank/ssc-math-ch4-targets.md` for questions/Drive links, verification evidence, source table and limitations. Versioned JSON backup receipt: `docs/question-bank/ssc-math-ch4-targets-v1-drive-backup.json` (five successful uploads, all Drive MD5s matched locally).

Builder: `scripts/question-bank/build-ssc-math-ch4-targets.py` (`--check` for reproducibility). Published-artifact verifier: `scripts/question-bank/verify-ssc-math-ch4-targets.py`. Both use development-only SymPy 1.14.0. No production dependency added. Focused importer/rendering/registry tests: `tests/ssc-math-ch4-targets.test.cjs`.
