import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CommandBanner } from './CommandBanner';
import { RhythmSelector } from './RhythmSelector';
import { ActionButtons } from './ActionButtons';
import { CycleTimers, CodeTimers } from './TimerDisplay';
import { CPRQualityPanel } from './CPRQualityPanel';
import { HsAndTsChecklist } from './HsAndTsChecklist';
import { CodeTimeline } from './CodeTimeline';
import { PostROSCScreen } from './PostROSCScreen';
import { RhythmCheckModal } from './RhythmCheckModal';
import { ResumeSessionDialog } from './ResumeSessionDialog';
import { useACLSLogic } from '@/hooks/useACLSLogic';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useAudioAlerts } from '@/hooks/useAudioAlerts';
import { useMetronome } from '@/hooks/useMetronome';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Download, RotateCcw, Save, CheckCircle, XCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  saveActiveSession, 
  getActiveSession, 
  clearActiveSession 
} from '@/lib/activeSessionStorage';

export function CodeScreen() {
  const { t } = useTranslation();
  const { session, timerState, isInRhythmCheck, commandBanner, actions, buttonStates } = useACLSLogic();
  const { settings } = useSettings();
  const { requestWakeLock, releaseWakeLock } = useWakeLock();
  const { playAlert, setEnabled: setAudioEnabled, vibrate } = useAudioAlerts();
  const { start: startMetronome, stop: stopMetronome } = useMetronome({ 
    bpm: settings.metronomeBPM, 
    enabled: settings.metronomeEnabled 
  });
  
  const [isSaved, setIsSaved] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [pendingResumeSession, setPendingResumeSession] = useState<ReturnType<typeof getActiveSession>>(null);
  
  // Track previous states for alert triggers
  const prevRhythmCheckDue = useRef(false);
  const prevPreShockAlert = useRef(false);
  const prevEpiDue = useRef(false);

  const isActive = session.phase === 'shockable_pathway' || session.phase === 'non_shockable_pathway';
  const isPostROSC = session.phase === 'post_rosc';
  const isCodeEnded = session.phase === 'code_ended';
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

  // Wake lock during active code
  useEffect(() => {
    if (isActive && !isInRhythmCheck) {
      requestWakeLock();
    } else if (isCodeEnded || isPostROSC) {
      releaseWakeLock();
    }
  }, [isActive, isInRhythmCheck, isCodeEnded, isPostROSC, requestWakeLock, releaseWakeLock]);

  // Metronome control during active CPR
  useEffect(() => {
    if (isActive && !isInRhythmCheck && settings.metronomeEnabled) {
      startMetronome();
    } else {
      stopMetronome();
    }
  }, [isActive, isInRhythmCheck, settings.metronomeEnabled, startMetronome, stopMetronome]);

  // Save active session periodically
  useEffect(() => {
    if (isActive) {
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
  }, [isActive, session, timerState]);

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
      if (settings.vibrationEnabled) vibrate([200, 100, 200, 100, 200]);
    }
    prevRhythmCheckDue.current = timerState.rhythmCheckDue;

    // Pre-shock alert
    if (timerState.preShockAlert && !prevPreShockAlert.current) {
      playAlert('preCharge');
      if (settings.vibrationEnabled) vibrate([150, 75, 150]);
    }
    prevPreShockAlert.current = timerState.preShockAlert;

    // Epi due alert
    if (buttonStates.epiDue && !prevEpiDue.current) {
      playAlert('epiDue');
      if (settings.vibrationEnabled) vibrate([300, 150, 300]);
    }
    prevEpiDue.current = buttonStates.epiDue;
  }, [timerState.rhythmCheckDue, timerState.preShockAlert, buttonStates.epiDue, playAlert, vibrate, settings.vibrationEnabled]);

  // ROSC alert
  useEffect(() => {
    if (isPostROSC) {
      playAlert('rosc');
      if (settings.vibrationEnabled) vibrate(500);
    }
  }, [isPostROSC, playAlert, vibrate, settings.vibrationEnabled]);

  const handleSaveSession = async () => {
    try {
      await actions.saveSessionLocally();
      setIsSaved(true);
      toast.success(t('actions.saved'));
    } catch (error) {
      toast.error('Failed to save session');
    }
  };

  const handleNewCode = () => {
    setIsSaved(false);
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

  const formatDuration = (ms: number) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Resume Session Dialog */}
      <ResumeSessionDialog
        open={showResumeDialog}
        onResume={handleResumeSession}
        onDiscard={handleDiscardSession}
        sessionDuration={pendingResumeSession ? formatDuration(pendingResumeSession.timerState.totalElapsed) : '0:00'}
      />

      {/* Command Banner - Always visible at top */}
      <CommandBanner
        message={commandBanner.message}
        priority={commandBanner.priority}
        subMessage={commandBanner.subMessage}
      />

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4 max-w-lg mx-auto">
          {/* Initial Rhythm Selection */}
          {isInitial && (
            <RhythmSelector
              currentRhythm={session.currentRhythm}
              onSelectRhythm={actions.selectRhythm}
              isInitial={true}
            />
          )}

          {/* Active Code Screen */}
          {isActive && !isInRhythmCheck && (
            <>
              {/* Current Rhythm Indicator */}
              <div className={cn(
                'rounded-lg p-3 text-center font-bold text-lg',
                session.currentRhythm === 'vf_pvt' 
                  ? 'bg-acls-shockable/20 text-acls-shockable border-2 border-acls-shockable' 
                  : session.currentRhythm === 'asystole'
                  ? 'bg-acls-non-shockable/20 text-acls-non-shockable border-2 border-acls-non-shockable'
                  : 'bg-acls-pea/20 text-acls-pea border-2 border-acls-pea'
              )}>
                {session.currentRhythm === 'vf_pvt' && `${t('rhythm.vfPvt')} - ${t('rhythm.shockable')} | Shock #${session.shockCount}`}
                {session.currentRhythm === 'asystole' && `${t('rhythm.asystole')} - ${t('rhythm.nonShockable')}`}
                {session.currentRhythm === 'pea' && `${t('rhythm.pea')} - ${t('rhythm.nonShockable')}`}
              </div>

              {/* Action Buttons */}
              <ActionButtons
                canGiveEpinephrine={buttonStates.canGiveEpinephrine}
                canGiveAmiodarone={buttonStates.canGiveAmiodarone}
                epiDue={buttonStates.epiDue}
                rhythmCheckDue={buttonStates.rhythmCheckDue}
                epinephrineCount={session.epinephrineCount}
                amiodaroneCount={session.amiodaroneCount}
                onEpinephrine={actions.giveEpinephrine}
                onAmiodarone={actions.giveAmiodarone}
                onRhythmCheck={actions.startRhythmCheck}
              />

              {/* Cycle Timers - Rhythm Check & Epi */}
              <CycleTimers
                cprCycleRemaining={timerState.cprCycleRemaining}
                epiRemaining={timerState.epiRemaining}
                preShockAlert={timerState.preShockAlert}
                rhythmCheckDue={timerState.rhythmCheckDue}
              />

              {/* CPR Quality */}
              <CPRQualityPanel
                airwayStatus={session.airwayStatus}
                onAirwayChange={actions.setAirway}
              />

              {/* H's & T's */}
              <HsAndTsChecklist
                hsAndTs={session.hsAndTs}
                onUpdate={actions.updateHsAndTs}
              />

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
              <div className="grid grid-cols-2 gap-3 pt-2">
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
              currentEnergy={session.currentEnergy}
              shockNumber={session.shockCount + 1}
              onShock={actions.completeRhythmCheckWithShock}
              onNoShockAsystole={() => actions.completeRhythmCheckNoShock('asystole')}
              onNoShockPEA={() => actions.completeRhythmCheckNoShock('pea')}
              onResumeCPR={actions.completeRhythmCheckResumeCPR}
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
                onSave={handleSaveSession}
                isSaved={isSaved}
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
                <Button
                  onClick={handleSaveSession}
                  disabled={isSaved}
                  className={cn(
                    'w-full h-14 text-lg font-semibold gap-2',
                    isSaved 
                      ? 'bg-acls-success hover:bg-acls-success text-white' 
                      : 'bg-primary hover:bg-primary/90'
                  )}
                >
                  {isSaved ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      {t('actions.saved')}
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      {t('actions.save')}
                    </>
                  )}
                </Button>

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

      {/* Code Stats Footer */}
      {(isActive || isPostROSC) && !isInRhythmCheck && (
        <div className="border-t border-border bg-card px-4 py-2">
          <div className="flex justify-around text-center max-w-lg mx-auto">
            <div>
              <div className="text-lg font-bold text-foreground">{session.shockCount}</div>
              <div className="text-xs text-muted-foreground">{t('codeEnded.shocks')}</div>
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">{session.epinephrineCount}</div>
              <div className="text-xs text-muted-foreground">Epi</div>
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">{session.amiodaroneCount}</div>
              <div className="text-xs text-muted-foreground">Amio</div>
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">
                {Math.floor(timerState.totalElapsed / 60000)}:{((Math.floor(timerState.totalElapsed / 1000)) % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-xs text-muted-foreground">{t('codeEnded.duration')}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
