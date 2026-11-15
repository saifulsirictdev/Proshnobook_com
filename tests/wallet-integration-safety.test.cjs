const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { spawnSync } = require("node:child_process");
const { target } = require("../scripts/helpers/disposable-wallet-db.cjs");
test("wallet integration requires an explicit isolated control URL and rejects production/fallback options", () => {
  const safe =
    "postgresql://auth_rate:disposable_ci_only@127.0.0.1:5439/auth_rate_test";
  assert.equal(target(safe).pathname, "/auth_rate_test");
  for (const value of [
    undefined,
    "",
    safe.replace("127.0.0.1", "db.production.invalid"),
    safe.replace("5439", "5432"),
    safe.replace("auth_rate_test", "app"),
    safe.replace("auth_rate:", "admin:"),
    safe + "?schema=public",
    safe + "#fragment",
  ])
    assert.throws(() => target(value));
});
test("both wallet rehearsals reject missing target before connecting and redact errors", () => {
  for (const file of [
    "wallet-postgres-check.cjs",
    "wallet-transfer-postgres-check.cjs",
  ]) {
    const result = spawnSync(process.execPath, ["scripts/" + file], {
      env: {
        PATH: process.env.PATH,
        DATABASE_URL: "postgresql://private-password@production.invalid/app",
      },
      encoding: "utf8",
    });
    assert.equal(result.status, 1);
    assert.ok(!result.stdout.includes("private-password"));
    assert.ok(!result.stderr.includes("private-password"));
  }
});
test("rehearsals use fresh full-schema databases and installed Prisma rather than legacy adapter paths", () => {
  const helper = fs.readFileSync(
    "scripts/helpers/disposable-wallet-db.cjs",
    "utf8",
  );
  assert.ok(helper.includes("randomBytes(10)"));
  assert.ok(helper.includes("CREATE DATABASE"));
  assert.ok(helper.includes("if (created)"));
  assert.ok(helper.includes("DROP DATABASE"));
  assert.ok(helper.includes("prisma/schema.prisma"));
  assert.ok(helper.includes("@prisma/client"));
  for (const file of [
    "wallet-postgres-check.cjs",
    "wallet-transfer-postgres-check.cjs",
  ]) {
    const code = fs.readFileSync("scripts/" + file, "utf8");
    assert.ok(code.includes("withDisposableWalletDatabase"));
    assert.doesNotMatch(
      code,
      /TRUNCATE|CREATE TABLE|\/home\/user\/wallet-prisma|WALLET_TEST_CLIENT_PATH|WALLET_TEST_ADAPTER_PATH/,
    );
  }
  const workflow = fs.readFileSync(
    ".github/workflows/security-checks.yml",
    "utf8",
  );
  assert.ok(workflow.includes("node scripts/wallet-postgres-check.cjs"));
  assert.ok(
    workflow.includes("node scripts/wallet-transfer-postgres-check.cjs"),
  );
});
