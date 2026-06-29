import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBCwr7f4nITvQ3WBRab6KHNUVJsJgu9mPI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "invertible-flow-rskkt.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "invertible-flow-rskkt",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "invertible-flow-rskkt.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "205665157452",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:205665157452:web:6a9144501365ad2a35cfe9",
};

const databaseId = "ai-studio-fiverrlens-ec6b32b2-6c56-4950-a5ed-3d4a84af943e";

let app;
try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
} catch (error) {
  console.warn("Firebase failed to initialize with current config, using minimum fallback:", error);
  app = initializeApp({
    apiKey: "AIzaSyBCwr7f4nITvQ3WBRab6KHNUVJsJgu9mPI",
    projectId: "invertible-flow-rskkt",
  });
}

export { app };
export const db = getFirestore(app, databaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}


