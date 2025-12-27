import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Volume2, Vibrate, Music, Mic, Pill, Zap, Sun, Moon } from 'lucide-react';
import { useSettings, AdultDefibrillatorEnergy } from '@/hooks/useSettings';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' },
];

const adultEnergyOptions: AdultDefibrillatorEnergy[] = [120, 150, 200, 360];

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { settings, updateSetting } = useSettings();

  // Apply theme on mount and when theme changes
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('acls-language', langCode);
  };

  const handleThemeToggle = (isDark: boolean) => {
    updateSetting('theme', isDark ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">{t('settings.title')}</h1>
      </div>

      <ScrollArea className="h-[calc(100vh-73px)]">
        <div className="p-4 space-y-6 max-w-2xl mx-auto">
          {/* Theme Section */}
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                {settings.theme === 'dark' ? (
                  <Moon className="h-5 w-5 text-primary" />
                ) : (
                  <Sun className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-foreground">{t('settings.theme')}</h2>
                <p className="text-sm text-muted-foreground">{t('settings.themeDesc')}</p>
              </div>
              <Switch
                checked={settings.theme === 'dark'}
                onCheckedChange={handleThemeToggle}
              />
            </div>
            <div className="mt-2 pl-[52px]">
              <span className="text-sm text-muted-foreground">
                {settings.theme === 'dark' ? t('settings.darkMode') : t('settings.lightMode')}
              </span>
            </div>
          </div>

          {/* Audio Section */}
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Volume2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-foreground">{t('settings.audio')}</h2>
                <p className="text-sm text-muted-foreground">{t('settings.audioDesc')}</p>
              </div>
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
              />
            </div>
          </div>

          {/* Voice Announcements Section */}
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Mic className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-foreground">{t('settings.voice')}</h2>
                <p className="text-sm text-muted-foreground">{t('settings.voiceDesc')}</p>
              </div>
              <Switch
                checked={settings.voiceAnnouncementsEnabled}
                onCheckedChange={(checked) => updateSetting('voiceAnnouncementsEnabled', checked)}
              />
            </div>
          </div>

          {/* Vibration Section */}
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Vibrate className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-foreground">{t('settings.vibration')}</h2>
                <p className="text-sm text-muted-foreground">{t('settings.vibrationDesc')}</p>
              </div>
              <Switch
                checked={settings.vibrationEnabled}
                onCheckedChange={(checked) => updateSetting('vibrationEnabled', checked)}
              />
            </div>
          </div>

          {/* Metronome Section */}
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Music className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-foreground">{t('settings.metronome')}</h2>
                <p className="text-sm text-muted-foreground">{t('settings.metronomeDesc')}</p>
              </div>
              <Switch
                checked={settings.metronomeEnabled}
                onCheckedChange={(checked) => updateSetting('metronomeEnabled', checked)}
              />
            </div>
            {settings.metronomeEnabled && (
              <div className="mt-4 pl-[52px] space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('settings.metronomeBPM')}:</span>
                  <span className="font-mono font-bold text-foreground text-lg">{settings.metronomeBPM}</span>
                </div>
                <Slider
                  value={[settings.metronomeBPM]}
                  onValueChange={([value]) => updateSetting('metronomeBPM', value)}
                  min={100}
                  max={120}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>100</span>
                  <span>110</span>
                  <span>120</span>
                </div>
              </div>
            )}
          </div>

          {/* Adult Defibrillator Energy Section */}
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-acls-critical/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-acls-critical" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-foreground">{t('settings.adultDefibrillator')}</h2>
                <p className="text-sm text-muted-foreground">{t('settings.adultDefibrillatorDesc')}</p>
              </div>
              <Select 
                value={String(settings.adultDefibrillatorEnergy)} 
                onValueChange={(val) => updateSetting('adultDefibrillatorEnergy', Number(val) as AdultDefibrillatorEnergy)}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue>{settings.adultDefibrillatorEnergy}J</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {adultEnergyOptions.map((energy) => (
                    <SelectItem key={energy} value={String(energy)}>
                      {energy}J
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pediatric Defibrillator Energy Info */}
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-pals-primary/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-pals-primary" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-foreground">{t('settings.pediatricDefibrillator')}</h2>
                <p className="text-sm text-muted-foreground">{t('settings.defibrillatorDescPALS')}</p>
              </div>
            </div>
          </div>

          {/* Antiarrhythmic Preference Section */}
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Pill className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-foreground">{t('settings.antiarrhythmic')}</h2>
                <p className="text-sm text-muted-foreground">{t('settings.antiarrhythmicDesc')}</p>
              </div>
              <Switch
                checked={settings.preferLidocaine}
                onCheckedChange={(checked) => updateSetting('preferLidocaine', checked)}
              />
            </div>
            <div className="mt-2 pl-[52px]">
              <span className="text-sm text-muted-foreground">
                {settings.preferLidocaine ? t('settings.usingLidocaine') : t('settings.usingAmiodarone')}
              </span>
            </div>
          </div>

          {/* Language Section */}
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-foreground">{t('settings.language')}</h2>
                <p className="text-sm text-muted-foreground">{t('settings.languageDesc')}</p>
              </div>
              <Select value={i18n.language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue>
                    {languages.find(l => l.code === i18n.language)?.flag}{' '}
                    {languages.find(l => l.code === i18n.language)?.nativeName}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
