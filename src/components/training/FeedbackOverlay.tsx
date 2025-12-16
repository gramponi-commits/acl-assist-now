import { ActionFeedback } from '@/types/training';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';

interface FeedbackOverlayProps {
  feedback: ActionFeedback | null;
  visible: boolean;
}

const timingStyles = {
  'on-time': {
    bg: 'bg-green-500/20 border-green-500',
    text: 'text-green-400',
    icon: CheckCircle,
  },
  'early': {
    bg: 'bg-yellow-500/20 border-yellow-500',
    text: 'text-yellow-400',
    icon: AlertCircle,
  },
  'late': {
    bg: 'bg-orange-500/20 border-orange-500',
    text: 'text-orange-400',
    icon: Clock,
  },
  'missed': {
    bg: 'bg-red-500/20 border-red-500',
    text: 'text-red-400',
    icon: XCircle,
  },
};

export function FeedbackOverlay({ feedback, visible }: FeedbackOverlayProps) {
  if (!feedback || !visible) return null;

  const style = timingStyles[feedback.timing];
  const Icon = style.icon;

  return (
    <div className={cn(
      'fixed top-20 left-1/2 -translate-x-1/2 z-50',
      'px-6 py-3 rounded-lg border-2',
      'animate-in fade-in slide-in-from-top-4 duration-300',
      style.bg
    )}>
      <div className="flex items-center gap-3">
        <Icon className={cn('h-6 w-6', style.text)} />
        <div>
          <p className={cn('font-semibold', style.text)}>
            {feedback.message}
          </p>
          {feedback.points > 0 && (
            <p className="text-sm text-muted-foreground">
              +{feedback.points} points
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
