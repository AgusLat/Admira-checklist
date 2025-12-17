import { openIssueModal } from "./modal.js";
import { markStepAsOK, processPendingIncidencia } from "./incidencias.js";

// Variables
export let currentSlideIndex = 0;
export let slides = [];
let container = null;
let currentSeccion = null;

// Renderizar slides
export function renderSlides(containerElement, slideArray, seccion) {
  container = containerElement;
  slides = slideArray;
  currentSeccion = seccion;
  showSlide(currentSlideIndex);
}

// Mostrar una slide
function showSlide(index) {
  const slide = slides[index];
  let html = "";

  // --- INTRO ---
  if (slide.type === "intro") {
    html = `
      <div class="slide intro">
        <h2>Sección: ${slide.desc}</h2>
        ${slide.imgSrc ? `<img src="${slide.imgSrc}" alt="Intro">` : ""}
        <div class="buttons">
        <button id="nextBtn" class="wideBtn">Comenzar</button>
        <button id="backToMenuBtn" class="back-to-menu">Volver al Menú</button>
        </div>
      </div>
    `;
  }

  // --- OUTRO (FINAL) ---
  else if (slide.type === "outro") {
    html = `
      <div class="slide outro">
        <h2>${slide.desc}</h2>
        ${slide.imgSrc ? `<img src="${slide.imgSrc}" alt="Final">` : ""}
        <div class="buttons">
          <div class="nav-buttons"> 
          <button id="prevBtn">◀ </button>
          <button id="nextSectionBtn">▶</button>
          </div>
          <button id="backToMenuBtn" class="back-to-menu">Volver al Menú</button>
        </div>
      </div>
    `;
  }

  // --- SLIDE NORMAL ---
  else {
    html = `
      <div class="slide">
        <p><strong>${index} - </strong>${slide.desc}</p>
        ${slide.imgSrc ? `<img src="${slide.imgSrc}" alt="Paso ${index}">` : ""}
        </div>
        <div class="buttons">
        <div class="nav-buttons">
        ${
          index > 0
            ? `<button id="prevBtn">◀ </button> <button id="issueBtn">⚠ </button>`
            : ""
        }
        ${
          index < slides.length - 1
            ? `<button id="nextBtn">✓</button>`
            : `<button id="finishBtn">✅ Terminar</button>`
        }

        </div>
          <button id="backToMenuBtn" class="back-to-menu"> Volver al Menú</button>
          
        </div>
    `;
  }

  container.innerHTML = html;

  // Eventos
  if (document.getElementById("nextBtn"))
    document.getElementById("nextBtn").addEventListener("click", nextSlide);
  if (document.getElementById("prevBtn"))
    document.getElementById("prevBtn").addEventListener("click", prevSlide);
  if (document.getElementById("finishBtn"))
    document
      .getElementById("finishBtn")
      .addEventListener("click", finishSlides);
  if (document.getElementById("issueBtn"))
    document
      .getElementById("issueBtn")
      .addEventListener("click", openIssueModal);
  if (document.getElementById("backToMenuBtn"))
    document
      .getElementById("backToMenuBtn")
      .addEventListener("click", backToMenu);

  // Navegar entre secciones
  if (document.getElementById("nextSectionBtn")) {
    document.getElementById("nextSectionBtn").addEventListener("click", () => {
      const params = new URLSearchParams(window.location.search);
      const oficina = params.get("oficina").toLowerCase();
      const seccion = params.get("seccion").toLowerCase();

      // Lista de zonas de cada oficina (ordenadas)
      const zonasPorOficina = {
        santarosa: ["sala360", "arcade", "cafeteria", "garaje"],
        planetanave: ["entrada", "ascensor", "nave", "oficina"],
        planetaterminator: ["terminator"],
        store: ["metahuman", "escritorio"],
      };

      const zonas = zonasPorOficina[oficina];
      const indiceActual = zonas.indexOf(seccion);
      const siguiente = zonas[indiceActual + 1];

      if (siguiente) {
        // Ir a la siguiente zona de la misma oficina
        window.location.href = `slides.html?oficina=${oficina}&seccion=${siguiente}`;
      } else {
        // Última zona → volver al menú principal (sin completar automáticamente)
        // El usuario completará desde el menú cuando todos los pasos estén listos
        window.location.href = `nav-menu.html?oficina=${oficina}`;
      }
    });
  }
}

