const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const sample=require('../samples/ssc-math/questions.json');
test('SSC diagram sample is explicitly draft, source-located, and exactly three unique questions',()=>{
  assert.equal(sample.status,'DRAFT_SAMPLE_NOT_APPROVED_NOT_IMPORTED');
  assert.equal(sample.source.pdfPage,1);assert.equal(sample.source.printedPage,428);
  assert.match(sample.source.sha256,/^[a-f0-9]{64}$/);
  assert.deepEqual(sample.questions.map(q=>q.sourceQuestion),[10,16,20]);
  assert.equal(new Set(sample.questions.map(q=>q.id)).size,3);
  for(const q of sample.questions){assert.equal(q.type,'MCQ');assert.equal(Object.keys(q.options).length,4);assert.ok(q.options[q.correct]);assert.ok(q.explanation);assert.match(q.text,/[\u0980-\u09ff]/);}
});
test('sample answer keys follow independent midpoint/chord/trigonometric calculations',()=>{
  const qs=Object.fromEntries(sample.questions.map(q=>[q.diagram,q]));
  // Any non-isosceles triangle: D,E midpoint => DE parallel BC and half its length.
  const A=[0,4], B=[-3,0], C=[6,0];
  const D=A.map((x,i)=>(x+B[i])/2), E=A.map((x,i)=>(x+C[i])/2);
  const distance=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1]);
  assert.equal(D[1],E[1]);assert.equal(distance(D,E),distance(B,C)/2);assert.notEqual(distance(A,B),distance(A,C));
  assert.equal(qs.midpoint.options[qs.midpoint.correct],'i ও ii');
  // Radius=5, centre-to-chord distance=4 gives chord=6 (NOT 8).
  assert.equal(2*Math.sqrt(5**2-4**2),6);
  assert.equal(qs.circle.options[qs.circle.correct],'৬ সে.মি.');
  const opposite=1, adjacent=Math.sqrt(3),hyp=Math.hypot(opposite,adjacent);
  assert.equal(hyp,2);
  assert.ok(Math.abs(Math.atan(opposite/adjacent)*180/Math.PI-30)<1e-12);
  assert.ok(Math.abs(adjacent/hyp-Math.sqrt(3)/2)<1e-12);
  assert.ok(Math.abs(1+(opposite/adjacent)**2-4/3)<1e-12);
  assert.equal(qs.trigonometry.options[qs.trigonometry.correct],'i, ii ও iii');
});
test('every sample has a local vector master, high-resolution PNG, and original source crop',()=>{
  for(const q of sample.questions){
    const root='samples/ssc-math/';
    const svg=fs.readFileSync(root+'diagrams/'+q.diagram+'.svg','utf8');
    assert.match(svg,/viewBox="0 0 320 260"/);assert.doesNotMatch(svg,/<script|https?:\/\/(?!www.w3.org)/);
    for(const dir of ['diagrams','source-crops']){
      const png=fs.readFileSync(root+dir+'/'+q.diagram+'.png');assert.equal(png.subarray(1,4).toString(),'PNG');
      if(dir==='diagrams'){assert.equal(png.readUInt32BE(16),960);assert.equal(png.readUInt32BE(20),780);}
    }
  }
});
