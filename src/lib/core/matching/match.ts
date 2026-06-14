import type { ParsedCv, JobRequirements, MatchResult } from "../types"
import { normalize, unique } from "../keywords"

/**
 * Proste dopasowanie: porównuje wymagania oferty (twarde + słowa kluczowe)
 * z umiejętnościami i słowami kluczowymi z CV.
 */
export function matchCvToJob(cv: ParsedCv, job: JobRequirements): MatchResult {
  const cvTerms = unique([
    ...cv.keywords.map(normalize),
    ...cv.skills.map(normalize),
  ])
  const cvSet = new Set(cvTerms)

  // Cel dopasowania = konkretne wymagania oferty (twarde + miękkie),
  // a nie wszystkie wyrazy — to ogranicza szum w wynikach.
  const targets = unique([...job.hardSkills, ...job.softSkills].map(normalize))

  const has = (term: string): boolean => {
    if (cvSet.has(term)) return true
    // ostrożne częściowe dopasowanie (np. "react" vs "react.js")
    return cvTerms.some(
      (c) => c.length >= 4 && term.length >= 4 && (c.includes(term) || term.includes(c)),
    )
  }

  const matched = unique(targets.filter(has))
  const missing = unique(targets.filter((t) => !matched.includes(t)))
  const score = targets.length > 0 ? matched.length / targets.length : 0

  return { score, matched, missing }
}
