import { randomVisual } from "@/utils/random";

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  audioContext ??= new AudioContext();

  return audioContext;
}

function tone(frequency: number, type: OscillatorType, volume: number, duration: number, delay = 0): void {
  const context = getAudioContext();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  const currentTime = context.currentTime + delay;
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gainNode.gain.setValueAtTime(0, currentTime);
  gainNode.gain.linearRampToValueAtTime(volume, currentTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + duration);
  oscillator.start(currentTime);
  oscillator.stop(currentTime + duration);
}

export const sndUnlock = (): void => {
  [523, 659, 784, 1047, 1319].forEach((frequency, i) => {
    tone(frequency, "sine", 0.22, 0.55, i * 0.09);
  });
};

export const sndOk = (): void => {
  [523, 659, 784].forEach((frequency, i) => {
    tone(frequency, "triangle", 0.18, 1.2, i * 0.05);
  });
  tone(1047, "sine", 0.28, 1.8, 0.3);
};

export const sndBad = (): void => {
  tone(165, "sawtooth", 0.3, 0.28);
  tone(148, "sawtooth", 0.3, 0.28, 0.12);
};

export const sndClick = (): void => {
  tone(900, "sine", 0.09, 0.1);
};

/** Bubbly heart pop — pitch varies per call for organic feel */
export const sndHeartPop = (pitchOffset = 0): void => {
  const base = 1200 + pitchOffset;
  const context = getAudioContext();
  const currentTime = context.currentTime;

  // Round bubble attack
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(base * 0.7, currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(base, currentTime + 0.025);
  oscillator.frequency.exponentialRampToValueAtTime(base * 0.85, currentTime + 0.12);
  gainNode.gain.setValueAtTime(0, currentTime);
  gainNode.gain.linearRampToValueAtTime(0.1, currentTime + 0.008);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + 0.15);
  oscillator.start(currentTime);
  oscillator.stop(currentTime + 0.16);

  // Airy harmonic shimmer
  tone(base * 1.5, "sine", 0.025, 0.09, 0.01);
};

/** Modern fluid swap — letter slides into place */
export const sndLetterSwap = (): void => {
  const context = getAudioContext();
  const currentTime = context.currentTime;

  // Main body — pitch arc up then resolves down ("spring into place")
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(310, currentTime);
  oscillator.frequency.linearRampToValueAtTime(620, currentTime + 0.022);
  oscillator.frequency.exponentialRampToValueAtTime(250, currentTime + 0.14);
  gainNode.gain.setValueAtTime(0, currentTime);
  gainNode.gain.linearRampToValueAtTime(0.17, currentTime + 0.007);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + 0.16);
  oscillator.start(currentTime);
  oscillator.stop(currentTime + 0.17);

  // Octave harmonic — adds richness without harshness
  tone(620, "sine", 0.04, 0.11, 0.005);

  // High shimmer — modern sparkle
  tone(2500, "sine", 0.016, 0.08, 0.006);

  // Warm sub tail — fullness
  tone(125, "triangle", 0.065, 0.13, 0.012);
};

/** Shimmering chime — scramble solved */
export const sndScrambleSolved = (): void => {
  // Quick ascending sparkle
  [784, 988, 1175, 1568].forEach((frequency, i) => {
    tone(frequency, "sine", 0.15, 0.4, i * 0.08);
  });

  // Sustained resolve chord
  [1047, 1319, 1568].forEach((frequency, i) => {
    tone(frequency, "triangle", 0.12, 1.4, 0.35 + i * 0.03);
  });
};

export const sndVictory = (): void => {
  // Arpège ascendant rapide (Do-Mi-Sol-Do-Mi)
  [523, 659, 784, 1047, 1319].forEach((frequency, i) => {
    tone(frequency, "triangle", 0.16, 0.6, i * 0.07);
  });

  // Accord majeur soutenu
  [1047, 1319, 1568].forEach((frequency, i) => {
    tone(frequency, "sine", 0.22, 2.2, 0.4 + i * 0.03);
  });
  // Note haute scintillante
  tone(2093, "sine", 0.12, 1.5, 0.6);
};

/** Gentle close — descending music-box + warm settle */
export const sndLoveClose = (): void => {
  const context = getAudioContext();
  const currentTime = context.currentTime;

  // Descending music-box arpeggio (mirror of sndLoveReveal)
  [523, 659, 784, 1047, 1203, 1402].forEach((frequency, i) => {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    const noteStartTime = currentTime + i * 0.11;
    gainNode.gain.setValueAtTime(0, noteStartTime);
    gainNode.gain.linearRampToValueAtTime(0.09, noteStartTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, noteStartTime + 0.9);
    oscillator.start(noteStartTime);
    oscillator.stop(noteStartTime + 0.9);
  });
};

