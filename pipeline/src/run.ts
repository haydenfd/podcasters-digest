import { readFileSync } from "fs";
import { basename, extname } from "path";
import { buildPrompt } from "./prompt.js";
import { writeNote } from "./writer.js";

// --- SWAP PROVIDER HERE ---
// Groq (free):    baseURL = "https://api.groq.com/openai/v1"   model = "llama-3.3-70b-versatile"  apiKeyEnv = "GROQ_API_KEY"
// OpenAI:         baseURL = "https://api.openai.com/v1"         model = "gpt-4o"                    apiKeyEnv = "OPENAI_API_KEY"
// Ollama (local): baseURL = "http://localhost:11434/v1"          model = "gemma3"                    apiKeyEnv = "OLLAMA_API_KEY" (set to any string)
const PROVIDER = {
  baseURL: "https://api.groq.com/openai/v1",
  model: "llama-3.3-70b-versatile",
  apiKeyEnv: "GROQ_API_KEY",
};

function loadTranscript(filePath: string): string {
  try {
    return readFileSync(filePath, "utf-8");
  } catch {
    console.error(`[error] Could not read file: ${filePath}`);
    process.exit(1);
  }
}

function parseArgs(): { transcriptPath: string; title: string; source: string } {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: npm start <transcript.txt> [--title 'Episode Title'] [--source 'URL']");
    process.exit(1);
  }

  const transcriptPath = args[0];
  const titleIdx = args.indexOf("--title");
  const sourceIdx = args.indexOf("--source");

  const title = (titleIdx !== -1 && args[titleIdx + 1])
    ? args[titleIdx + 1]
    : basename(transcriptPath, extname(transcriptPath));

  const source = (sourceIdx !== -1 && args[sourceIdx + 1])
    ? args[sourceIdx + 1]
    : "unknown";

  return { transcriptPath, title, source };
}

async function summarize(transcript: string, title: string, source: string): Promise<string> {
  const apiKey = process.env[PROVIDER.apiKeyEnv];
  if (!apiKey) {
    console.error(`[error] ${PROVIDER.apiKeyEnv} environment variable not set`);
    process.exit(1);
  }

  const prompt = buildPrompt(transcript, title, source);

  const res = await fetch(`${PROVIDER.baseURL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: PROVIDER.model,
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`[error] LLM request failed (${res.status}): ${err}`);
    process.exit(1);
  }

  const data = await res.json() as {
    choices: { message: { content: string } }[];
  };

  return data.choices[0]?.message?.content ?? "";
}

async function main() {
  const { transcriptPath, title, source } = parseArgs();

  const transcript = loadTranscript(transcriptPath);
  const wordCount = transcript.split(/\s+/).length;
  console.log(`[1/3] Loaded transcript: ${wordCount.toLocaleString()} words`);

  console.log(`[2/3] Sending to ${PROVIDER.model}...`);
  const summaryMd = await summarize(transcript, title, source);

  console.log("[3/3] Writing note...");
  const notePath = writeNote(summaryMd, title);

  console.log(`\n✓ Done → ${notePath}`);
}

main();