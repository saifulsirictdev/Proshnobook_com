const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const Module = require("node:module");
function load(file, mocks) {
  const m = new Module(file, module);
  m.require = (id) => (id in mocks ? mocks[id] : require(id));
  m._compile(
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    file,
  );
  return m.exports;
}
const helper = load("lib/login-redirect.ts", {});
async function destination({
  id = "user",
  role = "TEACHER",
  next = "/wallet",
  missing = false,
} = {}) {
  const page = load("app/auth/landing/page.tsx", {
    "@/lib/account-type": load("lib/account-type.ts", {}),
    "@/auth": {
      auth: async () => (id ? { user: { id, role: "ADMIN" } } : null),
    },
    "@/lib/db": {
      db: {
        setting: { findUnique: async () => null },
        user: {
          findUnique: async ({ where }) => {
            assert.equal(where.id, id);
            return missing ? null : { role };
          },
        },
      },
    },
    "@/lib/login-redirect": helper,
    "next/navigation": {
      redirect: (path) => {
        throw { destination: path };
      },
    },
  }).default;
  try {
    await page({ searchParams: Promise.resolve({ next }) });
  } catch (e) {
    if (e.destination) return e.destination;
    throw e;
  }
  throw Error("Expected redirect");
}
test("fresh ADMIN role lands on official profile; other roles preserve safe destinations", async () => {
  assert.equal(await destination({ role: "ADMIN" }), "/teachers/proshnobook");
  assert.equal(await destination({ role: "STUDENT" }), "/model-test");
  for (const role of ["TEACHER"]) {
    assert.equal(await destination({ role }), "/wallet");
  }
});
test("landing rejects unsafe destinations and loops; anonymous/deleted users get login", async () => {
  for (const next of [
    "https://evil.invalid",
    "//evil.invalid",
    "/auth/landing?next=/wallet",
  ]) {
    assert.equal(await destination({ next }), "/");
  }
  assert.equal(await destination({ id: null }), "/login?next=%2Fwallet");
  assert.equal(await destination({ missing: true }), "/login");
});
