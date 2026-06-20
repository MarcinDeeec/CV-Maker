import "@testing-library/jest-dom/vitest"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

vi.mock("@/lib/export/markdown", () => ({ downloadMarkdown: vi.fn() }))

const h = vi.hoisted(() => ({
	state: {
		parsedCv: null as any,
		jobReq: null as any,
		match: null as any,
		coverLetter: null as any,
		setCoverLetter: vi.fn(),
		generateCover: vi.fn().mockResolvedValue(undefined),
		coverGenerating: false,
		error: null as any,
		setStep: vi.fn(),
		t: (key: string) => key,
	},
}))

vi.mock("@/state/useProject", () => ({ useProject: () => h.state }))

import { CoverLetterView } from "./CoverLetterView"
import { downloadMarkdown } from "@/lib/export/markdown"

function withData() {
	h.state.parsedCv = { sections: [] }
	h.state.jobReq = {}
	h.state.match = { score: 0.5 }
}

beforeEach(() => {
	vi.clearAllMocks()
	h.state.parsedCv = null
	h.state.jobReq = null
	h.state.match = null
	h.state.coverLetter = null
	h.state.coverGenerating = false
})

describe("CoverLetterView", () => {
	it("pokazuje stan pusty i wraca do wprowadzania danych", async () => {
		const user = userEvent.setup()
		render(<CoverLetterView />)
		expect(screen.getByText("cover.need_input")).toBeInTheDocument()
		await user.click(screen.getByText("analysis.back_to_input"))
		expect(h.state.setStep).toHaveBeenCalledWith("input")
	})

	it("generuje list z wybranym tonem i edytuje treść", async () => {
		withData()
		const user = userEvent.setup()
		const { container } = render(<CoverLetterView />)
		await user.selectOptions(screen.getByRole("combobox"), "friendly")
		await user.click(screen.getByText("cover.generate"))
		expect(h.state.generateCover).toHaveBeenCalledWith("friendly")
		fireEvent.change(container.querySelector("textarea")!, {
			target: { value: "Szanowni Państwo" },
		})
		expect(h.state.setCoverLetter).toHaveBeenCalledWith("Szanowni Państwo")
	})

	it("eksportuje gotowy list i wraca do wyniku", async () => {
		withData()
		h.state.coverLetter = "# List motywacyjny"
		const user = userEvent.setup()
		render(<CoverLetterView />)
		// Gdy list już istnieje, przycisk pokazuje "regenerate".
		expect(screen.getByText("cover.regenerate")).toBeInTheDocument()
		await user.click(screen.getByText("cover.export_md"))
		expect(downloadMarkdown).toHaveBeenCalled()
		await user.click(screen.getByText("cover.back_to_result"))
		expect(h.state.setStep).toHaveBeenCalledWith("result")
	})
})
