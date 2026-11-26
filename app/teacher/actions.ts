"use server";
import { loginLandingPath } from "@/lib/login-redirect";
import { signIn } from "@/auth";

export async function teacherGoogle(): Promise<void> {
  await signIn("google", { redirectTo: loginLandingPath("/dashboard") });
}
