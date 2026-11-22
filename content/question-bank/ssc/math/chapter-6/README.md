# ৬ষ্ঠ অধ্যায়: রেখা, কোণ ও ত্রিভুজ — illustrated v1

**150 MCQ + 50 CQ + 30 SQ = 230. Numeric DRAFT; teacher/diagram/proof review pending; NOT imported.**

Illustrated records: **149 MCQ + 50 CQ + 30 SQ**, backed by 229 actual SVG files in `public/question-bank/ssc-math-ch6-v1/`. Images are schematic, not to scale. `docs/question-bank/ssc-math-ch6-illustrated-review.html` is a self-contained offline gallery (all SVG, Bengali font and MathML bundled); open the downloaded HTML in a modern browser. Answer/solution sections expand on click.

**Deployment gate:** JSON uses versioned `https://proshnobook.com/question-bank/ssc-math-ch6-v1/*.svg` image references. These assets are NOT yet deployed and their production availability has NOT been verified. Do not treat JSON alone as a working live illustrated paper. Deploy the bundled static assets at those paths and verify all URLs in the real editor/print workflow before import/approval. Offline gallery review does not prove production availability.

Current registry inputs: `target-v1/mcq.json` (150), `target-v1/written.json` (80). `target-v1/validation.json` contains provenance, item bindings, numeric witnesses, image manifest and limitations. `targets-v1-manifest.json` binds file hashes.

`board-seed-v1.json` is an archival subset of ten source-adapted MCQ already included once in the target MCQ. Do not import/register it again. Board/year labels come from compilation headers, not independently authenticated official original papers. Five source questions had figures in the compilation; nine adapted questions have redrawn or added helpful figures here. They are NOT ten exact/facsimile board transcriptions, and 149 illustrated MCQ are NOT 149 board questions.

The other 220 records are original parameterised practice: 20 MCQ families × seven, 10 CQ families × five, 10 SQ families × three. Not 230 distinct concepts or exhaustive NCTB/board coverage. All CQ have three 2/4/4 parts and solutions. Full current-edition NCTB chapter not obtained/read; independent teacher review remains required.

Builder: `scripts/question-bank/build-ssc-math-ch6-targets.py` (`--check`). Published-artifact verifier: `scripts/question-bank/verify-ssc-math-ch6-targets.py`. Development-only SymPy 1.14.0. Offline gallery builder/checker: `scripts/question-bank/{build,check}-ssc-math-ch6-review.cjs`. Focused importer/rendering/asset/registry tests: `tests/ssc-math-ch6-targets.test.cjs`. No production dependencies added.
