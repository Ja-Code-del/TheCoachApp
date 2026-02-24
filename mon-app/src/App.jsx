import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faXmark, faShareNodes, faRotate, faBullseye, faWandMagicSparkles, faPaperPlane, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import html2canvas from 'html2canvas';
import ShareCard from './ShareCard';
import { Analytics } from "@vercel/analytics/react";

// --- CONFIGURATION DES POLICES ---
const FONTS = [
  {
    id: 'inter', name: 'Inter', label: 'Moderne',
    numberStyle: { fontFamily: "'Inter', sans-serif", fontWeight: 900 },
    labelStyle: { fontFamily: "'Inter', sans-serif", fontWeight: 700 },
    quoteStyle: { fontFamily: "'Inter', sans-serif", fontStyle: 'italic', fontWeight: 300 },
  },
  {
    id: 'bebas', name: 'Bebas Neue', label: 'Impact',
    numberStyle: { fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400 },
    labelStyle: { fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, letterSpacing: '0.3em' },
    quoteStyle: { fontFamily: "'Inter', sans-serif", fontStyle: 'italic', fontWeight: 300 },
  },
  {
    id: 'playfair', name: 'Playfair Display', label: 'Élégant',
    numberStyle: { fontFamily: "'Playfair Display', serif", fontWeight: 900 },
    labelStyle: { fontFamily: "'Playfair Display', serif", fontWeight: 400 },
    quoteStyle: { fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 400 },
  },
  {
    id: 'lora', name: 'Lora', label: 'Littéraire',
    numberStyle: { fontFamily: "'Lora', serif", fontWeight: 700 },
    labelStyle: { fontFamily: "'Lora', serif", fontWeight: 400 },
    quoteStyle: { fontFamily: "'Lora', serif", fontStyle: 'italic', fontWeight: 400 },
  },
  {
    id: 'space', name: 'Space Grotesk', label: 'Tech',
    numberStyle: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 },
    labelStyle: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 },
    quoteStyle: { fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'normal', fontWeight: 300 },
  },
];

// --- UTILITAIRES ---
const generateId = () => `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const DEFAULT_EVENT = () => ({
  id: generateId(),
  eventName: '',
  theme: '',
  targetDate: '2026-12-31',
  fontId: 'inter',
  quote: { text: '', author: '' },
  bgImage: null,
  photographer: null,
});

const loadEvents = () => {
  try {
    const raw = localStorage.getItem('events');
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [DEFAULT_EVENT()];
};

const loadActiveIndex = () => {
  const i = parseInt(localStorage.getItem('activeIndex') || '0', 10);
  return isNaN(i) ? 0 : i;
};

// --- APPELS API ---
async function fetchUnsplashImage(theme) {
  const res = await fetch(`/api/image?theme=${encodeURIComponent(theme)}`);
  if (!res.ok) throw new Error('Image API error');
  return await res.json();
}

async function fetchAIQuote(theme, daysLeft) {
  const res = await fetch('/api/quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ theme, daysLeft }),
  });
  if (!res.ok) throw new Error('Quote API error');
  return await res.json();
}

// --- CALCUL DES JOURS ---
function calcDaysLeft(targetDate) {
  const [y, m, d] = targetDate.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((target - today) / (1000 * 60 * 60 * 24)));
}

// --- CONFETTIS ---
const CONFETTI_COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
function ConfettiAnimation() {
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: (i * 7.3 + 13) % 100,
    delay: (i * 0.15) % 2,
    duration: 2 + (i % 3) * 0.5,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 6 + (i % 4) * 3,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(560px) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {pieces.map((p) => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.x}%`, top: '-10px',
          width: p.size, height: p.size, backgroundColor: p.color,
          borderRadius: p.id % 3 === 0 ? '50%' : '2px',
          animation: `confettiFall ${p.duration}s ${p.delay}s infinite linear`,
        }} />
      ))}
    </div>
  );
}

