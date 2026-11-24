"use client";
import { useRef, useState, useEffect } from "react";
import { paperFonts, paperFontLabels, type PaperFont } from "@/lib/paper-fonts";
import type { ReadyTextStyle } from "@/lib/ready-text-block";
export default function ReadyTextEditor({
  text,
  onText,
  size,
  onSize,
  font,
  onFont,
  style,
  onStyle,
}: {
  text: string;
  onText: (s: string) => void;
  size: number;
  onSize: (n: number) => void;
  font: PaperFont;
  onFont: (f: PaperFont) => void;
  style: ReadyTextStyle;
  onStyle: (s: ReadyTextStyle) => void;
}) {
  const [show, setShow] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <div
      data-noprint
      className="rp-text-editor"
      onFocus={() => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setShow(true), 450);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          clearTimeout(timer.current);
          setShow(false);
        }
      }}
    >
      {show && (
        <div
          role="toolbar"
          aria-label="লেখার Home ফরম্যাটিং"
          className="rp-toolbar rp-text-home"
        >
          <select
            aria-label="লেখার Font"
            value={font}
            onChange={(e) => onFont(e.target.value as PaperFont)}
          >
            {Object.entries(paperFontLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <input
            aria-label="লেখার Font size"
            type="number"
            min={10}
            max={60}
            value={size}
            onChange={(e) =>
              onSize(Math.min(60, Math.max(10, +e.target.value)))
            }
          />
          {(["bold", "italic", "underline"] as const).map((key, i) => (
            <button
              key={key}
              type="button"
              aria-label={key}
              aria-pressed={!!style[key]}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onStyle({ ...style, [key]: !style[key] })}
            >
              {["B", "I", "U"][i]}
            </button>
          ))}
          <input
            aria-label="লেখার Color"
            type="color"
            value={style.color || "#111111"}
            onChange={(e) => onStyle({ ...style, color: e.target.value })}
          />
          <select
            aria-label="লেখার Alignment"
            value={style.align || "left"}
            onChange={(e) =>
              onStyle({
                ...style,
                align: e.target.value as ReadyTextStyle["align"],
              })
            }
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      )}
      <label>
        নতুন / বদলানো সম্পূর্ণ লেখা
        <textarea
          aria-label="নতুন বা বদলানো প্রশ্নের লেখা"
          rows={6}
          maxLength={10000}
          value={text}
          onChange={(e) => onText(e.target.value)}
          style={{
            fontFamily: paperFonts[font],
            fontSize: size,
            fontWeight: style.bold ? 700 : 400,
            fontStyle: style.italic ? "italic" : "normal",
            textDecoration: style.underline ? "underline" : undefined,
            color: style.color,
            textAlign: style.align,
          }}
        />
      </label>
      <p className="rp-muted">এই ব্লকের সম্পূর্ণ লেখায় ফরম্যাট প্রযোজ্য।</p>
    </div>
  );
}
