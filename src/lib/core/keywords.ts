// Pomocnicze funkcje do normalizacji tekstu i wyciągania słów kluczowych.
// Świadomie proste (v0.1) — chodzi o działający pipeline, nie o pełny NLP.

export const STOPWORDS = new Set<string>([
  // PL
  "i", "oraz", "lub", "albo", "w", "we", "na", "do", "od", "z", "ze", "za", "o",
  "u", "po", "przy", "dla", "jako", "jest", "sa", "byc", "ze", "sie", "to", "ten",
  "ta", "te", "tych", "ktory", "ktora", "ktore", "jego", "jej", "ich", "nasz",
  "wasz", "co", "czy", "nie", "tak", "bardzo", "mniej", "wiecej", "ale", "lecz",
  "bo", "gdyz", "jak", "juz", "tylko", "oraz", "przez", "pod", "nad", "sobie",
  // EN
  "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "with", "as",
  "is", "are", "be", "this", "that", "these", "those", "it", "its", "we", "you",
  "they", "our", "your", "their", "not", "yes", "very", "more", "less", "but",
  "so", "such", "at", "by", "from", "will", "can", "have", "has",
])

// Mała baza terminów technicznych wykrywanych wprost w tekście.
export const TECH_TERMS: string[] = [
  "javascript", "typescript", "react", "redux", "next.js", "node.js", "node",
  "python", "django", "flask", "fastapi", "java", "kotlin", "c#", "c++", "go",
  "rust", "php", "ruby", "sql", "postgresql", "mysql", "sqlite", "mongodb",
  "redis", "supabase", "firebase", "graphql", "rest", "api", "html", "css",
  "sass", "tailwind", "vite", "webpack", "docker", "kubernetes", "aws", "gcp",
  "azure", "git", "github", "gitlab", "ci/cd", "linux", "bash", "jest",
  "vitest", "cypress", "playwright", "figma", "agile", "scrum",
]

export const unique = <T,>(arr: T[]): T[] => [...new Set(arr)]

export function stripDiacritics(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

/** Lowercase + bez polskich znaków, żeby dopasowanie było odporne na ogonki. */
export function normalize(text: string): string {
  return stripDiacritics(text.toLowerCase())
}

export function tokenize(text: string): string[] {
  return normalize(text)
    .replace(/[^a-z0-9+#./ ]+/g, " ")
    .split(/\s+/)
    .map((t) => t.replace(/^[.]+|[.]+$/g, ""))
    .filter(Boolean)
}

/**
 * Wyciąga słowa kluczowe: najpierw znane terminy techniczne obecne w tekście,
 * potem najczęstsze tokeny, które nie są stopwordami.
 */
export function extractKeywords(text: string, limit = 40): string[] {
  const tokens = tokenize(text)
  const tokenSet = new Set(tokens)
  const found = new Set<string>()

  // Dopasowanie po całych tokenach, żeby "java" nie trafiało do "javascript".
  for (const term of TECH_TERMS) {
    if (tokenSet.has(term)) found.add(term)
  }

  const freq = new Map<string, number>()
  for (const tok of tokens) {
    if (tok.length < 3) continue
    if (STOPWORDS.has(tok)) continue
    if (/^\d+$/.test(tok)) continue
    freq.set(tok, (freq.get(tok) ?? 0) + 1)
  }

  const sorted = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tok]) => tok)

  for (const tok of sorted) {
    if (found.size >= limit) break
    found.add(tok)
  }

  return [...found]
}
