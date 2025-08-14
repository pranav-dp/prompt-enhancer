// Options page script for Prompt Enhancer extension

document.addEventListener('DOMContentLoaded', async () => {
  // Get DOM elements
  const providerSelect = document.getElementById('providerSelect');
  const saveBtn = document.getElementById('saveBtn');
  const statusMessages = document.getElementById('statusMessages');

  // API key inputs
  const openaiKey = document.getElementById('openaiKey');
  const geminiKey = document.getElementById('geminiKey');
  const anthropicKey = document.getElementById('anthropicKey');

  // Test buttons
  const testOpenai = document.getElementById('testOpenai');
  const testGemini = document.getElementById('testGemini');
  const testAnthropic = document.getElementById('testAnthropic');

  // Clear buttons
  const clearOpenai = document.getElementById('clearOpenai');
  const clearGemini = document.getElementById('clearGemini');
  const clearAnthropic = document.getElementById('clearAnthropic');

  // Status indicators
  const openaiStatus = document.getElementById('openaiStatus');
  const geminiStatus = document.getElementById('geminiStatus');
  const anthropicStatus = document.getElementById('anthropicStatus');

  // Load saved settings
  await loadSettings();

  // Event listeners
  providerSelect.addEventListener('change', updateProviderSelection);
  saveBtn.addEventListener('click', saveSettings);

  // Test connection buttons
  testOpenai.addEventListener('click', () => testConnection('openai'));
  testGemini.addEventListener('click', () => testConnection('gemini'));
  testAnthropic.addEventListener('click', () => testConnection('anthropic'));

  // Clear buttons
  clearOpenai.addEventListener('click', () => clearApiKey('openai'));
  clearGemini.addEventListener('click', () => clearApiKey('gemini'));
  clearAnthropic.addEventListener('click', () => clearApiKey('anthropic'));

  // Auto-save on input change
  [openaiKey, geminiKey, anthropicKey].forEach(input => {
    input.addEventListener('input', debounce(autoSave, 1000));
  });

  // Load settings from storage
  async function loadSettings() {
    try {
      const settings = await chrome.storage.sync.get([
        'selectedProvider',
        'openaiKey',
        'geminiKey',
        'anthropicKey'
      ]);

      // Set provider selection
      providerSelect.value = settings.selectedProvider || 'openai';

      // Set API keys (masked for security)
      if (settings.openaiKey) {
        openaiKey.value = maskApiKey(settings.openaiKey);
        updateStatus('openai', true);
      }
      if (settings.geminiKey) {
        geminiKey.value = maskApiKey(settings.geminiKey);
        updateStatus('gemini', true);
      }
      if (settings.anthropicKey) {
        anthropicKey.value = maskApiKey(settings.anthropicKey);
        updateStatus('anthropic', true);
      }

      updateProviderSelection();
    } catch (error) {
      console.error('Error loading settings:', error);
      showMessage('Failed to load settings', 'error');
    }
  }

  // Save settings to storage
  async function saveSettings() {
    try {
      const settings = {
        selectedProvider: providerSelect.value
      };

      // Only save API keys if they've been modified (not masked)
      if (openaiKey.value && !openaiKey.value.includes('*')) {
        settings.openaiKey = openaiKey.value.trim();
      }
      if (geminiKey.value && !geminiKey.value.includes('*')) {
        settings.geminiKey = geminiKey.value.trim();
      }
      if (anthropicKey.value && !anthropicKey.value.includes('*')) {
        settings.anthropicKey = anthropicKey.value.trim();
      }

      await chrome.storage.sync.set(settings);
      showMessage('Settings saved successfully!', 'success');
      
      // Update status indicators
      updateStatus('openai', !!settings.openaiKey || await hasStoredKey('openaiKey'));
      updateStatus('gemini', !!settings.geminiKey || await hasStoredKey('geminiKey'));
      updateStatus('anthropic', !!settings.anthropicKey || await hasStoredKey('anthropicKey'));
      
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('Failed to save settings', 'error');
    }
  }

  // Auto-save function
  async function autoSave() {
    await saveSettings();
  }

  // Test API connection
  async function testConnection(provider) {
    const button = document.getElementById(`test${provider.charAt(0).toUpperCase() + provider.slice(1)}`);
    const originalText = button.textContent;
    
    // Update button state
    button.disabled = true;
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin">
        <path d="M21 12a9 9 0 11-6.219-8.56"></path>
      </svg>
      Testing...
    `;

    try {
      // Get API key
      let apiKey;
      switch (provider) {
        case 'openai':
          apiKey = openaiKey.value.includes('*') ? (await chrome.storage.sync.get('openaiKey')).openaiKey : openaiKey.value;
          break;
        case 'gemini':
          apiKey = geminiKey.value.includes('*') ? (await chrome.storage.sync.get('geminiKey')).geminiKey : geminiKey.value;
          break;
        case 'anthropic':
          apiKey = anthropicKey.value.includes('*') ? (await chrome.storage.sync.get('anthropicKey')).anthropicKey : anthropicKey.value;
          break;
      }

      if (!apiKey) {
        throw new Error('API key is required');
      }

      // Test the connection
      const response = await chrome.runtime.sendMessage({
        action: 'enhance-text',
        text: 'Test prompt',
        provider: provider,
        apiKey: apiKey
      });

      if (response.success) {
        showMessage(`${getProviderDisplayName(provider)} connection successful!`, 'success');
        updateStatus(provider, true);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error(`${provider} test failed:`, error);
      showMessage(`${getProviderDisplayName(provider)} test failed: ${error.message}`, 'error');
      updateStatus(provider, false);
    } finally {
      // Reset button
      button.disabled = false;
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 12l2 2 4-4"></path>
          <circle cx="12" cy="12" r="9"></circle>
        </svg>
        Test Connection
      `;
    }
  }

  // Clear API key
  async function clearApiKey(provider) {
    const input = document.getElementById(`${provider}Key`);
    input.value = '';
    
    // Remove from storage
    await chrome.storage.sync.remove(`${provider}Key`);
    
    updateStatus(provider, false);
    showMessage(`${getProviderDisplayName(provider)} API key cleared`, 'info');
  }

  // Update provider selection highlighting
  function updateProviderSelection() {
    const selected = providerSelect.value;
    
    // Reset all sections
    document.querySelectorAll('.card').forEach(card => {
      card.style.borderColor = '#374151';
    });
    
    // Highlight selected provider
    const selectedSection = document.getElementById(`${selected}Section`);
    if (selectedSection) {
      selectedSection.style.borderColor = '#3b82f6';
    }
  }

  // Update status indicator
  function updateStatus(provider, isConnected) {
    const statusElement = document.getElementById(`${provider}Status`);
    
    if (isConnected) {
      statusElement.className = 'status-indicator status-connected';
      statusElement.innerHTML = `
        <div class="w-2 h-2 rounded-full bg-current"></div>
        <span>Connected</span>
      `;
    } else {
      statusElement.className = 'status-indicator status-disconnected';
      statusElement.innerHTML = `
        <div class="w-2 h-2 rounded-full bg-current"></div>
        <span>Not configured</span>
      `;
    }
  }

  // Show status message
  function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `p-3 rounded-lg text-sm mb-3 ${
      type === 'success' ? 'bg-green-600 text-white' :
      type === 'error' ? 'bg-red-600 text-white' :
      'bg-blue-600 text-white'
    }`;
    messageDiv.textContent = message;
    
    statusMessages.appendChild(messageDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      messageDiv.remove();
    }, 5000);
  }

  // Utility functions
  function maskApiKey(key) {
    if (!key) return '';
    if (key.length <= 8) return '*'.repeat(key.length);
    return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4);
  }

  function getProviderDisplayName(provider) {
    switch (provider) {
      case 'openai': return 'OpenAI';
      case 'gemini': return 'Google Gemini';
      case 'anthropic': return 'Anthropic Claude';
      default: return provider;
    }
  }

  async function hasStoredKey(keyName) {
    const result = await chrome.storage.sync.get(keyName);
    return !!result[keyName];
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Handle input focus to clear masked values
  [openaiKey, geminiKey, anthropicKey].forEach(input => {
    input.addEventListener('focus', function() {
      if (this.value.includes('*')) {
        this.value = '';
        this.type = 'password';
      }
    });
  });
});
