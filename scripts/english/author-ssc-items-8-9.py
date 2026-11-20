#!/usr/bin/env python3
"""Deterministic Items 8/9 review authoring from preserved PDF source audits.
Manually prepared POSSIBLE keys, not official answers. No network/DB/approval.
"""
import hashlib,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
def digest(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
CONNECTOR_KEYS='''
001|that|Although|who|because|that
002|which|Although|especially|both|and
003|because|which|but|when|Therefore
004|that|that|but|Moreover|Therefore
005|Although|and|As|but|So
006|However|Firstly|Secondly|Moreover|Consequently
009|because|But|Unless|Moreover|Therefore
010|Otherwise|Besides|For example|So|Moreover
011|However|Therefore|When|However|But
012|as|not only|but also|Therefore|If
014|but|and|If|Otherwise|that
015|When|when|Then|nor|However
016|If|Eventually|When|therefore|that
017|which|that|but|than|Therefore
018|Therefore|that|as|If|and
019|which|because|First|who|Then
020|because of|what|which|Thus|However
023|although|If|However|Moreover|Therefore
024|who|because|Moreover|Therefore|Besides
025|In fact|Because of|or|Moreover|Consequently
026|as|But|as well as|However|or
027|While|that|so that|because|Consequently
028|To some extent|However|If|Consequently|If
031|who|that|both|and|Although
034|because|But|If|Therefore|For example
035|However|Firstly|Finally|Similarly|therefore
036|However|which|but|Therefore|or
041|Besides|When|that|according to|then
043|which|whereas|Since|Although|Therefore
046|Indeed|However|If|because|Therefore
048|Firstly|Secondly|Moreover|For example|Finally
050|according to|what|which|If|and
051|But|whether|Although|that|so that
053|but|so that|Consequently|while|However
054|In order to|Moreover|If|If|Besides
055|than|While|that|but|because
057|Although|As a result|Moreover|Despite|such as
060|who|Usually|or|indeed|because
062|Although|However|so that|Despite|Rather
064|where|but|When|so that|than
065|unless|but|whether|because|as long as
079|because of|but|As a result|when|Consequently
068|because|and|but|As|besides
071|but|that|So|so that|After
072|when|and|and|which|By
073|Moreover|Thus|On the other hand|Consequently|Therefore
075|Although|which|and|If|then
077|So|At last|When|Since|Then
078|Despite|Similarly|Although|Meanwhile|However
083|If|but|what|Rather|that
084|But|who|because|however|so
'''
# Exact source fragments + rationale. Formatting-only gap spacing is also logged separately.
CONNECTOR_REPAIRS={'001': [('glitter for sometimes', 'glitter for some time', 'Repair the time expression.'),
         ('moral value', 'moral values', 'Use the plural idiom.')],
 '002': [('all do not use it', 'not all use it', 'Clarify the intended partial negation.'),
         ('which creates (d) ____ misunderstanding (e) ____ destroys',
          'which (d) ____ creates misunderstanding (e) ____ destroys',
          'Place both before the first parallel verb rather than inside its object.'),
         ('various information', 'various kinds of information', 'Information is uncountable.')],
 '003': [('Time is coming (d) ____ there will be no tree left for us.',
          'We fear a time (d) ____ there may be no tree left for us.',
          'Present the source prediction as a fear, not a guaranteed forecast.')],
 '004': [('(d) ____ every woman is a potential mother and her influence on her children is very great.',
          '(d) ____ women make important contributions to all fields of life.',
          'Remove the generalisation that defines every woman by motherhood.')],
 '005': [('good tor health', 'good for health', 'Repair a source typo.'),
         ('the morning air is fresh and free from any kind of noise and pollutions',
          'the morning air here is fresh and relatively free from noise and pollution',
          'Localise and qualify an absolute environmental claim.'),
         ('make the habit', 'develop the habit', 'Repair the collocation.')],
 '006': [('nowhere in the world this problem is so acute as in our country',
          'this problem is very acute in our country',
          'Remove an unverified world ranking and inverted word order.'),
         ('our students and youths have a false sense of dignity',
          'some of our students and youths have a narrow view of career options',
          'Avoid a blanket judgement of young people.'),
         ('our system of education fails', 'our system of education sometimes fails', 'Qualify a blanket claim.')],
 '009': [('soon our country will turn into a desert',
          'our country may face increasing land degradation',
          'Avoid an unsupported certain climate prediction.')],
 '010': [('We may mostly, solve our food problem',
          'We may help to solve our food problem',
          'Repair the wording and avoid a claim that dietary change alone solves food insecurity.'),
         ('we can take potato instead of rice',
          'we can sometimes eat potatoes instead of rice',
          'Repair count/usage and avoid an absolute dietary prescription.')],
 '011': [('The greatness of a book depends (a) ____ on the accountability among the readers.',
          'A book may be popular. (a) ____, its greatness does not depend only on its accountability among the readers.',
          'Relocate the non-linking source gap to a genuine contrast connector.'),
         ('accountability among the readers', 'acceptance among readers', 'Repair the contextually incorrect source word.'),
         ('basing on one reading', 'based on one reading', 'Repair the participle construction.'),
         ('we have no doubt about the greatness of the book',
          'some readers accept its greatness without further examination',
          'Avoid treating praise as proof of greatness.')],
 '012': [('dedicate to this', 'dedicate himself to this', 'Supply the reflexive object.')],
 '014': [('our government is trying',
          'the passage says our government is trying',
          'Keep the source-era statement as reported, not current verified policy.')],
 '015': [('over head', 'overhead', 'Repair the compound adverb.')],
 '016': [('(c) ____, all despise him without considering his social status.',
          '(c) ____ a person tells lies, others may lose trust in him regardless of his social status.',
          'Supply the missing condition clause so the answer is a connector, not an invented full clause.')],
 '017': [('Life of a man', 'The life of a man', 'Supply the article.')],
 '018': [('possess equal rights and duties', 'possess the same rights and duties', 'Make the as comparison grammatical.'),
         ('They have noble mission to fulfil as men.',
          'They have important roles to fulfil, just as men do.',
          'Repair the comparison and article.')],
 '020': [('The poor culture is receiving quickly the elements (c) ____ are in rich culture.',
          'A local culture can quickly adopt elements (c) ____ are found in another culture.',
          'Avoid ranking cultures as poor/rich.'),
         ('prevent the infiltration of bad culture of another society to our own culture',
          'consider critically the cultural influences we adopt',
          'Remove an exclusionary generalisation while retaining the contrast.')],
 '023': [('wearing a school dress is not mandatory in every school',
          'schools may reach different decisions about uniform policies',
          'Avoid deriving an unverified universal policy claim from the argument.'),
         ('One argument is what to put on. (b) ____ pupils were allowed to wear clothes according to their own choice.',
          'One argument concerns what to wear. (b) ____ pupils were allowed to choose freely, they could express their '
          'individuality.',
          'Repair a fragment and make the conditional clause complete.'),
         ('afford to buy it', 'afford to buy expensive clothes', 'Clarify the ambiguous pronoun.')],
 '024': [('trustworthiness. (b) ____ nobody',
          'trustworthiness (b) ____ nobody',
          'Join the causal fragment to its main clause.')],
 '025': [('(d) ____, use of chemicals in industries causes serious harm to the ozone layer. (e) ____, there is a rapid '
          'increase in temperature causing greenhouse effect.',
          '(d) ____, burning fossil fuels in industries releases greenhouse gases. (e) ____, these emissions contribute to '
          'global warming.',
          'Correct the conflation of ozone depletion with the greenhouse effect.')],
 '028': [('we are responsible for our being illiterate',
          'our circumstances affect our access to education',
          'Avoid blaming people denied access to education.'),
         ('our government has taken steps',
          'the source reports that our government has taken steps',
          'Time-scope an unverified current-policy claim.'),
         ('We are dependent on forcing grants.',
          'Some development projects depend on foreign grants.',
          'Repair a typo and qualify a sweeping claim.'),
         ('(e) ____we are not aware of the importance of literacy. We will not be able to change our lot.',
          '(e) ____we are not aware of the importance of literacy, we will find it harder to improve our lives.',
          'Join the conditional fragment to its main clause.')],
 '034': [('natural and inorganic manure',
          'organic manure and inorganic fertilisers',
          'Distinguish manure from inorganic fertilisers.'),
         ('Soil is necessary for life. (a) ____most',
          'Soil is necessary for life (a) ____most',
          'Make the causal connector govern its preceding main clause.'),
         ('Agriculture scientists discourage farmers to use pesticides because of their harmful side effects.',
          'Agricultural scientists encourage responsible pest management to reduce harmful side effects.',
          'Repair wording and qualify the blanket pesticide advice.')],
 '036': [('most of the people are careless', 'some people are careless', 'Avoid a blanket judgement.'),
         ('is still evaluated nationally', 'is still honoured nationally', 'Repair the contextual word.'),
         ('some selfish people never want to give them recognition',
          'some people refuse to acknowledge it',
          'Clarify the pronoun and remove an attributed motive.'),
         ('guilty of the nation', 'failing in our duty to the nation', 'Repair the collocation.')],
 '041': [('the things (c) ____are required to be ready',
          'the materials (c) ____he needs to prepare',
          'Clarify an awkward relative clause.'),
         ('answer all the questions (d) ____instruction and (e) ____he will get the desired.',
          'answer the questions (d) ____the instructions, and (e) ____he may get the desired result.',
          'Supply missing noun/article and avoid promising a certain exam result.')],
 '043': [('in the environment; they', 'in the environment, they', 'Use a comma after the subordinate clause.'),
         ('We live in environment', 'We live in an environment', 'Supply article.'),
         ('A good environment creates good inhabitants (b) ____ a polluted environment creates bad inhabitants.',
          'A good environment supports healthy living (b) ____ a polluted environment can harm health.',
          'Do not equate environmental conditions with moral worth.')],
 '046': [('others. (d) ____he', 'others (d) ____he', 'Join the causal fragment to its main clause.')],
 '048': [('there is choice', 'there is a choice', 'Supply article.'),
         ('so do the theatre and to concerts', 'go to the theatre and attend concerts', 'Repair the activity list.')],
 '050': [('can be divided into six kinds',
          'can be grouped',
          'Avoid confusing nutrient classes with six exclusive food types.'),
         ('benefits they do to us', 'benefits they offer us', 'Repair the collocation.'),
         ('we do not take all these',
          'we do not get enough protein',
          'Do not imply that every named animal food is essential for healthy growth.'),
         ('protect us from several diseases', 'help protect us from deficiency diseases', 'Qualify the nutritional claim.'),
         ('what substances they contain and (b) ____benefits',
          'the substances they contain and (b) ____benefits',
          'Make the two complements grammatical for according to/what.'),
         ('Vitamins and mineral, salts', 'Vitamins and mineral salts', 'Remove a spurious comma.')],
 '051': [('has a risen', 'has arisen', 'Repair word division.')],
 '053': [('practised everyday', 'practised every day', 'Distinguish the adverb phrase.'),
         ('most of his time for training', 'most of his time training', 'Repair the complement.')],
 '054': [('the Govt. is trying to raise public awareness',
          'the source also describes efforts to raise public awareness',
          'Keep the policy statement under the reported-source frame.'),
         ('the government has interchanged examination centres and formed invigilation teams',
          'the source describes changing examination centres and forming invigilation teams',
          'Do not assert a policy is currently implemented.'),
         ('the Govt. has taken some preventive measures',
          'the source describes some preventive measures',
          'Avoid presenting source-era policy as a verified current law.'),
         ('Recently the Govt. has announced a law that',
          'The source describes a proposed rule that',
          'Do not assert an unverified enacted law.')],
 '055': [('It is a wrong notion to be physically beautiful',
          'It is mistaken to judge people only by physical beauty',
          'Repair the logical claim; physical beauty is not itself wrong.')],
 '057': [('summer is', 'Summer is', 'Capitalise sentence start.'),
         ('small pox, cholera and other diseases break out during this time',
          'heat-related illnesses can occur during this time',
          'Remove the false suggestion that eradicated smallpox is a current seasonal disease.')],
 '060': [('festival manner', 'festive manner', 'Repair adjective.'),
         ('certain occasions Pahela Baishakh, Puja etc.',
          'certain occasions, such as Pahela Baishakh or Puja.',
          'Clarify examples.'),
         ('artisans and craftsman', 'artisans and craftspeople', 'Repair number agreement.')],
 '062': [('(a) ____July warriors fought for the country (b) ____they are not given legal recognition. They fought for the '
          'countrymen (c) ____the future generation can lead a secured life. (d) ____their sacrifice, they are not honoured '
          'properly (e) ____, they are tortured by the political parties.',
          '(a) ____the volunteers worked for their community, they received little recognition in this fictional account. '
          '(b) ____they continued helping their neighbours (c) ____the next generation could lead a safer life. (d) '
          '____their sacrifice, they received little support; (e) ____, they faced criticism.',
          'Explicit fictional adaptation: remove unverified current political allegations while retaining '
          'concession/purpose/contrast structure.')],
 '064': [('(c) ____a certain stage in its growth, twigs are carefully pruned',
          '(c) ____a plant reaches a certain stage in its growth, its twigs are carefully pruned',
          'Use a temporal linking clause rather than an isolated time preposition.'),
         ('in hill sides', 'on hillsides', 'Repair idiom.'),
         ('(e) –—', '(e) ____', 'Normalise an inconsistent printed dash.')],
 '065': [('it inbibies moral dimension in it', 'it includes a moral dimension', 'Repair source spelling/idiom.'),
         ('limited to help the young for earning their livelihood',
          'limited to helping the young earn their livelihood',
          'Repair complements.'),
         ('the earning is worth in terms of utility of work to mankind',
          'their work is useful to humanity',
          'Repair the indirect question.'),
         ('their intension always worked to serve the humanity',
          'they made contributions valued by many people',
          'Avoid asserting knowledge of motives.'),
         ('We all should have tendency of doing good to others (e) ____. We survive on earth.',
          'We should all try to do good to others (e) ____we live on earth.',
          'Repair an incomplete linking clause.')],
 '068': [('free from canes', 'free from many cares', 'Repair a source typo and qualify the claim.'),
         ('He has nothing to do (c) ____study.',
          'His main duty is to do nothing (c) ____study during study hours.',
          'Avoid the absolute claim that students have no other responsibilities.')],
 '072': [('guide us to path of life', 'guide us to a path in life', 'Repair article/idiom.')],
 '073': [('A healthy man can do any work.', 'Good health can make many activities easier.'),
         ('he can eat any food he likes', 'a healthy person may have more dietary choices'),
         ('he can enjoy life in every way', 'good health can support an active life'),
         ('an unhealthy man is unhappy, for he cannot eat and do what he likes',
          'illness can limit some activities and may require dietary changes'),
         ('he lives and dies poor. He may have intelligence, merit, learning and power, but he cannot put them to the use '
          'and reap their benefits.',
          'illness can create financial pressure, although people with illnesses can lead fulfilling and successful lives.'),
         ('health is the source of all happiness in life', 'health is one important contributor to well-being')],
 '075': [('which are saved (b) ____ useful memories',
          '(b) ____ may contain useful information',
          'Use a relative connector and a meaningful computing description.'),
         ('Computer virus is terror', 'A computer virus is a threat'),
         ('the plain operation', 'the normal operation'),
         ('usually a programme to delete the files', 'a program that may delete files'),
         ('the virus attacks the hard disk', 'a virus affects data on a hard disk'),
         ('(d) ____ things happen (e) ____, no operation is possible after the attack.',
          '(d) ____ a serious attack occurs, (e) ____ normal operation may be disrupted.')],
 '077': [('unknown to me. I felt', 'unknown to me, I felt', 'Join the causal clause to its main clause.'),
         ('It was the 26th October 1992.',
          'It was 26 October 1992.',
          'Repair date style; preserve the historical first-person account.')],
 '078': [('Bangladesh has witnessed a surge in social movements in recent years, driven by a growing sense of civic '
          'consciousness and a desire for change.',
          'This 2024 source describes several social campaigns in Bangladesh.',
          'Clearly frame the account as source-era descriptions, not verified current affairs.'),
         ('One notable movement is', 'The source describes one notable movement as'),
         ('which has gained significant momentum', 'which it says gained momentum'),
         ('the campaign has succeeded', 'the source says the campaign succeeded'),
         ('has been instrumental', 'is described as instrumental'),
         ('has fostered', 'is described as having fostered')],
 '079': [('We cut down trees (b) ____ never think of planting more trees.',
          'Some people cut down trees (b) ____ do not think of planting more trees.',
          'Qualify the absolute claim.'),
         ('human and other living beings are in the threat of extinction',
          'humans and other living beings face increasing risks'),
         ('Time is coming (d) ____ there will be no tree left for us.',
          'We fear a time (d) ____ there may be very few trees left.'),
         ('we have to face bitter consequences', 'we may have to face serious consequences')],
 '083': [('their condition is getting from bad to worse',
          'some families find their circumstances getting worse',
          'Qualify the source generalisation.'),
         ('People living under poverty line has', 'People living below the poverty line have'),
         ('The only thing (e) ____ they need is nothing but education.',
          'One important thing (e) ____ they need is access to education.')],
 '084': [('rural people', 'some people'),
         ('They can (d) ____ bring about green revolution by planting trees',
          'They can, (d) ____, help restore greenery by planting trees')]}
# Continuous corrected passages. Punctuation variants may be valid; these are possible models.
PUNCTUATION_KEYS = '''
001|“What kind of stories did Aesop tell?” said Abdullah. “Fables,” replied Mr Rahman. “Do you know what fables are?” “No,” replied Abdullah. “Well,” continued Mr Rahman, “fables are stories with a message or a moral.”
002|“Do you know me?” “Yes, I know you from my childhood.” “What's your name?” “My name is Sumon.” “Thank you a lot,” said Mr Jamal.
003|“Won't you go to school today, Raju?” He said, “Dad, I feel feverish. I don't want to go to school.” “OK, take rest now,” said he.
004|“How dare you wake me up!” the lion roared. “I shall kill you for that.” “Please let me go,” the mouse cried.
005|The teacher said to the girl, “Do you think that honesty is the best policy?” “Yes, sir, I think so,” said the girl. “Then learn to be honest from your childhood.” “Thank you, sir,” said the girl. “May Allah bless you!” said the teacher.
006|“Why don't you attend classes regularly?” the teacher said to the boy. “You cannot expect good results unless you attend classes as I tell you.” “I am sorry, sir,” said the student.
007|The old woman said, “Can you give me some food? I have been starving for three days.” The young man said, “Why do you beg? Can't you work?”
008|The man said to me, “Where are you going?” “I am going to Varsity,” said I. “Did you go to Varsity yesterday?” “No,” I replied. “Why did you not go?” “I was very busy,” said I.
009|“Hi, Jhorna! I'm coming to Bangladesh next month. Will you receive me at the airport?” said Meghla. “Don't worry. I'll be there,” Jhorna said.
010|Mehdi said to Nitu, “What's your programme after the test examination?” Nitu said, “I have decided to visit the Padma Bridge.” “What an excellent idea it is!”
011|Once my mother said to me, “Who came to you?” “My friend Rafiq, Mom.” She asked, “What did he want?” I said, “His mother is ill. He needs some money. I have given him five hundred taka.” My mother said, “Wonderful!”
012|“Why are you putting the foods in your pocket, sir? Why don't you eat?” asked the nobleman. “I'm doing the right thing. My dress deserves these rich dishes,” replied Sheikh Saadi. “I'm sorry. I don't understand what you mean to say,” said the nobleman.
013|“Where are you going now?” Karim said, “I am going to hospital. My brother is ill. I've to stay with him in the hospital.”
014|“My dear friends, I am here to tell you about an important discovery,” said the cunning fox. “I have discovered that our tails are unnecessary.” “How strange! Is it unnecessary?” said the other foxes.
016|“Why are you not going to school?” said Mother to her son. He said, “I am waiting for my friend to come and go to school together.”
017|Mainul Islam is a qualified farmer in Naogaon. He lives in his village with his two brothers. When he was asked, “What makes you decide to stay here in this village?” he replied, “Look, it's true that we could leave this village for a city life. But it didn't attract us.”
019|“Have you killed the rats?” said the mayor. “Yes, I have,” replied the piper. “Give me the promised money.” “How funny you are!” said the mayor. “Take only fifty.”
021|“Go to bed now,” Mother said. “You can complete your assignment in the morning.” “No, Mom, I'll finish it now.”
022|Mr Hasan is a renowned English teacher. He has been teaching in our school for the past five years. He is honest and sincere. He is our favourite teacher. We love him much.
023|Once a rich banker said to a poor cobbler, “How much do you earn a year?” The cobbler replied, laughing, “I never count in this way. I earn barely enough to pass a day. And I'm happy.” “Are you really happy?” said the banker.
024|I said to the old man, “What are you doing?” “I am watching the boys swimming in the pond,” he said. “How happy they are! May Allah bless them!” “Let me sit by you and enjoy the scene,” I said.
027|Monira said to Protiva, “How does the question seem to you? Have you got everything common?” “No, one item is uncommon to me. What about you?” said Protiva. “I'm in the same position as you,” replied Monira.
028|“Why are you going to Barishal?” said Father. “I want to buy some important books,” said Saad. “Do you need money?” “Yes, Father.” “Don't go alone, as time is not going well.”
029|“Aren't you going to have any?” said I. “No, I never eat asparagus.” “I know there are people who don't like them. The fact is that you ruin your palate by all the meat you eat,” she said.
030|My dear Mother, your letter is just to hand. It seems to me that you are anxious for me, but you need not think about me.
031|“Is there anybody here who has ever crossed a river by a boat?” “I have, teacher. I clearly remember what happened in that journey,” said Jamal.
032|“How is your father, Bilkis?” said Mr Rahman. “He is very well, thank you,” Bilkis replied. “I am glad to hear that he is in good health,” said Mr Rahman.
034|“Do not worry about a few mistakes,” said the teacher. “You can learn a lot through your mistakes.” “Do we learn from our mistakes?” asked the boy.
035|“Hello, old lady! What are you doing?” said the princess. “I am spinning a yarn around the spindle,” replied the old woman.
036|“Would you please tell me one reason for air pollution?” “Yes, the smoke from our household activities, vehicles, factories, etc. is a major cause of air pollution.”
046|“What do you want?” asked she. Alfred answered, “I only want to come in. I am very tired. Please let me come inside. Afterwards, I will go away.”
049|The boy said to the teacher, “How can I improve in English, sir?” “You must read your textbooks and English newspapers daily. You also should listen to BBC and CNN regularly,” said he. “Thanks a lot, sir,” said the boy.
052|He said, “I can chop some wood today.” I said, “But I have a boy coming from the orphanage.” “I'm the boy.” “You? But you are small.” “Size does not matter chopping wood,” he said.
055|Shihab goes to a village primary school. One day, his uncle takes him to Dhaka. Shihab is surprised to see so many tall buildings. He starts counting the floors of a building. The building has 20 floors. He asks his uncle, “Who lives on so many floors, Uncle?”
057|“Are you brothers?” the mistress of the house said, turning to the dervishes. “No, by Allah,” they said. “We are poor wanderers who met by mere chance. We pray for Allah's pardon.”
059|“But one day I shot the albatross,” the old sailor told the marriage guest. “It was a terrible thing to do, and everyone said I had killed the bird which made the wind blow. I had brought bad luck to the crew.”
060|“My sons, listen to me, please,” said the eighty-year-old farmer. “A great treasure lies hidden in the land that I'm going to leave you.” “How can we find it, Father?” asked the sons. “You must dig the land for it,” replied the old farmer.
062|“Give me a few grains of corn. I am dying of hunger,” said the grasshopper. “But what did you do in the summer? Didn't you store any grain?” the ant remarked. “No, I was too busy singing.”
063|“That can't be,” replied the nightingale. “I can't have any nest in the palace. I love to live in the greenwood. I fly around to the poor fishermen, to the peasants' huts, to the people who live far away from the palace.”
064|The boy said to the teacher, “Sir, I shall be grateful if you kindly lend me the book you praised highly in the classroom yesterday.” The teacher said, “I have become really happy to know that you are eager to read this book. You are welcome to any of my books that you like.” “Thank you, sir,” said the boy. “You are welcome,” said the teacher.
065|“Did you hear a sound?” he asked. “No,” she replied. “I heard nothing distinctly.” “Listen carefully,” he said. “Can you hear a little moaning sound coming from the old cottage?”
067|“Why didn't you go to school yesterday?” said Mother. “I was ill, Mum,” the girl replied. “How are you today?” the mother asked again. “Well,” said the girl.
068|“Porter, you may go,” said the mistress of the house, laughing. “You have gained your freedom.” “By Allah,” he replied, “I will not leave this house until I have heard the stories of my companions.”
071|The professor said, “We must submit our projects by Monday.” However, several students replied that they hadn't received the required data from Dr Fakhrul Alam. When he heard this, the professor smiled and said, “Don't worry. I'll extend the deadline till Friday.”
072|“What can I teach you?” asked Nasiruddin. “We don't know,” replied the students. “You are students, but you do not know anything. So I can't teach you anything,” said Nasiruddin.
078|“What is it, Mamma? I didn't want this black thing and the terrible smell.” “Nor did I, my dear, but what shall I do with it?” “That I can't tell.” “Okay, Mamma, I must pour it out and fill the jar with fresh water.”
086|“Did people use stamps in those days?” asked Rafiq. “Yes,” answered Mr Jamal. “The first stamps were used in 1840.” “Are they easy to get now?” asked Rafiq. “They are very difficult to get,” his uncle replied.
087|Thomas Alva Edison, a great scientist, was born in 1847 in Ohio, America. As a little boy, he was very inquisitive. He always wanted to know how things were done. Very early in life, he showed that he was full of curiosity, a quality which is so important to inventors.
089|Once upon a time, there was an old farmer. He lived with his wife and three sons. The three sons always quarreled with one another. Their parents said, “Stop! Don't quarrel. It's bad.” But they did not listen to their parents.
095|“My lord,” he said to the caliph in a humble voice, “I know I have done wrong and must suffer for it, but if I have the donkey, I shall cause it a great deal of unnecessary suffering.”
102|“Have you ever been to Cox's Bazar?” asked Ratul. “No, I have never gone there,” replied Rana. “But I long for visiting the place.” “I had an opportunity to visit the sea beach last year,” said Ratul. “How charming the scenery was!”
'''
PUNCTUATION_REPAIRS={
'001':[('abduallh','abdullah','Repair inconsistent spelling of the same speaker.')],
'005':[('aliah','allah','Repair a misprinted proper name.')],
'010':[('text examination','test examination','Repair source typo.')],
'012':[('Seikh Saadi','Sheikh Saadi','Standardise the proper name.')],
'016':[('why are not you','why are you not','Repair the uncontracted interrogative order.')],
'024':[('the boy, swimming','the boys swimming','Repair number agreement with they and remove the misleading source comma.')],
'027':[('position like you','position as you','Repair the comparative idiom.')],
'036':[('one reason of air pollution','one reason for air pollution','Repair the collocation.'),('is mainly causing air pollution','is a major cause of air pollution','Repair and qualify the source causal claim.')],
'049':[('text books','textbooks','Repair word division.')],
'055':[('who live on','who lives on','Repair subject–verb agreement.')],
'057':[('wanders','wanderers','Repair noun typo.'),('mere change','mere chance','Repair contextual typo.')],
'062':[('grains of corns','grains of corn','Use the mass noun.'),('too busy in singing','too busy singing','Repair complement.')],
'063':[('nightingle','nightingale','Repair spelling.')],
'065':[('distinctly carefully','distinctly listen carefully','Supply the missing imperative verb; punctuation alone cannot repair this fragment.'),('moarning','moaning','Repair spelling.')],
'086':[('this uncle','his uncle','Repair a source typo.')],
'089':[('said step','said stop','Repair a source typo.')],
}
def rows(s):
 result={}
 for line in s.strip().splitlines():
  id,*values=line.split('|');assert id not in result;result[id]=values
 assert len(result)==51
 return result

def build(kind,keytext,repairs):
 audit=json.loads((ROOT/f'docs/english/work-in-progress/ssc-paper2-{kind}-candidates.json').read_text())
 pool={e['candidateId'].split('-')[-1]:e for e in audit['candidates']};items=[]
 for id,answers in rows(keytext).items():
  e=pool[id];assert not e.get('duplicateOf'),id
  text=e['sourcePassage'];changes=[]
  for repair in repairs.get(id,[]):
   before,after,*reason=repair;assert before in text,(id,before)
   if before==after:continue
   changes.append({'before':before,'after':after,'reason':reason[0]if reason else 'Explicitly qualify or repair the source generalisation; preserve the complete original separately.'});text=text.replace(before,after)
  if kind=='connectors':
   spaced=re.sub(r'\(([a-e])\)\s*____\s*',r'(\1) ____ ',text)
   if spaced!=text:changes.append({'before':text,'after':spaced,'reason':'Normalise gap spacing without changing words.'});text=spaced
   assert re.findall(r'\(([a-z])\)',text)==list('abcde'),id
   assert len(answers)==5
   instruction='Complete the passage with suitable linking words or phrases, including relative words and linking expressions where required. The given key is one possible set of answers.'
  else:
   assert len(answers)==1
   instruction='Use capital letters and punctuation marks where necessary in the following text. Do not change the words. More than one well-punctuated version may be acceptable.'
   # Verify that the key adds punctuation/case only to the disclosed, repaired practice.
   words=lambda t:re.findall(r'[a-z0-9]+',t.lower().replace('’',"'").replace("'",'').replace('“','').replace('”',''))
   # Splitting an omitted apostrophe (i m) is purely punctuation/spacing, not word invention.
   compact=lambda t:''.join(words(t))
   assert compact(text)==compact(answers[0]),(id,words(text),words(answers[0]))
  if any(c['reason']!='Normalise gap spacing without changing words.' for c in changes):
   instruction='Source-backed adapted practice. '+instruction
  meta={k:v for k,v in e.items()if k not in ['candidateId','gapLabels','issues','duplicateOf','sourceRawText','rawTextSha256']}
  item={'id':f'ssc-p2-{kind}-{len(items)+1:03}', 'sourceCandidateId':e['candidateId'],**meta,'sourceRawText':e['sourceRawText'],'rawTextSha256':e['rawTextSha256'],'instruction':instruction,'passage':text,'answers':answers,'editorialChanges':changes,'editorialNotes':['Possible assistant-authored answer, NOT an official answer key. Teacher review and valid alternatives remain necessary.','Source original is preserved verbatim after layout/font normalisation; all non-layout repairs are disclosed.'], 'contentSha256':digest({'passage':text,'answers':answers})}
  if kind=='punctuation':item['editorialNotes'].append('One continuous five-mark passage, not five fabricated subquestions or an official per-position marking scheme. Dialogue speaker boundaries are a plausible reading of the unpunctuated source; other coherent readings may be valid.')
  if id in (['062','073','078']if kind=='connectors'else ['059','087']):item['editorialNotes'].append('Source-era claims, narrative beliefs and fictional statements are not independent factual certification. See the original and explicit adaptation ledger.')
  items.append(item)
 assert len(items)==51
 assert len({re.sub('[^a-z0-9]','',e['passage'].lower())for e in items})==51
 batch={'version':1,'item':kind,'reviewStatus':'PREPARED_NOT_IMPORTED','marks':5,'answerStatus':'POSSIBLE_TEACHER_REVIEW_REQUIRED — NOT official answers','sources':audit['sources'],'items':items}
 (ROOT/f'lib/english/data/ssc-paper2-{kind}-review.json').write_text(json.dumps(batch,ensure_ascii=False,indent=2)+'\n')
 title='Sentence connectors'if kind=='connectors'else 'Punctuation and capitalization'
 out=[f'# SSC English 2nd Paper — {title}: 51 prepared review sets','', '**PREPARED_NOT_IMPORTED. Possible answers only, NOT official keys. Teacher review required.**','', 'Class 9–10; five marks per practice set. Source examination question numbers/marks remain separate from the current blueprint. No production import or approval is performed by this document.','']
 for e in items:
  source=next(s for s in batch['sources']if s['fileId']==e['sourceFile'])
  out += [f"## {e['id']} — {e.get('board',e.get('school'))}, {e['examYear']}",'',f"Source: {source['filename']} · physical PDF page {e['pdfPage']} · Q{e['questionNumber']} · original {e['originalMarks']} marks"+ (f" · {e['examType']}"if 'examType'in e else ''),'',e['instruction'],'',e['passage'],'','### Possible answer','']
  out += [f"({chr(97+i)}) {a}"if kind=='connectors'else a for i,a in enumerate(e['answers'])]
  out += ['','### Preserved original','',e['sourceInstruction'],'',e['sourcePassage'],'','### Editorial ledger','']
  out += [f"- {c['before']} → {c['after']} — {c['reason']}"for c in e['editorialChanges']]or ['- No wording change.']
  out += ['']+[f'- {n}'for n in e['editorialNotes']]+['',f"Source content SHA256: `{e['sourceContentSha256']}`",f"Source PDF SHA256: `{e['sourceSha256']}`",f"Practice/key SHA256: `{e['contentSha256']}`",'']
 (ROOT/f'docs/english/ssc-paper2-{kind}-review.md').write_text('\n'.join(out).rstrip()+'\n')
 print(kind,len(items),'prepared sets')
if __name__=='__main__':
 build('connectors',CONNECTOR_KEYS,CONNECTOR_REPAIRS)
 build('punctuation',PUNCTUATION_KEYS,PUNCTUATION_REPAIRS)
