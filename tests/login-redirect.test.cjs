const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("fs"),
  ts = require("typescript"),
  Module = require("module");
const m = new Module("redirect");
m._compile(
  ts.transpileModule(fs.readFileSync("lib/login-redirect.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
  "redirect.js",
);
const { safeLoginRedirect: safe } = m.exports;
test("login callback retains relative builder/wallet destinations", () => {
  for (const path of [
    "/",
    "/wallet",
    "/question-builder/prepare?category=Class%206&subject=English",
    "/question-builder/build?englishKey=a%3Ab#paper",
  ])
    assert.equal(safe(path), path);
});
test("login callback rejects external, protocol-relative, backslash, control and malformed destinations", () => {
  for (const path of [
    undefined,
    null,
    12,
    "https://evil.invalid",
    "//evil.invalid",
    "/\\evil.invalid",
    "/%5Cevil.invalid",
    "/%2f%2fevil.invalid",
    "/\nevil",
    "/login",
    "/login?next=/wallet",
    "bad",
    "/%E0%A4%A",
    "/" + "a".repeat(2100),
  ])
    assert.equal(safe(path), "/");
});

test("server login actions honor only sanitized credential/Google return paths", async () => {
  const calls = [];
  const actionModule = new Module("auth-actions", module);
  actionModule.paths = module.paths;
  actionModule.require = (id) =>
    id === "@/lib/auth-attempts"
      ? { reserveAuthAttempt: async () => true }
      : id === "@/lib/login-redirect"
        ? m.exports
        : id === "@/auth"
          ? {
              signIn: async (provider, options) =>
                calls.push({ provider, options }),
            }
          : id === "@/lib/db"
            ? { db: {} }
            : id === "next-auth"
              ? { AuthError: class AuthError extends Error {} }
              : require(id);
  actionModule._compile(
    ts.transpileModule(fs.readFileSync("app/actions/auth.ts", "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    "auth-actions.js",
  );
  const fd = new FormData();
  fd.set("email", "test@example.com");
  fd.set("password", "test-password");
  fd.set("next", "/wallet");
  await actionModule.exports.login("", fd);
  assert.equal(calls[0].options.redirectTo, "/auth/landing?next=%2Fwallet");
  await actionModule.exports.googleLogin(fd);
  assert.equal(calls[1].options.redirectTo, "/auth/landing?next=%2Fwallet");
  fd.set("next", "//evil.invalid");
  await actionModule.exports.googleLogin(fd);
  assert.equal(calls[2].options.redirectTo, "/auth/landing?next=%2F");
});

test("identity landing helper rejects external targets and onboarding/landing loops", () => {
  for (const bad of ["//evil.invalid", "https://evil.invalid", "/auth/landing?next=/wallet", "/auth/onboarding"]) {
    assert.equal(helperPath(bad), "/auth/landing?next=%2F");
  }
  assert.equal(helperPath("/model-test/one?mode=practice"), "/auth/landing?next=%2Fmodel-test%2Fone%3Fmode%3Dpractice");
});
function helperPath(raw) { return m.exports.loginLandingPath(raw); }
