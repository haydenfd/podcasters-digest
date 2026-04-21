interface ProcessingState {
  status: "fetching" | "writing" | "done" | "error";
  message: string;
  error?: string;
}

interface SaveResponse {
  success: boolean;
  path?: string;
  error?: string;
}

interface StateUpdateMessage {
  type: "STATE_UPDATE";
  state: ProcessingState;
}

interface DigestEntry {
  title: string;
  domain: string;
  url: string;
  timestamp: number;
}

const STORAGE_KEY = 'pd_digests';

// DOM Elements
const currentUrlEl = document.getElementById("current-url") as HTMLDivElement;
const digestBtn = document.getElementById("digest-btn") as HTMLButtonElement;
const btnText = document.getElementById("btn-text") as HTMLSpanElement;
const btnArrow = document.getElementById("btn-arrow") as SVGElement;
const btnSpinner = document.getElementById("btn-spinner") as HTMLDivElement;
const progressBlock = document.getElementById("progress-block") as HTMLDivElement;
const progressPhase = document.getElementById("progress-phase") as HTMLDivElement;
const progressBar = document.getElementById("progress-bar") as HTMLDivElement;
const progressSub = document.getElementById("progress-sub") as HTMLDivElement;
const libraryEmpty = document.getElementById("library-empty") as HTMLDivElement;
const libraryList = document.getElementById("library-list") as HTMLDivElement;

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.getAttribute('data-tab');
    switchTab(tabName as 'digest' | 'library');
  });
});

function switchTab(tabName: 'digest' | 'library') {
  // Update tab active states
  document.querySelectorAll('.tab').forEach(t => {
    if (t.getAttribute('data-tab') === tabName) {
      t.classList.add('active');
    } else {
      t.classList.remove('active');
    }
  });

  // Update view active states
  document.querySelectorAll('.view').forEach(v => {
    v.classList.remove('active');
  });

  if (tabName === 'digest') {
    document.getElementById('digest-view')?.classList.add('active');
  } else {
    document.getElementById('library-view')?.classList.add('active');
    renderLibrary();
  }
}

// Load initial state
chrome.runtime.sendMessage({ type: "GET_STATE" }, (state: ProcessingState) => {
  if (state && state.status !== "done") {
    updateProgress(state);
  }
});

// Get current URL
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]?.url) {
    try {
      const url = new URL(tabs[0].url);
      currentUrlEl.textContent = url.hostname + url.pathname;
    } catch {
      currentUrlEl.textContent = tabs[0].url;
    }
  }
});

// Listen for state updates
chrome.runtime.onMessage.addListener((message: StateUpdateMessage) => {
  if (message.type === "STATE_UPDATE") {
    updateProgress(message.state);
  }
});

// Digest button click
digestBtn.addEventListener("click", async () => {
  try {
    digestBtn.disabled = true;
    btnArrow.classList.add('hidden');
    btnSpinner.classList.remove('hidden');
    progressBlock.classList.add('active');

    // Get active tab URL
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url) {
      throw new Error("No URL found in active tab");
    }

    // Send URL to background for Jina processing
    chrome.runtime.sendMessage(
      { type: "PROCESS_URL", url: tab.url },
      (result: SaveResponse) => {
        if (result.success) {
          // Show success
          updateProgressPhase("Done.", 100, "saved to obsidian");

          // Refresh library after a moment
          setTimeout(() => {
            renderLibrary();
            resetUI();
          }, 1000);
        } else {
          updateProgressPhase("Error", 0, result.error || "failed");
          setTimeout(() => {
            resetUI();
          }, 3000);
        }
      }
    );
  } catch (error) {
    updateProgressPhase("Error", 0, error instanceof Error ? error.message : String(error));
    setTimeout(() => {
      resetUI();
    }, 3000);
  }
});

function resetUI() {
  digestBtn.disabled = false;
  btnArrow.classList.remove('hidden');
  btnSpinner.classList.add('hidden');
  progressBlock.classList.remove('active');
}

function updateProgress(state: ProcessingState) {
  if (state.status === "fetching") {
    updateProgressPhase("Fetching content...", 25, "via jina reader");
  } else if (state.status === "writing") {
    updateProgressPhase("Writing to Obsidian...", 88, "saving markdown");
  } else if (state.status === "done") {
    updateProgressPhase("Done.", 100, "saved successfully");
  } else if (state.status === "error") {
    updateProgressPhase("Error", 0, state.error || "unknown error");
  }
}

function updateProgressPhase(phase: string, percent: number, sub: string) {
  progressPhase.textContent = phase;
  progressBar.style.width = `${percent}%`;
  progressSub.textContent = sub;
}


function renderLibrary() {
  chrome.storage.local.get(['pd_digests'], (result) => {
    const digests: DigestEntry[] = result.pd_digests || [];

    if (digests.length === 0) {
      libraryEmpty.style.display = 'block';
      libraryList.innerHTML = '';
      return;
    }

    libraryEmpty.style.display = 'none';
    libraryList.innerHTML = digests.map(entry => {
      const isFresh = Date.now() - entry.timestamp < 5 * 60 * 1000; // 5 minutes
      const timeAgo = formatTimeAgo(entry.timestamp);

      return `
        <div class="library-item">
          <div class="library-dot ${isFresh ? '' : 'old'}"></div>
          <div class="library-content">
            <div class="library-title">${escapeHtml(entry.title)}</div>
            <div class="library-meta">${escapeHtml(entry.domain)} · ${timeAgo}</div>
          </div>
          <div class="library-arrow">
            <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 3l4 4-4 4" stroke="#6b6b6b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      `;
    }).join('');
  });
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// Initial library render
renderLibrary();
