/** Main previously referenced chapter 11 files that have not shipped. */
const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  Module = require("node:module"),
  ts = require("typescript");
test("Class 7 BGS registry imports only shipped sources and retains all 10 available chapters", () => {
  const source = fs.readFileSync("lib/class7-bgs-batches.ts", "utf8");
  for (const [, file] of source.matchAll(/from "(@\/content\/[^\"]+)"/g))
    assert.ok(fs.existsSync(file.slice(2)), file);
  const resolve = Module._resolveFilename,
    previous = require.extensions[".ts"];
  try {
    Module._resolveFilename = function (id, parent, ...rest) {
      return resolve.call(
        this,
        id.startsWith("@/") ? path.resolve(id.slice(2)) : id,
        parent,
        ...rest,
      );
    };
    require.extensions[".ts"] = (m, file) =>
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
    const batches = require("../lib/class7-bgs-batches.ts").class7BgsBatches();
    assert.equal(batches.length, 20);
    assert.equal(
      batches.reduce((n, b) => n + b.records.length, 0),
      3700,
    );
    assert.deepEqual(
      [...new Set(batches.map((b) => Number(b.id.match(/ch(\d+)-/)[1])))],
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    );
  } finally {
    Module._resolveFilename = resolve;
    if (previous) require.extensions[".ts"] = previous;
    else delete require.extensions[".ts"];
  }
});
