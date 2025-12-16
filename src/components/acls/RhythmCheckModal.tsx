import { Button } from '@/components/ui/button';
import { Zap, Heart, Activity, RotateCcw, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RhythmCheckModalProps {
  isShockable: boolean;
  currentEnergy: number;
  shockNumber: number;
  onShock: () => void;
  onNoShockAsystole: () => void;
  onNoShockPEA: () => void;
  onResumeCPR: () => void;
  onROSC: () => void;
  onTerminate: () => void;
}

export function RhythmCheckModal({
  isShockable,
  currentEnergy,
  shockNumber,
  onShock,
  onNoShockAsystole,
  onNoShockPEA,
  onResumeCPR,
  onROSC,
  onTerminate,
}: RhythmCheckModalProps) {
  return (
    <div className="fixed inset-0 bg-background/95 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-acls-warning/20 mb-4">
            <Activity className="h-8 w-8 text-acls-warning" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">RHYTHM CHECK</h2>
          <p className="text-muted-foreground mt-2">
            Pause CPR briefly. Analyze rhythm. Check pulse.
          </p>
        </div>

        <div className="space-y-3">
          {/* SHOCK Button - Most prominent */}
          <Button
            onClick={onShock}
            className={cn(
              'w-full h-20 text-xl font-bold gap-3',
              'bg-acls-shockable hover:bg-acls-shockable/90 text-white',
              'shadow-lg shadow-acls-shockable/30 animate-pulse'
            )}
          >
            <Zap className="h-8 w-8" />
            <div className="text-left">
              <div>SHOCK - VF/pVT</div>
              <div className="text-sm font-normal opacity-90">
                Shock #{shockNumber} @ {currentEnergy}J
              </div>
            </div>
          </Button>

          {/* No Shock Options */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={onNoShockAsystole}
              variant="outline"
              className={cn(
                'h-16 flex-col gap-1 text-base font-bold',
                'border-2 border-acls-non-shockable text-acls-non-shockable',
                'hover:bg-acls-non-shockable hover:text-white'
              )}
            >
              <Activity className="h-5 w-5" />
              <span>Asystole</span>
              <span className="text-xs font-normal">No shock</span>
            </Button>

            <Button
              onClick={onNoShockPEA}
              variant="outline"
              className={cn(
                'h-16 flex-col gap-1 text-base font-bold',
                'border-2 border-acls-pea text-acls-pea',
                'hover:bg-acls-pea hover:text-white'
              )}
            >
              <Heart className="h-5 w-5" />
              <span>PEA</span>
              <span className="text-xs font-normal">No shock</span>
            </Button>
          </div>

          {/* Resume CPR - Same rhythm */}
          <Button
            onClick={onResumeCPR}
            variant="outline"
            className="w-full h-14 text-base font-semibold gap-2 border-2"
          >
            <RotateCcw className="h-5 w-5" />
            Resume CPR - Same Rhythm
          </Button>

          {/* ROSC */}
          <Button
            onClick={onROSC}
            className={cn(
              'w-full h-16 text-lg font-bold gap-3',
              'bg-acls-success hover:bg-acls-success/90 text-white'
            )}
          >
            <Heart className="h-6 w-6" />
            <div className="text-left">
              <div>ROSC - Pulse Detected!</div>
              <div className="text-sm font-normal opacity-90">Spontaneous circulation restored</div>
            </div>
          </Button>

          {/* Terminate Code */}
          <Button
            onClick={onTerminate}
            variant="outline"
            className={cn(
              'w-full h-14 text-base font-semibold gap-2',
              'border-2 border-destructive text-destructive',
              'hover:bg-destructive hover:text-destructive-foreground'
            )}
          >
            <XCircle className="h-5 w-5" />
            Terminate Code - Declare Death
          </Button>
        </div>
      </div>
    </div>
  );
}
