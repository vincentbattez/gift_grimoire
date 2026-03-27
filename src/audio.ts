let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function tone(
  freq: number,
  type: OscillatorType,
  vol: number,
  dur: number,
  delay = 0,
) {
  const c = getCtx();
  const o = c.createOscillator();
  const g = c.createGain();
  const t = c.currentTime + delay;
  o.connect(g);
  g.connect(c.destination);
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.start(t);
  o.stop(t + dur);
}

export const sndUnlock = () =>
  [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, "sine", 0.22, 0.55, i * 0.09));

export const sndOk = () => {
  [523, 659, 784].forEach((f, i) => tone(f, "triangle", 0.18, 1.2, i * 0.05));
  tone(1047, "sine", 0.28, 1.8, 0.3);
};

export const sndBad = () => {
  tone(165, "sawtooth", 0.3, 0.28);
  tone(148, "sawtooth", 0.3, 0.28, 0.12);
};

export const sndClick = () => tone(900, "sine", 0.09, 0.1);

/** Bubbly heart pop — pitch varies per call for organic feel */
export const sndHeartPop = (pitchOffset = 0) => {
  const base = 1200 + pitchOffset;
  const c = getCtx();
  const t = c.currentTime;

  // Round bubble attack
  const o = c.createOscillator();
  const g = c.createGain();
  o.connect(g);
  g.connect(c.destination);
  o.type = "sine";
  o.frequency.setValueAtTime(base * 0.7, t);
  o.frequency.exponentialRampToValueAtTime(base, t + 0.025);
  o.frequency.exponentialRampToValueAtTime(base * 0.85, t + 0.12);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.1, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
  o.start(t);
  o.stop(t + 0.16);

  // Airy harmonic shimmer
  tone(base * 1.5, "sine", 0.025, 0.09, 0.01);
};

/** Modern fluid swap — letter slides into place */
export const sndLetterSwap = () => {
  const c = getCtx();
  const t = c.currentTime;

  // Main body — pitch arc up then resolves down ("spring into place")
  const o = c.createOscillator();
  const g = c.createGain();
  o.connect(g);
  g.connect(c.destination);
  o.type = "sine";
  o.frequency.setValueAtTime(310, t);
  o.frequency.linearRampToValueAtTime(620, t + 0.022);
  o.frequency.exponentialRampToValueAtTime(250, t + 0.14);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.17, t + 0.007);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  o.start(t);
  o.stop(t + 0.17);

  // Octave harmonic — adds richness without harshness
  tone(620, "sine", 0.04, 0.11, 0.005);

  // High shimmer — modern sparkle
  tone(2500, "sine", 0.016, 0.08, 0.006);

  // Warm sub tail — fullness
  tone(125, "triangle", 0.065, 0.13, 0.012);
};

/** Shimmering chime — scramble solved */
export const sndScrambleSolved = () => {
  // Quick ascending sparkle
  [784, 988, 1175, 1568].forEach((f, i) =>
    tone(f, "sine", 0.15, 0.4, i * 0.08),
  );
  // Sustained resolve chord
  [1047, 1319, 1568].forEach((f, i) =>
    tone(f, "triangle", 0.12, 1.4, 0.35 + i * 0.03),
  );
};

export const sndVictory = () => {
  // Arpège ascendant rapide (Do-Mi-Sol-Do-Mi)
  [523, 659, 784, 1047, 1319].forEach((f, i) =>
    tone(f, "triangle", 0.16, 0.6, i * 0.07),
  );
  // Accord majeur soutenu
  [1047, 1319, 1568].forEach((f, i) =>
    tone(f, "sine", 0.22, 2.2, 0.4 + i * 0.03),
  );
  // Note haute scintillante
  tone(2093, "sine", 0.12, 1.5, 0.6);
};

/** Gentle close — descending music-box + warm settle */
export const sndLoveClose = () => {
  const c = getCtx();
  const t = c.currentTime;

  // Descending music-box arpeggio (mirror of sndLoveReveal)
  [523, 659, 784, 1047, 1203, 1402].forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.type = "sine";
    o.frequency.value = f;
    const start = t + i * 0.11;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(0.09, start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.9);
    o.start(start);
    o.stop(start + 0.9);
  });
};

