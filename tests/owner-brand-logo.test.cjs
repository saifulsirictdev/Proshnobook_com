const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const sharp = require("sharp");
test("owner P artwork supplies all correctly sized brand/app icons with safe maskable margins", async () => {
  for (const [file, size] of [
    ["proshnobook-p-logo.png", 512],
    ["proshnobook-p-192.png", 192],
    ["proshnobook-p-maskable.png", 512],
    ["proshnobook-p-apple.png", 180],
    ["proshnobook-p-favicon.png", 32],
  ]) {
    const image = sharp("public/" + file);
    const meta = await image.metadata();
    assert.equal(meta.width, size);
    assert.equal(meta.height, size);
    const { data, info } = await image
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    let pink = 0;
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * info.channels;
        if (
          data[i] > 90 &&
          data[i] - data[i + 1] > 35 &&
          data[i + 2] - data[i + 1] > 15
        ) {
          pink++;
          if (file.includes("maskable"))
            assert.ok(Math.hypot(x - size / 2, y - size / 2) < size * 0.4);
        }
      }
    assert.ok(pink > size * size * 0.1);
  }
  assert.deepEqual(
    fs.readFileSync("public/logo.png"),
    fs.readFileSync("public/proshnobook-p-logo.png"),
  );
  assert.deepEqual(
    fs.readFileSync("public/questionmaker-icon.png"),
    fs.readFileSync("public/proshnobook-p-logo.png"),
  );
});
test("header, intro, install, official fallback, metadata and manifest use owner brand, not teacher/institution photos", () => {
  for (const file of [
    "components/site-header.tsx",
    "components/Logo.tsx",
    "components/brand-wordmark.tsx",
    "components/auth/login-dialog.tsx",
    "components/brand-intro.tsx",
    "components/InstallPrompt.tsx",
    "lib/social-profiles.ts",
  ])
    assert.ok(
      fs.readFileSync(file, "utf8").includes("/proshnobook-p-logo.png"),
    );
  for (const file of ["lib/seo.ts", "lib/site-identity.ts"])
    assert.ok(fs.readFileSync(file, "utf8").includes("/proshnobook-p-192.png"));
  const layout = fs.readFileSync("app/layout.tsx", "utf8");
  assert.ok(layout.includes("/proshnobook-p-favicon.png"));
  assert.ok(layout.includes("/proshnobook-p-apple.png"));
  assert.ok(
    fs
      .readFileSync("app/manifest.ts", "utf8")
      .includes("/proshnobook-p-maskable.png"),
  );
});
