# ADR-0025: The board grows — sixteen regions in 1946, thirty-six by 2010

**Status:** Accepted · 2026-08-26 (author: "it was a much simpler world in
1946 … maybe the game starts with 16 or so regions or points of attack,
and as time goes on, more and more places come online")

## Decision (engine opt `eras`; regions carry `from`)
1946: North American Plains, Black Sea Steppe, La Plata Basin, South
Asia, Southeast Asia, Eastern Australia, Canadian Prairies, Northern
European Plain, Danube Basin, Mediterranean Basin, North China Plain,
Yangtze Basin, Manchurian Plain, Gulf Coast, Panama Canal, California.

Then on their own dates: Murray–Darling 1949 (Snowy scheme), Persian Gulf
Terminals 1951, Nile Delta 1952, Kazakh Virgin Lands 1954, Hawaii 1959,
Japan 1960, Sahel 1960, Horn of Africa 1960, Southern African Maize 1961,
Andean Copper 1966, Pilbara 1966, Ganges Delta Ports 1971, North Sea
1975, Malacca 1980, Cerrado 1980, Siberian Gas 1984, Taiwan Strait 1987,
Mekong Delta 1989, Congo Cobalt 2006, Arctic Shelf 2010.

A region not yet on the board grows nothing anyone trades (yield 100),
weighs nothing in supply or severity (shares renormalise over the online
set each season), cannot be targeted (refused: `offline`), has no wires
to reveal, and is not drawn. It arrives with a dateline on the wire.

## Consequences
Severity and the traded index keep their scale at any board size. The
tutorial world is legible; the situation room is crowded. Dates are
broad-brush anchors (independence, a pipeline, a port, a foundry) — they
are content, tunable in `build.py`.