/** Metallic click — key inserting into keyhole */
export const sndKeyInsert = (): void => {
  const context = getAudioContext();
  const currentTime = context.currentTime;

  // Sharp metallic impact
  tone(2800, "square", 0.15, 0.04);
  tone(4200, "square", 0.1, 0.03, 0.01);

  // Resonant ring after impact
  tone(1200, "sine", 0.12, 0.3, 0.03);
  tone(800, "sine", 0.08, 0.25, 0.05);

  // Subtle low thud
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(200, currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(60, currentTime + 0.15);
  gainNode.gain.setValueAtTime(0.2, currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + 0.15);
  oscillator.start(currentTime);
  oscillator.stop(currentTime + 0.15);
};

/** Mechanical lock opening — bolt sliding + spring release */
export const sndLockOpen = (): void => {
  const context = getAudioContext();
  const currentTime = context.currentTime;

  // Bolt sliding (noise-like descending tone)
  const primaryOscillator = context.createOscillator();
  const primaryGainNode = context.createGain();
  primaryOscillator.connect(primaryGainNode);
  primaryGainNode.connect(context.destination);
  primaryOscillator.type = "sawtooth";
  primaryOscillator.frequency.setValueAtTime(600, currentTime);
  primaryOscillator.frequency.exponentialRampToValueAtTime(120, currentTime + 0.25);
  primaryGainNode.gain.setValueAtTime(0.12, currentTime);
  primaryGainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + 0.3);
  primaryOscillator.start(currentTime);
  primaryOscillator.stop(currentTime + 0.3);

  // Spring release click
  tone(3200, "square", 0.13, 0.02, 0.12);
  tone(1800, "sine", 0.1, 0.15, 0.13);

  // Satisfying low resonance
  tone(180, "sine", 0.15, 0.4, 0.15);
  tone(280, "triangle", 0.08, 0.3, 0.2);
};

/** Radar analysis scan — 5 pings over ~5s, auto-fades */
/** Suspenseful analysis sound — 7s with drone + radar pings + final beep.
 *  Accepts offsetSec to resume from a given point. Returns a stop function. */
export function sndAnalysis(offsetSec = 0): () => void {
  const context = getAudioContext();
  const currentTime = context.currentTime;
  const DUR = 7;
  const allNodeList: { oscillator: OscillatorNode; gainNode: GainNode }[] = [];

  // Low background drone
  const drone = context.createOscillator();
  const droneGainNode = context.createGain();
  drone.connect(droneGainNode);
  droneGainNode.connect(context.destination);
  drone.type = "sine";
  drone.frequency.value = 85;
  const droneStart = Math.max(0, 0.5 - offsetSec);
  droneGainNode.gain.setValueAtTime(offsetSec >= 0.5 ? 0.05 : 0, currentTime);

  if (offsetSec < 0.5) {
    droneGainNode.gain.linearRampToValueAtTime(0.05, currentTime + droneStart);
  }
  droneGainNode.gain.setValueAtTime(0.05, currentTime + Math.max(0, 5.8 - offsetSec));
  droneGainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + Math.max(0.01, DUR - offsetSec));
  drone.start(currentTime);
  drone.stop(currentTime + Math.max(0.02, DUR - offsetSec));
  allNodeList.push({ oscillator: drone, gainNode: droneGainNode });

  // 7 radar pings — one every ~0.85s
  for (let i = 0; i < 7; i++) {
    const pingTime = i * 0.85;

    if (pingTime + 0.55 <= offsetSec) {
      continue;
    } // already played
    const delay = Math.max(0, pingTime - offsetSec);

    // Ascending chirp
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(900 + i * 45, currentTime + delay);
    oscillator.frequency.exponentialRampToValueAtTime(2200 + i * 60, currentTime + delay + 0.18);
    gainNode.gain.setValueAtTime(0.0001, currentTime + delay);
    gainNode.gain.linearRampToValueAtTime(0.13, currentTime + delay + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + delay + 0.45);
    oscillator.start(currentTime + delay);
    oscillator.stop(currentTime + delay + 0.45);
    allNodeList.push({ oscillator, gainNode });

    // Echo
    const echoOscillator = context.createOscillator();
    const echoGainNode = context.createGain();
    echoOscillator.connect(echoGainNode);
    echoGainNode.connect(context.destination);
    echoOscillator.type = "sine";
    echoOscillator.frequency.setValueAtTime(900 + i * 45, currentTime + delay + 0.1);
    echoOscillator.frequency.exponentialRampToValueAtTime(2200 + i * 60, currentTime + delay + 0.28);
    echoGainNode.gain.setValueAtTime(0.0001, currentTime + delay + 0.1);
    echoGainNode.gain.linearRampToValueAtTime(0.045, currentTime + delay + 0.12);
    echoGainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + delay + 0.55);
    echoOscillator.start(currentTime + delay + 0.1);
    echoOscillator.stop(currentTime + delay + 0.55);
    allNodeList.push({ oscillator: echoOscillator, gainNode: echoGainNode });
  }

  return () => {
    const now = context.currentTime;
    for (const { oscillator, gainNode } of allNodeList) {
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
      oscillator.stop(now + 0.2);
    }
  };
}

