import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faXmark, faShareNodes } from '@fortawesome/free-solid-svg-icons';

// --- CONFIGURATION DES POLICES ---
const FONTS = [
  {
    id: 'inter',
    name: 'Inter',
    label: 'Moderne',
    numberStyle: { fontFamily: "'Inter', sans-serif", fontWeight: 900 },
    labelStyle: { fontFamily: "'Inter', sans-serif", fontWeight: 700 },
    quoteStyle: { fontFamily: "'Inter', sans-serif", fontStyle: 'italic', fontWeight: 300 },
    preview: '42',
  },
  {
    id: 'bebas',
    name: 'Bebas Neue',
    label: 'Impact',
    numberStyle: { fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400 },
    labelStyle: { fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, letterSpacing: '0.3em' },
    quoteStyle: { fontFamily: "'Inter', sans-serif", fontStyle: 'italic', fontWeight: 300 },
    preview: '42',
  },
  {
    id: 'playfair',
    name: 'Playfair Display',
    label: 'Élégant',
    numberStyle: { fontFamily: "'Playfair Display', serif", fontWeight: 900 },
    labelStyle: { fontFamily: "'Playfair Display', serif", fontWeight: 400 },
    quoteStyle: { fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 400 },
    preview: '42',
  },
  {
    id: 'lora',
    name: 'Lora',
    label: 'Littéraire',
    numberStyle: { fontFamily: "'Lora', serif", fontWeight: 700 },
    labelStyle: { fontFamily: "'Lora', serif", fontWeight: 400 },
    quoteStyle: { fontFamily: "'Lora', serif", fontStyle: 'italic', fontWeight: 400 },
    preview: '42',
  },
  {
    id: 'space',
    name: 'Space Grotesk',
    label: 'Tech',
    numberStyle: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 },
    labelStyle: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 },
    quoteStyle: { fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'normal', fontWeight: 300 },
    preview: '42',
  },
];

function App() {
  const [targetDate, setTargetDate] = useState("2026-12-31");
  const [daysLeft, setDaysLeft] = useState(0);
  const [category, setCategory] = useState("voyage");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedFontId, setSelectedFontId] = useState('inter');

  const currentFont = FONTS.find(f => f.id === selectedFontId) || FONTS[0];

  const quotes = {
    voyage: { text: "Le plus beau voyage, c'est celui qu'on n'a pas encore fait.", author: "Loïck Peyron" },
    examen: { text: "Le succès est la somme de petits efforts répétés jour après jour.", author: "Robert Collier" },
    mariage: { text: "Aimer, ce n'est pas se regarder l'un l'autre, c'est regarder ensemble dans la même direction.", author: "St-Exupéry" },
    rencard: { text: "Le bonheur est la seule chose qui se double si on le partage.", author: "Albert Schweitzer" },
    perdre_du_poids: { text: "La motivation vous fait débuter, l'habitude vous fait continuer.", author: "Jim Ryun" }
  };

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

  return (
    <>
      {/* Chargement Google Fonts */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;700;900&family=Lora:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,900;1,400&family=Space+Grotesk:wght@300;500;700&display=swap"
      />

      <div className="min-h-screen bg-gradient-to-br from-[#1a2a6c] via-[#b21f1f] to-[#fdbb2d] flex items-center justify-center p-6 font-sans">
        <div className="relative w-full max-w-sm h-[520px] overflow-hidden rounded-[3rem] bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] text-white">

          {/* Effet liquid glass */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

          {!isSettingsOpen ? (
            /* --- VUE AFFICHAGE --- */
            <div className="p-10 h-full flex flex-col justify-between items-center text-center">
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
              </div>

              <div className="w-full bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-inner">
                <p className="text-lg leading-snug" style={currentFont.quoteStyle}>
                  "{quotes[category].text}"
                </p>
                <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">
                  — {quotes[category].author}
                </p>
              </div>

              <button className="w-full py-4 bg-white text-gray-900 font-bold rounded-2xl flex items-center justify-center gap-3 hover:scale-105 transition shadow-xl">
                <FontAwesomeIcon icon={faShareNodes} /> Partager le moment
              </button>
            </div>

          ) : (
            /* --- VUE RÉGLAGES --- */
            <div className="p-8 h-full flex flex-col overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold tracking-tight">Réglages</h2>
                <button onClick={() => setIsSettingsOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full">
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>

              <div className="space-y-7">
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

                {/* Catégorie */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-black tracking-widest opacity-40 ml-1">Type d'objectif :</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-white/10 border border-white/20 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-white/50 transition appearance-none cursor-pointer text-white"
                  >
                    <option value="voyage" className="bg-gray-800">✈️ Voyage</option>
                    <option value="examen" className="bg-gray-800">📚 Examens</option>
                    <option value="mariage" className="bg-gray-800">💍 Mariage</option>
                    <option value="rencard" className="bg-gray-800">❤️ Rencard</option>
                    <option value="perdre_du_poids" className="bg-gray-800">💪 Forme physique</option>
                  </select>
                </div>

                {/* Sélecteur de police */}
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
                        {/* Label + nom */}
                        <div className="flex flex-col items-start">
                          <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold">{font.label}</span>
                          <span className="text-sm opacity-80" style={{ fontFamily: font.numberStyle.fontFamily }}>{font.name}</span>
                        </div>
                        {/* Aperçu du chiffre */}
                        <span className="text-3xl opacity-90" style={font.numberStyle}>42</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsSettingsOpen(false)}
                className="mt-6 w-full py-4 bg-white/20 border border-white/30 text-white font-bold rounded-2xl hover:bg-white/30 transition shadow-lg"
              >
                Terminer
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;