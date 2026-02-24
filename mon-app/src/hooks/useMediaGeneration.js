import { useState, useCallback, useEffect, useRef } from 'react';
import { fetchAIQuote, fetchUnsplashImage } from '../lib/api';
import { calcDaysLeft } from '../lib/utils';

export function useMediaGeneration(activeEvent, updateEventById) {
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
      const q = await fetchAIQuote(evt.theme, days);
      updateEventById(eventId, { quote: q });
    } catch (e) {
      console.error('Erreur citation:', e);
      setQuoteError("Impossible de générer la citation.");
    } finally {
      setIsLoadingQuote(false);
    }
  }, [updateEventById]);

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