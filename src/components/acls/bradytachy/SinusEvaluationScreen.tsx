import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { BradyTachySession } from '@/types/acls';
import { BradyTachyActions } from '@/hooks/useBradyTachyLogic';

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
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold">{t('bradyTachy.pedsSinusVsSVT')}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            {t('bradyTachy.differentiateRhythmDesc')}
          </p>
        </div>

        {/* Option A: Probable Sinus Tachycardia */}
        <div className="bg-card rounded-lg p-3 sm:p-4 border-2 border-border overflow-hidden">
          <h3 className="font-bold text-base sm:text-lg break-words mb-3">
            {t('bradyTachy.pedsProbableSinus')}
          </h3>

          <Accordion type="single" collapsible>
            <AccordionItem value="criteria">
              <AccordionTrigger className="text-sm py-2">{t('bradyTachy.pedsSinusCriteria')}</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-1 text-xs sm:text-sm pt-2 list-disc list-inside">
                  <li>{t('bradyTachy.pedsSinusPWaves')}</li>
                  <li>{t('bradyTachy.pedsSinusVariableRR')}</li>
                  <li>{t('bradyTachy.pedsSinusInfantRate')}</li>
                  <li>{t('bradyTachy.pedsSinusChildRate')}</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="bg-muted rounded p-2 sm:p-3 my-3 text-xs sm:text-sm">
            <p className="font-medium mb-1">{t('bradyTachy.pedsSinusTreatCause')}</p>
            <p className="text-xs text-muted-foreground break-words">
              {t('bradyTachy.searchCausesDesc')}
            </p>
          </div>

          <Button
            onClick={handleProbableSinus}
            className="w-full min-h-11 sm:min-h-12 h-auto px-4 py-3 sm:py-3.5 text-sm sm:text-lg font-bold whitespace-normal text-center leading-snug"
          >
            <span className="whitespace-normal break-words">{t('bradyTachy.pedsProbableSinus')}</span>
          </Button>
        </div>

        {/* Option B: Not Sinus / Concerning Rhythm OR Compromise */}
        <div className="bg-card rounded-lg p-3 sm:p-4 border-2 border-border overflow-hidden">
          <h3 className="font-bold text-base sm:text-lg break-words mb-3">
            {t('bradyTachy.notSinusConcerningRhythm')}
          </h3>

          <p className="text-xs sm:text-sm mb-3 break-words">
            {t('bradyTachy.orCompromiseSuspected')}
          </p>

          <div className="bg-muted rounded p-2 sm:p-3 mb-3 text-xs sm:text-sm">
            <p className="text-xs text-muted-foreground break-words">
              {t('bradyTachy.pedsSVTContinue')}
            </p>
          </div>

          <Button
            onClick={handleConcerningRhythm}
            variant="outline"
            className="w-full min-h-11 sm:min-h-12 h-auto px-4 py-3 sm:py-3.5 text-sm sm:text-lg font-bold whitespace-normal text-center leading-snug"
          >
            <span className="whitespace-normal break-words">
              {t('bradyTachy.continueToCompromiseAssessment')}
            </span>
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}
