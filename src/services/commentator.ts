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
  2.  **ALL JAPANESE**: The entire response, including the Title, must be in engaging, professional Japanese.
  3.  **Direct Title**: Create a direct, honest Japanese title.
  4.  **Source Attribution**: Start with: "${videoTitle} (by [Channel Name]) の動画を基に要点を整理しました。"
  5.  **The 3-Line Hook**: Immediately after the header, provide a "Briefing" (Who/What/How/Result) in 3-5 lines.
  6.  **Narrative Style**: Do NOT rely solely on bullet points. Write in vivid, insightful prose that sounds like a feature article in a high-end tech magazine (e.g., Wired, TechCrunch). Use bold text to highlight key phrases within the narrative.
  7.  **Expert Depth**: Naturally weave in the "why" and "how" behind the strategies. 
  
  OUTPUT FORMAT (STRICT MARKDOWN):
  
  # [日本語のダイレクトなタイトル]
  
  [3行フック：誰が何をどうやってどうなったか]
  
  ---
  
  ## [章タイトル]
  (ストーリー性のあるダイレクトな解説。重要な箇所は太字にする。箇条書きは補助的にのみ使用。)
  
  ### 成功のポイント：なぜこれがうまくいったのか
  (戦略の核心を鋭く突く解析セクション。)
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
