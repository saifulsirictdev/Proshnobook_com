"use client";
import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  setPaperRelation,
  addPaperComment,
  loadPaperComments,
  reportPaperComment,
  moderatePaperComment,
  type PaperSocialState,
} from "@/app/actions/paper-social";
const initial: PaperSocialState = { ok: false, message: "" };
export function CommentModeration({
  paperId,
  commentId,
  admin = false,
  onDone,
}: {
  paperId: string;
  commentId: string;
  admin?: boolean;
  onDone?: () => void;
}) {
  const [state, action, pending] = useActionState(
    moderatePaperComment,
    initial,
  );
  useEffect(() => {
    if (state.ok) onDone?.();
  }, [state, onDone]);
  return (
    <form action={action} className="sf-comment-form">
      <input type="hidden" name="paperId" value={paperId} />
      <input type="hidden" name="commentId" value={commentId} />
      {admin ? (
        <>
          <label>
            সিদ্ধান্ত
            <select name="decision">
              <option value="APPROVED">প্রকাশ করুন</option>
              <option value="HIDDEN">লুকিয়ে রাখুন</option>
              <option value="DELETED">সরিয়ে দিন</option>
            </select>
          </label>
          <label>
            কারণ
            <input name="reason" minLength={5} maxLength={500} required />
          </label>
          <label>
            <input name="reviewed" type="checkbox" required />
            মন্তব্য ও রিপোর্ট দেখে সিদ্ধান্ত নিচ্ছি
          </label>
        </>
      ) : (
        <input type="hidden" name="decision" value="DELETED" />
      )}
      <button disabled={pending}>
        {admin ? "সিদ্ধান্ত সংরক্ষণ" : "নিজের মন্তব্য মুছুন"}
      </button>
      <p role="status">{state.message}</p>
    </form>
  );
}
function ReportComment({
  paperId,
  commentId,
}: {
  paperId: string;
  commentId: string;
}) {
  const [state, action, pending] = useActionState(reportPaperComment, initial);
  return (
    <details>
      <summary>মন্তব্য রিপোর্ট করুন</summary>
      <form action={action} className="sf-comment-form">
        <input type="hidden" name="paperId" value={paperId} />
        <input type="hidden" name="commentId" value={commentId} />
        <label>
          রিপোর্টের কারণ
          <textarea name="reason" minLength={5} maxLength={500} required />
        </label>
        <button disabled={pending || state.ok}>রিপোর্ট পাঠান</button>
        <p role="status">{state.message}</p>
      </form>
    </details>
  );
}
function CommentComposer({ paperId }: { paperId: string }) {
  const [state, action, pending] = useActionState(addPaperComment, initial),
    [nonce, setNonce] = useState(""),
    form = useRef<HTMLFormElement>(null);
  useEffect(() => setNonce(crypto.randomUUID()), []);
  useEffect(() => {
    if (state.ok) {
      form.current?.reset();
      setNonce(crypto.randomUUID());
    }
  }, [state]);
  return (
    <form ref={form} action={action} className="sf-comment-form">
      <input type="hidden" name="paperId" value={paperId} />
      <input type="hidden" name="nonce" value={nonce} />
      <label>
        আপনার মন্তব্য
        <textarea
          name="body"
          minLength={2}
          maxLength={800}
          required
          placeholder="প্রশ্নপত্র নিয়ে গঠনমূলক মন্তব্য করুন"
        />
      </label>
      <p>
        লগইন প্রয়োজন। অনুমোদনের পরে মন্তব্য প্রকাশিত হবে। ফোন, PIN বা ব্যক্তিগত তথ্য
        লিখবেন না। ক্রয়/রিফান্ডের সমস্যা হলে কেনা কপির অভিযোগ ফর্ম ব্যবহার করুন।
      </p>
      <button disabled={pending || !nonce}>
        {pending ? "পাঠানো হচ্ছে…" : "মন্তব্য জমা দিন"}
      </button>
      <p role="status">{state.message}</p>
    </form>
  );
}
export default function PaperSocialControls({
  paperId,
  summary,
}: {
  paperId: string;
  summary: { likes: number; comments: number; liked: boolean; saved: boolean };
}) {
  const [like, likeAction, liking] = useActionState(setPaperRelation, initial),
    [save, saveAction, saving] = useActionState(setPaperRelation, initial),
    [open, setOpen] = useState(false),
    [result, setResult] = useState<Awaited<
      ReturnType<typeof loadPaperComments>
    > | null>(null),
    [busy, start] = useTransition();
  const liked = like.ok ? !!like.liked : summary.liked,
    saved = save.ok ? !!save.saved : summary.saved;
  const refresh = useCallback(
    (after?: string) =>
      start(async () => {
        const r = await loadPaperComments(paperId, after);
        setResult((previous) =>
          after && r.ok && previous?.ok
            ? { ...r, comments: [...previous.comments, ...r.comments] }
            : r,
        );
      }),
    [paperId],
  );
  return (
    <section className="sf-social" aria-label="প্রশ্নপত্রের সামাজিক কার্যক্রম">
      <div className="sf-social-buttons">
        <form action={likeAction}>
          <input type="hidden" name="paperId" value={paperId} />
          <input type="hidden" name="kind" value="like" />
          <input type="hidden" name="on" value={liked ? "no" : "yes"} />
          <button disabled={liking} aria-pressed={liked}>
            ♡ পছন্দ · {(like.likes ?? summary.likes).toLocaleString("bn-BD")}
          </button>
          <small role="status">{like.message}</small>
        </form>
        <button
          aria-expanded={open}
          onClick={() => {
            setOpen((v) => !v);
            if (!open) refresh();
          }}
        >
          মন্তব্য · {summary.comments.toLocaleString("bn-BD")}
        </button>
        <form action={saveAction}>
          <input type="hidden" name="paperId" value={paperId} />
          <input type="hidden" name="kind" value="save" />
          <input type="hidden" name="on" value={saved ? "no" : "yes"} />
          <button disabled={saving} aria-pressed={saved}>
            {saved ? "✓ বুকমার্ক করা" : "বুকমার্ক"}
          </button>
          <small role="status">{save.message}</small>
        </form>
      </div>
      {open && (
        <div className="sf-comments">
          <CommentComposer paperId={paperId} />
          <button disabled={busy} onClick={() => refresh()}>
            মন্তব্য রিফ্রেশ করুন
          </button>
          {busy && <p role="status">মন্তব্য লোড হচ্ছে…</p>}
          {result && !result.ok && (
            <p role="alert">মন্তব্য লোড হয়নি। আবার চেষ্টা করুন।</p>
          )}
          {result?.ok &&
            result.comments.map((c) => (
              <article className="sf-comment" key={c.id}>
                <strong>{c.name}</strong>
                <p>{c.body}</p>
                <small>{new Date(c.at).toLocaleString("bn-BD")}</small>
                <ReportComment paperId={paperId} commentId={c.id} />
                {c.canDelete && (
                  <CommentModeration
                    paperId={paperId}
                    commentId={c.id}
                    onDone={refresh}
                  />
                )}
              </article>
            ))}
          {result?.ok && !result.comments.length && !busy && (
            <p>এখনও অনুমোদিত মন্তব্য নেই।</p>
          )}
          {result?.next && (
            <button disabled={busy} onClick={() => refresh(result.next!)}>
              আরও মন্তব্য →
            </button>
          )}
        </div>
      )}
    </section>
  );
}
