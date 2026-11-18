import { englishBlueprint, type EnglishGrade, type EnglishPaper } from "./blueprints";
import { englishSubjectRoute } from "./selection";
export type EnglishBuilderMode = "topic" | "full";
/** Reuse the existing subject/grade aliases; never route Job English to school papers. */
export function englishBuilderContext(category: string, subject: string) {
  const route = englishSubjectRoute(category, subject);
  if (!route) return null;
  const params = new URL(route, "https://proshnobook.com").searchParams;
  const grade = Number(params.get("grade")) as EnglishGrade;
  const paper = Number(params.get("paper")) as EnglishPaper;
  return { route, grade, paper, blueprint: englishBlueprint(grade, paper) };
}
export function englishBuilderHref(category: string, subject: string, mode: string, topic: string) {
  const context = englishBuilderContext(category, subject);
  if (!context || !["topic", "full"].includes(mode)) return null;
  if (mode === "topic" && !context.blueprint.items.some(i => i.id === topic)) return null;
  return context.route + (mode === "full" ? "&mode=full" : `&mode=topic&item=${encodeURIComponent(topic)}`);
}
/** Automatic, editable practice prompts; not claimed mandatory syllabus topics. */
export function fullModelWriting(grade: EnglishGrade, paper: EnglishPaper) {
  return Object.fromEntries(englishBlueprint(grade, paper).items.filter(i => i.section === "writing").map(i => [i.id, {
    topic: i.id === "story" ? "Honesty is the best policy" : i.id === "dialogue" ? "The importance of reading books" : i.id === "paragraph" ? "Your school library" : `School life and learning — ${i.title}`,
    ...(i.writingChoices ? { choice: i.writingChoices[0] } : {}),
    ...(i.words ? { words: i.words } : {}),
  }]));
}
