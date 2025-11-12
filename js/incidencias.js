import { nextSlide } from "./slides-control.js";

// GUARDAR INCIDENCIA
export const reportIssue = (issue) => {
  const newIssue = issue;

  console.log("Incidencia reportada:", newIssue);
  // Guarda issue en localStorage
  const savedIssues = JSON.parse(localStorage.getItem("incidencias") || "[]");
  savedIssues.push(newIssue);
  localStorage.setItem("incidencias", JSON.stringify(savedIssues));

  nextSlide();
};