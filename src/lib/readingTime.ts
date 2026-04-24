const WORDS_PER_MINUTE = 225;

const stripMarkdown = (content: string) =>
  content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^>\s?/gm, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~]/g, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const countWords = (content: string) => {
  const plainText = stripMarkdown(content);

  if (!plainText) return 0;

  return plainText.split(/\s+/).filter(Boolean).length;
};

export const estimateReadingTimeMinutes = (content: string) => {
  const wordCount = countWords(content);

  if (wordCount === 0) return 0;

  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
};
