"""Reproducible, visually transcribed first slice; never pads target or writes DB."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'content/question-bank/ssc/math/chapter-2'
FILE = '3.-Math-Link-Board-142-311_Compressed-1.pdf'
URL = 'https://drive.google.com/file/d/1dbnQgd9Su9CBeId1RV-hShNh8IG_YOJ5/view'
items = []

def add(kind, board, pdf, number, text, explanation, **extra):
    items.append(dict(type=kind, text=text, explanation=explanation,
        page=f'সংকলন: মুদ্রিত {pdf+141}; PDF {pdf}; প্রশ্ন {number}', difficulty='MEDIUM',
        provenance=[dict(kind='board', board=board, examYear=2024, sourceFile=FILE,
            pdfPage=pdf, printedPage=str(pdf+141), questionNumber=str(number))], **extra))

add('MCQ', 'cumilla', 20, 17,
    r'নিচের $\{x\in\mathbb{N}:5<x<7\text{ এবং }x\text{ মৌলিক সংখ্যা}\}$ সেটটিকে তালিকা পদ্ধতিতে প্রকাশ করে—',
    r'$5<x<7$ শর্তে একমাত্র স্বাভাবিক সংখ্যা $6$। কিন্তু $6=2\times3$ মৌলিক নয়। তাই শর্ত পূরণকারী উপাদান নেই; সেটটি $\varnothing$। $\{0\}$ এবং $\{\varnothing\}$ উভয়ই এক-উপাদানবিশিষ্ট সেট, শূন্য সেট নয়।',
    options={'A':r'$\varnothing$','B':r'$\{0\}$','C':r'$\{\varnothing\}$','D':r'$\{5,7\}$'}, correct='A')
add('MCQ', 'dinajpur', 67, 19,
    r'$M=\{2,3,4\}$, $N=\{2,4,7\}$ হলে $M\setminus N=$ কত?',
    r'$M\setminus N$-এ থাকবে $M$-এর সেই উপাদান, যা $N$-এ নেই। $2$ ও $4$ উভয় সেটে আছে, কিন্তু $3$ শুধু $M$-এ আছে। তাই $M\setminus N=\{3\}$।',
    options={'A':r'$\{3\}$','B':r'$\{7\}$','C':r'$\{2,4\}$','D':r'$\{3,7\}$'}, correct='A')
add('CQ', 'cumilla', 21, 1,
    r'(i) $R=\{(x,y):x\in A,y\in A\text{ এবং }x-y+2=0\}$, যেখানে $A=\{-3,-2,-1,0,1\}$। (ii) $f(x)=\frac{1+x^3+x^6}{x^3}$।',
    'সেট গঠন পদ্ধতি, অন্বয়ের ডোমেন এবং ফাংশনের প্রতিস্থাপন পৃথক ধাপে নির্ণয় করতে হবে। ভগ্নাংশ ফাংশনের চলক শূন্য হতে পারবে না।',
    parts=[
        dict(label='ক', marks=2, question='A সেটটিকে সেট গঠন পদ্ধতিতে প্রকাশ কর।',
             solution=r'$A=\{x\in\mathbb{Z}:-3\leq x\leq1\}$। এখানে $\mathbb{Z}$ দ্বারা পূর্ণসংখ্যার সেট বোঝায়।'),
        dict(label='খ', marks=4, question=r'$R$ অন্বয়টিকে তালিকা পদ্ধতিতে প্রকাশ করে ডোম $R$ নির্ণয় কর।',
             solution=r'$x-y+2=0$ থেকে $y=x+2$। $x,y\in A$ হওয়ায় গ্রহণযোগ্য জোড়া $(-3,-1),(-2,0),(-1,1)$। $x=0,1$ হলে যথাক্রমে $y=2,3\notin A$। তাই $R=\{(-3,-1),(-2,0),(-1,1)\}$ এবং $\operatorname{Dom}R=\{-3,-2,-1\}$।'),
        dict(label='গ', marks=4, question=r'দেখাও যে, $f(x^2)=f(x^{-2})$।',
             solution=r'উভয় পক্ষ সংজ্ঞায়িত হওয়ার জন্য $x\ne0$। $f(t)=t^{-3}+1+t^3$। তাই $f(x^2)=x^{-6}+1+x^6$ এবং $f(x^{-2})=x^6+1+x^{-6}$। যোগের বিনিময় সূত্রে অভিব্যক্তি দুটি সমান। অতএব $f(x^2)=f(x^{-2})$, যখন $x\ne0$।')])
add('CQ', 'dinajpur', 68, 1,
    r'$A=\{x:x\in\mathbb{N}\text{ এবং }x^2-5x+6=0\}$, $B=\{x\in\mathbb{N}:x\text{ মৌলিক সংখ্যা এবং }x<11\}$, $C=\{3,4,5,7,9\}$ এবং $f(x)=\frac{3x+1}{3x-1}$।',
    'মূল বোর্ড-আরোপিত প্রশ্নের তিন অংশই রাখা হয়েছে। সমাধানে মূলদ ফাংশনের সংজ্ঞার শর্তও আলাদাভাবে যোগ করা হয়েছে।',
    parts=[
        dict(label='ক', marks=2, question='A সেটটিকে তালিকা পদ্ধতিতে প্রকাশ কর।',
             solution=r'$x^2-5x+6=(x-2)(x-3)=0$ থেকে $x=2$ অথবা $3$। উভয়ই স্বাভাবিক সংখ্যা। তাই $A=\{2,3\}$।'),
        dict(label='খ', marks=4, question=r'দেখাও যে, $P(B\cap C)$ এর উপাদান সংখ্যা $2^n$ কে সমর্থন করে, যেখানে $n$ হচ্ছে $(B\cap C)$ এর উপাদান সংখ্যা।',
             solution=r'$B=\{2,3,5,7\}$, তাই $B\cap C=\{3,5,7\}$ এবং $n=3$। $P(B\cap C)=\{\varnothing,\{3\},\{5\},\{7\},\{3,5\},\{3,7\},\{5,7\},\{3,5,7\}\}$। এর উপাদান সংখ্যা $8=2^3=2^n$। প্রতিটি উপাদান উপসেটে অন্তর্ভুক্ত বা অনন্তর্ভুক্ত—দুই সম্ভাবনা থাকায়ও $2^3$ পাওয়া যায়।'),
        dict(label='গ', marks=4, question=r'$\frac{f(\frac{1}{x^2})+1}{f(\frac{1}{x^2})-2}$ এর মান নির্ণয় কর।',
             solution=r'$f(\frac{1}{x^2})=\frac{3/x^2+1}{3/x^2-1}=\frac{3+x^2}{3-x^2}$। তাই চাওয়া রাশি $=\frac{\frac{3+x^2}{3-x^2}+1}{\frac{3+x^2}{3-x^2}-2}=\frac{6/(3-x^2)}{3(x^2-1)/(3-x^2)}=\frac{2}{x^2-1}$। মূল রাশির জন্য $x\ne0$, $x^2\ne3$ এবং $x^2\ne1$; সরলীকরণের পরেও এই সব শর্ত প্রযোজ্য।')])

batch=dict(category='Class 9', subject='গণিত', topic='২য় অধ্যায়: সেট ও ফাংশন',
    book='চ্যান্সেলর SSC বোর্ড প্রশ্ন ও উত্তরমালা — গণিত (বোর্ড-আরোপিত সংকলন)',
    edition='সংকলনে ২০২৪ ও ২০২৩; এই প্রাথমিক ব্যাচে ২০২৪ সালের প্রশ্ন',
    sourceUrl=URL, lang='Bangla', items=items)
counts={kind:sum(q['type']==kind for q in items) for kind in ['MCQ','CQ','SQ']}
target={'MCQ':300,'CQ':100,'SQ':70}
review=dict(status='PARTIAL_SOURCE_REVIEWED_DRAFT_NOT_IMPORTED', targetMet=False,
    teacherApproved=False, officialOriginalPaperIndependentlyVerified=False,
    targetCounts=target, counts=counts, remaining={k:target[k]-counts[k] for k in target},
    importedCounts=dict(MCQ=0,CQ=0,SQ=0), databaseCountVerified=False,
    chapterTextbookRead=False, sourcePriority=['board-paper','NCTB-textbook','other-online-source'],
    source=dict(fileName=FILE, sourceUrl=URL,
        sha256='ef88ec3c42fa52f407c39f1b978fa0494a695bac7d2b51a7c3921afa49a46111',
        attribution='বোর্ড ও সাল সংকলনের শিরোনাম থেকে; সরকারি মূল প্রশ্নপত্রের স্বাধীন authentication নয়।'),
    previousChapter=dict(chapter=1,status='PAUSED_INCOMPLETE_PER_USER_NEXT_CHAPTER_REQUEST',
        preparedCounts=dict(MCQ=9,CQ=0,SQ=0),remaining=dict(MCQ=191,CQ=50,SQ=40)),
    itemReviews=[dict(item=i+1,visualRead=True,sourceKind='board-compilation',
        adaptation='প্রশ্ন/বিকল্প ও তিন CQ অংশ অপরিবর্তিত অর্থে Unicode/LaTeX-এ প্রতিলিপি; ব্যাখ্যা ও সমাধান নতুনভাবে রচিত।',
        pdfPage=q['provenance'][0]['pdfPage'],questionNumber=q['provenance'][0]['questionNumber']) for i,q in enumerate(items)],
    excluded=[dict(pdfPage=12,questionNumber='1',reason='রাজশাহী ২০২৪: গ অংশ বাস্তব সংখ্যা; পূর্ণ অধ্যায়-২ CQ হিসেবে গণনা নয়।'),
        dict(pdfPage=78,questionNumber='1',reason='ময়মনসিংহ ২০২৪: ক লগারিদম ও গ করণী/বীজগণিত; শুধু খ ফাংশন হওয়ায় পূর্ণ অধ্যায়-২ CQ নয়।')],
    nextWork=['২০২৪-এর বাকি বোর্ড ও ২০২৩-এর প্রশ্ন ছবিতে দেখে chapter mapping ও পূর্ণ উত্তর যাচাই',
        'বোর্ড উৎসে প্রকৃত ঘাটতি নির্ণয়ের পরে NCTB অধ্যায়/অনুশীলনী সংগ্রহ ও পাঠ',
        'প্রয়োজনে অন্য নির্ভরযোগ্য উৎস; original/adapted practice আলাদা attribution',
        'চূড়ান্ত ৪৭০ প্রশ্ন হলে <=২০০ item-এর অন্তত ৩টি import JSON; প্রতিটি version Drive backup',
        'শিক্ষক review, duplicate check, importer preview ও সত্যিকারের import receipt'],
    limitations=['লক্ষ্য ৩০০ MCQ + ১০০ CQ + ৭০ SQ এখনও পূর্ণ নয়; এটি প্রথম উৎস-যাচাইকৃত ছোট ব্যাচ।',
        'এই ব্যাচে SQ নেই; পুরোনো CQ-কে ভেঙে মূল SQ বা পূর্ণ CQ-র সংখ্যা বাড়ানো হয়নি।',
        'এখনও বোর্ড প্রশ্নের পূর্ণ সংগ্রহ/সকল পৃষ্ঠার chapter audit বা NCTB অধ্যায় পাঠ সম্পন্ন নয়।',
        'ব্যাচটি standalone importer-compatible draft; prepared registry বা database-এ এই অধ্যায় এখনও যোগ হয়নি।'])

# Deterministic exact checks, not a claim of independent teacher approval.
assert {x for x in range(1,20) if 5<x<7 and all(x%d for d in range(2,x))}==set()
assert {2,3,4}-{2,4,7}=={3}
A={-3,-2,-1,0,1}
assert {(x,y) for x in A for y in A if x-y+2==0}=={(-3,-1),(-2,0),(-1,1)}
assert {x for x in range(1,20) if x*x-5*x+6==0}=={2,3}
from itertools import combinations
B={2,3,5,7};C={3,4,5,7,9};S=B&C
assert S=={3,5,7}
assert len({frozenset(c) for n in range(4) for c in combinations(S,n)})==2**len(S)==8
from fractions import Fraction as F
f=lambda x:(1+x**3+x**6)/x**3
g=lambda x:(3*x+1)/(3*x-1)
for x in [F(-5,2),F(-2),F(-1,2),F(1,2),F(2),F(5,2),F(3)]:
    assert f(x*x)==f(1/(x*x))
    v=g(1/(x*x));assert (v+1)/(v-2)==2/(x*x-1)

def emit(name,obj):
    text=json.dumps(obj,ensure_ascii=False,indent=2)+'\n';p=OUT/name
    if '--check' in sys.argv:assert p.read_text()==text,f'Stale: {name}'
    else:p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text)
emit('board-seed-v1.json',batch)
emit('validation.json',review)
print(f'PASS: source seed {counts}; remaining {review["remaining"]}; no database writes')
