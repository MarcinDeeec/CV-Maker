# Usage guide

## 1. Start

Open the app (`npm run dev` → `http://localhost:5173`). On the **Start** screen you can:

- begin a new tailoring session,
- load the built-in example,
- save / open / delete **project snapshots** (a snapshot = your CV text + the job offer text).

Switch the UI language (PL/EN) any time via the header toggle or **Settings**.

## 2. CV & job offer

- Paste your CV, or load a `.txt`, `.md`, or `.docx` file.
- Paste the job offer text.
- Click **Analyze**.

## 3. Analysis

You get a **weighted match score** (hard skills count double) with two breakdowns:

- **Hard skills** — matched vs missing.
- **Soft skills** — matched vs missing.

Detected CV sections are listed too. Only treat "gaps" as things to add **if you genuinely have
that experience** — the tool never invents it for you.

Click **Generate tailored CV**.

## 4. Result

- The left pane is an editable Markdown preview.
- The right pane shows **review-first suggestions** you can accept/reject (with "show source").
  - When AI generated the text, toggles are locked and you edit the text directly.
- Save named **versions**, then load or delete them later.
- Export to **Markdown** or **PDF** (pick a layout: classic / compact / modern).
- Open the **Cover letter** step.

## 5. Cover letter (optional)

- Pick a tone (professional / friendly / concise) and generate.
- The offline version uses **only your matched skills** — no fabrication.
- With AI configured, an AI variant is produced instead; you can still edit it.
- Export to Markdown.

## AI setup (Settings)

1. Choose a **provider**:
   - Cloud (OpenAI, Groq, OpenRouter, Together, Mistral) → paste an **API key**.
   - Local (**LocalAI**, **Ollama**) → **no key needed**; just make sure the local server runs.
   - Custom → enter any OpenAI-compatible endpoint (key optional).
2. Adjust the model if needed.
3. **Save**. The header badge shows `AI: on` / `AI: local` / `AI: offline`.

Everything is stored locally in your browser. Leave it unconfigured to stay fully offline.
