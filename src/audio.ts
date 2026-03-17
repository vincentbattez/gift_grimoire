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
