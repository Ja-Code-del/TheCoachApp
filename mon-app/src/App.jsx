import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faExpand, faShareNodes } from '@fortawesome/free-solid-svg-icons';

function App() {
  // --- 1. LES ÉTATS (La mémoire de l'app) ---
  const [targetDate, setTargetDate] = useState("2026-12-31");
  const [daysLeft, setDaysLeft] = useState(0);
  const [category, setCategory] = useState("voyage"); // Par défaut

  // Une petite base de citations pour commencer
  const quotes = {
    voyage: { text: "Le plus beau voyage, c'est celui qu'on n'a pas encore fait.", author: "Loïck Peyron" },
    examen: { text: "Le succès est la somme de petits efforts répétés jour après jour.", author: "Robert Collier" },
    mariage: { text: "Aimer, ce n'est pas se regarder l'un l'autre, c'est regarder ensemble dans la même direction.", author: "St-Exupéry" }
  };

  // --- 2. LA LOGIQUE DU COMPTE À REBOURS ---
  useEffect(() => {
    const calculate = () => {
      const diff = +new Date(targetDate) - +new Date();
      setDaysLeft(Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))));
    };
    calculate();
    const timer = setInterval(calculate, 60000); // Mise à jour toutes les minutes
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    // Fond dégradé dynamique
    <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-700 flex flex-col items-center justify-center p-6 font-sans">
      
      {/* --- LE WIDGET LIQUID GLASS --- */}
      <div className="relative w-full max-w-sm p-8 rounded-[2.5rem] bg-white/10 backdrop-blur-2xl border border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.2)] text-white overflow-hidden">
        
        {/* Reflet de lumière (Effet Apple Liquid Glass) */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/20 rounded-full blur-3xl"></div>

        {/* Barre d'outils haute */}
        <div className="flex justify-between items-center mb-10 relative z-10">
          <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
            <FontAwesomeIcon icon={faExpand} className="text-sm opacity-80" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
            <FontAwesomeIcon icon={faGear} className="text-sm opacity-80" />
          </button>
        </div>

        {/* Affichage des jours */}
        <div className="text-center space-y-2 relative z-10">
          <div className="text-7xl font-extrabold tracking-tighter drop-shadow-md">
            {daysLeft}
          </div>
          <div className="text-sm uppercase tracking-[0.3em] font-medium opacity-70">
            Jours restants
          </div>
        </div>

        {/* Citation du jour */}
        <div className="mt-12 p-5 rounded-2xl bg-black/5 border border-white/10 relative z-10">
          <p className="text-lg leading-snug italic font-light">
            "{quotes[category].text}"
          </p>
          <p className="mt-3 text-xs font-bold uppercase tracking-widest opacity-50">
            — {quotes[category].author}
          </p>
        </div>

        {/* Bouton de partage */}
        <button className="mt-8 w-full py-4 bg-white text-blue-900 font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-opacity-90 transition transform active:scale-95 shadow-xl">
          <FontAwesomeIcon icon={faShareNodes} />
          Partager l'image
        </button>
      </div>

      {/* Petit message d'aide temporaire */}
      <p className="mt-8 text-white/40 text-sm italic font-light">
        Astuce : Change la variable "category" dans le code pour voir les autres citations.
      </p>
    </div>
  );
}

export default App;