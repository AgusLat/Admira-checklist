import { createChecklistDocument } from "./checklist-manager.js";
import { slidesMap } from "../slides/slides-template.js";

//Detecta el parámetro "oficina" en la URL y lo guarda en localStorage
export const setOficina = () => {
  const params = new URLSearchParams(window.location.search);
  const oficina = params.get("oficina") || "store";
  localStorage.setItem("oficinaParam", oficina);
};

export const setMode = async (navMenu) => {
  const MODE_KEY = "checkListMode";
  const modeSelector = document.getElementById("modeSelector");
  const btnApertura = document.getElementById("btnApertura");
  const btnCierre = document.getElementById("btnCierre");

  // Si ya hay modo guardado, no bloquea el flujo
  const saved = localStorage.getItem(MODE_KEY);
  if (saved === "ABRIR" || saved === "CERRAR") {
    modeSelector.style.display = "none";
    navMenu.style.display = "flex";
    return Promise.resolve(saved);
  }

  // Bloquea el flujo hasta elegir
  modeSelector.style.display = "flex";
  navMenu.style.display = "none"; // el menú NO se muestra

  // Evitar doble click mientras resuelve
  const disableButtons = (disabled) => {
    btnApertura.disabled = disabled;
    btnCierre.disabled = disabled;
  };

  return new Promise((resolve) => {
    const handlePick = (e) => {
      const picked = e.currentTarget.dataset.mode; // "ABRIR" o "CERRAR"
      if (picked !== "ABRIR" && picked !== "CERRAR") return;

      disableButtons(true);

      localStorage.setItem(MODE_KEY, picked);

      // Limpieza UI
      modeSelector.style.display = "none";
      navMenu.style.display = "flex";

      // Sacar listeners para que no se dispare otra vez
      btnApertura.removeEventListener("click", onApertura);
      btnCierre.removeEventListener("click", onCierre);

      resolve(picked);
    };

    const onApertura = (e) => handlePick(e);
    const onCierre = (e) => handlePick(e);

    // Registrar listeners
    btnApertura.addEventListener("click", onApertura, { once: true });
    btnCierre.addEventListener("click", onCierre, { once: true });
  });
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
  const collectionName = localStorage.getItem("currentChecklistCollection");
  const checklistClosed = localStorage.getItem("checklistClosed");

  // Si el último checklist fue cerrado, NO crear otro
  if (checklistClosed === "true") {
    return;
  }

  if (checklistId && collectionName) {
    const checklistRef = window.firebaseCollection(window.db, collectionName);

    const q = window.firebaseQuery(
      checklistRef,
      window.firebaseWhere("id", "==", checklistId)
    );

    const snapshot = await window.firebaseGetDocs(q);

    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const data = doc.data();

      // Evaluar antiguedad si está en progreso (limite 60 minutos)
      if (data.estado === "en_progreso") {
        const lastUpdate = new Date(data.fechaActualizacion).getTime();
        const now = Date.now();
        const diffMinutes = (now - lastUpdate) / 1000 / 60;

        if (diffMinutes > 60) {
          const continuar = confirm(
            "⚠️ Tenés un checklist iniciado anteriormente.\n\n" +
              "Para continuar con ese checklist, presiona ACEPTAR.\n" +
              "Para abortar ese checklist y crear uno nuevo, presiona CANCELAR."
          );

          if (!continuar) {
            // Abortar checklist viejo
            const nowISO = new Date().toISOString();

            await window.firebaseUpdateDoc(doc.ref, {
              estado: "abortado",
              fechaFin: nowISO,
              fechaActualizacion: nowISO,
            });

            localStorage.removeItem("currentChecklistId");
            localStorage.removeItem("currentChecklistCollection");

            alert("🛑 El checklist anterior fue abortado.");
            // Crear uno nuevo
            await createChecklistDocument(oficina, user.email);
            return;
          }
        }

        console.log("♻️ Recuperando checklist en progreso");
        return;
      }
    }

    // Si no es válido
    localStorage.removeItem("currentChecklistId");
    localStorage.removeItem("currentChecklistCollection");
  }

  console.log("🆕 Creando checklist nuevo");
  await createChecklistDocument(oficina, user.email);
};

// Renderiza el menú de navegación basado en las slides de la oficina
export const renderNavMenu = (oficina, menu, mode, stats = {}) => {
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
  progressText.innerHTML = ` <li><strong>Pasos completados:</strong> <span>${
    stats.completados + stats.incidencias
  }/${stats.total}</span></li> <li><strong>Incidencias:</strong> <span>${
    stats.incidencias
  }</span></li>`;
};
