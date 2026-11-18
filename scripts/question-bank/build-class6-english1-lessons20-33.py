"""Final initial-coverage batch; exact source sections read visually, not teacher approval."""
import runpy
from pathlib import Path
h=runpy.run_path(str(Path(__file__).with_name('build-class6-english1-lessons4-7.py')))
pack,sa,vocab,writing,save=[h[k] for k in ['pack','sa','vocab','writing','save']]
P=[]
def add(n,title,pages,questions,words,notes,kind='seen-short-answer'):
 P.append(pack(n,title,pages,[sa(questions,'poem' if kind=='textbook-poem-answers' else 'short-answers',kind),vocab([(w,'contextual meaning',a,p) for w,a,p in words])],notes))
add(20,'Hason Raja: The Mystic Bard of Bangladesh',[61,62],[
 ('What does the lesson mean by a bard?','A bard is someone who writes poems and songs.',61),
 ('What kind of family was Hason Raja born into, according to Section B?','He was born into a wealthy landlord family in Sylhet in 1854.',61),
 ('How does the passage describe the change in his outlook?','He came to feel that material possessions were meaningless and began thinking deeply about the creator, life, death and humankind.',61),
 ('What does the passage say about Hason Udash?','It says Hason Udash was published in 1906 and contained 206 songs.',62),
 ('What name did he use for himself in his songs?','The passage says he called himself “Pagla Hason Raja”, translated there as “Crazy Hason Raja”.',62)],
 [('luxury',['great material comfort or expensive living'],61),('possessions',['things owned by someone'],61),('volume',['a book forming a collection or part of a work'],62),('reflected',['expressed or showed'],62),('beyond',['farther than; outside a stated limit'],62)],
 ['Biographical dates, song totals and title spellings are passage-based reading answers, not independently verified historical research.','Mystic beliefs are described respectfully as beliefs in the source, not imposed on pupils.'])
add(21,'Wonders of the World-1',[63,64],[
 ('What is the Taj Mahal, and where is it located?','It is a white marble tomb in Agra, India.',63),
 ('Why did Shah Jahan build the Taj Mahal in the passage?','He built it as a token of love for his wife Mumtaz Mahal after her death.',63),
 ('Which artistic traditions does the passage say it combines?','It says the Taj Mahal combines the art of Persia, Turkey and India.',63),
 ('How long does the passage say its construction took?','The passage states that it took 21 years.',63),
 ('After whom is the Eiffel Tower named?','It is named after the engineer Gustave Eiffel.',64)],
 [('tomb',['a place where a dead person is buried'],63),('token',['a sign or expression of something'],63),('artisans',['skilled craft workers'],63),('admired',['regarded with respect or appreciation'],63),('recognisable',['easy to identify'],64)],
 ['Pyramid audio gap answers are not reconstructed without audio.','The stated Taj Mahal area and Eiffel Tower height/rank are questionable or time-sensitive; excluded from assessed factual questions. Remaining historical statements are attributed to the passage.'])
add(22,'Wonders of the World-2',[65,66,67],[
 ('What three inventions or developments does the lesson discuss?','It discusses computers, space travel and mobile phones.',65),
 ('Name two uses of computers from the passage.','Computers can be used for study and communication. The text also mentions information, entertainment and games.',65),
 ('How can computers help people communicate over long distances?','They can help people send emails and communicate face to face online.',65),
 ('Name three mobile-phone functions listed in the text.','Making calls, taking photographs and storing information are listed functions. Distance learning is another example.',66),
 ('Does the passage’s imagined future holiday in another galaxy describe an established present service?','No. It is speculation about a possible future, not an available travel service.',66)],
 [('invention',['something newly created or devised'],65),('communication',['sharing or exchanging information'],65),('spacecraft',['a vehicle designed to travel in space'],66),('handy',['useful','convenient'],66),('updated',['brought up to date'],67)],
 ['Do not imply humans have landed on Mars; robotic exploration and human travel are different. The passage’s space-travel claims need scientific qualification.','Technology can assist communication but does not guarantee freedom from loneliness or universal low-cost access.'])
