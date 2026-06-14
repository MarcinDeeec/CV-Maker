// Konfiguracja AI w modelu BYOK (Bring Your Own Key).
// Wszystko żyje lokalnie w przeglądarce (localStorage) — klucz nie opuszcza Twojego
// urządzenia, poza wywołaniem do wybranego przez Ciebie dostawcy AI.

export interface AiConfig {
  /** id wybranego presetu providera (np. "openai", "groq", "custom"). */
  provider?: string
  baseUrl: string
  apiKey: string
  model: string
}

export interface AiProviderPreset {
  id: string
  label: string
  baseUrl: string
  defaultModel: string
}

// Gotowe presety dla popularnych endpointów zgodnych z OpenAI API.
// "custom" pozwala wpisać dowolny adres ręcznie (np. firmowy proxy).
export const PROVIDER_PRESETS: AiProviderPreset[] = [
  { id: "openai", label: "OpenAI", baseUrl: "https://api.openai.com/v1", defaultModel: "gpt-4o-mini" },
  { id: "groq", label: "Groq", baseUrl: "https://api.groq.com/openai/v1", defaultModel: "llama-3.1-8b-instant" },
  { id: "openrouter", label: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1", defaultModel: "openai/gpt-4o-mini" },
  { id: "together", label: "Together AI", baseUrl: "https://api.together.xyz/v1", defaultModel: "meta-llama/Llama-3-8b-chat-hf" },
  { id: "mistral", label: "Mistral", baseUrl: "https://api.mistral.ai/v1", defaultModel: "mistral-small-latest" },
  { id: "localai", label: "LocalAI / Ollama (lokalnie)", baseUrl: "http://localhost:8080/v1", defaultModel: "llama3" },
  { id: "custom", label: "Inny (wpisz ręcznie)", baseUrl: "", defaultModel: "" },
]

export function findPreset(id?: string): AiProviderPreset | undefined {
  return PROVIDER_PRESETS.find((p) => p.id === id)
}

const env = ((import.meta as any).env ?? {}) as Record<string, string | undefined>

export const DEFAULT_AI_CONFIG: AiConfig = {
  provider: "openai",
  baseUrl: env.VITE_DEFAULT_AI_BASE_URL ?? "https://api.openai.com/v1",
  apiKey: "",
  model: env.VITE_DEFAULT_AI_MODEL ?? "gpt-4o-mini",
}
