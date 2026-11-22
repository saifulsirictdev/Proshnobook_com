// Isolated review harness: real production paper renderer/field/schema, no app auth or DB.
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import PaperPreview from "../../components/paper-builder/preview";
import RichTextField from "../../components/paper-builder/rich-text-field";
import { defaults, restoreSettings, type PaperSettings } from "../../lib/paper-builder";
import sample from "../../samples/ssc-math/questions.json";
import { readQuestionProvenance } from "../../lib/question-provenance";
import { Toggle } from "../../components/paper-builder/settings";
import "../../components/paper-builder/paper.css";
import "katex/dist/katex.min.css";
import "./sample.css";
const storageKey = "ssc-math-isolated-sample-v1";
function initial(): PaperSettings {
  const s = defaults();
  s.cfg = {...s.cfg, cols: 1, optCols: 2, font: "hind", fontSize: 16, imageSize: 200, imagePosition: "center", align: "left"};
  s.info = {...s.info, inst: "প্রশ্নবুক.কম — নমুনা পর্যালোচনা", cls: "নবম–দশম (SSC)", subject: "সাধারণ গণিত", exam: "চিত্রসহ প্রশ্নের পরীক্ষামূলক খসড়া", marks: "৩", minutes: "নির্ধারিত নয়", instr: "প্রতিটি প্রশ্নের সঠিক উত্তর নির্বাচন করো। চিত্রগুলো স্কেল অনুযায়ী নয়।"};
  for (const q of sample.questions) s.attachments[q.id] = {image: `${location.origin}/diagrams/${q.diagram}.png`, size: 200, division: "", important: false};
  return s;
}
function App() {
  const [s, setS] = useState(initial);
  const [message, setMessage] = useState("নমুনা প্রস্তুত; লাইভ প্রশ্নভান্ডারে যোগ করা হয়নি।");
  const [selected, setSelected] = useState(sample.questions[0].id);
  const [width, setWidth] = useState(window.innerWidth);
  React.useEffect(()=> {const resize=()=>setWidth(window.innerWidth); window.addEventListener("resize",resize); return ()=>window.removeEventListener("resize",resize);}, []);
  const questions = sample.questions.map(q => ({q: {...q, provenance: readQuestionProvenance(q.provenance), ...s.edits[q.id]}, opts: Object.entries(s.edits[q.id]?.options ?? q.options), ci: Object.keys(q.options).indexOf(q.correct)}));
  const q = questions.find(v=>v.q.id===selected)!.q;
  return <main className="paper-builder-root">
    <section data-noprint className="sample-tools">
      <h1>SSC গণিত • চিত্রসহ ৩টি নমুনা</h1>
      <p>এটি আলাদা স্থানীয় পরীক্ষা। মূল সাইটের PaperPreview, RichTextField ও settings schema ব্যবহার করা হয়েছে; অ্যাকাউন্ট/সার্ভার-সেভ নয়।</p>
      <div className="sample-actions">
        <button onClick={()=>{localStorage.setItem(storageKey,JSON.stringify(s));setMessage("এই ব্রাউজারে নমুনা সেভ হয়েছে");}}>নমুনা সেভ</button>
        <button onClick={()=>{const raw=localStorage.getItem(storageKey); if(raw){setS(restoreSettings(JSON.parse(raw)));setMessage("সেভ করা নমুনা পুনরায় খোলা হয়েছে");}else setMessage("সেভ করা নমুনা নেই");}}>পুনরায় খুলুন</button>
        <button onClick={()=>window.print()}>প্রিন্ট / PDF</button>
        <a href="/sample.pdf" download>উৎসসহ পরীক্ষিত PDF</a>
        <a href="/sample-without-source.pdf" download>উৎস ছাড়া পরীক্ষিত PDF</a>
        <button onClick={()=>{setS(initial());setMessage("মূল নমুনা ফেরত এসেছে");}}>রিসেট</button>
      </div>
      <p role="status">{message}</p>
      <Toggle label="প্রশ্নের পাশে বোর্ড/স্কুলের নাম, সাল ও মূল প্রশ্ন নম্বর দেখান" checked={s.show.boardSource} onChange={boardSource=>setS(v=>({...v,show:{...v.show,boardSource}}))}/>
      <p>এই তিনটি স্কুল/মডেল টেস্টের প্রশ্ন, বোর্ড প্রশ্ন নয়। তাই অপশন চালু করলে স্কুলের নাম দেখাবে; বোর্ড বা সাল অনুমান করে বসানো হয়নি।</p>
      <label>প্রশ্ন সম্পাদনা <select aria-label="প্রশ্ন নির্বাচন" value={selected} onChange={e=>setSelected(e.target.value)}>{sample.questions.map((v,i)=><option key={v.id} value={v.id}>{i+1} — উৎসের প্রশ্ন {v.sourceQuestion}</option>)}</select></label>
      <RichTextField label="প্রশ্নের লেখা" value={q.text} onChange={text=>setS(v=>({...v,edits:{...v.edits,[q.id]:{text,options:q.options}}}))}/>
      <p>চিত্রের নিচের + / − দিয়ে আকার বদলানো যায়। প্রশ্ন ও চিত্র একই ব্লকে প্রিন্ট হয়।</p>
      <details><summary>উৎস ও মূল চিত্রের সঙ্গে তুলনা</summary>
        <p><a href={`https://drive.google.com/file/d/${sample.source.fileId}/view`} target="_blank" rel="noreferrer">{sample.source.fileName}</a> • PDF পৃষ্ঠা ১ / মুদ্রিত পৃষ্ঠা ৪২৮। বাংলা হাতে Unicode-এ লেখা, চিত্র পুনরায় আঁকা।</p>
        <p>নিশ্চিত font metadata: SutonnyMJ, KalindiMJ, Sunetra, Saroda সহ একাধিক font আছে। একটিমাত্র font mapping যথেষ্ট নয়।</p>
        <div className="comparison">{sample.questions.map(v=><article key={v.id}><h3>উৎসের প্রশ্ন {v.sourceQuestion}</h3><p>মূল চিত্র</p><img src={`/source-crops/${v.diagram}.png`} alt={`উৎস প্রশ্ন ${v.sourceQuestion}-এর চিত্র`}/><p>পরিষ্কার করে আঁকা চিত্র</p><img src={`/diagrams/${v.diagram}.png`} alt={`পুনরায় আঁকা প্রশ্ন ${v.sourceQuestion}-এর চিত্র`}/><p>{v.explanation}</p></article>)}</div>
      </details>
    </section>
    <div id="paper"><PaperPreview s={s} questions={questions} type="MCQ" setName="ক" duplicate={new Set()} title="বহুনির্বাচনি প্রশ্ন" previewScale={Math.min(1,(width-32)/794)} onImageSize={(id,size)=>setS(v=>({...v,attachments:{...v.attachments,[id]:{...v.attachments[id],size}}}))}/></div>
  </main>;
}
createRoot(document.getElementById("root")!).render(<App/>);
