import "@testing-library/jest-dom/vitest"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

const h = vi.hoisted(() => ({
	state: {
		aiConfig: {
			provider: "openai",
			baseUrl: "https://api.openai.com/v1",
			apiKey: "",
			model: "gpt-4o-mini",
		},
		updateAiConfig: vi.fn(),
		setStep: vi.fn(),
		lang: "pl",
		setLang: vi.fn(),
		t: (key: string) => key,
	},
}))

vi.mock("@/state/useProject", () => ({ useProject: () => h.state }))

import { SettingsView } from "./SettingsView"

beforeEach(() => {
	h.state.aiConfig = {
		provider: "openai",
		baseUrl: "https://api.openai.com/v1",
		apiKey: "",
		model: "gpt-4o-mini",
	}
	h.state.updateAiConfig = vi.fn()
	h.state.setStep = vi.fn()
	h.state.setLang = vi.fn()
})

// Select providera rozpoznajemy po obecności opcji "OpenAI" (językowy select jej nie ma).
function providerSelect() {
	return screen
		.getAllByRole("combobox")
		.find((s) => within(s).queryByText("OpenAI"))!
}

describe("SettingsView", () => {
	it("zapisuje konfigurację i pokazuje potwierdzenie", async () => {
		const user = userEvent.setup()
		render(<SettingsView />)
		expect(screen.queryByText("common.saved")).not.toBeInTheDocument()
		await user.click(screen.getByText("common.save"))
		expect(h.state.updateAiConfig).toHaveBeenCalledWith(
			expect.objectContaining({ provider: "openai", model: "gpt-4o-mini" }),
		)
		expect(screen.getByText("common.saved")).toBeInTheDocument()
	})

	it("lokalny provider ustawia endpoint/model i czyni klucz opcjonalnym", async () => {
		const user = userEvent.setup()
		render(<SettingsView />)
		expect(screen.queryByText("settings.api_key_optional")).not.toBeInTheDocument()
		await user.selectOptions(providerSelect(), "ollama")
		expect(screen.getByText("settings.api_key_optional")).toBeInTheDocument()
		await user.click(screen.getByText("common.save"))
		expect(h.state.updateAiConfig).toHaveBeenCalledWith(
			expect.objectContaining({
				provider: "ollama",
				baseUrl: "http://localhost:11434/v1",
				model: "llama3.1",
			}),
		)
	})

	it("wraca do startu przyciskiem wstecz", async () => {
		const user = userEvent.setup()
		render(<SettingsView />)
		await user.click(screen.getByText("common.back"))
		expect(h.state.setStep).toHaveBeenCalledWith("start")
	})
})
