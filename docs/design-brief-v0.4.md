# FORCE MAJEURE
### High-Level Design Brief — v0.4

*Working title. Alternates: DECLASSIFIED, ACT OF GOD, THE ANOMALY BUDGET, NATURAL VARIABILITY.*
*"Force majeure" is the contract-law term for acts of God that void obligation — precisely what the player manufactures.*

**Changes from v0.3:** Nation starts added as the difficulty system (§20). Political map now evolves from real to fictional across the century (§19). Art direction doctrine expanded into a full section (§15). Section numbering shifted from §15 onward.

**Changes from v0.2:** Campaign now runs 1946–2060 (§5), with the widening variance envelope as the difficulty curve and the timeline as the tutorial. Full disaster taxonomy added (§11). Attribution converted from dice to an accumulating evidence dossier (§7.4). Divergence rule and geophysical-canon exception added to content rules (§19). Instrument-feedback principle added for presentation (§14). Tone doctrine expanded with three anti-didacticism rules (§4). Succession mechanic considered and rejected. Companion artifact: `force-majeure-prototype.xlsx`.

---

## 1. One-Liner

A global strategy game spanning 1946 to 2060 in which you direct a state environmental warfare program — weather modification, geophysical intervention, orbital energy weapons, engineered biology — to make your homeland prosper and your rivals fail, while ensuring no one can ever prove you did.

**Genre:** Grand strategy / simulation, single-player.
**Theoretical frame:** Schelling. Signaling under incomplete information, iterated prisoner's dilemma with a noisy channel, tragedy of the commons, commitment devices.
**Reference set:** *Plague Inc* (invisible actor), *Twilight Struggle* (influence over territory), *Football Manager* (staggered long-horizon feedback), *Frostpunk* (climate as antagonist), *GTA* (beauty as complicity, satire aimed upward), *Deus Ex* (conspiracy played straight).

---

## 2. The Central Idea

You do not conquer territory. You do not command armies. You apply pressure to the planet's physical systems and let the consequences do political and economic work on your behalf.

The game is not *cause disasters*. The game is **cause disasters that read as natural.** Every intervention is a wager that the resulting event falls inside the envelope of what climatology says could have happened anyway.

---

## 3. Player Identity

**A state program.** A national environmental warfare directorate buried inside a defense or civil-resilience ministry.

- **Your constraint is legitimacy.** Sovereign budget, no profit motive — but you are an ENMOD signatory (from 1976), you answer to a legislature, and attribution is an act of war.
- **You hold a homeland and a portfolio.** One homeland: sovereign base, source of budget, the thing that can actually be invaded. Plus client states providing basing rights, funding, cover, and diplomatic protection — protected by contract, not duty. **Clients can be traded away. The homeland cannot.**
- **Continuous, not successive.** The player is the program, not a person. A generational-handoff mechanic was considered and rejected: an agency's defining property is that it *keeps records*, and inherited amnesia would contradict the declassification premise that the whole design rests on.

---

## 4. Tone Doctrine

### The Register
**A gorgeous, extremely dry workplace comedy about the end of the world, in which you are very good at your job.**

Institutional banality. *Dr. Strangelove*, not *Bond*. The player is a program director. There are quarterly reviews, appropriations hearings, a legal office, a narrative risk subcommittee. Disasters are line items. Famines appear as "yield variance."

Nobody in the game thinks they are a villain. That is not denial — they have reasons, and the reasons are often decent.

### The Load-Bearing Rules

**1. Pleasure in the operation, gravity in the outcome.**
The pleasure is the heist-film pleasure of *craft*: you pre-seeded the drying trend for six years, waited for a real El Niño to give you cover, and it landed inside the variance envelope and came back tagged NATURAL. That feeling is delicious and morally horrifying, and the player supplies the horror themselves. The game may be gleeful about competence. It is never gleeful about consequences. Outcome screens are quiet.

**2. Beauty as complicity.**
The game must be genuinely, seriously beautiful — a cyclone from orbit, an artificial aurora, the terminator line crossing a continent. Not beautiful *despite* being horrifying. Beautiful, full stop, and the player enjoys it. The aesthetic pleasure **is** the moral trap: you built that, and you are admiring your own work.

*Reference:* Starfish Prime's real 1962 artificial aurora, watched as a spectacle from Honolulu hotel rooftops. Sublime, an atrocity, and nobody watching was certain which.

**3. The game never moralizes. Not once.**
It presents, at scale, without comment. Every ounce of discomfort is manufactured by the player recognizing their own competence. A game that tells you it is bad has done the work for you and let you off the hook.

**4. The puncture rule.**
Occasionally the abstraction breaks — one unmediated human detail from the ground. A named person, a photograph, a local news clip. **Rare, unannounced, and never mechanically punished.** If it happens every operation it becomes moralizing wallpaper. If the game penalizes you, it has absolved you: you took the hit, you're square. It must cost nothing, change nothing, and simply be carried.

**5. Distance is the horror.**
You are a program director. You never see the ground. You see imagery, casualty estimates, and yield variance in a slide deck.

### The Anti-Didacticism Constraints

The target experience is a player realizing three hours in what they have actually been doing — arriving there unprompted, so that they own the conclusion. This fails the instant the game announces its subject. Three hard rules protect it:

