import { useTranslation } from 'react-i18next';
import { TrainingSession, TrainingScenario, ActionFeedback } from '@/types/training';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trophy, Target, Clock, Heart, RotateCcw, ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerformanceReviewProps {
  session: TrainingSession;
  scenario: TrainingScenario;
  onRetry: () => void;
  onBack: () => void;
}

export function PerformanceReview({ session, scenario, onRetry, onBack }: PerformanceReviewProps) {
  const { t, i18n } = useTranslation();
  const isItalian = i18n.language === 'it';

  const scorePercentage = session.maxPossibleScore > 0 
    ? Math.round((session.totalScore / session.maxPossibleScore) * 100) 
    : 0;

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A', color: 'text-green-400', label: t('training.grades.excellent') };
    if (percentage >= 80) return { grade: 'B', color: 'text-blue-400', label: t('training.grades.good') };
    if (percentage >= 70) return { grade: 'C', color: 'text-yellow-400', label: t('training.grades.satisfactory') };
    if (percentage >= 60) return { grade: 'D', color: 'text-orange-400', label: t('training.grades.needsWork') };
    return { grade: 'F', color: 'text-red-400', label: t('training.grades.unsatisfactory') };
  };

  const gradeInfo = getGrade(scorePercentage);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getActionIcon = (feedback: ActionFeedback) => {
    switch (feedback.timing) {
      case 'on-time':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'early':
      case 'late':
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      case 'missed':
        return <XCircle className="h-4 w-4 text-red-400" />;
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">{t('training.reviewTitle')}</h1>
        <p className="text-muted-foreground">
          {isItalian ? scenario.nameIt : scenario.name}
        </p>
      </div>

      {/* Score Card */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <Trophy className={cn('h-12 w-12 mx-auto mb-2', gradeInfo.color)} />
              <div className={cn('text-4xl font-bold', gradeInfo.color)}>
                {gradeInfo.grade}
              </div>
              <p className="text-sm text-muted-foreground">{gradeInfo.label}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{scorePercentage}%</div>
              <p className="text-sm text-muted-foreground">
                {session.totalScore} / {session.maxPossibleScore} {t('training.points')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-card border-border">
          <CardContent className="pt-4 text-center">
            <Target className="h-6 w-6 mx-auto mb-1 text-primary" />
            <div className="text-xl font-bold">{Math.round(session.protocolAdherence)}%</div>
            <p className="text-xs text-muted-foreground">{t('training.protocolAdherence')}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4 text-center">
            <Clock className="h-6 w-6 mx-auto mb-1 text-primary" />
            <div className="text-xl font-bold">{Math.round(session.timingAccuracy)}%</div>
            <p className="text-xs text-muted-foreground">{t('training.timingAccuracy')}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4 text-center">
            <Heart className="h-6 w-6 mx-auto mb-1 text-acls-shockable" />
            <div className="text-xl font-bold">{Math.round(session.cprFraction)}%</div>
            <p className="text-xs text-muted-foreground">{t('training.cprFraction')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Timeline */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('training.actionTimeline')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            {session.actions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('training.noActions')}
              </p>
            ) : (
              <div className="space-y-2">
                {session.actions.map((action, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 text-sm py-2 border-b border-border last:border-0"
                  >
                    {getActionIcon(action)}
                    <span className="font-mono text-muted-foreground w-12">
                      {formatTime(action.timestamp)}
                    </span>
                    <span className="flex-1 capitalize">{action.action}</span>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded',
                      action.timing === 'on-time' && 'bg-green-500/20 text-green-400',
                      action.timing === 'early' && 'bg-yellow-500/20 text-yellow-400',
                      action.timing === 'late' && 'bg-orange-500/20 text-orange-400',
                      action.timing === 'missed' && 'bg-red-500/20 text-red-400',
                    )}>
                      {action.timing}
                    </span>
                    <span className="text-muted-foreground w-12 text-right">
                      +{action.points}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('training.backToScenarios')}
        </Button>
        <Button className="flex-1" onClick={onRetry}>
          <RotateCcw className="h-4 w-4 mr-2" />
          {t('training.retry')}
        </Button>
      </div>
    </div>
  );
}
