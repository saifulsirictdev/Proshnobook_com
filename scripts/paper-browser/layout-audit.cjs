/** Browser geometry assertions, not screenshots alone. No network/DB access. */
module.exports = async function auditLayout(page) {
  const result = await page.evaluate(() => {
    const problems = [], sheets = [...document.querySelectorAll('#paper .paper-sheet')];
    const root = document.querySelector('#paper .paper-measure');
    if (!root || !sheets.length) return { problems: ['No measured/rendered paper'], blocks: 0 };
    const headerHeight = root.querySelector('[data-measure-header]').getBoundingClientRect().height;
    const footerHeight = root.querySelector('[data-measure-footer]')?.getBoundingClientRect().height ?? 0;
    let previous, transitions = 0, blocks = 0;
    for (const [pageIndex, sheet] of sheets.entries()) {
      const flow = sheet.querySelector('.paper-flow-body');
      const body = flow ?? sheet.querySelector('[data-paper-column]')?.parentElement;
      if (!body) continue;
      const style = getComputedStyle(sheet), bodyRect = body.getBoundingClientRect();
      const capacity = parseFloat(style.minHeight) - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom) - 28 -
        (footerHeight ? footerHeight + 12 : 0) - (pageIndex === 0 ? headerHeight : 0);
      const actualHeader = sheet.querySelector('.paper-heading');
      if (pageIndex === 0 && Math.abs(actualHeader.getBoundingClientRect().height - headerHeight) > 1)
        problems.push(`Header measurement differs: ${headerHeight} vs ${actualHeader.getBoundingClientRect().height}`);
      const segments = flow ? [...body.children].filter(el => el.hasAttribute('data-flow-lane')) :
        [...body.querySelectorAll('[data-paper-column]')].flatMap(col => [...col.children].filter(el => el.querySelector('.paper-question')));
      for (const segment of segments) {
        const lane = Number(segment.dataset.flowLane ?? segment.parentElement.dataset.paperColumn), rect = segment.getBoundingClientRect();
        const question = segment.querySelector('.paper-question');
        if (!question) continue;
        const id = question.dataset.questionId, fragment = question.dataset.questionFragment;
        const measured = [...root.querySelectorAll('[data-question-id]')].find(el => el.dataset.questionId === id && el.dataset.questionFragment === fragment);
        if (!measured) problems.push(`Missing measurement: ${id}/${fragment}`);
        else {
          const m = measured.getBoundingClientRect(), q = question.getBoundingClientRect();
          if (Math.abs(m.width - q.width) > 0.1 || Math.abs(m.height - q.height) > 0.5)
            problems.push(`Measurement/render mismatch ${id}/${fragment}: ${m.width}x${m.height} vs ${q.width}x${q.height}`);
        }
        if (rect.bottom - bodyRect.top > capacity + 1) problems.push(`Block exceeds usable page: ${id}/${fragment}`);
        if (previous && (previous.page !== pageIndex || previous.lane !== lane)) {
          transitions++;
          const remaining = previous.capacity - previous.bottom;
          if (rect.height <= remaining - 0.5) problems.push(`Premature transition: ${remaining}px free; next block ${rect.height}px`);
        } else if (previous && rect.top < previous.absoluteBottom - 0.5) problems.push(`Overlapping blocks: ${id}/${fragment}`);
        previous = { page: pageIndex, lane, capacity, bottom: rect.bottom - bodyRect.top, absoluteBottom: rect.bottom };
        blocks++;
      }
    }
    return { problems, blocks, transitions, pages: sheets.length };
  });
  if (result.problems.length) {
    const debug = await page.evaluate(() => [...document.querySelectorAll('.paper-flow-body [data-question-id]')].map(el => {
      const other = [...document.querySelectorAll('.paper-measure [data-question-id]')].find(m => m.dataset.questionId === el.dataset.questionId && m.dataset.questionFragment === el.dataset.questionFragment);
      const info = node => ({html: node.outerHTML, boxes: [node,...node.querySelectorAll('div,b,span,p,img')].map(n => {const r=n.getBoundingClientRect(),c=getComputedStyle(n);return {tag:n.tagName,cl:n.className,w:r.width,h:r.height,font:c.font,white:c.whiteSpace,text:n.textContent.slice(0,60)}})});
      return {actual:info(el),measured:info(other)};
    }));
    require('node:fs').writeFileSync('.cache/column-geometry-debug.json', JSON.stringify(debug,null,2));
  }
  require('node:assert/strict').deepEqual(result.problems, []);
  require('node:assert/strict').ok(result.blocks > 0);
  return result;
};
