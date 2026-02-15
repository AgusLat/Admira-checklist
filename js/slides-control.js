import { openIssueModal } from "./modal.js";
import { markStepAsOK, processPendingIncidencia } from "./incidencias.js";
import { slidesMap } from "../slides/slides-template.js";

// ─────────────────────────────────────────────
// ESTADO
// ─────────────────────────────────────────────

export let currentSlideIndex = 0;
export let slides = [];
let container = null;
let currentSeccion = null;

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    oficina: params.get("oficina")?.toLowerCase(),
    seccion: params.get("seccion")?.toLowerCase(),
  };
}

function redirectTo(path) {
  window.location.href = path;
}

function isNormalSlide(index) {
  const type = slides[index]?.type;
  return type !== "intro" && type !== "outro";
}

// Fade-out solo del contenido (no los botones), resuelve al terminar
function fadeOutContent() {
  return new Promise((resolve) => {
    const content = container.querySelector(".slide-content");
    if (!content) {
      resolve();
      return;
    }
    content.style.transition = "opacity 0.15s ease";
    content.style.opacity = "0";
    setTimeout(resolve, 150);
  });
}

// Fade-in de la imagen: espera load real o caché
function fadeInImage(img) {
  img.style.opacity = "0";
  img.style.transition = "opacity 0.3s ease";

  const show = () => {
    img.style.opacity = "1";
  };

  if (img.complete && img.naturalWidth > 0) {
    requestAnimationFrame(() => requestAnimationFrame(show));
  } else {
    img.addEventListener("load", show, { once: true });
    img.addEventListener("error", show, { once: true });
  }
}

// ─────────────────────────────────────────────
// TEMPLATES HTML
// ─────────────────────────────────────────────
// Estructura: .slide-content (anima) + .buttons (siempre visible)

function templateIntro(slide) {
  return `
    <div class="slide-content slide--intro">
      <h3>Sección: </h3>
      <h2>${slide.desc}</h2>
      
    </div>
    <div class="buttons">
      <button id="nextBtn" class="btn--wide">Comenzar</button>
      <button id="backToMenuBtn" class="btn--menu">Volver al Menú</button>
    </div>
  `;
}

function templateOutro(slide) {
  return `
    <div class="slide-content slide--outro">
     <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" fill="currentColor" class="icon icon-tabler icons-tabler-filled icon-tabler-circle-check"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z" /></svg>
      <h2>${slide.desc}</h2>
    </div>
    <div class="buttons">
      <div class="nav-buttons">
        <button id="prevBtn" class="btn--nav">Anterior</button>
        <button id="nextSectionBtn" class="btn--next-section">Siguiente sección</button>
      </div>
      <button id="backToMenuBtn" class="btn--menu">Volver al Menú</button>
    </div>
  `;
}

function templateSlide(slide, index) {
  const isFirst = index === 0;
  const isLast = index >= slides.length - 1;

  return `
    <div class="slide-content">
      <p><strong>${index} - </strong>${slide.desc}</p>
      ${slide.imgSrc ? `<img src="${slide.imgSrc}" alt="Paso ${index}">` : ""}
    </div>
    <div class="buttons">
      <div class="nav-buttons">
        ${!isFirst ? `<button id="prevBtn" class="btn--nav">◀</button><button id="issueBtn" class="btn--issue">⚠</button>` : ""}
        ${
          !isLast
            ? `<button id="nextBtn" class="btn--confirm">✓</button>`
            : `<button id="finishBtn" class="btn--finish">✅ Terminar</button>`
        }
      </div>
      <button id="backToMenuBtn" class="btn--menu">Volver al Menú</button>
    </div>
  `;
}

function templateFinish() {
  return `
    <div class="slide-content">
      <h2>✅ Sección completada</h2>
      <p>Has terminado todos los pasos de <strong>${currentSeccion}</strong>.</p>
    </div>
    <div class="buttons">
      <button id="backToMenuBtn" class="btn--menu">🏠 Volver al Menú</button>
    </div>
  `;
}

// ─────────────────────────────────────────────
// EVENTOS
// ─────────────────────────────────────────────

function bindPressEffect() {
  if (container.dataset.pressEffect) return;

  container.addEventListener("pointerdown", (e) => {
    e.target.closest("button")?.classList.add("is-pressed");
  });

  container.addEventListener("pointerup", (e) => {
    const btn = e.target.closest("button");
    if (btn) setTimeout(() => btn.classList.remove("is-pressed"), 120);
  });

  container.addEventListener("pointercancel", (e) => {
    e.target.closest("button")?.classList.remove("is-pressed");
  });

  container.dataset.pressEffect = "true";
}