add(23,'We Live in a Global Village',[68,69,70],[
 ('Who wrote the letter to Sohan?','His uncle Reza wrote the letter.',69),
 ('Where is Congo located according to the letter?','Congo is in Central Africa.',68),
 ('What education-related work does Ashar Santoso do in Congo?','He takes care of children’s education in a community school as a member of a voluntary organisation.',69),
 ('How did Ashar’s schooling involve different countries?','He was born in Indonesia, moved to Singapore at eight and later completed schooling in Denmark before university studies in the United States.',69),
 ('Why is Ashar called a global citizen?','He has lived, studied and worked in different countries and values understanding people’s languages, cultures and aspirations. His outlook connects him with humanity beyond one country.',69)],
 [('maintain',['keep up','preserve'],69),('voluntary',['done by choice rather than compulsion'],69),('aspirations',['hopes or ambitions'],69),('global',['worldwide','international'],69),('conflict',['serious disagreement or fighting'],68)],
 ['The introduction says US Peacekeeping Mission while the pictures and context suggest UN; mission abbreviation is excluded from scored questions and not silently corrected.','Section C audio gaps are not reconstructed. This is a source letter, not verified current operational reporting.'])
add(24,'Our Wage Earners',[71,72,73,74],[
 ('Name two destination countries listed in the work-abroad passage.','The UAE and Oman are examples. Saudi Arabia, Qatar and Bahrain are also listed.',71),
 ('What skill does the passage particularly encourage workers to develop?','It encourages language skills, including English, Arabic or other languages used where they will work.',71),
 ('How can better employment help workers and their families in the passage?','Better work and fairer pay can help workers support their families and contribute to the economy.',71),
 ('Where does Dr Arman work in Section C?','He works in a hospital in Cairo, Egypt.',72),
 ('Name two places Dr Arman suggests visiting.','He suggests the Cairo Museum and the Pyramids. Port Suez is also mentioned.',72)],
 [('abroad',['in or to another country'],71),('deserve',['be entitled to something because it is right or fair'],71),('benefits',['advantages or employment-related support'],71),('contribute',['give or play a part in something'],71),('traditional',['connected with established customs'],73)],
 ['Destination demand, wages, visa requirements and climate are not verified current guidance. No promised jobs/pay.','Language barriers are one issue discussed, not a justification for exploitation or a claim that workers are to blame for unfair treatment.'])
add(25,'The Concert for Bangladesh',[75,76,77],[
 ('Who is Fahmida watching on television in the opening scene?','She is watching George Harrison playing guitar and singing.',75),
 ('How did Harrison help Bangladesh in the dialogue?','He helped by organising the Concert for Bangladesh and raising awareness and support, not by coming to fight in the war.',75),
 ('When and where was the concert held according to Mr Farhad?','It was held on 1 August 1971 at Madison Square Garden in New York.',76),
 ('What purposes of the concert does the dialogue describe?','It raised awareness of suffering during the Liberation War and raised support and money for relief through UNICEF.',76),
 ('What appeal does the song extract make?','It asks listeners to understand people’s suffering and come forward to help save lives.',77)],
 [('humanist',['a person concerned with human welfare and dignity'],75),('audience',['people watching or listening to a performance'],76),('relief',['help for people suffering in a crisis'],76),('posthumously',['after a person’s death'],76),('distress',['great suffering or anxiety'],77)],
 ['Questions use the source dialogue and song interpretation; no song lyrics are reproduced in the answer paper.','Attendance, fundraising totals and award history need historical checking before broader factual publication.'])
add(26,'Buying Clothes',[78,79,80,81,82],[
 ('What kind of polo shirt does Imran ask for in Section C?','He asks for one without a chain.',79),
 ('Why does Imran reject the first medium shirt?','It is too big for him.',79),
 ('What size and colour does he finally choose in Section C?','He chooses a small, sky-blue polo shirt.',79),
 ('Where can he try the shirt on?','The assistant says the trial room is at the back.',79),
 ('What price is stated for the shirt in the dialogue?','The stated price is 300 taka, and the shirt is on sale that week in the story.',79)],
 [('baggy',['loose-fitting'],80),('plain',['without a decorative pattern or writing in this context'],81),('stripes',['long narrow bands of contrasting colour'],82),('checks',['a pattern of squares'],82),('fit',['be the right size and shape for someone'],82)],
 ['Story price is not current market pricing; personal size/style choices do not justify body shaming.','Section C’s polo shirt and Section D’s other clothing choices are distinct dialogue units.'])
