import { useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { calcDaysLeft } from '../../lib/utils';
import { getGradientForPercentage } from '../../constants/thermalGradient';

// ── Constantes ─────────────────────────────────────────────────────────────────
const ACTION_WIDTH = 80;

// ── Gradient thermique par event ───────────────────────────────────────────────
function getEventGradient(event) {
  const total = event.totalDays;
  const left  = calcDaysLeft(event.targetDate);
  if (!total || total <= 0) return getGradientForPercentage(0);
  const pct = Math.max(0, Math.min(100, Math.round((left / total) * 100)));
  return getGradientForPercentage(pct);
}

// ── Action swipe (un bouton) ───────────────────────────────────────────────────
function SwipeAction({ icon, label, color, onPress, x, progress }) {
  const trans = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [x, 0],
  });

  return (
    <Animated.View style={{ transform: [{ translateX: trans }] }}>
      <TouchableOpacity
        style={[styles.swipeAction, { backgroundColor: color, width: ACTION_WIDTH }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Feather name={icon} size={20} color="#fff" />
        <Text style={styles.swipeActionLabel}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Carte événement (avec gradient thermique) ─────────────────────────────────
function EventCard({ event, isActive, isDragging }) {
  const daysLeft = calcDaysLeft(event.targetDate);
  const { card: gradientColors } = getEventGradient(event);
  const dateLabel = event.targetDate
    ? new Date(event.targetDate + 'T00:00:00').toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '—';

  return (
    <View
      style={[
        styles.card,
        isActive && styles.cardActive,
        isDragging && styles.cardDragging,
      ]}
    >
      {/* Gradient thermique en fond */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.accent, isActive && styles.accentActive]} />

      {event.pinned && (
        <View style={styles.pinBadge}>
          <Feather name="bookmark" size={10} color="#B8860B" />
        </View>
      )}

      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>
          {event.eventName || event.theme || 'Événement sans titre'}
        </Text>
        <Text style={styles.cardDate}>{dateLabel}</Text>
      </View>

      <View style={styles.cardRight}>
        <Text style={[styles.daysNumber, isActive && styles.daysNumberActive]}>
          {daysLeft}
        </Text>
        <Text style={styles.daysLabel}>
          {daysLeft <= 1 ? 'jour' : 'jours'}
        </Text>
      </View>

      {/* Drag handle */}
      <View style={styles.dragHandle}>
        <Feather name="menu" size={16} color="rgba(255,255,255,0.25)" />
      </View>
    </View>
  );
}

// ── Row swipeable (wrap autour de la carte) ────────────────────────────────────
function SwipeableRow({ event, isActive, onPress, onDelete, onTogglePin, drag }) {
  const swipeRef = useRef(null);

  const handleDelete = () => {
    swipeRef.current?.close();
    Alert.alert(
      'Supprimer cet événement ?',
      `« ${event.eventName || event.theme || 'Événement'} » sera définitivement supprimé.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => onDelete(event.id) },
      ],
    );
  };

  const handlePin = () => {
    swipeRef.current?.close();
    onTogglePin(event.id);
  };

  // Swipe droite → actions à gauche (supprimer)
  const renderLeftActions = (progress) => (
    <View style={styles.leftActions}>
      <SwipeAction
        icon="trash-2"
        label="Suppr."
        color="#8B1A1A"
        onPress={handleDelete}
        x={-ACTION_WIDTH}
        progress={progress}
      />
    </View>
  );

  // Swipe gauche → actions à droite (épingler)
  const renderRightActions = (progress) => (
    <View style={styles.rightActions}>
      <SwipeAction
        icon={event.pinned ? 'x' : 'bookmark'}
        label={event.pinned ? 'Retirer' : 'Épingler'}
        color="#B8860B"
        onPress={handlePin}
        x={ACTION_WIDTH}
        progress={progress}
      />
    </View>
  );

  return (
    <Swipeable
      ref={swipeRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      leftThreshold={40}
      rightThreshold={40}
      overshootLeft={false}
      overshootRight={false}
      friction={2}
    >
      <TouchableOpacity
        onPress={() => onPress(event.id)}
        onLongPress={drag}
        delayLongPress={200}
        activeOpacity={0.85}
      >
        <EventCard event={event} isActive={isActive} />
      </TouchableOpacity>
    </Swipeable>
  );
}

// ── Section header ─────────────────────────────────────────────────────────────
function SectionHeader({ title, count }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionDot} />
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionLine} />
      <Text style={styles.sectionCount}>{count}</Text>
    </View>
  );
}

// ── Header du screen ───────────────────────────────────────────────────────────
function ListHeader({ count }) {
  return (
    <View style={styles.header}>
      <Feather name="list" size={18} color="rgba(255,255,255,0.5)" />
      <Text style={styles.headerTitle}>Événements</Text>
      <View style={styles.headerBadge}>
        <Text style={styles.headerBadgeText}>{count}</Text>
      </View>
    </View>
  );
}

// ── EventListScreen ────────────────────────────────────────────────────────────
export default function EventListScreen({
  countdownEvents,
  activeEventId,
  onSelectEvent,
  onDeleteEvent,
  onTogglePin,
  onReorder,
}) {
  const isEmpty = countdownEvents.length === 0;

  // Construire les données avec headers de section
  const buildListData = useCallback(() => {
    const pinned   = countdownEvents.filter(e => e.pinned);
    const unpinned = countdownEvents.filter(e => !e.pinned);
    const data = [];

    if (pinned.length > 0) {
      data.push({ type: 'header', key: 'header-pinned', title: 'Épinglés', count: pinned.length });
      pinned.forEach(e => data.push({ type: 'event', key: e.id, event: e }));
    }

    if (unpinned.length > 0) {
      if (pinned.length > 0) {
        data.push({ type: 'header', key: 'header-events', title: 'Autres', count: unpinned.length });
      }
      unpinned.forEach(e => data.push({ type: 'event', key: e.id, event: e }));
    }

    return data;
  }, [countdownEvents]);

  const listData = buildListData();

  // ── Render item (header ou événement) ──────────────────────────────────────
  const renderItem = useCallback(({ item, drag, isActive: isDragging }) => {
    if (item.type === 'header') {
      return <SectionHeader title={item.title} count={item.count} />;
    }

    return (
      <ScaleDecorator>
        <SwipeableRow
          event={item.event}
          isActive={item.event.id === activeEventId}
          onPress={onSelectEvent}
          onDelete={onDeleteEvent}
          onTogglePin={onTogglePin}
          drag={drag}
        />
      </ScaleDecorator>
    );
  }, [activeEventId, onSelectEvent, onDeleteEvent, onTogglePin]);

  // ── Après drag & drop → reconstruire l'ordre ──────────────────────────────
  const handleDragEnd = useCallback(({ data }) => {
    // Extraire seulement les events (pas les headers)
    const reordered = data.filter(d => d.type === 'event').map(d => d.event);
    onReorder(reordered);
  }, [onReorder]);

  // ── État vide ──────────────────────────────────────────────────────────────
  if (isEmpty) {
    return (
      <View style={styles.root}>
        <ListHeader count={0} />
        <View style={styles.empty}>
          <Feather name="calendar" size={40} color="rgba(255,255,255,0.15)" />
          <Text style={styles.emptyTitle}>Aucun événement</Text>
          <Text style={styles.emptySub}>
            Appuie sur + pour créer ton premier compte à rebours.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ListHeader count={countdownEvents.length} />

      <DraggableFlatList
        data={listData}
        keyExtractor={item => item.key}
        renderItem={renderItem}
        onDragEnd={handleDragEnd}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        activationDistance={10}
        containerStyle={styles.listContainer}
      />

      {/* Hint en bas */}
      <View style={styles.hint}>
        <Feather name="info" size={10} color="rgba(255,255,255,0.2)" />
        <Text style={styles.hintText}>
          ← Épingler · Supprimer → · Maintenir pour déplacer
        </Text>
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 4,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  headerBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },

  // ── Section headers ──
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
    gap: 8,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  sectionCount: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: 'rgba(255,255,255,0.15)',
  },

  // ── List ──
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  // ── Event card ──
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    marginBottom: 6,
  },
  cardActive: {
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardDragging: {
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
    transform: [{ scale: 1.03 }],
  },

  accent: {
    width: 3,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  accentActive: {
    backgroundColor: '#fff',
  },

  pinBadge: {
    marginLeft: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(184,134,11,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(184,134,11,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardBody: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 3,
  },
  cardName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#fff',
  },
  cardDate: {
    fontFamily: 'Inter_300Light',
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },

  cardRight: {
    paddingRight: 6,
    alignItems: 'center',
  },
  daysNumber: {
    fontFamily: 'Inter_900Black',
    fontSize: 24,
    color: 'rgba(255,255,255,0.35)',
    lineHeight: 28,
  },
  daysNumberActive: {
    color: '#fff',
  },
  daysLabel: {
    fontFamily: 'Inter_300Light',
    fontSize: 9,
    color: 'rgba(255,255,255,0.25)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  dragHandle: {
    paddingHorizontal: 10,
    paddingVertical: 16,
  },

  // ── Swipe actions ──
  leftActions: {
    marginBottom: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  rightActions: {
    marginBottom: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  swipeAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  swipeActionLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // ── Hint ──
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingBottom: 12,
  },
  hintText: {
    fontFamily: 'Inter_300Light',
    fontSize: 9,
    color: 'rgba(255,255,255,0.18)',
    letterSpacing: 0.3,
  },

  // ── État vide ──
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  emptyTitle: {
    fontFamily: 'Inter_900Black',
    fontSize: 18,
    color: 'rgba(255,255,255,0.3)',
  },
  emptySub: {
    fontFamily: 'Inter_300Light',
    fontSize: 13,
    color: 'rgba(255,255,255,0.2)',
    textAlign: 'center',
    lineHeight: 20,
  },
});
