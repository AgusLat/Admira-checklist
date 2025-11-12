import { nextSlide } from "./slides-control.js";


export const reportIssue = async (issue) => {
  try {
    const newIssue = {
      ...issue,
      createdAt: new Date().toISOString(),
    };

    console.log("📋 Incidencia reportada:", newIssue);

    // Guarda también localmente (modo offline)
    // const savedIssues = JSON.parse(localStorage.getItem("incidencias") || "[]");
    // savedIssues.push(newIssue);
    // localStorage.setItem("incidencias", JSON.stringify(savedIssues));

    // Guarda en Firestore → colección checklist_oasis
    const db = window.db;
    const incidenciasRef = window.firebaseCollection(db, "checklist_oasis");
    await window.firebaseAddDoc(incidenciasRef, newIssue);

    console.log("✅ Incidencia guardada correctamente en checklist_oasis");
    nextSlide();
  } catch (error) {
    console.error("❌ Error al guardar la incidencia en Firestore:", error);
    alert("Hubo un error al guardar la incidencia. Revisa la consola.");
  }
};
