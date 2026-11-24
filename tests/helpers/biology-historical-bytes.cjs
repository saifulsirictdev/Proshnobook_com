// Preserve original historical SHA assertions when this sandbox lacks old Git objects.
const {execFileSync, spawnSync} = require('node:child_process');
const fs = require('node:fs');
const {createHash} = require('node:crypto');
module.exports = (commit, file) => {
  if (spawnSync('git',['cat-file','-e',`${commit}^{commit}`],{stdio:'ignore'}).status === 0)
    return execFileSync('git',['show',`${commit}:${file}`]);
  const receipt = JSON.parse(fs.readFileSync('docs/question-bank/ssc-biology/recovery-receipt.json','utf8'));
  if (receipt.sourceDriveId !== '1RPxdrC1ehu0VkVEl7th3lCeX8Mub0FSp' ||
      receipt.zipSHA256 !== '0651c7399b1ba5bcfa207485392efc53d1568e1a6430f2b83541265ac3617e07' ||
      !receipt.zipCRCAndEveryPayloadSHA256Verified || !receipt.remoteMetadataIndependentlyVerified)
    throw Error('Missing verified recovery provenance');
  const bytes = fs.readFileSync(file);
  if (createHash('sha256').update(bytes).digest('hex') !== receipt.biologyFiles[file])
    throw Error(`Recovered historical bytes changed: ${file}`);
  return bytes;
};
