# ReadTube Implementation Plan: Premium AI Commentary & Translation

## 1. Vision & Strategy Shift
We are pivoting from a simple "Video Summary" tool to a **"Premium Video Translation & Deep Dive Commentary"** platform. 
The goal is to create **highest-quality reading material** that transcends language barriers and adds significant intellectual value.

### User Request Update
> "実装計画のCAUTIONについて、リスクをとって、動画内容の日本語翻訳した内容と専門知識を持ったAIによる深堀り解説によって、読み物として最高品質になるものを目指す方針に転換してください。"

### Core Value Proposition
1.  **High-Fidelity Translation**: Instead of summarizing, we provide a detailed, readable Japanese translation of the video's content, preserving the nuance and flow of the original speaker.
2.  **Expert AI Commentary**: An AI persona (acting as a domain expert) provides deep analysis, historical context, and critical thinking *alongside* the translation, turning a video transcript into a rich article.
3.  **Premium Reading Experience**: The output should feel like a top-tier magazine article or academic paper, not a generated bullet-point list.

## 2. Risk Management (Addressing the CAUTION)
*   **Copyright/Fair Use**: We acknowledge the potential risks regarding copyright when translating content.
*   **Mitigation Strategy**:
    *   We are adding *transformative value* through the "Expert Commentary" and "Deep Dive Analysis".
    *   The translation acts as a basis for the commentary, similar to a review article that extensively quotes the source.
    *   The primary goal is educational and critical analysis.

## 3. Technical Requirements

### A. Transcript Service (`src/services/transcript.ts`)
*   **Current State**: Fetches transcript and joins it into a single string.
*   **Required Change**: 
    *   Need to handle longer contexts (remove arbitrary character limits).
    *   Consider keeping timestamp data if necessary for accurate "quoting" in the commentary, though for a reading article, a continuous flow is better.
    *   **Decision**: Pass the *full* transcript text to Gemini.

### B. AI Commentator Service (`src/services/commentator.ts`)
*   **Model**: Use **Gemini 1.5 Pro** (or Flash if sufficient) to handle large context windows (video transcripts can be long).
*   **Prompt Engineering**:
    *   **Role**: Expert Editor / Subject Matter Expert.
    *   **Task**: 
        1.  **Translate** the core content into natural, high-level Japanese (fluent, not robotic).
        2.  **Annotate** specific sections with "Editor's Notes" or "Deep Dive" boxes.
        3.  **Synthesize** a "Key Insights" section that goes beyond the video's surface level.
    *   **Output Format**: Markdown structured as a featured article.

### C. Output Structure (Target Markdown)
```markdown
# [Title] Detailed Translation & Expert Analysis

## Introduction
(Brief context setting by the Editor)

## Chapter 1: [Segment Title]
([Translated Content in rich prose...])

> **💡 Expert Insight**: 
> [Deep dive analysis of the above point, connecting it to broader trends or history.]

## Chapter 2: [Segment Title]
([Translated Content...])

...

## Ciritical Review & Conclusion
(The AI Expert's final verdict on the video's argument)
```

## 4. Immediate Action Plan
1.  Modify `src/services/transcript.ts` to ensure it captures the full text (remove any manual truncation if present in caller).
2.  Rewrite `src/services/commentator.ts`:
    *   Switch prompt to focus on "Translation + Commentary".
    *   Remove `text.substring` limits.
    *   Refine the prompt variables to accept a `persona` that fits the specific video topic (e.g., "Tech Analyst", "Political Historian").

