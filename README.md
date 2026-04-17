# Footnotes

Paste a transcript → get a structured Obsidian note.

## Setup

```bash
git clone <your-repo>
cd footnotes
npm install
```

Set your Groq API key (get one free at console.groq.com):

```bash
export GROQ_API_KEY=gsk_...
```

Or add it to a `.env` file (and add `.env` to `.gitignore`):

```
GROQ_API_KEY=gsk_...
```

## Usage

1. Paste your transcript into a `.txt` file inside `transcripts/`
2. Run:

```bash
npm start transcripts/my-episode.txt --title "Lars Brownworth on Byzantine Empire" --source "https://lexfridman.com/lars-brownworth"
```

3. Note appears in `output/YYYY-MM-DD-your-title.md`

## Point at your Obsidian vault

In `pipeline/src/writer.ts`, change one line:

```ts
const TARGET_DIR = "/Users/yourname/ObsidianVault/Podcasts";
```

Done. Notes will appear in Obsidian automatically.

## Iterating on output format

All prompt logic is in `pipeline/src/prompt.ts`.
Run → read output → edit prompt → repeat.

## Structure

```
footnotes/
  pipeline/src/
    run.ts       # entrypoint
    prompt.ts    # the prompt — iterate here
    writer.ts    # writes .md to output/ or vault
  transcripts/   # drop .txt files here
  output/        # generated notes (until you point at vault)
```