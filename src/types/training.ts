import { RhythmType } from './acls';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// ========== RHYTHM QUIZ TYPES ==========
export type QuizRhythm = 'vf' | 'vt' | 'asystole' | 'pea' | 'sinus';

export interface RhythmQuestion {
  id: string;
  ecgImage: string;
  correctAnswer: QuizRhythm;
  hasPulse: boolean; // true = sinus rhythm (ROSC), false with organized rhythm = PEA
  difficulty: Difficulty;
}

export interface QuizScenario {
  id: string;
  nameKey: string;
  descriptionKey: string;
  difficulty: Difficulty;
  questions: RhythmQuestion[];
}

export interface QuizAnswer {
  questionId: string;
  userAnswer: QuizRhythm | null;
  isCorrect: boolean;
  timeToAnswer: number;
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  averageTimePerQuestion: number;
  score: number;
}

export function getACLSAction(rhythm: QuizRhythm): 'shock' | 'cpr' | 'rosc' {
  switch (rhythm) {
    case 'vf':
    case 'vt':
      return 'shock';
    case 'asystole':
    case 'pea':
      return 'cpr';
    case 'sinus':
      return 'rosc';
  }
}

// ========== SIMULATION SCENARIO TYPES ==========
export type ActionType = 
  | 'shock'
  | 'epinephrine'
  | 'amiodarone'
  | 'lidocaine'
  | 'rhythmCheck'
  | 'rosc'
  | 'terminate';

export interface ExpectedAction {
  type: ActionType;
  windowStart: number;
  windowEnd: number;
  required: boolean;
  hint?: string;
}

export interface ScenarioEvent {
  triggerTime?: number;
  triggerAfterAction?: ActionType;
  triggerAfterShocks?: number;
  newRhythm?: RhythmType;
  rosc?: boolean;
  description: string;
}

export interface TrainingScenario {
  id: string;
  name: string;
  nameIt: string;
  description: string;
  descriptionIt: string;
  difficulty: Difficulty;
  initialRhythm: RhythmType;
  events: ScenarioEvent[];
  expectedActions: ExpectedAction[];
  learningObjectives: string[];
  learningObjectivesIt: string[];
  estimatedDuration: number;
}

export interface ActionFeedback {
  action: ActionType;
  timestamp: number;
  isCorrect: boolean;
  timing: 'early' | 'on-time' | 'late' | 'missed';
  expectedWindow?: { start: number; end: number };
  points: number;
  message: string;
}

export interface TrainingSession {
  scenarioId: string;
  startedAt: Date;
  completedAt?: Date;
  actions: ActionFeedback[];
  totalScore: number;
  maxPossibleScore: number;
  cprFraction: number;
  protocolAdherence: number;
  timingAccuracy: number;
  outcome: 'completed' | 'failed' | 'abandoned';
}

export interface TrainingState {
  isTrainingMode: boolean;
  currentScenario: TrainingScenario | null;
  session: TrainingSession | null;
  currentEventIndex: number;
  pendingHints: string[];
  showFeedback: boolean;
  lastFeedback: ActionFeedback | null;
}
