import { BadgeCheck, UserRound } from "lucide-react";
import type { PublicSocialProfile } from "@/lib/social-profiles";
import { FollowControl } from "./social-profile-controls";
export default function SocialProfileHeader({
  profile,
}: {
  profile: PublicSocialProfile;
}) {
  return (
    <header className="sf-profile-header">
      <div className="sf-profile-cover">
        {profile.cover && (
          <img
            src={profile.cover}
            alt="প্রোফাইল কভার"
            className="sf-cover-image"
          />
        )}
      </div>
      <div className="sf-profile-content">
        <div className="sf-avatar">
          {profile.image ? (
            <img src={profile.image} alt="" />
          ) : (
            <UserRound aria-hidden="true" />
          )}
        </div>
        <div>
          <h1>
            {profile.name}
            {profile.verified && (
              <BadgeCheck
                fill="currentColor"
                stroke="white"
                strokeWidth={2.8}
                role="img"
                aria-label={
                  profile.official
                    ? "প্রশ্নবুকের অফিসিয়াল প্রোফাইল"
                    : "যাচাইকৃত প্রোফাইল"
                }
                className="sf-verified"
              />
            )}
          </h1>
          {profile.designation && (
            <p className="sf-designation">{profile.designation}</p>
          )}
          <p>
            {profile.official
              ? "প্রশ্নবুক.কম-এর অফিসিয়াল প্রশ্নপত্র ও প্রকাশনা"
              : "শিক্ষকের প্রকাশ্য প্রশ্নপত্র প্রোফাইল"}
          </p>
          <FollowControl
            key={`${profile.tid}:${profile.following}:${profile.followers}`}
            {...profile}
          />
        </div>
      </div>
    </header>
  );
}