**A. The game has no opinion about the player.** No morality meter, no guilt mechanic, no ending that judges. You are evaluated on tenure and results, exactly as your fictional agency would evaluate you. The only judgment available is the player's own.

**B. Suffering is never a resource the player spends deliberately.** Casualty figures appear in briefings as *information*, never as a slider or a cost being optimized against. The moment there is a "civilian deaths" number the player is minimizing, you have built a trolley problem — and trolley problems are how games moralize.

**C. Everyone in-game is sincere.** The legal office genuinely believes it ensures compliance. The journalist genuinely believes she is doing careful work. Halvorsen genuinely believes drought-tolerant cultivars help farmers — and they do. No winking. The horror is structural, not personal, and structural horror only reads if nobody in the structure is a cartoon.

**The subject is not climate change.** It is that the harm was already happening, and the player is simply doing it on purpose and faster. At some point the player notices that much of what the program achieves could be had by *doing nothing*, on a longer timescale. That is the moment. The game will never say it.

### Media as the Satirical Layer
GTA's tone lives in its radio. The equivalent here is **in-fiction media** — cheap to produce, enormously effective, mostly text and audio:

- **A conspiracy broadcaster who is correct about everything.** Every claim accurate, nobody believes him, and he is insufferable — which is *why* nobody believes him. The closest thing to a moral center, and players will find him annoying. That is the joke.
- **Corporate advertising** — Halvorsen drought-tolerant cultivars, airing warmly in a region you just dried out. Family-farm imagery. Entirely sincere.
- **Earnest climate journalism** doing careful attribution science and reaching the wrong conclusion.
- **Internal comms** — legal memos, narrative risk assessments, a colleague's retirement announcement.

### Art Direction Implication
Terminal green. Government form design. Redaction bars. Satellite imagery. Memo typography. The interface should feel like operating real equipment inside a real bureaucracy — while the globe view is unapologetically sublime.

---

## 5. Time Structure

**The campaign runs 1946 to roughly 2060.**

### Why 1946
In November 1946, Vincent Schaefer at General Electric dropped dry ice into a cloud over Massachusetts and made it snow. Bernard Vonnegut, in the same lab, found silver iodide worked better. That is ground zero for weather modification as a human capability — and Bernard's brother Kurt was in GE's public relations department at the time, which is roughly where Ice-Nine came from.

Opening in a Schenectady lab in 1946 makes the entire real institutional history the game's tech-tree timeline: Popeye in '67, Stormfury through the '60s and '70s, ENMOD arriving in '76 as a genuine mid-game rule change, SDI programs in the '80s, HAARP coming online in the '90s.

### The Difficulty Curve Is the Theme

| | Early game (1946–1975) | Late game (2030–2060) |
|---|---|---|
| Capability | Crude, cheap, weak | Enormous |
| Budget | Minimal | Substantial |
| **Variance envelope** | **Narrow** — climate is stable, anything anomalous is conspicuous | **Wide** — extremes are statistically ordinary |
| Deniability | Expensive | Cheap |

**And the player caused that.** A century of the energy ledger. The thing that makes the job easy in 2050 is the accumulated consequence of everything done since 1946. The theme is never stated — it is simply the difficulty curve.

### Onboarding as Chronology
**The timeline is the tutorial.** The player starts with two tools, a stable climate, and a tiny budget. Complexity accretes at exactly the rate they can absorb it. By the endgame they are running a system that would be incomprehensible presented cold.

This must hold at every level of the design, and it produces the chess-opening property: on a second run the player knows that the ocean thermal work in 1961 is *why* they had cover in 1998. **Early moves acquire meaning retroactively.** Every new system introduced late must have a legible ancestor introduced early.

### Variable Time Compression
A 1946–2060 campaign is roughly 460 seasonal turns, which is more than the design can carry at uniform resolution.

Early decades run fast and abstract — a handful of decisions per decade while the program is a lab with a budget line. Resolution increases as the program matures. By the near-future endgame the player is acting season by season.

This also mirrors the fiction: the early program genuinely did not do much.

### Real Data as Substrate
The background rhythm is drawn from observed records, not authored:

- **ONI / ENSO index** (1950–present) — the dominant teleconnection driver
- **PDO and AMO** — decadal oscillation records
- **ERA5 reanalysis** (1940–present) — gridded global climate
- **NOAA HURDAT** — every Atlantic hurricane since 1851
- **FAO crop yield data** — backbone of the food security layer
- **EM-DAT** — the international disaster database

**The player hides inside actual historical climate noise.** The El Niño you wait for is the one that really happened. That is authenticity that cannot be faked and does not have to be authored.

---

## 6. Core Pillars

Load-bearing. The game does not exist without these three.

### 6.1 Deniability as the Primary Resource
Every intervention leaves a signature. Efficacy and attribution risk sit on the same curve.

- A drought in the Sahel is cheap and nearly invisible — that region droughts anyway.
- A hurricane in the South Atlantic is devastating and screams intervention — that basin essentially never produces them.

This creates a **forensics layer** (rival agencies, atmospheric scientists, investigative journalists), a **counter-play layer** (manufacture plausibility by pre-seeding a decade of drying trend before you strike), and a loss condition that is not attrition: **you lose when the world proves it was you.**

### 6.2 The Energy Ledger
You cannot create or destroy energy in the atmosphere. You can only move it.

