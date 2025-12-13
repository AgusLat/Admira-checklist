import { createChecklistDocument } from "./checklist-manager.js";
import { slidesMap } from "../slides/slides-template.js";
import {
  slidesSantaRosa,
  slidesStore,
  slidesPlanetaTerminator,
  slidesPlanetaNave,
} from "../slides/slides.js";

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

  // Si el último checklist fue cerrado, NO crear otro
  if (checklistClosed === "true") {
    return;
  }

  if (!checklistId) {
    console.log("🆕 Creando checklist nuevo");
    await createChecklistDocument(oficina, user.email);
  }
};

// Renderiza el menú de navegación basado en las slides de la oficina
export const renderNavMenu = (oficina, menu) => {
  let opciones = [];

  // Obtener las slides correspondientes a la oficina
  const slidesOficina = slidesMap[oficina?.tolowerCase()] || null;

  if (!slidesOficina) {
    opciones = [{ seccion: "OFICINA NO IDENTIFICADA", href: "" }];
  } else {
    opciones = Object.keys(slidesOficina).map((titulo) => ({
      seccion: titulo.toUpperCase(),
      href: `slides.html?oficina=${oficina}&seccion=${titulo}`,
    }));
  }
  // Render del menú
  menu.innerHTML = `
      <ul>
        ${opciones
          .map(
            (opt) =>
              `<li id="${opt.seccion}" ><a href="${opt.href}">${opt.seccion}</a></li>`
          )
          .join("")}
      </ul>
     
    `;
};
