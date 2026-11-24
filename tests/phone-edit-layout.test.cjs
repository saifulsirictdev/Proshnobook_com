const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
const css=fs.readFileSync('components/ready-papers/studio-responsive.css','utf8');
const studio=fs.readFileSync('components/ready-papers/studio.tsx','utf8');
test('phone-only edit layout keeps both panels visible without forcing a desktop viewport',()=>{
 const phone=css.slice(css.indexOf('@media screen and (max-width: 639px)'));
 assert.match(phone,/32fr/);assert.match(phone,/68fr/);
 assert.match(phone,/rp-controls:not\(\.rp-controls-open\)[\s\S]*?display: block/);
 assert.match(phone,/rp-answer-tools/);assert.match(phone,/rp-studio-actions/);
 assert.doesNotMatch(phone,/rp-stage-select/);
 assert.doesNotMatch(phone,/(?:zoom|transform|touch-action):/);
});
test('removed answer panels do not mount background work; lower workspace remains',()=>{
 assert.match(studio,/rp-stage-\$\{step\}/);
 assert.doesNotMatch(studio,/<AIAnswers|<AnswerAssistant|className="rp-phone-answer"|className="rp-answer-tools"/);
 assert.match(studio,/Save &amp; Print Preview/);
 assert.match(studio,/<RasterTools/);
});
