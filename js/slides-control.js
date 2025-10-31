/*import { slidesSantaRosa } from "../slides/slides.js"

export const nextSlide = ()=>{
    console.log("test")
    console.log(slidesSantaRosa.arcade[1].desc)
}*/

import { slidesSantaRosa } from "../slides/slides.js";

// Variables
let currentSlideIndex = 0;


// Renderizar slides
export function renderSlides(container) {
  
  container.innerHTML = ''; // Limpiar anteriores

  slides.forEach((slide, i) => {
    const div = document.createElement('div');
    div.className = 'slide';
    if (i === 0) div.classList.add('active');

    if (slide.type === 'section') {
      div.innerHTML = `
        <h1>${slide.title}</h1>
        <p>Revisa todos los pasos de esta sala</p>
        <div class="buttons">
          <button class="continuaBtn" onclick="nextSlide()">Continuar ▶</button>
        </div>`;
    } else if (slide.type === 'issue') {
      div.innerHTML = `
        <h1>${slide.title}</h1>
        <p>${slide.text}</p>
        <form onsubmit="submitIssueForm(event)">
          <textarea id="issueDesc" placeholder="Describe la incidencia..." rows="4"></textarea>
          <input type="file" id="issueFile" accept="image/*"><br><br>

          <div class="buttons">
            <button class="atrasBtn" type="button" onclick="prevSlide()">◀ Atrás</button>
            <button class="continuaBtn" type="submit">Enviar</button>
          </div>
      </form>`;
    } else {
      div.innerHTML = `
        <h2>${slide.text}</h2>
        <img src="${slide.img}" alt="${slide.text}">
        <div class="buttons">
          <button class="atrasBtn" onclick="prevSlide()">◀ Atrás</button>
          <button class="continuaBtn" onclick="nextSlide()">✔ Hecho</button>
          <button class="issue" onclick="reportIssue('${slide.text}')">⚠ Incidencia</button>
        </div>`;
    }
    container.appendChild(div);
  });
}

// Mostrar una slide
function showSlide(i) {
  const slides = document.querySelectorAll('.slide');
  slides.forEach((s, index) => {
    s.classList.toggle('active', index === i);
  });
}

// Navegación
function nextSlide() {
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

// Incidencias
function reportIssue(text) {
  const issueSlide = {
    type: "issue",
    title: "Reportar incidencia",
    text: text
  };

  slides.splice(currentSlideIndex + 1, 0, issueSlide);
  nextSlide();
}

function submitIssueForm(event) {
  event.preventDefault();

  const desc = document.getElementById("issueDesc").value.trim();
  const fileInput = document.getElementById("issueFile");
  const file = fileInput.files[0] || null;

  if (!desc && !file) {
    alert("Por favor, escribe una descripción Y/o adjunta una imagen.");
    return;
  }

  const issue = {
    text: slides[currentSlideIndex].text,
    description: desc,
    fileName: file ? file.name : null,
    date: new Date().toISOString()
  };

  const saved = JSON.parse(localStorage.getItem("incidencias") || "[]");
  saved.push(issue);
  localStorage.setItem("incidencias", JSON.stringify(saved));

  nextSlide();
}

