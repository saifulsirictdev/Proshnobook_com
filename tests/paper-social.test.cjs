const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  Module = require("node:module"),
  ts = require("typescript"),
  crypto = require("node:crypto");
function load(file, mocks) {
  const m = new Module(file, module);
  m.paths = module.paths;
  m.require = (n) => mocks[n] || (n === "server-only" ? {} : require(n));
  m._compile(
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText,
    file,
  );
  return m.exports;
}
function setup() {
  const store = new Map(),
    paperId = "a".repeat(64),
    users = {
      u: {
        id: "u",
        name: "User",
        role: "STUDENT",
        email: "private@example.com",
      },
      v: { id: "v", name: "Other", role: "TEACHER" },
      a: { id: "a", name: "Admin", role: "ADMIN" },
    };
  let session = "u",
    publicPaper = true,
    queue = Promise.resolve();
  function matches(k, v, w) {
    return (
      (!w?.key?.startsWith || k.startsWith(w.key.startsWith)) &&
      (!w?.key?.gt || k > w.key.gt) &&
      (!w?.value?.contains || v.includes(w.value.contains)) &&
      (!w?.key?.endsWith || k.endsWith(w.key.endsWith))
    );
  }
  const db = {
    user: { findUnique: async ({ where }) => users[where.id] },
    setting: {
      findUnique: async ({ where }) =>
        store.has(where.key)
          ? { key: where.key, value: store.get(where.key) }
          : null,
      count: async ({ where }) =>
        [...store].filter(([k, v]) => matches(k, v, where)).length,
      upsert: async ({ where, create, update }) => {
        if (!store.has(where.key)) store.set(where.key, create.value);
        else if (update.value !== undefined) store.set(where.key, update.value);
      },
      create: async ({ data }) => {
        if (store.has(data.key)) throw Error();
        store.set(data.key, data.value);
      },
      deleteMany: async ({ where }) => store.delete(where.key),
      update: async ({ where, data }) => {
        if (!store.has(where.key)) throw Error();
        store.set(where.key, data.value);
      },
      findMany: async ({ where, take }) =>
        [...store]
          .filter(([k, v]) => matches(k, v, where))
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(0, take)
          .map(([key, value]) => ({ key, value })),
    },
  };
  store.set(
    "market:submission:v1:" + paperId,
    JSON.stringify({ id: paperId, status: "APPROVED" }),
  );
  const core = load("lib/paper-social.ts", {
    "@/lib/db": { db },
    "@/lib/marketplace": { MARKET_PREFIX: "market:submission:v1:" },
    "@/lib/marketplace-purchase": {
      saleRecord: (raw, id) => {
        const r = JSON.parse(raw);
        if (!publicPaper || r.id !== id || r.status !== "APPROVED")
          throw Error("not public");
        return r;
      },
    },
  });
  const actions = load("app/actions/paper-social.ts", {
    "@/auth": {
      auth: async () => (session ? { user: { id: session } } : null),
    },
    "@/lib/db": { db },
    "@/lib/paper-social": core,
    "@/lib/social-profiles": { publicAvatar: () => null },
    "next/cache": { revalidatePath() {} },
    "@/lib/wallet": {
      walletTransaction: (fn) => {
        const run = queue.then(async () => {
          const before = new Map(store);
          try {
            return await fn(db);
          } catch (e) {
            store.clear();
            for (const [k, v] of before) store.set(k, v);
            throw e;
          }
        });
        queue = run.catch(() => {});
        return run;
      },
    },
  });
  return {
    store,
    paperId,
    users,
    core,
    actions,
    setSession: (id) => (session = id),
    setPublic: (v) => (publicPaper = v),
  };
}
function form(x, values) {
  const f = new FormData();
  f.set("paperId", x.paperId);
  for (const [k, v] of Object.entries(values)) f.set(k, v);
  return f;
}
test("likes and bookmarks are explicit idempotent owner relations, never wallet entitlements", async () => {
  const x = setup(),
    f = form(x, { kind: "like", on: "yes" });
  const rs = await Promise.all(
    Array.from({ length: 8 }, () => x.actions.setPaperRelation({}, f)),
  );
  assert.ok(rs.every((r) => r.ok));
  assert.equal((await x.core.paperSocialSummary(x.paperId, "u")).likes, 1);
  f.set("on", "no");
  assert.equal((await x.actions.setPaperRelation({}, f)).likes, 0);
  assert.equal((await x.actions.setPaperRelation({}, f)).likes, 0);
  assert.equal(
    (await x.actions.setPaperRelation({}, form(x, { kind: "save", on: "yes" })))
      .saved,
    true,
  );
  assert.equal((await x.core.paperSocialSummary(x.paperId, "v")).saved, false);
  assert.equal(
    [...x.store.keys()].some(
      (k) => k.startsWith("wallet:") || k.startsWith("market:purchase:"),
    ),
    false,
  );
  x.setSession(null);
  assert.equal((await x.actions.setPaperRelation({}, f)).ok, false);
  x.setSession("u");
  x.setPublic(false);
  assert.equal((await x.actions.setPaperRelation({}, f)).ok, false);
});
test("comments are pending, retry-safe and bounded; anonymous/stale paper cannot create comments", async () => {
  const x = setup(),
    nonce = crypto.randomUUID(),
    f = form(x, { body: "Useful question paper", nonce });
  const a = await x.actions.addPaperComment({}, f),
    b = await x.actions.addPaperComment({}, f);
  assert.equal(a.ok, true);
  assert.equal(a.commentId, b.commentId);
  assert.equal(
    (await x.actions.loadPaperComments(x.paperId)).comments.length,
    0,
  );
  const row = JSON.parse(
    x.store.get(`social:comment:v1:${x.paperId}:${a.commentId}`),
  );
  assert.equal(row.status, "PENDING");
  for (let i = 0; i < 9; i++)
    assert.equal(
      (
        await x.actions.addPaperComment(
          {},
          form(x, {
            body: "Another useful comment",
            nonce: crypto.randomUUID(),
          }),
        )
      ).ok,
      true,
    );
  assert.equal(
    (
      await x.actions.addPaperComment(
        {},
        form(x, { body: "Rate limit", nonce: crypto.randomUUID() }),
      )
    ).ok,
    false,
  );
  x.setSession(null);
  assert.equal((await x.actions.addPaperComment({}, f)).ok, false);
  x.setSession("v");
  x.setPublic(false);
  assert.equal((await x.actions.addPaperComment({}, f)).ok, false);
});
test("fresh ADMIN approval and audit required; public comments exclude private IDs and author deletion cannot be reversed", async () => {
  const x = setup(),
    r = await x.actions.addPaperComment(
      {},
      form(x, {
        body: "<script>not executable React text</script>",
        nonce: crypto.randomUUID(),
      }),
    );
  const f = form(x, {
    commentId: r.commentId,
    decision: "APPROVED",
    reason: "Reviewed content",
    reviewed: "on",
  });
  assert.equal((await x.actions.moderatePaperComment({}, f)).ok, false);
  x.setSession("a");
  assert.equal((await x.actions.moderatePaperComment({}, f)).ok, true);
  const read = await x.actions.loadPaperComments(x.paperId);
  assert.equal(read.comments.length, 1);
  assert.equal("userId" in read.comments[0], false);
  assert.equal("email" in read.comments[0], false);
  assert.equal(
    read.comments[0].body,
    "<script>not executable React text</script>",
  );
  x.setSession("v");
  f.set("decision", "DELETED");
  assert.equal((await x.actions.moderatePaperComment({}, f)).ok, false);
  x.setSession("u");
  assert.equal((await x.actions.moderatePaperComment({}, f)).ok, true);
  assert.equal(
    (await x.actions.loadPaperComments(x.paperId)).comments.length,
    0,
  );
  x.setSession("a");
  f.set("decision", "APPROVED");
  assert.equal((await x.actions.moderatePaperComment({}, f)).ok, false);
  assert.equal(
    [...x.store.keys()].filter((k) => k.startsWith("social:commentaudit:"))
      .length,
    2,
  );
});
test("reports deduplicate, stay admin-only and are resolved by moderation", async () => {
  const x = setup();
  const c = await x.actions.addPaperComment(
    {},
    form(x, { body: "Comment to review", nonce: crypto.randomUUID() }),
  );
  x.setSession("a");
  const mf = form(x, {
    commentId: c.commentId,
    decision: "APPROVED",
    reason: "Reviewed safely",
    reviewed: "on",
  });
  await x.actions.moderatePaperComment({}, mf);
  x.setSession("v");
  const f = form(x, {
    commentId: c.commentId,
    reason: "This needs another review",
  });
  assert.equal((await x.actions.reportPaperComment({}, f)).ok, true);
  assert.equal((await x.actions.reportPaperComment({}, f)).ok, true);
  const reports = [...x.store].filter(([k]) =>
    k.startsWith("social:report:v1:"),
  );
  assert.equal(reports.length, 1);
  assert.equal(JSON.parse(reports[0][1]).status, "OPEN");
  x.setSession("a");
  mf.set("decision", "HIDDEN");
  assert.equal((await x.actions.moderatePaperComment({}, mf)).ok, true);
  assert.equal(JSON.parse(x.store.get(reports[0][0])).status, "RESOLVED");
  assert.equal(
    (await x.actions.loadPaperComments(x.paperId)).comments.length,
    0,
  );
  x.users.a.role = "TEACHER";
  assert.equal((await x.actions.moderatePaperComment({}, mf)).ok, false);
});
