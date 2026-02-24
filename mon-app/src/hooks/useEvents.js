import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_EVENT } from '../lib/utils';

const loadEvents = () => {
  try {
    const raw = localStorage.getItem('events');
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [DEFAULT_EVENT()];
};

const loadActiveIndex = () => {
  const i = parseInt(localStorage.getItem('activeIndex') || '0', 10);
  return isNaN(i) ? 0 : i;
};

export function useEvents() {
  const [events, setEvents] = useState(loadEvents);
  const [activeIndex, setActiveIndex] = useState(loadActiveIndex);

  // Persistance avec debounce — évite d'écrire à chaque frappe
  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem('events', JSON.stringify(events));
      localStorage.setItem('activeIndex', String(activeIndex));
    }, 500);
    return () => clearTimeout(t);
  }, [events, activeIndex]);

  const activeEvent = events[activeIndex] || events[0];

  const updateActiveEvent = useCallback((patch) => {
    setEvents(prev => prev.map((e, i) => i === activeIndex ? { ...e, ...patch } : e));
  }, [activeIndex]);

  // Mise à jour par ID — pour les opérations async (quote, image)
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
    activeIndex,
    setActiveIndex,
    activeEvent,
    updateActiveEvent,
    updateEventById,
    appendEvent,
    deleteActiveEvent,
  };
}