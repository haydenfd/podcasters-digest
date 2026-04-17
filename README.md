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

### Prerequisites

1. **Obsidian** with [Local REST API](https://github.com/coddingtonbear/obsidian-local-rest-api) plugin installed and enabled
2. **Create your target folder** in Obsidian (e.g., "Podcasts" or "Digest")
3. **Get your Obsidian API key** from the Local REST API plugin settings

### Configuration

Create a `.env` file in the repo root (copy from `.env.example`):

```bash
# OpenAI API Key (or other LLM provider)
OPENAI_API_KEY=sk-...

# Obsidian Local REST API Configuration
OBSIDIAN_API_KEY=your_api_key_here
OBSIDIAN_URL=https://127.0.0.1:27124
OBSIDIAN_FOLDER=Podcasts
```

**Important:** Configuration is injected at build time from `.env`. No runtime settings UI - edit `.env` and rebuild.

### Swap LLM Provider

Edit `extension/shared/config.ts`:

```ts
export const PROVIDER = {
  baseURL: "https://api.openai.com/v1",
  model: "gpt-5.4",
  apiKeyEnv: "OPENAI_API_KEY",
};
```

Then add the corresponding API key to `.env`.

### Build

```bash
npm run build:extension
```

This reads `.env`, injects values at compile time, and creates `extension/dist/`.

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

### Usage

1. Navigate to any Substack article
2. Extension icon shows green checkmark if article detected
3. Click icon → "Digest Article"
4. Watch progress: Extracting → LLM → Writing → Done
5. Note appears in `Podcasts/YYYY-MM-DD-article-title.md` (or your configured folder)

### Development

```bash
npm run watch:extension
```

Watches for changes and rebuilds automatically. You'll need to reload the extension in your browser after each rebuild.

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