Suppress an Atlantic hurricane season and that heat surfaces elsewhere — probably in a monsoon you did not want strengthened. Cool one hemisphere with aerosols and you drag the ITCZ south, breaking agriculture in a region you were courting.

Every action becomes a puzzle rather than a button. **Consequences are conserved.**

### 6.3 Delayed, Displaced, Nonlinear Feedback
You nudge Pacific SSTs in March. Eighteen months later there is a wheat failure in a country you were not targeting and a currency crisis you may or may not have wanted.

**Delayed** (seasons to years), **displaced** (wrong country), **nonlinear** (chaotic in magnitude).

---

## 7. Simulation Architecture

### 7.1 The Teleconnection Graph
**Decision: a hand-authored influence graph, not a gridded atmospheric model.**

Rationale: genuine chaos is *unlearnable* — if the player cannot build a causal model, they are not playing a strategy game, they are receiving weather. It is also unbalanceable; you cannot tune emergence.

**The critical realization: player uncertainty does not require a chaotic system. It requires hidden state.** Poker is fully deterministic and bottomless. Uncertainty from incomplete information is cheap, tunable, and fair in a way chaos is not.

**Structure:**
- **Nodes** = regions, carrying climate state, production and consumption profiles, population and stability metrics.
- **Edges** = real climatological teleconnections with authored lag and coefficient — ENSO to the North American jet, Indian Ocean Dipole to East African rainfall, Atlantic SSTs to Sahel monsoon.
- It *feels* real because the relationships come from actual climate science. It is tunable because every edge is authored.

### 7.2 The Variance Envelope
Each node carries a per-season **natural range**, widening across the century. This single data structure serves realism and deniability simultaneously, because the attribution check reduces to: *does this outcome fall inside the envelope?*

### 7.3 Why the Fantasy Tier Works Mechanically
Tier-3 capabilities — orbital directed energy, ionospheric seismic coupling — **bypass the graph entirely.** They produce direct effects with no upstream physical cause.

> **Attribution is simply the question: can the graph explain this?**

Fantasy weapons are undeniable *because they are not physical*. The absurd tier and the core mechanic are the same system.

### 7.4 Attribution as Evidence, Not Dice
Each operation accretes a **hidden dossier**: anomaly residuals, a contractor's careless procurement, an inconvenient satellite pass, a sequenced genome. The total is never shown.

The player sees only symptoms, on a ladder:

1. Nothing. No one is looking.
2. A graduate student publishes an odd residual. Nobody cites it.
3. A wire journalist files an inquiry with the ministry.
4. An academic consortium announces an attribution study.
5. A rival service names your program in a classified brief.
6. Formal international investigation. Inspectors requested.
7. **Exposed.**

**Exposure becomes something you feel approaching rather than something you roll for.** This is more thematic than a dice check, and it is what makes containment spending a real decision rather than a tax.

### 7.5 Knowledge as Progression
The player begins seeing roughly 20% of the graph's edges. **Research reveals teleconnections.**

The tech tree is not primarily tools — it is *knowledge of how the world is wired*. Thematically exact, and it converts the design's largest risk — "I don't understand why that happened" — into the thing you spend the game defeating.

---

## 8. Turn Structure

**Seasonal ticks, five phases, hybrid reactivity.**

1. **Forecast** — projected state, variance envelopes, detected anomalies
2. **Commitment** — allocate capability, budget, contractor involvement. *Sealed.*
3. **Resolution** — the tick propagates; real-time playback, watchable or skippable
4. **Consequences** — outcomes land, including operations from 4–8 seasons back
5. **Attribution** — dossier accretion, rival analysis, press cycle

### The Reactivity Rule
You may intervene mid-resolution, but **reactive interventions cost far more attribution than planned ones** — you had no time to manufacture plausibility.

This punishes twitch play, rewards long pre-seeding strategies, and gives the adversary's bait mechanic real teeth: forcing you to react is forcing you to be sloppy.

### The Core Strategic Tension
**Consequences resolve on a longer horizon than your information. You must commit before you can know.**

---

## 9. The Strategic Economy

### 9.1 What Makes You Stronger

| Vector | Source | Character |
|---|---|---|
| **Budget** | Homeland economic health | A genuine self-interested reason to make your own region thrive |
| **Mandate** | Perceived global threat level | Political capital. Grows when the world looks dangerous |
| **Knowledge** | Research | Revealed graph edges. Compounding, permanent |
| **Reach** | Assets, basing rights, contractors | Determines where you can act at all |

### 9.2 The Dark Engine
**Your mandate grows when the world looks dangerous.** A stable, benign climate defunds you. A terrifying one earns a supplemental appropriation.

You are structurally incentivized to argue for your own necessity — and the easiest way to be persuasive about a threat is to be right about one you helped create. This is the Halvorsen logic turned on the player: *you are the drought-tolerant cultivar.*

### 9.3 Commodity Exposure
Every region carries a production profile and a consumption profile. You hold trade positions across both. **The consequences of an intervention depend entirely on your own exposure.**

Drought the Chinese soybean crop:

- **You export soybeans** → global price spikes, your farmers prosper, your treasury swells. This is the play.
- **You import soybeans** → you have detonated your own food budget.
- **You import from a third country that also exports to China** → China outbids you for remaining supply. You have caused your own shortage at one remove, and it takes a season to work out why.

This is the **economic twin of the energy ledger**: consequences are conserved and route through markets you do not control.

