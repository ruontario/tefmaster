import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, get } from 'firebase/database'
import { getStorage, ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.databaseURL &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  )
}

let firebaseApp

export function getFirebaseDatabase() {
  if (!isFirebaseConfigured()) {
    return null
  }

  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig)
  }

  return getDatabase(firebaseApp)
}

export function getFirebaseStorage() {
  if (!isFirebaseConfigured()) return null
  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig)
  }
  return getStorage(firebaseApp)
}

// Upload a data URL (base64) to Firebase Storage and return a public download URL
export async function uploadDataUrl(dataUrl, path) {
  const storage = getFirebaseStorage()
  if (!storage) {
    throw new Error('Firebase Storage n’est pas configuré.')
  }

  const refStorage = storageRef(storage, path)
  // uploadString supports data_url directly
  await uploadString(refStorage, dataUrl, 'data_url')
  const url = await getDownloadURL(refStorage)
  return url
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

export async function loadDatabaseSnapshot() {
  const database = getFirebaseDatabase()
  if (!database) {
    return null
  }

  const snapshot = await get(ref(database, '/tefmaster'))
  return snapshot.exists() ? snapshot.val() : null
}
