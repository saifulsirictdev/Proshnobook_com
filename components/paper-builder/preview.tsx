"use client";
import { paperFonts } from "@/lib/paper-fonts";
import { writtenFlowBlocks, type WrittenFlow } from "@/lib/written-flow";
import {
  autoModelQuestionMarks,
  autoModelPartMarks,
} from "@/lib/auto-model-paper";
import {
  englishFlowBlocks,
  withEnglishPartHeadings,
} from "@/lib/english/flow-blocks";
import EnglishGroup from "./english-group";
import InlineText, { type InlineEditApi } from "./inline-text";
import { questionProvenanceLabels } from "@/lib/question-provenance";
import { cqPartMark } from "@/lib/paper-cq-marks";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  paginateContinuous,
  continuousColumnCount,
  type FlowSegment,
} from "@/lib/continuous-paper";
import PaperAnswer from "./paper-answer";
import HeaderPreview from "./header-preview";
import DefaultHeaderPreview from "./default-header-preview";
import {
  resolveDefaultHeader,
  usesDefaultHeader,
  type DefaultHeaderValues,
} from "@/lib/default-paper-header";
import { currentHeader } from "@/lib/paper-header";
import RichPaperText from "./rich-paper-text";
import {
  bn,
  preparePaperMath,
  paperContentDimensions,
  optionLabel,
  labels,
  paginate,
  safeImage,
  safeLogo,
  type PaperItem,
  type PaperSettings,
} from "@/lib/paper-builder";
function PaperMathText({
  text,
  inlineImages = false,
}: {
  text: string;
  inlineImages?: boolean;
}) {
  if (!inlineImages) return <RichPaperText text={text} />;
  // Auto-model self-contained diagrams: no HTML/attributes are interpreted.
  const parts = text.split(/(!\[[^\]\n]*\]\(https:\/\/[^\s)]+\))/g);
  return (
    <>
      {parts.map((part, i) => {
        const image = part.match(/^!\[([^\]\n]*)\]\((https:\/\/[^\s)]+)\)$/);
        return image && safeImage(image[2]) ? (
          <img
            key={i}
            src={image[2]}
            alt={image[1] || "প্রশ্নের চিত্র"}
            referrerPolicy="no-referrer"
            style={{
              display: "block",
              maxWidth: "100%",
              width: 180,
              height: "auto",
              margin: "6px auto",
            }}
          />
        ) : (
          <RichPaperText key={i} text={part} />
        );
      })}
    </>
  );
}

