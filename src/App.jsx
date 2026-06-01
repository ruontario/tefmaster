import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'tefmaster-content'

const examSections = [
  {
    id: 'expression-orale',
    title: 'Expression orale',
    shortTitle: 'Oral',
    objective:
      "Mesurer votre capacité à communiquer à l'oral avec un interlocuteur.",
    content: '2 sections',
    duration: '15 minutes au total',
    format: "L'épreuve comporte deux sections, A et B.",
    parts: [
      {
        label: 'Section A',
        duration: '5 minutes',
        task: 'Obtenir des renseignements',
      },
      {
        label: 'Section B',
        duration: '10 minutes',
        task: 'Argumenter pour convaincre',
      },
    ],
  },
  {
    id: 'expression-ecrite',
    title: 'Expression écrite',
    shortTitle: 'Écrit',
    objective: "Mesurer votre capacité à vous exprimer en français à l'écrit.",
    content: '2 sections',
    duration: '1 heure',
    format: "L'épreuve comporte deux sections, A et B.",
    parts: [
      {
        label: 'Section A',
        duration: '25 minutes',
        task: "Écrire la suite d'un article",
        requirement: '80 mots minimum',
      },
      {
        label: 'Section B',
        duration: '35 minutes',
        task: 'Exprimer son point de vue et le justifier',
        requirement: '200 mots minimum',
      },
    ],
  },
  {
    id: 'comprehension-ecrite',
    title: 'Compréhension écrite',
    shortTitle: 'Lecture',
    objective: 'Mesurer votre capacité à lire et à comprendre des documents écrits.',
    content: '40 questions',
    duration: '1 heure',
    format: 'Questionnaire à choix multiples (QCM)',
    scoring: [
      'Bonne réponse = 1 point',
      'Pas de réponse / Mauvaise réponse = 0 point',
    ],
  },
  {
    id: 'comprehension-orale',
    title: 'Compréhension orale',
    shortTitle: 'Écoute',
    objective:
      'Mesurer votre capacité à comprendre le français parlé en écoutant des documents sonores.',
    content: '40 questions',
    duration: '40 minutes',
    format: 'Questionnaire à choix multiples (QCM)',
    scoring: [
      'Bonne réponse = 1 point',
      'Pas de réponse / Mauvaise réponse = 0 point',
    ],
  },
]

const emptyDraft = {
  title: '',
  type: 'Sujet',
  notes: '',
}

function loadSavedContent() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : {}
  } catch {
    return {}
  }
}

