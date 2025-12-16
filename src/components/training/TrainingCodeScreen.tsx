import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { TrainingScenario } from '@/types/training';
import { useACLSLogic } from '@/hooks/useACLSLogic';
import { useTrainingLogic } from '@/hooks/useTrainingLogic';
import { useSettings } from '@/hooks/useSettings';
import { useMetronome } from '@/hooks/useMetronome';

import { CommandBanner } from '@/components/acls/CommandBanner';
import { ActionButtons } from '@/components/acls/ActionButtons';
import { CycleTimers, CodeTimers } from '@/components/acls/TimerDisplay';
import { CPRQualityPanel } from '@/components/acls/CPRQualityPanel';
import { HsAndTsChecklist } from '@/components/acls/HsAndTsChecklist';
import { CodeTimeline } from '@/components/acls/CodeTimeline';
import { RhythmCheckModal } from '@/components/acls/RhythmCheckModal';
import { FeedbackOverlay } from './FeedbackOverlay';
import { HintBanner } from './HintBanner';
import { PerformanceReview } from './PerformanceReview';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, GraduationCap } from 'lucide-react';

interface TrainingCodeScreenProps {
  scenario: TrainingScenario;
  onExit: () => void;
}

export function TrainingCodeScreen({ scenario, onExit }: TrainingCodeScreenProps) {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [showReview, setShowReview] = useState(false);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  
  const {
    session,
    timerState,
    isInRhythmCheck,
    commandBanner,
    actions,
    buttonStates,
  } = useACLSLogic();

  const training = useTrainingLogic();
  const { start: startMetronome, stop: stopMetronome } = useMetronome({ 
    bpm: settings.metronomeBPM, 
    enabled: settings.metronomeEnabled 
  });
  
  const initializedRef = useRef(false);

  // Initialize scenario
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      const initialRhythm = training.startScenario(scenario);
      actions.selectRhythm(initialRhythm);
    }
  }, [scenario]);

  // Update hints
  useEffect(() => {
    if (!training.state.isTrainingMode) return;
    
    const interval = setInterval(() => {
      const hint = training.getActiveHint();
      setActiveHint(hint);
    }, 1000);

    return () => clearInterval(interval);
  }, [training.state.isTrainingMode, training.getActiveHint]);

  // Check for scenario events
  useEffect(() => {
    if (!training.state.isTrainingMode || !session) return;

    const event = training.checkScenarioEvents(session.shockCount, session.currentRhythm);
    if (event?.rosc) {
      // Scenario triggers ROSC - will be handled by user clicking ROSC in rhythm check
    }
  }, [timerState.totalElapsed, session?.shockCount]);

  // Metronome control
  useEffect(() => {
    const isActive = session?.phase === 'shockable_pathway' || session?.phase === 'non_shockable_pathway';
    if (settings.metronomeEnabled && isActive && !isInRhythmCheck) {
      startMetronome();
    } else {
      stopMetronome();
    }
    return () => stopMetronome();
  }, [session?.phase, isInRhythmCheck, settings.metronomeEnabled, startMetronome, stopMetronome]);

  // Wrap actions to evaluate training
  const wrappedActions = {
    ...actions,
    giveEpinephrine: () => {
      training.evaluateAction('epinephrine');
      actions.giveEpinephrine();
    },
    giveAmiodarone: () => {
      training.evaluateAction('amiodarone');
      actions.giveAmiodarone();
    },
    giveLidocaine: () => {
      training.evaluateAction('lidocaine');
      actions.giveLidocaine();
    },
    startRhythmCheck: () => {
      training.evaluateAction('rhythmCheck');
      actions.startRhythmCheck();
    },
    completeRhythmCheckWithShock: () => {
      training.evaluateAction('shock');
      actions.completeRhythmCheckWithShock();
    },
    achieveROSC: () => {
      training.evaluateAction('rosc');
      actions.achieveROSC();
      
      // Complete the training scenario
      if (session) {
        const cprFraction = timerState.totalElapsed > 0 
          ? (timerState.totalCPRTime / timerState.totalElapsed) * 100 
          : 0;
        training.completeScenario('completed', cprFraction);
        setShowReview(true);
      }
    },
    terminateCode: () => {
      training.evaluateAction('terminate');
      actions.terminateCode();
      
      if (session) {
        const cprFraction = timerState.totalElapsed > 0 
          ? (timerState.totalCPRTime / timerState.totalElapsed) * 100 
          : 0;
        training.completeScenario('completed', cprFraction);
        setShowReview(true);
      }
    },
  };

  const handleRetry = () => {
    setShowReview(false);
    initializedRef.current = false;
    actions.resetSession();
    const initialRhythm = training.startScenario(scenario);
    actions.selectRhythm(initialRhythm);
  };

  const handleExit = () => {
    training.endTraining();
    actions.resetSession();
    onExit();
  };

  // Show performance review
  if (showReview && training.state.session) {
    return (
      <PerformanceReview
        session={training.state.session}
        scenario={scenario}
        onRetry={handleRetry}
        onBack={handleExit}
      />
    );
  }

  const isActive = session?.phase === 'shockable_pathway' || session?.phase === 'non_shockable_pathway';
  const isPostROSC = session?.phase === 'post_rosc';
  const isShockable = session?.currentRhythm === 'vf_pvt';

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Training Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-card border-b border-border">
        <Button variant="ghost" size="sm" onClick={handleExit}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t('common.back')}
        </Button>
        <Badge variant="secondary" className="gap-1">
          <GraduationCap className="h-3 w-3" />
          {t('training.mode')}
        </Badge>
        {training.state.session && (
          <Badge variant="outline">
            {training.state.session.totalScore} pts
          </Badge>
        )}
      </div>

      {/* Feedback Overlay */}
      <FeedbackOverlay 
        feedback={training.state.lastFeedback} 
        visible={training.state.showFeedback} 
      />

      {/* Hint Banner */}
      <HintBanner hint={activeHint} />

      {/* Command Banner */}
      <CommandBanner 
        message={commandBanner.message} 
        subMessage={commandBanner.subMessage} 
        priority={commandBanner.priority}
      />

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {/* Rhythm Check Modal */}
          {isInRhythmCheck && session && (
            <RhythmCheckModal
              isShockable={isShockable}
              currentEnergy={session.currentEnergy}
              shockNumber={session.shockCount + 1}
              onShock={wrappedActions.completeRhythmCheckWithShock}
              onNoShockAsystole={() => wrappedActions.completeRhythmCheckNoShock('asystole')}
              onNoShockPEA={() => wrappedActions.completeRhythmCheckNoShock('pea')}
              onResumeCPR={wrappedActions.completeRhythmCheckResumeCPR}
              onROSC={wrappedActions.achieveROSC}
              onTerminate={wrappedActions.terminateCode}
            />
          )}

          {/* Active Code UI */}
          {isActive && !isInRhythmCheck && session && (
            <>
              <ActionButtons
                onRhythmCheck={wrappedActions.startRhythmCheck}
                onEpinephrine={wrappedActions.giveEpinephrine}
                onAmiodarone={wrappedActions.giveAmiodarone}
                onLidocaine={wrappedActions.giveLidocaine}
                canGiveEpinephrine={buttonStates.canGiveEpinephrine}
                canGiveAmiodarone={buttonStates.canGiveAmiodarone}
                canGiveLidocaine={buttonStates.canGiveLidocaine}
                epiDue={buttonStates.epiDue}
                rhythmCheckDue={buttonStates.rhythmCheckDue}
                epinephrineCount={session.epinephrineCount}
                amiodaroneCount={session.amiodaroneCount}
                lidocaineCount={session.lidocaineCount}
                preferLidocaine={settings.preferLidocaine}
              />

              <CycleTimers
                cprCycleRemaining={timerState.cprCycleRemaining}
                epiRemaining={timerState.epiRemaining}
                preShockAlert={timerState.preShockAlert}
                rhythmCheckDue={timerState.rhythmCheckDue}
              />

              <CPRQualityPanel
                airwayStatus={session.airwayStatus}
                onAirwayChange={actions.setAirway}
              />

              <HsAndTsChecklist
                hsAndTs={session.hsAndTs}
                onUpdate={actions.updateHsAndTs}
              />

              <CodeTimers
                totalElapsed={timerState.totalElapsed}
                totalCPRTime={timerState.totalCPRTime}
              />

              <CodeTimeline 
                interventions={session.interventions} 
                startTime={session.startTime}
              />
            </>
          )}

          {/* Post-ROSC - simplified for training */}
          {isPostROSC && session && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-acls-success mb-2">
                {t('postRosc.roscAchieved')}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t('training.scenarioComplete')}
              </p>
              <CodeTimeline 
                interventions={session.interventions} 
                startTime={session.startTime}
              />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer Stats */}
      {(isActive || isPostROSC) && session && (
        <div className="px-3 py-2 bg-card border-t border-border">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t('codeEnded.shocks')}: {session.shockCount}</span>
            <span>{t('codeEnded.epi')}: {session.epinephrineCount}</span>
            <span>{session.amiodaroneCount > 0 ? `${t('codeEnded.amio')}: ${session.amiodaroneCount}` : ''}</span>
            <span>{session.lidocaineCount > 0 ? `${t('codeEnded.lido')}: ${session.lidocaineCount}` : ''}</span>
          </div>
        </div>
      )}
    </div>
  );
}
