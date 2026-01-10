import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Syringe, Pill, Stethoscope, Check, Loader2 } from 'lucide-react';
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

  // Loading and success states
  const [loadingState, setLoadingState] = useState<{
    epi: boolean;
    antiarrhythmic: boolean;
    rhythmCheck: boolean;
  }>({
    epi: false,
    antiarrhythmic: false,
    rhythmCheck: false,
  });

  const [successState, setSuccessState] = useState<{
    epi: boolean;
    antiarrhythmic: boolean;
    rhythmCheck: boolean;
  }>({
    epi: false,
    antiarrhythmic: false,
    rhythmCheck: false,
  });

  // Handle button clicks with loading and success animations
  const handleEpinephrine = async () => {
    setLoadingState(prev => ({ ...prev, epi: true }));
    await new Promise(resolve => setTimeout(resolve, 200)); // Brief loading state
    onEpinephrine();
    setLoadingState(prev => ({ ...prev, epi: false }));
    setSuccessState(prev => ({ ...prev, epi: true }));
    setTimeout(() => setSuccessState(prev => ({ ...prev, epi: false })), 1500);
  };

  const handleAntiarrhythmic = async () => {
    setLoadingState(prev => ({ ...prev, antiarrhythmic: true }));
    await new Promise(resolve => setTimeout(resolve, 200));
    showLidocaine ? onLidocaine() : onAmiodarone();
    setLoadingState(prev => ({ ...prev, antiarrhythmic: false }));
    setSuccessState(prev => ({ ...prev, antiarrhythmic: true }));
    setTimeout(() => setSuccessState(prev => ({ ...prev, antiarrhythmic: false })), 1500);
  };

  const handleRhythmCheck = async () => {
    setLoadingState(prev => ({ ...prev, rhythmCheck: true }));
    await new Promise(resolve => setTimeout(resolve, 200));
    onRhythmCheck();
    setLoadingState(prev => ({ ...prev, rhythmCheck: false }));
  };

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
    <div className="space-y-2 sm:space-y-3">
      <h2 className="text-clinical-base sm:text-clinical-lg font-semibold text-foreground">
        {t('actions.title')}
      </h2>

      {/* Rhythm Check Button - Most prominent when due */}
      <motion.div
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.01 }}
      >
        <Button
          onClick={handleRhythmCheck}
          disabled={loadingState.rhythmCheck}
          className={cn(
            'w-full h-14 sm:h-16 text-base sm:text-lg font-bold gap-2 sm:gap-3 transition-all touch-target interactive-active',
            rhythmCheckDue
              ? 'bg-acls-critical hover:bg-acls-critical/90 text-white pulse-critical shadow-lg'
              : 'bg-acls-critical/80 hover:bg-acls-critical/70 text-white'
          )}
          aria-label={rhythmCheckDue ? t('actions.rhythmCheckNow') : t('actions.rhythmCheck')}
          aria-live="polite"
        >
          {loadingState.rhythmCheck ? (
            <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
          ) : (
            <Stethoscope className="h-5 w-5 sm:h-6 sm:w-6" />
          )}
          <span>{rhythmCheckDue ? t('actions.rhythmCheckNow') : t('actions.rhythmCheck')}</span>
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        {/* Epinephrine Button */}
        <motion.div
          whileTap={{ scale: 0.95 }}
          animate={successState.epi ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Button
            onClick={handleEpinephrine}
            disabled={!canGiveEpinephrine || loadingState.epi}
            className={cn(
              'w-full h-20 sm:h-24 flex-col gap-0.5 sm:gap-1 text-sm sm:text-base font-bold transition-all touch-target interactive-active',
              epiDue && canGiveEpinephrine
                ? 'bg-acls-critical hover:bg-acls-critical/90 text-white pulse-critical shadow-lg'
                : canGiveEpinephrine
                ? 'bg-acls-medication hover:bg-acls-medication/90 text-white'
                : 'bg-muted text-muted-foreground'
            )}
            aria-label={`${t('actions.epinephrine')} ${epiDose.display}`}
            aria-live="polite"
            aria-disabled={!canGiveEpinephrine}
          >
            {loadingState.epi ? (
              <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
            ) : successState.epi ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <Check className="h-5 w-5 sm:h-6 sm:w-6" />
              </motion.div>
            ) : (
              <Syringe className="h-5 w-5 sm:h-6 sm:w-6" />
            )}
            <span className="text-clinical-sm sm:text-clinical-base">{t('actions.epinephrine')}</span>
            <span className="text-clinical-xs font-normal">
              {epiDose.display} IV/IO (#{epinephrineCount + 1})
            </span>
          </Button>
        </motion.div>

        {/* Amiodarone/Lidocaine Button */}
        <motion.div
          whileTap={{ scale: 0.95 }}
          animate={successState.antiarrhythmic ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Button
            onClick={handleAntiarrhythmic}
            disabled={!canGiveAntiarrhythmic || loadingState.antiarrhythmic}
            className={cn(
              'w-full h-20 sm:h-24 flex-col gap-0.5 sm:gap-1 text-sm sm:text-base font-bold transition-all touch-target interactive-active',
              canGiveAntiarrhythmic
                ? 'bg-acls-medication hover:bg-acls-medication/90 text-white'
                : 'bg-muted text-muted-foreground'
            )}
            aria-label={`${showLidocaine ? t('actions.lidocaine') : t('actions.amiodarone')} ${antiarrhythmicDose.display}`}
            aria-live="polite"
            aria-disabled={!canGiveAntiarrhythmic}
          >
            {loadingState.antiarrhythmic ? (
              <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
            ) : successState.antiarrhythmic ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <Check className="h-5 w-5 sm:h-6 sm:w-6" />
              </motion.div>
            ) : (
              <Pill className="h-5 w-5 sm:h-6 sm:w-6" />
            )}
            <span className="text-clinical-sm sm:text-clinical-base">
              {showLidocaine ? t('actions.lidocaine') : t('actions.amiodarone')}
            </span>
            <span className="text-clinical-xs font-normal">
              {antiarrhythmicDose.display} (#{antiarrhythmicCount + 1})
            </span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}