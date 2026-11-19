# Database/source backup supplement

This is NOT yet a full-site backup. Existing Blob backup run 44554787467 succeeded and the owner uploaded its two files to Drive (metadata existence checked). No new database backup or config/key export has run yet.

## Owner prerequisites

Set repository Actions secrets `DATABASE_URL` (actual Neon production database; prefer direct connection) and `BLOB_BACKUP_PASSPHRASE` (same securely retained backup passphrase). Never paste secrets into chat, code or issue logs. The supplied URL determines the database; tooling cannot establish that it is the intended production branch merely from its hostname. Owner must confirm branch, database and role. Account reports PostgreSQL 18; tool deliberately uses the PostgreSQL 18 container client. If server is newer it should fail rather than claim success.

## Run and save

Once merged into main, run **Encrypted database and source backup (manual)** in Actions, selecting main. The workflow reads the database with pg_dump; no production migration or restore commands run. It saves a custom-format logical dump, its pg_restore table of contents and a git archive of the selected commit. It excludes cluster ownership/grants, external databases, secrets, ignored files and Blob contents. Database logical snapshot and source archive are not a coordinated snapshot with the earlier Blob archive: record the timestamps, and avoid site writes during migration planning.

The archive and internal checksums are encrypted with the existing authenticated Blob backup format and decrypted/digest-checked locally before uploading an artifact. `pg_restore --list` validates the dump structure only, NOT complete restorability. No connection URL, pg_dump error details, customer rows or raw files are intentionally printed. Temporary files are removed; artifacts contain only encrypted archive and non-secret report and expire in seven days.

Use Termux `gh run download RUN_ID --repo smict9897/QuestionMaker.com --dir ~/storage/downloads/proshnobook-site-data-backup`. Upload BOTH `.tar.enc` and `.tar.enc.json` to private Drive before artifact expiry. Do not share your backup passphrase with the backup files. Mobile copies and Drive object existence do not replace a restore test.

## Recovery verification and remaining work

Use `scripts/blob-backup-restore.cjs ARCHIVE ARCHIVE.json NEW-OUTPUT.tar` with the passphrase supplied privately through the environment to recover a local TAR. It handles this supplement's encryption format as well. Extract into a private fresh directory; verify internal manifest hashes. Restore `database.dump` ONLY into a newly provisioned disposable empty database, not production. Verify schema, counts, representative application reads and matching Blob records before any migration cutover. Source snapshot includes Prisma schema and repository documentation but does not contain ignored `.env` files.

Still needed before calling this a full website recovery package:
- An encrypted configuration export and all actually used vault key versions (including PDF_VAULT_KEYS / PDF_VAULT_ACTIVE_KEY when present). Never generate substitute keys for existing ciphertext. Review the repository's PDF vault key backup tool.
- DNS/domain registrar and OAuth callback configuration notes.
- Confirmation of all Blob stores/external storage providers used, and point-in-time compatibility with the database.
- A separate trusted restore rehearsal and app/file decryption checks.

Do not delete Vercel, Neon, Blob, domain settings, environment values or original keys based on this workflow alone. No configuration export, paid service or DNS change is authorized by this tooling.
