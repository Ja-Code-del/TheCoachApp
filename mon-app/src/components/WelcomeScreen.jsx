import React from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faBullseye, faWandMagicSparkles, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

const STEP_ICONS = [faBullseye, faWandMagicSparkles, faPaperPlane];
const STEP_KEYS = ['welcome.step1', 'welcome.step2', 'welcome.step3'];

export default function WelcomeScreen({ onStart, visible }) {
  const { t } = useTranslation();

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-10 text-center transition-opacity duration-700"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none' }}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-black/60 to-amber-900/80 backdrop-blur-xl rounded-[3rem]" />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <FontAwesomeIcon icon={faGear} className="text-white/60 text-lg" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">{t('welcome.title')}</h1>
          <p className="mt-2 text-sm text-white/50 leading-relaxed">{t('welcome.subtitle').split('\n').map((line, i) => <React.Fragment key={i}>{i > 0 && <br />}{line}</React.Fragment>)}</p>
        </div>
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-left space-y-4">
          <p className="text-[11px] text-white/40 uppercase tracking-widest font-bold">{t('welcome.howItWorks')}</p>
          {STEP_KEYS.map((key, i) => (
            <div key={key} className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={STEP_ICONS[i]} className="text-white/70 text-sm" />
              </div>
              <p className="text-sm text-white/70">{t(key)}</p>
            </div>
          ))}
        </div>
        <button onClick={onStart} className="w-full py-4 bg-white text-gray-900 font-bold rounded-2xl hover:scale-105 transition shadow-xl">
          {t('welcome.start')}
        </button>
      </div>
    </div>
  );
}