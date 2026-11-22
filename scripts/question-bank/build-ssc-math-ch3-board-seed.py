"""First visually reviewed source slice for chapter 3, not target padding/import.
Dev validation: PYTHONPATH=.cache/math-validation python3 this_file.py [--check]
"""
import json
import sys
from pathlib import Path
import sympy as S

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'content/question-bank/ssc/math/chapter-3'
FILE='3.-Math-Link-Board-142-311_Compressed-1.pdf'
URL='https://drive.google.com/file/d/1dbnQgd9Su9CBeId1RV-hShNh8IG_YOJ5/view'
items=[]
reviews=[]

def add(kind,board,pdf,number,text,explanation,skill,**extra):
    items.append(dict(type=kind,text=text,explanation=explanation,
        page=f'সংকলন: মুদ্রিত {pdf+141}; PDF {pdf}; প্রশ্ন {number}',
        difficulty='HARD' if kind=='CQ' else 'MEDIUM',
        provenance=[dict(kind='board',board=board,examYear=2024,sourceFile=FILE,
            pdfPage=pdf,printedPage=str(pdf+141),questionNumber=str(number))],**extra))
    reviews.append(dict(item=len(items),origin='TRANSCRIBED_BOARD_COMPILATION',visualRead=True,
        pdfPage=pdf,printedPage=pdf+141,questionNumber=str(number),skill=skill,
        adaptation='মূল শর্ত, বিকল্পের ক্রম ও CQ-র সব অংশ রেখে Unicode/LaTeX-এ প্রতিলিপি; সমাধান নতুনভাবে রচিত।'))

choices={'A':'i ও ii','B':'i ও iii','C':'ii ও iii','D':'i, ii ও iii'}
add('MCQ','cumilla',20,20,
    r'$x^2+y^2=9$ এবং $xy=3$ হলে— i. $(x-y)^2=3$; ii. $(x+y)^2=15$; iii. $x^2+y^2+x^2y^2=18$। নিচের কোনটি সঠিক?',
    r'$(x-y)^2=x^2+y^2-2xy=9-6=3$; $(x+y)^2=x^2+y^2+2xy=9+6=15$। আবার $x^2+y^2+x^2y^2=9+(xy)^2=9+9=18$। তাই তিনটি বিবৃতিই সঠিক; উত্তর D।',
    'বর্গের সূত্র',options=choices,correct='D')
add('MCQ','sylhet',49,16,
    r'$x+y=\sqrt{8}$ এবং $x-y=\sqrt{5}$ হলে— i. $xy=\frac34$; ii. $x^2+y^2=\frac{13}{2}$; iii. $x^2-y^2=\sqrt{40}$। নিচের কোনটি সঠিক?',
    r'দুই শর্ত বর্গ করে পাই $(x+y)^2=8$ এবং $(x-y)^2=5$। বিয়োগে $4xy=3$, তাই $xy=3/4$। যোগে $2(x^2+y^2)=13$, তাই $x^2+y^2=13/2$। আবার $x^2-y^2=(x+y)(x-y)=\sqrt8\sqrt5=\sqrt{40}$। তিনটিই সঠিক; উত্তর D।',
    'যোগ-বিয়োগের বর্গ ও বর্গের অন্তর',options=choices,correct='D')
add('MCQ','sylhet',49,22,
    r'$x=\sqrt6$, $y=\sqrt3$ হলে $(x-y)^2+2xy$ এর মান কত?',
    r'$(x-y)^2+2xy=x^2-2xy+y^2+2xy=x^2+y^2$। তাই মান $6+3=9$; উত্তর D।',
    'বর্গের সূত্রে সরলীকরণ',options={'A':'$3$','B':r'$\sqrt{18}$','C':r'$2\sqrt{18}$','D':'$9$'},correct='D')
add('MCQ','sylhet',49,24,
    r'$a+b=\sqrt3$, $a-b=1$ হলে $4ab$ এর মান নিচের কোনটি?',
    r'$(a+b)^2-(a-b)^2=4ab$। ফলে $4ab=(\sqrt3)^2-1^2=3-1=2$; উত্তর C।',
    'বর্গের সূত্রে গুণফল',options={'A':'$4$','B':r'$\sqrt3+1$','C':'$2$','D':r'$\sqrt3-1$'},correct='C')
add('MCQ','jashore',29,21,
    r'$a+b=6$, $a-b=4$ হলে— i. $a^2-b^2=24$; ii. $a^2+b^2=26$; iii. $4ab=20$। নিচের কোনটি সঠিক?',
    r'$a^2-b^2=(a+b)(a-b)=6\times4=24$। $a^2+b^2=((a+b)^2+(a-b)^2)/2=(36+16)/2=26$। $4ab=(a+b)^2-(a-b)^2=36-16=20$। তাই তিনটি বিবৃতিই সঠিক; উত্তর D।',
    'বর্গের অন্তর ও যোগফলের সূত্র',options=choices,correct='D')
