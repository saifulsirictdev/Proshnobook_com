import Link from "next/link";
import { landingMetadata, jsonLd } from "@/lib/seo";
import { PUBLIC_SITE_ORIGIN } from "@/lib/brand";
export const metadata = landingMetadata(
  "প্রশ্নপত্র তৈরির নিয়ম, ফ্রি প্রশ্নপত্র ও PDF প্রিন্ট",
  "প্রশ্নবুকে ডাটাবেজ বা PDF থেকে প্রশ্ন তৈরি, শিক্ষকদের ফ্রি ও পেইড প্রশ্নপত্র সংগ্রহ, সংরক্ষণ এবং Preview/Print করার ব্যবহারিক নির্দেশিকা।",
  "/question-paper-guide",
);
const questions = [
  [
    "কীভাবে অনলাইনে প্রশ্নপত্র তৈরি করব?",
    "ডাটাবেজ থেকে প্রশ্ন তৈরি খুলে শ্রেণি, বিষয় ও অধ্যায় নির্বাচন করুন। উপলব্ধ প্রশ্ন থেকে MCQ, সংক্ষিপ্ত ও সৃজনশীল প্রশ্ন বেছে পেপার সাজান। প্রযোজ্য মূল্য বা প্যাকেজের শর্ত নিশ্চিত করে সংরক্ষণ ও প্রিভিউ করুন।",
  ],
  [
    "প্রশ্নপত্র কি বিনামূল্যে পাওয়া যায়?",
    "শিক্ষক বিনামূল্যে প্রকাশ করলে অনুমোদিত পেপারে ‘ফ্রি’ লেখা থাকে। লগইন করে বিনামূল্যে সংগ্রহ করলে কপি লাইব্রেরিতে সেভ হয়। সব পেপার বা প্রশ্ন তৈরির সব সুবিধা বিনামূল্যে নয়; পেইড পেপারের মূল্য আলাদা দেখানো হয়।",
  ],
  [
    "PDF থেকে প্রশ্ন বেছে পেপার বানানো যায়?",
    "রেডি প্রশ্নপত্র লাইব্রেরিতে উপলব্ধ PDF থেকে প্রশ্ন বেছে পেপার তৈরি করা যায়। Preview খোলার আগে সেভ করুন; পরিবর্তন করলে আবার সেভ করুন। ছবিভিত্তিক কপির ভেতরের লেখা আলাদা প্রশ্নের মতো সম্পাদনাযোগ্য নয়।",
  ],
  [
    "সংগ্রহ করা প্রশ্নপত্র প্রিন্ট করব কীভাবে?",
    "Dashboard-এর লাইব্রেরি থেকে কপি খুলে Setup, তারপর Preview/Print ব্যবহার করুন। প্রিন্টের আগে পৃষ্ঠা, প্রশ্নের ক্রম, প্রতিষ্ঠানের তথ্য ও layout যাচাই করুন।",
  ],
  [
    "শিক্ষক কীভাবে নিজের প্রশ্নপত্র প্রকাশ করবেন?",
    "নিজের সংরক্ষিত ও প্রকাশের উপযোগী পেপার বেছে শিরোনাম, শ্রেণি, বিষয়, বিবরণ ও প্রকাশনার ধরন দিন। কনটেন্টের অধিকার নিশ্চিত করতে হবে। শিক্ষকের পেপার ADMIN অনুমোদনের পর প্রকাশিত হয়।",
  ],
];
export default function QuestionPaperGuide() {
  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <nav aria-label="অবস্থান">
        <Link className="qm-action-link" href="/">হোম</Link> / প্রশ্নপত্র নির্দেশিকা
      </nav>
      <h1 className="text-3xl font-bold">
        প্রশ্নপত্র তৈরি, সংগ্রহ ও প্রিন্টের নির্দেশিকা
      </h1>
      <p>
        প্রশ্নবুক.কম ষষ্ঠ–দ্বাদশ শ্রেণির প্রশ্নপত্র তৈরি ও শিক্ষকদের প্রকাশিত প্রশ্নপত্র খোঁজার
        প্ল্যাটফর্ম। উপলব্ধ শ্রেণি, বিষয় ও প্রশ্নের তালিকা সংশ্লিষ্ট পেজে দেখুন। পরীক্ষায়
        ব্যবহারের আগে বিষয়বস্তু ও সঠিকতা নিজে যাচাই করুন।
      </p>
      <nav className="flex flex-wrap gap-3" aria-label="প্রশ্নপত্রের টুল">
        <Link className="qm-action-link" href="/question-builder">ডাটাবেজ থেকে তৈরি</Link>
        <Link className="qm-action-link" href="/ready-papers">PDF লাইব্রেরি</Link>
        <Link className="qm-action-link" href="/marketplace">ফ্রি ও পেইড প্রশ্নপত্র</Link>
      </nav>
      {questions.map(([q, a]) => (
        <section key={q} className="rounded-xl border p-5">
          <h2 className="text-xl font-bold">{q}</h2>
          <p className="mt-3 leading-8">{a}</p>
        </section>
      ))}
      <p>
        অন্যের প্রশ্নপত্র অনুমতি ছাড়া পুনর্বিক্রি বা বিতরণ করবেন না। বিস্তারিত{" "}
        <Link className="underline" href="/terms">
          ব্যবহারের শর্ত
        </Link>{" "}
        দেখুন। সহায়তার জন্য{" "}
        <Link className="underline" href="/contact-us">
          যোগাযোগ করুন
        </Link>
        ।
      </p>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "হোম",
                item: PUBLIC_SITE_ORIGIN,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "প্রশ্নপত্র নির্দেশিকা",
                item: `${PUBLIC_SITE_ORIGIN}/question-paper-guide`,
              },
            ],
          }),
        }}
      />
    </main>
  );
}
