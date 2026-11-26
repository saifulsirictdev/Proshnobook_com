"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  bankDraftSchema,
  type BankDraft,
} from "@/lib/admin-question-bank-schema";
import {
  parseBankText,
  bankTextTemplate,
  toBankText,
  bankUuidFromHex,
} from "@/lib/question-bank-batch";
import { ScopeFields, Preview } from "../workspace";
import QuestionBankEditorialTools from "@/components/question-bank-editorial-tools";
const input =
  "w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-blue-500";
const button =
  "inline-flex items-center justify-center rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-800 disabled:opacity-50";
const panel =
  "space-y-4 rounded-2xl border border-slate-200 bg-white p-4 md:p-5";
type Entry = { entryId: string; draft: BankDraft };
type Report = {
  entryId: string;
  exact?: string;
  inBatch: boolean;
  trashed?: boolean;
  near: { id: string; text: string; score: number }[];
};
async function call(body: FormData | Record<string, unknown>) {
  const response = await fetch("/api/admin/question-bank/import", {
    method: "POST",
    body: body instanceof FormData ? body : JSON.stringify(body),
    headers:
      body instanceof FormData ? {} : { "Content-Type": "application/json" },
    credentials: "same-origin",
  });
  const result = await response.json();
  if (!response.ok) throw Error(result.error ?? "অনুরোধ সম্পন্ন হয়নি।");
  return result;
}
export default function BankImportWorkspace() {
  const [scope, setScope] = useState({
      category: "Class 6",
      subject: "",
      topic: "",
    }),
    [raw, setRaw] = useState(""),
    [items, setItems] = useState<Entry[]>([]),
    [selected, setSelected] = useState<string[]>([]),
    [report, setReport] = useState<Report[]>([]),
    [signature, setSignature] = useState(""),
    [reviewed, setReviewed] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [warnings, setWarnings] = useState<string[]>([]),
    [fileName, setFileName] = useState("manual-template.txt"),
    [batchId, setBatchId] = useState(() => crypto.randomUUID()),
    [saved, setSaved] = useState(false);
  const chosen = items.filter((i) => selected.includes(i.entryId)),
    currentSignature = JSON.stringify(chosen);
  useEffect(() => {
    if (!items.length || saved) return;
    const leave = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", leave);
    return () => window.removeEventListener("beforeunload", leave);
  }, [items.length, saved]);
  function invalidate() {
    setReport([]);
    setSignature("");
    setReviewed(false);
    setSaved(false);
    setMessage("");
  }
  async function stage(drafts: BankDraft[], identity?: string) {
    const uuid = async (value: string) =>
      bankUuidFromHex(
        Array.from(
          new Uint8Array(
            await crypto.subtle.digest(
              "SHA-256",
              new TextEncoder().encode(value),
            ),
          ),
        )
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(""),
      );
    const id =
      identity ??
      (await uuid(
        JSON.stringify([
          scope,
          raw.replace(
            /\/api\/question-bank\/images\/[a-f0-9-]+\.webp/g,
            "[uploaded-image]",
          ),
        ]),
      ));
    const next = await Promise.all(
      drafts.map(async (draft, index) => ({
        entryId: await uuid(id + ":" + index),
        draft,
      })),
    );
    setItems(next);
    setSelected(next.map((i) => i.entryId));
    setBatchId(id);
    invalidate();
  }
  function patch(id: string, changes: Partial<BankDraft>) {
    setItems((rows) =>
      rows.map((row) =>
        row.entryId === id
          ? { ...row, draft: { ...row.draft, ...changes } }
          : row,
      ),
    );
    invalidate();
  }
  async function upload(file: File | undefined) {
    if (!file) return;
    if (!scope.subject || !scope.topic) {
      setMessage("আগে বিষয় ও অধ্যায় দিন।");
      return;
    }
    if (file.size > 4000000) {
      setMessage("ফাইল সর্বোচ্চ ৪ MB।");
      return;
    }
    if (
      items.length &&
      !confirm("বর্তমান staged ব্যাচ সরিয়ে নতুন ফাইল খুলবেন?")
    )
      return;
    setBusy(true);
    setMessage("");
    try {
      const form = new FormData();
      for (const [k, v] of Object.entries(scope)) form.set(k, v);
      form.set("file", file);
      const result = await call(form);
      await stage(result.items, result.batchId);
      setRaw(result.text || toBankText(result.items));
      setWarnings(result.warnings ?? []);
      setFileName(result.fileName);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function checkOrSave(action: "check" | "save") {
    setBusy(true);
    setMessage("");
    try {
      for (const { draft } of chosen) bankDraftSchema.parse(draft);
      const result = await call({
        action,
        batchId,
        fileName,
        reviewed,
        items: chosen,
      });
      if (action === "check") {
        setReport(result.report);
        setSignature(currentSignature);
        setReviewed(false);
        setMessage(
          `${result.existingScanned}টি DB প্রশ্নের সঙ্গে duplicate পরীক্ষা হয়েছে। Near-match কেবল সম্ভাবনা, নিশ্চিত duplicate নয়।`,
        );
      } else {
        setMessage(
          `${result.inserted}টি নতুন Pending; ${result.skipped}টি duplicate/আগে সেভ করা entry বাদ; ${result.failures.length}টি ব্যর্থ; ${result.notAttempted}টি চেষ্টা হয়নি। কোনো প্রশ্ন approve হয়নি।${result.failures.length ? " ভুল ঠিক করে আবার Check করুন; আগের সেভ হওয়া entry আর লেখা হবে না।" : ""}`,
        );
        setSaved(!result.failures.length && !result.notAttempted);
      }
    } catch (e) {
      setMessage(
        e instanceof Error && /^[\u0980-\u09ff]/.test(e.message)
          ? e.message
          : "প্রশ্ন, চারটি স্বতন্ত্র অপশন, answer key ও CQ অংশ/নম্বর পূরণ করে আবার যাচাই করুন।",
      );
    } finally {
      setBusy(false);
    }
  }
  const math = /গণিত|mathematics/i.test(scope.subject),
    templateQuery = `math=${math ? 1 : 0}`;
  return (
    <div className="space-y-5 text-slate-900">
      <Link
        href="/admin/questions/bank"
        className="text-sm font-semibold text-blue-700"
      >
        ← প্রশ্নব্যাংক স্টুডিও
      </Link>
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-700">
          Review before import
        </p>
        <h1 className="mt-2 text-2xl font-bold">
          Word / JSON ব্যাচ review-import
        </h1>
        <p className="mt-2 text-sm leading-7 text-slate-500">
          ফাইল → Parse → হাতে সংশোধন → duplicate check → নির্বাচিত প্রশ্ন
          Pending হিসেবে সেভ। Approval আলাদা।
        </p>
      </header>
      <section className={panel}>
        <h2 className="font-bold">১. শ্রেণি, বিষয় ও অধ্যায়</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <ScopeFields
            edit
            value={scope}
            scopes={[]}
            onChange={(next) => {
              setScope(next);
              setItems((rows) =>
                rows.map((row) => ({
                  ...row,
                  draft: { ...row.draft, ...next },
                })),
              );
              invalidate();
            }}
          />
        </div>
        <p className="text-xs text-slate-500">
          এই scope পুরো ব্যাচে প্রযোজ্য। Scope বদলালে duplicate check আবার করতে
          হবে।
        </p>
      </section>
      <section className={panel}>
        <h2 className="font-bold">২. ফাইল বা Template-এর টেক্সট</h2>
        <div className="flex flex-wrap gap-2">
          {["docx", "json", "txt"].map((format) => (
            <a
              key={format}
              className={button}
              href={`/api/admin/question-bank/template?format=${format}&${templateQuery}`}
              download
            >
              {format.toUpperCase()} Template
            </a>
          ))}
          <button
            type="button"
            className={button}
            disabled={busy}
            onClick={() => {
              if (raw && !confirm("টেক্সট বক্সে নমুনা Template বসাবেন?"))
                return;
              setRaw(bankTextTemplate(math));
            }}
          >
            টেক্সটে নমুনা বসান
          </button>
        </div>
        <p className="text-xs leading-6 text-slate-600">
          প্রতি ব্যাচে ১–১০০টি প্রশ্ন; সর্বোচ্চ ৪ MB .docx / ১ MB JSON। পুরোনো
          .doc আগে .docx করুন। Word-এর নিজস্ব Insert Picture-এ দেওয়া সর্বোচ্চ
          ২০টি JPG/PNG/WebP বের করা হবে। ছবির URL প্রকাশ্য; ব্যক্তিগত তথ্য দেবেন
          না। Word upload প্রশ্ন প্রকাশ করে না; কেবল ছবিগুলো সংরক্ষণ করে।
        </p>
        <input
          aria-label="Word বা JSON ফাইল"
          type="file"
          accept=".docx,.json,application/json,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          disabled={busy}
          onChange={(e) => {
            void upload(e.target.files?.[0]);
            e.target.value = "";
          }}
          className="block w-full text-sm"
        />
        <details open={!items.length}>
          <summary className="cursor-pointer text-sm font-semibold">
            Extracted / Template টেক্সট দেখুন ও সংশোধন করুন
          </summary>
          <label className="mt-3 grid gap-2 text-sm">
            প্রশ্নব্যাচের টেক্সট
            <textarea
              aria-label="প্রশ্নব্যাচের টেক্সট"
              className={`${input} font-mono`}
              rows={12}
              maxLength={250000}
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
            />
          </label>
          <p className="my-2 text-xs leading-6 text-slate-500">
            প্রতিটি প্রশ্ন [MCQ], [CQ] বা [SQ] দিয়ে শুরু করুন, প্রশ্নের মাঝে ---
            দিন। Word-এর যেকোনো layout নিখুঁত পড়ার নিশ্চয়তা নেই—unstructured
            টেক্সট Template মেনে সাজান। Raw text বদলানোর পর Parse না করলে staged
            প্রশ্ন বদলাবে না।
          </p>
          <button
            type="button"
            className={button}
            disabled={busy || !scope.subject || !scope.topic || !raw.trim()}
            onClick={async () => {
              try {
                if (
                  items.length &&
                  !confirm(
                    "বর্তমান staged সংশোধনের বদলে এই টেক্সট Parse করবেন?",
                  )
                )
                  return;
                await stage(parseBankText(raw, scope));
                setFileName("edited-template.txt");
              } catch (e) {
                setMessage((e as Error).message);
              }
            }}
          >
            টেক্সট Parse করে staging-এ নিন
          </button>
          <div className="mt-3">
            <QuestionBankEditorialTools
              fields={[
                { id: "raw", label: "সম্পূর্ণ extracted টেক্সট", text: raw },
              ]}
              apply={(_, text) => setRaw(text)}
            />
          </div>
        </details>
        {warnings.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-6 text-amber-900">
            <b>যা যাচাই করতে হবে</b>
            <ul className="list-inside list-disc">
              {warnings.map((warning, i) => (
                <li key={i}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
      </section>
      {items.length > 0 && (
        <section className="space-y-4">
          <div
            className={`${panel} flex flex-wrap items-center justify-between gap-3`}
          >
            <h2 className="font-bold">
              ৩. সংশোধন ও নির্বাচন · {items.length}টি প্রশ্ন
            </h2>
            <label className="flex gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.length === items.length}
                disabled={busy}
                onChange={(e) => {
                  setSelected(
                    e.target.checked ? items.map((i) => i.entryId) : [],
                  );
                  invalidate();
                }}
              />
              সব নির্বাচন
            </label>
          </div>
          {items.map(({ entryId, draft }, index) => {
            const issue = report.find((r) => r.entryId === entryId),
              parts = (draft.options.subQuestions ?? {}) as Record<
                string,
                string
              >;
            return (
              <details key={entryId} className={panel} open={index === 0}>
                <summary className="flex cursor-pointer flex-wrap items-center gap-3">
                  <input
                    aria-label={`${index + 1} নং প্রশ্ন নির্বাচন`}
                    type="checkbox"
                    checked={selected.includes(entryId)}
                    disabled={busy}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      setSelected((old) =>
                        e.target.checked
                          ? [...old, entryId]
                          : old.filter((id) => id !== entryId),
                      );
                      invalidate();
                    }}
                  />
                  <b>
                    {index + 1}. {draft.type}
                  </b>
                  <span className="min-w-0 flex-1 text-sm">
                    {draft.text.slice(0, 100)}
                  </span>
                  {issue?.exact && (
                    <span className="text-xs text-rose-700">
                      {issue.trashed
                        ? "Trash-এ আছে · বাদ যাবে"
                        : "DB duplicate · বাদ যাবে"}
                    </span>
                  )}
                  {issue?.inBatch && (
                    <span className="text-xs text-rose-700">
                      ব্যাচে পুনরাবৃত্তি · বাদ যাবে
                    </span>
                  )}
                  {!!issue?.near.length && (
                    <span className="text-xs text-amber-800">
                      সম্ভাব্য মিল: {issue.near.length}
                    </span>
                  )}
                </summary>
                <div className="grid items-start gap-5 border-t pt-4 lg:grid-cols-2">
                  <fieldset disabled={busy} className="min-w-0 space-y-3">
                    <label className="grid gap-1 text-sm">
                      প্রশ্ন / উদ্দীপক
                      <textarea
                        aria-label={`${index + 1} নং প্রশ্নের টেক্সট`}
                        className={input}
                        rows={5}
                        value={draft.text}
                        onChange={(e) =>
                          patch(entryId, {
                            text: e.target.value,
                            ...(draft.type === "CQ"
                              ? {
                                  options: {
                                    ...draft.options,
                                    stimulus: e.target.value,
                                  },
                                }
                              : {}),
                          })
                        }
                      />
                    </label>
                    {draft.type === "MCQ" && (
                      <>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {["A", "B", "C", "D"].map((k) => (
                            <label key={k} className="grid gap-1 text-sm">
                              অপশন {k}
                              <textarea
                                className={input}
                                rows={2}
                                value={String(draft.options[k] ?? "")}
                                onChange={(e) =>
                                  patch(entryId, {
                                    options: {
                                      ...draft.options,
                                      [k]: e.target.value,
                                    },
                                  })
                                }
                              />
                            </label>
                          ))}
                        </div>
                        <label className="grid gap-1 text-sm">
                          সঠিক উত্তর
                          <select
                            className={input}
                            value={draft.correct}
                            onChange={(e) =>
                              patch(entryId, { correct: e.target.value })
                            }
                          >
                            {["A", "B", "C", "D"].map((k) => (
                              <option key={k}>{k}</option>
                            ))}
                          </select>
                        </label>
                      </>
                    )}
                    {draft.type === "CQ" &&
                      Object.entries(parts).map(([k, v]) => (
                        <label key={k} className="grid gap-1 text-sm">
                          অংশ {k}
                          <textarea
                            rows={2}
                            className={input}
                            value={v}
                            onChange={(e) =>
                              patch(entryId, {
                                options: {
                                  ...draft.options,
                                  subQuestions: {
                                    ...parts,
                                    [k]: e.target.value,
                                  },
                                },
                              })
                            }
                          />
                        </label>
                      ))}
                    <label className="grid gap-1 text-sm">
                      উত্তর / সমাধান
                      <textarea
                        rows={5}
                        className={input}
                        value={draft.explanation}
                        onChange={(e) =>
                          patch(entryId, { explanation: e.target.value })
                        }
                      />
                    </label>
                    <label className="grid gap-1 text-sm">
                      কঠিনতা
                      <select
                        className={input}
                        value={draft.difficulty}
                        onChange={(e) =>
                          patch(entryId, {
                            difficulty: e.target
                              .value as BankDraft["difficulty"],
                          })
                        }
                      >
                        <option value="EASY">সহজ</option>
                        <option value="MEDIUM">মধ্যম</option>
                        <option value="HARD">কঠিন</option>
                      </select>
                    </label>
                    <QuestionBankEditorialTools
                      fields={[
                        {
                          id: "text",
                          label: "প্রশ্ন / উদ্দীপক",
                          text: draft.text,
                        },
                        {
                          id: "explanation",
                          label: "উত্তর / সমাধান",
                          text: draft.explanation,
                        },
                      ]}
                      apply={(field, text) =>
                        patch(
                          entryId,
                          field === "text"
                            ? {
                                text,
                                ...(draft.type === "CQ"
                                  ? {
                                      options: {
                                        ...draft.options,
                                        stimulus: text,
                                      },
                                    }
                                  : {}),
                              }
                            : { explanation: text },
                        )
                      }
                    />
                    {issue?.near.map((match) => (
                      <p
                        key={match.id}
                        className="break-words rounded-xl bg-amber-50 p-3 text-xs leading-6 text-amber-900"
                      >
                        সম্ভাব্য মিল {Math.round(match.score * 100)}% ·{" "}
                        {match.text}
                        <br />
                        DB ID: {match.id}
                      </p>
                    ))}
                  </fieldset>
                  <aside className="min-w-0 rounded-xl bg-slate-50 p-4">
                    <h3 className="mb-4 text-xs font-bold text-blue-700">
                      প্রিভিউ · এখনো প্রকাশ হয়নি
                    </h3>
                    <Preview q={draft} />
                  </aside>
                </div>
              </details>
            );
          })}
          <div className={`${panel} space-y-3`}>
            <button
              type="button"
              className={button}
              disabled={busy || !chosen.length || saved}
              onClick={() => void checkOrSave("check")}
            >
              {busy
                ? "কাজ হচ্ছে…"
                : `${chosen.length}টি নির্বাচিত প্রশ্ন যাচাই করুন`}
            </button>
            <label className="flex items-start gap-2 text-sm leading-6">
              <input
                type="checkbox"
                className="mt-1"
                checked={reviewed}
                disabled={
                  busy ||
                  signature !== currentSignature ||
                  !report.length ||
                  saved
                }
                onChange={(e) => setReviewed(e.target.checked)}
              />
              প্রিভিউ, উৎসের অধিকার, উত্তর ও duplicate/near-match রিপোর্ট
              দেখেছি। নির্বাচিত প্রশ্ন শুধু Pending হিসেবে সেভ হবে।
            </label>
            <button
              type="button"
              className={`${button} !bg-blue-700 !text-white`}
              disabled={
                busy ||
                !reviewed ||
                signature !== currentSignature ||
                !chosen.length ||
                saved
              }
              onClick={() => void checkOrSave("save")}
            >
              নির্বাচিত প্রশ্ন Pending হিসেবে সেভ করুন
            </button>
            <p className="text-xs leading-6 text-slate-500">
              একটির পর একটি সেভ হয়; কোনো conflict হলে থামে ও সংখ্যা জানায়। একই
              entry আবার সেভ করলে overwrite হবে না। ইতিমধ্যে সেভ করা প্রশ্নে
              পরবর্তী পরিবর্তন Studio-এর Editor দিয়ে করুন।
            </p>
          </div>
        </section>
      )}
      {message && (
        <div
          role="status"
          className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-7 text-blue-900"
        >
          {message}
        </div>
      )}
    </div>
  );
}
