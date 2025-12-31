import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BradyTachySession,
  BradyTachyPhase,
  BradyTachyBranch,
  PathwayMode,
  StabilityStatus,
  QRSWidth,
  RhythmRegularity,
  PedsSinusVsSVT,
  BradyTachyIntervention,
  createInitialBradyTachySession,
} from '@/types/acls';
import { saveBradyTachySession, clearBradyTachySession, StoredBradyTachySession } from '@/lib/bradyTachyStorage';

export function useBradyTachyLogic() {
  const { t } = useTranslation();
  const [session, setSession] = useState<BradyTachySession>(createInitialBradyTachySession);

  // Add intervention with enhanced logging
  const addIntervention = useCallback((
    type: BradyTachyIntervention['type'],
    details: string,
    value?: number | string,
    doseStep?: number,
    calculatedDose?: string
  ) => {
    const intervention: BradyTachyIntervention = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type,
      details,
      value,
      doseStep,
      calculatedDose,
      decisionContext: { ...session.decisionContext },
    };

    setSession(prev => {
      const updated = {
        ...prev,
        interventions: [...prev.interventions, intervention],
      };

      // Persist to localStorage
      saveBradyTachySession({
        id: updated.id,
        startTime: updated.startTime,
        endTime: updated.endTime,
        patientGroup: updated.decisionContext.patientGroup,
        weightKg: updated.decisionContext.weightKg,
        branch: updated.decisionContext.branch,
        interventions: updated.interventions.map(i => ({
          timestamp: i.timestamp,
          type: i.type,
          details: i.details,
          value: i.value,
          doseStep: i.doseStep,
          calculatedDose: i.calculatedDose,
          decisionContext: i.decisionContext,
        })),
        outcome: updated.outcome,
      });

      return updated;
    });
  }, [session.decisionContext, session.id, session.startTime, session.endTime, session.outcome]);

  // Set patient group (adult/pediatric)
  const setPatientGroup = useCallback((group: PathwayMode) => {
    setSession(prev => ({
      ...prev,
      decisionContext: {
        ...prev.decisionContext,
        patientGroup: group,
      },
    }));
  }, []);

  // Set patient weight
  const setPatientWeight = useCallback((weight: number | null) => {
    setSession(prev => ({
      ...prev,
      decisionContext: {
        ...prev.decisionContext,
        weightKg: weight,
      },
    }));
    if (weight) {
      addIntervention('note', t('interventions.weightSet', { weight }));
    }
  }, [addIntervention, t]);

  // Set branch (brady/tachy)
  const setBranch = useCallback((branch: BradyTachyBranch) => {
    setSession(prev => ({
      ...prev,
      phase: branch === 'bradycardia' ? 'bradycardia_assessment' : 'tachycardia_assessment',
      decisionContext: {
        ...prev.decisionContext,
        branch,
      },
    }));
    addIntervention('decision', `Branch selected: ${branch}`);
  }, [addIntervention]);

  // Set stability status
  const setStability = useCallback((stability: StabilityStatus) => {
    setSession(prev => ({
      ...prev,
      phase: prev.decisionContext.branch === 'bradycardia' 
        ? 'bradycardia_treatment' 
        : 'tachycardia_treatment',
      decisionContext: {
        ...prev.decisionContext,
        stability,
      },
    }));
    addIntervention('assessment', `Stability: ${stability}`);
  }, [addIntervention]);

  // Set QRS width
  const setQRSWidth = useCallback((qrsWidth: QRSWidth) => {
    setSession(prev => ({
      ...prev,
      decisionContext: {
        ...prev.decisionContext,
        qrsWidth,
      },
    }));
    addIntervention('assessment', `QRS: ${qrsWidth}`);
  }, [addIntervention]);

  // Set rhythm regularity
  const setRhythmRegular = useCallback((regular: RhythmRegularity) => {
    setSession(prev => ({
      ...prev,
      decisionContext: {
        ...prev.decisionContext,
        rhythmRegular: regular,
      },
    }));
    addIntervention('assessment', `Rhythm: ${regular}`);
  }, [addIntervention]);

  // Set monomorphic status
  const setMonomorphic = useCallback((monomorphic: boolean) => {
    setSession(prev => ({
      ...prev,
      decisionContext: {
        ...prev.decisionContext,
        monomorphic,
      },
    }));
    addIntervention('assessment', `Monomorphic: ${monomorphic ? 'yes' : 'no'}`);
  }, [addIntervention]);

  // Set pediatric sinus vs SVT choice
  const setPedsSinusVsSVT = useCallback((choice: PedsSinusVsSVT, criteria?: { pWavesPresent: boolean; variableRR: boolean; appropriateRate: boolean } | { pWavesAbnormal: boolean; fixedRR: boolean; inappropriateRate: boolean; abruptRateChange: boolean }) => {
    setSession(prev => ({
      ...prev,
      phase: 'tachycardia_treatment',
      decisionContext: {
        ...prev.decisionContext,
        pedsSinusVsSVTChoice: choice,
        ...(choice === 'probable_sinus' && criteria ? { sinusTachyCriteria: criteria as { pWavesPresent: boolean; variableRR: boolean; appropriateRate: boolean } } : {}),
        ...(choice === 'probable_svt' && criteria ? { svtCriteria: criteria as { pWavesAbnormal: boolean; fixedRR: boolean; inappropriateRate: boolean; abruptRateChange: boolean } } : {}),
      },
    }));
    addIntervention('decision', `Pediatric rhythm: ${choice}`);
  }, [addIntervention]);

  // Treatment actions
  const giveAtropine = useCallback((dose: string, doseNumber: number) => {
    addIntervention('atropine', t('bradyTachy.treatmentGiven', { treatment: 'Atropine' }), dose, doseNumber, dose);
  }, [addIntervention, t]);

  const giveAdenosine = useCallback((dose: string, doseNumber: 1 | 2) => {
    addIntervention('adenosine', t('bradyTachy.treatmentGiven', { treatment: `Adenosine (dose ${doseNumber})` }), dose, doseNumber, dose);
  }, [addIntervention, t]);

  const giveCardioversion = useCallback((energy: string) => {
    addIntervention('cardioversion', t('bradyTachy.treatmentGiven', { treatment: 'Cardioversion' }), energy, undefined, energy);
  }, [addIntervention, t]);

  const giveDopamine = useCallback((dose: string) => {
    addIntervention('dopamine', t('bradyTachy.treatmentGiven', { treatment: 'Dopamine infusion' }), dose, undefined, dose);
  }, [addIntervention, t]);

  const giveEpinephrineInfusion = useCallback((dose: string) => {
    addIntervention('epi_infusion', t('bradyTachy.treatmentGiven', { treatment: 'Epinephrine infusion' }), dose, undefined, dose);
  }, [addIntervention, t]);

  const giveBetaBlocker = useCallback(() => {
    addIntervention('beta_blocker', t('bradyTachy.treatmentGiven', { treatment: 'Beta-blocker' }));
  }, [addIntervention, t]);

  const giveCalciumBlocker = useCallback(() => {
    addIntervention('calcium_blocker', t('bradyTachy.treatmentGiven', { treatment: 'Calcium channel blocker' }));
  }, [addIntervention, t]);

  const giveProcainamide = useCallback((dose: string) => {
    addIntervention('procainamide', t('bradyTachy.treatmentGiven', { treatment: 'Procainamide' }), dose, undefined, dose);
  }, [addIntervention, t]);

  const giveAmiodarone = useCallback((dose: string) => {
    addIntervention('amiodarone', t('bradyTachy.treatmentGiven', { treatment: 'Amiodarone' }), dose, undefined, dose);
  }, [addIntervention, t]);

  const performVagalManeuver = useCallback(() => {
    addIntervention('vagal_maneuver', t('bradyTachy.treatmentGiven', { treatment: 'Vagal maneuvers' }));
  }, [addIntervention, t]);

  // Switch to cardiac arrest
  const switchToArrest = useCallback(() => {
    const now = Date.now();
    setSession(prev => ({
      ...prev,
      outcome: 'switched_to_arrest',
      switchedToArrestTime: now,
      endTime: now,
      phase: 'session_ended',
    }));
    addIntervention('switch_to_arrest', t('bradyTachy.switchedToArrest'));
    // Note: We do NOT clear the session here - it will be cleared after merging in CodeScreen
    return true; // Signal to parent to switch to arrest mode
  }, [addIntervention, t]);

  // End session
  const endSession = useCallback((outcome: 'resolved' | 'transferred') => {
    const now = Date.now();
    setSession(prev => ({
      ...prev,
      outcome,
      endTime: now,
      phase: 'session_ended',
    }));
    addIntervention('note', `Session ended: ${outcome}`);
    // Clear the persisted session
    clearBradyTachySession();
  }, [addIntervention]);

  // Reset session
  const resetSession = useCallback(() => {
    setSession(createInitialBradyTachySession());
  }, []);

  // Move to next phase
  const setPhase = useCallback((phase: BradyTachyPhase) => {
    setSession(prev => ({
      ...prev,
      phase,
    }));
  }, []);

  return {
    session,
    actions: {
      setPatientGroup,
      setPatientWeight,
      setBranch,
      setStability,
      setQRSWidth,
      setRhythmRegular,
      setMonomorphic,
      setPedsSinusVsSVT,
      giveAtropine,
      giveAdenosine,
      giveCardioversion,
      giveDopamine,
      giveEpinephrineInfusion,
      giveBetaBlocker,
      giveCalciumBlocker,
      giveProcainamide,
      giveAmiodarone,
      performVagalManeuver,
      switchToArrest,
      endSession,
      resetSession,
      setPhase,
      addIntervention,
    },
  };
}

export type BradyTachyActions = ReturnType<typeof useBradyTachyLogic>['actions'];
