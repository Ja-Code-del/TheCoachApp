import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function MemoirWelcomeScreen({ isDark }) {
  const c = isDark ? DARK : LIGHT;

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: c.iconBg, borderColor: c.iconBorder }]}>
        <FontAwesome name="cloud" size={32} color={c.iconColor} />
      </View>

      <Text style={[styles.title, { color: c.title }]}>Vos Souvenirs</Text>

      <Text style={[styles.sub, { color: c.sub }]}>
        Chaque événement passé devient un souvenir précieux — avec vos photos et vos notes.
      </Text>

      <View style={[styles.divider, { backgroundColor: c.divider }]} />

      <View style={styles.hintRow}>
        <Text style={[styles.hintDot, { color: c.hintDot }]}>●</Text>
        <Text style={[styles.hint, { color: c.hint }]}>
          Le lendemain du Jour J, l'événement bascule automatiquement ici.
        </Text>
      </View>
      <View style={styles.hintRow}>
        <Text style={[styles.hintDot, { color: c.hintDot }]}>●</Text>
        <Text style={[styles.hint, { color: c.hint }]}>
          Ajoutez des photos et une note pour immortaliser le moment.
        </Text>
      </View>
    </View>
  );
}

const LIGHT = {
  iconBg: 'rgba(0,0,0,0.05)',
  iconBorder: 'rgba(0,0,0,0.07)',
  iconColor: 'rgba(0,0,0,0.35)',
  title: '#1a1a2e',
  sub: 'rgba(0,0,0,0.5)',
  divider: 'rgba(0,0,0,0.1)',
  hintDot: 'rgba(0,0,0,0.25)',
  hint: 'rgba(0,0,0,0.35)',
};

const DARK = {
  iconBg: 'rgba(255,255,255,0.07)',
  iconBorder: 'rgba(255,255,255,0.12)',
  iconColor: 'rgba(255,255,255,0.5)',
  title: '#ffffff',
  sub: 'rgba(255,255,255,0.45)',
  divider: 'rgba(255,255,255,0.12)',
  hintDot: 'rgba(255,255,255,0.2)',
  hint: 'rgba(255,255,255,0.3)',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingVertical: 40,
    gap: 14,
    minHeight: 480,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontFamily: 'PlayfairDisplay_900Black',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: 14,
    fontFamily: 'Inter_300Light',
    textAlign: 'center',
    lineHeight: 22,
  },
  divider: {
    width: 32,
    height: 1,
    marginVertical: 2,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    alignSelf: 'stretch',
  },
  hintDot: {
    fontSize: 5,
    marginTop: 5,
  },
  hint: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter_300Light',
    lineHeight: 18,
  },
});
