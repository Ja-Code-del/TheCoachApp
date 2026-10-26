import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchAIQuote, fetchUnsplashImage } from '../lib/api';
import { calcDaysLeft } from '../lib/utils';

// Historique des citations récemment servies, pour ne pas les resservir.
const HISTORY_KEY = 'quoteHistory';
const HISTORY_MAX = 25;

function readQuoteHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function pushQuoteHistory(quote) {
  if (!quote?.text) return;
  try {
    const history = readQuoteHistory();
    history.push({ text: quote.text, author: quote.author || '' });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-HISTORY_MAX)));
  } catch {
    /* localStorage indisponible — l'anti-répétition est best-effort */
  }
}

export function useMediaGeneration(activeEvent, updateEventById) {
  const { t, i18n } = useTranslation();
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [quoteError, setQuoteError] = useState(null);

  // Ref pour éviter de recréer les callbacks à chaque frappe dans les inputs
  const activeEventRef = useRef(activeEvent);
  useEffect(() => { activeEventRef.current = activeEvent; }, [activeEvent]);

  const generateQuote = useCallback(async (eventOverride) => {
    const evt = eventOverride || activeEventRef.current;
    const eventId = evt.id;
    if (!evt.theme.trim()) return;
    setIsLoadingQuote(true);
    setQuoteError(null);
    try {
      const days = calcDaysLeft(evt.targetDate);
      const avoid = readQuoteHistory();
      const q = await fetchAIQuote(evt.theme, days, i18n.language, avoid);
      pushQuoteHistory(q);
      updateEventById(eventId, { quote: q });
    } catch (e) {
      console.error('Erreur citation:', e);
      setQuoteError(t('errors.quoteGeneration'));
    } finally {
      setIsLoadingQuote(false);
    }
  }, [updateEventById, i18n.language, t]);

  const loadImage = useCallback(async (eventOverride) => {
    const evt = eventOverride || activeEventRef.current;
    const eventId = evt.id;
    if (!evt.theme.trim()) return;
    setIsLoadingImage(true);
    try {
      const img = await fetchUnsplashImage(evt.theme);
      updateEventById(eventId, {
        bgImage: img.url,
        photographer: { name: img.photographer, url: img.photographerUrl },
      });
    } catch (e) {
      console.error('Erreur image:', e);
      updateEventById(eventId, { bgImage: null, photographer: null });
    } finally {
      setIsLoadingImage(false);
    }
  }, [updateEventById]);

  const resetQuoteError = useCallback(() => setQuoteError(null), []);

  return { generateQuote, loadImage, isLoadingQuote, isLoadingImage, quoteError, resetQuoteError };
}