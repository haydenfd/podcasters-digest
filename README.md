# Podcaster's Digest

A desktop app for digesting podcast transcripts and web articles into concise summaries.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Desktop**: Tauri v2
- **Styling**: Tailwind CSS v3
- **State**: Zustand with tauri-plugin-store persistence
- **Backend**: Rust with reqwest for API calls
- **Security**: OS keychain for API key storage via keyring crate

## Features

- **Digest**: Paste any URL to fetch content via Jina Reader and summarize with Claude
- **Library**: View all past digests with timestamps and domains
- **Settings**: Securely store Anthropic API key in system keychain

## Prerequisites

- Node.js and npm
- Rust and Cargo
- Anthropic API key (get one at console.anthropic.com)

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

1. Open the app
2. Go to Settings and add your Anthropic API key
3. Navigate to Digest tab
4. Paste a URL and click "Digest"
5. View your summary and access it later in the Library

## Project Structure

```
src/
  components/
    DigestView.tsx       # URL input, progress, summary display
    LibraryView.tsx      # Past digests list and detail view
    SettingsView.tsx     # API key management
  store/
    useStore.ts          # Zustand store with persistence
  App.tsx                # Main app with navigation

src-tauri/
  src/
    commands/
      fetch.rs           # Fetch URL via Jina Reader
      summarize.rs       # Summarize with Anthropic API
      storage.rs         # Keychain API key storage
    lib.rs               # Tauri app initialization
```

## Design

- **Colors**: Dark background (#0c0c0d), accent (#b8f02a)
- **Fonts**: Instrument Serif (italic headings), Instrument Sans (body), DM Mono (meta)
- **Window**: 420×680 (min 380×500), resizable

## API Commands

- `fetch_url(url: String) -> Result<String, String>` - Fetch content via Jina
- `summarize(content: String, api_key: String) -> Result<String, String>` - Summarize with Claude
- `get_api_key() -> Result<String, String>` - Retrieve API key from keychain
- `set_api_key(key: String) -> Result<(), String>` - Store API key in keychain
