# Forge module creation rules

This document defines all conventions and prerequisites for creating a new forge module in the Gift Grimoire project. An LLM can use this file alongside `PROMPT.md` to produce a complete, convention-compliant forge module without prior codebase knowledge.

---

## 1. File structure

A forge module lives under `src/modules/forges/forge-{name}/`.

### Required files

| File | Purpose |
|------|---------|
| `components/{ForgeName}Forge.tsx` | Main React component implementing the puzzle. Must accept `ForgeProps`. |
| `config.ts` | Constants, entity IDs, game rules, timing values. No runtime logic. |
| `DOCUMENTATION.md` | Module documentation (see `PROMPT.md` for format). |

### Optional files

| File | When to include |
|------|-----------------|
| `store.ts` | When the forge needs persistent state across sessions (daily limits, progress tracking). |
| `hooks/use{Feature}.ts` | When game logic is complex enough to extract from the component (e.g., `useInkGameEngine`). |
| `vfx/{name}-vfx.ts` | When the forge has custom particle/animation functions beyond CSS. |
| `components/{SubComponent}.tsx` | Supporting UI components (cells, cards, indicators, modals, visualizations). |

### Example directory layout

```
forge-{name}/
  config.ts
  store.ts                    # optional
  DOCUMENTATION.md
  hooks/
    use{Name}GameEngine.ts    # optional
  components/
    {Name}Forge.tsx            # required — main component
    {SubComponent}.tsx         # optional
  vfx/
    {name}-vfx.ts              # optional
```

---

## 2. Interfaces

### `ForgeProps` (from `../types.ts`)

Every forge component must accept this interface:

```typescript
interface ForgeProps {
  solved: boolean;    // Whether the puzzle is already solved (persisted state)
  onSolve: () => void; // Called when the user completes the puzzle
}
```

**Contract:**
- If `solved` is `true`, render a static "solved" view — no interactive elements.
- Call `onSolve()` exactly once when the player completes the forge. Typically called after the `EnigmaPicker` modal is dismissed.
- Never call `onSolve()` on mount or unconditionally.

### `ForgeModule` (from `../types.ts`)

Each forge must be registered as an object matching this shape:

```typescript
interface ForgeModule {
  key: string;                          // Unique identifier, used in store keys
  title: string;                        // Display title (French, poetic)
  successMessage: string;               // Narrative message shown after completion (French)
  introText?: string;                   // Optional modal text shown on first unlock (French)
  component: ComponentType<ForgeProps>; // The forge's main React component
  onReset?: () => void;                 // Optional admin reset callback
}
```

---

## 3. Registration

To plug a new forge into the game:

1. Import the main component and store (if any) in `src/modules/forges/forges.config.ts`
2. Add a new entry to the `FORGES` array:

```typescript
import { MyForge } from "./forge-{name}/components/MyForge";
import { useMyStore } from "./forge-{name}/store"; // if applicable

// In FORGES array:
{
  key: "{name}",
  title: "Le Titre Poetique",
  successMessage: "Message narratif apres completion...",
  introText: "Texte optionnel au deblocage...",   // optional
  component: MyForge,
  onReset: () => useMyStore.getState().reset(),   // optional
}
```

The order in the `FORGES` array determines the display order in the grimoire.

---

## 4. State management

### When to use a Zustand store

Use a store when the forge needs to persist state between sessions:
- Daily attempt tracking (e.g., `playedAt` timestamps)
- Game progress that survives page reload (revealed cells, word states)
- Daily reset logic (day stamps)

If the forge resets completely on mount (like `forge-scramble`), skip the store entirely and use React component state.

### Zustand conventions

| Convention | Pattern |
|------------|---------|
| Store hook name | `use{Name}Store` (e.g., `useInkStore`, `useMagnetStore`) |
| Persist middleware | Always use `persist()` from `zustand/middleware` |
| localStorage key | `grimoire_forge_{name}` (e.g., `grimoire_forge_ink`) |
| Reset method | Expose a `reset()` method that clears state to initial values |
| File location | `store.ts` at module root |

### Example store

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

type MyStore = {
  someState: string | null;
  setSomeState: (v: string) => void;
  reset: () => void;
};

