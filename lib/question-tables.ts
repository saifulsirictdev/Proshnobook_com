/** Bounded, literal Markdown tables and our versioned statistics SVGs only.
 * No HTML, attributes, arbitrary URLs, links or Markdown evaluation.
 */
export type QuestionBlock = {kind:"text";text:string}|{kind:"table";headers:string[];rows:string[][]}|{kind:"statistics-image";alt:string;src:string}|{kind:"geometry-image";alt:string;src:string};
export function questionBlocks(text:string):QuestionBlock[]{
 const lines=text.split("\n"),out:QuestionBlock[]=[];let buffer:string[]=[];
 const flush=()=>{if(buffer.length){out.push({kind:"text",text:buffer.join("\n")});buffer=[];}};
 const cells=(line:string)=>line.trim().slice(1,-1).split("|").map(s=>s.trim());
 const pipe=(line:string)=>/^\s*\|.*\|\s*$/.test(line)&&!line.includes("\\|");
 for(let i=0;i<lines.length;){
  const image=lines[i].trim().match(/^!\[([^\]\n]{0,100})\]\((https:\/\/proshnobook\.com\/question-bank\/ssc-math-ch17-v1\/[a-z0-9-]+\.svg)\)$/);
  if(image){flush();out.push({kind:"statistics-image",alt:image[1]||"পরিসংখ্যানের লেখচিত্র",src:image[2]});i++;continue;}
  // Canonical self-contained geometry assets also render in Chapter, quiz and answers.
  // Exact origin/version/path only: no arbitrary SVG hosts, queries or HTML.
  const geometry=lines[i].trim().match(/^!\[([^\]\n]{0,300})\]\((https:\/\/proshnobook\.com\/question-bank\/ssc-math-ch(?:[6-9]|10|14|15|16)-v1\/[a-z0-9-]+\.svg)\)$/);
  if(geometry){flush();out.push({kind:"geometry-image",alt:geometry[1]||"গণিতের চিত্র",src:geometry[2]});i++;continue;}
  if(pipe(lines[i])&&i+2<lines.length&&pipe(lines[i+1])){
   const headers=cells(lines[i]),divider=cells(lines[i+1]);let end=i+2;
   while(end<lines.length&&pipe(lines[end]))end++;
   const rows=lines.slice(i+2,end).map(cells);
   if(headers.length>=2&&headers.length<=12&&divider.length===headers.length&&divider.every(s=>/^:?-{3,}:?$/.test(s))&&rows.length>=1&&rows.length<=80&&rows.every(r=>r.length===headers.length)&&[headers,...rows].every(r=>r.every(c=>c.length>0&&c.length<=500))){
    flush();out.push({kind:"table",headers,rows});i=end;continue;
   }
   // Consume the malformed candidate literally; do not recover a nested sub-table.
   buffer.push(...lines.slice(i,end));i=end;continue;
  }
  buffer.push(lines[i]);i++;
 }
 flush();return out.some(b=>b.kind!=="text")?out:[{kind:"text",text}];
}
