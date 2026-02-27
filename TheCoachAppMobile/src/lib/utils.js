export const generateId = () => `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export const seededRand = (i, offset = 0) => Math.abs(Math.sin(i * 127.1 + offset * 311.7));

export const DEFAULT_EVENT = () => ({
  id: generateId(),
  eventName: '',
  theme: '',
  targetDate: '2026-12-31',
  fontId: 'inter',
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