/** Metallic click — key inserting into keyhole */
export const sndKeyInsert = () => {
  const c = getCtx();
  const t = c.currentTime;

  // Sharp metallic impact
  tone(2800, "square", 0.15, 0.04);
  tone(4200, "square", 0.1, 0.03, 0.01);

  // Resonant ring after impact
  tone(1200, "sine", 0.12, 0.3, 0.03);
  tone(800, "sine", 0.08, 0.25, 0.05);

  // Subtle low thud
  const o = c.createOscillator();
  const g = c.createGain();
  o.connect(g);
  g.connect(c.destination);
  o.type = "sine";
  o.frequency.setValueAtTime(200, t);
  o.frequency.exponentialRampToValueAtTime(60, t + 0.15);
  g.gain.setValueAtTime(0.2, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
  o.start(t);
  o.stop(t + 0.15);
};

/** Mechanical lock opening — bolt sliding + spring release */
export const sndLockOpen = () => {
  const c = getCtx();
  const t = c.currentTime;

  // Bolt sliding (noise-like descending tone)
  const o1 = c.createOscillator();
  const g1 = c.createGain();
  o1.connect(g1);
  g1.connect(c.destination);
  o1.type = "sawtooth";
  o1.frequency.setValueAtTime(600, t);
  o1.frequency.exponentialRampToValueAtTime(120, t + 0.25);
  g1.gain.setValueAtTime(0.12, t);
  g1.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
  o1.start(t);
  o1.stop(t + 0.3);

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
  const c = getCtx();
  const t = c.currentTime;
  const DUR = 7;
  const allNodes: { o: OscillatorNode; g: GainNode }[] = [];

  // Low background drone
  const drone = c.createOscillator();
  const droneG = c.createGain();
  drone.connect(droneG);
  droneG.connect(c.destination);
  drone.type = "sine";
  drone.frequency.value = 85;
  const droneStart = Math.max(0, 0.5 - offsetSec);
  droneG.gain.setValueAtTime(offsetSec >= 0.5 ? 0.05 : 0, t);
  if (offsetSec < 0.5) droneG.gain.linearRampToValueAtTime(0.05, t + droneStart);
  droneG.gain.setValueAtTime(0.05, t + Math.max(0, 5.8 - offsetSec));
  droneG.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.01, DUR - offsetSec));
  drone.start(t);
  drone.stop(t + Math.max(0.02, DUR - offsetSec));
  allNodes.push({ o: drone, g: droneG });

  // 7 radar pings — one every ~0.85s
  for (let i = 0; i < 7; i++) {
    const pingTime = i * 0.85;
    if (pingTime + 0.55 <= offsetSec) continue; // already played
    const delay = Math.max(0, pingTime - offsetSec);

    // Ascending chirp
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.type = "sine";
    o.frequency.setValueAtTime(900 + i * 45, t + delay);
    o.frequency.exponentialRampToValueAtTime(2200 + i * 60, t + delay + 0.18);
    g.gain.setValueAtTime(0.0001, t + delay);
    g.gain.linearRampToValueAtTime(0.13, t + delay + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.45);
    o.start(t + delay);
    o.stop(t + delay + 0.45);
    allNodes.push({ o, g });

    // Echo
    const oE = c.createOscillator();
    const gE = c.createGain();
    oE.connect(gE);
    gE.connect(c.destination);
    oE.type = "sine";
    oE.frequency.setValueAtTime(900 + i * 45, t + delay + 0.1);
    oE.frequency.exponentialRampToValueAtTime(2200 + i * 60, t + delay + 0.28);
    gE.gain.setValueAtTime(0.0001, t + delay + 0.1);
    gE.gain.linearRampToValueAtTime(0.045, t + delay + 0.12);
    gE.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.55);
    oE.start(t + delay + 0.1);
    oE.stop(t + delay + 0.55);
    allNodes.push({ o: oE, g: gE });
  }


  return () => {
    const now = c.currentTime;
    for (const { o, g } of allNodes) {
      g.gain.cancelScheduledValues(now);
      g.gain.setValueAtTime(g.gain.value, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
      o.stop(now + 0.2);
    }
  };
}

