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

    const outcomeText = session.outcome === 'rosc' ? 'ROSC' : session.outcome === 'deceased' ? 'Deceased' : 'In Progress';
    const rhythmText = session.currentRhythm === 'vf_pvt' ? 'VF/pVT' : session.currentRhythm === 'asystole' ? 'Asystole' : session.currentRhythm === 'pea' ? 'PEA' : 'N/A';
    const airwayText = session.airwayStatus === 'advanced' ? 'Advanced (ETT/SGA)' : session.airwayStatus === 'bvm' ? 'BVM' : 'Not documented';

    // Header with background
    pdf.setFillColor(220, 38, 38); // Red header
    pdf.rect(0, 0, 210, 35, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ACLS CODE REPORT', 105, 18, { align: 'center' });
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${startDate.toLocaleDateString()} - ${formatDeviceTime(session.startTime)}`, 105, 28, { align: 'center' });
    
    // Reset text color
    pdf.setTextColor(0, 0, 0);
    
    // Key metrics boxes
    let y = 45;
    const boxWidth = 42;
    const boxHeight = 25;
    const boxGap = 5;
    const startX = 15;
    
    // Outcome box
    const outcomeColor = session.outcome === 'rosc' ? [34, 197, 94] : session.outcome === 'deceased' ? [107, 114, 128] : [234, 179, 8];
    pdf.setFillColor(outcomeColor[0], outcomeColor[1], outcomeColor[2]);
    pdf.roundedRect(startX, y, boxWidth, boxHeight, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.text('OUTCOME', startX + boxWidth/2, y + 8, { align: 'center' });
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(outcomeText, startX + boxWidth/2, y + 18, { align: 'center' });
    
    // Duration box
    pdf.setFillColor(59, 130, 246); // Blue
    pdf.roundedRect(startX + boxWidth + boxGap, y, boxWidth, boxHeight, 3, 3, 'F');
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text('DURATION', startX + boxWidth + boxGap + boxWidth/2, y + 8, { align: 'center' });
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(formatTime(timerState.totalElapsed), startX + boxWidth + boxGap + boxWidth/2, y + 18, { align: 'center' });
    
    // CPR Fraction box
    pdf.setFillColor(139, 92, 246); // Purple
    pdf.roundedRect(startX + 2*(boxWidth + boxGap), y, boxWidth, boxHeight, 3, 3, 'F');
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text('CPR FRACTION', startX + 2*(boxWidth + boxGap) + boxWidth/2, y + 8, { align: 'center' });
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${cprFraction}%`, startX + 2*(boxWidth + boxGap) + boxWidth/2, y + 18, { align: 'center' });
    
    // Shocks box
    pdf.setFillColor(249, 115, 22); // Orange
    pdf.roundedRect(startX + 3*(boxWidth + boxGap), y, boxWidth, boxHeight, 3, 3, 'F');
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text('SHOCKS', startX + 3*(boxWidth + boxGap) + boxWidth/2, y + 8, { align: 'center' });
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(String(session.shockCount), startX + 3*(boxWidth + boxGap) + boxWidth/2, y + 18, { align: 'center' });
    
    // Reset text color
    pdf.setTextColor(0, 0, 0);
    
    // Summary section
    y = 80;
    pdf.setFillColor(245, 245, 245);
    pdf.roundedRect(15, y, 180, 40, 3, 3, 'F');
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Session Summary', 20, y + 10);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    // Left column
    pdf.text(`Final Rhythm: ${rhythmText}`, 20, y + 20);
    pdf.text(`CPR Time: ${formatTime(timerState.totalCPRTime)}`, 20, y + 28);
    pdf.text(`Airway: ${airwayText}`, 20, y + 36);
    
    // Right column
    pdf.text(`Epinephrine: ${session.epinephrineCount} dose(s)`, 110, y + 20);
    pdf.text(`Amiodarone: ${session.amiodaroneCount} dose(s)`, 110, y + 28);
    pdf.text(`Lidocaine: ${session.lidocaineCount} dose(s)`, 110, y + 36);
    
    // Interventions Timeline
    y = 130;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Interventions Timeline', 15, y);
    
    // Table header
    y += 8;
    pdf.setFillColor(75, 85, 99);
    pdf.rect(15, y - 5, 180, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Time', 20, y);
    pdf.text('Code +', 50, y);
    pdf.text('Event', 80, y);
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    y += 6;
    
    let isOddRow = false;
    session.interventions.forEach((intervention) => {
      if (y > 270) {
        pdf.addPage();
        y = 20;
        // Repeat header on new page
        pdf.setFillColor(75, 85, 99);
        pdf.rect(15, y - 5, 180, 8, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Time', 20, y);
        pdf.text('Code +', 50, y);
        pdf.text('Event', 80, y);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        y += 6;
        isOddRow = false;
      }
      
      // Alternating row colors
      if (isOddRow) {
        pdf.setFillColor(249, 250, 251);
        pdf.rect(15, y - 4, 180, 7, 'F');
      }
      isOddRow = !isOddRow;
      
      const relativeTime = intervention.timestamp - session.startTime;
      pdf.setFontSize(9);
      pdf.text(formatDeviceTime(intervention.timestamp), 20, y);
      pdf.text(formatTime(relativeTime), 50, y);
      
      // Truncate long details
      let eventText = intervention.details || intervention.type;
      if (eventText.length > 60) {
        eventText = eventText.substring(0, 57) + '...';
      }
      pdf.text(eventText, 80, y);
      y += 7;
    });
    
    // Footer
    pdf.setFillColor(245, 245, 245);
    pdf.rect(0, 280, 210, 17, 'F');
    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128);
    pdf.text(`Generated: ${new Date().toLocaleString()} | ACLS Decision Support App`, 105, 288, { align: 'center' });
    
    pdf.save(`acls-code-${startDate.toISOString().split('T')[0]}-${formatDeviceTime(session.startTime).replace(/:/g, '')}.pdf`);
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
  
  // Epinephrine timing:
  // - VF/pVT (shockable): after 2nd shock, then every 3-5 minutes
  // - Asystole/PEA (non-shockable): immediately, then every 3-5 minutes
  const epiDue = (() => {
    if (session.phase === 'initial' || session.phase === 'rhythm_selection') return false;
    
    // If we've given epi before, check interval
    if (session.lastEpinephrineTime) {
      return (Date.now() - session.lastEpinephrineTime) >= config.epinephrineIntervalMs;
    }
    
    // First dose timing
    if (session.phase === 'shockable_pathway') {
      // VF/pVT: after 2nd shock
      return session.shockCount >= 2;
    }
    
    // Non-shockable: immediately
    return session.phase === 'non_shockable_pathway';
  })();

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
