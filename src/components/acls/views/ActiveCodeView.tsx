import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StickyNote, Heart, Skull } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WeightInput, WeightDisplay } from '../WeightInput';
import { ActionButtons } from '../ActionButtons';
import { CycleTimers, CodeTimers } from '../TimerDisplay';
import { CPRQualityPanel } from '../CPRQualityPanel';
import { HsAndTsChecklist } from '../HsAndTsChecklist';
import { PregnancyChecklist } from '../PregnancyChecklist';
import { CodeTimeline } from '../CodeTimeline';
import type { PathwayMode, Intervention, HsAndTs, AirwayStatus, PregnancyCauses, PregnancyInterventions, CPRRatio } from '@/types/acls';

// Use HsAndTs directly instead of HsAndTsState alias
type HsAndTsState = HsAndTs;

interface ActiveCodeViewProps {
  // Session state
  pathwayMode: PathwayMode;
  patientWeight: number | null;
  epinephrineCount: number;
  amiodaroneCount: number;
  lidocaineCount: number;
  airwayStatus: AirwayStatus;
  cprRatio: CPRRatio;
  hsAndTs: HsAndTsState;
  interventions: Intervention[];
  startTime: number | null;
  pregnancyActive?: boolean;
  pregnancyCauses?: PregnancyCauses;
  pregnancyInterventions?: PregnancyInterventions;
  pregnancyStartTime?: number | null;

  // Timer state
  cprCycleRemaining: number;
  epiRemaining: number;
  preShockAlert: boolean;
  rhythmCheckDue: boolean;
  totalElapsed: number;
  totalCPRTime: number;

  // Button states
  canGiveEpinephrine: boolean;
  canGiveAmiodarone: boolean;
  canGiveLidocaine: boolean;
  epiDue: boolean;

  // Settings
  preferLidocaine: boolean;
  vibrationEnabled: boolean;

  // Actions
  onSetWeight: (weight: number | null) => void;
  onEpinephrine: () => void;
  onAmiodarone: () => void;
  onLidocaine: () => void;
  onRhythmCheck: () => void;
  onAirwayChange: (status: AirwayStatus) => void;
  onETCO2Record: (value: number) => void;
  onCPRRatioChange: (ratio: CPRRatio) => void;
  onUpdateHsAndTs: (updates: Partial<HsAndTsState>) => void;
  onTogglePregnancy: (active: boolean) => void;
  onUpdatePregnancyCauses: (updates: Partial<PregnancyCauses>) => void;
  onUpdatePregnancyInterventions: (updates: Partial<PregnancyInterventions>) => void;
  onDeliveryAlert: () => void;
  onAddNote: () => void;
  onExport: () => void;
  onNewCode: () => void;
  onROSC: () => void;
  onTerminate: () => void;
}

/**
 * Active Code View - Main interface during active resuscitation
 * Shows action buttons, timers, quality metrics, and timeline
 * Memoized to prevent unnecessary re-renders during timer updates
 */
