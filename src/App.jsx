import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'tefmaster-content'

const examSections = [
  {
    id: 'expression-orale',
    title: 'Expression orale',
    shortTitle: 'Oral',
    route: '/expression-orale',
    objective:
      "Mesurer votre capacité à communiquer à l'oral avec un interlocuteur.",
    content: '2 sections',
    duration: '15 minutes au total',
    format: "L'épreuve comporte deux sections, A et B.",
    overview:
      "Cette épreuve vérifie votre capacité à obtenir des informations, à interagir naturellement et à défendre une idée avec clarté.",
    b2Goal:
      "Pour viser B2+ / NCLC 7+, entraînez-vous à parler avec structure : question claire, relance pertinente, opinion nuancée, exemples précis et conclusion nette.",
    parts: [
      {
        label: 'Section A',
        duration: '5 minutes',
        task: 'Obtenir des renseignements',
        guidance:
          "Préparez des questions ouvertes, reformulez l'information reçue et gardez un échange fluide.",
      },
      {
        label: 'Section B',
        duration: '10 minutes',
        task: 'Argumenter pour convaincre',
        guidance:
          'Présentez une position, justifiez-la avec deux ou trois arguments, puis répondez aux objections.',
      },
    ],
  },
  {
    id: 'expression-ecrite',
    title: 'Expression écrite',
    shortTitle: 'Écrit',
    route: '/expression-ecrite',
    objective: "Mesurer votre capacité à vous exprimer en français à l'écrit.",
    content: '2 sections',
    duration: '1 heure',
    format: "L'épreuve comporte deux sections, A et B.",
    overview:
      "Cette épreuve mesure votre capacité à produire un texte cohérent, organisé et adapté à la consigne.",
    b2Goal:
      "Pour atteindre B2+ / NCLC 7+, travaillez les connecteurs, la progression des idées, la précision grammaticale et la richesse lexicale.",
    parts: [
      {
        label: 'Section A',
        duration: '25 minutes',
        task: "Écrire la suite d'un article",
        requirement: '80 mots minimum',
        guidance:
          "Respectez le ton de l'article, poursuivez logiquement l'information et évitez les ruptures de style.",
      },
      {
        label: 'Section B',
        duration: '35 minutes',
        task: 'Exprimer son point de vue et le justifier',
        requirement: '200 mots minimum',
        guidance:
          'Construisez une introduction courte, deux arguments développés, un exemple et une conclusion claire.',
      },
    ],
  },
  {
    id: 'comprehension-ecrite',
    title: 'Compréhension écrite',
    shortTitle: 'Lecture',
    route: '/comprehension-ecrite',
    objective: 'Mesurer votre capacité à lire et à comprendre des documents écrits.',
    content: '40 questions',
    duration: '1 heure',
    format: 'Questionnaire à choix multiples (QCM)',
    overview:
      "Cette épreuve évalue votre compréhension de textes variés : annonces, articles, messages, opinions et documents informatifs.",
    b2Goal:
      "Pour viser B2+ / NCLC 7+, entraînez-vous à identifier l'idée principale, les détails, l'intention de l'auteur et les nuances.",
    scoring: [
      'Bonne réponse = 1 point',
      'Pas de réponse / Mauvaise réponse = 0 point',
    ],
  },
  {
    id: 'comprehension-orale',
    title: 'Compréhension orale',
    shortTitle: 'Écoute',
    route: '/comprehension-orale',
    objective:
      'Mesurer votre capacité à comprendre le français parlé en écoutant des documents sonores.',
    content: '40 questions',
    duration: '40 minutes',
    format: 'Questionnaire à choix multiples (QCM)',
    overview:
      'Cette épreuve vérifie votre compréhension de dialogues, annonces, conversations et extraits audio.',
    b2Goal:
      "Pour atteindre B2+ / NCLC 7+, entraînez votre écoute active : repérez le contexte, le ton, les mots-clés et les informations implicites.",
    scoring: [
      'Bonne réponse = 1 point',
      'Pas de réponse / Mauvaise réponse = 0 point',
    ],
  },
]

const cefrLevels = [
  {
    level: 'A1-A2',
    label: 'Fondation',
    description:
      'Comprendre et produire des messages simples avec un vocabulaire limité.',
  },
  {
    level: 'B1',
    label: 'Intermédiaire',
    description:
      'Gérer les situations courantes, raconter une expérience et expliquer une opinion simple.',
  },
  {
    level: 'B2',
    label: 'Indépendant avancé',
    description:
      'Communiquer avec aisance, comprendre des documents complexes et défendre un point de vue.',
  },
  {
    level: 'C1-C2',
    label: 'Maîtrise',
    description:
      'Comprendre les nuances, produire un discours structuré et s’adapter à des contextes exigeants.',
  },
]

