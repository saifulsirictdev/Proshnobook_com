/** Derive icons from the owner's supplied artwork; no generated/redrawn logo. */
const sharp = require("sharp");
const fs = require("node:fs");
(async () => {
  const input = "public/brand/p-logo-original.jpg";
  const { data, info } = await sharp(input)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let left = info.width,
    top = info.height,
    right = 0,
    bottom = 0;
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * info.channels,
        r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      if (r > 90 && r - g > 35 && b - g > 15) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
  if (right <= left || bottom <= top) throw Error("Missing supplied P artwork");
  const crop = await sharp(input)
    .extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
    .png()
    .toBuffer();
  for (const [name, size, ratio] of [
    ["proshnobook-p-logo.png", 512, 0.84],
    ["proshnobook-p-192.png", 192, 0.84],
    ["proshnobook-p-maskable.png", 512, 0.55],
    ["proshnobook-p-apple.png", 180, 0.78],
    ["proshnobook-p-favicon.png", 32, 0.9],
  ]) {
    const mark = await sharp(crop)
      .resize(Math.round(size * ratio), Math.round(size * ratio), {
        fit: "inside",
      })
      .png()
      .toBuffer();
    await sharp({
      create: { width: size, height: size, channels: 3, background: "#ffffff" },
    })
      .composite([{ input: mark, gravity: "centre" }])
      .png()
      .toFile("public/" + name);
  }
  // Backward-compatible URLs for previously cached links/bookmarks/search results.
  for (const [name, source] of [
    ["questionmaker-icon.png", "proshnobook-p-logo.png"],
    ["questionmaker-icon-192.png", "proshnobook-p-192.png"],
    ["logo.png", "proshnobook-p-logo.png"],
  ])
    fs.copyFileSync("public/" + source, "public/" + name);
  const png = fs
    .readFileSync("public/proshnobook-p-logo.png")
    .toString("base64");
  fs.writeFileSync(
    "public/questionmaker-icon.svg",
    `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><image width="512" height="512" href="data:image/png;base64,${png}"/></svg>\n`,
  );
})();