/** Curious questioning sound — ascending interval like a musical "hmm?" */
export function sndDoubt(): void {
  const context = getAudioContext();
  const currentTime = context.currentTime;

  // Soft wondering hum — rising pitch
  const humOscillator = context.createOscillator();
  const humGainNode = context.createGain();
  humOscillator.connect(humGainNode);
  humGainNode.connect(context.destination);
  humOscillator.type = "sine";
  humOscillator.frequency.setValueAtTime(220, currentTime);
  humOscillator.frequency.linearRampToValueAtTime(330, currentTime + 0.6);
  humGainNode.gain.setValueAtTime(0, currentTime);
  humGainNode.gain.linearRampToValueAtTime(0.06, currentTime + 0.08);
  humGainNode.gain.setValueAtTime(0.06, currentTime + 0.4);
  humGainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + 0.8);
  humOscillator.start(currentTime);
  humOscillator.stop(currentTime + 0.85);

  // Two-note questioning motif — rising minor third (like "hm?")
  for (const [frequency, delay] of [
    [523, 0.15],
    [622, 0.4],
  ] as const) {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.type = "triangle";
    oscillator.frequency.value = frequency;
    gainNode.gain.setValueAtTime(0.0001, currentTime + delay);
    gainNode.gain.linearRampToValueAtTime(0.08, currentTime + delay + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + delay + 0.35);
    oscillator.start(currentTime + delay);
    oscillator.stop(currentTime + delay + 0.4);
  }

  // Final high questioning ping — ends on an unresolved note
  const pingOscillator = context.createOscillator();
  const pingGainNode = context.createGain();
  pingOscillator.connect(pingGainNode);
  pingGainNode.connect(context.destination);
  pingOscillator.type = "sine";
  pingOscillator.frequency.setValueAtTime(1047, currentTime + 0.65);
  pingOscillator.frequency.linearRampToValueAtTime(1175, currentTime + 0.9);
  pingGainNode.gain.setValueAtTime(0.0001, currentTime + 0.65);
  pingGainNode.gain.linearRampToValueAtTime(0.05, currentTime + 0.68);
  pingGainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + 1.1);
  pingOscillator.start(currentTime + 0.65);
  pingOscillator.stop(currentTime + 1.15);
}

/** Deep listening drone — 10s meditative ambience, returns stop function */
export function sndDeepListen(): () => void {
  const context = getAudioContext();
  const currentTime = context.currentTime;
  const DUR = 10;
  const allNodeList: { oscillator: OscillatorNode; gainNode: GainNode }[] = [];

  // Warm sub-bass with slow breathing LFO (~0.15 Hz)
  const subOscillator = context.createOscillator();
  const subGainNode = context.createGain();
  const breathLfoOscillator = context.createOscillator();
  const breathDepthGainNode = context.createGain();
  subOscillator.connect(subGainNode);
  subGainNode.connect(context.destination);
  subOscillator.type = "sine";
  subOscillator.frequency.value = 55;
  breathLfoOscillator.connect(breathDepthGainNode);
  breathDepthGainNode.connect(subGainNode.gain);
  breathLfoOscillator.type = "sine";
  breathLfoOscillator.frequency.value = 0.15;
  breathDepthGainNode.gain.value = 0.03;
  subGainNode.gain.setValueAtTime(0, currentTime);
  subGainNode.gain.linearRampToValueAtTime(0.07, currentTime + 2);
  subGainNode.gain.setValueAtTime(0.07, currentTime + DUR - 2);
  subGainNode.gain.linearRampToValueAtTime(0.0001, currentTime + DUR);
  subOscillator.start(currentTime);
  subOscillator.stop(currentTime + DUR);
  breathLfoOscillator.start(currentTime);
  breathLfoOscillator.stop(currentTime + DUR);
  allNodeList.push({ oscillator: subOscillator, gainNode: subGainNode });

  // Binaural-like beating — two close frequencies creating a slow 3Hz pulse
  for (const frequency of [200, 203]) {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(0.025, currentTime + 3);
    gainNode.gain.setValueAtTime(0.025, currentTime + DUR - 2.5);
    gainNode.gain.linearRampToValueAtTime(0.0001, currentTime + DUR);
    oscillator.start(currentTime);
    oscillator.stop(currentTime + DUR);
    allNodeList.push({ oscillator, gainNode });
  }

  // Ethereal high harmonic — slowly drifting pitch
  const highOscillator = context.createOscillator();
  const highGainNode = context.createGain();
  highOscillator.connect(highGainNode);
  highGainNode.connect(context.destination);
  highOscillator.type = "sine";
  highOscillator.frequency.setValueAtTime(660, currentTime);
  highOscillator.frequency.linearRampToValueAtTime(880, currentTime + DUR * 0.6);
  highOscillator.frequency.linearRampToValueAtTime(740, currentTime + DUR);
  highGainNode.gain.setValueAtTime(0, currentTime);
  highGainNode.gain.linearRampToValueAtTime(0.015, currentTime + 4);
  highGainNode.gain.setValueAtTime(0.015, currentTime + DUR - 3);
  highGainNode.gain.linearRampToValueAtTime(0.0001, currentTime + DUR);
  highOscillator.start(currentTime);
  highOscillator.stop(currentTime + DUR);
  allNodeList.push({ oscillator: highOscillator, gainNode: highGainNode });

  // Soft periodic pings — 5 very subtle sonar-like tones spread across 10s
  for (let i = 0; i < 5; i++) {
    const pingTime = currentTime + 1.5 + i * 1.8;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(1200 + i * 40, pingTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, pingTime + 0.8);
    gainNode.gain.setValueAtTime(0.0001, pingTime);
    gainNode.gain.linearRampToValueAtTime(0.04, pingTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, pingTime + 0.8);
    oscillator.start(pingTime);
    oscillator.stop(pingTime + 0.85);
    allNodeList.push({ oscillator, gainNode });
  }

  return () => {
    const now = context.currentTime;
    for (const { oscillator, gainNode } of allNodeList) {
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      oscillator.stop(now + 0.45);
    }

    try {
      breathLfoOscillator.stop(now + 0.45);
    } catch {
      /* AudioNode déjà arrêté */
    }
  };
}

