import React from 'react';
import { View, Text, ImageBackground, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { seededRand } from '../lib/utils';

// --- CONFETTI STATIQUE (snapshot pour captureRef) ---
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

// --- UTILITAIRES ---
const formatDateFR = (targetDate) => {
  if (!targetDate) return '';
  const [y, m, d] = targetDate.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
};

// --- SHARE CARD ---
export default function ShareCard({
  cardRef, daysLeft, theme, quote,
  bgImage, targetDate, font, isJourJ,
}) {
  const formattedDate = formatDateFR(targetDate);

  return (
    <View style={styles.offScreen}>
      <View ref={cardRef} style={styles.card}>

        {/* Fond image */}
        {bgImage ? (
          <ImageBackground
            source={{ uri: bgImage }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
            blurRadius={2}
          />
        ) : null}

        {/* Overlay gradient */}
        <LinearGradient
          colors={
            isJourJ
              ? ['rgba(26,5,51,0.92)', 'rgba(74,0,128,0.85)', 'rgba(184,67,10,0.88)']
              : ['rgba(10,20,60,0.82)', 'rgba(26,42,108,0.7)', 'rgba(10,20,60,0.85)']
          }
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Confetti si Jour J */}
        {isJourJ && <StaticConfetti />}

        {/* Contenu */}
        <View style={styles.content}>

          {/* En-tête */}
          <View style={styles.headerBlock}>
            <Text style={[styles.topLabel, { fontFamily: 'Inter_700Bold' }]}>
              {isJourJ ? "🎉 C'est le grand jour" : 'Compte à rebours'}
            </Text>
            {theme ? (
              <Text style={[styles.topTheme, {
                fontFamily: font?.labelStyle?.fontFamily || 'Inter_700Bold',
              }]}>
                {theme}
              </Text>
            ) : null}
          </View>

          {/* Chiffre central */}
          <View style={styles.centerBlock}>
            {isJourJ ? (
              <>
                <Text style={[styles.starSymbol, {
                  fontFamily: font?.numberStyle?.fontFamily || 'Inter_900Black',
                }]}>
                  ✦
                </Text>
                <Text style={[styles.jourJText, {
                  fontFamily: font?.numberStyle?.fontFamily || 'Inter_900Black',
                }]}>
                  Jour J
                </Text>
              </>
            ) : (
              <>
                <Text style={[styles.daysNumber, {
                  fontFamily: font?.numberStyle?.fontFamily || 'Inter_900Black',
                }]}>
                  {daysLeft}
                </Text>
                <Text style={[styles.daysLabel, { fontFamily: 'Inter_700Bold' }]}>
                  Jours restants
                </Text>
              </>
            )}
          </View>

          {/* Citation */}
          <View style={styles.quoteBox}>
            <Text style={[styles.quoteText, {
              fontFamily: font?.quoteStyle?.fontFamily || 'Inter_300Light',
              fontStyle: font?.quoteStyle?.fontStyle || 'italic',
            }]}>
              "{quote?.text}"
            </Text>
            {quote?.author && (
              <Text style={[styles.quoteAuthor, { fontFamily: 'Inter_700Bold' }]}>
                — {quote.author}
              </Text>
            )}
          </View>

          {/* Pied de page */}
          <View style={styles.footer}>
            <Text style={[styles.footerDate, { fontFamily: 'Inter_300Light' }]}>
              {formattedDate}
            </Text>
            <View style={styles.brandBadge}>
              <Text style={[styles.footerBrand, { fontFamily: 'Inter_700Bold' }]}>
                TheCoachApp
              </Text>
            </View>
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
    backgroundColor: '#1a2a6c',
  },
  content: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 10,
    padding: 36,
    justifyContent: 'space-between',
  },
  headerBlock: {
    gap: 6,
  },
  topLabel: {
    fontSize: 10,
    letterSpacing: 4,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.45)',
  },
  topTheme: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.3,
  },
  centerBlock: {
    alignItems: 'center',
    gap: 8,
  },
  starSymbol: {
    fontSize: 72,
    color: '#FFD700',
    textShadowColor: 'rgba(255,215,0,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  jourJText: {
    fontSize: 38,
    color: '#fff',
    letterSpacing: -0.7,
  },
  daysNumber: {
    fontSize: 108,
    color: '#fff',
    letterSpacing: -4,
    lineHeight: 112,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 20,
  },
  daysLabel: {
    fontSize: 11,
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
  },
  quoteText: {
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.9)',
  },
  quoteAuthor: {
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.35)',
    marginTop: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerDate: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 0.5,
  },
  brandBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
  },
  footerBrand: {
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.3)',
  },
});