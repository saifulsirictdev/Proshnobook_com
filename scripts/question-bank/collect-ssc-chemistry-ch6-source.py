"""Build a source-only, NOT application-importable, partial collection.
No question generation, answers, variants, inferred marks, network or DB writes.
Text is manually transcribed from the supplied textbook; native question pixels
are the authority for typography. SHA-locked source required only for --extract.
Usage: python collect-ssc-chemistry-ch6-source.py [--check|--extract PDF]
"""
from pathlib import Path
from collections import Counter
import hashlib, html, json, sys
R=Path(__file__).resolve().parents[2]
OUT=R/'content/question-bank/ssc/chemistry/chapter-6-source-v1'
ASSET=R/'public/question-bank/ssc-chemistry-ch6-source-v1'
DOC=R/'docs/question-bank/ssc-chemistry'
SOURCE_ID='17cFTHipiCnU5qB-prqtRRj6YADFdZ091'
SOURCE_HASH='77a46c425639912215a7f1ef987e1e75e6b94d8618110557df18af6721d67082'
def enc(x):return json.dumps(x,ensure_ascii=False,indent=2)+'\n'
def write(p,s):
 if '--check' in sys.argv:assert p.exists() and p.read_text()==s,f'Stale {p}'
 else:p.parent.mkdir(parents=True,exist_ok=True);p.write_text(s)
# Fractions of the exact original source page. No regenerated diagrams or text.
CROPS={
 'textbook-mcq-1':(145,(.095,.258,.91,.337)),
 'textbook-mcq-2':(145,(.095,.35,.91,.434)),
 'textbook-mcq-3':(145,(.095,.512,.91,.588)),
 'textbook-mcq-4':(145,(.095,.596,.91,.677)),
 'textbook-mcq-5':(145,(.095,.688,.91,.772)),
 'textbook-mcq-6':(145,(.095,.783,.91,.866)),
 'textbook-shared-3-4':(145,(.095,.449,.91,.505)),
 'textbook-cq-1':(146,(.095,.192,.91,.418)),
 'textbook-cq-1-diagram':(146,(.56,.196,.89,.415)),
 'textbook-cq-2':(146,(.095,.442,.92,.597)),
 'textbook-sq-1':(146,(.13,.678,.91,.707)),
 'textbook-sq-2':(146,(.13,.707,.91,.734)),
 'textbook-sq-3':(146,(.13,.734,.93,.765)),
}
if '--extract' in sys.argv:
 import pymupdf as fitz
 source=Path(sys.argv[sys.argv.index('--extract')+1])
 assert hashlib.sha256(source.read_bytes()).hexdigest()==SOURCE_HASH
 pdf=fitz.open(source);ASSET.mkdir(parents=True,exist_ok=True)
 for name,(num,bounds) in CROPS.items():
  page=pdf[num-1];w,h=page.rect.width,page.rect.height
  page.get_pixmap(matrix=fitz.Matrix(2.6,2.6),clip=fitz.Rect(*(v*(w if i%2==0 else h) for i,v in enumerate(bounds)))).save(str(ASSET/(name+'.png')))

def asset(name):return f'/question-bank/ssc-chemistry-ch6-source-v1/{name}.png'
items=[]
def add(kind,number,text,**kw):
 name=f'textbook-{kind.lower()}-{number}';printed=140 if kind=='MCQ' else 141
 row=dict(id=f'ssc-chemistry-ch6-source-textbook-{kind.lower()}-{number}',type=kind,sourceQuestionNumber=number,text=text,questionImage=asset(name),originalPractice=False,adapted=False,variant=False,sourceVerbatim=True,contentReview='MANUALLY_COMPARED_WITH_ORIGINAL_PDF_IMAGE',teacherApproved=False,answer=None,answerOrigin='NOT_PRESENT_ON_INSPECTED_QUESTION_PAGES',marks=None,source=dict(fileId=SOURCE_ID,fileName='২০২৬ — রসায়ন.pdf',sha256=SOURCE_HASH,printedPage=printed,pdfPage=printed+5,section={'MCQ':'বহুনির্বাচনি প্রশ্ন','CQ':'সৃজনশীল প্রশ্ন','SQ':'সংক্ষিপ্ত-উত্তর প্রশ্ন'}[kind],board=None,examYear=None,school=None,shortAttribution=None),**kw)
 items.append(row)
