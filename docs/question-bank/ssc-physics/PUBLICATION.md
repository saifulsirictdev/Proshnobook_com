# SSC Physics owner-authorized publication

## Authorization and exact scope

Owner request: **“Approve and deploye koro”**, following delivery of all fourteen chapter drafts. This authorizes the 6400 canonical questions, not blanket approval of any Physics row, independent teacher certification, or enabling Physics Auto Model.

- 3500 MCQ, 1640 CQ, 1260 SQ; 53 prepared batches across chapters 1–14.
- 2205 distinct SVG assets (chapters 5–14); 1720 belong to chapters 8–14.
- Release digest: `7b80bf85cb78af28ad0ba74ab060b9e1cacba3846d665607277eddf36d4b10d4`.
- Existing per-chapter validation/review files and Drive archives are historical draft artifacts. They are deliberately not rewritten as teacher-certified or relabelled to imply full source coverage. Publication status is evidenced separately by the production release receipt.

## Explicit release procedure

1. Test `node --test tests/ssc-physics-*.test.cjs` and inspect `node scripts/question-bank/release-ssc-physics.cjs preview`.
2. Deploy the application/assets normally to the existing production project. A normal build **never** imports or approves questions.
3. In a separately authorized production deployment, use a deployment-only build override: normal build first, then the explicit pinned command below. Do not save it as the project's default build command.

```
node scripts/question-bank/release-ssc-physics.cjs publish 7b80bf85cb78af28ad0ba74ab060b9e1cacba3846d665607277eddf36d4b10d4 PUBLISH_6400_PHYSICS_OWNER_APPROVED_NOT_TEACHER_CERTIFIED
```

4. The command checks production project context, every live SVG's HTTP status/content type/SHA256, and immutable canonical batch digests. It imports missing exact IDs as Pending in one transaction, then exact-content rechecks and approves all 6400 in a second serializable transaction. Duplicate legacy/alias stems or canonical drift stop publication. Earlier approvals and unrelated rows are preserved. Retry is idempotent. Per-import provenance and per-attempt approval audits are kept in Settings.
5. A successful `SSC_PHYSICS_RELEASE_RECEIPT` confirms committed approval; Vercel READY/PROMOTED separately confirms site deployment. Do not infer database success from site deployment alone. If phase two fails, newly imported rows stay Pending. Never rerun historical Math releases.

## Preserved limitations

Original practice questions include disclosed numerical parameter variants. Partial source/figure inspection does not establish full textbook, page, syllabus or official-year verification. Owner approval is **not** independent teacher review. Medical Physics examples are educational, not diagnosis/treatment instructions. Physics Auto Model stays unsupported. The owner's 75 theory + 25 practical, 25 MCQ, 7 CQ (answer 4), 7 SQ (answer 5), 180-minute distribution remains unchanged.

## Validation for this release

77 focused Physics tests passed before deployment, including 10 publication tests (exact scope, authorization, immutable audits, idempotency, alias/content/provenance conflict rejection, rollback, live asset hashes and no implicit normal-build publication). The independent chapters 8–14 verifier passed. Local Prisma client generation was blocked by the sandbox's outbound host allowlist (`binaries.prisma.sh`), so local full typecheck/build could not be completed in this fresh sandbox. The production Vercel build is the required full build/typecheck gate; its outcome must be recorded in the release receipt.
