import { openIssueModal } from "./modal.js";

// Variables
export let currentSlideIndex = 0;
export let slides = [];
let container = null;

// Renderizar slides
export function renderSlides(containerElement, slideArray) {
  container = containerElement;
  slides = slideArray;
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
        <h2>${slide.desc}</h2>
        ${slide.imgSrc ? `<img src="${slide.imgSrc}" alt="Intro">` : ""}
        <div class="buttons">
          <button id="nextBtn">Comenzar ▶</button>
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
        <button id="prevBtn">◀ Atrás</button>
        <button id="nextSectionBtn">Siguiente sección ▶</button>
      </div>
    </div>
  `;
}

  // --- SLIDE NORMAL ---
  else {
    html = `
      <div class="slide">
        <h2>Paso ${index}</h2>
        <p>${slide.desc}</p>
        <img src="${slide.imgSrc}" alt="Paso ${index}">
        <div class="buttons">
          ${index > 0 ? `<button id="prevBtn">◀ Atrás</button>` : ""}
          ${
            index < slides.length - 1
              ? `<button id="nextBtn">Continuar ▶</button>`
              : `<button id="finishBtn">✅ Terminar</button>`
          }
          <button id="issueBtn">⚠ Incidencia</button>
        </div>
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
    document.getElementById("finishBtn").addEventListener("click", nextSlide);
  if (document.getElementById("issueBtn"))
    document.getElementById("issueBtn").addEventListener("click", openIssueModal);
  
  //navegar entre secciones
  if (document.getElementById("nextSectionBtn")) {
  document.getElementById("nextSectionBtn").addEventListener("click", () => {
    const params = new URLSearchParams(window.location.search);
    const oficina = params.get("oficina").toLowerCase();
    const seccion = params.get("seccion").toLowerCase();

    // Lista de zonas de cada oficina (ordenadas)
    const zonasPorOficina = {
      santarosa: ["sala360", "arcade", "cafeteria", "garaje"],
      planetanave: ["entrada", "ascensor", "nave", "oficina"],
      planetaterminator: ["entrada", "pantallas"],
      store: ["metahuman", "recepcion"],
    };

    const zonas = zonasPorOficina[oficina];
    const indiceActual = zonas.indexOf(seccion);
    const siguiente = zonas[indiceActual + 1];

    if (siguiente) {
      // Ir a la siguiente zona de la misma oficina
      window.location.href = `slides.html?oficina=${oficina}&seccion=${siguiente}`;
    } else {
      // Última zona → volver al menú principal
      window.location.href = "index.html"; // Cambia por tu menú real
    }
  });
}

}


// Navegación
export function nextSlide() {
  if (currentSlideIndex < slides.length - 1) {
    currentSlideIndex++;
    showSlide(currentSlideIndex);
  }
}

function prevSlide() {
  if (currentSlideIndex > 0) {
    currentSlideIndex--;
    showSlide(currentSlideIndex);
  }
}

function finishSlides() {
  container.innerHTML = `
    <div class="slide">
      <h2>✅ Checklist completado</h2>
      <p>Has terminado todos los pasos de esta sala.</p>
    </div>
  `;
}
