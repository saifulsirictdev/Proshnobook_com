const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
test("auth card exposes credentials immediately and uses real Google action", () => {
  const ui = fs.readFileSync("components/auth/login-dialog.tsx", "utf8");
  assert.match(ui, /useState\(true\)/);
  assert.match(ui, /action=\{googleLogin\}/);
  assert.match(ui, /confirmPassword/);
  assert.match(ui, /aria-pressed=\{visible\}/);
  assert.match(ui, /reportValidity\(\)/);
  assert.doesNotMatch(ui, /Continue with Facebook|recaptcha/i);
});
test("registration route preserves safe destination and existing auth guard; confirmation is validated on server", () => {
  const route = fs.readFileSync("app/register/page.tsx", "utf8");
  assert.match(route, /safeLoginRedirect/);
  assert.match(route, /initialMode="register"/);
  assert.match(route, /redirect\(next\)/);
  const action = fs.readFileSync("app/actions/auth.ts", "utf8");
  assert.match(action, /fd.get\("confirmPassword"\) !== fd.get\("password"\)/);
});
