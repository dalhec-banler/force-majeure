# ADR-0010: Three cadence tiers; step-ups triggered by capability era, never by calendar alone

**Status:** Accepted · 2026-08-24 (open question §23.6, resolved under
delegated authority; builds on ADR-0003)

## Context
ADR-0003 made cadence purely presentational, so any tier scheme is content.
The open question was how many tiers and what triggers the step-ups.

## Decision
Three tiers:

| Tier | Default review interval | Era (typical) |
|---|---|---|
| 1 — Program Review | Annual (4 seasons batched) | 1946 – mid-70s |
| 2 — Operations Tempo | Half-year | mid-70s – ~2010 |
| 3 — Situation Room | Seasonal | ~2010 – 2060 |

Step-up triggers (whichever fires first):
- **Tier 1 → 2:** first Deniable-tier capability unlocked, **or** ENMOD
  (1976) — the moment the game acquires real stakes, the clock tightens.
- **Tier 2 → 3:** first Absurd-tier capability unlocked, **or** 2010.

Rules: step-ups are one-way; the player may always *zoom finer* than the
current tier (drop to seasonal at will) but never coarser; interrupts
(ADR-0003) pierce any tier.

## Rationale against the north star
Chess: opening moves are fast, the middlegame slows, the endgame is
calculated move by move — tying tempo to capability rather than to the
calendar means the player's own progression sets the clock, which reads as
earned rather than imposed. Retention: tier 1 keeps the first hour brisk
(the "first thirty minutes" gap #7 is mostly a tier-1 pacing problem), and
the tier-2 transition landing *with* ENMOD makes a rules-change moment into
a felt tempo change.

## Consequences
- Triggers are pack data keyed to unlock events; no engine change.
- Onboarding design (gap #7) should treat the tier-1 annual review screen as
  the tutorial surface.
- A player who rushes Deniable capability in 1958 gets a faster game early —
  intended: that is a legitimate opening choice with a real cost.
