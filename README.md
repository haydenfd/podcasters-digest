# Footnotes

Transcript to structured Obsidian notes — CLI pipeline + browser extension.

## Two ways to use this:

1. **CLI Pipeline**: Paste a transcript → get a structured note
2. **Browser Extension**: One-click Substack article → structured note in Obsidian

---

## CLI Pipeline

### Setup

```bash
git clone <your-repo>
cd footnotes
npm install
```

Set your API key (Groq is free at console.groq.com):

```bash
export GROQ_API_KEY=gsk_...
# or OPENAI_API_KEY=sk_...
```

Or add it to a `.env` file:

```
GROQ_API_KEY=gsk_...
```

### Usage

1. Paste your transcript into a `.txt` file inside `transcripts/`
2. Run:

```bash
npm start transcripts/my-episode.txt --title "Episode Title" --source "https://source-url.com"
```

3. Note appears in `output/YYYY-MM-DD-your-title.md`

### Point at your Obsidian vault

In `pipeline/src/writer.ts`, change one line:

```ts
const TARGET_DIR = "/Users/yourname/ObsidianVault/Podcasts";
```

### Swap LLM provider

In `pipeline/src/run.ts`, change the `PROVIDER` object:

```ts
// Groq (free):
const PROVIDER = {
  baseURL: "https://api.groq.com/openai/v1",
  model: "llama-3.3-70b-versatile",
  apiKeyEnv: "GROQ_API_KEY",
};

// OpenAI:
const PROVIDER = {
  baseURL: "https://api.openai.com/v1",
  model: "gpt-4o",
  apiKeyEnv: "OPENAI_API_KEY",
};
```

---

## Browser Extension

### Build

```bash
npm run build:extension
```

This creates `extension/dist/` with the bundled extension.

### Load in browser

**Chrome/Edge:**
- Navigate to `chrome://extensions/`
- Enable "Developer mode"
- Click "Load unpacked"
- Select the `extension/dist` folder

**Firefox:**
- Navigate to `about:debugging#/runtime/this-firefox`
- Click "Load Temporary Add-on"
- Select any file in `extension/dist`

### Configure

1. Click the extension icon
2. Click "Settings"
3. Enter your LLM config:
   - **Base URL**: e.g., `https://api.openai.com/v1`
   - **Model**: e.g., `gpt-4o`
   - **API Key**: Your API key
   - **Obsidian Port**: Default `27123`

### Prerequisites for extension

- **Obsidian** with [Local REST API](https://github.com/coddingtonbear/obsidian-local-rest-api) plugin enabled
- Create a "Digest" folder in your Obsidian vault

### Usage

1. Navigate to any Substack article
2. Extension icon shows green checkmark if article detected
3. Click icon → "Digest Article"
4. Watch progress: Extracting → LLM → Writing → Done
5. Note appears in `Digest/YYYY-MM-DD-article-title.md`

### Development

```bash
npm run watch:extension
```

---

## Structure

```
footnotes/
  pipeline/src/
    run.ts       # CLI entrypoint
    prompt.ts    # LLM prompt (shared with extension)
    writer.ts    # writes to output/ or vault
  extension/
    build.mjs    # esbuild bundler
    manifest.json
    background/background.ts    # service worker
    content/content.ts          # article extraction
    popup/                      # UI
    shared/                     # shared code (prompt, writer)
  transcripts/   # drop .txt files here
  output/        # generated notes
```