/** Actual Credentials sign-in + DB + built Next app. Synthetic accounts/local isolated DB only. */
const assert = require("node:assert/strict");
const { randomBytes } = require("node:crypto");
const { spawn } = require("node:child_process");
const net = require("node:net");
const {
  withDisposableWalletDatabase,
} = require("./helpers/disposable-wallet-db.cjs");
let phase = "target_guard";
async function unusedPort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}
function startServer(databaseUrl, port) {
  const child = spawn(
    process.execPath,
    [
      require.resolve("next/dist/bin/next"),
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      String(port),
    ],
    {
      detached: true,
      // Whitelist environment: do not inherit storage/payment/AI/production OAuth credentials.
      env: {
        PATH: process.env.PATH,
        HOME: process.env.HOME,
        NODE_ENV: "production",
        DATABASE_URL: databaseUrl,
        AUTH_SECRET: randomBytes(32).toString("hex"),
        AUTH_TRUST_HOST: "true",
        AUTH_URL: `http://127.0.0.1:${port}`,
        AUTH_GOOGLE_ID: "synthetic-not-a-real-google-client",
        AUTH_GOOGLE_SECRET: "synthetic-not-a-real-google-secret",
        ADMIN_EMAIL: "admin@example.invalid",
        NEXT_TELEMETRY_DISABLED: "1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  // Never forward server output (cookies/errors/connection strings) into logs.
  const ready = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Error("startup timeout")), 60000);
    const cleanup = () => {
      clearTimeout(timer);
      child.stdout.off("data", onData);
      child.off("exit", onExit);
    };
    const onExit = () => {
      cleanup();
      reject(Error("server exited"));
    };
    let tail = "";
    const onData = (data) => {
      tail = (tail + data.toString()).slice(-4096);
      if (/Ready in/.test(tail)) {
        cleanup();
        resolve();
      }
    };
    child.stdout.on("data", onData);
    child.once("exit", onExit);
    child.once("error", () => {
      cleanup();
      reject(Error("server failed"));
    });
  });
  child.stderr.on("data", () => {});
  child.stdout.on("data", () => {});
  return {
    ready,
    async stop() {
      if (child.exitCode !== null) return;
      await new Promise((resolve) => {
        const timer = setTimeout(() => {
          try {
            process.kill(-child.pid, "SIGKILL");
          } catch {}
        }, 5000);
        child.once("exit", () => {
          clearTimeout(timer);
          resolve();
        });
        try {
          process.kill(-child.pid, "SIGTERM");
        } catch {
          clearTimeout(timer);
          resolve();
        }
      });
    },
  };
}
withDisposableWalletDatabase(async (db, { databaseUrl }) => {
  phase = "seed_synthetic_roles";
  const password = randomBytes(20).toString("hex");
  const passwordHash = await require("bcryptjs").hash(password, 10);
  for (const role of ["TEACHER", "ADMIN", "STUDENT"])
    await db.user.create({
      data: {
        id: role.toLowerCase(),
        role,
        name: `Synthetic ${role}`,
        email: `${role.toLowerCase()}@example.invalid`,
        passwordHash,
      },
    });
  const port = await unusedPort(),
    origin = `http://127.0.0.1:${port}`;
  let browser, server;
  try {
    phase = "start_isolated_built_app";
    server = startServer(databaseUrl, port);
    await server.ready;
    assert.equal((await fetch(origin + "/api/health")).status, 200);
    phase = "start_browser";
    const { chromium } = require("playwright-core");
    if (!process.env.CHROMIUM_EXECUTABLE_PATH)
      throw Error("Explicit CI Chrome required");
    browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_EXECUTABLE_PATH,
      args: ["--no-sandbox"],
      headless: true,
    });
    for (const role of ["TEACHER", "ADMIN", "STUDENT"]) {
      phase = `${role.toLowerCase()}_login`;
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
      });
      await context.route("**/*", (route) =>
        route
          .request()
          .url()
          .startsWith(origin + "/")
          ? route.continue()
          : route.abort(),
      );
      const page = await context.newPage();
      page.setDefaultTimeout(20000);
      const errors = [];
      page.on("pageerror", () => errors.push("browser_runtime_error"));
      const unauthenticated = await context.request.get(origin + "/dashboard", {
        maxRedirects: 0,
      });
      assert.ok([302, 303, 307, 308].includes(unauthenticated.status()));
      await page.goto(origin + "/login?next=/dashboard");
      await page
        .locator('input[name="email"]')
        .fill(`${role.toLowerCase()}@example.invalid`);
      if (role === "TEACHER") {
        await page
          .locator('input[name="password"]')
          .fill("incorrect-local-password");
        await page.locator(".qm-login-primary").click();
        await page
          .getByRole("alert")
          .filter({ hasText: "Email or password is wrong" })
          .waitFor();
        assert.equal(
          (
            await (
              await context.request.get(origin + "/api/auth/session")
            ).json()
          ).user,
          undefined,
        );
      }
      await page.locator('input[name="password"]').fill(password);
      await page.locator(".qm-login-primary").click();
      await page.waitForURL(origin + "/dashboard");
      const session = await (
        await context.request.get(origin + "/api/auth/session")
      ).json();
      assert.equal(session.user.role, role);
      assert.equal(session.user.id, role.toLowerCase());
      phase = `${role.toLowerCase()}_private_pages_and_mobile`;
      for (const width of [390, 1280]) {
        await page.setViewportSize({ width, height: 844 });
        for (const pathname of [
          "/dashboard",
          "/wallet",
          "/dashboard/library",
        ]) {
          phase = `${role.toLowerCase()}_${width}_${pathname.replace(/\//g, "_")}`;
          const response = await page.goto(origin + pathname);
          assert.equal(response.status(), 200);
          assert.equal(new URL(page.url()).pathname, pathname);
          assert.ok(await page.locator("h1").count());
          assert.ok(
            !(await page.locator("body").innerText()).includes(
              "Application error",
            ),
          );
          const robots = await page
            .locator('meta[name="robots"]')
            .getAttribute("content");
          assert.ok(robots.includes("noindex"));
          assert.ok(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 2,
            ),
          );
        }
      }
      phase = `${role.toLowerCase()}_admin_authorization`;
      const adminPage = await page.goto(origin + "/admin/wallet");
      if (role === "ADMIN") {
        assert.equal(adminPage.status(), 200);
        assert.equal(new URL(page.url()).pathname, "/admin/wallet");
      } else assert.notEqual(new URL(page.url()).pathname, "/admin/wallet");
      assert.deepEqual(errors, []);
      await context.close();
      if (role !== "ADMIN") {
        const row = await db.setting.findUniqueOrThrow({
          where: { key: `wallet:account:${role.toLowerCase()}` },
        });
        const wallet = JSON.parse(row.value);
        assert.equal(wallet.balance, 2000);
        assert.equal(wallet.funds.bonus, 2000);
        assert.equal(
          await db.setting.count({
            where: { key: `wallet:bonus:${role.toLowerCase()}` },
          }),
          1,
        );
      }
      console.log(
        `PASS isolated ${role}: real password UI/CSRF/JWT session, private pages at 390/1280px, admin finance role boundary and one-account bonus`,
      );
    }
  } finally {
    try {
      if (browser) await browser.close();
    } finally {
      if (server) await server.stop();
    }
  }
}).catch(() => {
  console.error(
    `::error::Isolated authenticated browser check failed at ${phase}. No passwords, cookies, DB URLs or server output are logged.`,
  );
  process.exitCode = 1;
});
