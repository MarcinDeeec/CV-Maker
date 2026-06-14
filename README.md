# CV Tailor (local-first)

[Polski / Polish version → `README.pl.md`](README.pl.md)

Local-first, privacy-first app for **honestly** tailoring your CV to specific job offers.
It does not invent experience — it highlights what you actually have and shows gaps as suggestions.

> Stage: **v1.0** — stable feature set. Full flow: import CV → job offer → analysis → tailored CV →
> optional cover letter → export to Markdown / PDF. PL/EN UI. Your data and API key stay local.

## Features

- Paste or load a CV (`.txt`, `.md`, `.docx`) and a job offer.
- Split the CV into sections (summary, experience, skills, education, and detected custom sections).
- Extract requirements from the offer (hard / soft skills).
- **Weighted matching** with a percentage score (hard skills count double), plus matched / missing breakdown.
- **Review-first** tailoring: accept / reject individual suggestions with evidence mapping.
- Generate a tailored CV (offline heuristic or AI model — BYOK).
- Optional **cover-letter** generator (offline heuristic + AI variant, 3 tones).
- **PL / EN** interface (switch in the header or Settings).
- Project versioning (save / open / delete whole CV + offer projects) and saved CV versions.
- Multiple PDF layouts (classic / compact / modern).
- Local autosave; export to **Markdown** or **PDF**.

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
npm run smoke      # quick core-logic smoke test (no UI)
npm test           # unit tests (Node built-in runner, no extra deps)
```

## AI (BYOK — Bring Your Own Key)

In the **Settings** tab you choose a provider and model. Two modes:

- **Cloud providers** (OpenAI, Groq, OpenRouter, Together, Mistral) require an API key.
- **Local providers** (LocalAI, Ollama, or a custom local endpoint) work **without any key** —
  the app simply omits the `Authorization` header.
- **No AI at all**: leave it unconfigured and the app runs fully offline using the heuristic generator.

The key (when used) is stored only in your browser's localStorage.

### Example: running locally with Ollama

```bash
ollama serve
ollama pull llama3.1
# In Settings: provider "Ollama", model "llama3.1", no key needed.
```

## Privacy

- Your CV, the offer and settings are never sent to any app server (there is no backend).
- The only outbound network request is the optional call to the AI provider you choose.

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — layers and design decisions.
- [`docs/usage.md`](docs/usage.md) — step-by-step usage guide.
- [`docs/contributing.md`](docs/contributing.md) — how to develop and test.
- [`docs/roadmap.md`](docs/roadmap.md) — milestones.

The core (`src/lib/core`) is independent of the UI and the browser — it is unit-tested and can
later be moved into a separate package / sidecar (e.g. for the planned Tauri desktop build).

## License

MIT — see [`LICENSE.md`](LICENSE.md).
