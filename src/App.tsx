import { ProjectProvider, useProject } from "@/state/useProject"
import { Layout } from "@/components/Layout"
import { StartView } from "@/features/start/StartView"
import { InputView } from "@/features/input/InputView"
import { AnalysisView } from "@/features/analysis/AnalysisView"
import { ResultView } from "@/features/result/ResultView"
import { SettingsView } from "@/features/settings/SettingsView"

function CurrentView() {
  const { step } = useProject()
  switch (step) {
    case "start":
      return <StartView />
    case "input":
      return <InputView />
    case "analysis":
      return <AnalysisView />
    case "result":
      return <ResultView />
    case "settings":
      return <SettingsView />
    default:
      return <StartView />
  }
}

export default function App() {
  return (
    <ProjectProvider>
      <Layout>
        <CurrentView />
      </Layout>
    </ProjectProvider>
  )
}
