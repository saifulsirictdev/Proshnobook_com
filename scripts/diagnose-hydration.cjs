// Temporary CI-only structural instrumentation. Never log props, text or URLs.
const fs = require('node:fs');
for (const file of ['node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.production.js', 'node_modules/react-dom/cjs/react-dom-client.production.js']) {
  let text = fs.readFileSync(file, 'utf8');
  text = text.replace('function throwOnHydrationMismatch(fiber) {', `function throwOnHydrationMismatch(fiber) {
    var allowed = ['DIV','SPAN','P','MAIN','HEADER','FOOTER','NAV','SCRIPT','LINK','FORM','INPUT','BUTTON','HTML','BODY','META','TITLE','A','SECTION','H1','H2','STYLE'];
    var wanted = [], actual = [], cursor = fiber;
    for(var i=0;cursor && i<20;i++,cursor=cursor.return) { if(typeof cursor.type === 'string' && allowed.includes(cursor.type.toUpperCase())) wanted.push(cursor.type.toUpperCase()); }
    cursor = nextHydratableInstance;
    for(var i=0;cursor && i<10;i++,cursor=cursor.parentNode) { if(allowed.includes(cursor.nodeName)) actual.push(cursor.nodeName); }
    console.error('HYDRATION_PATH_' + wanted.join('_') + '__' + actual.join('_'));
  `);
  fs.writeFileSync(file, text);
}
