import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { User, Baby, Scale, ArrowRight, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WeightInput } from './WeightInput';

export type PathwayMode = 'adult' | 'pediatric';

interface PathwaySelectorProps {
  onSelectPathway: (mode: PathwayMode) => void;
  onStartCPR: () => void;
  onSetWeight: (weight: number | null) => void;
  currentWeight: number | null;
  onSelectBradyTachy?: () => void;
}

type SelectionPhase = 'pathway' | 'pediatric_weight';

export function PathwaySelector({ 
  onSelectPathway, 
  onStartCPR, 
  onSetWeight,
  currentWeight,
  onSelectBradyTachy 
}: PathwaySelectorProps) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<SelectionPhase>('pathway');
  const [showWeightDialog, setShowWeightDialog] = useState(false);

  const handleAdultSelect = () => {
    onSelectPathway('adult');
    // Adult pathway starts CPR immediately
    onStartCPR();
  };

  const handlePediatricSelect = () => {
    onSelectPathway('pediatric');
    setPhase('pediatric_weight');
  };

  const handleWeightSet = (weight: number | null) => {
    onSetWeight(weight);
    setShowWeightDialog(false);
  };

  const handleStartPediatricCPR = () => {
    onStartCPR();
  };

  // Pathway Selection Phase
  if (phase === 'pathway') {
    return (
      <div className="flex flex-col items-center justify-center pt-16 pb-8 space-y-6">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {t('pathway.selectMode')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t('pathway.selectDescription')}
          </p>
        </div>

        <div className="w-full max-w-sm space-y-4">
          {/* Adult ACLS Button */}
          <Button
            onClick={handleAdultSelect}
            className={cn(
              'w-full h-28 flex flex-col items-center justify-center gap-2',
              'bg-acls-critical hover:bg-acls-critical/90 text-white',
              'shadow-lg shadow-acls-critical/30 transition-all',
              'border-2 border-acls-critical'
            )}
          >
            <User className="h-10 w-10" />
            <div className="text-center">
              <div className="text-xl font-bold">{t('pathway.adult')}</div>
              <div className="text-sm opacity-90">{t('pathway.adultACLS')}</div>
            </div>
          </Button>

          {/* Pediatric PALS Button */}
          <Button
            onClick={handlePediatricSelect}
            className={cn(
              'w-full h-28 flex flex-col items-center justify-center gap-2',
              'bg-pals-primary hover:bg-pals-primary/90 text-white',
              'shadow-lg shadow-pals-primary/30 transition-all',
              'border-2 border-pals-primary'
            )}
          >
            <Baby className="h-10 w-10" />
            <div className="text-center">
              <div className="text-xl font-bold">{t('pathway.pediatric')}</div>
              <div className="text-sm opacity-90">{t('pathway.pediatricPALS')}</div>
            </div>
          </Button>

          {/* Bradycardia / Tachycardia (With Pulse) Button */}
          {onSelectBradyTachy && (
            <Button
              onClick={onSelectBradyTachy}
              className={cn(
                'w-full h-28 flex flex-col items-center justify-center gap-2',
                'bg-yellow-500 hover:bg-yellow-600 text-black',
                'shadow-lg shadow-yellow-500/30 transition-all',
                'border-2 border-yellow-600'
              )}
            >
              <Activity className="h-10 w-10" />
              <div className="text-center">
                <div className="text-xl font-bold">{t('bradyTachy.moduleTitle')}</div>
              </div>
            </Button>
          )}
        </div>

        <div className="text-center text-xs text-muted-foreground max-w-xs mt-4">
          <p><strong>{t('pathway.adult')}:</strong> {t('pathway.adultDescription')}</p>
          <p className="mt-1"><strong>{t('pathway.pediatric')}:</strong> {t('pathway.pediatricDescription')}</p>
        </div>
      </div>
    );
  }

  // Pediatric Weight Selection Phase
  return (
    <div className="flex flex-col items-center justify-center pt-16 pb-8 space-y-6">
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pals-primary/20 text-pals-primary text-sm font-medium mb-4">
          <Baby className="h-4 w-4" />
          {t('pathway.pediatricPALS')}
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {t('pathway.setWeight')}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t('pathway.weightDescription')}
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        {/* Set Weight Button */}
        <Button
          onClick={() => setShowWeightDialog(true)}
          variant="outline"
          className={cn(
            'w-full h-20 flex items-center justify-center gap-3',
            'border-2 border-pals-primary text-pals-primary hover:bg-pals-primary/10'
          )}
        >
          <Scale className="h-8 w-8" />
          <div className="text-left">
            <div className="text-lg font-bold">
              {currentWeight ? `${currentWeight} kg` : t('weight.setWeight')}
            </div>
            <div className="text-sm opacity-70">{t('pathway.tapToSetWeight')}</div>
          </div>
        </Button>

        {/* Weight Input Dialog */}
        <WeightInput
          currentWeight={currentWeight}
          onWeightChange={handleWeightSet}
          isOpen={showWeightDialog}
          onOpenChange={setShowWeightDialog}
          showTrigger={false}
        />

        {/* Start CPR Button */}
        <Button
          onClick={handleStartPediatricCPR}
          className={cn(
            'w-full h-24 flex items-center justify-center gap-3',
            'bg-pals-primary hover:bg-pals-primary/90 text-white',
            'shadow-lg shadow-pals-primary/30 transition-all'
          )}
        >
          <ArrowRight className="h-8 w-8" />
          <div className="text-center">
            <div className="text-xl font-bold">{t('actions.startCPR')}</div>
            <div className="text-sm opacity-90">
              {currentWeight ? `${currentWeight} kg` : t('weight.unknownWeight')}
            </div>
          </div>
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          {t('pathway.weightCanBeSetLater')}
        </p>
      </div>
    </div>
  );
}
