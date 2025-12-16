import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { QuizScenario } from '@/types/training';
import { quizScenarios } from '@/data/scenarios';
import { QuizCard } from '@/components/training/QuizCard';
import { RhythmQuiz } from '@/components/training/RhythmQuiz';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GraduationCap } from 'lucide-react';

export default function Training() {
  const { t } = useTranslation();
  const [activeQuiz, setActiveQuiz] = useState<QuizScenario | null>(null);

  if (activeQuiz) {
    return (
      <RhythmQuiz 
        scenario={activeQuiz} 
        onBack={() => setActiveQuiz(null)} 
      />
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('training.title')} | ACLS</title>
      </Helmet>
      
      <div className="flex flex-col h-full bg-background">
        <div className="px-4 py-6 border-b border-border">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">{t('training.title')}</h1>
          </div>
          <p className="text-muted-foreground">{t('quiz.subtitle')}</p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 grid gap-4 md:grid-cols-2">
            {quizScenarios.map((scenario) => (
              <QuizCard
                key={scenario.id}
                scenario={scenario}
                onStart={() => setActiveQuiz(scenario)}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
