const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  Module = require("node:module"),
  ts = require("typescript");
function load(file, mocks) {
  const m = new Module(file, module);
  m.paths = module.paths;
  m.require = (n) => mocks[n] || (n === "server-only" ? {} : require(n));
  m._compile(
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText,
    file,
  );
  return m.exports;
}
function setup() {
  const store = new Map(),
    users = {
      u: {
        id: "u",
        name: "Teacher",
        role: "TEACHER",
        image: "https://lh3.googleusercontent.com/pic",
        email: "private@example.com",
      },
      v: { id: "v", name: "Follower", role: "STUDENT" },
      a: { id: "a", name: "Admin", role: "ADMIN" },
    },
    tid = "QB-" + "A".repeat(20);
  store.set("teacher:tid:" + tid, "u");
  let session = "v",
    queue = Promise.resolve();
  const uploads = [];
  const db = {
    user: {
      findUnique: async ({ where }) => users[where.id],
      update: async ({ where, data }) => Object.assign(users[where.id], data),
    },
    setting: {
      findUnique: async ({ where }) =>
        store.has(where.key)
          ? { key: where.key, value: store.get(where.key) }
          : null,
      count: async ({ where }) =>
        [...store.keys()].filter((k) => k.startsWith(where.key.startsWith))
          .length,
      upsert: async ({ where, create, update }) => {
        if (!store.has(where.key)) store.set(where.key, create.value);
        else if (update.value !== undefined) store.set(where.key, update.value);
      },
      deleteMany: async ({ where }) => store.delete(where.key),
      create: async ({ data }) => {
        if (store.has(data.key)) throw Error("Duplicate");
        store.set(data.key, data.value);
      },
    },
  };
  const wallet = {
    teacherTid: (id) => (id === "u" ? tid : "QB-" + "B".repeat(20)),
    walletTransaction: (fn) => {
      const run = queue.then(() => fn(db));
      queue = run.catch(() => {});
      return run;
    },
  };
  const profiles = load("lib/social-profiles.ts", {
    "@/lib/db": { db },
    "@/lib/wallet": wallet,
  });
  const actions = load("app/actions/social-profiles.ts", {
    "@/auth": {
      auth: async () => (session ? { user: { id: session } } : null),
    },
    "@/lib/db": { db },
    "@/lib/wallet": wallet,
    "@/lib/social-profiles": profiles,
    "next/cache": { revalidatePath() {} },
    "@vercel/blob": {
      put: async (path, bytes) => {
        uploads.push(bytes);
        return { url: `https://test.public.blob.vercel-storage.com/${path}` };
      },
    },
  });
  return {
    store,
    uploads,
    users,
    tid,
    profiles,
    actions,
    setSession: (id) => (session = id),
  };
}
function form(tid, follow = "yes") {
  const f = new FormData();
  f.set("tid", tid);
  f.set("follow", follow);
  return f;
}
test("profile public allowlist includes photo and real count but not email, owner ID or private wallet", async () => {
  const x = setup();
  const p = await x.profiles.publicProfile(x.tid, "v");
  assert.equal(p.name, "Teacher");
  assert.equal(p.followers, 0);
  assert.equal(p.verified, false);
  assert.equal(p.image, "https://lh3.googleusercontent.com/pic");
  assert.equal("email" in p, false);
  assert.equal("id" in p, false);
  assert.equal("wallet" in p, false);
  const official = await x.profiles.publicProfile("proshnobook");
  assert.equal(official.name, "প্রশ্নবুক.কম");
  assert.equal(official.official, true);
  assert.equal(official.verified, true);
  assert.equal(x.profiles.publicAvatar("javascript:alert(1)"), null);
  assert.equal(x.profiles.publicAvatar("https://evil.example/track.png"), null);
});
test("follow is idempotent under retries, unfollow does not go negative, rejects self and anonymous", async () => {
  const x = setup();
  const results = await Promise.all(
    Array.from({ length: 8 }, () => x.actions.followProfile({}, form(x.tid))),
  );
  assert.ok(results.every((r) => r.ok));
  assert.equal((await x.profiles.publicProfile(x.tid, "v")).followers, 1);
  assert.equal((await x.profiles.publicProfile(x.tid, "v")).following, true);
  assert.equal(
    (await x.actions.followProfile({}, form(x.tid, "no"))).followers,
    0,
  );
  assert.equal(
    (await x.actions.followProfile({}, form(x.tid, "no"))).followers,
    0,
  );
  x.setSession("u");
  assert.equal((await x.actions.followProfile({}, form(x.tid))).ok, false);
  x.setSession(null);
  assert.equal((await x.actions.followProfile({}, form(x.tid))).ok, false);
});
test("official profile follows are independent and verification requires fresh ADMIN with audit", async () => {
  const x = setup();
  assert.equal(
    (await x.actions.followProfile({}, form("proshnobook"))).ok,
    true,
  );
  assert.equal((await x.profiles.publicProfile(x.tid)).followers, 0);
  const f = new FormData();
  f.set("tid", x.tid);
  f.set("verified", "yes");
  f.set("note", "Identity documents checked");
  f.set("reviewed", "on");
  x.setSession("u");
  assert.equal((await x.actions.verifyTeacher({}, f)).ok, false);
  x.setSession("a");
  assert.equal((await x.actions.verifyTeacher({}, f)).ok, true);
  assert.equal((await x.profiles.publicProfile(x.tid)).verified, true);
  assert.equal(
    [...x.store.keys()].filter((k) => k.startsWith("social:verifyaudit:"))
      .length,
    1,
  );
  f.set("verified", "no");
  assert.equal((await x.actions.verifyTeacher({}, f)).ok, true);
  assert.equal((await x.profiles.publicProfile(x.tid)).verified, false);
  x.users.a.role = "TEACHER";
  f.set("verified", "yes");
  assert.equal((await x.actions.verifyTeacher({}, f)).ok, false);
});
test("homepage preserves old subject list and adds creation shortcuts before feed; profile photos are owner-authenticated", () => {
  const home = fs.readFileSync("app/page.tsx", "utf8");
  assert.ok(home.indexOf('className="sf-create"') < home.indexOf("<nav"));
  assert.match(home, /href="\/question-builder"/);
  assert.match(home, /href="\/ready-papers"/);
  assert.match(home, /sections.map/);
  const action = fs.readFileSync("app/actions/marketplace.ts", "utf8");
  assert.match(action, /autoPublish && form.get\("official"\) === "on"/);
  const profile = fs.readFileSync("app/actions/social-profiles.ts", "utf8");
  assert.match(profile, /limitInputPixels/);
  assert.match(profile, /social:photoquota/);
  assert.doesNotMatch(profile, /form.get\("userId"\)/);
});

test("public photo is owner-only, normalized and persists independently from future OAuth image updates", async () => {
  const x = setup();
  x.setSession("u");
  const bytes = await require("sharp")({
    create: { width: 800, height: 600, channels: 3, background: "blue" },
  })
    .jpeg()
    .toBuffer();
  const form = new FormData();
  form.set("photo", new Blob([bytes], { type: "image/jpeg" }), "photo.jpg");
  assert.equal((await x.actions.savePublicPhoto({}, form)).ok, true);
  assert.equal(x.uploads.length, 1);
  const image = await require("sharp")(x.uploads[0]).metadata();
  assert.equal(image.format, "webp");
  assert.equal(image.width, 512);
  assert.equal(image.height, 512);
  assert.equal(image.exif, undefined);
  const uploaded = (await x.profiles.publicProfile(x.tid)).image;
  x.users.u.image = "https://lh3.googleusercontent.com/changed";
  assert.equal((await x.profiles.publicProfile(x.tid)).image, uploaded);
  x.setSession(null);
  assert.equal((await x.actions.savePublicPhoto({}, form)).ok, false);
  assert.equal(x.uploads.length, 1);
});
