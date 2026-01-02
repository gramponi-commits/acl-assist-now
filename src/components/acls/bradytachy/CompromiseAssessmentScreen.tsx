import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { BradyTachySession } from '@/types/acls';
import { BradyTachyActions } from '@/hooks/useBradyTachyLogic';

interface CompromiseAssessmentScreenProps {
  session: BradyTachySession;
  actions: BradyTachyActions;
}

export function CompromiseAssessmentScreen({ session, actions }: CompromiseAssessmentScreenProps) {
  const { t } = useTranslation();

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold break-words">{t('bradyTachy.pedsCompromiseQuestion')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('bradyTachy.pediatric')} - {t('bradyTachy.tachycardia')}
          </p>
        </div>

        {/* Compromise Assessment */}
        <div className="bg-card rounded-lg p-4 border-2 border-border">
          <p className="text-sm text-muted-foreground mb-3">
            {t('bradyTachy.pedsCompromiseCriteria')}
          </p>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex items-center gap-2">
              <Checkbox id="ams" />
              <label htmlFor="ams">{t('bradyTachy.alteredMentalStatus')}</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="shock" />
              <label htmlFor="shock">{t('bradyTachy.signsOfShock')}</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="hypo" />
              <label htmlFor="hypo">{t('bradyTachy.hypotension')}</label>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 mt-4">
            <Button
              onClick={() => actions.setStability('unstable')}
              variant="destructive"
              className={cn(
                "min-h-14 h-auto px-4 py-3 text-base sm:text-lg font-bold",
                "whitespace-normal text-center leading-snug"
              )}
            >
              <span className="whitespace-normal break-words">{t('bradyTachy.pedsCompromiseYes')}</span>
            </Button>
            <Button
              onClick={() => actions.setStability('stable')}
              variant="outline"
              className="min-h-14 h-auto px-4 py-3 text-base sm:text-lg font-bold whitespace-normal text-center leading-snug"
            >
              <span className="whitespace-normal break-words">{t('bradyTachy.pedsCompromiseNo')}</span>
            </Button>
          </div>
        </div>

        {/* Info box */}
        <div className="bg-muted rounded-lg p-4 text-sm">
          <p className="font-medium mb-2">{t('bradyTachy.nextSteps')}</p>
          <p className="text-xs text-muted-foreground">
            {t('bradyTachy.compromisePresentInstruction')}
          </p>
        </div>
    </div>
  );
}
