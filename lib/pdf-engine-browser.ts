/** One versioned, same-origin ESM engine/worker pair for every browser PDF reader. */
export const PDF_ASSET_BASE = "/vendor/pdfjs/4.10.38";
let engine: Promise<any> | undefined;
export function loadBrowserPdfEngine(): Promise<any> {
  if (typeof window === "undefined")
    return Promise.reject(Error("PDF engine শুধু browser-এ চালানো যাবে।"));
  if (!engine) {
    const moduleUrl = `${PDF_ASSET_BASE}/pdf.min.mjs`;
    engine = import(/* webpackIgnore: true */ moduleUrl)
      .then((pdfjs) => {
        pdfjs.GlobalWorkerOptions.workerSrc = `${PDF_ASSET_BASE}/pdf.worker.min.mjs`;
        return pdfjs;
      })
      .catch((error) => {
        engine = undefined;
        throw error;
      });
  }
  return engine;
}
