# Software terminology change

Scope: replace the product-facing AI/এআই wording in existing headings, menus,
buttons, accessible labels, metadata, notices, server-returned errors and paper
source tags with সফটওয়্যার. No new generation, content publication or finance
mutation is part of this change.

- TypeScript: `npm run typecheck` passed.
- Focused regression run: 101 tests passed, 0 failed, 0 skipped.
- Test files: software-terminology, english-preparation-message,
  auto-model-syllabus, auto-model, english-auto-model, english-actions,
  ready-ai, ready-answers.
- Added an AST-based copy regression guard (comments, enum values, internal
  provider prompts and educational topic content are not product copy).
- Legacy English preparation messages still normalize quota and failure text.
- Draft/review warnings and DeepSeek transmission disclosures are retained.
- Database source markers, API source provenance, enum values, routes,
  provider configuration, quota and stock-first logic are unchanged. Paper tags
  translate the label at display time only.
- The English writing topic “Artificial Intelligence (AI)” remains educational
  content, not a product label, and has not been altered.
- No deployment is claimed by this report. The earlier requested inline-paper
  header editing and whitespace/pagination fixes are separate, still pending.

The incremental backup contains the before/after source, tests, this report,
validation logs and a SHA-256 manifest. It supplements the previously verified
full source backup Drive file `152tLqFDOh6CHi0fIjCmL3Asqo-L7TXcR`.
