const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
test('root head advertises existing square high-resolution search favicon without removing browser icon',()=>{
 const layout=fs.readFileSync('app/layout.tsx','utf8');
 for(const [path,size] of [['proshnobook-p-192.png',192],['proshnobook-p-favicon.png',32]]){
  const tag=layout.match(new RegExp(`<link\\s+rel="icon"\\s+href="/${path.replaceAll('.','\\.')}"\\s+sizes="${size}x${size}"\\s+type="image/png"\\s*/>`));
  assert.ok(tag,`${path} has an explicit icon declaration`);
  const png=fs.readFileSync('public/'+path);
  assert.equal(png.subarray(1,4).toString(),'PNG');assert.equal(png.readUInt32BE(16),size);assert.equal(png.readUInt32BE(20),size);
 }
 const robots=fs.readFileSync('app/robots.ts','utf8');assert.ok(!robots.includes('proshnobook-p-192'));
});
