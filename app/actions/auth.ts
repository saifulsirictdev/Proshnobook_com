"use server";
import { reserveAuthAttempt } from "@/lib/auth-attempts";
import { safeLoginRedirect } from "@/lib/login-redirect";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn } from "@/auth";
import { db } from "@/lib/db";

const Login = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(1024),
});

export async function login(_: string, fd: FormData): Promise<string> {
  const p = Login.safeParse(Object.fromEntries(fd));
  if (!p.success)
    return "Enter a valid email and a password of at least 8 characters.";
  try {
    await signIn("credentials", {
      ...p.data,
      redirectTo: `/auth/landing?${new URLSearchParams({ next: safeLoginRedirect(fd.get("next")) })}`,
    });
  } catch (e) {
    if (e instanceof AuthError) return "Email or password is wrong.";
    throw e;
  }
  return "";
}

export async function register(_: string, fd: FormData): Promise<string> {
  if (
    fd.has("confirmPassword") &&
    fd.get("confirmPassword") !== fd.get("password")
  )
    return "দুটি পাসওয়ার্ড মেলেনি। আবার লিখুন।";
  const p = Login.extend({
    name: z.string().trim().min(2).max(100),
    // bcrypt only uses the first 72 UTF-8 bytes; refuse ambiguous newly registered secrets.
    password: z
      .string()
      .min(8)
      .refine((value) => Buffer.byteLength(value, "utf8") <= 72),
  }).safeParse(Object.fromEntries(fd));
  if (!p.success)
    return "Enter your name, a valid email and a password of at least 8 characters.";
  const email = p.data.email.toLowerCase();
  if (!(await reserveAuthAttempt("registration", email)))
    return "এখন অ্যাকাউন্ট তৈরি করা যায়নি। কিছুক্ষণ পরে চেষ্টা করুন।";
  if (await db.user.findUnique({ where: { email } }))
    return "This email already has an account. Log in instead.";
  await db.user.create({
    data: {
      email,
      name: p.data.name,
      passwordHash: await bcrypt.hash(p.data.password, 10),
      role: "STUDENT", // Email/password registration never grants elevated privileges.
    },
  });
  return login("", fd);
}

export async function googleLogin(fd: FormData): Promise<void> {
  await signIn("google", {
    redirectTo: `/auth/landing?${new URLSearchParams({ next: safeLoginRedirect(fd.get("next")) })}`,
  });
}
