"use client";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { autoModelBlueprint, isAcademicCategory, AUTO_MODEL_NOTICE } from "@/lib/auto-model";
import { ACADEMIC_SUBJECT_GROUPS, sscGroupSubjects, hscGroupSubjects } from "@/lib/academic-subject-groups";
import { QUESTION_TYPE_OPTIONS } from "@/lib/question-type-options";
import { englishQuestionItemGroups, englishLessonOptions } from "@/lib/english/topic-options";
import { englishBuilderContext, englishBuilderHref } from "@/lib/english/builder-mode";
import { ArrowRight } from "lucide-react";
import { NCTB_CLASSES, type NctbClass } from "@/lib/nctb-data";

import { examOutlines, PREPARATION_TOPICS, EXAM_OUTLINE_NOTICE, EXAM_BANK_NOTICE } from "@/lib/exam-preparation";

import jobData from "@/lib/job-syllabuses.json";
type JobSubject = { name: string; pages: number[]; topics: string[]; marks?: number };
type JobSyllabus = { id: string; name: string; source?: string; note?: string; subjects?: JobSubject[]; branches?: JobSyllabus[] };
const jobExams: JobSyllabus[] = jobData.exams;

type Pair = { category: string; subject: string };
const LOW = ["1", "2", "3", "4", "5", "6", "7", "8"];
const CHIPS = ["SSC", "HSC", "Admission", "Job"];

// ক্লাস কী (6/7/8/SSC/HSC) দিয়ে lib/nctb-data.ts থেকে সঠিক ক্লাস খুঁজে বের করা
function findClassData(key: string): NctbClass | undefined {
  if (!key) return undefined;
  if (LOW.includes(key)) {
    return NCTB_CLASSES.find((c) => c.class === `Class ${key}`);
  }
  if (key === "SSC") {
    return NCTB_CLASSES.find((c) => /9|10|SSC/i.test(c.class));
  }
  if (key === "HSC") {
    return NCTB_CLASSES.find((c) => /11|12|HSC/i.test(c.class));
  }
  return undefined;
}

// 🎯 ক্লাসের সব সম্ভাব্য নাম (যেমন "8" আর "Class 8" দুটোই)
function categoryAliases(key: string): string[] {
  if (!key) return [];
  const set = new Set<string>([key]);

  if (/^[1-9]$|^1[0-2]$/.test(key)) {
    set.add(`Class ${key}`);
  }
  const m = key.match(/^Class\s*(\d+)$/i);
  if (m) {
    set.add(m[1]);
    set.add(`Class ${m[1]}`);
  }
  if (key === "SSC") {
    ["Class 9", "Class 10", "Class 9-10", "9", "10"].forEach((v) => set.add(v));
  }
  if (key === "HSC") {
    ["Class 11-12", "Class 11", "Class 12", "11", "12"].forEach((v) =>
      set.add(v),
    );
  }
  return Array.from(set);
}

