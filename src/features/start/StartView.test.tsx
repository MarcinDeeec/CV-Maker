import "@testing-library/jest-dom/vitest"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

const h = vi.hoisted(() => ({
	state: {
		setStep: vi.fn(),
		setCvText: vi.fn(),
		setJobText: vi.fn(),
		cvText: "",
		jobText: "",
		t: (key: string) => key,
		projects: [] as any[],
		saveProjectSnapshot: vi.fn(),
		loadProjectSnapshot: vi.fn(),
		deleteProjectSnapshot: vi.fn(),
	},
}))

vi.mock("@/state/useProject", () => ({ useProject: () => h.state }))

import { StartView } from "./StartView"

beforeEach(() => {
	vi.clearAllMocks()
	h.state.cvText = ""
	h.state.jobText = ""
	h.state.projects = []
})

describe("StartView", () => {
	it("pusty stan: 'Nowy' przechodzi do inputu, a przykład wczytuje dane", async () => {
		const user = userEvent.setup()
		render(<StartView />)
		await user.click(screen.getByText("start.new"))
		expect(h.state.setStep).toHaveBeenCalledWith("input")
		await user.click(screen.getByText("start.load_example"))
		expect(h.state.setCvText).toHaveBeenCalled()
		expect(h.state.setJobText).toHaveBeenCalled()
		expect(h.state.setStep).toHaveBeenCalledWith("input")
	})

	it("pokazuje 'Kontynuuj', gdy są już dane", () => {
		h.state.cvText = "Moje CV"
		render(<StartView />)
		expect(screen.getByText("start.continue")).toBeInTheDocument()
		expect(screen.queryByText("start.new")).not.toBeInTheDocument()
	})

	it("zapisuje, otwiera i usuwa snapshoty projektu", async () => {
		// Przycisk "Zapisz projekt" jest aktywny tylko, gdy jest jakaś treść CV/oferty.
		h.state.cvText = "Moje CV"
		h.state.projects = [
			{
				id: "p1",
				name: "Projekt 1",
				cvText: "x",
				jobText: "y",
				createdAt: "2026-06-15T10:00:00.000Z",
			},
		]
		const user = userEvent.setup()
		render(<StartView />)
		await user.click(screen.getByText("start.save_project"))
		expect(h.state.saveProjectSnapshot).toHaveBeenCalled()
		await user.click(screen.getByText("start.open"))
		expect(h.state.loadProjectSnapshot).toHaveBeenCalledWith("p1")
		expect(h.state.setStep).toHaveBeenCalledWith("input")
		await user.click(screen.getByText("common.delete"))
		expect(h.state.deleteProjectSnapshot).toHaveBeenCalledWith("p1")
	})
})