add(27,'Andre',[83],[
 ('Who is credited as the poet of “André”?','Gwendolyn Brooks is credited.',83),
 ('What choice does the speaker have to make in the dream?','The speaker has to choose a mother and a father.',83),
 ('Why is the speaker unsure at first?','There seem to be many different possible parents to choose from.',83),
 ('What different appearances are mentioned?','The poem mentions short and tall, thin and stout people.',83),
 ('When does the speaker realise which parents to choose?','The realisation comes just before the speaker wakes.',83),
 ('Whom does the speaker finally choose?','The speaker chooses the same parents they have always had.',83),
 ('How does the final discovery affect the speaker?','It surprises the speaker and makes them glad.',83),
 ('What is one supported theme of the poem?','The poem expresses the speaker’s affection and appreciation for their own parents through the imagined choice in a dream.',83)],
 [('pick',['choose'],83),('stout',['rather large or solid in body build'],83),('sprang awake',['woke suddenly'],83),('wondered',['felt uncertain or thought about something'],83),('glad',['pleased','happy'],83)],
 ['Dream speaker is not automatically the poet’s own biography. No invented external story about André.','Theme describes this speaker’s experience; do not prescribe feelings for pupils from unsafe homes or different family arrangements.'],kind='textbook-poem-answers')
add(28,'Are You Listening?-3',[84,85],[
 ('How does adding final e change hop in the printed pair?','It forms hope, which has a different meaning and vowel sound.',84),
 ('What is the printed partner of not in List 2?','note',84),
 ('Why does the narrator decide to go to the bookstore?','Shila is late, so the narrator decides to get stationery while waiting.',85),
 ('What message should a useful short note give a friend who may arrive while you are out?','It should explain that you have gone out and give clear relevant information such as when you expect to return. Original appropriate wording is acceptable.',85),
 ('Does completing a printed word task prove that a learner pronounces the words correctly?','No. Pronunciation, stress and intonation need listening and spoken practice or observation.',84)],
 [('stationery',['writing materials such as paper and pens'],85),('lid',['a cover for a container'],85),('tightly',['firmly or closely'],85),('bowl',['a round open container'],84),('robe',['a loose outer garment'],84)],
 ['Complete printed lesson read; no actual audio supplied and no claim of assessed oral performance.','Tea/stove references in the source are not directions for pupils to handle hot equipment unsupervised.'])
add(29,'Taking a Test',[86,87],[
 ('Who are Hena and Bina?','They are twin sisters in class six.',86),
 ('Which test are they taking in the scene?','They are taking an English test during the half-yearly examination.',86),
 ('Why should pupils read the questions carefully?','Careful reading helps them understand the instructions and answer the actual questions.',86),
 ('Write a suitable instruction against copying another pupil’s script.','Do not copy from someone else’s script.',86),
 ('What should people do with litter according to the sign task?','They should use the waste bin rather than throw litter in public places.',87)],
 [('instructions',['directions explaining what to do'],86),('script',['a pupil’s written exam answer paper in this context'],86),('cashier',['a person who receives payment'],87),('litter',['small pieces of rubbish left in an unsuitable place'],87),('carefully',['with attention and caution'],87)],
 ['The story’s one-hour restriction is not a rule for all exams. Accessibility needs and real examination arrangements must be handled by responsible staff.','The textbook’s signs are read as source examples, not a full road-safety course.'])
add(30,'What Should We Do?',[88,89],[
 ('What are the classmates planning?','They are planning how to spend a week’s vacation.',88),
 ('What does the Kuakata advertisement attract Bahar’s attention to?','It attracts attention to a two-day trip, the beach and sunrise.',88),
 ('Where does Azim suggest going, and why?','He suggests the Chimbuk Mountains in Bandarban because he has wanted to climb a mountain.',88),
 ('Why does Shujan suggest the Sunderbans?','He wants to see wild animals and take pictures of the forests and the sea.',88),
 ('Have they chosen a final destination at the end of the dialogue?','No. They agree to consider the options before deciding.',88)],
 [('vacation',['a period away from usual school or work'],88),('options',['possible choices'],88),('suggestion',['an idea offered for consideration'],89),('fantastic',['very attractive or impressive in this dialogue'],88),('decide',['choose after considering possibilities'],88)],
 ['No final destination is invented. Travel suggestions are story choices, not present safety or access advice.'])
