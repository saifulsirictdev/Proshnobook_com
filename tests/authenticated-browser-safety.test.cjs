const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { spawnSync } = require("node:child_process");
test("full-app role browser check refuses absent disposable DB even if production URL exists", () => {
  const result = spawnSync(
    process.execPath,
    ["scripts/authenticated-browser-check.cjs"],
    {
      env: {
        PATH: process.env.PATH,
        DATABASE_URL: "postgresql://private-secret@production.invalid/app",
      },
      encoding: "utf8",
    },
  );
  assert.equal(result.status, 1);
  assert.ok(result.stderr.includes("target_guard"));
  assert.ok(!result.stderr.includes("private-secret"));
});
test("browser uses actual password UI and isolated full app, not fake session cookies or app API mocks", () => {
  const code = fs.readFileSync(
    "scripts/authenticated-browser-check.cjs",
    "utf8",
  );
  assert.ok(code.includes("withDisposableWalletDatabase"));
  assert.ok(code.includes('input[name="password"]'));
  assert.ok(code.includes("/api/auth/session"));
  assert.ok(code.includes("session.user.role"));
  assert.ok(code.includes('["TEACHER", "ADMIN", "STUDENT"]'));
  assert.ok(code.includes("[390, 1280]"));
  assert.ok(code.includes("route.abort()"));
  assert.ok(code.includes("AUTH_SECRET: randomBytes"));
  assert.ok(!code.includes("...process.env"));
  assert.ok(!code.includes("addCookies"));
  assert.ok(!code.includes("route.fulfill"));
  assert.ok(code.includes("server.stop()"));
  assert.ok(code.includes("browser.close()"));
  const workflow = fs.readFileSync(
    ".github/workflows/security-checks.yml",
    "utf8",
  );
  assert.ok(
    workflow.indexOf("npm run build") <
      workflow.indexOf("node scripts/authenticated-browser-check.cjs"),
  );
});
