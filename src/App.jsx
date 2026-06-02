import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'tefmaster-db-v1'

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
        key: 'sectionA',
        label: 'Section A',
        duration: '5 minutes',
        task: 'Obtenir des renseignements',
        guidance:
          "Préparez des questions ouvertes, reformulez l'information reçue et gardez un échange fluide.",
      },
      {
        key: 'sectionB',
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
        key: 'sectionA',
        label: 'Section A',
        duration: '25 minutes',
        task: "Écrire la suite d'un article",
        requirement: '80 mots minimum',
        guidance:
          "Respectez le ton de l'article, poursuivez logiquement l'information et évitez les ruptures de style.",
      },
      {
        key: 'sectionB',
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

const emptyQaDraft = {
  question: '',
  answer: '',
}

const emptyMcqDraft = {
  passage: '',
  question: '',
  choices: ['', '', '', ''],
  answerIndex: 0,
  explanation: '',
}

function createEmptyDatabase() {
  return {
    qa: {
      'expression-orale': {
        sectionA: [],
        sectionB: [],
      },
      'expression-ecrite': {
        sectionA: [],
        sectionB: [],
      },
    },
    mcqTests: {
      'comprehension-ecrite': [
        {
          id: 'reading-test-1',
          title: 'TEF Canada - Compréhension écrite - Test 1',
          targetQuestionCount: 40,
          questions: [],
        },
      ],
    },
  }
}

function normalizeDatabase(value) {
  const empty = createEmptyDatabase()

  return {
    qa: {
      'expression-orale': {
        sectionA: value?.qa?.['expression-orale']?.sectionA || [],
        sectionB: value?.qa?.['expression-orale']?.sectionB || [],
      },
      'expression-ecrite': {
        sectionA: value?.qa?.['expression-ecrite']?.sectionA || [],
        sectionB: value?.qa?.['expression-ecrite']?.sectionB || [],
      },
    },
    mcqTests: {
      'comprehension-ecrite':
        value?.mcqTests?.['comprehension-ecrite'] ||
        empty.mcqTests['comprehension-ecrite'],
    },
  }
}

function getInitialRoute() {
  return window.location.hash.replace(/^#/, '') || '/'
}

function loadDatabase() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return saved ? normalizeDatabase(JSON.parse(saved)) : createEmptyDatabase()
  } catch {
    return createEmptyDatabase()
  }
}

function makeId() {
  return crypto.randomUUID()
}