add('MCQ','dinajpur',67,2,
    r'যদি $f(x)=x^3+ax^2-6x-9$ হয়, তবে $a$ এর কোন মানের জন্য $f(-3)=0$ হবে?',
    r'$x=-3$ বসিয়ে পাই $f(-3)=-27+9a+18-9=9a-18$। শূন্য হওয়ার শর্তে $9a-18=0$; তাই $a=2$। সমতুল্যভাবে বহুপদীটি $(x+3)$ দ্বারা নিঃশেষে বিভাজ্য; উত্তর B।',
    'বহুপদীর শূন্যমান/ভাগশেষ উপপাদ্য',options={'A':'$6$','B':'$2$','C':'$-2$','D':'$-4$'},correct='B')
add('CQ','dinajpur',68,2,
    r'(i) $a^2-2\sqrt6\,a+1=0$ এবং (ii) $x-5=2\sqrt6$।',
    'উৎপাদকে বিশ্লেষণ, ঘনের সূত্র এবং বিপরীত রাশির সূত্র ব্যবহার করতে হবে। মূল রাশির সংজ্ঞার শর্ত সমাধানে সংরক্ষিত।',
    'উৎপাদকে বিশ্লেষণ; করণীর ঘন; a ও 1/a-এর ঘাতসমষ্টি',
    parts=[
        dict(label='ক',marks=2,
            question=r'$4b^2+\frac{1}{4b^2}-2+4b-\frac1b$ কে উৎপাদকে বিশ্লেষণ কর।',
            solution=r'$b\ne0$। ধরি $t=2b-\frac1{2b}$। তাহলে রাশিটি $t^2+2t=t(t+2)$। অর্থাৎ $\left(2b-\frac1{2b}\right)\left(2b-\frac1{2b}+2\right)=\frac{(2b-1)(2b+1)(4b^2+4b-1)}{4b^2}$।'),
        dict(label='খ',marks=4,
            question=r'প্রমাণ কর যে, $x\sqrt{x}-\frac1{x\sqrt{x}}=22\sqrt2$।',
            solution=r'$x=5+2\sqrt6=(\sqrt3+\sqrt2)^2>0$। প্রধান বর্গমূল $\sqrt{x}=\sqrt3+\sqrt2$ এবং $1/\sqrt{x}=\sqrt3-\sqrt2$, কারণ তাদের গুণফল ১। অতএব $x\sqrt{x}-1/(x\sqrt{x})=(\sqrt3+\sqrt2)^3-(\sqrt3-\sqrt2)^3=6(\sqrt3)^2\sqrt2+2(\sqrt2)^3=18\sqrt2+4\sqrt2=22\sqrt2$।'),
        dict(label='গ',marks=4,
            question=r'দেখাও যে, $\frac{a^{10}+1}{a^5}=922\sqrt6$।',
            solution=r'মূল সমীকরণে $a=0$ অসম্ভব। $a$ দিয়ে ভাগ করলে $a+1/a=2\sqrt6$। ধরি $s_n=a^n+a^{-n}$। তাহলে $s_0=2$, $s_1=2\sqrt6$ এবং $s_n=(a+1/a)s_{n-1}-s_{n-2}$; গুণ করে মধ্যের দুইটি পদ বাদ দিলেই সূত্রটি মেলে। তাই $s_2=24-2=22$, $s_3=44\sqrt6-2\sqrt6=42\sqrt6$, $s_4=504-22=482$, $s_5=964\sqrt6-42\sqrt6=922\sqrt6$। চাওয়া রাশি $(a^{10}+1)/a^5=a^5+a^{-5}=s_5$; প্রমাণিত।')])

