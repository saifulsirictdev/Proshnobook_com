import type { PaperSettings } from "./paper-builder";
/** Existing normal geometry is preserved. Narrow changes margins, not paper size. */
export const paperMarginPresets = {
  normal: { marginTop: 45, marginBottom: 45, marginLeft: 45, marginRight: 45 },
  narrow: { marginTop: 24, marginBottom: 24, marginLeft: 24, marginRight: 24 },
} as const;
export function paperMarginMode(
  cfg: PaperSettings["cfg"],
): "normal" | "narrow" | "custom" {
  for (const mode of ["normal", "narrow"] as const) {
    if (
      Object.entries(paperMarginPresets[mode]).every(
        ([key, value]) =>
          cfg[key as keyof typeof paperMarginPresets.normal] === value,
      )
    )
      return mode;
  }
  return "custom";
}
