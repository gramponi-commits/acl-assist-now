import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { TrainingScenario, Difficulty } from '@/types/training';
import { scenarios, getScenariosByDifficulty } from '@/data/scenarios';
import { ScenarioCard } from '@/components/training/ScenarioCard';
import { TrainingCodeScreen } from '@/components/training/TrainingCodeScreen';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GraduationCap } from 'lucide-react';

export default function Training() {
  const { t } = useTranslation();
  const [activeScenario, setActiveScenario] = useState<TrainingScenario | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  const filteredScenarios = getScenariosByDifficulty(difficultyFilter);

  if (activeScenario) {
    return (
      <TrainingCodeScreen 
        scenario={activeScenario} 
        onExit={() => setActiveScenario(null)} 
      />
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('training.title')} | ACLS</title>
      </Helmet>
      
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="px-4 py-6 border-b border-border">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">{t('training.title')}</h1>
          </div>
          <p className="text-muted-foreground">
            {t('training.subtitle')}
          </p>
        </div>

        {/* Difficulty Filter */}
        <div className="px-4 py-3 border-b border-border">
          <Tabs value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                {t('training.allLevels')}
              </TabsTrigger>
              <TabsTrigger value="beginner" className="flex-1">
                {t('training.difficulty.beginner')}
              </TabsTrigger>
              <TabsTrigger value="intermediate" className="flex-1">
                {t('training.difficulty.intermediate')}
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex-1">
                {t('training.difficulty.advanced')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Scenarios Grid */}
        <ScrollArea className="flex-1">
          <div className="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredScenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                onStart={setActiveScenario}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
