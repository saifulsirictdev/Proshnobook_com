const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
function load(file, mocks = {}) {
  const m = new Module(file, module);
  m.paths = module.paths;
  m.require = (id) => (Object.hasOwn(mocks, id) ? mocks[id] : id === "@/lib/question-bank-origin" ? originGuard : require(id));
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
const originGuard = load("lib/question-bank-origin.ts");
const images = load("lib/question-bank-images.ts");
const schema = load("lib/admin-question-bank-schema.ts", {
  "./question-bank-images": images,
});
const draft = (type = "MCQ") => ({
  category: "Class 6",
  subject: "গণিত",
  topic: "১. স্বাভাবিক সংখ্যা ও ভগ্নাংশ",
  type,
  text: "দুই এবং দুইয়ের যোগফল কত?",
  options:
    type === "MCQ"
      ? { A: "৪", B: "৩", C: "৫", D: "৬" }
      : type === "CQ"
        ? {
            stimulus: "দুই এবং দুইয়ের যোগফল কত?",
            subQuestions: { k: "প্রথম অংশ", kh: "দ্বিতীয় অংশ", g: "তৃতীয় অংশ" },
            marks: { k: 2, kh: 4, g: 4 },
          }
        : {},
  correct: type === "MCQ" ? "A" : "",
  explanation: "দুইয়ের সঙ্গে দুই যোগ করলে চার হয়।",
  difficulty: "EASY",
  lang: "Bangla",
});
function harness() {
  const rows = new Map(),
    settings = new Map();
  let failAudit = false;
  const tx = {
    question: {
      findUnique: async ({ where }) => rows.get(where.id) ?? null,
      findMany: async ({ where }) =>
        [...rows.values()].filter(
          (q) =>
            q.category === where.category &&
            q.subject === where.subject &&
            q.topic === where.topic &&
            q.id !== where.id?.not,
        ),
      create: async ({ data }) => {
        const row = {
          id: `q${rows.size + 1}`,
          createdAt: new Date("2026-01-01"),
          ...data,
        };
        rows.set(row.id, row);
        return row;
      },
      update: async ({ where, data }) => {
        const row = { ...rows.get(where.id), ...data };
        rows.set(row.id, row);
        return row;
      },
    },
    setting: {
      findUnique: async ({ where }) => settings.get(where.key) ?? null,
      create: async ({ data }) => {
        if (failAudit && data.key.startsWith(schema.BANK_AUDIT_PREFIX))
          throw Error("audit failure");
        if (settings.has(data.key)) throw Error("duplicate");
        settings.set(data.key, data);
        return data;
      },
      delete: async ({ where }) => settings.delete(where.key),
    },
  };
  const db = {
    ...tx,
    $transaction: async (fn, opts) => {
      assert.equal(opts.isolationLevel, "Serializable");
      const beforeRows = structuredClone(rows),
        beforeSettings = structuredClone(settings);
      try {
        return await fn(tx);
      } catch (e) {
        rows.clear();
        settings.clear();
        for (const [k, v] of beforeRows) rows.set(k, v);
        for (const [k, v] of beforeSettings) settings.set(k, v);
        throw e;
      }
    },
  };
  const bank = load("lib/admin-question-bank.ts", {
    "server-only": {},
    "@prisma/client": {},
    "@/lib/db": { db },
    "@/lib/question-types": { questionTypeWhere: (kind) => ({ kind }) },
    "./admin-question-bank-schema": schema,
  });
  return {
    bank,
    db,
    rows,
    settings,
    auditFailure: () => {
      failAudit = true;
    },
  };
}
test("strict MCQ/CQ/SQ validation, separate review and bounded filters", () => {
  for (const type of ["MCQ", "CQ", "SQ"])
    assert.equal(schema.bankDraftSchema.parse(draft(type)).type, type);
  for (const change of [
    (q) => (q.correct = "Z"),
    (q) => (q.options.B = "৪"),
    (q) => (q.text = ""),
    (q) => (q.approved = true),
    (q) => (q.options.stimulus = "CQ"),
  ]) {
    const q = draft();
    change(q);
    assert.equal(schema.bankDraftSchema.safeParse(q).success, false);
  }
  const cq = draft("CQ");
  cq.options.marks.k = 1;
  assert.equal(schema.bankDraftSchema.safeParse(cq).success, false);
  cq.subject = "বিজ্ঞান";
  cq.options.subQuestions.gh = "চতুর্থ অংশ";
  cq.options.marks = { k: 1, kh: 2, g: 3, gh: 4 };
  assert.ok(schema.bankDraftSchema.safeParse(cq).success);
  assert.ok(
    !schema.bankMutationSchema.safeParse({ operation: "delete", id: "q" })
      .success,
  );
  assert.ok(!schema.bankFiltersSchema.safeParse({ page: "-1" }).success);
  assert.equal(schema.bankFiltersSchema.parse({}).difficulty, "ALL");
});
test("create is Pending; edit resets approval, preserves original provenance and audits atomically", async () => {
  const h = harness();
  let q = await h.bank.mutateBank("admin", {
    operation: "create",
    draft: {
      ...draft(),
      options: { ...draft().options, _provenance: { spoofed: true } },
    },
  });
  assert.equal(q.approved, false);
  assert.equal(q.source, "ADMIN_MANUAL");
  assert.equal(q.options._provenance, undefined);
  h.rows.get(q.id).options._provenance = { book: "original" };
  q = h.bank.bankRow(h.rows.get(q.id));
  q = await h.bank.mutateBank("admin", {
    operation: "approve",
    id: q.id,
    revision: q.revision,
  });
  assert.equal(q.approved, true);
  const oldRevision = q.revision;
  q = await h.bank.mutateBank("editor", {
    operation: "edit",
    id: q.id,
    revision: q.revision,
    draft: { ...draft(), text: "পরিমার্জিত প্রশ্ন" },
  });
  assert.equal(q.approved, false);
  assert.deepEqual(q.options._provenance, { book: "original" });
  await assert.rejects(
    h.bank.mutateBank("admin", {
      operation: "approve",
      id: q.id,
      revision: oldRevision,
    }),
    /রিফ্রেশ/,
  );
  assert.equal(
    [...h.settings.keys()].filter((k) => k.startsWith(schema.BANK_AUDIT_PREFIX))
      .length,
    3,
  );
  h.auditFailure();
  await assert.rejects(
    h.bank.mutateBank("admin", {
      operation: "pending",
      id: q.id,
      revision: q.revision,
    }),
  );
  assert.equal(h.bank.bankRevision(h.rows.get(q.id)), q.revision);
});
test("Trash keeps canonical ID/content, cannot be approved/edited; restore always Pending", async () => {
  const h = harness();
  let q = await h.bank.mutateBank("admin", {
    operation: "create",
    draft: draft(),
  });
  q = await h.bank.mutateBank("admin", {
    operation: "approve",
    id: q.id,
    revision: q.revision,
  });
  const text = q.text;
  q = await h.bank.mutateBank("admin", {
    operation: "trash",
    id: q.id,
    revision: q.revision,
  });
  assert.equal(h.rows.size, 1);
  assert.equal(q.text, text);
  assert.equal(q.approved, false);
  assert.match(q.source, /^ADMIN_TRASH:/);
  for (const operation of ["approve", "edit", "trash"])
    await assert.rejects(
      h.bank.mutateBank("admin", {
        operation,
        id: q.id,
        revision: q.revision,
        ...(operation === "edit" ? { draft: draft() } : {}),
      }),
      /Restore/,
    );
  await assert.rejects(
    h.bank.mutateBank("admin", { operation: "create", draft: draft() }),
    /ইতিমধ্যে/,
  );
  q = await h.bank.mutateBank("admin", {
    operation: "restore",
    id: q.id,
    revision: q.revision,
  });
  assert.equal(q.approved, false);
  assert.equal(q.source, "ADMIN_MANUAL");
  assert.equal(h.settings.has(schema.BANK_TRASH_PREFIX + q.id), false);
});
test("approval rejects incomplete answers; duplicate detection normalizes whitespace/zero-width", async () => {
  const h = harness();
  const q = await h.bank.mutateBank("admin", {
    operation: "create",
    draft: { ...draft(), explanation: "" },
  });
  await assert.rejects(
    h.bank.mutateBank("admin", {
      operation: "approve",
      id: q.id,
      revision: q.revision,
    }),
    /উত্তর সম্পূর্ণ/,
  );
  await assert.rejects(
    h.bank.mutateBank("admin", {
      operation: "create",
      draft: { ...draft(), text: `  ${draft().text}\u200b ` },
    }),
    /ইতিমধ্যে/,
  );
  assert.match(
    JSON.stringify(
      h.bank.bankWhere(
        schema.bankFiltersSchema.parse({
          status: "pending",
          difficulty: "HARD",
        }),
      ),
    ),
    /ADMIN_TRASH:v1:/,
  );
  assert.match(
    JSON.stringify(
      h.bank.bankWhere(schema.bankFiltersSchema.parse({ difficulty: "HARD" })),
    ),
    /HARD/,
  );
});
const validId = "12345678-1234-4123-8123-123456789abc";
test("shared question renderer only accepts exact immutable uploaded raster paths", () => {
  const tables = load("lib/question-tables.ts", {
    "./ssc-biology-assets": fs.existsSync("lib/ssc-biology-assets.ts") ? load("lib/ssc-biology-assets.ts") : { BIOLOGY_FIGURE_PATHS: [] },
  });
  const url = images.questionImagePath(validId);
  assert.ok(images.isQuestionImagePath(url));
  assert.equal(
    tables.questionBlocks(`![কোষ](${url})`)[0].kind,
    "uploaded-image",
  );
  for (const bad of [
    url + "?x=1",
    url.replace(".webp", ".svg"),
    url.replace("/api/", "https://evil.invalid/api/"),
    "/api/question-bank/images/not-uuid.webp",
    "javascript:alert(1)",
  ]) {
    assert.ok(!images.isQuestionImagePath(bad));
    assert.equal(tables.questionBlocks(`![x](${bad})`)[0].kind, "text");
  }
  const MathText = load("components/MathText.tsx", {
    "@/lib/question-tables": tables,
  }).default;
  const html = renderToStaticMarkup(
    React.createElement(MathText, {
      text: `![কোষ](${url})\n<script>alert(1)</script>`,
    }),
  );
  assert.match(html, /<img/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
});
function routeHarness(role = "ADMIN") {
  const h = harness();
  const routes = load("app/api/admin/question-bank/route.ts", {
    "@/lib/guard": {
      admin: async () => {
        if (role !== "ADMIN") throw Error("denied");
        return { id: "admin" };
      },
    },
    "@/lib/db": { db: h.db },
    "@/lib/admin-question-bank-schema": schema,
    "@/lib/admin-question-bank": h.bank,
    "next/cache": { revalidatePath: () => {} },
  });
  const post = (body, origin = "https://preview.e2b.app") =>
    routes.POST(
      new Request("https://preview.e2b.app/api/admin/question-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: origin },
        body: typeof body === "string" ? body : JSON.stringify(body),
      }),
    );
  return { ...h, routes, post };
}
test("API requires ADMIN, JSON and same origin; rejects oversized and malformed requests", async () => {
  for (const role of ["STUDENT", "TEACHER", "ANONYMOUS"]) {
    const h = routeHarness(role);
    assert.equal(
      (await h.post({ operation: "create", draft: draft() })).status,
      403,
    );
    assert.equal(
      (
        await h.routes.GET(
          new Request("https://preview.e2b.app/api/admin/question-bank"),
        )
      ).status,
      403,
    );
    assert.equal(h.rows.size, 0);
  }
  const h = routeHarness();
  assert.equal(
    (
      await h.post(
        { operation: "create", draft: draft() },
        "https://evil.invalid",
      )
    ).status,
    403,
  );
  assert.equal((await h.post("x".repeat(180001))).status, 413);
  assert.equal((await h.post("{}")).status, 400);
  const response = await h.post({ operation: "create", draft: draft() });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).row.approved, false);
});
test("image upload re-encodes real raster, strips metadata, rejects SVG/oversize; immutable image delivery", async () => {
  const sharp = require("sharp"),
    h = harness();
  let denied = false;
  const upload = load("app/api/admin/question-bank/image/route.ts", {
    "@/lib/guard": {
      admin: async () => {
        if (denied) throw Error();
        return { id: "admin" };
      },
    },
    "@/lib/db": { db: h.db },
    "@/lib/admin-question-bank-schema": schema,
  });
  const png = await sharp({
    create: { width: 30, height: 20, channels: 3, background: "#336699" },
  })
    .png()
    .toBuffer();
  async function send(
    bytes,
    type = "image/png",
    origin = "https://preview.e2b.app",
  ) {
    const fd = new FormData();
    fd.set("image", new File([bytes], "test.png", { type }));
    return upload.POST(
      new Request("https://preview.e2b.app/api/admin/question-bank/image", {
        method: "POST",
        headers: { Origin: origin },
        body: fd,
      }),
    );
  }
  const result = await send(png);
  assert.equal(result.status, 200);
  const { url } = await result.json();
  assert.ok(images.isQuestionImagePath(url));
  const stored = JSON.parse([...h.settings.values()][0].value);
  const info = await sharp(Buffer.from(stored.data, "base64")).metadata();
  assert.equal(info.format, "webp");
  assert.equal(info.width, 30);
  assert.equal(info.exif, undefined);
  assert.equal(
    (await send(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>')))
      .status,
    400,
  );
  assert.equal((await send(Buffer.alloc(4200001))).status, 413);
  assert.equal(
    (await send(png, "image/png", "https://evil.invalid")).status,
    403,
  );
  denied = true;
  assert.equal((await send(png)).status, 403);
  const serve = load("app/api/question-bank/images/[file]/route.ts", {
    "@/lib/db": { db: h.db },
    "@/lib/admin-question-bank-schema": schema,
  });
  const image = await serve.GET(new Request("https://preview.e2b.app" + url), {
    params: Promise.resolve({ file: url.split("/").pop() }),
  });
  assert.equal(image.status, 200);
  assert.equal(image.headers.get("Content-Type"), "image/webp");
  assert.match(image.headers.get("Cache-Control"), /immutable/);
  assert.equal(
    (await serve.GET(null, { params: Promise.resolve({ file: "evil.svg" }) }))
      .status,
    404,
  );
});
test("retired actions cannot hard-delete, mass-approve or bypass Trash from stale tabs", async () => {
  let allowed = true,
    dbCalls = 0;
  const mocks = {
    "@/lib/guard": {
      admin: async () => {
        if (!allowed) throw Error("denied");
      },
      staff: async () => {
        if (!allowed) throw Error("denied");
      },
    },
    "@/lib/db": {
      db: new Proxy(
        {},
        {
          get() {
            dbCalls++;
            throw Error("unexpected DB call");
          },
        },
      ),
    },
    "next/navigation": {
      redirect: (href) => {
        throw Error("REDIRECT:" + href);
      },
    },
    "next/cache": { revalidatePath() {} },
  };
  const old = load("app/admin/questions/manage/actions.ts", mocks);
  for (const name of ["toggleOne", "deleteOne", "approveMany", "deleteMany"])
    await assert.rejects(
      old[name]("id", new FormData()),
      /REDIRECT:\/admin\/questions\/bank/,
    );
  const actions = load("app/admin/questions/actions.ts", mocks);
  for (const name of [
    "addQuestion",
    "deleteQuestion",
    "toggleApprove",
    "approveAllPending",
  ])
    await assert.rejects(
      actions[name](new FormData()),
      /REDIRECT:\/admin\/questions\/bank/,
    );
  allowed = false;
  await assert.rejects(old.deleteOne("id", "/admin"), /denied/);
  assert.equal(dbCalls, 0);
});
test('history rollback restores selected content only, always Pending, with a new atomic audit',async()=>{
 const h=harness();let q=await h.bank.mutateBank('admin',{operation:'create',draft:draft()});
 q=await h.bank.mutateBank('admin',{operation:'edit',id:q.id,revision:q.revision,draft:{...draft(),text:'পরবর্তী সম্পাদনা'}});
 const key=[...h.settings.keys()].find(k=>k.startsWith(schema.BANK_AUDIT_PREFIX)&&JSON.parse(h.settings.get(k).value).operation==='edit');
 q=await h.bank.mutateBank('admin',{operation:'rollback',id:q.id,revision:q.revision,snapshotKey:key,version:'before'});
 assert.equal(q.text,draft().text);assert.equal(q.approved,false);assert.equal(q.source,'ADMIN_MANUAL');
 assert.ok([...h.settings.values()].some(row=>row.key.startsWith(schema.BANK_AUDIT_PREFIX)&&JSON.parse(row.value).operation==='rollback'));
 await assert.rejects(h.bank.mutateBank('admin',{operation:'rollback',id:q.id,revision:q.revision,snapshotKey:schema.BANK_AUDIT_PREFIX+'another-id:key',version:'before'}));
});
