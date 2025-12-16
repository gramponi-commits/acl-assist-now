import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

type AnnouncementType = 'rhythmCheck' | 'preCharge' | 'epiDue' | 'resumeCPR' | 'rosc';

export function useVoiceAnnouncements() {
  const { t, i18n } = useTranslation();
  const enabledRef = useRef<boolean>(false);
  const lastAnnouncementRef = useRef<string>('');

  const speak = useCallback((text: string) => {
    if (!enabledRef.current || !('speechSynthesis' in window)) return;
    
    // Prevent duplicate announcements
    if (lastAnnouncementRef.current === text) return;
    lastAnnouncementRef.current = text;
    
    // Clear previous and speak new
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = i18n.language === 'it' ? 'it-IT' : 'en-US';
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Reset last announcement after speaking
    utterance.onend = () => {
      setTimeout(() => {
        lastAnnouncementRef.current = '';
      }, 2000);
    };
    
    window.speechSynthesis.speak(utterance);
  }, [i18n.language]);

  const announce = useCallback((type: AnnouncementType) => {
    if (!enabledRef.current) return;

    const announcements: Record<AnnouncementType, string> = {
      rhythmCheck: t('voice.rhythmCheck', 'Rhythm check now. Pause CPR. Analyze rhythm.'),
      preCharge: t('voice.preCharge', 'Pre-charge defibrillator. Rhythm check in 15 seconds.'),
      epiDue: t('voice.epiDue', 'Epinephrine due. Give 1 milligram IV or IO.'),
      resumeCPR: t('voice.resumeCPR', 'Resume high quality CPR.'),
      rosc: t('voice.rosc', 'ROSC achieved. Begin post cardiac arrest care.'),
    };

    speak(announcements[type]);
  }, [speak, t]);

  const setEnabled = useCallback((enabled: boolean) => {
    enabledRef.current = enabled;
    if (!enabled) {
      window.speechSynthesis?.cancel();
    }
  }, []);

  const isEnabled = useCallback(() => enabledRef.current, []);

  return {
    announce,
    speak,
    setEnabled,
    isEnabled,
  };
}
