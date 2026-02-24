import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShareNodes } from '@fortawesome/free-solid-svg-icons';
import ConfettiAnimation from './ConfettiAnimation';
import Spinner from './Spinner';

export default function JourJScreen({ eventName, theme, onShare, isSharing }) {
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
            ? <><Spinner dark />Capture en cours...</>
            : <><FontAwesomeIcon icon={faShareNodes} /> Immortaliser ce moment</>}
        </button>
      </div>
    </div>
  );
}