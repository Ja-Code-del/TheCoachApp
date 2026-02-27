import { useState, useCallback, useEffect, useRef } from 'react';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

export function useShare(shareCardRef, activeEvent, daysLeft, isJourJ) {
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Auto-clear shareError après 4s
  useEffect(() => {
    if (!shareError) return;
    const t = setTimeout(() => setShareError(null), 4000);
    return () => clearTimeout(t);
  }, [shareError]);

  // Ref pour stabiliser handleShare sans le recréer à chaque frappe
  const activeEventRef = useRef(activeEvent);
  useEffect(() => { activeEventRef.current = activeEvent; }, [activeEvent]);

  const daysLeftRef = useRef(daysLeft);
  useEffect(() => { daysLeftRef.current = daysLeft; }, [daysLeft]);

  const isJourJRef = useRef(isJourJ);
  useEffect(() => { isJourJRef.current = isJourJ; }, [isJourJ]);

  const handleShare = useCallback(async () => {
    if (!shareCardRef.current) return;
    setIsSharing(true);
    setShareError(null);

    const evt = activeEventRef.current;
    const days = daysLeftRef.current;
    const jourJ = isJourJRef.current;

    try {
      // Capture la ShareCard en JPEG via react-native-view-shot
      const uri = await captureRef(shareCardRef, {
        format: 'jpg',
        quality: 0.92,
        result: 'tmpfile', // Fichier temporaire sur le device
      });

      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        // Partage natif iOS/Android
        await Sharing.shareAsync(uri, {
          mimeType: 'image/jpeg',
          dialogTitle: jourJ
            ? `Jour J — ${evt.eventName || evt.theme}`
            : `Plus que ${days} jours — ${evt.eventName || evt.theme}`,
        });
      } else {
        // Fallback : sauvegarder dans la galerie Photos
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          await MediaLibrary.saveToLibraryAsync(uri);
          // Ajouter un état imageSaved temporaire
          //setShareError(null);
          setSaveSuccess(true); // ← nouveau state
          setTimeout(() => setSaveSuccess(false), 3000);
        } else {
          setShareError("Permission refusée pour accéder à la galerie.");
        }
      }
    } catch (e) {
      if (e.message !== 'User cancelled') {
        console.error('Erreur partage:', e);
        setShareError("Impossible de partager ou sauvegarder l'image.");
      }
    } finally {
      setIsSharing(false);
    }
  }, [shareCardRef]);

  return { handleShare, isSharing, shareError, saveSuccess };
}
