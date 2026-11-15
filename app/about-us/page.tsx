import Link from "next/link";
import PolicyLayout, { PolicySection } from "@/components/policy-layout";
import { BRAND } from "@/lib/brand";
import { landingMetadata, jsonLd } from "@/lib/seo";
import { aboutIdentity } from "@/lib/site-identity";
export const metadata = landingMetadata(
  "প্রশ্নবুক.কম সম্পর্কে — প্রশ্নপত্র তৈরি ও প্রকাশনার প্ল্যাটফর্ম",
  BRAND.description,
  "/about-us",
);
export default function About() {
  return (
    <PolicyLayout title="প্রশ্নবুক.কম সম্পর্কে">
      <PolicySection title="বর্তমান সাইটের পরিচয়">
        <p>{BRAND.description}</p>
        <p>
          বর্তমানে proshnobook.com-এ শিক্ষকদের পরীক্ষার প্রশ্নপত্রের কাজকে কেন্দ্র করে
          এই সেবা পরিচালিত হচ্ছে। এটি সাধারণ প্রশ্ন জিজ্ঞাসা ও উত্তর দেওয়ার Q&amp;A
          ফোরাম নয়। পুরোনো সার্চ ফল বা তৃতীয় পক্ষের কোনো বর্ণনা বর্তমান সেবার সঙ্গে নাও
          মিলতে পারে; বর্তমান সুবিধা ও নিয়ম এই সাইটের সংশ্লিষ্ট পাতায় দেখুন।
        </p>
      </PolicySection>
      <PolicySection title="কী কী করা যায়">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <Link className="underline" href="/question-builder">
              ডাটাবেজ থেকে প্রশ্ন তৈরি
            </Link>
            : উপলব্ধ শ্রেণি, বিষয় ও অধ্যায় বেছে MCQ, সংক্ষিপ্ত ও সৃজনশীল প্রশ্ন সাজানো।
          </li>
          <li>
            <Link className="underline" href="/ready-papers">
              PDF লাইব্রেরি
            </Link>
            : উপলব্ধ PDF থেকে প্রশ্ন বেছে নিজের পেপার প্রস্তুত করা।
          </li>
          <li>
            <Link className="underline" href="/marketplace">
              শিক্ষকদের প্রকাশিত প্রশ্নপত্র
            </Link>
            : অনুমোদিত ফ্রি পেপার সংগ্রহ অথবা মূল্য ও শর্ত দেখে পেইড কপি কেনা।
          </li>
          <li>
            নিজের Dashboard-এ সংরক্ষিত কাজ ও সংগ্রহ করা কপি খোলা এবং Setup,
            Preview ও Print ব্যবহার করা।
          </li>
        </ul>
      </PolicySection>
      <PolicySection title="প্রকাশনা, অধিকার ও মূল্য">
        <p>
          শিক্ষক নিজের যোগ্য প্রশ্নপত্র প্রকাশের আবেদন করতে পারেন; ADMIN যাচাইয়ের পর
          প্রকাশিত হয়। নিজের database পেপার, যোগ্য assembled PDF বা নিজস্ব
          upload-এর ক্ষেত্রে প্রকাশের অধিকার থাকতে হবে। অন্যের কেনা কপি নিজের বলে
          পুনর্বিক্রি করা যায় না। ADMIN-এর প্রকাশনা প্রশ্নবুক.কম-এর অফিসিয়াল প্রোফাইলে
          দেখা যায়।
        </p>
        <p>
          সব সুবিধা বিনামূল্যে নয়। প্রকাশক ফ্রি নির্বাচন করলে সেই পেপার বিনা মূল্যে
          সংগ্রহ করা যায়; পেইড কপির মূল্য সংগ্রহের আগে দেখানো হয়। বিস্তারিত{" "}
          <Link className="underline" href="/terms">
            ব্যবহারের শর্ত
          </Link>{" "}
          ও সংশ্লিষ্ট checkout-এ দেখুন।
        </p>
      </PolicySection>
      <PolicySection title="সীমাবদ্ধতা ও দায়িত্ব">
        <p>
          প্রশ্ন বা AI ফল ভুলমুক্ত থাকার নিশ্চয়তা নেই; পরীক্ষায় ব্যবহারের আগে শিক্ষককে
          সঠিকতা যাচাই করতে হবে। PDF-ভিত্তিক ছবির ভেতরের লেখা আলাদা প্রশ্নের মতো
          সম্পাদনাযোগ্য নয়। এই সাইট কোনো সরকারি বোর্ডের অনুমোদন বা সংযুক্তি দাবি করে
          না।
        </p>
        <p>
          <Link className="underline" href="/question-paper-guide">
            ব্যবহারিক নির্দেশিকা
          </Link>{" "}
          ·{" "}
          <Link className="underline" href="/my-profile">
            নিজের প্রকাশ্য প্রোফাইল
          </Link>{" "}
          ·{" "}
          <Link className="underline" href="/contact-us">
            যোগাযোগ ও সহায়তা
          </Link>
        </p>
      </PolicySection>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(aboutIdentity()) }}
      />
    </PolicyLayout>
  );
}
