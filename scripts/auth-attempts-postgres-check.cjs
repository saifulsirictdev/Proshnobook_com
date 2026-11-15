/** Disposable CI/local database ONLY. Creates/drops a unique test-owned schema, never app data. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const ts = require("typescript");
const { randomBytes } = require("node:crypto");
const { PrismaClient } = require("@prisma/client");
(async () => {
  const raw = process.env.AUTH_RATE_TEST_DATABASE_URL;
  if (!raw)
    throw Error(
      "AUTH_RATE_TEST_DATABASE_URL required; production URLs prohibited",
    );
  const url = new URL(raw);
  if (
    url.protocol !== "postgresql:" ||
    !["127.0.0.1", "localhost"].includes(url.hostname) ||
    url.port !== "5439" ||
    url.pathname !== "/auth_rate_test"
  )
    throw Error("Only disposable localhost:5439/auth_rate_test allowed");
  const schema = "auth_rate_" + randomBytes(8).toString("hex");
  const control = new PrismaClient({ datasources: { db: { url: url.href } } });
  let client;
  let created = false;
  try {
    await control.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
    created = true;
    url.searchParams.set("schema", schema);
    url.searchParams.set("connection_limit", "5");
    client = new PrismaClient({ datasources: { db: { url: url.href } } });
    await client.$executeRawUnsafe(
      'CREATE TABLE "Setting" ("key" TEXT PRIMARY KEY, "value" TEXT NOT NULL)',
    );
    const m = new Module("auth-attempts", module);
    m.require = (id) =>
      id === "server-only"
        ? {}
        : id === "@/lib/db"
          ? { db: client }
          : require(id);
    m._compile(
      ts.transpileModule(fs.readFileSync("lib/auth-attempts.ts", "utf8"), {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
        },
      }).outputText,
      "auth-attempts.js",
    );
    const reserve = m.exports.reserveAuthAttempt;
    const results = await Promise.all(
      Array.from({ length: 20 }, (_, i) =>
        reserve(
          "credentials",
          i % 2 ? " TEST@example.com " : "test@example.com",
          1800000,
        ),
      ),
    );
    assert.equal(results.filter(Boolean).length, 10);
    assert.equal(await client.setting.count(), 1);
    assert.equal(
      await reserve("credentials", "test@example.com", 2700000),
      true,
    );
    assert.equal(
      await reserve("credentials", "other@example.com", 1800000),
      true,
    );
    const attempts = await Promise.all(
      Array.from({ length: 10 }, () =>
        reserve("registration", "test@example.com", 1800000),
      ),
    );
    assert.equal(attempts.filter(Boolean).length, 5);
    assert.equal(await client.setting.count(), 3);
    for (const row of await client.setting.findMany())
      assert.ok(!row.key.includes("example.com"));
    console.log(
      "PASS real PostgreSQL: concurrent shared auth limits, window reset, identity normalization and isolated counters.",
    );
  } finally {
    if (client) await client.$disconnect();
    if (created)
      await control.$executeRawUnsafe(`DROP SCHEMA "${schema}" CASCADE`);
    await control.$disconnect();
  }
})().catch(() => {
  console.error(
    "FAIL disposable auth-rate integration check; no database URL/credentials are printed.",
  );
  process.exitCode = 1;
});
