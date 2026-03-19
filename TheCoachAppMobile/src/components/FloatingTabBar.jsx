import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';

// ── Icônes et labels par tab ──────────────────────────────────────────────────
const TAB_ICONS = {
  countdown: 'layout',
  list:      'list',
  memoir:    'book-open',
  settings:  'sliders',
};

const TAB_LABELS = {
  countdown: 'Galerie',
  list:      'Liste',
  memoir:    'Souvenirs',
  settings:  'Réglages',
};

// ── Tab button simple ─────────────────────────────────────────────────────────
function TabBtn({ tabKey, isActive, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.82, duration: 80, useNativeDriver: true }),
      Animated.spring(scale,  { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity
      style={styles.tabBtn}
      onPress={handlePress}
      activeOpacity={1}
    >
      <Animated.View style={[styles.tabInner, { transform: [{ scale }] }]}>
        <Feather
          name={TAB_ICONS[tabKey]}
          size={20}
          color={isActive ? '#fff' : 'rgba(255,255,255,0.38)'}
        />
        <Text style={[
          styles.tabLabel,
          { color: isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.32)' },
          isActive && styles.tabLabelActive,
        ]}>
          {TAB_LABELS[tabKey]}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ── Bouton + central surélevé ─────────────────────────────────────────────────
function AddBtn({ onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const glow  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.spring(scale,  { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  const glowOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.7],
  });

  return (
    <TouchableOpacity
      style={styles.addBtnWrapper}
      onPress={handlePress}
      activeOpacity={1}
    >
      {/* Halo animé */}
      <Animated.View style={[styles.addBtnGlow, { opacity: glowOpacity }]} />

      {/* Cercle blanc */}
      <Animated.View style={[styles.addBtn, { transform: [{ scale }] }]}>
        <Feather name="plus" size={26} color="#111" />
      </Animated.View>
    </TouchableOpacity>
  );
}

// ── FloatingTabBar ────────────────────────────────────────────────────────────
export default function FloatingTabBar({ mode, onSwitch, onAddEvent }) {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.bar}>

        {/* Fond blur */}
        <View style={styles.barBg}>
          <BlurView
            intensity={28}
            tint="dark"
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.overlay} />
        </View>

        {/* Tabs gauche */}
        <TabBtn tabKey="countdown" isActive={mode === 'countdown'} onPress={() => onSwitch('countdown')} />
        <TabBtn tabKey="list"      isActive={mode === 'list'}      onPress={() => onSwitch('list')} />

        {/* Bouton + central */}
        <View style={styles.addSlot}>
          <AddBtn onPress={onAddEvent} />
        </View>

        {/* Tabs droite */}
        <TabBtn tabKey="memoir"   isActive={mode === 'memoir'}   onPress={() => onSwitch('memoir')} />
        <TabBtn tabKey="settings" isActive={mode === 'settings'} onPress={() => onSwitch('settings')} />

      </View>
    </View>
  );
}

const BAR_HEIGHT = 64;
const ADD_SIZE   = 56;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 28,
    zIndex: 50,
  },

  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: BAR_HEIGHT,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 16,
    width: 340,
    overflow: 'visible',
  },

  barBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 32,
    overflow: 'hidden',
  },

  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(10,10,20,0.72)',
  },

  // Tab standard
  tabBtn: {
    flex: 1,
    height: BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabInner: {
    alignItems: 'center',
    gap: 3,
  },
  tabLabel: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  tabLabelActive: {
    letterSpacing: 0.5,
  },

  // Slot central pour le bouton +
  addSlot: {
    width: ADD_SIZE + 20,
    height: BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    zIndex: 10,
  },

  // Wrapper du bouton +
  addBtnWrapper: {
    width: ADD_SIZE,
    height: ADD_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -(ADD_SIZE - BAR_HEIGHT) / 2 - 6,
  },

  // Halo pulsant
  addBtnGlow: {
    position: 'absolute',
    width: ADD_SIZE + 16,
    height: ADD_SIZE + 16,
    borderRadius: (ADD_SIZE + 16) / 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  // Cercle blanc
  addBtn: {
    width: ADD_SIZE,
    height: ADD_SIZE,
    borderRadius: ADD_SIZE / 2,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
});
