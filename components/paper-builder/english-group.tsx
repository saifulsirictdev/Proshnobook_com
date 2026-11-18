import { safeImage, type PaperItem, type PaperSettings } from "@/lib/paper-builder";
import RichPaperText from "./rich-paper-text";
export default function EnglishGroup({q,answers,questions=true,s}:{q:PaperItem;answers:boolean;questions?:boolean;s:PaperSettings}) {
  const group=q.englishGroup!;
  const attachment=s.attachments[q.id];
  const image=safeImage(attachment?.image??"");
  return <div className="paper-question space-y-3" style={{whiteSpace:"pre-wrap"}}>
    {questions && image && <img src={image} alt="Question illustration" style={{maxWidth:"100%",width:attachment?.size??s.cfg.imageSize}}/>}
    {questions && group.passages.map(p=><div key={p.key} className="mb-3"><RichPaperText text={p.text}/></div>)}
    {questions && q.text!==group.tasks.map(t=>t.instruction).join("\n") && <p><RichPaperText text={q.text}/></p>}
    {group.tasks.map(t=><section key={t.id} className="my-3">
      <p><b>{t.number}. </b>{questions&&<RichPaperText text={t.instruction}/>} {s.show.marks&&<b> [{t.marks}]</b>}</p>
      {questions && t.clues?.length ? <p className="border p-2">{t.clues.join(" · ")}</p>:null}
      {questions && t.table && <table className="my-2 w-full border-collapse"><thead><tr>{t.table.headers.map((h,i)=><th className="border border-black p-1" key={i}><RichPaperText text={h}/></th>)}</tr></thead><tbody>{t.table.rows.map((r,i)=><tr key={i}>{r.map((v,j)=><td className="border border-black p-1" key={j}><RichPaperText text={v}/></td>)}</tr>)}</tbody></table>}
      {t.subitems.map((sub,i)=><div className="my-2" key={i}>
        <p>({String.fromCharCode(97+i)}) {questions&&<RichPaperText text={sub.text}/>}</p>
        {questions&&sub.options&&<ol className="grid" style={{gridTemplateColumns:`repeat(${s.cfg.optCols},minmax(0,1fr))`}}>{sub.options.map((o,j)=><li key={j}>({["i","ii","iii","iv"][j]??String(j+1)}) <RichPaperText text={o}/></li>)}</ol>}
        {answers&&sub.answer&&<p><b>Answer: </b><RichPaperText text={sub.answer}/></p>}
      </div>)}
      {answers&&t.answer&&<p><b>Answer: </b><RichPaperText text={t.answer}/></p>}
    </section>)}
  </div>;
}
