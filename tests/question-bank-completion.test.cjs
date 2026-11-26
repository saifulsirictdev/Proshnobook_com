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
        esModuleInterop: true,
        jsx: ts.JsxEmit.ReactJSX,
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
  editorial = load("lib/question-bank-editorial.ts"),
  batch = load("lib/question-bank-batch.ts", {
    "./admin-question-bank-schema": schema,
  }),
  docx = load("lib/question-bank-docx.ts");
test("offline Bijoy conversion, Unicode/English protection and literal formulas/images/numbers", () => {
  assert.equal(
    editorial.legacyToUnicode("Avgvi †mvbvi evsjv"),
    "আমার সোনার বাংলা",
  );
  const source =
    "Avgvi †mvbvi evsjv $x+2=4$ https://example.com/12 ![ছবি](/api/question-bank/images/test.webp) 123 ১২৩";
  const output = editorial.legacyToUnicode(source);
  assert.match(output, /আমার সোনার বাংলা/);
  assert.deepEqual(
    editorial.preservedLiterals(output),
    editorial.preservedLiterals(source),
  );
  assert.equal(
    editorial.legacyToUnicode("বাংলা English file download 123"),
    "বাংলা English file download 123",
  );
  assert.throws(() => editorial.legacyToUnicode("a".repeat(20001)));
  assert.ok(
    editorial.nearQuestionScore(
      "এই সংখ্যার প্রথম পাঁচটি গুণিতক নির্ণয় করো",
      "এই সংখ্যার প্রথম ছয়টি গুণিতক নির্ণয় করো",
    ) > 0.7,
  );
});
test("explicit text templates round trip all types, math marks, wrong keys/duplicates rejected", () => {
  for (const math of [true, false]) {
    const scope = {
        category: "Class 6",
        subject: math ? "গণিত" : "বিজ্ঞান",
        topic: "chapter",
      },
      parsed = batch.parseBankText(batch.bankTextTemplate(math), scope);
    assert.deepEqual(
      parsed.map((q) => q.type),
      ["MCQ", "SQ", "CQ"],
    );
    assert.deepEqual(
      batch.parseBankText(batch.toBankText(parsed), scope),
      parsed,
    );
    assert.deepEqual(
      Object.values(parsed[2].options.marks),
      math ? [2, 4, 4] : [1, 2, 3, 4],
    );
  }
  assert.throws(() =>
    batch.parseBankText("arbitrary question layout", {
      category: "x",
      subject: "s",
      topic: "t",
    }),
  );
  assert.throws(() =>
    batch.parseBankText(
      batch.bankTextTemplate().replace("Answer: A", "Answer: Z"),
      { category: "x", subject: "s", topic: "t" },
    ),
  );
  assert.throws(() =>
    batch.parseBankText(
      batch.bankTextTemplate().replace("A: ৪", "A: ৪\nA: ৩"),
      { category: "x", subject: "s", topic: "t" },
    ),
  );
});
const helperMocks = { "@/lib/guard": { admin: async () => ({ id: "admin" }) } };
const http = load("lib/question-bank-http.ts", helperMocks);
const template = load("app/api/admin/question-bank/template/route.ts", {
  "@/lib/guard": helperMocks["@/lib/guard"],
  "@/lib/question-bank-http": http,
  "@/lib/question-bank-batch": batch,
});
test("downloadable real DOCX/JSON templates; bounded Word extraction and ZIP bomb rejection", async () => {
  const response = await template.GET(
    new Request(
      "https://preview.e2b.app/api/admin/question-bank/template?format=docx&math=1",
    ),
  );
  assert.equal(response.status, 200);
  const buffer = Buffer.from(await response.arrayBuffer());
  docx.inspectBankDocx(buffer);
  const extracted = await docx.extractBankDocx(buffer, async () => {
    throw Error("no images expected");
  });
  assert.equal(
    batch.parseBankText(extracted.text, {
      category: "Class 6",
      subject: "গণিত",
      topic: "chapter",
    }).length,
    3,
  );
  const json = await (
    await template.GET(
      new Request(
        "https://preview.e2b.app/api/admin/question-bank/template?format=json",
      ),
    )
  ).json();
  assert.equal(json.items.length, 3);
  assert.throws(() => docx.inspectBankDocx(Buffer.from("not a zip")));
  const JSZip = require("jszip"),
    zip = await JSZip.loadAsync(buffer);
  zip.file("../traversal", "bad"); // Check an actual traversal entry, not a guessed filename.
  const malicious = await zip.generateAsync({ type: "nodebuffer" });
  assert.throws(() => docx.inspectBankDocx(malicious));
  const bomb = new JSZip();
  bomb.file("[Content_Types].xml", "x");
  bomb.file("word/document.xml", "x".repeat(9000000));
  const bombBytes = await bomb.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
  });
  assert.throws(() => docx.inspectBankDocx(bombBytes));
});
test("Word embedded image extraction uses only safe callback; external linked image is not fetched", async () => {
  const JSZip = require("jszip");
  const buffer = Buffer.from(
      await (
        await template.GET(new Request("https://preview.e2b.app/?format=docx"))
      ).arrayBuffer(),
    ),
    zip = await JSZip.loadAsync(buffer);
  let xml = await zip.file("word/document.xml").async("string");
  xml = xml.replace(
    "<w:body>",
    '<w:body><w:p><w:r><w:drawing><wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="rIdImg"/></pic:blipFill></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>',
  );
  zip.file("word/document.xml", xml);
  zip.file(
    "word/_rels/document.xml.rels",
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdImg" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image.png"/></Relationships>',
  );
  zip.file("word/media/image.png", Buffer.from("synthetic-image-data"));
  let types = await zip.file("[Content_Types].xml").async("string");
  types = types.replace(
    "</Types>",
    '<Default Extension="png" ContentType="image/png"/></Types>',
  );
  zip.file("[Content_Types].xml", types);
  let called = 0;
  const result = await docx.extractBankDocx(
    await zip.generateAsync({ type: "nodebuffer" }),
    async (b) => {
      called++;
      assert.equal(b.toString(), "synthetic-image-data");
      return images.questionImagePath("12345678-1234-4123-8123-123456789abc");
    },
  );
  assert.equal(called, 1);
  assert.equal(result.images.length, 1);
  assert.match(result.text, /!\[Word চিত্র 1\]/);
  zip.file(
    "word/_rels/document.xml.rels",
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdImg" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="https://evil.invalid/private.png" TargetMode="External"/></Relationships>',
  );
  await docx.extractBankDocx(
    await zip.generateAsync({ type: "nodebuffer" }),
    async () => {
      throw Error("must not save external data");
    },
  );
  assert.equal(called, 1);
});
test("optional correction protects literals; reviewed suggestions only, no answer generation", async () => {
  const assist = load("lib/question-bank-assist.ts", {
    "./question-bank-editorial": editorial,
  });
  let sent;
  const fake = async (url, options) => {
    sent = JSON.parse(options.body);
    return Response.json({
      choices: [
        {
          message: {
            content: JSON.stringify({
              suggestion: "সঠিক বানান $x=2$ 123",
              notes: "বানান সংশোধন",
            }),
          },
        },
      ],
    });
  };
  const result = await assist.suggestBankCorrection(
    "সঠীক বানান $x=2$ 123",
    "synthetic",
    fake,
  );
  assert.match(result.suggestion, /সঠিক/);
  assert.equal(sent.max_tokens, 2000);
  assert.equal(sent.messages.length, 2);
  await assert.rejects(
    assist.suggestBankCorrection("সঠীক বানান $x=2$ 456", "synthetic", fake),
    /বাতিল/,
  );
  assert.ok(
    !assist.bankAssistSchema.safeParse({ text: "some text", consent: false })
      .success,
  );
});
test("new mutation and import endpoints are admin/same-origin gated; no guessed approval allowed", async () => {
  for (const file of [
    "app/api/admin/question-bank/import/route.ts",
    "app/api/admin/question-bank/assist/route.ts",
  ]) {
    const code = fs.readFileSync(file, "utf8");
    assert.match(code, /bankPostActor/);
    assert.match(code, /bankRequestBytes/);
  }
  const denied = load("lib/question-bank-http.ts", {
    "@/lib/guard": {
      admin: async () => {
        throw Error("denied");
      },
    },
  });
  await assert.rejects(denied.bankPostActor(new Request("https://a.invalid")));
  await assert.rejects(
    http.bankPostActor(
      new Request("https://a.invalid", {
        method: "POST",
        headers: {
          Origin: "https://evil.invalid",
          "Content-Type": "application/json",
        },
      }),
    ),
  );
  await assert.rejects(
    http.bankRequestBytes(
      new Request("https://a.invalid", {
        method: "POST",
        body: "x".repeat(200),
      }),
      100,
    ),
  );
  assert.ok(
    schema.bankMutationSchema.safeParse({
      operation: "rollback",
      id: "q",
      revision: "a".repeat(64),
      snapshotKey: "key",
      version: "before",
    }).success,
  );
});
test("batch check is read-only; saves Pending with stable IDs, receipts and truthful retries", async () => {
  const rows = new Map(),
    settings = new Map();
  let creates = 0;
  const db = {
    question: {
      findMany: async () => [...rows.values()],
      findUnique: async ({ where }) => rows.get(where.id),
    },
    setting: {
      upsert: async ({ where, create, update }) =>
        settings.set(
          where.key,
          settings.has(where.key) ? { key: where.key, ...update } : create,
        ),
    },
  };
  const actor = {
    bankPostActor: async () => ({ id: "admin" }),
    bankReply: http.bankReply,
    bankRequestBytes: http.bankRequestBytes,
  };
  const route = load("app/api/admin/question-bank/import/route.ts", {
    "@/lib/db": { db },
    "@/lib/question-bank-http": actor,
    "@/lib/admin-question-bank-schema": schema,
    "@/lib/admin-question-bank": {
      mutateBank: async (owner, command, context) => {
        assert.equal(owner, "admin");
        assert.equal(command.operation, "create");
        assert.match(context.source, /ADMIN_UPLOAD:/);
        rows.set(context.id, {
          id: context.id,
          ...command.draft,
          source: context.source,
          approved: false,
        });
        creates++;
      },
    },
    "@/lib/question-bank-docx": docx,
    "@/lib/question-bank-batch": batch,
    "@/lib/question-json-import": {
      parseQuestionUpload() {
        throw Error("unused");
      },
    },
    "@/lib/nctb-data": { NCTB_CLASSES: [] },
    "@/lib/question-bank-editorial": editorial,
    "next/cache": { revalidatePath() {} },
  });
  const items = batch
    .parseBankText(batch.bankTextTemplate(true), {
      category: "Class 6",
      subject: "গণিত",
      topic: "chapter",
    })
    .map((draft, i) => ({
      draft,
      entryId: `12345678-1234-4123-8123-123456789ab${i}`,
    }));
  const payload = {
    action: "check",
    batchId: "12345678-1234-4123-8123-123456789abc",
    fileName: "test.docx",
    reviewed: false,
    items,
  };
  const request = (body) =>
    route.POST(
      new Request("https://preview.e2b.app/api/admin/question-bank/import", {
        method: "POST",
        headers: {
          Origin: "https://preview.e2b.app",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }),
    );
  assert.equal((await request(payload)).status, 200);
  assert.equal(creates, 0);
  assert.equal((await request({ ...payload, action: "save" })).status, 400);
  let result = await (
    await request({ ...payload, action: "save", reviewed: true })
  ).json();
  assert.equal(result.inserted, 3);
  assert.equal(result.status, "PENDING_NOT_PUBLISHED");
  assert.ok([...rows.values()].every((q) => q.approved === false));
  const first = [...rows.values()][0];
  first.text = "Admin changed and moved this question";
  first.topic = "Another chapter";
  result = await (
    await request({ ...payload, action: "save", reviewed: true })
  ).json();
  assert.equal(result.inserted, 0);
  assert.equal(result.skipped, 3);
  assert.equal(creates, 3);
  assert.equal(first.text, "Admin changed and moved this question");
  assert.equal(
    (await request({ ...payload, items: [items[0], items[0]] })).status,
    400,
  );
  assert.equal(
    (
      await request({
        ...payload,
        items: [{ ...items[0], draft: { ...items[0].draft, approved: true } }],
      })
    ).status,
    400,
  );
});
test("correction quota requires consent/configuration and never auto-saves or approves", async () => {
  const settings = new Map();
  let spent = 0;
  const tx = {
    setting: {
      findUnique: async ({ where }) => settings.get(where.key),
      create: async ({ data }) => settings.set(data.key, data),
      update: async ({ where, data }) =>
        settings.set(where.key, { key: where.key, ...data }),
    },
  };
  const assist = load("lib/question-bank-assist.ts", {
    "./question-bank-editorial": editorial,
  });
  const route = load("app/api/admin/question-bank/assist/route.ts", {
    "@/lib/question-bank-http": {
      ...http,
      bankPostActor: async () => ({ id: "admin" }),
    },
    "@/lib/question-bank-assist": {
      ...assist,
      suggestBankCorrection: async () => {
        spent++;
        return { suggestion: "সংশোধিত টেক্সট", notes: "বানান" };
      },
    },
    "@/lib/db": { db: { $transaction: async (fn) => fn(tx) } },
  });
  const post = (consent) =>
    route.POST(
      new Request("https://preview.e2b.app/api/admin/question-bank/assist", {
        method: "POST",
        headers: {
          Origin: "https://preview.e2b.app",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: "মূল টেক্সট", consent }),
      }),
    );
  const old = process.env.DEEPSEEK_API_KEY;
  delete process.env.DEEPSEEK_API_KEY;
  try {
    assert.equal((await post(true)).status, 503);
    assert.equal(settings.size, 0);
    process.env.DEEPSEEK_API_KEY = "synthetic-key";
    assert.equal((await post(false)).status, 400);
    assert.equal(settings.size, 0);
    assert.equal((await post(true)).status, 200);
    assert.equal((await post(true)).status, 200);
    assert.equal((await post(true)).status, 400);
    assert.equal(spent, 2);
  } finally {
    if (old === undefined) delete process.env.DEEPSEEK_API_KEY;
    else process.env.DEEPSEEK_API_KEY = old;
  }
});
