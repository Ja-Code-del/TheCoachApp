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
    photos: [],       // URIs locaux expo-image-picker
    createdAt: null,  // timestamp ISO — null = pas encore souvenir
  },
  reminders: [],
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

// Retourne true si l'event est un souvenir (date strictement passée)
export function isMemoir(event) {
  if (!event?.targetDate) return false;
  const todayStr = new Date().toISOString().split('T')[0];
  return event.targetDate < todayStr;
}

// "Il y a 2 mois", "Il y a 3 jours", "Il y a 1 an"
export function calcTimeAgo(targetDate) {
  if (!targetDate) return '';
  const parts = targetDate.split('-').map(Number);
  if (parts.length !== 3) return '';
  const [y, m, d] = parts;
  const past = new Date(y, m - 1, d);
  const now = new Date();
  const diffMs = now - past;
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Il y a 1 jour';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? 'Il y a 1 semaine' : `Il y a ${weeks} semaines`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? 'Il y a 1 mois' : `Il y a ${months} mois`;
  }
  const years = Math.floor(diffDays / 365);
  return years === 1 ? 'Il y a 1 an' : `Il y a ${years} ans`;
}