import { getAudioContext } from "@/audio";

/** Deep listening drone — 10s meditative ambience, returns stop function */
export function sndDeepListen(): () => void {
  const c = getAudioContext();
  const t = c.currentTime;
  const DUR = 10;
  const allNodeList: { o: OscillatorNode; g: GainNode }[] = [];

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
  allNodeList.push({ o: sub, g: subG });

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
    allNodeList.push({ o, g });
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
  allNodeList.push({ o: hi, g: hiG });

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
    allNodeList.push({ o, g });
  }

  return () => {
    const now = c.currentTime;
    for (const { o, g } of allNodeList) {
      g.gain.cancelScheduledValues(now);
      g.gain.setValueAtTime(g.gain.value, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      o.stop(now + 0.45);
    }

    try {
      breathLfo.stop(now + 0.45);
    } catch {
      /* AudioNode déjà arrêté */
    }
  };
}