/** Curious questioning sound — ascending interval like a musical "hmm?" */
export function sndDoubt(): void {
  const c = getCtx();
  const t = c.currentTime;

  // Soft wondering hum — rising pitch
  const hum = c.createOscillator();
  const humG = c.createGain();
  hum.connect(humG);
  humG.connect(c.destination);
  hum.type = "sine";
  hum.frequency.setValueAtTime(220, t);
  hum.frequency.linearRampToValueAtTime(330, t + 0.6);
  humG.gain.setValueAtTime(0, t);
  humG.gain.linearRampToValueAtTime(0.06, t + 0.08);
  humG.gain.setValueAtTime(0.06, t + 0.4);
  humG.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
  hum.start(t);
  hum.stop(t + 0.85);

  // Two-note questioning motif — rising minor third (like "hm?")
  for (const [freq, delay] of [[523, 0.15], [622, 0.4]] as const) {
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.type = "triangle";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t + delay);
    g.gain.linearRampToValueAtTime(0.08, t + delay + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.35);
    o.start(t + delay);
    o.stop(t + delay + 0.4);
  }

  // Final high questioning ping — ends on an unresolved note
  const ping = c.createOscillator();
  const pingG = c.createGain();
  ping.connect(pingG);
  pingG.connect(c.destination);
  ping.type = "sine";
  ping.frequency.setValueAtTime(1047, t + 0.65);
  ping.frequency.linearRampToValueAtTime(1175, t + 0.9);
  pingG.gain.setValueAtTime(0.0001, t + 0.65);
  pingG.gain.linearRampToValueAtTime(0.05, t + 0.68);
  pingG.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
  ping.start(t + 0.65);
  ping.stop(t + 1.15);
}

/** Deep listening drone — 10s meditative ambience, returns stop function */
export function sndDeepListen(): () => void {
  const c = getCtx();
  const t = c.currentTime;
  const DUR = 10;
  const allNodes: { o: OscillatorNode; g: GainNode }[] = [];

  // Warm sub-bass with slow breathing LFO (~0.15 Hz)
  const sub = c.createOscillator();
  const subG = c.createGain();
  const breathLfo = c.createOscillator();
  const breathDepth = c.createGain();
  sub.connect(subG);
  subG.connect(c.destination);
  sub.type = "sine";
  sub.frequency.value = 55;
  breathLfo.connect(breathDepth);
  breathDepth.connect(subG.gain);
  breathLfo.type = "sine";
  breathLfo.frequency.value = 0.15;
  breathDepth.gain.value = 0.03;
  subG.gain.setValueAtTime(0, t);
  subG.gain.linearRampToValueAtTime(0.07, t + 2);
  subG.gain.setValueAtTime(0.07, t + DUR - 2);
  subG.gain.linearRampToValueAtTime(0.0001, t + DUR);
  sub.start(t);
  sub.stop(t + DUR);
  breathLfo.start(t);
  breathLfo.stop(t + DUR);
  allNodes.push({ o: sub, g: subG });

  // Binaural-like beating — two close frequencies creating a slow 3Hz pulse
  for (const freq of [200, 203]) {
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.025, t + 3);
    g.gain.setValueAtTime(0.025, t + DUR - 2.5);
    g.gain.linearRampToValueAtTime(0.0001, t + DUR);
    o.start(t);
    o.stop(t + DUR);
    allNodes.push({ o, g });
  }

  // Ethereal high harmonic — slowly drifting pitch
  const hi = c.createOscillator();
  const hiG = c.createGain();
  hi.connect(hiG);
  hiG.connect(c.destination);
  hi.type = "sine";
  hi.frequency.setValueAtTime(660, t);
  hi.frequency.linearRampToValueAtTime(880, t + DUR * 0.6);
  hi.frequency.linearRampToValueAtTime(740, t + DUR);
  hiG.gain.setValueAtTime(0, t);
  hiG.gain.linearRampToValueAtTime(0.015, t + 4);
  hiG.gain.setValueAtTime(0.015, t + DUR - 3);
  hiG.gain.linearRampToValueAtTime(0.0001, t + DUR);
  hi.start(t);
  hi.stop(t + DUR);
  allNodes.push({ o: hi, g: hiG });

  // Soft periodic pings — 5 very subtle sonar-like tones spread across 10s
  for (let i = 0; i < 5; i++) {
    const pt = t + 1.5 + i * 1.8;
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.type = "sine";
    o.frequency.setValueAtTime(1200 + i * 40, pt);
    o.frequency.exponentialRampToValueAtTime(800, pt + 0.8);
    g.gain.setValueAtTime(0.0001, pt);
    g.gain.linearRampToValueAtTime(0.04, pt + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, pt + 0.8);
    o.start(pt);
    o.stop(pt + 0.85);
    allNodes.push({ o, g });
  }

  return () => {
    const now = c.currentTime;
    for (const { o, g } of allNodes) {
      g.gain.cancelScheduledValues(now);
      g.gain.setValueAtTime(g.gain.value, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      o.stop(now + 0.45);
    }
    try { breathLfo.stop(now + 0.45); } catch { /* AudioNode déjà arrêté */ }
  };
}

