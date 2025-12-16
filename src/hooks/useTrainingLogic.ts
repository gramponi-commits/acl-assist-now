import { useState, useCallback, useRef, useEffect } from 'react';
import { TrainingScenario, TrainingSession, ActionFeedback, ActionType, TrainingState } from '@/types/training';
import { RhythmType } from '@/types/acls';

const POINTS = {
  onTime: 100,
  early: 50,
  late: 25,
  missed: 0,
};

export function useTrainingLogic() {
  const [state, setState] = useState<TrainingState>({
    isTrainingMode: false,
    currentScenario: null,
    session: null,
    currentEventIndex: 0,
    pendingHints: [],
    showFeedback: false,
    lastFeedback: null,
  });
  
  const startTimeRef = useRef<number>(0);
  const processedEventsRef = useRef<Set<number>>(new Set());
  const matchedActionsRef = useRef<Set<number>>(new Set());

  const startScenario = useCallback((scenario: TrainingScenario) => {
    startTimeRef.current = Date.now();
    processedEventsRef.current = new Set();
    matchedActionsRef.current = new Set();
    
    const session: TrainingSession = {
      scenarioId: scenario.id,
      startedAt: new Date(),
      actions: [],
      totalScore: 0,
      maxPossibleScore: scenario.expectedActions.filter(a => a.required).length * POINTS.onTime,
      cprFraction: 0,
      protocolAdherence: 0,
      timingAccuracy: 0,
      outcome: 'abandoned',
    };

    setState({
      isTrainingMode: true,
      currentScenario: scenario,
      session,
      currentEventIndex: 0,
      pendingHints: [],
      showFeedback: false,
      lastFeedback: null,
    });
    
    return scenario.initialRhythm;
  }, []);

  const getElapsedSeconds = useCallback(() => {
    return Math.floor((Date.now() - startTimeRef.current) / 1000);
  }, []);

  const evaluateAction = useCallback((actionType: ActionType): ActionFeedback | null => {
    if (!state.currentScenario || !state.session) return null;

    const elapsed = getElapsedSeconds();
    const expectedActions = state.currentScenario.expectedActions;
    
    // Find the best matching expected action that hasn't been matched yet
    let bestMatch: { index: number; action: typeof expectedActions[0]; timing: 'early' | 'on-time' | 'late' } | null = null;
    
    for (let i = 0; i < expectedActions.length; i++) {
      if (matchedActionsRef.current.has(i)) continue;
      
      const expected = expectedActions[i];
      if (expected.type !== actionType) continue;
      
      // Check if within window or close to it
      if (elapsed >= expected.windowStart - 30 && elapsed <= expected.windowEnd + 60) {
        let timing: 'early' | 'on-time' | 'late';
        if (elapsed < expected.windowStart) {
          timing = 'early';
        } else if (elapsed <= expected.windowEnd) {
          timing = 'on-time';
        } else {
          timing = 'late';
        }
        
        if (!bestMatch || Math.abs(elapsed - expected.windowStart) < Math.abs(elapsed - bestMatch.action.windowStart)) {
          bestMatch = { index: i, action: expected, timing };
        }
      }
    }

    if (bestMatch) {
      matchedActionsRef.current.add(bestMatch.index);
      
      const points = POINTS[bestMatch.timing];
      const feedback: ActionFeedback = {
        action: actionType,
        timestamp: elapsed,
        isCorrect: bestMatch.timing === 'on-time',
        timing: bestMatch.timing,
        expectedWindow: { start: bestMatch.action.windowStart, end: bestMatch.action.windowEnd },
        points,
        message: getTimingMessage(bestMatch.timing, actionType),
      };

      setState(prev => ({
        ...prev,
        session: prev.session ? {
          ...prev.session,
          actions: [...prev.session.actions, feedback],
          totalScore: prev.session.totalScore + points,
        } : null,
        showFeedback: true,
        lastFeedback: feedback,
      }));

      // Hide feedback after 2 seconds
      setTimeout(() => {
        setState(prev => ({ ...prev, showFeedback: false }));
      }, 2000);

      return feedback;
    }

    // Action not expected at this time
    const feedback: ActionFeedback = {
      action: actionType,
      timestamp: elapsed,
      isCorrect: false,
      timing: 'early',
      points: 0,
      message: `${actionType} not expected at this time`,
    };

    setState(prev => ({
      ...prev,
      session: prev.session ? {
        ...prev.session,
        actions: [...prev.session.actions, feedback],
      } : null,
      showFeedback: true,
      lastFeedback: feedback,
    }));

    setTimeout(() => {
      setState(prev => ({ ...prev, showFeedback: false }));
    }, 2000);

    return feedback;
  }, [state.currentScenario, state.session, getElapsedSeconds]);

  const checkScenarioEvents = useCallback((shockCount: number, currentRhythm: RhythmType): { newRhythm?: RhythmType; rosc?: boolean } | null => {
    if (!state.currentScenario) return null;

    const elapsed = getElapsedSeconds();
    const events = state.currentScenario.events;

    for (let i = 0; i < events.length; i++) {
      if (processedEventsRef.current.has(i)) continue;

      const event = events[i];
      let triggered = false;

      if (event.triggerTime && elapsed >= event.triggerTime) {
        triggered = true;
      }
      if (event.triggerAfterShocks && shockCount >= event.triggerAfterShocks) {
        triggered = true;
      }

      if (triggered) {
        processedEventsRef.current.add(i);
        return {
          newRhythm: event.newRhythm,
          rosc: event.rosc,
        };
      }
    }

    return null;
  }, [state.currentScenario, getElapsedSeconds]);

  const getActiveHint = useCallback((): string | null => {
    if (!state.currentScenario) return null;

    const elapsed = getElapsedSeconds();
    const expectedActions = state.currentScenario.expectedActions;

    for (let i = 0; i < expectedActions.length; i++) {
      if (matchedActionsRef.current.has(i)) continue;

      const action = expectedActions[i];
      // Show hint 10 seconds before window starts
      if (elapsed >= action.windowStart - 10 && elapsed <= action.windowEnd && action.hint) {
        return action.hint;
      }
    }

    return null;
  }, [state.currentScenario, getElapsedSeconds]);

  const completeScenario = useCallback((outcome: 'completed' | 'failed' | 'abandoned', cprFraction: number) => {
    if (!state.session || !state.currentScenario) return null;

    const requiredActions = state.currentScenario.expectedActions.filter(a => a.required).length;
    const correctActions = state.session.actions.filter(a => a.isCorrect).length;
    const onTimeActions = state.session.actions.filter(a => a.timing === 'on-time').length;

    const completedSession: TrainingSession = {
      ...state.session,
      completedAt: new Date(),
      outcome,
      cprFraction,
      protocolAdherence: requiredActions > 0 ? (correctActions / requiredActions) * 100 : 0,
      timingAccuracy: state.session.actions.length > 0 
        ? (onTimeActions / state.session.actions.length) * 100 
        : 0,
    };

    setState(prev => ({
      ...prev,
      session: completedSession,
    }));

    return completedSession;
  }, [state.session, state.currentScenario]);

  const endTraining = useCallback(() => {
    setState({
      isTrainingMode: false,
      currentScenario: null,
      session: null,
      currentEventIndex: 0,
      pendingHints: [],
      showFeedback: false,
      lastFeedback: null,
    });
    processedEventsRef.current = new Set();
    matchedActionsRef.current = new Set();
  }, []);

  return {
    state,
    startScenario,
    evaluateAction,
    checkScenarioEvents,
    getActiveHint,
    completeScenario,
    endTraining,
    getElapsedSeconds,
  };
}

function getTimingMessage(timing: 'early' | 'on-time' | 'late' | 'missed', action: ActionType): string {
  const actionNames: Record<ActionType, string> = {
    shock: 'Shock',
    epinephrine: 'Epinephrine',
    amiodarone: 'Amiodarone',
    lidocaine: 'Lidocaine',
    rhythmCheck: 'Rhythm check',
    rosc: 'ROSC',
    terminate: 'Termination',
  };

  const name = actionNames[action];

  switch (timing) {
    case 'on-time':
      return `✓ ${name} - Perfect timing!`;
    case 'early':
      return `⚡ ${name} - A bit early`;
    case 'late':
      return `⏰ ${name} - Late but given`;
    case 'missed':
      return `✗ ${name} - Missed`;
  }
}
