# Owner-authorized SSC English 2 Pending import

The owner explicitly authorized fixing the dependency gate, merging/deploying PR #3,
and importing the prepared material as Pending. Approval is reserved for the owner.

## Frozen preview

- Grades 9 and 10, Paper 2 only.
- 612 exercises per grade: 51 for each of the 12 items.
- 612 shared exercises, **1224 grade-specific bank records**, not 1224 distinct exercises.
- Content is source-backed/adapted practice with possible answers, not official keys.
- Full snapshot digest: `4ec9d2ea8f1935a2b5c9863b94fcbc2fb068d102d9aaf210e998c9bf3a8227ae`.
- Grade 9 digest: `38efe311d296a2824ab6d9e12720947ba93cb024da71974051ca6e6bde39aa28`.
- Grade 10 digest: `fad5e93bace58528944a20f7c1f305941e90d76da8aebf9af4a526f3204ca7e5`.

## Controlled execution

1. Run `node scripts/english/import-ssc-pending.cjs preview` and check the digest.
2. Require passing PR security checks and a ready production deployment.
3. Repository owner/write-authorized operator manually dispatches
   `ssc-pending-import.yml` at the reviewed commit with the exact digest and
   acknowledgement `IMPORT_SSC_9_10_PENDING_ONLY`.
4. The workflow uses the existing repository database secret without revealing it,
   a serializable transaction, deterministic existing bank keys, Pending-only
   inserts, and no update/delete/approval operation. It verifies all 1224 records
   and byte-for-byte preservation of every existing record before committing.
5. Retain the credential-free workflow receipt. On failure, do not infer success;
   inspect the run and, if needed, repeat the same digest-bound idempotent import.

The GitHub dispatch is explicit repository-owner authorization with actor/run ID
recorded on each new row; it does not impersonate an ADMIN session, weaken the
ADMIN web action, expose database credentials, or introduce a public import API.

## Teacher review

- `/admin/questions?category=Class%209&subject=English%20Grammar%20and%20Composition&grade=9&status=pending#english-question-items`
- `/admin/questions?category=Class%2010&subject=English%20Grammar%20and%20Composition&grade=10&status=pending#english-question-items`

Existing approved/rejected records are preserved. Pending material cannot enter
the approved-only question bank until the teacher reviews and approves it.

## Dependency gate repair

Prisma 6's transitive `effect` version was vulnerable to
GHSA-7589-6fvf-x4pw (TemplateLiteral regex ReDoS). A scoped override pins
`@prisma/config`'s `effect` to patched 3.22.1 without upgrading Prisma's major.
The production dependency audit now reports zero vulnerabilities locally.
