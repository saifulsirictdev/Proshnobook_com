import batch from "./data/ssc-literature-review.json";
import { validateEnglishDraft } from "./draft";
import { englishItemGroups } from "./item-bank";
import { paperHeaderSchema } from "../paper-header";
/** SCHOOL source-question excerpts, not fabricated NCTB extracts or board papers.
 * All answers remain teacher-review interpretations, with no automatic import/approval.
 */
export function preparedSSCLiteratureItems() {
  return batch.entries.flatMap(entry => {
    const group = entry.id === "poems" ? "textbook-poems" : "textbook-stories";
    const subitems = entry.questions.map(({text,answer})=>({text,answer}));
    const reference = `School-question compilation ${batch.sourceFile}; ${entry.id === "poems" ? "Tejgoan Govt. High School, PDF p.7 Q8(a–h)" : "Tejgoan Govt. High School PDF p.7 Q9(b–h), plus Govt. Mohammadpur Model School & College PDF p.5 Q9(f)"}. Not board questions. Assistant-prepared answers; verify against original works before approval.`;
    const draft = validateEnglishDraft({
      version:1,name:`SSC Class 10 — ${entry.id} source questions — teacher review required`,
      selection:{grade:10,paper:1,mode:"selected",itemIds:[entry.id],writing:{},includeAnswers:true,
        sources:{[group]:{kind:"question-bank",text:subitems.map(s=>s.text).join("\n"),reference}}},
      output:{passages:[],tasks:[{id:entry.id,instruction:`Answer any five of the following questions from ${entry.id}.`,subitems}]},
      header:paperHeaderSchema.parse({}),fontSize:12,font:"kalpurush",updatedAt:"2026-11-10T00:00:00.000Z",
    });
    return englishItemGroups(draft).map(item=>({...item,draft:{...item.draft,name:draft.name}}));
  });
}
