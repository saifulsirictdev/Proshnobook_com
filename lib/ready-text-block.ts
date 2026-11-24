import type { PageEdit } from "./ready-papers";
export type RasterBox = { x: number; y: number; w: number; h: number };
export type ReadyTextStyle = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  align?: "left" | "center" | "right";
};
/** Wrap using measured glyphs, retaining explicit paragraph breaks and never shrinking text horizontally. */
export function wrapReadyText(
  text: string,
  width: number,
  measure: (s: string) => number,
): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const word of paragraph.split(/(\s+)/)) {
      if (measure(line + word) <= width) {
        line += word;
        continue;
      }
      if (line.trim()) {
        lines.push(line.trimEnd());
        line = "";
      }
      if (measure(word) <= width) {
        line = word.trimStart();
        continue;
      }
      // Segment graphemes, not code points: Bengali conjuncts must stay intact.
      for (const { segment } of new Intl.Segmenter("bn", {
        granularity: "grapheme",
      }).segment(word)) {
        if (line && measure(line + segment) > width) {
          lines.push(line);
          line = "";
        }
        line += segment;
      }
    }
    lines.push(line.trimEnd());
  }
  return lines;
}
export function drawReadyText(
  ctx: CanvasRenderingContext2D,
  t: PageEdit["texts"][number],
  width: number,
  height: number,
  fontFamily: string,
) {
  const style = t.style || {};
  const size = (t.size * width) / 800;
  ctx.save();
  ctx.fillStyle = style.color || "#111111";
  ctx.font = `${style.italic ? "italic " : ""}${style.bold ? "bold " : ""}${size}px ${fontFamily}`;
  ctx.textBaseline = "top";
  const w = (t.w ?? 1 - t.x) * width;
  const lines = wrapReadyText(t.text, w, (s) => ctx.measureText(s).width);
  const lineHeight = size * 1.45;
  if (t.h && lines.length * lineHeight > t.h * height) {
    ctx.restore();
    throw Error(
      "বদলানো লেখাটি নির্বাচিত অংশে ধরছে না। ফন্ট ছোট করুন, লেখা কমান অথবা বড় অংশ বাছুন।",
    );
  }
  lines.forEach((line, i) => {
    const measured = ctx.measureText(line).width;
    const x =
      t.x * width +
      (style.align === "center"
        ? (w - measured) / 2
        : style.align === "right"
          ? w - measured
          : 0);
    const y = t.y * height + i * lineHeight;
    ctx.fillText(line, x, y);
    if (style.underline) {
      ctx.fillRect(x, y + size * 1.15, measured, Math.max(1, size / 18));
    }
  });
  ctx.restore();
}
