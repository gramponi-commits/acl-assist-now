# ResusBuddy Code Analysis & Improvement Plan

**Date:** 2025-12-31
**Analysis Type:** Comprehensive code review for bugs, simplifications, and improvements
**Scope:** Full codebase analysis based on architecture and actual implementation

---

## Executive Summary

ResusBuddy is a well-structured clinical decision support system with strong foundations in TypeScript, React, and PWA technologies. However, there are several critical areas for improvement, particularly around:

1. **Testing** - Zero test coverage for medical-critical logic
2. **Code organization** - Large files that reduce maintainability
3. **State management** - Manual complexity that could be simplified
4. **Settings management** - Duplicate fields and validation issues
5. **Error handling** - Insufficient user feedback
6. **Performance** - Timer management could be optimized

---

## 🐛 Critical Bugs

### 1. Duplicate Defibrillator Energy Settings
**Location:** `src/hooks/useSettings.ts:13-15, 29`
**Severity:** HIGH
**Issue:** Two fields store defibrillator energy:
```typescript
defibrillatorEnergy: number;  // Line 13
adultDefibrillatorEnergy: AdultDefibrillatorEnergy;  // Line 15
```
**Impact:** Inconsistent state, confusion about which value is authoritative
**Fix:** Consolidate into single typed field with proper enum

### 2. Stale Closure in Timer Dependencies
**Location:** `src/hooks/useACLSLogic.ts:67-123`
**Severity:** MEDIUM
**Issue:** Timer useEffect has complex dependencies that may cause stale closures:
```typescript
useEffect(() => {
  // Uses session.phase, session.cprCycleStartTime, etc.
  // But setTimerState might read stale session values
}, [session.phase, session.cprCycleStartTime, ...]);
```
**Impact:** Timer calculations may use stale data during rapid state changes
**Fix:** Use refs for session data or restructure to eliminate dependency

### 3. Missing Cleanup in Auto-Save
**Location:** `src/hooks/useACLSLogic.ts:152-246`
**Severity:** MEDIUM
**Issue:** Auto-save timeout cleanup happens on unmount, but could leak if component re-renders rapidly:
```typescript
autoSaveTimeoutRef.current = window.setTimeout(async () => {
  // Save logic
}, 2000);
```
**Impact:** Multiple pending saves could execute simultaneously
**Fix:** Clear previous timeout before setting new one

### 4. No Null Safety in Weight-Based Calculations
**Location:** Multiple dosing functions
**Severity:** HIGH (Medical Safety)
**Issue:** Weight-based dosing functions don't validate null weight:
```typescript
calculateEpinephrineDose(session.patientWeight)  // patientWeight can be null
```
**Impact:** Could pass `null` to calculations, producing invalid doses
**Fix:** Add runtime validation with fallback or error state

### 5. Console Logs in Production
**Location:** Multiple files
**Severity:** LOW
**Issue:** Production code contains debug console.logs:
- `src/hooks/useACLSLogic.ts:220-227` - Auto-save logs
- `src/hooks/useACLSLogic.ts:252` - Reset flag logs
**Impact:** Performance overhead, information leakage
**Fix:** Use proper logging library with environment detection

---

## 🔧 Simplifications

### 1. Split Large Hook: useACLSLogic (866 lines)
**Location:** `src/hooks/useACLSLogic.ts`
**Current Complexity:** Single 866-line hook managing entire ACLS state machine
**Simplification:**
```typescript
// Split into focused hooks:
useACLSLogic.ts (main orchestrator, ~200 lines)
├── useACLSSession.ts (session state, ~150 lines)
├── useACLSTimers.ts (timer logic, ~150 lines)
├── useACLSInterventions.ts (medication/shock tracking, ~150 lines)
├── useACLSPersistence.ts (auto-save logic, ~100 lines)
└── useACLSPhaseTransitions.ts (state machine, ~150 lines)
```
**Benefits:** Better testability, clearer separation of concerns, easier maintenance

