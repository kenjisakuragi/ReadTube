
import { YoutubeTranscript } from 'youtube-transcript';

async function test() {
    try {
        const videoId = process.argv[2] || 'M6_V6HqY-OE';
        console.log(`Fetching transcript for ${videoId}...`);
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        console.log("SUCCESS! Got", transcript.length, "lines.");
        if (transcript.length > 0) {
            console.log("First 100 chars:", transcript.map(i => i.text).join(' ').substring(0, 100));
        }
    } catch (e: any) {
        console.error("FAILED:", e.message);
    }
}

test();
