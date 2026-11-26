import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkAdmin } from "@/lib/route-guard";

export const dynamic = "force-dynamic";

// 🎯 ১. AI-র প্রশ্নগুলো ফেচ করা
// ?pending=1 দিলে শুধু যেগুলো এখনো অ্যাপ্রুভ হয়নি সেগুলো আসবে (সর্বোচ্চ ১০০টি)
// ?pending=1 না দিলে আগের মতোই সব AI প্রশ্ন (সর্বশেষ ৫০টি)
export async function GET(req: Request) {
  // 🔒 শুধু লগইন করা ADMIN
  const denied = await checkAdmin();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const pendingOnly = searchParams.get("pending") === "1";

    const questions = await db.question.findMany({
      where: pendingOnly
        ? { source: "AI_GENERATOR", approved: false }
        : { source: "AI_GENERATOR" },
      orderBy: { createdAt: "desc" },
      take: pendingOnly ? 100 : 50,
    });
    return NextResponse.json({ success: true, questions });
  } catch (error: any) {
    console.error("ai-approvals GET error:", error?.message);
    return NextResponse.json({ success: false, error: "সার্ভারে সমস্যা হয়েছে।" }, { status: 500 });
  }
}

// 🎯 ২. অ্যাপ্রুভ / এডিট করা
export async function POST(_req: Request) {
  const denied = await checkAdmin();
  if (denied) return denied;
  // Old unversioned edits and ID-only approvals could republish Trash records.
  return NextResponse.json({ success: false, error: "প্রশ্ন সম্পাদনা ও অনুমোদনের জন্য প্রশ্নব্যাংক স্টুডিও খুলুন।", href: "/admin/questions/bank" }, { status: 409 });
}