### 2. Split Large Component: CodeScreen (701 lines)
**Location:** `src/components/acls/CodeScreen.tsx`
**Current Complexity:** Single component with multiple responsibilities
**Simplification:**
```typescript
CodeScreen.tsx (main layout, ~150 lines)
├── CodeScreenInitial.tsx (pathway selection)
├── CodeScreenCPRPending.tsx (CPR pending rhythm analysis)
├── CodeScreenActive.tsx (active code)
├── CodeScreenPostROSC.tsx (post-ROSC care)
└── CodeScreenEnded.tsx (code ended summary)
```
**Benefits:** Smaller components, better code reuse, clearer intent

### 3. Deduplicate CPR Pending and Active Code JSX
**Location:** `src/components/acls/CodeScreen.tsx:314-426 and 430-556`
**Issue:** Nearly identical JSX blocks for CPR pending and active states:
```typescript
// Lines 314-426: CPR Pending Rhythm
{isCPRPendingRhythm && (
  <>
    <WeightDisplay /> {/* Duplicated */}
    <CPRQualityPanel /> {/* Duplicated */}
    <HsAndTsChecklist /> {/* Duplicated */}
    <CodeTimeline /> {/* Duplicated */}
  </>
)}

// Lines 430-556: Active Code
{isActive && (
  <>
    <WeightDisplay /> {/* Duplicated */}
    <CPRQualityPanel /> {/* Duplicated */}
    <HsAndTsChecklist /> {/* Duplicated */}
    <CodeTimeline /> {/* Duplicated */}
  </>
)}
```
**Simplification:** Extract shared panels into `<ActiveCodePanels>` component
**Benefits:** DRY principle, single source of truth for panel configuration

### 4. Extract Previous Value Tracking Hook
**Location:** `src/components/acls/CodeScreen.tsx:66-69, 140-175`
**Issue:** Manual tracking of previous values with multiple useRefs:
```typescript
const prevRhythmCheckDue = useRef(false);
const prevPreShockAlert = useRef(false);
const prevEpiDue = useRef(false);
const prevAntiarrhythmicDue = useRef(false);
```
**Simplification:** Create `usePrevious()` custom hook:
```typescript
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => { ref.current = value; });
  return ref.current;
}

// Usage:
const prevRhythmCheckDue = usePrevious(timerState.rhythmCheckDue);
```
**Benefits:** Reusable, cleaner code, less boilerplate

### 5. Consolidate Session Storage Logic
**Location:** `src/lib/activeSessionStorage.ts` and `src/lib/bradyTachyStorage.ts`
**Issue:** Similar storage logic duplicated for ACLS and Brady/Tachy sessions
**Simplification:** Create generic session storage utility:
```typescript
// src/lib/sessionStorage.ts
export function createSessionStorage<T>(storageKey: string) {
  return {
    save: (session: T) => localStorage.setItem(storageKey, JSON.stringify(session)),
    get: (): T | null => JSON.parse(localStorage.getItem(storageKey) || 'null'),
    clear: () => localStorage.removeItem(storageKey),
  };
}
```
**Benefits:** DRY, easier testing, consistent behavior

### 6. Use XState for Phase Management
**Location:** `src/hooks/useACLSLogic.ts` (XState imported but unused)
**Issue:** Manual phase state machine with imperative setPhase() calls
**Current:**
```typescript
setSession(prev => ({ ...prev, phase: 'shockable_pathway' }));
```
**Simplification:** Use XState for declarative state machine:
```typescript
const aclsMachine = createMachine({
  initial: 'pathway_selection',
  states: {
    pathway_selection: {
      on: { START_CPR: 'cpr_pending_rhythm' }
    },
    cpr_pending_rhythm: {
      on: {
        SELECT_SHOCKABLE: 'shockable_pathway',
        SELECT_NON_SHOCKABLE: 'non_shockable_pathway'
      }
    },
    // ... more states
  }
});
```
**Benefits:** Prevents invalid transitions, self-documenting, easier to visualize

