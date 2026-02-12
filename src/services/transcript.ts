
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
        // Method 1: youtube-transcript-api (Most reliable for transcripts in data centers)
        console.log(`[Transcript] Trying youtube-transcript-api (Primary)...`);
        try {
            // Using python3 to call the library directly. Output is JSON, let's just get the text.
            // Wait, youtube-transcript-api command line outputs JSON or formatted text.
            // Simple approach: create a small python script on the fly or just use the CLI.
            // The CLI prints to stdout. Let's try to parse it.
            const transcriptOutput = execSync(`python3 -m youtube_transcript_api ${videoId} --format json`, { stdio: 'pipe' }).toString();
            const segments = JSON.parse(transcriptOutput);
            const fullText = segments.map((s: any) => s.text).join(' ');

            if (fullText && fullText.length > 100) {
                console.log(`  > Success with youtube-transcript-api!`);
                return fullText;
            }
        } catch (e: any) {
            console.warn(`  > Primary method failed. Trying yt-dlp subtitles...`);
        }

        // Method 2: yt-dlp (Subtitles)
        console.log(`[Transcript] Attempting fetch with yt-dlp...`);
        try {
            // Added flags to help bypass blocks in data centers
            const commonFlags = `--no-check-certificates --extractor-args "youtube:player-client=android,web" --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"`;
            execSync(`${ytdlpCmd} ${commonFlags} --write-auto-subs --sub-langs en --skip-download -o "transcript_${videoId}" "https://www.youtube.com/watch?v=${videoId}"`, { stdio: 'pipe' });

            if (fs.existsSync(vttPath)) {
                console.log(`  > Found subtitles!`);
                const content = fs.readFileSync(vttPath, 'utf-8');
                const text = content
                    .replace(/WEBVTT[\s\S]*?\n\n/, '')
                    .replace(/\d{2}:\d{2}:\d{2}.\d{3} --> \d{2}:\d{2}:\d{2}.\d{3}\n/g, '')
                    .replace(/\n+/g, ' ')
                    .trim();

                fs.unlinkSync(vttPath);
                return text;
            }
        } catch (e: any) {
            const stderr = e.stderr?.toString() || e.message;
            console.warn(`  > yt-dlp subtitle fetch failed: ${stderr.substring(0, 100)}...`);
        }

        // Method 3: Audio Fallback (Last resort)
        console.log(`[Transcript] Downloading audio for multimodal transcription...`);
        try {
            const commonFlags = `--no-check-certificates --extractor-args "youtube:player-client=android,web" --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"`;
            execSync(`${ytdlpCmd} ${commonFlags} -f "ba" -o "audio_${videoId}.webm" "https://www.youtube.com/watch?v=${videoId}"`, { stdio: 'pipe' });

            if (fs.existsSync(audioPath)) {
                console.log(`  > Audio downloaded. Uploading to Gemini...`);
                const uploadResponse = await fileManager.uploadFile(audioPath, {
                    mimeType: "audio/webm",
                    displayName: `Audio for ${videoId}`,
                });

                fs.unlinkSync(audioPath);
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