**The chilling implication, also true of the real world: your best targets are not your enemies. They are your competitors in export markets.** You do not attack the nation that hates you. You attack whoever else grows what you sell.

### 9.4 Don't Kill the Host
Your budget derives from an economy embedded in a functioning world. Global food price spikes trigger unrest, migration, and demand collapse. Push far enough and the international system contracts, taking your appropriation with it.

**You are a parasite with a real interest in the host's survival.** Enough chaos to stay funded and move markets your way; not enough to break the thing you feed on.

### 9.5 The Scarce Tactical Resource
Not money. **Global attribution capacity** — how much anomaly the world can absorb this season before people start asking questions.

A shared pool across all operations, creating real opportunity cost between them. Critically: **large natural events increase the pool.** A genuine El Niño is cover.

The resulting strategic rhythm is *patience* — staging operations and waiting for noise to hide in. Waiting becomes an active, skillful, tense choice, which is a rare and valuable thing in a strategy game.

---

## 10. Session Shape

### The Problem
The core mechanic fights what makes strategy games feel good. An 8-season delay between action and consequence produces a game where nothing ever happens.

### The Solution: Staggered Operation Maturity
At any moment the player has **5–8 operations in flight at different stages** — two in planning, three propagating, two resolving, one under investigation. Every season, *something* lands. Individual arcs are long; aggregate feedback rate is constant.

Structural rather than a tuning fix, and it is how *Football Manager* and *Plague Inc* stay compelling despite long causal chains.

### A 45-Minute Session
Three to five seasons. Review what landed. Respond to one attribution scare. Commit one new operation. Adjust one in flight. **End mid-arc, with something unresolved.** Never a clean stopping point.

---

## 11. Disaster Taxonomy

### Atmospheric
Tropical cyclones · extratropical cyclones · tornado outbreaks · severe convective storms and hail · derechos · blizzards and ice storms · heat waves and heat domes · polar vortex displacement · dust storms · lightning ignition

### Hydrological
Riverine flooding · flash flooding · coastal storm surge · dam and levee failure · drought (meteorological → agricultural → hydrological) · monsoon failure or excess · glacial lake outburst floods · snowpack failure · saltwater intrusion · aquifer depletion

### Climatological (slow onset)
Megadrought · desertification · chronic coastal inundation · permafrost thaw · ice sheet destabilization · **AMOC slowdown**

> *AMOC is the civilizational lever — the one irreversible, hemisphere-scale action in the game. Gated behind the entire tech tree; functions as a point of no return.*

### Wildfire
Wildfire · firestorm · pyrocumulonimbus

> *Fire deserves its own tier because it is **composite**: it requires fuel load, drought, wind, and ignition. The player can build three of the four conditions over years, entirely deniably, then wait for a lightning strike that was going to happen anyway. This is the most elegant deniability structure in the design and should be the game's teaching example.*

### Geophysical (canon until capability — see §19)
Earthquakes · volcanic eruptions (VEI-scaled, with stratospheric aerosol effects) · tsunamis · landslides and debris flows · avalanches · subsidence · liquefaction

> *Volcanoes are a gift. Pinatubo in 1991 put enough sulfate into the stratosphere to cool the planet roughly half a degree for two years — a real-world proof of concept for stratospheric aerosol injection. As scheduled events, historical eruptions deliver free cooling, a shock to the energy ledger, a large widening of the variance envelope, and a live demonstration that unlocks capability. Tambora 1815, Krakatoa 1883, Agung 1963, El Chichón 1982, Pinatubo 1991.*

### Biological
Locust swarms · crop pathogens (wheat rust, blight) · pollinator collapse · vector-borne disease range shift · livestock epizootics · harmful algal blooms and hypoxic zones · invasive species · soil microbiome disruption

### Compound — this is the actual game
Multi-breadbasket failure · burn scar → debris flow · drought → dust → soil loss · heat + humidity → wet-bulb lethality · flood → cholera · drought → hydropower failure → grid collapse · crop failure → price spike → unrest → migration

**Single disasters are inputs. Cascades are outcomes.** The player triggers the first column; the game resolves the rest. **Multi-breadbasket failure is the endgame weapon** — simultaneous failure across two or more major grain regions is what actually breaks the global food system.

### Weather vs. Bio: Opposite Risk Profiles

| | Weather | Biological |
|---|---|---|
| **Onset** | Acute — a storm, a week | Slow — seasons, years |
| **Visibility** | Loud, immediate | Silent until it isn't |
| **Attribution** | Statistical, arguable, deniable forever | Forensic and permanent |
| **Reversibility** | Effects pass | Self-sustaining, escapes control |

A drought is deniable because you are arguing about probability distributions. An engineered organism carries a genome — once a rival sequences your locust and finds markers that did not come from nature, deniability is gone permanently.

**Weather you deploy. Bio you release.**

---

## 12. Capability Tree — Four Spheres

**Atmosphere** — cloud seeding · fog dispersal · hail suppression · cyclone steering and suppression · stratospheric aerosol injection · ionospheric heating
**Lithosphere** — induced seismicity · glacial and permafrost destabilization · slope failure · subsidence
**Hydrosphere** — ocean thermal manipulation · current and upwelling disruption · ENSO forcing · watershed and aquifer interference
**Biosphere** — vector release · engineered crop pathogens · pollinator collapse · swarm ecology · soil microbiome disruption

