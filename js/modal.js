import { currentSlideIndex, slides } from "./slides-control.js";

export const openIssueModal = () => {
  const modal = document.getElementById("issueModal");
  const stepLabel = document.getElementById("issueStep");
  stepLabel.innerText = `Paso ${currentSlideIndex}: ${slides[currentSlideIndex].desc}`;
  modal.style.display = "flex";
};

export const closeIssueModal = () => {
  const modal = document.getElementById("issueModal");
  if (modal) modal.style.display = "none";

  const desc = document.getElementById("issueDesc");
  if (desc) desc.value = "";

  const file = document.getElementById("issueFile");
  if (file) file.value = "";

  const sendBtn = document.getElementById("sendIssueBtn");
  if (sendBtn) sendBtn.disabled = false;
};
