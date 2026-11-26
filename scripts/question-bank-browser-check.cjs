/** Browser/UI contract only, using synthetic rows and a mock API. Never production data. */
const fs = require("node:fs"),
  path = require("node:path"),
  http = require("node:http");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const root = process.cwd(),
  out = path.join(root, ".cache/question-bank-browser");
const uuid = "12345678-1234-4123-8123-123456789abc";
const base = {
  category: "Class 6",
  subject: "গণিত",
  topic: "১. স্বাভাবিক সংখ্যা ও ভগ্নাংশ",
  lang: "Bangla",
  difficulty: "EASY",
  explanation: "দুই এবং দুই যোগ করলে চার হয়।",
  source: "ADMIN_MANUAL",
  approved: false,
  createdAt: "2026-01-01T00:00:00Z",
};
let rows = [
  {
    ...base,
    id: "fixture-mcq",
    revision: "r0",
    kind: "MCQ",
    text: "দুই এবং দুইয়ের যোগফল কত?",
    options: { A: "৪", B: "৩", C: "৫", D: "৬" },
    correct: "A",
  },
];
const mutations = [],
  audits = [];
function result(url) {
  const status = url.searchParams.get("status") || "all",
    q = url.searchParams.get("q") || "";
  const filtered = rows.filter(
    (r) =>
      (status === "trash"
        ? r.source.startsWith("ADMIN_TRASH:")
        : !r.source.startsWith("ADMIN_TRASH:")) &&
      (status === "approved"
        ? r.approved
        : status === "pending"
          ? !r.approved
          : true) &&
      (!q || r.text.includes(q)),
  );
  return {
    total: filtered.length,
    rows: filtered,
    pageSize: 24,
    counts: {
      approved: rows.filter((r) => r.approved).length,
      pending: rows.filter(
        (r) => !r.approved && !r.source.startsWith("ADMIN_TRASH:"),
      ).length,
      trash: rows.filter((r) => r.source.startsWith("ADMIN_TRASH:")).length,
    },
  };
}
async function main() {
  fs.mkdirSync(out, { recursive: true });
  const initial = result(new URL("http://fixture"));
  await require("esbuild").build({
    stdin: {
      contents: `import React from 'react';import{createRoot}from'react-dom/client';import Workspace from './app/admin/questions/bank/workspace';createRoot(document.getElementById('root')).render(<div className="mx-auto max-w-screen-2xl p-3 md:p-6"><Workspace initial={${JSON.stringify(initial)}} initialFilters={{category:'',subject:'',topic:'',q:'',kind:'ALL',status:'all',difficulty:'ALL',page:1}} scopes={${JSON.stringify([base])}} /></div>);`,
      loader: "tsx",
      resolveDir: root,
    },
    bundle: true,
    outfile: path.join(out, "app.js"),
    jsx: "automatic",
    alias: { "@": root },
    define: { "process.env.NODE_ENV": '"production"' },
    plugins: [
      {
        name: "fixture-link",
        setup(b) {
          b.onResolve({ filter: /^next\/link$/ }, () => ({
            path: "link",
            namespace: "fixture",
          }));
          b.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({
            contents: `import React from'react';export default function Link(p){return React.createElement('a',p,p.children)}`,
            loader: "js",
            resolveDir: root,
          }));
        },
      },
    ],
  });
  execFileSync(
    path.join(root, "node_modules/.bin/tailwindcss"),
    [
      "-i",
      "app/globals.css",
      "-o",
      path.join(out, "app.css"),
      "--content",
      "app/admin/questions/bank/workspace.tsx,components/MathText.tsx",
      "--minify",
    ],
    { stdio: "pipe" },
  );
  fs.writeFileSync(
    path.join(out, "index.html"),
    '<!doctype html><html lang="bn"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"><style>@font-face{font-family:BankPreview;src:url(/fonts/HindSiliguri-Regular.ttf)}</style><body class="bg-slate-50" style="font-family:BankPreview,sans-serif"><div id="root"></div><script src="/app.js"></script></body></html>',
  );
  const webp = await require("sharp")({
    create: { width: 80, height: 60, channels: 3, background: "#1d4ed8" },
  })
    .webp()
    .toBuffer();
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://fixture");
    function json(value) {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(value));
    }
    if (url.pathname.startsWith("/api/question-bank/images/")) {
      res.setHeader("Content-Type", "image/webp");
      return res.end(webp);
    }
    if (url.pathname === "/api/admin/question-bank/image") {
      for await (const _ of req) {
      }
      return json({ url: `/api/question-bank/images/${uuid}.webp` });
    }
    if (url.pathname === "/api/admin/question-bank") {
      if (req.method === "GET")
        return json(
          url.searchParams.has("history") ? { history: audits } : result(url),
        );
      let raw = "";
      for await (const part of req) raw += part;
      const cmd = JSON.parse(raw);
      mutations.push(cmd);
      let row = rows.find((r) => r.id === cmd.id),
        before = row ? { ...row } : null;
      if (cmd.operation === "create") {
        row = {
          ...base,
          ...cmd.draft,
          id: "fixture-new-" + mutations.length,
          kind: cmd.draft.type,
          revision: "r1",
          approved: false,
        };
        rows.unshift(row);
      }
      if (cmd.operation === "edit")
        Object.assign(row, cmd.draft, { approved: false });
      if (cmd.operation === "approve") row.approved = true;
      if (cmd.operation === "pending") row.approved = false;
      if (cmd.operation === "trash") {
        row.source = "ADMIN_TRASH:v1:ADMIN_MANUAL";
        row.approved = false;
      }
      if (cmd.operation === "restore") {
        row.source = "ADMIN_MANUAL";
        row.approved = false;
      }
      row.revision = "r" + mutations.length;
      audits.unshift({
        operation: cmd.operation,
        actorId: "synthetic-admin",
        at: new Date().toISOString(),
        before,
        after: row,
      });
      return json({ row });
    }
    const file = url.pathname.startsWith("/fonts/")
      ? path.join(root, "public", url.pathname)
      : path.join(out, url.pathname === "/" ? "index.html" : url.pathname);
    if (
      !file.startsWith(root + path.sep) ||
      !fs.existsSync(file) ||
      !fs.statSync(file).isFile()
    ) {
      res.statusCode = 404;
      return res.end();
    }
    res.setHeader(
      "Content-Type",
      file.endsWith(".js")
        ? "text/javascript"
        : file.endsWith(".css")
          ? "text/css"
          : file.endsWith(".html")
            ? "text/html"
            : "application/octet-stream",
    );
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { chromium } = require("playwright-core");
  const executablePath =
    process.env.CHROMIUM_EXECUTABLE_PATH ||
    (await (
      require("@sparticuz/chromium").default || require("@sparticuz/chromium")
    ).executablePath());
  let browser;
  try {
    browser = await chromium.launch({
      executablePath,
      headless: true,
      timeout: 20000,
      args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-zygote"],
    });
    const page = await browser.newPage(),
      errors = [];
    page.setDefaultTimeout(10000);
    page.on("pageerror", (error) => {
      errors.push(String(error));
      console.error("PAGE ERROR", String(error));
    });
    page.on("dialog", (dialog) => dialog.accept());
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page
      .getByRole("heading", { name: "প্রশ্নব্যাংক স্টুডিও", exact: true })
      .waitFor();
    await page.evaluate(() => document.fonts.ready);
    for (const width of [360, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `list overflow at ${width}`,
      );
      await page.screenshot({
        path: path.join(out, `list-${width}.png`),
        fullPage: true,
      });
    }
    await page
      .getByRole("button", { name: "নতুন প্রশ্ন লিখুন", exact: true })
      .click();
    const editor = page.getByRole("region", { name: "প্রশ্ন Editor" });
    await editor
      .getByLabel("শ্রেণি / ক্যাটাগরি", { exact: true })
      .fill(base.category);
    await editor.getByLabel("বিষয়", { exact: true }).fill(base.subject);
    await editor.getByLabel("অধ্যায় / টপিক", { exact: true }).fill(base.topic);
    await editor
      .getByLabel("প্রশ্ন", { exact: true })
      .fill("হাতে লেখা পরীক্ষামূলক প্রশ্ন");
    for (const [i, k] of ["A", "B", "C", "D"].entries())
      await editor.getByLabel(`অপশন ${k}`, { exact: true }).fill(String(i + 1));
    await editor
      .getByLabel("উত্তর / সমাধান ও ব্যাখ্যা", { exact: true })
      .fill("এটি একটি synthetic উত্তর।");
    const tools = editor.locator("details").filter({has: page.locator("summary",{hasText:"Unicode conversion"})});
    await tools.locator("summary").click();
    await tools.getByRole("button",{name:"Editor থেকে টেক্সট নিন",exact:true}).click();
    await tools.getByLabel("মূল / legacy টেক্সট",{exact:true}).fill("Avgvi †mvbvi evsjv $x=2$ 123");
    await tools.getByRole("button",{name:"Bijoy → Unicode প্রিভিউ",exact:true}).click();
    assert.match(await tools.getByLabel("প্রস্তাবিত টেক্সট",{exact:true}).inputValue(),/আমার সোনার বাংলা/);
    await tools.getByRole("button",{name:"পার্থক্য দেখেছি · Editor-এ বসান",exact:true}).click();
    await tools.getByRole("button",{name:"শেষ Apply Undo করুন",exact:true}).click();
    await tools.locator("summary").click();
    await editor
      .getByLabel("ছবির বর্ণনা", { exact: true })
      .fill("পরীক্ষামূলক নীল চিত্র");
    await editor
      .getByLabel("ছবি আপলোড করুন", { exact: true })
      .setInputFiles({
        name: "fixture.webp",
        mimeType: "image/webp",
        buffer: webp,
      });
    await editor
      .getByRole("button", { name: "নির্বাচিত স্থানে ছবি বসান" })
      .click();
    await editor
      .getByRole("complementary")
      .getByRole("img", { name: "পরীক্ষামূলক নীল চিত্র" })
      .waitFor();
    await editor
      .getByRole("button", { name: "ছবি বদলান", exact: true })
      .click();
    await editor
      .getByLabel("ছবির বর্ণনা", { exact: true })
      .fill("বদলানো চিত্র");
    await editor
      .getByLabel("ছবি আপলোড করুন", { exact: true })
      .setInputFiles({
        name: "replacement.webp",
        mimeType: "image/webp",
        buffer: webp,
      });
    await editor
      .getByRole("button", { name: "ছবিটি প্রতিস্থাপন করুন", exact: true })
      .click();
    assert.match(
      await editor.getByLabel("প্রশ্ন", { exact: true }).inputValue(),
      /বদলানো চিত্র/,
    );
    await editor.getByRole("button", { name: "সরান", exact: true }).click();
    assert.doesNotMatch(
      await editor.getByLabel("প্রশ্ন", { exact: true }).inputValue(),
      /!\[/,
    );
    await editor
      .getByLabel("ছবির বর্ণনা", { exact: true })
      .fill("পরীক্ষামূলক নীল চিত্র");
    await editor
      .getByLabel("ছবি আপলোড করুন", { exact: true })
      .setInputFiles({
        name: "final.webp",
        mimeType: "image/webp",
        buffer: webp,
      });
    await editor
      .getByRole("button", { name: "নির্বাচিত স্থানে ছবি বসান", exact: true })
      .click();
    for (const width of [360, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `editor overflow at ${width}`,
      );
      await page.screenshot({
        path: path.join(out, `editor-${width}.png`),
        fullPage: true,
      });
    }
    await editor.getByRole("checkbox").check();
    await editor
      .getByRole("button", { name: "Pending হিসেবে সেভ করুন", exact: true })
      .click();
    await page
      .getByRole("status")
      .filter({ hasText: "প্রশ্ন Pending হিসেবে সেভ হয়েছে" })
      .waitFor();
    assert.equal(mutations[0].operation, "create");
    assert.equal(mutations[0].draft.approved, undefined);
    assert.match(mutations[0].draft.text, /!\[পরীক্ষামূলক নীল চিত্র\]/);
    await page
      .getByRole("article")
      .first()
      .getByRole("button", { name: "প্রিভিউ", exact: true })
      .click();
    await page
      .getByRole("button", { name: "যাচাই করেছি · অনুমোদন দিন", exact: true })
      .click();
    await page
      .getByRole("status")
      .filter({ hasText: "অনুমোদন হয়েছে" })
      .waitFor();
    assert.equal(rows[0].approved, true);
    await page
      .getByRole("article")
      .first()
      .getByRole("button", { name: "সম্পাদনা", exact: true })
      .click();
    await page
      .getByLabel("উত্তর / সমাধান ও ব্যাখ্যা", { exact: true })
      .fill("পরিমার্জিত উত্তর")
      .catch(async (e) => {
        console.error(await page.locator("body").innerText());
        throw e;
      });
    await page
      .getByRole("region", { name: "প্রশ্ন Editor" })
      .getByRole("checkbox")
      .check();
    await page
      .getByRole("button", { name: "Pending হিসেবে সেভ করুন", exact: true })
      .click();
    await page
      .getByRole("status")
      .filter({ hasText: "প্রশ্ন Pending হিসেবে সেভ হয়েছে" })
      .waitFor();
    assert.equal(rows[0].approved, false);
    await page.getByRole("article").first().getByRole("checkbox").check();
    await page.getByRole("button", { name: "Trash", exact: true }).click();
    await page.getByRole("status").filter({ hasText: "Trash হয়েছে" }).waitFor();
    assert.match(rows[0].source, /ADMIN_TRASH/);
    await page
      .getByRole("button")
      .filter({ hasText: "Trash-এ সংরক্ষিত" })
      .click();
    await page.getByRole("article").first().getByRole("checkbox").check();
    await page.getByRole("button", { name: "Restore", exact: true }).click();
    await page
      .getByRole("status")
      .filter({ hasText: "Restore হয়েছে" })
      .waitFor();
    assert.equal(rows[0].approved, false);
    await page
      .getByRole("button", { name: "ফিল্টার মুছুন", exact: true })
      .click();
    for (const type of ["CQ", "SQ"]) {
      await page
        .getByRole("button", { name: "নতুন প্রশ্ন লিখুন", exact: true })
        .click();
      const form = page.getByRole("region", { name: "প্রশ্ন Editor" });
      await form
        .getByLabel("শ্রেণি / ক্যাটাগরি", { exact: true })
        .fill(base.category);
      await form.getByLabel("বিষয়", { exact: true }).fill(base.subject);
      await form.getByLabel("অধ্যায় / টপিক", { exact: true }).fill(base.topic);
      await form.getByRole("button", { name: type, exact: true }).click();
      await form
        .getByLabel(type === "CQ" ? "উদ্দীপক" : "প্রশ্ন", { exact: true })
        .fill("Synthetic " + type + " প্রশ্ন");
      if (type === "CQ")
        for (const part of ["ক", "খ", "গ"])
          await form
            .getByLabel(part + " অংশ", { exact: true })
            .fill(part + " প্রশ্ন");
      await form
        .getByLabel("উত্তর / সমাধান ও ব্যাখ্যা", { exact: true })
        .fill("Synthetic লিখিত সমাধান");
      await form.getByRole("checkbox").check();
      await form
        .getByRole("button", { name: "Pending হিসেবে সেভ করুন", exact: true })
        .click();
      await page
        .getByRole("status")
        .filter({ hasText: "প্রশ্ন Pending হিসেবে সেভ হয়েছে" })
        .waitFor();
      assert.equal(mutations.at(-1).draft.type, type);
      assert.equal(mutations.at(-1).draft.correct, "");
      if (type === "CQ")
        assert.deepEqual(mutations.at(-1).draft.options.marks, {
          k: 2,
          kh: 4,
          g: 4,
        });
    }
    assert.deepEqual(errors, []);
    console.log(
      JSON.stringify(
        {
          status: "PASS",
          scope:
            "synthetic mock API; not an authenticated full-app/real-DB test",
          viewports: [360, 768, 1440],
          flows: [
            "manual MCQ/CQ/SQ",
            "image upload/insert/replace/remove/preview",
            "save Pending",
            "review approval",
            "edit resets approval",
            "selected Trash",
            "Restore Pending",
          ],
          screenshots: out,
        },
        null,
        2,
      ),
    );
  } finally {
    await browser?.close();
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
