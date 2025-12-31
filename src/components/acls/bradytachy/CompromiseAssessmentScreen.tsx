import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { BradyTachySession } from '@/types/acls';
import { BradyTachyActions } from '@/hooks/useBradyTachyLogic';
import { AlertCircle, Activity } from 'lucide-react';

interface CompromiseAssessmentScreenProps {
  session: BradyTachySession;
  actions: BradyTachyActions;
}

export function CompromiseAssessmentScreen({ session, actions }: CompromiseAssessmentScreenProps) {
  const { t } = useTranslation();

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pals-primary/20 text-pals-primary text-sm font-medium mb-4">
            <Activity className="h-4 w-4" />
            {t('bradyTachy.pediatric')} - {t('bradyTachy.tachycardia')}
          </div>
          <h1 className="text-2xl font-bold">{t('bradyTachy.pedsCompromiseQuestion')}</h1>
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
              className={cn(
                "h-16 text-lg font-bold",
                "bg-red-600 hover:bg-red-700 text-white",
                "flex items-center justify-center gap-2"
              )}
            >
              <AlertCircle className="h-5 w-5" />
              {t('bradyTachy.pedsCompromiseYes')}
            </Button>
            <Button
              onClick={() => actions.setStability('stable')}
              variant="outline"
              className="h-16 text-lg font-bold"
            >
              {t('bradyTachy.pedsCompromiseNo')}
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
    </ScrollArea>
  );
}
