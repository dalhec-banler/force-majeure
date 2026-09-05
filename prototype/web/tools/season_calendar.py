"""Meteorological seasons: winter includes the preceding December."""
from datetime import date

def season(y,m):
    return (y-1946+(m==12))*4 + (0 if m in (12,1,2) else 1 if m<6 else 2 if m<9 else 3) + 1

def doq(y,m,d):
    if m in (12,1,2):
        sy=y if m==12 else y-1
        start,end=date(sy,12,1),date(sy+1,3,1)
    else:
        sm=3 if m<6 else 6 if m<9 else 9
        start,end=date(y,sm,1),date(y,sm+3,1)
    return (date(y,m,d)-start).days/(end-start).days
