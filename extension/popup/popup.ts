interface ProcessingState {
  status: "extracting" | "calling_llm" | "writing" | "done" | "error";
  message: string;
  error?: string;
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
const statusDiv = document.getElementById("status") as HTMLDivElement;
const progressDiv = document.getElementById("progress") as HTMLDivElement;

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

    // Check if we're on a Substack page
    if (!tab.url || !tab.url.includes('substack.com')) {
      throw new Error("Please navigate to a Substack article first");
    }

    // Request article extraction from content script
    let response: ExtractResponse;
    try {
      response = await chrome.tabs.sendMessage(tab.id, { type: "EXTRACT_ARTICLE" }) as ExtractResponse;
    } catch (e) {
      throw new Error("Content script not loaded. Try refreshing the Substack page.");
    }

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
