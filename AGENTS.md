# AGENTS.md

## Commands

- Package manager: `yarn` (not npm/pnpm)
- Build includes typecheck: `yarn build` runs `tsc -b && vite build`
- No test framework — no tests exist

## Landmines

- **Enigma IDs are tied to physical QR codes.** IDs in `src/config.ts` (`"5"`, `"Y"`, `"2g"`, `"F"`, `"X"`, `"2d"`) are encoded in printed QR codes. Changing or removing an ID breaks the corresponding physical card.
- **Zustand store persists to localStorage under key `grimoire_v3`.** Changing the persisted state shape (`enigmas`, `lastAttempt`) without a migration strategy will silently reset all user progress.