/** Modern slide transition — clean digital tick + airy swipe */
export const sndPageTurn = () => {
  const c = getCtx();
  const t = c.currentTime;

  // Clean digital tick — short sine pop
  const pop = c.createOscillator();
  const popG = c.createGain();
  pop.connect(popG);
  popG.connect(c.destination);
  pop.type = "sine";
  pop.frequency.setValueAtTime(1400, t);
  pop.frequency.exponentialRampToValueAtTime(600, t + 0.04);
  popG.gain.setValueAtTime(0.12, t);
  popG.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
  pop.start(t);
  pop.stop(t + 0.07);

  // Soft harmonic tail
  tone(880, "sine", 0.04, 0.1, 0.02);
};

/** Grimoire open — cinematic bass drop + crystal reveal */
export const sndGrimoireOpen = () => {
  const c = getCtx();
  const t = c.currentTime;

  // Sub bass impact — modern "drop" feel
  const sub = c.createOscillator();
  const subG = c.createGain();
  sub.connect(subG);
  subG.connect(c.destination);
  sub.type = "sine";
  sub.frequency.setValueAtTime(120, t);
  sub.frequency.exponentialRampToValueAtTime(40, t + 0.3);
  subG.gain.setValueAtTime(0.2, t);
  subG.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  sub.start(t);
  sub.stop(t + 0.5);

  // Crystal ping — two-note interval (modern UI reveal)
  tone(1320, "sine", 0.1, 0.4, 0.08);
  tone(1760, "sine", 0.08, 0.5, 0.16);

  // Soft pad chord — warm digital glow
  [440, 554, 660].forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.type = "sine";
    o.frequency.value = f;
    const start = t + 0.12 + i * 0.02;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(0.05, start + 0.15);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 1.2);
    o.start(start);
    o.stop(start + 1.2);
  });
};

/** Warm romantic reveal — music-box arpeggio + sustained pad + shimmer */
export const sndLoveReveal = () => {
  const c = getCtx();
  const t = c.currentTime;

  // Music-box arpeggio (C major, gentle)
  [523, 659, 784, 1047].forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.type = "sine";
    o.frequency.value = f;
    const start = t + i * 0.14;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(0.13, start + 0.025);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 1.4);
    o.start(start);
    o.stop(start + 1.4);
  });

  // Warm sustained pad chord
  [523, 659, 784].forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.type = "triangle";
    o.frequency.value = f;
    const start = t + 0.5 + i * 0.02;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(0.055, start + 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 2.8);
    o.start(start);
    o.stop(start + 2.8);
  });

  // High shimmer sparkles
  tone(2093, "sine", 0.035, 1.6, 0.55);
  tone(2637, "sine", 0.025, 1.3, 0.75);
};

/** Golden seal — warm chime when card reaches its final golden state */
export const sndGoldenSeal = () => {
  const c = getCtx();
  const t = c.currentTime;

  // Warm golden bell — two harmonics with slow decay
  [659, 880].forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.type = "sine";
    o.frequency.value = f;
    const start = t + i * 0.12;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(0.14, start + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 1.8);
    o.start(start);
    o.stop(start + 1.8);
  });

  // Shimmering overtone — golden sparkle
  tone(1760, "sine", 0.04, 1.2, 0.15);
  tone(2217, "sine", 0.025, 0.9, 0.25);

  // Sub warmth — weight and presence
  tone(330, "triangle", 0.06, 1.4, 0.08);
};

