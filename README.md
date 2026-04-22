# Podcaster's Digest

A desktop app for digesting web articles and podcast transcripts. Fetch clean, readable content from any URL and save it to your personal library.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Desktop**: Tauri v2
- **Styling**: Tailwind CSS v3
- **State**: Zustand with Tauri Store persistence
- **Backend**: Rust with reqwest for HTTP requests
- **Content Extraction**: Jina Reader API

## Features

- **Digest**: Paste any URL to fetch clean markdown content via Jina Reader
- **Library**: View all past digests with timestamps, domains, and full content
- **Duplicate Detection**: Warns when digesting duplicate URLs with overwrite option
- **Persistent Storage**: All digests saved locally using Tauri Store
- **Dark Theme**: Clean, minimal UI with accent green (#b8f02a)

## Prerequisites

- Node.js and npm
- Rust and Cargo
- No API keys required (Jina Reader is free)

## Development

1. Install dependencies:
```bash
npm install
```

2. Run in development mode:
```bash
npm run tauri dev
```

## Build

Build the production app:
```bash
npm run tauri build
```

## Usage

1. Open the app (lands on Digest tab by default)
2. Paste any URL into the input field
3. Click "Digest" or press Enter
4. Watch the progress: Fetching → Processing → Saved
5. View saved digests in the Library tab
6. Click any library item to read the full content

**Tips:**
- If you digest a duplicate URL, the app will ask if you want to overwrite
- Digests are saved locally and persist across app restarts
- Content is extracted as clean markdown from the source URL

## Project Structure

```
src/
  components/
    DigestView.tsx       # URL input, progress tracking, duplicate detection
    LibraryView.tsx      # Digest list and detail markdown viewer
    SettingsView.tsx     # Placeholder for future features
  store/
    useStore.ts          # Zustand store with Tauri Store persistence
  App.tsx                # Main app with header and tab navigation

src-tauri/
  src/
    commands/
      fetch.rs           # Fetch URL content via Jina Reader API
      summarize.rs       # (Placeholder for future AI features)
      storage.rs         # (Placeholder for future keychain features)
    lib.rs               # Tauri app initialization
```

## Design

- **Colors**: Dark background (#0c0c0d), accent green (#b8f02a)
- **Fonts**: Newsreader (headings), Instrument Sans (body), DM Mono (meta)
- **Window**: 900×700 (min 700×500), resizable
- **Layout**: Clean three-tab interface (Digest | Library | Settings)

## Storage

Digests are stored locally in:
- **macOS**: `~/Library/Application Support/com.haydenfd.podcasters-digest/digests.json`
- **Windows**: `%APPDATA%\com.haydenfd.podcasters-digest\digests.json`
- **Linux**: `~/.local/share/com.haydenfd.podcasters-digest/digests.json`

## Rust Commands

- `fetch_url(url: String) -> Result<String, String>` - Fetch clean markdown content via Jina Reader
- `get_api_key() -> Result<String, String>` - (Not currently used)
- `set_api_key(key: String) -> Result<(), String>` - (Not currently used)
- `summarize(content: String, api_key: String) -> Result<String, String>` - (Not currently used)

## Roadmap

- [ ] AI-powered summarization (Anthropic Claude)
- [ ] Obsidian vault export
- [ ] Custom tags and categories
- [ ] Search functionality
- [ ] AppleScript integration for browser tab capture
