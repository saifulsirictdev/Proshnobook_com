"""Run after check.cjs: PYTHONPATH=.cache/python python3 scripts/auto-model/verify_pdf.py.
Synthetic layout fixtures only; not a reviewed/official or imported model paper.
"""
import json
from pathlib import Path
import pymupdf

out = Path('docs/proof/auto-model')
results = []

def bn(value):
    return str(value).translate(str.maketrans('0123456789', '০১২৩৪৫৬৭৮৯'))

for variant in ['written', 'mcq']:
    texts = []
    for width in [1280, 390]:
        name = f'{variant}-{width}.pdf'
        doc = pymupdf.open(out / name)
        assert len(doc) == 2, (name, len(doc))
        page_texts = [page.get_text() for page in doc]
        texts.append(page_texts)
        text = '\n'.join(page_texts)
        for forbidden in ['নমুনা সেভ', 'পুনরায় খুলুন', 'প্রথম প্রশ্ন সম্পাদনা', 'লেআউট পরীক্ষার প্রশ্ন', 'mock server', '![']:
            assert forbidden not in text, (name, forbidden)
        assert ('পূর্ণমান: ৭০' if variant == 'written' else 'পূর্ণমান: ৩০') in text
        if variant == 'written':
            assert text.count('[১০]') == 8
            assert text.count('[২]') == 15
            assert '(ঘ)' not in text, 'No empty legacy fourth CQ subpart'
            for n in range(1, 16):
                assert text.count(bn(str(n).zfill(2))+'।') == (2 if n <= 8 else 1), (name, n)
            assert all(label in text for label in ['ক-বিভাগ', 'খ-বিভাগ', 'গ-বিভাগ', 'ঘ-বিভাগ', 'সংক্ষিপ্ত উত্তর প্রশ্ন'])
            assert 'মোট ৫টি' in text and '১০টি' in text
            assert all(label in page_texts[0] for label in ['০৩।', '০৪।']), 'Diagram-dependent fixture questions stay on diagram page'
        else:
            assert text.count('[১]') == 30
            for n in range(1, 31):
                assert text.count(bn(str(n).zfill(2))+'।') == 1, (name, n)
            assert text.count('(ঘ)') == 30, 'All 30 MCQs retain four choices'
        diagrams = 0
        for page in doc:
            assert abs(page.rect.width - 595.28) < 1
            assert abs(page.rect.height - 841.89) < 1
            for block in page.get_text('dict')['blocks']:
                if block['type'] == 1:
                    diagrams += 1
                    rect = pymupdf.Rect(block['bbox'])
                    assert page.rect.contains(rect)
                    pix = page.get_pixmap(clip=rect, colorspace=pymupdf.csGRAY)
                    assert sum(v < 180 for v in pix.samples) > 100
        assert diagrams == (2 if variant == 'written' else 0), (name, diagrams)
        results.append({'file':name, 'pages':len(doc), 'A4':True, 'questionCount':23 if variant=='written' else 30, 'numberingCorrect':True, 'diagrams':diagrams, 'allImagesInBounds':True, 'noEditorOrAnswerLeak':True, 'syntheticFixturesOnly':True})
    assert texts[0] == texts[1], f'{variant}: desktop/mobile print content differs'
(out / 'pdf-results.json').write_text(json.dumps(results, indent=2)+'\n')
print(json.dumps(results, indent=2))
