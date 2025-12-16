import { CommandBanner } from './CommandBanner';
import { RhythmSelector } from './RhythmSelector';
import { ActionButtons } from './ActionButtons';
import { TimerDisplay } from './TimerDisplay';
import { CPRQualityPanel } from './CPRQualityPanel';
import { HsAndTsChecklist } from './HsAndTsChecklist';
import { CodeTimeline } from './CodeTimeline';
import { PostROSCScreen } from './PostROSCScreen';
import { RhythmCheckModal } from './RhythmCheckModal';
import { useACLSLogic } from '@/hooks/useACLSLogic';
import { Button } from '@/components/ui/button';
import { Download, RotateCcw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export function CodeScreen() {
  const { session, timerState, isInRhythmCheck, commandBanner, actions, buttonStates } = useACLSLogic();

  const isActive = session.phase === 'shockable_pathway' || session.phase === 'non_shockable_pathway';
  const isPostROSC = session.phase === 'post_rosc';
  const isInitial = session.phase === 'initial' || session.phase === 'rhythm_selection';

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
                {session.currentRhythm === 'vf_pvt' && `VF/pVT - Shockable | Shock #${session.shockCount}`}
                {session.currentRhythm === 'asystole' && 'Asystole - Non-Shockable'}
                {session.currentRhythm === 'pea' && 'PEA - Non-Shockable'}
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

              {/* Timers - above timeline */}
              <TimerDisplay
                cprCycleRemaining={timerState.cprCycleRemaining}
                epiRemaining={timerState.epiRemaining}
                totalElapsed={timerState.totalElapsed}
                totalCPRTime={timerState.totalCPRTime}
                preShockAlert={timerState.preShockAlert}
                rhythmCheckDue={timerState.rhythmCheckDue}
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
                  Export
                </Button>
                <Button
                  onClick={actions.resetSession}
                  variant="outline"
                  className="h-12 gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
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
                onNewCode={actions.resetSession}
              />
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
              <div className="text-xs text-muted-foreground">Shocks</div>
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
              <div className="text-xs text-muted-foreground">Duration</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
