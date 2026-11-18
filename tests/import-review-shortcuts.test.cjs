const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
test('full model import provides review shortcut and matching destination without removing approval form',()=>{
 assert.match(read('app/admin/english-review/complete-model-import.tsx'),/href="#english-model-reviews"/);
 const page=read('app/admin/english-review/page.tsx');assert.match(page,/id="english-model-reviews"/);assert.match(page,/record.status === "PENDING"/);assert.match(page,/action=\{decideEnglishRecovery\}/);assert.match(page,/value="APPROVED"/);
});
test('chapter send forms have adjacent scoped review shortcuts',()=>{
 const ui=read('app/admin/questions/import/prepared-library.tsx');assert.match(ui,/Pending হিসেবে সেভ করুন"\}<\/button><Link/);assert.match(ui,/ব্যর্থগুলো আবার চেষ্টা"\}<\/button><Link/);assert.match(ui,/pendingReviewHref\(batches\[0\].category,batches\[0\].subject\)/);
});
test('unavailable full model screen points to correct import and review workflow',()=>{
 const ui=read('components/english-auto-model.tsx');assert.match(ui,/!busy && error && paper === 1/);assert.match(ui,/href="\/admin\/english-review"/);assert.match(ui,/সাধারণ অধ্যায়ের প্রশ্ন বা শুধু passage import/);
});
