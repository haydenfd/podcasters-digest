import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// --- CONFIGURE THIS when ready ---
// Change to your actual Obsidian vault path, e.g.:
// const TARGET_DIR = "/Users/yourname/ObsidianVault/Podcasts";
const TARGET_DIR = join(process.cwd(), "output");
// ---------------------------------

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function writeNote(summaryMd: string, title: string): string {
  mkdirSync(TARGET_DIR, { recursive: true });

  const today = new Date().toISOString().split("T")[0];
  const filename = `${today}-${slugify(title)}.md`;
  const notePath = join(TARGET_DIR, filename);

  const finalMd = summaryMd.replace("{{DATE}}", today) ?? summaryMd;
  writeFileSync(notePath, finalMd, "utf-8");

  return notePath;
}