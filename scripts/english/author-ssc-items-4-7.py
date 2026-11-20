#!/usr/bin/env python3
"""Deterministic source-backed review authoring. No network, DB import or approval.
Manual possible keys are NOT official answers. Run from the repository root.
"""
import json, re, hashlib
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
def digest(x): return hashlib.sha256(json.dumps(x,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
TAG_KEYS = '''
001|don't they|is it|shall we|can it|should we
002|didn't it|don't they|can we|aren't I|shall we
003|doesn't it|does he|don't they|isn't it|shall we
004|doesn't it|haven't they|did he|will you|need I
005|don't they|do we|was it|will you|shall we
006|aren't they|aren't there|isn't it|doesn't it|aren't they
007|isn't it|aren't they|do they|isn't it|do they
008|can they|don't they|shall we|isn't it|isn't it
009|isn't it|don't they|shouldn't we|don't they|don't we
019|don't they|does it|don't we|can we|is it
020|didn't he|shall we|don't they|can it|doesn't he
021|aren't they|do we|aren't they|aren't they|do they
022|doesn't it|can't one|isn't he|doesn't he|mustn't he
023|do they|don't we|can they|shouldn't they|shall we
024|were they|aren't I|will you|didn't he|can they
025|isn't it|is it|don't they|will you|shall we
027|isn't it|shouldn't one|does it|isn't there|shouldn't they
028|shall we|aren't I|doesn't it|should they|will you
029|don't you|does it|could they|dare it|will you
030|don't they|didn't they|hasn't it|aren't they|should we
031|aren't they|is it|won't it|should we|mustn't they
032|can we|is there|can one|don't you|was it
034|isn't it|don't they|can they|aren't they|shouldn't we
036|is it|do we|don't they|aren't they|mayn't he
037|aren't I|isn't it|didn't they|could they|don't they
038|is it|don't they|can we|aren't they|shall we
039|hadn't you|didn't they|don't I|didn't he|shall we
040|doesn't he|can they|are they|shouldn't they|shall we
041|is there|do they|shall we|isn't it|will you
042|isn't it|doesn't it|do they|doesn't he|oughtn't we
046|didn't we|won't I|are they|didn't I|isn't it
047|can it|don't they|aren't they|isn't it|isn't it
048|isn't she|hasn't she|didn't he|doesn't she|shall we
049|didn't he|didn't he|did he|doesn't he|don't they
050|can it|isn't it|doesn't it|don't they|don't they
051|do they|can they|doesn't he|isn't it|shall we
052|doesn't it|shan't it|can't they|do they|don't they
053|shouldn't it|didn't it|hadn't they|hasn't it|doesn't it
054|shouldn't they|didn't he|didn't it|didn't they|do I
055|didn't we|will you|isn't it|isn't it|did she
058|didn't they|has he|will you|does it|isn't it
060|didn't it|aren't I|doesn't he|does it|didn't it
061|are they|don't they|aren't they|shall we|can't we
062|did she|was the guide|does it|didn't they|hasn't there
065|am I|don't I|isn't it|didn't he|don't I
087|isn't he|isn't it|didn't he|do they|will you
088|doesn't she|does he|doesn't it|isn't he|didn't it
089|doesn't He|is there|will you|isn't it|wouldn't I
090|does it|isn't it|are they|didn't they|shall we
092|hasn't it|shall we|mayn't it|isn't it|do we
093|isn't he|mayn't they|do they|is it|don't they
'''
# Repairs are deliberately explicit; adapted practice never masquerades as a verbatim original.
TAG_REPAIRS = {
 '003': [('What an outstanding quality it is! ____?', 'It is an outstanding quality, ____?')],
 '004': [('The mother has risen in her to see the orphan','Her motherly feelings have awakened on seeing the orphan')],
 '008': [('How nice the bird is! ____?', 'The bird is very nice, ____?')],
 '021': [('Who forgets these memories,','Few people forget these memories,')],
 '029': [('Future also dare not','The future also dare not'),('plan before proceed','plan before you proceed')],
 '036': [('he may laugh','he will laugh')],
 '037': [('Everybody hates them for this reason','Everybody encourages them to improve')],
 '039': [('The father rose in him at this sight','His fatherly feelings rose at this sight'),('Thank you very much','I thank you very much')],
 '041': [('What a pity,','It is a pity,')],
 '042': [('begets hundred lies','begets a hundred lies')],
 '046': [('None is none on the world','Nobody is worthless in the world'),('Happy Birthday to you','It is your birthday today')],
 '047': [('glorious in gained','glorious is gained')],
 '048': [('her x lovely dress','her a lovely dress'),('give her. a pleasant surprise','give her a pleasant surprise')],
 '053': [('The patient had died','The patients had died'),('an unanimous','a unanimous')],
 '054': [('The father rose in him','His fatherly feelings rose')],
 '055': [('Happy birthday to you','It is your birthday today'),('Mira Seldom cut','Mira seldom cut')],
 '060': [('nothing, ____?','nothing, ____?"')],
 '061': [('Nobody is safe from Covid-19,..............?', 'Nobody is completely free from health risks, ____?'),('everybody knows it,..............?','everybody knows it, ____?'),('The careless are always affected easily..............?', 'The careless are often less attentive, ____?'),("Let's motivate them to be careful..................?", "Let's motivate them to be careful, ____?"),('By maintaining some rules, we can keep Covid-19 away, ............?', 'By following health guidance, we can reduce some risks, ____?')],
 '062': [('The guide was not a woman','The guide was not helpful'),('The girl in her pleased us all','Her girlish manners pleased us all')],
 '088': [('How sweetly the bird sings,','The bird sings very sweetly,')],
 '089': [('It is combination','It is a combination'),('qualities, ____?"','qualities, ____?')],
 '090': [('The brother rose in him seeing the boy','His brotherly feelings rose on seeing the boy')],
 '092': [('Anything may happen','Anything can happen'),('What a miserable situation! ____?', 'It is a miserable situation, ____?')],
 '093': [('The present days may be good','The present days can be good')],
}
# Eliminate contentious/rare modal tags in adapted practice, disclosing the edit.
TAG_REPAIRS['036'] += []
TAG_REPAIRS['062'] += [('The guide was not helpful','The male guide was not helpful')]
TAG_KEYS = TAG_KEYS.replace('036|is it|do we|don\'t they|aren\'t they|mayn\'t he','036|is it|do we|don\'t they|aren\'t they|won\'t he').replace('062|did she|was the guide','062|did she|was he').replace("092|hasn't it|shall we|mayn't it", "092|hasn't it|shall we|can't it").replace("093|isn't he|mayn't they", "093|isn't he|can't they")

def parse_keys(text):
 return {line.split('|')[0]:line.split('|')[1:] for line in text.strip().splitlines()}
def source_data(kind):
 return json.loads((ROOT/f'docs/english/work-in-progress/ssc-paper2-{kind}-candidates.json').read_text())
def source_base(e):
 return {k:e[k] for k in ['sourceKind','board','school','examType','examYear','sourceFile','sourceSha256','pdfPage','questionNumber','originalMarks'] if k in e}
def repair(text,pairs,ledger):
 for before,after in pairs:
  if before not in text: raise ValueError(('Repair fragment missing',before,text))
  text=text.replace(before,after);ledger.append({'before':before,'after':after})
 return text

def write_batch(kind,items,sources):
 assert len(items)==51,(kind,len(items))
 assert len(set(e['contentSha256'] for e in items))==51
 out={'version':1,'item':kind,'marks':10 if kind=='transformation' else 5,'reviewStatus':'PREPARED_NOT_IMPORTED','answerStatus':'Assistant-prepared possible keys, NOT official board/school answers. Teacher review of every answer and disclosed adaptation is required; valid alternatives may be accepted.','sources':sources,'items':items}
 (ROOT/f'lib/english/data/ssc-paper2-{kind}-review.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
 doc=[f'# SSC Paper 2 — {kind}: 51 prepared review sets','', '**PREPARED / NOT IMPORTED / NOT APPROVED. Possible answers are assistant-prepared, not official keys.**','', 'Source-backed adapted practice for Classes 9–10; the same 51 exercises are reused, not counted twice. All before/after changes and original transcripts below require teacher review. Source-era historical, religious, health, political and moral statements are not certified current facts or endorsements. No production import/approval is performed by this file.','', '## Sources','']
 for s in sources:
  url=s.get('url',f"https://drive.google.com/file/d/{s['fileId']}/view")
  doc += [f"- [{s['filename']}]({url}) — SHA-256 `{s['sha256']}`"]
 for i,e in enumerate(items,1):
  name=e.get('board',e.get('school',e.get('sourceTitle','Web practice')));doc+=['','---','',f'## Set {i:02} — {name} · {e.get("examYear","year not stated")}', '',f"Physical PDF page {e.get('pdfPage','not applicable')} · original Q{e.get('questionNumber',e.get('webExercise','not stated'))} · original {e.get('originalMarks','not stated')} marks · current practice {out['marks']} marks.",'',e['instruction'],'']
  if 'passage'in e:doc += [e['passage'],'']
  doc += ['| Label | Question / root | Possible answer |','| --- | --- | --- |']
  for j,(text,a) in enumerate(zip(e.get('questions',e.get('roots',[])),e['answers'])):doc += [f'| ({chr(97+j)}) | {text.replace("|","/")} | {a} |']
  doc += ['','### Original source transcript','',e['sourceInstruction'],'', e.get('sourcePassage','\n\n'.join(s['text'] for s in e.get('sourceSubitems',[]))),'','### Disclosed changes / caveats','']
  for c in e['editorialChanges']:doc += [f"- `{c['before']}` → `{c['after']}`"]
  doc += ['- '+n for n in e['editorialNotes']]
  doc += ['',f"Practice hash: `{e['contentSha256']}` · source transcript hash: `{e['sourceContentSha256']}`"]
 (ROOT/f'docs/english/ssc-paper2-{kind}-review.md').write_text('\n'.join(doc)+'\n')

def build_tags():
 src=source_data('tags');keys=parse_keys(TAG_KEYS);items=[]
 for e in src['candidates']:
  id=e['candidateId'][-3:]
  if id not in keys:continue
  changes=[];texts=[s['text'] for s in e['sourceSubitems']]
  for before,after in TAG_REPAIRS.get(id,[]):
   idx=next((i for i,t in enumerate(texts) if before in t),None)
   if idx is None:raise ValueError((id,before))
   texts[idx]=repair(texts[idx],[(before,after)],changes)
  answers=keys[id];assert len(texts)==len(answers)==5
  questions=[re.sub(r'\s*____\s*\?', ' ____?',t) for t in texts]
  # Whitespace normalization also appears in the explicit ledger.
  for old,new in zip(texts,questions):
   if old!=new:changes.append({'before':old,'after':new})
  item={**source_base(e),'id':f'ssc-p2-tags-{len(items)+1:03}','instruction':'Complete the following statements with suitable question tags.','questions':questions,'answers':answers,'sourceInstruction':e['sourceInstruction'],'sourceSubitems':e['sourceSubitems'],'sourceContentSha256':e['sourceContentSha256'],'editorialChanges':changes,'editorialNotes':['Tag polarity follows the clause being tagged. Imperatives use a possible “will you”; other natural variants need teacher review. Singular they is used for indefinite people; one is retained for generic one. Collective jury is singular for a unanimous unit and plural for differing members. Quoted speakers use their own clause. Source statements are grammar practice, not endorsements.']}
  if changes:item['editorialNotes'].append('Adapted practice: ellipses, exclamations, unclear figurative subjects, spelling or unsafe generalisations were clarified explicitly above. Not an unaltered official question.')
  item['contentSha256']=digest({'questions':questions,'answers':answers});items.append(item)
 write_batch('tags',items,src['sources'])



AFFIX_KEYS = """
001|unlimited|writers|enrich|perfection|prosperity|without|Truly|alternative|various|development
002|universal|existence|greatly|especially|unparalleled|relationship|heavenly|spiritual|hardly|indifferent
003|touchable|untouchable|valueless|designers|demanding|including|management|development|restlessly|comfortable
004|drinkable|unsafe|uncontaminated|suitable|riverine|inadequate|filthy|poisonous|longevity|active
006|disgrace|ill-treated|employers|unhealthy|unfavourable|sorrowful|risky|dangerous|enforced|encouraged
007|happiness|easily|unhappy|happiness|satisfaction|limited|Actually|psychologically|fully|mentality
008|naturally|collection|different|beekeepers|wooden|commercially|fully|non-governmental|approximately|production
009|relaxation|charmless|beautiful|Monotonous|smoothness|enriches|overwork|harmful|idleness|recharging
010|enlightens|mastery|stronger|lightning|civilization|according|brighten|conqueror|inventions|knowledge|undoubtedly|creatures|superiority|throughout
011|riverine|agricultural|majority|Unfortunately|unsatisfactory|hardly|disadvantages|properly|financial|technological|government|conventional|gradually|effective
012|resourceful|Teachers|information|informative|reference|delivery|dependence|proficiency|immeasurable|popularity|devotion|honourable|friendship|affectionate
013|networking|popularity|generation|valuable|browsing|supervision|find|embarrassing|invasion|personal|significant|socialization|mutual|co-operation
014|enrich|accurately|unknown|contextual|specific|clearly|various|continuous|proficiency|continuity|sincerity|interaction|different|international
015|studious|mindful|dutiful|respectful|truthful|helpful|thinking|creative|punctuality|Sincerity|riser|inattentive|politely|honesty
016|coldest|rainless|coldness|equally|especially|northern|biting|gloomy|covered|greatly|hilly|severity|Elsewhere|southern
022|Deforestation|indiscriminately|densely|agricultural|dishonest|illegally|removal|protection|unsuitable|plantation
025|seasonal|various|well-known|favourite|hardly|unripe|profitable|suitable|become|economic
028|independent|overpopulation|unemployment|deficiency|government|overcome|digital|development|already|achievement
030|Perseverance|successful|unsuccessful|misfortune|Persevering|Sincerity|enables|fruitfully|formative|misuse
031|writers|visitors|publishers|buyers|crowded|various|displayed|chosen|unavailable|welcome
033|famous|wisdom|extraordinary|imagination|natural|artificial|association|successful|reputation|multidimensional
047|education|truly|thoughtful|dutiful|self-reliance
048|riverine|dependent|different|extremely|betterment
049|unnecessarily|elaboration|displease|examiners|irrelevant
050|Vaccination|across|human|vaccinated|recommended
051|immortal|accountable|unwise|impious|improbable
053|examinees|understand|lengthen|accuracy|precision
054|development|inaccessibility|population|properly|enlightened
055|dutiful|adversity|deception|laziness|accordance
056|freedom|warrior|independence|dearer|willingly
057|misbehaviour|criticism|developed|accordingly|developing
059|outward|inward|inborn|celebrated|inner
060|suicidal|incurable|including|digestive|financial
062|selflessly|widen|homeless|untold|unbearable
063|unlimited|fixed|difficulty|unfed|existence
064|illiterate|ignorant|cultivation|impossible|poverty
066|Ours|paralysed|industries|products|hampered
067|debaters|logically|defeat|creativity|inspiration
068|teenagers|appearance|ingredients|weakened|informed
069|absence|exchange|prerequisite|absolutely|contentment
071|getting|freshness|earlier|physical|physician
072|adulteration|incurable|wickedness|really|Hopefully
073|materialize|achievable|uncommon|unfortunate|befool
074|useful|impossible|natural|strengthen|indiscriminately
076|Environmental|mainly|unnecessarily|industrial|indiscriminate
077|western|networks|affirmatively|smartphones|reliable
080|judging|evaluate|attention|failure|unworthy
081|dwellers|Actually|rootless|inhuman|malnutrition
083|luxurious|amusement|self-centered|untold|uncomfortable
085|propagandist|unbiased|neutrality|befool|misrepresentation
086|harmful|injustice|uncomfortable|responsible|prosperity
"""
AFFIX_REPAIRS = {
 '002':[('we (c) great owe','we are (c) great indebted')],
 '003':[('A well designed software can','A well designed software program can'),('hardwares','hardware'),('softwares','software'),('engineers arc','engineers are')],
 '008':[('then store them','it is then stored'),('This is (g) full chemical and hazard free activity.','This activity can be (g) full rewarding when appropriate safety practices are followed.')],
 '011':[('(c) major of','The (c) major of'),("They can't plough their land (h) proper due to (i) finance and (j) technology support.","They cannot plough their land (h) proper due to a lack of (i) finance and (j) technology support.")],
 '012':[('students had (g) depend on','students had (g) depend on')],
 '013':[('facebook as an','Facebook an'),('(g) fine','(g) find'),('(m) nature','(m) mutual')],
 '025':[('Mango is (d) favour to most of the people.','Mango is a (d) favour with most people.')],
 '028':[('the present (e) govern','the then (e) govern'),('has aimed','aimed'),('has (i) ready fixed','had (i) ready fixed')],
 '033':[('to differentiate them','in differentiating them')],
 '047':[('(c) ____(thought) ____sympathetic','(c) ____(thought) ____, sympathetic')],
 '048':[('the important of rivers','the importance of rivers'),('in sufficient water','insufficient water')],
 '049':[('answer in simply','answer is simply'),('This type of answers','These answers'),('advised no to','advised not to')],
 '050':[('These vaccines can greatly develop immune system of (c) (man) body.','These vaccines can help protect the (c) (man) body.'),('(e) (commanded)','(e) (recommend)'),('neglect in getting','neglect getting')],
 '055':[('If you are not (a) ____(duty), you will never do it.','If you are (a) ____(duty), you will never do it.'),('Practice that brings about','It is a practice that brings about'),('To become successful in life. You','To become successful in life, you'),('other topic','other topics')],
 '057':[('When common people are internally hurt by their (a) ____(behaviour). Usually','When common people are internally hurt by their (a) ____(behaviour), usually')],
 '060':[('Smoking is a (a) ____(suicide) act.','Smoking is sometimes described as a (a) ____(suicide) act.'),('Those who smoke suffer from various (b) ____(cure) diseases.','Those who smoke risk various (b) ____(cure) diseases.')],
 '062':[('leaders and markers','leaders and makers')],
 '063':[('They led their life','They lead their lives'),('(c) difficutly','(c) difficult')],
 '064':[('the farmers or our country are','some farmers of our country are')],
 '066':[('a crucial time','a difficult time')],
 '067':[('If also develops','It also develops')],
 '068':[('immunity.','immunity.' )],
 '069':[('a psychological things','a psychological thing')],
 '071':[('An early riser does not suffer from (d) ____(physic) problems very often. So, he need not go to any (e) ____(physic).','An early riser should still care for his (d) ____(physic) health and consult a qualified (e) ____(physic) when needed.')],
 '072':[('causes (b) ____(curable) ____diseases','can cause (b) ____(curable) ____diseases')],
 '076':[('There are (b) ____(main) ____four kinds of pollution-air pollution, water pollution, sound pollution and odour pollution.','This passage discusses (b) ____(main) ____four forms of pollution: air, water, sound and odour pollution.'),('Every year millions of people all over the world die (c) ____(necessarily) ____as a result of pollution.','Pollution can cause people to die (c) ____(necessarily) ____.'),('rivers an canals','rivers and canals'),('fumes cause','fumes can cause')],
 '077':[('(b) ____(work)','(b) ____(network)'),('(d) ____(phones)','(d) ____(smartphone)'),('an addition to fun','additional fun')],
 '080':[('(a) just','(a) judge'),('caliver','calibre'),('(b) evaluation','(b) evaluate'),('(d) fails','(d) fail')],
 '083':[('are always indifferent','may be indifferent')],
 '086':[('When he does anything immoral','If he does anything immoral'),('He never does (b) ____(just) ____to others.','He never does (b) ____(just) ____to others.'),('(d) ____(response)','(d) ____(responsible)'),('to his duty','for his duties')],
}

def build_affixes():
 src=source_data('affixes');keys=parse_keys(AFFIX_KEYS);items=[]
 for e in src['candidates']:
  id=e['candidateId'][-3:]
  if id not in keys:continue
  changes=[];text=e['sourcePassage']
  text=repair(text,[(a,b) for a,b in AFFIX_REPAIRS.get(id,[]) if a!=b],changes)
  labels=list(re.finditer(r'\(([a-n])\)',text));answers=keys[id];assert len(labels)==len(answers),(id,len(labels),len(answers))
  roots=[];parts=[];mapping=[]
  for i,m in enumerate(labels):
   seg=text[m.end():labels[i+1].start() if i+1<len(labels) else len(text)]
   r=re.match(r'\s*_*(?:\s*)\(?([A-Za-z][A-Za-z-]*)\)?\s*_*(?:\s*)',seg)
   assert r,(id,seg);root=r[1];roots.append(root)
   tail=seg[r.end():]
   if i<5:
    parts.append(f'({chr(97+i)}) ____ ({root}) '+tail);mapping.append({'originalLabel':chr(97+i),'practiceLabel':chr(97+i),'root':root})
   else:parts.append(answers[i]+' '+tail)
  passage=text[:labels[0].start()]+''.join(parts)
  # Whole-format conversion is fully disclosed, including every filled original gap.
  changes.append({'before':text,'after':passage})
  item={**source_base(e),'id':f'ssc-p2-affixes-{len(items)+1:03}','instruction':'Complete the text with suitable forms of the root words in brackets. Add a prefix, suffix or both where appropriate.','passage':passage,'roots':roots[:5],'answers':answers[:5],'originalAnswerKey':answers,'originalToPracticeMap':mapping,'sourceInstruction':e['sourceInstruction'],'sourcePassage':e['sourcePassage'],'sourceContentSha256':e['sourceContentSha256'],'editorialChanges':changes,'editorialNotes':['Source-backed adapted practice, not an unaltered official question. Where the original has ten/fourteen gaps, the first five are retained as practice gaps; all remaining roots are explicitly filled using originalAnswerKey. One original passage counts as one set only.','Teacher must check every derivation and filled word. Some correct contextual words can retain the base form. Historical/social/health source claims are not certified facts or advice.']}
  if id=='028':item['editorialNotes'].append('The 2021 Digital Bangladesh target is a dated source-era target, not a current government promise.')
  if id=='077':item['editorialNotes'].append('The unnamed survey and 81 percent figure are reproduced from the source and have not been independently verified.')
  item['contentSha256']=digest({'passage':passage,'roots':roots[:5],'answers':answers[:5]});items.append(item)
 write_batch('affixes',items,src['sources'])



PREPOSITION_KEYS = """
019|in|of|in|of|at
020|in|from|in|on|of
021|with|with|for|from|up
022|at|into|up|in|into
023|from|on|in|between|of
024|of|in|at|from|for
025|among|in|for|in|of
026|in|by|to|for|with
027|of|for|in|out|from
028|beyond|in|from|from|about
029|after|at|into|of|about
031|for|to|for|to|in
032|from|of|in|for|in
033|on|in|from|for|between
037|of|in|of|from|after
039|from|on|from|to|for
040|to|of|of|on|in
043|in|in|in|For|for
045|to|from|in|to|for
046|to|from|of|for|after
047|by|to|for|for|to
048|of|for|with|of|in
049|on|from|off|to|with
051|into|for|in|for|up
053|off|till|among|by|for
054|on|to|at|In|with
055|in|to|for|with|of
056|in|below|of|of|with
057|in|to|of|on|to
"""
PREPOSITION_REPAIRS = {
 '019':[('is offence','is an offence'),('(c) ____country','(c) ____the country')],
 '020':[('Trade and commerce has','Trade and commerce have')],
 '021':[('(b) trucks','(b) ____trucks'),('(e) in the floors','(e) ____on the floors')],
 '022':[('As he entered','As he walked')],
 '023':[('that greatly hamper','that greatly hampers')],
 '024':[('world.`','world.')],
 '025':[('Abu Sayed, a prominent figure (a) ____24 activists (b) ____Bangladesh. He stands','A community volunteer is a prominent figure (a) ____young activists (b) ____Bangladesh. The volunteer stands')],
 '027':[('basic need','basic needs')],
 '028':[('honesty in (a)','honesty is (a)')],
 '031':[('have a account','have to account')],
 '032':[('road accident','a road accident')],
 '037':[('the lot of a nation','the minds of learners')],
 '040':[('a mans life',"a man's life"),('entirely depends','entirely depend'),('chanecter','character')],
 '043':[('country we use','country. We use')],
 '046':[('self name and fame','name and fame')],
 '047':[('found a comfort there that I did not have (c) ____him','found a comfort there that I could not provide (c) ____him')],
 '049':[('a lovely life','a lonely life'),('all his relation','all his relations')],
 '051':[('day dream','daydreams'),('theirs called ambition','their so-called ambition')],
 '053':[('run (c) ____the loosers','rank (c) ____the losers')],
 '054':[('lost look','last look'),('merry and contended','merry and contented'),('everyone feeling','everyone, feeling'),("day's work, retires", "day's work, retires")],
 '055':[('habituate (b)','habituate ourselves (b)'),('which in essential','which is essential')],
 '057':[('a thirsty crow flying','a thirsty crow was flying')],
}
# Retrieved from the actual fetched article, not inferred school/board attribution.
WEB_SOURCE = {'fileId':'web:skylark-preposition-exercises','filename':'Preposition Exercise for SSC — Skylark Education','url':'https://skylarkeducation.com/preposition-exercise-for-ssc/','retrievedAt':'2026-11-20','snapshotKind':'Selected exercise transcripts only; hash is not a hash of the entire changing webpage.'}
WEB_PREPOSITIONS = [
(1,'in|up|up|in|down',"One night a pious man, named Abu Ben Adhem, was sleeping (a) — his room. Suddenly he woke (b) — and saw in the moon-lit room an angel writing something in a book of gold. He did not fear but asked the angel boldly, “What writest thou?” The angel looked (c) — and replied (d) — a sweet tone. “The names of those who love the Lord,” “And is mine one?” asked Abu. “Nay, not so”, replied the angel. “Then”, Abu said, “Please write (e) — my name as one who loves His fellowmen.”"),
(3,'of|for|to|for|for',"Once upon a time there was a king who was very fond (a) — knowing his future from astrologers. A good astrologer happened to stop at his capital on his way to Benares. The king called (b) — him to know his future and the astrologer said something unpleasant. At this the king got furious and condemned him (c) — death, saying, “Men like you should not live to spoil the peace of the world.” But another thought crossed his mind before the astrologer was removed (d) — execution. “How long would you live?” asked the king. The astrologer mused (e) — a while for some way of escape."),
(4,'to|on|up|to|of',"Music, through all the ages, has brought joy (a) — the world. The lyre was first made by Hermes when he was a child. He was playing (b) — the sea-shore one day when he found the empty top shell of a tortoise. He picked (c) — and fastened some fine threads across the top, to make strings of various lengths. He began to pull the strings with his little fingers and found (d) — his great surprise and delight, that they made the sounds of sweet music. He felt very proud (e) — himself when he first went about among his friends and played merry airs to them upon his nice toy."),
(5,'on|of|of|in|into',"There was once an engine-driver who was a very cheerful man. He always looked (a) — the bright sides (b) — things and was fond (c) — telling people who were in trouble that there was sure to be some good (d) — it whether they could see it or not. One day his train ran (e) — another and he was terribly injured."),
(6,'upon|from|to|into|of',"It is necessary to distinguish between the value of knowledge that is thrust (a) — us from outside, and the wisdom that grows (b) — within. The thing that we learn from books and newspapers, the mass of information that is carried (c) — us by our friends and opponents and by all people who come (d) — intellectual intercourse with us, our daily life-all form a part to of our experience. They also are (e) — great value to us because they are highly useful in widening our intellectual outlook."),
(7,'on|on|along|to|past',"One day, while he was standing (a) — a station platform, he noticed a child playing (b) — the lines. Just then a goods train came hurtling (c) — . There was not a second to lose. Dashing across the rails. Edison pulled the child (d) — safety just as the train rushed (e) — ."),
(8,'on|to|of|upon|to',"What are the demands that our freedom makes (a) — us? Our first duty is (b) — ourselves. I don’t say this in any spirit of selfishness. If a free people do not maintain their own freedom, they disgrace the fair name of free men and women all over the world. But the maintenance (c) — freedom requires constant vigilance. Liberty does not descend (d) — a people; a people must raise themselves (e) — it."),
(9,'out|at|with|in|for',"After his father’s death, little Hans was more alone than ever. His mother went (a) — washing, and he sat (b) — home playing (c) — his toy theatre and reading plays. He soon knew whole scenes from Shakespeare and other writers by heart, and as he had a very fine voice both for reciting and for singing he gradually became known in the town. Several wealthy people began to take an interest (d) — this extraordinary boy and sometimes sent (e) — him to amuse them."),
(10,'for|to|upon|at|up',"There was a woman who was beautiful, who started with all advantages, yet she had no luck. She married (a) — love, and the love turned (b) — dust. She had bonny children, yet she felt they had been thrust (c) — her, and she could not love them. They looked (d) — her coldly, as if they were finding fault with her. And hurriedly she felt she must cover (e) — some fault in herself."),
(11,'in|with|to|for|with',"Our college is housed (a) — eight pucea buildings on an extensive campus. The Principal is a profound scholar, eminent educationist and good administrator. He is popular (b) — the teachers and affectionate (c) — the students. There are seventy-six teachers on the staff. All are qualified and fit (d) — their respective tasks. They are sympathetic and helpful to the students who can often discuss difficult lessons (e) — them even outside the classroom."),
(12,'in|to|away|up|to',"The secret of success in life lies (a) — the proper use of time. Many of us are apt (b) — forget that every moment is precious. Life is short but the art is long. Time is uncertain. We do not know when we shall be called (c) — from this world by death. During this limited and uncertain period we have to build (d) — our body and mind, and apply them (e) — useful activities."),
(13,'in|to|from|out|for',"The full moon and the crescent have always played an important part (a) — literature. But science has different things to tell about the moon. It reveals (b) — us that moon has no light of her own. That soft silvery brightness, which forms her principal charm to us, is borrowed solely (c) — the light of the sun. When, on a clear night, we look (d) — on the magic of moon light, it is often difficult (e) — us to realise that the moon is shining in borrowed feathers."),
(16,'at|of|by|of|to',"Education should aim (a) — making each individual fully aware (b) — these duties and responsibilities. It is true that one has to learn how to earn his bread. But man does not live (c) — bread alone. As he has bodily needs, he has also his psychological needs, which have to be satisfied too. There is the third factor, which is the nourishment of the soul. It is only the possession (d) — the soul that decisively makes human beings a separate species, superior (e) — all the rest."),
(17,'in|on|with|with|in',"One should take great care (a) — the choice of one’s companions. Our happiness or misery depends (b) — this choice. If a good man mixes (c) — those who are bad and wicked he is sure to lose his character. Whereas if a bad man comes in contact (d) — the good and the virtuous, he will soon be one of them. We should be careful (e) — choosing companions."),
(19,'to|of|away|to|in',"The boy who is unmindful (a) — his lessons will realize his sorrow, when he becomes a man. He will certainly understand that he has lost the opportunity of making himself learned. The young man who is afraid (b) — work and idles (c) — his time, is sure to find himself in later years a burden (d) — himself and to others. Idleness results (e) — misery."),
(20,'of|on|with|through|to',"Human life consists (a) — a succession of small events. Each event is comparatively unimportant but happiness and success of every man depends (b) — how these events are dealt (c) — Character is built (d) — little things. The success of a man depends upon his attention (e) — little things."),
(21,'with|with|up|in|up',"Education does not commence (a) — alphabet. It begins (b) — the mother’s encouraging look, the father’s praising word and approval, the sister’s sympathy, the brother’s kindly help, with the flowers that one picks (c) — in the gardens or fields, with the birds that one watches (d) — meadows and groves. The child must be taught to feel, to observe and receive impressions. In this way minds are opened (e) — and ready to receive, absorb and remember."),
(22,'to|with|to|from|down',"Trees are useful (a) — man in three very important ways. They provide him (b) — wood and other products, they give him shade and they help to prevent drought and floods. Moreover trees provide oxygen (c) — us and they take in carbon dioxide we leave. Unfortunately, in many parts of the world, man has not realized that the third of these services is the most important. In his eagerness to draw quick profit (d) — the trees, he has cut them (e) — in large numbers, only to find that with them he has lost the best friends he had."),
(24,'to|of|with|for|from',"In our behaviour with others we must show proper respect (a) — them. We should have a sense (b) — propriety in our conduct (c) — others. We should show respect to our superiors and civility to our inferiors and equals. A sense of propriety is necessary (d) — a cultured and disciplined society. There is no fixed standard of manners. Manners vary (e) — one country to another."),
(25,'on|to|by|to|to',"The old man’s advice had no influence (a) — his sons because they were indifferent (b) — their father’s advice but they were influenced (c) — their father’s hard work. Their father tried to convince them that industry is the key (d) — success. But the sons had no inclination (e) — hard work."),
(26,'with|to|to|at|with',"Sohel was intimate (a) — me. I intimated the matter (b) — my parents. Once he came to our home, I introduced him (c) — my parents. My parents were glad (d) — his behaviour. He did not find fault (e) — me."),
(29,'to|with|on|to|to',"My friend gave me a proposal of arranging an excursion to Cox’s Bazar. I agreed (a) — his proposal. He said that we should contribute a big amount for this purpose. But I could not agree (b) — him (c) — this point because we all belonged (d) — middle class family. But my friend adhered (e) — his decision."),
]
WEB_REPAIRS = {
 4:[('He picked (c) — and','He picked it (c) — and')],
 6:[('The thing that we learn','The things that we learn'),('a part to of our experience','a part of our experience')],
 7:[('Dashing across the rails. Edison','Dashing across the rails, Edison')],
 11:[('pucea','pucca')],
 13:[('that moon has','that the moon has')],
 16:[('aware (b) — these','aware (b) — their')],
 19:[('unmindful (a) — his lessons','inattentive (a) — his lessons')],
 20:[('every man depends','every man depend'),('(c) — Character','(c) —. Character')],
 21:[('(a) — alphabet','(a) — the alphabet')],
 24:[('We should show respect to our superiors and civility to our inferiors and equals.','We should show respect and civility to everyone.')],
 29:[('(d) — middle class family','(d) — a middle-class family')],
}

def build_prepositions():
 src=source_data('prepositions');keys=parse_keys(PREPOSITION_KEYS);items=[]
 instruction='Complete the text with suitable prepositions or the appropriate particles in the given expressions.'
 for e in src['candidates']:
  id=e['candidateId'][-3:]
  if id not in keys:continue
  changes=[];text=repair(e['sourcePassage'],[(a,b)for a,b in PREPOSITION_REPAIRS.get(id,[])if a!=b],changes)
  # Keep the gap typography stable; record the complete formatting conversion.
  passage=re.sub(r'____\s*','____ ',text)
  if passage!=text:changes.append({'before':text,'after':passage})
  item={**source_base(e),'id':f'ssc-p2-prepositions-{len(items)+1:03}','instruction':instruction,'passage':passage,'roots':['preposition / particle']*5,'answers':keys[id],'sourceInstruction':e['sourceInstruction'],'sourcePassage':e['sourcePassage'],'sourceContentSha256':e['sourceContentSha256'],'editorialChanges':changes,'editorialNotes':['Standalone five-gap source; contextually valid variants may be accepted. Source-era social, historical, political and religious statements are not independently verified current facts. Repairs above are explicit practice adaptations.']}
  item['contentSha256']=digest({'passage':passage,'answers':item['answers']});items.append(item)
 snapshot=[{'exercise':n,'text':text}for n,a,text in WEB_PREPOSITIONS];web={**WEB_SOURCE,'sha256':digest(snapshot)}
 for number,key,text in WEB_PREPOSITIONS:
  changes=[];adapted=repair(text,WEB_REPAIRS.get(number,[]),changes);passage=adapted.replace('—','____')
  changes.append({'before':adapted,'after':passage})
  item={'sourceKind':'web','sourceTitle':web['filename'],'sourceUrl':web['url'],'sourceFile':web['fileId'],'sourceSha256':web['sha256'],'webExercise':number,'retrievedAt':web['retrievedAt'],'id':f'ssc-p2-prepositions-{len(items)+1:03}','instruction':instruction,'passage':passage,'roots':['preposition / particle']*5,'answers':key.split('|'),'sourceInstruction':'Fill in the gaps with appropriate preposition.','sourcePassage':text,'sourceContentSha256':digest({'instruction':'Fill in the gaps with appropriate preposition.','passage':text}),'editorialChanges':changes,'editorialNotes':['Web practice exercise, NOT a board or school examination attribution. Original marks/year are not stated and have not been invented. Internet source supplement used after excluding repetitive or unsuitable PDF passages.','Traditional stories, myth, literary anecdotes and philosophical/social claims are source language-practice content, not independently verified facts. Possible alternatives require teacher review. Some expressions test phrasal particles or infinitival to, as in the source exercise.']}
  item['contentSha256']=digest({'passage':passage,'answers':item['answers']});items.append(item)
 write_batch('prepositions',items,src['sources']+[web])


TRANSFORMATION_KEYS = """
001|A moonlit night is very charming.|What a beautiful sight it presents!|It does not fail to dazzle our eyes and soothe our heart.|Do not people of all ages enjoy a moonlit night?|Little boys and girls make merriment so that they can enjoy themselves.|A moonlit night is liked by everybody.|The moon gives us light, but it does not have light of its own.|A moonlit night is more charming than most other beauties of nature.|Without enjoying the beauty of a moonlit night, one cannot explain it properly.|In fact, a moonlit night is not at all unpleasant.
002|Very few elements in nature are as useful as water.|What an important asset it is!|Can we pass a single day without water?|Its main source is rain, and rain creates streams, lakes and rivers.|We have rain when it is the monsoon.|Flood is often caused by heavy rainfall.|Floods damage crops.|Our winter is neither wet nor rainy.|Rainless winter does not bring a good harvest.|By making the best use of rain, we can grow more crops.
003|Is not water a liquid substance?|We use it for various purposes in our daily life.|We drink water so that we can satisfy our thirst.|Water is obtained by us from many sources.|Surface water is unsafe for drinking.|Let us drink safe water.|How dangerous polluted water is for our life!|By throwing waste and dirt into water, we make it polluted.|Very few things for our lives are as valuable as pure water.|Nobody can live without water.
004|Strategy is more important than any other thing in the examination.|Students should not elaborate any answer in the exam unnecessarily.|On getting the question paper, a student should read it attentively.|Initially the questions may not seem easy.|A student should try to answer all the questions so that he can do well in the exam.|By answering all the questions correctly, a student will get good marks.|A student should write only relevant answers.|The examiners become very irritated to see such irrelevant answers.|Time should not be wasted by the examinee by doing so.|By following the process, no student will fail to achieve a good result in an examination.
005|Is not the Internet a computer-based networking system?|It is a system that transmits information speedily.|Its functions are both smooth and rapid.|With an internet connection, a man gets a link soon.|Many educational institutions are greatly benefited when they use the Internet.|All the renowned libraries of the world can be visited by a student without going there.|What an effective role it plays in the field of trade and commerce!|E-commerce has become more popular than most other topics among customers.|It helps the customers, and they can buy anything easily without going to market.|It is a very amazing milestone in the modern world of communication.
006|Everybody wants to succeed in life.|Being industrious, nobody is unable to prosper in life.|It is a difficult thing.|Those who are idle always lag behind.|We must work hard to earn money.|We can work hard and thereby improve our lot.|A hard-working person can see the light of prosperity.|Men should not work more than women.|It should be remembered by us that industry is the key to success.|What a miserable life an idle man leads!
007|Very few rivers of Bangladesh are as mighty as the Padma.|What a turbulent river it is!|In winter, the river remains calm and tranquil.|It is the rainy season, and the river assumes a terrible shape.|Who does not know this?|People use the river for different purposes.|Our farmers use its water for irrigation, and therefore they can grow plenty of crops.|There is no one who dislikes the Hilsa fish of the river.|Although the river destroys the houses of men, it is still very useful to us.|Let us save this useful river.
008|A journey by train is never unenjoyable.|Are not people fond of a journey by train?|It is pleasant.|During a journey by train, a man can enjoy natural scenery.|It is cheap, and so people like it.|As there are class distinctions in a train, people can buy tickets of various classes.|A train is more comfortable than most other vehicles.|A train journey can be enjoyed by a man.|The British government introduced it.|How safe a train journey is!
009|Very few evils are as bad as corruption.|A corrupt person can do anything that goes against morality.|A corrupt person is hated by people.|Who respects him?|We have strict laws, but we are still affected by this evil.|A corrupt person is the most hated person.|We hope for Bangladesh to be free from this evil.|There is nobody who does not avoid a corrupt person.|What an unhappy life a corrupt person leads!|We should all work together to make Bangladesh a corruption-free country.
010|Is not the moon the only natural satellite of the Earth?|How charming it is to look at!|Its beauty charms everybody.|Everybody likes the moon.|No other thing is as beautiful as the moon.|Nothing but the moon shines in this scene at night.|Many poems about its beauty have been composed by poets.|The full moon presents a very exciting scene.|The earth is bigger than the moon.|Let us go out at night to enjoy a moonlit night.
012|I am not unsure that man is the maker of his own fortune.|Let a man make proper use of his time to shine in life.|To whom is it not known?|How miserably the lazy suffer in the long run!|To commit suicide is not more harmful than to kill time.|Our life is nothing but a sum total of hours, days and years.|No other season of life is as valuable as youth.|We can shape our minds easily in youth.|Let us utilize our time properly in youth.|People call it the seedtime of life.
013|We are not ungrateful to the freedom fighters.|Their contribution is the greatest of all things.|Never disrespect or forget our martyrs.|People have built the national memorial with a view to paying tribute to their memories.|A freedom fighter is greater than any other son of the soil.|Our independence was gained by us through their sacrifice.|How bravely they fought to snatch the red sun of independence!|Their weapons were not as powerful as their courage.|We will never forget their contribution.|Some steps have been taken by the government to improve their condition.
014|Very few social crimes are as great as copying in the exams.|What a serious crime it is!|A student copying in the exam deceives none but himself.|No benefit can be brought by copying in the exam.|It is a very shameful practice.|Our education can be strengthened by resisting this malady.|Let us all come forward to stop it and save our students.|The authorities should reform our examination system.|Copying in the exam is more hateful than anything else.|The government is not insincere in removing this crime.
015|I know the student.|An interesting book was given to me by her.|Magura is not as old as Jashore.|Truthfulness is better than any other quality of a person.|Dhaka is the most populous city in Bangladesh.|My friend is never unpunctual.|What a great fool he is!|The student is very bright.|Let us obey our teachers.|Let your health be taken care of.
016|Very few fruits of Bangladesh are as large as jackfruit.|How juicy the fruit is!|It is found very sweet by people.|It is not low in calories.|Who does not know it as our national fruit?|In summer, this fruit is not scarce.|People mainly find it in the month of Jaishtha.|The mango is costlier than it.|Let us eat the fruit to help ensure nutrition.|Jackfruits look very beautiful in the trees.
017|Honesty cannot fail to open a door of peace before a person.|The invitation was accepted by him.|Reading books is the noblest habit.|What an essential virtue loving one's country is!|Our life is not measured by us by months or years.|Industry is more important than any other thing for success.|She was very attentive to her study.|Very few problems of the modern world are as corrosive as terrorism.|Let us do good deeds as our responsibility.|There is nobody who is not fond of glittering things.
018|What a great virtue simplicity is!|There is nobody who does not appreciate this quality.|Very few qualities are as good as it.|This virtue should be practised by one.|A simple man is happier than most other men.|By practising simplicity, one is not unable to earn people's favour.|What a carefree life a simple man leads!|A simple man is the happiest person among us.|Let everybody like simplicity.|So, all should lead a simple life.
028|Once upon a time there was a little girl, and her name was Tarin.|In spite of being a nice little girl, she was not an ordinary child.|Did she not pass her time in reading and writing?|Her parents did not dislike her at all.|She was praised by everyone.|How attentive she was to her study!|She also helped her mother when she had free time.|Did she ever tell a lie?|Very few girls in the school were as intelligent as she.|She worked hard so that she could shine in life.
029|What a devastating phenomenon of the modern world terrorism is!|At present, people call it a challenge to fight against terrorism.|Everybody is now under the threat of violence.|Nothing else is as disastrous as terrorism.|It is more corrosive than most other problems of the modern world.|Who wants his children to be terrorists in future?|In spite of there being a law to punish the terrorists, it is not properly applied.|If we apply the law properly, we can get rid of it.|We have to create social awareness, and thus we can fight against terrorism.|We all should not accept the killers of mankind.
030|It is people who are generally fond of glittering things.|Are they not lovers of outward appearances?|It is they who are concerned at the outer show of things and beings.|They are indifferent to intrinsic value.|Very few metals are as precious as gold.|There are some other metals, and they look like gold.|Fading soon, they lose their beauty.|Similarly, there are some people who act like the wise.|No sooner does their real identity get revealed than people leave them.|How foolish we are to believe in them!
031|It is health that is wealth.|A sick moneyed man is not as happy as a healthy poor man.|A healthy man is an asset to his family, but an unhealthy man is a liability.|Can he not succeed in life?|So, everybody must be conscious of his health.|Everybody cannot but take care of his health all the time.|We can improve health by regular physical exercise and a balanced diet.|Very poor people may be unable to afford a balanced diet.|How concerned they are with the quantity of food!|It should be known by everybody that malnutrition causes weakness.
032|Looking around, we notice the achievement of science everywhere.|Electricity lights not only the streets but also the houses.|It is news, songs and lectures that the radio broadcasts.|There is cinema so that we can delight in the evening.|Very few inventions of modern science are as important as the computer.|Nobody can go without it.|The Internet is neither more nor less important than the computer.|It helps us, and we can know about the world.|It is the greatest of all inventions of modern science.|What a great miraculous event the invention of the computer is!
033|No other man in this subcontinent was as gracious as Haji Mohammad Mohsin.|It was in Hoogli that he was born.|Did he not inherit a vast property from his father and sister?|This wealth was not misused by him.|People call him a friend of humanity.|He remained unmarried.|During his lifetime, he spent money lavishly, and thus he helped the poor.|He was not unkind to the poor at all.|One day, on a thief's entering his room, he caught him.|Although he caught the thief, he did not punish him.
035|We should read books, and thus we can acquire knowledge.|We are introduced to the domain of knowledge by books.|Books written by writers who are great contain noble thoughts and great ideas.|No other friends are as great as books.|Reading books is nobler than any other habit.|Books give us both knowledge and pleasure.|Some people do not read books, and they keep themselves aloof from the realm of knowledge.|Is there any alternative to reading books to make a civilized society?|We should motivate people to read more and more books.|We cannot but create a social movement about reading books.
036|What an exciting game cricket is!|This game is enjoyed by people of all ages.|People play it all over the world.|At present, it is more popular than any other game in our country.|In spite of cricket being a costly game, people of all classes enjoy playing it.|The game is played between two teams, each of which consists of eleven players.|Two umpires conduct the game.|Is it not full of thrill and excitement for the spectators?|Bangladesh is a Test-playing country, and it is developing its standard day by day.|We cannot but try our best to improve its present position.
037|Man is better than any other creation of God.|It is our responsibility to do good deeds.|We do not measure our life by months or years.|People who are honest lead a happy life.|Does it matter much whether a man lives many years or not?|Everybody is unhappy to some extent on the earth.|So, time should not be wasted by us in vain.|By using time properly, we can be benefited.|No man can avoid death.|We take utmost care, but we cannot avoid death.
038|Is not patriotism a noble virtue?|It is greater than any other virtue in a man's life.|It does not persuade a man to do anything unjust.|This quality highly motivates a man to sacrifice his life for the country.|It is a very outstanding quality.|A man who has patriotic zeal is called a patriot.|A patriot fears only the Creator.|He pays taxes, and thus he obeys the law.|All respect him.|Let us be patriots.
040|Very few inventions of modern science are as great as the computer.|The computer is not a curse on earth.|In spite of being a blessing, it has dark sides.|People are nowadays using computers in almost every sphere of life.|We must depend on it.|Who can deny its necessity?|It is used more than any other device in our life.|We are helped a lot by it.|It is useful, and so it has become very popular.|If there were no computers, we could not imagine our modern life.
046|We should learn English, and thus we can get good jobs.|Everybody loves birds.|We cannot but be kind to them.|Do they not help to keep ecological balance?|Birds come to our country from Siberia when it is winter.|The birds eat up the insects harmful to our crops.|Without learning English, we cannot prosper.|We cannot but learn English.|How essential birds are!|People with good knowledge of English get good jobs.
048|What a serious issue arsenic pollution is!|Can we deny its disastrous effects?|Does it not cause severe harm to human health and the environment?|Arsenic pollution contaminates groundwater, and we know it.|People who drink arsenic-contaminated water may develop serious diseases.|It is one of the problems that are deadliest in our country.|This problem is difficult to solve.|Arsenic pollution occurs, and many lives are lost as a result.|Arsenic pollution is very hazardous, and therefore it endangers public health.|We must address it to save lives.
050|Student life is the time when students should prepare themselves for the future.|A student should read more and more books, and thus gain knowledge.|But mere bookish knowledge is insufficient.|A student should think of contemporary society and politics important for a civilized nation.|A man with a corrupt brain, mind and ideology is dishonest and corrupt.|Can a man of honest thought be a bad man?|He is not blessed with the love of the Creator.|A student must widen his mind and soul so that he can perceive humanistic feelings.|He should realize this and prepare himself.|This is why no other time in life is as good as student life.
052|In spite of being a free land, Bangladesh is beset with many problems.|The use of poly bags is not at all reassuring.|What a great threat to our environment it has become recently!|Do not the used poly bags block the drainage system?|It rains heavily, and as a result the low-lying areas of the towns and cities go under dirty water.|The used poly bags must destroy the fertility of our soil.|It is our government that has already banned the production of poly bags.|But some businessmen producing the bags for their own interest are neither generous nor honest.|We can ban the use of poly bags and thereby enjoy a more sustainable future.|We wish that we could switch to biodegradable alternatives for a better world.
053|On Wednesday, we were going to our village.|We walked for ten minutes and arrived at the station.|But we had not been at the station for long when the train left.|So did we not wait long to get the next train?|At last, it came when the sun was setting.|Buying the tickets, we got on the train.|How fast the train started running!|We were happy when we saw the sunset from the train.|It became dark, and then I slept.|We reached our destination in the morning.
055|Nelson Mandela was not an ordinary leader in world history.|Did he not guide South Africa from the shackles of apartheid?|He struggled against apartheid, and he did so all his life.|It was not a government policy without racial segregation.|Black people were treated unkindly.|It was black people who were subjected to all sorts of indignities.|Black people were citizens of South Africa, but they were subjected to inhuman treatment.|The great leader vowed to put an end to the inhuman practice.|The rulers threw him behind the prison bars so that they could dominate black people.|The rulers who were oppressive could not break his spirit.
056|Is not sound pollution a common phenomenon of our city?|Are we free from it?|How devastatingly it is increasing day by day!|Sound pollution harms us, and we know it.|People who are exposed to loud sound may suffer from health hazards.|There are not many phenomena of city life as dangerous as it.|It is intolerable.|Can hearing loss not be caused by excessive sound pollution?|Sound pollution in Dhaka City is very high, and life is becoming difficult here as a result.|We should control it to lead a healthy life.
059|No other insect is as busy as the bee.|It does not live alone.|Collecting nectar from the flowers, bees make it into honey.|How vigorously they dance on finding nectar plentiful!|They work hard when it is spring.|The bee is an insect, and it is very industrious.|They inspire us very greatly to work hard.|They try every possible way to collect nectar.|We can be industrious like the bee and thereby be successful in our life.|We should observe the lifestyle of bees so that we can make the best use of time.
060|Tree plantation is not an ignoble task.|If we plant trees, we can add beauty to nature.|We must plant more trees because of their protection against natural disasters.|Many people are unaware of the consequences of deforestation.|They cut down trees, but they never plant a single tree.|The causes of deforestation are many.|What a vital role trees play in our life!|Trees are a very wonderful gift of nature.|Is there any alternative to trees in our life?|No other time is as good as the rainy season for tree plantation.
061|Was not a crow very thirsty?|It flew here and there to find water.|The crow found a pitcher in which there was a little water.|Was not the water at the bottom of the pitcher?|As the crow dropped pebbles into the pitcher, the water rose up.|Although it was not easy, the crow worked patiently.|The crow drank the water and quenched its thirst.|How clever the crow was!|The thirsty crow succeeded in drinking the water.|The crow's intelligence was extraordinary.
062|Is not Bangladesh a low-lying country?|We are visited by natural disasters every year.|Earthquake is more unpredictable than most other natural disasters.|It is Dhaka city that may be the worst victim of this natural calamity.|House builders must maintain the earthquake-resistant building code.|We experienced the recurrence of earthquakes in the last few years.|Everybody knows the consequence of a tsunami.|How disastrous an earthquake is!|Bangladesh does not lie outside the active earthquake zone.|Dhaka is the riskiest city in the face of earthquakes in this comparison.
063|Deforestation does not benefit the environment.|Everybody knows the impact of deforestation.|The effects of deforestation are very terrible.|We cannot but stop cutting trees.|Deforestation destroys both forests and wildlife.|By continuing deforestation, we will cause the climate to change rapidly.|If we do not plant trees, deforestation cannot be controlled.|Deforestation is so dangerous that we cannot ignore it.|Who supports deforestation for personal gain?|How alarming the consequences of deforestation are!
064|Was there not an old man in a village?|Although he was very poor, he was honest.|He was never unpunctual.|He worked hard so that he could maintain his family.|He earned money in this way and thus maintained his family.|What an intelligent man he was!|Let people respect him suitably.|May students learn many things from him!|He led a very industrious life.|Sitting under the tree, he fell asleep.
065|There is a river called the Buriganga, and it is famous.|Everybody has heard the name of this river.|How seriously polluted it is now!|Who cares for it?|Very few rivers are as important for us as it.|Did not ancient merchants like this river for its easy network?|The people who live in Dhaka depend on this river in many ways.|Illegally permitted people have occupied the two sides.|We can save this river and thereby save ourselves from calamities.|Nobody can escape the responsibility to this river.
066|Success in life is a very difficult thing.|If we want success, we cannot but be dedicated.|Do we not face odds and difficult situations at different stages of our life?|Getting frightened sometimes, we lag behind.|We feel this fear, and it stands in our way to success.|We have to overcome this fear so that we can go forward.|Some people have attained success in life, and they are very much dedicated.|What a vital element dedication is in our life!|Success does not come before dedication.|We should try to be dedicated in each and every walk of our life.
067|I answered when she beckoned me.|It was the interval, and I went over.|Her name had not remained unmentioned to me.|She was older than I expected.|We are all getting older.|She asked me so that I would join her for luncheon.|Twenty years ago, I was living in Paris.|Was I not earning a little to keep body and soul together?|It was a book of mine that she read.|How young I was!
088|Once there was a giant who was very selfish.|He had a garden, and it was very beautiful.|Because of its beautiful flowers and many trees, the children liked it.|The children did not like other places as much as the garden.|One day, they were seen playing in the garden by the giant.|So, it was not for any purpose other than playing that they went there.|The harsh shouting of the giant drove out every child.|His voice was not less harsh than a pig's.|Immediately after the children left the garden, it became ugly.|The giant seemed a great fool then.
089|Very few curses of the twenty-first century are as big as child labour.|Is it not a violation of human rights?|It is unfortunate that this has become accepted in our society.|Nothing but poverty is responsible for this in the source account.|In a family of five or six children, the parents have to send some of their kids to work to fill their empty stomachs.|These poor children have to work hard all day long, but in return they are rewarded with all kinds of abuse.|It is a very inhuman act.|A book never does harm to us.|We should stop child labour.|Steps have been taken by the government to prevent child labour.
090|Is not corruption a curse?|Is it known to you what corruption is?|Corruption means that people pursue and exercise self-interest unlawfully.|Many people know it, but they involve themselves in corruption.|A corrupt nation cannot avoid lagging behind.|Corruption happens in a country, and then common people suffer a lot.|The development process of a country is hampered by corruption.|People must stand against corruption so that they can reach the peak of success.|With corruption rooted out, peace will prevail in our society.|So, all of us should realize the consequence of corruption so that we can make a peaceful society.
092|Always speak the truth.|No other sin is as great as telling lies.|A liar can never get any permanent success.|It is known to us that a lie breeds a hundred lies.|Some people know the bad result of lies, but they keep on telling lies.|They tell lies so that they can obtain some material gains.|They are very unfortunate.|We should make them realise the fact.|Even God never likes a liar.|We want everybody to speak the truth.
093|Facebook is not an uncommon social network.|People are now using it all over the world.|Who does not use it?|Every student has a smartphone in the source's generalisation.|Everybody likes social networks in the source's generalisation.|No other social network is as good as Facebook in this comparison.|In spite of its giving pleasure, we cannot get freedom to use it.|Unless you use it, you cannot keep pace with the modern world.|We can use it and thus get much new information.|I wish that I could open a Facebook account.
095|Is not campus violence a common phenomenon nowadays?|There is no university student who is not a victim of it in the source's generalisation.|Campus violence is very horrible.|Our innocent students are used as tools by political leaders.|There are many innocent students who fall victim to it.|People need political will to solve this problem.|No other form of violence is as bad as campus violence in this comparison.|Campus violence is surely an evil.|Campus violence is the most harmful phenomenon for the students in this comparison.|Student politics should be stopped, and people believe it.
068|Though English is a foreign language, everybody should give it due importance.|If we do not learn English, we cannot hope to get any good job.|A man knowing English well can go abroad.|What a valuable person he becomes!|You should not leave any effort unmade to learn English.|This is the truth, and everybody knows it.|It is our students who are going to practise English more and more.|Who but the foolish can disregard the true importance of English?|So, you should not waste any more time.|Study well, and you will be able to learn it.
"""
TRANSFORMATION_REPAIRS = {'001': [('a moonlit a night', 'a moonlit night')],
 '002': [('good harvest', 'a good harvest'), ('Does rainless', 'Does a rainless')],
 '003': [('We should drink tube-well water.', 'We should drink safe water.'), ('wastage and dirts', 'waste and dirt')],
 '004': [('to do good in', 'to do well in')],
 '005': [('to the customers', 'among customers')],
 '008': [('There are class distinction', 'There are class distinctions')],
 '010': [('sub-planet', 'natural satellite'),
         ('exiting scene', 'exciting scene'),
         ('Only the moon shines at night.', 'Only the moon shines in this scene at night.')],
 '013': [('We got our independence for their sacrifice.', 'We gained our independence through their sacrifice.')],
 '014': [('should be moderated', 'should be reformed')],
 '016': [('It contains high calories.', 'It contains many calories.'),
         ('The fruits is', 'The fruit is'),
         ('It tastes very sweet.', 'People find it very sweet.'),
         ('to ensure nutrition', 'to help ensure nutrition')],
 '017': [('Loving country', "Loving one's country"), ('Make it active', 'Make it passive')],
 '029': [('than anything.', 'than anything else.'),
         ('be terrorist', 'be terrorists'),
         ('fight against corruption', 'fight against terrorism')],
 '030': [('(Complex))', '(Complex)'),
         ('They are the lovers of surface.', 'They are lovers of outward appearances.'),
         ('things and beings. (Active)', 'things and beings. (Complex)'),
         ('one of the precious metals', 'one of the most precious metals'),
         ('People in general are fond of glittering things.', 'People are generally fond of glittering things.')],
 '031': [('The people who are poor cannot afford to take a balanced diet.',
          'The people who are very poor may be unable to afford a balanced diet.')],
 '048': [('develop fatal diseases', 'may develop serious diseases'),
         ('It is not curable.', 'This problem is not easy to solve.')],
 '050': [('A student should think of the contemporary society, politics, etc. That matters much for a civilized nation.',
          'A student should think of contemporary society and politics, which matter much for a civilized nation.'),
         ('life is the time for preparing themselves for the future',
          'life is the time for students to prepare themselves for the future'),
         ('more and more book', 'more and more books')],
 '052': [('production on poly bags', 'production of poly bags'),
         ('If we switch to biodegradable alternatives for a better world!',
          'If only we could switch to biodegradable alternatives for a better world!')],
 '053': [('scarcely had we reached there', 'we had just reached there'),
         ('when the train left. (negative)', 'when the train left. (negative)'),
         ('train stared', 'train started')],
 '055': [('government policy or', 'government policy of'),
         ('The black', 'Black people'),
         ('the black', 'black people'),
         ('all sort of', 'all sorts of'),
         ('the citizen', 'citizens'),
         ('treated like dogs', 'subjected to inhuman treatment'),
         ('The great leaders vowed', 'The great leader vowed'),
         ('the in human practice', 'the inhuman practice')],
 '056': [('People exposed to loud sound suffer from health hazard.',
          'People exposed to loud sound may suffer from health hazards.'),
         ('Deafness is caused by sound pollution.', 'Hearing loss can be caused by excessive sound pollution.'),
         ('is becoming impossible', 'is becoming difficult')],
 '059': [('to find the nectar plentiful', 'on finding nectar plentiful')],
 '060': [('rainy seasons is', 'rainy season is')],
 '061': [],
 '062': [('earthquake resistance', 'earthquake-resistant'),
         ('No other city is as risky as Dhaka', 'No other city in this comparison is as risky as Dhaka')],
 '065': [('Who have not', 'Who has not'),
         ('None cares it', 'None cares for it'),
         ('have swallowed the two sides', 'have occupied the two sides'),
         ('save us', 'save ourselves')],
 '066': [('stands or our way', 'stands in our way'), ('win this fun', 'overcome this fear'), ('each and very', 'each and every')],
 '067': [('I want over', 'I went over')],
 '068': [('Though English is not a native language, none should neglect it.',
          'Though English is a foreign language, none should neglect it.'),
         ('disobey the true importance', 'disregard the true importance')],
 '088': [('so harsh as a pig.', "as harsh as a pig's.")],
 '089': [('Only poverty is responsible for this.', 'Only poverty is responsible for this in the source account.')],
 '090': [('they involve in corruption', 'they involve themselves in corruption'),
         ('the realization and invalid execution of self-interest', 'the pursuit and unlawful exercise of self-interest')],
 '092': [('breeds hundred lies', 'breeds a hundred lies')],
 '093': [('without smart phone', 'without a smartphone'),
         ('Everybody uses it.', "Everybody uses it in the source's generalisation."),
         ('There is no student without a smartphone.',
          "There is no student without a smartphone in the source's generalisation."),
         ('Who does not like social network?', "Who does not like social networks in the source's generalisation?"),
         ('Facebook is the best of all social networks.', 'Facebook is the best of all social networks in this comparison.')],
 '095': [('Every student of the universities is a victim of it.',
          "Every university student is a victim of it in the source's generalisation."),
         ('worst of any violence', 'worst of all forms of violence in this comparison'),
         ('for the students. (Superlative)', 'for the students in this comparison. (Superlative)')]}

def build_transformation():
 src=source_data('transformation');keys=parse_keys(TRANSFORMATION_KEYS);items=[]
 for e in src['candidates']:
  id=e['candidateId'][-3:]
  if id not in keys:continue
  changes=[];texts=[s['text']for s in e['sourceSubitems']]
  for before,after in TRANSFORMATION_REPAIRS.get(id,[]):
   if before==after:continue
   idx=next((i for i,t in enumerate(texts)if before in t),None)
   if idx is None:raise ValueError((id,before,texts))
   # A repair that appears in several questions is applied and disclosed per occurrence.
   for i,t in enumerate(texts):
    if before in t:texts[i]=repair(t,[(before,after)],changes)
  answers=keys[id];assert len(answers)==len(texts)==10,(id,len(answers))
  item={**source_base(e),'id':f'ssc-p2-transformation-{len(items)+1:03}','instruction':'Change the following sentences according to the directions in brackets without changing their meaning.','questions':texts,'answers':answers,'sourceInstruction':e['sourceInstruction'],'sourceSubitems':e['sourceSubitems'],'sourceContentSha256':e['sourceContentSha256'],'editorialChanges':changes,'editorialNotes':['Assistant-prepared possible transformations, not official answers. Conventional rhetorical-question, degree and antonym transformations follow school grammar; contextually equivalent alternatives require teacher review. Generic agents in voice changes are supplied only where the original leaves the agent implicit.','Source-era stories, broad social/moral judgements and rankings are language-practice claims, not certified facts. Where a source direction is impossible or erroneous, the prompt/direction repair is disclosed above. Do not infer endorsement of child marriage, stigma, violence or discriminatory historical treatment.']}
  item['contentSha256']=digest({'questions':texts,'answers':answers});items.append(item)
 write_batch('transformation',items,src['sources'])

if __name__=='__main__':
 build_tags();build_affixes();build_prepositions();build_transformation()
