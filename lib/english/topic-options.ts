import { NCTB_CLASSES } from "../nctb-data";
import { englishBlueprint, type EnglishGrade, type EnglishPaper } from "./blueprints";
export type EnglishQuestionGroup = { id: string; title: string; itemIds: string[] };
/** Class 6 and Class 7 first-paper groups each follow their own owner-supplied screenshot.
 * All other grades use their own existing practice blueprint numbering.
 * Class 7 is separately transcribed; no Class 6 groups are inferred for other grades or second paper.
 */
export function englishQuestionItemGroups(grade: EnglishGrade, paper: EnglishPaper): EnglishQuestionGroup[] {
  if (paper !== 1) return [];
  const blueprint = englishBlueprint(grade, paper);
  if (grade === 6) return [
    { id: "seen-comprehension", title: "Ques. No. 01–04: Seen Comprehension / Passages", itemIds: ["mcq", "comprehension", "gap", "vocabulary"] },
    { id: "unseen-comprehension", title: "Ques. No. 05–07: Unseen Comprehension / Passages", itemIds: ["information", "true-false", "summary"] },
    { id: "matching", title: "Ques. No. 08: Matching", itemIds: ["matching"] },
    { id: "rearranging", title: "Ques. No. 09: Re-arranging Sentences", itemIds: ["rearranging"] },
    { id: "poems", title: "Ques. No. 10: Answering Questions from Poems", itemIds: ["poems"] },
    { id: "story", title: "Ques. No. 11: Completing Stories", itemIds: ["story"] },
    { id: "paragraph", title: "Ques. No. 12: Writing Paragraph", itemIds: ["paragraph"] },
    { id: "dialogue", title: "Ques. No. 13: Writing Dialogue", itemIds: ["dialogue"] },
  ];
  if (grade === 7) return [
    { id: "seen-comprehension", title: "Ques. No. 01–04: Seen Comprehension", itemIds: ["mcq", "comprehension", "gap", "vocabulary"] },
    { id: "unseen-comprehension", title: "Ques. No. 05–07: Unseen Comprehension", itemIds: ["information", "true-false", "summary"] },
    { id: "matching", title: "Ques. No. 08: Matching", itemIds: ["matching"] },
    { id: "rearranging", title: "Ques. No. 09: Re-arranging Sentences", itemIds: ["rearranging"] },
    { id: "poems", title: "Ques. No. 10: Question Answer from Poem", itemIds: ["poems"] },
    { id: "story", title: "Ques. No. 11: Completing a Story", itemIds: ["story"] },
    { id: "paragraph", title: "Ques. No. 12: Writing Paragraph", itemIds: ["paragraph"] },
    { id: "dialogue", title: "Ques. No. 13: Writing Dialogues", itemIds: ["dialogue"] },
  ];
  return blueprint.items.map((item, i) => ({ id: item.id, title: `Ques. No. ${String(i + 1).padStart(2, "0")}: ${item.title}`, itemIds: [item.id] }));
}
/** Keep exact old catalog scope and group names. Some old lists contain question
 * headings rather than textbook lessons; surface that gap instead of inventing units.
 */
export function englishLessonOptions(grade: EnglishGrade, paper: EnglishPaper) {
  const category = grade <= 8 ? `Class ${grade}` : grade <= 10 ? "Class 9" : "Class 11-12";
  const entry = NCTB_CLASSES.find(c => c.class === category);
  const subject = entry?.subjects.find(s => /english|ইংরেজ[িী]/i.test(s.name) && (/2|২|second|grammar|ব্যাকরণ/i.test(s.name) ? 2 : 1) === paper);
  const groups = subject?.subCategories ?? [];
  const catalogTopics = [...new Set(subject?.chapters ?? groups.flatMap(g => g.topics))];
  // Class 7 now has a supplied unit list. Keep legacy question-pattern catalog
  // names for stored-bank compatibility, but show only textbook units in Lesson.
  const topics = grade === 7 && paper === 1
    ? catalogTopics.filter(t => /^Unit-\d{2}:/.test(t))
    : catalogTopics;
  const hasTextbookLessons = topics.some(t => /^(?:lesson|unit)[\s-]*\d/i.test(t));
  return { category, subject: subject?.name ?? "", groups, topics,
    notice: !topics.length ? "এই class/paper-এর আগের lesson/topic তালিকা পাওয়া যায়নি। পাঠ্যবইয়ের সূচিপত্র প্রয়োজন।" : !hasTextbookLessons ? "আগের topic তালিকা রাখা হয়েছে। এখানে পূর্ণ textbook lesson/unit সূচি নেই; সঠিক Lesson তালিকার জন্য বইয়ের সূচিপত্র প্রয়োজন।" : "",
  };
}
