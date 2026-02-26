import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import ConfettiAnimation from './ConfettiAnimation';

export default function JourJScreen({ eventName, theme, onShare, isSharing }) {
  return (
    <View style={styles.container}>
      {/* Fond plein — pas d'expo-linear-gradient installé */}
      <View style={styles.bg} />
      <ConfettiAnimation />

      <View style={styles.content}>
        <Text style={styles.topLabel}>C'est le grand jour</Text>

        <View style={styles.center}>
          <Text style={styles.star}>✦</Text>
          <Text style={styles.jourJ}>Jour J !</Text>
          {(eventName || theme) && (
            <Text style={styles.subtitle}>— {eventName || theme}</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.button, isSharing && styles.buttonDisabled]}
          onPress={onShare}
          disabled={isSharing}
          activeOpacity={0.85}
        >
          {isSharing ? (
            <>
              <ActivityIndicator size="small" color="#374151" />
              <Text style={styles.buttonText}>Capture en cours...</Text>
            </>
          ) : (
            <>
              <Text style={styles.shareIcon}>⬆</Text>
              <Text style={styles.buttonText}>Immortaliser ce moment</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
    overflow: 'hidden',
    borderRadius: 48,
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#3b0764', // purple-900
  },
  content: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 10,
    padding: 40,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 5,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  center: {
    alignItems: 'center',
    gap: 16,
  },
  star: {
    fontSize: 80,
    color: '#fff',
    textShadowColor: 'rgba(255,215,0,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 40,
  },
  jourJ: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  shareIcon: {
    fontSize: 15,
    color: '#111',
    fontWeight: '700',
  },
  buttonText: {
    color: '#111',
    fontWeight: '700',
    fontSize: 15,
  },
});