/** Soft typewriter key — quill on parchment */
export const sndQuillTap = (pitch = 0) => {
  const c = getCtx();
  const t = c.currentTime;
  const f = 3200 + pitch * 400;
  // Soft click
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(f, t);
  o.frequency.exponentialRampToValueAtTime(f * 0.6, t + 0.04);
  g.gain.setValueAtTime(0.03, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
  o.connect(g);
  g.connect(c.destination);
  o.start(t);
  o.stop(t + 0.06);
};

/** Golden shimmer — special word emphasis */
export const sndGoldenWord = () => {
  tone(880, "sine", 0.06, 0.8);
  tone(1320, "sine", 0.03, 0.6, 0.05);
};

/** Wax seal — continuous warm crackling while pressing (returns stop function) */
export const sndWaxMelt = (): (() => void) => {
  const c = getCtx();
  const t = c.currentTime;

  // Warm low crackle — wax melting under heat
  const noise = c.createBufferSource();
  const buf = c.createBuffer(1, c.sampleRate * 3, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (Math.random() > 0.92 ? 0.6 : 0.08);
  }
  noise.buffer = buf;
  noise.loop = true;

  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 400;
  lp.Q.value = 1.2;

  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.12, t + 0.3);

  noise.connect(lp);
  lp.connect(g);
  g.connect(c.destination);
  noise.start(t);

  // Soft warm hum — heat source
  const hum = c.createOscillator();
  const humG = c.createGain();
  hum.type = "sine";
  hum.frequency.value = 90;
  humG.gain.setValueAtTime(0, t);
  humG.gain.linearRampToValueAtTime(0.04, t + 0.5);
  hum.connect(humG);
  humG.connect(c.destination);
  hum.start(t);

  return () => {
    const now = c.currentTime;
    g.gain.cancelScheduledValues(now);
    g.gain.setValueAtTime(g.gain.value, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    humG.gain.cancelScheduledValues(now);
    humG.gain.setValueAtTime(humG.gain.value, now);
    humG.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    setTimeout(() => { noise.stop(); hum.stop(); }, 300);
  };
};

/** Wax seal stamp — satisfying press impact */
export const sndWaxStamp = () => {
  const c = getCtx();
  const t = c.currentTime;

  // Deep thud — stamp pressing into wax
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(180, t);
  o.frequency.exponentialRampToValueAtTime(60, t + 0.15);
  g.gain.setValueAtTime(0.2, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
  o.connect(g);
  g.connect(c.destination);
  o.start(t);
  o.stop(t + 0.4);

  // Metallic ring — seal embossing
  tone(1200, "sine", 0.08, 1.5, 0.05);
  tone(1800, "sine", 0.04, 1.2, 0.08);

  // Warm golden bell cascade — triumphant seal
  [523, 659, 784, 1047].forEach((f, i) => {
    tone(f, "sine", 0.06, 1.8, 0.15 + i * 0.12);
  });

  // Sub resonance — weight
  tone(110, "triangle", 0.05, 1.6, 0.05);
};

/** Forge seal break — arcane seal cracking + crystalline shatter + mystical resolve */
export const sndForgeReveal = () => {
  const c = getCtx();
  const t = c.currentTime;

  // Phase 1: Deep arcane rumble — the seal strains
  const rumble = c.createOscillator();
  const rumbleG = c.createGain();
  rumble.connect(rumbleG);
  rumbleG.connect(c.destination);
  rumble.type = "sawtooth";
  rumble.frequency.setValueAtTime(60, t);
  rumble.frequency.exponentialRampToValueAtTime(35, t + 0.4);
  rumbleG.gain.setValueAtTime(0.18, t);
  rumbleG.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  rumble.start(t);
  rumble.stop(t + 0.5);

  // Phase 2: Crystalline shatter — rapid descending pings like glass breaking
  [3800, 3200, 2600, 2100, 1700].forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.type = "sine";
    o.frequency.setValueAtTime(f, t + 0.15 + i * 0.035);
    o.frequency.exponentialRampToValueAtTime(f * 0.4, t + 0.15 + i * 0.035 + 0.2);
    const start = t + 0.15 + i * 0.035;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(0.09, start + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.25);
    o.start(start);
    o.stop(start + 0.25);
  });

  // Phase 3: Mystical ascending resolve — the forge awakens
  [392, 494, 587, 784, 988].forEach((f, i) => {
    tone(f, "triangle", 0.12, 0.9, 0.4 + i * 0.08);
  });

  // Sustained ethereal chord — warmth settling in
  [784, 988, 1175].forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.type = "sine";
    o.frequency.value = f;
    const start = t + 0.7 + i * 0.03;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(0.07, start + 0.2);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 2.2);
    o.start(start);
    o.stop(start + 2.2);
  });

  // Final high shimmer — magic dust
  tone(2349, "sine", 0.03, 1.5, 0.85);
  tone(3136, "sine", 0.02, 1.2, 0.95);
};

/** Firework launch whistle — ascending pitch simulating a rocket rising */
export const sndFireworkLaunch = (pitch = 1) => {
  const c = getCtx();
  const t = c.currentTime;

  // Rising whistle
  const o = c.createOscillator();
  const g = c.createGain();
  o.connect(g);
  g.connect(c.destination);
  o.type = "sine";
  o.frequency.setValueAtTime(200 * pitch, t);
  o.frequency.exponentialRampToValueAtTime(1800 * pitch, t + 0.7);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.07, t + 0.05);
  g.gain.setValueAtTime(0.07, t + 0.5);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
  o.start(t);
  o.stop(t + 0.8);

  // Breathy noise layer — adds realism
  const n = c.createOscillator();
  const nG = c.createGain();
  n.connect(nG);
  nG.connect(c.destination);
  n.type = "sawtooth";
  n.frequency.setValueAtTime(400 * pitch, t);
  n.frequency.exponentialRampToValueAtTime(3000 * pitch, t + 0.65);
  nG.gain.setValueAtTime(0, t);
  nG.gain.linearRampToValueAtTime(0.025, t + 0.05);
  nG.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
  n.start(t);
  n.stop(t + 0.75);
};

