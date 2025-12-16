import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
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
  CodeOutcome,
  createInitialSession,
} from '@/types/acls';
import { saveSession as saveToIndexedDB, StoredSession } from '@/lib/sessionStorage';

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
  const { t } = useTranslation();
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
    const rhythmName = rhythm === 'vf_pvt' ? 'VF/pVT' : rhythm === 'asystole' ? t('rhythm.asystole') : 'PEA';
    
    setSession(prev => {
      const newPhase = isShockable ? 'shockable_pathway' : 'non_shockable_pathway';
      const interventions = [...prev.interventions, {
        id: crypto.randomUUID(),
        timestamp: now,
        type: 'rhythm_change' as const,
        details: t('interventions.rhythmIdentified', { rhythm: rhythmName }),
      }];

      return {
        ...prev,
        currentRhythm: rhythm,
        phase: newPhase,
        cprCycleStartTime: now,
        interventions,
      };
    });

    addIntervention('cpr_start', t('interventions.cprInitiated'));
  }, [addIntervention, t]);

  const startRhythmCheck = useCallback(() => {
    setIsInRhythmCheck(true);
    cprActiveRef.current = false;
    addIntervention('note', t('interventions.rhythmCheckPaused'));
  }, [addIntervention, t]);

  const completeRhythmCheckWithShock = useCallback(() => {
    const now = Date.now();
    const shockNumber = session.shockCount + 1;
    const energy = session.currentEnergy;
    
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

    addIntervention('shock', t('interventions.shockDelivered', { number: shockNumber, energy }), energy);
    setIsInRhythmCheck(false);
  }, [session.shockCount, session.currentEnergy, config.biphasicMaxJoules, config.biphasicMinJoules, addIntervention, t]);

  const completeRhythmCheckNoShock = useCallback((newRhythm: 'asystole' | 'pea') => {
    const now = Date.now();
    const rhythmName = newRhythm === 'asystole' ? t('rhythm.asystole') : 'PEA';
    
    setSession(prev => ({
      ...prev,
      currentRhythm: newRhythm,
      phase: 'non_shockable_pathway',
      cprCycleStartTime: now,
    }));

    addIntervention('rhythm_change', t('interventions.noShockResume', { rhythm: rhythmName }));
    setIsInRhythmCheck(false);
  }, [addIntervention, t]);

  const completeRhythmCheckResumeCPR = useCallback(() => {
    const now = Date.now();
    setSession(prev => ({
      ...prev,
      cprCycleStartTime: now,
    }));

    addIntervention('cpr_start', t('interventions.cprResumedSame'));
    setIsInRhythmCheck(false);
  }, [addIntervention, t]);

  const achieveROSC = useCallback(() => {
    const now = Date.now();
    setSession(prev => ({
      ...prev,
      phase: 'post_rosc',
      outcome: 'rosc',
      roscTime: now,
      endTime: now,
    }));

    addIntervention('rosc', t('interventions.roscAchieved'));
    setIsInRhythmCheck(false);
  }, [addIntervention, t]);

  const terminateCode = useCallback(() => {
    const now = Date.now();
    setSession(prev => ({
      ...prev,
      phase: 'code_ended',
      outcome: 'deceased',
      endTime: now,
    }));

    addIntervention('note', t('interventions.codeTerminated'));
    setIsInRhythmCheck(false);
  }, [addIntervention, t]);

  const giveEpinephrine = useCallback(() => {
    const now = Date.now();
    setSession(prev => ({
      ...prev,
      epinephrineCount: prev.epinephrineCount + 1,
      lastEpinephrineTime: now,
    }));

    addIntervention('epinephrine', t('interventions.epinephrineGiven', { dose: config.epinephrineDose }), config.epinephrineDose);
  }, [config.epinephrineDose, addIntervention, t]);

  const giveAmiodarone = useCallback(() => {
    const dose = session.amiodaroneCount === 0 ? config.amiodaroneFirstDose : config.amiodaroneSecondDose;
    
    setSession(prev => ({
      ...prev,
      amiodaroneCount: prev.amiodaroneCount + 1,
      lastAmiodaroneTime: Date.now(),
    }));

    addIntervention('amiodarone', t('interventions.amiodaroneGiven', { dose }), dose);
  }, [session.amiodaroneCount, config.amiodaroneFirstDose, config.amiodaroneSecondDose, addIntervention, t]);

  const giveLidocaine = useCallback(() => {
    setSession(prev => ({
      ...prev,
      lidocaineCount: prev.lidocaineCount + 1,
    }));

    addIntervention('lidocaine', t('interventions.lidocaineGiven', { dose: config.lidocaineDose }), config.lidocaineDose);
  }, [config.lidocaineDose, addIntervention, t]);

  const setAirway = useCallback((status: AirwayStatus) => {
    setSession(prev => ({
      ...prev,
      airwayStatus: status,
    }));

    const airwayText = status === 'advanced' ? t('interventions.airwayAdvanced') : status === 'bvm' ? t('interventions.airwayBvm') : t('interventions.airwayNone');
    addIntervention('airway', airwayText);
  }, [addIntervention, t]);

  const updateHsAndTs = useCallback((updates: Partial<HsAndTs>) => {
    setSession(prev => ({
      ...prev,
      hsAndTs: { ...prev.hsAndTs, ...updates },
    }));

    const checkedItems = Object.entries(updates)
      .filter(([, value]) => value)
      .map(([key]) => key);
    
    if (checkedItems.length > 0) {
      addIntervention('hs_ts_check', t('interventions.hsTsChecked', { items: checkedItems.join(', ') }));
    }
  }, [addIntervention, t]);

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

    addIntervention('note', t('interventions.codeEnded', { outcome }));
  }, [addIntervention, t]);

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

  const resumeSession = useCallback((savedSession: ACLSSession, savedTimerState: { totalElapsed: number; totalCPRTime: number; savedAt: number }) => {
    const now = Date.now();
    const elapsedSinceSave = now - savedTimerState.savedAt;
    
    // Recalculate times based on how long ago the session was saved
    const newSession = {
      ...savedSession,
      // Update cprCycleStartTime to account for time passed
      cprCycleStartTime: savedSession.cprCycleStartTime 
        ? savedSession.cprCycleStartTime + elapsedSinceSave 
        : null,
      // Update lastEpinephrineTime to account for time passed
      lastEpinephrineTime: savedSession.lastEpinephrineTime 
        ? savedSession.lastEpinephrineTime + elapsedSinceSave 
        : null,
    };
    
    setSession(newSession);
    setTimerState({
      cprCycleRemaining: config.rhythmCheckIntervalMs,
      epiRemaining: config.epinephrineIntervalMs,
      totalElapsed: savedTimerState.totalElapsed,
      totalCPRTime: savedTimerState.totalCPRTime,
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

  const saveSessionLocally = useCallback(async () => {
    const cprFraction = timerState.totalElapsed > 0 
      ? (timerState.totalCPRTime / timerState.totalElapsed) * 100
      : 0;

    const storedSession: StoredSession = {
      id: session.id,
      savedAt: Date.now(),
      startTime: session.startTime,
      endTime: session.endTime,
      outcome: session.outcome,
      duration: timerState.totalElapsed,
      totalCPRTime: timerState.totalCPRTime,
      cprFraction,
      shockCount: session.shockCount,
      epinephrineCount: session.epinephrineCount,
      amiodaroneCount: session.amiodaroneCount,
      interventions: session.interventions.map(i => ({
        timestamp: i.timestamp,
        type: i.type,
        details: i.details,
      })),
    };

    await saveToIndexedDB(storedSession);
    return storedSession;
  }, [session, timerState.totalCPRTime, timerState.totalElapsed]);

  // Command banner logic
  const getCommandBanner = useCallback((): CommandBanner => {
    const { phase, currentRhythm, shockCount, epinephrineCount, lastEpinephrineTime, amiodaroneCount } = session;
    const now = Date.now();
    const seconds = Math.ceil(timerState.cprCycleRemaining / 1000);

    if (phase === 'initial' || phase === 'rhythm_selection') {
      return {
        message: t('banner.identifyRhythm'),
        priority: 'critical',
        subMessage: t('banner.selectRhythm'),
      };
    }

    if (phase === 'post_rosc') {
      return {
        message: t('banner.roscAchieved'),
        priority: 'success',
        subMessage: t('banner.beginPostCare'),
      };
    }

    // During rhythm check
    if (isInRhythmCheck) {
      if (currentRhythm === 'vf_pvt') {
        return {
          message: t('banner.rhythmCheckVfPvt'),
          priority: 'critical',
          subMessage: t('banner.rhythmCheckVfPvtSub'),
        };
      }
      return {
        message: t('banner.rhythmCheckGeneric'),
        priority: 'warning',
        subMessage: t('banner.rhythmCheckGenericSub'),
      };
    }

    // Pre-shock alert - 15 seconds before rhythm check
    if (timerState.preShockAlert) {
      return {
        message: t('banner.preCharge'),
        priority: 'warning',
        subMessage: t('banner.preChargeSub', { seconds }),
      };
    }

    // Rhythm check due
    if (timerState.rhythmCheckDue) {
      return {
        message: t('banner.rhythmCheckNow'),
        priority: 'critical',
        subMessage: t('banner.rhythmCheckNowSub'),
      };
    }

    // Shockable pathway
    if (phase === 'shockable_pathway') {
      // Check for epinephrine timing (after shock #2)
      if (shockCount >= 2 && (!lastEpinephrineTime || (now - lastEpinephrineTime) >= config.epinephrineIntervalMs)) {
        return {
          message: t('banner.giveEpi'),
          priority: 'critical',
          subMessage: t('banner.giveEpiRepeat'),
        };
      }

      // Check for amiodarone timing (after shock #3)
      if (shockCount >= 3 && amiodaroneCount === 0) {
        return {
          message: t('banner.giveAmio300'),
          priority: 'critical',
          subMessage: t('banner.giveAmio300Sub'),
        };
      }

      return {
        message: t('banner.continueHQCPR'),
        priority: 'info',
        subMessage: t('banner.rhythmCheckIn', { seconds }),
      };
    }

    // Non-shockable pathway
    if (phase === 'non_shockable_pathway') {
      // Immediate epi for non-shockable
      if (epinephrineCount === 0) {
        return {
          message: t('banner.giveEpiNow'),
          priority: 'critical',
          subMessage: currentRhythm === 'asystole' ? t('banner.asystoleEpi') : t('banner.peaEpi'),
        };
      }

      // Subsequent epi doses
      if (lastEpinephrineTime && (now - lastEpinephrineTime) >= config.epinephrineIntervalMs) {
        return {
          message: t('banner.giveEpi'),
          priority: 'critical',
          subMessage: t('banner.giveEpiRepeat'),
        };
      }

      return {
        message: t('banner.continueHQCPR'),
        priority: 'info',
        subMessage: t('banner.considerHsTs', { seconds }),
      };
    }

    return {
      message: t('banner.aclsInProgress'),
      priority: 'info',
    };
  }, [session, timerState, isInRhythmCheck, config.epinephrineIntervalMs, t]);

  // Button state calculations
  const canGiveEpinephrine = (session.phase === 'shockable_pathway' || session.phase === 'non_shockable_pathway') && !isInRhythmCheck;
  const canGiveAmiodarone = session.phase === 'shockable_pathway' && session.shockCount >= 3 && session.amiodaroneCount < 2 && !isInRhythmCheck;
  const canGiveLidocaine = session.phase === 'shockable_pathway' && session.shockCount >= 3 && !isInRhythmCheck;
  const epiDue = session.lastEpinephrineTime 
    ? (Date.now() - session.lastEpinephrineTime) >= config.epinephrineIntervalMs 
    : session.phase !== 'initial' && session.phase !== 'rhythm_selection';

  const addNote = useCallback((note: string) => {
    addIntervention('note', t('interventions.noteAdded', { note }));
  }, [addIntervention, t]);

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
      terminateCode,
      updateHsAndTs,
      updatePostROSCChecklist,
      updatePostROSCVitals,
      endCode,
      resetSession,
      resumeSession,
      exportSession,
      saveSessionLocally,
      addIntervention,
      addNote,
    },
    buttonStates: {
      canGiveEpinephrine,
      canGiveAmiodarone,
      canGiveLidocaine,
      epiDue,
      rhythmCheckDue: timerState.rhythmCheckDue,
    },
    config,
  };
}
