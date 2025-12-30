import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { BradyTachySession } from '@/types/acls';
import { BradyTachyActions } from '@/hooks/useBradyTachyLogic';
import {
  calculatePedsBradyEpinephrine,
  calculatePedsBradyAtropine,
  getAdultBradyAtropine,
  getAdultBradyDopamine,
  getAdultBradyEpinephrineInfusion,
} from '@/lib/bradyTachyDosing';
import { Heart, AlertCircle, Activity } from 'lucide-react';

interface BradycardiaScreenProps {
  session: BradyTachySession;
  actions: BradyTachyActions;
}

export function BradycardiaScreen({ session, actions }: BradycardiaScreenProps) {
  const { t } = useTranslation();
  const { patientGroup, weightKg, stability } = session.decisionContext;
  const isPediatric = patientGroup === 'pediatric';
  const [atropineDoses, setAtropineDoses] = useState(0);

  // Assessment phase
  if (session.phase === 'bradycardia_assessment') {
    return (
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6 max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/20 text-blue-600 text-sm font-medium mb-4">
              <Heart className="h-4 w-4" />
              {t('bradyTachy.bradycardia')}
            </div>
            <h1 className="text-2xl font-bold">{t('bradyTachy.assessment')}</h1>
          </div>

          {/* Initial Assessment Checklist */}
          <div className="bg-card rounded-lg p-4 border-2 border-border">
            <h3 className="font-bold text-lg mb-3">{t('bradyTachy.bradyInitialCare')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <div className="mt-0.5">•</div>
                <div>{t('bradyTachy.bradyMaintainAirway')}</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5">•</div>
                <div>{t('bradyTachy.bradyAssistBreathing')}</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5">•</div>
                <div>{t('bradyTachy.bradyAttachMonitor')}</div>
              </div>
            </div>
          </div>

          {/* Pediatric: Special HR <60 Warning */}
          {isPediatric && (
            <div className="bg-red-600/10 border-2 border-red-600 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-600 font-bold text-lg mb-2">
                <AlertCircle className="h-5 w-5" />
                {t('bradyTachy.pedsBradyHR60StartCPR')}
              </div>
              <p className="text-sm text-muted-foreground">
                If heart rate &lt;60/min with poor perfusion despite adequate oxygenation and ventilation,
                start CPR (use red button at top).
              </p>
            </div>
          )}

          {/* Compromise Assessment */}
          <div className="bg-card rounded-lg p-4 border-2 border-border">
            <h3 className="font-bold text-lg mb-3">{t('bradyTachy.compromise')}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {t('bradyTachy.compromiseCriteria')}
            </p>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2">
                <Checkbox id="hypo" />
                <label htmlFor="hypo">{t('bradyTachy.hypotension')}</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="ams" />
                <label htmlFor="ams">{t('bradyTachy.alteredMentalStatus')}</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="shock" />
                <label htmlFor="shock">{t('bradyTachy.signsOfShock')}</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="chest" />
                <label htmlFor="chest">{t('bradyTachy.ischemicChestDiscomfort')}</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="hf" />
                <label htmlFor="hf">{t('bradyTachy.acuteHeartFailure')}</label>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-4">
              <Button
                onClick={() => actions.setStability('unstable')}
                className="h-16 bg-red-600 hover:bg-red-700 text-white text-lg font-bold"
              >
                {t('bradyTachy.compromiseYes')}
              </Button>
              <Button
                onClick={() => actions.setStability('stable')}
                variant="outline"
                className="h-16 text-lg font-bold"
              >
                {t('bradyTachy.compromiseNo')}
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    );
  }

  // Treatment phase
  if (stability === 'stable') {
    // No compromise - observe and treat cause
    return (
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-600/20 text-green-600 text-sm font-medium mb-4">
              <Activity className="h-4 w-4" />
              {t('bradyTachy.compromiseNo')}
            </div>
            <h1 className="text-2xl font-bold">{t('bradyTachy.bradyNoCompromise')}</h1>
          </div>

          <div className="bg-card rounded-lg p-4 border-2 border-border">
            <h3 className="font-bold text-lg mb-3">{t('bradyTachy.treatment')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <div className="mt-0.5">•</div>
                <div>{t('bradyTachy.bradyIdentifyCause')}</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5">•</div>
                <div>{t('bradyTachy.bradyMaintainAirwaySupport')}</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5">•</div>
                <div>{t('bradyTachy.bradyConsiderOxygen')}</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5">•</div>
                <div>{t('bradyTachy.brady12LeadECG')}</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5">•</div>
                <div>{t('bradyTachy.bradyObserve')}</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => actions.endSession('resolved')}
              className="flex-1 h-12"
            >
              {t('bradyTachy.endSession')}
            </Button>
          </div>
        </div>
      </ScrollArea>
    );
  }

  // Unstable - treatment needed
  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6 max-w-3xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-600 text-sm font-medium mb-4">
            <AlertCircle className="h-4 w-4" />
            {t('bradyTachy.compromiseYes')}
          </div>
          <h1 className="text-2xl font-bold">{t('bradyTachy.bradyCompromiseYes')}</h1>
        </div>

        {/* Pediatric Treatment */}
        {isPediatric ? (
          <>
            {/* Epinephrine */}
            <div className="bg-card rounded-lg p-4 border-2 border-pals-primary">
              <h3 className="font-bold text-lg mb-2">{t('bradyTachy.pedsBradyEpinephrine')}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {calculatePedsBradyEpinephrine(weightKg).display}
              </p>
              <Button
                onClick={() => {
                  const dose = calculatePedsBradyEpinephrine(weightKg);
                  actions.giveEpinephrineInfusion(dose.display);
                }}
                className="w-full h-12 bg-pals-primary hover:bg-pals-primary/90"
              >
                {t('bradyTachy.giveEpiInfusion')}
              </Button>
            </div>

            {/* Atropine */}
            <div className="bg-card rounded-lg p-4 border-2 border-border">
              <h3 className="font-bold text-lg mb-2">{t('bradyTachy.bradyAtropine')}</h3>
              <p className="text-xs text-muted-foreground mb-2">
                {t('bradyTachy.pedsBradyAtropineNote')}
              </p>
              <p className="text-sm font-medium mb-3">
                {calculatePedsBradyAtropine(weightKg).display}
              </p>
              <Button
                onClick={() => {
                  const dose = calculatePedsBradyAtropine(weightKg);
                  actions.giveAtropine(dose.display, 1);
                }}
                variant="outline"
                className="w-full h-12"
              >
                {t('bradyTachy.giveAtropine')}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Adult Atropine */}
            <div className="bg-card rounded-lg p-4 border-2 border-acls-critical">
              <h3 className="font-bold text-lg mb-2">{t('bradyTachy.bradyAtropine')}</h3>
              <div className="space-y-1 text-sm mb-3">
                <p>{t('bradyTachy.bradyAtropineDose')}</p>
                <p>{t('bradyTachy.bradyAtropineRepeat')}</p>
                <p className="font-bold">{t('bradyTachy.bradyAtropineMax')}</p>
              </div>
              <Button
                onClick={() => {
                  const newCount = atropineDoses + 1;
                  setAtropineDoses(newCount);
                  const dose = getAdultBradyAtropine(newCount);
                  actions.giveAtropine(dose.display, newCount);
                }}
                disabled={atropineDoses >= 3}
                className="w-full h-12 bg-acls-critical hover:bg-acls-critical/90"
              >
                {t('bradyTachy.giveAtropine')} {atropineDoses > 0 && `(${atropineDoses}/3)`}
              </Button>
            </div>

            {/* If Atropine Ineffective */}
            <div className="bg-card rounded-lg p-4 border-2 border-border">
              <h3 className="font-bold text-lg mb-3">{t('bradyTachy.bradyIfIneffective')}</h3>
              
              <div className="space-y-3">
                {/* Pacing */}
                <div>
                  <p className="text-sm font-medium mb-2">{t('bradyTachy.bradyPacing')}</p>
                  <Button
                    onClick={() => {
                      actions.addIntervention('note', 'Transcutaneous pacing initiated');
                    }}
                    variant="outline"
                    className="w-full h-10"
                  >
                    {t('bradyTachy.givePacing')}
                  </Button>
                </div>

                {/* Dopamine */}
                <div>
                  <p className="text-sm font-medium mb-1">{t('bradyTachy.bradyDopamine')}</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {getAdultBradyDopamine().display}
                  </p>
                  <Button
                    onClick={() => {
                      const dose = getAdultBradyDopamine();
                      actions.giveDopamine(dose.display);
                    }}
                    variant="outline"
                    className="w-full h-10"
                  >
                    {t('bradyTachy.giveDopamine')}
                  </Button>
                </div>

                {/* Epinephrine Infusion */}
                <div>
                  <p className="text-sm font-medium mb-1">{t('bradyTachy.bradyEpiInfusion')}</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {getAdultBradyEpinephrineInfusion().display}
                  </p>
                  <Button
                    onClick={() => {
                      const dose = getAdultBradyEpinephrineInfusion();
                      actions.giveEpinephrineInfusion(dose.display);
                    }}
                    variant="outline"
                    className="w-full h-10"
                  >
                    {t('bradyTachy.giveEpiInfusion')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Consider */}
            <div className="bg-card rounded-lg p-4 border-2 border-border">
              <h3 className="font-bold text-lg mb-2">{t('bradyTachy.bradyConsider')}</h3>
              <div className="space-y-1 text-sm">
                <p>• {t('bradyTachy.bradyExpertConsult')}</p>
                <p>• {t('bradyTachy.bradyTransvenousPacing')}</p>
              </div>
            </div>

            {/* Possible Causes */}
            <div className="bg-card rounded-lg p-4 border-2 border-border">
              <h3 className="font-bold text-lg mb-2">{t('bradyTachy.bradyPossibleCauses')}</h3>
              <div className="space-y-1 text-sm">
                <p>• {t('bradyTachy.bradyMI')}</p>
                <p>• {t('bradyTachy.bradyDrugsToxins')}</p>
                <p>• {t('bradyTachy.bradyHypoxia')}</p>
                <p>• {t('bradyTachy.bradyElectrolytes')}</p>
              </div>
            </div>
          </>
        )}

        <div className="flex gap-2">
          <Button
            onClick={() => actions.endSession('resolved')}
            className="flex-1 h-12"
          >
            {t('bradyTachy.endSession')}
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}
