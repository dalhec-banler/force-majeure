# ADR-0020: The ladder has teeth

**Status:** Accepted · 2026-08-26 (ladder session; authority delegated —
"it's ok if a player ends rich, but getting through it shouldn't be easy")

## Context
Night reports I–III agreed on one thing: the ladder was cosmetic. Only
rung 5 (investigators) and rung 7 (exposed) did anything; every rung
between was a headline. Strong players ended at rung 2 with $200M and
never saw SOMEONE IS ASKING QUESTIONS; the craftsman bought absolution at
$6M a season; the wave strategist sat at dossier 194 because nothing
above 155 hurt until 200.

## Decision (engine opt `scrutiny`, default off; sheet baseline 302.40 unchanged)
1. **Signatures ×1.5**, dossier decay 0.04 → **0.03**, pattern window 8 →
   **12** seasons (night report I's numbers).
2. **Every rung is more eyes.** A landing's signature is multiplied by the
   rung the world was on when it landed: nothing/grad student ×1,
   journalist **×1.25**, consortium **×1.5**, rival service **×1.75**,
   inspectors **×2**. The ladder compounds: the higher you are, the faster
   the next op climbs it.
3. **Hush money is a trickle, not a firehose.** A season's containment
   buys `C / (1 + C/40)` points (before the standing dossier/60 efficiency
   loss): $10M → 8, $20M → 13, $40M → 20. You cannot buy your way down
   from a spree in one season; you go quiet.
4. **Rung 5 leaves a floor** (ADR-0009 implemented as written): crossing
   115 sets a permanent floor of 90. Above 115 investigators add +3/season
   with no decay (as before); pushed below 115, decay resumes but the file
   never closes beneath 90. Recoverable-but-scarring.
5. **Relief at home is never pattern evidence.** Cloud seeding and
   adaptation on the homeland pay their signature under the eyes but do
   not compound as repeats — seeding your own farmland is public and legal
   everywhere; it is the programme's cover story. (Found when the fortress
   campaign exposed itself defending its own harvest at rung 6.)
6. **Named means hunted.** At rung 5+ the Eastern Program works the
   homeland on its own clock (every 4 seasons; faster in later eras,
   ADR-0022).

Surface: rung-crossing memos from Legal/Counterintelligence say what
changed; the tray's signature line reads "under scrutiny / under study /
under investigation / every eye on us"; the header dossier shows the
floor once one exists.

## Consequences (harness sweep, counterfactual PROFIT per ADR-0021)
| campaign | before (NR3) | after |
|---|---|---|
| naive (tutorial) | rung 1, running | rung 1 (peak 2), running |
| flagship | rung 2, running | **rung 3**, running, +$84M |
| ensoflag | rung 2, running | peak 3–4, +$77M |
| fortress | rung 3, running | **rung 6**, running, +$71M |
| researchstrike | rung 2, +$283M | rung 3 (peak 4), **+$255M** |
| monsoonF (3-stack waves) | rung 6, +$396M, high score | **exposed S26** |
| monsoonG1–G5 (1–2-stack waves, containment) | — | rung 3–5, **+$167–242M**, running |
| typhoon / tempest / rampage | exposed | exposed earlier |

Rung 3 by mid-game is now the normal cost of an offensive style; rung 5
is a campaign-defining event; the rich ending is still there for the
careful. New high score to beat: **+$255M** (researchstrike) — and the
wave family is back to two stacks and a quiet year.

Not changed: the attrition economy (idle income < overhead) — author's
call 2026-08-26: "let it slide".
