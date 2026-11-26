import JSZip from "jszip";
import { admin } from "@/lib/guard";
import { bankTextTemplate, parseBankText } from "@/lib/question-bank-batch";
import { bankReply } from "@/lib/question-bank-http";
export const runtime = "nodejs";
export async function GET(req: Request) {
  try {
    await admin();
  } catch {
    return bankReply({ error: "শুধু Admin template পাবেন।" }, 403);
  }
  const url = new URL(req.url),
    math = url.searchParams.get("math") === "1",
    format = url.searchParams.get("format") ?? "txt";
  const text = bankTextTemplate(math);
  let body: string | Uint8Array<ArrayBuffer>, contentType: string;
  if (format === "docx") {
    const zip = new JSZip(),
      xml = (s: string) =>
        s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    zip.file(
      "[Content_Types].xml",
      '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
    );
    zip.file(
      "_rels/.rels",
      '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    );
    zip.file(
      "word/document.xml",
      '<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' +
        text
          .split("\n")
          .map(
            (line) =>
              `<w:p><w:r><w:t xml:space="preserve">${xml(line)}</w:t></w:r></w:p>`,
          )
          .join("") +
        "<w:sectPr/></w:body></w:document>",
    );
    body = new Uint8Array(
      await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }),
    );
    contentType =
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  } else if (format === "json") {
    body = JSON.stringify(
      {
        version: 1,
        items: parseBankText(text, {
          category: "Class 6",
          subject: math ? "গণিত" : "বিজ্ঞান",
          topic: "নিজের অধ্যায় নির্বাচন করুন",
        }),
      },
      null,
      2,
    );
    contentType = "application/json; charset=utf-8";
  } else if (format === "txt") {
    body = text;
    contentType = "text/plain; charset=utf-8";
  } else return bankReply({ error: "সঠিক format দিন।" }, 400);
  return new Response(body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="question-bank-template.${format}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
