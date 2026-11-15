import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { parseBanglaQuestions } from "@/lib/question-parser";
import { extractPdfText } from "@/lib/pdf-mcq/extract";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json(
      { success: false, error: "আগে লগইন করুন।" },
      { status: 401 },
    );
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const directText = formData.get("text");
    let fullText = "";
    if (typeof directText === "string" && directText.trim().length > 10) {
      if (directText.length > 200_000)
        return NextResponse.json(
          { success: false, error: "টেক্সট বেশি বড়। ভাগ করে দিন।" },
          { status: 400 },
        );
      fullText = directText;
    } else if (file instanceof File) {
      if (file.size < 5 || file.size > 10_000_000)
        return NextResponse.json(
          { success: false, error: "PDF সর্বোচ্চ ১০ MB দিন।" },
          { status: 400 },
        );
      const buffer = await file.arrayBuffer();
      if (new TextDecoder().decode(new Uint8Array(buffer, 0, 5)) !== "%PDF-")
        return NextResponse.json(
          { success: false, error: "সঠিক PDF দিন।" },
          { status: 400 },
        );
      fullText = await extractPdfText(buffer);
    } else {
      return NextResponse.json(
        { success: false, error: "কোনো ফাইল বা টেক্সট পাওয়া যায়নি।" },
        { status: 400 },
      );
    }
    if (!fullText.trim())
      return NextResponse.json(
        { success: false, error: "PDF থেকে কোনো টেক্সট পড়া সম্ভব হয়নি।" },
        { status: 400 },
      );
    const parsedData = parseBanglaQuestions(fullText);
    return NextResponse.json({
      success: true,
      rawLength: fullText.length,
      mcqs: parsedData.mcqs,
      shortQuestions: parsedData.shortQuestions,
      cqs: parsedData.cqs,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error:
          "PDF প্রসেস করা যায়নি। সর্বোচ্চ ১০০ পৃষ্ঠার সঠিক PDF বা সরাসরি টেক্সট দিন।",
      },
      { status: 400 },
    );
  }
}
