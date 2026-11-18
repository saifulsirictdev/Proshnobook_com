const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
test('English import and review are in common question pages; old bookmark redirects',()=>{
 const page=read('app/admin/questions/english-items.tsx');assert.match(page,/id="english-question-items"/);assert.match(page,/action=\{decideEnglishRecovery\}/);assert.match(page,/value="APPROVED"/);
 assert.match(read('app/admin/questions/import/page.tsx'),/englishItems=\{Object.fromEntries/);
 assert.match(read('app/admin/questions/page.tsx'),/<EnglishQuestionItems key=\{grade\} grade=\{grade\} review/);
 assert.match(read('app/admin/english-review/page.tsx'),/redirect\("\/admin\/questions\?/);
 assert.doesNotMatch(page,/href="\/admin\/english-review/);
});
test('chapter send forms have adjacent scoped review shortcuts',()=>{
 const ui=read('app/admin/questions/import/prepared-library.tsx');assert.match(ui,/Pending হিসেবে সেভ করুন"\}<\/button><Link/);assert.match(ui,/ব্যর্থগুলো আবার চেষ্টা"\}<\/button><Link/);assert.match(ui,/pendingReviewHref\(batches\[0\].category,batches\[0\].subject\)/);
});
test('user full model screen does not expose administrative workflow',()=>{
 const ui=read('components/english-auto-model.tsx');assert.doesNotMatch(ui,/href="\/admin\/english-review"/);assert.doesNotMatch(ui,/ADMIN:|Pending import/);
});
