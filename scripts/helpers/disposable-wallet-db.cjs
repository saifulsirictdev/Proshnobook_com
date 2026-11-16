/** Full-schema wallet fixtures in a fresh, random test-owned DB. Never touches existing app tables. */
const { randomBytes } = require("node:crypto");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
function target(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw Error("Explicit disposable wallet URL required");
  }
  if (
    url.protocol !== "postgresql:" ||
    !["127.0.0.1", "localhost"].includes(url.hostname) ||
    url.port !== "5439" ||
    url.pathname !== "/auth_rate_test" ||
    url.username !== "auth_rate" ||
    url.search ||
    url.hash
  )
    throw Error(
      "Only disposable auth_rate@localhost:5439/auth_rate_test allowed",
    );
  return url;
}
async function withDisposableWalletDatabase(test, env = process.env) {
  const url = target(env.WALLET_TEST_DATABASE_URL);
  const { PrismaClient } = require("@prisma/client");
  const control = new PrismaClient({ datasources: { db: { url: url.href } } });
  const name = `qm_wallet_${randomBytes(10).toString("hex")}`;
  let created = false,
    db;
  try {
    await control.$executeRawUnsafe(`CREATE DATABASE "${name}"`);
    created = true;
    const isolated = new URL(url);
    isolated.pathname = "/" + name;
    const push = spawnSync(
      process.execPath,
      [
        require.resolve("prisma/build/index.js"),
        "db",
        "push",
        "--skip-generate",
        "--schema",
        path.resolve("prisma/schema.prisma"),
      ],
      {
        env: { ...process.env, DATABASE_URL: isolated.href },
        encoding: "utf8",
        timeout: 180000,
        maxBuffer: 4 * 1024 * 1024,
      },
    );
    if (push.error || push.status !== 0)
      throw Error("Disposable wallet schema initialization failed");
    db = new PrismaClient({ datasources: { db: { url: isolated.href } } });
    await test(db, { databaseUrl: isolated.href });
  } finally {
    try {
      if (db) await db.$disconnect();
    } finally {
      try {
        if (created)
          await control.$executeRawUnsafe(
            `DROP DATABASE "${name}" WITH (FORCE)`,
          );
      } finally {
        await control.$disconnect();
      }
    }
  }
}
module.exports = { target, withDisposableWalletDatabase };
