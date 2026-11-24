const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs");
const { load, dependencies } = require("./helpers/paper-editing.cjs");
const React = require("react"),
  { renderToStaticMarkup } = require("react-dom/server");
const fonts = dependencies["@/lib/paper-fonts"],
  margins = dependencies["@/lib/paper-margins"];
const format = dependencies["@/lib/paper-rich-format"];
const english = dependencies["@/lib/english/editable-text"];
const ready = load("lib/ready-papers.ts"),
  blocks = dependencies["./ready-text-block"];
const header = load("lib/paper-header.ts");
const model = load("lib/paper-builder.ts", {
  "@/lib/paper-header": header,
  "@/lib/paper-math": require("./helpers/paper-math.cjs"),
  "./auto-model-syllabus-schema": require("./helpers/auto-model-syllabus-schema.cjs"),
});
test("Normal and Narrow preserve paper dimensions, default Kalpurush and custom margins roundtrip", () => {
  const normal = model.defaults(),
    narrow = model.restoreSettings({
      ...normal,
      cfg: { ...normal.cfg, ...margins.paperMarginPresets.narrow },
    });
  assert.equal(normal.cfg.font, "kalpurush");
  assert.equal(margins.paperMarginMode(normal.cfg), "normal");
  assert.equal(margins.paperMarginMode(narrow.cfg), "narrow");
  assert.deepEqual(
    model.paperDimensions(normal),
    model.paperDimensions(narrow),
  );
  assert.ok(narrow.cfg.marginLeft < normal.cfg.marginLeft);
  assert.equal(
    margins.paperMarginMode({ ...normal.cfg, marginLeft: 40 }),
    "custom",
  );
});
test("rich font, size, color and alignment use closed values; malformed CSS and HTML never execute", () => {
  for (const tag of [
    "font=kalpurush",
    "size=18",
    "color=#ff0033",
    "align=center",
  ])
    assert.ok(format.richFormatStyle(tag));
  for (const tag of [
    "font=__proto__",
    "font=Arial",
    "size=999",
    "color=url(javascript:x)",
    "align=expression(x)",
    "style=display:none",
  ])
    assert.equal(format.richFormatStyle(tag), null);
  const Rich = load("components/paper-builder/rich-paper-text.tsx", {
    "@/lib/paper-builder": { preparePaperMath: (s) => s },
    "@/components/MathText": ({ text }) =>
      React.createElement("span", null, text),
  }).default;
  const html = renderToStaticMarkup(
    React.createElement(Rich, {
      text: "[font=kalpurush][size=18][color=#ff0033][b]বাংলা[/b][/color][/size][/font][align=center]মধ্য[/align]<img onerror=x>",
    }),
  );
  assert.match(html, /QmPaperKalpurush/);
  assert.match(html, /font-size:18px/);
  assert.match(html, /color:#ff0033/);
  assert.match(html, /text-align:center/);
  assert.match(html, /<strong>/);
  assert.doesNotMatch(html, /<img/);
});
test("rich markers with multiple equals signs are rejected as malformed", () => {
  assert.equal(format.richFormatStyle("font=kalpurush=extra"), null);
  assert.equal(format.richFormatStyle("size=18=20"), null);
  assert.equal(format.richFormatStyle("color=#ff0000=x"), null);
  assert.ok(format.richFormatStyle("font=kalpurush"));
});
test("text boxes must stay inside the page bounds; valid boxes still parse", () => {
  const base = { ...ready.freshEdit(), texts: [{ x: 0.1, y: 0.1, text: "ok", size: 20 }] };
  assert.ok(ready.pageEditSchema.safeParse(base).success);
  assert.ok(
    ready.pageEditSchema.safeParse({
      ...base,
      texts: [{ x: 0.9, y: 0.1, w: 0.2, text: "over", size: 20 }],
    }).success === false,
  );
  assert.ok(
    ready.pageEditSchema.safeParse({
      ...base,
      texts: [{ x: 0.9, y: 0.9, w: 0.1, h: 0.1, text: "corner", size: 20 }],
    }).success,
  );
});
const q = {
  id: "e",
  text: "Instruction",
  englishGroup: {
    passages: [{ key: "p", text: "Passage" }],
    tasks: [
      {
        id: "task",
        number: 1,
        marks: 10,
        instruction: "Instruction",
        clues: ["Clue"],
        table: { headers: ["Header"], rows: [["Cell"]] },
        subitems: [
          { text: "Subquestion", options: ["Option"], answer: "Correct" },
        ],
        answer: "Original answer",
      },
    ],
  },
};
test("full English editor enumerates passage, instruction, clues, table, subquestion and options without answer editing", () => {
  assert.deepEqual(
    english.englishTextFields(q.englishGroup).map((f) => f.value),
    [
      "Passage",
      "Instruction",
      "Clue",
      "Header",
      "Cell",
      "Subquestion",
      "Option",
    ],
  );
});
test("English text edits persist, preserve task IDs, marks, source grouping, answer arrays and originals", () => {
  const before = JSON.stringify(q);
  const settings = model.restoreSettings({
    edits: {
      e: {
        text: q.text,
        englishText: {
          "p.0": "Edited passage",
          "t.0.instruction": "Edited instruction",
          "t.0.sub.0": "Edited sub",
          "t.0.option.0.0": "Edited option",
          "t.0.answer": "HACK",
        },
      },
    },
  });
  const restored = model.restoreSettings(JSON.parse(JSON.stringify(settings)));
  const edited = english.applyEnglishTextEdits(q, restored.edits.e.englishText);
  assert.equal(edited.englishGroup.passages[0].text, "Edited passage");
  assert.equal(edited.text, "Edited instruction");
  assert.equal(
    edited.englishGroup.tasks[0].subitems[0].options[0],
    "Edited option",
  );
  assert.equal(edited.englishGroup.tasks[0].subitems[0].answer, "Correct");
  assert.equal(edited.englishGroup.tasks[0].answer, "Original answer");
  assert.equal(edited.englishGroup.tasks[0].marks, 10);
  assert.equal(JSON.stringify(q), before);
});
test("legacy scan overlays survive and full multiline replacement styles are validated and saved", () => {
  const old = {
    ...ready.freshEdit(),
    texts: [{ x: 0.1, y: 0.2, text: "Old", size: 20 }],
  };
  assert.ok(ready.pageEditSchema.safeParse(old).success);
  const modern = {
    ...old,
    texts: [
      {
        x: 0.1,
        y: 0.2,
        w: 0.7,
        h: 0.4,
        text: "উদ্দীপক\nপ্রশ্ন\nক. একটি অপশন",
        size: 18,
        style: { bold: true, color: "#ff0000", align: "center" },
      },
    ],
  };
  assert.deepEqual(
    ready.pageEditSchema.parse(JSON.parse(JSON.stringify(modern))),
    modern,
  );
  assert.equal(
    ready.pageEditSchema.safeParse({
      ...modern,
      texts: [{ ...modern.texts[0], style: { color: "url(x)" } }],
    }).success,
    false,
  );
});
test("scan replacement wraps graphemes without horizontal shrinking and refuses overflowing text", () => {
  const lines = blocks.wrapReadyText(
    "বাংলা প্রশ্ন\nSecond line",
    60,
    (s) => [...s].length * 10,
  );
  assert.ok(lines.length >= 3);
  const calls = [];
  const ctx = {
    save() {},
    restore() {},
    measureText: (s) => ({ width: s.length * 10 }),
    fillText: (...a) => calls.push(a),
    fillRect() {},
  };
  blocks.drawReadyText(
    ctx,
    {
      x: 0.1,
      y: 0.1,
      w: 0.8,
      h: 0.8,
      text: "One\nTwo",
      size: 20,
      style: { align: "center", bold: true },
    },
    800,
    1000,
    "serif",
  );
  assert.equal(calls.length, 2);
  assert.equal(calls[0].length, 3, "no fillText maxWidth compression");
  assert.throws(
    () =>
      blocks.drawReadyText(
        ctx,
        { x: 0, y: 0, w: 0.1, h: 0.001, text: "This cannot fit", size: 60 },
        800,
        1000,
        "serif",
      ),
    /ধরছে না/,
  );
});
function replacement({
  user = { id: "u", role: "TEACHER" },
  paid = true,
  candidates,
  quote = { total: 0, unpaid: [] },
} = {}) {
  let dbCalls = 0,
    loaded = [];
  const original = {
    id: "a",
    approved: true,
    category: "SSC",
    subject: "Math",
    topic: "Numbers",
    text: "Original",
    correct: "A",
    options: {},
  };
  const api = load("app/api/qb/replacement/route.ts", {
    "@/auth": { auth: async () => ({ user }) },
    "@/lib/wallet": {
      requirePaidQuestions: async () => {
        if (!paid) throw Error("unpaid");
      },
      walletTransaction: async (fn) => fn({}),
      quoteInTransaction: async () => quote,
    },
    "@/lib/db": {
      db: {
        question: {
          findFirst: async () => {
            dbCalls++;
            return original;
          },
          findMany: async () =>
            candidates || [
              { ...original, id: "b", text: "PAID BODY" },
              { ...original, id: "c", text: "SECRET UNPAID BODY" },
            ],
        },
      },
    },
    "../questions/route": {
      POST: async (req) => {
        loaded = (await req.json()).ids;
        return Response.json({
          items: loaded.map((id) => ({ id, text: "PAID BODY" })),
        });
      },
    },
  });
  return {
    api,
    dbCalls: () => dbCalls,
    loaded: () => loaded,
    req: () =>
      new Request("http://local/api", {
        method: "POST",
        body: JSON.stringify({ id: "a", exclude: ["a"] }),
      }),
  };
}
test("replacement rejects anonymous, students and unpaid originals before database lookup", async () => {
  for (const options of [
    { user: null },
    { user: { id: "s", role: "STUDENT" } },
    { paid: false },
  ]) {
    const r = replacement(options);
    assert.ok([401, 402].includes((await r.api.POST(r.req())).status));
    assert.equal(r.dbCalls(), 0);
  }
});
test("replacement returns a chooser not a selected question; unpaid bodies never leave server", async () => {
  const r = replacement({
      quote: { total: 20, unpaid: [{ id: "c", price: 20 }] },
    }),
    res = await r.api.POST(r.req()),
    data = await res.json();
  assert.equal(res.status, 200);
  assert.deepEqual(r.loaded(), ["b"]);
  assert.equal(data.alternatives.length, 2);
  assert.equal(data.alternatives[0].item.text, "PAID BODY");
  assert.equal(data.alternatives[1].locked, true);
  assert.equal(data.alternatives[1].item, undefined);
  assert.doesNotMatch(JSON.stringify(data), /SECRET UNPAID BODY/);
  assert.equal(data.items, undefined);
});
test("replacement shortage gives no unrelated type fallback", async () => {
  const r = replacement({
    candidates: [
      { id: "z", correct: "", text: "Unrelated short", options: {} },
    ],
  });
  assert.equal((await r.api.POST(r.req())).status, 404);
  assert.deepEqual(r.loaded(), []);
});
test("studio does not mount marked panels and every lower preview action waits for save", () => {
  const s = fs.readFileSync("components/ready-papers/studio.tsx", "utf8");
  assert.doesNotMatch(
    s,
    /<AIAnswers|<AnswerAssistant|rp-phone-answer|onClick=\{preview\}/,
  );
  assert.match(s, /if \(await save\(\)\) await preview\(\)/);
  assert.match(s, /latestSaveIdentity.current !== previewIdentity/);
  assert.match(s, /await pendingAutoSave.current/);
  assert.match(s, /previewInFlight.current/);
  assert.match(s, /if\s*\(replacementBox\)/);
  assert.ok(fonts.paperFonts.kalpurush.includes("QmPaperKalpurush"));
});
