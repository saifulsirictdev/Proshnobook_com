"use client";
import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import QuestionBankEditorialTools from "@/components/question-bank-editorial-tools";
import {
  Plus,
  Search,
  ImagePlus,
  CheckCheck,
  ArchiveRestore,
  Trash2,
  PencilLine,
  X,
  BookOpen,
  Clock3,
  ShieldCheck,
  RefreshCw,
  FileUp,
  ChevronRight,
  History,
  Save,
} from "lucide-react";
import MathText from "@/components/MathText";
import { NCTB_CLASSES } from "@/lib/nctb-data";
import {
  ACADEMIC_SUBJECT_GROUPS,
  hscGroupSubjects,
  sscGroupSubjects,
} from "@/lib/academic-subject-groups";
import {
  bankKind,
  bankDraftSchema,
  isQuestionImagePath,
  type BankDraft,
  type BankRow,
  type BankFilters,
} from "@/lib/admin-question-bank-schema";

type Scope = { category: string; subject: string; topic: string };
type Data = {
  total: number;
  rows: BankRow[];
  counts: { pending: number; approved: number; trash: number };
  pageSize: number;
};
const input =
  "w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100";
const button =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50";
const primary = `${button} !border-blue-700 !bg-blue-700 !text-white hover:!bg-blue-800`;
const panel =
  "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5";