shared='নিচের উদ্দীপকের আলোকে ৩ ও ৪ নং প্রশ্নের উত্তর দাও:\n5 গ্রাম হাইড্রোজেন গ্যাসকে 75 গ্রাম ক্লোরিন গ্যাসের মধ্যে চালনা করা হলো।'
MCQS=[
 ('প্রমাণ অবস্থায় 2 গ্রাম হাইড্রোজেন গ্যাসের আয়তন কত লিটার?',['2.24','11.2','22.4','44.8']),
 ('নিচের কোনটি ক্যালসিয়াম ফসফেটের সংকেত?',['CaPO₄','Ca(PO₄)₂','Ca₂(PO₄)₃','Ca₃(PO₄)₂']),
 ('উদ্দীপকে ব্যবহৃত ক্লোরিন পরমাণুর সংখ্যা কতটি?',['1.27×10²⁴','2.54×10²⁴','6.02×10²³','6.36×10²³']),
 ('উদ্দীপকের বিক্রিয়ায় অবশিষ্ট থাকে–',['1.44 মোল H₂','1.44 মোল Cl₂','2.89 মোল H₂','2.89 মোল Cl₂']),
 ('CO₂ এর 2×10²³ টি অণুর ভর কত?',['44g','22g','14.6g','12g']),
 ('10g CaCO₃ এ কয়টি অণু আছে?',['6.02×10²³টি','6.02×10²²টি','6.02×10²¹টি','2.58×10²²টি']),
]
for n,(q,options) in enumerate(MCQS,1):
 extra=dict(options=dict(zip('কখগঘ',options)),correct=None)
 if n in [3,4]:extra.update(stimulusText=shared,stimulusImages=[asset('textbook-shared-3-4')],sharedStimulusGroup='textbook-mcq-3-4')
 add('MCQ',n,q,**extra)
add('CQ',1,'',stimulusText=None,stimulusImages=[asset('textbook-cq-1-diagram')],parts=[dict(label=l,question=q,marks=None,answer=None) for l,q in zip('কখগঘ',[
 'মোল কাকে বলে?',
 'স্থূল সংকেত ও আণবিক সংকেত উদাহরণসহ লেখো।',
 'উদ্দীপকের দ্রবদ্বয়কে একত্রে মিশ্রিত করলে যে লবণ পাওয়া যায় তার সংযুতি নির্ণয় করে দেখাও।',
 'উদ্দীপকের দ্রবণ দুটির মোলারিটি সমান হবে কিনা তার গাণিতিক যুক্তি দাও।'])],sourceNotes=['উদ্দীপকটি মূল বইয়ে ছবি; লেবেলসহ সেই ছবিই রাখা হয়েছে।','মূল মুদ্রণে গ অংশে “দ্রবদ্বয়কে” আছে; নীরবে “দ্রবণদ্বয়কে” করা হয়নি।','এই পাতায় উপপ্রশ্নের নম্বরমান ছাপা নেই; ১/২/৩/৪ অনুমান করে বসানো হয়নি।'])
add('CQ',2,'10 গ্রাম CaCO₃ প্রস্তুত করার লক্ষ্যে 4.4 গ্রাম কার্বন ডাইঅক্সাইড ও 5 গ্রাম ক্যালসিয়াম অক্সাইড মিশ্রিত করা হলো। বিক্রিয়ায় প্রত্যাশিত উৎপাদ পাওয়া গেল না।',parts=[dict(label=l,question=q,marks=None,answer=None) for l,q in zip('কখগঘ',[
 'রাসায়নিক সমীকরণ কাকে বলে?',
 'কার্বন ডাইঅক্সাইড এর মোলার আয়তন-এর ব্যাখ্যা করো।',
 'বিক্রিয়ায় কত মোল কার্বন ডাইঅক্সাইড ব্যবহার করা হয়েছিল তা নির্ণয় করে দেখাও।',
 'উদ্দীপকের বিক্রিয়ায় প্রত্যাশিত উৎপাদের পরিমাণ কম হওয়ার যৌক্তিক ব্যাখ্যা দাও।'])])
for n,q in enumerate([
 'Na₂CO₃ এর সেমিমোলার দ্রবণ ব্যাখ্যা করো।',
 'দ্রবণের মোলারিটি দ্রবের মোল সংখ্যার সাথে সম্পর্কিত ব্যাখ্যা করো।',
 'H₂SO₄ এর 100 মিলিলিটার ডেসিমোলার দ্রবণ কীভাবে তৈরি করা যায়? বর্ণনা করো।'],1):add('SQ',n,q)

counts=dict(Counter(x['type'] for x in items));assert counts==dict(MCQ=6,CQ=2,SQ=3)
for x in items:
 assert x['answer'] is None and x['marks'] is None and not x['originalPractice']
 assert (R/'public'/x['questionImage'].lstrip('/')).is_file()
