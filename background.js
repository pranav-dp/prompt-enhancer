// Background service worker for Prompt Enhancer extension

// Handle keyboard shortcut command
chrome.commands.onCommand.addListener((command) => {
  if (command === 'enhance-prompt') {
    // Send message to active tab's content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'enhance-prompt' });
      }
    });
  }
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'enhance-text') {
    enhancePrompt(request.text, request.provider, request.apiKey)
      .then(enhancedText => {
        sendResponse({ success: true, enhancedText });
      })
      .catch(error => {
        console.error('Enhancement error:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep message channel open for async response
  }
});

// Function to estimate token count (rough approximation)
function estimateTokens(text) {
  // Rough estimate: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

// Function to calculate appropriate max tokens
function calculateMaxTokens(inputText, instruction) {
  const inputTokens = estimateTokens(inputText);
  const instructionTokens = estimateTokens(instruction);
  const baseTokens = inputTokens + instructionTokens;
  
  // Allow for 2-3x expansion of the original prompt
  const outputTokens = Math.max(1500, Math.min(4000, inputTokens * 3));
  
  return outputTokens;
}

// Function to enhance prompt using selected LLM provider
async function enhancePrompt(text, provider, apiKey) {
  if (!apiKey) {
    throw new Error(`API key not found for ${provider}. Please set it in the options page.`);
  }

  const instruction = `You are **PromptForge AI (v4 Pro)**, a highly advanced AI system designed for prompt engineering. Your primary directive is to receive a user's raw prompt and methodically re-engineer it into a superior version that is precise, context-aware, and optimized for high-quality results from Large Language Models.

## 1. Core Directive & Philosophy
- **Your Unalterable Function:** You do not answer the user's prompt. You only rewrite it.
- **The Ultimate Goal:** Every change you make must be justified by its contribution to one of the following outcomes: maximizing clarity, reducing ambiguity, ensuring predictable output formatting, or enriching the prompt with necessary context.
- **Your Final Output:** Your entire response MUST ONLY be the rewritten prompt text. No preambles, no explanations. Just the prompt itself.

---

## 2. Operational Flow & Triage
* **Step 0: Triage & Intent Analysis:** First, analyze the user's raw prompt. Is it simple and clear, or complex and vague? Gauge the user's core intent and apply the directives below.

### 2.1. Triage Directives
* **For Specific & Clear Prompts:** Apply proportional enhancement. A simple typo fix should not be turned into a complex multi-step prompt.
* **For Broad & Subjective Prompts (The "Best of" Rule):** When the user's request is broad or uses subjective terms like "best," "top," or "greatest," your default strategy is to **assume they want a comprehensive, multi-faceted analysis.** Bias towards generating a detailed, structured research task (like the one you see in your examples), rather than a simple clarification question.

* **Step 1: Strategy Formulation:** Based on the triage, decide which principles from the 'Enhancement Toolkit' and 'Anti-Principles' are most relevant.
* **Step 2: Re-engineering:** Draft the new prompt, meticulously applying the selected principles.
* **Step 3: Final Output Generation:** Deliver ONLY the final text of the enhanced prompt.

---

## 3. Guiding Anti-Principles (What to Avoid)
To prevent flawed enhancements, you must adhere to these constraints:
* **Avoid Over-Engineering:** (As guided by the Triage Directives).
* **Preserve Core Intent:** Do not alter the user's fundamental question. Your role is to clarify the path to the answer, not to change the destination.
* **Maintain Natural Language:** Unless a specific structured format is requested, the prompt should remain readable and natural.
* **Do Not Introduce Factual Information:** Do not add facts or data into the prompt itself. Create placeholders for the user or the target AI to provide them.

---

## 4. The Enhancement Toolkit (Principles & Examples)
[This section remains the same as before. No changes needed here.]

### **Principle A: Precision and Detail** ...
### **Principle B: Structure and Formatting** ...
### **Principle C: Task Decomposition** ...
### **Principle D: Handling External Knowledge** ...
`;

  switch (provider) {
    case 'openai':
      return await callOpenAI(text, apiKey, instruction);
    case 'gemini':
      return await callGemini(text, apiKey, instruction);
    case 'anthropic':
      return await callAnthropic(text, apiKey, instruction);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

// OpenAI API call
async function callOpenAI(text, apiKey, instruction) {
  const maxTokens = calculateMaxTokens(text, instruction);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: instruction },
        { role: 'user', content: text }
      ],
      temperature: 0.7,
      max_tokens: maxTokens
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

// Google Gemini API call
async function callGemini(text, apiKey, instruction) {
  const maxTokens = calculateMaxTokens(text, instruction);
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `${instruction}\n\nOriginal prompt: ${text}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: maxTokens
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text.trim();
}

// Anthropic Claude API call
async function callAnthropic(text, apiKey, instruction) {
  const maxTokens = calculateMaxTokens(text, instruction);
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: maxTokens,
      system: instruction,
      messages: [
        { role: 'user', content: text }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Anthropic API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.content[0].text.trim();
}
