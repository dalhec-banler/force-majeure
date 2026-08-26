"""History is the baseline (ADR-0017). Compiles prototype/web/history.json:
  storms     — every Atlantic hurricane 1946–1955 from raw HURDAT2 (real
               names, dates, daily track points, landfalls). Public domain.
  eruptions  — real volcanic eruptions 1946–1955 (authored; VERIFY vs GVP)
  quakes     — real major earthquakes 1946–1955 (authored; VERIFY vs USGS)
  weather    — real major weather disasters mapped to prototype regions
               (authored; the console fires each unless the player's own
               ops pushed the region against the record)
Season index t: 1946 Winter = 1 (Jan–Mar), Spring 2, Summer 3, Autumn 4, ...
Run: python3 tools/extract-history.py   (from prototype/web)
"""
import json, glob, math, pathlib
HERE=pathlib.Path(__file__).resolve().parent.parent
RAW=sorted(glob.glob(str(HERE/'../../data/raw/hurdat2-*.txt')))
def season(y,m): return (y-1946)*4 + (m-1)//3 + 1
def doq(y,m,d):   # fraction through the quarter, 0..1
    m0=((m-1)//3)*3+1; days=92; return min(1,max(0,((m-m0)*30.5+d-1)/days))

PORTS=[("MIAMI",25.8,-80.2),("HAVANA",23.1,-82.4),("NEW ORLEANS",30.0,-90.1),("GALVESTON",29.3,-94.8),
 ("SAN JUAN",18.5,-66.1),("KINGSTON",18.0,-76.8),("HAMILTON",32.3,-64.8),("CAPE HATTERAS",35.2,-75.7),
 ("BOSTON",42.4,-71.0),("HALIFAX",44.6,-63.6),("TAMPICO",22.2,-97.9),("BELIZE",17.5,-88.2),("NASSAU",25.0,-77.4),
 ("CHARLESTON",32.8,-79.9),("BROWNSVILLE",25.9,-97.5),("SANTO DOMINGO",18.5,-69.9),("VERACRUZ",19.2,-96.1),
 ("ST. JOHN'S",47.6,-52.7),("PORT OF SPAIN",10.7,-61.5)]
def nearest_port(pts):
    best=None
    for la,lo in pts:
        for n,pa,po in PORTS:
            d=math.hypot(la-pa,(lo-po)*math.cos(math.radians(la)))
            if best is None or d<best[0]: best=(d,n)
    return best[1]
def cat(kt): return 5 if kt>=137 else 4 if kt>=113 else 3 if kt>=96 else 2 if kt>=83 else 1

storms=[]
if RAW:
    L=open(RAW[-1]).read().splitlines(); i=0
    while i<len(L):
        h=[x.strip() for x in L[i].split(',')]; sid,name,n=h[0],h[1],int(h[2]); i+=1
        rows=[]
        for k in range(n):
            r=[x.strip() for x in L[i+k].split(',')]
            la=float(r[4][:-1])*(1 if r[4][-1]=='N' else -1); lo=float(r[5][:-1])*(-1 if r[5][-1]=='W' else 1)
            w=int(r[6]) if r[6].lstrip('-').isdigit() else -99
            rows.append(dict(ymd=r[0],hh=r[1],rec=r[2],st=r[3],lat=la,lon=lo,w=w))
        i+=n
        y=int(sid[4:8])
        if not (1946<=y<=1955) or not any(r['st']=='HU' for r in rows): continue
        peak=max(r['w'] for r in rows)
        f,l=rows[0],rows[-1]
        y0,m0,d0=int(f['ymd'][:4]),int(f['ymd'][4:6]),int(f['ymd'][6:8])
        y1,m1,d1=int(l['ymd'][:4]),int(l['ymd'][4:6]),int(l['ymd'][6:8])
        t=season(y0,m0)
        # daily samples + every landfall + the peak
        keep=[j for j in range(len(rows)) if j%4==0 or rows[j]['rec']=='L' or rows[j]['w']==peak or j==len(rows)-1]
        track=[[round(rows[j]['lat'],1),round(rows[j]['lon'],1),rows[j]['w'],rows[j]['st'],1 if rows[j]['rec']=='L' else 0] for j in sorted(set(keep))]
        land=[r for r in rows if r['rec']=='L']
        dl=nearest_port([(r['lat'],r['lon']) for r in (land or rows)])
        storms.append(dict(id=sid,name=None if name=='UNNAMED' else name.title(),year=y0,t=t,
            p0=round(doq(y0,m0,d0),3),p1=round(doq(y1,m1,d1),3) if season(y1,m1)==t else 1.0,
            m0=m0,d0=d0,peak=peak,cat=cat(peak),landfall=bool(land),dl=dl,track=track))

# ---- authored geophysical canon (VERIFY dates/magnitudes vs GVP + USGS) ----
# climate: stratospheric loading as a GLOBAL harvest-stress forcing (the aerosol
# tool's natural analogue; 1946–55 had no Pinatubo — Hekla 1947 is the only one
# with any stratospheric reach). ash: local yield hits on mapped regions. vei: display.
E=lambda y,m,d,dur,name,lat,lon,dl,line,scale=1.0,vei=2,climate=0,climDur=0,ash=None: dict(t=season(y,m),dur=dur,name=name,pos=[lat,lon],dl=dl,line=line,scale=scale,vei=vei,climate=climate,climDur=climDur,ash=ash or [],date=f"{y}-{m:02d}-{d:02d}")
eruptions=[
 E(1946,1,1,4,"Sakurajima",31.6,130.7,"KAGOSHIMA","Sakurajima in eruption; lava reaches the sea at Kurokami. Kagoshima sweeps ash.",0.9,3),
 E(1946,1,1,25,"Paricutín",19.5,-102.25,"URUAPAN","Paricutín, the volcano that rose in a cornfield in 1943, still building its cone.",0.45,4),
 E(1947,3,29,5,"Hekla",64.0,-19.7,"REYKJAVÍK","Hekla erupts after a century's silence. Ash to thirty kilometres; the column is seen from Scotland.",1.35,4,0.3,3,[{"region":"North Sea Energy Shelf","mag":-0.1,"dur":1}]),
 E(1949,6,24,2,"Cumbre Vieja",28.6,-17.85,"SANTA CRUZ DE LA PALMA","Cumbre Vieja opens on La Palma. Lava reaches the western coast.",0.7,2),
 E(1950,6,1,1,"Mauna Loa",19.5,-155.6,"HILO","Mauna Loa's largest eruption in a lifetime. Lava crosses the coast road in three hours.",0.6,0),
 E(1950,11,25,5,"Etna",37.7,15.0,"CATANIA","Etna's longest flank eruption in living memory begins. Milo threatened.",0.9,3),
 E(1951,1,21,2,"Lamington",-8.95,148.15,"PORT MORESBY","Mount Lamington explodes without warning. The Higaturu district is gone.",1.25,4,0.1,2),
 E(1952,9,17,2,"Myōjin-shō",31.9,140.0,"TOKYO","A submarine volcano surfaces south of Tokyo and destroys the survey ship sent to study it. No survivors.",0.8,2),
 E(1953,7,9,1,"Mount Spurr",61.3,-152.25,"ANCHORAGE","Spurr erupts; a quarter-inch of ash on Anchorage by afternoon.",0.9,4),
 E(1953,12,24,1,"Ruapehu",-39.3,175.6,"WELLINGTON","Ruapehu's crater lake bursts. The lahar takes the Tangiwai rail bridge with the Wellington express on it.",0.6,2),
 E(1954,1,18,1,"Merapi",-7.5,110.4,"YOGYAKARTA","Merapi's dome collapses. Pyroclastic flows into the villages on the south flank.",0.8,3,0,0,[{"region":"Southeast Asia","mag":-0.12,"dur":1}]),
 E(1955,2,28,2,"Kīlauea",19.4,-155.0,"HILO","Kīlauea's east rift opens through the cane fields of Puna. Twenty-one homes lost.",0.6,0),
 E(1955,10,22,1,"Bezymianny",55.97,160.6,"PETROPAVLOVSK","A volcano the maps called extinct wakes in Kamchatka. The Soviets say nothing.",1.0,3,0.15,2),
]
Q=lambda y,m,d,mag,name,lat,lon,dl,line: dict(t=season(y,m),mag=mag,name=name,pos=[lat,lon],dl=dl,line=line,date=f"{y}-{m:02d}-{d:02d}")
quakes=[
 Q(1946,4,1,8.6,"Aleutian Islands",52.8,-163.5,"HILO","Aleutian earthquake, M8.6. The tsunami reaches Hilo five hours later, unannounced. 159 dead."),
 Q(1946,6,23,7.3,"Vancouver Island",49.8,-125.3,"VICTORIA","Vancouver Island earthquake, M7.3. Chimneys down across the strait."),
 Q(1946,8,4,8.0,"Hispaniola",19.3,-69.0,"SANTO DOMINGO","Earthquake M8.0 off the Samaná peninsula. Tsunami at Matanzas."),
 Q(1946,12,21,8.1,"Nankai",33.0,135.6,"OSAKA","Nankai earthquake, M8.1. Tsunami along the Kii coast; 1,300 dead."),
 Q(1948,6,28,7.1,"Fukui",36.2,136.2,"FUKUI","Fukui earthquake, M7.1. The city, rebuilt after the war, is flattened again. 3,700 dead."),
 Q(1948,10,6,7.3,"Ashgabat",37.95,58.3,"ASHKHABAD","Earthquake M7.3 under Ashkhabad. The Soviet press reports damage. The death toll is a state secret."),
 Q(1949,8,5,6.8,"Ambato",-1.2,-78.4,"QUITO","Ambato earthquake, M6.8. Mountain towns buried by landslides; 5,000 dead."),
 Q(1949,8,22,8.1,"Queen Charlotte",53.6,-133.3,"PRINCE RUPERT","Queen Charlotte earthquake, M8.1 — Canada's largest on record."),
 Q(1950,8,15,8.6,"Assam–Tibet",28.4,96.5,"SHILLONG","Assam–Tibet earthquake, M8.6. Whole hillsides into the Brahmaputra; the river dams, then breaks."),
 Q(1951,10,22,7.3,"Hualien",23.9,121.7,"TAIPEI","Earthquake series off Hualien, M7.3. The east-coast rail line cut."),
 Q(1952,7,21,7.3,"Kern County",35.0,-119.0,"BAKERSFIELD","Kern County earthquake, M7.3. Tehachapi in ruins; the Southern Pacific tunnels collapsed."),
 Q(1952,11,4,9.0,"Kamchatka",52.75,159.5,"PETROPAVLOVSK","Kamchatka earthquake, M9.0. Tsunami across the Pacific; Hilo flooded again. Severo-Kurilsk erased — Moscow does not report it."),
 Q(1953,3,18,7.3,"Yenice–Gönen",40.0,27.3,"ISTANBUL","Yenice–Gönen earthquake, M7.3, south of the Marmara."),
 Q(1954,9,9,6.7,"Orléansville",36.3,1.5,"ALGIERS","Orléansville earthquake, M6.7. 1,250 dead in the Chélif valley."),
]
# ---- weather disasters on the record (authored), mapped to prototype regions ----
W=lambda y,m,dur,region,kind,dl,line,unmade,worse: dict(t=season(y,m),dur=dur,region=region,kind=kind,dl=dl,line=line,unmade=unmade,worse=worse,date=f"{y}-{m:02d}")
weather=[
 W(1946,7,3,"Black Sea Steppe","drought","KIEV","Drought across the Ukraine and Moldavia. The harvest fails; Moscow keeps exporting grain.",
   "The drought the Ukraine expected did not come. The harvest holds. Moscow exports anyway.",
   "Drought across the Ukraine, worse than any on record. The villages stop reporting."),
 W(1947,1,1,"North Sea Energy Shelf","cold","LONDON","The coldest winter in a century locks Britain in ice. Coal cannot move; the lights go out.",
   "A mild winter on the North Sea. The coal moves; the grid holds.",
   "The worst winter in three centuries. Britain's coal is under snow; the ports freeze."),
 W(1949,1,1,"North American Plains","blizzard","OMAHA","Blizzards bury the Plains. Operation Haylift drops feed to cattle from Air Force transports.",
   "A dry, open winter on the Plains. The cattle come through.",
   "The Plains blizzards do not stop. Herds lost by the hundred thousand; Haylift cannot keep up."),
 W(1950,4,2,"Eastern Australia","flood","SYDNEY","The wettest year on record in New South Wales. The Hunter and the Macquarie over their banks for months.",
   "The rains that were forecast for New South Wales never arrive. A dry, ordinary year.",
   "Floods in New South Wales beyond anything recorded. Maitland underwater a second time."),
 W(1950,7,2,"South Asia","flood","SHILLONG","The Brahmaputra, dammed by the earthquake's landslides, breaks through. Assam under water.",
   "The Brahmaputra stays low after the earthquake. Assam is spared.",
   "The Brahmaputra floods on a scale no gauge can measure. Assam is an inland sea."),
 W(1951,7,1,"North American Plains","flood","KANSAS CITY","The Kansas and Missouri rivers over their levees. The Kansas City stockyards under fifteen feet of water.",
   "The Kansas River stays in its banks. A quiet July.",
   "The Kansas and Missouri floods run for weeks. Both cities' stockyards are gone."),
 W(1953,1,1,"North Sea Energy Shelf","flood","THE HAGUE","The North Sea storm surge breaks the dikes of Zeeland and the Thames sea walls. 2,500 dead in a night.",
   "The February gale passes over the North Sea without a surge. The dikes hold. Nobody knows how close it came.",
   "The North Sea surge overtops every dike from Zeeland to the Humber. The count stops at five thousand."),
 W(1954,1,4,"North American Plains","drought","AMARILLO","Third year of drought in Texas and the southern Plains. Worse than the Thirties, the old men say.",
   "The rains return to the southern Plains. The drought the almanacs feared breaks a year early.",
   "The southern Plains drought deepens. Dust over Amarillo again, thirty years on."),
]
out=dict(note="storms: HURDAT2 (NOAA/NHC, public domain), hurricanes only. eruptions/quakes/weather: authored from general knowledge — VERIFY dates, magnitudes, tolls against Smithsonian GVP, USGS/ISC, and period press before v0.1.",
         storms=storms,eruptions=eruptions,quakes=quakes,weather=weather)
(HERE/'history.json').write_text(json.dumps(out,separators=(',',':'),ensure_ascii=False))
print(f"history.json: {len(storms)} hurricanes, {len(eruptions)} eruptions, {len(quakes)} quakes, {len(weather)} weather events · {len(json.dumps(out))//1024} KB")
print('storms per season:', {t:sum(1 for s in storms if s['t']==t) for t in sorted(set(s['t'] for s in storms))})
