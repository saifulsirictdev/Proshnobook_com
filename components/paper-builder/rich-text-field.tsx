"use client";
import { paperFontLabels } from "@/lib/paper-fonts";
import { useRef, useState, useEffect } from "react";
export default function RichTextField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [toolbar, setToolbar] = useState(false);
  useEffect(() => () => clearTimeout(timer.current), []);
  function reveal() {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToolbar(true), 450);
  }
  function format(tag: string) {
    const node = ref.current;
    if (!node) return;
    const start = node.selectionStart,
      end = node.selectionEnd;
    if (start === end) {
      node.focus();
      return;
    }
    const opening = `[${tag}]`,
      closing = `[/${tag.split("=")[0]}]`;
    onChange(
      value.slice(0, start) +
        opening +
        value.slice(start, end) +
        closing +
        value.slice(end),
    );
    requestAnimationFrame(() => {
      node.focus();
      node.setSelectionRange(start + opening.length, end + opening.length);
    });
  }
  function lines(mode: "bullet" | "number" | "indent" | "outdent") {
    const node = ref.current;
    if (!node) return;
    const start = value.lastIndexOf("\n", node.selectionStart - 1) + 1;
    const after = value.indexOf("\n", node.selectionEnd);
    const end = after < 0 ? value.length : after;
    const text = value
      .slice(start, end)
      .split("\n")
      .map((line, i) =>
        mode === "bullet"
          ? `• ${line}`
          : mode === "number"
            ? `${i + 1}. ${line}`
            : mode === "indent"
              ? `    ${line}`
              : line.replace(/^ {1,4}/, ""),
      )
      .join("\n");
    onChange(value.slice(0, start) + text + value.slice(end));
    requestAnimationFrame(() => node.focus());
  }
  return (
    <div
      ref={root}
      className="paper-rich-field relative rounded-lg border border-emerald-200 bg-white p-2"
      onFocus={reveal}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          clearTimeout(timer.current);
          setToolbar(false);
        }
      }}
    >
      <div
        data-noprint
        hidden={!toolbar}
        role="toolbar"
        aria-label={`${label} ফরম্যাটিং`}
        className="paper-floating-toolbar sticky top-0 z-20 mb-2 flex flex-wrap gap-1 rounded border bg-white p-2 shadow-lg"
        style={{ display: toolbar ? "flex" : "none" }}
      >
        {(["b", "i", "u", "s"] as const).map((tag) => (
          <button
            type="button"
            key={tag}
            className="studio-choice"
            aria-label={`${label}: ${tag}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => format(tag)}
          >
            {tag.toUpperCase()}
          </button>
        ))}
        <select
          aria-label={`${label}: Font`}
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) format(`font=${e.target.value}`);
            e.target.value = "";
          }}
        >
          <option value="" disabled>
            Font
          </option>
          {Object.entries(paperFontLabels).map(([key, name]) => (
            <option key={key} value={key}>
              {name}
            </option>
          ))}
        </select>
        <select
          aria-label={`${label}: Font size`}
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) format(`size=${e.target.value}`);
            e.target.value = "";
          }}
        >
          <option value="" disabled>
            Size
          </option>
          {[10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 60].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <input
          type="color"
          aria-label={`${label}: Color`}
          defaultValue="#111111"
          onChange={(e) => format(`color=${e.target.value}`)}
        />
        <select
          aria-label={`${label}: Alignment`}
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) format(`align=${e.target.value}`);
            e.target.value = "";
          }}
        >
          <option value="" disabled>
            Align
          </option>
          {["left", "center", "right", "justify"].map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="studio-choice"
          onClick={() => lines("bullet")}
        >
          • তালিকা
        </button>
        <button
          type="button"
          className="studio-choice"
          onClick={() => lines("number")}
        >
          ১. তালিকা
        </button>
        <button
          type="button"
          className="studio-choice"
          onClick={() => lines("indent")}
        >
          →
        </button>
        <button
          type="button"
          className="studio-choice"
          onClick={() => lines("outdent")}
        >
          ←
        </button>
      </div>
      <textarea
        ref={ref}
        aria-label={label}
        className="w-full rounded border border-slate-200 p-2 text-sm"
        rows={3}
        maxLength={10000}
        value={value}
        onSelect={reveal}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-[10px] text-slate-500">
        শব্দ নির্বাচন করে B/I/U/S চাপুন। চিহ্নগুলো প্রিভিউ/প্রিন্টে ফরম্যাট
        হিসেবে দেখাবে।
      </p>
    </div>
  );
}
