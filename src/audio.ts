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

/** Ambient tension drone — crescendo over ~3s, returns stop function */
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
