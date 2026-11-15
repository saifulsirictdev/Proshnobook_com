/** Synthetic disaster-recovery rehearsal ONLY. No production URLs, secrets or existing DBs. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { randomBytes, createHash } = require("node:crypto");

function validateTarget(raw, container) {
  const url = new URL(raw || "invalid:");
  if (
    url.protocol !== "postgresql:" ||
    !["127.0.0.1", "localhost"].includes(url.hostname) ||
    url.port !== "5439" ||
    url.pathname !== "/auth_rate_test" ||
    url.username !== "auth_rate" ||
    url.search ||
    url.hash ||
    !/^[a-f0-9]{12,64}$/.test(container || "")
  )
    throw Error("Disposable target required");
  return url;
}
function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    timeout: 180000,
    maxBuffer: 64 * 1024 * 1024,
    ...options,
  });
  // Child output may contain connection details; never forward it to logs/PRs.
  if (result.error || result.status !== 0)
    throw Error("Disposable subprocess failed");
  return result.stdout;
}
function load(file) {
  const Module = require("node:module"),
    ts = require("typescript");
  const m = new Module(file, module);
  m.require = (id) => (id === "server-only" ? {} : require(id));
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
async function snapshot(db) {
  const tables = await db.$queryRawUnsafe(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename",
  );
  const hash = createHash("sha256");
  const counts = {};
  for (const { tablename } of tables) {
    if (!/^[A-Za-z_][A-Za-z_0-9]*$/.test(tablename))
      throw Error("Unexpected table name");
    const rows = await db.$queryRawUnsafe(
      `SELECT to_jsonb(t)::text AS row FROM "${tablename}" t ORDER BY to_jsonb(t)::text`,
    );
    counts[tablename] = rows.length;
    hash.update(JSON.stringify([tablename, rows]));
  }
  const indexes = await db.$queryRawUnsafe(
    "SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname",
  );
  const constraints = await db.$queryRawUnsafe(
    "SELECT conrelid::regclass::text AS tablename, conname, pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE connamespace = 'public'::regnamespace ORDER BY tablename, conname",
  );
  return { counts, digest: hash.digest("hex"), indexes, constraints };
}
let phase = "preflight";
async function main(env = process.env) {
  const url = validateTarget(
    env.RESTORE_TEST_DATABASE_URL,
    env.RESTORE_TEST_CONTAINER,
  );
  const container = env.RESTORE_TEST_CONTAINER;
  phase = "container_verification";
  const inspect = JSON.parse(
    run("docker", ["inspect", container], { encoding: "utf8" }),
  )[0];
  if (
    inspect?.Config?.Image !== "postgres:16" ||
    !inspect.NetworkSettings?.Ports?.["5432/tcp"]?.some(
      (p) => p.HostPort === "5439",
    )
  )
    throw Error("Disposable postgres:16 service required");
  const exec = (args, input) =>
    run(
      "docker",
      [
        "exec",
        ...(input ? ["-i"] : []),
        "--env",
        "PGUSER=auth_rate",
        "--env",
        "PGHOST=/var/run/postgresql",
        container,
        ...args,
      ],
      input ? { input } : {},
    );
  const { PrismaClient } = require("@prisma/client");
  const control = new PrismaClient({ datasources: { db: { url: url.href } } });
  const owned = [],
    clients = [];
  const suffix = randomBytes(8).toString("hex");
  const source = `qm_restore_source_${suffix}`,
    target = `qm_restore_target_${suffix}`;
  const oldKeys = process.env.PDF_VAULT_KEYS,
    oldActive = process.env.PDF_VAULT_ACTIVE_KEY;
  let dump;
  const began = Date.now();
  try {
    // Names generated internally, never supplied by operator; only successfully created DBs are dropped.
    phase = "create_disposable_databases";
    for (const name of [source, target]) {
      await control.$executeRawUnsafe(`CREATE DATABASE "${name}"`);
      owned.push(name);
    }
    const forDatabase = (name) => {
      const value = new URL(url);
      value.pathname = "/" + name;
      return value.href;
    };
    phase = "create_current_schema";
    run(
      process.execPath,
      [
        require.resolve("prisma/build/index.js"),
        "db",
        "push",
        "--skip-generate",
        "--schema",
        path.resolve("prisma/schema.prisma"),
      ],
      { env: { ...process.env, DATABASE_URL: forDatabase(source) } },
    );
    exec(
      ["psql", "--dbname", source, "--set", "ON_ERROR_STOP=1"],
      fs.readFileSync("scripts/security-schema.sql"),
    );
    const db = new PrismaClient({
      datasources: { db: { url: forDatabase(source) } },
    });
    const restored = new PrismaClient({
      datasources: { db: { url: forDatabase(target) } },
    });
    clients.push(db, restored);
    phase = "seed_synthetic_data";
    await db.user.create({
      data: {
        id: "restore-teacher",
        email: "restore-teacher@example.invalid",
        role: "TEACHER",
        name: "Synthetic Teacher",
      },
    });
    await db.resource.create({
      data: {
        id: "restore-paper",
        title: "বাংলা synthetic fixture",
        category: "SSC",
        fileUrl: "https://example.invalid/fixture.pdf",
        priceBdt: 10,
      },
    });
    await db.purchase.create({
      data: {
        id: "restore-purchase",
        userId: "restore-teacher",
        resourceId: "restore-paper",
        amount: 1000,
        status: "PAID",
      },
    });
    const wallet = {
      version: 2,
      balance: 3500,
      bonus: 2000,
      funds: { bonus: 1000, recharge: 1500, earnings: 700, received: 300 },
    };
    await db.setting.create({
      data: {
        key: "wallet:account:restore-teacher",
        value: JSON.stringify(wallet),
      },
    });
    await db.setting.create({
      data: {
        key: "restore-fixture:operation-id",
        value: "synthetic-idempotency-marker",
      },
    });
    // Generate a real PDF and encrypt using app code; never use deployed keys/Blob credentials.
    const { PDFDocument } = require("pdf-lib");
    const pdf = await PDFDocument.create();
    pdf.addPage().drawText("Synthetic restore fixture");
    const bytes = Buffer.from(await pdf.save());
    const keys = {
      version: 1,
      active: "restore",
      keys: { restore: randomBytes(32).toString("hex") },
    };
    process.env.PDF_VAULT_KEYS = JSON.stringify(keys.keys);
    process.env.PDF_VAULT_ACTIVE_KEY = keys.active;
    const vault = load("lib/pdf-vault.ts");
    const binding = {
      ownerId: "restore-teacher",
      receiptId: "a".repeat(64),
      originHash: "b".repeat(64),
    };
    const encrypted = vault.encryptVaultPdf(bytes, binding);
    const manifest = {
      ...binding,
      keyId: encrypted.keyId,
      sha256: encrypted.sha256,
      size: bytes.length,
    };
    await db.setting.create({
      data: {
        key: "restore-fixture:vault",
        value: JSON.stringify({
          manifest,
          ciphertext: encrypted.bytes.toString("base64"),
        }),
      },
    });
    phase = "synthetic_key_backup";
    const backup = require("./pdf-vault-backup.cjs");
    const passphrase = randomBytes(32).toString("hex");
    const keyBackup = await backup.seal(keys, passphrase);
    process.env.PDF_VAULT_KEYS = "{}";
    assert.throws(() => vault.decryptVaultPdf(encrypted.bytes, manifest));
    const before = await snapshot(db);
    assert.ok(
      Object.keys(before.counts).length >=
        (
          fs.readFileSync("prisma/schema.prisma", "utf8").match(/^model /gm) ||
          []
        ).length,
    );
    phase = "pg_dump";
    dump = exec([
      "pg_dump",
      "--format=custom",
      "--no-owner",
      "--no-privileges",
      "--dbname",
      source,
    ]);
    assert.ok(dump.subarray(0, 5).toString() === "PGDMP");
    const restoreBegan = Date.now();
    phase = "pg_restore";
    exec(
      [
        "pg_restore",
        "--exit-on-error",
        "--single-transaction",
        "--no-owner",
        "--no-privileges",
        "--dbname",
        target,
      ],
      dump,
    );
    phase = "verify_restored_data_and_keys";
    assert.deepEqual(await snapshot(restored), before);
    const recovered = await restored.setting.findUniqueOrThrow({
      where: { key: "wallet:account:restore-teacher" },
    });
    assert.deepEqual(
      load("lib/wallet-funds.ts").normalizeWallet(JSON.parse(recovered.value)),
      wallet,
    );
    const saved = JSON.parse(
      (
        await restored.setting.findUniqueOrThrow({
          where: { key: "restore-fixture:vault" },
        })
      ).value,
    );
    const recoveredKeys = await backup.open(keyBackup, passphrase);
    process.env.PDF_VAULT_KEYS = JSON.stringify(recoveredKeys.keys);
    process.env.PDF_VAULT_ACTIVE_KEY = recoveredKeys.active;
    assert.deepEqual(
      vault.decryptVaultPdf(
        Buffer.from(saved.ciphertext, "base64"),
        saved.manifest,
      ),
      bytes,
    );
    await assert.rejects(backup.open(keyBackup, "incorrect-test-passphrase"));
    console.log(
      JSON.stringify({
        status: "pass",
        check: "synthetic_disposable_restore_only",
        tables: Object.keys(before.counts).length,
        rows: Object.values(before.counts).reduce((a, b) => a + b, 0),
        restoreMs: Date.now() - restoreBegan,
        totalMs: Date.now() - began,
        productionRestoreVerified: false,
      }),
    );
  } finally {
    if (dump) dump.fill(0);
    if (oldKeys === undefined) delete process.env.PDF_VAULT_KEYS;
    else process.env.PDF_VAULT_KEYS = oldKeys;
    if (oldActive === undefined) delete process.env.PDF_VAULT_ACTIVE_KEY;
    else process.env.PDF_VAULT_ACTIVE_KEY = oldActive;
    const cleanupErrors = [];
    for (const client of clients) {
      try {
        await client.$disconnect();
      } catch {
        cleanupErrors.push("client");
      }
    }
    for (const name of owned.reverse()) {
      try {
        await control.$executeRawUnsafe(`DROP DATABASE "${name}" WITH (FORCE)`);
      } catch {
        cleanupErrors.push("database");
      }
    }
    await control.$disconnect();
    if (cleanupErrors.length) throw Error("Disposable cleanup failed");
  }
}
module.exports = { validateTarget, snapshot };
if (require.main === module)
  main().catch(() => {
    console.error(
      `::error::FAIL synthetic restore rehearsal at ${phase}. Only disposable local resources allowed; no secret subprocess output is logged.`,
    );
    process.exitCode = 1;
  });