---

## ⚡ Code Quality Improvements

### 1. Add Comprehensive Test Coverage
**Current:** 0 test files found
**Target:** >80% coverage for critical medical logic
**Priority:** CRITICAL

**Required Tests:**
```
tests/
├── unit/
│   ├── hooks/
│   │   ├── useACLSLogic.test.ts (timer logic, medication intervals, phase transitions)
│   │   ├── useBradyTachyLogic.test.ts
│   │   └── useSettings.test.ts
│   ├── lib/
│   │   ├── aclsDosing.test.ts (verify doses match AHA guidelines)
│   │   ├── palsDosing.test.ts (weight-based calculations)
│   │   └── bradyTachyDosing.test.ts
│   └── components/
│       ├── CodeScreen.test.tsx
│       └── RhythmCheckModal.test.tsx
├── integration/
│   ├── acls-workflow.test.tsx (full code simulation)
│   └── brady-tachy-workflow.test.tsx
└── e2e/
    └── critical-paths.spec.ts (Playwright)
```

**Test Framework Setup:**
```bash
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

### 2. Improve Settings Validation
**Location:** `src/hooks/useSettings.ts`
**Issue:** No validation on settings values
**Improvement:**
```typescript
import { z } from 'zod';

const settingsSchema = z.object({
  soundEnabled: z.boolean(),
  vibrationEnabled: z.boolean(),
  metronomeEnabled: z.boolean(),
  metronomeBPM: z.number().min(80).max(140), // Safe CPR range
  voiceAnnouncementsEnabled: z.boolean(),
  preferLidocaine: z.boolean(),
  defibrillatorEnergy: z.enum([120, 150, 200, 360]), // Valid energies only
  theme: z.enum(['dark', 'light']),
});

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const validated = settingsSchema.safeParse(parsed);
      return validated.success ? validated.data : DEFAULT_SETTINGS;
    }
    return DEFAULT_SETTINGS;
  });
  // ...
}
```

### 3. Add Error Boundaries
**Location:** New component needed
**Issue:** No error boundaries to catch component errors
**Improvement:**
```typescript
// src/components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application error:', error, errorInfo);
    // Log to error tracking service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-destructive/10">
          <div className="text-center p-6">
            <h1 className="text-2xl font-bold text-destructive">Application Error</h1>
            <p className="mt-2 text-muted-foreground">
              An unexpected error occurred. Please refresh the page.
            </p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Reload Application
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### 4. Improve Type Safety
**Location:** Various
**Issues:**
- Using `number` for weight instead of branded type
- Intervention types could be more specific
- Missing discriminated unions for session states

**Improvements:**
```typescript
// src/types/acls.ts

// Branded type for patient weight
export type PatientWeight = number & { __brand: 'PatientWeight' };
export function createPatientWeight(kg: number): PatientWeight | null {
  if (kg <= 0 || kg > 200) return null;
  return kg as PatientWeight;
}

// Discriminated union for session phases
export type ACLSSessionState =
  | { phase: 'pathway_selection'; currentRhythm: null }
  | { phase: 'cpr_pending_rhythm'; currentRhythm: null }
  | { phase: 'shockable_pathway'; currentRhythm: 'vf_pvt' }
  | { phase: 'non_shockable_pathway'; currentRhythm: 'asystole' | 'pea' }
  | { phase: 'post_rosc'; outcome: 'rosc'; roscTime: number }
  | { phase: 'code_ended'; outcome: 'deceased' | 'transferred'; endTime: number };

// More specific intervention types
export type ShockIntervention = {
  type: 'shock';
  timestamp: number;
  energy: number; // Required for shocks
  shockNumber: number;
};

export type MedicationIntervention = {
  type: 'epinephrine' | 'amiodarone' | 'lidocaine';
  timestamp: number;
  dose: string; // Required for medications
  doseNumber: number;
};

export type Intervention =
  | ShockIntervention
  | MedicationIntervention
  | RhythmChangeIntervention
  | NoteIntervention;
```

