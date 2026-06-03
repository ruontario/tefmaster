import { useEffect, useMemo, useState } from 'react'
import './App.css'
import {
  isFirebaseConfigured,
  saveDatabaseSnapshot,
  loadDatabaseSnapshot,
} from './firebase'

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
    timerMinutes: 60,
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
    timerMinutes: 40,
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
  audioUrl: '',
  imageUrl: '',
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
      'comprehension-orale': [
        {
          id: 'listening-test-1',
          title: 'TEF Canada - Compréhension orale - Test 1',
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
      'comprehension-orale':
        value?.mcqTests?.['comprehension-orale'] ||
        empty.mcqTests['comprehension-orale'],
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
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null)
  const [firebaseSyncState, setFirebaseSyncState] = useState({
    enabled: false,
    lastSync: null,
    error: null,
  })
  const [firebaseLoaded, setFirebaseLoaded] = useState(false)

  const routeParts = route.split('/').filter(Boolean)
  const activeSection = examSections.find((section) => section.route === route)
  const generatorSection = examSections.find((section) => section.id === routeParts[1])
  const attemptSection = examSections.find((section) => section.id === routeParts[1])
  const attemptTestId = routeParts[2] || null
  const isGeneratorRoute = routeParts[0] === 'test-generation'
  const isAttemptRoute = routeParts[0] === 'test-attempt'

  const totalResources = useMemo(() => {
    const qa = database?.qa || createEmptyDatabase().qa
    const mcqTests = database?.mcqTests || createEmptyDatabase().mcqTests

    const qaCount = Object.values(qa).reduce(
      (sectionTotal, section) =>
        sectionTotal +
        Object.values(section).reduce((partTotal, items) => partTotal + (items?.length || 0), 0),
      0,
    )
    const mcqCount = Object.values(mcqTests).reduce(
      (sectionTotal, tests) =>
        sectionTotal +
        tests.reduce(
          (testTotal, test) => testTotal + ((test?.questions?.length || 0)),
          0,
        ),
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

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      return
    }

    let active = true
    setFirebaseSyncState((current) => ({
      ...current,
      enabled: true,
      error: null,
    }))

    loadDatabaseSnapshot()
      .then((remoteDatabase) => {
        if (!active) return
        if (remoteDatabase) {
          setDatabase((current) => {
            const normalizedRemote = normalizeDatabase(remoteDatabase)
            if (JSON.stringify(normalizedRemote) === JSON.stringify(current)) {
              return current
            }
            return normalizedRemote
          })
        }
        setFirebaseLoaded(true)
      })
      .catch((error) => {
        if (!active) return
        setFirebaseSyncState((current) => ({
          ...current,
          enabled: true,
          error: error.message,
        }))
        setFirebaseLoaded(true)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!isFirebaseConfigured() || !firebaseLoaded) {
      setFirebaseSyncState((current) => ({
        ...current,
        enabled: false,
      }))
      return
    }

    let active = true
    setFirebaseSyncState((current) => ({
      ...current,
      enabled: true,
      error: null,
    }))

    saveDatabaseSnapshot(database)
      .then(() => {
        if (!active) return
        setFirebaseSyncState((current) => ({
          ...current,
          enabled: true,
          lastSync: new Date().toISOString(),
          error: null,
        }))
      })
      .catch((error) => {
        if (!active) return
        setFirebaseSyncState((current) => ({
          ...current,
          enabled: true,
          error: error.message,
        }))
      })

    return () => {
      active = false
    }
  }, [database, firebaseLoaded])

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

  function handleAudioFileUpload(event) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result
      if (typeof dataUrl === 'string') {
        setMcqDraft((current) => ({
          ...current,
          audioUrl: dataUrl,
        }))
        setAudioPreviewUrl(dataUrl)
      }
    }
    reader.readAsDataURL(file)
  }

  function handleImageFileUpload(event) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result
      if (typeof dataUrl === 'string') {
        setMcqDraft((current) => ({
          ...current,
          imageUrl: dataUrl,
        }))
        setImagePreviewUrl(dataUrl)
      }
    }
    reader.readAsDataURL(file)
  }

  function updateMcqChoice(index, value) {
    setMcqDraft((current) => ({
      ...current,
      choices: current.choices.map((choice, choiceIndex) =>
        choiceIndex === index ? value : choice,
      ),
    }))
  }

  async function addMcqQuestion(sectionId, testId) {
    const passage = mcqDraft.passage.trim()
    const question = mcqDraft.question.trim()
    const choices = mcqDraft.choices.map((choice) => choice.trim())
    const explanation = mcqDraft.explanation.trim()
    let audioUrl = mcqDraft.audioUrl.trim()
    let imageUrl = mcqDraft.imageUrl.trim()

    if (!question || choices.some((choice) => !choice)) {
      return
    }

    // Helper: try upload but timeout after X ms, fall back to inline data URL on failure
    async function uploadWithTimeout(dataUrl, path, timeoutMs = 15000) {
      if (!dataUrl || !dataUrl.startsWith('data:') || !isFirebaseConfigured()) return null

      try {
        const { uploadDataUrl } = await import('./firebase')

        const uploadPromise = uploadDataUrl(dataUrl, path)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), timeoutMs),
        )

        const result = await Promise.race([uploadPromise, timeoutPromise])
        return result
      } catch (err) {
        console.warn(`Upload failed for ${path}:`, err?.message || err)
        return null
      }
    }

    // attempt uploads but don't block indefinitely
    const attemptedAudioUrl = audioUrl && audioUrl.startsWith('data:')
      ? await uploadWithTimeout(audioUrl, `audio/${makeId()}`)
      : null
    if (attemptedAudioUrl) audioUrl = attemptedAudioUrl

    const attemptedImageUrl = imageUrl && imageUrl.startsWith('data:')
      ? await uploadWithTimeout(imageUrl, `images/${makeId()}`)
      : null
    if (attemptedImageUrl) imageUrl = attemptedImageUrl

    setDatabase((current) => ({
      ...current,
      mcqTests: {
        ...current.mcqTests,
        [sectionId]: current.mcqTests[sectionId].map((test) =>
          test.id === testId
            ? {
                ...test,
                questions: [
                  ...(test.questions || []),
                  {
                    id: makeId(),
                    passage,
                    question,
                    choices,
                    answerIndex: Number(mcqDraft.answerIndex),
                    explanation,
                    audioUrl,
                    imageUrl,
                    createdAt: new Date().toISOString(),
                  },
                ],
              }
            : test,
        ),
      },
    }))

    setMcqDraft(emptyMcqDraft)
    setImagePreviewUrl(null)
    setAudioPreviewUrl(null)
  }

  function addMcqTest(sectionId, title) {
    const testTitle =
      title || `TEF Canada - ${sectionId === 'comprehension-orale' ? 'Compréhension orale' : 'Compréhension écrite'} - Test ${
        (database.mcqTests[sectionId]?.length || 0) + 1
      }`

    setDatabase((current) => ({
      ...current,
      mcqTests: {
        ...current.mcqTests,
        [sectionId]: [
          ...(current.mcqTests[sectionId] || []),
          {
            id: makeId(),
            title: testTitle,
            targetQuestionCount: 40,
            questions: [],
          },
        ],
      },
    }))
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
      <SiteHeader
        route={route}
        totalResources={totalResources}
        firebaseSyncState={firebaseSyncState}
      />
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
          onAddMcqTest={addMcqTest}
        />
      ) : isGeneratorRoute ? (
        <TestGenerationPage
          database={database}
          mcqDraft={mcqDraft}
          initialSectionId={generatorSection?.id}
          onDraftChange={updateMcqDraft}
          onChoiceChange={updateMcqChoice}
          onAddTest={addMcqTest}
          onAddQuestion={addMcqQuestion}
          onRemoveQuestion={removeMcqQuestion}
          onAudioFileUpload={handleAudioFileUpload}
          onImageFileUpload={handleImageFileUpload}
        />
      ) : isAttemptRoute ? (
        <TestAttemptPage
          database={database}
          initialSectionId={attemptSection?.id}
          initialTestId={attemptTestId}
        />
      ) : (
        <HomePage totalResources={totalResources} />
      )}
    </main>
  )
}

