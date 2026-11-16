/** Fixed-origin anonymous GET-only verification. No account/provider operations. */
const fs = require('node:fs');
const { createHash } = require('node:crypto');
const ORIGIN = 'https://proshnobook.com';
const ASSETS = ['proshnobook-p-logo.png', 'proshnobook-p-192.png', 'proshnobook-p-maskable.png', 'proshnobook-p-apple.png', 'proshnobook-p-favicon.png', 'logo.png', 'questionmaker-icon.png', 'questionmaker-icon-192.png'];
async function bounded(response) {
  const reader = response.body?.getReader();
  if (!reader) throw Error('empty');
  const chunks = []; let size = 0;
  try {
    while (true) {
      const item = await reader.read();
      if (item.done) break;
      size += item.value.byteLength;
      if (size > 1_000_000) throw Error('body_limit');
      chunks.push(Buffer.from(item.value));
    }
    return Buffer.concat(chunks);
  } finally { await reader.cancel(); }
}
const hash = data => createHash('sha256').update(data).digest('hex');
async function check(fetcher = fetch) {
  const checks = [];
  for (const path of ['/', '/manifest.webmanifest', ...ASSETS.map(name => '/' + name)]) {
    try {
      const response = await fetcher(ORIGIN + path, { method: 'GET', redirect: 'manual', signal: AbortSignal.timeout(15000), headers: { 'cache-control': 'no-cache' } });
      if (response.status !== 200) { await response.body?.cancel(); checks.push({ path, ok: false, check: 'http_status' }); continue; }
      const body = await bounded(response);
      let ok = false;
      if (path === '/') {
        const html = body.toString('utf8');
        ok = html.includes('/proshnobook-p-logo.png') && /<link\b[^>]*rel="icon"[^>]*href="\/proshnobook-p-favicon\.png"/.test(html) && /<link\b[^>]*rel="apple-touch-icon"[^>]*href="\/proshnobook-p-apple\.png"/.test(html);
      } else if (path === '/manifest.webmanifest') {
        const manifest = JSON.parse(body.toString('utf8'));
        ok = manifest.icons?.some(icon => icon.src === '/proshnobook-p-192.png' && icon.purpose === 'any') && manifest.icons?.some(icon => icon.src === '/proshnobook-p-maskable.png' && icon.purpose === 'maskable');
      } else {
        ok = /^image\/png\b/i.test(response.headers.get('content-type') || '') && hash(body) === hash(fs.readFileSync(require('node:path').join(__dirname, '..', 'public', path.slice(1))));
      }
      checks.push({ path, ok: Boolean(ok), check: 'owner_brand_release' });
    } catch { checks.push({ path, ok: false, check: 'network_or_invalid_response' }); }
  }
  return { ok: checks.every(item => item.ok), checks };
}
module.exports = { check, ASSETS };
if (require.main === module) check().then(result => { console.log(JSON.stringify(result)); if (!result.ok) process.exitCode = 1; }).catch(() => { console.log('{"ok":false,"reason":"brand_check_failed"}'); process.exitCode = 1; });
