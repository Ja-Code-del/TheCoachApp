import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { calcDaysLeft } from '../../lib/utils';
import { t } from '../../lib/i18n';

// ── Gradient thermique en fonction du % restant ──────────────────────────────
// Reproduit la logique de useThermalGradient comme fonction pure
// (les hooks ne peuvent pas être appelés dans une boucle)
function getThermalColors(percentage) {
  if (percentage >= 80) {
    // Bleu glacial — loin de l'échéance
    return ['#0f2027', '#203a43', '#2c5364'];
  }
  if (percentage >= 60) {
    // Violet froid
    return ['#1a1a2e', '#16213e', '#0f3460'];
  }
  if (percentage >= 40) {
    // Violet chaud → rose
    return ['#2d1b69', '#11998e', '#38ef7d'];
  }
  if (percentage >= 20) {
    // Orange brûlant
    return ['#f7971e', '#ffd200', '#f7971e'];
  }
  if (percentage >= 5) {
    // Rouge vif — l'échéance approche
    return ['#c0392b', '#e74c3c', '#f39c12'];
  }
  // Jour J et quasi-Jour J
  return ['#f7971e', '#ff4e50', '#f9213b'];
}

function getEventPercentage(event) {
  const total = event.totalDays;
  const left  = calcDaysLeft(event.targetDate);
  if (!total || total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((left / total) * 100)));
}

// ── Format de date courte ────────────────────────────────────────────────────
function formatShortDate(targetDate) {
  if (!targetDate) return '';
  const [y, m, d] = targetDate.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// ── EventRow ─────────────────────────────────────────────────────────────────
function EventRow({ event, isActive, onPress }) {
  const daysLeft   = calcDaysLeft(event.targetDate);
  const percentage = getEventPercentage(event);
  const colors     = getThermalColors(percentage);
  const isToday    = daysLeft === 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.82}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.row, isActive && styles.rowActive]}
      >
        {/* Bordure gauche lumineuse si actif */}
        {isActive && <View style={styles.activeBar} />}

        {/* Infos événement */}
        <View style={styles.rowLeft}>
          <Text style={styles.rowName} numberOfLines={1}>
            {event.eventName || event.theme || '—'}
          </Text>
          <View style={styles.rowMeta}>
            <Feather name="calendar" size={10} color="rgba(255,255,255,0.45)" />
            <Text style={styles.rowDate}>
              {formatShortDate(event.targetDate)}
              {event.targetTime ? ` · ${event.targetTime}` : ''}
            </Text>
          </View>
        </View>

        {/* Jours restants */}
        <View style={styles.rowRight}>
          {isToday ? (
            <View style={styles.todayBadge}>
              <Text style={styles.todayText}>Jour J</Text>
            </View>
          ) : (
            <>
              <Text style={styles.rowDays}>{daysLeft}</Text>
              <Text style={styles.rowDaysLabel}>
                {daysLeft === 1 ? t('day_remaining') : t('days_remaining')}
              </Text>
            </>
          )}
        </View>

        {/* Chevron */}
        <Feather name="chevron-right" size={14} color="rgba(255,255,255,0.35)" />

      </LinearGradient>
    </TouchableOpacity>
  );
}

// ── EventList ─────────────────────────────────────────────────────────────────
export default function EventList({ events, activeEvent, onSelectEvent, onAddEvent }) {
  // Tri : Jour J en premier, puis par jours restants croissants
  const sorted = [...events].sort((a, b) => {
    const da = calcDaysLeft(a.targetDate);
    const db = calcDaysLeft(b.targetDate);
    return da - db;
  });

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {events.length} {events.length === 1 ? 'événement' : 'événements'}
        </Text>
        <TouchableOpacity style={styles.addBtn} onPress={onAddEvent} activeOpacity={0.7}>
          <Feather name="plus" size={15} color="rgba(255,255,255,0.8)" />
          <Text style={styles.addBtnText}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      {/* Liste */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {sorted.map(event => (
          <EventRow
            key={event.id}
            event={event}
            isActive={event.id === activeEvent?.id}
            onPress={() => onSelectEvent(event.id)}
          />
        ))}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 3,
    color: 'rgba(255,255,255,0.4)',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
  },
  addBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: 'rgba(255,255,255,0.8)',
  },

  // Liste
  list: { gap: 10 },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  rowActive: {
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: 10,
    bottom: 10,
    width: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },

  // Left
  rowLeft: {
    flex: 1,
    gap: 4,
  },
  rowName: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    letterSpacing: -0.2,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  rowDate: {
    fontSize: 11,
    fontFamily: 'Inter_300Light',
    color: 'rgba(255,255,255,0.45)',
  },

  // Right — jours restants
  rowRight: {
    alignItems: 'flex-end',
    marginRight: 4,
  },
  rowDays: {
    fontSize: 32,
    fontFamily: 'Inter_900Black',
    color: '#fff',
    lineHeight: 34,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  rowDaysLabel: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.5)',
  },

  // Jour J badge
  todayBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 20,
  },
  todayText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
});