/** Modern slide transition — clean digital tick + airy swipe */
export const sndPageTurn = (): void => {
  const context = getAudioContext();
  const currentTime = context.currentTime;

  // Clean digital tick — short sine pop
  const popOscillator = context.createOscillator();
  const popGainNode = context.createGain();
  popOscillator.connect(popGainNode);
  popGainNode.connect(context.destination);
  popOscillator.type = "sine";
  popOscillator.frequency.setValueAtTime(1400, currentTime);
  popOscillator.frequency.exponentialRampToValueAtTime(600, currentTime + 0.04);
  popGainNode.gain.setValueAtTime(0.12, currentTime);
  popGainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + 0.06);
  popOscillator.start(currentTime);
  popOscillator.stop(currentTime + 0.07);

  // Soft harmonic tail
  tone(880, "sine", 0.04, 0.1, 0.02);
};

/** Grimoire open — cinematic bass drop + crystal reveal */
export const sndGrimoireOpen = (): void => {
  const context = getAudioContext();
  const currentTime = context.currentTime;

  // Sub bass impact — modern "drop" feel
  const subOscillator = context.createOscillator();
  const subGainNode = context.createGain();
  subOscillator.connect(subGainNode);
  subGainNode.connect(context.destination);
  subOscillator.type = "sine";
  subOscillator.frequency.setValueAtTime(120, currentTime);
  subOscillator.frequency.exponentialRampToValueAtTime(40, currentTime + 0.3);
  subGainNode.gain.setValueAtTime(0.2, currentTime);
  subGainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + 0.5);
  subOscillator.start(currentTime);
  subOscillator.stop(currentTime + 0.5);

  // Crystal ping — two-note interval (modern UI reveal)
  tone(1320, "sine", 0.1, 0.4, 0.08);
  tone(1760, "sine", 0.08, 0.5, 0.16);

  // Soft pad chord — warm digital glow
  [440, 554, 660].forEach((frequency, i) => {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    const noteStartTime = currentTime + 0.12 + i * 0.02;
    gainNode.gain.setValueAtTime(0, noteStartTime);
    gainNode.gain.linearRampToValueAtTime(0.05, noteStartTime + 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, noteStartTime + 1.2);
    oscillator.start(noteStartTime);
    oscillator.stop(noteStartTime + 1.2);
  });
};

/** Warm romantic reveal — music-box arpeggio + sustained pad + shimmer */
export const sndLoveReveal = (): void => {
  const context = getAudioContext();
  const currentTime = context.currentTime;

  // Music-box arpeggio (C major, gentle)
  [523, 659, 784, 1047].forEach((frequency, i) => {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    const noteStartTime = currentTime + i * 0.14;
    gainNode.gain.setValueAtTime(0, noteStartTime);
    gainNode.gain.linearRampToValueAtTime(0.13, noteStartTime + 0.025);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, noteStartTime + 1.4);
    oscillator.start(noteStartTime);
    oscillator.stop(noteStartTime + 1.4);
  });

  // Warm sustained pad chord
  [523, 659, 784].forEach((frequency, i) => {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.type = "triangle";
    oscillator.frequency.value = frequency;
    const noteStartTime = currentTime + 0.5 + i * 0.02;
    gainNode.gain.setValueAtTime(0, noteStartTime);
    gainNode.gain.linearRampToValueAtTime(0.055, noteStartTime + 0.35);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, noteStartTime + 2.8);
    oscillator.start(noteStartTime);
    oscillator.stop(noteStartTime + 2.8);
  });

  // High shimmer sparkles
  tone(2093, "sine", 0.035, 1.6, 0.55);
  tone(2637, "sine", 0.025, 1.3, 0.75);
};

/** Golden seal — warm chime when card reaches its final golden state */
export const sndGoldenSeal = (): void => {
  const context = getAudioContext();
  const currentTime = context.currentTime;

  // Warm golden bell — two harmonics with slow decay
  [659, 880].forEach((frequency, i) => {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    const noteStartTime = currentTime + i * 0.12;
    gainNode.gain.setValueAtTime(0, noteStartTime);
    gainNode.gain.linearRampToValueAtTime(0.14, noteStartTime + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, noteStartTime + 1.8);
    oscillator.start(noteStartTime);
    oscillator.stop(noteStartTime + 1.8);
  });

  // Shimmering overtone — golden sparkle
  tone(1760, "sine", 0.04, 1.2, 0.15);
  tone(2217, "sine", 0.025, 0.9, 0.25);

  // Sub warmth — weight and presence
  tone(330, "triangle", 0.06, 1.4, 0.08);
};

/** Soft typewriter key — quill on parchment */
export const sndQuillTap = (pitchOffset = 0): void => {
  const context = getAudioContext();
  const currentTime = context.currentTime;
  const frequency = 3200 + pitchOffset * 400;
  // Soft click
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.6, currentTime + 0.04);
  gainNode.gain.setValueAtTime(0.03, currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + 0.06);
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start(currentTime);
  oscillator.stop(currentTime + 0.06);
};

/** Golden shimmer — special word emphasis */
export const sndGoldenWord = (): void => {
  tone(880, "sine", 0.06, 0.8);
  tone(1320, "sine", 0.03, 0.6, 0.05);
};

