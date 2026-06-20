import "@testing-library/jest-dom/vitest"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

// Kontrolowany mock huba stanu (vi.hoisted, bo vi.mock jest hoistowany ponad importy).
const h = vi.hoisted(() => ({
	state: {
		cvText: "",
		jobText: "",
		setCvText: vi.fn(),
		setJobText: vi.fn(),
		setStep: vi.fn(),
		t: (key: string) => key, // i18n: zwracamy klucz, by asercje były stabilne
	},
}))

vi.mock("@/state/useProject", () => ({ useProject: () => h.state }))

import { InputView } from "./InputView"

beforeEach(() => {
	h.state.cvText = ""
	h.state.jobText = ""
	h.state.setCvText.mockClear()
	h.state.setJobText.mockClear()
	h.state.setStep.mockClear()
})

describe("InputView", () => {
	it("wyłącza 'Analizuj', gdy brakuje CV lub oferty", () => {
		render(<InputView />)
		expect(screen.getByText("input.analyze")).toBeDisabled()
	})

	it("włącza 'Analizuj' i przechodzi do analizy, gdy oba pola wypełnione", async () => {
		h.state.cvText = "Doświadczenie: React, TypeScript"
		h.state.jobText = "Wymagania: React"
		const user = userEvent.setup()
		render(<InputView />)
		const analyze = screen.getByText("input.analyze")
		expect(analyze).toBeEnabled()
		await user.click(analyze)
		expect(h.state.setStep).toHaveBeenCalledWith("analysis")
	})

	it("aktualizuje CV i ofertę przez pola tekstowe", () => {
		render(<InputView />)
		fireEvent.change(screen.getByPlaceholderText("input.cv_ph"), {
			target: { value: "Moje CV" },
		})
		fireEvent.change(screen.getByPlaceholderText("input.job_ph"), {
			target: { value: "Oferta pracy" },
		})
		expect(h.state.setCvText).toHaveBeenCalledWith("Moje CV")
		expect(h.state.setJobText).toHaveBeenCalledWith("Oferta pracy")
	})

	it("wraca do startu przyciskiem wstecz", async () => {
		const user = userEvent.setup()
		render(<InputView />)
		await user.click(screen.getByText("common.back"))
		expect(h.state.setStep).toHaveBeenCalledWith("start")
	})
})
