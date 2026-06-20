// Rejestruje matchery jest-dom (np. toBeInTheDocument) w Vitest.
import "@testing-library/jest-dom/vitest"

// Bez globals: true RTL nie rejestruje auto-cleanup — robimy to jawnie,
// żeby DOM był czyszczony między testami (inaczej kolejne render() się kumulują).
import { afterEach } from "vitest"
import { cleanup } from "@testing-library/react"

afterEach(() => {
	cleanup()
})
