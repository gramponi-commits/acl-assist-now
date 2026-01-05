# Resuscitation Module - Feature Specification

## Purpose and Scope

Build a clinical-grade resuscitation decision support application implementing the **2025 AHA (American Heart Association) Cardiac Arrest Algorithm** guidelines. The module provides real-time guidance during resuscitation scenarios for healthcare professionals, code teams, and medical trainees.

**Target Users:**
- Healthcare professionals (physicians, nurses, paramedics)
- Hospital code teams
- Medical trainees and students
- Emergency department staff

**Important Disclaimer:**
- FOR EDUCATIONAL AND TRAINING PURPOSES ONLY
- NOT a medical device or diagnostic tool
- Does NOT replace clinical judgment or formal certification
- Users are responsible for patient care decisions

---

## Core Protocol Support

### 1. ACLS (Advanced Cardiovascular Life Support) - Adult Protocol

**Fixed Medication Dosing:**
- **Epinephrine:** 1 mg IV/IO every 3-5 minutes (configurable: 3, 4, or 5 min interval)
- **Amiodarone:** 300 mg first dose, 150 mg second dose (max 2 doses)
- **Lidocaine (alternative):** 100 mg first dose, 50 mg maintenance
- **Defibrillation Energy:** Configurable (120J, 150J, 200J, or 360J biphasic)

### 2. PALS (Pediatric Advanced Life Support) - Pediatric Protocol

**Weight-Based Medication Dosing:**
- **Epinephrine:** 0.01 mg/kg IV/IO (max 1 mg)
- **Amiodarone:** 5 mg/kg (first dose max 300 mg, subsequent max 150 mg)
- **Lidocaine:** 1 mg/kg
- **Defibrillation Energy:**
  - First shock: 2 J/kg
  - Second shock: 4 J/kg
  - Subsequent: 4-10 J/kg (max 360J)

**CPR Ratio Options:**
- Single rescuer: 30:2
- Two rescuers: 15:2

---

## State Machine Architecture

### ACLS/PALS Phase Flow

```
pathway_selection → initial → cpr_pending_rhythm → rhythm_selection
                                                          ↓
                    ┌──────────────────┬──────────────────┘
                    ↓                  ↓
           shockable_pathway    non_shockable_pathway
           (VF/pVT)             (Asystole/PEA)
                    ↓                  ↓
                    └────────┬─────────┘
                             ↓
              ┌──────────────┼──────────────┐
              ↓              ↓              ↓
         post_rosc      code_ended     (continue CPR cycles)
```

### Phase Descriptions

1. **pathway_selection:** User chooses Adult ACLS or Pediatric PALS protocol
2. **initial:** Patient data entry (weight for pediatric patients)
3. **cpr_pending_rhythm:** CPR initiated, awaiting rhythm analysis
4. **rhythm_selection:** Identify cardiac rhythm (VF/pVT, Asystole, or PEA)
5. **shockable_pathway:** VF/pVT management with defibrillation
6. **non_shockable_pathway:** Asystole/PEA management (no shocks)
7. **post_rosc:** Post-resuscitation care after return of spontaneous circulation
8. **code_ended:** Session terminated (ROSC achieved or deceased)

---

## Rhythm Management

### Three Primary Rhythms

1. **VF/pVT (Ventricular Fibrillation / Pulseless Ventricular Tachycardia)**
   - Shockable rhythm
   - Defibrillation every 2 minutes after rhythm check
   - Epinephrine after 2nd shock, then every 3-5 minutes
   - Amiodarone/Lidocaine after 3rd shock

2. **Asystole (Flatline)**
   - Non-shockable rhythm
   - Immediate epinephrine
   - Focus on H's and T's (reversible causes)

3. **PEA (Pulseless Electrical Activity)**
   - Non-shockable rhythm
   - Immediate epinephrine
   - Focus on H's and T's (reversible causes)

---

## Timer System

### CPR Cycle Timer
- **Duration:** 2-minute cycles
- **Pre-shock alert:** Warning at 15 seconds before cycle end
- **Visual indicators:** Color changes when approaching rhythm check
- **Pause functionality:** Timer pauses during rhythm check modal

### Epinephrine Timer
- **Interval:** Configurable (3, 4, or 5 minutes)
- **Visual countdown:** Shows time until next dose due
- **Shockable pathway:** Starts after 2nd shock
- **Non-shockable pathway:** Starts immediately

