# Mobile-operated public Blob backup

## Current status

Tooling only: no live inventory, backup, Drive upload or production change has been performed. The current connector cannot list GitHub secret names (403). The owner reports adding `BLOB_READ_WRITE_TOKEN`; its existence/validity has not been independently verified. This backs up ONE public Blob store corresponding to that token, not all team stores.

## Before running

1. Add repository Actions secrets `BLOB_READ_WRITE_TOKEN` and `BLOB_BACKUP_PASSPHRASE`. The latter must be a unique long random passphrase (at least 20 bytes). Keep an independent copy in a password manager; loss means the encrypted archive cannot be recovered. Never put either in chat or commit them.
2. Merge the reviewed workflow into the default branch. GitHub Actions → **Encrypted Blob backup (manual)** → Run workflow. No scheduled execution or production deployment is involved. The workflow reads but never deletes/writes Blob objects. It downloads public files without sending the token; the SDK uses it only to list the store.
3. The workflow checks the entire paginated inventory, verifies file sizes and SHA256 checksums, and re-lists to reject changed inventories. Avoid uploads/overwrites/deletions during the run. This is not an atomic storage-provider snapshot; same-size in-place edits during backup cannot be ruled out solely by listing metadata.
4. It creates a TAR with numerically named file copies plus `manifest.json` (original paths, URLs, sizes, uploaded times and SHA256). It encrypts using scrypt + AES-256-GCM and decrypt-verifies the archive digest before uploading an Actions artifact. Limits: public stores only, 5 GiB total, 45 minute workflow timeout. Failures do not produce a successful artifact. Secret/error details are deliberately suppressed.

## Move to Google Drive from a phone

The GitHub runner does NOT inherit Arena's Drive connection. This workflow does not automatically upload to Drive and does not claim it did.

Download the successful run's `encrypted-blob-backup-<run-id>` artifact ZIP using authenticated GitHub in the phone browser. Upload that ZIP to a **private** Google Drive backup folder, keeping the encrypted archive and its JSON report together. The ZIP contains only encrypted content and a non-secret summary; original filenames/URLs are inside the encrypted archive. Compare ZIP size before and after download/upload and retain the workflow run reference. Artifacts expire after **7 days**: copy to Drive before then. No public release attachment, public Drive sharing, raw artifact or Git commit is used for backup data.

Before deleting originals, independently decrypt and check every restored file's SHA256 against `manifest.json`. An upload receipt or successful encryption is not a full application restore test.

## Offline recovery

On a trusted machine, securely supply `BLOB_BACKUP_PASSPHRASE` in the environment, then:

```
node scripts/blob-backup-restore.cjs backup.tar.enc backup.tar.enc.json recovered.tar
```

The tool authenticates/decrypt-verifies before creating the output; the output filename must not already exist. Extract the TAR into a new private directory. Map numeric `.blob` filenames back to original names through the manifest. Neither backup nor offline decrypt changes any live data.

## Separate essentials

This does NOT back up PostgreSQL records, credentials, app configuration, or PDF/resource-vault encryption keys. Encrypted vault object copies may remain unreadable without those keys. Keep separate encrypted database/key backups and test reconstruction before retiring Vercel. Do not put unencrypted database dumps or keys in Actions artifacts, chat, or a repository. Never revoke the running site's existing Blob token as part of this process.

## Tests

`node --test tests/blob-backup.test.cjs` covers URL restrictions, pagination/duplicate protection, encryption roundtrip, wrong-key rejection and tampering. No live Blob access has been tested.
