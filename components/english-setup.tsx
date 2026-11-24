"use client";
import PreparationPopup from "./preparation-popup";
import { englishPreparationMessage } from "@/lib/english/preparation-message";
import "./english-theme.css";
import EnglishTopicPicker from "@/components/english-topic-picker";
import { writingTopicSuggestions } from "@/lib/english/writing-topics";
import { useEffect, useState } from "react";
import { fullModelWriting } from "@/lib/english/builder-mode";
import { loadEnglishModelSources } from "@/app/actions/english-model-sources";
import { useRouter } from "next/navigation";
import { prepareEnglishBankModel } from "@/app/actions/english-bank-model";
import { generateEnglishPaper } from "@/app/actions/english-paper";
import {
  englishBlueprint,
  type EnglishGrade,
  type EnglishPaper,
} from "@/lib/english/blueprints";
import { resolveEnglishSelection } from "@/lib/english/selection";
type WritingRequest = {
  topic: string;
  choice?: string;
  words?: number;
  instruction?: string;
};
export default function EnglishSetup({
  initialGrade,
  initialPaper,
  initialMode = "full",
  initialItem = "",
  initialItems,
}: {
  initialGrade: number;
  initialPaper: 1 | 2;
  initialMode?: "full" | "selected";
  initialItem?: string;
  initialItems?: string[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [grade, setGrade] = useState(initialGrade),
    [paper, setPaper] = useState<EnglishPaper>(initialPaper),
    [mode, setMode] = useState<"full" | "selected" | "writing">(initialMode),
    [ids, setIds] = useState<string[]>(englishBlueprint(initialGrade as EnglishGrade, initialPaper).items.filter(i => (initialItems ?? [initialItem]).includes(i.id)).map(i => i.id)),
    [writing, setWriting] = useState<Record<string, WritingRequest>>(initialPaper === 1 && initialMode === "full" ? fullModelWriting(initialGrade as EnglishGrade, initialPaper) : {}),
    [sources, setSources] = useState<
      Record<string, { text: string; reference: string }>
    >({}),
    [answers, setAnswers] = useState(false),
    [message, setMessage] = useState("");
  const blueprint = englishBlueprint(grade as EnglishGrade, paper);
  const selected = blueprint.items.filter(
    (i) =>
      mode === "full" ||
      (ids.includes(i.id) && (mode !== "writing" || i.section === "writing")),
  );
  const sourceKeys = [
    ...new Set(
      selected
        .map((i) => i.sourceGroup)
        .filter((s): s is NonNullable<typeof s> => !!s && s !== "unseen"),
    ),
  ];
  const [loadingSources, setLoadingSources] = useState(false);
  const [sourceNotice, setSourceNotice] = useState("");
  useEffect(() => {
    if (paper === 1 || mode !== "full") { setLoadingSources(false); setSourceNotice(""); return; }
    let cancelled = false;
    setWriting(old => ({ ...fullModelWriting(grade as EnglishGrade, paper), ...old }));
    if (!englishBlueprint(grade as EnglishGrade, paper).items.some(i => i.sourceGroup && i.sourceGroup !== "unseen")) {
      setLoadingSources(false); setSourceNotice(""); return;
    }
    setLoadingSources(true);
    setSourceNotice("অনুমোদিত textbook source খোঁজা হচ্ছে…");
    loadEnglishModelSources(grade, paper).then(result => {
      if (cancelled) return;
      setSources(old => ({ ...result.sources, ...old }));
      setSourceNotice(result.error || "উপলব্ধ অনুমোদিত source নেওয়া হয়েছে। কোনো প্রয়োজনীয় ঘর খালি থাকলে নির্ভরযোগ্য textbook extract দিন।");
    }).catch(() => {
      if (!cancelled) setSourceNotice("Source আনা যায়নি; প্রয়োজনীয় textbook extract দিন।");
    }).finally(() => { if (!cancelled) setLoadingSources(false); });
    return () => { cancelled = true; };
  }, [grade, paper, mode]);
  function reset() {
    setIds([]);
    setWriting({});
    setSources({});
    setMessage("");
  }
  function updateWriting(id: string, patch: Partial<WritingRequest>) {
    setWriting((old) => ({
      ...old,
      [id]: { ...(old[id] || { topic: "" }), ...patch },
    }));
    setMessage("");
  }
  async function validate() {
    if (busy) return;
    setBusy(true);
    try {
      if (paper === 1) {
        const generated = await prepareEnglishBankModel(grade, mode === "full" ? undefined : selected.map(i => i.id), {});
        if (!generated.ok) setMessage(englishPreparationMessage(generated.error));
        else router.push(`/question-builder/build?englishKey=${encodeURIComponent(generated.key)}&stage=setup`);
        return;
      }
      const result = resolveEnglishSelection({
        grade,
        paper,
        mode,
        itemIds: mode === "full" ? [] : selected.map((i) => i.id),
        writing: Object.fromEntries(
          selected
            .filter((i) => i.section === "writing")
            .filter((i) => writing[i.id])
            .map((i) => [i.id, writing[i.id]]),
        ),
        sources: Object.fromEntries(
          sourceKeys.filter((k) => sources[k]).map((k) => [k, sources[k]]),
        ),
        includeAnswers: answers,
      });
      setMessage(
        "আপনার নির্বাচিত অংশ অনুযায়ী প্রশ্নপত্র প্রস্তুত হচ্ছে। কিছুটা সময় লাগতে পারে; এই পেজ বন্ধ করবেন না।",
      );
      const generated = await generateEnglishPaper(result.selection);
      if (!generated.ok) setMessage(englishPreparationMessage(generated.error));
      else
        router.push(
          `/question-builder/build?englishKey=${encodeURIComponent(generated.key)}`,
        );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Check your selection.",
      );
    } finally {
      setBusy(false);
    }
  }
  const field =
    "w-full rounded border border-slate-300 bg-white p-2 text-slate-900";
  return (
    <main className="english-setup mx-auto max-w-4xl space-y-6 px-4 py-8">
      {busy && <PreparationPopup subject="English" stage={1} databaseOnly={paper === 1} neutralBranding />}
      <header className="english-setup-header">
        <a href="/question-builder/english/saved">আমার English draft</a>
        <span className="english-eyebrow">PAPER STUDIO · 2027</span>
        <h1 className="text-2xl font-bold">Build your English paper</h1>
        <p>এটি printable paper তৈরির আলাদা flow; Live Online Model Test নয়।</p>
      </header>
      <div className="english-config grid gap-4 sm:grid-cols-2">
        <label>
          Class
          <select
            className={field}
            value={grade}
            onChange={(e) => {
              setGrade(Number(e.target.value));
              reset();
            }}
          >
            {[6, 7, 8, 9, 10, 11, 12].map((g) => (
              <option key={g} value={g}>
                Class {g}
              </option>
            ))}
          </select>
        </label>
        <label>
          Paper
          <select
            className={field}
            value={paper}
            onChange={(e) => {
              setPaper(Number(e.target.value) as EnglishPaper);
              reset();
            }}
          >
            <option value={1}>English 1st Paper</option>
            <option value={2}>English 2nd Paper</option>
          </select>
        </label>
      </div>
      <aside className="english-reference rounded border bg-amber-50 p-4">
        <strong>Reference:</strong> {blueprint.reference.description}.
        User-approved practice template; not independently certified as the
        official 2027 pattern.
      </aside>
      <label className="block">
        Paper mode
        <select
          className={field}
          value={mode}
          onChange={(e) => {
            setMode(e.target.value as typeof mode);
            reset();
          }}
        >
          <option value="full">Full Model Test (printable)</option>
          <option value="selected">{paper === 1 ? "Topic-wise (Selected Parts)" : "Question item (Selected Parts)"}</option>
          <option value="writing">Writing Only</option>
        </select>
      </label>
      {mode === "full" && paper === 2 && <p role="status" className="rounded border bg-indigo-50 p-3 text-sm">
        পূর্ণ {blueprint.total} নম্বরের সব অংশ নির্বাচিত। Writing topic স্বয়ংক্রিয়ভাবে বাছাই করা হয়েছে; চাইলে বদলাতে পারবেন।
        {sourceKeys.length > 0 ? " " + sourceNotice : " এই পত্রে textbook extract প্রয়োজন নেই।"}
        প্রযোজ্য syllabus ও template মিলিয়ে নিচের বোতামে পুরো paper তৈরি করুন। শুধু নির্বাচন বদলালে প্রস্তুতির চেষ্টা বা খরচ গণনা হবে না।
      </p>}
      <section className="english-selection space-y-3">
        <div className="english-selection-heading">
          <div>
            <span className="english-eyebrow">QUESTION SELECTION</span>
            <h2 className="text-xl font-semibold">Template / marks preview</h2>
            <p>
              Choose the parts you need. Marks follow the practice template.
            </p>
          </div>
          <div className="english-total">
            <strong>{selected.reduce((sum, i) => sum + i.marks, 0)}</strong>
            <span>of {blueprint.total} marks</span>
            <small>{selected.length} parts selected</small>
          </div>
        </div>
        {mode !== "full" && (
          <div className="english-bulk-actions">
            <button
              type="button"
              onClick={() =>
                setIds(
                  blueprint.items
                    .filter(
                      (i) => mode !== "writing" || i.section === "writing",
                    )
                    .map((i) => i.id),
                )
              }
            >
              Select all parts
            </button>
            <button type="button" onClick={() => setIds([])}>
              Clear selection
            </button>
          </div>
        )}
        {blueprint.items
          .filter((i) => mode !== "writing" || i.section === "writing")
          .map((i) => (
            <div
              className={`english-task-card ${selected.some((s) => s.id === i.id) ? "is-selected" : ""}`}
              key={i.id}
            >
              <div className="english-section-tag">{i.section}</div>
              <label className="english-task-choice">
                <input
                  type="checkbox"
                  checked={selected.some((s) => s.id === i.id)}
                  disabled={mode === "full"}
                  onChange={(e) => {
                    setIds((old) =>
                      e.target.checked
                        ? [...old, i.id]
                        : old.filter((id) => id !== i.id),
                    );
                    setMessage("");
                  }}
                />{" "}
                <span className="english-task-number">
                  {String(blueprint.items.indexOf(i) + 1).padStart(2, "0")}
                </span>
                <span className="english-task-copy">
                  <strong>{i.title}</strong>
                  <small>
                    {i.answerCount
                      ? `Answer ${i.answerCount} of ${i.count} questions`
                      : i.count
                        ? `${i.count} items`
                        : "Writing task · your topic"}
                  </small>
                </span>
                <span className="english-marks-badge">
                  <strong>{i.marks}</strong>
                  <small>marks</small>
                </span>
              </label>
              {paper === 2 && i.section === "writing" &&
                selected.some((s) => s.id === i.id) && (
                  <div className="english-writing-fields mt-3 space-y-2">
                    {i.writingChoices && (
                      <label className="block">
                        Task type
                        <select
                          className={field}
                          value={writing[i.id]?.choice || ""}
                          onChange={(e) =>
                            updateWriting(i.id, {
                              choice: e.target.value,
                              topic: "",
                            })
                          }
                        >
                          <option value="">Choose exactly one</option>
                          {i.writingChoices.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </label>
                    )}
                    <label className="block">
                      Requested topic (required)
                      <input
                        className={field}
                        maxLength={500}
                        value={writing[i.id]?.topic || ""}
                        onChange={(e) =>
                          updateWriting(i.id, { topic: e.target.value })
                        }
                      />
                    </label>
                    <EnglishTopicPicker
                      grade={grade}
                      key={`${grade}-${paper}-${i.id}-${writing[i.id]?.choice || ""}`}
                      title={i.title}
                      topics={writingTopicSuggestions(
                        grade,
                        paper,
                        i.id,
                        writing[i.id]?.choice,
                      )}
                      value={writing[i.id]?.topic || ""}
                      onSelect={(topic) => updateWriting(i.id, { topic })}
                    />
                    <label className="block">
                      Word limit{" "}
                      {i.words ? `(reference: ${i.words})` : "(optional)"}
                      <input
                        className={field}
                        type="number"
                        min={20}
                        max={2000}
                        placeholder={String(i.words || "")}
                        value={writing[i.id]?.words ?? ""}
                        onChange={(e) =>
                          updateWriting(i.id, {
                            words: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                      />
                    </label>
                    <label className="block">
                      Special instruction (optional)
                      <textarea
                        className={field}
                        maxLength={1000}
                        value={writing[i.id]?.instruction || ""}
                        onChange={(e) =>
                          updateWriting(i.id, { instruction: e.target.value })
                        }
                      />
                    </label>
                  </div>
                )}
            </div>
          ))}
      </section>
      {(paper === 1 ? [] : sourceKeys).map((key) => (
        <fieldset className="space-y-2 rounded border p-4" key={key}>
          <legend>Textbook source: {key}</legend>
          <p>
            নিজের নির্ভরযোগ্য textbook extract দিন। বানানো passage-কে seen text
            হিসেবে ব্যবহার করা হবে না।
          </p>
          <label className="block">
            Book / unit / title reference
            <input
              className={field}
              maxLength={500}
              value={sources[key]?.reference || ""}
              onChange={(e) =>
                setSources((old) => ({
                  ...old,
                  [key]: {
                    text: old[key]?.text || "",
                    reference: e.target.value,
                  },
                }))
              }
            />
          </label>
          <label className="block">
            Exact source text
            <textarea
              rows={6}
              className={field}
              maxLength={20000}
              value={sources[key]?.text || ""}
              onChange={(e) =>
                setSources((old) => ({
                  ...old,
                  [key]: {
                    reference: old[key]?.reference || "",
                    text: e.target.value,
                  },
                }))
              }
            />
          </label>
        </fieldset>
      ))}
      {paper === 2 && <label className="english-answer-option block">
        <input
          type="checkbox"
          checked={answers}
          onChange={(e) => setAnswers(e.target.checked)}
        />{" "}
        Request separate answers / writing samples
      </label>}
      <p>
        {paper === 1 ? "নির্বাচিত item-এর প্রস্তুত প্রশ্ন–উত্তর নেওয়া হবে। Passage ও তার প্রশ্ন একসঙ্গে থাকবে; পরে সম্পাদনা করতে পারবেন।" : "শুধু নির্বাচিত writing task ও topic ব্যবহার হবে। আগে অনুমোদিত database থেকে মিল খোঁজা হবে; না-পাওয়া অংশ তৈরি করা হবে।"}
      </p>
      <button
        className="english-generate rounded bg-emerald-600 px-5 py-3 text-white"
        disabled={busy || loadingSources}
        onClick={validate}
      >
        {busy ? "তৈরি হচ্ছে…" : "প্রশ্নপত্র তৈরি করুন"}
      </button>
      <p role="status" aria-live="polite">
        {message}
      </p>
      <a className="block underline" href="/question-builder/english/saved">
        সংরক্ষিত / উদ্ধার করা English draft দেখুন
      </a>
      <p className="text-sm text-slate-600">
        {paper === 1 ? "প্রস্তুত প্রশ্ন ব্যক্তিগত draft হিসেবে সেভ হবে। ব্যবহারের আগে প্রশ্ন ও উত্তর যাচাই করুন।" : "অ্যাডমিন ছাড়া সকল ব্যবহারকারীর জন্য প্রতিদিন সর্বোচ্চ ১০টি নতুন প্রশ্ন প্রস্তুতির চেষ্টা; অ্যাডমিনের দৈনিক সীমা নেই। ব্যবহারের আগে প্রশ্ন ও উত্তর যাচাই করুন।"}
      </p>
    </main>
  );
}
