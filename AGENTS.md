# AGENTS.md

## Naming conventions

Every identifier must be **self-documenting** — no abbreviations, no single-letter names.

### Rules

- **No abbreviations.** Write the full word even if it's long. `event` not `evt`, `error` not `err` etc.
- **No single-letter variables.**
- **Descriptive over generic.** Prefer `cardBounds` over `rect`. The name should tell you *what it represents*, not just its type.
- **Booleans** must use a prefix: `is`, `has`, `should`, `can`, `did`, `will`, `must`.
- **Arrays** must contain `List` (camelCase) or `_LIST` (UPPER_CASE) in the name.
- **Interfaces** must use prefix `I` (e.g. `IUserConfig`).
- **Enums** must use suffix `Enum` (e.g. `StatusEnum`), members in `UPPER_CASE`.
- **Imports** must use path aliases (`@/`, `@features/`, `@components/`), never `../`.

### Applies to

All variables, parameters, function names, type properties, and constants across the entire codebase.

## Used tools
- Issue tracker: Linear
- Git hosting: GitHub
- Package manager: Bun
- Build tool: Vite
- State management: Zustand
- Styling: Tailwind CSS
- Language: TypeScript
- Framework: React

## Commands

- Package manager: `bun` (not yarn/npm/pnpm)
- Build includes typecheck: `bun run build` runs `tsc -b && vite build`
- Tests: `bun run test` / `bun run test:coverage`

## Landmines

- **Enigma IDs are tied to physical QR codes.** IDs in `src/config.ts` (`"5"`, `"Y"`, `"2g"`, `"F"`, `"X"`, `"2d"`) are encoded in printed QR codes. Changing or removing an ID breaks the corresponding physical card.
- **Zustand store persists to localStorage under key `grimoire_v3`.** Changing the persisted state shape (`enigmas`, `lastAttempt`) without a migration strategy will silently reset all user progress.

## Design & tone — non-negotiable

> **Context:** This site is a romantic gift — the sole audience is the creator's wife. She must feel like the heroine of a story written for her. Every decision serves that.

### Interaction design

- **4-state model.** Interactive element can handle **idle, disable, doing, failing, successful**, each with its own visual treatment AND sound effect.
- **VFX on everything.** Particles, glows, shakes, scale pulses. Transitions are animated (no opacity-only fades, no instant swaps). Prefer spring/physics-based easing over linear/ease-in-out.
- **SFX on everything.** Every user action produces a sound. Success is celebratory, failure is expressive (not punishing), idle has subtle ambient cues where appropriate.

### Copy & writing

- **She is the heroine.** All user-facing text is written as if narrating her personal adventure — uncovering secrets, traversing enigmas. Second person, present tense.
- **Poetic, never utilitarian.** No generic labels ("Submit", "Error", "Loading"). Rewrite them to fit the narrative.
- **Romantic register.** Vocabulary must evoke wonder, intimacy, mystery. No tech jargon, no dry instructions.
