export default function WelcomeScreen({ onStart, visible }) {
  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center p-10 text-center transition-opacity duration-700"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-black/60 to-amber-900/80 backdrop-blur-xl rounded-[3rem]" />
      <div className="relative z-10 flex flex-col items-center gap-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white">Bienvenue</h1>
          <p className="mt-4 text-sm text-white/55 leading-relaxed max-w-[220px]">
            Crée ton compte à rebours, laisse-toi inspirer par une citation générée pour toi, et partage le moment avec tes proches.
          </p>
        </div>
        <p className="text-[11px] text-white/30 leading-relaxed">
          Survole les boutons pour découvrir leurs actions.
        </p>
        <button
          onClick={onStart}
          className="w-full py-4 bg-white text-gray-900 font-bold rounded-2xl hover:scale-105 transition shadow-xl"
        >
          Commencer →
        </button>
      </div>
    </div>
  );
}
