import { RhythmType } from './acls';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

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
  windowStart: number; // seconds from scenario start
  windowEnd: number;   // seconds from scenario start
  required: boolean;
  hint?: string;
}

export interface ScenarioEvent {
  triggerTime?: number;           // seconds from start
  triggerAfterAction?: ActionType; // trigger after user action
  triggerAfterShocks?: number;    // trigger after X shocks
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
  estimatedDuration: number; // seconds
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
  protocolAdherence: number; // percentage
  timingAccuracy: number;    // percentage
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
