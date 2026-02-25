import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FONTS } from '../../constants/fonts';
import Spinner from '../Spinner';

const getTomorrowStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

export default function WidgetSettings({
  activeEvent, eventsCount,
  confirmDelete, setConfirmDelete,
  isLoadingQuote, isLoadingImage,
  onUpdateEvent, onSave, onClose, onDelete,
}) {
  const [dateError, setDateError] = useState('');
  const minDate = getTomorrowStr();

  const handleSave = () => {
    if (!activeEvent.targetDate || activeEvent.targetDate <= new Date().toISOString().split('T')[0]) {
      setDateError('La date doit être dans le futur (à partir de demain).');
      return;
    }
    setDateError('');
    onSave();
  };

  return (
    <div className="relative z-10 p-8 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-y-auto overscroll-contain scrollbar-hide" style={{ height: '647px' }}>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Réglages</h2>
        <div className="flex items-center gap-2">
          {eventsCount > 1 && (
            !confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)}
                className="w-8 h-8 flex items-center justify-center bg-red-500/20 text-red-300 rounded-full hover:bg-red-500/30 transition">
                <FontAwesomeIcon icon={faTrash} className="text-xs" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1 text-xs bg-white/10 text-white/70 rounded-full hover:bg-white/20 transition">
                  Annuler
                </button>
                <button onClick={onDelete}
                  className="px-3 py-1 text-xs bg-red-500/40 text-red-200 rounded-full hover:bg-red-500/60 transition font-bold">
                  Supprimer
                </button>
              </div>
            )
          )}
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-black tracking-widest opacity-40 ml-1">Nom de l'événement :</label>
          <input type="text" value={activeEvent.eventName}
            onChange={(e) => onUpdateEvent({ eventName: e.target.value })}
            placeholder="ex: Mon mariage, Mon marathon..."
            className="bg-white/10 border border-white/20 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-white/50 transition text-white placeholder-white/30" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-black tracking-widest opacity-40 ml-1">Thème (pour l'IA) :</label>
          <input type="text" value={activeEvent.theme}
            onChange={(e) => onUpdateEvent({ theme: e.target.value })}
            placeholder="ex: mariage élégant, marathon sportif..."
            className="bg-white/10 border border-white/20 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-white/50 transition text-white placeholder-white/30" />
          <p className="text-[10px] opacity-30 ml-1">Utilisé pour générer l'image et la citation.</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-black tracking-widest opacity-40 ml-1">Événement le :</label>
          <input type="date" value={activeEvent.targetDate} min={minDate}
            onChange={(e) => { setDateError(''); onUpdateEvent({ targetDate: e.target.value }); }}
            className={`bg-white/10 border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-white/50 transition text-white ${dateError ? 'border-red-400/60' : 'border-white/20'}`} />
          {dateError && <p className="text-[10px] text-red-300 ml-1">{dateError}</p>}
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-[10px] uppercase font-black tracking-widest opacity-40 ml-1">Police :</label>
          <div className="grid grid-cols-1 gap-2">
            {FONTS.map((font) => (
              <button key={font.id} onClick={() => onUpdateEvent({ fontId: font.id })}
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

      <button onClick={handleSave} disabled={isLoadingQuote || isLoadingImage}
        className="mt-6 w-full py-4 bg-white/20 border border-white/30 text-white font-bold rounded-2xl hover:bg-white/30 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        {(isLoadingQuote || isLoadingImage)
          ? <><Spinner />Chargement...</>
          : 'Enregistrer'}
      </button>
    </div>
  );
}
