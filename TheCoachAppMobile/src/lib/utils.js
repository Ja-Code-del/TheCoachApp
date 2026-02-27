export const generateId = () => `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export const seededRand = (i, offset = 0) => Math.abs(Math.sin(i * 127.1 + offset * 311.7));

export const DEFAULT_EVENT = () => ({
  id: generateId(),
  eventName: '',
  theme: '',
  targetDate: '2026-12-31',
  fontId: 'inter',
  counterStyle: 'default', // 'default' | 'glass'
  totalDays: null,         // stocké à la sauvegarde pour le calcul thermique
  quote: { text: '', author: '' },
  bgImage: null,
  photographer: null,
});

export function calcDaysLeft(targetDate) {
  if (!targetDate || typeof targetDate !== 'string') return 0;
  const parts = targetDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return 0;
  const [y, m, d] = parts;
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((target - today) / (1000 * 60 * 60 * 24)));
}

export function calcTimeLeft(targetDate) {
  if (!targetDate || typeof targetDate !== 'string') return { days: 0, hours: 0, minutes: 0, isPrecise: false };
  const parts = targetDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return { days: 0, hours: 0, minutes: 0, isPrecise: false };

  const [y, m, d] = parts;
  const target = new Date(y, m - 1, d);
  target.setHours(0, 0, 0, 0);
  const now = new Date();
  const diffMs = target - now;

  if (diffMs <= 0) return { days: 0, hours: 0, minutes: 0, isPrecise: false };

  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  const isPrecise = days < 7;

  return { days, hours, minutes, isPrecise };
}