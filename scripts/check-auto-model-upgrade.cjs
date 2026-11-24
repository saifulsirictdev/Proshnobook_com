#!/usr/bin/env node
// Explicit read-only production probe, never a normal build hook or content release.
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const root = path.resolve(__dirname, '..');
function load() {
  const ts = require('typescript');
  const resolve = Module._resolveFilename;
  const ext = require.extensions['.ts'];
  Module._resolveFilename = function(id, parent, ...rest) {
    return resolve.call(this, id.startsWith('@/') ? path.join(root, id.slice(2)) : id, parent, ...rest);
  };
  require.extensions['.ts'] = (m, file) => m._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true},
  }).outputText, file);
  try {
    return {
      ...require('../lib/auto-model-syllabus.ts'),
      ...require('../lib/auto-model-insights.ts'),
      ...require('../lib/auto-model-paper.ts'),
      ...require('../lib/paper-generation.ts'),
    };
  } finally {
    Module._resolveFilename = resolve;
    if (ext) require.extensions['.ts'] = ext;
    else delete require.extensions['.ts'];
  }
}
async function check(db) {
  const api = load();
  const subjects = [];
  for (const subject of ['পদার্থবিজ্ঞান', 'রসায়ন']) {
    const rows = await db.question.findMany({
      where: {category: {in: api.categoryAliases('SSC')}, subject, approved: true},
      select: {id: true, text: true, topic: true, options: true, correct: true, explanation: true},
      orderBy: {id: 'asc'}, take: 10001,
    });
    if (rows.length > 10000) throw Error('Read-only probe exceeded stock scan bound');
    const variants = [];
    for (const variant of ['MCQ', 'CQ']) {
      const topics = api.autoModelTopics('SSC', subject);
      const request = {category: 'SSC', subject, variant, topics};
      const plan = api.resolveSyllabusSelection(request);
      const report = api.modelReadiness(rows, plan);
      if (!report.complete || report.aiShortfall !== 0) throw Error('Previously published subject no longer has a complete model');
      const byId = new Map(rows.map(q => [q.id, q]));
      let previous = [];
      for (let seed = 1; seed <= 5; seed++) {
        let n = seed;
        const random = () => ((n = (n * 1664525 + 1013904223) >>> 0) / 4294967296);
        const selectedPlan = api.resolveSyllabusSelection({...request, avoidQuestionIds: previous});
        const result = api.planSyllabusModel(rows, selectedPlan, random);
        if (!result.ok || result.missing.length) throw Error('Readiness and model planner disagree');
        const items = result.ids.map(id => {
          const q = byId.get(id);
          if (!q) throw Error('Planner returned a non-stock ID');
          return {...q, subject, category: 'SSC', type: api.syllabusRowKind(q, plan),
            stimulus: q.options.stimulus, subQuestions: q.options.subQuestions,
            options: q.correct ? q.options : undefined};
        });
        const settings = api.autoModelSettings('SSC', subject, variant, selectedPlan.request);
        if (settings.syllabusSelection.avoidQuestionIds) throw Error('Private model history leaked into saved settings');
        if (api.autoModelIssues(items, settings).length) throw Error('Editor validation rejected assembled model');
        if (api.autoModelSections(items, settings).flatMap(s => s.questions).length !== items.length) throw Error('Print sections omitted questions');
        previous = result.ids;
      }
      variants.push({variant, modelsVerified: 5, offered: report.offered, totalMarks: report.totalMarks, aiShortfall: report.aiShortfall});
    }
    subjects.push({subject, approvedRowsScanned: rows.length, variants});
  }
  return {status: 'READ_ONLY_AUTO_MODEL_UPGRADE_VERIFIED', subjects,
    modelsVerified: 20, databaseMutation: false, contentImport: false,
    approvalMutation: false, providerInvoked: false,
    authenticatedBrowserFlowVerified: false, liveAIGenerationVerified: false,
    officialSyllabusCertification: false};
}
async function main() {
  if (process.env.VERCEL_ENV !== 'production' ||
      process.env.VERCEL_PROJECT_ID !== 'prj_gJuVKTIvUtieGaJr7mitBHdC05Ze' || !process.env.DATABASE_URL)
    throw Error('Explicit production context required');
  const {PrismaClient} = require('@prisma/client');
  const db = new PrismaClient();
  try { console.log('AUTO_MODEL_UPGRADE_RECEIPT ' + JSON.stringify(await check(db))); }
  finally { await db.$disconnect(); }
}
module.exports = {check};
if (require.main === module) main().catch(() => {
  console.error('AUTO_MODEL_UPGRADE_PROBE_FAILED; no content import, approval or provider request performed');
  process.exitCode = 1;
});
