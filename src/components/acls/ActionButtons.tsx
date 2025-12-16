import { Button } from '@/components/ui/button';
import { Zap, Syringe, Pill, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionButtonsProps {
  canDeliverShock: boolean;
  canGiveEpinephrine: boolean;
  canGiveAmiodarone: boolean;
  epiDue: boolean;
  shockCount: number;
  currentEnergy: number;
  epinephrineCount: number;
  amiodaroneCount: number;
  onShock: () => void;
  onEpinephrine: () => void;
  onAmiodarone: () => void;
  onROSC: () => void;
}

export function ActionButtons({
  canDeliverShock,
  canGiveEpinephrine,
  canGiveAmiodarone,
  epiDue,
  shockCount,
  currentEnergy,
  epinephrineCount,
  amiodaroneCount,
  onShock,
  onEpinephrine,
  onAmiodarone,
  onROSC,
}: ActionButtonsProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        {/* Shock Button */}
        <Button
          onClick={onShock}
          disabled={!canDeliverShock}
          className={cn(
            'h-20 flex-col gap-1 text-base font-bold transition-all',
            canDeliverShock 
              ? 'bg-acls-shockable hover:bg-acls-shockable/90 text-white shadow-lg shadow-acls-shockable/30' 
              : 'bg-muted text-muted-foreground'
          )}
        >
          <Zap className="h-6 w-6" />
          <span>SHOCK</span>
          <span className="text-xs font-normal">
            #{shockCount + 1} @ {currentEnergy}J
          </span>
        </Button>

        {/* Epinephrine Button */}
        <Button
          onClick={onEpinephrine}
          disabled={!canGiveEpinephrine}
          className={cn(
            'h-20 flex-col gap-1 text-base font-bold transition-all',
            epiDue && canGiveEpinephrine
              ? 'bg-acls-critical hover:bg-acls-critical/90 text-white animate-pulse shadow-lg shadow-acls-critical/30'
              : canGiveEpinephrine
              ? 'bg-acls-medication hover:bg-acls-medication/90 text-white'
              : 'bg-muted text-muted-foreground'
          )}
        >
          <Syringe className="h-6 w-6" />
          <span>EPINEPHRINE</span>
          <span className="text-xs font-normal">
            1mg IV/IO (#{epinephrineCount + 1})
          </span>
        </Button>

        {/* Amiodarone Button */}
        <Button
          onClick={onAmiodarone}
          disabled={!canGiveAmiodarone}
          className={cn(
            'h-20 flex-col gap-1 text-base font-bold transition-all',
            canGiveAmiodarone
              ? 'bg-acls-medication hover:bg-acls-medication/90 text-white'
              : 'bg-muted text-muted-foreground'
          )}
        >
          <Pill className="h-6 w-6" />
          <span>AMIODARONE</span>
          <span className="text-xs font-normal">
            {amiodaroneCount === 0 ? '300mg' : '150mg'} (#{amiodaroneCount + 1})
          </span>
        </Button>

        {/* ROSC Button */}
        <Button
          onClick={onROSC}
          className="h-20 flex-col gap-1 text-base font-bold bg-acls-success hover:bg-acls-success/90 text-white transition-all"
        >
          <Heart className="h-6 w-6" />
          <span>ROSC</span>
          <span className="text-xs font-normal">Pulse Restored</span>
        </Button>
      </div>
    </div>
  );
}
