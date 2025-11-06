import { reportIssue } from "./incidencias.js";

// Variables
let currentSlideIndex = 0;
let slides = [];
let container = null;
let oficina = "";
let seccion = "";

// Renderizar slides
export function renderSlides(
  containerElement,
  slideArray,
  nombreSeccion,
  nombreOficina
) {
  oficina = nombreOficina;
  seccion = nombreSeccion;
  slides = slideArray;
  container = containerElement;
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
          <button id="nextBtn">Siguiente sección</button>
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
  if (document.getElementById("restartBtn"))
    document.getElementById("restartBtn").addEventListener("click", () => {
      // Volver a la introducción (slide 0)
      currentSlideIndex = 0;
      showSlide(currentSlideIndex);
    });

  // === Incidencias ===
  // ABRE MODAL
  if (document.getElementById("issueBtn"))
    document
      .getElementById("issueBtn")
      .addEventListener("click", openIssueModal);
  // CIERRA MODAL
  if (document.getElementById("cancelIssueBtn"))
    document
      .getElementById("cancelIssueBtn")
      .addEventListener("click", closeIssueModal);
  // ENVÍA INCIDENCIA
  if (document.getElementById("sendIssueBtn"))
    document.getElementById("sendIssueBtn").addEventListener("click", () => {
      const issueDesc = document.getElementById("issueDesc").value.trim();
      const issue = {
        oficina: oficina,
        seccion: seccion,
        incidencia: issueDesc,
        paso: currentSlideIndex + 1,
        pasoDesc: slides[currentSlideIndex].desc,
      };
      reportIssue(issue);
      closeIssueModal();
    });
}

// === MODAL ===
function openIssueModal() {
  const modal = document.getElementById("issueModal");
  const stepLabel = document.getElementById("issueStep");
  stepLabel.innerText = `Paso ${currentSlideIndex + 1}: ${
    slides[currentSlideIndex].desc
  }`;
  modal.style.display = "flex";
}

function closeIssueModal() {
  document.getElementById("issueModal").style.display = "none";
  document.getElementById("issueDesc").value = "";
  document.getElementById("issueFile").value = "";
}

// Navegación
export const nextSlide = () => {
  if (currentSlideIndex < slides.length - 1) {
    currentSlideIndex++;
    showSlide(currentSlideIndex);
  }
};

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
