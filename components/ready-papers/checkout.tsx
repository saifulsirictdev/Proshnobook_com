"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  quoteReadyPaper,
  checkoutReadyPaper,
} from "@/app/actions/ready-commerce";
import type { ReadySnapshot, ReadyQuote } from "@/lib/ready-commerce";
export default function ReadyCheckout({
  paperId,
  sourceUrl,
  selected,
  snapshot,
  onClose,
  onPaid,
  beforePurchase,
}: {
  paperId: string;
  sourceUrl: string;
  selected: number[];
  snapshot: ReadySnapshot;
  onClose: () => void;
  onPaid: (id: string) => void | Promise<void>;
  beforePurchase: () => Promise<void>;
}) {
  const dialog = useRef<HTMLElement>(null),
    busyRef = useRef(false);
  const [quote, setQuote] = useState<ReadyQuote | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [confirmedReceipt, setConfirmedReceipt] = useState<string | null>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    function key(e: KeyboardEvent) {
      if (e.key === "Escape" && !busyRef.current) {
        e.preventDefault();
        onClose();
      }
      if (e.key !== "Tab") return;
      const items = Array.from(
        dialog.current?.querySelectorAll<HTMLElement>(
          "button:not(:disabled), a[href], input:not(:disabled)",
        ) ?? [],
      );
      if (!items.length) {
        e.preventDefault();
        return;
      }
      const first = items[0],
        last = items[items.length - 1];
      if (
        e.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === dialog.current)
      ) {
        e.preventDefault();
        last.focus();
      } else if (
        !e.shiftKey &&
        (document.activeElement === last ||
          document.activeElement === dialog.current)
      ) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, []);
  useEffect(() => {
    let live = true;
    quoteReadyPaper({ paperId, sourceUrl, selected })
      .then((r) => {
        if (!live) return;
        if (r.ok) setQuote(r);
        else setError(r.error);
      })
      .catch(() => {
        if (live) setError("মূল্য যাচাই হয়নি। আবার চেষ্টা করুন।");
      });
    return () => {
      live = false;
    };
  }, [paperId, sourceUrl, selected]);
  async function pay() {
    if (!quote || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      // Once checkout is confirmed, retry opening the receipt, not payment.
      let receiptId = confirmedReceipt;
      if (!receiptId) {
        try {
          await beforePurchase();
        } catch {
          setError(
            "নির্বাচিত PDF পৃষ্ঠার উচ্চমানের preview তৈরি হয়নি। ইন্টারনেট সংযোগ যাচাই করে আবার চেষ্টা করুন; checkout শুরু হয়নি, তাই টাকা কাটা হয়নি।",
          );
          return;
        }
        let result: Awaited<ReturnType<typeof checkoutReadyPaper>>;
        try {
          result = await checkoutReadyPaper(
            { paperId, sourceUrl, selected },
            { total: quote.total, packageUnits: quote.packageUnits },
            snapshot,
          );
        } catch {
          setError(
            "Checkout-এর ফল সংযোগের কারণে নিশ্চিত করা যায়নি। একই অ্যাকাউন্টে একই PDF ও পৃষ্ঠা নির্বাচন রেখে আবার চেষ্টা করুন, অথবা ‘আমার প্রশ্নপত্র’ দেখুন। একই নির্বাচনে দ্বিতীয়বার টাকা কাটবে না।",
          );
          return;
        }
        if (!result.ok) {
          setError(result.error);
          try {
            const refreshed = await quoteReadyPaper({ paperId, sourceUrl, selected });
            if (refreshed.ok) setQuote(refreshed);
          } catch {
            // Keep the original checkout error; a failed refresh must not hide it.
          }
          return;
        }
        receiptId = result.receiptId;
        setConfirmedReceipt(receiptId);
      }
      try {
        if (!receiptId) throw new Error("Receipt unavailable");
        await onPaid(receiptId);
      } catch {
        setError(
          "Checkout নিশ্চিত হয়েছে, কিন্তু সংরক্ষিত প্রশ্নপত্র খোলা যায়নি। আবার চেষ্টা করুন বা ‘আমার প্রশ্নপত্র’ থেকে খুলুন; পুনরায় checkout করা হবে না।",
        );
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  return (
    <div className="rp-checkout-backdrop">
      <section
        ref={dialog}
        tabIndex={-1}
        className="rp-checkout"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ready-checkout-title"
      >
        <span className="rp-checkout-kicker">READY PAPER CHECKOUT</span>
        <h2 id="ready-checkout-title">সেটআপে যাওয়ার আগে মূল্য দেখুন</h2>
        <p>
          প্রতি ১–৩ পৃষ্ঠা = ১ প্রশ্নপত্র ইউনিট · ৳৫। সংশ্লিষ্ট অনুমোদিত উত্তরপত্র অন্তর্ভুক্ত।
        </p>
        <p className="rp-muted">
          সফটওয়্যার উত্তর তৈরির জন্য কেনা মূল PDF-এর নির্বাচিত পৃষ্ঠা আপনার ব্রাউজারে OCR দিয়ে
          পড়া হবে এবং সেই লেখা DeepSeek-এ পাঠানো হবে। সফটওয়্যার উত্তর যাচাই প্রয়োজন;
          অনিশ্চিত উত্তর ফাঁকা থাকবে।
        </p>
        {quote && !quote.aiAvailable && (
          <p role="note" className="rp-ai-warning">
            DeepSeek সংযোগ এখনো চালু নেই। পেমেন্টে প্রশ্নপত্র সংরক্ষিত হবে, কিন্তু সফটওয়্যার
            উত্তর প্রস্তুত করতে অ্যাডমিনের DEEPSEEK_API_KEY সংযোগ প্রয়োজন।
          </p>
        )}
        {quote ? (
          <>
            <dl>
              <div>
                <dt>নির্বাচিত পৃষ্ঠা</dt>
                <dd>
                  {selected.join(", ")} · {selected.length} পৃষ্ঠা
                </dd>
              </div>
              <div>
                <dt>প্রশ্নপত্র ইউনিট</dt>
                <dd>{quote.units}</dd>
              </div>
              <div>
                <dt>প্যাকেজ থেকে ব্যবহার</dt>
                <dd>
                  {quote.packageUnits} / অবশিষ্ট {quote.packageRemaining}
                </dd>
              </div>
              <div>
                <dt>এখন ব্যালেন্স থেকে কাটবে</dt>
                <dd>৳{quote.total / 100}</dd>
              </div>
              <div>
                <dt>বর্তমান ব্যালেন্স</dt>
                <dd>
                  {quote.admin ? "Admin · বিনামূল্যে" : `৳${quote.balance / 100}`}
                </dd>
              </div>
              <div>
                <dt>কাটার পর ব্যালেন্স</dt>
                <dd>
                  {quote.admin
                    ? "প্রযোজ্য নয়"
                    : `৳${Math.max(0, quote.balance - quote.total) / 100}`}
                </dd>
              </div>
            </dl>
            {quote.owned && (
              <p>এই নির্বাচনের প্রশ্নপত্র আগে কেনা হয়েছে। নতুন করে টাকা কাটবে না।</p>
            )}
            <p className="rp-muted">
              সম্মতি দিলে প্রশ্নপত্র ও পাওয়া অনুমোদিত উত্তরমালা আপনার অ্যাকাউন্টে
              সংরক্ষিত হবে। একই নির্বাচনে পুনরায় edit/print বিনামূল্যে। পৃষ্ঠা/ক্রম
              বদলালে নতুন নির্বাচন হিসেবে মূল্য দেখা হবে।
            </p>
            {quote.balance < quote.total && !quote.admin ? (
              <Link href="/wallet">ব্যালেন্স recharge করুন →</Link>
            ) : (
              <button className="rp-action-setup" disabled={busy} onClick={pay}>
                {busy
                  ? "যাচাই হচ্ছে…"
                  : confirmedReceipt
                    ? "সংরক্ষিত প্রশ্নপত্র আবার খুলুন"
                    : quote.total
                      ? `৳${quote.total / 100} দিয়ে সেটআপে যান`
                      : "নিশ্চিত করে সেটআপে যান"}
              </button>
            )}
          </>
        ) : (
          !error && <p role="status">মূল্য ও ব্যালেন্স যাচাই হচ্ছে…</p>
        )}
        {error && <p role="alert">{error}</p>}
        <button disabled={busy} onClick={onClose}>
          এখন নয়
        </button>
        <Link href="/ready-papers/saved">
          ৳৯৯ মাসিক প্যাকেজ / আমার প্রশ্নপত্র →
        </Link>
      </section>
    </div>
  );
}
