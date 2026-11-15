"use client";
import { useEffect, useMemo, useRef, useState, useId } from "react";
import { toPng } from "html-to-image";
import type { FullMarketPreview } from "@/lib/marketplace-full-preview";
import PaperPreview from "@/components/paper-builder/preview";
import { paperDimensions } from "@/lib/paper-builder";
import "@/components/paper-builder/paper.css";
import "katex/dist/katex.min.css";
import "./marketplace-full-preview.css";

/** All rendered questions are intentionally public under the owner's full-preview policy.
 * Flattened branded images are a presentation/branding feature, not DRM. */
export default function MarketplaceFullPreview({
  model,
  firstPageOnly = false,
}: {
  model: FullMarketPreview | null;
  firstPageOnly?: boolean;
}) {
  const source = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const [pages, setPages] = useState<string[]>([]),
    [error, setError] = useState(false),
    [retry, setRetry] = useState(0);
  const duplicate = useMemo(() => new Set(model?.duplicate ?? []), [model]);
  useEffect(() => {
    if (!model || !source.current) return;
    const root = source.current;
    let cancelled = false,
      timer: ReturnType<typeof setTimeout> | undefined,
      busy = false,
      dirty = false;
    setPages([]);
    setError(false);
    const render = async () => {
      if (busy) {
        dirty = true;
        return;
      }
      busy = true;
      try {
        await document.fonts.ready;
        await document.fonts.load('700 54px "QmPaperKalpurush"');
        await Promise.all(
          [...root.querySelectorAll("img")].map((img) => img.decode()),
        );
        if (cancelled) return;
        const sheets = [...root.querySelectorAll<HTMLElement>(".paper-sheet")];
        if (!sheets.length) throw Error("No pages");
        const images: string[] = [];
        for (const sheet of firstPageOnly ? sheets.slice(0, 1) : sheets) {
          const png = await toPng(sheet, {
            pixelRatio: 1,
            backgroundColor: "#fff",
            skipAutoScale: false,
          });
          // Bake repeating brand text into the pixels, independent from the CSS layer.
          const image = new Image();
          image.src = png;
          await image.decode();
          const canvas = document.createElement("canvas");
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw Error("Canvas unavailable");
          ctx.drawImage(image, 0, 0);
          ctx.save();
          ctx.fillStyle = "rgba(78, 49, 132, 0.20)";
          ctx.font = '700 54px "QmPaperKalpurush", sans-serif';
          ctx.textAlign = "center";
          for (const fraction of [0.22, 0.5, 0.78]) {
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height * fraction);
            ctx.rotate(-Math.PI / 6);
            ctx.fillText("প্রশ্নবুক.কম", 0, 0);
            ctx.restore();
          }
          ctx.restore();
          images.push(canvas.toDataURL("image/png"));
          if (cancelled) return;
        }
        if (!cancelled) {
          setPages(images);
          setError(false);
        }
      } catch {
        if (!cancelled) {
          setPages([]);
          setError(true);
        }
      } finally {
        busy = false;
        if (dirty && !cancelled) {
          dirty = false;
          schedule();
        }
      }
    };
    const schedule = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        void render();
      }, 450);
    };
    const observer = new MutationObserver(schedule);
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    schedule();
    return () => {
      cancelled = true;
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [model, retry, firstPageOnly]);
  if (!model?.sections.length)
    return <p role="status">এই প্রশ্নপত্রের প্রিভিউ এখন দেখানো যাচ্ছে না।</p>;
  const first = model.sections[0],
    [width] = paperDimensions(model.settings);
  return (
    <section className="market-full-preview" aria-labelledby={headingId}>
      <h2 id={headingId}>
        {firstPageOnly ? "প্রশ্নপত্রের প্রথম পৃষ্ঠা" : "সম্পূর্ণ প্রশ্নপত্র"}
      </h2>
      {!pages.length && !error && (
        <p role="status">প্রশ্নপত্রের পৃষ্ঠাগুলো প্রস্তুত হচ্ছে…</p>
      )}
      {error && (
        <div role="alert">
          <p>
            প্রিভিউ তৈরি হয়নি। ইন্টারনেট সংযোগ ও পৃষ্ঠার ছবি/ফন্ট লোড হচ্ছে কি না
            যাচাই করে আবার চেষ্টা করুন।
          </p>
          <button
            onClick={() => setRetry((n) => n + 1)}
            className="rounded-lg border px-4 py-2"
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      )}
      <div className="market-full-pages">
        {pages.map((page, index) => (
          <figure key={index}>
            <img
              src={page}
              alt={`প্রশ্নপত্রের পৃষ্ঠা ${index + 1} — প্রশ্নবুক.কম জলছাপসহ`}
            />
            <figcaption>পৃষ্ঠা {(index + 1).toLocaleString("bn-BD")}</figcaption>
          </figure>
        ))}
      </div>
      <div
        ref={source}
        aria-hidden="true"
        className="market-full-source paper-builder-root"
        style={{ width: `${width}mm` }}
      >
        <PaperPreview
          readOnly
          s={model.settings}
          sections={model.sections.length > 1 ? model.sections : undefined}
          questions={first.questions}
          type={first.type}
          title={first.title}
          setName={model.setName}
          duplicate={duplicate}
          onImageSize={() => {}}
          previewScale={1}
        />
      </div>
    </section>
  );
}
