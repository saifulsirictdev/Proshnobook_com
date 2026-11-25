const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const Module = require("node:module");
const { execFileSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (id, parent, ...rest) {
  return origResolve.call(
    this,
    id.startsWith("@/") ? path.join(root, id.slice(2)) : id,
    parent,
    ...rest,
  );
};
require.extensions[".ts"] = (m, f) =>
  m._compile(
    ts.transpileModule(fs.readFileSync(f, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText,
    f,
  );
require.extensions[".tsx"] = require.extensions[".ts"];

const clean = require("../lib/chemistry-text-clean");

test("isChemistrySubject matches NFC/variant Bangla Chemistry labels only", () => {
  assert.equal(clean.isChemistrySubject("রসায়ন"), true);
  assert.equal(clean.isChemistrySubject(" রসায়ন "), true);
  assert.equal(clean.isChemistrySubject("পদার্থবিজ্ঞান"), false);
  assert.equal(clean.isChemistrySubject("গণিত"), false);
  assert.equal(clean.isChemistrySubject(""), false);
  assert.equal(clean.isChemistrySubject(null), false);
});

test("cleanChemistryText fixes jammed Chemistry Bangla without corrupting formulas, URLs, tables, or vowel signs", () => {
  const cases = [
    [
      "মৌলের প্রোটনসংখ্যা11হলে যোজনী1।অবস্থাননির্ণয়ের নিয়ম এবং পরিচিতপ্রধান সক্রিয়ধাতুর বৈশিষ্ট্য কী?",
      "মৌলের প্রোটনসংখ্যা 11 হলে যোজনী 1। অবস্থান নির্ণয়ের নিয়ম এবং পরিচিত প্রধান সক্রিয় ধাতুর বৈশিষ্ট্য কী?",
    ],
    [
      "উদ্দীপকের যৌগটির আণবিকসংকেত(NH4)2SO4এবং আণবিকসমযোজীঅ-ইলেকট্রোলাইটহিসেবে কাজ করে।",
      "উদ্দীপকের যৌগটির আণবিক সংকেত (NH4)2SO4 এবং আণবিক সমযোজী অ-ইলেকট্রোলাইট হিসেবে কাজ করে।",
    ],
    [
      "![প্রশ্নের চিত্র](https://proshnobook.com/question-bank/ssc-chemistry-ch4-v1/ie-01.svg)\n30মৌলের1মআয়নীকরণব্যতিক্রম এবং2য়পর্যায়ের তুলনা।",
      "![প্রশ্নের চিত্র](https://proshnobook.com/question-bank/ssc-chemistry-ch4-v1/ie-01.svg)\n30 মৌলের 1ম আয়নীকরণ ব্যতিক্রম এবং 2য় পর্যায়ের তুলনা।",
    ],
    [
      "গলনাঙ্ক(°C), নিঃসঙ্গ জোড়া(2−2×1) এবং ΔH=Hউৎপাদ−Hবিক্রিয়ক অপরিবর্তিত থাকে।",
      "গলনাঙ্ক(°C), নিঃসঙ্গ জোড়া(2−2×1) এবং ΔH=Hউৎপাদ−Hবিক্রিয়ক অপরিবর্তিত থাকে।",
    ],
  ];

  for (const [raw, expected] of cases) {
    assert.equal(clean.cleanChemistryText(raw), expected);
  }

  const pyOut = JSON.parse(
    execFileSync(
      "python3",
      [
        "-c",
        `import json, sys; sys.path.insert(0, "scripts/question-bank"); from chemistry_spacing import clean_chemistry_text; print(json.dumps([clean_chemistry_text(s) for s in json.loads(sys.stdin.read())], ensure_ascii=False))`,
      ],
      {
        cwd: root,
        input: JSON.stringify(cases.map(([raw]) => raw)),
        encoding: "utf8",
      },
    ),
  );
  cases.forEach(([, expected], idx) => assert.equal(pyOut[idx], expected));
});

test("all 8110 canonical SSC Chemistry records contain zero orphaned Bengali dependent vowel or nukta signs", () => {
  const orphanRe = /(?<=[\sA-Za-z0-9])[\u0981-\u0983\u09bc\u09be-\u09cd\u09d7]/;
  let count = 0;
  for (let ch = 1; ch <= 12; ch++) {
    const mod = require(
      `../lib/ssc-chemistry-${ch === 1 ? "batches" : `ch${ch}-batches`}.ts`,
    );
    const batches =
      mod[ch === 1 ? "sscChemistryBatches" : `sscChemistryChapter${ch}Batches`]();
    for (const batch of batches) {
      for (const r of batch.records) {
        count++;
        for (const s of [r.text, r.explanation]) {
          assert.doesNotMatch(s, orphanRe, `${batch.id}: ${s}`);
        }
        const o = r.options || {};
        for (const k of ["A", "B", "C", "D", "stimulus"]) {
          if (typeof o[k] === "string")
            assert.doesNotMatch(o[k], orphanRe, `${batch.id}.${k}`);
        }
        if (o.subQuestions) {
          for (const [k, v] of Object.entries(o.subQuestions)) {
            if (typeof v === "string")
              assert.doesNotMatch(v, orphanRe, `${batch.id}.sub.${k}`);
          }
        }
      }
    }
  }
  assert.equal(count, 8110);
});

test("cleanChemistryOptionsValue cleans CQ subQuestions objects while preserving _provenance and _authoring", () => {
  const prov = [{ kind: "board", board: "dhaka", examYear: 2024 }];
  const authMeta = { kind: "authored-practice", family: "lewis-cq" };
  const raw = {
    stimulus: "উদ্দীপকের যৌগটির আণবিকসংকেত(NH4)2SO4।",
    subQuestions: {
      k: "অবন্ধনীইলেকট্রন কী?",
      kh: "অষ্টকনিয়ম ব্যাখ্যা করো।",
      g: "আয়নিকসংকেত নির্ণয় করো।",
      gh: "গলনাঙ্ক(°C) বিশ্লেষণ করো।",
    },
    marks: { k: 1, kh: 2, g: 3, gh: 4 },
    _provenance: prov,
    _authoring: authMeta,
  };
  const cleaned = clean.cleanChemistryOptionsValue(raw);
  assert.equal(
    cleaned.stimulus,
    "উদ্দীপকের যৌগটির আণবিক সংকেত (NH4)2SO4।",
  );
  assert.equal(cleaned.subQuestions.k, "অবন্ধনী ইলেকট্রন কী?");
  assert.equal(cleaned.subQuestions.kh, "অষ্টক নিয়ম ব্যাখ্যা করো।");
  assert.deepEqual(cleaned.marks, { k: 1, kh: 2, g: 3, gh: 4 });
  assert.strictEqual(cleaned._provenance, prov);
  assert.strictEqual(cleaned._authoring, authMeta);
});

test("scenario de-clustering interleaves repeated template families and diversifies 25-MCQ Chemistry Auto Model papers", () => {
  const sample = [
    { id: "1", text: "মৌল X-এর পারমাণবিক সংখ্যা 11 হলে গ্রুপ কত?" },
    { id: "2", text: "মৌল Y-এর পারমাণবিক সংখ্যা 19 হলে গ্রুপ কত?" },
    { id: "3", text: "মৌল Z-এর পারমাণবিক সংখ্যা 12 হলে গ্রুপ কত?" },
    { id: "4", text: "যৌগ NaCl-এর গলনাঙ্ক বেশি কেন?" },
    { id: "5", text: "যৌগ MgO-এর গলনাঙ্ক বেশি কেন?" },
  ];
  const interleaved = clean.interleaveByChemistryScenario(sample);
  assert.equal(interleaved.length, 5);
  assert.notEqual(
    clean.chemistryScenarioSignature(interleaved[0]),
    clean.chemistryScenarioSignature(interleaved[1]),
  );

  const autoModel = require("../lib/auto-model.ts");
  const pol = require("../lib/subject-model-policy.ts");
  const policy = pol.subjectModelPolicy("SSC", "রসায়ন");
  const batches = [];
  for (let ch = 1; ch <= 12; ch++) {
    const mod = require(
      `../lib/ssc-chemistry-${ch === 1 ? "batches" : `ch${ch}-batches`}.ts`,
    );
    batches.push(
      ...mod[
        ch === 1 ? "sscChemistryBatches" : `sscChemistryChapter${ch}Batches`
      ](),
    );
  }
  const stock = batches.flatMap((batch) =>
    batch.records.map((q, i) => ({
      ...q,
      id: `fixture:${batch.id}:${i}`,
      topic: batch.topic,
      subject: batch.subject,
      category: batch.category,
    })),
  );
  const byId = new Map(stock.map((q) => [q.id, q]));
  let n = 42;
  const rng = () => ((n = (n * 1664525 + 1013904223) >>> 0) / 4294967296);
  const res = autoModel.assembleSubjectAutoModel(
    stock,
    "SSC",
    "রসায়ন",
    "MCQ",
    rng,
  );
  assert.equal(res.ok, true);
  assert.equal(res.ids.length, 25);
  // Within every chapter that contributes 2 or 3 MCQs, distinct families are chosen when available.
  for (const topic of policy.chapters) {
    const picked = res.ids.map((id) => byId.get(id)).filter((q) => q.topic === topic);
    const sigs = picked.map((q) => clean.chemistryScenarioSignature(q));
    assert.equal(new Set(sigs).size, picked.length, `Duplicate family in ${topic}: ${sigs}`);
  }
});

test("paid builder API and DB exam generator clean legacy jammed Chemistry rows at read-time without touching Math", async () => {
  function loadRoute(file, mocks) {
    const full = path.join(root, file);
    const m = new Module(full, module);
    m.paths = Module._nodeModulePaths(path.dirname(full));
    m.require = (id) => (Object.hasOwn(mocks, id) ? mocks[id] : require(id));
    m._compile(
      ts.transpileModule(fs.readFileSync(full, "utf8"), {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
          esModuleInterop: true,
        },
      }).outputText,
      full,
    );
    return m.exports;
  }

  const qbApi = loadRoute("app/api/qb/questions/route.ts", {
    "@/auth": { auth: async () => ({ user: { id: "t1", role: "TEACHER" } }) },
    "@/lib/wallet": { requirePaidQuestions: async () => {} },
    "@/lib/paper-generation": { visibleQuestions: () => ({ approved: true }) },
    "@/lib/db": {
      db: {
        question: {
          findMany: async () => [
            {
              id: "chem-cq-1",
              text: "উদ্দীপকের যৌগটির আণবিকসংকেত(NH4)2SO4।",
              correct: "",
              explanation: "অষ্টকনিয়ম অনুসারে নমুনা সমাধান।",
              category: "Class 10",
              subject: "রসায়ন",
              topic: "৫ম অধ্যায়: রাসায়নিক বন্ধন",
              source: "Manual",
              approved: true,
              options: {
                stimulus: "উদ্দীপকের যৌগটির আণবিকসংকেত(NH4)2SO4।",
                subQuestions: {
                  k: "অবন্ধনীইলেকট্রন কী?",
                  kh: "অষ্টকনিয়ম ব্যাখ্যা করো।",
                  g: "আয়নিকসংকেত নির্ণয় করো।",
                  gh: "পরিবাহিতা বিশ্লেষণ করো।",
                },
              },
            },
          ],
        },
      },
    },
    "next/server": { NextResponse: { json: (data) => data } },
  });

  const qbRes = await qbApi.POST({ json: async () => ({ ids: ["chem-cq-1"] }) });
  assert.equal(
    qbRes.items[0].text,
    "উদ্দীপকের যৌগটির আণবিক সংকেত (NH4)2SO4।",
  );
  assert.equal(qbRes.items[0].subQuestions.k, "অবন্ধনী ইলেকট্রন কী?");

  const pickerSource = fs.readFileSync(
    path.join(root, "components/qb-picker.tsx"),
    "utf8",
  );
  assert.match(pickerSource, /<MathText\s+text=\{q\.text \|\| q\.stimulus \|\| ""\}/);
  assert.match(pickerSource, /String\(q\.stimulus\)\.trim\(\) !== String\(q\.text\)\.trim\(\)/);
});
