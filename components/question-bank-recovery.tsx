"use client";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { BankDraft } from "@/lib/admin-question-bank-schema";
import {
  deviceRecoveryKey,
  parseDeviceRecovery,
  type RecoveryRecord,
} from "@/lib/question-bank-recovery-schema";

type Props = {
  owner: string;
  slot: string;
  baseRevision: string | null;
  draft: BankDraft;
  dirty: boolean;
  busy: boolean;
  restore: (draft: BankDraft) => void;
};
export type RecoveryHandle = { clearAfterSave: () => Promise<boolean> };
const control =
  "rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-800 disabled:opacity-50";
async function api(slot: string, command?: unknown) {
  const response = await fetch(
    `/api/admin/question-bank/draft?slot=${encodeURIComponent(slot)}`,
    command
      ? {
          signal: AbortSignal.timeout(12000),
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(command),
        }
      : {
          signal: AbortSignal.timeout(12000),
          credentials: "same-origin",
          cache: "no-store",
        },
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "খসড়া সেভ/লোড হয়নি।");
  return data.record as RecoveryRecord | null;
}

/** Recovery never calls the live question mutation endpoint and never auto-applies content. */
const QuestionBankRecovery = forwardRef<RecoveryHandle, Props>(
  function QuestionBankRecovery(
    { owner, slot, baseRevision, draft, dirty, busy, restore },
    ref,
  ) {
    const key = deviceRecoveryKey(owner, slot),
      preference = `question-bank-device-opt-in:v1:${encodeURIComponent(owner)}`;
    const [ready, setReady] = useState(false),
      [blocked, setBlocked] = useState(true);
    const [remote, setRemote] = useState<RecoveryRecord | null>(null),
      [device, setDevice] = useState<RecoveryRecord | null>(null);
    const [deviceEnabled, setDeviceEnabled] = useState(false),
      [status, setStatus] = useState("খসড়া খোঁজা হচ্ছে…");
    const [deviceStatus, setDeviceStatus] = useState("ডিভাইস কপি বন্ধ"),
      [tick, setTick] = useState(0);
    const revision = useRef<string | null>(null),
      lastSaved = useRef<string | null>(null),
      stopped = useRef(false);
    const active = useRef<Promise<void> | null>(null),
      localValue = useRef<string | null>(null);
    const mounted = useRef(true),
      deviceStopped = useRef(false);
    const serialized = JSON.stringify(draft);
    useEffect(() => {
      mounted.current = true;
      stopped.current = false;
      try {
        setDeviceEnabled(localStorage.getItem(preference) === "yes");
        localValue.current = localStorage.getItem(key);
        setDevice(parseDeviceRecovery(localValue.current, slot));
      } catch {
        setDeviceStatus(
          "Browser storage পাওয়া যায়নি; server copy-র অবস্থা দেখুন।",
        );
      }
      return () => {
        mounted.current = false;
        stopped.current = true;
      };
    }, [key, preference, slot]);
    async function load() {
      setReady(false);
      setBlocked(true);
      setStatus("Server খসড়া খোঁজা হচ্ছে…");
      let local: RecoveryRecord | null = null;
      try {
        localValue.current = localStorage.getItem(key);
        local = parseDeviceRecovery(localValue.current, slot);
        setDevice(local);
      } catch {
        setDeviceStatus("Device recovery পড়া যায়নি।");
      }
      try {
        const record = await api(slot);
        if (!mounted.current) return;
        revision.current = record?.revision ?? null;
        setRemote(record);
        setReady(true);
        setBlocked(Boolean(record || local));
        setStatus(
          record || local
            ? "Recovery পাওয়া গেছে—দেখে সিদ্ধান্ত নিন। Auto-save আপাতত থেমে আছে।"
            : "Auto-save প্রস্তুত; live প্রশ্ন এখনো সেভ হয়নি।",
        );
      } catch (error) {
        if (mounted.current)
          setStatus(
            (error as Error).message + " Auto-save বন্ধ আছে; আবার লোড করুন।",
          );
      }
    }
    useEffect(() => {
      void load(); /* owner/slot are stable for this editor mount */
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
      const changed = (event: StorageEvent) => {
        if (event.key === preference)
          setDeviceEnabled(event.newValue === "yes");
        if (event.key === key && event.newValue !== localValue.current) {
          setBlocked(true);
          deviceStopped.current = true;
          setDevice(parseDeviceRecovery(event.newValue, slot));
          setDeviceStatus(
            "অন্য ট্যাবে ডিভাইস কপি বদলেছে; এই ট্যাবের device auto-copy বন্ধ। Server-এ revision check চলবে।",
          );
        }
      };
      window.addEventListener("storage", changed);
      return () => window.removeEventListener("storage", changed);
    }, [key, slot, preference]);
    useEffect(() => {
      if (
        !deviceEnabled ||
        (!dirty && localValue.current === null) ||
        blocked ||
        busy ||
        stopped.current ||
        deviceStopped.current
      )
        return;
      const timer = setTimeout(() => {
        try {
          if (localStorage.getItem(key) !== localValue.current) {
            setBlocked(true);
            deviceStopped.current = true;
            setDeviceStatus(
              "অন্য ট্যাবের কপি পাওয়া গেছে; device copy overwrite হয়নি।",
            );
            return;
          }
          const value = JSON.stringify({
            version: 1,
            slot,
            revision: crypto.randomUUID(),
            baseRevision,
            updatedAt: new Date().toISOString(),
            draft,
          });
          localStorage.setItem(key, value);
          localValue.current = value;
          setDeviceStatus(
            "এই browser-এ recovery copy আছে; encrypted নয়, server backup-এর বিকল্প নয়।",
          );
        } catch {
          setDeviceStatus("ডিভাইসে সেভ হয়নি (storage বন্ধ/পূর্ণ হতে পারে)।");
        }
      }, 350);
      return () => clearTimeout(timer);
    }, [
      deviceEnabled,
      serialized,
      dirty,
      blocked,
      busy,
      key,
      slot,
      baseRevision,
    ]); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
      if (
        !ready ||
        blocked ||
        (!dirty && lastSaved.current === null) ||
        busy ||
        stopped.current ||
        active.current ||
        lastSaved.current === serialized
      )
        return;
      const timer = setTimeout(() => {
        if (!navigator.onLine) {
          setStatus(
            "Offline: server-এ সেভ হয়নি। Device copy চালু থাকলে তার অবস্থা আলাদা দেখুন।",
          );
          return;
        }
        setStatus("Recovery খসড়া server-এ সেভ হচ্ছে… (live প্রশ্ন নয়)");
        const work = (async () => {
          try {
            const record = await api(slot, {
              operation: "save",
              slot,
              expectedRevision: revision.current,
              baseRevision,
              draft,
            });
            revision.current = record!.revision;
            lastSaved.current = serialized;
            if (mounted.current)
              setStatus(
                `Recovery server-এ সেভ হয়েছে · ${new Date(record!.updatedAt).toLocaleTimeString("bn-BD")} · live প্রশ্ন/অনুমোদন বদলায়নি।`,
              );
          } catch (error) {
            if (mounted.current) {
              setBlocked(true);
              setStatus(
                (error as Error).message +
                  " Editor-এর টেক্সট আছে; আবার লোড করে তুলনা করুন।",
              );
            }
          } finally {
            active.current = null;
            if (mounted.current) setTick((n) => n + 1);
          }
        })();
        active.current = work;
      }, 1100);
      return () => clearTimeout(timer);
    }, [ready, blocked, serialized, dirty, busy, tick, baseRevision, slot]); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
      const online = () => setTick((n) => n + 1);
      window.addEventListener("online", online);
      return () => window.removeEventListener("online", online);
    }, []);
    useImperativeHandle(
      ref,
      () => ({
        clearAfterSave: async () => {
          stopped.current = true;
          await active.current;
          let clean = ready;
          try {
            if (revision.current)
              await api(slot, {
                operation: "discard",
                slot,
                expectedRevision: revision.current,
              });
          } catch {
            clean = false;
          }
          try {
            if (localStorage.getItem(key) === localValue.current)
              localStorage.removeItem(key);
            else clean = false;
          } catch {
            clean = false;
          }
          return clean;
        },
      }),
      [key, slot, ready],
    );
    function apply(record: RecoveryRecord) {
      const stale = record.baseRevision !== baseRevision;
      if (
        !confirm(
          `${stale ? "মূল প্রশ্নের revision বদলেছে। পুরোনো content ফিরবে—নতুন DB content নিজে থেকে বদলাবে না। " : ""}Recovery Editor-এ বসাবেন? এখনকার অসেভ লেখা প্রতিস্থাপিত হবে; live প্রশ্ন বদলাবে না।`,
        )
      )
        return;
      restore(record.draft);
      setRemote(null);
      setDevice(null);
      setBlocked(false);
      lastSaved.current = null;
      setStatus(
        "শুধু Editor-এ recovery বসেছে। যাচাই করে আলাদা Pending save দিন।",
      );
      setTick((n) => n + 1);
    }
    async function discard() {
      if (
        !confirm(
          "দেখানো server/device recovery copy মুছবেন? Editor-এর বর্তমান লেখা থাকবে।",
        )
      )
        return;
      try {
        if (revision.current)
          await api(slot, {
            operation: "discard",
            slot,
            expectedRevision: revision.current,
          });
        revision.current = null;
        lastSaved.current = null;
        try {
          if (localStorage.getItem(key) !== localValue.current) throw Error();
          localStorage.removeItem(key);
          localValue.current = null;
        } catch {
          setDeviceStatus(
            "Device copy সরানো নিশ্চিত হয়নি; অন্য ট্যাব বা storage পরীক্ষা করুন।",
          );
        }
        setRemote(null);
        setDevice(null);
        setBlocked(false);
        setStatus(
          "পুরোনো recovery বাদ দেওয়া হয়েছে। নতুন পরিবর্তনে auto-save হবে।",
        );
      } catch (error) {
        setStatus((error as Error).message);
      }
    }
    return (
      <section
        aria-label="খসড়া সুরক্ষা"
        className="space-y-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-slate-900"
      >
        <h3 className="font-bold">খসড়া সুরক্ষা · Auto-save / Recovery</h3>
        <p role="status" aria-live="polite">
          {status}
        </p>
        <p className="text-xs leading-6">
          এটি আপনার ব্যক্তিগত recovery খসড়া, প্রশ্নব্যাংকে Pending save বা
          প্রকাশ নয়। সফল Pending save-এর পরে এই editor-এর recovery সরানো হবে।
          অসম্পূর্ণ প্রশ্নও রাখা যায়। প্রতি Admin সর্বোচ্চ ২৫টি server recovery
          slot। Offline/শেষ মুহূর্তের পরিবর্তন server-এ না পৌঁছাতে পারে।
        </p>
        {(remote || device) && (
          <div className="space-y-3">
            {(
              [
                remote && { label: "Server", record: remote },
                device && { label: "এই ডিভাইস", record: device },
              ].filter(Boolean) as { label: string; record: RecoveryRecord }[]
            ).map(({ label, record }) => (
              <details key={label} className="rounded-lg border bg-white p-3">
                <summary className="cursor-pointer font-semibold">
                  {label} recovery ·{" "}
                  {new Date(record.updatedAt).toLocaleString("bn-BD")}
                  {record.baseRevision !== baseRevision
                    ? " · মূল revision আলাদা"
                    : ""}
                </summary>
                <p className="my-2 break-words">
                  {record.draft.category} / {record.draft.subject} /{" "}
                  {record.draft.topic}
                </p>
                <pre className="max-h-52 overflow-auto whitespace-pre-wrap break-all text-xs">
                  {JSON.stringify(record.draft, null, 2)}
                </pre>
                <button
                  type="button"
                  className={control}
                  disabled={busy || (label === "Server" && !ready)}
                  onClick={() => apply(record)}
                >
                  {label} recovery Editor-এ বসান
                </button>
              </details>
            ))}
            <button
              type="button"
              className={control}
              disabled={busy || !ready}
              onClick={() => void discard()}
            >
              Recovery বাদ দিয়ে বর্তমান লেখা রাখুন
            </button>
          </div>
        )}
        <button
          type="button"
          className={control}
          disabled={busy || Boolean(active.current)}
          onClick={() => void load()}
        >
          Server recovery আবার লোড / তুলনা করুন
        </button>
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={deviceEnabled}
            disabled={busy}
            onChange={(event) => {
              const enabled = event.target.checked;
              setDeviceEnabled(enabled);
              try {
                localStorage.setItem(preference, enabled ? "yes" : "no");
                if (
                  !enabled &&
                  localStorage.getItem(key) === localValue.current
                ) {
                  localStorage.removeItem(key);
                  localValue.current = null;
                  setDevice(null);
                }
                setDeviceStatus(
                  enabled
                    ? "Device copy চালু; পরের পরিবর্তনে লেখা থাকবে।"
                    : "Device auto-copy বন্ধ।",
                );
              } catch {
                setDeviceStatus("Browser preference/storage সেভ হয়নি।");
              }
            }}
          />
          এই ডিভাইসে offline recovery copy রাখুন (ঐচ্ছিক; shared ডিভাইসে বন্ধ
          রাখুন)
        </label>
        <p className="text-xs">
          {deviceStatus} Browser storage মুছলে কপি হারাবে; অন্য ডিভাইসে যাবে না।
        </p>
      </section>
    );
  },
);
export default QuestionBankRecovery;
