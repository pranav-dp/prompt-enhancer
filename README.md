# ✨ Prompt Enhancer Chrome Extension

A powerful Chrome extension that enhances your AI prompts across any website using OpenAI, Google Gemini, or Anthropic Claude APIs.

## Features

- 🎯 **Universal Compatibility**: Works on ChatGPT, Claude.ai, Gemini, Perplexity, and any AI website
- 🔄 **Multiple AI Providers**: Choose between OpenAI GPT, Google Gemini, or Anthropic Claude
- ⌨️ **Keyboard Shortcuts**: Quick enhancement with Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows)
- 🎨 **Modern UI**: Sleek dark theme with TailwindCSS styling
- 🔒 **Secure Storage**: API keys stored locally using Chrome's sync storage
- 🚀 **Real-time Enhancement**: Instantly improve prompts without leaving the page

## Installation

### Load in Chrome Developer Mode

1. **Download the Extension**
   - Clone or download this repository to your local machine
   - Extract the files to a folder (e.g., `prompt-enhance`)

2. **Open Chrome Extensions Page**
   - Open Google Chrome
   - Navigate to `chrome://extensions/`
   - Or go to Chrome menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**
   - Click "Load unpacked" button
   - Select the folder containing the extension files
   - The extension should now appear in your extensions list

5. **Pin the Extension** (Optional)
   - Click the puzzle piece icon in Chrome's toolbar
   - Find "Prompt Enhancer" and click the pin icon to keep it visible

## Setup

### 1. Configure API Keys

1. **Click the extension icon** in your Chrome toolbar
2. **Click "Settings"** to open the options page
3. **Choose your preferred AI provider** from the dropdown
4. **Enter your API key** for the selected provider:

   - **OpenAI**: Get your key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - **Google Gemini**: Get your key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - **Anthropic Claude**: Get your key from [Anthropic Console](https://console.anthropic.com/)

5. **Test the connection** using the "Test Connection" button
6. **Save your settings**

### 2. Grant Permissions

The extension will request permissions to:
- Access all websites (to work on any AI platform)
- Store settings locally
- Run scripts on web pages

## Usage

### Method 1: Keyboard Shortcut (Recommended)

1. **Navigate to any AI website** (ChatGPT, Claude.ai, Gemini, etc.)
2. **Click on a text input field** where you type prompts
3. **Type your prompt**
4. **Press the keyboard shortcut**:
   - **Mac**: `Cmd + Shift + P`
   - **Windows/Linux**: `Ctrl + Shift + P`
5. **Your prompt will be automatically enhanced** and replaced in the input field

### Method 2: Extension Popup

1. **Navigate to any AI website**
2. **Click on a text input field** and type your prompt
3. **Click the extension icon** in your toolbar
4. **Click "Enhance Prompt"** button
5. **Your prompt will be enhanced** automatically

## Supported Websites

The extension works on **any website** with text input fields, including:

- ChatGPT (chat.openai.com)
- Claude.ai (claude.ai)
- Google Gemini (gemini.google.com)
- Perplexity (perplexity.ai)
- Poe (poe.com)
- Character.AI
- Any other AI chat interface
- Text areas and input fields on any website

## Default Models Used

- **OpenAI**: `gpt-4o-mini` (fast and cost-effective)
- **Google Gemini**: `gemini-2.5-flash` (optimized for speed)
- **Anthropic Claude**: `claude-3-haiku` (efficient and accurate)

## Security & Privacy

- ✅ **API keys stored locally** in Chrome's secure storage
- ✅ **No data sent to third parties** except chosen AI provider
- ✅ **Open source code** - you can review everything
- ✅ **No tracking or analytics**
- ✅ **Works offline** (except for API calls)

## Troubleshooting

### Extension Not Working?

1. **Refresh the webpage** after installing the extension
2. **Check that you've entered a valid API key** in settings
3. **Ensure the text field is focused** before using the shortcut
4. **Try clicking directly in the text input** before enhancing

### API Errors?

1. **Verify your API key** is correct and active
2. **Check your API quota/billing** with the provider
3. **Test the connection** in the settings page
4. **Try switching to a different provider**

### Keyboard Shortcut Not Working?

1. **Check Chrome's keyboard shortcuts**:
   - Go to `chrome://extensions/shortcuts`
   - Ensure "Enhance prompt" shortcut is set correctly
2. **Try using the popup button** instead
3. **Make sure the text field is focused**

## Development

### File Structure

```
prompt-enhance/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for API calls
├── content.js            # Content script for page interaction
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
├── options.html          # Settings page
├── options.js            # Settings functionality
├── styles.css            # TailwindCSS styles
└── README.md             # This file
```

### Making Changes

1. **Edit the files** as needed
2. **Go to `chrome://extensions/`**
3. **Click the refresh icon** on the Prompt Enhancer extension
4. **Test your changes**

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the extension!

## License

This project is open source and available under the MIT License.

---

**Made with ❤️ for better AI conversations**
