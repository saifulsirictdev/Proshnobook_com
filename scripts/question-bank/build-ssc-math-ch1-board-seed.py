"""First source-grounded slice of the owner's SSC math chapter-1 request.
Only visually read, solved questions are emitted. Never pads to a target or imports.
Run --check to verify the checked-in artifact is reproducible; no network/database.
"""
import hashlib
import json
import sys
from fractions import Fraction as F
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'content/question-bank/ssc/math/chapter-1'
SOURCE_FILE = '3.-Math-Link-Board-142-311_Compressed-1.pdf'
SOURCE_ID = '1dbnQgd9Su9CBeId1RV-hShNh8IG_YOJ5'
SOURCE_SHA = 'ef88ec3c42fa52f407c39f1b978fa0494a695bac7d2b51a7c3921afa49a46111'
rows = []
reviews = []

def add(board, pdf, number, text, options, correct, explanation, check, note='Unicode-এ প্রতিলিপি; অর্থ/বিকল্প অপরিবর্তিত।'):
    rows.append(dict(type='MCQ', text=text, options=dict(zip('ABCD', options)), correct=correct,
                     explanation=explanation, page=f'সংকলন: মুদ্রিত {pdf+141}; PDF {pdf}; প্রশ্ন {number}',
                     difficulty='MEDIUM' if 'sqrt' in str(options) else 'EASY',
                     provenance=[dict(kind='board', board=board, examYear=2024, sourceFile=SOURCE_FILE,
                                      pdfPage=pdf, printedPage=str(pdf+141), questionNumber=str(number))]))
    reviews.append(dict(item=len(rows), sourceBoard=board, sourceYear=2024, pdfPage=pdf,
                        printedPage=pdf+141, questionNumber=number, visualRead=True,
                        adaptation=note, independentCalculation=check))

add('dhaka',1,23,
    '$0.\\overline{3}\\times0.\\overline{6}$ এর মান কত?',
    ['$1$','$0.\\overline{2}$','$0.\\overline{18}$','$0.1\\overline{8}$'], 'B',
    '$0.\\overline{3}=\\frac{1}{3}$ এবং $0.\\overline{6}=\\frac{2}{3}$। তাই গুণফল $\\frac{1}{3}\\times\\frac{2}{3}=\\frac{2}{9}=0.\\overline{2}$। দুই অঙ্ক ১৮ আবৃত্ত হলে মান $\\frac{18}{99}=\\frac{2}{11}$; আর $0.1\\overline{8}=\\frac{17}{90}$—এগুলো গুণফল নয়।',
    dict(operation='multiply',operands=['1/3','2/3'],expected='2/9',choiceValues=['1','2/9','2/11','17/90']))
add('cumilla',20,16,
    'মূলদ–অমূলদ বিচার করে নিচের কোন সংখ্যাটিকে অমূলদ বলা যায়?',
    ['$0.\\overline{2}$','$\\sqrt{\\frac{9}{16}}$','$\\sqrt[3]{\\frac{8}{27}}$','$\\frac{5}{\\sqrt{3}}$'], 'D',
    'প্রথম তিনটি সংখ্যা যথাক্রমে $\\frac{2}{9}$, $\\frac{3}{4}$ ও $\\frac{2}{3}$—সবই মূলদ। শেষটি $\\frac{5}{\\sqrt{3}}=\\frac{5\\sqrt{3}}{3}$। $\\sqrt{3}$ অমূলদ এবং $\\frac{5}{3}$ অশূন্য মূলদ, তাই শেষ সংখ্যাটি অমূলদ।',
    dict(operation='uniqueIrrational',rationalChoices=['2/9','3/4','2/3',None],radicand=3,coefficient='5/3'),
    'মূল প্রশ্নের সাধারণ বাক্য “নিচের কোনটি অমূলদ সংখ্যা?” সামান্য পুনর্লিখিত, যাতে একই generic stem-যুক্ত ভিন্ন বোর্ডের বিকল্পসমৃদ্ধ প্রশ্ন stem-only importer-এ হারিয়ে না যায়। মূল চার বিকল্পের মান/ক্রম অক্ষত।')
