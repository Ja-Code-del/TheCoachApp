import React from 'react';
import { View, Text, ImageBackground, StyleSheet } from 'react-native';

// Confetti statique (snapshot — pas d'animation nécessaire)
const seededRand = (i, offset = 0) => Math.abs(Math.sin(i * 127.1 + offset * 311.7));
const COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98FB98'];
const SHAPES = ['circle', 'square', 'rect'];
const CONFETTI = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: seededRand(i, 0) * 100,
  y: seededRand(i, 1) * 100,
  color: COLORS[Math.floor(seededRand(i, 2) * COLORS.length)],
  shape: SHAPES[Math.floor(seededRand(i, 3) * SHAPES.length)],
  size: 6 + Math.floor(seededRand(i, 4) * 5) * 3,
  rotation: Math.floor(seededRand(i, 5) * 360),
  opacity: 0.6 + seededRand(i, 6) * 0.4,
}));

function StaticConfetti() {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {CONFETTI.map((c) => (
        <View key={c.id} style={{
          position: 'absolute',
          left: `${c.x}%`,
          top: `${c.y}%`,
          width: c.shape === 'rect' ? c.size * 2 : c.size,
          height: c.size,
          backgroundColor: c.color,
          borderRadius: c.shape === 'circle' ? c.size / 2 : c.shape === 'square' ? 2 : 1,
          transform: [{ rotate: `${c.rotation}deg` }],
          opacity: c.opacity,
        }} />
      ))}
    </View>
  );
}

function formatDate(targetDate) {
  if (!targetDate) return '';
  const [y, m, d] = targetDate.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ShareCard({ cardRef, daysLeft, theme, quote, bgImage, targetDate, font, isJourJ }) {
  const formattedDate = formatDate(targetDate);
  const overlayBg = isJourJ
    ? 'rgba(20,5,40,0.85)'
    : 'rgba(10,20,60,0.75)';

  return (
    // Wrapper hors-écran — captureRef cible cardRef (le card intérieur)
    <View style={styles.offScreen}>
      <View
        ref={cardRef}
        style={[styles.card, !bgImage && { backgroundColor: '#1a2a6c' }]}
      >
        {/* Image de fond */}
        {bgImage && (
          <ImageBackground
            source={{ uri: bgImage }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        )}

        {/* Overlay sombre */}
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: overlayBg }]} />

        {/* Confetti si Jour J */}
        {isJourJ && <StaticConfetti />}

        {/* Contenu */}
        <View style={styles.content}>
          {/* En-tête */}
          <View style={{ gap: 4 }}>
            <Text style={styles.topLabel}>
              {isJourJ ? "🎉 C'est le grand jour" : 'Compte à rebours'}
            </Text>
            {theme ? (
              <Text style={[styles.topTheme, { fontFamily: font?.labelStyle?.fontFamily }]}>
                {theme}
              </Text>
            ) : null}
          </View>

          {/* Chiffre central */}
          <View style={styles.centerBlock}>
            {isJourJ ? (
              <>
                <Text style={[styles.starSymbol, { fontFamily: font?.numberStyle?.fontFamily }]}>✦</Text>
                <Text style={[styles.jourJText, {
                  fontFamily: font?.numberStyle?.fontFamily,
                  fontWeight: font?.numberStyle?.fontWeight || '900',
                }]}>
                  Jour J
                </Text>
              </>
            ) : (
              <>
                <Text style={[styles.daysNumber, {
                  fontFamily: font?.numberStyle?.fontFamily,
                  fontWeight: font?.numberStyle?.fontWeight || '900',
                }]}>
                  {daysLeft}
                </Text>
                <Text style={styles.daysLabel}>Jours restants</Text>
              </>
            )}
          </View>

          {/* Citation */}
          <View style={styles.quoteBox}>
            <Text style={[styles.quoteText, {
              fontFamily: font?.quoteStyle?.fontFamily,
              fontStyle: font?.quoteStyle?.fontStyle || 'italic',
              fontWeight: font?.quoteStyle?.fontWeight || '300',
            }]}>
              "{quote?.text}"
            </Text>
            {quote?.author && (
              <Text style={styles.quoteAuthor}>— {quote.author}</Text>
            )}
          </View>

          {/* Pied de page */}
          <View style={styles.footer}>
            <Text style={styles.footerDate}>{formattedDate}</Text>
            <Text style={styles.footerBrand}>MonWidget</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  offScreen: {
    position: 'absolute',
    left: -9999,
    top: 0,
  },
  card: {
    width: 400,
    height: 500,
    borderRadius: 32,
    overflow: 'hidden',
  },
  content: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 10,
    padding: 40,
    paddingHorizontal: 36,
    justifyContent: 'space-between',
  },
  topLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 4,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.4)',
  },
  topTheme: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.3,
  },
  centerBlock: {
    alignItems: 'center',
    gap: 8,
  },
  starSymbol: {
    fontSize: 80,
    color: '#fff',
    textShadowColor: 'rgba(255,215,0,0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 30,
  },
  jourJText: {
    fontSize: 36,
    color: '#fff',
    letterSpacing: -0.7,
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 20,
  },
  daysNumber: {
    fontSize: 110,
    color: '#fff',
    letterSpacing: -4,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 30,
  },
  daysLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 4,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.5)',
  },
  quoteBox: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    padding: 20,
    paddingHorizontal: 24,
  },
  quoteText: {
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.9)',
  },
  quoteAuthor: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.35)',
    marginTop: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerDate: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1,
  },
  footerBrand: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.25)',
  },
});
