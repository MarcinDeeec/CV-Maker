import type { ParsedCv, JobRequirements, MatchResult } from "../types"
import { normalize, unique } from "../keywords"

// Twarde kompetencje ważą więcej niż miękkie — to one zwykle decydują o przejściu selekcji.
const HARD_WEIGHT = 2
const SOFT_WEIGHT = 1

/**
 * Ważone dopasowanie: porównuje wymagania oferty z CV i liczy osobno
 * twarde i miękkie kompetencje. Wynik to udział trafionej "wagi".
 */
export function matchCvToJob(cv: ParsedCv, job: JobRequirements): MatchResult {
  const cvTerms = unique([
    ...cv.keywords.map(normalize),
    ...cv.skills.map(normalize),
  ])
  const cvSet = new Set(cvTerms)

  const has = (term: string): boolean => {
    const t = normalize(term)
    if (cvSet.has(t)) return true
    return cvTerms.some(
      (c) => c.length >= 4 && t.length >= 4 && (c.includes(t) || t.includes(c)),
    )
  }

  const hardTargets = unique(job.hardSkills.map(normalize))
  const softTargets = unique(job.softSkills.map(normalize))

  const hardMatched = hardTargets.filter(has)
  const hardMissing = hardTargets.filter((t) => !hardMatched.includes(t))
  const softMatched = softTargets.filter(has)
  const softMissing = softTargets.filter((t) => !softMatched.includes(t))

  const totalWeight = hardTargets.length * HARD_WEIGHT + softTargets.length * SOFT_WEIGHT
  const matchedWeight = hardMatched.length * HARD_WEIGHT + softMatched.length * SOFT_WEIGHT
  const score = totalWeight > 0 ? matchedWeight / totalWeight : 0

  return {
    score,
    matched: unique([...hardMatched, ...softMatched]),
    missing: unique([...hardMissing, ...softMissing]),
    breakdown: {
      hard: { matched: hardMatched, missing: hardMissing },
      soft: { matched: softMatched, missing: softMissing },
    },
  }
}
