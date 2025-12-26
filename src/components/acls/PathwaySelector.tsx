import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { User, Baby } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PathwayMode = 'adult' | 'pediatric';

interface PathwaySelectorProps {
  onSelectPathway: (mode: PathwayMode) => void;
}

export function PathwaySelector({ onSelectPathway }: PathwaySelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center pt-16 pb-8 space-y-6">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {t('pathway.selectMode')}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t('pathway.selectDescription')}
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        {/* Adult ACLS Button */}
        <Button
          onClick={() => onSelectPathway('adult')}
          className={cn(
            'w-full h-28 flex flex-col items-center justify-center gap-2',
            'bg-acls-critical hover:bg-acls-critical/90 text-white',
            'shadow-lg shadow-acls-critical/30 transition-all',
            'border-2 border-acls-critical'
          )}
        >
          <User className="h-10 w-10" />
          <div className="text-center">
            <div className="text-xl font-bold">{t('pathway.adult')}</div>
            <div className="text-sm opacity-90">{t('pathway.adultACLS')}</div>
          </div>
        </Button>

        {/* Pediatric PALS Button */}
        <Button
          onClick={() => onSelectPathway('pediatric')}
          className={cn(
            'w-full h-28 flex flex-col items-center justify-center gap-2',
            'bg-pals-primary hover:bg-pals-primary/90 text-white',
            'shadow-lg shadow-pals-primary/30 transition-all',
            'border-2 border-pals-primary'
          )}
        >
          <Baby className="h-10 w-10" />
          <div className="text-center">
            <div className="text-xl font-bold">{t('pathway.pediatric')}</div>
            <div className="text-sm opacity-90">{t('pathway.pediatricPALS')}</div>
          </div>
        </Button>
      </div>

      <div className="text-center text-xs text-muted-foreground max-w-xs mt-4">
        <p><strong>{t('pathway.adult')}:</strong> {t('pathway.adultDescription')}</p>
        <p className="mt-1"><strong>{t('pathway.pediatric')}:</strong> {t('pathway.pediatricDescription')}</p>
      </div>
    </div>
  );
}
