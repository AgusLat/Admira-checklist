import { currentSlideIndex, slides } from "./slides-control.js";

export const openIssueModal = () => {
  const modal = document.getElementById("issueModal");
  const stepLabel = document.getElementById("issueStep");
  stepLabel.innerText = `Paso ${currentSlideIndex}: ${
    slides[currentSlideIndex].desc
  }`;
  modal.style.display = "flex";
}

export const closeIssueModal = () => {
  document.getElementById("issueModal").style.display = "none";
  document.getElementById("issueDesc").value = "";
  document.getElementById("issueFile").value = "";
}