import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  ActivityIndicator, StyleSheet,
} from 'react-native';

export default function WidgetDisplay({
  activeEvent, daysLeft, currentFont,
  isLoadingQuote, quoteError, isLoadingImage,
  isSharing, shareError,
  onAddEvent, onOpenSettings, onRefreshImage, onRefreshQuote, onShare,
}) {
  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={onAddEvent} activeOpacity={0.7}>
          <Text style={styles.iconText}>＋</Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.iconBtn, (isLoadingImage || !activeEvent.theme) && styles.iconBtnDisabled]}
            onPress={onRefreshImage}
            disabled={isLoadingImage || !activeEvent.theme}
            activeOpacity={0.7}
          >
            <Text style={[styles.iconText, isLoadingImage && { opacity: 0.4 }]}>🖼</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={onOpenSettings} activeOpacity={0.7}>
            <Text style={styles.iconText}>⚙</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Chiffre */}
      <View style={styles.counterBlock}>
        <Text style={[styles.daysNumber, {
          fontFamily: currentFont.numberStyle.fontFamily,
          fontWeight: currentFont.numberStyle.fontWeight,
        }]}>
          {daysLeft}
        </Text>
        <Text style={[styles.daysLabel, {
          fontFamily: currentFont.labelStyle.fontFamily,
          fontWeight: currentFont.labelStyle.fontWeight,
          letterSpacing: currentFont.labelStyle.letterSpacing ?? 8,
        }]}>
          Jours restants
        </Text>
        {(activeEvent.eventName || activeEvent.theme) && (
          <Text style={styles.eventName}>— {activeEvent.eventName || activeEvent.theme}</Text>
        )}
      </View>

      {/* Citation */}
      <View style={styles.quoteBox}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {isLoadingQuote ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="rgba(255,255,255,0.6)" />
              <Text style={styles.loadingText}>Génération en cours...</Text>
            </View>
          ) : quoteError ? (
            <Text style={styles.errorText}>{quoteError}</Text>
          ) : (
            <>
              <Text style={[styles.quoteText, {
                fontFamily: currentFont.quoteStyle.fontFamily,
                fontStyle: currentFont.quoteStyle.fontStyle || 'italic',
                fontWeight: currentFont.quoteStyle.fontWeight,
              }]}>
                "{activeEvent.quote?.text}"
              </Text>
              {activeEvent.quote?.author && (
                <Text style={styles.quoteAuthor}>— {activeEvent.quote.author}</Text>
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
          <Text style={[styles.refreshQuoteText, isLoadingQuote && { opacity: 0.3 }]}>
            ↻  Nouvelle citation
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
              <Text style={styles.shareBtnText}>Capture en cours...</Text>
            </>
          ) : (
            <Text style={styles.shareBtnText}>⬆  Partager le moment</Text>
          )}
        </TouchableOpacity>
        {shareError && <Text style={styles.shareError}>{shareError}</Text>}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  iconText: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.8)',
  },
  counterBlock: {
    alignItems: 'center',
  },
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
    marginTop: 4,
  },
  eventName: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    fontStyle: 'italic',
    marginTop: 4,
  },
  quoteBox: {
    flex: 1,
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
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.4)',
  },
  refreshQuoteBtn: {
    alignItems: 'center',
    paddingTop: 4,
  },
  refreshQuoteText: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 3,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '700',
  },
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
    fontWeight: '700',
    fontSize: 15,
  },
  shareError: {
    fontSize: 10,
    color: '#fca5a5',
    textAlign: 'center',
    opacity: 0.8,
  },
});
