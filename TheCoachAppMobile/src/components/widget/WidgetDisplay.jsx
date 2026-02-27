import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  ActivityIndicator, StyleSheet, Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

// --- TOOLTIP GLASSMORPHISM ---
function Tooltip({ label, children }) {
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;

  const show = () => {
    setVisible(true);
    Animated.timing(opacity, {
      toValue: 1, duration: 150, useNativeDriver: true,
    }).start();
  };

  const hide = () => {
    Animated.timing(opacity, {
      toValue: 0, duration: 150, useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  return (
    <View style={tooltipStyles.wrapper}>
      {visible && (
        <Animated.View style={[tooltipStyles.tooltip, { opacity }]}>
          <Text style={tooltipStyles.label} numberOfLines={1}>{label}</Text>
        </Animated.View>
      )}
      {React.cloneElement(children, {
        onLongPress: show,
        onPressOut: hide,
        delayLongPress: 300,
      })}
    </View>
  );
}

const tooltipStyles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  tooltip: {
    position: 'absolute',
    top: '100%',
    marginTop: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 100,
  },
  label: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
});

// --- COMPTEUR PRÉCIS avec animation fade + vague ---
function PreciseCounter({ timeLeft, currentFont, counterStyle }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  // Rejoue l'animation à chaque changement de minute
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(10);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 12,
        tension: 30,
        useNativeDriver: true,
      }),
    ]).start();
  }, [timeLeft.hours, timeLeft.minutes]);

  const isGlass = counterStyle === 'glass';

  return (
    <Animated.View
      style={[
        styles.preciseWrapper,
        isGlass && styles.preciseWrapperGlass,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.preciseBlock}>

        {timeLeft.days > 0 && (
          <>
            <View style={styles.preciseCell}>
              <Text style={[
                styles.preciseNumber,
                isGlass && styles.preciseNumberGlass,
                { fontFamily: currentFont.numberStyle.fontFamily },
              ]}>
                {timeLeft.days}
              </Text>
              <Text style={[styles.preciseUnit, isGlass && styles.preciseUnitGlass]}>j</Text>
            </View>
            <Text style={[styles.preciseSep, isGlass && styles.preciseSepGlass]}>·</Text>
          </>
        )}

        <View style={styles.preciseCell}>
          <Text style={[
            styles.preciseNumber,
            isGlass && styles.preciseNumberGlass,
            { fontFamily: currentFont.numberStyle.fontFamily },
          ]}>
            {String(timeLeft.hours).padStart(2, '0')}
          </Text>
          <Text style={[styles.preciseUnit, isGlass && styles.preciseUnitGlass]}>h</Text>
        </View>

        <Text style={[styles.preciseSep, isGlass && styles.preciseSepGlass]}>·</Text>

        <View style={styles.preciseCell}>
          <Text style={[
            styles.preciseNumber,
            isGlass && styles.preciseNumberGlass,
            { fontFamily: currentFont.numberStyle.fontFamily },
          ]}>
            {String(timeLeft.minutes).padStart(2, '0')}
          </Text>
          <Text style={[styles.preciseUnit, isGlass && styles.preciseUnitGlass]}>min</Text>
        </View>

      </View>

      <Text style={[
        styles.daysLabel,
        isGlass && styles.daysLabelGlass,
        {
          fontFamily: currentFont.labelStyle.fontFamily,
          letterSpacing: currentFont.labelStyle.letterSpacing ?? 8,
        },
      ]}>
        Restants
      </Text>
    </Animated.View>
  );
}

