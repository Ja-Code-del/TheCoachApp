import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CONFETTI_COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
const seededRand = (i, offset = 0) => Math.abs(Math.sin(i * 127.1 + offset * 311.7));

const CONFETTI_PIECES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: seededRand(i, 0) * 100,
  delay: seededRand(i, 1) * 2000,
  duration: (2 + seededRand(i, 2) * 1.5) * 1000,
  color: CONFETTI_COLORS[Math.floor(seededRand(i, 3) * CONFETTI_COLORS.length)],
  size: 6 + Math.floor(seededRand(i, 4) * 4) * 3,
  isCircle: i % 3 === 0,
}));

function ConfettiPiece({ piece }) {
  const progress = useRef(new Animated.Value(0)).current;

  // Un seul Animated.Value pilote translateY + rotate + opacity (comme la keyframe CSS)
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [-20, SCREEN_HEIGHT + 10] });
  const rotate    = progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '720deg'] });
  const opacity   = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(piece.delay),
        Animated.timing(progress, {
          toValue: 1,
          duration: piece.duration,
          useNativeDriver: true,
        }),
        Animated.timing(progress, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: `${piece.x}%`,
        top: 0,
        width: piece.size,
        height: piece.size,
        backgroundColor: piece.color,
        borderRadius: piece.isCircle ? piece.size / 2 : 2,
        transform: [{ translateY }, { rotate }],
        opacity,
      }}
    />
  );
}

export default function ConfettiAnimation() {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {CONFETTI_PIECES.map((p) => (
        <ConfettiPiece key={p.id} piece={p} />
      ))}
    </View>
  );
}
