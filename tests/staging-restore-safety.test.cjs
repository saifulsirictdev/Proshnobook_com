const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const {
  validateTarget,
  snapshot,
} = require("../scripts/disposable-restore-check.cjs");
const { audit } = require("../scripts/staging-bindings-check.cjs");
const id = "a".repeat(64);
test("restore runner accepts only explicit disposable localhost service targets", () => {
  const base =
    "postgresql://auth_rate:disposable_ci_only@127.0.0.1:5439/auth_rate_test";
  assert.equal(validateTarget(base, id).pathname, "/auth_rate_test");
  for (const url of [
    undefined,
    "postgresql://auth_rate:secret@production.example:5439/auth_rate_test",
    base.replace("5439", "5432"),
    base.replace("auth_rate_test", "production"),
    base + "?schema=public",
    base.replace("auth_rate:", "admin:"),
  ])
    assert.throws(() => validateTarget(url, id));
  for (const container of [undefined, ";rm -rf", "existing-db-name", id + "x"])
    assert.throws(() => validateTarget(base, container));
  const result = spawnSync(
    process.execPath,
    ["scripts/disposable-restore-check.cjs"],
    {
      env: {
        PATH: process.env.PATH,
        RESTORE_TEST_DATABASE_URL:
          "postgresql://private-secret@remote.invalid/production",
      },
      encoding: "utf8",
    },
  );
  assert.equal(result.status, 1);
  assert.ok(!result.stderr.includes("private-secret"));
  assert.ok(!result.stdout.includes("production"));
});
test("snapshot includes all table contents, indexes and constraints and refuses unsafe identifiers", async () => {
  const db = {
    $queryRawUnsafe: async (sql) =>
      sql.startsWith("SELECT tablename FROM")
        ? [{ tablename: "Setting" }]
        : sql.includes('FROM "Setting"')
          ? [{ row: '{"key":"k","value":"v"}' }]
          : sql.includes("FROM pg_indexes")
            ? [{ indexname: "Setting_pkey" }]
            : [{ conname: "Setting_pkey" }],
  };
  const a = await snapshot(db);
  assert.deepEqual(a.counts, { Setting: 1 });
  assert.equal(a.digest.length, 64);
  assert.equal(a.indexes.length, 1);
  assert.equal(a.constraints.length, 1);
  assert.deepEqual(await snapshot(db), a);
  await assert.rejects(
    snapshot({
      $queryRawUnsafe: async () => [
        { tablename: 'User"; DROP DATABASE unsafe;' },
      ],
    }),
  );
});
test("metadata auditor catches shared production credentials and missing staging auth without values", () => {
  const result = audit({
    envs: [
      {
        key: "DATABASE_URL",
        value: "never-output-secret",
        target: ["preview", "production"],
      },
      {
        key: "BLOB_READ_WRITE_TOKEN",
        value: "other-secret",
        target: ["production", "preview"],
      },
      { key: "AUTH_SECRET", value: "secret", target: ["production"] },
    ],
  });
  assert.equal(result.ok, false);
  assert.equal(result.isolated, false);
  assert.ok(
    result.findings.some(
      (x) =>
        x.key === "AUTH_SECRET" && x.code === "missing_default_preview_binding",
    ),
  );
  assert.equal(
    result.findings.filter(
      (x) => x.code === "shared_production_preview_definition",
    ).length,
    2,
  );
  assert.ok(!JSON.stringify(result).includes("never-output-secret"));
});
test("separate definitions never claim verified resource isolation; branch-only settings are not default preview", () => {
  const rows = ["DATABASE_URL", "BLOB_READ_WRITE_TOKEN", "AUTH_SECRET"].map(
    (key) => ({ key, target: ["preview"] }),
  );
  const result = audit({ env: rows });
  assert.equal(result.ok, true);
  assert.equal(result.isolated, false);
  for (const field of ["gitBranch", "git_branch"])
    assert.equal(
      audit({ envs: rows.map((row) => ({ ...row, [field]: "feature/test" })) })
        .ok,
      false,
    );
  assert.equal(audit({}).ok, false);
  const raw = spawnSync(
    process.execPath,
    ["scripts/staging-bindings-check.cjs"],
    {
      input:
        '{"envs":[{"key":"DATABASE_URL","value":"hidden-secret","target":["production","preview"]}]}',
      encoding: "utf8",
    },
  );
  assert.equal(raw.status, 1);
  assert.ok(!raw.stdout.includes("hidden-secret"));
});
