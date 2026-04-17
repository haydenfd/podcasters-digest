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
  title: string,
  obsidianPort: number = 27123
): Promise<{ success: boolean; path?: string; error?: string }> {
  const today = new Date().toISOString().split("T")[0];
  const filename = `${today}-${slugify(title)}.md`;
  const finalMd = summaryMd.replace("{{DATE}}", today) ?? summaryMd;

  try {
    const response = await fetch(
      `http://localhost:${obsidianPort}/vault/Digest/${filename}`,
      {
        method: "POST",
        headers: {
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
      path: `Digest/${filename}`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to connect to Obsidian: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
