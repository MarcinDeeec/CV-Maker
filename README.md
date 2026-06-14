# CV Tailor (local-first)

[Polski / Polish version → `README.pl.md`](README.pl.md)

Local-first, privacy-first app for **honestly** tailoring your CV to specific job offers.
It does not invent experience — it highlights what you actually have and shows gaps as suggestions.

> Stage: **v0.2** — full end-to-end flow: import CV → job offer → analysis → tailored CV → export to Markdown / PDF. Your data and API key stay local.

## Features

- Paste or load a CV (`.txt`, `.md`) and a job offer.
- Split the CV into sections (summary, experience, skills, education, and detected custom sections).
- Extract requirements from the offer (hard / soft skills).
- **Weighted matching** with a percentage score (hard skills count double), plus matched / missing breakdown.
- Generate a tailored CV (offline heuristic or AI model — BYOK).
- Local autosave and export to **Markdown** or **PDF**.

## Getting started

```bash
npm install
npm run dev
```

The app starts on `http://localhost:5173`.

Other commands:

```bash
npm run build      # production build
npm run typecheck  # type checking
npm run smoke      # quick core-logic test (no UI)
```

## AI (BYOK — Bring Your Own Key)

In the **Settings** tab you provide:

- an OpenAI-compatible endpoint (e.g. `https://api.openai.com/v1` or a local LocalAI),
- a model,
- an API key.

The key is stored locally (localStorage). **Without a key** the app runs in offline mode
(heuristic generator, no model).

## Privacy

- Your CV, the offer and settings are not sent to any app server (there is no backend).
- The only network request is the optional call to the AI provider you choose.

## Architecture

See [`docs/architecture.md`](docs/architecture.md). The core (`src/lib/core`) is independent of the UI
and the browser — it can be tested and later moved into a separate package / sidecar.

## Roadmap

See [`docs/roadmap.md`](docs/roadmap.md). Next steps: review-first mode, DOCX/PDF import, PL/EN UI,
and eventually a desktop build (Tauri).

## What v0.2 does NOT do (yet)

User accounts, cloud sync, multiple templates, cover-letter generator, ATS stats, DOCX/PDF import.
This is a deliberate scope limit — a working, simple pipeline first.
