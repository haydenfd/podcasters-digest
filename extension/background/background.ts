import { writeNote } from "../shared/writer.js";

interface ProcessingState {
  status: "extracting" | "writing" | "done" | "error";
  message: string;
  error?: string;
}

let currentState: ProcessingState = {
  status: "done",
  message: "",
};

// Handle badge setting
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SET_BADGE") {
    if (sender.tab?.id) {
      chrome.action.setBadgeText({ text: "✓", tabId: sender.tab.id });
      chrome.action.setBadgeBackgroundColor({ color: "#10b981", tabId: sender.tab.id });
    }
  }

  if (message.type === "GET_STATE") {
    sendResponse(currentState);
  }

  if (message.type === "SAVE_CONTENT") {
    saveContent(message.content)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }
});

async function saveContent(content: { title: string; content: string; url: string }) {
  try {
    // Update state: extracting
    currentState = { status: "extracting", message: "Extracting content..." };
    broadcastState();

    // Update state: writing
    currentState = { status: "writing", message: "Writing to Obsidian..." };
    broadcastState();

    const writeResult = await writeNote(content.content, content.title, content.url);

    if (!writeResult.success) {
      throw new Error(writeResult.error || "Failed to write note");
    }

    // Update state: done
    currentState = {
      status: "done",
      message: `Successfully saved to ${writeResult.path}`,
    };
    broadcastState();

    return { success: true, path: writeResult.path };
  } catch (error) {
    currentState = {
      status: "error",
      message: "Save failed",
      error: error instanceof Error ? error.message : String(error),
    };
    broadcastState();

    throw error;
  }
}

function broadcastState() {
  // Notify any listening popups
  chrome.runtime.sendMessage({ type: "STATE_UPDATE", state: currentState }).catch(() => {
    // Ignore errors if no popup is listening
  });
}
