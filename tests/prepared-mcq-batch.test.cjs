const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
test('prepared draft reaches client only through guarded Admin page; loading never writes data',()=>{
 const page=fs.readFileSync('app/admin/questions/import/page.tsx','utf8');
 assert.ok(page.indexOf('await staff()')<page.indexOf('preparedBatch='));
 assert.ok(page.includes('math-ch1-draft.json'));
 const ui=fs.readFileSync('app/admin/questions/import/import-form.tsx','utf8');
 assert.ok(ui.includes('setRaw(preparedBatch); setInspectedRaw("")'));
 assert.ok(ui.includes('window.confirm'));
 assert.ok(ui.includes('মূল বইয়ের পৃষ্ঠা, পূর্ণ বিষয়সীমা ও শিক্ষক-পর্যালোচনা বাকি'));
 assert.ok(ui.includes('শুধু Pending হিসেবে সংরক্ষণ করছি'));
 assert.ok(!ui.includes('উত্তর মিলিয়েছি'));
});
