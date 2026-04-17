import { Readability } from "@mozilla/readability";

// Check if the page has article content
function hasArticleContent(): boolean {
  const articleSelectors = [
    'article',
    '[role="article"]',
    '.post-content',
    '.article-content',
    'main article',
  ];

  for (const selector of articleSelectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent && element.textContent.trim().length > 500) {
      return true;
    }
  }

  return false;
}

// Extract article using Readability
function extractArticle(): { title: string; content: string; url: string } | null {
  const documentClone = document.cloneNode(true) as Document;
  const reader = new Readability(documentClone);
  const article = reader.parse();

  if (!article) {
    return null;
  }

  return {
    title: article.title,
    content: article.textContent,
    url: window.location.href,
  };
}

// Set badge based on article detection
if (hasArticleContent()) {
  chrome.runtime.sendMessage({ type: "SET_BADGE", color: "green" });
}

// Listen for extraction requests from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "EXTRACT_ARTICLE") {
    const article = extractArticle();

    if (article) {
      sendResponse({ success: true, article });
    } else {
      sendResponse({ success: false, error: "Failed to extract article content" });
    }
  }

  return true; // Keep message channel open for async response
});
