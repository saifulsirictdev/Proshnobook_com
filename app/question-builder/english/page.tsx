export const maxDuration = 120;
import { englishQuestionItemGroups } from "@/lib/english/topic-options";
import type { EnglishGrade } from "@/lib/english/blueprints";
import EnglishAutoModel from "@/components/english-auto-model";
import EnglishSetup from "@/components/english-setup";
export const metadata = { title: "English printable paper — 2027 practice" };
export default async function EnglishPage({
  searchParams,
}: {
  searchParams: Promise<{ grade?: string; paper?: string; mode?: string; item?: string; group?: string }>;
}) {
  const p = await searchParams;
  const grade = Number(p.grade),
    paper = Number(p.paper);
  const validGrade = (grade >= 6 && grade <= 12 && Number.isInteger(grade) ? grade : 6) as EnglishGrade;
  if (paper !== 2 && p.mode === "full") return <EnglishAutoModel key={validGrade} grade={validGrade} />;
  const group = englishQuestionItemGroups(validGrade, paper === 2 ? 2 : 1).find(g => g.id === p.group);
  return (
    <EnglishSetup
      initialGrade={
        grade >= 6 && grade <= 12 && Number.isInteger(grade) ? grade : 6
      }
      initialPaper={paper === 2 ? 2 : 1}
      initialMode={paper !== 2 && p.mode === "topic" ? "selected" : "full"}
      initialItems={paper !== 2 && p.mode === "topic" ? group?.itemIds : undefined}
      initialItem={paper !== 2 && typeof p.item === "string" ? p.item : ""}
    />
  );
}
