import { admin } from "@/lib/guard";
import { db } from "@/lib/db";
import { bankReply } from "@/lib/question-bank-http";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    await admin();
  } catch {
    return bankReply({ error: "শুধু Admin-এর অনুমতি আছে।" }, 403);
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id || id.length > 200) return bankReply({ error: "সঠিক ID দিন।" }, 400);
  try {
    const [practiceTests, modelSnapshots, papers] = await Promise.all([
      db.practiceTest.count({
        where: { questionIds: { array_contains: [id] } },
      }),
      db.modelTest.count({
        where: { questions: { array_contains: [{ id }] } },
      }),
      db.setting.findMany({
        where: {
          key: { startsWith: "qbpaper:" },
          value: { contains: JSON.stringify(id) },
        },
        select: { value: true },
        take: 1001,
      }),
    ]);
    let savedIdSetups = 0;
    for (const row of papers.slice(0, 1000)) {
      try {
        if (JSON.parse(row.value).ids?.includes(id)) savedIdSetups++;
      } catch {
        /* malformed old setup is not a verified reference */
      }
    }
    return bankReply({
      practiceTests,
      modelSnapshots,
      savedIdSetups,
      truncated: papers.length > 1000,
      note: "এগুলো পরিচিত storage-এ শনাক্ত একই DB ID-এর reference; text-only snapshots, exported PDF/Word বা তৃতীয় পক্ষের কপি গণনায় নেই। Snapshot rewrite হবে না। ID-ভিত্তিক setup-এ প্রশ্নটি আর পাওয়া না গেলে বিকল্প প্রশ্ন বাছতে হতে পারে।",
    });
  } catch {
    return bankReply(
      { error: "Reference report পাওয়া যায়নি। কোনো প্রশ্ন বদলায়নি।" },
      400,
    );
  }
}
