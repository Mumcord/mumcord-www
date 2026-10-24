// Deterministic waveform for the noise-suppression demo: speech "syllables" as
// smooth bursts plus broadband noise, drawn as vertical bars like an audio editor.

interface WaveOptions {
  seed: number;
  width: number;
  height: number;
  points: number;
  noise: number;
  speech: number;
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

export function wavePath({ seed, width, height, points, noise, speech }: WaveOptions): string {
  const speechRand = rng(seed);
  const noiseRand = rng(seed * 31 + 1);
  const mid = height / 2;
  const step = width / points;
  // Syllable envelope: same seed for both variants so the speech lines up.
  const bursts = Array.from({ length: 9 }, () => ({ at: speechRand(), len: 0.03 + speechRand() * 0.07, amp: 0.5 + speechRand() * 0.5 }));
  let d = "";
  for (let i = 0; i < points; i++) {
    const p = i / points;
    const env = bursts.reduce((m, b) => Math.max(m, b.amp * Math.exp(-(((p - b.at) / b.len) ** 2))), 0);
    const a = Math.max(1, (env * speech * (0.55 + speechRand() * 0.45) + noise * (0.15 + noiseRand() * 0.45)) * mid * 0.95);
    const x = (i * step + step / 2).toFixed(1);
    d += `M${x} ${(mid - a).toFixed(1)}V${(mid + a).toFixed(1)}`;
  }
  return d;
}
