"use client";
import {useMemo,useRef,useState} from "react";
import QbBuilder from "./qb-builder";
import { englishLegacyPaper } from "@/lib/english/legacy-builder";
import type {EnglishDraft} from "@/lib/english/draft";
import type {PaperSettings} from "@/lib/paper-builder";
import {currentHeader} from "@/lib/paper-header";
import { saveEnglishPaper } from "@/app/actions/english-paper";
export default function EnglishLegacyBuilder({draftKey,initial}:{draftKey:string;initial:EnglishDraft}) {
  const paper=useMemo(()=>englishLegacyPaper(initial),[initial]);
  const settings=useRef<PaperSettings>(paper.settings);
  const [busy,setBusy]=useState(false),[message,setMessage]=useState("");
  async function save(){
    if(busy)return;setBusy(true);setMessage("");
    try {const s=settings.current;const result=await saveEnglishPaper(draftKey,{...initial,builderSettings:s,header:currentHeader(s),font:s.cfg.font,fontSize:s.cfg.fontSize,layout:{paper:s.cfg.paper,align:s.cfg.align,marginTop:s.cfg.marginTop,marginBottom:s.cfg.marginBottom,marginLeft:s.cfg.marginLeft,marginRight:s.cfg.marginRight},updatedAt:new Date().toISOString()});setMessage(result.ok?"সেভ হয়েছে।":result.error??"সেভ হয়নি।");}
    catch{setMessage("সেভ নিশ্চিত হয়নি। আবার চেষ্টা করুন।");}finally{setBusy(false);}
  }
  return <main className="mx-auto max-w-[1440px] px-4 py-6">
    <div data-noprint className="mb-4 flex flex-wrap items-center gap-3 rounded border bg-white p-3"><button disabled={busy} onClick={save} className="rounded bg-emerald-700 px-4 py-2 text-white">{busy?"সেভ হচ্ছে…":"প্রশ্নপত্র সেভ করুন"}</button><a className="underline" href="/question-builder/english/saved">সংরক্ষিত প্রশ্নপত্র</a><p role="status">{message}</p></div>
    <QbBuilder english={{key:draftKey,...paper,onSettings:s=>{settings.current=s;}}}/>
  </main>;
}
