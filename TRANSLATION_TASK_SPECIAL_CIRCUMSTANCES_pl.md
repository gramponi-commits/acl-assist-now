# Zadanie tłumaczenia: Tekst diagnostyczny i zarządzania w okolicznościach specjalnych

## Przegląd
Musisz przetłumaczyć tekst oceny diagnostycznej i zarządzania dla 7 okoliczności specjalnych (anafilaksja, astma, hipertermia, przedawkowanie opioidów, utonięcie, porażenie prądem, awaria LVAD) na 24 języki.

## Języki docelowe
Przetłumacz na WSZYSTKIE języki Z WYŁĄCZENIEM:
- ❌ Angielski (already done - use as reference)
- ❌ Hindi (hi.json)
- ❌ Bengalski (bn.json)
- ❌ Hebrajski (he.json)

**Języki do przetłumaczenia (łącznie 24):**
Arabski (ar), Duński (da), Niemiecki (de), Grecki (el), Hiszpański (es), Perski (fa), Francuski (fr), Indonezyjski (id), Włoski (it), Japoński (ja), Koreański (ko), Holenderski (nl), Norweski (no), Polski (pl), Portugalski (pt), Rosyjski (ru), Szwedzki (sv), Tajski (th), Tagalog (tl), Turecki (tr), Ukraiński (uk), Wietnamski (vi), Chiński uproszczony (zh-CN)

## Lokalizacja plików
Wszystkie pliki tłumaczeń znajdują się w: `src/i18n/locales/`

Przykład: `src/i18n/locales/ar.json`, `src/i18n/locales/de.json`, itp.

## Klucze do przetłumaczenia

Istnieją **dwa rodzaje kluczy** do przetłumaczenia:

### A. Klucze osi czasu interwencji (w sekcji `interventions`)

Pojawiają się na osi czasu, gdy aktywowana jest okoliczność specjalna. Wszystkie pliki mają teraz znaczniki oznaczone `[TRANSLATE]`.

```json
"interventions": {
  // ... inne klucze ...
  "anaphylaxisActivated": "Aktywowano protokół anafilaksji",
  "asthmaActivated": "Aktywowano protokół astmy / ciężkiego skurczu oskrzeli",
  "hyperthermiaActivated": "Aktywowano protokół hipertermii / udaru cieplnego",
  "opioidOverdoseActivated": "Aktywowano protokół przedawkowania opioidów",
  "drowningActivated": "Aktywowano protokół utonięcia",
  "electrocutionActivated": "Aktywowano protokół porażenia prądem",
  "lvadFailureActivated": "Aktywowano protokół awarii LVAD"
}
```

### B. Tekst diagnostyczny i zarządzania (w sekcji `specialCircumstances`)

Dla każdego pliku językowego znajdź sekcję `"specialCircumstances"` i przetłumacz te klucze dla każdego stanu:

### 1. Anafilaksja
```json
"anaphylaxis": {
  "diagnostic": "Nagłe naruszenie dróg oddechowych/oddychania/krążenia z typowymi wyzwalaczami (leki, żywność, użądlenia). Rozważ oznaczenie tryptazy komórek tucznych, jeśli jest dostępna.",
  "management": "Usuń wyzwalacz, jeśli to możliwe, podaj epinefrynę IM (0,01 mg/kg do 0,5 mg, powtórz co 5-15 min w razie potrzeby), agresywne płyny dożylne i rozważ glukagon w przypadku oporności (szczególnie przy beta-blokerach). Można rozważyć ECPR w przypadku opornego zatrzymania anafilaktycznego."
}
```

### 2. Astma
```json
"asthma": {
  "diagnostic": "Wywiad w kierunku astmy / reaktywnej choroby oskrzeli z ciężkim skurczem oskrzeli lub stanem astmatycznym. Wysokie podejrzenie odmy opłucnowej napięciowej u wentylowanych pacjentów z nagłym pogorszeniem.",
  "management": "Wentylacja niskim objętością oddechową (6-8 ml/kg) z niską częstością, aby umożliwić pełne wydechy i zminimalizować auto-PEEP. Kontynuuj agresywne bronchodylatatory. Natychmiast zdepressuj, jeśli podejrzewasz odmę napięciową. Rozważ ECLS w przypadku opornego zatrzymania."
}
```

