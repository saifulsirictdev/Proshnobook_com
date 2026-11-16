# Job preliminary catalog provenance

Owner decision: exactly four root exams, with School/College nested inside NTRCA. Admission remains unchanged. Only preliminary MCQ preparation; no written option. Source catalog: `lib/job-syllabuses.json` (file SHA-256, page counts, per-subject page references and source-only marks).

| Root / branch | Owner-supplied input | Used pages |
| --- | --- | --- |
| BCS | `50th-bcs-syllabus-1.pdf` | 1–14, syllabus portions; exclude promotional book lists |
| Primary | `primary syllables .pdf` | 1–2 |
| NTRCA / School | `school syllables .pdf` | 3; cover identifies eighteenth registration exam 2023, code 300 |
| NTRCA / College | `ntrca syllables .pdf` | 3; cover identifies eighteenth registration exam 2023, code 400 |
| Government grades 11–20 | Owner's pasted general-job outline in conversation | MCQ topics only, no written components |

PDFs were extracted with pypdf; Bengali font mappings contain malformed Unicode/legacy Bijoy. Topic labels are normalized/transcribed/grouped for readable selectors, not verbatim text extraction. School geometry (lines/angles/triangles/quadrilaterals/area/circle) and College geometry (mensuration/trigonometry) remain separate. Both NTRCA sources have four 25-mark subjects. BCS input totals 200 (30/30/25/25/10/15/15/20/15/15); Primary input totals 80. Marks are displayed solely as **source marks**, not current verified exam settings, and never automatically configure a paper.

BCS and Primary PDFs contain Live MCQ preparation material, not independently retrieved current government notices. The NTRCA PDFs are explicitly from 2023, not a claim about the latest cycle. No external authenticity/currentness verification was performed. Input hashes allow later comparison; third-party source PDFs/promotional material are not redistributed in public assets.

The owner's grades 11–20 text lists variable/inconsistent marks, duration and negative-mark ranges; none are installed as authoritative settings. Paragraph/composition/letter/summary/expansion writing tasks are excluded. Translation/grammar identification may remain as MCQ topics. BCS composition *names of parts* is retained as an MCQ knowledge topic because it is explicitly in its preliminary input, not a request to write an essay.

Catalog subjects/topics are syllabus-guided preparation choices, not proof of a complete question bank or exact historical exam questions. Existing payment/auth/storage contracts remain unchanged. The starter sends Job as MCQ and the preparation server page also forces MCQ for Job. No paid generation is invoked by the browser regression.
