# Admin subject/chapter read-filter compatibility

The mobile screenshot selected SSC / English For Today and returned zero rows. Inspection confirmed that the UI offered SSC/HSC catalog choices and legacy DB scopes together, while `bankWhere` queried category/subject by exact string. Consequently SSC could show Class 9/10 subject/topic choices but then exclude their stored questions on search.

## Changes

- Read/count/export filters share the same alias resolver: SSC includes legacy Class 9/10/9-10 names; HSC includes Class 11/12/11-12 names. Explicit single grades remain grade-specific rather than silently including the other grade.
- English For Today / English 1st Paper / English First Paper are first-paper label aliases; English Grammar and Composition / English 2nd Paper / English Second Paper are second-paper aliases. No cross-paper matching and no blanket mapping of an ambiguous `English` subject.
- Topic matching remains exact. Dropdown topics include actual DB topics for matching category/subject aliases. Unit selection limits known grouped topics rather than leaking unrelated DB chapters into that unit. No chapter names are guessed or rewritten.
- Studio subject/topic options distinguish cached DB scope names from curriculum catalog choices. A catalog option does not promise question stock for every status/type filter.
- English structured item/passage workflow is separate from the generic Question DB: show links to the existing grade/paper workspace, not a fabricated generic count or silently migrated content.
- No production rows, approval state, saved subject/category/topic, question IDs, import idempotency, duplicate mutation guards or provenance are changed. Alias expansion is deliberately read-only.

## Regression coverage

Pure tests cover combined vs single-grade categories, paper separation and exact topic matching. Existing bank mutation/security tests remain unchanged in behavior. Disposable PostgreSQL checks cover actual class/subject aliases, chapter boundaries, status/Trash counts, grade isolation and unchanged storage. The authenticated browser workflow selects SSC / English For Today while its fixture is stored as Class 9 / English 1st Paper, verifies the DB chapter option, returned question, English workspace link and same-filter export.

No production DB stock was inspected or invented. Production deployment is separate from PR verification.