### The Progression Axis: Plausible → Deniable → Absurd

| Tier | Character | Examples |
|---|---|---|
| **Plausible** | Real, marginal, safe, boring | Cloud seeding, firebreak logistics, seed banking |
| **Deniable** | Real, potent, geopolitically radioactive | Stratospheric aerosol injection, ocean thermal work |
| **Absurd** | Fantasy, enormous, effectively un-deniable | Orbital directed energy, ionospheric seismic coupling |

The player's arc is the slide down this slope. The top tier is the nuclear option: it works, and it ends deniability permanently.

### Design Rule: Fantasy Effects, Real Vocabulary
HAARP does not cause earthquakes. But HAARP is real, it is in Gakona, Alaska, it is an ionospheric heater, and it has genuine operating parameters — effective radiated power, dwell time, ELF/VLF generation. **The interface is authentic; the outcome is fantasy.** The player should feel like they are operating real equipment.

---

## 13. Defense & the Dual-Use Trap

You cannot block weather. You can only absorb it or answer it.

**Adaptation** — reservoirs, seed banks, drought-tolerant cultivars, firebreaks, grain reserves, levees. Cheap, boring, reliable, permanent, invisible to adversaries. Doesn't feel powerful. Should be the correct play far more often than it feels like it.

**Counter-intervention** — seed clouds to break their drought; suppress the cyclone bound for your client's port.

### The Trap
**Every defensive intervention is also an intervention.** Seed clouds to save your wheat and you have pulled moisture from a system that was going somewhere else — causing a drought two countries downwind, adding your signature to the record, and spending energy the ledger will make you account for.

Adversaries can therefore **bait** you: pressure a client you cannot afford to lose, force the intervention, and now *you* carry the attribution trail while your collateral drought sits in a previously neutral third country looking for someone to blame.

### Mutually Assured Meteorology
One atmosphere. Two programs intervening does not produce stalemate — it produces a system neither can predict. **Negative-sum, not zero-sum.** Past a threshold, both sides lose control simultaneously and the atmosphere begins producing events nobody ordered.

*Game-theoretic note:* this is iterated prisoner's dilemma with a **noisy channel**. In noiseless IPD, tit-for-tat is stable and cooperation emerges. Add noise and it collapses — a defection that was not yours is attributed to you, you are punished, you retaliate, and the spiral runs on misperception alone. This is not a metaphor for the escalation mechanic; it *is* the escalation mechanic, and it is well-understood enough to be tunable.

### Termination Shock as Commitment Device
If you have artificially cooled a hemisphere for twenty years, decades of suppressed warming arrive within roughly five if you stop. Threatening to stop is a credible first-strike weapon. You are trapped in your own scheme, everyone knows it, and that is simultaneously your leverage and your vulnerability.

---

## 14. Map & Presentation

**Two simulation scales, one cinematic scale.**

- **Globe** — strategic. Real sim state, whole-world anomaly visualization. The "watch the world go crazy" view. Should be genuinely beautiful.
- **Regional (projected)** — operational. Same data, higher display resolution. Where planning happens. The globe-flattens-to-projection transition is worth building.
- **Event view** — **not simulated.** When a disaster resolves, the player receives satellite imagery and a briefing package. Procedural or pre-rendered.

City-level simulation is explicitly cut. It is a third data resolution and a third rendering system for ten seconds of screen time — and cutting it *serves the tone*, per §4.5.

### The Instrument Feedback Principle
Sensory effects during events are **diegetic to your instruments, not to the event.** You are in an operations center; your equipment responds. This is truer to the fiction and more unnerving than putting the player at the disaster, which would undercut §4.5.

| Event | Effect |
|---|---|
| **Earthquake** | A brief, small tremor — a distant shock felt through a building — paired with seismometer traces spiking across the monitoring array. Sensors registering, not ground rupturing. |
| **Volcano** | Aerosol optical depth climbs and the **entire globe's color temperature shifts warm for two years.** Volcanic sunsets are real, beautiful, and here they are also a data visualization: the variance envelope widening. Every sunset for two years is a reminder that the sky changed and you intend to use it. |
| **Tsunami** | **Tide gauge stations light up in sequence around the basin** as the wave propagates, arrival-time estimates counting down against coastlines. You watch it cross an ocean at jetliner speed as a spreading ring of instrument telemetry. |

**The world never touches you. You only ever see the readout.** Which is what makes the puncture rule (§4.4) land like a gunshot when it fires.

---

## 15. Art Direction

### The Governing Rule
> **The game is beautiful because it is accurate, never because it was prettified.**

Beauty here is not applied to horror — it *is* the horror seen at a different scale. A cyclone's spiral is a real solution to a real equation. Wildfire is how many ecosystems reproduce. The moral architecture of the whole design depends on the player feeling awe and complicity simultaneously, and that only works if the beauty is truthful. Anything that looks good solely because an artist made it look good will read as false in this context.

### Reference Set
Not disaster cinema. **Scientific visualization:**

- NASA Earth Observatory imagery
- NOAA GOES satellite loops
- NASA/NOAA "Perpetual Ocean" current visualizations
- Radar reflectivity composites
- Sea surface temperature anomaly maps in the standard blue-white-red divergent scale

All of it is extraordinary, and none of it was designed to be. That is the register — and it is cheap to reach, because scientific colormaps are already solved design problems.

