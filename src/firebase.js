import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.databaseURL &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
)

let firebaseApp

export function getFirebaseDatabase() {
  if (!isFirebaseConfigured) {
    return null
  }

  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig)
  }

  return getDatabase(firebaseApp)
}

export function saveDatabaseSnapshot(value) {
  const database = getFirebaseDatabase()
  if (!database) {
    return Promise.reject(
      new Error(
        'Firebase Realtime Database n’est pas configuré. Copie les variables d’environnement dans .env.local.',
      ),
    )
  }

  return set(ref(database, '/tefmaster'), value)
}
