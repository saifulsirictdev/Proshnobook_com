/** Audit metadata only, never decrypt secrets. stdin: Vercel {envs:[...]} or project {env:[...]}. */
const REQUIRED = ["DATABASE_URL", "BLOB_READ_WRITE_TOKEN", "AUTH_SECRET"];
const SENSITIVE = new Set([
  ...REQUIRED,
  "AUTH_GOOGLE_SECRET",
  "DEEPSEEK_API_KEY",
  "PDF_VAULT_KEYS",
  "CRON_SECRET",
]);
function audit(metadata) {
  const rows = metadata?.envs || metadata?.env;
  if (!Array.isArray(rows))
    return {
      ok: false,
      isolated: false,
      findings: [{ code: "missing_metadata" }],
    };
  const findings = [];
  for (const key of REQUIRED) {
    if (
      !rows.some(
        (r) =>
          r.key === key &&
          Array.isArray(r.target) &&
          r.target.includes("preview") &&
          !(r.gitBranch || r.git_branch),
      )
    )
      findings.push({ key, code: "missing_default_preview_binding" });
  }
  for (const row of rows) {
    if (
      SENSITIVE.has(row.key) &&
      Array.isArray(row.target) &&
      row.target.includes("preview") &&
      row.target.includes("production")
    )
      findings.push({
        key: row.key,
        code: "shared_production_preview_definition",
      });
  }
  // Even separate definitions cannot prove different values or resource-level isolation.
  return {
    ok: findings.length === 0,
    isolated: false,
    findings,
    next: findings.length
      ? "separate_bindings_before_mutating_tests"
      : "verify_resource_ids_permissions_and_sandbox_accounts",
  };
}
module.exports = { audit };
if (require.main === module) {
  let input = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => {
    input += chunk;
    if (Buffer.byteLength(input) > 1000000) {
      console.log(
        '{"ok":false,"isolated":false,"findings":[{"code":"metadata_limit"}]}',
      );
      process.exit(1);
    }
  });
  process.stdin.on("end", () => {
    try {
      const result = audit(JSON.parse(input));
      console.log(JSON.stringify(result));
      if (!result.ok) process.exitCode = 1;
    } catch {
      console.log(
        '{"ok":false,"isolated":false,"findings":[{"code":"invalid_metadata"}]}',
      );
      process.exitCode = 1;
    }
  });
}
