import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faXmark, faShareNodes, faRotate } from '@fortawesome/free-solid-svg-icons';
import html2canvas from 'html2canvas';

// --- CONFIGURATION DES POLICES ---
const FONTS = [
  {
    id: 'inter',
    name: 'Inter',
    label: 'Moderne',
    numberStyle: { fontFamily: "'Inter', sans-serif", fontWeight: 900 },
    labelStyle: { fontFamily: "'Inter', sans-serif", fontWeight: 700 },
    quoteStyle: { fontFamily: "'Inter', sans-serif", fontStyle: 'italic', fontWeight: 300 },
  },
  {
    id: 'bebas',
    name: 'Bebas Neue',
    label: 'Impact',
    numberStyle: { fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400 },
    labelStyle: { fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, letterSpacing: '0.3em' },
    quoteStyle: { fontFamily: "'Inter', sans-serif", fontStyle: 'italic', fontWeight: 300 },
  },
  {
    id: 'playfair',
    name: 'Playfair Display',
    label: 'Élégant',
    numberStyle: { fontFamily: "'Playfair Display', serif", fontWeight: 900 },
    labelStyle: { fontFamily: "'Playfair Display', serif", fontWeight: 400 },
    quoteStyle: { fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 400 },
  },
  {
    id: 'lora',
    name: 'Lora',
    label: 'Littéraire',
    numberStyle: { fontFamily: "'Lora', serif", fontWeight: 700 },
    labelStyle: { fontFamily: "'Lora', serif", fontWeight: 400 },
    quoteStyle: { fontFamily: "'Lora', serif", fontStyle: 'italic', fontWeight: 400 },
  },
  {
    id: 'space',
    name: 'Space Grotesk',
    label: 'Tech',
    numberStyle: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 },
    labelStyle: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 },
    quoteStyle: { fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'normal', fontWeight: 300 },
  },
];

