import { FileText, Database } from "lucide-react";
import { auth } from "@/auth";
import { questionFeed } from "@/lib/question-feed";
import QuestionFeed from "@/components/question-feed";
import "@/components/question-feed.css";
import {
  GraduationCap,
  Library,
  School,
  FlaskConical,
  BookOpen,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { marketCatalogPage } from "@/lib/marketplace-catalog-data";
import {
  homeGrade,
  marketSubjects,
  HOME_GRADES,
  MARKET_GRADE_NAMES,
} from "@/lib/marketplace-school-catalog";
import MarketplacePaperCards from "@/components/marketplace-paper-cards";
import "@/components/marketplace-home.css";
const gradeMenu = {
  HSC: { label: "HSC / College", Icon: GraduationCap },
  SSC: { label: "Class 9–10 (SSC)", Icon: Library },
  "8": { label: "Class 8", Icon: BookOpen },
  "7": { label: "Class 7", Icon: FlaskConical },
  "6": { label: "Class 6", Icon: School },
};
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "প্রশ্নবুক — শ্রেণি ও বিষয়ভিত্তিক প্রশ্নপত্র" },
  description:
    "ষষ্ঠ থেকে দ্বাদশ শ্রেণির বিষয় ও পরীক্ষার ধরন অনুযায়ী শিক্ষকদের অনুমোদিত প্রশ্নপত্রের পরিচিতি দেখুন।",
};
export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ grade?: string }>;
}) {
  const grade = homeGrade((await searchParams)?.grade);
  const books = marketSubjects(grade);
  const viewerId = (await auth())?.user?.id;
  const feed = await questionFeed({ grade, viewerId }).catch(() => null);
  const sections: {
    subject: string;
    papers: Awaited<ReturnType<typeof marketCatalogPage>>["papers"];
    unavailable: boolean;
  }[] = [];
  // Keep connection pressure bounded on the current database plan.
  for (let i = 0; i < books.length; i += 4) {
    const batch = await Promise.all(
      books.slice(i, i + 4).map(async (book) => {
        try {
          const result = await marketCatalogPage(
            { grade, subject: book.name },
            undefined,
            6,
          );
          return {
            subject: book.name,
            papers: result.papers,
            unavailable: false,
          };
        } catch {
          return { subject: book.name, papers: [], unavailable: true };
        }
      }),
    );
    sections.push(...batch);
  }
  return (
    <div className="pb-home">
      <section className="sf-create" aria-label="প্রশ্নপত্র তৈরি করুন">
        <Link href="/question-builder">
          <Database aria-hidden="true" />
          ডাটাবেজ থেকে প্রশ্ন তৈরি করুন
        </Link>
        <Link href="/ready-papers">
          <FileText aria-hidden="true" />
          PDF থেকে প্রশ্ন তৈরি করুন
        </Link>
      </section>
      <div className="sf-feed-heading">
        <h2>দেশের শিক্ষকদের তৈরি প্রশ্নপত্র দেখুন</h2>
        <Link href="/teachers/proshnobook">
          প্রশ্নবুক.কম-এর অফিসিয়াল প্রোফাইল ↗
        </Link>
      </div>
      <nav
        className="pb-class-nav pb-home-class-menu"
        aria-label="শ্রেণি নির্বাচন"
      >
        {HOME_GRADES.map((n) => {
          const { label, Icon } = gradeMenu[n];
          return (
            <Link
              key={n}
              href={`/?grade=${n}`}
              aria-current={grade === n ? "page" : undefined}
            >
              <Icon size={16} strokeWidth={2.3} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <header className="pb-home-intro">
        <div>
          <span className="pb-eyebrow">PROSHNOBOOK.COM</span>
          <h1>
            {MARKET_GRADE_NAMES[grade]}
            {grade === "SSC" || grade === "HSC" ? "" : " শ্রেণির"} প্রশ্নপত্র
          </h1>
          <p>
            আপনার বিষয় বেছে নিন। অধ্যায় ভিত্তিক, অর্ধ বার্ষিক, বার্ষিক ও নির্বাচনী
            পরীক্ষার অনুমোদিত প্রশ্নপত্রের পরিচিতি এক জায়গায়।
          </p>
        </div>
        <Link href="/dashboard" className="pb-profile-link">
          আমার প্রোফাইল ↗
        </Link>
      </header>
      <section aria-label="প্রশ্নপত্রের ফিড">
        {feed ? (
          <>
            <QuestionFeed posts={feed.posts} />
            {!feed.posts.length && (
              <p className="pb-empty">এই শ্রেণিতে এখনও প্রকাশিত প্রশ্নপত্র নেই।</p>
            )}
            <div className="pb-more-row">
              <Link className="pb-more" href={`/marketplace?grade=${grade}`}>
                আরও প্রশ্নপত্র দেখুন →
              </Link>
            </div>
          </>
        ) : (
          <p role="status">
            প্রশ্নপত্রের ফিড লোড হয়নি। নিচের বিষয়ভিত্তিক তালিকা দেখুন।
          </p>
        )}
      </section>
      {sections.map((section, index) => (
        <section
          className="pb-subject"
          key={section.subject}
          aria-labelledby={`subject-${index}`}
        >
          <div className="pb-subject-heading">
            <span className="pb-subject-no">
              {(index + 1).toLocaleString("bn-BD")}
            </span>
            <h2 id={`subject-${index}`}>{section.subject}</h2>
          </div>
          {section.papers.length ? (
            <MarketplacePaperCards papers={section.papers} />
          ) : (
            <p className="pb-empty">
              {section.unavailable
                ? "প্রশ্নপত্র লোড করা যায়নি। কিছুক্ষণ পরে আবার চেষ্টা করুন।"
                : "এই বিষয়ে এখনও অনুমোদিত প্রশ্নপত্র প্রকাশিত হয়নি।"}
            </p>
          )}
          <div className="pb-more-row">
            <Link
              className="pb-more"
              href={`/marketplace?${new URLSearchParams({ grade, subject: section.subject })}`}
            >
              আরও প্রশ্ন দেখুন →
            </Link>
          </div>
        </section>
      ))}
      <footer className="pb-home-footer">
        <span>
          বিষয় ও অধ্যায়ের তালিকা ওয়েবসাইটের বিদ্যমান পাঠ্যসূচি অনুযায়ী। নবম–দশম ও
          একাদশ–দ্বাদশে যৌথ বইয়ের তালিকা ব্যবহৃত।
        </span>
        <Link href={`/marketplace?grade=${grade}`}>
          এই শ্রেণির সব অনুমোদিত প্রশ্নপত্র →
        </Link>
      </footer>
    </div>
  );
}
