export const generateId = () => `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export const seededRand = (i, offset = 0) => Math.abs(Math.sin(i * 127.1 + offset * 311.7));

export const DEFAULT_EVENT = () => ({
  id: generateId(),
  eventName: '',
  theme: '',
  targetDate: '2026-12-31',
  fontId: 'inter',
  counterStyle: 'default',
  totalDays: null,
  quote: { text: '', author: '' },
  bgImage: null,
  photographer: null,
  memoir: {
    note: '',
    photos: [],
    createdAt: null,
  },
  reminders: [],
});

// Jours calendaires restants — de minuit à minuit, sans heure courante
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

export function calcTimeLeft(targetDate) {
  if (!targetDate || typeof targetDate !== 'string') return { days: 0, hours: 0, minutes: 0, isPrecise: false };
  const parts = targetDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return { days: 0, hours: 0, minutes: 0, isPrecise: false };

  const [y, m, d] = parts;

  // Jours calendaires — comparaison minuit à minuit (pas d'influence de l'heure courante)
  const targetMidnight = new Date(y, m - 1, d);
  targetMidnight.setHours(0, 0, 0, 0);
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const days = Math.max(0, Math.round((targetMidnight - todayMidnight) / 86400000));

  // Event passé
  if (targetMidnight < todayMidnight) {
    return { days: 0, hours: 0, minutes: 0, isPrecise: false };
  }

  // Mode précis = Jour J uniquement (days === 0)
  // Heures/minutes = temps réel jusqu'à fin de journée (23:59:59)
  if (days === 0) {
    const endOfDay = new Date(y, m - 1, d);
    endOfDay.setHours(23, 59, 59, 999);
    const now = new Date();
    const diffMs = endOfDay - now;
    if (diffMs <= 0) return { days: 0, hours: 0, minutes: 0, isPrecise: false };
    const totalMinutes = Math.floor(diffMs / 60000);
    return {
      days: 0,
      hours: Math.floor(totalMinutes / 60),
      minutes: totalMinutes % 60,
      isPrecise: true,
    };
  }

  // Mode normal : jours entiers seulement
  return { days, hours: 0, minutes: 0, isPrecise: false };
}

// Retourne true si l'event est un souvenir (date strictement passée)
export function isMemoir(event) {
  if (!event?.targetDate) return false;
  const todayStr = new Date().toISOString().split('T')[0];
  return event.targetDate < todayStr;
}

// "Il y a 2 mois", "Il y a 3 jours", "Il y a 1 an"
// Importer t depuis i18n partout où calcTimeAgo est appelé
// OU passer t en paramètre pour garder utils.js sans dépendance

import { t } from '../lib/i18n';

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
  if (diffDays < 7)  return t('date_days_ago',  { count: diffDays });
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