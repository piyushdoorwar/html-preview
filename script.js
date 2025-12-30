const iframe = document.getElementById("preview-iframe");
const codeAreas = document.querySelectorAll(".code-area");
const tabs = document.querySelectorAll(".tab-button");
let updateTimer = null;

function composePreview() {
  const html = document.getElementById("html").value;
  const css = document.getElementById("css").value;
  const script = document.getElementById("script").value;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${css}</style></head><body>${html}<script>${script}</script></body></html>`;
}

function refreshPreview() {
  iframe.srcdoc = composePreview();
}

function scheduleRefresh() {
  clearTimeout(updateTimer);
  updateTimer = setTimeout(() => {
    refreshPreview();
  }, 200);
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((btn) => btn.classList.remove("active"));
    tab.classList.add("active");
    const target = tab.dataset.target;
    codeAreas.forEach((area) => {
      area.classList.toggle("hidden", area.dataset.panel !== target);
    });
  });
});

codeAreas.forEach((area) => {
  area.addEventListener("input", scheduleRefresh);
});

refreshPreview();
