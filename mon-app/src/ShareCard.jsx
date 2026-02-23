import React, { useMemo } from 'react';

// Génère des confettis avec positions/couleurs/rotations aléatoires mais stables
function generateConfetti(count = 40) {
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98FB98'];
  const shapes = ['circle', 'square', 'rect'];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (i * 7.3 + 13) % 100,
    y: (i * 11.7 + 7) % 100,
    color: colors[i % colors.length],
    shape: shapes[i % shapes.length],
    size: 6 + (i % 5) * 3,
    rotation: (i * 37) % 360,
    opacity: 0.6 + (i % 4) * 0.1,
  }));
}

const CONFETTI = generateConfetti(40);

function Confetti() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {CONFETTI.map((c) => (
        <div
          key={c.id}
          style={{
            position: 'absolute',
            left: `${c.x}%`,
            top: `${c.y}%`,
            width: c.shape === 'rect' ? c.size * 2 : c.size,
            height: c.size,
            backgroundColor: c.color,
            borderRadius: c.shape === 'circle' ? '50%' : c.shape === 'square' ? '2px' : '1px',
            transform: `rotate(${c.rotation}deg)`,
            opacity: c.opacity,
          }}
        />
      ))}
    </div>
  );
}

export default function ShareCard({ cardRef, daysLeft, theme, quote, bgImage, targetDate, font, isJourJ }) {
  // Format de la date cible lisible
  const formattedDate = useMemo(() => {
    if (!targetDate) return '';
    const [y, m, d] = targetDate.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }, [targetDate]);

  return (
    // Caché visuellement mais présent dans le DOM pour html2canvas
    <div
      style={{
        position: 'fixed',
        left: '-9999px',
        top: '0',
        zIndex: -1,
      }}
    >
      <div
        ref={cardRef}
        style={{
          width: '400px',
          height: '500px',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '32px',
          fontFamily: font?.numberStyle?.fontFamily || "'Inter', sans-serif",
          color: 'white',
          backgroundImage: bgImage ? `url(${bgImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: bgImage ? undefined : '#1a2a6c',
        }}
      >
        {/* Overlay de base */}
        <div style={{
          position: 'absolute', inset: 0,
          background: isJourJ
            ? 'linear-gradient(160deg, rgba(20,10,40,0.85) 0%, rgba(80,20,80,0.75) 50%, rgba(20,10,40,0.9) 100%)'
            : 'linear-gradient(160deg, rgba(10,20,60,0.75) 0%, rgba(0,0,0,0.55) 50%, rgba(10,20,60,0.8) 100%)',
        }} />

        {/* Confettis en arrière-plan pour le Jour J */}
        {isJourJ && <Confetti />}

        {/* Contenu principal */}
        <div style={{
          position: 'relative', zIndex: 10,
          padding: '40px 36px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>

          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              opacity: 0.4,
            }}>
              {isJourJ ? '🎉 C\'est le grand jour' : 'Compte à rebours'}
            </span>
            {theme && (
              <span style={{
                fontSize: '15px',
                fontWeight: 600,
                opacity: 0.85,
                letterSpacing: '0.02em',
              }}>
                {theme}
              </span>
            )}
          </div>

          {/* Chiffre central */}
          <div style={{ textAlign: 'center' }}>
            {isJourJ ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '80px',
                  lineHeight: 1,
                  fontWeight: font?.numberStyle?.fontWeight || 900,
                  textShadow: '0 4px 30px rgba(255,215,0,0.5)',
                  filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.4))',
                }}>
                  ✦
                </span>
                <span style={{
                  fontSize: '36px',
                  fontWeight: font?.numberStyle?.fontWeight || 900,
                  letterSpacing: '-0.02em',
                  textShadow: '0 2px 20px rgba(255,255,255,0.3)',
                }}>
                  Jour J
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '110px',
                  lineHeight: 1,
                  fontWeight: font?.numberStyle?.fontWeight || 900,
                  letterSpacing: '-0.04em',
                  textShadow: '0 4px 30px rgba(0,0,0,0.4)',
                }}>
                  {daysLeft}
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.4em',
                  textTransform: 'uppercase',
                  opacity: 0.5,
                }}>
                  Jours restants
                </span>
              </div>
            )}
          </div>

          {/* Citation */}
          <div style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '20px',
            padding: '20px 24px',
          }}>
            <p style={{
              fontSize: '14px',
              fontStyle: font?.quoteStyle?.fontStyle || 'italic',
              fontWeight: font?.quoteStyle?.fontWeight || 300,
              lineHeight: 1.6,
              opacity: 0.9,
              margin: 0,
            }}>
              "{quote?.text}"
            </p>
            {quote?.author && (
              <p style={{
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                opacity: 0.35,
                marginTop: '12px',
                marginBottom: 0,
              }}>
                — {quote.author}
              </p>
            )}
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '9px', opacity: 0.3, letterSpacing: '0.1em' }}>
              {formattedDate}
            </span>
            <span style={{
              fontSize: '9px',
              opacity: 0.25,
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}>
              MonWidget
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}