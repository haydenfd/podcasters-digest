export function buildPrompt(transcript: string, title: string, source: string): string {
  return `You are processing a podcast or article transcript into a structured reference note.

Your job is to extract signal and discard noise. Be ruthless about this.

DISCARD completely:
- Intro/outro filler ("welcome to the show", "thanks for listening", "subscribe", sponsor reads)
- Small talk, greetings, sign-offs
- Filler words and verbal tics that add no meaning
- Repetitive restatements of the same point
- Pleasantries between host and guest

EXTRACT and STRUCTURE:
- The actual ideas, arguments, claims, and insights discussed
- Group content into broad thematic sections — use the transcript's natural topic shifts as section breaks
- If the transcript has an existing table of contents or chapter markers, use those as your section headers
- Within each section, capture key points as tight, clear bullets — actual content, not meta-summaries
- Notable quotes or specific claims that are unusually concrete or interesting (rare — only if genuinely striking)

OUTPUT FORMAT — strict markdown, no deviations:

---
title: ${title}
source: ${source}
date: {{DATE}}
tags: [footnotes, podcast]
---

## Overview
2-3 sentences max. What is this actually about, who is the guest/author if relevant.

## Sections

### [Section Title]
- bullet
- bullet

### [Section Title]
- bullet
- bullet

(as many sections as the content warrants — don't compress or pad)

## Standout Ideas
Only include if there are genuinely interesting specific claims or frameworks worth flagging. If nothing stands out, omit this section entirely.

---

Transcript:

${transcript}`;
}