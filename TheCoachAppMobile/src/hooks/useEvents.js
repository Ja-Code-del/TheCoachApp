import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_EVENT } from '../lib/utils';

const STORAGE_KEYS = {
  EVENTS: 'events',
  ACTIVE_INDEX: 'activeIndex',
};

const loadEvents = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.EVENTS);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [DEFAULT_EVENT()];
};

const loadActiveIndex = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_INDEX);
    const i = parseInt(raw || '0', 10);
    return isNaN(i) ? 0 : i;
  } catch (_) {}
  return 0;
};

export function useEvents() {
  const [events, setEvents] = useState([DEFAULT_EVENT()]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isReady, setIsReady] = useState(false); // AsyncStorage est async — on attend le chargement

  // Chargement initial
  useEffect(() => {
    (async () => {
      const [loadedEvents, loadedIndex] = await Promise.all([
        loadEvents(),
        loadActiveIndex(),
      ]);
      setEvents(loadedEvents);
      setActiveIndex(loadedIndex);
      setIsReady(true);
    })();
  }, []);

  // Persistance avec debounce 500ms
  useEffect(() => {
    if (!isReady) return; // Ne pas écraser les données avant le chargement
    const t = setTimeout(async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
        await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_INDEX, String(activeIndex));
      } catch (e) {
        console.error('AsyncStorage write error:', e);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [events, activeIndex, isReady]);

  const activeEvent = events[activeIndex] ?? events[0] ?? DEFAULT_EVENT();

  const updateActiveEvent = useCallback((patch) => {
    setEvents(prev => prev.map((e, i) => i === activeIndex ? { ...e, ...patch } : e));
  }, [activeIndex]);

  const updateEventById = useCallback((id, patch) => {
    setEvents(prev => prev.map((e) => e.id === id ? { ...e, ...patch } : e));
  }, []);

  const appendEvent = useCallback((newEvent) => {
    setEvents(prev => [...prev, newEvent]);
  }, []);

  const deleteActiveEvent = useCallback(() => {
    if (events.length === 1) return;
    const indexToDelete = activeIndex;
    setEvents(prev => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== indexToDelete);
    });
    setActiveIndex(prev => Math.max(0, prev - 1));
  }, [events.length, activeIndex]);

  return {
    events,
    setEvents,
    activeIndex,
    setActiveIndex,
    activeEvent,
    isReady,
    updateActiveEvent,
    updateEventById,
    appendEvent,
    deleteActiveEvent,
  };
}
