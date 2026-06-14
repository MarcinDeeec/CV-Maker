// Wspólne typy domeny. Warstwa core nie zależy od UI ani od przeglądarki,
// dzięki czemu da się ją testować i w przyszłości przenieść do osobnego pakietu.

export type CvSectionId =
  | "header"
  | "summary"
  | "experience"
  | "skills"
  | "education"
  | "other"

export interface CvSection {
  id: CvSectionId
  title: string
  content: string
}

export interface ParsedCv {
  raw: string
  sections: CvSection[]
  skills: string[]
  keywords: string[]
}

export interface JobRequirements {
  raw: string
  responsibilities: string[]
  hardSkills: string[]
  softSkills: string[]
  keywords: string[]
}

export interface MatchBreakdown {
  matched: string[]
  missing: string[]
}

export interface MatchResult {
  /** Ważony wynik dopasowania w zakresie 0..1 (twarde kompetencje ważą więcej). */
  score: number
  matched: string[]
  missing: string[]
  breakdown: {
    hard: MatchBreakdown
    soft: MatchBreakdown
  }
}

export type ChangeSource = "cv" | "job" | "ai"

export interface SuggestedChange {
  type: "add" | "emphasize" | "reorder" | "rewrite"
  description: string
  source: ChangeSource
}

export interface TailoredCv {
  markdown: string
  changes: SuggestedChange[]
  match: MatchResult
}

export interface StoredProject {
  cvText: string
  jobText: string
  updatedAt?: string
}
