import { BIOLOGY_FIGURE_PATHS } from "./ssc-biology-assets";
/** Bounded, literal Markdown tables and our allowlisted versioned question SVGs only.
 * No HTML, attributes, arbitrary URLs, links or Markdown evaluation.
 */
export type QuestionBlock = {kind:"text";text:string}|{kind:"table";headers:string[];rows:string[][]}|{kind:"statistics-image";alt:string;src:string}|{kind:"geometry-image";alt:string;src:string}|{kind:"physics-image";alt:string;src:string}|{kind:"chemistry-image";alt:string;src:string}|{kind:"biology-image";alt:string;src:string};
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
  // Self-contained Physics diagrams only. Keep the exact production
  // origin and versioned chapter paths; never allow arbitrary images or HTML.
  const physics=lines[i].trim().match(/^!\[([^\]\n]{0,300})\]\((https:\/\/proshnobook\.com\/question-bank\/ssc-physics-ch(?:[5-9]|1[0-4])-v1\/[a-z0-9-]+\.svg)\)$/);
  if(physics){flush();out.push({kind:"physics-image",alt:physics[1]||"পদার্থবিজ্ঞানের চিত্র",src:physics[2]});i++;continue;}
  const biology=lines[i].trim().match(/^!\[([^\]\n]{0,300})\]\((https:\/\/proshnobook\.com(\/question-bank\/ssc-biology-ch(?:[1-9]|1[0-4])-v1\/[a-z-]+\.svg))\)$/);
  if(biology && BIOLOGY_FIGURE_PATHS.includes(biology[3])){flush();out.push({kind:"biology-image",alt:biology[1]||"জীববিজ্ঞানের চিত্র",src:biology[2]});i++;continue;}
  // Exact reviewed Chemistry figure names only; never generic URLs or SVG paths.
  const chemistry=lines[i].trim().match(/^!\[([^\]\n]{0,300})\]\((https:\/\/proshnobook\.com\/question-bank\/ssc-chemistry-ch1-v1\/(?:explosive|flammable|toxic|irritant|health|radioactive|environment|corrosive|ppe|photosynthesis|spraying)\.png)\)$/)
    || lines[i].trim().match(/^!\[([^\]\n]{0,300})\]\((https:\/\/proshnobook\.com\/question-bank\/ssc-chemistry-ch2-v1\/(?:(?:particle-states|permanganate|dye|gas-diffusion|leak-test|candle|urea-apparatus|wax-apparatus|boiling-apparatus|heating-native|cooling-native|sublimation-particles|sublimation-apparatus|mixtures)\.png|(?:heating|diffusion)-(?:0[1-9]|1[0-4])\.svg))\)$/)
    || lines[i].trim().match(/^!\[([^\]\n]{0,300})\]\((https:\/\/proshnobook\.com\/question-bank\/ssc-chemistry-ch3-v1\/(?:(?:nuclide-notation|rutherford|classical-collapse|bohr-transitions|aufbau-order|model-comparison|nuclear-plant)\.png|nuclide-(?:0[1-9]|[12][0-9]|30)\.svg|isotope-(?:0[1-9]|1[0-9]|20)\.svg))\)$/)
    || lines[i].trim().match(/^!\[([^\]\n]{0,300})\]\((https:\/\/proshnobook\.com\/question-bank\/ssc-chemistry-ch4-v1\/(?:(?:table-left|table-right|radius-trend|ionization|carbonate-apparatus|alkali-column|exercise-grid)\.png|(?:position|trend)-(?:0[1-9]|[12][0-9]|30)\.svg|(?:energy|inverse)-(?:0[1-9]|1[0-9]|20)\.svg))\)$/)
    || lines[i].trim().match(/^!\[([^\]\n]{0,300})\]\((https:\/\/proshnobook\.com\/question-bank\/ssc-chemistry-ch5-v1\/(?:(?:valence-shells|methane-octet|lithium-ion|sodium-ion|chloride-ion|sodium-chloride|magnesium-oxide|hydrogen-sharing|oxygen-sharing|water-sharing|water-polarity|electrolyte|crystals|metal-bond|metal-current|exercise-abd|exercise-xy)\.png|charge-(?:0[1-9]|[1-3][0-9]|40)\.svg|(?:lewis|property)-(?:0[1-9]|1[0-9]|2[0-4])\.svg))\)$/)
    || lines[i].trim().match(/^!\[([^\]\n]{0,300})\]\((https:\/\/proshnobook\.com\/question-bank\/ssc-chemistry-ch6-v1\/neutral-(?:0[1-9]|[1-3][0-9]|40)\.svg)\)$/)
    || lines[i].trim().match(/^!\[([^\]\n]{0,300})\]\((https:\/\/proshnobook\.com\/question-bank\/ssc-chemistry-ch6-source-v1\/textbook-(?:shared-3-4|cq-1-diagram)\.png)\)$/)
    || lines[i].trim().match(/^!\[([^\]\n]{0,300})\]\((https:\/\/proshnobook\.com\/question-bank\/ssc-chemistry-ch7-v1\/rate-(?:0[1-9]|1[0-5])\.svg)\)$/)
    || lines[i].trim().match(/^!\[([^\]\n]{0,300})\]\((https:\/\/proshnobook\.com\/question-bank\/ssc-chemistry-ch7-source-v1\/tb-(?:shared-5-6|cq-2-stimulus)\.png)\)$/)
    || lines[i].trim().match(/^!\[([^\]\n]{0,300})\]\((https:\/\/proshnobook\.com\/question-bank\/ssc-chemistry-ch8-v1\/(?:energy-(?:0[1-9]|10)|cell-0[1-6])\.svg)\)$/)
    || lines[i].trim().match(/^!\[([^\]\n]{0,300})\]\((https:\/\/proshnobook\.com\/question-bank\/ssc-chemistry-ch8-source-v1\/tb-(?:plating-shared|molten-mgcl2)\.png)\)$/)
    || lines[i].trim().match(/^!\[([^\]\n]{0,300})\]\((https:\/\/proshnobook\.com\/question-bank\/ssc-chemistry-ch9-v1\/indicator-(?:0[1-9]|10)\.svg)\)$/)
    || lines[i].trim().match(/^!\[([^\]\n]{0,300})\]\((https:\/\/proshnobook\.com\/question-bank\/ssc-chemistry-ch9-source-v1\/tb-ammonia-stimulus\.png)\)$/)
    || lines[i].trim().match(/^!\[([^\]\n]{0,300})\]\((https:\/\/proshnobook\.com\/question-bank\/ssc-chemistry-ch10-source-v1\/tb-(?:rust-shared|zinc-retort)\.png)\)$/)
    || lines[i].trim().match(/^!\[([^\]\n]{0,300})\]\((https:\/\/proshnobook\.com\/question-bank\/ssc-chemistry-ch11-source-v1\/tb-(?:bromine-shared|starch-stimulus|acid-reaction)\.png)\)$/);
  if(chemistry){flush();out.push({kind:"chemistry-image",alt:chemistry[1]||"রসায়নের চিত্র",src:chemistry[2].slice("https://proshnobook.com".length)});i++;continue;}
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
