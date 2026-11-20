const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  ts = require("typescript"),
  Module = require("node:module");

function loadTs(file, mocks = {}) {
  const m = new Module(file, module);
  m.paths = module.paths;
  m.require = (n) =>
    Object.hasOwn(mocks, n)
      ? mocks[n]
      : n.startsWith("@/")
        ? loadTs(n.replace("@/", "") + ".ts", mocks)
        : require(n);
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

test("keyword-research route uses DeepSeek API with DEEPSEEK_API_KEY and enforces ADMIN role", async () => {
  const source = fs.readFileSync("app/api/admin/keyword-research/route.ts", "utf8");
  assert.doesNotMatch(source, /callGeminiJson|gemini-json|GEMINI_API_KEY/);
  assert.match(source, /callDeepSeekJson/);

  let role = "STUDENT";
  const calls = [];
  const originalFetch = global.fetch;
  const originalDeepSeek = process.env.DEEPSEEK_API_KEY;
  const originalGemini = process.env.GEMINI_API_KEY;

  try {
    delete process.env.GEMINI_API_KEY;
    delete process.env.DEEPSEEK_API_KEY;

    global.fetch = async (url, init) => {
      calls.push({ url, init });
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content:
                  '```json\n{"keywords":[{"keyword":"HSC ICT Chapter 3 MCQ","type":"Primary","intent":"Preparation","difficulty":"Low","monthlySearchEst":"1K-5K","usageTip":"H1 শিরোনামে রাখুন"}]}\n```',
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    };

    const { POST } = loadTs("app/api/admin/keyword-research/route.ts", {
      "@/auth": { auth: async () => ({ user: { role } }) },
    });

    // 1. Non-admin denied before any API call
    const denied = await POST(
      new Request("https://proshnobook.com/api/admin/keyword-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "HSC ICT" }),
      }),
    );
    assert.equal(denied.status, 403);
    assert.equal(calls.length, 0);

    // 2. Missing DEEPSEEK_API_KEY returns 500 cleanly without touching Gemini
    role = "ADMIN";
    const missingKey = await POST(
      new Request("https://proshnobook.com/api/admin/keyword-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "HSC ICT", count: 6 }),
      }),
    );
    assert.equal(missingKey.status, 500);
    assert.equal(calls.length, 0);

    // 3. With DEEPSEEK_API_KEY set, calls DeepSeek chat/completions and normalizes keywords
    process.env.DEEPSEEK_API_KEY = "test-deepseek-key-only";
    const okRes = await POST(
      new Request("https://proshnobook.com/api/admin/keyword-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "HSC ICT", lang: "mixed", audience: "student", count: 6 }),
      }),
    );
    assert.equal(okRes.status, 200);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, "https://api.deepseek.com/chat/completions");
    assert.equal(calls[0].init.headers.Authorization, "Bearer test-deepseek-key-only");
    const sentBody = JSON.parse(calls[0].init.body);
    assert.equal(sentBody.model, "deepseek-chat");
    assert.deepEqual(sentBody.response_format, { type: "json_object" });

    const payload = await okRes.json();
    assert.equal(payload.ok, true);
    assert.equal(payload.items.length, 1);
    assert.equal(payload.items[0].keyword, "HSC ICT Chapter 3 MCQ");
    assert.equal(payload.items[0].type, "Primary");
    assert.equal(payload.items[0].intent, "Preparation");
    assert.equal(payload.items[0].difficulty, "Low");
  } finally {
    global.fetch = originalFetch;
    if (originalDeepSeek === undefined) delete process.env.DEEPSEEK_API_KEY;
    else process.env.DEEPSEEK_API_KEY = originalDeepSeek;
    if (originalGemini === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalGemini;
  }
});
