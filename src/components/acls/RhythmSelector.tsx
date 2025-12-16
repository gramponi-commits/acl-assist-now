import { Button } from '@/components/ui/button';
import { RhythmType } from '@/types/acls';
import { Zap, Activity, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RhythmSelectorProps {
  currentRhythm: RhythmType;
  onSelectRhythm: (rhythm: RhythmType) => void;
  isInitial?: boolean;
}

export function RhythmSelector({ currentRhythm, onSelectRhythm, isInitial = true }: RhythmSelectorProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">
        {isInitial ? 'Select Initial Rhythm' : 'Change Rhythm'}
      </h2>
      <div className="grid grid-cols-1 gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={() => onSelectRhythm('vf_pvt')}
          className={cn(
            'h-16 text-lg font-bold justify-start gap-3 border-2 transition-all',
            'bg-acls-shockable/10 border-acls-shockable text-acls-shockable',
            'hover:bg-acls-shockable hover:text-white',
            currentRhythm === 'vf_pvt' && 'bg-acls-shockable text-white ring-2 ring-acls-shockable ring-offset-2 ring-offset-background'
          )}
        >
          <Zap className="h-6 w-6" />
          <div className="text-left">
            <div>VF / pVT</div>
            <div className="text-xs font-normal opacity-80">Shockable Rhythm</div>
          </div>
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={() => onSelectRhythm('asystole')}
          className={cn(
            'h-16 text-lg font-bold justify-start gap-3 border-2 transition-all',
            'bg-acls-non-shockable/10 border-acls-non-shockable text-acls-non-shockable',
            'hover:bg-acls-non-shockable hover:text-white',
            currentRhythm === 'asystole' && 'bg-acls-non-shockable text-white ring-2 ring-acls-non-shockable ring-offset-2 ring-offset-background'
          )}
        >
          <Activity className="h-6 w-6" />
          <div className="text-left">
            <div>Asystole</div>
            <div className="text-xs font-normal opacity-80">Non-Shockable</div>
          </div>
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={() => onSelectRhythm('pea')}
          className={cn(
            'h-16 text-lg font-bold justify-start gap-3 border-2 transition-all',
            'bg-acls-pea/10 border-acls-pea text-acls-pea',
            'hover:bg-acls-pea hover:text-white',
            currentRhythm === 'pea' && 'bg-acls-pea text-white ring-2 ring-acls-pea ring-offset-2 ring-offset-background'
          )}
        >
          <Heart className="h-6 w-6" />
          <div className="text-left">
            <div>PEA</div>
            <div className="text-xs font-normal opacity-80">Non-Shockable</div>
          </div>
        </Button>
      </div>
    </div>
  );
}