// --- APPEL proxy Vercel pour UNSPLASH ---
async function fetchUnsplashImage(theme) {
  const res = await fetch(`/api/image?theme=${encodeURIComponent(theme)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Unsplash error');
  return {
    url: data.url,
    photographer: data.photographer,
    photographerUrl: data.photographerUrl,
  };
}

// --- APPEL proxy Vercel pour AI ---
async function fetchAIQuote(theme, daysLeft) {
  const res = await fetch('/api/quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ theme, daysLeft }),
  });
  const quote = await res.json();
  if (!res.ok) throw new Error(quote.error || 'AI error');
  if (!quote?.text) throw new Error('Format de citation invalide');
  return quote; // Le serveur renvoie directement l'objet {text, author}
}

function App() {
  const widgetRef = useRef(null); // Référence sur le widget pour html2canvas

  const [targetDate, setTargetDate] = useState(() => localStorage.getItem('targetDate') || "2026-12-31");
  const [daysLeft, setDaysLeft] = useState(0);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || "voyage en Islande");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedFontId, setSelectedFontId] = useState(() => localStorage.getItem('fontId') || 'inter');

  // États citation
  const [quote, setQuote] = useState(() => JSON.parse(localStorage.getItem('quote')) || { text: "Entrez un thème pour générer votre citation...", author: "" });
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState(null);

  // États image
  const [bgImage, setBgImage] = useState(() => localStorage.getItem('bgImage') || null);
  const [photographer, setPhotographer] = useState(() => JSON.parse(localStorage.getItem('photographer')) || null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  // État partage
  const [shareError, setShareError] = useState(null);
  const [isSharing, setIsSharing] = useState(false);

  const currentFont = FONTS.find(f => f.id === selectedFontId) || FONTS[0];

  // --- Persistance localStorage ---
  useEffect(() => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('targetDate', targetDate);
    localStorage.setItem('fontId', selectedFontId);
    localStorage.setItem('quote', JSON.stringify(quote));
    localStorage.setItem('bgImage', bgImage || '');
    localStorage.setItem('photographer', JSON.stringify(photographer));
  }, [theme, targetDate, selectedFontId, quote, bgImage, photographer]);

  // --- Calcul des jours ---
  useEffect(() => {
    const calculate = () => {
      const [y, m, d] = targetDate.split('-').map(Number);
      const target = new Date(y, m - 1, d);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diff = target.getTime() - today.getTime();
      setDaysLeft(Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))));
    };
    calculate();
    const id = setInterval(calculate, 60000);
    return () => clearInterval(id);
  }, [targetDate]);

  // --- Génération citation ---
  const generateQuote = useCallback(async () => {
    if (!theme.trim()) return;
    setIsLoadingQuote(true);
    setQuoteError(null);
    try {
      const q = await fetchAIQuote(theme, daysLeft);
      setQuote(q);
    } catch (e) {
      console.error('Erreur citation:', e);
      setQuoteError(e.message || "Impossible de générer la citation.");
    } finally {
      setIsLoadingQuote(false);
    }
  }, [theme, daysLeft]);

  // --- Chargement image ---
  const loadImage = useCallback(async () => {
    if (!theme.trim()) return;
    setIsLoadingImage(true);
    try {
      const img = await fetchUnsplashImage(theme);
      setBgImage(img.url);
      setPhotographer({ name: img.photographer, url: img.photographerUrl });
    } catch (e) {
      console.error('Erreur image:', e);
      setBgImage(null);
      setPhotographer(null);
    } finally {
      setIsLoadingImage(false);
    }
  }, [theme]);

  // --- Sauvegarde réglages ---
  const handleSaveSettings = async () => {
    setIsSettingsOpen(false);
    await Promise.all([generateQuote(), loadImage()]);
  };

  // --- Partage ---
  const handleShare = async () => {
    if (!widgetRef.current) return;
    setIsSharing(true);
    setShareError(null);

    try {
      const canvas = await html2canvas(widgetRef.current, {
        useCORS: true,       // Nécessaire pour charger l'image Unsplash cross-origin
        scale: 2,            // Résolution x2 pour un rendu net sur mobile
        backgroundColor: null,
      });

      // Convertir le canvas en Blob (fichier image PNG)
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], 'countdown.png', { type: 'image/png' });

      // Vérifier si le navigateur supporte le partage de fichiers
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Plus que ${daysLeft} jours !`,
          text: `"${quote.text}" — ${quote.author}`,
        });
      } else {
        setShareError("Partage non supporté sur ce navigateur.");
      }
    } catch (e) {
      // L'utilisateur a annulé le partage — pas une vraie erreur
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
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;700;900&family=Lora:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,900;1,400&family=Space+Grotesk:wght@300;500;700&display=swap"
      />

      <div className="min-h-screen bg-gradient-to-br from-[#1a2a6c] via-[#b21f1f] to-[#fdbb2d] flex items-center justify-center p-6 font-sans">
        <div
          ref={widgetRef}
          className="relative w-full max-w-sm h-[520px] overflow-hidden rounded-[3rem] border border-white/20 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] text-white transition-all duration-700"
          style={{
            backgroundImage: bgImage ? `url(${bgImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Overlay lisibilité */}
          <div className={`absolute inset-0 rounded-[3rem] transition-all duration-700 ${bgImage ? 'bg-black/50 backdrop-blur-[2px]' : 'bg-white/10 backdrop-blur-2xl'}`} />

          {/* Liquid glass */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          {/* Crédit Unsplash */}
          {photographer && (
            <a
              href={`${photographer.url}?utm_source=countdown_app&utm_medium=referral`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-16 right-4 z-20 text-[9px] text-white/40 hover:text-white/70 transition"
            >
              📷 {photographer.name} / Unsplash
            </a>
          )}

          {!isSettingsOpen ? (
            /* --- VUE AFFICHAGE --- */
            <div className="relative z-10 p-10 h-full flex flex-col justify-between items-center text-center">
              <div className="w-full flex justify-end">
                <button onClick={() => setIsSettingsOpen(true)} className="p-3 hover:bg-white/10 rounded-full transition-colors">
                  <FontAwesomeIcon icon={faGear} className="text-xl opacity-70" />
                </button>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-8xl drop-shadow-2xl" style={currentFont.numberStyle}>
                  {daysLeft}
                </span>
                <span className="text-xs uppercase tracking-[0.5em] opacity-50 mt-2" style={currentFont.labelStyle}>
                  Jours restants
                </span>
                {theme && (
                  <span className="mt-2 text-xs opacity-40 italic">— {theme}</span>
                )}
              </div>

              {/* Bloc citation */}
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
                    <p className="text-lg leading-snug" style={currentFont.quoteStyle}>
                      "{quote.text}"
                    </p>
                    {quote.author && (
                      <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">
                        — {quote.author}
                      </p>
                    )}
                  </>
                )}
                <button
                  onClick={generateQuote}
                  disabled={isLoadingQuote}
                  className="mt-4 flex items-center gap-1 text-[10px] uppercase tracking-widest opacity-40 hover:opacity-80 transition mx-auto disabled:cursor-not-allowed"
                >
                  <FontAwesomeIcon icon={faRotate} className={isLoadingQuote ? 'animate-spin' : ''} />
                  Nouvelle citation
                </button>
              </div>

              {/* Bouton partager */}
              <div className="w-full flex flex-col items-center gap-2">
                <button
                  onClick={handleShare}
                  disabled={isSharing}
                  className="w-full py-4 bg-white text-gray-900 font-bold rounded-2xl flex items-center justify-center gap-3 hover:scale-105 transition shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSharing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
                      Capture en cours...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faShareNodes} /> Partager le moment
                    </>
                  )}
                </button>
                {/* Message d'erreur partage */}
                {shareError && (
                  <p className="text-[10px] text-red-300 opacity-80">{shareError}</p>
                )}
              </div>
            </div>

          ) : (
            /* --- VUE RÉGLAGES --- */
            <div className="relative z-10 p-8 h-full flex flex-col overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold tracking-tight">Réglages</h2>
                <button onClick={() => setIsSettingsOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full">
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>

              <div className="space-y-7">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-black tracking-widest opacity-40 ml-1">Mon thème :</label>
                  <input
                    type="text"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="ex: marathon de Paris, mariage, voyage..."
                    className="bg-white/10 border border-white/20 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-white/50 transition text-white placeholder-white/30"
                  />
                  <p className="text-[10px] opacity-30 ml-1">Une image et une citation seront générées pour ce thème.</p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-black tracking-widest opacity-40 ml-1">Événement le :</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="bg-white/10 border border-white/20 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-white/50 transition text-white"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-[10px] uppercase font-black tracking-widest opacity-40 ml-1">Police :</label>
                  <div className="grid grid-cols-1 gap-2">
                    {FONTS.map((font) => (
                      <button
                        key={font.id}
                        onClick={() => setSelectedFontId(font.id)}
                        className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all ${
                          selectedFontId === font.id
                            ? 'bg-white/20 border-white/50 shadow-inner'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
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

              <button
                onClick={handleSaveSettings}
                disabled={isLoadingQuote || isLoadingImage}
                className="mt-6 w-full py-4 bg-white/20 border border-white/30 text-white font-bold rounded-2xl hover:bg-white/30 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {(isLoadingQuote || isLoadingImage) ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    Chargement...
                  </>
                ) : 'Enregistrer'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
