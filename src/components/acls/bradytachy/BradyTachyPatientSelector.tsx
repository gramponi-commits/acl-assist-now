import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { User, Baby, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WeightInput } from '../WeightInput';
import { BradyTachySession, PathwayMode } from '@/types/acls';
import { BradyTachyActions } from '@/hooks/useBradyTachyLogic';

interface BradyTachyPatientSelectorProps {
  session: BradyTachySession;
  actions: BradyTachyActions;
}

export function BradyTachyPatientSelector({ session, actions }: BradyTachyPatientSelectorProps) {
  const { t } = useTranslation();
  const [showWeightDialog, setShowWeightDialog] = useState(false);
  const patientGroup = session.decisionContext.patientGroup;
  const currentWeight = session.decisionContext.weightKg;

  const handlePatientGroupSelect = (group: PathwayMode) => {
    actions.setPatientGroup(group);
    if (group === 'pediatric') {
      // For pediatric, show weight input option
      actions.setPhase('branch_selection');
    } else {
      // For adult, go directly to branch selection
      actions.setPhase('branch_selection');
    }
  };

  const handleWeightSet = (weight: number | null) => {
    actions.setPatientWeight(weight);
    setShowWeightDialog(false);
  };

  const handleBranchSelect = (branch: 'bradycardia' | 'tachycardia') => {
    actions.setBranch(branch);
  };

  // Patient selection phase
  if (session.phase === 'patient_selection') {
    return (
      <div className="flex flex-col items-center justify-center pt-16 pb-8 space-y-6 px-4">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {t('bradyTachy.selectPatientGroup')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t('bradyTachy.moduleTitle')}
          </p>
        </div>

        <div className="w-full max-w-sm space-y-4">
          {/* Adult ACLS Button */}
          <Button
            onClick={() => handlePatientGroupSelect('adult')}
            className={cn(
              'w-full h-28 flex flex-col items-center justify-center gap-2',
              'bg-acls-critical hover:bg-acls-critical/90 text-white',
              'shadow-lg shadow-acls-critical/30 transition-all',
              'border-2 border-acls-critical'
            )}
          >
            <User className="h-10 w-10" />
            <div className="text-center">
              <div className="text-xl font-bold">{t('bradyTachy.adult')}</div>
            </div>
          </Button>

          {/* Pediatric PALS Button */}
          <Button
            onClick={() => handlePatientGroupSelect('pediatric')}
            className={cn(
              'w-full h-28 flex flex-col items-center justify-center gap-2',
              'bg-pals-primary hover:bg-pals-primary/90 text-white',
              'shadow-lg shadow-pals-primary/30 transition-all',
              'border-2 border-pals-primary'
            )}
          >
            <Baby className="h-10 w-10" />
            <div className="text-center">
              <div className="text-xl font-bold">{t('bradyTachy.pediatric')}</div>
            </div>
          </Button>
        </div>
      </div>
    );
  }

  // Branch selection phase
  return (
    <div className="flex flex-col items-center justify-center pt-8 pb-8 space-y-6 px-4">
      <div className="text-center mb-4">
        <div className={cn(
          "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4",
          patientGroup === 'pediatric' 
            ? "bg-pals-primary/20 text-pals-primary"
            : "bg-acls-critical/20 text-acls-critical"
        )}>
          {patientGroup === 'pediatric' ? <Baby className="h-4 w-4" /> : <User className="h-4 w-4" />}
          {patientGroup === 'pediatric' ? t('bradyTachy.pediatric') : t('bradyTachy.adult')}
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {t('bradyTachy.selectBranch')}
        </h1>
      </div>

      {/* Weight Input for Pediatric (Optional) */}
      {patientGroup === 'pediatric' && (
        <div className="w-full max-w-sm mb-4">
          <Button
            onClick={() => setShowWeightDialog(true)}
            variant="outline"
            className={cn(
              'w-full h-16 flex items-center justify-center gap-3',
              'border-2 border-pals-primary text-pals-primary hover:bg-pals-primary/10'
            )}
          >
            <Scale className="h-6 w-6" />
            <div className="text-left">
              <div className="text-lg font-bold">
                {currentWeight ? `${currentWeight} kg` : t('bradyTachy.optionalWeight')}
              </div>
              <div className="text-sm opacity-70">{t('bradyTachy.weightForDosing')}</div>
            </div>
          </Button>

          <WeightInput
            currentWeight={currentWeight}
            onWeightChange={handleWeightSet}
            isOpen={showWeightDialog}
            onOpenChange={setShowWeightDialog}
            showTrigger={false}
          />
        </div>
      )}

      <div className="w-full max-w-sm space-y-4">
        {/* Bradycardia Button */}
        <Button
          onClick={() => handleBranchSelect('bradycardia')}
          className={cn(
            'w-full h-24 flex flex-col items-center justify-center gap-2',
            'bg-acls-bradycardia hover:bg-acls-bradycardia/90 text-white',
            'shadow-lg shadow-acls-bradycardia/30 transition-all',
            'text-xl font-bold border-0'
          )}
        >
          {t('bradyTachy.bradycardia')}
        </Button>

        {/* Tachycardia Button */}
        <Button
          onClick={() => handleBranchSelect('tachycardia')}
          className={cn(
            'w-full h-24 flex flex-col items-center justify-center gap-2',
            'bg-acls-tachycardia hover:bg-acls-tachycardia/90 text-white',
            'shadow-lg shadow-acls-tachycardia/30 transition-all',
            'text-xl font-bold border-0'
          )}
        >
          {t('bradyTachy.tachycardia')}
        </Button>
      </div>
    </div>
  );
}
