// Konfiguracja AI w modelu BYOK (Bring Your Own Key).
// W v0.1 wszystko żyje lokalnie w przeglądarce (localStorage) — klucz nie opuszcza Twojego urządzenia,
// poza wywołaniem do wybranego przez Ciebie dostawcy AI.

export interface AiConfig {
  baseUrl: string
  apiKey: string
  model: string
}

const env = ((import.meta as any).env ?? {}) as Record<string, string | undefined>

export const DEFAULT_AI_CONFIG: AiConfig = {
  baseUrl: env.VITE_DEFAULT_AI_BASE_URL ?? "https://api.openai.com/v1",
  apiKey: "",
  model: env.VITE_DEFAULT_AI_MODEL ?? "gpt-4o-mini",
}
