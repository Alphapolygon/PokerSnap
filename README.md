# Tri-River — Demo (React + Vite + TS)

A minimal playable prototype split into **HTML / CSS / TS** with **card config** and **special effects** wired.

## Run
```bash
npm install
npm run dev
```
Then open the printed localhost URL.

## What’s in here
- `index.html` entry file
- `src/styles.css` basic layout & animations
- `src/config/cards.ts` **card definitions and effects**
- `src/lib/poker.ts` hand evaluation + Yahtzee-style scoring
- `src/lib/effects.ts` on-reveal and ongoing effect helpers
- `src/components/` `Card` and `Lane` UI components
- `src/App.tsx` game loop: draw → play (drag or tap) → reveal 2/4/6 → score per lane
- `src/lib/shuffle.ts` deterministic shuffle helper

## Effects implemented
- `draw`, `drawThenDiscard`, `energyNextTurn`, `revealEarly`
- Lane modifiers: `laneMult` (flush/straight/all), `laneAdd` (+points)
These are set per-card in `src/config/cards.ts`. When you play a card, **on-reveal** triggers immediately; **ongoing** lane modifiers are applied whenever scoring the lane (they come from cards sitting on that lane).

## Notes
- This is a **single-player visual** (no opponent) to validate rules and UX.
- Community boards reveal **flop/turn/river** on turns **2/4/6**.
- Scoring uses Yahtzee-style: category base dominates, sum of ranks tie-breaks. Lane modifiers multiply or add.
- Drag from the hand onto a lane **or** tap a card then tap the lane header to play (drag preferred).
