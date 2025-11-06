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

// ENVIAR FORMULARIO INCIDENCIAS

// function submitIssueForm(event) {
//   event.preventDefault();

//   const desc = document.getElementById("issueDesc").value.trim();
//   const fileInput = document.getElementById("issueFile");
//   const file = fileInput.files[0] || null;

//   if (!desc && !file) {
//     alert("Por favor, escribe una descripción Y/o adjunta una imagen.");
//     return;
//   }

//   const issue = {
//     text: slides[currentSlideIndex].text,
//     description: desc,
//     fileName: file ? file.name : null,
//     date: new Date().toISOString(),
//   };

//   const saved = JSON.parse(localStorage.getItem("incidencias") || "[]");
//   saved.push(issue);
//   localStorage.setItem("incidencias", JSON.stringify(saved));

//   nextSlide();
// }
