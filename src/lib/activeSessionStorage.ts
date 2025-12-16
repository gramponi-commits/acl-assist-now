// Storage for active (in-progress) sessions to enable resume functionality
import { ACLSSession } from '@/types/acls';

const ACTIVE_SESSION_KEY = 'acls-active-session';
const TIMER_STATE_KEY = 'acls-timer-state';

export interface SavedTimerState {
  cprCycleRemaining: number;
  epiRemaining: number;
  totalElapsed: number;
  totalCPRTime: number;
  savedAt: number;
}

export function saveActiveSession(session: ACLSSession, timerState: SavedTimerState): void {
  try {
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(timerState));
  } catch (e) {
    console.error('Failed to save active session:', e);
  }
}

export function getActiveSession(): { session: ACLSSession; timerState: SavedTimerState } | null {
  try {
    const sessionStr = localStorage.getItem(ACTIVE_SESSION_KEY);
    const timerStr = localStorage.getItem(TIMER_STATE_KEY);
    
    if (sessionStr && timerStr) {
      const session = JSON.parse(sessionStr) as ACLSSession;
      const timerState = JSON.parse(timerStr) as SavedTimerState;
      
      // Only return if session is still active (not ended)
      if (session.phase !== 'code_ended' && session.phase !== 'initial') {
        return { session, timerState };
      }
    }
  } catch (e) {
    console.error('Failed to get active session:', e);
  }
  return null;
}

export function clearActiveSession(): void {
  try {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    localStorage.removeItem(TIMER_STATE_KEY);
  } catch (e) {
    console.error('Failed to clear active session:', e);
  }
}

export function hasActiveSession(): boolean {
  return getActiveSession() !== null;
}
