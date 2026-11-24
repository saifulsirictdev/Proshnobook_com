import { paperFonts, type PaperFont } from "./paper-fonts";
/** Closed vocabulary only: no HTML, arbitrary attributes, URLs or CSS input. */
export function richFormatStyle(
  tag: string,
): Record<string, string | number> | null {
  if (tag === "b") return { fontWeight: 700 };
  if (tag === "i") return { fontStyle: "italic" };
  if (tag === "u") return { textDecoration: "underline" };
  if (tag === "s") return { textDecoration: "line-through" };
  if (tag.split("=").length !== 2) return null;
  const [key, value] = tag.split("=");
  if (key === "font" && Object.hasOwn(paperFonts, value))
    return { fontFamily: paperFonts[value as PaperFont] };
  if (key === "size" && /^(?:[89]|[1-5][0-9]|60)$/.test(value))
    return { fontSize: `${value}px` };
  if (key === "color" && /^#[a-f0-9]{6}$/i.test(value)) return { color: value };
  if (key === "align" && /^(left|center|right|justify)$/.test(value))
    return { display: "block", textAlign: value };
  return null;
}
export const richFormatSplit =
  /(\[(?:\/?[bius]|\/?(?:font|size|color|align)(?:=[^\]\n]{1,40})?)\])/g;