export const ActiveCodeView = memo<ActiveCodeViewProps>(({
  pathwayMode,
  patientWeight,
  epinephrineCount,
  amiodaroneCount,
  lidocaineCount,
  airwayStatus,
  cprRatio,
  hsAndTs,
  interventions,
  startTime,
  pregnancyActive,
  pregnancyCauses,
  pregnancyInterventions,
  pregnancyStartTime,
  cprCycleRemaining,
  epiRemaining,
  preShockAlert,
  rhythmCheckDue,
  totalElapsed,
  totalCPRTime,
  canGiveEpinephrine,
  canGiveAmiodarone,
  canGiveLidocaine,
  epiDue,
  preferLidocaine,
  vibrationEnabled,
  onSetWeight,
  onEpinephrine,
  onAmiodarone,
  onLidocaine,
  onRhythmCheck,
  onAirwayChange,
  onETCO2Record,
  onCPRRatioChange,
  onUpdateHsAndTs,
  onTogglePregnancy,
  onUpdatePregnancyCauses,
  onUpdatePregnancyInterventions,
  onDeliveryAlert,
  onAddNote,
  onExport,
  onNewCode,
  onROSC,
  onTerminate,
}) => {
  const { t } = useTranslation();
  const [showWeightDialog, setShowWeightDialog] = useState(false);

  return (
    <>
      {/* Weight Display + Edit Button - Only for Pediatric */}
      {pathwayMode === 'pediatric' && (
        <>
          <div className="flex items-center justify-center gap-3">
            <WeightDisplay
              weight={patientWeight}
              onEdit={() => setShowWeightDialog(true)}
            />
          </div>

          <WeightInput
            currentWeight={patientWeight}
            onWeightChange={onSetWeight}
            isOpen={showWeightDialog}
            onOpenChange={setShowWeightDialog}
            showTrigger={false}
          />
        </>
      )}

      {/* Action Buttons */}
      <ActionButtons
        canGiveEpinephrine={canGiveEpinephrine}
        canGiveAmiodarone={canGiveAmiodarone}
        canGiveLidocaine={canGiveLidocaine}
        epiDue={epiDue}
        rhythmCheckDue={rhythmCheckDue}
        epinephrineCount={epinephrineCount}
        amiodaroneCount={amiodaroneCount}
        lidocaineCount={lidocaineCount}
        preferLidocaine={preferLidocaine}
        patientWeight={patientWeight}
        pathwayMode={pathwayMode}
        onEpinephrine={onEpinephrine}
        onAmiodarone={onAmiodarone}
        onLidocaine={onLidocaine}
        onRhythmCheck={onRhythmCheck}
      />

      {/* Cycle Timers - Rhythm Check & Epi */}
      <CycleTimers
        cprCycleRemaining={cprCycleRemaining}
        epiRemaining={epiRemaining}
        preShockAlert={preShockAlert}
        rhythmCheckDue={rhythmCheckDue}
        showEpiTimer={epinephrineCount > 0}
      />

      {/* CPR Quality */}
      <CPRQualityPanel
        airwayStatus={airwayStatus}
        onAirwayChange={onAirwayChange}
        onETCO2Record={onETCO2Record}
        cprRatio={cprRatio}
        onCPRRatioChange={onCPRRatioChange}
        pathwayMode={pathwayMode}
      />

      {/* H's & T's */}
      <HsAndTsChecklist
        hsAndTs={hsAndTs}
        onUpdate={onUpdateHsAndTs}
      />

      {/* Pregnancy Checklist - Adult only */}
      {pathwayMode === 'adult' && (
        <PregnancyChecklist
          pregnancyActive={pregnancyActive!}
          pregnancyCauses={pregnancyCauses!}
          pregnancyInterventions={pregnancyInterventions!}
          pregnancyStartTime={pregnancyStartTime!}
          cprStartTime={startTime}
          onTogglePregnancy={onTogglePregnancy}
          onUpdateCauses={onUpdatePregnancyCauses}
          onUpdateInterventions={onUpdatePregnancyInterventions}
          onDeliveryAlert={onDeliveryAlert}
        />
      )}

      {/* Code Timers - Total & CPR */}
      <CodeTimers
        totalElapsed={totalElapsed}
        totalCPRTime={totalCPRTime}
      />

      {/* Code Timeline */}
      <CodeTimeline
        interventions={interventions}
        startTime={startTime}
      />

      {/* Session Controls - End Code Options */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-2">
        <Button
          onClick={onROSC}
          className="h-12 sm:h-14 gap-1 sm:gap-2 touch-target interactive-active bg-acls-success hover:bg-acls-success/90 text-white font-bold"
          aria-label={t('actions.rosc')}
        >
          <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
          {t('actions.rosc')}
        </Button>
        <Button
          onClick={onTerminate}
          variant="outline"
          className="h-12 sm:h-14 gap-1 sm:gap-2 touch-target interactive-hover border-destructive text-destructive hover:bg-destructive/10"
          aria-label={t('actions.terminate')}
        >
          <Skull className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">{t('actions.terminate')}</span>
          <span className="sm:hidden">{t('history.deceased')}</span>
        </Button>
      </div>

      {/* Add Note Button */}
      <div className="pt-2">
        <Button
          onClick={onAddNote}
          variant="outline"
          className="w-full h-10 sm:h-12 gap-1 sm:gap-2 touch-target interactive-hover text-clinical-sm"
          aria-label={t('actions.addNote')}
        >
          <StickyNote className="h-3 w-3 sm:h-4 sm:w-4" />
          {t('actions.addNote')}
        </Button>
      </div>
    </>
  );
});

ActiveCodeView.displayName = 'ActiveCodeView';
