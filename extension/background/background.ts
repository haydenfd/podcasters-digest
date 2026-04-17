import { buildPrompt } from "../shared/prompt.js";
import { writeNote } from "../shared/writer.js";

interface LLMConfig {
  baseURL: string;
  model: string;
  apiKey: string;
  obsidianPort?: number;
}

interface ProcessingState {
  status: "extracting" | "calling_llm" | "writing" | "done" | "error";
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

  if (message.type === "PROCESS_ARTICLE") {
    processArticle(message.article)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }

  if (message.type === "GET_CONFIG") {
    chrome.storage.local.get(["llmConfig"], (result) => {
      sendResponse(result.llmConfig || null);
    });
    return true;
  }

  if (message.type === "SAVE_CONFIG") {
    chrome.storage.local.set({ llmConfig: message.config }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

async function processArticle(article: { title: string; content: string; url: string }) {
  try {
    // Update state: extracting
    currentState = { status: "extracting", message: "Extracting article content..." };
    broadcastState();

    // Get LLM config
    const config = await getConfig();
    if (!config) {
      throw new Error("LLM configuration not set. Please configure in the extension settings.");
    }

    // Update state: calling LLM
    currentState = { status: "calling_llm", message: "Sending to LLM..." };
    broadcastState();

    const prompt = buildPrompt(article.content, article.title, article.url);

    const res = await fetch(`${config.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        max_completion_tokens: 8192,
        stream: false,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`LLM request failed (${res.status}): ${err}`);
    }

    const json = await res.json();
    const summaryMd = json.choices?.[0]?.message?.content ?? "";

    if (!summaryMd) {
      throw new Error("No content returned from LLM");
    }

    // Update state: writing
    currentState = { status: "writing", message: "Writing to Obsidian..." };
    broadcastState();

    const writeResult = await writeNote(summaryMd, article.title, config.obsidianPort);

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
      message: "Processing failed",
      error: error instanceof Error ? error.message : String(error),
    };
    broadcastState();

    throw error;
  }
}

async function getConfig(): Promise<LLMConfig | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(["llmConfig"], (result) => {
      resolve(result.llmConfig || null);
    });
  });
}

function broadcastState() {
  // Notify any listening popups
  chrome.runtime.sendMessage({ type: "STATE_UPDATE", state: currentState }).catch(() => {
    // Ignore errors if no popup is listening
  });
}
