const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  Module = require("node:module"),
  ts = require("typescript"),
  React = require("react"),
  { JSDOM } = require("jsdom");
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
const schema = load("lib/question-bank-recovery-schema.ts"),
  Component = load("components/question-bank-recovery.tsx", {
    "@/lib/question-bank-recovery-schema": schema,
  }).default;
const blank = {
  category: "Class 6",
  subject: "গণিত",
  topic: "সংখ্যা",
  type: "MCQ",
  lang: "Bangla",
  difficulty: "EASY",
  text: "",
  explanation: "",
  correct: "A",
  options: { A: "", B: "", C: "", D: "" },
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function fixture() {
  const previous = {};
  for (const key of [
    "window",
    "document",
    "navigator",
    "localStorage",
    "fetch",
    "confirm",
    "IS_REACT_ACT_ENVIRONMENT",
  ])
    previous[key] = Object.getOwnPropertyDescriptor(global, key);
  const dom = new JSDOM('<div id="root"></div>', {
    url: "https://preview.e2b.app/admin/questions/bank",
  });
  for (const [key, value] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
    localStorage: dom.window.localStorage,
    confirm: () => true,
    IS_REACT_ACT_ENVIRONMENT: true,
  }))
    Object.defineProperty(global, key, {
      value,
      configurable: true,
      writable: true,
    });
  const { createRoot } = require("react-dom/client");
  const root = createRoot(document.getElementById("root")),
    ref = React.createRef();
  let props = {
      owner: "synthetic-admin",
      slot: "new",
      baseRevision: null,
      draft: blank,
      dirty: false,
      busy: false,
      restore: (d) => {
        restored = d;
      },
    },
    record = null,
    restored = null,
    fail = false,
    gate = null;
  const calls = [];
  global.fetch = async (url, options = {}) => {
    assert.ok(url.startsWith("/api/admin/question-bank/draft?slot="));
    const command = options.body ? JSON.parse(options.body) : null;
    calls.push(command);
    if (fail) throw Error("synthetic offline");
    if (command && gate) await gate;
    if (command?.operation === "save") {
      if (command.expectedRevision !== (record?.revision ?? null))
        return {
          ok: false,
          json: async () => ({ error: "synthetic conflict" }),
        };
      record = {
        version: 1,
        slot: "new",
        revision: crypto.randomUUID(),
        baseRevision: null,
        updatedAt: new Date().toISOString(),
        draft: command.draft,
      };
    }
    if (command?.operation === "discard") {
      if (command.expectedRevision !== record?.revision)
        return {
          ok: false,
          json: async () => ({ error: "synthetic conflict" }),
        };
      record = null;
    }
    return { ok: true, json: async () => ({ record }) };
  };
  async function render(next = {}) {
    props = { ...props, ...next };
    await React.act(async () => {
      root.render(React.createElement(Component, { ...props, ref }));
      await sleep(5);
    });
  }
  async function wait(ms) {
    await React.act(async () => {
      await sleep(ms);
    });
  }
  async function click(element) {
    assert.ok(element);
    await React.act(async () => {
      element.click();
      await sleep(5);
    });
  }
  async function close() {
    await React.act(async () => root.unmount());
    dom.window.close();
    for (const [key, descriptor] of Object.entries(previous)) {
      if (descriptor) Object.defineProperty(global, key, descriptor);
      else delete global[key];
    }
  }
  return {
    render,
    wait,
    click,
    close,
    ref,
    calls,
    get record() {
      return record;
    },
    get restored() {
      return restored;
    },
    setRecord: (v) => (record = v),
    setFail: (v) => (fail = v),
    setGate: (v) => (gate = v),
    text: () => document.body.textContent,
    button: (text) =>
      [...document.querySelectorAll("button")].find((b) =>
        b.textContent.includes(text),
      ),
    storage: dom.window.localStorage,
  };
}
test("UI autosaves incomplete content separately; offers recovery without silently applying it", async () => {
  const f = await fixture();
  try {
    await f.render();
    assert.match(f.text(), /Auto-save প্রস্তুত/);
    await f.render({
      draft: { ...blank, text: "অসম্পূর্ণ কিন্তু গুরুত্বপূর্ণ" },
      dirty: true,
    });
    await f.wait(1350);
    assert.equal(f.record.draft.text, "অসম্পূর্ণ কিন্তু গুরুত্বপূর্ণ");
    assert.match(f.text(), /Recovery server-এ সেভ হয়েছে/);
    assert.equal(f.storage.length, 0, "device persistence is opt-in");
    await f.render({ draft: blank, dirty: false });
    await f.wait(1350);
    assert.equal(
      f.record.draft.text,
      "",
      "undoing to a pristine editor updates earlier recovery too",
    );
    await f.render({
      draft: { ...blank, text: "অসম্পূর্ণ কিন্তু গুরুত্বপূর্ণ" },
      dirty: true,
    });
    await f.wait(1350);
    await f.click(f.button("Server recovery আবার"));
    assert.equal(f.restored, null);
    assert.match(f.text(), /Server recovery/);
    await f.click(f.button("Server recovery Editor-এ বসান"));
    assert.equal(f.restored.text, "অসম্পূর্ণ কিন্তু গুরুত্বপূর্ণ");
    assert.ok(
      f.calls.filter(Boolean).every((c) => c.operation === "save"),
      "no live Question save or approval",
    );
  } finally {
    await f.close();
  }
});
test("successful question save cleanup waits for in-flight recovery write then deletes its exact revision", async () => {
  const f = await fixture();
  try {
    await f.render();
    let release;
    f.setGate(new Promise((r) => (release = r)));
    await f.render({ draft: { ...blank, text: "শেষ খসড়া" }, dirty: true });
    await f.wait(1250);
    assert.equal(f.calls.filter((c) => c?.operation === "save").length, 1);
    let cleaned = false;
    const cleanup = f.ref.current
      .clearAfterSave()
      .then((result) => (cleaned = result));
    await f.wait(20);
    assert.equal(f.calls.filter((c) => c?.operation === "discard").length, 0);
    await React.act(async () => {
      release();
      await cleanup;
    });
    assert.equal(cleaned, true);
    assert.equal(f.record, null);
    await f.render({ draft: { ...blank, text: "পরে লেখা" }, dirty: true });
    await f.wait(1250);
    assert.equal(f.record, null, "no resurrection after cleanup");
  } finally {
    await f.close();
  }
});
test("device recovery opt-in works during network failure; offline recovery remains explicit and server writes stop", async () => {
  const f = await fixture();
  try {
    await f.render();
    await f.click(document.querySelector("input[type=checkbox]"));
    f.setFail(true);
    await f.render({
      draft: { ...blank, text: "অফলাইনে রাখা লেখা" },
      dirty: true,
    });
    await f.wait(500);
    const key = schema.deviceRecoveryKey("synthetic-admin", "new");
    assert.equal(
      JSON.parse(f.storage.getItem(key)).draft.text,
      "অফলাইনে রাখা লেখা",
    );
    await f.wait(900);
    assert.match(f.text(), /synthetic offline/);
    const count = f.calls.length;
    await f.wait(1300);
    assert.equal(f.calls.length, count, "no retry loop or false saved state");
    await f.click(f.button("Server recovery আবার"));
    assert.equal(f.restored, null);
    await f.click(f.button("এই ডিভাইস recovery Editor-এ বসান"));
    assert.equal(f.restored.text, "অফলাইনে রাখা লেখা");
  } finally {
    await f.close();
  }
});

