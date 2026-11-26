import JSZip from "jszip";
import {
  BANK_FILE_MAX_BYTES,
  type BankFileProgress,
} from "./question-bank-large-file";
/** Validate declared AND actual decompressed sizes before Mammoth opens a ZIP.
 * Streaming guards avoid trusting forged central-directory sizes. Runs in worker.
 */
export async function inspectLargeBankDocx(
  buffer: ArrayBuffer,
  progress: (value: BankFileProgress) => void,
) {
  const view = new DataView(buffer),
    bytes = new Uint8Array(buffer),
    decoder = new TextDecoder();
  if (buffer.byteLength < 22 || buffer.byteLength > BANK_FILE_MAX_BYTES)
    throw Error("DOCX সর্বোচ্চ ৫০ MiB।");
  let end = -1;
  for (
    let i = buffer.byteLength - 22;
    i >= Math.max(0, buffer.byteLength - 65557);
    i--
  )
    if (
      view.getUint32(i, true) === 0x06054b50 &&
      i + 22 + view.getUint16(i + 20, true) === buffer.byteLength
    ) {
      end = i;
      break;
    }
  if (end < 0 || view.getUint16(end + 4, true) || view.getUint16(end + 6, true))
    throw Error("সঠিক, unencrypted DOCX ZIP দিন।");
  const count = view.getUint16(end + 10, true),
    offset = view.getUint32(end + 16, true),
    directorySize = view.getUint32(end + 12, true);
  if (
    !count ||
    count > 5000 ||
    view.getUint16(end + 8, true) !== count ||
    offset + directorySize !== end
  )
    throw Error("DOCX ZIP directory/entry সীমা সঠিক নয়।");
  let position = offset,
    total = 0;
  const sizes = new Map<string, number>();
  for (let i = 0; i < count; i++) {
    if (position + 46 > end || view.getUint32(position, true) !== 0x02014b50)
      throw Error("DOCX ZIP directory নষ্ট।");
    const flags = view.getUint16(position + 8, true),
      method = view.getUint16(position + 10, true),
      compressed = view.getUint32(position + 20, true),
      expanded = view.getUint32(position + 24, true),
      nameSize = view.getUint16(position + 28, true),
      extra = view.getUint16(position + 30, true),
      comment = view.getUint16(position + 32, true),
      local = view.getUint32(position + 42, true);
    if (position + 46 + nameSize + extra + comment > end)
      throw Error("ZIP entry সঠিক নয়।");
    const name = decoder.decode(
      bytes.subarray(position + 46, position + 46 + nameSize),
    );
    if (
      flags & 1 ||
      ![0, 8].includes(method) ||
      expanded > 40 * 1024 * 1024 ||
      (!compressed && expanded) ||
      (compressed && expanded / compressed > 2000) ||
      !name ||
      name.startsWith("/") ||
      name.includes("\\") ||
      name.split("/").includes("..") ||
      sizes.has(name) ||
      local + 30 > offset ||
      view.getUint32(local, true) !== 0x04034b50
    )
      throw Error("অনিরাপদ/অতিরিক্ত বড় Word ZIP প্রত্যাখ্যান করা হয়েছে।");
    const start =
      local +
      30 +
      view.getUint16(local + 26, true) +
      view.getUint16(local + 28, true);
    if (start + compressed > offset) throw Error("Word ZIP data সীমা মেলেনি।");
    total += expanded;
    if (total > 200 * 1024 * 1024)
      throw Error("DOCX expanded data সর্বোচ্চ ২০০ MiB; ছবিসহ বইটি ভাগ করুন।");
    sizes.set(name, expanded);
    position += 46 + nameSize + extra + comment;
  }
  if (
    position !== end ||
    !sizes.has("word/document.xml") ||
    !sizes.has("[Content_Types].xml")
  )
    throw Error("এটি Word DOCX নয়। পুরোনো DOC রূপান্তর করুন।");
  const zip = await JSZip.loadAsync(buffer, { createFolders: false });
  for (const [name, entry] of Object.entries(zip.files)) {
    if (!sizes.has(name)) throw Error("ZIP entry নাম মেলেনি।");
    if (entry.dir) continue;
    await new Promise<void>((resolve, reject) => {
      let actual = 0;
      const stream = (
        entry as unknown as {
          internalStream: (type: string) => {
            on: (event: string, callback: (value: Uint8Array) => void) => any;
            pause: () => void;
            resume: () => void;
          };
        }
      ).internalStream("uint8array");
      stream
        .on("data", (part: Uint8Array) => {
          actual += part.length;
          if (actual > sizes.get(name)!) {
            stream.pause();
            reject(Error("ZIP-এর actual expanded size সীমা ছাড়িয়েছে।"));
          }
        })
        .on("error", reject)
        .on("end", () =>
          actual === sizes.get(name)
            ? resolve()
            : reject(Error("ZIP expanded size মেলেনি।")),
        )
        .resume();
    });
    progress({
      phase: "Word ZIP-এর নিরাপত্তা পরীক্ষা",
      done: [...sizes.keys()].indexOf(name) + 1,
      total: count,
    });
  }
}