collection=dict(schemaVersion='source-only-intake-v1',status='PARTIAL_VERIFIED_COLLECTION_NOT_IMPORTABLE',category='Class 9',subject='রসায়ন',topic='৬ষ্ঠ অধ্যায়: মোলের ধারণা ও রাসায়নিক গণনা',requested=dict(MCQ=500,CQ=200,SQ=100),verifiedCounts=counts,remainingAgainstTarget=dict(MCQ=494,CQ=198,SQ=97),ownQuestionsCreated=0,availableSourceTotalEstablished=False,scope='Only original textbook end-of-chapter questions on printed140–141 / PDF145–146 counted; not all source files or the entire chapter.',textFidelity='Native question image is authoritative. Editable text preserves wording, quantities and choices; line breaks/spacing and Unicode chemical subscripts/superscripts are transcription formatting, not byte-identical PDF text.',websiteImported=False,published=False,teacherApproved=False,strictApplicationUploaderCompatible=False,incompatibilityReason='Source pages do not supply correct-answer keys or marks; the application requires them. No answers/marks were invented and no validation was relaxed.',items=items)
write(OUT/'questions.json',enc(collection))
validation=dict(status=collection['status'],counts=counts,requested=collection['requested'],remainingAgainstTarget=collection['remainingAgainstTarget'],ownQuestionsCreated=0,sourceVerbatimCount=11,boardOrSchoolQuestionCountVerified=0,availableSourceTotalEstablished=False,originalPDFPagesActuallyInspectedForQuestions=[145,146],fullChapterReadInThisTask=False,sourceSHA256=SOURCE_HASH,assets={p.name:dict(bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest(),sourcePage=CROPS[p.stem][0],cropBounds=list(CROPS[p.stem][1])) for p in sorted(ASSET.glob('*.png'))},questionFileSHA256=hashlib.sha256((OUT/'questions.json').read_bytes()).hexdigest(),boardCandidatesExcludedFromVerifiedCount=49,unresolved=['Word rendering loses some Symbol-font glyphs and equation fields; plain Bijoy conversion also corrupts Latin formulas.','Some automatic question crops lose shared stimuli or choices across columns; source/board candidates need individual repair and fidelity review.','All remaining board/school questions, years and chapters have not been exhaustively inspected.','Source answers and marks are absent from inspected textbook question pages; left null.','No independent teacher certification, actual import, approval, publication or deployment.'])
write(OUT/'validation.json',enc(validation))
blocks=[]
for kind in ['MCQ','CQ','SQ']:
 blocks.append(f'<h2>{kind} — {counts[kind]}</h2>')
 for x in [x for x in items if x['type']==kind]:
  body=f'<article><h3>{kind} {x["sourceQuestionNumber"]} · বই পৃ. {x["source"]["printedPage"]}</h3>'
  if x.get('sharedStimulusGroup'):body+='<p class="note">মূলের যৌথ উদ্দীপক—এই প্রশ্নের অংশ, নতুন প্রশ্ন নয়।</p>'+''.join(f'<img alt="মূলের যৌথ উদ্দীপক" src="../../../public{p}">' for p in x['stimulusImages'])
  body+=f'<img class="original" alt="মূল সোর্সের সম্পূর্ণ প্রশ্ন" src="../../../public{x["questionImage"]}">'
  body+='<details><summary>সম্পাদনাযোগ্য প্রতিলিপি (মূল ছবিই চূড়ান্ত রেফারেন্স)</summary><p>'+html.escape(x['text'])+'</p>'
  if x.get('options'):body+=''.join(f'<p>{l}) {html.escape(q)}</p>' for l,q in x['options'].items())
  if x.get('parts'):body+=''.join(f'<p>{p["label"]}) {html.escape(p["question"])}</p>' for p in x['parts'])
  body+='</details><p class="note">উত্তর/নম্বরমান: এই সোর্স পাতায় নেই; নিজের থেকে যোগ করা হয়নি।</p></article>';blocks.append(body)
write(DOC/'chapter-6-source-review.html','<!doctype html><html lang="bn"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>অধ্যায় ৬ — শুধু সোর্সের প্রশ্ন · আংশিক সংগ্রহ</title><style>body{max-width:1000px;margin:30px auto;padding:0 20px;font:18px/1.8 system-ui;color:#173b36}header{padding:22px;background:#edf6f3;border-left:5px solid #177160}h1,h2{color:#116d60}article{border-bottom:1px solid #bbcfc9;padding:20px 0;break-inside:avoid}img{display:block;max-width:100%;height:auto;margin:16px auto}.original{border:1px solid #d4dfdb}.note{color:#536760;font-size:16px}details{padding:12px;background:#f6f8f7}a{color:#116d60}@media print{details{display:none}}</style><header><h1>৬ষ্ঠ অধ্যায় — মোলের ধারণা ও রাসায়নিক গণনা</h1><p><b>আংশিক যাচাইকৃত সোর্স সংগ্রহ: ৬ MCQ · ২ CQ · ৩ SQ</b></p><p>লক্ষ্য ৫০০/২০০/১০০ এখনও পূর্ণ হয়নি। নিজের তৈরি প্রশ্ন বা ভ্যারিয়েন্ট: ০। বাছাই করা ৪৯টি বোর্ড MCQ এখনও রূপান্তর/পূর্ণতা যাচাই বাকি—এই গণনায় নেই। সমস্ত সোর্সে মোট কতটি পাওয়া যাবে, তা এখনও স্থির হয়নি।</p><p>মূল পাঠ্যবইয়ের প্রশ্নের ছবি অক্ষুণ্ণ রাখা হয়েছে। প্রতিলিপিতে শুধু লাইনবিন্যাস ও Unicode রাসায়নিক চিহ্নের টাইপোগ্রাফি বদলাতে পারে। বোর্ড–সাল না থাকায় মনগড়া ট্যাগ নেই। সোর্সে উত্তর বা নম্বরমান না থাকায় তা বানানো হয়নি; ওয়েবসাইটে ইমপোর্ট/প্রকাশ নয়।</p></header>'+''.join(blocks)+'</html>')
print(enc(dict(verified=counts,ownQuestionsCreated=0,status=collection['status'])))
