import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuizScenario } from '@/types/training';
import { Play } from 'lucide-react';

interface QuizCardProps {
  scenario: QuizScenario;
  onStart: () => void;
}

export function QuizCard({ scenario, onStart }: QuizCardProps) {
  const { t } = useTranslation();

  const difficultyColor = {
    beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
    intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{t(`quiz.${scenario.nameKey}`)}</CardTitle>
          <Badge className={difficultyColor[scenario.difficulty]} variant="outline">
            {t(`training.difficulty.${scenario.difficulty}`)}
          </Badge>
        </div>
        <CardDescription className="text-muted-foreground text-sm">
          {t(`quiz.${scenario.descriptionKey}`)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {scenario.questions.length} {t('quiz.questions')}
          </span>
          <Button onClick={onStart} size="sm" className="gap-2">
            <Play className="h-4 w-4" />
            {t('quiz.start')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
