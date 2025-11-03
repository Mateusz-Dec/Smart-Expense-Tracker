# Smart Expense Tracker

Aplikacja webowa do inteligentnego zarządzania domowym budżetem. Umożliwia zbieranie wszystkich przychodów i wydatków w jednym miejscu, analizę danych na wykresach, kontrolę budżetów dla poszczególnych kategorii, realizację celów oszczędnościowych oraz obsługę cyklicznych płatności. Dane użytkownika są bezpiecznie przechowywane w `localStorage`, dzięki czemu pozostają dostępne po odświeżeniu strony.

## Funkcje

- **Rejestr transakcji** – szybkie dodawanie przychodów i wydatków z walidacją danych oraz natychmiastowym podglądem na liście.
- **Zaawansowane filtrowanie** – wyszukiwanie po opisie, typie, kategorii i zakresie dat; licznik wyników reaguje w czasie rzeczywistym.
- **Podsumowanie finansowe** – aktualny bilans, łączna wysokość przychodów i wydatków oraz procentowy udział kosztów.
- **Wykresy (Recharts)** – wykres słupkowy porównujący przychody i wydatki w ostatnich miesiącach oraz dwa wykresy kołowe dla struktury kategorii.
- **Budżety kategorii** – definiowanie limitów, monitorowanie wykorzystania i alerty o przekroczeniach.
- **Cele oszczędnościowe** – planowanie celów z terminem, wizualizacja postępu i podpowiedzi ile odkładać miesięcznie.
- **Cykliczne płatności** – zarządzanie stałymi zobowiązaniami, przypomnienia o terminach i szybkie księgowanie jako wydatek.
- **Eksport danych** – generowanie raportu PDF (z wbudowaną czcionką z polskimi znakami), a także eksport do CSV i JSON z wyborem zakresu dat.
- **Tryb jasny/ciemny** – przełącznik motywu z zapamiętywaniem preferencji użytkownika.
- **Powiadomienia (react-hot-toast)** – informacja zwrotna przy każdym działaniu (dodanie, edycja, eksport, itp.).

## Stos technologiczny

- **React 19 + Vite** – szybkie środowisko uruchomieniowe SPA.
- **React Context + hooki** – zarządzanie stanem (transakcje, filtry, motyw).
- **Recharts** – interaktywne wizualizacje danych.
- **Bootstrap 5 + CSS Modules** – spójna, responsywna warstwa prezentacji.
- **react-hot-toast** – lekki system powiadomień.
- **jsPDF + html2canvas** – generowanie raportów PDF z własną czcionką Roboto (obsługa PL).

## Szybki start

1. Zainstaluj zależności:

   ```bash
   npm install
   ```

2. Uruchom środowisko deweloperskie:

   ```bash
   npm run dev
   ```

   Domyślnie aplikacja będzie dostępna pod adresem `http://localhost:5173`.

3. Budowa produkcyjna:

   ```bash
   npm run build
   ```

4. Podgląd zbudowanej aplikacji:

   ```bash
   npm run preview
   ```

## Dostępne skrypty

| Komenda           | Zastosowanie                                |
| ----------------- | ------------------------------------------- |
| `npm run dev`     | start serwera deweloperskiego (Vite)        |
| `npm run build`   | generowanie paczki produkcyjnej             |
| `npm run preview` | podgląd paczki produkcyjnej                 |
| `npm run lint`    | statyczna analiza kodu (ESLint)             |

## Struktura katalogów

```
smart-expense-tracker/
├─ src/
│  ├─ components/
│  │  ├─ Budgets/
│  │  ├─ Charts/
│  │  ├─ ExpenseForm/
│  │  ├─ ExpenseList/
│  │  ├─ ExpenseSummary/
│  │  ├─ ExportData/
│  │  ├─ Filters/
│  │  ├─ RecurringPayments/
│  │  └─ SavingsGoals/
│  ├─ context/
│  │  ├─ ExpenseContext.jsx
│  │  └─ ThemeContext.jsx
│  ├─ hooks/
│  │  └─ useLocalStorage.js
│  ├─ utils/
│  │  └─ fonts/Roboto-Light-normal.js
│  ├─ App.jsx
│  ├─ App.css
│  └─ main.jsx
├─ index.html
├─ package.json
└─ vite.config.js
```

## Kluczowe moduły

- `ExpenseContext.jsx` – centralne źródło prawdy o transakcjach; obsługuje dodawanie, edycję, usuwanie, filtrowanie oraz podsumowanie finansowe.
- `ThemeContext.jsx` – przełączanie trybu ciemnego/jasnego z zapisem w `localStorage`.
- `useLocalStorage.js` – dedykowany hook do synchronizacji stanu z pamięcią przeglądarki.
- Komponenty `Budgets`, `SavingsGoals`, `RecurringPayments` – rozbudowane moduły zarządzające dodatkowymi funkcjonalnościami (własny stan, formularze, walidacje).
- `ExportData.jsx` – generuje raporty PDF, CSV i JSON; wykorzystuje dynamiczne importy oraz dedykowaną czcionkę Roboto do supportu polskich znaków.

## Jak korzystać

1. **Dodaj transakcję** – wypełnij formularz, wybierz typ (wydatek/przychód), kategorię i potwierdź.
2. **Filtruj historię** – użyj panelu filtrów, aby zawęzić wyniki do interesujących danych.
3. **Analizuj** – sprawdź karty podsumowania, wykresy i procentowy udział kosztów.
4. **Zaplanuj budżet** – ustaw limit kwotowy dla kategorii i monitoruj postęp.
5. **Realizuj cele oszczędnościowe** – twórz cele, śledź wpłaty i terminy.
6. **Obsługuj płatności cykliczne** – definiuj abonamenty, kredyty czy rachunki; zapisuj je w transakcjach jednym kliknięciem.
7. **Eksportuj dane** – pobierz raport w PDF, CSV lub JSON z wybranym okresem czasowym.
8. **Dostosuj motyw** – przełącznik w nagłówku pozwala przełączyć tryb jasny/ciemny (preferencja zapisywana lokalnie).

## Wymagania

- Node.js w wersji ≥ 18.
- Przeglądarka z obsługą `localStorage` oraz modułów ES.

## Możliwe kierunki rozwoju

- Integracja z backendem i synchronizacja wielu użytkowników.
- Import transakcji z plików bankowych (np. CSV MT940).
- Automatyczne oznaczanie transakcji jako oszczędności dla wybranego celu.
- System powiadomień e-mail/SMS dla zbliżających się płatności.

---

