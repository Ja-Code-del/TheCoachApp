import { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, Animated, ImageBackground, TouchableOpacity,
  ActivityIndicator, Linking, StyleSheet, useWindowDimensions, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
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
import { useThermalGradient } from './hooks/useThermalGradient';
import { useNotifications, scheduleEventReminders, cancelEventNotifications } from './hooks/useNotifications';
import WelcomeScreen from './components/WelcomeScreen';
import JourJScreen from './components/JourJScreen';
import ShareCard from './components/ShareCard';
import ShareCardMemoir from './components/ShareCardMemoir';
import MemoirScreen from './components/MemoirScreen';
import MemoirEditor from './components/MemoirEditor';
import MemoirWelcomeScreen from './components/MemoirWelcomeScreen';
import WidgetDisplay from './components/widget/WidgetDisplay';
import WidgetSettings from './components/widget/WidgetSettings';
import { FONTS } from './constants/fonts';
import { calcDaysLeft, calcTimeLeft, isMemoir, DEFAULT_EVENT } from './lib/utils';

// --- TOGGLE MODE ---
function ModeToggle({ mode, onSwitch, light }) {
  const translateX = useRef(new Animated.Value(mode === 'countdown' ? 0 : 1)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: mode === 'countdown' ? 0 : 1,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [mode]);

  const pillTranslate = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 118],
  });

  const wrapperBg   = light ? 'rgba(0,0,0,0.07)'   : 'rgba(0,0,0,0.25)';
  const wrapperBorder = light ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.12)';
  const pillBg      = light ? 'rgba(0,0,0,0.09)'   : 'rgba(255,255,255,0.15)';
  const pillBorder  = light ? 'rgba(0,0,0,0.13)'   : 'rgba(255,255,255,0.25)';
  const labelColor  = light ? 'rgba(0,0,0,0.38)'   : 'rgba(255,255,255,0.4)';
  const labelActiveColor = light ? '#1a1a2e' : '#fff';

  return (
    <View style={[toggleStyles.wrapper, { backgroundColor: wrapperBg, borderColor: wrapperBorder }]}>
      <Animated.View style={[
        toggleStyles.pill,
        { backgroundColor: pillBg, borderColor: pillBorder, transform: [{ translateX: pillTranslate }] },
      ]} />
      <TouchableOpacity style={toggleStyles.tab} onPress={() => onSwitch('countdown')} activeOpacity={0.7}>
        <Text style={[toggleStyles.label, { color: mode === 'countdown' ? labelActiveColor : labelColor }]}>
          Événements
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={toggleStyles.tab} onPress={() => onSwitch('memoir')} activeOpacity={0.7}>
        <Text style={[toggleStyles.label, { color: mode === 'memoir' ? labelActiveColor : labelColor }]}>
          Souvenirs
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const toggleStyles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 2,
    marginBottom: 12,
    alignSelf: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    top: 2,
    width: 116,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
  },
  tab: {
    width: 118,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
});

