const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
test('desktop polish stays screen-only and keeps brand and accessible dropdown links', () => {
 const css=fs.readFileSync('components/desktop-polish.css','utf8');
 assert.match(css, /@media screen and \(min-width: 1280px\)/);
 assert.match(css, /grid-template-columns: minmax\(260px, 1fr\) auto/);
 assert.ok(!css.includes('#paper'));
 const header=fs.readFileSync('components/site-header.tsx','utf8');
 assert.ok(header.includes('/proshnobook-p-logo.png'));
 assert.ok(header.includes('group-focus-within:block'));
 for(const name of ['qm-header-inner','qm-header-nav','qm-header-actions']) assert.ok(header.includes(name));
});