const b2Habits = [
  'Répondre à la consigne complète avant de chercher un style impressionnant.',
  'Structurer chaque réponse : idée principale, justification, exemple, conclusion.',
  'Utiliser des connecteurs variés : cependant, en revanche, par conséquent, de plus.',
  'Travailler la précision : accords, temps verbaux, pronoms, syntaxe et ponctuation.',
  'S’entraîner en temps limité pour automatiser les stratégies d’examen.',
  'Analyser ses erreurs après chaque pratique et les convertir en objectifs ciblés.',
]

const emptyDraft = {
  title: '',
  type: 'Sujet',
  notes: '',
}

function getInitialRoute() {
  return window.location.hash.replace(/^#/, '') || '/'
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
  const [route, setRoute] = useState(getInitialRoute)
  const [contentBySection, setContentBySection] = useState(loadSavedContent)
  const [drafts, setDrafts] = useState({})

  const activeSection = examSections.find((section) => section.route === route)

  const totalResources = useMemo(
    () =>
      Object.values(contentBySection).reduce(
        (total, items) => total + items.length,
        0,
      ),
    [contentBySection],
  )

  useEffect(() => {
    function handleHashChange() {
      setRoute(getInitialRoute())
      window.scrollTo({ top: 0, behavior: 'auto' })
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

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
      <SiteHeader route={route} totalResources={totalResources} />
      {activeSection ? (
        <SectionPage
          section={activeSection}
          draft={{ ...emptyDraft, ...drafts[activeSection.id] }}
          resources={contentBySection[activeSection.id] || []}
          onDraftChange={updateDraft}
          onAddResource={addResource}
          onRemoveResource={removeResource}
        />
      ) : (
        <HomePage totalResources={totalResources} />
      )}
    </main>
  )
}

function SiteHeader({ route, totalResources }) {
  return (
    <header className="site-header">
      <nav className="topbar" aria-label="Navigation principale">
        <a className="brand" href="#/" aria-label="TEF Master accueil">
          TEF Master
        </a>
        <div className="nav-links">
          <a className={route === '/' ? 'active' : ''} href="#/">
            Accueil
          </a>
          {examSections.map((section) => (
            <a
              className={route === section.route ? 'active' : ''}
              key={section.id}
              href={`#${section.route}`}
            >
              {section.shortTitle}
            </a>
          ))}
        </div>
      </nav>
      <div className="header-strip" aria-label="Statistiques du site">
        <span>4 épreuves TEF Canada</span>
        <span>{totalResources} contenus ajoutés</span>
      </div>
    </header>
  )
}

function HomePage({ totalResources }) {
  return (
    <>
      <section className="hero home-hero">
        <div className="hero-content">
          <p className="eyebrow">Préparation TEF Canada</p>
          <h1>Construisez votre parcours vers B2+ et NCLC 7+.</h1>
          <p className="hero-copy">
            TEF Master organise l’examen en quatre épreuves, avec des repères
            de format, des objectifs CECR et un espace pour stocker vos contenus
            d’entraînement.
          </p>
          <div className="hero-actions">
            <a className="primary-link" href="#/expression-orale">
              Commencer par l’oral
            </a>
            <a className="secondary-link" href="#format">
              Voir le format
            </a>
          </div>
        </div>
      </section>

      <section className="page-section section-grid" aria-label="Pages des épreuves">
        {examSections.map((section) => (
          <a className="summary-card" href={`#${section.route}`} key={section.id}>
            <span>{section.shortTitle}</span>
            <strong>{section.title}</strong>
            <small>{section.duration}</small>
          </a>
        ))}
      </section>

      <section className="page-section intro-grid" id="format">
        <div className="intro-copy">
          <p className="eyebrow">Vue d’ensemble</p>
          <h2>Le TEF Canada mesure votre français dans quatre compétences.</h2>
          <p>
            L’examen combine deux épreuves de production et deux épreuves de
            compréhension. Votre préparation doit donc couvrir la précision
            linguistique, la gestion du temps, la compréhension des consignes et
            la capacité à produire des réponses structurées.
          </p>
        </div>
        <div className="format-table" role="table" aria-label="Format TEF Canada">
          {examSections.map((section) => (
            <article className="format-row" key={section.id}>
              <h3>{section.title}</h3>
              <p>{section.content}</p>
              <p>{section.duration}</p>
              <p>{section.format}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section cefr-section">
        <div className="section-heading">
          <p className="eyebrow">CECR et NCLC</p>
          <h2>Comprendre le niveau visé</h2>
          <p>
            Le CECR décrit la progression de A1 à C2. Pour l’immigration
            canadienne, les résultats TEF Canada sont aussi interprétés en NCLC.
            B2 correspond à un utilisateur indépendant avancé; NCLC 7+ demande
            une communication claire, autonome et suffisamment précise dans les
            situations académiques, professionnelles et sociales.
          </p>
          <p className="note">
            Les équivalences officielles de scores peuvent changer. Vérifiez les
            tableaux en vigueur avant une demande administrative.
          </p>
        </div>

        <div className="level-grid">
          {cefrLevels.map((level) => (
            <article className="level-card" key={level.level}>
              <span>{level.level}</span>
              <h3>{level.label}</h3>
              <p>{level.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section strategy-section">
        <div className="section-heading">
          <p className="eyebrow">Objectif B2+ / NCLC 7+</p>
          <h2>Ce qu’un candidat avancé doit démontrer</h2>
          <p>
            Le niveau avancé ne dépend pas seulement du vocabulaire. Il exige une
            réponse complète, cohérente, nuancée et adaptée à la tâche, même sous
            contrainte de temps.
          </p>
        </div>
        <div className="habit-list">
          {b2Habits.map((habit) => (
            <article className="habit-card" key={habit}>
              <span aria-hidden="true">✓</span>
              <p>{habit}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section resource-callout">
        <div>
          <p className="eyebrow">Votre espace de contenu</p>
          <h2>{totalResources} contenus sauvegardés localement</h2>
          <p>
            Chaque page d’épreuve contient un formulaire pour ajouter vos sujets,
            exercices, corrections, liens et notes. Les contenus sont conservés
            dans le navigateur.
          </p>
        </div>
        <a className="primary-link dark" href="#/expression-ecrite">
          Ajouter un contenu
        </a>
      </section>
    </>
  )
}

function SectionPage({
  section,
  draft,
  resources,
  onDraftChange,
  onAddResource,
  onRemoveResource,
}) {
  return (
    <section className="page-shell">
      <div className="section-hero">
        <p className="eyebrow">{section.shortTitle}</p>
        <h1>{section.title}</h1>
        <p>{section.overview}</p>
      </div>

      <div className="details">
        <div>
          <span>Objectif</span>
          <strong>{section.objective}</strong>
        </div>
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
              <p className="guidance">{part.guidance}</p>
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

      <article className="strategy-card">
        <p className="eyebrow">Objectif B2+ / NCLC 7+</p>
        <h2>Priorité de préparation</h2>
        <p>{section.b2Goal}</p>
      </article>

      <ContentManager
        section={section}
        draft={draft}
        resources={resources}
        onDraftChange={onDraftChange}
        onAddResource={onAddResource}
        onRemoveResource={onRemoveResource}
      />
    </section>
  )
}

function ContentManager({
  section,
  draft,
  resources,
  onDraftChange,
  onAddResource,
  onRemoveResource,
}) {
  return (
    <div className="content-panel">
      <div className="panel-heading">
        <div>
          <h2>Ajouter du contenu</h2>
          <p>
            Ajoutez vos sujets, exercices, corrections, liens ou notes pour cette
            épreuve.
          </p>
        </div>
      </div>

      <form
        className="content-form"
        onSubmit={(event) => {
          event.preventDefault()
          onAddResource(section.id)
        }}
      >
        <label>
          Titre
          <input
            value={draft.title}
            onChange={(event) =>
              onDraftChange(section.id, 'title', event.target.value)
            }
            placeholder="Ex. Sujet type 1"
          />
        </label>
        <label>
          Type
          <select
            value={draft.type}
            onChange={(event) =>
              onDraftChange(section.id, 'type', event.target.value)
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
              onDraftChange(section.id, 'notes', event.target.value)
            }
            placeholder="Collez ici le contenu ou une description."
            rows="5"
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
                <h3>{resource.title}</h3>
                <p>{resource.notes}</p>
              </div>
              <button
                type="button"
                onClick={() => onRemoveResource(section.id, resource.id)}
              >
                Supprimer
              </button>
            </article>
          ))
        )}
      </div>
    </div>
  )
}

export default App