// --- APP ---
export default function App() {
  const shareCardRef = useRef(null);
  const memoirCardRef = useRef(null);
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = Math.min(screenWidth - 48, 420);

  const [fontsLoaded] = useFonts({
    Inter_300Light, Inter_700Bold, Inter_900Black,
    BebasNeue_400Regular,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_400Regular_Italic,
    PlayfairDisplay_900Black,
    Lora_400Regular, Lora_400Regular_Italic, Lora_700Bold,
    SpaceGrotesk_300Light, SpaceGrotesk_500Medium, SpaceGrotesk_700Bold,
  });

  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isNewEvent, setIsNewEvent] = useState(false);
  const [mode, setMode] = useState('countdown'); // 'countdown' | 'memoir'
  const [isMemoirEditing, setIsMemoirEditing] = useState(false);
  const [memoirTheme, setMemoirTheme] = useState('light'); // 'light' | 'dark'

  useEffect(() => {
    AsyncStorage.getItem('hasLaunched').then(value => {
      const firstLaunch = !value;
      setIsFirstLaunch(firstLaunch);
      setWelcomeVisible(firstLaunch);
    });
    AsyncStorage.getItem('memoirTheme').then(v => {
      if (v === 'light' || v === 'dark') setMemoirTheme(v);
    });
  }, []);

  const toggleMemoirTheme = () => {
    const next = memoirTheme === 'light' ? 'dark' : 'light';
    setMemoirTheme(next);
    AsyncStorage.setItem('memoirTheme', next);
  };

  const memoirIsDark = memoirTheme === 'dark';

  const {
    events, setEvents, activeIndex, setActiveIndex, activeEvent, isReady,
    updateActiveEvent, updateEventById, appendEvent, deleteActiveEvent,
  } = useEvents();

  useNotifications(events);

  const { switchTo, fadeVisible, handleTouchStart, handleTouchEnd } = useCarousel(
    events.length, activeIndex, setActiveIndex
  );

  const {
    generateQuote, loadImage,
    isLoadingQuote, isLoadingImage,
    quoteError, resetQuoteError,
  } = useMediaGeneration(activeEvent, updateEventById);

  const currentFont = useMemo(
    () => FONTS.find(f => f.id === activeEvent.fontId) || FONTS[0],
    [activeEvent.fontId]
  );

  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(activeEvent.targetDate));

  useEffect(() => {
    setTimeLeft(calcTimeLeft(activeEvent.targetDate));
  }, [activeEvent.targetDate]);

  useEffect(() => {
    if (!timeLeft.isPrecise) return;
    const interval = setInterval(() => {
      setTimeLeft(calcTimeLeft(activeEvent.targetDate));
    }, 60000);
    return () => clearInterval(interval);
  }, [timeLeft.isPrecise, activeEvent.targetDate]);

  const daysLeft = timeLeft.days;

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const isJourJ = daysLeft === 0 && !!activeEvent.theme && activeEvent.targetDate === todayStr;

  // --- Events filtrés par mode ---
  const countdownEvents = useMemo(
    () => events.filter(e => !isMemoir(e)),
    [events, todayStr]
  );
  const memoirEvents = useMemo(
    () => events.filter(e => isMemoir(e)),
    [events, todayStr]
  );

  // Index actif dans chaque liste
  const activeMemoirIndex = useMemo(() => {
    if (memoirEvents.length === 0) return 0;
    const idx = memoirEvents.findIndex(e => e.id === activeEvent.id);
    return idx >= 0 ? idx : memoirEvents.length - 1; // dernier par défaut
  }, [memoirEvents, activeEvent.id]);

  const activeMemoirEvent = memoirEvents[activeMemoirIndex] || memoirEvents[memoirEvents.length - 1];

  // --- Gradient thermique (countdown uniquement) ---
  const percentage = useMemo(() => {
    const total = activeEvent.totalDays;
    if (!total || total <= 0) return 100;
    return Math.max(0, Math.min(100, Math.round((daysLeft / total) * 100)));
  }, [daysLeft, activeEvent.totalDays]);

  const { bgColors, cardColors } = useThermalGradient(percentage);

  const { handleShare, isSharing, shareError, saveSuccess } = useShare(
    shareCardRef, activeEvent, daysLeft, isJourJ
  );

  // Share souvenir
  const { handleShare: handleShareMemoir, isSharing: isSharingMemoir } = useShare(
    memoirCardRef, activeMemoirEvent, 0, false
  );

  // --- Fade carousel ---
  useEffect(() => {
    const shouldShow = isFirstLaunch === false && !isJourJ && mode === 'countdown';
    Animated.timing(contentOpacity, {
      toValue: (shouldShow && fadeVisible) ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeVisible, isFirstLaunch, isJourJ, mode]);

  useEffect(() => { resetQuoteError(); }, [activeIndex, resetQuoteError]);
  useEffect(() => { if (!isSettingsOpen) setConfirmDelete(false); }, [isSettingsOpen]);

  // Basculement de mode : pointe vers le premier event du mode cible
  const handleSwitchMode = (newMode) => {
    if (newMode === 'memoir' && memoirEvents.length > 0) {
      const globalIdx = events.findIndex(e => e.id === memoirEvents[0].id);
      if (globalIdx >= 0) setActiveIndex(globalIdx);
    } else if (newMode === 'countdown' && countdownEvents.length > 0) {
      const globalIdx = events.findIndex(e => e.id === countdownEvents[0].id);
      if (globalIdx >= 0) setActiveIndex(globalIdx);
    }
    setMode(newMode);
  };

  const addEvent = () => {
    const newEvent = DEFAULT_EVENT();
    setEvents(prev => {
      const newIndex = prev.length;
      setTimeout(() => {
        switchTo(newIndex);
        setIsSettingsOpen(true);
        setIsNewEvent(true);
      }, 50);
      return [...prev, newEvent];
    });
  };

  const handleCloseSettings = () => {
    if (isNewEvent) {
      Alert.alert(
        'Abandonner la création ?',
        'Cet événement ne sera pas sauvegardé.',
        [
          { text: 'Continuer la création', style: 'cancel' },
          {
            text: 'Abandonner',
            style: 'destructive',
            onPress: () => {
              setIsNewEvent(false);
              setIsSettingsOpen(false);
              deleteActiveEvent();
            },
          },
        ]
      );
    } else {
      setIsSettingsOpen(false);
    }
  };

  const handleSaveSettings = async () => {
    updateActiveEvent({ totalDays: calcDaysLeft(activeEvent.targetDate) });
    setIsNewEvent(false);
    setIsSettingsOpen(false);
    await Promise.all([generateQuote(), loadImage()]);
    scheduleEventReminders(activeEvent);
  };

  const handleStart = () => {
    setWelcomeVisible(false);
    setTimeout(() => {
      setIsFirstLaunch(false);
      AsyncStorage.setItem('hasLaunched', 'true');
      setIsSettingsOpen(true);
      setIsNewEvent(true);
    }, 700);
  };

  const handleDelete = () => {
    cancelEventNotifications(activeEvent.id);
    deleteActiveEvent();
    setConfirmDelete(false);
  };

  // Supprimer un souvenir
  const handleDeleteMemoir = () => {
    if (!activeMemoirEvent) return;
    Alert.alert(
      'Supprimer ce souvenir ?',
      'L\'événement et son souvenir seront supprimés définitivement.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            // Pointer activeIndex sur l'event concerné avant delete
            const globalIdx = events.findIndex(e => e.id === activeMemoirEvent.id);
            if (globalIdx >= 0) {
              setActiveIndex(globalIdx);
              setTimeout(() => deleteActiveEvent(), 50);
            }
          },
        },
      ]
    );
  };

  // Sauvegarder le souvenir édité
  const handleSaveMemoir = (patch) => {
    if (!activeMemoirEvent) return;
    updateEventById(activeMemoirEvent.id, patch);
  };

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
  const showToggle = !isFirstLaunch && (countdownEvents.length > 0 || memoirEvents.length > 0);

  return (
    <SafeAreaProvider>
      <LinearGradient
        colors={mode === 'memoir'
          ? (memoirIsDark ? ['#1a1a2e', '#16213e', '#0f3460'] : ['#ffffff', '#ffffff'])
          : bgColors}
        style={styles.root}
      >
        <SafeAreaView style={styles.safeArea}>
          <StatusBar style={mode === 'memoir' ? (memoirIsDark ? 'light' : 'dark') : 'light'} />

          {/* ShareCard countdown hors-écran */}
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

          {/* ShareCard souvenir hors-écran */}
          {activeMemoirEvent && (
            <ShareCardMemoir
              cardRef={memoirCardRef}
              event={activeMemoirEvent}
            />
          )}

          <View style={styles.outer}>

            {/* Toggle mode */}
            {showToggle && (
              <ModeToggle mode={mode} onSwitch={handleSwitchMode} light={mode === 'memoir' && !memoirIsDark} />
            )}

            {/* ——— MODE SOUVENIR ——— */}
            {mode === 'memoir' ? (
              <View style={[
                styles.card,
                styles.cardMemoir,
                { width: cardWidth },
                memoirIsDark && styles.cardMemoirDark,
              ]}>

                {/* Overlay sombre (thème dark uniquement) */}
                {memoirIsDark && (
                  <View style={[StyleSheet.absoluteFillObject, styles.overlayMemoirDark]} />
                )}

                {/* Bouton thème ☀️ / 🌙 */}
                {!isMemoirEditing && (
                  <TouchableOpacity
                    style={[styles.memoirThemeBtn, memoirIsDark && styles.memoirThemeBtnDark]}
                    onPress={toggleMemoirTheme}
                    activeOpacity={0.7}
                  >
                    <Feather
                      name={memoirIsDark ? 'sun' : 'moon'}
                      size={14}
                      color={memoirIsDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)'}
                    />
                  </TouchableOpacity>
                )}

                {memoirEvents.length === 0 ? (
                  /* Page de bienvenue */
                  <MemoirWelcomeScreen isDark={memoirIsDark} />
                ) : isMemoirEditing ? (
                  <MemoirEditor
                    event={activeMemoirEvent}
                    onSave={handleSaveMemoir}
                    onClose={() => setIsMemoirEditing(false)}
                    isDark={memoirIsDark}
                  />
                ) : (
                  <MemoirScreen
                    event={activeMemoirEvent}
                    onEdit={() => setIsMemoirEditing(true)}
                    onShare={handleShareMemoir}
                    onDelete={handleDeleteMemoir}
                    isSharing={isSharingMemoir}
                    isDark={memoirIsDark}
                  />
                )}

                {/* Dots pagination souvenirs */}
                {memoirEvents.length > 1 && !isMemoirEditing && (
                  <View style={styles.dots}>
                    {memoirEvents.map((e, i) => (
                      <TouchableOpacity
                        key={e.id}
                        onPress={() => {
                          const globalIdx = events.findIndex(ev => ev.id === e.id);
                          if (globalIdx >= 0) setActiveIndex(globalIdx);
                        }}
                        style={[
                          styles.dot,
                          { backgroundColor: memoirIsDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.18)' },
                          i === activeMemoirIndex && {
                            backgroundColor: memoirIsDark ? '#ffffff' : '#1a1a2e',
                            width: 16,
                          },
                        ]}
                      />
                    ))}
                  </View>
                )}
              </View>

            ) : (
              /* ——— MODE COUNTDOWN ——— */
              <View
                style={[styles.card, { width: cardWidth }]}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
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
                  <LinearGradient colors={cardColors} style={StyleSheet.absoluteFillObject} />
                )}

                <View style={styles.decorCircle} pointerEvents="none" />

                {isLoadingImage && !isFirstLaunch && !isJourJ && (
                  <View style={styles.loadingImageBadge} pointerEvents="none">
                    <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
                    <Text style={styles.loadingImageText}>Nouvelle image…</Text>
                  </View>
                )}

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

                {countdownEvents.length > 1 && !isSettingsOpen && !isFirstLaunch && (
                  <View style={styles.dots}>
                    {countdownEvents.map((e, i) => (
                      <TouchableOpacity
                        key={e.id}
                        onPress={() => {
                          const globalIdx = events.findIndex(ev => ev.id === e.id);
                          if (globalIdx >= 0) switchTo(globalIdx);
                        }}
                        style={[styles.dot, events[activeIndex]?.id === e.id && styles.dotActive]}
                      />
                    ))}
                  </View>
                )}

                {isFirstLaunch && (
                  <WelcomeScreen onStart={handleStart} visible={welcomeVisible} />
                )}

                {isJourJ && !isFirstLaunch && (
                  <JourJScreen
                    eventName={activeEvent.eventName}
                    theme={activeEvent.theme}
                    onShare={handleShare}
                    isSharing={isSharing}
                  />
                )}

                <Animated.View
                  style={{ opacity: contentOpacity }}
                  pointerEvents={contentPointerEvents}
                >
                  {!isSettingsOpen ? (
                    <WidgetDisplay
                      activeEvent={activeEvent}
                      daysLeft={daysLeft}
                      timeLeft={timeLeft}
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
                      onClose={handleCloseSettings}
                      onDelete={handleDelete}
                    />
                  )}
                </Animated.View>
              </View>
            )}

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
  root: { flex: 1 },
  safeArea: { flex: 1 },
  outer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  card: {
    borderRadius: 48,
    overflow: 'hidden',
    maxWidth: 420,
    minHeight: 480,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.5,
    shadowRadius: 50,
    elevation: 20,
    backgroundColor: '#0a0a2e',
  },
  cardMemoir: {
    backgroundColor: '#ffffff',
    borderColor: 'rgba(0,0,0,0.08)',
  },
  cardMemoirDark: {
    backgroundColor: '#0d1530',
    borderColor: 'rgba(255,255,255,0.12)',
  },
  overlayMemoirDark: {
    backgroundColor: 'rgba(10,15,40,0.55)',
  },
  memoirThemeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.09)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memoirThemeBtnDark: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.15)',
  },
  overlayImage: {
    backgroundColor: 'rgba(0,0,0,0.5)',
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
  emptyMemoir: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
    minHeight: 480,
  },
  emptyMemoirIcon: {
    fontSize: 40,
  },
  emptyMemoirTitle: {
    fontSize: 20,
    fontFamily: 'Inter_900Black',
    color: '#fff',
    textAlign: 'center',
  },
  emptyMemoirSub: {
    fontSize: 13,
    fontFamily: 'Inter_300Light',
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    lineHeight: 20,
  },
});