### 5. Centralize Timer Logic
**Location:** `src/hooks/useACLSLogic.ts:66-136`
**Issue:** Complex timer logic with multiple refs and intervals
**Improvement:** Extract to dedicated hook with better cleanup:
```typescript
// src/hooks/useACLSTimers.ts
export function useACLSTimers(config: {
  isActive: boolean;
  phase: ACLSPhase;
  cprCycleStartTime: number | null;
  lastEpinephrineTime: number | null;
  startTime: number;
  epinephrineCount: number;
  rhythmCheckIntervalMs: number;
  epinephrineIntervalMs: number;
  preShockAlertAdvanceMs: number;
}) {
  const [timerState, setTimerState] = useState<TimerState>({...});
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!config.isActive) return;

    const updateTimers = () => {
      const now = Date.now();
      setTimerState({
        cprCycleRemaining: calculateCPRCycleRemaining(now, config),
        epiRemaining: calculateEpiRemaining(now, config),
        // ... other calculations
      });
      animationFrameRef.current = requestAnimationFrame(updateTimers);
    };

    animationFrameRef.current = requestAnimationFrame(updateTimers);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [config.isActive, config.phase, ...]);

  return timerState;
}
```
**Benefits:** Uses requestAnimationFrame (more efficient), clearer cleanup, easier testing

### 6. Add Loading and Error States
**Location:** Throughout UI components
**Issue:** No loading/error UI for async operations
**Improvement:**
```typescript
// src/hooks/useAsyncOperation.ts
export function useAsyncOperation<T>() {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({ data: null, loading: false, error: null });

  const execute = useCallback(async (operation: () => Promise<T>) => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await operation();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
      throw error;
    }
  }, []);

  return { ...state, execute };
}

// Usage in components:
const { loading, error, execute } = useAsyncOperation();

const handleExport = async () => {
  await execute(async () => {
    await exportSessionToPDF(session);
    toast.success('PDF exported successfully');
  });
};

{loading && <Spinner />}
{error && <Alert variant="destructive">{error.message}</Alert>}
```

---

## 🎨 UX/UI Improvements

### 1. Add Visual Timer Indicators
**Location:** `src/components/acls/TimerDisplay.tsx`
**Current:** Text-only timers
**Improvement:** Add circular progress indicators:
```typescript
import { Progress } from '@/components/ui/progress';

export function CycleTimers({ cprCycleRemaining, epiRemaining, ... }) {
  const cprProgress = (cprCycleRemaining / (2 * 60 * 1000)) * 100;
  const epiProgress = (epiRemaining / (4 * 60 * 1000)) * 100;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="relative">
        <Progress value={100 - cprProgress} className="h-2" />
        <div className="text-center mt-2">
          <div className="text-3xl font-mono">{formatTime(cprCycleRemaining)}</div>
          <div className="text-sm text-muted-foreground">Rhythm Check</div>
        </div>
      </div>
      {/* Similar for epi timer */}
    </div>
  );
}
```

### 2. Add Haptic Feedback Patterns
**Location:** `src/hooks/useAudioAlerts.ts`
**Current:** Simple vibrations
**Improvement:** Distinct haptic patterns for different alerts:
```typescript
const HAPTIC_PATTERNS = {
  rhythmCheck: [300, 100, 300, 100, 300], // Triple vibration
  preCharge: [150, 75, 150],              // Double vibration
  epiDue: [500, 200, 500],                // Long double
  rosc: [100, 50, 100, 50, 100, 50, 100], // Celebration pattern
};

export function useAudioAlerts() {
  const vibrate = useCallback((pattern: keyof typeof HAPTIC_PATTERNS) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(HAPTIC_PATTERNS[pattern]);
    }
  }, []);

  const playAlert = useCallback((type: AlertType) => {
    // ... audio logic
    vibrate(type);
  }, [vibrate]);

  return { playAlert, vibrate };
}
```

