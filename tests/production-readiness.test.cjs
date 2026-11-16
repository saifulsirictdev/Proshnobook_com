const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const ts = require("typescript");
const { pathToFileURL } = require("node:url");
function load(file, mocks = {}) {
  const m = new Module(file, module);
  m.paths = module.paths;
  m.require = (id) =>
    id === "server-only"
      ? {}
      : Object.hasOwn(mocks, id)
        ? mocks[id]
        : require(id);
  m._compile(
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText,
    file,
  );
  return m.exports;
}
function limiter() {
  const store = new Map();
  let queue = Promise.resolve();
  let failing = false;
  const db = {
    $transaction: (fn) => {
      const result = queue.then(async () => {
        if (failing) throw Error("sensitive database URL must not escape");
        return fn({
          $queryRaw: async (sql, key) => {
            assert.ok(Array.isArray(sql));
            assert.match(key, /^security:auth-attempt:v1:/);
          },
          setting: {
            findUnique: async ({ where }) =>
              store.has(where.key) ? { value: store.get(where.key) } : null,
            upsert: async ({ where, create, update }) =>
              store.set(
                where.key,
                store.has(where.key) ? update.value : create.value,
              ),
          },
        });
      });
      queue = result.catch(() => {});
      return result;
    },
  };
  return {
    store,
    fail: () => {
      failing = true;
    },
    ...load("lib/auth-attempts.ts", { "@/lib/db": { db } }),
  };
}
test("shared auth counters normalize identity, bound concurrent attempts, reset windows and never store email", async () => {
  const x = limiter();
  const now = 1800000;
  const outcomes = await Promise.all(
    Array.from({ length: 15 }, (_, i) =>
      x.reserveAuthAttempt(
        "credentials",
        i % 2 ? " A@Example.com " : "a@example.com",
        now,
      ),
    ),
  );
  assert.equal(outcomes.filter(Boolean).length, 10);
  assert.equal(x.store.size, 1);
  assert.ok(!JSON.stringify([...x.store]).includes("example.com"));
  assert.equal(
    await x.reserveAuthAttempt("credentials", "a@example.com", now + 900000),
    true,
  );
  assert.equal(x.store.size, 1);
  assert.equal(
    await x.reserveAuthAttempt("credentials", "b@example.com", now),
    true,
  );
  for (let i = 0; i < 5; i++)
    assert.equal(
      await x.reserveAuthAttempt("registration", "a@example.com", now),
      true,
    );
  assert.equal(
    await x.reserveAuthAttempt("registration", "a@example.com", now),
    false,
  );
});
test("auth counters fail closed on invalid state, store failures and backwards clocks", async () => {
  const x = limiter();
  assert.equal(
    await x.reserveAuthAttempt("credentials", "a@example.com", 9000000),
    true,
  );
  for (let i = 0; i < 9; i++)
    assert.equal(
      await x.reserveAuthAttempt("credentials", "a@example.com", 0),
      true,
    );
  assert.equal(
    await x.reserveAuthAttempt("credentials", "a@example.com", 9000000),
    false,
  );
  const key = [...x.store.keys()][0];
  x.store.set(key, "broken");
  assert.equal(
    await x.reserveAuthAttempt("credentials", "a@example.com", 9000000),
    false,
  );
  const y = limiter();
  y.fail();
  assert.equal(
    await y.reserveAuthAttempt("credentials", "a@example.com"),
    false,
  );
  assert.equal(await y.reserveAuthAttempt("credentials", ""), false);
});
test("direct Credentials provider denies rate-limited requests before lookup/hash work; Google stays verified", async () => {
  let config,
    allowed = false,
    lookups = 0,
    compares = 0;
  load("auth.ts", {
    "@/lib/account-type": { ACCOUNT_TYPE_PREFIX: "account-type:v1:" },
    "@/lib/auth-attempts": {
      reserveAuthAttempt: async (kind, email) => {
        assert.equal(kind, "credentials");
        assert.equal(email, "a@example.com");
        return allowed;
      },
    },
    "@/lib/wallet": { ensureWallet: async () => {} },
    "@/lib/db": {
      db: {
        user: {
          findUnique: async () => {
            lookups++;
            return {
              id: "u",
              email: "a@example.com",
              name: "User",
              role: "STUDENT",
              passwordHash: "hash",
            };
          },
        },
      },
    },
    "next-auth": {
      __esModule: true,
      default: (c) => {
        config = c;
        return {};
      },
    },
    "next-auth/providers/credentials": { __esModule: true, default: (c) => c },
    "next-auth/providers/google": { __esModule: true, default: {} },
    bcryptjs: {
      __esModule: true,
      default: {
        compare: async () => {
          compares++;
          return true;
        },
      },
    },
    "./auth.config": { __esModule: true, default: { callbacks: {} } },
  });
  const provider = config.providers[1];
  assert.equal(
    await provider.authorize({
      email: " A@example.com ",
      password: "password",
    }),
    null,
  );
  assert.equal(lookups, 0);
  assert.equal(compares, 0);
  allowed = true;
  const user = await provider.authorize({
    email: "A@example.com",
    password: "password",
  });
  assert.equal(user.id, "u");
  assert.equal(user.passwordHash, undefined);
  assert.equal(compares, 1);
  assert.equal(
    await config.callbacks.signIn({
      account: { provider: "google" },
      profile: { email_verified: false },
    }),
    false,
  );
});
test("health route is explicitly uncached liveness and exposes no environment or database details", async () => {
  const response = load("app/api/health/route.ts").GET();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok", check: "liveness" });
  assert.match(response.headers.get("cache-control"), /no-store/);
  assert.match(response.headers.get("x-robots-tag"), /noindex/);
});
test("security headers preserve preview embedding and same-origin production printing", async () => {
  const config = (
    await import(pathToFileURL(process.cwd() + "/next.config.mjs").href)
  ).default;
  const old = process.env.VERCEL_ENV;
  try {
    process.env.VERCEL_ENV = "production";
    const rules = await config.headers();
    const headers = Object.fromEntries(
      rules[0].headers.map(({ key, value }) => [key, value]),
    );
    assert.equal(headers["X-Content-Type-Options"], "nosniff");
    assert.equal(headers["X-Frame-Options"], "SAMEORIGIN");
    assert.equal(headers["Referrer-Policy"], "strict-origin-when-cross-origin");
    process.env.VERCEL_ENV = "preview";
    assert.ok(
      !(await config.headers())[0].headers.some(
        ({ key }) => key === "X-Frame-Options",
      ),
    );
    assert.equal(config.poweredByHeader, false);
  } finally {
    if (old === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = old;
  }
});

test("registration checks attempts before lookup/hash, bounds new bcrypt secrets by UTF-8 bytes", async () => {
  let allowed = false,
    reads = 0,
    hashes = 0,
    creates = 0,
    reservations = 0;
  const actions = load("app/actions/auth.ts", {
    "@/lib/auth-attempts": {
      reserveAuthAttempt: async (kind) => {
        assert.equal(kind, "registration");
        reservations++;
        return allowed;
      },
    },
    "@/lib/login-redirect": { safeLoginRedirect: () => "/" },
    "@/auth": { signIn: async () => {} },
    "@/lib/db": {
      db: {
        user: {
          findUnique: async () => {
            reads++;
            return null;
          },
          create: async ({ data }) => {
            assert.equal(data.role, "STUDENT");
            creates++;
          },
        },
      },
    },
    "next-auth": { AuthError: class AuthError extends Error {} },
    bcryptjs: {
      __esModule: true,
      default: {
        hash: async () => {
          hashes++;
          return "hash";
        },
      },
    },
  });
  const f = new FormData();
  f.set("name", "Teacher");
  f.set("email", "a@example.com");
  f.set("password", "password123");
  assert.match(await actions.register("", f), /পরে/);
  assert.equal(reads, 0);
  assert.equal(hashes, 0);
  allowed = true;
  f.set("password", "আ".repeat(25));
  assert.notEqual(await actions.register("", f), "");
  assert.equal(reservations, 1);
  assert.equal(hashes, 0);
  f.set("password", "আ".repeat(24));
  assert.equal(await actions.register("", f), "");
  assert.equal(hashes, 1);
  assert.equal(creates, 1);
});

test("remaining PDF.js 3 browser entry points disable eval; error screen never renders raw exceptions", () => {
  for (const file of [
    "components/qb-extract.tsx",
    "lib/pdf-mcq/browser-extract.ts",
  ]) {
    const code = fs.readFileSync(file, "utf8");
    assert.match(code, /getDocument\(\{[^}]*isEvalSupported:\s*false/s);
  }
  const React = require("react"),
    { renderToStaticMarkup } = require("react-dom/server");
  const ErrorPage = load("app/error.tsx", {
    "next/link": {
      __esModule: true,
      default: (p) => React.createElement("a", p, p.children),
    },
  }).default;
  const html = renderToStaticMarkup(
    React.createElement(ErrorPage, {
      error: new Error("database secret URL"),
      reset: () => {},
    }),
  );
  assert.ok(!html.includes("database secret URL"));
  for (const href of ["/wallet", "/dashboard/library", "/contact-us"])
    assert.ok(html.includes(`href="${href}"`));
});
