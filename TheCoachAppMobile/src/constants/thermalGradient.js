// --- PALIERS THERMIQUES ---
export const THERMAL_KEYFRAMES = [
  {
    pct: 100,
    bg:   ['#0a0a2e', '#1a1a6c', '#0d2137'],
    card: ['#0d1530', '#1a2a6c', '#0f2060'],
  },
  {
    pct: 75,
    bg:   ['#0f1a4a', '#1a2a6c', '#2c3e8a'],
    card: ['#12204f', '#1f3080', '#243570'],
  },
  {
    pct: 50,
    bg:   ['#1a0a3e', '#4a1a7c', '#6b2a9e'],
    card: ['#180a38', '#3d1870', '#572590'],
  },
  {
    pct: 25,
    bg:   ['#2e0a1a', '#7c1a3e', '#c0392b'],
    card: ['#260a14', '#620d30', '#a33020'],
  },
  {
    pct: 10,
    bg:   ['#4a0a0a', '#c0392b', '#e74c3c'],
    card: ['#380808', '#a02020', '#cc3c3c'],
  },
  {
    pct: 1,
    bg:   ['#8b2500', '#e74c3c', '#f39c12'],
    card: ['#701c00', '#c43030', '#d08000'],
  },
  {
    pct: 0,
    bg:   ['#b21f1f', '#fdbb2d', '#ff8c00'],
    card: ['#8b1515', '#d4a010', '#e07800'],
  },
];

// --- UTILITAIRES COULEUR ---
export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function rgbToHex(r, g, b) {
  return '#' + [r, g, b]
    .map(v => Math.round(Math.max(0, Math.min(255, v)))
      .toString(16).padStart(2, '0'))
    .join('');
}

export function lerpColor(c1, c2, t) {
  const a = hexToRgb(c1);
  const b = hexToRgb(c2);
  return rgbToHex(
    a.r + (b.r - a.r) * t,
    a.g + (b.g - a.g) * t,
    a.b + (b.b - a.b) * t,
  );
}

// --- INTERPOLATION ---
// Retourne { bg: [c1,c2,c3], card: [c1,c2,c3] } pour un % donné
export function getGradientForPercentage(pct) {
  const clamped = Math.max(0, Math.min(100, pct));

  // Trouver les deux keyframes encadrants
  // Les keyframes sont en ordre décroissant (100 → 0)
  let upper = THERMAL_KEYFRAMES[0];
  let lower = THERMAL_KEYFRAMES[THERMAL_KEYFRAMES.length - 1];

  for (let i = 0; i < THERMAL_KEYFRAMES.length - 1; i++) {
    if (clamped <= THERMAL_KEYFRAMES[i].pct && clamped >= THERMAL_KEYFRAMES[i + 1].pct) {
      upper = THERMAL_KEYFRAMES[i];
      lower = THERMAL_KEYFRAMES[i + 1];
      break;
    }
  }

  // t = position normalisée entre lower et upper
  const range = upper.pct - lower.pct;
  const t = range === 0 ? 0 : 1 - (clamped - lower.pct) / range;
  // t=0 → upper (plus froid), t=1 → lower (plus chaud)

  return {
    bg: upper.bg.map((c, i) => lerpColor(c, lower.bg[i], t)),
    card: upper.card.map((c, i) => lerpColor(c, lower.card[i], t)),
  };
}