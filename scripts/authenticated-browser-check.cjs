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
  for (const type of ["TEACHER", "STUDENT", "CONTRIBUTOR"]) {
    const id = `join-${type.toLowerCase()}`;
    await db.user.create({ data: { id, email: `${id}@example.invalid`, name: "Synthetic Join", role: "STUDENT", passwordHash } });
    await db.setting.create({ data: { key: "account-type:v1:" + id, value: "PENDING" } });
  }
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
      page.on("pageerror", (error) => {
        // Only allowlisted numeric React codes and our own phase labels reach CI.
        const reactCode = /Minified React error #(\d+)/.exec(error.message)?.[1];
        const kind = reactCode ? `react_${reactCode}` : "browser_runtime_error";
        errors.push(`${phase}_${kind}`);
      });
      const unauthenticated = await context.request.get(origin + "/dashboard", {
        maxRedirects: 0,
      });
      assert.ok([302, 303, 307, 308].includes(unauthenticated.status()));
      await page.goto(origin + "/login?next=/dashboard", { waitUntil: "networkidle" });
      await page.locator(".qm-login-mark").scrollIntoViewIfNeeded();
      await page.waitForFunction(() => {
        const image = document.querySelector(".qm-login-mark");
        return image?.complete && image.naturalWidth === 512;
      });
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
        phase = "teacher_wrong_password_session";
        const rejectedSession = await (
          await context.request.get(origin + "/api/auth/session")
        ).json();
        assert.ok(!rejectedSession?.user);
      }
      phase = `${role.toLowerCase()}_correct_credentials`;
      // React 19 form actions reset uncontrolled fields even when returning an error state.
      await page
        .locator('input[name="email"]')
        .fill(`${role.toLowerCase()}@example.invalid`);
      await page.locator('input[name="password"]').fill(password);
      await page.locator(".qm-login-primary").click();
      await page.waitForURL(origin + (role === "STUDENT" ? "/model-test" : role === "ADMIN" ? "/teachers/proshnobook" : "/dashboard"), { waitUntil: "networkidle" });
      phase = `${role.toLowerCase()}_session_identity`;
      const session = await (
        await context.request.get(origin + "/api/auth/session")
      ).json();
      assert.equal(session.user.role, role);
      assert.equal(session.user.id, role.toLowerCase());
      phase = `${role.toLowerCase()}_private_pages_and_mobile`;
      for (const width of [390, 1280, 390, 1280]) {
        await page.setViewportSize({ width, height: 844 });
        for (const pathname of (role === "STUDENT" ? ["/wallet", "/dashboard/library"] : ["/dashboard", "/wallet", "/dashboard/library"])) {
          phase = `${role.toLowerCase()}_${width}_${pathname.replace(/\//g, "_")}`;
          const response = await page.goto(origin + pathname, { waitUntil: "networkidle" });
          assert.equal(response.status(), 200);
          assert.equal(new URL(page.url()).pathname, pathname);
          if (pathname === "/dashboard") {
            await page.locator(".qm-wordmark-mark").scrollIntoViewIfNeeded();
            await page.waitForFunction(() => {
              const image = document.querySelector(".qm-wordmark-mark");
              return image?.complete && image.naturalWidth === 512;
            });
          }
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
      if (role === "STUDENT") {
        phase = "student_creator_boundaries";
        for (const path of ["/question-builder", "/question-builder/prepare", "/ready-papers/upload"]) {
          await page.goto(origin + path, { waitUntil: "networkidle" });
          assert.equal(new URL(page.url()).pathname, "/model-test");
        }
        for (const path of ["/api/qb/questions", "/api/qb/extract-pdf", "/api/ready-ai"]) {
          const result = await context.request.post(origin + path, { data: { ids: ["not-owned"] } });
          assert.ok([401, 403].includes(result.status()));
        }
      } else {
      phase = `${role.toLowerCase()}_exam_preparation_outline`;
      await page.goto(origin + "/question-builder", { waitUntil: "networkidle" });
      for (const width of [390, 1280]) {
        await page.setViewportSize({ width, height: 844 });
        await page.getByRole("button", { name: "Admission", exact: true }).click();
        await page.getByLabel("পরীক্ষার প্রস্তুতির ধরন", { exact: true }).selectOption("medical-dental");
        await page.getByLabel("বিষয়", { exact: true }).selectOption("জীববিজ্ঞান");
        await page.getByLabel("প্রস্তুতির টপিক", { exact: true }).selectOption({ index: 1 });
        assert.ok((await page.locator("body").innerText()).includes("অফিশিয়াল বা বছরভিত্তিক যাচাইকৃত সিলেবাস নয়"));
        assert.ok(await page.getByRole("button", { name: "প্রশ্ন তৈরী করুন", exact: true }).isEnabled());
        await page.getByRole("button", { name: "Job", exact: true }).click();
        assert.equal(await page.getByLabel("বিষয়", { exact: true }).inputValue(), "");
        await page.getByLabel("পরীক্ষার প্রস্তুতির ধরন", { exact: true }).selectOption("ntrca");
        await page.getByLabel("NTRCA শাখা", { exact: true }).selectOption("school");
        await page.getByLabel("বিষয়", { exact: true }).selectOption("বাংলা");
        await page.getByLabel("প্রস্তুতির টপিক", { exact: true }).selectOption({ index: 1 });
        await page.getByLabel("NTRCA শাখা", { exact: true }).selectOption("college");
        assert.equal(await page.getByLabel("বিষয়", { exact: true }).inputValue(), "");
        await page.getByLabel("বিষয়", { exact: true }).selectOption("সাধারণ গণিত");
        assert.ok((await page.getByLabel("প্রস্তুতির টপিক", { exact: true }).innerText()).includes("ত্রিকোণমিতি"));
        assert.equal(await page.locator('select[name="questionType"]').inputValue(), "MCQ");
        assert.ok(await page.locator('select[name="questionType"]').isDisabled());
        const exams = await page.getByLabel("পরীক্ষার প্রস্তুতির ধরন", { exact: true }).locator("option").count();
        assert.equal(exams, 5);
        await page.getByLabel("পরীক্ষার প্রস্তুতির ধরন", { exact: true }).selectOption("govt-11-20");
        assert.equal(await page.getByLabel("বিষয়", { exact: true }).inputValue(), "");
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
        // Never enter prepare: it can invoke paid generation; UI selection only.
      }
      }
      phase = `${role.toLowerCase()}_admin_authorization`;
      const adminPage = await page.goto(origin + "/admin/wallet", { waitUntil: "networkidle" });
      if (role === "ADMIN") {
        assert.equal(adminPage.status(), 200);
        assert.equal(new URL(page.url()).pathname, "/admin/wallet");
      } else assert.notEqual(new URL(page.url()).pathname, "/admin/wallet");
      if (role === "TEACHER") {
        for (const width of [1024, 1440]) {
          await page.setViewportSize({ width, height: 1000 });
          for (const route of ["/exam", "/model-test", "/packages", "/profile", "/ready-papers", "/marketplace", "/dashboard/sell"]) {
            phase = `desktop_features_${width}_${route.replace(/\//g, "_")}`;
            const response = await page.goto(origin + route, { waitUntil: "networkidle" });
            assert.equal(response.status(), 200);
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
            if (route === "/exam") {
              assert.equal(await page.locator(".qm-exam-setup form").evaluate(el => getComputedStyle(el).gridTemplateColumns.split(" ").length), 2);
            }
          }
        }
      }
      if (role === "ADMIN") {
        phase = "admin_mcq_import_pending_and_repeat";
        await page.goto(origin + "/admin/questions/import", { waitUntil: "networkidle" });
        await page.getByText("পুরোনো ষষ্ঠ শ্রেণির JSON import ও পরিসংখ্যান", { exact: true }).click();
        const fixture = {
          subject: "গণিত", topic: "১. স্বাভাবিক সংখ্যা ও ভগ্নাংশ", book: "Synthetic CI fixture, not textbook content", edition: "test",
          sourceUrl: "https://example.invalid/synthetic-only", lang: "Bangla",
          items: [{ text: "Synthetic CI arithmetic: 2 + 2?", options: { A: "4", B: "3", C: "5", D: "6" }, correct: "A", explanation: "Synthetic regression fixture only", page: "1", difficulty: "EASY" }]
        };
        await page.getByLabel("প্রশ্নের JSON", { exact: true }).fill(JSON.stringify(fixture));
        await page.getByRole("button", { name: "প্রিভিউ ও গঠন যাচাই", exact: true }).click();
        phase = "admin_mcq_preview_checkbox";
        await page.getByRole("checkbox").check();
        phase = "admin_mcq_before_save";
        const before = await db.question.count({ where: { text: fixture.items[0].text } });
        assert.equal(before, 0);
        await page.getByRole("button", { name: "Pending হিসেবে সেভ করুন", exact: true }).click();
        phase = "admin_mcq_saved_status";
        await page.getByRole("status").filter({ hasText: "Pending প্রশ্ন সেভ হয়েছে" }).waitFor();
        phase = "admin_mcq_saved_db";
        const row = await db.question.findFirstOrThrow({ where: { text: fixture.items[0].text } });
        assert.equal(row.approved, false);
        assert.equal(row.category, "Class 6");
        phase = "admin_mcq_repeat_reload";
        // The success message can render before the revalidated server tree has
        // settled. Start the repeat from a fresh page instead of racing a details
        // node that the first action can still replace. The same authenticated
        // browser, identical payload and real receipt/dedup assertions remain.
        await page.goto(origin + "/admin/questions/import", { waitUntil: "networkidle" });
        await page.getByText("পুরোনো ষষ্ঠ শ্রেণির JSON import ও পরিসংখ্যান", { exact: true }).click();
        phase = "admin_mcq_repeat_preview";
        await page.getByLabel("প্রশ্নের JSON", { exact: true }).fill(JSON.stringify(fixture));
        await page.getByRole("button", { name: "প্রিভিউ ও গঠন যাচাই", exact: true }).click();
        phase = "admin_mcq_repeat_consent";
        await page.getByRole("checkbox").check();
        phase = "admin_mcq_repeat_save";
        await page.getByRole("button", { name: "Pending হিসেবে সেভ করুন", exact: true }).click();
        phase = "admin_mcq_repeat_status";
        await page.getByRole("status").filter({ hasText: "0টি Pending" }).waitFor();
        phase = "admin_mcq_repeat_db";
        assert.equal(await db.question.count({ where: { text: fixture.items[0].text } }), 1);
        assert.equal(await db.setting.count({ where: { key: { startsWith: "mcqimport:v1:" } } }), 1);
        phase = "admin_prepared_batch_load_read_only";
        await page.goto(origin + "/admin/questions/import", { waitUntil: "networkidle" });
        await page.getByText("পুরোনো ষষ্ঠ শ্রেণির JSON import ও পরিসংখ্যান", { exact: true }).click();
        const countBeforePrepared = await db.question.count();
        await page.getByRole("button", { name: "প্রস্তুত ১০০টি প্রশ্ন লোড করুন", exact: true }).click();
        const loaded = JSON.parse(await page.getByLabel("প্রশ্নের JSON", { exact: true }).inputValue());
        assert.equal(loaded.items.length, 100);
        assert.equal(await db.question.count(), countBeforePrepared);
        await page.getByRole("button", { name: "প্রিভিউ ও গঠন যাচাই", exact: true }).click();
        await page.getByRole("checkbox").waitFor();
        assert.equal(await page.locator("ol > li").count(), 100);
        assert.equal(await db.question.count(), countBeforePrepared);
        phase = "admin_prepared_batch_save_pending";
        await page.getByRole("checkbox").check();
        await page.getByRole("button", { name: "Pending হিসেবে সেভ করুন", exact: true }).click();
        await page.getByRole("status").filter({ hasText: "100টি Pending" }).waitFor();
        assert.equal(await db.question.count(), countBeforePrepared + 100);
        assert.equal(await db.question.count({ where: { category: "Class 6", approved: true } }), 0);
        assert.equal(await db.setting.count({ where: { key: { startsWith: "mcqimport:v1:" } } }), 2);
        phase = "admin_mcq_overflow";
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
        // Real authenticated catalog routing, not just pure registry availability.
        // Browsing the new review drafts must not import or approve anything.
        const englishBefore = await db.setting.count({where:{key:{startsWith:"english-item:v1:"}}});
        for (const grade of [6, 7]) {
          phase = `admin_junior_paper2_catalog_${grade}`;
          await page.setViewportSize({width:390,height:844});
          await page.goto(origin + `/admin/questions/import?category=Class%20${grade}&subject=English%202nd%20Paper&grade=${grade}`, {waitUntil:"networkidle"});
          const section = page.locator("#english-question-items");
          await section.getByRole("heading",{name:`Class ${grade} · English 2nd Paper — Question Item`,exact:true}).waitFor();
          assert.equal(await section.locator(":scope > details").count(),40);
          assert.equal(await section.locator("summary").filter({hasText:new RegExp(`class${grade}-paper2-authored-model-0[2-5]`)}).count(),32);
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
          assert.equal(await db.setting.count({where:{key:{startsWith:"english-item:v1:"}}}),englishBefore);
          phase = `admin_junior_paper2_review_${grade}`;
          await page.goto(origin + `/admin/questions?category=Class%20${grade}&subject=English%202nd%20Paper&grade=${grade}&status=pending`,{waitUntil:"networkidle"});
          await page.locator("#english-question-items").getByRole("heading",{name:`Class ${grade} · English 2nd Paper — Question Item`,exact:true}).waitFor();
          assert.equal(await db.setting.count({where:{key:{startsWith:"english-item:v1:"}}}),englishBefore);
        }
      }
      if (role === "TEACHER") {
        try {
          await require("./english-browser/authenticated-flow.cjs").runEnglishWorkflow({db,page,context,origin,testPassword:password,setPhase:value=>{phase=value;}});
        } catch (error) {
          // Only synthetic isolated pages; no passwords/cookies/server logs in artifacts.
          const fs = require("node:fs"), out = ".cache/english-authenticated-flow";
          fs.mkdirSync(out,{recursive:true});
          const diagnostic = {phase,errorType:error.name,
            ...(error.code === "ERR_ASSERTION" ? {assertion:String(error.message).split("\n")[0],actual:typeof error.actual === "number" || typeof error.actual === "boolean" ? error.actual : undefined,expected:typeof error.expected === "number" || typeof error.expected === "boolean" ? error.expected : undefined} : {}),
            viewport:await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth})).catch(()=>null)};
          fs.writeFileSync(out+"/failure.json",JSON.stringify(diagnostic));
          console.error("::error::Isolated English diagnostic: "+JSON.stringify(diagnostic));
          await page.screenshot({path:out+"/failure.png"}).catch(()=>{});
          throw error;
        }
      }
      phase = `${role.toLowerCase()}_browser_runtime_clean`;
      if (errors.length) {
        phase = errors[0];
        assert.deepEqual(errors, []);
      }
      await context.close();
      if (role !== "ADMIN") {
        phase = `${role.toLowerCase()}_bonus_once`;
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
    // Exercise the real post-verification onboarding UI with synthetic pending rows.
    // This tests application onboarding, not Google OAuth itself.
    for (const type of ["TEACHER", "STUDENT", "CONTRIBUTOR"]) {
      phase = `onboarding_${type.toLowerCase()}`;
      const id = `join-${type.toLowerCase()}`;
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      await context.route("**/*", route => route.request().url().startsWith(origin + "/") ? route.continue() : route.abort());
      const page = await context.newPage();
      const runtimeErrors = [];
      page.on("pageerror", () => runtimeErrors.push("runtime_error"));
      await page.goto(origin + "/login", { waitUntil: "networkidle" });
      await page.locator('input[name="email"]').fill(`${id}@example.invalid`);
      await page.locator('input[name="password"]').fill(password);
      await page.locator(".qm-login-primary").click();
      await page.waitForURL(origin + "/auth/onboarding");
      phase = `onboarding_${type.toLowerCase()}_cards`;
      assert.equal(await page.locator('button[name="accountType"]').count(), 3);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
      phase = `onboarding_${type.toLowerCase()}_submit`;
      await page.locator(`button[value="${type}"]`).click();
      await page.waitForURL(origin + (type === "STUDENT" ? "/model-test" : "/dashboard"), { waitUntil: "networkidle" });
      phase = `onboarding_${type.toLowerCase()}_persistence`;
      const current = await db.user.findUniqueOrThrow({ where: { id } });
      assert.equal(current.role, type === "STUDENT" ? "STUDENT" : "TEACHER");
      assert.equal((await db.setting.findUniqueOrThrow({ where: { key: "account-type:v1:" + id } })).value, type);
      const session = await (await context.request.get(origin + "/api/auth/session")).json();
      assert.equal(session.user.role, current.role);
      phase = `onboarding_${type.toLowerCase()}_label`;
      if (type === "CONTRIBUTOR") assert.ok((await page.locator("body").innerText()).toLowerCase().includes("contributor"));
      phase = `onboarding_${type.toLowerCase()}_repeat`;
      await page.goto(origin + "/auth/onboarding", { waitUntil: "networkidle" });
      assert.notEqual(new URL(page.url()).pathname, "/auth/onboarding");
      assert.deepEqual(runtimeErrors, []);
      await context.close();
      console.log(`PASS isolated one-time onboarding ${type}; not a Google provider verification`);
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
