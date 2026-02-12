import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
// Use Gemini 2.0 Flash for balanced speed and quality in 2025/2026
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function generateComprehensiveGuide(
    videoTitle: string,
    transcript: string,
    persona: string = "Tech Journalist & Business Analyst"
): Promise<string> {
    let contentParts: any[] = [];

    if (transcript.startsWith('GEMINI_AUDIO_URI:')) {
        const [_, uri, mimeType] = transcript.split(':');
        contentParts.push({
            fileData: { mimeType: mimeType, fileUri: uri }
        });
        contentParts.push({
            text: `You have been provided with the audio of a video. 
            Video title for context: "${videoTitle}".`
        });
    } else {
        contentParts.push({
            text: `RAW TRANSCRIPT of "${videoTitle}":\n${transcript}`
        });
    }

    const basePrompt = `
  You are a sharp, no-nonsense ${persona}. 
  Your goal is to explain the core value of this video so a busy entrepreneur can grasp it in 5 minutes.
  
  CRITICAL INSTRUCTIONS:
  1.  **NO CONVERSATIONAL FILLER**: Start IMMEDIATELY with the Markdown "# [Title]".
  2.  **ALL JAPANESE**: The entire response, including the Title and all headings, must be in engaging, professional Japanese.
  3.  **Direct Title**: Create a direct, honest Japanese title that captures the essence of the video.
  4.  **Source Attribution**: Start with: "${videoTitle} の動画を基に要点を整理しました。"
  5.  **The 3-Line Hook**: Immediately after the header, provide a "Briefing" (Who/What/How/Result) in 3-5 lines.
  6.  **Narrative Style**: Do NOT rely solely on bullet points. Write in vivid, insightful prose that sounds like a feature article in a high-end tech magazine (e.g., Wired, TechCrunch). Use bold text to highlight key phrases within the narrative.
  7.  **Expert Depth**: Naturally weave in the "why" and "how" behind the strategies. 
  8.  **UNIQUE HEADINGS**: Every section heading (## and ###) MUST be unique and specifically tailored to the video's content. NEVER use generic headings like "成功のポイント" or "なぜこれがうまくいったのか". Instead, craft headings that directly reference the specific strategies, people, or concepts discussed in the video.
  
  OUTPUT FORMAT (STRICT MARKDOWN):
  
  # [動画内容を端的に表す日本語タイトル]
  
  [3行フック：誰が何をどうやってどうなったか]
  
  ---
  
  ## [章タイトル：動画の主要トピックに基づく独自の見出し]
  (ストーリー性のあるダイレクトな解説。重要な箇所は太字にする。箇条書きは補助的にのみ使用。)
  
  ## [章タイトル：次の主要トピックに基づく独自の見出し]
  (続きの解説。各セクションの見出しは動画の具体的な内容を反映すること。)
  
  ## [分析・考察：この動画固有のテーマに基づく独自の見出し]
  (戦略の核心を鋭く突く解析セクション。見出しは動画ごとに必ず変えること。)
  `;

    contentParts.push({ text: basePrompt });

    try {
        const result = await model.generateContent(contentParts);
        let text = result.response.text();

        // Post-processing: Strip any conversational filler before the first # 
        const match = text.match(/#[\s\S]*/);
        if (match) {
            text = match[0];
        }

        return text;
    } catch (error: any) {
        const fs = require('fs');
        fs.writeFileSync('gemini_error.txt', JSON.stringify(error, null, 2));
        console.error("Error generating commentary:", error);
        return "Error generating content. Please check logs.";
    }
}
