import { useState, useCallback, useMemo } from 'react';
import { QuizScenario, QuizAnswer, QuizResult, QuizRhythm } from '@/types/training';

export function useRhythmQuiz(scenario: QuizScenario | null) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = useMemo(() => {
    if (!scenario || currentIndex >= scenario.questions.length) return null;
    return scenario.questions[currentIndex];
  }, [scenario, currentIndex]);

  const startQuiz = useCallback(() => {
    setCurrentIndex(0);
    setAnswers([]);
    setQuestionStartTime(Date.now());
    setIsComplete(false);
  }, []);

  const submitAnswer = useCallback((answer: QuizRhythm): boolean => {
    if (!scenario || !currentQuestion) return false;

    const timeToAnswer = Date.now() - questionStartTime;
    const isCorrect = answer === currentQuestion.correctAnswer;

    const newAnswer: QuizAnswer = {
      questionId: currentQuestion.id,
      userAnswer: answer,
      isCorrect,
      timeToAnswer,
    };

    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    const isLastQuestion = currentIndex >= scenario.questions.length - 1;
    
    if (isLastQuestion) {
      setIsComplete(true);
    } else {
      setCurrentIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
    }

    return isCorrect;
  }, [scenario, currentQuestion, currentIndex, answers, questionStartTime]);

  const result = useMemo((): QuizResult | null => {
    if (!scenario || !isComplete) return null;

    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const totalQuestions = scenario.questions.length;
    const avgTime = answers.reduce((acc, a) => acc + a.timeToAnswer, 0) / totalQuestions;

    return {
      totalQuestions,
      correctAnswers,
      averageTimePerQuestion: avgTime,
      score: Math.round((correctAnswers / totalQuestions) * 100),
    };
  }, [scenario, answers, isComplete]);

  const resetQuiz = useCallback(() => {
    setCurrentIndex(0);
    setAnswers([]);
    setIsComplete(false);
  }, []);

  return {
    currentQuestion,
    currentIndex,
    answers,
    isComplete,
    result,
    startQuiz,
    submitAnswer,
    resetQuiz,
    progress: scenario ? { current: currentIndex + 1, total: scenario.questions.length } : null,
  };
}
