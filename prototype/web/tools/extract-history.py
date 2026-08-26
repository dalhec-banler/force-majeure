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
        # consequential only (author rule): it came ashore, or it was a major
        # hurricane that passed within reach of a coast (a port under 300 km)
        near=min(min(math.hypot(r['lat']-pa,(r['lon']-po)*math.cos(math.radians(r['lat']))) for n,pa,po in PORTS) for r in rows)
        if not land and not (peak>=96 and near<2.7): continue
        dl=nearest_port([(r['lat'],r['lon']) for r in (land or rows)])
        storms.append(dict(id=sid,name=None if name=='UNNAMED' else name.title(),year=y0,t=t,
            p0=round(doq(y0,m0,d0),3),p1=round(doq(y1,m1,d1),3) if season(y1,m1)==t else 1.0,
            m0=m0,d0=d0,peak=peak,cat=cat(peak),landfall=bool(land),dl=dl,track=track))

# ---- IBTrACS (NOAA NCEI, public domain): the other basins ----
# WP and EP carry JTWC winds and names from 1945; NI, SI, SP carry real tracks
# but no wind measurements before the satellite era — those render as cyclones
# of unrecorded strength (cat 0), never an invented category.
BASIN_PORTS={
 'WP':[("TOKYO",35.7,139.7),("OSAKA",34.7,135.5),("KAGOSHIMA",31.6,130.6),("NAHA",26.2,127.7),("TAIPEI",25.0,121.5),("HONG KONG",22.3,114.2),
       ("SHANGHAI",31.2,121.5),("MANILA",14.6,121.0),("CEBU",10.3,123.9),("HAIPHONG",20.9,106.7),("HAINAN",20.0,110.3),("GUAM",13.5,144.8),("FUZHOU",26.1,119.3),("SAPPORO",43.1,141.3)],
 'EP':[("ACAPULCO",16.9,-99.9),("MANZANILLO",19.1,-104.3),("MAZATLÁN",23.2,-106.4),("LA PAZ",24.1,-110.3),("PUERTO VALLARTA",20.6,-105.2),("SALINA CRUZ",16.2,-95.2)],
 'NI':[("CALCUTTA",22.6,88.4),("DACCA",23.7,90.4),("CHITTAGONG",22.3,91.8),("MADRAS",13.1,80.3),("BOMBAY",19.1,72.9),("KARACHI",24.9,67.0),("RANGOON",16.8,96.2),("VISAKHAPATNAM",17.7,83.3),("MASULIPATAM",16.2,81.1)],
 'SI':[("PORT HEDLAND",-20.3,118.6),("DARWIN",-12.5,130.8),("PERTH",-32.0,115.9),("BROOME",-18.0,122.2),("TAMATAVE",-18.2,49.4),("BEIRA",-19.8,34.9),("PORT LOUIS",-20.2,57.5),("SAINT-DENIS",-20.9,55.5)],
 'SP':[("BRISBANE",-27.5,153.0),("TOWNSVILLE",-19.3,146.8),("CAIRNS",-16.9,145.8),("NOUMÉA",-22.3,166.4),("SUVA",-18.1,178.4),("AUCKLAND",-36.9,174.8),("PORT VILA",-17.7,168.3)],
}
def ibtracs(basin):
    import csv
    f=HERE/f'../../data/raw/ibtracs.{basin}.list.v04r01.csv'
    if not f.exists(): return []
    rd=csv.reader(open(f)); hdr=next(rd); next(rd); ix={h:i for i,h in enumerate(hdr)}
    S={}
    for r in rd:
        try: yr=int(r[ix['SEASON']])
        except: continue
        if yr>1956: break
        if yr<1946 or yr>1955: continue
        sid=r[ix['SID']]
        w=-1
        for k in ('USA_WIND','WMO_WIND'):
            v=r[ix[k]].strip()
            try: w=max(w,float(v))
            except: pass
        try: la=float(r[ix['LAT']]); lo=float(r[ix['LON']])
        except: continue
        s=S.setdefault(sid,dict(name=r[ix['NAME']],rows=[]))
        s['rows'].append(dict(iso=r[ix['ISO_TIME']],lat=la,lon=lo,w=w,nat=r[ix['NATURE']],lf=r[ix['LANDFALL']].strip()))
    out=[]
    for sid,s in S.items():
        rows=s['rows']
        if len(rows)<8: continue
        peak=max(r['w'] for r in rows)
        winds=peak>0
        if winds and peak<64: continue                      # measured, and never a hurricane
        if not winds and (len(rows)<12 or not any(r['nat']=='TS' for r in rows)): continue
        f0,l0=rows[0],rows[-1]
        y0,m0,d0=int(f0['iso'][:4]),int(f0['iso'][5:7]),int(f0['iso'][8:10])
        y1,m1=int(l0['iso'][:4]),int(l0['iso'][5:7])
        t=season(y0,m0)
        if t<1 or t>40: continue
        keep=[j for j in range(len(rows)) if j%4==0 or rows[j]['w']==peak or j==len(rows)-1 or rows[j]['lf']=='0']
        track=[[round(rows[j]['lat'],1),round(rows[j]['lon'],1),int(rows[j]['w']) if rows[j]['w']>0 else 0,rows[j]['nat'],1 if rows[j]['lf']=='0' else 0] for j in sorted(set(keep))]
        land=[r for r in rows if r['lf']=='0']
        near=min(min(math.hypot(r['lat']-pa,(r['lon']-po)*math.cos(math.radians(r['lat']))) for n,pa,po in BASIN_PORTS[basin]) for r in rows)
        if not land and not (peak>=96 and near<2.7): continue      # consequential only
        pts=[(r['lat'],r['lon']) for r in (land or rows)]
        best=None
        for la,lo in pts:
            for n,pa,po in BASIN_PORTS[basin]:
                d=math.hypot(la-pa,(lo-po)*math.cos(math.radians(la)))
                if best is None or d<best[0]: best=(d,n)
        nm=s['name'].strip()
        name=None if nm in ('NOT_NAMED','UNNAMED','') else nm.title()
        out.append(dict(id=sid,basin=basin,name=name,year=y0,t=t,p0=round(doq(y0,m0,d0),3),
            p1=round(doq(y1,m1,int(l0['iso'][8:10])),3) if season(y1,m1)==t else 1.0,
            m0=m0,d0=d0,peak=int(peak) if winds else 0,cat=cat(peak) if winds else 0,landfall=bool(land),dl=best[1],track=track))
    return out
