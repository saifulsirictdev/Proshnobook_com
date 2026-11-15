import Link from "next/link";
import { FileText, ArrowUpRight, UserRound } from "lucide-react";
import type { PublicMarketPaper } from "@/lib/marketplace-catalog";
import { formatMoney } from "@/lib/wallet";
import { MARKET_GRADE_NAMES } from "@/lib/marketplace-school-catalog";
import "./marketplace-home.css";
export default function MarketplacePaperCards({
  papers,
}: {
  papers: PublicMarketPaper[];
}) {
  return (
    <div className="pb-paper-grid">
      {papers.map((p) => (
        <article key={p.id} className="pb-paper-card">
          <Link
            href={`/marketplace/${p.id}`}
            className="pb-paper-sheet"
            aria-label={`${p.metadata.title} — বিবরণ দেখুন`}
          >
            <span className="pb-paper-cover-top">
              <span className="pb-paper-label">
                <FileText size={12} aria-hidden="true" /> প্রশ্নপত্র
              </span>
              <span className="pb-paper-level">
                {["11", "12"].includes(p.metadata.grade)
                  ? "HSC"
                  : ["9", "10"].includes(p.metadata.grade)
                    ? "SSC"
                    : `CLASS ${p.metadata.grade}`}
              </span>
            </span>
            <span className="pb-paper-subject">{p.metadata.subject}</span>
            <span className="pb-paper-exam">{p.metadata.examType}</span>
            <span className="pb-paper-rule" />
            <strong className="pb-paper-title">{p.metadata.title}</strong>
            <span className="pb-paper-class">
              {MARKET_GRADE_NAMES[p.metadata.grade]} শ্রেণি
            </span>
            <span className="pb-paper-chapters">
              {p.metadata.chapters.join(" · ")}
            </span>
            <span className="pb-paper-disclaimer">
              জলছাপসহ সম্পূর্ণ প্রশ্নপত্র দেখুন
            </span>
          </Link>
          <div className="pb-paper-info">
            <div className="pb-paper-price">
              <span>মূল্য</span>
              <strong>
                {p.metadata.pricePaisa === 0
                  ? "ফ্রি"
                  : formatMoney(p.metadata.pricePaisa)}
              </strong>
            </div>
            <Link href={`/marketplace/${p.id}`} className="pb-paper-view">
              প্রশ্নপত্র দেখুন <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <Link className="pb-seller" href={`/teachers/${p.sellerTid}`}>
            <UserRound size={13} aria-hidden="true" /> বিক্রেতার প্রোফাইল{" "}
            <ArrowUpRight size={12} aria-hidden="true" />
          </Link>
        </article>
      ))}
    </div>
  );
}
