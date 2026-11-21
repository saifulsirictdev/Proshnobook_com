#!/usr/bin/env node
// Read-only local inventory. Does not import Prisma, connect to DB or approve stock.
require("../../tests/helpers/class8-reference.cjs");
const { englishBlueprint } = require("../../lib/english/blueprints.ts");
const {
  preparedEnglishImportItems,
  englishImportItemsDigest,
} = require("../../lib/english/prepared-import-items.ts");
const { preparedEnglishItems } = require("../../lib/english/prepared-items.ts");
const {
  preparedJuniorPaper2ExpansionModels,
} = require("../../lib/english/prepared-junior-paper2-expansion.ts");
const { prepare, FROZEN } = require("./release-expanded-models.cjs");
const historical = prepare();
if (historical.digest !== FROZEN)
  throw Error("Historical released manifest changed");
const scopes = [6, 7].map((grade) => {
  const all = preparedEnglishImportItems(grade, 2),
    old = preparedEnglishItems(grade, 2);
  return {
    grade,
    paper: 2,
    newAuthoredFullModels: preparedJuniorPaper2ExpansionModels(grade).length,
    baselinePreparedGroups: old.length,
    newPreparedGroups: all.length - old.length,
    totalPreparedGroups: all.length,
    importPreviewDigest: englishImportItemsDigest(grade, 2),
    items: englishBlueprint(grade, 2).items.map((item) => {
      const prepared = all.filter((p) => p.group === item.id).length,
        baseline = old.filter((p) => p.group === item.id).length;
      return {
        id: item.id,
        baselinePrepared: baseline,
        newPrepared: prepared - baseline,
        totalPrepared: prepared,
        planningTarget: 50,
        remainingToPlanningTarget: Math.max(0, 50 - prepared),
      };
    }),
  };
});
console.log(
  JSON.stringify(
    {
      batch: "junior-paper2-expansion-01",
      scopes,
      historicalRelease: {
        digest: historical.digest,
        targets: historical.items.length,
        class8ReadOnly: historical.readOnly.length,
        unchanged: true,
      },
      productionWrites: 0,
      approvedOrLiveCounts: null,
      independentTeacherAttestation: false,
      limitations:
        "Local prepared counts only; Pending import and ADMIN decision required. Original authored questions with suggested answers, not board/school papers or independent teacher-certified keys. Rotations are not counted as distinct models.",
    },
    null,
    2,
  ),
);
