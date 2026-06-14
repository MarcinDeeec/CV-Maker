import type { AiConfig } from "./config"

// Strażnik jakości: model ma przepisywać, a nie zmyślać.
export const SYSTEM_PROMPT = `Jesteś asystentem do dopasowywania CV pod konkretną ofertę pracy.
ZASADY (krytyczne):
- Nie wymyślaj doświadczenia ani umiejętności, których nie ma w CV.
- Możesz przeredagować, uporządkować i podkreślić to, co już jest.
- Jeśli oferta wymaga czegoś, czego nie ma w CV, NIE dopisuj tego jako fakt.
- Pisz zwięźle, konkretnie, bez "AI fluff".
- Zachowaj język oryginalnego CV.
Zwróć wyłącznie gotowe CV w formacie Markdown.`

export function buildUserPrompt(cvText: string, jobText: string): string {
  return [
    "### Obecne CV",
    cvText,
    "",
    "### Oferta pracy",
    jobText,
    "",
    "### Zadanie",
    "Przepisz CV tak, aby lepiej pasowało do oferty, trzymając się zasad. Zwróć sam Markdown.",
  ].join("\n")
}

/**
 * Wywołanie dowolnego endpointu zgodnego z OpenAI API (chat completions).
 * Działa z OpenAI, ale też z lokalnymi silnikami typu LocalAI/Ollama-compat.
 */
export async function generateWithAi(
  cvText: string,
  jobText: string,
  config: AiConfig,
): Promise<{ markdown: string }> {
  if (!config.apiKey.trim()) throw new Error("Brak klucza API")

  const res = await fetch(`${config.baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0.3,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(cvText, jobText) },
      ],
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new Error(`HTTP ${res.status} ${detail.slice(0, 120)}`)
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const markdown = data.choices?.[0]?.message?.content
  if (!markdown) throw new Error("Pusta odpowiedź modelu")
  return { markdown }
}
