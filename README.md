# Podcaster's Digest

Podcaster's Digest is a desktop app for saving long-form web content into a personal reading library.

Paste in a URL, fetch the cleaned article or transcript, and keep it locally for later reading and search.

## Features

- Save articles and podcast transcript pages from a URL
- Keep a personal local library of digests
- Search your saved titles and sources
- Sort your library by newest or oldest
- Re-open saved content with the full cleaned text
- Persist data locally across app restarts

## Getting Started

### Requirements

- Node.js and npm
- Rust and Cargo

### Run the app

```bash
npm install
npm run tauri dev
```

### Build for production

```bash
npm run tauri build
```

## How It Works

1. Paste a URL into the Digest tab.
2. The app fetches a cleaned version of the content.
3. The result is saved to your local library.
4. Open the Library tab to search, sort, and read saved items.

## Storage

Your library is stored locally on your machine.

- macOS: `~/Library/Application Support/com.haydenfd.podcasters-digest/digests.json`
- Windows: `%APPDATA%\com.haydenfd.podcasters-digest\digests.json`
- Linux: `~/.local/share/com.haydenfd.podcasters-digest/digests.json`

## License

MIT
