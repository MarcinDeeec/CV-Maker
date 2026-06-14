import type { AiConfig } from "./config"
import type { CoverTone, CoverLang } from "../core/tailoring/coverLetter"

// Strażnik jakości: model ma przepisywać, a nie zmyślać.
export const SYSTEM_PROMPT = `Jesteś ekspertem od rekrutacji i dopasowywania CV pod konkretną ofertę pracy.
ZASADY (krytyczne, nadrzędne):
- NIE wymyślaj doświadczenia, projektów, narzędzi ani umiejętności, których nie ma w CV.
- Możesz przeredagować, uporządkować, skondensować i podkreślić to, co już jest.
- Naturalnie wplać słowa kluczowe z oferty, ale TYLKO jeśli odpowiadają realnym doświadczeniom z CV.
- Jeśli oferta wymaga czegoś, czego nie ma w CV, NIE dopisuj tego jako fakt.
- Pisz zwięźle, konkretnie, językiem rezultatów; unikaj pustych frazesów i "AI fluff".
- Zachowaj język oryginalnego CV i sensowną strukturę sekcji (Markdown: nagłówki ##, listy -).
Zwróć WYŁĄCZNIE gotowe CV w formacie Markdown, bez komentarzy.`

export const SYSTEM_PROMPT_COVER = `Jesteś ekspertem od pisania krótkich, konkretnych listów motywacyjnych.
ZASADY (krytyczne):
- NIE wymyślaj faktów — opieraj się wyłącznie na treści CV i wymaganiach oferty.
- Długość ok. 150–220 słów, 3–4 akapity.
- Konkretnie powiąż realne kompetencje kandydata z wymaganiami z oferty.
- Unikaj frazesów; ton dostosuj do instrukcji użytkownika.
Zwróć WYŁĄCZNIE treść listu (Markdown/zwykły tekst), bez komentarzy.`

export function buildUserPrompt(cvText: string, jobText: string): string {
  return [
    "### Obecne CV",
    cvText,
    "",
    "### Oferta pracy",
    jobText,
    "",
    "### Zadanie",
    "Przepisz CV tak, aby lepiej pasowało do oferty, trzymając się zasad systemowych. " +
      "Zachowaj prawdziwość treści. Zwróć sam Markdown.",
  ].join("\n")
}

const TONE_HINT_PL: Record<CoverTone, string> = {
  professional: "ton profesjonalny i rzeczowy",
  friendly: "ton ciepły i przyjazny, ale wciąż profesjonalny",
  concise: "ton bardzo zwięzły, maks. 3 krótkie akapity",
}
const TONE_HINT_EN: Record<CoverTone, string> = {
  professional: "a professional, matter-of-fact tone",
  friendly: "a warm, friendly yet professional tone",
  concise: "a very concise tone, max 3 short paragraphs",
}

export function buildCoverLetterPrompt(
  cvText: string,
  jobText: string,
  tone: CoverTone,
  lang: CoverLang,
): string {
  const langLine =
    lang === "en" ? "Write the letter in English." : "Napisz list w języku polskim."
  const toneLine = lang === "en" ? `Use ${TONE_HINT_EN[tone]}.` : `Zastosuj ${TONE_HINT_PL[tone]}.`
  return [
    "### CV",
    cvText,
    "",
    "### Oferta / Job offer",
    jobText,
    "",
    "### Zadanie / Task",
    langLine,
    toneLine,
    lang === "en"
      ? "Base the letter only on real skills present in the CV that match the offer."
      : "Oprzyj list wyłącznie na realnych kompetencjach z CV, które pasują do oferty.",
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

/** Wspólne wywołanie chat-completions (OpenAI-compatible). */
async function callChat(config: AiConfig, system: string, user: string): Promise<string> {
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
          { role: "system", content: system },
          { role: "user", content: user },
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
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error("Pusta odpowiedź modelu")
  return content
}

/** Generuje dopasowane CV przez dowolny endpoint zgodny z OpenAI API. */
export async function generateWithAi(
  cvText: string,
  jobText: string,
  config: AiConfig,
): Promise<{ markdown: string }> {
  const markdown = await callChat(config, SYSTEM_PROMPT, buildUserPrompt(cvText, jobText))
  return { markdown }
}

/** Generuje list motywacyjny przez AI. */
export async function generateCoverLetterWithAi(
  cvText: string,
  jobText: string,
  config: AiConfig,
  opts: { tone: CoverTone; lang: CoverLang },
): Promise<{ markdown: string }> {
  const markdown = await callChat(
    config,
    SYSTEM_PROMPT_COVER,
    buildCoverLetterPrompt(cvText, jobText, opts.tone, opts.lang),
  )
  return { markdown }
}