### 3. Add Keyboard Shortcuts
**Location:** New hook `src/hooks/useKeyboardShortcuts.ts`
**Improvement:** Add shortcuts for critical actions:
```typescript
export function useKeyboardShortcuts(actions: {
  onEpinephrine: () => void;
  onRhythmCheck: () => void;
  onShock: () => void;
  onAmiodarone: () => void;
}) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger during active code
      if (!isActive) return;

      // Require Ctrl/Cmd modifier to prevent accidental triggers
      if (!(e.ctrlKey || e.metaKey)) return;

      switch (e.key.toLowerCase()) {
        case 'e':
          e.preventDefault();
          actions.onEpinephrine();
          break;
        case 'r':
          e.preventDefault();
          actions.onRhythmCheck();
          break;
        case 's':
          e.preventDefault();
          actions.onShock();
          break;
        case 'a':
          e.preventDefault();
          actions.onAmiodarone();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [actions, isActive]);
}

// Display shortcuts in UI:
<Button>
  Epinephrine <kbd className="ml-2">Ctrl+E</kbd>
</Button>
```

### 4. Improve Offline Mode Experience
**Location:** `public/sw.js` (service worker)
**Current:** Basic offline capability
**Improvement:** Add offline indicator and sync queue:
```typescript
// src/components/OfflineIndicator.tsx
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-warning text-warning-foreground px-4 py-2 text-center text-sm font-medium z-50">
      <WifiOff className="inline h-4 w-4 mr-2" />
      Offline Mode - All data saved locally
    </div>
  );
}
```

### 5. Add Session Summary Quick View
**Location:** `src/components/acls/SessionSummaryCard.tsx` (new component)
**Improvement:** Collapsible summary card during active code:
```typescript
export function SessionSummaryCard({ session, timerState }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <span>Session Summary</span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 mt-2">
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <div className="text-muted-foreground">Duration</div>
            <div className="font-bold">{formatDuration(timerState.totalElapsed)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">CPR Fraction</div>
            <div className="font-bold">
              {((timerState.totalCPRTime / timerState.totalElapsed) * 100).toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Shocks</div>
            <div className="font-bold">{session.shockCount}</div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
```

### 6. Improve Accessibility (WCAG 2.1 AA)
**Location:** Multiple components
**Improvements:**
- Add ARIA labels to all interactive elements
- Ensure color contrast ratios meet WCAG standards
- Add focus indicators
- Support screen readers for critical alerts

```typescript
// Example: Improved button accessibility
<Button
  onClick={actions.giveEpinephrine}
  aria-label={`Administer epinephrine dose ${session.epinephrineCount + 1}`}
  aria-describedby="epi-dose-info"
  className={cn(buttonStates.epiDue && "ring-2 ring-acls-critical")}
>
  <Activity className="h-5 w-5" aria-hidden="true" />
  Epinephrine
  {buttonStates.epiDue && (
    <span className="sr-only">Epinephrine dose is due now</span>
  )}
</Button>
<div id="epi-dose-info" className="sr-only">
  Administers 1mg epinephrine IV/IO. Doses given: {session.epinephrineCount}
</div>
```

---

## 🏗️ Architecture Improvements

### 1. Implement Repository Pattern for Data Access
**Current:** Direct localStorage/IndexedDB access scattered throughout
**Improvement:** Centralized repository:
```typescript
// src/repositories/SessionRepository.ts
export class SessionRepository {
  private db: IDBDatabase;

  async saveSession(session: StoredSession): Promise<void> {
    const tx = this.db.transaction('sessions', 'readwrite');
    await tx.objectStore('sessions').put(session);
  }

  async getSession(id: string): Promise<StoredSession | null> {
    const tx = this.db.transaction('sessions', 'readonly');
    return tx.objectStore('sessions').get(id);
  }

  async getAllSessions(filters?: SessionFilters): Promise<StoredSession[]> {
    // Implement filtering logic
  }

  async deleteSession(id: string): Promise<void> {
    const tx = this.db.transaction('sessions', 'readwrite');
    await tx.objectStore('sessions').delete(id);
  }
}

// Usage in hooks:
const sessionRepo = useSessionRepository();
await sessionRepo.saveSession(session);
```

