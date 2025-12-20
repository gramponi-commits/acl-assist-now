import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AirwayStatus } from '@/types/acls';
import { cn } from '@/lib/utils';
import { Wind, Activity } from 'lucide-react';

interface CPRQualityPanelProps {
  airwayStatus: AirwayStatus;
  onAirwayChange: (status: AirwayStatus) => void;
  onETCO2Record?: (value: number) => void;
}

export function CPRQualityPanel({ airwayStatus, onAirwayChange, onETCO2Record }: CPRQualityPanelProps) {
  const { t } = useTranslation();
  const [etco2, setEtco2] = useState<string>('');
  const [lastRecordedValue, setLastRecordedValue] = useState<number | null>(null);

  const handleETCO2Submit = () => {
    const numValue = parseInt(etco2);
    if (!isNaN(numValue) && numValue > 0 && numValue !== lastRecordedValue && onETCO2Record) {
      onETCO2Record(numValue);
      setLastRecordedValue(numValue);
    }
  };

  const handleETCO2KeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleETCO2Submit();
    }
  };

  const etco2Value = parseInt(etco2);
  const etco2Status = isNaN(etco2Value) ? null : etco2Value >= 10 ? 'good' : 'low';

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">{t('cpr.title')}</h2>
      
      {/* ETCO2 */}
      <div className="bg-card rounded-lg p-4 border border-border">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">ETCO₂ (mmHg)</span>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="ETCO₂"
            value={etco2}
            onChange={(e) => setEtco2(e.target.value)}
            onKeyDown={handleETCO2KeyDown}
            className="h-12 text-lg font-mono flex-1"
          />
          <Button
            onClick={handleETCO2Submit}
            disabled={!etco2 || isNaN(parseInt(etco2)) || parseInt(etco2) <= 0}
            className="h-12 px-4"
          >
            {t('cpr.record')}
          </Button>
          {etco2Status && (
            <div className={cn(
              'px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap',
              etco2Status === 'good' ? 'bg-acls-success/20 text-acls-success' : 'bg-acls-critical/20 text-acls-critical'
            )}>
              {etco2Status === 'good' ? '≥10 ✓' : '<10 ⚠'}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {t('postRosc.target')}: ≥10 mmHg
        </p>
      </div>

      {/* Airway Status */}
      <div className="bg-card rounded-lg p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Wind className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t('airway.title')}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onAirwayChange('ambu')}
            className={cn(
              'flex flex-col items-center justify-center p-2 rounded-md border transition-all min-h-[60px]',
              airwayStatus === 'ambu' 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'border-border hover:bg-accent'
            )}
          >
            <span className="font-semibold text-sm">{t('airway.ambu')}</span>
            <span className={cn(
              'text-[10px] leading-tight text-center',
              airwayStatus === 'ambu' ? 'text-primary-foreground/80' : 'text-muted-foreground'
            )}>{t('airway.ambuDesc')}</span>
          </button>
          <button
            onClick={() => onAirwayChange('sga')}
            className={cn(
              'flex flex-col items-center justify-center p-2 rounded-md border transition-all min-h-[60px]',
              airwayStatus === 'sga' 
                ? 'bg-acls-warning text-white border-acls-warning' 
                : 'border-border hover:bg-accent'
            )}
          >
            <span className="font-semibold text-sm">{t('airway.sga')}</span>
            <span className={cn(
              'text-[10px] leading-tight text-center',
              airwayStatus === 'sga' ? 'text-white/80' : 'text-muted-foreground'
            )}>{t('airway.sgaDesc')}</span>
          </button>
          <button
            onClick={() => onAirwayChange('ett')}
            className={cn(
              'flex flex-col items-center justify-center p-2 rounded-md border transition-all min-h-[60px]',
              airwayStatus === 'ett' 
                ? 'bg-acls-success text-white border-acls-success' 
                : 'border-border hover:bg-accent'
            )}
          >
            <span className="font-semibold text-sm">{t('airway.ett')}</span>
            <span className={cn(
              'text-[10px] leading-tight text-center',
              airwayStatus === 'ett' ? 'text-white/80' : 'text-muted-foreground'
            )}>{t('airway.ettDesc')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
