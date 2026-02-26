import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';

export default function WelcomeScreen({ onStart, visible }) {
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  return (
    <Animated.View
      style={[styles.container, { opacity }]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <View style={styles.backdrop} />

      <View style={styles.content}>
        <View>
          <Text style={styles.title}>Bienvenue</Text>
          <Text style={styles.subtitle}>
            Crée ton compte à rebours, laisse-toi inspirer par une citation générée pour toi, et partage le moment avec tes proches.
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={onStart} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Commencer →</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 20, 60, 0.80)',
    borderRadius: 48,
  },
  content: {
    position: 'relative',
    zIndex: 10,
    alignItems: 'center',
    gap: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 16,
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 220,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#111',
    fontWeight: '700',
    fontSize: 16,
  },
});
