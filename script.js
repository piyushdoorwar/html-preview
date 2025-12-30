const iframe = document.getElementById("preview-iframe");
const tabs = document.querySelectorAll(".tab-button");
let updateTimer = null;
let htmlEditor, cssEditor, scriptEditor;

function composePreview() {
  const html = htmlEditor.getValue();
  const css = cssEditor.getValue();
  const script = scriptEditor.getValue();
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
    htmlEditor.getWrapperElement().style.display = target === 'html' ? 'block' : 'none';
    cssEditor.getWrapperElement().style.display = target === 'css' ? 'block' : 'none';
    scriptEditor.getWrapperElement().style.display = target === 'script' ? 'block' : 'none';
  });
});

// Initialize editors
htmlEditor = CodeMirror.fromTextArea(document.getElementById('html'), {
  mode: 'htmlmixed',
  theme: 'monokai',
  lineNumbers: true,
  lineWrapping: true,
});

cssEditor = CodeMirror.fromTextArea(document.getElementById('css'), {
  mode: 'css',
  theme: 'monokai',
  lineNumbers: true,
  lineWrapping: true,
});

scriptEditor = CodeMirror.fromTextArea(document.getElementById('script'), {
  mode: 'javascript',
  theme: 'monokai',
  lineNumbers: true,
  lineWrapping: true,
});

// Initially show html
cssEditor.getWrapperElement().style.display = 'none';
scriptEditor.getWrapperElement().style.display = 'none';

// Attach change listeners
htmlEditor.on('change', scheduleRefresh);
cssEditor.on('change', scheduleRefresh);
scriptEditor.on('change', scheduleRefresh);

function downloadZip() {
  const zip = new JSZip();
  zip.file('index.html', htmlEditor.getValue());
  zip.file('styles.css', cssEditor.getValue());
  zip.file('script.js', scriptEditor.getValue());
  zip.generateAsync({ type: 'blob' }).then(function(content) {
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'html-preview.zip';
    a.click();
    URL.revokeObjectURL(url);
  });
}

const downloadZipBtn = document.getElementById('download-zip');
downloadZipBtn.addEventListener('click', downloadZip);

refreshPreview();
