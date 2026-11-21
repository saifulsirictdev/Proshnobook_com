import { isEnglishPassageCloze } from "@/lib/english/cloze-layout";
import { isEnglishSharedTable } from "@/lib/english/shared-table";
import { englishInstructionParts, englishSubitemText } from "@/lib/english/reference-model";
import { safeImage, type PaperItem, type PaperSettings } from "@/lib/paper-builder";
import { englishBoardLabel, englishSchoolLabel } from "@/lib/english/board-source";
import RichPaperText from "./rich-paper-text";
/** A real bordered cell per entry, rather than ambiguous dot-separated text. */
function EnglishWordBox({clues}:{clues:string[]}) {
  const columns = Math.min(5, clues.length);
  const rows = Array.from({length:Math.ceil(clues.length/columns)},(_,row)=>
    Array.from({length:columns},(_,column)=>clues[row*columns+column]));
  return <table aria-label="Word box" className="english-clue-box" style={{width:"100%",tableLayout:"fixed",borderCollapse:"collapse",border:"1px solid #000",margin:"0.3em 0",breakInside:"avoid",whiteSpace:"normal"}}>
    <tbody>{rows.map((row,i)=><tr key={i}>{row.map((word,j)=><td key={j} aria-hidden={word===undefined?true:undefined} style={{border:"1px solid #000",padding:"0.2em 0.35em",textAlign:"center",verticalAlign:"middle",overflowWrap:"anywhere"}}>{word!==undefined&&<RichPaperText text={word}/>}</td>)}</tr>)}</tbody>
  </table>;
}
export default function EnglishGroup({q,answers,questions=true,s}:{q:PaperItem;answers:boolean;questions?:boolean;s:PaperSettings}) {
  const group=q.englishGroup!;
  const reference = group.referenceModel;
  const parts = (t: typeof group.tasks[number]) => reference || (isEnglishPassageCloze(t) || t.clues?.length) ? englishInstructionParts(t.instruction) : {heading:t.instruction,body:""};
  const attachment=s.attachments[group.attachmentId??q.id];
  const image=safeImage(attachment?.image??"");
  return <div className={`paper-question${reference ? " english-reference-question" : ""}`} style={{whiteSpace:"pre-wrap",paddingBottom:group.passages.length&&!reference?0:`${s.cfg.questionGap}px`,breakInside:reference?"avoid":undefined}}>
    {questions && group.partHeading && <h3 className="english-part-heading" style={{fontWeight:700,textAlign:reference?"left":"center",margin:"0.25em 0",breakAfter:"avoid",...(reference?{display:"table",background:"#000",color:"#fff",padding:"0 0.3em",fontFamily:"Arial, sans-serif"}:{})}}>{group.partHeading}</h3>}
    {questions && image && <img src={image} alt="Question illustration" style={{maxWidth:"100%",width:attachment?.size??s.cfg.imageSize}}/>}
    {questions && !reference && group.passages.map(p=><div key={p.key} style={{marginBottom:0}}><RichPaperText text={p.text}/></div>)}
    {questions && q.text!==group.tasks.map(t=>t.instruction).join("\n") && <p><RichPaperText text={q.text}/></p>}
    {group.tasks.map(t=><section key={t.id} style={{margin:0}}>
      {s.show.boardSource && !group.continued && t.boardSource && <p className="text-[0.85em]">[{englishBoardLabel(t.boardSource)}{s.show.marks && t.boardSource.originalMarks !== undefined && t.boardSource.originalMarks !== t.marks ? ` · মূল প্রশ্নে ${t.boardSource.originalMarks} নম্বর; practice-এ ${t.marks}` : ""}]</p>}
      {s.show.boardSource && !group.continued && t.schoolSource && <p className="text-[0.85em]">[{englishSchoolLabel(t.schoolSource)}{s.show.marks && t.schoolSource.originalMarks !== undefined && t.schoolSource.originalMarks !== t.marks ? ` · মূল প্রশ্নে ${t.schoolSource.originalMarks} নম্বর; practice-এ ${t.marks}` : ""}]</p>}
      <div className="english-question-heading" style={{display:"flex",gap:"1em",alignItems:"baseline",...(reference?{fontWeight:700}:{})}}>{!group.continued&&<><div style={{flex:1,...(reference?{paddingLeft:"1.8em",textIndent:"-1.8em"}:{})}}><b>{t.number}. </b>{questions&&<RichPaperText text={parts(t).heading.replace(/^Writing task\s*\([^)]*\)\.\s*Topic:\s*/i, "")}/>}</div> {s.show.marks&&<b className="english-mark-formula" style={{whiteSpace:"nowrap"}}>{reference ? t.marksLabel ?? t.marks : ` [${t.marks}]`}</b>}</>}</div>
      {questions && reference && t.passageKey && group.passages.filter(p=>p.key===t.passageKey).map(p=><p key={p.key} style={{marginLeft:"1.8em"}}><RichPaperText text={p.text}/></p>)}
      {questions && reference && t.id==="narration" && !parts(t).body && !t.passageKey && !t.subitems.length && <p role="alert">[Dialogue passage missing in this saved draft. Regenerate this question before printing.]</p>}
      {questions && !group.continued && t.clues?.length ? <EnglishWordBox clues={t.clues}/>:null}
      {questions && !group.continued && parts(t).body && <p style={reference?{marginLeft:"1.8em",textAlign:"justify",whiteSpace:"pre-wrap"}:undefined}><RichPaperText text={parts(t).body}/></p>}
      {questions && t.table && <table className="my-2 w-full border-collapse" style={reference?{width:"calc(100% - 1.8em)",margin:"0.25em 0 0.25em 1.8em",borderCollapse:"collapse"}:undefined}>{!(reference && t.id==="substitution")&&<thead><tr>{t.table.headers.map((h,i)=><th className="border border-black p-1" key={i}><RichPaperText text={h}/></th>)}</tr></thead>}<tbody>{t.table.rows.map((r,i)=><tr key={i}>{r.map((v,j)=><td className="border border-black p-1" style={reference?{padding:"0.1em 0.35em"}:undefined} key={j}><RichPaperText text={v}/></td>)}</tr>)}</tbody></table>}
      {(questions && !answers && isEnglishSharedTable(t) ? [] : t.subitems).map((sub,i)=><div style={{margin:0}} key={i}>
        {!isEnglishPassageCloze(t) && !isEnglishSharedTable(t) && <p>({String.fromCharCode(97+i+(group.subitemOffset??0))}) {questions&&<RichPaperText text={englishSubitemText(sub.text,i+(group.subitemOffset??0))}/>}</p>}
        {questions&&sub.options&&<ol className="grid" style={{gridTemplateColumns:`repeat(${s.cfg.optCols},minmax(0,1fr))`}}>{sub.options.map((o,j)=><li key={j}>({["i","ii","iii","iv"][j]??String(j+1)}) <RichPaperText text={o}/></li>)}</ol>}
        {answers&&sub.answer&&<p><b>{isEnglishPassageCloze(t) ? `(${String.fromCharCode(97+i+(group.subitemOffset??0))}) ` : isEnglishSharedTable(t) ? `(${String.fromCharCode(97+i+(group.subitemOffset??0))}) Answer: ` : "Answer: "}</b><RichPaperText text={sub.answer}/></p>}
      </div>)}
      {answers&&t.answer&&<p><b>Answer: </b><RichPaperText text={t.answer}/></p>}
    </section>)}
  </div>;
}