function App() {
  const [route, setRoute] = useState(getInitialRoute)
  const [database, setDatabase] = useState(loadDatabase)
  const [qaDrafts, setQaDrafts] = useState({})
  const [mcqDraft, setMcqDraft] = useState(emptyMcqDraft)

  const activeSection = examSections.find((section) => section.route === route)

  const totalResources = useMemo(() => {
    const qaCount = Object.values(database.qa).reduce(
      (sectionTotal, section) =>
        sectionTotal +
        Object.values(section).reduce((partTotal, items) => partTotal + items.length, 0),
      0,
    )
    const mcqCount = Object.values(database.mcqTests).reduce(
      (sectionTotal, tests) =>
        sectionTotal +
        tests.reduce((testTotal, test) => testTotal + test.questions.length, 0),
      0,
    )

    return qaCount + mcqCount
  }, [database])

  useEffect(() => {
    function handleHashChange() {
      setRoute(getInitialRoute())
      window.scrollTo({ top: 0, behavior: 'auto' })
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(database))
  }, [database])

  function updateQaDraft(sectionId, partKey, field, value) {
    const draftKey = `${sectionId}-${partKey}`
    setQaDrafts((current) => ({
      ...current,
      [draftKey]: {
        ...emptyQaDraft,
        ...current[draftKey],
        [field]: value,
      },
    }))
  }

  function addQaItem(sectionId, partKey) {
    const draftKey = `${sectionId}-${partKey}`
    const draft = { ...emptyQaDraft, ...qaDrafts[draftKey] }
    const question = draft.question.trim()
    const answer = draft.answer.trim()

    if (!question || !answer) {
      return
    }

    setDatabase((current) => ({
      ...current,
      qa: {
        ...current.qa,
        [sectionId]: {
          ...current.qa[sectionId],
          [partKey]: [
            ...current.qa[sectionId][partKey],
            {
              id: makeId(),
              question,
              answer,
              createdAt: new Date().toISOString(),
            },
          ],
        },
      },
    }))
    setQaDrafts((current) => ({
      ...current,
      [draftKey]: emptyQaDraft,
    }))
  }

  function removeQaItem(sectionId, partKey, itemId) {
    setDatabase((current) => ({
      ...current,
      qa: {
        ...current.qa,
        [sectionId]: {
          ...current.qa[sectionId],
          [partKey]: current.qa[sectionId][partKey].filter((item) => item.id !== itemId),
        },
      },
    }))
  }

  function updateMcqDraft(field, value) {
    setMcqDraft((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function updateMcqChoice(index, value) {
    setMcqDraft((current) => ({
      ...current,
      choices: current.choices.map((choice, choiceIndex) =>
        choiceIndex === index ? value : choice,
      ),
    }))
  }

  function addMcqQuestion(sectionId, testId) {
    const passage = mcqDraft.passage.trim()
    const question = mcqDraft.question.trim()
    const choices = mcqDraft.choices.map((choice) => choice.trim())
    const explanation = mcqDraft.explanation.trim()

    if (!question || choices.some((choice) => !choice)) {
      return
    }

    setDatabase((current) => ({
      ...current,
      mcqTests: {
        ...current.mcqTests,
        [sectionId]: current.mcqTests[sectionId].map((test) =>
          test.id === testId
            ? {
                ...test,
                questions: [
                  ...test.questions,
                  {
                    id: makeId(),
                    passage,
                    question,
                    choices,
                    answerIndex: Number(mcqDraft.answerIndex),
                    explanation,
                    createdAt: new Date().toISOString(),
                  },
                ],
              }
            : test,
        ),
      },
    }))
    setMcqDraft(emptyMcqDraft)
  }

  function removeMcqQuestion(sectionId, testId, questionId) {
    setDatabase((current) => ({
      ...current,
      mcqTests: {
        ...current.mcqTests,
        [sectionId]: current.mcqTests[sectionId].map((test) =>
          test.id === testId
            ? {
                ...test,
                questions: test.questions.filter((question) => question.id !== questionId),
              }
            : test,
        ),
      },
    }))
  }

  return (
    <main>
      <SiteHeader route={route} totalResources={totalResources} />
      {activeSection ? (
        <SectionPage
          section={activeSection}
          database={database}
          qaDrafts={qaDrafts}
          mcqDraft={mcqDraft}
          onQaDraftChange={updateQaDraft}
          onAddQaItem={addQaItem}
          onRemoveQaItem={removeQaItem}
          onMcqDraftChange={updateMcqDraft}
          onMcqChoiceChange={updateMcqChoice}
          onAddMcqQuestion={addMcqQuestion}
          onRemoveMcqQuestion={removeMcqQuestion}
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
        <span>Base locale GitHub Pages</span>
        <span>{totalResources} contenus enregistrés</span>
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
            de format, des objectifs CECR et une base locale pour stocker vos
            questions, réponses et tests QCM.
          </p>
          <div className="hero-actions">
            <a className="primary-link" href="#/expression-ecrite">
              Ajouter des questions
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

      <section className="page-section database-callout">
        <div>
          <p className="eyebrow">Base de données locale</p>
          <h2>Ajoutez votre propre banque TEF directement sur GitHub Pages.</h2>
          <p>
            Les pages Expression orale et Expression écrite acceptent des
            questions-réponses séparées en Section A et Section B. La page
            Compréhension écrite permet de constituer un test TEF de 40 QCM avec
            quatre choix et une bonne réponse.
          </p>
        </div>
        <div className="database-stats">
          <strong>{totalResources}</strong>
          <span>éléments sauvegardés dans ce navigateur</span>
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
    </>
  )
}

function SectionPage({
  section,
  database,
  qaDrafts,
  mcqDraft,
  onQaDraftChange,
  onAddQaItem,
  onRemoveQaItem,
  onMcqDraftChange,
  onMcqChoiceChange,
  onAddMcqQuestion,
  onRemoveMcqQuestion,
}) {
  const qaSection = database.qa[section.id]
  const readingTests = database.mcqTests[section.id]

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

      {qaSection && (
        <QaDatabase
          section={section}
          qaSection={qaSection}
          qaDrafts={qaDrafts}
          onDraftChange={onQaDraftChange}
          onAddItem={onAddQaItem}
          onRemoveItem={onRemoveQaItem}
        />
      )}

      {readingTests && (
        <McqDatabase
          section={section}
          test={readingTests[0]}
          draft={mcqDraft}
          onDraftChange={onMcqDraftChange}
          onChoiceChange={onMcqChoiceChange}
          onAddQuestion={onAddMcqQuestion}
          onRemoveQuestion={onRemoveMcqQuestion}
        />
      )}
    </section>
  )
}

function QaDatabase({
  section,
  qaSection,
  qaDrafts,
  onDraftChange,
  onAddItem,
  onRemoveItem,
}) {
  return (
    <div className="database-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Questions et réponses</p>
          <h2>Base de contenu {section.title}</h2>
          <p>
            Ajoutez des questions et modèles de réponse séparés par section
            d’épreuve.
          </p>
        </div>
      </div>

      <div className="qa-grid">
        {section.parts.map((part) => {
          const draftKey = `${section.id}-${part.key}`
          const draft = { ...emptyQaDraft, ...qaDrafts[draftKey] }
          const items = qaSection[part.key]

          return (
            <article className="qa-column" key={part.key}>
              <div className="qa-heading">
                <span>{part.label}</span>
                <h3>{part.task}</h3>
                <small>{items.length} contenus</small>
              </div>

              <form
                className="database-form"
                onSubmit={(event) => {
                  event.preventDefault()
                  onAddItem(section.id, part.key)
                }}
              >
                <label>
                  Question / consigne
                  <textarea
                    value={draft.question}
                    onChange={(event) =>
                      onDraftChange(section.id, part.key, 'question', event.target.value)
                    }
                    placeholder="Ex. Vous lisez une annonce pour un cours de français..."
                    rows="4"
                  />
                </label>
                <label>
                  Réponse modèle
                  <textarea
                    value={draft.answer}
                    onChange={(event) =>
                      onDraftChange(section.id, part.key, 'answer', event.target.value)
                    }
                    placeholder="Ajoutez une réponse type, une structure ou des idées clés."
                    rows="5"
                  />
                </label>
                <button type="submit">Ajouter à {part.label}</button>
              </form>

              <div className="database-list">
                {items.length === 0 ? (
                  <p className="empty-state">Aucune question ajoutée.</p>
                ) : (
                  items.map((item, index) => (
                    <article className="database-item" key={item.id}>
                      <div>
                        <span>Question {index + 1}</span>
                        <h4>{item.question}</h4>
                        <p>{item.answer}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(section.id, part.key, item.id)}
                      >
                        Supprimer
                      </button>
                    </article>
                  ))
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

function McqDatabase({
  section,
  test,
  draft,
  onDraftChange,
  onChoiceChange,
  onAddQuestion,
  onRemoveQuestion,
}) {
  const progress = `${test.questions.length}/${test.targetQuestionCount}`

  return (
    <div className="database-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Test QCM</p>
          <h2>{test.title}</h2>
          <p>
            Construisez un test complet de compréhension écrite avec 40
            questions, quatre choix et une seule bonne réponse.
          </p>
        </div>
        <div className="test-progress">
          <strong>{progress}</strong>
          <span>questions</span>
        </div>
      </div>

      <form
        className="mcq-form"
        onSubmit={(event) => {
          event.preventDefault()
          onAddQuestion(section.id, test.id)
        }}
      >
        <label className="wide">
          Texte ou document support
          <textarea
            value={draft.passage}
            onChange={(event) => onDraftChange('passage', event.target.value)}
            placeholder="Collez le texte court, l'annonce ou le document associé à la question."
            rows="4"
          />
        </label>
        <label className="wide">
          Question
          <textarea
            value={draft.question}
            onChange={(event) => onDraftChange('question', event.target.value)}
            placeholder="Ex. Quelle information est correcte selon le document ?"
            rows="3"
          />
        </label>
        {draft.choices.map((choice, index) => (
          <label key={index}>
            Choix {index + 1}
            <input
              value={choice}
              onChange={(event) => onChoiceChange(index, event.target.value)}
              placeholder={`Réponse ${index + 1}`}
            />
          </label>
        ))}
        <label>
          Bonne réponse
          <select
            value={draft.answerIndex}
            onChange={(event) => onDraftChange('answerIndex', event.target.value)}
          >
            <option value="0">Choix 1</option>
            <option value="1">Choix 2</option>
            <option value="2">Choix 3</option>
            <option value="3">Choix 4</option>
          </select>
        </label>
        <label className="wide">
          Explication / correction
          <textarea
            value={draft.explanation}
            onChange={(event) => onDraftChange('explanation', event.target.value)}
            placeholder="Expliquez pourquoi cette réponse est correcte."
            rows="3"
          />
        </label>
        <button type="submit" disabled={test.questions.length >= test.targetQuestionCount}>
          Ajouter la question
        </button>
      </form>

      <div className="database-list">
        {test.questions.length === 0 ? (
          <p className="empty-state">Aucune question QCM ajoutée.</p>
        ) : (
          test.questions.map((item, index) => (
            <article className="mcq-item" key={item.id}>
              <div className="mcq-question">
                <span>Question {index + 1}</span>
                {item.passage && <p className="passage">{item.passage}</p>}
                <h3>{item.question}</h3>
                <ol type="A">
                  {item.choices.map((choice, choiceIndex) => (
                    <li
                      className={choiceIndex === item.answerIndex ? 'correct-choice' : ''}
                      key={choice}
                    >
                      {choice}
                    </li>
                  ))}
                </ol>
                {item.explanation && <p>{item.explanation}</p>}
              </div>
              <button
                type="button"
                onClick={() => onRemoveQuestion(section.id, test.id, item.id)}
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