### 3. Hipertermia
```json
"hyperthermia": {
  "diagnostic": "Pomiar temperatury wewnętrznej (odbytniczej, przełykowej lub sondą pęcherzową). Podwyższona temperatura wewnętrzna >40°C z zaburzeniami stanu psychicznego i wywiadem w kierunku ekspozycji na ciepło.",
  "management": "Szybkie chłodzenie jest krytyczne - kąpiel w lodowatej wodzie, jeśli jest dostępna (najszybsza metoda) lub spryskiwanie letnią wodą z wentylatorami do chłodzenia parowego. Monitoruj temperaturę wewnętrzną co 5-10 minut i przerwij chłodzenie przy 38-39°C, aby zapobiec nadmiernemu wychłodzeniu."
}
```

### 4. Przedawkowanie opioidów
```json
"opioidOverdose": {
  "diagnostic": "Wywiad w kierunku stosowania/ekspozycji na opioidy, punkcikowate źrenice, depresja oddechowa. Wywiad od osób trzecich i znaleziska na miejscu (butelki z lekami, przybory do zażywania).",
  "management": "Priorytetowe zarządzanie drogami oddechowymi i wentylacja. Podaj nalokson 0,4-2 mg IV/IM/IN (wyższe dawki dla analogów fentanylu/karfentanylu). Może być konieczne powtórzenie dawki lub infuzja. Ściśle monitoruj po ROSC, ponieważ czas działania naloksonu może być krótszy niż opioidu."
}
```

### 5. Utonięcie
```json
"drowning": {
  "diagnostic": "Wywiad w kierunku zanurzenia. Oceń objawy urazu, jeśli zaangażowane są nurkowanie lub sporty wodne.",
  "management": "Priorytetowe wczesne oddechy ratunkowe (zacznij przed wyjęciem z wody, jeśli to możliwe). Zapewnij 100% tlenu i zaawansowaną drogę oddechową. Postępuj zgodnie ze standardowym ACLS/PALS ze szczególnym uwzględnieniem natleniania. Rozważ środki ostrożności kręgosłupa szyjnego, jeśli podejrzewasz uraz."
}
```

### 6. Porażenie prądem
```json
"electrocution": {
  "diagnostic": "Zweryfikuj odłączenie źródła zasilania i bezpieczeństwo sceny. Urazy elektryczne często objawiają się migotaniem komór/pVT.",
  "management": "Natychmiast defibryluj, jeśli obecne jest VF/pVT. Postępuj zgodnie ze standardowymi protokołami ACLS/PALS. Rozważ wydłużone wysiłki resuscytacyjne, ponieważ urazy elektryczne mogą mieć korzystne wyniki przy wydłużonym RKO."
}
```

### 7. Awaria LVAD
```json
"lvadFailure": {
  "diagnostic": "Osłuchuj miejsce LVAD w celu wykrycia szmeru (brak wskazuje na awarię). Sprawdź kontroler pod kątem alarmów/kodów błędów. Obejrzyj linię napędową i połączenia zasilania. Użyj Dopplera do oceny ciśnienia krwi.",
  "management": "NIE odkładaj ucisków klatki piersiowej - RKO jest bezpieczne i konieczne. Rozwiąż problem ze źródłem zasilania (wymień baterie, jeśli to konieczne), sprawdź linię napędową pod kątem uszkodzeń/rozłączeń i przejrzyj kontroler. Natychmiast skontaktuj się z zespołem LVAD."
}
```

## Ważne uwagi

1. **Terminologia medyczna**: Użyj klinicznie precyzyjnej terminologii medycznej odpowiedniej dla specjalistów opieki zdrowotnej w każdym języku. Terminy takie jak "VF/pVT", "ECPR", "ECLS", "LVAD", "ROSC" są często zachowywane jako skróty lub transliterowane.

