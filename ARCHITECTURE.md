# ResusBuddy - Architecture Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Directory Structure](#directory-structure)
4. [Architecture Patterns](#architecture-patterns)
5. [Core Features & Modules](#core-features--modules)
6. [State Management](#state-management)
7. [Component Architecture](#component-architecture)
8. [Data Flow & Persistence](#data-flow--persistence)
9. [Key Files Reference](#key-files-reference)
10. [Internationalization](#internationalization)
11. [PWA Implementation](#pwa-implementation)
12. [Development Guide](#development-guide)

---

## Project Overview

**ResusBuddy** is a clinical-grade **ACLS (Advanced Cardiovascular Life Support) and PALS (Pediatric Advanced Life Support) Intelligent Decision Support System** implemented as a Progressive Web App (PWA).

### Purpose
To assist hospital code teams and healthcare professionals in managing cardiac arrest scenarios and symptomatic bradycardia/tachycardia cases by providing evidence-based guidance aligned with the **2025 AHA (American Heart Association) Cardiac Arrest Algorithm**.

### Target Users
- Healthcare professionals (doctors, nurses, paramedics)
- Code team members
- Medical trainees and students
- Emergency department staff

### Scope
- **NOT** a medical device or diagnostic tool
- **Educational and training** purposes
- **Decision support** following AHA guidelines
- **Offline-capable** for reliability in clinical settings

---

## Technology Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI library |
| TypeScript | 5.8.3 | Static typing |
| Vite | 5.4.19 | Build tool & dev server |

### Styling & UI
| Technology | Purpose |
|------------|---------|
| Tailwind CSS 3.4.17 | Utility-first CSS framework |
| shadcn-ui | Pre-built component library (40+ components) |
| Class Variance Authority | CSS class composition |
| Lucide React 0.462.0 | Icon library |
| TailwindCSS Animate | Animation utilities |

### State Management
| Technology | Purpose |
|------------|---------|
| Custom Hooks | Main state management pattern |
| XState 5.25.0 | State machine library |
| React Hook Form 7.61.1 | Form handling |
| Zod 3.25.76 | Schema validation |

### Routing & Navigation
| Technology | Purpose |
|------------|---------|
| React Router DOM 6.30.1 | Client-side routing |
| Radix UI Navigation Menu | Accessible navigation |

### Data & Persistence
| Technology | Purpose |
|------------|---------|
| IndexedDB | Historical session storage |
| localStorage | Active session & settings |
| jsPDF 3.0.4 | PDF report generation |

### Internationalization
| Technology | Purpose |
|------------|---------|
| i18next 25.7.3 | Translation framework |
| react-i18next 16.5.0 | React integration |

### PWA Features
| Technology | Purpose |
|------------|---------|
| vite-plugin-pwa 1.2.0 | Service worker generation |
| Workbox | Caching strategies |

### Utilities
| Technology | Purpose |
|------------|---------|
| date-fns 3.6.0 | Date manipulation |
| next-themes | Theme management |
| clsx + tailwind-merge | Classname utilities |
| Recharts 2.15.4 | Charting library |

---

## Directory Structure

```
/home/user/acl-assist-now/
├── src/
│   ├── App.tsx                      # Main app component with routing
│   ├── main.tsx                     # React entry point
│   ├── index.css                    # Global styles
│   ├── App.css                      # App-specific styles
│   │
│   ├── pages/                       # Route-level pages
│   │   ├── Index.tsx               # Home (renders CodeScreen)
│   │   ├── SessionHistory.tsx       # View/export past sessions
│   │   ├── Settings.tsx            # Theme, language, audio settings
│   │   ├── InstallHelp.tsx         # PWA installation guide
│   │   ├── About.tsx               # Disclaimer, sharing, credits
│   │   └── NotFound.tsx            # 404 page
│   │
│   ├── components/
│   │   ├── AppSidebar.tsx          # Navigation sidebar
│   │   ├── MobileHeader.tsx        # Mobile-specific header
│   │   ├── NavLink.tsx             # Custom navigation link
│   │   │
│   │   ├── acls/                   # ACLS/PALS module components
│   │   │   ├── CodeScreen.tsx      # Main ACLS interface (700 lines)
│   │   │   ├── PathwaySelector.tsx # Adult/Pediatric selection
│   │   │   ├── RhythmSelector.tsx  # VF/Asystole/PEA selection
│   │   │   ├── RhythmCheckModal.tsx # Rhythm reassessment
│   │   │   ├── ActionButtons.tsx   # Shock, medication, airway buttons
│   │   │   ├── TimerDisplay.tsx    # CPR cycle & epi timers
│   │   │   ├── CodeTimeline.tsx    # Visual intervention history
│   │   │   ├── CPRQualityPanel.tsx # CPR quality indicators
│   │   │   ├── HsAndTsChecklist.tsx # Reversible causes
│   │   │   ├── PregnancyChecklist.tsx # Pregnancy-specific features
│   │   │   ├── PostROSCScreen.tsx  # Post-ROSC management
│   │   │   ├── WeightInput.tsx     # Pediatric weight entry
│   │   │   ├── CommandBanner.tsx   # Critical action banner
│   │   │   ├── AddNoteDialog.tsx   # Note entry dialog
│   │   │   ├── ResumeSessionDialog.tsx # Session recovery
│   │   │   │
│   │   │   └── bradytachy/         # Brady/Tachy submodule
│   │   │       ├── BradyTachyModule.tsx # Main orchestrator
│   │   │       ├── BradyTachyPatientSelector.tsx
│   │   │       ├── BradycardiaScreen.tsx
│   │   │       ├── TachycardiaScreen.tsx
│   │   │       ├── SinusVsSVTSelector.tsx
│   │   │       ├── CompromiseAssessmentScreen.tsx
│   │   │       └── SinusEvaluationScreen.tsx
│   │   │
│   │   └── ui/                     # shadcn-ui components (40+ files)
│   │       ├── button.tsx, input.tsx, dialog.tsx
│   │       ├── sidebar.tsx, card.tsx, tabs.tsx
│   │       ├── checkbox.tsx, select.tsx, switch.tsx
│   │       ├── alert.tsx, toast.tsx, dropdown-menu.tsx
│   │       └── [30+ other reusable UI components]
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useACLSLogic.ts         # Main ACLS state machine (900+ lines)
│   │   ├── useBradyTachyLogic.ts   # Brady/Tachy state machine
│   │   ├── useAudioAlerts.ts       # Sound/vibration
│   │   ├── useVoiceAnnouncements.ts # Text-to-speech
│   │   ├── useMetronome.ts         # CPR rhythm metronome
│   │   ├── useWakeLock.ts          # Screen wake lock
│   │   ├── useSettings.ts          # Settings persistence
│   │   ├── usePWAInstall.ts        # PWA installation
│   │   └── use-mobile.tsx          # Mobile detection
│   │
│   ├── types/
│   │   └── acls.ts                 # TypeScript types & interfaces (348 lines)
│   │       # Key types:
│   │       # - ACLSSession, BradyTachySession
│   │       # - Intervention, VitalReading
│   │       # - HsAndTs, PregnancyCauses
│   │       # - PostROSCChecklist
│   │       # - Pathway, Rhythm, Phase enums
│   │
│   ├── lib/                         # Utility functions & business logic
│   │   ├── aclsDosing.ts           # Adult fixed dosing calculations
│   │   ├── palsDosing.ts           # Pediatric weight-based dosing
│   │   ├── bradyTachyDosing.ts     # Brady/Tachy dosing
│   │   ├── sessionStorage.ts       # IndexedDB session persistence
│   │   ├── bradyTachyStorage.ts    # Brady/Tachy session storage
│   │   ├── activeSessionStorage.ts # Current session recovery
│   │   ├── pdfExport.ts            # Session export to PDF (156 lines)
│   │   └── utils.ts                # cn() classname merge utility
│   │
│   └── i18n/                        # Internationalization
│       ├── index.ts                # i18next configuration
│       └── locales/                # Translation JSON files
│           ├── en.json             # English (primary)
│           ├── it.json             # Italian
│           ├── es.json             # Spanish
│           ├── fr.json             # French
│           ├── de.json             # German
│           └── el.json             # Greek
│
├── public/                          # Static assets
│   ├── pwa-192x192.png            # PWA icon
│   ├── pwa-512x512.png            # PWA icon
│   ├── apple-touch-icon.png       # iOS home screen
│   ├── favicon.ico
│   └── robots.txt
│
├── Configuration files
│   ├── package.json                # Dependencies & scripts
│   ├── vite.config.ts              # Vite bundler config
│   ├── tailwind.config.ts          # Tailwind CSS config
│   ├── components.json             # shadcn-ui config
│   ├── tsconfig.json               # TypeScript base config
│   ├── tsconfig.app.json           # TypeScript app config
│   ├── tsconfig.node.json          # TypeScript node config
│   ├── eslint.config.js            # ESLint linting rules
│   ├── postcss.config.js           # PostCSS config
│   ├── index.html                  # HTML entry point
│   └── README.md                   # Project documentation
```

### File Statistics
- **Total TypeScript/TSX files**: 103
- **Source code size**: ~765 KB
- **Largest files**:
  - `useACLSLogic.ts` (900+ lines)
  - `CodeScreen.tsx` (700 lines)
  - `SessionHistory.tsx` (600+ lines)
  - `acls.ts` types (348 lines)

---

## Architecture Patterns

### Overall Pattern
**Component-driven, hook-based state machine architecture**

### Key Architectural Principles

1. **Custom Hook-Based State Management**
   - No Redux or Context API for main state
   - Business logic encapsulated in custom hooks
   - Explicit state machine implementations
   - Phase-based state transitions

2. **Component Composition**
   - Smart components use hooks
   - Presentation components receive props
   - shadcn-ui provides atomic UI components
   - Feature modules are self-contained

3. **Domain-Driven Organization**
   - Code organized by feature (ACLS, Brady/Tachy)
   - Business logic separated from UI
   - Clear separation of concerns

4. **Type-Safe Development**
   - Comprehensive TypeScript types in `types/acls.ts`
   - Type inference throughout
   - Strict typing for medical data

5. **Offline-First PWA**
   - Service worker for caching
   - IndexedDB for persistent storage
   - localStorage for active sessions
   - Full offline functionality

---

## Core Features & Modules

### 1. ACLS/PALS Module

#### Pathway Support
- **Adult ACLS**: Standard AHA 2025 adult cardiac arrest algorithm
- **Pediatric PALS**: Weight-based dosing for patients <40kg

#### Rhythm Management
Three primary rhythms with distinct treatment pathways:
- **VF/pVT** (Ventricular Fibrillation/Pulseless Ventricular Tachycardia)
  - Shockable rhythm
  - Defibrillation every 2 minutes
  - Epinephrine after 2nd shock
  - Amiodarone/Lidocaine consideration

- **Asystole** (Flatline)
  - Non-shockable
  - Immediate epinephrine
  - H's and T's evaluation

- **PEA** (Pulseless Electrical Activity)
  - Non-shockable
  - Immediate epinephrine
  - H's and T's evaluation

#### CPR Cycle Management
- **2-minute cycle timer** with visual/audio alerts
- **15-second pre-shock warning** for rhythm check
- **Automatic cycle counting** (tracks completed cycles)
- **CPR quality indicators** (depth, rate, recoil)

#### Medication Tracking
- **Epinephrine**: Every 4 minutes (every other cycle)
  - ACLS: 1mg fixed dose
  - PALS: 0.01 mg/kg (max 1mg)
- **Amiodarone**: After 3rd shock
  - ACLS: 300mg initial, 150mg repeat
  - PALS: 5 mg/kg
- **Lidocaine**: Alternative to amiodarone
  - ACLS: 1-1.5 mg/kg
  - PALS: 1 mg/kg

#### Reversible Causes (H's and T's)
Interactive checklist for systematically ruling out:
- **H's**: Hypovolemia, Hypoxia, H+ (acidosis), Hypo/Hyperkalemia, Hypothermia
- **T's**: Tension pneumothorax, Tamponade (cardiac), Toxins, Thrombosis (pulmonary/coronary)

#### Pregnancy-Specific Support
For pregnant patients, additional causes checklist (A-H):
- **A**naesthesia complications
- **B**leeding/DIC
- **C**ardiovascular
- **D**rugs
- **E**mbolism (amniotic fluid, thrombosis)
- **F**ever/sepsis
- **G**eneral non-obstetric causes
- **H**ypertension (eclampsia)

Plus pregnancy-specific interventions:
- Manual left uterine displacement
- Perimortem cesarean section preparation (if >20 weeks)

#### Airway Management
Tracks airway interventions:
- Supraglottic airway (LMA, i-gel)
- Endotracheal intubation with waveform capnography
- Surgical airway

#### Post-ROSC (Return of Spontaneous Circulation)
Comprehensive checklist after successful resuscitation:
- Vital sign targets (BP, SpO2, EtCO2)
- 12-lead ECG
- Targeted temperature management
- Avoid hyperoxia/hyperventilation
- Coronary angiography consideration
- Blood glucose management
- Neuroprognostication planning

### 2. Brady/Tachy Module

Separate decision support for **symptomatic bradycardia and tachycardia**.

#### Patient Selection
- Adult pathway
- Pediatric pathway

#### Bradycardia Pathway
- Stability assessment
- Atropine consideration (contraindicated in hypothermia, AV block)
- Transcutaneous pacing
- Dopamine/epinephrine infusions
- Expert consultation triggers

#### Tachycardia Pathway
Algorithmic differentiation:
- **QRS width assessment**: Narrow (<0.12s) vs Wide (≥0.12s)
- **Regularity assessment**: Regular vs Irregular
- **Pediatric sinus vs SVT**: Heart rate + P-wave evaluation

Treatment strategies:
- Vagal maneuvers
- Adenosine (6mg → 12mg)
- Synchronized cardioversion (energy levels per rhythm)
- Rate control (beta-blockers, calcium channel blockers)
- Amiodarone/procainamide for wide complex

#### Escalation to Arrest
Seamless transition to ACLS/PALS if patient becomes pulseless

### 3. Cross-Cutting Features

#### Session Management
- **Active session recovery**: Automatically resumes interrupted codes
- **Session history**: All sessions stored with timestamps
- **PDF export**: Complete session reports with timeline, interventions, vitals
- **Note-taking**: Free-text notes with timestamps

#### Audio & Alerts
- **Customizable alerts**: Toggle sound, vibration, voice
- **CPR metronome**: Adjustable BPM (default 100-120)
- **Critical action announcements**: "Prepare to shock", "Epinephrine due"
- **Voice announcements**: Text-to-speech for timers and reminders

#### User Settings
- **Theme**: Dark/Light mode with system preference detection
- **Language**: 6-language support with persistence
- **Audio preferences**: Independent control of alerts, voice, metronome
- **Metronome BPM**: Adjustable CPR rhythm guide

#### PWA Features
- **Install prompts**: Mobile and desktop
- **Offline functionality**: Complete operation without internet
- **Screen wake lock**: Prevents screen timeout during active code
- **Home screen icons**: Platform-specific icons
- **Standalone mode**: Fullscreen app experience

---

## State Management

### Phase-Based State Machine

The application uses **explicit phase transitions** rather than traditional Redux or Context patterns.

### ACLS/PALS State Phases

```typescript
// From src/types/acls.ts
type Phase =
  | 'pathway_selection'      // Choose adult ACLS or pediatric PALS
  | 'initial'                // Enter patient info, weight if pediatric
  | 'cpr_pending_rhythm'     // 2-minute CPR before first rhythm check
  | 'rhythm_selection'       // Identify rhythm (VF/Asystole/PEA)
  | 'shockable_pathway'      // VF/pVT treatment
  | 'non_shockable_pathway'  // Asystole/PEA treatment
  | 'post_rosc'              // After ROSC achieved
  | 'code_ended'             // Termination or successful resuscitation
```

### State Transition Flow

```
Start Session
    ↓
pathway_selection (Adult/Pediatric)
    ↓
initial (Enter patient details)
    ↓
cpr_pending_rhythm (Start 2-min CPR)
    ↓
rhythm_selection (Check rhythm)
    ↓
    ├─→ shockable_pathway (VF/pVT)
    │   ├─→ Shock → CPR 2min → rhythm_selection (loop)
    │   ├─→ ROSC → post_rosc
    │   └─→ Terminate → code_ended
    │
    └─→ non_shockable_pathway (Asystole/PEA)
        ├─→ Epinephrine → CPR 2min → rhythm_selection (loop)
        ├─→ ROSC → post_rosc
        └─→ Terminate → code_ended
```

### Brady/Tachy State Phases

```typescript
type BradyTachyPhase =
  | 'patient_selection'      // Adult or pediatric
  | 'branch_selection'       // Bradycardia or tachycardia
  | 'bradycardia_assessment' // Evaluate stability
  | 'tachycardia_assessment' // QRS width, regularity
  | 'sinus_vs_svt'          // Pediatric differentiation
  | 'treatment'              // Active treatment phase
  | 'session_ended'          // Completion
```

### State Persistence

1. **Active Session** (`localStorage`)
   - Key: `activeACLSSession` or `activeBradyTachySession`
   - Saved on every state change
   - Enables automatic recovery on reload

2. **Historical Sessions** (`IndexedDB`)
   - Database: `ResusBuddyDB`
   - Object Stores: `aclsSessions`, `bradyTachySessions`
   - Saved when session ends
   - Enables history viewing and PDF export

3. **User Settings** (`localStorage`)
   - Key: `settings`
   - Persists theme, language, audio preferences

### Hook Architecture

#### `useACLSLogic.ts` (900+ lines)

Primary state management hook for ACLS/PALS.

**State Variables:**
- `phase`: Current workflow phase
- `pathway`: 'adult' | 'pediatric'
- `rhythm`: Current cardiac rhythm
- `cycleCount`: Number of CPR cycles completed
- `shockCount`: Number of defibrillations delivered
- `epinephrineGiven`: Doses administered
- `amiodaroneGiven`: Doses administered
- `interventions[]`: Complete timeline of actions
- `vitals[]`: Vital sign readings
- `hsAndTs`: Reversible causes checklist state
- `pregnancyData`: Pregnancy-specific data
- `postROSCChecklist`: Post-ROSC management tasks

**Key Functions:**
- `startSession()`: Initialize new session
- `handlePathwaySelection()`: Set adult/pediatric
- `handleRhythmSelect()`: Process rhythm choice
- `deliverShock()`: Record defibrillation
- `giveEpinephrine()`: Administer epinephrine
- `giveAmiodarone()`: Administer amiodarone
- `achieveROSC()`: Transition to post-ROSC
- `endCode()`: Finalize session

**Timer Management:**
- CPR cycle timer (2 minutes)
- Epinephrine timer (4 minutes)
- Pre-shock warning (15 seconds before cycle end)
- Auto-pause when rhythm selection modal opens

#### `useBradyTachyLogic.ts`

State management for symptomatic arrhythmias.

**State Variables:**
- `phase`: Workflow phase
- `patientGroup`: 'adult' | 'pediatric'
- `branch`: 'bradycardia' | 'tachycardia'
- `qrsWidth`: 'narrow' | 'wide'
- `regularity`: 'regular' | 'irregular'
- `isCompromised`: Stability assessment
- `interventions[]`: Treatment timeline

**Key Functions:**
- `selectPatientGroup()`: Adult/pediatric choice
- `selectBranch()`: Brady vs tachy
- `recordIntervention()`: Log treatment
- `escalateToArrest()`: Switch to ACLS module

#### `useAudioAlerts.ts`

Audio feedback management.

**Capabilities:**
- Play alert sounds (via Web Audio API)
- Trigger vibration (via Vibration API)
- Configurable enable/disable

#### `useVoiceAnnouncements.ts`

Text-to-speech announcements.

**Capabilities:**
- Synthesize speech (via Web Speech API)
- Announce timer events
- Announce critical actions
- Language-aware (uses current i18n language)

#### `useMetronome.ts`

CPR rhythm guidance.

**Capabilities:**
- Configurable BPM (default 110)
- Audio click on each beat
- Start/stop control
- Persistence of BPM setting

#### `useWakeLock.ts`

Screen wake lock management.

**Capabilities:**
- Request wake lock on session start
- Release on session end
- Handle visibility changes
- Fallback for unsupported browsers

---

## Component Architecture

### Component Hierarchy

```
App.tsx (Routing & Providers)
├── SidebarProvider
│   ├── AppSidebar (Navigation)
│   ├── MobileHeader (Mobile nav)
│   └── <Outlet> (Route content)
│       ├── Index.tsx → CodeScreen
│       ├── SessionHistory.tsx
│       ├── Settings.tsx
│       ├── InstallHelp.tsx
│       ├── About.tsx
│       └── NotFound.tsx
```

### CodeScreen Component Tree

**CodeScreen.tsx** is the main ACLS/PALS interface (700 lines).

```
CodeScreen
├── useACLSLogic() hook
├── useWakeLock()
├── useAudioAlerts()
├── useMetronome()
├── useVoiceAnnouncements()
├── useSettings()
│
├── ResumeSessionDialog (if active session exists)
│
├── PathwaySelector (if phase === 'pathway_selection')
│
├── WeightInput (if pediatric && phase === 'initial')
│
├── Main Interface Container
│   ├── CommandBanner (critical action display)
│   ├── ActionButtons
│   │   ├── Shock button (if shockable rhythm)
│   │   ├── Epinephrine button
│   │   ├── Amiodarone button
│   │   ├── Airway buttons
│   │   └── ROSC button
│   │
│   ├── TimerDisplay
│   │   ├── CPR cycle timer (2:00 countdown)
│   │   ├── Next epinephrine timer
│   │   └── Shock/cycle/epi counts
│   │
│   ├── Tabs Interface
│   │   ├── Timeline Tab
│   │   │   └── CodeTimeline (intervention history)
│   │   │
│   │   ├── H's & T's Tab
│   │   │   └── HsAndTsChecklist
│   │   │
│   │   ├── CPR Quality Tab
│   │   │   └── CPRQualityPanel
│   │   │
│   │   ├── Pregnancy Tab (if applicable)
│   │   │   └── PregnancyChecklist
│   │   │
│   │   └── Brady/Tachy Tab
│   │       └── BradyTachyModule
│   │           ├── BradyTachyPatientSelector
│   │           ├── BradycardiaScreen
│   │           ├── TachycardiaScreen
│   │           ├── SinusVsSVTSelector
│   │           ├── CompromiseAssessmentScreen
│   │           └── SinusEvaluationScreen
│   │
│   └── Control Buttons
│       ├── Add Note
│       ├── Add Vital Signs
│       ├── Rhythm Check
│       ├── Metronome toggle
│       └── End Code
│
├── RhythmCheckModal (rhythm selection)
├── AddNoteDialog
├── PostROSCScreen (if phase === 'post_rosc')
└── Session Summary (if phase === 'code_ended')
```

### Key Component Files

#### `CodeScreen.tsx` (700 lines)
Main orchestrator for ACLS/PALS workflow.

**Responsibilities:**
- Session initialization and recovery
- Hook integration (logic, audio, wake lock)
- Phase-based UI rendering
- Modal management
- Auto-save to localStorage

**Key Sections:**
1. Resume dialog on mount
2. Pathway selection UI
3. Main code interface with timers and buttons
4. Post-ROSC screen
5. Code summary

#### `ActionButtons.tsx`
Intervention buttons with dosing information.

**Features:**
- Shock button with energy level
- Medication buttons with dosing
- Airway management buttons
- ROSC declaration
- Disabled states based on timing/phase

#### `TimerDisplay.tsx`
Real-time countdown timers.

**Displays:**
- CPR cycle timer (2:00 format, red when <15s)
- Next epinephrine timer
- Counts: shocks, cycles, epinephrine doses
- Visual alerts (color changes, pulsing)

#### `CodeTimeline.tsx`
Visual intervention history.

**Features:**
- Chronological list of interventions
- Color-coded by type (shock, medication, airway, etc.)
- Timestamps relative to code start
- Notes and vitals interleaved

#### `HsAndTsChecklist.tsx`
Reversible causes tracking.

**Features:**
- Two columns: H's and T's
- Checkbox interaction
- Persistence in session state
- Explanatory tooltips

#### `PregnancyChecklist.tsx`
Pregnancy-specific considerations.

**Features:**
- A-H cause checklist
- Intervention tracking (uterine displacement, C-section prep)
- Gestational age input
- Only shown for female patients

#### `PostROSCScreen.tsx`
Post-resuscitation management.

**Features:**
- Vital sign targets (color-coded)
- Intervention checklist
- Timestamp of ROSC
- Return to CPR button (if re-arrest)

#### `BradyTachyModule.tsx`
Standalone symptomatic arrhythmia module.

**Features:**
- Separate state machine via `useBradyTachyLogic`
- Patient selection → branch selection → assessment → treatment
- Escalation to arrest button
- Independent timeline and intervention tracking

---

## Data Flow & Persistence

### Data Flow Diagram

```
User Action (e.g., "Deliver Shock")
    ↓
Component Handler (e.g., onClick)
    ↓
Hook Function (e.g., deliverShock())
    ↓
State Update (intervention added, counts incremented)
    ↓
useEffect Trigger (session changed)
    ↓
localStorage Save (activeACLSSession)
    ↓
Component Re-render (updated UI)
    ↓
Audio/Voice Hooks (play alerts)
```

### Persistence Architecture

#### 1. Active Session (`localStorage`)

**File**: `src/lib/activeSessionStorage.ts`

**Functions**:
- `saveActiveSession(session)`: Save current session
- `loadActiveSession()`: Retrieve on mount
- `clearActiveSession()`: Remove on completion

**Trigger**: Every state change in `useACLSLogic`

**Purpose**: Enable session recovery if browser crashes or user navigates away

#### 2. Historical Sessions (`IndexedDB`)

**File**: `src/lib/sessionStorage.ts`

**Database**: `ResusBuddyDB`

**Object Stores**:
- `aclsSessions`: Completed ACLS/PALS sessions
- `bradyTachySessions`: Completed Brady/Tachy sessions

**Functions**:
- `saveSession(session)`: Store completed session
- `getAllSessions()`: Retrieve for history view
- `deleteSession(id)`: Remove session
- `clearAllSessions()`: Wipe history

**Trigger**: When user ends code or achieves ROSC

**Purpose**: Long-term storage for review and export

#### 3. User Settings (`localStorage`)

**File**: `src/hooks/useSettings.ts`

**Key**: `settings`

**Schema**:
```typescript
{
  theme: 'light' | 'dark' | 'system',
  language: 'en' | 'it' | 'es' | 'fr' | 'de' | 'el',
  audioEnabled: boolean,
  vibrationEnabled: boolean,
  voiceEnabled: boolean,
  metronomeBPM: number
}
```

**Access**: Via `useSettings` hook

### PDF Export

**File**: `src/lib/pdfExport.ts` (156 lines)

**Function**: `exportSessionToPDF(session)`

**Content**:
1. **Header**: ResusBuddy logo, session date/time
2. **Patient Info**: Age, weight (if pediatric), pathway
3. **Session Summary**:
   - Duration
   - Outcome (ROSC vs terminated)
   - Final rhythm
4. **Statistics**:
   - Shocks delivered
   - Epinephrine doses
   - Amiodarone doses
   - CPR cycles
5. **Timeline**: Complete intervention list with timestamps
6. **Vitals**: Table of vital sign readings
7. **H's & T's**: Checked items
8. **Pregnancy Data**: If applicable
9. **Post-ROSC**: If ROSC achieved
10. **Notes**: User-added notes

**Usage**: "Export PDF" button in SessionHistory.tsx

---

## Key Files Reference

### Entry Points

| File | Purpose | Lines |
|------|---------|-------|
| `index.html` | HTML shell, PWA manifest, meta tags | ~50 |
| `src/main.tsx` | React root, i18n init | ~20 |
| `src/App.tsx` | Routing, sidebar, theme provider | ~80 |

### Core State Management

| File | Purpose | Lines |
|------|---------|-------|
| `src/hooks/useACLSLogic.ts` | ACLS/PALS state machine | 900+ |
| `src/hooks/useBradyTachyLogic.ts` | Brady/Tachy state machine | ~600 |
| `src/types/acls.ts` | TypeScript type definitions | 348 |

### Main UI Components

| File | Purpose | Lines |
|------|---------|-------|
| `src/components/acls/CodeScreen.tsx` | Main ACLS interface | 700 |
| `src/pages/SessionHistory.tsx` | History view & export | 600+ |
| `src/components/acls/PostROSCScreen.tsx` | Post-ROSC checklist | ~300 |

### Business Logic

| File | Purpose | Lines |
|------|---------|-------|
| `src/lib/aclsDosing.ts` | Adult medication dosing | ~100 |
| `src/lib/palsDosing.ts` | Pediatric weight-based dosing | ~150 |
| `src/lib/pdfExport.ts` | PDF report generation | 156 |

### Data Persistence

| File | Purpose | Lines |
|------|---------|-------|
| `src/lib/sessionStorage.ts` | IndexedDB operations | ~200 |
| `src/lib/activeSessionStorage.ts` | Active session localStorage | ~50 |

### Internationalization

| File | Purpose | Lines |
|------|---------|-------|
| `src/i18n/index.ts` | i18next configuration | ~50 |
| `src/i18n/locales/en.json` | English translations | ~500 keys |

### Configuration

| File | Purpose |
|------|---------|
| `vite.config.ts` | Build config, PWA plugin |
| `tailwind.config.ts` | Tailwind customization, themes |
| `components.json` | shadcn-ui setup |
| `tsconfig.json` | TypeScript base config |
| `package.json` | Dependencies, scripts |

---

## Internationalization

### Implementation

**Library**: i18next + react-i18next

**Configuration**: `src/i18n/index.ts`

### Supported Languages

| Code | Language | Translation File |
|------|----------|------------------|
| en | English | `locales/en.json` |
| it | Italian | `locales/it.json` |
| es | Spanish | `locales/es.json` |
| fr | French | `locales/fr.json` |
| de | German | `locales/de.json` |
| el | Greek | `locales/el.json` |

### Usage in Components

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return <div>{t('acls.deliverShock')}</div>;
}
```

### Translation Key Structure

**Namespaces**:
- `acls.*` - ACLS/PALS specific terms
- `bradyTachy.*` - Brady/Tachy module
- `common.*` - Shared UI elements
- `settings.*` - Settings page
- `sessionHistory.*` - History page
- `about.*` - About page

**Example Keys**:
```json
{
  "acls": {
    "deliverShock": "Deliver Shock",
    "giveEpinephrine": "Give Epinephrine",
    "rhythmCheck": "Rhythm Check",
    "vfpvt": "VF/pVT",
    "asystole": "Asystole",
    "pea": "PEA"
  },
  "bradyTachy": {
    "bradycardia": "Bradycardia",
    "tachycardia": "Tachycardia",
    "giveDopamine": "Give Dopamine Infusion"
  }
}
```

### Language Selection

**Storage**: `localStorage.getItem('language')`

**Detection Order**:
1. User's saved preference (localStorage)
2. Browser language (`navigator.language`)
3. Fallback: English

**UI**: Dropdown in Settings page

### Adding New Language

1. Create `src/i18n/locales/[code].json`
2. Copy structure from `en.json`
3. Translate all keys
4. Add to `src/i18n/index.ts` resources
5. Add to Settings dropdown

---

## PWA Implementation

### Service Worker

**Plugin**: `vite-plugin-pwa`

**Configuration**: `vite.config.ts`

**Strategy**: `NetworkFirst` for HTML, `CacheFirst` for assets

**Workbox Runtime Caching**:
- Google Fonts: `CacheFirst` with 1-year expiration

### Manifest

**Location**: Defined in `vite.config.ts` PWA plugin

**Key Properties**:
```json
{
  "name": "ResusBuddy",
  "short_name": "ResusBuddy",
  "description": "ACLS & PALS Resuscitation Support",
  "theme_color": "#dc2626",
  "background_color": "#ffffff",
  "display": "standalone",
  "icons": [
    { "src": "pwa-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "pwa-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Installation

**Hook**: `usePWAInstall.ts`

**Capabilities**:
- Detect installability
- Show custom install prompt
- Track installation events

**UI**:
- Install banner on mobile (dismissible)
- "Install App" page (`InstallHelp.tsx`) with platform-specific instructions

### Offline Functionality

**Fully Offline**:
- All UI assets cached by service worker
- No external API dependencies
- IndexedDB for data storage
- localStorage for settings

**Updates**:
- Service worker updates automatically
- User prompted to reload when new version available

### Platform Support

**iOS**:
- `apple-touch-icon.png` for home screen
- `apple-mobile-web-app-capable` meta tag
- Safari-specific installation instructions

**Android**:
- Automatic install prompt
- Chrome/Edge PWA installation

**Desktop**:
- Chrome, Edge, Brave support
- Install from address bar

---

## Development Guide

### Prerequisites

- Node.js 18+
- npm 9+

### Getting Started

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:8080)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Development Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server on port 8080 |
| `npm run build` | Type check and build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |

### Adding a New Feature

1. **Define types** in `src/types/acls.ts`
2. **Add business logic** in `src/hooks/` or `src/lib/`
3. **Create UI components** in `src/components/`
4. **Add translations** to all `src/i18n/locales/*.json` files
5. **Update state machine** in `useACLSLogic.ts` or `useBradyTachyLogic.ts`
6. **Test in dev mode** with `npm run dev`

### Adding a shadcn-ui Component

```bash
npx shadcn@latest add [component-name]
```

This will:
- Add component to `src/components/ui/`
- Update `components.json`
- Install dependencies if needed

### Code Style

**TypeScript**:
- Use explicit types where helpful
- Prefer interfaces for object shapes
- Use enums for fixed sets

**React**:
- Functional components only
- Hooks for state and side effects
- Props interfaces for components

**Styling**:
- Tailwind utility classes
- Use `cn()` utility for conditional classes
- Custom theme colors in `tailwind.config.ts`

### File Naming

- Components: `PascalCase.tsx`
- Hooks: `use*.ts` or `use*.tsx`
- Utils: `camelCase.ts`
- Types: `camelCase.ts`

### Import Paths

Use `@/` alias for cleaner imports:

```typescript
import { Button } from '@/components/ui/button';
import { useACLSLogic } from '@/hooks/useACLSLogic';
import type { ACLSSession } from '@/types/acls';
```

### Testing Session Flow

1. Start dev server
2. Open `http://localhost:8080`
3. Click "Start New Code"
4. Select pathway (Adult or Pediatric)
5. If pediatric, enter weight
6. Test interventions (shock, epinephrine, etc.)
7. Check timers, audio alerts, timeline
8. Test rhythm changes
9. Test ROSC and Post-ROSC screen
10. End code and verify session saved to history

### Testing Brady/Tachy Module

1. Start ACLS session
2. Go to "Brady/Tachy" tab
3. Select patient group
4. Choose bradycardia or tachycardia
5. Follow assessment flow
6. Record interventions
7. Test escalation to arrest (returns to main ACLS)

### Testing Offline Functionality

1. Build production version: `npm run build`
2. Serve: `npm run preview`
3. Open in browser
4. Install as PWA (if prompted)
5. Open DevTools → Network → Set to Offline
6. Reload page - should work fully offline
7. Test session creation, history, settings

### Debugging

**React DevTools**:
- Install React DevTools extension
- Inspect component props and state

**Console Logging**:
- Check for errors in Browser Console
- Service worker logs in Application → Service Workers

**IndexedDB Inspection**:
- DevTools → Application → Storage → IndexedDB → ResusBuddyDB

**localStorage Inspection**:
- DevTools → Application → Storage → Local Storage
- Look for `activeACLSSession`, `settings`, `language`

---

## Medical Disclaimer

**IMPORTANT**: This application is for **educational and training purposes only**.

- **NOT** a medical device
- **NOT** for diagnostic use
- **NOT** a substitute for clinical judgment
- **NOT** validated for patient care

Healthcare professionals should rely on:
- Current AHA guidelines
- Local protocols
- Clinical expertise
- Appropriate medical oversight

Use at your own risk. See full disclaimer in About page.

---

## Key Design Decisions

### Why Custom Hooks Instead of Redux?

**Reasons**:
1. **Simplicity**: State is local to ACLS workflow, no global sharing needed
2. **Performance**: No re-render issues with context
3. **Type Safety**: Direct TypeScript integration
4. **Maintainability**: Business logic co-located with state

### Why Phase-Based State Machine?

**Reasons**:
1. **Clinical Workflow**: Matches actual code team progression
2. **Validation**: Prevents invalid state transitions
3. **UI Clarity**: Phase directly determines UI rendering
4. **Testing**: Easier to test discrete phases

### Why IndexedDB for History?

**Reasons**:
1. **Storage Limit**: localStorage limited to ~5MB
2. **Performance**: Efficient for large datasets
3. **Structured Queries**: Better than localStorage for searching
4. **Offline**: Works without network

### Why i18next?

**Reasons**:
1. **Industry Standard**: Well-maintained, widely used
2. **Feature-Rich**: Namespaces, pluralization, interpolation
3. **React Integration**: Official react-i18next library
4. **Language Detection**: Automatic browser language detection

### Why shadcn-ui?

**Reasons**:
1. **Copy-Paste**: Components live in your codebase, full control
2. **Tailwind Native**: Perfect integration with Tailwind CSS
3. **Radix Primitives**: Accessible, unstyled components underneath
4. **No Lock-In**: Not a dependency, just code you own

### Why Vite?

**Reasons**:
1. **Speed**: Lightning-fast HMR during development
2. **Modern**: Native ESM, optimized builds
3. **PWA Plugin**: Excellent vite-plugin-pwa integration
4. **TypeScript**: First-class TypeScript support

---

## Future Considerations

### Potential Enhancements

1. **Data Sync**: Optional cloud backup for session history
2. **Team Mode**: Multi-user session collaboration
3. **Custom Protocols**: Hospital-specific protocol variations
4. **Analytics**: De-identified usage metrics for quality improvement
5. **Video Recording**: Screen capture for debriefing
6. **Medication Database**: Expanded drug reference
7. **Integration**: HL7 FHIR for EHR integration (if medical device status pursued)

### Scalability

- **Current**: Supports hundreds of sessions in IndexedDB
- **Limit**: Browser storage quota (~50MB typical, ~1GB max)
- **Cleanup**: Manual deletion of old sessions recommended

### Accessibility

- **Current**: Keyboard navigation, screen reader support via Radix
- **Future**: WCAG 2.1 AA compliance audit, voice control

### Performance

- **Current**: Excellent on modern devices
- **Optimization**: Code splitting for larger features, lazy loading for history

---

## Contributing

### Guidelines

1. **Medical Accuracy**: Verify against current AHA guidelines
2. **Translation Quality**: Use medical translators for new languages
3. **Testing**: Test all session flows before PR
4. **TypeScript**: Maintain type safety
5. **Accessibility**: Ensure keyboard and screen reader compatibility

### Review Checklist

- [ ] TypeScript types defined
- [ ] Translations added for all 6 languages
- [ ] Component follows existing patterns
- [ ] No ESLint errors
- [ ] Tested in dev mode
- [ ] Tested offline (if applicable)
- [ ] Mobile responsive
- [ ] Dark mode compatible

---

## Support & Resources

### Documentation
- **AHA Guidelines**: https://cpr.heart.org/
- **React**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **shadcn-ui**: https://ui.shadcn.com/
- **i18next**: https://www.i18next.com/

### Repository
- **GitHub**: (Add your repository URL)

### License
- (Add your license information)

---

**Last Updated**: 2025-12-31
**Version**: 1.0
**Authors**: ResusBuddy Development Team
