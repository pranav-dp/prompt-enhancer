// Content script for Prompt Enhancer extension

let currentFocusedElement = null;

// Track focused input elements
document.addEventListener('focusin', (event) => {
  const element = event.target;
  if (isTextInput(element)) {
    currentFocusedElement = element;
  }
});

document.addEventListener('focusout', (event) => {
  // Small delay to handle quick focus changes
  setTimeout(() => {
    if (!document.activeElement || !isTextInput(document.activeElement)) {
      currentFocusedElement = null;
    }
  }, 100);
});

// Check if element is a text input
function isTextInput(element) {
  if (!element) return false;
  
  const tagName = element.tagName.toLowerCase();
  const type = element.type?.toLowerCase();
  
  // Check for input elements
  if (tagName === 'input' && (type === 'text' || type === 'search' || !type)) {
    return true;
  }
  
  // Check for textarea
  if (tagName === 'textarea') {
    return true;
  }
  
  // Check for contenteditable elements
  if (element.contentEditable === 'true') {
    return true;
  }
  
  return false;
}

// Get text from element
function getTextFromElement(element) {
  if (!element) return '';
  
  if (element.contentEditable === 'true') {
    return element.innerText || element.textContent || '';
  } else {
    return element.value || '';
  }
}

// Set text in element
function setTextInElement(element, text) {
  if (!element) return;
  
  if (element.contentEditable === 'true') {
    element.innerText = text;
    // Trigger input event for frameworks like React
    element.dispatchEvent(new Event('input', { bubbles: true }));
  } else {
    element.value = text;
    // Trigger input and change events
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

// Show loading indicator
function showLoadingIndicator(element) {
  const originalText = getTextFromElement(element);
  setTextInElement(element, '✨ Enhancing prompt...');
  return originalText;
}

// Handle enhancement request
async function enhanceCurrentPrompt() {
  if (!currentFocusedElement) {
    showNotification('No text input focused. Please click on a text field first.', 'error');
    return;
  }

  const originalText = getTextFromElement(currentFocusedElement);
  if (!originalText.trim()) {
    showNotification('No text to enhance. Please type something first.', 'error');
    return;
  }

  // Show loading state
  const loadingText = showLoadingIndicator(currentFocusedElement);

  try {
    // Get settings from storage
    const settings = await chrome.storage.sync.get(['selectedProvider', 'openaiKey', 'geminiKey', 'anthropicKey']);
    const provider = settings.selectedProvider || 'openai';
    
    let apiKey;
    switch (provider) {
      case 'openai':
        apiKey = settings.openaiKey;
        break;
      case 'gemini':
        apiKey = settings.geminiKey;
        break;
      case 'anthropic':
        apiKey = settings.anthropicKey;
        break;
    }

    // Send to background script for API call
    const response = await chrome.runtime.sendMessage({
      action: 'enhance-text',
      text: originalText,
      provider: provider,
      apiKey: apiKey
    });

    if (response.success) {
      setTextInElement(currentFocusedElement, response.enhancedText);
      showNotification('Prompt enhanced successfully! ✨', 'success');
    } else {
      // Restore original text on error
      setTextInElement(currentFocusedElement, loadingText);
      showNotification(`Enhancement failed: ${response.error}`, 'error');
    }
  } catch (error) {
    // Restore original text on error
    setTextInElement(currentFocusedElement, loadingText);
    showNotification(`Enhancement failed: ${error.message}`, 'error');
  }
}

// Show notification
function showNotification(message, type = 'info') {
  // Remove existing notification
  const existing = document.getElementById('prompt-enhancer-notification');
  if (existing) {
    existing.remove();
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.id = 'prompt-enhancer-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    padding: 12px 16px;
    border-radius: 8px;
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    max-width: 300px;
    word-wrap: break-word;
    transition: all 0.3s ease;
    ${type === 'success' ? 'background-color: #10b981;' : ''}
    ${type === 'error' ? 'background-color: #ef4444;' : ''}
    ${type === 'info' ? 'background-color: #3b82f6;' : ''}
  `;
  
  notification.textContent = message;
  document.body.appendChild(notification);

  // Auto remove after 4 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }
  }, 4000);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'enhance-prompt') {
    enhanceCurrentPrompt();
  }
});

// Initialize - find currently focused element if any
document.addEventListener('DOMContentLoaded', () => {
  if (document.activeElement && isTextInput(document.activeElement)) {
    currentFocusedElement = document.activeElement;
  }
});

// Handle dynamic content
const observer = new MutationObserver((mutations) => {
  // Check if the currently focused element is still in the DOM
  if (currentFocusedElement && !document.contains(currentFocusedElement)) {
    currentFocusedElement = null;
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
