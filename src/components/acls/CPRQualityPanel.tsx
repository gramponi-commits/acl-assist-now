import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AirwayStatus } from '@/types/acls';
import { cn } from '@/lib/utils';
import { Wind, Activity } from 'lucide-react';

interface CPRQualityPanelProps {
  airwayStatus: AirwayStatus;
  onAirwayChange: (status: AirwayStatus) => void;
  onETCO2Change?: (value: number) => void;
}

export function CPRQualityPanel({ airwayStatus, onAirwayChange, onETCO2Change }: CPRQualityPanelProps) {
  const [etco2, setEtco2] = useState<string>('');

  const handleETCO2Change = (value: string) => {
    setEtco2(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && onETCO2Change) {
      onETCO2Change(numValue);
    }
  };

  const etco2Value = parseInt(etco2);
  const etco2Status = isNaN(etco2Value) ? null : etco2Value >= 10 ? 'good' : 'low';

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">CPR Quality</h2>
      
      {/* ETCO2 */}
      <div className="bg-card rounded-lg p-4 border border-border">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">ETCO₂ (mmHg)</span>
        </div>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            placeholder="Enter ETCO₂"
            value={etco2}
            onChange={(e) => handleETCO2Change(e.target.value)}
            className="h-12 text-lg font-mono"
          />
          {etco2Status && (
            <div className={cn(
              'px-3 py-1 rounded-full text-sm font-medium',
              etco2Status === 'good' ? 'bg-acls-success/20 text-acls-success' : 'bg-acls-critical/20 text-acls-critical'
            )}>
              {etco2Status === 'good' ? '≥10 ✓' : '<10 ⚠'}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Target: ≥10 mmHg indicates adequate CPR quality
        </p>
      </div>

      {/* Airway Status */}
      <div className="bg-card rounded-lg p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Wind className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Airway Management</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAirwayChange('none')}
            className={cn(
              'h-12 transition-all',
              airwayStatus === 'none' && 'bg-primary text-primary-foreground border-primary'
            )}
          >
            None
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAirwayChange('bvm')}
            className={cn(
              'h-12 transition-all',
              airwayStatus === 'bvm' && 'bg-primary text-primary-foreground border-primary'
            )}
          >
            BVM
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAirwayChange('advanced')}
            className={cn(
              'h-12 transition-all',
              airwayStatus === 'advanced' && 'bg-acls-success text-white border-acls-success'
            )}
          >
            Advanced
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {airwayStatus === 'advanced' 
            ? 'Continuous compressions with 10 breaths/min' 
            : '30:2 compression-ventilation ratio'}
        </p>
      </div>
    </div>
  );
}