// --- WIDGET DISPLAY ---
export default function WidgetDisplay({
  activeEvent, daysLeft, timeLeft, currentFont,
  isLoadingQuote, quoteError, isLoadingImage,
  isSharing, shareError, saveSuccess,
  onAddEvent, onOpenSettings, onRefreshImage, onRefreshQuote, onShare,
}) {
  const counterStyle = activeEvent.counterStyle || 'default';

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Tooltip label="Ajouter un événement">
          <TouchableOpacity style={styles.iconBtn} onPress={onAddEvent} activeOpacity={0.7}>
            <Feather name="plus" size={18} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </Tooltip>

        <View style={styles.headerRight}>
          <Tooltip label="Changer l'image">
            <TouchableOpacity
              style={[styles.iconBtn, (isLoadingImage || !activeEvent.theme) && styles.iconBtnDisabled]}
              onPress={onRefreshImage}
              disabled={isLoadingImage || !activeEvent.theme}
              activeOpacity={0.7}
            >
              <Feather
                name="image"
                size={18}
                color={isLoadingImage ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)'}
              />
            </TouchableOpacity>
          </Tooltip>

          <Tooltip label="Paramètres">
            <TouchableOpacity style={styles.iconBtn} onPress={onOpenSettings} activeOpacity={0.7}>
              <Feather name="settings" size={18} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </Tooltip>
        </View>
      </View>

      {/* Compteur */}
      <View style={styles.counterBlock}>

        {/* Nom de l'événement */}
        {(activeEvent.eventName || activeEvent.theme) && (
          <View style={styles.eventNameBadge}>
            <Text
              style={[styles.eventNameText, { fontFamily: 'Inter_700Bold' }]}
              numberOfLines={1}
            >
              {activeEvent.eventName || activeEvent.theme}
            </Text>
          </View>
        )}

        {timeLeft?.isPrecise ? (
          <PreciseCounter
            timeLeft={timeLeft}
            currentFont={currentFont}
            counterStyle={counterStyle}
          />
        ) : (
          <>
            <Text style={[styles.daysNumber, { fontFamily: currentFont.numberStyle.fontFamily }]}>
              {daysLeft}
            </Text>
            <Text style={[styles.daysLabel, {
              fontFamily: currentFont.labelStyle.fontFamily,
              letterSpacing: currentFont.labelStyle.letterSpacing ?? 8,
            }]}>
              Jours restants
            </Text>
          </>
        )}

      </View>

      {/* Citation */}
      <View style={styles.quoteBox}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {isLoadingQuote ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="rgba(255,255,255,0.6)" />
              <Text style={[styles.loadingText, { fontFamily: 'Inter_300Light' }]}>
                Génération en cours...
              </Text>
            </View>
          ) : quoteError ? (
            <Text style={[styles.errorText, { fontFamily: 'Inter_300Light' }]}>{quoteError}</Text>
          ) : (
            <>
              <Text style={[styles.quoteText, {
                fontFamily: currentFont.quoteStyle.fontFamily,
                fontStyle: currentFont.quoteStyle.fontStyle || 'italic',
              }]}>
                "{activeEvent.quote?.text}"
              </Text>
              {activeEvent.quote?.author && (
                <Text style={[styles.quoteAuthor, { fontFamily: 'Inter_700Bold' }]}>
                  — {activeEvent.quote.author}
                </Text>
              )}
            </>
          )}
        </ScrollView>

        <TouchableOpacity
          style={styles.refreshQuoteBtn}
          onPress={onRefreshQuote}
          disabled={isLoadingQuote}
          activeOpacity={0.6}
        >
          <Feather
            name="refresh-cw"
            size={10}
            color="rgba(255,255,255,0.45)"
            style={isLoadingQuote ? { opacity: 0.3 } : {}}
          />
          <Text style={[styles.refreshQuoteText, isLoadingQuote && { opacity: 0.3 }, { fontFamily: 'Inter_700Bold' }]}>
            Nouvelle citation
          </Text>
        </TouchableOpacity>
      </View>

      {/* Partager */}
      <View style={styles.shareBlock}>
        <TouchableOpacity
          style={[styles.shareBtn, isSharing && { opacity: 0.6 }]}
          onPress={onShare}
          disabled={isSharing}
          activeOpacity={0.85}
        >
          {isSharing ? (
            <>
              <ActivityIndicator size="small" color="#374151" />
              <Text style={[styles.shareBtnText, { fontFamily: 'Inter_700Bold' }]}>
                Capture en cours...
              </Text>
            </>
          ) : (
            <>
              <Feather name="share" size={16} color="#111" />
              <Text style={[styles.shareBtnText, { fontFamily: 'Inter_700Bold' }]}>
                Partager le moment
              </Text>
            </>
          )}
        </TouchableOpacity>
        {shareError && (
          <Text style={[styles.shareError, { fontFamily: 'Inter_300Light' }]}>{shareError}</Text>
        )}
        {saveSuccess && (
          <Text style={[styles.saveSuccess, { fontFamily: 'Inter_700Bold' }]}>
            ✓ Image sauvegardée dans Photos
          </Text>
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnDisabled: {
    opacity: 0.3,
  },
  counterBlock: {
    alignItems: 'center',
    gap: 4,
  },
  eventNameBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    marginBottom: 4,
    maxWidth: '80%',
  },
  eventNameText: {
    fontSize: 13,
    color: '#fff',
    letterSpacing: 0.3,
    textAlign: 'center',
  },

  // --- Compteur normal ---
  daysNumber: {
    fontSize: 96,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    lineHeight: 100,
  },
  daysLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  daysLabelGlass: {
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 6,
  },

  // --- Compteur précis wrapper ---
  preciseWrapper: {
    alignItems: 'center',
    gap: 6,
  },
  preciseWrapperGlass: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 16,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },

  // --- Compteur précis contenu ---
  preciseBlock: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  preciseCell: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  preciseNumber: {
    fontSize: 56,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    lineHeight: 60,
  },
  preciseNumberGlass: {
    textShadowColor: 'rgba(255,255,255,0.15)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  preciseUnit: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.55)',
    fontFamily: 'Inter_700Bold',
    marginBottom: 6,
  },
  preciseUnitGlass: {
    color: 'rgba(255,255,255,0.75)',
  },
  preciseSep: {
    fontSize: 22,
    color: 'rgba(255,255,255,0.2)',
    marginBottom: 8,
  },
  preciseSepGlass: {
    color: 'rgba(255,255,255,0.35)',
  },

  // --- Citation ---
  quoteBox: {
    minHeight: 100,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    gap: 12,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    opacity: 0.6,
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#fff',
  },
  errorText: {
    fontSize: 13,
    color: '#fca5a5',
    fontStyle: 'italic',
  },
  quoteText: {
    fontSize: 16,
    lineHeight: 25,
    color: '#fff',
  },
  quoteAuthor: {
    marginTop: 12,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.4)',
  },
  refreshQuoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 4,
  },
  refreshQuoteText: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 3,
    color: 'rgba(255,255,255,0.45)',
  },

  // --- Partager ---
  shareBlock: {
    gap: 8,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  shareBtnText: {
    color: '#111',
    fontSize: 15,
  },
  shareError: {
    fontSize: 10,
    color: '#fca5a5',
    textAlign: 'center',
    opacity: 0.8,
  },
  saveSuccess: {
    fontSize: 10,
    color: '#86efac',
    textAlign: 'center',
  },
});