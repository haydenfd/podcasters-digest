// Extract page content
function extractContent(): { title: string; content: string; url: string } | null {
  try {
    const title = document.title || 'Untitled';

    // Get main content - try common content containers first
    const contentSelectors = [
      'article',
      'main',
      '[role="main"]',
      '.post-content',
      '.article-content',
      '.content',
      'body'
    ];

    let contentElement: Element | null = null;
    for (const selector of contentSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent && element.textContent.trim().length > 200) {
        contentElement = element;
        break;
      }
    }

    if (!contentElement) {
      contentElement = document.body;
    }

    // Get the full HTML content
    const htmlContent = contentElement.innerHTML;

    // Also get plain text version
    const textContent = contentElement.textContent || '';

    return {
      title,
      content: htmlContent,
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
