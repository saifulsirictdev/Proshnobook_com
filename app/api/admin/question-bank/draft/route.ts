import { admin } from "@/lib/guard";
import {
  bankPostActor,
  bankReply,
  bankRequestBytes,
} from "@/lib/question-bank-http";
import {
  loadQuestionRecovery,
  mutateQuestionRecovery,
  RecoveryError,
} from "@/lib/question-bank-recovery";
import { recoverySlotSchema } from "@/lib/question-bank-recovery-schema";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET(req: Request) {
  let actor;
  try {
    actor = await admin();
    if (!actor.id) throw Error();
  } catch {
    return bankReply({ error: "শুধু Admin-এর নিজের খসড়া দেখা যাবে।" }, 403);
  }
  try {
    const slot = recoverySlotSchema.parse(
      new URL(req.url).searchParams.get("slot") ?? "new",
    );
    return bankReply({ record: await loadQuestionRecovery(actor.id, slot) });
  } catch (error) {
    return bankReply(
      { error: "খসড়া পড়া যায়নি; editor-এর টেক্সট অপরিবর্তিত আছে।" },
      error instanceof RecoveryError ? error.status : 400,
    );
  }
}
export async function POST(req: Request) {
  let actor;
  try {
    actor = await bankPostActor(req);
  } catch {
    return bankReply({ error: "Admin পরিচয় ও একই origin প্রয়োজন।" }, 403);
  }
  try {
    const bytes = await bankRequestBytes(req, 180000);
    const record = await mutateQuestionRecovery(
      actor.id,
      JSON.parse(bytes.toString("utf8")),
    );
    return bankReply({ record });
  } catch (error) {
    const tooLarge =
      error instanceof Error && error.message === "অনুরোধ অতিরিক্ত বড়।";
    return bankReply(
      {
        error:
          error instanceof RecoveryError
            ? error.message
            : "খসড়া সেভ হয়নি। গঠন/সংযোগ যাচাই করুন; টেক্সট editor-এ আছে।",
      },
      error instanceof RecoveryError ? error.status : tooLarge ? 413 : 400,
    );
  }
}
