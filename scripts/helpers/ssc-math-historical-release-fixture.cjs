// TEST ONLY: replay the historical publication's count-only MCQ gate for
// transaction/idempotency checks. Never use this adapter for model generation
// or production publication. The current assembler requires <=5 figure questions
// and correctly rejects this historical geometry stock until it is expanded.
function historicalReleaseFixture(release, api = release.load()) {
  const historicalGateApi = {
    ...api,
    assembleAutoModel(rows, variant, random) {
      if (variant !== 'MCQ') return api.assembleAutoModel(rows, variant, random);
      const ids = [...new Set(rows.filter(q => api.autoModelRowKind(q) === 'MCQ').map(q => q.id))].slice(0, 30);
      return ids.length === 30 ? { ok: true, ids, divisions: {} } : { ok: false, gaps: [] };
    },
  };
  return release.prepare(historicalGateApi);
}
module.exports = { historicalReleaseFixture };
