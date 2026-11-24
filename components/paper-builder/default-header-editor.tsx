"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  automaticDefaultHeader,
  defaultHeaderKeys,
  resolveDefaultHeader,
  usesDefaultHeader,
  withDefaultHeader,
  type DefaultHeaderKey,
  type DefaultHeaderValues,
} from "@/lib/default-paper-header";
import type { PaperItem, PaperSettings } from "@/lib/paper-builder";
import DefaultHeaderPreview, {
  defaultHeaderLabels,
} from "./default-header-preview";

function InlineField({
  name,
  value,
  onChange,
  focus,
}: {
  name: DefaultHeaderKey;
  value: string;
  onChange: (value: string) => void;
  focus: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (el) {
      el.style.height = "0px";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [value]);
  useLayoutEffect(() => {
    if (focus) ref.current?.focus();
  }, []);
  return (
    <textarea
      ref={ref}
      rows={1}
      maxLength={2000}
      aria-label={defaultHeaderLabels[name]}
      className="default-header-inline-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
export default function DefaultHeaderEditor({
  settings: s,
  items,
  onSave,
  update,
  storageError = false,
  editRequest = 0,
}: {
  settings: PaperSettings;
  items: PaperItem[];
  onSave: (s: PaperSettings) => Promise<{ ok: boolean; error?: string }>;
  update: (s: PaperSettings) => void;
  storageError?: boolean;
  editRequest?: number;
}) {
  const [editing, setEditing] = useState(false),
    [overrides, setOverrides] = useState<Partial<DefaultHeaderValues>>({}),
    [focus, setFocus] = useState<DefaultHeaderKey>("institute"),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const saving = useRef(false);
  const section = useRef<HTMLElement>(null);
  const handledEditRequest = useRef(0);
  useEffect(() => {
    if (editRequest <= handledEditRequest.current) return;
    handledEditRequest.current = editRequest;
    if (usesDefaultHeader(s)) {
      edit("institute");
      section.current?.scrollIntoView({ block: "nearest", behavior: "auto" });
    }
  }, [editRequest]);
  const active = usesDefaultHeader(s),
    automatic = automaticDefaultHeader(s, items);
  useEffect(() => {
    if (!active) {
      setEditing(false);
      setMessage("");
    }
  }, [active]);
  const values = editing
    ? { ...automatic, ...overrides }
    : resolveDefaultHeader(s, items);
  function edit(key: DefaultHeaderKey) {
    setOverrides({ ...s.defaultHeader?.overrides });
    setFocus(key);
    setEditing(true);
    setMessage("");
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (saving.current) return;
    saving.current = true;
    setBusy(true);
    setMessage("");
    try {
      const next = {
        ...withDefaultHeader(s, true),
        defaultHeader: { enabled: true, overrides },
      };
      const result = await onSave(next);
      if (result.ok) {
        setEditing(false);
        setMessage("ডিফল্ট হেডার সেভ হয়েছে।");
      } else setMessage(result.error || "হেডার সেভ হয়নি। আবার চেষ্টা করুন।");
    } catch {
      setMessage("হেডার সেভ নিশ্চিত হয়নি। আবার চেষ্টা করুন।");
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }
  if (!active) return null;
  return (
    <section
      ref={section}
      className="default-header-editor"
      aria-label="ডিফল্ট হেডার সম্পাদনা"
    >
      <div data-noprint>
        <form
          onSubmit={save}
          onKeyDown={(e) => {
            if (e.key === "Escape" && !busy) {
              e.preventDefault();
              setEditing(false);
              setMessage("");
            }
          }}
        >
          <fieldset
            disabled={busy}
            className="min-w-0"
          >
            <DefaultHeaderPreview
              values={values}
              renderField={(key, value) =>
                editing ? (
                  <InlineField
                    name={key}
                    value={value}
                    focus={focus === key}
                    onChange={(text) =>
                      setOverrides((old) => ({ ...old, [key]: text }))
                    }
                  />
                ) : (
                  <button
                    type="button"
                    aria-label={`${defaultHeaderLabels[key]} সম্পাদনা করুন`}
                    className="default-header-inline-button"
                    onClick={() => edit(key)}
                  >
                    {value || "(খালি)"}
                  </button>
                )
              }
            />
          </fieldset>
          {editing && (
            <div className="default-header-actions space-y-3" data-noprint>
              <div
                className="flex flex-wrap gap-2"
                aria-label="স্বয়ংক্রিয় তথ্য পুনরুদ্ধার"
              >
                {defaultHeaderKeys.map((key) => (
                  <button
                    key={key}
                    type="button"
                    disabled={busy || overrides[key] === undefined}
                    className="rounded border px-2 py-1 text-xs disabled:opacity-40"
                    onClick={() =>
                      setOverrides((old) => {
                        const next = { ...old };
                        delete next[key];
                        return next;
                      })
                    }
                  >
                    {defaultHeaderLabels[key]}:{" "}
                    {overrides[key] === undefined ? "অটো" : "অটোতে ফিরুন"}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500">
                শ্রেণি ও বিষয় নির্বাচিত প্রশ্ন থেকে আসে। সময় Page Setup থেকে;
                পূর্ণমান সেখান থেকে বা নির্বাচিত প্রশ্নের নম্বর অনুযায়ী আসে। নিজে
                লিখলে সেটিই থাকবে, অটোতে ফিরলে পরের নির্বাচন অনুসরণ করবে।
              </p>
              <div className="flex gap-2">
                <button
                  disabled={busy}
                  className="rounded-lg bg-emerald-700 px-4 py-2 text-sm text-white"
                >
                  {busy ? "সেভ হচ্ছে…" : "ডিফল্ট হেডার সেভ করুন"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  className="rounded-lg border px-4 py-2 text-sm"
                  onClick={() => {
                    setEditing(false);
                    setMessage("");
                  }}
                >
                  বাতিল
                </button>
              </div>
            </div>
          )}
        </form>
        {message && (
          <p role="status" className="default-header-message text-sm" data-noprint>
            {message}
          </p>
        )}
        {storageError && (
          <p role="alert" className="default-header-message text-sm text-red-700" data-noprint>
            ব্রাউজারে পরিবর্তন সেভ হয়নি। স্টোরেজ পরীক্ষা করে আবার সেভ করুন।
          </p>
        )}
      </div>
      <div className="default-header-print-only" aria-hidden="true">
        <DefaultHeaderPreview values={resolveDefaultHeader(s, items)} />
      </div>
    </section>
  );
}
