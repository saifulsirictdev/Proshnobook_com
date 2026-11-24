"use client";
import { useRef, useState } from "react";
import QbBuilder from "./qb-builder";
import type { englishLegacyPaper } from "@/lib/english/legacy-builder";
import type { EnglishDraft } from "@/lib/english/draft";
import type { PaperSettings } from "@/lib/paper-builder";
import { currentHeader } from "@/lib/paper-header";
import { withDefaultHeader } from "@/lib/default-paper-header";
import { saveEnglishPaper } from "@/app/actions/english-paper";
export default function EnglishLegacyBuilder({
  draftKey,
  initial,
  paper,
}: {
  draftKey: string;
  initial: EnglishDraft;
  paper: ReturnType<typeof englishLegacyPaper>;
}) {
  // Any enabled header (even an unnamed one) is an explicit existing choice.
  // Saved user settings and approved English reference headers stay untouched.
  const useDefaultHeader = !initial.builderSettings && !initial.header.enabled;
  const settings = useRef<PaperSettings>(
    useDefaultHeader ? withDefaultHeader(paper.settings, true) : paper.settings,
  );
  // updatedAt is the server's optimistic-concurrency token, not a client clock.
  // Advance it only after a confirmed save so repeat saves work, while a real
  // concurrent tab still receives a conflict instead of overwriting its work.
  const latest = useRef(initial);
  const saving = useRef(false);
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function persist(
    s: PaperSettings,
  ): Promise<{ ok: boolean; error?: string }> {
    if (saving.current)
      return { ok: false, error: "সেভ চলছে। একটু পরে আবার চেষ্টা করুন।" };
    saving.current = true;
    setBusy(true);
    setMessage("");
    try {
      const next: EnglishDraft = {
        ...latest.current,
        builderSettings: s,
        header: currentHeader(s),
        font: s.cfg.font,
        fontSize: s.cfg.fontSize,
        layout: {
          paper: s.cfg.paper,
          align: s.cfg.align,
          marginTop: s.cfg.marginTop,
          marginBottom: s.cfg.marginBottom,
          marginLeft: s.cfg.marginLeft,
          marginRight: s.cfg.marginRight,
        },
      };
      const result = await saveEnglishPaper(draftKey, next);
      if (result.ok && result.updatedAt) {
        latest.current = { ...next, updatedAt: result.updatedAt };
        settings.current = s;
        setMessage("সেভ হয়েছে।");
        return { ok: true };
      }
      const error = result.error ?? "সেভ হয়নি।";
      setMessage(error);
      return { ok: false, error };
    } catch {
      const error = "সেভ নিশ্চিত হয়নি। আবার চেষ্টা করুন।";
      setMessage(error);
      return { ok: false, error };
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }
  return (
    <main className="mx-auto max-w-[1440px] px-4 py-6">
      <div
        data-noprint
        className="mb-4 flex flex-wrap items-center gap-3 rounded border bg-white p-3"
      >
        <button
          disabled={busy}
          onClick={() => void persist(settings.current)}
          className="rounded bg-emerald-700 px-4 py-2 text-white"
        >
          {busy ? "সেভ হচ্ছে…" : "প্রশ্নপত্র সেভ করুন"}
        </button>
        <a className="underline" href="/question-builder/english/saved">
          সংরক্ষিত প্রশ্নপত্র
        </a>
        <p role="status">{message}</p>
      </div>
      <QbBuilder
        english={{
          key: draftKey,
          ...paper,
          useDefaultHeader,
          saveSettings: persist,
          onSettings: (s) => {
            settings.current = s;
          },
        }}
      />
    </main>
  );
}
