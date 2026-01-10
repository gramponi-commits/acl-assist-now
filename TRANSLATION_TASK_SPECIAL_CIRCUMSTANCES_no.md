# Oversettelsesoppgave: Diagnostisk og håndteringstekst for spesielle omstendigheter

## Oversikt
Du må oversette den diagnostiske vurderings- og håndteringsteksten for 7 spesielle omstendigheter (anafylaksi, astma, hypertermi, opioidoverdose, drukning, elektrisk sjokk, LVAD-svikt) til 24 språk.

## Målspråk
Oversett til ALLE språk UNNTATT:
- ❌ Engelsk (allerede gjort - bruk som referanse)
- ❌ Hindi (hi.json)
- ❌ Bengalisk (bn.json)
- ❌ Hebraisk (he.json)

**Språk å oversette til (24 totalt):**
Arabisk (ar), Dansk (da), Tysk (de), Gresk (el), Spansk (es), Persisk (fa), Fransk (fr), Indonesisk (id), Italiensk (it), Japansk (ja), Koreansk (ko), Nederlandsk (nl), Norsk (no), Polsk (pl), Portugisisk (pt), Russisk (ru), Svensk (sv), Thai (th), Tagalog (tl), Tyrkisk (tr), Ukrainsk (uk), Vietnamesisk (vi), Kinesisk forenklet (zh-CN)

## Filplasseringer
Alle oversettelsesfiler ligger i: `src/i18n/locales/`

Eksempel: `src/i18n/locales/ar.json`, `src/i18n/locales/de.json`, osv.

## Nøkler å oversette

Det er **to typer nøkler** å oversette:

### A. Tidslinjenøkler for intervensjoner (i `interventions`-seksjonen)

Disse vises på tidslinjen når en spesiell omstendighet aktiveres. Alle filer har nå plassholdere merket med `[TRANSLATE]`.

```json
"interventions": {
  // ... andre nøkler ...
  "anaphylaxisActivated": "Anafylaksi-protokoll aktivert",
  "asthmaActivated": "Astma / Alvorlig bronkospasme-protokoll aktivert",
  "hyperthermiaActivated": "Hypertermi / Heteslag-protokoll aktivert",
  "opioidOverdoseActivated": "Opioidoverdose-protokoll aktivert",
  "drowningActivated": "Drukning-protokoll aktivert",
  "electrocutionActivated": "Elektrisk sjokk-protokoll aktivert",
  "lvadFailureActivated": "LVAD-svikt-protokoll aktivert"
}
```

### B. Diagnostisk og håndteringstekst (i `specialCircumstances`-seksjonen)

For hver språkfil, finn `"specialCircumstances"`-seksjonen og oversett disse nøklene for hver tilstand:

### 1. Anafylaksi
```json
"anaphylaxis": {
  "diagnostic": "Rask inntreden av luftveier/pust/sirkulasjonsproblemer med typiske utløsere (medisiner, mat, stikk). Vurder mastcelle-tryptase hvis tilgjengelig.",
  "management": "Fjern utløser hvis mulig, gi epinefrin IM (0,01 mg/kg opptil 0,5 mg, gjenta hver 5-15 min etter behov), aggressiv IV-væske, og vurder glukagon ved refraktær tilfelle (spesielt hvis på betablokkere). ECPR kan vurderes for refraktær anafylaktisk hjertestans."
}
```

### 2. Astma
```json
"asthma": {
  "diagnostic": "Historie med astma / reaktiv luftveissykdom med alvorlig bronkospasme eller status asthmaticus. Høy mistanke om spennd pneumothorax hos ventilerte pasienter med plutselig forverring.",
  "management": "Lav tidevolum-ventilasjon (6-8 ml/kg) med lav frekvens for å tillate full utånding og minimere auto-PEEP. Fortsett aggressive bronkodilaterende midler. Dekomprimer umiddelbart hvis spennd pneumothorax mistenkes. Vurder ECLS for refraktær hjertestans."
}
```

### 3. Hypertermi
```json
"hyperthermia": {
  "diagnostic": "Mål kroppstemperatur (rektal, esophageal, eller blære-sonde). Forhøyet kjernetemperatur >40°C med endret mental status og historie med varmeeksponering.",
  "management": "Rask nedkjøling er kritisk - isvannsbad hvis tilgjengelig (raskeste metode) eller lunkent vannspray med vifter for fordampingskjøling. Overvåk kjernetemperatur hver 5-10 minutter og stopp nedkjøling ved 38-39°C for å forhindre overkjøling."
}
```

### 4. Opioidoverdose
```json
"opioidOverdose": {
  "diagnostic": "Historie med opioidbruk/eksponering, punktpupiller, respirasjonsdepresjon. Historie fra tredjepart og funn på stedet (pilleflasker, brukerutstyr).",
  "management": "Prioriter luftveishåndtering og ventilasjon. Gi nalokson 0,4-2 mg IV/IM/IN (høyere doser for fentanyl/karfentanil-analoger). Kan kreve gjentatte doser eller infusjon. Overvåk nøye etter ROSC da naloksonvarighet kan være kortere enn opioid."
}
```

### 5. Drukning
```json
"drowning": {
  "diagnostic": "Historie med neddykking. Vurder for tegn på traume hvis dykking eller vannsport involvert.",
  "management": "Prioriter tidlige redningstak (begynn før fjerning fra vann hvis mulig). Gi 100% oksygen og avansert luftvei. Følg standard ACLS/PALS med fokus på oksygenering. Vurder C-rygg-precautions hvis traume mistenkes."
}
```

