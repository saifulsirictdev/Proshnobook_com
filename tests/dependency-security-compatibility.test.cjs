const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { z } = require("zod");
const katex = require("katex");
const { deepmerge } = require("deepmerge-ts");

test("patched Zod rejects oversized collections before per-element refinements", () => {
  let visits = 0;
  const bounded = z
    .array(
      z.string().refine(() => {
        visits++;
        return true;
      }),
    )
    .max(2);
  assert.equal(bounded.safeParse(Array(10000).fill("bounded")).success, false);
  assert.equal(visits, 0);
  assert.equal(bounded.safeParse(["one"]).success, true);
  assert.equal(visits, 1);
});

test("Zod migration retains parsed nested defaults and string-keyed records", () => {
  const schema = z.object({
    layout: z
      .object({
        paper: z.enum(["A4", "Letter"]).default("A4"),
        margin: z.number().min(0).default(53),
      })
      .prefault({}),
    answers: z.record(z.string(), z.number().int()).optional(),
  });
  assert.deepEqual(schema.parse({}), { layout: { paper: "A4", margin: 53 } });
  assert.deepEqual(schema.parse({ answers: { q1: 2 } }).answers, { q1: 2 });
  assert.equal(schema.safeParse({ answers: { q1: "2" } }).success, false);
  assert.equal(schema.safeParse({ layout: { margin: -1 } }).success, false);
  for (const file of ["lib/paper-builder.ts", "lib/english/draft.ts"]) {
    const code = fs.readFileSync(file, "utf8");
    assert.ok(code.includes(".prefault({})"));
    assert.ok(!code.includes(".default({})"));
  }
});

test("patched KaTeX still renders fractions and does not trust executable links", () => {
  const html = katex.renderToString("\\frac{1}{2} + x^2", {
    throwOnError: false,
    trust: false,
  });
  assert.ok(html.includes("katex"));
  assert.ok(html.includes("mfrac"));
  const unsafe = katex.renderToString("\\href{javascript:alert(1)}{click}", {
    throwOnError: false,
    trust: false,
    strict: "ignore",
  });
  assert.ok(!unsafe.includes('href="javascript:'));
});

test("Prisma tooling merge override preserves nested config without prototype pollution", () => {
  assert.deepEqual(
    deepmerge({ a: { x: 1 }, list: [1] }, { a: { y: 2 }, list: [2] }),
    { a: { x: 1, y: 2 }, list: [1, 2] },
  );
  deepmerge({}, JSON.parse('{"__proto__":{"polluted":true}}'));
  assert.equal({}.polluted, undefined);
  const lock = JSON.parse(fs.readFileSync("package-lock.json", "utf8"));
  assert.equal(lock.packages["node_modules/zod"].version, "4.6.7");
  assert.equal(lock.packages["node_modules/katex"].version, "0.19.1");
  assert.equal(lock.packages["node_modules/deepmerge-ts"].version, "8.0.0");
});
