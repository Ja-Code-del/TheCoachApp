import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  Animated, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

const STEPS = [
  {
    icon: 'target',
    text: 'Choisis un thème et une date cible',
  },
  {
    icon: 'zap',
    text: 'Une citation et une image sont générées pour toi',
  },
  {
    icon: 'send',
    text: 'Partage le moment avec tes proches',
  },
];

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
      pointerEvents={visible ? 'box-none' : 'none'}
    >
      {/* Fond glassmorphism */}
      <LinearGradient
        colors={['rgba(26,42,108,0.85)', 'rgba(0,0,0,0.65)', 'rgba(178,31,31,0.6)']}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.content}>

        {/* Icône centrale */}
        <View style={styles.iconCircle}>
          <Feather name="clock" size={22} color="rgba(255,255,255,0.6)" />
        </View>

        {/* Titre */}
        <View style={styles.titleBlock}>
          <Text style={[styles.title, { fontFamily: 'Inter_900Black' }]}>
            Bienvenue
          </Text>
          <Text style={[styles.subtitle, { fontFamily: 'Inter_300Light' }]}>
            Ton compte à rebours personnel,{'\n'}
            avec des citations qui t'inspirent chaque jour.
          </Text>
        </View>

        {/* Étapes */}
        <View style={styles.stepsBox}>
          <Text style={[styles.stepsLabel, { fontFamily: 'Inter_700Bold' }]}>
            Comment ça marche
          </Text>
          {STEPS.map(({ icon, text }) => (
            <View key={icon} style={styles.step}>
              <View style={styles.stepIconCircle}>
                <Feather name={icon} size={14} color="rgba(255,255,255,0.7)" />
              </View>
              <Text style={[styles.stepText, { fontFamily: 'Inter_300Light' }]}>
                {text}
              </Text>
            </View>
          ))}
        </View>

        {/* Bouton */}
        <TouchableOpacity
          style={styles.button}
          onPress={onStart}
          activeOpacity={0.85}
        >
          <Text style={[styles.buttonText, { fontFamily: 'Inter_700Bold' }]}>
            Commencer
          </Text>
          <Feather name="arrow-right" size={16} color="#111" />
        </TouchableOpacity>

      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    borderRadius: 48,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    gap: 24,
    zIndex: 10,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 32,
    color: '#fff',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 20,
    textAlign: 'center',
  },
  stepsBox: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  stepsLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 3,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 2,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stepIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    flex: 1,
    lineHeight: 18,
  },
  button: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#111',
    fontSize: 16,
  },
});