"use client";

import React from "react";
import { questionBlocks } from "@/lib/question-tables";
// @ts-ignore
import katex from "katex";

interface MathTextProps {
  text: string;
  className?: string;
}

export default function MathText({ text, className = "" }: MathTextProps) {
  if (!text) return null;

  const blocks = questionBlocks(text);
  if (blocks.some(block => block.kind !== "text")) {
    const cellStyle: React.CSSProperties = { border: "1px solid currentColor", padding: "0.28em 0.35em", textAlign: "center", verticalAlign: "middle", overflowWrap: "anywhere", fontWeight: "normal" };
    return <span className={`question-data-blocks ${className}`} style={{display:"block",maxWidth:"100%",minWidth:0}}>
      {blocks.map((block,i)=>block.kind === "text" ? <span key={i} style={{whiteSpace:"pre-wrap"}}><MathText text={block.text}/></span> : (block.kind === "statistics-image" || block.kind === "geometry-image" || block.kind === "physics-image") ? <img key={i} src={block.src} alt={block.alt} loading="eager" referrerPolicy="no-referrer" style={{display:"block",width:"100%",maxWidth:640,height:"auto",margin:"0.6em auto",breakInside:"avoid"}}/> :
        <span key={i} style={{display:"block",maxWidth:"100%",margin:"0.65em 0",breakInside:"avoid",whiteSpace:"normal"}}>
          <table aria-label="উপাত্ত সারণি" className="question-data-table" style={{width:"100%",tableLayout:"fixed",borderCollapse:"collapse",border:"1px solid currentColor",fontSize:"0.9em",lineHeight:1.4,color:"inherit",breakInside:"avoid"}}>
            <thead><tr>{block.headers.map((c,j)=><th scope="col" key={j} style={{...cellStyle,fontWeight:600,backgroundColor:"#f1f5f9",color:"#14213d",width:j===0?"21%":undefined}}><MathText text={c}/></th>)}</tr></thead>
            <tbody>{block.rows.map((row,r)=><tr key={r}>{row.map((c,j)=>j===0?<th scope="row" key={j} style={{...cellStyle,fontWeight:600}}><MathText text={c}/></th>:<td key={j} style={cellStyle}><MathText text={c}/></td>)}</tr>)}</tbody>
          </table>
        </span>)}
    </span>;
  }

  // 🎯 ১. আবৃত্ত দশমিক / পৌনঃপুনিক ডট (\u0307) থাকলে KaTeX \dot{} এ রূপান্তর (বক্স দূর করার ম্যাজিক)
  let preparedText = text
    .replace(/([০-৯\d])\s*[\u0307\u0308\u02D9\u0358]/gu, (_, d) => `$\\dot{${d}}$`)
    .replace(/[\u0307\u0308\u02D9]([০-৯\d])/gu, (_, d) => `$\\dot{${d}}$`);

  // 🎯 ২. সাধারণ ভগ্নাংশ যেমন "১/৩" বা "4/5" কে স্বয়ংক্রিয়ভাবে উপর-নিচে রূপান্তর
  preparedText = preparedText.replace(
    /(?<![\$\w])([০-৯\d]+)\/([০-৯\d]+)(?![\$\w])/g,
    (_, num, den) => `$\\frac{${num}}{${den}}$`
  );

  // ৩. $...$ (ম্যাথ ফর্মুলা) এবং সাধারণ টেক্সট আলাদা করে রেন্ডার
  const parts = preparedText.split(/(\$[^$]+\$)/g);

  return (
    <span className={`inline-math-wrapper ${className}`}>
      {parts.map((part, index) => {
        if (part.startsWith("$") && part.endsWith("$")) {
          const formula = part.slice(1, -1);
          try {
            const html = katex.renderToString(formula, {
              throwOnError: false,
              displayMode: false,
            });
            return (
              <span
                key={index}
                dangerouslySetInnerHTML={{ __html: html }}
                className="inline-block px-0.5 align-middle"
              />
            );
          } catch {
            return <span key={index}>{part}</span>;
          }
        }

        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}