add('jashore',29,2,
    '$a$ ও $b$ দুটি ক্রমিক জোড় সংখ্যা হলে নিচের কোনটি বিজোড় সংখ্যা?',
    ['$a^2+1$','$b^2+2$','$a^2$','$b^2$'],'A',
    'জোড় সংখ্যার বর্গ জোড়। তাই $a^2+1$ বিজোড়, কিন্তু $b^2+2$, $a^2$ ও $b^2$ সবই জোড়। ক্রমিক হওয়ার অতিরিক্ত শর্তটি ফলের জন্য প্রয়োজন না হলেও মূল প্রশ্ন অনুযায়ী রাখা হয়েছে।',
    dict(operation='parity',evenSamples=[-4,-2,0,2,4,100],expectedParity=[1,0,0,0]))
add('sylhet',49,2,
    '$0.53$ এর সাধারণ ভগ্নাংশ কোনটি?',
    ['$\\frac{53}{90}$','$\\frac{50}{90}$','$\\frac{53}{100}$','$\\frac{24}{45}$'],'C',
    'মূল প্রশ্নে $0.53$ একটি সসীম দশমিক; ৩-এর উপর আবৃত্তির বিন্দু নেই। দশমিকের পরে দুই অঙ্ক থাকায় $0.53=\\frac{53}{100}$। ৫৩ ও ১০০ সহমৌলিক, তাই এটিই সরলতম আকার।',
    dict(operation='finiteDecimal',digits='53',places=2,expected='53/100',choiceValues=['53/90','5/9','53/100','8/15']),
    'মূল পৃষ্ঠা ও উচ্চ রেজোলিউশন crop-এ দেখা হয়েছে: 0.53-এ আবৃত্তির বিন্দু নেই; একে 0.5-আবৃত্ত-3 করা হয়নি।')
add('sylhet',49,18,
    '$\\sqrt{\\frac{5}{80}}$ কোন ধরনের সংখ্যা?',
    ['স্বাভাবিক','অমূলদ','মূলদ','মৌলিক'],'C',
    '$\\sqrt{\\frac{5}{80}}=\\sqrt{\\frac{1}{16}}=\\frac{1}{4}$। এটি দুই পূর্ণসংখ্যার অনুপাত, তাই মূলদ; এটি স্বাভাবিক বা মৌলিক সংখ্যা নয়।',
    dict(operation='rationalSquareRoot',fraction='5/80',expected='1/4'))
add('sylhet',49,28,
    'নিচের কোন সংখ্যাটি অমূলদ?',
    ['$0.\\overline{53}$','$0.80$','$\\sqrt{8}$','$\\sqrt{9}$'],'C',
    '$0.\\overline{53}=\\frac{53}{99}$, $0.80=\\frac{4}{5}$ এবং $\\sqrt{9}=3$ মূলদ। কিন্তু $\\sqrt{8}=2\\sqrt{2}$ অমূলদ, কারণ $\\sqrt{2}$ অমূলদ।',
    dict(operation='uniqueIrrational',rationalChoices=['53/99','4/5',None,'3'],radicand=2,coefficient='2'),
    'মূল generic stem সামান্য পুনর্লিখিত; বিকল্প/ক্রম অক্ষত। প্রথম বিকল্পে ৫ ও ৩ উভয়টি আবৃত্ত—পূর্ণ block 53-কে overline-এ দেখানো হয়েছে।')
add('barishal',58,16,
    '$0.1\\overline{3}\\div0.\\overline{3}$ এর মান কত?',
    ['$\\frac{2}{45}$','$\\frac{2}{5}$','$\\frac{4}{9}$','$4$'],'B',
    '$0.1\\overline{3}=\\frac{13-1}{90}=\\frac{2}{15}$ এবং $0.\\overline{3}=\\frac{1}{3}$। অতএব ভাগফল $\\frac{2}{15}\\div\\frac{1}{3}=\\frac{2}{5}$। প্রথম দশমিকের ১ আবৃত্ত নয়; শুধু শেষের ৩ আবৃত্ত।',
    dict(operation='divide',operands=['2/15','1/3'],expected='2/5',choiceValues=['2/45','2/5','4/9','4']),
    'উচ্চ রেজোলিউশন crop-এ প্রথম দশমিকে শুধু ৩-এর উপরের বিন্দু ও দ্বিতীয় দশমিকে ৩-এর বিন্দু দেখা হয়েছে। overline দিয়ে স্পষ্ট করা হয়েছে।')
