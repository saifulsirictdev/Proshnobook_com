/** Local-only review harness, never a Next app route or production content importer.
 * npm install --no-save --package-lock=false --ignore-scripts esbuild playwright-core @sparticuz/chromium
 * node scripts/math-sample/server.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname,'../..');
const output = path.join(root,'.cache/math-sample-ui');
async function build() {
  fs.mkdirSync(output,{recursive:true});
  await require('esbuild').build({entryPoints:[path.join(__dirname,'editor.tsx')],outdir:output,bundle:true,jsx:'automatic',external:['/fonts/*'],loader:{'.woff':'file','.woff2':'file','.ttf':'file'},assetNames:'assets/[name]-[hash]',define:{'process.env.NODE_ENV':'"production"'},minify:true});
  execFileSync(path.join(root,'node_modules/.bin/tailwindcss'),['-i',path.join(__dirname,'tailwind.css'),'-o',path.join(output,'tailwind.css'),'--content','components/paper-builder/**/*.{ts,tsx},scripts/math-sample/editor.tsx','--minify'],{cwd:root,stdio:'pipe'});
}
function response(url) {
  const pathname = new URL(url,'https://sample.invalid').pathname;
  if(pathname==='/') return {body:Buffer.from('<!doctype html><html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SSC গণিত — চিত্রসহ নমুনা</title><link rel="stylesheet" href="/tailwind.css"><link rel="stylesheet" href="/editor.css"></head><body><div id="root"></div><script src="/editor.js"></script></body></html>'),contentType:'text/html; charset=utf-8'};
  let base=output, name=pathname.slice(1);
  if (/^\/(diagrams|source-crops)\/[a-z-]+\.(png|svg)$/.test(pathname)) base=path.join(root,'samples/ssc-math');
  else if(/^\/fonts\/[a-zA-Z0-9[\],.-]+$/.test(pathname)) base=path.join(root,'public');
  else if(/^\/sample(?:-mobile)?(?:-without-source)?\.pdf$/.test(pathname)){base=path.join(root,'samples/ssc-math/proof');name=pathname.slice(1);}
  else if(!/^\/(?:editor\.js|editor\.css|tailwind\.css|assets\/[a-zA-Z0-9_.-]+)$/.test(pathname))return {status:404,body:Buffer.from('Not found')};
  const file=path.resolve(base,name);
  if(!file.startsWith(base+path.sep)||!fs.existsSync(file))return {status:404,body:Buffer.from('Not found')};
  const ext=path.extname(file);
  return {body:fs.readFileSync(file),contentType:({'.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.woff2':'font/woff2','.woff':'font/woff','.pdf':'application/pdf'})[ext]||'application/octet-stream'};
}
module.exports={build,response};
if(require.main===module)build().then(()=>http.createServer((req,res)=>{const r=response(req.url);res.writeHead(r.status||200,{'Content-Type':r.contentType||'text/plain','X-Content-Type-Options':'nosniff'});res.end(r.body);}).listen(Number(process.env.PORT||3080),'0.0.0.0',()=>console.log('SSC math sample editor ready on port '+(process.env.PORT||3080)))).catch(e=>{console.error(e.message);process.exitCode=1;});
