import importlib.util
from pathlib import Path
import unittest
spec = importlib.util.spec_from_file_location('calendar_helpers', Path(__file__).parents[1] / 'tools/season_calendar.py')
calendar = importlib.util.module_from_spec(spec)
spec.loader.exec_module(calendar)
class CalendarTest(unittest.TestCase):
    def test_epoch_and_year_boundary(self):
        self.assertEqual(calendar.season(1945,12),1)
        self.assertEqual(calendar.season(1946,1),1)
        self.assertEqual(calendar.season(1946,2),1)
        self.assertEqual(calendar.season(1946,3),2)
        self.assertEqual(calendar.season(1946,6),3)
        self.assertEqual(calendar.season(1946,9),4)
        self.assertEqual(calendar.season(1946,11),4)
        self.assertEqual(calendar.season(1946,12),5)
    def test_exact_leap_year_fraction(self):
        self.assertEqual(calendar.doq(1947,12,1),0)
        self.assertAlmostEqual(calendar.doq(1948,2,29),90/91)
        self.assertEqual(calendar.doq(1948,3,1),0)
if __name__ == '__main__': unittest.main()
