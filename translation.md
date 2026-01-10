# Translation Implementation Plan

## Overview

This document outlines the sequential implementation plan for adding 21 new languages to ResusBuddy, with translations bundled in the app for full offline support.

**Scope:** Full translation (UI + clinical terminology)

---

## Target Languages

| # | Language | Code | Script | RTL | Approx. Size |
|---|----------|------|--------|-----|--------------|
| 1 | Mandarin Chinese (Simplified) | zh-CN | CJK | No | ~55 KB |
| 2 | Hindi | hi | Devanagari | No | ~70 KB |
| 3 | Standard Arabic | ar | Arabic | **Yes** | ~65 KB |
| 4 | Bengali | bn | Bengali | No | ~70 KB |
| 5 | Portuguese | pt | Latin | No | ~50 KB |
| 6 | Russian | ru | Cyrillic | No | ~65 KB |
| 7 | Indonesian | id | Latin | No | ~48 KB |
| 8 | Ukrainian | uk | Cyrillic | No | ~65 KB |
| 9 | Dutch | nl | Latin | No | ~50 KB |
| 10 | Danish | da | Latin | No | ~48 KB |
| 11 | Swedish | sv | Latin | No | ~48 KB |
| 12 | Norwegian | no | Latin | No | ~48 KB |
| 13 | Polish | pl | Latin | No | ~52 KB |
| 14 | Japanese | ja | CJK | No | ~58 KB |
| 15 | Korean | ko | Hangul | No | ~55 KB |
| 16 | Turkish | tr | Latin | No | ~50 KB |
| 17 | Vietnamese | vi | Latin | No | ~52 KB |
| 18 | Thai | th | Thai | No | ~68 KB |
| 19 | Filipino/Tagalog | tl | Latin | No | ~48 KB |
| 20 | Persian/Farsi | fa | Arabic | **Yes** | ~65 KB |
| 21 | Hebrew | he | Hebrew | **Yes** | ~55 KB |

---

## Estimated Storage Impact

### Current State
- **6 existing languages:** EN, IT, ES, FR, DE, EL
- **Current total size:** ~330 KB (uncompressed JSON)
- **Gzipped in bundle:** ~45 KB

### After Adding 21 Languages
| Metric | Uncompressed | Gzipped (in bundle) |
|--------|--------------|---------------------|
| New translations (21) | ~1.18 MB | ~165 KB |
| Total all languages (27) | ~1.51 MB | ~210 KB |
| **Net increase** | **~1.18 MB** | **~165 KB** |

### Final Device Impact
**Bundled in app: ~1.2 MB uncompressed / ~0.17 MB gzipped**

The actual impact on device storage is minimal:
- PWA bundle with all 27 languages: **~210 KB** additional (gzipped)
- Native apps (Android/iOS): **~1.2 MB** additional per platform

---

## Sequential Implementation Plan

### Phase 1: Infrastructure (Pre-requisite) ✅ COMPLETED

#### Step 1.1: Add RTL Support ✅
Arabic, Persian, and Hebrew require right-to-left (RTL) layout support.

**Files modified:**
- `src/i18n/index.ts` - Added RTL detection with `isRTL()` export
- `src/App.tsx` - Applied `dir="rtl"` conditionally to main layout

**Implementation (completed):**
```typescript
// src/i18n/index.ts
const RTL_LANGUAGES = ['ar', 'fa', 'he'];

export const isRTL = (lang: string): boolean => RTL_LANGUAGES.includes(lang);
```

```tsx
// App.tsx - added to main container
<div {...swipeHandlers} className="..." dir={isRTL(i18n.language) ? 'rtl' : 'ltr'}>
```

#### Step 1.2: Update SUPPORTED_LANGUAGES ✅
**File:** `src/i18n/index.ts`

```typescript
const SUPPORTED_LANGUAGES = [
  'en', 'it', 'es', 'fr', 'de', 'el',  // existing
  'zh-CN', 'hi', 'ar', 'bn', 'pt', 'ru', 'id', 'uk',
  'nl', 'da', 'sv', 'no', 'pl', 'ja', 'ko',
  'tr', 'vi', 'th', 'tl', 'fa', 'he'  // additional
];
```

---

### Phase 2: Latin Script Languages (Lowest Risk)

These languages use Latin script and have straightforward text rendering.

#### Step 2.1: Portuguese (pt)
1. Create `src/i18n/locales/pt.json`
2. Import and register in `src/i18n/index.ts`
3. Add "Português" to language selector in settings
4. Test all screens including clinical terminology

#### Step 2.2: Indonesian (id)
1. Create `src/i18n/locales/id.json`
2. Import and register in `src/i18n/index.ts`
3. Add "Bahasa Indonesia" to language selector
4. Test all screens

