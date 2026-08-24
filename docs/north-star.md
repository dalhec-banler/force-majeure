# North Star

Recorded 2026-08-24, from the author, verbatim in intent: the game must
**keep people coming back**, it must be **beautiful and destructive**, and it
should **feel a bit like chess**. Every open decision from here forward is
tie-broken against these three, in that order.

What each one means operationally:

**Keeps people coming back.** The retention loop is the *learning* loop: a run
ends, the archive opens, the player sees what the world concluded and what
their rivals actually did — and immediately knows what they'd do differently.
Between-run progression is knowledge in the player's head, never mechanical
unlocks (ADR-0011). Runs are comparable (tenure, record book), sessions end
mid-arc (brief §10), and every ending is a hook for the next opening.

**Beautiful and destructive.** Already doctrine — brief §15's "beautiful
because it is accurate" and §4's beauty-as-complicity. The engineering
corollary: the renderer's inputs are real simulation state (anomaly fields,
envelope widths, aerosol depth), never decorative effects. Destruction reads
as sublime *because* it is the data.

**Feels a bit like chess.** The deepest of the three, and the one that
resolves ambiguity in the design:
- **The board is public; the depth is in consequences.** Your position — trade
  exposure, treasury, ops in flight — is always visible (ADR-0007). What is
  hard is reading four to eight seasons ahead, not discovering hidden stats.
- **Same board every game.** No between-run mechanical advantage; mastery is
  the only progression (ADR-0011).
- **Openings, middlegame, endgame.** The 1946 opening book (cheap tools,
  narrow envelope), the mid-century positional game, the endgame where
  early quiet moves pay off — the chess-opening property of brief §5.
- **Forced moves are real.** The reactivity rule (TDD §2.7) is retained
  because being *forced* to respond, at a cost, is core chess tension
  (ADR-0008).
- **Losing positions are playable.** Recovery from exposure exists but the
  weakness stays on the board permanently (ADR-0009). A death spiral you
  merely spectate is bad chess and bad retention.
