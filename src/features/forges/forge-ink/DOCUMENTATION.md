# Forge — L'Encre Revelatrice

## Game explanation

Gift Grimoire is a narrative puzzle game disguised as a romantic gift. The player progresses through a series of "forges" — interactive challenges embedded in a mystical grimoire. Each forge unlocks a rune fragment upon completion, advancing the story.

This forge is the most complex module — a grid-based crossword puzzle where the player reveals hidden letters by spending limited ink drops, then guesses the words they form.

## Module objective

The player discovers a seemingly blank page in the grimoire. By tapping cells on a grid, they spend "ink drops" to reveal letters hidden beneath the surface. The lore frames this as using a rare, finite ink to uncover ancient secrets written by an invisible hand.

The forge uses daily-resetting state: ink drops and progress reset at midnight, encouraging the player to return each day.

## Features

### Grid-based letter revelation

A 7-column by 9-row grid contains three hidden words arranged crossword-style:

- **RESONANCE** — vertical, column 3, rows 0-8
- **ECRAN** — horizontal, row 0, columns 1-5
- **VOILE** — horizontal, row 3, columns 2-6

Words share intersection cells (e.g., R at position (0,3) is shared by RESONANCE and ECRAN). The grid is pre-computed at module load via `buildLetterMap()` which maps `"row,col"` keys to `{ letter, wordTexts[] }`.

### Ink drop economy

The player starts with 6 ink drops (`maxDrops`). Each cell tap consumes one drop regardless of hit or miss. When drops are exhausted and all words are either solved or locked (out of guesses), drops automatically refill — a graceful exhaustion mechanic that prevents dead states.

A visual `InkDropIndicator` component shows remaining drops as a row of icons.

### Hit and miss mechanics

- **Hit** — Tapping a cell containing a letter reveals it with `playHitParticles()` golden particle burst and `sndInkHit()` sound
- **Miss** — Tapping an empty cell triggers `sndInkMiss()`, a miss splash animation, and activates the proximity feedback system

### Proximity feedback system

After a miss, the `PROXIMITY_MAP` (pre-computed at module load) highlights nearby letter cells:

- **Hot** (distance 1) — Orange glow, `sndInkMissAdjacent()` sound
- **Warm** (distance 2) — Darker subtle glow

The proximity center and affected cells display for 2.8 seconds before clearing. This guides the player toward hidden letters without revealing them directly.

### Word guessing

Each word has an `InkWordCard` component showing the current pattern (e.g., "R\_S\_N\_NC\_") and an input field. The player can guess the full word with up to 3 attempts (`maxGuessesPerWord`). Outcomes:

- **Correct** — All remaining letters auto-reveal with `playWordRipple()` sequential animation and `sndInkWordSolved()`
- **Wrong** — `sndInkGuessError()` plays, guess counter decrements
- **Auto-solve** — If all letters of a word are revealed via tapping, the word auto-solves without requiring a guess

### Daily reset

State is persisted in a Zustand store (`useInkStore`, localStorage key `grimoire_forge_ink`) with a `dayStamp` field (`YYYY-MM-DD`). On mount, the game engine compares the stored day with today. If stale, all progress is discarded and the game starts fresh. A countdown timer shows time until midnight reset.

### Victory flow

When all three words are solved:

1. `playCelebration()` — All-grid golden particle burst
2. `playVictoryShimmer()` — Staggered shimmer effect across all cells
3. `InkVictoryModal` appears with narrative text
4. Dismissing the modal triggers `EnigmaPicker` for rune selection

### Intro modal

This forge uses the optional `introText` field from `ForgeModule`. On first unlock, a narrative modal introduces the ink mechanic: "Cette page du grimoire semble vide... Des mots y furent traces a l'encre des secrets."

### Solved view

The `InkSolvedView` component renders the completed grid with all letters visible in a success-themed style.

### VFX system

A dedicated `vfx/ink-vfx.ts` module provides:

- `playHitParticles()` — Golden particle burst on letter reveal
- `playWordRipple()` — Sequential letter-by-letter animation with sound
- `playCelebration()` — Full-grid particle explosion on victory
- `playVictoryShimmer()` — Staggered shimmer across all cells

### CSS animations

Extensive CSS animations power the visual polish:

- `ink-cell-revealing`, `ink-letter-crystallize` — Letter appearance effects
- `gold-letter-shimmer` — Shimmer on revealed letters
- `ink-drop-fall`, `ink-spread-ripple` — Drop impact effects
- `ink-miss-splash`, `ink-miss-blob` — Miss feedback
- `ink-proximity-hot`, `ink-proximity-warm` — Proximity glow
- `proximity-sparkle-*` — Sparkle particles near hot zones

### Game engine hook

All game logic is encapsulated in `useInkGameEngine` hook, which exposes:

- State: `revealedCells`, `missedCells`, `wordStates`, `dropsLeft`, `animating`, `proximityCenter`, `tapMessage`, `countdown`, `solved`
- Actions: `handleCellTap()`, `handleWordGuess()`, `dismissVictoryModal()`, `resetAll()`
- Derived: `getWordPattern()`, `activeWords`

### Admin reset

Exposes two reset mechanisms:

- **Full reset** via `useInkStore.getState().resetInkGame()` — Clears all game state
- **Ink drop reset** via `useInkStore.getState().resetInkDrops()` — Refills drops only (admin button "reset ink drops")
