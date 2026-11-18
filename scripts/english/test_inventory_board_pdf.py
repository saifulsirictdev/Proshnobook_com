import unittest
from inventory_board_pdf import inventory

class InventoryTest(unittest.TestCase):
    def test_years_from_headings_not_filename_or_passage(self):
        result = inventory(['DHAKA BOARD\uf02d2024\nBorn in 2018.\n', 'More questions\n', 'COMBINED BOARD–2018\n'], 'abc')
        self.assertEqual(result['byYear'], {'2018': 1, '2024': 1})
        self.assertEqual(result['papers'][0]['pdfPageStart'], 1)
        self.assertEqual(result['papers'][0]['pdfPageEnd'], 2)
        self.assertEqual(result['papers'][1]['pdfPageStart'], 3)
        self.assertTrue(all(p['status'] == 'EXTRACTED_NOT_REVIEWED' for p in result['papers']))

    def test_school_and_unknown_year_not_labeled_board(self):
        self.assertEqual(inventory(['Famous School Exam 2026\nDHAKA BOARD\n'], '')['papers'], [])

    def test_multiple_headers_and_deterministic_hashes(self):
        pages = ['DHAKA BOARD-2024\nQuestion\nSYLHET BOARD-2023\nNext\n']
        a = inventory(pages, 'x')
        self.assertEqual(a, inventory(pages, 'x'))
        self.assertEqual(a['paperCount'], 2)
        self.assertNotEqual(a['papers'][0]['textSha256'], a['papers'][1]['textSha256'])

if __name__ == '__main__':
    unittest.main()
