// Szybki test dymny rdzenia (bez UI). Uruchom: npm run smoke
import { parseCv } from "../src/lib/core/parsing/parseCv"
import { parseJob } from "../src/lib/core/parsing/parseJob"
import { matchCvToJob } from "../src/lib/core/matching/match"
import { generateTailoredCv } from "../src/lib/core/tailoring/generateCv"
import { mdToHtml } from "../src/lib/export/pdf"
import { SAMPLE_CV, SAMPLE_JOB } from "../src/lib/samples"

const cv = parseCv(SAMPLE_CV)
const job = parseJob(SAMPLE_JOB)
const match = matchCvToJob(cv, job)
const tailored = generateTailoredCv(cv, job, match)

console.log("Sekcje CV:        ", cv.sections.map((s) => s.id))
console.log("Umiejętności CV:  ", cv.skills)
console.log("Wynik ważony:     ", `${Math.round(match.score * 100)}%`)
console.log("Twarde — pasuje:  ", match.breakdown.hard.matched)
console.log("Twarde — braki:   ", match.breakdown.hard.missing)
console.log("Miękkie — pasuje: ", match.breakdown.soft.matched)
console.log("Zmiany:")
for (const c of tailored.changes) console.log("  -", c.description)
console.log("\n---- HTML (PDF) podgląd ----")
console.log(mdToHtml(tailored.markdown).slice(0, 240))

if (cv.sections.length === 0) throw new Error("FAIL: brak sekcji CV")
if (job.hardSkills.length === 0) throw new Error("FAIL: brak hard skills")
if (match.breakdown.hard.matched.length === 0) throw new Error("FAIL: brak dopasowań twardych")
if (!tailored.markdown.includes("## Umiejętności")) throw new Error("FAIL: zły markdown")
if (!mdToHtml(tailored.markdown).includes("<h2>")) throw new Error("FAIL: zły HTML do PDF")
console.log("\nSMOKE TEST OK ✅")
