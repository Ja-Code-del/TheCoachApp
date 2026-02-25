import React, { useState, useEffect, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
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

function App() {
  const shareCardRef = useRef(null);

  const [isFirstLaunch, setIsFirstLaunch] = useState(() => !localStorage.getItem('hasLaunched'));
  const [welcomeVisible, setWelcomeVisible] = useState(() => !localStorage.getItem('hasLaunched'));
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { events, activeIndex, setActiveIndex, activeEvent, updateActiveEvent, updateEventById, appendEvent, deleteActiveEvent } = useEvents();
  const { switchTo, fadeVisible, handleTouchStart, handleTouchEnd } = useCarousel(events.length, activeIndex, setActiveIndex);
  const { generateQuote, loadImage, isLoadingQuote, isLoadingImage, quoteError, resetQuoteError } = useMediaGeneration(activeEvent, updateEventById);

  const currentFont = FONTS.find(f => f.id === activeEvent.fontId) || FONTS[0];
  const daysLeft = calcDaysLeft(activeEvent.targetDate);
  const todayStr = new Date().toISOString().split('T')[0];
  const isJourJ = daysLeft === 0 && !!activeEvent.theme && activeEvent.targetDate === todayStr;

  const { handleShare, isSharing, shareError } = useShare(shareCardRef, activeEvent, daysLeft, isJourJ);

  useEffect(() => { resetQuoteError(); }, [activeIndex, resetQuoteError]);
  useEffect(() => { if (!isSettingsOpen) setConfirmDelete(false); }, [isSettingsOpen]);

  const addEvent = () => {
    const newIndex = events.length;
    appendEvent(DEFAULT_EVENT());
    setTimeout(() => { switchTo(newIndex); setIsSettingsOpen(true); }, 50);
  };

  const handleSaveSettings = async () => {
    setIsSettingsOpen(false);
    await Promise.all([generateQuote(), loadImage()]);
  };

  const handleStart = () => {
    setWelcomeVisible(false);
    setTimeout(() => {
      setIsFirstLaunch(false);
      localStorage.setItem('hasLaunched', 'true');
      setIsSettingsOpen(true);
    }, 700);
  };

  const handleDelete = () => {
    deleteActiveEvent();
    setConfirmDelete(false);
  };

  return (
    <>
      <Analytics />

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

      <div className="min-h-screen bg-gradient-to-br from-[#1a2a6c] via-[#b21f1f] to-[#fdbb2d] flex items-center justify-center p-6 font-sans">
        <div className="flex flex-col items-center gap-4">
          <div
            className="relative w-[400px] h-[647px] overflow-hidden rounded-[3rem] border border-white/20 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] text-white transition-all duration-700"
            style={{
              backgroundImage: activeEvent.bgImage ? `url(${activeEvent.bgImage})` : undefined,
              backgroundSize: 'cover', backgroundPosition: 'center',
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Overlays */}
            <div className={`absolute inset-0 rounded-[3rem] transition-all duration-700 ${activeEvent.bgImage ? 'bg-black/50 backdrop-blur-[2px]' : 'bg-white/10 backdrop-blur-2xl'}`} />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            {/* Image loading indicator */}
            {isLoadingImage && !isFirstLaunch && !isJourJ && (
              <div className="absolute inset-0 z-20 rounded-[3rem] pointer-events-none flex items-end justify-center pb-20">
                <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span className="text-[10px] text-white/60 uppercase tracking-widest">Nouvelle image…</span>
                </div>
              </div>
            )}

            {/* Unsplash credit */}
            {activeEvent.photographer && !isFirstLaunch && !isJourJ && (
              <a href={`${activeEvent.photographer.url}?utm_source=countdown_app&utm_medium=referral`}
                target="_blank" rel="noopener noreferrer"
                className="absolute bottom-16 right-4 z-20 text-[9px] text-white/40 hover:text-white/70 transition">
                📷 {activeEvent.photographer.name} / Unsplash
              </a>
            )}

            {/* Pagination dots */}
            {events.length > 1 && !isSettingsOpen && !isFirstLaunch && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                {events.map((_, i) => (
                  <button key={i} onClick={() => switchTo(i)}
                    className={`rounded-full transition-all duration-300 ${i === activeIndex ? 'w-4 h-2 bg-white' : 'w-2 h-2 bg-white/40'}`}
                  />
                ))}
              </div>
            )}

            {/* Welcome screen */}
            {isFirstLaunch && <WelcomeScreen onStart={handleStart} visible={welcomeVisible} />}

            {/* Jour J */}
            {isJourJ && !isFirstLaunch && (
              <JourJScreen eventName={activeEvent.eventName} theme={activeEvent.theme} onShare={handleShare} isSharing={isSharing} />
            )}

            {/* Main content with fade */}
            <div className="transition-opacity duration-300" style={{ opacity: (isFirstLaunch || isJourJ) ? 0 : fadeVisible ? 1 : 0, pointerEvents: (isFirstLaunch || isJourJ) ? 'none' : 'auto' }}>
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