### Fear and Embrace as a Mechanic
Natural events are genuinely *good for the player*. A real volcanic eruption delivers free cooling, a shock to the energy ledger, and — most importantly — a two-year window in which the variance envelope is wide enough to hide almost anything.

**The game teaches the player to want the eruption.** To watch the sunsets and feel gratitude. That is the entire theme delivered through a color grade and a resource, with no dialogue.

### Specifics
- **Volcanic sunsets** — global, persistent, gorgeous, and simultaneously a readout of aerosol optical depth. Sublimity and instrumentation in one asset.
- **Fire at satellite scale** — burn scars in false-color infrared are among the most beautiful images the planet produces. Fire must also be **seasonal and recurring** in regions where that is ecologically true. Fire appearing only when something has gone wrong is a lie about how the world works, and this game cannot afford lies about physical systems.
- **The calm must be beautiful too.** Ocean currents turning, seasonal green-up sweeping north, a season where nothing happens and the player just watches. That is what makes the anomalous season land.

### The Prohibition
**Never use ugliness as editorial.** If aftermath imagery is made deliberately grim to signal that the player did a bad thing, the game is moralizing with its color grade instead of its words — a direct violation of §4, rule 3. Aftermath imagery should be exactly as beautiful as real satellite imagery of a flood plain is, which is very. The discomfort comes from the player noticing they are admiring it.

---

## 16. Adversaries & the International System

**Authored actors inside an emergent system.**

Fully emergent AI is expensive and usually produces mush. Instead: **three to five rival programs**, each with a distinct hand-authored *doctrine* — one bio-forward and reckless, one purely defensive and adaptive, one that mirrors the player's behavior. Legible and learnable.

The **system** they inhabit is emergent: blocs, commodity markets, migration, public suspicion. Nothing scripted.

### The Suspicion Distribution
The target equilibrium is **everyone knows, nobody can prove.** The key international state variable is therefore not alliances but a *suspicion distribution* — who is believed to be doing what. Because the channel is noisy, that distribution is frequently wrong, which is the origin of retaliation spirals.

---

## 17. Victory, Loss & Ending

### No Victory. Tenure.
The score is how long the program lasted and what it achieved. Runs are compared, not won.

### Four Loss Conditions
- **Exposure** — the dossier reaches proof
- **Cascade** — the energy ledger breaks; climate becomes uncontrollable
- **Capture** — contractors effectively own the program
- **Obsolescence** — budget cut, because you were cautious and produced nothing visible

**The fourth is essential and is the single most important balance constraint in the design.** Without it, optimal play is "never intervene" and the game has a dominant strategy of doing nothing. **A pure-defense turtle must be able to lose.**

### The Ending
The run finishes. Then the archive opens twenty-five years later and the player reads what history concluded. Sometimes they got it right. Sometimes they blamed a rival. Sometimes the operation you are proudest of is still filed as natural variability, and no one will ever know.

---

## 18. Real-World Canon & the Declassification Horizon

The game is set in the gap between the act and the FOIA release. Everything the player does is true — it just hasn't come out yet.

### Documented Precedent
- **Schaefer / Vonnegut, GE** (Nov 1946) — first successful cloud seeding. The campaign's opening.
- **Operation Popeye** (1967–72) — US cloud seeding over the Ho Chi Minh Trail to extend monsoon season. Declassified. Literal weather warfare.
- **ENMOD** (1976) — real UN treaty banning hostile environmental modification, which exists *because of* Popeye.
- **Project Stormfury** — decades of US attempts to weaken hurricanes by seeding.
- **Operation LAC** (1957–58) — US Army sprayed zinc cadmium sulfide over American cities to study aerosol dispersal.
- **Project West Ford** (1961/63) — ~480 million copper needles placed in orbit to create an artificial ionosphere.
- **Starfish Prime** (1962) — 1.4 MT detonation at 250 miles altitude. EMP reached Honolulu 900 miles away, killed a third of LEO satellites, lit an artificial aurora across the Pacific.
- **Project Thor** — kinetic orbital bombardment concept studies.
- **Project Excalibur** — SDI-era nuclear-pumped X-ray laser.
- **YAL-1 Airborne Laser** — megawatt chemical laser in a 747. Flew. Downed a ballistic missile in 2010. Cancelled 2011.
- **"Owning the Weather in 2025"** (1996) — an actual USAF research paper.
- **Project Azorian / the Glomar response** — CIA raising a Soviet submarine under cover of a Hughes mining vessel; origin of "we can neither confirm nor deny."

### Three-Tier Codex Tagging
- **`DECLASSIFIED`** — real, with release date
- **`ALLEGED`** — a real conspiracy claim, presented as the agency's internal assessment of a rumor
- **`[REDACTED]`** — invented

The player learns to read tags as a reliability signal; the campaign then plays with them — an `ALLEGED` entry that turns out to be the player's own black program, filed as rumor to bury it.

**End-of-campaign unlock:** a declassified appendix sorting every entry into *documented / disputed / invented*. A reward, not a disclaimer.

### Mechanics From the Horizon
- **The Glomar clock** — every operation carries a declassification timer (25 years standard, 50 for exotic capability, indefinite at cost). Because the campaign spans 114 years, **your 1962 operation surfaces in 1987 while you are still playing**, landing on a program that has forgotten it happened.
- **Redacted briefings** — some of the player's own documents arrive blacked out. Compartmentalization as fog of war.
- **The precedent tree** — unlocking a capability requires citing prior art. Aerosol dispersal over a populated area? Operation LAC already did it; legal signs off.

