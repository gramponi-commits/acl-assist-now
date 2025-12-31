import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CommandBanner } from './CommandBanner';
import { RhythmSelector } from './RhythmSelector';
import { ActionButtons } from './ActionButtons';
import { CycleTimers, CodeTimers } from './TimerDisplay';
import { CPRQualityPanel } from './CPRQualityPanel';
import { HsAndTsChecklist } from './HsAndTsChecklist';
import { PregnancyChecklist } from './PregnancyChecklist';
import { CodeTimeline } from './CodeTimeline';
import { PostROSCScreen } from './PostROSCScreen';
import { RhythmCheckModal } from './RhythmCheckModal';
import { ResumeSessionDialog } from './ResumeSessionDialog';
import { AddNoteDialog } from './AddNoteDialog';
import { WeightInput, WeightDisplay } from './WeightInput';
import { PathwaySelector, PathwayMode } from './PathwaySelector';
import { BradyTachyModule } from './bradytachy/BradyTachyModule';
import { useACLSLogic } from '@/hooks/useACLSLogic';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useAudioAlerts } from '@/hooks/useAudioAlerts';
import { useMetronome } from '@/hooks/useMetronome';
import { useVoiceAnnouncements } from '@/hooks/useVoiceAnnouncements';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Download, RotateCcw, StickyNote, Heart, Activity, Stethoscope, Scale, XCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { calculateShockEnergy } from '@/lib/palsDosing';
import { getAdultShockEnergy } from '@/lib/aclsDosing';
import { ACLSSession, CPRRatio } from '@/types/acls';
import { 
  saveActiveSession, 
  getActiveSession, 
  clearActiveSession 
} from '@/lib/activeSessionStorage';

