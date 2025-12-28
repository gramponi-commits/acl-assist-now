// IndexedDB helper for storing ACLS session reports locally

import { HsAndTs, PostROSCChecklist, PostROSCVitals, PathwayMode } from '@/types/acls';

const DB_NAME = 'acls_sessions';
const DB_VERSION = 2; // Bump version for schema update
const STORE_NAME = 'sessions';

export interface StoredSession {
  id: string;
  savedAt: number;
  startTime: number;
  endTime: number | null;
  roscTime: number | null;
  outcome: 'rosc' | 'deceased' | null;
  duration: number;
  totalCPRTime: number;
  cprFraction: number;
  shockCount: number;
  epinephrineCount: number;
  amiodaroneCount: number;
  lidocaineCount: number;
  // Pathway mode (Adult ACLS / Pediatric PALS)
  pathwayMode: PathwayMode;
  patientWeight: number | null;
  // All interventions with full detail
  interventions: Array<{
    timestamp: number;
    type: string;
    details: string;
    value?: number | string;
  }>;
  // EtCO2 readings
  etco2Readings: Array<{
    timestamp: number;
    value: number;
  }>;
  // H's & T's analysis
  hsAndTs: HsAndTs;
  // Post-ROSC data
  postROSCChecklist: PostROSCChecklist | null;
  postROSCVitals: PostROSCVitals | null;
  // Airway status
  airwayStatus: 'ambu' | 'sga' | 'ett';
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('savedAt', 'savedAt', { unique: false });
        store.createIndex('pathwayMode', 'pathwayMode', { unique: false });
      }
    };
  });
}

export async function saveSession(session: StoredSession): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(session);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getAllSessions(): Promise<StoredSession[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('savedAt');
    const request = index.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result.reverse()); // Most recent first
  });
}

export async function deleteSession(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getSession(id: string): Promise<StoredSession | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}
