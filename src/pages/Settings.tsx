import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Globe, Check, Volume2, Vibrate, Music, Mic, Pill, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettings } from '@/hooks/useSettings';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
];

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { settings, updateSetting } = useSettings();

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('acls-language', langCode);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">{t('settings.title')}</h1>
      </div>

      <ScrollArea className="h-[calc(100vh-73px)]">
        <div className="p-4 space-y-6 max-w-2xl mx-auto">
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

          {/* Defibrillator Energy Section */}
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-acls-shockable/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-acls-shockable" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">{t('settings.defibrillator')}</h2>
                <p className="text-sm text-muted-foreground">{t('settings.defibrillatorDesc')}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[120, 150, 200, 360].map((energy) => (
                <Button
                  key={energy}
                  variant="outline"
                  className={cn(
                    'h-12 text-lg font-bold',
                    settings.defibrillatorEnergy === energy && 'border-acls-shockable bg-acls-shockable/10 text-acls-shockable'
                  )}
                  onClick={() => updateSetting('defibrillatorEnergy', energy)}
                >
                  {energy}J
                </Button>
              ))}
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
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">{t('settings.language')}</h2>
                <p className="text-sm text-muted-foreground">{t('settings.languageDesc')}</p>
              </div>
            </div>

            <div className="space-y-2">
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  variant="outline"
                  className={cn(
                    'w-full justify-start h-14 gap-3',
                    i18n.language === lang.code && 'border-primary bg-primary/5'
                  )}
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{lang.nativeName}</div>
                    <div className="text-xs text-muted-foreground">{lang.name}</div>
                  </div>
                  {i18n.language === lang.code && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
