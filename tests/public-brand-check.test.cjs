const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { check, ASSETS } = require('../scripts/public-brand-check.cjs');
function fixture(url) {
  const path = new URL(url).pathname;
  if (path === '/') return new Response('<img src="/proshnobook-p-logo.png"><link rel="icon" href="/proshnobook-p-favicon.png"><link rel="apple-touch-icon" href="/proshnobook-p-apple.png">');
  if (path === '/manifest.webmanifest') return new Response(JSON.stringify({ icons: [{ src: '/proshnobook-p-192.png', purpose: 'any' }, { src: '/proshnobook-p-maskable.png', purpose: 'maskable' }] }));
  return new Response(fs.readFileSync('public' + path), { headers: { 'content-type': 'image/png' } });
}
test('live brand verifier only GETs fixed public routes and matches exact owner assets', async () => {
  let calls = 0;
  const result = await check(async (url, options) => {
    assert.equal(new URL(url).origin, 'https://proshnobook.com');
    assert.equal(options.method, 'GET'); assert.equal(options.redirect, 'manual');
    assert.ok(!options.headers.authorization); assert.ok(!options.headers.cookie);
    calls++; return fixture(url);
  });
  assert.equal(result.ok, true); assert.equal(calls, ASSETS.length + 2);
});
test('live brand verifier rejects old/corrupt assets, HTML fallbacks, redirects and missing icon bindings', async () => {
  for (const response of [() => new Response('old logo', { headers: { 'content-type': 'image/png' } }), () => new Response('html', { headers: { 'content-type': 'text/html' } }), () => new Response(null, { status: 307, headers: { location: 'https://private.invalid' } })]) {
    const result = await check(async () => response());
    assert.equal(result.ok, false);
    assert.ok(result.checks.every(item => !item.ok));
  }
  const stale = await check(async url => new URL(url).pathname === '/manifest.webmanifest' ? new Response('{"icons":[]}') : fixture(url));
  assert.equal(stale.ok, false);
});
test('live brand verifier bounds streams and redacts network payloads', async () => {
  let cancelled = false;
  const result = await check(async () => new Response(new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(1_000_001)); }, cancel() { cancelled = true; } })));
  assert.equal(result.ok, false); assert.equal(cancelled, true);
  const failed = await check(async () => { throw Error('private-token'); });
  assert.ok(!JSON.stringify(failed).includes('private-token'));
});