export const useMyStore = create<MyStore>()(
  persist(
    (set) => ({
      someState: null,
      setSomeState: (v) => set({ someState: v }),
      reset: () => set({ someState: null }),
    }),
    { name: "grimoire_forge_{name}" },
  ),
);
```

---

## 5. Config file

`config.ts` contains all constants for the forge. No runtime logic, no React imports.

Typical contents:
- **Entity IDs** — Home Assistant entity paths (e.g., `export const ENTITY_ID = "binary_sensor.gift_grimoire_..."`)
- **Timing values** — Durations in milliseconds (e.g., `export const LISTEN_DURATION_MS = 10_000`)
- **Game rules** — Grid dimensions, max attempts, solution strings
- **Type definitions** — Interfaces specific to this forge's data model

---

## 6. Naming conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Directory | `forge-{name}` (kebab-case) | `forge-ink`, `forge-magnet` |
| Main component file | `{PascalName}Forge.tsx` | `InkRevealForge.tsx`, `VibrationForge.tsx` |
| Main component export | `{PascalName}Forge` | `export function VibrationForge(...)` |
| Store hook | `use{PascalName}Store` | `useInkStore`, `useMagnetStore` |
| Store file | `store.ts` | Always at module root |
| Config file | `config.ts` | Always at module root |
| Hook files | `use{Feature}.ts` | `useInkGameEngine.ts` |
| VFX files | `{name}-vfx.ts` | `ink-vfx.ts` |
| localStorage key | `grimoire_forge_{name}` | `grimoire_forge_ink` |
| ForgeModule key | `{name}` | `"ink"`, `"magnet"` |

---

## 7. UX contract — Juicy states

Every interactive forge should implement four distinct visual/audio states for its primary interaction:

| State | Visual | Audio | Duration |
|-------|--------|-------|----------|
| **Idle** | Default appearance, interactive | None | Until user acts |
| **Doing** | Active animation (spinner, progress ring, waveform) | Ambient/feedback sound | While action runs |
| **Failing** | Red/danger theme, shake animation | Error sound | ~3 seconds, auto-resets to idle |
| **Successful** | Green/success theme, checkmark, glow | Victory sound | Persistent until modal dismissed |

**Implementation patterns seen in existing forges:**

- **Typed phase state**: `type Phase = "idle" | "listening" | "detected" | "failed"` (forge-vibration)
- **Boolean flags**: `isPlaying`, `isChecking`, `hasError`, `showPicker` (forge-magnet)
- **Animated transitions**: Shake via CSS animation reset trick (`el.style.animation = "none"; void el.offsetHeight; el.style.animation = "shake 0.5s ease"`)
- **Auto-reset on failure**: `setTimeout(() => setPhase("idle"), 3000)`

### Sound functions

Available sound functions from `src/audio.ts`:

- Generic: `sndClick()`, `sndOk()`, `sndForgeReveal()`
- Detection: `sndAnalysis()`, `sndDeepListen()`
- Ink-specific: `sndInkDrop()`, `sndInkHit()`, `sndInkMiss()`, `sndInkWordSolved()`, `sndInkGuessError()`
- Scramble: `sndLetterSwap()`, `sndScrambleSolved()`

Add new sound functions in `src/audio.ts` if needed.

### Particle effects

Use `spawnParticles(x, y, count, color)` from `src/particles.ts` for burst effects.

---

## 8. Home Assistant integration

If the forge requires physical sensor interaction:

- Use `getEntityState(entityId)` for single reads (returns `string | null`)
- Use `pollEntityState(entityId, targetState, timeoutMs)` for timed polling (returns `Promise<boolean>`, polls every 500ms)
- Use `fireEvent(event)` to trigger HA automations
- All functions are in `src/ha.ts`

Entity ID convention: `{domain}.gift_grimoire_{sensor_name}` (e.g., `binary_sensor.gift_grimoire_vibration_vibration`)

---

## 9. Common patterns

### EnigmaPicker integration

Every forge shows an `EnigmaPicker` modal on completion:

```tsx
{showPicker && (
  <EnigmaPicker onClose={() => { setShowPicker(false); onSolve(); }} />
)}
```

The picker lets the player choose a rune reward. `onSolve()` is called when the picker closes, not when the puzzle mechanic is solved.

### Solved view

When `solved` is `true`, render a static, non-interactive view showing the completed state (green theme, checkmark, success message). No buttons, no interactivity.

### Daily limits

For forges with daily attempt restrictions:
- Track a `playedAt: number | null` timestamp in the store
- Use `isAttemptUsedToday(timestamp)` from `src/store.ts` to check
- Show a countdown via `useCountdown()` hook from `src/hooks/useCountdown.ts`
- `msUntilMidnight()` from `src/store.ts` provides the remaining time

### Daily reset (game progress)

For forges that reset progress daily:
- Store a `dayStamp: string` in format `YYYY-MM-DD`
- On mount, compare with `new Date().toISOString().slice(0, 10)`
- If stale, discard saved state and reinitialize

---

## 10. Checklist — New forge module validation

Use this checklist to verify a new forge module is complete and compliant:

### Structure
- [ ] Directory created at `src/modules/forges/forge-{name}/`
- [ ] `config.ts` exists with all constants (no hardcoded values in components)
- [ ] Main component file at `components/{Name}Forge.tsx`
- [ ] `DOCUMENTATION.md` exists with all 3 required sections

### Interfaces
- [ ] Main component accepts `ForgeProps` (`solved`, `onSolve`)
- [ ] Component renders a static solved view when `solved === true`
- [ ] `onSolve()` is called exactly once on completion (after `EnigmaPicker` dismissal)

### Registration
- [ ] Entry added to `FORGES[]` in `forges.config.ts`
- [ ] `key` is unique across all forges
- [ ] `title` and `successMessage` are in French, poetic tone
- [ ] `onReset` is provided if the forge uses a persistent store

### State (if applicable)
- [ ] Store file at `store.ts` using Zustand + `persist` middleware
- [ ] localStorage key follows `grimoire_forge_{name}` convention
- [ ] Store exposes a `reset()` method
- [ ] Store hook named `use{Name}Store`

### UX
- [ ] Four juicy states implemented (idle, doing, failing, successful)
- [ ] Failing state auto-resets to idle after ~3 seconds
- [ ] Sound effects used for key interactions
- [ ] `EnigmaPicker` shown on completion
- [ ] Shake animation on failure

### Integration
- [ ] No hardcoded HA entity IDs in components (use `config.ts`)
- [ ] All timing values in `config.ts`
- [ ] Imports use relative paths from module root
