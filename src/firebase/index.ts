'use client';

import {
  getApps,
  initializeApp,
  FirebaseApp,
  FirebaseOptions,
} from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getDatabase, Database } from 'firebase/database';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

// Import hooks/providers BEFORE exporting
import { useUser } from './auth/use-user';
import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';
import { FirebaseProvider, useFirebaseApp, useFirestore, useAuth, useDatabase, useStorage } from './provider';
import { FirebaseClientProvider } from './client-provider';

let firebaseApp: FirebaseApp | undefined;
let auth: Auth | undefined;
let firestore: Firestore | undefined;
let database: Database | undefined;
let storage: FirebaseStorage | undefined;

export type FirebaseServices = {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  database: Database;
  storage: FirebaseStorage;
};

function initializeFirebase(
  config: FirebaseOptions = firebaseConfig
): FirebaseServices {
  if (!firebaseApp) {
    if (getApps().length === 0) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApps()[0];
    }
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
    database = getDatabase(firebaseApp);
    storage = getStorage(firebaseApp);
  }

  return { firebaseApp, auth: auth!, firestore: firestore!, database: database!, storage: storage! };
}

// ✅ Export everything AFTER imports
export {
  initializeFirebase,
  firebaseApp,
  auth,
  firestore,
  database,
  storage,
  useUser,
  useCollection,
  useDoc,
  FirebaseProvider,
  FirebaseClientProvider,
  useFirebaseApp,
  useFirestore,
  useAuth,
  useDatabase,
  useStorage,
};