# Exact mathematics, distinct from source publisher answer keys.
a,b,x,y=S.symbols('a b x y',real=True)
def zero(expr):assert S.simplify(expr)==0,expr
zero((x-y)**2+2*x*y-(x*x+y*y))
zero((a+b)**2-(a-b)**2-4*a*b)
zero((a+b)*(a-b)-(a*a-b*b))
assert 9-2*3==3 and 9+2*3==15 and 9+3**2==18
xx=(S.sqrt(8)+S.sqrt(5))/2;yy=(S.sqrt(8)-S.sqrt(5))/2
zero(xx*yy-S.Rational(3,4));zero(xx*xx+yy*yy-S.Rational(13,2));zero(xx*xx-yy*yy-S.sqrt(40))
zero((S.sqrt(6)-S.sqrt(3))**2+2*S.sqrt(6)*S.sqrt(3)-9)
assert (6*4,(6**2+4**2)//2,6**2-4**2)==(24,26,20)
assert S.solve((x**3+a*x*x-6*x-9).subs(x,-3),a)==[2]
original=4*b*b+1/(4*b*b)-2+4*b-1/b
factored=(2*b-1)*(2*b+1)*(4*b*b+4*b-1)/(4*b*b)
zero(original-factored)
u=S.sqrt(3)+S.sqrt(2);v=S.sqrt(3)-S.sqrt(2)
zero(u*v-1);zero(u**3-v**3-22*S.sqrt(2))
for root in [S.sqrt(6)+S.sqrt(5),S.sqrt(6)-S.sqrt(5)]:
    zero(root**2-2*S.sqrt(6)*root+1)
    zero((root**10+1)/root**5-922*S.sqrt(6))

counts={k:sum(q['type']==k for q in items) for k in ['MCQ','CQ','SQ']}
target=dict(MCQ=300,CQ=150,SQ=100)
batch=dict(category='Class 9',subject='গণিত',topic='৩য় অধ্যায়: বীজগাণিতিক রাশি',
    book='চ্যান্সেলর SSC বোর্ড প্রশ্ন ও উত্তরমালা — গণিত (বোর্ড-আরোপিত সংকলন)',
    edition='প্রথম উৎস-যাচাইকৃত খসড়া; ২০২৪ সালের বোর্ড-আরোপিত প্রশ্ন',sourceUrl=URL,lang='Bangla',items=items)
review=dict(status='STARTED_PARTIAL_SOURCE_REVIEWED_DRAFT_NOT_IMPORTED',teacherApproved=False,
    targetMet=False,targetCounts=target,counts=counts,remaining={k:target[k]-counts[k] for k in target},
    importedCounts=dict(MCQ=0,CQ=0,SQ=0),databaseCountVerified=False,
    chapterTextbookRead=False,boardSearchExhaustive=False,officialOriginalPaperIndependentlyVerified=False,
    sourcePriority=['board-paper','NCTB-textbook','other-online-source'],
    source=dict(fileName=FILE,sourceUrl=URL,
        sha256='ef88ec3c42fa52f407c39f1b978fa0494a695bac7d2b51a7c3921afa49a46111',
        attribution='বোর্ড ও সাল সংকলনের শিরোনাম থেকে; মূল সরকারি প্রশ্নপত্রের স্বাধীন authentication নয়।'),
    itemReviews=reviews,
    excluded=[dict(pdfPage=30,questionNumber='1',reason='যশোর ২০২৪ CQ: x^2=5+2sqrt(6) হলেও x-এর চিহ্ন নেই; খ অংশের দাবি ঋণাত্মক x-এ মেলে না। অন্ধ প্রতিলিপি বা নীরবে x>0 যোগ করে অবিকল বোর্ড প্রশ্ন হিসেবে গণনা নয়।')],
    nextWork=['২০২৪-এর অবশিষ্ট এবং ২০২৩ সালের বোর্ড প্রশ্ন দেখে উপযুক্ত প্রশ্ন সংগ্রহ',
        'অধ্যায়ের সূত্র, ঘন, উৎপাদকে বিশ্লেষণ ও ভাগশেষ উপপাদ্যের coverage map',
        'প্রয়োজন হলে textbook/অন্যান্য উৎস; নিজস্ব practice হলে স্পষ্ট attribution',
        'SQ-র স্বতন্ত্র উত্তর; সব CQ-তে পূর্ণ ২–৪–৪ অংশ ও solution',
        'চূড়ান্ত ৫৫০টি হলে <=২০০ item-এর অন্তত তিনটি importer batch; সব version Drive backup'],
    limitations=['শুধু শুরু হয়েছে: ৬ MCQ ও ১ পূর্ণ CQ; ৩০০/১৫০/১০০ লক্ষ্য এখনও পূর্ণ নয়।',
        'মূল সংকলনের পাঠ্য দেখে উত্তর নতুনভাবে লেখা; শিক্ষক অনুমোদন বাকি।',
        'MCQ key সংকলনের উত্তরতালিকা থেকে অন্ধভাবে নেওয়া হয়নি; exact symbolic calculation দিয়ে মেলানো হয়েছে।',
        'CQ খ-তে x>0 মূল শর্ত থেকেই অনুসৃত; গ-তে a-এর দুই মূলেই দাবি যাচাই হয়েছে।',
        'শুধু standalone importer-compatible JSON; prepared registry/live database-এ এই অধ্যায় এখনও যোগ হয়নি।'])

def emit(name,obj):
    text=json.dumps(obj,ensure_ascii=False,indent=2)+'\n';p=OUT/name
    if '--check' in sys.argv:assert p.read_text()==text,f'Stale {name}'
    else:p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text)
emit('board-seed-v1.json',batch);emit('validation.json',review)
print(f'PASS: chapter 3 source start {counts}; remaining {review["remaining"]}; exact identities/CQ checks; no DB writes')