#### Step 2.3: Dutch (nl)
1. Create `src/i18n/locales/nl.json`
2. Import and register
3. Add "Nederlands" to selector
4. Test all screens

#### Step 2.4: Danish (da)
1. Create `src/i18n/locales/da.json`
2. Import and register
3. Add "Dansk" to selector
4. Test all screens

#### Step 2.5: Swedish (sv)
1. Create `src/i18n/locales/sv.json`
2. Import and register
3. Add "Svenska" to selector
4. Test all screens

#### Step 2.6: Norwegian (no)
1. Create `src/i18n/locales/no.json`
2. Import and register
3. Add "Norsk" to selector
4. Test all screens

#### Step 2.7: Polish (pl)
1. Create `src/i18n/locales/pl.json`
2. Import and register
3. Add "Polski" to selector
4. Test all screens

#### Step 2.8: Turkish (tr)
1. Create `src/i18n/locales/tr.json`
2. Import and register
3. Add "Türkçe" to selector
4. Test all screens

#### Step 2.9: Vietnamese (vi)
1. Create `src/i18n/locales/vi.json`
2. Import and register
3. Add "Tiếng Việt" to selector
4. Test all screens
5. Verify diacritics render correctly

#### Step 2.10: Filipino/Tagalog (tl)
1. Create `src/i18n/locales/tl.json`
2. Import and register
3. Add "Filipino" to selector
4. Test all screens

---

### Phase 3: Cyrillic Script Languages

#### Step 3.1: Russian (ru)
1. Create `src/i18n/locales/ru.json`
2. Import and register
3. Add "Русский" to selector
4. Test all screens - verify Cyrillic renders correctly
5. Check button text doesn't overflow (Cyrillic tends to be longer)

#### Step 3.2: Ukrainian (uk)
1. Create `src/i18n/locales/uk.json`
2. Import and register
3. Add "Українська" to selector
4. Test all screens

---

### Phase 4: CJK Languages

CJK (Chinese, Japanese, Korean) require careful handling for character rendering.

#### Step 4.1: Mandarin Chinese Simplified (zh-CN)
1. Create `src/i18n/locales/zh-CN.json`
2. Import and register (use kebab-case code `zh-CN`)
3. Add "简体中文" to selector
4. Test all screens - verify Chinese characters render
5. Check layout doesn't break (CJK text has no word breaks)

#### Step 4.2: Japanese (ja)
1. Create `src/i18n/locales/ja.json`
2. Import and register
3. Add "日本語" to selector
4. Test all screens
5. Verify mixed kanji/hiragana/katakana renders correctly

#### Step 4.3: Korean (ko)
1. Create `src/i18n/locales/ko.json`
2. Import and register
3. Add "한국어" to selector
4. Test all screens

---

### Phase 5: Indic Scripts

These languages use complex scripts requiring proper font support.

#### Step 5.1: Hindi (hi)
1. Create `src/i18n/locales/hi.json`
2. Import and register
3. Add "हिन्दी" to selector
4. Test Devanagari rendering across all screens
5. Ensure proper conjunct character display

#### Step 5.2: Bengali (bn)
1. Create `src/i18n/locales/bn.json`
2. Import and register
3. Add "বাংলা" to selector
4. Test Bengali script rendering
5. Verify complex ligatures display correctly

#### Step 5.3: Thai (th)
1. Create `src/i18n/locales/th.json`
2. Import and register
3. Add "ไทย" to selector
4. Test Thai script rendering
5. Verify complex tone marks and vowel positioning

---

### Phase 6: RTL Languages (Arabic, Persian, Hebrew)

This requires the most careful implementation due to RTL layout.

#### Step 6.1: Arabic (ar)
1. Create `src/i18n/locales/ar.json`
2. Import and register
3. Add "العربية" to selector
4. **Extensive RTL testing required:**
   - Timer displays (numbers should remain LTR)
   - Button layouts
   - Timeline/intervention list
   - Modal dialogs
   - Navigation
   - CPR guidance screens
5. Test Arabic ligatures and contextual forms

#### Step 6.2: Persian/Farsi (fa)
1. Create `src/i18n/locales/fa.json`
2. Import and register
3. Add "فارسی" to selector
4. RTL testing (reuse Arabic RTL infrastructure)
5. Test Persian-specific characters (پ چ ژ گ)

#### Step 6.3: Hebrew (he)
1. Create `src/i18n/locales/he.json`
2. Import and register
3. Add "עברית" to selector
4. RTL testing (reuse Arabic RTL infrastructure)
5. Test Hebrew characters and nikud (vowel marks)

---

### Phase 7: Automated Validation

Each new translation file must pass automated validation before being merged.

#### Step 7.1: Back-Translation Verification

For each new language file, run back-translation to English and compare against original.

**Process:**
1. Take translated JSON (e.g., `ru.json`)
2. Send each string value to translation API (DeepL or Google Translate)
3. Translate back to English
4. Compare against original `en.json` value
5. Flag strings where meaning differs significantly

