const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const read = (path) => fs.readFileSync(path, "utf8");
test("feed and profile avatars opt out of article image margins and auto height", () => {
  for (const path of ["components/question-feed.tsx", "components/social-profile-header.tsx"]) {
    assert.match(read(path), /className="sf-avatar-image"/);
  }
  assert.match(read("app/globals.css"), /article img:not\(\.rp-question-raster\):not\(\.sf-avatar-image\)/);
  const rule = read("components/question-feed.css").match(/\.sf-avatar > \.sf-avatar-image\s*\{([^}]+)\}/)[1];
  assert.match(rule, /height:\s*100% !important/);
  assert.match(rule, /margin:\s*0 !important/);
  assert.match(rule, /border-radius:\s*0 !important/);
  assert.match(rule, /object-fit:\s*cover/);
});
test("profile avatar overlaps cover by half its height and paints above cover", () => {
  const css = read("components/question-feed.css");
  const avatar = css.match(/\.sf-profile-content \.sf-avatar\s*\{([^}]+)\}/)[1];
  assert.match(avatar, /height:\s*90px/);
  assert.match(avatar, /align-self:\s*flex-start/);
  // 24px content padding - 69px margin = -45px: half a 90px avatar above the edge.
  assert.match(avatar, /margin-top:\s*-69px/);
  const content = css.match(/\.sf-profile-content\s*\{([^}]+)\}/)[1];
  assert.match(content, /position:\s*relative/);
  assert.match(content, /z-index:\s*1/);
});
