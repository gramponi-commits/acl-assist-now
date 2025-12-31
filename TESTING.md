# Testing Guide for ResusBuddy

## Overview

ResusBuddy uses **Vitest** as the test runner with **React Testing Library** for component testing. This guide covers how to write, run, and maintain tests for this medical application.

---

## 🎯 Test Philosophy

**Medical software requires rigorous testing.** Our testing strategy focuses on:

1. **Correctness**: All medical calculations must match AHA 2025 guidelines exactly
2. **Safety**: Edge cases (null weights, invalid inputs) must be handled gracefully
3. **Reliability**: State management and timers must work correctly under all conditions
4. **Maintainability**: Tests should be clear, well-documented, and easy to update

---

## 🚀 Running Tests

### Quick Start

```bash
# Run tests in watch mode (for development)
npm test

# Run tests once (for CI/CD)
npm run test:run

# Run tests with UI (interactive browser interface)
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Watch Mode

Vitest runs in watch mode by default during development:

```bash
npm test
```

- Automatically re-runs tests when files change
- Press `a` to run all tests
- Press `f` to run only failed tests
- Press `t` to filter by test name pattern
- Press `p` to filter by filename pattern
- Press `q` to quit

### Coverage Reports

Generate test coverage reports:

```bash
npm run test:coverage
```

Coverage reports are generated in:
- `coverage/index.html` - Interactive HTML report (open in browser)
- `coverage/coverage-final.json` - JSON summary
- Console output - Text summary

**Coverage Thresholds:**
- Lines: 80%
- Functions: 80%
- Branches: 75%
- Statements: 80%

---

## 📁 Test File Structure

```
src/
├── lib/
│   ├── aclsDosing.ts
│   ├── aclsDosing.test.ts          ✅ 19 tests
│   ├── palsDosing.ts
│   ├── palsDosing.test.ts          ✅ 48 tests
│   └── ...
├── hooks/
│   ├── useSettings.ts
│   ├── useSettings.test.ts         ✅ 24 tests
│   ├── useACLSLogic.ts
│   └── useACLSLogic.test.ts        ⏳ TODO
├── components/
│   └── ...
└── test/
    ├── setup.ts                     Test environment setup
    └── test-utils.tsx               Custom render function & helpers
```

**Naming Convention:** Place test files next to source files with `.test.ts` or `.test.tsx` extension.

---

## ✅ Current Test Coverage

### Dosing Calculations (67 tests)

#### ACLS Adult Dosing (19 tests)
- ✅ Epinephrine: 1mg fixed dose
- ✅ Amiodarone: 300mg → 150mg
- ✅ Lidocaine: 100mg → 50mg maintenance
- ✅ Shock energy: Configurable (120/150/200/360J)
- ✅ AHA 2025 guideline compliance

#### PALS Pediatric Dosing (48 tests)
- ✅ Epinephrine: 0.01 mg/kg (max 1mg)
- ✅ Amiodarone: 5 mg/kg (max 300mg → 150mg)
- ✅ Lidocaine: 1 mg/kg
- ✅ Shock energy: 2 J/kg → 4 J/kg → 4-10 J/kg
- ✅ Null/zero weight handling
- ✅ Weight capping and safety limits
- ✅ AHA 2025 PALS guideline compliance

### Settings Management (24 tests)
- ✅ Initialization with defaults
- ✅ localStorage persistence
- ✅ Individual setting updates
- ✅ Settings reset
- ✅ Audio/alert preferences
- ✅ Metronome configuration
- ✅ Defibrillator energy settings
- ✅ Theme management
- ✅ Error handling

**Total: 91 tests passing** ✅

---

## 🧪 Writing Tests

### Basic Test Structure

```typescript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  describe('Specific Function', () => {
    it('should do something specific', () => {
      // Arrange: Set up test data
      const input = 10;

      // Act: Execute the code under test
      const result = calculateDose(input);

      // Assert: Verify the result
      expect(result.value).toBe(0.10);
      expect(result.display).toBe('0.10 mg');
    });
  });
});
```

### Testing React Hooks

Use `renderHook` from React Testing Library:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useSettings } from './useSettings';

it('should update settings', () => {
  const { result } = renderHook(() => useSettings());

  // Use act() to wrap state updates
  act(() => {
    result.current.updateSetting('soundEnabled', false);
  });

  expect(result.current.settings.soundEnabled).toBe(false);
});
```

