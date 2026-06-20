import "@testing-library/jest-dom/vitest"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

// Eksport korzysta z API przeglądarki (Blob/print) — mockujemy, by testy były hermetyczne.
vi.mock("@/lib/export/markdown", () => ({ downloadMarkdown: vi.fn() }))
vi.mock("@/lib/export/pdf", () => ({
	exportPdf: vi.fn(),
	PDF_LAYOUTS: [{ id: "classic", label: "Klasyczny" }],
}))

const h = vi.hoisted(() => ({
	state: {
		tailored: null as any,
		setTailoredMarkdown: vi.fn(),
		toggleSuggestion: vi.fn(),
		error: null as any,
		setStep: vi.fn(),
		generating: false,
		versions: [] as any[],
		saveCurrentVersion: vi.fn(),
		loadVersionIntoEditor: vi.fn(),
		deleteVersion: vi.fn(),
		t: (key: string) => key,
	},
}))

vi.mock("@/state/useProject", () => ({ useProject: () => h.state }))

import { ResultView } from "./ResultView"
import { downloadMarkdown } from "@/lib/export/markdown"
import { exportPdf } from "@/lib/export/pdf"

function withResult() {
	h.state.tailored = {
		markdown: "# CV\n\ntreść",
		aiGenerated: false,
		match: { score: 0.5 },
		suggestions: [
			{
				id: "reorderSkills",
				source: "Sugestia",
				title: "Przestaw umiejętności",
				detail: "Najpierw te dopasowane do oferty.",
				accepted: false,
				evidence: { origin: "cv", label: "Sekcja umiejętności", excerpt: "React, TypeScript" },
			},
		],
	}
	h.state.versions = [
		{ id: "v1", name: "Wersja 1", score: 0.5, createdAt: "2026-06-15T10:00:00.000Z", markdown: "# x" },
	]
}

beforeEach(() => {
	vi.clearAllMocks()
	h.state.tailored = null
	h.state.versions = []
})

describe("ResultView", () => {
	it("pokazuje stan pusty i wraca do analizy", async () => {
		const user = userEvent.setup()
		render(<ResultView />)
		expect(screen.getByText("result.no_result")).toBeInTheDocument()
		await user.click(screen.getByText("result.go_analysis"))
		expect(h.state.setStep).toHaveBeenCalledWith("analysis")
	})

	it("renderuje podgląd, obsługuje edycję i toggle sugestii", async () => {
		withResult()
		const user = userEvent.setup()
		const { container } = render(<ResultView />)
		const textarea = container.querySelector("textarea")!
		expect(textarea).toHaveValue("# CV\n\ntreść")
		fireEvent.change(textarea, { target: { value: "nowa treść" } })
		expect(h.state.setTailoredMarkdown).toHaveBeenCalledWith("nowa treść")
		await user.click(screen.getByRole("checkbox"))
		expect(h.state.toggleSuggestion).toHaveBeenCalledWith("reorderSkills")
	})

	it("zapisuje wersję oraz ładuje/usuwa istniejące", async () => {
		withResult()
		const user = userEvent.setup()
		render(<ResultView />)
		await user.click(screen.getByText("result.save_version"))
		expect(h.state.saveCurrentVersion).toHaveBeenCalled()
		await user.click(screen.getByText("common.load"))
		expect(h.state.loadVersionIntoEditor).toHaveBeenCalledWith("v1")
		await user.click(screen.getByText("common.delete"))
		expect(h.state.deleteVersion).toHaveBeenCalledWith("v1")
	})

	it("eksportuje MD/PDF i przechodzi do listu motywacyjnego", async () => {
		withResult()
		const user = userEvent.setup()
		render(<ResultView />)
		await user.click(screen.getByText("result.export_md"))
		expect(downloadMarkdown).toHaveBeenCalled()
		await user.click(screen.getByText("result.export_pdf"))
		expect(exportPdf).toHaveBeenCalled()
		await user.click(screen.getByText("result.cover_btn"))
		expect(h.state.setStep).toHaveBeenCalledWith("cover")
	})
})