### Total Elapsed Timer
- Tracks total code duration from start
- Continues running even during rhythm checks
- Used for session reporting

### CPR Fraction Tracking
- Calculates percentage of time spent doing CPR
- Important quality metric per AHA guidelines
- Displayed in session summary and PDF export

---

## Reversible Causes (H's and T's)

### Interactive Checklist with Diagnostic & Management Guidance

**H's (5 causes):**
1. **Hypovolemia** - Blood/fluid loss
2. **Hypoxia** - Oxygen deficiency
3. **Hydrogen ion (Acidosis)** - pH imbalance
4. **Hypo/Hyperkalemia** - Potassium abnormalities
5. **Hypothermia** - Low body temperature

**T's (5 causes):**
1. **Tension Pneumothorax** - Collapsed lung with pressure
2. **Tamponade (Cardiac)** - Fluid around heart
3. **Toxins** - Drug/poison overdose
4. **Thrombosis (Pulmonary)** - Pulmonary embolism
5. **Thrombosis (Coronary)** - Acute MI

**For each cause, provide:**
- Checkbox to track consideration
- Brief description
- Expandable diagnostic evaluation tips
- Expandable management recommendations

---

## Pregnancy-Specific Protocol (Adult Only)

### Activation
- User can activate pregnancy protocol during code
- Once activated, cannot be deactivated
- Shows countdown timer to 5-minute mark

### Emergency Delivery Alert
- **Critical alert at 5 minutes:** Perimortem cesarean delivery consideration
- Pulsating visual warning
- Voice announcement (if enabled)

### Pregnancy-Specific Causes (A-H Mnemonic)
1. **A - Anesthetic complications**
2. **B - Bleeding/DIC**
3. **C - Cardiovascular**
4. **D - Drugs**
5. **E - Embolic (amniotic fluid, thrombosis)**
6. **F - Fever/Sepsis**
7. **G - General non-obstetric causes**
8. **H - Hypertension (eclampsia)**

### Pregnancy Interventions Checklist
- Manual left uterine displacement
- Early airway management
- IV access above diaphragm
- Stop magnesium, give calcium (if applicable)
- Detach fetal monitors
- Massive transfusion preparation

---

## Bradycardia/Tachycardia Module

### Separate Decision Support for Arrhythmias with Pulse

**Phase Flow:**
```
patient_selection → branch_selection → assessment → treatment → session_ended
                                                  ↓
                                        (switch_to_arrest if pulseless)
```

### Bradycardia Pathway

**Assessment:**
- Stability evaluation (signs of compromise)
- Determine if symptomatic

**Treatment Options:**
- **Atropine:** Adult 1 mg (max 3 mg total), Pediatric 0.02 mg/kg
- **Transcutaneous pacing** preparation
- **Dopamine infusion:** 5-20 mcg/kg/min
- **Epinephrine infusion:** 2-10 mcg/min

### Tachycardia Pathway

**Assessment Steps:**
1. QRS width evaluation: Narrow (<0.12s) vs Wide (≥0.12s)
2. Regularity: Regular vs Irregular
3. Stability: Stable vs Unstable (hemodynamic compromise)
4. Pediatric: Sinus tachycardia vs SVT differentiation

**Treatment Options:**
- **Vagal maneuvers** (stable narrow-complex)
- **Adenosine:** 6 mg first dose, 12 mg second dose (Adult); 0.1 mg/kg, then 0.2 mg/kg (Pediatric)
- **Synchronized cardioversion** (energy varies by rhythm):
  - Atrial fibrillation/flutter: 200J
  - Narrow-complex: 100J
  - Monomorphic VT: 100J
  - Polymorphic VT: Defibrillation (unsynchronized)
- **Rate control:** Beta-blockers, Calcium channel blockers
- **Amiodarone:** 150 mg loading dose
- **Procainamide:** 20-50 mg/min loading

**Escalation to Arrest:**
- Seamless transition to cardiac arrest module if patient becomes pulseless
- Preserves intervention timeline from brady/tachy phase

---

## Airway Management Tracking

### Airway Status Options
1. **BVM (Ambu)** - Bag-valve-mask ventilation (default)
2. **SGA** - Supraglottic airway (LMA, i-gel)
3. **ETT** - Endotracheal intubation