2. **Liczby i jednostki**: Zachowaj wartości liczbowe i jednostki (np. "0,01 mg/kg", "6-8 ml/kg", "40°C", "38-39°C") dokładnie tak, jak pokazano.

3. **Informacje o dawkowaniu**: Dawki leków muszą być dokładnie przetłumaczone - sprawdź dwukrotnie terminy farmakologiczne.

4. **Spójność**: Dopasuj ton i styl istniejących tłumaczeń w każdym pliku językowym.

5. **Format JSON**: Zachowaj poprawne formatowanie JSON - escaped quotes w razie potrzeby, bez przecinków końcowych.

6. **Struktura**: Każdy stan powinien mieć dokładnie 2 klucze: `"diagnostic"` i `"management"`

## Lista kontrolna weryfikacji

Po przetłumaczeniu każdego języka:
- ✅ Wszystkie 7 kluczy osi czasu interwencji przetłumaczone (w sekcji `interventions`)
- ✅ Wszystkie 7 warunków przetłumaczone (anaphylaxis, asthma, hyperthermia, opioidOverdose, drowning, electrocution, lvadFailure)
- ✅ Każdy stan ma zarówno klucze "diagnostic" jak i "management"
- ✅ Terminologia medyczna jest klinicznie precyzyjna
- ✅ Wartości liczbowe niezmienione
- ✅ Składnia JSON jest poprawna (sprawdź linterem, jeśli dostępny)
- ✅ Kodowanie pliku to UTF-8
- ✅ Usunięto wszystkie znaczniki `[TRANSLATE]`

## Przykładowa struktura

Tak to powinno wyglądać w pliku JSON:

```json
{
  "specialCircumstances": {
    "title": "[Już przetłumaczone]",
    "tapToReview": "[Już przetłumaczone]",
    "activeCount": "[Już przetłumaczone]",
    "diagnosticEval": "[Już przetłumaczone]",
    "management": "[Już przetłumaczone]",
    "anaphylaxis": {
      "title": "[Już przetłumaczone]",
      "desc": "[Już przetłumaczone]",
      "diagnostic": "[TWOJE TŁUMACZENIE]",
      "management": "[TWOJE TŁUMACZENIE]"
    },
    "asthma": {
      "title": "[Już przetłumaczone]",
      "desc": "[Już przetłumaczone]",
      "diagnostic": "[TWOJE TŁUMACZENIE]",
      "management": "[TWOJE TŁUMACZENIE]"
    },
    // ... kontynuuj dla wszystkich 7 warunków
  }
}
```

## Kolejność priorytetów

Zaleca się tłumaczenie w tej kolejności:
1. Hiszpański (es) - szeroko stosowany
2. Francuski (fr) - szeroko stosowany
3. Niemiecki (de) - szeroko stosowany
4. Portugalski (pt) - szeroko stosowany
5. Włoski (it)
6. Rosyjski (ru)
7. Arabski (ar)
8. Chiński (zh-CN)
9. Japoński (ja)
10. Koreański (ko)
11. Pozostałe języki alfabetycznie

## Testowanie

Po ukończeniu tłumaczeń zweryfikuj przez:
1. Uruchomienie `npm run lint` w celu sprawdzenia błędów składni
2. Załadowanie aplikacji i przełączanie języków, aby upewnić się, że tekst wyświetla się poprawnie
3. Sprawdzenie, czy tekst mieści się w interfejsie użytkownika bez problemów z przepełnieniem

---

**Całkowita ilość pracy**:
- 7 kluczy osi czasu interwencji × 24 języki = **168 krótkich ciągów znaków**
- 7 warunków × 2 klucze każdy × 24 języki = **336 ciągów tekstu klinicznego**
- **RAZEM: 504 ciągi do przetłumaczenia**

## Obecny status

Wszystkie pliki tłumaczeń zostały zaktualizowane o klucze zastępcze oznaczone `[TRANSLATE]` w plikach nieanglojęzycznych. Musisz:
1. Zastąpić prefiks `[TRANSLATE]` faktycznymi tłumaczeniami dla kluczy interwencji
2. Dodać tłumaczenia `diagnostic` i `management` dla każdej okoliczności specjalnej
