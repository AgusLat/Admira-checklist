import { nextSlide } from "./slides-control.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { firebaseConfig } from "../firebase/firebaseConfig.js"; 


// GUARDAR INCIDENCIA
// export const reportIssue = (issue) => {
//   const newIssue = issue;

//   console.log("Incidencia reportada:", newIssue);
//   // Guarda issue en localStorage
//   const savedIssues = JSON.parse(localStorage.getItem("incidencias") || "[]");
//   savedIssues.push(newIssue);
//   localStorage.setItem("incidencias", JSON.stringify(savedIssues));

//   nextSlide();
// };


// Inicializa Firestore
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// GUARDAR INCIDENCIA
export const reportIssue = async (issue) => {
  try {
    const newIssue = issue;
    console.log("Incidencia reportada:", newIssue);

    // Guarda localmente
    const savedIssues = JSON.parse(localStorage.getItem("incidencias") || "[]");
    savedIssues.push(newIssue);
    localStorage.setItem("incidencias", JSON.stringify(savedIssues));

    // Envía a Firestore (colección 'incidencias')
    await addDoc(collection(db, "checklist_oasis"), {
      ...newIssue,
      createdAt: new Date().toISOString(), // opcional: agrega timestamp
    });

    console.log("Incidencia guardada en Firestore ✅");
    nextSlide();
  } catch (error) {
    console.error("Error al guardar la incidencia en Firestore ❌:", error);
  }
};