import "server-only";
import sharp from "sharp";
import path from "node:path";
import type { MarketSample } from "@/lib/marketplace-sample";
const escape = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
/** Rasterize only bounded public excerpts. Never render original snapshots or source URLs. */
export async function marketSampleImage(sample: MarketSample) {
  if (
    !sample.excerpts.length ||
    sample.excerpts.length > 2 ||
    sample.excerpts.some((text) => Array.from(text).length > 161)
  )
    throw Error("Invalid sample");
  const fontfile = path.join(
    process.cwd(),
    "public/fonts/HindSiliguri-Regular.ttf",
  );
  const textImage = async (
    text: string,
    size: number,
    width: number,
    color: string,
  ) =>
    sharp({
      text: {
        text: `<span foreground="${color}">${escape(text)}</span>`,
        font: `Hind Siliguri ${size}`,
        fontfile,
        width,
        rgba: true,
        spacing: 12,
      },
    })
      .png()
      .toBuffer();
  const layers: sharp.OverlayOptions[] = [];
  layers.push({
    input: await textImage("প্রশ্নবুক.কম · সীমিত নমুনা", 28, 800, "#243d67"),
    left: 40,
    top: 30,
  });
  for (let i = 0; i < sample.excerpts.length; i++)
    layers.push({
      input: await textImage(
        `${i + 1}. ${sample.excerpts[i]}`,
        24,
        800,
        "#152b49",
      ),
      left: 40,
      top: 130 + i * 220,
    });
  // Watermark pixels are composited into the same final PNG as the sample text.
  const mark = await textImage("PROSHNOBOOK.COM · PREVIEW", 27, 700, "#a99abb");
  const rotated = await sharp(mark)
    .rotate(-18, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  for (const top of [90, 300, 510])
    layers.push({ input: rotated, left: 60, top });
  layers.push({
    input: await textImage(
      "নমুনা · বিক্রয়ের জন্য নয় · কেনার পর পরিষ্কার কপি",
      21,
      800,
      "#5935a5",
    ),
    left: 40,
    top: 745,
  });
  return sharp({
    create: { width: 880, height: 820, channels: 3, background: "#ffffff" },
  })
    .composite(layers)
    .removeAlpha()
    .png()
    .toBuffer();
}