### 2. Add Environment-Based Configuration
**Location:** New file `src/config/index.ts`
**Improvement:** Centralize configuration:
```typescript
export const config = {
  environment: import.meta.env.MODE,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,

  features: {
    enableVoiceAnnouncements: true,
    enableMetronome: true,
    enableAnalytics: import.meta.env.PROD,
    enableDebugLogs: import.meta.env.DEV,
  },

  medical: {
    epinephrineIntervalMs: 4 * 60 * 1000,
    rhythmCheckIntervalMs: 2 * 60 * 1000,
    preShockAlertAdvanceMs: 15 * 1000,
    defaultDefibrillatorEnergy: 200,
  },

  storage: {
    sessionHistoryKey: 'acls-session-history',
    activeSessionKey: 'acls-active-session',
    settingsKey: 'acls-settings',
  },
} as const;
```

### 3. Add Logging Service
**Location:** New file `src/services/LoggingService.ts`
**Improvement:** Structured logging with levels:
```typescript
export class LoggingService {
  private static instance: LoggingService;

  private constructor() {}

  static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (config.features.enableDebugLogs) {
      console.debug(`[DEBUG] ${message}`, meta);
    }
  }

  info(message: string, meta?: Record<string, unknown>): void {
    console.info(`[INFO] ${message}`, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(`[WARN] ${message}`, meta);
  }

  error(message: string, error?: Error, meta?: Record<string, unknown>): void {
    console.error(`[ERROR] ${message}`, { error, ...meta });
    // Send to error tracking service (Sentry, etc.) in production
    if (config.isProduction) {
      // Sentry.captureException(error, { extra: meta });
    }
  }

  medical(event: string, data: Record<string, unknown>): void {
    // Special logging for medical events (interventions, outcomes)
    this.info(`[MEDICAL] ${event}`, data);
    // Could send to audit log or compliance system
  }
}

export const logger = LoggingService.getInstance();

// Usage:
logger.medical('intervention_epinephrine', {
  sessionId: session.id,
  doseNumber: session.epinephrineCount + 1,
  timestamp: Date.now(),
});
```

### 4. Implement Feature Flags
**Location:** New file `src/features/FeatureFlags.ts`
**Improvement:** Enable/disable features dynamically:
```typescript
export const FEATURE_FLAGS = {
  BRADY_TACHY_MODULE: true,
  PREGNANCY_CHECKLIST: true,
  VOICE_ANNOUNCEMENTS: true,
  KEYBOARD_SHORTCUTS: true,
  ADVANCED_ANALYTICS: false, // Future feature
  AI_DOSING_SUGGESTIONS: false, // Future feature
} as const;

export function useFeatureFlag(flag: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[flag];
}

// Usage in components:
const hasBradyTachy = useFeatureFlag('BRADY_TACHY_MODULE');

{hasBradyTachy && (
  <Button onClick={handleOpenBradyTachy}>Brady/Tachy Module</Button>
)}
```

---

## 📊 Performance Improvements

### 1. Memoize Expensive Calculations
**Location:** Multiple components
**Issue:** Dose calculations re-run on every render
**Improvement:**
```typescript
// In CodeScreen.tsx
const shockEnergy = useMemo(
  () => session.pathwayMode === 'pediatric'
    ? calculateShockEnergy(session.patientWeight, session.shockCount)
    : getAdultShockEnergy(session.shockCount, settings.defibrillatorEnergy),
  [session.pathwayMode, session.patientWeight, session.shockCount, settings.defibrillatorEnergy]
);

const commandBanner = useMemo(
  () => getCommandBanner(),
  [session, timerState, isInRhythmCheck]
);
```

