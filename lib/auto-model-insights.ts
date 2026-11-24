import type { AutoModelRow } from "./auto-model";
import { planSyllabusModel, syllabusStock, syllabusRowKind, type ResolvedSyllabus } from "./auto-model-syllabus";

/** Aggregate-only diagnostics. Never expose question bodies/answers or hidden stock. */
export function modelReadiness(rows: AutoModelRow[], plan: ResolvedSyllabus) {
  const eligible = syllabusStock(rows, plan);
  const result = planSyllabusModel(eligible, plan, () => 0.5);
  const chosen = new Set(result.ok ? result.ids : result.stockIds ?? []);
  const recent = new Set(plan.request.avoidQuestionIds ?? []);
  const required = plan.sections.reduce((n, section) => n + section.offered, 0);
  return {
    complete: result.ok,
    feasible: result.ok || result.missing.length > 0,
    offered: required,
    totalMarks: plan.totalMarks,
    duration: plan.minutes,
    usableStock: eligible.length,
    stockInModel: chosen.size,
    aiShortfall: result.missing.length,
    reusedRecent: eligible.filter(q => chosen.has(q.id) && recent.has(q.id)).length,
    quotaBatchUpperBound: result.missing.length,
    topics: plan.topics.map(topic => ({
      topic,
      available: eligible.filter(q => q.topic === topic).length,
      chosen: eligible.filter(q => q.topic === topic && chosen.has(q.id)).length,
      missing: result.missing.filter(q => q.topic === topic).length,
    })),
    sections: plan.sections.map((section, index) => ({
      title: ("title" in section && section.title) || section.kind,
      kind: section.kind,
      offered: section.offered,
      answer: section.answer,
      marksEach: section.marksEach,
      available: eligible.filter(q => syllabusRowKind(q, plan) === section.kind &&
        (!("topics" in section) || !section.topics || section.topics.includes(q.topic))).length,
      // Use planner assignments for overlapping written sections, never double-count.
      chosen: eligible.filter(q => chosen.has(q.id) && ("assignments" in result && result.assignments
        ? result.assignments[q.id] === index : syllabusRowKind(q, plan) === section.kind)).length,
    })),
  };
}

export function modelHistoryKey(category: string, subject: string, variant: string) {
  return `qb:model-history:v1:${JSON.stringify([category, subject, variant])}`;
}
export function readModelHistory(raw: string | null): string[] {
  try {
    if(raw&&raw.length>100000)return [];
    const value: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(value)) return [];
    return [...new Set(value.slice(-2000).filter((id): id is string => typeof id === "string" && id.length > 0 && id.length <= 128))].slice(-500);
  } catch { return []; }
}
export function appendModelHistory(raw: string | null, ids: string[]) {
  return JSON.stringify([...new Set([...readModelHistory(raw).filter(id => !ids.includes(id)), ...ids])].slice(-500));
}
