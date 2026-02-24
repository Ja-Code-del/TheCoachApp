import React from 'react';

const CONFETTI_COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];

// Pseudo-aléatoire déterministe (pas de re-calcul à chaque render)
const seededRand = (i, offset = 0) => Math.abs(Math.sin(i * 127.1 + offset * 311.7)) ;

const CONFETTI_PIECES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: seededRand(i, 0) * 100,
  delay: seededRand(i, 1) * 2,
  duration: 2 + seededRand(i, 2) * 1.5,
  color: CONFETTI_COLORS[Math.floor(seededRand(i, 3) * CONFETTI_COLORS.length)],
  size: 6 + Math.floor(seededRand(i, 4) * 4) * 3,
}));

export default function ConfettiAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {CONFETTI_PIECES.map((p) => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.x}%`, top: '-10px',
          width: p.size, height: p.size, backgroundColor: p.color,
          borderRadius: p.id % 3 === 0 ? '50%' : '2px',
          animation: `confettiFall ${p.duration}s ${p.delay}s infinite linear`,
        }} />
      ))}
    </div>
  );
}