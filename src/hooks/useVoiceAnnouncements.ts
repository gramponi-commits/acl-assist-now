import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

type AnnouncementType = 'rhythmCheck' | 'preCharge' | 'epiDue' | 'resumeCPR' | 'rosc';

// Priority order: lower number = higher priority
const ANNOUNCEMENT_PRIORITY: Record<AnnouncementType, number> = {
  rhythmCheck: 1,
  preCharge: 2,
  resumeCPR: 3,
  rosc: 4,
  epiDue: 5,
};

export function useVoiceAnnouncements() {
  const { t, i18n } = useTranslation();
  const enabledRef = useRef<boolean>(false);
  const queueRef = useRef<AnnouncementType[]>([]);
  const isSpeakingRef = useRef<boolean>(false);
  const lastAnnouncedRef = useRef<Set<AnnouncementType>>(new Set());

  const processQueue = useCallback(() => {
    if (!enabledRef.current || isSpeakingRef.current || queueRef.current.length === 0) {
      return;
    }

    // Sort queue by priority
    queueRef.current.sort((a, b) => ANNOUNCEMENT_PRIORITY[a] - ANNOUNCEMENT_PRIORITY[b]);

    const type = queueRef.current.shift();
    if (!type) return;

    // Skip if already announced recently
    if (lastAnnouncedRef.current.has(type)) {
      processQueue();
      return;
    }

    isSpeakingRef.current = true;
    lastAnnouncedRef.current.add(type);

    const announcements: Record<AnnouncementType, string> = {
      rhythmCheck: t('voice.rhythmCheck'),
      preCharge: t('voice.preCharge'),
      epiDue: t('voice.epiDue'),
      resumeCPR: t('voice.resumeCPR'),
      rosc: t('voice.rosc'),
    };

    const text = announcements[type];

    // Cancel any ongoing speech
    window.speechSynthesis?.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = i18n.language === 'it' ? 'it-IT' : 'en-US';
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => {
      isSpeakingRef.current = false;
      // Clear from recent announcements after delay
      setTimeout(() => {
        lastAnnouncedRef.current.delete(type);
      }, 3000);
      // Process next in queue
      setTimeout(processQueue, 300);
    };

    utterance.onerror = () => {
      isSpeakingRef.current = false;
      setTimeout(processQueue, 100);
    };

    window.speechSynthesis?.speak(utterance);
  }, [t, i18n.language]);

  const announce = useCallback((type: AnnouncementType) => {
    if (!enabledRef.current || !('speechSynthesis' in window)) return;

    // Don't add duplicates to queue
    if (!queueRef.current.includes(type) && !lastAnnouncedRef.current.has(type)) {
      queueRef.current.push(type);
      processQueue();
    }
  }, [processQueue]);

  const setEnabled = useCallback((enabled: boolean) => {
    enabledRef.current = enabled;
    if (!enabled) {
      window.speechSynthesis?.cancel();
      queueRef.current = [];
      isSpeakingRef.current = false;
      lastAnnouncedRef.current.clear();
    }
  }, []);

  const isEnabled = useCallback(() => enabledRef.current, []);

  return {
    announce,
    setEnabled,
    isEnabled,
  };
}
