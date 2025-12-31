import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { BradyTachySession } from '@/types/acls';
import { BradyTachyActions } from '@/hooks/useBradyTachyLogic';
import { Activity, AlertCircle } from 'lucide-react';

interface SinusEvaluationScreenProps {
  session: BradyTachySession;
  actions: BradyTachyActions;
}

export function SinusEvaluationScreen({ session, actions }: SinusEvaluationScreenProps) {
  const { t } = useTranslation();

  const handleProbableSinus = () => {
    // This will end the session with "treat cause" guidance
    actions.selectPediatricSinusTachy();
  };

  const handleConcerningRhythm = () => {
    // This will advance to compromise assessment
    actions.advanceToCompromiseAssessment();
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pals-primary/20 text-pals-primary text-sm font-medium mb-4">
            <Activity className="h-4 w-4" />
            {t('bradyTachy.pediatric')}
          </div>
          <h1 className="text-2xl font-bold">{t('bradyTachy.pedsSinusVsSVT')}</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {t('bradyTachy.differentiateRhythmDesc')}
          </p>
        </div>

        {/* Option A: Probable Sinus Tachycardia */}
        <div className="bg-card rounded-lg p-4 border-2 border-green-600">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-5 w-5 text-green-600" />
            <h3 className="font-bold text-lg text-green-600">
              {t('bradyTachy.pedsProbableSinus')}
            </h3>
          </div>

          <p className="text-sm font-medium mb-2">{t('bradyTachy.pedsSinusCriteria')}</p>
          <ul className="space-y-1 text-sm mb-4 list-disc list-inside">
            <li>{t('bradyTachy.pedsSinusPWaves')}</li>
            <li>{t('bradyTachy.pedsSinusVariableRR')}</li>
            <li>{t('bradyTachy.pedsSinusInfantRate')}</li>
            <li>{t('bradyTachy.pedsSinusChildRate')}</li>
          </ul>

          <div className="bg-muted rounded p-3 mb-3 text-sm">
            <p className="font-medium mb-1">{t('bradyTachy.pedsSinusTreatCause')}</p>
            <p className="text-xs text-muted-foreground">
              {t('bradyTachy.searchCausesDesc')}
            </p>
          </div>

          <Button
            onClick={handleProbableSinus}
            className={cn(
              "w-full h-12 text-lg font-bold",
              "bg-green-600 hover:bg-green-700 text-white"
            )}
          >
            {t('bradyTachy.pedsProbableSinus')}
          </Button>
        </div>

        {/* Option B: Not Sinus / Concerning Rhythm OR Compromise */}
        <div className="bg-card rounded-lg p-4 border-2 border-orange-600">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <h3 className="font-bold text-lg text-orange-600">
              {t('bradyTachy.notSinusConcerningRhythm')}
            </h3>
          </div>

          <p className="text-sm mb-3">
            {t('bradyTachy.orCompromiseSuspected')}
          </p>

          <div className="bg-muted rounded p-3 mb-3 text-sm">
            <p className="text-xs text-muted-foreground">
              {t('bradyTachy.pedsSVTContinue')}
            </p>
          </div>

          <Button
            onClick={handleConcerningRhythm}
            className={cn(
              "w-full h-12 text-lg font-bold",
              "bg-orange-600 hover:bg-orange-700 text-white"
            )}
          >
            {t('bradyTachy.continueToCompromiseAssessment')}
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}
