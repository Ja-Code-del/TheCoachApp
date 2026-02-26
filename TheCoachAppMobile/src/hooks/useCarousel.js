import { useState, useCallback, useEffect, useRef } from 'react';

export function useCarousel(eventsLength, activeIndex, setActiveIndex) {
  const [fadeVisible, setFadeVisible] = useState(true);
  const touchStartX = useRef(null);
  const fadeTimer = useRef(null);

  const switchTo = useCallback((index) => {
    if (index === activeIndex) return;
    clearTimeout(fadeTimer.current);
    setFadeVisible(false);
    fadeTimer.current = setTimeout(() => {
      setActiveIndex(index);
      setFadeVisible(true);
    }, 300);
  }, [activeIndex, setActiveIndex]);

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.nativeEvent.touches[0].pageX;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.nativeEvent.changedTouches[0].pageX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && activeIndex < eventsLength - 1) switchTo(activeIndex + 1);
      if (diff < 0 && activeIndex > 0) switchTo(activeIndex - 1);
    }
    touchStartX.current = null;
  }, [activeIndex, eventsLength, switchTo]);

  useEffect(() => () => clearTimeout(fadeTimer.current), []);

  return { switchTo, fadeVisible, handleTouchStart, handleTouchEnd };
}