// --- ÉCRAN JOUR J ---
function JourJScreen({ eventName, theme, onShare, isSharing }) {
  return (
    <div className="absolute inset-0 z-30 overflow-hidden rounded-[3rem]">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-amber-900" />
      <ConfettiAnimation />
      <div className="relative z-10 p-10 h-full flex flex-col justify-between items-center text-center text-white">
        <div className="text-xs uppercase tracking-[0.4em] opacity-50 font-bold">C'est le grand jour</div>
        <div className="flex flex-col items-center gap-4">
          <div className="text-8xl font-black drop-shadow-2xl" style={{ textShadow: '0 0 40px rgba(255,215,0,0.6)' }}>✦</div>
          <div className="text-4xl font-black tracking-tight">Jour J !</div>
          {(eventName || theme) && <div className="text-sm opacity-60 italic">— {eventName || theme}</div>}
        </div>
        <button onClick={onShare} disabled={isSharing}
          className="w-full py-4 bg-white text-gray-900 font-bold rounded-2xl flex items-center justify-center gap-3 hover:scale-105 transition shadow-xl disabled:opacity-60">
          {isSharing
            ? <><div className="w-4 h-4 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />Capture en cours...</>
            : <><FontAwesomeIcon icon={faShareNodes} /> Immortaliser ce moment</>}
        </button>
      </div>
    </div>
  );
}

// --- ÉCRAN DE BIENVENUE ---
function WelcomeScreen({ onStart, visible }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-10 text-center transition-opacity duration-700"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none' }}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-black/60 to-amber-900/80 backdrop-blur-xl rounded-[3rem]" />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <FontAwesomeIcon icon={faGear} className="text-white/60 text-lg" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Bienvenue</h1>
          <p className="mt-2 text-sm text-white/50 leading-relaxed">Ton compte à rebours personnel,<br />avec des citations qui t'inspirent chaque jour.</p>
        </div>
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-left space-y-4">
          <p className="text-[11px] text-white/40 uppercase tracking-widest font-bold">Comment ça marche</p>
          {[
            { icon: faBullseye, text: 'Choisis un thème et une date cible' },
            { icon: faWandMagicSparkles, text: 'Une citation et une image sont générées pour toi' },
            { icon: faPaperPlane, text: 'Partage le moment avec tes proches' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={icon} className="text-white/70 text-sm" />
              </div>
              <p className="text-sm text-white/70">{text}</p>
            </div>
          ))}
        </div>
        <button onClick={onStart} className="w-full py-4 bg-white text-gray-900 font-bold rounded-2xl hover:scale-105 transition shadow-xl">
          Commencer →
        </button>
      </div>
    </div>
  );
}