**Script:** `scripts/validate-translations.ts`

```typescript
import en from '../src/i18n/locales/en.json';
import newLang from '../src/i18n/locales/[LANG].json';

// For each key, compare:
// 1. Original English
// 2. Back-translated English (from new language)
// Flag if semantic difference detected

async function validateBackTranslation(langCode: string) {
  const errors: string[] = [];

  for (const [key, original] of Object.entries(flattenJson(en))) {
    const translated = getNestedValue(newLang, key);
    if (!translated) {
      errors.push(`MISSING: ${key}`);
      continue;
    }

    // Use any LLM API to back-translate and compare meaning
    // Examples: OpenAI, Anthropic, Google Gemini, local Ollama, etc.
    const result = await llmCompare({
      prompt: `Translate this ${langCode} text to English, then compare to the original.

Original English: "${original}"
Translated (${langCode}): "${translated}"

Reply with:
- MATCH: if meaning is preserved
- MISMATCH: [explanation] if meaning differs
- CRITICAL: [explanation] if it's a medical/safety term with wrong meaning`
    });

    if (!result.startsWith('MATCH')) {
      errors.push(`${key}: ${result}`);
    }
  }

  return errors;
}

// Configure your preferred LLM provider
async function llmCompare({ prompt }: { prompt: string }): Promise<string> {
  // Option 1: OpenAI
  // const response = await openai.chat.completions.create({ ... });

  // Option 2: Anthropic
  // const response = await anthropic.messages.create({ ... });

  // Option 3: Google Gemini
  // const response = await gemini.generateContent({ ... });

  // Option 4: Local Ollama
  // const response = await fetch('http://localhost:11434/api/generate', { ... });

  throw new Error('Configure LLM provider in llmCompare()');
}
```

**Validation thresholds:**
- 0 CRITICAL errors allowed
- < 5 MISMATCH errors allowed (review manually)
- All `{{placeholders}}` must be preserved exactly

#### Step 7.2: Cross-Language Consistency Check

Compare terminology across multiple languages to catch outliers.

**Process:**
1. Select critical medical terms from `en.json`:
   - `actions.epinephrine`, `actions.amiodarone`, `actions.shock`
   - `rhythm.vfPvt`, `rhythm.asystole`, `rhythm.pea`
   - `postRosc.roscAchieved`, `banner.startCPR`
2. For each term, collect translations from: ES, FR, and the new language
3. Back-translate all to English
4. Flag if new language differs significantly from ES/FR consensus

**Script:** `scripts/cross-validate-terminology.ts`

```typescript
const CRITICAL_KEYS = [
  'actions.shock',
  'actions.epinephrine',
  'actions.amiodarone',
  'rhythm.vfPvt',
  'rhythm.asystole',
  'rhythm.pea',
  'postRosc.roscAchieved',
  'banner.startCPR',
  'rhythmCheckModal.title'
];

async function crossValidate(newLangCode: string) {
  const referenceLangs = ['es', 'fr'];
  const issues: string[] = [];

  for (const key of CRITICAL_KEYS) {
    const enOriginal = getNestedValue(en, key);
    const newTranslation = getNestedValue(newLang, key);

    // Get reference translations
    const refTranslations = referenceLangs.map(lang => ({
      lang,
      value: getNestedValue(loadLang(lang), key)
    }));

    // Use any LLM API to compare consistency
    const result = await llmCompare({
      prompt: `Compare these medical term translations for consistency.

English original: "${enOriginal}"
Spanish: "${refTranslations[0].value}"
French: "${refTranslations[1].value}"
${newLangCode.toUpperCase()}: "${newTranslation}"

Is the ${newLangCode} translation consistent with Spanish and French?
Reply: CONSISTENT or INCONSISTENT: [reason]`
    });

    if (result.startsWith('INCONSISTENT')) {
      issues.push(`${key}: ${result}`);
    }
  }

  return issues;
}
```

#### Step 7.3: Structural Validation

Run on every translation file to catch technical errors.

**Checks:**
- All keys from `en.json` exist in new file
- No extra keys that don't exist in `en.json`
- All `{{placeholder}}` variables preserved exactly
- JSON is valid and properly formatted
- No empty string values

**Script:** `scripts/lint-translations.ts`

```typescript
function lintTranslationFile(langCode: string) {
  const enKeys = getAllKeys(en);
  const langKeys = getAllKeys(loadLang(langCode));
  const errors: string[] = [];

  // Check missing keys
  for (const key of enKeys) {
    if (!langKeys.includes(key)) {
      errors.push(`MISSING KEY: ${key}`);
    }
  }

  // Check extra keys
  for (const key of langKeys) {
    if (!enKeys.includes(key)) {
      errors.push(`EXTRA KEY: ${key}`);
    }
  }

  // Check placeholders
  for (const key of enKeys) {
    const enValue = getNestedValue(en, key);
    const langValue = getNestedValue(loadLang(langCode), key);

    const enPlaceholders = enValue.match(/\{\{[\w]+\}\}/g) || [];
    const langPlaceholders = langValue.match(/\{\{[\w]+\}\}/g) || [];

    if (JSON.stringify(enPlaceholders.sort()) !== JSON.stringify(langPlaceholders.sort())) {
      errors.push(`PLACEHOLDER MISMATCH: ${key}`);
    }
  }

  return errors;
}
```

#### Step 7.4: Validation Pipeline

Run all validations in sequence for each new language:

```bash
# Run for a specific language
npm run validate:translation -- --lang=ru