/** Wax seal — continuous warm crackling while pressing (returns stop function) */
export const sndWaxMelt = (): (() => void) => {
  const context = getAudioContext();
  const currentTime = context.currentTime;

  // Warm low crackle — wax melting under heat
  const noise = context.createBufferSource();
  const noiseBuffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (randomVisual() * 2 - 1) * (randomVisual() > 0.92 ? 0.6 : 0.08);
  }
  noise.buffer = noiseBuffer;
  noise.loop = true;

  const lowpassFilter = context.createBiquadFilter();
  lowpassFilter.type = "lowpass";
  lowpassFilter.frequency.value = 400;
  lowpassFilter.Q.value = 1.2;

  const gainNode = context.createGain();
  gainNode.gain.setValueAtTime(0, currentTime);
  gainNode.gain.linearRampToValueAtTime(0.12, currentTime + 0.3);

  noise.connect(lowpassFilter);
  lowpassFilter.connect(gainNode);
  gainNode.connect(context.destination);
  noise.start(currentTime);

  // Soft warm hum — heat source
  const humOscillator = context.createOscillator();
  const humGainNode = context.createGain();
  humOscillator.type = "sine";
  humOscillator.frequency.value = 90;
  humGainNode.gain.setValueAtTime(0, currentTime);
  humGainNode.gain.linearRampToValueAtTime(0.04, currentTime + 0.5);
  humOscillator.connect(humGainNode);
  humGainNode.connect(context.destination);
  humOscillator.start(currentTime);

  return () => {
    const now = context.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    humGainNode.gain.cancelScheduledValues(now);
    humGainNode.gain.setValueAtTime(humGainNode.gain.value, now);
    humGainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

    setTimeout(() => {
      noise.stop();
      humOscillator.stop();
    }, 300);
  };
};

/** Wax seal stamp — satisfying press impact */
export const sndWaxStamp = (): void => {
  const context = getAudioContext();
  const currentTime = context.currentTime;

  // Deep thud — stamp pressing into wax
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(180, currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(60, currentTime + 0.15);
  gainNode.gain.setValueAtTime(0.2, currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + 0.4);
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start(currentTime);
  oscillator.stop(currentTime + 0.4);

  // Metallic ring — seal embossing
  tone(1200, "sine", 0.08, 1.5, 0.05);
  tone(1800, "sine", 0.04, 1.2, 0.08);

  // Warm golden bell cascadeList — triumphant seal
  [523, 659, 784, 1047].forEach((frequency, i) => {
    tone(frequency, "sine", 0.06, 1.8, 0.15 + i * 0.12);
  });

  // Sub resonance — weight
  tone(110, "triangle", 0.05, 1.6, 0.05);
};

/** Forge seal break — arcane seal cracking + crystalline shatter + mystical resolve */
export const sndForgeReveal = (): void => {
  const context = getAudioContext();
  const currentTime = context.currentTime;

  // Phase 1: Deep arcane rumble — the seal strains
  const rumbleOscillator = context.createOscillator();
  const rumbleGainNode = context.createGain();
  rumbleOscillator.connect(rumbleGainNode);
  rumbleGainNode.connect(context.destination);
  rumbleOscillator.type = "sawtooth";
  rumbleOscillator.frequency.setValueAtTime(60, currentTime);
  rumbleOscillator.frequency.exponentialRampToValueAtTime(35, currentTime + 0.4);
  rumbleGainNode.gain.setValueAtTime(0.18, currentTime);
  rumbleGainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + 0.5);
  rumbleOscillator.start(currentTime);
  rumbleOscillator.stop(currentTime + 0.5);

  // Phase 2: Crystalline shatter — rapid descending pings like glass breaking
  [3800, 3200, 2600, 2100, 1700].forEach((frequency, i) => {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, currentTime + 0.15 + i * 0.035);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.4, currentTime + 0.15 + i * 0.035 + 0.2);
    const noteStartTime = currentTime + 0.15 + i * 0.035;
    gainNode.gain.setValueAtTime(0, noteStartTime);
    gainNode.gain.linearRampToValueAtTime(0.09, noteStartTime + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, noteStartTime + 0.25);
    oscillator.start(noteStartTime);
    oscillator.stop(noteStartTime + 0.25);
  });

  // Phase 3: Mystical ascending resolve — the forge awakens
  [392, 494, 587, 784, 988].forEach((frequency, i) => {
    tone(frequency, "triangle", 0.12, 0.9, 0.4 + i * 0.08);
  });

  // Sustained ethereal chord — warmth settling in
  [784, 988, 1175].forEach((frequency, i) => {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    const noteStartTime = currentTime + 0.7 + i * 0.03;
    gainNode.gain.setValueAtTime(0, noteStartTime);
    gainNode.gain.linearRampToValueAtTime(0.07, noteStartTime + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, noteStartTime + 2.2);
    oscillator.start(noteStartTime);
    oscillator.stop(noteStartTime + 2.2);
  });

  // Final high shimmer — magic dust
  tone(2349, "sine", 0.03, 1.5, 0.85);
  tone(3136, "sine", 0.02, 1.2, 0.95);
};

/** Firework launch whistle — ascending pitch simulating a rocket rising */
export const sndFireworkLaunch = (pitch = 1): void => {
  const context = getAudioContext();
  const currentTime = context.currentTime;

  // Rising whistle
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(200 * pitch, currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(1800 * pitch, currentTime + 0.7);
  gainNode.gain.setValueAtTime(0, currentTime);
  gainNode.gain.linearRampToValueAtTime(0.07, currentTime + 0.05);
  gainNode.gain.setValueAtTime(0.07, currentTime + 0.5);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + 0.75);
  oscillator.start(currentTime);
  oscillator.stop(currentTime + 0.8);

  // Breathy noise layer — adds realism
  const noiseOscillator = context.createOscillator();
  const noiseGainNode = context.createGain();
  noiseOscillator.connect(noiseGainNode);
  noiseGainNode.connect(context.destination);
  noiseOscillator.type = "sawtooth";
  noiseOscillator.frequency.setValueAtTime(400 * pitch, currentTime);
  noiseOscillator.frequency.exponentialRampToValueAtTime(3000 * pitch, currentTime + 0.65);
  noiseGainNode.gain.setValueAtTime(0, currentTime);
  noiseGainNode.gain.linearRampToValueAtTime(0.025, currentTime + 0.05);
  noiseGainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + 0.7);
  noiseOscillator.start(currentTime);
  noiseOscillator.stop(currentTime + 0.75);
};

