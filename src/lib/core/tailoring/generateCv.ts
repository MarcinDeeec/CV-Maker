import type {
  ParsedCv,
  JobRequirements,
  MatchResult,
  TailoredCv,
  Suggestion,
  CvSectionId,
} from "../types"
import { normalize } from "../keywords"

function findSection(cv: ParsedCv, id: CvSectionId) {
  return cv.sections.find((s) => s.id === id)
}

function excerpt(text: string, max = 180): string {
  const t = text.replace(/\s+/g, " ").trim()
  return t.length > max ? t.slice(0, max) + "…" : t
}

/**
 * Buduje listę przełączalnych sugestii wraz z "dowodem" (evidence) — fragmentem
 * CV lub oferty, na którym sugestia jest oparta. Zasada: nie wymyślamy doświadczenia.
 */
export function buildSuggestions(
  cv: ParsedCv,
  job: JobRequirements,
  match: MatchResult,
): Suggestion[] {
  const out: Suggestion[] = []
  const skillsSection = findSection(cv, "skills")
  const summarySection = findSection(cv, "summary") ?? findSection(cv, "header")

  if (cv.skills.length > 0) {
    out.push({
      id: "reorderSkills",
      type: "reorderSkills",
      source: "job",
      accepted: true,
      title: "Przestaw pasujące umiejętności na początek",
      detail: `Na górze: ${match.matched.slice(0, 6).join(", ") || "—"}`,
      evidence: skillsSection
        ? { origin: "cv", label: skillsSection.title, excerpt: excerpt(skillsSection.content) }
        : undefined,
    })
  }

  out.push({
    id: "tailorSummary",
    type: "tailorSummary",
    source: "ai",
    accepted: true,
    title: "Dopasuj podsumowanie do oferty",
    detail: `Podkreśli: ${match.breakdown.hard.matched.slice(0, 6).join(", ") || "wspólne kompetencje"}`,
    evidence: summarySection
      ? { origin: "cv", label: summarySection.title, excerpt: excerpt(summarySection.content) }
      : undefined,
  })

  if (match.breakdown.hard.missing.length > 0) {
    out.push({
      id: "noteMissingHard",
      type: "noteMissingHard",
      source: "job",
      accepted: false, // domyślnie wyłączone — to dopisek do CV, włącz świadomie
      title: "Dodaj sekcję „Do rozważenia” z brakami",
      detail: `Braki: ${match.breakdown.hard.missing.slice(0, 8).join(", ")}. Dodawaj tylko realne doświadczenie.`,
      evidence: { origin: "job", label: "Oferta — wymagania", excerpt: excerpt(job.raw) },
    })
  }

  return out
}

/** Składa finalny Markdown na podstawie ZAAKCEPTOWANYCH sugestii. */
export function composeCv(
  cv: ParsedCv,
  _job: JobRequirements,
  match: MatchResult,
  suggestions: Suggestion[],
): string {
  const accepted = new Set(suggestions.filter((s) => s.accepted).map((s) => s.id))

  const header = findSection(cv, "header")
  const summary = findSection(cv, "summary")
  const experience = findSection(cv, "experience")
  const education = findSection(cv, "education")
  const others = cv.sections.filter((s) => s.id === "other")

  let skills = [...cv.skills]
  if (accepted.has("reorderSkills")) {
    const matchedSet = new Set(match.matched)
    skills = skills.sort(
      (a, b) =>
        (matchedSet.has(normalize(a)) ? 0 : 1) - (matchedSet.has(normalize(b)) ? 0 : 1),
    )
  }

  let summaryText = (summary?.content ?? "").trim()
  if (accepted.has("tailorSummary")) {
    const top = match.breakdown.hard.matched.slice(0, 6)
    const phrase = top.length > 0 ? top.join(", ") : "wymaganiami z oferty"
    summaryText = [summaryText, `Dopasowanie do oferty: doświadczenie powiązane z ${phrase}.`]
      .filter(Boolean)
      .join("\n\n")
  }

  let md = ""
  if (header) md += header.content.trim() + "\n\n"
  if (summaryText) md += "## Podsumowanie\n" + summaryText + "\n\n"
  if (experience) md += "## Doświadczenie\n" + experience.content.trim() + "\n\n"
  md += "## Umiejętności\n" + (skills.join(", ") || "—") + "\n\n"
  for (const o of others) md += `## ${o.title}\n` + o.content.trim() + "\n\n"
  if (education) md += "## Edukacja\n" + education.content.trim() + "\n"

  if (accepted.has("noteMissingHard") && match.breakdown.hard.missing.length > 0) {
    md += "\n## Do rozważenia (wymagania oferty spoza CV)\n"
    md += match.breakdown.hard.missing
      .map((m) => `- ${m} — dodaj tylko jeśli masz realne doświadczenie`)
      .join("\n")
    md += "\n"
  }

  return md.trim() + "\n"
}

/** Wygodny wrapper: buduje sugestie i składa CV z domyślnymi ustawieniami. */
export function generateTailoredCv(
  cv: ParsedCv,
  job: JobRequirements,
  match: MatchResult,
): TailoredCv {
  const suggestions = buildSuggestions(cv, job, match)
  return { markdown: composeCv(cv, job, match, suggestions), suggestions, match }
}
