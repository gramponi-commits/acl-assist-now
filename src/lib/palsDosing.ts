// PALS Pediatric Weight-Based Dosing Calculations
// Based on AHA 2025 PALS Cardiac Arrest Algorithm

export interface PALSDose {
  value: number | null;
  display: string;
  unit: string;
}

export interface PALSConfig {
  epinephrineDosePerKg: number; // 0.01 mg/kg (max 1mg)
  amiodaroneFirstDosePerKg: number; // 5 mg/kg (max 300mg)
  amiodaroneSubsequentDosePerKg: number; // 5 mg/kg (max 150mg)
  lidocaineDosePerKg: number; // 1 mg/kg
  firstShockJoulesPerKg: number; // 2 J/kg
  subsequentShockJoulesPerKg: number; // 4 J/kg
  maxShockJoulesPerKg: number; // 10 J/kg or adult dose
  epinephrineIntervalMs: number; // 3-5 minutes (use 3 min)
}

export const DEFAULT_PALS_CONFIG: PALSConfig = {
  epinephrineDosePerKg: 0.01, // mg/kg
  amiodaroneFirstDosePerKg: 5, // mg/kg
  amiodaroneSubsequentDosePerKg: 5, // mg/kg
  lidocaineDosePerKg: 1, // mg/kg
  firstShockJoulesPerKg: 2,
  subsequentShockJoulesPerKg: 4,
  maxShockJoulesPerKg: 10,
  epinephrineIntervalMs: 3 * 60 * 1000, // 3 minutes
};

// Maximum doses (adult equivalent or safety caps)
const MAX_EPINEPHRINE_MG = 1;
const MAX_AMIODARONE_FIRST_MG = 300;
const MAX_AMIODARONE_SUBSEQUENT_MG = 150;
const MAX_SHOCK_JOULES = 360; // Adult max

/**
 * Calculate epinephrine dose for pediatric patient
 * Dose: 0.01 mg/kg IV/IO (max 1mg)
 */
export function calculateEpinephrineDose(weightKg: number | null): PALSDose {
  if (weightKg === null || weightKg <= 0) {
    return {
      value: null,
      display: '0.01 mg/kg',
      unit: 'mg/kg',
    };
  }

  const calculatedDose = weightKg * DEFAULT_PALS_CONFIG.epinephrineDosePerKg;
  const dose = Math.min(calculatedDose, MAX_EPINEPHRINE_MG);
  
  return {
    value: dose,
    display: `${dose.toFixed(2)} mg`,
    unit: 'mg',
  };
}

/**
 * Calculate amiodarone dose for pediatric patient
 * First dose: 5 mg/kg IV/IO (max 300mg)
 * Subsequent doses: 5 mg/kg (max 150mg)
 */
export function calculateAmiodaroneDose(weightKg: number | null, doseNumber: number): PALSDose {
  const isFirstDose = doseNumber === 0;
  const maxDose = isFirstDose ? MAX_AMIODARONE_FIRST_MG : MAX_AMIODARONE_SUBSEQUENT_MG;
  const dosePerKg = isFirstDose 
    ? DEFAULT_PALS_CONFIG.amiodaroneFirstDosePerKg 
    : DEFAULT_PALS_CONFIG.amiodaroneSubsequentDosePerKg;

  if (weightKg === null || weightKg <= 0) {
    return {
      value: null,
      display: `5 mg/kg`,
      unit: 'mg/kg',
    };
  }

  const calculatedDose = weightKg * dosePerKg;
  const dose = Math.min(calculatedDose, maxDose);
  
  return {
    value: dose,
    display: `${Math.round(dose)} mg`,
    unit: 'mg',
  };
}

/**
 * Calculate lidocaine dose for pediatric patient
 * Dose: 1 mg/kg IV/IO
 */
export function calculateLidocaineDose(weightKg: number | null): PALSDose {
  if (weightKg === null || weightKg <= 0) {
    return {
      value: null,
      display: '1 mg/kg',
      unit: 'mg/kg',
    };
  }

  const dose = weightKg * DEFAULT_PALS_CONFIG.lidocaineDosePerKg;
  
  return {
    value: dose,
    display: `${Math.round(dose)} mg`,
    unit: 'mg',
  };
}

/**
 * Calculate shock energy for pediatric patient
 * First shock: 2 J/kg
 * Subsequent shocks: 4 J/kg (can escalate up to 10 J/kg or adult dose)
 */
export function calculateShockEnergy(weightKg: number | null, shockNumber: number): PALSDose {
  if (weightKg === null || weightKg <= 0) {
    const jPerKg = shockNumber === 0 ? 2 : 4;
    return {
      value: null,
      display: `${jPerKg} J/kg`,
      unit: 'J/kg',
    };
  }

  let jPerKg: number;
  if (shockNumber === 0) {
    jPerKg = DEFAULT_PALS_CONFIG.firstShockJoulesPerKg;
  } else if (shockNumber <= 2) {
    jPerKg = DEFAULT_PALS_CONFIG.subsequentShockJoulesPerKg;
  } else {
    // Can escalate up to 10 J/kg for subsequent shocks
    jPerKg = Math.min(DEFAULT_PALS_CONFIG.maxShockJoulesPerKg, 10);
  }

  const calculatedEnergy = weightKg * jPerKg;
  const energy = Math.min(calculatedEnergy, MAX_SHOCK_JOULES);
  
  return {
    value: Math.round(energy),
    display: `${Math.round(energy)} J`,
    unit: 'J',
  };
}

/**
 * Format weight display
 */
export function formatWeight(weightKg: number | null): string {
  if (weightKg === null || weightKg <= 0) {
    return '—';
  }
  return `${weightKg} kg`;
}

/**
 * Get CPR guidance for pediatric patients
 */
export function getPediatricCPRGuidance(): {
  compressionDepth: string;
  compressionRate: string;
  ratioSingleRescuer: string;
  ratioTwoRescuers: string;
} {
  return {
    compressionDepth: '≥1/3 AP chest depth',
    compressionRate: '100-120/min',
    ratioSingleRescuer: '30:2',
    ratioTwoRescuers: '15:2',
  };
}
