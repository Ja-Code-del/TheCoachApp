import { useState, useCallback, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';

export function useShare(shareCardRef, activeEvent, daysLeft, isJourJ) {
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState(null);

  // Auto-clear shareError après 4s
  useEffect(() => {
    if (!shareError) return;
    const t = setTimeout(() => setShareError(null), 4000);
    return () => clearTimeout(t);
  }, [shareError]);

  // Ref pour stabiliser handleShare sans le recréer à chaque frappe
  const activeEventRef = useRef(activeEvent);
  useEffect(() => { activeEventRef.current = activeEvent; }, [activeEvent]);

  const handleShare = useCallback(async () => {
    if (!shareCardRef.current) return;
    setIsSharing(true);
    setShareError(null);
    const evt = activeEventRef.current;
    try {
      await new Promise(r => setTimeout(r, 100));
      const canvas = await html2canvas(shareCardRef.current, {
        useCORS: true, scale: 2, backgroundColor: null, logging: false,
      });
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92));
      const file = new File([blob], 'countdown.jpg', { type: 'image/jpeg' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: isJourJ
            ? `Jour J — ${evt.eventName || evt.theme}`
            : `Plus que ${daysLeft} jours — ${evt.eventName || evt.theme}`,
          text: `"${evt.quote?.text}" — ${evt.quote?.author}`,
        });
      } else {
        // Fallback : téléchargement direct (compatible Safari iOS)
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'countdown.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('Erreur partage:', e);
        setShareError("Impossible de partager ou télécharger l'image.");
      }
    } finally {
      setIsSharing(false);
    }
  }, [shareCardRef, daysLeft, isJourJ]);

  return { handleShare, isSharing, shareError };
}