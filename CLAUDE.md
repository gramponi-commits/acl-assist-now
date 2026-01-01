# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ResusBuddy is a clinical-grade ACLS (Advanced Cardiac Life Support) and PALS (Pediatric Advanced Life Support) decision support PWA implementing 2024 AHA Cardiac Arrest Algorithm guidelines. It provides real-time guidance during resuscitation scenarios with offline support.

## Development Commands

```bash
npm run dev          # Start dev server at http://localhost:8080
npm run build        # Production build
npm run lint         # Run ESLint
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:coverage # Tests with coverage (80% thresholds)
```

### Mobile Development (Capacitor)
```bash
npm run cap:run:android   # Build and run on Android
npm run cap:run:ios       # Build and run on iOS
npm run android:dev       # Dev build for Android
```

## Architecture

### Core State Management

The app uses **custom React hooks** for state machine-like management (not XState despite package.json):

- **`useACLSLogic`** (`src/hooks/useACLSLogic.ts`): Main cardiac arrest protocol logic
  - Manages phases: `pathway_selection` → `cpr_pending_rhythm` → `shockable_pathway`/`non_shockable_pathway` → `post_rosc`/`code_ended`
  - Handles CPR cycle timing (2-minute rhythm checks), epinephrine intervals (4 minutes), shock tracking
  - Returns `session`, `timerState`, `commandBanner`, `actions`, and `buttonStates`

- **`useBradyTachyLogic`** (`src/hooks/useBradyTachyLogic.ts`): Bradycardia/Tachycardia module
  - Phase-based flow through assessment, stability evaluation, and treatment
  - Can transition to cardiac arrest mode (`switchToArrest`)

### Type System

All clinical types are centralized in **`src/types/acls.ts`**:
- `ACLSSession`, `BradyTachySession` - main session state
- `Intervention`, `BradyTachyIntervention` - logged actions with translation keys
- Phase enums: `ACLSPhase`, `BradyTachyPhase`
- `PathwayMode`: `'adult' | 'pediatric'` for ACLS vs PALS protocols

### Medication Dosing

Weight-based calculations are separated by protocol:
- `src/lib/aclsDosing.ts` - Adult fixed doses (1mg epi, 300mg amiodarone)
- `src/lib/palsDosing.ts` - Pediatric weight-based (0.01 mg/kg epi)
- `src/lib/bradyTachyDosing.ts` - Bradycardia/tachycardia medications

### Data Persistence

- **IndexedDB** via `src/lib/sessionStorage.ts` for session history
- **localStorage** via `src/lib/activeSessionStorage.ts` for in-progress sessions
- Sessions auto-save on code end (ROSC or death) with debouncing

### Component Structure

```
src/components/
├── acls/               # ACLS-specific components
│   ├── views/          # Main code screen phases (ActiveCodeView, PostROSCScreen, etc.)
│   ├── bradytachy/     # Bradycardia/Tachycardia module components
│   └── *.tsx           # Shared ACLS components (TimerDisplay, RhythmSelector)
└── ui/                 # shadcn/ui primitives (don't modify these)
```

### Internationalization

Uses i18next with translations supporting intervention logging:
- Interventions store `translationKey` and `translationParams` for later re-translation
- Configure in `src/i18n/index.ts`

## Key Patterns

### Phase-Based State Transitions
All state changes go through the central hooks. Components read phase and call actions:
```typescript
const { session, actions } = useACLSLogic();
if (session.phase === 'shockable_pathway') {
  actions.giveEpinephrine();
}
```

### Command Banner System
Dynamic guidance banners based on current state, rhythm, and timing:
```typescript
const { commandBanner } = useACLSLogic();
// Returns { message, priority: 'critical'|'warning'|'info'|'success', subMessage }
```

### Intervention Logging
All clinical actions are logged with timestamps for timeline/export:
```typescript
addIntervention('shock', t('interventions.shockDelivered', { number: 1, energy: 200 }),
  200, 'interventions.shockDelivered', { number: 1, energy: 200 });
```

## Testing

Tests use Vitest with jsdom environment. Run a single test file:
```bash
npm run test -- src/lib/aclsDosing.test.ts
```

Coverage thresholds: 80% lines/functions/statements, 75% branches.

## Clinical Accuracy

When modifying clinical logic, always verify against 2024 AHA guidelines:
- Adult: Epi every 3-5 min (we use 4), amiodarone after 3rd shock
- Pediatric: Weight-based dosing, 15:2 CPR ratio
- Rhythm check every 2 minutes with pre-shock charging alert at 15 seconds
