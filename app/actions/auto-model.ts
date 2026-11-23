"use server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { categoryAliases } from "@/lib/paper-generation";
import { assembleSubjectAutoModel, autoModelBlueprint } from "@/lib/auto-model";

const selection = z.object({
  category: z.string().trim().min(1).max(100),
  subject: z.string().trim().min(1).max(200),
  variant: z.enum(["MCQ", "CQ"]),
});
export async function prepareAutoModel(raw: unknown) {
  const user = (await auth())?.user;
  if (!user?.id || user.role === "STUDENT")
    return { ok: false as const, error: "শিক্ষক অ্যাকাউন্টে লগইন করুন।" };
  const parsed = selection.safeParse(raw);
  if (
    !parsed.success ||
    !autoModelBlueprint(
      parsed.data.category,
      parsed.data.subject,
      parsed.data.variant,
    )
  )
    return {
      ok: false as const,
      error: "এই শ্রেণি–বিষয়ের পূর্ণ মডেল কাঠামো প্রস্তুত নয়।",
    };
  const { category, subject, variant } = parsed.data;
  try {
    // Approved database stock only. No generation, imports, purchases or paid content in this response.
    // Fail closed at the scan bound instead of claiming a truncated pool is the entire bank.
    const rows = await db.question.findMany({
      where: {
        category: { in: categoryAliases(category) },
        subject,
        approved: true,
      },
      select: {
        id: true,
        text: true,
        topic: true,
        options: true,
        correct: true,
        explanation: true,
      },
      orderBy: { id: "asc" },
      take: 10001,
    });
    if (rows.length > 10000)
      return {
        ok: false as const,
        error:
          "এই প্রশ্নভান্ডারটি বড়; পূর্ণ যাচাইয়ের জন্য administrator-এর সহায়তা নিন অথবা Chapter ব্যবহার করুন।",
      };
    const result = assembleSubjectAutoModel(rows, category, subject, variant);
    if (!result.ok)
      return {
        ok: false as const,
        error:
          "পূর্ণ মডেলের উপযুক্ত অনুমোদিত প্রশ্ন যথেষ্ট নেই। কোনো আংশিক মডেল তৈরি করা হয়নি।",
        gaps: result.gaps,
      };
    return { ok: true as const, ids: result.ids };
  } catch {
    return {
      ok: false as const,
      error: "প্রশ্নভান্ডার যাচাই করা যায়নি। আবার চেষ্টা করুন।",
    };
  }
}
