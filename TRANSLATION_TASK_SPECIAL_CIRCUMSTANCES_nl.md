# Vertaaltaak: Diagnostische en beheertext voor bijzondere omstandigheden

## Overzicht
U moet de diagnostische evaluatie- en beheertext voor 7 bijzondere omstandigheden (anafylaxie, astma, hyperthermie, opioidenoverdosering, verdrinking, elektrocutie, LVAD-falen) vertalen naar 24 talen.

## Doeltalen
Vertaal naar ALLE talen BEHALVE:
- ❌ Engels (al gedaan - gebruik als referentie)
- ❌ Hindi (hi.json)
- ❌ Bengaals (bn.json)
- ❌ Hebreeuws (he.json)

**Talen om te vertalen (24 totaal):**
Arabisch (ar), Deens (da), Duits (de), Grieks (el), Spaans (es), Perzisch (fa), Frans (fr), Indonesisch (id), Italiaans (it), Japans (ja), Koreaans (ko), Nederlands (nl), Noors (no), Pools (pl), Portugees (pt), Russisch (ru), Zweeds (sv), Thai (th), Tagalog (tl), Turks (tr), Oekraïens (uk), Vietnamees (vi), Chinees Vereenvoudigd (zh-CN)

## Bestandslocaties
Alle vertaalbestanden staan in: `src/i18n/locales/`

Voorbeeld: `src/i18n/locales/ar.json`, `src/i18n/locales/de.json`, enz.

## Sleutels om te vertalen

Er zijn **twee soorten sleutels** om te vertalen:

### A. Tijdlijnsleutels voor interventies (in de sectie `interventions`)

Deze verschijnen op de tijdlijn wanneer een bijzondere omstandigheid wordt geactiveerd. Alle bestanden hebben nu tijdelijke aanduidingen gemarkeerd met `[TRANSLATE]`.

```json
"interventions": {
  // ... andere sleutels ...
  "anaphylaxisActivated": "Anafylaxie-protocol geactiveerd",
  "asthmaActivated": "Astma / Ernstige bronchospasme-protocol geactiveerd",
  "hyperthermiaActivated": "Hyperthermie / Hitteberoerte-protocol geactiveerd",
  "opioidOverdoseActivated": "Opioidenoverdosering-protocol geactiveerd",
  "drowningActivated": "Verdrinking-protocol geactiveerd",
  "electrocutionActivated": "Elektrocutie-protocol geactiveerd",
  "lvadFailureActivated": "LVAD-falen-protocol geactiveerd"
}
```

### B. Diagnostische en beheertext (in de sectie `specialCircumstances`)

Voor elk taalbestand, vind de sectie `"specialCircumstances"` en vertaal deze sleutels voor elke aandoening:

### 1. Anafylaxie
```json
"anaphylaxis": {
  "diagnostic": "Snelle begin van luchtwegen/ademhaling/circulatie compromittering met typische triggers (medicijnen, voedsel, steken). Overweeg mastceltryptase indien beschikbaar.",
  "management": "Verwijder trigger indien mogelijk, geef epinefrine IM (0,01 mg/kg tot 0,5 mg, herhaal elke 5-15 min indien nodig), agressieve IV-vloeistoffen, en overweeg glucagon bij refractair geval (vooral bij bètablokkers). ECPR kan worden overwogen bij refractaire anafylactische arrestatie."
}
```

### 2. Astma
```json
"asthma": {
  "diagnostic": "Geschiedenis van astma / reactieve luchtwegaandoening met ernstige bronchospasme of status asthmaticus. Hoge verdenking van spanningspneumothorax bij geventileerde patiënten met plotselinge verslechtering.",
  "management": "Lagereademvolume-ventilatie (6-8 ml/kg) met lage frequentie om volledige uitademing mogelijk te maken en auto-PEEP te minimaliseren. Ga door met agressieve bronchodilatoren. Decomprimeer onmiddellijk als spanningspneumothorax wordt vermoed. Overweeg ECLS bij refractaire arrestatie."
}
```

### 3. Hyperthermie
```json
"hyperthermia": {
  "diagnostic": "Meet kerntemperatuur (rectaal, slokdarm, of blaassonde). Verhoogde kerntemperatuur >40°C met veranderd mentaal status en geschiedenis van hitteblootstelling.",
  "management": "Snelle afkoeling is kritiek - ijswaterbad indien beschikbaar (snelste methode) of lauw water sproeien met ventilatoren voor verdampingskoeling. Monitor kerntemperatuur elke 5-10 minuten en stop afkoeling bij 38-39°C om overkoeling te voorkomen."
}
```

### 4. Opioidenoverdosering
```json
"opioidOverdose": {
  "diagnostic": "Geschiedenis van opioidgebruik/blootstelling, puntvormige pupillen, respiratoire depressie. Collaterale geschiedenis en bevindingen op de locatie (pilflesjes, parafernalia).",
  "management": "Prioriteer luchtwegbeheer en ventilatie. Geef naloxon 0,4-2 mg IV/IM/IN (hogere doseringen voor fentanyl/karfentanil-analogen). Mogelijk herhaalde doseringen of infusie nodig. Monitor nauwlettend na ROSC aangezien naloxon duur korter kan zijn dan opioid."
}
```

