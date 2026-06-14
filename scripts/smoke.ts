// Szybki test logiki rdzenia bez UI. Uruchom: npm run smoke
import { parseCv } from "../src/lib/core/parsing/parseCv"
import { parseJob } from "../src/lib/core/parsing/parseJob"
import { matchCvToJob } from "../src/lib/core/matching/match"
import {
  buildSuggestions,
  composeCv,
  generateTailoredCv,
} from "../src/lib/core/tailoring/generateCv"
import { SAMPLE_CV, SAMPLE_JOB } from "../src/lib/samples"

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("❌ ASSERT FAILED: " + msg)
    process.exit(1)
  }
}

const cv = parseCv(SAMPLE_CV)
const job = parseJob(SAMPLE_JOB)
const match = matchCvToJob(cv, job)

console.log("Sekcje CV:        ", cv.sections.map((s) => s.id))
console.log("Wynik ważony:     ", Math.round(match.score * 100) + "%")
console.log("Twarde — pasuje:  ", match.breakdown.hard.matched)
console.log("Twarde — braki:   ", match.breakdown.hard.missing)

const suggestions = buildSuggestions(cv, job, match)
console.log("\nSugestie (review-first):")
for (const s of suggestions) {
  console.log(
    `  [${s.accepted ? "x" : " "}] ${s.title} — źródło: ${
      s.evidence ? s.evidence.origin : "brak"
    }`,
  )
}

// Evidence musi być obecne przy sugestiach opartych na CV.
const reorder = suggestions.find((s) => s.id === "reorderSkills")
assert(!!reorder?.evidence && reorder.evidence.origin === "cv", "reorderSkills ma evidence z CV")

// Domyślnie sekcja "Do rozważenia" jest WYŁĄCZONA.
const defaultMd = generateTailoredCv(cv, job, match).markdown
assert(!defaultMd.includes("Do rozważenia"), "domyślnie brak sekcji 'Do rozważenia'")

// Po akceptacji noteMissingHard sekcja pojawia się.
const toggled = suggestions.map((s) =>
  s.id === "noteMissingHard" ? { ...s, accepted: true } : s,
)
const withNote = composeCv(cv, job, match, toggled)
assert(withNote.includes("Do rozważenia"), "po akceptacji pojawia się sekcja 'Do rozważenia'")

// Odrzucenie reorderSkills nie wywala kompozycji.
const noReorder = suggestions.map((s) =>
  s.id === "reorderSkills" ? { ...s, accepted: false } : s,
)
assert(composeCv(cv, job, match, noReorder).includes("## Umiejętności"), "sekcja umiejętności istnieje")

console.log("\nSMOKE TEST OK ✅")