add('dinajpur',67,1,
    'প্রদত্ত চারটি সংখ্যার মধ্যে অমূলদ সংখ্যাটি কোনটি?',
    ['$\\frac{\\sqrt[3]{64}}{\\sqrt{36}}$','$\\frac{\\sqrt{32}}{\\sqrt{64}}$','$\\sqrt{\\frac{81}{625}}$','$\\frac{\\sqrt[3]{8}}{\\sqrt[3]{27}}$'],'B',
    'প্রথমটি $\\frac{4}{6}=\\frac{2}{3}$, তৃতীয়টি $\\frac{9}{25}$ এবং চতুর্থটি $\\frac{2}{3}$—মূলদ। দ্বিতীয়টি $\\frac{\\sqrt{32}}{\\sqrt{64}}=\\frac{4\\sqrt{2}}{8}=\\frac{\\sqrt{2}}{2}$ অমূলদ। প্রথম ও চতুর্থ বিকল্পের মান সমান হলেও মূল প্রশ্নের চার বিকল্পই অক্ষত রাখা হয়েছে।',
    dict(operation='uniqueIrrational',rationalChoices=['2/3',None,'9/25','2/3'],radicand=2,coefficient='1/2'),
    'মূল generic stem সামান্য পুনর্লিখিত; মূল/ঘনমূলের সূচক ও বিকল্পের ক্রম ছবির সঙ্গে মিলেছে। A ও D গাণিতিকভাবে সমমান হলেও প্রকাশভঙ্গি আলাদা; মূল প্রশ্ন বদলানো হয়নি।')
add('mymensingh',77,1,
    '$1.\\overline{43}$ এর সাধারণ ভগ্নাংশ কোনটি?',
    ['$\\frac{142}{99}$','$\\frac{143}{99}$','$\\frac{142}{100}$','$\\frac{143}{100}$'],'A',
    '$x=1.\\overline{43}$ হলে $100x=143.\\overline{43}$। বিয়োগে $99x=142$, তাই $x=\\frac{142}{99}$। এখানে দশমিকের পরে ৪৩—পুরো block আবৃত্ত হয়।',
    dict(operation='pureRecurring',integer=1,block='43',expected='142/99',choiceValues=['142/99','143/99','71/50','143/100']))

batch=dict(category='Class 9',subject='গণিত',topic='১ম অধ্যায়: বাস্তব সংখ্যা',
           book='চ্যান্সেলর SSC বোর্ড প্রশ্ন ও উত্তরমালা — গণিত (বোর্ড-আরোপিত সংকলন)',
           edition='সংকলনে ২০২৪ ও ২০২৩; এই প্রাথমিক ব্যাচে ২০২৪ সালের প্রশ্ন',
           sourceUrl=f'https://drive.google.com/file/d/{SOURCE_ID}/view',lang='Bangla',items=rows)
# Exact rational checks; all correct keys are derived independently below.
for q,r in zip(rows,reviews):
    c=r['independentCalculation'];op=c['operation']
    if op in ['multiply','divide']:
        x,y=map(F,c['operands']);actual=x*y if op=='multiply' else x/y
    elif op=='finiteDecimal':actual=F(int(c['digits']),10**c['places'])
    elif op=='pureRecurring':actual=F(c['integer'])+F(int(c['block']),10**len(c['block'])-1)
    elif op=='rationalSquareRoot':
        import math
        f=F(c['fraction']);assert math.isqrt(f.numerator)**2==f.numerator and math.isqrt(f.denominator)**2==f.denominator
        actual=F(math.isqrt(f.numerator),math.isqrt(f.denominator))
    elif op=='parity':
        for a in c['evenSamples']:
            b=a+2;assert [v%2 for v in [a*a+1,b*b+2,a*a,b*b]]==c['expectedParity']
        assert q['correct']=='A';continue
    elif op=='uniqueIrrational':
        import math
        assert math.isqrt(c['radicand'])**2!=c['radicand'] and F(c['coefficient'])!=0
        assert c['rationalChoices'].count(None)==1
        assert 'ABCD'[c['rationalChoices'].index(None)]==q['correct'];continue
    else:raise AssertionError(op)
    assert actual==F(c['expected'])
    if 'choiceValues' in c:
        matches=[key for key,v in zip('ABCD',c['choiceValues']) if F(v)==actual]
        assert matches==[q['correct']],matches

