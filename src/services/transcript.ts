
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
    const ytdlpPath = path.resolve(process.cwd(), 'bin', 'yt-dlp.exe');
    const ytdlpCmd = isWindows && fs.existsSync(ytdlpPath)
        ? ytdlpPath
        : 'yt-dlp';

    try {
        console.log(`[Transcript] Attempting robust fetch with yt-dlp...`);
        // Try to get subtitles first (fastest)
        try {
            // Added flags to help bypass blocks in data centers
            const commonFlags = `--no-check-certificates --extractor-args "youtube:player-client=web,mweb"`;
            execSync(`${ytdlpCmd} ${commonFlags} --write-auto-subs --sub-langs en --skip-download -o "transcript_${videoId}" "https://www.youtube.com/watch?v=${videoId}"`, { stdio: 'pipe' });

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
        } catch (e: any) {
            const stderr = e.stderr?.toString() || e.message;
            console.warn(`  > yt-dlp subtitle fetch failed: ${stderr.substring(0, 100)}...`);
        }

        // Audio Fallback
        console.log(`[Transcript] Downloading audio for multimodal transcription...`);
        try {
            const commonFlags = `--no-check-certificates --extractor-args "youtube:player-client=web,mweb"`;
            execSync(`${ytdlpCmd} ${commonFlags} -f "ba" -o "audio_${videoId}.webm" "https://www.youtube.com/watch?v=${videoId}"`, { stdio: 'pipe' });

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
        } catch (e: any) {
            const stderr = e.stderr?.toString() || e.message;
            console.error(`  > Audio fallback failed: ${stderr.substring(0, 100)}...`);
        }

        return null;
    } catch (error: any) {
        console.error(`[Transcript] All methods failed for ${videoId}:`, error.message);
        return null;
    }
}