### 6. Elektrisk sjokk
```json
"electrocution": {
  "diagnostic": "Bekreft at strømkilde er koblet fra og stedet er trygt. Elektriske skader presenterer seg ofte med VF/pVT.",
  "management": "Defibriller umiddelbart hvis VF/pVT til stede. Følg standard ACLS/PALS protokoller. Vurder forlenget gjenopplivningsinnsats da elektriske skader kan ha gunstige utfall med forlenget hjerte-lunge-redning."
}
```

### 7. LVAD-svikt
```json
"lvadFailure": {
  "diagnostic": "Auskulter over LVAD-stedet for sus (fravær indikerer svikt). Sjekk kontroller for alarmer/feilkoder. Inspiser drivline og strømkoblinger. Bruk Doppler for blodtrykksvurdering.",
  "management": "IKKE utsett brystkompressjoner - hjerte-lunge-redning er trygt og nødvendig. Feilsøk strømkilde (byt batterier hvis nødvendig), sjekk drivline for skade/koblingsløsning, og gjennomgå kontroller. Kontakt LVAD-team umiddelbart."
}
```

## Viktige notater

1. **Medisinsk terminologi**: Bruk klinisk nøyaktig medisinsk terminologi passende for helsepersonell på hvert språk. Termer som "VF/pVT", "ECPR", "ECLS", "LVAD", "ROSC" blir ofte beholdt som forkortelser eller translitterert.

2. **Tall og enheter**: Behold numeriske verdier og enheter (f.eks. "0,01 mg/kg", "6-8 ml/kg", "40°C", "38-39°C") nøyaktig som vist.

3. **Doseringsinformasjon**: Medisindoser må oversettes nøyaktig - dobbeltsjekk farmakologiske termer.

4. **Konsistens**: Match tonen og stilen i eksisterende oversettelser i hver språkfil.

5. **JSON-format**: Behold riktig JSON-formatering - escaped quotes hvis nødvendig, ingen etterfølgende kommaer.

6. **Struktur**: Hver tilstand skal ha nøyaktig 2 nøkler: `"diagnostic"` og `"management"`

## Sjekkliste for verifisering

Etter å ha oversatt hvert språk:
- ✅ Alle 7 intervensjonstidslinjenøkler oversatt (i `interventions`-seksjonen)
- ✅ Alle 7 tilstander oversatt (anaphylaxis, asthma, hyperthermia, opioidOverdose, drowning, electrocution, lvadFailure)
- ✅ Hver tilstand har både "diagnostic" og "management" nøkler
- ✅ Medisinsk terminologi er klinisk nøyaktig
- ✅ Numeriske verdier uendret
- ✅ JSON-syntaks er gyldig (sjekk med linter hvis tilgjengelig)
- ✅ Filkoding er UTF-8
- ✅ Fjernet alle `[TRANSLATE]` plassholdere

## Eksempelstruktur

Slik skal det se ut i JSON-filen:

```json
{
  "specialCircumstances": {
    "title": "[Allerede oversatt]",
    "tapToReview": "[Allerede oversatt]",
    "activeCount": "[Allerede oversatt]",
    "diagnosticEval": "[Allerede oversatt]",
    "management": "[Allerede oversatt]",
    "anaphylaxis": {
      "title": "[Allerede oversatt]",
      "desc": "[Allerede oversatt]",
      "diagnostic": "[DIN OVERSETTELSE]",
      "management": "[DIN OVERSETTELSE]"
    },
    "asthma": {
      "title": "[Allerede oversatt]",
      "desc": "[Allerede oversatt]",
      "diagnostic": "[DIN OVERSETTELSE]",
      "management": "[DIN OVERSETTELSE]"
    },
    // ... fortsett for alle 7 tilstander
  }
}
```

## Prioritetsrekkefølge

Anbefaler å oversette i denne rekkefølgen:
1. Spansk (es) - mye brukt
2. Fransk (fr) - mye brukt
3. Tysk (de) - mye brukt
4. Portugisisk (pt) - mye brukt
5. Italiensk (it)
6. Russisk (ru)
7. Arabisk (ar)
8. Kinesisk (zh-CN)
9. Japansk (ja)
10. Koreansk (ko)
11. Gjenværende språk alfabetisk

## Testing

Etter å ha fullført oversettelser, verifiser ved å:
1. Kjøre `npm run lint` for å sjekke for syntaksfeil
2. Laste appen og bytte språk for å sikre at tekst vises riktig
3. Sjekke at tekst passer i brukergrensesnittet uten overløpsproblemer

---

**Totalt arbeid**:
- 7 intervensjonstidslinjenøkler × 24 språk = **168 korte strenger**
- 7 tilstander × 2 nøkler hver × 24 språk = **336 kliniske tekststrenger**
- **TOTALT: 504 strenger å oversette**

## Nåværende status

Alle oversettelsesfiler har blitt oppdatert med plassholdernøkler merket `[TRANSLATE]` i ikke-engelske filer. Du må:
1. Erstatte `[TRANSLATE]`-prefikset med faktiske oversettelser for intervensjonsnøkler
2. Legge til `diagnostic` og `management` oversettelser for hver spesiell omstendighet
