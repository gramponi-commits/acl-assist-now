import { cn } from '@/lib/utils';
import { Clock, Syringe, Zap } from 'lucide-react';

interface TimerDisplayProps {
  cprRemaining: number;
  epiRemaining: number;
  preShockAlert: boolean;
  isShockable: boolean;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function TimerDisplay({ cprRemaining, epiRemaining, preShockAlert, isShockable }: TimerDisplayProps) {
  const cprUrgent = cprRemaining <= 15000 && cprRemaining > 0;
  const epiDue = epiRemaining === 0;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">Timers</h2>
      <div className="grid grid-cols-2 gap-3">
        {/* CPR Cycle Timer */}
        <div
          className={cn(
            'rounded-lg p-4 text-center border-2 transition-all',
            preShockAlert
              ? 'bg-acls-warning/20 border-acls-warning animate-pulse'
              : cprUrgent
              ? 'bg-acls-critical/20 border-acls-critical'
              : 'bg-card border-border'
          )}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            {isShockable ? <Zap className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
            <span className="text-sm font-medium text-muted-foreground">
              {isShockable ? 'Next Shock' : 'Rhythm Check'}
            </span>
          </div>
          <div className={cn(
            'text-3xl font-mono font-bold',
            preShockAlert ? 'text-acls-warning' : cprUrgent ? 'text-acls-critical' : 'text-foreground'
          )}>
            {formatTime(cprRemaining)}
          </div>
          {preShockAlert && (
            <div className="text-xs text-acls-warning font-medium mt-1">
              PRE-CHARGE AED
            </div>
          )}
        </div>

        {/* Epinephrine Timer */}
        <div
          className={cn(
            'rounded-lg p-4 text-center border-2 transition-all',
            epiDue
              ? 'bg-acls-critical/20 border-acls-critical animate-pulse'
              : 'bg-card border-border'
          )}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Syringe className="h-4 w-4" />
            <span className="text-sm font-medium text-muted-foreground">Epi Due In</span>
          </div>
          <div className={cn(
            'text-3xl font-mono font-bold',
            epiDue ? 'text-acls-critical' : 'text-foreground'
          )}>
            {epiDue ? 'NOW' : formatTime(epiRemaining)}
          </div>
          {epiDue && (
            <div className="text-xs text-acls-critical font-medium mt-1">
              GIVE EPI 1mg
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
