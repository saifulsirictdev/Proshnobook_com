# Class Eight Second Paper release / Pending-only import

The owner chose `class8_english2_release=publish_and_pending`, then required model/syllabus-aligned repairs before adding material to the website. The immutable raw snapshots, 101 explicit adaptations and evidence boundaries are documented in `content/question-bank/class-8/english-2nd/REVIEW.md`.

Scope: **11 topics × 40 SQ exercise sets = 440**, Class 8 / English 2nd Paper only. Not First Paper, SSC, 440 full papers, or teacher approval. This generic SQ library is not certified structured Auto Model stock.

## Preview frozen for this release

Run:

```sh
node scripts/english/import-class8-english2-pending.cjs preview
```

Reviewed full-plan SHA-256:

`01e3d6aa6eee372066ebce8839245bf32af0482e3ecc11e3ce52571d9646ef9c`

A change to questions, answers, batch metadata or provenance changes the digest and requires a new preview. Normal builds and application reads never import anything.

## Controlled execution

1. Require passing checks and publish the reviewed branch/PR.
2. Use an explicitly invoked, deployment-local CLI with the existing production database binding. Do not copy database credentials into the sandbox or chat. No ADMIN impersonation, public endpoint bypass, grant/environment secret creation or content approval is required.
3. For the owner-authorized import only, pass the exact digest and `C8_PENDING=IMPORT_CLASS8_ENGLISH2_PENDING_ONLY` to the `save` command. It creates only missing questions as `approved:false`, uses deterministic prepared-question IDs and serializable isolation, verifies all 440 target stems, verifies preservation of every existing row, and stores provenance receipts. It has no question update/delete/approval operation.
4. A one-off Vercel build command may invoke the CLI **after** a successful normal build; do not persist that override in project settings. Never repeat the historical SSC importer. After successful import, deploy again with the normal `npm run build` command and retain a credential-free import receipt in the PR audit trail.
5. If execution is uncertain, inspect the specific deployment logs before retrying. The same reviewed plan is idempotent and reconciles missing rows even when an older receipt exists; existing question decisions and receipts remain untouched.

## Teacher review

[Class Eight Second Paper Pending questions](https://proshnobook.com/admin/questions?category=Class%208&subject=English%202nd%20Paper&status=pending)

ADMIN preview/import remains available at `/admin/questions/import`, filtered by Class 8 and English 2nd Paper. The owner's later review determines accepted answer alternatives and approval; software tests are not substantive teacher approval.
