const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  Module = require("node:module"),
  ts = require("typescript"),
  JSZip = require("jszip");
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
  batch = load("lib/question-bank-batch.ts", {
    "./admin-question-bank-schema": schema,
  }),
  large = load("lib/question-bank-large-file.ts", {
    "./admin-question-bank-schema": schema,
    "./question-bank-batch": batch,
    "./question-bank-images": images,
  }),
  zip = load("lib/question-bank-zip-browser.ts", {
    "./question-bank-large-file": large,
  });
const scope = { category: "Class 6", subject: "গণিত", topic: "সংখ্যা" };
function sq(text = "প্রশ্ন") {
  return {
    ...scope,
    type: "SQ",
    lang: "Bangla",
    difficulty: "EASY",
    text,
    explanation: "সমাধান",
    correct: "",
    options: {},
  };
}
async function docx(text, extra = {}) {
  const z = new JSZip();
  z.file(
    "[Content_Types].xml",
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
  );
  z.file(
    "_rels/.rels",
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
  );
  const xml = text
    .split("\n")
    .map(
      (line) =>
        `<w:p><w:r><w:t xml:space="preserve">${line.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</w:t></w:r></w:p>`,
    )
    .join("");
  z.file(
    "word/document.xml",
    `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${xml}</w:body></w:document>`,
  );
  for (const [name, value] of Object.entries(extra)) z.file(name, value);
  return z.generateAsync({ type: "arraybuffer", compression: "STORE" });
}
async function runWorker(data) {
  const originalPost = Object.getOwnPropertyDescriptor(global, "postMessage"),
    originalMessage = Object.getOwnPropertyDescriptor(global, "onmessage");
  let result, error;
  const progress = [];
  global.postMessage = (message) => {
    if (message.kind === "done") result = message.result;
    if (message.kind === "error") error = Error(message.error);
    if (message.kind === "progress") progress.push(message.value);
  };
  try {
    load("workers/question-bank-file.worker.ts", {
      "../lib/question-bank-zip-browser": zip,
      "../lib/question-bank-large-file": large,
      "../lib/question-bank-batch": batch,
    });
    await global.onmessage({ data });
    if (error) throw error;
    assert.ok(result);
    return { result, progress };
  } finally {
    if (originalPost)
      Object.defineProperty(global, "postMessage", originalPost);
    else delete global.postMessage;
    if (originalMessage)
      Object.defineProperty(global, "onmessage", originalMessage);
    else delete global.onmessage;
  }
}
test("TXT/JSON formats and UTF-8/UTF-16 BOMs; file chooser is not restricted to DOCX MIME", () => {
  for (const [name, type] of [
    ["book.DOCX", "docx"],
    ["book.JSON", "json"],
    ["book.txt", "txt"],
  ])
    assert.equal(large.bankFileFormat(name), type);
  assert.throws(() => large.bankFileFormat("book.doc"));
  assert.throws(() => large.bankFileFormat("book.pdf"));
  const text = "বাংলা $x=2$";
  assert.equal(
    large.decodeBankText(new TextEncoder().encode("\uFEFF" + text)),
    text,
  );
  assert.equal(
    large.decodeBankText(
      Buffer.concat([Buffer.from([255, 254]), Buffer.from(text, "utf16le")]),
    ),
    text,
  );
  assert.throws(() =>
    large.decodeBankText(Uint8Array.from([0xff, 0xff, 0xff])),
  );
  const source = fs.readFileSync(
    "app/admin/questions/bank/import/workspace.tsx",
    "utf8",
  );
  assert.match(source, /accept=\{fileFilter\s*\|\|\s*undefined\}/);
  assert.match(source, /নির্বাচিত ফাইলের অবস্থা/);
});
test("large staging stays separate from server 100-item limits; chunk count and UTF-8 byte ceilings", () => {
  const items = Array.from({ length: 605 }, (_, i) => sq("প্রশ্ন " + i));
  assert.equal(
    large.parseBankDocument(JSON.stringify({ items }), scope, "json").length,
    605,
  );
  const raw = batch.toBankText(items);
  assert.equal(large.parseBankDocument(raw, scope, "txt").length, 605);
  assert.throws(() => batch.parseBankText(raw, scope));
  assert.deepEqual(
    large
      .bankImportChunks(
        items.map((draft, i) => ({ entryId: String(i), draft })),
      )
      .map((x) => x.length),
    [100, 100, 100, 100, 100, 100, 5],
  );
  const long = Array.from({ length: 30 }, (_, i) => ({
    entryId: String(i),
    draft: { ...sq(), text: "ব".repeat(12000), explanation: "ব".repeat(20000) },
  }));
  for (const chunk of large.bankImportChunks(long))
    assert.ok(
      new TextEncoder().encode(JSON.stringify({ items: chunk })).byteLength <
        801024,
    );
  assert.throws(() =>
    large.parseBankDocument(
      JSON.stringify(Array.from({ length: 10001 }, () => sq())),
      scope,
      "json",
    ),
  );
  const repeated = items.map((draft, i) => ({ entryId: String(i), draft }));
  repeated[101].draft = repeated[0].draft;
  assert.ok(large.markCrossChunkDuplicates(repeated).has("101"));
});
test("JSON templates, exports and legacy parts are read without accepting approval/source claims", () => {
  const value = {
    ...sq(),
    approved: true,
    id: "untrusted",
    source: "APPROVED",
    createdAt: "anything",
    revision: "anything",
  };
  const parsed = large.parseBankDocument(
    JSON.stringify({ items: [value] }),
    scope,
    "json",
  )[0];
  assert.equal(parsed.approved, undefined);
  assert.equal(parsed.source, undefined);
  assert.equal(parsed.id, undefined);
  const cq = {
    type: "CQ",
    text: "উদ্দীপক",
    explanation: "সমাধান",
    parts: [
      { label: "ক", question: "প্রথম", solution: "সমাধান", marks: 2 },
      { label: "খ", question: "দ্বিতীয়", solution: "সমাধান", marks: 4 },
      { label: "গ", question: "তৃতীয়", solution: "সমাধান", marks: 4 },
    ],
  };
  assert.equal(
    large.parseBankDocument(JSON.stringify({ items: [cq] }), scope, "json")[0]
      .options.marks.k,
    2,
  );
  cq.parts[0].label = "ঘ";
  assert.throws(() =>
    large.parseBankDocument(JSON.stringify({ items: [cq] }), scope, "json"),
  );
  assert.throws(
    () => large.parseBankDocument("bad json", scope, "json"),
    /JSON syntax/,
  );
});
test("synthetic 600-page-equivalent DOCX above old 4 MB limit is actually extracted and stages 600 questions", async () => {
  const text = batch.toBankText(
    Array.from({ length: 600 }, (_, i) =>
      sq(`পৃষ্ঠা ${i + 1} ` + "ব".repeat(3000)),
    ),
  );
  const bytes = await docx(text);
  assert.ok(bytes.byteLength > 4_000_000);
  assert.ok(bytes.byteLength < large.BANK_FILE_MAX_BYTES);
  const file = new File([bytes], "synthetic-600-pages.docx", {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  const { result, progress } = await runWorker({
    kind: "file",
    file,
    scope,
    includeImages: false,
  });
  assert.equal(result.items.length, 600);
  assert.match(result.text, /পৃষ্ঠা 600/);
  assert.ok(progress.some((p) => p.phase.includes("ZIP")));
  assert.ok(result.batchId);
});
test("a selected file is read even before scope selection; malformed/unstructured text remains recoverable", async () => {
  const file = new File(
    ["plain unstructured text without a question template"],
    "book.txt",
    { type: "application/octet-stream" },
  );
  const { result } = await runWorker({
    kind: "file",
    file,
    scope: { category: "Class 6", subject: "", topic: "" },
    includeImages: false,
  });
  assert.equal(result.items.length, 0);
  assert.match(result.text, /plain unstructured/);
  assert.match(result.warnings.join(" "), /ফাইল পড়া হয়েছে/);
  const json = new File([JSON.stringify({ items: [sq()] })], "book.json", {
    type: "application/octet-stream",
  });
  const parsed = await runWorker({
    kind: "file",
    file: json,
    scope,
    includeImages: false,
  });
  assert.equal(parsed.result.items.length, 1);
});
test("browser DOCX guard rejects traversal, encryption and dishonest expanded sizes", async () => {
  const unsafe = await docx("hello", { "../escape.txt": "bad" });
  await assert.rejects(zip.inspectLargeBankDocx(unsafe, () => {}));
  const bytes = await docx("hello"),
    view = new DataView(bytes);
  let central = -1;
  for (let i = 0; i < bytes.byteLength - 46; i++)
    if (view.getUint32(i, true) === 0x02014b50) {
      central = i;
      break;
    }
  assert.ok(central > 0);
  const encrypted = bytes.slice(0);
  new DataView(encrypted).setUint16(central + 8, 1, true);
  await assert.rejects(zip.inspectLargeBankDocx(encrypted, () => {}));
  view.setUint32(central + 24, 1, true);
  await assert.rejects(zip.inspectLargeBankDocx(bytes, () => {}));
});
