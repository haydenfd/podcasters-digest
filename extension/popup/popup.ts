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
    statusDiv.textContent = "Processing...";
    statusDiv.classList.remove("hidden");
    progressDiv.classList.remove("hidden");

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
  ];

  // Reset all steps
  steps.forEach((step) => {
    if (step) {
      step.className = "step";
    }
  });

  if (state.status === "fetching" && steps[0]) {
    steps[0].className = "step active";
  } else if (state.status === "writing") {
    if (steps[0]) steps[0].className = "step done";
    if (steps[1]) steps[1].className = "step active";
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
