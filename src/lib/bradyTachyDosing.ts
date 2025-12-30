// Bradycardia/Tachycardia Dosing Calculations
// AHA 2025 Guidelines

interface DoseResult {
  value: number | null;
  display: string;
  unit: string;
}

// ==================== PEDIATRIC BRADYCARDIA ====================

/**
 * Epinephrine for pediatric bradycardia
 * Dose: 0.01 mg/kg IV/IO (0.1 mg/mL concentration)
 * Maximum: 1 mg
 */
export function calculatePedsBradyEpinephrine(weightKg: number | null): DoseResult {
  if (!weightKg) {
    return {
      value: null,
      display: '0.01 mg/kg (max 1 mg)',
      unit: 'mg',
    };
  }

  const dose = Math.min(0.01 * weightKg, 1);
  return {
    value: dose,
    display: `${dose.toFixed(2)} mg`,
    unit: 'mg',
  };
}

/**
 * Atropine for pediatric bradycardia
 * Dose: 0.02 mg/kg IV/IO, repeat once if needed
 * Minimum: 0.1 mg
 * Maximum single dose: 0.5 mg
 * Use only for increased vagal tone or primary AV block
 */
export function calculatePedsBradyAtropine(weightKg: number | null): DoseResult {
  if (!weightKg) {
    return {
      value: null,
      display: '0.02 mg/kg (min 0.1 mg, max 0.5 mg)',
      unit: 'mg',
    };
  }

  const dose = Math.max(0.1, Math.min(0.02 * weightKg, 0.5));
  return {
    value: dose,
    display: `${dose.toFixed(2)} mg`,
    unit: 'mg',
  };
}

// ==================== PEDIATRIC TACHYCARDIA ====================

/**
 * Adenosine for pediatric tachycardia (SVT)
 * First dose: 0.1 mg/kg IV/IO (max 6 mg) rapid push + flush
 * Second dose: 0.2 mg/kg IV/IO (max 12 mg) rapid push + flush
 */
export function calculatePedsTachyAdenosine(weightKg: number | null, doseNumber: 1 | 2): DoseResult {
  if (!weightKg) {
    const maxDose = doseNumber === 1 ? '6 mg' : '12 mg';
    const perKg = doseNumber === 1 ? '0.1 mg/kg' : '0.2 mg/kg';
    return {
      value: null,
      display: `${perKg} (max ${maxDose})`,
      unit: 'mg',
    };
  }

  const dosePerKg = doseNumber === 1 ? 0.1 : 0.2;
  const maxDose = doseNumber === 1 ? 6 : 12;
  const dose = Math.min(dosePerKg * weightKg, maxDose);
  
  return {
    value: dose,
    display: `${dose.toFixed(1)} mg`,
    unit: 'mg',
  };
}

/**
 * Synchronized cardioversion for pediatric tachycardia
 * Initial: 0.5-1 J/kg
 * If not effective: 2 J/kg
 */
export function calculatePedsTachyCardioversion(weightKg: number | null, attempt: 1 | 2): DoseResult {
  if (!weightKg) {
    const joules = attempt === 1 ? '0.5-1 J/kg' : '2 J/kg';
    return {
      value: null,
      display: joules,
      unit: 'J',
    };
  }

  const energy = attempt === 1 ? weightKg : 2 * weightKg;
  return {
    value: energy,
    display: `${Math.round(energy)} J`,
    unit: 'J',
  };
}

// ==================== ADULT BRADYCARDIA ====================

/**
 * Atropine for adult bradycardia with compromise
 * Dose: 1 mg IV bolus
 * Repeat every 3-5 minutes
 * Maximum total: 3 mg
 */
export function getAdultBradyAtropine(doseNumber: number): DoseResult {
  if (doseNumber > 3) {
    return {
      value: 0,
      display: 'Maximum dose reached (3 mg total)',
      unit: 'mg',
    };
  }

  return {
    value: 1,
    display: '1 mg',
    unit: 'mg',
  };
}

/**
 * Dopamine infusion for adult bradycardia
 * Dose: 5-20 mcg/kg/min
 * Titrate to patient response, taper slowly
 */
export function getAdultBradyDopamine(): DoseResult {
  return {
    value: null,
    display: '5-20 mcg/kg/min',
    unit: 'mcg/kg/min',
  };
}

/**
 * Epinephrine infusion for adult bradycardia
 * Dose: 2-10 mcg/min
 * Titrate to patient response
 */
export function getAdultBradyEpinephrineInfusion(): DoseResult {
  return {
    value: null,
    display: '2-10 mcg/min',
    unit: 'mcg/min',
  };
}

// ==================== ADULT TACHYCARDIA ====================

/**
 * Adenosine for adult tachycardia (regular narrow or regular wide monomorphic)
 * First dose: 6 mg rapid IV push + NS flush
 * Second dose: 12 mg rapid IV push + NS flush
 */
export function getAdultTachyAdenosine(doseNumber: 1 | 2): DoseResult {
  const dose = doseNumber === 1 ? 6 : 12;
  return {
    value: dose,
    display: `${dose} mg`,
    unit: 'mg',
  };
}

/**
 * Synchronized cardioversion for adult tachycardia
 * Use device-recommended energy to maximize first shock success
 * OR use maximum energy setting if dose is not known
 */
export function getAdultTachyCardioversion(deviceEnergy: number): DoseResult {
  return {
    value: deviceEnergy,
    display: `${deviceEnergy} J (or max energy)`,
    unit: 'J',
  };
}

/**
 * Procainamide for adult wide-complex stable tachycardia
 * Dose: 20-50 mg/min until:
 *   - Arrhythmia suppressed
 *   - Hypotension
 *   - QRS increases >50%
 *   - Maximum dose 17 mg/kg
 * Maintenance: 1-4 mg/min
 * Avoid if prolonged QT or CHF
 */
export function getAdultTachyProcainamide(): {
  loading: DoseResult;
  maintenance: DoseResult;
} {
  return {
    loading: {
      value: null,
      display: '20-50 mg/min (max 17 mg/kg)',
      unit: 'mg/min',
    },
    maintenance: {
      value: null,
      display: '1-4 mg/min',
      unit: 'mg/min',
    },
  };
}

/**
 * Amiodarone for adult wide-complex stable tachycardia
 * Loading: 150 mg over 10 minutes; repeat if VT recurs
 * Maintenance: 1 mg/min for first 6 hours
 */
export function getAdultTachyAmiodarone(): {
  loading: DoseResult;
  maintenance: DoseResult;
} {
  return {
    loading: {
      value: 150,
      display: '150 mg over 10 min',
      unit: 'mg',
    },
    maintenance: {
      value: null,
      display: '1 mg/min × 6 hours',
      unit: 'mg/min',
    },
  };
}

/**
 * Beta-blocker or calcium channel blocker for adult tachycardia
 * Used for stable narrow-complex tachycardia
 */
export function getAdultTachyRateControl(): DoseResult {
  return {
    value: null,
    display: 'Beta-blocker or CCB (per protocol)',
    unit: '',
  };
}
