const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
test('feature desktop chrome is scoped to screen and explicit controls, not paper geometry',()=>{
 const css=fs.readFileSync('components/desktop-features.css','utf8');
 assert.match(css,/@media screen and \(min-width: 1024px\)/);
 for(const token of ['.tw-panel','.rp-panel','.saved-paper-panel','.english-controls','.pb-filters','.qm-exam-setup','.hm-sidebar',':focus-visible',':disabled']) assert.ok(css.includes(token),token);
 assert.doesNotMatch(css, /(?:#paper|\.english-paper|\.rp-page|canvas)\s*\{/);
 for(const file of ['app/model-test/page.tsx','app/profile/page.tsx','app/packages/page.tsx','app/dashboard/sell/page.tsx','app/wallet/send/page.tsx']) assert.ok(fs.readFileSync(file,'utf8').includes('qm-feature-page'),file);
});