### EtCO2 Monitoring
- Input field for end-tidal CO2 readings
- Logged in intervention timeline
- Included in session export

---

## Post-ROSC Care (Return of Spontaneous Circulation)

### Vital Sign Targets with Color-Coded Feedback

| Parameter | Target Range | Unit |
|-----------|--------------|------|
| SpO₂ | 90-98% | % |
| PaCO₂ | 35-45 | mmHg |
| MAP | ≥65 | mmHg |
| Temperature | 32-37.5 | °C |
| Glucose | 70-180 | mg/dL |

- Input fields for each vital
- Real-time validation (in-range vs out-of-range indicators)

### Post-ROSC Checklist

**Initial Stabilization:**
- Airway secured
- Ventilation optimized
- Hemodynamics optimized

**Diagnostics:**
- 12-lead ECG
- Labs ordered
- CT head ordered
- Echo ordered

**Neuroprotection:**
- Temperature management initiated
- Neurological assessment
- EEG ordered (if indicated)

**Special Assessments (Yes/No/Null):**
- Following commands?
- ST elevation present?
- Cardiogenic shock present?

---

## Intervention Timeline

### Comprehensive Event Logging

Every action is timestamped and logged:
- Rhythm changes
- Shocks delivered (with energy)
- Medications given (with doses)
- Airway interventions
- CPR starts/pauses
- ROSC achieved
- Code termination
- User notes

### Timeline Display
- Chronological list
- Color-coded by intervention type
- Relative timestamps (time since code start)
- Device time (clock time)

---

## Audio & Alert System

### Sound Alerts
- **Rhythm check due:** Triple beep (880 Hz)
- **Pre-charge warning:** Double beep (660 Hz)
- **Epinephrine due:** Double beep (440 Hz)
- **ROSC achieved:** Success tone (523 Hz)

### Vibration Support
- Device vibration patterns for alerts

### Voice Announcements (Text-to-Speech)
- Configurable on/off
- Priority queue system (prevents overlapping)
- Announcements include:
  - "Rhythm check"
  - "Prepare to charge defibrillator"
  - "Epinephrine due"
  - "Resume CPR"
  - "ROSC achieved"
  - "Emergency delivery - consider perimortem cesarean"

### CPR Metronome
- Configurable BPM (80-140, default 110)
- Audio clicks at compression rate
- Start/stop control
- Helps maintain proper compression rate (100-120/min per AHA)

---

## Session Management

### Active Session Recovery
- Auto-saves session state on every change
- Prompts to resume interrupted session on app launch
- Preserves all timers, counts, and intervention history

### Session History Storage
- Saves completed sessions
- Stores:
  - Session metadata (ID, timestamps, duration)
  - Outcome (ROSC, deceased, resolved, transferred)
  - All interventions with timestamps
  - Medication counts
  - Vital readings
  - H's & T's checklist state
  - Post-ROSC data (if applicable)
  - Pregnancy data (if applicable)

### PDF Export
- Professional formatted report
- Includes:
  - Session date/time
  - Protocol used (ACLS/PALS)
  - Patient weight (if pediatric)
  - Outcome and duration
  - CPR fraction
  - Complete intervention timeline
  - Medications summary
  - H's & T's reviewed
  - Post-ROSC checklist and vitals
  - Pregnancy data (if applicable)

### Note-Taking
- Add free-text notes during code
- Timestamped and included in timeline
- Preserved in session history and PDF export

---

## Settings & Preferences

### Clinical Settings
- **Adult Defibrillator Energy:** 120J, 150J, 200J, or 360J
- **Epinephrine Interval:** 3, 4, or 5 minutes
- **Prefer Lidocaine over Amiodarone:** Toggle

### Audio Settings
- **Sound alerts:** On/Off
- **Vibration:** On/Off
- **Voice announcements:** On/Off
- **CPR Metronome:** On/Off
- **Metronome BPM:** 80-140 (slider)

### Display Settings
- **Theme:** Dark/Light mode

---

## User Interface Requirements

### Main Code Screen Components

1. **Command Banner (Top)**
   - Dynamic guidance based on current state
   - Priority levels: Critical (red), Warning (yellow), Info (blue), Success (green)
   - Primary message + optional submessage
   - Examples:
     - "START HIGH-QUALITY CPR" (initial)
     - "GIVE EPINEPHRINE NOW" (epi due)
     - "PREPARE TO CHARGE - 15 seconds" (pre-shock)
     - "RHYTHM CHECK - Pause CPR" (cycle complete)
     - "ROSC ACHIEVED - Begin post-resuscitation care" (success)

