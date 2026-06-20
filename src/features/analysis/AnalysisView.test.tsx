import "@testing-library/jest-dom/vitest"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

const h = vi.hoisted(() => ({
	state: {
		parsedCv: null as any,
		jobReq: null as any,
		match: null as any,
		generate: vi.fn().mockResolvedValue(undefined),
		generating: false,
		setStep: vi.fn(),
		t: (key: string) => key,
	},
}))

vi.mock("@/state/useProject", () => ({ useProject: () => h.state }))

import { AnalysisView } from "./AnalysisView"

function withData() {
	h.state.parsedCv = { sections: [{ id: "experience", title: "Doświadczenie" }] }
	h.state.jobReq = { hardSkills: ["react", "typescript"], softSkills: [] }
	h.state.match = {
		score: 0.5,
		breakdown: {
			hard: { matched: ["react"], missing: ["typescript"] },
			soft: { matched: [], missing: [] },
		},
	}
}

beforeEach(() => {
	h.state.parsedCv = null
	h.state.jobReq = null
	h.state.match = null
	h.state.generating = false
	h.state.generate = vi.fn().mockResolvedValue(undefined)
	h.state.setStep = vi.fn()
})

describe("AnalysisView", () => {
	it("pokazuje stan pusty i wraca do wprowadzania danych", async () => {
		const user = userEvent.setup()
		render(<AnalysisView />)
		expect(screen.getByText("analysis.need_input")).toBeInTheDocument()
		await user.click(screen.getByText("analysis.back_to_input"))
		expect(h.state.setStep).toHaveBeenCalledWith("input")
	})

	it("renderuje dopasowane i brakujące kompetencje oraz wykryte sekcje", () => {
		withData()
		render(<AnalysisView />)
		expect(screen.getByText("react")).toBeInTheDocument()
		expect(screen.getByText("typescript")).toBeInTheDocument()
		expect(screen.getByText("Doświadczenie")).toBeInTheDocument()
	})

	it("generuje CV i przechodzi do wyniku", async () => {
		withData()
		const user = userEvent.setup()
		render(<AnalysisView />)
		await user.click(screen.getByText("analysis.generate"))
		expect(h.state.generate).toHaveBeenCalledOnce()
		expect(h.state.setStep).toHaveBeenCalledWith("result")
	})
})
