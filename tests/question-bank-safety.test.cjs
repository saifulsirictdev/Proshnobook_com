const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  Module = require("node:module"),
  ts = require("typescript");
function load(file, mocks = {}) {
  const m = new Module(file, module);
  m.paths = module.paths;
  m.require = (id) => (Object.hasOwn(mocks, id) ? mocks[id] : require(id));
  m._compile(
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText,
    file,
  );
  return m.exports;
}
const images = load("lib/question-bank-images.ts"),
  schema = load("lib/admin-question-bank-schema.ts", {
    "./question-bank-images": images,
  }),
  recoverySchema = load("lib/question-bank-recovery-schema.ts");
const draft = () => ({
  category: "Class 6",
  subject: "গণিত",
  topic: "সংখ্যা",
  type: "MCQ",
  lang: "Bangla",
  difficulty: "EASY",
  text: "  অসম্পূর্ণ খসড়া  ",
  explanation: "",
  correct: "A",
  options: { A: "", B: "", C: "", D: "" },
});
function harness() {
  const data = new Map();
  let writes = 0;
  const setting = {
    findUnique: async ({ where }) =>
      data.has(where.key)
        ? { key: where.key, value: data.get(where.key) }
        : null,
    count: async ({ where }) =>
      [...data.keys()].filter((k) => k.startsWith(where.key.startsWith)).length,
    create: async ({ data: row }) => {
      if (data.has(row.key)) throw Object.assign(Error(), { code: "P2002" });
      data.set(row.key, row.value);
      writes++;
      return row;
    },
    updateMany: async ({ where, data: next }) => {
      if (data.get(where.key) !== where.value) return { count: 0 };
      data.set(where.key, next.value);
      writes++;
      return { count: 1 };
    },
    deleteMany: async ({ where }) => {
      if (data.get(where.key) !== where.value) return { count: 0 };
      data.delete(where.key);
      writes++;
      return { count: 1 };
    },
  };
  const db = {
    setting,
    $transaction: async (fn, opts) => {
      assert.equal(opts.isolationLevel, "Serializable");
      return fn({ setting });
    },
  };
  const bank = load("lib/question-bank-recovery.ts", {
    "@/lib/db": { db },
    "./question-bank-recovery-schema": recoverySchema,
  });
  return { bank, db, data, writes: () => writes };
}
const save = (slot = "new", expectedRevision = null, content = draft()) => ({
  operation: "save",
  slot,
  expectedRevision,
  baseRevision: null,
  draft: content,
});
test("recovery stores incomplete/whitespace-preserving editor content, never live questions; owner isolation and stale updates/deletes", async () => {
  const h = harness();
  assert.equal(await h.bank.loadQuestionRecovery("alice", "new"), null);
  assert.equal(h.writes(), 0);
  const a = await h.bank.mutateQuestionRecovery("alice", save());
  assert.equal(a.draft.text, "  অসম্পূর্ণ খসড়া  ");
  assert.equal(a.draft.options.A, "");
  assert.equal(await h.bank.loadQuestionRecovery("bob", "new"), null);
  const b = await h.bank.mutateQuestionRecovery("bob", save());
  assert.notEqual(a.revision, b.revision);
  assert.equal(h.data.size, 2);
  const a2 = await h.bank.mutateQuestionRecovery(
    "alice",
    save("new", a.revision, { ...draft(), text: "নতুন লেখা" }),
  );
  await assert.rejects(
    h.bank.mutateQuestionRecovery("alice", save("new", a.revision)),
    (e) => e.status === 409,
  );
  await assert.rejects(
    h.bank.mutateQuestionRecovery("alice", {
      operation: "discard",
      slot: "new",
      expectedRevision: a.revision,
    }),
    (e) => e.status === 409,
  );
  assert.equal(
    (await h.bank.loadQuestionRecovery("alice", "new")).draft.text,
    "নতুন লেখা",
  );
  await h.bank.mutateQuestionRecovery("alice", {
    operation: "discard",
    slot: "new",
    expectedRevision: a2.revision,
  });
  assert.equal(await h.bank.loadQuestionRecovery("alice", "new"), null);
  assert.ok(await h.bank.loadQuestionRecovery("bob", "new"));
  await assert.rejects(
    h.bank.mutateQuestionRecovery("alice", save("new", a2.revision)),
    (e) => e.status === 409,
  );
  assert.equal(h.db.question, undefined, "draft store has no Question writer");
});
test("per-owner 25-slot quota, strict payload, no injected owner/approval, bounded device parser", async () => {
  const h = harness();
  for (let i = 0; i < 25; i++)
    await h.bank.mutateQuestionRecovery("alice", save("q" + i));
  await assert.rejects(
    h.bank.mutateQuestionRecovery("alice", save("extra")),
    (e) => e.status === 409,
  );
  assert.ok(await h.bank.mutateQuestionRecovery("bob", save("extra")));
  const old = await h.bank.loadQuestionRecovery("alice", "q0");
  assert.ok(
    await h.bank.mutateQuestionRecovery("alice", save("q0", old.revision)),
  );
  for (const injected of [
    { ownerId: "bob" },
    { approved: true },
    { draft: { ...draft(), approved: true } },
  ])
    assert.equal(
      recoverySchema.recoveryCommandSchema.safeParse({ ...save(), ...injected })
        .success,
      false,
    );
  const record = await h.bank.loadQuestionRecovery("bob", "extra");
  assert.ok(
    recoverySchema.parseDeviceRecovery(JSON.stringify(record), "extra"),
  );
  assert.equal(
    recoverySchema.parseDeviceRecovery(JSON.stringify(record), "other"),
    null,
  );
  assert.equal(recoverySchema.parseDeviceRecovery("not-json", "extra"), null);
  assert.equal(
    recoverySchema.parseDeviceRecovery("x".repeat(180001), "extra"),
    null,
  );
  assert.notEqual(
    recoverySchema.deviceRecoveryKey("a:b", "c"),
    recoverySchema.deviceRecoveryKey("a", "b:c"),
  );
  assert.notEqual(
    recoverySchema.deviceRecoveryKey("alice", "new"),
    recoverySchema.deviceRecoveryKey("bob", "new"),
  );
});
test("recovery turns transaction conflicts into non-overwrite conflicts", async () => {
  for (const code of ["P2002", "P2034"]) {
    const bank = load("lib/question-bank-recovery.ts", {
      "@/lib/db": {
        db: {
          $transaction: async () => {
            throw { code };
          },
        },
      },
      "./question-bank-recovery-schema": recoverySchema,
    });
    await assert.rejects(
      bank.mutateQuestionRecovery("alice", save()),
      (e) => e.status === 409,
    );
  }
});
test("quality checklist detects duplicate MCQ, absent answers and wrong CQ marks but never certifies factual correctness", () => {
  const quality = load("lib/question-bank-quality.ts", {
    "./admin-question-bank-schema": schema,
    "./question-bank-images": images,
  });
  let checks = quality.inspectQuestionQuality(draft());
  assert.equal(checks.find((c) => c.id === "structure").level, "error");
  assert.equal(checks.find((c) => c.id === "answer").level, "warning");
  const valid = {
    ...draft(),
    options: { A: "এক", B: "দুই", C: "তিন", D: "চার" },
    explanation: "সমাধান লেখা আছে",
  };
  checks = quality.inspectQuestionQuality(valid);
  assert.equal(checks.find((c) => c.id === "structure").level, "pass");
  assert.equal(checks.find((c) => c.id === "evidence").level, "manual");
  checks = quality.inspectQuestionQuality({
    ...valid,
    options: { A: "এক", B: " এক ", C: "তিন", D: "চার" },
  });
  assert.equal(checks.find((c) => c.id === "choices").level, "error");
  checks = quality.inspectQuestionQuality({
    ...valid,
    type: "CQ",
    correct: "",
    options: {
      stimulus: "উদ্দীপক",
      subQuestions: { k: "ক", kh: "খ", g: "গ" },
      marks: { k: 1, kh: 2, g: 3 },
    },
  });
  assert.equal(checks.find((c) => c.id === "marks").level, "error");
  checks = quality.inspectQuestionQuality({
    ...valid,
    text: "![চিত্র](/api/question-bank/images/not-a-uuid.webp)",
  });
  assert.equal(checks.find((c) => c.id === "images").level, "error");
  checks = quality.inspectQuestionQuality({
    ...valid,
    text: "![চিত্র](/api/question-bank/images/12345678-1234-4123-8123-123456789abc.webp)",
  });
  assert.equal(checks.find((c) => c.id === "images").level, "manual");
});
test("recovery API rejects non-admin/cross-origin, oversized JSON and guessed owner; GET is read-only", async () => {
  const h = harness(),
    origin = load("lib/question-bank-origin.ts");
  let role = "ADMIN";
  const guard = {
    admin: async () => {
      if (role !== "ADMIN") throw Error();
      return { id: "alice" };
    },
  };
  const http = load("lib/question-bank-http.ts", {
    "@/lib/guard": guard,
    "@/lib/question-bank-origin": origin,
  });
  const route = load("app/api/admin/question-bank/draft/route.ts", {
    "@/lib/guard": guard,
    "@/lib/question-bank-http": http,
    "@/lib/question-bank-recovery": h.bank,
    "@/lib/question-bank-recovery-schema": recoverySchema,
  });
  const post = (body, origin = "https://preview.e2b.app") =>
    route.POST(
      new Request("https://preview.e2b.app/api/admin/question-bank/draft", {
        method: "POST",
        headers: { Origin: origin, "Content-Type": "application/json" },
        body: typeof body === "string" ? body : JSON.stringify(body),
      }),
    );
  for (const r of ["STUDENT", "TEACHER", "ANONYMOUS"]) {
    role = r;
    assert.equal((await post(save())).status, 403);
    assert.equal(
      (
        await route.GET(
          new Request("https://preview.e2b.app/api/admin/question-bank/draft"),
        )
      ).status,
      403,
    );
  }
  role = "ADMIN";
  assert.equal((await post(save(), "https://evil.invalid")).status, 403);
  assert.equal(h.writes(), 0);
  assert.equal(
    (
      await route.GET(
        new Request("https://preview.e2b.app/api/admin/question-bank/draft"),
      )
    ).status,
    200,
  );
  assert.equal(h.writes(), 0);
  assert.equal((await post("x".repeat(180001))).status, 413);
  assert.equal((await post({ ...save(), ownerId: "bob" })).status, 400);
  const result = await post(save());
  assert.equal(result.status, 200);
  assert.equal(result.headers.get("cache-control"), "no-store");
  const revision = (await result.json()).record.revision;
  assert.equal((await post(save())).status, 409);
  assert.equal(
    (
      await post({
        operation: "discard",
        slot: "new",
        expectedRevision: revision,
      })
    ).status,
    200,
  );
});