# Run for all new languages
npm run validate:translations
```

**package.json scripts:**
```json
{
  "scripts": {
    "validate:translation": "tsx scripts/validate-translation.ts",
    "validate:translations": "tsx scripts/validate-all-translations.ts"
  }
}
```

**Validation output example:**
```
Validating: Russian (ru)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Structural validation: PASSED (0 errors)
✓ Placeholder check: PASSED (0 errors)
✓ Back-translation: PASSED (2 warnings)
  ⚠ postRosc.airwaySecured: Minor wording difference
  ⚠ settings.audioDesc: Simplified phrasing
✓ Cross-language consistency: PASSED (0 issues)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESULT: APPROVED (0 critical, 2 warnings)
```

---

### Phase 8: Final Testing

#### Step 8.1: Functional Testing
- Switch between all 27 languages
- Verify intervention logs re-translate correctly (uses `translationKey`)
- Test PDF export in each language
- Verify voice announcements work with language

#### Step 8.2: Performance Testing
- Measure initial bundle load time
- Verify PWA caches all translations for offline
- Test on low-end devices

---

## Translation Guidelines

### Clinical Terminology
- Use internationally recognized medical terms where possible
- Keep drug names in their international form (e.g., "Epinephrine" not "Adrenaline" in some regions)
- Maintain AHA terminology for algorithm steps

### Critical Phrases
These must be unambiguous and immediately understandable:
- `banner.startCPR` - "START CPR"
- `actions.shock` - "SHOCK"
- `rhythmCheckModal.title` - "RHYTHM CHECK"
- `postRosc.roscAchieved` - "ROSC ACHIEVED"

### Interpolation
Preserve all `{{variable}}` placeholders exactly:
```json
"shockDelivered": "Shock #{{number}} delivered at {{energy}}"
```

---

## File Structure After Implementation

```
src/i18n/
├── index.ts              # Updated with all 27 languages
├── translations.test.ts  # Add tests for new languages
└── locales/
    ├── en.json           # English (base)
    ├── it.json           # Italian
    ├── es.json           # Spanish
    ├── fr.json           # French
    ├── de.json           # German
    ├── el.json           # Greek
    ├── zh-CN.json        # Chinese Simplified (NEW)
    ├── hi.json           # Hindi (NEW)
    ├── ar.json           # Arabic (NEW)
    ├── bn.json           # Bengali (NEW)
    ├── pt.json           # Portuguese (NEW)
    ├── ru.json           # Russian (NEW)
    ├── id.json           # Indonesian (NEW)
    ├── uk.json           # Ukrainian (NEW)
    ├── nl.json           # Dutch (NEW)
    ├── da.json           # Danish (NEW)
    ├── sv.json           # Swedish (NEW)
    ├── no.json           # Norwegian (NEW)
    ├── pl.json           # Polish (NEW)
    ├── ja.json           # Japanese (NEW)
    ├── ko.json           # Korean (NEW)
    ├── tr.json           # Turkish (NEW)
    ├── vi.json           # Vietnamese (NEW)
    ├── th.json           # Thai (NEW)
    ├── tl.json           # Filipino/Tagalog (NEW)
    ├── fa.json           # Persian/Farsi (NEW)
    └── he.json           # Hebrew (NEW)
```

---

## Summary

| Metric | Value |
|--------|-------|
| Total languages after implementation | 27 |
| Estimated translation file size increase | ~1.2 MB |
| Gzipped bundle size increase | ~165 KB |
| Languages requiring RTL support | 3 (Arabic, Persian, Hebrew) |
| Languages with complex scripts | 5 (Hindi, Bengali, Thai, CJK) |
| Estimated development phases | 8 |

---

## Validation Summary

| Check | Tool | Catches |
|-------|------|---------|
| Structural | `lint-translations.ts` | Missing keys, extra keys, broken JSON |
| Placeholders | `lint-translations.ts` | Missing/extra `{{variables}}` |
| Back-translation | LLM API | Meaning drift, wrong translations |
| Cross-language | LLM API | Terminology inconsistency across languages |
