"""Read-only inventory, not question import or answer verification.
Usage: python inventory_board_pdf.py source.pdf output.json
Requires PyMuPDF. Keeps original PDF-page locators; never infers absent years.
"""
import collections
import hashlib
import json
from pathlib import Path
import re
import sys

HEADER = re.compile(r"\b(DHAKA|RAJSHAHI|JASHORE|JESSORE|CUMILLA|COMILLA|CHATTOGRAM|CHITTAGONG|BARISHAL|BARISAL|SYLHET|DINAJPUR|MYMENSINGH|COMBINED|ALL)\s+BOARDS?\s*[^\w\n]*\s*(20\d{2})\b")


def inventory(pages, digest):
    papers = []
    current = None
    for page_number, text in enumerate(pages, 1):
        matches = list(HEADER.finditer(text))
        start = 0
        for match in matches:
            if current is not None:
                current['_parts'].append(text[start:match.start()])
                current['pdfPageEnd'] = page_number if match.start() > 100 else page_number - 1
            current = {'board': match.group(1).title(), 'examYear': int(match.group(2)),
                       'pdfPageStart': page_number, 'pdfPageEnd': page_number, '_parts': []}
            papers.append(current)
            start = match.start()
        if current is not None:
            current['_parts'].append(text[start:])
            current['pdfPageEnd'] = page_number
    for paper in papers:
        text = ''.join(paper.pop('_parts'))
        paper['extractedCharacters'] = len(text)
        paper['textSha256'] = hashlib.sha256(text.encode()).hexdigest()
        paper['status'] = 'EXTRACTED_NOT_REVIEWED'
    return {'sourceSha256': digest, 'pdfPages': len(pages), 'paperCount': len(papers),
            'byYear': dict(sorted(collections.Counter(str(p['examYear']) for p in papers).items())),
            'warning': 'Heading inventory only. Repeated passages, complete questions, charts and answers require review. Filename years are not evidence of complete coverage.',
            'papers': papers}


if __name__ == '__main__':
    import pymupdf
    source, target = map(Path, sys.argv[1:])
    with pymupdf.open(source) as pdf:
        result = inventory([page.get_text() for page in pdf], hashlib.sha256(source.read_bytes()).hexdigest())
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({k: v for k, v in result.items() if k != 'papers'}, indent=2))
