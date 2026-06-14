# CV Tailor (local-first)

Local-first, privacy-first aplikacja do **uczciwego** dopasowywania CV pod konkretne oferty pracy.
Nie wymyśla doświadczenia — podkreśla to, co naprawdę masz, i pokazuje braki jako sugestie.

> Etap: **v0.1 (proof of concept)** — pełny przepływ end-to-end: import CV → oferta → analiza → dopasowane CV → eksport do Markdown. Dane i klucz API zostają lokalnie.

## Co potrafi v0.1

- Wklejenie / wczytanie CV (`.txt`, `.md`) i treści oferty pracy.
- Podział CV na sekcje (podsumowanie, doświadczenie, umiejętności, edukacja).
- Wyciągnięcie wymagań z oferty (twarde/miękkie kompetencje).
- Proste dopasowanie + wynik procentowy, lista trafień i braków.
- Wygenerowanie dopasowanej wersji CV (heurystyka offline lub model AI — BYOK).
- Lokalny autozapis projektu i eksport do Markdown.

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

W zakładce **Ustawienia** podajesz:
- endpoint zgodny z OpenAI API (np. `https://api.openai.com/v1` albo lokalny LocalAI),
- model,
- klucz API.

Klucz zapisywany jest tylko lokalnie (localStorage). **Bez klucza** aplikacja działa w trybie offline
(heurystyczny generator bez modelu).

## Prywatność

- CV, oferta i ustawienia nie są wysyłane na żaden serwer aplikacji (nie ma backendu).
- Jedyne zapytanie sieciowe to opcjonalne wywołanie wybranego przez Ciebie dostawcy AI.

## Architektura

Zobacz [`docs/architecture.md`](docs/architecture.md). Rdzeń (`src/lib/core`) jest niezależny od UI
i przeglądarki — da się go testować i później przenieść do osobnego pakietu / sidecara.

## Roadmap

Zobacz [`docs/roadmap.md`](docs/roadmap.md). Kolejne etapy: lepszy parser, scoring, tryb review-first,
import DOCX/PDF, PL/EN, a docelowo desktop (Tauri).

## Czego v0.1 NIE robi

Kont użytkowników, chmury, wielu szablonów, generatora listu motywacyjnego, statystyk ATS, importu PDF/DOCX.
To świadome ograniczenie zakresu — najpierw działający, prosty pipeline.