### 2. Virtualize Long Intervention Lists
**Location:** `src/components/acls/CodeTimeline.tsx`
**Issue:** Long intervention lists can slow rendering
**Improvement:**
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

export function CodeTimeline({ interventions, startTime }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: interventions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Estimated row height
    overscan: 5,
  });

  return (
    <ScrollArea ref={parentRef} className="h-96">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const intervention = interventions[virtualRow.index];
          return (
            <div
              key={intervention.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <InterventionRow intervention={intervention} startTime={startTime} />
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
```

### 3. Debounce Auto-Save
**Current:** Auto-save every 5 seconds
**Improvement:** Save only when data actually changes:
```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedSave = useDebouncedCallback(
  (session, timerState) => {
    saveActiveSession(session, timerState);
  },
  2000, // 2 second debounce
  { maxWait: 10000 } // But save at least every 10 seconds
);

useEffect(() => {
  if (isActive || isCPRPendingRhythm) {
    debouncedSave(session, timerState);
  }
}, [session, timerState, isActive, isCPRPendingRhythm, debouncedSave]);
```

---

## 🚀 Implementation Priority

### Phase 1: Critical Fixes (1-2 days)
1. ✅ Fix duplicate defibrillator energy settings
2. ✅ Add null safety for weight-based calculations
3. ✅ Remove console.logs from production code
4. ✅ Fix timer cleanup in auto-save

### Phase 2: Code Quality (3-5 days)
1. ✅ Add test infrastructure and critical tests
2. ✅ Add error boundaries
3. ✅ Improve settings validation
4. ✅ Extract usePrevious hook
5. ✅ Centralize logging

### Phase 3: Refactoring (5-7 days)
1. ✅ Split useACLSLogic into smaller hooks
2. ✅ Split CodeScreen into smaller components
3. ✅ Deduplicate CPR pending/active code JSX
4. ✅ Implement XState for phase management
5. ✅ Consolidate session storage logic

### Phase 4: UX/UI Enhancements (3-5 days)
1. ✅ Add visual timer indicators
2. ✅ Improve haptic feedback patterns
3. ✅ Add keyboard shortcuts
4. ✅ Add offline indicator
5. ✅ Improve accessibility

### Phase 5: Architecture (5-7 days)
1. ✅ Implement repository pattern
2. ✅ Add environment configuration
3. ✅ Add feature flags
4. ✅ Implement logging service

---

## ✅ Testing Strategy

### Unit Tests
- Test all dosing calculations against AHA guidelines
- Test timer logic edge cases
- Test phase transition rules
- Test settings validation

### Integration Tests
- Test complete ACLS workflow (VF/pVT pathway)
- Test complete PALS workflow
- Test Brady/Tachy workflows
- Test session persistence and recovery

### E2E Tests
- Test critical path: Start code → Give epi → Shock → ROSC
- Test pediatric weight-based dosing
- Test offline functionality
- Test session export

---

## 📝 Documentation Needs

1. **CONTRIBUTING.md** - Guidelines for contributing
2. **TESTING.md** - How to run tests
3. **ARCHITECTURE.md** - Already exists, update with changes
4. **MEDICAL_VALIDATION.md** - How medical logic is validated against guidelines
5. **CHANGELOG.md** - Track changes between versions

---

## 🎯 Success Metrics

- **Test Coverage:** >80% for critical medical logic
- **Bundle Size:** <500KB (currently ~765KB TypeScript source)
- **First Contentful Paint:** <1.5s
- **Time to Interactive:** <3s
- **Lighthouse Score:** >90 (all categories)
- **Accessibility Score:** 100 (WCAG 2.1 AA)

---

**End of Analysis**
