const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),Module=require('node:module');
test('disposable finance harness resolves real paper settings relative schema dependencies',()=>{
 const source=fs.readFileSync('scripts/wallet-transfer-postgres-check.cjs','utf8');
 const loaderSource=source.slice(source.indexOf('  const cache = {};'),source.indexOf('  const wallet = load('));
 assert.ok(loaderSource.includes('function load(file)'));
 const load=new Function('fs','path','ts','Module','db','session','module',loaderSource+';return load;')(fs,path,ts,Module,{},null,module);
 const builder=load('lib/paper-builder.ts');assert.equal(builder.settingsSchema.parse({}).version,2);
 // Both entry paths use exactly the same dependency cache, with no DB requests.
 assert.equal(load('lib/paper-builder.ts'),builder);
 const schema=load('lib/auto-model-syllabus-schema.ts');assert.ok(schema.autoModelSelectionSchema);
});
