import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faXmark, faShareNodes } from '@fortawesome/free-solid-svg-icons';

function App() {
  // --- 1. ÉTATS (STATES) ---
  const [targetDate, setTargetDate] = useState("2026-12-31");
  const [daysLeft, setDaysLeft] = useState(0);
  const [category, setCategory] = useState("voyage");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const quotes = {
    voyage: { text: "Le plus beau voyage, c'est celui qu'on n'a pas encore fait.", author: "Loïck Peyron" },
    examen: { text: "Le succès est la somme de petits efforts répétés jour après jour.", author: "Robert Collier" },
    mariage: { text: "Aimer, ce n'est pas se regarder l'un l'autre, c'est regarder ensemble dans la même direction.", author: "St-Exupéry" },
    rencard: { text: "Le bonheur est la seule chose qui se double si on le partage.", author: "Albert Schweitzer" },
    perdre_du_poids: { text: "La motivation vous fait débuter, l'habitude vous fait continuer.", author: "Jim Ryun" }
  };

  // --- 2. LOGIQUE AMÉLIORÉE (Grâce à tes retours !) ---
  useEffect(() => {
    const calculate = () => {
      // Correction du décalage UTC : On parse manuellement
      const [y, m, d] = targetDate.split('-').map(Number);
      const target = new Date(y, m - 1, d);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0); // On se base sur le début de journée locale

      const diff = target.getTime() - today.getTime();
      const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      
      setDaysLeft(days);
    };

    calculate();
    
    // Mise à jour chaque minute pour éviter que le compteur stagne
    const id = setInterval(calculate, 60000);
    return () => clearInterval(id);
  }, [targetDate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2a6c] via-[#b21f1f] to-[#fdbb2d] flex items-center justify-center p-6 font-sans">
      
      {/* WIDGET PRINCIPAL */}
      <div className="relative w-full max-w-sm h-[520px] overflow-hidden rounded-[3rem] bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] text-white">
        
        {/* Effet de reflet "Liquid Glass" */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

        {!isSettingsOpen ? (
          /* --- VUE AFFICHAGE --- */
          <div className="p-10 h-full flex flex-col justify-between items-center text-center">
            
            <div className="w-full flex justify-end">
              <button onClick={() => setIsSettingsOpen(true)} className="p-3 hover:bg-white/10 rounded-full transition-colors">
                <FontAwesomeIcon icon={faGear} className="text-xl opacity-70" />
              </button>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-8xl font-black tracking-tighter drop-shadow-2xl">
                {daysLeft}
              </span>
              <span className="text-xs uppercase tracking-[0.5em] font-bold opacity-50 mt-2">
                Jours restants
              </span>
            </div>

            <div className="w-full bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-inner">
              <p className="text-lg italic font-light leading-snug">
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
          <div className="p-10 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-bold tracking-tight">Réglages</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full">
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="space-y-8">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-black tracking-widest opacity-40 ml-1">Événement le :</label>
                <input 
                  type="date" 
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="bg-white/10 border border-white/20 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-white/50 transition"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-black tracking-widest opacity-40 ml-1">Type d'objectif :</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-white/10 border border-white/20 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-white/50 transition appearance-none cursor-pointer"
                >
                  <option value="voyage" className="bg-gray-800">✈️ Voyage</option>
                  <option value="examen" className="bg-gray-800">📚 Examens</option>
                  <option value="mariage" className="bg-gray-800">💍 Mariage</option>
                  <option value="rencard" className="bg-gray-800">❤️ Rencard</option>
                  <option value="perdre_du_poids" className="bg-gray-800">💪 Forme physique</option>
                </select>
              </div>
            </div>

            <button 
              onClick={() => setIsSettingsOpen(false)}
              className="mt-auto w-full py-4 bg-white/20 border border-white/30 text-white font-bold rounded-2xl hover:bg-white/30 transition shadow-lg"
            >
              Terminer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;