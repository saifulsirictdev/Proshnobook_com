import {
  bankPostActor,
  bankReply,
  bankRequestBytes,
} from "@/lib/question-bank-http";
import {
  bankAssistSchema,
  suggestBankCorrection,
} from "@/lib/question-bank-assist";
import { db } from "@/lib/db";
import { createHash } from "node:crypto";
export const runtime = "nodejs";
export async function POST(req: Request) {
  let actor;
  try {
    actor = await bankPostActor(req);
  } catch {
    return bankReply(
      { error: "শুধু একই origin-এর Admin অনুরোধ গ্রহণ করা হয়।" },
      403,
    );
  }
  try {
    const { text } = bankAssistSchema.parse(
      JSON.parse((await bankRequestBytes(req, 30000)).toString("utf8")),
    );
    if (!process.env.DEEPSEEK_API_KEY)
      return bankReply(
        {
          error:
            "ঐচ্ছিক সংশোধন সেবা configure করা নেই। হাতে সম্পাদনা ও Unicode conversion চালু আছে।",
        },
        503,
      );
    const now = Date.now(),
      day = new Date(now).toISOString().slice(0, 10),
      owner = createHash("sha256").update(actor.id).digest("hex");
    const key = `question-bank-assist:v1:${owner}:${day}`;
    await db.$transaction(
      async (tx) => {
        const old = await tx.setting.findUnique({ where: { key } });
        const usage: { count: number; recent: number[] } = old
          ? JSON.parse(old.value)
          : { count: 0, recent: [] };
        const recent = usage.recent.filter((t) => t > now - 60000);
        if (usage.count >= 20 || recent.length >= 2)
          throw Error(
            "প্রতি মিনিটে ২টি ও UTC দিনে ২০টি সংশোধন অনুরোধের সীমা। পরে চেষ্টা করুন।",
          );
        const value = JSON.stringify({
          count: usage.count + 1,
          recent: [...recent, now],
        });
        if (old) await tx.setting.update({ where: { key }, data: { value } });
        else await tx.setting.create({ data: { key, value } });
      },
      { isolationLevel: "Serializable" },
    );
    const result = await suggestBankCorrection(
      text,
      process.env.DEEPSEEK_API_KEY,
    );
    return bankReply({
      ...result,
      disclaimer:
        "সফটওয়্যার-সহায়িত খসড়া সংশোধন; উত্তর যাচাই বা শিক্ষক-অনুমোদন নয়। কেবল Apply চাপলে editor-এ বসবে; সেভ বা approve হয়নি।",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    return bankReply(
      {
        error: /^[\u0980-\u09ff]/.test(message)
          ? message
          : "সংশোধন পাওয়া যায়নি। মূল প্রশ্ন অপরিবর্তিত আছে।",
      },
      400,
    );
  }
}
