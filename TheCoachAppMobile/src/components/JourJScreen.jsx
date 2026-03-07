import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  ActivityIndicator, StyleSheet, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import ConfettiAnimation from './ConfettiAnimation';
import { t } from '../lib/i18n';

export default function JourJScreen({ eventName, theme, onShare, isSharing, onAddEvent, onDismiss }) {
  const starScale    = useRef(new Animated.Value(0.6)).current;
  const starOpacity  = useRef(new Animated.Value(0)).current;
  const starRotate   = useRef(new Animated.Value(0)).current;
  const topOpacity   = useRef(new Animated.Value(0)).current;
  const topSlide     = useRef(new Animated.Value(-12)).current;
  const centerOpacity = useRef(new Animated.Value(0)).current;
  const centerSlide  = useRef(new Animated.Value(20)).current;
  const actionsOpacity = useRef(new Animated.Value(0)).current;
  const actionsSlide = useRef(new Animated.Value(16)).current;
  const btnOpacity   = useRef(new Animated.Value(0)).current;
  const btnSlide     = useRef(new Animated.Value(12)).current;
  const haloScale    = useRef(new Animated.Value(0.7)).current;
  const haloOpacity  = useRef(new Animated.Value(0)).current;

  const spinValue = starRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '20deg'],
  });

  useEffect(() => {
    Animated.sequence([
      // 1. Halo pulse
      Animated.parallel([
        Animated.timing(haloOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(haloScale,   { toValue: 1, friction: 5, tension: 30, useNativeDriver: true }),
      ]),
      // 2. Badge haut
      Animated.parallel([
        Animated.timing(topOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.spring(topSlide,   { toValue: 0, friction: 10, tension: 60, useNativeDriver: true }),
      ]),
      // 3. Centre — étoile + titre
      Animated.parallel([
        Animated.timing(centerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(centerSlide,   { toValue: 0, friction: 9, tension: 50, useNativeDriver: true }),
        Animated.spring(starScale,     { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }),
        Animated.timing(starOpacity,   { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(starRotate,    { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      // 4. Boutons action
      Animated.parallel([
        Animated.timing(actionsOpacity, { toValue: 1, duration: 320, useNativeDriver: true }),
        Animated.spring(actionsSlide,   { toValue: 0, friction: 10, tension: 60, useNativeDriver: true }),
      ]),
      // 5. Bouton partage
      Animated.parallel([
        Animated.timing(btnOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.spring(btnSlide,   { toValue: 0, friction: 10, tension: 60, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>

      {/* Fond dégradé */}
      <LinearGradient
        colors={['#1a0533', '#4a0080', '#7c1055', '#b8430a']}
        locations={[0, 0.35, 0.65, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Halo central animé */}
      <Animated.View style={[
        styles.halo,
        { opacity: haloOpacity, transform: [{ scale: haloScale }] },
      ]} pointerEvents="none" />

      <ConfettiAnimation />

      <View style={styles.content}>

        {/* ── TOP — badge ── */}
        <Animated.View style={[
          styles.topBlock,
          { opacity: topOpacity, transform: [{ translateY: topSlide }] },
        ]}>
          <View style={styles.topBadge}>
            <Text style={[styles.topLabel, { fontFamily: 'Inter_700Bold' }]}>
              {t('jour_j_title')}
            </Text>
          </View>
        </Animated.View>

        {/* ── CENTRE — étoile + titre + event ── */}
        <Animated.View style={[
          styles.centerBlock,
          { opacity: centerOpacity, transform: [{ translateY: centerSlide }] },
        ]}>
          <Animated.Text style={[
            styles.star,
            { transform: [{ scale: starScale }, { rotate: spinValue }], opacity: starOpacity },
          ]}>
            ✦
          </Animated.Text>

          <Text style={[styles.jourJText, { fontFamily: 'Inter_900Black' }]}>
            {t('jour_j_heading')}
          </Text>

          {(eventName || theme) && (
            <View style={styles.eventBadge}>
              <Text style={[styles.eventText, { fontFamily: 'Inter_300Light' }]}>
                {eventName || theme}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* ── ACTIONS — Ajouter / Continuer ── */}
        <Animated.View style={[
          styles.actionsBlock,
          { opacity: actionsOpacity, transform: [{ translateY: actionsSlide }] },
        ]}>
          {/* Ajouter */}
          <TouchableOpacity style={styles.actionCard} onPress={onAddEvent} activeOpacity={0.75}>
            <LinearGradient
              colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.06)']}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.actionIconWrap}>
              <Feather name="plus" size={22} color="#fff" />
            </View>
            <Text style={[styles.actionLabel, { fontFamily: 'Inter_700Bold' }]}>
              Nouvel événement
            </Text>
            <Text style={[styles.actionSub, { fontFamily: 'Inter_300Light' }]}>
              Créer un compte à rebours
            </Text>
          </TouchableOpacity>

          {/* Continuer */}
          <TouchableOpacity style={styles.actionCard} onPress={onDismiss} activeOpacity={0.75}>
            <LinearGradient
              colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.06)']}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.actionIconWrap}>
              <Feather name="bookmark" size={20} color="#fff" />
            </View>
            <Text style={[styles.actionLabel, { fontFamily: 'Inter_700Bold' }]}>
              Garder en souvenir
            </Text>
            <Text style={[styles.actionSub, { fontFamily: 'Inter_300Light' }]}>
              Archiver ce moment
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── BOUTON PARTAGE ── */}
        <Animated.View style={[
          styles.shareWrapper,
          { opacity: btnOpacity, transform: [{ translateY: btnSlide }] },
        ]}>
          <TouchableOpacity
            style={[styles.shareBtn, isSharing && styles.shareBtnDisabled]}
            onPress={onShare}
            disabled={isSharing}
            activeOpacity={0.85}
          >
            {isSharing ? (
              <>
                <ActivityIndicator size="small" color="#374151" />
                <Text style={[styles.shareBtnText, { fontFamily: 'Inter_700Bold' }]}>
                  {t('sharing')}
                </Text>
              </>
            ) : (
              <>
                <Feather name="share" size={15} color="#111" />
                <Text style={[styles.shareBtnText, { fontFamily: 'Inter_700Bold' }]}>
                  {t('jour_j_immortalize')}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

      </View>
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
    top: '28%',
    alignSelf: 'center',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255,200,50,0.06)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 80,
  },

  // ── Layout principal ──
  content: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 10,
    paddingHorizontal: 28,
    paddingTop: 44,
    paddingBottom: 36,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // ── Top badge ──
  topBlock: {
    alignItems: 'center',
  },
  topBadge: {
    paddingHorizontal: 16,
    paddingVertical: 7,
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

  // ── Centre ──
  centerBlock: {
    alignItems: 'center',
    gap: 14,
  },
  star: {
    fontSize: 72,
    color: '#FFD700',
    textShadowColor: 'rgba(255,215,0,0.65)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 36,
  },
  jourJText: {
    fontSize: 44,
    color: '#fff',
    letterSpacing: -1.5,
    textShadowColor: 'rgba(255,255,255,0.18)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 20,
    textAlign: 'center',
  },
  eventBadge: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
    borderRadius: 20,
    maxWidth: '85%',
  },
  eventText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // ── Action cards ──
  actionsBlock: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionCard: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 10,
    alignItems: 'flex-start',
  },
  actionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 13,
    color: '#fff',
    lineHeight: 17,
  },
  actionSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 15,
  },

  // ── Bouton partage ──
  shareWrapper: {
    width: '100%',
  },
  shareBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  shareBtnDisabled: {
    opacity: 0.6,
  },
  shareBtnText: {
    color: '#111',
    fontSize: 15,
  },
});