/** Firework crackle — burst of rapid micro-pops simulating sparkler crackle */
export const sndCrackle = (intensity = 1): void => {
  const context = getAudioContext();
  const currentTime = context.currentTime;

  // Deep boom — massive low-end impact
  const boomOscillator = context.createOscillator();
  const boomGainNode = context.createGain();
  boomOscillator.connect(boomGainNode);
  boomGainNode.connect(context.destination);
  boomOscillator.type = "sine";
  boomOscillator.frequency.setValueAtTime(80 * intensity, currentTime);
  boomOscillator.frequency.exponentialRampToValueAtTime(20, currentTime + 0.4);
  boomGainNode.gain.setValueAtTime(0.22 * intensity, currentTime);
  boomGainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + 0.5);
  boomOscillator.start(currentTime);
  boomOscillator.stop(currentTime + 0.55);

  // Sub-bass pressure wave — chest thump
  const subOscillator = context.createOscillator();
  const subGainNode = context.createGain();
  subOscillator.connect(subGainNode);
  subGainNode.connect(context.destination);
  subOscillator.type = "sine";
  subOscillator.frequency.setValueAtTime(45, currentTime);
  subOscillator.frequency.exponentialRampToValueAtTime(18, currentTime + 0.35);
  subGainNode.gain.setValueAtTime(0.18 * intensity, currentTime);
  subGainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + 0.4);
  subOscillator.start(currentTime);
  subOscillator.stop(currentTime + 0.45);

  // Mid rumble — distorted body
  const rumbleOscillator = context.createOscillator();
  const rumbleGainNode = context.createGain();
  rumbleOscillator.connect(rumbleGainNode);
  rumbleGainNode.connect(context.destination);
  rumbleOscillator.type = "sawtooth";
  rumbleOscillator.frequency.setValueAtTime(120 * intensity, currentTime + 0.02);
  rumbleOscillator.frequency.exponentialRampToValueAtTime(35, currentTime + 0.3);
  rumbleGainNode.gain.setValueAtTime(0, currentTime);
  rumbleGainNode.gain.linearRampToValueAtTime(0.1 * intensity, currentTime + 0.015);
  rumbleGainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + 0.35);
  rumbleOscillator.start(currentTime);
  rumbleOscillator.stop(currentTime + 0.4);

  // Crackle debris — lower-pitched pops spread over longer tail
  const count = Math.round(10 + intensity * 14);
  for (let i = 0; i < count; i++) {
    const delay = 0.04 + randomVisual() * 0.4 * intensity;
    const frequency = 400 + randomVisual() * 1800;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.type = i % 3 === 0 ? "sawtooth" : "square";
    oscillator.frequency.setValueAtTime(frequency, currentTime + delay);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.15, currentTime + delay + 0.06);
    const volume = (0.04 + randomVisual() * 0.06) * intensity;
    gainNode.gain.setValueAtTime(0, currentTime + delay);
    gainNode.gain.linearRampToValueAtTime(volume, currentTime + delay + 0.004);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + delay + 0.05 + randomVisual() * 0.05);
    oscillator.start(currentTime + delay);
    oscillator.stop(currentTime + delay + 0.12);
  }

  // Reverb tail — low sine echo that lingers
  const tailOscillator = context.createOscillator();
  const tailGainNode = context.createGain();
  tailOscillator.connect(tailGainNode);
  tailGainNode.connect(context.destination);
  tailOscillator.type = "sine";
  tailOscillator.frequency.setValueAtTime(60, currentTime + 0.1);
  tailOscillator.frequency.exponentialRampToValueAtTime(30, currentTime + 0.8);
  tailGainNode.gain.setValueAtTime(0, currentTime + 0.1);
  tailGainNode.gain.linearRampToValueAtTime(0.06 * intensity, currentTime + 0.15);
  tailGainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + 0.8);
  tailOscillator.start(currentTime + 0.1);
  tailOscillator.stop(currentTime + 0.85);
};

/** Epic finale — 7-second cinematic climax: rumble → ascending arpeggios → full chord → music-box resolution */
/** Narrative card flip — mystical page turn with resonance */
export const sndCardFlip = (index: number): void => {
  const baseFreq = 600 + index * 80;
  tone(baseFreq, "sine", 0.06, 0.4);
  tone(baseFreq * 1.5, "triangle", 0.03, 0.3, 0.05);
  // Soft chime
  tone(baseFreq * 2, "sine", 0.02, 0.6, 0.1);
};

/** Rising convergence — all energy pulling to center */
export const sndConvergence = (): void => {
  const context = getAudioContext();
  const currentTime = context.currentTime;

  // Rising sweep
  const sweepOscillator = context.createOscillator();
  const sweepGainNode = context.createGain();
  sweepOscillator.type = "sine";
  sweepOscillator.frequency.setValueAtTime(80, currentTime);
  sweepOscillator.frequency.exponentialRampToValueAtTime(800, currentTime + 1.5);
  sweepGainNode.gain.setValueAtTime(0, currentTime);
  sweepGainNode.gain.linearRampToValueAtTime(0.1, currentTime + 0.8);
  sweepGainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + 1.5);
  sweepOscillator.connect(sweepGainNode);
  sweepGainNode.connect(context.destination);
  sweepOscillator.start(currentTime);
  sweepOscillator.stop(currentTime + 1.5);

  // Shimmering overtones
  [440, 660, 880].forEach((frequency, i) => {
    tone(frequency, "sine", 0.03, 1.2, 0.3 + i * 0.15);
  });

  // Sub bass build
  tone(50, "triangle", 0.08, 1.5);
};

