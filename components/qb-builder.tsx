"use client";
import {
  applyEnglishTextEdits,
  resolveEnglishField,
} from "@/lib/english/editable-text";
import { autoModelSections, autoModelIssues } from "@/lib/auto-model-paper";
import { loadEnglishPaper } from "@/app/actions/english-paper";
import {
  PAPER_SECTION_ORDER,
  paperSectionTitle,
  cqDivisionGroups,
} from "@/lib/paper-sections";
import RichPaperText from "@/components/paper-builder/rich-paper-text";
import WalletCheckout from "@/components/wallet-checkout";
import { checkPurchasedPaperAccess } from "@/app/actions/purchased-paper-access";
import { checkQuestionAccess } from "@/app/actions/wallet";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Download, Settings2, Shuffle, Plus, AlertCircle } from "lucide-react";
import HeaderManager from "@/components/paper-builder/header-manager";
import DefaultHeaderEditor from "@/components/paper-builder/default-header-editor";
import {
  resolveDefaultHeader,
  withDefaultHeader,
} from "@/lib/default-paper-header";
import { currentHeader } from "@/lib/paper-header";
import PaperSettingsPanel from "@/components/paper-builder/settings";
import PaperPreview, {
  type PreviewQuestion,
} from "@/components/paper-builder/preview";
import {
  defaults,
  restoreSettings,
  paperDimensions,
  bookletOrder,
  duplicateIds,
  questionType,
  shuffled,
  safeImage,
  type PaperSettings,
  type PaperItem,
} from "@/lib/paper-builder";
import "katex/dist/katex.min.css";
import "./paper-builder/paper.css";
const input =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500";
export default function QbBuilder({
  supportHref = "/contact-us",
  tutorialHref,
  purchased,
  english,
}: {
  english?: {
    key: string;
    items: PaperItem[];
    settings: PaperSettings;
    useDefaultHeader?: boolean;
    saveSettings?: (
      s: PaperSettings,
    ) => Promise<{ ok: boolean; error?: string }>;
    onSettings: (s: PaperSettings) => void;
  };
  purchased?: { id: string; items: PaperItem[]; settings: PaperSettings };
  supportHref?: string;
  tutorialHref?: string;
}) {
  const [items, setItems] = useState<PaperItem[]>([]),
    [s, setSettings] = useState<PaperSettings>(() =>
      withDefaultHeader(defaults()),
    ),
    [loading, setLoading] = useState(true),
    [ready, setReady] = useState(false),
    [error, setError] = useState("");
  const [missingCount, setMissingCount] = useState(0);
  const [edit, setEdit] = useState(false),
    [open, setOpen] = useState(false),
    [division, setDivision] = useState(""),
    [storageError, setStorageError] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [newDivision, setNewDivision] = useState("");
  const [headerEditRequest, requestHeaderEdit] = useState(0);
  const [divisionQuestion, setDivisionQuestion] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [exchanging, setExchanging] = useState(false);
  const [alternatives, setAlternatives] = useState<{
    originalId: string;
    choices: {
      id: string;
      label: string;
      subject: string;
      topic: string;
      type: string;
      locked: boolean;
      item?: PaperItem;
    }[];
  } | null>(null);
  const [checkoutAlternative, setCheckoutAlternative] = useState("");
  const alternativesRef = useRef<HTMLElement>(null);
  function chooseAlternative(originalId: string, replacement: PaperItem) {
    if (
      !items.some((q) => q.id === originalId) ||
      items.some((q) => q.id === replacement.id)
    )
      return;
    const next = items.map((q) => (q.id === originalId ? replacement : q));
    try {
      localStorage.setItem(
        "qb:selected",
        JSON.stringify(next.map((q) => q.id)),
      );
    } catch {
      setStorageError(true);
    }
    update({ ...s });
    setItems(next);
    setAlternatives(null);
    setCheckoutAlternative("");
    setActionMessage(
      "আপনার বাছাই করা একই অধ্যায় ও ধরনের বিকল্প প্রশ্ন বসানো হয়েছে।",
    );
  }
  async function questionAction(
    id: string,
    action: "remove" | "reset" | "exchange",
  ) {
    setActionMessage("");
    if (action === "reset") {
      const edits = { ...s.edits };
      delete edits[id];
      update({ ...s, edits });
      return;
    }
    if (action === "remove") {
      if (!window.confirm("এই প্রশ্নপত্র থেকে প্রশ্নটি সরাবেন?")) return;
      update({ ...s, excludedIds: [...s.excludedIds, id] });
      return;
    }
    if (english || purchased) {
      setActionMessage(
        english
          ? "Passage-সংযুক্ত প্রশ্নসেট সাধারণ প্রশ্নের সঙ্গে Exchange করা যাবে না। Question Item থেকে নতুন সেট বাছুন।"
          : "কেনা প্রশ্নপত্রে প্রশ্নের লেখা সম্পাদনা করতে পারবেন। প্রশ্নব্যাংক থেকে নতুন প্রশ্ন নিতে আলাদা নির্বাচন ও checkout প্রয়োজন।",
      );
      return;
    }
    if (exchanging) return;
    setExchanging(true);
    try {
      const res = await fetch("/api/qb/replacement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, exclude: items.map((q) => q.id) }),
      });
      const result = await res.json();
      if (!res.ok || !result.alternatives?.length)
        throw Error(result.error || "বিকল্প পাওয়া যায়নি।");
      setAlternatives({ originalId: id, choices: result.alternatives });
      requestAnimationFrame(() =>
        alternativesRef.current?.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        }),
      );
    } catch (e) {
      setActionMessage(e instanceof Error ? e.message : "প্রশ্ন বদলানো যায়নি।");
    } finally {
      setExchanging(false);
    }
  }
  const close = useCallback(() => setOpen(false), []);
  useEffect(() => {
    if (english) {
      setItems(english.items);
      setSettings(
        english.useDefaultHeader
          ? withDefaultHeader(english.settings, true)
          : english.settings,
      );
      setDivision(english.settings.cfg.divisionFilter);
      setOpen(true);
      setReady(true);
      setLoading(false);
      return;
    }
    if (purchased) {
      setItems(purchased.items);
      setSettings(purchased.settings);
      setDivision(purchased.settings.cfg.divisionFilter);
      setReady(true);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    try {
      const restored = restoreSettings(
        JSON.parse(localStorage.getItem("qb:settings") || "{}"),
      );
      setSettings(withDefaultHeader(restored));
      setDivision(restored.cfg.divisionFilter);
    } catch {}
    setReady(true);
    let ids: unknown = [];
    try {
      ids = JSON.parse(localStorage.getItem("qb:selected") || "[]");
    } catch {}
    if (!Array.isArray(ids) || !ids.length) {
      setLoading(false);
      return;
    }
    fetch("/api/qb/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
      signal: controller.signal,
    })
      .then(async (r) => {
        if (!r.ok) throw Error();
        const d = await r.json();
        const loaded: PaperItem[] = Array.isArray(d.items) ? d.items : [];
        setItems(loaded);
        setMissingCount(
          (ids as string[]).filter((id) => !loaded.some((q) => q.id === id))
            .length,
        );
      })
      .catch((e) => {
        if (e.name !== "AbortError")
          setError("প্রশ্ন লোড হয়নি। ইন্টারনেট পরীক্ষা করে আবার চেষ্টা করুন।");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (!ready || purchased || english) return;
    try {
      localStorage.setItem("qb:settings", JSON.stringify(s));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [s, ready]);
  useEffect(() => {
    if (english && ready) english.onSettings(s);
  }, [s, ready]);
  const history = useRef<{
    past: { settings: PaperSettings; items: PaperItem[] }[];
    future: { settings: PaperSettings; items: PaperItem[] }[];
  }>({ past: [], future: [] });
  const liveItems = useRef(items);
  liveItems.current = items;
  const liveSettings = useRef(s);
  liveSettings.current = s;
  const [, setHistoryTick] = useState(0);
  useEffect(() => {
    if (!purchased && !english && ready && !loading && items.length) {
      try {
        localStorage.setItem(
          "qb:selected",
          JSON.stringify(items.map((q) => q.id)),
        );
      } catch {
        setStorageError(true);
      }
    }
  }, [items, ready, loading]);
  const undo = () => {
    const prev = history.current.past.pop();
    if (!prev) return;
    history.current.future.push({ settings: s, items });
    setSettings(prev.settings);
    setItems(prev.items);
    setHistoryTick((v) => v + 1);
  };
  const redo = () => {
    const next = history.current.future.pop();
    if (!next) return;
    history.current.past.push({ settings: s, items });
    setSettings(next.settings);
    setItems(next.items);
    setHistoryTick((v) => v + 1);
  };
  const update = useCallback((next: PaperSettings) => {
    history.current.past.push({
      settings: liveSettings.current,
      items: liveItems.current,
    });
    if (history.current.past.length > 60) history.current.past.shift();
    history.current.future = [];
    liveSettings.current = next;
    setHistoryTick((v) => v + 1);
    setSettings(next);
    try {
      if (!purchased && !english)
        localStorage.setItem("qb:settings", JSON.stringify(next));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, []);
  async function saveDefaultHeader(next: PaperSettings) {
    if (english) {
      if (!english.saveSettings)
        return { ok: false, error: "প্রশ্নপত্র সেভ করার ব্যবস্থা পাওয়া যায়নি।" };
      const result = await english.saveSettings(next);
      if (!result.ok) return result;
    } else {
      try {
        localStorage.setItem("qb:settings", JSON.stringify(next));
        setStorageError(false);
      } catch {
        setStorageError(true);
        return {
          ok: false,
          error: "ব্রাউজারে হেডার সেভ হয়নি। স্টোরেজ পরীক্ষা করে আবার চেষ্টা করুন।",
        };
      }
    }
    update(next);
    return { ok: true };
  }
  const data = useMemo(
    () =>
      items
        .filter((q) => !s.excludedIds.includes(q.id))
        .map((q) =>
          applyEnglishTextEdits(
            { ...q, ...s.edits[q.id] },
            s.edits[q.id]?.englishText,
          ),
        ),
    [items, s.edits, s.excludedIds],
  );
  const counts = useMemo(
    () => ({
      MCQ: data.filter((q) => questionType(q) === "MCQ").length,
      CQ: data.filter((q) => questionType(q) === "CQ").length,
      SHORT: data.filter((q) => questionType(q) === "SHORT").length,
    }),
    [data],
  );
  const duplicates = useMemo(() => duplicateIds(data), [data]);
  const divisions = Array.from(
    new Set(
      data
        .filter((q) => questionType(q) === "CQ")
        .map((q) => s.attachments[q.id]?.division || q.topic || "সাধারণ বিভাগ"),
    ),
  );
  function info(key: keyof PaperSettings["info"], value: string) {
    update({ ...s, info: { ...s.info, [key]: value } });
  }
  const inline = edit
    ? {
        editable: true,
        resolve(q: PaperItem, path: string): string | null {
          const base = data.find((x) => x.id === q.id.split(":flow:")[0]) ?? q;
          if (path === "text") return base.text;
          if (path === "stimulus") return base.stimulus || "";
          if (path.startsWith("sub:"))
            return (
              base.subQuestions?.[
                path.slice(4) as keyof NonNullable<PaperItem["subQuestions"]>
              ] ?? ""
            );
          if (path.startsWith("opt:"))
            return base.options?.[path.slice(4)] ?? "";
          if (base.englishGroup)
            return resolveEnglishField(base.englishGroup, path)?.value ?? null;
          return null;
        },
        save(q: PaperItem, path: string, value: string) {
          const baseId = q.id.split(":flow:")[0];
          const base = data.find((x) => x.id === baseId);
          if (!base) return;
          if (path === "text") return questionEdit(base, { text: value });
          if (path === "stimulus")
            return questionEdit(base, { stimulus: value });
          if (path.startsWith("sub:")) {
            const key = path.slice(4);
            return questionEdit(base, {
              subQuestions: { ...base.subQuestions!, [key]: value },
            });
          }
          if (path.startsWith("opt:")) {
            const key = path.slice(4);
            return questionEdit(base, {
              options: { ...base.options!, [key]: value },
            });
          }
          const resolved = base.englishGroup
            ? resolveEnglishField(base.englishGroup, path)
            : null;
          if (resolved)
            questionEdit(base, {
              englishText: {
                ...s.edits[baseId]?.englishText,
                [resolved.key]: value,
              },
            });
        },
        saveMarks(q: PaperItem, part: string | null, value: number) {
          const baseId = q.id.split(":flow:")[0];
          const base = data.find((x) => x.id === baseId);
          if (!base) return;
          if (part)
            questionEdit(base, {
              partMarks: { ...(base.partMarks ?? {}), [part]: value },
            });
          else questionEdit(base, { marks: value });
        },
        attachment(
          id: string,
          patch: Partial<PaperSettings["attachments"][string]>,
        ) {
          attachment(id.split(":flow:")[0], patch);
        },
      }
    : undefined;
  function attachment(
    id: string,
    patch: Partial<PaperSettings["attachments"][string]>,
  ) {
    const old = s.attachments[id] || {
      image: "",
      division: "",
      important: false,
    };
    update({
      ...s,
      attachments: { ...s.attachments, [id]: { ...old, ...patch } },
    });
  }
  function questionEdit(
    q: PaperItem,
    patch: Partial<PaperSettings["edits"][string]>,
  ) {
    update({
      ...s,
      edits: {
        ...s.edits,
        [q.id]: {
          ...{
            text: q.text,
            options: q.options,
            stimulus: q.stimulus,
            subQuestions: q.subQuestions,
          },
          ...s.edits[q.id],
          ...patch,
        },
      },
    });
  }
  const printCleanup = useRef<(() => void) | null>(null);
  useEffect(() => () => printCleanup.current?.(), []);
  async function print(mode: "normal" | "booklet" = "normal") {
    try {
      const access = english
        ? {
            ok: !!(await loadEnglishPaper(english.key)),
            error: "এই draft-এ প্রবেশাধিকার নেই।",
          }
        : purchased
          ? await checkPurchasedPaperAccess(purchased.id)
          : await checkQuestionAccess(data.map((q) => q.id));
      if (!access.ok) {
        setActionMessage(access.error);
        return;
      }
    } catch {
      setActionMessage("Payment যাচাই হয়নি। আবার চেষ্টা করুন।");
      return;
    }
    // Never let a cancelled/stale booklet session affect a normal PDF.
    printCleanup.current?.();
    setOpen(false);
    await document.fonts.ready;
    await Promise.all(
      Array.from(
        document.querySelectorAll<HTMLImageElement>(".paper-sheet img"),
      ).map((img) => img.decode().catch(() => {})),
    );
    await new Promise((resolve) => setTimeout(resolve, 150));
    if (mode === "normal" && s.cfg.orientation !== "landscape") {
      window.print();
      return;
    }
    const sheets = Array.from(
      document.querySelectorAll<HTMLElement>("#paper .paper-sheet"),
    );
    if (!sheets.length) return;
    const output = document.createElement("div");
    output.className = "booklet-output";
    const [w, h] = paperDimensions(s),
      sw = Math.max(w, h),
      sh = Math.min(w, h),
      scale =
        s.cfg.orientation === "landscape" ? 1 : Math.min(sw / 2 / w, sh / h);
    // Do not clip an oversized image/question inside a folded half-sheet.
    if (
      s.cfg.orientation === "landscape" &&
      sheets.some(
        (sheet) =>
          Math.max(sheet.offsetHeight, sheet.scrollHeight) >
            (sh * 96) / 25.4 + 3 || sheet.scrollWidth > sheet.clientWidth + 3,
      )
    ) {
      setActionMessage(
        "বুকলেটের অর্ধপৃষ্ঠায় কিছু লেখা/ছবি ধরছে না। ফন্ট, মার্জিন বা ছবির আকার কমিয়ে আবার চেষ্টা করুন; কোনো প্রশ্ন কেটে প্রিন্ট করা হয়নি।",
      );
      return;
    }
    for (const side of bookletOrder(sheets.length)) {
      const row = document.createElement("div");
      row.className = "booklet-imposed";
      row.style.cssText = `width:${sw}mm;height:${sh}mm;display:flex;overflow:hidden;`;
      for (const index of side) {
        const cell = document.createElement("div");
        cell.style.cssText = `width:${sw / 2}mm;height:${sh}mm;overflow:hidden;display:flex;justify-content:center;align-items:center;`;
        if (index !== null) {
          const clone = sheets[index].cloneNode(true) as HTMLElement;
          clone
            .querySelectorAll("[data-noprint]")
            .forEach((node) => node.remove());
          clone.style.zoom = String(scale);
          clone.style.flexShrink = "0";
          cell.append(clone);
        }
        row.append(cell);
      }
      output.append(row);
    }
    const printStyle = document.createElement("style");
    printStyle.textContent = `@media print { @page {size:${sw}mm ${sh}mm;margin:0} body.booklet-print main,body.booklet-print header,body.booklet-print footer,body.booklet-print nav,body.booklet-print [data-noprint]{display:none!important} body.booklet-print .booklet-output{display:block!important} .booklet-imposed{break-after:page!important}.booklet-imposed:last-child{break-after:auto!important}.booklet-imposed .paper-sheet{break-after:auto!important;page-break-after:auto!important;} }`;
    const cleanup = () => {
      output.remove();
      printStyle.remove();
      document.body.classList.remove("booklet-print");
      window.removeEventListener("afterprint", cleanup);
      if (printCleanup.current === cleanup) printCleanup.current = null;
    };
    document.body.append(output, printStyle);
    document.body.classList.add("booklet-print");
    printCleanup.current = cleanup;
    window.addEventListener("afterprint", cleanup);
    window.print();
  }
  const enriched = {
    ...s,
    info: s.header.enabled
      ? s.info
      : {
          ...s.info,
          cls:
            s.info.cls ||
            Array.from(
              new Set(data.map((q) => q.category).filter(Boolean)),
            ).join(", "),
          subject:
            s.info.subject ||
            Array.from(
              new Set(data.map((q) => q.subject).filter(Boolean)),
            ).join(", "),
          chapter:
            s.info.chapter ||
            Array.from(new Set(data.map((q) => q.topic).filter(Boolean))).join(
              ", ",
            ),
        },
  };
  const [pw, ph] = paperDimensions(s);
  const style = `@page { size: ${pw}mm ${ph}mm; margin: 0; }`;
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() =>
      setPreviewScale(
        Math.min(1, Math.max(0.1, (el.clientWidth - 8) / ((pw * 96) / 25.4))),
      ),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [pw, loading, items.length]);
  const field = (
    key: keyof PaperSettings["info"],
    label: string,
    placeholder: string,
    large = false,
  ) => (
    <label key={key} className={large ? "block sm:col-span-2" : "block"}>
      <span className="mb-1 block text-xs font-medium text-slate-500">
        {label}
      </span>
      <input
        aria-label={label}
        className={`${input} ${large ? "text-center !text-xl font-bold" : ""}`}
        value={s.info[key]}
        placeholder={placeholder}
        onChange={(e) => info(key, e.target.value)}
      />
    </label>
  );
  function sections(setName: string) {
    const base = s.seed + (setName === "খ" ? 7919 : 0);
    const types = PAPER_SECTION_ORDER;
    const parts =
      autoModelSections(data, s) ??
      types
        .flatMap((type) => {
          const selected = shuffled(
            data.filter((q) => questionType(q) === type),
            base,
          );
          const groups =
            type === "CQ"
              ? cqDivisionGroups(s.show.divisions, division, divisions)
              : [""];
          return groups.map((group) => {
            const qs = selected.filter(
              (q) =>
                !group ||
                (s.attachments[q.id]?.division || q.topic || "সাধারণ বিভাগ") ===
                  group,
            );
            if (!qs.length) return null;
            const views: PreviewQuestion[] = qs.map((q, i) => {
              const opts = shuffled(
                Object.entries(q.options || {}).filter(
                  (entry): entry is [string, string] =>
                    typeof entry[1] === "string",
                ),
                base ? base + i + 1 : 0,
              );
              return {
                q,
                opts,
                ci: opts.findIndex(([key]) => key === q.correct),
              };
            });
            return {
              type,
              title: english
                ? "English Question Paper"
                : paperSectionTitle(type, s.info.section, group),
              questions: views,
            };
          });
        })
        .filter((section) => section !== null);
    if (!parts.length) return null;
    // Preserve the mature single-section layout; mixed papers share one pagination pass.
    return (
      <div
        id={
          parts.length === 1 && setName === (s.show.autoSet ? "ক" : s.setName)
            ? `paper-section-${parts[0].type}`
            : undefined
        }
      >
        <PaperPreview
          s={enriched}
          defaultHeaderValues={resolveDefaultHeader(s, data)}
          defaultHeaderEditor={
            !purchased && setName === (s.show.autoSet ? "ক" : s.setName) ? (
              <DefaultHeaderEditor
                settings={s}
                items={data}
                editRequest={headerEditRequest}
                update={update}
                onSave={saveDefaultHeader}
                storageError={storageError}
              />
            ) : undefined
          }
          questions={parts[0].questions}
          type={parts[0].type}
          title={parts[0].title}
          sections={s.autoModel || parts.length > 1 ? parts : undefined}
          setName={setName}
          duplicate={duplicates}
          onQuestionAction={edit ? questionAction : undefined}
          inlineEdit={inline}
          previewScale={previewScale}
          onImageSize={(id, size) => attachment(id, { size })}
        />
      </div>
    );
  }
  if (loading) return <p className="py-12 text-center">প্রশ্নপত্র প্রস্তুত হচ্ছে…</p>;
  if (error)
    return (
      <div role="alert" className="rounded-xl bg-red-50 p-6 text-red-800">
        {error}
        <button
          onClick={() => window.location.reload()}
          className="ml-3 underline"
        >
          আবার চেষ্টা করুন
        </button>
      </div>
    );
  if (!items.length)
    return (
      <div className="rounded-2xl border bg-white px-6 py-16 text-center">
        <h2 className="text-xl font-bold">আপনার প্রশ্নপত্র তৈরি করুন</h2>
        <p className="my-3 text-slate-500">
          প্রথমে প্রশ্ন নির্বাচন করুন, তারপর হেডার ও পেজ সাজান।
        </p>
        <Link
          href="/question-builder"
          className="inline-flex rounded-xl bg-emerald-500 px-5 py-3 font-bold text-white"
        >
          + প্রশ্ন বাছাই করুন
        </Link>
      </div>
    );
  return (
    <div className="paper-builder-root">
      {!purchased && !english && <WalletCheckout ids={data.map((q) => q.id)} />}
      <style>{style}</style>
      {s.autoModel && autoModelIssues(data, s).length > 0 && (
        <aside
          data-noprint
          role="alert"
          className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"
        >
          <b>সম্পাদিত মডেলের কাঠামো বদলেছে</b>
          <ul>
            {autoModelIssues(data, s).map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
          <p>
            এটি এখন কাস্টম খসড়া; পূর্ণ practice model হিসেবে ব্যবহার করার আগে
            প্রশ্নসংখ্যা মিলিয়ে নিন।
          </p>
        </aside>
      )}
      {missingCount > 0 && (
        <p
          role="alert"
          data-noprint
          className="mb-3 rounded-xl bg-amber-50 p-3 text-amber-900"
        >
          নির্বাচিত {missingCount}টি প্রশ্ন লোড হয়নি বা এখন ব্যবহারযোগ্য নয়। আবার
          প্রশ্ন বাছাই করুন।
        </p>
      )}
      {s.show.divisions && division && divisions.includes(division) && (
        <p
          data-noprint
          role="status"
          className="mb-3 rounded-xl bg-amber-50 p-3 text-amber-900"
        >
          CQ বিভাগ ফিল্টার সক্রিয়: {division}। সব সৃজনশীল প্রশ্ন দেখতে বিভাগ থেকে “সব
          বিভাগ” নির্বাচন করুন।
        </p>
      )}
      <nav
        data-noprint
        aria-label="প্রশ্নপত্রের অংশ"
        className="mb-4 flex flex-wrap gap-2"
      >
        {PAPER_SECTION_ORDER.filter((type) => counts[type] > 0).map((type) => (
          <button
            key={type}
            className="rounded-xl border px-3 py-2"
            onClick={() =>
              document
                .getElementById(`paper-section-${type}`)
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          >
            {type === "SHORT" ? "SQ" : type} ({counts[type]}) — অংশ দেখুন
          </button>
        ))}
        <p className="w-full text-sm text-slate-500">
          সব নির্বাচিত অংশ ধারাবাহিকভাবে আছে: MCQ → CQ → SQ। অংশ দেখতে উপরের
          বাটনে চাপুন।
        </p>
      </nav>
      <div
        data-noprint
        className="mb-5 flex flex-wrap items-center justify-between gap-3"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Question paper studio
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            আপনার প্রশ্নপত্র, আপনার মতো
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {items.length}টি প্রশ্ন · {s.cfg.paper} · প্রিন্ট-রেডি প্রিভিউ
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-3 font-semibold lg:hidden"
          >
            <Settings2 size={18} /> সেটিংস
          </button>
          <button
            onClick={() => void print("normal")}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-bold text-white"
          >
            <Download size={18} /> ডাউনলোড
          </button>
          {s.cfg.booklet && (
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "এটি সাধারণ PDF নয়: প্রতি পাশে ২টি ছোট পৃষ্ঠা ও প্রয়োজনে ফাঁকা পৃষ্ঠা থাকবে। প্রিন্টে Landscape ও short-edge flip বেছে নিন। বুকলেট তৈরি করবেন?",
                  )
                )
                  void print("booklet");
              }}
              className="rounded-xl border border-amber-500 bg-amber-50 px-4 py-3 font-bold text-amber-900"
            >
              বুকলেট প্রিন্ট (২ পৃষ্ঠা/পাশ)
            </button>
          )}
        </div>
      </div>
      {storageError && (
        <p
          data-noprint
          role="alert"
          className="mb-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800"
        >
          ব্রাউজারের স্টোরেজে সেটিংস রাখা যায়নি। সেভ করার আগে স্টোরেজের অনুমতি/খালি
          জায়গা পরীক্ষা করুন।
        </p>
      )}
      <div className="grid items-start gap-6 lg:grid-cols-[310px_minmax(0,1fr)]">
        <PaperSettingsPanel
          settings={s}
          update={update}
          edit={edit}
          setEdit={setEdit}
          open={open}
          onClose={close}
          counts={counts}
          supportHref={supportHref}
          tutorialHref={tutorialHref}
          onPrint={() => void print("normal")}
          onUndo={undo}
          onRedo={redo}
          canUndo={history.current.past.length > 0}
          canRedo={history.current.future.length > 0}
        />
        <div className="min-w-0">
          <div
            data-noprint
            className="studio-toolbar mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2"
          >
            <span className="text-xs font-bold">সম্পূর্ণ প্রশ্নপত্র:</span>
            {(
              [
                ["bold", "B"],
                ["italic", "I"],
                ["underline", "U"],
                ["strike", "S"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                aria-label={`${key} প্রশ্নপত্র`}
                aria-pressed={s.cfg[key]}
                className="studio-choice"
                onClick={() =>
                  update({ ...s, cfg: { ...s.cfg, [key]: !s.cfg[key] } })
                }
              >
                {label}
              </button>
            ))}
            <label className="text-xs">
              রং{" "}
              <input
                aria-label="প্রশ্নের রং"
                type="color"
                value={s.cfg.ink}
                onChange={(e) =>
                  update({ ...s, cfg: { ...s.cfg, ink: e.target.value } })
                }
              />
            </label>
            <button
              className="studio-choice"
              disabled={!history.current.past.length}
              onClick={undo}
            >
              ↶
            </button>
            <button
              className="studio-choice"
              disabled={!history.current.future.length}
              onClick={redo}
            >
              ↷
            </button>
          </div>
          {(actionMessage || exchanging) && (
            <p
              data-noprint
              role="status"
              className="mb-3 rounded-xl bg-blue-50 p-3 text-sm"
            >
              {exchanging ? "বিকল্প প্রশ্ন খোঁজা হচ্ছে…" : actionMessage}
            </p>
          )}
          {alternatives && (
            <section
              ref={alternativesRef}
              data-noprint
              aria-label="সম্পর্কিত বিকল্প প্রশ্ন"
              className="mb-4 rounded-xl border border-emerald-200 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-bold">সম্পর্কিত বিকল্প — আপনি বাছুন</h2>
                <button
                  type="button"
                  onClick={() => {
                    setAlternatives(null);
                    setCheckoutAlternative("");
                  }}
                >
                  বন্ধ করুন
                </button>
              </div>
              <p className="text-xs">
                একই বিষয়, অধ্যায় ও ধরন। নির্বাচন না করা পর্যন্ত বর্তমান প্রশ্ন বদলাবে
                না।
              </p>
              <div className="mt-2 grid gap-3 md:grid-cols-2">
                {alternatives.choices.map((candidate) => (
                  <article key={candidate.id} className="rounded border p-3">
                    <b>{candidate.label}</b>
                    <p className="text-xs">
                      {candidate.subject} · {candidate.topic} · {candidate.type}
                    </p>
                    {candidate.item ? (
                      <>
                        <RichPaperText
                          text={candidate.item.stimulus || candidate.item.text}
                        />
                        {candidate.item.subQuestions &&
                          Object.entries(candidate.item.subQuestions).map(
                            ([key, val]) => (
                              <p key={key}>
                                {key}) <RichPaperText text={val} />
                              </p>
                            ),
                          )}
                        {candidate.item.type === "MCQ" &&
                          Object.entries(candidate.item.options || {}).map(
                            ([key, val]) => (
                              <p key={key}>
                                {key}) <RichPaperText text={val} />
                              </p>
                            ),
                          )}
                        <button
                          type="button"
                          className="studio-choice"
                          onClick={() =>
                            chooseAlternative(
                              alternatives.originalId,
                              candidate.item!,
                            )
                          }
                        >
                          এই প্রশ্নটি নিন
                        </button>
                      </>
                    ) : (
                      <>
                        <p>
                          সম্পূর্ণ প্রশ্ন দেখতে আগে ব্যবহারাধিকার/checkout প্রয়োজন।
                        </p>
                        <button
                          type="button"
                          className="studio-choice"
                          onClick={() => setCheckoutAlternative(candidate.id)}
                        >
                          মূল্য ও Checkout দেখুন
                        </button>
                      </>
                    )}
                  </article>
                ))}
              </div>
              {checkoutAlternative && (
                <div>
                  <WalletCheckout
                    key={checkoutAlternative}
                    ids={[checkoutAlternative]}
                  />
                  <button
                    type="button"
                    disabled={exchanging}
                    className="studio-choice"
                    onClick={() =>
                      questionAction(alternatives.originalId, "exchange")
                    }
                  >
                    Checkout শেষে বিকল্পগুলো আবার দেখুন
                  </button>
                </div>
              )}
            </section>
          )}
          <HeaderManager settings={s} update={update} />
          <details
            data-noprint
            className="mb-5 rounded-xl border border-slate-200 bg-white p-3"
          >
            <summary className="cursor-pointer text-sm font-semibold">
              Page Setup ও অতিরিক্ত সেটিংস
            </summary>
            <section
              data-noprint
              className="mb-5 rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold text-slate-900">Page Setup ও হেডার</h2>
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                  স্বয়ংক্রিয় সংরক্ষণ
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {field(
                  "inst",
                  "স্কুল / প্রতিষ্ঠানের নাম",
                  "আপনার প্রতিষ্ঠানের নাম",
                  true,
                )}
                {field(
                  "exam",
                  "পরীক্ষা / প্রোগ্রামের নাম",
                  "যেমন: অর্ধবার্ষিক পরীক্ষা",
                )}
                {field("cls", "শ্রেণি", "নবম/দশম")}
                {field("subject", "বিষয়", "গণিত")}
                {field("chapter", "অধ্যায় / টপিক", "অধ্যায় ১ – বাস্তব সংখ্যা")}
                {field(
                  "minutes",
                  "সময় (মিনিট বা পূর্ণ বিবরণ)",
                  "যেমন: ৩০ মিনিট / ১ ঘণ্টা ১৫ মিনিট",
                )}
                {field("marks", "পূর্ণমান", "১০০")}
                {field("section", "MCQ অংশের শিরোনাম", "বহুনির্বাচনি অংশ")}
                {field("code", "বিষয় কোড", "১০৯")}
                {s.show.address &&
                  field("address", "প্রতিষ্ঠানের ঠিকানা", "আপনার ঠিকানা")}
                {s.show.watermark && field("watermark", "জলছাপের লেখা", "খসড়া")}
                <label className="sm:col-span-2">
                  <span className="mb-1 block text-xs text-slate-500">
                    নির্দেশনা
                  </span>
                  <textarea
                    className={input}
                    aria-label="নির্দেশনা"
                    rows={2}
                    value={s.info.instr}
                    onChange={(e) => info("instr", e.target.value)}
                  />
                </label>
              </div>
            </section>
          </details>
          <div data-noprint className="mb-4 flex flex-wrap items-center gap-2">
            <Link
              href="/question-builder?append=1"
              className="inline-flex items-center gap-1 rounded-xl border bg-white px-3 py-2 text-sm"
            >
              <Plus size={16} /> আরও প্রশ্ন যুক্ত করুন
            </Link>
            {(["ক", "খ"] as const).map((name) => (
              <button
                key={name}
                aria-pressed={s.setName === name}
                onClick={() => {
                  const header = currentHeader(s);
                  header.fields.setCode.value = `সেট ${name}`;
                  update({ ...s, setName: name, header });
                }}
                className={`rounded-xl border px-4 py-2 text-sm ${s.setName === name ? "bg-slate-900 text-white" : "bg-white"}`}
              >
                সেট {name}
              </button>
            ))}
            <button
              onClick={() =>
                update({ ...s, seed: Math.floor(Math.random() * 999999) + 1 })
              }
              className="inline-flex items-center gap-1 rounded-xl border bg-white px-3 py-2 text-sm"
            >
              <Shuffle size={15} /> এলোমেলো
            </button>
            {!purchased && s.header.enabled && (
              <button
                data-default-header-restore
                type="button"
                onClick={() => update(withDefaultHeader(s, true))}
                className="qm-action-link"
              >
                ডিফল্ট হেডারে ফিরুন
              </button>
            )}
            {!purchased && !s.header.enabled && (
              <button
                type="button"
                onClick={() => requestHeaderEdit((v) => v + 1)}
                className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900"
              >
                ডিফল্ট হেডার এডিট করুন
              </button>
            )}
            {s.seed > 0 && (
              <button
                onClick={() => update({ ...s, seed: 0 })}
                className="text-sm underline"
              >
                ক্রম রিসেট
              </button>
            )}
          </div>
          {s.show.duplicates && duplicates.size > 0 && (
            <p
              data-noprint
              className="mb-3 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800"
            >
              <AlertCircle size={16} />
              {duplicates.size}টি পুনরাবৃত্ত প্রশ্ন চিহ্নিত হয়েছে।
            </p>
          )}
          <div
            className={`paper-preview-scroll ${s.cfg.format === "ans" ? "paper-answer-only" : ""}`}
            ref={previewRef}
            id="paper"
          >
            {s.show.answerSheet && (
              <div
                className="paper-page-viewport"
                style={{ zoom: previewScale }}
              >
                <div
                  className="paper-sheet"
                  style={{
                    width: `${pw}mm`,
                    minHeight: `${ph}mm`,
                    padding: `${s.cfg.marginTop}px ${s.cfg.marginRight}px ${s.cfg.marginBottom}px ${s.cfg.marginLeft}px`,
                  }}
                >
                  <h2 className="mb-5 text-center text-xl font-bold">
                    উত্তরপত্র
                  </h2>
                  <p>
                    নাম: ..................................... রোল:
                    ..................
                  </p>
                  <div
                    style={{
                      height: `${Math.max(100, (ph * 96) / 25.4 - s.cfg.marginTop - s.cfg.marginBottom - 100)}px`,
                      backgroundImage:
                        "repeating-linear-gradient(transparent,transparent 29px,#ccc 29px,#ccc 30px)",
                    }}
                  />
                </div>
              </div>
            )}
            {(s.show.autoSet ? ["ক", "খ"] : [s.setName]).map((name) => (
              <div key={name}>{sections(name)}</div>
            ))}
          </div>
          <p
            data-noprint
            className="mt-4 text-xs leading-relaxed text-slate-500"
          >
            PDF পেতে Print → Save as PDF বেছে নিন। Paper size: {s.cfg.paper},
            scale: 100%, margins: None, browser headers/footers: Off।
          </p>
        </div>
      </div>
    </div>
  );
}
