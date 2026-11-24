import { englishQuestionItemGroups, englishLessonOptions } from "./topic-options";
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
export function englishBuilderHref(category: string, subject: string, mode: string, topic: string, topicKind = "item") {
  const context = englishBuilderContext(category, subject);
  if (!context || !["topic", "full"].includes(mode)) return null;
  if (mode === "full") return context.route + "&mode=full";
  if (topicKind === "lesson") {
    if (context.paper === 2) return null;
    const lessons = englishLessonOptions(context.grade, context.paper);
    if (!lessons.topics.includes(topic) || !lessons.subject) return null;
    // Direct existing bank picker: do not feed English lessons into generic CQ AI preparation.
    return "/question-builder/create?" + new URLSearchParams({ category: lessons.category, subject: lessons.subject, topic, questionType: "ALL" }).toString();
  }
  if (topicKind !== "item") return null;
  const group = englishQuestionItemGroups(context.grade, context.paper).find(g => g.id === topic);
  if (group && group.itemIds.length > 1) return context.route + "&mode=topic&group=" + encodeURIComponent(group.id);
  if (!context.blueprint.items.some(i => i.id === topic)) return null;
  return context.route + "&mode=topic&item=" + encodeURIComponent(topic);
}
/** Automatic, editable practice prompts; not claimed mandatory syllabus topics. */
export function fullModelWriting(grade: EnglishGrade, paper: EnglishPaper) {
  if (grade === 8 && paper === 2) return {
    "letter-email": {choice: "formal-letter", topic: "Suppose, you are Tanim and you study in Sonapur High School. Your father has been transferred to Dhaka. You will have to go to Dhaka with your father and you have taken TC from Sonapur High School. Now, write an application to the Headmaster of a school in Dhaka for admission on TC."},
    composition: {topic: "July Uprising–2024", words: 250},
  };
  return Object.fromEntries(englishBlueprint(grade, paper).items.filter(i => i.section === "writing").map(i => [i.id, {
    topic: i.id === "letter-email" || i.id === "formal-letter-email" ? "Write to the headteacher requesting more books for the school library" : i.id === "report" ? "A book fair held at your school" : i.id === "composition" ? "The importance of reading books" : i.id === "story" ? "Honesty is the best policy" : i.id === "dialogue" ? "The importance of reading books" : i.id === "paragraph" ? "Your school library" : `School life and learning — ${i.title}`,
    ...(i.writingChoices ? { choice: i.writingChoices[0] } : {}),
    ...(i.words ? { words: i.words } : {}),
  }]));
}
