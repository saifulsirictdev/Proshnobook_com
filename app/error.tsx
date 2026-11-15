"use client";
import Link from "next/link";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-xl space-y-5 px-5 py-12" role="alert">
      <h1 className="text-2xl font-bold">এই পাতাটি এখন লোড করা যায়নি</h1>
      <p>
        সাময়িক সমস্যা হতে পারে। টাকা বা পেপার সংগ্রহের কাজ চলছিল হলে আবার চাপার
        আগে লাইব্রেরি ও wallet history দেখুন।
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          className="min-h-11 rounded-xl bg-indigo-700 px-4 py-3 font-bold text-white"
          onClick={reset}
        >
          পাতাটি আবার খুলুন
        </button>
        <Link className="rounded-xl border px-4 py-3" href="/dashboard/library">
          লাইব্রেরি
        </Link>
        <Link className="rounded-xl border px-4 py-3" href="/wallet">
          ওয়ালেট
        </Link>
        <Link className="rounded-xl border px-4 py-3" href="/contact-us">
          সহায়তা
        </Link>
      </div>
    </main>
  );
}
