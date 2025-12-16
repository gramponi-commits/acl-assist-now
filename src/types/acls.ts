// ACLS Decision Support System Types
// Based on 2025 AHA Adult Cardiac Arrest Algorithm

export type RhythmType = 'vf_pvt' | 'asystole' | 'pea' | null;

export type ACLSPhase = 
  | 'initial'
  | 'rhythm_selection'
  | 'shockable_pathway'
  | 'non_shockable_pathway'
  | 'post_rosc'
  | 'code_ended';

export type AirwayStatus = 'bvm' | 'advanced' | 'none';

export interface Intervention {
  id: string;
  timestamp: number;
  type: 'shock' | 'epinephrine' | 'amiodarone' | 'lidocaine' | 'rhythm_change' | 'rosc' | 'airway' | 'cpr_start' | 'note' | 'hs_ts_check';
  details: string;
  value?: number | string;
}

export interface VitalReading {
  timestamp: number;
  etco2?: number;
  spo2?: number;
  paco2?: number;
  map?: number;
  temperature?: number;
  glucose?: number;
}

export interface HsAndTs {
  hypovolemia: boolean;
  hypoxia: boolean;
  hydrogenIon: boolean;
  hypoHyperkalemia: boolean;
  hypothermia: boolean;
  tensionPneumothorax: boolean;
  tamponade: boolean;
  toxins: boolean;
  thrombosisPulmonary: boolean;
  thrombosisCoronary: boolean;
}

export interface PostROSCChecklist {
  airwaySecured: boolean;
  ventilationOptimized: boolean;
  twelveLeadECG: boolean;
  labsOrdered: boolean;
  ctHeadOrdered: boolean;
  echoOrdered: boolean;
  temperatureManagement: boolean;
  hemodynamicsOptimized: boolean;
  neurologicalAssessment: boolean;
  followingCommands: boolean | null;
  eegOrdered: boolean;
  stElevation: boolean | null;
  cardiogenicShock: boolean | null;
}

export interface PostROSCVitals {
  spo2: number | null; // Target 90-98%
  paco2: number | null; // Target 35-45 mmHg
  map: number | null; // Target ≥65 mmHg
  temperature: number | null; // Target 32-37.5°C
  glucose: number | null; // Target 70-180 mg/dL
}

export interface ACLSSession {
  id: string;
  startTime: number;
  endTime: number | null;
  currentRhythm: RhythmType;
  phase: ACLSPhase;
  shockCount: number;
  currentEnergy: number;
  epinephrineCount: number;
  amiodaroneCount: number;
  lidocaineCount: number;
  lastEpinephrineTime: number | null;
  lastAmiodaroneTime: number | null;
  airwayStatus: AirwayStatus;
  interventions: Intervention[];
  vitalReadings: VitalReading[];
  hsAndTs: HsAndTs;
  postROSCChecklist: PostROSCChecklist;
  postROSCVitals: PostROSCVitals;
  cprCycleStartTime: number | null;
  roscTime: number | null;
}

export interface ACLSConfig {
  biphasicMinJoules: number;
  biphasicMaxJoules: number;
  epinephrineIntervalMs: number;
  rhythmCheckIntervalMs: number;
  preShockAlertAdvanceMs: number;
  amiodaroneFirstDose: number;
  amiodaroneSecondDose: number;
  lidocaineDose: number;
  epinephrineDose: number;
}

export const DEFAULT_ACLS_CONFIG: ACLSConfig = {
  biphasicMinJoules: 120,
  biphasicMaxJoules: 200,
  epinephrineIntervalMs: 4 * 60 * 1000, // 4 minutes
  rhythmCheckIntervalMs: 2 * 60 * 1000, // 2 minutes
  preShockAlertAdvanceMs: 15 * 1000, // 15 seconds
  amiodaroneFirstDose: 300,
  amiodaroneSecondDose: 150,
  lidocaineDose: 100,
  epinephrineDose: 1,
};

export const DEFAULT_HS_AND_TS: HsAndTs = {
  hypovolemia: false,
  hypoxia: false,
  hydrogenIon: false,
  hypoHyperkalemia: false,
  hypothermia: false,
  tensionPneumothorax: false,
  tamponade: false,
  toxins: false,
  thrombosisPulmonary: false,
  thrombosisCoronary: false,
};

export const DEFAULT_POST_ROSC_CHECKLIST: PostROSCChecklist = {
  airwaySecured: false,
  ventilationOptimized: false,
  twelveLeadECG: false,
  labsOrdered: false,
  ctHeadOrdered: false,
  echoOrdered: false,
  temperatureManagement: false,
  hemodynamicsOptimized: false,
  neurologicalAssessment: false,
  followingCommands: null,
  eegOrdered: false,
  stElevation: null,
  cardiogenicShock: null,
};

export const DEFAULT_POST_ROSC_VITALS: PostROSCVitals = {
  spo2: null,
  paco2: null,
  map: null,
  temperature: null,
  glucose: null,
};

export function createInitialSession(): ACLSSession {
  return {
    id: crypto.randomUUID(),
    startTime: Date.now(),
    endTime: null,
    currentRhythm: null,
    phase: 'initial',
    shockCount: 0,
    currentEnergy: DEFAULT_ACLS_CONFIG.biphasicMinJoules,
    epinephrineCount: 0,
    amiodaroneCount: 0,
    lidocaineCount: 0,
    lastEpinephrineTime: null,
    lastAmiodaroneTime: null,
    airwayStatus: 'none',
    interventions: [],
    vitalReadings: [],
    hsAndTs: { ...DEFAULT_HS_AND_TS },
    postROSCChecklist: { ...DEFAULT_POST_ROSC_CHECKLIST },
    postROSCVitals: { ...DEFAULT_POST_ROSC_VITALS },
    cprCycleStartTime: null,
    roscTime: null,
  };
}
