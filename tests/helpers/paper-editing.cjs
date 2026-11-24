const fs = require("node:fs"),
  ts = require("typescript"),
  Module = require("node:module");
const dependencies = {};
function load(file, mocks = {}) {
  const m = new Module(file, module);
  m.paths = module.paths;
  m.require = (n) =>
    Object.hasOwn(mocks, n)
      ? mocks[n]
      : Object.hasOwn(dependencies, n)
        ? dependencies[n]
        : require(n);
  m._compile(
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText,
    file,
  );
  return m.exports;
}
dependencies["./paper-fonts"] = dependencies["@/lib/paper-fonts"] =
  load("lib/paper-fonts.ts");
dependencies["@/lib/paper-rich-format"] = load("lib/paper-rich-format.ts");
dependencies["@/lib/paper-margins"] = load("lib/paper-margins.ts");
dependencies["./english/editable-text"] = dependencies[
  "@/lib/english/editable-text"
] = load("lib/english/editable-text.ts");
dependencies["./ready-text-block"] = dependencies["@/lib/ready-text-block"] =
  load("lib/ready-text-block.ts");
module.exports = { load, dependencies };
