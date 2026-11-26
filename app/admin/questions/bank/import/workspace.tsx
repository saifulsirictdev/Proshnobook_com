"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  bankDraftSchema,
  type BankDraft,
} from "@/lib/admin-question-bank-schema";
import { bankTextTemplate, bankUuidFromHex } from "@/lib/question-bank-batch";
import { readBankFileInWorker } from "@/lib/question-bank-file-client";
import {
  BANK_FILE_MAX_BYTES,
  BANK_DOCUMENT_MAX_CHARS,
  bankFileFormat,
  bankImportChunks,
  markCrossChunkDuplicates,
  type BankFileFormat,
  type BankFileProgress,
} from "@/lib/question-bank-large-file";
import { ScopeFields, Preview } from "../workspace";
import QuestionBankEditorialTools from "@/components/question-bank-editorial-tools";
const input =
  "w-full min-w-0 max-w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-blue-500";
const button =
  "inline-flex items-center justify-center rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-800 disabled:opacity-50";
const panel =
  "min-w-0 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 md:p-5";
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
    signal: AbortSignal.timeout(180000),
  });
  const result = await response.json().catch(() => ({
    error: `সার্ভারের অনুরোধ সম্পন্ন হয়নি (HTTP ${response.status})। একই ব্যাচ আবার যাচাই করে চেষ্টা করুন।`,
  }));
  if (!response.ok) throw Error(result.error ?? "অনুরোধ সম্পন্ন হয়নি।");
  return result;
}
export default function BankImportWorkspace({
  scopes = [],
}: {
  scopes?: { category: string; subject: string; topic: string }[];
}) {
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
  const [page, setPage] = useState(1),
    [editRevision, setEditRevision] = useState(0),
    [fileFormat, setFileFormat] = useState<BankFileFormat>("txt"),
    [fileFilter, setFileFilter] = useState(""),
    [includeImages, setIncludeImages] = useState(true);
  const [uploadInfo, setUploadInfo] = useState<{
      name: string;
      size: number;
      state: string;
    } | null>(null),
    [progress, setProgress] = useState<BankFileProgress | null>(null);
  const controller = useRef<AbortController | null>(null),
    stop = useRef(false);
  const selectedSet = new Set(selected),
    chosen = items.filter((item) => selectedSet.has(item.entryId)),
    currentSignature = String(editRevision);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if ((!items.length && !raw.length && !busy) || saved) return;
    const leave = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", leave);
    return () => window.removeEventListener("beforeunload", leave);
  }, [items.length, raw.length, busy, saved]);
  function invalidate() {
    setEditRevision((value) => value + 1);
    setReport([]);
    setSignature("");
    setReviewed(false);
    setSaved(false);
    setMessage("");
  }
  async function stage(
    drafts: BankDraft[],
    identity?: string,
    signal?: AbortSignal,
  ) {
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
    const next: Entry[] = [];
    for (let offset = 0; offset < drafts.length; offset += 250) {
      if (signal?.aborted)
        throw new DOMException("Staging বাতিল হয়েছে।", "AbortError");
      next.push(
        ...(await Promise.all(
          drafts.slice(offset, offset + 250).map(async (draft, index) => ({
            entryId: await uuid(id + ":" + (offset + index)),
            draft,
          })),
        )),
      );
      setProgress({
        phase: "প্রশ্ন staging-এ নিচ্ছি",
        done: next.length,
        total: drafts.length,
      });
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    setPage(1);
    if (signal?.aborted)
      throw new DOMException("Staging বাতিল হয়েছে।", "AbortError");
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
  async function processFile(file?: File) {
    if (file) {
      setUploadInfo({ name: file.name, size: file.size, state: "নির্বাচিত" });
      try {
        bankFileFormat(file.name);
        if (!file.size || file.size > BANK_FILE_MAX_BYTES)
          throw Error("খালি ফাইল নয়; সর্বোচ্চ ৫০ MiB DOCX / JSON / TXT দিন।");
      } catch (error) {
        setUploadInfo({
          name: file.name,
          size: file.size,
          state: "গ্রহণ করা হয়নি",
        });
        setMessage((error as Error).message);
        return;
      }
    }
    if (
      items.length &&
      !confirm("বর্তমান staged ব্যাচ সরিয়ে নতুন ফাইল/টেক্সট পড়বেন?")
    ) {
      if (file)
        setUploadInfo({
          name: file.name,
          size: file.size,
          state: "নতুন ফাইল খোলা বাতিল; আগের staging আছে",
        });
      return;
    }
    setBusy(true);
    setMessage("");
    setProgress({ phase: "ফাইল প্রক্রিয়া শুরু করছি" });
    const abort = new AbortController();
    controller.current = abort;
    try {
      if (file)
        setUploadInfo({ name: file.name, size: file.size, state: "পড়ছি…" });
      const result = await readBankFileInWorker(
        file
          ? { file, scope, includeImages }
          : { text: raw, format: fileFormat, scope },
        setProgress,
        abort.signal,
      );
      await stage(result.items, result.batchId, abort.signal);
      setRaw(result.text);
      setFileFormat(result.format);
      setWarnings(result.warnings);
      setFileName(result.fileName);
      if (file)
        setUploadInfo({
          name: file.name,
          size: file.size,
          state: `ফাইল পড়া হয়েছে · ${result.items.length}টি প্রশ্ন staging-এ`,
        });
      setMessage(
        result.items.length
          ? `${result.items.length}টি প্রশ্ন staging-এ এসেছে। এখন প্রিভিউ/সংশোধন ও duplicate check করুন; কোনো প্রশ্ন সেভ বা প্রকাশ হয়নি।`
          : "ফাইলের টেক্সট পড়া হয়েছে, প্রশ্ন এখনো staging-এ আসেনি। নিচের warning দেখুন; শ্রেণি/বিষয়/অধ্যায় ও Template ঠিক করে Parse করুন।",
      );
    } catch (error) {
      if (file)
        setUploadInfo({
          name: file.name,
          size: file.size,
          state: abort.signal.aborted ? "বাতিল হয়েছে" : "প্রক্রিয়া ব্যর্থ",
        });
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
      setProgress(null);
      controller.current = null;
    }
  }
  async function checkOrSave(action: "check" | "save") {
    if (action === "save" && (!reviewed || signature !== currentSignature))
      return;
    setBusy(true);
    setMessage("");
    stop.current = false;
    let done = 0,
      inserted = 0,
      skipped = 0,
      scanned = 0,
      failed = 0;
    const allReport: Report[] = [],
      duplicateIds = markCrossChunkDuplicates(chosen);
    try {
      for (const { draft } of chosen) bankDraftSchema.parse(draft);
      const chunks = bankImportChunks(chosen);
      for (const chunk of chunks) {
        if (stop.current) break;
        setProgress({
          phase:
            action === "check"
              ? "Duplicate পরীক্ষা করছি"
              : "শুধু Pending হিসেবে সেভ করছি",
          done,
          total: chosen.length,
        });
        const result = await call({
          action,
          batchId,
          fileName,
          reviewed: action === "save" && reviewed,
          items: chunk,
        });
        if (action === "check") {
          allReport.push(
            ...result.report.map((row: Report) => ({
              ...row,
              inBatch: row.inBatch || duplicateIds.has(row.entryId),
            })),
          );
          scanned = Math.max(scanned, result.existingScanned);
          done += chunk.length;
        } else {
          inserted += result.inserted;
          skipped += result.skipped;
          failed += result.failures.length;
          done += chunk.length - result.notAttempted;
          if (result.failures.length || result.notAttempted) break;
        }
      }
      if (action === "check") {
        setReport(allReport);
        setSignature(done === chosen.length ? currentSignature : "");
        setReviewed(false);
        setMessage(
          done === chosen.length
            ? `${scanned}টি DB প্রশ্নের সঙ্গে duplicate পরীক্ষা হয়েছে। ${done}টি নির্বাচিত প্রশ্ন একাধিক ছোট request-এ যাচাই হয়েছে; near-match প্রতি request-এ সর্বোচ্চ ৫০০টি DB candidate-এর advisory রিপোর্ট; সব প্রশ্নের near-match নিশ্চয়তা নয়।`
            : `${done}/${chosen.length}টি যাচাই করে থেমেছে। সব প্রশ্ন যাচাই না হওয়া পর্যন্ত Save বন্ধ থাকবে।`,
        );
      } else {
        setSaved(!failed && done === chosen.length);
        setSignature("");
        setReviewed(false);
        setMessage(
          `${inserted}টি নতুন Pending; ${skipped}টি duplicate/আগে সেভ করা entry বাদ; ${failed}টি ব্যর্থ; ${chosen.length - done}টি চেষ্টা হয়নি। কোনো প্রশ্ন approve হয়নি।${failed || done < chosen.length ? " থেমেছে—আবার Check করে একই ব্যাচ Save করলে আগের entry overwrite হবে না।" : ""}`,
        );
      }
    } catch (error) {
      setSignature("");
      setReviewed(false);
      setMessage(
        `${action === "save" ? `নিশ্চিত হিসাব: ${inserted}টি নতুন Pending, ${skipped}টি বাদ। শেষ request-এর ফল না এলে কিছু প্রশ্ন সেভ হয়ে থাকতে পারে—একই ব্যাচ আবার Check/Save করুন; stable ID আগের entry overwrite হতে দেবে না। ` : ""}${error instanceof Error && /^[\u0980-\u09ff]/.test(error.message) ? error.message : "প্রশ্নের গঠন/সংযোগ যাচাই করে আবার চেষ্টা করুন।"}`,
      );
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }
  const math = /গণিত|mathematics/i.test(scope.subject),
    templateQuery = `math=${math ? 1 : 0}`;
  return (
    <div className="min-w-0 space-y-5 text-slate-900 [overflow-wrap:anywhere]">
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
          Word / JSON / TXT ব্যাচ review-import
        </h1>
        <p className="mt-2 text-sm leading-7 text-slate-500">
          ফাইল → Parse → হাতে সংশোধন → duplicate check → নির্বাচিত প্রশ্ন
          Pending হিসেবে সেভ। Approval আলাদা।
        </p>
      </header>
      <section className={panel}>
        <h2 className="font-bold">১. শ্রেণি, বিষয় ও অধ্যায়</h2>
        <fieldset disabled={busy} className="grid min-w-0 gap-3 sm:grid-cols-3">
          <ScopeFields
            edit
            value={scope}
            scopes={scopes}
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
        </fieldset>
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
              setFileFormat("txt");
            }}
          >
            টেক্সটে নমুনা বসান
          </button>
        </div>
        <p className="text-xs leading-6 text-slate-600">
          সর্বোচ্চ ৫০ MiB DOCX / JSON / TXT; ১০,০০০টি প্রশ্ন staging-এ, সর্বোচ্চ
          ২ কোটি অক্ষর। ৫০০–৬০০ পৃষ্ঠার বই লক্ষ্য রেখে browser worker-এ পড়া
          হবে—পৃষ্ঠা সংখ্যা দিয়ে সফলতার নিশ্চয়তা নয়; বড় ছবি/কম RAM হলে বই ভাগ
          করুন। পুরো বড় ফাইল server-এ পাঠানো হয় না। নির্বাচিত প্রশ্ন সর্বোচ্চ
          ১০০টি ও প্রায় ৮০০ KB করে ছোট request-এ সেভ হবে। পুরোনো DOC আগে DOCX
          করুন।
        </p>
        <label className="grid gap-2 text-sm">
          ফাইল বাছাইয়ের filter
          <select
            aria-label="ফাইল বাছাইয়ের filter"
            className={input}
            value={fileFilter}
            disabled={busy}
            onChange={(event) => setFileFilter(event.target.value)}
          >
            <option value="">
              সব ফাইল দেখান (Android-এ JSON/TXT-ও বাছা যাবে)
            </option>
            <option value=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document">
              শুধু DOCX
            </option>
            <option value=".json,application/json,text/plain,application/octet-stream">
              JSON
            </option>
            <option value=".txt,text/plain,application/octet-stream">
              TXT
            </option>
          </select>
        </label>
        <label className="flex gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeImages}
            disabled={busy}
            onChange={(event) => setIncludeImages(event.target.checked)}
          />
          Word-এর JPG/PNG/WebP ছবি সংরক্ষণ করুন (সর্বোচ্চ ১,০০০টি, প্রতিটি ৪ MB;
          public URL—ব্যক্তিগত তথ্য দেবেন না)
        </label>
        <input
          aria-label="Word / JSON / TXT ফাইল"
          type="file"
          accept={fileFilter || undefined}
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void processFile(file);
            event.target.value = "";
          }}
          className="block w-full min-w-0 text-sm"
        />
        {uploadInfo && (
          <div
            role="status"
            aria-label="নির্বাচিত ফাইলের অবস্থা"
            className="break-words rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm"
          >
            <b>{uploadInfo.name}</b> ·{" "}
            {(uploadInfo.size / 1024 / 1024).toFixed(2)} MiB
            <br />
            {uploadInfo.state}
          </div>
        )}
        {message && (
          <div
            role="status"
            className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-7 text-blue-900"
          >
            {message}
          </div>
        )}
        {progress && (
          <div
            role="status"
            aria-live="polite"
            className="space-y-2 rounded-xl border bg-sky-50 p-3 text-sm"
          >
            <p>
              {progress.phase}
              {progress.total
                ? ` · ${progress.done ?? 0}/${progress.total}`
                : ""}
            </p>
            <progress
              aria-label="Import অগ্রগতি"
              className="w-full"
              max={progress.total || 1}
              value={progress.total ? progress.done : undefined}
            />
            <button
              type="button"
              className={button}
              onClick={() => {
                if (controller.current) controller.current.abort();
                else {
                  stop.current = true;
                  setMessage(
                    "বর্তমান request শেষ হলে থামবে। ইতিমধ্যে Pending সেভ হওয়া প্রশ্ন থাকবে।",
                  );
                }
              }}
            >
              {controller.current ? "পড়া বাতিল করুন" : "বর্তমান ধাপ শেষে থামান"}
            </button>
          </div>
        )}
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
              maxLength={BANK_DOCUMENT_MAX_CHARS}
              disabled={busy}
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
            onClick={() => void processFile()}
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
          {items.length > 20 && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className={button}
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
              >
                আগের পৃষ্ঠা
              </button>
              <span>
                প্রশ্ন {(page - 1) * 20 + 1}–{Math.min(page * 20, items.length)}{" "}
                / {items.length} · পৃষ্ঠা {page}/{Math.ceil(items.length / 20)}
              </span>
              <button
                type="button"
                className={button}
                disabled={page * 20 >= items.length}
                onClick={() => setPage((value) => value + 1)}
              >
                পরের পৃষ্ঠা
              </button>
            </div>
          )}
          {items
            .slice((page - 1) * 20, page * 20)
            .map(({ entryId, draft }, localIndex) => {
              const index = (page - 1) * 20 + localIndex;
              const issue = report.find((r) => r.entryId === entryId),
                parts = (draft.options.subQuestions ?? {}) as Record<
                  string,
                  string
                >;
              return (
                <details
                  key={entryId}
                  className={panel}
                  open={localIndex === 0}
                >
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
    </div>
  );
}
