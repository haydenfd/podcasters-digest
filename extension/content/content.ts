import { Readability } from "@mozilla/readability";

// Extract page content using Readability
function extractContent(): { title: string; content: string; url: string } | null {
  try {
    // Clone the document so Readability doesn't modify the actual page
    const documentClone = document.cloneNode(true) as Document;
    const reader = new Readability(documentClone);
    const article = reader.parse();

    if (!article) {
      console.error('Readability failed to parse article');
      return null;
    }

    // Return cleaned text content
    return {
      title: article.title || document.title || 'Untitled',
      content: article.textContent, // Clean text, no HTML
      url: window.location.href,
    };
  } catch (error) {
    console.error('Extraction error:', error);
    return null;
  }
}

// Always show green badge on any page
chrome.runtime.sendMessage({ type: "SET_BADGE", color: "green" });

// Listen for extraction requests from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "EXTRACT_CONTENT") {
    const content = extractContent();

    if (content) {
      sendResponse({ success: true, content });
    } else {
      sendResponse({ success: false, error: "Failed to extract page content" });
    }
  }

  return true; // Keep message channel open for async response
});
