
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { config } from '../config';

const fileManager = new GoogleAIFileManager(config.GEMINI_API_KEY);

export async function getTranscript(videoId: string): Promise<string | null> {
    const vttPath = path.resolve(process.cwd(), `transcript_${videoId}.en.vtt`);
    const audioPath = path.resolve(process.cwd(), `audio_${videoId}.webm`);

    const isWindows = process.platform === 'win32';
    const ytdlpCmd = isWindows && fs.existsSync(path.resolve(process.cwd(), 'yt-dlp.exe'))
        ? path.resolve(process.cwd(), 'yt-dlp.exe')
        : 'yt-dlp';

    try {
        console.log(`[Transcript] Attempting robust fetch with yt-dlp...`);
        // Try to get subtitles first (fastest)
        try {
            // Using quotes for ID to avoid issues with special characters
            execSync(`${ytdlpCmd} --write-auto-subs --sub-langs en --skip-download -o "transcript_${videoId}" "https://www.youtube.com/watch?v=${videoId}"`, { stdio: 'ignore' });

            if (fs.existsSync(vttPath)) {
                console.log(`  > Found subtitles!`);
                const content = fs.readFileSync(vttPath, 'utf-8');
                // Simple VTT to text
                const text = content
                    .replace(/WEBVTT[\s\S]*?\n\n/, '')
                    .replace(/\d{2}:\d{2}:\d{2}.\d{3} --> \d{2}:\d{2}:\d{2}.\d{3}\n/g, '')
                    .replace(/\n+/g, ' ')
                    .trim();

                // Cleanup
                fs.unlinkSync(vttPath);
                return text;
            }
        } catch (e) {
            console.warn(`  > yt-dlp subtitle fetch failed. Trying audio fallback...`);
        }

        // Audio Fallback
        console.log(`[Transcript] Downloading audio for multimodal transcription...`);
        try {
            execSync(`${ytdlpCmd} -f "ba" -o "audio_${videoId}.webm" "https://www.youtube.com/watch?v=${videoId}"`, { stdio: 'ignore' });

            if (fs.existsSync(audioPath)) {
                console.log(`  > Audio downloaded. Uploading to Gemini...`);
                const uploadResponse = await fileManager.uploadFile(audioPath, {
                    mimeType: "audio/webm",
                    displayName: `Audio for ${videoId}`,
                });

                // Clean up local file
                fs.unlinkSync(audioPath);

                // Return a special token that commentator.ts will handle
                return `GEMINI_AUDIO_URI:${uploadResponse.file.uri}:${uploadResponse.file.mimeType}`;
            }
        } catch (e) {
            console.error(`  > Audio fallback failed.`);
        }

        return null;
    } catch (error: any) {
        console.error(`[Transcript] All methods failed for ${videoId}:`, error.message);
        return null;
    }
}