export type PreviewQuestion = {
  q: PaperItem;
  opts: [string, string][];
  ci: number;
  writtenFlow?: WrittenFlow;
};
export type PreviewSection = {
  type: string;
  title: string;
  questions: PreviewQuestion[];
  instruction?: string;
  startNumber?: number;
};
export default function PaperPreview({
  s,
  questions: originalQuestions,
  type,
  setName,
  duplicate,
  onImageSize,
  title,
  onQuestionAction,
  previewScale = 1,
  defaultHeaderValues,
  defaultHeaderEditor,
  mode = "questions",
  sections: originalSections,
  auxiliaryOnly = false,
  readOnly = false,
  inlineEdit,
}: {
  onQuestionAction?: (
    id: string,
    action: "remove" | "reset" | "exchange",
  ) => void;
  sections?: PreviewSection[];
  auxiliaryOnly?: boolean;
  readOnly?: boolean;
  /** Click-to-edit API; absent in read-only/marketplace previews. */
  inlineEdit?: InlineEditApi;
  s: PaperSettings;
  questions: PreviewQuestion[];
  type: string;
  setName: string;
  duplicate: Set<string>;
  onImageSize: (id: string, size: number | undefined) => void;
  title: string;
  previewScale?: number;
  defaultHeaderValues?: DefaultHeaderValues;
  /** Only the visible primary paper receives controls; measurement stays static. */
  defaultHeaderEditor?: React.ReactNode;
  mode?: "questions" | "answers" | "omr";
}) {
  const expand = (list: PreviewQuestion[], kind: string, startNumber = 0) =>
    writtenFlowBlocks(
      withEnglishPartHeadings(list).flatMap((v) =>
        englishFlowBlocks(v.q).map((q) => ({ ...v, q })),
      ),
      kind,
      mode === "questions" && s.cfg.format === "q",
      startNumber,
    );
  const questions = useMemo(
    () => expand(originalQuestions, type),
    [originalQuestions, type, mode, s.cfg.format],
  );
  const sections = useMemo(
    () =>
      originalSections?.map((section) => ({
        ...section,
        questions: expand(section.questions, section.type, section.startNumber),
      })),
    [originalSections, mode, s.cfg.format],
  );
  const [flowPages, setFlowPages] = useState<FlowSegment[][]>([]);
  const [pages, setPages] = useState<number[][][]>([]);
  const [oversized, setOversized] = useState(false);
  const [extrasFor, setExtrasFor] = useState<string | null>(null);
  const [fittedFont, setFittedFont] = useState(s.cfg.fontSize);
  useEffect(() => setFittedFont(s.cfg.fontSize), [s, questions]);
  const measure = useRef<HTMLDivElement>(null);
  const [width, height] = paperContentDimensions(s);
  const cols =
    s.cfg.orientation === "landscape"
      ? 1
      : mode === "omr"
        ? 3
        : mode === "answers" && type === "MCQ"
          ? 4
          : type === "MCQ"
            ? s.cfg.cols
            : s.cfg.cqColumns;
  const numberToAnswer = Math.min(
    originalQuestions.length,
    (type === "MCQ"
      ? s.cfg.mcqAnswer
      : type === "CQ"
        ? s.cfg.cqAnswer
        : s.cfg.shortAnswer) || originalQuestions.length,
  );
  const legacyHeader = (
    <div className="paper-heading text-center">
      {s.show.title && (
        <h2 style={{ fontSize: "1.65em", fontWeight: 700, margin: 0 }}>
          {s.info.inst || "আপনার প্রতিষ্ঠানের নাম"}
        </h2>
      )}
      {s.show.address && <p>{s.info.address || "প্রতিষ্ঠানের ঠিকানা"}</p>}
      {s.show.exam && s.info.exam && (
        <p className="font-semibold">{s.info.exam}</p>
      )}
      <p>
        {[s.show.cls && s.info.cls, s.show.subject && s.info.subject]
          .filter(Boolean)
          .join(" — ")}
      </p>
      {s.show.chapter && s.info.chapter && <p>({s.info.chapter})</p>}
      {s.show.subjCode && <p>বিষয় কোড: {s.info.code || "…………"}</p>}
      <div className="my-2 flex justify-between border-y-2 border-black py-1 font-bold">
        <span>সময়– {s.info.minutes || "…………"}</span>
        <span>{(s.show.setCode || s.show.autoSet) && `সেট ${setName}`}</span>
        <span>পূর্ণমান– {s.info.marks || "…………"}</span>
      </div>
      {s.show.examinee && (
        <p className="my-2 text-left">
          নাম: …………………………… রোল: …………… শাখা: ……………
        </p>
      )}
      {s.show.obtained && (
        <div className="mb-2 border border-black p-2 text-right">
          প্রাপ্ত নম্বর: ……………
        </div>
      )}
      {s.show.instr && <p className="mb-2 italic">{s.info.instr}</p>}
      {!sections && (
        <h3 className="font-bold underline" style={{ whiteSpace: "pre-line" }}>
          {title}
          {mode === "questions" && type === "MCQ"
            ? " (প্রতিটি প্রশ্নের মান ১)"
            : ""}
        </h3>
      )}
      {mode === "questions" &&
        !sections &&
        !questions.some((v) => v.q.englishGroup) && (
          <p className="mb-3 text-right text-[0.85em]">
            {bn(originalQuestions.length)}টির মধ্যে {bn(numberToAnswer)}টির উত্তর
            দাও।
          </p>
        )}
    </div>
  );
  const referenceEnglish = originalQuestions.some(
    (v) => v.q.englishGroup?.referenceModel,
  );
  const resolvedDefaultHeader =
    defaultHeaderValues ??
    resolveDefaultHeader(
      s,
      (
        originalSections?.flatMap((part) => part.questions) ?? originalQuestions
      ).map((v) => v.q),
    );
  const paperHeader = (editable: boolean) =>
    usesDefaultHeader(s) ? (
      <div className="paper-heading">
        {editable &&
        !readOnly &&
        mode === "questions" &&
        defaultHeaderEditor ? (
          defaultHeaderEditor
        ) : (
          <DefaultHeaderPreview values={resolvedDefaultHeader} />
        )}
      </div>
    ) : s.header.enabled ? (
      <div className="paper-heading">
        <HeaderPreview
          referenceModel={referenceEnglish}
          header={
            sections
              ? {
                  ...currentHeader(s),
                  fields: {
                    ...currentHeader(s).fields,
                    questionType: {
                      ...currentHeader(s).fields.questionType,
                      enabled: false,
                    },
                  },
                }
              : currentHeader(s)
          }
          setName={setName}
          autoSet={s.show.autoSet}
          sectionTitle={
            !sections && (mode !== "questions" || type !== "MCQ")
              ? title
              : undefined
          }
        />
        {s.show.examinee &&
          !s.header.fields.studentName.enabled &&
          !s.header.fields.studentRoll.enabled && (
            <p className="my-2 text-left">
              নাম: …………………………… রোল: …………… শাখা: ……………
            </p>
          )}
        {s.show.obtained && (
          <div className="mb-2 border border-black p-2 text-right">
            প্রাপ্ত নম্বর: ……………
          </div>
        )}
        {mode === "questions" &&
          !sections &&
          !questions.some((v) => v.q.englishGroup) && (
            <p className="mb-3 text-right text-[0.85em]">
              {bn(originalQuestions.length)}টির মধ্যে {bn(numberToAnswer)}টির
              উত্তর দাও।
            </p>
          )}
      </div>
    ) : (
      legacyHeader
    );
  const header = (editable = false) => (
    <>
      {s.show.logo && safeLogo(s.info.logo) && (
        <img
          src={safeLogo(s.info.logo)!}
          alt="প্রতিষ্ঠানের লোগো"
          className="mx-auto mb-2 h-16 w-16 object-contain"
        />
      )}
      {s.show.brandHeader && (
        <p className="mb-2 border-b pb-1 text-center font-bold">
          <RichPaperText text={s.info.brandHeader} />
        </p>
      )}
      {s.show.instructor && (
        <p className="mb-2 text-center">{s.info.instructor}</p>
      )}
      {paperHeader(editable)}
    </>
  );
  function question(
    v: PreviewQuestion,
    index: number,
    typeOverride = type,
    startsColumn = false,
  ) {
    const type = typeOverride;
    const { q, opts, ci, writtenFlow: flow } = v;
    const first = !flow || flow.first,
      last = !flow || flow.last;
    if (flow) index = flow.questionIndex;
    if (q.englishGroup)
      return (
        <EnglishGroup
          q={q}
          s={s}
          inline={inlineEdit}
          questions={mode === "questions" && s.cfg.format !== "ans"}
          answers={
            mode === "answers" ||
            s.cfg.format === "qa" ||
            s.cfg.format === "ans" ||
            s.cfg.format === "sug"
          }
        />
      );
    if (mode !== "questions")
      return (
        <div
          className="paper-question"
          style={{ paddingBottom: "0.7em", breakInside: "avoid" }}
        >
          <b>{bn(index + 1)}। </b>
          {mode === "omr" ? (
            labels[s.cfg.label].map((l) => `◯${l}`).join("  ")
          ) : type === "MCQ" ? (
            ci >= 0 ? (
              labels[s.cfg.label][ci] || bn(ci + 1)
            ) : (
              "উত্তর নেই"
            )
          ) : (
            <PaperAnswer
              explanation={q.explanation}
              answers={q.answers}
              cq={type === "CQ"}
            />
          )}
        </div>
      );

    const baseId = q.id.split(":flow:")[0];
    const attachment = s.attachments[baseId] || s.attachments[q.id];
    const image = safeImage(attachment?.image || "");
    const marked = s.cfg.format === "qa" || s.cfg.format === "sug";
    return (
      <div
        data-question-id={q.id}
        data-question-fragment={flow?.partIndex ?? 0}
        data-question-number={index + 1}
        className={`paper-question ${s.show.duplicates && duplicate.has(q.id) ? "paper-duplicate" : ""}`}
        style={{
          paddingBottom: last ? "0.7em" : "0.2em",
          breakInside: "avoid",
        }}
      >
        {first && !readOnly && onQuestionAction && (
          <div
            data-noprint
            className="mb-2 flex gap-2 rounded bg-slate-100 p-1 text-xs text-slate-700"
          >
            {(
              [
                ["remove", "মুছুন"],
                ["reset", "মূল লেখা"],
                ["exchange", "Exchange"],
              ] as const
            ).map(([action, label]) => (
              <button
                key={action}
                onClick={() => onQuestionAction(q.id, action)}
                className="rounded border bg-white px-2 py-1"
              >
                {label}
              </button>
            ))}
            {inlineEdit?.editable && (
              <button
                type="button"
                aria-expanded={extrasFor === baseId}
                aria-label={`প্রশ্ন ${index + 1} ছবি ও গুরুত্ব`}
                onClick={() =>
                  setExtrasFor(extrasFor === baseId ? null : baseId)
                }
                className="rounded border bg-white px-2 py-1"
              >
                ছবি / ★
              </button>
            )}
          </div>
        )}
        {first && inlineEdit?.editable && extrasFor === baseId && (
          <div
            data-noprint
            className="mb-2 rounded border border-emerald-200 bg-white p-2 text-xs"
          >
            <label className="block">
              ছবির HTTPS URL
              <input
                type="url"
                className="mt-1 w-full rounded border border-slate-200 p-1"
                value={s.attachments[baseId]?.image || ""}
                onChange={(e) =>
                  inlineEdit.attachment(baseId, { image: e.target.value })
                }
              />
            </label>
            {s.attachments[baseId]?.image &&
              !safeImage(s.attachments[baseId].image) && (
                <p className="mt-1 text-red-600">সঠিক HTTPS ছবির URL দিন।</p>
              )}
            {type === "CQ" && (
              <label className="mt-1 block">
                বিভাগের নাম
                <input
                  className="mt-1 w-full rounded border border-slate-200 p-1"
                  value={s.attachments[baseId]?.division || ""}
                  placeholder={q.topic || "সাধারণ বিভাগ"}
                  onChange={(e) =>
                    inlineEdit.attachment(baseId, { division: e.target.value })
                  }
                />
              </label>
            )}
            <label className="mt-1 flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!s.attachments[baseId]?.important}
                onChange={(e) =>
                  inlineEdit.attachment(baseId, { important: e.target.checked })
                }
              />
              গুরুত্বপূর্ণ প্রশ্ন
            </label>
            <button
              type="button"
              className="mt-1 underline"
              onClick={() => setExtrasFor(null)}
            >
              বন্ধ করুন
            </button>
          </div>
        )}
        <div className="flex items-start gap-1.5">
          <b
            className="shrink-0"
            style={{ visibility: first || startsColumn ? "visible" : "hidden" }}
            aria-label={
              !first && startsColumn ? `প্রশ্ন ${bn(index + 1)} চলমান` : undefined
            }
          >
            {bn(String(index + 1).padStart(2, "0"))}।
          </b>
          <div className="min-w-0 flex-1">
            {first &&
              s.show.marks &&
              (() => {
                const editedMarks = (q as PaperItem & { marks?: number }).marks;
                const shownMarks =
                  editedMarks ??
                  (s.autoModel
                    ? autoModelQuestionMarks(s, type, q.id)
                    : type === "CQ"
                      ? 10
                      : 1);
                return (
                  <span
                    className="float-right"
                    style={
                      s.autoModel ? { marginInlineStart: "0.5em" } : undefined
                    }
                  >
                    <InlineText
                      mini
                      numeric
                      editable={!!inlineEdit?.editable}
                      label={`প্রশ্ন ${index + 1} মার্কস`}
                      value={String(shownMarks)}
                      onSave={(next) =>
                        inlineEdit?.saveMarks(q, null, Number(next))
                      }
                    >
                      {`[${bn(shownMarks)}]`}
                    </InlineText>
                  </span>
                );
              })()}
            {first && (
              <span>
                {s.show.important && attachment?.important && (
                  <b aria-label="গুরুত্বপূর্ণ প্রশ্ন">★ </b>
                )}
                <InlineText
                  editable={!!inlineEdit?.editable}
                  label={`প্রশ্ন ${index + 1}`}
                  value={
                    inlineEdit
                      ? inlineEdit.resolve(
                          q,
                          type === "CQ" && q.stimulus ? "stimulus" : "text",
                        )
                      : null
                  }
                  onSave={(next) =>
                    inlineEdit?.save(
                      q,
                      type === "CQ" && q.stimulus ? "stimulus" : "text",
                      next,
                    )
                  }
                >
                  <PaperMathText
                    text={type === "CQ" ? q.stimulus || q.text : q.text}
                    inlineImages={!!s.autoModel}
                  />
                </InlineText>
                {s.show.boardSource &&
                  questionProvenanceLabels(q).map((label) => (
                    <span
                      key={label}
                      className="paper-provenance"
                      style={{
                        display: "inline-block",
                        maxWidth: "100%",
                        marginInlineStart: "0.6em",
                        fontSize: "0.78em",
                        whiteSpace: "normal",
                        overflowWrap: "anywhere",
                      }}
                    >
                      [{label}]
                    </span>
                  ))}
              </span>
            )}

            {first && image && (
              <div
                className={`paper-image-wrap group ${s.cfg.imagePosition === "center" ? "text-center" : "text-left"}`}
              >
                <img
                  src={image}
                  alt="প্রশ্নের চিত্র"
                  referrerPolicy="no-referrer"
                  style={{
                    width: attachment?.size || s.cfg.imageSize,
                    maxWidth: "100%",
                    height: "auto",
                    display: "inline-block",
                    margin: "6px 0",
                  }}
                />
                {!readOnly && (
                  <div
                    data-noprint
                    className="flex justify-center gap-2 text-xs"
                  >
                    <button
                      onClick={() =>
                        onImageSize(
                          q.id,
                          Math.max(
                            80,
                            (attachment?.size || s.cfg.imageSize) - 20,
                          ),
                        )
                      }
                    >
                      −
                    </button>
                    <button onClick={() => onImageSize(q.id, undefined)}>
                      রিসেট
                    </button>
                    <button
                      onClick={() =>
                        onImageSize(
                          q.id,
                          Math.min(
                            600,
                            (attachment?.size || s.cfg.imageSize) + 20,
                          ),
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            )}
            {type === "MCQ" && (
              <div
                className="mt-1 grid gap-x-3 gap-y-0.5"
                style={{
                  gridTemplateColumns: `repeat(${s.cfg.optCols},minmax(0,1fr))`,
                }}
              >
                {opts.map(([key, value], i) => {
                  const label = labels[s.cfg.label][i] || bn(i + 1);
                  return (
                    <div
                      key={key}
                      className={`flex items-start gap-1 ${marked && i === ci ? "font-bold underline" : ""}`}
                    >
                      <span className="shrink-0">
                        {s.cfg.style === "paren"
                          ? `(${label})`
                          : s.cfg.style === "close"
                            ? `${label})`
                            : s.cfg.style === "dot"
                              ? `${label}.`
                              : `◦ ${label}`}
                      </span>
                      <InlineText
                        editable={!!inlineEdit?.editable}
                        label={`প্রশ্ন ${index + 1} অপশন ${key}`}
                        value={
                          inlineEdit
                            ? inlineEdit.resolve(q, `opt:${key}`)
                            : null
                        }
                        onSave={(next) =>
                          inlineEdit?.save(q, `opt:${key}`, next)
                        }
                      >
                        <PaperMathText text={value} />
                      </InlineText>
                    </div>
                  );
                })}
              </div>
            )}
            {type === "CQ" && q.subQuestions && (
              <div className={first ? "mt-2 space-y-1" : "space-y-1"}>
                {Object.entries(q.subQuestions)
                  .filter(([, text]) => !!text?.trim())
                  .map(
                    ([key, text], i) =>
                      (!flow || flow.partIndex < 0 || flow.partIndex === i) && (
                        <p key={key} data-cq-part={key}>
                          <b>{optionLabel(labels.bn[i], s.cfg.cqStyle)} </b>
                          <InlineText
                            editable={!!inlineEdit?.editable}
                            label={`প্রশ্ন ${index + 1} উপপ্রশ্ন ${key}`}
                            value={
                              inlineEdit
                                ? inlineEdit.resolve(q, `sub:${key}`)
                                : null
                            }
                            onSave={(next) =>
                              inlineEdit?.save(q, `sub:${key}`, next)
                            }
                          >
                            <PaperMathText text={text} />
                          </InlineText>
                          <span className="float-right">
                            <InlineText
                              mini
                              numeric
                              editable={!!inlineEdit?.editable}
                              label={`প্রশ্ন ${index + 1} উপপ্রশ্ন ${key} মার্কস`}
                              value={String(
                                (
                                  q as PaperItem & {
                                    partMarks?: Record<string, number>;
                                  }
                                ).partMarks?.[key] ??
                                  (s.autoModel
                                    ? autoModelPartMarks(s, i)
                                    : cqPartMark({ part: key, index: i, subject: q.subject, paperSubject: s.info.subject, autoModel: s.autoModel })),
                              )}
                              onSave={(next) =>
                                inlineEdit?.saveMarks(q, key, Number(next))
                              }
                            >
                              {bn(
                                (
                                  q as PaperItem & {
                                    partMarks?: Record<string, number>;
                                  }
                                ).partMarks?.[key] ??
                                  (s.autoModel
                                    ? autoModelPartMarks(s, i)
                                    : cqPartMark({ part: key, index: i, subject: q.subject, paperSubject: s.info.subject, autoModel: s.autoModel })),
                              )}
                            </InlineText>
                          </span>
                        </p>
                      ),
                  )}
              </div>
            )}
            {last && marked && type !== "MCQ" && (
              <div className="mt-2">
                <b>উত্তর: </b>
                <PaperAnswer
                  explanation={q.explanation}
                  answers={q.answers}
                  cq={type === "CQ"}
                />
              </div>
            )}
            {last && s.show.tags && (
              <p className="mt-1 text-[0.72em]">
                {[q.topic, q.source?.replace(/এআই|\bAI\b/g, "সফটওয়্যার")]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
  function sectionHeading(section: PreviewSection, id?: string) {
    const questionCount = section.questions.filter(
      (v) => !v.writtenFlow || v.writtenFlow.first,
    ).length;
    const answer =
      (section.type === "MCQ"
        ? s.cfg.mcqAnswer
        : section.type === "CQ"
          ? s.cfg.cqAnswer
          : s.cfg.shortAnswer) || questionCount;
    return (
      <div id={id} style={{ paddingTop: "0.5em", paddingBottom: "0.5em" }}>
        <h3 className="font-bold underline" style={{ whiteSpace: "pre-line" }}>
          {section.title}
          {section.type === "MCQ" ? " (প্রতিটি প্রশ্নের মান ১)" : ""}
        </h3>
        <p
          className="text-right"
          style={{ fontSize: "0.85em", marginBottom: 0 }}
        >
          {section.instruction !== undefined ? (
            section.instruction
          ) : (
            <>
              {bn(questionCount)}টির মধ্যে {bn(Math.min(answer, questionCount))}
              টির উত্তর দাও।
            </>
          )}
        </p>
      </div>
    );
  }
  // All mixed sections use one lane width, both when measuring and rendering.
  const sectionColumns = (_section: PreviewSection) =>
    s.cfg.orientation === "landscape"
      ? 1
      : continuousColumnCount(
          (sections ?? []).map((section) => section.type),
          s.cfg.cols,
          s.cfg.cqColumns,
        );
  useEffect(() => {
    const root = measure.current;
    if (!root) return;
    let frame = 0;
    const calculate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // Print CSS hides the measurement tree. Never repaginate from zero heights
        // while the native print dialog is opening (especially at mobile widths).
        if (window.matchMedia("print").matches || !root.getClientRects().length)
          return;
        const h =
          root
            .querySelector<HTMLElement>("[data-measure-header]")
            ?.getBoundingClientRect().height || 0;
        const continuationAvailable =
          (height * 96) / 25.4 -
          s.cfg.marginTop -
          s.cfg.marginBottom -
          28 -
          (s.show.brandFooter
            ? (root
                .querySelector<HTMLElement>("[data-measure-footer]")
                ?.getBoundingClientRect().height || 0) + 12
            : 0);
        const available = continuationAvailable - h;
        if (sections) {
          const measurements = sections.map((section, index) => {
            const node = root.querySelector<HTMLElement>(
              `[data-flow-section="${index}"]`,
            )!;
            return {
              heading: node
                .querySelector<HTMLElement>("[data-flow-heading]")!
                .getBoundingClientRect().height,
              heights: Array.from(
                node.querySelectorAll<HTMLElement>("[data-measure-question]"),
              ).map((el) => el.getBoundingClientRect().height),
              columns: sectionColumns(section),
              startRight: s.show.rightStart,
            };
          });
          if (
            s.cfg.autoFit &&
            fittedFont > 7 &&
            measurements.reduce(
              (sum, section) =>
                sum +
                section.heading +
                section.heights.reduce((a, b) => a + b, 0) / section.columns,
              0,
            ) > Math.max(50, available)
          ) {
            setFittedFont((v) => Math.max(7, v - 1));
            return;
          }
          setOversized(
            measurements.some((section) =>
              section.heights.some(
                (h) => h + section.heading > continuationAvailable,
              ),
            ),
          );
          setFlowPages(
            paginateContinuous(
              measurements,
              Math.max(50, available),
              Math.max(50, continuationAvailable),
            ),
          );
          return;
        }
        const blocks = Array.from(
          root.querySelectorAll<HTMLElement>("[data-measure-question]"),
        ).map((el) => el.getBoundingClientRect().height);
        if (
          s.cfg.autoFit &&
          mode === "questions" &&
          fittedFont > 7 &&
          blocks.reduce((sum, v) => sum + v, 0) >
            Math.max(50, available) * (s.show.rightStart ? 1 : cols)
        ) {
          setFittedFont((v) => Math.max(7, v - 1));
          return;
        }
        setOversized(blocks.some((v) => v > continuationAvailable));
        const reserved =
          s.show.rightStart && cols > 1
            ? Array(cols - 1).fill(Math.max(50, available))
            : [];
        const paginated = paginate(
          [...reserved, ...blocks],
          Math.max(50, available),
          cols,
          Math.max(50, continuationAvailable),
        );
        setPages(
          paginated.map((page) =>
            page.map((column) =>
              column
                .filter((i) => i >= reserved.length)
                .map((i) => i - reserved.length),
            ),
          ),
        );
      });
    };
    const observer = new ResizeObserver(calculate);
    observer.observe(root);
    root
      .querySelectorAll("[data-measure-question],img")
      .forEach((el) => observer.observe(el));
    document.fonts.ready.then(calculate);
    calculate();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [s, questions, height, cols, title, mode, fittedFont, sections]);
  const style = {
    width: `${width}mm`,
    minHeight: `${height}mm`,
    padding: `${s.cfg.marginTop}px ${s.cfg.marginRight}px ${s.cfg.marginBottom}px ${s.cfg.marginLeft}px`,
    color: s.cfg.ink,
    fontWeight: s.cfg.bold ? 700 : 400,
    fontStyle: s.cfg.italic ? "italic" : "normal",
    textDecoration:
      [s.cfg.underline ? "underline" : "", s.cfg.strike ? "line-through" : ""]
        .filter(Boolean)
        .join(" ") || "none",
    fontFamily: paperFonts[s.cfg.font],
    fontSize: `${s.cfg.autoFit ? fittedFont : s.cfg.fontSize}pt`,
    lineHeight: s.cfg.lineHeight,
    textAlign: s.cfg.align,
  } as const;
  return (
    <>
      <div
        aria-hidden="true"
        data-noprint
        ref={measure}
        className="paper-measure"
        style={{
          ...style,
          position: "absolute",
          left: "-100000px",
          top: 0,
          visibility: "hidden",
          pointerEvents: "none",
        }}
      >
        <div data-measure-header>{header()}</div>
        {s.show.brandFooter && (
          <div
            data-measure-footer
            className="border-t pt-1 text-center text-[0.75em]"
          >
            <RichPaperText text={s.info.brandFooter} />
          </div>
        )}
        {sections ? (
          sections.map((section, index) => (
            <div data-flow-section={index} key={index}>
              <div
                data-flow-heading
                style={{
                  width: `calc((100% - ${(sectionColumns(section) - 1) * s.cfg.columnGap}px) / ${sectionColumns(section)})`,
                }}
              >
                {sectionHeading(section)}
              </div>
              <div
                style={{
                  width: `calc((100% - ${(sectionColumns(section) - 1) * s.cfg.columnGap}px) / ${sectionColumns(section)})`,
                }}
              >
                {section.questions.map((v, i) => (
                  <div data-measure-question key={`${v.q.id}:${i}`}>
                    {question(v, i + (section.startNumber ?? 0), section.type)}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <>
            <div
              style={{
                width: `calc((100% - ${(cols - 1) * s.cfg.columnGap}px) / ${cols})`,
              }}
            >
              {questions.map((v, i) => (
                <div data-measure-question key={`${v.q.id}:${i}`}>
                  {question(v, i)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {s.cfg.autoFit && mode === "questions" && (
        <p data-noprint role="status" className="mb-2 text-xs text-emerald-700">
          Auto-fit: {fittedFont}pt — প্রয়োজনে সর্বনিম্ন ৭pt; না ধরলে পরের পাতায়
          যাবে।
        </p>
      )}
      {oversized && (
        <p
          data-noprint
          role="status"
          className="mb-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800"
        >
          কিছু প্রশ্ন এক পাতার চেয়ে বড়। ফন্ট বা ছবির আকার ছোট করুন; প্রিন্টে বড় প্রশ্ন
          একাধিক পাতায় ভাগ হতে পারে।
        </p>
      )}
      {sections &&
        s.cfg.format !== "ans" &&
        flowPages.map((segments, page) => (
          <div
            className="paper-page-viewport"
            style={{ zoom: previewScale }}
            key={page}
          >
            <div className="paper-sheet" style={style}>
              {s.show.watermark && (
                <div className="paper-watermark" aria-hidden="true">
                  {s.info.watermark || s.info.inst || "খসড়া"}
                </div>
              )}
              <div className="relative z-[1]">
                {page === 0 && header(true)}
                <div
                  className="paper-flow-body"
                  style={{
                    position: "relative",
                    height: Math.max(
                      ...segments.map(
                        (segment) => segment.top + segment.height,
                      ),
                    ),
                  }}
                >
                  {segments.map((segment, segmentIndex) => {
                    const section = sections[segment.section];
                    // Pagination belongs to the previous render until measurement
                    // catches up after a remove/exchange or section-count change.
                    if (!section) return null;
                    return (
                      <div
                        data-paper-section={section.type}
                        className="paper-column"
                        data-flow-lane={segment.lane}
                        key={segmentIndex}
                        style={{
                          position: "absolute",
                          top: segment.top,
                          left: `calc(${segment.lane} * (100% + ${s.cfg.columnGap}px) / ${segment.laneCount})`,
                          width: `calc((100% - ${(segment.laneCount - 1) * s.cfg.columnGap}px) / ${segment.laneCount})`,
                          boxSizing: "border-box",
                        }}
                      >
                        {s.show.divider && segment.lane > 0 && (
                          <span
                            aria-hidden="true"
                            className="paper-column-divider"
                            style={{ left: -s.cfg.columnGap / 2 }}
                          />
                        )}
                        {segment.heading &&
                          sectionHeading(
                            section,
                            sections.findIndex(
                              (part) => part.type === section.type,
                            ) === segment.section &&
                              setName === (s.show.autoSet ? "ক" : s.setName)
                              ? `paper-section-${section.type}`
                              : undefined,
                          )}
                        {segment.columns
                          .flat()
                          .filter((i) => !!section.questions[i])
                          .map((i) => (
                            <div key={`${section.questions[i].q.id}:${i}`}>
                              {question(
                                section.questions[i],
                                i + (section.startNumber ?? 0),
                                section.type,
                                segmentIndex === 0 ||
                                  segments[segmentIndex - 1].lane !==
                                    segment.lane,
                              )}
                            </div>
                          ))}
                      </div>
                    );
                  })}
                </div>
                {s.show.brandFooter && (
                  <p className="mt-3 border-t pt-1 text-center text-[0.75em]">
                    <RichPaperText text={s.info.brandFooter} />
                  </p>
                )}
                {s.show.pageNumbers && (
                  <p className="mt-3 text-center text-[0.7em]">
                    {bn(page + 1)} / {bn(flowPages.length)}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      {!sections &&
        !auxiliaryOnly &&
        (mode !== "questions" || s.cfg.format !== "ans") &&
        pages.map((columns, page) => (
          <div
            className="paper-page-viewport"
            style={{ zoom: previewScale }}
            key={page}
          >
            <div className="paper-sheet" style={style} key={page}>
              {s.show.watermark && (
                <div className="paper-watermark" aria-hidden="true">
                  {s.info.watermark || s.info.inst || "খসড়া"}
                </div>
              )}
              <div className="relative z-[1]">
                {page === 0 && header(true)}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${cols},minmax(0,1fr))`,
                    gap: s.cfg.columnGap,
                  }}
                >
                  {columns.map((indexes, col) => (
                    <div
                      key={col}
                      className="paper-column"
                      data-paper-column={col}
                    >
                      {s.show.divider && col > 0 && (
                        <span
                          aria-hidden="true"
                          className="paper-column-divider"
                          style={{ left: -s.cfg.columnGap / 2 }}
                        />
                      )}
                      {indexes
                        .filter((i) => !!questions[i])
                        .map((i, position) => (
                          <div key={`${questions[i].q.id}:${i}`}>
                            {question(questions[i], i, type, position === 0)}
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
                {s.show.brandFooter && (
                  <p className="mt-3 border-t pt-1 text-center text-[0.75em]">
                    <RichPaperText text={s.info.brandFooter} />
                  </p>
                )}
                {s.show.pageNumbers && (
                  <p className="mt-3 text-center text-[0.7em]">
                    {bn(page + 1)} / {bn(pages.length)}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      {sections &&
        (s.show.omr || s.cfg.ansKey || s.cfg.format === "ans") &&
        originalSections?.map((section, index) => (
          <PaperPreview
            key={index}
            s={s}
            questions={section.questions}
            type={section.type}
            title={section.title}
            setName={setName}
            duplicate={duplicate}
            onImageSize={onImageSize}
            previewScale={previewScale}
            defaultHeaderValues={resolvedDefaultHeader}
            auxiliaryOnly
          />
        ))}
      {!sections && mode === "questions" && s.show.omr && type === "MCQ" && (
        <PaperPreview
          s={s}
          questions={originalQuestions}
          type={type}
          setName={setName}
          duplicate={duplicate}
          onImageSize={onImageSize}
          title={`OMR — সেট ${setName}`}
          previewScale={previewScale}
          defaultHeaderValues={resolvedDefaultHeader}
          mode="omr"
        />
      )}
      {!sections &&
        mode === "questions" &&
        (s.cfg.ansKey || s.cfg.format === "ans") && (
          <PaperPreview
            s={s}
            questions={originalQuestions}
            type={type}
            setName={setName}
            duplicate={duplicate}
            onImageSize={onImageSize}
            title={`উত্তরমালা — ${title} — সেট ${setName}`}
            previewScale={previewScale}
            defaultHeaderValues={resolvedDefaultHeader}
            mode="answers"
          />
        )}
    </>
  );
}
