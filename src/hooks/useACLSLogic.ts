import { useState, useCallback, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
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
  cprCycleRemaining: number;
  epiRemaining: number;
  totalElapsed: number;
  totalCPRTime: number;
  preShockAlert: boolean;
  rhythmCheckDue: boolean;
}

export function useACLSLogic(config: ACLSConfig = DEFAULT_ACLS_CONFIG) {
  const [session, setSession] = useState<ACLSSession>(createInitialSession);
  const [timerState, setTimerState] = useState<TimerState>({
    cprCycleRemaining: config.rhythmCheckIntervalMs,
    epiRemaining: config.epinephrineIntervalMs,
    totalElapsed: 0,
    totalCPRTime: 0,
    preShockAlert: false,
    rhythmCheckDue: false,
  });
  const [isInRhythmCheck, setIsInRhythmCheck] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const cprActiveRef = useRef<boolean>(false);
  const lastTickRef = useRef<number>(Date.now());

  // Timer logic
  useEffect(() => {
    const isActive = session.phase === 'shockable_pathway' || session.phase === 'non_shockable_pathway';
    
    if (isActive && !isInRhythmCheck) {
      cprActiveRef.current = true;
      lastTickRef.current = Date.now();
      
      intervalRef.current = window.setInterval(() => {
        const now = Date.now();
        const delta = now - lastTickRef.current;
        lastTickRef.current = now;
        
        setTimerState(prev => {
          const cprCycleRemaining = session.cprCycleStartTime 
            ? Math.max(0, config.rhythmCheckIntervalMs - (now - session.cprCycleStartTime))
            : config.rhythmCheckIntervalMs;
          
          const epiRemaining = session.lastEpinephrineTime
            ? Math.max(0, config.epinephrineIntervalMs - (now - session.lastEpinephrineTime))
            : (session.phase === 'non_shockable_pathway' && session.epinephrineCount === 0) ? 0 : prev.epiRemaining;
          
          const preShockAlert = cprCycleRemaining > 0 && 
            cprCycleRemaining <= config.preShockAlertAdvanceMs;
          
          const rhythmCheckDue = cprCycleRemaining === 0;

          // Only accumulate CPR time when actively doing CPR (not in rhythm check)
          const totalCPRTime = cprActiveRef.current ? prev.totalCPRTime + delta : prev.totalCPRTime;

          return { 
            cprCycleRemaining, 
            epiRemaining, 
            preShockAlert,
            rhythmCheckDue,
            totalElapsed: now - session.startTime,
            totalCPRTime,
          };
        });
      }, 100);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        cprActiveRef.current = false;
      };
    } else {
      cprActiveRef.current = false;
    }
  }, [session.phase, session.cprCycleStartTime, session.lastEpinephrineTime, session.startTime, session.epinephrineCount, isInRhythmCheck, config]);

  // Update total elapsed even during rhythm check
  useEffect(() => {
    if (isInRhythmCheck) {
      const interval = window.setInterval(() => {
        setTimerState(prev => ({
          ...prev,
          totalElapsed: Date.now() - session.startTime,
        }));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isInRhythmCheck, session.startTime]);

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

  const startRhythmCheck = useCallback(() => {
    setIsInRhythmCheck(true);
    cprActiveRef.current = false;
    addIntervention('note', 'Rhythm check - CPR paused');
  }, [addIntervention]);

  const completeRhythmCheckWithShock = useCallback(() => {
    const now = Date.now();
    setSession(prev => {
      const newShockCount = prev.shockCount + 1;
      const newEnergy = newShockCount >= 2 ? config.biphasicMaxJoules : config.biphasicMinJoules;
      
      return {
        ...prev,
        shockCount: newShockCount,
        currentEnergy: newEnergy,
        cprCycleStartTime: now,
        phase: 'shockable_pathway',
        currentRhythm: 'vf_pvt',
      };
    });

    addIntervention('shock', `Shock #${session.shockCount + 1} delivered at ${session.currentEnergy}J`, session.currentEnergy);
    setIsInRhythmCheck(false);
  }, [session.shockCount, session.currentEnergy, config.biphasicMaxJoules, config.biphasicMinJoules, addIntervention]);

  const completeRhythmCheckNoShock = useCallback((newRhythm: 'asystole' | 'pea') => {
    const now = Date.now();
    setSession(prev => ({
      ...prev,
      currentRhythm: newRhythm,
      phase: 'non_shockable_pathway',
      cprCycleStartTime: now,
    }));

    addIntervention('rhythm_change', `No shock - ${newRhythm === 'asystole' ? 'Asystole' : 'PEA'} - Resume CPR`);
    setIsInRhythmCheck(false);
  }, [addIntervention]);

  const completeRhythmCheckResumeCPR = useCallback(() => {
    const now = Date.now();
    setSession(prev => ({
      ...prev,
      cprCycleStartTime: now,
    }));

    addIntervention('cpr_start', 'CPR resumed - same rhythm');
    setIsInRhythmCheck(false);
  }, [addIntervention]);

  const achieveROSC = useCallback(() => {
    const now = Date.now();
    setSession(prev => ({
      ...prev,
      phase: 'post_rosc',
      roscTime: now,
    }));

    addIntervention('rosc', 'ROSC achieved - Pulse and rhythm detected!');
    setIsInRhythmCheck(false);
  }, [addIntervention]);

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
      cprCycleRemaining: config.rhythmCheckIntervalMs,
      epiRemaining: config.epinephrineIntervalMs,
      totalElapsed: 0,
      totalCPRTime: 0,
      preShockAlert: false,
      rhythmCheckDue: false,
    });
    setIsInRhythmCheck(false);
  }, [config]);

  const exportSession = useCallback(() => {
    const pdf = new jsPDF();
    const startDate = new Date(session.startTime);
    const cprFraction = timerState.totalElapsed > 0 
      ? ((timerState.totalCPRTime / timerState.totalElapsed) * 100).toFixed(1)
      : 'N/A';
    
    const formatTime = (ms: number) => {
      const totalSec = Math.floor(ms / 1000);
      const min = Math.floor(totalSec / 60);
      const sec = totalSec % 60;
      return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };
    
    const formatDeviceTime = (timestamp: number) => {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ACLS Code Session Report', 105, 20, { align: 'center' });
    
    // Session info
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    let y = 35;
    pdf.text(`Date: ${startDate.toLocaleDateString()}`, 20, y);
    pdf.text(`Code Start Time: ${formatDeviceTime(session.startTime)}`, 20, y + 7);
    pdf.text(`Total Duration: ${formatTime(timerState.totalElapsed)}`, 20, y + 14);
    pdf.text(`Total CPR Time: ${formatTime(timerState.totalCPRTime)}`, 20, y + 21);
    pdf.text(`CPR Fraction: ${cprFraction}%`, 20, y + 28);
    
    // Summary stats
    y = 75;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Summary', 20, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Final Rhythm: ${session.currentRhythm || 'N/A'}`, 20, y + 10);
    pdf.text(`Outcome: ${session.phase === 'post_rosc' ? 'ROSC Achieved' : session.phase}`, 20, y + 17);
    pdf.text(`Total Shocks: ${session.shockCount}`, 20, y + 24);
    pdf.text(`Epinephrine Doses: ${session.epinephrineCount}`, 20, y + 31);
    pdf.text(`Amiodarone Doses: ${session.amiodaroneCount}`, 20, y + 38);
    pdf.text(`Airway: ${session.airwayStatus}`, 20, y + 45);
    
    // Interventions Timeline
    y = 135;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Interventions Timeline', 20, y);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    y += 10;
    pdf.text('Device Time', 20, y);
    pdf.text('Code Min', 60, y);
    pdf.text('Intervention', 90, y);
    
    pdf.setFont('helvetica', 'normal');
    y += 7;
    
    session.interventions.forEach((intervention) => {
      if (y > 270) {
        pdf.addPage();
        y = 20;
      }
      const relativeTime = intervention.timestamp - session.startTime;
      pdf.text(formatDeviceTime(intervention.timestamp), 20, y);
      pdf.text(formatTime(relativeTime), 60, y);
      const details = intervention.details ? ` (${intervention.details})` : '';
      pdf.text(`${intervention.type}${details}`, 90, y);
      y += 6;
    });
    
    // Footer
    pdf.setFontSize(8);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 105, 290, { align: 'center' });
    
    pdf.save(`acls-session-${startDate.toISOString().split('T')[0]}.pdf`);
  }, [session, timerState.totalCPRTime, timerState.totalElapsed]);

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

    // During rhythm check
    if (isInRhythmCheck) {
      if (currentRhythm === 'vf_pvt') {
        return {
          message: '⚡ RHYTHM CHECK - VF/pVT?',
          priority: 'critical',
          subMessage: 'If VF/pVT: SHOCK | If not: Select new rhythm | If pulse: ROSC',
        };
      }
      return {
        message: '🔍 RHYTHM CHECK',
        priority: 'warning',
        subMessage: 'Check rhythm and pulse. If VF/pVT: SHOCK | If pulse: ROSC',
      };
    }

    // Pre-shock alert - 15 seconds before rhythm check
    if (timerState.preShockAlert) {
      return {
        message: '⚡ PRE-CHARGE DEFIBRILLATOR',
        priority: 'warning',
        subMessage: `Rhythm check in ${Math.ceil(timerState.cprCycleRemaining / 1000)}s - Prepare to analyze rhythm`,
      };
    }

    // Rhythm check due
    if (timerState.rhythmCheckDue) {
      return {
        message: '🔍 RHYTHM CHECK NOW',
        priority: 'critical',
        subMessage: 'Tap "Rhythm Check" to pause CPR and analyze',
      };
    }

    // Shockable pathway
    if (phase === 'shockable_pathway') {
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
        subMessage: `Rhythm check in ${Math.ceil(timerState.cprCycleRemaining / 1000)}s`,
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

      return {
        message: 'CONTINUE HIGH-QUALITY CPR',
        priority: 'info',
        subMessage: `Rhythm check in ${Math.ceil(timerState.cprCycleRemaining / 1000)}s | Consider H's & T's`,
      };
    }

    return {
      message: 'ACLS IN PROGRESS',
      priority: 'info',
    };
  }, [session, timerState, isInRhythmCheck, config.epinephrineIntervalMs]);

  // Button state calculations
  const canGiveEpinephrine = (session.phase === 'shockable_pathway' || session.phase === 'non_shockable_pathway') && !isInRhythmCheck;
  const canGiveAmiodarone = session.phase === 'shockable_pathway' && session.shockCount >= 3 && session.amiodaroneCount < 2 && !isInRhythmCheck;
  const epiDue = session.lastEpinephrineTime 
    ? (Date.now() - session.lastEpinephrineTime) >= config.epinephrineIntervalMs 
    : session.phase !== 'initial' && session.phase !== 'rhythm_selection';

  return {
    session,
    timerState,
    isInRhythmCheck,
    commandBanner: getCommandBanner(),
    actions: {
      selectRhythm,
      startRhythmCheck,
      completeRhythmCheckWithShock,
      completeRhythmCheckNoShock,
      completeRhythmCheckResumeCPR,
      giveEpinephrine,
      giveAmiodarone,
      giveLidocaine,
      setAirway,
      achieveROSC,
      updateHsAndTs,
      updatePostROSCChecklist,
      updatePostROSCVitals,
      endCode,
      resetSession,
      exportSession,
      addIntervention,
    },
    buttonStates: {
      canGiveEpinephrine,
      canGiveAmiodarone,
      epiDue,
      rhythmCheckDue: timerState.rhythmCheckDue,
    },
    config,
  };
}
