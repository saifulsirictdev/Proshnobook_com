import { safeImage, type PaperItem, type PaperSettings } from "@/lib/paper-builder";
import { englishBoardLabel } from "@/lib/english/board-source";
import RichPaperText from "./rich-paper-text";
export default function EnglishGroup({q,answers,questions=true,s}:{q:PaperItem;answers:boolean;questions?:boolean;s:PaperSettings}) {
  const group=q.englishGroup!;
  const attachment=s.attachments[group.attachmentId??q.id];
  const image=safeImage(attachment?.image??"");
  return <div className="paper-question" style={{whiteSpace:"pre-wrap",paddingBottom:group.passages.length?0:`${s.cfg.questionGap}px`}}>
    {questions && image && <img src={image} alt="Question illustration" style={{maxWidth:"100%",width:attachment?.size??s.cfg.imageSize}}/>}
    {questions && group.passages.map(p=><div key={p.key} style={{marginBottom:0}}><RichPaperText text={p.text}/></div>)}
    {questions && q.text!==group.tasks.map(t=>t.instruction).join("\n") && <p><RichPaperText text={q.text}/></p>}
    {group.tasks.map(t=><section key={t.id} style={{margin:0}}>
      {s.show.boardSource && !group.continued && t.boardSource && <p className="text-[0.85em]">[{englishBoardLabel(t.boardSource)}{s.show.marks && t.boardSource.originalMarks !== undefined && t.boardSource.originalMarks !== t.marks ? ` · মূল প্রশ্নে ${t.boardSource.originalMarks} নম্বর; practice-এ ${t.marks}` : ""}]</p>}
      <p>{!group.continued&&<><b>{t.number}. </b>{questions&&<RichPaperText text={t.instruction}/>} {s.show.marks&&<b> [{t.marks}]</b>}</>}</p>
      {questions && t.clues?.length ? <p className="border p-2">{t.clues.join(" · ")}</p>:null}
      {questions && t.table && <table className="my-2 w-full border-collapse"><thead><tr>{t.table.headers.map((h,i)=><th className="border border-black p-1" key={i}><RichPaperText text={h}/></th>)}</tr></thead><tbody>{t.table.rows.map((r,i)=><tr key={i}>{r.map((v,j)=><td className="border border-black p-1" key={j}><RichPaperText text={v}/></td>)}</tr>)}</tbody></table>}
      {t.subitems.map((sub,i)=><div style={{margin:0}} key={i}>
        <p>({String.fromCharCode(97+i+(group.subitemOffset??0))}) {questions&&<RichPaperText text={sub.text}/>}</p>
        {questions&&sub.options&&<ol className="grid" style={{gridTemplateColumns:`repeat(${s.cfg.optCols},minmax(0,1fr))`}}>{sub.options.map((o,j)=><li key={j}>({["i","ii","iii","iv"][j]??String(j+1)}) <RichPaperText text={o}/></li>)}</ol>}
        {answers&&sub.answer&&<p><b>Answer: </b><RichPaperText text={sub.answer}/></p>}
      </div>)}
      {answers&&t.answer&&<p><b>Answer: </b><RichPaperText text={t.answer}/></p>}
    </section>)}
  </div>;
}