for b in ('WP','EP','NI','SI','SP'): storms.extend(ibtracs(b))
for s in storms:
    if 'basin' not in s: s['basin']='NA'

# ---- authored geophysical canon (VERIFY dates/magnitudes vs GVP + USGS) ----
# climate: stratospheric loading as a GLOBAL harvest-stress forcing (the aerosol
# tool's natural analogue; 1946–55 had no Pinatubo — Hekla 1947 is the only one
# with any stratospheric reach). ash: local yield hits on mapped regions. vei: display.
E=lambda y,m,d,dur,name,lat,lon,dl,line,scale=1.0,vei=2,climate=0,climDur=0,ash=None,toll=0: dict(t=season(y,m),dur=dur,name=name,pos=[lat,lon],dl=dl,line=line,scale=scale,vei=vei,climate=climate,climDur=climDur,ash=ash or [],toll=toll,date=f"{y}-{m:02d}-{d:02d}")
eruptions=[
 E(1946,1,1,4,"Sakurajima",31.6,130.7,"KAGOSHIMA","Sakurajima in eruption; lava reaches the sea at Kurokami. Kagoshima sweeps ash.",0.9,3,0,0,[{"region":"Japan (Kanto–Kansai)","mag":-0.05,"dur":1}]),
 # no consequence (cone-building only by 1946) — dropped per author rule: E(1946,1,1,25,"Paricutín",19.5,-102.25,"URUAPAN","Paricutín, the volcano that rose in a cornfield in 1943, still building its cone.",0.45,4),
 E(1947,3,29,5,"Hekla",64.0,-19.7,"REYKJAVÍK","Hekla erupts after a century's silence. Ash to thirty kilometres; the column is seen from Scotland.",1.35,4,0.3,3,[{"region":"North Sea Energy Shelf","mag":-0.1,"dur":1}]),
 E(1949,6,24,2,"Cumbre Vieja",28.6,-17.85,"SANTA CRUZ DE LA PALMA","The San Juan eruption opens on La Palma's Cumbre Vieja on the saint's day. Thirty-seven days; lava to the western coast.",0.7,2),
 E(1950,6,1,1,"Mauna Loa",19.5,-155.6,"HILO","Mauna Loa's largest eruption in a lifetime. Lava crosses the coast road in three hours.",0.6,0),
 E(1950,11,25,5,"Etna",37.7,15.0,"CATANIA","Etna's longest flank eruption in living memory begins. Milo threatened.",0.9,3),
 E(1951,1,21,2,"Lamington",-8.95,148.15,"PORT MORESBY","Mount Lamington explodes without warning. The Higaturu district is gone; 2,942 dead.",1.25,4,0.1,2,toll=2942),
 E(1952,9,17,2,"Myōjin-shō",31.9,140.0,"TOKYO","A submarine volcano surfaces south of Tokyo and destroys the survey ship sent to study it. No survivors.",0.8,2,toll=31),
 E(1953,7,9,1,"Mount Spurr",61.3,-152.25,"ANCHORAGE","Spurr erupts; a quarter-inch of ash on Anchorage by afternoon.",0.9,4),
 E(1953,12,24,1,"Ruapehu",-39.3,175.6,"WELLINGTON","Ruapehu's crater lake bursts. The lahar takes the Tangiwai rail bridge with the Wellington express on it.",0.6,2,toll=151),
 # no consequence (toll unverified) — dropped per author rule: E(1954,1,18,1,"Merapi",-7.5,110.4,"YOGYAKARTA","Merapi's dome collapses; pyroclastic flows down the south flank toward the villages.",0.7,2,0,0,[{"region":"Southeast Asia","mag":-0.06,"dur":1}]),   # 1953–54 eruption per GVP; toll unverified
 E(1955,2,28,2,"Kīlauea",19.4,-155.0,"HILO","Kīlauea's east rift opens through the cane fields of lower Puna — twenty-four vents in eighty-eight days. The coast from Kalapana to Kapoho evacuated.",0.6,0),
 # no consequence (remote, no damage) — dropped per author rule: E(1946,11,9,1,"Sarychev Peak",48.1,153.2,"PETROPAVLOVSK","Sarychev Peak erupts in the Kurils, VEI 4. Ash across the Sea of Okhotsk; the Soviet garrisons say nothing.",1.0,4,0.1,2),
 E(1951,8,31,1,"Kelud",-7.93,112.3,"SURABAYA","Kelud erupts in East Java, VEI 4. Ash on the rice terraces from Kediri to Malang.",1.0,4,0.08,2,[{"region":"Southeast Asia","mag":-0.1,"dur":1}],toll=7),
 # no consequence (remote, no damage) — dropped per author rule: E(1952,2,29,2,"Bagana",-6.14,155.2,"RABAUL","Bagana in eruption on Bougainville, VEI 4. Ash on the copra plantations.",0.9,4),
 # no consequence (the damaging blast is March 1956) — dropped per author rule: E(1955,10,22,1,"Bezymianny",55.97,160.6,"PETROPAVLOVSK","A volcano the maps called extinct wakes in Kamchatka. The Soviets say nothing.",1.0,3,0.15,2),
]
# hit: canon economic damage to a mapped region (tsunami, collapse) — untouchable
Q=lambda y,m,d,mag,name,lat,lon,dl,line,hit=None,toll=0: dict(t=season(y,m),mag=mag,name=name,pos=[lat,lon],dl=dl,line=line,hit=hit or [],toll=toll,date=f"{y}-{m:02d}-{d:02d}")
quakes=[   # MAJOR only (author rule): destroyed a city, killed by the thousand, or M8+ with a tsunami.
           # Verified against the Wikipedia yearly lists (USGS-derived), 2026-08-25.
 Q(1946,4,1,8.6,"Aleutian Islands",52.8,-163.5,"HILO","Aleutian earthquake, M8.6. The tsunami reaches Hilo five hours later, unannounced. 167 dead — most of them in Hawaii.",[{"region":"Hawaiian Islands","mag":-0.35,"dur":1}],toll=167),
 Q(1946,8,4,8.0,"Samaná Bay",19.3,-69.0,"SANTO DOMINGO","Earthquake M8.0 off the Samaná peninsula. The tsunami takes Matanzas; 1,800 dead.",toll=1800),
 Q(1946,11,10,7.3,"Ancash",-8.3,-77.8,"LIMA","Ancash earthquake in the Peruvian Andes. Landslides bury the valleys; 1,400 dead.",[{"region":"Andean Copper Belt","mag":-0.05,"dur":1}],toll=1400),
 Q(1946,12,21,8.1,"Nankai",33.0,135.6,"OSAKA","Nankai earthquake, M8.1. Tsunami along the Kii coast; 1,362 dead, 36,000 homes gone.",[{"region":"Japan (Kanto–Kansai)","mag":-0.2,"dur":1}],toll=1362),
 Q(1948,6,28,6.8,"Fukui",36.2,136.2,"FUKUI","Fukui earthquake, M6.8. The city, rebuilt after the war, is flattened again. 5,131 dead; 63,000 homes.",[{"region":"Japan (Kanto–Kansai)","mag":-0.15,"dur":1}],toll=5131),
 Q(1948,10,5,7.3,"Ashgabat",37.95,58.3,"ASHKHABAD","Earthquake M7.3 under Ashkhabad. The Soviet press reports damage. The toll — 110,000 — will be a state secret for forty years.",toll=110000),
 Q(1949,7,10,7.5,"Khait",39.2,70.8,"STALINABAD","Khait earthquake, M7.5, in the Tajik SSR. Landslides bury the valleys; 12,000 dead. Moscow says nothing.",toll=12000),
 Q(1949,8,5,6.5,"Ambato",-1.2,-78.4,"QUITO","Ambato earthquake, M6.5. Mountain towns buried by landslides; 6,000 dead.",[{"region":"Andean Copper Belt","mag":-0.05,"dur":1}],toll=6000),
 Q(1950,8,15,8.6,"Assam–Tibet",28.4,96.5,"SHILLONG","Assam–Tibet earthquake, M8.6, among the largest ever recorded. Whole hillsides into the Brahmaputra; 1,530 dead. The river dams, then breaks.",toll=1530),
 Q(1951,5,6,6.5,"Jucuapa",13.5,-88.4,"SAN SALVADOR","Jucuapa earthquake in El Salvador. The town levelled; 1,100 dead.",toll=1100),
 Q(1952,3,4,8.1,"Tokachi",42.2,143.9,"SAPPORO","Tokachi earthquake, M8.1, off Hokkaido. The tsunami takes 2,400 homes along the coast.",[{"region":"Japan (Kanto–Kansai)","mag":-0.08,"dur":1}],toll=33),
 Q(1952,7,21,7.5,"Kern County",35.0,-119.0,"BAKERSFIELD","Kern County earthquake, M7.5 — the largest in the lower forty-eight in fifty years. Tehachapi in ruins; the Southern Pacific tunnels collapsed.",[{"region":"California Central Valley","mag":-0.12,"dur":1}],toll=12),
 Q(1952,11,4,9.0,"Kamchatka",52.75,159.5,"PETROPAVLOVSK","Kamchatka earthquake, M9.0. Tsunami across the Pacific; Hilo flooded again. Severo-Kurilsk erased, 2,300 dead — Moscow does not report it.",[{"region":"Hawaiian Islands","mag":-0.15,"dur":1}],toll=2336),
 Q(1953,3,18,7.3,"Yenice–Gönen",40.0,27.3,"ISTANBUL","Yenice–Gönen earthquake, M7.3, south of the Marmara. 1,070 dead.",[{"region":"Mediterranean Basin","mag":-0.05,"dur":1}],toll=1070),
 Q(1954,9,9,6.7,"Orléansville",36.3,1.5,"ALGIERS","Orléansville earthquake, M6.7. 1,243 dead in the Chélif valley.",[{"region":"Mediterranean Basin","mag":-0.06,"dur":1}],toll=1243),
]
# ---- weather disasters on the record (authored), mapped to prototype regions ----
# kinds: flood/typhoon/cyclone/locusts push WET (+); drought/famine/cold/blizzard/fire/avalanche push DRY (−).
# epidemic and tornado are canon: they happen as recorded whatever the player did.
W=lambda y,m,dur,region,kind,dl,line,unmade,worse,toll=0: dict(t=season(y,m),dur=dur,region=region,kind=kind,dl=dl,line=line,unmade=unmade,worse=worse,toll=toll,date=f"{y}-{m:02d}")
C=lambda y,m,region,kind,dl,line,toll=0: dict(t=season(y,m),dur=1,region=region,kind=kind,dl=dl,line=line,canon=True,toll=toll,date=f"{y}-{m:02d}")
weather=[
 W(1946,7,3,"Black Sea Steppe","famine","KIEV","The worst drought since 1891 across the Ukraine and Moldavia. The harvest fails; Moscow exports grain anyway. A million will die by spring.",
   "The drought the Ukraine expected did not come. The harvest holds. Moscow exports anyway.",
   "Drought across the Ukraine, worse than any on record. The villages stop reporting.",toll=1000000),
 W(1947,1,1,"North Sea Energy Shelf","cold","LONDON","The coldest winter in a century locks Britain in ice. Coal cannot move; the lights go out.",
   "A mild winter on the North Sea. The coal moves; the grid holds.",
   "The worst winter in three centuries. Britain's coal is under snow; the ports freeze."),
 W(1949,1,1,"North American Plains","blizzard","OMAHA","Blizzards bury the Plains and the Great Basin. Operation Snowbound digs out Nebraska; Haylift's C-82s drop feed to a million cattle across Nevada.",
   "A dry, open winter on the Plains. The cattle come through.",
   "The Plains blizzards do not stop. Herds lost by the hundred thousand; Haylift cannot keep up."),
 W(1950,4,2,"Eastern Australia","flood","SYDNEY","The wettest year on record in New South Wales. The Hunter and the Macquarie over their banks for months.",
   "The rains that were forecast for New South Wales never arrive. A dry, ordinary year.",
   "Floods in New South Wales beyond anything recorded. Maitland underwater a second time."),
 W(1950,7,2,"South Asia","flood","SHILLONG","The Brahmaputra, dammed by the earthquake's landslides, breaks through. Assam under water.",
   "The Brahmaputra stays low after the earthquake. Assam is spared.",
   "The Brahmaputra floods on a scale no gauge can measure. Assam is an inland sea."),
 W(1951,7,1,"North American Plains","flood","KANSAS CITY","The Kansas and Missouri rivers over their levees — the highest since 1844. The Kansas City stockyards under water; 518,000 displaced.",
   "The Kansas River stays in its banks. A quiet July.",
   "The Kansas and Missouri floods run for weeks. Both cities' stockyards are gone.",toll=17),
 W(1953,1,1,"North Sea Energy Shelf","flood","THE HAGUE","The North Sea storm surge breaks the dikes of Zeeland and the Thames sea walls. 2,500 dead in a night.",
   "The February gale passes over the North Sea without a surge. The dikes hold. Nobody knows how close it came.",
   "The North Sea surge overtops every dike from Zeeland to the Humber. The count stops at five thousand.",toll=2551),
 W(1954,1,4,"North American Plains","drought","AMARILLO","The fourth year of drought across Texas and the southern Plains — the worst on the state's record, and 1954 among its driest. Ranchers drive cattle north to Kansas; the drought follows them.",
   "The rains return to the southern Plains. The drought the almanacs feared breaks a year early.",
   "The southern Plains drought deepens. Dust over Amarillo again, thirty years on."),
 # --- Japan's typhoon decade (VERIFY vs JMA) ---
 W(1947,7,1,"Japan (Kanto–Kansai)","typhoon","TOKYO","Typhoon Kathleen breaks the Tone and Arakawa levees. The Kanto plain under water; 1,077 dead, 850 missing.",
   "The September typhoon turns east of Honshu. The Tone holds.","Typhoon Kathleen drowns the Kanto plain to the edge of Tokyo. The count passes two thousand.",toll=1077),
 W(1948,7,1,"Japan (Kanto–Kansai)","typhoon","TOKYO","Typhoon Ione ashore on Honshu after a Category 4 peak. Floods across the Kanto and Tohoku; 838 dead.",
   "Typhoon Ione passes offshore. Rain, and nothing more.","Typhoon Ione stalls over Honshu. The rivers of the Kanto go over their banks twice.",toll=838),
 W(1949,7,1,"Japan (Kanto–Kansai)","typhoon","TOKYO","Typhoon Kitty crosses the Kanto on the last night of August. Floods and landslides; 123 dead; fifteen billion yen.",
   "Typhoon Kitty weakens in the Sagami Sea. Tokyo gets a wet night.","Typhoon Kitty comes ashore on Tokyo Bay at full strength. The Kanto's rivers over their banks for the third year running.",toll=123),
 W(1949,7,1,"Yangtze Basin","typhoon","SHANGHAI","Typhoon Irma — the worst on Shanghai's record. Sixty-three thousand houses down; 1,600 dead.",
   "Typhoon Irma recurves east of the Yangtze mouth. Shanghai is spared.","Typhoon Irma drives the sea into Shanghai. The Bund under water; the toll passes three thousand.",toll=1600),
 W(1950,7,1,"Japan (Kanto–Kansai)","typhoon","OSAKA","Typhoon Jane across Shikoku and Kansai; the surge into Osaka Bay. 539 dead in the floods and slides.",
   "Typhoon Jane recurves short of Kansai. Osaka is spared.","Typhoon Jane puts Osaka Bay's surge into the city centre. The Hanshin industrial belt is offline for the quarter.",toll=539),
 W(1951,10,1,"Japan (Kanto–Kansai)","typhoon","YAMAGUCHI","Typhoon Ruth across Kyushu and Yamaguchi. Rivers over their banks; 572 dead, 221,000 homes, 9,600 boats.",
   "Typhoon Ruth stays at sea. The harvest comes in.","Typhoon Ruth takes the rice harvest of western Japan on the ground. Rationing tightens.",toll=572),
 W(1953,7,1,"Japan (Kanto–Kansai)","typhoon","NAGOYA","Typhoon Tess, a Category 5 at sea, ashore in Aichi. 393 dead; Tokyo missed by a swerve.",
   "Typhoon Tess recurves short of Honshu. Nagoya gets a gale.","Typhoon Tess holds its course into Tokyo Bay. The capital takes a super typhoon head-on.",toll=393),
 W(1954,7,1,"Yangtze Basin","typhoon","HANGCHOW","Super Typhoon Ida ashore in Chekiang, the strongest of the year. 884 dead.",
   "Typhoon Ida recurves toward the Ryukyus. The coast is spared.","Typhoon Ida across the Yangtze delta at full strength. Shanghai's river wall breached.",toll=884),
 W(1954,7,1,"Japan (Kanto–Kansai)","typhoon","HAKODATE","Typhoon Marie sinks the ferry Toya Maru off Hakodate. 1,361 lost, 400 missing; five ships down in a night; Iwanai burns.",
   "Typhoon Marie weakens in the Sea of Japan. The Hakodate ferries sail.","Typhoon Marie crosses Hokkaido at full strength after the Tsugaru Strait takes the ferries. Sapporo's harvest is flattened.",toll=1361),
 # --- China ---
 W(1954,4,2,"Yangtze Basin","flood","WUHAN","The Yangtze at 29.7 metres at Wuhan — the highest on record — from June to September. Hubei under water; 33,000 dead with the plague that follows.",
   "The Yangtze stays in its banks. A wet year, not a fatal one.","The Yangtze breaks the Wuhan dike. The city is an island; the plain a sea.",toll=33000),
 # --- Europe ---
 W(1947,1,1,"Northern European Plain","cold","BERLIN","The winter of 1947. Berlin burns its furniture; the Rhine freezes; the potato clamps are ice.",
   "A mild winter across the plain. The clamps hold.","The winter of 1947, and worse: the canals frozen to April, the seed potatoes lost."),
 W(1953,1,1,"Northern European Plain","flood","THE HAGUE","The North Sea surge breaks Zeeland's dikes in the night. Eighteen hundred dead in the Netherlands.",
   "The February gale passes without a surge. Zeeland sleeps.","The surge tops every dike in Zeeland and South Holland. Rotterdam's cellars are under salt water.",toll=1836),
 W(1954,7,1,"Danube Basin","flood","VIENNA","The Danube within a hair of the 1899 mark at Vienna. The Austrian and Hungarian lowlands under water into August.",
   "The Danube rises, and stops short of the quays.","The Danube takes the plain from Linz to Budapest. The harvest is under it."),
 W(1951,1,1,"Mediterranean Basin","avalanche","CHUR","The Winter of Terror: 649 avalanches across the Alps. Andermatt hit six times in an hour; 265 dead, Austria and the Valais worst.",
   "An open Alpine winter. The passes stay clear.","Avalanches every day for a week from the Valais to the Tyrol. Whole villages dug out by hand.",toll=265),
 # --- North America ---
 C(1947,4,"North American Plains","tornado","WOODWARD","A tornado nearly two miles wide runs from the Texas panhandle through Woodward, Oklahoma. A hundred city blocks gone; 184 dead.",toll=184),
 C(1953,4,"North American Plains","tornado","WACO","Waco, Flint, Worcester: three tornadoes in four weeks each kill more than ninety. The deadliest spring on record.",toll=324),
 W(1950,4,2,"Canadian Prairies","fire","GRANDE PRAIRIE","The Chinchaga fire, the largest in North America's record, burns from June to October. Blue suns over New York and Edinburgh; Toronto's streetlights come on at noon.",
   "A wet spring in the Peace country. The fire season never starts.","The Chinchaga fire and a dozen more. The northern plains under smoke till the snow."),
 W(1955,10,1,"California Central Valley","flood","SACRAMENTO","Christmas floods across the Central Valley. The Feather levee breaks at Shanghai Bend on Christmas Eve; Yuba City under twenty feet; 74 dead.",
   "A dry December in the valley. The reservoirs wait for snow.","The Feather and the Yuba take the whole north valley at Christmas. Sacramento's levees hold by inches.",toll=74),
 C(1952,7,"North American Plains","epidemic","NEW YORK","Polio's worst year: 57,000 cases across the United States. Swimming pools closed; the iron lungs are full.",toll=3145),
 # --- Africa and the Middle East ---
 C(1947,7,"Nile Delta","epidemic","CAIRO","Cholera out of al-Qurayn, through the Delta. A thousand cases a day by October; ten thousand dead by December.",toll=10277),
 W(1949,7,8,"Nile Delta","locusts","CAIRO","The desert locust rises from the Red Sea coasts. The plague will run four years, from the Delta to the Punjab.",
   "The locust breeding grounds are dry. The swarms never form.","Locusts across the Delta, the Sahel and Arabia in numbers no one has recorded. The FAO calls it a plague."),
 # dropped 2026-08-26: no source for a 1951 Sahel wave (the FAO plague years 1949–63 are confirmed; the Sahel timing was inference)
 # --- Asia ---
 W(1950,10,2,"South Asia","drought","DELHI","Floods, then a failed monsoon, across Bihar and Rajasthan. India tells Washington it must import six million tons of grain and cannot pay for two.",
   "The monsoon arrives on time in Bihar. The wheat loan is not needed.","The monsoon fails from Rajasthan to Bengal. The ration is cut to the bone."),
 W(1955,10,1,"South Asia","flood","LAHORE","The Punjab rivers in flood together. Lahore's suburbs under water; the wheat sowing lost.",
   "The Punjab rivers stay low into October.","The five rivers of the Punjab flood at once. Lahore cut off for a week."),
]
out=dict(note="storms: HURDAT2 (NOAA/NHC, public domain), hurricanes only. eruptions/quakes/weather: authored from general knowledge — VERIFY dates, magnitudes, tolls against Smithsonian GVP, USGS/ISC, and period press before v0.1.",
         storms=storms,eruptions=eruptions,quakes=quakes,weather=weather)
(HERE/'history.json').write_text(json.dumps(out,separators=(',',':'),ensure_ascii=False))
print(f"history.json: {len(storms)} hurricanes, {len(eruptions)} eruptions, {len(quakes)} quakes, {len(weather)} weather events · {len(json.dumps(out))//1024} KB")
print('storms per season:', {t:sum(1 for s in storms if s['t']==t) for t in sorted(set(s['t'] for s in storms))})
