import "@testing-library/jest-dom/vitest"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Stepper } from "./Stepper"

const setStep = vi.fn()

vi.mock("@/state/useProject", () => ({
	useProject: () => ({
		step: "input",
		setStep,
		t: (key: string) => key, // i18n: zwracamy klucz, by asercje były stabilne
	}),
}))

describe("Stepper", () => {
	beforeEach(() => setStep.mockClear())

	it("renderuje wszystkie 4 kroki", () => {
		render(<Stepper />)
		for (const key of ["step.start", "step.input", "step.analysis", "step.result"]) {
			expect(screen.getByText(key)).toBeInTheDocument()
		}
	})

	it("zmienia krok po kliknięciu", async () => {
		const user = userEvent.setup()
		render(<Stepper />)
		await user.click(screen.getByText("step.analysis"))
		expect(setStep).toHaveBeenCalledWith("analysis")
	})
})
