import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { BradyTachySession, CardioversionRhythmType } from '@/types/acls';
import { BradyTachyActions } from '@/hooks/useBradyTachyLogic';
import { SinusVsSVTSelector } from './SinusVsSVTSelector';
import { SinusEvaluationScreen } from './SinusEvaluationScreen';
import { CompromiseAssessmentScreen } from './CompromiseAssessmentScreen';
import {
  calculatePedsTachyAdenosine,
  calculatePedsTachyCardioversion,
  getAdultTachyAdenosine,
  getAdultTachyCardioversion,
  getAdultTachyProcainamide,
  getAdultTachyAmiodarone,
  getAdultTachyRateControl,
  getAdultTachyDiltiazem,
  getAdultTachyVerapamil,
  getAdultTachyMetoprolol,
  getAdultTachyEsmolol,
} from '@/lib/bradyTachyDosing';
import { Zap, AlertCircle, Activity, AlertTriangle } from 'lucide-react';

interface TachycardiaScreenProps {
  session: BradyTachySession;
  actions: BradyTachyActions;
  onSwitchToArrest: () => void;
}

export function TachycardiaScreen({ session, actions, onSwitchToArrest }: TachycardiaScreenProps) {
  const { t } = useTranslation();
  const { patientGroup, weightKg, stability, qrsWidth, rhythmRegular, pedsSinusVsSVTChoice, cardioversionRhythmType } = session.decisionContext;
  const isPediatric = patientGroup === 'pediatric';
  const [adenosineDoses, setAdenosineDoses] = useState(0);
  const [cardioversionAttempts, setCardioversionAttempts] = useState(0);
  const [showSyncReminder, setShowSyncReminder] = useState(true);

  // If pediatric sinus tachycardia selected, show "treat cause" guidance
  // This check must come BEFORE the assessment phase check
  if (isPediatric && pedsSinusVsSVTChoice === 'probable_sinus') {
    return (
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-600/20 text-green-600 text-sm font-medium mb-4">
              <Activity className="h-4 w-4" />
              {t('bradyTachy.pedsProbableSinus')}
            </div>
            <h1 className="text-2xl font-bold">{t('bradyTachy.pedsSinusTreatCause')}</h1>
          </div>

          <div className="bg-card rounded-lg p-4 border-2 border-border">
            <p className="text-sm">
              {t('bradyTachy.sinusTachyDescription')}
            </p>
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

  // Pediatric: First show sinus evaluation screen (NEW FLOW)
  if (isPediatric && session.phase === 'tachycardia_assessment') {
    return <SinusEvaluationScreen session={session} actions={actions} />;
  }

  // Pediatric: Then cardiopulmonary compromise assessment (NEW FLOW)
  if (isPediatric && session.phase === 'tachycardia_compromise_assessment') {
    return <CompromiseAssessmentScreen session={session} actions={actions} />;
  }

  // Adult initial assessment (unchanged)
  if (!isPediatric && session.phase === 'tachycardia_assessment') {
    return (
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6 max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/20 text-orange-600 text-sm font-medium mb-4">
              <Zap className="h-4 w-4" />
              {t('bradyTachy.tachycardia')}
            </div>
            <h1 className="text-2xl font-bold">{t('bradyTachy.assessment')}</h1>
          </div>

          {/* Initial Assessment Checklist */}
          <div className="bg-card rounded-lg p-4 border-2 border-border">
            <h3 className="font-bold text-lg mb-3">{t('bradyTachy.tachyInitialCare')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <div className="mt-0.5">•</div>
                <div>{t('bradyTachy.tachyMaintainAirway')}</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5">•</div>
                <div>{t('bradyTachy.tachyOxygen')}</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5">•</div>
                <div>{t('bradyTachy.tachyMonitor')}</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5">•</div>
                <div>{t('bradyTachy.tachyIVAccess')}</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5">•</div>
                <div>{t('bradyTachy.tachy12LeadECG')}</div>
              </div>
            </div>
          </div>

          {/* Instability Assessment */}
          <div className="bg-card rounded-lg p-4 border-2 border-border">
            <h3 className="font-bold text-lg mb-3">{t('bradyTachy.tachyInstability')}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {t('bradyTachy.tachyInstabilityCriteria')}
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
                {t('bradyTachy.tachyUnstable')}
              </Button>
              <Button
                onClick={() => actions.setStability('stable')}
                variant="outline"
                className="h-16 text-lg font-bold"
              >
                {t('bradyTachy.tachyStable')}
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    );
  }

  // Unstable - Cardioversion
  if (stability === 'unstable') {
    return (
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-600 text-sm font-medium mb-4">
              <AlertCircle className="h-4 w-4" />
              {t('bradyTachy.tachyUnstable')}
            </div>
            <h1 className="text-2xl font-bold">{t('bradyTachy.treatment')}</h1>
          </div>

          {/* SYNC Mode Reminder Banner */}
          {showSyncReminder && (
            <Alert className="border-red-600 bg-red-600/10">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-sm">
                <div className="font-bold text-red-600 mb-2">{t('bradyTachy.syncModeReminder')}</div>
                <div className="space-y-1">
                  <p>• {t('bradyTachy.enableSyncMode')}</p>
                  <p className="font-medium">• {t('bradyTachy.recheckSync')}</p>
                  <p className="text-xs text-muted-foreground">{t('bradyTachy.recheckSyncDetail')}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Rhythm Selection for Cardioversion (Adult only) */}
          {!isPediatric && !cardioversionRhythmType && (
            <div className="bg-card rounded-lg p-4 border-2 border-acls-critical">
              <h3 className="font-bold text-lg mb-3">{t('bradyTachy.selectRhythmForCardioversion')}</h3>
              <div className="space-y-2">
                <Button
                  onClick={() => actions.setCardioversionRhythmType('afib')}
                  variant="outline"
                  className="w-full h-12 justify-start"
                >
                  {t('bradyTachy.rhythmAtrialFib')} - 200 J
                </Button>
                <Button
                  onClick={() => actions.setCardioversionRhythmType('aflutter')}
                  variant="outline"
                  className="w-full h-12 justify-start"
                >
                  {t('bradyTachy.rhythmAtrialFlutter')} - 200 J
                </Button>
                <Button
                  onClick={() => actions.setCardioversionRhythmType('narrow')}
                  variant="outline"
                  className="w-full h-12 justify-start"
                >
                  {t('bradyTachy.rhythmNarrowComplex')} - 100 J
                </Button>
                <Button
                  onClick={() => actions.setCardioversionRhythmType('monomorphic_vt')}
                  variant="outline"
                  className="w-full h-12 justify-start"
                >
                  {t('bradyTachy.rhythmMonomorphicVT')} - 100 J
                </Button>
                <Button
                  onClick={() => actions.setCardioversionRhythmType('polymorphic_vt')}
                  variant="outline"
                  className="w-full h-12 justify-start text-red-600"
                >
                  {t('bradyTachy.rhythmPolymorphicVT')}
                </Button>
              </div>
            </div>
          )}

          {/* Cardioversion */}
          {(isPediatric || cardioversionRhythmType) && (
            <div className={cn(
              "bg-card rounded-lg p-4 border-2",
              isPediatric ? "border-pals-primary" : "border-acls-critical"
            )}>
              <h3 className="font-bold text-lg mb-2">{t('bradyTachy.tachySyncCardioversion')}</h3>
              <div className="space-y-1 text-sm mb-3">
                <p>{t('bradyTachy.tachyConsiderSedation')}</p>
                <p>{t('bradyTachy.tachyIfRegularNarrow')}</p>
                {isPediatric ? (
                  <p className="font-bold mt-2">
                    {t('bradyTachy.pedsTachyCardioversionInitial')}
                  </p>
                ) : cardioversionRhythmType === 'polymorphic_vt' ? (
                  <p className="font-bold mt-2 text-red-600">
                    {t('bradyTachy.polymorphicVTWarning')}
                  </p>
                ) : (
                  <p className="font-bold mt-2">
                    Energy: {getAdultTachyCardioversion(cardioversionRhythmType).display}
                  </p>
                )}
              </div>
              
              {isPediatric ? (
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      setCardioversionAttempts(prev => prev + 1);
                      const energy = calculatePedsTachyCardioversion(weightKg, 1);
                      actions.giveCardioversion(energy.display);
                    }}
                    className={cn(
                      "w-full h-12",
                      "bg-pals-primary hover:bg-pals-primary/90"
                    )}
                  >
                    {t('bradyTachy.giveCardioversion')} - {calculatePedsTachyCardioversion(weightKg, 1).display}
                  </Button>
                  {cardioversionAttempts >= 1 && (
                    <Button
                      onClick={() => {
                        setCardioversionAttempts(prev => prev + 1);
                        const energy = calculatePedsTachyCardioversion(weightKg, 2);
                        actions.giveCardioversion(energy.display);
                      }}
                      variant="outline"
                      className="w-full h-12"
                    >
                      {t('bradyTachy.giveCardioversion')} (Higher) - {calculatePedsTachyCardioversion(weightKg, 2).display}
                    </Button>
                  )}
                </div>
              ) : cardioversionRhythmType !== 'polymorphic_vt' ? (
                <Button
                  onClick={() => {
                    const energy = getAdultTachyCardioversion(cardioversionRhythmType);
                    actions.giveCardioversion(energy.display);
                    setCardioversionAttempts(prev => prev + 1);
                  }}
                  className={cn(
                    "w-full h-12",
                    "bg-acls-critical hover:bg-acls-critical/90"
                  )}
                >
                  {t('bradyTachy.giveCardioversion')} - {getAdultTachyCardioversion(cardioversionRhythmType).display}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    actions.giveCardioversion(t('bradyTachy.defibrillationUnsynchronized'));
                    setCardioversionAttempts(prev => prev + 1);
                    // Redirect to ACLS CPR after defibrillation for polymorphic VT
                    setTimeout(() => {
                      onSwitchToArrest();
                    }, 100);
                  }}
                  className="w-full h-12 bg-red-600 hover:bg-red-700"
                >
                  {t('bradyTachy.deliverDefibrillation')}
                </Button>
              )}
            </div>
          )}

          {/* If Refractory */}
          <div className="bg-card rounded-lg p-4 border-2 border-border">
            <h3 className="font-bold text-lg mb-2">{t('bradyTachy.tachyIfRefractory')}</h3>
            <div className="space-y-1 text-sm">
              <p>• {t('bradyTachy.tachyUnderlyingCause')}</p>
              <p>• {t('bradyTachy.tachyIncreaseEnergy')}</p>
              <p>• {t('bradyTachy.tachyAddAntiarrhythmic')}</p>
              <p>• {t('bradyTachy.tachyExpertConsult')}</p>
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

  // Stable - Need QRS assessment
  if (qrsWidth === null) {
    return (
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/20 text-blue-600 text-sm font-medium mb-4">
              <Activity className="h-4 w-4" />
              {t('bradyTachy.tachyStable')}
            </div>
            <h1 className="text-2xl font-bold">{t('bradyTachy.tachyWideQRS')}</h1>
          </div>

          <div className="bg-card rounded-lg p-4 border-2 border-border">
            <p className="text-sm text-muted-foreground mb-4">
              {t('bradyTachy.qrsWidthDesc')}
            </p>
            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={() => actions.setQRSWidth('narrow')}
                className="h-16 text-lg font-bold"
              >
                {t('bradyTachy.tachyNarrowQRS')} ({'<'}0.12 s)
              </Button>
              <Button
                onClick={() => actions.setQRSWidth('wide')}
                variant="outline"
                className="h-16 text-lg font-bold"
              >
                {t('bradyTachy.tachyWideQRSPath')} (≥0.12 s)
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    );
  }

  // Narrow QRS treatment
  if (qrsWidth === 'narrow') {
    return (
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/20 text-blue-600 text-sm font-medium mb-4">
              <Activity className="h-4 w-4" />
              {t('bradyTachy.tachyNarrowQRS')}
            </div>
            <h1 className="text-2xl font-bold">{t('bradyTachy.treatment')}</h1>
          </div>

          {/* Vagal Maneuvers */}
          <div className="bg-card rounded-lg p-4 border-2 border-border">
            <h3 className="font-bold text-lg mb-2">{t('bradyTachy.tachyNarrowVagal')}</h3>
            <Button
              onClick={() => actions.performVagalManeuver()}
              variant="outline"
              className="w-full h-12"
            >
              {t('bradyTachy.performVagal')}
            </Button>
          </div>

          {/* Adenosine */}
          <div className={cn(
            "bg-card rounded-lg p-4 border-2",
            isPediatric ? "border-pals-primary" : "border-acls-critical"
          )}>
            <h3 className="font-bold text-lg mb-2">{t('bradyTachy.tachyNarrowAdenosine')}</h3>
            {isPediatric ? (
              <>
                <p className="text-sm mb-3">{t('bradyTachy.pedsTachyAdenosineDose1')}</p>
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      setAdenosineDoses(1);
                      const dose = calculatePedsTachyAdenosine(weightKg, 1);
                      actions.giveAdenosine(dose.display, 1);
                    }}
                    disabled={adenosineDoses >= 1}
                    className="w-full h-12 bg-pals-primary hover:bg-pals-primary/90"
                  >
                    {t('bradyTachy.giveAdenosine')} Dose 1 - {calculatePedsTachyAdenosine(weightKg, 1).display}
                  </Button>
                  {adenosineDoses >= 1 && (
                    <>
                      <p className="text-sm">{t('bradyTachy.pedsTachyAdenosineDose2')}</p>
                      <Button
                        onClick={() => {
                          setAdenosineDoses(2);
                          const dose = calculatePedsTachyAdenosine(weightKg, 2);
                          actions.giveAdenosine(dose.display, 2);
                        }}
                        disabled={adenosineDoses >= 2}
                        className="w-full h-12 bg-pals-primary hover:bg-pals-primary/90"
                      >
                        {t('bradyTachy.giveAdenosine')} Dose 2 - {calculatePedsTachyAdenosine(weightKg, 2).display}
                      </Button>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="text-sm mb-1">{t('bradyTachy.tachyAdenosineDose1')}</p>
                <p className="text-sm mb-3">{t('bradyTachy.tachyAdenosineDose2')}</p>
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      setAdenosineDoses(1);
                      const dose = getAdultTachyAdenosine(1);
                      actions.giveAdenosine(dose.display, 1);
                    }}
                    disabled={adenosineDoses >= 1}
                    className="w-full h-12 bg-acls-critical hover:bg-acls-critical/90"
                  >
                    {t('bradyTachy.giveAdenosine')} 6 mg
                  </Button>
                  {adenosineDoses >= 1 && (
                    <Button
                      onClick={() => {
                        setAdenosineDoses(2);
                        const dose = getAdultTachyAdenosine(2);
                        actions.giveAdenosine(dose.display, 2);
                      }}
                      disabled={adenosineDoses >= 2}
                      className="w-full h-12 bg-acls-critical hover:bg-acls-critical/90"
                    >
                      {t('bradyTachy.giveAdenosine')} 12 mg
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Beta-blocker / Calcium blocker (adult only) - Second-line medications */}
          {!isPediatric && (
            <div className="bg-card rounded-lg p-4 border-2 border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">{t('bradyTachy.secondLineMedications')}</h3>
                <p className="text-sm text-muted-foreground mb-3">{t('bradyTachy.eitherOrInstruction')}</p>
              </div>

              {/* Calcium Channel Blockers */}
              <div className="space-y-3">
                <h4 className="font-semibold text-md">{t('bradyTachy.calciumChannelBlockers')}</h4>
                
                {/* Diltiazem */}
                <div className="bg-muted/50 rounded p-3 space-y-2">
                  <div className="font-medium">{t('bradyTachy.diltiazem')}</div>
                  <div className="text-sm space-y-1">
                    <p>• <span className="font-medium">{t('bradyTachy.diltiazemBolus')}</span></p>
                    <p>• {t('bradyTachy.diltiazemMaint')}</p>
                  </div>
                  <Button
                    onClick={() => {
                      const dose = getAdultTachyDiltiazem();
                      actions.giveDiltiazem(`${dose.loading.display}; ${dose.maintenance.display}`);
                    }}
                    variant="outline"
                    className="w-full h-10"
                  >
                    {t('bradyTachy.giveDiltiazem')}
                  </Button>
                </div>

                {/* Verapamil */}
                <div className="bg-muted/50 rounded p-3 space-y-2">
                  <div className="font-medium">{t('bradyTachy.verapamil')}</div>
                  <div className="text-sm space-y-1">
                    <p>• <span className="font-medium">{t('bradyTachy.verapamilInitial')}</span></p>
                    <p>• {t('bradyTachy.verapamilRepeat')}</p>
                  </div>
                  <Button
                    onClick={() => {
                      const dose = getAdultTachyVerapamil();
                      actions.giveVerapamil(`${dose.initial.display}; ${dose.repeat.display}`);
                    }}
                    variant="outline"
                    className="w-full h-10"
                  >
                    {t('bradyTachy.giveVerapamil')}
                  </Button>
                </div>
              </div>

              {/* Beta-Blockers */}
              <div className="space-y-3">
                <h4 className="font-semibold text-md">{t('bradyTachy.betaBlockers')}</h4>
                
                {/* Metoprolol */}
                <div className="bg-muted/50 rounded p-3 space-y-2">
                  <div className="font-medium">{t('bradyTachy.metoprolol')}</div>
                  <div className="text-sm">
                    <p>• <span className="font-medium">{t('bradyTachy.metoprololDose')}</span></p>
                  </div>
                  <Button
                    onClick={() => {
                      const dose = getAdultTachyMetoprolol();
                      actions.giveMetoprolol(dose.display);
                    }}
                    variant="outline"
                    className="w-full h-10"
                  >
                    {t('bradyTachy.giveMetoprolol')}
                  </Button>
                </div>

                {/* Esmolol */}
                <div className="bg-muted/50 rounded p-3 space-y-2">
                  <div className="font-medium">{t('bradyTachy.esmolol')}</div>
                  <div className="text-sm space-y-1">
                    <p>• <span className="font-medium">{t('bradyTachy.esmololLoad')}</span></p>
                    <p>• {t('bradyTachy.esmololMaint')}</p>
                  </div>
                  <Button
                    onClick={() => {
                      const dose = getAdultTachyEsmolol();
                      actions.giveEsmolol(`${dose.loading.display}; ${dose.maintenance.display}`);
                    }}
                    variant="outline"
                    className="w-full h-10"
                  >
                    {t('bradyTachy.giveEsmolol')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-card rounded-lg p-4 border-2 border-border">
            <p className="text-sm">• {t('bradyTachy.tachyConsiderExpert')}</p>
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

  // Wide QRS treatment (adult only - pediatric wouldn't typically reach here)
  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6 max-w-3xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/20 text-orange-600 text-sm font-medium mb-4">
            <Zap className="h-4 w-4" />
            {t('bradyTachy.tachyWideQRSPath')}
          </div>
          <h1 className="text-2xl font-bold">{t('bradyTachy.treatment')}</h1>
        </div>

        {/* Adenosine (only if regular and monomorphic) */}
        <div className="bg-card rounded-lg p-4 border-2 border-yellow-600">
          <h3 className="font-bold text-lg mb-2">{t('bradyTachy.tachyWideAdenosine')}</h3>
          <Button
            onClick={() => {
              const dose = getAdultTachyAdenosine(1);
              actions.giveAdenosine(dose.display, 1);
            }}
            variant="outline"
            className="w-full h-12"
          >
            {t('bradyTachy.giveAdenosine')} {t('bradyTachy.ifRegularMonomorphic')}
          </Button>
        </div>

        {/* Antiarrhythmic options - Adult only */}
        {!isPediatric && (
          <div className="bg-card rounded-lg p-4 border-2 border-acls-critical">
            <h3 className="font-bold text-lg mb-3">{t('bradyTachy.tachyWideAntiarrhythmic')}</h3>
            
            {/* Procainamide */}
            <div className="mb-4">
              <h4 className="font-bold text-md mb-1">{t('bradyTachy.tachyProcainamide')}</h4>
              <p className="text-xs text-muted-foreground mb-1">
                {getAdultTachyProcainamide().loading.display}
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                {t('bradyTachy.tachyProcainamideMaint')}
              </p>
              <p className="text-xs text-yellow-600 mb-2">
                ⚠️ {t('bradyTachy.tachyProcainamideAvoid')}
              </p>
              <Button
                onClick={() => {
                  const dose = getAdultTachyProcainamide();
                  actions.giveProcainamide(dose.loading.display);
                }}
                variant="outline"
                className="w-full h-10"
              >
                {t('bradyTachy.giveProcainamide')}
              </Button>
            </div>

            {/* Amiodarone */}
            <div>
              <h4 className="font-bold text-md mb-1">{t('bradyTachy.tachyAmiodarone')}</h4>
              <p className="text-xs text-muted-foreground mb-1">
                {getAdultTachyAmiodarone().loading.display}
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                {t('bradyTachy.tachyAmiodaroneMaint')}
              </p>
              <Button
                onClick={() => {
                  const dose = getAdultTachyAmiodarone();
                  actions.giveAmiodarone(dose.loading.display);
                }}
                className="w-full h-10 bg-acls-critical hover:bg-acls-critical/90"
              >
                {t('bradyTachy.giveAmiodarone')}
              </Button>
            </div>
          </div>
        )}

        <div className="bg-card rounded-lg p-4 border-2 border-border">
          <p className="text-sm">• {t('bradyTachy.tachyExpertConsult')}</p>
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