2. **Timer Display**
   - CPR cycle countdown (MM:SS format)
   - Next epinephrine countdown
   - Total elapsed time
   - Visual indicators for urgency

3. **Action Buttons**
   - Shock button (shockable pathway only)
   - Epinephrine button (with dose display)
   - Amiodarone button (after 3rd shock, max 2 doses)
   - Lidocaine button (alternative)
   - Airway management options
   - ROSC button

4. **Stats Display**
   - Shock count
   - CPR cycle count
   - Epinephrine dose count

5. **Tabbed Content Area**
   - Timeline tab (intervention history)
   - H's & T's tab (reversible causes)
   - CPR Quality tab (compression guidance)
   - Pregnancy tab (if applicable, adult only)
   - Brady/Tachy tab (arrhythmia module)

6. **Control Buttons**
   - Add Note
   - Record Vitals
   - Rhythm Check
   - Metronome toggle
   - End Code

### Rhythm Check Modal
- Triggered by rhythm check button or cycle completion
- Options:
  - VF/pVT (Shock + Resume CPR)
  - Asystole (No Shock + Resume CPR)
  - PEA (No Shock + Resume CPR)
  - ROSC (Transition to post-ROSC)
  - Continue same rhythm (Resume CPR)

### Responsive Design
- Mobile-first approach
- Desktop sidebar navigation
- Mobile header with menu
- Touch-friendly buttons and controls
- Appropriate spacing for clinical use (gloved hands)

---

## Data Types & Structures

### Session Data Model

```typescript
interface Session {
  id: string;
  startTime: number;
  endTime: number | null;
  currentRhythm: 'vf_pvt' | 'asystole' | 'pea' | null;
  phase: Phase;
  outcome: 'rosc' | 'deceased' | null;
  pathwayMode: 'adult' | 'pediatric';
  patientWeight: number | null;

  // Counts
  shockCount: number;
  currentEnergy: number;
  epinephrineCount: number;
  amiodaroneCount: number;
  lidocaineCount: number;

  // Timestamps
  lastEpinephrineTime: number | null;
  lastAmiodaroneTime: number | null;
  cprCycleStartTime: number | null;
  roscTime: number | null;

  // Tracking
  airwayStatus: 'ambu' | 'sga' | 'ett';
  interventions: Intervention[];
  vitalReadings: VitalReading[];
  hsAndTs: HsAndTsState;

  // Post-ROSC
  postROSCChecklist: PostROSCChecklist;
  postROSCVitals: PostROSCVitals;

  // Pregnancy (adult only)
  pregnancyActive: boolean;
  pregnancyCauses: PregnancyCauses;
  pregnancyInterventions: PregnancyInterventions;
  pregnancyStartTime: number | null;

  // Brady/Tachy transition
  bradyTachyStartTime: number | null;
}

interface Intervention {
  id: string;
  timestamp: number;
  type: InterventionType;
  details: string;
  value?: number | string;
}
```

---

## Clinical Accuracy Requirements

All clinical logic must align with **2025 AHA Guidelines**:

### Medication Timing
- Epinephrine: Every 3-5 minutes (recommend 4 min)
- Rhythm check: Every 2 minutes
- Amiodarone: After 3rd shock for refractory VF/pVT

### Energy Levels
- Adult: Manufacturer recommendation or 200J default
- Pediatric: Weight-based escalation

### CPR Quality Metrics
- Target compression rate: 100-120/min
- Minimize interruptions
- Track CPR fraction (goal >60%)

### Post-ROSC Targets
- Avoid hyperoxia (SpO₂ 90-98%)
- Normocapnia (PaCO₂ 35-45 mmHg)
- MAP ≥65 mmHg
- Temperature management (32-37.5°C)
- Glucose control (70-180 mg/dL)

---

## References

- 2025 AHA Advanced Cardiovascular Life Support Guidelines
- 2025 AHA Pediatric Advanced Life Support Guidelines
- AHA Cardiac Arrest Algorithm (Adult & Pediatric)
- AHA Bradycardia & Tachycardia with Pulse Algorithms
- AHA Post-Cardiac Arrest Care Algorithm
- Maternal Cardiac Arrest in Pregnancy Guidelines
