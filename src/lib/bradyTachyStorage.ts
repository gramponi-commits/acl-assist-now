// IndexedDB/localStorage helper for Brady/Tachy sessions

import { PathwayMode } from '@/types/acls';

export interface StoredBradyTachySession {
  id: string;
  startTime: number;
  endTime: number | null;
  patientGroup: 'adult' | 'pediatric';
  weightKg: number | null;
  branch: 'bradycardia' | 'tachycardia' | null;
  interventions: Array<{
    timestamp: number;
    type: string;
    details: string;
    value?: number | string;
    doseStep?: number;
    calculatedDose?: string;
    decisionContext?: any;
  }>;
  outcome: 'resolved' | 'switched_to_arrest' | 'transferred' | null;
}

const BRADY_TACHY_SESSION_KEY = 'acls_bradytachy_active_session';

export function saveBradyTachySession(session: StoredBradyTachySession): void {
  try {
    localStorage.setItem(BRADY_TACHY_SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save Brady/Tachy session:', e);
  }
}

export function getBradyTachySession(): StoredBradyTachySession | null {
  try {
    const data = localStorage.getItem(BRADY_TACHY_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Failed to retrieve Brady/Tachy session:', e);
    return null;
  }
}

export function clearBradyTachySession(): void {
  try {
    localStorage.removeItem(BRADY_TACHY_SESSION_KEY);
  } catch (e) {
    console.error('Failed to clear Brady/Tachy session:', e);
  }
}
