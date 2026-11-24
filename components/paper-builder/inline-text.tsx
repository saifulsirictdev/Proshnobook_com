"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import RichTextField from "./rich-text-field";
import type { PaperItem, PaperSettings } from "@/lib/paper-builder";
/** Shared click-to-edit contract between the sheet and the owning builder. */
export type InlineEditApi = {
  editable: boolean;
  /** Full stored value for a path; null when unresolvable (renders plain). */
  resolve: (q: PaperItem, path: string) => string | null;
  save: (q: PaperItem, path: string, value: string) => void;
  /** part=null edits the question total; otherwise a subpart key (k/kh/g/gh). */
  saveMarks: (q: PaperItem, part: string | null, value: number) => void;
  attachment: (
    id: string,
    patch: Partial<PaperSettings["attachments"][string]>,
  ) => void;
};
/** Click-to-edit on the actual sheet, mirroring the default-header inline flow.
    The display node keeps the paper's own typography; the editor is print-hidden. */
export default function InlineText({
  value,
  onSave,
  editable,
  label,
  children,
  numeric = false,
  mini = false,
}: {
  /** Full stored value; null means this field cannot be resolved here. */
  value: string | null;
  onSave: (next: string) => void;
  editable: boolean;
  label: string;
  children?: ReactNode;
  numeric?: boolean;
  /** Compact editor for float-right marks. */
  mini?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const field = useRef<HTMLTextAreaElement>(null);
  const number = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) (numeric ? number.current : field.current)?.focus();
  }, [open, numeric]);
  if (!editable || value === null) return <>{children ?? value}</>;
  if (!open)
    return (
      <span
        role="button"
        tabIndex={0}
        aria-label={`${label} — ক্লিক করে এডিট`}
        title="ক্লিক করে এডিট করুন"
        className="inline-edit-target"
        onClick={() => {
          setDraft(value);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setDraft(value);
            setOpen(true);
          }
        }}
      >
        {children ?? value}
      </span>
    );
  return (
    <span
      className={`inline-edit-box${mini ? " inline-edit-box--mini" : ""}`}
      data-noprint
      onClick={(event) => event.stopPropagation()}
    >
      {numeric ? (
        <input
          ref={number}
          aria-label={label}
          className="inline-edit-number"
          type="number"
          min={1}
          max={200}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") commit();
            if (event.key === "Escape") setOpen(false);
          }}
        />
      ) : (
        <RichTextField label={label} value={draft} onChange={setDraft} />
      )}
      <span className="inline-edit-actions">
        {/* Keep the rich toolbar from collapsing (blur) between mousedown/mouseup. */}
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={commit}
        >
          সেভ
        </button>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setOpen(false)}
        >
          বাতিল
        </button>
      </span>
    </span>
  );
  function commit() {
    const next = numeric
      ? String(Math.min(200, Math.max(1, Math.round(Number(draft) || 1))))
      : draft;
    if (next !== value) onSave(next);
    setOpen(false);
  }
}
