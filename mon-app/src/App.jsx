import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faXmark, faShareNodes, faRotate } from '@fortawesome/free-solid-svg-icons';

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

// --- APPEL UNSPLASH ---
async function fetchUnsplashImage(theme) {
  const key = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  const res = await fetch(
    `https://api.unsplash.com/photos/random?query=${encodeURIComponent(theme)}&orientation=portrait&client_id=${key}`
  );
  if (!res.ok) throw new Error('Unsplash error');
  const data = await res.json();
  return {
    url: data.urls.regular,
    photographer: data.user.name,
    photographerUrl: data.user.links.html,
  };
}

// --- APPEL CHATGPT ---
async function fetchAIQuote(theme, daysLeft) {
const key = import.meta.env.VITE_OPENAI_API_KEY;
const urgency =
daysLeft <= 7 ? "urgente et intense" :
daysLeft <= 30 ? "motivante et proche" :
"patiente et inspirante";

const res = await fetch('https://api.openai.com/v1/chat/completions', {
method: 'POST',
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${key}`,
},
body: JSON.stringify({
  model: 'gpt-4o-mini',
  max_tokens: 120,
  response_format: { type: "json_object" }, // Sécurité supplémentaire
  messages: [
    {
      role: 'system',
      content: `Tu es un assistant qui génère des citations courtes au format JSON. 
      Structure : {"text": "...", "author": "..."}`
    },
    {
      role: 'user',
      content: `Thème : "${theme}". Jours restants : ${daysLeft}. Tonalité : ${urgency}.`
    },
  ],
}),
});

if (!res.ok) throw new Error('OpenAI API error');
const data = await res.json();
const raw = data.choices[0].message.content; // C'est une chaîne de caractères type '{"text": "...", "author": "..."}'
return JSON.parse(raw); // On transforme la chaîne en objet JavaScript pur
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || "voyage en Islande");
  const [targetDate, setTargetDate] = useState(() => localStorage.getItem('targetDate') || "2026-12-31");
  const [selectedFontId, setSelectedFontId] = useState(() => localStorage.getItem('fontId') || 'inter');
  
  const [daysLeft, setDaysLeft] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);

  // États citation
  const [quote, setQuote] = useState(() => JSON.parse(localStorage.getItem('quote')) || { text: "Entrez un thème pour générer votre citation...", author: "" });
  const [quoteError, setQuoteError] = useState(null);

  // États image
  const [bgImage, setBgImage] = useState(() => localStorage.getItem('bgImage') || null);
  const [photographer, setPhotographer] = useState(() => JSON.parse(localStorage.getItem('photographer')) || null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  const currentFont = FONTS.find(f => f.id === selectedFontId) || FONTS[0];

  // -- Ecouter les changements pour sauvegarder dans localStorage ---
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
      setQuoteError("Impossible de générer la citation.");
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
      setBgImage(null);
      setPhotographer(null);
    } finally {
      setIsLoadingImage(false);
    }
  }, [theme]);

  // --- Sauvegarde réglages : déclenche les deux appels ---
  const handleSaveSettings = async () => {
    setIsSettingsOpen(false);
    await Promise.all([generateQuote(), loadImage()]);
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;700;900&family=Lora:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,900;1,400&family=Space+Grotesk:wght@300;500;700&display=swap"
      />

      <div className="min-h-screen bg-gradient-to-br from-[#1a2a6c] via-[#b21f1f] to-[#fdbb2d] flex items-center justify-center p-6 font-sans">
        <div
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

          {/* Crédit Unsplash — obligatoire selon les CGU */}
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
                {/* Bouton nouvelle citation manuelle */}
                <button
                  onClick={generateQuote}
                  disabled={isLoadingQuote}
                  className="mt-4 flex items-center gap-1 text-[10px] uppercase tracking-widest opacity-40 hover:opacity-80 transition mx-auto disabled:cursor-not-allowed"
                >
                  <FontAwesomeIcon icon={faRotate} className={isLoadingQuote ? 'animate-spin' : ''} />
                  Nouvelle citation
                </button>
              </div>

              <button className="w-full py-4 bg-white text-gray-900 font-bold rounded-2xl flex items-center justify-center gap-3 hover:scale-105 transition shadow-xl">
                <FontAwesomeIcon icon={faShareNodes} /> Partager le moment
              </button>
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
                {/* Thème libre */}
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

                {/* Date */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-black tracking-widest opacity-40 ml-1">Événement le :</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="bg-white/10 border border-white/20 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-white/50 transition text-white"
                  />
                </div>

                {/* Police */}
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
