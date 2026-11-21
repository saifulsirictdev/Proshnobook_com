import type {
  DefaultHeaderKey,
  DefaultHeaderValues,
} from "@/lib/default-paper-header";
export const defaultHeaderLabels: Record<DefaultHeaderKey, string> = {
  institute: "প্রতিষ্ঠানের নাম",
  exam: "পরীক্ষার নাম",
  className: "শ্রেণি",
  subject: "বিষয়",
  time: "সময়",
  fullMarks: "পূর্ণমান",
};
/** Shared geometry for the printable default header and its inline editor.
 * Plain React text only: edited HTML is never interpreted or persisted. */
export default function DefaultHeaderPreview({
  values,
  renderField,
}: {
  values: DefaultHeaderValues;
  renderField?: (key: DefaultHeaderKey, value: string) => React.ReactNode;
}) {
  const field = (key: DefaultHeaderKey) => (
    <span className={`default-header-value default-header-${key}`}>
      {renderField ? renderField(key, values[key]) : values[key]}
    </span>
  );
  return (
    <div className="default-paper-header" aria-label="ডিফল্ট প্রশ্নপত্র হেডার">
      <div className="default-header-institute-row">{field("institute")}</div>
      <div className="default-header-exam-row">{field("exam")}</div>
      <div className="default-header-class-row">{field("className")}</div>
      <div className="default-header-subject-row">{field("subject")}</div>
      <div className="default-header-meta-row">
        <div>
          <span>সময়: </span>
          {field("time")}
        </div>
        <div>
          <span>পূর্ণমান: </span>
          {field("fullMarks")}
        </div>
      </div>
    </div>
  );
}
