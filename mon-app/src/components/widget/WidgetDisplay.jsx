import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faPlus, faImage, faRotate, faShareNodes } from '@fortawesome/free-solid-svg-icons';
import Spinner from '../Spinner';
import Tooltip from '../Tooltip';

export default function WidgetDisplay({
  activeEvent, daysLeft, currentFont,
  isLoadingQuote, quoteError, isLoadingImage,
  isSharing, shareError,
  onAddEvent, onOpenSettings, onRefreshImage, onRefreshQuote, onShare,
}) {
  return (
    <div className="relative z-10 px-8 pt-6 pb-6 flex flex-col gap-3 items-center text-center" style={{ height: '647px' }}>
      {/* Header */}
      <div className="w-full flex justify-between items-center flex-shrink-0">
        <Tooltip label="Ajouter un événement">
          <button title="Ajouter un événement" onClick={onAddEvent} className="p-3 hover:bg-white/10 rounded-full transition-colors">
            <FontAwesomeIcon icon={faPlus} className="text-xl opacity-70" />
          </button>
        </Tooltip>
        <div className="flex items-center gap-1">
          <Tooltip label="Changer l'image">
            <button title="Changer l'image" onClick={onRefreshImage} disabled={isLoadingImage || !activeEvent.theme}
              className="p-3 hover:bg-white/10 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              <FontAwesomeIcon icon={faImage} className={`text-xl opacity-70 ${isLoadingImage ? 'animate-pulse' : ''}`} />
            </button>
          </Tooltip>
          <Tooltip label="Paramètres">
            <button title="Paramètres" onClick={onOpenSettings} className="p-3 hover:bg-white/10 rounded-full transition-colors">
              <FontAwesomeIcon icon={faGear} className="text-xl opacity-70" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Chiffre */}
      <div className="flex flex-col items-center flex-shrink-0">
        <span className="text-8xl drop-shadow-2xl" style={currentFont.numberStyle}>{daysLeft}</span>
        <span className="text-xs uppercase tracking-[0.5em] opacity-50 mt-2" style={currentFont.labelStyle}>Jours restants</span>
        {(activeEvent.eventName || activeEvent.theme) && (
          <span className="mt-1 text-xs opacity-40 italic">— {activeEvent.eventName || activeEvent.theme}</span>
        )}
      </div>

      {/* Citation */}
      <div className="w-full bg-black/20 backdrop-blur-md px-5 py-4 rounded-[2rem] border border-white/10 shadow-inner flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
          {isLoadingQuote ? (
            <div className="flex items-center justify-center gap-2 opacity-50 h-full">
              <Spinner />
              <span className="text-sm">Génération en cours...</span>
            </div>
          ) : quoteError ? (
            <p className="text-sm text-red-300 italic">{quoteError}</p>
          ) : (
            <>
              <p className="text-lg leading-snug" style={currentFont.quoteStyle}>"{activeEvent.quote?.text}"</p>
              {activeEvent.quote?.author && (
                <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">— {activeEvent.quote.author}</p>
              )}
            </>
          )}
        </div>
        <Tooltip label="Générer une nouvelle citation">
          <button title="Générer une nouvelle citation" onClick={onRefreshQuote} disabled={isLoadingQuote}
            className="mt-3 flex items-center gap-1 text-[10px] uppercase tracking-widest opacity-40 hover:opacity-80 transition mx-auto disabled:cursor-not-allowed">
            <FontAwesomeIcon icon={faRotate} className={isLoadingQuote ? 'animate-spin' : ''} />
            Nouvelle citation
          </button>
        </Tooltip>
      </div>

      {/* Partager */}
      <div className="w-full flex flex-col items-center gap-2 flex-shrink-0">
        <button title="Partager le moment" onClick={onShare} disabled={isSharing}
          className="w-full py-3 bg-white text-gray-900 font-bold rounded-2xl flex items-center justify-center gap-3 hover:scale-105 transition shadow-xl disabled:opacity-60 disabled:cursor-not-allowed">
          {isSharing
            ? <><Spinner dark />Capture en cours...</>
            : <><FontAwesomeIcon icon={faShareNodes} /> Partager le moment</>}
        </button>
        {shareError && <p className="text-[10px] text-red-300 opacity-80">{shareError}</p>}
      </div>
    </div>
  );
}