export function CodeScreen() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { session, timerState, isInRhythmCheck, commandBanner, actions, buttonStates } = useACLSLogic(undefined, settings.defibrillatorEnergy);
  const { requestWakeLock, releaseWakeLock } = useWakeLock();
  const { playAlert, setEnabled: setAudioEnabled, vibrate } = useAudioAlerts();
  const { announce, setEnabled: setVoiceEnabled } = useVoiceAnnouncements();
  const { start: startMetronome, stop: stopMetronome } = useMetronome({ 
    bpm: settings.metronomeBPM, 
    enabled: settings.metronomeEnabled 
  });
  
  // Brady/Tachy module state
  const [showBradyTachyModule, setShowBradyTachyModule] = useState(false);

  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showRhythmSelector, setShowRhythmSelector] = useState(false);
  const [showWeightDialog, setShowWeightDialog] = useState(false);
  const [pendingResumeSession, setPendingResumeSession] = useState<ReturnType<typeof getActiveSession>>(null);
  
  // Calculate shock energy based on pathway mode and patient weight
  const shockEnergy = session.pathwayMode === 'pediatric' 
    ? calculateShockEnergy(session.patientWeight, session.shockCount)
    : getAdultShockEnergy(session.shockCount, settings.defibrillatorEnergy);
  
  // Track previous states for alert triggers
  const prevRhythmCheckDue = useRef(false);
  const prevPreShockAlert = useRef(false);
  const prevEpiDue = useRef(false);
  const prevAntiarrhythmicDue = useRef(false);

  const isActive = session.phase === 'shockable_pathway' || session.phase === 'non_shockable_pathway';
  const isCPRPendingRhythm = session.phase === 'cpr_pending_rhythm';
  const isPostROSC = session.phase === 'post_rosc';
  const isCodeEnded = session.phase === 'code_ended';
  const isPathwaySelection = session.phase === 'pathway_selection';
  const isInitial = session.phase === 'initial' || session.phase === 'rhythm_selection';

  // Check for active session on mount
  useEffect(() => {
    const activeSession = getActiveSession();
    if (activeSession) {
      setPendingResumeSession(activeSession);
      setShowResumeDialog(true);
    }
  }, []);

  // Enable audio alerts based on settings
  useEffect(() => {
    setAudioEnabled(settings.soundEnabled);
  }, [settings.soundEnabled, setAudioEnabled]);

  // Enable voice announcements based on settings
  useEffect(() => {
    setVoiceEnabled(settings.voiceAnnouncementsEnabled);
  }, [settings.voiceAnnouncementsEnabled, setVoiceEnabled]);

  // Wake lock during active code (including cpr_pending_rhythm)
  useEffect(() => {
    if ((isActive || isCPRPendingRhythm) && !isInRhythmCheck) {
      requestWakeLock();
    } else if (isCodeEnded || isPostROSC) {
      releaseWakeLock();
    }
  }, [isActive, isCPRPendingRhythm, isInRhythmCheck, isCodeEnded, isPostROSC, requestWakeLock, releaseWakeLock]);

  // Metronome control during active CPR (including cpr_pending_rhythm)
  useEffect(() => {
    if ((isActive || isCPRPendingRhythm) && !isInRhythmCheck && settings.metronomeEnabled) {
      startMetronome();
    } else {
      stopMetronome();
    }
  }, [isActive, isCPRPendingRhythm, isInRhythmCheck, settings.metronomeEnabled, startMetronome, stopMetronome]);

  // Save active session periodically
  useEffect(() => {
    if (isActive || isCPRPendingRhythm) {
      const interval = setInterval(() => {
        saveActiveSession(session, {
          cprCycleRemaining: timerState.cprCycleRemaining,
          epiRemaining: timerState.epiRemaining,
          totalElapsed: timerState.totalElapsed,
          totalCPRTime: timerState.totalCPRTime,
          savedAt: Date.now(),
        });
      }, 5000); // Save every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [isActive, isCPRPendingRhythm, session, timerState]);

  // Clear active session when code ends
  useEffect(() => {
    if (isCodeEnded || isPostROSC) {
      clearActiveSession();
    }
  }, [isCodeEnded, isPostROSC]);

  // Audio alerts for state changes
  useEffect(() => {
    // Rhythm check due alert
    if (timerState.rhythmCheckDue && !prevRhythmCheckDue.current) {
      playAlert('rhythmCheck');
      announce('rhythmCheck');
      if (settings.vibrationEnabled) vibrate([200, 100, 200, 100, 200]);
    }
    prevRhythmCheckDue.current = timerState.rhythmCheckDue;

    // Pre-shock alert
    if (timerState.preShockAlert && !prevPreShockAlert.current) {
      playAlert('preCharge');
      announce('preCharge');
      if (settings.vibrationEnabled) vibrate([150, 75, 150]);
    }
    prevPreShockAlert.current = timerState.preShockAlert;

    // Epi due alert
    if (buttonStates.epiDue && !prevEpiDue.current) {
      playAlert('epiDue');
      announce('epiDue');
      if (settings.vibrationEnabled) vibrate([300, 150, 300]);
    }
    prevEpiDue.current = buttonStates.epiDue;

    // Antiarrhythmic due alert (after shock #3)
    const antiarrhythmicDue = session.shockCount >= 3 && (buttonStates.canGiveAmiodarone || buttonStates.canGiveLidocaine);
    if (antiarrhythmicDue && !prevAntiarrhythmicDue.current) {
      if (settings.preferLidocaine) {
        announce('lidocaineDue');
      } else {
        announce('amiodaroneDue');
      }
    }
    prevAntiarrhythmicDue.current = antiarrhythmicDue;
  }, [timerState.rhythmCheckDue, timerState.preShockAlert, buttonStates.epiDue, buttonStates.canGiveAmiodarone, buttonStates.canGiveLidocaine, session.shockCount, playAlert, announce, vibrate, settings.vibrationEnabled, settings.preferLidocaine]);

  // ROSC alert
  useEffect(() => {
    if (isPostROSC) {
      playAlert('rosc');
      announce('rosc');
      if (settings.vibrationEnabled) vibrate(500);
    }
  }, [isPostROSC, playAlert, announce, vibrate, settings.vibrationEnabled]);

  const handleAddNote = (note: string) => {
    actions.addNote(note);
    toast.success(t('notes.addNote'));
  };



  const handleNewCode = () => {
    setShowRhythmSelector(false);
    clearActiveSession();
    actions.resetSession();
  };

  const handleResumeSession = () => {
    if (pendingResumeSession) {
      actions.resumeSession(pendingResumeSession.session, pendingResumeSession.timerState);
    }
    setShowResumeDialog(false);
    setPendingResumeSession(null);
  };

  const handleDiscardSession = () => {
    clearActiveSession();
    setShowResumeDialog(false);
    setPendingResumeSession(null);
  };

  // Update session callback for Brady/Tachy
  const handleUpdateBradyTachySession = useCallback((updatedSession: ACLSSession) => {
    // Update the main session state
    actions.updateSession(updatedSession);
  }, [actions]);

  // Brady/Tachy handlers
  const handleOpenBradyTachy = () => {
    setShowBradyTachyModule(true);
  };

  const handleCloseBradyTachy = () => {
    setShowBradyTachyModule(false);
  };

  const handleSwitchToArrestFromBradyTachy = (bradyTachySession: ACLSSession) => {
    // The session already contains all Brady/Tachy interventions
    // Switch from brady/tachy to arrest mode
    setShowBradyTachyModule(false);
    
    // Start CPR with the existing session
    actions.startCPR();
    
    toast.success(t('bradyTachy.switchedToArrest'));
  };

  const formatDuration = (ms: number) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  // If Brady/Tachy module is active, show it instead of normal CODE screen
  if (showBradyTachyModule) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <BradyTachyModule
          session={session}
          onUpdateSession={handleUpdateBradyTachySession}
          onSwitchToArrest={handleSwitchToArrestFromBradyTachy}
          onExit={handleCloseBradyTachy}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Resume Session Dialog */}
      <ResumeSessionDialog
        open={showResumeDialog}
        onResume={handleResumeSession}
        onDiscard={handleDiscardSession}
        sessionDuration={pendingResumeSession ? formatDuration(pendingResumeSession.timerState.totalElapsed) : '0:00'}
      />
      
      {/* Add Note Dialog */}
      <AddNoteDialog
        open={showNoteDialog}
        onOpenChange={setShowNoteDialog}
        onAddNote={handleAddNote}
      />

      {/* Command Banner - Hidden on pathway selection and initial screen */}
      {!isInitial && !isPathwaySelection && (
        <CommandBanner
          message={commandBanner.message}
          priority={commandBanner.priority}
          subMessage={commandBanner.subMessage}
        />
      )}

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4 max-w-lg mx-auto">
          {/* Pathway Selection Screen */}
          {isPathwaySelection && (
            <PathwaySelector 
              onSelectPathway={actions.setPathwayMode}
              onStartCPR={actions.startCPR}
              onSetWeight={actions.setPatientWeight}
              currentWeight={session.patientWeight}
              onSelectBradyTachy={handleOpenBradyTachy}
            />
          )}

          {/* Active CPR Pending Rhythm - Only show weight for pediatric */}
          {isCPRPendingRhythm && (
            <>
              {/* Weight Display + Edit Button - Only for Pediatric */}
              {session.pathwayMode === 'pediatric' && (
                <div className="flex items-center justify-center gap-3">
                  <WeightDisplay 
                    weight={session.patientWeight} 
                    onEdit={() => setShowWeightDialog(true)} 
                  />
                </div>
              )}

              {/* Weight Input Dialog - only for pediatric */}
              {session.pathwayMode === 'pediatric' && (
                <WeightInput
                  currentWeight={session.patientWeight}
                  onWeightChange={actions.setPatientWeight}
                  isOpen={showWeightDialog}
                  onOpenChange={setShowWeightDialog}
                  showTrigger={false}
                />
              )}

              {/* Analyze Rhythm Button or Rhythm Selector */}
              {!showRhythmSelector ? (
                <Button
                  onClick={() => {
                    setShowRhythmSelector(true);
                    actions.setRhythmAnalysisActive(true);
                  }}
                  className="h-16 w-full text-xl font-bold bg-acls-info hover:bg-acls-info/90 text-white"
                >
                  <Stethoscope className="h-6 w-6 mr-3" />
                  {t('actions.analyzeRhythm')}
                </Button>
              ) : (
                <RhythmSelector
                  currentRhythm={session.currentRhythm}
                  onSelectRhythm={(rhythm) => {
                    actions.setRhythmAnalysisActive(false);
                    actions.selectRhythm(rhythm);
                  }}
                  isInitial={false}
                />
              )}

              {/* Code Timers - Total & CPR */}
              <CodeTimers
                totalElapsed={timerState.totalElapsed}
                totalCPRTime={timerState.totalCPRTime}
              />

              {/* CPR Quality */}
              <CPRQualityPanel
                airwayStatus={session.airwayStatus}
                onAirwayChange={actions.setAirway}
                onETCO2Record={actions.recordETCO2}
                cprRatio={session.cprRatio}
                onCPRRatioChange={actions.setCPRRatio}
                pathwayMode={session.pathwayMode}
              />

              {/* H's & T's */}
              <HsAndTsChecklist
                hsAndTs={session.hsAndTs}
                onUpdate={actions.updateHsAndTs}
              />

              {/* Pregnancy Checklist - Adult only */}
              {session.pathwayMode === 'adult' && (
                <PregnancyChecklist
                  pregnancyActive={session.pregnancyActive}
                  pregnancyCauses={session.pregnancyCauses}
                  pregnancyInterventions={session.pregnancyInterventions}
                  pregnancyStartTime={session.pregnancyStartTime}
                  cprStartTime={session.startTime}
                  onTogglePregnancy={actions.togglePregnancy}
                  onUpdateCauses={actions.updatePregnancyCauses}
                  onUpdateInterventions={actions.updatePregnancyInterventions}
                  onDeliveryAlert={() => {
                    playAlert('rhythmCheck');
                    announce('emergencyDelivery');
                    if (settings.vibrationEnabled) vibrate([500, 200, 500, 200, 500]);
                  }}
                />
              )}

              {/* Code Timeline */}
              <CodeTimeline
                interventions={session.interventions}
                startTime={session.startTime}
              />

              {/* Session Controls */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  onClick={() => setShowNoteDialog(true)}
                  variant="outline"
                  className="h-12 gap-2"
                >
                  <StickyNote className="h-4 w-4" />
                  {t('actions.addNote')}
                </Button>
                <Button
                  onClick={handleNewCode}
                  variant="outline"
                  className="h-12 gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  {t('actions.reset')}
                </Button>
              </div>
            </>
          )}

          {/* Active Code Screen */}
          {isActive && !isInRhythmCheck && (
            <>
              {/* Weight Display + Edit Button - Only for Pediatric */}
              {session.pathwayMode === 'pediatric' && (
                <>
                  <div className="flex items-center justify-center gap-3">
                    <WeightDisplay 
                      weight={session.patientWeight} 
                      onEdit={() => setShowWeightDialog(true)} 
                    />
                  </div>

                  {/* Weight Input Dialog - controlled externally */}
                  <WeightInput
                    currentWeight={session.patientWeight}
                    onWeightChange={actions.setPatientWeight}
                    isOpen={showWeightDialog}
                    onOpenChange={setShowWeightDialog}
                    showTrigger={false}
                  />
                </>
              )}

              {/* Action Buttons */}
              <ActionButtons
                canGiveEpinephrine={buttonStates.canGiveEpinephrine}
                canGiveAmiodarone={buttonStates.canGiveAmiodarone}
                canGiveLidocaine={buttonStates.canGiveLidocaine}
                epiDue={buttonStates.epiDue}
                rhythmCheckDue={buttonStates.rhythmCheckDue}
                epinephrineCount={session.epinephrineCount}
                amiodaroneCount={session.amiodaroneCount}
                lidocaineCount={session.lidocaineCount}
                preferLidocaine={settings.preferLidocaine}
                patientWeight={session.patientWeight}
                pathwayMode={session.pathwayMode}
                onEpinephrine={actions.giveEpinephrine}
                onAmiodarone={actions.giveAmiodarone}
                onLidocaine={actions.giveLidocaine}
                onRhythmCheck={actions.startRhythmCheck}
              />

              {/* Cycle Timers - Rhythm Check & Epi */}
              <CycleTimers
                cprCycleRemaining={timerState.cprCycleRemaining}
                epiRemaining={timerState.epiRemaining}
                preShockAlert={timerState.preShockAlert}
                rhythmCheckDue={timerState.rhythmCheckDue}
                showEpiTimer={session.epinephrineCount > 0}
              />

              {/* CPR Quality */}
              <CPRQualityPanel
                airwayStatus={session.airwayStatus}
                onAirwayChange={actions.setAirway}
                onETCO2Record={actions.recordETCO2}
                cprRatio={session.cprRatio}
                onCPRRatioChange={actions.setCPRRatio}
                pathwayMode={session.pathwayMode}
              />

              {/* H's & T's */}
              <HsAndTsChecklist
                hsAndTs={session.hsAndTs}
                onUpdate={actions.updateHsAndTs}
              />

              {/* Pregnancy Checklist - Adult only */}
              {session.pathwayMode === 'adult' && (
                <PregnancyChecklist
                  pregnancyActive={session.pregnancyActive}
                  pregnancyCauses={session.pregnancyCauses}
                  pregnancyInterventions={session.pregnancyInterventions}
                  pregnancyStartTime={session.pregnancyStartTime}
                  cprStartTime={session.startTime}
                  onTogglePregnancy={actions.togglePregnancy}
                  onUpdateCauses={actions.updatePregnancyCauses}
                  onUpdateInterventions={actions.updatePregnancyInterventions}
                  onDeliveryAlert={() => {
                    playAlert('rhythmCheck');
                    announce('emergencyDelivery');
                    if (settings.vibrationEnabled) vibrate([500, 200, 500, 200, 500]);
                  }}
                />
              )}

              {/* Code Timers - Total & CPR */}
              <CodeTimers
                totalElapsed={timerState.totalElapsed}
                totalCPRTime={timerState.totalCPRTime}
              />

              {/* Code Timeline */}
              <CodeTimeline
                interventions={session.interventions}
                startTime={session.startTime}
              />

              {/* Session Controls */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <Button
                  onClick={() => setShowNoteDialog(true)}
                  variant="outline"
                  className="h-12 gap-2"
                >
                  <StickyNote className="h-4 w-4" />
                  {t('actions.addNote')}
                </Button>
                <Button
                  onClick={actions.exportSession}
                  variant="outline"
                  className="h-12 gap-2"
                >
                  <Download className="h-4 w-4" />
                  {t('actions.export')}
                </Button>
                <Button
                  onClick={handleNewCode}
                  variant="outline"
                  className="h-12 gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  {t('actions.reset')}
                </Button>
              </div>
            </>
          )}

          {/* Rhythm Check Modal */}
          {isInRhythmCheck && (
            <RhythmCheckModal
              isShockable={session.currentRhythm === 'vf_pvt'}
              currentEnergy={shockEnergy.display}
              shockNumber={session.shockCount + 1}
              onShock={() => {
                announce('shock');
                actions.completeRhythmCheckWithShock(shockEnergy.value);
              }}
              onNoShockAsystole={() => {
                announce('noShock');
                actions.completeRhythmCheckNoShock('asystole');
              }}
              onNoShockPEA={() => {
                announce('noShock');
                actions.completeRhythmCheckNoShock('pea');
              }}
              onROSC={actions.achieveROSC}
              onTerminate={actions.terminateCode}
            />
          )}

          {/* Post-ROSC Screen */}
          {isPostROSC && (
            <>
              <CodeTimeline
                interventions={session.interventions}
                startTime={session.startTime}
              />
              <PostROSCScreen
                checklist={session.postROSCChecklist}
                vitals={session.postROSCVitals}
                onChecklistUpdate={actions.updatePostROSCChecklist}
                onVitalsUpdate={actions.updatePostROSCVitals}
                onExport={actions.exportSession}
                onNewCode={handleNewCode}
              />
            </>
          )}

          {/* Code Ended Screen (Death) */}
          {isCodeEnded && (
            <>
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/20 mb-4">
                  <XCircle className="h-10 w-10 text-destructive" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">{t('codeEnded.title')}</h2>
                <p className="text-muted-foreground mt-2">{t('codeEnded.deathDeclared')} {new Date(session.endTime || Date.now()).toLocaleTimeString()}</p>
              </div>

              {/* Summary Stats */}
              <div className="bg-card rounded-lg p-4 border border-border">
                <h3 className="font-bold text-foreground mb-3">{t('codeEnded.summary')}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t('codeEnded.duration')}:</span>
                    <span className="ml-2 font-semibold">{formatDuration(timerState.totalElapsed)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('codeEnded.cprTime')}:</span>
                    <span className="ml-2 font-semibold">{formatDuration(timerState.totalCPRTime)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('codeEnded.cprFraction')}:</span>
                    <span className="ml-2 font-semibold">
                      {timerState.totalElapsed > 0 
                        ? ((timerState.totalCPRTime / timerState.totalElapsed) * 100).toFixed(1) + '%'
                        : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('codeEnded.shocks')}:</span>
                    <span className="ml-2 font-semibold">{session.shockCount}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('actions.epinephrine')}:</span>
                    <span className="ml-2 font-semibold">{session.epinephrineCount} {t('codeEnded.doses')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('actions.amiodarone')}:</span>
                    <span className="ml-2 font-semibold">{session.amiodaroneCount} {t('codeEnded.doses')}</span>
                  </div>
                </div>
              </div>

              <CodeTimeline
                interventions={session.interventions}
                startTime={session.startTime}
              />

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={actions.exportSession}
                    variant="outline"
                    className="h-12 gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {t('actions.export')}
                  </Button>
                  <Button
                    onClick={handleNewCode}
                    variant="outline"
                    className="h-12 gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    {t('actions.newCode')}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer Stats Bar - Visible during active code */}
      {(isActive || isCPRPendingRhythm || isPostROSC) && (
        <div className="bg-card border-t border-border p-3">
          <div className="flex justify-around text-center text-sm max-w-lg mx-auto">
            <div>
              <span className="text-muted-foreground">{t('codeEnded.epi')}</span>
              <span className="ml-1 font-bold text-foreground">{session.epinephrineCount}</span>
            </div>
            <div>
              <span className="text-muted-foreground">{t('codeEnded.amio')}</span>
              <span className="ml-1 font-bold text-foreground">{session.amiodaroneCount}</span>
            </div>
            <div>
              <span className="text-muted-foreground">{t('codeEnded.lido')}</span>
              <span className="ml-1 font-bold text-foreground">{session.lidocaineCount}</span>
            </div>
            <div>
              <span className="text-muted-foreground">{t('codeEnded.shocks')}</span>
              <span className="ml-1 font-bold text-foreground">{session.shockCount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}