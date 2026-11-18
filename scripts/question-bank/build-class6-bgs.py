"""Reproduce source-read Draft chapters; never imports or approves records."""
import json,sys,importlib
from pathlib import Path
root=Path(__file__).resolve().parents[2]
titles=['১. সমাজ বিবর্তনের ইতিহাস','২. বাংলাদেশের ইতিহাস','৩. বাংলাদেশের সংস্কৃতি ও সমাজ','৪. বাংলাদেশের অর্থনীতি','৫. বাংলাদেশ ও বাংলাদেশের নাগরিক','৬. বাংলাদেশের পরিবেশ','৭. শিশুর বেড়ে ওঠা ও প্রতিবন্ধকতা: সামাজিকীকরণ','৮. বাংলাদেশ ও আঞ্চলিক সহযোগিতা']
ranges=['1–9','10–18','19–23','24–33','34–42','43–48','49–55','56–64']
outputs={}
reviews={}
for chapter in range(1,9):
 data=importlib.import_module(f'class6_bgs_ch{chapter}')
 MCQ,CQ,SQ=data.MCQ,data.CQ,data.SQ
 assert (len(MCQ),len(CQ),len(SQ))==(100,30,30)
 d=root/f'content/question-bank/class-6/bgs/chapter-{chapter}'
 d.mkdir(parents=True,exist_ok=True)
 items=[]
 for i,line in enumerate(MCQ):
  stem,answer,b,c,e,page,ex=line.split('|');opts=[b,c,e];key=i%4;opts.insert(key,answer)
  items.append(dict(type='MCQ',text=stem,options=dict(zip('ABCD',opts)),correct='ABCD'[key],explanation=ex,page=f'মুদ্রিত পৃ. {page}; PDF পৃ. {int(page)+5}',difficulty='EASY' if i<25 else 'MEDIUM'))
 for line in CQ:
  v=line.split('|');assert len(v)==10,len(v)
  items.append(dict(type='CQ',text=v[0],parts=[dict(label=label,question=v[1+i*2],solution=v[2+i*2],marks=i+1) for i,label in enumerate('কখগঘ')],explanation='উদ্দীপকের তথ্যের সঙ্গে পাঠের ধারণা মিলিয়ে উত্তর দিতে হবে। সমমানের যুক্তিসংগত বিকল্প উত্তরও গ্রহণযোগ্য।',page=f'মুদ্রিত পৃ. {v[-1]}; PDF পৃ. {int(v[-1])+5}',difficulty='MEDIUM'))
 for line in SQ:
  q,a,p=line.split('|');items.append(dict(type='SQ',text=q,explanation=a,page=f'মুদ্রিত পৃ. {p}; PDF পৃ. {int(p)+5}',difficulty='MEDIUM'))
 b=dict(category='Class 6',subject='বাংলাদেশ ও বিশ্বপরিচয়',topic=titles[chapter-1],book='বাংলাদেশ ও বিশ্বপরিচয় — ষষ্ঠ শ্রেণি',edition='২০২৬ (সরবরাহকৃত NCTB PDF)',sourceUrl='https://drive.google.com/file/d/1seX9fJBd2o0IM2bghf9v7dfyW-GNeT5X/view',lang='Bangla',items=items)
 r=dict(status='COUNT_COMPLETE_DRAFT_TEACHER_REVIEW_PENDING',teacherApproved=False,targetMet=True,counts=dict(MCQ=100,CQ=30,SQ=30),total=160,sourceFullRead=True,printedPages='1–9',pdfPages='6–14',sourceSha256='b47549bcb826db11d34176f7d47c8c6c881ef61731103648db2cf0e3b0c550a9',limitations=['সংখ্যা পূর্ণ Draft; স্বাধীন শিক্ষক-পর্যালোচনা ও প্রশ্নভিত্তিক পৃষ্ঠা-যাচাই বাকি।','সমাজের ধাপগুলো সরলীকৃত মডেল, সর্বজনীন একমুখী ক্রম বা শ্রেষ্ঠত্বের সিঁড়ি নয়।','অতীতের শ্রমবিভাগকে বর্তমানের লিঙ্গভিত্তিক বাধ্যবাধকতা বলা যাবে না।','পরিবেশের প্রভাব, ওয়াটের উন্নয়ন ও শিল্পোত্তর সমাজ সম্পর্কে অতিসরল দাবি এড়ানো হয়েছে।','চিত্রের বদলে স্বয়ংসম্পূর্ণ লিখিত উদ্দীপক; শিক্ষককে CQ গভীরতা ও ধারণাগত পুনরাবৃত্তি যাচাই করতে হবে।'])

 if chapter==2:
  r.update(printedPages='10–18',pdfPages='15–23',limitations=['সংখ্যা পূর্ণ Draft; স্বাধীন শিক্ষক-পর্যালোচনা ও প্রশ্নভিত্তিক পৃষ্ঠা-যাচাই বাকি।','ঘোষণা, ঘোষণা সম্প্রচার, রাজনৈতিক কর্তৃত্ব ও আইনি ভিত্তি এক বিষয় নয়; সংবেদনশীল ইতিহাসে দলিল ও শিক্ষক-পর্যালোচনা আবশ্যক।','সাম্প্রতিক রাজনৈতিক ইতিহাসের মূল্যায়নকে স্বাধীনভাবে যাচাইকৃত তথ্য বলা হয়নি।','CQ-র গভীরতা, উত্তররুব্রিক ও ধারণাগত পুনরাবৃত্তি শিক্ষককে যাচাই করতে হবে।'])
 if chapter==3:
  r.update(printedPages='19–23',pdfPages='24–28',limitations=['সংখ্যা পূর্ণ Draft; শিক্ষক-পর্যালোচনা ও প্রশ্নভিত্তিক পৃষ্ঠা-যাচাই বাকি।','পেশা, লিঙ্গ, অঞ্চল বা জনগোষ্ঠীর পার্থক্যকে বাধ্যতামূলক ছাঁচ বা মর্যাদার শ্রেণিক্রম বলা হয়নি।','ভাষাপরিবারের ঐতিহাসিক যোগাযোগ ভাষার বংশগত পরিচয়ের সমার্থক নয়।','সংক্ষিপ্ত অধ্যায়ের ধারণা নানা প্রয়োগে ব্যবহৃত; CQ গভীরতা, উত্তররুব্রিক ও ধারণাগত পুনরাবৃত্তি শিক্ষককে যাচাই করতে হবে।'])
 if chapter==4:
  r.update(printedPages='24–33',pdfPages='29–38',limitations=['সংখ্যা পূর্ণ Draft; স্বাধীন শিক্ষক-পর্যালোচনা ও প্রশ্নভিত্তিক পৃষ্ঠা-যাচাই বাকি।','পাঠের আনুমানিক জনসংখ্যা, জিডিপির খাতভিত্তিক হার ও ২০২০ সালের চীনের উদাহরণকে বর্তমান তথ্য করা হয়নি; বর্তমান পরিসংখ্যান স্বাধীনভাবে যাচাই করা হয়নি।','মানবসম্পদ ধারণার অর্থনৈতিক ব্যবহার মানুষের মৌলিক মর্যাদার শ্রেণিক্রম নয়।','কৃষি উপকরণে সঠিক ব্যবহার ও পরিবেশ বিবেচনা করা হয়েছে; প্রযুক্তি বা অবকাঠামোকে নিশ্চিত সাফল্যের একক কারণ বলা হয়নি।','CQ গভীরতা, গ্রহণযোগ্য উত্তর ও ধারণাগত পুনরাবৃত্তি শিক্ষককে যাচাই করতে হবে।'])
 if chapter==5:
  r.update(printedPages='34–42',pdfPages='39–47',limitations=['সংখ্যা পূর্ণ Draft; শিক্ষক-পর্যালোচনা ও প্রশ্নভিত্তিক পৃষ্ঠা-যাচাই বাকি।','নাগরিকত্বের জন্মসূত্র ও জন্মস্থান নীতি পাঠের সরল মডেল; সংশ্লিষ্ট দেশের বর্তমান আইন ও ব্যতিক্রম স্বাধীনভাবে যাচাই করা হয়নি।','বিয়ে, সম্পত্তি, ভাষা বা দীর্ঘ বসবাসকে নাগরিকত্বের নিশ্চিত একক শর্ত বলা হয়নি। ব্যক্তিগত আইনি পরামর্শ নয়।','বিদেশি ও নাগরিকের রাজনৈতিক পরিচয়ের পার্থক্য মানুষের মর্যাদার পার্থক্য নয়। আনুগত্যকে সরকারের সব কাজের অন্ধ সমর্থন বলা হয়নি।','পুরোনো জনসংখ্যার হারকে বর্তমান তথ্য বলা হয়নি; CQ গভীরতা ও ধারণাগত পুনরাবৃত্তি শিক্ষককে যাচাই করতে হবে।'])
 if chapter>=6:
  warnings={
   6:['ওজোনক্ষয় ও বিশ্বউষ্ণায়ন অভিন্ন প্রক্রিয়া নয়; পাঠের অতিসরল কারণ ব্যাখ্যা হুবহু নেওয়া হয়নি।','প্রাকৃতিক দুর্যোগের সবগুলোকে সরাসরি মানুষের সৃষ্টি বলা হয়নি; পুরোনো ঝুঁকির ক্রমকে বর্তমান তথ্য করা হয়নি।'],
   7:['শিশুশ্রমকে স্বাভাবিক বা গ্রহণযোগ্য করা হয়নি; নিরাপদ বয়সোপযোগী সাহায্য ও ক্ষতিকর শ্রম আলাদা।','পারিবারিক অশান্তি বা শ্রমজীবী পরিচয় দিয়ে শিশুর ভবিষ্যৎ বা চরিত্র অবধারিত বলা হয়নি।','ধর্মীয় শিক্ষা একটি মাধ্যম; নৈতিকতা কোনো এক বিশ্বাসে সীমিত নয়। লিঙ্গভিত্তিক চিরস্থায়ী দায়িত্ব চাপানো হয়নি।'],
   8:['আসিয়ানসহ সংস্থার সদস্যসংখ্যা সময়সাপেক্ষ; বর্তমান সরকারি তথ্য স্বাধীনভাবে যাচাই করা হয়নি।','OAU পাঠে ঐতিহাসিক নাম; বর্তমান প্রতিষ্ঠানগত পরিচয়ের বিকল্প হিসেবে ব্যবহার করা হয়নি।','সব EU সদস্য ইউরো ব্যবহার করে না; চলাচলের সুবিধাকে শর্তহীন সর্বজনীন অধিকার বলা হয়নি।']}
  r.update(printedPages=ranges[chapter-1],pdfPages={6:'48–53',7:'54–60',8:'61–69'}[chapter],limitations=['সংখ্যা পূর্ণ Draft; স্বাধীন শিক্ষক-পর্যালোচনা ও প্রশ্নভিত্তিক পৃষ্ঠা-যাচাই বাকি।']+warnings[chapter]+['CQ গভীরতা, বয়সোপযোগিতা, বিকল্প উত্তরের রুব্রিক ও ধারণাগত পুনরাবৃত্তি শিক্ষককে যাচাই করতে হবে।'])
 reviews[chapter]=r
 outputs[d/'questions.json']=b
 outputs[d/'validation.json']=r
m=dict(category=b['category'],subject=b['subject'],status='COUNT_COMPLETE_DRAFT_TEACHER_REVIEW_PENDING',teacherApproved=False,targetMet=True,sourceUrl=b['sourceUrl'],sourceSha256=r['sourceSha256'],sourceBytes=28184538,pdfPageCount=70,minimumPerChapter=dict(MCQ=100,CQ=30,SQ=30),subjectMinimum=1280,actuals=dict(MCQ=800,CQ=240,SQ=240,total=1280),deficit=0,chapters=[dict(topic=t,printedPages=ranges[i],status=reviews[i+1]['status'],sourceFullRead=True,counts=reviews[i+1]['counts']) for i,t in enumerate(titles)])
outputs[d.parent/'manifest.json']=m
for p,x in outputs.items():
 text=json.dumps(x,ensure_ascii=False,indent=2)+'\n'
 if '--check' in sys.argv:assert p.exists() and p.read_text()==text,str(p)
 else:p.write_text(text)
print('Class 6 BGS: chapters 1–8 = 1280 count-complete Draft; teacher review pending; no database import')
