import { cn } from '@/lib/utils';

interface CommandBannerProps {
  message: string;
  priority: 'critical' | 'warning' | 'info' | 'success';
  subMessage?: string;
}

export function CommandBanner({ message, priority, subMessage }: CommandBannerProps) {
  return (
    <div
      className={cn(
        'w-full px-4 py-4 text-center transition-all duration-300',
        priority === 'critical' && 'bg-acls-critical text-acls-critical-foreground animate-pulse',
        priority === 'warning' && 'bg-acls-warning text-acls-warning-foreground',
        priority === 'info' && 'bg-acls-info text-acls-info-foreground',
        priority === 'success' && 'bg-acls-success text-acls-success-foreground'
      )}
    >
      <h1 className="text-xl md:text-2xl font-bold tracking-wide">{message}</h1>
      {subMessage && (
        <p className="text-sm md:text-base mt-1 opacity-90">{subMessage}</p>
      )}
    </div>
  );
}