### Testing React Components

Use custom `render` from test-utils:

```typescript
import { render, screen, fireEvent } from '@/test/test-utils';
import { MyComponent } from './MyComponent';

it('should render button and handle click', () => {
  const handleClick = vi.fn();

  render(<MyComponent onClick={handleClick} />);

  const button = screen.getByRole('button', { name: /click me/i });
  fireEvent.click(button);

  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Testing Async Code

```typescript
import { waitFor } from '@testing-library/react';

it('should load data asynchronously', async () => {
  const { result } = renderHook(() => useDataFetcher());

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  expect(result.current.data).toBeDefined();
});
```

### Mocking Functions

```typescript
import { vi } from 'vitest';

it('should call callback when condition met', () => {
  const mockCallback = vi.fn();

  performAction(mockCallback);

  expect(mockCallback).toHaveBeenCalledWith('expected', 'arguments');
  expect(mockCallback).toHaveBeenCalledTimes(1);
});
```

### Testing Timers

```typescript
import { vi } from 'vitest';

it('should trigger after timeout', () => {
  vi.useFakeTimers();
  const callback = vi.fn();

  setTimeout(callback, 1000);

  vi.advanceTimersByTime(1000);

  expect(callback).toHaveBeenCalledTimes(1);

  vi.useRealTimers();
});
```

---

## 🎨 Test Utilities

### Custom Render Function

Located in `src/test/test-utils.tsx`:

```typescript
import { render } from '@/test/test-utils';

// Automatically wraps components with:
// - I18nextProvider (translations)
// - BrowserRouter (routing)
// - Other common providers
```

### Helper Functions

```typescript
// Create mock ACLS session
const mockSession = createMockACLSSession({
  pathwayMode: 'pediatric',
  patientWeight: 20,
});

// Create mock settings
const mockSettings = createMockSettings({
  soundEnabled: false,
  theme: 'light',
});

// Wait for condition
await waitForCondition(() => session.phase === 'shockable_pathway');

// Advance timers and flush promises
await advanceTimersByTime(2000);
```

---

## 📋 Testing Checklist

When writing tests for medical logic:

- [ ] **Test the happy path**: Normal, expected inputs
- [ ] **Test edge cases**: Null, zero, negative, very large values
- [ ] **Test boundaries**: Min/max values, thresholds
- [ ] **Test guidelines**: Verify calculations match AHA guidelines
- [ ] **Test error handling**: Invalid inputs, localStorage failures
- [ ] **Test state transitions**: Phase changes, timer logic
- [ ] **Test persistence**: localStorage read/write
- [ ] **Add descriptive test names**: Clearly describe what's being tested
- [ ] **Document medical references**: Link to AHA guidelines in comments

---

## 🏥 Medical Testing Standards

### Dosing Calculation Tests Must:

1. **Reference AHA Guidelines**: Include comments linking to specific guideline sections
2. **Test Weight Ranges**:
   - Pediatric: 3kg (newborn) to 50kg (adolescent)
   - Adult equivalent caps (100kg+)
   - Null/zero/negative weights
3. **Verify Safety Caps**: Maximum doses must never be exceeded
4. **Test All Dose Steps**: First dose, second dose, subsequent doses
5. **Validate Display Formatting**: Ensure doses are displayed clearly with units

Example:

```typescript
describe('AHA 2025 PALS Guideline Compliance', () => {
  it('should match epinephrine dosing: 0.01 mg/kg (max 1mg)', () => {
    // Reference: AHA 2025 PALS Cardiac Arrest Algorithm
    // Epinephrine: 0.01 mg/kg IV/IO (max 1mg)

    const dose10kg = calculateEpinephrineDose(10);
    const dose100kg = calculateEpinephrineDose(100);

    expect(dose10kg.value).toBe(0.10);
    expect(dose100kg.value).toBe(1.0); // Capped at max
  });
});
```

---

## 🐛 Debugging Tests

### Running Specific Tests

```bash
# Run tests in specific file
npm test -- aclsDosing.test.ts

# Run tests matching pattern
npm test -- --grep "epinephrine"

