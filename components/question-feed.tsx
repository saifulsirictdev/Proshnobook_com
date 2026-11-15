import PaperSocialControls from "./paper-social-controls";
import Link from "next/link";
import { BadgeCheck, UserRound } from "lucide-react";
import { questionFeed } from "@/lib/question-feed";
import { formatMoney } from "@/lib/wallet";
import QuestionFeedPreview from "./question-feed-preview";
import { SharePaper, FollowControl } from "./social-profile-controls";
export default function QuestionFeed({
  posts,
}: {
  posts: Awaited<ReturnType<typeof questionFeed>>["posts"];
}) {
  return (
    <div className="sf-posts">
      {posts.map(({ paper, profile, model, raster, social }) => (
        <article className="sf-post" key={paper.id}>
          <header className="sf-post-author">
            <Link href={`/teachers/${profile.tid}`} className="sf-author-link">
              <span className="sf-avatar">
                {profile.image ? (
                  <img loading="lazy" src={profile.image} alt="" />
                ) : (
                  <UserRound aria-hidden="true" />
                )}
              </span>
              <span>
                <strong>
                  {profile.name}
                  {profile.verified && (
                    <BadgeCheck
                      fill="currentColor"
                      stroke="white"
                      strokeWidth={2.8}
                      role="img"
                      className="sf-verified"
                      aria-label={
                        profile.official
                          ? "অফিসিয়াল প্রোফাইল"
                          : "যাচাইকৃত প্রোফাইল"
                      }
                    />
                  )}
                </strong>
                <small>
                  {profile.official ? "অফিসিয়াল প্রকাশনা" : "শিক্ষকের প্রশ্নপত্র"}
                </small>
              </span>
            </Link>
            <FollowControl
              key={`${profile.tid}:${profile.following}:${profile.followers}`}
              {...profile}
            />
          </header>
          <div className="sf-caption">
            <Link href={`/marketplace/${paper.id}`}>
              <h3>{paper.metadata.title}</h3>
            </Link>
            <p className="sf-post-meta">
              {paper.metadata.subject} · {paper.metadata.examType}
            </p>
            <p>
              {paper.metadata.description.slice(0, 220)}
              {paper.metadata.description.length > 220 ? "…" : ""}
            </p>
          </div>
          <QuestionFeedPreview model={model} raster={raster} />
          <div className="sf-post-footer">
            <div>
              <small>প্রশ্নপত্রের মূল্য</small>
              <strong>{formatMoney(paper.metadata.pricePaisa)}</strong>
            </div>
            <Link className="sf-primary" href={`/marketplace/${paper.id}`}>
              সম্পূর্ণ প্রশ্নপত্র দেখুন →
            </Link>
          </div>
          <PaperSocialControls paperId={paper.id} summary={social} />
          <div className="sf-post-actions">
            <SharePaper id={paper.id} title={paper.metadata.title} />
            <Link href={`/teachers/${profile.tid}`}>প্রোফাইল দেখুন</Link>
          </div>
        </article>
      ))}
    </div>
  );
}
