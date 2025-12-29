import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { PregnancyCauses, PregnancyInterventions } from '@/types/acls';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Baby, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface PregnancyChecklistProps {
  pregnancyActive: boolean;
  pregnancyCauses: PregnancyCauses;
  pregnancyInterventions: PregnancyInterventions;
  pregnancyStartTime: number | null;
  cprStartTime: number;
  onTogglePregnancy: (active: boolean) => void;
  onUpdateCauses: (updates: Partial<PregnancyCauses>) => void;
  onUpdateInterventions: (updates: Partial<PregnancyInterventions>) => void;
}

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export function PregnancyChecklist({
  pregnancyActive,
  pregnancyCauses,
  pregnancyInterventions,
  pregnancyStartTime,
  cprStartTime,
  onTogglePregnancy,
  onUpdateCauses,
  onUpdateInterventions,
}: PregnancyChecklistProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [deliveryAlertTime, setDeliveryAlertTime] = useState<number | null>(null);

  // Calculate time since CPR started (not pregnancy activation)
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const deliveryAlertActive = pregnancyActive && timeElapsed >= FIVE_MINUTES_MS;

  useEffect(() => {
    if (!cprStartTime) {
      setTimeElapsed(0);
      return;
    }

    const interval = setInterval(() => {
      setTimeElapsed(Date.now() - cprStartTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [cprStartTime]);

  const handleTogglePregnancy = (checked: boolean) => {
    onTogglePregnancy(checked);
    if (checked) {
      setIsOpen(true);
    }
  };

  const formatTime = (ms: number) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const CAUSES_ITEMS: { key: keyof PregnancyCauses; letter: string; labelKey: string; descKey: string }[] = [
    { key: 'anestheticComplications', letter: 'A', labelKey: 'pregnancy.anesthetic', descKey: 'pregnancy.anestheticDesc' },
    { key: 'bleeding', letter: 'B', labelKey: 'pregnancy.bleeding', descKey: 'pregnancy.bleedingDesc' },
    { key: 'cardiovascular', letter: 'C', labelKey: 'pregnancy.cardiovascular', descKey: 'pregnancy.cardiovascularDesc' },
    { key: 'drugs', letter: 'D', labelKey: 'pregnancy.drugs', descKey: 'pregnancy.drugsDesc' },
    { key: 'embolic', letter: 'E', labelKey: 'pregnancy.embolic', descKey: 'pregnancy.embolicDesc' },
    { key: 'fever', letter: 'F', labelKey: 'pregnancy.fever', descKey: 'pregnancy.feverDesc' },
    { key: 'generalCauses', letter: 'G', labelKey: 'pregnancy.generalCauses', descKey: 'pregnancy.generalCausesDesc' },
    { key: 'hypertension', letter: 'H', labelKey: 'pregnancy.hypertension', descKey: 'pregnancy.hypertensionDesc' },
  ];

  const INTERVENTIONS_ITEMS: { key: keyof PregnancyInterventions; labelKey: string; descKey: string }[] = [
    { key: 'leftUterineDisplacement', labelKey: 'pregnancy.leftUterine', descKey: 'pregnancy.leftUterineDesc' },
    { key: 'earlyAirway', labelKey: 'pregnancy.earlyAirway', descKey: 'pregnancy.earlyAirwayDesc' },
    { key: 'ivAboveDiaphragm', labelKey: 'pregnancy.ivAbove', descKey: 'pregnancy.ivAboveDesc' },
    { key: 'stopMagnesiumGiveCalcium', labelKey: 'pregnancy.stopMagnesium', descKey: 'pregnancy.stopMagnesiumDesc' },
    { key: 'detachFetalMonitors', labelKey: 'pregnancy.detachFetal', descKey: 'pregnancy.detachFetalDesc' },
    { key: 'massiveTransfusion', labelKey: 'pregnancy.massiveTransfusion', descKey: 'pregnancy.massiveTransfusionDesc' },
  ];

  const checkedCausesCount = Object.values(pregnancyCauses).filter(Boolean).length;
  const checkedInterventionsCount = Object.values(pregnancyInterventions).filter(Boolean).length;
  const totalChecked = checkedCausesCount + checkedInterventionsCount;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className={cn(
          'flex items-center justify-between p-4 rounded-lg border-2 transition-all',
          pregnancyActive 
            ? 'bg-pink-500/20 border-pink-500' 
            : 'bg-pink-500/10 border-pink-400/50 hover:bg-pink-500/15'
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-1.5 rounded-full",
              pregnancyActive ? "bg-pink-500/30" : "bg-pink-400/20"
            )}>
              <Baby className="h-5 w-5 text-pink-400" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-foreground">{t('pregnancy.title')}</div>
              <div className="text-sm text-muted-foreground">
                {pregnancyActive 
                  ? (totalChecked > 0 
                      ? t('pregnancy.itemsChecked', { count: totalChecked }) 
                      : t('pregnancy.activeReview'))
                  : t('pregnancy.tapToActivate')}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pregnancyActive && deliveryAlertActive && (
              <Badge variant="destructive" className="animate-pulse gap-1">
                <AlertTriangle className="h-3 w-3" />
                {t('pregnancy.deliveryAlert')}
              </Badge>
            )}
            <ChevronDown className={cn(
              'h-5 w-5 text-muted-foreground transition-transform',
              isOpen && 'rotate-180'
            )} />
          </div>
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="mt-3 space-y-4 p-4 bg-card rounded-lg border border-pink-400/30">
          {/* Pregnancy Toggle */}
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg bg-pink-500/10 border border-pink-400/30">
            <Checkbox
              checked={pregnancyActive}
              onCheckedChange={handleTogglePregnancy}
              className="border-pink-400 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
            />
            <div className="flex-1">
              <div className="font-semibold text-pink-400">{t('pregnancy.activatePregnancy')}</div>
              <div className="text-xs text-muted-foreground">{t('pregnancy.activateDesc')}</div>
            </div>
            {pregnancyActive && (
              <div className="flex items-center gap-1 text-xs text-pink-400">
                <Clock className="h-3 w-3" />
                {formatTime(timeElapsed)}
              </div>
            )}
          </label>

          {/* 5-minute Delivery Alert */}
          {pregnancyActive && deliveryAlertActive && (
            <div className="bg-destructive/20 border-2 border-destructive rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-2 text-destructive font-bold text-lg">
                <AlertTriangle className="h-6 w-6" />
                {t('pregnancy.emergencyDelivery')}
              </div>
              <p className="text-sm text-destructive/80 mt-1">
                {t('pregnancy.emergencyDeliveryDesc')}
              </p>
            </div>
          )}

          {pregnancyActive && (
            <>
              {/* Key Interventions */}
              <div>
                <h3 className="text-sm font-bold text-pink-400 mb-3">{t('pregnancy.interventionsTitle')}</h3>
                <div className="space-y-2">
                  {INTERVENTIONS_ITEMS.map((item) => (
                    <label
                      key={item.key}
                      className="flex items-start gap-3 cursor-pointer p-2 rounded hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={pregnancyInterventions[item.key]}
                        onCheckedChange={(checked) => onUpdateInterventions({ [item.key]: checked })}
                        className="mt-0.5 border-pink-400 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground">{t(item.labelKey)}</div>
                        <div className="text-xs text-muted-foreground">{t(item.descKey)}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Causes (A-H) */}
              <div>
                <h3 className="text-sm font-bold text-pink-400 mb-3">{t('pregnancy.causesTitle')}</h3>
                <div className="space-y-2">
                  {CAUSES_ITEMS.map((item) => (
                    <label
                      key={item.key}
                      className="flex items-start gap-3 cursor-pointer p-2 rounded hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={pregnancyCauses[item.key]}
                        onCheckedChange={(checked) => onUpdateCauses({ [item.key]: checked })}
                        className="mt-0.5 border-pink-400 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-pink-500/20 text-pink-400 text-xs font-bold mr-2">
                            {item.letter}
                          </span>
                          {t(item.labelKey)}
                        </div>
                        <div className="text-xs text-muted-foreground ml-7">{t(item.descKey)}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}