# Run single test by name
npm test -- -t "should calculate correct dose"
```

### Console Logging

```typescript
it('should do something', () => {
  const result = calculateDose(10);

  // Add debug output
  console.log('Result:', result);

  expect(result.value).toBe(0.10);
});
```

### Using Test UI

```bash
npm run test:ui
```

Opens interactive browser UI with:
- Test tree visualization
- Code coverage highlighting
- Re-run failed tests
- Filter and search

---

## 🚨 Common Testing Mistakes

### ❌ Don't: Test implementation details

```typescript
// BAD: Testing internal state
expect(component.state.counter).toBe(5);
```

### ✅ Do: Test behavior

```typescript
// GOOD: Testing user-visible behavior
expect(screen.getByText('Count: 5')).toBeInTheDocument();
```

### ❌ Don't: Forget to cleanup

```typescript
// BAD: Timers leak between tests
it('test 1', () => {
  vi.useFakeTimers();
  // ... test code
  // Missing vi.useRealTimers()!
});
```

### ✅ Do: Clean up properly

```typescript
// GOOD: Cleanup happens automatically in setup.ts
// But you can also do it explicitly:
afterEach(() => {
  vi.useRealTimers();
  cleanup();
});
```

### ❌ Don't: Make tests dependent on each other

```typescript
// BAD: Tests share state
let counter = 0;

it('test 1', () => {
  counter++;
  expect(counter).toBe(1);
});

it('test 2', () => {
  counter++;
  expect(counter).toBe(2); // Fails if test 1 doesn't run first!
});
```

### ✅ Do: Make tests independent

```typescript
// GOOD: Each test sets up its own state
it('test 1', () => {
  const counter = 0;
  expect(counter + 1).toBe(1);
});

it('test 2', () => {
  const counter = 0;
  expect(counter + 1).toBe(1);
});
```

---

## 📊 Continuous Integration

Tests run automatically on:
- Pull request creation
- Commits to main branch
- Before deployment

**CI Requirements:**
- All tests must pass
- Coverage thresholds must be met
- No failing tests allowed in main branch

---

## 🎯 Testing Roadmap

### Phase 1: Foundation ✅ (COMPLETE)
- [x] Test infrastructure setup
- [x] ACLS dosing tests (19 tests)
- [x] PALS dosing tests (48 tests)
- [x] useSettings hook tests (24 tests)

### Phase 2: Core Logic (NEXT)
- [ ] useACLSLogic hook tests
- [ ] useBradyTachyLogic hook tests
- [ ] Timer logic tests
- [ ] Phase transition tests

### Phase 3: Components
- [ ] CodeScreen component tests
- [ ] RhythmCheckModal tests
- [ ] ActionButtons tests
- [ ] TimerDisplay tests

### Phase 4: Integration
- [ ] Full ACLS workflow test
- [ ] Full PALS workflow test
- [ ] Brady/Tachy workflow test
- [ ] Session persistence tests

### Phase 5: E2E (Future)
- [ ] Playwright E2E tests
- [ ] Critical path testing
- [ ] Offline mode testing

---

## 📚 Resources

### Documentation
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [jest-dom Matchers](https://github.com/testing-library/jest-dom)

### AHA Guidelines
- AHA 2025 ACLS Guidelines
- AHA 2025 PALS Guidelines
- AHA 2025 Cardiac Arrest Algorithm

### Internal Resources
- `CODE_ANALYSIS_AND_IMPROVEMENTS.md` - Code analysis and improvement plan
- `architecture.md` - Application architecture (if exists)
- `src/test/test-utils.tsx` - Custom testing utilities

---

## 💡 Best Practices

1. **Write tests first** (TDD) for new features
2. **Keep tests simple** - One assertion per test when possible
3. **Use descriptive names** - Test names should explain what's being tested
4. **Test edge cases** - Null, zero, negative, max values
5. **Mock external dependencies** - localStorage, timers, API calls
6. **Cleanup after tests** - Prevent test pollution
7. **Run tests often** - Catch regressions early
8. **Maintain high coverage** - Especially for medical logic
9. **Review test failures** - Don't ignore flaky tests
10. **Document medical logic** - Reference AHA guidelines in comments

---

## 🆘 Getting Help

- Check existing tests for examples
- Review test-utils.tsx for helper functions
- Check Vitest/React Testing Library docs
- Ask the team in #engineering channel

---

**Remember: In medical software, testing isn't optional—it's essential.** Every line of untested code is a potential risk to patient safety.
