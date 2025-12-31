import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ACLSSession,
  BradyTachyPhase,
  BradyTachyBranch,
  PathwayMode,
  StabilityStatus,
  QRSWidth,
  RhythmRegularity,
  PedsSinusVsSVT,
  BradyTachyDecisionContext,
  Intervention,
} from '@/types/acls';

interface UseBradyTachyLogicProps {
  session: ACLSSession;
  onUpdateSession: (session: ACLSSession) => void;
}

export function useBradyTachyLogic({ session, onUpdateSession }: UseBradyTachyLogicProps) {
  const { t } = useTranslation();
  
  // UI-only state for Brady/Tachy phase navigation
  const [uiPhase, setUiPhase] = useState<BradyTachyPhase>('patient_selection');
  
  // Decision context stored in UI state (will be included in interventions)
  const [decisionContext, setDecisionContext] = useState<BradyTachyDecisionContext>({
    patientGroup: session.pathwayMode,
    weightKg: session.patientWeight,
    branch: null,
    stability: null,
    qrsWidth: null,
    rhythmRegular: null,
    monomorphic: null,
    pedsSinusVsSVTChoice: null,
  });

  // Add intervention with Brady/Tachy metadata
  const addIntervention = useCallback((
    type: Intervention['type'],
    details: string,
    value?: number | string,
    actionLabelKey?: string,
    doseStep?: number,
    displayedDoseText?: string,
    calculatedDose?: string | null
  ) => {
    const intervention: Intervention = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type,
      details,
      value,
      module: 'bradytachy',
      bradyTachyContext: {
        branch: decisionContext.branch === 'bradycardia' ? 'brady' : decisionContext.branch === 'tachycardia' ? 'tachy' : undefined,
        stability: decisionContext.stability || undefined,
        qrsWidth: decisionContext.qrsWidth || undefined,
        rhythmRegular: decisionContext.rhythmRegular !== null ? decisionContext.rhythmRegular : undefined,
        monomorphic: decisionContext.monomorphic !== null ? decisionContext.monomorphic : undefined,
        pedsSinusVsSVT: decisionContext.pedsSinusVsSVTChoice || undefined,
        actionLabelKey,
        doseStep,
        displayedDoseText,
        calculatedDose,
      },
    };

    const updatedSession = {
      ...session,
      interventions: [...session.interventions, intervention],
    };
    
    onUpdateSession(updatedSession);
  }, [session, decisionContext, onUpdateSession]);

  // Set patient group (adult/pediatric)
  const setPatientGroup = useCallback((group: PathwayMode) => {
    setDecisionContext(prev => ({
      ...prev,
      patientGroup: group,
    }));
    
    const updatedSession = {
      ...session,
      pathwayMode: group,
    };
    onUpdateSession(updatedSession);
  }, [session, onUpdateSession]);

  // Set patient weight
  const setPatientWeight = useCallback((weight: number | null) => {
    setDecisionContext(prev => ({
      ...prev,
      weightKg: weight,
    }));
    
    const updatedSession = {
      ...session,
      patientWeight: weight,
    };
    onUpdateSession(updatedSession);
    
    if (weight) {
      addIntervention('note', t('interventions.weightSet', { weight }));
    }
  }, [session, onUpdateSession, addIntervention, t]);

  // Set branch (brady/tachy)
  const setBranch = useCallback((branch: BradyTachyBranch) => {
    setUiPhase(branch === 'bradycardia' ? 'bradycardia_assessment' : 'tachycardia_assessment');
    setDecisionContext(prev => ({
      ...prev,
      branch,
    }));
    addIntervention('decision', `Branch selected: ${branch}`);
  }, [addIntervention]);

  // Set stability status
  const setStability = useCallback((stability: StabilityStatus) => {
    setUiPhase(decisionContext.branch === 'bradycardia' 
      ? 'bradycardia_treatment' 
      : 'tachycardia_treatment');
    setDecisionContext(prev => ({
      ...prev,
      stability,
    }));
    addIntervention('assessment', `Stability: ${stability}`);
  }, [decisionContext.branch, addIntervention]);

  // Set QRS width
  const setQRSWidth = useCallback((qrsWidth: QRSWidth) => {
    setDecisionContext(prev => ({
      ...prev,
      qrsWidth,
    }));
    addIntervention('assessment', `QRS: ${qrsWidth}`);
  }, [addIntervention]);

  // Set rhythm regularity
  const setRhythmRegular = useCallback((regular: RhythmRegularity) => {
    setDecisionContext(prev => ({
      ...prev,
      rhythmRegular: regular === 'regular',
    }));
    addIntervention('assessment', `Rhythm: ${regular}`);
  }, [addIntervention]);

  // Set monomorphic status
  const setMonomorphic = useCallback((monomorphic: boolean) => {
    setDecisionContext(prev => ({
      ...prev,
      monomorphic,
    }));
    addIntervention('assessment', `Monomorphic: ${monomorphic ? 'yes' : 'no'}`);
  }, [addIntervention]);

  // Set pediatric sinus vs SVT choice
  const setPedsSinusVsSVT = useCallback((choice: PedsSinusVsSVT) => {
    setUiPhase('tachycardia_treatment');
    setDecisionContext(prev => ({
      ...prev,
      pedsSinusVsSVTChoice: choice,
    }));
    addIntervention('decision', `Pediatric rhythm: ${choice}`);
  }, [addIntervention]);

  // Select pediatric sinus tachycardia
  const selectPediatricSinusTachy = useCallback(() => {
    setDecisionContext(prev => ({
      ...prev,
      pedsSinusVsSVTChoice: 'probable_sinus',
    }));
    addIntervention('decision', 'Pediatric sinus tachycardia identified - treat cause');
  }, [addIntervention]);

  // Advance to compromise assessment phase
  const advanceToCompromiseAssessment = useCallback(() => {
    setUiPhase('tachycardia_compromise_assessment');
    addIntervention('decision', 'Concerning rhythm - proceeding to compromise assessment');
  }, [addIntervention]);

  // Treatment actions
  const giveAtropine = useCallback((dose: string, doseNumber: number) => {
    addIntervention('atropine', t('bradyTachy.treatmentGiven', { treatment: 'Atropine' }), dose, 'atropine', doseNumber, dose);
  }, [addIntervention, t]);

  const giveAdenosine = useCallback((dose: string, doseNumber: 1 | 2) => {
    addIntervention('adenosine', t('bradyTachy.treatmentGiven', { treatment: `Adenosine (dose ${doseNumber})` }), dose, 'adenosine', doseNumber, dose);
  }, [addIntervention, t]);

  const giveCardioversion = useCallback((energy: string) => {
    addIntervention('cardioversion', t('bradyTachy.treatmentGiven', { treatment: 'Cardioversion' }), energy, 'cardioversion', undefined, energy);
  }, [addIntervention, t]);

  const giveDopamine = useCallback((dose: string) => {
    addIntervention('dopamine', t('bradyTachy.treatmentGiven', { treatment: 'Dopamine infusion' }), dose, 'dopamine', undefined, dose);
  }, [addIntervention, t]);

  const giveEpinephrineInfusion = useCallback((dose: string) => {
    addIntervention('epi_infusion', t('bradyTachy.treatmentGiven', { treatment: 'Epinephrine infusion' }), dose, 'epi_infusion', undefined, dose);
  }, [addIntervention, t]);

  const giveBetaBlocker = useCallback(() => {
    addIntervention('beta_blocker', t('bradyTachy.treatmentGiven', { treatment: 'Beta-blocker' }), undefined, 'beta_blocker');
  }, [addIntervention, t]);

  const giveCalciumBlocker = useCallback(() => {
    addIntervention('calcium_blocker', t('bradyTachy.treatmentGiven', { treatment: 'Calcium channel blocker' }), undefined, 'calcium_blocker');
  }, [addIntervention, t]);

  const giveProcainamide = useCallback((dose: string) => {
    addIntervention('procainamide', t('bradyTachy.treatmentGiven', { treatment: 'Procainamide' }), dose, 'procainamide', undefined, dose);
  }, [addIntervention, t]);

  const giveAmiodarone = useCallback((dose: string) => {
    addIntervention('amiodarone', t('bradyTachy.treatmentGiven', { treatment: 'Amiodarone' }), dose, 'amiodarone', undefined, dose);
  }, [addIntervention, t]);

  const performVagalManeuver = useCallback(() => {
    addIntervention('vagal_maneuver', t('bradyTachy.treatmentGiven', { treatment: 'Vagal maneuvers' }), undefined, 'vagal_maneuver');
  }, [addIntervention, t]);

  // Switch to cardiac arrest - returns the current session for continuation
  const switchToArrest = useCallback((): ACLSSession => {
    addIntervention('switch_to_arrest', t('bradyTachy.switchedToArrest'));
    setUiPhase('session_ended');
    
    // Return the current session for continuation in arrest mode
    return session;
  }, [session, addIntervention, t]);

  // End session
  const endSession = useCallback((outcome: 'resolved' | 'transferred') => {
    const updatedSession = {
      ...session,
      outcome,
      endTime: Date.now(),
      phase: 'bradytachy_ended' as const,
    };
    onUpdateSession(updatedSession);
    addIntervention('note', `Session ended: ${outcome}`);
    setUiPhase('session_ended');
  }, [session, onUpdateSession, addIntervention]);

  // Reset session (for UI navigation)
  const resetSession = useCallback(() => {
    setUiPhase('patient_selection');
    setDecisionContext({
      patientGroup: 'adult',
      weightKg: null,
      branch: null,
      stability: null,
      qrsWidth: null,
      rhythmRegular: null,
      monomorphic: null,
      pedsSinusVsSVTChoice: null,
    });
  }, []);

  // Move to next phase
  const setPhase = useCallback((phase: BradyTachyPhase) => {
    setUiPhase(phase);
  }, []);

  return {
    // Expose UI phase and decision context
    uiPhase,
    decisionContext,
    // Actions
    actions: {
      setPatientGroup,
      setPatientWeight,
      setBranch,
      setStability,
      setQRSWidth,
      setRhythmRegular,
      setMonomorphic,
      setPedsSinusVsSVT,
      selectPediatricSinusTachy,
      advanceToCompromiseAssessment,
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