export const sndFinale = (): void => {
  const context = getAudioContext();
  const currentTime = context.currentTime;

  // Phase 1 (0-1.5s): Deep rumble crescendo
  const rumbleOscillator = context.createOscillator();
  const rumbleGainNode = context.createGain();
  rumbleOscillator.connect(rumbleGainNode);
  rumbleGainNode.connect(context.destination);
  rumbleOscillator.type = "sawtooth";
  rumbleOscillator.frequency.setValueAtTime(40, currentTime);
  rumbleOscillator.frequency.linearRampToValueAtTime(80, currentTime + 1.5);
  rumbleGainNode.gain.setValueAtTime(0, currentTime);
  rumbleGainNode.gain.linearRampToValueAtTime(0.12, currentTime + 1.2);
  rumbleGainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + 2);
  rumbleOscillator.start(currentTime);
  rumbleOscillator.stop(currentTime + 2);

  // Sub bass pulse
  const subOscillator = context.createOscillator();
  const subGainNode = context.createGain();
  subOscillator.connect(subGainNode);
  subGainNode.connect(context.destination);
  subOscillator.type = "sine";
  subOscillator.frequency.value = 55;
  subGainNode.gain.setValueAtTime(0, currentTime);
  subGainNode.gain.linearRampToValueAtTime(0.15, currentTime + 1);
  subGainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + 2.5);
  subOscillator.start(currentTime);
  subOscillator.stop(currentTime + 2.5);

  // Phase 2 (1.5-3.5s): Ascending pentatonic cascadeList — double speed
  const cascadeList = [262, 330, 392, 523, 659, 784, 1047, 1319, 1568, 2093];

  cascadeList.forEach((frequency, i) => {
    const noteStartTime = 1.2 + i * 0.12;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gainNode.gain.setValueAtTime(0, currentTime + noteStartTime);
    gainNode.gain.linearRampToValueAtTime(0.1 + i * 0.008, currentTime + noteStartTime + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + noteStartTime + 0.8);
    oscillator.start(currentTime + noteStartTime);
    oscillator.stop(currentTime + noteStartTime + 0.85);
  });

  // Shimmer sparkles during cascadeList
  [2637, 3136, 3520].forEach((frequency, i) => {
    tone(frequency, "sine", 0.03, 0.6, 1.8 + i * 0.3);
  });

  // Phase 3 (3-5s): Full triumphant chord — C major with extensions
  const chordFreqList = [523, 659, 784, 1047, 1319, 1568];

  chordFreqList.forEach((frequency, i) => {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.type = i < 3 ? "triangle" : "sine";
    oscillator.frequency.value = frequency;
    const noteStartTime = currentTime + 3 + i * 0.04;
    gainNode.gain.setValueAtTime(0, noteStartTime);
    gainNode.gain.linearRampToValueAtTime(0.14, noteStartTime + 0.1);
    gainNode.gain.setValueAtTime(0.14, noteStartTime + 1.5);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, noteStartTime + 3.5);
    oscillator.start(noteStartTime);
    oscillator.stop(noteStartTime + 3.6);
  });

  // High crystalline shimmer over chord
  tone(2093, "sine", 0.06, 2.5, 3.2);
  tone(2637, "sine", 0.04, 2, 3.5);
  tone(3520, "sine", 0.025, 1.8, 3.8);

  // Phase 4 (5-7s): Music-box descending resolution
  const musicBoxList = [1568, 1319, 1047, 784, 659, 523];

  musicBoxList.forEach((frequency, i) => {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    const noteStartTime = currentTime + 5 + i * 0.18;
    gainNode.gain.setValueAtTime(0, noteStartTime);
    gainNode.gain.linearRampToValueAtTime(0.09, noteStartTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, noteStartTime + 1.5);
    oscillator.start(noteStartTime);
    oscillator.stop(noteStartTime + 1.5);
  });

  // Final warm pad — peaceful resolution
  [262, 330, 392].forEach((frequency, i) => {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.type = "triangle";
    oscillator.frequency.value = frequency;
    const noteStartTime = currentTime + 5.8 + i * 0.03;
    gainNode.gain.setValueAtTime(0, noteStartTime);
    gainNode.gain.linearRampToValueAtTime(0.06, noteStartTime + 0.3);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, noteStartTime + 2);
    oscillator.start(noteStartTime);
    oscillator.stop(noteStartTime + 2.1);
  });

  // Final golden bell
  tone(880, "sine", 0.08, 2, 6.2);
  tone(1760, "sine", 0.03, 1.5, 6.3);
};

