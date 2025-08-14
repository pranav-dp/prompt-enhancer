// Modern Popup script for Prompt Enhancer extension

document.addEventListener('DOMContentLoaded', async () => {
  const enhanceBtn = document.getElementById('enhanceBtn');
  const enhanceBtnText = document.getElementById('enhanceBtnText');
  const settingsBtn = document.getElementById('settingsBtn');
  const currentProvider = document.getElementById('currentProvider');
  const connectionStatus = document.getElementById('connectionStatus');

  // Load current settings and update UI
  await updateStatus();

  // Settings button click
  settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Enhance button click
  enhanceBtn.addEventListener('click', async () => {
    if (enhanceBtn.disabled) return;

    // Update button state with modern loading animation
    enhanceBtn.disabled = true;
    enhanceBtn.classList.add('loading');
    enhanceBtnText.textContent = 'Enhancing...';

    try {
      // Send message to content script
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.tabs.sendMessage(tab.id, { action: 'enhance-prompt' });
      
      // Success feedback
      enhanceBtnText.textContent = 'Enhanced!';
      setTimeout(() => {
        enhanceBtnText.textContent = 'Enhance Prompt';
      }, 1500);
      
    } catch (error) {
      console.error('Error sending message to content script:', error);
      showError('Failed to communicate with the page. Please refresh and try again.');
      enhanceBtnText.textContent = 'Try Again';
    } finally {
      // Reset button state
      setTimeout(() => {
        enhanceBtn.disabled = false;
        enhanceBtn.classList.remove('loading');
        if (enhanceBtnText.textContent !== 'Enhance Prompt') {
          enhanceBtnText.textContent = 'Enhance Prompt';
        }
      }, 2000);
    }
  });

  // Update status display
  async function updateStatus() {
    try {
      const settings = await chrome.storage.sync.get([
        'selectedProvider', 
        'openaiKey', 
        'geminiKey', 
        'anthropicKey'
      ]);

      const provider = settings.selectedProvider || 'openai';
      currentProvider.textContent = getProviderDisplayName(provider);

      // Check if API key exists for selected provider
      let hasApiKey = false;
      switch (provider) {
        case 'openai':
          hasApiKey = !!settings.openaiKey;
          break;
        case 'gemini':
          hasApiKey = !!settings.geminiKey;
          break;
        case 'anthropic':
          hasApiKey = !!settings.anthropicKey;
          break;
      }

      // Update connection status with smooth transition
      connectionStatus.style.opacity = '0.5';
      
      setTimeout(() => {
        if (hasApiKey) {
          connectionStatus.className = 'connection-status status-connected';
          connectionStatus.innerHTML = '<div class="status-dot"></div>';
          enhanceBtn.disabled = false;
        } else {
          connectionStatus.className = 'connection-status status-disconnected';
          connectionStatus.innerHTML = '<div class="status-dot"></div>';
          enhanceBtn.disabled = true;
        }
        connectionStatus.style.opacity = '1';
      }, 150);
      
    } catch (error) {
      console.error('Error loading settings:', error);
      showError('Failed to load settings');
    }
  }

  // Get display name for provider
  function getProviderDisplayName(provider) {
    switch (provider) {
      case 'openai':
        return 'OpenAI GPT';
      case 'gemini':
        return 'Google Gemini';
      case 'anthropic':
        return 'Anthropic Claude';
      default:
        return 'Unknown';
    }
  }

  // Show error message with modern styling
  function showError(message) {
    // Remove existing error if any
    const existingError = document.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      right: 10px;
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      box-shadow: 0 4px 20px rgba(239, 68, 68, 0.3);
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `;
    errorDiv.textContent = message;
    
    // Add slide-in animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateY(-100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => {
        errorDiv.remove();
        style.remove();
      }, 300);
    }, 4000);
  }

  // Listen for storage changes to update status
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
      updateStatus();
    }
  });

  // Add keyboard shortcut hint based on platform
  const shortcutHint = document.querySelector('.shortcut-hint');
  let isMac = false;
  if (navigator.userAgentData && navigator.userAgentData.platform) {
    isMac = navigator.userAgentData.platform.toUpperCase().includes('MAC');
  } else {
    isMac = navigator.userAgent.toUpperCase().includes('MAC');
  }
  
  if (isMac) {
    // Hide the Ctrl+Shift+P hint on Mac
    const ctrlKey = shortcutHint.querySelector('.shortcut-key:last-child');
    const orText = shortcutHint.querySelector('.shortcut-text:last-child');
    if (ctrlKey && orText) {
      ctrlKey.style.display = 'none';
      orText.style.display = 'none';
    }
  } else {
    // Hide the ⌘⇧P hint on Windows/Linux
    const cmdKey = shortcutHint.querySelector('.shortcut-key:first-child');
    const orText = shortcutHint.querySelector('.shortcut-text:last-child');
    if (cmdKey) {
      cmdKey.style.display = 'none';
    }
    if (orText) {
      orText.previousElementSibling.style.display = 'none'; // Hide "or" text
    }
  }
});
