# Contributing / development

## Requirements

- Node.js 18+ (Node 24 recommended; the test runner uses built-in `node:test`).
- No global tooling needed beyond `npm install`.

## Commands

```bash
npm install        # install dependencies
npm run dev        # start Vite dev server
npm run build      # type-check + production build
npm run typecheck  # tsc --noEmit
npm run smoke      # quick end-to-end core check (no UI)
npm test           # unit tests (tsx --test test/core.test.ts)
```

## Project conventions

- **Keep `src/lib/core` pure.** No React, no `window`, no `fetch`, no `localStorage` there.
  Anything browser-specific belongs in `state/`, `features/`, or the `import`/`export`/`storage` libs.
- **Add core logic with a test.** New parsing/matching/tailoring behaviour should get a case in
  `test/core.test.ts`. Tests must run offline with zero extra dependencies.
- **i18n:** every user-facing string goes through `t("key")` and must exist in **both** `pl` and `en`
  dictionaries in `src/lib/i18n/translations.ts`. `translate()` falls back to PL, then to the key.
- **No fabrication.** Generation (heuristic and prompts) must never invent experience the user
  doesn't have. This is a core product rule.

## Adding an AI provider

Add an entry to `PROVIDER_PRESETS` in `src/lib/ai/config.ts`:

```ts
{ id: "myprovider", label: "My Provider", baseUrl: "https://...", defaultModel: "...", requiresKey: true }
```

Set `requiresKey: false` for local/keyless endpoints. The Settings UI and the
`isAiConfigured` / `providerRequiresKey` helpers pick it up automatically.

## Tests

`test/core.test.ts` covers normalization, tokenization, keyword extraction, CV/job parsing,
weighted matching, review-first suggestions, cover-letter generation, DOCX text extraction and
Markdown→HTML conversion. Run `npm test` before opening a PR.

## Commit style

Conventional-ish messages help, e.g. `feat: ...`, `fix: ...`, `docs: ...`, `test: ...`.
