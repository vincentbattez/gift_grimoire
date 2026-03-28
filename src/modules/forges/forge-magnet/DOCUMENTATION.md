# Forge — La chaleur de l'Arc-en-ciel

## Game explanation

Gift Grimoire is a narrative puzzle game disguised as a romantic gift. The player progresses through a series of "forges" — interactive challenges embedded in a mystical grimoire. Each forge unlocks a rune fragment upon completion, advancing the story.

This forge combines physical interaction (a magnetic sensor) with digital audio playback, bridging the real world and the game interface through Home Assistant integration.

## Module objective

The player must listen to an audio enigma narrated by a Dark Vador-inspired character, then physically activate a magnetic sensor to prove they've solved the riddle. The lore frames this as "warming the dark heart of Dark Vador" — a metaphor for bringing light to darkness through friendship.

The forge enforces a daily attempt limit: one audio play per calendar day. After listening, the player has a verification window to trigger the magnetic switch.

## Features

### Audio playback

Plays an MP3 enigma file (`pascale-dark_vador-enigme.mp3`) via the browser `Audio` API. While playing, an animated waveform visualization (`WideWaveform`) provides visual feedback. The button is disabled during playback to prevent double-triggering.

### Daily attempt limit

Tracks the last audio play timestamp in a Zustand store (`useMagnetStore`, persisted as `grimoire_forge_magnet`). Uses `isAttemptUsedToday()` to restrict playback to once per calendar day. A countdown timer shows the time remaining until midnight when the attempt resets.

### Home Assistant magnetic sensor detection

After audio playback, the player enters verification mode. Clicking "Tenter un rapprochement" polls the Home Assistant entity `input_boolean.gift_grimoire_aimant` twice over a 5-second window (`CHECK_DURATION_MS`). If the sensor reads `"on"` at either check, the forge is considered solved.

### State machine UI

The component renders different visual states:

- **Idle** — Play button with waveform preview and "Ecouter le secret" label
- **Playing** — Disabled button with animated waveform and "Lecture en cours..." label
- **Checking** — Gold-themed spinner and waveform, "Les forces convergent..." label
- **Error** — Red-themed shake animation, "Rien ne s'est produit" label, auto-clears after 3 seconds
- **Success** — Green-themed waveform with checkmark, triggers `EnigmaPicker` modal

### Safety modals

- **AudioWarningModal** — Shown before first audio play (GDPR/UX audio consent)
- **LastAttemptModal** — Confirmation dialog reminding the player this is their only daily attempt

### Solved view

Once persisted as solved, renders a static green waveform with a checkmark badge and the message "Dark Vador a trouve un nouvel ami".

### Admin reset

Exposes `onReset` via `useMagnetStore.getState().reset()`, which clears `darkVadorPlayedAt` to allow re-playing.