---

## 19. Setting & Content Rules

**Period:** 1946 – c. 2060. Real geography throughout.

### The Divergence Rule
> **Real events before the campaign start are canon. Everything after is counterfactual.**

The moment the player takes their first action in 1946, this is no longer our timeline. Real climate *data* continues to drive the background rhythm — that is the substrate — but **events are fictional.** The 1965 hurricane is invented. The 2023 fire season is invented.

This is the stronger design, not a compromise:

- **It is a better game.** A real event has a fixed public record that fights the fiction. A fictional one lets you author the entire causal chain, the aftermath, the attribution investigation, and the political fallout.
- **It is the right verb.** "Prevent the disaster that actually happened" is a *puzzle with a known answer* — the player is being quizzed on history. "Push on a system and see what emerges" is a strategy game.

### The Geophysical Exception
**Plate tectonics does not care about the atmosphere.** The 1946 divergence changes the climate timeline but has no physical bearing on when a fault slips. So real earthquakes, eruptions, and tsunamis remain canon — not as an exception to the divergence rule, but as the rule applied correctly.

This produces the best dramatic beat in the game:

> **The moment you unlock lithospheric capability, the historical record stops.**

Every earthquake up to that point is documented and natural. Every one after is suspect — *including the ones you did not cause*. You have personally ended the category of "natural disaster," and the world does not know it yet. Rivals will attribute events to you that you had nothing to do with, and you cannot correct them without confessing to the ones you did.

**Guardrail:** real geophysical events stay canon only while they are unambiguously natural. Once player capability exists, the catalog switches to fictional.


### The Political Map Evolves
Nation starts are **real** — you take over a real country's program in 1946, and the historical opening uses the real political map, because that is what makes the declassified-precedent layer land.

**The map then reorganizes into fictional entities as the century progresses.** Blocs consolidate, water compacts form, agricultural cartels and sovereign insurance pools emerge, alliances reshuffle. By the near-future endgame the political layer is entirely invented while the geography remains real.

This resolves a genuine tension. Playing as a named real country, running a program that starves other named real countries, is a different object from playing a fictional bloc — and the further past the present it runs, the more it reads as a claim about the world rather than as fiction. Real-to-fictional drift keeps the historical grounding where it pays and removes the problem where it would bite.

It also adds gameplay: **the political map is itself an outcome.** Blocs form partly in response to the pressures the player applied. You are not just acting on the world map — over a century you are authoring it.

### Guardrails
1. **Real geography, evolving politics.** Real countries, cities, rivers, basins, watersheds, agricultural regions. Institutions and blocs are fictional — water compacts, agricultural cartels, sovereign insurance pools.
2. **No real political figures**, current or historical.
3. **Historical programs as ancestry; invented events as outcomes.**
4. **Never present a real modern disaster as caused by intervention.** Not Lahaina, not Paradise, not any real recent event. The directed-energy theory about Maui caused documented, ongoing harm to survivors who were told their dead relatives were killed by a government beam. A game in which orbital energy weapons start fires, that *names Lahaina*, is not blurring fiction and reality — it is endorsing a specific claim that hurt specific living people. **The general capability stays; it burns a town you invented.**
5. **No real currencies, tokens, or financial brands.** In-fiction instruments only — including the private settlement layer that funds off-ledger operations, which is a *mechanic*, not a product placement.
6. **Pre-1946 real events are free.** Tambora's 1815 year without a summer, the 1900 Galveston hurricane, the Dust Bowl. Historical, no living survivors, already treated as subject matter — and good codex material establishing that the climate has always been able to do this on its own.

---

## 20. Contractors

Capability you don't have to build, in exchange for exposure you don't control.

**R&D** — develops what the program can't justify on a public budget line. Never appears in appropriations.
**Containment** — lobbying, litigation, records on corporate servers outside FOIA reach, placed reporting. The Glomar clock becomes something you buy time on, at a price rising with exposure.
**Deniability laundering** — an operation run through a vendor is not your operation. Attribution stops at a private firm with its own lawyers.

### Why It's a Real Decision
The contractor accumulates leverage. Every operation they run for you is evidence they hold on you. Sever the relationship and you have created an adversary with receipts. The failure mode is not overspending — it is that by year fifteen you have a vendor who knows everything, is too entangled to cancel, and has begun setting your program's direction.

- **They pursue their own interests.** Halvorsen wants harvests to fail where its cultivars are licensed. Not your objective — and why they're cheap.
- **They are not exclusive.** Your vendor also sells to your adversary. Exclusivity is purchasable and expensive.
- **They can be nationalized.** Seize the firm: you get the capability, the liability, and the paper trail lands squarely on you.

### The Firms
Blandness is the tell. The register is Leidos, Peraton, Booz Allen.

| Firm | Cover | Reality |
|---|---|---|
| **Meridian Assurance Group** | Reinsurance, catastrophe modeling | Sells mitigation, underwrites the risk |
| **Tessellate Systems** | Geospatial and orbital imaging | Orbital platform access |
| **Kestrel Atmospheric** | Licensed weather modification | Unlisted division |
| **The Halvorsen Group** | Agribusiness, seed patents, "yield assurance" | Vertically integrated into causing the failures its cultivars survive |
| **Sirocco Continuity** | Disaster response and reconstruction | Arrives suspiciously fast |
| **Argenta Terraform** | Publicly traded geoengineering | The only one that sounds like what it is — which is why it testifies at hearings |

