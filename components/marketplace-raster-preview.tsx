"use client";
import { useEffect, useRef, useState } from "react";
import { checkPurchasedPaperAccess } from "@/app/actions/purchased-paper-access";
import type { MarketRaster } from "@/lib/marketplace-raster";
import "./marketplace-raster.css";
function BrandedPage({ src, index }: { src: string; index: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let live = true;
    setError(false);
    setLoaded(false);
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = async () => {
      try {
        await document.fonts.ready;
        if (!live || !canvas.current) return;
        const c = canvas.current;
        c.width = image.naturalWidth;
        c.height = image.naturalHeight;
        const ctx = c.getContext("2d");
        if (!ctx) throw Error();
        ctx.drawImage(image, 0, 0);
        ctx.fillStyle = "rgba(78,49,132,.22)";
        ctx.font = `bold ${Math.round(c.width / 16)}px QmPaperKalpurush, sans-serif`;
        ctx.textAlign = "center";
        for (let y = c.height * 0.2; y < c.height; y += c.height * 0.28) {
          ctx.save();
          ctx.translate(c.width / 2, y);
          ctx.rotate(-Math.PI / 6);
          ctx.fillText("প্রশ্নবুক.কম", 0, 0);
          ctx.restore();
        }
        setLoaded(true);
      } catch {
        if (live) setError(true);
      }
    };
    image.onerror = () => {
      if (live) setError(true);
    };
    image.src = src;
    return () => {
      live = false;
    };
  }, [src]);
  return (
    <figure className="market-raster-sheet">
      {!loaded && !error && <p role="status">পৃষ্ঠা প্রস্তুত হচ্ছে…</p>}
      {error ? (
        <p role="alert">পৃষ্ঠা লোড হয়নি। আবার পেজ খুলুন।</p>
      ) : (
        <canvas
          ref={canvas}
          role="img"
          aria-label={`ব্র্যান্ডযুক্ত প্রশ্নপত্র পৃষ্ঠা ${index + 1}`}
        />
      )}
    </figure>
  );
}
/** Public pages are intentionally readable; branding is not DRM. Source PDFs are never sent. */
export default function MarketplaceRasterPreview({
  raster,
  branded = false,
  editable = false,
  purchaseId,
}: {
  raster: MarketRaster;
  branded?: boolean;
  editable?: boolean;
  purchaseId?: string;
}) {
  const root = useRef<HTMLElement>(null);
  const [printing, setPrinting] = useState(false);
  const [scale, setScale] = useState(1),
    [note, setNote] = useState(""),
    [message, setMessage] = useState("");
  return (
    <section ref={root} className="market-raster">
      {editable && (
        <div data-noprint className="market-raster-tools">
          <h2>PDF কপির সেটআপ</h2>
          <p>
            এটি ছবিভিত্তিক স্থির কপি। স্ক্যানের ভেতরের লেখা আলাদা প্রশ্নের মতো বদলানো
            যায় না। অতিরিক্ত লেখা যোগ ও আকার ঠিক করে প্রিন্ট করতে পারবেন। পরিবর্তন
            এই খোলা পেজে থাকে; শেষে PDF রাখুন।
          </p>
          <label>
            প্রশ্নপত্রের আকার
            <input
              type="range"
              min="0.5"
              max="1"
              step=".01"
              value={scale}
              onChange={(e) => setScale(+e.target.value)}
            />
          </label>
          <label>
            প্রতি পৃষ্ঠার উপরে অতিরিক্ত লেখা
            <input
              maxLength={160}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <button
            disabled={printing}
            onClick={async () => {
              if (!purchaseId || printing) return;
              setPrinting(true);
              setMessage("");
              try {
                await document.fonts.ready;
                await Promise.all(
                  [...root.current!.querySelectorAll("img")].map((img) =>
                    img.decode(),
                  ),
                );
                const access = await checkPurchasedPaperAccess(purchaseId);
                if (!access.ok) {
                  setMessage(access.error);
                  return;
                }
                window.print();
              } catch {
                setMessage("ছবি বা অনুমতি যাচাই হয়নি। আবার চেষ্টা করুন।");
              } finally {
                setPrinting(false);
              }
            }}
          >
            Preview / Print / PDF
          </button>
          <p role="status">{message}</p>
        </div>
      )}
      {raster.pages.map((src, i) =>
        branded ? (
          <BrandedPage key={src + ":" + i} src={src} index={i} />
        ) : (
          <article className="market-raster-sheet" key={src + ":" + i}>
            {note && <p className="market-raster-note">{note}</p>}
            <img
              src={src}
              alt={`প্রশ্নপত্র পৃষ্ঠা ${i + 1}`}
              style={{ width: `${scale * 100}%` }}
            />
          </article>
        ),
      )}
    </section>
  );
}
