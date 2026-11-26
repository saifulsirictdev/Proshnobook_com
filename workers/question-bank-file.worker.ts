import {
  parseBankTextForReview,
  type BankTextReview,
} from "../lib/question-bank-text-review";
import mammoth from "mammoth/mammoth.browser";
import { inspectLargeBankDocx } from "../lib/question-bank-zip-browser";
import {
  BANK_FILE_MAX_BYTES,
  BANK_DOCUMENT_MAX_CHARS,
  bankFileFormat,
  decodeBankText,
  parseBankDocument,
  bankWordHtmlText,
  type BankFileFormat,
  type BankFileProgress,
} from "../lib/question-bank-large-file";
import { bankUuidFromHex, type BankScope } from "../lib/question-bank-batch";
const port = globalThis as unknown as {
  postMessage: (message: unknown, transfer?: Transferable[]) => void;
  onmessage: ((event: MessageEvent) => void) | null;
};
const images = new Map<
  number,
  { resolve: (url: string) => void; reject: (error: Error) => void }
>();
const progress = (value: BankFileProgress) =>
  port.postMessage({ kind: "progress", value });
port.onmessage = async (event) => {
  const message = event.data;
  if (message.kind === "image-result") {
    const waiting = images.get(message.id);
    if (waiting) {
      images.delete(message.id);
      if (message.error) waiting.reject(Error(message.error));
      else waiting.resolve(message.url);
    }
    return;
  }
  if (message.kind !== "file" && message.kind !== "text") return;
  try {
    let text: string,
      format: BankFileFormat,
      name: string,
      identity: ArrayBuffer;
    const warnings: string[] = [],
      scope = message.scope as BankScope;
    if (message.kind === "file") {
      const file = message.file as File;
      format = bankFileFormat(file.name);
      name = file.name.slice(0, 200);
      if (!file.size || file.size > BANK_FILE_MAX_BYTES)
        throw Error("ফাইল খালি অথবা ৫০ MiB সীমার বেশি।");
      progress({ phase: `ফাইল পড়ছি: ${name}` });
      identity = await file.arrayBuffer();
      if (format === "docx") {
        await inspectLargeBankDocx(identity, progress);
        progress({ phase: "Word থেকে টেক্সট ও ছবি বের করছি" });
        const extracted: { src: string; alt: string }[] = [];
        let count = 0,
          failed = 0,
          queue = Promise.resolve();
        const document = await mammoth.convertToHtml(
          { arrayBuffer: identity },
          {
            externalFileAccess: false,
            includeEmbeddedStyleMap: false,
            convertImage: mammoth.images.imgElement((image) => {
              const id = ++count;
              const task = queue.then(async () => {
                if (
                  !message.includeImages ||
                  id > 1000 ||
                  failed >= 5 ||
                  !["image/png", "image/jpeg", "image/webp"].includes(
                    image.contentType,
                  )
                ) {
                  warnings.push(
                    `${id} নং Word ছবি বাদ গেছে (ছবি বন্ধ/সীমা/অসমর্থিত format); প্রয়োজনে আলাদা ছবি দিন।`,
                  );
                  return { src: `unsupported-image-${id}` };
                }
                try {
                  const bytes = await image.readAsArrayBuffer();
                  if (bytes.byteLength > 4_000_000)
                    throw Error("ছবিটি ৪ MB-এর বেশি");
                  progress({ phase: `Word ছবি ${id} সংরক্ষণ করছি` });
                  const url = await new Promise<string>((resolve, reject) => {
                    images.set(id, { resolve, reject });
                    port.postMessage(
                      { kind: "image", id, bytes, mime: image.contentType },
                      [bytes],
                    );
                  });
                  const alt = `Word চিত্র ${id}`;
                  extracted.push({ src: url, alt });
                  return { src: url };
                } catch (error) {
                  failed++;
                  warnings.push(
                    `${id} নং ছবি সংরক্ষিত হয়নি: ${(error as Error).message}`,
                  );
                  return { src: `unsupported-image-${id}` };
                }
              });
              queue = task.then(
                () => undefined,
                () => undefined,
              );
              return task;
            }),
          },
        );
        text = bankWordHtmlText(document.value, extracted);
        warnings.push(
          ...document.messages.map((value) => value.message),
          "Word পড়া হয়েছে; জটিল layout, formula, numbering, table ও ছবির অবস্থান মূল বইয়ের সঙ্গে মিলিয়ে নিন। Template-এর বাইরে লেখা স্বয়ংক্রিয় প্রশ্নে ভাগ নাও হতে পারে।",
        );
      } else text = decodeBankText(new Uint8Array(identity));
    } else {
      text = String(message.text);
      format = message.format;
      name = "edited-template." + (format === "json" ? "json" : "txt");
      identity = new TextEncoder().encode(
        JSON.stringify([
          scope,
          text.replace(
            /\/api\/question-bank\/images\/[a-f0-9-]+\.webp/g,
            "[uploaded-image]",
          ),
        ]),
      ).buffer as ArrayBuffer;
    }
    if (text.length > BANK_DOCUMENT_MAX_CHARS)
      throw Error("নথিতে ২ কোটি অক্ষরের বেশি; নথিটি ভাগ করুন।");
    progress({ phase: "প্রশ্নের গঠন পড়ছি" });
    let items: ReturnType<typeof parseBankDocument> = [];
    let reviews: BankTextReview[] | undefined;
    try {
      if (format === "json") items = parseBankDocument(text, scope, format);
      else {
        const parsed = parseBankTextForReview(text, scope);
        items = parsed.items;
        reviews = parsed.reviews;
        warnings.push(...parsed.warnings);
      }
    } catch (error) {
      warnings.push(
        `ফাইলের টেক্সট পাওয়া গেছে, কিন্তু staging এখনো হয়নি: ${(error as Error).message}`,
      );
    }
    if (format === "json")
      warnings.push(
        "JSON-এর ID, approval বা source-claim বিশ্বাস করে প্রকাশ করা হবে না; নির্বাচিত scope ও Pending review প্রযোজ্য। মূল book/edition/sourceUrl/page তথ্য মূল JSON-এ সংরক্ষণ করুন—সেগুলো এই staging-এ স্বয়ংক্রিয় verified evidence হিসেবে সেভ হয় না।",
      );
    const hash = await crypto.subtle.digest("SHA-256", identity),
      batchId = bankUuidFromHex(
        Array.from(new Uint8Array(hash))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(""),
      );
    port.postMessage({
      kind: "done",
      result: {
        text,
        items,
        reviews,
        warnings: warnings
          .slice(0, 200)
          .concat(
            warnings.length > 200
              ? [
                  `আরও ${warnings.length - 200}টি warning আছে; বিশেষ করে বাদ পড়া ছবিগুলো মূল Word-এর সঙ্গে মিলিয়ে নিন।`,
                ]
              : [],
          ),
        batchId,
        fileName: name,
        format,
      },
    });
  } catch (error) {
    port.postMessage({
      kind: "error",
      error: `ফাইল পড়া/প্রক্রিয়াকরণ সম্পন্ন হয়নি: ${(error as Error).message}`,
    });
  }
};
