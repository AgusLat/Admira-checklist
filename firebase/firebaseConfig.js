import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyAqt1J5qs-wdCBjr1asU89URxVRzLPSVTY",
  authDomain: "reservas-1b21a.firebaseapp.com",
  projectId: "reservas-1b21a",
  storageBucket: "reservas-1b21a.firebasestorage.app",
  messagingSenderId: "751886584630",
  appId: "1:751886584630:web:4f8cad44fc0ce4a24b0197",
  measurementId: "G-JJ8LV8LYM6",
};
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

export const startGlobalFirebase = () => {
  if (!window.firebaseApp) {
    window.firebaseApp = app;
    window.db = db;
    window.firebaseCollection = collection;
    window.firebaseAddDoc = addDoc;
    window.firebaseGetDocs = getDocs;
    window.firebaseQuery = query;
    window.firebaseWhere = where;
    window.firebaseUpdateDoc = updateDoc;
  }
  return;
};
