import type { PageItems, TextItem } from "./types";

// PDF থেকে প্রতিটি পৃষ্ঠার শব্দ ও অবস্থান (X, Y) বের করা
export async function extractPages(buffer: ArrayBuffer): Promise<PageItems[]> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const doc = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
    disableFontFace: true,
    isEvalSupported: false,
    useWorkerFetch: false,
  }).promise;

  try {
    if (doc.numPages > 100) throw Error("PDF সর্বোচ্চ ১০০ পৃষ্ঠা।");
    const pages: PageItems[] = [];

    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const vp = page.getViewport({ scale: 1 });
      const content = await page.getTextContent();

      const items: TextItem[] = content.items
        .filter((it: any) => typeof it.str === "string" && it.str.trim() !== "")
        .map((it: any) => ({
          str: it.str as string,
          x: it.transform[4] as number,
          y: (vp.height - it.transform[5]) as number,
          width: (it.width ?? 0) as number,
          height: (it.height ?? 0) as number,
        }));

      pages.push({ pageNumber: p, width: vp.width, height: vp.height, items });
    }

    return pages;
  } finally {
    await doc.destroy();
  }
}

/** Preserve PDF source order and line boundaries, matching the former pdf-parse renderer. */
export async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const pages = await extractPages(buffer);
  let text = "";
  for (const page of pages) {
    let lastY: number | undefined;
    text += "\n\n";
    for (const item of page.items) {
      if (lastY !== undefined && Math.abs(lastY - item.y) > 0.5) text += "\n";
      text += item.str;
      lastY = item.y;
      if (text.length > 200_000) throw Error("PDF text limit exceeded");
    }
  }
  return text;
}