/** Firework crackle — burst of rapid micro-pops simulating sparkler crackle */
export const sndCrackle = (intensity = 1) => {
  const c = getCtx();
  const t = c.currentTime;

  // Deep boom — massive low-end impact
  const boom = c.createOscillator();
  const boomG = c.createGain();
  boom.connect(boomG);
  boomG.connect(c.destination);
  boom.type = "sine";
  boom.frequency.setValueAtTime(80 * intensity, t);
  boom.frequency.exponentialRampToValueAtTime(20, t + 0.4);
  boomG.gain.setValueAtTime(0.22 * intensity, t);
  boomG.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  boom.start(t);
  boom.stop(t + 0.55);

  // Sub-bass pressure wave — chest thump
  const sub = c.createOscillator();
  const subG = c.createGain();
  sub.connect(subG);
  subG.connect(c.destination);
  sub.type = "sine";
  sub.frequency.setValueAtTime(45, t);
  sub.frequency.exponentialRampToValueAtTime(18, t + 0.35);
  subG.gain.setValueAtTime(0.18 * intensity, t);
  subG.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
  sub.start(t);
  sub.stop(t + 0.45);

  // Mid rumble — distorted body
  const rumble = c.createOscillator();
  const rumbleG = c.createGain();
  rumble.connect(rumbleG);
  rumbleG.connect(c.destination);
  rumble.type = "sawtooth";
  rumble.frequency.setValueAtTime(120 * intensity, t + 0.02);
  rumble.frequency.exponentialRampToValueAtTime(35, t + 0.3);
  rumbleG.gain.setValueAtTime(0, t);
  rumbleG.gain.linearRampToValueAtTime(0.1 * intensity, t + 0.015);
  rumbleG.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
  rumble.start(t);
  rumble.stop(t + 0.4);

  // Crackle debris — lower-pitched pops spread over longer tail
  const count = Math.round(10 + intensity * 14);
  for (let i = 0; i < count; i++) {
    const delay = 0.04 + Math.random() * 0.4 * intensity;
    const freq = 400 + Math.random() * 1800;
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.type = i % 3 === 0 ? "sawtooth" : "square";
    o.frequency.setValueAtTime(freq, t + delay);
    o.frequency.exponentialRampToValueAtTime(freq * 0.15, t + delay + 0.06);
    const vol = (0.04 + Math.random() * 0.06) * intensity;
    g.gain.setValueAtTime(0, t + delay);
    g.gain.linearRampToValueAtTime(vol, t + delay + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.05 + Math.random() * 0.05);
    o.start(t + delay);
    o.stop(t + delay + 0.12);
  }

  // Reverb tail — low sine echo that lingers
  const tail = c.createOscillator();
  const tailG = c.createGain();
  tail.connect(tailG);
  tailG.connect(c.destination);
  tail.type = "sine";
  tail.frequency.setValueAtTime(60, t + 0.1);
  tail.frequency.exponentialRampToValueAtTime(30, t + 0.8);
  tailG.gain.setValueAtTime(0, t + 0.1);
  tailG.gain.linearRampToValueAtTime(0.06 * intensity, t + 0.15);
  tailG.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
  tail.start(t + 0.1);
  tail.stop(t + 0.85);
};

/** Epic finale — 7-second cinematic climax: rumble → ascending arpeggios → full chord → music-box resolution */
/** Narrative card flip — mystical page turn with resonance */
export const sndCardFlip = (index: number) => {
  const baseFreq = 600 + index * 80;
  tone(baseFreq, "sine", 0.06, 0.4);
  tone(baseFreq * 1.5, "triangle", 0.03, 0.3, 0.05);
  // Soft chime
  tone(baseFreq * 2, "sine", 0.02, 0.6, 0.1);
};

