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
  });
test("real Parse button reports missing inputs locally, stages pasted JSON, preserves earlier staging on invalid text and links to management", async () => {
  const dom = new JSDOM('<div id="root"></div>', {
      url: "https://fixture.test/admin/questions/bank/import",
    }),
    previous = {};
  const globals = {
    window: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
    IS_REACT_ACT_ENVIRONMENT: true,
    confirm: () => true,
    requestAnimationFrame: (callback) => {
      callback();
      return 1;
    },
  };
  for (const [key, value] of Object.entries(globals)) {
    previous[key] = Object.getOwnPropertyDescriptor(global, key);
    Object.defineProperty(global, key, {
      value,
      configurable: true,
      writable: true,
    });
  }
  dom.window.HTMLElement.prototype.scrollIntoView = function () {
    this.dataset.scrolled = "true";
  };
  let workerCalls = 0;
  const Component = load("app/admin/questions/bank/import/workspace.tsx", {
    "next/link": ({ children, ...props }) =>
      React.createElement("a", props, children),
    "@/lib/admin-question-bank-schema": schema,
    "@/lib/question-bank-batch": batch,
    "@/lib/question-bank-large-file": large,
    "@/lib/question-bank-file-client": {
      readBankFileInWorker: async (input) => {
        workerCalls++;
        let items = [],
          warnings = [];
        try {
          items = large.parseBankDocument(
            input.text,
            input.scope,
            input.format,
          );
        } catch (e) {
          warnings = [e.message];
        }
        return {
          text: input.text,
          items,
          warnings,
          batchId: "12345678-1234-4123-8123-123456789abc",
          fileName: "edited-template." + input.format,
          format: input.format,
        };
      },
    },
    "../workspace": {
      ScopeFields: ({ value, onChange }) =>
        React.createElement(
          "div",
          null,
          ...["category", "subject", "topic"].map((key) =>
            React.createElement("input", {
              key,
              "aria-label": key,
              value: value[key],
              onChange: (e) => onChange({ ...value, [key]: e.target.value }),
            }),
          ),
        ),
      Preview: ({ q }) =>
        React.createElement("div", null, q.text, q.explanation),
    },
    "@/components/question-bank-editorial-tools": () => null,
  }).default;
  const { createRoot } = require("react-dom/client"),
    root = createRoot(document.getElementById("root"));
  const click = async (text) => {
    const el = [...document.querySelectorAll("button")].find((el) =>
      el.textContent.includes(text),
    );
    assert.ok(el, text);
    await React.act(async () => {
      el.click();
      await new Promise((r) => setTimeout(r, 20));
    });
  };
  const change = async (label, value) => {
    const el = document.querySelector(`[aria-label="${label}"]`);
    assert.ok(el);
    const key = Object.keys(el).find((key) => key.startsWith("__reactProps"));
    await React.act(async () => {
      el[key].onChange({ target: { value } });
    });
  };
  const notice = () =>
    document.querySelector('[aria-label="টেক্সট Parse-এর ফল"]').textContent;
  try {
    await React.act(async () => root.render(React.createElement(Component)));
    await click("টেক্সট Parse করে");
    assert.match(notice(), /বিষয়.*অধ্যায়.*নির্বাচন/);
    assert.equal(workerCalls, 0);
    await change("subject", "গণিত");
    await change("topic", "সংখ্যা");
    await click("টেক্সট Parse করে");
    assert.match(notice(), /টেক্সট বক্স খালি/);
    const item = {
      type: "SQ",
      text: "পূর্ণ প্রশ্ন",
      explanation: "পূর্ণ উত্তর",
      options: {},
      correct: "",
      lang: "Bangla",
      difficulty: "EASY",
    };
    await change(
      "প্রশ্নব্যাচের টেক্সট",
      JSON.stringify({ items: [item, { ...item, text: "দ্বিতীয় প্রশ্ন" }] }),
    );
    await click("টেক্সট Parse করে");
    assert.equal(workerCalls, 1);
    assert.match(notice(), /2টি প্রশ্ন/);
    const heading = [...document.querySelectorAll("h2")].find((el) =>
      el.textContent.includes("৩. সংশোধন"),
    );
    assert.match(heading.textContent, /2টি/);
    assert.equal(heading.dataset.scrolled, "true");
    assert.equal(
      document.querySelectorAll('[aria-label$="নং প্রশ্নের টেক্সট"]').length,
      2,
    );
    const link = [...document.querySelectorAll("a")].find((el) =>
      el.textContent.includes("সেভ করা Pending"),
    );
    const url = new URL(link.href);
    assert.equal(url.searchParams.get("status"), "pending");
    assert.equal(url.searchParams.get("topic"), "সংখ্যা");
    await change("প্রশ্নব্যাচের টেক্সট", "not a question template");
    await click("টেক্সট Parse করে");
    assert.match(notice(), /Staging হয়নি/);
    assert.match(notice(), /\[MCQ\]/);
    assert.match(
      heading.textContent,
      /2টি/,
      "invalid parse must preserve earlier staging",
    );
    await click("Staging থেকে এই প্রশ্ন বাদ দিন");
    assert.match(heading.textContent, /1টি/);
    assert.equal(
      document.querySelectorAll('[aria-label$="নং প্রশ্নের টেক্সট"]').length,
      1,
    );
  } finally {
    await React.act(async () => root.unmount());
    dom.window.close();
    for (const [key, descriptor] of Object.entries(previous)) {
      if (descriptor) Object.defineProperty(global, key, descriptor);
      else delete global[key];
    }
  }
});
