import { useState, useCallback, useEffect } from 'react';

export interface AppSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  metronomeEnabled: boolean;
  metronomeBPM: number;
  voiceAnnouncementsEnabled: boolean;
  preferLidocaine: boolean;
  defibrillatorEnergy: number;
}

const SETTINGS_KEY = 'acls-settings';

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  metronomeEnabled: false,
  metronomeBPM: 110,
  voiceAnnouncementsEnabled: false,
  preferLidocaine: false,
  defibrillatorEnergy: 200,
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [settings]);

  const updateSetting = useCallback(<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return {
    settings,
    updateSetting,
    resetSettings,
  };
}
