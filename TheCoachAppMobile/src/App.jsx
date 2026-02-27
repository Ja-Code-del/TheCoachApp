import { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Animated, ImageBackground, TouchableOpacity, Text,
  ActivityIndicator, Linking, StyleSheet, Dimensions,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import {
  Inter_300Light, Inter_700Bold, Inter_900Black,
} from '@expo-google-fonts/inter';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_900Black,
} from '@expo-google-fonts/playfair-display';
import {
  Lora_400Regular, Lora_400Regular_Italic, Lora_700Bold,
} from '@expo-google-fonts/lora';
import {
  SpaceGrotesk_300Light, SpaceGrotesk_500Medium, SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';

import { useEvents } from './hooks/useEvents';
import { useCarousel } from './hooks/useCarousel';
import { useMediaGeneration } from './hooks/useMediaGeneration';
import { useShare } from './hooks/useShare';
import WelcomeScreen from './components/WelcomeScreen';
import JourJScreen from './components/JourJScreen';
import ShareCard from './components/ShareCard';
import WidgetDisplay from './components/widget/WidgetDisplay';
import WidgetSettings from './components/widget/WidgetSettings';
import { FONTS } from './constants/fonts';
import { calcDaysLeft, DEFAULT_EVENT } from './lib/utils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_HEIGHT = Math.min(CARD_WIDTH * 1.618, SCREEN_HEIGHT * 0.87);

export default function App() {
  const shareCardRef = useRef(null);
  const contentOpacity = useRef(new Animated.Value(0)).current;

  // --- Chargement des polices ---
  const [fontsLoaded] = useFonts({
    Inter_300Light, Inter_700Bold, Inter_900Black,
    BebasNeue_400Regular,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_400Regular_Italic,
    PlayfairDisplay_900Black,
    Lora_400Regular, Lora_400Regular_Italic, Lora_700Bold,
    SpaceGrotesk_300Light, SpaceGrotesk_500Medium, SpaceGrotesk_700Bold,
  });

  // --- Premier lancement ---
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('hasLaunched').then(value => {
      const firstLaunch = !value;
      setIsFirstLaunch(firstLaunch);
      setWelcomeVisible(firstLaunch);
    });
  }, []);

  // --- Hooks ---
  const {
    events, setEvents, activeIndex, setActiveIndex, activeEvent, isReady,
    updateActiveEvent, updateEventById, appendEvent, deleteActiveEvent,
  } = useEvents();

  const { switchTo, fadeVisible, handleTouchStart, handleTouchEnd } = useCarousel(
    events.length, activeIndex, setActiveIndex
  );

  const {
    generateQuote, loadImage,
    isLoadingQuote, isLoadingImage,
    quoteError, resetQuoteError,
  } = useMediaGeneration(activeEvent, updateEventById);

  // --- Valeurs dérivées mémoïsées ---
  const currentFont = useMemo(
    () => FONTS.find(f => f.id === activeEvent.fontId) || FONTS[0],
    [activeEvent.fontId]
  );

  const daysLeft = useMemo(
    () => calcDaysLeft(activeEvent.targetDate),
    [activeEvent.targetDate]
  );

  const todayStr = useMemo(
    () => new Date().toISOString().split('T')[0],
    []
  );

  const isJourJ = daysLeft === 0 && !!activeEvent.theme && activeEvent.targetDate === todayStr;

  const { handleShare, isSharing, shareError, saveSuccess } = useShare(
    shareCardRef, activeEvent, daysLeft, isJourJ
  );

  // --- Fade du carousel ---
  useEffect(() => {
    const shouldShow = isFirstLaunch === false && !isJourJ;
    Animated.timing(contentOpacity, {
      toValue: (shouldShow && fadeVisible) ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeVisible, isFirstLaunch, isJourJ]);

  // --- Resets ---
  useEffect(() => { resetQuoteError(); }, [activeIndex, resetQuoteError]);
  useEffect(() => { if (!isSettingsOpen) setConfirmDelete(false); }, [isSettingsOpen]);

  // --- Ajouter un événement (fix race condition) ---
  const addEvent = () => {
    const newEvent = DEFAULT_EVENT();
    setEvents(prev => {
      const newIndex = prev.length;
      setTimeout(() => {
        switchTo(newIndex);
        setIsSettingsOpen(true);
      }, 50);
      return [...prev, newEvent];
    });
  };

  const handleSaveSettings = async () => {
    setIsSettingsOpen(false);
    await Promise.all([generateQuote(), loadImage()]);
  };

  const handleStart = () => {
    setWelcomeVisible(false);
    setTimeout(() => {
      setIsFirstLaunch(false);
      AsyncStorage.setItem('hasLaunched', 'true');
      setIsSettingsOpen(true);
    }, 700);
  };

  const handleDelete = () => {
    deleteActiveEvent();
    setConfirmDelete(false);
  };

  // --- Splash screen ---
  if (!fontsLoaded || isFirstLaunch === null || !isReady) {
    return (
      <SafeAreaProvider>
        <LinearGradient colors={['#1a2a6c', '#b21f1f', '#fdbb2d']} style={styles.splash}>
          <StatusBar style="light" />
          <ActivityIndicator size="large" color="rgba(255,255,255,0.6)" />
        </LinearGradient>
      </SafeAreaProvider>
    );
  }

  const contentPointerEvents = (isFirstLaunch !== false || isJourJ) ? 'none' : 'box-none';

  return (
    <SafeAreaProvider>
      <LinearGradient colors={['#1a2a6c', '#b21f1f', '#fdbb2d']} style={styles.root}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar style="light" />

          {/* ShareCard hors-écran pour captureRef */}
          <ShareCard
            cardRef={shareCardRef}
            daysLeft={daysLeft}
            theme={activeEvent.eventName || activeEvent.theme}
            quote={activeEvent.quote}
            bgImage={activeEvent.bgImage}
            targetDate={activeEvent.targetDate}
            font={currentFont}
            isJourJ={isJourJ}
          />

          <View style={styles.outer}>
            <View
              style={[styles.card, { width: CARD_WIDTH, height: CARD_HEIGHT }]}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Fond : image ou couleur */}
              {activeEvent.bgImage ? (
                <ImageBackground
                  source={{ uri: activeEvent.bgImage }}
                  style={StyleSheet.absoluteFillObject}
                  resizeMode="cover"
                  blurRadius={2}
                >
                  <View style={[StyleSheet.absoluteFillObject, styles.overlayImage]} />
                </ImageBackground>
              ) : (
                <View style={[StyleSheet.absoluteFillObject, styles.overlayDefault]} />
              )}

              {/* Bulle décorative */}
              <View style={styles.decorCircle} pointerEvents="none" />

              {/* Indicateur chargement image */}
              {isLoadingImage && !isFirstLaunch && !isJourJ && (
                <View style={styles.loadingImageBadge} pointerEvents="none">
                  <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
                  <Text style={styles.loadingImageText}>Nouvelle image…</Text>
                </View>
              )}

              {/* Crédit Unsplash */}
              {activeEvent.photographer && !isFirstLaunch && !isJourJ && (
                <TouchableOpacity
                  style={styles.credit}
                  onPress={() => Linking.openURL(
                    `${activeEvent.photographer.url}?utm_source=countdown_app&utm_medium=referral`
                  )}
                >
                  <Text style={styles.creditText}>
                    📷 {activeEvent.photographer.name} / Unsplash
                  </Text>
                </TouchableOpacity>
              )}

              {/* Dots pagination */}
              {events.length > 1 && !isSettingsOpen && !isFirstLaunch && (
                <View style={styles.dots}>
                  {events.map((_, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => switchTo(i)}
                      style={[styles.dot, i === activeIndex && styles.dotActive]}
                    />
                  ))}
                </View>
              )}

              {/* Écran de bienvenue */}
              {isFirstLaunch && (
                <WelcomeScreen onStart={handleStart} visible={welcomeVisible} />
              )}

              {/* Jour J */}
              {isJourJ && !isFirstLaunch && (
                <JourJScreen
                  eventName={activeEvent.eventName}
                  theme={activeEvent.theme}
                  onShare={handleShare}
                  isSharing={isSharing}
                />
              )}

              {/* Contenu principal avec fondu */}
              <Animated.View
                style={[StyleSheet.absoluteFillObject, { opacity: contentOpacity }]}
                pointerEvents={contentPointerEvents}
              >
                {!isSettingsOpen ? (
                  <WidgetDisplay
                    activeEvent={activeEvent}
                    daysLeft={daysLeft}
                    currentFont={currentFont}
                    isLoadingQuote={isLoadingQuote}
                    quoteError={quoteError}
                    isLoadingImage={isLoadingImage}
                    isSharing={isSharing}
                    shareError={shareError}
                    saveSuccess={saveSuccess}
                    onAddEvent={addEvent}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    onRefreshImage={() => loadImage()}
                    onRefreshQuote={() => generateQuote()}
                    onShare={handleShare}
                  />
                ) : (
                  <WidgetSettings
                    activeEvent={activeEvent}
                    eventsCount={events.length}
                    confirmDelete={confirmDelete}
                    setConfirmDelete={setConfirmDelete}
                    isLoadingQuote={isLoadingQuote}
                    isLoadingImage={isLoadingImage}
                    onUpdateEvent={updateActiveEvent}
                    onSave={handleSaveSettings}
                    onClose={() => setIsSettingsOpen(false)}
                    onDelete={handleDelete}
                  />
                )}
              </Animated.View>

            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  outer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 48,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.5,
    shadowRadius: 50,
    elevation: 20,
    backgroundColor: '#1a2a6c',
  },
  overlayImage: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayDefault: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decorCircle: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.07)',
    zIndex: 1,
  },
  loadingImageBadge: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 20,
  },
  loadingImageText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontFamily: 'Inter_700Bold',
  },
  credit: {
    position: 'absolute',
    bottom: 64,
    right: 16,
    zIndex: 20,
  },
  creditText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: 'Inter_300Light',
  },
  dots: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 8,
    zIndex: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    width: 16,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
});