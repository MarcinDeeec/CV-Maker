import { useState } from "react"
import { useProject } from "@/state/useProject"
import { SAMPLE_CV, SAMPLE_JOB } from "@/lib/samples"

export function StartView() {
  const {
    setStep,
    setCvText,
    setJobText,
    cvText,
    jobText,
    t,
    projects,
    saveProjectSnapshot,
    loadProjectSnapshot,
    deleteProjectSnapshot,
  } = useProject()
  const [projectName, setProjectName] = useState("")

  const loadExample = () => {
    setCvText(SAMPLE_CV)
    setJobText(SAMPLE_JOB)
    setStep("input")
  }

  return (
    <section className="view">
      <h1>{t("start.title")}</h1>
      <p className="muted">{t("start.intro")}</p>

      <div className="cards">
        <div className="card">
          <h3>{t("start.card_privacy_t")}</h3>
          <p>{t("start.card_privacy_d")}</p>
        </div>
        <div className="card">
          <h3>{t("start.card_byok_t")}</h3>
          <p>{t("start.card_byok_d")}</p>
        </div>
        <div className="card">
          <h3>{t("start.card_honest_t")}</h3>
          <p>{t("start.card_honest_d")}</p>
        </div>
      </div>

      <div className="actions">
        <button className="btn btn--primary" onClick={() => setStep("input")}>
          {cvText || jobText ? t("start.continue") : t("start.new")}
        </button>
        <button className="btn" onClick={loadExample}>
          {t("start.load_example")}
        </button>
      </div>

      <div className="panel">
        <h3>
          {t("start.saved_projects")} ({projects.length})
        </h3>
        <div className="version-save">
          <input
            placeholder={t("start.project_name_ph")}
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
          <button
            className="btn btn--sm"
            disabled={!cvText.trim() && !jobText.trim()}
            onClick={() => {
              saveProjectSnapshot(projectName.trim() || undefined)
              setProjectName("")
            }}
          >
            {t("start.save_project")}
          </button>
        </div>
        {projects.length === 0 ? (
          <p className="muted small">{t("start.no_projects")}</p>
        ) : (
          <ul className="versions">
            {projects.map((p) => (
              <li key={p.id} className="version">
                <span>
                  <strong>{p.name}</strong>{" "}
                  <span className="muted small">
                    · {new Date(p.createdAt).toLocaleString()}
                  </span>
                </span>
                <span className="version__actions">
                  <button
                    className="btn btn--sm"
                    onClick={() => {
                      loadProjectSnapshot(p.id)
                      setStep("input")
                    }}
                  >
                    {t("start.open")}
                  </button>
                  <button className="btn btn--sm" onClick={() => deleteProjectSnapshot(p.id)}>
                    {t("common.delete")}
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
