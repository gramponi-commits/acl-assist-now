import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Syringe, Pill, Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  calculateEpinephrineDose,
  calculateAmiodaroneDose,
  calculateLidocaineDose,
} from '@/lib/palsDosing';
import {
  getAdultEpinephrineDose,
  getAdultAmiodaroneDose,
  getAdultLidocaineDose,
} from '@/lib/aclsDosing';
import { PathwayMode } from '@/types/acls';

interface ActionButtonsProps {
  canGiveEpinephrine: boolean;
  canGiveAmiodarone: boolean;
  canGiveLidocaine: boolean;
  epiDue: boolean;
  rhythmCheckDue: boolean;
  epinephrineCount: number;
  amiodaroneCount: number;
  lidocaineCount: number;
  preferLidocaine: boolean;
  patientWeight: number | null;
  pathwayMode: PathwayMode;
  onEpinephrine: () => void;
  onAmiodarone: () => void;
  onLidocaine: () => void;
  onRhythmCheck: () => void;
}

export function ActionButtons({
  canGiveEpinephrine,
  canGiveAmiodarone,
  canGiveLidocaine,
  epiDue,
  rhythmCheckDue,
  epinephrineCount,
  amiodaroneCount,
  lidocaineCount,
  preferLidocaine,
  patientWeight,
  pathwayMode,
  onEpinephrine,
  onAmiodarone,
  onLidocaine,
  onRhythmCheck,
}: ActionButtonsProps) {
  const { t } = useTranslation();

  // Calculate doses based on pathway mode
  const epiDose = pathwayMode === 'pediatric' 
    ? calculateEpinephrineDose(patientWeight)
    : getAdultEpinephrineDose();
  
  const amioDose = pathwayMode === 'pediatric'
    ? calculateAmiodaroneDose(patientWeight, amiodaroneCount)
    : getAdultAmiodaroneDose(amiodaroneCount);
  
  const lidoDose = pathwayMode === 'pediatric'
    ? calculateLidocaineDose(patientWeight)
    : getAdultLidocaineDose(lidocaineCount);

  // Show lidocaine if preferred, otherwise amiodarone
  const showLidocaine = preferLidocaine;
  const antiarrhythmicCount = showLidocaine ? lidocaineCount : amiodaroneCount;
  const canGiveAntiarrhythmic = showLidocaine ? canGiveLidocaine : canGiveAmiodarone;
  const onAntiarrhythmic = showLidocaine ? onLidocaine : onAmiodarone;
  const antiarrhythmicDose = showLidocaine ? lidoDose : amioDose;

  // Theme colors based on pathway
  const isAdult = pathwayMode === 'adult';

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">{t('actions.title')}</h2>
      
      {/* Rhythm Check Button - Most prominent when due */}
      <Button
        onClick={onRhythmCheck}
        className={cn(
          'w-full h-16 text-lg font-bold gap-3 transition-all',
          rhythmCheckDue
            ? 'bg-acls-critical hover:bg-acls-critical/90 text-white animate-pulse shadow-lg shadow-acls-critical/30'
            : isAdult
            ? 'bg-acls-critical/80 hover:bg-acls-critical/70 text-white'
            : 'bg-acls-info hover:bg-acls-info/90 text-white'
        )}
      >
        <Stethoscope className="h-6 w-6" />
        <span>{rhythmCheckDue ? t('actions.rhythmCheckNow') : t('actions.rhythmCheck')}</span>
      </Button>

      <div className="grid grid-cols-2 gap-3">
        {/* Epinephrine Button */}
        <Button
          onClick={onEpinephrine}
          disabled={!canGiveEpinephrine}
          className={cn(
            'h-20 flex-col gap-1 text-base font-bold transition-all',
            epiDue && canGiveEpinephrine
              ? 'bg-acls-critical hover:bg-acls-critical/90 text-white animate-pulse shadow-lg shadow-acls-critical/30'
              : canGiveEpinephrine
              ? 'bg-acls-medication hover:bg-acls-medication/90 text-white'
              : 'bg-muted text-muted-foreground'
          )}
        >
          <Syringe className="h-6 w-6" />
          <span>{t('actions.epinephrine')}</span>
          <span className="text-xs font-normal">
            {epiDose.display} IV/IO (#{epinephrineCount + 1})
          </span>
        </Button>

        {/* Amiodarone/Lidocaine Button */}
        <Button
          onClick={onAntiarrhythmic}
          disabled={!canGiveAntiarrhythmic}
          className={cn(
            'h-20 flex-col gap-1 text-base font-bold transition-all',
            canGiveAntiarrhythmic
              ? 'bg-acls-medication hover:bg-acls-medication/90 text-white'
              : 'bg-muted text-muted-foreground'
          )}
        >
          <Pill className="h-6 w-6" />
          <span>{showLidocaine ? t('actions.lidocaine') : t('actions.amiodarone')}</span>
          <span className="text-xs font-normal">
            {antiarrhythmicDose.display} (#{antiarrhythmicCount + 1})
          </span>
        </Button>
      </div>
    </div>
  );
}