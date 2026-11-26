import { inflateRawSync } from "node:zlib";
import mammoth from "mammoth";
import sanitizeHtml from "sanitize-html";
/** Check actual decompressed sizes before handing a ZIP to a document parser.
 * No ZIP64/encryption/external paths, at most 1500 entries / 24 MB expanded.
 */
export function inspectBankDocx(buffer: Buffer) {
  if (buffer.length < 22 || buffer.length > 4000000)
    throw Error("Word .docx সর্বোচ্চ ৪ MB হতে পারে।");
  let end = -1;
  for (let i = buffer.length - 22; i >= Math.max(0, buffer.length - 65557); i--)
    if (
      buffer.readUInt32LE(i) === 0x06054b50 &&
      i + 22 + buffer.readUInt16LE(i + 20) === buffer.length
    ) {
      end = i;
      break;
    }
  if (end < 0 || buffer.readUInt16LE(end + 4) || buffer.readUInt16LE(end + 6))
    throw Error("সঠিক .docx ZIP দিন।");
  const count = buffer.readUInt16LE(end + 10),
    directory = buffer.readUInt32LE(end + 16),
    directorySize = buffer.readUInt32LE(end + 12);
  if (
    !count ||
    count > 1500 ||
    directory + directorySize !== end ||
    buffer.readUInt16LE(end + 8) !== count
  )
    throw Error("Word ZIP সীমা অতিক্রম করেছে।");
  let position = directory,
    total = 0;
  const names = new Set<string>();
  for (let i = 0; i < count; i++) {
    if (position + 46 > end || buffer.readUInt32LE(position) !== 0x02014b50)
      throw Error("ZIP directory সঠিক নয়।");
    const flags = buffer.readUInt16LE(position + 8),
      method = buffer.readUInt16LE(position + 10),
      compressed = buffer.readUInt32LE(position + 20),
      expanded = buffer.readUInt32LE(position + 24),
      nameSize = buffer.readUInt16LE(position + 28),
      extra = buffer.readUInt16LE(position + 30),
      comment = buffer.readUInt16LE(position + 32),
      offset = buffer.readUInt32LE(position + 42);
    const name = buffer
      .subarray(position + 46, position + 46 + nameSize)
      .toString("utf8");
    if (
      flags & 1 ||
      ![0, 8].includes(method) ||
      expanded > 8000000 ||
      (compressed && expanded / compressed > 250) ||
      !name ||
      name.startsWith("/") ||
      name.includes("\\") ||
      name.split("/").includes("..") ||
      names.has(name) ||
      offset + 30 > directory ||
      buffer.readUInt32LE(offset) !== 0x04034b50
    )
      throw Error("অনিরাপদ বা অতিরিক্ত বড় Word ZIP প্রত্যাখ্যান করা হয়েছে।");
    total += expanded;
    if (total > 24000000) throw Error("Word-এর expanded data সর্বোচ্চ ২৪ MB।");
    const start =
      offset +
      30 +
      buffer.readUInt16LE(offset + 26) +
      buffer.readUInt16LE(offset + 28);
    if (start + compressed > directory) throw Error("ZIP entry সঠিক নয়।");
    const bytes = buffer.subarray(start, start + compressed);
    const decoded =
      method === 0
        ? bytes
        : inflateRawSync(bytes, { maxOutputLength: 8000001 });
    if (decoded.length !== expanded) throw Error("ZIP size মিলছে না।");
    names.add(name);
    position += 46 + nameSize + extra + comment;
  }
  if (
    position !== end ||
    !names.has("word/document.xml") ||
    !names.has("[Content_Types].xml")
  )
    throw Error("এটি Word .docx নয়। পুরোনো .doc আগে .docx করুন।");
}
export async function extractBankDocx(
  buffer: Buffer,
  saveImage: (bytes: Buffer) => Promise<string>,
) {
  inspectBankDocx(buffer);
  const images: { url: string; alt: string }[] = [],
    warnings: string[] = [];
  let imageCount = 0;
  const document = await mammoth.convertToHtml(
    { buffer },
    {
      externalFileAccess: false,
      includeEmbeddedStyleMap: false,
      convertImage: mammoth.images.imgElement(async (image) => {
        const index = ++imageCount;
        if (index > 20) {
          warnings.push("২০টির বেশি ছবি বাদ গেছে; আলাদাভাবে আপলোড করুন।");
          return { src: `unsupported-image-${index}` };
        }
        try {
          if (
            !["image/png", "image/jpeg", "image/webp"].includes(
              image.contentType,
            )
          )
            throw Error();
          const bytes = await image.readAsBuffer();
          if (bytes.length > 4000000) throw Error();
          const url = await saveImage(bytes),
            alt = `Word চিত্র ${index}`;
          images.push({ url, alt });
          return { src: url };
        } catch {
          warnings.push(
            `${index} নং ছবিটি নিরাপদ raster হিসেবে পড়া যায়নি; আলাদা JPG/PNG/WebP দিন।`,
          );
          return { src: `unsupported-image-${index}` };
        }
      }),
    },
  );
  let html = document.value
    .replace(/<img\b[^>]*src="([^"]+)"[^>]*>/gi, (_, src: string) => {
      const image = images.find((i) => i.url === src);
      return image
        ? `\n![${image.alt}](${image.url})\n`
        : "\n[Word-এর একটি ছবি বাদ গেছে; warnings দেখুন]\n";
    })
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/(?:p|h[1-6]|li|tr|div)>/gi, "\n")
    .replace(/<\/t[dh]>/gi, "\t");
  html = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });
  const entities: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
  };
  const text = html
    .replace(
      /&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,
      (match, entity: string) => {
        if (entities[entity]) return entities[entity];
        const n = parseInt(
          entity.slice(entity[1]?.toLowerCase() === "x" ? 2 : 1),
          entity[1]?.toLowerCase() === "x" ? 16 : 10,
        );
        return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : match;
      },
    )
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (text.length > 250000)
    throw Error("Word-এর টেক্সট অতিরিক্ত বড়; ছোট ব্যাচ দিন।");
  return {
    text,
    images,
    warnings: [
      ...warnings,
      ...document.messages.map((m) => m.message),
      "জটিল সারণি, সমীকরণ, numbering ও ছবির অবস্থান মূল Word-এর সঙ্গে মিলিয়ে নিন। Template-এর বাইরে layout স্বয়ংক্রিয়ভাবে সঠিক parse হওয়ার নিশ্চয়তা নেই।",
    ],
  };
}
