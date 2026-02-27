import { useState, useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import { getGradientForPercentage, lerpColor } from '../constants/thermalGradient';

export function useThermalGradient(percentage) {
  const initial = getGradientForPercentage(percentage);

  const [bgColors, setBgColors]     = useState(initial.bg);
  const [cardColors, setCardColors] = useState(initial.card);

  // Couleurs de départ de l'animation en cours
  const currentBg   = useRef(initial.bg);
  const currentCard = useRef(initial.card);

  // Valeur Animated pour le progress (0 → 1)
  const progress = useRef(new Animated.Value(1)).current;

  // Premier rendu : pas d'animation
  const isFirst = useRef(true);

  useEffect(() => {
    const target = getGradientForPercentage(percentage);

    if (isFirst.current) {
      // Application immédiate sans animation
      isFirst.current = false;
      currentBg.current   = target.bg;
      currentCard.current = target.card;
      setBgColors(target.bg);
      setCardColors(target.card);
      return;
    }

    // Snapshot des couleurs de départ
    const fromBg   = [...currentBg.current];
    const fromCard = [...currentCard.current];

    // Reset progress à 0
    progress.setValue(0);

    // Listener qui interpole les couleurs à chaque frame
    const listenerId = progress.addListener(({ value: t }) => {
      const newBg   = fromBg.map((c, i) => lerpColor(c, target.bg[i], t));
      const newCard = fromCard.map((c, i) => lerpColor(c, target.card[i], t));
      currentBg.current   = newBg;
      currentCard.current = newCard;
      setBgColors(newBg);
      setCardColors(newCard);
    });

    // Animation 1500ms
    Animated.timing(progress, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: false, // obligatoire : on manipule des couleurs
    }).start(({ finished }) => {
      progress.removeListener(listenerId);
      if (finished) {
        // Snap final pour éviter tout artefact de flottant
        currentBg.current   = target.bg;
        currentCard.current = target.card;
        setBgColors(target.bg);
        setCardColors(target.card);
      }
    });

    return () => {
      progress.removeListener(listenerId);
    };
  }, [percentage]);

  return { bgColors, cardColors };
}