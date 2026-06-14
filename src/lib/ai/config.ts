// Konfiguracja AI w modelu BYOK (Bring Your Own Key).
// Wszystko żyje lokalnie w przeglądarce (localStorage) — klucz nie opuszcza Twojego
// urządzenia, poza wywołaniem do wybranego przez Ciebie dostawcy AI.

export interface AiConfig {
  /** id wybranego presetu providera (np. "openai", "ollama", "custom"). */
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
  /** false dla lokalnych endpointów, które nie wymagają klucza API. Domyślnie true. */
  requiresKey?: boolean
}

// Gotowe presety dla popularnych endpointów zgodnych z OpenAI API.
// "custom" pozwala wpisać dowolny adres ręcznie (np. firmowy proxy lub lokalny model).
export const PROVIDER_PRESETS: AiProviderPreset[] = [
  { id: "openai", label: "OpenAI", baseUrl: "https://api.openai.com/v1", defaultModel: "gpt-4o-mini", requiresKey: true },
  { id: "groq", label: "Groq", baseUrl: "https://api.groq.com/openai/v1", defaultModel: "llama-3.1-8b-instant", requiresKey: true },
  { id: "openrouter", label: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1", defaultModel: "openai/gpt-4o-mini", requiresKey: true },
  { id: "together", label: "Together AI", baseUrl: "https://api.together.xyz/v1", defaultModel: "meta-llama/Llama-3-8b-chat-hf", requiresKey: true },
  { id: "mistral", label: "Mistral", baseUrl: "https://api.mistral.ai/v1", defaultModel: "mistral-small-latest", requiresKey: true },
  { id: "localai", label: "LocalAI (lokalnie, bez klucza)", baseUrl: "http://localhost:8080/v1", defaultModel: "llama3", requiresKey: false },
  { id: "ollama", label: "Ollama (lokalnie, bez klucza)", baseUrl: "http://localhost:11434/v1", defaultModel: "llama3.1", requiresKey: false },
  { id: "custom", label: "Inny (wpisz ręcznie)", baseUrl: "", defaultModel: "", requiresKey: false },
]

export function findPreset(id?: string): AiProviderPreset | undefined {
  return PROVIDER_PRESETS.find((p) => p.id === id)
}

/** Czy wybrany provider wymaga klucza API? Nieznany provider traktujemy jak chmurowy (bezpieczniej). */
export function providerRequiresKey(config: AiConfig): boolean {
  const preset = findPreset(config.provider)
  if (!preset) return true
  return preset.requiresKey !== false
}

/** Lokalny provider = nie wymaga klucza (LocalAI / Ollama / custom local). */
export function isLocalProvider(config: AiConfig): boolean {
  return !providerRequiresKey(config)
}

/**
 * Czy AI jest gotowe do użycia? Wymaga endpointu i modelu; klucz tylko dla
 * providerów chmurowych. Dzięki temu LocalAI/Ollama działają bez klucza.
 */
export function isAiConfigured(config: AiConfig): boolean {
  if (!config.baseUrl.trim() || !config.model.trim()) return false
  if (providerRequiresKey(config)) return config.apiKey.trim().length > 0
  return true
}

const env = ((import.meta as any).env ?? {}) as Record<string, string | undefined>

export const DEFAULT_AI_CONFIG: AiConfig = {
  provider: "openai",
  baseUrl: env.VITE_DEFAULT_AI_BASE_URL ?? "https://api.openai.com/v1",
  apiKey: "",
  model: env.VITE_DEFAULT_AI_MODEL ?? "gpt-4o-mini",
}
