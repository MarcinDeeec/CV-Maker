import type { ParsedCv, JobRequirements, MatchResult, TailoredCv, SuggestedChange } from "../types"
import { normalize } from "../keywords"

/**
 * Heurystyczny generator dopasowanego CV (działa BEZ AI).
 * Zasada nadrzędna: nie wymyślamy doświadczenia. Przestawiamy kolejność,
 * podkreślamy to, co już jest, a braki pokazujemy jako sugestie do rozważenia.
 */
export function generateTailoredCv(
  cv: ParsedCv,
  job: JobRequirements,
  match: MatchResult,
): TailoredCv {
  const changes: SuggestedChange[] = []
  const matchedSet = new Set(match.matched)

  // 1. Umiejętności pasujące do oferty na początek.
  const skillsSorted = [...cv.skills].sort((a, b) => {
    const am = matchedSet.has(normalize(a)) ? 0 : 1
    const bm = matchedSet.has(normalize(b)) ? 0 : 1
    return am - bm
  })
  if (cv.skills.length > 0) {
    changes.push({
      type: "reorder",
      source: "job",
      description: "Umiejętności pasujące do oferty przesunięto na początek listy.",
    })
  }

  // 2. Podsumowanie podkreślające wspólne kompetencje.
  const headerSection = cv.sections.find((s) => s.id === "header")
  const summarySection = cv.sections.find((s) => s.id === "summary")
  const experienceSection = cv.sections.find((s) => s.id === "experience")
  const educationSection = cv.sections.find((s) => s.id === "education")
  const otherSections = cv.sections.filter((s) => s.id === "other")

  const baseSummary = (summarySection?.content ?? "").trim()
  const topMatches = match.breakdown.hard.matched.slice(0, 6)
  const matchPhrase = topMatches.length > 0 ? topMatches.join(", ") : "wymaganiami z oferty"
  const tailoredSummary = [
    baseSummary,
    `Dopasowanie do oferty: doświadczenie powiązane z ${matchPhrase}.`,
  ]
    .filter(Boolean)
    .join("\n\n")
  changes.push({
    type: "rewrite",
    source: "ai",
    description: "Podsumowanie podkreśla kompetencje wspólne z ofertą.",
  })

  // 3. Braki twarde (najważniejsze) jako sugestia — bez wymyślania.
  const hardMissing = match.breakdown.hard.missing
  if (hardMissing.length > 0) {
    changes.push({
      type: "add",
      source: "job",
      description: `Kluczowe braki (twarde): ${hardMissing.slice(0, 8).join(", ")}. Dodaj TYLKO jeśli faktycznie masz to doświadczenie.`,
    })
  }

  // 4. Złożenie finalnego dokumentu.
  let md = ""
  if (headerSection) md += headerSection.content.trim() + "\n\n"
  md += "## Podsumowanie\n" + tailoredSummary + "\n\n"
  if (experienceSection) md += "## Doświadczenie\n" + experienceSection.content.trim() + "\n\n"
  md += "## Umiejętności\n" + (skillsSorted.join(", ") || "—") + "\n\n"
  for (const sec of otherSections) {
    md += `## ${sec.title}\n` + sec.content.trim() + "\n\n"
  }
  if (educationSection) md += "## Edukacja\n" + educationSection.content.trim() + "\n"

  return { markdown: md.trim() + "\n", changes, match }
}
