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

/** Zamienia kod HTTP na czytelną wskazówkę dla użytkownika. */
function friendlyHttpError(status: number, detail: string): string {
  const tail = detail ? ` — ${detail.slice(0, 120)}` : ""
  if (status === 401 || status === 403)
    return `Klucz API odrzucony lub brak uprawnień (HTTP ${status}). Sprawdź klucz w Ustawieniach.`
  if (status === 404)
    return `Nie znaleziono endpointu lub modelu (HTTP 404). Sprawdź adres i nazwę modelu.${tail}`
  if (status === 429) return `Przekroczony limit zapytań (HTTP 429). Spróbuj ponownie za chwilę.`
  if (status >= 500) return `Błąd po stronie dostawcy AI (HTTP ${status}). Spróbuj później.${tail}`
  return `HTTP ${status}${tail}`
}

/**
 * Wywołanie dowolnego endpointu zgodnego z OpenAI API (chat completions).
 * Działa z OpenAI, Groq, OpenRouter, Together, Mistral, a także z lokalnymi
 * silnikami typu LocalAI/Ollama-compat.
 */
export async function generateWithAi(
  cvText: string,
  jobText: string,
  config: AiConfig,
): Promise<{ markdown: string }> {
  if (!config.apiKey.trim()) throw new Error("Brak klucza API")
  if (!config.baseUrl.trim()) throw new Error("Brak adresu endpointu (Ustawienia).")

  let res: Response
  try {
    res = await fetch(`${config.baseUrl.replace(/\/$/, "")}/chat/completions`, {
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
  } catch {
    throw new Error("Nie udało się połączyć z endpointem AI. Sprawdź adres URL i połączenie sieciowe.")
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new Error(friendlyHttpError(res.status, detail))
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const markdown = data.choices?.[0]?.message?.content
  if (!markdown) throw new Error("Pusta odpowiedź modelu")
  return { markdown }
}
