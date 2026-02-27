import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  ActivityIndicator, StyleSheet, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import ConfettiAnimation from './ConfettiAnimation';

export default function JourJScreen({ eventName, theme, onShare, isSharing }) {
  const starScale = useRef(new Animated.Value(0.8)).current;
  const starOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  // Animation d'entrée
  useEffect(() => {
    Animated.sequence([
      // Fade in du contenu
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Pulse de l'étoile
      Animated.parallel([
        Animated.spring(starScale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(starOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>

      {/* Fond dégradé premium */}
      <LinearGradient
        colors={['#1a0533', '#4a0080', '#7c1055', '#b8430a']}
        locations={[0, 0.35, 0.65, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Halo lumineux central */}
      <View style={styles.halo} pointerEvents="none" />

      <ConfettiAnimation />

      <Animated.View style={[styles.content, { opacity: contentOpacity }]}>

        {/* Label haut */}
        <View style={styles.topBlock}>
          <View style={styles.topBadge}>
            <Text style={[styles.topLabel, { fontFamily: 'Inter_700Bold' }]}>
              C'est le grand jour
            </Text>
          </View>
        </View>

        {/* Centre — étoile + titre + sous-titre */}
        <View style={styles.centerBlock}>
          <Animated.Text
            style={[
              styles.star,
              { transform: [{ scale: starScale }], opacity: starOpacity },
            ]}
          >
            ✦
          </Animated.Text>

          <Text style={[styles.jourJText, { fontFamily: 'Inter_900Black' }]}>
            Jour J
          </Text>

          {(eventName || theme) && (
            <View style={styles.eventBadge}>
              <Text style={[styles.eventText, { fontFamily: 'Inter_300Light' }]}>
                {eventName || theme}
              </Text>
            </View>
          )}
        </View>

        {/* Bouton partage */}
        <TouchableOpacity
          style={[styles.button, isSharing && styles.buttonDisabled]}
          onPress={onShare}
          disabled={isSharing}
          activeOpacity={0.85}
        >
          {isSharing ? (
            <>
              <ActivityIndicator size="small" color="#374151" />
              <Text style={[styles.buttonText, { fontFamily: 'Inter_700Bold' }]}>
                Capture en cours...
              </Text>
            </>
          ) : (
            <>
              <Feather name="share" size={16} color="#111" />
              <Text style={[styles.buttonText, { fontFamily: 'Inter_700Bold' }]}>
                Immortaliser ce moment
              </Text>
            </>
          )}
        </TouchableOpacity>

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
    borderRadius: 48,
    overflow: 'hidden',
  },
  halo: {
    position: 'absolute',
    top: '30%',
    alignSelf: 'center',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,215,0,0.08)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 60,
  },
  content: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 10,
    padding: 36,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBlock: {
    alignItems: 'center',
  },
  topBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
  },
  topLabel: {
    fontSize: 10,
    letterSpacing: 4,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.6)',
  },
  centerBlock: {
    alignItems: 'center',
    gap: 12,
  },
  star: {
    fontSize: 80,
    color: '#FFD700',
    textShadowColor: 'rgba(255,215,0,0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 40,
  },
  jourJText: {
    fontSize: 42,
    color: '#fff',
    letterSpacing: -1,
    textShadowColor: 'rgba(255,255,255,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 20,
  },
  eventBadge: {
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
  },
  eventText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    fontStyle: 'italic',
  },
  button: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#111',
    fontSize: 15,
  },
});