// =====================
// APP PRINCIPALE
// =====================
function App() {
  const shareCardRef = useRef(null);

  // --- Premier lancement ---
  const [isFirstLaunch, setIsFirstLaunch] = useState(() => !localStorage.getItem('hasLaunched'));
  const [welcomeVisible, setWelcomeVisible] = useState(() => !localStorage.getItem('hasLaunched'));

  // --- Événements ---
  const [events, setEvents] = useState(loadEvents);
  const [activeIndex, setActiveIndex] = useState(loadActiveIndex);
  const [fadeVisible, setFadeVisible] = useState(true); // Pour le fade du carousel

  // --- UI ---
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [quoteError, setQuoteError] = useState(null);
  const [shareError, setShareError] = useState(null);
  const [isSharing, setIsSharing] = useState(false);

  // --- Swipe ---
  const touchStartX = useRef(null);

  // Événement actif
  const activeEvent = events[activeIndex] || events[0];
  const currentFont = FONTS.find(f => f.id === activeEvent.fontId) || FONTS[0];
  const daysLeft = calcDaysLeft(activeEvent.targetDate);
  const isJourJ = daysLeft === 0 && !!activeEvent.theme;

  // --- Persistance ---
  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
    localStorage.setItem('activeIndex', String(activeIndex));
  }, [events, activeIndex]);

  // --- Mise à jour d'un champ de l'événement actif ---
  const updateActiveEvent = useCallback((patch) => {
    setEvents(prev => prev.map((e, i) => i === activeIndex ? { ...e, ...patch } : e));
  }, [activeIndex]);

  // --- Changement d'événement avec fade ---
  const switchTo = useCallback((index) => {
    if (index === activeIndex) return;
    setFadeVisible(false);
    setTimeout(() => {
      setActiveIndex(index);
      setQuoteError(null);
      setFadeVisible(true);
    }, 300);
  }, [activeIndex]);

  // --- Swipe handlers ---
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && activeIndex < events.length - 1) switchTo(activeIndex + 1);
      if (diff < 0 && activeIndex > 0) switchTo(activeIndex - 1);
    }
    touchStartX.current = null;
  };

  // --- Ajouter un événement ---
  const addEvent = () => {
    const newEvent = DEFAULT_EVENT();
    setEvents(prev => [...prev, newEvent]);
    setTimeout(() => {
      switchTo(events.length);
      setIsSettingsOpen(true);
    }, 50);
  };

  // --- Supprimer l'événement actif ---
  const deleteActiveEvent = () => {
    if (events.length === 1) return; // Toujours garder au moins un
    setEvents(prev => prev.filter((_, i) => i !== activeIndex));
    setActiveIndex(prev => Math.max(0, prev - 1));
  };

  // --- Génération citation ---
  const generateQuote = useCallback(async (eventOverride) => {
    const evt = eventOverride || activeEvent;
    if (!evt.theme.trim()) return;
    setIsLoadingQuote(true);
    setQuoteError(null);
    try {
      const days = calcDaysLeft(evt.targetDate);
      const q = await fetchAIQuote(evt.theme, days);
      setEvents(prev => prev.map((e, i) => i === activeIndex ? { ...e, quote: q } : e));
    } catch (e) {
      console.error('Erreur citation:', e);
      setQuoteError("Impossible de générer la citation.");
    } finally {
      setIsLoadingQuote(false);
    }
  }, [activeEvent, activeIndex]);

  // --- Chargement image ---
  const loadImage = useCallback(async (eventOverride) => {
    const evt = eventOverride || activeEvent;
    if (!evt.theme.trim()) return;
    setIsLoadingImage(true);
    try {
      const img = await fetchUnsplashImage(evt.theme);
      setEvents(prev => prev.map((e, i) => i === activeIndex
        ? { ...e, bgImage: img.url, photographer: { name: img.photographer, url: img.photographerUrl } }
        : e
      ));
    } catch (e) {
      setEvents(prev => prev.map((e, i) => i === activeIndex ? { ...e, bgImage: null, photographer: null } : e));
    } finally {
      setIsLoadingImage(false);
    }
  }, [activeEvent, activeIndex]);

  // --- Sauvegarde réglages ---
  const handleSaveSettings = async () => {
    setIsSettingsOpen(false);
    await Promise.all([generateQuote(), loadImage()]);
  };

  // --- Bienvenue → réglages ---
  const handleStart = () => {
    setWelcomeVisible(false);
    setTimeout(() => {
      setIsFirstLaunch(false);
      localStorage.setItem('hasLaunched', 'true');
      setIsSettingsOpen(true);
    }, 700);
  };

  // --- Partage ---
  const handleShare = async () => {
    if (!shareCardRef.current) return;
    setIsSharing(true);
    setShareError(null);
    try {
      await new Promise(r => setTimeout(r, 100));
      const canvas = await html2canvas(shareCardRef.current, { useCORS: true, scale: 2, backgroundColor: null, logging: false });
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92));
      const file = new File([blob], 'countdown.jpg', { type: 'image/jpeg' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: isJourJ ? `Jour J — ${activeEvent.eventName || activeEvent.theme}` : `Plus que ${daysLeft} jours — ${activeEvent.eventName || activeEvent.theme}`,
          text: `"${activeEvent.quote?.text}" — ${activeEvent.quote?.author}`,
        });
      } else {
        setShareError("Partage non supporté sur ce navigateur.");
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('Erreur partage:', e);
        setShareError("Partage non supporté sur ce navigateur.");
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;700;900&family=Lora:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,900;1,400&family=Space+Grotesk:wght@300;500;700&display=swap" />

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

          {/* WIDGET PRINCIPAL */}
          <div
            className="relative w-full max-w-sm h-[520px] overflow-hidden rounded-[3rem] border border-white/20 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] text-white transition-all duration-700"
            style={{
              backgroundImage: activeEvent.bgImage ? `url(${activeEvent.bgImage})` : undefined,
              backgroundSize: 'cover', backgroundPosition: 'center',
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Overlay */}
            <div className={`absolute inset-0 rounded-[3rem] transition-all duration-700 ${activeEvent.bgImage ? 'bg-black/50 backdrop-blur-[2px]' : 'bg-white/10 backdrop-blur-2xl'}`} />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            {/* Crédit Unsplash */}
            {activeEvent.photographer && !isFirstLaunch && !isJourJ && (
              <a href={`${activeEvent.photographer.url}?utm_source=countdown_app&utm_medium=referral`}
                target="_blank" rel="noopener noreferrer"
                className="absolute bottom-16 right-4 z-20 text-[9px] text-white/40 hover:text-white/70 transition">
                📷 {activeEvent.photographer.name} / Unsplash
              </a>
            )}

            {/* Dots pagination */}
            {events.length > 1 && !isSettingsOpen && !isFirstLaunch && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                {events.map((_, i) => (
                  <button key={i} onClick={() => switchTo(i)}
                    className={`rounded-full transition-all duration-300 ${i === activeIndex ? 'w-4 h-2 bg-white' : 'w-2 h-2 bg-white/40'}`}
                  />
                ))}
              </div>
            )}

            {/* Bienvenue */}
            {isFirstLaunch && <WelcomeScreen onStart={handleStart} visible={welcomeVisible} />}

            {/* Jour J */}
            {isJourJ && !isFirstLaunch && (
              <JourJScreen eventName={activeEvent.eventName} theme={activeEvent.theme} onShare={handleShare} isSharing={isSharing} />
            )}

            {/* Vue principale avec fade */}
            <div className="transition-opacity duration-300" style={{ opacity: (isFirstLaunch || isJourJ) ? 0 : fadeVisible ? 1 : 0, pointerEvents: (isFirstLaunch || isJourJ) ? 'none' : 'auto' }}>
              {!isSettingsOpen ? (
                /* --- VUE AFFICHAGE --- */
                <div className="relative z-10 p-10 h-full flex flex-col justify-between items-center text-center">
                  {/* Header : settings + add */}
                  <div className="w-full flex justify-between">
                    <button onClick={addEvent}
                      className="p-3 hover:bg-white/10 rounded-full transition-colors">
                      <FontAwesomeIcon icon={faPlus} className="text-xl opacity-70" />
                    </button>
                    <button onClick={() => setIsSettingsOpen(true)}
                      className="p-3 hover:bg-white/10 rounded-full transition-colors">
                      <FontAwesomeIcon icon={faGear} className="text-xl opacity-70" />
                    </button>
                  </div>

                  {/* Chiffre */}
                  <div className="flex flex-col items-center">
                    <span className="text-8xl drop-shadow-2xl" style={currentFont.numberStyle}>{daysLeft}</span>
                    <span className="text-xs uppercase tracking-[0.5em] opacity-50 mt-2" style={currentFont.labelStyle}>Jours restants</span>
                    {(activeEvent.eventName || activeEvent.theme) && (
                      <span className="mt-2 text-xs opacity-40 italic">— {activeEvent.eventName || activeEvent.theme}</span>
                    )}
                  </div>

                  {/* Citation */}
                  <div className="w-full bg-black/20 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-inner">
                    {isLoadingQuote ? (
                      <div className="flex items-center justify-center gap-2 opacity-50">
                        <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        <span className="text-sm">Génération en cours...</span>
                      </div>
                    ) : quoteError ? (
                      <p className="text-sm text-red-300 italic">{quoteError}</p>
                    ) : (
                      <>
                        <p className="text-lg leading-snug" style={currentFont.quoteStyle}>"{activeEvent.quote?.text}"</p>
                        {activeEvent.quote?.author && (
                          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">— {activeEvent.quote.author}</p>
                        )}
                      </>
                    )}
                    <button onClick={() => generateQuote()} disabled={isLoadingQuote}
                      className="mt-4 flex items-center gap-1 text-[10px] uppercase tracking-widest opacity-40 hover:opacity-80 transition mx-auto disabled:cursor-not-allowed">
                      <FontAwesomeIcon icon={faRotate} className={isLoadingQuote ? 'animate-spin' : ''} />
                      Nouvelle citation
                    </button>
                  </div>

                  {/* Partager */}
                  <div className="w-full flex flex-col items-center gap-2">
                    <button onClick={handleShare} disabled={isSharing}
                      className="w-full py-4 bg-white text-gray-900 font-bold rounded-2xl flex items-center justify-center gap-3 hover:scale-105 transition shadow-xl disabled:opacity-60 disabled:cursor-not-allowed">
                      {isSharing
                        ? <><div className="w-4 h-4 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />Capture en cours...</>
                        : <><FontAwesomeIcon icon={faShareNodes} /> Partager le moment</>}
                    </button>
                    {shareError && <p className="text-[10px] text-red-300 opacity-80">{shareError}</p>}
                  </div>
                </div>

              ) : (
                /* --- VUE RÉGLAGES --- */
                <div className="relative z-10 p-8 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300"
                  style={{ height: '520px', overflowY: 'auto', overscrollBehavior: 'contain' }}>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold tracking-tight">Réglages</h2>
                    <div className="flex items-center gap-2">
                      {events.length > 1 && (
                        <button onClick={deleteActiveEvent}
                          className="w-8 h-8 flex items-center justify-center bg-red-500/20 text-red-300 rounded-full hover:bg-red-500/30 transition">
                          <FontAwesomeIcon icon={faTrash} className="text-xs" />
                        </button>
                      )}
                      <button onClick={() => setIsSettingsOpen(false)}
                        className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full">
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Nom */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase font-black tracking-widest opacity-40 ml-1">Nom de l'événement :</label>
                      <input type="text" value={activeEvent.eventName}
                        onChange={(e) => updateActiveEvent({ eventName: e.target.value })}
                        placeholder="ex: Mon mariage, Mon marathon..."
                        className="bg-white/10 border border-white/20 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-white/50 transition text-white placeholder-white/30" />
                    </div>

                    {/* Thème */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase font-black tracking-widest opacity-40 ml-1">Thème (pour l'IA) :</label>
                      <input type="text" value={activeEvent.theme}
                        onChange={(e) => updateActiveEvent({ theme: e.target.value })}
                        placeholder="ex: mariage élégant, marathon sportif..."
                        className="bg-white/10 border border-white/20 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-white/50 transition text-white placeholder-white/30" />
                      <p className="text-[10px] opacity-30 ml-1">Utilisé pour générer l'image et la citation.</p>
                    </div>

                    {/* Date */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase font-black tracking-widest opacity-40 ml-1">Événement le :</label>
                      <input type="date" value={activeEvent.targetDate}
                        onChange={(e) => updateActiveEvent({ targetDate: e.target.value })}
                        className="bg-white/10 border border-white/20 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-white/50 transition text-white" />
                    </div>

                    {/* Police */}
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] uppercase font-black tracking-widest opacity-40 ml-1">Police :</label>
                      <div className="grid grid-cols-1 gap-2">
                        {FONTS.map((font) => (
                          <button key={font.id} onClick={() => updateActiveEvent({ fontId: font.id })}
                            className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all ${activeEvent.fontId === font.id ? 'bg-white/20 border-white/50 shadow-inner' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                            <div className="flex flex-col items-start">
                              <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold">{font.label}</span>
                              <span className="text-sm opacity-80" style={{ fontFamily: font.numberStyle.fontFamily }}>{font.name}</span>
                            </div>
                            <span className="text-3xl opacity-90" style={font.numberStyle}>42</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button onClick={handleSaveSettings} disabled={isLoadingQuote || isLoadingImage}
                    className="mt-6 w-full py-4 bg-white/20 border border-white/30 text-white font-bold rounded-2xl hover:bg-white/30 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {(isLoadingQuote || isLoadingImage)
                      ? <><div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />Chargement...</>
                      : 'Enregistrer'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;