# Forge — Le Maillon des Egares

## Game explanation

Gift Grimoire is a narrative puzzle game disguised as a romantic gift. The player progresses through a series of "forges" — interactive challenges embedded in a mystical grimoire. Each forge unlocks a rune fragment upon completion, advancing the story.

This forge is a self-contained client-side puzzle with no external dependencies. It tests the player's ability to recognize a hidden word from scrambled letters.

## Module objective

The player must rearrange a set of scrambled letters into the correct order by dragging and dropping them. The lore frames this as "lost letters finding their rightful place" — restoring order from chaos to forge a new key of light.

The solution word is `HWHRESSKDS` (10 letters). The forge uses no persistent state — it resets on every mount.

## Features

### Drag-and-drop letter reordering

Letters are rendered as draggable elements. The player uses pointer events (touch and mouse) to pick up a letter and drop it onto another position. During the drag, a ghost element follows the pointer to provide visual feedback. A proximity detection algorithm (55px radius) determines the closest valid drop target.

### FLIP animation system

When two letters swap positions, the component uses the FLIP (First, Last, Invert, Play) animation technique:

1. Snapshot DOM positions before the state change
2. Update React state (swap letters)
3. In `useLayoutEffect`, compute position deltas (old - new)
4. Apply inverse `transform: translate(dx, dy)` immediately
5. Force a repaint, then transition to `transform: none`

This produces a smooth, physics-like swap animation without CSS keyframes.

### Smart shuffle

On mount, the initial letter order is randomly shuffled using Fisher-Yates. A guard ensures the shuffled order never accidentally matches the solution, so the player always starts with an unsolved state.

### Instant win detection

After every swap, the component joins the current letter order and compares it to `SOLUTION`. If matched, the forge immediately triggers the success flow — no submit button needed.

### Sound feedback

- **Letter swap** — `sndLetterSwap()` plays on each successful drag-and-drop
- **Solved** — `sndScrambleSolved()` plays on correct solution

### EnigmaPicker integration

On solve, displays the `EnigmaPicker` modal for rune selection. Closing the picker calls `onSolve()` to persist the completion.

### Re-lock support

When the `solved` prop transitions from `true` to `false` (admin reset), the component detects this via a `useRef` tracking the previous value and re-shuffles the letters, returning to the unsolved state.

### No persistent state

Unlike other forges, this module uses only React component state (`useState`). There is no Zustand store, no localStorage, and no daily limit. The puzzle resets on every mount.