The front is not a front. These are real, profitable companies. The black program is a line item inside one.

---

## 21. Nation Starts — the Difficulty System

Difficulty is not a setting. It is **which country's program you take over in 1946** — asymmetric starts in the manner of a Civ or Hearts of Iron nation pick, which players experience as strategy rather than as an easy mode.

**Scale: play as a country.** Continents are not political actors, and a superpowers-only list discards the most interesting material — the compelling programs are the mid-tier ones.

### The Four Axes

| Axis | What it sets |
|---|---|
| **Latitude & climate exposure** | How vulnerable your own homeland is to the drivers you would want to move. A nation whose agriculture is ENSO-sensitive cannot touch ENSO without bleeding. |
| **Trade posture** | Net grain exporter or net importer. **The single largest difficulty lever.** |
| **Baseline capability & budget** | How much program you inherit in 1946. |
| **Attribution vulnerability** | How much scrutiny you attract by existing. |

### The Inversion
**Attribution vulnerability runs opposite to raw power, and it is the great equalizer.** The strongest programs are the most surveilled.

| Archetype | Capability | Scrutiny | Character |
|---|---|---|---|
| **Superpower** | High | Very high | Rich but constrained. Every move is watched. Your problem is deniability, not means. |
| **Mid-tier exporter** | Moderate | Low | **The sweet spot.** Enough reach, nobody looking. |
| **Import-dependent** | Low | Low | Hardest start. Defending from turn one; adaptation is the only affordable branch. |
| **Small & wealthy** | Very low reach | Very low | Pure contractor play — you can barely act, so you buy capability and launder it. |

The intuitive "easy" pick — the superpower — is actually a hard, constrained game about being watched. The relaxed run is the mid-tier grain exporter nobody suspects. That inversion does real thematic work and costs nothing.

### Constraints
1. **Nation choice sets starting position only** — never victory conditions, never available systems. The moment nations get bespoke tech trees you have built eight games instead of one.
2. **Six hand-tuned starts. Not 190.** Each needs a real balance pass, and they should read as legible archetypes.

### Trade Posture in Detail
This is where §9.3 commodity exposure becomes a difficulty curve rather than a mechanic.

- **Exporter:** the commodity system runs *with* you. Other nations' failures are your windfall. Offensive play is profitable.
- **Importer:** you are playing defense from the opening. Every offensive option risks detonating your own food budget, and the third-party bidding effect (§9.3) will punish you for interventions that look unrelated.

---

## 22. Scope Discipline

### Core — must exist in v0.1
- Deniability / attribution as primary resource
- The energy ledger
- Delayed, displaced, nonlinear feedback
- The teleconnection graph and variance envelopes
- Staggered operation maturity

### Strong — build in v1
- Commodity exposure and the trade graph
- Dual-use defense and the counter-intervention trap
- Declassified-precedent tech tree and knowledge progression
- Contractor layer
- Institutional-banality tone, media layer, UI
- The four loss conditions
- Evidence-dossier attribution

### Deferred — year two, if the core loop is fun
- Faction choice (contractor, multilateral NGO) as modifier layers
- Full 1946–2060 span (prototype a 30-year slice first)
- Full biosphere branch
- Geophysical sphere
- Multiplayer / two-program atmospheric contest
- Globe-to-projection transition polish

> **Honest note on scope.** The design currently carries three ledgers, four spheres, six disaster families, four loss conditions, commodity exposure, contractors, knowledge progression, and a 114-year timeline — all *interacting*, which is where balancing cost actually lives. This is more systems than most shipped strategy games. **The deferred list will need to grow, not shrink.**

### The Question That Must Be Answered First
**Is it fun to nudge an invisible system and watch consequences arrive four to eight seasons later in the wrong country?**

Everything else is downstream. See `force-majeure-prototype.xlsx` — forty seasons, one homeland, eight regions, nine tools. Playable in an afternoon.

---

## 23. Open Questions

1. **Graph scale.** How many region nodes? 40 is authorable and legible; 200 is realistic and unbalanceable. Probably 50–80.
2. **How visible is the trade graph at start?** Fully visible is fair; partially hidden is consistent with knowledge progression.
3. **Does the player ever see rival operations directly,** or only infer them from anomalies?
4. **Campaign structure** — scripted arc, or sandbox with emergent narrative? Leaning sandbox with authored *events* rather than authored *plot*.
5. **Failure recovery.** Once exposure begins, is there a comeback path, or is a death spiral correct?
6. **Time compression granularity.** How many discrete resolution tiers across 1946–2060, and what triggers the step-ups?

---

## 24. Next Steps

1. **Play the prototype.** Forty seasons, honestly, one row at a time. Record what you expected versus what happened. This gates everything below.
2. If the loop holds: resolve §23.1 and §23.6 — they determine data structures.
3. Technical design doc and data ingestion layer — see `force-majeure-handoff.md`.
4. Stack decision, which falls out of the technical design doc.

*This document is a design brief. It is not a spec, and it is not an implementation plan.*

---

*v0.4 — a design brief, not a spec. Argue with it.*