function bindSlideEvents() {
  document.getElementById("nextBtn")?.addEventListener("click", nextSlide);
  document.getElementById("prevBtn")?.addEventListener("click", prevSlide);
  document.getElementById("finishBtn")?.addEventListener("click", finishSlides);
  document
    .getElementById("issueBtn")
    ?.addEventListener("click", openIssueModal);
  document
    .getElementById("backToMenuBtn")
    ?.addEventListener("click", backToMenu);
  document
    .getElementById("nextSectionBtn")
    ?.addEventListener("click", goToNextSection);
}

// ─────────────────────────────────────────────
// RENDERIZADO
// ─────────────────────────────────────────────

export function renderSlides(containerElement, slideArray, seccion) {
  container = containerElement;
  slides = slideArray;
  currentSeccion = seccion;
  showSlide(currentSlideIndex);
}

function showSlide(index) {
  const slide = slides[index];

  if (slide.type === "intro") {
    container.innerHTML = templateIntro(slide);
  } else if (slide.type === "outro") {
    container.innerHTML = templateOutro(slide);
  } else {
    container.innerHTML = templateSlide(slide, index);
  }

  // Fade-in del contenido (sin tocar los botones)
  const content = container.querySelector(".slide-content");
  if (content) {
    content.style.opacity = "0";
    content.style.transition = "opacity 0.2s ease";
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        content.style.opacity = "1";
      }),
    );
  }

  // Fade-in de la imagen una vez cargada
  const img = container.querySelector("img");
  if (img) fadeInImage(img);

  bindPressEffect();
  bindSlideEvents();
}

// ─────────────────────────────────────────────
// NAVEGACIÓN
// ─────────────────────────────────────────────

export async function nextSlide() {
  try {
    if (isNormalSlide(currentSlideIndex)) {
      const hadIncidencia = await processPendingIncidencia();
      if (!hadIncidencia) {
        const descripcionPaso = slides[currentSlideIndex].desc || "";
        await markStepAsOK(currentSeccion, currentSlideIndex, descripcionPaso);
      }
    }

    if (currentSlideIndex < slides.length - 1) {
      await fadeOutContent();
      currentSlideIndex++;
      showSlide(currentSlideIndex);
    }
  } catch (error) {
    console.error("❌ Error en nextSlide:", error);
    if (currentSlideIndex < slides.length - 1) {
      currentSlideIndex++;
      showSlide(currentSlideIndex);
    }
  }
}

async function prevSlide() {
  if (currentSlideIndex > 0) {
    await fadeOutContent();
    currentSlideIndex--;
    showSlide(currentSlideIndex);
  }
}

function goToNextSection() {
  const { oficina, seccion } = getUrlParams();

  if (!oficina || !seccion) {
    console.error("❌ Faltan parámetros en la URL");
    redirectTo("nav-menu.html");
    return;
  }

  const slidesOficina = slidesMap[oficina];

  if (!slidesOficina) {
    console.error("❌ Oficina inexistente:", oficina);
    redirectTo(`nav-menu.html?oficina=${oficina}`);
    return;
  }

  const zonas = Object.keys(slidesOficina);
  const indiceActual = zonas.indexOf(seccion);

  if (indiceActual === -1) {
    console.warn(
      `⚠️ Sección '${seccion}' no encontrada. Redirigiendo a la primera válida.`,
    );
    redirectTo(`slides.html?oficina=${oficina}&seccion=${zonas[0]}`);
    return;
  }

  const siguienteZona = zonas[indiceActual + 1];

  redirectTo(
    siguienteZona
      ? `slides.html?oficina=${oficina}&seccion=${siguienteZona}`
      : `nav-menu.html?oficina=${oficina}`,
  );
}

// ─────────────────────────────────────────────
// ACCIONES FINALES
// ─────────────────────────────────────────────

async function finishSlides() {
  try {
    if (isNormalSlide(currentSlideIndex)) {
      const hadIncidencia = await processPendingIncidencia();
      if (!hadIncidencia) {
        const descripcionPaso = slides[currentSlideIndex].desc || "";
        await markStepAsOK(currentSeccion, currentSlideIndex, descripcionPaso);
      }
    }

    container.innerHTML = templateFinish();

    document.getElementById("backToMenuBtn").addEventListener("click", () => {
      const { oficina } = getUrlParams();
      redirectTo(`nav-menu.html?oficina=${oficina}`);
    });
  } catch (error) {
    console.error("❌ Error al finalizar la sección:", error);
  }
}

async function backToMenu() {
  const confirmar = confirm(
    "¿Seguro que quieres volver al menú?\n\nSe guardará tu progreso actual.",
  );

  if (!confirmar) return;

  const { oficina } = getUrlParams();
  redirectTo(`nav-menu.html?oficina=${oficina}`);
}
