import { writeNote } from "../shared/writer.js";

interface ProcessingState {
  status: "fetching" | "writing" | "done" | "error";
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

  if (message.type === "PROCESS_URL") {
    processUrl(message.url)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }
});

async function processUrl(url: string) {
  try {
    // Update state: fetching
    currentState = { status: "fetching", message: "Fetching content from Jina Reader..." };
    broadcastState();

    // Fetch from Jina Reader
    const jinaUrl = `https://r.jina.ai/${url}`;
    const response = await fetch(jinaUrl, {
      method: "GET",
      headers: {
        "Accept": "text/markdown",
      },
    });

    if (!response.ok) {
      throw new Error(`Jina Reader failed (${response.status}): ${response.statusText}`);
    }

    const markdown = await response.text();

    if (!markdown || markdown.trim().length === 0) {
      throw new Error("Jina Reader returned empty content");
    }

    // Extract title from URL or markdown
    const title = extractTitle(url, markdown);

    // Update state: writing
    currentState = { status: "writing", message: "Writing to Obsidian..." };
    broadcastState();

    const writeResult = await writeNote(markdown, title, url);

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

function extractTitle(url: string, markdown: string): string {
  // Try to extract title from first # heading in markdown
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    return titleMatch[1].trim();
  }

  // Fallback to URL-based title
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const lastSegment = pathname.split('/').filter(s => s).pop() || 'page';
    return lastSegment.replace(/-/g, ' ').replace(/\.html?$/, '');
  } catch {
    return 'Untitled';
  }
}

function broadcastState() {
  // Notify any listening popups
  chrome.runtime.sendMessage({ type: "STATE_UPDATE", state: currentState }).catch(() => {
    // Ignore errors if no popup is listening
  });
}