export default function QbStart({ pairs }: { pairs: Pair[] }) {
  const router = useRouter();
  const append = useSearchParams().get("append") === "1";
  const [category, setCategory] = useState("");
  const [examId, setExamId] = useState("");
  const [branchId, setBranchId] = useState("");
  const isJob = category === "Job";
  const jobExam = isJob ? jobExams.find((exam) => exam.id === examId) : undefined;
  const jobSyllabus = jobExam?.branches ? jobExam.branches.find((branch) => branch.id === branchId) : jobExam;
  const jobSubjects = jobSyllabus?.subjects ?? [];
  const outlines = examOutlines(category);
  const selectedExam = outlines.find((exam) => exam.id === examId);
  const examSubjects = selectedExam ? selectedExam.subjects : Array.from(new Set(outlines.flatMap((exam) => exam.subjects)));
  const [questionType, setQuestionType] = useState("ALL");
  const [subject, setSubject] = useState("");
  const [englishMode, setEnglishMode] = useState("");
  const [englishTopic, setEnglishTopic] = useState("");
  const [englishTopicKind, setEnglishTopicKind] = useState("");
  const english = englishBuilderContext(category, subject);
  const englishLessons = english ? englishLessonOptions(english.grade, english.paper) : null;
  const englishItems = english ? englishQuestionItemGroups(english.grade, english.paper) : [];
  const jobSubject = jobSubjects.find((item) => item.name === subject);
  const [topicCategory, setTopicCategory] = useState(""); // ক্যাটাগরি/ইউনিট
  const [topic, setTopic] = useState(""); // নির্দিষ্ট টপিক
  const [selectionMode, setSelectionMode] = useState("");
  const [modelVariant, setModelVariant] = useState("");
  const [subjectGroup, setSubjectGroup] = useState("");
  const isSsc = category === "SSC";
  const isHsc = category === "HSC";
  const hasSubjectGroups = isSsc || isHsc;
  const academic = isAcademicCategory(category) && !/english|ইংরেজি/i.test(subject) && !append;
  const modelPlan = autoModelBlueprint(category, subject, modelVariant);

  const selectedClassData = useMemo(() => findClassData(category), [category]);

  const curriculumSubjects = useMemo(
    () =>
      selectedClassData ? selectedClassData.subjects.map((s) => s.name) : [],
    [selectedClassData],
  );

  const dbSubjects = useMemo(() => {
    const cats = categoryAliases(category);
    return Array.from(
      new Set(
        pairs
          .filter((p) => !category || cats.includes(p.category))
          .map((p) => p.subject),
      ),
    );
  }, [pairs, category]);

  const subjects = useMemo(
    () => {
      const available = isJob ? jobSubjects.map((item) => item.name) : Array.from(new Set([...curriculumSubjects, ...examSubjects, ...dbSubjects]));
      return isSsc ? sscGroupSubjects(available, subjectGroup) : isHsc ? hscGroupSubjects(available, subjectGroup) : available;
    },
    [isSsc, isHsc, subjectGroup, isJob, jobSubjects, curriculumSubjects, examSubjects, dbSubjects],
  );

  // নির্বাচিত সাবজেক্টের ডেটা (chapters/subCategories সহ)
  const currentSubjectData = useMemo(
    () => selectedClassData?.subjects.find((s) => s.name === subject),
    [selectedClassData, subject],
  );

  const flatTopics = useMemo(
    () => isJob ? jobSubject?.topics ?? [] : currentSubjectData?.chapters ?? (outlines.length ? PREPARATION_TOPICS[subject] ?? [] : []),
    [isJob, jobSubject, currentSubjectData, outlines.length, subject],
  );
  const groupedTopics = useMemo(
    () => currentSubjectData?.subCategories ?? [],
    [currentSubjectData],
  );
  const hasGroups = groupedTopics.length > 0;

  const topicsInSelectedCategory = useMemo(() => {
    if (!topicCategory) return [];
    const grp = groupedTopics.find((g) => g.category === topicCategory);
    return grp?.topics ?? [];
  }, [groupedTopics, topicCategory]);

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm font-semibold ${
      active
        ? "border-blue-600 bg-blue-600 text-white"
        : "border-slate-300 bg-white text-slate-700"
    }`;

  function go() {
    if (hasSubjectGroups && (!subjectGroup || !subjects.includes(subject))) return;
    if (academic && selectionMode === "auto") {
      if (!modelPlan) return;
      router.push(`/question-builder/auto-model?${new URLSearchParams({category, subject, variant:modelVariant})}`);
      return;
    }
    if (academic && selectionMode !== "chapter") return;
    if (english && !append) {
      const href = englishBuilderHref(category, subject, englishMode, englishTopic, english.paper === 2 ? "item" : englishTopicKind);
      if (href) router.push(href);
      return;
    }
    const p = new URLSearchParams();
    if (append) p.set("append", "1");
    if (isJob && (!jobSyllabus || !jobSubject)) return;
    p.set("questionType", isJob ? "MCQ" : questionType);
    if (category) p.set("category", category);
    if (subject) p.set("subject", subject);
    if (hasGroups) {
      if (topicCategory) p.set("topicCategory", topicCategory);
      if (topic) p.set("topic", topic);
    } else if (topic) {
      p.set("topic", topic);
    }
    router.push(`/question-builder/prepare?${p.toString()}`);
  }

  return (
    <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap gap-2">
        <select
          aria-label="Class 1-8"
          className={chip(LOW.includes(category)) + " pr-8"}
          value={LOW.includes(category) ? category : ""}
          onChange={(e) => {
            setCategory(e.target.value);
            setSubjectGroup("");
            setExamId("");
            setBranchId("");
            setSubject(""); setSelectionMode(""); setModelVariant(""); setEnglishMode(""); setEnglishTopic(""); setEnglishTopicKind("");
            setTopicCategory("");
            setTopic("");
          }}
        >
          <option value="">All Class (1–8th)</option>
          {LOW.map((c) => (
            <option key={c} value={c}>
              Class {c}
            </option>
          ))}
        </select>
        {CHIPS.map((c) => (
          <button
            key={c}
            type="button"
            className={chip(category === c)}
            onClick={() => {
              setCategory(category === c ? "" : c);
              setSubjectGroup("");
              setQuestionType(c === "Job" ? "MCQ" : "ALL");
              setExamId("");
            setBranchId("");
              setSubject(""); setSelectionMode(""); setModelVariant(""); setEnglishMode(""); setEnglishTopic(""); setEnglishTopicKind("");
              setTopicCategory("");
              setTopic("");
            }}
          >
            {c === "SSC"
              ? "SSC (নবম-দশম)"
              : c === "HSC"
                ? "HSC (একাদশ-দ্বাদশ)"
                : c}
          </button>
        ))}
      </div>

      {outlines.length > 0 && (
        <section aria-label="প্রস্তাবিত পরীক্ষার প্রস্তুতি" className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-slate-800">
          <p className="font-semibold">{isJob ? "প্রিলিমিনারি MCQ সিলেবাস" : "প্রস্তাবিত প্রস্তুতি-রূপরেখা"}</p>
          <p>{isJob ? "মালিকের সরবরাহকৃত PDF/লেখা থেকে সাজানো। পুরোনো সংস্করণ থাকতে পারে—সর্বশেষ বিজ্ঞপ্তি মিলিয়ে নিন। শুধু MCQ; লিখিত প্রস্তুতি নেই।" : EXAM_OUTLINE_NOTICE}</p>
          <label className="block font-semibold">
            {isJob ? "পরীক্ষা বাছুন" : "পরীক্ষার প্রস্তুতির ধরন (ঐচ্ছিক)"}
            <select
              aria-label="পরীক্ষার প্রস্তুতির ধরন"
              className="mt-2 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm"
              value={examId}
              onChange={(e) => { setExamId(e.target.value); setBranchId(""); setSubject(""); setSelectionMode(""); setModelVariant(""); setEnglishMode(""); setEnglishTopic(""); setEnglishTopicKind(""); setTopicCategory(""); setTopic(""); }}
            >
              <option value="">{isJob ? "— পরীক্ষা নির্বাচন করুন —" : "সব প্রস্তুতির বিষয়"}</option>
              {outlines.map((exam) => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
            </select>
          </label>
          {isJob && jobExam?.branches && (
            <label className="block font-semibold">NTRCA শাখা
              <select aria-label="NTRCA শাখা" value={branchId} className="mt-2 w-full rounded-lg border bg-white px-3 py-3 text-sm" onChange={(e) => { setBranchId(e.target.value); setSubject(""); setSelectionMode(""); setModelVariant(""); setEnglishMode(""); setEnglishTopic(""); setEnglishTopicKind(""); setTopicCategory(""); setTopic(""); }}>
                <option value="">— School / College বাছুন —</option>
                {jobExam.branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
              </select>
            </label>
          )}
          {isJob ? <>
            {jobSyllabus?.note && <p>{jobSyllabus.note}</p>}
            {jobSyllabus?.source && <p className="text-xs">উৎস: {jobSyllabus.source === "owner-text" ? "মালিকের দেওয়া লেখা" : jobData.sources[jobSyllabus.source as keyof typeof jobData.sources]?.filename}</p>}
            {jobSubject && <p className="text-xs">{jobSubject.pages.length > 0 ? `উৎসের পৃষ্ঠা: ${jobSubject.pages.join(", ")}` : "উৎস: সাধারণ প্রস্তুতির লেখা"}{jobSubject.marks ? ` · উৎসে বিষয়ের নম্বর: ${jobSubject.marks}` : ""}</p>}
            <p className="text-xs">সিলেবাস যোগ করা মানে প্রশ্নভান্ডার পূর্ণ নয়। এটি প্রস্তুতির বিষয়–টপিক; নির্দিষ্ট পরীক্ষার আসল প্রশ্ন হিসেবে দাবি নয়।</p>
          </> : <>
          {selectedExam?.note && <p>{selectedExam.note}</p>}
          <p className="text-xs">{EXAM_BANK_NOTICE}</p>
          </>}
          {!isJob && dbSubjects.length > 0 && <p className="text-xs">প্রশ্নভান্ডারের অতিরিক্ত বিষয়ও তালিকায় রাখা হয়েছে।</p>}
        </section>
      )}

      {hasSubjectGroups && <label className="block space-y-2 text-sm font-semibold text-slate-800">
        <span>বিভাগ নির্বাচন করুন</span>
        <select aria-label={`${category} বিভাগ`} value={subjectGroup}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm"
          onChange={e => {
            setSubjectGroup(e.target.value);
            setSubject(""); setQuestionType("ALL");
            setSelectionMode(""); setModelVariant("");
            setEnglishMode(""); setEnglishTopic(""); setEnglishTopicKind("");
            setTopicCategory(""); setTopic("");
          }}>
          <option value="">— বিভাগ নির্বাচন করুন —</option>
          {ACADEMIC_SUBJECT_GROUPS.map((group, i) => <option key={group.id} value={group.id}>{["১", "২", "৩", "৪"][i]}. {group.label}</option>)}
        </select>
        <span className="block text-xs font-normal text-slate-500">{isSsc ? "বাংলা, ইংরেজি, গণিত ও অন্যান্য সাধারণ/ঐচ্ছিক বিষয় পেতে সাধারণ নির্বাচন করুন।" : "বাংলা, ইংরেজি, ICT ও অন্যান্য সাধারণ/ঐচ্ছিক বিষয় পেতে সাধারণ নির্বাচন করুন।"}</span>
      </label>}

      <select
        aria-label="বিষয়"
        disabled={hasSubjectGroups && !subjectGroup}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm"
        value={subject}
        onChange={(e) => {
          setSubject(e.target.value); setSelectionMode(""); setModelVariant("");
          setEnglishMode(""); setEnglishTopic(""); setEnglishTopicKind("");
          setTopicCategory("");
          setTopic("");
        }}
      >
        <option value="">{hasSubjectGroups && !subjectGroup ? "— আগে বিভাগ নির্বাচন করুন —" : "— Select Subject —"}</option>
        {subjects.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      {english && !append && <>
        <label className="block text-sm font-semibold">English প্রশ্নপত্রের ধরন
          <select aria-label="English প্রশ্নপত্রের ধরন" value={englishMode}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm"
            onChange={e => { setEnglishMode(e.target.value); setEnglishTopic(""); setEnglishTopicKind(""); }}>
            <option value="">— ধরন নির্বাচন করুন —</option>
            <option value="topic">{english.paper === 2 ? "Question item" : "Topic-wise"}</option>
            <option value="full">{english.paper === 2 ? "Auto model test" : "Full Model Test"}</option>
          </select>
        </label>
        {englishMode === "topic" && <>
          {english.paper === 1 && <label className="block text-sm font-semibold">Topic-এর ধরন
            <select aria-label="English topic type" value={englishTopicKind}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm"
              onChange={e => { setEnglishTopicKind(e.target.value); setEnglishTopic(""); }}>
              <option value="">— ধরন নির্বাচন করুন —</option>
              <option value="lesson">Lesson</option>
              <option value="item">Question item</option>
            </select>
          </label>}
          {english.paper === 1 && englishTopicKind === "lesson" && <>
            <label className="block text-sm font-semibold">Lesson / আগের topic
              <select aria-label="English lesson" value={englishTopic} onChange={e => setEnglishTopic(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm">
                <option value="">— Lesson নির্বাচন করুন —</option>
                {englishLessons?.groups.length ? englishLessons.groups.map(group => <optgroup key={group.category} label={group.category}>
                  {group.topics.map(name => <option key={name} value={name}>{name}</option>)}
                </optgroup>) : englishLessons?.topics.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
            {englishLessons?.notice && <p role="status" className="rounded bg-amber-50 p-3 text-sm">{englishLessons.notice}</p>}
            <p className="text-sm text-slate-600">নির্বাচিত lesson/topic-এর উপলব্ধ প্রশ্নভান্ডার খুলবে। প্রশ্ন না থাকলে খালি দেখাবে; অনুমোদন ছাড়া Draft প্রকাশ বা বানানো seen passage যোগ হবে না।</p>
          </>}
          {(english.paper === 2 || englishTopicKind === "item") && <label className="block text-sm font-semibold">Question item
            <select aria-label="English question item" value={englishTopic} onChange={e => setEnglishTopic(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm">
              <option value="">— Question item নির্বাচন করুন —</option>
              {englishItems.map(group => <option key={group.id} value={group.id}>{group.title}</option>)}
            </select>
          </label>}
        </>}
        {englishMode === "full" && <p className="rounded-lg bg-indigo-50 p-3 text-sm">
          Class {english.grade} · English {english.paper === 1 ? "1st" : "2nd"} Paper · {english.blueprint.total} marks।
          {english.paper === 1 ? "অনুমোদিত database থেকে সব প্রশ্ন ও উত্তরসহ পূর্ণ মডেল নেওয়া হবে। ঘাটতি থাকলে জানাবে; AI চলবে না। আগে প্রশ্ন দেখবেন/বদলাবেন, তারপর Set-up।" : "সব অংশ স্বয়ংক্রিয়ভাবে বেছে প্রশ্নভান্ডার থেকে প্রশ্ন নেওয়া হবে; না থাকলে AI তৈরি করবে (বিদ্যমান quota প্রযোজ্য)। আগে প্রশ্ন দেখবেন/বদলাবেন, তারপর Set-up।"}
          এটি practice template; বর্তমান সরকারি syllabus/মানবণ্টন মিলিয়ে নিন।
        </p>}
      </>}
      {academic && subject && <fieldset className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
        <legend className="px-2 text-sm font-bold text-emerald-900">{hasSubjectGroups ? "৪" : "৩"} · কীভাবে প্রশ্ন বাছবেন?</legend>
        <div className="grid grid-cols-2 gap-3">
          {[{id:"chapter",title:"Chapter",desc:"অধ্যায় থেকে নিজে বাছুন"},{id:"auto",title:"Auto Model",desc:"কাঠামো মেনে পূর্ণ মডেল"}].map(o=><button key={o.id} type="button" aria-pressed={selectionMode===o.id} onClick={()=>{setSelectionMode(o.id);setModelVariant("");}} className={`rounded-xl border p-3 text-left ${selectionMode===o.id?"border-emerald-700 bg-emerald-700 text-white shadow-sm":"border-slate-200 bg-white text-slate-800"}`}><span className="block font-bold">{o.title}</span><span className="mt-1 block text-xs">{o.desc}</span></button>)}
        </div>
        {selectionMode==="auto" && <>
          <p className="text-sm font-semibold text-slate-700">{hasSubjectGroups ? "৫" : "৪"} · মডেলের ধরন</p>
          <div className="grid grid-cols-2 gap-3">{[{id:"MCQ",title:"MCQ",desc:"নৈর্ব্যক্তিক"},{id:"CQ",title:"CQ",desc:"সৃজনশীল / লিখিত"}].map(o=><button type="button" key={o.id} aria-pressed={modelVariant===o.id} onClick={()=>setModelVariant(o.id)} className={`rounded-lg border p-3 text-left ${modelVariant===o.id?"border-emerald-600 bg-emerald-100 text-emerald-950":"border-slate-200 bg-white"}`}><b>{o.title}</b><span className="block text-xs">{o.desc}</span></button>)}</div>
          {modelPlan ? <div className="rounded-lg border border-emerald-200 bg-white p-3 text-sm"><h3 className="font-bold text-emerald-900">{modelPlan.title}</h3><p className="my-2">পূর্ণমান {modelPlan.totalMarks} · সময় {modelPlan.minutes}</p><p>{modelPlan.offered}</p>{subject === "পদার্থবিজ্ঞান" && <p className="mt-2 text-xs text-slate-600">আপনার নির্ধারিত অধ্যায়-কোটা ও পূর্ণ ১৪ অধ্যায়ের অনুশীলনভিত্তিক কাঠামো। MCQ-তে প্রতি অধ্যায় ১–২টি একটি ভারসাম্যপূর্ণ বাছাই-পদ্ধতি; সরকারি অধ্যায়-কোটা নয়।</p>}{subject === "রসায়ন" && <p className="mt-2 text-xs text-slate-600">আপনার নির্ধারিত অনুশীলননীতি: CQ ও SQ—প্রতিটি অংশে ৩, ৪, ৫, ৬, ৭ ও ১১ অধ্যায় থেকে একটি করে, বাকি ১, ২, ৮, ৯, ১০ ও ১২ অধ্যায়ের যেকোনো একটি থেকে আরও একটি। MCQ-তে পূর্ণ ১২ অধ্যায়ের ভারসাম্যপূর্ণ ঘূর্ণন; প্রতি অধ্যায় সর্বোচ্চ ৩টি। এটি সরকারি অধ্যায়-কোটা নয়। শুধু অনুমোদিত প্রশ্ন পর্যাপ্ত থাকলেই মডেল তৈরি হবে।</p>}<p className="mt-2">{modelPlan.instructions}</p><p className="mt-3 text-xs text-slate-500">{AUTO_MODEL_NOTICE}</p></div> : modelVariant && <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">এই শ্রেণি ও বিষয়ের নিজস্ব পূর্ণ মডেল কাঠামো এখনও প্রস্তুত নয়। অন্য বিষয়ের কাঠামো এখানে ব্যবহার করা হবে না। আপাতত Chapter থেকে প্রশ্ন বাছুন।</p>}
        </>}
      </fieldset>}
      {(!english || append) && (!academic || selectionMode === "chapter") && <>
      {/* 🎯 দুই-ধাপে ক্যাটাগরি/ইউনিট → টপিক সিলেকশন (subCategories থাকলে) */}
      {hasGroups ? (
        <>
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm"
            value={topicCategory}
            onChange={(e) => {
              setTopicCategory(e.target.value);
              setTopic("");
            }}
          >
            <option value="">-- ইউনিট/ক্যাটাগরি বাছুন --</option>
            {groupedTopics.map((g) => (
              <option key={g.category} value={g.category}>
                {g.category}
              </option>
            ))}
          </select>

          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm disabled:bg-slate-100"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={!topicCategory}
          >
            <option value="">-- নির্দিষ্ট অধ্যায়/টপিক বাছুন --</option>
            {topicsInSelectedCategory.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </>
      ) : (
        flatTopics.length > 0 && (
          <select
            aria-label="প্রস্তুতির টপিক"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          >
            <option value="">-- অধ্যায়/টপিক বাছুন (ঐচ্ছিক) --</option>
            {flatTopics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        )
      )}

      <label className="block text-sm font-semibold text-slate-700">
        প্রশ্নের ধরন
        <select
          name="questionType"
          disabled={isJob}
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm"
          value={isJob ? "MCQ" : questionType}
          onChange={(e) => setQuestionType(e.target.value)}
        >
          {QUESTION_TYPE_OPTIONS.filter((option) => !isJob || option.value === "MCQ").map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      </>}

      <button
        type="button"
        disabled={!subject || (hasSubjectGroups && (!subjectGroup || !subjects.includes(subject))) || (academic && (!selectionMode || (selectionMode === "auto" && !modelPlan))) || (!!english && !append && (!englishMode || (englishMode === "topic" && ((english.paper === 1 && !englishTopicKind) || !englishTopic))))}
        onClick={go}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white disabled:opacity-50"
      >
        {academic && selectionMode === "auto" ? "মডেল প্রস্তুত ও কাঠামো যাচাই করুন" : english && !append && englishMode === "full" ? "পূর্ণ মডেল টেস্ট তৈরি করুন" : "প্রশ্ন তৈরী করুন"} <ArrowRight size={18} />
      </button>
      {!pairs.length && !curriculumSubjects.length && !outlines.length && (
        <p className="text-center text-xs text-slate-500">
          এখনও কোনো প্রশ্ন নেই। আগে /admin/questions থেকে প্রশ্ন যোগ করুন।
        </p>
      )}
    </div>
  );
}
// ===== ফাইল শেষ =====
