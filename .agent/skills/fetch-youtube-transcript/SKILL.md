---
name: fetch-youtube-transcript
description: Fetches the transcript of a YouTube video using a browser. Use this when automated scraping-based libraries like youtube-transcript are blocked or return empty results.
allowed-tools: browser_subagent
---
# Fetch YouTube Transcript Skill

This skill provides a robust way to extract transcripts directly from the YouTube user interface using a browser subagent. This bypasses many anti-bot measures that block headless HTTP requests.

## Instructions

1.  **Identify Video URL**: Ensure you have the full YouTube watch URL (e.g., `https://www.youtube.com/watch?v=VIDEO_ID`).
2.  **Open Browser**: Call `browser_subagent` with a task to:
    *   Navigate to the target YouTube URL.
    *   Find and click the "... more" (or "もっと見る") button in the video description to expand it.
    *   Identify and click the "Show transcript" (or "文字起こしを表示") button.
    *   Wait for the transcript sidebar to appear.
    *   Extract all text content from the transcript segments.
    *   Return the full combined text of the transcript.
3.  **Post-Processing**: Once the browser returns the text, clean it up (removing timestamps if not needed) and provide it to the requesting service or user.

## Example Task for Browser Subagent
"Go to https://www.youtube.com/watch?v=M6_V6HqY-OE. Click '...more' in the description, then click 'Show transcript'. Copy all the transcript text and return it."