add(31,'Too Much or Too Little Water',[90,91],[
 ('How can heavy rainfall cause flooding in the passage?','River water can overflow its banks and cover large areas of land.',90),
 ('What places can be flooded according to Section A2?','Land, towns and villages can be flooded.',90),
 ('How can a long period without rain affect water availability?','Rivers may dry up and underground water levels may fall, creating shortages.',91),
 ('Give one possible difficulty caused by too little water.','People may have difficulty finding enough safe water for drinking and daily needs. This is a supported application of the lesson’s discussion.',91),
 ('What contrast does the lesson title express?','Both excess water in floods and a shortage of water can cause suffering.',91)],
 [('overflow',['flow over an edge or limit'],90),('banks',['the sides of a river'],90),('vast',['very large'],90),('underground',['below the surface of the ground'],91),('short of',['not having enough'],91)],
 ['Flood/drought reading is not an emergency plan. No instruction to pupils to enter floodwater or undertake rescue work.','Picture-based applications should allow different accurate descriptions without inventing exact locations.'])
add(32,'An Invitation for Robin',[92,93],[
 ('Why is Robin excited in Section A?','He has received an invitation from his aunt to stay with her family in the countryside during his holiday.',92),
 ('Who is Maher?','He is Robin’s cousin and is about Robin’s age.',92),
 ('What does the invitation ask Robin to tell the family?','It asks him to let them know when he will arrive.',92),
 ('Where do the hosts say they will receive Robin?','They say they will meet him at the bus station.',92),
 ('What is the main purpose of Robin’s later letter?','Its main purpose is to thank his aunt for inviting him and for the enjoyable stay.',93)],
 [('invitation',['a request to visit or take part'],92),('receive',['meet or welcome someone in this context'],92),('let us know',['tell us','inform us'],92),('a whole new world',['an unfamiliar range of experiences'],93),('miss someone',['feel someone’s absence and wish to be with them'],93)],
 ['Source invitation is dated 10 June 2025 but the later thank-you letter 15 April 2025. Chronology is inconsistent; dates are excluded from factual sequencing tests.','Bus travel is implied by reception at the bus station, not explicitly narrated. No unsupervised child-travel advice.'])
add(33,'The Garden',list(range(94,101)),[
 ('Who wrote the story presented as “The Garden”?','The textbook credits Arnold Lobel.',94),
 ('Why does Toad want a garden?','He admires Frog’s garden and wishes he had one too.',94),
 ('What does Frog give Toad?','He gives Toad flower seeds to plant.',94),
 ('Why is Toad’s shouting humorous rather than useful gardening advice?','Toad expects the seeds to obey immediately, but seeds do not respond to shouted commands. The story gives them imagined feelings for humour.',95),
 ('What does Frog advise Toad to do?','He advises leaving the seeds alone for a few days and letting sun and rain reach them.',96),
 ('Name two things Toad does while waiting for the seeds.','He reads a story and sings songs. He also reads poems and plays music.',97),
 ('What does Toad see after he wakes?','He sees little green plants growing out of the ground.',98),
 ('What lesson can a reader reasonably take from the story?','A reader can see the value of patience: Toad cannot make seeds grow immediately by worrying or shouting.',99)],
 [('seeds',['plant structures from which new plants can grow'],100),('shout',['speak or cry very loudly'],100),('dark',['without much light'],100),('quotation marks',['marks indicating direct speech or quoted words'],100),('exclamation mark',['a punctuation mark expressing strong feeling or surprise'],100)],
 ['Story events and seeds’ imagined fear are not botanical fact. No guarantee that music or reading causes germination.','Full story and punctuation exercises visually read; no full copyrighted story reproduced.'])
# A small original writing response for each prose pool, explicitly separated from source answers.
for p in P:
 n=int(p['id'].split('lesson')[1][:2])
 if n==32:p['activities'].append(writing('letter','Write an original short invitation to a friend for a supervised daytime visit.','Dear Rafi,\nI would like to invite you to our home next Friday afternoon. We can read our new storybooks and work on our class poster together. Please ask your parents first. Our families can agree on the time and travel arrangements. Let me know whether you can come. I hope we can spend an enjoyable afternoon together.\nYour friend,\nNabil','Original model with no copied textbook dates or invented source chronology. Supplementary lesson writing, not an official additional examination slot.'))
 if n==30:p['activities'].append(writing('dialogue','Write a short conversation choosing a class project together.',[dict(speaker=s,text=t) for s,t in [('Mina','What should we make for our class project?'),('Rafi','How about a poster on keeping the school clean?'),('Mina','That sounds useful. We could include drawings and short instructions.'),('Rafi','Let’s ask our group members for their ideas before deciding.'),('Mina','Good idea. Then we can agree on the work together.')]],'Original classroom dialogue; not a continuation of the holiday discussion.'))
save(P)
print('Lessons 20–33: complete printed-source initial coverage with separate questions and answers; Draft, not exhaustive quotas or approval.')
