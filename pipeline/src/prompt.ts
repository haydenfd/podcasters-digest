export function buildPrompt(transcript: string, title: string, source: string): string {
  return `You are converting a podcast transcript into a structured long-form reference document.

The goal: someone should be able to read your output instead of watching the episode and get everything of value. This is NOT a summarization task. This is a reconstruction task: you are reorganizing and rewriting the conversation while preserving its full informational content.

---

CRITICAL REQUIREMENTS (read carefully):

- You must preserve ALL substantive information from the transcript.
- If a concrete detail appears, it must appear in the output unless it is clearly filler.

This includes:
- specific numbers (e.g. revenue figures, percentages, timelines)
- company names, technologies, and systems
- concrete examples and analogies
- mechanisms and processes described
- disagreements, pushback, and back-and-forth reasoning between speakers

Do NOT:
- compress multiple ideas into vague generalizations
- replace specific claims with abstract summaries
- skip details because they seem minor
- collapse sections into short summaries

If the output is significantly shorter than the input (after removing filler), it is incorrect.

You are allowed to remove ONLY:
- intro/outro filler, sponsor reads
- small talk and pleasantries
- filler words and verbal tics
- exact repetition of the same point

Everything else must be retained and reorganized.

---

STRUCTURE:

Break the document into topics — each one covering a distinct thread of the conversation. Topics should emerge from the actual flow of discussion, not arbitrary labels.

For each topic:

1. A clear heading that names the topic
2. A brief 1–2 sentence framing of the question or tension being explored
3. A detailed, thorough writeup that includes EVERYTHING of substance said on that topic

The writeup must:
- follow the actual flow of reasoning in the conversation
- include both sides of the discussion where applicable
- preserve all important details, examples, and claims
- expand proportionally to how much time the speakers spent on it

If a section of the conversation is long and detailed, your output for that section must also be long and detailed.

IMPORTANT:
- Each section should feel self-contained but logically connected to adjacent sections
- Do not artificially merge distinct topics
- Preserve transitions when the conversation shifts

---

WRITING STYLE:

- Write in clean, continuous prose (no bullet points)
- This should read like a high-quality technical or magazine interview writeup
- Preserve specificity and precision at all times
- Keep the tone neutral and informational
- Do not inject opinions or commentary

---

OUTPUT FORMAT — strict markdown:

---
title: ${title}
source: ${source}
date: {{DATE}}
tags: [footnotes, podcast]
---

## Overview
3–5 sentences. Who is the guest, what is the episode about, and why it matters.

## Table of Contents
- [Overview](#overview)
- [Topic Title 1](#topic-title-1)
- [Topic Title 2](#topic-title-2)
(replace with actual topic titles; include all sections below)

## Topic Title 1
<a id="topic-title-1"></a>
**What's being explored:** 1–2 sentences framing the question or angle.

[Full, detailed prose reconstruction of everything discussed on this topic.]

## Topic Title 2
<a id="topic-title-2"></a>
**What's being explored:** 1–2 sentences framing the question or angle.

[Full, detailed prose reconstruction.]

(as many topics as needed — do not merge unrelated ideas)

## Standout Ideas
Only include genuinely surprising, counterintuitive, or especially concrete claims. Skip if nothing qualifies.

---

Transcript:

${transcript}`;
}