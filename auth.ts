import { ACCOUNT_TYPE_PREFIX } from "@/lib/account-type";
import { reserveAuthAttempt } from "@/lib/auth-attempts";
import { ensureWallet } from "@/lib/wallet";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import authConfig from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Google, // reads AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET
    Credentials({
      async authorize(c) {
        const email = String(c?.email ?? "")
          .toLowerCase()
          .trim();
        const password = String(c?.password ?? "");
        if (!email || email.length > 254 || !password || password.length > 1024)
          return null;
        if (!(await reserveAuthAttempt("credentials", email))) return null;
        const u = await db.user.findUnique({ where: { email } });
        if (!u?.passwordHash) return null;
        const ok = await bcrypt.compare(password, u.passwordHash);
        return ok
          ? { id: u.id, email: u.email, name: u.name, role: u.role }
          : null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ account, profile }) {
      // Only accept Google accounts whose email Google has verified.
      return account?.provider !== "google" || profile?.email_verified === true;
    },
    async jwt({ token, user, account, profile }) {
      if (account?.provider === "google" && token.email) {
        const email = token.email.toLowerCase();
        const isAdmin = email === process.env.ADMIN_EMAIL?.toLowerCase();
        const googleImage =
          typeof (profile as { picture?: string } | undefined)?.picture ===
          "string"
            ? (profile as { picture?: string }).picture
            : undefined;
        // passwordHash is cleared: the email is now proven by Google, so nobody
        // who pre-registered this email with a password can keep access.
        const u = await db.$transaction(async (tx) => {
          const existing = await tx.user.findUnique({ where: { email }, select: { id: true } });
          const saved = await tx.user.upsert({
          where: { email },
          update: {
            passwordHash: null,
            ...(isAdmin ? { role: "ADMIN" as const } : {}),
            ...(googleImage ? { image: googleImage } : {}),
          },
          create: {
            email,
            name: token.name ?? null,
            image: googleImage ?? null,
            role: isAdmin ? "ADMIN" : "STUDENT",
          },
        });
          if (!existing && !isAdmin) await tx.setting.upsert({
            where: { key: ACCOUNT_TYPE_PREFIX + saved.id },
            create: { key: ACCOUNT_TYPE_PREFIX + saved.id, value: "PENDING" },
            update: {},
          });
          return saved;
        });
        token.sub = u.id;
        token.role = u.role;
        token.picture = googleImage ?? u.image ?? token.picture;
      } else if (user) {
        token.role = user.role;
      }
      // Refresh server-issued capabilities after onboarding; never accept client role updates.
      if (token.sub) {
        const current = await db.user.findUnique({ where: { id: token.sub }, select: { role: true } });
        token.role = current?.role;
        if (!current) token.sub = "";
      }
      if ((account || user) && token.sub) await ensureWallet(token.sub);
      return token;
    },
  },
});
