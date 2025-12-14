import { createChecklistDocument } from "./checklist-manager.js";
import { slidesMap } from "../slides/slides-template.js";

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
export const renderNavMenu = (oficina, menu, stats = {}) => {
  let seccionData = [];

  // Obtener las slides correspondientes a la oficina
  const slidesOficina = slidesMap[oficina?.toLowerCase()] || null;

  if (!slidesOficina) {
    seccionData = [{ seccion: "OFICINA NO IDENTIFICADA", href: "" }];
  } else {
    seccionData = Object.keys(slidesOficina).map((titulo) => {
      const progreso = stats?.[titulo];

      const progresoTexto = progreso
        ? ` ${progreso.completados}/${progreso.total}`
        : "";

      return {
        titulo: titulo[0].toUpperCase() + titulo.slice(1).toLowerCase(),
        href: `slides.html?oficina=${oficina}&seccion=${titulo}`,
        progresoTexto,
      };
    });
  }
  // Render del menú
  menu.innerHTML = `
      <ul>
        ${seccionData
          .map(
            (opt) =>
              `<li id="${opt.titulo}" ><a href="${opt.href}">${opt.titulo} <span class="progreso-seccion">${opt.progresoTexto}</span></a></li>`
          )
          .join("")}
      </ul>
     
    `;
};

// Renderiza las estadísticas de progreso e incidencias en el menú de navegación
export const renderProgressStats = (stats) => {
  progressIndicator.style.display = "block";
  progressText.textContent = `${stats.completados + stats.incidencias}/${
    stats.total
  } pasos completados`;
  progressText.innerHTML += ` <p><strong>Incidencias:</strong> <span>${stats.incidencias}</span></p>`;
};
