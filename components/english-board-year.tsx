"use client";
/** A blank value includes all approved sources; a year excludes unknown/school/model sources. */
export default function EnglishBoardYear({ value, onChange, disabled = false }: { value: string; onChange: (value: string) => void; disabled?: boolean }) {
  return <label className="block space-y-1">
    <span>SSC বোর্ড পরীক্ষার সাল</span>
    <input type="number" min={1990} max={2100} step={1} placeholder="সব সাল / সব অনুমোদিত উৎস" value={value} disabled={disabled} onChange={e => onChange(e.target.value)} className="block w-full rounded border border-slate-300 bg-white p-2 text-slate-900" />
    <span className="block text-sm">ফাঁকা রাখলে সব অনুমোদিত উৎস। সাল দিলে শুধু সেই সালের বোর্ড প্রশ্ন; না থাকলে অন্য সাল বা model question নেওয়া হবে না।</span>
  </label>;
}
