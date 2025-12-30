import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { BradyTachySession } from '@/types/acls';
import { BradyTachyActions } from '@/hooks/useBradyTachyLogic';
import { Activity, Zap } from 'lucide-react';

interface SinusVsSVTSelectorProps {
  session: BradyTachySession;
  actions: BradyTachyActions;
}

export function SinusVsSVTSelector({ session, actions }: SinusVsSVTSelectorProps) {
  const { t } = useTranslation();
  
  // Sinus tachycardia criteria tracking
  const [sinusCriteria, setSinusCriteria] = useState({
    pWavesPresent: false,
    variableRR: false,
    appropriateRate: false,
  });

  // SVT criteria tracking
  const [svtCriteria, setSvtCriteria] = useState({
    pWavesAbnormal: false,
    fixedRR: false,
    inappropriateRate: false,
    abruptRateChange: false,
  });

  const handleSinusSelect = () => {
    actions.setPedsSinusVsSVT('probable_sinus', sinusCriteria);
  };

  const handleSVTSelect = () => {
    actions.setPedsSinusVsSVT('probable_svt', svtCriteria);
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
            Differentiate between sinus tachycardia and SVT
          </p>
        </div>

        {/* Probable Sinus Tachycardia */}
        <div className="bg-card rounded-lg p-4 border-2 border-green-600">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-5 w-5 text-green-600" />
            <h3 className="font-bold text-lg text-green-600">
              {t('bradyTachy.pedsProbableSinus')}
            </h3>
          </div>
          
          <p className="text-sm font-medium mb-2">{t('bradyTachy.pedsSinusCriteria')}</p>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="sinus-pwaves" 
                checked={sinusCriteria.pWavesPresent}
                onCheckedChange={(checked) => 
                  setSinusCriteria(prev => ({ ...prev, pWavesPresent: checked as boolean }))
                }
              />
              <label htmlFor="sinus-pwaves">{t('bradyTachy.pedsSinusPWaves')}</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="sinus-rr" 
                checked={sinusCriteria.variableRR}
                onCheckedChange={(checked) => 
                  setSinusCriteria(prev => ({ ...prev, variableRR: checked as boolean }))
                }
              />
              <label htmlFor="sinus-rr">{t('bradyTachy.pedsSinusVariableRR')}</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="sinus-infant" 
                checked={sinusCriteria.appropriateRate}
                onCheckedChange={(checked) => 
                  setSinusCriteria(prev => ({ ...prev, appropriateRate: checked as boolean }))
                }
              />
              <label htmlFor="sinus-infant" className="flex flex-col">
                <span>{t('bradyTachy.pedsSinusInfantRate')}</span>
                <span>{t('bradyTachy.pedsSinusChildRate')}</span>
              </label>
            </div>
          </div>

          <div className="bg-muted rounded p-3 mb-3 text-sm">
            <p className="font-medium mb-1">{t('bradyTachy.pedsSinusTreatCause')}</p>
            <p className="text-xs text-muted-foreground">
              Search for underlying causes: fever, pain, hypovolemia, anxiety, etc.
            </p>
          </div>

          <Button
            onClick={handleSinusSelect}
            className={cn(
              "w-full h-12 text-lg font-bold",
              "bg-green-600 hover:bg-green-700 text-white"
            )}
          >
            {t('bradyTachy.pedsProbableSinus')}
          </Button>
        </div>

        {/* Probable SVT */}
        <div className="bg-card rounded-lg p-4 border-2 border-pals-primary">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-pals-primary" />
            <h3 className="font-bold text-lg text-pals-primary">
              {t('bradyTachy.pedsProbableSVT')}
            </h3>
          </div>
          
          <p className="text-sm font-medium mb-2">{t('bradyTachy.pedsSVTCriteria')}</p>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="svt-pwaves" 
                checked={svtCriteria.pWavesAbnormal}
                onCheckedChange={(checked) => 
                  setSvtCriteria(prev => ({ ...prev, pWavesAbnormal: checked as boolean }))
                }
              />
              <label htmlFor="svt-pwaves">{t('bradyTachy.pedsSVTPWaves')}</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="svt-rr" 
                checked={svtCriteria.fixedRR}
                onCheckedChange={(checked) => 
                  setSvtCriteria(prev => ({ ...prev, fixedRR: checked as boolean }))
                }
              />
              <label htmlFor="svt-rr">{t('bradyTachy.pedsSVTFixedRR')}</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="svt-rate" 
                checked={svtCriteria.inappropriateRate}
                onCheckedChange={(checked) => 
                  setSvtCriteria(prev => ({ ...prev, inappropriateRate: checked as boolean }))
                }
              />
              <label htmlFor="svt-rate" className="flex flex-col">
                <span>{t('bradyTachy.pedsSVTInfantRate')}</span>
                <span>{t('bradyTachy.pedsSVTChildRate')}</span>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="svt-abrupt" 
                checked={svtCriteria.abruptRateChange}
                onCheckedChange={(checked) => 
                  setSvtCriteria(prev => ({ ...prev, abruptRateChange: checked as boolean }))
                }
              />
              <label htmlFor="svt-abrupt">{t('bradyTachy.pedsSVTAbruptChange')}</label>
            </div>
          </div>

          <div className="bg-muted rounded p-3 mb-3 text-sm">
            <p className="text-xs text-muted-foreground">
              {t('bradyTachy.pedsSVTContinue')}
            </p>
          </div>

          <Button
            onClick={handleSVTSelect}
            className={cn(
              "w-full h-12 text-lg font-bold",
              "bg-pals-primary hover:bg-pals-primary/90 text-white"
            )}
          >
            {t('bradyTachy.pedsProbableSVT')}
          </Button>
        </div>

        {/* Helper note */}
        <div className="text-center text-xs text-muted-foreground">
          <p>Check the criteria that apply, then select the most likely diagnosis.</p>
        </div>
      </div>
    </ScrollArea>
  );
}
