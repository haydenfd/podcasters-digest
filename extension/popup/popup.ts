interface ProcessingState {
  status: "extracting" | "calling_llm" | "writing" | "done" | "error";
  message: string;
  error?: string;
}

interface LLMConfig {
  baseURL: string;
  model: string;
  apiKey: string;
  obsidianPort?: number;
}

interface ExtractResponse {
  success: boolean;
  article?: {
    title: string;
    content: string;
    url: string;
  };
  error?: string;
}

interface ProcessResponse {
  success: boolean;
  path?: string;
  error?: string;
}

interface StateUpdateMessage {
  type: "STATE_UPDATE";
  state: ProcessingState;
}

const digestBtn = document.getElementById("digestBtn") as HTMLButtonElement;
const settingsBtn = document.getElementById("settingsBtn") as HTMLButtonElement;
const saveSettingsBtn = document.getElementById("saveSettingsBtn") as HTMLButtonElement;
const backBtn = document.getElementById("backBtn") as HTMLButtonElement;
const statusDiv = document.getElementById("status") as HTMLDivElement;
const progressDiv = document.getElementById("progress") as HTMLDivElement;
const mainView = document.getElementById("mainView") as HTMLDivElement;
const settingsView = document.getElementById("settingsView") as HTMLDivElement;

const baseURLInput = document.getElementById("baseURL") as HTMLInputElement;
const modelInput = document.getElementById("model") as HTMLInputElement;
const apiKeyInput = document.getElementById("apiKey") as HTMLInputElement;
const obsidianPortInput = document.getElementById("obsidianPort") as HTMLInputElement;

// Load initial state
chrome.runtime.sendMessage({ type: "GET_STATE" }, (state: ProcessingState) => {
  if (state && state.status !== "done") {
    updateProgress(state);
  }
});

// Listen for state updates
chrome.runtime.onMessage.addListener((message: StateUpdateMessage) => {
  if (message.type === "STATE_UPDATE") {
    updateProgress(message.state);
  }
});

digestBtn.addEventListener("click", async () => {
  try {
    digestBtn.disabled = true;
    statusDiv.className = "status processing";
    statusDiv.textContent = "Starting...";
    statusDiv.classList.remove("hidden");
    progressDiv.classList.remove("hidden");

    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.id) {
      throw new Error("No active tab found");
    }

    // Request article extraction from content script
    const response = await chrome.tabs.sendMessage(tab.id, { type: "EXTRACT_ARTICLE" }) as ExtractResponse;

    if (!response.success) {
      throw new Error(response.error || "Failed to extract article");
    }

    // Send to background for processing
    chrome.runtime.sendMessage(
      { type: "PROCESS_ARTICLE", article: response.article },
      (result: ProcessResponse) => {
        if (result.success) {
          statusDiv.className = "status success";
          statusDiv.textContent = `Success! Saved to ${result.path}`;
        } else {
          statusDiv.className = "status error";
          statusDiv.textContent = `Error: ${result.error}`;
        }
        digestBtn.disabled = false;
      }
    );
  } catch (error) {
    statusDiv.className = "status error";
    statusDiv.textContent = `Error: ${error instanceof Error ? error.message : String(error)}`;
    digestBtn.disabled = false;
    progressDiv.classList.add("hidden");
  }
});

settingsBtn.addEventListener("click", () => {
  mainView.classList.add("hidden");
  settingsView.classList.remove("hidden");

  // Load current config
  chrome.runtime.sendMessage({ type: "GET_CONFIG" }, (config: LLMConfig | null) => {
    if (config) {
      baseURLInput.value = config.baseURL || "";
      modelInput.value = config.model || "";
      apiKeyInput.value = config.apiKey || "";
      obsidianPortInput.value = String(config.obsidianPort || 27123);
    }
  });
});

saveSettingsBtn.addEventListener("click", () => {
  const config = {
    baseURL: baseURLInput.value,
    model: modelInput.value,
    apiKey: apiKeyInput.value,
    obsidianPort: parseInt(obsidianPortInput.value) || 27123,
  };

  chrome.runtime.sendMessage({ type: "SAVE_CONFIG", config }, () => {
    settingsView.classList.add("hidden");
    mainView.classList.remove("hidden");
  });
});

backBtn.addEventListener("click", () => {
  settingsView.classList.add("hidden");
  mainView.classList.remove("hidden");
});

function updateProgress(state: ProcessingState) {
  const steps = [
    document.getElementById("step1"),
    document.getElementById("step2"),
    document.getElementById("step3"),
    document.getElementById("step4"),
  ];

  // Reset all steps
  steps.forEach((step) => {
    if (step) {
      step.className = "step";
    }
  });

  if (state.status === "extracting" && steps[0]) {
    steps[0].className = "step active";
  } else if (state.status === "calling_llm") {
    if (steps[0]) steps[0].className = "step done";
    if (steps[1]) steps[1].className = "step active";
  } else if (state.status === "writing") {
    if (steps[0]) steps[0].className = "step done";
    if (steps[1]) steps[1].className = "step done";
    if (steps[2]) steps[2].className = "step active";
  } else if (state.status === "done") {
    steps.forEach((step) => {
      if (step) step.className = "step done";
    });
  } else if (state.status === "error") {
    statusDiv.className = "status error";
    statusDiv.textContent = `Error: ${state.error}`;
    progressDiv.classList.add("hidden");
  }
}
