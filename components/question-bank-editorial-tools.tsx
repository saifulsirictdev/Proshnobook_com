"use client";
import { useRef, useState } from "react";
import { legacyToUnicode } from "@/lib/question-bank-editorial";
const input =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500";
const button =
  "rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-800 disabled:opacity-50";
export default function QuestionBankEditorialTools({
  fields,
  apply,
}: {
  fields: { id: string; label: string; text: string }[];
  apply: (field: string, text: string, assisted: boolean) => void;
}) {
  const [field, setField] = useState(fields[0]?.id ?? "text"),
    [source, setSource] = useState(""),
    [baseline, setBaseline] = useState(""),
    [proposal, setProposal] = useState(""),
    [kind, setKind] = useState<"unicode" | "assist">("unicode"),
    [consent, setConsent] = useState(false),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [notes, setNotes] = useState("");
  const [undo, setUndo] = useState<{
      field: string;
      before: string;
      after: string;
    } | null>(null),
    textarea = useRef<HTMLTextAreaElement>(null);
  function load(id = field) {
    const value = fields.find((f) => f.id === id)?.text ?? "";
    setField(id);
    setSource(value);
    setBaseline(value);
    setProposal("");
    setNotes("");
    setMessage("");
    setConsent(false);
  }
  function convert() {
    try {
      const start = textarea.current?.selectionStart ?? 0,
        end = textarea.current?.selectionEnd ?? 0;
      const segment = end > start ? source.slice(start, end) : source;
      if (!segment.trim())
        throw Error("আগে Editor থেকে টেক্সট নিন বা paste করুন।");
      if (
        end === start &&
        !confirm(
          "পুরো বক্সের টেক্সটকে legacy Bijoy হিসেবে বিবেচনা করবেন? Mixed টেক্সটে শুধু legacy অংশ select করা নিরাপদ।",
        )
      )
        return;
      setProposal(
        end > start
          ? source.slice(0, start) +
              legacyToUnicode(segment) +
              source.slice(end)
          : legacyToUnicode(source),
      );
      setKind("unicode");
      setNotes(
        "এটি encoding conversion, font পরিবর্তন নয়। English/সূত্র/সংখ্যা সংরক্ষণ করা হয়; ASCII Bijoy দ্ব্যর্থক হওয়ায় ফল হাতে যাচাই করুন।",
      );
      setMessage("");
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  async function assist() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/question-bank/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: source, consent }),
        credentials: "same-origin",
      });
      const result = await response.json();
      if (!response.ok) throw Error(result.error ?? "সংশোধন পাওয়া যায়নি।");
      setProposal(result.suggestion);
      setKind("assist");
      setNotes(result.notes + "\n" + result.disclaimer);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="rounded-2xl border border-violet-200 bg-violet-50/40 p-4">
      <summary className="cursor-pointer font-bold text-violet-900">
        Unicode conversion ও ঐচ্ছিক সংশোধন সহায়তা
      </summary>
      <div className="mt-4 space-y-3">
        <label className="grid gap-1 text-sm">
          কোন field-এ কাজ করবেন
          <select
            className={input}
            value={field}
            onChange={(e) => load(e.target.value)}
          >
            {fields.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className={button} onClick={() => load()}>
          Editor থেকে টেক্সট নিন
        </button>
        <p className="text-xs leading-6 text-slate-600">
          Mixed টেক্সটে শুধু Bijoy/SutonnyMJ-এ লেখা অংশ select করে Convert করুন।
          রূপান্তর স্থানীয়ভাবে হয়; এই কাজে কোনো টেক্সট বাইরে পাঠানো হয় না।
          $...$-এর সূত্র, code, URL, ছবির লিংক ও সংখ্যা হুবহু রাখা হয়। মূল ফাইলে
          পরিবর্তন হবে না।
        </p>
        <div className="grid gap-3 lg:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium">
            মূল / legacy টেক্সট
            <textarea
              ref={textarea}
              aria-label="মূল / legacy টেক্সট"
              className={input}
              rows={7}
              maxLength={20000}
              value={source}
              onChange={(e) => {
                setSource(e.target.value);
                setProposal("");
              }}
            />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            প্রস্তাবিত টেক্সট · review করে পরিবর্তন করতে পারবেন
            <textarea
              aria-label="প্রস্তাবিত টেক্সট"
              className={input}
              rows={7}
              maxLength={20000}
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
            />
          </label>
        </div>
        <button
          type="button"
          className={button}
          disabled={busy || !source.trim()}
          onClick={convert}
        >
          Bijoy → Unicode প্রিভিউ
        </button>
        <div className="space-y-2 border-t border-violet-200 pt-3">
          <p className="text-xs leading-6 text-slate-600">
            ঐচ্ছিক বানান/বিন্যাস সংশোধনে শুধু এই বক্সের টেক্সট DeepSeek সেবায়
            যাবে। ব্যক্তিগত তথ্য পাঠাবেন না। প্রতি মিনিটে ২টি, UTC দিনে ২০টি
            অনুরোধ; একবারে ৬,০০০ অক্ষর। ব্যর্থ অনুরোধও সীমায় গণনা হয়। উত্তর নতুন
            করে তৈরি বা সত্যতা যাচাই করা হয় না।
          </p>
          <label className="flex items-start gap-2 text-xs leading-6">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1"
            />
            বাইরের সংশোধন সেবায় এই টেক্সট পাঠাতে সম্মতি দিচ্ছি।
          </label>
          <button
            type="button"
            className={button}
            disabled={
              busy || !consent || !source.trim() || source.length > 6000
            }
            onClick={() => void assist()}
          >
            {busy ? "প্রস্তাব আসছে…" : "বানান / বিন্যাসের প্রস্তাব নিন"}
          </button>
        </div>
        {notes && (
          <p className="whitespace-pre-wrap text-xs leading-6 text-slate-600">
            {notes}
          </p>
        )}
        {message && (
          <p role="status" className="text-sm text-rose-800">
            {message}
          </p>
        )}
        {proposal && (
          <button
            type="button"
            className={button}
            disabled={busy}
            onClick={() => {
              const current = fields.find((f) => f.id === field)?.text ?? "";
              if (current !== baseline) {
                setMessage(
                  "Editor-এর field বদলেছে। নতুন করে টেক্সট নিয়ে কাজ করুন; কোনো পরিবর্তন প্রয়োগ হয়নি।",
                );
                return;
              }
              const after =
                kind === "assist" && field === "explanation"
                  ? "সফটওয়্যার-সহায়িত সংশোধিত খসড়া — যাচাই প্রয়োজন\n" + proposal
                  : proposal;
              setUndo({ field, before: current, after });
              apply(field, after, kind === "assist");
              setMessage("শুধু Editor-এ বসেছে; এখনো সেভ বা approve হয়নি।");
              setBaseline(after);
            }}
          >
            পার্থক্য দেখেছি · Editor-এ বসান
          </button>
        )}
        {undo && (
          <button
            type="button"
            className={button}
            onClick={() => {
              if (
                fields.find((f) => f.id === undo.field)?.text !== undo.after
              ) {
                setMessage(
                  "পরে লেখা টেক্সট মুছে যেতে পারে; Undo বন্ধ রাখা হয়েছে।",
                );
                return;
              }
              apply(undo.field, undo.before, false);
              setUndo(null);
              setProposal("");
              setMessage("আগের টেক্সট Editor-এ ফিরেছে; সেভ হয়নি।");
            }}
          >
            শেষ Apply Undo করুন
          </button>
        )}
      </div>
    </details>
  );
}
