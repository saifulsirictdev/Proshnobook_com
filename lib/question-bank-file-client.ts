import type { BankScope } from "./question-bank-batch";
import type {
  BankFileFormat,
  BankFileProgress,
  BankFileResult,
} from "./question-bank-large-file";
export function readBankFileInWorker(
  input:
    | { file: File; includeImages: boolean; scope: BankScope }
    | { text: string; format: BankFileFormat; scope: BankScope },
  onProgress: (value: BankFileProgress) => void,
  signal: AbortSignal,
): Promise<BankFileResult> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("বাতিল হয়েছে", "AbortError"));
      return;
    }
    const worker = new Worker(
      new URL("../workers/question-bank-file.worker.ts", import.meta.url),
      { type: "module" },
    );
    const finish = () => {
      signal.removeEventListener("abort", abort);
      worker.terminate();
    };
    const abort = () => {
      finish();
      reject(
        new DOMException(
          "প্রক্রিয়া বাতিল হয়েছে; ইতিমধ্যে সংরক্ষিত ছবি থেকে যেতে পারে।",
          "AbortError",
        ),
      );
    };
    signal.addEventListener("abort", abort, { once: true });
    worker.onerror = () => {
      finish();
      reject(
        Error(
          "Browser worker নথিটি পড়তে পারেনি। ফাইলটি ভাগ করুন অথবা নতুন browser ব্যবহার করুন।",
        ),
      );
    };
    worker.onmessage = async (event) => {
      const message = event.data;
      if (message.kind === "progress") onProgress(message.value);
      if (message.kind === "done") {
        finish();
        resolve(message.result);
      }
      if (message.kind === "error") {
        finish();
        reject(Error(message.error));
      }
      if (message.kind === "image") {
        try {
          const form = new FormData();
          form.set(
            "image",
            new File([message.bytes], "word-image", { type: message.mime }),
          );
          const response = await fetch("/api/admin/question-bank/image", {
            method: "POST",
            credentials: "same-origin",
            body: form,
            signal: AbortSignal.any([signal, AbortSignal.timeout(60000)]),
          });
          const result = await response
            .json()
            .catch(() => ({ error: `ছবির অনুরোধ HTTP ${response.status}` }));
          if (!response.ok) throw Error(result.error ?? "ছবি সেভ হয়নি।");
          if (!signal.aborted)
            worker.postMessage({
              kind: "image-result",
              id: message.id,
              url: result.url,
            });
        } catch (error) {
          if (!signal.aborted)
            worker.postMessage({
              kind: "image-result",
              id: message.id,
              error: (error as Error).message,
            });
        }
      }
    };
    worker.postMessage({ ...input, kind: "file" in input ? "file" : "text" });
  });
}