/** Rising convergence — all energy pulling to center */
export const sndConvergence = () => {
  const c = getCtx();
  const t = c.currentTime;

  // Rising sweep
  const sweep = c.createOscillator();
  const sweepG = c.createGain();
  sweep.type = "sine";
  sweep.frequency.setValueAtTime(80, t);
  sweep.frequency.exponentialRampToValueAtTime(800, t + 1.5);
  sweepG.gain.setValueAtTime(0, t);
  sweepG.gain.linearRampToValueAtTime(0.1, t + 0.8);
  sweepG.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
  sweep.connect(sweepG);
  sweepG.connect(c.destination);
  sweep.start(t);
  sweep.stop(t + 1.5);

  // Shimmering overtones
  [440, 660, 880].forEach((f, i) => {
    tone(f, "sine", 0.03, 1.2, 0.3 + i * 0.15);
  });

  // Sub bass build
  tone(50, "triangle", 0.08, 1.5);
};

export const sndFinale = () => {
  const c = getCtx();
  const t = c.currentTime;

  // Phase 1 (0-1.5s): Deep rumble crescendo
  const rumble = c.createOscillator();
  const rumbleG = c.createGain();
  rumble.connect(rumbleG);
  rumbleG.connect(c.destination);
  rumble.type = "sawtooth";
  rumble.frequency.setValueAtTime(40, t);
  rumble.frequency.linearRampToValueAtTime(80, t + 1.5);
  rumbleG.gain.setValueAtTime(0, t);
  rumbleG.gain.linearRampToValueAtTime(0.12, t + 1.2);
  rumbleG.gain.exponentialRampToValueAtTime(0.0001, t + 2);
  rumble.start(t);
  rumble.stop(t + 2);

  // Sub bass pulse
  const sub = c.createOscillator();
  const subG = c.createGain();
  sub.connect(subG);
  subG.connect(c.destination);
  sub.type = "sine";
  sub.frequency.value = 55;
  subG.gain.setValueAtTime(0, t);
  subG.gain.linearRampToValueAtTime(0.15, t + 1);
  subG.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);
  sub.start(t);
  sub.stop(t + 2.5);

  // Phase 2 (1.5-3.5s): Ascending pentatonic cascade — double speed
  const cascade = [262, 330, 392, 523, 659, 784, 1047, 1319, 1568, 2093];
  cascade.forEach((f, i) => {
    const start = 1.2 + i * 0.12;
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.type = "sine";
    o.frequency.value = f;
    g.gain.setValueAtTime(0, t + start);
    g.gain.linearRampToValueAtTime(0.1 + i * 0.008, t + start + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + start + 0.8);
    o.start(t + start);
    o.stop(t + start + 0.85);
  });

  // Shimmer sparkles during cascade
  [2637, 3136, 3520].forEach((f, i) => {
    tone(f, "sine", 0.03, 0.6, 1.8 + i * 0.3);
  });

  // Phase 3 (3-5s): Full triumphant chord — C major with extensions
  const chordFreqs = [523, 659, 784, 1047, 1319, 1568];
  chordFreqs.forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.type = i < 3 ? "triangle" : "sine";
    o.frequency.value = f;
    const start = t + 3.0 + i * 0.04;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(0.14, start + 0.1);
    g.gain.setValueAtTime(0.14, start + 1.5);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 3.5);
    o.start(start);
    o.stop(start + 3.6);
  });

  // High crystalline shimmer over chord
  tone(2093, "sine", 0.06, 2.5, 3.2);
  tone(2637, "sine", 0.04, 2.0, 3.5);
  tone(3520, "sine", 0.025, 1.8, 3.8);

  // Phase 4 (5-7s): Music-box descending resolution
  const musicBox = [1568, 1319, 1047, 784, 659, 523];
  musicBox.forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.type = "sine";
    o.frequency.value = f;
    const start = t + 5.0 + i * 0.18;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(0.09, start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 1.5);
    o.start(start);
    o.stop(start + 1.5);
  });

  // Final warm pad — peaceful resolution
  [262, 330, 392].forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.type = "triangle";
    o.frequency.value = f;
    const start = t + 5.8 + i * 0.03;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(0.06, start + 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 2.0);
    o.start(start);
    o.stop(start + 2.1);
  });

  // Final golden bell
  tone(880, "sine", 0.08, 2.0, 6.2);
  tone(1760, "sine", 0.03, 1.5, 6.3);
};

/** Ambient tension drone — crescendo over ~3s, returns stop function */
/** Ink drop falling — water plip. ratio 0→1 : encrier vide→plein */
export const sndInkDrop = (ratio = 1) => {
  const c = getCtx();
  const t = c.currentTime;

  const startFreq = 600 + ratio * 500;
  const endFreq = 200 + ratio * 200;

  const o = c.createOscillator();
  const g = c.createGain();
  o.connect(g);
  g.connect(c.destination);
  o.type = "sine";
  o.frequency.setValueAtTime(startFreq, t);
  o.frequency.exponentialRampToValueAtTime(endFreq, t + 0.12);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.1, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  o.start(t);
  o.stop(t + 0.2);

  // Sub plip for water weight
  tone(200, "sine", 0.06, 0.1, 0.01);
};

