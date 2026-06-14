# Architecture

CV Tailor is a **local-first**, browser-only app. There is no backend; the only outbound
request is the optional call to a user-chosen AI provider.

## Layers

```
src/
  lib/
    core/          ← pure domain logic (no UI, no browser APIs)
      keywords.ts        normalization, tokenization, keyword extraction
      parsing/           parseCv, parseJob
      matching/          weighted CV ↔ job matching
      tailoring/         generateCv (review-first), coverLetter
      types.ts           shared domain types
    ai/            ← BYOK client + provider presets (OpenAI-compatible)
    import/        ← DOCX reader (dependency-free, browser DecompressionStream)
    export/        ← Markdown + PDF (print) exporters
    i18n/          ← PL/EN dictionaries + translate()
    storage/       ← localStorage persistence
    samples.ts     ← example CV + job offer
  state/           ← React context hub (useProject) wiring everything together
  features/        ← one folder per step view (start, input, analysis, result, cover, settings)
  components/      ← Layout, Stepper
  styles/          ← global.css
```

## Key design decisions

- **Core is pure and isolated.** `src/lib/core` never imports React or touches `window`,
  `localStorage`, or `fetch`. This keeps it unit-testable (`npm test`) and portable — it can be
  reused later in a Tauri sidecar or a CLI without changes.
- **Single state hub.** `useProject` (React context) is the only place that combines core logic,
  AI calls, persistence and i18n. Views stay thin and declarative.
- **Review-first generation.** The offline heuristic produces individually toggleable suggestions
  with evidence mapping. When AI is used, the model output is shown as editable text and the
  toggles are locked (the user edits manually).
- **BYOK, never fabricate.** Prompts forbid inventing experience. Local providers (LocalAI/Ollama)
  need no key; cloud providers do. See `lib/ai/config.ts` (`isAiConfigured`, `providerRequiresKey`).
- **Dependency-free where it matters.** DOCX import uses the browser's `DecompressionStream`;
  PDF export uses the browser's print dialog; tests use Node's built-in `node:test` runner.

## Data flow (happy path)

1. `InputView` collects CV + job text → stored via `storage/localStore`.
2. `useProject` derives `parsedCv`, `jobReq`, `match` (memoized) from the core.
3. `AnalysisView` renders the weighted score and breakdown.
4. `generate()` builds a tailored CV (heuristic, optionally replaced by AI output).
5. `ResultView` lets the user edit, accept/reject suggestions, save versions, export.
6. `CoverLetterView` optionally produces a cover letter from matched skills only.

## Persistence keys (localStorage)

| Key | Purpose |
|-----|---------|
| `cv-tailor:project` | current CV + job text |
| `cv-tailor:ai-config` | provider / endpoint / model / key |
| `cv-tailor:versions` | saved tailored-CV versions |
| `cv-tailor:projects` | saved whole-project snapshots |
| `cv-tailor:lang` | UI language (pl/en) |