review=dict(status='PARTIAL_SOURCE_REVIEWED_DRAFT_NOT_IMPORTED',targetMet=False,
            teacherApproved=False,officialOriginalPaperIndependentlyVerified=False,
            targetCounts=dict(MCQ=200,CQ=50,SQ=40),counts=dict(MCQ=len(rows),CQ=0,SQ=0),
            remaining=dict(MCQ=200-len(rows),CQ=50,SQ=40),
            scope=dict(category=batch['category'],subject=batch['subject'],topic=batch['topic']),
            source=dict(fileId=SOURCE_ID,fileName=SOURCE_FILE,sha256=SOURCE_SHA,pdfPages=170,bytes=2867507,
                        yearCoverage=[2024,2023],attribution='সংকলনের নিজস্ব বোর্ড/সাল শিরোনাম; মূল সরকারি প্রশ্নপত্রের স্বাধীন authentication নয়।'),
            sourcePriority=['board-paper','NCTB-textbook','other-online-source'],
            chapterTextbookRead=False,localSourceInventoryOnly=True,databaseCountVerified=False,
            importedCounts=dict(MCQ=0,CQ=0,SQ=0),items=reviews,
            excluded=[dict(pdfPage=12,printedPage=153,questionNumber='1',reason='রাজশাহী ২০২৪ CQ-র ক/খ সেট-সংক্রান্ত; শুধু গ-তে sqrt(7) অমূলদ প্রমাণ। এটিকে বাস্তব সংখ্যা অধ্যায়ের পূর্ণ CQ বা ২ নম্বরের SQ হিসেবে গণনা করা হয়নি।'),
                      dict(fileId='12YNXtbbFAJDrT0rxdJmFWr62HDAs0Kai',reason='metadata-তে Board-Ques থাকলেও read_file_text-এ English First Paper; গণিতের উৎস নয়।')],
            limitations=['প্রাথমিক বোর্ড-উৎসভিত্তিক ৯ MCQ; ২০০/৫০/৪০ লক্ষ্য পূর্ণ নয়।',
                         'শুধু নির্বাচিত পৃষ্ঠা/প্রশ্ন ছবিতে পড়া হয়েছে; পুরো সংকলনের প্রতিটি প্রশ্নের semantic chapter audit সম্পন্ন দাবি নয়।',
                         'একই বিষয়ের সাদৃশ্যপূর্ণ stem-এর তিনটি প্রশ্নে শব্দগত সামান্য সম্পাদনা করা হয়েছে; item-wise adaptation সংরক্ষিত।',
                         'NCTB মূল বইয়ের সম্পূর্ণ অধ্যায় ও চলতি সংস্করণ এখনও হাতে পাওয়া/পড়া হয়নি; এগুলোকে NCTB exercise-এর অবিকল প্রশ্ন বলা হয়নি।',
                         'স্বাধীন শিক্ষক অনুমোদন ও live stock-এর alias-aware duplicate check বাকি; বাস্তব database/Pending import হয়নি।'])

def emit(name,obj):
    text=json.dumps(obj,ensure_ascii=False,indent=2)+'\n'
    path=OUT/name
    if '--check' in sys.argv:assert path.read_text()==text,f'Stale: {name}'
    else:path.parent.mkdir(parents=True,exist_ok=True);path.write_text(text)
emit('board-seed-v1.json',batch)
emit('validation.json',review)
print(f'PASS: {len(rows)} source-reviewed MCQ; exact rational/surd/parity checks; remaining 191 MCQ / 50 CQ / 40 SQ; no DB writes')