test("a different writer pauses autosave and cannot be erased by stale post-save cleanup", async () => {
  const f = await fixture();
  try {
    const original = {
      version: 1,
      slot: "new",
      revision: crypto.randomUUID(),
      baseRevision: null,
      updatedAt: new Date().toISOString(),
      draft: { ...blank, text: "আগের recovery" },
    };
    f.setRecord(original);
    await f.render();
    assert.equal(f.restored, null);
    await f.click(f.button("Server recovery Editor-এ বসান"));
    const newer = {
      ...original,
      revision: crypto.randomUUID(),
      draft: { ...blank, text: "অন্য ট্যাবের নতুন লেখা" },
    };
    f.setRecord(newer);
    await f.render({
      draft: { ...blank, text: "এই ট্যাবের অসেভ লেখা" },
      dirty: true,
    });
    await f.wait(1350);
    assert.match(f.text(), /synthetic conflict/);
    const requests = f.calls.length;
    await f.wait(1250);
    assert.equal(f.calls.length, requests);
    let clean;
    await React.act(async () => {
      clean = await f.ref.current.clearAfterSave();
    });
    assert.equal(clean, false);
    assert.equal(f.record.draft.text, "অন্য ট্যাবের নতুন লেখা");
  } finally {
    await f.close();
  }
});
