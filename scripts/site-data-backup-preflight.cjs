// Safe actionable diagnostics only. Never print credentials, URLs or passphrases.
const {databaseEnv}=require('./site-data-backup.cjs');
function prerequisites(env){
 const issues=[];
 if(!env.DATABASE_URL)issues.push('DATABASE_URL_MISSING');
 else try{databaseEnv(env.DATABASE_URL);}catch{issues.push('DATABASE_URL_INVALID_NEON_TARGET');}
 if(!env.BLOB_BACKUP_PASSPHRASE)issues.push('BLOB_BACKUP_PASSPHRASE_MISSING');
 else if(Buffer.byteLength(env.BLOB_BACKUP_PASSPHRASE)<20)issues.push('BLOB_BACKUP_PASSPHRASE_TOO_SHORT');
 return {ok:issues.length===0,issues};
}
module.exports={prerequisites};
if(require.main===module){
 const result=prerequisites(process.env);console.log(JSON.stringify(result));
 if(!result.ok){
  // Fixed codes only; annotations remain readable even when raw runner logs are unavailable.
  if(process.env.GITHUB_ACTIONS==='true')for(const issue of result.issues)console.error(`::error::Backup prerequisite: ${issue}`);
  process.exitCode=1;
 }
}
