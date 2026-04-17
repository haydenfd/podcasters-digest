import { ENV } from "./config.js";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function writeNote(
  summaryMd: string,
  title: string
): Promise<{ success: boolean; path?: string; error?: string }> {
  const today = new Date().toISOString().split("T")[0];
  const filename = `${today}-${slugify(title)}.md`;
  const finalMd = summaryMd.replace("{{DATE}}", today) ?? summaryMd;

  try {
    const response = await fetch(
      `${ENV.OBSIDIAN_URL}/vault/${ENV.OBSIDIAN_FOLDER}/${filename}`,
      {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${ENV.OBSIDIAN_API_KEY}`,
          "Content-Type": "text/markdown",
        },
        body: finalMd,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Obsidian API error (${response.status}): ${errorText}`,
      };
    }

    return {
      success: true,
      path: `${ENV.OBSIDIAN_FOLDER}/${filename}`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to connect to Obsidian: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