const unique = (items: string[]) => [...new Set(items.filter(Boolean))];
function catalog(category: string) {
  if (/^(SSC|9|10|Class 9|Class 10|Class 9-10)$/.test(category))
    return NCTB_CLASSES.find((c) => c.class === "Class 9");
  if (/^(HSC|11|12|Class 11|Class 12|Class 11-12)$/.test(category))
    return NCTB_CLASSES.find((c) => c.class === "Class 11-12");
  return NCTB_CLASSES.find(
    (c) => c.class === category || c.class === `Class ${category}`,
  );
}
export function ScopeFields({
  value,
  onChange,
  scopes,
  edit = false,
}: {
  value: Scope;
  onChange: (v: Scope) => void;
  scopes: Scope[];
  edit?: boolean;
}) {
  const id = useId();
  const [stream, setStream] = useState("");
  const [chapterGroup, setChapterGroup] = useState("");
  const c = catalog(value.category);
  const s = c?.subjects.find((s) => s.name === value.subject);
  const subjects = unique([
    ...(c?.subjects.map((s) => s.name) ?? []),
    ...scopes
      .filter((s) => s.category === value.category)
      .map((s) => s.subject),
  ]);
  const grouped = /9|10|SSC|11|12|HSC/.test(value.category);
  const visibleSubjects = stream
    ? /11|12|HSC/.test(value.category)
      ? hscGroupSubjects(subjects, stream)
      : sscGroupSubjects(subjects, stream)
    : subjects;
  const topics = unique([
    ...(s?.chapters ?? []),
    ...(s?.subCategories
      ?.filter((g) => !chapterGroup || g.category === chapterGroup)
      .flatMap((g) => g.topics) ?? []),
    ...scopes
      .filter(
        (s) => s.category === value.category && s.subject === value.subject,
      )
      .map((s) => s.topic),
  ]);
  return (
    <>
      <label className="grid gap-1.5 text-sm font-medium">
        শ্রেণি / ক্যাটাগরি
        <input
          aria-label="শ্রেণি / ক্যাটাগরি"
          list={`${id}-classes`}
          value={value.category}
          required={edit}
          placeholder={edit ? "শ্রেণি বাছুন বা লিখুন" : "সব শ্রেণি"}
          className={input}
          onChange={(e) => {
            setStream("");
            setChapterGroup("");
            onChange({ category: e.target.value, subject: "", topic: "" });
          }}
        />
        <datalist id={`${id}-classes`}>
          {unique([
            ...NCTB_CLASSES.map((c) => c.class),
            "SSC",
            "HSC",
            "Admission",
            "Job",
            ...scopes.map((s) => s.category),
          ]).map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </label>
      {grouped && (
        <label className="grid gap-1.5 text-sm font-medium">
          বিভাগ
          <select
            aria-label="বিভাগ"
            className={input}
            value={stream}
            onChange={(e) => {
              setStream(e.target.value);
              setChapterGroup("");
              onChange({ ...value, subject: "", topic: "" });
            }}
          >
            <option value="">সব বিভাগ / DB-এর নিজস্ব বিষয়</option>
            {ACADEMIC_SUBJECT_GROUPS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
          <span className="text-xs font-normal text-slate-500">
            বিভাগ বিষয় খুঁজতে সাহায্য করে; সব বিষয় দেখতে বিভাগ খালি রাখুন।
          </span>
        </label>
      )}
      <label className="grid gap-1.5 text-sm font-medium">
        বিষয়
        <input
          aria-label="বিষয়"
          required={edit}
          className={input}
          list={`${id}-subjects`}
          value={value.subject}
          placeholder={edit ? "বিষয় বাছুন বা লিখুন" : "সব বিষয়"}
          onChange={(e) => {
            setChapterGroup("");
            onChange({ ...value, subject: e.target.value, topic: "" });
          }}
        />
        <datalist id={`${id}-subjects`}>
          {visibleSubjects.map((v) => (
            <option key={v} value={v} />
          ))}
        </datalist>
      </label>
      {!!s?.subCategories?.length && (
        <label className="grid gap-1.5 text-sm font-medium">
          ইউনিট / অংশ
          <select
            className={input}
            value={chapterGroup}
            onChange={(e) => {
              setChapterGroup(e.target.value);
              onChange({ ...value, topic: "" });
            }}
          >
            <option value="">সব অংশ</option>
            {s.subCategories.map((g) => (
              <option key={g.category} value={g.category}>
                {g.category}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="grid gap-1.5 text-sm font-medium">
        অধ্যায় / টপিক
        <input
          aria-label="অধ্যায় / টপিক"
          required={edit}
          className={input}
          list={`${id}-topics`}
          value={value.topic}
          placeholder={edit ? "অধ্যায় বাছুন বা লিখুন" : "সব অধ্যায়"}
          onChange={(e) => onChange({ ...value, topic: e.target.value })}
        />
        <datalist id={`${id}-topics`}>
          {topics.map((v) => (
            <option key={v} value={v} />
          ))}
        </datalist>
      </label>
    </>
  );
}
async function request(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    ...options,
    credentials: "same-origin",
    cache: "no-store",
  });
  const result = await response
    .json()
    .catch(() => ({ error: "সার্ভারের উত্তর পড়া যায়নি।" }));
  if (!response.ok) throw Error(result.error || "অনুরোধ সম্পন্ন হয়নি।");
  return result;
}
export function Preview({
  q,
}: {
  q: Pick<BankDraft, "text" | "options" | "correct" | "explanation">;
}) {
  const kind = bankKind(q);
  const parts =
    q.options.subQuestions && typeof q.options.subQuestions === "object"
      ? (q.options.subQuestions as Record<string, unknown>)
      : {};
  return (
    <div className="space-y-4 break-words text-slate-900">
      <div className="whitespace-pre-wrap text-base leading-8">
        <MathText text={q.text} />
      </div>
      {kind === "MCQ" && (
        <div className="grid gap-2 sm:grid-cols-2">
          {["A", "B", "C", "D"].map((k, i) => (
            <div
              key={k}
              className={`flex gap-2 rounded-xl border p-3 ${q.correct === k ? "border-emerald-300 bg-emerald-50" : "border-slate-200"}`}
            >
              <b className="text-slate-500">{["ক", "খ", "গ", "ঘ"][i]}.</b>
              <MathText text={String(q.options[k] ?? "")} />
              {q.correct === k && (
                <span className="ml-auto text-emerald-700">✓</span>
              )}
            </div>
          ))}
        </div>
      )}
      {kind === "CQ" && (
        <div className="space-y-2">
          {["k", "kh", "g", "gh"]
            .filter((k) => parts[k])
            .map((k, i) => (
              <div key={k} className="flex items-start gap-2">
                <b>{["ক", "খ", "গ", "ঘ"][i]}.</b>
                <div className="flex-1 whitespace-pre-wrap">
                  <MathText text={String(parts[k])} />
                </div>
                <span className="text-sm text-slate-500">
                  {String(
                    (q.options.marks as Record<string, number> | undefined)?.[
                      k
                    ] ?? "",
                  )}
                </span>
              </div>
            ))}
        </div>
      )}
      <div className="border-t border-dashed pt-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-700">
          উত্তর ও ব্যাখ্যা
        </p>
        <div className="whitespace-pre-wrap text-sm leading-7">
          <MathText text={q.explanation || "উত্তর এখনো লেখা হয়নি।"} />
        </div>
      </div>
    </div>
  );
}
function draftFrom(row: BankRow | null, scope: Scope): BankDraft {
  return row
    ? {
        category: row.category,
        subject: row.subject,
        topic: row.topic,
        type: row.kind,
        text: row.text,
        options:
          row.options &&
          typeof row.options === "object" &&
          !Array.isArray(row.options)
            ? (row.options as BankDraft["options"])
            : {},
        correct: row.correct,
        explanation: row.explanation,
        lang: /^(en|english)$/i.test(row.lang) ? "English" : "Bangla",
        difficulty: row.difficulty as BankDraft["difficulty"],
      }
    : {
        category: scope.category,
        subject: scope.subject,
        topic: scope.topic,
        type: "MCQ",
        text: "",
        options: { A: "", B: "", C: "", D: "" },
        correct: "A",
        explanation: "",
        lang: "Bangla",
        difficulty: "MEDIUM",
      };
}
function Editor({
  row,
  scope,
  scopes,
  close,
  saved,
}: {
  row: BankRow | null;
  scope: Scope;
  scopes: Scope[];
  close: () => void;
  saved: () => void;
}) {
  const [draft, setDraft] = useState(() => draftFrom(row, scope));
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [alt, setAlt] = useState("");
  const [image, setImage] = useState("");
  const [replacement, setReplacement] = useState<{
    field: string;
    snippet: string;
  } | null>(null);
  const [target, setTarget] = useState("text");
  const [consent, setConsent] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(draftFrom(row, scope));
  useEffect(() => {
    if (!dirty) return;
    const leave = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", leave);
    return () => window.removeEventListener("beforeunload", leave);
  }, [dirty]);
  const patch = (v: Partial<BankDraft>) => {
    setConsent(false);
    setMessage("");
    setDraft((d) => ({ ...d, ...v }));
  };
  const partKeys = /গণিত|mathematics/i.test(draft.subject)
    ? ["k", "kh", "g"]
    : ["k", "kh", "g", "gh"];
  const marks = Object.fromEntries(
    partKeys.map((k, i) => [k, partKeys.length === 3 ? [2, 4, 4][i] : i + 1]),
  );
  const parts = (draft.options.subQuestions ?? {}) as Record<string, string>;
  const updateText = (field: string, text: string) => {
    if (field === "text")
      patch({
        text,
        ...(draft.type === "CQ"
          ? { options: { ...draft.options, stimulus: text } }
          : {}),
      });
    else if (field === "explanation") patch({ explanation: text });
    else if (["A", "B", "C", "D"].includes(field))
      patch({ options: { ...draft.options, [field]: text } });
    else
      patch({
        options: {
          ...draft.options,
          subQuestions: { ...parts, [field]: text },
          marks,
        },
      });
  };
  const getText = (field: string) =>
    field === "text"
      ? draft.text
      : field === "explanation"
        ? draft.explanation
        : ["A", "B", "C", "D"].includes(field)
          ? String(draft.options[field] ?? "")
          : String(parts[field] ?? "");
  const attached = [
    "text",
    "explanation",
    ...(draft.type === "MCQ"
      ? ["A", "B", "C", "D"]
      : draft.type === "CQ"
        ? partKeys
        : []),
  ].flatMap((field) =>
    [
      ...getText(field).matchAll(
        /^!\[([^\]\n]{1,300})\]\((\/api\/question-bank\/images\/[a-f0-9-]+\.webp)\)$/gm,
      ),
    ]
      .filter((m) => isQuestionImagePath(m[2]))
      .map((m) => ({ field, snippet: m[0], alt: m[1], url: m[2] })),
  );
  async function upload(file: File | undefined) {
    if (!file) return;
    if (!alt.trim()) {
      setMessage("ছবির বর্ণনা লিখে ফাইল বাছুন।");
      return;
    }
    setUploading(true);
    setMessage("");
    try {
      const fd = new FormData();
      fd.set("image", file);
      const result = await request("/api/admin/question-bank/image", {
        method: "POST",
        body: fd,
      });
      setImage(result.url);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setUploading(false);
    }
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) return;
    const parsed = bankDraftSchema.safeParse(draft);
    if (!parsed.success) {
      setMessage(parsed.error.issues.map((i) => i.message).join(" · "));
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      await request("/api/admin/question-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          row
            ? { operation: "edit", id: row.id, revision: row.revision, draft }
            : { operation: "create", draft },
        ),
      });
      saved();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="space-y-4" aria-label="প্রশ্ন Editor">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">
            Question editor
          </p>
          <h2 className="mt-1 text-2xl font-bold">
            {row ? "প্রশ্ন সম্পাদনা" : "নতুন প্রশ্ন লিখুন"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            সেভ করলে Pending থাকবে। Approved প্রশ্ন সম্পাদনা করলেও আবার review
            প্রয়োজন।
          </p>
        </div>
        <button
          type="button"
          aria-label="Editor বন্ধ করুন"
          className={button}
          disabled={busy || uploading}
          onClick={() => {
            if (!dirty || confirm("সেভ না করা পরিবর্তন বাতিল করবেন?")) close();
          }}
        >
          <X size={18} />
          বন্ধ
        </button>
      </div>
      <form
        onSubmit={submit}
        className="grid items-start gap-5 xl:grid-cols-[1.12fr_1fr]"
      >
        <fieldset disabled={busy} className="min-w-0 space-y-5">
          <div className={panel}>
            <h3 className="mb-4 font-bold">১. শ্রেণিবিন্যাস</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <ScopeFields
                edit
                value={draft}
                scopes={scopes}
                onChange={(scope) => patch(scope)}
              />
              <label className="grid gap-1.5 text-sm font-medium">
                ভাষা
                <select
                  className={input}
                  value={draft.lang}
                  onChange={(e) =>
                    patch({ lang: e.target.value as BankDraft["lang"] })
                  }
                >
                  <option>Bangla</option>
                  <option>English</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                কঠিনতার স্তর
                <select
                  className={input}
                  value={draft.difficulty}
                  onChange={(e) =>
                    patch({
                      difficulty: e.target.value as BankDraft["difficulty"],
                    })
                  }
                >
                  <option value="EASY">সহজ</option>
                  <option value="MEDIUM">মধ্যম</option>
                  <option value="HARD">কঠিন</option>
                </select>
              </label>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Catalog-এর বাইরের বিষয়/অধ্যায় লিখতে পারবেন। পুরোনো DB শ্রেণির নাম
              বদলানো হচ্ছে না।
            </p>
          </div>
          <div className={`${panel} space-y-4`}>
            <h3 className="font-bold">২. প্রশ্ন ও উত্তর</h3>
            <div className="flex gap-2">
              {(["MCQ", "CQ", "SQ"] as const).map((type) => (
                <button
                  type="button"
                  key={type}
                  aria-pressed={draft.type === type}
                  className={draft.type === type ? primary : button}
                  onClick={() => {
                    if (type === draft.type) return;
                    if (
                      !confirm(
                        "ধরন বদলালে বর্তমান অপশন/অংশের কাঠামো মুছে যাবে। এগোবেন?",
                      )
                    )
                      return;
                    patch({
                      type,
                      correct: type === "MCQ" ? "A" : "",
                      options:
                        type === "MCQ"
                          ? { A: "", B: "", C: "", D: "" }
                          : type === "CQ"
                            ? {
                                stimulus: draft.text,
                                subQuestions: Object.fromEntries(
                                  partKeys.map((k) => [k, ""]),
                                ),
                                marks,
                              }
                            : {},
                    });
                    setTarget("text");
                    setReplacement(null);
                    setImage("");
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
            <label className="grid gap-2 text-sm font-medium">
              {draft.type === "CQ" ? "উদ্দীপক" : "প্রশ্ন"}
              <textarea
                aria-label={draft.type === "CQ" ? "উদ্দীপক" : "প্রশ্ন"}
                required
                rows={5}
                maxLength={12000}
                className={input}
                value={draft.text}
                onChange={(e) => updateText("text", e.target.value)}
              />
            </label>
            {draft.type === "MCQ" && (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  {["A", "B", "C", "D"].map((k) => (
                    <label className="grid gap-1.5 text-sm font-medium" key={k}>
                      অপশন {k}
                      <textarea
                        aria-label={`অপশন ${k}`}
                        rows={2}
                        required
                        className={input}
                        maxLength={6000}
                        value={String(draft.options[k] ?? "")}
                        onChange={(e) => updateText(k, e.target.value)}
                      />
                    </label>
                  ))}
                </div>
                <label className="grid gap-1.5 text-sm font-medium">
                  সঠিক উত্তর
                  <select
                    className={input}
                    value={draft.correct}
                    onChange={(e) => patch({ correct: e.target.value })}
                  >
                    {["A", "B", "C", "D"].map((k) => (
                      <option key={k}>{k}</option>
                    ))}
                  </select>
                </label>
              </>
            )}
            {draft.type === "CQ" && (
              <div className="space-y-3">
                {partKeys.map((k, i) => (
                  <label key={k} className="grid gap-1.5 text-sm font-medium">
                    {["ক", "খ", "গ", "ঘ"][i]} অংশ · {marks[k]} নম্বর
                    <textarea
                      aria-label={`${["ক", "খ", "গ", "ঘ"][i]} অংশ`}
                      required
                      rows={2}
                      className={input}
                      maxLength={6000}
                      value={parts[k] ?? ""}
                      onChange={(e) => updateText(k, e.target.value)}
                    />
                  </label>
                ))}
                <button
                  type="button"
                  className={button}
                  onClick={() =>
                    patch({
                      options: {
                        ...draft.options,
                        stimulus: draft.text,
                        subQuestions: Object.fromEntries(
                          partKeys.map((k) => [k, parts[k] ?? ""]),
                        ),
                        marks,
                      },
                    })
                  }
                >
                  অংশ ও নম্বর মিলিয়ে নিন
                </button>
              </div>
            )}
            <label className="grid gap-1.5 text-sm font-medium">
              উত্তর / সমাধান ও ব্যাখ্যা
              <textarea
                aria-label="উত্তর / সমাধান ও ব্যাখ্যা"
                rows={6}
                maxLength={20000}
                className={input}
                value={draft.explanation}
                onChange={(e) => updateText("explanation", e.target.value)}
                placeholder={
                  draft.type === "CQ"
                    ? "ক, খ, গ, ঘ অংশের সমাধান আলাদা করে লিখুন"
                    : "সঠিক উত্তর ও ব্যাখ্যা লিখুন"
                }
              />
            </label>
            <p className="text-xs text-slate-500">
              গণিতের জন্য $...$ ব্যবহার করুন। ছবি আলাদা লাইনে রাখুন। HTML চালানো
              হবে না।
            </p>
          </div>
          <div className={`${panel} space-y-3`}>
            <h3 className="flex items-center gap-2 font-bold">
              <ImagePlus size={18} />
              ৩. ছবি / ডায়াগ্রাম যোগ করুন
            </h3>
            {attached.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {attached.map((item, i) => (
                  <div
                    key={`${item.field}-${i}`}
                    className="space-y-2 rounded-xl border border-slate-200 p-3"
                  >
                    <img
                      src={item.url}
                      alt={item.alt}
                      className="h-28 w-full rounded-lg object-contain"
                    />
                    <p className="text-xs text-slate-500">
                      {item.field === "text"
                        ? "প্রশ্ন / উদ্দীপক"
                        : item.field === "explanation"
                          ? "উত্তর / ব্যাখ্যা"
                          : `অপশন / অংশ ${item.field}`}{" "}
                      · {item.alt}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className={button}
                        disabled={uploading}
                        onClick={() => {
                          setReplacement({
                            field: item.field,
                            snippet: item.snippet,
                          });
                          setTarget(item.field);
                          setAlt(item.alt);
                          setImage("");
                        }}
                      >
                        ছবি বদলান
                      </button>
                      <button
                        type="button"
                        className={button}
                        disabled={uploading}
                        onClick={() => {
                          updateText(
                            item.field,
                            getText(item.field)
                              .replace(item.snippet, "")
                              .trim(),
                          );
                          setReplacement(null);
                          setImage("");
                        }}
                      >
                        সরান
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {replacement && (
              <div className="rounded-xl bg-blue-50 p-3 text-sm text-blue-900">
                ছবিটি বদলানোর জন্য নিচে নতুন ফাইল বাছুন। তারপর প্রতিস্থাপন
                নিশ্চিত করুন।
                <button
                  type="button"
                  className="ml-2 underline"
                  onClick={() => {
                    setReplacement(null);
                    setImage("");
                  }}
                >
                  বাতিল
                </button>
              </div>
            )}
            <p className="text-xs leading-6 text-slate-500">
              নিজস্ব বা অনুমতিপ্রাপ্ত ছবি দিন। সর্বোচ্চ ৪ MB JPG/PNG/WebP;
              EXIF/GPS বাদ দিয়ে সর্বোচ্চ ১৮০০px WebP করা হবে। ছবির লিংক
              প্রকাশ্য—ব্যক্তিগত তথ্য দেবেন না।
            </p>
            <label className="grid gap-1.5 text-sm">
              ছবির বর্ণনা
              <input
                className={input}
                maxLength={160}
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="যেমন: কোষের গঠন"
              />
            </label>
            <input
              aria-label="ছবি আপলোড করুন"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploading}
              className="block w-full text-sm"
              onChange={(e) => {
                void upload(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            {uploading && <p role="status">ছবি প্রক্রিয়াকরণ হচ্ছে…</p>}
            {image && (
              <div className="space-y-3">
                <img
                  src={image}
                  alt={alt}
                  className="max-h-48 rounded-xl border object-contain"
                />
                <label className="grid gap-1.5 text-sm">
                  কোথায় বসাবেন
                  <select
                    disabled={!!replacement}
                    className={input}
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                  >
                    <option value="text">প্রশ্ন / উদ্দীপক</option>
                    <option value="explanation">উত্তর / ব্যাখ্যা</option>
                    {(draft.type === "MCQ"
                      ? ["A", "B", "C", "D"]
                      : draft.type === "CQ"
                        ? partKeys
                        : []
                    ).map((k) => (
                      <option key={k} value={k}>
                        অপশন / অংশ {k}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className={button}
                  type="button"
                  onClick={() => {
                    const safeAlt = alt.replace(/[\[\]\n\r]/g, " ").trim();
                    if (!safeAlt) {
                      setMessage("ছবির বর্ণনা দিন।");
                      return;
                    }
                    const snippet = `![${safeAlt}](${image})`;
                    updateText(
                      target,
                      replacement
                        ? getText(target).replace(replacement.snippet, snippet)
                        : `${getText(target)}\n${snippet}\n`.trim(),
                    );
                    setImage("");
                    setAlt("");
                    setReplacement(null);
                  }}
                >
                  {replacement
                    ? "ছবিটি প্রতিস্থাপন করুন"
                    : "নির্বাচিত স্থানে ছবি বসান"}
                </button>
              </div>
            )}
            <p className="text-xs text-slate-500">
              যোগ করা ছবির কার্ড থেকে বদলাতে বা সরাতে পারবেন। পুরোনো
              প্রশ্নপত্রের ছবি নষ্ট করতে ফাইল মুছে ফেলা হয় না।
            </p>
          </div>
          <QuestionBankEditorialTools
            fields={[
              {
                id: "text",
                label: draft.type === "CQ" ? "উদ্দীপক" : "প্রশ্ন",
                text: draft.text,
              },
              {
                id: "explanation",
                label: "উত্তর / ব্যাখ্যা",
                text: draft.explanation,
              },
              ...(draft.type === "MCQ"
                ? ["A", "B", "C", "D"]
                : draft.type === "CQ"
                  ? partKeys
                  : []
              ).map((id) => ({
                id,
                label: `অপশন / অংশ ${id}`,
                text: getText(id),
              })),
            ]}
            apply={(field, text) => updateText(field, text)}
          />
          {message && (
            <div
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
            >
              {message}
            </div>
          )}
          <div className={`${panel} space-y-4`}>
            <label className="flex items-start gap-2 text-sm leading-6">
              <input
                type="checkbox"
                checked={consent}
                required
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1"
              />
              প্রিভিউ ও শ্রেণিবিন্যাস দেখেছি। এটি শুধু Pending হিসেবে সেভ হবে।
            </label>
            <button
              className={`${primary} w-full`}
              disabled={busy || uploading || !consent}
            >
              <Save size={17} />
              {busy ? "সেভ হচ্ছে…" : "Pending হিসেবে সেভ করুন"}
            </button>
          </div>
        </fieldset>
        <aside className={`${panel} min-w-0 xl:sticky xl:top-5`}>
          <div className="mb-5 flex items-center justify-between border-b pb-4">
            <h3 className="font-bold">লাইভ প্রিভিউ</h3>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              {draft.type}
            </span>
          </div>
          <p className="mb-4 text-xs text-slate-500">
            {[draft.category, draft.subject, draft.topic]
              .filter(Boolean)
              .join(" / ") || "শ্রেণি ও বিষয় নির্বাচন করুন"}
          </p>
          <Preview q={draft} />
          {row && (
            <p className="mt-6 break-all border-t pt-3 text-xs text-slate-500">
              DB ID: {row.id}
              <br />
              উৎস: {row.source}
              <br />
              আগের provenance অপরিবর্তিত থাকবে।
            </p>
          )}
        </aside>
      </form>
    </section>
  );
}
export default function QuestionBankWorkspace({
  initial,
  initialFilters,
  scopes,
}: {
  initial: Data;
  initialFilters: BankFilters;
  scopes: Scope[];
}) {
  const [data, setData] = useState(initial);
  const [filters, setFilters] = useState(initialFilters);
  const [applied, setApplied] = useState(initialFilters);
  const [selected, setSelected] = useState<string[]>([]);
  const [editor, setEditor] = useState<BankRow | "new" | null>(null);
  const [preview, setPreview] = useState<BankRow | null>(null);
  const [history, setHistory] = useState<Array<{
    operation: string;
    snapshotKey?: string;
    actorId: string;
    at: string;
    before: BankRow | null;
    after: BankRow;
  }> | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const requestId = useRef(0);
  const previewRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (preview)
      previewRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }, [preview]);
  async function refresh(next = applied) {
    const id = ++requestId.current;
    setLoading(true);
    setMessage("");
    try {
      const qs = new URLSearchParams(
        Object.entries(next).map(([k, v]) => [k, String(v)]),
      );
      const result = await request(`/api/admin/question-bank?${qs}`);
      if (id !== requestId.current) return;
      setData(result);
      setApplied(next);
      setFilters(next);
      setSelected([]);
      window.history.replaceState(null, "", `?${qs}`);
    } catch (e) {
      if (id === requestId.current) setMessage((e as Error).message);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }
  async function mutate(
    operation: "approve" | "pending" | "trash" | "restore",
    rows: BankRow[],
  ) {
    if (!rows.length || busy) return;
    const verb = {
      approve: "অনুমোদন",
      pending: "Pending",
      trash: "Trash",
      restore: "Restore",
    }[operation];
    if (
      !confirm(
        `${rows.length}টি প্রশ্ন ${verb} করবেন? ${operation === "restore" ? "Restore-এর পরে Pending থাকবে।" : operation === "trash" ? "সেভ করা প্রশ্নপত্রের snapshot বদলাবে না; নতুন নির্বাচনে আর পাওয়া যাবে না।" : "প্রশ্ন ও উত্তর যাচাই করেই সিদ্ধান্ত দিন।"}`,
      )
    )
      return;
    setBusy(true);
    let done = 0;
    let failure = "";
    try {
      for (const row of rows) {
        await request("/api/admin/question-bank", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operation,
            id: row.id,
            revision: row.revision,
          }),
        });
        done++;
      }
    } catch (e) {
      failure = (e as Error).message;
    } finally {
      await refresh();
      setBusy(false);
      setPreview(null);
      setHistory(null);
      setMessage(
        `${done}/${rows.length}টি প্রশ্ন ${verb} হয়েছে।${failure ? ` বাকি পরিবর্তন বন্ধ: ${failure}` : ""}`,
      );
    }
  }
  async function showHistory(row: BankRow) {
    setPreview(row);
    setHistory(null);
    setMessage("");
    try {
      const result = await request(
        `/api/admin/question-bank?history=${encodeURIComponent(row.id)}`,
      );
      setHistory(result.history);
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  if (editor)
    return (
      <Editor
        key={editor === "new" ? "new" : editor.revision}
        row={editor === "new" ? null : editor}
        scope={applied}
        scopes={scopes}
        close={() => setEditor(null)}
        saved={() => {
          setEditor(null);
          setPreview(null);
          void refresh().then(() =>
            setMessage(
              "প্রশ্ন Pending হিসেবে সেভ হয়েছে। প্রকাশ করতে আলাদা review ও অনুমোদন দিন।",
            ),
          );
        }}
      />
    );
  const chosen = data.rows.filter((r) => selected.includes(r.id));
  return (
    <div className="space-y-5 text-slate-900">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
            Content workspace
          </p>
          <h1 className="flex items-center gap-3 text-2xl font-bold md:text-3xl">
            <BookOpen className="text-blue-700" />
            প্রশ্নব্যাংক স্টুডিও
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            লিখুন, ছবি যোগ করুন, যাচাই করে প্রকাশ করুন—একটি জায়গা থেকে।
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/questions/bank/import" className={button}>
            <FileUp size={16} />
            Word / JSON import
          </Link>
          <button className={primary} onClick={() => setEditor("new")}>
            <Plus size={18} />
            নতুন প্রশ্ন লিখুন
          </button>
        </div>
      </header>
      <div className="grid gap-3 sm:grid-cols-3">
        {(
          [
            {
              key: "approved",
              label: "প্রকাশিত প্রশ্ন",
              icon: ShieldCheck,
              color: "text-emerald-700 bg-emerald-50",
            },
            {
              key: "pending",
              label: "যাচাইয়ের অপেক্ষায়",
              icon: Clock3,
              color: "text-amber-700 bg-amber-50",
            },
            {
              key: "trash",
              label: "Trash-এ সংরক্ষিত",
              icon: Trash2,
              color: "text-slate-600 bg-slate-100",
            },
          ] as const
        ).map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            className={`${panel} flex items-center gap-4 text-left hover:border-blue-300`}
            disabled={busy || loading}
            onClick={() => void refresh({ ...applied, status: key, page: 1 })}
          >
            <span className={`rounded-xl p-3 ${color}`}>
              <Icon size={22} />
            </span>
            <span>
              <span className="block text-2xl font-bold tabular-nums">
                {data.counts[key].toLocaleString("bn-BD")}
              </span>
              <span className="text-xs text-slate-500">
                {label} · নির্বাচিত scope
              </span>
            </span>
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-6 text-blue-900">
        <b>Database workspace:</b> নিচের সংখ্যা ও পরিবর্তন শুধু DB প্রশ্নের।
        Repository-এর প্রস্তুত ফাইল আলাদা; import না হওয়া প্রশ্ন এখানে নেই। Edit
        করলে Pending হবে। Trash-এ ID রেখে দেওয়া হয় যাতে একই deterministic batch
        আবার চালালে প্রশ্ন ফিরে না আসে। Word/JSON review-import, স্থানীয়
        Bijoy→Unicode এবং সম্মতিভিত্তিক সংশোধন সহায়তা পাওয়া যাবে।
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void refresh({ ...filters, page: 1 });
        }}
        className={`${panel} space-y-4`}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-bold">আপনার প্রশ্ন খুঁজুন</h2>
          <button
            type="button"
            className="text-xs text-blue-700 underline"
            disabled={loading || busy}
            onClick={() =>
              void refresh({
                category: "",
                subject: "",
                topic: "",
                q: "",
                kind: "ALL",
                status: "all",
                difficulty: "ALL",
                page: 1,
              })
            }
          >
            ফিল্টার মুছুন
          </button>
        </div>
        <div className="grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ScopeFields
            value={filters}
            scopes={scopes}
            onChange={(scope) => setFilters((f) => ({ ...f, ...scope }))}
          />
          <label className="grid gap-1.5 text-sm font-medium">
            ধরন
            <select
              className={input}
              value={filters.kind}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  kind: e.target.value as BankFilters["kind"],
                }))
              }
            >
              <option value="ALL">সব ধরন</option>
              <option>MCQ</option>
              <option>CQ</option>
              <option>SQ</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            অবস্থা
            <select
              className={input}
              value={filters.status}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  status: e.target.value as BankFilters["status"],
                }))
              }
            >
              <option value="all">সব সক্রিয় প্রশ্ন</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="trash">Trash</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            কঠিনতার স্তর
            <select
              className={input}
              value={filters.difficulty}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  difficulty: e.target.value as BankFilters["difficulty"],
                }))
              }
            >
              <option value="ALL">সব স্তর</option>
              <option value="EASY">সহজ</option>
              <option value="MEDIUM">মধ্যম</option>
              <option value="HARD">কঠিন</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">
            প্রশ্ন বা DB ID
            <input
              className={input}
              value={filters.q}
              maxLength={200}
              onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
              placeholder="প্রশ্নের অংশ লিখে খুঁজুন…"
            />
          </label>
        </div>
        <div className="flex gap-2">
          <button className={primary} disabled={loading || busy}>
            <Search size={16} />
            {loading ? "খোঁজা হচ্ছে…" : "প্রশ্ন দেখুন"}
          </button>
          <button
            type="button"
            aria-label="তালিকা রিফ্রেশ"
            className={button}
            disabled={loading || busy}
            onClick={() => void refresh()}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </form>
      {message && (
        <div
          role="status"
          className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-7 text-blue-900"
        >
          {message}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
        <span>নির্বাচিত ফিল্টারের এই পৃষ্ঠা export:</span>
        {["json", "csv"].map((format) => (
          <a
            className={button}
            key={format}
            href={`/api/admin/question-bank/export?${new URLSearchParams(Object.entries({ ...applied, format }).map(([key, value]) => [key, String(value)]))}`}
            download
          >
            {format.toUpperCase()} · {data.rows.length}টি
          </a>
        ))}
        <Link className={button} href="/admin/questions/import">
          Repository-এর প্রস্তুত ব্যাচ
        </Link>
      </div>
      <section
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        aria-busy={loading || busy}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-slate-50 px-4 py-4">
          <div className="flex items-center gap-3">
            <input
              aria-label="এই পৃষ্ঠার সব প্রশ্ন নির্বাচন"
              type="checkbox"
              disabled={busy || loading || !data.rows.length}
              checked={
                data.rows.length > 0 && chosen.length === data.rows.length
              }
              onChange={(e) =>
                setSelected(e.target.checked ? data.rows.map((r) => r.id) : [])
              }
            />
            <h2 className="font-bold">
              {data.total.toLocaleString("bn-BD")}টি প্রশ্ন
            </h2>
            <span className="text-xs text-slate-500">
              পৃষ্ঠা {applied.page}
            </span>
          </div>
          {chosen.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span>{chosen.length}টি নির্বাচিত</span>
              {applied.status === "trash" ? (
                <button
                  className={button}
                  disabled={busy || loading}
                  onClick={() => void mutate("restore", chosen)}
                >
                  <ArchiveRestore size={15} />
                  Restore
                </button>
              ) : (
                <>
                  <button
                    className={button}
                    disabled={busy || loading}
                    onClick={() => void mutate("approve", chosen)}
                  >
                    <CheckCheck size={15} />
                    অনুমোদন
                  </button>
                  <button
                    className={button}
                    disabled={busy || loading}
                    onClick={() => void mutate("trash", chosen)}
                  >
                    <Trash2 size={15} />
                    Trash
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        {!data.rows.length ? (
          <div className="grid justify-items-center gap-3 px-4 py-16 text-center">
            <BookOpen size={38} className="text-slate-300" />
            <h3 className="font-bold">এই নির্বাচনে কোনো প্রশ্ন নেই</h3>
            <p className="text-sm text-slate-500">
              ফিল্টার বদলান, JSON import করুন অথবা নতুন প্রশ্ন লিখুন।
            </p>
            <button className={button} onClick={() => setEditor("new")}>
              <Plus size={16} />
              প্রথম প্রশ্ন লিখুন
            </button>
          </div>
        ) : (
          <div className={`divide-y ${loading ? "opacity-50" : ""}`}>
            {data.rows.map((row) => (
              <article
                key={row.id}
                className="flex items-start gap-3 px-4 py-5 hover:bg-slate-50"
              >
                <input
                  aria-label={`নির্বাচন: ${row.id}`}
                  type="checkbox"
                  checked={selected.includes(row.id)}
                  disabled={busy || loading}
                  onChange={(e) =>
                    setSelected((s) =>
                      e.target.checked
                        ? [...s, row.id]
                        : s.filter((id) => id !== row.id),
                    )
                  }
                  className="mt-1.5"
                />
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-md bg-blue-50 px-2 py-1 font-bold text-blue-700">
                      {row.kind}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 ${row.source.startsWith("ADMIN_TRASH:") ? "bg-slate-200 text-slate-700" : row.approved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}
                    >
                      {row.source.startsWith("ADMIN_TRASH:")
                        ? "Trash"
                        : row.approved
                          ? "Approved"
                          : "Pending"}
                    </span>
                    <span className="text-slate-400">{row.difficulty}</span>
                  </div>
                  <button
                    className="block w-full text-left text-sm font-semibold leading-7 hover:text-blue-700"
                    onClick={() => {
                      setPreview(row);
                      setHistory(null);
                    }}
                  >
                    {row.text.slice(0, 240)}
                    {row.text.length > 240 ? "…" : ""}
                  </button>
                  <p className="mt-2 text-xs leading-6 text-slate-500">
                    {row.category} <ChevronRight size={12} className="inline" />{" "}
                    {row.subject} <ChevronRight size={12} className="inline" />{" "}
                    {row.topic}
                  </p>
                  <details className="mt-2 text-xs text-slate-400">
                    <summary className="cursor-pointer">উৎস ও পরিচয়</summary>
                    <p className="mt-1 break-all">
                      {row.source}
                      <br />
                      {row.id}
                    </p>
                  </details>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      className={button}
                      disabled={busy || loading}
                      onClick={() => {
                        setPreview(row);
                        setHistory(null);
                      }}
                    >
                      প্রিভিউ
                    </button>
                    {applied.status !== "trash" && (
                      <button
                        className={button}
                        disabled={busy || loading}
                        onClick={() => {
                          setPreview(null);
                          setEditor(row);
                        }}
                      >
                        <PencilLine size={14} />
                        সম্পাদনা
                      </button>
                    )}
                    <button
                      className={button}
                      disabled={busy || loading}
                      onClick={() => void showHistory(row)}
                    >
                      <History size={14} />
                      ইতিহাস
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        <footer className="flex items-center justify-between gap-3 border-t px-4 py-4">
          <button
            className={button}
            disabled={applied.page <= 1 || loading || busy}
            onClick={() => void refresh({ ...applied, page: applied.page - 1 })}
          >
            ← আগের পৃষ্ঠা
          </button>
          <span className="text-xs text-slate-500">
            {applied.page} /{" "}
            {Math.max(1, Math.ceil(data.total / data.pageSize))}
          </span>
          <button
            className={button}
            disabled={
              applied.page * data.pageSize >= data.total || loading || busy
            }
            onClick={() => void refresh({ ...applied, page: applied.page + 1 })}
          >
            পরের পৃষ্ঠা →
          </button>
        </footer>
      </section>
      {preview && (
        <section
          ref={previewRef}
          className={`${panel} space-y-4`}
          aria-label="নির্বাচিত প্রশ্নের প্রিভিউ"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-bold">
              {history
                ? "পরিবর্তনের ইতিহাস · সর্বশেষ ৩০টি"
                : "সম্পূর্ণ প্রশ্ন ও উত্তর"}
            </h2>
            <button
              className={button}
              aria-label="প্রিভিউ বন্ধ"
              onClick={() => {
                setPreview(null);
                setHistory(null);
              }}
            >
              <X size={16} />
            </button>
          </div>
          {history ? (
            <div className="space-y-3">
              {history.length ? (
                history.map((entry, i) => (
                  <details className="rounded-xl border p-3" key={i}>
                    <summary className="cursor-pointer text-sm">
                      {entry.operation} ·{" "}
                      {new Date(entry.at).toLocaleString("bn-BD")} ·{" "}
                      {entry.actorId}
                    </summary>
                    <p className="my-2 text-xs text-slate-500">
                      আগের ও পরের DB snapshot; ফেরালে Pending হবে
                    </p>
                    <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-all rounded bg-slate-50 p-3 text-xs">
                      {JSON.stringify(
                        { before: entry.before, after: entry.after },
                        null,
                        2,
                      )}
                    </pre>
                    {entry.snapshotKey &&
                      !preview.source.startsWith("ADMIN_TRASH:") && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(["before", "after"] as const)
                            .filter((version) => entry[version])
                            .map((version) => (
                              <button
                                className={button}
                                disabled={busy || loading}
                                key={version}
                                onClick={async () => {
                                  if (
                                    !confirm(
                                      "এই সংস্করণের content ফিরিয়ে Pending করবেন? বর্তমান content-ও ইতিহাসে থাকবে।",
                                    )
                                  )
                                    return;
                                  setBusy(true);
                                  try {
                                    await request("/api/admin/question-bank", {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        operation: "rollback",
                                        id: preview.id,
                                        revision: preview.revision,
                                        snapshotKey: entry.snapshotKey,
                                        version,
                                      }),
                                    });
                                    await refresh();
                                    setPreview(null);
                                    setHistory(null);
                                    setMessage(
                                      "সংস্করণের content Pending হিসেবে ফিরেছে; প্রকাশ হয়নি।",
                                    );
                                  } catch (e) {
                                    setMessage((e as Error).message);
                                  } finally {
                                    setBusy(false);
                                  }
                                }}
                              >
                                {version === "before"
                                  ? "আগের content"
                                  : "পরের content"}{" "}
                                Pending হিসেবে ফেরান
                              </button>
                            ))}
                        </div>
                      )}
                  </details>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  এই workspace চালুর আগের পরিবর্তনের ইতিহাস সংরক্ষিত ছিল না।
                </p>
              )}
            </div>
          ) : (
            <>
              <button
                className={button}
                disabled={busy}
                onClick={async () => {
                  try {
                    const result = await request(
                      `/api/admin/question-bank/impact?id=${encodeURIComponent(preview.id)}`,
                    );
                    setMessage(
                      `শনাক্ত reference: Practice test ${result.practiceTests}টি; Model snapshot ${result.modelSnapshots}টি; saved ID setup ${result.savedIdSetups}টি${result.truncated ? " (প্রথম ১০০০ candidate)" : ""}। ${result.note}`,
                    );
                  } catch (e) {
                    setMessage((e as Error).message);
                  }
                }}
              >
                কোথায় ব্যবহৃত হয়েছে দেখুন
              </button>
              <Preview
                q={{
                  ...preview,
                  options:
                    preview.options &&
                    typeof preview.options === "object" &&
                    !Array.isArray(preview.options)
                      ? (preview.options as BankDraft["options"])
                      : {},
                }}
              />
              <div className="flex flex-wrap gap-2 border-t pt-4">
                {preview.source.startsWith("ADMIN_TRASH:") ? (
                  <button
                    className={button}
                    disabled={busy}
                    onClick={() => void mutate("restore", [preview])}
                  >
                    <ArchiveRestore size={15} />
                    Restore → Pending
                  </button>
                ) : (
                  <>
                    <button
                      className={primary}
                      disabled={busy || loading}
                      onClick={() =>
                        void mutate(preview.approved ? "pending" : "approve", [
                          preview,
                        ])
                      }
                    >
                      <CheckCheck size={16} />
                      {preview.approved
                        ? "Pending করুন"
                        : "যাচাই করেছি · অনুমোদন দিন"}
                    </button>
                    <button
                      className={button}
                      disabled={busy || loading}
                      onClick={() => void mutate("trash", [preview])}
                    >
                      <Trash2 size={15} />
                      Trash-এ রাখুন
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </section>
      )}
      <p className="text-xs leading-6 text-slate-500">
        নির্বাচিত bulk পরিবর্তন একটির পর একটি হয়; কোনো প্রশ্ন বদলে গেলে সেখানেই
        থামবে এবং সফল সংখ্যা জানাবে। Saved paper-এর সংরক্ষিত snapshot বদলাবে না;
        DB ID-ভিত্তিক পুরোনো setup-এ পুনরায় প্রশ্ন বাছতে হতে পারে।
      </p>
    </div>
  );
}
