import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { Download, RotateCcw, Save, CheckCircle, XCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function CodeScreen() {
  const { t } = useTranslation();
  const { session, timerState, isInRhythmCheck, commandBanner, actions, buttonStates } = useACLSLogic();
  const [isSaved, setIsSaved] = useState(false);

  const isActive = session.phase === 'shockable_pathway' || session.phase === 'non_shockable_pathway';
  const isPostROSC = session.phase === 'post_rosc';
  const isCodeEnded = session.phase === 'code_ended';
  const isInitial = session.phase === 'initial' || session.phase === 'rhythm_selection';

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
    actions.resetSession();
  };

  const formatDuration = (ms: number) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

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
                  {t('actions.export')}
                </Button>
                <Button
                  onClick={actions.resetSession}
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