/** Ink drop falling — water plip. ratio 0→1 : encrier vide→plein */
export const sndInkDrop = (ratio = 1): void => {
  const context = getAudioContext();
  const currentTime = context.currentTime;

  const startFreq = 600 + ratio * 500;
  const endFreq = 200 + ratio * 200;

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(startFreq, currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(endFreq, currentTime + 0.12);
  gainNode.gain.setValueAtTime(0, currentTime);
  gainNode.gain.linearRampToValueAtTime(0.1, currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + 0.18);
  oscillator.start(currentTime);
  oscillator.stop(currentTime + 0.2);

  // Sub plip for water weight
  tone(200, "sine", 0.06, 0.1, 0.01);
};

/** Crystalline hit — letter revealed */
export const sndInkHit = (): void => {
  const context = getAudioContext();
  const currentTime = context.currentTime;

  [1047, 1319, 1568].forEach((frequency, i) => {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    const noteStartTime = currentTime + i * 0.06;
    gainNode.gain.setValueAtTime(0, noteStartTime);
    gainNode.gain.linearRampToValueAtTime(0.1, noteStartTime + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, noteStartTime + 0.6);
    oscillator.start(noteStartTime);
    oscillator.stop(noteStartTime + 0.65);
  });
  tone(2093, "sine", 0.025, 0.4, 0.1);
};

/** Dull thud — miss */
export const sndInkMiss = (): void => {
  const context = getAudioContext();
  const currentTime = context.currentTime;

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(110, currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(50, currentTime + 0.2);
  gainNode.gain.setValueAtTime(0.14, currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + 0.3);
  oscillator.start(currentTime);
  oscillator.stop(currentTime + 0.35);

  tone(220, "sawtooth", 0.04, 0.1);
};

/** Dull thud + warm tinkle — miss adjacent */
export const sndInkMissAdjacent = (): void => {
  sndInkMiss();
  // Warm tinkle overlay
  tone(1200, "triangle", 0.04, 0.5, 0.06);
  tone(1500, "sine", 0.025, 0.4, 0.1);
};

/** Short triumph — word solved */
export const sndInkWordSolved = (): void => {
  [784, 988, 1175, 1568].forEach((frequency, i) => {
    tone(frequency, "sine", 0.12, 0.5, i * 0.07);
  });

  [988, 1175].forEach((frequency, i) => {
    tone(frequency, "triangle", 0.07, 1, 0.3 + i * 0.03);
  });
};

/** Brief dissonant tone — wrong word guess */
export const sndInkGuessError = (): void => {
  tone(220, "triangle", 0.06, 0.2);
  tone(233, "triangle", 0.05, 0.18, 0.01);
};

/** Crystalline ping — one per letter during word reveal cascadeList */
export const sndInkLetterReveal = (index: number): void => {
  const scaleList = [587, 659, 784, 880, 988, 1175, 1319, 1568, 1760];
  const frequency = scaleList[index % scaleList.length];
  tone(frequency, "sine", 0.07, 0.32);
  tone(frequency * 2, "triangle", 0.025, 0.22, 0.01);
};

/** Ambient tension drone — crescendo over ~3s, returns stop function */
export function sndAmbientTension(): () => void {
  const context = getAudioContext();
  const currentTime = context.currentTime;
  const nodeList: { oscillator: OscillatorNode; gainNode: GainNode }[] = [];

  // Deep drone — slow crescendo
  const freqList = [55, 82.5, 110, 165]; // A1, E2, A2, E3
  for (const frequency of freqList) {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    // Slow crescendo over 3s
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(frequency < 100 ? 0.08 : 0.04, currentTime + 3);
    oscillator.start(currentTime);
    nodeList.push({ oscillator, gainNode });
  }

  // Eerie high overtone — shimmering
  const highOscillator = context.createOscillator();
  const highGainNode = context.createGain();
  highOscillator.connect(highGainNode);
  highGainNode.connect(context.destination);
  highOscillator.type = "sine";
  highOscillator.frequency.setValueAtTime(440, currentTime);
  highOscillator.frequency.linearRampToValueAtTime(880, currentTime + 3);
  highGainNode.gain.setValueAtTime(0, currentTime);
  highGainNode.gain.linearRampToValueAtTime(0.06, currentTime + 2.5);
  highGainNode.gain.linearRampToValueAtTime(0.1, currentTime + 3);
  highOscillator.start(currentTime);
  nodeList.push({ oscillator: highOscillator, gainNode: highGainNode });

  // Pulsing sub-bass for tension
  const subBassOscillator = context.createOscillator();
  const subBassGainNode = context.createGain();
  const lfoOscillator = context.createOscillator();
  const lfoGainNode = context.createGain();
  subBassOscillator.connect(subBassGainNode);
  subBassGainNode.connect(context.destination);
  subBassOscillator.type = "sine";
  subBassOscillator.frequency.value = 40;
  // LFO modulates the sub gain for pulsing
  lfoOscillator.connect(lfoGainNode);
  lfoGainNode.connect(subBassGainNode.gain);
  lfoOscillator.type = "sine";
  lfoOscillator.frequency.setValueAtTime(0.5, currentTime);
  lfoOscillator.frequency.linearRampToValueAtTime(3, currentTime + 3); // pulse speeds up
  lfoGainNode.gain.setValueAtTime(0, currentTime);
  lfoGainNode.gain.linearRampToValueAtTime(0.05, currentTime + 3);
  subBassGainNode.gain.setValueAtTime(0.03, currentTime);
  subBassGainNode.gain.linearRampToValueAtTime(0.08, currentTime + 3);
  subBassOscillator.start(currentTime);
  lfoOscillator.start(currentTime);

  return () => {
    const now = context.currentTime;
    // Quick fade out
    for (const { oscillator, gainNode } of nodeList) {
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      oscillator.stop(now + 0.35);
    }
    subBassGainNode.gain.cancelScheduledValues(now);
    subBassGainNode.gain.setValueAtTime(subBassGainNode.gain.value, now);
    subBassGainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
    subBassOscillator.stop(now + 0.35);
    lfoOscillator.stop(now + 0.35);
  };
}
