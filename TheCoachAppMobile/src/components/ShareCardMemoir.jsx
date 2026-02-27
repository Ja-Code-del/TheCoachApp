import React from 'react';
import {
  View, Text, Image, StyleSheet,
} from 'react-native';
import { calcTimeAgo } from '../lib/utils';

// Card blanche style "souvenir nuage" — fond blanc pur, une photo, titre, temps
// Capturée via captureRef dans useShare
export default function ShareCardMemoir({ cardRef, event }) {
  const memoir = event.memoir || { note: '', photos: [] };
  const title = event.eventName || event.theme || 'Souvenir';
  const timeAgo = calcTimeAgo(event.targetDate);
  const coverPhoto = memoir.photos?.[0] || null;
  const note = memoir.note?.trim() || '';

  return (
    <View
      ref={cardRef}
      style={styles.card}
      collapsable={false}
    >
      {/* Photo de fond si disponible */}
      {coverPhoto ? (
        <Image
          source={{ uri: coverPhoto }}
          style={styles.coverPhoto}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.coverPlaceholder} />
      )}

      {/* Overlay blanc dégradé du bas */}
      <View style={styles.overlay} />

      {/* Contenu texte */}
      <View style={styles.content}>
        <Text style={styles.timeAgo}>{timeAgo}</Text>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        {note.length > 0 && (
          <Text style={styles.note} numberOfLines={3}>"{note}"</Text>
        )}
      </View>

      {/* Badge brand */}
      <View style={styles.brand}>
        <Text style={styles.brandText}>TheCoachApp</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 360,
    height: 480,
    backgroundColor: '#ffffff',
    borderRadius: 32,
    overflow: 'hidden',
    position: 'absolute',
    left: -9999, // hors-écran pour captureRef
  },
  coverPhoto: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 320,
  },
  coverPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 320,
    backgroundColor: '#f0f0f0',
  },
  // Dégradé blanc du bas — simule le "nuage"
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 280,
    // React Native ne supporte pas linearGradient inline dans StyleSheet
    // On utilise une View opaque blanche qui monte progressivement
    backgroundColor: '#fff',
    opacity: 0.92,
  },
  content: {
    position: 'absolute',
    bottom: 56,
    left: 28,
    right: 28,
    gap: 6,
  },
  timeAgo: {
    fontSize: 11,
    fontFamily: 'Inter_300Light',
    color: 'rgba(0,0,0,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_900Black',
    color: '#111',
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  note: {
    fontSize: 13,
    fontFamily: 'Lora_400Regular_Italic',
    color: 'rgba(0,0,0,0.5)',
    lineHeight: 20,
    marginTop: 4,
  },
  brand: {
    position: 'absolute',
    bottom: 20,
    left: 28,
  },
  brandText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: 'rgba(0,0,0,0.25)',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});