import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuizResult, QuizScenario, QuizAnswer } from '@/types/training';
import { CheckCircle, XCircle, RotateCcw, ArrowLeft, Trophy, Clock, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizResultsProps {
  result: QuizResult;
  scenario: QuizScenario;
  answers: QuizAnswer[];
  onRetry: () => void;
  onBack: () => void;
}

export function QuizResults({ result, scenario, answers, onRetry, onBack }: QuizResultsProps) {
  const { t } = useTranslation();

  const scoreColor = result.score >= 80 ? 'text-green-500' : result.score >= 60 ? 'text-yellow-500' : 'text-red-500';
  const scoreBg = result.score >= 80 ? 'bg-green-500/20' : result.score >= 60 ? 'bg-yellow-500/20' : 'bg-red-500/20';

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-lg mx-auto">
      {/* Score Header */}
      <Card className={cn("border-2", scoreBg)}>
        <CardContent className="pt-6 text-center">
          <Trophy className={cn("h-10 w-10 mx-auto mb-3", scoreColor)} />
          <h2 className="text-4xl font-bold mb-1">
            <span className={scoreColor}>{result.score}%</span>
          </h2>
          <p className="text-muted-foreground">{t('quiz.complete')}</p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-4 text-center">
            <Target className="h-5 w-5 mx-auto mb-1 text-primary" />
            <div className="text-xl font-bold">
              {result.correctAnswers}/{result.totalQuestions}
            </div>
            <p className="text-xs text-muted-foreground">{t('quiz.correctAnswers')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
            <div className="text-xl font-bold">
              {(result.averageTimePerQuestion / 1000).toFixed(1)}s
            </div>
            <p className="text-xs text-muted-foreground">{t('quiz.avgTime')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Answer Timeline */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">{t('quiz.answerTimeline')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {answers.map((answer, index) => {
            const question = scenario.questions[index];
            return (
              <div 
                key={answer.questionId}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg text-sm",
                  answer.isCorrect ? "bg-green-500/10" : "bg-red-500/10"
                )}
              >
                <div className="flex items-center gap-2">
                  {answer.isCorrect ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium">
                    {t(`quiz.rhythms.${question?.correctAnswer || 'unknown'}`)}
                  </span>
                  {!answer.isCorrect && answer.userAnswer && (
                    <span className="text-xs text-muted-foreground">
                      ({t('quiz.youAnswered')}: {t(`quiz.rhythms.${answer.userAnswer}`)})
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {(answer.timeToAnswer / 1000).toFixed(1)}s
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1 gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t('quiz.backToQuizzes')}
        </Button>
        <Button onClick={onRetry} className="flex-1 gap-2">
          <RotateCcw className="h-4 w-4" />
          {t('quiz.tryAgain')}
        </Button>
      </div>
    </div>
  );
}
