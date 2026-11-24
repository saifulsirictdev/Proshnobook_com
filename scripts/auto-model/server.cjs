// Local-only UI harness: explicit synthetic fixtures and mocked Next/action boundaries.
const fs = require("node:fs"),
  path = require("node:path"),
  http = require("node:http"),
  { execFileSync } = require("node:child_process");
const root = path.resolve(__dirname, "../.."),
  output = path.join(root, ".cache/auto-model-ui");
async function build() {
  fs.mkdirSync(output, { recursive: true });
  await require("esbuild").build({
    entryPoints: [path.join(__dirname, "editor.tsx")],
    outdir: output,
    bundle: true,
    jsx: "automatic",
    external: ["/fonts/*"],
    loader: { ".woff": "file", ".woff2": "file", ".ttf": "file" },
    assetNames: "assets/[name]-[hash]",
    define: { "process.env.NODE_ENV": '"production"' },
    minify: true,
    plugins: [
      {
        name: "isolated-boundaries",
        setup(b) {
          b.onResolve(
            {
              filter:
                /^(?:next\/navigation|@\/app\/actions\/auto-model|next\/link)$/,
            },
            (args) =>
              args.path === "next/navigation"
                ? { path: path.join(__dirname, "navigation.ts") }
                : args.path === "next/link"
                  ? { path: path.join(__dirname, "link.tsx") }
                  : { path: path.join(__dirname, "action.ts") },
          );
        },
      },
    ],
  });
  execFileSync(
    path.join(root, "node_modules/.bin/tailwindcss"),
    [
      "-i",
      "scripts/math-sample/tailwind.css",
      "-o",
      path.join(output, "tailwind.css"),
      "--content",
      "components/qb-start.tsx,components/auto-model-preparation.tsx,components/paper-builder/**/*.{ts,tsx},scripts/auto-model/editor.tsx",
      "--minify",
    ],
    { cwd: root, stdio: "pipe" },
  );
}
function response(url) {
  const name = new URL(url, "https://auto.invalid").pathname;
  if (!/\.[a-z0-9]+$/i.test(name))
    return {
      body: Buffer.from(
        '<!doctype html><html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Auto Model — স্থানীয় পরীক্ষা</title><link rel="stylesheet" href="/tailwind.css"><link rel="stylesheet" href="/editor.css"></head><body><div id="root"></div><script src="/editor.js"></script></body></html>',
      ),
      contentType: "text/html; charset=utf-8",
    };
  let base = output;
  if (/^\/fonts\/[\w[\],.-]+$/.test(name)) base = path.join(root, "public");
  else if (/^\/diagrams\/[\w-]+\.png$/.test(name))
    base = path.join(root, "samples/ssc-math");
  else if (
    !/^\/(?:editor\.(?:js|css)|tailwind\.css|assets\/[\w.-]+)$/.test(name)
  )
    return { status: 404, body: "Not found" };
  const file = path.resolve(base, name.slice(1));
  if (!file.startsWith(base + path.sep) || !fs.existsSync(file))
    return { status: 404, body: "Not found" };
  return {
    body: fs.readFileSync(file),
    contentType:
      {
        ".js": "text/javascript",
        ".css": "text/css",
        ".png": "image/png",
        ".ttf": "font/ttf",
        ".woff2": "font/woff2",
      }[path.extname(file)] || "application/octet-stream",
  };
}
module.exports = { build, response };
if (require.main === module)
  build()
    .then(() =>
      http
        .createServer((req, res) => {
          const r = response(req.url);
          res.writeHead(r.status || 200, {
            "Content-Type": r.contentType || "text/plain",
          });
          res.end(r.body);
        })
        .listen(Number(process.env.PORT || 3081), "0.0.0.0", () =>
          console.log(
            "Auto Model component review ready: " + (process.env.PORT || 3081),
          ),
        ),
    )
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    });
