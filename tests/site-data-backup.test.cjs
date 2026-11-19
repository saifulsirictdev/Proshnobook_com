const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {databaseEnv}=require('../scripts/site-data-backup.cjs');
test('Neon backup parses credentials without exposing a URL in pg_dump argv and enforces SSL/read-only',()=>{
 const e=databaseEnv('postgresql://name:p%40ss@ep-test.us-east-2.aws.neon.tech/neondb?sslmode=disable&channel_binding=require');
 assert.equal(e.PGPASSWORD,'p@ss');assert.equal(e.PGSSLMODE,'require');assert.match(e.PGOPTIONS,/default_transaction_read_only=on/);assert.equal(e.PGCHANNELBINDING,'require');
 for(const u of ['', 'http://u:p@x.neon.tech/db','postgres://u:p@evil.test/db','postgres://u@x.neon.tech/db','postgres://u:p@x.neon.tech/'])assert.throws(()=>databaseEnv(u));
});
test('Database backup is manual, encrypted only, no production restore or automatic Drive claims',()=>{
 const w=fs.readFileSync('.github/workflows/site-data-backup.yml','utf8'),s=fs.readFileSync('scripts/site-data-backup.cjs','utf8');
 assert.match(w,/workflow_dispatch/);assert.doesNotMatch(w,/pull_request:|schedule:|push:/);assert.match(w,/persist-credentials: false/);assert.match(w,/\.tar.enc/);
 assert.match(s,/'postgres:18','pg_dump'/);assert.match(s,/'pg_restore','--list'/);assert.doesNotMatch(s,/--clean|--dbname|--create/);assert.match(s,/driveUploaded:false/);
});
