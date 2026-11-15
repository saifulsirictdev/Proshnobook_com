"use client";
import { useActionState } from "react";
import {
  followProfile,
  verifyTeacher,
  savePublicPhoto,
  savePublicDetails,
  type SocialState,
} from "@/app/actions/social-profiles";
const initial: SocialState = { ok: false, message: "" };
export function FollowControl({
  tid,
  followers,
  following,
  isSelf = false,
}: {
  tid: string;
  followers: number;
  following: boolean;
  isSelf?: boolean;
}) {
  const [state, action, pending] = useActionState(followProfile, initial);
  const active = state.ok ? !!state.following : following;
  return (
    <form action={action} className="sf-follow">
      <input type="hidden" name="tid" value={tid} />
      <input type="hidden" name="follow" value={active ? "no" : "yes"} />
      <span>
        {(state.followers ?? followers).toLocaleString("bn-BD")} ফলোয়ার
      </span>
      {!isSelf && (
        <button disabled={pending}>
          {pending ? "অপেক্ষা করুন…" : active ? "আনফলো" : "ফলো করুন"}
        </button>
      )}
      <small role="status">{state.message}</small>
    </form>
  );
}
export function VerificationControl({ tid }: { tid: string }) {
  const [state, action, pending] = useActionState(verifyTeacher, initial);
  return (
    <details className="sf-moderation">
      <summary>ADMIN: পরিচয় যাচাই</summary>
      <form action={action}>
        <input type="hidden" name="tid" value={tid} />
        <label>
          সিদ্ধান্ত
          <select name="verified">
            <option value="yes">যাচাইকৃত করুন</option>
            <option value="no">যাচাইকরণ প্রত্যাহার</option>
          </select>
        </label>
        <label>
          যাচাইয়ের নোট
          <input name="note" minLength={5} maxLength={500} required />
        </label>
        <label>
          <input name="reviewed" type="checkbox" required />
          পরিচয় যাচাই করে সিদ্ধান্ত নিচ্ছি
        </label>
        <button disabled={pending}>সিদ্ধান্ত সংরক্ষণ করুন</button>
        <p role="status">{state.message}</p>
      </form>
    </details>
  );
}
function PublicDetailsEditor({
  name,
  designation,
}: {
  name?: string;
  designation?: string;
}) {
  const [state, action, pending] = useActionState(savePublicDetails, initial);
  return (
    <form action={action}>
      <label>
        প্রকাশ্য নাম
        <input
          name="name"
          defaultValue={name}
          minLength={2}
          maxLength={100}
          required
        />
      </label>
      <label>
        নামের নিচে পদবি
        <input
          name="designation"
          defaultValue={designation}
          maxLength={160}
          placeholder="যেমন: সহকারী শিক্ষক, গণিত"
        />
      </label>
      <button disabled={pending}>নাম ও পদবি সেভ করুন</button>
      <p role="status">{state.message}</p>
    </form>
  );
}
export function PublicPhotoEditor({
  tid,
  name,
  designation,
}: {
  tid: string;
  name?: string;
  designation?: string;
}) {
  const [state, action, pending] = useActionState(savePublicPhoto, initial);
  return (
    <details className="sf-photo-editor">
      <summary>প্রোফাইল সম্পাদনা: নাম, পদবি ও ছবি</summary>
      <PublicDetailsEditor name={name} designation={designation} />
      <form action={action}>
        <label>
          ছবির ধরন
          <select name="kind">
            <option value="avatar">প্রোফাইল ছবি</option>
            <option value="cover">কভার ছবি</option>
          </select>
        </label>
        <p>এই ছবি সবাই দেখতে পাবেন। সর্বোচ্চ ২ MB; দিনে ৫ বার।</p>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          name="photo"
          required
        />
        <button disabled={pending}>
          {pending ? "ছবি সেভ হচ্ছে…" : "ছবি সেভ করুন"}
        </button>
        <p role="status">{state.message}</p>
      </form>
      <a href={`/teachers/${tid}`}>আমার প্রকাশ্য প্রোফাইল →</a>
    </details>
  );
}
export function SharePaper({ id, title }: { id: string; title: string }) {
  const [status, action, pending] = useActionState(async () => {
    const url = `${window.location.origin}/marketplace/${id}`;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title, url });
        return "শেয়ার মেনু ব্যবহার করেছেন";
      }
      await navigator.clipboard.writeText(url);
      return "লিংক কপি হয়েছে";
    } catch {
      return "শেয়ার হয়নি বা বাতিল করেছেন।";
    }
  }, "");
  return (
    <form action={action}>
      <button disabled={pending}>শেয়ার করুন ↗</button>
      <small role="status">{status}</small>
    </form>
  );
}
