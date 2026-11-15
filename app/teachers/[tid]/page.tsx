import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  publicProfile,
  profileOwner,
  OFFICIAL_PROFILE,
} from "@/lib/social-profiles";
import { questionFeed } from "@/lib/question-feed";
import QuestionFeed from "@/components/question-feed";
import SocialProfileHeader from "@/components/social-profile-header";
import {
  VerificationControl,
  PublicPhotoEditor,
} from "@/components/social-profile-controls";
import "@/components/question-feed.css";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "প্রশ্নপত্রের প্রকাশ্য প্রোফাইল",
  robots: { index: false },
};
export default async function TeacherPage({
  params,
  searchParams,
}: {
  params: Promise<{ tid: string }>;
  searchParams: Promise<{ after?: string }>;
}) {
  const { tid } = await params,
    viewerId = (await auth())?.user?.id;
  let profile, owner;
  try {
    owner = await profileOwner(tid);
    profile = await publicProfile(tid, viewerId);
  } catch {
    notFound();
  }
  const viewer = viewerId
    ? await db.user.findUnique({
        where: { id: viewerId },
        select: { role: true },
      })
    : null;
  const { after } = await searchParams;
  const feed = await questionFeed({
    ...(tid === OFFICIAL_PROFILE ? { official: true } : { ownerId: owner!.id }),
    after,
    viewerId,
  });
  return (
    <main className="mx-auto max-w-4xl p-4 space-y-5">
      <Link href="/">← প্রশ্নপত্রের ফিড</Link>
      <SocialProfileHeader profile={profile} />
      {profile.isSelf && (
        <>
          <Link className="sf-primary" href="/dashboard">
            আমার Dashboard / সংরক্ষিত কপি / Wallet →
          </Link>
          <PublicPhotoEditor tid={tid} />
        </>
      )}
      {viewer?.role === "ADMIN" && tid !== OFFICIAL_PROFILE && (
        <VerificationControl tid={tid} />
      )}
      <h2 className="text-xl font-bold">প্রকাশিত প্রশ্নপত্র</h2>
      <QuestionFeed posts={feed.posts} />
      {!feed.posts.length && <p>এখনও প্রকাশিত প্রশ্নপত্র নেই।</p>}
      {feed.next && (
        <Link
          className="sf-primary"
          href={`/teachers/${tid}?${new URLSearchParams({ after: feed.next })}`}
        >
          আরও প্রশ্নপত্র →
        </Link>
      )}
      <p className="text-sm text-slate-500">
        এটি প্রকাশ্য প্রোফাইল। ব্যক্তিগত সংরক্ষিত/কেনা কপি, যোগাযোগ ও আর্থিক তথ্য এখানে
        দেখানো হয় না।
      </p>
    </main>
  );
}