function SiteHeader({ route, totalResources, firebaseSyncState }) {
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
          <a
            className={route.startsWith('test-generation') ? 'active' : ''}
            href="#/test-generation/comprehension-ecrite"
          >
            Générateur
          </a>
          <a
            className={route.startsWith('test-attempt') ? 'active' : ''}
            href="#/test-attempt/comprehension-ecrite"
          >
            Passer un test
          </a>
        </div>
      </nav>
      <div className="header-strip" aria-label="Statistiques du site">
        <span>Base locale GitHub Pages</span>
        <span>{totalResources} contenus enregistrés</span>
        <span>
          {firebaseSyncState.enabled
            ? firebaseSyncState.error
              ? `Firebase erreur: ${firebaseSyncState.error}`
              : `Firebase synchronisé ${firebaseSyncState.lastSync ?? 'en attente'}`
            : 'Firebase non configuré'}
        </span>
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
            <a className="primary-link" href="#/test-generation/comprehension-ecrite">
              Générateur de tests
            </a>
            <a className="secondary-link" href="#/test-attempt/comprehension-ecrite">
              Passer un test
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

function TestGenerationPage({
  database,
  mcqDraft,
  initialSectionId,
  onDraftChange,
  onChoiceChange,
  onAddTest,
  onAddQuestion,
  onRemoveQuestion,
  onAudioFileUpload,
  onImageFileUpload,
}) {
  const sections = examSections.filter((section) => section.id.startsWith('comprehension'))
  const defaultSectionId =
    initialSectionId && sections.some((section) => section.id === initialSectionId)
      ? initialSectionId
      : sections[0]?.id
  const [selectedSectionId, setSelectedSectionId] = useState(defaultSectionId)
  const tests = database?.mcqTests?.[selectedSectionId] || []
  const [selectedTestId, setSelectedTestId] = useState(tests[0]?.id ?? null)
  const [newTestTitle, setNewTestTitle] = useState('')

  useEffect(() => {
    if (!tests.some((test) => test.id === selectedTestId)) {
      setSelectedTestId(tests[0]?.id ?? null)
    }
  }, [selectedSectionId, tests, selectedTestId])

  const selectedSection = examSections.find((section) => section.id === selectedSectionId)
  const selectedTest = tests.find((test) => test.id === selectedTestId) || null

  return (
    <section className="page-shell">
      <div className="section-hero">
        <p className="eyebrow">Générateur de tests</p>
        <h1>Créer des tests pour {selectedSection?.title ?? 'la compréhension'}</h1>
        <p>
          Utilisez cette page pour créer et gérer des tests QCM TEF Canada, puis
          passez-les dans l’environnement de test.
        </p>
      </div>

      <div className="database-callout">
        <div>
          <p className="eyebrow">Sélection de l’épreuve</p>
          <h2>Section de test</h2>
          <p>
            Choisissez la section à laquelle le test appartient, puis ajoutez
            des questions QCM dédiées à ce test.
          </p>
        </div>
        <div className="database-form">
          <label>
            Section
            <select
              value={selectedSectionId}
              onChange={(event) => setSelectedSectionId(event.target.value)}
            >
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.title}
                </option>
              ))}
            </select>
          </label>
          <label className="wide">
            Nouveau test
            <input
              value={newTestTitle}
              onChange={(event) => setNewTestTitle(event.target.value)}
              placeholder="Titre du test (optionnel)"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              onAddTest(selectedSectionId, newTestTitle.trim() || undefined)
              setNewTestTitle('')
            }}
          >
            Créer le test
          </button>
        </div>
      </div>

      <div className="test-grid">
        <aside className="test-sidebar">
          {tests.length === 0 ? (
            <p className="empty-state">Aucun test créé pour cette section.</p>
          ) : (
            tests.map((test) => (
              <button
                key={test.id}
                type="button"
                className={test.id === selectedTestId ? 'active-test' : ''}
                onClick={() => setSelectedTestId(test.id)}
              >
                <strong>{test.title}</strong>
                <span>
                  {(test.questions?.length || 0)}/{test.targetQuestionCount} questions
                </span>
              </button>
            ))
          )}
        </aside>

        <div className="test-main">
          {selectedTest ? (
            <McqDatabase
              section={selectedSection}
              test={selectedTest}
              draft={mcqDraft}
              onDraftChange={onDraftChange}
              onChoiceChange={onChoiceChange}
              onAddQuestion={onAddQuestion}
              onRemoveQuestion={onRemoveQuestion}
              onAudioFileUpload={onAudioFileUpload}
              onImageFileUpload={onImageFileUpload}
            />
          ) : (
            <div className="empty-state">
              Sélectionnez un test existant ou créez-en un nouveau pour commencer.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function TestAttemptPage({ database, initialSectionId, initialTestId }) {
  const sections = examSections.filter((section) => section.id.startsWith('comprehension'))
  const defaultSectionId =
    initialSectionId && sections.some((section) => section.id === initialSectionId)
      ? initialSectionId
      : sections[0]?.id
  const [selectedSectionId, setSelectedSectionId] = useState(defaultSectionId)
  const tests = database?.mcqTests?.[selectedSectionId] || []
  const defaultTestId =
    initialTestId && tests.some((test) => test.id === initialTestId)
      ? initialTestId
      : tests[0]?.id
  const [selectedTestId, setSelectedTestId] = useState(defaultTestId)
  const [examState, setExamState] = useState('ready')
  const [answers, setAnswers] = useState({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const selectedSection = examSections.find((section) => section.id === selectedSectionId)
  const selectedTest = tests.find((test) => test.id === selectedTestId) || null
  const durationSeconds = (selectedSection?.timerMinutes || 0) * 60
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds)

  useEffect(() => {
    if (!tests.some((test) => test.id === selectedTestId)) {
      setSelectedTestId(tests[0]?.id ?? null)
    }
  }, [selectedSectionId, tests, selectedTestId])

  useEffect(() => {
    setAnswers({})
    setCurrentQuestionIndex(0)
    setExamState('ready')
    setRemainingSeconds(durationSeconds)
  }, [selectedSectionId, selectedTestId, durationSeconds])

  useEffect(() => {
    if (examState !== 'running') {
      return
    }

    const timer = setInterval(() => {
      setRemainingSeconds((seconds) => {
        if (seconds <= 1) {
          clearInterval(timer)
          setExamState('finished')
          return 0
        }
        return seconds - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [examState])

  const currentQuestion = selectedTest?.questions?.[currentQuestionIndex] || null
  const totalQuestions = selectedTest?.questions?.length || 0
  const correctAnswers = selectedTest?.questions?.reduce(
    (count, question) =>
      count + (answers[question.id] === question.answerIndex ? 1 : 0),
    0,
  )

  const formattedTime = `${String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:${String(
    remainingSeconds % 60,
  ).padStart(2, '0')}`

  return (
    <section className="page-shell">
      <div className="section-hero">
        <p className="eyebrow">Mode examen</p>
        <h1>Passer un test TEF Canada</h1>
        <p>
          Sélectionnez un examen, démarrez le minuteur et répondez comme dans une
          vraie épreuve.
        </p>
      </div>

      <div className="database-callout">
        <div>
          <p className="eyebrow">Sélection du test</p>
          <h2>Choisissez votre épreuve</h2>
          <p>
            Les tests sont quatre-choix et s’appuient sur votre banque de
            questions. Le minuteur reflète la durée officielle des sections
            écrite et orale.
          </p>
        </div>
        <div className="database-form">
          <label>
            Section
            <select
              value={selectedSectionId}
              onChange={(event) => setSelectedSectionId(event.target.value)}
            >
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.title}
                </option>
              ))}
            </select>
          </label>

          <label>
            Test
            <select
              value={selectedTestId || ''}
              onChange={(event) => setSelectedTestId(event.target.value)}
            >
              <option value="" disabled>
                Sélectionnez un test
              </option>
              {tests.map((test) => (
                <option key={test.id} value={test.id}>
                  {test.title}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => setExamState('running')}
            disabled={!selectedTest || examState === 'running'}
          >
            Démarrer le test
          </button>
        </div>
      </div>

      {selectedTest ? (
        <div className="database-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Examen en temps réel</p>
              <h2>{selectedTest.title}</h2>
              <p>
                {examState === 'ready'
                  ? 'Cliquez sur Démarrer le test pour lancer le compte à rebours.'
                  : examState === 'running'
                  ? 'Répondez aux questions et gardez un œil sur le temps.'
                  : 'Faites le bilan de vos réponses après la fin du test.'}
              </p>
            </div>
            <div className="test-progress">
              <strong>{formattedTime}</strong>
              <span>Temps restant</span>
            </div>
          </div>

          {examState === 'finished' && (
            <div className="content-panel">
              <h2>Résultats</h2>
              <p>
                {correctAnswers}/{totalQuestions} bonnes réponses
              </p>
              <p>
                Score estimé : {Math.round((correctAnswers / Math.max(totalQuestions, 1)) * 100)}%
              </p>
            </div>
          )}

          {currentQuestion ? (
            <div className="content-panel">
              <div className="question-card">
                <div className="panel-heading">
                  <div>
                    <span className="eyebrow">Question {currentQuestionIndex + 1}</span>
                    <h3>{currentQuestion.question}</h3>
                  </div>
                </div>
                {currentQuestion.audioUrl ? (
                  <audio controls style={{ width: '100%', marginBottom: '12px' }} autoPlay>
                    <source src={currentQuestion.audioUrl} />
                    Votre navigateur ne supporte pas le lecteur audio.
                  </audio>
                ) : null}
                {currentQuestion.imageUrl ? (
                  <img
                    src={currentQuestion.imageUrl}
                    alt="Question image"
                    style={{ maxWidth: '100%', marginBottom: '12px', maxHeight: '300px' }}
                  />
                ) : null}
                {currentQuestion.passage ? (
                  <p className="passage">{currentQuestion.passage}</p>
                ) : null}
                <div className="mcq-form">
                  {currentQuestion.choices.map((choice, index) => (
                    <label key={index}>
                      <input
                        type="radio"
                        name={currentQuestion.id}
                        checked={answers[currentQuestion.id] === index}
                        disabled={examState !== 'running'}
                        onChange={() =>
                          setAnswers((current) => ({ ...current, [currentQuestion.id]: index }))
                        }
                      />
                      {choice}
                    </label>
                  ))}
                </div>

                <div className="question-navigation">
                  <button
                    type="button"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((index) => Math.max(index - 1, 0))}
                  >
                    Précédent
                  </button>
                  <button
                    type="button"
                    disabled={currentQuestionIndex >= totalQuestions - 1}
                    onClick={() =>
                      setCurrentQuestionIndex((index) => Math.min(index + 1, totalQuestions - 1))
                    }
                  >
                    Suivant
                  </button>
                  <button
                    type="button"
                    onClick={() => setExamState('finished')}
                    disabled={examState !== 'running'}
                  >
                    Terminer
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="empty-state">Ce test ne contient pas encore de questions.</p>
          )}
        </div>
      ) : (
        <p className="empty-state">Sélectionnez un test pour commencer l’épreuve.</p>
      )}
    </section>
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
  onAddMcqTest,
}) {
  const qaSection = database?.qa?.[section.id] || {
    sectionA: [],
    sectionB: [],
  }
  const sectionTests = database?.mcqTests?.[section.id] || []
  const [activeTestId, setActiveTestId] = useState(sectionTests[0]?.id ?? null)

  useEffect(() => {
    if (sectionTests.length === 0) {
      setActiveTestId(null)
      return
    }

    if (!sectionTests.some((test) => test.id === activeTestId)) {
      setActiveTestId(sectionTests[0].id)
    }
  }, [section.id, sectionTests])

  const activeTest = sectionTests.find((test) => test.id === activeTestId) || sectionTests[0] || null

  const handleAddTest = () => {
    onAddMcqTest(section.id)
  }

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

      {section.parts?.length > 0 && qaSection && (
        <QaDatabase
          section={section}
          qaSection={qaSection}
          qaDrafts={qaDrafts}
          onDraftChange={onQaDraftChange}
          onAddItem={onAddQaItem}
          onRemoveItem={onRemoveQaItem}
        />
      )}

      {section.id.startsWith('comprehension') && (
        <div className="database-callout">
          <div>
            <p className="eyebrow">Créateur et examen</p>
            <h2>Gérer et passer les tests {section.title}</h2>
            <p>
              Les questions de compréhension sont gérées sur une page dédiée. Créez
              vos tests dans le générateur puis passez-les dans l’environnement
              d’examen pour un compte à rebours réel.
            </p>
          </div>
          <div>
            <a className="primary-link" href={`#/test-generation/${section.id}`}>
              Générateur de tests
            </a>
            <a className="secondary-link dark" href={`#/test-attempt/${section.id}`}>
              Passer un test
            </a>
          </div>
        </div>
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
  onAudioFileUpload,
  onImageFileUpload,
}) {
  if (!test) {
    return null
  }

  const progress = `${test.questions?.length || 0}/${test.targetQuestionCount}`
  const isListeningTest = section?.id === 'comprehension-orale'

  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    const questionText = (draft.question || '').trim()
    const choicesValid = (draft.choices || []).every((c) => (c || '').trim())

    if (!questionText || !choicesValid) {
      setError('Veuillez remplir la question et toutes les réponses avant d\'ajouter.')
      return
    }

    setError(null)
    setSaving(true)
    try {
      await onAddQuestion(section.id, test.id)
    } catch (err) {
      setError(err?.message || 'Erreur lors de l\'enregistrement de la question.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="database-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Test QCM</p>
          <h2>{test.title}</h2>
          <p>
            Construisez un test complet de {section.title} avec {test.targetQuestionCount}
            questions, quatre choix et une seule bonne réponse.
          </p>
        </div>
        <div className="test-progress">
          <strong>{progress}</strong>
          <span>questions</span>
        </div>
      </div>

      <form className="mcq-form" onSubmit={handleSubmit}>
        {isListeningTest ? (
          <label className="wide">
            Clip audio
            <input
              type="file"
              accept="audio/*"
              onChange={onAudioFileUpload}
            />
            {draft.audioUrl && (
              <audio controls style={{ marginTop: '12px', width: '100%' }}>
                <source src={draft.audioUrl} />
                Votre navigateur ne supporte pas le lecteur audio.
              </audio>
            )}
          </label>
        ) : (
          <label className="wide">
            Texte ou document support
            <textarea
              value={draft.passage}
              onChange={(event) => onDraftChange('passage', event.target.value)}
              placeholder="Collez le texte court, l'annonce ou le document associé à la question."
              rows="4"
            />
          </label>
        )}
        <label className="wide">
          Image (optionnel)
          <input
            type="file"
            accept="image/*"
            onChange={onImageFileUpload}
          />
          {draft.imageUrl && (
            <img
              src={draft.imageUrl}
              alt="Preview"
              style={{ marginTop: '12px', maxWidth: '100%', maxHeight: '200px' }}
            />
          )}
        </label>
        <label className="wide">
          Question
          <textarea
            value={draft.question}
            onChange={(event) => onDraftChange('question', event.target.value)}
            placeholder={isListeningTest ? "Ex. De quel sujet s'agit-il ?" : "Ex. Quelle information est correcte selon le document ?"}
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
        {error && <div className="form-error" role="alert">{error}</div>}
        <button
          type="submit"
          disabled={
            saving ||
            (test.questions?.length || 0) >= test.targetQuestionCount
          }
        >
          {saving ? 'Enregistrement...' : 'Ajouter la question'}
        </button>
      </form>

      <div className="database-list">
        {(test.questions?.length || 0) === 0 ? (
          <p className="empty-state">Aucune question QCM ajoutée.</p>
        ) : (
          (test.questions || []).map((item, index) => (
            <article className="mcq-item" key={item.id}>
              <div className="mcq-question">
                <span>Question {index + 1}</span>
                {item.audioUrl && (
                  <audio controls style={{ width: '100%', marginBottom: '12px' }}>
                    <source src={item.audioUrl} />
                    Votre navigateur ne supporte pas le lecteur audio.
                  </audio>
                )}
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt="Question image"
                    style={{ maxWidth: '100%', marginBottom: '12px', maxHeight: '200px' }}
                  />
                )}
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
