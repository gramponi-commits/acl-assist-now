import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ACLSSession,
  ACLSConfig,
  DEFAULT_ACLS_CONFIG,
  RhythmType,
  AirwayStatus,
  Intervention,
  HsAndTs,
  PostROSCChecklist,
  PostROSCVitals,
  createInitialSession,
} from '@/types/acls';

interface CommandBanner {
  message: string;
  priority: 'critical' | 'warning' | 'info' | 'success';
  subMessage?: string;
}

interface TimerState {
  cprRemaining: number;
  epiRemaining: number;
  preShockAlert: boolean;
}

export function useACLSLogic(config: ACLSConfig = DEFAULT_ACLS_CONFIG) {
  const [session, setSession] = useState<ACLSSession>(createInitialSession);
  const [timerState, setTimerState] = useState<TimerState>({
    cprRemaining: config.rhythmCheckIntervalMs,
    epiRemaining: config.epinephrineIntervalMs,
    preShockAlert: false,
  });
  const intervalRef = useRef<number | null>(null);

  // Timer logic
  useEffect(() => {
    if (session.phase === 'shockable_pathway' || session.phase === 'non_shockable_pathway') {
      intervalRef.current = window.setInterval(() => {
        const now = Date.now();
        
        setTimerState(prev => {
          const cprRemaining = session.cprCycleStartTime 
            ? Math.max(0, config.rhythmCheckIntervalMs - (now - session.cprCycleStartTime))
            : config.rhythmCheckIntervalMs;
          
          const epiRemaining = session.lastEpinephrineTime
            ? Math.max(0, config.epinephrineIntervalMs - (now - session.lastEpinephrineTime))
            : 0;
          
          const preShockAlert = session.phase === 'shockable_pathway' && 
            cprRemaining > 0 && 
            cprRemaining <= config.preShockAlertAdvanceMs;

          return { cprRemaining, epiRemaining, preShockAlert };
        });
      }, 100);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [session.phase, session.cprCycleStartTime, session.lastEpinephrineTime, config]);

  const addIntervention = useCallback((type: Intervention['type'], details: string, value?: number | string) => {
    const intervention: Intervention = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type,
      details,
      value,
    };
    setSession(prev => ({
      ...prev,
      interventions: [...prev.interventions, intervention],
    }));
  }, []);

  const selectRhythm = useCallback((rhythm: RhythmType) => {
    const now = Date.now();
    const isShockable = rhythm === 'vf_pvt';
    
    setSession(prev => {
      const newPhase = isShockable ? 'shockable_pathway' : 'non_shockable_pathway';
      const interventions = [...prev.interventions, {
        id: crypto.randomUUID(),
        timestamp: now,
        type: 'rhythm_change' as const,
        details: `Rhythm identified: ${rhythm === 'vf_pvt' ? 'VF/pVT' : rhythm === 'asystole' ? 'Asystole' : 'PEA'}`,
      }];

      // For non-shockable, immediately flag for epinephrine
      return {
        ...prev,
        currentRhythm: rhythm,
        phase: newPhase,
        cprCycleStartTime: now,
        interventions,
      };
    });

    addIntervention('cpr_start', 'CPR initiated');
  }, [addIntervention]);

  const changeRhythm = useCallback((newRhythm: RhythmType) => {
    if (newRhythm === session.currentRhythm) return;
    
    const isShockable = newRhythm === 'vf_pvt';
    const wasShockable = session.currentRhythm === 'vf_pvt';
    
    setSession(prev => ({
      ...prev,
      currentRhythm: newRhythm,
      phase: isShockable ? 'shockable_pathway' : 'non_shockable_pathway',
      cprCycleStartTime: Date.now(),
    }));

    addIntervention('rhythm_change', 
      `Rhythm changed: ${wasShockable ? 'Shockable' : 'Non-shockable'} → ${isShockable ? 'VF/pVT' : newRhythm === 'asystole' ? 'Asystole' : 'PEA'}`
    );
  }, [session.currentRhythm, addIntervention]);

  const deliverShock = useCallback(() => {
    const now = Date.now();
    setSession(prev => {
      const newShockCount = prev.shockCount + 1;
      const newEnergy = newShockCount >= 2 ? config.biphasicMaxJoules : config.biphasicMinJoules;
      
      return {
        ...prev,
        shockCount: newShockCount,
        currentEnergy: newEnergy,
        cprCycleStartTime: now,
      };
    });

    addIntervention('shock', `Shock #${session.shockCount + 1} delivered`, session.currentEnergy);
  }, [session.shockCount, session.currentEnergy, config.biphasicMaxJoules, config.biphasicMinJoules, addIntervention]);

  const giveEpinephrine = useCallback(() => {
    const now = Date.now();
    setSession(prev => ({
      ...prev,
      epinephrineCount: prev.epinephrineCount + 1,
      lastEpinephrineTime: now,
    }));

    addIntervention('epinephrine', `Epinephrine ${config.epinephrineDose}mg IV/IO`, config.epinephrineDose);
  }, [config.epinephrineDose, addIntervention]);

  const giveAmiodarone = useCallback(() => {
    const dose = session.amiodaroneCount === 0 ? config.amiodaroneFirstDose : config.amiodaroneSecondDose;
    
    setSession(prev => ({
      ...prev,
      amiodaroneCount: prev.amiodaroneCount + 1,
      lastAmiodaroneTime: Date.now(),
    }));

    addIntervention('amiodarone', `Amiodarone ${dose}mg IV/IO`, dose);
  }, [session.amiodaroneCount, config.amiodaroneFirstDose, config.amiodaroneSecondDose, addIntervention]);

  const giveLidocaine = useCallback(() => {
    setSession(prev => ({
      ...prev,
      lidocaineCount: prev.lidocaineCount + 1,
    }));

    addIntervention('lidocaine', `Lidocaine ${config.lidocaineDose}mg IV/IO`, config.lidocaineDose);
  }, [config.lidocaineDose, addIntervention]);

  const setAirway = useCallback((status: AirwayStatus) => {
    setSession(prev => ({
      ...prev,
      airwayStatus: status,
    }));

    addIntervention('airway', `Airway: ${status === 'advanced' ? 'Advanced airway placed' : status === 'bvm' ? 'BVM ventilation' : 'No airway'}`);
  }, [addIntervention]);

  const achieveROSC = useCallback(() => {
    const now = Date.now();
    setSession(prev => ({
      ...prev,
      phase: 'post_rosc',
      roscTime: now,
    }));

    addIntervention('rosc', 'ROSC achieved!');
  }, [addIntervention]);

  const updateHsAndTs = useCallback((updates: Partial<HsAndTs>) => {
    setSession(prev => ({
      ...prev,
      hsAndTs: { ...prev.hsAndTs, ...updates },
    }));

    const checkedItems = Object.entries(updates)
      .filter(([, value]) => value)
      .map(([key]) => key);
    
    if (checkedItems.length > 0) {
      addIntervention('hs_ts_check', `H's & T's checked: ${checkedItems.join(', ')}`);
    }
  }, [addIntervention]);

  const updatePostROSCChecklist = useCallback((updates: Partial<PostROSCChecklist>) => {
    setSession(prev => ({
      ...prev,
      postROSCChecklist: { ...prev.postROSCChecklist, ...updates },
    }));
  }, []);

  const updatePostROSCVitals = useCallback((updates: Partial<PostROSCVitals>) => {
    setSession(prev => ({
      ...prev,
      postROSCVitals: { ...prev.postROSCVitals, ...updates },
    }));
  }, []);

  const startNewCPRCycle = useCallback(() => {
    setSession(prev => ({
      ...prev,
      cprCycleStartTime: Date.now(),
    }));
  }, []);

  const endCode = useCallback((outcome: 'rosc' | 'deceased' | 'transferred') => {
    setSession(prev => ({
      ...prev,
      phase: 'code_ended',
      endTime: Date.now(),
    }));

    addIntervention('note', `Code ended: ${outcome}`);
  }, [addIntervention]);

  const resetSession = useCallback(() => {
    setSession(createInitialSession());
    setTimerState({
      cprRemaining: config.rhythmCheckIntervalMs,
      epiRemaining: config.epinephrineIntervalMs,
      preShockAlert: false,
    });
  }, [config]);

  const exportSession = useCallback(() => {
    const dataStr = JSON.stringify(session, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `acls-session-${new Date(session.startTime).toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [session]);

  // Command banner logic
  const getCommandBanner = useCallback((): CommandBanner => {
    const { phase, currentRhythm, shockCount, epinephrineCount, lastEpinephrineTime, amiodaroneCount } = session;
    const now = Date.now();

    if (phase === 'initial' || phase === 'rhythm_selection') {
      return {
        message: 'IDENTIFY RHYTHM',
        priority: 'critical',
        subMessage: 'Select initial rhythm to begin ACLS protocol',
      };
    }

    if (phase === 'post_rosc') {
      return {
        message: 'ROSC ACHIEVED',
        priority: 'success',
        subMessage: 'Begin post-cardiac arrest care',
      };
    }

    // Pre-shock alert
    if (timerState.preShockAlert && currentRhythm === 'vf_pvt') {
      return {
        message: '⚡ PREPARE FOR SHOCK',
        priority: 'warning',
        subMessage: 'Pre-charge defibrillator - rhythm check in 15 seconds',
      };
    }

    // Shockable pathway
    if (phase === 'shockable_pathway') {
      if (timerState.cprRemaining === 0) {
        return {
          message: 'RHYTHM CHECK - DELIVER SHOCK IF VF/pVT',
          priority: 'critical',
          subMessage: `Shock #${shockCount + 1} ready at ${session.currentEnergy}J`,
        };
      }

      // Check for epinephrine timing (after shock #2)
      if (shockCount >= 2 && (!lastEpinephrineTime || (now - lastEpinephrineTime) >= config.epinephrineIntervalMs)) {
        return {
          message: 'GIVE EPINEPHRINE 1mg IV/IO',
          priority: 'critical',
          subMessage: 'Due now - repeat every 4 minutes',
        };
      }

      // Check for amiodarone timing (after shock #3)
      if (shockCount >= 3 && amiodaroneCount === 0) {
        return {
          message: 'GIVE AMIODARONE 300mg IV/IO',
          priority: 'critical',
          subMessage: 'First dose - may repeat 150mg once',
        };
      }

      return {
        message: 'CONTINUE HIGH-QUALITY CPR',
        priority: 'info',
        subMessage: `Rhythm check in ${Math.ceil(timerState.cprRemaining / 1000)}s | Shock #${shockCount + 1} pending`,
      };
    }

    // Non-shockable pathway
    if (phase === 'non_shockable_pathway') {
      // Immediate epi for non-shockable
      if (epinephrineCount === 0) {
        return {
          message: 'GIVE EPINEPHRINE 1mg IV/IO NOW',
          priority: 'critical',
          subMessage: currentRhythm === 'asystole' ? 'Asystole - Epi immediately' : 'PEA - Epi immediately',
        };
      }

      // Subsequent epi doses
      if (lastEpinephrineTime && (now - lastEpinephrineTime) >= config.epinephrineIntervalMs) {
        return {
          message: 'GIVE EPINEPHRINE 1mg IV/IO',
          priority: 'critical',
          subMessage: 'Due now - repeat every 4 minutes',
        };
      }

      if (timerState.cprRemaining === 0) {
        return {
          message: 'RHYTHM CHECK',
          priority: 'warning',
          subMessage: 'Check for shockable rhythm - if VF/pVT, deliver shock',
        };
      }

      return {
        message: 'CONTINUE HIGH-QUALITY CPR',
        priority: 'info',
        subMessage: `Rhythm check in ${Math.ceil(timerState.cprRemaining / 1000)}s | Consider H's & T's`,
      };
    }

    return {
      message: 'ACLS IN PROGRESS',
      priority: 'info',
    };
  }, [session, timerState, config.epinephrineIntervalMs]);

  // Button state calculations
  const canDeliverShock = session.phase === 'shockable_pathway';
  const canGiveEpinephrine = session.phase === 'shockable_pathway' || session.phase === 'non_shockable_pathway';
  const canGiveAmiodarone = session.phase === 'shockable_pathway' && session.shockCount >= 3 && session.amiodaroneCount < 2;
  const epiDue = session.lastEpinephrineTime 
    ? (Date.now() - session.lastEpinephrineTime) >= config.epinephrineIntervalMs 
    : session.phase !== 'initial' && session.phase !== 'rhythm_selection';

  return {
    session,
    timerState,
    commandBanner: getCommandBanner(),
    actions: {
      selectRhythm,
      changeRhythm,
      deliverShock,
      giveEpinephrine,
      giveAmiodarone,
      giveLidocaine,
      setAirway,
      achieveROSC,
      updateHsAndTs,
      updatePostROSCChecklist,
      updatePostROSCVitals,
      startNewCPRCycle,
      endCode,
      resetSession,
      exportSession,
      addIntervention,
    },
    buttonStates: {
      canDeliverShock,
      canGiveEpinephrine,
      canGiveAmiodarone,
      epiDue,
    },
    config,
  };
}
