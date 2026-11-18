import { staff } from "@/lib/guard";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
/** Existing bookmarks now use the common question-management workflow. Data and actions remain intact. */
export default async function EnglishReview() {
  await staff();
  redirect("/admin/questions?category=Class%206&subject=English%201st%20Paper#english-question-items");
}
