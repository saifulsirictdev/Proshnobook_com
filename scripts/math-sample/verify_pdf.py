"""pip install pymupdf; run after check.cjs. No downloads or production access."""
import json
from pathlib import Path
import pymupdf

out = Path('samples/ssc-math/proof')
results = []
for name in ['sample.pdf', 'sample-mobile.pdf', 'sample-without-source.pdf', 'sample-mobile-without-source.pdf']:
    doc = pymupdf.open(out / name)
    source_on = 'without-source' not in name
    text_all = ''.join(page.get_text() for page in doc)
    assert text_all.count('রাজউক') == (3 if source_on else 0), name
    for number in ['১০', '১৬', '২০']:
        assert text_all.count('প্রশ্ন '+number) == (1 if source_on else 0), (name, number)
    assert 'ঢাকা বোর্ড' not in text_all, 'school question must not become a Dhaka Board question'
    assert len(doc) == 2, (name, len(doc))
    images = 0
    for index, page in enumerate(doc):
        assert abs(page.rect.width - 595.28) < 1
        assert abs(page.rect.height - 841.89) < 1
        text = page.get_text()
        for forbidden in ['নমুনা সেভ', 'পুনরায় খুলুন', 'প্রশ্ন সম্পাদনা', 'মধ্যবিন্দু উপপাদ্য অনুযায়ী', 'অতএব AB', 'তিনটিই সঠিক']:
            assert forbidden not in text, (name, forbidden)
        blocks = [b for b in page.get_text('dict')['blocks'] if b['type'] == 1]
        assert len(blocks) == (1 if index == 0 else 2)
        for block in blocks:
            rect = pymupdf.Rect(block['bbox'])
            assert page.rect.contains(rect), (name, index, rect)
            # Verify nonempty high-resolution diagram content, not just an image placeholder.
            assert block['width'] == 960 and block['height'] == 780
            pix = page.get_pixmap(clip=rect, colorspace=pymupdf.csGRAY)
            assert sum(v < 180 for v in pix.samples) > 100
        images += len(blocks)
        assert all(token in text for token in (['০১।', 'AD = BD', 'i ও ii'] if index == 0 else ['০২।', '০৩।', 'OA = ৫', 'OM = ৪', '৬ সে.মি.', 'cos']))
    # Mobile and desktop must print the same A4 content, not a reduced mobile screenshot.
    results.append({'file': name, 'pages': len(doc), 'diagrams': images, 'allImagesInPageBounds': True, 'questionImageAndOptionsTogether': True, 'noEditorOrSolutionLeak': True, 'sourceLabelsVisible': source_on, 'sourceLabelCount': 3 if source_on else 0})
assert pymupdf.open(out / 'sample.pdf')[0].get_text() == pymupdf.open(out / 'sample-mobile.pdf')[0].get_text()
(out / 'pdf-results.json').write_text(json.dumps(results, indent=2)+'\n')
print(json.dumps(results, indent=2))
