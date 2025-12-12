import { createChecklistDocument } from "./checklist-manager.js";

//Detecta el parámetro "oficina" en la URL y lo guarda en localStorage
export const setOficina = () => {
  const params = new URLSearchParams(window.location.search);
  const oficina = params.get("oficina") || "store";
  localStorage.setItem("oficinaParam", oficina);
};

//Obtiene el valor del parámetro "oficina" desde la URL o localStorage
export const getOficina = () => {
  return (
    new URLSearchParams(window.location.search).get("oficina") ||
    localStorage.getItem("oficinaParam") ||
    "general"
  );
};

// Asegura que exista un checklist para el usuario y oficina dados,si no crea una nueva
export const ensureChecklist = async (user, oficina) => {
  const checklistId = localStorage.getItem("currentChecklistId");
  const checklistClosed = localStorage.getItem("checklistClosed");

  // 🚫 Si el último checklist fue cerrado, NO crear otro
  if (checklistClosed === "true") {
    return;
  }

  if (!checklistId) {
    console.log("🆕 Creando checklist nuevo");
    await createChecklistDocument(oficina, user.email);
  }
};
