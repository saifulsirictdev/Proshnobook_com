/** Shared by body text, headers, editable fields and print. */
export const paperFonts = {
  kalpurush: '"QmPaperKalpurush", var(--font-en), serif',
  adorsho: "var(--font-bn), var(--font-en), serif",
  hind: "var(--qk-body), sans-serif",
  anek: "var(--qk-head), sans-serif",
  serif: "var(--font-en), var(--font-bn), serif",
} as const;
export type PaperFont = keyof typeof paperFonts;
export const paperFontLabels: Record<PaperFont, string> = {
  kalpurush: "কালপুরুষ",
  adorsho: "আদর্শলিপি",
  hind: "হিন্দ শিলিগুড়ি",
  anek: "অনেক বাংলা",
  serif: "Serif",
};
