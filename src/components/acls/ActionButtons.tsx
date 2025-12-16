import { Button } from '@/components/ui/button';
import { Syringe, Pill, Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionButtonsProps {
  canGiveEpinephrine: boolean;
  canGiveAmiodarone: boolean;
  epiDue: boolean;
  rhythmCheckDue: boolean;
  epinephrineCount: number;
  amiodaroneCount: number;
  onEpinephrine: () => void;
  onAmiodarone: () => void;
  onRhythmCheck: () => void;
}

export function ActionButtons({
  canGiveEpinephrine,
  canGiveAmiodarone,
  epiDue,
  rhythmCheckDue,
  epinephrineCount,
  amiodaroneCount,
  onEpinephrine,
  onAmiodarone,
  onRhythmCheck,
}: ActionButtonsProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">Actions</h2>
      
      {/* Rhythm Check Button - Most prominent when due */}
      <Button
        onClick={onRhythmCheck}
        className={cn(
          'w-full h-16 text-lg font-bold gap-3 transition-all',
          rhythmCheckDue
            ? 'bg-acls-critical hover:bg-acls-critical/90 text-white animate-pulse shadow-lg shadow-acls-critical/30'
            : 'bg-acls-info hover:bg-acls-info/90 text-white'
        )}
      >
        <Stethoscope className="h-6 w-6" />
        <span>{rhythmCheckDue ? 'RHYTHM CHECK NOW' : 'RHYTHM CHECK'}</span>
      </Button>

      <div className="grid grid-cols-2 gap-3">
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
      </div>
    </div>
  );
}