function App() {
  const [contentBySection, setContentBySection] = useState(loadSavedContent)
  const [drafts, setDrafts] = useState({})

  const totalResources = useMemo(
    () =>
      Object.values(contentBySection).reduce(
        (total, items) => total + items.length,
        0,
      ),
    [contentBySection],
  )

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(contentBySection))
  }, [contentBySection])

  function updateDraft(sectionId, field, value) {
    setDrafts((current) => ({
      ...current,
      [sectionId]: {
        ...emptyDraft,
        ...current[sectionId],
        [field]: value,
      },
    }))
  }

  function addResource(sectionId) {
    const draft = { ...emptyDraft, ...drafts[sectionId] }
    const title = draft.title.trim()
    const notes = draft.notes.trim()

    if (!title || !notes) {
      return
    }

    setContentBySection((current) => ({
      ...current,
      [sectionId]: [
        ...(current[sectionId] || []),
        {
          id: crypto.randomUUID(),
          title,
          type: draft.type,
          notes,
          createdAt: new Date().toISOString(),
        },
      ],
    }))
    setDrafts((current) => ({
      ...current,
      [sectionId]: emptyDraft,
    }))
  }

  function removeResource(sectionId, resourceId) {
    setContentBySection((current) => ({
      ...current,
      [sectionId]: (current[sectionId] || []).filter(
        (resource) => resource.id !== resourceId,
      ),
    }))
  }

  return (
    <main>
      <header className="hero">
        <nav className="topbar" aria-label="Sections TEF Canada">
          <a className="brand" href="#top" aria-label="TEF Master accueil">
            TEF Master
          </a>
          <div className="nav-links">
            {examSections.map((section) => (
              <a key={section.id} href={`#${section.id}`}>
                {section.shortTitle}
              </a>
            ))}
          </div>
        </nav>

        <section id="top" className="hero-content">
          <p className="eyebrow">Préparation TEF Canada</p>
          <h1>Organisez vos contenus par épreuve.</h1>
          <p className="hero-copy">
            Centralisez les sujets, consignes, notes de cours et exercices pour
            les quatre sections principales de l'examen TEF Canada.
          </p>
          <div className="hero-stats" aria-label="Resume du site">
            <span>
              <strong>4</strong> sections
            </span>
            <span>
              <strong>{totalResources}</strong> contenus ajoutés
            </span>
          </div>
        </section>
      </header>

      <section className="section-grid" aria-label="Aperçu des épreuves">
        {examSections.map((section) => (
          <a className="summary-card" href={`#${section.id}`} key={section.id}>
            <span>{section.shortTitle}</span>
            <strong>{section.title}</strong>
            <small>{section.duration}</small>
          </a>
        ))}
      </section>

      <div className="exam-sections">
        {examSections.map((section) => {
          const draft = { ...emptyDraft, ...drafts[section.id] }
          const resources = contentBySection[section.id] || []

          return (
            <section className="exam-section" id={section.id} key={section.id}>
              <div className="section-heading">
                <p className="eyebrow">{section.shortTitle}</p>
                <h2>{section.title}</h2>
                <p>{section.objective}</p>
              </div>

              <div className="details">
                <div>
                  <span>Contenu</span>
                  <strong>{section.content}</strong>
                </div>
                <div>
                  <span>Durée</span>
                  <strong>{section.duration}</strong>
                </div>
                <div>
                  <span>Format</span>
                  <strong>{section.format}</strong>
                </div>
              </div>

              {section.parts && (
                <div className="part-list">
                  {section.parts.map((part) => (
                    <article className="part-card" key={part.label}>
                      <span>{part.label}</span>
                      <h3>{part.task}</h3>
                      <p>{part.duration}</p>
                      {part.requirement && <small>{part.requirement}</small>}
                    </article>
                  ))}
                </div>
              )}

              {section.scoring && (
                <div className="scoring">
                  <span>Barème</span>
                  <ul>
                    {section.scoring.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="content-panel">
                <div className="panel-heading">
                  <h3>Ajouter du contenu</h3>
                  <p>
                    Ajoutez vos sujets, exercices, corrections, liens ou notes
                    pour cette épreuve.
                  </p>
                </div>

                <form
                  className="content-form"
                  onSubmit={(event) => {
                    event.preventDefault()
                    addResource(section.id)
                  }}
                >
                  <label>
                    Titre
                    <input
                      value={draft.title}
                      onChange={(event) =>
                        updateDraft(section.id, 'title', event.target.value)
                      }
                      placeholder="Ex. Sujet type 1"
                    />
                  </label>
                  <label>
                    Type
                    <select
                      value={draft.type}
                      onChange={(event) =>
                        updateDraft(section.id, 'type', event.target.value)
                      }
                    >
                      <option>Sujet</option>
                      <option>Consigne</option>
                      <option>Exercice</option>
                      <option>Correction</option>
                      <option>Lien</option>
                      <option>Note</option>
                    </select>
                  </label>
                  <label className="wide">
                    Notes
                    <textarea
                      value={draft.notes}
                      onChange={(event) =>
                        updateDraft(section.id, 'notes', event.target.value)
                      }
                      placeholder="Collez ici le contenu ou une description."
                      rows="4"
                    />
                  </label>
                  <button type="submit">Ajouter</button>
                </form>

                <div className="resource-list">
                  {resources.length === 0 ? (
                    <p className="empty-state">Aucun contenu ajouté.</p>
                  ) : (
                    resources.map((resource) => (
                      <article className="resource-card" key={resource.id}>
                        <div>
                          <span>{resource.type}</span>
                          <h4>{resource.title}</h4>
                          <p>{resource.notes}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeResource(section.id, resource.id)}
                        >
                          Supprimer
                        </button>
                      </article>
                    ))
                  )}
                </div>
              </div>
            </section>
          )
        })}
      </div>
    </main>
  )
}

export default App
