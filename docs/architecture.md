# Architektura (v0.1)

Cel: rozdzielić logikę od UI, żeby późniejsze przejście na desktop (Tauri) lub dodanie
Python sidecara nie wymagało przepisywania całości.

## Warstwy

```
UI (React)            src/features/*, src/components/*
  │  korzysta z
 stan aplikacji        src/state/useProject.tsx
  │  woła
 rdzeń (czysty TS)     src/lib/core/*   ← testowalny, bez DOM
  ├─ parsing/          parseCv, parseJob
  ├─ matching/         matchCvToJob
  └─ tailoring/        generateTailoredCv (heurystyka)
 warstwa AI            src/lib/ai/*     ← BYOK, OpenAI-compatible
 storage               src/lib/storage/* ← localStorage (wymienialne)
 export                src/lib/export/*  ← Markdown
```

## Zasada

- `src/lib/core` **nie** importuje niczego z przeglądarki ani Reacta.
- UI nie zawiera logiki dopasowania — tylko wywołuje rdzeń.
- Dzięki temu `npm run smoke` testuje cały pipeline bez uruchamiania UI.

## Przepływ danych

1. Użytkownik dodaje CV i ofertę (`InputView`).
2. `parseCv` / `parseJob` zamieniają tekst na struktury.
3. `matchCvToJob` liczy trafienia i braki.
4. `generateTailoredCv` (lub model AI) buduje dopasowane CV.
5. Użytkownik przegląda/edytuje wynik i eksportuje do `.md`.

## Punkty rozszerzeń (kolejne etapy)

- `storage`: zamiana localStorage na SQLite/pliki.
- `ai`: więcej providerów, lokalne modele.
- `parsing`: import PDF/DOCX (możliwy Python sidecar).
- shell: Tauri jako desktopowy release.