/** Crystalline hit — letter revealed */
export const sndInkHit = () => {
  const c = getCtx();
  const t = c.currentTime;

  [1047, 1319, 1568].forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.type = "sine";
    o.frequency.value = f;
    const start = t + i * 0.06;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(0.1, start + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.6);
    o.start(start);
    o.stop(start + 0.65);
  });
  tone(2093, "sine", 0.025, 0.4, 0.1);
};

/** Dull thud — miss */
export const sndInkMiss = () => {
  const c = getCtx();
  const t = c.currentTime;

  const o = c.createOscillator();
  const g = c.createGain();
  o.connect(g);
  g.connect(c.destination);
  o.type = "sine";
  o.frequency.setValueAtTime(110, t);
  o.frequency.exponentialRampToValueAtTime(50, t + 0.2);
  g.gain.setValueAtTime(0.14, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
  o.start(t);
  o.stop(t + 0.35);

  tone(220, "sawtooth", 0.04, 0.1);
};

/** Dull thud + warm tinkle — miss adjacent */
export const sndInkMissAdjacent = () => {
  sndInkMiss();
  // Warm tinkle overlay
  tone(1200, "triangle", 0.04, 0.5, 0.06);
  tone(1500, "sine", 0.025, 0.4, 0.1);
};

/** Short triumph — word solved */
export const sndInkWordSolved = () => {
  [784, 988, 1175, 1568].forEach((f, i) =>
    tone(f, "sine", 0.12, 0.5, i * 0.07),
  );
  [988, 1175].forEach((f, i) =>
    tone(f, "triangle", 0.07, 1.0, 0.3 + i * 0.03),
  );
};

export function sndAmbientTension(): () => void {
  const c = getCtx();
  const t = c.currentTime;
  const nodes: { o: OscillatorNode; g: GainNode }[] = [];

  // Deep drone — slow crescendo
  const freqs = [55, 82.5, 110, 165]; // A1, E2, A2, E3
  for (const freq of freqs) {
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.type = "sine";
    o.frequency.value = freq;
    // Slow crescendo over 3s
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(freq < 100 ? 0.08 : 0.04, t + 3);
    o.start(t);
    nodes.push({ o, g });
  }

  // Eerie high overtone — shimmering
  const oHi = c.createOscillator();
  const gHi = c.createGain();
  oHi.connect(gHi);
  gHi.connect(c.destination);
  oHi.type = "sine";
  oHi.frequency.setValueAtTime(440, t);
  oHi.frequency.linearRampToValueAtTime(880, t + 3);
  gHi.gain.setValueAtTime(0, t);
  gHi.gain.linearRampToValueAtTime(0.06, t + 2.5);
  gHi.gain.linearRampToValueAtTime(0.1, t + 3);
  oHi.start(t);
  nodes.push({ o: oHi, g: gHi });

  // Pulsing sub-bass for tension
  const oSub = c.createOscillator();
  const gSub = c.createGain();
  const lfo = c.createOscillator();
  const lfoG = c.createGain();
  oSub.connect(gSub);
  gSub.connect(c.destination);
  oSub.type = "sine";
  oSub.frequency.value = 40;
  // LFO modulates the sub gain for pulsing
  lfo.connect(lfoG);
  lfoG.connect(gSub.gain);
  lfo.type = "sine";
  lfo.frequency.setValueAtTime(0.5, t);
  lfo.frequency.linearRampToValueAtTime(3, t + 3); // pulse speeds up
  lfoG.gain.setValueAtTime(0, t);
  lfoG.gain.linearRampToValueAtTime(0.05, t + 3);
  gSub.gain.setValueAtTime(0.03, t);
  gSub.gain.linearRampToValueAtTime(0.08, t + 3);
  oSub.start(t);
  lfo.start(t);

  return () => {
    const now = c.currentTime;
    // Quick fade out
    for (const { o, g } of nodes) {
      g.gain.cancelScheduledValues(now);
      g.gain.setValueAtTime(g.gain.value, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      o.stop(now + 0.35);
    }
    gSub.gain.cancelScheduledValues(now);
    gSub.gain.setValueAtTime(gSub.gain.value, now);
    gSub.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
    oSub.stop(now + 0.35);
    lfo.stop(now + 0.35);
  };
}
