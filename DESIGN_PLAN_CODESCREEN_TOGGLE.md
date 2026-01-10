# CodeScreen Redesign Plan: Pediatric Toggle + Cardiac Arrest / Brady-Tachy

Status: draft plan only (no implementation yet)

## Goals
- Single pediatric toggle at top (default Adult off). Clear state, large hit area.
- Two primary actions: Cardiac Arrest (color: Adult red / Pediatric light blue) and Brady/Tachy (auto mode, no separate adult/ped page).
- Weight selector surfaces automatically when Pediatric is on, positioned between the toggle and the Cardiac Arrest button, without pushing Cardiac Arrest off-screen.
- Preserve current clinical logic and dosing pathways; reduce initial choice complexity.

## User Flow
1. Land on CodeScreen:
   - Pediatric toggle (default Off/Adult).
   - Helper text: “Controls pediatric dosing and pathways.”
2. If toggle = Off (Adult):
   - Weight selector hidden.
   - Cardiac Arrest button appears in red (adult theme color).
3. If toggle = On (Pediatric):
   - Weight selector appears immediately under the toggle; Cardiac Arrest moves below it.
   - Cardiac Arrest button appears in light blue (peds theme color) to match current PALS visual language.
4. Actions:
   - Tap Cardiac Arrest → launch ACLS/PALS flow with mode set from toggle.
   - Tap Brady/Tachy → launch brady/tachy flow with mode preselected (no adult/ped selection page).
5. Resume active code/history remain unchanged.

## UI/UX Spec
- **Pediatric Toggle**: Wide pill toggle, state text inside (“Pediatric: On/Off”), icon for pedi/weight. Color change + text change for accessibility.
- **Helper Copy**: Short line under toggle: “Toggles pediatric dosing & pathways.”
- **Weight Selector** (only when Pediatric = On):
  - Same component as current weight entry.
  - Position: between toggle and Cardiac Arrest button.
  - Should not shift layout aggressively; Cardiac Arrest sits just below it.
- **Cardiac Arrest Button**:
  - Adult (toggle off): red background (current adult theme color).
  - Pediatric (toggle on): light blue background (current pediatric theme color).
  - Optional sublabel: “ACLS/PALS based on mode.”
- **Brady/Tachy Button**: consistent color (it remains yellow) no adult/ped child page. 

- **Spacing**: Mobile-first; minimum 44px height targets; preserve existing margins.

## State & Data
- New top-level mode state on CodeScreen (adult/pediatric), default adult.
- Persist mode in activeSessionStorage/localStorage (align with existing resume behavior).
- Pass mode into:
  - Cardiac Arrest flow (useACLSLogic initializer or entry action).
  - Brady/Tachy flow (auto-select mode; remove intermediate adult/ped screen).
- Weight handling:
  - When pediatric toggle turns on, prompt/weight selector shows.
  - Keep current weight storage behavior; ensure no regression for adult fixed doses.

## Navigation Changes
- Remove adult/pediatric selection screen inside Brady/Tachy; auto-apply mode from toggle.
- Ensure deep links/resume preserve mode and bypass removed page.

## Theming
- Use existing theme tokens for adult red and pediatric light blue; avoid hard-coded hex if tokens exist.
- Toggle on-state can reuse pediatric accent color; off-state neutral.

## i18n
- New strings likely needed:
  - Pediatric toggle label/states: “Pediatric”, “On/Off”, helper text.
  - Cardiac Arrest sublabel (ACLS/PALS based on mode).
  - Brady/Tachy sublabel (mode auto-set).
- Reuse existing color/context strings where possible.

## Testing Plan
- Unit/logic: mode prop flows into ACLS and Brady/Tachy initial state; weight prompt only when pediatric.
- Manual/E2E:
  - Toggle on → weight selector appears; Cardiac Arrest shows light blue; entering flows uses pediatric dosing.
  - Toggle off → weight selector hidden; Cardiac Arrest red; adult dosing.
  - Brady/Tachy launches directly into pathway with correct mode; no extra mode page.
  - Resume session keeps mode and hides/shows weight selector appropriately.

## Complexity Assessment
- Moderate-low: mostly UI refactor + mode wiring + minor i18n. Core clinical logic unchanged.
- Higher attention: removing Brady/Tachy adult/ped page and ensuring resume/deep state consistency.

## Implementation Steps (do not execute yet)
1. Add CodeScreen mode state (default adult) and persistence.
2. Add Pediatric toggle UI and helper text.
3. Insert conditional weight selector under toggle when mode=pediatric.
4. Restyle Cardiac Arrest button to swap colors based on mode; add sublabel.
5. Brady/Tachy button: adjust subtitle; remove internal adult/ped selection screen; auto-apply mode.
6. Thread mode into useACLSLogic/useBradyTachyLogic initialization/entry.
7. Add i18n keys; update translations minimally (en + placeholders for others).
8. QA: visual checks + build + targeted manual flow tests.

## Testing / Review / Validation
- Preflight checks: `npm run lint`, `npm run build`.
- Unit/logic: add targeted tests to confirm mode propagates to ACLS and Brady/Tachy initializers; pediatric toggle shows weight selector only when on.
- Manual flows: toggle off/on; verify Cardiac Arrest color swap (red vs light blue), weight selector placement, and dosing mode inside both pathways; resume session preserves mode and UI state; Brady/Tachy opens directly in the selected mode.
- Regression: history/resume, PDF/export, and translation presence for new strings; ensure adult defaults when toggle untouched.
- Accessibility: state text changes with toggle (not color-only); touch targets remain ≥44px; focus/keyboard operable on toggle and primary buttons.
