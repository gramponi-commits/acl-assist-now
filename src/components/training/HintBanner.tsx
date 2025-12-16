import { Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HintBannerProps {
  hint: string | null;
}

export function HintBanner({ hint }: HintBannerProps) {
  if (!hint) return null;

  return (
    <div className={cn(
      'fixed bottom-20 left-1/2 -translate-x-1/2 z-40',
      'px-4 py-2 rounded-lg',
      'bg-blue-500/20 border border-blue-500/50',
      'animate-in fade-in slide-in-from-bottom-2 duration-300'
    )}>
      <div className="flex items-center gap-2 text-blue-400">
        <Lightbulb className="h-4 w-4" />
        <span className="text-sm font-medium">{hint}</span>
      </div>
    </div>
  );
}
