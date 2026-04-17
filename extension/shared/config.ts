// LLM Provider configuration
// Swap provider by changing these values
export const PROVIDER = {
  baseURL: "https://api.openai.com/v1",
  model: "gpt-5.4",
  apiKeyEnv: "OPENAI_API_KEY",
};

// Injected at build time from .env
declare const INJECTED_OPENAI_API_KEY: string;
declare const INJECTED_OBSIDIAN_API_KEY: string;
declare const INJECTED_OBSIDIAN_URL: string;
declare const INJECTED_OBSIDIAN_FOLDER: string;

export const ENV = {
  OPENAI_API_KEY: INJECTED_OPENAI_API_KEY,
  OBSIDIAN_API_KEY: INJECTED_OBSIDIAN_API_KEY,
  OBSIDIAN_URL: INJECTED_OBSIDIAN_URL,
  OBSIDIAN_FOLDER: INJECTED_OBSIDIAN_FOLDER,
};
