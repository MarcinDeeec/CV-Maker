// Szybki test dymny rdzenia (bez UI). Uruchom: npm run smoke
import { parseCv } from "../src/lib/core/parsing/parseCv"
import { parseJob } from "../src/lib/core/parsing/parseJob"
import { matchCvToJob } from "../src/lib/core/matching/match"
import { generateTailoredCv } from "../src/lib/core/tailoring/generateCv"
import { SAMPLE_CV, SAMPLE_JOB } from "../src/lib/samples"

const cv = parseCv(SAMPLE_CV)
const job = parseJob(SAMPLE_JOB)
const match = matchCvToJob(cv, job)
const tailored = generateTailoredCv(cv, job, match)

console.log("Sekcje CV:      ", cv.sections.map((s) => s.id))
console.log("Umiejętności CV:", cv.skills)
console.log("Hard skills:    ", job.hardSkills)
console.log("Score:          ", match.score.toFixed(2))
console.log("Matched:        ", match.matched)
console.log("Missing:        ", match.missing)
console.log("Zmiany:")
for (const c of tailored.changes) console.log("  -", c.description)
console.log("\n---- Markdown (podgląd) ----")
console.log(tailored.markdown.slice(0, 500))

if (cv.sections.length === 0) throw new Error("FAIL: brak sekcji CV")
if (job.hardSkills.length === 0) throw new Error("FAIL: brak hard skills")
if (match.matched.length === 0) throw new Error("FAIL: brak dopasowań")
if (!tailored.markdown.includes("## Umiejętności")) throw new Error("FAIL: zły markdown")
console.log("\nSMOKE TEST OK ✅")
