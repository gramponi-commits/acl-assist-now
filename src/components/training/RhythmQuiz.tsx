import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { QuizScenario, QuizRhythm, getACLSAction } from '@/types/training';
import { useRhythmQuiz } from '@/hooks/useRhythmQuiz';
import { QuizResults } from './QuizResults';
import { Heart, HeartOff, Zap, Activity, AlertTriangle, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RhythmQuizProps {
  scenario: QuizScenario;
  onBack: () => void;
}

export function RhythmQuiz({ scenario, onBack }: RhythmQuizProps) {
  const { t } = useTranslation();
  const {
    currentQuestion,
    answers,
    isComplete,
    result,
    startQuiz,
    submitAnswer,
    resetQuiz,
    progress,
  } = useRhythmQuiz(scenario);

  const [feedback, setFeedback] = useState<{ isCorrect: boolean; correctAnswer: QuizRhythm } | null>(null);

  useEffect(() => {
    startQuiz();
  }, [startQuiz]);

  const handleAnswer = (answer: QuizRhythm) => {
    if (!currentQuestion || feedback) return;
    
    const isCorrect = submitAnswer(answer);
    setFeedback({ isCorrect, correctAnswer: currentQuestion.correctAnswer });
    
    setTimeout(() => {
      setFeedback(null);
    }, 1500);
  };

  const handleRetry = () => {
    resetQuiz();
    startQuiz();
  };

  if (isComplete && result) {
    return (
      <QuizResults
        result={result}
        scenario={scenario}
        answers={answers}
        onRetry={handleRetry}
        onBack={onBack}
      />
    );
  }

  if (!currentQuestion) return null;

  const rhythmOptions: { value: QuizRhythm; labelKey: string; icon: React.ReactNode; actionKey: string }[] = [
    { value: 'vf', labelKey: 'quiz.rhythms.vf', icon: <Activity className="h-5 w-5" />, actionKey: 'quiz.actions.shock' },
    { value: 'vt', labelKey: 'quiz.rhythms.vt', icon: <Zap className="h-5 w-5" />, actionKey: 'quiz.actions.shock' },
    { value: 'asystole', labelKey: 'quiz.rhythms.asystole', icon: <AlertTriangle className="h-5 w-5" />, actionKey: 'quiz.actions.cpr' },
    { value: 'pea', labelKey: 'quiz.rhythms.pea', icon: <HeartOff className="h-5 w-5" />, actionKey: 'quiz.actions.cpr' },
    { value: 'sinus', labelKey: 'quiz.rhythms.sinus', icon: <Heart className="h-5 w-5" />, actionKey: 'quiz.actions.rosc' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t('common.back')}
        </Button>
        <Badge variant="outline">
          {progress?.current} / {progress?.total}
        </Badge>
      </div>

      {/* Progress */}
      <Progress value={((progress?.current || 1) - 1) / (progress?.total || 1) * 100} className="h-2" />

      {/* ECG Display */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-muted/50 px-3 py-2 border-b border-border">
            <span className="text-sm font-medium text-muted-foreground">{t('quiz.ecgMonitor')}</span>
          </div>
          <div className="bg-gray-900 p-4 flex items-center justify-center min-h-[120px]">
            <img 
              src={currentQuestion.ecgImage} 
              alt="ECG rhythm" 
              className="max-w-full h-auto max-h-[100px] object-contain"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pulse Status */}
      <Card className={cn(
        "border-2",
        currentQuestion.hasPulse 
          ? "bg-green-500/10 border-green-500/50" 
          : "bg-red-500/10 border-red-500/50"
      )}>
        <CardContent className="py-3 flex items-center justify-center gap-3">
          {currentQuestion.hasPulse ? (
            <>
              <Heart className="h-6 w-6 text-green-500 animate-pulse" />
              <span className="text-lg font-bold text-green-500">{t('quiz.pulsePresent')}</span>
            </>
          ) : (
            <>
              <HeartOff className="h-6 w-6 text-red-500" />
              <span className="text-lg font-bold text-red-500">{t('quiz.noPulse')}</span>
            </>
          )}
        </CardContent>
      </Card>

      {/* Question */}
      <h3 className="text-lg font-semibold text-center">{t('quiz.whatRhythm')}</h3>

      {/* Rhythm Options */}
      <div className="grid grid-cols-1 gap-2">
        {rhythmOptions.map((option) => (
          <Button
            key={option.value}
            variant="outline"
            className="h-auto py-3 flex items-center justify-between hover:bg-primary/10 hover:border-primary"
            onClick={() => handleAnswer(option.value)}
            disabled={!!feedback}
          >
            <div className="flex items-center gap-3">
              {option.icon}
              <span className="font-medium">{t(option.labelKey)}</span>
            </div>
            <span className="text-xs text-muted-foreground">→ {t(option.actionKey)}</span>
          </Button>
        ))}
      </div>

      {/* Feedback Overlay */}
      {feedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={cn(
            "flex flex-col items-center gap-3 p-8 rounded-2xl",
            feedback.isCorrect ? "bg-green-500/20" : "bg-red-500/20"
          )}>
            {feedback.isCorrect ? (
              <>
                <CheckCircle className="h-14 w-14 text-green-500" />
                <span className="text-xl font-bold text-green-500">{t('quiz.correct')}</span>
              </>
            ) : (
              <>
                <XCircle className="h-14 w-14 text-red-500" />
                <span className="text-xl font-bold text-red-500">{t('quiz.incorrect')}</span>
                <span className="text-muted-foreground text-sm">
                  {t('quiz.correctWas')}: {t(`quiz.rhythms.${feedback.correctAnswer}`)}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
