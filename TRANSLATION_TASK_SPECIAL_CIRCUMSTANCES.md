# Translation Task: Special Circumstances Diagnostic and Management Text

## Overview
You need to translate the diagnostic evaluation and management text for 7 special circumstances (anaphylaxis, asthma, hyperthermia, opioid overdose, drowning, electrocution, LVAD failure) into 24 languages.

## Target Languages
Translate into ALL languages EXCEPT:
- ❌ English (already done - use as reference)
- ❌ Hindi (hi.json)
- ❌ Bengali (bn.json)  
- ❌ Hebrew (he.json)

**Languages to translate (24 total):**
Arabic (ar), Danish (da), German (de), Greek (el), Spanish (es), Persian (fa), French (fr), Indonesian (id), Italian (it), Japanese (ja), Korean (ko), Dutch (nl), Norwegian (no), Polish (pl), Portuguese (pt), Russian (ru), Swedish (sv), Thai (th), Tagalog (tl), Turkish (tr), Ukrainian (uk), Vietnamese (vi), Chinese Simplified (zh-CN)

## File Locations
All translation files are in: `src/i18n/locales/`

Example: `src/i18n/locales/ar.json`, `src/i18n/locales/de.json`, etc.

## Keys to Translate

There are **two types of keys** to translate:

### A. Intervention Timeline Keys (in `interventions` section)

These appear in the timeline when a special circumstance is activated. All files now have placeholders marked with `[TRANSLATE]`.

```json
"interventions": {
  // ... other keys ...
  "anaphylaxisActivated": "Anaphylaxis protocol activated",
  "asthmaActivated": "Asthma / Severe Bronchospasm protocol activated",
  "hyperthermiaActivated": "Hyperthermia / Heat Stroke protocol activated",
  "opioidOverdoseActivated": "Opioid Overdose protocol activated",
  "drowningActivated": "Drowning protocol activated",
  "electrocutionActivated": "Electrocution protocol activated",
  "lvadFailureActivated": "LVAD Failure protocol activated"
}
```

### B. Diagnostic & Management Text (in `specialCircumstances` section)

For each language file, find the `"specialCircumstances"` section and translate these keys for each condition:

### 1. Anaphylaxis
```json
"anaphylaxis": {
  "diagnostic": "Rapid onset of airway/breathing/circulation compromise with typical triggers (medications, foods, stings). Consider mast-cell tryptase if available.",
  "management": "Remove trigger if possible, give epinephrine IM (0.01 mg/kg up to 0.5 mg, repeat q5-15 min PRN), aggressive IV fluids, and consider glucagon if refractory (especially if on beta-blockers). ECPR may be considered for refractory anaphylactic arrest."
}
```

### 2. Asthma
```json
"asthma": {
  "diagnostic": "History of asthma/reactive airway disease with severe bronchospasm or status asthmaticus. High suspicion for tension pneumothorax in ventilated patients with sudden deterioration.",
  "management": "Low tidal volume ventilation (6-8 mL/kg) with low rate to allow full exhalation and minimize auto-PEEP. Continue aggressive bronchodilators. Immediately decompress if tension pneumothorax suspected. Consider ECLS for refractory arrest."
}
```

### 3. Hyperthermia
```json
"hyperthermia": {
  "diagnostic": "Measure core temperature (rectal, esophageal, or bladder probe). Elevated core temp >40°C with altered mental status and history of heat exposure.",
  "management": "Rapid cooling is critical - ice water immersion if available (fastest method) or tepid water spray with fans for evaporative cooling. Monitor core temp every 5-10 minutes and stop cooling at 38-39°C to prevent overshoot."
}
```

### 4. Opioid Overdose
```json
"opioidOverdose": {
  "diagnostic": "History of opioid use/exposure, pinpoint pupils, respiratory depression. Collateral history and scene findings (pill bottles, paraphernalia).",
  "management": "Prioritize airway management and ventilation. Give naloxone 0.4-2 mg IV/IM/IN (higher doses for fentanyl/carfentanil analogs). May need repeated doses or infusion. Monitor closely post-ROSC as naloxone duration may be shorter than opioid."
}
```

