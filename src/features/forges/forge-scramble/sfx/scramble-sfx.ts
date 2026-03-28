import { getCtx, tone } from "../../../../audio";

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
