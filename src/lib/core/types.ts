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

/** Skąd pochodzi sugestia — do pokazania użytkownikowi (evidence mapping). */
export interface Evidence {
  origin: "cv" | "job"
  label: string
  excerpt: string
}

/** Pojedyncza, przełączalna sugestia (review-first). */
export interface Suggestion {
  id: string
  type: "reorderSkills" | "tailorSummary" | "noteMissingHard"
  title: string
  detail: string
  source: ChangeSource
  evidence?: Evidence
  accepted: boolean
}

export interface TailoredCv {
  markdown: string
  suggestions: Suggestion[]
  match: MatchResult
  /** true, gdy treść pochodzi z modelu AI — wtedy przełączniki sugestii są nieaktywne. */
  aiGenerated?: boolean
}

export interface SavedVersion {
  id: string
  name: string
  markdown: string
  score: number
  createdAt: string
}

/** Zapisany projekt (CV + oferta) — wersjonowanie całego projektu. */
export interface ProjectSnapshot {
  id: string
  name: string
  cvText: string
  jobText: string
  createdAt: string
}

export interface StoredProject {
  cvText: string
  jobText: string
  updatedAt?: string
}