// Navegación - Avanzar
export async function nextSlide() {
  try {
    // SOLO guardar si NO es intro/outro
    if (
      slides[currentSlideIndex].type !== "intro" &&
      slides[currentSlideIndex].type !== "outro"
    ) {
      // Primero verificar si hay una incidencia pendiente del paso actual
      const hadIncidencia = await processPendingIncidencia();

      // Si NO había incidencia, marcar el paso actual como OK
      // Pasar la descripción del paso actual
      if (!hadIncidencia) {
        const descripcionPaso = slides[currentSlideIndex].desc || "";
        await markStepAsOK(currentSeccion, currentSlideIndex, descripcionPaso);
      }
    }

    // Avanzar al siguiente slide
    if (currentSlideIndex < slides.length - 1) {
      currentSlideIndex++;
      showSlide(currentSlideIndex);
    }
  } catch (error) {
    console.error("❌ Error en nextSlide:", error);
    // Continuar de todas formas para no bloquear al usuario
    if (currentSlideIndex < slides.length - 1) {
      currentSlideIndex++;
      showSlide(currentSlideIndex);
    }
  }
}

// Navegación - Retroceder
function prevSlide() {
  if (currentSlideIndex > 0) {
    currentSlideIndex--;
    showSlide(currentSlideIndex);
  }
}

// Terminar checklist de la sección
async function finishSlides() {
  try {
    // SOLO guardar si NO es intro/outro
    if (
      slides[currentSlideIndex].type !== "intro" &&
      slides[currentSlideIndex].type !== "outro"
    ) {
      // Procesar incidencia pendiente si existe
      const hadIncidencia = await processPendingIncidencia();

      // Si NO había incidencia, marcar el último paso como OK
      if (!hadIncidencia) {
        const descripcionPaso = slides[currentSlideIndex].desc || "";
        await markStepAsOK(currentSeccion, currentSlideIndex, descripcionPaso);
      }
    }

    // Mostrar mensaje de finalización
    container.innerHTML = `
      <div class="slide">
        <h2>✅ Sección completada</h2>
        <p>Has terminado todos los pasos de <strong>${currentSeccion}</strong>.</p>
        <div class="buttons">
          <button id="backToMenuBtn">🏠 Volver al Menú</button>
        </div>
      </div>
    `;

    document.getElementById("backToMenuBtn").addEventListener("click", () => {
      const params = new URLSearchParams(window.location.search);
      const oficina = params.get("oficina");
      window.location.href = `nav-menu.html?oficina=${oficina}`;
    });
  } catch (error) {
    console.error("❌ Error al finalizar la sección:", error);
  }
}

// Volver al menú (SOLO guardar progreso, NO abortar)
async function backToMenu() {
  const confirmar = confirm(
    "¿Seguro que quieres volver al menú?\n\n" +
      "Se guardará tu progreso actual."
  );

  if (confirmar) {
    //CORRECCION TEMPORAL: no confirmar paso al volver al menu
    try {
      // SOLO guardar si NO es intro/outro
      // if (
      //   slides[currentSlideIndex].type !== "intro" &&
      //   slides[currentSlideIndex].type !== "outro"
      // ) {
      //   // Guardar el paso actual si hay progreso
      //   const hadIncidencia = await processPendingIncidencia();
      //   if (!hadIncidencia) {
      //     const descripcionPaso = slides[currentSlideIndex].desc || "";
      //     await markStepAsOK(
      //       currentSeccion,
      //       currentSlideIndex,
      //       descripcionPaso
      //     );
      //   }
      // }

      // El checklist mantiene su estado "en_progreso"

      // Redirigir al menú
      const params = new URLSearchParams(window.location.search);
      const oficina = params.get("oficina");
      window.location.href = `nav-menu.html?oficina=${oficina}`;
    } catch (error) {
      console.error("❌ Error al volver al menú:", error);
      // Redirigir de todas formas
      const params = new URLSearchParams(window.location.search);
      const oficina = params.get("oficina");
      window.location.href = `nav-menu.html?oficina=${oficina}`;
    }
  }
}
