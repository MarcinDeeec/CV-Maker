# CV Tailor (local-first)

[English version → `README.md`](README.md)

Local-first, privacy-first aplikacja do **uczciwego** dopasowywania CV pod konkretne oferty pracy.
Nie wymyśla doświadczenia — podkreśla to, co naprawdę masz, i pokazuje braki jako sugestie.

> Etap: **v0.2** — pełny przepływ end-to-end: import CV → oferta → analiza → dopasowane CV → eksport do Markdown / PDF. Dane i klucz API zostają lokalnie.

## Co potrafi

- Wklejenie / wczytanie CV (`.txt`, `.md`) i treści oferty pracy.
- Podział CV na sekcje (podsumowanie, doświadczenie, umiejętności, edukacja oraz wykryte sekcje własne).
- Wyciągnięcie wymagań z oferty (twarde/miękkie kompetencje).
- **Ważone dopasowanie** + wynik procentowy (twarde kompetencje liczą się podwójnie), lista trafień i braków.
- Wygenerowanie dopasowanej wersji CV (heurystyka offline lub model AI — BYOK).
- Lokalny autozapis i eksport do **Markdown** lub **PDF**.

## Uruchomienie

```bash
npm install
npm run dev
```

Apka wystartuje na `http://localhost:5173`.

Dodatkowe komendy:

```bash
npm run build      # produkcyjny build
npm run typecheck  # sprawdzenie typów
npm run smoke      # szybki test logiki rdzenia (bez UI)
```

## AI (BYOK — Bring Your Own Key)

W zakładce **Ustawienia** podajesz endpoint zgodny z OpenAI API, model i klucz API.
Klucz zapisywany jest tylko lokalnie. **Bez klucza** aplikacja działa w trybie offline (heurystyka bez modelu).

## Prywatność

- CV, oferta i ustawienia nie są wysyłane na żaden serwer aplikacji (nie ma backendu).
- Jedyne zapytanie sieciowe to opcjonalne wywołanie wybranego dostawcy AI.

## Architektura i roadmap

Zobacz [`docs/architecture.md`](docs/architecture.md) i [`docs/roadmap.md`](docs/roadmap.md).
