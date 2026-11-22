// Local component proof. Auth, server action, checkout and DB are NOT exercised here.
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import QbStart from "../../components/qb-start";
import Preparation from "../../components/auto-model-preparation";
import PaperPreview from "../../components/paper-builder/preview";
import { autoModelSections } from "../../lib/auto-model-paper";
import { restoreSettings, type PaperSettings } from "../../lib/paper-builder";
import { fixtureItems } from "./fixtures";
import { useRouter } from "./navigation";
import "../../components/paper-builder/paper.css";
import "katex/dist/katex.min.css";
import "./style.css";
function App() {
  const [route, setRoute] = useState(location.pathname + location.search),
    [revision, setRevision] = useState(0),
    [width, setWidth] = useState(innerWidth);
  const router = useRouter();
  useEffect(() => {
    const pop = () => setRoute(location.pathname + location.search),
      resize = () => setWidth(innerWidth);
    addEventListener("popstate", pop);
    addEventListener("resize", resize);
    return () => {
      removeEventListener("popstate", pop);
      removeEventListener("resize", resize);
    };
  }, []);
  const params = new URLSearchParams(route.split("?")[1]);
  const s = restoreSettings(
    JSON.parse(localStorage.getItem("qb:settings") || "{}"),
  );
  const ids = JSON.parse(
    localStorage.getItem("qb:selected") || "[]",
  ) as string[];
  const items = ids.flatMap((id) => {
    const q = fixtureItems.find((q) => q.id === id);
    return q ? [{ ...q, ...s.edits[q.id] }] : [];
  });
  const sections = autoModelSections(items, s);
  function saveSettings(next: PaperSettings) {
    localStorage.setItem("qb:settings", JSON.stringify(next));
    setRevision(revision + 1);
  }
  return (
    <main className="paper-builder-root mx-auto max-w-5xl px-4 py-6">
      <aside
        data-noprint
        className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm"
      >
        <b>স্থানীয় UI পরীক্ষা — লাইভ প্রশ্নভান্ডার নয়</b>
        <p>
          মূল Starter / Preparation / PaperPreview চলছে; এখানে কৃত্রিম প্রশ্ন ও
          mock server response ব্যবহার হয়েছে। লগইন, payment, database save
          পরীক্ষা নয়।
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <button onClick={() => router.push("/question-builder")}>
            শুরুতে ফিরুন
          </button>
          <label>
            <input
              type="checkbox"
              defaultChecked={
                sessionStorage.getItem("auto-test-shortage") === "1"
              }
              onChange={(e) =>
                sessionStorage.setItem(
                  "auto-test-shortage",
                  e.target.checked ? "1" : "0",
                )
              }
            />{" "}
            প্রশ্নের ঘাটতি পরীক্ষা
          </label>
        </div>
      </aside>
      {route.startsWith("/question-builder/auto-model") ? (
        <div className="mx-auto max-w-2xl">
          <Preparation
            category={params.get("category") || ""}
            subject={params.get("subject") || ""}
            variant={params.get("variant") as "MCQ" | "CQ"}
          />
        </div>
      ) : route.startsWith("/question-builder/build") && sections ? (
        <>
          <section
            data-noprint
            className="mb-5 space-y-3 rounded-xl border bg-white p-4"
          >
            <h1 className="font-bold">নমুনা সেটআপ — ৩০ MCQ / ৮ CQ + ১৫ SQ</h1>
            <label className="block">
              প্রথম প্রশ্ন সম্পাদনা
              <textarea
                aria-label="প্রথম প্রশ্ন সম্পাদনা"
                className="mt-2 block w-full rounded border p-2"
                value={items[0].stimulus || items[0].text}
                onChange={(e) =>
                  saveSettings({
                    ...s,
                    edits: {
                      ...s.edits,
                      [items[0].id]: {
                        text: items[0].text,
                        ...(items[0].stimulus
                          ? { stimulus: e.target.value }
                          : { text: e.target.value }),
                      },
                    },
                  })
                }
              />
            </label>
            <button
              onClick={() => {
                localStorage.setItem(
                  "auto-test-saved",
                  JSON.stringify({ ids, settings: s }),
                );
                alert("নমুনা ব্রাউজারে সেভ হয়েছে");
              }}
            >
              নমুনা সেভ
            </button>{" "}
            ·{" "}
            <button
              onClick={() => {
                const raw = localStorage.getItem("auto-test-saved");
                if (raw) {
                  const saved = JSON.parse(raw);
                  localStorage.setItem(
                    "qb:selected",
                    JSON.stringify(saved.ids),
                  );
                  saveSettings(restoreSettings(saved.settings));
                }
              }}
            >
              পুনরায় খুলুন
            </button>{" "}
            · <button onClick={() => window.print()}>প্রিন্ট / PDF</button>
          </section>
          <div id="paper">
            <PaperPreview
              s={s}
              questions={sections[0].questions}
              sections={sections}
              type={sections[0].type}
              title={sections[0].title}
              setName="ক"
              duplicate={new Set()}
              previewScale={Math.min(1, (width - 40) / 794)}
              onImageSize={() => {}}
            />
          </div>
        </>
      ) : (
        <div className="mx-auto max-w-xl">
          <h1 className="text-2xl font-bold text-slate-900">
            প্রশ্ন তৈরী করুন
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            শ্রেণি → বিষয় → Chapter / Auto Model
          </p>
          <QbStart
            pairs={[
              { category: "SSC", subject: "গণিত" },
              { category: "SSC", subject: "বিজ্ঞান" },
            ]}
          />
        </div>
      )}
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
