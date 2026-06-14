import type { JobRequirements } from "../types"
import { extractKeywords, normalize, tokenize, TECH_TERMS } from "../keywords"

const SOFT_SKILLS: string[] = [
  "komunikacja", "komunikatywnosc", "wspolpraca", "teamwork", "communication",
  "leadership", "przywodztwo", "organizacja", "samodzielnosc", "kreatywnosc",
  "analityczne", "problem solving", "rozwiazywanie problemow", "elastycznosc",
  "odpowiedzialnosc", "dokladnosc", "proaktywnosc",
]

/** Wyciąga z oferty obowiązki, twarde i miękkie kompetencje oraz słowa kluczowe. */
export function parseJob(raw: string): JobRequirements {
  const norm = normalize(raw)
  const tokens = new Set(tokenize(raw))

  const hardSkills = TECH_TERMS.filter((t) => tokens.has(t))
  const softSkills = SOFT_SKILLS.filter((s) =>
    s.includes(" ") ? norm.includes(s) : tokens.has(s),
  )
  const keywords = extractKeywords(raw)

  const responsibilities = raw
    .split(/\r?\n/)
    .map((l) => l.replace(/^[\-*•\d.)\s]+/, "").trim())
    .filter((l) => l.length > 12 && l.length < 200)

  return { raw, responsibilities, hardSkills, softSkills, keywords }
}
