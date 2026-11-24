import { isEnglishPassageCloze } from "@/lib/english/cloze-layout";
import { isEnglishSharedTable } from "@/lib/english/shared-table";
import {
  englishInstructionParts,
  englishSubitemText,
} from "@/lib/english/reference-model";
import {
  safeImage,
  type PaperItem,
  type PaperSettings,
} from "@/lib/paper-builder";
import {
  englishBoardLabel,
  englishSchoolLabel,
} from "@/lib/english/board-source";
import RichPaperText from "./rich-paper-text";
import InlineText, { type InlineEditApi } from "./inline-text";
import { useState } from "react";
/** A real bordered cell per entry, rather than ambiguous dot-separated text. */
function EnglishWordBox({
  clues,
  field,
}: {
  clues: string[];
  field?: (j: number) => {
    editable: boolean;
    label: string;
    value: string | null;
    onSave: (next: string) => void;
  };
}) {
  const columns = Math.min(5, clues.length);
  const rows = Array.from(
    { length: Math.ceil(clues.length / columns) },
    (_, row) =>
      Array.from(
        { length: columns },
        (_, column) => clues[row * columns + column],
      ),
  );
  return (
    <table
      aria-label="Word box"
      className="english-clue-box"
      style={{
        width: "100%",
        tableLayout: "fixed",
        borderCollapse: "collapse",
        border: "1px solid #000",
        margin: "0.3em 0",
        breakInside: "avoid",
        whiteSpace: "normal",
      }}
    >
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((word, j) => (
              <td
                key={j}
                aria-hidden={word === undefined ? true : undefined}
                style={{
                  border: "1px solid #000",
                  padding: "0.2em 0.35em",
                  textAlign: "center",
                  verticalAlign: "middle",
                  overflowWrap: "anywhere",
                }}
              >
                {word !== undefined &&
                  (field ? (
                    <InlineText {...field(j)}>
                      <RichPaperText text={word} />
                    </InlineText>
                  ) : (
                    <RichPaperText text={word} />
                  ))}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
export default function EnglishGroup({
  q,
  answers,
  questions = true,
  s,
  inline,
}: {
  q: PaperItem;
  answers: boolean;
  questions?: boolean;
  s: PaperSettings;
  inline?: InlineEditApi;
}) {
  const [extras, setExtras] = useState(false);
  const group = q.englishGroup!;
  const reference = group.referenceModel;
  const parts = (t: (typeof group.tasks)[number]) =>
    reference || isEnglishPassageCloze(t) || t.clues?.length
      ? englishInstructionParts(t.instruction)
      : { heading: t.instruction, body: "" };
  const baseId = q.id.split(":flow:")[0];
  const attachment =
    s.attachments[group.attachmentId ?? baseId] ?? s.attachments[q.id];
  const image = safeImage(attachment?.image ?? "");
  const editable = !!inline?.editable && questions && !answers;
  const field = (path: string, label: string, qualifier = "") => ({
    editable,
    label: `${label} ${baseId}${qualifier ? ` ${qualifier}` : ""}`,
    value: inline ? inline.resolve(q, path) : null,
    onSave: (next: string) => inline?.save(q, path, next),
  });
  return (
    <div
      className={`paper-question${reference ? " english-reference-question" : ""}`}
      style={{
        whiteSpace: "pre-wrap",
        paddingBottom:
          group.passages.length && !reference ? 0 : `${s.cfg.questionGap}px`,
        breakInside: reference ? "avoid" : undefined,
      }}
    >
      {editable && (
        <div
          data-noprint
          className="mb-1 flex flex-wrap items-center gap-2 text-xs"
        >
          <button
            type="button"
            aria-expanded={extras}
            onClick={() => setExtras((v) => !v)}
            className="rounded border bg-white px-2 py-1"
          >
            ছবি / ★
          </button>
          {extras && (
            <>
              <label className="flex items-center gap-1">
                ছবির HTTPS URL
                <input
                  type="url"
                  className="rounded border border-slate-200 p-1"
                  value={attachment?.image || ""}
                  onChange={(e) =>
                    inline?.attachment(baseId, { image: e.target.value })
                  }
                />
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!attachment?.important}
                  onChange={(e) =>
                    inline?.attachment(baseId, { important: e.target.checked })
                  }
                />{" "}
                গুরুত্বপূর্ণ প্রশ্ন
              </label>
            </>
          )}
        </div>
      )}
      {questions && group.partHeading && (
        <h3
          className="english-part-heading"
          style={{
            fontWeight: 700,
            textAlign: reference ? "left" : "center",
            margin: "0.25em 0",
            breakAfter: "avoid",
            ...(reference
              ? {
                  display: "table",
                  background: "#000",
                  color: "#fff",
                  padding: "0 0.3em",
                  fontFamily: "Arial, sans-serif",
                }
              : {}),
          }}
        >
          {group.partHeading}
        </h3>
      )}
      {questions && image && (
        <img
          src={image}
          alt="Question illustration"
          style={{
            maxWidth: "100%",
            width: attachment?.size ?? s.cfg.imageSize,
          }}
        />
      )}
      {questions &&
        !reference &&
        group.passages.map((p) => (
          <div key={p.key} style={{ marginBottom: 0 }}>
            <InlineText {...field(`passage:${p.key}`, "পাসেজ", p.key)}>
              <RichPaperText text={p.text} />
            </InlineText>
          </div>
        ))}
      {questions &&
        q.text !== group.tasks.map((t) => t.instruction).join("\n") && (
          <p>
            <InlineText {...field("text", "প্রশ্ন লেখা")}>
              <RichPaperText text={q.text} />
            </InlineText>
          </p>
        )}
      {group.tasks.map((t) => (
        <section key={t.id} style={{ margin: 0 }}>
          {s.show.boardSource && !group.continued && t.boardSource && (
            <p className="text-[0.85em]">
              [{englishBoardLabel(t.boardSource)}
              {s.show.marks &&
              t.boardSource.originalMarks !== undefined &&
              t.boardSource.originalMarks !== t.marks
                ? ` · মূল প্রশ্নে ${t.boardSource.originalMarks} নম্বর; practice-এ ${t.marks}`
                : ""}
              ]
            </p>
          )}
          {s.show.boardSource && !group.continued && t.schoolSource && (
            <p className="text-[0.85em]">
              [{englishSchoolLabel(t.schoolSource)}
              {s.show.marks &&
              t.schoolSource.originalMarks !== undefined &&
              t.schoolSource.originalMarks !== t.marks
                ? ` · মূল প্রশ্নে ${t.schoolSource.originalMarks} নম্বর; practice-এ ${t.marks}`
                : ""}
              ]
            </p>
          )}
          <div
            className="english-question-heading"
            style={{
              display: "flex",
              gap: "1em",
              alignItems: "baseline",
              ...(reference ? { fontWeight: 700 } : {}),
            }}
          >
            {!group.continued && (
              <>
                <div
                  style={{
                    flex: 1,
                    ...(reference
                      ? { paddingLeft: "1.8em", textIndent: "-1.8em" }
                      : {}),
                  }}
                >
                  <b>{t.number}. </b>
                  {questions && (
                    <InlineText
                      {...field(`task:${t.id}:instruction`, "নির্দেশনা", t.id)}
                    >
                      <RichPaperText
                        text={parts(t).heading.replace(
                          /^Writing task\s*\([^)]*\)\.\s*Topic:\s*/i,
                          "",
                        )}
                      />
                    </InlineText>
                  )}
                </div>{" "}
                {s.show.marks && (
                  <b
                    className="english-mark-formula"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {reference ? (t.marksLabel ?? t.marks) : ` [${t.marks}]`}
                  </b>
                )}
              </>
            )}
          </div>
          {questions &&
            reference &&
            t.passageKey &&
            group.passages
              .filter((p) => p.key === t.passageKey)
              .map((p) => (
                <p key={p.key} style={{ marginLeft: "1.8em" }}>
                  <RichPaperText text={p.text} />
                </p>
              ))}
          {questions &&
            reference &&
            t.id === "narration" &&
            !parts(t).body &&
            !t.passageKey &&
            !t.subitems.length && (
              <p role="alert">
                [Dialogue passage missing in this saved draft. Regenerate this
                question before printing.]
              </p>
            )}
          {questions && !group.continued && t.clues?.length ? (
            <EnglishWordBox
              clues={t.clues}
              field={(j) =>
                field(`task:${t.id}:clue:${j}`, "শব্দবাক্স", `${t.id} ${j}`)
              }
            />
          ) : null}
          {questions && !group.continued && parts(t).body && (
            <p
              style={
                reference
                  ? {
                      marginLeft: "1.8em",
                      textAlign: "justify",
                      whiteSpace: "pre-wrap",
                    }
                  : undefined
              }
            >
              <InlineText
                {...field(`task:${t.id}:instruction`, "নির্দেশনা", t.id)}
              >
                <RichPaperText text={parts(t).body} />
              </InlineText>
            </p>
          )}
          {questions && t.table && (
            <table
              className="my-2 w-full border-collapse"
              style={
                reference
                  ? {
                      width: "calc(100% - 1.8em)",
                      margin: "0.25em 0 0.25em 1.8em",
                      borderCollapse: "collapse",
                    }
                  : undefined
              }
            >
              {!(reference && t.id === "substitution") && (
                <thead>
                  <tr>
                    {t.table.headers.map((h, i) => (
                      <th className="border border-black p-1" key={i}>
                        <InlineText
                          {...field(
                            `task:${t.id}:head:${i}`,
                            "টেবিল হেডার",
                            `${t.id} ${i}`,
                          )}
                        >
                          <RichPaperText text={h} />
                        </InlineText>
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {t.table.rows.map((r, i) => (
                  <tr key={i}>
                    {r.map((v, j) => (
                      <td
                        className="border border-black p-1"
                        style={
                          reference ? { padding: "0.1em 0.35em" } : undefined
                        }
                        key={j}
                      >
                        <InlineText
                          {...field(
                            `task:${t.id}:cell:${(group.tableOffset ?? 0) + i}:${j}`,
                            "টেবিল ঘর",
                            `${t.id} ${i} ${j}`,
                          )}
                        >
                          <RichPaperText text={v} />
                        </InlineText>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {(questions && !answers && isEnglishSharedTable(t)
            ? []
            : t.subitems
          ).map((sub, i) => (
            <div style={{ margin: 0 }} key={i}>
              {!isEnglishPassageCloze(t) && !isEnglishSharedTable(t) && (
                <p>
                  ({String.fromCharCode(97 + i + (group.subitemOffset ?? 0))}){" "}
                  {questions && (
                    <InlineText
                      {...field(
                        `task:${t.id}:sub:${(group.subitemOffset ?? 0) + i}`,
                        "উপপ্রশ্ন",
                        `${t.id} ${i}`,
                      )}
                    >
                      <RichPaperText
                        text={englishSubitemText(
                          sub.text,
                          i + (group.subitemOffset ?? 0),
                        )}
                      />
                    </InlineText>
                  )}
                </p>
              )}
              {questions && sub.options && (
                <ol
                  className="grid"
                  style={{
                    gridTemplateColumns: `repeat(${s.cfg.optCols},minmax(0,1fr))`,
                  }}
                >
                  {sub.options.map((o, j) => (
                    <li key={j}>
                      ({["i", "ii", "iii", "iv"][j] ?? String(j + 1)}){" "}
                      <InlineText
                        {...field(
                          `task:${t.id}:option:${(group.subitemOffset ?? 0) + i}:${j}`,
                          "উপপ্রশ্ন অপশন",
                          `${t.id} ${i} ${j}`,
                        )}
                      >
                        <RichPaperText text={o} />
                      </InlineText>
                    </li>
                  ))}
                </ol>
              )}
              {answers && sub.answer && (
                <p>
                  <b>
                    {isEnglishPassageCloze(t)
                      ? `(${String.fromCharCode(97 + i + (group.subitemOffset ?? 0))}) `
                      : isEnglishSharedTable(t)
                        ? `(${String.fromCharCode(97 + i + (group.subitemOffset ?? 0))}) Answer: `
                        : "Answer: "}
                  </b>
                  <RichPaperText text={sub.answer} />
                </p>
              )}
            </div>
          ))}
          {answers && t.answer && (
            <p>
              <b>Answer: </b>
              <RichPaperText text={t.answer} />
            </p>
          )}
        </section>
      ))}
    </div>
  );
}
