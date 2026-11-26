import { redirect } from "next/navigation";
import { admin } from "@/lib/guard";
export const dynamic = "force-dynamic";
export default async function ManageQuestions() {
  await admin();
  redirect("/admin/questions/bank");
}
