import { useTranslation } from 'react-i18next';
import { TrainingScenario, Difficulty } from '@/types/training';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScenarioCardProps {
  scenario: TrainingScenario;
  onStart: (scenario: TrainingScenario) => void;
}

const difficultyColors: Record<Difficulty, string> = {
  beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
  intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const rhythmColors: Record<string, string> = {
  'VF/pVT': 'text-acls-shockable',
  'Asystole': 'text-acls-nonshockable',
  'PEA': 'text-acls-nonshockable',
};

export function ScenarioCard({ scenario, onStart }: ScenarioCardProps) {
  const { i18n, t } = useTranslation();
  const isItalian = i18n.language === 'it';

  const name = isItalian ? scenario.nameIt : scenario.name;
  const description = isItalian ? scenario.descriptionIt : scenario.description;
  const objectives = isItalian ? scenario.learningObjectivesIt : scenario.learningObjectives;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{name}</CardTitle>
          <Badge variant="outline" className={cn('capitalize', difficultyColors[scenario.difficulty])}>
            {t(`training.difficulty.${scenario.difficulty}`)}
          </Badge>
        </div>
        <CardDescription className="text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Zap className={cn('h-4 w-4', rhythmColors[scenario.initialRhythm])} />
            <span>{scenario.initialRhythm}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(scenario.estimatedDuration)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1 text-sm font-medium">
            <Target className="h-4 w-4" />
            <span>{t('training.objectives')}</span>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1 pl-5 list-disc">
            {objectives.slice(0, 3).map((obj, i) => (
              <li key={i}>{obj}</li>
            ))}
            {objectives.length > 3 && (
              <li className="text-muted-foreground/60">+{objectives.length - 3} {t('training.more')}</li>
            )}
          </ul>
        </div>

        <Button 
          className="w-full" 
          onClick={() => onStart(scenario)}
        >
          {t('training.startScenario')}
        </Button>
      </CardContent>
    </Card>
  );
}
