import { t } from '../lib/i18n';

export const generateId = () => `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
export const seededRand = (i, offset = 0) => Math.abs(Math.sin(i * 127.1 + offset * 311.7));

export const DEFAULT_EVENT = () => ({
  id: generateId(),
  eventName: '',
  theme: '',
  targetDate: '2026-12-31',
  targetTime: null,         // "HH:MM" | null — null = compte jusqu'à 23:59:59
  fontId: 'inter',
  counterStyle: 'default',
  totalDays: null,
  quote: { text: '', author: '' },
  bgImage: null,
  photographer: null,
  memoir: { note: '', photos: [], createdAt: null },
  reminders: [],
});

// ── Jours calendaires restants (minuit→minuit, insensible à l'heure) ────────
export function calcDaysLeft(targetDate) {
  if (!targetDate || typeof targetDate !== 'string') return 0;
  const parts = targetDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return 0;
  const [y, m, d] = parts;
  const target = new Date(y, m - 1, d);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((target - today) / 86400000));
}

// ── Calcul principal ─────────────────────────────────────────────────────────
// Retourne : { days, hours, minutes, seconds, isPrecise, hasTime }
//
// Avec targetTime ("HH:MM") :
//   → compte jusqu'à la deadline exacte
//   → isPrecise = true quand < 24h (affiche h·min·sec)
//   → seconds incluses dans le retour
//
// Sans targetTime (null) :
//   → comportement original
//   → isPrecise = true le Jour J (compte jusqu'à 23:59:59)
//   → seconds = 0
export function calcTimeLeft(targetDate, targetTime = null) {
  const empty = { days: 0, hours: 0, minutes: 0, seconds: 0, isPrecise: false, hasTime: false };

  if (!targetDate || typeof targetDate !== 'string') return empty;
  const parts = targetDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return empty;

  const [y, m, d] = parts;
  const hasTime = !!targetTime && /^\d{2}:\d{2}$/.test(targetTime);

  // Jours calendaires — minuit à minuit (pas influencé par l'heure courante)
  const targetMidnight = new Date(y, m - 1, d);
  targetMidnight.setHours(0, 0, 0, 0);
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const calendarDays = Math.max(0, Math.round((targetMidnight - todayMidnight) / 86400000));

  // Événement calendairement passé
  if (targetMidnight < todayMidnight) return { ...empty, hasTime };

  // ── MODE AVEC HEURE EXACTE ───────────────────────────────────────────────
  if (hasTime) {
    const [hh, mm] = targetTime.split(':').map(Number);
    const deadline = new Date(y, m - 1, d, hh, mm, 0, 0);
    const now = new Date();
    const diffMs = deadline - now;

    if (diffMs <= 0) return { ...empty, hasTime };

    const totalSec = Math.floor(diffMs / 1000);
    const seconds  = totalSec % 60;
    const totalMin = Math.floor(totalSec / 60);
    const minutes  = totalMin % 60;
    const totalHrs = Math.floor(totalMin / 60);
    const hours    = totalHrs % 24;
    const days     = Math.floor(totalHrs / 24);

    // Précis quand il reste moins d'une journée complète
    const isPrecise = days === 0;

    return { days, hours, minutes, seconds, isPrecise, hasTime };
  }

  // ── MODE SANS HEURE (comportement original) ──────────────────────────────
  if (calendarDays === 0) {
    // Jour J — compte jusqu'à 23:59:59
    const endOfDay = new Date(y, m - 1, d, 23, 59, 59, 999);
    const now = new Date();
    const diffMs = endOfDay - now;
    if (diffMs <= 0) return { ...empty, hasTime };
    const totalMinutes = Math.floor(diffMs / 60000);
    return {
      days: 0,
      hours: Math.floor(totalMinutes / 60),
      minutes: totalMinutes % 60,
      seconds: 0,
      isPrecise: true,
      hasTime,
    };
  }

  return { days: calendarDays, hours: 0, minutes: 0, seconds: 0, isPrecise: false, hasTime };
}

// ── isMemoir ─────────────────────────────────────────────────────────────────
export function isMemoir(event) {
  if (!event?.targetDate) return false;
  const todayStr = new Date().toISOString().split('T')[0];
  return event.targetDate < todayStr;
}

// ── calcTimeAgo ───────────────────────────────────────────────────────────────
export function calcTimeAgo(targetDate) {
  if (!targetDate) return '';
  const parts = targetDate.split('-').map(Number);
  if (parts.length !== 3) return '';
  const [y, m, d] = parts;
  const past = new Date(y, m - 1, d);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((now - past) / 86400000);

  if (diffDays <= 0) return t('date_today');
  if (diffDays === 1) return t('date_yesterday');
  if (diffDays < 7)   return t('date_days_ago',   { count: diffDays });
  if (diffDays < 30) {
    const w = Math.floor(diffDays / 7);
    return w === 1 ? t('date_week_ago') : t('date_weeks_ago', { count: w });
  }
  if (diffDays < 365) {
    const mo = Math.floor(diffDays / 30);
    return mo === 1 ? t('date_month_ago') : t('date_months_ago', { count: mo });
  }
  const yr = Math.floor(diffDays / 365);
  return yr === 1 ? t('date_year_ago') : t('date_years_ago', { count: yr });
}