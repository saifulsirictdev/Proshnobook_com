"use client";
import { useEffect, useRef, useState } from "react";
import MarketplaceFullPreview from "./marketplace-full-preview";
import MarketplaceRasterPreview from "./marketplace-raster-preview";
import type { FullMarketPreview } from "@/lib/marketplace-full-preview";
import type { MarketRaster } from "@/lib/marketplace-raster";
export default function QuestionFeedPreview({
  model,
  raster,
}: {
  model: FullMarketPreview | null;
  raster: MarketRaster | null;
}) {
  const root = useRef<HTMLDivElement>(null),
    [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!root.current) return;
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={root} className="sf-paper-image">
      {visible ? (
        raster ? (
          <MarketplaceRasterPreview raster={raster} branded />
        ) : (
          <MarketplaceFullPreview model={model} firstPageOnly />
        )
      ) : (
        <p>প্রশ্নপত্রের প্রথম পাতার Preview…</p>
      )}
    </div>
  );
}
