import { BRAND } from "@/lib/brand";
import "./brand-wordmark.css";

/** Compact header branding: no splash, timers or perpetual flashing. */
export default function BrandWordmark({
  name = BRAND.nameBn,
}: {
  name?: string;
}) {
  return (
    <span className="qm-wordmark">
      <img
        src="/proshnobook-p-logo.png"
        width={36}
        height={36}
        alt=""
        className="qm-wordmark-mark"
      />
      <span className="qm-wordmark-copy">
        <span className="qm-wordmark-title">{name}</span>
        <span className="qm-wordmark-tagline">{BRAND.tagline}</span>
      </span>
    </span>
  );
}
