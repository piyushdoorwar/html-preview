const iframe = document.getElementById("preview-iframe");
const tabs = document.querySelectorAll(".tab-button");
let updateTimer = null;
let htmlEditor, cssEditor, scriptEditor;
let isLightMode = false;

// Resizer functionality
const resizer = document.querySelector('.resizer');
const editorPanel = document.querySelector('.editor-panel');
const previewPanel = document.querySelector('.preview-panel');
let isResizing = false;

if (resizer) {
  resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    resizer.classList.add('resizing');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;

    const containerRect = document.querySelector('.panels').getBoundingClientRect();
    const offsetX = e.clientX - containerRect.left;
    const totalWidth = containerRect.width;
    const editorWidth = (offsetX / totalWidth) * 100;
    const previewWidth = 100 - editorWidth;

    // Set minimum widths (25% each)
    if (editorWidth >= 25 && previewWidth >= 25) {
      editorPanel.style.flex = `0 0 ${editorWidth}%`;
      previewPanel.style.flex = `0 0 ${previewWidth}%`;
      
      // Refresh CodeMirror to prevent display issues
      if (htmlEditor) htmlEditor.refresh();
      if (cssEditor) cssEditor.refresh();
      if (scriptEditor) scriptEditor.refresh();
    }
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      resizer.classList.remove('resizing');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  });
}

function composePreview() {
  const html = htmlEditor.getValue();
  const css = cssEditor.getValue();
  const script = scriptEditor.getValue();
  const bodyClass = isLightMode ? ' class="light-mode"' : '';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${css}</style></head><body${bodyClass}>${html}<script>${script}</script></body></html>`;
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
    
    // Update language label
    const languageLabel = document.getElementById('language-label');
    if (target === 'html') {
      languageLabel.textContent = '.html';
    } else if (target === 'css') {
      languageLabel.textContent = '.css';
    } else if (target === 'script') {
      languageLabel.textContent = '.js';
    }
    
    htmlEditor.getWrapperElement().style.display = target === 'html' ? 'block' : 'none';
    cssEditor.getWrapperElement().style.display = target === 'css' ? 'block' : 'none';
    scriptEditor.getWrapperElement().style.display = target === 'script' ? 'block' : 'none';
  });
});

// Initialize editors
htmlEditor = CodeMirror.fromTextArea(document.getElementById('html'), {
  mode: 'htmlmixed',
  theme: 'dracula',
  lineNumbers: true,
  lineWrapping: true,
  styleActiveLine: true,
  matchBrackets: true,
});

cssEditor = CodeMirror.fromTextArea(document.getElementById('css'), {
  mode: 'css',
  theme: 'dracula',
  lineNumbers: true,
  lineWrapping: true,
  styleActiveLine: true,
  matchBrackets: true,
});

scriptEditor = CodeMirror.fromTextArea(document.getElementById('script'), {
  mode: 'javascript',
  theme: 'dracula',
  lineNumbers: true,
  lineWrapping: true,
  styleActiveLine: true,
  matchBrackets: true,
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

// Get current active editor
function getCurrentEditor() {
  const activeTab = document.querySelector('.tab-button.active');
  const target = activeTab.dataset.target;
  if (target === 'html') return htmlEditor;
  if (target === 'css') return cssEditor;
  if (target === 'script') return scriptEditor;
  return htmlEditor;
}

// Toast notification function
function showToast(message) {
  const toastContainer = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Copy button functionality
const copyBtn = document.getElementById('copy-btn');
copyBtn.addEventListener('click', async () => {
  const editor = getCurrentEditor();
  const code = editor.getValue();
  try {
    await navigator.clipboard.writeText(code);
    copyBtn.style.color = '#FFD700';
    showToast('Text copied');
    setTimeout(() => {
      copyBtn.style.color = '';
    }, 1000);
  } catch (err) {
    console.error('Failed to copy:', err);
    showToast('Failed to copy');
  }
});

// Paste button functionality
const pasteBtn = document.getElementById('paste-btn');
pasteBtn.addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    const editor = getCurrentEditor();
    editor.setValue(text);
    pasteBtn.style.color = '#FFD700';
    showToast('Pasted from clipboard');
    setTimeout(() => {
      pasteBtn.style.color = '';
    }, 1000);
  } catch (err) {
    console.error('Failed to paste:', err);
    showToast('Failed to paste');
  }
});

// Clear button functionality
const clearBtn = document.getElementById('clear-btn');
clearBtn.addEventListener('click', () => {
  const editor = getCurrentEditor();
  editor.setValue('');
  clearBtn.style.color = '#FFD700';
  showToast('Cleared');
  setTimeout(() => {
    clearBtn.style.color = '';
  }, 1000);
});

// Undo button functionality
const undoBtn = document.getElementById('undo-btn');
undoBtn.addEventListener('click', () => {
  const editor = getCurrentEditor();
  editor.undo();
  undoBtn.style.color = '#FFD700';
  showToast('Changes undone');
  setTimeout(() => {
    undoBtn.style.color = '';
  }, 1000);
});

// Theme toggle for preview only
const themeToggle = document.getElementById('theme-toggle');
const sunIcon = themeToggle.querySelector('.sun-icon');
const moonIcon = themeToggle.querySelector('.moon-icon');

themeToggle.addEventListener('click', () => {
  isLightMode = !isLightMode;
  
  // Toggle icons
  sunIcon.classList.toggle('hidden');
  moonIcon.classList.toggle('hidden');
  
  // Refresh preview with new theme
  refreshPreview();
  
  // Show toast
  showToast(isLightMode ? 'Light mode enabled' : 'Dark mode enabled');
});

refreshPreview();
