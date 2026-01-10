import { useTranslation } from 'react-i18next';
import { Baby, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PathwayMode } from '@/types/acls';

interface PediatricToggleProps {
  mode: PathwayMode;
  onToggle: (mode: PathwayMode) => void;
}

/**
 * PediatricToggle - Wide pill toggle for Adult/Pediatric mode selection
 * Shows state text inside with icon for visual distinction
 * Uses color change + text change for accessibility
 */
export function PediatricToggle({ mode, onToggle }: PediatricToggleProps) {
  const { t } = useTranslation();
  const isPediatric = mode === 'pediatric';

  const handleToggle = () => {
    onToggle(isPediatric ? 'adult' : 'pediatric');
  };

  return (
    <div className="w-full">
      <button
        onClick={handleToggle}
        className={cn(
          'w-full h-14 rounded-full flex items-center justify-between px-4',
          'transition-all duration-200 ease-in-out',
          'border-2 focus:outline-none focus:ring-2 focus:ring-offset-2',
          'min-h-[44px]', // Ensure minimum touch target
          isPediatric
            ? 'bg-pals-primary border-pals-primary text-white focus:ring-pals-primary'
            : 'bg-muted border-border text-foreground focus:ring-border'
        )}
        role="switch"
        aria-checked={isPediatric}
        aria-label={t('pathway.pediatricToggle')}
      >
        {/* Left side - Icon and label */}
        <div className="flex items-center gap-3">
          {isPediatric ? (
            <Baby className="h-6 w-6" />
          ) : (
            <User className="h-6 w-6" />
          )}
          <span className="text-lg font-bold">
            {t('pathway.pediatricToggle')}
          </span>
        </div>

        {/* Right side - Toggle indicator with state text */}
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold',
            'transition-colors duration-200',
            isPediatric
              ? 'bg-white/20 text-white'
              : 'bg-background text-muted-foreground'
          )}
        >
          <span>
            {isPediatric
              ? t('pathway.pediatricToggleOn')
              : t('pathway.pediatricToggleOff')}
          </span>
          <div className="relative w-10 h-5 rounded-full bg-black/10">
            <div
              className={cn(
                'absolute top-0.5 left-0.5 h-4 w-4 rounded-full shadow transition-transform duration-200',
                isPediatric
                  ? 'translate-x-4 bg-white'
                  : 'translate-x-0 bg-muted-foreground'
              )}
            />
          </div>
        </div>
      </button>

      {/* Helper text */}
      <p className="text-xs text-muted-foreground text-center mt-2">
        {t('pathway.pediatricToggleHelper')}
      </p>
    </div>
  );
}
