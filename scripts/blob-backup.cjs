#!/usr/bin/env node
// Read-only public Blob-store snapshot. No credentials or blob URLs in logs.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { pipeline } = require('node:stream/promises');
const { Readable } = require('node:stream');
const { execFileSync } = require('node:child_process');
const MAGIC = Buffer.from('PBLOB001');
function publicURL(value) {
  const u = new URL(value);
  if (u.protocol !== 'https:' || u.username || u.password || u.port || !/^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/.test(u.hostname)) throw Error('Only public Vercel Blob URLs supported');
  return u;
}
async function encrypt(input, output, passphrase) {
  if (!passphrase || Buffer.byteLength(passphrase) < 20) throw Error('Backup passphrase must have at least 20 bytes');
  const salt = crypto.randomBytes(16), iv = crypto.randomBytes(12);
  const key = crypto.scryptSync(passphrase, salt, 32);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const header = Buffer.concat([MAGIC, salt, iv]);
  cipher.setAAD(header);
  const out = fs.createWriteStream(output, { flags: 'wx', mode: 0o600 });
  out.write(header);
  await pipeline(fs.createReadStream(input), cipher, out);
  fs.appendFileSync(output, cipher.getAuthTag());
  key.fill(0);
}
async function verify(input, expectedDigest, passphrase) {
  const size = fs.statSync(input).size;
  const fd = fs.openSync(input, 'r');
  const header = Buffer.alloc(36), tag = Buffer.alloc(16);
  try { fs.readSync(fd, header, 0, 36, 0); fs.readSync(fd, tag, 0, 16, size - 16); }
  finally { fs.closeSync(fd); }
  if (!header.subarray(0, 8).equals(MAGIC) || size < 52) throw Error('Invalid archive');
  const key = crypto.scryptSync(passphrase, header.subarray(8, 24), 32);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, header.subarray(24));
  decipher.setAAD(header); decipher.setAuthTag(tag);
  const hash = crypto.createHash('sha256');
  for await (const chunk of fs.createReadStream(input, { start: 36, end: size - 17 }).pipe(decipher)) hash.update(chunk);
  key.fill(0);
  if (hash.digest('hex') !== expectedDigest) throw Error('Archive verification failed');
}
async function inventory(list, token) {
  const result = [], cursors = new Set(), urls = new Set(); let cursor;
  do {
    const page = await list({ token, limit: 1000, ...(cursor ? { cursor } : {}) });
    for (const b of page.blobs) {
      publicURL(b.url);
      if (urls.has(b.url) || !Number.isSafeInteger(b.size) || b.size < 0) throw Error('Invalid or changing inventory');
      urls.add(b.url); result.push({ pathname: b.pathname, url: b.url, size: b.size, uploadedAt: b.uploadedAt });
    }
    if (!page.hasMore) break;
    if (!page.cursor || cursors.has(page.cursor)) throw Error('Invalid pagination');
    cursor = page.cursor; cursors.add(cursor);
  } while (true);
  return result.sort((a,b) => a.url.localeCompare(b.url));
}
async function main() {
  const token = process.env.BLOB_READ_WRITE_TOKEN, passphrase = process.env.BLOB_BACKUP_PASSPHRASE;
  if (!token || !passphrase || Buffer.byteLength(passphrase) < 20) throw Error('Configure Blob token and a backup passphrase of at least 20 bytes');
  const { list } = require('@vercel/blob');
  const destination = path.resolve(process.env.BLOB_BACKUP_OUTPUT || '.cache/blob-backup');
  fs.mkdirSync(destination, { recursive: true, mode: 0o700 });
  const work = fs.mkdtempSync(path.join(destination, 'work-'));
  const tar = path.join(work, 'snapshot.tar');
  const output = path.join(destination, `blob-${Date.now()}.tar.enc`);
  try {
    const before = await inventory(list, token);
    const bytes = before.reduce((n,b) => n+b.size, 0);
    if (bytes > 5 * 1024 ** 3) throw Error('Snapshot exceeds 5 GiB operator limit');
    const content = path.join(work, 'snapshot'); fs.mkdirSync(content);
    const manifest = { version: 1, startedAt: new Date().toISOString(), scope: 'One public Blob store only; database and vault keys NOT included', files: [] };
    for (let i=0; i<before.length; i++) {
      const b = before[i], file = `${String(i).padStart(8,'0')}.blob`;
      // Numeric local names avoid traversal and preserve arbitrary original names in manifest.
      const response = await fetch(publicURL(b.url), { redirect: 'error', signal: AbortSignal.timeout(120000), cache: 'no-store' });
      if (!response.ok || !response.body) throw Error('Blob download failed');
      const hash = crypto.createHash('sha256'); let received = 0;
      const stream = Readable.fromWeb(response.body);
      stream.on('data', chunk => { received += chunk.length; hash.update(chunk); if (received > b.size) stream.destroy(Error('Blob changed during download')); });
      await pipeline(stream, fs.createWriteStream(path.join(content,file), { flags: 'wx', mode: 0o600 }));
      if (received !== b.size) throw Error('Incomplete download');
      manifest.files.push({ ...b, file, sha256: hash.digest('hex') });
    }
    const after = await inventory(list, token);
    if (JSON.stringify(before) !== JSON.stringify(after)) throw Error('Store changed; rerun during a quiet period');
    manifest.completedAt = new Date().toISOString();
    fs.writeFileSync(path.join(content,'manifest.json'), JSON.stringify(manifest,null,2), { mode: 0o600 });
    execFileSync('tar', ['-cf', tar, '-C', content, '.'], { stdio: 'ignore' });
    const hash = crypto.createHash('sha256');
    for await (const chunk of fs.createReadStream(tar)) hash.update(chunk);
    const digest = hash.digest('hex');
    await encrypt(tar, output, passphrase); await verify(output, digest, passphrase);
    const report = { version: 1, verified: true, files: before.length, bytes, archive: path.basename(output), plaintextArchiveSha256: digest, encryption: 'PBLOB001 + 16-byte scrypt salt + 12-byte AES-256-GCM IV + ciphertext + 16-byte tag; header authenticated', scope: manifest.scope, driveUploaded: false };
    fs.writeFileSync(`${output}.json`, JSON.stringify(report,null,2), { mode: 0o600 });
    console.log(`Verified encrypted backup: ${before.length} files, ${bytes} bytes. Drive upload NOT performed.`);
  } catch (e) { fs.rmSync(output, { force: true }); throw e; }
  finally { fs.rmSync(work, { recursive: true, force: true }); }
}
module.exports = { publicURL, inventory, encrypt, verify };
if (require.main === module) main().catch(() => { console.error('Backup failed. Check required secrets, public-store access, available space and store stability. Secret/error details suppressed.'); process.exitCode=1; });