### 5. Drowning
```json
"drowning": {
  "diagnostic": "History of submersion. Assess for signs of trauma if diving or water sports involved.",
  "management": "Prioritize early rescue breaths (begin before removal from water if possible). Provide 100% oxygen and advanced airway. Follow standard ACLS/PALS with emphasis on oxygenation. Consider C-spine precautions if trauma suspected."
}
```

### 6. Electrocution
```json
"electrocution": {
  "diagnostic": "Verify power source is disconnected and scene is safe. Electrical injuries commonly present with VF/pVT.",
  "management": "Defibrillate immediately if VF/pVT present. Follow standard ACLS/PALS protocols. Consider prolonged resuscitation efforts as electrical injuries may have favorable outcomes with extended CPR."
}
```

### 7. LVAD Failure
```json
"lvadFailure": {
  "diagnostic": "Auscultate over LVAD site for hum (absence indicates failure). Check controller for alarms/error codes. Inspect driveline and power connections. Use Doppler for BP assessment.",
  "management": "Do NOT delay chest compressions - CPR is safe and necessary. Troubleshoot power source (swap batteries if needed), check driveline for damage/disconnection, and review controller. Contact LVAD team immediately."
}
```

## Important Notes

1. **Medical Terminology**: Use clinically accurate medical terminology appropriate for healthcare professionals in each language. Terms like "VF/pVT", "ECPR", "ECLS", "LVAD", "ROSC" are often kept as abbreviations or transliterated.

2. **Numbers & Units**: Keep numerical values and units (e.g., "0.01 mg/kg", "6-8 mL/kg", "40°C", "38-39°C") exactly as shown.

3. **Dosing Information**: Medication doses must be translated accurately - double-check pharmacological terms.

4. **Consistency**: Match the tone and style of existing translations in each language file.

5. **JSON Format**: Maintain proper JSON formatting - escape quotes if needed, no trailing commas.

6. **Structure**: Each condition should have exactly 2 keys: `"diagnostic"` and `"management"`

## Verification Checklist

After translating each language:
- ✅ All 7 intervention timeline keys translated (in `interventions` section)
- ✅ All 7 conditions translated (anaphylaxis, asthma, hyperthermia, opioidOverdose, drowning, electrocution, lvadFailure)
- ✅ Each condition has both "diagnostic" and "management" keys
- ✅ Medical terminology is clinically accurate
- ✅ Numerical values unchanged
- ✅ JSON syntax is valid (check with linter if available)
- ✅ File encoding is UTF-8
- ✅ Removed all `[TRANSLATE]` placeholders

## Example Structure

Here's how it should look in the JSON file:

```json
{
  "specialCircumstances": {
    "title": "[Already translated]",
    "tapToReview": "[Already translated]",
    "activeCount": "[Already translated]",
    "diagnosticEval": "[Already translated]",
    "management": "[Already translated]",
    "anaphylaxis": {
      "title": "[Already translated]",
      "desc": "[Already translated]",
      "diagnostic": "[YOUR TRANSLATION HERE]",
      "management": "[YOUR TRANSLATION HERE]"
    },
    "asthma": {
      "title": "[Already translated]",
      "desc": "[Already translated]",
      "diagnostic": "[YOUR TRANSLATION HERE]",
      "management": "[YOUR TRANSLATION HERE]"
    },
    // ... continue for all 7 conditions
  }
}
```

## Priority Order

Recommend translating in this order:
1. Spanish (es) - widely used
2. French (fr) - widely used
3. German (de) - widely used
4. Portuguese (pt) - widely used
5. Italian (it)
6. Russian (ru)
7. Arabic (ar)
8. Chinese (zh-CN)
9. Japanese (ja)
10. Korean (ko)
11. Remaining languages alphabetically

## Testing

After completing translations, verify by:
1. Running `npm run lint` to check for syntax errors
2. Loading the app and switching languages to ensure text displays correctly
3. Checking that text fits in UI without overflow issues

---

**Total Work**: 
- 7 intervention timeline keys × 24 languages = **168 short strings**
- 7 conditions × 2 keys each × 24 languages = **336 clinical text strings**
- **TOTAL: 504 strings to translate**

## Current Status

All translation files have been updated with placeholder keys marked `[TRANSLATE]` in non-English files. You need to:
1. Replace the `[TRANSLATE]` prefix with actual translations for intervention keys
2. Add the `diagnostic` and `management` translations for each special circumstance
