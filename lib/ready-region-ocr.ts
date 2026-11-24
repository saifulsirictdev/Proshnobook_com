import { renderEdited } from "./ready-paper-browser";
import type { PageEdit } from "./ready-papers";
import type { RasterBox } from "./ready-text-block";
/** Local, on-demand OCR of a user-selected region; never generates question content. */
export async function readReadyRegion(
  url: string,
  edit: PageEdit,
  box: RasterBox,
  signal: AbortSignal,
  progress: (s: string) => void,
) {
  if (signal.aborted) throw Error("OCR বাতিল হয়েছে।");
  const canvas = await renderEdited(url, {
    ...edit,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    masks: [],
    texts: [],
  });
  const crop = document.createElement("canvas");
  crop.width = Math.max(1, Math.round(box.w * canvas.width));
  crop.height = Math.max(1, Math.round(box.h * canvas.height));
  crop
    .getContext("2d")!
    .drawImage(
      canvas,
      box.x * canvas.width,
      box.y * canvas.height,
      box.w * canvas.width,
      box.h * canvas.height,
      0,
      0,
      crop.width,
      crop.height,
    );
  canvas.width = canvas.height = 0;
  const { createWorker } = await import("tesseract.js");
  let worker: Awaited<ReturnType<typeof createWorker>> | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let cancelled: boolean = signal.aborted;
  let rejectAbort: (error: Error) => void = () => {};
  const aborted = new Promise<never>((_, reject) => {
    rejectAbort = reject;
  });
  const stop = () => {
    cancelled = true;
    void worker?.terminate();
    rejectAbort(Error("OCR বাতিল হয়েছে।"));
  };
  signal.addEventListener("abort", stop, { once: true });
  try {
    return await Promise.race([
      (async () => {
        worker = await createWorker("ben+eng", 1, {
          workerPath: "/vendor/ocr/worker.min.js",
          corePath: "/vendor/ocr",
          langPath: "/vendor/ocr",
          workerBlobURL: false,
          logger: (m) => {
            if (!cancelled && !signal.aborted)
              progress(`OCR ${Math.round((m.progress || 0) * 100)}%`);
          },
        });
        if (cancelled || signal.aborted) {
          await worker.terminate();
          throw Error("OCR বাতিল হয়েছে।");
        }
        const { data } = await worker.recognize(crop);
        if (cancelled || signal.aborted) {
          await worker.terminate();
          throw Error("OCR বাতিল হয়েছে।");
        }
        if (!data.text.trim())
          throw Error("লেখা পড়া যায়নি। হাতে লিখুন বা অন্য অংশ বাছুন।");
        if (data.text.length > 10000)
          throw Error("অংশটি অনেক বড়। ছোট অংশ বাছুন।");
        return { text: data.text.trim(), confidence: data.confidence };
      })(),
      aborted,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          stop();
          reject(Error("OCR সময় শেষ। আবার চেষ্টা করুন।"));
        }, 120000);
      }),
    ]);
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", stop);
    await worker?.terminate();
    crop.width = crop.height = 0;
  }
}
