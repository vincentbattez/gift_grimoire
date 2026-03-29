import { getAudioContext, tone } from "@/audio";

/** Ink drop falling — water plip. ratio 0→1 : encrier vide→plein */
export const sndInkDrop = (ratio = 1): void => {
  const c = getAudioContext();
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
export const sndInkHit = (): void => {
  const c = getAudioContext();
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
export const sndInkMiss = (): void => {
  const c = getAudioContext();
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
export const sndInkMissAdjacent = (): void => {
  sndInkMiss();
  // Warm tinkle overlay
  tone(1200, "triangle", 0.04, 0.5, 0.06);
  tone(1500, "sine", 0.025, 0.4, 0.1);
};

/** Short triumph — word solved */
export const sndInkWordSolved = (): void => {
  [784, 988, 1175, 1568].forEach((f, i) => {
    tone(f, "sine", 0.12, 0.5, i * 0.07);
  });

  [988, 1175].forEach((f, i) => {
    tone(f, "triangle", 0.07, 1, 0.3 + i * 0.03);
  });
};

/** Brief dissonant tone — wrong word guess */
export const sndInkGuessError = (): void => {
  tone(220, "triangle", 0.06, 0.2);
  tone(233, "triangle", 0.05, 0.18, 0.01);
};

/** Crystalline ping — one per letter during word reveal cascade */
export const sndInkLetterReveal = (index: number): void => {
  const scaleList = [587, 659, 784, 880, 988, 1175, 1319, 1568, 1760];
  const freq = scaleList[index % scaleList.length];
  tone(freq, "sine", 0.07, 0.32);
  tone(freq * 2, "triangle", 0.025, 0.22, 0.01);
};
