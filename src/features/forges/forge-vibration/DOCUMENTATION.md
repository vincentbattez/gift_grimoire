# Forge — Le Murmure Invisible

## Game explanation

Gift Grimoire is a narrative puzzle game disguised as a romantic gift. The player progresses through a series of "forges" — interactive challenges embedded in a mystical grimoire. Each forge unlocks a rune fragment upon completion, advancing the story.

This forge bridges the physical and digital worlds by requiring the player to trigger a real vibration sensor connected via Home Assistant.

## Module objective

The player must "listen to the invisible murmur" — a poetic way of saying they need to activate a physical vibration sensor within a timed window. The lore frames this as reaching out to sense something hidden, a key born from silence.

The forge has no daily limit and can be retried immediately after failure.

## Features

### Timed listening phase

When the player taps "Tendre l'oreille", a 10-second listening window begins (`LISTEN_DURATION_MS = 10_000`). During this window, the component polls the Home Assistant entity `binary_sensor.gift_grimoire_vibration_vibration` for an `"on"` state via `pollEntityState()` (polling every 500ms by default).

### Progress ring

A circular SVG progress indicator animates during the listening phase. The ring uses `strokeDashoffset` updated every 50ms to show elapsed time as a smooth arc that fills over 10 seconds.

### Phase-based state machine

The component uses a typed phase state:

- **idle** — Default state, shows a circular button with a sound wave icon and "Tendre l'oreille" label
- **listening** — Animated progress ring, ping ripple effects, accent-colored theme, "Concentration..." label, ambient `sndDeepListen()` audio
- **detected** — Green success theme, checkmark icon, `sndOk()` plays, device vibration (`navigator.vibrate(200)`), triggers `EnigmaPicker` modal
- **failed** — Red theme, shake animation on button, "Rien ne s'est eveille" label, auto-resets to idle after 3 seconds

### Ambient sound

During the listening phase, `sndDeepListen()` plays a continuous ambient audio loop. The returned stop function is stored in a ref and called when detection succeeds or the window expires.

### Device vibration feedback

On successful detection, calls `navigator.vibrate?.(200)` to provide haptic confirmation. Fails silently on unsupported devices.

### Visual effects

- **Ping ripples** — Three concentric expanding rings during listening phase (staggered by 0.8s delays)
- **Success glow** — Radial gradient pulse around the button on detection
- **Shake animation** — CSS shake on failure, triggered by animation reset trick

### EnigmaPicker integration

On detection, displays the `EnigmaPicker` modal for rune selection. Closing the picker calls `onSolve()` to persist the completion.

### Solved view

Once persisted as solved, renders a static green ring at full progress with a checkmark and "Vibration detectee" label.

### No persistent state

This module uses only React component state. There is no Zustand store, no localStorage, and no daily limit.