### 5. Verdrinking
```json
"drowning": {
  "diagnostic": "Geschiedenis van onderdompeling. Beoordeel op tekenen van trauma als duiken of watersport betrokken zijn.",
  "management": "Prioriteer vroege reddingsademhalingen (begin voor verwijdering uit water indien mogelijk). Geef 100% zuurstof en geavanceerde luchtweg. Volg standaard ACLS/PALS met nadruk op zuurstoftoevoer. Overweeg C-wervelvoorzorgsmaatregelen als trauma wordt vermoed."
}
```

### 6. Elektrocutie
```json
"electrocution": {
  "diagnostic": "Verifieer dat stroombron is losgekoppeld en locatie veilig is. Elektrische letsels presenteren zich vaak met VF/pVT.",
  "management": "Defibrilleer onmiddellijk als VF/pVT aanwezig is. Volg standaard ACLS/PALS protocollen. Overweeg verlengde reanimatie-inspanningen aangezien elektrische letsels gunstige resultaten kunnen hebben met verlengde CPR."
}
```

### 7. LVAD-falen
```json
"lvadFailure": {
  "diagnostic": "Ausculeer over LVAD-locatie voor zoemen (afwezigheid geeft falen aan). Controleer controller voor alarmen/foutcodes. Inspecteer aandrijvinglijn en stroomverbindingen. Gebruik Doppler voor bloeddrukbeoordeling.",
  "management": "VERTRAAG borstcompressies NIET - CPR is veilig en noodzakelijk. Stoorzoek stroombron (verwissel batterijen indien nodig), controleer aandrijvinglijn op schade/verbreek, en herzie controller. Neem onmiddellijk contact op met LVAD-team."
}
```

## Belangrijke opmerkingen

1. **Medische terminologie**: Gebruik klinisch nauwkeurige medische terminologie geschikt voor zorgprofessionals in elke taal. Termen zoals "VF/pVT", "ECPR", "ECLS", "LVAD", "ROSC" worden vaak behouden als afkortingen of getranslitereerd.

2. **Getallen en eenheden**: Behoud numerieke waarden en eenheden (bijv. "0,01 mg/kg", "6-8 ml/kg", "40°C", "38-39°C") precies zoals getoond.

3. **Doseringsinformatie**: Medicatiedoses moeten nauwkeurig worden vertaald - controleer farmacologische termen dubbel.

4. **Consistentie**: Pas de toon en stijl aan van bestaande vertalingen in elk taalbestand.

5. **JSON-formaat**: Behoud juiste JSON-opmaak - escape aanhalingstekens indien nodig, geen trailing commas.

6. **Structuur**: Elke aandoening moet precies 2 sleutels hebben: `"diagnostic"` en `"management"`

## Verificatielijst

Na het vertalen van elke taal:
- ✅ Alle 7 interventietijdlijnsleutels vertaald (in de sectie `interventions`)
- ✅ Alle 7 aandoeningen vertaald (anaphylaxis, asthma, hyperthermia, opioidOverdose, drowning, electrocution, lvadFailure)
- ✅ Elke aandoening heeft zowel "diagnostic" als "management" sleutels
- ✅ Medische terminologie is klinisch nauwkeurig
- ✅ Numerieke waarden onveranderd
- ✅ JSON-syntaxis is geldig (controleer met linter indien beschikbaar)
- ✅ Bestandscodering is UTF-8
- ✅ Alle `[TRANSLATE]` tijdelijke aanduidingen verwijderd

## Voorbeeldstructuur

Zo zou het eruit moeten zien in het JSON-bestand:

```json
{
  "specialCircumstances": {
    "title": "[Al vertaald]",
    "tapToReview": "[Al vertaald]",
    "activeCount": "[Al vertaald]",
    "diagnosticEval": "[Al vertaald]",
    "management": "[Al vertaald]",
    "anaphylaxis": {
      "title": "[Al vertaald]",
      "desc": "[Al vertaald]",
      "diagnostic": "[UW VERTALING]",
      "management": "[UW VERTALING]"
    },
    "asthma": {
      "title": "[Al vertaald]",
      "desc": "[Al vertaald]",
      "diagnostic": "[UW VERTALING]",
      "management": "[UW VERTALING]"
    },
    // ... ga door voor alle 7 aandoeningen
  }
}
```

## Prioriteitsvolgorde

Aanbevolen om in deze volgorde te vertalen:
1. Spaans (es) - veel gebruikt
2. Frans (fr) - veel gebruikt
3. Duits (de) - veel gebruikt
4. Portugees (pt) - veel gebruikt
5. Italiaans (it)
6. Russisch (ru)
7. Arabisch (ar)
8. Chinees (zh-CN)
9. Japans (ja)
10. Koreaans (ko)
11. Overige talen alfabetisch

## Testen

Na het voltooien van vertalingen, verifieer door:
1. `npm run lint` uitvoeren om te controleren op syntaxisfouten
2. De app laden en talen wisselen om ervoor te zorgen dat tekst correct wordt weergegeven
3. Controleren dat tekst past in de gebruikersinterface zonder overflow-problemen

---

**Totaal werk**:
- 7 interventietijdlijnsleutels × 24 talen = **168 korte strings**
- 7 aandoeningen × 2 sleutels elk × 24 talen = **336 klinische tekststrings**
- **TOTAAL: 504 strings om te vertalen**

## Huidige status

Alle vertaalbestanden zijn bijgewerkt met tijdelijke aanduidingen gemarkeerd `[TRANSLATE]` in niet-Engelse bestanden. U moet:
1. De `[TRANSLATE]` voorvoegsel vervangen door daadwerkelijke vertalingen voor interventiesleutels
2. De `diagnostic` en `management` vertalingen toevoegen voor elke bijzondere omstandigheid
