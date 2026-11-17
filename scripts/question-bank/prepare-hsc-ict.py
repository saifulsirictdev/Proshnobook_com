"""Adapt preserved external AI Drafts; quarantine, never pad or silently rewrite questions."""
import json,hashlib,unicodedata,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]; base=ROOT/'content/question-bank/class-11-12/ict'
topics=['১. তথ্য ও যোগাযোগ প্রযুক্তি: বিশ্ব ও বাংলাদেশ প্রেক্ষিত','২. কমিউনিকেশন সিস্টেমস ও কম্পিউটার নেটওয়ার্কিং','৩. সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস','৪. ওয়েব ডিজাইন পরিচিতি ও HTML','৫. প্রোগ্রামিং ভাষা','৬. ডেটাবেজ ম্যানেজমেন্ট সিস্টেম']
ids=['1IxpPTRTDVw3rLDdpdDjc2YgY6V6n2Iua','1Sv-nZ6rjRjd50zkaTpKU5Orr-_Qe9GNL','1G-GvxbQWmFftjqA6C--bvuA2HQ6fSzE0','1Y3lStHNXOww-qgKM1s4ja1tl7-tES9vV','1e9Jcd8KGKIEVM-hx71EA1wIjWCQmjAna','12NhCxBR9ROzPJjxOGYsSO11q1JSLcXTJ']
reviews=['10F-Qa83EUbp2Qp7rWBysCCmxIzCbLpqf','1bcqRkKKBgBpmQ_rbwzQqjjUvdrzJZHW3','1mjdmjvBQlOPmIfSerdLWKJPmuTL2iEY_','1tpMm3R6l4ujdcZleiY5ZGIO5Mrtt3Id6','1ZtahEB4EVLJH2pDoSciEp2IdmoJbNnsY','19UPArb6cPJEI-tO0BntXbqAL7e8OvO3s']
validations=['19w2zPn8qV1wWHqyBnfVqj7q3XMAwwrQ5','1JKhmkYZzyuM8Zh-7xtFdkasSq2qdGTXf','1HTjEJWQHCq13SIscQsf8aqGU3lmWkMDe','10-41GnaoMPcMI9KG_-clrAuhyM9X-dz4','1sITGnmzl9WtvvJMyA74_KgNyC3ILV2bt','1p9JqEJuxp6ZRZc9FiYIFGh2Jn50e_gnd']
expected=['35fca1def29b92d602b2dfa99e853babaf5b9975460cc799699e9b1e60cfa655','cfec0170a32bff028a2b24b590795b0bd02d231d1a573f82b9f6a06fa812b4ae','2c80866ed30149f637bfaefb9985a5ea431132ba851271586a677fd7c6afa3b8','4ea6835c4dab6a49cb880f2ad9dece6cd3684cebc979d79e8bdc0a4b2015b6b6','8e9e575625f5986544494301d03db3c4242a05d474a60934b39db71116a662ac','81ce55fd6864c419fac3449d95d20628afc3020ae84cf5b019139d852c7b721b']
notes=['পুরোনো marketplace উদাহরণ, মহাকাশের তারিখ এবং cryosurgery তাপমাত্রার দাবি বিশেষভাবে যাচাই করুন।','Bluetooth-এর পরিসর, bandwidth-এর একক এবং mesh/throughput গণনা যাচাই করুন।','মূল ফাইলের শূন্য-ডুপ্লিকেট দাবির সঙ্গে স্থানীয় ফল মেলেনি; রূপান্তর ও CQ গণনার পূর্ণ ধাপ পুনরায় যাচাই করুন।','পুরোনো HTML tag/attribute বনাম HTML5 এবং অনুপস্থিত output চিত্র যাচাই করুন।','উৎস-নোট অনুযায়ী এই অধ্যায় শুধু NCTB-ভিত্তিক; Python output/indentation ও flowchart যাচাই বাকি।','SQL dialect, ER model-এর ইতিহাস, DES-এর বর্তমান নিরাপত্তা ও অনুপস্থিত employee table যাচাই করুন।']
def norm(s):return ' '.join(re.sub('[\u200b-\u200d\ufeff]','',unicodedata.normalize('NFKC',s)).split()).lower()
def dump(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
for n in range(1,7):
 d=base/f'chapter-{n}';raw=(d/'source-questions.json').read_bytes();x=json.loads(raw); assert hashlib.sha256(raw).hexdigest()==expected[n-1]; kept=[];blocked=[];seen=set()
 for i,q in enumerate(x['items'],1):
  reason=None; stem=norm(q['text'])
  if stem in seen:reason='Repeated normalized stem; original retained in source file'
  elif q['type']=='MCQ' and len(set(map(norm,q['options'].values())))!=4:reason='Options collide under website normalization; requires manual review'
  elif n==1 and i==1:reason='A and C name the same person (Marshall McLuhan); ambiguous answer'
  if reason:blocked.append({'sourceItem':i,'type':q['type'],'reason':reason});continue
  seen.add(stem);q['difficulty']=q['difficulty'].upper();kept.append(q)
 x.update(category='Class 11-12',topic=topics[n-1],lang='Bangla',items=kept)
 counts={k:sum(q['type']==k for q in kept) for k in ['MCQ','CQ','SQ']}
 r={'status':'DRAFT_TEACHER_REVIEW_PENDING','teacherApproved':False,'sourceQuestionDriveId':ids[n-1],'sourceReviewDriveId':reviews[n-1],'sourceValidationDriveId':validations[n-1],'sourceMetadataRead':True,'adaptations':['Existing catalog scope mapped; bn → Bangla; difficulty uppercased; quarantined source indexes omitted'],'minimumCountsMet':counts['MCQ']>=100 and counts['CQ']>=30 and counts['SQ']>=30,'sourceSha256':hashlib.sha256(raw).hexdigest(),'sourceCount':185,'counts':counts,'total':len(kept),'quarantined':blocked,'limitations':[notes[n-1],'অন্য AI-এর Draft; স্বাধীন শিক্ষক ও প্রশ্নভিত্তিক উৎস-যাচাই বাকি।',f'মূল ১৮৫টির মধ্যে {len(blocked)}টি পুনরাবৃত্ত/অপশন-সমস্যার কারণে আলাদা; সংখ্যাপূরণ করা হয়নি।','পুরোনো বইয়ের তথ্য, কোড/গণনা, CQ বিশ্লেষণের গভীরতা ও অনুপস্থিত চিত্র যাচাই করুন।','উৎসের পূর্ণপাঠের দাবি অন্য AI-এর; এই সংযোজনে পুনরায় পূর্ণ বই পড়া হয়নি।']}
 dump(d/'questions.json',x);dump(d/'validation.json',r)
 print(n,counts,len(blocked))
